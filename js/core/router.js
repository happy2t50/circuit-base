/* Enrutador por hash: #/ruta/:param?clave=valor. Funciona con file:// y cualquier servidor estático. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const routes = [];
  let notFound = null;

  function add(pattern, handler) {
    const keys = [];
    const rx = new RegExp('^' + pattern.replace(/:([a-zA-Z]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
    routes.push({ rx, keys, handler, pattern });
  }

  function parse(hash) {
    const raw = ((hash || '').replace(/^#/, '') || '/').split('#')[0]; // "#/modulos#m3" → ancla interna m3
    const [path, qs] = raw.split('?');
    const query = {};
    (qs || '').split('&').filter(Boolean).forEach((pair) => {
      const [k, v] = pair.split('=');
      query[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return { path: path.startsWith('/') ? path : '/' + path, query };
  }

  function resolve() {
    const { path, query } = parse(root.location.hash);
    for (const r of routes) {
      const m = path.match(r.rx);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
        return r.handler(params, query, path);
      }
    }
    if (notFound) notFound(path);
  }

  function go(path) {
    if (root.location.hash === '#' + path) resolve();
    else root.location.hash = path;
  }

  /** Cambia la URL sin volver a renderizar (p. ej. al moverse entre diapositivas). */
  function replace(path) {
    try { root.history.replaceState(null, '', '#' + path); } catch (e) { /* entornos restringidos */ }
  }

  function start() { root.addEventListener('hashchange', resolve); resolve(); }

  CB.router = { add, start, go, replace, parse, setNotFound: (fn) => { notFound = fn; } };
})(typeof window !== 'undefined' ? window : globalThis);
