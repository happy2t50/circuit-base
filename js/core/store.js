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
      completePractice(id, detail) {
        const p = (state.practices[id] = Object.assign({ checklist: {}, completed: false }, state.practices[id]));
        p.completed = true; p.completedAt = Date.now();
        log('practica', id, detail || 'completada'); save();
      },
      logLab(id, ok, detail) { log('laboratorio', id, (ok ? 'montaje correcto' : 'montaje con errores') + (detail ? ': ' + detail : '')); save(); },

      setLast(route, label) { state.last = { route, label, at: Date.now() }; save(); },

      exportJSON() { return JSON.stringify(state, null, 2); },
      resetAll() { state = emptyState(); save(); }
    };
    return api;
  }

  CB.createStore = createStore;
  CB.STORE_KEY = KEY;
})(typeof window !== 'undefined' ? window : globalThis);
