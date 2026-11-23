'use strict';
/* =========================================================
   Kolaydan zora: dersler ve ilk sorular en temelden başlasın
   - Ders kartları: önce kavram (küçük sayı / resim) → çok kolay örnek → biraz büyük örnek → kural → özel durum
   - Soru üreticileri: d = 1 gerçekten ilk adım (küçük sayılar, tek işlem, elde yok);
     eski seviyeler bir basamak yukarı kaydırıldı.
   - Metinler Türkçe; çevirileri gelene kadar sadece Türkçe sayfada devreye girer.
   (ileri.js'ten sonra, ekran.js'ten önce yüklenir)
   ========================================================= */
(function () {
  if (typeof LANG !== 'undefined' && LANG !== 'tr') return;

  const byId = id => TOPICS.find(t => t.id === id);
  // Dersi değiştir: eski kartlara numarayla erişilebilsin (k(0) = eski 1. kart)
  const les = (id, f) => { const t = byId(id); if (!t) return; const o = t.lesson.slice(); t.lesson = f(k => o[k][1]); };
  // Üreticiyi sar: old(d) eski üreticiyi kendi bağlamında çağırır (this.gen de eskiyi çağırsın)
  const wrap = (id, f) => { const t = byId(id); if (!t) return; const g0 = t.gen, ctx = { gen: g0 }, old = d => g0.call(ctx, d); t.gen = function (d) { return f(d, old); }; };
  const nz = (a, b) => { let x; do { x = R(a, b); } while (!x); return x; };
  const SQ = n => `√<span style="border-top:3px solid currentColor;padding:0 2px">${n}</span>`;
  const big = s => `<div class="grp" style="font-size:26px">${s}</div>`;
  const cx = (c, v) => (c === 1 ? '' : c) + v;   // 1x → x
  const tail = (n, d) => gcd(n, d) > 1 ? T`<br>Sadeleşmiş hali: ${fracText(n, d)}` : '';

  // ======================================================= BÖLME
  les('bol', () => [
    [T('Bölme = paylaştırma'), T`<b>6 ÷ 2</b>: 6 balığı 2 penguene eşit paylaştır.
     <div class="ex">🐟🐟🐟🐟🐟🐟<br>🐧 🐟🐟🐟 | 🐧 🐟🐟🐟<br>Her birine <b>3</b> düşer: 6 ÷ 2 = 3</div>
     <div class="tip">🐧 Pino der ki: Eşit paylaştır, kimse küsmesin!</div>`],
    [T('Çarpmanın tersi'), T`<b>12 ÷ 3</b> = ? Kendine sor: "3 kere kaç 12 eder?"
     <div class="ex">3 × 4 = 12<br>O halde 12 ÷ 3 = <b>4</b></div>
     <div class="tip">Bölme, çarpmanın tersidir. Çarpım tablosu en iyi yardımcın!</div>`],
    [T('Büyük sayıyı parçala'), T`<b>48 ÷ 4</b> = ? Sayıyı kolay bölünen parçalara ayır:
     <div class="ex">48 = 40 + 8<br>40 ÷ 4 = 10 &nbsp; 8 ÷ 4 = 2<br>10 + 2 = <b>12</b></div>`],
    [T('Artan olursa: kalan'), T`<b>7 ÷ 2</b>: 7 balığı 2 penguene paylaştır.
     <div class="ex">🐧 🐟🐟🐟 | 🐧 🐟🐟🐟 | artan 🐟<br>Bölüm = <b>3</b>, Kalan = <b>1</b></div>
     <div class="tip">Kalan her zaman bölenden <b>küçük</b> olmalı!</div>`],
  ]);
  wrap('bol', (d, old) => {
    if (d === 2) return old(1);
    if (d === 3) return old(chance(.5) ? 2 : 3);
    const b = R(2, 4), q = R(2, 5), a = b * q;
    return { q: `${a} ÷ ${b} = ?`, vis: big('🐟'.repeat(a) + '<br>' + '🐧'.repeat(b)), ans: q,
      hint: T`${a} balığı ${b} penguene eşit paylaştır. Ya da kendine sor: ${b} × ? = ${a}`,
      exp: T`Her penguene ${q} balık düşer:${groups(b, q, '🐟')}${b} × ${q} = ${a} → ${a} ÷ ${b} = ${q}` };
  });

  // ======================================================= İŞLEM ÖNCELİĞİ
  les('oncelik', k => [
    [T('Hangisi önce?'), T`Bir işlemde hem <b>+</b> hem <b>×</b> varsa önce <b>çarpma</b> yapılır.
     <div class="ex"><b>1 + 2 × 3</b><br>Önce çarpma: 2 × 3 = 6<br>Sonra toplama: 1 + 6 = <b>7</b></div>
     <div class="tip">🦉 Bilge der ki: Çarpma ve bölme aceleci, hep öne geçer!</div>`],
    [T('Biraz daha büyük'), T`<b>5 + 3 × 4</b> = ?
     <div class="ex">Önce çarpma: 3 × 4 = 12<br>Sonra toplama: 5 + 12 = <b>17</b></div>
     <div class="tip">❌ 5 + 3 = 8, 8 × 4 = 32 YANLIŞ!</div>`],
    [T('Parantez en önce'), T`Parantez "önce beni yap!" der.
     <div class="ex"><b>(1 + 2) × 3</b><br>Önce parantez: 1 + 2 = 3<br>Sonra: 3 × 3 = <b>9</b></div>`],
    [T('Aynı türse soldan sağa'), T`Sadece + ve − varsa <b>soldan sağa</b> git:
     <div class="ex"><b>10 − 4 + 2</b><br>10 − 4 = 6<br>6 + 2 = <b>8</b></div>`],
    [T('Bilge\'nin kuralı'), k(0)],
  ]);
  wrap('oncelik', (d, old) => {
    if (d === 2) return old(1);
    if (d === 3) return old(chance(.5) ? 2 : 3);
    const a = R(1, 5), b = R(2, 3), c = R(2, 5), t = R(0, 3);
    if (t === 0) return { q: T`${a} + ${b} × ${c}`, sub: T('Önce hangi işlem yapılır?'), choices: [{ h: `${b} × ${c}`, ok: true }, { h: `${a} + ${b}`, ok: false }],
      hint: T('Çarpma, toplamadan önce gelir.'), exp: T`Önce çarpma: ${b} × ${c} = ${b * c}<br>Sonra toplama: ${a} + ${b * c} = ${a + b * c}` };
    if (t === 1) return { q: T`(${a} + ${b}) × ${c}`, sub: T('Önce hangi işlem yapılır?'), choices: [{ h: `${a} + ${b}`, ok: true }, { h: `${b} × ${c}`, ok: false }],
      hint: T('Parantez her şeyden önce gelir.'), exp: T`Önce parantez: ${a} + ${b} = ${a + b}<br>Sonra çarpma: ${a + b} × ${c} = ${(a + b) * c}` };
    if (t === 2) return { q: `${a} + ${b} × ${c} = ?`, ans: a + b * c, hint: T`Önce çarpmayı yap: ${b} × ${c}`, exp: T`Önce çarpma: ${b} × ${c} = ${b * c}<br>Sonra toplama: ${a} + ${b * c} = ${a + b * c}` };
    return { q: `(${a} + ${b}) × ${c} = ?`, ans: (a + b) * c, hint: T`Önce parantezin içi: ${a} + ${b}`, exp: T`Önce parantez: ${a} + ${b} = ${a + b}<br>Sonra çarpma: ${a + b} × ${c} = ${(a + b) * c}` };
  });

  // ======================================================= ÜSLÜ SAYILAR
  les('us', () => [
    [T('Üs = kısa yazma'), T`Aynı sayıyı tekrar tekrar çarpınca kısa yazarız:
     <div class="ex">2 × 2 × 2 = ${P(2, 3)}<br>Üç tane 2 çarpılıyor → üs <b>3</b></div>
     <div class="tip">🦁 Kral der ki: Büyük sayı <b>taban</b>, yukarıdaki küçük sayı <b>üs</b>.</div>`],
    [T('İlk örnek'), T`${P(3, 2)} = ?
     <div class="ex">3'ü 2 kez yaz ve çarp:<br>3 × 3 = <b>9</b></div>
     <div class="tip">Dikkat: ${P(3, 2)} = 3 × 3 = 9, <b>3 × 2 değil!</b></div>`],
    [T('Biraz daha büyük'), T`${P(2, 4)} = ?
     <div class="ex">2 × 2 × 2 × 2<br>= 4 × 2 × 2 = 8 × 2 = <b>16</b></div>
     <div class="tip">2'nin kuvvetlerinde her adımda ikiye katla: 2, 4, 8, 16, 32…</div>`],
    [T('Özel durumlar'), T`<div class="ex">${P(7, 1)} = 7 (1. kuvvet kendisi)<br>${P(7, 0)} = 1 (0. kuvvet hep 1)<br>${P(1, 9)} = 1<br>${P(10, 3)} = 1000 (üs kadar sıfır!)</div>`],
  ]);
  wrap('us', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(3);
    if (chance(.5)) { const a = R(2, 5), n = R(2, 4);
      return { q: `${Array(n).fill(a).join(' × ')} = ${P(a, '?')}`, ans: n, hint: T`Kaç tane ${a} çarpılıyor? Say!`, exp: T`${n} tane ${a} çarpılıyor → üs ${n}<br>${P(a, n)} = ${a ** n}` }; }
    const a = chance(.15) ? 10 : R(2, 5);
    return { q: `${P(a, 2)} = ?`, ans: a * a, hint: T`${a} sayısını kendisiyle çarp: ${a} × ${a} (${a} × 2 değil!)`, exp: powStep(a, 2) };
  });

  // ======================================================= BÖLÜNEBİLME
  les('bolunebilme', k => [
    [T('Tam bölünmek ne demek?'), T`Paylaştırınca <b>hiç artmıyorsa</b> tam bölünür.
     <div class="ex">6 🍎, 2 çocuk → 3'er elma, artan yok ✔️<br>7 🍎, 2 çocuk → 3'er elma, 1 artar ✖️</div>
     <div class="tip">🐢 Tosba der ki: 6, 2'ye tam bölünür; 7 bölünmez.</div>`],
    [T('2 kuralı'), T`Son rakama bak! <b>0, 2, 4, 6, 8</b> ile biten (çift) sayılar 2'ye bölünür.
     <div class="ex">14 → son rakam 4 → bölünür ✔️<br>15 → son rakam 5 → bölünmez ✖️</div>`],
    [T('5 ve 10 kuralı'), T`<div class="ex"><b>5</b> → son rakam 0 ya da 5<br>35 ✔️ &nbsp; 40 ✔️ &nbsp; 42 ✖️<br><b>10</b> → son rakam 0<br>40 ✔️ &nbsp; 45 ✖️</div>`],
    [T('3 ve 9 kuralı'), T`<b>Rakamlarını topla!</b>
     <div class="ex">27 → 2 + 7 = 9<br>9, hem 3'e hem 9'a bölünür<br>→ 27 de <b>3'e ve 9'a bölünür</b> ✔️</div>
     <div class="tip">471 → 4 + 7 + 1 = 12 → 3'e bölünür, 9'a bölünmez.</div>`],
    [T('4 ve 6 kuralı'), k(2)],
  ]);
  wrap('bolunebilme', (d, old) => {
    const ds = n => digits(n).reduce((a, b) => a + b, 0);
    const RULE = {
      2: [n => n % 2 === 0, T('Son rakam çift mi? (0, 2, 4, 6, 8)'), n => T`Son rakam ${n % 10}. ${n % 2 === 0 ? T('Çift → bölünür.') : T('Tek → bölünmez.')}`],
      5: [n => n % 5 === 0, T('Son rakam 0 ya da 5 mi?'), n => T`Son rakam ${n % 10}. ${n % 5 === 0 ? T('0 ya da 5 → bölünür.') : T('0 ya da 5 değil → bölünmez.')}`],
      10: [n => n % 10 === 0, T('Son rakam 0 mı?'), n => T`Son rakam ${n % 10}. ${n % 10 === 0 ? T('0 → bölünür.') : T('0 değil → bölünmez.')}`],
      3: [n => n % 3 === 0, T('Rakamlarını topla. Toplam 3\'ün katı mı?'), n => T`Rakamlar toplamı: ${digits(n).join(' + ')} = ${ds(n)}. ${ds(n) % 3 === 0 ? T('3\'ün katı → bölünür.') : T('3\'ün katı değil → bölünmez.')}`],
    };
    const make = k => { const n = chance(.5) ? k * R(Math.ceil(10 / k), Math.floor(99 / k)) : R(10, 99), r = RULE[k];
      return { q: T`${n} sayısı<br><b>${k}</b> ile tam bölünür mü?`, long: true, ...yesNo(r[0](n)), hint: r[1], exp: r[2](n) }; };
    if (d === 2) return chance(.5) ? old(1) : make(3);
    if (d === 3) return old(chance(.5) ? 2 : 3);
    return make(pick([2, 5, 10]));
  });

  // ======================================================= ASAL SAYILAR
  les('asal', () => [
    [T('Asal sayı nedir?'), T`Sadece <b>1'e ve kendisine</b> bölünen sayıya asal denir.
     <div class="ex">🍪🍪🍪🍪🍪 → 5 kurabiye eşit gruplara ayrılmaz<br>5'in bölenleri: 1 ve 5 → <b>asal</b> ✔️</div>
     <div class="tip">🦊 Kurnaz der ki: 6 = 🍪🍪🍪 + 🍪🍪🍪 → 2'ye bölünür, asal değil!</div>`],
    [T('Bölenleri say'), T`<div class="ex">7 → 1, 7 → <b>asal</b> ✔️<br>8 → 1, 2, 4, 8 → asal değil ✖️<br>9 → 1, 3, 9 → asal değil ✖️</div>
     <div class="tip">Tam <b>2</b> böleni varsa asaldır.</div>`],
    [T('İlk asal sayılar'), T`<div class="ex">2, 3, 5, 7, 11, 13, 17, 19, 23, 29</div>
     <div class="tip">1 asal <b>değildir</b> (tek böleni var). 2, tek çift asal sayıdır!</div>`],
    [T('Asal çarpanlara ayırma'), T`Sayıyı en küçük asaldan başlayarak böl:
     <div class="ex"><b>12</b><br>12 ÷ 2 = 6<br>6 ÷ 2 = 3<br>3 ÷ 3 = 1</div>
     <div class="tip">12 = 2 × 2 × 3 = ${P(2, 2)} × 3. Farklı asal çarpanları: 2 ve 3.</div>`],
  ]);
  wrap('asal', (d, old) => {
    if (d === 2) return old(1);
    if (d === 3) return old(chance(.5) ? 2 : 3);
    const n = chance(.05) ? 1 : chance(.45) ? pick([2, 3, 5, 7, 11, 13, 17, 19]) : R(2, 20), p = isPrime(n), dv = divisors(n);
    const exp = n === 1 ? T('1\'in tek böleni var: 1. Asal sayının tam 2 böleni olur → 1 asal değildir!')
      : T`${n} sayısının bölenleri: ${dv.join(', ')}<br>${p ? T('Sadece 1 ve kendisi → asal.') : T`${dv.length} böleni var → asal değil.`}`;
    return { q: T`${n} asal sayı mı?`, ...yesNo(p), hint: T`${n} sayısını tam bölen sayıları yaz. Sadece 1 ve ${n} mi?`, exp };
  });

  // ======================================================= EBOB & EKOK
  const ebobQ = (a, b, q) => { const da = divisors(a), db = divisors(b), g = gcd(a, b), mark = (x, o) => x.map(v => o.includes(v) ? `<b>${v}</b>` : v).join(', ');
    return { q, long: true, ans: g, hint: T('İki sayının bölenlerini yaz, ortak olanların en büyüğünü bul.'), exp: T`${a} → ${mark(da, db)}<br>${b} → ${mark(db, da)}<br>Ortak bölenlerin en büyüğü: ${g}` }; };
  const ekokQ = (a, b, q) => { const L = lcm(a, b), ma = [], mb = []; for (let x = a; x <= L; x += a) ma.push(x); for (let x = b; x <= L; x += b) mb.push(x);
    return { q, long: true, ans: L, hint: T('İki sayının katlarını sırayla yaz, ilk ortak olanı bul.'), exp: T`${a} → ${ma.join(', ')}<br>${b} → ${mb.join(', ')}<br>İlk ortak kat: ${L}` }; };
  les('ebob', () => [
    [T('Bölen ne demek?'), T`Bir sayıyı <b>artan bırakmadan</b> bölen sayılar onun bölenleridir.
     <div class="ex">6 → <b>1, 2, 3, 6</b><br>6 ÷ 2 = 3 ✔️ &nbsp; 6 ÷ 4 ✖️ (artan var)</div>
     <div class="tip">🐘 Hafız der ki: 1 ve sayının kendisi her zaman bölendir.</div>`],
    [T('EBOB: en büyük ortak bölen'), T`İki sayının <b>ortak</b> bölenlerinden <b>en büyüğü</b>.
     <div class="ex">4 → 1, <b>2</b>, 4<br>6 → 1, <b>2</b>, 3, 6<br>Ortak: 1 ve 2 → <b>EBOB = 2</b></div>`],
    [T('Biraz daha büyük'), T`<div class="ex">12 → 1, 2, 3, <b>4</b>, 6, 12<br>16 → 1, 2, <b>4</b>, 8, 16<br>Ortak: 1, 2, 4 → <b>EBOB = 4</b></div>
     <div class="tip">"Eşit parçalara böl, en büyük parça" → EBOB</div>`],
    [T('Kat ne demek?'), T`Bir sayının katları, o sayıyla <b>ritmik sayarak</b> bulunur:
     <div class="ex">3'ün katları: 3, 6, 9, 12, 15…<br>(3 × 1, 3 × 2, 3 × 3 …)</div>`],
    [T('EKOK: en küçük ortak kat'), T`İki sayının da katı olan <b>en küçük</b> sayı.
     <div class="ex">4 → 4, 8, <b>12</b>, 16…<br>6 → 6, <b>12</b>, 18…<br><b>EKOK = 12</b></div>
     <div class="tip">🐘 Hafız: "Tekrar ne zaman birlikte?" → EKOK</div>`],
  ]);
  wrap('ebob', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(3);
    if (chance(.5)) { const g = R(2, 5); let m, n; do { m = R(1, 3); n = R(2, 4); } while (m >= n || gcd(m, n) !== 1);
      return ebobQ(g * m, g * n, T`EBOB(${g * m}, ${g * n}) = ?`); }
    let a, b; do { a = R(2, 6); b = R(2, 6); } while (a === b || lcm(a, b) > 30);
    return ekokQ(a, b, T`EKOK(${a}, ${b}) = ?`);
  });

  // ======================================================= TAM SAYILAR
  les('tam', k => [
    [T('Sıfırın altı'), T`Deniz yüzeyi <b>0</b>. Dalga 3 metre aşağı dalarsa <b>−3</b> (eksi üç) olur.
     <div class="ex">☀️ +2 → 2 m yukarıda<br>🌊 0 → deniz yüzeyi<br>🐬 −3 → 3 m aşağıda</div>
     <div class="tip">🐬 Dalga der ki: Eksi işaretli sayılar sıfırdan küçüktür.</div>`],
    [T('Sayı doğrusu'), T`Sağa gittikçe sayılar <b>büyür</b>, sola gittikçe <b>küçülür</b>.
     <div class="ex">… −3 −2 −1 <b>0</b> 1 2 3 …</div>
     <div class="tip">3 > −1, çünkü 3 daha sağda.</div>`],
    [T('İki negatifi karşılaştır'), T`Hangisi büyük: −2 mi, −7 mi?
     <div class="ex">−2 sıfıra daha yakın, daha sağda<br>−2 > −7</div>
     <div class="tip">Borç gibi düşün: 2 lira borç, 7 lira borçtan iyidir!</div>`],
    [T('Toplama: sayı doğrusunda yürü'), k(1)],
    [T('Çıkarma & işaret kuralı'), k(2)],
  ]);
  wrap('tam', (d, old) => {
    if (d === 2) return old(1);
    if (d === 3) return old(chance(.5) ? 2 : 3);
    if (chance(.5)) { const p = chance(.75) ? -R(1, 9) : R(1, 9);
      return { q: T('🐬 Dalga hangi sayının üzerinde?'), vis: numline(p), ans: p, sub: p < 0 ? T('Eksi sayıyı yazarken − tuşuna da bas.') : '',
        hint: T('0\'dan kaç çentik uzakta? 0\'ın solundaysa sayı eksidir.'), exp: T`Dalga 0'ın ${p < 0 ? T('solunda') : T('sağında')}, ${Math.abs(p)} adım uzakta → ${sg(p)}` }; }
    const a = -R(1, 9), b = R(0, 9), mx = Math.max(a, b);
    return { q: T('Hangisi daha büyük?'), choices: [{ h: sg(a), ok: a === mx }, { h: sg(b), ok: b === mx }], fixed: true,
      hint: T('Eksi sayılar sıfırdan küçüktür. Sayı doğrusunda sağda olan büyüktür.'), exp: T`${sg(a)} sıfırın solunda, ${sg(b)} ${b ? T('sıfırın sağında') : T('tam sıfırda')}.<br>${sg(b)} > ${sg(a)}` };
  });

  // ======================================================= KESİRLERİ TANI
  les('kesir', k => [
    [T('Yarım ve çeyrek'), T`Bir bütünü <b>eş parçalara</b> böleriz.
     <div class="ex">${fbar(1, 2)}2 eş parçadan 1'i = ${F(1, 2)} (yarım)<br>${fbar(1, 4)}4 eş parçadan 1'i = ${F(1, 4)} (çeyrek)</div>
     <div class="tip">🐻 Balcı der ki: Parçalar eş olmalı, yoksa kavga çıkar!</div>`],
    [T('Pay ve payda'), k(0)],
    [T('Genişletme'), k(1)],
    [T('Sadeleştirme'), T`Payı ve paydayı <b>aynı sayıya bölersen</b> kesir değişmez:
     <div class="ex">${F(2, 4)} → ikisi de 2'ye bölünür → ${F(1, 2)}<br>${F(6, 8)} → ikisi de 2'ye bölünür → ${F(3, 4)}</div>
     <div class="tip">🐻 En sade hal: pay ile paydanın 1'den başka ortak böleni kalmayınca.</div>`],
  ]);
  wrap('kesir', (d, old) => {
    if (d !== 1) return old(d);
    const dd = R(2, 6), n = R(1, dd - 1);
    return { q: T('Boyalı kısım bütünün kaçta kaçı?'), long: true, vis: fbar(n, dd), ans: n / dd, at: F(n, dd), frac: true,
      hint: T('Önce bütün kaç eş parça, onu say (payda). Sonra boyalıları say (pay).'), exp: T`Toplam ${dd} eş parça → payda ${dd}<br>${n} parça boyalı → pay ${n}<br>Cevap: ${F(n, dd)}` };
  });

  // ======================================================= KESİR TOPLAMA
  les('kesirtopla', () => [
    [T('Aynı dilimleri topla'), T`Pizza 4 eş dilim. Önce 1 dilim, sonra 2 dilim yedin:
     <div class="ex">${fbar(3, 4)}${F(1, 4)} + ${F(2, 4)} = ${F(3, 4)}</div>
     <div class="tip">🦒 Uzun der ki: Dilimleri say! Dilimin büyüklüğü (payda) değişmez.</div>`],
    [T('Paydalar aynıysa'), T`Sadece <b>payları</b> topla ya da çıkar, payda aynı kalır:
     <div class="ex">${F(2, 7)} + ${F(3, 7)} = ${F(5, 7)}<br>${F(5, 8)} − ${F(2, 8)} = ${F(3, 8)}</div>
     <div class="tip">Paydaları ASLA toplama! ${F(1, 2)} + ${F(1, 2)} = ${F(2, 2)} = 1 (${F(2, 4)} değil!)</div>`],
    [T('Paydalar farklıysa'), T`<b>${F(1, 2)} + ${F(1, 4)}</b>: önce paydaları eşitle.
     <div class="ex">${F(1, 2)} = ${F(2, 4)} (2 ile genişlet)<br>${F(2, 4)} + ${F(1, 4)} = ${F(3, 4)}</div>`],
    [T('Ortak payda bul'), T`<div class="ex">${F(1, 3)} + ${F(1, 4)}<br>Ortak payda: 12<br>${F(4, 12)} + ${F(3, 12)} = ${F(7, 12)}</div>
     <div class="tip">Ortak payda = paydaların EKOK'u.</div>`],
  ]);
  wrap('kesirtopla', (d, old) => {
    if (d !== 1) return old(d);
    const dd = R(3, 8); let a = R(1, dd - 1), b = R(1, dd - 1);
    const sub = chance(.4) && a !== b;
    if (sub) { if (a < b) [a, b] = [b, a]; } else while (a + b > dd) { a = R(1, dd - 1); b = R(1, dd - 1); }
    const Rn = sub ? a - b : a + b, op = sub ? '−' : '+';
    return { q: `${F(a, dd)} ${op} ${F(b, dd)} = ?`, vis: sub ? fbar(a, dd) : fbar(a, dd) + fbar(b, dd), sub: T('Kesir olarak yaz (örn. 3/5).'), ans: Rn / dd, at: F(Rn, dd), frac: true,
      hint: T`Paydalar aynı (${dd}). Sadece payları ${sub ? T('çıkar') : T('topla')}: ${a} ${op} ${b}`,
      exp: T`Paydalar aynı → payları ${sub ? T('çıkar') : T('topla')}: ${a} ${op} ${b} = ${Rn}<br>Payda aynı kalır: ${F(Rn, dd)}${tail(Rn, dd)}` };
  });

  // ======================================================= KESİR ÇARPMA & BÖLME
  les('kesircarp', k => [
    [T('Tam sayı × kesir'), T`<b>3 × ${F(1, 5)}</b> demek: 3 tane ${F(1, 5)} topla.
     <div class="ex">${F(1, 5)} + ${F(1, 5)} + ${F(1, 5)} = ${F(3, 5)}${fbar(3, 5)}</div>
     <div class="tip">🐨 Uyku der ki: Tam sayı sadece <b>pay</b> ile çarpılır, payda aynı kalır.</div>`],
    [T('Kesir × kesir'), T`<b>${F(1, 2)} × ${F(1, 3)}</b>: "yarımın üçte biri"
     <div class="ex">Pay × pay: 1 × 1 = 1<br>Payda × payda: 2 × 3 = 6<br>Cevap: <b>${F(1, 6)}</b></div>`],
    [T('Biraz daha büyük'), T`<div class="ex">${F(2, 3)} × ${F(4, 5)} = ${F('2 × 4', '3 × 5')} = ${F(8, 15)}</div>`],
    [T('Bölme: ters çevir, çarp'), k(1)],
  ]);
  wrap('kesircarp', (d, old) => {
    if (d === 2) return old(chance(.4) ? 1 : 2);
    if (d === 3) return old(3);
    const k = R(2, 4), dd = R(Math.max(3, k), 9), n = R(1, Math.floor(dd / k));
    return { q: `${k} × ${F(n, dd)} = ?`, sub: T('Kesir olarak yaz. Sadeleştirmek zorunda değilsin.'), ans: k * n / dd, at: F(k * n, dd), frac: true,
      hint: T`${k} tane ${F(n, dd)} topla. Ya da sadece payı çarp: ${k} × ${n}`,
      exp: T`${Array(k).fill(F(n, dd)).join(' + ')} = ${F(k * n, dd)}<br>(Payda aynı kaldı, pay ${k} ile çarpıldı)${tail(k * n, dd)}` };
  });

  // ======================================================= ONDALIK SAYILAR
  les('ondalik', k => [
    [T('Onda bir'), T`Bir bütünü <b>10 eş parçaya</b> böl. Her parça ${F(1, 10)} = <b>0,1</b> (sıfır virgül bir).
     <div class="ex">${fbar(3, 10)}3 parça boyalı → ${F(3, 10)} = <b>0,3</b></div>
     <div class="tip">🐱 Mırnav der ki: Virgülün solu bütün, sağı parça!</div>`],
    [T('İlk örnekler'), T`<div class="ex">${F(7, 10)} → 10 parçadan 7'si → <b>0,7</b><br>0,5 = ${F(5, 10)} → yarım!<br>1,2 → 1 bütün ve ${F(2, 10)}</div>`],
    [T('Yüzde bir'), T`100 eş parça olursa virgülden sonra <b>2 basamak</b> yazılır:
     <div class="ex">${F(35, 100)} = 0,35 &nbsp; ${F(4, 100)} = 0,04</div>
     <div class="tip">Paydadaki sıfır sayısı = virgülden sonraki basamak sayısı.</div>`],
    [T('Toplama: virgülleri hizala'), k(1)],
    [T('10, 100, 1000 ile çarpma'), k(2)],
  ]);
  wrap('ondalik', (d, old) => {
    if (d === 2) return old(1);
    if (d === 3) return old(chance(.5) ? 2 : 3);
    const n = R(1, 9), v = n / 10, t = R(0, 3), sub = T('Ondalık sayıyı virgülle yaz (örn. 0,5).');
    if (t <= 1) return { q: T('Boyalı kısım ondalık olarak kaç?'), long: true, sub, vis: fbar(n, 10), ans: v,
      hint: T('Bütün 10 parça. Boyalı parçaları say, "0," yazıp yanına o sayıyı koy.'), exp: T`10 parçadan ${n} tanesi boyalı → ${F(n, 10)} = ${dec(v)}` };
    if (t === 2) return { q: `${F(n, 10)} = ?`, sub, ans: v, hint: T('Payda 10 → virgülden sonra 1 basamak.'), exp: T`${F(n, 10)} → "${n} onda bir" → ${dec(v)}` };
    return { q: `${dec(v)} = ${F('?', 10)}`, ans: n, hint: T('Virgülden sonra 1 basamak → payda 10. Virgülden sonraki rakam paya gider.'), exp: T`${dec(v)} → "${n} onda bir" → ${F(n, 10)}` };
  });

  // ======================================================= ORAN & YÜZDE
  les('yuzde', k => [
    [T('Yüzde ne demek?'), T`<b>%</b> işareti "100'de" demek. %50 → 100 parçadan 50'si → <b>yarısı</b>.
     <div class="ex">🍎🍎🍎🍎 | 🍎🍎🍎🍎<br>8 elmanın %50'si = <b>4</b></div>
     <div class="tip">🦅 Keskin der ki: %100 = hepsi, %50 = yarısı.</div>`],
    [T('%50 = yarısı'), T`<div class="ex">20'nin %50'si = 20 ÷ 2 = <b>10</b><br>60'ın %50'si = 60 ÷ 2 = <b>30</b></div>`],
    [T('%10, %25 ve %75'), T`<div class="ex">%10 → 10'a böl: 70'in %10'u = <b>7</b><br>%25 → 4'e böl: 80'in %25'i = <b>20</b><br>%75 → 4'e böl, 3 ile çarp: 80'in %75'i = <b>60</b></div>`],
    [T('Oran = parçalar'), k(1)],
    [T('İndirim'), k(2)],
  ]);
  wrap('yuzde', (d, old) => {
    if (d === 2) return old(1);
    if (d === 3) return old(chance(.5) ? 2 : 3);
    if (chance(.5)) { const b = 2 * R(2, 20);
      return { q: T`${b} sayısının %50'si kaçtır?`, long: true, ans: b / 2, hint: T`%50 = yarısı. ${b} sayısını 2'ye böl.`, exp: T`%50 = ${F(50, 100)} = ${F(1, 2)} → yarısı<br>${b} ÷ 2 = ${b / 2}` }; }
    const b = 10 * R(1, 10);
    return { q: T`${b} sayısının %10'u kaçtır?`, long: true, ans: b / 10, hint: T`%10 = ${F(1, 10)}. ${b} sayısını 10'a böl.`, exp: T`%10 = ${F(10, 100)} = ${F(1, 10)}<br>${b} ÷ 10 = ${b / 10}` };
  });

  // ======================================================= CEBİR & DENKLEM
  les('cebir', k => [
    [T('Harf = saklı sayı'), T`${X} bir <b>kutu</b> gibidir, içinde bir sayı saklıdır.
     <div class="ex">📦 ${X} = 4 ise<br>${X} + 1 = 4 + 1 = <b>5</b></div>
     <div class="tip">🦎 Renk der ki: Harfin yerine sayıyı koy, sonra hesapla!</div>`],
    [T('3x ne demek?'), T`3${X} demek <b>3 × ${X}</b> demek (3 tane ${X}).
     <div class="ex">${X} = 2 ise<br>3${X} = 3 × 2 = <b>6</b></div>`],
    [T('İki adım'), T`<div class="ex">3${X} + 2 ifadesinde ${X} = 4 ise<br>3 × 4 = 12<br>12 + 2 = <b>14</b></div>`],
    [T('Denklem = terazi ⚖️'), k(1)],
    [T('İki adımlı denklem'), k(2)],
  ]);
  wrap('cebir', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(3);
    if (chance(.5)) { const x = R(1, 10), b = R(1, 9), minus = chance(.3) && x > b, v = minus ? x - b : x + b, op = minus ? '−' : '+';
      return { q: `${X} = ${x} iken<br>${X} ${op} ${b} = ?`, ans: v, hint: T`${X} yerine ${x} koy: ${x} ${op} ${b}`, exp: `${x} ${op} ${b} = ${v}` }; }
    const a = R(2, 5), x = R(1, 6);
    return { q: `${X} = ${x} iken<br>${a}${X} = ?`, ans: a * x, hint: T`${a}${X} demek ${a} × ${X}. ${X} yerine ${x} koy.`, exp: `${a}${X} = ${a} × ${x} = ${a * x}` };
  });

  // ======================================================= ÇEVRE & ALAN
  les('alan', k => [
    [T('Çevre = etrafını dolaşmak'), T`Fındık bir karenin etrafında koşuyor. Her kenar 2 cm:
     <div class="ex">2 + 2 + 2 + 2 = <b>8 cm</b><br>Koştuğu yol = <b>çevre</b></div>
     <div class="tip">🐿️ Fındık der ki: Bütün kenarları topla!</div>`],
    [T('Dikdörtgenin çevresi'), T`<div class="ex">Kenarlar 5 cm ve 3 cm<br>5 + 3 + 5 + 3 = <b>16 cm</b><br>Kısa yol: 2 × (5 + 3) = 16</div>`],
    [T('Alan = içini kaplamak'), T`İçine kaç tane 1 cm²'lik kare sığar? Say!
     <div class="vis">${rectSVG(3, 2, true)}</div>
     <div class="ex">3 + 3 = 6 kare → <b>6 cm²</b></div>`],
    [T('Alanın kısa yolu'), T`Kareleri tek tek saymak yerine <b>kenarları çarp</b>:
     <div class="vis">${rectSVG(5, 3, true)}</div>
     <div class="ex">5 × 3 = <b>15 cm²</b></div>`],
    [T('Üçgenin alanı'), k(2)],
  ]);
  wrap('alan', (d, old) => {
    if (d !== 1) return old(d);
    if (chance(.3)) { const a = R(2, 8); return { q: T('Karenin çevresi kaç cm?'), vis: rectSVG(a, a), ans: 4 * a, hint: T('Karenin 4 kenarı da eşittir. Dördünü topla.'), exp: `${a} + ${a} + ${a} + ${a} = ${4 * a} cm` }; }
    let w, h; do { w = R(3, 9); h = R(2, 6); } while (w === h);
    return { q: T('Dikdörtgenin çevresi kaç cm?'), vis: rectSVG(w, h), ans: 2 * (w + h), hint: T`Dört kenarı da topla: ${w} + ${h} + ${w} + ${h}`, exp: T`${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm<br>(Kısa yol: 2 × (${w} + ${h}) = ${2 * (w + h)})` };
  });

  // ======================================================= 7. SINIF
  les('tamcarp', k => [
    [T('Negatif sayıyı tekrar topla'), T`<b>3 × (−2)</b> demek: 3 kez −2.
     <div class="ex">(−2) + (−2) + (−2) = <b>−6</b><br>🐊 3 kez 2 basamak aşağı indi → −6</div>
     <div class="tip">🐊 Dişli der ki: Pozitif × negatif = negatif!</div>`],
    [T('İşaret kuralı'), k(0)],
    [T('Bölmede de aynı'), T`<div class="ex">(−12) ÷ 3 = <b>−4</b> (farklı işaret → −)<br>(−12) ÷ (−3) = <b>4</b> (aynı işaret → +)</div>
     <div class="tip">Kontrol et: 3 × (−4) = −12 ✔️</div>`],
    [T('Negatif sayıların kuvveti'), k(1)],
  ]);
  wrap('tamcarp', (d, old) => {
    if (d === 2) return old(1);
    if (d === 3) return old(chance(.5) ? 2 : 3);
    const a = -R(1, 5), b = R(2, 4), first = chance(.5);
    return { q: first ? `${b} × ${pn(a)} = ?` : `${pn(a)} × ${b} = ?`, ans: a * b, sub: T('Eksi sonucu yazarken − tuşuna da bas.'),
      hint: T`${b} kez ${pn(a)} topla. Ya da önce ${-a} × ${b} çarp, sonra işarete karar ver.`,
      exp: T`${Array(b).fill(pn(a)).join(' + ')} = ${sg(a * b)}<br>${-a} × ${b} = ${-a * b}, işaretler farklı → −<br>Cevap: ${sg(a * b)}` };
  });

  les('rasyonel', k => [
    [T('Rasyonel sayı nedir?'), T`Kesir şeklinde yazılabilen her sayı rasyoneldir.
     <div class="ex">${F(1, 2)}, &nbsp; −${F(3, 4)}, &nbsp; 7 = ${F(7, 1)}, &nbsp; 0,5 = ${F(1, 2)}</div>
     <div class="tip">🦜 Pırpır der ki: Eksi kesirler sıfırın <b>solunda</b>, artı kesirler sağında durur.</div>`],
    [T('Ondalık → kesir'), T`<div class="ex">0,5 = ${F(5, 10)} = ${F(1, 2)}<br>0,2 = ${F(2, 10)} = ${F(1, 5)}</div>
     <div class="tip">Virgülden sonra 1 basamak → payda 10. Sonra sadeleştir.</div>`],
    [T('Biraz daha büyük'), T`<div class="ex">0,35 = ${F(35, 100)} = ${F(7, 20)}<br>0,75 = ${F(75, 100)} = ${F(3, 4)}</div>
     <div class="tip">Virgülden sonra 2 basamak → payda 100.</div>`],
    [T('İşaretli kesirlerle işlem'), k(2)],
  ]);
  wrap('rasyonel', (d, old) => {
    if (d === 2) return old(1);
    if (d === 3) return old(chance(.5) ? 2 : 3);
    const t = R(0, 2);
    if (t === 0) { const b = R(2, 9), a = R(1, b - 1), e = R(2, 9), c = R(1, e - 1), neg = `−${F(a, b)}`, pos = F(c, e);
      return { q: T('Hangisi daha büyük?'), choices: [{ h: neg, ok: false }, { h: pos, ok: true }], fixed: true,
        hint: T('Eksi sayılar sıfırdan küçük, artı sayılar sıfırdan büyüktür.'), exp: T`${neg} sıfırın solunda, ${pos} sıfırın sağında.<br>${pos} > ${neg}` }; }
    if (t === 1) { const n = R(1, 9), v = n / 10; return { q: `${dec(v)} = ${F('?', 10)}`, ans: n, hint: T('Virgülden sonra 1 basamak → payda 10.'), exp: T`${dec(v)} = ${F(n, 10)}` }; }
    const dd = pick([2, 5, 10]), n = R(1, dd - 1), m = 10 / dd;
    return { q: `${F(n, dd)} = ?`, sub: T('Ondalık olarak yaz (örn. 0,5)'), ans: n / dd, hint: dd === 10 ? T('Payda 10 → virgülden sonra 1 basamak.') : T`Paydayı 10 yap: ${dd} × ${m} = 10. Payı da ${m} ile çarp.`,
      exp: dd === 10 ? `${F(n, 10)} = ${dec(n / 10)}` : `${F(n, dd)} = ${F(n * m, 10)} = ${dec(n / dd)}` };
  });

  les('cebir7', k => [
    [T('Terim ve katsayı'), T`5${X} demek <b>5 tane ${X}</b>.
     <div class="ex">5${X} → katsayı <b>5</b><br>5${X} − 3 → −3 sabit terim (harfsiz)</div>
     <div class="tip">🐙 Sekiz der ki: ${X} = 🐙 diye düşün. 5${X} = 🐙🐙🐙🐙🐙</div>`],
    [T('Benzer terimleri topla'), T`<div class="ex">2${X} + 3${X} = <b>5${X}</b><br>🐙🐙 + 🐙🐙🐙 = 🐙🐙🐙🐙🐙</div>`],
    [T('Biraz daha büyük'), T`Sadece <b>aynı harfli</b> terimler toplanır:
     <div class="ex">4${X} + 7 + 2${X} − 3<br>= (4 + 2)${X} + (7 − 3)<br>= <b>6${X} + 4</b></div>
     <div class="tip">3${X} + 2 ≠ 5${X}. Ahtapotla balık toplanmaz!</div>`],
    [T('Dağılma özelliği'), k(2)],
  ]);
  wrap('cebir7', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(3);
    const a = R(1, 6), b = R(1, 6), minus = chance(.3) && a > b, v = minus ? a - b : a + b, op = minus ? '−' : '+';
    return { q: `${cx(a, X)} ${op} ${cx(b, X)} = ?${X}`, ans: v, hint: T`Katsayıları ${minus ? T('çıkar') : T('topla')}: ${a} ${op} ${b}. ${X} aynen kalır.`,
      exp: `(${a} ${op} ${b})${X} = ${cx(v, X)}<br>${'🐙'.repeat(a)} ${op} ${'🐙'.repeat(b)}` };
  });

  les('denklem7', k => [
    [T('Denklem = terazi ⚖️'), T`İki taraf eşit. Bir tarafa ne yaparsan öbür tarafa da yap!
     <div class="ex">${X} + 3 = 5<br>İki taraftan 3 çıkar → ${X} = <b>2</b></div>
     <div class="tip">🐼 Bambu der ki: Sağlama yap: 2 + 3 = 5 ✔️</div>`],
    [T('Çarpılmış x'), T`<div class="ex">4${X} = 20<br>İki tarafı 4'e böl → ${X} = <b>5</b></div>
     <div class="tip">Sağlama: 4 × 5 = 20 ✔️</div>`],
    [T('Parantezli denklem'), k(0)],
    [T('x her iki tarafta'), k(1)],
    [T('Problemden denkleme'), k(2)],
  ]);
  wrap('denklem7', (d, old) => {
    if (d === 3) return old(chance(.5) ? 2 : 3);
    const sub = T`${X} kaçtır?`;
    if (d === 2) { if (chance(.5)) return old(1);
      const a = R(2, 5), x = R(1, 10), b = R(1, 10), c = a * x + b;
      return { q: `${a}${X} + ${b} = ${c}`, sub, ans: x, hint: T`Önce iki taraftan ${b} çıkar, sonra ${a} ile böl.`, exp: T`1) İki taraftan ${b} çıkar: ${a}${X} = ${a * x}<br>2) İki tarafı ${a} ile böl: ${X} = ${x}<br>Sağlama: ${a} × ${x} + ${b} = ${c} ✔️` }; }
    const x = R(1, 10), t = R(0, 2);
    if (t === 0) { const a = R(1, 9); return { q: `${X} + ${a} = ${x + a}`, sub, ans: x, hint: T`İki taraftan ${a} çıkar.`, exp: T`${X} = ${x + a} − ${a} = ${x}<br>Sağlama: ${x} + ${a} = ${x + a} ✔️` }; }
    if (t === 1) { const a = R(1, 9); return { q: `${X} − ${a} = ${x}`, sub, ans: x + a, hint: T`İki tarafa ${a} ekle.`, exp: T`${X} = ${x} + ${a} = ${x + a}<br>Sağlama: ${x + a} − ${a} = ${x} ✔️` }; }
    const a = R(2, 5); return { q: `${a}${X} = ${a * x}`, sub, ans: x, hint: T`İki tarafı ${a} ile böl.`, exp: T`${X} = ${a * x} ÷ ${a} = ${x}<br>Sağlama: ${a} × ${x} = ${a * x} ✔️` };
  });

  les('oranti', k => [
    [T('Oran = karşılaştırma'), T`<div class="ex">🍎🍎 &nbsp; 🍐🍐🍐<br>Elmaların armutlara oranı: ${F(2, 3)}<br>"Her 2 elmaya 3 armut"</div>
     <div class="tip">🐝 Vızvız der ki: Oran, iki miktarı bölme ile karşılaştırır.</div>`],
    [T('Doğru orantı'), T`Biri artınca diğeri de <b>aynı oranda artar</b>.
     <div class="ex">1 kg bal 10 TL<br>3 kg bal = 3 × 10 = <b>30 TL</b></div>`],
    [T('Önce 1 tanesini bul'), T`<div class="ex">3 kg bal 45 TL<br>1 kg = 45 ÷ 3 = 15 TL<br>5 kg = 5 × 15 = <b>75 TL</b></div>`],
    [T('Orantı: çapraz çarp'), k(0)],
    [T('Ters orantı'), k(2)],
  ]);
  wrap('oranti', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(chance(.6) ? 3 : 2);
    if (chance(.6)) { const it = pick([T('kalem ✏️'), T('kg bal 🍯'), T('paket yem'), T('dondurma 🍦')]), u = R(2, 10), n = R(2, 6);
      return { q: T`1 ${it} ${u} TL ise ${n} ${it} kaç TL?`, long: true, ans: u * n, hint: T`${n} tane ${u} TL: ${n} × ${u}`, exp: T`1 tanesi ${u} TL<br>${n} tanesi: ${n} × ${u} = ${u * n} TL` }; }
    let a, b; do { b = R(2, 5); a = R(1, b - 1); } while (gcd(a, b) !== 1); const m = R(2, 3);
    return { q: `${F(a, b)} = ${F(X, b * m)}`, sub: T`${X} kaçtır?`, ans: a * m, hint: T`Payda ${b} iken ${b * m} oldu: ${m} katı. Payı da ${m} ile çarp.`, exp: `${b} × ${m} = ${b * m}<br>${X} = ${a} × ${m} = ${a * m}` };
  });

  les('aci', k => [
    [T('Açı nedir?'), T`İki çizginin arasındaki açıklığa <b>açı</b> denir. Derece (°) ile ölçülür.
     <div class="ex">Kare köşesi ⌞ → <b>dik açı</b> = 90°<br>Düz çizgi ⎯ → <b>doğru açı</b> = 180°</div>
     <div class="tip">🦩 Pembe der ki: Tam bir tur 360°!</div>`],
    [T('Tümler açılar'), T`Toplamı <b>90°</b> olan iki açı.
     <div class="ex">30° + ? = 90°<br>? = 90 − 30 = <b>60°</b></div>`],
    [T('Bütünler açılar'), T`Toplamı <b>180°</b> olan iki açı.
     <div class="ex">70° + ? = 180°<br>? = 180 − 70 = <b>110°</b></div>
     <div class="tip">"Tüm-90, Bütün-180" diye ezberle!</div>`],
    [T('Üçgen ve dörtgen'), k(1)],
    [T('Çokgenler'), k(2)],
  ]);
  wrap('aci', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(3);
    if (chance(.5)) { const a = 10 * R(1, 8); return { q: T`${a}° açının tümleri kaç derecedir?`, long: true, ans: 90 - a, hint: T`Tümler → toplam 90°. 90 − ${a}`, exp: `${a}° + ? = 90°<br>90 − ${a} = ${90 - a}°` }; }
    const a = 10 * R(1, 17); return { q: T`${a}° açının bütünleri kaç derecedir?`, long: true, ans: 180 - a, hint: T`Bütünler → toplam 180°. 180 − ${a}`, exp: `${a}° + ? = 180°<br>180 − ${a} = ${180 - a}°` };
  });

  les('cember', k => [
    [T('Yarıçap ve çap'), T`Çemberin tam ortasına <b>merkez</b> denir.
     <div class="ex">Merkezden kenara → <b>yarıçap (r)</b><br>Merkezden geçip kenardan kenara → <b>çap</b><br>r = 3 ise çap = 2 × 3 = <b>6</b></div>
     <div class="tip">🐳 Mavi der ki: Çap, iki yarıçap boyundadır.</div>`],
    [T('Çemberin çevresi'), T`Çevre, çapın yaklaşık <b>3 katıdır</b>. Bu sayıya π (pi) denir.
     <div class="ex">Çevre = 2 × π × r<br>π = 3, r = 5 → 2 × 3 × 5 = <b>30</b></div>`],
    [T('Dairenin alanı'), k(2)],
  ]);
  wrap('cember', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(3);
    const r = R(1, 10);
    if (chance(.5)) return { q: T`Yarıçapı ${r} cm olan çemberin çapı kaç cm?`, long: true, ans: 2 * r, hint: T('Çap = 2 yarıçap. 2 ile çarp.'), exp: `2 × ${r} = ${2 * r} cm` };
    return { q: T`Çapı ${2 * r} cm olan çemberin yarıçapı kaç cm?`, long: true, ans: r, hint: T('Yarıçap, çapın yarısıdır. 2\'ye böl.'), exp: `${2 * r} ÷ 2 = ${r} cm` };
  });

  les('veri', k => [
    [T('Ortalama = eşit paylaştırma'), T`<div class="ex">🍎🍎🍎🍎 ve 🍎🍎<br>Toplam 6 elma, 2 kişi<br>6 ÷ 2 = <b>3</b> → ortalama 3</div>
     <div class="tip">🦘 Zıpzıp der ki: Herkese eşit dağıtsak kişi başı kaç düşer? İşte ortalama!</div>`],
    [T('Aritmetik ortalama'), k(0)],
    [T('Ortanca (medyan)'), k(1)],
    [T('Tepe değer & açıklık'), k(2)],
  ]);
  wrap('veri', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(3);
    let arr, m;
    if (chance(.5)) { let a, b; do { a = R(1, 20); b = R(1, 20); } while (a === b || (a + b) % 2); arr = [a, b]; m = (a + b) / 2; }
    else { let a, b, c; m = R(2, 10); do { a = R(1, 15); b = R(1, 15); c = 3 * m - a - b; } while (c < 1 || c > 20); arr = [a, b, c]; }
    const s = arr.reduce((x, y) => x + y, 0);
    return { q: arr.join(', '), sub: T('Bu sayıların aritmetik ortalaması kaçtır?'), ans: m, hint: T`Önce hepsini topla, sonra ${arr.length}'${arr.length === 2 ? T('ye') : T('e')} böl.`, exp: T`Toplam: ${arr.join(' + ')} = ${s}<br>${arr.length} sayı var: ${s} ÷ ${arr.length} = ${m}` };
  });

  // ======================================================= 8. SINIF
  les('us8', k => [
    [T('Hatırla: üs'), T`<div class="ex">${P(2, 3)} = 2 × 2 × 2 = 8<br>${P(10, 3)} = 1000 (üs kadar sıfır)<br>${P(5, 0)} = 1</div>
     <div class="tip">🦖 Rex der ki: Taban, üs kadar kendisiyle çarpılır.</div>`],
    [T('Negatif üs nereden gelir?'), T`Üs 1 azalınca sonuç <b>yarıya</b> iner:
     <div class="ex">${P(2, 2)} = 4 → ${P(2, 1)} = 2 → ${P(2, 0)} = 1<br>→ ${P(2, '−1')} = ${F(1, 2)} → ${P(2, '−2')} = ${F(1, 4)}</div>`],
    [T('Negatif üs = ters çevir'), T`<div class="ex">${P(5, '−1')} = ${F(1, 5)}<br>${P(2, '−3')} = ${F(1, P(2, 3))} = ${F(1, 8)}<br>${P(F(2, 3), '−1')} = ${F(3, 2)}</div>`],
    [T('Üs kuralları'), k(1)],
    [T('Bilimsel gösterim'), k(2)],
  ]);
  wrap('us8', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(3);
    const t = R(0, 9);
    if (t < 4) { const b = R(2, 9); return { q: `${P(b, '−1')} = ?`, sub: T('Kesir olarak yaz (örn. 1/8)'), ans: 1 / b, at: F(1, b), frac: true, hint: T`Negatif üs: ters çevir. ${b} sayısının tersi ${F(1, b)}.`, exp: `${P(b, '−1')} = ${F(1, P(b, 1))} = ${F(1, b)}` }; }
    if (t < 7) { const n = R(2, 5); return { q: `${P(10, n)} = ?`, ans: 10 ** n, hint: T('10\'un kuvvetinde üs kadar sıfır yazılır.'), exp: T`1 ve yanına ${n} tane sıfır → ${10 ** n}` }; }
    const a = R(2, 30), n = pick([0, 1]);
    return { q: `${P(a, n)} = ?`, ans: a ** n, hint: n ? T('Bir sayının 1. kuvveti kendisidir.') : T('Bir sayının 0. kuvveti her zaman 1!'), exp: n ? `${P(a, 1)} = ${a}` : powStep(a, 0) };
  });

  les('karekok', k => [
    [T('Kare ve karekök'), T`Kenarı 3 olan kare: 3 × 3 = <b>9</b> küçük kare.
     <div class="ex">🟩🟩🟩<br>🟩🟩🟩<br>🟩🟩🟩<br>${SQ(9)} = 3 (kenar uzunluğu)</div>
     <div class="tip">🦔 Diken der ki: Karekök, karenin kenarını bulur.</div>`],
    [T('İlk örnekler'), T`<div class="ex">${SQ(4)} = 2 çünkü 2 × 2 = 4<br>${SQ(25)} = 5 çünkü 5 × 5 = 25</div>`],
    [T('Tam kareler'), T`<div class="ex">1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144</div>
     <div class="tip">${SQ(49)} = 7 çünkü 7 × 7 = 49</div>`],
    [T('Hangi iki sayı arasında?'), k(1)],
    [T('a√b şekli ve işlemler'), k(2)],
  ]);
  wrap('karekok', (d, old) => {
    if (d === 2) return old(1);
    if (d === 3) return old(chance(.5) ? 2 : 3);
    const n = chance(.15) ? 10 : R(1, 6);
    if (chance(.3)) return { q: `${n}² = ?`, ans: n * n, hint: T`${n} sayısını kendisiyle çarp: ${n} × ${n}`, exp: `${n} × ${n} = ${n * n}` };
    return { q: `${SQ(n * n)} = ?`, ans: n, hint: T`Hangi sayıyı kendisiyle çarparsan ${n * n} olur?`, exp: `${n} × ${n} = ${n * n} → ${SQ(n * n)} = ${n}` };
  });

  les('olasilik', k => [
    [T('Şans ne kadar?'), T`Torbada 1 🔴 ve 1 🔵 top var. Bakmadan bir top çek.
     <div class="ex">2 top var, 1 tanesi kırmızı<br>Kırmızı gelme olasılığı = <b>${F(1, 2)}</b></div>
     <div class="tip">🐹 Pofuduk der ki: Önce TÜM topları say, sonra istediklerini!</div>`],
    [T('Olasılık formülü'), T`<div class="ex">Olasılık = İstenen ÷ Tümü<br>3 🔴 ve 5 🔵 → toplam 8 top<br>Kırmızı olasılığı = ${F(3, 8)}</div>`],
    [T('0 ile 1 arası'), T`<div class="ex">İmkansız olay → <b>0</b> (zarda 7 gelmesi)<br>Kesin olay → <b>1</b> (zarda 7'den küçük gelmesi)</div>`],
    [T('Zar ve kartlar'), k(2)],
  ]);
  wrap('olasilik', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(3);
    const r = R(1, 4), b = R(1, 4), tot = r + b, red = chance(.5), n = red ? r : b, nm = red ? T('kırmızı') : T('mavi');
    return { q: T`Torbada ${r} kırmızı, ${b} mavi top var. Çekilen topun ${nm} olma olasılığı?`, long: true, sub: T('Kesir olarak yaz. Sadeleştirmen gerekmez.'), frac: true,
      vis: big('🔴'.repeat(r) + '🔵'.repeat(b)), ans: n / tot, at: fracText(n, tot), hint: T`Toplam kaç top var? Kaçı ${nm}?`, exp: T`Toplam: ${r} + ${b} = ${tot} top<br>${nm}: ${n}<br>Olasılık = ${F(n, tot)}` };
  });

  les('ozdeslik', k => [
    [T('Kare = alan'), T`(${X} + 3)² → kenarı ${X} + 3 olan karenin alanı. 4 parçaya ayır:
     <div class="ex">${X} · ${X} = ${X}²<br>${X} · 3 = 3${X} (iki tane)<br>3 · 3 = 9<br>Toplam: ${X}² + 6${X} + 9</div>`],
    [T('İlk örnek'), T`<div class="ex">(${X} + 1)² = (${X} + 1)(${X} + 1)<br>= ${X}² + ${X} + ${X} + 1<br>= <b>${X}² + 2${X} + 1</b></div>`],
    [T('Kural'), T`<div class="ex">(a + b)² = a² + <b>2ab</b> + b²</div>
     <div class="tip">🐺 Boz der ki: Ortadaki "2ab" terimini unutma! (${X} + 3)² ≠ ${X}² + 9</div>`],
    [T('Fark ve iki kare farkı'), k(1)],
    [T('Ortak çarpan & hızlı hesap'), k(2)],
  ]);
  wrap('ozdeslik', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(3);
    const a = R(1, 5), askX = chance(.5), what = askX ? X + T(' teriminin katsayısı') : T('sabit terim');
    if (chance(.5)) return { q: T`(${X} + ${a})² açılımında ${what} kaçtır?`, long: true, ans: askX ? 2 * a : a * a,
      hint: askX ? T`Ortadaki terim 2 · ${X} · ${a}` : T`Sabit terim, ${a} sayısının karesi: ${a} · ${a}`, exp: `(${X} + ${a})² = ${X}² + ${cx(2 * a, X)} + ${a * a}` };
    const b = R(1, 5);
    return { q: T`(${X} + ${a})(${X} + ${b}) çarpımında ${what} kaçtır?`, long: true, ans: askX ? a + b : a * b,
      hint: askX ? T`${X}'li terimler: ${b}${X} ve ${a}${X}. Topla.` : T`Sabit terim: ${a} · ${b}`, exp: `${X}·${X} + ${cx(b, X)} + ${cx(a, X)} + ${a * b}<br>= ${X}² + ${cx(a + b, X)} + ${a * b}` };
  });

  les('dogru', k => [
    [T('Sayı makinesi'), T`y = 2${X}: makineye ${X} girer, 2 katı çıkar.
     <div class="ex">${X} = 1 → y = 2<br>${X} = 2 → y = 4<br>${X} = 3 → y = 6</div>
     <div class="tip">🐆 Hızlı der ki: ${X} yerine sayıyı koy, y'yi hesapla!</div>`],
    [T('Doğru denklemi'), k(0)],
    [T('Eğim'), k(1)],
    [T('Eksenleri kestiği noktalar'), k(2)],
  ]);
  wrap('dogru', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(3);
    const m = R(1, 3), n = R(0, 6), x = R(0, 5), y = m * x + n;
    return { q: `y = ${cx(m, X)}${n ? ' + ' + n : ''}`, sub: T`${X} = ${x} iken y kaçtır?`, ans: y, hint: T`${X} yerine ${x} koy.`,
      exp: `y = ${m} · ${x}${n ? ' + ' + n : ''} = ${m * x}${n ? ' + ' + n + ' = ' + y : ''}` };
  });

  les('esitsizlik', k => [
    [T('Büyük mü küçük mü?'), T`<div class="ex">7 &gt; 4 → "7, 4'ten büyüktür"<br>2 &lt; 9 → "2, 9'dan küçüktür"</div>
     <div class="tip">🐜 Çalışkan der ki: Ağzı açık taraf hep <b>büyük</b> sayıya bakar!</div>`],
    [T('x &lt; 4 ne demek?'), T`${X}, 4'ten küçük her sayı olabilir.
     <div class="ex">${X} &lt; 4 → 3, 2, 1, 0 … olabilir<br>En büyük tam sayı: <b>3</b> (4 dahil değil)</div>`],
    [T('Eşit de olabilir: ≤ ve ≥'), T`<div class="ex">${X} ≤ 4 → 4 de dahil! En büyük: <b>4</b><br>−2 &lt; ${X} ≤ 3 → −1, 0, 1, 2, 3</div>
     <div class="tip">Sayı doğrusunda: &lt; ve &gt; için boş ○, ≤ ve ≥ için dolu ● daire.</div>`],
    [T('Çözme'), k(1)],
    [T('Negatifle çarpma/bölme'), k(2)],
  ]);
  wrap('esitsizlik', (d, old) => {
    if (d === 2) return old(1);
    if (d === 3) return old(chance(.5) ? 2 : 3);
    if (chance(.5)) { let a, b; do { a = R(1, 20); b = R(1, 20); } while (a === b); const gt = a > b;
      return { q: `${a} ▢ ${b}`, sub: T('Kutuya hangi işaret gelir?'), choices: [{ h: '&lt;', ok: !gt }, { h: '&gt;', ok: gt }], fixed: true,
        hint: T('Ağzı açık taraf büyük sayıya bakar.'), exp: T`${Math.max(a, b)} daha büyük → ağız ona açılır<br>${a} ${gt ? '&gt;' : '&lt;'} ${b}` }; }
    const n = R(2, 12), le = chance(.5), ans = le ? n : n - 1;
    return { q: `${X} ${le ? '≤' : '&lt;'} ${n}`, sub: T`Bu eşitsizliği sağlayan en büyük tam sayı ${X}?`, ans,
      hint: le ? T`≤ işareti: ${n} de dahil!` : T`&lt; işareti: ${n} dahil değil. ${n} sayısından küçük en büyük tam sayı?`,
      exp: le ? T`${X} ≤ ${n} → ${n} dahil<br>En büyük: ${n}` : T`${X} &lt; ${n} → ${n} dahil değil<br>${n - 1}, ${n - 2}, … → en büyük: ${n - 1}` };
  });

  les('ucgen', k => [
    [T('Üçgenin açıları'), T`Her üçgenin 3 açısı vardır. Toplamları hep <b>180°</b>.
     <div class="ex">Eşkenar üçgen:<br>60° + 60° + 60° = 180°</div>
     <div class="tip">🐫 Hörgüç der ki: Üçgen küçük de olsa büyük de olsa toplam 180°!</div>`],
    [T('Eksik açıyı bul'), T`<div class="ex">90° + 50° + ? = 180°<br>90 + 50 = 140<br>? = 180 − 140 = <b>40°</b></div>`],
    [T('Dış açı & ikizkenar'), T`<div class="ex">Dış açı = komşu olmayan iki iç açının toplamı<br>İkizkenar üçgende taban açıları eşittir</div>`],
    [T('Üçgen eşitsizliği'), k(1)],
    [T('Pisagor bağıntısı'), k(2)],
  ]);
  wrap('ucgen', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(3);
    let a, b; do { a = 10 * R(2, 10); b = 10 * R(2, 10); } while (a + b > 160);
    return { q: T`Bir üçgenin iki açısı ${a}° ve ${b}°. Üçüncü açı kaç derece?`, long: true, ans: 180 - a - b,
      hint: T`Üç açının toplamı 180°. Önce ${a} + ${b} topla.`, exp: `${a} + ${b} = ${a + b}<br>180 − ${a + b} = ${180 - a - b}°` };
  });

  les('cisim', k => [
    [T('Hacim = küp say'), T`Hacim, içine kaç tane küçük küp sığdığıdır.
     <div class="ex">🧊🧊<br>🧊🧊 → bir katta 4 küp<br>2 kat → 4 + 4 = <b>8 küp</b></div>
     <div class="tip">🦭 Buzlu der ki: Bir kattaki küpleri say, kat sayısıyla çarp!</div>`],
    [T('Dikdörtgenler prizması'), T`<div class="ex">Hacim = en × boy × yükseklik<br>3 × 2 × 4 = <b>24 cm³</b><br>Küp: hacim = a × a × a</div>`],
    [T('Yüzey alanı'), k(1)],
    [T('Silindir'), k(2)],
  ]);
  wrap('cisim', (d, old) => {
    if (d === 2) return old(chance(.5) ? 1 : 2);
    if (d === 3) return old(3);
    const a = R(2, 4), b = R(1, 3), c = R(1, 3);
    return { q: T`🧊 Bir kutunun tabanına ${a} sıra küp diziliyor, her sırada ${b} küp var. Kutu ${c} kat. Kaç küp sığar?`, long: true, ans: a * b * c,
      hint: T`Bir katta ${a} × ${b} küp var. Sonra kat sayısıyla çarp.`, exp: T`Bir kat: ${a} × ${b} = ${a * b} küp<br>${c} kat: ${a * b} × ${c} = ${a * b * c} küp` };
  });
})();
