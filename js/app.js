'use strict';
/* =========================================================
   Matematik Safarisi — hayvanlarla kademe kademe matematik
   ========================================================= */

// ---------- yardımcılar ----------
const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const chance = p => Math.random() < p;
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a, b) => a / gcd(a, b) * b;
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const F = (n, d) => `<span class="frac"><span>${sg(n)}</span><span>${d}</span></span>`;
function sg(x) { return (typeof x === 'number' && x < 0) ? '−' + (-x) : String(x); }      // −3
const pn = x => x < 0 ? `(−${-x})` : String(x);                                          // (−3)
const dec = x => { const r = Math.round(x * 10000) / 10000; return sg(r).replace('.', DECSEP); };
const P = (a, n) => `${a}<sup>${n}</sup>`;
const X = '<span class="x">x</span>';
const hl = s => `<span class="hl">${s}</span>`;
const isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const factor = n => { const f = []; let p = 2; while (n > 1) { while (n % p === 0) { f.push(p); n /= p; } p++; } return f; };
const divisors = n => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };
const digits = n => String(n).split('').map(Number);
const places = n => { const s = String(n), o = []; for (let i = 0; i < s.length; i++) { const v = +s[i] * 10 ** (s.length - 1 - i); if (v) o.push(v); } return o; };
const fracText = (n, d) => { const g = gcd(n, d); n /= g; d /= g; if (d < 0) { n = -n; d = -d; } return d === 1 ? sg(n) : F(n, d); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

// ---------- görseller ----------
function groups(a, b, e) { let h = '<div class="grp">'; for (let i = 0; i < a; i++) h += `<div>${e.repeat(b)}</div>`; return h + '</div>'; }
function fbar(n, d) { let h = '<div class="fbar">'; for (let i = 0; i < d; i++) h += `<i class="${i < n ? 'on' : ''}"></i>`; return h + '</div>'; }
function numline(start) {
  const x = v => 14 + (v + 10) * 17;
  let s = `<svg viewBox="0 0 368 62" width="368"><line x1="6" y1="30" x2="362" y2="30" stroke="#2d2a32" stroke-width="3"/>`;
  for (let v = -10; v <= 10; v++) {
    s += `<line x1="${x(v)}" y1="${v % 5 ? 24 : 20}" x2="${x(v)}" y2="${v % 5 ? 36 : 40}" stroke="#2d2a32" stroke-width="${v === 0 ? 3 : 2}"/>`;
    s += `<text x="${x(v)}" y="56" font-size="11" text-anchor="middle" fill="#2d2a32" font-weight="${v === 0 ? 800 : 500}">${v < 0 ? '−' + (-v) : v}</text>`;
  }
  s += `<text x="${x(start)}" y="15" font-size="18" text-anchor="middle">🐬</text><circle cx="${x(start)}" cy="30" r="6" fill="#3d8bff"/></svg>`;
  return s;
}
function rectSVG(w, h, grid) {
  const s = Math.min(250 / w, 130 / h, 26), W = w * s, H = h * s;
  let g = '';
  if (grid) { for (let i = 1; i < w; i++) g += `<line x1="${20 + i * s}" y1="10" x2="${20 + i * s}" y2="${10 + H}" stroke="#ffb15c" stroke-width="1.5"/>`; for (let j = 1; j < h; j++) g += `<line x1="20" y1="${10 + j * s}" x2="${20 + W}" y2="${10 + j * s}" stroke="#ffb15c" stroke-width="1.5"/>`; }
  return T`<svg viewBox="0 0 ${W + 90} ${H + 44}" width="${W + 90}"><rect x="20" y="10" width="${W}" height="${H}" fill="#fff1d6" stroke="#2d2a32" stroke-width="3" rx="2"/>${g}
  <text x="${20 + W / 2}" y="${H + 34}" text-anchor="middle" font-size="17" font-weight="700" fill="#2d2a32">${w} cm</text>
  <text x="${28 + W}" y="${14 + H / 2}" font-size="17" font-weight="700" fill="#2d2a32">${h} cm</text></svg>`;
}
function triSVG(b, h) {
  const s = Math.min(240 / b, 130 / h, 18), B = b * s, H = h * s, ax = 20 + B * 0.35;
  return T`<svg viewBox="0 0 ${B + 50} ${H + 46}" width="${B + 50}"><polygon points="20,${10 + H} ${20 + B},${10 + H} ${ax},10" fill="#e3f1ff" stroke="#2d2a32" stroke-width="3"/>
  <line x1="${ax}" y1="10" x2="${ax}" y2="${10 + H}" stroke="#e8475a" stroke-width="2.5" stroke-dasharray="6 4"/>
  <text x="${ax + 6}" y="${14 + H / 2}" font-size="16" font-weight="700" fill="#e8475a">h = ${h} cm</text>
  <text x="${20 + B / 2}" y="${H + 36}" text-anchor="middle" font-size="17" font-weight="700" fill="#2d2a32">taban = ${b} cm</text></svg>`;
}

// ---------- sık kullanılan açıklama adımları ----------
function addSteps(a, b) { let c = a, st = []; for (const p of places(b)) { st.push(`${c} + ${p} = ${c + p}`); c += p; } return st.join('<br>'); }
function subSteps(a, b) { let c = a, st = []; for (const p of places(b)) { st.push(`${c} − ${p} = ${c - p}`); c -= p; } return st.join('<br>'); }
function powStep(a, n) { if (n === 0) return T`${P(a, 0)} = 1 (sıfırıncı kuvvet her zaman 1)`; return `${P(a, n)} = ${Array(n).fill(a).join(' × ')} = ${a ** n}`; }
function ladder(n) { let c = n, s = []; for (const p of factor(n)) { s.push(`${c} ÷ ${hl(p)} = ${c / p}`); c /= p; } return s.join('<br>'); }
function factorText(n) { const f = factor(n), m = {}; f.forEach(p => m[p] = (m[p] || 0) + 1); return Object.keys(m).map(p => m[p] > 1 ? P(p, m[p]) : p).join(' × '); }
const yesNo = ok => ({ choices: [{ h: T('Evet ✔️'), ok }, { h: T('Hayır ✖️'), ok: !ok }], fixed: true });

// =========================================================
//                      KONULAR
// =========================================================
const REGIONS = [
  { name: T('Sayı Ormanı'), grade: '3–5', emoji: '🌳', sub: T('Dört işlemin sırları'), bg: '#dff3d6' },
  { name: T('Asal Dağları'), grade: '5–6', emoji: '🏔️', sub: T('Kuvvetler, bölenler, katlar'), bg: '#e4ecf8' },
  { name: T('Kesir Okyanusu'), grade: '4–6', emoji: '🌊', sub: T('Negatifler ve kesirler'), bg: '#d9f1f6' },
  { name: T('Büyük Savana'), grade: '5–6', emoji: '🌅', sub: T('Ondalık, yüzde, denklem, alan'), bg: '#fbe8cf' },
];
// Her konunun MEB müfredatındaki yaklaşık sınıfı
const GRADES = { say: 1, basamak: 2, ilk: 1, topla: 3, carp: 3, bol: 4, oncelik: 5, us: 5, bolunebilme: 6, asal: 6, ebob: 6, tam: 6, kesir: 4, kesirtopla: 5, kesircarp: 6, ondalik: 5, yuzde: 6, cebir: 6, alan: 5,
  tamcarp: 7, rasyonel: 7, cebir7: 7, denklem7: 7, oranti: 7, aci: 7, cember: 7, veri: 7, us8: 8, karekok: 8, olasilik: 8, ozdeslik: 8, dogru: 8, esitsizlik: 8, ucgen: 8, cisim: 8 };

const TOPICS = [
// ---------------------------------------------------------- 1
{ id: 'topla', region: 0, emoji: '🐰', animal: T('Tavşan Pıtpıt'), name: T('Toplama & Çıkarma'),
  lesson: [
    [T('Sayıları parçala!'), T`Büyük sayıları zihinden toplamanın sırrı: <b>ikinci sayıyı basamaklarına ayır</b>, sonra parça parça ekle.
     <div class="ex"><b>47 + 38</b><br>38 = 30 + 8<br>47 + 30 = 77<br>77 + 8 = <b>85</b></div>
     <div class="tip">🐰 Pıtpıt der ki: Önce büyük parçayı (onlukları) ekle, en son birlikleri!</div>`],
    [T('Çıkarma da aynı'), T`Çıkarırken de parça parça geri zıpla:
     <div class="ex"><b>632 − 285</b><br>285 = 200 + 80 + 5<br>632 − 200 = 432<br>432 − 80 = 352<br>352 − 5 = <b>347</b></div>
     <div class="tip">Kontrol et: 347 + 285 = 632 ✔️ Çıkarmanın sağlaması toplamadır.</div>`],
    [T('Bilinmeyen sayı'), T`<b>? + 45 = 120</b> gibi sorularda: toplamdan bilineni çıkar.
     <div class="ex">? = 120 − 45 = <b>75</b></div>
     <div class="tip">Toplama ile çıkarma kardeştir; biri diğerini geri alır.</div>`],
  ],
  gen(d) {
    let a, b;
    if (d === 3 && chance(.6)) {
      if (chance(.5)) { a = R(25, 480); b = R(15, 299); const c = a + b;
        return { q: `? + ${b} = ${c}`, ans: a, hint: T`Toplamdan bilineni çıkar: ${c} − ${b}`, exp: `? = ${c} − ${b}<br>${subSteps(c, b)}` }; }
      a = R(200, 900); b = R(30, a - 20); const c = a - b;
      return { q: `${a} − ? = ${c}`, ans: b, hint: T`Ne kadar geri gittik? ${a} − ${c}`, exp: `? = ${a} − ${c}<br>${subSteps(a, c)}` };
    }
    if (d === 1) { a = R(15, 79); b = R(11, 49); } else if (d === 2) { a = R(120, 699); b = R(105, 299); } else { a = R(1200, 6999); b = R(1050, 2999); }
    if (chance(.5)) return { q: `${a} + ${b} = ?`, ans: a + b, hint: T`${b} sayısını parçala: ${places(b).join(' + ')}. Sonra sırayla ekle.`, exp: `${b} = ${places(b).join(' + ')}<br>${addSteps(a, b)}` };
    const s = a + b;
    return { q: `${s} − ${b} = ?`, ans: a, hint: T`${b} sayısını parçala: ${places(b).join(' + ')}. Sonra sırayla çıkar.`, exp: `${b} = ${places(b).join(' + ')}<br>${subSteps(s, b)}` };
  } },
// ---------------------------------------------------------- 2
{ id: 'carp', region: 0, emoji: '🐵', animal: T('Maymun Muzo'), name: T('Çarpma'),
  lesson: [
    [T('Çarpma = tekrarlı toplama'), T`<b>4 × 3</b> demek: 4 tane 3'lü grup.
     <div class="ex">🍌🍌🍌<br>🍌🍌🍌<br>🍌🍌🍌<br>🍌🍌🍌<br>3 + 3 + 3 + 3 = <b>12</b></div>
     <div class="tip">Sıra fark etmez: 4 × 3 = 3 × 4. Kolay olanı seç!</div>`],
    [T('5 köprüsü & 9 hilesi'), T`Zor çarpımları kolay parçalara ayır:
     <div class="ex"><b>7 × 8</b> = 7 × 5 + 7 × 3 = 35 + 21 = <b>56</b></div>
     <div class="ex"><b>6 × 9</b> = 6 × 10 − 6 = 60 − 6 = <b>54</b></div>
     <div class="tip">🐵 Muzo: 9 ile çarpmak = 10 ile çarp, bir tane geri ver!</div>`],
    [T('İki basamaklı sayılar'), T`Sayıyı onluk + birlik diye ayır:
     <div class="ex"><b>23 × 4</b><br>20 × 4 = 80<br>3 × 4 = 12<br>80 + 12 = <b>92</b></div>`],
  ],
  gen(d) {
    if (d === 1) { const a = R(2, 5), b = R(2, 10);
      return { q: `${a} × ${b} = ?`, vis: a * b <= 40 ? groups(a, b, '🍌') : '', ans: a * b, hint: T`${a} tane ${b} sayısını topla.`, exp: `${Array(a).fill(b).join(' + ')} = ${a * b}` }; }
    if (d === 2) { const a = R(6, 9), b = R(3, 10);
      if (chance(.25)) return { q: `${a} × ? = ${a * b}`, ans: b, hint: T`${a} ile hangi sayıyı çarparsan ${a * b} olur? Çarpım tablosunda ${a}'lar satırını düşün.`, exp: T`${a} × ${b} = ${a * b}<br>Yani ${a * b} ÷ ${a} = ${b}` };
      let exp, hint;
      if (a === 9 || b === 9) { const o = a === 9 ? b : a; exp = `${o} × 9 = ${o} × 10 − ${o}<br>= ${o * 10} − ${o} = ${o * 9}`; hint = T('9 hilesi: 10 ile çarp, sonra bir tanesini çıkar.'); }
      else if (b > 5) { exp = `${a} × ${b} = ${a} × 5 + ${a} × ${b - 5}<br>= ${a * 5} + ${a * (b - 5)} = ${a * b}`; hint = T`5 köprüsü: önce ${a} × 5, sonra kalan ${b - 5} tane ${a}.`; }
      else { exp = `${a} × ${b} = 5 × ${b} + ${a - 5} × ${b}<br>= ${5 * b} + ${(a - 5) * b} = ${a * b}`; hint = T`5 köprüsü: önce 5 × ${b}, sonra kalan ${a - 5} tane ${b}.`; }
      return { q: `${a} × ${b} = ?`, ans: a * b, hint, exp };
    }
    let a; do { a = R(12, 49); } while (a % 10 === 0);
    const b = R(3, 9), t = a - a % 10, o = a % 10;
    return { q: `${a} × ${b} = ?`, ans: a * b, hint: T`${a} = ${t} + ${o}. İkisini ayrı ayrı ${b} ile çarp.`, exp: `${t} × ${b} = ${t * b}<br>${o} × ${b} = ${o * b}<br>${t * b} + ${o * b} = ${a * b}` };
  } },
// ---------------------------------------------------------- 3
{ id: 'bol', region: 0, emoji: '🐧', animal: T('Penguen Pino'), name: T('Bölme'),
  lesson: [
    [T('Bölme = paylaştırma'), T`<b>12 ÷ 3</b>: 12 balığı 3 penguene eşit paylaştır.
     <div class="ex">🐟🐟🐟🐟 | 🐟🐟🐟🐟 | 🐟🐟🐟🐟<br>Her birine <b>4</b> düşer.</div>
     <div class="tip">🐧 Pino'nun sorusu: "3 kere kaç 12 eder?" → 3 × 4 = 12. Bölme, çarpmanın tersidir!</div>`],
    [T('Büyük sayıları böl'), T`Sayıyı kolay bölünen parçalara ayır:
     <div class="ex"><b>252 ÷ 6</b><br>252 = 240 + 12<br>240 ÷ 6 = 40<br>12 ÷ 6 = 2<br>40 + 2 = <b>42</b></div>`],
    [T('Kalanlı bölme'), T`<b>47 ÷ 5</b>: 5'in 47'yi geçmeyen en büyük katı 45 (5 × 9).
     <div class="ex">Bölüm = <b>9</b>, Kalan = 47 − 45 = <b>2</b></div>
     <div class="tip">Kalan her zaman bölenden <b>küçük</b> olmalı!</div>`],
  ],
  gen(d) {
    if (d === 1) { const b = R(2, 9), q = R(2, 10), a = b * q;
      return { q: `${a} ÷ ${b} = ?`, ans: q, hint: T`Kendine sor: ${b} × ? = ${a}`, exp: T`${b} × ${q} = ${a} olduğu için<br>${a} ÷ ${b} = ${q}` }; }
    if (d === 2) { const b = R(3, 9); let q; do { q = R(12, 60); } while (q % 10 === 0);
      const a = b * q, qt = q - q % 10, qo = q % 10, a1 = b * qt, a2 = b * qo;
      return { q: `${a} ÷ ${b} = ?`, ans: q, hint: T`${a} sayısını ${b} ile kolay bölünen iki parçaya ayır: ${a1} + ${a2}`, exp: `${a} = ${a1} + ${a2}<br>${a1} ÷ ${b} = ${qt}<br>${a2} ÷ ${b} = ${qo}<br>${qt} + ${qo} = ${q}` }; }
    const b = R(3, 9), q = R(3, 12), r = R(1, b - 1), a = b * q + r, askR = chance(.5);
    return { q: T`${a} ÷ ${b} işleminde<br>${askR ? T('kalan') : T('bölüm')} kaçtır?`, long: true, ans: askR ? r : q,
      hint: T`${b} sayısının ${a} sayısını geçmeyen en büyük katını bul.`,
      exp: T`${b} × ${q} = ${b * q} (${a} sayısını geçmeyen en büyük kat)<br>Bölüm = ${q}<br>Kalan = ${a} − ${b * q} = ${r}` };
  } },
// ---------------------------------------------------------- 4
{ id: 'oncelik', region: 0, emoji: '🦉', animal: T('Baykuş Bilge'), name: T('İşlem Önceliği'),
  lesson: [
    [T('Sıra çok önemli!'), T`İşlemler rastgele sırayla yapılmaz. Bilge Baykuş'un kuralı:
     <div class="ex">1️⃣ Parantez ( )<br>2️⃣ Üslü sayılar<br>3️⃣ Çarpma ve bölme (soldan sağa)<br>4️⃣ Toplama ve çıkarma (soldan sağa)</div>`],
    [T('Örnek'), T`<b>5 + 3 × 4</b> = ?
     <div class="ex">Önce çarpma: 3 × 4 = 12<br>Sonra toplama: 5 + 12 = <b>17</b></div>
     <div class="tip">❌ 5 + 3 = 8, 8 × 4 = 32 YANLIŞ! Çarpma toplamadan önce gelir.</div>`],
    [T('Parantez her şeyi değiştirir'), T`<b>(5 + 3) × 4</b> = ?
     <div class="ex">Önce parantez: 5 + 3 = 8<br>Sonra: 8 × 4 = <b>32</b></div>`],
  ],
  gen(d) {
    if (d === 1) { const b = R(2, 9), c = R(2, 9);
      if (chance(.5)) { const a = R(2, 20); return { q: `${a} + ${b} × ${c} = ?`, ans: a + b * c, hint: T('Çarpma, toplamadan önce yapılır!'), exp: T`Önce çarpma: ${b} × ${c} = ${b * c}<br>Sonra toplama: ${a} + ${b * c} = ${a + b * c}` }; }
      const a = R(1, b * c - 1); return { q: `${b} × ${c} − ${a} = ?`, ans: b * c - a, hint: T('Önce çarpmayı yap.'), exp: T`Önce çarpma: ${b} × ${c} = ${b * c}<br>Sonra çıkarma: ${b * c} − ${a} = ${b * c - a}` }; }
    if (d === 2) { const c = R(2, 9);
      if (chance(.5)) { const a = R(2, 12), b = R(2, 12); return { q: `(${a} + ${b}) × ${c} = ?`, ans: (a + b) * c, hint: T('Önce parantezin içi!'), exp: T`Parantez: ${a} + ${b} = ${a + b}<br>Çarpma: ${a + b} × ${c} = ${(a + b) * c}` }; }
      const b = R(2, 9), a = b + R(2, 9), e = R(1, 15);
      return { q: `${c} × (${a} − ${b}) + ${e} = ?`, ans: c * (a - b) + e, hint: T('Sıra: parantez → çarpma → toplama.'), exp: T`Parantez: ${a} − ${b} = ${a - b}<br>Çarpma: ${c} × ${a - b} = ${c * (a - b)}<br>Toplama: ${c * (a - b)} + ${e} = ${c * (a - b) + e}` }; }
    const a = R(3, 9), b = R(3, 9), dd = R(2, 5), k = R(2, 6), c = dd * k, e = R(1, 12);
    return { q: `${a} × ${b} − ${c} ÷ ${dd} + ${e} = ?`, ans: a * b - k + e, hint: T('Önce çarpma ve bölmeyi yap, sonra soldan sağa toplama-çıkarma.'),
      exp: T`Çarpma: ${a} × ${b} = ${a * b}<br>Bölme: ${c} ÷ ${dd} = ${k}<br>Şimdi: ${a * b} − ${k} + ${e}<br>Soldan sağa: ${a * b - k} + ${e} = ${a * b - k + e}` };
  } },
// ---------------------------------------------------------- 5
{ id: 'us', region: 1, emoji: '🦁', animal: T('Aslan Kral'), name: T('Üslü Sayılar'),
  lesson: [
    [T('Üs ne demek?'), T`Üs, bir sayının <b>kendisiyle kaç kez çarpılacağını</b> söyler.
     <div class="ex">${P(3, 4)} = 3 × 3 × 3 × 3 = <b>81</b><br>3 → taban, 4 → üs</div>
     <div class="tip">🦁 Kral'ın uyarısı: ${P(5, 2)} = 5 × 5 = 25, <b>5 × 2 değil!</b></div>`],
    [T('Özel durumlar'), T`<div class="ex">Her sayının 1. kuvveti kendisidir: ${P(7, 1)} = 7<br>Her sayının 0. kuvveti 1'dir: ${P(7, 0)} = 1<br>1'in her kuvveti 1'dir: ${P(1, 9)} = 1<br>10'un kuvvetleri: ${P(10, 3)} = 1000 (üs kadar sıfır!)</div>`],
    [T('Kare ve küp'), T`${P('a', 2)} → "a'nın karesi", ${P('a', 3)} → "a'nın küpü"
     <div class="ex">${P(2, 3)} = 2 × 2 × 2 = 8<br>${P(4, 2)} + ${P(2, 2)} = 16 + 4 = 20</div>`],
  ],
  gen(d) {
    if (d === 1) { const a = R(2, 12); return { q: `${P(a, 2)} = ?`, ans: a * a, hint: T`${a} sayısını kendisiyle çarp. (${a} × 2 değil!)`, exp: powStep(a, 2) }; }
    if (d === 2) { const t = R(0, 4);
      if (t === 0) { const a = R(2, 5); return { q: `${P(a, 3)} = ?`, ans: a ** 3, hint: `${a} × ${a} × ${a}`, exp: powStep(a, 3) }; }
      if (t === 1) { const n = R(3, 6); return { q: `${P(2, n)} = ?`, ans: 2 ** n, hint: T`2'yi ${n} kez çarp: her adımda ikiye katla.`, exp: powStep(2, n) }; }
      if (t === 2) { const n = R(2, 5); return { q: `${P(10, n)} = ?`, ans: 10 ** n, hint: T`10'un kuvvetinde üs kadar sıfır yazılır.`, exp: T`${P(10, n)} = 1 ve yanına ${n} tane sıfır = ${10 ** n}` }; }
      const a = R(2, 30), n = pick([0, 1]); return { q: `${P(a, n)} = ?`, ans: a ** n, hint: n ? T('Bir sayının 1. kuvveti kendisidir.') : T('Bir sayının 0. kuvveti her zaman 1!'), exp: n ? `${P(a, 1)} = ${a}` : powStep(a, 0) };
    }
    if (chance(.5)) { const a = R(2, 9), b = R(2, 9); return { q: `${P(a, 2)} + ${P(b, 2)} = ?`, ans: a * a + b * b, hint: T('Önce üsleri hesapla, sonra topla.'), exp: `${powStep(a, 2)}<br>${powStep(b, 2)}<br>${a * a} + ${b * b} = ${a * a + b * b}` }; }
    const n = R(2, 4), k = R(2, 5); return { q: `${k} × ${P(2, n)} = ?`, ans: k * 2 ** n, hint: T('İşlem önceliği: önce üs, sonra çarpma.'), exp: `${powStep(2, n)}<br>${k} × ${2 ** n} = ${k * 2 ** n}` };
  } },
// ---------------------------------------------------------- 6
{ id: 'bolunebilme', region: 1, emoji: '🐢', animal: T('Kaplumbağa Tosba'), name: T('Bölünebilme'),
  lesson: [
    [T('Bölmeden anla!'), T`Bölme yapmadan, sayıya bakarak bölünüp bölünmediğini anlayabilirsin:
     <div class="ex"><b>2</b> → birler basamağı çift (0,2,4,6,8)<br><b>5</b> → birler basamağı 0 veya 5<br><b>10</b> → birler basamağı 0</div>`],
    [T('3 ve 9 kuralı'), T`<b>Rakamlarını topla!</b>
     <div class="ex">471 → 4 + 7 + 1 = 12<br>12, 3'e bölünür → 471 de <b>3'e bölünür</b> ✔️<br>12, 9'a bölünmez → 471 <b>9'a bölünmez</b> ✖️</div>`],
    [T('4 ve 6 kuralı'), T`<div class="ex"><b>4</b> → son iki basamak 4'e bölünmeli: 1<b>32</b> → 32 ÷ 4 = 8 ✔️<br><b>6</b> → hem 2'ye hem 3'e bölünmeli</div>
     <div class="tip">🐢 Tosba yavaş ama emin adımlarla gider: kuralı tek tek kontrol et!</div>`],
  ],
  gen(d) {
    const ds = n => digits(n).reduce((a, b) => a + b, 0);
    const RULE = {
      2: { t: n => n % 2 === 0, why: n => T`Birler basamağı ${n % 10}. ${n % 2 === 0 ? T('Çift → bölünür.') : T('Tek → bölünmez.')}`, hint: T('Birler basamağı çift mi?') },
      5: { t: n => n % 5 === 0, why: n => T`Birler basamağı ${n % 10}. ${n % 5 === 0 ? T('0 ya da 5 → bölünür.') : T('0 ya da 5 değil → bölünmez.')}`, hint: T('Birler basamağı 0 ya da 5 mi?') },
      10: { t: n => n % 10 === 0, why: n => T`Birler basamağı ${n % 10}. ${n % 10 === 0 ? T('0 → bölünür.') : T('0 değil → bölünmez.')}`, hint: T('Birler basamağı 0 mı?') },
      3: { t: n => n % 3 === 0, why: n => T`Rakamlar toplamı: ${digits(n).join(' + ')} = ${ds(n)}. ${ds(n) % 3 === 0 ? T('3\'ün katı → bölünür.') : T('3\'ün katı değil → bölünmez.')}`, hint: T('Rakamlarını topla. Toplam 3\'ün katı mı?') },
      9: { t: n => n % 9 === 0, why: n => T`Rakamlar toplamı: ${digits(n).join(' + ')} = ${ds(n)}. ${ds(n) % 9 === 0 ? T('9\'un katı → bölünür.') : T('9\'un katı değil → bölünmez.')}`, hint: T('Rakamlarını topla. Toplam 9\'un katı mı?') },
      4: { t: n => n % 4 === 0, why: n => T`Son iki basamak: ${n % 100}. ${(n % 100) % 4 === 0 ? T`${n % 100} ÷ 4 = ${(n % 100) / 4} → bölünür.` : T`${n % 100}, 4'e tam bölünmez → bölünmez.`}`, hint: T('Sadece son iki basamağa bak. 4\'e bölünüyor mu?') },
      6: { t: n => n % 6 === 0, why: n => T`2'ye: birler ${n % 10} → ${n % 2 === 0 ? T('evet') : T('hayır')}. 3'e: rakam toplamı ${ds(n)} → ${ds(n) % 3 === 0 ? T('evet') : T('hayır')}.<br>${n % 6 === 0 ? T('İkisi de evet → bölünür.') : T('İkisi birden sağlanmıyor → bölünmez.')}`, hint: T('Hem 2 hem 3 kuralını kontrol et.') },
    };
    const make = (k, lo, hi) => { let n; if (chance(.5)) n = k * R(Math.ceil(lo / k), Math.floor(hi / k)); else n = R(lo, hi);
      const r = RULE[k]; return { q: T`${n} sayısı<br><b>${k}</b> ile tam bölünür mü?`, long: true, ...yesNo(r.t(n)), hint: r.hint, exp: r.why(n) }; };
    if (d === 1) return make(pick([2, 5, 10]), 100, 999);
    if (d === 2) return make(pick([3, 9, 4]), 100, 9999);
    if (chance(.4)) return make(6, 100, 999);
    const a = R(1, 9), b = R(0, 9), c = R(0, 9), s = a + b + c, k = pick([3, 9]);
    let ans, txt;
    if (k === 3) { ans = (3 - s % 3) % 3; txt = T('en küçük'); } else { const x = (9 - s % 9) % 9; ans = x === 0 ? 9 : x; txt = T('en büyük'); }
    return { q: T`${a}${b}▢${c} sayısı ${k} ile bölünüyor.<br>▢ yerine yazılabilecek ${txt} rakam?`, long: true, ans,
      hint: T`Rakamlar toplamı ${k}'${k === 3 ? T('ün') : T('un')} katı olmalı. Bilinen rakamların toplamı: ${s}`,
      exp: T`${a} + ${b} + ${c} = ${s}<br>${s} + ▢ toplamı ${k}'${k === 3 ? T('ün') : T('un')} katı olmalı.<br>${txt === T('en küçük') ? T('En küçük') : T('En büyük')} uygun rakam: ${ans} (${s} + ${ans} = ${s + ans})` };
  } },
// ---------------------------------------------------------- 7
{ id: 'asal', region: 1, emoji: '🦊', animal: T('Tilki Kurnaz'), name: T('Asal Sayılar'),
  lesson: [
    [T('Asal sayı nedir?'), T`Sadece <b>1'e ve kendisine</b> bölünebilen, 1'den büyük sayılar.
     <div class="ex">2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47...</div>
     <div class="tip">🦊 Kurnaz'ın sırrı: 2, tek çift asal sayıdır! 1 asal <b>değildir</b>.</div>`],
    [T('Asal çarpanlara ayırma'), T`Sayıyı en küçük asaldan başlayarak böl:
     <div class="ex"><b>60</b><br>60 ÷ 2 = 30<br>30 ÷ 2 = 15<br>15 ÷ 3 = 5<br>5 ÷ 5 = 1<br>60 = ${P(2, 2)} × 3 × 5</div>
     <div class="tip">Farklı asal çarpanları: 2, 3 ve 5 → 3 tane.</div>`],
  ],
  gen(d) {
    if (d === 1) { let n = chance(.07) ? 1 : R(2, 60); if (chance(.4)) n = pick([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]);
      const p = isPrime(n); let exp;
      if (n === 1) exp = T('1 asal değildir! Asal sayının tam 2 böleni olur, 1\'in tek böleni var.');
      else if (n === 2) exp = T('2 sadece 1\'e ve kendisine bölünür. 2, tek çift asal sayıdır!');
      else if (p) exp = T`${n} sadece 1'e ve kendisine bölünür → asal.`;
      else { const s = factor(n)[0]; exp = T`${n} = ${s} × ${n / s}<br>1 ve kendisi dışında böleni var → asal değil.`; }
      return { q: T`${n} asal sayı mı?`, ...yesNo(p), hint: T`${n} sayısını 2, 3, 5, 7 ile bölmeyi dene.`, exp }; }
    if (d === 2) { let a, b, c, n; do { a = R(1, 3); b = R(0, 2); c = R(0, 1); n = 2 ** a * 3 ** b * 5 ** c; } while (n < 12);
      const parts = [a > 1 ? P(2, a) : '2']; if (b) parts.push(b > 1 ? P(3, b) : '3'); if (c) parts.push('5');
      const vals = [2 ** a]; if (b) vals.push(3 ** b); if (c) vals.push(5);
      return { q: `${parts.join(' × ')} = ?`, ans: n, hint: T('Önce üsleri hesapla, sonra hepsini çarp.'), exp: `${parts.join(' × ')}<br>= ${vals.join(' × ')}<br>= ${n}` }; }
    const n = pick([12, 18, 20, 28, 30, 36, 42, 45, 50, 60, 66, 70, 72, 84, 90, 105, 126, 210]);
    const uniq = [...new Set(factor(n))];
    if (chance(.5)) return { q: T`${n} sayısının kaç farklı asal çarpanı var?`, long: true, ans: uniq.length, hint: T('En küçük asaldan başlayarak böl, kullandığın farklı asalları say.'), exp: T`${ladder(n)}<br>${n} = ${factorText(n)}<br>Farklı asallar: ${uniq.join(', ')} → ${uniq.length} tane` };
    return { q: T`${n} sayısının en büyük asal çarpanı kaçtır?`, long: true, ans: Math.max(...uniq), hint: T('Sayıyı asal çarpanlarına ayır.'), exp: T`${ladder(n)}<br>${n} = ${factorText(n)}<br>En büyüğü: ${Math.max(...uniq)}` };
  } },
// ---------------------------------------------------------- 8
{ id: 'ebob', region: 1, emoji: '🐘', animal: T('Fil Hafız'), name: T('EBOB & EKOK'),
  lesson: [
    [T('EBOB: En Büyük Ortak Bölen'), T`İki sayıyı da bölen en büyük sayı.
     <div class="ex">12 → 1, 2, 3, <b>4</b>, 6, 12<br>16 → 1, 2, <b>4</b>, 8, 16<br>Ortak bölenler: 1, 2, 4 → <b>EBOB = 4</b></div>
     <div class="tip">"Eşit parçalara böl, en büyük parça" → EBOB</div>`],
    [T('EKOK: En Küçük Ortak Kat'), T`İki sayının da katı olan en küçük sayı.
     <div class="ex">4 → 4, 8, <b>12</b>, 16...<br>6 → 6, <b>12</b>, 18...<br><b>EKOK = 12</b></div>
     <div class="tip">🐘 Hafız: "Tekrar ne zaman birlikte?" → EKOK</div>`],
  ],
  gen(d) {
    const ebobQ = (a, b, q) => { const da = divisors(a), db = divisors(b), g = gcd(a, b);
      const mark = (arr, o) => arr.map(x => o.includes(x) ? `<b>${x}</b>` : x).join(', ');
      return { q, long: true, ans: g, hint: T('İki sayının bölenlerini yaz, ortak olanların en büyüğünü bul.'), exp: T`${a} → ${mark(da, db)}<br>${b} → ${mark(db, da)}<br>Ortak bölenlerin en büyüğü: ${g}` }; };
    const ekokQ = (a, b, q) => { const L = lcm(a, b), ma = [], mb = [];
      for (let x = a; x <= L; x += a) ma.push(x); for (let x = b; x <= L; x += b) mb.push(x);
      return { q, long: true, ans: L, hint: T('İki sayının katlarını sırayla yaz, ilk ortak olanı bul.'), exp: T`${a} → ${ma.join(', ')}<br>${b} → ${mb.join(', ')}<br>İlk ortak kat: ${L}` }; };
    const pair = () => { const g = R(2, 8); let m, n; do { m = R(1, 5); n = R(2, 7); } while (m >= n || gcd(m, n) !== 1); return [g * m, g * n]; };
    if (d === 1) { const [a, b] = pair(); return ebobQ(a, b, T`EBOB(${a}, ${b}) = ?`); }
    if (d === 2) { let a, b; do { a = R(2, 12); b = R(2, 12); } while (a === b || lcm(a, b) > 72 || lcm(a, b) === Math.max(a, b) && chance(.6)); return ekokQ(a, b, T`EKOK(${a}, ${b}) = ?`); }
    if (chance(.5)) { let a, b; do { a = R(3, 12); b = R(3, 12); } while (a === b || lcm(a, b) > 72 || lcm(a, b) === Math.max(a, b));
      return ekokQ(a, b, T`🐸 Kurbağa ${a} saniyede bir, 🦗 çekirge ${b} saniyede bir zıplıyor. Birlikte zıpladıktan kaç saniye sonra tekrar birlikte zıplarlar?`); }
    const [a, b] = pair().map(x => x * 2);
    return ebobQ(a, b, T`🐒 Maymun ${a} cm ve ${b} cm uzunluğundaki iki sarmaşığı hiç artmadan, eşit ve en uzun parçalara kesecek. Bir parça kaç cm olur?`);
  } },
// ---------------------------------------------------------- 9
{ id: 'tam', region: 2, emoji: '🐬', animal: T('Yunus Dalga'), name: T('Tam Sayılar'),
  lesson: [
    [T('Sıfırın altı'), T`Deniz seviyesi 0 ise, Dalga'nın daldığı derinlik negatiftir: <b>−5 m</b>
     <div class="ex">… −3 −2 −1 <b>0</b> +1 +2 +3 …<br>Sağdaki sayı her zaman daha büyüktür: −2 > −7</div>`],
    [T('Toplama: sayı doğrusunda yürü'), T`<div class="ex"><b>−3 + 5</b>: −3'ten başla, 5 adım <b>sağa</b> → <b>2</b><br><b>4 + (−7)</b>: 4'ten başla, 7 adım <b>sola</b> → <b>−3</b></div>
     <div class="tip">🐬 Pozitif ekle → sağa yüz. Negatif ekle → sola yüz.</div>`],
    [T('Çıkarma & işaret kuralı'), T`Çıkarma = işareti değiştirip toplama:
     <div class="ex">5 − (−3) = 5 + 3 = <b>8</b></div>
     <div class="ex">Çarpmada: aynı işaretler → <b>+</b>, farklı işaretler → <b>−</b><br>(−4) × (−3) = 12 &nbsp; (−4) × 3 = −12</div>
     <div class="tip">Mutlak değer = sıfıra uzaklık: |−8| = 8</div>`],
  ],
  gen(d) {
    const nz = (a, b) => { let x; do { x = R(a, b); } while (!x); return x; };
    if (d === 1) {
      if (chance(.35)) { let a, b; do { a = R(-12, 12); b = R(-12, 12); } while (a === b || (a >= 0 && b >= 0));
        const big = Math.max(a, b); return { q: T('Hangisi daha büyük?'), choices: [{ h: sg(a), ok: a === big }, { h: sg(b), ok: b === big }], fixed: true, hint: T('Sayı doğrusunda sağda olan daha büyüktür.'), exp: T`Sayı doğrusunda ${sg(big)} daha sağda.<br>${sg(big)} > ${sg(Math.min(a, b))}` }; }
      let a, b; do { a = nz(-9, 9); b = nz(-9, 9); } while (Math.abs(a + b) > 10 || (a > 0 && b > 0));
      return { q: `${sg(a)} + ${pn(b)} = ?`, vis: numline(a), ans: a + b, hint: T`${sg(a)} noktasından başla, ${b > 0 ? b + T(' adım sağa') : -b + T(' adım sola')} git.`, exp: T`${sg(a)} noktasından ${b > 0 ? b + T(' adım sağa') : -b + T(' adım sola')} → ${sg(a + b)}` };
    }
    if (d === 2) { const a = nz(-9, 9), b = nz(-9, 9);
      return { q: `${sg(a)} − ${pn(b)} = ?`, ans: a - b, hint: T('Çıkarma = işaretini değiştirip toplama.'), exp: `${sg(a)} − ${pn(b)} = ${sg(a)} + ${pn(-b)} = ${sg(a - b)}` }; }
    if (chance(.4)) { const a = nz(-15, 15), b = nz(-15, 15);
      return { q: `|${sg(a)}| + |${sg(b)}| = ?`, ans: Math.abs(a) + Math.abs(b), hint: T('Mutlak değer sıfıra uzaklıktır, hep pozitif!'), exp: `|${sg(a)}| = ${Math.abs(a)}, |${sg(b)}| = ${Math.abs(b)}<br>${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(a) + Math.abs(b)}` }; }
    const a = nz(-9, 9), b = nz(-9, 9); if (a > 0 && b > 0) return this.gen(3);
    const same = (a > 0) === (b > 0);
    return { q: `${pn(a)} × ${pn(b)} = ?`, ans: a * b, hint: T('Önce sayıları çarp, sonra işarete karar ver: aynı → +, farklı → −'), exp: T`${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(a * b)}<br>İşaretler ${same ? T('aynı → +') : T('farklı → −')}<br>Cevap: ${sg(a * b)}` };
  } },
// ---------------------------------------------------------- 10
{ id: 'kesir', region: 2, emoji: '🐻', animal: T('Ayı Balcı'), name: T('Kesirleri Tanı'),
  lesson: [
    [T('Kesir = parça'), T`Balcı bir petek balı <b>4 eş parçaya</b> böldü, <b>3'ünü</b> yedi:
     <div class="ex">${fbar(3, 4)}<br>Yediği: ${F(3, 4)} → <b>pay</b> 3 (alınan parça), <b>payda</b> 4 (toplam parça)</div>`],
    [T('Genişletme'), T`Payı ve paydayı <b>aynı sayıyla çarparsan</b> kesir değişmez:
     <div class="ex">${F(1, 2)} = ${F(2, 4)} = ${F(3, 6)} = ${F(4, 8)}</div>
     ${fbar(1, 2)}${fbar(2, 4)}${fbar(4, 8)}
     <div class="tip">Hepsi aynı uzunlukta boyalı! Parçalar küçüldü ama sayısı arttı.</div>`],
    [T('Sadeleştirme'), T`Payı ve paydayı <b>aynı sayıya bölersen</b> kesir değişmez:
     <div class="ex">${F(18, 24)} → ikisi de 6'ya bölünür → ${F(3, 4)}</div>
     <div class="tip">🐻 En sade hal: pay ile paydanın 1'den başka ortak böleni kalmayınca.</div>`],
  ],
  gen(d) {
    if (d === 1) { const dd = R(2, 9), n = R(1, dd - 1);
      return { q: T('Boyalı kısım bütünün kaçta kaçı?'), long: true, vis: fbar(n, dd), ans: n / dd, at: F(n, dd), frac: true, hint: T('Kaç eş parça var (payda)? Kaçı boyalı (pay)? Kesri pay/payda şeklinde yaz.'), exp: T`Toplam ${dd} eş parça → payda ${dd}<br>${n} parça boyalı → pay ${n}<br>Cevap: ${F(n, dd)}` }; }
    if (d === 2) { let dd, n; do { dd = R(2, 9); n = R(1, dd - 1); } while (gcd(n, dd) !== 1); const k = R(2, 6);
      return { q: `${F(n, dd)} = ${F('?', dd * k)}`, ans: n * k, hint: T`Payda ${dd} kaç ile çarpılınca ${dd * k} oldu?`, exp: T`${dd} × ${k} = ${dd * k}<br>Payı da ${k} ile çarp: ${n} × ${k} = ${n * k}<br>${F(n, dd)} = ${F(n * k, dd * k)}` }; }
    if (chance(.4)) { let a, b, c, e; do { b = R(2, 9); a = R(1, b - 1); e = R(2, 9); c = R(1, e - 1); } while (b === e || a * e === c * b);
      const L = lcm(b, e), big = a * e > c * b;
      return { q: T('Hangisi daha büyük?'), choices: [{ h: F(a, b), ok: big }, { h: F(c, e), ok: !big }], fixed: true, hint: T('Paydaları eşitle, sonra paylara bak.'), exp: T`Ortak payda ${L}:<br>${F(a, b)} = ${F(a * L / b, L)}, ${F(c, e)} = ${F(c * L / e, L)}<br>Payı büyük olan büyüktür → ${big ? F(a, b) : F(c, e)}` }; }
    let dd, n; do { dd = R(2, 9); n = R(1, dd - 1); } while (gcd(n, dd) !== 1); const k = R(2, 6);
    return { q: T`${F(n * k, dd * k)} kesrinin en sade hali?`, long: true, ans: n / dd, simp: [n, dd], at: F(n, dd), frac: true, hint: T`${n * k} ve ${dd * k} sayılarını bölen en büyük ortak sayıyı bul.`, exp: T`${n * k} ve ${dd * k} ikisi de ${k} ile bölünür (EBOB = ${k})<br>${n * k} ÷ ${k} = ${n}<br>${dd * k} ÷ ${k} = ${dd}<br>Cevap: ${F(n, dd)}` };
  } },
// ---------------------------------------------------------- 11
{ id: 'kesirtopla', region: 2, emoji: '🦒', animal: T('Zürafa Uzun'), name: T('Kesir Toplama'),
  lesson: [
    [T('Paydalar aynıysa'), T`Sadece <b>payları</b> topla, payda aynı kalır:
     <div class="ex">${F(2, 7)} + ${F(3, 7)} = ${F(5, 7)}</div>
     <div class="tip">🦒 Uzun'un uyarısı: Paydaları ASLA toplama! ${F(1, 2)} + ${F(1, 2)} = ${F(2, 2)} = 1 (${F(2, 4)} değil!)</div>`],
    [T('Paydalar farklıysa'), T`Önce paydaları eşitle (genişlet), sonra topla:
     <div class="ex">${F(1, 3)} + ${F(1, 4)}<br>Ortak payda: 12<br>${F(4, 12)} + ${F(3, 12)} = ${F(7, 12)}</div>
     <div class="tip">Ortak payda = paydaların EKOK'u.</div>`],
  ],
  gen(d) {
    let n1, d1, n2, d2;
    if (d === 1) { d1 = d2 = R(3, 12); n1 = R(1, d1 - 1); n2 = R(1, d1 - 1); }
    else if (d === 2) { d1 = R(2, 6); const k = R(2, 4); d2 = d1 * k; n1 = R(1, d1 - 1); n2 = R(1, d2 - 1); if (chance(.5)) { [n1, d1, n2, d2] = [n2, d2, n1, d1]; } }
    else { do { d1 = R(2, 9); d2 = R(2, 9); } while (d1 === d2 || d1 % d2 === 0 || d2 % d1 === 0); n1 = R(1, d1 - 1); n2 = R(1, d2 - 1); }
    let sub = chance(.45);
    if (sub && n1 / d1 === n2 / d2) sub = false;
    if (sub && n1 / d1 < n2 / d2) [n1, d1, n2, d2] = [n2, d2, n1, d1];
    const L = lcm(d1, d2), A = n1 * L / d1, B = n2 * L / d2, Rn = sub ? A - B : A + B, op = sub ? '−' : '+';
    let exp = '';
    if (d1 === d2) exp = T`Paydalar aynı → payları ${sub ? T('çıkar') : T('topla')}: ${n1} ${op} ${n2} = ${Rn}<br>Cevap: ${F(Rn, L)}`;
    else exp = T`Ortak payda (EKOK) = ${L}<br>${d1 !== L ? T`${F(n1, d1)} = ${F(A, L)} (${L / d1} ile genişlet)<br>` : ''}${d2 !== L ? T`${F(n2, d2)} = ${F(B, L)} (${L / d2} ile genişlet)<br>` : ''}${F(A, L)} ${op} ${F(B, L)} = ${F(Rn, L)}`;
    if (gcd(Rn, L) > 1) exp += T`<br>Sadeleşmiş hali: ${fracText(Rn, L)}`;
    return { q: `${F(n1, d1)} ${op} ${F(n2, d2)} = ?`, sub: T('Kesir olarak yaz (örn. 5/12). Sadeleştirmek zorunda değilsin.'), ans: Rn / L, at: F(Rn, L), frac: true,
      hint: d1 === d2 ? T('Paydalar aynı: sadece payları ') + (sub ? T('çıkar.') : T('topla.')) : T`Önce paydaları eşitle. Ortak payda ${L} olabilir.`, exp };
  } },
// ---------------------------------------------------------- 12
{ id: 'kesircarp', region: 2, emoji: '🐨', animal: T('Koala Uyku'), name: T('Kesir Çarpma & Bölme'),
  lesson: [
    [T('Çarpma en kolayı!'), T`Pay ile pay, payda ile payda çarpılır:
     <div class="ex">${F(2, 3)} × ${F(4, 5)} = ${F('2 × 4', '3 × 5')} = ${F(8, 15)}</div>
     <div class="ex">Tam sayı ile: 3 × ${F(2, 7)} = ${F(6, 7)} (sadece pay çarpılır)</div>`],
    [T('Bölme: ters çevir, çarp'), T`<div class="ex">${F(3, 4)} ÷ ${F(2, 5)}<br>= ${F(3, 4)} × ${F(5, 2)} ← ikinciyi ters çevir<br>= ${F(15, 8)}</div>
     <div class="tip">🐨 Uyku'nun tekerlemesi: "Birinci aynen, ikinci ters, sonra çarp!"</div>`],
  ],
  gen(d) {
    const tail = (n, dd) => gcd(n, dd) > 1 ? T`<br>Sadeleşmiş hali: ${fracText(n, dd)}` : '';
    const base = { sub: T('Kesir olarak yaz. Sadeleştirmek zorunda değilsin.'), frac: true };
    if (d === 1) { const k = R(2, 6), dd = R(3, 9), n = R(1, dd - 1);
      return { ...base, q: `${k} × ${F(n, dd)} = ?`, ans: k * n / dd, at: F(k * n, dd), hint: T('Tam sayıyı sadece pay ile çarp, payda aynı kalır.'), exp: `${k} × ${F(n, dd)} = ${F(k + ' × ' + n, dd)} = ${F(k * n, dd)}${tail(k * n, dd)}` }; }
    const d1 = R(2, 9), n1 = R(1, d1 - 1), d2 = R(2, 9), n2 = R(1, d2 - 1);
    if (d === 2) return { ...base, q: `${F(n1, d1)} × ${F(n2, d2)} = ?`, ans: n1 * n2 / (d1 * d2), at: F(n1 * n2, d1 * d2), hint: T('Pay × pay, payda × payda.'), exp: `${F(n1 + ' × ' + n2, d1 + ' × ' + d2)} = ${F(n1 * n2, d1 * d2)}${tail(n1 * n2, d1 * d2)}` };
    return { ...base, q: `${F(n1, d1)} ÷ ${F(n2, d2)} = ?`, ans: (n1 * d2) / (d1 * n2), at: F(n1 * d2, d1 * n2), hint: T('Birinciyi aynen yaz, ikinciyi ters çevir, çarp.'), exp: T`${F(n1, d1)} × ${F(d2, n2)} ← ters çevir<br>= ${F(n1 * d2, d1 * n2)}${tail(n1 * d2, d1 * n2)}` };
  } },
// ---------------------------------------------------------- 13
{ id: 'ondalik', region: 3, emoji: '🐱', animal: T('Kedi Mırnav'), name: T('Ondalık Sayılar'),
  lesson: [
    [T('Virgülün anlamı'), T`Paydası 10, 100, 1000 olan kesirlerin kısa yazılışı:
     <div class="ex">${F(7, 10)} = 0,7 &nbsp;&nbsp; ${F(35, 100)} = 0,35 &nbsp;&nbsp; ${F(4, 100)} = 0,04</div>
     <div class="tip">Paydadaki sıfır sayısı = virgülden sonraki basamak sayısı.</div>`],
    [T('Toplama: virgülleri hizala'), T`<div class="ex">2,35 + 1,4<br>→ 2,35 + 1,40 (eksik basamağa 0 koy)<br>→ 235 + 140 = 375<br>→ <b>3,75</b></div>
     <div class="tip">🐱 Mırnav'ın hilesi: virgülü unut, normal topla, sonra virgülü geri koy!</div>`],
    [T('10, 100, 1000 ile çarpma'), T`Virgül, sıfır sayısı kadar <b>sağa</b> kayar:
     <div class="ex">3,47 × 10 = 34,7<br>3,47 × 100 = 347<br>3,47 × 1000 = 3470</div>`],
  ],
  gen(d) {
    const base = { sub: T('Ondalık sayıyı virgülle yaz (örn. 0,5).') };
    if (d === 1) {
      if (chance(.5)) { const ten = chance(.5); let n; if (ten) n = R(1, 9); else do { n = R(1, 99); } while (n % 10 === 0);
        const v = n / (ten ? 10 : 100);
        return { ...base, q: `${F(n, ten ? 10 : 100)} = ?`, ans: v, hint: T`Payda ${ten ? 10 : 100} → virgülden sonra ${ten ? 1 : 2} basamak.`, exp: T`Payda ${ten ? T('10 (1 sıfır)') : T('100 (2 sıfır)')} → virgülden sonra ${ten ? 1 : 2} basamak<br>${F(n, ten ? 10 : 100)} = ${dec(v)}` }; }
      const n = R(1, 9); return { q: `0,${n} = ${F('?', 10)}`, ans: n, hint: T('Virgülden sonra 1 basamak → payda 10.'), exp: T`0,${n} → "${n} onda bir" → ${F(n, 10)}` };
    }
    if (d === 2) { const A = R(110, 899), B = R(30, 499), sub = chance(.45) && A > B, S = sub ? A - B : A + B;
      const a = A / 100, b = B / 100, op = sub ? '−' : '+';
      return { ...base, q: `${dec(a)} ${op} ${dec(b)} = ?`, ans: S / 100, hint: T('Virgülleri alt alta hizala. Virgülü unutup işlemi yap, sonra virgülü geri koy.'), exp: T`Basamakları eşitle: ${(A / 100).toFixed(2).replace('.', ',')} ${op} ${(B / 100).toFixed(2).replace('.', ',')}<br>Virgülsüz: ${A} ${op} ${B} = ${S}<br>Virgülden sonra 2 basamak → ${dec(S / 100)}` }; }
    if (chance(.5)) { const A = R(101, 999), m = pick([10, 100, 1000]), z = String(m).length - 1;
      return { ...base, q: `${dec(A / 100)} × ${m} = ?`, ans: A * m / 100, hint: T`${m} ile çarpınca virgül ${z} basamak sağa kayar.`, exp: T`${m} → ${z} sıfır → virgül ${z} basamak sağa<br>${dec(A / 100)} × ${m} = ${dec(A * m / 100)}` }; }
    const A = R(11, 99), k = R(2, 5);
    return { ...base, q: `${dec(A / 10)} × ${k} = ?`, ans: A * k / 10, hint: T('Virgülü unut, çarp, sonra virgülden sonra 1 basamak ayır.'), exp: T`Virgülsüz: ${A} × ${k} = ${A * k}<br>Virgülden sonra 1 basamak → ${dec(A * k / 10)}` };
  } },
// ---------------------------------------------------------- 14
{ id: 'yuzde', region: 3, emoji: '🦅', animal: T('Kartal Keskin'), name: T('Oran & Yüzde'),
  lesson: [
    [T('Yüzde = yüzde kaç parça'), T`<b>%25</b> demek ${F(25, 100)} = ${F(1, 4)} demek.
     <div class="ex">80'in %25'i → 80'i 4'e böl → <b>20</b></div>
     <div class="ex">%50 = yarısı, %10 = 10'a böl, %20 = 5'e böl, %75 = 4'e böl, 3 ile çarp</div>`],
    [T('Oran = parçalar'), T`Tavukların ördeklere oranı ${F(3, 4)} → her 3 tavuğa 4 ördek.
     <div class="ex">20 ördek var → 4 parça = 20 → 1 parça = 5<br>Tavuk = 3 parça = <b>15</b></div>
     <div class="tip">🦅 Keskin göz: önce "1 parça kaç?" bul, gerisi kolay!</div>`],
    [T('İndirim'), T`<div class="ex">200 TL'lik oyuncakta %20 indirim<br>200'ün %20'si = 40 TL<br>Yeni fiyat = 200 − 40 = <b>160 TL</b></div>`],
  ],
  gen(d) {
    if (d === 1) { const p = pick([10, 20, 25, 50, 75]), g = gcd(p, 100), u = 100 / g, base = u * R(2, Math.floor(200 / u)), ans = p * base / 100;
      return { q: T`${base} sayısının %${p}'${T(({ 10: 'u', 20: 'si', 25: 'i', 50: 'si', 75: 'i' })[p])} kaçtır?`, long: true, ans, hint: T`%${p} = ${F(p, 100)} = ${F(p / g, u)}. ${base} sayısını ${u} ile böl${p / g > 1 ? '' + T(', sonra ') + p / g + T(' ile çarp') : ''}.`,
        exp: `%${p} = ${F(p, 100)} = ${F(p / g, u)}<br>${base} ÷ ${u} = ${base / u}${p / g > 1 ? `<br>${base / u} × ${p / g} = ${ans}` : ''}` }; }
    if (d === 2) { const pairs = [[T('tavuk 🐔'), T('ördek 🦆')], [T('kedi 🐱'), T('köpek 🐶')], [T('kırmızı balık'), T('sarı balık')], [T('koyun 🐑'), T('keçi 🐐')]];
      const [x1, x2] = pick(pairs); let a, b; do { a = R(1, 5); b = R(2, 6); } while (a === b || gcd(a, b) !== 1); const k = R(2, 8);
      return { q: T`Çiftlikte ${x1} sayısının ${x2} sayısına oranı ${F(a, b)}. ${b * k} ${x2} varsa kaç ${x1} vardır?`, long: true, ans: a * k, hint: T`${x2}: ${b} parça = ${b * k}. Önce 1 parçayı bul.`, exp: T`${x2}: ${b} parça = ${b * k} → 1 parça = ${b * k} ÷ ${b} = ${k}<br>${x1}: ${a} parça = ${a} × ${k} = ${a * k}` }; }
    if (chance(.6)) { const X = R(2, 25) * 20, p = pick([10, 20, 25, 50]), off = X * p / 100;
      return { q: T`${X} TL'lik oyuncak ayıda %${p} indirim var. İndirimli fiyat kaç TL?`, long: true, ans: X - off, hint: T`Önce indirim miktarını bul: ${X} sayısının %${p}'${T(({ 10: 'u', 20: 'si', 25: 'i', 50: 'si' })[p])}.`, exp: T`İndirim: ${X} × ${F(p, 100)} = ${off} TL<br>Yeni fiyat: ${X} − ${off} = ${X - off} TL` }; }
    const p = pick([10, 20, 25, 50]), g = gcd(p, 100), k = R(2, 12), Y = p / g * k, N = 100 / g * k;
    return { q: T`Bir sayının %${p}'${T(({ 10: 'u', 20: 'si', 25: 'i', 50: 'si' })[p])} ${Y} ise sayı kaçtır?`, long: true, ans: N, hint: T`%${p} = ${F(p / g, 100 / g)}. Yani ${100 / g} parçanın ${p / g} tanesi ${Y}.`, exp: T`%${p} = ${F(p / g, 100 / g)}<br>${p / g} parça = ${Y} → 1 parça = ${k}<br>Bütün = ${100 / g} parça = ${N}` };
  } },
// ---------------------------------------------------------- 15
{ id: 'cebir', region: 3, emoji: '🦎', animal: T('Bukalemun Renk'), name: T('Cebir & Denklem'),
  lesson: [
    [T('Harfler sayıların yerini tutar'), T`${X} bir "kutu" gibidir, içinde bir sayı saklıdır.
     <div class="ex">3${X} + 2 ifadesinde ${X} = 4 ise<br>3 × 4 + 2 = 12 + 2 = <b>14</b></div>
     <div class="tip">3${X} demek 3 × ${X} demek.</div>`],
    [T('Denklem = terazi ⚖️'), T`Terazinin iki tarafı eşit. <b>İki tarafa da aynı şeyi yaparsan</b> denge bozulmaz!
     <div class="ex">${X} + 7 = 15<br>İki taraftan 7 çıkar → ${X} = <b>8</b></div>
     <div class="ex">3${X} = 21<br>İki tarafı 3'e böl → ${X} = <b>7</b></div>`],
    [T('İki adımlı denklem'), T`<div class="ex">2${X} + 5 = 17<br>1) İki taraftan 5 çıkar → 2${X} = 12<br>2) İki tarafı 2'ye böl → ${X} = <b>6</b></div>
     <div class="tip">🦎 Renk: Sağlamasını yap! 2 × 6 + 5 = 17 ✔️</div>`],
  ],
  gen(d) {
    if (d === 1) { const a = R(2, 9), b = R(1, 15), x = R(1, 10), minus = chance(.3) && a * x > b;
      return { q: `${X} = ${x} iken<br>${a}${X} ${minus ? '−' : '+'} ${b} = ?`, ans: minus ? a * x - b : a * x + b, hint: T`${a}${X} demek ${a} × ${X}. ${X} yerine ${x} koy.`, exp: `${a} × ${x} = ${a * x}<br>${a * x} ${minus ? '−' : '+'} ${b} = ${minus ? a * x - b : a * x + b}` }; }
    const x = R(2, 12);
    if (d === 2) { const t = R(0, 2);
      if (t === 0) { const a = R(3, 20); return { q: `${X} + ${a} = ${x + a}`, sub: T`${X} kaçtır?`, ans: x, hint: T`İki taraftan ${a} çıkar.`, exp: T`${X} + ${a} = ${x + a}<br>İki taraftan ${a} çıkar: ${X} = ${x + a} − ${a} = ${x}` }; }
      if (t === 1) { const a = R(3, 20); return { q: `${X} − ${a} = ${x}`, sub: T`${X} kaçtır?`, ans: x + a, hint: T`İki tarafa ${a} ekle.`, exp: T`${X} − ${a} = ${x}<br>İki tarafa ${a} ekle: ${X} = ${x} + ${a} = ${x + a}` }; }
      const a = R(2, 9); return { q: `${a}${X} = ${a * x}`, sub: T`${X} kaçtır?`, ans: x, hint: T`İki tarafı ${a} ile böl.`, exp: T`${a}${X} = ${a * x}<br>İki tarafı ${a} ile böl: ${X} = ${a * x} ÷ ${a} = ${x}` }; }
    const a = R(2, 9), b = R(1, 20), minus = chance(.3) && a * x > b, c = minus ? a * x - b : a * x + b;
    return { q: `${a}${X} ${minus ? '−' : '+'} ${b} = ${c}`, sub: T`${X} kaçtır?`, ans: x, hint: minus ? T`Önce iki tarafa ${b} ekle, sonra ${a} ile böl.` : T`Önce iki taraftan ${b} çıkar, sonra ${a} ile böl.`,
      exp: T`1) İki tarafa ${minus ? '+' + b : '−' + b}: ${a}${X} = ${a * x}<br>2) İki tarafı ${a} ile böl: ${X} = ${x}<br>Sağlama: ${a} × ${x} ${minus ? '−' : '+'} ${b} = ${c} ✔️` };
  } },
// ---------------------------------------------------------- 16
{ id: 'alan', region: 3, emoji: '🐿️', animal: T('Sincap Fındık'), name: T('Çevre & Alan'),
  lesson: [
    [T('Çevre = etrafını dolaşmak'), T`Fındık bahçenin etrafında koşuyor. Koştuğu yol = <b>çevre</b>.
     <div class="ex">Dikdörtgen 5 cm × 3 cm<br>Çevre = 5 + 3 + 5 + 3 = <b>16 cm</b><br>Kısa yol: 2 × (5 + 3) = 16</div>`],
    [T('Alan = içini kaplamak'), T`İçine kaç tane 1 cm²'lik kare sığar?
     <div class="vis">${rectSVG(5, 3, true)}</div>
     <div class="ex">5 × 3 = <b>15 cm²</b></div>`],
    [T('Üçgenin alanı'), T`Üçgen, bir dikdörtgenin yarısıdır:
     <div class="ex">Alan = taban × yükseklik ÷ 2<br>taban 8, yükseklik 5 → 8 × 5 ÷ 2 = <b>20 cm²</b></div>
     <div class="tip">🐿️ Yükseklik, tepeden tabana inen dik çizgidir.</div>`],
  ],
  gen(d) {
    if (d === 1) { if (chance(.3)) { const a = R(2, 15); return { q: T('Karenin çevresi kaç cm?'), vis: rectSVG(a, a), ans: 4 * a, hint: T('Karenin 4 kenarı da eşittir.'), exp: `${a} + ${a} + ${a} + ${a} = 4 × ${a} = ${4 * a} cm` }; }
      let w, h; do { w = R(3, 15); h = R(2, 10); } while (w === h);
      return { q: T('Dikdörtgenin çevresi kaç cm?'), vis: rectSVG(w, h), ans: 2 * (w + h), hint: T('Dört kenarın hepsini topla.'), exp: T`${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm<br>(Kısa yol: 2 × (${w} + ${h}) = ${2 * (w + h)})` }; }
    if (d === 2) { let w, h; do { w = R(2, 12); h = R(2, 9); } while (w === h && chance(.7));
      return { q: T`${w === h ? T('Karenin') : T('Dikdörtgenin')} alanı kaç cm²?`, vis: rectSVG(w, h, w * h <= 60), ans: w * h, hint: T('İçine kaç tane 1 cm²\'lik kare sığar? Kenarları çarp.'), exp: T`Alan = ${w} × ${h} = ${w * h} cm²` }; }
    if (chance(.6)) { let b, h; do { b = R(4, 16); h = R(3, 12); } while ((b * h) % 2);
      return { q: T('Üçgenin alanı kaç cm²?'), vis: triSVG(b, h), ans: b * h / 2, hint: T('Taban × yükseklik ÷ 2'), exp: `${b} × ${h} = ${b * h}<br>${b * h} ÷ 2 = ${b * h / 2} cm²` }; }
    const w = R(3, 12), h = R(2, 11);
    return { q: T`Alanı ${w * h} cm² olan dikdörtgenin bir kenarı ${w} cm. Diğer kenarı kaç cm?`, long: true, ans: h, hint: `${w} × ? = ${w * h}`, exp: T`Alan = kenar × kenar<br>${w} × ? = ${w * h}<br>? = ${w * h} ÷ ${w} = ${h} cm` };
  } },
];

// =========================================================
//                      DURUM / KAYIT
// =========================================================
const KEY = 'matSafari_v1';
const DEF = { name: 'Efe', xp: 0, stars: {}, best: {}, stats: {}, mistakes: [], streak: { last: '', count: 0 }, day: { date: '', rounds: 0 }, sound: true, unlockAll: false, welcomed: false };
let S;
try { S = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = { ...DEF }; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const GOAL = 3;

function level() { return Math.floor(S.xp / 250) + 1; }
function unlocked(i) { return S.unlockAll || i === 0 || (S.stars[TOPICS[i - 1].id] || 0) >= 1; }
function markDay() {
  const t = today();
  if (S.day.date !== t) S.day = { date: t, rounds: 0 };
  S.day.rounds++;
  if (S.streak.last !== t) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    const ys = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
    S.streak.count = S.streak.last === ys ? S.streak.count + 1 : 1;
    S.streak.last = t;
  }
}
function streakNow() { const t = today(); const y = new Date(); y.setDate(y.getDate() - 1); const ys = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate(); return (S.streak.last === t || S.streak.last === ys) ? S.streak.count : 0; }

// =========================================================
//                      SES & EFEKT
// =========================================================
let AC;
function beep(notes) {
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    let t = AC.currentTime;
    notes.forEach(([f, dur, type]) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur); t += dur * .8; });
  } catch (e) {}
}
const sndOk = () => beep([[660, .1], [880, .16]]);
const sndBad = () => beep([[220, .18, 'triangle'], [180, .22, 'triangle']]);
const sndWin = () => beep([[523, .12], [659, .12], [784, .12], [1047, .3]]);
const sndTap = () => beep([[520, .04, 'square']]);
function confetti(emojis) {
  const fx = document.getElementById('fx');
  for (let i = 0; i < 28; i++) { const s = document.createElement('span'); s.textContent = pick(emojis || ['🎉', '⭐', '🍌', '🎈', '✨']);
    s.style.left = Math.random() * 100 + 'vw'; s.style.animationDelay = Math.random() * .5 + 's'; s.style.fontSize = (20 + Math.random() * 22) + 'px'; fx.appendChild(s); setTimeout(() => s.remove(), 2200); }
}
function floatText(t) { const e = document.createElement('div'); e.className = 'float'; e.textContent = t; document.body.appendChild(e); setTimeout(() => e.remove(), 1000); }

// =========================================================
//                      EKRANLAR
// =========================================================
const $ = id => document.getElementById(id);
const view = $('view');
function topbar() {
  $('xp').textContent = '⭐ ' + S.xp; $('lvl').textContent = T('Sv ') + level(); $('streak').textContent = '🔥 ' + streakNow();
}
function openModal(html) { $('sheet').innerHTML = html; $('modal').classList.remove('hidden'); }
function closeModal() { $('modal').classList.add('hidden'); }
$('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

// ---------- Harita ----------
function home() {
  stopTimer(); Q = null; topbar(); closeModal();
  const totalStars = TOPICS.reduce((a, t) => a + (S.stars[t.id] || 0), 0);
  const nextIdx = TOPICS.findIndex((t, i) => unlocked(i) && !(S.stars[t.id] >= 1));
  const dr = S.day.date === today() ? S.day.rounds : 0;
  let h = T`<div class="hello"><div class="big">${TOPICS[Math.max(0, nextIdx)]?.emoji || '🏆'}</div><div style="flex:1">
    <h1>Merhaba ${esc(S.name)}! 👋</h1><p>Bugünkü hedef: ${Math.min(dr, GOAL)}/${GOAL} tur · Toplam ${totalStars}/${TOPICS.length * 3} ⭐</p>
    <div class="goal"><i style="width:${Math.min(100, dr / GOAL * 100)}%"></i></div></div></div>`;
  h += T`<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:4px 0 2px"><span class="chip" style="box-shadow:none;background:none">📚 Sınıfına git:</span>${REGIONS.map((r, ri) => `<button class="chip" data-r="${ri}" style="font-size:15px;padding:4px 10px;background:${r.bg}">${r.emoji} ${r.grade || ''}</button>`).join('')}</div>`;
  REGIONS.forEach((r, ri) => {
    h += `<section class="region" id="reg${ri}" style="background:${r.bg}"><h2>${r.emoji} ${r.grade ? T`${r.grade}. Sınıf · ` : ''}${r.name}</h2><p class="sub">${r.sub}</p><div class="path">`;
    TOPICS.forEach((t, i) => { if (t.region !== ri) return;
      const st = S.stars[t.id] || 0, lock = !unlocked(i), g = GRADES[t.id];
      h += `<button class="node ${lock ? 'locked' : ''} ${st ? 'done' : ''} ${i === nextIdx ? 'next' : ''}" data-i="${i}">
        <div class="bub">${t.emoji}</div><div class="nm">${t.name}</div>${g ? `<div style="font-size:12px;font-weight:700;background:#fff;border-radius:8px;padding:0 6px;margin-top:2px;color:var(--muted)">${T`${g}. sınıf`}</div>` : ''}<div class="st">${'⭐'.repeat(st)}${'☆'.repeat(3 - st)}</div></button>`; });
    h += `</div></section>`;
  });
  h += T`<div class="mapbtns"><button class="btn blue" id="mMist">📒 Hatalarım (${S.mistakes.length})</button><button class="btn ghost" id="mMix">🎲 Karışık Tekrar</button></div>`;
  view.innerHTML = h;
  view.querySelectorAll('.node').forEach(n => n.onclick = () => { sndTap(); topicSheet(+n.dataset.i); });
  view.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { sndTap(); $('reg' + b.dataset.r).scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('mMist').onclick = mistakes;
  $('mMix').onclick = () => { const open = TOPICS.map((t, i) => i).filter(i => (S.stars[TOPICS[i].id] || 0) >= 1); if (open.length < 2) { openModal(T`<div class="head"><div class="big">🦉</div><h2>Biraz daha!</h2><p>Karışık tekrar için en az 2 konuda yıldız kazan.</p></div><button class="btn" onclick="closeModal()">Tamam</button>`); return; } startQuiz(-1, 'mix'); };
  if (!S.welcomed) welcome();
  window.scrollTo(0, 0);
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function welcome() {
  openModal(T`<div class="head"><div class="big">🦁🐵🐧</div><h2>Matematik Safarisi'ne hoş geldin!</h2>
  <p class="muted">Her bölgede bir hayvan sana bir konuyu öğretecek. Soruları çöz, yıldız topla, hayvanları kurtar!</p></div>
  <p><b>Adın ne?</b></p><input class="txt" id="nm" value="${esc(S.name)}" maxlength="18">
  <button class="btn" id="go">Maceraya başla! 🚀</button>`);
  $('go').onclick = () => { S.name = ($('nm').value.trim() || T('Kaşif')); S.welcomed = true; save(); home(); };
}

function topicSheet(i) {
  const t = TOPICS[i];
  if (!unlocked(i)) { openModal(T`<div class="head"><div class="big">🔒</div><h2>${t.name}</h2><p>Bu konuyu açmak için önce <b>${TOPICS[i - 1].name}</b> konusundan en az 1 ⭐ kazan.</p></div><button class="btn" onclick="closeModal()">Tamam</button>`); return; }
  const st = S.stars[t.id] || 0, best = S.best[t.id] || 0, s = S.stats[t.id] || { c: 0, w: 0 };
  openModal(T`<div class="head"><div class="big">${t.emoji}</div><h2>${t.name}</h2><p class="muted">Rehberin: ${t.animal}${GRADES[t.id] ? T` · ${GRADES[t.id]}. sınıf konusu` : ''}</p>
    <div style="font-size:28px">${'⭐'.repeat(st)}${'☆'.repeat(3 - st)}</div>
    ${s.c + s.w ? T`<p class="muted">Doğruluk: %${Math.round(s.c / (s.c + s.w) * 100)} · Hız rekoru: ${best}</p>` : ''}</div>
    <button class="btn blue" id="tL">📖 Önce mantığını öğren</button>
    <button class="btn green" id="tP">✏️ Alıştırma (10 soru)</button>
    <button class="btn" id="tS" ${st ? '' : 'disabled'}>⚡ Hız Turu (60 sn) ${st ? '' : '· 1⭐ gerekli'}</button>
    <button class="btn ghost" onclick="closeModal()">Kapat</button>`);
  $('tL').onclick = () => { closeModal(); lesson(i, 0); };
  $('tP').onclick = () => { closeModal(); startQuiz(i, 'practice'); };
  $('tS').onclick = () => { closeModal(); startQuiz(i, 'speed'); };
}

// ---------- Ders ----------
function lesson(i, k) {
  const t = TOPICS[i], L = t.lesson, [title, body] = L[k];
  view.innerHTML = T`<div class="mascot"><div class="ani hop">${t.emoji}</div><div class="say"><b>${t.animal}</b> anlatıyor · ${t.name}</div></div>
  <div class="card lesson"><h3>${title}</h3><div class="body">${body}</div></div>
  <div class="dots">${L.map((_, j) => `<i class="${j === k ? 'on' : ''}"></i>`).join('')}</div>
  <div class="row"><button class="btn ghost" id="lp">${k ? T('◀ Geri') : T('🗺️ Harita')}</button>
  <button class="btn ${k === L.length - 1 ? 'green' : ''}" id="ln">${k === L.length - 1 ? T('Hadi deneyelim! ✏️') : T('İleri ▶')}</button></div>`;
  $('lp').onclick = () => k ? lesson(i, k - 1) : home();
  $('ln').onclick = () => k === L.length - 1 ? startQuiz(i, 'practice') : lesson(i, k + 1);
  window.scrollTo(0, 0);
}

// ---------- Soru motoru ----------
let Q = null, TIMER = null;
const PRAISE = [T('Harika!'), T('Süpersin!'), T('Tam isabet!'), T('Muhteşem!'), T('Beynin yanıyor! 🔥'), T('Bravo!'), T('Aynen böyle!')];
const RETRY = [T('Neredeyse! İpucuna bak ve tekrar dene.'), T('Hiç sorun değil, bir daha dene!'), T('Yaklaştın! İpucu seni yönlendirecek.')];
function stopTimer() { if (TIMER) clearInterval(TIMER); TIMER = null; }

function startQuiz(i, mode) {
  stopTimer();
  Q = { ti: i, mode, n: 0, total: mode === 'speed' ? Infinity : 10, pts: 0, correct: 0, first: 0, xp: 0, time: 60, cur: null };
  if (mode === 'speed') TIMER = setInterval(() => { Q.time--; const el = $('tm'); if (el) { el.textContent = '⏱ ' + Q.time; el.classList.toggle('low', Q.time <= 10); } if (Q.time <= 0) { stopTimer(); finish(); } }, 1000);
  nextQ();
}
function diffFor() {
  if (Q.mode === 'practice') return Q.n < 3 ? 1 : Q.n < 7 ? 2 : 3;
  if (Q.mode === 'mix') return pick([1, 2, 2, 3]);
  const st = S.stars[TOPICS[Q.ti].id] || 1; return Math.min(3, R(1, st + 1));
}
function topicFor() { if (Q.mode !== 'mix') return Q.ti; const open = TOPICS.map((t, i) => i).filter(i => (S.stars[TOPICS[i].id] || 0) >= 1); return pick(open); }

function nextQ() {
  if (Q.n >= Q.total) return finish();
  const ti = topicFor(), t = TOPICS[ti], q = t.gen(diffFor());
  if (q.choices && !q.fixed) shuffle(q.choices);
  if (q.choices && q.fixed && q.choices.length === 2 && !q.choices[0].h.includes(T('Evet')) && chance(.5)) q.choices.reverse();
  Q.cur = { ...q, hintText: q.hint, ti, tries: 0, hint: false, input: '', done: false };
  render();
}

function render() {
  const q = Q.cur, t = TOPICS[q.ti];
  const prog = Q.mode === 'speed' ? `<div class="timer" id="tm">⏱ ${Q.time}</div><div class="chip">✔️ ${Q.correct}</div>` :
    `<div class="bar"><i style="width:${Q.n / Q.total * 100}%"></i></div><div class="chip">${Q.n + 1}/${Q.total}</div>`;
  let ans = '';
  if (q.choices) ans = `<div class="choices">${q.choices.map((c, k) => `<button class="choice" data-k="${k}">${c.h}</button>`).join('')}</div>`;
  else ans = `<div class="ansbox empty" id="ab">?</div>
    <div class="pad" id="pad">${['7', '8', '9', '⌫', '4', '5', '6', '/', '1', '2', '3', DECSEP, '−', '0', 'OK'].map(k =>
      `<button data-k="${k}" class="${k === 'OK' ? 'go' : k === '⌫' ? 'del' : '/,.−'.includes(k) ? 'op' : ''}">${k === 'OK' ? T('Kontrol ✔') : k}</button>`).join('')}</div>`;
  view.innerHTML = `<div class="qtop"><button class="chip" id="qx" style="font-size:20px">✖</button>${prog}</div>
  <div class="mascot"><div class="ani" id="ani">${t.emoji}</div><div class="say" id="say">${Q.mode === 'mix' ? `<b>${t.name}</b> · ` : ''}${Q.mode === 'speed' ? T('Hızlı ol! ⚡') : pick([T('Sen yaparsın!'), T('Dikkatlice oku.'), T('Hadi bakalım!'), T('Bu soruyu çözebilirsin!'), T('Mantığını düşün 🧠')])}</div></div>
  <div class="qcard" id="qc"><div class="qtext ${q.long ? 'long' : ''}">${q.q}</div>${q.sub ? `<div class="muted" style="font-size:15px">${q.sub}</div>` : ''}
  ${q.vis ? `<div class="vis">${q.vis}</div>` : ''}${ans}
  ${Q.mode !== 'speed' ? T`<div class="tools"><button class="btn ghost" id="hb">💡 İpucu</button></div>` : ''}
  <div id="fbx"></div></div>`;
  $('qx').onclick = () => { if (Q.mode === 'speed' || Q.n === 0) return home(); openModal(T`<div class="head"><div class="big">🥺</div><h2>Çıkmak istiyor musun?</h2><p>Bu turdaki ilerlemen kaydedilmeyecek.</p></div><div class="row"><button class="btn ghost" onclick="closeModal()">Devam et</button><button class="btn" onclick="home()">Çık</button></div>`); };
  if ($('hb')) $('hb').onclick = showHint;
  if (q.choices) view.querySelectorAll('.choice').forEach(b => b.onclick = () => answerChoice(+b.dataset.k, b));
  else view.querySelectorAll('#pad button').forEach(b => b.onclick = () => key(b.dataset.k));
}

function showHint() {
  const q = Q.cur; if (q.done) return; q.hint = true;
  $('fbx').innerHTML = T`<div class="fb hint"><b class="t">💡 İpucu</b>${q.hintText}</div>`;
}

function key(k) {
  const q = Q.cur; if (q.done) return; sndTap();
  if (k === 'OK') return submit();
  if (k === '⌫') q.input = q.input.slice(0, -1);
  else if (k === '−') q.input = q.input.startsWith('-') ? q.input.slice(1) : '-' + q.input;
  else if (q.input.length < 10) { if ((k === '/' || k === ',' || k === '.') && /[/,.]/.test(q.input)) return; q.input += k; }
  const ab = $('ab'); ab.className = 'ansbox' + (q.input ? '' : ' empty'); ab.innerHTML = q.input ? showInput(q.input) : '?';
}
function showInput(s) { s = s.replace('-', '−'); if (s.includes('/')) { const [a, b] = s.split('/'); return F(a || '&nbsp;', b || '&nbsp;'); } return s; }
function parseIn(s) {
  s = s.replace(/−/g, '-').replace(',', '.').trim(); if (!s || s === '-') return null;
  if (s.includes('/')) { const [a, b] = s.split('/'); if (a === '' || a === '-' || b === '') return null; const n = +a, d = +b; if (!isFinite(n) || !isFinite(d) || d === 0) return null; return { v: n / d, n, d, frac: true }; }
  const v = +s; if (!isFinite(v)) return null; return { v, n: v, d: 1, frac: false };
}
function judge(q, s) {
  const p = parseIn(s); if (!p) return 'invalid';
  if (q.simp) { const [n, d] = q.simp; if (Math.abs(p.v - n / d) > 1e-9) return false;
    if (d === 1) return true; return (p.frac && Math.abs(p.n) === n && p.d === d) ? true : 'almost'; }
  return Math.abs(p.v - q.ans) < 1e-6;
}
function answerText(q) { if (q.choices) return q.choices.find(c => c.ok).h; if (q.at) return q.at; return Number.isInteger(q.ans) ? sg(q.ans) : dec(q.ans); }

function submit() {
  const q = Q.cur, r = judge(q, q.input);
  if (r === 'invalid') { $('say').textContent = T('Önce bir cevap yaz 🙂'); return; }
  if (r === 'almost') { $('fbx').innerHTML = T`<div class="fb hint"><b class="t">🤏 Değer doğru ama...</b>Bu kesir daha da sadeleşir! Pay ve paydayı aynı sayıya bölmeye devam et.</div>`; return; }
  outcome(r === true, () => { $('ab').className = 'ansbox ' + (r === true ? 'ok' : 'bad'); });
}
function answerChoice(k, btn) {
  const q = Q.cur; if (q.done) return; const ok = q.choices[k].ok;
  outcome(ok, () => { btn.classList.add(ok ? 'ok' : 'bad'); if (ok || q.tries >= 1 || Q.mode === 'speed') view.querySelectorAll('.choice').forEach((b, j) => { if (q.choices[j].ok) b.classList.add('ok'); b.disabled = true; }); });
}

function outcome(ok, paint) {
  const q = Q.cur, t = TOPICS[q.ti], id = t.id;
  S.stats[id] = S.stats[id] || { c: 0, w: 0 };
  paint();
  if (Q.mode === 'speed') {
    q.done = true;
    if (ok) { Q.correct++; Q.xp += 5; S.stats[id].c++; sndOk(); hop(); setTimeout(() => { Q.n++; Q.time > 0 && nextQ(); }, 350); }
    else { S.stats[id].w++; sndBad(); $('qc').classList.add('shake'); $('fbx').innerHTML = T`<div class="fb bad">Doğrusu: <b>${answerText(q)}</b></div>`; setTimeout(() => { Q.n++; Q.time > 0 && nextQ(); }, 1300); }
    return;
  }
  if (ok) {
    q.done = true; S.stats[id].c++;
    const gain = q.tries === 0 ? (q.hint ? 6 : 10) : 4; Q.xp += gain; Q.correct++;
    Q.pts += q.tries === 0 ? (q.hint ? .75 : 1) : .5; if (q.tries === 0 && !q.hint) Q.first++;
    sndOk(); hop(); floatText('+' + gain + ' ⭐');
    $('say').textContent = pick(PRAISE);
    $('fbx').innerHTML = T`<div class="fb ok"><b class="t">✅ ${pick(PRAISE)}</b><details><summary style="cursor:pointer;color:var(--muted)">Nasıl çözülür?</summary><div class="steps">${q.exp}</div></details></div>
      <button class="btn green" id="nx">Devam ▶</button>`;
    $('nx').onclick = () => { Q.n++; nextQ(); };
    hideInputs();
    return;
  }
  sndBad(); $('qc').classList.remove('shake'); void $('qc').offsetWidth; $('qc').classList.add('shake');
  if (q.tries === 0 && !(q.choices && q.choices.length === 2)) {
    q.tries = 1;
    $('say').textContent = pick(RETRY);
    $('fbx').innerHTML = T`<div class="fb hint"><b class="t">💡 İpucu</b>${q.hintText}</div>`;
    if (!q.choices) setTimeout(() => { q.input = ''; const ab = $('ab'); if (ab) { ab.className = 'ansbox empty'; ab.textContent = '?'; } }, 700);
    return;
  }
  q.done = true; S.stats[id].w++;
  S.mistakes.unshift({ t: t.name, e: t.emoji, q: q.q + (q.vis && q.vis.startsWith('<div class="fbar') ? q.vis : ''), a: answerText(q), x: q.exp });
  S.mistakes = S.mistakes.slice(0, 40);
  $('say').textContent = T('Sorun yok, birlikte bakalım 👇');
  $('fbx').innerHTML = T`<div class="fb bad"><b class="t">Doğru cevap: ${answerText(q)}</b>Çözüm adımları:<div class="steps">${q.exp}</div></div><button class="btn" id="nx">Anladım, devam ▶</button>`;
  $('nx').onclick = () => { Q.n++; nextQ(); };
  if (q.choices) view.querySelectorAll('.choice').forEach((b, j) => { if (q.choices[j].ok) b.classList.add('ok'); b.disabled = true; });
  hideInputs(); save();
}
function hideInputs() { const p = $('pad'); if (p) p.style.display = 'none'; const h = $('hb'); if (h) h.parentNode.style.display = 'none'; setTimeout(() => { const n = $('nx'); n && n.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50); }
function hop() { const a = $('ani'); if (a) { a.classList.remove('hop'); void a.offsetWidth; a.classList.add('hop'); } }

// ---------- Sonuç ----------
function finish() {
  stopTimer(); if (!Q) return;
  const t = Q.ti >= 0 ? TOPICS[Q.ti] : null;
  markDay(); S.xp += Q.xp;
  let h = '';
  if (Q.mode === 'speed') {
    const old = S.best[t.id] || 0, rec = Q.correct > old; if (rec) S.best[t.id] = Q.correct;
    h = T`<div class="card res"><div style="font-size:64px">${t.emoji}⚡</div><h2>Hız turu bitti!</h2>
      <div class="stat"><div><b>${Q.correct}</b>doğru</div><div><b>${Math.max(old, Q.correct)}</b>rekor</div><div><b>+${Q.xp}</b>⭐ puan</div></div>
      ${rec ? T('<p>🏆 <b>Yeni rekor!</b> Muhteşem!</p>') : T`<p>Rekorun ${old}. Bir daha dene, geçebilirsin!</p>`}</div>`;
    if (rec) { sndWin(); confetti(['⚡', '🏆', '⭐']); }
  } else {
    const ratio = Q.pts / Q.total, stars = ratio >= .95 ? 3 : ratio >= .8 ? 2 : ratio >= .6 ? 1 : 0;
    let newAnimal = false, unlockedNext = false;
    if (t) { const old = S.stars[t.id] || 0; if (stars > old) { S.stars[t.id] = stars; if (!old && stars) { newAnimal = true; unlockedNext = !!TOPICS[Q.ti + 1]; } } }
    const msg = stars === 3 ? T('Kusursuz! Sen bir matematik kaşifisin!') : stars === 2 ? T('Çok iyi! Biraz daha pratikle 3 yıldız senin!') : stars === 1 ? T('Güzel! Konuyu kaptın, şimdi pekiştirelim.') : T('Henüz yıldız yok ama öğreniyorsun! Önce dersi tekrar okumayı dene.');
    h = T`<div class="card res"><div style="font-size:64px">${t ? t.emoji : '🎲'}</div><h2>${t ? t.name : T('Karışık Tekrar')}</h2>
      <div class="stars">${[0, 1, 2].map(k => `<span>${k < stars ? '⭐' : '☆'}</span>`).join('')}</div><p>${msg}</p>
      <div class="stat"><div><b>${Q.correct}/${Q.total}</b>doğru</div><div><b>${Q.first}</b>ilk denemede</div><div><b>+${Q.xp}</b>⭐ puan</div></div></div>`;
    if (newAnimal) h += T`<div class="card res"><div style="font-size:72px">${t.emoji}</div><h2>${t.animal} hayvanat bahçene katıldı! 🎉</h2>${unlockedNext ? T`<p>Yeni konu açıldı: <b>${TOPICS[Q.ti + 1].emoji} ${TOPICS[Q.ti + 1].name}</b></p>` : T('<p>🏆 Tüm safariyi tamamladın!</p>')}</div>`;
    if (stars >= 2) { sndWin(); confetti(newAnimal ? [t.emoji, '⭐', '🎉'] : undefined); } else if (stars) sndOk();
  }
  if (S.day.rounds === GOAL) h += T`<div class="card res"><h2>🎯 Günlük hedef tamam!</h2><p>${streakNow()} gündür serin devam ediyor 🔥</p></div>`;
  const ti = Q.ti, mode = Q.mode; save(); Q = null; topbar();
  h += T`<div class="row"><button class="btn ghost" id="rH">🗺️ Harita</button><button class="btn" id="rA">🔁 Tekrar</button></div>`;
  if (t && mode === 'practice' && (S.stars[t.id] || 0) >= 1 && TOPICS[ti + 1] && unlocked(ti + 1)) h += T`<button class="btn green" id="rN">Sıradaki konu: ${TOPICS[ti + 1].emoji} ${TOPICS[ti + 1].name} ▶</button>`;
  view.innerHTML = h; window.scrollTo(0, 0);
  $('rH').onclick = home; $('rA').onclick = () => startQuiz(ti, mode);
  if ($('rN')) $('rN').onclick = () => lesson(ti + 1, 0);
}

// ---------- Hayvanat bahçesi ----------
function zoo() {
  stopTimer(); Q = null;
  const got = TOPICS.filter(t => S.stars[t.id] >= 1).length;
  view.innerHTML = T`<div class="card" style="text-align:center"><h2 style="margin:0">🐾 Hayvanat Bahçem</h2><p class="muted" style="margin:4px 0">${got}/${TOPICS.length} hayvan kurtarıldı · Seviye ${level()}</p></div>
  <div class="zoo">${TOPICS.map((t, i) => { const st = S.stars[t.id] || 0;
    return `<div class="z ${st ? '' : 'no'}"><div class="e">${t.emoji}</div><b>${st ? t.animal : '???'}</b><small>${t.name}</small><div>${'⭐'.repeat(st)}${'☆'.repeat(3 - st)}</div>${S.best[t.id] ? `<small>⚡ ${S.best[t.id]}</small>` : ''}</div>`; }).join('')}</div>
  <button class="btn ghost" onclick="home()">🗺️ Haritaya dön</button>`;
  window.scrollTo(0, 0);
}

// ---------- Hatalar ----------
function mistakes() {
  stopTimer(); Q = null;
  view.innerHTML = T`<div class="card"><h2 style="margin:0">📒 Hatalarımdan Öğreniyorum</h2><p class="muted" style="margin:4px 0">Hata yapmak öğrenmenin parçası! Çözüm adımlarına bir göz at.</p></div>
  <div class="list">${S.mistakes.length ? S.mistakes.map(m => T`<div class="it"><div class="muted">${m.e} ${m.t}</div><div class="q">${m.q}</div>
    <details><summary style="cursor:pointer">Cevap: <b>${m.a}</b> — çözümü göster</summary><div class="steps fb" style="background:#fff8ea">${m.x}</div></details></div>`).join('') : T('<div class="it">Henüz hata yok! 🎉</div>')}</div>
  ${S.mistakes.length ? T('<button class="btn ghost" id="clr">🧹 Listeyi temizle</button>') : ''}<button class="btn" onclick="home()">🗺️ Haritaya dön</button>`;
  if ($('clr')) $('clr').onclick = () => { S.mistakes = []; save(); mistakes(); };
  window.scrollTo(0, 0);
}

// ---------- Ayarlar / Ebeveyn ----------
function settings() {
  const rows = TOPICS.map(t => { const s = S.stats[t.id] || { c: 0, w: 0 }, n = s.c + s.w;
    return `<tr><td>${t.emoji} ${t.name}</td><td>${'⭐'.repeat(S.stars[t.id] || 0) || '–'}</td><td>${n ? '%' + Math.round(s.c / n * 100) : '–'}</td><td>${n}</td></tr>`; }).join('');
  openModal(T`<h2>⚙️ Ayarlar</h2>
  <p><b>Oyuncu adı</b></p><input class="txt" id="sn" value="${esc(S.name)}" maxlength="18">
  <div class="sw"><span>🔊 Sesler</span><button id="ss" class="${S.sound ? 'on' : ''}"></button></div>
  <h3 style="margin:16px 0 4px">👨‍👩‍👦 Ebeveyn paneli</h3>
  <p class="muted" style="font-size:15px">Hangi konuda zorlandığını buradan görebilirsiniz. %70 altı doğruluk = o konuya tekrar dönün.</p>
  <table class="st"><tr><th>Konu</th><th>⭐</th><th>Doğru</th><th>Soru</th></tr>${rows}</table>
  <div class="sw"><span>🔓 Tüm konuları aç</span><button id="su" class="${S.unlockAll ? 'on' : ''}"></button></div>
  <button class="btn" id="sv">Kaydet</button>
  <button class="btn ghost" id="sr" style="color:var(--bad)">İlerlemeyi sıfırla</button>`);
  $('ss').onclick = e => e.target.classList.toggle('on');
  $('su').onclick = e => e.target.classList.toggle('on');
  $('sv').onclick = () => { S.name = $('sn').value.trim() || S.name; S.sound = $('ss').classList.contains('on'); S.unlockAll = $('su').classList.contains('on'); save(); home(); };
  $('sr').onclick = () => { if (confirm(T('Tüm yıldızlar ve puanlar silinsin mi? Bu geri alınamaz.'))) { const n = S.name; S = { ...DEF, name: n, welcomed: true }; save(); home(); } };
}

// ---------- Klavye desteği ----------
document.addEventListener('keydown', e => {
  if (!Q || !Q.cur || $('modal').classList.contains('hidden') === false) return;
  const q = Q.cur;
  if (q.done && e.key === 'Enter') { const n = $('nx'); if (n) n.click(); return; }
  if (q.choices) { const k = +e.key; if (k >= 1 && k <= q.choices.length) view.querySelectorAll('.choice')[k - 1].click(); return; }
  if (/^[0-9]$/.test(e.key)) key(e.key);
  else if (e.key === 'Backspace') key('⌫');
  else if (e.key === 'Enter') key('OK');
  else if (e.key === '-') key('−');
  else if (e.key === '/') key('/');
  else if (e.key === ',' || e.key === '.') key(DECSEP);
});

$('btnHome').onclick = home; $('btnZoo').onclick = zoo; $('btnSet').onclick = settings;
home();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('/sw.js').catch(() => {});
