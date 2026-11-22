'use strict';
/* =========================================================
   7. sınıf ve 8. sınıf (LGS) konuları
   (app.js ve temel.js'ten sonra yüklenir, haritanın sonuna eklenir)
   ========================================================= */
(function () {
  const nz = (a, b) => { let x; do { x = R(a, b); } while (!x); return x; };
  const pf = (n, d) => { const g = gcd(n, d); n /= g; d /= g; if (d === 1) return pn(n); return n < 0 ? `(−${F(-n, d)})` : F(n, d); };
  const tm = (c, v, first) => { if (c === 0) return ''; const a = Math.abs(c), body = v ? (a === 1 ? '' : a) + v : String(a); return first ? (c < 0 ? '−' : '') + body : (c < 0 ? ' − ' : ' + ') + body; };
  const lin = (m, n) => (tm(m, X, true) + tm(n, '')) || '0';
  const SQ = n => `√<span style="border-top:3px solid currentColor;padding:0 2px">${n}</span>`;
  const isSq = n => Number.isInteger(Math.sqrt(n));
  const trNum = n => n.toLocaleString(LOCALE);
  const st = { font: 'font-size="16" font-weight="700" fill="#2d2a32"' };
  function rightTri(a, b, la, lb, lc) {
    const s = Math.min(190 / b, 120 / a, 22), H = a * s, W = b * s, ox = 60;
    return `<svg viewBox="0 0 ${W + ox + 70} ${H + 50}" width="${W + ox + 70}"><polygon points="${ox},10 ${ox},${10 + H} ${ox + W},${10 + H}" fill="#e3f1ff" stroke="#2d2a32" stroke-width="3"/>
    <rect x="${ox}" y="${H - 4}" width="14" height="14" fill="none" stroke="#2d2a32" stroke-width="2"/>
    <text x="${ox - 8}" y="${14 + H / 2}" text-anchor="end" ${st.font}>${la}</text>
    <text x="${ox + W / 2}" y="${H + 36}" text-anchor="middle" ${st.font}>${lb}</text>
    <text x="${ox + W / 2 + 12}" y="${H / 2}" ${st.font}>${lc}</text></svg>`;
  }
  function boxSVG(a, b, c) {
    return T`<svg viewBox="0 0 280 165" width="280"><polygon points="40,55 170,55 170,140 40,140" fill="#fff1d6" stroke="#2d2a32" stroke-width="3"/>
    <polygon points="40,55 80,20 210,20 170,55" fill="#ffe2b0" stroke="#2d2a32" stroke-width="3"/>
    <polygon points="170,55 210,20 210,105 170,140" fill="#ffd28a" stroke="#2d2a32" stroke-width="3"/>
    <text x="105" y="160" text-anchor="middle" ${st.font}>${a} cm</text>
    <text x="200" y="52" ${st.font}>${b} cm</text>
    <text x="216" y="88" ${st.font}>${c} cm</text></svg>`;
  }
  function cylSVG(r, h) {
    return `<svg viewBox="0 0 240 170" width="240"><path d="M40,30 L40,130 A60,18 0 0 0 160,130 L160,30" fill="#e3f1ff" stroke="#2d2a32" stroke-width="3"/>
    <ellipse cx="100" cy="30" rx="60" ry="18" fill="#cfe6ff" stroke="#2d2a32" stroke-width="3"/>
    <line x1="100" y1="30" x2="160" y2="30" stroke="#e8475a" stroke-width="3"/><circle cx="100" cy="30" r="3" fill="#e8475a"/>
    <text x="112" y="24" ${st.font}>r = ${r}</text><text x="168" y="88" ${st.font}>h = ${h}</text></svg>`;
  }
  const POLY = { 3: T('üçgen'), 4: T('dörtgen'), 5: T('beşgen'), 6: T('altıgen'), 7: T('yedigen'), 8: T('sekizgen'), 9: T('dokuzgen'), 10: T('ongen'), 12: T('onikigen') };
  const OPS = { '<': { h: '&lt;', f: (l, r) => l < r, fl: '>' }, '≤': { h: '≤', f: (l, r) => l <= r, fl: '≥' }, '>': { h: '&gt;', f: (l, r) => l > r, fl: '<' }, '≥': { h: '≥', f: (l, r) => l >= r, fl: '≤' } };
  const oh = o => OPS[o].h;

  // =======================================================  7. SINIF
  const G7 = [
  { id: 'tamcarp', emoji: '🐊', animal: T('Timsah Dişli'), name: T('Tam Sayılarla Çarpma & Bölme'),
    lesson: [
      [T('İşaret kuralı'), T`Önce sayıları normal çarp/böl, sonra işarete karar ver:
       <div class="ex">(+) · (+) = <b>+</b> &nbsp; (−) · (−) = <b>+</b><br>(+) · (−) = <b>−</b> &nbsp; (−) · (+) = <b>−</b></div>
       <div class="tip">🐊 Dişli: "Aynı işaretler dost (+), farklı işaretler küs (−)!" Bölmede de aynı kural geçerli.</div>`],
      [T('Negatif sayıların kuvveti'), T`<div class="ex">(−2)${'<sup>3</sup>'} = (−2)·(−2)·(−2) = <b>−8</b> (tek üs → negatif)<br>(−2)${'<sup>4</sup>'} = <b>16</b> (çift üs → pozitif)</div>
       <div class="tip">Dikkat: −2${'<sup>4</sup>'} = −(2·2·2·2) = −16. Parantez yoksa üs sadece 2'ye aittir!</div>`],
    ],
    gen(d) {
      if (d === 1) { const a = nz(-9, 9), b = nz(-9, 9); if (a > 0 && b > 0) return this.gen(1);
        return { q: `${pn(a)} × ${pn(b)} = ?`, ans: a * b, hint: T('Önce sayıları çarp. Sonra: aynı işaret → +, farklı → −'), exp: T`${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(a * b)}<br>İşaretler ${(a > 0) === (b > 0) ? T('aynı → +') : T('farklı → −')}<br>Cevap: ${sg(a * b)}` }; }
      if (d === 2) { const b = nz(-9, 9), q = nz(-12, 12), a = b * q; if (a > 0 && b > 0) return this.gen(2);
        return { q: `${pn(a)} ÷ ${pn(b)} = ?`, ans: q, hint: T('Bölmede de işaret kuralı aynı: aynı → +, farklı → −'), exp: T`${Math.abs(a)} ÷ ${Math.abs(b)} = ${Math.abs(q)}<br>İşaretler ${(a > 0) === (b > 0) ? T('aynı → +') : T('farklı → −')}<br>Cevap: ${sg(q)}` }; }
      if (chance(.5)) { const b = R(2, 5), n = R(2, b === 2 ? 5 : 3), paren = chance(.7), v = paren ? (-b) ** n : -(b ** n);
        return { q: `${paren ? `(−${b})` : `−${b}`}<sup>${n}</sup> = ?`, ans: v, hint: paren ? T('Parantez var: −') + b + T(' sayısını ') + n + T(' kez çarp. Üs çift mi tek mi?') : T('Parantez yok! Üs sadece ') + b + T(' sayısına ait, eksi en sonda gelir.'),
          exp: paren ? T`${Array(n).fill(`(−${b})`).join(' · ')}<br>Üs ${n % 2 ? T('tek → sonuç negatif') : T('çift → sonuç pozitif')}<br>= ${sg(v)}` : `−${b}<sup>${n}</sup> = −(${Array(n).fill(b).join(' · ')}) = ${sg(v)}` }; }
      const a = nz(-9, 9), b = nz(-9, 9), dd = nz(-5, 5), k = nz(-6, 6), c = dd * k, v = a * b - k;
      return { q: `${pn(a)} × ${pn(b)} − ${pn(c)} ÷ ${pn(dd)} = ?`, ans: v, hint: T('İşlem önceliği: önce çarpma ve bölme, sonra çıkarma.'), exp: `${pn(a)} × ${pn(b)} = ${sg(a * b)}<br>${pn(c)} ÷ ${pn(dd)} = ${sg(k)}<br>${sg(a * b)} − ${pn(k)} = ${sg(v)}` };
    } },
  { id: 'rasyonel', emoji: '🦜', animal: T('Papağan Pırpır'), name: T('Rasyonel Sayılar'),
    lesson: [
      [T('Rasyonel sayı nedir?'), T`${F('a', 'b')} şeklinde yazılabilen sayılar (b ≠ 0). Negatif kesirler de rasyoneldir.
       <div class="ex">−${F(3, 4)}, &nbsp; ${F(5, 2)}, &nbsp; 0,25 = ${F(1, 4)}, &nbsp; 7 = ${F(7, 1)}</div>`],
      [T('Ondalık ↔ kesir'), T`<div class="ex">0,5 = ${F(1, 2)} &nbsp; 0,25 = ${F(1, 4)} &nbsp; 0,75 = ${F(3, 4)}<br>0,2 = ${F(1, 5)} &nbsp; 0,125 = ${F(1, 8)}</div>
       <div class="tip">🦜 Pırpır: Ondalığı kesre çevirmek için virgülden sonraki basamak kadar sıfırlı payda yaz, sonra sadeleştir: 0,35 = ${F(35, 100)} = ${F(7, 20)}</div>`],
      [T('İşaretli kesirlerle işlem'), T`Kesir kuralları + tam sayı işaret kuralları birlikte:
       <div class="ex">−${F(1, 2)} + ${F(1, 3)} = −${F(3, 6)} + ${F(2, 6)} = −${F(1, 6)}</div>
       <div class="ex">(−${F(2, 3)}) × ${F(9, 4)} = −${F(18, 12)} = −${F(3, 2)}</div>
       <div class="tip">Negatif cevabı yazarken önce − tuşuna bas: −1/6</div>`],
    ],
    gen(d) {
      if (d === 1) {
        if (chance(.5)) { const L = [[5, 10, 1, 2], [25, 100, 1, 4], [75, 100, 3, 4], [2, 10, 1, 5], [4, 10, 2, 5], [6, 10, 3, 5], [8, 10, 4, 5], [125, 1000, 1, 8], [15, 10, 3, 2], [5, 100, 1, 20], [35, 100, 7, 20], [45, 100, 9, 20]], [p, q, n, dd] = pick(L);
          return { q: T`${dec(p / q)} sayısının en sade kesir hali?`, long: true, ans: n / dd, simp: [n, dd], at: F(n, dd), frac: true, hint: T`Önce ${F(p, q)} olarak yaz, sonra sadeleştir.`, exp: T`${dec(p / q)} = ${F(p, q)}<br>Pay ve paydayı ${p / n} ile böl → ${F(n, dd)}` }; }
        const dd = pick([2, 4, 5, 8, 20, 25]), n = R(1, dd - 1), m = { 2: 5, 4: 25, 5: 2, 8: 125, 20: 5, 25: 4 }[dd];
        return { q: `${F(n, dd)} = ?`, sub: T('Ondalık olarak yaz (örn. 0,75)'), ans: n / dd, hint: T`Paydayı 10, 100 veya 1000 yap: ${dd} × ${m} = ${dd * m}`, exp: `${F(n, dd)} = ${F(n * m, dd * m)} = ${dec(n / dd)}` };
      }
      const sign = () => chance(.5) ? -1 : 1;
      if (d === 2) { const d1 = R(2, 6), k = R(1, 3), d2 = chance(.5) ? d1 * k : R(2, 6), n1 = sign() * R(1, d1 + 2), n2 = sign() * R(1, d2 + 2), sub = chance(.4);
        const L = lcm(d1, d2), A = n1 * L / d1, B = n2 * L / d2, Rn = sub ? A - B : A + B;
        if (Rn === 0) return this.gen(2);
        return { q: `${pf(n1, d1)} ${sub ? '−' : '+'} ${pf(n2, d2)} = ?`, sub: T('Kesir olarak yaz. Negatifse önce − tuşu.'), ans: Rn / L, at: fracText(Rn, L), frac: true, hint: T`Ortak payda ${L}. İşaretlere dikkat!`,
          exp: T`Ortak payda ${L}: ${F(A, L)} ${sub ? '−' : '+'} ${B < 0 ? `(${F(B, L)})` : F(B, L)}<br>Paylar: ${sg(A)} ${sub ? '−' : '+'} ${pn(B)} = ${sg(Rn)}<br>Cevap: ${fracText(Rn, L)}` }; }
      const n1 = sign() * R(1, 9), d1 = R(2, 9), n2 = sign() * R(1, 9), d2 = R(2, 9), div = chance(.4);
      const N = div ? n1 * d2 : n1 * n2, D = div ? d1 * Math.abs(n2) * 1 : d1 * d2, NN = div && n2 < 0 ? -N : N;
      return { q: `${pf(n1, d1)} ${div ? '÷' : '×'} ${pf(n2, d2)} = ?`, sub: T('Kesir olarak yaz. Sadeleştirmen gerekmez.'), ans: NN / D, at: fracText(NN, D), frac: true,
        hint: div ? T('İkinciyi ters çevir, çarp. Sonra işaret kuralı.') : T('Pay × pay, payda × payda. Sonra işaret kuralı.'),
        exp: T`${div ? T`${pf(n1, d1)} × ${pf(d2 * Math.sign(n2), Math.abs(n2))} (ters çevir)<br>` : ''}İşaretler ${(n1 > 0) === (n2 > 0) ? T('aynı → +') : T('farklı → −')}<br>= ${fracText(NN, D)}` };
    } },
  { id: 'cebir7', emoji: '🐙', animal: T('Ahtapot Sekiz'), name: T('Cebirsel İfadeler'),
    lesson: [
      [T('Terim, katsayı, sabit'), T`<div class="ex">5${X} − 3 ifadesinde:<br>5${X} → terim, <b>5</b> → katsayı<br>−3 → sabit terim</div>`],
      [T('Benzer terimler'), T`Sadece <b>aynı harfli</b> terimler toplanır:
       <div class="ex">3${X} + 5${X} − 2${X} = (3 + 5 − 2)${X} = <b>6${X}</b></div>
       <div class="ex">4${X} + 7 + 2${X} − 3 = <b>6${X} + 4</b></div>
       <div class="tip">🐙 Sekiz: Ahtapotlarla ahtapotları, balıklarla balıkları say! 3${X} + 2 ≠ 5${X}</div>`],
      [T('Dağılma özelliği'), T`Parantezin önündeki sayı içerideki <b>her terimle</b> çarpılır:
       <div class="ex">3(${X} + 4) = 3${X} + 12<br>−2(${X} − 5) = −2${X} + 10</div>`],
    ],
    gen(d) {
      if (d === 1) { const a = R(2, 9), b = R(2, 9), c = R(1, a + b - 1), v = a + b - c;
        return { q: `${a}${X} + ${b}${X} − ${c}${X} = ?${X}`, ans: v, hint: T('Katsayıları topla/çıkar, x aynen kalır.'), exp: `(${a} + ${b} − ${c})${X} = ${v}${X}` }; }
      if (d === 2) { let a, c; do { a = nz(-9, 9); c = nz(-9, 9); } while (a + c === 0); const b = R(1, 12), e = R(1, 12), askX = chance(.5);
        if (chance(.35)) { const x = nz(-5, 6), v = a * x + b + c * x - e; return { q: `${X} = ${sg(x)} iken<br>${tm(a, X, true)}${tm(b, '')}${tm(c, X)}${tm(-e, '')} = ?`, long: true, ans: v, hint: T('Önce sadeleştir, sonra x yerine sayıyı koy.'), exp: T`Sadeleşmiş: ${lin(a + c, b - e)}<br>${a + c} × ${pn(x)} ${tm(b - e, '') || '+ 0'} = ${sg(v)}` }; }
        return { q: `${tm(a, X, true)}${tm(b, '')}${tm(c, X)}${tm(-e, '')}`, sub: T`Sadeleşince ${askX ? X + T(' teriminin katsayısı') : T('sabit terim')} kaç olur?`, ans: askX ? a + c : b - e, hint: T('x\'li terimleri kendi arasında, sayıları kendi arasında topla.'), exp: T`${X}'li terimler: ${sg(a)} ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${sg(a + c)}<br>Sabitler: ${b} − ${e} = ${sg(b - e)}<br>Sonuç: ${lin(a + c, b - e)}` }; }
      const k = nz(-6, 6), m = nz(-9, 9), n = nz(-5, 5); if (k + n === 0) return this.gen(3); const askX = chance(.5);
      return { q: `${k < 0 ? '−' : ''}${Math.abs(k)}(${X}${tm(m, '')})${tm(n, X)}`, sub: T`Sadeleşince ${askX ? X + T(' teriminin katsayısı') : T('sabit terim')} kaç olur?`, ans: askX ? k + n : k * m, hint: T('Önce parantezi dağıt: önündeki sayı içerideki her terimle çarpılır.'), exp: T`Dağıt: ${lin(k, k * m)}<br>Sonra ${tm(n, X, true)} ekle: ${lin(k + n, k * m)}` };
    } },
  { id: 'denklem7', emoji: '🐼', animal: T('Panda Bambu'), name: T('Denklem Kurma & Çözme'),
    lesson: [
      [T('Parantezli denklem'), T`<div class="ex">3(${X} − 2) = 12<br>İki tarafı 3'e böl: ${X} − 2 = 4<br>İki tarafa 2 ekle: ${X} = <b>6</b></div>`],
      [T('x her iki tarafta'), T`x'leri bir tarafa, sayıları diğer tarafa topla.
       <div class="ex">5${X} + 3 = 2${X} + 15<br>İki taraftan 2${X} çıkar: 3${X} + 3 = 15<br>3${X} = 12 → ${X} = <b>4</b></div>`],
      [T('Problemden denkleme'), T`<div class="ex">"Bir sayının 3 katının 5 fazlası 26"<br>Sayı = ${X} → 3${X} + 5 = 26 → ${X} = <b>7</b></div>
       <div class="tip">🐼 Bambu: Bilinmeyene ${X} de, cümleyi parça parça matematiğe çevir!</div>`],
    ],
    gen(d) {
      if (d === 1) { const k = R(2, 6), x = nz(-6, 12), m = nz(-9, 9), c = k * (x + m);
        return { q: `${k}(${X}${tm(m, '')}) = ${sg(c)}`, sub: T`${X} kaçtır?`, ans: x, hint: T`Önce iki tarafı ${k} ile böl.`, exp: T`İki tarafı ${k} ile böl: ${X}${tm(m, '')} = ${sg(c / k)}<br>${X} = ${sg(c / k)} ${m > 0 ? '−' : '+'} ${Math.abs(m)} = ${sg(x)}` }; }
      if (d === 2) {
        if (chance(.5)) { const k = R(2, 6), t = nz(-5, 9), x = k * t, m = R(1, 12), c = t + m;
          return { q: `${F(X, k)} + ${m} = ${sg(c)}`, sub: T`${X} kaçtır?`, ans: x, hint: T`Önce ${m} çıkar, sonra ${k} ile çarp.`, exp: `${F(X, k)} = ${sg(c)} − ${m} = ${sg(t)}<br>${X} = ${sg(t)} × ${k} = ${sg(x)}` }; }
        const x = nz(-6, 10), c = R(1, 6), a = c + R(1, 5), b = R(-12, 12), e = a * x + b - c * x;
        return { q: `${a}${X}${tm(b, '')} = ${c}${X}${tm(e, '')}`, sub: T`${X} kaçtır?`, ans: x, hint: T`x'leri bir tarafa topla: iki taraftan ${c}${X} çıkar.`, exp: `${a - c}${X}${tm(b, '')} = ${sg(e)}<br>${a - c}${X} = ${sg(e - b)}<br>${X} = ${sg(x)}` }; }
      const t = R(0, 2);
      if (t === 0) { const k = R(2, 7), x = R(2, 15), m = R(1, 20), v = k * x + m;
        return { q: T`Bir sayının ${k} katının ${m} fazlası ${v} ediyor. Sayı kaçtır?`, long: true, ans: x, hint: T`Sayıya ${X} de: ${k}${X} + ${m} = ${v}`, exp: `${k}${X} + ${m} = ${v}<br>${k}${X} = ${v - m}<br>${X} = ${x}` }; }
      if (t === 1) { const x = R(3, 40), S2 = 3 * x + 3;
        return { q: T`Ardışık üç doğal sayının toplamı ${S2}. En küçüğü kaçtır?`, long: true, ans: x, hint: T`Sayılar: ${X}, ${X} + 1, ${X} + 2`, exp: `${X} + (${X} + 1) + (${X} + 2) = ${S2}<br>3${X} + 3 = ${S2}<br>3${X} = ${S2 - 3} → ${X} = ${x}` }; }
      const k = R(2, 5), x = R(3, 15);
      return { q: T`🐰 Tavşanın havucu 🐢 kaplumbağanınkinin ${k} katı. İkisinin toplam ${(k + 1) * x} havucu var. Kaplumbağanın kaç havucu var?`, long: true, ans: x, hint: T`Kaplumbağa: ${X}, tavşan: ${k}${X}. Toplamı ${(k + 1) * x}.`, exp: `${X} + ${k}${X} = ${(k + 1) * x}<br>${k + 1}${X} = ${(k + 1) * x}<br>${X} = ${x}` };
    } },
  { id: 'oranti', emoji: '🐝', animal: T('Arı Vızvız'), name: T('Oran & Orantı'),
    lesson: [
      [T('Orantı'), T`İki oranın eşitliği: ${F('a', 'b')} = ${F('c', 'd')}<br><b>İçler dışlar çarpımı eşittir:</b> a · d = b · c
       <div class="ex">${F(3, 4)} = ${F(X, 20)} → 4 · ${X} = 3 · 20 → ${X} = <b>15</b></div>`],
      [T('Doğru orantı'), T`Biri artınca diğeri <b>aynı oranda artar</b>.
       <div class="ex">3 kg bal 45 TL → 1 kg = 15 TL<br>5 kg bal = 5 × 15 = <b>75 TL</b></div>
       <div class="tip">🐝 Vızvız: Önce "1 tanesi kaç?" bul (birim fiyat)!</div>`],
      [T('Ters orantı'), T`Biri artınca diğeri <b>azalır</b>. Çarpımları sabittir.
       <div class="ex">4 arı bir peteği 12 günde yapar → iş = 4 × 12 = 48<br>6 arı → 48 ÷ 6 = <b>8 gün</b></div>`],
    ],
    gen(d) {
      if (d === 1) { const a = R(1, 9), b = R(2, 9), k = R(2, 6); if (a === b) return this.gen(1);
        if (chance(.5)) return { q: `${F(a, b)} = ${F(a * k, X)}`, sub: T`${X} kaçtır?`, ans: b * k, hint: T('İçler dışlar çarpımı: çapraz çarp.'), exp: `${a} · ${X} = ${b} · ${a * k}<br>${a}${X} = ${b * a * k}<br>${X} = ${b * k}` };
        return { q: `${F(a, b)} = ${F(X, b * k)}`, sub: T`${X} kaçtır?`, ans: a * k, hint: T`Payda ${b} → ${b * k}: kaç katı?`, exp: `${b} × ${k} = ${b * k}<br>${X} = ${a} × ${k} = ${a * k}` }; }
      if (d === 2) { const it = pick([[T('kg bal 🍯'), T('TL')], [T('paket yem'), T('TL')], [T('saatte'), 'km'], [T('kutu fındık 🌰'), T('TL')]]), u = R(4, 30), q1 = R(2, 6); let q2; do { q2 = R(2, 12); } while (q2 === q1);
        const q = it[0] === T('saatte') ? T`🐆 Bir leopar ${q1} saatte ${u * q1} km gidiyor. Aynı hızla ${q2} saatte kaç km gider?` : T`${q1} ${it[0]} ${u * q1} ${it[1]} ise ${q2} ${it[0]} kaç ${it[1]}?`;
        return { q, long: true, ans: u * q2, hint: T('Önce 1 tanesini bul (doğru orantı).'), exp: T`1 tanesi: ${u * q1} ÷ ${q1} = ${u}<br>${q2} tanesi: ${q2} × ${u} = ${u * q2}` }; }
      let w1, w2, d2; do { w1 = R(2, 8); w2 = R(2, 12); d2 = R(2, 12); } while (w1 === w2 || (w2 * d2) % w1 !== 0 || (w2 * d2) / w1 > 40);
      const d1 = w2 * d2 / w1;
      return { q: T`🐝 ${w1} arı bir peteği ${d1} günde yapıyor. ${w2} arı aynı peteği kaç günde yapar?`, long: true, ans: d2, hint: T('Ters orantı: arı çoğalırsa gün azalır. Toplam iş = arı × gün.'), exp: T`Toplam iş: ${w1} × ${d1} = ${w1 * d1}<br>${w2} arı: ${w1 * d1} ÷ ${w2} = ${d2} gün` };
    } },
  { id: 'aci', emoji: '🦩', animal: T('Flamingo Pembe'), name: T('Açılar & Çokgenler'),
    lesson: [
      [T('Tümler ve bütünler'), T`<div class="ex">Toplamı <b>90°</b> olan iki açı → <b>tümler</b> (30° ve 60°)<br>Toplamı <b>180°</b> olan iki açı → <b>bütünler</b> (70° ve 110°)</div>
       <div class="tip">🦩 Pembe: "Tüm-90, Bütün-180" diye ezberle!</div>`],
      [T('Üçgen ve dörtgen'), T`<div class="ex">Üçgenin iç açıları toplamı = <b>180°</b><br>Dörtgenin iç açıları toplamı = <b>360°</b></div>`],
      [T('Çokgenler'), T`n kenarlı çokgen:
       <div class="ex">İç açılar toplamı = (n − 2) × 180°<br>Altıgen: (6 − 2) × 180 = <b>720°</b><br>Düzgün çokgende bir iç açı = toplam ÷ n<br>Dış açılar toplamı her zaman <b>360°</b></div>`],
    ],
    gen(d) {
      if (d === 1) { if (chance(.5)) { const a = R(5, 85); return { q: T`${a}° açının tümleri kaç derecedir?`, long: true, ans: 90 - a, hint: T('Tümler → toplam 90°'), exp: `90 − ${a} = ${90 - a}°` }; }
        const a = R(5, 175); return { q: T`${a}° açının bütünleri kaç derecedir?`, long: true, ans: 180 - a, hint: T('Bütünler → toplam 180°'), exp: `180 − ${a} = ${180 - a}°` }; }
      if (d === 2) { if (chance(.55)) { const a = R(20, 100), b = R(20, 150 - a); return { q: T`Bir üçgenin iki açısı ${a}° ve ${b}°. Üçüncü açı kaç derece?`, long: true, ans: 180 - a - b, hint: T('Üçgenin iç açıları toplamı 180°.'), exp: `180 − ${a} − ${b} = ${180 - a - b}°` }; }
        let a, b, c; do { a = R(50, 140); b = R(50, 140); c = R(50, 140); } while (360 - a - b - c < 30 || 360 - a - b - c > 170);
        return { q: T`Bir dörtgenin üç açısı ${a}°, ${b}° ve ${c}°. Dördüncü açı kaç derece?`, long: true, ans: 360 - a - b - c, hint: T('Dörtgenin iç açıları toplamı 360°.'), exp: `${a} + ${b} + ${c} = ${a + b + c}<br>360 − ${a + b + c} = ${360 - a - b - c}°` }; }
      const t = R(0, 2);
      if (t === 0) { const n = R(5, 10); return { q: T`Bir ${POLY[n]}in iç açıları toplamı kaç derecedir?`, long: true, ans: (n - 2) * 180, hint: '(n − 2) × 180', exp: `${POLY[n]} → n = ${n}<br>(${n} − 2) × 180 = ${(n - 2) * 180}°` }; }
      const n = pick([3, 4, 5, 6, 8, 9, 10, 12]);
      if (t === 1) return { q: T`Düzgün ${POLY[n]}in bir iç açısı kaç derecedir?`, long: true, ans: (n - 2) * 180 / n, hint: T('Önce iç açılar toplamını bul, sonra kenar sayısına böl.'), exp: T`Toplam: (${n} − 2) × 180 = ${(n - 2) * 180}<br>Bir açı: ${(n - 2) * 180} ÷ ${n} = ${(n - 2) * 180 / n}°` };
      return { q: T`Düzgün ${POLY[n]}in bir dış açısı kaç derecedir?`, long: true, ans: 360 / n, hint: T('Dış açılar toplamı her zaman 360°.'), exp: `360 ÷ ${n} = ${360 / n}°` };
    } },
  { id: 'cember', emoji: '🐳', animal: T('Balina Mavi'), name: T('Çember & Daire'),
    lesson: [
      [T('Yarıçap ve çap'), T`<div class="ex">Merkezden çembere uzaklık → <b>yarıçap (r)</b><br>Çap = 2 × r</div>`],
      [T('Çemberin çevresi'), T`<div class="ex">Çevre = 2 × π × r<br>π ≈ 3 alırsak, r = 5 → 2 × 3 × 5 = <b>30</b></div>
       <div class="tip">🐳 Mavi: Sorularda genelde "π = 3 alınız" yazar. Biz de hep 3 alacağız.</div>`],
      [T('Dairenin alanı'), T`<div class="ex">Alan = π × r²<br>r = 4 → 3 × 4 × 4 = <b>48</b></div>
       <div class="tip">Çevre ile alanı karıştırma: çevre bir ip uzunluğu, alan içini boyamak!</div>`],
    ],
    gen(d) {
      const sub = T('π = 3 alınız.');
      if (d === 1) { const r = R(2, 15), t = R(0, 2);
        if (t === 0) return { q: T`Yarıçapı ${r} cm olan çemberin çapı kaç cm?`, long: true, ans: 2 * r, hint: T('Çap = 2 × yarıçap'), exp: `2 × ${r} = ${2 * r} cm` };
        if (t === 1) return { q: T`Çapı ${2 * r} cm olan çemberin yarıçapı kaç cm?`, long: true, ans: r, hint: T('Yarıçap = çap ÷ 2'), exp: `${2 * r} ÷ 2 = ${r} cm` };
        return { q: T`Yarıçapı ${r} cm olan çemberin çevresi kaç cm?`, sub, long: true, ans: 6 * r, hint: T('Çevre = 2 × π × r'), exp: `2 × 3 × ${r} = ${6 * r} cm` }; }
      if (d === 2) { if (chance(.7)) { const r = R(1, 12); return { q: T`Yarıçapı ${r} cm olan dairenin alanı kaç cm²?`, sub, long: true, ans: 3 * r * r, hint: T('Alan = π × r × r'), exp: `3 × ${r} × ${r} = ${3 * r * r} cm²` }; }
        const r = 2 * R(1, 6); return { q: T`Yarıçapı ${r} cm olan yarım dairenin alanı kaç cm²?`, sub, long: true, ans: 3 * r * r / 2, hint: T('Önce tam dairenin alanı, sonra yarısı.'), exp: T`Tam daire: 3 × ${r}² = ${3 * r * r}<br>Yarısı: ${3 * r * r / 2} cm²` }; }
      const t = R(0, 2), r = R(2, 12);
      if (t === 0) return { q: T`Çevresi ${6 * r} cm olan çemberin yarıçapı kaç cm?`, sub, long: true, ans: r, hint: T('2 × 3 × r = çevre'), exp: `6r = ${6 * r}<br>r = ${6 * r} ÷ 6 = ${r} cm` };
      if (t === 1) return { q: T`Alanı ${3 * r * r} cm² olan dairenin yarıçapı kaç cm?`, sub, long: true, ans: r, hint: T('3 × r² = alan → r² = alan ÷ 3'), exp: `r² = ${3 * r * r} ÷ 3 = ${r * r}<br>r = ${r} cm` };
      const n = R(2, 10); return { q: T`🐳 Yarıçapı ${r} cm olan bir tekerlek ${n} tam tur dönüyor. Kaç cm yol alır?`, sub, long: true, ans: 6 * r * n, hint: T('Bir tur = çemberin çevresi.'), exp: T`1 tur: 2 × 3 × ${r} = ${6 * r} cm<br>${n} tur: ${6 * r} × ${n} = ${6 * r * n} cm` };
    } },
  { id: 'veri', emoji: '🦘', animal: T('Kanguru Zıpzıp'), name: T('Ortalama, Ortanca, Tepe Değer'),
    lesson: [
      [T('Aritmetik ortalama'), T`<div class="ex">Ortalama = Toplam ÷ Kaç tane<br>4, 7, 10 → (4 + 7 + 10) ÷ 3 = 21 ÷ 3 = <b>7</b></div>`],
      [T('Ortanca (medyan)'), T`Sayıları <b>küçükten büyüğe sırala</b>, tam ortadakini al.
       <div class="ex">9, 2, 5, 8, 3 → sırala: 2, 3, <b>5</b>, 8, 9 → ortanca 5</div>
       <div class="tip">Çift sayıda veri varsa ortadaki iki sayının ortalaması: 2, 4, 6, 10 → (4 + 6) ÷ 2 = 5</div>`],
      [T('Tepe değer & açıklık'), T`<div class="ex">Tepe değer: en çok tekrar eden → 3, 5, <b>5</b>, 7, <b>5</b> → 5<br>Açıklık: en büyük − en küçük → 7 − 3 = 4</div>
       <div class="tip">🦘 Zıpzıp: Ortanca için önce MUTLAKA sırala!</div>`],
    ],
    gen(d) {
      if (d === 1) { let n, m, arr, last; do { n = R(3, 5); m = R(5, 60); arr = Array.from({ length: n - 1 }, () => m + R(-12, 12)); last = m * n - arr.reduce((a, b) => a + b, 0); } while (last < 1 || last > 99 || arr.some(x => x < 1)); arr.push(last); shuffle(arr);
        return { q: `${arr.join(', ')}`, sub: T('Bu sayıların aritmetik ortalaması kaçtır?'), ans: m, hint: T('Hepsini topla, kaç tane olduğuna böl.'), exp: T`Toplam: ${arr.join(' + ')} = ${m * n}<br>${m * n} ÷ ${n} = ${m}` }; }
      if (d === 2) { if (chance(.65)) { const n = pick([5, 7]), arr = Array.from({ length: n }, () => R(1, 40)), s = [...arr].sort((a, b) => a - b);
          return { q: arr.join(', '), sub: T('Ortanca (medyan) kaçtır?'), ans: s[(n - 1) / 2], hint: T('Önce küçükten büyüğe sırala!'), exp: T`Sıralı: ${s.map((x, i) => i === (n - 1) / 2 ? `<b>${x}</b>` : x).join(', ')}<br>Ortanca: ${s[(n - 1) / 2]}` }; }
        const arr = Array.from({ length: R(5, 7) }, () => R(1, 60)), mx = Math.max(...arr), mn = Math.min(...arr);
        return { q: arr.join(', '), sub: T('Açıklık kaçtır?'), ans: mx - mn, hint: T('En büyük − en küçük'), exp: T`En büyük ${mx}, en küçük ${mn}<br>${mx} − ${mn} = ${mx - mn}` }; }
      if (chance(.5)) { const top = R(1, 20), others = shuffle([...Array(20).keys()].map(x => x + 1).filter(x => x !== top)).slice(0, 4), arr = shuffle([top, top, top, others[0], others[0], others[1], others[2], others[3]]);
        return { q: arr.join(', '), sub: T('Tepe değer kaçtır?'), ans: top, hint: T('En çok tekrar eden sayıyı bul.'), exp: T`${top} sayısı 3 kez tekrar ediyor (en çok).<br>Tepe değer: ${top}` }; }
      const n = R(3, 5), m1 = R(55, 80), m2 = m1 + R(2, 5), need = m2 * (n + 1) - m1 * n; if (need > 100) return this.gen(3);
      return { q: T`${n} sınavın ortalaması ${m1}. Bir sonraki sınavdan kaç alırsa ortalama ${m2} olur?`, long: true, ans: need, hint: T`Önce ${n} sınavın toplamını, sonra ${n + 1} sınavın olması gereken toplamını bul.`, exp: T`Şimdiki toplam: ${n} × ${m1} = ${m1 * n}<br>Gereken toplam: ${n + 1} × ${m2} = ${m2 * (n + 1)}<br>Fark: ${m2 * (n + 1)} − ${m1 * n} = ${need}` };
    } },
  ];

  // =======================================================  8. SINIF (LGS)
  const G8 = [
  { id: 'us8', emoji: '🦖', animal: T('Dino Rex'), name: T('Üslü İfadeler (LGS)'),
    lesson: [
      [T('Negatif üs'), T`Negatif üs → sayıyı <b>ters çevir</b>:
       <div class="ex">${P(2, '−3')} = ${F(1, P(2, 3))} = ${F(1, 8)}<br>${P(F(2, 3), '−1')} = ${F(3, 2)}</div>`],
      [T('Üs kuralları'), T`Tabanlar aynıysa:
       <div class="ex">Çarpma → üsler <b>toplanır</b>: ${P(3, 2)} · ${P(3, 4)} = ${P(3, 6)}<br>Bölme → üsler <b>çıkarılır</b>: ${P(5, 7)} ÷ ${P(5, 3)} = ${P(5, 4)}<br>Üssün üssü → üsler <b>çarpılır</b>: (${P(2, 3)})<sup>4</sup> = ${P(2, 12)}</div>`],
      [T('Bilimsel gösterim'), T`a × ${P(10, 'n')} (1 ≤ a < 10)
       <div class="ex">4 500 000 = 4,5 × ${P(10, 6)} (virgül 6 basamak sola)<br>0,00032 = 3,2 × ${P(10, '−4')} (virgül 4 basamak sağa)</div>
       <div class="tip">🦖 Rex: Büyük sayı → pozitif üs, 0'dan küçük ondalık → negatif üs!</div>`],
    ],
    gen(d) {
      if (d === 1) { if (chance(.55)) { let b, n; do { b = R(2, 5); n = R(1, 3); } while (b ** n > 125);
          return { q: `${P(b, '−' + n)} = ?`, sub: T('Kesir olarak yaz (örn. 1/8)'), ans: 1 / b ** n, at: F(1, b ** n), frac: true, hint: T('Negatif üs: ters çevir, üs pozitif olsun.'), exp: `${P(b, '−' + n)} = ${F(1, P(b, n))} = ${F(1, b ** n)}` }; }
        const a = R(2, 6), n = R(2, 3), paren = chance(.5), v = paren ? (-a) ** n : -(a ** n);
        return { q: `${paren ? `(−${a})` : `−${a}`}<sup>${n}</sup> = ?`, ans: v, hint: paren ? T('Parantez içi tamamen üsse alınır.') : T('Parantez yok: önce ') + a + '<sup>' + n + T('</sup>, sonra başına eksi.'), exp: paren ? `${Array(n).fill(`(−${a})`).join(' · ')} = ${sg(v)}` : `−(${Array(n).fill(a).join(' · ')}) = ${sg(v)}` }; }
      if (d === 2) { const a = R(2, 9), m = R(2, 8), n = R(2, 6), t = R(0, 3);
        if (t === 0) return { q: `${P(a, m)} · ${P(a, n)} = ${P(a, '?')}`, ans: m + n, hint: T('Tabanlar aynı, çarpma → üsleri topla.'), exp: `${m} + ${n} = ${m + n} → ${P(a, m + n)}` };
        if (t === 1) return { q: `${P(a, m)} ÷ ${P(a, n)} = ${P(a, '?')}`, ans: m - n, hint: T('Tabanlar aynı, bölme → üsleri çıkar.'), exp: `${m} − ${n} = ${sg(m - n)} → ${P(a, sg(m - n))}` };
        if (t === 2) return { q: `(${P(a, m)})<sup>${n}</sup> = ${P(a, '?')}`, ans: m * n, hint: T('Üssün üssü → üsleri çarp.'), exp: `${m} × ${n} = ${m * n} → ${P(a, m * n)}` };
        return { q: `${P(a, m)} · ${P(a, '−' + n)} = ${P(a, '?')}`, ans: m - n, hint: T('Çarpma → üsleri topla (negatife dikkat).'), exp: `${m} + (−${n}) = ${sg(m - n)}` }; }
      if (chance(.7)) { let mm; do { mm = R(11, 99); } while (mm % 10 === 0); const big = chance(.55), k = big ? R(3, 8) : -R(2, 6);
        const shown = big ? trNum(mm * 10 ** (k - 1)) : '0,' + '0'.repeat(-k - 1) + mm;
        return { q: `${shown} = ${dec(mm / 10)} × ${P(10, '?')}`, sub: T('Bilimsel gösterim: üs kaç?'), ans: k, hint: big ? T('Virgülü sola kaydırıyorsun: kaç basamak? Üs pozitif.') : T('Virgülü sağa kaydırıyorsun: kaç basamak? Üs negatif.'), exp: T`Virgül ${Math.abs(k)} basamak ${big ? 'sola' : T('sağa')} kaydı → üs ${sg(k)}<br>${shown} = ${dec(mm / 10)} × ${P(10, sg(k))}` }; }
      const a = R(-6, 6) || 2, b = R(-6, 6) || -3;
      return { q: `${P(10, sg(a))} · ${P(10, sg(b))} = ${P(10, '?')}`, ans: a + b, hint: T('Tabanlar aynı → üsleri topla.'), exp: `${sg(a)} + ${pn(b)} = ${sg(a + b)}` };
    } },
  { id: 'karekok', emoji: '🦔', animal: T('Kirpi Diken'), name: T('Kareköklü İfadeler'),
    lesson: [
      [T('Karekök nedir?'), T`Karesi o sayıyı veren pozitif sayı:
       <div class="ex">${SQ(49)} = 7 çünkü 7² = 49<br>Tam kareler: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144...</div>`],
      [T('Hangi iki sayı arasında?'), T`<div class="ex">${SQ(20)} → 16 < 20 < 25 → 4 < ${SQ(20)} < 5</div>
       <div class="tip">🦔 Diken: Hemen altındaki ve üstündeki tam kareyi bul!</div>`],
      [T('a√b şekli ve işlemler'), T`<div class="ex">${SQ(72)} = ${SQ('36 · 2')} = 6${SQ(2)}<br>${SQ(2)} · ${SQ(8)} = ${SQ(16)} = 4<br>3${SQ(5)} + 4${SQ(5)} = 7${SQ(5)}</div>
       <div class="tip">Toplama sadece kök içleri aynıysa yapılır (benzer terimler gibi).</div>`],
    ],
    gen(d) {
      if (d === 1) { if (chance(.5)) { const n = R(2, 15); return { q: `${SQ(n * n)} = ?`, ans: n, hint: T('Hangi sayının karesi bu?'), exp: `${n} × ${n} = ${n * n} → ${SQ(n * n)} = ${n}` }; }
        let N; do { N = R(3, 200); } while (isSq(N)); const a = Math.floor(Math.sqrt(N));
        return { q: T`${SQ(N)} hangi iki ardışık tam sayı arasındadır?`, sub: T('Küçük olanı yaz.'), long: true, ans: a, hint: T`${N} sayısının hemen altındaki tam kareyi bul.`, exp: `${a}² = ${a * a} < ${N} < ${(a + 1) ** 2} = ${a + 1}²<br>${a} < ${SQ(N)} < ${a + 1}` }; }
      if (d === 2) { const b = pick([2, 3, 5, 6, 7]), a = R(2, 7);
        return { q: `${SQ(a * a * b)} = ?${SQ(b)}`, ans: a, hint: T`${a * a * b} sayısını (tam kare) × ${b} olarak yaz.`, exp: T`${a * a * b} = ${a * a} × ${b}<br>${SQ(a * a)} = ${a}<br>Sonuç: ${a}${SQ(b)}` }; }
      const t = R(0, 2), b = pick([2, 3, 5]);
      if (t === 0) { const m = R(1, 4), n = R(1, 4), x = b * m * m, y = b * n * n;
        return { q: `${SQ(x)} · ${SQ(y)} = ?`, ans: b * m * n, hint: T('Kök içlerini çarp: √(x·y)'), exp: `${SQ(x + ' · ' + y)} = ${SQ(x * y)} = ${b * m * n}` }; }
      if (t === 1) { const p = R(2, 9), q = R(1, 9), r = R(1, p + q - 1);
        return { q: `${p}${SQ(b)} + ${q}${SQ(b)} − ${r}${SQ(b)} = ?${SQ(b)}`, ans: p + q - r, hint: T('Kök içleri aynı: katsayıları topla/çıkar.'), exp: `(${p} + ${q} − ${r})${SQ(b)} = ${p + q - r}${SQ(b)}` }; }
      const a = R(2, 5), c = R(2, 5);
      return { q: `${SQ(a * a * b)} + ${SQ(c * c * b)} = ?${SQ(b)}`, ans: a + c, hint: T`Her birini ?${SQ(b)} şekline getir.`, exp: `${SQ(a * a * b)} = ${a}${SQ(b)}<br>${SQ(c * c * b)} = ${c}${SQ(b)}<br>${a}${SQ(b)} + ${c}${SQ(b)} = ${a + c}${SQ(b)}` };
    } },
  { id: 'olasilik', emoji: '🐹', animal: T('Hamster Pofuduk'), name: T('Olasılık'),
    lesson: [
      [T('Olasılık nedir?'), T`<div class="ex">Olasılık = İstenen durum sayısı ÷ Tüm durumlar</div>
       <div class="ex">Torbada 3 🔴 ve 5 🔵 top. Kırmızı çekme olasılığı = ${F(3, 8)}</div>`],
      [T('0 ile 1 arası'), T`<div class="ex">İmkansız olay → <b>0</b> (zarda 7 gelmesi)<br>Kesin olay → <b>1</b> (zarda 7'den küçük gelmesi)<br>Diğer tüm olasılıklar 0 ile 1 arasında</div>
       <div class="tip">🐹 Pofuduk: Önce TÜM durumları say, sonra istediklerini!</div>`],
      [T('Zar ve kartlar'), T`<div class="ex">Zar: 1, 2, 3, 4, 5, 6<br>Çift gelme: {2, 4, 6} → ${F(3, 6)} = ${F(1, 2)}<br>Asal gelme: {2, 3, 5} → ${F(3, 6)}</div>`],
    ],
    gen(d) {
      const base = { sub: T('Kesir olarak yaz. Sadeleştirmen gerekmez.'), frac: true };
      if (d === 1) { const C = [['🔴', T('kırmızı')], ['🔵', T('mavi')], ['🟡', T('sarı')]], cnt = [R(1, 8), R(1, 8), chance(.5) ? R(1, 6) : 0], tot = cnt.reduce((a, b) => a + b, 0); let i; do { i = R(0, 2); } while (!cnt[i]);
        const desc = C.map((c, j) => cnt[j] ? `${cnt[j]} ${c[1]}` : '').filter(Boolean).join(', ');
        return { ...base, q: T`Torbada ${desc} top var. Rastgele çekilen topun ${C[i][1]} olma olasılığı?`, long: true, vis: `<div class="grp" style="font-size:22px">${C.map((c, j) => c[0].repeat(cnt[j])).join('')}</div>`, ans: cnt[i] / tot, at: fracText(cnt[i], tot), hint: T('İstenen top sayısı ÷ toplam top sayısı'), exp: T`${C[i][1]}: ${cnt[i]}, toplam: ${tot}<br>Olasılık = ${F(cnt[i], tot)}` }; }
      if (d === 2) { const N = chance(.4) ? 6 : R(10, 30), dice = N === 6;
        const conds = [[T('çift sayı'), x => x % 2 === 0], [T('tek sayı'), x => x % 2 === 1], [T('3\'ün katı'), x => x % 3 === 0], [T('asal sayı'), isPrime], [dice ? T('4\'ten büyük') : T('5\'in katı'), dice ? (x => x > 4) : (x => x % 5 === 0)]], [cn, f] = pick(conds);
        const good = [...Array(N).keys()].map(x => x + 1).filter(f);
        return { ...base, q: dice ? T`🎲 Bir zar atılıyor. ${cn} gelme olasılığı?` : T`1'den ${N}'e kadar numaralı kartlardan biri çekiliyor. ${cn} olma olasılığı?`, long: true, ans: good.length / N, at: fracText(good.length, N), hint: T('Uygun olanları tek tek yaz ve say.'), exp: T`Uygun olanlar: ${good.join(', ')} → ${good.length} tane<br>Tüm durumlar: ${N}<br>Olasılık = ${F(good.length, N)}` }; }
      let a, b; do { a = R(1, 4); b = R(a + 1, 7); } while (gcd(a, b) !== 1); const k = R(2, 4), r = a * k, tot = b * k;
      return { q: T`Torbada ${r} kırmızı top ve bir miktar mavi top var. Kırmızı top çekme olasılığı ${F(a, b)} ise kaç mavi top vardır?`, long: true, ans: tot - r, hint: T`${F(a, b)} = ${F(r, '?')} → toplam top sayısını bul.`, exp: T`${F(a, b)} = ${F(r, tot)} (${k} ile genişlet)<br>Toplam: ${tot} top<br>Mavi: ${tot} − ${r} = ${tot - r}` };
    } },
  { id: 'ozdeslik', emoji: '🐺', animal: T('Kurt Boz'), name: T('Özdeşlikler & Çarpanlara Ayırma'),
    lesson: [
      [T('İki terim toplamının karesi'), T`<div class="ex">(a + b)² = a² + <b>2ab</b> + b²<br>(${X} + 3)² = ${X}² + 6${X} + 9</div>
       <div class="tip">🐺 Boz: Ortadaki "2ab" terimini unutma! (${X} + 3)² ≠ ${X}² + 9</div>`],
      [T('Fark ve iki kare farkı'), `<div class="ex">(a − b)² = a² − 2ab + b²<br>(a + b)(a − b) = a² − b²<br>${X}² − 49 = (${X} − 7)(${X} + 7)</div>`],
      [T('Ortak çarpan & hızlı hesap'), `<div class="ex">6${X} + 15 = 3(2${X} + 5)<br>51² = (50 + 1)² = 2500 + 100 + 1 = 2601<br>99 · 101 = (100 − 1)(100 + 1) = 10000 − 1 = 9999</div>`],
    ],
    gen(d) {
      if (d === 1) { if (chance(.65)) { const a = nz(-9, 9), askX = chance(.5);
          return { q: T`(${X}${tm(a, '')})² açılımında ${askX ? X + T(' teriminin katsayısı') : T('sabit terim')} kaçtır?`, long: true, ans: askX ? 2 * a : a * a, hint: '(a + b)² = a² + 2ab + b²', exp: `(${X}${tm(a, '')})² = ${X}²${tm(2 * a, X)}${tm(a * a, '')}` }; }
        const a = nz(-7, 7), b = nz(-7, 7), askX = chance(.5);
        return { q: T`(${X}${tm(a, '')})(${X}${tm(b, '')}) çarpımında ${askX ? X + T(' teriminin katsayısı') : T('sabit terim')} kaçtır?`, long: true, ans: askX ? a + b : a * b, hint: T('Her terimi her terimle çarp.'), exp: `${X}·${X}${tm(b, X)}${tm(a, X)}${tm(a * b, '')}<br>= ${X}²${tm(a + b, X)}${tm(a * b, '')}` }; }
      if (d === 2) { const t = R(0, 2);
        if (t === 0) { const a = R(2, 12); return { q: `${X}² − ${a * a} = (${X} − ?)(${X} + ?)`, ans: a, hint: T('İki kare farkı: a² − b² = (a − b)(a + b)'), exp: `${a * a} = ${a}²<br>${X}² − ${a}² = (${X} − ${a})(${X} + ${a})` }; }
        if (t === 1) { let a, b; do { a = R(1, 9); b = R(1, 12); } while (gcd(a, b) !== 1); const k = R(2, 9);
          return { q: `${k * a}${X} + ${k * b} = ?(${a === 1 ? '' : a}${X} + ${b})`, ans: k, hint: T`${k * a} ve ${k * b} sayılarının ortak böleni (EBOB).`, exp: T`EBOB(${k * a}, ${k * b}) = ${k}<br>${k * a}${X} + ${k * b} = ${k}(${a === 1 ? '' : a}${X} + ${b})` }; }
        const a = R(2, 12); return { q: `(${X} + ${a})(${X} − ${a}) = ${X}² − ?`, ans: a * a, hint: '(a + b)(a − b) = a² − b²', exp: `(${X} + ${a})(${X} − ${a}) = ${X}² − ${a}² = ${X}² − ${a * a}` }; }
      const t = R(0, 2);
      if (t === 0) { const base = pick([20, 30, 40, 50, 100]), dd = nz(-3, 3), n = base + dd;
        return { q: `${n}² = ?`, sub: T`İpucu: ${n} = ${base} ${dd > 0 ? '+' : '−'} ${Math.abs(dd)}`, ans: n * n, hint: T`(${base} ${dd > 0 ? '+' : '−'} ${Math.abs(dd)})² özdeşliğini kullan.`, exp: `(${base} ${dd > 0 ? '+' : '−'} ${Math.abs(dd)})² = ${base * base} ${dd > 0 ? '+' : '−'} ${2 * base * Math.abs(dd)} + ${dd * dd} = ${n * n}` }; }
      if (t === 1) { const base = pick([20, 30, 40, 50, 100]), dd = R(1, 5);
        return { q: `${base - dd} · ${base + dd} = ?`, ans: base * base - dd * dd, hint: T`(${base} − ${dd})(${base} + ${dd}) → iki kare farkı`, exp: `${base}² − ${dd}² = ${base * base} − ${dd * dd} = ${base * base - dd * dd}` }; }
      const b = R(10, 60), a = b + R(1, 6);
      return { q: `${a}² − ${b}² = ?`, ans: a * a - b * b, hint: 'a² − b² = (a − b)(a + b)', exp: `(${a} − ${b})(${a} + ${b}) = ${a - b} × ${a + b} = ${a * a - b * b}` };
    } },
  { id: 'dogru', emoji: '🐆', animal: T('Leopar Hızlı'), name: T('Doğrusal Denklemler & Eğim'),
    lesson: [
      [T('Doğru denklemi'), T`<div class="ex">y = 2${X} + 3<br>${X} = 4 → y = 2 · 4 + 3 = <b>11</b> → (4, 11) noktası doğrunun üzerinde</div>`],
      [T('Eğim'), T`Eğim = dikey değişim ÷ yatay değişim
       <div class="ex">(1, 3) ve (4, 9) → eğim = ${F('9 − 3', '4 − 1')} = ${F(6, 3)} = <b>2</b></div>
       <div class="tip">🐆 Hızlı: y = m${X} + n denkleminde m eğimdir, n y eksenini kestiği yer!</div>`],
      [T('Eksenleri kestiği noktalar'), T`<div class="ex">y eksenini kestiği nokta → ${X} = 0 koy<br>${X} eksenini kestiği nokta → y = 0 koy<br>y = 2${X} − 6 → 0 = 2${X} − 6 → ${X} = <b>3</b></div>`],
    ],
    gen(d) {
      if (d === 1) { const m = nz(-4, 5), n = R(-9, 9), x = nz(-5, 6), y = m * x + n;
        return { q: `y = ${lin(m, n)}`, sub: T`${X} = ${sg(x)} iken y kaçtır?`, ans: y, hint: T`${X} yerine ${sg(x)} koy.`, exp: `y = ${m} · ${pn(x)} ${tm(n, '') || '+ 0'} = ${sg(y)}` }; }
      if (d === 2) { if (chance(.65)) { const m = nz(-4, 4), x1 = R(-5, 5), dx = nz(-4, 4), x2 = x1 + dx, b = R(-6, 6), y1 = m * x1 + b, y2 = m * x2 + b;
          return { q: T`(${sg(x1)}, ${sg(y1)}) ve (${sg(x2)}, ${sg(y2)}) noktalarından geçen doğrunun eğimi?`, long: true, ans: m, hint: T('Eğim = (y₂ − y₁) ÷ (x₂ − x₁)'), exp: `${F(sg(y2) + ' − ' + pn(y1), sg(x2) + ' − ' + pn(x1))} = ${F(sg(y2 - y1), sg(x2 - x1))} = ${sg(m)}` }; }
        const m = nz(-5, 5), n = nz(-9, 9); return { q: `y = ${lin(m, n)}`, sub: T('Doğrunun y eksenini kestiği noktanın y değeri?'), ans: n, hint: T`${X} = 0 koy.`, exp: `${X} = 0 → y = ${sg(n)}` }; }
      if (chance(.5)) { const m = nz(-5, 5), t = nz(-6, 6), n = -m * t;
        return { q: `y = ${lin(m, n)}`, sub: T`Doğrunun ${X} eksenini kestiği noktanın ${X} değeri?`, ans: t, hint: T('y = 0 koy ve x\'i bul.'), exp: `0 = ${lin(m, n)}<br>${m}${X} = ${sg(-n)}<br>${X} = ${sg(t)}` }; }
      const m = nz(-4, 4), p = nz(-5, 5), q = R(-10, 10), n = q - m * p;
      return { q: T`y = ${m === 1 ? '' : m === -1 ? '−' : m}${X} + n doğrusu (${sg(p)}, ${sg(q)}) noktasından geçiyor. n kaçtır?`, long: true, ans: n, hint: T`${X} = ${sg(p)}, y = ${sg(q)} yerine koy.`, exp: `${sg(q)} = ${m} · ${pn(p)} + n<br>${sg(q)} = ${sg(m * p)} + n<br>n = ${sg(n)}` };
    } },
  { id: 'esitsizlik', emoji: '🐜', animal: T('Karınca Çalışkan'), name: T('Eşitsizlikler'),
    lesson: [
      [T('Semboller'), T`<div class="ex">&lt; küçüktür, &gt; büyüktür, ≤ küçük eşit, ≥ büyük eşit<br>−2 &lt; ${X} ≤ 3 → ${X} = −1, 0, 1, 2, 3 (tam sayılar)</div>
       <div class="tip">Sayı doğrusunda: &lt; ve &gt; için içi boş ○, ≤ ve ≥ için içi dolu ● daire.</div>`],
      [T('Çözme'), T`Denklem gibi çözülür:
       <div class="ex">2${X} + 3 &lt; 15 → 2${X} &lt; 12 → ${X} &lt; 6<br>En büyük tam sayı: <b>5</b></div>`],
      [T('Negatifle çarpma/bölme'), T`İki tarafı <b>negatif</b> sayıyla çarpar ya da bölersen <b>yön değişir!</b>
       <div class="ex">−3${X} ≥ 12 → ${X} ≤ −4 (−3'e bölünce ≥ oldu ≤)</div>
       <div class="tip">🐜 Çalışkan: En çok yapılan hata bu! Negatife böldün mü, oku çevir!</div>`],
    ],
    gen(d) {
      const ops = ['<', '≤', '>', '≥'];
      if (d === 1) { const lo = R(-7, 3), hi = lo + R(2, 8), o1 = pick(['<', '≤']), o2 = pick(['<', '≤']); const sol = [];
        for (let x = lo - 1; x <= hi + 1; x++) if (OPS[o1].f(lo, x) && OPS[o2].f(x, hi)) sol.push(x);
        return { q: `${sg(lo)} ${oh(o1)} ${X} ${oh(o2)} ${sg(hi)}`, sub: T('Bu eşitsizliği sağlayan kaç tam sayı var?'), ans: sol.length, hint: T`≤ sınırı dahil eder, < etmez. Sayıları tek tek yaz.`, exp: T`${o1 === '<' ? sg(lo) + T(' dahil değil') : sg(lo) + T(' dahil')}, ${o2 === '<' ? sg(hi) + T(' dahil değil') : sg(hi) + T(' dahil')}<br>${sol.map(sg).join(', ')} → ${sol.length} tane` }; }
      let a = d === 2 ? R(2, 6) : -R(2, 6), b = R(-12, 12), c = R(-15, 20), o = pick(ops);
      const sol = []; for (let x = -200; x <= 200; x++) if (OPS[o].f(a * x + b, c)) sol.push(x);
      if (!sol.length || (sol.includes(-200) && sol.includes(200))) return this.gen(d);
      const askMax = !sol.includes(200), ans = askMax ? Math.max(...sol) : Math.min(...sol), o2 = a < 0 ? OPS[o].fl : o;
      return { q: `${a}${X}${tm(b, '')} ${oh(o)} ${sg(c)}`, sub: T`Eşitsizliği sağlayan en ${askMax ? T('büyük') : T('küçük')} tam sayı ${X}?`, ans,
        hint: a < 0 ? T`Dikkat: negatif sayıya (${a}) bölünce yön değişir!` : (b >= 0 ? T`Önce iki taraftan ${b} çıkar, sonra ${a} ile böl.` : T`Önce iki tarafa ${-b} ekle, sonra ${a} ile böl.`),
        exp: T`${a}${X} ${oh(o)} ${sg(c - b)}<br>${a} ile böl${a < 0 ? T(' (negatif → yön değişir!)') : ''}: ${X} ${oh(o2)} ${fracText(c - b, a)}<br>En ${askMax ? T('büyük') : T('küçük')} tam sayı: ${sg(ans)}` };
    } },
  { id: 'ucgen', emoji: '🐫', animal: T('Deve Hörgüç'), name: T('Üçgenler & Pisagor'),
    lesson: [
      [T('Açılar'), T`<div class="ex">İç açılar toplamı 180°<br>Dış açı = komşu olmayan iki iç açının toplamı<br>İkizkenar üçgende taban açıları eşit</div>`],
      [T('Üçgen eşitsizliği'), T`Bir kenar, diğer ikisinin <b>farkından büyük, toplamından küçük</b>:
       <div class="ex">Kenarlar 5 ve 8 → 3 &lt; üçüncü kenar &lt; 13<br>En büyük tam sayı: 12, en küçük: 4</div>`],
      [T('Pisagor bağıntısı'), T`Dik üçgende: <b>a² + b² = c²</b> (c = hipotenüs, dik açının karşısı)
       <div class="ex">3, 4 → 9 + 16 = 25 → c = <b>5</b></div>
       <div class="tip">🐫 Hörgüç'ün ezberi: 3-4-5, 5-12-13, 8-15-17, 7-24-25 ve katları (6-8-10...)</div>`],
    ],
    gen(d) {
      if (d === 1) { const t = R(0, 1);
        if (t === 0) { const a = R(25, 85), b = R(25, 85); return { q: T`Bir üçgenin iki iç açısı ${a}° ve ${b}°. Bu iki açıya komşu olmayan dış açı kaç derece?`, long: true, ans: a + b, hint: T('Dış açı = komşu olmayan iki iç açının toplamı.'), exp: `${a} + ${b} = ${a + b}°` }; }
        const tp = 2 * R(10, 75); return { q: T`İkizkenar üçgenin tepe açısı ${tp}°. Taban açılarından biri kaç derece?`, long: true, ans: (180 - tp) / 2, hint: T('Taban açıları eşit. Kalan açıyı ikiye böl.'), exp: `180 − ${tp} = ${180 - tp}<br>${180 - tp} ÷ 2 = ${(180 - tp) / 2}°` }; }
      if (d === 2) { const a = R(3, 15), b = R(3, 15), t = R(0, 2), mx = a + b - 1, mn = Math.abs(a - b) + 1;
        const q = T`Bir üçgenin iki kenarı ${a} cm ve ${b} cm.`;
        if (t === 0) return { q: q + T(' Üçüncü kenar en çok kaç cm olabilir? (tam sayı)'), long: true, ans: mx, hint: T('Üçüncü kenar, toplamdan küçük olmalı.'), exp: T`${Math.abs(a - b)} < kenar < ${a + b}<br>En büyük tam sayı: ${mx}` };
        if (t === 1) return { q: q + T(' Üçüncü kenar en az kaç cm olabilir? (tam sayı)'), long: true, ans: mn, hint: T('Üçüncü kenar, farktan büyük olmalı.'), exp: T`${Math.abs(a - b)} < kenar < ${a + b}<br>En küçük tam sayı: ${mn}` };
        return { q: q + T(' Üçüncü kenar kaç farklı tam sayı değeri alabilir?'), long: true, ans: mx - mn + 1, hint: T('Fark ile toplam arasındaki tam sayıları say.'), exp: T`${Math.abs(a - b)} < kenar < ${a + b}<br>${mn}'den ${mx}'e: ${mx - mn + 1} tane` }; }
      const [p, q, r] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]), k = r > 20 ? 1 : R(1, 3), a = p * k, b = q * k, c = r * k, t = R(0, 2);
      if (t === 0) return { q: T('Hipotenüs kaç cm?'), vis: rightTri(a, b, a + ' cm', b + ' cm', '?'), ans: c, hint: 'a² + b² = c²', exp: `${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}<br>c = ${SQ(c * c)} = ${c} cm` };
      if (t === 1) return { q: T('Soru işaretli dik kenar kaç cm?'), vis: rightTri(a, b, '?', b + ' cm', c + ' cm'), ans: a, hint: T('Dik kenar² = hipotenüs² − diğer dik kenar²'), exp: `${c}² − ${b}² = ${c * c} − ${b * b} = ${a * a}<br>${SQ(a * a)} = ${a} cm` };
      return { q: T('Soru işaretli dik kenar kaç cm?'), vis: rightTri(a, b, a + ' cm', '?', c + ' cm'), ans: b, hint: T('Dik kenar² = hipotenüs² − diğer dik kenar²'), exp: `${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}<br>${SQ(b * b)} = ${b} cm` };
    } },
  { id: 'cisim', emoji: '🦭', animal: T('Fok Buzlu'), name: T('Prizmalar & Silindir'),
    lesson: [
      [T('Dikdörtgenler prizması'), T`<div class="ex">Hacim = en × boy × yükseklik<br>Küp: hacim = a³, yüzey alanı = 6 · a²</div>
       <div class="tip">🦭 Buzlu: Hacim = içine kaç tane 1 cm³ küp sığar!</div>`],
      [T('Yüzey alanı'), T`Bütün yüzlerin alanları toplamı:
       <div class="ex">Prizma: 2 · (a·b + a·c + b·c)<br>2, 3, 4 → 2 · (6 + 8 + 12) = <b>52</b></div>`],
      [T('Silindir'), T`<div class="ex">Hacim = taban alanı × yükseklik = π · r² · h<br>r = 2, h = 5, π = 3 → 3 · 4 · 5 = <b>60</b><br>Yanal alan = 2 · π · r · h</div>`],
    ],
    gen(d) {
      if (d === 1) { if (chance(.65)) { const a = R(2, 10), b = R(2, 8), c = R(2, 9);
          return { q: T('Dikdörtgenler prizmasının hacmi kaç cm³?'), vis: boxSVG(a, b, c), ans: a * b * c, hint: T('en × boy × yükseklik'), exp: `${a} × ${b} × ${c} = ${a * b * c} cm³` }; }
        const a = R(2, 9); return { q: T`Bir ayrıtı ${a} cm olan küpün hacmi kaç cm³?`, long: true, ans: a ** 3, hint: 'a × a × a', exp: `${a} × ${a} × ${a} = ${a ** 3} cm³` }; }
      if (d === 2) { const t = R(0, 2);
        if (t === 0) { const a = R(2, 9); return { q: T`Bir ayrıtı ${a} cm olan küpün yüzey alanı kaç cm²?`, long: true, ans: 6 * a * a, hint: T('Küpün 6 eş kare yüzü var.'), exp: T`Bir yüz: ${a} × ${a} = ${a * a}<br>6 × ${a * a} = ${6 * a * a} cm²` }; }
        const a = R(2, 9), b = R(2, 8), c = R(2, 8);
        if (t === 1) return { q: T('Prizmanın yüzey alanı kaç cm²?'), vis: boxSVG(a, b, c), ans: 2 * (a * b + a * c + b * c), hint: T('Karşılıklı yüzler eşit: 2 × (ab + ac + bc)'), exp: `${a}·${b} = ${a * b}, ${a}·${c} = ${a * c}, ${b}·${c} = ${b * c}<br>2 × (${a * b} + ${a * c} + ${b * c}) = ${2 * (a * b + a * c + b * c)} cm²` };
        return { q: T`Hacmi ${a * b * c} cm³ olan prizmanın tabanı ${a} cm × ${b} cm. Yüksekliği kaç cm?`, long: true, ans: c, hint: T('Hacim = taban alanı × yükseklik'), exp: T`Taban alanı: ${a} × ${b} = ${a * b}<br>${a * b * c} ÷ ${a * b} = ${c} cm` }; }
      const r = R(1, 7), h = R(2, 12), t = R(0, 2), sub = T('π = 3 alınız.');
      if (t === 0) return { q: T('Silindirin hacmi kaç cm³?'), sub, vis: cylSVG(r, h), ans: 3 * r * r * h, hint: 'π · r² · h', exp: `3 × ${r}² × ${h} = 3 × ${r * r} × ${h} = ${3 * r * r * h} cm³` };
      if (t === 1) return { q: T('Silindirin yanal alanı kaç cm²?'), sub, vis: cylSVG(r, h), ans: 6 * r * h, hint: T('2 · π · r · h (açınca dikdörtgen olur)'), exp: `2 × 3 × ${r} × ${h} = ${6 * r * h} cm²` };
      return { q: T`Hacmi ${3 * r * r * h} cm³, yarıçapı ${r} cm olan silindirin yüksekliği kaç cm?`, sub, long: true, ans: h, hint: T('Hacim = π · r² · h → h = hacim ÷ (π · r²)'), exp: T`Taban alanı: 3 × ${r}² = ${3 * r * r}<br>h = ${3 * r * r * h} ÷ ${3 * r * r} = ${h} cm` };
    } },
  ];

  const r7 = REGIONS.push({ name: T('Rasyonel Adası'), grade: '7', emoji: '🏝️', sub: T('Tam sayılar, rasyoneller, denklem, orantı, açılar, çember, veri'), bg: '#e2f5ea' }) - 1;
  const r8 = REGIONS.push({ name: T('LGS Zirvesi'), grade: '8', emoji: '🌋', sub: T('Üslü, köklü, olasılık, özdeşlik, eğim, eşitsizlik, üçgen, cisimler'), bg: '#f6e1e6' }) - 1;
  G7.forEach(t => { t.region = r7; TOPICS.push(t); });
  G8.forEach(t => { t.region = r8; TOPICS.push(t); });
  home();
})();
