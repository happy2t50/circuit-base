/* Motor de actividades. Cada tipo tiene: evaluate(act, answer) → { correct, feedback }
 * (pura, probada en Node) y render(...) (solo navegador).
 * Toda respuesta devuelve una explicación específica, nunca solo "correcto/incorrecto". */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const U = CB.util;

  const LABELS = {
    mc: 'Selección múltiple', tf: 'Verdadero o falso', numeric: 'Cálculo',
    order: 'Ordenar pasos', hotspot: 'Interpretar diagrama', reflection: 'Reflexión'
  };
  /** Etiqueta pedagógica: una actividad puede declarar `kind` para mostrar el propósito real. */
  const KIND_LABELS = {
    symbol: 'Identificación de símbolos', component: 'Identificación de componentes',
    diagram: 'Interpretación de diagramas', error: 'Detección de errores', ohm: 'Ley de Ohm', challenge: 'Reto práctico'
  };
  function labelOf(act) { return KIND_LABELS[act.kind] || LABELS[act.type] || 'Actividad'; }

  /* ---------- Evaluadores puros ---------- */
  const evaluators = {
    mc(act, answer) {
      const opt = act.options.find((o) => o.id === answer);
      if (!opt) return { correct: false, feedback: 'Elige una opción.' };
      const correct = answer === act.answer;
      return { correct, feedback: opt.feedback + (correct && act.explain ? ' ' + act.explain : '') };
    },
    tf(act, answer) {
      if (typeof answer !== 'boolean') return { correct: false, feedback: 'Elige verdadero o falso.' };
      const correct = answer === act.answer;
      return { correct, feedback: (correct ? '' : (act.whyWrong ? act.whyWrong + ' ' : '')) + act.explain };
    },
    numeric(act, answer) {
      let raw = answer;
      // Si el estudiante escribe la misma unidad que pide la pregunta ("4,09 mA"), se quita entera
      // para que el prefijo "m" no se interprete dos veces.
      if (typeof raw === 'string' && act.unit && raw.trim().toLowerCase().endsWith(act.unit.toLowerCase())) {
        raw = raw.trim().slice(0, -act.unit.length);
      }
      const value = typeof raw === 'number' ? raw : U.parseNumber(raw);
      if (!isFinite(value)) return { correct: false, feedback: 'Escribe un número. Puedes usar prefijos: 0.02, 20m o 1.5k.' };
      const tol = act.tolerance == null ? 0.02 : act.tolerance;
      const close = (target) => Math.abs(value - target) <= Math.abs(target) * tol + 1e-12;
      if (close(act.answer)) return { correct: true, feedback: '✔ ' + act.solution };
      const mistake = (act.mistakes || []).find((m) => close(m.value));
      const base = mistake ? mistake.feedback : 'Ese resultado no coincide.';
      return { correct: false, feedback: base + (act.hint ? ' Pista: ' + act.hint : '') };
    },
    order(act, answer) {
      if (!Array.isArray(answer) || answer.length !== act.steps.length) return { correct: false, feedback: 'Ordena todos los pasos.' };
      const expected = act.steps.map((s) => s.id);
      const wrong = answer.map((id, i) => (id !== expected[i] ? i + 1 : null)).filter(Boolean);
      if (!wrong.length) return { correct: true, feedback: act.explain };
      // Señala el primer paso fuera de lugar con su razón
      const firstBad = act.steps.find((s, i) => answer[i] !== s.id);
      return { correct: false, feedback: 'Hay ' + wrong.length + ' paso(s) fuera de lugar (posiciones ' + wrong.join(', ') + '). Fíjate en este: «' + firstBad.text + '». ' + (firstBad.why || '') };
    },
    hotspot(act, answer) {
      if (!answer) return { correct: false, feedback: 'Haz clic en una parte del diagrama.' };
      const correct = act.answer.includes(answer);
      const fb = (act.feedback && act.feedback[answer]) || act.defaultFeedback || '';
      return { correct, feedback: fb + (correct && act.explain ? ' ' + act.explain : '') };
    },
    reflection(act, answer) {
      const ok = typeof answer === 'string' && answer.trim().length >= 15;
      return { correct: ok, feedback: ok ? 'Compara tu respuesta con esta referencia: ' + act.model : 'Escribe al menos una frase completa antes de ver la referencia.' };
    }
  };

  function evaluate(act, answer) {
    const fn = evaluators[act.type];
    if (!fn) throw new Error('Tipo de actividad desconocido: ' + act.type);
    return fn(act, answer);
  }

  /** Orden inicial desordenado pero estable (no aleatorio, para que reintentar sea predecible). */
  function initialOrder(act) {
    const ids = act.steps.map((s) => s.id);
    // Primero las posiciones impares y luego las pares: nunca coincide con el orden correcto si hay 2+ pasos.
    return ids.filter((_, i) => i % 2 === 1).concat(ids.filter((_, i) => i % 2 === 0));
  }

  /* ---------- Renderizado (navegador) ---------- */
  function render(act, ctx) {
    const { store, onResult, getMedia } = ctx;
    const prev = store.activity(act.id);
    const wrap = document.createElement('section');
    wrap.className = 'activity';
    wrap.dataset.activity = act.id;
    wrap.setAttribute('aria-labelledby', act.id + '-title');

    const status = prev ? (prev.everCorrect || prev.reflected ? '<span class="pill pill-ok">Resuelta</span>' : '<span class="pill pill-warn">Por repasar</span>') : '';
    wrap.innerHTML =
      '<header class="activity-head"><span class="eyebrow">' + U.esc(labelOf(act)) + '</span>' + status + '</header>' +
      '<h3 class="activity-title" id="' + act.id + '-title">' + act.prompt + '</h3>' +
      (act.media ? '<div class="activity-media">' + getMedia(act.media) + '</div>' : '') +
      '<div class="activity-body"></div>' +
      '<div class="feedback" role="status" aria-live="polite" hidden></div>' +
      '<div class="activity-actions"></div>';

    const body = U.$('.activity-body', wrap);
    const fbBox = U.$('.feedback', wrap);
    const actions = U.$('.activity-actions', wrap);

    function showFeedback(res) {
      fbBox.hidden = false;
      fbBox.className = 'feedback ' + (res.correct ? 'is-ok' : 'is-bad');
      fbBox.innerHTML = '<strong>' + (res.correct ? (act.type === 'reflection' ? 'Respuesta guardada.' : 'Correcto.') : (act.type === 'reflection' ? 'Aún no.' : 'Todavía no.')) + '</strong> ' + res.feedback;
    }
    function submit(answer) {
      const res = evaluate(act, answer);
      if (act.type === 'reflection') { if (res.correct) store.saveReflection(act.id, answer); }
      else store.recordActivity(act.id, res.correct, answer);
      showFeedback(res);
      if (onResult) onResult(act, res);
      return res;
    }
    function retryButton(resetFn) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn btn-ghost'; b.textContent = 'Reintentar';
      b.addEventListener('click', () => { fbBox.hidden = true; resetFn(); });
      return b;
    }

    if (act.type === 'mc' || act.type === 'tf') {
      const opts = act.type === 'tf'
        ? [{ id: 'true', text: 'Verdadero' }, { id: 'false', text: 'Falso' }]
        : act.options;
      const group = document.createElement('div');
      group.className = 'choices' + (act.type === 'tf' ? ' choices-row' : '');
      group.setAttribute('role', 'group');
      opts.forEach((o, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'choice' + (o.svg ? ' choice-visual' : ''); b.dataset.value = o.id;
        // En identificación de símbolos no se muestra el nombre: daría la respuesta.
        const caption = act.revealLabels === false ? 'Opción ' + String.fromCharCode(65 + i) : o.text;
        b.innerHTML = o.svg ? '<span class="choice-media">' + getMedia({ symbol: o.svg, label: caption }) + '</span><span>' + U.esc(caption) + '</span>' : U.esc(o.text);
        b.addEventListener('click', () => {
          U.$all('.choice', group).forEach((c) => c.classList.remove('is-chosen', 'is-ok', 'is-bad'));
          const answer = act.type === 'tf' ? o.id === 'true' : o.id;
          const res = submit(answer);
          b.classList.add('is-chosen', res.correct ? 'is-ok' : 'is-bad');
          b.setAttribute('aria-pressed', 'true');
        });
        group.appendChild(b);
      });
      body.appendChild(group);
      actions.appendChild(retryButton(() => U.$all('.choice', group).forEach((c) => { c.classList.remove('is-chosen', 'is-ok', 'is-bad'); c.removeAttribute('aria-pressed'); })));
    }

    if (act.type === 'numeric') {
      const id = act.id + '-input';
      body.innerHTML =
        '<form class="numeric" novalidate><label for="' + id + '">Tu resultado</label>' +
        '<div class="numeric-row"><input id="' + id + '" inputmode="decimal" autocomplete="off" placeholder="ej. 0.02">' +
        '<span class="unit">' + U.esc(act.unit) + '</span><button class="btn" type="submit">Comprobar</button></div>' +
        (act.steps ? '<details class="more"><summary>Ver procedimiento</summary><ol>' + act.steps.map((s) => '<li>' + s + '</li>').join('') + '</ol></details>' : '') +
        '</form>';
      const form = U.$('form', body), input = U.$('input', body);
      form.addEventListener('submit', (e) => { e.preventDefault(); submit(input.value); });
      actions.appendChild(retryButton(() => { input.value = ''; input.focus(); }));
    }

    if (act.type === 'order') {
      let order = initialOrder(act);
      const list = document.createElement('ol');
      list.className = 'order-list';
      const draw = () => {
        list.innerHTML = '';
        order.forEach((sid, i) => {
          const step = act.steps.find((s) => s.id === sid);
          const li = document.createElement('li');
          li.className = 'order-item';
          li.innerHTML = '<span class="order-text">' + U.esc(step.text) + '</span>' +
            '<span class="order-btns"><button type="button" class="icon-btn" aria-label="Subir: ' + U.esc(step.text) + '"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
            '<button type="button" class="icon-btn" aria-label="Bajar: ' + U.esc(step.text) + '"' + (i === order.length - 1 ? ' disabled' : '') + '>↓</button></span>';
          const [up, down] = U.$all('button', li);
          up.addEventListener('click', () => { [order[i - 1], order[i]] = [order[i], order[i - 1]]; draw(); U.$all('.icon-btn', list)[(i - 1) * 2]?.focus(); });
          down.addEventListener('click', () => { [order[i + 1], order[i]] = [order[i], order[i + 1]]; draw(); U.$all('.icon-btn', list)[(i + 1) * 2 + 1]?.focus(); });
          list.appendChild(li);
        });
      };
      draw();
      body.appendChild(list);
      const check = document.createElement('button');
      check.type = 'button'; check.className = 'btn'; check.textContent = 'Comprobar orden';
      check.addEventListener('click', () => submit(order.slice()));
      actions.appendChild(check);
      actions.appendChild(retryButton(() => { order = initialOrder(act); draw(); }));
    }

    if (act.type === 'hotspot') {
      body.innerHTML = '<p class="muted small">Haz clic (o usa Tab y Enter) sobre la parte del diagrama que responde la pregunta.</p>';
      const svgHost = U.$('.activity-media', wrap);
      const parts = U.$all('[data-part]', svgHost);
      // Un SVG con botones dentro no puede ser role="img": pasa a ser un grupo con nombre.
      U.$all('svg.diagram', svgHost).forEach((svg) => svg.setAttribute('role', 'group'));
      parts.forEach((p) => {
        p.classList.add('hotspot');
        p.setAttribute('tabindex', '0');
        p.setAttribute('role', 'button');
        if (p.dataset.label) p.setAttribute('aria-label', p.dataset.label);
        const pick = () => {
          parts.forEach((q) => q.classList.remove('is-ok', 'is-bad'));
          const res = submit(p.dataset.part);
          p.classList.add(res.correct ? 'is-ok' : 'is-bad');
        };
        p.addEventListener('click', pick);
        p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
      actions.appendChild(retryButton(() => parts.forEach((q) => q.classList.remove('is-ok', 'is-bad'))));
    }

    if (act.type === 'reflection') {
      const id = act.id + '-text';
      body.innerHTML = '<label for="' + id + '" class="sr-only">Tu respuesta</label><textarea id="' + id + '" rows="4" placeholder="Escribe con tus palabras…"></textarea>' +
        '<p class="muted small">No hay calificación automática: escribe tu idea y compárala con la referencia.</p>';
      const ta = U.$('textarea', body);
      if (prev && prev.answer) ta.value = prev.answer;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn'; b.textContent = 'Guardar y ver referencia';
      b.addEventListener('click', () => submit(ta.value));
      actions.appendChild(b);
    }

    return wrap;
  }

  /**
   * Tras insertar una actividad en la página, añade a cada parte clicable de un diagrama un rectángulo
   * invisible que cubre su caja. Así un cable fino o el hueco dentro de un símbolo también responden al
   * clic en Chrome, Firefox y Safari (pointer-events: bounding-box solo existe en Chrome).
   */
  function afterMount(root) {
    U.$all('[data-part].hotspot', root).forEach((g) => {
      if (g.querySelector(':scope > rect.hit')) return;
      let box;
      try { box = g.getBBox(); } catch (e) { return; }
      if (!box || !box.width && !box.height) return;
      const pad = 6;
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('class', 'hit');
      r.setAttribute('x', box.x - pad); r.setAttribute('y', box.y - pad);
      r.setAttribute('width', box.width + pad * 2); r.setAttribute('height', box.height + pad * 2);
      g.insertBefore(r, g.firstChild);
    });
  }

  CB.activities = { afterMount, evaluate, render, labelOf, initialOrder, LABELS, KIND_LABELS };
})(typeof window !== 'undefined' ? window : globalThis);
