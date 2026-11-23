'use strict';
/* Doğal öğretmen sesi (Azure Neural TTS, /api/tts üzerinden).
   - TTS.ready: sunucuda anahtar tanımlıysa true olur (açılışta bir kez sorulur).
   - TTS.play(metin, {rate, pitch, voice}) → ses bitince çözülen Promise; hata olursa reddedilir (çağıran cihaz sesine düşer).
   - TTS.load(metin, …) → sesi önceden indirir (bir sonraki cümle konuşulurken hazır olsun).
   - TTS.stop() → çalan sesi keser.
   İlk dokunuşta ses kilidi açılır (iOS/Android otomatik oynatma kuralları). (i18n.js'ten sonra yüklenir) */
const TTS = (function () {
  const cache = new Map();
  let cur = null, fails = 0;
  const api = { ready: false };
  const url = (t, o) => `/api/tts?v=${o.voice || 'emel'}&r=${o.rate || 0}&p=${o.pitch || 0}&t=${encodeURIComponent(t.slice(0, 500))}`;
  api.load = (t, o = {}) => {
    const u = url(t, o);
    if (cache.has(u)) return cache.get(u);
    const p = fetch(u).then(r => { if (!r.ok) throw new Error('tts ' + r.status); return r.blob(); }).then(b => URL.createObjectURL(b));
    cache.set(u, p); p.catch(() => cache.delete(u));
    if (cache.size > 80) cache.delete(cache.keys().next().value);
    return p;
  };
  api.play = (t, o = {}) => new Promise((res, rej) => {
    if (!api.ready || !t.trim()) return rej(new Error('kapalı'));
    let done = false;
    const to = setTimeout(() => { if (!done) { done = true; rej(new Error('zaman aşımı')); } }, 7000);
    api.load(t, o).then(src => {
      if (done) return;
      clearTimeout(to);
      api.stop();
      const a = new Audio(src); cur = a;
      a.onended = () => { if (cur === a) cur = null; fails = 0; res(); };
      a.onerror = () => { if (cur === a) cur = null; rej(new Error('oynatma')); };
      a.play().catch(e => { if (cur === a) cur = null; rej(e); });
    }).catch(e => { if (!done) { done = true; clearTimeout(to); if (++fails >= 4) api.ready = false; rej(e); } });
  });
  api.stop = () => { if (cur) { try { cur.pause(); } catch (e) {} cur = null; } };
  api.playing = () => !!cur;
  // Ses kilidini ilk dokunuşta aç
  const unlock = () => { try { const a = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTRUoAWgBgkOAGbZHBgG1OF6zM82DWbZaUmMBptgQhGjsyYqc9ae9XFz280948NMBWInljyzsNRFLPWdnZGWrddDsjK1unuSrVN9jJsK8KuQtQCtMBjCEtImISdNKJOopIpBFpNSMbIHCSRpRR5iakjTiyzLhchUUBwCgyKiweBv/7UsQbg8isVNoMPMjAAAA0gAAABEVFGmgqK////9bP/6XCykxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'); a.volume = 0; a.play().catch(() => {}); } catch (e) {} window.removeEventListener('pointerdown', unlock); };
  window.addEventListener('pointerdown', unlock);
  fetch('/api/tts?ping=1').then(r => { api.ready = r.ok; }).catch(() => {});
  return api;
})();
window.TTS = TTS;
