'use strict';
/* =========================================================
   Hata takibi & Güçlendirme
   - Her yanlış, o konu + zorluk seviyesini "zayıf nokta" olarak kaydeder.
   - Alıştırmada yanlıştan hemen sonra benzer bir soru gelir (puanı etkilemez).
   - Zayıf nokta, 3 kez üst üste (ipucusuz, ilk denemede) doğru yapılınca silinir.
   - Haritada "Güçlendirme" kartı ve 🎯 modu: sadece zayıf noktalardan soru sorar.
   (app.js, temel.js, ileri.js'ten sonra yüklenir)
   ========================================================= */
(function () {
  const NEED = 3, MAXEXTRA = 3, LV = ['', T('Kolay'), T('Orta'), T('Zor')];
  const W = () => S.weak || (S.weak = {});
  const idx = id => TOPICS.findIndex(t => t.id === id);
  const dotsOf = s => '🟢'.repeat(s) + '⚪'.repeat(NEED - s);
  function weakList() {
    return Object.entries(W()).map(([k, v]) => { const [id, d] = k.split(':'), i = idx(id); return i < 0 ? null : { k, i, t: TOPICS[i], d: +d, s: v.s, m: v.m }; })
      .filter(Boolean).sort((a, b) => b.m - a.m || a.i - b.i);
  }

  const css = document.createElement('style');
  css.textContent = `.weak{border:4px solid var(--pri);animation:glow 2s infinite}
  @keyframes glow{50%{box-shadow:0 6px 0 rgba(0,0,0,.08),0 0 0 6px rgba(255,138,61,.25)}}
  .wchips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 2px}.wchips .chip{font-size:14px;white-space:normal}
  .peek .lesson{min-height:0;box-shadow:none;border:3px solid var(--line)}`;
  document.head.appendChild(css);

  // Dersi soruyu bırakmadan, açılır pencerede tekrar göster
  function lessonPeek(i) {
    const t = TOPICS[i];
    openModal(T`<div class="peek"><div class="head"><div class="big">${t.emoji}</div><h2>${t.name}</h2><p class="muted">${t.animal} tekrar anlatıyor</p></div>
      ${t.lesson.map(([h, b]) => `<div class="card lesson"><h3>${h}</h3><div class="body">${b}</div></div>`).join('')}
      <button class="btn green" onclick="closeModal()">Anladım, soruya dön ✔</button></div>`);
  }

  function mastered(t, d) {
    sndWin(); confetti([t.emoji, '💪', '⭐']);
    if (Q) (Q.mastered = Q.mastered || []).push(`${t.emoji} ${t.name} (${LV[d]})`);
  }

  const _nextQ = nextQ, _diffFor = diffFor, _topicFor = topicFor, _outcome = outcome, _finish = finish, _home = home, _topicSheet = topicSheet;

  topicFor = function () {
    if (Q.forced) return Q.forced.ti;
    if (Q.mode === 'fix') {
      const L = weakList(); let w = pick(L);
      if (L.length > 1 && w.k === Q.lastKey) w = pick(L.filter(x => x.k !== Q.lastKey));
      Q.lastKey = w.k; Q.fixD = w.d; return w.i;
    }
    return _topicFor();
  };
  diffFor = function () {
    const d = Q.forced ? Q.forced.d : Q.mode === 'fix' ? Q.fixD : _diffFor();
    Q.curD = d; return d;
  };

  nextQ = function () {
    if (Q && Q.mode === 'fix' && !Q.forced && !weakList().length) return finish();
    const forced = !!(Q && Q.forced);
    _nextQ();
    if (!Q || !Q.cur) return;
    Q.cur.d = Q.curD; Q.cur.extra = forced && Q.mode !== 'fix'; Q.forced = null;
    const t = TOPICS[Q.cur.ti], w = W()[t.id + ':' + Q.cur.d], say = $('say');
    if (!say) return;
    if (forced) say.innerHTML = T('💪 <b>Benzer bir soru!</b> Az önceki çözümü hatırla, bu sefer yaparsın!');
    else if (Q.mode === 'fix') say.innerHTML = T`🎯 <b>${t.name}</b> · ${LV[Q.cur.d]}<br>Öğrenmek için ${NEED} kez üst üste doğru: ${dotsOf(w ? w.s : 0)}`;
    else if (w && Q.mode !== 'speed') say.innerHTML = T`🎯 Burada daha önce zorlanmıştın, dikkatlice oku! ${dotsOf(w.s)}`;
  };

  outcome = function (ok, paint) {
    const q = Q.cur, mode = Q.mode, firstTry = q.tries === 0, before = { p: Q.pts, c: Q.correct, f: Q.first };
    _outcome(ok, paint);
    const t = TOPICS[q.ti], key = t.id + ':' + q.d, w = W(), fbx = $('fbx'), nx = $('nx');
    const note = (cls, html) => { if (!fbx || mode === 'speed') return null; const el = document.createElement('div'); el.className = 'fb ' + cls; el.innerHTML = html; nx ? fbx.insertBefore(el, nx) : fbx.appendChild(el); return el; };

    if (!ok) {
      const e = w[key] || { s: 0, m: 0 }; e.s = 0; e.m++; w[key] = e;
    } else if (q.done && w[key]) {
      if (firstTry && !q.hint) {
        w[key].s++;
        if (w[key].s >= NEED) { delete w[key]; mastered(t, q.d); note('ok', T`<b class="t">💪 Bunu artık öğrendin!</b>${t.name} (${LV[q.d]}) zayıf noktalarından silindi.`); }
        else note('ok', T`<b class="t">${dotsOf(w[key].s)} Güçleniyorsun!</b>${NEED - w[key].s} doğru daha yaparsan bu konuyu öğrenmiş sayılacaksın.`);
      } else note('hint', T`<b class="t">${dotsOf(w[key].s)}</b>Doğru! Ama ilk denemede ve ipucusuz yaparsan güçlenme sayılır.`);
    }
    if (q.extra && q.done && Q) { Q.pts = before.p; Q.correct = before.c; Q.first = before.f; }

    if (!ok && q.done && mode !== 'speed' && Q) {
      let again = false;
      if (mode === 'fix') { Q.forced = { ti: q.ti, d: q.d }; again = true; }
      else if ((Q.extra || 0) < MAXEXTRA) { Q.extra = (Q.extra || 0) + 1; Q.total++; Q.forced = { ti: q.ti, d: q.d }; again = true; }
      const el = note('hint', T`<b class="t">🎯 Bu konuyu not ettim</b>${again ? T('Şimdi hemen benzer bir soru geleceğim. ') : ''}${NEED} kez üst üste doğru yapana kadar "Güçlendirme" bölümünde bunun üzerine gideceğiz.
        <button class="btn blue" style="margin-top:8px">📖 Mantığını tekrar oku</button>`);
      if (el) el.querySelector('button').onclick = () => lessonPeek(q.ti);
    }
    save();
  };

  finish = function () {
    if (!Q) return;
    if (Q.mode === 'fix') return finishFix();
    if (Q.extra) Q.total -= Q.extra;
    const m = Q.mastered || [], mode = Q.mode;
    _finish();
    const L = weakList(), first = view.firstElementChild; if (!first) return;
    if (m.length) first.insertAdjacentHTML('afterend', T`<div class="card res"><h2>💪 Güçlendirdiğin konular</h2><p>${m.join('<br>')}</p></div>`);
    if (L.length && mode !== 'speed') {
      first.insertAdjacentHTML('afterend', T`<div class="card weak"><b style="font-size:20px">🎯 ${L.length} zayıf noktan var</b>
        <p class="muted" style="margin:4px 0">Hatalar öğrenmenin en iyi fırsatı! Şimdi üzerine gidelim, tamamen öğren.</p>
        <button class="btn" id="goFix">🎯 Hatalarımı güçlendir</button></div>`);
      $('goFix').onclick = () => startQuiz(-1, 'fix');
    }
  };

  function finishFix() {
    stopTimer(); markDay(); S.xp += Q.xp;
    const m = Q.mastered || [], got = Q.correct, tot = Q.n, L = weakList();
    save(); Q = null; topbar();
    view.innerHTML = T`<div class="card res"><div style="font-size:64px">🎯</div><h2>Güçlendirme turu bitti!</h2>
      <div class="stat"><div><b>${got}/${tot}</b>doğru</div><div><b>${m.length}</b>öğrenildi</div><div><b>${L.length}</b>kaldı</div></div>
      ${m.length ? T`<p>💪 Artık sağlam:<br>${m.join('<br>')}</p>` : ''}
      <p>${L.length ? T`Harika gidiyorsun! Kalan ${L.length} nokta için devam edelim. Her birini ${NEED} kez üst üste doğru yapınca tamamen öğrenmiş olacaksın.` : T('🏆 Hiç zayıf noktan kalmadı! Muhteşemsin!')}</p></div>
      ${L.length ? T`<div class="card"><div class="wchips">${L.slice(0, 10).map(chip).join('')}</div></div><button class="btn" id="fA">🎯 Devam et</button>` : ''}
      <button class="btn ghost" id="fH">🗺️ Harita</button>`;
    if (m.length && !L.length) confetti(['🏆', '💪', '⭐']);
    if ($('fA')) $('fA').onclick = () => startQuiz(-1, 'fix');
    $('fH').onclick = home; window.scrollTo(0, 0);
  }
  const chip = w => `<span class="chip">${w.t.emoji} ${w.t.name} · ${LV[w.d]} ${dotsOf(w.s)}</span>`;

  home = function () {
    _home();
    const L = weakList(), hello = view.querySelector('.hello'); if (!L.length || !hello) return;
    hello.insertAdjacentHTML('afterend', T`<div class="card weak"><div style="display:flex;gap:10px;align-items:center"><div style="font-size:42px">🎯</div>
      <div><b style="font-size:20px">Güçlendirme zamanı!</b><div class="muted" style="font-size:15px">Zorlandığın ${L.length} nokta var. Her birini ${NEED} kez üst üste doğru yap, tamamen öğren!</div></div></div>
      <div class="wchips">${L.slice(0, 8).map(chip).join('')}${L.length > 8 ? `<span class="chip">+${L.length - 8}</span>` : ''}</div>
      <button class="btn" id="wGo">🎯 Şimdi çalış</button></div>`);
    $('wGo').onclick = () => startQuiz(-1, 'fix');
  };

  topicSheet = function (i) {
    _topicSheet(i);
    const L = weakList().filter(w => w.i === i), head = document.querySelector('#sheet .head');
    if (L.length && head) head.insertAdjacentHTML('beforeend', T`<p style="background:#fff1e3;border-radius:12px;padding:6px 10px">🎯 Bu konuda zayıf nokta: ${L.map(w => `${LV[w.d]} ${dotsOf(w.s)}`).join(' · ')}</p>`);
  };

  home();
})();
