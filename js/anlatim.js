'use strict';
/* =========================================================
   Sesli anlatım: ders kartlarını video gibi anlatır.
   - Cihazın kendi Türkçe sesiyle (Web Speech API) satır satır okur.
   - Okunan satır vurgulanır; henüz gelmemiş satırlar soluk durur ve sırayla belirir.
   - Kart bitince sonrakine geçer; son kartta "Hadi deneyelim" düğmesini öne çıkarır.
   - Türkçe ses yoksa aynı canlandırmayı sessiz (zamanlı) yapar.
   Ücretsizdir, internet gerektirmez, ses dosyası indirmez.
   (en son yüklenir)
   ========================================================= */
(function () {
  const SS = window.speechSynthesis;
  const RATE = { normal: 1.08, slow: 0.88 };
  let playing = false, run = 0, idx = 0, segs = [], rateKey = 'normal', voice = null;
  // Beyaz tahta modu: satırlar harf harf yazılır, şekiller çizilerek gelir (tercih cihazda saklanır)
  const BKEY = 'matSafari_tahta';
  let board = true;
  try { board = localStorage.getItem(BKEY) !== '0'; } catch (e) {}

  const css = document.createElement('style');
  css.textContent = `
  .narr{display:flex;gap:8px;margin:6px 0 2px;flex-wrap:wrap}
  .narr button{font-weight:800;border-radius:14px;padding:8px 14px;font-size:16px;background:#fff;box-shadow:0 3px 0 var(--line)}
  .narr #nPlay{background:var(--blue);color:#fff;box-shadow:0 4px 0 #2364c9;flex:1;min-width:150px;font-size:18px}
  .narr #nPlay.on{background:var(--ok);box-shadow:0 4px 0 #17804a}
  .narr-note{font-size:13px;color:var(--muted);margin:2px 0 0}
  .narr-on .seg,.narr-on .vseg{transition:opacity .35s, background .2s}
  .narr-on .pend{opacity:.12}
  .seg.now{background:#fff1a8;border-radius:6px;box-shadow:0 0 0 3px #fff1a8}
  .vseg.now{outline:4px solid #ffe08a;outline-offset:4px;border-radius:8px}
  .ani.talk{animation:talk .45s infinite alternate}
  @keyframes talk{from{transform:translateY(0) rotate(-3deg)}to{transform:translateY(-5px) rotate(3deg)}}
  #ln.cta{animation:pulse 1s infinite}
  /* ---- beyaz tahta ---- */
  .lesson.board{background:#fdfdfb;border:10px solid #c9ced6;border-radius:14px;position:relative;margin-bottom:22px;
    box-shadow:inset 0 0 0 2px #eef0f3,0 6px 0 rgba(0,0,0,.12);font-family:'Kalam','Segoe Print','Comic Sans MS','Chalkboard SE',cursive;font-weight:700;color:#0b2a78}
  .lesson.board::after{content:"";position:absolute;left:18%;right:18%;bottom:-20px;height:7px;background:#9aa1ab;border-radius:4px}
  .lesson.board h3{font-family:inherit;font-weight:700;font-size:30px;color:#c4001d;border-bottom:4px solid rgba(196,0,29,.3);padding-bottom:2px;letter-spacing:.3px}
  .lesson.board .body{font-size:22px;line-height:1.5;-webkit-text-stroke:.35px currentColor}
  .lesson.board .ex{background:transparent;border-left:5px solid #00897b;border-radius:0;color:#111827}
  .lesson.board .tip{background:transparent;border:3px dashed #00897b;border-left-width:3px;color:#0b6b2f}
  .lesson.board b{color:#c4001d;font-weight:700}
  .lesson.board .grp{background:transparent}
  .lesson.board .fbar{border-color:#0b2a78}
  .lesson.board .frac>span:first-child{border-bottom-width:3px}
  .board .seg.now{background:transparent;box-shadow:none}
  .board .vseg.now{outline:none}
  .board.narr-on .pend{opacity:0}
  .board.narr-on .ex,.board.narr-on .tip{transition:opacity .3s}
  .board.narr-on .ex:not(:has(.seg:not(.pend),.vseg:not(.pend))),.board.narr-on .tip:not(:has(.seg:not(.pend),.vseg:not(.pend))){opacity:0}
  .seg.writing .ch{opacity:0}.seg.writing .ch.on{opacity:1}
  #pen{position:absolute;left:0;top:0;font-size:28px;pointer-events:none;display:none;z-index:3;
    transform:translate(-6px,-26px) rotate(8deg);transition:left .08s linear,top .08s linear;filter:drop-shadow(1px 2px 1px rgba(0,0,0,.2))}`;
  document.head.appendChild(css);

  // ---------- Türkçe ses seçimi ----------
  function pickVoice() {
    if (!SS) return;
    // En doğal sesi seç: Edge "Natural/Online" (Emel, Ahmet) > Google > diğerleri
    const score = v => (/natural|neural|online/i.test(v.name) ? 8 : 0) + (/emel/i.test(v.name) ? 2 : 0) + (/google/i.test(v.name) ? 4 : 0) + (/yelda|seda/i.test(v.name) ? 1 : 0);
    const vs = SS.getVoices().filter(v => v.lang.toLowerCase().startsWith(LANG)).sort((a, b) => score(b) - score(a));
    voice = vs[0] || null;
  }

  // ---------- öğretmen gibi konuşma: isimle hitap, ara cümleler ----------
  const nm = () => { const n = (S.name || '').trim(); return n && n !== T('Kaşif') ? n : ''; };
  const pick1 = a => a[Math.floor(Math.random() * a.length)];
  const fill = a => pick1(a).replace(/\{n\}/g, nm()).replace(/\s+([,!?.])/g, '$1').replace(/,\s*([!?.])/g, '$1').replace(/\s{2,}/g, ' ').replace(/^[,\s]+/, '').replace(/^./, c => c.toLocaleUpperCase(LOCALE)).trim();
  const LINES = {
    intro: [T('Merhaba {n}! Bugün {t} konusunu birlikte öğreneceğiz. Hazır mısın? Hadi başlayalım.'), T('Selam {n}! Ben {a}. Bugün sana {t} konusunu anlatacağım. Dikkatle dinle, çok kolay göreceksin.'), T('{n}, hoş geldin! Şimdi {t} konusuna bakalım. Acele yok, yavaş yavaş gidelim.')],
    next: [T('Şimdi devam edelim.'), T('Güzel. Bir sonraki adıma geçelim {n}.'), T('Hadi bakalım, sıradaki kısım.')],
    mid: [T('Bak ne kadar kolay!'), T('Bunu bir düşün {n}.'), T('Buraya dikkat et.'), T('Gördün mü? Hiç de zor değil.'), T('Anladık mı {n}?')],
    visual: [T('Şimdi şuna bak.'), T('Bak, tahtaya çiziyorum.'), T('Şu resme dikkatle bak {n}.')],
    tip: [T('Sana küçük bir sır vereyim {n}.'), T('Şimdi bir ipucu.'), T('Bunu aklında tut.')],
    end: [T('Anladık mı {n}? Harika, devam edelim.'), T('Buraya kadar tamam mı {n}? Bak ne kadar kolaydı!'), T('Süper gidiyorsun {n}! Hadi devam.')],
    last: [T('Aferin {n}! Konuyu bitirdik. Şimdi birlikte birkaç soru çözelim mi?'), T('Harikasın {n}! Hadi şimdi öğrendiklerini deneyelim.')]
  };
  function bubble(text) { const s = view.querySelector('.mascot .say'); if (s) s.textContent = '💬 ' + text; }
  if (SS) { pickVoice(); SS.addEventListener && SS.addEventListener('voiceschanged', pickVoice); }

  // ---------- metni sesli okunacak hale getir ----------
  const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{20E3}]/gu;
  function speakText(el) {
    const c = el.cloneNode(true);
    c.querySelectorAll('.frac').forEach(f => { const [a, b] = f.children; f.replaceWith(T` ${a ? a.textContent : ''} bölü ${b ? b.textContent : ''} `); });
    c.querySelectorAll('sup').forEach(s => s.replaceWith(T` üssü ${s.textContent} `));
    let t = c.textContent;
    t = t.replace(/cm²/g, T(' santimetrekare')).replace(/cm³/g, T(' santimetreküp')).replace(/(\d)\s*cm\b/g, T('$1 santimetre'))
      .replace(/²/g, T(' kare')).replace(/³/g, T(' küp'))
      .replace(/%\s*(\d)/g, T('yüzde $1'))
      .replace(/(^|\s)\?(?=\s|$)/g, T('$1kaç'))
      .replace(/√/g, T(' kök ')).replace(/π/g, T(' pi ')).replace(/°/g, T(' derece'))
      .replace(/×|·/g, T(' çarpı ')).replace(/÷/g, T(' bölü ')).replace(/(\d)\s*\/\s*(\d)/g, T('$1 bölü $2'))
      .replace(/≤/g, T(' küçük eşit ')).replace(/≥/g, T(' büyük eşit ')).replace(/≠/g, T(' eşit değil '))
      .replace(/</g, T(' küçüktür ')).replace(/>/g, T(' büyüktür '))
      .replace(/−/g, T(' eksi ')).replace(/(\s)-(\d)/g, T('$1eksi $2')).replace(/\+/g, T(' artı ')).replace(/=/g, T(' eşittir '))
      .replace(/[→←⇒]/g, ', ').replace(/[▢□]/g, T(' boş kutu ')).replace(/…|\.\.\./g, ', ')
      .replace(/\|/g, ' ').replace(EMOJI, ' ').replace(/[✔✖❌]/g, ' ')
      .replace(/\s+/g, ' ').trim();
    return t;
  }

  // ---------- kartı satırlara (segmentlere) böl ----------
  const VISUAL = el => el.matches('svg, img, .fbar, .vis, .grp') || (el.querySelector && el.querySelector(':scope > svg'));
  const INLINE = el => /^(B|I|EM|STRONG|SPAN|SUP|SUB|A|CODE|SMALL)$/.test(el.tagName) && !el.classList.contains('grp');
  function segmentize(container, out) {
    let runNodes = [];
    const flush = () => {
      if (runNodes.length && runNodes.some(n => n.textContent.trim())) {
        const s = document.createElement('span'); s.className = 'seg';
        runNodes[0].before(s); runNodes.forEach(n => s.appendChild(n)); out.push({ el: s });
      }
      runNodes = [];
    };
    [...container.childNodes].forEach(n => {
      if (n.nodeType === 3) { runNodes.push(n); return; }
      if (n.nodeType !== 1) return;
      if (n.tagName === 'BR') { flush(); return; }
      if (INLINE(n)) { runNodes.push(n); return; }
      flush();
      if (VISUAL(n)) { n.classList.add('vseg'); out.push({ el: n, visual: true }); }
      else segmentize(n, out);
    });
    flush();
    return out;
  }

  // ---------- oynatma ----------
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const estMs = text => Math.max(700, text.length * 62 / RATE[rateKey]);

  // ---------- beyaz tahta: harf harf yaz, şekilleri çiz ----------
  function prepChars(seg) {
    if (seg._chars) return seg._chars;
    const chars = [], nodes = [], w = document.createTreeWalker(seg, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(tn => {
      const frag = document.createDocumentFragment();
      for (const ch of tn.textContent) {
        if (/\s/.test(ch)) { frag.append(ch); continue; }
        const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; frag.append(s); chars.push(s);
      }
      tn.replaceWith(frag);
    });
    return (seg._chars = chars);
  }
  function movePen(target) {
    const pen = $('pen'), card = view.querySelector('.lesson');
    if (!pen || !card || !target) return;
    const r = target.getBoundingClientRect(), c = card.getBoundingClientRect();
    pen.style.display = 'block';
    pen.style.left = (r.right - c.left - card.clientLeft) + 'px';
    pen.style.top = (r.bottom - c.top - card.clientTop) + 'px';
  }
  function hidePen() { const p = $('pen'); if (p) p.style.display = 'none'; }
  function write(el, ms, myRun) {
    const chars = prepChars(el);
    chars.forEach(c => c.classList.remove('on'));
    el.classList.add('writing');
    if (!chars.length) { el.classList.remove('writing'); return Promise.resolve(); }
    const step = Math.max(16, ms / chars.length);
    return new Promise(res => {
      let n = 0;
      (function tick() {
        if (myRun !== run) return res();
        const upto = Math.min(chars.length, n + Math.max(1, Math.round(16 / step) || 1));
        for (; n < upto; n++) chars[n].classList.add('on');
        movePen(chars[n - 1]);
        if (n >= chars.length) { el.classList.remove('writing'); return res(); }
        setTimeout(tick, step);
      })();
    });
  }
  function draw(el, ms, myRun) {
    el.classList.remove('pend');
    const shapes = [...el.querySelectorAll('line,rect,polygon,polyline,path,circle,ellipse')];
    if (shapes.length) {
      const texts = [...el.querySelectorAll('text')];
      shapes.forEach(s => {
        let L = 400; try { L = s.getTotalLength() || 400; } catch (e) {}
        s.style.transition = 'none'; s.style.strokeDasharray = L; s.style.strokeDashoffset = L; s.style.fillOpacity = 0;
      });
      texts.forEach(t => { t.style.transition = 'none'; t.style.opacity = 0; });
      el.getBoundingClientRect();
      const each = ms * 0.7, gap = ms * 0.3 / shapes.length;
      shapes.forEach((s, i) => { s.style.transition = `stroke-dashoffset ${each}ms ease ${i * gap}ms, fill-opacity .4s ease ${each + i * gap}ms`; s.style.strokeDashoffset = 0; s.style.fillOpacity = 1; });
      texts.forEach((t, i) => { t.style.transition = `opacity .35s ease ${ms * 0.6 + i * 120}ms`; t.style.opacity = 1; });
    } else {
      const kids = [...el.children];
      kids.forEach(k => { k.style.transition = 'none'; k.style.opacity = 0; });
      el.getBoundingClientRect();
      kids.forEach((k, i) => { k.style.transition = `opacity .3s ease ${i * ms / Math.max(1, kids.length)}ms`; k.style.opacity = 1; });
    }
    movePen(el);
    return sleep(ms + 300).then(() => { if (myRun === run) hidePen(); });
  }
  // Uzun metni cümlelere böl: her cümle ayrı söylenir, aralarda nefes payı kalır (daha az robotik)
  async function say(text, myRun) {
    const parts = text.split(/(?<=[.!?:;])\s+/).map(s => s.trim()).filter(Boolean);
    for (let j = 0; j < parts.length; j++) {
      if (myRun !== run) return;
      await say1(parts[j], myRun);
      if (j < parts.length - 1) await sleep(220 / RATE[rateKey]);
    }
  }
  async function aside(text, myRun) { // ara cümle: tahtaya yazılmaz, hayvan söyler
    if (myRun !== run || !text) return;
    bubble(text); talking(true); await say(text, myRun); talking(false);
    if (myRun === run) await sleep(350);
  }
  function say1(text, myRun) {
    // Doğal ses (Azure) varsa onu kullan, olmazsa cihaz sesine düş
    if (S.sound && window.TTS && TTS.ready) return TTS.play(text, { rate: rateKey === 'slow' ? -8 : 6 }).catch(() => (myRun === run ? say1dev(text, myRun) : null));
    return say1dev(text, myRun);
  }
  function say1dev(text, myRun) {
    return new Promise(res => {
      if (!SS || !voice) { setTimeout(res, Math.min(6000, 900 + text.length * 55 / RATE[rateKey])); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LOCALE; u.voice = voice; u.rate = RATE[rateKey]; u.pitch = 1;
      let done = false; const end = () => { if (!done) { done = true; res(); } };
      u.onend = end; u.onerror = end;
      // Bazı tarayıcılar onend'i kaçırabiliyor: güvenlik zamanlayıcısı
      setTimeout(end, 2500 + text.length * 120 / RATE[rateKey]);
      if (myRun === run) SS.speak(u);
    });
  }
  function mark(i) {
    segs.forEach((s, j) => { s.el.classList.toggle('pend', j > i); s.el.classList.toggle('now', j === i); });
    const cur = segs[i]; if (cur) cur.el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function talking(on) { const a = view.querySelector('.mascot .ani'); if (a) a.classList.toggle('talk', on); }
  function paintBtn() {
    const b = $('nPlay'); if (!b) return;
    b.classList.toggle('on', playing);
    b.textContent = playing ? T('⏸ Duraklat') : idx > 0 && idx < segs.length ? T('▶ Devam et') : T('▶ Sesli anlat');
  }

  async function play() {
    if (!segs.length) return;
    const myRun = ++run; playing = true; paintBtn();
    view.querySelector('.lesson')?.classList.add('narr-on');
    if (idx >= segs.length) idx = 0;
    const TC = TOPICS[cur.i], lastK = TC.lesson.length - 1;
    const sub = s => s.replace('{t}', TC.name).replace('{a}', (TC.animal || '').split(' ')[0]);
    if (idx === 0) {
      if (cur.k === 0) { mark(-1); await aside(sub(fill(LINES.intro)), myRun); }
      else if (cur.auto && Math.random() < .5) { mark(-1); await aside(fill(LINES.next), myRun); }
    }
    let asides = 0, lastAside = -9;
    for (; idx < segs.length; idx++) {
      if (myRun !== run) return;
      const s = segs[idx];
      // Doğal ara cümleler: şekilden ve ipucundan önce, arada bir de "Bak ne kadar kolay!" gibi
      if (idx > 0 && asides < 2 && idx - lastAside > 2) {
        const line = s.visual && Math.random() < .55 ? LINES.visual : s.el.closest('.tip') && !segs[idx - 1].el.closest('.tip') ? LINES.tip
          : !s.visual && idx > 1 && Math.random() < .22 ? LINES.mid : null;
        if (line) { mark(idx - 1); await aside(fill(line), myRun); asides++; lastAside = idx; if (myRun !== run) return; }
      }
      mark(idx);
      if (s.visual) { talking(false); await (board ? draw(s.el, 1700 / RATE[rateKey], myRun) : sleep(1300 / RATE[rateKey])); await sleep(300); continue; }
      const text = speakText(s.el);
      if (!text) continue;
      talking(true);
      await (board ? Promise.all([say(text, myRun), write(s.el, estMs(text), myRun)]) : say(text, myRun));
      talking(false);
      if (myRun !== run) return;
      await sleep(380 / RATE[rateKey]);
    }
    if (myRun !== run) return;
    hidePen();
    // Kart bitti: sonraki karta geç ya da "Hadi deneyelim"i öne çıkar
    segs.forEach(s => s.el.classList.remove('now', 'pend', 'writing'));
    const { i, k } = cur;
    await aside(fill(k < lastK ? LINES.end : LINES.last), myRun);
    if (myRun !== run) return;
    if (k < lastK) { await sleep(500); if (myRun === run) lesson(i, k + 1, { auto: true }); }
    else { playing = false; paintBtn(); const ln = $('ln'); if (ln) { ln.classList.add('cta'); ln.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }
  }
  function pause() { run++; playing = false; if (SS) SS.cancel(); if (window.TTS) TTS.stop(); talking(false); hidePen(); paintBtn(); }
  function stop() { pause(); idx = 0; segs = []; }

  // ---------- ders ekranına anlatım çubuğu ----------
  let cur = { i: 0, k: 0 };
  const _lesson = lesson;
  lesson = function (i, k, opt) {
    const auto = !!(opt && opt.auto);
    stop();
    _lesson(i, k);
    cur = { i, k, auto };
    const card = view.querySelector('.lesson'), mascot = view.querySelector('.mascot');
    if (!card || !mascot) return;
    const h3 = card.querySelector('h3'), body = card.querySelector('.body');
    segs = [];
    if (h3) { h3.classList.add('seg'); segs.push({ el: h3 }); }
    if (body) segmentize(body, segs);
    idx = 0;
    card.classList.toggle('board', board);
    card.insertAdjacentHTML('beforeend', '<span id="pen">🖊️</span>');
    const noVoice = SS && !voice;
    mascot.insertAdjacentHTML('afterend', T`<div class="narr">
      <button id="nPlay">▶ Sesli anlat</button>
      <button id="nRe" title="Baştan">⏪</button>
      <button id="nBoard" title="Beyaz tahtada yazarak anlat">${board ? T('🖊️ Tahta') : T('📄 Kart')}</button>
      <button id="nRate" title="Konuşma hızı">${rateKey === 'slow' ? T('🐢 Yavaş') : T('🐇 Normal')}</button></div>
      ${!SS ? T('<p class="narr-note">Bu tarayıcı sesli okumayı desteklemiyor; satırlar yine sırayla gösterilecek.</p>') : noVoice ? T('<p class="narr-note">Bu cihazda Türkçe ses bulunamadı; satırlar sessiz olarak sırayla gösterilecek.</p>') : ''}`);
    $('nPlay').onclick = () => { sndTap(); playing ? pause() : play(); };
    $('nRe').onclick = () => { pause(); idx = 0; segs.forEach(s => s.el.classList.remove('now', 'pend', 'writing')); play(); };
    $('nBoard').onclick = e => {
      board = !board; try { localStorage.setItem(BKEY, board ? '1' : '0'); } catch (x) {}
      e.target.textContent = board ? T('🖊️ Tahta') : T('📄 Kart');
      card.classList.toggle('board', board);
      const at = idx, was = playing; pause(); segs.forEach(s => s.el.classList.remove('writing')); idx = at; if (was) play();
    };
    $('nRate').onclick = e => { rateKey = rateKey === 'slow' ? 'normal' : 'slow'; e.target.textContent = rateKey === 'slow' ? T('🐢 Yavaş') : T('🐇 Normal'); if (playing) { const at = idx; pause(); idx = at; play(); } };
    if (auto) play();
  };

  // Dersten çıkınca (harita, soru, hayvanat bahçesi, liderlik…) anlatımı durdur
  const _stopTimer = stopTimer;
  stopTimer = function () { if (playing || segs.length) stop(); _stopTimer(); };
  window.addEventListener('pagehide', () => { if (SS) SS.cancel(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && playing) pause(); });
})();
