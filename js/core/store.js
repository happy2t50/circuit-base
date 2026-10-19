/* Persistencia del progreso del estudiante.
 * Usa localStorage cuando existe; si falla (modo privado, almacenamiento bloqueado)
 * guarda en memoria y lo indica con store.persistent === false.
 * Los datos son locales a este navegador y dispositivo: NO hay sincronización. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const KEY = 'circuitoBase.progreso.v1';
  const SCHEMA = 1;

  function emptyState() {
    return {
      schema: SCHEMA,
      lessons: {},     // id → { slide, completed, completedAt, visitedAt }
      activities: {},  // id → { attempts, correct, everCorrect, lastAt, answer }
      practices: {},   // id → { checklist: {itemId: bool}, completed, completedAt }
      history: [],     // [{ at, kind, id, detail }] — últimos 200 eventos
      last: null       // { route, label }
    };
  }

  function createStore(storage) {
    let persistent = false;
    let backend = null;
    try {
      backend = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
      if (backend) {
        const probe = '__cb_probe__';
        backend.setItem(probe, '1');
        backend.removeItem(probe);
        persistent = true;
      }
    } catch (e) { persistent = false; backend = null; }

    let state = emptyState();
    let loadError = null;
    if (persistent) {
      try {
        const raw = backend.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.schema === SCHEMA) state = Object.assign(emptyState(), parsed);
          else loadError = 'El progreso guardado tiene un formato antiguo y se reinició.';
        }
      } catch (e) {
        loadError = 'No se pudo leer el progreso guardado; se empezó uno nuevo.';
      }
    }

    const listeners = new Set();
    function save() {
      if (persistent) {
        try { backend.setItem(KEY, JSON.stringify(state)); }
        catch (e) { persistent = false; api.persistent = false; }
      }
      listeners.forEach((fn) => { try { fn(state); } catch (e) { /* vista caída no rompe el guardado */ } });
    }
    function log(kind, id, detail) {
      state.history.unshift({ at: Date.now(), kind, id, detail: detail || '' });
      if (state.history.length > 200) state.history.length = 200;
    }

    const api = {
      persistent,
      loadError,
      get state() { return state; },
      onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },

      lesson(id) { return state.lessons[id] || { slide: 0, completed: false }; },
      setSlide(id, index) {
        const l = (state.lessons[id] = Object.assign({ slide: 0, completed: false }, state.lessons[id]));
        l.slide = index; l.visitedAt = Date.now();
        save();
      },
      completeLesson(id, done) {
        const l = (state.lessons[id] = Object.assign({ slide: 0, completed: false }, state.lessons[id]));
        l.completed = done !== false;
        l.completedAt = l.completed ? Date.now() : null;
        log('leccion', id, l.completed ? 'completada' : 'marcada como pendiente');
        save();
      },

      activity(id) { return state.activities[id] || null; },
      recordActivity(id, correct, answer) {
        const a = (state.activities[id] = Object.assign({ attempts: 0, everCorrect: false }, state.activities[id]));
        a.attempts += 1; a.correct = !!correct; a.everCorrect = a.everCorrect || !!correct;
        a.lastAt = Date.now(); a.answer = answer;
        log('actividad', id, correct ? 'correcta' : 'incorrecta');
        save();
      },
      saveReflection(id, text) {
        const a = (state.activities[id] = Object.assign({ attempts: 0, everCorrect: false }, state.activities[id]));
        a.answer = text; a.lastAt = Date.now(); a.reflected = text.trim().length > 0;
        save();
      },
      resetActivities(ids) {
        ids.forEach((id) => { delete state.activities[id]; });
        save();
      },

      practice(id) { return state.practices[id] || { checklist: {}, completed: false }; },
      setChecklist(id, item, value) {
        const p = (state.practices[id] = Object.assign({ checklist: {}, completed: false }, state.practices[id]));
        p.checklist[item] = !!value; save();
      },
      setPracticeChoice(id, choice) {
        const p = (state.practices[id] = Object.assign({ checklist: {}, completed: false }, state.practices[id]));
        p.choice = choice; log('practica', id, 'opción elegida: ' + choice); save();
      },
      completePractice(id, detail) {
        const p = (state.practices[id] = Object.assign({ checklist: {}, completed: false }, state.practices[id]));
        p.completed = true; p.completedAt = Date.now();
        log('practica', id, detail || 'completada'); save();
      },
      logLab(id, ok, detail) { log('laboratorio', id, (ok ? 'montaje correcto' : 'montaje con errores') + (detail ? ': ' + detail : '')); save(); },

      setLast(route, label) { state.last = { route, label, at: Date.now() }; save(); },

      exportJSON() { return JSON.stringify(state, null, 2); },
      /**
       * Restaura una copia de seguridad. Valida la estructura antes de tocar nada:
       * si el texto no es válido, el progreso actual queda intacto y se lanza un Error con el motivo.
       * mode 'replace' sustituye todo; 'merge' conserva lo mejor de ambos (lecciones completadas,
       * actividades resueltas, prácticas completadas) y une los historiales.
       */
      importJSON(text, mode) {
        let data;
        try { data = JSON.parse(text); } catch (e) { throw new Error('El texto no es JSON válido. Copia la copia de seguridad completa, desde la primera { hasta la última }.'); }
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('El contenido no es una copia de seguridad de Circuito Base.');
        if (data.schema !== SCHEMA) throw new Error('La copia es de un formato distinto (schema ' + data.schema + '; se esperaba ' + SCHEMA + ').');
        const isObj = (o) => o && typeof o === 'object' && !Array.isArray(o);
        for (const k of ['lessons', 'activities', 'practices']) if (data[k] !== undefined && !isObj(data[k])) throw new Error('El campo "' + k + '" no tiene el formato esperado.');
        if (data.history !== undefined && !Array.isArray(data.history)) throw new Error('El campo "history" no tiene el formato esperado.');
        const clean = emptyState();
        Object.entries(data.lessons || {}).forEach(([id, l]) => { if (isObj(l)) clean.lessons[id] = { slide: Number.isInteger(l.slide) && l.slide >= 0 ? l.slide : 0, completed: l.completed === true, completedAt: l.completedAt || null, visitedAt: l.visitedAt || null }; });
        Object.entries(data.activities || {}).forEach(([id, a]) => { if (isObj(a)) clean.activities[id] = { attempts: Number.isInteger(a.attempts) && a.attempts >= 0 ? a.attempts : 0, correct: a.correct === true ? true : a.correct === false ? false : undefined, everCorrect: a.everCorrect === true, reflected: a.reflected === true, lastAt: a.lastAt || null, answer: typeof a.answer === 'string' || typeof a.answer === 'number' || typeof a.answer === 'boolean' || Array.isArray(a.answer) ? a.answer : undefined }; });
        Object.entries(data.practices || {}).forEach(([id, p]) => {
          if (!isObj(p)) return;
          const checklist = {};
          if (isObj(p.checklist)) Object.entries(p.checklist).forEach(([k, v]) => { checklist[k] = v === true; });
          clean.practices[id] = { checklist, completed: p.completed === true, completedAt: p.completedAt || null, choice: typeof p.choice === 'string' ? p.choice : undefined };
        });
        clean.history = (data.history || []).filter((h) => isObj(h) && typeof h.kind === 'string' && typeof h.id === 'string').map((h) => ({ at: Number(h.at) || 0, kind: h.kind, id: h.id, detail: String(h.detail || '') })).slice(0, 200);
        if (isObj(data.last) && typeof data.last.route === 'string' && data.last.route.startsWith('/')) clean.last = { route: data.last.route, label: String(data.last.label || ''), at: data.last.at || null };

        if (mode === 'merge') {
          Object.entries(clean.lessons).forEach(([id, l]) => {
            const cur = state.lessons[id];
            state.lessons[id] = cur ? Object.assign({}, cur, { completed: cur.completed || l.completed, completedAt: cur.completedAt || l.completedAt, slide: Math.max(cur.slide || 0, l.slide) }) : l;
          });
          Object.entries(clean.activities).forEach(([id, a]) => {
            const cur = state.activities[id];
            if (!cur || (a.lastAt || 0) > (cur.lastAt || 0)) state.activities[id] = Object.assign({}, a, { everCorrect: a.everCorrect || !!(cur && cur.everCorrect), reflected: a.reflected || !!(cur && cur.reflected) });
            else cur.everCorrect = cur.everCorrect || a.everCorrect;
          });
          Object.entries(clean.practices).forEach(([id, p]) => {
            const cur = state.practices[id];
            state.practices[id] = cur ? { checklist: Object.assign({}, p.checklist, cur.checklist), completed: cur.completed || p.completed, completedAt: cur.completedAt || p.completedAt, choice: cur.choice || p.choice } : p;
          });
          const seen = new Set(state.history.map((h) => h.at + h.kind + h.id + h.detail));
          state.history = state.history.concat(clean.history.filter((h) => !seen.has(h.at + h.kind + h.id + h.detail))).sort((x, y) => y.at - x.at).slice(0, 200);
        } else {
          state = clean;
        }
        log('importacion', 'progreso', mode === 'merge' ? 'copia combinada' : 'copia restaurada');
        save();
        return { lessons: Object.keys(clean.lessons).length, activities: Object.keys(clean.activities).length, practices: Object.keys(clean.practices).length };
      },
      resetAll() { state = emptyState(); save(); }
    };
    return api;
  }

  CB.createStore = createStore;
  CB.STORE_KEY = KEY;
})(typeof window !== 'undefined' ? window : globalThis);
