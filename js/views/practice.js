/* Proyectos prácticos: listado y página de práctica guiada. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const U = CB.util, S = CB.shell;

  function projects(ctx, params) {
    if (params && params.id) return practice(ctx, params.id);
    const { store } = ctx;
    const planned = CB.modules.find((m) => m.id === 'm9').topics;
    S.mount(
      '<header class="page-head"><h1>Proyectos prácticos</h1><p class="lead">Prácticas guiadas con esquema, montaje, cálculos, código explicado y lista de verificación de seguridad.</p></header>' +
      '<h2 class="section-title">Disponibles</h2><ul class="project-list">' +
      CB.practices.list.map((p) => {
        const st = store.practice(p.id);
        return '<li><a class="project-card" href="#/proyectos/' + p.id + '"><span class="project-code">' + p.code + '</span><span><strong>' + U.esc(p.title) + '</strong><span class="muted small">' + U.esc(p.level) + ' · ' + p.minutes + ' min · Arduino Uno R3</span></span>' + (st.completed ? '<span class="pill pill-ok">Completada</span>' : '<span class="pill pill-info">Disponible</span>') + '</a></li>';
      }).join('') + '</ul>' +
      '<h2 class="section-title">Planeados (Módulo 9)</h2><ul class="project-list planned">' + planned.map((t, i) => '<li class="project-card is-planned"><span class="project-code">P' + (i + 1) + '</span><span><strong>' + U.esc(t) + '</strong></span><span class="pill pill-muted">Planeado</span></li>').join('') + '</ul>',
      { title: 'Proyectos', nav: 'proyectos' }
    );
  }

  function practice(ctx, id) {
    const { store, index } = ctx;
    const p = CB.practices.byId[id];
    if (!p) return CB.views.notFound('No existe la práctica «' + id + '».');
    const lines = p.sketch.split('\n');
    const codeHtml = lines.map((ln, i) => '<span class="code-line" data-line="' + (i + 1) + '"><span class="ln">' + (i + 1) + '</span>' + U.esc(ln) + '</span>').join('\n');
    S.mount(
      '<nav class="crumbs" aria-label="Ruta"><a href="#/proyectos">Proyectos</a><span aria-hidden="true">/</span><span>Práctica ' + p.code + '</span></nav>' +
      '<header class="page-head"><p class="eyebrow">Práctica ' + p.code + ' · ' + U.esc(p.level) + ' · ' + p.minutes + ' min</p><h1>' + U.esc(p.title) + '</h1><p class="small muted">Placa: ' + U.esc(p.board) + '</p></header>' +
      '<nav class="toc" aria-label="Secciones de la práctica"><ol>' + ['Objetivo', 'Materiales', 'Esquema', 'Montaje', 'Conexiones', 'Cálculos', 'Código', 'Resultado esperado', 'Errores frecuentes', 'Preguntas', 'Tinkercad', 'Verificación'].map((t, i) => '<li><a href="#/proyectos/' + p.id + '" data-scroll="sec-' + i + '">' + t + '</a></li>').join('') + '</ol></nav>' +
      sec(0, 'Objetivo', '<p>' + U.esc(p.objective) + '</p><h3>Conocimientos previos</h3><ul>' + p.prerequisites.map((r) => '<li><a href="#/leccion/' + r.lesson + '">' + U.esc(r.text) + '</a>' + (store.lesson(r.lesson).completed ? ' <span class="pill pill-ok">✓</span>' : '') + '</li>').join('') + '</ul>') +
      sec(1, 'Materiales', '<ul class="check">' + p.materials.map((m) => '<li>' + U.esc(m) + '</li>').join('') + '</ul>') +
      sec(2, 'Diagrama eléctrico', '<div class="diagram-wrap">' + CB.diagrams.diagramSVG(p.diagram) + '</div>') +
      sec(3, 'Vista del montaje', '<p class="small muted">Ilustración de una colocación válida (no es una simulación). Columnas 1–30; carril − superior en azul. Los cables que vienen de la placa (D8, GND) se dibujan desde arriba y solo conectan en el orificio donde terminan.</p><div class="bb-scroll">' + CB.breadboardView.render({ placement: p.layout.placement, fixed: p.layout.fixed, pieces: p.layout.pieces, label: 'Montaje de la práctica ' + p.code }) + '</div>') +
      sec(4, 'Lista de conexiones', '<ol>' + p.connections.map((c) => '<li>' + U.esc(c) + '</li>').join('') + '</ol>') +
      sec(5, 'Cálculos', '<ol>' + p.calculations.map((c) => '<li>' + U.esc(c) + '</li>').join('') + '</ol>') +
      sec(6, 'Código', '<div class="code-head"><span>sketch_a1.ino · Arduino IDE 2.x</span><button type="button" class="btn-sm" id="copy-code">Copiar código</button></div><pre class="code" id="code"><code>' + codeHtml + '</code></pre>' +
        '<h3>Explicación línea por línea</h3><ol class="explain">' + p.codeExplain.map((e) => '<li data-for="' + e.line + '"><span class="ln-ref">Línea ' + e.line + '</span><p>' + e.text + '</p></li>').join('') + '</ol>' +
        '<p class="small">Para cargarlo: Herramientas → Placa → Arduino Uno; Herramientas → Puerto → el de tu placa; botón Subir (→).</p>') +
      sec(7, 'Resultado esperado', '<p>' + U.esc(p.expected) + '</p>') +
      sec(8, 'Errores frecuentes', '<div class="table-scroll"><table class="units"><thead><tr><th>Síntoma</th><th>Causa probable</th><th>Solución</th></tr></thead><tbody>' + p.mistakes.map((m) => '<tr><td>' + U.esc(m.symptom) + '</td><td>' + U.esc(m.cause) + '</td><td>' + U.esc(m.fix) + '</td></tr>').join('') + '</tbody></table></div>') +
      sec(9, 'Preguntas de comprobación', '<div id="questions"></div>') +
      sec(10, 'Práctica en Tinkercad Circuits', '<p class="small muted">' + U.esc(p.tinkercad.status) + '</p><p><a href="' + p.tinkercad.url + '" target="_blank" rel="noopener">Abrir Tinkercad Circuits (sitio externo)</a></p><ol>' + p.tinkercad.steps.map((s) => '<li>' + U.esc(s) + '</li>').join('') + '</ol>') +
      sec(11, 'Lista de verificación antes de conectar', S.safetyNote('Marca cada punto mirando el montaje real. Solo entonces conecta el USB.') + '<ul class="checklist" id="checklist">' +
        p.checklist.map((c) => '<li><label><input type="checkbox" id="chk-' + c.id + '" data-item="' + c.id + '"' + (store.practice(p.id).checklist[c.id] ? ' checked' : '') + '> ' + U.esc(c.text) + '</label></li>').join('') + '</ul>' +
        '<div class="row"><button type="button" class="btn" id="practice-done"></button></div><p class="small muted" id="practice-msg" aria-live="polite"></p>'),
      { title: 'Práctica ' + p.code, nav: 'proyectos' }
    );

    S.renderActivities(U.$('#questions'), p.questions.map((q) => q.id), ctx);
    U.$all('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const t = document.getElementById(a.dataset.scroll); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));

    // Resalta la línea de código al pasar sobre su explicación
    U.$all('.explain li').forEach((li) => {
      const on = () => { const l = U.$('.code-line[data-line="' + li.dataset.for + '"]'); if (l) l.classList.add('is-hl'); };
      const off = () => U.$all('.code-line.is-hl').forEach((x) => x.classList.remove('is-hl'));
      li.addEventListener('mouseenter', on); li.addEventListener('mouseleave', off);
      li.setAttribute('tabindex', '0'); li.addEventListener('focus', on); li.addEventListener('blur', off);
    });

    U.$('#copy-code').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const done = () => { btn.textContent = 'Copiado'; setTimeout(() => { btn.textContent = 'Copiar código'; }, 1600); };
      const fallback = () => { const r = document.createRange(); r.selectNodeContents(U.$('#code')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Seleccionado: pulsa Ctrl+C'; };
      try { navigator.clipboard.writeText(p.sketch).then(done, fallback); } catch (err) { fallback(); }
    });

    const doneBtn = U.$('#practice-done'), msg = U.$('#practice-msg');
    function drawDone() {
      const st = store.practice(p.id);
      const all = p.checklist.every((c) => st.checklist[c.id]);
      doneBtn.textContent = st.completed ? '✓ Práctica completada' : 'Marcar práctica como completada';
      doneBtn.disabled = st.completed || !all;
      msg.textContent = st.completed ? 'Registrada en tu historial de prácticas.' : (all ? 'Lista revisada. Cuando el circuito funcione, márcala como completada.' : 'Completa la lista de verificación para poder marcar la práctica.');
    }
    U.$('#checklist').addEventListener('change', (e) => { const c = e.target.closest('[data-item]'); if (c) { store.setChecklist(p.id, c.dataset.item, c.checked); drawDone(); } });
    doneBtn.addEventListener('click', () => { store.completePractice(p.id); drawDone(); });
    store.setLast('/proyectos/' + p.id, 'Práctica ' + p.code + ': ' + p.title);
    drawDone();
  }

  function sec(i, title, html) {
    return '<section class="panel practice-sec" id="sec-' + i + '" aria-labelledby="sec-' + i + '-h"><h2 id="sec-' + i + '-h">' + title + '</h2>' + html + '</section>';
  }

  CB.views = CB.views || {};
  CB.views.projects = projects;
})(typeof window !== 'undefined' ? window : globalThis);
