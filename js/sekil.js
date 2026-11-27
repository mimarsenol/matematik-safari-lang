'use strict';
/* =========================================================
   Şekil Bahçesi — 1-4. sınıf geometri ve ölçme
   - Düzlemsel şekiller (kare, dikdörtgen, üçgen, daire; köşe/kenar), saat okuma, uzunluk ölçme (cm/m), simetri
   - Haritada Başlangıç Çayırı'ndan hemen sonra kendi bölgesi olarak durur.
   - Kilit zinciri ayrıdır: ilk şekil konusu baştan açık, sonrakiler bir öncekinden 1⭐ ister.
     Mevcut konuların kilidi eskisi gibi (araya giren bu konular onları kilitlemez).
   - Metinler Türkçe; yalnızca Türkçe sayfada devreye girer. (carpim.js'ten sonra, en son yüklenir)
   ========================================================= */
(function () {
  if (typeof LANG !== 'undefined' && LANG !== 'tr') return;

  // ======================================================= ortak çizim
  const INK = '#2d2a32', RED = '#e8475a', BLUE = '#3d8bff';
  const COLS = ['#ffb15c', '#7cc7ff', '#9be29b', '#ff9bb3', '#c7a4ff', '#ffe066'];
  const STK = `stroke="${INK}" stroke-width="3" stroke-linejoin="round"`;
  const r1 = x => Math.round(x * 10) / 10;
  const ngon = (cx, cy, r, n, start) => Array.from({ length: n }, (_, i) => { const a = (start + i * 360 / n) * Math.PI / 180; return r1(cx + r * Math.cos(a)) + ',' + r1(cy + r * Math.sin(a)); }).join(' ');

  // ======================================================= ŞEKİLLER
  const SH = {
    kare: { ad: T('Kare'), k: 4 }, dikdortgen: { ad: T('Dikdörtgen'), k: 4 }, ucgen: { ad: T('Üçgen'), k: 3 },
    daire: { ad: T('Daire'), k: 0 }, besgen: { ad: T('Beşgen'), k: 5 }, altigen: { ad: T('Altıgen'), k: 6 },
  };
  const BASIC4 = ['kare', 'dikdortgen', 'ucgen', 'daire'];
  const GEN = { kare: T('karenin'), besgen: T('beşgenin'), altigen: T('altıgenin') };
  // o: { rot: derece, v: üçgen/dikdörtgen çeşidi }
  function shapeEl(kind, cx, cy, s, fill, o = {}) {
    const rot = o.rot || 0, tr = rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : '';
    if (kind === 'daire') return `<circle cx="${cx}" cy="${cy}" r="${s}" fill="${fill}" ${STK}/>`;
    let pts;
    if (kind === 'kare') pts = ngon(cx, cy, s * 1.2, 4, 45);
    else if (kind === 'dikdortgen') { const w = s * (o.v ? 0.62 : 1.2), h = s * (o.v ? 1.15 : 0.7); pts = `${r1(cx - w)},${r1(cy - h)} ${r1(cx + w)},${r1(cy - h)} ${r1(cx + w)},${r1(cy + h)} ${r1(cx - w)},${r1(cy + h)}`; }
    else if (kind === 'ucgen') {
      const v = o.v || 0;
      if (v === 1) pts = `${r1(cx - s)},${r1(cy + s * .85)} ${r1(cx + s)},${r1(cy + s * .85)} ${r1(cx - s)},${r1(cy - s * .85)}`;               // dik üçgen
      else if (v === 2) pts = `${r1(cx - s)},${r1(cy + s * .7)} ${r1(cx + s * 1.05)},${r1(cy + s * .7)} ${r1(cx + s * .45)},${r1(cy - s * .8)}`; // çeşitkenar
      else pts = ngon(cx, cy + s * .2, s * 1.15, 3, -90);                                                                                  // eşkenar
    }
    else pts = ngon(cx, cy, s * 1.05, kind === 'besgen' ? 5 : 6, -90);
    return `<polygon points="${pts}" fill="${fill}" ${STK}${tr}/>`;
  }
  const shapeSVG = (kind, o = {}, w = 140) => `<svg viewBox="0 0 140 140" width="${w}">${shapeEl(kind, 70, 72, 46, o.fill || pick(COLS), o)}</svg>`;
  // Köşeleri kırmızı noktayla göster (ders kartı için)
  function cornersSVG(kind) {
    const pts = { kare: ngon(70, 72, 55, 4, 45), ucgen: ngon(70, 81, 53, 3, -90) }[kind];
    const dots = pts.split(' ').map(p => { const [x, y] = p.split(','); return `<circle cx="${x}" cy="${y}" r="7" fill="${RED}"/>`; }).join('');
    return `<svg viewBox="0 0 140 140" width="120"><polygon points="${pts}" fill="#fff1d6" ${STK}/>${dots}</svg>`;
  }
  const row = (...svgs) => `<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;align-items:center">${svgs.join('')}</div>`;
  // 3 × 3 sahne: hedef şekilden c tane
  function scene(target, c) {
    const others = BASIC4.filter(k => k !== target && !(target === 'dikdortgen' && k === 'kare'));
    const slots = shuffle([...Array(c).fill(target), ...Array.from({ length: 9 - c }, () => pick(others))]);
    let g = '';
    slots.forEach((k, i) => { const cx = 42 + (i % 3) * 78 + R(-6, 6), cy = 42 + Math.floor(i / 3) * 78 + R(-6, 6);
      g += shapeEl(k, cx, cy, 25, pick(COLS), { rot: k === 'kare' && chance(.3) ? 45 : k === 'ucgen' ? pick([0, 0, 180, 90]) : 0, v: k === 'ucgen' ? R(0, 2) : R(0, 1) }); });
    return `<svg viewBox="0 0 240 240" width="230">${g}</svg>`;
  }
  const nameChoices = (ans, pool) => shuffle(pool.filter(k => k !== ans)).slice(0, 3).concat(ans).map(k => ({ h: SH[k].ad, ok: k === ans }));

  const SEKIL = { id: 'sekil', emoji: '🐞', animal: T('Uğur Böceği Benek'), name: T('Şekilleri Tanı'),
    lesson: [
      [T('Etrafımız şekillerle dolu'), T`Pencere, pizza, üçgen peynir… Hepsi birer <b>şekil</b>!
       <div class="vis">${row(shapeSVG('kare', { fill: '#ffb15c' }, 70), shapeSVG('dikdortgen', { fill: '#7cc7ff' }, 70), shapeSVG('ucgen', { fill: '#9be29b' }, 70), shapeSVG('daire', { fill: '#ff9bb3' }, 70))}</div>
       <div class="ex">Kare · Dikdörtgen · Üçgen · Daire</div>
       <div class="tip">🐞 Benek der ki: Benim sırtımdaki benekler daire!</div>`],
    [T('Köşe ve kenar'), T`<b>Kenar</b>: şekli çevreleyen düz çizgiler. <b>Köşe</b>: iki kenarın birleştiği sivri nokta.
       <div class="vis">${row(cornersSVG('ucgen'), cornersSVG('kare'))}</div>
       <div class="ex">Üçgen: <b>3</b> kenar, <b>3</b> köşe<br>Kare: <b>4</b> kenar, <b>4</b> köşe</div>
       <div class="tip">Köşeleri sayarken her birine parmağınla bir kez dokun.</div>`],
      [T('Kare mi, dikdörtgen mi?'), T`İkisinin de 4 kenarı, 4 köşesi var. Fark kenarlarda:
       <div class="vis">${row(shapeSVG('kare', { fill: '#ffb15c' }, 90), shapeSVG('dikdortgen', { fill: '#7cc7ff' }, 110))}</div>
       <div class="ex"><b>Kare</b>: 4 kenarı da eşit.<br><b>Dikdörtgen</b>: karşılıklı kenarlar eşit; ikisi uzun, ikisi kısa.</div>
       <div class="tip">Döndürülmüş kare yine karedir! Şekil dönünce adı değişmez.</div>`],
      [T('Daire ve yeni şekiller'), T`<b>Dairenin</b> hiç köşesi yoktur; etrafı tek bir eğri çizgidir.
       <div class="vis">${row(shapeSVG('daire', { fill: '#ff9bb3' }, 70), shapeSVG('besgen', { fill: '#c7a4ff' }, 70), shapeSVG('altigen', { fill: '#ffe066' }, 70))}</div>
       <div class="ex">Daire: 0 köşe<br>Beşgen: 5 kenar, 5 köşe<br>Altıgen: 6 kenar, 6 köşe</div>
       <div class="tip">🐝 Arıların petekleri altıgendir!</div>`],
    ],
    gen(d) {
      if (d === 1) {
        if (chance(.35)) { const ans = pick(BASIC4), pool = ans === 'kare' ? BASIC4.filter(k => k !== 'dikdortgen') : BASIC4;
          const ch = shuffle(pool.filter(k => k !== ans)).slice(0, 2).concat(ans);
          return { q: T`Hangisi ${SH[ans].ad.toLowerCase()}?`, choices: ch.map(k => ({ h: shapeSVG(k, { fill: COLS[1] }, 66), ok: k === ans })),
            hint: { kare: T('Kare: 4 kenarı da eşit.'), dikdortgen: T('Dikdörtgen: 4 kenar, ikisi uzun ikisi kısa.'), ucgen: T('Üçgenin 3 kenarı var.'), daire: T('Dairenin hiç köşesi yok, yuvarlaktır.') }[ans],
            exp: T`${SH[ans].ad}: ${ans === 'daire' ? T('köşesi yok, yuvarlak') : T`${SH[ans].k} kenar, ${SH[ans].k} köşe`}` }; }
        const ans = pick(BASIC4), pool = ans === 'kare' ? BASIC4.filter(k => k !== 'dikdortgen') : BASIC4;
        return { q: T('Bu hangi şekil?'), vis: shapeSVG(ans, { v: R(0, 1) }), choices: pool.map(k => ({ h: SH[k].ad, ok: k === ans })),
          hint: T('Kenarlarını ve köşelerini say. Köşesi yoksa daire!'), exp: T`${SH[ans].ad}: ${ans === 'daire' ? T('köşesi yok') : T`${SH[ans].k} kenar, ${SH[ans].k} köşe`}` };
      }
      if (d === 2) {
        const t = R(0, 2);
        if (t === 0) { const k = pick(['kare', 'dikdortgen', 'ucgen', 'ucgen', 'daire']), side = k !== 'daire' && chance(.5);
          return { q: side ? T('Bu şeklin kaç kenarı var?') : T('Bu şeklin kaç köşesi var?'), vis: shapeSVG(k, { rot: k === 'kare' && chance(.4) ? 45 : k === 'ucgen' ? pick([0, 90, 180]) : 0, v: k === 'ucgen' ? R(0, 2) : R(0, 1) }), ans: SH[k].k,
            hint: side ? T('Düz çizgileri tek tek say.') : T('Sivri uçlara parmağınla dokunarak say. Yuvarlaksa köşesi yoktur.'),
            exp: k === 'daire' ? T('Daire yuvarlaktır; hiç köşesi yok → 0') : T`Bu bir ${SH[k].ad.toLowerCase()}: ${SH[k].k} kenar, ${SH[k].k} köşe` }; }
        if (t === 1) { const k = pick(['kare', 'kare', 'dikdortgen', 'ucgen']), pool = k === 'kare' ? ['kare', 'ucgen', 'daire'] : BASIC4;
          return { q: T('Bu hangi şekil?'), sub: T('Dikkat: şekil dönmüş olabilir!'), vis: shapeSVG(k, { rot: k === 'kare' ? 45 : k === 'ucgen' ? pick([90, 180, 30]) : 90, v: k === 'ucgen' ? R(1, 2) : 0 }), choices: pool.map(x => ({ h: SH[x].ad, ok: x === k })),
            hint: T('Şekli kafanda düzelt. Kenarları ve köşeleri say.'), exp: T`Şekil dönse de adı değişmez: ${SH[k].ad} (${SH[k].k} kenar)` }; }
        const k = pick(['kare', 'dikdortgen', 'ucgen', 'daire']);
        const RID = { kare: T('4 kenarım var ve hepsi eşit. Ben neyim?'), dikdortgen: T('4 kenarım var; ikisi uzun, ikisi kısa. Ben neyim?'), ucgen: T('3 köşem ve 3 kenarım var. Ben neyim?'), daire: T('Hiç köşem yok, yuvarlağım. Ben neyim?') };
        return { q: RID[k], long: true, choices: nameChoices(k, k === 'kare' ? ['ucgen', 'daire', 'besgen'] : BASIC4), hint: T('Kenar ve köşe sayısını düşün.'), exp: T`${SH[k].ad}: ${RID[k].replace(T(' Ben neyim?'), '')}` };
      }
      const t = R(0, 2);
      if (t === 0) { const k = pick(['ucgen', 'daire', 'kare', 'dikdortgen']), c = R(2, 5);
        return { q: T`Resimde kaç tane ${SH[k].ad.toLowerCase()} var?`, vis: scene(k, c), ans: c, hint: k === 'kare' ? T('Dönmüş kareleri de say!') : k === 'ucgen' ? T('Ters duran üçgenleri de say!') : T('Her birini bir kez say.'), exp: T`${SH[k].ad} sayısı: ${c}` }; }
      if (t === 1) { const a = R(1, 4), b = R(1, 3), k2 = pick(['kare', 'besgen', 'altigen']);
        return { q: T`${a} üçgen ve ${b} ${SH[k2].ad.toLowerCase()} var. Hepsinin toplam kaç köşesi var?`, long: true, ans: 3 * a + SH[k2].k * b,
          hint: T`Bir üçgenin 3, bir ${GEN[k2]} ${SH[k2].k} köşesi var.`, exp: T`Üçgenler: ${a} × 3 = ${3 * a}<br>${SH[k2].ad}: ${b} × ${SH[k2].k} = ${SH[k2].k * b}<br>Toplam: ${3 * a + SH[k2].k * b}` }; }
      const k = pick(['besgen', 'altigen', 'besgen', 'altigen', 'ucgen']), side = chance(.5);
      return { q: side ? T('Bu şeklin kaç kenarı var?') : T('Bu şeklin kaç köşesi var?'), vis: shapeSVG(k), ans: SH[k].k, hint: T('Bir köşeden başla, etrafında dolaşarak say.'), exp: T`${SH[k].ad}: ${SH[k].k} kenar, ${SH[k].k} köşe` };
    } };

  // ======================================================= SAAT
  const ACC = { 1: "'i", 2: "'yi", 3: "'ü", 4: "'ü", 5: "'i", 6: "'yı", 7: "'yi", 8: "'i", 9: "'u", 10: "'u", 11: "'i", 12: "'yi" };
  const DAT = { 1: "'e", 2: "'ye", 3: "'e", 4: "'e", 5: "'e", 6: "'ya", 7: "'ye", 8: "'e", 9: "'a", 10: "'a", 11: "'e", 12: "'ye" };
  const LOC = { 1: "'de", 2: "'de", 3: "'te", 4: "'te", 5: "'te", 6: "'da", 7: "'de", 8: "'de", 9: "'da", 10: "'da", 11: "'de", 12: "'de" };
  const nx = h => h % 12 + 1, pv = h => (h + 10) % 12 + 1;
  const fmt = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
  const words = (h, m) => m === 0 ? T`saat ${h}` : m === 30 ? T`${h} buçuk` : m < 30 ? T`${h}${ACC[h]} ${m === 15 ? T('çeyrek') : m} geçiyor` : T`${nx(h)}${DAT[nx(h)]} ${m === 45 ? T('çeyrek') : 60 - m} var`;
  const addMin = (h, m, k) => { let t = (h % 12) * 60 + m + k; t = ((t % 720) + 720) % 720; return [Math.floor(t / 60) || 12, t % 60]; };
  function clockSVG(h, m, w = 180) {
    let s = `<svg viewBox="0 0 200 200" width="${w}"><circle cx="100" cy="100" r="92" fill="#fff8e6" stroke="${INK}" stroke-width="5"/>`;
    for (let i = 0; i < 60; i++) { const a = i * 6 * Math.PI / 180, big = i % 5 === 0, r0 = big ? 78 : 83;
      s += `<line x1="${r1(100 + r0 * Math.sin(a))}" y1="${r1(100 - r0 * Math.cos(a))}" x2="${r1(100 + 88 * Math.sin(a))}" y2="${r1(100 - 88 * Math.cos(a))}" stroke="${INK}" stroke-width="${big ? 3 : 1.2}"/>`; }
    for (let n = 1; n <= 12; n++) { const a = n * 30 * Math.PI / 180; s += `<text x="${r1(100 + 64 * Math.sin(a))}" y="${r1(100 - 64 * Math.cos(a) + 7)}" font-size="20" font-weight="800" text-anchor="middle" fill="${INK}">${n}</text>`; }
    const ha = ((h % 12) + m / 60) * 30 * Math.PI / 180, ma = m * 6 * Math.PI / 180;
    s += `<line x1="100" y1="100" x2="${r1(100 + 44 * Math.sin(ha))}" y2="${r1(100 - 44 * Math.cos(ha))}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`;
    s += `<line x1="100" y1="100" x2="${r1(100 + 72 * Math.sin(ma))}" y2="${r1(100 - 72 * Math.cos(ma))}" stroke="${RED}" stroke-width="5" stroke-linecap="round"/>`;
    return s + `<circle cx="100" cy="100" r="7" fill="${INK}"/></svg>`;
  }
  // 4 farklı seçenek: doğru + verilen yanlışlar (+ gerekirse rastgele)
  function timeChoices(h, m, wrong) {
    const seen = new Set([fmt(h, m)]), out = [{ h: fmt(h, m), ok: true }];
    for (const [a, b] of wrong) { const s = fmt(a, b); if (out.length < 4 && a >= 1 && a <= 12 && b >= 0 && b < 60 && !seen.has(s)) { seen.add(s); out.push({ h: s, ok: false }); } }
    while (out.length < 4) { const s = fmt(R(1, 12), m); if (!seen.has(s)) { seen.add(s); out.push({ h: s, ok: false }); } }
    return out;
  }
  const readExp = (h, m) => T`Akrep (kısa) ${m === 0 ? h + LOC[h] : T`${h} ile ${nx(h)} arasında`}, yelkovan (uzun, kırmızı) ${m === 0 ? '12' + LOC[12] : m / 5 + LOC[m / 5]} → ${m} dakika<br>Saat <b>${fmt(h, m)}</b> (${words(h, m)})`;

  const SAAT = { id: 'saat', emoji: '🐓', animal: T('Horoz Gugu'), name: T('Saat Okuma'),
    lesson: [
      [T('İki kardeş: akrep ve yelkovan'), T`Saatin iki ibresi var:
       <div class="vis">${clockSVG(3, 0, 150)}</div>
       <div class="ex"><b>Akrep</b>: kısa ve kalın → <b>saati</b> gösterir<br><b style="color:${RED}">Yelkovan</b>: uzun ve kırmızı → <b>dakikayı</b> gösterir</div>
       <div class="tip">🐓 Gugu der ki: Yelkovan 12'deyse saat tamdır. Burada akrep 3'te: saat 3!</div>`],
      [T('Buçuk = yarım saat'), T`Yelkovan <b>6'ya</b> gelince yarım saat geçmiştir (30 dakika).
       <div class="vis">${clockSVG(4, 30, 150)}</div>
       <div class="ex">Akrep 4 ile 5 arasında, yelkovan 6'da<br>Saat <b>4:30</b> → "dört buçuk"</div>
       <div class="tip">Akrep yolun yarısında! Hangi sayıyı GEÇTİYSE saat odur.</div>`],
      [T('Yelkovanın dili: 5\'er 5\'er'), T`Yelkovan bir sayıdan diğerine gidince <b>5 dakika</b> geçer.
       <div class="ex">1 → 5 dk · 2 → 10 dk · 3 → 15 dk (çeyrek)<br>6 → 30 dk (buçuk) · 9 → 45 dk</div>
       <div class="vis">${clockSVG(2, 15, 140)}</div>
       <div class="ex">Saat <b>2:15</b> → "2'yi çeyrek geçiyor"</div>`],
      [T('Zaman hesabı'), T`<b>1 saat = 60 dakika</b> · yarım saat = 30 dk · çeyrek saat = 15 dk
       <div class="ex">Ders 9:20'de başladı, 40 dakika sürdü.<br>9:20 + 40 dk = <b>10:00</b></div>
       <div class="tip">60 dakika dolunca saat 1 ilerler, dakika sıfırdan başlar.</div>`],
    ],
    gen(d) {
      if (d === 1) {
        const h = R(1, 12);
        if (chance(.25)) return { q: T('Akrep hangi sayıyı gösteriyor?'), vis: clockSVG(h, 0), ans: h, hint: T('Akrep kısa ve kalın olan ibredir.'), exp: T`Kısa ibre (akrep) ${h}'te. Saat ${h}:00` };
        const m = chance(.55) ? 0 : 30;
        return { q: T('Saat kaç?'), vis: clockSVG(h, m), choices: timeChoices(h, m, m ? [[nx(h), 30], [h, 0], [6, (h * 5) % 60]] : [[h, 30], [12, h * 5 % 60], [nx(h), 0]]),
          hint: m ? T('Yelkovan 6\'da: buçuk. Akrebin hangi sayıyı geçtiğine bak.') : T('Yelkovan 12\'de: saat tam. Akrep hangi sayıda?'), exp: readExp(h, m) };
      }
      if (d === 2) {
        const t = R(0, 2), h = R(1, 12);
        if (t === 0) { const n = R(1, 11); return { q: T('Yelkovan bu saatte kaç dakikayı gösteriyor?'), vis: clockSVG(h, n * 5), ans: n * 5, hint: T('Yelkovan her sayıda 5 dakika ilerler: 5\'er 5\'er say.'), exp: T`Yelkovan ${n}'de → ${n} × 5 = ${n * 5} dakika` }; }
        const m = t === 1 ? pick([15, 45, 15, 45, 30]) : R(1, 11) * 5;
        const swap = m % 5 === 0 && m > 0 ? [m / 5, (h * 5) % 60] : [h, 0];
        return { q: T('Saat kaç?'), vis: clockSVG(h, m), choices: timeChoices(h, m, [m > 30 ? [nx(h), m] : [pv(h), m], swap, [h, (m + 30) % 60]]),
          hint: T('Önce akrep: hangi sayıyı GEÇTİ? Sonra yelkovan: 5\'er 5\'er say.'), exp: readExp(h, m) };
      }
      const t = R(0, 3);
      if (t === 0) { const h = R(1, 12), m = R(0, 11) * 5, k = pick([10, 15, 20, 25, 30, 35, 40, 45, 50]), [h2, m2] = addMin(h, m, k);
        return { q: T`Saat ${fmt(h, m)}. ${k} dakika sonra saat kaç olur?`, long: true, vis: clockSVG(h, m, 140), choices: timeChoices(h2, m2, [[h, (m + k) % 60], addMin(h, m, -k), addMin(h2, m2, 10)]),
          hint: T`${fmt(h, m)} üstüne ${k} dakika ekle. 60'ı geçerse saat 1 ilerler.`, exp: T`${m} + ${k} = ${m + k} dakika${m + k >= 60 ? T`<br>60 dakika = 1 saat → saat ${h2} oldu, ${m + k - 60} dakika kaldı` : ''}<br>Cevap: <b>${fmt(h2, m2)}</b>` }; }
      if (t === 1) { const h = R(1, 11), m = R(0, 9) * 5, k = R(2, 11) * 5, [h2, m2] = addMin(h, m, k);
        return { q: T`Film başlangıcı: ${fmt(h, m)} · Bitişi: ${fmt(h2, m2)}<br>Film kaç dakika sürdü?`, long: true, ans: k, hint: T`${fmt(h, m)}'den başlayıp 5'er dakika ileri say ya da 60 dakikaya tamamla.`,
          exp: m2 >= m && h2 === h ? T`${m2} − ${m} = ${k} dakika` : T`${fmt(h, m)} → ${fmt(nx(h), 0)}: ${60 - m} dakika<br>${fmt(nx(h), 0)} → ${fmt(h2, m2)}: ${m2} dakika<br>Toplam: ${60 - m} + ${m2} = ${k} dakika` }; }
      if (t === 2) { const c = pick([[T('1 saat kaç dakikadır?'), 60, T('Yelkovan saatin etrafında bir tam tur atınca 1 saat geçer: 12 × 5 = 60')], [T('Yarım saat kaç dakikadır?'), 30, T('1 saat = 60 dakika. Yarısı: 60 ÷ 2 = 30')], [T('Çeyrek saat kaç dakikadır?'), 15, T('Çeyrek = dörtte bir. 60 ÷ 4 = 15')], [T('1 gün kaç saattir?'), 24, T('Bir gün (gece + gündüz) 24 saattir. Akrep günde 2 tur atar.')]]);
        if (chance(.5)) { const k = R(2, 5); return { q: T`${k} saat kaç dakikadır?`, ans: 60 * k, hint: T('1 saat = 60 dakika'), exp: T`${k} × 60 = ${60 * k} dakika` }; }
        return { q: c[0], ans: c[1], hint: T('1 saat = 60 dakika'), exp: c[2] }; }
      const h = R(1, 12), m = R(1, 11) * 5;
      return { q: T('Saat kaç?'), vis: clockSVG(h, m), choices: timeChoices(h, m, [m > 30 ? [nx(h), m] : [pv(h), m], [m / 5, (h * 5) % 60], [h, 60 - m]]), hint: T('Akrebin GEÇTİĞİ sayı saattir. Yelkovanı 5\'er 5\'er say.'), exp: readExp(h, m) };
    } };

  // ======================================================= UZUNLUK
  const U = 22, X0 = 18;
  function rulerSVG(a, b, obj, N) {
    N = N || Math.min(15, Math.max(10, b + 1));
    const x = v => X0 + v * U, W = X0 * 2 + N * U + 12;
    let s = `<svg viewBox="0 0 ${W} 92" width="${W}"><rect x="6" y="48" width="${W - 12}" height="38" rx="5" fill="#ffe8a3" stroke="${INK}" stroke-width="2.5"/>`;
    for (let v = 0; v <= N; v++) { s += `<line x1="${x(v)}" y1="48" x2="${x(v)}" y2="62" stroke="${INK}" stroke-width="2"/><text x="${x(v)}" y="78" font-size="12" font-weight="700" text-anchor="middle" fill="${INK}">${v}</text>`;
      if (v < N) s += `<line x1="${x(v + .5)}" y1="48" x2="${x(v + .5)}" y2="55" stroke="${INK}" stroke-width="1.3"/>`; }
    s += `<text x="${W - 9}" y="78" font-size="10" text-anchor="end" fill="${INK}" opacity=".6">cm</text>`;
    const xa = x(a), xb = x(b);
    s += `<line x1="${xa}" y1="14" x2="${xa}" y2="48" stroke="${BLUE}" stroke-width="1.5" stroke-dasharray="3 3"/><line x1="${xb}" y1="14" x2="${xb}" y2="48" stroke="${BLUE}" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    if (obj === 'tirtil') {
      const n = b - a;
      for (let i = 0; i < n; i++) s += `<circle cx="${xa + U * (i + .5)}" cy="30" r="${U / 2 - .5}" fill="${i === n - 1 ? '#5cbf5c' : '#9be29b'}" stroke="${INK}" stroke-width="2"/>`;
      s += `<circle cx="${xb - U * .3}" cy="26" r="2.6" fill="${INK}"/>`;
    } else if (obj === 'kurdele') {
      s += `<rect x="${xa}" y="22" width="${xb - xa}" height="16" rx="3" fill="#ff9bb3" stroke="${INK}" stroke-width="2"/>`;
    } else {
      const tip = Math.min(U * 1.1, (xb - xa) * .3), er = Math.min(U * .6, (xb - xa) * .2);
      s += `<rect x="${xa}" y="22" width="${er}" height="16" fill="#ff9bb3" stroke="${INK}" stroke-width="2"/>`;
      s += `<rect x="${xa + er}" y="22" width="${xb - tip - xa - er}" height="16" fill="${obj === 'mavi' ? '#7cc7ff' : '#ffd23f'}" stroke="${INK}" stroke-width="2"/>`;
      s += `<polygon points="${r1(xb - tip)},22 ${xb},30 ${r1(xb - tip)},38" fill="#f5d0a0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><polygon points="${r1(xb - tip * .3)},27.6 ${xb},30 ${r1(xb - tip * .3)},32.4" fill="${INK}"/>`;
    }
    return s + '</svg>';
  }
  function twoBars(la, lb) {
    const sc = Math.min(22, 300 / Math.max(la, lb));
    return `<svg viewBox="0 0 330 92" width="330"><rect x="10" y="12" width="${la * sc}" height="24" rx="12" fill="${RED}" stroke="${INK}" stroke-width="2"/><rect x="10" y="56" width="${lb * sc}" height="24" rx="12" fill="${BLUE}" stroke="${INK}" stroke-width="2"/></svg>`;
  }
  const CM_THINGS = [T('silginin'), T('kurşun kalemin'), T('defterin'), T('parmağının'), T('kitabın')];
  const M_THINGS = [T('sınıfın'), T('okul bahçesinin'), T('koridorun'), T('futbol sahasının'), T('okul binasının')];

  const UZUNLUK = { id: 'uzunluk', emoji: '🐛', animal: T('Tırtıl Santim'), name: T('Uzunluk Ölçme'),
    lesson: [
      [T('Cetvelle ölç'), T`Cetvel üzerindeki her büyük çizgi arası <b>1 santimetre</b> (cm).
       <div class="vis">${rulerSVG(0, 6, 'tirtil', 10)}</div>
       <div class="ex">Tırtıl 0'dan başlıyor, 6'da bitiyor → <b>6 cm</b></div>
       <div class="tip">🐛 Santim der ki: Ölçmeye her zaman 0'dan başla!</div>`],
      [T('0\'dan başlamıyorsa?'), T`Nesne 0'da değilse: <b>bitiş − başlangıç</b>.
       <div class="vis">${rulerSVG(2, 9, 'kalem', 11)}</div>
       <div class="ex">Kalem 2'den 9'a kadar<br>9 − 2 = <b>7 cm</b></div>
       <div class="tip">Ya da aradaki aralıkları tek tek say: 1, 2, … 7.</div>`],
      [T('Metre ve santimetre'), T`Uzun şeyleri <b>metre</b> (m) ile ölçeriz.
       <div class="ex"><b>1 m = 100 cm</b><br>3 m = 300 cm<br>2 m 45 cm = 200 + 45 = <b>245 cm</b></div>
       <div class="tip">Silgi, kalem → cm · Sınıf, bahçe → m</div>`],
      [T('Milimetre ve kilometre'), T`Çok küçükler için <b>milimetre</b> (mm), çok uzaklar için <b>kilometre</b> (km):
       <div class="ex"><b>1 cm = 10 mm</b> · <b>1 km = 1000 m</b><br>4 cm 3 mm = 40 + 3 = <b>43 mm</b></div>
       <div class="tip">Büyük birimden küçüğe geçerken çarparız: m → cm için × 100.</div>`],
    ],
    gen(d) {
      if (d === 1) {
        if (chance(.25)) { let la, lb; do { la = R(4, 13); lb = R(4, 13); } while (Math.abs(la - lb) < 2);
          return { q: T('Hangi şerit daha uzun?'), vis: twoBars(la, lb), choices: [{ h: T('🔴 Kırmızı'), ok: la > lb }, { h: T('🔵 Mavi'), ok: lb > la }], fixed: true, hint: T('İkisi de aynı yerden başlıyor. Hangisi daha ileri gidiyor?'), exp: la > lb ? T('Kırmızı şerit daha ileri uzanıyor: daha uzun.') : T('Mavi şerit daha ileri uzanıyor: daha uzun.') }; }
        const n = R(2, 10), o = pick(['tirtil', 'kalem', 'mavi']);
        return { q: o === 'tirtil' ? T('Tırtıl kaç cm?') : T('Kalem kaç cm?'), vis: rulerSVG(0, n, o), ans: n, hint: T('0\'dan başlıyor. Bittiği yerdeki sayıyı oku.'), exp: T`0'dan ${n}'e kadar → ${n} cm` };
      }
      if (d === 2) {
        const t = R(0, 3);
        if (t <= 1) { const a = R(1, 5), b = R(a + 2, Math.min(14, a + 9)), o = pick(['kalem', 'kurdele', 'mavi', 'tirtil']);
          return { q: o === 'kurdele' ? T('Kurdele kaç cm?') : o === 'tirtil' ? T('Tırtıl kaç cm?') : T('Kalem kaç cm?'), sub: T('Dikkat: 0\'dan başlamıyor!'), vis: rulerSVG(a, b, o), ans: b - a, hint: T`Bitiş − başlangıç: ${b} − ${a}`, exp: T`${b} − ${a} = ${b - a} cm` }; }
        if (t === 2) { const cm = chance(.5), w = pick(cm ? CM_THINGS : M_THINGS);
          return { q: T`${w[0].toUpperCase() + w.slice(1)} uzunluğunu hangi birimle ölçeriz?`, long: true, choices: [{ h: 'cm', ok: cm }, { h: 'm', ok: !cm }], fixed: true, hint: T('Kısa şeyler cm ile, uzun şeyler m ile ölçülür.'), exp: cm ? T`Kısa bir şey → santimetre (cm)` : T`Uzun bir şey → metre (m). 1 m = 100 cm` }; }
        if (chance(.4)) return { q: T('1 metre kaç santimetredir?'), ans: 100, hint: T('1 m = 100 cm'), exp: '1 m = 100 cm' };
        const a = R(12, 60), b = R(5, a - 3), sub = chance(.5);
        return sub ? { q: T`${a} cm'lik kurdelenin ${b} cm'si kesildi. Kaç cm kaldı?`, long: true, ans: a - b, hint: T`${a} − ${b}`, exp: T`${a} − ${b} = ${a - b} cm` }
          : { q: T`${a} cm ve ${b} cm uzunluğundaki iki ip uç uca eklendi. Toplam kaç cm?`, long: true, ans: a + b, hint: T`${a} + ${b}`, exp: T`${a} + ${b} = ${a + b} cm` };
      }
      const t = R(0, 5);
      if (t === 0) { const k = R(2, 9); return { q: `${k} m = ? cm`, ans: 100 * k, hint: T('1 m = 100 cm'), exp: `${k} × 100 = ${100 * k} cm` }; }
      if (t === 1) { const k = R(1, 5), c = R(5, 95); return { q: `${k} m ${c} cm = ? cm`, ans: 100 * k + c, hint: T`Önce metreyi cm yap: ${k} m = ${100 * k} cm`, exp: `${k} m = ${100 * k} cm<br>${100 * k} + ${c} = ${100 * k + c} cm` }; }
      if (t === 2) { const k = R(2, 9), j = R(1, 9); return chance(.5) ? { q: `${k} cm = ? mm`, ans: 10 * k, hint: T('1 cm = 10 mm'), exp: `${k} × 10 = ${10 * k} mm` } : { q: `${k} cm ${j} mm = ? mm`, ans: 10 * k + j, hint: T`${k} cm = ${10 * k} mm`, exp: `${10 * k} + ${j} = ${10 * k + j} mm` }; }
      if (t === 3) { const k = R(2, 9); return { q: `${k} km = ? m`, ans: 1000 * k, hint: T('1 km = 1000 m'), exp: `${k} × 1000 = ${1000 * k} m` }; }
      if (t === 4) { const k = R(1, 3), c = R(10, 80), other = 100 * k + c + pick([-15, -5, 5, 15]), first = 100 * k + c;
        return { q: T('Hangisi daha uzun?'), choices: [{ h: `${k} m ${c} cm`, ok: first > other }, { h: `${other} cm`, ok: other > first }], fixed: true, hint: T('İkisini de cm\'ye çevir.'), exp: T`${k} m ${c} cm = ${first} cm<br>${first} ${first > other ? '>' : '<'} ${other}` }; }
      const a = R(2, 4), left = R(20, 80);
      return { q: T`${a} m'lik ipten ${100 * a - left} cm kesildi. Kaç cm kaldı?`, long: true, ans: left, hint: T`Önce ${a} m'yi cm yap: ${100 * a} cm`, exp: T`${a} m = ${100 * a} cm<br>${100 * a} − ${100 * a - left} = ${left} cm` };
    } };

  // ======================================================= SİMETRİ
  // 100 × 100 kutuda çokgenler. v: dikey simetri, hz: yatay simetri, n: simetri doğrusu sayısı
  const star = ngon(50, 54, 46, 10, -90).split(' ').map((p, i) => { if (i % 2 === 0) return p; const a = (-90 + i * 36) * Math.PI / 180; return r1(50 + 19 * Math.cos(a)) + ',' + r1(54 + 19 * Math.sin(a)); }).join(' ');
  const POLY = {
    ev: { p: '15,95 15,45 50,10 85,45 85,95', v: 1, hz: 0, n: 1, ad: T('ev') },
    ok: { p: '50,8 88,48 66,48 66,92 34,92 34,48 12,48', v: 1, hz: 0, n: 1, ad: T('ok') },
    agac: { p: '50,5 80,42 64,42 88,78 56,78 56,95 44,95 44,78 12,78 36,42 20,42', v: 1, hz: 0, n: 1, ad: T('ağaç') },
    kalp: { p: '50,92 10,50 10,28 22,14 38,14 50,26 62,14 78,14 90,28 90,50', v: 1, hz: 0, n: 1, ad: T('kalp') },
    vazo: { p: '25,10 75,10 65,55 62,92 38,92 35,55', v: 1, hz: 0, n: 1, ad: T('vazo') },
    yildiz: { p: star, v: 1, hz: 0, n: 5, ad: T('yıldız') },
    okyan: { p: '8,34 55,34 55,12 92,50 55,88 55,66 8,66', v: 0, hz: 1, n: 1, ad: T('ok') },
    bayrak: { p: '20,95 20,8 82,24 28,42 28,95', v: 0, hz: 0, n: 0, ad: T('bayrak') },
    L: { p: '20,10 45,10 45,70 85,70 85,92 20,92', v: 0, hz: 0, n: 0, ad: T('L harfi') },
    cizme: { p: '30,8 55,8 55,64 90,70 90,92 30,92', v: 0, hz: 0, n: 0, ad: T('çizme') },
    simsek: { p: '58,5 22,55 46,55 34,95 80,40 56,40 72,5', v: 0, hz: 0, n: 0, ad: T('şimşek') },
    paralel: { p: '8,78 34,22 92,22 66,78', v: 0, hz: 0, n: 0, ad: T('paralelkenar') },
    kare: { p: '15,15 85,15 85,85 15,85', v: 1, hz: 1, n: 4, ad: T('kare') },
    dikd: { p: '5,28 95,28 95,72 5,72', v: 1, hz: 1, n: 2, ad: T('dikdörtgen') },
    eskenar: { p: ngon(50, 58, 46, 3, -90), v: 1, hz: 0, n: 3, ad: T('eşkenar üçgen') },
    altigen: { p: ngon(50, 50, 46, 6, 0), v: 1, hz: 1, n: 6, ad: T('düzgün altıgen') },
  };
  const bbox = p => { const xs = [], ys = []; p.split(' ').forEach(q => { const [x, y] = q.split(',').map(Number); xs.push(x); ys.push(y); }); return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]; };
  // line: 'v' dikey (şeklin ortasından), 'h' yatay, null çizgisiz
  function symSVG(key, line, w = 150, fill) {
    const P = POLY[key], [x0, x1, y0, y1] = bbox(P.p), cx = r1((x0 + x1) / 2), cy = r1((y0 + y1) / 2);
    let s = `<svg viewBox="-8 -8 116 116" width="${w}"><polygon points="${P.p}" fill="${fill || '#c7a4ff'}" ${STK}/>`;
    if (line === 'v') s += `<line x1="${cx}" y1="-4" x2="${cx}" y2="104" stroke="${RED}" stroke-width="3" stroke-dasharray="7 5"/>`;
    if (line === 'h') s += `<line x1="-4" y1="${cy}" x2="104" y2="${cy}" stroke="${RED}" stroke-width="3" stroke-dasharray="7 5"/>`;
    return s + '</svg>';
  }
  // Kareli kağıtta simetri: sol yarı (cols × rows), ayna sağda
  const GR = 4, GC = 3;
  function gridSVG(left, right, cell = 22, showRight = true) {
    const W = GC * 2 * cell, H = GR * cell;
    let s = `<svg viewBox="-3 -3 ${W + 6} ${H + 6}" width="${W + 6}"><rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>`;
    const fillCells = (cells, off, col) => cells.forEach(([r, c]) => { s += `<rect x="${(c + off) * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="${col}"/>`; });
    fillCells(left, 0, '#ffb15c');
    if (showRight) fillCells(right, GC, '#7cc7ff');
    for (let i = 0; i <= GC * 2; i++) s += `<line x1="${i * cell}" y1="0" x2="${i * cell}" y2="${H}" stroke="#bbb" stroke-width="1"/>`;
    for (let j = 0; j <= GR; j++) s += `<line x1="0" y1="${j * cell}" x2="${W}" y2="${j * cell}" stroke="#bbb" stroke-width="1"/>`;
    return s + `<line x1="${GC * cell}" y1="-3" x2="${GC * cell}" y2="${H + 3}" stroke="${RED}" stroke-width="3" stroke-dasharray="5 4"/></svg>`;
  }
  const halfSVG = (cells, cell = 21) => { let s = `<svg viewBox="-2 -2 ${GC * cell + 4} ${GR * cell + 4}" width="${GC * cell + 4}">`;
    cells.forEach(([r, c]) => { s += `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="#7cc7ff"/>`; });
    for (let i = 0; i <= GC; i++) s += `<line x1="${i * cell}" y1="0" x2="${i * cell}" y2="${GR * cell}" stroke="#999" stroke-width="1"/>`;
    for (let j = 0; j <= GR; j++) s += `<line x1="0" y1="${j * cell}" x2="${GC * cell}" y2="${j * cell}" stroke="#999" stroke-width="1"/>`;
    return s + `<line x1="0" y1="-2" x2="0" y2="${GR * cell + 2}" stroke="${RED}" stroke-width="3" stroke-dasharray="4 3"/></svg>`; };
  const key = cells => cells.map(([r, c]) => r * 10 + c).sort((a, b) => a - b).join(',');
  function randLeft(n) { const all = []; for (let r = 0; r < GR; r++) for (let c = 0; c < GC; c++) all.push([r, c]); return shuffle(all).slice(0, n); }
  const mirror = cells => cells.map(([r, c]) => [r, GC - 1 - c]);

  const SIMETRI = { id: 'simetri', emoji: '🦋', animal: T('Kelebek Kanat'), name: T('Simetri'),
    lesson: [
      [T('Ayna gibi iki yarım'), T`Bir şekli bir çizgiden katladığında iki yarı <b>tam üst üste</b> geliyorsa şekil <b>simetriktir</b>.
       <div class="vis">${row(symSVG('kalp', 'v', 110, '#ff9bb3'), symSVG('agac', 'v', 110, '#9be29b'))}</div>
       <div class="ex">Kesikli kırmızı çizgi = <b>simetri doğrusu</b></div>
       <div class="tip">🦋 Kanat der ki: Benim iki kanadım birbirinin aynası!</div>`],
      [T('Her çizgi simetri doğrusu değil'), T`Katlayınca yarılar örtüşmüyorsa o çizgi simetri doğrusu değildir.
       <div class="vis">${row(symSVG('ev', 'v', 100, '#ffe066'), symSVG('ev', 'h', 100, '#ffe066'))}</div>
       <div class="ex">Solda: ✔️ iki yarı aynı<br>Sağda: ✖️ üst çatı, alt duvar — aynı değil</div>`],
      [T('Kaç simetri doğrusu?'), T`Bazı şekillerin birden çok simetri doğrusu vardır.
       <div class="ex">Kare: <b>4</b> · Dikdörtgen: <b>2</b> · Eşkenar üçgen: <b>3</b><br>Kalp: <b>1</b> · Paralelkenar: <b>0</b></div>
       <div class="tip">Dikdörtgenin köşegenleri simetri doğrusu DEĞİLDİR; katlayınca köşeler taşar.</div>`],
      [T('Simetriğini çiz'), T`Kareli kağıtta her kare, aynaya olan uzaklığı kadar <b>öbür tarafa</b> geçer.
       <div class="vis">${gridSVG([[0, 2], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2], [3, 2]], mirror([[0, 2], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2], [3, 2]]), 30)}</div>
       <div class="ex">Aynaya bitişik kare → öbür tarafta da bitişik<br>Aynadan 2 kare uzak → öbür tarafta da 2 kare uzak</div>
       <div class="tip">Kaydırma değil, ayna! Sağ ve sol yer değiştirir.</div>`],
    ],
    gen(d) {
      if (d === 1) {
        const k = pick(['ev', 'ok', 'agac', 'kalp', 'vazo', 'bayrak', 'L', 'cizme', 'simsek', 'kalp', 'agac']), ok = !!POLY[k].v;
        return { q: T('Kesikli çizgi bir simetri doğrusu mu?'), vis: symSVG(k, 'v', 150, pick(COLS)), ...yesNo(ok), hint: T('Şekli kesikli çizgiden katladığını düşün. İki yarı üst üste gelir mi?'),
          exp: ok ? T`Evet: ${POLY[k].ad} şeklinin sol ve sağ yarısı birbirinin aynası.` : T`Hayır: katlayınca ${POLY[k].ad} şeklinin iki yarısı örtüşmez.` };
      }
      if (d === 2) {
        const t = R(0, 2);
        if (t === 0) { const k = pick(['ev', 'kalp', 'agac', 'okyan', 'dikd', 'kare', 'okyan', 'vazo']), ok = !!POLY[k].hz;
          return { q: T('Kesikli çizgi bir simetri doğrusu mu?'), vis: symSVG(k, 'h', 150, pick(COLS)), ...yesNo(ok), hint: T('Üst yarıyı aşağı katladığını düşün. Alt yarıyla aynı mı?'),
            exp: ok ? T`Evet: ${POLY[k].ad} şeklinin üst ve alt yarısı aynı.` : T`Hayır: ${POLY[k].ad} şeklinin üstü ile altı farklı.` }; }
        if (t === 1) { const yes = pick(['ev', 'ok', 'kalp', 'agac', 'vazo']), no = shuffle(['bayrak', 'L', 'cizme', 'simsek', 'paralel']).slice(0, 2);
          return { q: T('Hangisi simetrik bir şekil?'), choices: [yes, ...no].map(k => ({ h: symSVG(k, null, 70, COLS[3]), ok: k === yes })), hint: T('Ortadan katlayınca iki yarısı örtüşen şekli bul.'), exp: T`${POLY[yes].ad}: dikey çizgiden katlanınca iki yarı üst üste gelir.` }; }
        const left = randLeft(R(3, 5));
        return { q: T('Şeklin simetriği çizilince toplam kaç kare boyalı olur?'), long: true, vis: gridSVG(left, [], 28, false), ans: 2 * left.length, hint: T('Simetrik şekilde öbür tarafta da aynı sayıda kare olur.'), exp: T`Sol tarafta ${left.length} kare. Simetriğinde de ${left.length} kare.<br>${left.length} + ${left.length} = ${2 * left.length}` };
      }
      if (chance(.45)) { const k = pick(['kare', 'dikd', 'eskenar', 'kalp', 'paralel', 'ev', 'altigen', 'okyan', 'L']);
        return { q: T('Bu şeklin kaç simetri doğrusu var?'), vis: symSVG(k, null, 140, pick(COLS)), ans: POLY[k].n, hint: T('Dikey, yatay ve çapraz katlamaları tek tek dene.'),
          exp: { kare: T('Kare: 1 dikey + 1 yatay + 2 köşegen = 4'), dikd: T('Dikdörtgen: 1 dikey + 1 yatay = 2 (köşegenler değil!)'), eskenar: T('Eşkenar üçgen: her köşeden karşı kenarın ortasına 1 tane → 3'), altigen: T('Düzgün altıgen: köşeden köşeye 3 + kenardan kenara 3 = 6'), paralel: T('Paralelkenar: hiçbir katlamada iki yarı örtüşmez → 0'), L: T('L harfi: hiçbir katlamada iki yarı örtüşmez → 0') }[k] || T`${POLY[k].ad}: ${POLY[k].n} simetri doğrusu` }; }
      // Kareli kağıtta doğru simetriği seç
      let left, mir, shift;
      do { left = randLeft(R(3, 5)); mir = mirror(left); shift = left; } while (key(mir) === key(shift));
      let off; do { off = mir.slice(); const i = R(0, off.length - 1), [r, c] = off[i]; const free = randLeft(GR * GC).find(([a, b]) => !off.some(([x, y]) => x === a && y === b) && Math.abs(a - r) + Math.abs(b - c) === 1); if (free) off[i] = free; } while (key(off) === key(mir) || key(off) === key(shift));
      return { q: T('Sağ tarafa hangisi gelirse şekil simetrik olur?'), long: true, vis: gridSVG(left, [], 28, false),
        choices: [{ h: halfSVG(mir), ok: true }, { h: halfSVG(shift), ok: false }, { h: halfSVG(off), ok: false }], hint: T('Ayna gibi düşün: aynaya bitişik kareler öbür tarafta da aynaya bitişik olmalı.'),
        exp: T`Her kare kırmızı çizgiye olan uzaklığı kadar öbür tarafa geçer.<div class="vis">${gridSVG(left, mir, 18)}</div>` };
    } };

  // ======================================================= haritaya yerleştir
  const NEW = [SEKIL, SAAT, UZUNLUK, SIMETRI];
  const IDS = new Set(NEW.map(t => t.id));
  Object.assign(GRADES, { sekil: 1, saat: 2, uzunluk: 2, simetri: 3 });
  const RI = 1; // Başlangıç Çayırı'ndan sonra
  TOPICS.forEach(t => { if (t.region >= RI) t.region++; });
  REGIONS.splice(RI, 0, { name: T('Şekil Bahçesi'), grade: '1–4', emoji: '🌷', sub: T('Şekiller, saat, uzunluk ve simetri'), bg: '#f1e6fb' });
  NEW.forEach(t => t.region = RI);
  const at = TOPICS.findIndex(t => t.id === 'ilk');
  TOPICS.splice(at < 0 ? TOPICS.length : at + 1, 0, ...NEW);

  // Kilit: her zincir kendi içinde ilerler (şekil konuları ↔ diğerleri)
  const prereq = i => { const g = IDS.has(TOPICS[i].id); for (let j = i - 1; j >= 0; j--) if (IDS.has(TOPICS[j].id) === g) return j; return -1; };
  unlocked = function (i) { if (S.unlockAll || i === 0) return true; const j = prereq(i); return j < 0 || (S.stars[TOPICS[j].id] || 0) >= 1; };
  const _topicSheet = topicSheet;
  topicSheet = function (i) {
    if (!unlocked(i)) { const t = TOPICS[i], p = TOPICS[prereq(i)];
      openModal(T`<div class="head"><div class="big">🔒</div><h2>${t.name}</h2><p>Bu konuyu açmak için önce <b>${p.name}</b> konusundan en az 1 ⭐ kazan.</p></div><button class="btn" onclick="closeModal()">Tamam</button>`); return; }
    return _topicSheet.apply(this, arguments);
  };

  if (view.querySelector('.region')) home();
})();
