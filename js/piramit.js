'use strict';
/* =========================================================
   TAŞ TAŞ MATEMATİK — piramit yöntemi
   Matematik konulardan değil, küçük "taş"lardan örülür. Her taş tek bir fikirdir ve
   altındaki taşlara dayanır. Her taş dört adımda kurulur:
     1) Tahmin  — öğretmen göstermeden önce çocuğa sorar (merak boşluğu)
     2) Çiz     — öğretmen tahtaya modeli çizer, arada çocuğa küçük sorular sorar
     3) Yaz     — sembolle alıştırma; hata dedektifi yanlışın türünü bulur, çatlak taşa iner
     4) Hızlan  — kısa akıcılık turu
   Kurulan taş 1-3-7 gün arayla tekrar edilir; üç kez sağlam geçerse "altın taş" olur.
   Öğretmenin konuşması ezber değildir: o anki sayılardan, çocuğun hatasından ve
   hızından parça parça üretilir.  (gelisim.js'ten sonra yüklenir; şimdilik Türkçe sayfada)
   ========================================================= */
(function () {
  if (LANG !== 'tr') return; // çeviri tamamlanınca diğer dillerde de açılacak

  // ---------------------------------------------------------------- yardımcılar
  const DAY = 864e5, now = () => Date.now();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const nm = () => { const n = (S.name || '').trim(); return n && n !== 'Kaşif' ? n : ''; };
  const P = () => (S.pyr = S.pyr || {});
  const st = id => (P()[id] = P()[id] || { lvl: 0, rev: 0, due: 0, crack: 0, fast: 0, seen: 0, right: 0 });
  // lvl: 0 yeni · 1 tahmin · 2 çizildi · 3 kuruldu (yazma geçti) · 4 sağlam (3 tekrar)
  function award(xp, q, c) {
    S.xp = (S.xp || 0) + xp;
    const w = Math.floor((now() / DAY + 3) / 7); if (!S.wk || S.wk.id !== w) S.wk = { id: w, xp: 0 }; S.wk.xp += xp;
    const k = today(); S.hist = S.hist || {}; const h = S.hist[k] || (S.hist[k] = { x: 0, q: 0, c: 0 }); h.x += xp; h.q += q; h.c += c;
    markDay(); save(); topbar();
  }

  // Sayılara doğru Türkçe ek: ünlü uyumu + sertleşme (15'ten, 6'yı, 40'ın, 80'e …)
  function sx(n, k) {
    n = Math.abs(n);
    const O = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'], T10 = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
    const w = n === 0 ? 'sıfır' : n % 10 ? O[n % 10] : n % 100 ? T10[(n / 10) % 10] : n % 1000 ? 'yüz' : 'bin';
    const v = (w.match(/[aeıioöuü]/g) || ['e']).pop(), front = 'eiöü'.includes(v), endV = /[aeıioöuü]$/.test(w), hard = /[fsthşçkp]$/.test(w);
    const i4 = { a: 'ı', ı: 'ı', e: 'i', i: 'i', o: 'u', u: 'u', ö: 'ü', ü: 'ü' }[v], e2 = front ? 'e' : 'a';
    const r = { abl: (hard ? 't' : 'd') + e2 + 'n', loc: (hard ? 't' : 'd') + e2, acc: (endV ? 'y' : '') + i4, gen: (endV ? 'n' : '') + i4 + 'n', dat: (endV ? 'y' : '') + e2 }[k];
    return `${n}'${r}`;
  }

  // ---------------------------------------------------------------- canlı öğretmen sesi
  let voice = null;
  const pickV = () => { try { const vs = speechSynthesis.getVoices().filter(v => /^tr/i.test(v.lang)); const sc = v => (/natural|neural|online/i.test(v.name) ? 8 : 0) + (/google/i.test(v.name) ? 4 : 0); voice = vs.sort((a, b) => sc(b) - sc(a))[0] || null; } catch (e) {} };
  if ('speechSynthesis' in window) { pickV(); speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', pickV); }
  let talkRun = 0;
  function speakText(t) {
    return t.replace(/<[^>]+>/g, ' ').replace(/−/g, ' eksi ').replace(/\+/g, ' artı ').replace(/=/g, ' eşittir ').replace(/×/g, ' çarpı ')
      .replace(/\?/g, '?').replace(/[▢□]/g, ' kaç ').replace(/\p{Extended_Pictographic}|️/gu, ' ').replace(/\s+/g, ' ').trim();
  }
  async function say(t, ms) {
    const my = ++talkRun;
    const b = $('pdSay'); if (b) { b.innerHTML = t; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
    const ani = $('pdAni'); if (ani) ani.classList.add('talk');
    const txt = speakText(t);
    if (S.sound && voice && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
      const parts = txt.split(/(?<=[.!?:])\s+/).filter(Boolean);
      for (const p of parts) {
        if (my !== talkRun) break;
        await new Promise(res => { const u = new SpeechSynthesisUtterance(p); u.voice = voice; u.lang = 'tr-TR'; u.rate = .9; u.pitch = 1.05; let d = false; const e = () => { if (!d) { d = true; res(); } }; u.onend = e; u.onerror = e; setTimeout(e, 2500 + p.length * 110); speechSynthesis.speak(u); });
        await sleep(220);
      }
    } else await sleep(ms || Math.min(4200, 900 + txt.length * 45));
    if (my === talkRun && ani) ani.classList.remove('talk');
  }
  const hush = () => { talkRun++; try { speechSynthesis.cancel(); } catch (e) {} };

  // Cümle üretici: parçalardan, çocuğun durumuna göre; son kullanılanları tekrar etmez
  const used = [];
  function gen(pool, ctx = {}) {
    const n = nm(), c = { n, N: n ? ' ' + n : '', ...ctx };
    let opts = pool.filter(x => !used.includes(x));
    if (!opts.length) opts = pool;
    const s = pick(opts); used.push(s); if (used.length > 14) used.shift();
    return s.replace(/\{(\w+)\}/g, (m, k) => (c[k] !== undefined ? c[k] : '')).replace(/\s+([,.!?])/g, '$1').replace(/^\s*,\s*/, '').trim();
  }
  const TALK = {
    open: ['Hazır mısın{N}? Bugün yeni bir taş koyuyoruz.', 'Merhaba{N}! Piramidimize bir taş daha ekleyelim.', 'Gel{N}, birlikte düşünelim. Acele yok.', 'Bugünkü taşımız: {skill}. Önce senin fikrini merak ediyorum.'],
    predict: ['Ben göstermeden önce sen tahmin et. Sence?', 'Bir tahmin yap, yanılsan bile olur. Tahmin beyni ısıtır.', 'Hiç hesaplamadan, içinden geleni seç.', 'Sence hangisi? Sonra birlikte bakacağız.'],
    predOk: ['Vay! Tahminin doğru çıktı. Şimdi nedenini görelim.', 'Sezgin çok iyi{N}. Bakalım neden doğru.', 'Evet! İçindeki matematikçi biliyormuş.'],
    predNo: ['Güzel tahmin! Doğrusu biraz farklı, şimdi nedenini görünce şaşıracaksın.', 'Tahmin etmen önemliydi. Şimdi tahtada bakalım ne oluyor.', 'Hımm, ilginç! Beynin bir yol denedi. Şimdi başka bir yola bakalım.'],
    draw: ['Şimdi tahtaya çiziyorum, sen beni izle.', 'Kalemi alıyorum. Gözün tahtada olsun.', 'Bunu resimle görmek çok kolay. Bak.'],
    yourTurn: ['Sıra sende. Bu adımı sen yap.', 'Şimdi sen söyle bakalım.', 'Bu kısmı sana bırakıyorum.'],
    practice: ['Şimdi sayılarla yazalım. Resim aklında olsun.', 'Kalem senin elinde. Birkaç tane çözelim.', 'Resmi aklında canlandır ve yaz.'],
    right: ['Doğru!', 'Tam isabet!', 'Evet!', 'Harika!', 'Aynen böyle!', 'Bravo{N}!'],
    rightWhy: ['{why} Mantığını yakaladın.', 'Doğru, çünkü {why}', '{why} İşte bu!'],
    streak: ['Üst üste {k} doğru! Taş sağlamlaşıyor.', '{k} tane art arda! Elin ısındı.', 'Durdurulamıyorsun{N}, {k} doğru!'],
    wrong: ['Hımm, bir daha bakalım.', 'Neredeyse. Birlikte düşünelim.', 'Sorun değil, hata beynin büyüdüğü yerdir.', 'Dur bir saniye, bir ipucu vereyim.'],
    hint1: ['Kendine şunu sor: {q}', 'Bir soru: {q}', 'Düşün bakalım: {q}'],
    crack: ['Bir şey fark ettim{N}: {what} Bu, alttaki bir taşta küçük bir çatlak demek. Önce onu onaralım mı?', 'Dedektif modu açık! {what} Hadi o taşa inip sağlamlaştıralım.'],
    sprint: ['Şimdi hızlanma zamanı! Düşünmeden değil, rahatça ve hızlıca.', 'Akıcılık turu! Ne kadar çok, o kadar iyi.'],
    built: ['Taş yerine oturdu{N}! 🧱 Birkaç gün sonra tekrar bakacağız, unutmayalım diye.', 'İşte bir taş daha! Piramidin yükseliyor.'],
    review: ['Eski bir taşı yokluyoruz, sağlam mı diye.', 'Hatırlıyor musun? Bu taşı daha önce koymuştuk.', 'Tekrar zamanı. Unutmamak için beyin böyle çalışır.'],
    gold: ['Bu taş artık altın! 🥇 Zamana dayandı.', 'Altın taş! Bunu artık hiç unutmazsın.']
  };

  // ---------------------------------------------------------------- tahta çizim motoru
  const NS = 'http://www.w3.org/2000/svg';
  let BD = null; // aktif tahta svg
  const C = { ink: '#1d3a8a', red: '#c8102e', green: '#0b8a53', orange: '#e06c00', gray: '#8d93a0', dot: '#e8590c', ten: '#2f6fd6', one: '#f2a516', faint: '#d7dbe3' };
  function el(tag, at, parent) { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (parent || BD).appendChild(e); return e; }
  function stroke(e, ms) { try { const L = e.getTotalLength ? e.getTotalLength() : 200; e.style.strokeDasharray = L; e.style.strokeDashoffset = L; e.getBoundingClientRect(); e.style.transition = `stroke-dashoffset ${ms || 500}ms ease`; e.style.strokeDashoffset = 0; } catch (x) {} return e; }
  function pop(e, delay) { e.style.opacity = 0; e.style.transformOrigin = 'center'; e.style.transformBox = 'fill-box'; e.style.transform = 'scale(.3)'; setTimeout(() => { e.style.transition = 'opacity .25s, transform .3s cubic-bezier(.3,1.6,.5,1)'; e.style.opacity = 1; e.style.transform = 'scale(1)'; }, delay || 0); return e; }
  const D = {
    clear() { if (BD) BD.innerHTML = ''; },
    text(x, y, s, o = {}) { const t = el('text', { x, y, 'text-anchor': o.a || 'middle', 'font-size': o.size || 20, fill: o.color || C.ink, 'font-weight': 700, class: 'kt' }); t.textContent = s; return pop(t, o.delay); },
    line(x1, y1, x2, y2, o = {}) { return stroke(el('line', { x1, y1, x2, y2, stroke: o.color || C.ink, 'stroke-width': o.w || 3, 'stroke-linecap': 'round' }), o.ms); },
    dot(x, y, o = {}) { return pop(el('circle', { cx: x, cy: y, r: o.r || 9, fill: o.color || C.dot, stroke: o.hollow ? C.dot : 'none', 'stroke-width': 2, 'fill-opacity': o.hollow ? 0 : 1 }), o.delay); },
    // Zar/kart düzeni (1-6) ya da 5'li sıralar
    dots(n, cx, cy, o = {}) {
      const L = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
      const g = 24, out = [];
      if (n <= 6 && !o.rows) L[n].forEach(([a, b], i) => out.push(D.dot(cx + a * g, cy + b * g, { delay: i * 60, color: o.color })));
      else for (let i = 0; i < n; i++) out.push(D.dot(cx - 2 * g + (i % 5) * g, cy - 12 + Math.floor(i / 5) * g, { delay: i * 50, color: i < 5 ? o.color || C.dot : o.color2 || C.ten }));
      return out;
    },
    // Onluk çerçeve: 2×5, n dolu; extra: başka renkte eklenen
    frame(n, x, y, o = {}) {
      const s = o.s || 34, cells = [];
      const r = el('rect', { x, y, width: s * 5, height: s * 2, fill: '#fff', stroke: C.ink, 'stroke-width': 3, rx: 3 }); stroke(r, 600);
      for (let i = 1; i < 5; i++) D.line(x + i * s, y, x + i * s, y + 2 * s, { w: 2, ms: 300 });
      D.line(x, y + s, x + 5 * s, y + s, { w: 2, ms: 300 });
      for (let i = 0; i < 10; i++) cells.push([x + (i % 5) * s + s / 2, y + Math.floor(i / 5) * s + s / 2]);
      const dots = [];
      for (let i = 0; i < n; i++) dots.push(D.dot(cells[i][0], cells[i][1], { r: s * .3, delay: 300 + i * 70, color: o.color }));
      return { cells, dots, s, add(k, from, color) { const a = []; for (let i = from; i < from + k && i < 10; i++) a.push(D.dot(cells[i][0], cells[i][1], { r: s * .3, delay: (i - from) * 110, color: color || C.ten })); return a; } };
    },
    // Onluk bloklar: t onluk çubuk, o birlik kare
    blocks(t, o, x, y, opt = {}) {
      const u = opt.u || 12, gap = 8, items = [];
      for (let i = 0; i < t; i++) {
        const g = el('g', {});
        for (let j = 0; j < 10; j++) el('rect', { x: x + i * (u + gap), y: y + j * u, width: u, height: u, fill: C.ten, stroke: '#fff', 'stroke-width': 1.5 }, g);
        items.push(pop(g, i * 90));
      }
      const ox = x + t * (u + gap) + (t ? 10 : 0);
      for (let k = 0; k < o; k++) items.push(pop(el('rect', { x: ox + (k % 3) * (u + 3), y: y + 10 * u - (Math.floor(k / 3) + 1) * (u + 3), width: u, height: u, fill: C.one, stroke: '#fff', 'stroke-width': 1.5 }), t * 90 + k * 70));
      return items;
    },
    // Sayı doğrusu: [a,b], her 'tick' te çentik, her 'lab' da etiket
    nline(a, b, x1, x2, y, o = {}) {
      const pos = v => x1 + (v - a) / (b - a) * (x2 - x1);
      D.line(x1 - 8, y, x2 + 8, y, { w: 3, ms: 700 });
      const tick = o.tick || 1, lab = o.lab === undefined ? tick : o.lab;
      for (let v = a; v <= b + 1e-9; v += tick) {
        const big = lab && Math.abs((v - a) % lab) < 1e-9;
        D.line(pos(v), y - (big ? 9 : 5), pos(v), y + (big ? 9 : 5), { w: big ? 2.5 : 1.5, ms: 200 });
        if (big && !o.hideLabels) D.text(pos(v), y + 28, String(v), { size: o.fs || 15, color: C.ink, delay: 200 });
      }
      return { pos };
    },
    // Sayı doğrusu üstünde zıplama yayı
    jump(xA, xB, y, label, o = {}) {
      const h = o.h || Math.min(60, Math.abs(xB - xA) * .55 + 18), mx = (xA + xB) / 2;
      const p = el('path', { d: `M${xA},${y - 4} Q${mx},${y - 4 - h * 2} ${xB},${y - 4}`, fill: 'none', stroke: o.color || C.red, 'stroke-width': 3, 'stroke-linecap': 'round' });
      stroke(p, o.ms || 650);
      const hd = el('path', { d: `M${xB - 7},${y - 15} L${xB},${y - 4} L${xB + 5},${y - 16}`, fill: 'none', stroke: o.color || C.red, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); stroke(hd, 300);
      if (label) D.text(mx, y - h - 12, label, { size: 17, color: o.color || C.red, delay: 300 });
      return p;
    },
    mark(x, y, s, color) { const g = el('g', {}); el('circle', { cx: x, cy: y, r: 7, fill: color || C.red }, g); if (s !== undefined) { const t = el('text', { x, y: y - 16, 'text-anchor': 'middle', 'font-size': 18, fill: color || C.red, 'font-weight': 700, class: 'kt' }, g); t.textContent = s; } return pop(g); },
    brace(x1, x2, y, s, color) { const p = el('path', { d: `M${x1},${y} q0,10 10,10 L${(x1 + x2) / 2 - 8},${y + 10} q8,0 8,8 q0,-8 8,-8 L${x2 - 10},${y + 10} q10,0 10,-10`, fill: 'none', stroke: color || C.green, 'stroke-width': 2.5 }); stroke(p, 500); if (s) D.text((x1 + x2) / 2, y + 40, s, { size: 17, color: color || C.green, delay: 250 }); return p; },
    circle(x, y, r, color) { return stroke(el('ellipse', { cx: x, cy: y, rx: r, ry: r * .8, fill: 'none', stroke: color || C.green, 'stroke-width': 3 }), 600); }
  };

  // ---------------------------------------------------------------- hata dedektifi
  // Her kavram yanılgısı: ne fark ettik + hangi taş onarır
  const MIS = {
    birfark: { what: 'Bir eksik ya da bir fazla saydın. Tek tek saymak yerine grupları görmeyi deneyelim.', fix: 'gorsay' },
    sorudanKendi: { what: 'Sayının kendisini yazdın ama soru eksik olanı soruyordu.', fix: 'cerceve' },
    onArkadas: { what: '10\'un arkadaşlarında bir karışıklık var.', fix: 'onu' },
    onuUnuttu: { what: 'Onluğu yolda unuttun gibi; köprüden geçince 10 hep kalır.', fix: 'cerceve' },
    tersCikarma: { what: 'Birlikleri çıkarırken küçükten büyüğü çıkardın (büyükten küçüğü yaptın).', fix: 'kopruCik' },
    yanYana: { what: 'Onlukları ve birlikleri yan yana yazdın. 10 birlik bir onluk eder!', fix: 'onluk' },
    onlukTek: { what: 'Onluk çubukları 1 gibi saydın. Her çubukta 10 kare var.', fix: 'onluk' },
    basamakTers: { what: 'Onlar ve birler yer değiştirdi.', fix: 'onluk' },
    rakamDeger: { what: 'Rakamın kendisini söyledin, ama durduğu yer ona değer katar.', fix: 'onluk' },
    sifirTutucu: { what: 'Boş basamağa 0 koymayı unuttun. 0, yeri tutan bekçidir.', fix: 'basamak' },
    birlerDegisti: { what: '10 ekleyince birler değil onlar değişir.', fix: 'onluk' },
    hepAsagi: { what: 'Hep aşağı yuvarladın. Ortadan (5) itibaren yukarıya yuvarlanır.', fix: 'dogru' },
    eldeYok: { what: 'Birlikler 10\'u geçince yeni bir onluk oluşur, onu eklemeyi unuttun.', fix: 'kopru' }
  };

  // ---------------------------------------------------------------- TAŞLAR
  const between = (a, b, not) => { let v; do { v = R(a, b); } while (not && not.includes(v)); return v; };
  const near = (ans, k = 3, min = 0) => { const s = new Set([ans]); while (s.size < k) { const v = ans + pick([-2, -1, 1, 2, 10, -10].filter(x => Math.abs(x) < 3 || ans > 15)); if (v >= min) s.add(v); } return shuffle([...s]); };
  const SK = [];
  const add = s => (SK.push(s), s);

  // ===== KAT 1 · MİKTAR SEZGİSİ
  add({ id: 'gorsay', layer: 1, icon: '👀', name: 'Görmeden say', tag: 'Noktaları saymadan, bir bakışta gör', needs: [],
    predict: () => ({ q: 'Ekranda 7 nokta bir an görünecek. Tek tek saymadan kaç tane olduğunu anlayabilir misin?', choices: ['Evet, gruplarsam', 'Hayır, saymam lazım'], ans: 0,
      show: async () => { D.clear(); D.dots(7, 180, 110, { rows: 1 }); await say('Bak: üstte beş, altta iki. Beşi bir bakışta tanırız, iki de kolay. Beş artı iki, yedi! Saymadan, gruplayarak gördük.'); } }),
    model: async ask => {
      D.clear(); D.text(180, 30, 'Beş + kalan', { size: 18 });
      D.dots(5, 110, 110); await say('Bu beş. Zarın beşi gibi, köşeler ve orta. Bunu artık tanıyorsun.');
      D.dots(3, 250, 110, { color: C.ten }); await say('Yanına üç tane daha koydum. Beş ve üç.');
      return ask({ q: 'Hepsi kaç tane?', ans: 8, why: 'beş ile üç sekiz eder.' });
    },
    gen: d => { const n = d === 1 ? R(2, 5) : d === 2 ? R(4, 7) : R(6, 10); return { kind: 'flash', n, q: 'Kaç nokta gördün?', ans: n, choices: near(n, 4, 1), flash: d === 1 ? 1600 : d === 2 ? 1200 : 1000, why: n > 5 ? `5 ve ${n - 5}, ${n} eder.` : `${n} tanesini birden gördün.`, bug: a => (Math.abs(a - n) === 1 ? 'birfark' : null), hint: 'Önce beşlik grubu bul, sonra kalanı ekle.' }; },
    sprint: () => { const n = R(3, 9); return { kind: 'flash', n, q: 'Kaç?', ans: n, choices: near(n, 4, 1), flash: 900 }; }
  });

  add({ id: 'cerceve', layer: 1, icon: '🔟', name: 'Onluk çerçeve', tag: '10\'luk kutuda sayıyı gör, 10\'a kaç kaldığını bil', needs: ['gorsay'],
    predict: () => ({ q: 'Onluk çerçevede 7 nokta var. Boş kaç kutu kalır?', choices: ['2', '3', '4'], ans: 1,
      show: async () => { D.clear(); const f = D.frame(7, 95, 60); await say('Çerçevede 10 kutu var. 7 tanesi dolu.'); f.add(3, 7, C.green); await say('Boş kutular 3. Yani 7 ile 3, 10 eder. Çerçeve bize 10\'a ne kadar kaldığını hemen gösterir.'); } }),
    model: async ask => {
      D.clear(); const f = D.frame(6, 95, 50);
      await say('Bu onluk çerçeve. Üst sıra beş, alt sıra beş. Altı nokta koydum: üst sıra dolu, altta bir tane.');
      f.add(4, 6, C.green);
      return ask({ q: '10 olması için kaç nokta ekledim?', ans: 4, why: '6 ile 4, 10 eder.' });
    },
    gen: d => {
      const n = d === 1 ? R(3, 9) : R(1, 9);
      if (d === 1) return { kind: 'num', q: 'Çerçevede kaç nokta var?', ans: n, vis: () => { D.clear(); D.frame(n, 95, 50); }, why: n > 5 ? `üst sıra 5, altta ${n - 5}.` : `${n} nokta görüyoruz.`, hint: 'Üst sıra doluysa 5\'ten başla.' };
      if (d === 2) return { kind: 'fill', start: n, title: '🦁 Aslanın sepeti 10 elma istiyor', q: `Sepette ${n} elma var. 10 olması için ekle!`, ans: 10 - n, why: `${n} ile ${10 - n}, 10 eder.`, hint: 'Sepet dolunca dur: boş kutu kalmasın.' };
      return { kind: 'num', q: '10 olması için kaç nokta eksik?', ans: 10 - n, vis: () => { D.clear(); D.frame(n, 95, 50); }, why: `${n} ile ${10 - n}, 10 eder.`, bug: a => (a === n ? 'sorudanKendi' : null), hint: 'Boş kutuları say.' };
    },
    sprint: () => { const n = R(1, 9); return { kind: 'num', q: '10\'a kaç eksik?', ans: 10 - n, vis: () => { D.clear(); D.frame(n, 95, 50); } }; }
  });

  add({ id: 'onu', layer: 1, icon: '🤝', name: '10\'un arkadaşları', tag: 'Hangi iki sayı 10 eder? (ve 20)', needs: ['cerceve'],
    predict: () => ({ q: '8 ile hangisi 10 eder?', choices: ['1', '2', '3'], ans: 1,
      show: async () => { D.clear(); const f = D.frame(8, 95, 50); f.add(2, 8, C.green); await say('Sekiz noktanın yanına iki tane eklenince çerçeve doldu. 8 ile 2, 10\'un arkadaşı.'); } }),
    model: async ask => {
      D.clear(); D.text(180, 40, '10\'un arkadaşları', { size: 20 });
      const pairs = [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5]];
      pairs.forEach(([a, b], i) => { D.text(60 + i * 60, 100, `${a}+${b}`, { size: 19, delay: i * 250, color: i % 2 ? C.ten : C.red }); });
      await say('Bunlar 10\'un arkadaşları. Bir, dokuz ile. İki, sekiz ile. Üç, yedi ile. Dört, altı ile. Beş de kendisiyle.');
      return ask({ q: '7\'nin arkadaşı kim?', ans: 3, why: '7 ile 3, 10 eder.' });
    },
    gen: d => {
      if (d === 3) { const a = R(11, 19); return { kind: 'num', q: `${a} + ▢ = 20`, ans: 20 - a, why: `${sx(a - 10, 'gen')} arkadaşı ${20 - a}; 10 zaten var.`, bug: a2 => (a2 === 10 - (a - 10) + 10 ? 'onuUnuttu' : null), hint: `Önce ${sx(a, 'loc')}ki 10'u ayır, kalan ${a - 10}.`, vis: () => { D.clear(); D.frame(10, 20, 50, { s: 30 }); D.frame(a - 10, 190, 50, { s: 30 }); } }; }
      const a = R(1, 9);
      return { kind: 'num', q: d === 1 ? `${a} + ▢ = 10` : `▢ + ${a} = 10`, ans: 10 - a, why: `${a} ile ${10 - a}, 10'un arkadaşı.`, bug: x => (x === a ? 'onArkadas' : x === 10 + a ? 'onArkadas' : null), hint: `${a} noktalı çerçevede kaç boş kutu kalır?`, vis: d === 1 ? () => { D.clear(); D.frame(a, 95, 50); } : null };
    },
    sprint: () => { const a = R(1, 9); return { kind: 'num', q: `${a} + ▢ = 10`, ans: 10 - a }; }
  });

  add({ id: 'sirala', layer: 1, icon: '🔢', name: 'Sıra ve karşılaştırma', tag: 'Önce/sonra gelen, hangisi büyük', needs: ['gorsay'],
    predict: () => ({ q: '39\'dan hemen sonra hangi sayı gelir?', choices: ['310', '40', '30'], ans: 1,
      show: async () => { D.clear(); const L = D.nline(35, 42, 30, 330, 120, { tick: 1, lab: 1 }); D.mark(L.pos(39), 120, '39'); await sleep(300); D.jump(L.pos(39), L.pos(40), 120, '+1'); await say('39\'a bir eklersek birler 9\'dan 10\'a çıkar ve yeni bir onluk olur: 40.'); } }),
    model: async ask => {
      D.clear(); const L = D.nline(20, 30, 30, 330, 120, { tick: 1, lab: 5 });
      D.mark(L.pos(26), 120, '26'); await say('Sayı doğrusunda sağa gittikçe sayılar büyür. 26 burada.');
      D.jump(L.pos(26), L.pos(27), 120, '+1'); await say('Bir sağı, bir sonraki sayı.');
      return ask({ q: '26\'dan hemen önce hangi sayı var?', ans: 25, why: 'bir sola gidince bir azalır.' });
    },
    gen: d => {
      if (d === 1) { const n = R(5, 19); return { kind: 'num', q: `${sx(n, 'abl')} sonra hangi sayı gelir?`, ans: n + 1, why: 'bir sağa gittik.', bug: a => (a === n - 1 ? 'birfark' : null), hint: 'Sayı doğrusunda bir adım sağa.' }; }
      if (d === 2) { const n = between(21, 99, [30, 40, 50, 60, 70, 80, 90]); const back = chance(.5); return { kind: 'num', q: back ? `${sx(n, 'abl')} hemen önce hangi sayı var?` : `${sx(n, 'abl')} hemen sonra hangi sayı var?`, ans: back ? n - 1 : n + 1, why: back ? 'bir sola gittik.' : 'bir sağa gittik.', bug: a => (Math.abs(a - n) === 1 ? 'birfark' : null), hint: back ? 'Bir adım sola.' : 'Bir adım sağa.' }; }
      const a = R(12, 98); let b; do { b = R(12, 98); } while (b === a || Math.floor(a / 10) !== Math.floor(b / 10) && chance(.4));
      return { kind: 'choice', q: 'Hangisi daha büyük?', choices: [String(a), String(b)], ans: a > b ? 0 : 1, why: Math.floor(a / 10) !== Math.floor(b / 10) ? 'önce onluklara bakılır.' : 'onlar aynı, birlere baktık.', hint: 'Önce onlar basamağına bak.' };
    },
    sprint: () => { const n = R(10, 99); return { kind: 'num', q: `${n} + 1 = ?`, ans: n + 1 }; }
  });

  add({ id: 'kopru', layer: 1, icon: '🌉', name: '10 köprüsüyle toplama', tag: '8 + 5 = 8 + 2 + 3', needs: ['onu'],
    predict: () => ({ q: '9 + 6 ile 10 + 5 aynı mı?', choices: ['Aynı', 'Farklı'], ans: 0,
      show: async () => { D.clear(); const f = D.frame(9, 20, 50, { s: 30 }); D.text(270, 40, '+6', { size: 22, color: C.ten }); await say('Dokuzun yanına altı eklemek istiyoruz.'); f.add(1, 9, C.ten); await say('Altıdan birini alıp çerçeveyi dolduruyorum: on oldu. Altıdan geriye beş kaldı.'); D.frame(5, 190, 50, { s: 30, color: C.ten }); await say('On artı beş, on beş. Yani dokuz artı altı ile on artı beş aynı şey!'); } }),
    model: async ask => {
      D.clear(); const f = D.frame(8, 20, 40, { s: 30 }); D.text(300, 35, '8 + 5', { size: 22 });
      await say('Sekiz artı beş. Önce sekizi 10\'a tamamlayalım.');
      const r1 = await ask({ q: '8\'i 10 yapmak için 5\'ten kaç tane alırım?', ans: 2, why: '8 ile 2, 10 eder.' });
      f.add(2, 8, C.ten); D.frame(3, 190, 40, { s: 30, color: C.ten });
      await say('Beşten iki tanesi köprüyü kurdu. Geriye üç kaldı.');
      const r2 = await ask({ q: '10 + 3 kaç?', ans: 13, why: 'on ile üç, on üç.' });
      D.text(180, 170, '8 + 5 = 8 + 2 + 3 = 13', { size: 21, color: C.green });
      await say('İşte köprü: sekiz artı iki artı üç, on üç.');
      return r1 && r2;
    },
    gen: d => {
      const a = d === 1 ? 9 : d === 2 ? R(8, 9) : R(6, 9), b = R(11 - a, 9), s = a + b, need = 10 - a;
      return { kind: 'num', q: `${a} + ${b} = ?`, ans: s, why: `${a} + ${need} = 10, kalan ${b - need}, 10 + ${b - need} = ${s}.`,
        bug: x => (x === s - 10 ? 'onuUnuttu' : Math.abs(x - s) === 1 ? 'birfark' : null),
        hint: `${sx(a, 'acc')} 10 yapmak için ${sx(b, 'abl')} kaç tane alırsın?`, vis2: () => { D.clear(); const f = D.frame(a, 20, 40, { s: 30 }); f.add(need, a, C.ten); D.frame(b - need, 190, 40, { s: 30, color: C.ten }); } };
    },
    sprint: () => { const a = R(6, 9), b = R(11 - a, 9); return { kind: 'num', q: `${a} + ${b} = ?`, ans: a + b }; }
  });

  add({ id: 'kopruCik', layer: 1, icon: '🪜', name: '10 köprüsüyle çıkarma', tag: '13 − 5 = 13 − 3 − 2', needs: ['kopru'],
    predict: () => ({ q: '14 − 6 için önce 10\'a inmek işe yarar mı?', choices: ['Evet', 'Hayır'], ans: 0,
      show: async () => { D.clear(); const L = D.nline(5, 15, 30, 330, 120, { tick: 1, lab: 5 }); D.mark(L.pos(14), 120, '14'); await sleep(300); D.jump(L.pos(14), L.pos(10), 120, '−4'); await say('On dörtten önce dört geri, ona indik.'); D.jump(L.pos(10), L.pos(8), 120, '−2', { color: C.ten }); await say('Altının dördünü kullandık, iki kaldı. Ondan iki geri: sekiz.'); } }),
    model: async ask => {
      D.clear(); const L = D.nline(5, 15, 30, 330, 120, { tick: 1, lab: 5 }); D.text(180, 30, '13 − 5', { size: 22 });
      D.mark(L.pos(13), 120, '13'); await say('On üçten beş çıkaracağız. Önce ona inelim.');
      const r1 = await ask({ q: '13\'ten 10\'a inmek için kaç geri gideriz?', ans: 3, why: 'on üçün içinde üç birlik var.' });
      D.jump(L.pos(13), L.pos(10), 120, '−3');
      await say('Beşin üçünü kullandık, iki kaldı.');
      D.jump(L.pos(10), L.pos(8), 120, '−2', { color: C.ten });
      const r2 = await ask({ q: '10 − 2 kaç?', ans: 8, why: '10\'un arkadaşı: 8 ile 2.' });
      return r1 && r2;
    },
    gen: d => {
      const c = d === 1 ? R(11, 13) : R(11, 18), b = R(c - 9, 9), ans = c - b, o = c - 10;
      return { kind: 'num', q: `${c} − ${b} = ?`, ans, why: `${c} − ${o} = 10, sonra 10 − ${b - o} = ${ans}.`,
        bug: x => (x === 10 + (b - o) ? 'tersCikarma' : Math.abs(x - ans) === 1 ? 'birfark' : null),
        hint: `Önce ${sx(c, 'abl')} 10'a in: kaç geri?`, vis2: () => { D.clear(); const L = D.nline(Math.max(0, ans - 2), c + 1, 30, 330, 120, { tick: 1, lab: 5 }); D.mark(L.pos(c), 120, String(c)); D.jump(L.pos(c), L.pos(10), 120, `−${o}`); D.jump(L.pos(10), L.pos(ans), 120, `−${b - o}`, { color: C.ten }); } };
    },
    sprint: () => { const c = R(11, 18), b = R(c - 9, 9); return { kind: 'num', q: `${c} − ${b} = ?`, ans: c - b }; }
  });

  // ===== KAT 2 · SAYININ ADRESİ
  add({ id: 'onluk', layer: 2, icon: '🧱', name: 'Onluk ve birlik', tag: '10 birlik = 1 onluk', needs: ['cerceve', 'sirala'],
    predict: () => ({ q: '2 onluk çubuk ve 13 birlik küp: kaç eder?', choices: ['213', '33', '15'], ans: 1,
      show: async () => { D.clear(); D.blocks(2, 13, 40, 40); await say('İki onluk çubuk ve on üç küp. Küplerden onu birleşip yeni bir çubuk olur!'); await sleep(400); D.clear(); D.blocks(3, 3, 40, 40); await say('Üç onluk, üç birlik: otuz üç. 213 yazsaydık küpleri yan yana yazmış olurduk.'); } }),
    model: async ask => {
      D.clear(); D.blocks(4, 6, 40, 40);
      await say('Mavi çubukların her birinde on küçük kare var. Sarı küpler tek tek.');
      const r = await ask({ q: 'Kaç onluk çubuk var?', ans: 4, why: 'dört çubuk görüyoruz.' });
      return r && ask({ q: 'Hepsi kaç eder?', ans: 46, why: 'dört onluk kırk, altı birlikle kırk altı.' });
    },
    gen: d => {
      let t = d === 1 ? R(1, 4) : R(2, 8), o = d === 3 ? R(11, 16) : R(0, 9), ans = t * 10 + o;
      if (ans > 99) { t = 7; ans = t * 10 + o; }
      return { kind: 'num', q: 'Bloklar kaç eder?', ans, vis: () => { D.clear(); D.blocks(t, o, 30, 30, { u: 11 }); }, why: `${t} onluk ${t * 10}, ${o} birlikle ${ans}.`,
        bug: x => (x === Number(`${t}${o}`) && o > 9 ? 'yanYana' : x === t + o ? 'onlukTek' : x === o * 10 + t ? 'basamakTers' : null), hint: 'Çubukları onar onar say: 10, 20, 30…' };
    },
    sprint: () => { const t = R(1, 9), o = R(0, 9); return { kind: 'num', q: `${t} onluk ${o} birlik = ?`, ans: t * 10 + o }; }
  });

  add({ id: 'kur', layer: 2, icon: '🏗️', name: 'Sayıyı kur', tag: 'Bloklarla istediğin sayıyı yap', needs: ['onluk'],
    predict: () => ({ q: '52\'yi kurmak için kaç onluk çubuk gerekir?', choices: ['2', '5', '52'], ans: 1,
      show: async () => { D.clear(); D.blocks(5, 2, 40, 40); await say('Beş onluk elli, iki birlik iki. Elli iki. Soldaki rakam çubuk sayısını söyler!'); } }),
    model: async ask => {
      D.clear(); D.text(180, 30, 'Hedef: 34', { size: 22 }); await say('Otuz dört kuracağız. Önce onlukları koyalım.');
      D.blocks(3, 0, 40, 50); const r = await ask({ q: 'Kaç birlik küp eklemeliyim?', ans: 4, why: 'otuz dörtte dört birlik var.' });
      D.blocks(0, 4, 40 + 3 * 20 + 10, 50); await say('Üç onluk, dört birlik. Otuz dört tamam!');
      return r;
    },
    gen: d => { const N = d === 1 ? R(11, 40) : R(21, 99); return { kind: 'build', target: N, q: `${N} sayısını kur`, ans: N, why: `${Math.floor(N / 10)} onluk, ${N % 10} birlik.`, bugBuild: (t, o) => (t === N % 10 && o === Math.floor(N / 10) ? 'basamakTers' : null), hint: `${sx(N, 'gen')} solundaki rakam kaç çubuk istediğini söyler.` }; },
    sprint: () => { const N = R(11, 99); return { kind: 'num', q: `${N} = ▢ onluk ${N % 10} birlik`, ans: Math.floor(N / 10) }; }
  });

  add({ id: 'dogru', layer: 2, icon: '📏', name: 'Sayı doğrusu', tag: 'Her sayının bir adresi var', needs: ['sirala', 'onluk'],
    predict: () => ({ q: '0 ile 100 arasında 50 nerededir?', choices: ['Başta', 'Tam ortada', 'Sonda'], ans: 1,
      show: async () => { D.clear(); const L = D.nline(0, 100, 30, 330, 120, { tick: 10, lab: 50 }); D.mark(L.pos(50), 120, '50'); await say('Elli, sıfır ile yüzün tam ortası. Sayı doğrusunda her sayının bir adresi var.'); } }),
    model: async ask => {
      D.clear(); const L = D.nline(0, 100, 30, 330, 120, { tick: 10, lab: 10, fs: 12 });
      await say('Bu doğruda her çentik on adım.');
      D.mark(L.pos(70), 120, '70'); await say('Yetmiş burada, yedinci çentik.');
      return ask({ q: '75 hangi iki çentiğin arasında? Küçüğünü yaz.', ans: 70, why: '75, 70 ile 80 arasında, tam ortada.' });
    },
    gen: d => {
      const range = d === 1 ? [0, 10] : [0, 100], N = d === 1 ? R(1, 9) : between(3, 97, [50]);
      return { kind: 'line', q: `${N} nerede? Doğruya dokun.`, ans: N, range, tol: d === 1 ? 0 : d === 2 ? 3 : 5, tick: d === 1 ? 1 : 10, lab: d === 1 ? 1 : d === 2 ? 10 : 50, why: `${N}, ${d === 1 ? 'çentikleri sayınca' : 'onlukların arasında'} tam orada.`, hint: d === 1 ? 'Sıfırdan başlayıp çentik say.' : `Önce ${sx(Math.floor(N / 10) * 10, 'acc')} bul.` };
    },
    sprint: () => { const N = R(5, 95); return { kind: 'line', q: `${N}?`, ans: N, range: [0, 100], tol: 5, tick: 10, lab: 50 }; }
  });

  add({ id: 'zipla10', layer: 2, icon: '🦘', name: '10\'ar zıpla', tag: '47 + 10 = 57: onlar değişir', needs: ['dogru'],
    predict: () => ({ q: '47 + 10 kaç olur?', choices: ['48', '57', '147'], ans: 1,
      show: async () => { D.clear(); const L = D.nline(40, 70, 30, 330, 120, { tick: 1, lab: 10 }); D.mark(L.pos(47), 120, '47'); await sleep(300); D.jump(L.pos(47), L.pos(57), 120, '+10'); await say('On ilerledik: kırk yediden elli yediye. Bak, birler aynı kaldı, onlar bir arttı.'); } }),
    model: async ask => {
      D.clear(); const L = D.nline(20, 60, 30, 330, 120, { tick: 1, lab: 10 }); D.mark(L.pos(23), 120, '23');
      await say('Yirmi üçten onar zıplayalım.');
      D.jump(L.pos(23), L.pos(33), 120, '+10'); await say('Otuz üç.');
      return ask({ q: 'Bir zıplama daha: 33 + 10?', ans: 43, why: 'onlar bir arttı, birler yine üç.' });
    },
    gen: d => {
      const k = d === 1 ? 1 : R(1, 3) * (chance(.5) || d === 1 ? 1 : -1), n = between(k > 0 ? 11 : 10 * Math.abs(k) + 11, k > 0 ? 99 - 10 * k : 99), ans = n + 10 * k;
      return { kind: 'num', q: `${n} ${k > 0 ? '+' : '−'} ${Math.abs(k) * 10} = ?`, ans, why: `onlar ${Math.abs(k)} ${k > 0 ? 'arttı' : 'azaldı'}, birler aynı.`, bug: x => (x === n + k || x === n - k ? 'birlerDegisti' : null), hint: 'Birler basamağı değişmez, sadece onlar.',
        vis2: () => { D.clear(); const a = Math.min(n, ans), b = Math.max(n, ans); const L = D.nline(Math.floor(a / 10) * 10, Math.ceil((b + 1) / 10) * 10, 30, 330, 120, { tick: 10, lab: 10, fs: 13 }); let x = n; D.mark(L.pos(n), 120, String(n)); for (let i = 0; i < Math.abs(k); i++) { const y = x + 10 * Math.sign(k); D.jump(L.pos(x), L.pos(y), 120, k > 0 ? '+10' : '−10'); x = y; } } };
    },
    sprint: () => { const n = R(11, 89); return { kind: 'num', q: `${n} + 10`, ans: n + 10 }; }
  });

  add({ id: 'basamak', layer: 2, icon: '🏠', name: 'Basamak değeri', tag: '342\'de 4 aslında 40', needs: ['kur', 'zipla10'],
    predict: () => ({ q: '342 sayısındaki 4 aslında kaç değerinde?', choices: ['4', '40', '400'], ans: 1,
      show: async () => { D.clear(); ['3', '4', '2'].forEach((c, i) => D.text(110 + i * 70, 80, c, { size: 44, color: [C.red, C.ten, C.one][i], delay: i * 200 })); ['yüzler', 'onlar', 'birler'].forEach((c, i) => D.text(110 + i * 70, 125, c, { size: 14, delay: 600 + i * 150 })); await say('Her rakamın bir evi var. Dört, onlar evinde oturuyor. Yani dört onluk: kırk.'); } }),
    model: async ask => {
      D.clear(); ['5', '0', '7'].forEach((c, i) => D.text(110 + i * 70, 80, c, { size: 44, color: [C.red, C.ten, C.one][i], delay: i * 200 })); ['yüzler', 'onlar', 'birler'].forEach((c, i) => D.text(110 + i * 70, 125, c, { size: 14, delay: 600 + i * 150 }));
      await say('Beş yüz yedi. Onlar evinde sıfır var. Sıfır boş evin bekçisidir, yeri tutar.');
      return ask({ q: '507\'de kaç tane yüzlük var?', ans: 5, why: 'yüzler evinde 5 oturuyor.' });
    },
    gen: d => {
      if (d === 1) { const n = R(21, 98); return { kind: 'num', q: `${n} sayısında kaç onluk var?`, ans: Math.floor(n / 10), why: `${n} = ${Math.floor(n / 10)} onluk ${n % 10} birlik.`, bug: x => (x === n % 10 ? 'basamakTers' : x === Math.floor(n / 10) * 10 ? 'rakamDeger' : null), hint: 'Soldaki rakam onlar evinde.' }; }
      if (d === 2) { const n = R(123, 987); const pos = R(0, 2), dig = String(n)[pos], val = Number(dig) * [100, 10, 1][pos]; if (dig === '0') return SK.find(s => s.id === 'basamak').gen(2); return { kind: 'num', q: `${n} sayısındaki <b>${dig}</b> rakamının değeri kaç? (${['yüzler', 'onlar', 'birler'][pos]} basamağında)`, ans: val, why: `${dig}, ${['yüzler', 'onlar', 'birler'][pos]} evinde: ${val}.`, bug: x => (x === Number(dig) && pos < 2 ? 'rakamDeger' : null), hint: 'Rakamın evine bak: yüzler, onlar, birler.' }; }
      const h = R(1, 9), t = chance(.5) ? 0 : R(1, 9), o = t ? 0 : R(1, 9), ans = h * 100 + t * 10 + o;
      return { kind: 'num', q: `${h} yüzlük, ${t} onluk, ${o} birlik hangi sayıdır?`, ans, why: `yüzler ${h}, onlar ${t}, birler ${o}: ${ans}.`, bug: x => (x === Number(`${h}${t || ''}${o || ''}`) && x !== ans ? 'sifirTutucu' : null), hint: 'Her eve bir rakam: boş evlere 0 koy.' };
    },
    sprint: () => { const n = R(101, 999); return { kind: 'num', q: `${n}: kaç yüzlük?`, ans: Math.floor(n / 100) }; }
  });

  add({ id: 'yuvarla', layer: 2, icon: '🎯', name: 'Yuvarlama', tag: 'En yakın onluğa git', needs: ['dogru'],
    predict: () => ({ q: '67 hangi onluğa daha yakın?', choices: ['60', '70'], ans: 1,
      show: async () => { D.clear(); const L = D.nline(60, 70, 30, 330, 120, { tick: 1, lab: 5 }); D.mark(L.pos(67), 120, '67'); await sleep(300); D.brace(L.pos(67), L.pos(70), 135, '3 adım', C.green); await say('Altmış yediden yetmişe üç adım, altmışa yedi adım. Yetmiş daha yakın!'); } }),
    model: async ask => {
      D.clear(); const L = D.nline(40, 50, 30, 330, 120, { tick: 1, lab: 5 }); D.mark(L.pos(45), 120, '45', C.green);
      await say('Kırk beş tam ortada. Anlaşmamız şöyle: ortadaysa yukarı yuvarlarız.');
      return ask({ q: '45 yuvarlanınca kaç olur?', ans: 50, why: 'ortadaki 5 yukarı gider.' });
    },
    gen: d => {
      let n = d < 3 ? between(11, 98, [20, 30, 40, 50, 60, 70, 80, 90]) : R(101, 989); if (n % 10 === 0) n += R(1, 9);
      const ans = Math.round(n / 10) * 10;
      return { kind: 'num', q: `${n} en yakın onluğa yuvarla`, ans, why: `${n}, ${sx(ans, 'dat')} daha yakın.`, bug: x => (x === Math.floor(n / 10) * 10 && n % 10 >= 5 ? 'hepAsagi' : null), hint: 'Birler 5 ya da büyükse yukarı.',
        vis2: () => { D.clear(); const lo = Math.floor(n / 10) * 10; const L = D.nline(lo, lo + 10, 30, 330, 120, { tick: 1, lab: 5 }); D.mark(L.pos(n), 120, String(n)); } };
    },
    sprint: () => { const n = R(11, 99); return { kind: 'num', q: `${n} ≈ ?`, ans: Math.round(n / 10) * 10 }; }
  });

  add({ id: 'dogruIslem', layer: 2, icon: '🛤️', name: 'Doğruda toplama-çıkarma', tag: '38 + 25: önce 20, sonra 5 zıpla', needs: ['zipla10', 'kopru', 'kopruCik'],
    predict: () => ({ q: '38 + 25 için önce 20 zıplamak mı kolay, 5 zıplamak mı?', choices: ['Önce 20', 'Önce 5', 'Fark etmez'], ans: 2,
      show: async () => { D.clear(); const L = D.nline(30, 70, 30, 330, 120, { tick: 10, lab: 10, fs: 13 }); D.mark(L.pos(38), 120, '38'); await sleep(300); D.jump(L.pos(38), L.pos(58), 120, '+20'); await say('İkisi de olur! Ben önce yirmi zıpladım: elli sekiz.'); D.jump(L.pos(58), L.pos(63), 120, '+5', { color: C.ten }); await say('Sonra beş: elli sekizden on köprüsüyle altmış üç. Sayıyı parçalara ayırmak işimizi kolaylaştırır.'); } }),
    model: async ask => {
      D.clear(); const L = D.nline(40, 70, 30, 330, 120, { tick: 10, lab: 10, fs: 13 }); D.text(180, 30, '46 + 27', { size: 22 }); D.mark(L.pos(46), 120, '46');
      await say('Kırk altıya yirmi yedi ekleyeceğiz. Yirmi yediyi parçalayalım: yirmi ve yedi.');
      D.jump(L.pos(46), L.pos(66), 120, '+20');
      const r1 = await ask({ q: '46 + 20 kaç?', ans: 66, why: 'onlar iki arttı.' });
      D.jump(L.pos(66), L.pos(73 > 70 ? 70 : 73), 120, '+7', { color: C.ten });
      const r2 = await ask({ q: '66 + 7 kaç? (10 köprüsü: 66 + 4 + 3)', ans: 73, why: 'altmış altı artı dört yetmiş, artı üç yetmiş üç.' });
      return r1 && r2;
    },
    gen: d => {
      const sub = d === 3 && chance(.5);
      if (sub) { const a = R(41, 95), b = R(12, a - 11), ans = a - b; return { kind: 'num', q: `${a} − ${b} = ?`, ans, why: `${a} − ${Math.floor(b / 10) * 10} = ${a - Math.floor(b / 10) * 10}, sonra − ${b % 10} = ${ans}.`, bug: x => { const wrong = (Math.floor(a / 10) - Math.floor(b / 10)) * 10 + Math.abs(a % 10 - b % 10); return a % 10 < b % 10 && x === wrong ? 'tersCikarma' : null; }, hint: `Önce ${Math.floor(b / 10) * 10} geri, sonra ${b % 10} geri.` }; }
      let a, b; if (d === 1) { a = R(21, 88); b = R(10 - a % 10 || 1, 9); } else if (d === 2) { a = R(21, 69); b = R(11, 29); } else { a = R(25, 69); b = R(15, 29); if (a % 10 + b % 10 < 10) b += 10 - (a % 10 + b % 10); }
      const ans = a + b, noCarry = Math.floor(a / 10) * 10 + Math.floor(b / 10) * 10 + (a % 10 + b % 10) % 10;
      return { kind: 'num', q: `${a} + ${b} = ?`, ans, why: b >= 10 ? `${a} + ${Math.floor(b / 10) * 10} = ${a + Math.floor(b / 10) * 10}, sonra + ${b % 10} = ${ans}.` : `${a} 10'a tamamlanır, kalan eklenir: ${ans}.`, bug: x => (x === noCarry && noCarry !== ans ? 'eldeYok' : null), hint: b >= 10 ? `Önce ${Math.floor(b / 10) * 10} zıpla.` : `${sx(a, 'acc')} önce ${Math.ceil(a / 10) * 10} yap.` };
    },
    sprint: () => { const a = R(21, 79), b = R(11, 19); return { kind: 'num', q: `${a} + ${b}`, ans: a + b }; }
  });

  // ===== ÜST KATLAR (yapım aşamasında) — piramidin tamamını göstermek için
  const FUTURE = [
    [3, ['🧩 Parçala-birleştir', '➖ Çıkarma yolları', '✖️ Eşit gruplar', '🔲 Çarpım ızgarası', '🍰 Paylaştırma']],
    [4, ['🍕 Eşit parça', '📏 Doğruda kesir', '🪞 Denk kesirler', '🔟 Ondalık', '💯 Yüzde']],
    [5, ['⚖️ Terazi', '📦 Bilinmeyen kutu', '🔁 Örüntü', '🧮 Denklem']],
    [6, ['📊 Şerit modeli', '🧠 Çok adımlı problem']]
  ];
  const LAYER = { 1: 'Miktar sezgisi', 2: 'Sayının adresi', 3: 'İşlem esnekliği', 4: 'Parça ve bütün', 5: 'Bilinmeyeni yakala', 6: 'Problem avcısı' };
  const byId = id => SK.find(s => s.id === id);

  // ---------------------------------------------------------------- durum mantığı
  const isOpen = s => s.needs.every(n => st(n).lvl >= 3);
  const isDue = s => st(s.id).lvl >= 3 && st(s.id).due && st(s.id).due <= now();
  function frontier() { return SK.find(s => isOpen(s) && st(s.id).lvl < 3) || null; }
  function dueList() { return SK.filter(isDue).sort((a, b) => st(a.id).due - st(b.id).due); }
  function built(s) { const x = st(s.id); if (x.lvl < 3) { x.lvl = 3; x.rev = 0; x.due = now() + DAY * .9; } save(); }
  function reviewed(s, ok) {
    const x = st(s.id);
    if (ok) { x.rev++; x.crack = 0; x.due = now() + DAY * [3, 7, 21][Math.min(2, x.rev - 1)] * .9; if (x.rev >= 3) x.lvl = 4; }
    else { x.crack = 1; x.rev = Math.max(0, x.rev - 1); x.due = now() + DAY * .5; if (x.lvl === 4) x.lvl = 3; }
    save();
  }

  // ---------------------------------------------------------------- stil
  const css = document.createElement('style');
  css.textContent = `
  .pyr-card{background:linear-gradient(135deg,#fff3dc,#ffe0b8);border:3px solid #ffb44c;border-radius:24px;padding:14px;margin:6px 0 10px;display:flex;gap:12px;align-items:center;box-shadow:var(--shadow);cursor:pointer}
  .pyr-card .big{font-size:46px}
  .pyr-card h2{margin:0;font-size:21px}.pyr-card p{margin:2px 0 0;color:var(--muted);font-size:14px}
  .pyr-wrap{display:flex;flex-direction:column-reverse;align-items:center;gap:6px;margin:8px 0}
  .pyr-row{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
  .pyr-lab{font-size:13px;font-weight:800;color:var(--muted);text-align:center;width:100%;margin-top:-2px}
  .brick{border:none;border-radius:10px;padding:7px 8px;min-width:78px;max-width:118px;font:inherit;font-size:13px;font-weight:800;line-height:1.15;box-shadow:0 4px 0 rgba(0,0,0,.15);background:#eef0f3;color:#8d93a0;cursor:pointer;position:relative}
  .brick .ic{display:block;font-size:22px}
  .brick.open{background:#fff;color:var(--ink);outline:3px dashed #ffb44c;animation:pulse 1.6s infinite}
  .brick.b1,.brick.b2{background:#fff;color:var(--ink);outline:3px solid #ffd28a}
  .brick.b3{background:#2bb3a3;color:#fff}
  .brick.b4{background:linear-gradient(135deg,#ffd54a,#f5a400);color:#5a3a00}
  .brick.crack{outline:3px solid #e8475a}.brick.crack::after{content:"⚡";position:absolute;top:-8px;right:-6px;font-size:16px}
  .brick.due::before{content:"🔁";position:absolute;top:-9px;left:-6px;font-size:15px}
  .brick.future{background:#f4f1ec;color:#b9b2a5;box-shadow:none;cursor:default}
  .pd-top{display:flex;gap:8px;align-items:center;margin:4px 0}
  .pd-steps{display:flex;gap:4px;flex:1}.pd-steps i{flex:1;height:8px;border-radius:4px;background:#e4dccd}.pd-steps i.on{background:var(--pri)}.pd-steps i.done{background:var(--ok)}
  .pd-tutor{display:flex;gap:10px;align-items:flex-start;margin:6px 0}
  .pd-tutor .ani{font-size:44px;line-height:1}
  #pdSay{background:#fff;border-radius:18px;padding:10px 14px;font-size:18px;font-weight:700;box-shadow:var(--shadow);flex:1;min-height:48px}
  #pdSay.pop{animation:sayPop .35s ease}
  @keyframes sayPop{from{transform:scale(.96);opacity:.4}to{transform:scale(1);opacity:1}}
  .pd-board{background:#fdfdfb;border:9px solid #c9ced6;border-radius:14px;box-shadow:inset 0 0 0 2px #eef0f3,0 5px 0 rgba(0,0,0,.1);margin:6px 0 14px}
  .pd-board svg{width:100%;height:auto;display:block}
  .pd-board .kt{font-family:'Kalam','Comic Sans MS',cursive}
  .pd-q{font-size:24px;font-weight:800;text-align:center;margin:6px 0}
  .pd-ch{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
  .pd-ch button{min-width:86px;font:inherit;font-size:22px;font-weight:800;padding:12px 16px;border-radius:16px;background:#fff;box-shadow:0 4px 0 var(--line)}
  .pd-ch button.ok{background:var(--okbg);outline:3px solid var(--ok)}.pd-ch button.bad{background:var(--badbg);outline:3px solid var(--bad)}
  .pd-in{display:flex;gap:6px;justify-content:center;align-items:center;margin:4px 0}
  .pd-in .box{min-width:110px;text-align:center;font-size:30px;font-weight:800;background:#fff;border-radius:14px;padding:4px 12px;border:3px solid var(--line)}
  .pd-pad{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;max-width:440px;margin:6px auto}
  .pd-pad button{font:inherit;font-size:22px;font-weight:800;padding:10px 0;border-radius:12px;background:#fff;box-shadow:0 3px 0 var(--line)}
  .pd-pad .go{grid-column:span 2;background:var(--ok);color:#fff;box-shadow:0 3px 0 #17804a}
  .pd-build{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
  .pd-build button{font:inherit;font-weight:800;font-size:18px;padding:10px 14px;border-radius:12px;background:#fff;box-shadow:0 3px 0 var(--line)}
  .pd-fb{margin:8px 0;padding:10px 12px;border-radius:14px;font-size:16px}
  .pd-fb.ok{background:var(--okbg)}.pd-fb.bad{background:var(--badbg)}.pd-fb.det{background:#fff4d6;border:2px dashed #e0a800}
  .pd-timer{font-size:22px;font-weight:800;text-align:center}`;
  document.head.appendChild(css);

  // ---------------------------------------------------------------- ekranlar
  function pyramid() {
    stopTimer(); Q = null; closeModal(); hush();
    const due = dueList(), fr = frontier();
    let h = `<div class="card" style="text-align:center"><h2 style="margin:0">🔺 Matematik Piramidim</h2>
      <p class="muted" style="margin:4px 0">Her taş bir fikir. Alttaki sağlam olunca üstteki açılır.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;font-size:13px;font-weight:700;margin-top:4px">
      <span>⬜ kilitli</span><span>🟧 sıradaki</span><span style="color:#2bb3a3">■ kuruldu</span><span style="color:#d89200">■ altın</span><span>🔁 tekrar zamanı</span><span>⚡ çatlak</span></div></div>`;
    h += `<button class="btn green" id="pyGo">${due.length ? `🔁 Bugünün tırmanışı (${due.length} tekrar${fr ? ' + yeni taş' : ''})` : fr ? `🧱 Sıradaki taş: ${fr.icon} ${fr.name}` : '🏆 Hepsi kuruldu!'}</button>`;
    h += `<div class="pyr-wrap">`;
    [1, 2].forEach(L => {
      h += `<div class="pyr-row">${SK.filter(s => s.layer === L).map(s => { const x = st(s.id); const cls = x.lvl >= 3 ? 'b' + x.lvl : isOpen(s) ? (x.lvl ? 'b' + x.lvl : 'open') : ''; return `<button class="brick ${cls} ${x.crack ? 'crack' : ''} ${isDue(s) ? 'due' : ''}" data-sk="${s.id}"><span class="ic">${isOpen(s) || x.lvl ? s.icon : '🔒'}</span>${s.name}</button>`; }).join('')}</div><div class="pyr-lab">${L}. kat · ${LAYER[L]}</div>`;
    });
    FUTURE.forEach(([L, list]) => { h += `<div class="pyr-row">${list.map(n => `<span class="brick future"><span class="ic">${n.split(' ')[0]}</span>${n.split(' ').slice(1).join(' ')}</span>`).join('')}</div><div class="pyr-lab">${L}. kat · ${LAYER[L]} <span style="font-weight:600">(yapım aşamasında 🏗️)</span></div>`; });
    h += `</div><button class="btn ghost" id="pyH">🗺️ Haritaya dön</button>`;
    view.innerHTML = h;
    $('pyH').onclick = home;
    $('pyGo').onclick = () => { sndTap(); climb(); };
    view.querySelectorAll('[data-sk]').forEach(b => b.onclick = () => { sndTap(); brickSheet(byId(b.dataset.sk)); });
    window.scrollTo(0, 0);
  }

  function brickSheet(s) {
    const x = st(s.id), open = isOpen(s) || x.lvl;
    if (!open) { const miss = s.needs.filter(n => st(n).lvl < 3).map(n => `${byId(n).icon} ${byId(n).name}`).join(', '); openModal(`<div class="head"><div class="big">🔒</div><h2>${s.name}</h2><p>Bu taş şunların üstüne oturuyor: <b>${miss}</b>. Önce onları kuralım!</p></div><button class="btn" onclick="closeModal()">Tamam</button>`); return; }
    const status = x.lvl >= 4 ? '🥇 Altın taş — zamana dayandı' : x.lvl === 3 ? `🧱 Kuruldu · tekrar ${x.rev}/3${isDue(s) ? ' · tekrar zamanı!' : ''}` : 'Henüz kurulmadı';
    openModal(`<div class="head"><div class="big">${s.icon}</div><h2>${s.name}</h2><p class="muted">${s.tag}</p><p><b>${status}</b>${x.crack ? '<br>⚡ Son tekrarda çatlak bulundu, onaralım.' : ''}</p></div>
      ${x.lvl >= 3 ? `<button class="btn green" id="bsR">🔁 Tekrar et (4 soru)</button><button class="btn blue" id="bsL">📖 Baştan öğren</button><button class="btn" id="bsS">⚡ Hızlanma turu</button>` : `<button class="btn green" id="bsL">🧱 Taşı kur</button>`}
      <button class="btn ghost" onclick="closeModal()">Kapat</button>`);
    $('bsL').onclick = () => { closeModal(); learn(s); };
    if ($('bsR')) $('bsR').onclick = () => { closeModal(); review([s]); };
    if ($('bsS')) $('bsS').onclick = () => { closeModal(); sprint(s, () => pyramid()); };
  }

  // Ortak sahne: üst ilerleme + öğretmen + tahta + etkileşim alanı
  function stage(s, steps, active) {
    view.innerHTML = `<div class="pd-top"><button class="chip" id="pdX" style="font-size:20px">✖</button><div class="pd-steps">${steps.map((n, i) => `<i class="${i < active ? 'done' : i === active ? 'on' : ''}" title="${n}"></i>`).join('')}</div><span class="chip">${s.icon} ${steps[active]}</span></div>
      <div class="pd-tutor"><div class="ani" id="pdAni">🦉</div><div id="pdSay">…</div></div>
      <div class="pd-board"><svg viewBox="0 0 360 210" id="pdBoard"></svg></div>
      <div id="pdArea"></div>`;
    BD = $('pdBoard');
    $('pdX').onclick = () => { hush(); pyramid(); };
    window.scrollTo(0, 0);
  }
  const area = () => $('pdArea');
  let note = ''; // dedektif notu: yeni deneme ekranında da görünsün

  // Cevap alma: sayı tuşları / seçenek / sayı doğrusu / blok kurma. Promise<{ok, val}>
  function askNum(q) {
    return new Promise(res => {
      let v = '';
      area().innerHTML = note + `<div class="pd-q">${q}</div><div class="pd-in"><span class="box" id="pdV">?</span></div>
        <div class="pd-pad">${['1', '2', '3', '4', '5', '⌫', '6', '7', '8', '9', '0'].map(k => `<button data-k="${k}">${k}</button>`).join('')}<button class="go" data-k="OK">Tamam ✔</button></div>`;
      const box = $('pdV'), show = () => { box.textContent = v || '?'; };
      area().querySelectorAll('[data-k]').forEach(b => b.onclick = () => { sndTap(); const k = b.dataset.k; if (k === 'OK') { if (v !== '') { cleanup(); res(Number(v)); } return; } if (k === '⌫') v = v.slice(0, -1); else if (v.length < 4) v += k; show(); });
      const kd = e => { if (!$('pdV')) return cleanup(); if (/^[0-9]$/.test(e.key) && v.length < 4) { v += e.key; show(); } else if (e.key === 'Backspace') { v = v.slice(0, -1); show(); } else if (e.key === 'Enter' && v !== '') { cleanup(); res(Number(v)); } };
      const cleanup = () => document.removeEventListener('keydown', kd);
      document.addEventListener('keydown', kd);
    });
  }
  function askChoice(q, choices) {
    return new Promise(res => {
      area().innerHTML = note + `<div class="pd-q">${q}</div><div class="pd-ch">${choices.map((c, i) => `<button data-i="${i}">${c}</button>`).join('')}</div>`;
      area().querySelectorAll('[data-i]').forEach(b => b.onclick = () => { sndTap(); res(+b.dataset.i); });
    });
  }
  function askLine(p) {
    return new Promise(res => {
      D.clear(); const [a, b] = p.range; const L = D.nline(a, b, 30, 330, 120, { tick: p.tick, lab: p.lab, fs: 13 });
      area().innerHTML = note + `<div class="pd-q">${p.q}</div><p class="muted" style="text-align:center;margin:0">Tahtadaki doğrunun üstüne dokun.</p>`;
      const hit = el('rect', { x: 10, y: 70, width: 340, height: 100, fill: 'transparent', style: 'cursor:pointer' });
      hit.onclick = e => {
        const r = BD.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 360;
        const v = Math.max(a, Math.min(b, Math.round(a + (x - 30) / 300 * (b - a))));
        hit.remove(); D.mark(L.pos(v), 120, String(v), C.ten); res({ v, L });
      };
    });
  }
  function askBuild(p) {
    return new Promise(res => {
      let t = 0, o = 0;
      const draw = () => { D.clear(); D.text(180, 22, `Hedef: ${p.target}`, { size: 20 }); D.blocks(t, o, 30, 40, { u: 11 }); };
      area().innerHTML = `<div class="pd-q">${p.q}</div><div class="pd-build"><button data-b="T">+ onluk 🟦</button><button data-b="O">+ birlik 🟨</button><button data-b="t">− onluk</button><button data-b="o">− birlik</button></div><button class="btn green" id="pdBOk" style="margin-top:8px">Kurdum ✔</button>`;
      draw();
      area().querySelectorAll('[data-b]').forEach(b => b.onclick = () => { sndTap(); const k = b.dataset.b; if (k === 'T' && t < 9) t++; if (k === 'O' && o < 19) o++; if (k === 't' && t) t--; if (k === 'o' && o) o--; draw(); });
      $('pdBOk').onclick = () => res({ t, o, v: t * 10 + o });
    });
  }
  // Dokun: çerçevedeki boş kutulara dokunarak nokta ekle/çıkar (matematik bir eylem olsun)
  function askFill(p) {
    return new Promise(res => {
      D.clear(); if (p.title) D.text(180, 24, p.title, { size: 18 });
      const f = D.frame(p.start, 95, 50); let added = [];
      const redraw = () => { added.forEach(a => a.el.remove()); added = added.map(a => ({ i: a.i, el: D.dot(f.cells[a.i][0], f.cells[a.i][1], { r: f.s * .3, color: C.ten }) })); };
      f.cells.forEach(([x, y], i) => {
        if (i < p.start) return;
        const hit = el('rect', { x: x - f.s / 2, y: y - f.s / 2, width: f.s, height: f.s, fill: 'transparent', style: 'cursor:pointer' });
        hit.onclick = () => { sndTap(); const k = added.findIndex(a => a.i === i); if (k >= 0) { added[k].el.remove(); added.splice(k, 1); } else added.push({ i, el: D.dot(x, y, { r: f.s * .3, color: C.ten }) }); };
      });
      area().innerHTML = `<div class="pd-q">${p.q}</div><p class="muted" style="text-align:center;margin:0">Boş kutulara dokunarak nokta ekle (tekrar dokunursan çıkar).</p><button class="btn green" id="pdFOk" style="margin-top:8px">Bitti ✔</button>`;
      $('pdFOk').onclick = () => res(added.length);
    });
  }
  async function flashShow(n, ms) { D.clear(); D.dots(n, 180, 105, { rows: n > 5 }); await sleep(ms); D.clear(); D.text(180, 110, '?', { size: 60, color: C.gray }); }

  // Bir problemi sor + hata dedektifi + ipucu merdiveni. Döner: {ok, first, mis}
  async function pose(p, opt = {}) {
    let tries = 0, mis = null;
    window.__pd = p; // test kancası (otomatik denemeler için)
    note = '';
    while (true) {
      if (p.kind === 'flash' && tries === 0) await flashShow(p.n, p.flash || 1200);
      else if (p.vis && tries === 0) p.vis();
      let val, ok;
      if (p.kind === 'choice' || p.kind === 'flash') { const i = await askChoice(p.q, p.choices.map(String)); val = p.kind === 'flash' ? Number(p.choices[i]) : i; ok = p.kind === 'flash' ? val === p.ans : i === p.ans; }
      else if (p.kind === 'line') { const r = await askLine(p); val = r.v; ok = Math.abs(r.v - p.ans) <= (p.tol || 0); if (!ok || true) D.mark(r.L.pos(p.ans), 120, ok ? '' : String(p.ans), C.green); }
      else if (p.kind === 'fill') { val = await askFill(p); ok = val === p.ans; }
      else if (p.kind === 'build') { const r = await askBuild(p); val = r.v; ok = r.v === p.target && r.o < 10; if (!ok && p.bugBuild) mis = p.bugBuild(r.t, r.o); if (r.v === p.target && r.o >= 10) mis = 'yanYana'; }
      else { val = await askNum(p.q); ok = val === p.ans; }
      if (ok) { if (!opt.quiet) { sndOk(); await say(gen(TALK.right) + (p.why && !opt.fast ? ' ' + gen(TALK.rightWhy, { why: p.why }) : '')); } return { ok: true, first: tries === 0, mis }; }
      sndBad(); tries++;
      if (!mis && p.bug) mis = p.bug(val);
      if (opt.fast) { await say(`Doğrusu ${p.kind === 'choice' ? p.choices[p.ans] : p.ans}.`, 700); return { ok: false, first: false, mis }; }
      if (tries === 1) {
        if (mis && MIS[mis]) { note = `<div class="pd-fb det">🔍 <b>Dedektif:</b> ${MIS[mis].what}</div>`; area().insertAdjacentHTML('afterbegin', note); await say('🔍 ' + MIS[mis].what); }
        else await say(gen(TALK.wrong) + ' ' + gen(TALK.hint1, { q: p.hint || 'Tahtaya bir daha bak.' }));
        if (p.vis2) p.vis2();
        continue;
      }
      // ikinci yanlış: tahtada çözümü göster, anlat
      if (p.vis2) p.vis2();
      const ansTxt = p.kind === 'choice' ? p.choices[p.ans] : p.ans;
      await say(`Birlikte bakalım: ${p.why ? p.why : ''} Cevap ${ansTxt}.`);
      note = ''; return { ok: false, first: false, mis };
    }
  }

  // ---------------------------------------------------------------- öğrenme akışı (4 adım)
  const STEPS = ['Tahmin', 'Çiz', 'Yaz', 'Hızlan'];
  async function learn(s, then) {
    const x = st(s.id); x.seen++;
    // 1) TAHMİN
    stage(s, STEPS, 0);
    await say(gen(TALK.open, { skill: s.name }));
    const pr = s.predict();
    await say(gen(TALK.predict));
    const i = await askChoice(pr.q, pr.choices);
    const good = i === pr.ans;
    area().innerHTML = `<div class="pd-fb ${good ? 'ok' : 'bad'}">${good ? '🎯 ' : '🤔 '}${pr.choices[pr.ans]}</div>`;
    await say(gen(good ? TALK.predOk : TALK.predNo));
    await pr.show();
    if (x.lvl < 1) x.lvl = 1; save();
    await nextBtn('Çizmeye geçelim ✏️');
    // 2) ÇİZ (öğretmen çizer, arada çocuğa sorar)
    stage(s, STEPS, 1);
    await say(gen(TALK.draw));
    let guidedOk = true;
    await s.model(async a => { await say(gen(TALK.yourTurn)); const r = await pose({ kind: a.choices ? 'choice' : 'num', ...a }, {}); guidedOk = guidedOk && r.ok; return r.ok; });
    if (x.lvl < 2) x.lvl = 2; save();
    await nextBtn('Şimdi ben yazayım ✍️');
    // 3) YAZ — uyarlanır zorluk, 8 soru, hedef 5 ilk denemede doğru (olmazsa yalnızca bu adım tekrarlanır)
    let tryN = 0;
    while (true) {
    stage(s, STEPS, 2);
    await say(tryN ? 'Bir tur daha yazalım. Bu sefer resmi aklında tut.' : gen(TALK.practice));
    let d = 1, okN = 0, streak = 0, total = 0;
    for (let k = 0; k < 8; k++) {
      total++;
      const p = s.gen(d);
      const r = await pose(p);
      if (r.ok && r.first) { okN++; streak++; if (streak >= 2 && d < 3) { d++; streak = 0; } if (streak === 0 && okN >= 3 && chance(.4)) await say(gen(TALK.streak, { k: okN })); }
      else { streak = 0; d = Math.max(1, d - 1); }
      if (r.mis && MIS[r.mis] && MIS[r.mis].fix !== s.id && byId(MIS[r.mis].fix) && st(MIS[r.mis].fix).lvl >= 1) {
        const fx = byId(MIS[r.mis].fix);
        const go = await askChoice(gen(TALK.crack, { what: MIS[r.mis].what }), [`🔧 ${fx.icon} ${fx.name} taşını onar`, 'Devam et']);
        if (go === 0) { await repair(fx); stage(s, STEPS, 2); await say('Çatlak onarıldı! Kaldığımız yerden devam.'); }
      }
      x.right += r.ok ? 1 : 0;
      area().innerHTML = '';
    }
    award(okN * 4 + 5, total, okN);
    if (okN >= 5) break;
    tryN++;
    area().innerHTML = `<div class="pd-fb bad">${okN}/8 ilk denemede doğru. Taşın oturması için 5 gerekiyor.</div>`;
    await say(`Sekizde ${okN} doğru. Taş henüz oturmadı ama beynin çok çalıştı. ${tryN >= 2 ? 'İstersen tahtadaki çizime bir daha bakalım.' : 'Bir tur daha, bu sefer daha kolay gelecek.'}`);
    if (tryN >= 2) { const c = await askChoice('Ne yapalım?', ['✏️ Çizimi tekrar izle', '🔁 Yazmaya devam', '🔺 Sonra devam ederim']); if (c === 2) return pyramid(); if (c === 0) { stage(s, STEPS, 1); await s.model(async a => { const r = await pose({ kind: 'num', ...a }); return r.ok; }); } }
    else await nextBtn('Tekrar dene 🔁');
    }
    // Taş kuruldu (hız şart değil — süre baskısı kaygı yaratmasın)
    built(s); sndWin(); confetti(['🧱', '⭐', s.icon]);
    // 4) HIZLAN — isteğe bağlı
    stage(s, STEPS, 3);
    D.clear(); D.text(180, 90, '🧱', { size: 70 }); D.text(180, 160, `${s.name} kuruldu!`, { size: 22, color: C.green });
    await say(gen(TALK.built) + ' İstersen kısa bir hızlanma oyunu oynayabiliriz, istemezsen piramide döneriz.');
    const sp = await askChoice('⚡ 40 saniyelik hızlanma oyunu?', ['Oynayalım ⚡', 'Şimdilik yeter 🔺']);
    if (sp === 0) await sprint(s, null, true);
    await nextBtn('Piramide dön 🔺');
    (then || pyramid)();
  }
  function nextBtn(label) { return new Promise(res => { area().insertAdjacentHTML('beforeend', `<button class="btn" id="pdNext">${label}</button>`); $('pdNext').onclick = () => { sndTap(); hush(); res(); }; }); }

  // Hızlanma: 40 sn; hedef 6 doğru
  async function sprint(s, then, inFlow) {
    if (!inFlow) { stage(s, ['Hızlan'], 0); await say(gen(TALK.sprint)); }
    let left = 40, okN = 0, n = 0, end = false;
    area().innerHTML = '';
    const tm = document.createElement('div'); tm.className = 'pd-timer'; area().before(tm);
    const iv = setInterval(() => { left--; tm.textContent = `⏱ ${left} sn · ✔️ ${okN}`; if (left <= 0) { end = true; clearInterval(iv); } }, 1000);
    tm.textContent = `⏱ ${left} sn · ✔️ ${okN}`;
    while (!end) { const r = await pose(s.sprint(), { fast: true, quiet: true }); n++; if (r.ok) { okN++; floatText('+1'); sndOk(); } tm.textContent = `⏱ ${left} sn · ✔️ ${okN}`; if (!$('pdArea')) { clearInterval(iv); return; } }
    tm.remove();
    const x = st(s.id); x.fast = Math.max(x.fast, okN);
    award(okN * 2, n, okN);
    area().innerHTML = `<div class="pd-fb ok">⚡ 40 saniyede ${okN} doğru! ${okN >= 6 ? 'Akıcısın!' : 'Hızın her gün artacak.'}</div>`;
    await say(okN >= 6 ? `Kırk saniyede ${okN} doğru! Bu taş artık elinin altında.` : `${okN} doğru. Hız önemli değil, doğruluk önemli; hız zamanla gelir.`);
    if (then) { await nextBtn('Devam ▶'); then(); }
  }

  // Çatlak onarımı: kısa model + 3 soru
  async function repair(s) {
    stage(s, ['Onarım'], 0);
    await say(`${s.name} taşına indik. Kısaca hatırlayalım.`);
    await s.model(async a => { const r = await pose({ kind: 'num', ...a }); return r.ok; });
    let okN = 0;
    for (let k = 0; k < 3; k++) { const r = await pose(s.gen(1 + Math.min(k, 1))); if (r.ok && r.first) okN++; area().innerHTML = ''; }
    reviewed(s, okN >= 2);
    award(okN * 3, 3, okN);
  }

  // Tekrar oturumu: her taştan 4 karışık soru (aralıklı tekrar)
  async function review(list, then) {
    for (const s of list) {
      stage(s, ['Tekrar'], 0);
      await say(gen(TALK.review) + ' ' + s.name + '.');
      let okN = 0;
      for (let k = 0; k < 4; k++) { const r = await pose(s.gen(R(1, 3))); if (r.ok && r.first) okN++; area().innerHTML = ''; }
      const pass = okN >= 3; reviewed(s, pass); award(okN * 3, 4, okN);
      if (pass && st(s.id).lvl === 4) { sndWin(); confetti(['🥇', '⭐']); await say(gen(TALK.gold)); }
      else if (pass) await say(`Dörtte ${okN}. Taş sağlam! Bir sonraki tekrar birkaç gün sonra.`);
      else await say(`Dörtte ${okN}. Bu taşta küçük bir çatlak var, yarın tekrar bakacağız. Hatırlamak için tam zamanı.`);
      await nextBtn('Devam ▶');
    }
    (then || pyramid)();
  }

  // Bugünün tırmanışı: önce vadesi gelen tekrarlar (en çok 3), sonra sıradaki yeni taş
  async function climb() {
    const due = dueList().slice(0, 3), fr = frontier();
    if (due.length) await new Promise(r => review(due, r));
    if (fr) return learn(fr);
    pyramid();
  }

  // ---------------------------------------------------------------- haritaya giriş kartı
  const _home = home;
  home = function () {
    _home();
    if ($('pyrCard')) return;
    const due = dueList().length, fr = frontier(), builtN = SK.filter(s => st(s.id).lvl >= 3).length;
    const hello = view.querySelector('.hello');
    const card = `<div class="pyr-card" id="pyrCard"><div class="big">🔺</div><div style="flex:1"><h2>Matematik Piramidim</h2>
      <p>${builtN}/${SK.length} taş kuruldu${due ? ` · 🔁 ${due} tekrar bekliyor` : ''}${fr ? ` · Sıradaki: ${fr.icon} ${fr.name}` : ''}</p></div><button class="btn green" style="width:auto;margin:0;padding:10px 16px">Tırman ▶</button></div>`;
    if (hello) hello.insertAdjacentHTML('afterend', card); else view.insertAdjacentHTML('afterbegin', card);
    $('pyrCard').onclick = () => { sndTap(); pyramid(); };
  };
  const _stop = stopTimer;
  stopTimer = function () { hush(); _stop(); };
  window.pyramid = pyramid; window.PYR_SK = SK;
  home();
})();
