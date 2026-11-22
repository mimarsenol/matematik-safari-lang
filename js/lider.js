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
      <div id="lbMe"></div><div class="list" id="lbList"><div class="it muted">Yükleniyor…</div></div>
      <button class="btn ghost" id="lbH">🗺️ Haritaya dön</button>`;
    $('lbW').onclick = () => board('week'); $('lbA').onclick = () => board('all'); $('lbH').onclick = home;
    window.scrollTo(0, 0);
    let j;
    try {
      const r = await fetch('/api/leaderboard?scope=' + scope, { headers: A ? { authorization: 'Bearer ' + A.token } : {} });
      j = await r.json(); if (!r.ok) throw new Error(j.error);
    } catch (e) { const l = $('lbList'); if (l) l.innerHTML = T('<div class="it">Liste şu an yüklenemedi. İnternetini kontrol edip tekrar dene.</div>'); return; }
    const list = $('lbList'), meBox = $('lbMe'); if (!list) return;
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
