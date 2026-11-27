'use strict';
/* =========================================================
   Liderlik tablosu
   - "Bu hafta" (Pazartesi sıfırlanır) ve "Tüm zamanlar" listeleri, puana (⭐) göre.
   - Sadece hesabı olanlar listede görünür; Ayarlar'dan adını gizleyebilir.
   - Haftalık puan S.wk = { id: hafta no, xp } içinde tutulur ve bulutla senkronlanır.
   (hesap.js ve online.js'ten sonra yüklenir)
   ========================================================= */
(function () {
  const weekId = (t = Date.now()) => Math.floor((t / 864e5 + 3) / 7); // api/leaderboard.js ile aynı
  const auth = () => { try { return JSON.parse(localStorage.getItem('matSafari_auth') || 'null'); } catch (e) { return null; } };
  const medal = i => ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;

  // ---------- haftalık puanı say ----------
  const _finish = finish;
  finish = function () {
    const before = S.xp || 0;
    _finish();
    const gained = (S.xp || 0) - before;
    if (gained > 0) {
      const w = weekId();
      if (!S.wk || S.wk.id !== w) S.wk = { id: w, xp: 0 };
      S.wk.xp += gained; save();
    }
  };

  // ---------- liste ekranı ----------
  async function board(scope) {
    stopTimer(); Q = null; closeModal();
    const A = auth();
    view.innerHTML = T`<div class="card" style="text-align:center"><h2 style="margin:0">🏆 Liderlik Tablosu</h2>
      <p class="muted" style="margin:4px 0">${scope === 'week' ? T('Bu haftanın en çok puan toplayanları · her Pazartesi sıfırlanır') : T('Bugüne kadar en çok puan toplayanlar')}</p>
      <div class="row"><button class="btn ${scope === 'week' ? '' : 'ghost'}" id="lbW">📅 Bu hafta</button><button class="btn ${scope === 'all' ? '' : 'ghost'}" id="lbA">🌍 Tüm zamanlar</button></div></div>
      <div id="lbPrize"></div><div id="lbMe"></div><div class="list" id="lbList"><div class="it muted">Yükleniyor…</div></div>
      <button class="btn ghost" id="lbH">🗺️ Haritaya dön</button>`;
    $('lbW').onclick = () => board('week'); $('lbA').onclick = () => board('all'); $('lbH').onclick = home;
    window.scrollTo(0, 0);
    let j;
    try {
      const r = await fetch('/api/leaderboard?scope=' + scope, { headers: A ? { authorization: 'Bearer ' + A.token } : {} });
      j = await r.json(); if (!r.ok) throw new Error(j.error);
    } catch (e) { const l = $('lbList'); if (l) l.innerHTML = T('<div class="it">Liste şu an yüklenemedi. İnternetini kontrol edip tekrar dene.</div>'); return; }
    const list = $('lbList'), meBox = $('lbMe'); if (!list) return;
    if (scope === 'week') prizeCard(j, A);
    list.innerHTML = j.top.length ? j.top.map((t, i) => {
      const me = A && t.u === A.user;
      return `<div class="it" style="display:flex;align-items:center;gap:10px;${me ? 'border:3px solid var(--pri);background:#fff4e8' : ''}">
        <b style="font-size:${i < 3 ? 28 : 18}px;width:42px;text-align:center">${medal(i)}</b>
        <div style="flex:1;font-weight:800;font-size:18px;overflow:hidden;text-overflow:ellipsis">${esc(t.u)}${me ? ' <span class="muted">(sen)</span>' : ''}</div>
        <span class="chip">⭐ ${t.xp}</span></div>`;
    }).join('') : `<div class="it" style="text-align:center">${scope === 'week' ? T('Bu hafta henüz kimse puan toplamadı. İlk sen ol! 🚀') : T('Henüz kimse yok. İlk sen ol! 🚀')}</div>`;
    if (!A) {
      meBox.innerHTML = T`<div class="card" style="display:flex;gap:10px;align-items:center"><div style="font-size:34px">👤</div>
        <div style="flex:1;font-size:15px"><b>Listede yer almak ister misin?</b><br><span class="muted">Ücretsiz hesap aç, puanların listeye girsin.</span></div>
        <button class="btn" id="lbAcc" style="width:auto;margin:0;font-size:16px;padding:10px 14px">Hesap aç</button></div>`;
      $('lbAcc').onclick = () => $('btnAcc') && $('btnAcc').click();
    } else if (j.me) {
      const m = j.me, inTop = j.top.some(t => t.u === A.user);
      meBox.innerHTML = m.hidden ? T`<div class="card muted" style="font-size:15px">🙈 Adın listede gizli. Ayarlar'dan "Liderlik tablosunda adımı göster" seçeneğini açabilirsin.</div>`
        : !m.xp ? `<div class="card" style="font-size:15px">${scope === 'week' ? T('Bu hafta henüz puanın yok. Bir alıştırma çöz, listeye gir! ✏️') : T('Henüz puanın yok. Bir alıştırma çöz, listeye gir! ✏️')}</div>`
        : !inTop ? T`<div class="card" style="font-size:16px;border:3px solid var(--pri)">Senin sıran: <b>#${m.rank}</b> · ⭐ ${m.xp}. ${m.rank <= 50 ? T('İlk 20\'ye çok az kaldı! 💪') : T('Her gün biraz çalış, yükselirsin! 💪')}</div>` : '';
    }
  }

  // ---------- haftalık ödüllü yarışma ----------
  // Beceriye dayalı sıralama: haftanın 1.'si (yönetici onayından sonra) 3dfabrikam'dan ödül alır. Şans/çekiliş yok.
  // Mağaza bağlantısı, şartlar ve ödül kodu yalnızca ebeveyn kapısından sonra görünür (çocuktan bilgi alınmaz).
  // Yalnızca Türkçe sürümde; odul.json'daki play/ios bayraklarıyla Play (TWA) ve iPhone uygulamasında gizlenebilir.
  try { if (document.referrer.startsWith('android-app://')) localStorage.setItem('matSafari_twa', '1'); } catch (e) {}
  const inTwa = () => { try { return localStorage.getItem('matSafari_twa') === '1'; } catch (e) { return false; } };
  const inIos = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const prizeOn = y => !!y && (document.documentElement.lang || 'tr').startsWith('tr') && !(inTwa() && !y.play) && !(inIos() && !y.ios);
  const timeLeft = t => { const m = Math.max(0, Math.floor((t - Date.now()) / 6e4)), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60); return d ? `${d} gün ${h} saat` : h ? `${h} saat ${m % 60} dk` : `${m % 60} dk`; };

  function prizeCard(j, A) {
    const box = $('lbPrize'), y = j.yarisma; if (!box || !prizeOn(y)) return;
    const o = y.odul, p = y.prev, me = j.me || {};
    let h = '';
    if (me.odul) h += `<div class="card" style="text-align:center;border:3px solid var(--yellow);background:#fff8ea">
      <div style="font-size:54px">🏆🎉</div><h2 style="margin:4px 0">Tebrikler, şampiyon!</h2>
      <p style="margin:4px 0">Geçen haftanın 1.'si sensin. Ödülünü almak için bu ekranı annene ya da babana göster.</p>
      <button class="btn" id="pzWin">👨‍👩‍👦 Veli: ödülü al</button></div>`;
    h += `<div class="card" style="border:3px solid var(--pri)"><div style="display:flex;gap:12px;align-items:center">
      <div style="font-size:46px;line-height:1">${o.resim ? `<img src="${esc(o.resim)}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:14px">` : '🎁'}</div>
      <div style="flex:1;font-size:15px"><b style="font-size:17px">Haftanın ödülü: ${esc(o.urun)}</b><br>
      Bu hafta en çok puanı toplayan kazanır. Şans yok: puanı, çözdüğün sorular getirir! <span class="muted">· Bitmesine ${timeLeft(y.bitis)}</span></div></div>
      <button id="pzLogo" aria-label="Ödül sponsoru 3D Fabrikam" style="display:flex;align-items:center;gap:10px;width:100%;margin-top:10px;padding:8px 10px;border:2px solid var(--line);border-radius:14px;background:#fff;font:inherit;text-align:left;cursor:pointer">
        ${SPONSOR_LOGO}<span style="flex:1;line-height:1.2"><span class="muted" style="font-size:12px">Ödül sponsoru</span><br><b>3D Fabrikam</b> <span class="muted" style="font-size:13px">3dfabrikam.com.tr</span></span><span aria-hidden="true">↗</span></button></div>`;
    h += `
      <button class="btn ghost" id="pzPar" style="font-size:16px">👨‍👩‍👦 Veliler için: ödül ve katılım şartları</button>`;
    if (p && p.top && p.top.length) h += `<div class="card" style="font-size:15px"><b>Geçen hafta</b> <span class="muted">(#${p.week})</span><br>
      ${p.kazanan ? `🏆 Şampiyon: <b>${esc(p.kazanan)}</b> — tebrikler! 🎉` : `${p.top.map((t, i) => `${medal(i)} ${esc(t.u)} ⭐ ${t.xp}`).join(' · ')}<br><span class="muted">Şampiyon, puanlar kontrol edildikten sonra burada duyurulur.</span>`}</div>`;
    box.innerHTML = h;
    $('pzPar').onclick = () => parentGate(() => rulesModal(o));
    $('pzLogo').onclick = () => parentGate(() => siteModal(o));
    if ($('pzWin')) $('pzWin').onclick = () => parentGate(() => claimModal(o, me.odul, A));
  }

  // Sponsor: 3D Fabrikam (logo sitede /odul/3dfabrikam.svg; bağlantılar yalnızca ebeveyn kapısından sonra)
  const SPONSOR_URL = 'https://www.3dfabrikam.com.tr/';
  const SPONSOR_LOGO = '<img src="/odul/3dfabrikam.svg" alt="3D Fabrikam" width="40" height="40" style="width:40px;height:40px;border-radius:10px;flex:none">';
  const linkBtn = (href, text, ghost) => `<a class="btn${ghost ? ' ghost' : ''}" href="${esc(href)}" target="_blank" rel="noopener" style="display:block;text-align:center;text-decoration:none">${text}</a>`;
  function siteModal(o) {
    openModal(`<div class="head">${SPONSOR_LOGO.replace(/40/g, '72')}<h2>3D Fabrikam</h2>
      <p class="muted">Haftalık yarışmanın ödül sponsoru. Ödüller 3D yazıcıyla üretilip gönderilir.</p></div>
      ${linkBtn(SPONSOR_URL, '🌐 3dfabrikam.com.tr sitesini aç')}
      ${o.link && o.link !== SPONSOR_URL ? linkBtn(o.link, '🛒 Bu haftanın ödülünü gör', true) : ''}
      <button class="btn ghost" onclick="closeModal()">Kapat</button>`);
  }

  function rulesModal(o) {
    openModal(`<div class="head">${SPONSOR_LOGO.replace(/40/g, '64')}<h2>Haftalık ödüllü yarışma</h2><p class="muted" style="margin:2px 0">Ödül sponsoru: <b>3D Fabrikam</b></p></div>
      <div style="font-size:15px;text-align:left">
      <p><b>Ödül:</b> ${esc(o.urun)}. 3dfabrikam tarafından ücretsiz gönderilir.</p>
      <ul style="padding-left:20px;margin:6px 0">
        <li>Sıralama yalnızca çözülen sorulardan kazanılan puana göredir; kura veya çekiliş yoktur.</li>
        <li>Hafta Pazartesi 03:00'te (Türkiye saati) başlar, sonraki Pazartesi 03:00'te biter.</li>
        <li>Katılmak için hesap gerekir ve adın listede görünür olmalıdır. Satın alma gerekmez.</li>
        <li>Puanlar sunucuda kontrol edilir; olağan dışı puanlar elenir. Şampiyon, kontrolden sonra uygulamada kullanıcı adıyla duyurulur.</li>
        <li>Ödül için çocuktan bilgi istenmez: kazananın velisi, uygulamada çıkan kodu e-postayla gönderir.</li>
      </ul>
      <p><a href="/yarisma.html" target="_blank" rel="noopener">Katılım şartlarının tamamı</a> · <a href="/gizlilik.html" target="_blank" rel="noopener">Gizlilik</a></p></div>
      ${o.link ? linkBtn(o.link, "🛒 Ödülü 3dfabrikam'da gör") : ''}
      ${linkBtn(SPONSOR_URL, '🌐 3dfabrikam.com.tr', true)}
      <button class="btn ghost" onclick="closeModal()">Kapat</button>`);
  }

  function claimModal(o, w, A) {
    const u = A ? A.user : '';
    const subj = `Math Safarix ödül - ${u} - hafta ${w.week}`;
    const body = `Merhaba,\n\nÇocuğum Math Safarix haftalık yarışmasını kazandı.\nKullanıcı adı: ${u}\nHafta: ${w.week}\nÖdül kodu: ${w.kod}\n\nTeslimat bilgilerini yanıtınız üzerine paylaşacağım.\n`;
    openModal(`<div class="head"><div class="big">🏆</div><h2>Ödül kodu</h2></div>
      <div style="font-size:15px;text-align:left">
      <p style="text-align:center;font-size:30px;font-weight:800;letter-spacing:3px;margin:8px 0">${esc(w.kod)}</p>
      <p>Ödülü almak için bu kodu, kullanıcı adını (<b>${esc(u)}</b>) ve hafta numarasını (<b>${w.week}</b>) <b>${esc(o.eposta)}</b> adresine e-postayla gönderin. Teslimat bilgileri yalnızca bu e-posta yazışmasında sizden istenir; uygulama bu bilgileri toplamaz.</p>
      <p class="muted">Kod, kazanılan haftadan sonra 30 gün geçerlidir ve bir kez kullanılır.</p></div>
      ${o.eposta ? `<a class="btn" href="mailto:${esc(o.eposta)}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}" style="display:block;text-align:center;text-decoration:none">✉️ E-postayı hazırla</a>` : ''}
      <button class="btn ghost" onclick="closeModal()">Kapat</button>`);
  }

  // Ebeveyn kapısı: Çalışma kilidi şifresi varsa onu sorar; yoksa yazıyla verilmiş
  // iki basamaklı çarpma sorusu sorar (küçük çocuğun kolayca geçemeyeceği türden).
  const ONES = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'], TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
  const say = n => (TENS[Math.floor(n / 10)] + ' ' + ONES[n % 10]).trim();
  async function pinHash(salt, pin) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pin));
    return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('');
  }
  let gateFails = 0, gateWait = 0;
  function parentGate(onOk, msg) {
    let K = {}; try { K = JSON.parse(localStorage.getItem('matSafari_kilit') || 'null') || {}; } catch (e) {}
    const usePin = !!(K.pin && K.salt);
    const a = 12 + Math.floor(Math.random() * 27), b = 13 + Math.floor(Math.random() * 26);
    openModal(`<div class="head"><div class="big">👨‍👩‍👦</div><h2>Bu bölüm veliler içindir</h2>
      <p class="muted">${usePin ? 'Devam etmek için ebeveyn şifresini girin.' : `Devam etmek için yazın: <b>${say(a)} çarpı ${say(b)}</b> kaç eder?`}</p></div>
      <input id="pgIn" inputmode="numeric" autocomplete="off" maxlength="${usePin ? 4 : 5}" ${usePin ? 'type="password"' : ''} style="font:inherit;font-size:26px;text-align:center;width:100%;box-sizing:border-box;padding:10px;border-radius:14px;border:2px solid var(--line)">
      <div id="pgErr" style="color:var(--bad);font-weight:700;text-align:center;min-height:1.4em;margin:4px 0">${msg || ''}</div>
      <button class="btn" id="pgOk">Devam</button><button class="btn ghost" onclick="closeModal()">Vazgeç</button>
      ${usePin ? '' : '<p class="muted" style="font-size:13px;text-align:center">Ayarlar → Çalışma kilidi ile ebeveyn şifresi belirlerseniz burada o sorulur.</p>'}`);
    const inp = $('pgIn'); inp.focus();
    const go = async () => {
      const err = $('pgErr');
      if (Date.now() < gateWait) { err.textContent = `Çok fazla deneme. ${Math.ceil((gateWait - Date.now()) / 1000)} sn bekleyin.`; return; }
      const v = inp.value.trim();
      const ok = v !== '' && (usePin ? (await pinHash(K.salt, v)) === K.pin : +v === a * b);
      if (ok) { gateFails = 0; closeModal(); onOk(); return; }
      gateFails++; if (gateFails >= 3) gateWait = Date.now() + Math.min(300, 30 * 2 ** (gateFails - 3)) * 1000;
      if (usePin) { inp.value = ''; err.textContent = 'Şifre yanlış.'; } else parentGate(onOk, 'Yanlış. Yeni soru:');
    };
    $('pgOk').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
  }

  // ---------- üst çubukta küçük 🏆 düğmesi (harita düğmesinin yanında) ----------
  // Dar telefonlarda üst çubuk taşmasın diye düğmeleri sıkılaştır
  const css = document.createElement('style');
  css.textContent = `@media (max-width:440px){#top{gap:4px}#top .chips{gap:4px}#top .chip{padding:3px 6px;font-size:14px}#top button.chip{font-size:17px;padding:2px 6px}}@media (max-width:400px){#lvl{display:none}}`;
  document.head.appendChild(css);
  const lb = document.createElement('button');
  lb.className = 'chip'; lb.id = 'btnLb'; lb.textContent = '🏆'; lb.title = T('Liderlik Tablosu');
  lb.setAttribute('aria-label', 'Liderlik Tablosu');
  lb.onclick = () => { sndTap(); board('week'); };
  const homeBtn = $('btnHome'), left = document.createElement('div');
  left.className = 'chips';
  homeBtn.replaceWith(left); left.append(homeBtn, lb);
  homeBtn.onclick = () => home();

  // ---------- Ayarlar: listede görünme seçeneği ----------
  const _settings = settings;
  settings = function () {
    _settings();
    const anchor = $('sv'); if (!anchor) return;
    anchor.insertAdjacentHTML('beforebegin', T`<div class="sw"><span>🏆 Liderlik tablosunda adımı göster</span><button id="sLb" class="${S.hideLb ? '' : 'on'}"></button></div>`);
    $('sLb').onclick = e => { e.target.classList.toggle('on'); S.hideLb = !e.target.classList.contains('on'); save(); };
  };
  $('btnSet').onclick = settings;

  home();
})();
