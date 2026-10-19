/* Laboratorio: calculadoras de ley de Ohm y verificador de montajes en protoboard. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const U = CB.util, S = CB.shell, B = CB.breadboard, BV = CB.breadboardView;

  function lab(ctx) {
    const ex = CB.labExercises[0];
    S.mount(
      '<header class="page-head"><h1>Laboratorio</h1><p class="lead">Comprueba tus cálculos y tus montajes antes de conectar la alimentación.</p></header>' +
      '<section class="panel" aria-labelledby="ohm-h"><h2 id="ohm-h">Calculadora de ley de Ohm</h2>' +
      '<form id="ohm-form" class="calc" novalidate><fieldset class="seg-field"><legend>¿Qué quieres calcular?</legend>' +
      ['V', 'I', 'R'].map((k, i) => '<label><input type="radio" name="unknown" value="' + k + '"' + (k === 'I' ? ' checked' : '') + '> ' + { V: 'Tensión (V)', I: 'Corriente (I)', R: 'Resistencia (R)' }[k] + '</label>').join('') + '</fieldset>' +
      '<div class="calc-inputs">' +
      input('V', 'Tensión', '5', [['1', 'V'], ['0.001', 'mV']]) +
      input('I', 'Corriente', '20', [['0.001', 'mA'], ['1', 'A']]) +
      input('R', 'Resistencia', '220', [['1', 'Ω'], ['1000', 'kΩ'], ['1000000', 'MΩ']]) +
      '</div><button class="btn" type="submit">Calcular</button></form><div id="ohm-out" class="calc-out" aria-live="polite"></div></section>' +

      '<section class="panel" aria-labelledby="led-h"><h2 id="led-h">Resistencia para un LED</h2>' +
      '<form id="led-form" class="calc" novalidate><div class="calc-inputs">' +
      '<div class="field-in"><label for="led-vs">Tensión de la fuente (V)</label><input id="led-vs" inputmode="decimal" value="5"></div>' +
      '<div class="field-in"><label for="led-color">Color del LED</label><select id="led-color"><option value="2.0">Rojo (≈2,0 V)</option><option value="2.1">Amarillo (≈2,1 V)</option><option value="3.0">Verde puro (≈3,0 V)</option><option value="3.0">Azul (≈3,0 V)</option><option value="3.1">Blanco (≈3,1 V)</option></select></div>' +
      '<div class="field-in"><label for="led-i">Corriente deseada (mA)</label><input id="led-i" inputmode="decimal" value="15"></div>' +
      '</div><button class="btn" type="submit">Calcular resistencia</button></form><div id="led-out" class="calc-out" aria-live="polite"></div>' +
      '<p class="small muted">La tensión directa real varía entre modelos: consulta la hoja de datos de tu LED. Los valores de esta lista son típicos de LED de 5 mm.</p></section>' +

      '<section class="panel" aria-labelledby="bb-h"><h2 id="bb-h">Verificador de protoboard</h2>' +
      '<aside class="callout info" role="note"><strong>Qué hace y qué no.</strong> Este verificador calcula qué orificios quedan unidos según la estructura interna de la protoboard y comprueba si tu montaje forma el circuito pedido. <strong>No es una simulación eléctrica</strong>: no calcula corrientes ni tensiones. Modelo: media protoboard con carriles continuos; en algunas protoboards largas los carriles están partidos a la mitad. Los cables 5V y GND de la placa se dibujan desde arriba y solo conectan donde terminan.</aside>' +
      '<div class="seg" role="group" aria-label="Modo"><button type="button" data-mode="build" aria-pressed="true">Montar ejercicio</button><button type="button" data-mode="explore" aria-pressed="false">Explorar conexiones internas</button></div>' +
      '<div id="bb-build"><p><strong>Ejercicio:</strong> ' + U.esc(ex.goal) + '</p>' +
      '<div class="bb-layout"><div class="bb-scroll" id="bb-board"></div><div class="bb-side"><h3>Piezas</h3><ol class="pieces" id="pieces"></ol>' +
      '<form id="hole-form" class="hole-form"><label for="hole-in">Colocar el terminal seleccionado en el orificio (p. ej. c9, tp3, tn12):</label><div class="row"><input id="hole-in" autocomplete="off" placeholder="c9"><button class="btn btn-ghost" type="submit">Colocar</button></div></form>' +
      '<p id="bb-status" class="bb-status" aria-live="polite"></p>' +
      '<div class="row"><button type="button" class="btn" id="bb-check">Comprobar montaje</button><button type="button" class="btn btn-ghost" id="bb-reset">Vaciar</button><button type="button" class="btn btn-ghost" id="bb-solution">Ver una solución</button></div>' +
      '</div></div><div id="bb-result" class="bb-result" aria-live="polite"></div></div>' +
      '<div id="bb-explore" hidden><p>Haz clic en cualquier orificio: se resaltan todos los que están conectados con él por dentro.</p><div class="bb-scroll" id="bb-explore-board"></div><p id="explore-out" class="bb-status" aria-live="polite"></p></div>' +
      S.safetyNote('Si montas este circuito de verdad, hazlo con el USB desconectado y conéctalo solo cuando el verificador (y tu propia revisión) confirmen el montaje.') +
      '</section>',
      { title: 'Laboratorio', nav: 'laboratorio' }
    );

    /* ----- Ohm ----- */
    const ohmForm = U.$('#ohm-form'), ohmOut = U.$('#ohm-out');
    function syncUnknown() {
      const unk = ohmForm.unknown.value;
      ['V', 'I', 'R'].forEach((k) => { const w = U.$('#w-' + k); w.classList.toggle('is-unknown', k === unk); U.$('#in-' + k).disabled = k === unk; U.$('#u-' + k).disabled = k === unk; });
    }
    U.$all('input[name=unknown]', ohmForm).forEach((r) => r.addEventListener('change', () => { syncUnknown(); ohmOut.innerHTML = ''; }));
    ohmForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const unk = ohmForm.unknown.value;
      const val = (k) => (k === unk ? null : U.parseNumber(U.$('#in-' + k).value) * parseFloat(U.$('#u-' + k).value));
      const vals = { V: val('V'), I: val('I'), R: val('R') };
      const bad = Object.keys(vals).filter((k) => k !== unk && !(vals[k] > 0));
      if (bad.length) { ohmOut.innerHTML = '<p class="error">Escribe un número mayor que cero en: ' + bad.map((k) => ({ V: 'tensión', I: 'corriente', R: 'resistencia' })[k]).join(' y ') + '.</p>'; return; }
      try {
        const r = CB.ohm.solveOhm(vals);
        const formula = { V: 'V = I × R', I: 'I = V ÷ R', R: 'R = V ÷ I' }[unk];
        ohmOut.innerHTML = '<div class="result-grid"><div><span>Tensión</span><b>' + U.fmtUnit(r.V, 'V') + '</b></div><div><span>Corriente</span><b>' + U.fmtUnit(r.I, 'A') + '</b></div><div><span>Resistencia</span><b>' + U.fmtUnit(r.R, 'ohm') + '</b></div><div><span>Potencia</span><b>' + U.fmtUnit(r.P, 'W') + '</b></div></div>' +
          '<p class="small">Fórmula usada: <code>' + formula + '</code>. Potencia: <code>P = V × I</code>.' + (r.P > 0.125 ? ' <strong class="warn-t">Supera 0,125 W: una resistencia de 1/4 W trabajaría por encima del 50 % de su potencia; usa una de mayor potencia.</strong>' : '') + (unk === 'R' ? ' Valor comercial E12 igual o superior: <b>' + U.fmtUnit(CB.ohm.nextE12(r.R), 'ohm') + '</b>.' : '') + '</p>';
      } catch (err) { ohmOut.innerHTML = '<p class="error">' + U.esc(err.message) + '</p>'; }
    });
    syncUnknown();
    ohmForm.requestSubmit ? ohmForm.requestSubmit() : ohmForm.dispatchEvent(new Event('submit'));

    /* ----- LED ----- */
    const ledForm = U.$('#led-form'), ledOut = U.$('#led-out');
    ledForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const Vs = U.parseNumber(U.$('#led-vs').value), Vf = parseFloat(U.$('#led-color').value), I = U.parseNumber(U.$('#led-i').value) / 1000;
      if (!(Vs > 0) || !(I > 0)) { ledOut.innerHTML = '<p class="error">Escribe una tensión y una corriente mayores que cero.</p>'; return; }
      if (I > 0.02) { ledOut.innerHTML = '<p class="error">Más de 20 mA supera el máximo continuo habitual de un LED de 5 mm y lo recomendado por pin del Arduino Uno. Usa 20 mA o menos.</p>'; return; }
      try {
        const R = CB.ohm.ledResistor(Vs, Vf, I), Rc = CB.ohm.nextE12(R), Ireal = (Vs - Vf) / Rc, P = (Vs - Vf) * Ireal;
        ledOut.innerHTML = '<div class="result-grid"><div><span>Resistencia mínima</span><b>' + U.fmtUnit(R, 'ohm') + '</b></div><div><span>Valor comercial (E12)</span><b>' + U.fmtUnit(Rc, 'ohm') + '</b></div><div><span>Corriente real</span><b>' + U.fmtUnit(Ireal, 'A') + '</b></div><div><span>Potencia en R</span><b>' + U.fmtUnit(P, 'W') + '</b></div></div>' +
          '<p class="small"><code>R = (' + Vs + ' − ' + Vf + ') ÷ ' + I + ' A</code>. Se elige el valor comercial igual o superior para no pasar de la corriente deseada.</p>';
      } catch (err) { ledOut.innerHTML = '<p class="error">' + U.esc(err.message) + '</p>'; }
    });
    ledForm.dispatchEvent(new Event('submit', { cancelable: true }));

    /* ----- Protoboard ----- */
    let placement = {}, active = null, errHoles = [];
    const board = U.$('#bb-board'), pieces = U.$('#pieces'), status = U.$('#bb-status'), result = U.$('#bb-result');
    const termName = (key) => { const [pid, tid] = key.split('.'); const p = ex.pieces.find((x) => x.id === pid); return p.name + ' — ' + p.terminals.find((t) => t.id === tid).label; };

    function drawBoard() {
      board.innerHTML = BV.render({ placement, fixed: ex.fixed, pieces: ex.pieces, highlight: { holes: errHoles, cls: 'hl-bad' }, label: 'Protoboard del ejercicio' });
    }
    function drawPieces() {
      pieces.innerHTML = ex.pieces.map((p) => '<li><span class="piece-name">' + U.esc(p.name) + (p.optional ? ' <span class="muted small">(opcional)</span>' : '') + '</span><ul>' +
        p.terminals.map((t) => {
          const key = p.id + '.' + t.id, at = placement[key];
          return '<li class="term' + (active === key ? ' is-active' : '') + '"><span>' + U.esc(t.label) + ': <b>' + (at ? U.esc(at) : '—') + '</b></span>' +
            '<button type="button" class="btn-sm" data-pick="' + key + '" aria-pressed="' + (active === key) + '">' + (at ? 'Mover' : 'Colocar') + '</button>' +
            (at ? '<button type="button" class="btn-sm ghost" data-remove="' + key + '" aria-label="Quitar ' + U.esc(p.name + ' ' + t.label) + '">Quitar</button>' : '') + '</li>';
        }).join('') + '</ul></li>').join('');
    }
    function setStatus(t) { status.textContent = t; }
    function place(hole) {
      if (!active) { setStatus('Primero elige en la lista qué terminal quieres colocar.'); return; }
      if (!B.baseNet(hole)) { setStatus('«' + hole + '» no es un orificio válido. Usa una fila a–j y una columna 1–30 (p. ej. c9), o un carril tp, tn, bp, bn seguido de la posición.'); return; }
      const taken = Object.keys(placement).find((k) => placement[k] === hole && k !== active) || (ex.fixed.find((f) => f.hole === hole) || {}).label;
      if (taken) { setStatus('Ese orificio ya está ocupado. Cada orificio admite una sola pata; usa otro de la misma tira.'); return; }
      placement[active] = hole;
      setStatus(termName(active) + ' → ' + B.describeHole(hole) + '.');
      // Pasa automáticamente al siguiente terminal sin colocar
      const next = ex.pieces.flatMap((p) => p.terminals.map((t) => p.id + '.' + t.id)).find((k) => !placement[k] && !ex.pieces.find((p) => p.id === k.split('.')[0]).optional);
      active = next || null;
      if (active) setStatus(status.textContent + ' Ahora: ' + termName(active) + '.');
      errHoles = []; result.innerHTML = '';
      drawPieces(); drawBoard();
    }

    board.addEventListener('click', (e) => { const g = e.target.closest('[data-hole]'); if (g) place(g.dataset.hole); });
    pieces.addEventListener('click', (e) => {
      const pick = e.target.closest('[data-pick]'), rem = e.target.closest('[data-remove]');
      if (pick) { active = pick.dataset.pick; setStatus('Haz clic en un orificio (o escribe su nombre abajo) para: ' + termName(active) + '.'); drawPieces(); }
      if (rem) { delete placement[rem.dataset.remove]; errHoles = []; drawPieces(); drawBoard(); setStatus('Terminal retirado.'); }
    });
    U.$('#hole-form').addEventListener('submit', (e) => { e.preventDefault(); place(U.$('#hole-in').value.trim().toLowerCase()); U.$('#hole-in').value = ''; });
    U.$('#bb-reset').addEventListener('click', () => { placement = {}; active = null; errHoles = []; result.innerHTML = ''; drawPieces(); drawBoard(); setStatus('Protoboard vacía.'); });
    U.$('#bb-solution').addEventListener('click', () => {
      placement = Object.assign({}, ex.solution); active = null; errHoles = [];
      drawPieces(); drawBoard();
      result.innerHTML = '<div class="callout info"><strong>Una solución posible.</strong> R1 va del carril + (tp6) a b6; el ánodo del LED comparte la tira 6 (c6) y el cátodo va a c9; un cable une a9 con el carril −. Hay muchas otras colocaciones válidas: lo que importa es el camino 5V → resistencia → ánodo → cátodo → GND.</div>';
    });
    U.$('#bb-check').addEventListener('click', () => {
      const res = B.evaluate(ex, placement);
      errHoles = res.errors.flatMap((er) => er.terminals.map((k) => placement[k]).filter(Boolean));
      drawBoard();
      ctx.store.logLab(ex.id, res.ok, res.ok ? '' : res.errors[0].code);
      result.innerHTML = res.ok
        ? '<div class="feedback is-ok"><strong>Montaje correcto.</strong> La corriente sale del carril + (5V), atraviesa la resistencia, entra al LED por el ánodo, sale por el cátodo y vuelve a GND. Con 220 Ω y un LED rojo circularían unos 13,6 mA. Recuerda: esto verifica conexiones, no simula el circuito.</div>'
        : '<div class="feedback is-bad"><strong>Revisa el montaje:</strong><ul>' + res.errors.map((er) => '<li><b>' + U.esc(er.msg) + '</b><br>' + U.esc(er.fix) + '</li>').join('') + '</ul></div>';
    });
    active = 'R1.1';
    setStatus('Empieza colocando: ' + termName(active) + '. Haz clic en un orificio.');
    drawPieces(); drawBoard();

    /* ----- Exploración ----- */
    const exBoard = U.$('#bb-explore-board');
    function drawExplore(hole) {
      exBoard.innerHTML = BV.render({ placement: {}, fixed: [], pieces: [], highlight: { holes: hole ? B.holesInSameNet(hole) : [], cls: 'hl' }, label: 'Protoboard para explorar conexiones' });
      if (hole) {
        const same = B.holesInSameNet(hole);
        U.$('#explore-out').textContent = B.describeHole(hole) + ' pertenece a la ' + B.describeNet(B.baseNet(hole)) + '. Está conectado con ' + (same.length - 1) + ' orificios más' + (same.length <= 5 ? ': ' + same.filter((h) => h !== hole).join(', ') : ' a lo largo de todo el carril') + '.';
      }
    }
    exBoard.addEventListener('click', (e) => { const g = e.target.closest('[data-hole]'); if (g) drawExplore(g.dataset.hole); });
    drawExplore(null);
    U.$all('[data-mode]').forEach((b) => b.addEventListener('click', () => {
      U.$all('[data-mode]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      U.$('#bb-build').hidden = b.dataset.mode !== 'build';
      U.$('#bb-explore').hidden = b.dataset.mode !== 'explore';
    }));
  }

  function input(k, label, value, units) {
    return '<div class="field-in" id="w-' + k + '"><label for="in-' + k + '">' + label + '</label><div class="row tight"><input id="in-' + k + '" inputmode="decimal" value="' + value + '"><label class="sr-only" for="u-' + k + '">Unidad de ' + label.toLowerCase() + '</label><select id="u-' + k + '">' + units.map((u) => '<option value="' + u[0] + '">' + u[1] + '</option>').join('') + '</select></div></div>';
  }

  CB.views = CB.views || {};
  CB.views.lab = lab;
})(typeof window !== 'undefined' ? window : globalThis);
