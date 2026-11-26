'use strict';
/* Çalışma kilidi (ebeveyn onayı) — ekran.js'ten sonra yüklenir.
   - Ebeveyn Ayarlar'dan 4 haneli PIN ve günlük hedef koyar: N tur ya da N dakika çalışma.
   - Hedef tamamlanana kadar uygulamadan çıkmak (telefonun geri tuşu, tarayıcı sekmesini kapatma) PIN ister.
   - Hedef bitince o gün için kilit kendiliğinden açılır; ertesi gün yeniden başlar.
   - Ayarlar bu cihazda tutulur (bulut hesabıyla taşınmaz); PIN düz değil, özet olarak saklanır.
   - Telefonun Ana ekran / son uygulamalar düğmeleri için Ayarlar'da "Uygulama sabitleme" (Android) ve
     "Rehberli Erişim" (iPhone) rehberi gösterilir: bu ikisi uygulamanın değil, telefonun kilitleridir. */
(function () {
  const KEY = 'matSafari_kilit';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null') || {}; } catch (e) { return {}; } };
  let L = load();
  const store = () => { try { localStorage.setItem(KEY, JSON.stringify(L)); } catch (e) {} };

  async function hashPin(pin) {
    const salt = L.salt || (L.salt = Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2, '0')).join(''));
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pin));
    return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
  }
  // Günlük oturum
  function sess() {
    const d = today();
    if (!L.s || L.s.day !== d) { L.s = { day: d, rounds: 0, sec: 0, open: false, cheered: false }; store(); }
    return L.s;
  }
  const progress = () => { const s = sess(); return L.type === 'dk' ? Math.floor(s.sec / 60) : s.rounds; };
  const reached = () => progress() >= (L.goal || 0);
  const locked = () => !!(L.on && L.pin && !sess().open && !reached());

  // ---------------------------------------------------------------- stiller
  const css = document.createElement('style');
  css.textContent = `
  #lockChip{font-size:15px;padding:4px 10px;background:#fff4d6}
  #lockChip.ok{background:#e3f8ec}
  .pinrow{display:flex;justify-content:center;gap:10px;margin:12px 0}
  .pinrow i{width:18px;height:18px;border-radius:50%;border:3px solid var(--pri);display:block}
  .pinrow i.f{background:var(--pri)}
  .pinpad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:300px;margin:0 auto}
  .pinpad button{height:56px;border-radius:16px;font-size:26px;font-weight:800;background:#fff;border:2px solid var(--line);box-shadow:0 4px 0 var(--line)}
  .pinpad button:active{transform:translateY(3px);box-shadow:0 1px 0 var(--line)}
  .pinerr{color:var(--bad);font-weight:700;text-align:center;min-height:1.4em;margin:4px 0}
  .lockcard{background:#fff8ea;border:3px solid var(--yellow);border-radius:18px;padding:12px 14px;margin:10px 0}
  .lockcard .seg{display:flex;gap:8px;margin:8px 0}.lockcard .seg button{flex:1;padding:10px;border-radius:14px;background:#fff;border:2px solid var(--line);font-weight:800}
  .lockcard .seg button.on{background:var(--pri);color:#fff;border-color:var(--pri)}
  .lockcard select{font:inherit;padding:8px 10px;border-radius:12px;border:2px solid var(--line)}
  .guide-steps{font-size:15px;margin:6px 0 0;padding-left:20px}.guide-steps li{margin:3px 0}
  `;
  document.head.appendChild(css);

  // ---------------------------------------------------------------- PIN penceresi
  let fails = 0, waitUntil = 0;
  function askPin(title, sub, onOk, opts = {}) {
    let v = '';
    openModal(`<div class="head"><div class="big">🔒</div><h2>${title}</h2>${sub ? `<p class="muted">${sub}</p>` : ''}</div>
      <div class="pinrow">${'<i></i>'.repeat(4)}</div><div class="pinerr" id="pinErr"></div>
      <div class="pinpad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(k => k ? `<button data-k="${k}">${k}</button>` : '<span></span>').join('')}</div>
      <button class="btn ghost" id="pinNo" style="margin-top:12px">${opts.cancel || T('Vazgeç')}</button>`);
    const dots = () => document.querySelectorAll('.pinrow i').forEach((d, i) => d.classList.toggle('f', i < v.length));
    const err = t => { const e = $('pinErr'); if (e) e.textContent = t; };
    $('pinNo').onclick = () => { closeModal(); opts.onCancel && opts.onCancel(); };
    document.querySelectorAll('.pinpad button').forEach(b => b.onclick = async () => {
      if (Date.now() < waitUntil) { err(T`Çok fazla deneme. ${Math.ceil((waitUntil - Date.now()) / 1000)} sn bekle.`); return; }
      const k = b.dataset.k;
      if (k === '⌫') v = v.slice(0, -1); else if (v.length < 4) v += k;
      dots(); err('');
      if (v.length < 4) return;
      if (opts.setNew) { const p = v; v = ''; dots(); opts.setNew(p); return; }
      if (await hashPin(v) === L.pin) { fails = 0; closeModal(); onOk(); }
      else { fails++; v = ''; dots(); if (fails >= 3) { waitUntil = Date.now() + Math.min(300, 30 * 2 ** (fails - 3)) * 1000; } err(T('Şifre yanlış.')); }
    });
  }

  // ---------------------------------------------------------------- üst çubukta durum çipi
  const chip = document.createElement('button');
  chip.className = 'chip'; chip.id = 'lockChip';
  const chips = document.querySelector('#top .chips'); if (chips) chips.prepend(chip);
  function paint() {
    if (!L.on || !L.pin) { chip.style.display = 'none'; if (!quiet && history.state && history.state.kilit) { quiet = true; try { history.back(); } catch (e) { quiet = false; } } return; }
    chip.style.display = '';
    const s = sess(), done = reached() || s.open;
    chip.classList.toggle('ok', done);
    // Kilit açıldıysa geri tuşu tuzağını kaldır: bir sonraki geri tuşu uygulamadan normal çıksın
    if (done && !quiet && history.state && history.state.kilit) { quiet = true; try { history.back(); } catch (e) { quiet = false; } }
    chip.textContent = done ? '🔓' : `🔒 ${progress()}/${L.goal}${L.type === 'dk' ? ' dk' : ''}`;
    chip.title = done ? T('Bugünkü hedef tamam') : T('Çalışma kilidi açık');
  }
  chip.onclick = () => {
    const s = sess(), left = Math.max(0, L.goal - progress());
    if (reached() || s.open) { openModal(T`<div class="head"><div class="big">🔓</div><h2>Bugün serbestsin!</h2><p>Bugünkü çalışma hedefi tamam. Yarın kilit yeniden başlar.</p></div><button class="btn" onclick="closeModal()">Tamam</button>`); return; }
    openModal(T`<div class="head"><div class="big">🔒</div><h2>Çalışma kilidi</h2>
      <p>Bugünkü hedef: <b>${L.goal} ${L.type === 'dk' ? T('dakika') : T('tur')}</b> · Kalan: <b>${left} ${L.type === 'dk' ? T('dakika') : T('tur')}</b></p>
      <p class="muted">Hedef bitince uygulamadan serbestçe çıkabilirsin. Hadi devam! 💪</p></div>
      <button class="btn" onclick="closeModal()">Çalışmaya devam ✏️</button>
      <button class="btn ghost" id="lkPar">👨‍👩‍👦 Ebeveyn: kilidi aç</button>`);
    $('lkPar').onclick = () => askPin(T('Ebeveyn şifresi'), T('Bugün için kilit açılsın mı?'), () => { sess().open = true; store(); paint(); });
  };

  // ---------------------------------------------------------------- ilerlemeyi say
  const _finish = finish;
  finish = function () { const had = !!Q; const r = _finish.apply(this, arguments); if (had && L.on) { sess().rounds++; store(); check(); } return r; };
  setInterval(() => {
    if (!L.on || document.visibilityState !== 'visible') return;
    if (!view.querySelector('.qtop,.lesson')) return;          // sadece ders ve soru ekranındaki süre sayılır
    sess().sec += 5; store();
    if (sess().sec % 60 < 5) check();
  }, 5000);
  function check() {
    const s = sess(); paint();
    if (reached() && !s.cheered) {
      s.cheered = true; store();
      setTimeout(() => { if (!Q) { openModal(T`<div class="head"><div class="big">🎉</div><h2>Bugünkü hedef tamam!</h2><p>Harika çalıştın. Artık istediğin zaman çıkabilirsin.</p></div><button class="btn" onclick="closeModal()">Süper!</button>`); if (typeof confetti === 'function') confetti(['🎉', '⭐', '🔓']); } }, 400);
    }
  }

  // ---------------------------------------------------------------- çıkışı engelle
  // Android/TWA'da geri tuşu sayfa geçmişinde geri gider; geçmiş boşsa uygulama kapanır.
  // Başa bir "tuzak" kaydı koyup geri tuşunu yakalıyoruz.
  let exitOk = false, quiet = false;
  // Chrome, kullanıcı dokunmadan eklenen geçmiş kayıtlarını geri tuşunda ATLAR (history manipulation intervention).
  // Bu yüzden tuzak kaydı yalnızca bir dokunuşun içinde eklenir: her dokunuşta, kilit açıksa ve tuzak yoksa kurulur.
  const arm = () => { try { if (!exitOk && (!history.state || !history.state.kilit)) history.pushState({ kilit: 1 }, ''); } catch (e) {} };
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { if (locked()) arm(); }, true));
  window.addEventListener('popstate', () => {
    if (quiet) { quiet = false; return; }
    if (exitOk || !locked()) return;                            // kilit yoksa normal davran (bir sonraki geri çıkar)
    // Burada yeniden kurmuyoruz (dokunuş yok, Chrome atlardı); PIN ekranındaki ilk dokunuş tuzağı yeniden kurar.
    askPin(T('Çıkmak için ebeveyn onayı'), T`Bugünkü hedefe ${Math.max(0, L.goal - progress())} ${L.type === 'dk' ? T('dakika') : T('tur')} kaldı.`, () => {
      openModal(T`<div class="head"><div class="big">👨‍👩‍👦</div><h2>Ebeveyn onayı</h2></div>
        <button class="btn" id="lkExit">🚪 Şimdi çıkışa izin ver</button>
        <button class="btn ghost" id="lkDay">🔓 Bugün için kilidi kaldır</button>
        <button class="btn ghost" onclick="closeModal()">Vazgeç</button>`);
      $('lkExit').onclick = () => { closeModal(); exitOk = true; if (history.state && history.state.kilit) { quiet = true; history.back(); } floatText(T('Şimdi geri tuşuyla çıkabilirsin')); setTimeout(() => { exitOk = false; }, 60000); };
      $('lkDay').onclick = () => { sess().open = true; store(); paint(); closeModal(); };
    }, { cancel: T('Çalışmaya devam ✏️') });
  });
  window.addEventListener('beforeunload', e => { if (locked() && !exitOk) { e.preventDefault(); e.returnValue = ''; } });

  // ---------------------------------------------------------------- Ayarlar: ebeveyn bölümü
  const GUIDE = T`<details style="margin-top:8px"><summary style="cursor:pointer;font-weight:700">📱 Telefonun kendi kilidi (önerilir)</summary>
    <p class="muted" style="font-size:14px;margin:6px 0 0">Ana ekran düğmesiyle çıkışı yalnızca telefon engelleyebilir. Bir kez açmanız yeter:</p>
    <b style="font-size:15px">Android: Uygulama sabitleme</b>
    <ol class="guide-steps"><li>Ayarlar → Güvenlik (veya Güvenlik ve gizlilik) → Diğer ayarlar → <b>Uygulama sabitleme</b>'yi açın, "Sabitlemeyi kaldırmadan önce kilit açma şifresi iste"yi işaretleyin.</li>
    <li>Math Safarix'i açın, son uygulamalar düğmesine basın, uygulamanın simgesine dokunup <b>Sabitle</b>'yi seçin.</li>
    <li>Çıkmak için Geri ve Son uygulamalar düğmelerine birlikte basılı tutun; telefon şifrenizi ister.</li></ol>
    <b style="font-size:15px">iPhone / iPad: Rehberli Erişim</b>
    <ol class="guide-steps"><li>Ayarlar → Erişilebilirlik → <b>Rehberli Erişim</b>'i açın ve bir kod belirleyin.</li>
    <li>Math Safarix açıkken yan (veya ana ekran) düğmesine üç kez basın → Başlat.</li>
    <li>Bitirmek için yine üç kez basıp kodu girin.</li></ol></details>`;
  function lockSection() {
    const on = L.on && L.pin;
    return T`<div class="lockcard" id="lockCard"><b>🔒 Çalışma kilidi</b>
      <p class="muted" style="font-size:14px;margin:4px 0">Açıkken, günlük hedef bitene kadar uygulamadan çıkmak için ebeveyn şifresi gerekir.</p>
      ${on ? T`<p style="margin:6px 0">Durum: <b>Açık</b> · Hedef: <b>${L.goal} ${L.type === 'dk' ? T('dakika') : T('tur')}</b> / gün · Bugün: <b>${progress()}</b></p>
        <div class="row"><button class="btn ghost" id="lkEdit">✏️ Değiştir</button><button class="btn ghost" id="lkOff" style="color:var(--bad)">Kapat</button></div>`
      : T`<div class="seg"><button data-t="tur" class="on">🎯 Tur sayısı</button><button data-t="dk">⏱️ Dakika</button></div>
        <div class="row" style="align-items:center"><span>Günlük hedef:</span><select id="lkGoal"></select></div>
        <button class="btn" id="lkOn" style="margin-top:8px">🔒 Kilidi aç ve şifre belirle</button>`}
      ${GUIDE}</div>`;
  }
  function fillGoal(t, cur) {
    const sel = $('lkGoal'); if (!sel) return;
    const opts = t === 'dk' ? [5, 10, 15, 20, 30, 45, 60] : [1, 2, 3, 4, 5, 6, 8, 10];
    sel.innerHTML = opts.map(n => `<option value="${n}" ${n === (cur || (t === 'dk' ? 20 : 3)) ? 'selected' : ''}>${n} ${t === 'dk' ? T('dakika') : T('tur')}</option>`).join('');
  }
  function wireSection() {
    const card = $('lockCard'); if (!card) return;
    let type = L.type || 'tur';
    card.querySelectorAll('.seg button').forEach(b => { b.classList.toggle('on', b.dataset.t === type); b.onclick = () => { type = b.dataset.t; card.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b)); fillGoal(type); }; });
    fillGoal(type, L.goal);
    if ($('lkOn')) $('lkOn').onclick = () => {
      const goal = +$('lkGoal').value;
      askPin(T('Ebeveyn şifresi belirle'), T('4 haneli bir şifre seçin. Çocuğunuzla paylaşmayın.'), null, { setNew: p1 =>
        askPin(T('Şifreyi tekrar girin'), '', null, { setNew: async p2 => {
          if (p1 !== p2) { openModal(T`<div class="head"><div class="big">⚠️</div><h2>Şifreler aynı değil</h2></div><button class="btn" id="lkAgain">Tekrar dene</button>`); $('lkAgain').onclick = () => { closeModal(); settings(); }; return; }
          L.salt = null; L.pin = await hashPin(p1); L.on = true; L.type = type; L.goal = goal; L.s = null; sess(); store(); arm(); paint();
          openModal(T`<div class="head"><div class="big">🔒</div><h2>Çalışma kilidi açıldı</h2><p>Günlük hedef: <b>${goal} ${type === 'dk' ? T('dakika') : T('tur')}</b>. Hedef bitmeden çıkmak için bu şifre gerekecek.</p>
            <p class="muted" style="font-size:14px">İpucu: Ana ekran düğmesini de kilitlemek için Ayarlar'daki "Telefonun kendi kilidi" rehberine bakın.</p></div><button class="btn" onclick="closeModal()">Tamam</button>`);
        } }) });
    };
    if ($('lkOff')) $('lkOff').onclick = () => askPin(T('Ebeveyn şifresi'), T('Çalışma kilidi kapatılsın mı?'), () => { L = { salt: L.salt }; store(); paint(); settings(); });
    if ($('lkEdit')) $('lkEdit').onclick = () => askPin(T('Ebeveyn şifresi'), T('Kilit ayarlarını değiştir'), () => { L.on = false; L.pin = null; store(); paint(); settings(); });
  }
  const _settings = settings;
  settings = function () {
    _settings.apply(this, arguments);
    const h = [...document.querySelectorAll('#sheet h3')].find(x => /Ebeveyn/.test(x.textContent));
    const html = lockSection();
    if (h) h.insertAdjacentHTML('afterend', html); else $('sheet').insertAdjacentHTML('beforeend', html);
    wireSection();
  };
  $('btnSet') && ($('btnSet').onclick = settings);
  paint();
})();
