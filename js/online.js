'use strict';
/* Anonim "şu an çevrimiçi" sayacı: sayfa açıkken dakikada bir sinyal.
   Kimlik sekmeye özeldir (sessionStorage): sayfa yenilense de aynı kalır, sekme kapanınca biter.
   Sayfa kapanırken/yenilenirken kimlik sunucudan hemen silinir; böylece yenilemek sayıyı artırmaz.
   Kullanıcı adı, IP ya da cihaz bilgisi saklanmaz. Sayı haritadaki karşılama kartında gösterilir.
   Ayrıca cihazda kalıcı rastgele bir ziyaretçi kimliği (vid) üretilir ve sayfa başına yalnızca ilk sinyalde gönderilir:
   sunucu bunu sadece toplam farklı kullanıcı sayısı için kullanır. Toplam üye / farklı kullanıcı /api/stats'tan gelir. */
(function () {
  const KEY = 'matSafari_sid';
  const newSid = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
  let sid = null;
  try { sid = sessionStorage.getItem(KEY); } catch (e) {}
  if (!/^[a-z0-9]{16,40}$/.test(sid || '')) { sid = newSid(); try { sessionStorage.setItem(KEY, sid); } catch (e) {} }
  // Kalıcı anonim ziyaretçi kimliği (yalnızca "toplam farklı kullanıcı" sayısı için; hesapla ilişkilendirilmez)
  const VKEY = 'matSafari_vid';
  let vid = null;
  try { vid = localStorage.getItem(VKEY); } catch (e) {}
  if (!/^[a-z0-9]{16,40}$/.test(vid || '')) { vid = newSid(); try { localStorage.setItem(VKEY, vid); } catch (e) {} }
  let vidSent = false;

  let count = 0, stats = null;
  const fmt = n => Number(n).toLocaleString('tr-TR');
  function paint() {
    const hello = view.querySelector('.hello > div:last-child'); if (!hello) return;
    let el = $('online');
    if (!count) { if (el) el.remove(); }
    else {
      if (!el) { el = document.createElement('p'); el.id = 'online'; el.style.cssText = 'margin-top:6px;font-weight:700;color:var(--ok)'; hello.appendChild(el); }
      el.textContent = T`🟢 Şu an ${count} kişi çevrimiçi`;
    }
    // Toplam üye ve toplam farklı kullanıcı
    let st = $('totals');
    const parts = [];
    if (stats && stats.members > 0) parts.push(T`👥 ${fmt(stats.members)} üye`);
    if (stats && stats.visitors > 0) parts.push(T`🌍 ${fmt(stats.visitors)} farklı kullanıcı`);
    if (!parts.length) { if (st) st.remove(); return; }
    if (!st) { st = document.createElement('p'); st.id = 'totals'; st.style.cssText = 'margin-top:2px;font-weight:700;font-size:14px;color:var(--muted)'; hello.appendChild(st); }
    st.textContent = parts.join(' · ');
  }
  async function loadStats() {
    try { const r = await fetch('/api/stats'); if (r.ok) { stats = await r.json(); paint(); } } catch (e) {}
  }
  const _home = home;
  home = function () { _home(); paint(); };
  $('btnHome').onclick = () => home();

  async function beat() {
    if (document.visibilityState !== 'visible') return;
    try {
      const r = await fetch('/api/online', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(vidSent ? { sid } : { sid, vid }) });
      vidSent = true;
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
  setTimeout(loadStats, 1500); setInterval(loadStats, 5 * 60000);
  document.addEventListener('visibilitychange', () => { document.visibilityState === 'visible' ? beat() : leave(); });
  window.addEventListener('pagehide', leave);
})();
