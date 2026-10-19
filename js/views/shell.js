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
    if (m.diagram) return '<div class="diagram-wrap">' + CB.diagrams.diagramSVG(m.diagram) + '</div>';
    if (m.symbol) return CB.symbols.symbolSVG(m.symbol, { label: m.label });
    if (m.component) { const c = CB.components.byId[m.component]; return c ? '<div class="ill-wrap">' + c.ill + '</div>' : ''; }
    if (m.html) return m.html;
    return '';
  }

  /* ---------- Progreso ---------- */
  function progress(store, index) {
    const st = store.state;
    const modules = CB.modules.map((m) => {
      const ls = (m.lessons || []);
      const done = ls.filter((id) => st.lessons[id] && st.lessons[id].completed).length;
      return { module: m, total: ls.length, done, pct: ls.length ? Math.round((done / ls.length) * 100) : 0 };
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
      container.appendChild(CB.activities.render(entry.act, { store: ctx.store, getMedia: media, onResult: ctx.onResult }));
    });
  }

  CB.shell = { buildIndex, media, progress, bar, statusPill, polarityPill, safetyNote, mount, renderActivities };
})(typeof window !== 'undefined' ? window : globalThis);
