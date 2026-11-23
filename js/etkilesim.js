'use strict';
/* =========================================================
   Sürpriz etkileşimler
   - Hayvanlara dokununca kendi sesini çıkarır (🐥 "Cik cik!", 🐶 "Hav hav!"…), zıplar, kalp saçar.
   - Arka arkaya 5 kez dokununca gıdıklanır 😂
   - Doğru cevaplarda arada bir hayvan sesiyle sevinir; turda bir kez "🎁 Sürpriz hediye" çıkabilir.
   - Haritada ara sıra uçan bir uğur böceği/kelebek geçer; yakalayana küçük bonus (günde en fazla 3).
   (en son yüklenir)
   ========================================================= */
(function () {
  const SND = {
    '🐆': T('Grrr!'), '🐊': T('Hap hup!'), '🐘': T('Pırööö!'), '🐙': T('Blup blup!'), '🐜': T('Çıt çıt!'), '🐝': T('Vızzz!'),
    '🐢': T('Yavaş yavaş…'), '🐥': T('Cik cik!'), '🐧': T('Vak vak!'), '🐨': T('Hıımm… uykum var'), '🐫': T('Mırrr!'),
    '🐬': T('İi-i-i!'), '🐰': T('Pıt pıt!'), '🐱': T('Miyav!'), '🐳': T('Uuuum!'), '🐵': T('U u a a!'), '🐶': T('Hav hav!'),
    '🐸': T('Vırak vırak!'), '🐹': T('Çiik çiik!'), '🐺': T('Auuuu!'), '🐻': T('Hırrr!'), '🐼': T('Ham ham!'), '🐿': T('Çit çit!'),
    '🦁': T('Kükreee!'), '🦅': T('Kiyaaa!'), '🦉': T('Hu huu!'), '🦊': T('Hıh hıh!'), '🦎': T('Tıss!'), '🦒': T('Hımm?'),
    '🦔': T('Fıs fıs!'), '🦖': T('Roaarr!'), '🦘': T('Hop hop!'), '🦜': T('Merhaba!'), '🦩': T('Gak gak!'), '🦭': T('Ark ark!'),
    '🏆': T('Yaşasın!'), '🎲': T('Tıkır tıkır!')
  };
  const SMALL = '🐥🐹🐿🐜🐝🐰🦜🐱🐬🐧🦔', BIG = '🐘🦁🐻🦖🐳🐊🐆🐺🐫🦭';
  const keyOf = s => { s = (s || '').trim(); return Object.keys(SND).find(k => s.startsWith(k)); };
  const pickR = a => a[Math.floor(Math.random() * a.length)];

  // ---------- stil ----------
  const css = document.createElement('style');
  css.textContent = `
  .mascot .ani,.hello .big,.zoo .z .e,.res>div:first-child{cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}
  .pop-say{position:fixed;z-index:40;transform:translate(-50%,-100%);background:#fff;border:3px solid #ff8a3d;border-radius:18px;padding:6px 14px;
    font-weight:800;font-size:20px;color:#7a3500;white-space:nowrap;box-shadow:0 4px 0 rgba(0,0,0,.12);pointer-events:none;animation:popSay 1.3s ease forwards}
  .pop-say::after{content:"";position:absolute;left:50%;bottom:-11px;margin-left:-8px;border:8px solid transparent;border-top-color:#ff8a3d;border-bottom:0}
  @keyframes popSay{0%{opacity:0;transform:translate(-50%,-80%) scale(.6)}15%{opacity:1;transform:translate(-50%,-100%) scale(1.08)}25%{transform:translate(-50%,-100%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-130%)}}
  .heart{position:fixed;z-index:39;pointer-events:none;font-size:24px;animation:heartUp 1.1s ease-out forwards}
  @keyframes heartUp{0%{opacity:1;transform:translate(0,0) scale(.6)}100%{opacity:0;transform:translate(var(--dx),-110px) scale(1.2)}}
  .boing{animation:boing .5s ease}
  @keyframes boing{0%{transform:scale(1)}25%{transform:scale(1.25,.8) translateY(4px)}50%{transform:scale(.9,1.15) translateY(-14px)}75%{transform:scale(1.05,.95)}100%{transform:scale(1)}}
  .tickle{animation:tickle .9s ease}
  @keyframes tickle{0%,100%{transform:rotate(0)}10%,30%,50%,70%{transform:rotate(-18deg) scale(1.1)}20%,40%,60%,80%{transform:rotate(18deg) scale(1.1)}}
  .bug{position:fixed;z-index:35;font-size:38px;cursor:pointer;user-select:none;filter:drop-shadow(0 3px 2px rgba(0,0,0,.2));animation:bugFly 9s linear forwards}
  @keyframes bugFly{0%{left:-50px;transform:translateY(0) rotate(10deg)}25%{transform:translateY(-40px) rotate(-10deg)}50%{transform:translateY(20px) rotate(10deg)}75%{transform:translateY(-30px) rotate(-10deg)}100%{left:calc(100vw + 50px);transform:translateY(0) rotate(10deg)}}
  .gift{position:fixed;left:50%;top:45%;z-index:45;transform:translate(-50%,-50%);background:#fff;border:4px solid #ffb703;border-radius:22px;padding:14px 22px;text-align:center;
    font-weight:800;font-size:22px;box-shadow:0 8px 0 rgba(0,0,0,.15);animation:giftIn 2.4s ease forwards;pointer-events:none}
  .gift big{display:block;font-size:56px;line-height:1.1}
  @keyframes giftIn{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-20deg)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.1) rotate(5deg)}25%{transform:translate(-50%,-50%) scale(1) rotate(0)}85%{opacity:1}100%{opacity:0;transform:translate(-50%,-70%)}}`;
  document.head.appendChild(css);

  // ---------- ses ----------
  let trVoice = null;
  function pickVoice() { try { const v = speechSynthesis.getVoices(); trVoice = v.find(x => x.lang.toLowerCase().startsWith(LANG)) || null; } catch (e) {} }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', pickVoice); }
  function voice(k, text) {
    if (!S.sound) return;
    beep(SMALL.includes(k) ? [[1900, .05], [2400, .07]] : BIG.includes(k) ? [[140, .18, 'sawtooth'], [110, .22, 'sawtooth']] : [[620, .06, 'triangle'], [820, .08, 'triangle']]);
    if (window.TTS && TTS.ready) { if (!TTS.playing()) TTS.play(text.replace(/…/g, ''), { pitch: SMALL.includes(k) ? 45 : BIG.includes(k) ? -30 : 15, rate: 5 }).catch(() => {}); return; }
    if (!('speechSynthesis' in window) || speechSynthesis.speaking || !trVoice) return; // sesli anlatımı bölme
    try {
      const u = new SpeechSynthesisUtterance(text.replace(/[…?!]/g, ' ').trim());
      u.voice = trVoice; u.lang = trVoice.lang; u.rate = 1.1; u.volume = 1;
      u.pitch = SMALL.includes(k) ? 2 : BIG.includes(k) ? .3 : 1.3;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ---------- görsel efektler ----------
  function bubble(el, text) {
    const r = el.getBoundingClientRect(), b = document.createElement('div');
    b.className = 'pop-say'; b.textContent = text;
    b.style.left = Math.min(window.innerWidth - 70, Math.max(70, r.left + r.width / 2)) + 'px';
    b.style.top = Math.max(50, r.top - 4) + 'px';
    document.body.appendChild(b); setTimeout(() => b.remove(), 1300);
  }
  function hearts(el, list) {
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const h = document.createElement('span'); h.className = 'heart'; h.textContent = pickR(list || ['❤️', '💛', '💖', '✨']);
      h.style.left = (r.left + r.width / 2 - 12 + (Math.random() * 40 - 20)) + 'px'; h.style.top = (r.top + r.height / 3) + 'px';
      h.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px'); h.style.animationDelay = (i * .07) + 's';
      document.body.appendChild(h); setTimeout(() => h.remove(), 1400);
    }
  }
  function anim(el, cls) { el.classList.remove('boing', 'tickle', 'hop'); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 950); }

  // ---------- hayvana dokun ----------
  let lastEl = null, taps = 0, tapT = 0;
  document.addEventListener('click', e => {
    const el = e.target.closest('.mascot .ani, .hello .big, .zoo .z .e, .res > div:first-child');
    if (!el || !view.contains(el)) return;
    const k = keyOf(el.textContent); if (!k) return;
    const now = Date.now();
    taps = (el === lastEl && now - tapT < 1800) ? taps + 1 : 1; lastEl = el; tapT = now;
    const locked = el.closest('.z.no');
    if (taps >= 5) {
      taps = 0; anim(el, 'tickle'); bubble(el, T('Hihihi! Gıdıklanıyorum! 😂'));
      hearts(el, ['😂', '🤣', '✨', k]); if (S.sound) beep([[880, .06], [990, .06], [880, .06], [1175, .12]]);
      return;
    }
    anim(el, 'boing');
    if (locked) { bubble(el, T('Beni kurtar! 🙏')); if (S.sound) beep([[400, .1, 'triangle']]); return; }
    const t = SND[k]; bubble(el, t); hearts(el); voice(k, t);
  });

  // ---------- doğru cevapta sevinç + sürpriz hediye ----------
  let giftRound = null;
  const _outcome = outcome;
  outcome = function (ok, paint) {
    const round = Q, wasDone = Q && Q.cur && Q.cur.done;
    _outcome(ok, paint);
    if (!ok || !round || wasDone || !round.cur || !round.cur.done) return;
    const a = $('ani'), k = a && keyOf(a.textContent);
    if (a && k && round.mode !== 'speed' && Math.random() < .35) setTimeout(() => bubble(a, SND[k]), 150);
    if (round.mode !== 'speed' && giftRound !== round && round.n >= 2 && Math.random() < .12) {
      giftRound = round; round.xp += 5;
      const g = document.createElement('div'); g.className = 'gift';
      g.innerHTML = T`<big>🎁</big>Sürpriz hediye!<br><span style="color:var(--ok)">+5 ⭐</span>`;
      document.body.appendChild(g); setTimeout(() => g.remove(), 2400);
      if (S.sound) setTimeout(() => beep([[784, .08], [988, .08], [1175, .08], [1568, .2]]), 250);
      confetti(['🎁', '⭐', '🎉', '💝']);
    }
  };

  // ---------- haritada uçan uğur böceği ----------
  const weekId = () => Math.floor((Date.now() / 864e5 + 3) / 7);
  let bugTimer = null;
  function scheduleBug() {
    clearTimeout(bugTimer);
    bugTimer = setTimeout(() => {
      if (Q || !view.querySelector('.hello') || document.querySelector('.bug') || !$('modal').classList.contains('hidden')) return scheduleBug();
      const b = document.createElement('div'); b.className = 'bug'; b.textContent = pickR(['🐞', '🦋', '🐞', '🦋', '🐝']);
      b.style.top = (90 + Math.random() * Math.max(100, window.innerHeight - 260)) + 'px';
      b.onclick = ev => {
        ev.stopPropagation(); b.style.animationPlayState = 'paused';
        const d = today(); if (!S.bugs || S.bugs.d !== d) S.bugs = { d, n: 0 };
        let msg = T('Yakaladın! 🎉');
        if (S.bugs.n < 3) {
          S.bugs.n++; S.xp += 2;
          const w = weekId(); if (!S.wk || S.wk.id !== w) S.wk = { id: w, xp: 0 }; S.wk.xp += 2;
          save(); topbar(); msg = T('Yakaladın! +2 ⭐');
        }
        bubble(b, msg); hearts(b, ['✨', '⭐', b.textContent]);
        if (S.sound) beep([[1047, .06], [1319, .06], [1568, .12]]);
        setTimeout(() => b.remove(), 600);
      };
      document.body.appendChild(b); setTimeout(() => b.remove(), 9200);
      scheduleBug();
    }, 25000 + Math.random() * 35000);
  }
  scheduleBug();
})();
