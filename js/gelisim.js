'use strict';
/* =========================================================
   Gelişim grafiği
   - Her bitirilen turda o güne ait puan / soru / doğru sayısı S.hist içine yazılır (son 60 gün, bulutla senkron).
   - "📈 Gelişimim" ekranı: özet kutucuklar, son 14 günün puanı, günlük doğruluk,
     sınıflara göre ilerleme, en çok zorlanılan ve en güçlü konular.
   (en son yüklenir)
   ========================================================= */
(function () {
  const AY = [T('Oca'), T('Şub'), T('Mar'), T('Nis'), T('May'), T('Haz'), T('Tem'), T('Ağu'), T('Eyl'), T('Eki'), T('Kas'), T('Ara')];
  const GUN = [T('Paz'), T('Pzt'), T('Sal'), T('Çar'), T('Per'), T('Cum'), T('Cmt')];
  const dkey = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); // app.js today() ile aynı biçim
  const C = { bar: '#3d8bff', barNow: '#1f5fc4', grid: T('#ece7de'), axis: '#d8d0c2', ok: '#22a861' };

  // ---------- veriyi kaydet ----------
  const _finish = finish;
  finish = function () {
    const q = Q, before = S.xp || 0;
    _finish();
    if (!q) return;
    const k = today(); S.hist = S.hist || {};
    const h = S.hist[k] || (S.hist[k] = { x: 0, q: 0, c: 0 });
    h.x += Math.max(0, (S.xp || 0) - before);
    h.q += q.mode === 'speed' ? q.n : q.total;
    h.c += q.correct;
    const keep = new Set(lastDays(60).map(d => d.k));
    Object.keys(S.hist).forEach(x => { if (!keep.has(x)) delete S.hist[x]; });
    save();
  };

  function lastDays(n) {
    const out = [], d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n + 1);
    for (let i = 0; i < n; i++) { out.push({ k: dkey(d), day: d.getDate(), mon: d.getMonth(), wd: d.getDay() }); d.setDate(d.getDate() + 1); }
    return out;
  }

  // ---------- stil ----------
  const css = document.createElement('style');
  css.textContent = `
  .gtiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:8px 0}
  .gtile{background:#fff;border-radius:18px;padding:10px 12px;box-shadow:var(--shadow)}
  .gtile small{display:block;color:var(--muted);font-size:14px;font-weight:700}
  .gtile b{font-size:28px;line-height:1.2}
  .gchart{position:relative}
  .gchart h3,.gsec h3{margin:0 0 2px;font-size:19px}
  .gchart p.muted,.gsec p.muted{margin:0 0 6px;font-size:14px}
  .gchart svg{width:100%;max-width:560px;margin:0 auto;height:auto;display:block;overflow:visible}
  .gchart text{font-family:inherit;fill:#7c7686;font-size:11px}
  .gchart text.v{fill:#2d2a32;font-weight:800;font-size:12px}
  .gtip{position:absolute;pointer-events:none;background:#2d2a32;color:#fff;border-radius:10px;padding:6px 10px;font-size:14px;line-height:1.35;
    white-space:nowrap;transform:translate(-50%,-100%);display:none;z-index:2;box-shadow:0 4px 10px rgba(0,0,0,.2)}
  .grow{display:grid;grid-template-columns:minmax(92px,34%) 1fr auto;gap:8px;align-items:center;margin:7px 0;font-size:15px}
  .grow .tr{height:14px;background:#f3eee5;border-radius:7px;overflow:hidden}
  .grow .tr i{display:block;height:100%;border-radius:7px;background:${C.bar}}
  .grow .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}
  .grow .vl{font-weight:800;min-width:54px;text-align:right}
  @media (max-width:480px){.grow{grid-template-columns:1fr auto;row-gap:2px}.grow .nm{grid-column:1/-1;white-space:normal}}
  .gtopic{cursor:pointer;border-radius:10px;padding:2px 4px;margin:4px -4px}
  .gtopic:hover{background:#fff6e5}`;
  document.head.appendChild(css);

  // ---------- SVG sütun / çizgi grafikleri ----------
  // Tek seri: lejant yok, başlık neyi gösterdiğini söyler. Sayı yalnız en yüksek ve bugünkü sütunda.
  function barChart(days) {
    const W = 340, H = 170, L = 26, R = 6, TP = 18, B = 22, n = days.length;
    const max = Math.max(10, ...days.map(d => d.x));
    const step = niceStep(max), top = Math.ceil(max / step) * step;
    const cw = (W - L - R) / n, bw = Math.max(6, cw - 6), y = v => TP + (H - TP - B) * (1 - v / top);
    let g = '';
    for (let v = 0; v <= top; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${v ? C.grid : C.axis}" stroke-width="1"/><text x="${L - 4}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
    const maxI = days.reduce((m, d, i) => d.x > days[m].x ? i : m, 0);
    days.forEach((d, i) => {
      const x = L + i * cw + (cw - bw) / 2, last = i === n - 1;
      if (d.x > 0) {
        const yy = y(d.x), h = y(0) - yy, r = Math.min(4, h, bw / 2);
        g += `<path d="M${x},${y(0)}V${yy + r}Q${x},${yy} ${x + r},${yy}H${x + bw - r}Q${x + bw},${yy} ${x + bw},${yy + r}V${y(0)}Z" fill="${last ? C.barNow : C.bar}"/>`;
        if (i === maxI || last) g += `<text class="v" x="${x + bw / 2}" y="${yy - 5}" text-anchor="middle">${d.x}</text>`;
      }
      if (i % 2 === (n - 1) % 2) g += `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle" ${last ? 'style="font-weight:800;fill:#2d2a32"' : ''}>${last ? T('Bugün') : d.day}</text>`;
      g += `<rect data-i="${i}" x="${L + i * cw}" y="${TP - 10}" width="${cw}" height="${H - TP - B + 10}" fill="transparent"/>`;
    });
    return { svg: `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Son ${n} günde kazanılan puan">${g}</svg>`, tipX: i => (L + i * cw + cw / 2) / W, tipY: i => y(days[i].x) / H };
  }
  function lineChart(days) {
    const W = 340, H = 150, L = 30, R = 8, TP = 14, B = 22, n = days.length;
    const cw = (W - L - R) / (n - 1), x = i => L + i * cw, y = v => TP + (H - TP - B) * (1 - v / 100);
    let g = '';
    [0, 50, 100].forEach(v => g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${v ? C.grid : C.axis}"/><text x="${L - 4}" y="${y(v) + 4}" text-anchor="end">%${v}</text>`);
    g += `<line x1="${L}" x2="${W - R}" y1="${y(70)}" y2="${y(70)}" stroke="${C.ok}" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${W - R}" y="${y(70) - 4}" text-anchor="end" style="fill:${C.ok};font-weight:700">hedef %70</text>`;
    const pts = days.map((d, i) => d.q ? [x(i), y(d.acc), i] : null);
    let path = '', pen = false;
    pts.forEach(p => { if (!p) { pen = false; return; } path += (pen ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); pen = true; });
    // Aradaki boş günleri ince kesikli çizgiyle bağla ki gidişat görünsün
    const real = pts.filter(Boolean);
    let gaps = '';
    for (let j = 1; j < real.length; j++) if (real[j][2] - real[j - 1][2] > 1) gaps += `M${real[j - 1][0]},${real[j - 1][1]}L${real[j][0]},${real[j][1]}`;
    if (gaps) g += `<path d="${gaps}" fill="none" stroke="${C.bar}" stroke-width="1.5" stroke-dasharray="3 4" opacity=".6"/>`;
    if (path) g += `<path d="${path}" fill="none" stroke="${C.bar}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    real.forEach(p => g += `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="${p[2] === n - 1 ? C.barNow : C.bar}" stroke="#fff" stroke-width="2"/>`);
    days.forEach((d, i) => {
      const last = i === n - 1;
      if (i % 2 === (n - 1) % 2) g += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle" ${last ? 'style="font-weight:800;fill:#2d2a32"' : ''}>${last ? T('Bugün') : d.day}</text>`;
      g += `<rect data-i="${i}" x="${x(i) - cw / 2}" y="${TP - 10}" width="${cw}" height="${H - TP - B + 10}" fill="transparent"/>`;
    });
    return { svg: `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Günlük doğruluk yüzdesi">${g}</svg>`, tipX: i => x(i) / W, tipY: i => (days[i].q ? y(days[i].acc) : y(50)) / H };
  }
  function niceStep(max) { const raw = max / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }

  // Dokun / üzerine gel: o günün ayrıntısı
  function tips(box, days, ch) {
    const tip = box.querySelector('.gtip'), svg = box.querySelector('svg');
    const show = i => {
      const d = days[i], r = svg.getBoundingClientRect(), b = box.getBoundingClientRect();
      tip.innerHTML = `<b>${GUN[d.wd]} ${d.day} ${AY[d.mon]}</b><br>` + (d.q ? T`⭐ ${d.x} puan · ${d.q} soru<br>✔️ ${d.c} doğru (%${d.acc})` : T('Bu gün çalışılmadı'));
      tip.style.display = 'block';
      tip.style.left = Math.min(b.width - 80, Math.max(80, r.left - b.left + ch.tipX(i) * r.width)) + 'px';
      tip.style.top = (r.top - b.top + ch.tipY(i) * r.height - 8) + 'px';
    };
    svg.querySelectorAll('rect[data-i]').forEach(rc => {
      rc.addEventListener('pointerenter', () => show(+rc.dataset.i));
      rc.addEventListener('click', () => show(+rc.dataset.i));
    });
    svg.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') tip.style.display = 'none'; });
  }

  // ---------- ekran ----------
  function gelisim() {
    stopTimer(); Q = null; closeModal();
    const days = lastDays(14).map(d => { const h = (S.hist || {})[d.k] || { x: 0, q: 0, c: 0 }; return { ...d, ...h, acc: h.q ? Math.round(h.c / h.q * 100) : 0 }; });
    const tot = TOPICS.reduce((a, t) => { const s = S.stats[t.id] || { c: 0, w: 0 }; a.c += s.c; a.w += s.w; return a; }, { c: 0, w: 0 });
    const n = tot.c + tot.w, animals = TOPICS.filter(t => S.stars[t.id] >= 1).length;
    const wk = days.slice(7).reduce((a, d) => a + d.x, 0), prevWk = days.slice(0, 7).reduce((a, d) => a + d.x, 0);
    const hasHist = days.some(d => d.q);
    const trend = !hasHist ? '' : prevWk && wk > prevWk ? T`📈 Bu hafta geçen haftadan <b>%${Math.round((wk / prevWk - 1) * 100)}</b> daha fazla puan topladın!` :
      prevWk && wk < prevWk ? T`Bu hafta ${wk} ⭐, geçen hafta ${prevWk} ⭐. Biraz daha çalışırsan geçersin! 💪` : T`Bu hafta ${wk} ⭐ topladın. Harika gidiyorsun! 🚀`;

    let h = T`<div class="card" style="text-align:center"><h2 style="margin:0">📈 Gelişimim</h2><p class="muted" style="margin:4px 0">${esc(S.name)}, matematikte ne kadar ilerlediğine bak!</p></div>
    <div class="gtiles">
      <div class="gtile"><small>Toplam puan</small><b>⭐ ${S.xp}</b></div>
      <div class="gtile"><small>Çözülen soru</small><b>✏️ ${n}</b></div>
      <div class="gtile"><small>Doğruluk</small><b>🎯 ${n ? '%' + Math.round(tot.c / n * 100) : '–'}</b></div>
      <div class="gtile"><small>Günlük seri</small><b>🔥 ${streakNow()}</b></div>
      <div class="gtile"><small>Kurtarılan hayvan</small><b>🐾 ${animals}/${TOPICS.length}</b></div>
    </div>`;
    if (hasHist) {
      h += T`<div class="card gchart" id="gc1"><h3>Son 14 günde kazandığın ⭐</h3><p class="muted">${trend}</p><div class="gtip"></div></div>
      <div class="card gchart" id="gc2"><h3>Günlük doğruluk</h3><p class="muted">Yeşil kesikli çizginin (%70) üstünde kalmaya çalış. Bir güne dokun, ayrıntısını gör.</p><div class="gtip"></div></div>`;
    } else {
      h += T`<div class="card" style="text-align:center"><div style="font-size:42px">📊</div><h3 style="margin:4px 0">Grafiklerin bugünden itibaren dolacak</h3>
        <p class="muted" style="margin:0">Her bitirdiğin alıştırma burada bir sütun olacak. Hadi ilk sütunu birlikte dikelim!</p></div>`;
    }
    // sınıflara göre ilerleme
    h += T`<div class="card gsec"><h3>Sınıflara göre ilerleme</h3><p class="muted">Her konu en fazla 3 ⭐ verir.</p>`;
    REGIONS.forEach((r, ri) => {
      const ts = TOPICS.filter(t => t.region === ri); if (!ts.length) return;
      const got = ts.reduce((a, t) => a + (S.stars[t.id] || 0), 0), all = ts.length * 3;
      h += `<div class="grow"><span class="nm" title="${esc(r.name)}">${r.emoji} ${esc(r.name)}${r.grade ? ` <small class="muted">${r.grade}</small>` : ''}</span><span class="tr"><i style="width:${got / all * 100}%"></i></span><span class="vl">${got}/${all}</span></div>`;
    });
    h += `</div>`;
    // konular
    const rated = TOPICS.map((t, i) => { const s = S.stats[t.id] || { c: 0, w: 0 }, q = s.c + s.w; return { t, i, q, acc: q ? Math.round(s.c / q * 100) : 0 }; }).filter(x => x.q >= 5);
    const row = x => `<div class="grow gtopic" data-ti="${x.i}"><span class="nm">${x.t.emoji} ${esc(x.t.name)}</span><span class="tr"><i style="width:${x.acc}%;background:${C.bar}"></i></span><span class="vl">${x.acc < 70 ? '⚠️ ' : '✅ '}%${x.acc}</span></div>`;
    if (rated.length) {
      const weak = rated.filter(x => x.acc < 85).sort((a, b) => a.acc - b.acc).slice(0, 5);
      const strong = rated.filter(x => !weak.includes(x)).sort((a, b) => b.acc - a.acc).slice(0, 3);
      if (weak.length) h += T`<div class="card gsec"><h3>🎯 Biraz daha çalışmalı</h3><p class="muted">Doğruluğu en düşük konular. Dokun, hemen çalış! (⚠️ = %70'in altı)</p>${weak.map(row).join('')}</div>`;
      if (strong.length) h += T`<div class="card gsec"><h3>💪 En güçlü olduğun konular</h3>${strong.map(row).join('')}</div>`;
    } else h += T`<div class="card muted" style="font-size:15px">Bir konuda en az 5 soru çözünce güçlü ve zayıf yanların burada görünecek.</div>`;
    h += T`<button class="btn ghost" id="gH">🗺️ Haritaya dön</button>`;
    view.innerHTML = h;

    if (hasHist) {
      const c1 = barChart(days), c2 = lineChart(days);
      $('gc1').insertAdjacentHTML('beforeend', c1.svg); tips($('gc1'), days, c1);
      $('gc2').insertAdjacentHTML('beforeend', c2.svg); tips($('gc2'), days, c2);
    }
    view.querySelectorAll('[data-ti]').forEach(e => e.onclick = () => { sndTap(); topicSheet(+e.dataset.ti); });
    $('gH').onclick = home;
    window.scrollTo(0, 0);
  }
  window.gelisim = gelisim;

  // ---------- giriş düğmeleri ----------
  const _home = home;
  home = function () {
    _home();
    const mb = view.querySelector('.mapbtns'); if (!mb || $('mGel')) return;
    mb.insertAdjacentHTML('beforeend', T`<button class="btn green" id="mGel" style="grid-column:1/-1">📈 Gelişimim</button>`);
    $('mGel').onclick = () => { sndTap(); gelisim(); };
  };
  const _settings = settings;
  settings = function () {
    _settings();
    const tbl = document.querySelector('#sheet table.st'); if (!tbl) return;
    tbl.insertAdjacentHTML('beforebegin', T`<button class="btn green" id="sGel" style="margin:6px 0">📈 Gelişim grafiklerini aç</button>`);
    $('sGel').onclick = gelisim;
  };
  $('btnSet').onclick = settings;
  home();
})();
