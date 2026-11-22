'use strict';
/* =========================================================
   Üyelik & bulut kaydı
   - Kullanıcı adı + şifre ile hesap; ilerleme sunucuda (Supabase, AB) saklanır.
   - Hesap silme: Ayarlar ve hesap penceresi → /api/account (şifre tekrar sorulur).
   - Giriş yapılınca: değişiklikler ~15 sn içinde ve sayfa kapanırken otomatik kaydedilir.
   - Hesap olmadan da oynanabilir (sadece bu cihazda kalır).
   (en son yüklenir)
   ========================================================= */
(function () {
  const AK = 'matSafari_auth';
  let A = null;
  try { A = JSON.parse(localStorage.getItem(AK) || 'null'); } catch (e) {}
  let last = '', lastSync = 0, busy = false, status = '';

  const hasProgress = st => !!st && ((st.xp || 0) > 0 || Object.keys(st.stars || {}).length > 0);
  async function api(path, opt = {}) {
    const r = await fetch(path, { ...opt, headers: { 'content-type': 'application/json', ...(A ? { authorization: 'Bearer ' + A.token } : {}) } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || T('Bağlantı kurulamadı. İnternetini kontrol et.')), { status: r.status });
    return j;
  }

  // ---------- üst çubuktaki bulut düğmesi ----------
  const chip = document.createElement('button');
  chip.className = 'chip'; chip.id = 'btnAcc';
  $('btnZoo').parentNode.prepend(chip);
  chip.onclick = () => { sndTap(); accModal(A ? 'me' : 'login'); };
  function paint() {
    chip.textContent = !A ? '👤' : status === 'err' ? '☁️⚠️' : status === 'busy' ? '☁️⏳' : '☁️';
    chip.title = A ? T`${A.user} · bulutta kayıtlı` : T('Giriş yap / hesap oluştur');
  }

  // ---------- senkron ----------
  async function push(force) {
    if (!A || busy) return;
    const cur = JSON.stringify(S);
    if (!force && cur === last) return;
    busy = true; status = 'busy'; paint();
    try { await api('/api/data', { method: 'PUT', body: JSON.stringify({ state: S }) }); last = cur; lastSync = Date.now(); status = 'ok'; }
    catch (e) { status = 'err'; if (e.status === 401) signOut(true); }
    busy = false; paint();
  }
  function adopt(state) {
    S = Object.assign({}, DEF, state, { welcomed: true });
    save(); last = JSON.stringify(S); lastSync = Date.now();
    if (!Q) home();
  }
  async function pull() {
    status = 'busy'; paint();
    try {
      const r = await api('/api/data');
      if (r.state && (!hasProgress(S) || (r.state.xp || 0) >= (S.xp || 0))) { adopt(r.state); status = 'ok'; }
      else { status = 'ok'; await push(true); }
    } catch (e) { status = 'err'; if (e.status === 401) signOut(true); }
    paint();
  }
  setInterval(() => { if (A && !busy && JSON.stringify(S) !== last && Date.now() - lastSync > 15000) push(); }, 5000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden' || !A) return;
    const cur = JSON.stringify(S); if (cur === last) return;
    try { fetch('/api/data', { method: 'PUT', keepalive: true, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + A.token }, body: JSON.stringify({ state: S }) }); last = cur; } catch (e) {}
  });

  function signOut(expired) {
    A = null; localStorage.removeItem(AK);
    S = Object.assign({}, DEF, { welcomed: true }); save(); last = '';
    status = ''; paint(); home();
    if (expired) openModal(T`<div class="head"><div class="big">🔑</div><h2>Tekrar giriş yap</h2><p>Oturumun süresi doldu. İlerlemen bulutta güvende.</p></div><button class="btn" id="reLog">Giriş yap</button>`), $('reLog').onclick = () => accModal('login');
  }

  // ---------- hesap penceresi ----------
  function accModal(mode) {
    if (A) {
      openModal(T`<div class="head"><div class="big">☁️</div><h2>${esc(A.user)}</h2>
        <p class="muted">İlerlemen buluta kaydediliyor. Başka bir telefon, tablet ya da bilgisayardan aynı kullanıcı adıyla girersen kaldığın yerden devam edersin.</p>
        <p>${status === 'err' ? T('⚠️ Son kayıt başarısız oldu, internet gelince tekrar denenecek.') : lastSync ? T('✅ Son kayıt: ') + new Date(lastSync).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' }) : ''}</p></div>
        <button class="btn green" id="aS">☁️ Şimdi kaydet</button>
        <button class="btn ghost" id="aO">Çıkış yap</button>
        <button class="btn ghost" id="aD" style="color:var(--bad)">🗑️ Hesabımı sil</button>
        <button class="btn ghost" onclick="closeModal()">Kapat</button>`);
      $('aD').onclick = delModal;
      $('aS').onclick = async () => { await push(true); accModal('me'); };
      $('aO').onclick = async () => {
        if (!confirm(T('Çıkış yapılsın mı? İlerlemen bulutta kalır, tekrar girince geri gelir.'))) return;
        await push(true); signOut(false);
      };
      return;
    }
    const reg = mode === 'register';
    openModal(T`<div class="head"><div class="big">${reg ? '🐣' : '👤'}</div><h2>${reg ? T('Hesap oluştur') : T('Giriş yap')}</h2>
      <p class="muted">${reg ? T('Hesabın olunca yıldızların, hayvanların ve zayıf noktaların kaybolmaz. Hangi cihazdan girersen gir kaldığın yerden devam edersin.') : T('Kullanıcı adın ve şifrenle gir, kaldığın yerden devam et.')}</p></div>
      <p><b>Kullanıcı adı</b></p><input class="txt" id="aU" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="20" placeholder="örn. efe_kaplan">
      <p><b>Şifre</b></p><input class="txt" id="aP" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" maxlength="64" placeholder="en az 6 karakter">
      <p id="aE" style="color:var(--bad);min-height:1.3em;margin:6px 0"></p>
      <button class="btn" id="aGo">${reg ? T('Hesap oluştur 🚀') : T('Giriş yap')}</button>
      <button class="btn ghost" id="aSw">${reg ? T('Zaten hesabın var mı? Giriş yap') : T('Hesabın yok mu? Hesap oluştur')}</button>
      <p class="muted" style="font-size:13px">${reg ? T('🔒 Gerçek ad-soyad yerine takma ad kullan. Şifreni bir yere not et; şifre sıfırlama yok.') : T('🔒 Şifren şifrelenmiş olarak saklanır.')}</p>`);
    $('aSw').onclick = () => accModal(reg ? 'login' : 'register');
    const go = async () => {
      const user = $('aU').value, pass = $('aP').value, btn = $('aGo');
      btn.disabled = true; $('aE').textContent = '';
      try {
        const r = await api('/api/auth', { method: 'POST', body: JSON.stringify({ action: reg ? 'register' : 'login', user, pass }) });
        A = { user: r.user, token: r.token }; localStorage.setItem(AK, JSON.stringify(A));
        closeModal();
        if (reg) { if (!S.name || S.name === 'Efe' && !hasProgress(S)) S.name = r.user; await push(true); home(); }
        else await pull();
        sndWin(); confetti(['☁️', '⭐', '🎉']); floatText(reg ? T('Hesabın hazır!') : T('Hoş geldin ') + r.user + '!');
      } catch (e) { $('aE').textContent = e.message; btn.disabled = false; }
    };
    $('aGo').onclick = go;
    $('aP').onkeydown = e => { if (e.key === 'Enter') go(); };
    setTimeout(() => $('aU').focus(), 50);
  }

  // ---------- hesap silme (mağaza şartı: uygulama içinden silinebilmeli) ----------
  function delModal() {
    openModal(T`<div class="head"><div class="big">🗑️</div><h2>Hesabı sil</h2>
      <p><b>${esc(A.user)}</b> hesabı ve buluttaki tüm ilerleme (puanlar, yıldızlar, hayvanlar, zayıf noktalar) <b>kalıcı olarak</b> silinir. Bu geri alınamaz.</p>
      <p class="muted">Onaylamak için şifreni yaz.</p></div>
      <input class="txt" id="dP" type="password" autocomplete="current-password" maxlength="64" placeholder="şifren">
      <p id="dE" style="color:var(--bad);min-height:1.3em;margin:6px 0"></p>
      <button class="btn" id="dGo" style="background:var(--bad)">Evet, kalıcı olarak sil</button>
      <button class="btn ghost" id="dNo">Vazgeç</button>`);
    $('dNo').onclick = () => accModal('me');
    $('dGo').onclick = async () => {
      const btn = $('dGo'); btn.disabled = true; $('dE').textContent = '';
      try {
        await api('/api/account', { method: 'DELETE', body: JSON.stringify({ pass: $('dP').value }) });
        A = null; localStorage.removeItem(AK);
        S = Object.assign({}, DEF, { welcomed: true }); save(); last = ''; status = ''; paint(); home();
        openModal(T`<div class="head"><div class="big">👋</div><h2>Hesap silindi</h2><p>Hesabın ve buluttaki tüm verilerin silindi.</p></div><button class="btn" onclick="closeModal()">Tamam</button>`);
      } catch (e) { $('dE').textContent = e.status === 401 ? T('Şifre hatalı.') : e.message; btn.disabled = false; }
    };
    setTimeout(() => $('dP').focus(), 50);
  }

  // ---------- Ayarlar: hesap, gizlilik ----------
  const _settings = settings;
  settings = function () {
    _settings();
    $('sheet').insertAdjacentHTML('beforeend', T`<h3 style="margin:16px 0 4px">🔒 Hesap ve gizlilik</h3>
      ${A ? T`<button class="btn ghost" id="sA">☁️ Hesabım (${esc(A.user)})</button><button class="btn ghost" id="sD" style="color:var(--bad)">🗑️ Hesabımı sil</button>`
          : T`<button class="btn ghost" id="sA">👤 Giriş yap / hesap oluştur</button>`}
      <a class="btn ghost" href="gizlilik.html" target="_blank" rel="noopener" style="display:block;text-align:center;text-decoration:none">📄 Gizlilik politikası ve KVKK</a>`);
    $('sA').onclick = () => accModal(A ? 'me' : 'login');
    if ($('sD')) $('sD').onclick = delModal;
  };
  $('btnSet').onclick = settings;

  // ---------- haritada hatırlatma, karşılama ekranında giriş ----------
  const _home = home, _welcome = welcome;
  home = function () {
    _home();
    if (A) return;
    const hello = view.querySelector('.hello'); if (!hello) return;
    hello.insertAdjacentHTML('afterend', T`<div class="card" style="display:flex;gap:10px;align-items:center;padding:12px 14px">
      <div style="font-size:34px">☁️</div><div style="flex:1;font-size:15px"><b>İlerlemen sadece bu cihazda.</b><br><span class="muted">Kaybolmaması için ücretsiz hesap aç.</span></div>
      <button class="btn" id="hReg" style="width:auto;margin:0;font-size:16px;padding:10px 14px">Hesap aç</button></div>`);
    $('hReg').onclick = () => accModal(hasProgress(S) ? 'register' : 'login');
  };
  welcome = function () {
    _welcome();
    $('sheet').insertAdjacentHTML('beforeend', T`<button class="btn ghost" id="wLog">👤 Hesabım var, giriş yap</button>`);
    $('wLog').onclick = () => { S.welcomed = true; save(); accModal('login'); };
  };

  paint(); home();
  if (A) pull();
})();
