/* Página de lección con visor de diapositivas.
 * Avanzar/retroceder (botones y ← →), índice de diapositivas, salto directo, barra de progreso,
 * explicación adicional, actividades, reiniciar actividades, marcar completada y reanudar. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const U = CB.util, S = CB.shell;
  let keyHandler = null;

  function lesson(ctx, params, query) {
    const { store, index } = ctx;
    const l = index.lessonsById[params.id];
    if (!l) return CB.views.notFound('No existe la lección «' + params.id + '».');
    const mod = CB.modules.find((m) => m.id === l.module);
    const saved = store.lesson(l.id);
    let current = query.s != null && query.s !== '' ? U.clamp(parseInt(query.s, 10) || 0, 0, l.slides.length - 1) : U.clamp(saved.slide || 0, 0, l.slides.length - 1);
    const pos = mod.lessons.indexOf(l.id);
    const nextLesson = pos < mod.lessons.length - 1 ? index.lessonsById[mod.lessons[pos + 1]] : null;

    S.mount(
      '<nav class="crumbs" aria-label="Ruta"><a href="#/modulos">Módulos</a><span aria-hidden="true">/</span><a href="#/modulos#' + mod.id + '">Módulo ' + mod.n + ' · ' + U.esc(mod.title) + '</a></nav>' +
      '<header class="lesson-head"><div><p class="eyebrow">Lección ' + (pos + 1) + ' de ' + mod.lessons.length + ' · ' + l.minutes + ' min</p><h1>' + U.esc(l.title) + '</h1></div>' +
      '<div class="lesson-tools"><button type="button" class="btn btn-ghost" id="toggle-index" aria-expanded="false" aria-controls="slide-index">Todas las diapositivas</button>' +
      '<button type="button" class="btn btn-ghost" id="reset-acts">Reiniciar actividades</button>' +
      '<button type="button" class="btn" id="complete"></button></div></header>' +
      '<div id="reset-confirm" class="callout warn" hidden><p>Se borrarán tus respuestas de esta lección (no las de otras). ¿Continuar?</p><div class="row"><button type="button" class="btn" id="reset-yes">Sí, reiniciar</button><button type="button" class="btn btn-ghost" id="reset-no">Cancelar</button></div></div>' +
      '<details class="objectives"><summary>Objetivos de la lección</summary><ul>' + l.objectives.map((o) => '<li>' + U.esc(o) + '</li>').join('') + '</ul></details>' +
      '<div class="lesson-layout"><nav id="slide-index" class="slide-index" aria-label="Diapositivas de la lección" hidden><ol></ol></nav>' +
      '<div class="slide-col"><div class="slide-progress"><span id="slide-count" aria-live="polite"></span><div id="slide-bar"></div></div>' +
      '<article class="slide" id="slide" aria-live="polite"></article>' +
      '<nav class="slide-nav" aria-label="Navegación de diapositivas"><button type="button" class="btn btn-ghost" id="prev">← Anterior</button>' +
      '<label class="jump"><span class="sr-only">Ir a la diapositiva</span><select id="jump"></select></label>' +
      '<button type="button" class="btn" id="next">Siguiente →</button></nav>' +
      '<p class="kbd-hint small muted">Atajos: ← y → para moverte; Inicio y Fin para ir al principio o al final.</p>' +
      '<div class="lesson-end" id="lesson-end" hidden></div></div></div>',
      { title: l.title, nav: 'modulos' }
    );

    const slideEl = U.$('#slide'), jump = U.$('#jump'), indexList = U.$('#slide-index ol');
    jump.innerHTML = l.slides.map((s, i) => '<option value="' + i + '">' + (i + 1) + '. ' + U.esc(s.title) + '</option>').join('');

    function slideSolved(s) {
      const ids = [].concat(s.activity || []);
      if (!ids.length) return null;
      return ids.every((id) => { const r = store.activity(id); return r && (r.everCorrect || r.reflected); });
    }
    function drawIndex() {
      indexList.innerHTML = l.slides.map((s, i) => {
        const solved = slideSolved(s);
        const mark = solved === null ? '' : (solved ? '<span class="pill pill-ok">✓</span>' : '<span class="pill pill-muted">actividad</span>');
        return '<li><button type="button" data-go="' + i + '"' + (i === current ? ' aria-current="step"' : '') + '><span>' + (i + 1) + '. ' + U.esc(s.title) + '</span>' + mark + '</button></li>';
      }).join('');
    }
    function drawComplete() {
      const done = store.lesson(l.id).completed;
      const b = U.$('#complete');
      b.textContent = done ? '✓ Completada' : 'Marcar como completada';
      b.classList.toggle('btn-done', done);
      b.setAttribute('aria-pressed', done ? 'true' : 'false');
    }

    function show(i, focus) {
      current = U.clamp(i, 0, l.slides.length - 1);
      const s = l.slides[current];
      const actIds = [].concat(s.activity || []);
      // Si una actividad ya incluye el mismo diagrama (p. ej. para hacer clic en él), no se repite arriba.
      const mediaInActivity = s.media && actIds.some((id) => { const e = index.activities[id]; return e && e.act.media && JSON.stringify(e.act.media) === JSON.stringify(s.media); });
      const showMedia = s.media && !mediaInActivity;
      slideEl.innerHTML = '<h2>' + U.esc(s.title) + '</h2><div class="slide-body' + (showMedia ? ' has-media' : '') + '"><div class="prose">' + s.body + '</div>' +
        (showMedia ? '<figure class="slide-media">' + S.media(s.media) + '</figure>' : '') + '</div>' +
        (s.code ? '<div class="slide-code">' + S.codeBlock(s.code.sketch, s.code.explain, s.code.file) + '</div>' : '') +
        (s.more ? '<details class="more"><summary>Explicación adicional</summary>' + s.more + '</details>' : '') +
        '<div class="slide-activities"></div>';
      S.renderActivities(U.$('.slide-activities', slideEl), actIds, { store, index, onResult: drawIndex });
      S.wireCode(slideEl);
      U.$('#slide-count').textContent = 'Diapositiva ' + (current + 1) + ' de ' + l.slides.length;
      U.$('#slide-bar').innerHTML = S.bar(Math.round(((current + 1) / l.slides.length) * 100), 'Progreso de la lección');
      U.$('#prev').disabled = current === 0;
      U.$('#next').textContent = current === l.slides.length - 1 ? 'Terminar lección' : 'Siguiente →';
      jump.value = String(current);
      U.$('#lesson-end').hidden = true;
      store.setSlide(l.id, current);
      store.setLast('/leccion/' + l.id + '?s=' + current, l.title + ' (diapositiva ' + (current + 1) + ')');
      CB.router.replace('/leccion/' + l.id + '?s=' + current);
      drawIndex();
      if (focus) { slideEl.querySelector('h2').setAttribute('tabindex', '-1'); slideEl.querySelector('h2').focus({ preventScroll: true }); slideEl.scrollIntoView({ block: 'nearest' }); }
    }

    function finish() {
      if (!store.lesson(l.id).completed) store.completeLesson(l.id, true);
      drawComplete();
      const pending = l.activities.filter((a) => { const r = store.activity(a.id); return !(r && (r.everCorrect || r.reflected)); });
      const end = U.$('#lesson-end');
      end.hidden = false;
      end.innerHTML = '<h2>Lección completada</h2>' +
        (pending.length ? '<p>Te quedan ' + pending.length + ' actividad(es) sin resolver correctamente. Puedes repasarlas desde el índice de diapositivas o en <a href="#/cuestionarios">Cuestionarios</a>.</p>' : '<p>Resolviste todas las actividades de esta lección.</p>') +
        '<div class="row">' + (nextLesson ? '<a class="btn" href="#/leccion/' + nextLesson.id + '">Siguiente lección: ' + U.esc(nextLesson.title) + '</a>' : '<a class="btn" href="#/modulos">Volver a los módulos</a>') + '</div>';
      end.setAttribute('tabindex', '-1'); end.focus();
    }

    U.$('#prev').addEventListener('click', () => show(current - 1, true));
    U.$('#next').addEventListener('click', () => (current === l.slides.length - 1 ? finish() : show(current + 1, true)));
    jump.addEventListener('change', () => show(parseInt(jump.value, 10), true));
    indexList.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) show(parseInt(b.dataset.go, 10), true); });
    U.$('#toggle-index').addEventListener('click', (e) => {
      const panel = U.$('#slide-index'); panel.hidden = !panel.hidden;
      e.currentTarget.setAttribute('aria-expanded', String(!panel.hidden));
    });
    U.$('#complete').addEventListener('click', () => { store.completeLesson(l.id, !store.lesson(l.id).completed); drawComplete(); });
    U.$('#reset-acts').addEventListener('click', () => { U.$('#reset-confirm').hidden = false; U.$('#reset-yes').focus(); });
    U.$('#reset-no').addEventListener('click', () => { U.$('#reset-confirm').hidden = true; });
    U.$('#reset-yes').addEventListener('click', () => { store.resetActivities(l.activities.map((a) => a.id)); U.$('#reset-confirm').hidden = true; show(current, false); });

    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    keyHandler = (e) => {
      if (!document.body.contains(slideEl)) { document.removeEventListener('keydown', keyHandler); keyHandler = null; return; }
      const tag = (e.target.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag) || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight' && current < l.slides.length - 1) { e.preventDefault(); show(current + 1, true); }
      else if (e.key === 'ArrowLeft' && current > 0) { e.preventDefault(); show(current - 1, true); }
      else if (e.key === 'Home') { e.preventDefault(); show(0, true); }
      else if (e.key === 'End') { e.preventDefault(); show(l.slides.length - 1, true); }
    };
    document.addEventListener('keydown', keyHandler);

    drawComplete();
    show(current, false);
  }

  CB.views = CB.views || {};
  CB.views.lesson = lesson;
})(typeof window !== 'undefined' ? window : globalThis);
