/* Arranque de la aplicación: crea el almacenamiento, construye los índices y registra las rutas. */
(function (root) {
  'use strict';
  const CB = root.CB;

  function boot() {
    let store, index;
    try {
      store = CB.createStore();
      index = CB.shell.buildIndex();
    } catch (err) {
      document.getElementById('view').innerHTML = '<div class="callout danger"><strong>No se pudo iniciar la aplicación.</strong> ' + CB.util.esc(err.message) + '</div>';
      throw err;
    }
    const ctx = { store, index };
    CB.app = ctx; // útil para depurar desde la consola

    const safe = (fn) => (params, query) => {
      try { fn(ctx, params || {}, query || {}); }
      catch (err) {
        console.error(err);
        document.getElementById('view').innerHTML = '<div class="callout danger" role="alert"><strong>Algo falló al mostrar esta página.</strong> ' + CB.util.esc(err.message) + ' <a href="#/">Volver al inicio</a></div>';
      }
    };

    const R = CB.router, V = CB.views;
    R.add('/', safe(V.dashboard));
    R.add('/modulos', safe(V.modules));
    R.add('/leccion/:id', safe(V.lesson));
    R.add('/componentes', safe(V.components));
    R.add('/componentes/:id', safe(V.components));
    R.add('/simbolos', safe(V.symbols));
    R.add('/simbolos/:id', safe(V.symbols));
    R.add('/laboratorio', safe(V.lab));
    R.add('/cuestionarios', safe(V.quizzes));
    R.add('/proyectos', safe(V.projects));
    R.add('/proyectos/:id', safe(V.projects));
    R.add('/progreso', safe(V.progress));
    R.setNotFound((path) => V.notFound('No existe la ruta «' + path + '».'));

    // Menú móvil
    const toggle = document.getElementById('nav-toggle'), nav = document.getElementById('site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => { const open = nav.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', String(open)); });
      nav.addEventListener('click', (e) => { if (e.target.closest('a')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); } });
    }
    R.start();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
