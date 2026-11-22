'use strict';
/* Anonim "şu an çevrimiçi" sayacı: sayfa açıkken dakikada bir sinyal.
   Kimlik sekmeye özeldir (sessionStorage): sayfa yenilense de aynı kalır, sekme kapanınca biter.
   Sayfa kapanırken/yenilenirken kimlik sunucudan hemen silinir; böylece yenilemek sayıyı artırmaz.
   Kullanıcı adı, IP ya da cihaz bilgisi saklanmaz. Sayı haritadaki karşılama kartında gösterilir. */
(function () {
  const KEY = 'matSafari_sid';
  const newSid = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
  let sid = null;
  try { sid = sessionStorage.getItem(KEY); } catch (e) {}
  if (!/^[a-z0-9]{16,40}$/.test(sid || '')) { sid = newSid(); try { sessionStorage.setItem(KEY, sid); } catch (e) {} }

  let count = 0;
  function paint() {
    const hello = view.querySelector('.hello > div:last-child'); if (!hello) return;
    let el = $('online');
    if (!count) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('p'); el.id = 'online'; el.style.cssText = 'margin-top:6px;font-weight:700;color:var(--ok)'; hello.appendChild(el); }
    el.textContent = T`🟢 Şu an ${count} kişi çevrimiçi`;
  }
  const _home = home;
  home = function () { _home(); paint(); };
  $('btnHome').onclick = () => home();

  async function beat() {
    if (document.visibilityState !== 'visible') return;
    try {
      const r = await fetch('/api/online', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sid }) });
      count = (await r.json()).count || 0;
    } catch (e) { count = 0; }
    paint();
  }
  // Sayfa kapanırken/yenilenirken/arka plana geçerken bu sekmeyi listeden çıkar
  function leave() {
    const body = JSON.stringify({ sid, leave: true });
    try {
      if (!navigator.sendBeacon || !navigator.sendBeacon('/api/online', new Blob([body], { type: 'application/json' })))
        fetch('/api/online', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body });
    } catch (e) {}
  }
  // Yenilemede önceki sayfanın "çıkış" sinyali geç ulaşabilir; birkaç saniye sonra tekrar "buradayım" de.
  beat(); setTimeout(beat, 4000); setInterval(beat, 60000);
  document.addEventListener('visibilitychange', () => { document.visibilityState === 'visible' ? beat() : leave(); });
  window.addEventListener('pagehide', leave);
})();
