'use strict';
/* Dil seçici: haritanın altında 🌐 düğmesi, Ayarlar'da dil listesi ve
   tarayıcı dili farklıysa bir kez "bu dilde de var" önerisi. (en son yüklenir) */
(function () {
  const KEY = 'matSafari_lang';
  const ON = LANGS.filter(x => (window.LANGS_ON || ['tr']).includes(x.c) || x.c === LANG);
  const cur = LANGS.find(x => x.c === LANG) || LANGS[0];
  const go = c => { try { localStorage.setItem(KEY, c); } catch (e) {} if (c !== LANG) location.href = langUrl(c); };
  function picker() {
    openModal(`<h2>🌐 ${T('Dil seçin')}</h2><div class="list">${ON.map(x =>
      `<button class="btn ${x.c === LANG ? '' : 'ghost'}" data-lang="${x.c}" lang="${x.c}" dir="${x.rtl ? 'rtl' : 'ltr'}" style="margin:4px 0">${x.n}</button>`).join('')}</div>
      <button class="btn ghost" id="lgX">${T('Kapat')}</button>`);
    document.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => go(b.dataset.lang));
    $('lgX').onclick = closeModal;
  }
  let saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
  const nav = (navigator.languages || [navigator.language || '']).map(l => (l || '').slice(0, 2).toLowerCase());
  const suggest = !saved && ON.find(x => x.c !== LANG && x.c === nav[0]);

  const _home = home;
  home = function () {
    _home();
    if ($('lgRow')) return;
    view.insertAdjacentHTML('beforeend', `<div id="lgRow" style="text-align:center;margin:14px 0 6px">
      ${suggest ? `<div class="card" lang="${suggest.c}" style="display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap">🌐 <b>${suggest.n}</b>
        <button class="btn" id="lgS" style="width:auto;margin:0;padding:8px 16px;font-size:16px">${suggest.n} ✓</button>
        <button class="btn ghost" id="lgN" style="width:auto;margin:0;padding:8px 16px;font-size:16px">${cur.n}</button></div>` : ''}
      <button class="chip" id="lgB" style="font-size:16px;padding:6px 14px">🌐 ${cur.n} ▾</button></div>`);
    $('lgB').onclick = picker;
    if ($('lgS')) { $('lgS').onclick = () => go(suggest.c); $('lgN').onclick = () => { go(LANG); $('lgRow').firstElementChild.remove(); }; }
  };
  const _settings = settings;
  settings = function () {
    _settings();
    const sh = $('sheet'), h2 = sh && sh.querySelector('h2'); if (!h2) return;
    h2.insertAdjacentHTML('afterend', `<button class="btn ghost" id="sLang" style="margin:4px 0 10px">🌐 ${T('Dil')}: ${cur.n} ▾</button>`);
    $('sLang').onclick = picker;
  };
  $('btnSet').onclick = settings;
  home();
})();
