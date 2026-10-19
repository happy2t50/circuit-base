/* Proyectos prácticos: listado por módulo, práctica guiada y proyecto final con opciones.
 * Las secciones se muestran según los campos que tenga cada práctica (plantilla del currículo). */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const U = CB.util, S = CB.shell;

  const GROUPS = [
    { module: 'm5', title: 'Primeros circuitos (sin microcontrolador)' },
    { module: 'm7', title: 'Arduino desde cero' },
    { module: 'm9', title: 'Proyectos integradores' }
  ];

  function projects(ctx, params) {
    if (params && params.id) return practice(ctx, params.id);
    const { store } = ctx;
    const card = (p) => {
      const st = store.practice(p.id);
      return '<li><a class="project-card" href="#/proyectos/' + p.id + '"><span class="project-code">' + p.code + '</span><span><strong>' + U.esc(p.title) + '</strong><span class="muted small">' + U.esc(p.level) + ' · ' + p.minutes + ' min · ' + (p.sketch || p.type === 'final' ? 'Arduino Uno R3' : 'sin microcontrolador') + '</span></span>' + (st.completed ? '<span class="pill pill-ok">Completada</span>' : '<span class="pill pill-info">Disponible</span>') + '</a></li>';
    };
    S.mount(
      '<header class="page-head"><h1>Proyectos prácticos</h1><p class="lead">Prácticas guiadas con esquema, montaje verificado, cálculos, código explicado y lista de verificación de seguridad. Están ordenadas por dificultad.</p></header>' +
      GROUPS.map((g) => { const ps = CB.practices.byModule(g.module); return ps.length ? '<h2 class="section-title">' + U.esc(g.title) + '</h2><ul class="project-list">' + ps.map(card).join('') + '</ul>' : ''; }).join(''),
      { title: 'Proyectos', nav: 'proyectos' }
    );
  }

  function practice(ctx, id) {
    const { store } = ctx;
    const p = CB.practices.byId[id];
    if (!p) return CB.views.notFound('No existe la práctica «' + id + '».');
    if (p.type === 'final') return finalProject(ctx, p);

    const secs = [];
    const add = (title, html) => secs.push({ title, html });
    add('Objetivo', '<p>' + U.esc(p.objective) + '</p>' + (p.prerequisites && p.prerequisites.length ? '<h3>Conocimientos previos</h3><ul>' + p.prerequisites.map((r) => '<li>' + (r.lesson ? '<a href="#/leccion/' + r.lesson + '">' + U.esc(r.text) + '</a>' + (store.lesson(r.lesson).completed ? ' <span class="pill pill-ok">✓</span>' : '') : r.practice ? '<a href="#/proyectos/' + r.practice + '">' + U.esc(r.text) + '</a>' : U.esc(r.text)) + '</li>').join('') + '</ul>' : ''));
    if (p.planning) add('Planificación', '<ol>' + p.planning.map((x) => '<li>' + U.esc(x) + '</li>').join('') + '</ol>');
    add('Materiales', '<ul class="check">' + p.materials.map((m) => '<li>' + U.esc(m) + '</li>').join('') + '</ul>');
    add('Diagrama eléctrico', '<div class="diagram-wrap">' + CB.diagrams.diagramSVG(p.diagram) + '</div>' + (p.diagramNote ? '<p class="small muted">' + p.diagramNote + '</p>' : ''));
    if (p.layout) add('Vista del montaje', '<p class="small muted">Ilustración de una colocación válida, comprobada con el verificador de conexiones (no es una simulación eléctrica). Los cables que llegan desde ' + (p.sketch ? 'la placa' : 'la fuente') + ' se dibujan desde arriba y solo conectan en el orificio donde terminan.</p><div class="bb-scroll">' + CB.breadboardView.render({ placement: p.layout.placement, fixed: p.layout.fixed, pieces: p.layout.pieces, label: 'Montaje de la práctica ' + p.code }) + '</div>');
    add('Lista de conexiones', '<ol>' + p.connections.map((c) => '<li>' + U.esc(c) + '</li>').join('') + '</ol>');
    add('Cálculos', '<ol>' + p.calculations.map((c) => '<li>' + U.esc(c) + '</li>').join('') + '</ol>' + (p.table ? table(p.table) : ''));
    if (p.sketch) add('Código', S.codeBlock(p.sketch, p.codeExplain, 'practica_' + p.code.toLowerCase() + '.ino') + (p.libraries ? '<p class="small"><strong>Librerías:</strong> ' + U.esc(p.libraries) + '</p>' : '') + '<p class="small">Para cargarlo: Herramientas → Placa → Arduino Uno; Herramientas → Puerto → el de tu placa; botón Subir (→).</p>');
    add('Resultado esperado', '<p>' + U.esc(p.expected) + '</p>');
    if (p.tests) add('Pruebas', '<div class="table-scroll"><table class="units"><thead><tr><th>#</th><th>Prueba</th><th>Resultado esperado</th></tr></thead><tbody>' + p.tests.map((t, i) => '<tr><td>' + (i + 1) + '</td><td>' + U.esc(t.step) + '</td><td>' + U.esc(t.expected) + '</td></tr>').join('') + '</tbody></table></div>');
    add(p.tests ? 'Diagnóstico' : 'Errores frecuentes', '<div class="table-scroll"><table class="units"><thead><tr><th>Síntoma</th><th>Causa probable</th><th>Solución</th></tr></thead><tbody>' + p.mistakes.map((m) => '<tr><td>' + U.esc(m.symptom) + '</td><td>' + U.esc(m.cause) + '</td><td>' + U.esc(m.fix) + '</td></tr>').join('') + '</tbody></table></div>');
    add('Preguntas de comprobación', '<div id="questions"></div>');
    if (p.evaluation) add('Evaluación', rubric(p.evaluation));
    if (p.tinkercad) add('Práctica en Tinkercad Circuits', '<p class="small muted">' + U.esc(p.tinkercad.status) + '</p><p><a href="' + p.tinkercad.url + '" target="_blank" rel="noopener">Abrir Tinkercad Circuits (sitio externo)</a></p><ol>' + p.tinkercad.steps.map((s) => '<li>' + U.esc(s) + '</li>').join('') + '</ol>');
    add('Lista de verificación antes de conectar', S.safetyNote(p.safety || 'Marca cada punto mirando el montaje real. Solo entonces conecta la alimentación.') + checklistHtml(p, store));

    S.mount(
      '<nav class="crumbs" aria-label="Ruta"><a href="#/proyectos">Proyectos</a><span aria-hidden="true">/</span><span>' + (p.module === 'm9' ? 'Proyecto ' : 'Práctica ') + p.code + '</span></nav>' +
      '<header class="page-head"><p class="eyebrow">' + (p.module === 'm9' ? 'Proyecto ' : 'Práctica ') + p.code + ' · ' + U.esc(p.level) + ' · ' + p.minutes + ' min</p><h1>' + U.esc(p.title) + '</h1><p class="small muted">' + (p.board ? 'Placa: ' + U.esc(p.board) : 'Alimentación: ' + U.esc(p.power || '')) + '</p></header>' +
      '<nav class="toc" aria-label="Secciones"><ol>' + secs.map((s, i) => '<li><a href="#/proyectos/' + p.id + '" data-scroll="sec-' + i + '">' + s.title + '</a></li>').join('') + '</ol></nav>' +
      secs.map((s, i) => sec(i, s.title, s.html)).join('') + pager(p),
      { title: (p.module === 'm9' ? 'Proyecto ' : 'Práctica ') + p.code, nav: 'proyectos' }
    );
    S.renderActivities(U.$('#questions'), p.questions.map((q) => q.id), ctx);
    S.wireCode(document.getElementById('view'));
    wireToc();
    wireChecklist(p, store);
    store.setLast('/proyectos/' + p.id, (p.module === 'm9' ? 'Proyecto ' : 'Práctica ') + p.code + ': ' + p.title);
  }

  /* ---------- Proyecto final con opciones ---------- */
  function finalProject(ctx, p) {
    const { store } = ctx;
    const choice = store.practice(p.id).choice;
    const opt = p.options.find((o) => o.id === choice);
    S.mount(
      '<nav class="crumbs" aria-label="Ruta"><a href="#/proyectos">Proyectos</a><span aria-hidden="true">/</span><span>Proyecto ' + p.code + '</span></nav>' +
      '<header class="page-head"><p class="eyebrow">Proyecto ' + p.code + ' · ' + U.esc(p.level) + ' · ' + p.minutes + ' min</p><h1>' + U.esc(p.title) + '</h1><p class="lead">' + U.esc(p.objective) + '</p></header>' +
      '<section class="panel"><h2>1. Elige tu proyecto</h2><div class="option-grid" role="radiogroup" aria-label="Opciones de proyecto final">' +
      p.options.map((o) => '<label class="option-card' + (o.id === choice ? ' is-chosen' : '') + '"><input type="radio" name="final-option" value="' + o.id + '"' + (o.id === choice ? ' checked' : '') + '><strong>' + U.esc(o.title) + '</strong><span>' + U.esc(o.summary) + '</span><span class="small muted">Dificultad: ' + U.esc(o.level) + '</span></label>').join('') + '</div></section>' +
      '<div id="final-detail">' + (opt ? detail(opt) : '<p class="muted">Elige una opción para ver sus requisitos, materiales, pines sugeridos y la rúbrica.</p>') + '</div>' +
      sec(90, 'Hitos de trabajo', '<ol>' + p.milestones.map((m) => '<li>' + U.esc(m) + '</li>').join('') + '</ol>') +
      sec(91, 'Evaluación', rubric(p.evaluation)) +
      sec(92, 'Preguntas de comprobación', '<div id="questions"></div>') +
      sec(93, 'Lista de verificación antes de conectar', S.safetyNote(p.safety) + checklistHtml(p, store)),
      { title: 'Proyecto ' + p.code, nav: 'proyectos' }
    );
    U.$all('input[name=final-option]').forEach((r) => r.addEventListener('change', () => {
      store.setPracticeChoice(p.id, r.value);
      U.$all('.option-card').forEach((c) => c.classList.toggle('is-chosen', c.contains(r)));
      U.$('#final-detail').innerHTML = detail(p.options.find((o) => o.id === r.value));
    }));
    S.renderActivities(U.$('#questions'), p.questions.map((q) => q.id), ctx);
    wireChecklist(p, store);
    store.setLast('/proyectos/' + p.id, 'Proyecto ' + p.code + ': ' + p.title);

    function detail(o) {
      return '<section class="panel"><h2>2. Requisitos: ' + U.esc(o.title) + '</h2><ul>' + o.requirements.map((r) => '<li>' + U.esc(r) + '</li>').join('') + '</ul>' +
        '<h3>Materiales</h3><ul class="check">' + o.materials.map((m) => '<li>' + U.esc(m) + '</li>').join('') + '</ul>' +
        '<h3>Pines sugeridos (Arduino Uno R3)</h3><div class="table-scroll"><table class="units"><thead><tr><th>Elemento</th><th>Conexión</th></tr></thead><tbody>' + o.pins.map((x) => '<tr><td>' + U.esc(x[0]) + '</td><td>' + U.esc(x[1]) + '</td></tr>').join('') + '</tbody></table></div>' +
        '<h3>Partes que puedes reutilizar</h3><ul>' + o.reuse.map((r) => '<li><a href="' + r[0] + '">' + U.esc(r[1]) + '</a></li>').join('') + '</ul>' +
        (o.warnings ? S.safetyNote(o.warnings) : '') + '</section>';
    }
  }

  /* ---------- Piezas comunes ---------- */
  function checklistHtml(p, store) {
    return '<ul class="checklist" id="checklist">' + p.checklist.map((c) => '<li><label><input type="checkbox" id="chk-' + c.id + '" data-item="' + c.id + '"' + (store.practice(p.id).checklist[c.id] ? ' checked' : '') + '> ' + U.esc(c.text) + '</label></li>').join('') + '</ul>' +
      '<div class="row"><button type="button" class="btn" id="practice-done"></button></div><p class="small muted" id="practice-msg" aria-live="polite"></p>';
  }
  function wireChecklist(p, store) {
    const doneBtn = U.$('#practice-done'), msg = U.$('#practice-msg');
    function draw() {
      const st = store.practice(p.id);
      const all = p.checklist.every((c) => st.checklist[c.id]);
      const needChoice = p.type === 'final' && !st.choice;
      doneBtn.textContent = st.completed ? '✓ Completada' : 'Marcar como completada';
      doneBtn.disabled = st.completed || !all || needChoice;
      msg.textContent = st.completed ? 'Registrada en tu historial de prácticas.' : needChoice ? 'Elige primero una opción de proyecto.' : (all ? 'Lista revisada. Cuando el circuito funcione, márcala como completada.' : 'Completa la lista de verificación para poder marcarla como completada.');
    }
    U.$('#checklist').addEventListener('change', (e) => { const c = e.target.closest('[data-item]'); if (c) { store.setChecklist(p.id, c.dataset.item, c.checked); draw(); } });
    doneBtn.addEventListener('click', () => { const st = store.practice(p.id); store.completePractice(p.id, st.choice ? 'opción: ' + st.choice : ''); draw(); });
    U.$('#view').addEventListener('change', (e) => { if (e.target.name === 'final-option') draw(); });
    draw();
  }
  function wireToc() {
    U.$all('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const t = document.getElementById(a.dataset.scroll); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  }
  function table(t) {
    return '<div class="table-scroll"><table class="units"><thead><tr>' + t.head.map((h) => '<th>' + U.esc(h) + '</th>').join('') + '</tr></thead><tbody>' + t.rows.map((r) => '<tr>' + r.map((c) => '<td>' + U.esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
  }
  function rubric(rows) {
    return '<div class="table-scroll"><table class="units"><thead><tr><th>Criterio</th><th>Logrado</th><th>En proceso</th></tr></thead><tbody>' + rows.map((r) => '<tr><td><strong>' + U.esc(r.criterion) + '</strong></td><td>' + U.esc(r.good) + '</td><td>' + U.esc(r.partial) + '</td></tr>').join('') + '</tbody></table></div>';
  }
  function pager(p) {
    const list = CB.practices.list, i = list.indexOf(p);
    const prev = list[i - 1], next = list[i + 1];
    return '<nav class="pager" aria-label="Otras prácticas">' + (prev ? '<a href="#/proyectos/' + prev.id + '">← ' + prev.code + ': ' + U.esc(prev.title) + '</a>' : '<span></span>') + (next ? '<a href="#/proyectos/' + next.id + '">' + next.code + ': ' + U.esc(next.title) + ' →</a>' : '') + '</nav>';
  }
  function sec(i, title, html) {
    return '<section class="panel practice-sec" id="sec-' + i + '" aria-labelledby="sec-' + i + '-h"><h2 id="sec-' + i + '-h">' + title + '</h2>' + html + '</section>';
  }

  CB.views = CB.views || {};
  CB.views.projects = projects;
})(typeof window !== 'undefined' ? window : globalThis);
