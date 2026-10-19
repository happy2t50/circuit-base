/* Panel principal y menú de módulos. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const U = CB.util, S = CB.shell;

  function nextLesson(store) {
    for (const m of CB.modules) {
      for (const id of (m.lessons || [])) {
        if (!store.lesson(id).completed) return id;
      }
    }
    return null;
  }

  function dashboard(ctx) {
    const { store, index } = ctx;
    const p = S.progress(store, index);
    const last = store.state.last;
    const nextId = nextLesson(store);
    const next = nextId ? index.lessonsById[nextId] : null;
    const resume = last && last.route ? last : (next ? { route: '/leccion/' + next.id, label: next.title } : null);

    const moduleCards = p.modules.map((mp) => {
      const m = mp.module;
      const body = m.status === 'planned'
        ? '<p class="muted small">Temario: ' + U.esc(m.topics.join(' · ')) + '</p>'
        : (mp.total ? S.bar(mp.pct, 'Progreso del módulo ' + m.n) + '<p class="small muted">' + mp.done + ' de ' + mp.total + ' lecciones</p>' : '<p class="small muted">Herramientas disponibles; lecciones en construcción.</p>');
      const link = m.status === 'planned' ? '' : '<a class="card-link" href="#/modulos#' + m.id + '">Ver módulo<span class="sr-only"> ' + m.n + '</span></a>';
      return '<li class="module-card' + (m.status === 'planned' ? ' is-planned' : '') + '"><div class="module-num">' + String(m.n).padStart(2, '0') + '</div><div class="module-main"><div class="row-between"><h3>' + U.esc(m.title) + '</h3>' + S.statusPill(m.status) + '</div><p>' + U.esc(m.summary) + '</p>' + body + link + '</div></li>';
    }).join('');

    S.mount(
      '<section class="hero"><div class="hero-text"><p class="eyebrow">Electrónica, circuitos y Arduino desde cero</p>' +
      '<h1>Aprende a leer, calcular y montar circuitos reales</h1>' +
      '<p class="lead">Lecciones cortas con diagramas interactivos, ejercicios que explican cada respuesta y un laboratorio para comprobar tus montajes antes de conectarlos.</p>' +
      (resume ? '<div class="hero-actions"><a class="btn btn-lg" href="#' + resume.route + '">' + (last ? 'Continuar' : 'Empezar') + ': ' + U.esc(resume.label) + '</a><a class="btn btn-ghost" href="#/modulos">Ver todos los módulos</a></div>' : '') +
      '</div><div class="hero-stat"><div class="stat-ring" style="--p:' + p.overall + '"><span>' + p.overall + '<small>%</small></span></div><p class="small">Avance general</p>' +
      '<dl class="mini-stats"><div><dt>Lecciones</dt><dd>' + p.lessonDone + '/' + p.lessonTotal + '</dd></div><div><dt>Actividades</dt><dd>' + p.solved.length + '/' + p.actTotal + '</dd></div><div><dt>Por repasar</dt><dd>' + p.review.length + '</dd></div></dl>' +
      '<a class="small" href="#/progreso">Ver panel de progreso</a></div></section>' +
      (store.persistent ? '' : '<aside class="callout danger" role="alert"><strong>Tu progreso no se guardará.</strong> El navegador bloquea el almacenamiento local (por ejemplo, en una ventana privada). Puedes usar la app, pero al cerrar la pestaña se perderá el avance.</aside>') +
      (store.loadError ? '<aside class="callout warn" role="alert">' + U.esc(store.loadError) + '</aside>' : '') +
      '<section aria-labelledby="tools-h"><h2 id="tools-h" class="section-title">Herramientas</h2><ul class="tool-grid">' +
      tool('#/componentes', 'Biblioteca de componentes', '16 fichas: terminales, polaridad, cómo comprobarlos y errores frecuentes.') +
      tool('#/simbolos', 'Biblioteca de símbolos', 'Selecciona un símbolo para ver su significado, comportamiento y terminales.') +
      tool('#/laboratorio', 'Laboratorio', 'Calculadora de ley de Ohm y verificador de montajes en protoboard.') +
      tool('#/proyectos/a1-blink-externo', 'Práctica A1 · Arduino', 'LED externo intermitente en D8 con código explicado línea por línea.') +
      '</ul></section>' +
      '<section aria-labelledby="mods-h"><h2 id="mods-h" class="section-title">Ruta de aprendizaje</h2><ol class="module-list">' + moduleCards + '</ol></section>' +
      S.safetyNote('Todas las prácticas usan corriente continua de baja tensión (5–12 V). Nunca trabajes con la red eléctrica. Repasa la lección <a href="#/leccion/m1-seguridad">Seguridad eléctrica</a> antes de montar tu primer circuito.'),
      { title: 'Inicio', nav: 'inicio' }
    );
  }

  function tool(href, title, text) {
    return '<li><a class="tool" href="' + href + '"><strong>' + title + '</strong><span>' + text + '</span></a></li>';
  }

  function modules(ctx) {
    const { store, index } = ctx;
    const html = CB.modules.map((m) => {
      const lessons = (m.lessons || []).map((id, i) => {
        const l = index.lessonsById[id];
        const st = store.lesson(id);
        const solved = l.activities.filter((a) => { const r = store.activity(a.id); return r && (r.everCorrect || r.reflected); }).length;
        return '<li class="lesson-row' + (st.completed ? ' is-done' : '') + '"><span class="lesson-check" aria-hidden="true">' + (st.completed ? '✓' : (i + 1)) + '</span>' +
          '<a href="#/leccion/' + l.id + '">' + U.esc(l.title) + '</a><span class="muted small">' + l.slides.length + ' diapositivas · ' + l.minutes + ' min · ' + solved + '/' + l.activities.length + ' actividades</span>' +
          (st.completed ? '<span class="sr-only">Completada</span>' : (st.slide ? '<span class="pill pill-info">En curso</span>' : '')) + '</li>';
      }).join('');
      const extras = (m.extras || []).map((e) => '<li class="lesson-row extra"><span class="lesson-check" aria-hidden="true">→</span><a href="' + e.href + '">' + U.esc(e.label) + '</a></li>').join('');
      const topics = m.status !== 'available' && m.topics ? '<p class="small muted"><strong>Temario previsto:</strong> ' + U.esc(m.topics.join(' · ')) + '</p>' : '';
      const pending = m.pending ? '<p class="small muted"><strong>Pendiente:</strong> ' + U.esc(m.pending) + '</p>' : '';
      return '<section class="module-block" id="' + m.id + '" aria-labelledby="' + m.id + '-h"><header class="row-between"><h2 id="' + m.id + '-h"><span class="module-num inline">' + String(m.n).padStart(2, '0') + '</span> ' + U.esc(m.title) + '</h2>' + S.statusPill(m.status) + '</header>' +
        '<p>' + U.esc(m.summary) + '</p>' + (lessons || extras ? '<ol class="lesson-list">' + lessons + extras + '</ol>' : '') + topics + pending + '</section>';
    }).join('');
    S.mount('<header class="page-head"><h1>Módulos</h1><p class="lead">Nueve módulos, de los fundamentos eléctricos a los proyectos con Arduino. Los marcados como “Planeado” muestran su temario y aún no tienen lecciones.</p></header>' + html, { title: 'Módulos', nav: 'modulos' });
    const anchor = (root.location.hash.split('#')[2] || '');
    if (anchor) { const el = document.getElementById(anchor); if (el) el.scrollIntoView(); }
  }

  CB.views = CB.views || {};
  CB.views.dashboard = dashboard;
  CB.views.modules = modules;
})(typeof window !== 'undefined' ? window : globalThis);
