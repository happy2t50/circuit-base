/* Utilidades de presentación compartidas por todas las vistas: índices de contenido,
 * medios (diagramas, símbolos, ilustraciones), cálculo de progreso y montaje de vistas. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const U = CB.util;

  /* ---------- Índices de contenido ---------- */
  function buildIndex() {
    const lessonsById = {};
    CB.lessons.forEach((l) => { lessonsById[l.id] = l; });
    const activities = {}; // id → { act, source: {type, id, title, href} }
    CB.lessons.forEach((l) => l.activities.forEach((a) => {
      const slide = l.slides.findIndex((s) => [].concat(s.activity || []).includes(a.id));
      activities[a.id] = { act: a, source: { type: 'lesson', id: l.id, title: l.title, module: l.module, href: '#/leccion/' + l.id + '?s=' + Math.max(0, slide) } };
    }));
    CB.components.list.forEach((c) => {
      activities[c.exercise.id] = { act: c.exercise, source: { type: 'component', id: c.id, title: 'Ficha: ' + c.name, module: 'm2', href: '#/componentes/' + c.id } };
    });
    CB.practices.list.forEach((p) => p.questions.forEach((q) => {
      activities[q.id] = { act: q, source: { type: 'practice', id: p.id, title: 'Práctica ' + p.code + ': ' + p.title, module: p.module, href: '#/proyectos/' + p.id } };
    }));
    return { lessonsById, activities };
  }

  /* ---------- Medios ---------- */
  function media(m) {
    if (!m) return '';
    if (m.diagram) return '<div class="diagram-wrap" tabindex="0" role="region" aria-label="Diagrama (desplázate en horizontal si no cabe)">' + CB.diagrams.diagramSVG(m.diagram) + '</div>';
    if (m.symbol) return CB.symbols.symbolSVG(m.symbol, { label: m.label });
    if (m.component) { const c = CB.components.byId[m.component]; return c ? '<div class="ill-wrap">' + c.ill + '</div>' : ''; }
    if (m.breadboard) {
      let b = m.breadboard;
      if (b.exercise) { const ex = CB.labExercises.find((e) => e.id === b.exercise); b = Object.assign({ fixed: ex.fixed, pieces: ex.pieces, placement: ex.solution }, b); }
      return '<div class="bb-scroll" tabindex="0" role="region" aria-label="Protoboard (desplázate en horizontal si no cabe)">' + CB.breadboardView.render({ placement: b.placement || {}, fixed: b.fixed || [], pieces: b.pieces || [], highlight: b.highlight, label: b.label }) + '</div>' + (b.caption ? '<p class="small muted">' + b.caption + '</p>' : '');
    }
    if (m.html) return m.html;
    return '';
  }

  /* ---------- Progreso ---------- */
  function progress(store, index) {
    const st = store.state;
    const modules = CB.modules.map((m) => {
      const ls = (m.lessons || []);
      const ps = CB.practices.byModule(m.id);
      const done = ls.filter((id) => st.lessons[id] && st.lessons[id].completed).length + ps.filter((p) => st.practices[p.id] && st.practices[p.id].completed).length;
      const total = ls.length + ps.length;
      return { module: m, total, lessons: ls.length, practices: ps.length, done, pct: total ? Math.round((done / total) * 100) : 0 };
    });
    const actIds = Object.keys(index.activities);
    const graded = actIds.filter((id) => index.activities[id].act.type !== 'reflection');
    const attempted = graded.filter((id) => st.activities[id]);
    const solved = actIds.filter((id) => st.activities[id] && (st.activities[id].everCorrect || st.activities[id].reflected));
    const review = graded.filter((id) => st.activities[id] && st.activities[id].correct === false);
    const lessonTotal = CB.lessons.length;
    const lessonDone = CB.lessons.filter((l) => st.lessons[l.id] && st.lessons[l.id].completed).length;
    const practiceTotal = CB.practices.list.length;
    const practiceDone = CB.practices.list.filter((p) => st.practices[p.id] && st.practices[p.id].completed).length;
    const units = lessonTotal + actIds.length + practiceTotal;
    const overall = units ? Math.round(((lessonDone + solved.length + practiceDone) / units) * 100) : 0;
    const firstTry = attempted.filter((id) => st.activities[id].everCorrect && st.activities[id].attempts === 1).length;
    return { modules, lessonTotal, lessonDone, actTotal: actIds.length, attempted, solved, review, practiceTotal, practiceDone, overall, firstTry, graded };
  }

  function bar(pct, label) {
    return '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="' + U.esc(label) + '"><span style="width:' + pct + '%"></span></div>';
  }

  function statusPill(status) {
    const cls = { available: 'pill-ok', partial: 'pill-info', planned: 'pill-muted' }[status];
    return '<span class="pill ' + cls + '">' + CB.STATUS_LABEL[status] + '</span>';
  }

  function polarityPill(p) {
    if (p === true) return '<span class="pill pill-warn">Polarizado</span>';
    if (p === false) return '<span class="pill pill-muted">Sin polaridad</span>';
    if (p === 'pinout') return '<span class="pill pill-info">Patas no intercambiables</span>';
    return '<span class="pill pill-info">Depende del tipo</span>';
  }

  function safetyNote(text) {
    return '<aside class="callout warn" role="note"><strong>Seguridad.</strong> ' + text + '</aside>';
  }

  /** Monta una vista: limpia, inserta, mueve el foco al título (accesibilidad) y actualiza la navegación. */
  function mount(html, opts) {
    const view = document.getElementById('view');
    view.innerHTML = html;
    document.title = (opts && opts.title ? opts.title + ' · ' : '') + 'Circuito Base';
    U.$all('.site-nav a').forEach((a) => {
      const active = opts && opts.nav && a.dataset.nav === opts.nav;
      a.classList.toggle('is-active', !!active);
      if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const h1 = view.querySelector('h1');
    // En la primera carga no se mueve el foco: así el primer Tab llega a "Saltar al contenido".
    const first = !mount.rendered; mount.rendered = true;
    if (h1 && !first && !(opts && opts.keepFocus)) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    if (!(opts && opts.keepScroll)) root.scrollTo(0, 0);
    return view;
  }

  /** Renderiza una lista de actividades dentro de un contenedor. */
  function renderActivities(container, ids, ctx) {
    ids.forEach((id) => {
      const entry = ctx.index.activities[id];
      if (!entry) { container.insertAdjacentHTML('beforeend', '<p class="error">Actividad no encontrada: ' + U.esc(id) + '</p>'); return; }
      const el = CB.activities.render(entry.act, { store: ctx.store, getMedia: media, onResult: ctx.onResult });
      container.appendChild(el);
      CB.activities.afterMount(el);
    });
  }

  /** Las explicaciones pueden indicar la línea por número ({line}) o por un fragmento de texto ({find}). */
  function resolveExplain(sketch, explain) {
    const lines = sketch.split('\n');
    return (explain || []).map((e) => {
      if (e.line) return e;
      const i = lines.findIndex((l) => l.includes(e.find));
      if (i < 0) throw new Error('Explicación sin línea: ' + e.find);
      return { line: i + 1, text: e.text };
    });
  }

  /** Bloque de código Arduino numerado con explicación línea por línea (resalta la línea al pasar el ratón). */
  function codeBlock(sketch, explain, filename) {
    const lines = sketch.split('\n');
    const id = 'code-' + Math.random().toString(36).slice(2, 8);
    explain = resolveExplain(sketch, explain);
    return '<div class="code-wrap" data-code="' + id + '"><div class="code-head"><span>' + U.esc(filename || 'sketch.ino') + ' · Arduino Uno R3</span><button type="button" class="btn-sm" data-copy="' + id + '">Copiar código</button></div>' +
      '<pre class="code" id="' + id + '" tabindex="0" role="region" aria-label="Código de ' + U.esc(filename || 'sketch.ino') + ' (desplázate en horizontal si no cabe)"><code>' + lines.map((ln, i) => '<span class="code-line" data-line="' + (i + 1) + '"><span class="ln">' + (i + 1) + '</span>' + U.esc(ln) + '</span>').join('') + '</code></pre>' +
      (explain && explain.length ? '<ol class="explain">' + explain.map((e) => '<li data-for="' + e.line + '" tabindex="0"><span class="ln-ref">' + (Array.isArray(e.line) ? 'Líneas ' + e.line.join('–') : 'Línea ' + e.line) + '</span><p>' + e.text + '</p></li>').join('') + '</ol>' : '') + '</div>';
  }
  /** Activa copiar y resaltado en todos los bloques de código dentro de un contenedor. */
  function wireCode(container, sketches) {
    U.$all('.code-wrap', container).forEach((wrap) => {
      const pre = U.$('pre', wrap);
      U.$all('.explain li', wrap).forEach((li) => {
        const range = li.dataset.for.split(',').map(Number);
        const on = () => U.$all('.code-line', pre).forEach((l) => { const n = +l.dataset.line; if (range.length === 2 ? n >= range[0] && n <= range[1] : n === range[0]) l.classList.add('is-hl'); });
        const off = () => U.$all('.code-line.is-hl', pre).forEach((x) => x.classList.remove('is-hl'));
        li.addEventListener('mouseenter', on); li.addEventListener('mouseleave', off); li.addEventListener('focus', on); li.addEventListener('blur', off);
      });
      const btn = U.$('[data-copy]', wrap);
      btn.addEventListener('click', () => {
        const text = U.$all('.code-line', pre).map((l) => l.textContent.replace(/^\d+/, '')).join('\n');
        const done = () => { btn.textContent = 'Copiado'; setTimeout(() => { btn.textContent = 'Copiar código'; }, 1600); };
        const fallback = () => { const r = document.createRange(); r.selectNodeContents(pre); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); btn.textContent = 'Seleccionado: pulsa Ctrl+C'; };
        try { navigator.clipboard.writeText(text).then(done, fallback); } catch (err) { fallback(); }
      });
    });
  }

  CB.shell = { resolveExplain, codeBlock, wireCode, buildIndex, media, progress, bar, statusPill, polarityPill, safetyNote, mount, renderActivities };
})(typeof window !== 'undefined' ? window : globalThis);
