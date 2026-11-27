'use strict';
/* Ekran düzeni ve öğrenme akışı (dil.js'ten sonra yüklenir)
   1) Alt menü çubuğu: büyük, kolay dokunulan Harita / Kupa / Gelişim / Hayvanlar / Ayarlar düğmeleri
   2) Paylaş: skoru (resimli kart) ve uygulamanın ana sayfasını başka uygulamalara gönder
   3) Ekrana sığdır: ders, soru ve sonuç ekranları kaydırma gerektirmesin; gerekirse yazılar küçülür
   4) Kolaydan zora: konu ilk kez açılınca önce ders; alıştırma en kolaydan başlar, art arda 3 ilk denemede
      doğru gelince bir basamak zorlaşır, hata gelince bir basamak kolaylaşır; ilk soru birlikte çözülür. */
(function () {
  const SITE = 'https://mathsafarix.com/';
  // S hesap yüklenince/sıfırlanınca yeniden oluşturulur; 'learned' her erişimde garanti edilsin
  const LR = () => (S.learned && typeof S.learned === 'object') ? S.learned : (S.learned = {});

  // ---------------------------------------------------------------- stiller
  const css = document.createElement('style');
  css.textContent = `
  #top #btnHome,#top #btnLb,#top #btnZoo,#top #btnSet{display:none}
  #top{position:sticky;top:0;z-index:12;background:var(--bg);margin:0 -12px;padding:calc(8px + env(safe-area-inset-top)) 12px 8px;box-shadow:0 4px 10px -6px rgba(0,0,0,.18)}
  #app{padding-top:0!important}
  body:not(.focus) #app{padding-bottom:calc(var(--navh,84px) + 16px)!important}
  #nav{position:fixed;left:0;right:0;bottom:0;z-index:15;background:#fff;box-shadow:0 -4px 14px rgba(0,0,0,.08);
    border-radius:22px 22px 0 0;padding:6px 6px calc(6px + env(safe-area-inset-bottom));display:flex;justify-content:center}
  #nav .in{display:flex;gap:4px;width:100%;max-width:760px}
  #nav button{flex:1;display:flex;flex-direction:column;align-items:center;gap:0;padding:6px 2px;border-radius:16px;
    font-size:13px;font-weight:800;color:var(--muted);min-height:62px}
  #nav button b{font-size:30px;line-height:1.1;font-weight:400}
  #nav button.on{background:#fff1e3;color:var(--pri2)}
  #nav button:active{transform:scale(.93)}
  body.focus #nav{display:none}
  .share{background:linear-gradient(90deg,#25d366,#1fb457);box-shadow:0 5px 0 #168c43}
  .fitted{transform-origin:top center}
  .card.res{padding:10px 14px;margin:6px 0}.card.res>div:first-child{font-size:46px!important;line-height:1.1}.card.res h2{margin:4px 0}
  .lesson{position:relative}
  .lesson.has-teach{padding-bottom:64px}
  #view.teach-on .mascot .ani{visibility:hidden}
  .teach{position:absolute;z-index:3;pointer-events:none;line-height:1;transition:right .9s ease-in-out,bottom .9s ease-in-out,transform .9s ease-in-out,font-size .9s ease-in-out;
    right:8px;bottom:6px;font-size:52px;transform:none}
  .teach .tg{display:inline-block;transform-origin:50% 90%}
  .teach .tf{display:inline-block;transform-origin:50% 100%;animation:tbreath 3.6s ease-in-out infinite}
  .teach .stick{position:absolute;font-size:.55em;left:-.55em;top:.35em;transform:rotate(-20deg);transition:opacity .4s;transform-origin:80% 80%}
  .teach.write .stick{animation:tscrib .5s ease-in-out infinite alternate}
  .teach.big{right:50%;bottom:50%;transform:translate(50%,50%);font-size:118px}
  .teach.big .stick{opacity:0}
  .teach::after{content:"";position:absolute;left:15%;right:15%;bottom:-6px;height:8px;border-radius:50%;background:rgba(0,0,0,.10);z-index:-1}
  @keyframes tbreath{0%,100%{transform:translateY(0) scale(1,1)}50%{transform:translateY(-2px) scale(1.015,1.025)}}
  @keyframes tscrib{from{transform:rotate(-26deg) translate(0,0)}to{transform:rotate(-14deg) translate(-2px,2px)}}
  @media (prefers-reduced-motion:reduce){.teach,.teach *{animation:none!important;transition:none!important}}
  .aibox{background:#fff7e0;border:3px solid #ffc93c;border-radius:16px;padding:10px 12px;margin:8px 0;text-align:left;font-size:17px;line-height:1.35;animation:aiin .35s ease-out}
  .aibox .dots{display:inline-flex;gap:4px;vertical-align:middle}
  .aibox .dots i{width:7px;height:7px;border-radius:50%;background:#e0a100;animation:aidot 1s infinite ease-in-out}
  .aibox .dots i:nth-child(2){animation-delay:.15s}.aibox .dots i:nth-child(3){animation-delay:.3s}
  @keyframes aidot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}
  @keyframes aiin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .guide{background:#eafbf1;border-left:6px solid var(--ok);border-radius:12px;padding:10px 12px;margin:10px 0;text-align:left}
  `;
  document.head.appendChild(css);

  // ---------------------------------------------------------------- 1) alt menü
  const nav = document.createElement('nav');
  nav.id = 'nav';
  const ITEMS = [
    ['home', '🗺️', T('Harita'), () => home()],
    ['lb', '🏆', T('Kupa'), () => { const b = $('btnLb'); b && b.onclick ? b.onclick() : home(); }],
    ['gel', '📈', T('Gelişim'), () => window.gelisim ? window.gelisim() : home()],
    ['zoo', '🐾', T('Hayvanlar'), () => zoo()],
    ['set', '⚙️', T('Ayarlar'), () => settings()]
  ];
  nav.innerHTML = '<div class="in">' + ITEMS.map(([k, e, n]) => `<button data-n="${k}" aria-label="${n}"><b>${e}</b>${n}</button>`).join('') + '</div>';
  document.body.appendChild(nav);
  // Menünün gerçek yüksekliği kadar alttan boşluk bırak: hiçbir şey menünün altında kalmasın
  const setH = () => document.documentElement.style.setProperty('--navh', nav.offsetHeight + 'px');
  setH(); if (window.ResizeObserver) new ResizeObserver(setH).observe(nav); window.addEventListener('resize', setH);
  let active = 'home';
  nav.querySelectorAll('button').forEach(b => b.onclick = () => {
    if (typeof sndTap === 'function') sndTap();
    const it = ITEMS.find(x => x[0] === b.dataset.n); active = it[0]; it[3](); paintNav();
  });
  function paintNav() { nav.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.n === active)); }
  paintNav();

  // ---------------------------------------------------------------- 2) paylaş
  function card(o) {
    // 1080×1080 resimli skor kartı
    const c = document.createElement('canvas'); c.width = c.height = 1080;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 1080); g.addColorStop(0, '#fff6e5'); g.addColorStop(1, '#e9f8e4');
    x.fillStyle = g; x.fillRect(0, 0, 1080, 1080);
    x.fillStyle = '#fff'; x.beginPath(); x.roundRect ? x.roundRect(70, 150, 940, 760, 60) : x.rect(70, 150, 940, 760); x.fill();
    x.textAlign = 'center'; x.fillStyle = '#2d2a32';
    const F = (w, s) => `${w} ${s}px "Baloo 2","Segoe UI",system-ui,sans-serif`;
    x.font = F(800, 64); x.fillText('Matematik Safarisi', 540, 110);
    x.font = F(400, 190); x.fillText(o.emoji, 540, 370);
    x.font = F(800, 70); x.fillText(o.title, 540, 490, 880);
    if (o.stars != null) { x.font = F(400, 110); x.fillText('⭐'.repeat(o.stars) + '☆'.repeat(3 - o.stars), 540, 630); }
    x.font = F(700, 52); x.fillStyle = '#7c7686'; (o.lines || []).forEach((l, i) => x.fillText(l, 540, (o.stars != null ? 730 : 640) + i * 70, 880));
    x.fillStyle = '#ff8a3d'; x.beginPath(); x.roundRect ? x.roundRect(240, 950, 600, 90, 45) : x.rect(240, 950, 600, 90); x.fill();
    x.fillStyle = '#fff'; x.font = F(800, 50); x.fillText('mathsafarix.com', 540, 1012);
    return new Promise(res => c.toBlob(b => res(b), 'image/png'));
  }
  async function share(text, o) {
    const data = { title: 'Matematik Safarisi', text, url: SITE };
    try {
      if (o && navigator.canShare) {
        const b = await card(o);
        const f = b && new File([b], 'matematik-safarisi.png', { type: 'image/png' });
        if (f && navigator.canShare({ files: [f] })) { await navigator.share({ ...data, text: text + ' ' + SITE, url: undefined, files: [f] }); return; }
      }
      if (navigator.share) { await navigator.share(data); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    // Yedek: doğrudan uygulama bağlantıları + kopyala
    const msg = encodeURIComponent(text + ' ' + SITE);
    openModal(T`<div class="head"><div class="big">📤</div><h2>Paylaş</h2><p class="muted">${esc(text)}</p></div>
      <a class="btn share" style="text-align:center;text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/?text=${msg}">WhatsApp</a>
      <a class="btn blue" style="text-align:center;text-decoration:none" target="_blank" rel="noopener" href="https://t.me/share/url?url=${encodeURIComponent(SITE)}&text=${encodeURIComponent(text)}">Telegram</a>
      <button class="btn ghost" id="shCp">🔗 Bağlantıyı kopyala</button><button class="btn ghost" onclick="closeModal()">Kapat</button>`);
    $('shCp').onclick = () => { try { navigator.clipboard.writeText(text + ' ' + SITE); $('shCp').textContent = T('✅ Kopyalandı'); } catch (e) {} };
  }
  window.paylas = share;
  const shareApp = () => share(T('Hayvanlarla oynayarak matematik öğreniyorum, sen de gel! 🦁🐵🐧'),
    { emoji: '🦁🐵🐧', title: T('Gel birlikte oynayalım!'), lines: [T('Sayılardan LGS\'ye adım adım'), T('Ücretsiz · telefonda çalışır')] });

  // ---------------------------------------------------------------- 4) kolaydan zora
  const thr = [0, .6, .8, .95];
  const learned = t => LR()[t.id] || (S.stars[t.id] || 0) >= 1;
  let guided = null, justLearned = null;

  const _lesson = lesson;
  lesson = function (i, k, opt) {
    // İlk kartta anlatım kendiliğinden başlasın (dokunuşla gelindiği için ses izni vardır)
    _lesson(i, k, opt || (k === 0 ? { auto: true } : undefined));
    const L = TOPICS[i].lesson;
    if (k === L.length - 1) { LR()[TOPICS[i].id] = 1; justLearned = i; save(); }
    teacher(TOPICS[i]);
    fit();
  };

  // Tahtanın önünde öğretmen hayvan: tahta boşken ortada büyük durur ve konuşur,
  // yazı başlayınca tahtanın köşesine geçer; konuşurken kıpırdar.
  let tObs = [];
  function teacher(t) {
    tObs.forEach(o => o.disconnect()); tObs = [];
    view.classList.remove('teach-on');
    const card = view.querySelector('.lesson'); if (!card) return;
    const el = document.createElement('div');
    el.className = 'teach'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<span class="tg"><span class="tf">${t.emoji}</span></span><span class="stick">🖍️</span>`;
    card.classList.add('has-teach'); card.appendChild(el); view.classList.add('teach-on');
    const ani = view.querySelector('.mascot .ani'), tg = el.querySelector('.tg');
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Konuşurken arada bir doğal jest: başını sallar, hafifçe yana eğer, minik zıplar. Hep aynı hareketi tekrarlamaz.
    const G = {
      nod: [[{ transform: 'none' }, { transform: 'translateY(3px) scale(1.02,.97)' }, { transform: 'translateY(-2px)' }, { transform: 'translateY(2px) scale(1.01,.98)' }, { transform: 'none' }], 700, 'ease-in-out'],
      tiltL: [[{ transform: 'none' }, { transform: 'rotate(-7deg)', offset: .3 }, { transform: 'rotate(-7deg)', offset: .75 }, { transform: 'none' }], 1300, 'ease-in-out'],
      tiltR: [[{ transform: 'none' }, { transform: 'rotate(7deg)', offset: .3 }, { transform: 'rotate(7deg)', offset: .75 }, { transform: 'none' }], 1300, 'ease-in-out'],
      hop: [[{ transform: 'none' }, { transform: 'scale(1.04,.94)', offset: .15 }, { transform: 'translateY(-14px) scale(.97,1.04)', offset: .45 }, { transform: 'scale(1.05,.93)', offset: .8 }, { transform: 'none' }], 650, 'ease-out'],
      lean: [[{ transform: 'none' }, { transform: 'translateX(-5px) rotate(-4deg)', offset: .35 }, { transform: 'translateX(-5px) rotate(-4deg)', offset: .7 }, { transform: 'none' }], 1500, 'ease-in-out']
    };
    const BAG = ['nod', 'nod', 'nod', 'tiltL', 'tiltR', 'lean', 'hop'];
    let talkOn = false, gT = 0, lastG = '', wasBig = null;
    const gesture = name => { if (calm || !tg.animate) return; const [k, d, e] = G[name]; tg.animate(k, { duration: d, easing: e }); };
    const loop = () => {
      clearTimeout(gT); if (!talkOn || !el.isConnected) return;
      let g; do { g = BAG[Math.floor(Math.random() * BAG.length)]; } while (g === lastG && g !== 'nod');
      if (g === 'hop' && !el.classList.contains('big')) g = 'nod';
      lastG = g; gesture(g);
      gT = setTimeout(loop, 1800 + Math.random() * 2200);
    };
    const upd = () => {
      if (!el.isConnected) { clearTimeout(gT); return; }
      const empty = card.classList.contains('narr-on') && !card.querySelector('.seg:not(.pend),.vseg:not(.pend)');
      el.classList.toggle('big', empty);
      // Köşeye/ortaya geçerken küçük adımlarla yürür
      if (wasBig !== null && wasBig !== empty && !calm && tg.animate) tg.animate([{ transform: 'none' }, { transform: 'translateY(-6px)' }, { transform: 'none' }, { transform: 'translateY(-6px)' }, { transform: 'none' }, { transform: 'translateY(-4px)' }, { transform: 'none' }], { duration: 900, easing: 'ease-in-out' });
      wasBig = empty;
      el.classList.toggle('write', !empty && !!card.querySelector('.writing'));
      const talk = !!(ani && ani.classList.contains('talk'));
      if (talk && !talkOn) { talkOn = true; gT = setTimeout(loop, 500 + Math.random() * 600); }
      else if (!talk && talkOn) { talkOn = false; clearTimeout(gT); }
    };
    const o1 = new MutationObserver(upd); o1.observe(card, { attributes: true, attributeFilter: ['class'], subtree: true }); tObs.push(o1);
    if (ani) { const o2 = new MutationObserver(upd); o2.observe(ani, { attributes: true, attributeFilter: ['class'] }); tObs.push(o2); }
    upd();
  }

  const _startQuiz = startQuiz;
  startQuiz = function (i, mode) {
    // Konu hiç öğrenilmediyse önce dersi göster
    if (mode === 'practice' && i >= 0 && !learned(TOPICS[i])) { lesson(i, 0); return; }
    guided = mode === 'practice' && justLearned === i ? i : null; justLearned = null;
    _startQuiz(i, mode);
    guided = null;
  };

  const _diffFor = diffFor;
  diffFor = function () {
    if (!Q || Q.mode !== 'practice' || Q.forced) return _diffFor();
    if (!Q.A) { const st = S.stars[TOPICS[Q.ti].id] || 0; Q.A = { d: st >= 2 ? 2 : 1, s: 0, max: 1 }; Q.A.max = Q.A.d; }
    Q.curD = Q.A.d; return Q.A.d;
  };

  const _outcome = outcome;
  outcome = function (ok, paint) {
    const q = Q && Q.cur, clean = q && q.tries === 0 && !q.hint;
    _outcome(ok, paint);
    if (!Q || !Q.A || Q.mode !== 'practice' || !q || !q.done || q._rec) return;
    q._rec = 1; const A = Q.A;
    if (ok && clean) { if (++A.s >= 3 && A.d < 3) { A.d++; A.s = 0; A.max = Math.max(A.max, A.d); } }
    else if (!ok) { A.d = Math.max(1, A.d - 1); A.s = 0; }
    else A.s = 0;
  };

  // ---------------------------------------------------------------- 5) yapay zekâ öğretmen
  // Yanlış cevapta: ilk denemede çocuğun cevabına göre ipucu (cevabı söylemeden),
  // son denemede de nerede karıştırdığını açıklar. Ad vb. kişisel bilgi gönderilmez.
  const txt = h => { const d = document.createElement('div'); d.innerHTML = h || ''; d.querySelectorAll('.frac').forEach(f => { const [a, b] = f.children; f.replaceWith(` ${a ? a.textContent : ''}/${b ? b.textContent : ''} `); }); d.querySelectorAll('br').forEach(b => b.replaceWith('. ')); return d.textContent.replace(/\s+/g, ' ').trim(); };
  const AI_ON = false; // şimdilik kapalı (kullanıcı isteği, 2026-11-24); açmak için true yap ve api/aciklama.js'i yayına al
  let aiOff = 0, pickTxt = '';
  const _answerChoice = answerChoice;
  answerChoice = function (k, btn) { const q = Q && Q.cur; pickTxt = q && q.choices && q.choices[k] ? txt(q.choices[k].h) : ''; return _answerChoice(k, btn); };
  function speakAI(s) {
    try {
      if (!S.sound || !('speechSynthesis' in window)) return;
      const v = speechSynthesis.getVoices().find(x => x.lang.toLowerCase().startsWith('tr'));
      if (!v) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(s.replace(/(\d)\.(?=\s|$)/g, '$1,')); u.voice = v; u.lang = v.lang; u.rate = 1.05;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  async function askAI(q, tur, cevap) {
    if (!navigator.onLine || Date.now() < aiOff || !cevap) return;
    const f = $('fbx'); if (!f) return;
    const t = TOPICS[q.ti];
    const box = document.createElement('div'); box.className = 'aibox';
    box.innerHTML = `<b>${t.emoji} ${esc((t.animal || '').split(' ')[0] || T('Öğretmen'))}:</b> <span class="aitx"><i class="dots"><i></i><i></i><i></i></i></span>`;
    f.prepend(box); fit();
    try {
      const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 9000);
      const r = await fetch('/api/aciklama', { method: 'POST', signal: ctl.signal, headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tur, konu: t.name, soru: txt(q.q) + (q.sub ? ' (' + txt(q.sub) + ')' : ''), dogru: txt(answerText(q)), cevap, cozum: txt(q.exp) }) });
      clearTimeout(to);
      const j = r.ok ? await r.json() : null;
      if (!r.ok && (r.status === 503 || r.status === 429)) aiOff = Date.now() + 5 * 60000;
      if (!j || !j.metin || Q == null || Q.cur !== q) { box.remove(); fit(); return; }
      box.querySelector('.aitx').textContent = j.metin;
      speakAI(j.metin); fit();
    } catch (e) { box.remove(); fit(); }
  }
  const _outcomeAI = outcome;
  outcome = function (ok, paint) {
    const q = Q && Q.cur;
    const cevap = q ? (q.choices ? pickTxt : String(q.input || '').replace('-', '−')) : '';
    const before = q ? q.tries : 0;
    _outcomeAI(ok, paint);
    if (!AI_ON || ok || !q || !Q || Q.mode === 'speed') return;
    if (q.done) askAI(q, 'aciklama', cevap);
    else if (q.tries === 1 && before === 0) askAI(q, 'ipucu', cevap);
  };

  const _nextQ = nextQ;
  nextQ = function () {
    _nextQ();
    if (Q && Q.cur && guided === Q.ti && Q.n === 0 && !Q.cur.done) {
      const f = $('fbx'); if (f) f.insertAdjacentHTML('afterbegin', T`<div class="guide"><b>🤝 İlk soruyu birlikte çözelim!</b><br>${Q.cur.hintText}</div>`);
      fit();
    }
  };

  const _finish = finish;
  finish = function () {
    const snap = Q && Q.mode !== 'speed' && Q.ti >= 0 ? { t: TOPICS[Q.ti], correct: Q.correct, total: Q.total, mode: Q.mode } : Q && Q.mode === 'speed' ? { t: TOPICS[Q.ti], correct: Q.correct, mode: 'speed' } : null;
    let capped = false;
    if (Q && Q.A && Q.mode === 'practice' && Q.A.max < 3) {
      const lim = thr[Q.A.max + 1] * Q.total - .01;
      if (Q.pts > lim) { Q.pts = lim; capped = true; }
    }
    _finish();
    const row = $('rH') && $('rH').parentNode;
    if (capped && row) row.insertAdjacentHTML('beforebegin', T`<div class="card res" style="font-size:17px">🧗 Daha fazla yıldız için <b>zor sorulara</b> kadar çık: art arda 3 soruyu ilk denemede bil, sorular bir basamak zorlaşsın!</div>`);
    if (snap && row) {
      const st = snap.mode === 'speed' ? null : (S.stars[snap.t.id] || 0);
      row.insertAdjacentHTML('afterend', T`<button class="btn share" id="rSh">📤 Skorumu paylaş</button>`);
      $('rSh').onclick = () => {
        const text = snap.mode === 'speed'
          ? T`Matematik Safarisi'nde ${snap.t.name} hız turunda 60 saniyede ${snap.correct} doğru yaptım! ⚡ Beni geçebilir misin?`
          : T`Matematik Safarisi'nde ${snap.t.name} konusunda ${snap.total} sorudan ${snap.correct} doğru yaptım! ${'⭐'.repeat(st)} Sen de dene!`;
        share(text, { emoji: snap.t.emoji, title: snap.t.name, stars: st, lines: snap.mode === 'speed' ? [T`60 saniyede ${snap.correct} doğru ⚡`] : [T`${snap.total} sorudan ${snap.correct} doğru`] });
      };
    }
    fit();
  };

  // Haritaya "Paylaş" düğmesi
  const _home = home;
  home = function () {
    _home(); active = 'home'; paintNav();
    // Haritayı çocuğun kaldığı konuda ortala (sıradaki konu; yoksa en son yıldızlı konu)
    const ns = view.querySelectorAll('.node');
    const target = view.querySelector('.node.next') || [...ns].reverse().find(n => n.classList.contains('done'));
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'center', behavior: 'auto' }));
    const mb = view.querySelector('.mapbtns');
    if (mb && !$('mSh')) { mb.insertAdjacentHTML('beforeend', T`<button class="btn share" id="mSh" style="grid-column:1/-1">📤 Arkadaşlarına öner</button>`); $('mSh').onclick = shareApp; }
  };

  // ---------------------------------------------------------------- konu düzeltmeleri: en temelden başla
  const byId = id => TOPICS.find(t => t.id === id);
  const topla = byId('topla');
  if (topla) {
    const old = topla.gen;
    // 1: eldesiz iki basamaklı (23 + 14), 2: eldeli (47 + 38), 3: üç basamaklı / bilinmeyen sayı
    topla.gen = function (d) {
      if (d === 2) return old(1);
      if (d === 3) return old(chance(.5) ? 2 : 3);
      {
        const at = R(1, 8), ao = R(1, 8), bt = R(0, 9 - at), bo = R(1, 9 - ao), a = at * 10 + ao, b = bt * 10 + bo;
        if (chance(.5)) return { q: `${a} + ${b} = ?`, ans: a + b, hint: T`Birlikle birliği topla: ${ao} + ${bo}. Onlukla onluğu topla: ${at * 10} + ${bt * 10}.`, exp: T`Birlikler: ${ao} + ${bo} = ${ao + bo}<br>Onluklar: ${at * 10} + ${bt * 10} = ${(at + bt) * 10}<br>${(at + bt) * 10} + ${ao + bo} = ${a + b}` };
        const s = a + b;
        return { q: `${s} − ${b} = ?`, ans: a, hint: T`Birlikten birliği çıkar: ${ao + bo} − ${bo}. Onluktan onluğu çıkar: ${(at + bt) * 10} − ${bt * 10}.`, exp: T`Birlikler: ${ao + bo} − ${bo} = ${ao}<br>Onluklar: ${(at + bt) * 10} − ${bt * 10} = ${at * 10}<br>${at * 10} + ${ao} = ${a}` };
      }
    };
    topla.lesson = [
      [T('Onluklar ve birlikler'), T`Her sayı <b>onluklardan</b> ve <b>birliklerden</b> oluşur.
       <div class="ex"><b>34</b> = 🟧🟧🟧 + ▪️▪️▪️▪️<br>3 onluk + 4 birlik<br>34 = 30 + 4</div>
       <div class="tip">🐰 Pıtpıt der ki: Turuncu çubuk 10 tane, küçük kare 1 tane!</div>`],
      [T('Birlikle birlik, onlukla onluk'), T`<b>23 + 14</b> = ?
       <div class="ex">Birlikler: 3 + 4 = 7<br>Onluklar: 20 + 10 = 30<br>30 + 7 = <b>37</b></div>
       <div class="tip">Aynı cins olanları topla: elma ile elma, armut ile armut!</div>`],
      [T('10\'u geçince'), T`<b>47 + 38</b>: ikinci sayıyı parçala, sırayla ekle.
       <div class="ex">38 = 30 + 8<br>47 + 30 = 77<br>77 + 8 = <b>85</b></div>
       <div class="tip">Önce onlukları, en son birlikleri ekle.</div>`],
      [T('Çıkarma da aynı'), T`<b>58 − 23</b> = ?
       <div class="ex">23 = 20 + 3<br>58 − 20 = 38<br>38 − 3 = <b>35</b></div>
       <div class="tip">Kontrol et: 35 + 23 = 58 ✔️</div>`],
      [T('Bilinmeyen sayı'), T`<b>? + 5 = 12</b> → toplamdan bilineni çıkar.
       <div class="ex">? = 12 − 5 = <b>7</b></div>
       <div class="tip">Toplama ile çıkarma kardeştir; biri diğerini geri alır.</div>`]
    ];
  }
  const carp = byId('carp');
  if (carp) carp.lesson = [
    carp.lesson[0],
    [T('Kolay çarpımlar'), T`Önce kolaylarla başla:
     <div class="ex"><b>× 2</b> = iki katı: 4 × 2 = 4 + 4 = <b>8</b><br><b>× 10</b> = sonuna 0 ekle: 6 × 10 = <b>60</b><br><b>× 5</b> = 10'un yarısı: 6 × 5 = 60'ın yarısı = <b>30</b></div>`],
    carp.lesson[1], carp.lesson[2]
  ];

  // ---------------------------------------------------------------- 3) ekrana sığdır
  const FIT_SEL = '.qtop,.lesson,.res,.narr';
  let raf = 0;
  function fit() { cancelAnimationFrame(raf); raf = requestAnimationFrame(doFit); }
  function doFit() {
    const focus = !!view.querySelector('.qtop,.lesson');
    document.body.classList.toggle('focus', focus);
    view.classList.toggle('teach-on', !!view.querySelector('.teach'));
    view.style.zoom = '';
    if (!view.querySelector(FIT_SEL)) return;
    const top = $('top') ? $('top').offsetHeight : 0, bar = focus ? 0 : nav.offsetHeight;
    const avail = window.innerHeight - top - bar - 10, need = view.scrollHeight;
    if (need > avail) view.style.zoom = String(Math.max(.62, Math.floor(avail / need * 100) / 100));
  }
  function fitSheet() {
    const sh = $('sheet'); if (!sh) return;
    sh.style.zoom = '';
    const max = window.innerHeight * .92;
    if (sh.scrollHeight > max) sh.style.zoom = String(Math.max(.65, Math.floor(max / sh.scrollHeight * 100) / 100));
  }
  new MutationObserver(fit).observe(view, { childList: true, subtree: true });
  new MutationObserver(() => requestAnimationFrame(fitSheet)).observe($('sheet'), { childList: true, subtree: true });
  window.addEventListener('resize', () => { fit(); fitSheet(); });
  // Haritadan başka ekrana geçişlerde menüde doğru düğme yansın
  const wrapNav = (name, key) => { const f = window[name]; if (typeof f !== 'function') return; window[name] = function () { const r = f.apply(this, arguments); active = key; paintNav(); return r; }; };
  wrapNav('zoo', 'zoo'); wrapNav('gelisim', 'gel');

  if (view.querySelector('.region')) home();
})();
