/* Panel de progreso, sección de cuestionarios y página no encontrada. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const U = CB.util, S = CB.shell;

  const fmtDate = (t) => { try { return new Date(t).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }); } catch (e) { return ''; } };

  function progressView(ctx) {
    const { store, index } = ctx;
    const p = S.progress(store, index);
    const st = store.state;
    const reviewByLesson = {};
    p.review.forEach((id) => { const src = index.activities[id].source; (reviewByLesson[src.title] = reviewByLesson[src.title] || { href: src.href, items: [] }).items.push(index.activities[id].act); });
    const KIND = { leccion: 'Lección', actividad: 'Actividad', practica: 'Práctica', laboratorio: 'Laboratorio', importacion: 'Copia de seguridad' };
    const nameOf = (h) => h.kind === 'leccion' ? (index.lessonsById[h.id] || {}).title : h.kind === 'practica' ? (CB.practices.byId[h.id] || {}).title : h.kind === 'laboratorio' ? 'Verificador de protoboard' : h.kind === 'importacion' ? 'progreso' : (index.activities[h.id] ? index.activities[h.id].source.title : h.id);
    const practiceHistory = st.history.filter((h) => h.kind === 'practica' || h.kind === 'laboratorio');

    S.mount(
      '<header class="page-head"><h1>Tu progreso</h1><p class="lead">Avance por módulo, resultados de las actividades y temas que conviene repasar.</p></header>' +
      '<section class="panel summary-panel"><div class="stat-ring" style="--p:' + p.overall + '"><span>' + p.overall + '<small>%</small></span></div>' +
      '<dl class="kpis"><div><dt>Lecciones completadas</dt><dd>' + p.lessonDone + ' / ' + p.lessonTotal + '</dd></div><div><dt>Actividades resueltas</dt><dd>' + p.solved.length + ' / ' + p.actTotal + '</dd></div><div><dt>Acertadas al primer intento</dt><dd>' + p.firstTry + ' / ' + p.attempted.length + ' intentadas</dd></div><div><dt>Prácticas completadas</dt><dd>' + p.practiceDone + ' / ' + p.practiceTotal + '</dd></div></dl></section>' +
      '<section class="panel"><h2>Progreso por módulo</h2><ul class="mod-progress">' + p.modules.map((mp) => '<li><span>' + mp.module.n + '. ' + U.esc(mp.module.title) + '</span>' + (mp.total ? S.bar(mp.pct, 'Módulo ' + mp.module.n) + '<span class="num">' + mp.done + '/' + mp.total + '</span>' : '<span class="muted small">Sin contenido aún</span>') + '</li>').join('') + '</ul></section>' +
      '<section class="panel"><h2>Temas pendientes de repaso</h2>' + (Object.keys(reviewByLesson).length ? '<p class="small muted">Actividades cuyo último intento fue incorrecto.</p><ul class="review-list">' + Object.keys(reviewByLesson).map((t) => '<li><a href="' + reviewByLesson[t].href + '">' + U.esc(t) + '</a><ul>' + reviewByLesson[t].items.map((a) => '<li>' + a.prompt + '</li>').join('') + '</ul></li>').join('') + '</ul>' : '<p class="muted">Nada pendiente. Cuando falles una actividad aparecerá aquí hasta que la resuelvas.</p>') + '</section>' +
      '<section class="panel"><h2>Historial de prácticas y laboratorio</h2>' + (practiceHistory.length ? '<ul class="history">' + practiceHistory.slice(0, 20).map((h) => '<li><time>' + fmtDate(h.at) + '</time><span>' + KIND[h.kind] + ': ' + U.esc(nameOf(h) || h.id) + '</span><span class="muted">' + U.esc(h.detail) + '</span></li>').join('') + '</ul>' : '<p class="muted">Aún no hay prácticas ni comprobaciones en el laboratorio.</p>') + '</section>' +
      '<section class="panel"><h2>Actividad reciente</h2>' + (st.history.length ? '<ul class="history">' + st.history.slice(0, 25).map((h) => '<li><time>' + fmtDate(h.at) + '</time><span>' + KIND[h.kind] + ': ' + U.esc(nameOf(h) || h.id) + '</span><span class="muted">' + U.esc(h.detail) + '</span></li>').join('') + '</ul>' : '<p class="muted">Todavía no hay actividad registrada.</p>') + '</section>' +
      '<section class="panel"><h2>Dónde se guarda tu progreso</h2>' +
      '<p>' + (store.persistent ? 'Tu progreso se guarda en el <strong>almacenamiento local de este navegador</strong>, en este dispositivo.' : '<strong>El almacenamiento local no está disponible:</strong> el progreso solo dura mientras la pestaña esté abierta.') + '</p>' +
      '<ul class="small"><li>No es una cuenta: no se sincroniza con otros dispositivos ni con otros navegadores.</li><li>Se pierde si borras los datos del sitio o usas una ventana privada.</li><li>Puedes copiar una copia de seguridad en texto (JSON) y restaurarla aquí o en otro navegador.</li></ul>' +
      '<div class="row"><button type="button" class="btn btn-ghost" id="export">Mostrar copia de seguridad</button><button type="button" class="btn btn-ghost" id="import">Restaurar una copia</button><button type="button" class="btn btn-ghost danger" id="reset">Borrar todo el progreso</button></div>' +
      '<div id="export-box" hidden><label for="export-text" class="small">Copia este texto y guárdalo en un archivo:</label><textarea id="export-text" rows="8" readonly></textarea><button type="button" class="btn-sm" id="copy-export">Copiar</button></div>' +
      '<div id="import-box" hidden><label for="import-text" class="small">Pega aquí una copia de seguridad (o elige el archivo donde la guardaste):</label><textarea id="import-text" rows="6" placeholder="{ &quot;schema&quot;: 1, … }"></textarea>' +
      '<div class="row"><label class="btn-sm file-pick" for="import-file">Elegir archivo…</label><input type="file" id="import-file" accept=".json,.txt,application/json,text/plain" class="sr-only"></div>' +
      '<fieldset class="seg-field"><legend class="small">Al restaurar:</legend><label><input type="radio" name="import-mode" value="merge" checked> Combinar con mi progreso actual (no se pierde nada)</label><label><input type="radio" name="import-mode" value="replace"> Sustituir mi progreso actual</label></fieldset>' +
      '<div class="row"><button type="button" class="btn" id="import-go">Restaurar</button><button type="button" class="btn btn-ghost" id="import-cancel">Cancelar</button></div><p id="import-msg" class="small" role="status" aria-live="polite"></p></div>' +
      '<div id="reset-box" class="callout danger" hidden><p>Se borrarán lecciones, respuestas, prácticas e historial de este navegador. No se puede deshacer.</p><div class="row"><button type="button" class="btn danger-solid" id="reset-yes">Sí, borrar todo</button><button type="button" class="btn btn-ghost" id="reset-no">Cancelar</button></div></div></section>',
      { title: 'Progreso', nav: 'progreso' }
    );
    U.$('#export').addEventListener('click', () => { U.$('#export-box').hidden = false; U.$('#export-text').value = store.exportJSON(); U.$('#export-text').select(); });
    U.$('#copy-export').addEventListener('click', (e) => { const b = e.currentTarget; try { navigator.clipboard.writeText(U.$('#export-text').value).then(() => { b.textContent = 'Copiado'; }, () => { U.$('#export-text').select(); b.textContent = 'Seleccionado: Ctrl+C'; }); } catch (err) { U.$('#export-text').select(); } });
    U.$('#import').addEventListener('click', () => { U.$('#import-box').hidden = false; U.$('#import-text').focus(); });
    U.$('#import-cancel').addEventListener('click', () => { U.$('#import-box').hidden = true; U.$('#import-msg').textContent = ''; });
    U.$('#import-file').addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      if (f.size > 2 * 1024 * 1024) { U.$('#import-msg').textContent = 'El archivo es demasiado grande para ser una copia de seguridad (más de 2 MB).'; return; }
      const r = new FileReader();
      r.onload = () => { U.$('#import-text').value = String(r.result); U.$('#import-msg').textContent = 'Archivo cargado: ' + f.name + '. Revisa la opción y pulsa Restaurar.'; };
      r.onerror = () => { U.$('#import-msg').textContent = 'No se pudo leer el archivo.'; };
      r.readAsText(f);
    });
    U.$('#import-go').addEventListener('click', () => {
      const mode = (U.$('input[name=import-mode]:checked') || {}).value || 'merge';
      try {
        const n = store.importJSON(U.$('#import-text').value, mode);
        progressView(ctx);
        U.$('#import-box').hidden = false;
        U.$('#import-msg').textContent = (mode === 'merge' ? 'Copia combinada' : 'Copia restaurada') + ': ' + n.lessons + ' lecciones, ' + n.activities + ' actividades y ' + n.practices + ' prácticas en la copia.';
        U.$('#import-msg').className = 'small ok-t';
      } catch (err) {
        U.$('#import-msg').textContent = 'No se restauró nada. ' + err.message;
        U.$('#import-msg').className = 'small error';
      }
    });
    U.$('#reset').addEventListener('click', () => { U.$('#reset-box').hidden = false; U.$('#reset-no').focus(); });
    U.$('#reset-no').addEventListener('click', () => { U.$('#reset-box').hidden = true; });
    U.$('#reset-yes').addEventListener('click', () => { store.resetAll(); progressView(ctx); });
  }

  function quizzes(ctx) {
    const { store, index } = ctx;
    const groups = [];
    CB.lessons.forEach((l) => groups.push({ title: 'Lección: ' + l.title, href: '#/leccion/' + l.id, ids: l.activities.map((a) => a.id) }));
    groups.push({ title: 'Ejercicios de la biblioteca de componentes', href: '#/componentes', ids: CB.components.list.map((c) => c.exercise.id) });
    CB.practices.list.forEach((p) => groups.push({ title: 'Práctica ' + p.code + ': ' + p.title, href: '#/proyectos/' + p.id, ids: p.questions.map((q) => q.id) }));
    const state = (id) => { const r = store.activity(id); if (!r) return 'new'; if (r.everCorrect || r.reflected) return r.correct === false ? 'review' : 'done'; return 'review'; };
    const types = Object.keys(CB.activities.LABELS).concat(Object.keys(CB.activities.KIND_LABELS));

    S.mount(
      '<header class="page-head"><h1>Cuestionarios</h1><p class="lead">Todas las actividades en un solo lugar. Puedes repetirlas cuantas veces quieras: solo cuenta tu último intento para el repaso.</p></header>' +
      '<div class="filters"><div class="seg" role="group" aria-label="Estado"><button type="button" data-st="all" aria-pressed="true">Todas</button><button type="button" data-st="review" aria-pressed="false">Por repasar</button><button type="button" data-st="new" aria-pressed="false">Sin intentar</button></div>' +
      '<label class="select"><span class="sr-only">Tipo de actividad</span><select id="q-type"><option value="">Todos los tipos</option>' + types.map((t) => '<option value="' + t + '">' + (CB.activities.LABELS[t] || CB.activities.KIND_LABELS[t]) + '</option>').join('') + '</select></label></div>' +
      '<p class="small muted" id="q-count" aria-live="polite"></p><div id="q-list"></div>',
      { title: 'Cuestionarios', nav: 'cuestionarios' }
    );
    let filterSt = 'all';
    function draw() {
      const ft = U.$('#q-type').value;
      const list = U.$('#q-list');
      list.innerHTML = '';
      let n = 0;
      groups.forEach((g) => {
        const ids = g.ids.filter((id) => {
          const a = index.activities[id].act;
          return (filterSt === 'all' || state(id) === filterSt) && (!ft || a.type === ft || a.kind === ft);
        });
        if (!ids.length) return;
        n += ids.length;
        const sec = document.createElement('section');
        sec.className = 'quiz-group';
        sec.innerHTML = '<h2><a href="' + g.href + '">' + U.esc(g.title) + '</a> <span class="muted small">' + ids.length + '</span></h2>';
        const box = document.createElement('div');
        sec.appendChild(box);
        list.appendChild(sec);
        S.renderActivities(box, ids, ctx);
      });
      U.$('#q-count').textContent = n + ' actividad(es)';
      if (!n) list.innerHTML = '<p class="muted">No hay actividades con este filtro.</p>';
    }
    U.$all('[data-st]').forEach((b) => b.addEventListener('click', () => { filterSt = b.dataset.st; U.$all('[data-st]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); }));
    U.$('#q-type').addEventListener('change', draw);
    draw();
  }

  function notFound(msg) {
    S.mount('<header class="page-head"><h1>Página no encontrada</h1><p class="lead">' + U.esc(msg || 'Esa dirección no existe.') + '</p><p><a class="btn" href="#/">Ir al inicio</a></p></header>', { title: 'No encontrado' });
  }

  CB.views = CB.views || {};
  CB.views.progress = progressView;
  CB.views.quizzes = quizzes;
  CB.views.notFound = notFound;
})(typeof window !== 'undefined' ? window : globalThis);
