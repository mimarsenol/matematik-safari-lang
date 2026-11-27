'use strict';
/* Alt alta işlemler: toplama, çıkarma, çarpma alt alta; bölme, bölme çizgileriyle.
   - Sorularda: "47 + 38 = ?" gibi çok basamaklı sorulara alt alta yazılmış hali eklenir (cevap satırı "?").
   - Çözümlerde: aynı işlemin tamamı (elde, onluk bozma, ara çarpımlar, bölme adımları) gösterilir.
   - Derslerde: toplama, çarpma ve bölme konularına "alt alta" kartları eklenir (tahtada çizilerek anlatılır).
   (ekran.js'ten sonra yüklenir) */
(function () {
  const css = document.createElement('style');
  css.textContent = `
  .aa{display:inline-grid;font-weight:800;font-size:30px;line-height:1.25;font-variant-numeric:tabular-nums;margin:6px auto;color:#1f2a44}
  .aa span{display:flex;align-items:flex-end;justify-content:center;min-width:.72em;padding:0 1px}
  .aa .op{color:#c4001d}
  .aa .ln{border-bottom:3px solid currentColor}
  .aa .vl{border-left:3px solid currentColor}
  .aa .res{color:#0b6b2f}
  .aa .cy{font-size:15px;color:#c4001d;align-items:flex-end;line-height:1}
  .aa .bw{font-size:15px;color:#0057b8;line-height:1}
  .aa .x{text-decoration:line-through;text-decoration-color:#0057b8;text-decoration-thickness:2px;opacity:.75}
  .aa .q{color:var(--pri,#ff8a3d)}
  .aa .rem{color:#7b61ff}
  .lesson .aa,.board .aa{font-size:28px}
  .exp-aa{display:flex;justify-content:center;margin:6px 0}
  @media (max-width:420px){.aa{font-size:26px}}
  `;
  document.head.appendChild(css);

  // Hücre ızgarası → HTML. cells: [{r, c, t, k}] (k: sınıf adları)
  function grid(cells, cols, colW) {
    const rows = Math.max(...cells.map(x => x.r)) + 1;
    const tmpl = colW || `repeat(${cols}, auto)`;
    return `<div class="aa" style="grid-template-columns:${tmpl};grid-template-rows:repeat(${rows},auto)">` +
      cells.map(x => `<span class="${x.k || ''}" style="grid-row:${x.r + 1};grid-column:${x.c + 1}">${x.t === '' || x.t == null ? '&nbsp;' : x.t}</span>`).join('') + '</div>';
  }
  const digits = n => String(n).split('');

  // ---------------------------------------------------------------- toplama / çıkarma
  function addSub(a, b, op, ask) {
    const res = op === '+' ? a + b : a - b;
    const W = Math.max(String(a).length, String(b).length, String(res).length) + 1; // +1: işaret sütunu
    const cells = [], put = (r, n, k) => digits(n).reverse().forEach((d, i) => cells.push({ r, c: W - 1 - i, t: d, k }));
    // elde (toplama) ya da onluk bozma (çıkarma) satırı
    const top = Array(W).fill('');
    const da = digits(a).reverse().map(Number), db = digits(b).reverse().map(Number);
    let aShow = null;
    if (!ask && op === '+') { let c = 0; for (let i = 0; i < W - 1; i++) { const s = (da[i] || 0) + (db[i] || 0) + c; c = s >= 10 ? 1 : 0; if (c) top[W - 2 - i] = '1'; } }
    if (!ask && op === '−') {
      const m = da.slice(); aShow = m.map(() => null);
      for (let i = 0; i < m.length; i++) {
        if (m[i] < (db[i] || 0)) { let j = i + 1; while (m[j] === 0) j++; m[j]--; aShow[j] = m[j]; for (let k = j - 1; k > i; k--) { m[k] = 9; aShow[k] = 9; } m[i] += 10; aShow[i] = m[i]; }
      }
      aShow.forEach((v, i) => { if (v !== null) top[W - 1 - i] = String(v); });
    }
    top.forEach((t, c) => t && cells.push({ r: 0, c, t, k: op === '+' ? 'cy' : 'bw' }));
    // birinci sayı (bozulan basamaklar üstü çizili)
    digits(a).reverse().forEach((d, i) => cells.push({ r: 1, c: W - 1 - i, t: d, k: aShow && aShow[i] !== null ? 'x' : '' }));
    cells.push({ r: 2, c: 0, t: op, k: 'op ln' });
    for (let c = 1; c < W; c++) { const i = W - 1 - c, d = digits(b).reverse()[i]; cells.push({ r: 2, c, t: d || '', k: 'ln' }); }
    if (ask) cells.push({ r: 3, c: W - 1, t: '?', k: 'q' }); else put(3, res, 'res');
    return grid(cells, W);
  }

  // ---------------------------------------------------------------- çarpma
  function mul(a, b, ask) {
    const res = a * b, db = digits(b).reverse().map(Number);
    const parts = db.length > 1 ? db.map((d, i) => a * d * 10 ** i) : [];
    const W = Math.max(String(a).length, String(b).length + 1, String(res).length + (db.length > 1 ? 1 : 0)) + 1;
    const cells = [], put = (r, n, k, shift = 0) => digits(n).reverse().forEach((d, i) => cells.push({ r, c: W - 1 - i - shift, t: d, k }));
    put(0, a, '');
    cells.push({ r: 1, c: 0, t: '×', k: 'op ln' });
    for (let c = 1; c < W; c++) { const d = digits(b).reverse()[W - 1 - c]; cells.push({ r: 1, c, t: d || '', k: 'ln' }); }
    if (ask) { cells.push({ r: 2, c: W - 1, t: '?', k: 'q' }); return grid(cells, W); }
    if (!parts.length) { put(2, res, 'res'); return grid(cells, W); }
    // ara çarpımlar (kaydırılarak), sonra toplama
    db.forEach((d, i) => {
      const r = 2 + i, p = a * d, last = i === db.length - 1;
      put(r, p, last ? 'ln' : '', i);
      if (last) { cells.push({ r, c: 0, t: '+', k: 'op ln' }); for (let c = 1; c < W; c++) if (!cells.some(x => x.r === r && x.c === c)) cells.push({ r, c, t: '', k: 'ln' }); }
    });
    put(2 + db.length, res, 'res');
    return grid(cells, W);
  }

  // ---------------------------------------------------------------- bölme (okuldaki gibi, bölme çizgisiyle)
  //  84 | 4
  // −8  |----
  //  04 | 21
  //  −4
  //   0
  function longDiv(n, dv, ask) {
    const nd = digits(n).map(Number), q = Math.floor(n / dv), r = n % dv;
    const L = nd.length + 1;                 // sol: işaret sütunu + bölünen basamakları
    const qs = String(q), R = Math.max(String(dv).length, qs.length) + 1;
    const cells = [];
    nd.forEach((d, i) => cells.push({ r: 0, c: i + 1, t: d }));
    // sağ taraf: bölen (altı çizili) ve bölüm
    digits(dv).forEach((d, i) => cells.push({ r: 0, c: L + 1 + i, t: d, k: 'ln' }));
    for (let i = String(dv).length; i < R - 1; i++) cells.push({ r: 0, c: L + 1 + i, t: '', k: 'ln' });
    cells.push({ r: 0, c: L, t: '', k: 'vl ln' }); cells.push({ r: 1, c: L, t: '', k: 'vl' });
    if (ask) { cells.push({ r: 1, c: L + 1, t: '?', k: 'q' }); return grid(cells, L + R); }
    qs.split('').forEach((d, i) => cells.push({ r: 1, c: L + 1 + i, t: d, k: 'res' }));
    // adımlar
    let cur = 0, row = 1, started = false;
    for (let i = 0; i < nd.length; i++) {
      cur = cur * 10 + nd[i];
      if (!started && cur < dv && i < nd.length - 1) continue;
      started = true;
      const qd = Math.floor(cur / dv), prod = qd * dv, end = i + 1;          // end: son basamağın sütunu
      const ps = String(prod);
      ps.split('').forEach((d, j) => cells.push({ r: row, c: end - ps.length + 1 + j, t: d, k: 'ln' }));
      cells.push({ r: row, c: end - ps.length, t: '−', k: 'op' });
      cur -= prod; row++;
      const next = i + 1 < nd.length ? nd[i + 1] : null;
      const show = next === null ? String(cur) : String(cur) + next;   // kalan + aşağı indirilen basamak
      const endCol = next === null ? end : end + 1;
      show.split('').forEach((d, j) => cells.push({ r: row, c: endCol - show.length + 1 + j, t: d, k: next === null ? 'rem' : '' }));
      row++;
      // indirilen basamağı bir sonraki adımın başına taşı (cur zaten kalan)
    }
    // satır sayısı en az 2 olsun (sağ taraf için)
    return grid(cells, L + R);
  }
  window.altAlta = { addSub, mul, longDiv };

  // ---------------------------------------------------------------- sorulara ve çözümlere ekle
  const RX = /^\s*(\d+)\s*([+−×÷])\s*(\d+)\s*=\s*\?\s*$/;
  const RXDIV = /^(\d+) ÷ (\d+) işleminde/;
  function decorate(q) {
    if (!q || q.vis || q.choices) return q;
    const plain = String(q.q).replace(/<[^>]+>/g, ' ');
    let m = plain.match(RX), a, b, op, ask, full;
    if (m) { a = +m[1]; op = m[2]; b = +m[3]; }
    else if ((m = plain.match(RXDIV))) { a = +m[1]; b = +m[2]; op = '÷'; }
    else return q;
    if (Math.max(a, b) < 10) return q;                                   // tek basamaklıda gerek yok
    if (op === '−' && a < b) return q;
    if (op === '+' || op === '−') { ask = addSub(a, b, op, true); full = addSub(a, b, op, false); }
    else if (op === '×') { if (Math.min(a, b) >= 100) return q; const [x, y] = a >= b ? [a, b] : [b, a]; ask = mul(x, y, true); full = mul(x, y, false); }
    else { if (b > 99 || a > 9999) return q; ask = longDiv(a, b, true); full = longDiv(a, b, false); }
    q.vis = ask;
    q.exp = (q.exp || '') + `<div class="exp-aa">${full}</div>`;
    return q;
  }
  ['topla', 'carp', 'bol', 'ilk'].forEach(id => {
    const t = TOPICS.find(x => x.id === id); if (!t) return;
    const g = t.gen; t.gen = function (d) { return decorate(g.call(this, d)); };
  });

  // ---------------------------------------------------------------- derslere kart ekle
  const card = (title, html) => [title, html];
  const add = (id, at, c) => { const t = TOPICS.find(x => x.id === id); if (!t) return; const i = Math.min(at, t.lesson.length); t.lesson.splice(i, 0, c); };
  add('topla', 3, card(T('Alt alta toplama'), T`Sayıları <b>alt alta</b>, basamakları hizalı yaz. <b>Birlerden</b> başla:
    <div class="vis">${addSub(47, 38, '+', false)}</div>
    <div class="ex">7 + 8 = 15 → 5 yaz, 1 elde<br>4 + 3 + 1 = 8 → sonuç <b>85</b></div>`));
  add('topla', 5, card(T('Alt alta çıkarma'), T`Üstteki rakam küçükse yandaki onluktan <b>1 onluk bozarız</b>:
    <div class="vis">${addSub(52, 27, '−', false)}</div>
    <div class="ex">2'den 7 çıkmaz → 5 onluktan 1'ini boz: 12 − 7 = 5<br>4 − 2 = 2 → sonuç <b>25</b></div>`));
  add('carp', 99, card(T('Alt alta çarpma'), T`Alttaki sayının her rakamıyla üstteki sayıyı çarp, sonra topla:
    <div class="vis">${mul(24, 13, false)}</div>
    <div class="ex">24 × 3 = 72<br>24 × 10 = 240 (bir basamak sola kaydır)<br>72 + 240 = <b>312</b></div>`));
  add('bol', 99, card(T('Bölme işlemi'), T`Bölüneni sola, böleni sağa yaz, araya <b>bölme çizgisini</b> çiz. Bölüm çizginin altına yazılır:
    <div class="vis">${longDiv(84, 4, false)}</div>
    <div class="ex">8'in içinde 4 kaç kere var? 2 → 2 × 4 = 8, kalan 0<br>4'ü indir: 4'ün içinde 4 bir kere → bölüm <b>21</b></div>`));
  add('bol', 99, card(T('Kalanlı bölme'), T`Son adımda artan sayı <b>kalan</b>dır:
    <div class="vis">${longDiv(47, 5, false)}</div>
    <div class="ex">47'nin içinde 5, 9 kere var: 9 × 5 = 45<br>47 − 45 = 2 → bölüm 9, kalan <b>2</b></div>`));
})();
