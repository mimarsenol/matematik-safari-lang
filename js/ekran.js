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
  .teach{position:absolute;z-index:3;pointer-events:none;line-height:1;transition:all .7s cubic-bezier(.3,1.3,.5,1);
    right:8px;bottom:6px;font-size:52px;transform:none}
  .teach .tf{display:inline-block;animation:tbob 2.4s ease-in-out infinite}
  .teach.talk .tf{animation:ttalk .32s ease-in-out infinite alternate}
  .teach .stick{position:absolute;font-size:.55em;left:-.55em;top:.35em;transform:rotate(-20deg);transition:opacity .4s}
  .teach.big{right:50%;bottom:50%;transform:translate(50%,50%);font-size:118px}
  .teach.big .stick{opacity:0}
  .teach.big::after{content:"";position:absolute;left:12%;right:12%;bottom:-10px;height:12px;border-radius:50%;background:rgba(0,0,0,.12)}
  @keyframes tbob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-6px) rotate(2deg)}}
  @keyframes ttalk{from{transform:scale(1,1) rotate(-3deg)}to{transform:scale(1.06,.95) rotate(3deg)}}
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
    el.innerHTML = `<span class="tf">${t.emoji}</span><span class="stick">🖍️</span>`;
    card.classList.add('has-teach'); card.appendChild(el); view.classList.add('teach-on');
    const ani = view.querySelector('.mascot .ani');
    const upd = () => {
      const empty = card.classList.contains('narr-on') && !card.querySelector('.seg:not(.pend),.vseg:not(.pend)');
      el.classList.toggle('big', empty);
      el.classList.toggle('talk', !!(ani && ani.classList.contains('talk')));
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
