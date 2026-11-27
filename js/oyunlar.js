'use strict';
/* =========================================================
   Oyun Parkı — carpim.js'ten sonra, en son yüklenir.
   Dört kısa matematik oyunu, her biri bir hayvan rehberle:
   - 🐷 Balon Patlatma (Pembiş): soru üstte, cevaplı balonlar yükselir; doğru balona dokun. 3 can, 12 soru.
   - 🐎 60 Saniye Koşu (Tay Rüzgar): 60 saniyede olabildiğince çok doğru; art arda doğrular ×2, ×3 bonus.
   - 🦗 Sayı Doğrusu (Çekirge Zıpzıp): çekirgeyi doğru noktaya zıplat ya da nerede olduğunu bul.
   - 🦁🐯 Düello: aynı telefonda iki kişi karşılıklı; herkes kendi seviyesinde, 10 doğruya ilk ulaşan kazanır.
   - Seviyeler: 🌱 1–2, 🌿 3–4, 🌳 5–6, 🏔️ 7–8. sınıf. Seçim ve rekorlar S.oy içinde (bulutla senkronlanır).
   - Tur sonu app.js'teki finish() zincirinden geçer: puan, seri, günlük hedef, gelişim, haftalık liste,
     çalışma kilidi diğer turlar gibi sayılır. (Düelloda yalnızca cihaz sahibinin — alttaki oyuncunun — puanı sayılır.)
   - Metinler şimdilik Türkçe; çevirileri gelene kadar sadece Türkçe sayfada görünür.
   ========================================================= */
(function () {
  if (typeof LANG !== 'undefined' && LANG !== 'tr') return;

  const LV = [null,
    { e: '🌱', n: T('1–2. sınıf') }, { e: '🌿', n: T('3–4. sınıf') },
    { e: '🌳', n: T('5–6. sınıf') }, { e: '🏔️', n: T('7–8. sınıf') }];
  const GAMES = {
    balon: { e: '🐷', a: T('Pembiş'), n: T('Balon Patlatma'), d: T('Doğru cevaplı balonu kaçmadan patlat!'), c: '#ff7eb6' },
    kosu: { e: '🐎', a: T('Tay Rüzgar'), n: T('60 Saniye Koşu'), d: T('60 saniyede kaç doğru yapabilirsin?'), c: '#ff9f43' },
    zipla: { e: '🦗', a: T('Çekirge Zıpzıp'), n: T('Sayı Doğrusu'), d: T('Çekirgeyi doğru sayıya zıplat!'), c: '#3ccf7a' },
    duel: { e: '🦁', a: T('Aslan & Kaplan'), n: T('İki Kişilik Düello'), d: T('Aynı telefonda arkadaşınla yarış!'), c: '#3d8bff' }
  };

  // ---------------------------------------------------------------- veri
  const D = () => {
    if (!S.oy || typeof S.oy !== 'object') S.oy = {};
    const d = S.oy; d.best = d.best || {}; d.n = d.n || {}; d.duel = d.duel || {};
    if (!d.lv) d.lv = guessLv();
    return d;
  };
  // Çocuğun yıldız aldığı en yüksek sınıfa göre başlangıç seviyesi
  function guessLv() {
    let g = 0;
    TOPICS.forEach(t => { if ((S.stars[t.id] || 0) >= 1 && GRADES[t.id] > g) g = GRADES[t.id]; });
    return Math.max(1, Math.min(4, Math.ceil(g / 2) || 2));
  }
  const best = (g, lv) => (D().best[g] || {})[lv] || 0;
  function setBest(g, lv, v) { const b = D().best[g] || (D().best[g] = {}); if (v > (b[lv] || 0)) { b[lv] = v; return true; } return false; }

  // ---------------------------------------------------------------- soru üretici (seviyeye göre)
  function gen(lv) {
    let q, a, x, y;
    const r = Math.random();
    if (lv === 1) {
      if (r < .5) { x = R(1, 10); y = R(1, 10); q = `${x} + ${y}`; a = x + y; }
      else { x = R(5, 20); y = R(1, x); q = `${x} − ${y}`; a = x - y; }
    } else if (lv === 2) {
      if (r < .35) { x = R(10, 80); y = R(5, 99 - x); q = `${x} + ${y}`; a = x + y; }
      else if (r < .65) { x = R(20, 99); y = R(5, x - 5); q = `${x} − ${y}`; a = x - y; }
      else { x = pick([2, 3, 4, 5, 10]); y = R(1, 10); if (chance(.5)) [x, y] = [y, x]; q = `${x} × ${y}`; a = x * y; }
    } else if (lv === 3) {
      if (r < .45) { x = R(2, 10); y = R(2, 10); q = `${x} × ${y}`; a = x * y; }
      else if (r < .7) { y = R(2, 10); a = R(2, 10); q = `${a * y} ÷ ${y}`; }
      else if (r < .85) { x = R(100, 899); y = R(11, 99); q = `${x} + ${y}`; a = x + y; }
      else { x = R(120, 999); y = R(11, 99); q = `${x} − ${y}`; a = x - y; }
    } else {
      if (r < .3) {
        x = R(-12, 12); y = R(-12, 12); if (!y) y = -3;
        const op = pick(['+', '−', '×']);
        if (op === '×') { x = R(-9, 9) || 4; y = R(-9, 9) || -2; }
        q = `${sg(x)} ${op} ${pn(y)}`; a = op === '+' ? x + y : op === '−' ? x - y : x * y;
      } else if (r < .5) { x = R(2, 15); q = P(x, 2); a = x * x; }
      else if (r < .7) { x = R(12, 49); y = R(3, 9); q = `${x} × ${y}`; a = x * y; }
      else {
        const p = pick([10, 20, 25, 50, 75]), unit = { 10: 10, 20: 5, 25: 4, 50: 2, 75: 4 }[p];
        const base = unit * R(2, Math.floor(400 / unit / 2));
        const suf = { 10: "'u", 20: "'si", 25: "'i", 50: "'si", 75: "'i" }[p];
        q = T`${base} sayısının %${p}${suf}`; a = base * p / 100;
      }
    }
    return { q: q + ' = ?', a, neg: lv === 4 };
  }
  // Doğru cevaba yakın, karıştırılabilecek yanlış seçenekler
  function choices(a, n, neg) {
    const set = new Set([a]);
    const cand = shuffle([a + 1, a - 1, a + 2, a - 2, a + 10, a - 10, a + 5, a - 5, -a,
      +String(Math.abs(a)).split('').reverse().join('') * Math.sign(a || 1)]);
    for (const v of cand) { if (set.size >= n) break; if (v !== a && (neg || v >= 0) && Number.isFinite(v)) set.add(v); }
    while (set.size < n) { const v = a + R(-15, 15); if (neg || v >= 0) set.add(v); }
    return shuffle([...set]);
  }

  // ---------------------------------------------------------------- ortak yardımcılar
  let G = null; // aktif oyun
  const alive = g => G === g && Q === g.q;
  function begin(g) {
    stopTimer(); closeModal();
    G = g; Q = { oy: true }; g.q = Q;      // diğer modüller "tur sürüyor" bilsin (bulut yüklemesi haritaya atmasın)
    D().n[g.id] = (D().n[g.id] || 0) + 1;
  }
  // Oyun alanını ekrana tam sığdır (ekran.js küçültme yapmasın)
  function fitH(el, min) {
    view.style.zoom = ''; document.body.classList.add('focus'); window.scrollTo(0, 0);
    const extra = window.innerHeight - 18 - el.getBoundingClientRect().bottom;
    el.style.height = Math.max(min, el.offsetHeight + extra) + 'px';
  }
  // dt sınırlı döngü: sekme gizlenince oyun da durur
  function loop(g, step) {
    let last = performance.now();
    const f = now => {
      if (!alive(g)) return;
      const dt = Math.min(.1, (now - last) / 1000); last = now;
      if (step(dt) !== false) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }
  function quitAsk(g) {
    if (!g.started) { G = null; Q = null; return hub(); }
    openModal(T`<div class="head"><div class="big">🥺</div><h2>Oyundan çıkmak istiyor musun?</h2><p>Bu oyunun puanı kaydedilmeyecek.</p></div><div class="row"><button class="btn ghost" id="oyQuitNo">Devam et</button><button class="btn" id="oyQuitYes">Çık</button></div>`);
    g.paused = true;
    $('oyQuitNo').onclick = () => { closeModal(); g.paused = false; };
    $('oyQuitYes').onclick = () => { g.paused = false; G = null; Q = null; hub(); };
  }
  // Çıkış penceresi açıkken oyun durur; pencere herhangi bir yoldan kapanınca devam eder
  const isPaused = g => { if (g.paused && $('modal').classList.contains('hidden')) g.paused = false; return !!g.paused; };
  const isLong = h => h.replace(/<[^>]+>/g, '').length > 18;
  const shakeEl = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
  const lvChip = lv => `<span class="chip" style="box-shadow:none">${LV[lv].e} ${LV[lv].n}</span>`;

  // ---------------------------------------------------------------- stiller
  const css = document.createElement('style');
  css.textContent = `
  .oyban{display:flex;align-items:center;gap:12px;width:100%;background:linear-gradient(135deg,#fff 0%,#fff0f7 100%);border-radius:22px;padding:10px 14px;box-shadow:var(--shadow);margin:4px 0 12px;text-align:left;border:3px solid #ffd0e6}
  .oyban .e{font-size:30px;line-height:1.05;width:44px;text-align:center;word-break:break-all}.oyban b{font-size:19px;display:block;line-height:1.15}.oyban small{color:var(--muted);font-size:14px;display:block}
  .oylv{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:6px 0}
  .oylv button{background:#fff;border-radius:14px;padding:6px 2px;border:3px solid var(--line);font-weight:800;font-size:13px;display:flex;flex-direction:column;align-items:center;line-height:1.1}
  .oylv button b{font-size:24px;font-weight:400}
  .oylv button.on{border-color:var(--pri);background:#fff1e3}
  .oygames{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0}
  .oyg{background:#fff;border-radius:20px;padding:12px 8px 10px;box-shadow:0 5px 0 var(--line);border:3px solid var(--c);display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px}
  .oyg .e{font-size:46px;line-height:1.1}.oyg b{font-size:17px;line-height:1.15}.oyg small{font-size:13px;color:var(--muted);line-height:1.2}
  .oyg .rk{font-size:13px;font-weight:800;background:#fff8ea;border-radius:10px;padding:1px 8px;margin-top:4px}
  .oyg:active{transform:translateY(3px);box-shadow:0 2px 0 var(--line)}
  .oysay{font-size:17px;min-height:24px;text-align:center;margin:2px 0 6px;font-weight:700}
  .oyq{font-size:40px;font-weight:800;text-align:center;line-height:1.15;margin:2px 0}
  .oyq.sm{font-size:28px}
  .oyhearts{font-size:22px;letter-spacing:2px}
  /* balon */
  .oyarena{position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(180deg,#bfe6ff 0%,#e9f7ff 70%,#d8f3d0 100%);touch-action:manipulation;user-select:none;-webkit-user-select:none}
  .oyarena .cl{position:absolute;font-size:42px;opacity:.85;pointer-events:none}
  .oybal{position:absolute;left:0;bottom:0;width:78px;height:92px;border-radius:50% 50% 48% 48%/55% 55% 45% 45%;color:#fff;font-weight:800;font-size:24px;display:grid;place-items:center;
    box-shadow:inset -8px -10px 0 rgba(0,0,0,.12),inset 8px 8px 0 rgba(255,255,255,.25);border:none;padding:0;will-change:transform;text-shadow:0 2px 0 rgba(0,0,0,.18);touch-action:manipulation}
  .oybal::after{content:'';position:absolute;left:50%;top:100%;width:2px;height:34px;background:rgba(0,0,0,.25)}
  .oybal::before{content:'';position:absolute;left:calc(50% - 6px);top:calc(100% - 3px);border:6px solid transparent;border-bottom-color:inherit}
  .oybal.pop{animation:oypop .28s ease-out forwards;pointer-events:none}
  .oybal.bad{background:#9a9a9a!important;animation:oybad .5s ease-out forwards;pointer-events:none}
  .oybal.fade{transition:opacity .3s;opacity:0;pointer-events:none}
  .oybal.reveal{outline:5px solid #fff;outline-offset:3px}
  @keyframes oypop{to{transform:var(--tf) scale(1.6);opacity:0}}
  @keyframes oybad{50%{transform:var(--tf) rotate(12deg)}100%{transform:var(--tf) translateY(60px);opacity:0}}
  /* koşu */
  .oytrack{position:relative;height:58px;background:repeating-linear-gradient(90deg,#f6d9a8 0 18px,#f1cd92 18px 36px);border-radius:16px;margin:6px 0 10px;border-bottom:5px solid #d9a95f}
  .oytrack .rn{position:absolute;bottom:4px;font-size:40px;transition:left .3s ease-out;transform:translateX(-50%) scaleX(-1)}
  .oytrack .fl{position:absolute;bottom:2px;font-size:26px;transform:translateX(-50%)}
  .oych{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px}
  .oych button{background:#fff;border-radius:18px;font-size:30px;font-weight:800;padding:24px 4px;box-shadow:0 5px 0 var(--line);border:3px solid var(--line);touch-action:manipulation}
  .oych button.ok{background:var(--ok);color:#fff;border-color:var(--ok)}
  .oych button.bad{background:var(--bad);color:#fff;border-color:var(--bad)}
  .oycombo{font-weight:800;color:#e8590c}
  /* sayı doğrusu */
  .oyline{position:relative;height:150px;margin:6px 12px 0;touch-action:manipulation;cursor:pointer;user-select:none;-webkit-user-select:none}
  .oyline .ax{position:absolute;left:-8px;right:-8px;top:96px;height:5px;background:#5a4a3a;border-radius:3px}
  .oyline .tk{position:absolute;top:88px;width:3px;height:21px;background:#5a4a3a;transform:translateX(-50%);border-radius:2px}
  .oyline .tk.mj{height:31px;top:83px;width:4px}
  .oyline .lb{position:absolute;top:118px;transform:translateX(-50%);font-weight:800;font-size:17px;white-space:nowrap}
  .oyline .lb .frac{font-size:14px}
  .oyline .gh{position:absolute;top:44px;font-size:42px;transform:translateX(-50%);transition:left .45s cubic-bezier(.4,.1,.4,1);pointer-events:none;z-index:2}
  .oyline .gh span{display:inline-block}
  .oyline .gh.jump span{animation:oyjump .45s ease-in-out}
  @keyframes oyjump{50%{transform:translateY(-42px) rotate(-12deg)}}
  .oyline .tag{position:absolute;top:2px;transform:translateX(-50%);background:#fff;border-radius:10px;padding:0 8px;font-weight:800;font-size:16px;box-shadow:var(--shadow);white-space:nowrap;z-index:3}
  .oyline .tag.bad{background:#ffe3e3;color:#c92a2a}.oyline .tag.ok{background:#d3f9d8;color:#2b8a3e}
  .oyline .flag{position:absolute;top:56px;font-size:30px;transform:translateX(-10%);pointer-events:none}
  .oytarget{display:inline-block;background:#fff8ea;border:3px dashed #f3c76b;border-radius:16px;padding:2px 16px;font-size:36px;font-weight:800;margin:2px 0}
  .oytarget .frac{font-size:30px}
  /* düello */
  .oyduel{display:flex;flex-direction:column;gap:6px;touch-action:manipulation;user-select:none;-webkit-user-select:none}
  .oyhalf{flex:1;border-radius:22px;padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;position:relative;min-height:0}
  .oyhalf.p2{transform:rotate(180deg);background:#fff1d6}
  .oyhalf.p1{background:#e3f0ff}
  .oyhalf .hd{display:flex;align-items:center;gap:8px;font-weight:800;font-size:17px}
  .oyhalf .hd .e{font-size:30px}
  .oyhalf .pr{flex:1;height:14px;background:rgba(0,0,0,.08);border-radius:8px;overflow:hidden}
  .oyhalf .pr i{display:block;height:100%;background:var(--ok);transition:width .3s}
  .oyhalf .sc{font-size:22px}
  .oyhalf .oyq{font-size:34px}
  .oyhalf .bt{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .oyhalf .bt button{background:#fff;border-radius:16px;font-size:26px;font-weight:800;padding:10px 4px;box-shadow:0 4px 0 rgba(0,0,0,.1);border:3px solid #fff;touch-action:manipulation}
  .oyhalf .bt button.ok{background:var(--ok);color:#fff}
  .oyhalf .bt button.bad{background:var(--bad);color:#fff}
  .oyhalf.frozen .bt{opacity:.35;filter:grayscale(1)}
  .oyhalf .ice{position:absolute;inset:0;display:none;place-items:center;font-size:60px;pointer-events:none}
  .oyhalf.frozen .ice{display:grid}
  .oyhalf .win{position:absolute;inset:0;border-radius:22px;display:grid;place-items:center;text-align:center;font-size:30px;font-weight:800;background:rgba(255,255,255,.92);z-index:3}
  .oymid{display:flex;align-items:center;justify-content:center;gap:12px;font-weight:800}
  .oymid .chip{font-size:18px}
  .oyset{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0}
  .oyset > div{border-radius:18px;padding:10px;text-align:center}
  .oyset .oylv{grid-template-columns:1fr 1fr}
  @media (prefers-reduced-motion:reduce){.oyline .gh.jump span{animation:none}.oytrack .rn{transition:none}}
  `;
  document.head.appendChild(css);

  // ---------------------------------------------------------------- ana ekran
  function hub() {
    stopTimer(); G = null; Q = null; closeModal(); topbar();
    const d = D();
    const lvBtns = [1, 2, 3, 4].map(k => `<button class="${d.lv === k ? 'on' : ''}" data-lv="${k}"><b>${LV[k].e}</b>${LV[k].n}</button>`).join('');
    const rk = (g) => {
      if (g === 'duel') { const u = d.duel; return (u.w1 || u.w2) ? T`🏆 ${esc(S.name)} ${u.w1 || 0} – ${u.w2 || 0} ${esc(u.p2 || T('Arkadaşım'))}` : T('Henüz oynanmadı'); }
      const b = best(g, d.lv);
      return b ? (g === 'kosu' ? T`🏆 Rekor: ${b} doğru` : T`🏆 Rekor: ${b} puan`) : T('Henüz rekor yok');
    };
    view.innerHTML = T`<div class="mascot"><div class="ani hop">🎡</div><div class="say"><b>Oyun Parkı</b>: Matematikle oynamaya hazır mısın? Önce seviyeni seç, sonra bir oyuna dokun!</div></div>
      <div class="card" style="padding:12px 14px"><h2 style="margin:0">🎮 Oyun Parkı</h2>
        <p class="muted" style="margin:2px 0 0;font-size:15px">Seviye (sorular buna göre gelir):</p>
        <div class="oylv">${lvBtns}</div>
        <div class="oygames">${Object.keys(GAMES).map(g => { const x = GAMES[g];
          return `<button class="oyg" data-g="${g}" style="--c:${x.c}"><div class="e">${g === 'duel' ? '🦁🐯' : x.e}</div><b>${x.n}</b><small>${x.d}</small><span class="rk">${rk(g)}</span></button>`; }).join('')}</div>
      </div>
      <button class="btn ghost" id="oyH">🗺️ Haritaya dön</button>`;
    view.querySelectorAll('.oylv button').forEach(b => b.onclick = () => { sndTap(); D().lv = +b.dataset.lv; save(); hub(); });
    view.querySelectorAll('.oyg').forEach(b => b.onclick = () => { sndTap(); const g = b.dataset.g; ({ balon, kosu, zipla, duel: duelSetup })[g](); });
    $('oyH').onclick = home;
    window.scrollTo(0, 0);
  }
  window.oyunParki = hub;

  // ================================================================ 1) BALON PATLATMA
  const BAL_N = 12, BAL_COL = ['#ff6b8b', '#ff9f43', '#4dabf7', '#9775fa', '#20c997', '#f06595', '#fab005'];
  function balon() {
    const lv = D().lv, gm = GAMES.balon;
    const g = { id: 'balon', lv, n: 0, total: BAL_N, hearts: 3, correct: 0, score: 0, bal: [], cur: null, t: 0 };
    begin(g);
    view.innerHTML = T`<div class="qtop"><button class="chip" id="qx" style="font-size:20px">✖</button><div class="bar"><i id="oyBar" style="width:0%"></i></div><div class="chip oyhearts" id="oyHt">❤️❤️❤️</div></div>
      <div class="oysay" id="say">${gm.e} <b>${gm.a}</b>: Doğru cevaplı balonu patlat, kaçırma!</div>
      <div class="oyq" id="oyQ">…</div>
      <div class="oyarena" id="oyA" style="height:300px"><div class="cl" style="left:8%;top:6%">☁️</div><div class="cl" style="right:10%;top:22%">☁️</div></div>`;
    fitH($('oyA'), 240);
    $('qx').onclick = () => quitAsk(g);
    nextQ();
    loop(g, dt => {
      if (isPaused(g) || !g.cur || g.cur.done) return;
      g.t += dt;
      const H = $('oyA').clientHeight;
      for (const b of g.bal) {
        if (b.gone) continue;
        b.y += b.v * dt;
        const x = b.x + Math.sin(g.t * 1.6 + b.ph) * 4;
        b.tf = `translate(${x}px,${-b.y}px)`;
        b.el.style.transform = b.tf; b.el.style.setProperty('--tf', b.tf);
        if (b.y > H + 100) { b.gone = true; if (b.ok) miss(); }
      }
    });
    function nextQ() {
      if (!alive(g)) return;
      if (g.n >= g.total || g.hearts <= 0) return end();
      g.bal.forEach(b => b.el.remove()); g.bal = [];
      const q = gen(lv), n = lv === 1 ? 3 : 4, vals = choices(q.a, n, q.neg);
      g.cur = { ...q, done: false };
      $('oyQ').innerHTML = q.q; $('oyQ').classList.toggle('sm', isLong(q.q));
      const A = $('oyA'), W = A.clientWidth, H = A.clientHeight, lane = W / n, bw = Math.min(78, lane - 10);
      const dur = Math.max(3.6, [0, 8, 7.2, 6.6, 6.2][lv] * (1 - .035 * g.n));
      const cols = shuffle(BAL_COL.slice());
      vals.forEach((v, i) => {
        const el = document.createElement('button');
        el.className = 'oybal'; el.style.width = bw + 'px'; el.style.height = Math.round(bw * 1.18) + 'px'; el.textContent = sg(v); el.style.background = cols[i % cols.length]; el.style.borderBottomColor = cols[i % cols.length];
        if (String(sg(v)).length > 3) el.style.fontSize = '19px';
        const b = { el, v: (H + 100) / dur * (.85 + Math.random() * .3), y: -100 - Math.random() * 70, x: lane * i + (lane - bw) / 2 + R(-3, 3), ph: Math.random() * 6, ok: v === q.a, val: v };
        el.style.transform = `translate(${b.x}px,${-b.y}px)`;
        el.addEventListener('pointerdown', e => { e.preventDefault(); tap(b); });
        A.appendChild(el); g.bal.push(b);
      });
      g.started = g.started || g.n > 0;
    }
    function tap(b) {
      const q = g.cur; if (!q || q.done || b.gone || isPaused(g)) return;
      g.started = true;
      if (b.ok) {
        q.done = true; b.gone = true; b.el.classList.add('pop');
        const H = $('oyA').clientHeight, bonus = Math.max(0, Math.round((1 - b.y / H) * 10));
        g.correct++; g.score += 10 + bonus; sndOk(); floatText('+' + (10 + bonus));
        $('say').innerHTML = `💥 ${pick(PRAISE)}`;
        g.bal.forEach(o => { if (o !== b) o.el.classList.add('fade'); });
        g.n++; $('oyBar').style.width = g.n / g.total * 100 + '%';
        setTimeout(nextQ, 550);
      } else {
        b.gone = true; b.el.classList.add('bad'); sndBad(); shakeEl($('oyQ'));
        loseHeart(T`Hoppala! ${sg(b.val)} değil.`);
      }
    }
    function miss() {
      const q = g.cur; if (!q || q.done) return;
      q.done = true;
      g.n++; $('oyBar').style.width = g.n / g.total * 100 + '%';
      loseHeart(T`Balon kaçtı! Doğrusu: <b>${sg(q.a)}</b>`, true);
    }
    function loseHeart(msg, moveOn) {
      g.hearts--; $('oyHt').textContent = '❤️'.repeat(Math.max(0, g.hearts)) + '🤍'.repeat(3 - Math.max(0, g.hearts));
      $('say').innerHTML = `${gm.e} ${msg}`;
      if (g.hearts <= 0) {
        g.cur.done = true;
        const ok = g.bal.find(o => o.ok && !o.gone); if (ok) ok.el.classList.add('reveal');
        $('say').innerHTML = T`${gm.e} Canların bitti! Doğrusu: <b>${sg(g.cur.a)}</b>`;
        setTimeout(() => alive(g) && end(), 1300);
      } else if (moveOn) setTimeout(nextQ, 1100);
    }
    function end() {
      const rec = setBest('balon', lv, g.score);
      finishGame(g, { total: g.n || 1, correct: g.correct, xp: Math.round(g.score / 4),
        stats: T`<div><b>${g.correct}/${g.total}</b>balon</div><div><b>${g.score}</b>puan</div><div><b>${best('balon', lv)}</b>rekor</div>`,
        rec, msg: g.hearts > 0 ? T('Tüm balonları bitirdin! Harika nişancısın 🎯') : T('Canların bitti ama her oyunda daha hızlı olacaksın!'),
        again: balon });
    }
  }

  // ================================================================ 2) 60 SANİYE KOŞU
  function kosu() {
    const lv = D().lv, gm = GAMES.kosu, rec0 = best('kosu', lv), goal = Math.max(10, rec0);
    const g = { id: 'kosu', lv, time: 60, n: 0, correct: 0, streak: 0, maxStreak: 0, xp: 0, cur: null };
    begin(g);
    view.innerHTML = T`<div class="qtop"><button class="chip" id="qx" style="font-size:20px">✖</button><div class="timer" id="tm">⏱ 60</div><div class="chip">✔️ <span id="oyC">0</span></div></div>
      <div class="oytrack" id="oyT"><span class="fl" style="left:96%">${rec0 ? '🏁' : '🚩'}</span><span class="rn" id="oyR" style="left:4%">${gm.e}</span></div>
      <div class="oysay" id="say">${rec0 ? T`Rekorun ${rec0} doğru. 🏁 bayrağını geçebilir misin?` : T`${gm.a}: Hazır ol… koş! 🏃`}</div>
      <div class="qcard" id="qc" style="padding:16px 12px"><div class="oyq" id="oyQ">…</div><div class="oych" id="oyCh"></div></div>`;
    $('qx').onclick = () => quitAsk(g);
    next();
    loop(g, dt => {
      if (isPaused(g)) return;
      const before = Math.ceil(g.time);
      g.time -= dt;
      const now = Math.max(0, Math.ceil(g.time));
      if (now !== before) { const el = $('tm'); if (el) { el.textContent = '⏱ ' + now; el.classList.toggle('low', now <= 10); } }
      if (g.time <= 0) { end(); return false; }
    });
    function next() {
      if (!alive(g)) return;
      const q = gen(lv); g.cur = { ...q, done: false };
      const vals = choices(q.a, 3, q.neg);
      $('oyQ').innerHTML = q.q; $('oyQ').classList.toggle('sm', isLong(q.q));
      $('oyCh').innerHTML = vals.map(v => `<button data-v="${v}">${sg(v)}</button>`).join('');
      $('oyCh').querySelectorAll('button').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); pickA(b); }));
    }
    function pickA(b) {
      const q = g.cur; if (!q || q.done || isPaused(g)) return;
      q.done = true; g.started = true; g.n++;
      const ok = +b.dataset.v === q.a;
      if (ok) {
        g.correct++; g.streak++; g.maxStreak = Math.max(g.maxStreak, g.streak);
        const mult = Math.min(3, 1 + Math.floor(g.streak / 5));
        g.xp += 3 * mult; b.classList.add('ok'); sndOk();
        $('oyC').textContent = g.correct;
        $('oyR').style.left = Math.min(96, 4 + g.correct / goal * 92) + '%';
        $('say').innerHTML = mult > 1 ? T`<span class="oycombo">🔥 ${g.streak} art arda! ×${mult} puan</span>` : (g.correct === rec0 + 1 && rec0 ? T('🏁 Rekoru geçtin! Devam!') : pick(PRAISE));
        setTimeout(next, 260);
      } else {
        g.streak = 0; b.classList.add('bad'); sndBad(); shakeEl($('qc'));
        $('oyCh').querySelectorAll('button').forEach(x => { if (+x.dataset.v === q.a) x.classList.add('ok'); });
        $('say').innerHTML = T`Doğrusu <b>${sg(q.a)}</b> 🐢 Seri sıfırlandı.`;
        setTimeout(next, 750);
      }
    }
    function end() {
      if (!alive(g)) return;
      if (g.cur) g.cur.done = true;
      const rec = setBest('kosu', lv, g.correct);
      finishGame(g, { total: g.n || 1, correct: g.correct, xp: Math.min(100, g.xp),
        stats: T`<div><b>${g.correct}</b>doğru</div><div><b>${g.maxStreak}</b>🔥 en uzun seri</div><div><b>${best('kosu', lv)}</b>rekor</div>`,
        rec, msg: rec ? T('Rüzgar gibisin! 🌬️') : rec0 ? T`Rekorun ${rec0}. Bir daha dene, geçebilirsin!` : T('Güzel koşu!'),
        again: kosu });
    }
  }

  // ================================================================ 3) SAYI DOĞRUSU (Çekirge)
  const ZP_N = 10;
  // Değerler k × U (U = n/d) biçiminde tutulur; çentikler her k'da, etiketler her `le` k'da
  function lineFor(lv) {
    const r = Math.random();
    if (lv === 1) return r < .6 ? { U: [1, 1], k0: 0, k1: 10, le: 5 } : { U: [1, 1], k0: 0, k1: 20, le: 10 };
    if (lv === 2) return r < .5 ? { U: [10, 1], k0: 0, k1: 10, le: 5 } : r < .8 ? { U: [1, 1], k0: 0, k1: 20, le: 5 } : { U: [5, 1], k0: 0, k1: 10, le: 2 };
    if (lv === 3) { const d = pick([2, 3, 4, 4, 5, 10, 10]); return { U: [1, d], k0: 0, k1: d <= 4 ? 2 * d : d, le: d, dec: d === 10, frac: true }; }
    return r < .4 ? { U: [1, 1], k0: -10, k1: 10, le: 5, neg: true } : r < .7 ? { U: [1, 2], k0: -6, k1: 6, le: 2, frac: true, neg: true } : { U: [1, 10], k0: -10, k1: 10, le: 10, dec: true, frac: true, neg: true };
  }
  function fmtK(L, k) {
    const n = k * L.U[0], d = L.U[1];
    if (d === 1) return sg(n);
    if (L.dec) return dec(n / d);
    return fracText(n, d);
  }
  function zipla() {
    const lv = D().lv, gm = GAMES.zipla;
    const g = { id: 'zipla', lv, n: 0, total: ZP_N, correct: 0, score: 0, cur: null };
    begin(g);
    next();
    function pct(L, k) { return (k - L.k0) / (L.k1 - L.k0) * 100; }
    function next() {
      if (!alive(g)) return;
      if (g.n >= g.total) return end();
      const L = lineFor(lv), mode = g.n % 3 === 2 ? 'read' : 'put';
      let t;
      do { t = R(L.k0, L.k1); } while ((L.frac && t % L.le === 0) || (!L.frac && t % L.le === 0 && chance(.8)) || (L.neg && t === 0));
      const start = mode === 'put' ? (L.neg ? L.k0 : L.k0) : t;
      g.cur = { L, t, mode, tries: 0, done: false, at: start };
      let ticks = '';
      for (let k = L.k0; k <= L.k1; k++) {
        const mj = k % L.le === 0;
        ticks += `<i class="tk${mj ? ' mj' : ''}" style="left:${pct(L, k)}%"></i>`;
        if (mj) ticks += `<span class="lb" style="left:${pct(L, k)}%">${fmtK(L, k)}</span>`;
      }
      const ask = mode === 'put' ? T`Çekirgeyi bu sayıya zıplat:<br><span class="oytarget">${fmtK(L, t)}</span>` : T`Çekirge hangi sayının üstünde?`;
      view.innerHTML = T`<div class="qtop"><button class="chip" id="qx" style="font-size:20px">✖</button><div class="bar"><i style="width:${g.n / g.total * 100}%"></i></div><div class="chip">${g.n + 1}/${g.total}</div></div>
        <div class="mascot"><div class="ani" id="ani">${gm.e}</div><div class="say" id="say">${mode === 'put' ? T('Sayı doğrusunda doğru yere dokun 👇 Çentikleri say!') : T('Çentikleri say, çekirgenin yerini bul!')}</div></div>
        <div class="qcard" id="qc" style="padding:12px 8px"><div style="text-align:center;font-size:20px;font-weight:700;line-height:1.5">${ask}</div>
          <div class="oyline" id="oyL"><div class="ax"></div>${ticks}<div class="gh" id="oyG" style="left:${pct(L, start)}%"><span>${gm.e}</span></div></div>
          ${mode === 'read' ? `<div class="oych" id="oyCh"></div>` : ''}
          <div id="fbx"></div></div>`;
      $('qx').onclick = () => quitAsk(g);
      if (mode === 'put') {
        $('oyL').addEventListener('pointerdown', e => {
          const q = g.cur; if (q.done || isPaused(g)) return;
          const r = $('oyL').getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const k = Math.max(L.k0, Math.min(L.k1, Math.round(L.k0 + x * (L.k1 - L.k0))));
          jump(k);
        });
      } else {
        const opts = new Set([t]);
        shuffle([t - 1, t + 1, t - 2, t + 2, t + L.le, t - L.le]).forEach(v => { if (opts.size < 3 && v >= L.k0 && v <= L.k1) opts.add(v); });
        $('oyCh').innerHTML = shuffle([...opts]).map(k => `<button data-k="${k}" style="font-size:26px">${fmtK(L, k)}</button>`).join('');
        $('oyCh').querySelectorAll('button').forEach(b => b.onclick = () => readPick(b));
      }
      g.started = g.started || g.n > 0;
    }
    function tag(k, cls, txt) {
      const L = g.cur.L, el = document.createElement('div');
      el.className = 'tag ' + cls; el.style.left = pct(L, k) + '%'; el.innerHTML = txt; $('oyL').appendChild(el);
    }
    function flag(k) { const el = document.createElement('div'); el.className = 'flag'; el.style.left = pct(g.cur.L, k) + '%'; el.textContent = '🚩'; $('oyL').appendChild(el); }
    function jump(k) {
      const q = g.cur, L = q.L; g.started = true;
      q.done = true; sndTap();
      $('oyL').querySelectorAll('.tag').forEach(x => x.remove());
      const gh = $('oyG'); gh.style.left = pct(L, k) + '%'; gh.classList.remove('jump'); void gh.offsetWidth; gh.classList.add('jump');
      setTimeout(() => {
        if (!alive(g) || g.cur !== q) return;
        if (k === q.t) {
          const gain = q.tries ? 5 : 10; g.score += gain; g.correct++;
          tag(k, 'ok', fmtK(L, k) + ' ✔'); sndOk(); hop(); floatText('+' + gain);
          $('say').textContent = pick(PRAISE);
          setTimeout(() => { if (alive(g) && g.cur === q) { g.n++; next(); } }, 1000);
        } else {
          q.tries++; sndBad(); shakeEl($('qc'));
          tag(k, 'bad', fmtK(L, k));
          if (q.tries < 2) {
            $('say').innerHTML = q.t > k ? T`Burası ${fmtK(L, k)}. Biraz daha <b>sağa</b> ➡️` : T`⬅️ Burası ${fmtK(L, k)}. Biraz daha <b>sola</b>`;
            q.done = false;
          } else reveal(q);
        }
      }, 470);
    }
    function readPick(b) {
      const q = g.cur; if (q.done) return; q.done = true; g.started = true;
      const k = +b.dataset.k, L = q.L;
      $('oyCh').querySelectorAll('button').forEach(x => { x.disabled = true; if (+x.dataset.k === q.t) x.classList.add('ok'); });
      if (k === q.t) {
        g.score += 10; g.correct++; sndOk(); hop(); floatText('+10');
        $('say').textContent = pick(PRAISE);
        setTimeout(() => { if (alive(g) && g.cur === q) { g.n++; next(); } }, 900);
      } else { b.classList.add('bad'); sndBad(); shakeEl($('qc')); reveal(q); }
      void L;
    }
    function reveal(q) {
      const L = q.L; q.done = true; flag(q.t);
      const left = q.t - L.k0, step = L.U[1] === 1 ? (L.U[0] === 1 ? T('1') : sg(L.U[0])) : fracText(L.U[0], L.U[1]);
      $('say').innerHTML = T`Doğru yer 🚩 <b>${fmtK(L, q.t)}</b>`;
      $('fbx').innerHTML = T`<div class="fb hint"><b class="t">💡 Nasıl bulunur?</b>Her çentik <b>${step}</b> ilerler. ${fmtK(L, L.k0)} noktasından başlayıp ${left} çentik sağa gidince <b>${fmtK(L, q.t)}</b> olur.</div>
        <button class="btn" id="nx">Anladım, devam ▶</button>`;
      $('nx').onclick = () => { g.n++; next(); };
    }
    function end() {
      const rec = setBest('zipla', lv, g.score);
      finishGame(g, { total: g.total, correct: g.correct, xp: Math.round(g.score / 2),
        stats: T`<div><b>${g.correct}/${g.total}</b>doğru</div><div><b>${g.score}</b>puan</div><div><b>${best('zipla', lv)}</b>rekor</div>`,
        rec, msg: g.correct >= 9 ? T('Sayı doğrusunun ustası oldun! 🦗') : g.correct >= 6 ? T('Çok iyi! Çentikleri saymaya devam!') : T('Her çentiğin ne kadar ilerlediğine dikkat et, bir dahakine daha iyi olacak!'),
        again: zipla });
    }
  }

  // ================================================================ 4) İKİ KİŞİLİK DÜELLO
  const DU_WIN = 10, DU_FREEZE = 1200;
  function duelSetup() {
    const u = D().duel, lv0 = D().lv;
    let l1 = u.lv1 || lv0, l2 = u.lv2 || lv0;
    const lvs = (p, cur) => [1, 2, 3, 4].map(k => `<button class="${cur === k ? 'on' : ''}" data-p="${p}" data-lv="${k}"><b>${LV[k].e}</b>${LV[k].n}</button>`).join('');
    const draw = () => {
      openModal(T`<div class="head"><div class="big">🦁⚔️🐯</div><h2>İki Kişilik Düello</h2>
        <p class="muted" style="font-size:15px">Telefonu aranıza masaya koyun. Herkes kendi tarafındaki soruları çözer; <b>${DU_WIN} doğruya</b> ilk ulaşan kazanır. Yanlış cevap 1 saniye dondurur ❄️</p></div>
        <div class="oyset">
          <div style="background:#e3f0ff"><div style="font-size:34px">🦁</div><b>${esc(S.name)}</b><div class="oylv">${lvs(1, l1)}</div></div>
          <div style="background:#fff1d6"><div style="font-size:34px">🐯</div><input class="txt" id="oyP2" value="${esc(u.p2 || T('Arkadaşım'))}" maxlength="14" style="margin:2px 0 4px;padding:6px;font-size:16px;text-align:center"><div class="oylv">${lvs(2, l2)}</div></div>
        </div>
        <p class="muted" style="font-size:13px;margin:0 0 6px">Kardeşler farklı yaşta mı? Herkes kendi seviyesini seçsin, yarış adil olsun.</p>
        <button class="btn green" id="oyGo">⚔️ Başla!</button><button class="btn ghost" onclick="closeModal()">Kapat</button>`);
      document.querySelectorAll('.oyset .oylv button').forEach(b => b.onclick = () => {
        sndTap(); const nm = $('oyP2').value;
        if (b.dataset.p === '1') l1 = +b.dataset.lv; else l2 = +b.dataset.lv;
        u.p2 = nm; draw();
      });
      $('oyGo').onclick = () => { u.p2 = ($('oyP2').value.trim() || T('Arkadaşım')); u.lv1 = l1; u.lv2 = l2; save(); closeModal(); duel(l1, l2, u.p2); };
    };
    draw();
  }
  function duel(l1, l2, p2name) {
    const g = { id: 'duel', lv: l1, over: false, P: [
      { k: 1, lv: l1, name: S.name, e: '🦁', sc: 0, n: 0, frozen: 0, cur: null },
      { k: 2, lv: l2, name: p2name, e: '🐯', sc: 0, n: 0, frozen: 0, cur: null }] };
    begin(g);
    const half = p => `<div class="oyhalf p${p.k}" id="oyH${p.k}">
        <div class="hd"><span class="e">${p.e}</span><span style="max-width:34%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.name)}</span><div class="pr"><i id="oyPr${p.k}" style="width:0%"></i></div><span class="sc" id="oySc${p.k}">0</span></div>
        <div class="oyq" id="oyQ${p.k}">…</div>
        <div class="bt" id="oyB${p.k}"></div><div class="ice">❄️</div></div>`;
    view.innerHTML = `<div class="qtop" style="display:none"></div><div class="oyduel" id="oyD" style="height:560px">${half(g.P[1])}
      <div class="oymid"><button class="chip" id="qx" style="font-size:18px">✖</button><span class="chip">🦁 <span id="oyM1">0</span> – <span id="oyM2">0</span> 🐯</span></div>
      ${half(g.P[0])}</div>`;
    fitH($('oyD'), 420);
    $('qx').onclick = () => quitAsk(g);
    g.P.forEach(ask);
    function ask(p) {
      if (!alive(g) || g.over) return;
      const q = gen(p.lv); p.cur = { ...q, done: false };
      const Qe = $('oyQ' + p.k); Qe.innerHTML = q.q; Qe.style.fontSize = isLong(q.q) ? '24px' : '';
      $('oyB' + p.k).innerHTML = choices(q.a, 4, q.neg).map(v => `<button data-v="${v}">${sg(v)}</button>`).join('');
      $('oyB' + p.k).querySelectorAll('button').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); tap(p, b); }));
    }
    function tap(p, b) {
      const q = p.cur; if (!q || q.done || g.over || isPaused(g) || p.frozen > performance.now()) return;
      g.started = true; p.n++;
      if (+b.dataset.v === q.a) {
        q.done = true; p.sc++; b.classList.add('ok'); sndOk();
        $('oySc' + p.k).textContent = p.sc; $('oyM' + p.k).textContent = p.sc; $('oyPr' + p.k).style.width = p.sc / DU_WIN * 100 + '%';
        if (p.sc >= DU_WIN) return win(p);
        setTimeout(() => ask(p), 280);
      } else {
        b.classList.add('bad'); sndBad();
        p.frozen = performance.now() + DU_FREEZE;
        const h = $('oyH' + p.k); h.classList.add('frozen');
        setTimeout(() => { if (!alive(g)) return; h.classList.remove('frozen'); if (!g.over) ask(p); }, DU_FREEZE);
        q.done = true;
      }
    }
    function win(p) {
      g.over = true;
      const o = g.P.find(x => x !== p);
      const u = D().duel; if (p.k === 1) u.w1 = (u.w1 || 0) + 1; else u.w2 = (u.w2 || 0) + 1;
      $('oyH' + p.k).insertAdjacentHTML('beforeend', T`<div class="win"><div>🏆<br>Kazandın ${esc(p.name)}!</div></div>`);
      $('oyH' + o.k).insertAdjacentHTML('beforeend', T`<div class="win"><div>👏<br>Az kaldı ${esc(o.name)}!<br><small style="font-size:18px">${o.sc}/${DU_WIN}</small></div></div>`);
      sndWin(); confetti(['🏆', p.e, '⭐', '🎉']);
      setTimeout(() => {
        if (!alive(g)) return;
        const me = g.P[0];
        finishGame(g, { total: me.n || 1, correct: me.sc, xp: me.sc * 3 + (p.k === 1 ? 10 : 0),
          title: T`🏆 ${esc(p.name)} kazandı!`,
          emoji: p.e,
          stats: T`<div><b>${g.P[0].sc}</b>🦁 ${esc(g.P[0].name)}</div><div><b>${g.P[1].sc}</b>🐯 ${esc(g.P[1].name)}</div><div><b>${u.w1 || 0} – ${u.w2 || 0}</b>toplam galibiyet</div>`,
          msg: p.k === 1 ? T('Müthiş bir yarıştı! Rövanş ister misiniz?') : T`${esc(p.name)} bu sefer hızlıydı. Rövanş zamanı!`,
          again: () => duel(l1, l2, p2name), againLabel: T('⚔️ Rövanş') });
      }, 1700);
    }
  }

  // ---------------------------------------------------------------- tur sonu (finish zinciri)
  function finishGame(g, r) {
    const gm = GAMES[g.id];
    Q = { ti: -1, mode: 'oyun', oy: { g, r, gm }, n: r.total, total: r.total, correct: r.correct, first: r.correct, pts: 0, xp: r.xp, time: 0, cur: null };
    G = null;
    finish();
  }
  const _finish = finish;
  finish = function () {
    const o = Q && Q.mode === 'oyun' ? Q.oy : null;
    const res = _finish.apply(this, arguments);
    if (o) result(o);
    return res;
  };
  function result({ g, r, gm }) {
    save(); topbar();
    let h = T`<div class="card res"><div style="font-size:64px">${r.emoji || gm.e}</div><h2>${r.title || gm.n}</h2>
      ${g.id !== 'duel' ? `<div style="margin:-4px 0 6px">${lvChip(g.lv)}</div>` : ''}
      <p>${r.msg}</p>
      <div class="stat">${r.stats}</div>
      ${r.rec ? T('<p>🏆 <b>Yeni rekor!</b></p>') : ''}
      <p class="muted" style="font-size:15px;margin:4px 0 0">+${r.xp} ⭐ puan kazandın</p></div>`;
    if (S.day.rounds === GOAL) h += T`<div class="card res"><h2>🎯 Günlük hedef tamam!</h2><p>${streakNow()} gündür serin devam ediyor 🔥</p></div>`;
    h += T`<div class="row"><button class="btn ghost" id="rH">🎮 Oyunlar</button><button class="btn" id="rA">${r.againLabel || T('🔁 Tekrar')}</button></div>`;
    view.innerHTML = h; window.scrollTo(0, 0);
    $('rH').onclick = hub; $('rA').onclick = r.again;
    if (r.rec) { sndWin(); confetti(['🏆', gm.e, '⭐', '🎈']); }
  }

  // ---------------------------------------------------------------- giriş: haritada afiş
  const _home = home;
  home = function () {
    G = null;
    _home.apply(this, arguments);
    if ($('oyBan')) return;
    const after = $('ctBan') || view.querySelector('.hello'); if (!after) return;
    const d = D(), n = Object.values(d.n).reduce((a, b) => a + b, 0);
    after.insertAdjacentHTML('afterend', T`<button class="oyban" id="oyBan"><div class="e">🐷🦗</div><div style="flex:1"><b>🎮 Oyun Parkı</b><small>Balon, 60 sn koşu, sayı doğrusu, düello${n ? T` · ${n} oyun oynandı` : ''}</small></div><span style="font-size:26px">▶</span></button>`);
    $('oyBan').onclick = () => { sndTap(); hub(); };
  };

  if (view.querySelector('.region')) home();
})();
