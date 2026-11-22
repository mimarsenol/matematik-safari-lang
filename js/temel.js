'use strict';
/* =========================================================
   Başlangıç Çayırı — sıfırdan temel konular
   (app.js'ten sonra yüklenir, haritanın en başına eklenir)
   ========================================================= */
(function () {
  const ANIMALS = ['🐥', '🐞', '🐟', '🍎', '🦋', '🐌', '⭐', '🍓'];
  // Nesneleri 5'li sıralar halinde diz: saymak kolaylaşsın
  const dots = (e, n) => { let h = '<div class="grp" style="font-size:28px;letter-spacing:4px">'; for (let i = 0; i < n; i += 5) h += `<div>${e.repeat(Math.min(5, n - i))}</div>`; return h + '</div>'; };
  const rowsText = n => { const r = []; for (let i = 0; i < n; i += 5) r.push(Math.min(5, n - i)); return r; };
  const blocks = (t, o, hu) => `<div class="grp" style="font-size:26px;text-align:left">${hu ? `<div>${'💯'.repeat(hu)}</div>` : ''}${t ? `<div>${'🔟'.repeat(t)}</div>` : ''}${o ? `<div>${'🟡'.repeat(o)}</div>` : ''}</div>`;
  const PLACE = [T('birler'), T('onlar'), T('yüzler')];

  const BASIC = [
  // ------------------------------------------------------ A
  { id: 'say', region: 0, emoji: '🐥', animal: T('Civciv Cik'), name: T('Saymayı Öğren'),
    lesson: [
      [T('Tek tek say'), T`Her nesneye <b>bir kez</b> dokun ve sayıyı söyle:
       <div class="ex" style="font-size:28px">🐥🐥🐥🐥🐥<br>🐥🐥🐥</div>
       <div class="ex">1, 2, 3, 4, 5 … 6, 7, 8 → <b>8 civciv</b></div>
       <div class="tip">🐥 Cik'in sırrı: 5'li sıraları hızlı say! Bir sıra dolu ise 5'tir: 5 + 3 = 8</div>`],
      [T('10 tane = 1 onluk'), T`10 tane bir araya gelince bir <b>onluk</b> olur.
       <div class="ex">🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡 = 🔟</div>
       <div class="ex">🔟 + 🟡🟡🟡 = 10 + 3 = <b>13</b></div>`],
      [T('Sayıların sırası'), T`Her sayı bir öncekinden <b>1 fazladır</b>.
       <div class="ex">… 27, <b>28</b>, 29 …<br>28'den sonra 29 gelir (28 + 1)<br>28'den önce 27 gelir (28 − 1)</div>
       <div class="tip">Hangisi büyük? Önce onluklara bak: 52 > 48 çünkü 5 onluk > 4 onluk.</div>`],
    ],
    gen(d) {
      if (d === 1) { const n = R(2, 10), e = pick(ANIMALS), r = rowsText(n);
        return { q: T`Kaç tane ${e} var?`, vis: dots(e, n), ans: n, hint: T('Her birine bir kez dokunarak say. Dolu bir sıra 5 tanedir.'), exp: T`Sıralar: ${r.join(' + ')} = ${n}` }; }
      if (d === 2) {
        if (chance(.5)) { const n = R(11, 20), e = pick(ANIMALS), r = rowsText(n);
          return { q: T`Kaç tane ${e} var?`, vis: dots(e, n), ans: n, hint: T('İki dolu sıra 10 eder. Sonra kalanları ekle.'), exp: T`Sıralar: ${r.join(' + ')}<br>İki dolu sıra = 10, kalan ${n - 10} → ${n}` }; }
        const x = R(2, 99), after = chance(.5);
        return { q: T`${x} sayısından ${after ? T('hemen SONRA') : T('hemen ÖNCE')} hangi sayı gelir?`, long: true, ans: after ? x + 1 : x - 1, hint: after ? T('Bir sonraki sayı 1 fazladır.') : T('Bir önceki sayı 1 eksiktir.'), exp: T`${x} ${after ? '+' : '−'} 1 = ${after ? x + 1 : x - 1}<br>Sıra: ${x - 1}, ${x}, ${x + 1}` };
      }
      if (chance(.5)) { let a, b; do { a = R(10, 99); b = R(10, 99); } while (a === b); const big = Math.max(a, b), sm = Math.min(a, b);
        const why = Math.floor(a / 10) !== Math.floor(b / 10) ? T`Onluklara bak: ${Math.floor(big / 10)} onluk > ${Math.floor(sm / 10)} onluk` : T`Onluklar eşit (${Math.floor(a / 10)}). Birliklere bak: ${big % 10} > ${sm % 10}`;
        return { q: T('Hangisi daha büyük?'), choices: [{ h: String(a), ok: a === big }, { h: String(b), ok: b === big }], fixed: true, hint: T('Önce onlar basamağına bak. Eşitse birlere bak.'), exp: `${why}<br>${big} > ${sm}` }; }
      const x = R(1, 97);
      return { q: `${x}, ?, ${x + 2}`, sub: T('Aradaki sayı hangisi?'), ans: x + 1, hint: T`${x} sayısından sonra gelen sayı.`, exp: `${x} + 1 = ${x + 1}<br>${x}, ${x + 1}, ${x + 2}` };
    } },
  // ------------------------------------------------------ B
  { id: 'basamak', region: 0, emoji: '🐸', animal: T('Kurbağa Vırak'), name: T('Basamak Değeri'),
    lesson: [
      [T('Birlikler ve onluklar'), T`🟡 = 1 birlik, 🔟 = 1 onluk (10 birlik)
       <div class="ex">🔟🔟🔟 🟡🟡🟡🟡<br>3 onluk + 4 birlik = 30 + 4 = <b>34</b></div>
       <div class="tip">🐸 Vırak: 34 sayısında 3 onlar basamağında, 4 birler basamağında oturur.</div>`],
      [T('Yüzlükler'), T`10 onluk = 1 <b>yüzlük</b> 💯
       <div class="ex"><b>253</b><br>2 yüzlük = 200<br>5 onluk = 50<br>3 birlik = 3<br>200 + 50 + 3 = 253</div>`],
      [T('Basamak değeri'), T`Bir rakamın değeri <b>oturduğu yere</b> göre değişir:
       <div class="ex">5<b>5</b>5 → ortadaki 5 aslında <b>50</b> değerinde<br>soldaki 5 → <b>500</b>, sağdaki 5 → <b>5</b></div>
       <div class="tip">Sıfır boş yeri tutar: 305 → 3 yüzlük, 0 onluk, 5 birlik.</div>`],
    ],
    gen(d) {
      if (d === 1) { const t = R(1, 9), o = R(0, 9);
        return { q: T('Bloklar hangi sayıyı gösteriyor?'), long: true, sub: '🔟 = 10, 🟡 = 1', vis: blocks(t, o), ans: 10 * t + o, hint: T('Önce onlukları say (10, 20, 30…), sonra birlikleri ekle.'), exp: T`${t} onluk = ${t * 10}<br>${o} birlik = ${o}<br>${t * 10} + ${o} = ${10 * t + o}` }; }
      if (d === 2) { const t = R(1, 9), o = R(0, 9), n = 10 * t + o, k = R(0, 2);
        if (k === 0) return { q: T`${n} sayısında kaç onluk var?`, long: true, ans: t, hint: T('Soldaki rakam onlar basamağıdır.'), exp: T`${n} = ${t} onluk + ${o} birlik<br>Cevap: ${t}` };
        if (k === 1) return { q: T`${n} sayısının birler basamağındaki rakam kaç?`, long: true, ans: o, hint: T('En sağdaki rakam birler basamağıdır.'), exp: T`${n} → onlar: ${t}, birler: ${o}` };
        return { q: T`${t} onluk + ${o} birlik = ?`, long: true, ans: n, hint: `${t} onluk = ${t * 10}`, exp: `${t * 10} + ${o} = ${n}` };
      }
      const n = R(101, 999), ds = String(n).split('').map(Number), k = R(0, 2);
      if (k === 0) { const h = ds[0], t = ds[1], o = ds[2]; return { q: `${h * 100} + ${t * 10} + ${o} = ?`, long: true, ans: n, hint: T('Yüzler, onlar, birler yerlerine yerleştir.'), exp: T`${h} yüzlük, ${t} onluk, ${o} birlik → ${n}` }; }
      let p; do { p = R(0, 2); } while (ds[2 - p] === 0);
      const dig = ds[2 - p];
      if (k === 1) return { q: T`${n} sayısının ${PLACE[p]} basamağındaki rakam kaç?`, long: true, ans: dig, hint: T('Sağdan sola: birler, onlar, yüzler.'), exp: T`${n}: yüzler ${ds[0]}, onlar ${ds[1]}, birler ${ds[2]}<br>Cevap: ${dig}` };
      return { q: T`${n} sayısının ${PLACE[p]} basamağındaki ${dig} rakamının basamak değeri kaç?`, long: true, ans: dig * 10 ** p, hint: T`${PLACE[p]} basamağı: ${['1', '10', '100'][p]} ile çarp.`, exp: T`${dig} rakamı ${PLACE[p]} basamağında<br>${dig} × ${10 ** p} = ${dig * 10 ** p}` };
    } },
  // ------------------------------------------------------ C
  { id: 'ilk', region: 0, emoji: '🐶', animal: T('Köpek Hav'), name: T('İlk Toplama & Çıkarma'),
    lesson: [
      [T('Toplama = bir araya getirme'), T`<div class="ex" style="font-size:26px">🦴🦴🦴 + 🦴🦴 = 🦴🦴🦴🦴🦴</div>
       <div class="ex">3 + 2 = <b>5</b><br>Büyük sayıdan başla, ileri say: 3 → 4, 5</div>`],
      [T('Çıkarma = geri sayma'), T`<div class="ex">9 − 3: 9'dan 3 adım geri say<br>8, 7, 6 → <b>6</b></div>
       <div class="tip">🐶 Hav: Çıkarma, kemiklerin bir kısmını yemek gibidir. Kaç tane kaldı?</div>`],
      [T('10\'un arkadaşları'), T`Toplamı 10 eden ikilileri ezberle — çok işine yarayacak!
       <div class="ex">1 + 9 &nbsp; 2 + 8 &nbsp; 3 + 7 &nbsp; 4 + 6 &nbsp; 5 + 5</div>`],
      [T('10 köprüsü'), T`<b>8 + 5</b> = ?
       <div class="ex">8'i 10'a tamamla: 8 + <b>2</b> = 10<br>5'ten 2 kullandık, <b>3</b> kaldı<br>10 + 3 = <b>13</b></div>
       <div class="tip">Önce 10'a git, sonra kalanı ekle. Çok hızlıdır!</div>`],
    ],
    gen(d) {
      if (d === 1) { if (chance(.6)) { const a = R(1, 7), b = R(1, 10 - a);
          return { q: `${a} + ${b} = ?`, vis: `<div class="grp" style="font-size:26px">${'🦴'.repeat(a)} + ${'🦴'.repeat(b)}</div>`, ans: a + b, hint: T`${Math.max(a, b)} sayısından başla, ${Math.min(a, b)} adım ileri say.`, exp: `${Math.max(a, b)} → ${Array.from({ length: Math.min(a, b) }, (_, i) => Math.max(a, b) + i + 1).join(', ')}<br>${a} + ${b} = ${a + b}` }; }
        const a = R(3, 10), b = R(1, a - 1);
        return { q: `${a} − ${b} = ?`, vis: `<div class="grp" style="font-size:26px">${'🦴'.repeat(a - b)}${'<span style="opacity:.25">🦴</span>'.repeat(b)}</div>`, ans: a - b, hint: T`${a} sayısından ${b} adım geri say.`, exp: `${a} → ${Array.from({ length: b }, (_, i) => a - i - 1).join(', ')}<br>${a} − ${b} = ${a - b}` }; }
      if (d === 2) { const k = R(0, 2);
        if (k === 0) { const a = R(1, 9); return { q: `${a} + ? = 10`, ans: 10 - a, hint: T('10\'un arkadaşlarını hatırla!'), exp: T`${a} + ${10 - a} = 10<br>(10'un arkadaşları: 1+9, 2+8, 3+7, 4+6, 5+5)` }; }
        if (k === 1) { const b = R(1, 9); return chance(.5) ? { q: `10 + ${b} = ?`, ans: 10 + b, hint: T('1 onluk ve birkaç birlik.'), exp: T`1 onluk + ${b} birlik = ${10 + b}` } : { q: `${10 + b} − ${b} = ?`, ans: 10, hint: T('Birlikleri çıkarınca sadece onluk kalır.'), exp: T`${10 + b} = 10 + ${b}<br>${b} birliği çıkar → 10` }; }
        const a = R(11, 19), b = R(1, a - 10); return { q: `${a} − ${b} = ?`, ans: a - b, hint: T('Sadece birlikler değişir, onluk aynı kalır.'), exp: `${a} = 10 + ${a - 10}<br>${a - 10} − ${b} = ${a - 10 - b}<br>10 + ${a - 10 - b} = ${a - b}` }; }
      const a = R(6, 9), b = R(11 - a, 9), s = a + b, need = 10 - a, rest = b - need;
      if (chance(.55)) return { q: `${a} + ${b} = ?`, ans: s, hint: T`10 köprüsü: ${a} sayısını 10'a tamamlamak için kaç lazım?`, exp: T`${a} + ${need} = 10<br>${b} sayısından ${need} kullandık, ${rest} kaldı<br>10 + ${rest} = ${s}` };
      const over = s - 10; // önce 10'a in, sonra kalanı çıkar
      return { q: `${s} − ${b} = ?`, ans: a, hint: T`Önce 10'a in: ${s} − ${over} = 10. Sonra kalanı çıkar.`, exp: T`${s} − ${over} = 10<br>${b} sayısının ${over} kadarını kullandık, ${b - over} kaldı<br>10 − ${b - over} = ${a}` };
    } },
  ];

  // Mevcut konuları bir bölge kaydır, temel bölgeyi en başa ekle
  TOPICS.forEach(t => t.region++);
  REGIONS.unshift({ name: T('Başlangıç Çayırı'), grade: '1–2', emoji: '🌼', sub: T('Sıfırdan: saymak, basamaklar, ilk işlemler'), bg: '#fff1c9' });
  TOPICS.unshift(...BASIC);
  home();
})();
