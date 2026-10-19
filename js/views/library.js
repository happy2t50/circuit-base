/* Biblioteca de componentes y biblioteca de símbolos. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const U = CB.util, S = CB.shell;

  const FILTERS = [
    { id: 'todos', label: 'Todos', test: () => true },
    { id: 'polarizados', label: 'Polarizados', test: (c) => c.polarized === true },
    { id: 'sin-polaridad', label: 'Sin polaridad', test: (c) => c.polarized === false },
    { id: 'depende', label: 'Depende / patas fijas', test: (c) => c.polarized === 'depends' || c.polarized === 'pinout' }
  ];

  function components(ctx, params) {
    if (params && params.id) return componentDetail(ctx, params.id);
    const { store } = ctx;
    S.mount(
      '<header class="page-head"><h1>Biblioteca de componentes</h1><p class="lead">Selecciona una pieza para ver su símbolo, terminales, polaridad, cómo comprobarla, errores frecuentes y un ejercicio de identificación.</p></header>' +
      '<div class="filters" role="toolbar" aria-label="Filtrar componentes">' +
      '<label class="search"><span class="sr-only">Buscar componente</span><input id="comp-search" type="search" placeholder="Buscar: LED, relé, sensor…" autocomplete="off"></label>' +
      '<div class="seg" role="group" aria-label="Polaridad">' + FILTERS.map((f, i) => '<button type="button" data-filter="' + f.id + '" aria-pressed="' + (i === 0) + '">' + f.label + '</button>').join('') + '</div></div>' +
      '<p class="small muted" id="comp-count" aria-live="polite"></p><ul class="comp-grid" id="comp-grid"></ul>',
      { title: 'Componentes', nav: 'componentes' }
    );
    let filter = 'todos', q = '';
    const grid = U.$('#comp-grid');
    function draw() {
      const f = FILTERS.find((x) => x.id === filter);
      const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const items = CB.components.list.filter((c) => f.test(c) && (!q || norm(c.name + ' ' + c.category + ' ' + c.function).includes(norm(q))));
      U.$('#comp-count').textContent = items.length + ' de ' + CB.components.list.length + ' componentes';
      grid.innerHTML = items.map((c) => {
        const r = store.activity(c.exercise.id);
        return '<li><a class="comp-card" href="#/componentes/' + c.id + '"><span class="comp-ill">' + c.ill + '</span><span class="comp-name">' + U.esc(c.name) + '</span><span class="comp-meta">' + U.esc(c.category) + ' ' + S.polarityPill(c.polarized) + (r && r.everCorrect ? ' <span class="pill pill-ok">✓ ejercicio</span>' : '') + '</span></a></li>';
      }).join('') || '<li class="muted">Ningún componente coincide con la búsqueda.</li>';
    }
    U.$('#comp-search').addEventListener('input', (e) => { q = e.target.value.trim(); draw(); });
    U.$all('[data-filter]').forEach((b) => b.addEventListener('click', () => {
      filter = b.dataset.filter;
      U.$all('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      draw();
    }));
    draw();
  }

  function componentDetail(ctx, id) {
    const c = CB.components.byId[id];
    if (!c) return CB.views.notFound('No existe el componente «' + id + '».');
    const i = CB.components.list.indexOf(c);
    const prev = CB.components.list[i - 1], next = CB.components.list[i + 1];
    const symbols = [c.symbol, c.symbolAlt].filter(Boolean);
    const field = (n, label, html) => '<section class="field"><h2><span class="field-n">' + n + '</span>' + label + '</h2>' + html + '</section>';
    S.mount(
      '<nav class="crumbs" aria-label="Ruta"><a href="#/componentes">Componentes</a><span aria-hidden="true">/</span><span>' + U.esc(c.category) + '</span></nav>' +
      '<header class="comp-head"><div><p class="eyebrow">' + U.esc(c.category) + '</p><h1>' + U.esc(c.name) + '</h1>' + S.polarityPill(c.polarized) + '</div></header>' +
      '<div class="comp-visuals"><figure><div class="ill-wrap">' + c.ill + '</div><figcaption>Ilustración</figcaption></figure>' +
      '<figure><div class="sym-wrap">' + (symbols.length ? symbols.map((s) => CB.symbols.symbolSVG(s)).join('') : '<p class="muted small">No tiene un símbolo propio en los esquemas: se dibuja como sus partes o como un bloque con sus pines.</p>') + '</div><figcaption>Símbolo eléctrico' + (symbols.length ? ' · <a href="#/simbolos/' + symbols[0] + '">ver en la biblioteca</a>' : '') + '</figcaption></figure></div>' +
      '<div class="fields">' +
      field(4, 'Función', '<p>' + U.esc(c.function) + '</p>') +
      field(5, 'Terminales', '<p>' + U.esc(c.terminals) + '</p>') +
      field(6, 'Polaridad', '<p>' + U.esc(c.polarityNote) + '</p>') +
      field(7, 'Valores y especificaciones', '<p>' + U.esc(c.specs) + '</p>') +
      field(8, 'Cómo comprobarlo', '<p>' + U.esc(c.test) + '</p>') +
      field(9, 'Errores frecuentes', '<ul>' + c.mistakes.map((m) => '<li>' + U.esc(m) + '</li>').join('') + '</ul>') +
      field(10, 'Ejemplo práctico', '<p>' + U.esc(c.example) + '</p>') +
      '</div><section class="field"><h2><span class="field-n">11</span>Ejercicio de identificación</h2><div id="comp-ex"></div></section>' +
      '<nav class="pager" aria-label="Otros componentes">' + (prev ? '<a href="#/componentes/' + prev.id + '">← ' + U.esc(prev.name) + '</a>' : '<span></span>') + (next ? '<a href="#/componentes/' + next.id + '">' + U.esc(next.name) + ' →</a>' : '') + '</nav>',
      { title: c.name, nav: 'componentes' }
    );
    S.renderActivities(U.$('#comp-ex'), [c.exercise.id], ctx);
  }

  function symbols(ctx, params) {
    const selected = (params && params.id && CB.symbols.byId[params.id]) ? params.id : CB.symbols.list[0].id;
    S.mount(
      '<header class="page-head"><h1>Biblioteca de símbolos</h1><p class="lead">Selecciona un símbolo para ver qué significa, cómo se comporta y cuáles son sus terminales. Notación IEC, con la variante ANSI de la resistencia.</p></header>' +
      '<div class="sym-layout"><ul class="sym-grid" id="sym-grid" aria-label="Símbolos">' +
      CB.symbols.list.map((s) => '<li><button type="button" class="sym-tile" data-sym="' + s.id + '" aria-pressed="' + (s.id === selected) + '">' + CB.symbols.symbolSVG(s.id) + '<span>' + U.esc(s.name) + '</span></button></li>').join('') +
      '</ul><aside class="sym-detail" id="sym-detail" aria-live="polite"></aside></div>',
      { title: 'Símbolos', nav: 'simbolos' }
    );
    function showSym(id, fromClick) {
      const s = CB.symbols.byId[id];
      U.$all('[data-sym]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sym === id)));
      const polar = s.polarized === true ? 'Sí' : s.polarized === false ? 'No' : s.polarized === 'pinout' ? 'No se habla de polaridad, pero cada terminal tiene una función fija' : 'Depende del tipo';
      const comp = CB.components.list.find((c) => c.symbol === id || c.symbolAlt === id);
      U.$('#sym-detail').innerHTML = '<div class="sym-big">' + CB.symbols.symbolSVG(id) + '</div><h2>' + U.esc(s.name) + '</h2>' +
        '<dl class="defs"><dt>Significado</dt><dd>' + U.esc(s.meaning) + '</dd><dt>Comportamiento</dt><dd>' + U.esc(s.behavior) + '</dd><dt>Terminales</dt><dd>' + U.esc(s.terminals) + '</dd><dt>¿Polaridad?</dt><dd>' + polar + '</dd><dt>Ejemplos</dt><dd>' + U.esc(s.examples) + '</dd></dl>' +
        (comp ? '<a href="#/componentes/' + comp.id + '">Ver la ficha del componente: ' + U.esc(comp.name) + '</a>' : '');
      if (fromClick) { CB.router.replace('/simbolos/' + id); if (root.innerWidth < 760) U.$('#sym-detail').scrollIntoView({ block: 'start' }); }
    }
    U.$('#sym-grid').addEventListener('click', (e) => { const b = e.target.closest('[data-sym]'); if (b) showSym(b.dataset.sym, true); });
    showSym(selected, false);
  }

  CB.views = CB.views || {};
  CB.views.components = components;
  CB.views.symbols = symbols;
})(typeof window !== 'undefined' ? window : globalThis);
