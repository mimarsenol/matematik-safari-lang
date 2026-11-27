'use strict';
/* =========================================================
   Çarpım Tablosu Serisi (Zebra Çizgi) — kilit.js'ten sonra, en son yüklenir.
   - 1×1 … 10×10 arasındaki 100 olgunun her biri ayrı takip edilir (S.ct.f["7x8"]).
   - Bir olgu, 3 FARKLI GÜNDE hızlı (≤ 5 sn) ve doğru cevaplanınca "öğrenildi" sayılır.
   - Aralıklı tekrar: hızlı doğru → kutu bir üst basamağa (1-2-4-7-14 gün sonra tekrar);
     yavaş doğru → ertesi gün; yanlış → kutu sıfırlanır, aynı turda 3 soru sonra yeniden sorulur.
     Zorlanılan ve vakti gelen olgular soru seçiminde daha ağır basar.
   - Seviyeler: ×1 … ×10 tabloları (sırayla açılır), sonra karışık "Ustalık Turu" ve "Bugünün tekrarı".
   - 10×10 ilerleme ızgarası: öğrenildi / öğreniliyor / zorlanıyor / hiç görülmedi.
   - 100 olgunun hepsi öğrenilince rozet + kutlama. Ebeveyn panelinde zorlanılan olgular listelenir.
   - Veri S içinde durduğu için yerel kayıt ve bulut hesabıyla (hesap.js) kendiliğinden senkronlanır.
   - Tur sonu app.js'teki finish() zincirinden geçer: puan, seri, günlük hedef, gelişim grafiği,
     haftalık liderlik ve çalışma kilidi turu diğer konulardaki gibi sayılır.
   ========================================================= */
(function () {
  const FAST = 5000;                 // ms: bu sürenin altında doğru = hızlı
  const DAYS_NEEDED = 3;             // öğrenildi sayılması için gereken farklı gün
  const INT = [0, 1, 2, 4, 7, 14];   // kutu → kaç gün sonra tekrar
  const ROUND = 12, MASTER_ROUND = 20, REVIEW_ROUND = 10;
  const ANI = '🦓', ANIMAL = T('Zebra Çizgi');
  const MASTER = 11;                 // S.ct.lv içinde Ustalık Turu'nun anahtarı

  // ---------------------------------------------------------------- veri
  const D = () => {
    if (!S.ct || typeof S.ct !== 'object') S.ct = {};
    const d = S.ct; d.f = d.f || {}; d.lv = d.lv || {}; d.tm = d.tm || {};
    return d;
  };
  const dayNum = () => { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); };
  const K = (a, b) => a + 'x' + b;
  const ALL = []; for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) ALL.push([a, b]);
  const tableFacts = k => ALL.filter(([a, b]) => a === k || b === k);
  const learnedF = f => !!f && (f.d || []).length >= DAYS_NEEDED && (f.h || 0) < 2;
  function status(f) {
    if (!f || !f.n) return 'new';
    if (learnedF(f)) return 'ok';
    if ((f.h || 0) >= 2) return 'hard';
    return 'mid';
  }
  const fact = (a, b) => D().f[K(a, b)];
  const counts = (list = ALL) => { const c = { ok: 0, mid: 0, hard: 0, new: 0 }; list.forEach(([a, b]) => c[status(fact(a, b))]++); return c; };
  const allLearned = () => ALL.every(([a, b]) => learnedF(fact(a, b)));
  const dueList = () => { const dn = dayNum(); return ALL.filter(([a, b]) => { const f = fact(a, b); return f && f.n && (f.due || 0) <= dn; }); };
  const lvStars = k => D().lv[k] || 0;
  const tableOpen = k => S.unlockAll || k === 1 || lvStars(k - 1) >= 1;
  const masterOpen = () => S.unlockAll || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every(k => lvStars(k) >= 1);

  // Bir cevabı olgunun geçmişine işle
  function record(a, b, ok, ms) {
    const d = D(), key = K(a, b), day = today(), dn = dayNum();
    const f = d.f[key] || (d.f[key] = { n: 0, c: 0, w: 0, h: 0, b: 0, d: [], due: 0, t: 0 });
    const wasLearned = learnedF(f);
    f.n++;
    const fast = ok && ms <= FAST;
    if (ok) { f.c++; f.t = Math.round(f.t ? f.t * .6 + ms * .4 : ms); }
    if (fast) {
      f.h = Math.max(0, f.h - 1);
      if (!f.d.includes(day)) { f.d.push(day); f.d = f.d.slice(-6); f.b = Math.min(5, f.b + 1); }
      f.due = dn + INT[f.b]; f.l = 'f';
    } else if (ok) {
      f.h = Math.min(6, f.h + 1); f.due = dn + 1; f.l = 's';
    } else {
      f.w++; f.h = Math.min(6, f.h + 2); f.b = 0; f.due = dn; f.l = 'w';
      // Öğrenilmiş bir olgu yanlışsa: bir gün daha hızlı doğru gerekir
      if (wasLearned) f.d = f.d.filter(x => x !== day).slice(-(DAYS_NEEDED - 1));
    }
    f.ld = day;
    return { fast, nowLearned: !wasLearned && learnedF(f) };
  }

  // Soru seçimi: vakti gelen ve zorlanılan olgular ağır basar
  function weight(a, b, dn) {
    const f = fact(a, b);
    if (!f || !f.n) return 5;
    const due = (f.due || 0) <= dn;
    if (learnedF(f)) return due ? 3 : .35;
    return 2 + (f.h || 0) * 1.5 + (due ? 2 : 0);
  }
  function pickFact(pool, recent) {
    const dn = dayNum();
    let cand = pool.filter(([a, b]) => !recent.includes(K(a, b)));
    if (!cand.length) cand = pool;
    const w = cand.map(([a, b]) => weight(a, b, dn));
    let r = Math.random() * w.reduce((x, y) => x + y, 0);
    for (let i = 0; i < cand.length; i++) { r -= w[i]; if (r <= 0) return cand[i]; }
    return cand[cand.length - 1];
  }

  // ---------------------------------------------------------------- ipuçları
  function tip(a, b) {
    const p = a * b;
    const via = [1, 10, 2, 5, 9, 4, 3].find(x => x === b || x === a);
    if (via) {
      const o = via === b ? a : b; // diğer çarpan
      if (via === 1) return T`1 ile çarpınca sayı değişmez: <b>${o} × 1 = ${o}</b>`;
      if (via === 10) return T`10 ile çarpınca sonuna 0 ekle: ${o} → <b>${o * 10}</b>`;
      if (via === 2) return T`2 ile çarpmak ikiye katlamaktır: ${o} + ${o} = <b>${p}</b>`;
      if (via === 5) return T`5 ile çarpmak, 10 ile çarpıp yarısını almaktır: ${o} × 10 = ${o * 10}, yarısı <b>${p}</b>`;
      if (via === 9) return T`9 ile çarpmak: 10 ile çarp, bir kez çıkar: ${o} × 10 − ${o} = ${o * 10} − ${o} = <b>${p}</b>`;
      if (via === 4) return T`4 ile çarpmak: iki kez ikiye katla: ${o} → ${o * 2} → <b>${p}</b>`;
      if (via === 3) return T`3 ile çarpmak: ikiye katla, bir tane daha ekle: ${o * 2} + ${o} = <b>${p}</b>`;
    }
    // 6, 7, 8 birbirleriyle: 5'ten parçala
    const big = Math.max(a, b), sm = Math.min(a, b);
    if (a === b) return T`${a} × 5 = ${a * 5}, ${a} × ${a - 5} = ${a * (a - 5)} → ${a * 5} + ${a * (a - 5)} = <b>${p}</b>`;
    return T`${sm} × ${big} = ${sm} × 5 + ${sm} × ${big - 5} = ${sm * 5} + ${sm * (big - 5)} = <b>${p}</b>`;
  }
  // a sıra, her sırada b nokta
  const dots = (a, b) => `<div class="ctdots" style="grid-template-columns:repeat(${b},${Math.min(18, Math.floor(220 / b))}px)">${'<i></i>'.repeat(a * b)}</div>`;

  // ---------------------------------------------------------------- stiller
  const css = document.createElement('style');
  css.textContent = `
  .ctban{display:flex;align-items:center;gap:12px;width:100%;background:linear-gradient(135deg,#fff 0%,#f3f0ff 100%);border-radius:22px;padding:10px 14px;box-shadow:var(--shadow);margin:4px 0 12px;text-align:left;border:3px solid #d9d0ff}
  .ctban .e{font-size:44px;line-height:1}.ctban b{font-size:19px;display:block;line-height:1.15}.ctban small{color:var(--muted);font-size:14px;display:block}
  .ctban .goal>i{background:linear-gradient(90deg,#9be7b4,var(--ok))}
  .ctgrid{display:grid;grid-template-columns:repeat(11,1fr);gap:3px;margin:8px 0;user-select:none}
  .ctgrid div,.ctgrid button{aspect-ratio:1;border-radius:6px;display:grid;place-items:center;font-size:clamp(10px,2.6vw,15px);font-weight:800;padding:0}
  .ctgrid .hd{background:none;color:var(--muted)}
  .ctgrid .c-new{background:#f1ebe0;color:#b9b0a1}
  .ctgrid .c-mid{background:#ffe48f;color:#7a5b00}
  .ctgrid .c-ok{background:var(--ok);color:#fff}
  .ctgrid .c-hard{background:var(--bad);color:#fff}
  .ctgrid.mini{grid-template-columns:repeat(10,1fr);gap:2px;max-width:220px}
  .ctgrid.mini div{border-radius:3px;font-size:0}
  .ctleg{display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center;font-size:14px;font-weight:700;color:var(--muted)}
  .ctleg i{display:inline-block;width:14px;height:14px;border-radius:4px;vertical-align:-2px;margin-right:4px}
  .ctlv{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:8px 0}
  .ctlv button{background:#fff;border-radius:16px;padding:6px 2px 4px;box-shadow:0 4px 0 var(--line);border:3px solid #fff;display:flex;flex-direction:column;align-items:center}
  .ctlv button b{font-size:22px;line-height:1.1}
  .ctlv button small{font-size:12px;letter-spacing:1px;height:16px}
  .ctlv button .goal{width:80%;height:6px;margin-top:3px}
  .ctlv button .goal>i{background:var(--ok)}
  .ctlv button.done{border-color:var(--yellow)}
  .ctlv button.next{border-color:var(--pri);animation:pulse 1.6s infinite}
  .ctlv button.locked{filter:grayscale(1);opacity:.5}
  .ctbadge{display:flex;align-items:center;gap:12px;border-radius:18px;padding:10px 14px;margin:8px 0;background:#fff8ea;border:3px dashed #e4dccd}
  .ctbadge.on{background:linear-gradient(135deg,#fff3c4,#ffe08a);border:3px solid var(--yellow)}
  .ctbadge .e{font-size:44px}.ctbadge:not(.on) .e{filter:grayscale(1);opacity:.5}
  .ctq{font-size:54px;font-weight:800;line-height:1.1;margin:6px 0;letter-spacing:1px}
  .ctspd{height:8px;background:#f1eadc;border-radius:6px;overflow:hidden;margin:4px auto 0;max-width:260px}
  .ctspd>i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#9be7b4,var(--ok));transform-origin:left}
  .ctspd.run>i{animation:ctdrain ${FAST}ms linear forwards}
  @keyframes ctdrain{to{transform:scaleX(0)}}
  .pad.ct3{grid-template-columns:repeat(3,1fr)}.pad.ct3 .go{grid-column:auto}
  .ctdots{display:grid;gap:3px;justify-content:center;margin:6px auto}
  .ctdots i{aspect-ratio:1;border-radius:50%;background:#ffb15c}
  .ctpar{background:#f6f3ff;border:3px solid #d9d0ff;border-radius:18px;padding:10px 12px;margin:10px 0}
  .ctpar ul{margin:6px 0;padding-left:20px;font-size:15px}.ctpar li{margin:2px 0}
  @media (prefers-reduced-motion:reduce){.ctspd.run>i{animation:none}.ctlv button.next{animation:none}}
  `;
  document.head.appendChild(css);

  // ---------------------------------------------------------------- ızgara
  function gridHTML(mini) {
    let h = `<div class="ctgrid${mini ? ' mini' : ''}">`;
    if (!mini) { h += '<div class="hd">×</div>'; for (let b = 1; b <= 10; b++) h += `<div class="hd">${b}</div>`; }
    for (let a = 1; a <= 10; a++) {
      if (!mini) h += `<div class="hd">${a}</div>`;
      for (let b = 1; b <= 10; b++) {
        const f = fact(a, b), st = status(f);
        h += mini ? `<div class="c-${st}"></div>` : `<button class="c-${st}" data-a="${a}" data-b="${b}" aria-label="${a} × ${b}">${st === 'new' ? '' : a * b}</button>`;
      }
    }
    return h + '</div>';
  }
  const LEGEND = () => T`<div class="ctleg"><span><i style="background:var(--ok)"></i>Öğrendim</span><span><i style="background:#ffe48f"></i>Öğreniyorum</span><span><i style="background:var(--bad)"></i>Zorlanıyorum</span><span><i style="background:#f1ebe0"></i>Henüz görmedim</span></div>`;
  const fmtS = ms => (ms / 1000).toFixed(1).replace('.', DECSEP);

  function factInfo(a, b) {
    const f = fact(a, b), st = status(f);
    const lbl = { ok: T('✅ Öğrendin!'), mid: T('🟡 Öğreniyorsun'), hard: T('🔴 Biraz zorlanıyorsun'), new: T('⚪ Henüz sorulmadı') }[st];
    const days = f ? (f.d || []).length : 0;
    openModal(T`<div class="head"><div class="big">${ANI}</div><h2>${a} × ${b} = ${a * b}</h2><p><b>${lbl}</b></p>
      ${f && f.n ? T`<p class="muted">${f.c} doğru · ${f.w} yanlış${f.t ? T` · ortalama ${fmtS(f.t)} sn` : ''}<br>Hızlı ve doğru bildiğin gün: ${Math.min(days, DAYS_NEEDED)}/${DAYS_NEEDED}</p>` : ''}</div>
      <div class="fb hint" style="margin-top:0"><b class="t">💡 Püf noktası</b>${tip(a, b)}</div>
      <button class="btn" onclick="closeModal()">Tamam</button>`);
  }

  // ---------------------------------------------------------------- ana ekran (seri)
  function hub() {
    stopTimer(); Q = null; closeModal(); topbar();
    const d = D(), c = counts(), due = dueList().length;
    const nextK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].find(k => tableOpen(k) && !lvStars(k));
    let lv = '';
    for (let k = 1; k <= 10; k++) {
      const tf = tableFacts(k), tc = counts(tf), st = lvStars(k), open = tableOpen(k);
      lv += `<button class="${open ? '' : 'locked'} ${st ? 'done' : ''} ${k === nextK ? 'next' : ''}" data-k="${k}"><b>×${k}</b><small>${'⭐'.repeat(st)}${'☆'.repeat(3 - st)}</small><div class="goal"><i style="width:${tc.ok / tf.length * 100}%"></i></div></button>`;
    }
    const ms = lvStars(MASTER), mo = masterOpen();
    view.innerHTML = T`<div class="mascot"><div class="ani hop">${ANI}</div><div class="say"><b>${ANIMAL}</b>: ${allLearned() ? T('Sen artık bir çarpım tablosu ustasısın! Arada bir tekrar etmeyi unutma.') : c.ok ? T`Harika gidiyorsun! ${c.ok} olguyu öğrendin. Bir olgu, 3 farklı günde hızlı ve doğru bilince öğrenilmiş sayılır.` : T('Merhaba! Benim çizgilerim bir çarpım tablosu gibi. Her olguyu 3 farklı günde hızlı ve doğru bilince öğrenmiş olacaksın!')}</div></div>
      <div class="card" style="padding:12px 14px"><h2 style="margin:0">✖️ Çarpım Tablosu</h2>
        <p class="muted" style="margin:2px 0">${c.ok}/100 olgu öğrenildi${c.hard ? T` · ${c.hard} zorlanılan` : ''}</p>
        <div class="goal"><i style="width:${c.ok}%;background:linear-gradient(90deg,#9be7b4,var(--ok))"></i></div>
        <div class="ctlv">${lv}</div>
        <button class="btn ${mo ? '' : 'ghost'}" id="ctM" ${mo ? '' : 'disabled'}>👑 Ustalık Turu (karışık) ${ms ? '⭐'.repeat(ms) : ''}${mo ? '' : T(' · tüm tablolarda 1⭐ gerekli')}</button>
        ${due >= 3 ? T`<button class="btn blue" id="ctR">🔁 Bugünün tekrarı (${due} olgu)</button>` : ''}
      </div>
      <div class="card" style="padding:12px 10px"><h3 style="margin:0 4px">🗺️ İlerleme ızgaram</h3><p class="muted" style="margin:0 4px;font-size:14px">Bir kareye dokun: o olgunun durumu ve püf noktası</p>
        ${gridHTML(false)}${LEGEND()}</div>
      <div class="ctbadge ${d.badge ? 'on' : ''}"><div class="e">🏅</div><div>${d.badge ? T`<b>Çarpım Tablosu Ustası!</b><br><span class="muted" style="font-size:14px">100 olgunun hepsini öğrendin (${esc(d.badge)})</span>` : T`<b>Çarpım Tablosu Ustası rozeti</b><br><span class="muted" style="font-size:14px">100 olgunun hepsini öğrenince bu rozet senin! Kalan: ${100 - c.ok}</span>`}</div></div>
      <button class="btn ghost" id="ctH">🗺️ Haritaya dön</button>`;
    view.querySelectorAll('.ctlv button').forEach(b => b.onclick = () => {
      sndTap(); const k = +b.dataset.k;
      if (!tableOpen(k)) { openModal(T`<div class="head"><div class="big">🔒</div><h2>×${k} tablosu</h2><p>Bu tabloyu açmak için önce <b>×${k - 1}</b> tablosundan en az 1 ⭐ kazan.</p></div><button class="btn" onclick="closeModal()">Tamam</button>`); return; }
      levelSheet(k);
    });
    view.querySelectorAll('.ctgrid button').forEach(b => b.onclick = () => { sndTap(); factInfo(+b.dataset.a, +b.dataset.b); });
    if (mo) $('ctM').onclick = () => { sndTap(); start({ kind: 'master' }); };
    if ($('ctR')) $('ctR').onclick = () => { sndTap(); start({ kind: 'review' }); };
    $('ctH').onclick = home;
    window.scrollTo(0, 0);
  }
  window.carpimTablosu = hub;

  function levelSheet(k) {
    const tf = tableFacts(k), tc = counts(tf), st = lvStars(k);
    const row = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `${k} × ${n} = ${k * n}`);
    openModal(T`<div class="head"><div class="big">${ANI}</div><h2>×${k} tablosu</h2>
      <div style="font-size:26px">${'⭐'.repeat(st)}${'☆'.repeat(3 - st)}</div>
      <p class="muted">${tc.ok}/${tf.length} olgu öğrenildi${tc.hard ? T` · ${tc.hard} zorlanılan` : ''}</p></div>
      <details style="margin:4px 0 8px"><summary style="cursor:pointer;font-weight:700">📖 Tabloya göz at</summary><div class="fb hint" style="columns:2;font-size:17px;margin-top:6px">${row.join('<br>')}</div><div class="fb hint" style="margin-top:6px"><b class="t">💡 Püf noktası</b>${tip(k, k === 1 ? 7 : k === 10 ? 4 : 6)}</div></details>
      <button class="btn green" id="ctGo">✏️ Başla (${ROUND} soru)</button>
      <button class="btn ghost" onclick="closeModal()">Kapat</button>`);
    $('ctGo').onclick = () => { closeModal(); start({ kind: 'table', k }); };
  }

  // ---------------------------------------------------------------- soru turu
  let C = null; // aktif tur
  function start(o) {
    stopTimer(); closeModal();
    let pool, total;
    if (o.kind === 'table') { pool = tableFacts(o.k); total = ROUND; }
    else if (o.kind === 'review') { pool = dueList(); total = Math.min(REVIEW_ROUND, Math.max(pool.length, 5)); if (!pool.length) return hub(); }
    else { pool = ALL; total = MASTER_ROUND; }
    C = { ...o, pool, total, n: 0, correct: 0, fast: 0, xp: 0, recent: [], again: [], wrongs: [], learnedNow: [], cur: null };
    Q = { ct: true }; // diğer modüller "tur sürüyor" bilsin (bulut yüklemesi haritaya atmasın)
    C.q = Q;
    next();
  }
  function next() {
    if (!C || Q !== C.q) return;
    if (C.n >= C.total) return end();
    // Aynı turda yanlış/yavaş olanların sırası geldiyse önce onlar
    let ab = null;
    const i = C.again.findIndex(x => x.at <= C.n);
    if (i >= 0) ab = C.again.splice(i, 1)[0].f;
    if (!ab) ab = pickFact(C.pool, C.recent);
    let [a, b] = ab;
    C.recent = [K(a, b), ...C.recent].slice(0, Math.min(3, C.pool.length - 1));
    C.cur = { a, b, input: '', done: false, t0: 0, hidden: false };
    render();
  }
  function labelOf(c) {
    if (c.kind === 'table') return T`×${c.k} tablosu`;
    if (c.kind === 'review') return T('Bugünün tekrarı');
    return T('Ustalık Turu');
  }
  function render() {
    const q = C.cur;
    view.innerHTML = `<div class="qtop"><button class="chip" id="qx" style="font-size:20px">✖</button><div class="bar"><i style="width:${C.n / C.total * 100}%"></i></div><div class="chip">${C.n + 1}/${C.total}</div></div>
      <div class="mascot"><div class="ani" id="ani">${ANI}</div><div class="say" id="say"><b>${labelOf(C)}</b> · ${C.n === 0 ? T('Hızlı ve doğru! Yeşil çubuk bitmeden cevapla ⚡') : pick([T('Sen yaparsın!'), T('Hadi bakalım!'), T('Düşün ve yaz 🧠'), T('Çizgi çizgi, adım adım!')])}</div></div>
      <div class="qcard" id="qc"><div class="ctq">${q.a} × ${q.b} = ?</div>
        <div class="ctspd" id="spd"><i></i></div>
        <div class="ansbox empty" id="ab">?</div>
        <div class="pad ct3" id="pad">${['7', '8', '9', '4', '5', '6', '1', '2', '3', '⌫', '0', 'OK'].map(k => `<button data-k="${k}" class="${k === 'OK' ? 'go' : k === '⌫' ? 'del' : ''}">${k === 'OK' ? '✔' : k}</button>`).join('')}</div>
        <div class="tools"><button class="btn ghost" id="idk" style="font-size:17px;padding:10px">🤔 Bilmiyorum</button></div>
        <div id="fbx"></div></div>`;
    $('qx').onclick = quit;
    view.querySelectorAll('#pad button').forEach(b => b.onclick = () => press(b.dataset.k));
    $('idk').onclick = () => answer(false, true);
    // süre, ekran çizildikten sonra başlasın
    q.t0 = performance.now();
    requestAnimationFrame(() => { if (!C || C.cur !== q || q.done) return; const s = $('spd'); s && s.classList.add('run'); });
  }
  function quit() {
    if (!C || C.n === 0) { C = null; return hub(); }
    openModal(T`<div class="head"><div class="big">🥺</div><h2>Çıkmak istiyor musun?</h2><p>Bu turun yıldızları kaydedilmeyecek. Cevapladığın olgular ise kaydedildi.</p></div><div class="row"><button class="btn ghost" onclick="closeModal()">Devam et</button><button class="btn" id="ctQ">Çık</button></div>`);
    $('ctQ').onclick = () => { C = null; Q = null; hub(); };
  }
  function press(k) {
    const q = C && C.cur; if (!q || q.done || Q !== C.q) return;
    sndTap();
    if (k === 'OK') return submit();
    if (k === '⌫') q.input = q.input.slice(0, -1);
    else if (q.input.length < 3) q.input += k;
    const ab = $('ab'); ab.className = 'ansbox' + (q.input ? '' : ' empty'); ab.textContent = q.input || '?';
  }
  function submit() {
    const q = C.cur;
    if (!q.input) { $('say').textContent = T('Önce bir cevap yaz 🙂'); return; }
    answer(+q.input === q.a * q.b, false);
  }
  function answer(ok, idk) {
    const q = C.cur; if (!q || q.done) return;
    q.done = true;
    let ms = q.t0 ? performance.now() - q.t0 : FAST * 2;
    if (q.hidden) ms = Math.max(ms, FAST + 1);    // başka uygulamaya geçildiyse hızlı sayma
    const r = record(q.a, q.b, ok, ms);
    const spd = $('spd'); if (spd) { const i = spd.firstElementChild, w = getComputedStyle(i).transform; spd.classList.remove('run'); i.style.transform = w === 'none' ? '' : w; }
    $('pad').style.display = 'none'; $('idk').parentNode.style.display = 'none';
    if (r.nowLearned) C.learnedNow.push(K(q.a, q.b));
    if (ok) {
      C.correct++;
      const gain = r.fast ? 10 : 6; C.xp += gain; if (r.fast) C.fast++;
      $('ab').className = 'ansbox ok'; sndOk(); hop(); floatText('+' + gain + ' ⭐');
      if (!r.fast) C.again.push({ at: C.n + 5, f: [q.a, q.b] });
      $('say').textContent = r.nowLearned ? T`🎉 ${q.a} × ${q.b} artık öğrenildi!` : r.fast ? pick(PRAISE) : T('Doğru! Biraz daha hızlı olabilirsin 🐢→⚡');
      $('fbx').innerHTML = r.fast ? `<div class="fb ok" style="text-align:center"><b>⚡ ${fmtS(ms)} ${T('sn')}</b></div>`
        : T`<div class="fb hint"><b class="t">✅ Doğru · 🐢 ${fmtS(ms)} sn</b>Hızlanmak için: ${tip(q.a, q.b)}</div>`;
      setTimeout(() => { if (C && C.cur === q && Q === C.q) { C.n++; next(); } }, r.fast ? 650 : 1800);
      save();
      return;
    }
    C.wrongs.push(K(q.a, q.b));
    C.again.push({ at: C.n + 3, f: [q.a, q.b] });
    if (!idk) { $('ab').className = 'ansbox bad'; sndBad(); $('qc').classList.remove('shake'); void $('qc').offsetWidth; $('qc').classList.add('shake'); }
    else { $('ab').className = 'ansbox'; $('ab').textContent = q.a * q.b; }
    $('say').textContent = T('Sorun değil, birlikte bakalım 👇 Bu soru birazdan tekrar gelecek.');
    $('fbx').innerHTML = T`<div class="fb bad"><b class="t">${q.a} × ${q.b} = ${q.a * q.b}</b>${tip(q.a, q.b)}
      ${q.a * q.b <= 60 ? T`<div class="muted" style="font-size:15px;margin-top:6px">${q.a} sıra, her sırada ${q.b} nokta:</div>${dots(q.a, q.b)}` : ''}</div>
      <button class="btn" id="nx">Anladım, devam ▶</button>`;
    $('nx').onclick = () => { C.n++; next(); };
    setTimeout(() => { const n = $('nx'); n && n.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
    save();
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && C && C.cur && !C.cur.done) C.cur.hidden = true; });
  document.addEventListener('keydown', e => {
    if (!C || !C.cur || Q !== C.q || !$('modal').classList.contains('hidden')) return;
    const q = C.cur;
    if (q.done) { if (e.key === 'Enter') { const n = $('nx'); if (n) n.click(); } return; }
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('⌫');
    else if (e.key === 'Enter') press('OK');
  });

  // ---------------------------------------------------------------- tur sonu
  function end() {
    const c = C;
    // app.js finish() zinciri: puan, seri, günlük hedef, gelişim, haftalık liste, çalışma kilidi
    Q = { ti: -1, mode: 'ct', ct: c, n: c.total, total: c.total, correct: c.correct, first: c.fast, pts: 0, xp: c.xp, time: 0, cur: null };
    C = null;
    finish();
  }
  const _finish = finish;
  finish = function () {
    const c = Q && Q.mode === 'ct' ? Q.ct : null;
    const r = _finish.apply(this, arguments);
    if (c) result(c);
    return r;
  };
  function result(c) {
    const d = D(), acc = c.correct / c.total, fr = c.fast / c.total;
    const stars = acc >= .9 && fr >= .6 ? 3 : acc >= .8 ? 2 : acc >= .6 ? 1 : 0;
    const key = c.kind === 'table' ? c.k : c.kind === 'master' ? MASTER : null;
    let unlocked = null, tableDone = null, badgeNow = false;
    if (key) {
      const old = d.lv[key] || 0;
      if (stars > old) { d.lv[key] = stars; if (!old && stars && c.kind === 'table' && c.k < 10) unlocked = c.k + 1; }
    }
    for (let k = 1; k <= 10; k++) if (!d.tm[k] && tableFacts(k).every(([a, b]) => learnedF(fact(a, b)))) { d.tm[k] = today(); tableDone = k; }
    if (!d.badge && allLearned()) { d.badge = new Date().toLocaleDateString(LOCALE); badgeNow = true; }
    save();
    const cnt = counts();
    const msg = stars === 3 ? T('Şimşek gibisin! Hem doğru hem hızlı ⚡') : stars === 2 ? T('Çok iyi! Biraz daha hızlanınca 3 yıldız senin!') : stars === 1 ? T('Güzel! Tekrar ettikçe hızlanacaksın.') : T('Yıldız yok ama öğreniyorsun! Yanlış yaptığın olgular daha sık gelecek.');
    const wr = [...new Set(c.wrongs)].map(x => x.replace('x', ' × ') + ' = ' + x.split('x').reduce((p, v) => p * v, 1));
    let h = T`<div class="card res"><div style="font-size:64px">${ANI}</div><h2>${labelOf(c)}</h2>
      <div class="stars">${[0, 1, 2].map(k => `<span>${k < stars ? '⭐' : '☆'}</span>`).join('')}</div><p>${msg}</p>
      <div class="stat"><div><b>${c.correct}/${c.total}</b>doğru</div><div><b>${c.fast}</b>⚡ hızlı</div><div><b>+${c.xp}</b>⭐ puan</div></div>
      ${c.learnedNow.length ? T`<p>🎉 Bu turda <b>${c.learnedNow.length}</b> olgu "öğrenildi" oldu!</p>` : ''}
      ${wr.length ? T`<p class="muted" style="font-size:16px">Tekrar edelim: <b>${wr.slice(0, 6).join(' · ')}</b></p>` : ''}
      ${gridHTML(true).replace('class="ctgrid mini"', 'class="ctgrid mini" style="margin:8px auto"')}<p class="muted" style="font-size:14px;margin:0">${cnt.ok}/100 olgu öğrenildi</p></div>`;
    if (unlocked) h += T`<div class="card res"><h2>🔓 ×${unlocked} tablosu açıldı!</h2></div>`;
    if (tableDone) h += T`<div class="card res"><div style="font-size:48px">🏆</div><h2>×${tableDone} tablosunu tamamen öğrendin!</h2></div>`;
    if (S.day.rounds === GOAL) h += T`<div class="card res"><h2>🎯 Günlük hedef tamam!</h2><p>${streakNow()} gündür serin devam ediyor 🔥</p></div>`;
    h += T`<div class="row"><button class="btn ghost" id="rH">✖️ Çarpım Tablosu</button><button class="btn" id="rA">🔁 Tekrar</button></div>`;
    if (unlocked) h += T`<button class="btn green" id="rN">Sıradaki: ×${unlocked} tablosu ▶</button>`;
    view.innerHTML = h; window.scrollTo(0, 0);
    $('rH').onclick = hub;
    $('rA').onclick = () => start(c.kind === 'table' ? { kind: 'table', k: c.k } : { kind: c.kind });
    if ($('rN')) $('rN').onclick = () => start({ kind: 'table', k: unlocked });
    if (stars >= 2 || tableDone) { sndWin(); confetti(['✖️', '⭐', ANI, '⚡']); } else if (stars) sndOk();
    if (badgeNow) setTimeout(celebrate, 900);
  }
  function celebrate() {
    sndWin(); confetti(['🏅', '🎉', ANI, '⭐', '✖️']); setTimeout(() => confetti(['🏅', '🎉', '🌟']), 900);
    openModal(T`<div class="head"><div class="big" style="font-size:90px">🏅</div><h2>Çarpım Tablosu Ustası!</h2>
      <p>Tebrikler ${esc(S.name)}! 1 × 1'den 10 × 10'a kadar <b>100 olgunun hepsini</b> öğrendin. Her birini 3 farklı günde hızlı ve doğru bildin!</p>
      <p class="muted">${ANIMAL}: Arada bir Ustalık Turu yaparak bu bilgiyi taze tut. 🦓</p></div>
      <button class="btn share" id="ctSh">📤 Rozetimi paylaş</button><button class="btn" onclick="closeModal()">Yaşasın! 🎉</button>`);
    $('ctSh').onclick = () => window.paylas && window.paylas(T('Matematik Safarisi\'nde çarpım tablosunun 100 olgusunun hepsini öğrendim! 🏅'),
      { emoji: '🏅🦓', title: T('Çarpım Tablosu Ustası'), lines: [T('100/100 olgu öğrenildi'), T('1 × 1 … 10 × 10')] });
  }

  // ---------------------------------------------------------------- girişler: harita, çarpma konusu, ebeveyn paneli
  const _home = home;
  home = function () {
    C = null;
    _home.apply(this, arguments);
    if ($('ctBan')) return;
    const hello = view.querySelector('.hello'); if (!hello) return;
    const c = counts(), d = D();
    hello.insertAdjacentHTML('afterend', T`<button class="ctban" id="ctBan"><div class="e">${d.badge ? '🏅' : ANI}</div><div style="flex:1"><b>✖️ Çarpım Tablosu Serisi</b><small>${ANIMAL} ile 1 × 1'den 10 × 10'a · ${c.ok}/100 öğrenildi${c.hard ? T` · ${c.hard} zorlanılan` : ''}</small><div class="goal"><i style="width:${c.ok}%"></i></div></div><span style="font-size:26px">▶</span></button>`);
    $('ctBan').onclick = () => { sndTap(); hub(); };
  };
  const _topicSheet = topicSheet;
  topicSheet = function (i) {
    _topicSheet.apply(this, arguments);
    if (!TOPICS[i] || TOPICS[i].id !== 'carp' || !unlocked(i)) return;
    const b = $('tL'); if (!b) return;
    b.insertAdjacentHTML('beforebegin', T`<button class="btn" id="tCT" style="background:#7b61ff;box-shadow:0 5px 0 #5a43d6">${ANI} Çarpım Tablosu Serisi (1–10)</button>`);
    $('tCT').onclick = () => { closeModal(); hub(); };
  };
  const _settings = settings;
  settings = function () {
    _settings.apply(this, arguments);
    const tbl = document.querySelector('#sheet table.st'); if (!tbl) return;
    const c = counts();
    const hard = ALL.map(([a, b]) => ({ a, b, f: fact(a, b) })).filter(x => status(x.f) === 'hard')
      .sort((x, y) => (y.f.h - x.f.h) || (y.f.w - x.f.w) || ((y.f.t || 0) - (x.f.t || 0)));
    const slow = ALL.map(([a, b]) => ({ a, b, f: fact(a, b) })).filter(x => status(x.f) === 'mid' && x.f.l === 's').length;
    tbl.insertAdjacentHTML('beforebegin', T`<div class="ctpar"><b>${ANI} Çarpım tablosu</b>
      <p style="margin:4px 0;font-size:15px">Öğrenildi: <b>${c.ok}/100</b> · Öğreniliyor: <b>${c.mid}</b> · Zorlanılan: <b>${c.hard}</b> · Hiç görülmedi: <b>${c.new}</b>${D().badge ? T` · 🏅 Rozet: ${esc(D().badge)}` : ''}</p>
      ${gridHTML(true)}
      <p class="muted" style="font-size:13px;margin:4px 0">Bir olgu, ${DAYS_NEEDED} farklı günde ${FAST / 1000} saniyeden kısa sürede doğru cevaplanınca "öğrenildi" sayılır. Yanlış ya da yavaş cevaplananlar daha sık sorulur.</p>
      <b style="font-size:15px">Zorlanılan olgular</b>
      ${hard.length ? `<ul>${hard.slice(0, 15).map(x => T`<li><b>${x.a} × ${x.b} = ${x.a * x.b}</b> — ${x.f.c} doğru / ${x.f.w} yanlış${x.f.t ? T` · ort. ${fmtS(x.f.t)} sn` : ''}</li>`).join('')}</ul>${hard.length > 15 ? T`<p class="muted" style="font-size:13px;margin:0">… ve ${hard.length - 15} olgu daha</p>` : ''}`
        : `<p class="muted" style="font-size:14px;margin:4px 0">${c.ok + c.mid ? T('Şu anda zorlandığı bir olgu yok 🎉') : T('Henüz çarpım tablosu çalışılmadı.')}</p>`}
      ${slow ? T`<p class="muted" style="font-size:13px;margin:0">${slow} olguyu doğru ama yavaş cevaplıyor.</p>` : ''}
      <button class="btn" id="sCT" style="margin:8px 0 0;font-size:17px;padding:10px;background:#7b61ff;box-shadow:0 5px 0 #5a43d6">✖️ Çarpım tablosu ekranını aç</button></div>`);
    $('sCT').onclick = () => { closeModal(); hub(); };
  };
  $('btnSet') && ($('btnSet').onclick = settings);

  if (view.querySelector('.region')) home();
})();
