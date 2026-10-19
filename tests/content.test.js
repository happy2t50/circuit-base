/* Pruebas de integridad y coherencia técnica del contenido educativo. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, ORDER, indexScripts } = require('./load');
const CB = load();

const allActivities = () => [
  ...CB.lessons.flatMap((l) => l.activities.map((a) => ({ a, where: 'lección ' + l.id }))),
  ...CB.components.list.map((c) => ({ a: c.exercise, where: 'componente ' + c.id })),
  ...CB.practices.list.flatMap((p) => p.questions.map((a) => ({ a, where: 'práctica ' + p.id })))
];

test('index.html carga todos los scripts de contenido y motores en el orden correcto', () => {
  const scripts = indexScripts();
  const positions = ORDER.map((f) => scripts.indexOf(f));
  assert.ok(positions.every((p) => p >= 0), 'faltan scripts en index.html');
  assert.deepEqual(positions, [...positions].sort((x, y) => x - y));
  assert.equal(scripts[scripts.length - 1], 'app.js');
});

test('identificadores de actividades únicos en toda la app', () => {
  const ids = allActivities().map((x) => x.a.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicados: ' + ids.filter((x, i) => ids.indexOf(x) !== i));
});

test('cada actividad tiene retroalimentación específica según su tipo', () => {
  for (const { a, where } of allActivities()) {
    const ctx = a.id + ' (' + where + ')';
    assert.ok(a.prompt && a.prompt.length > 10, 'enunciado: ' + ctx);
    if (a.type === 'mc') {
      assert.ok(a.options.length >= 2, ctx);
      assert.ok(a.options.some((o) => o.id === a.answer), 'respuesta inexistente: ' + ctx);
      a.options.forEach((o) => assert.ok(o.feedback && o.feedback.length >= 15, 'opción sin explicación: ' + ctx + ' ' + o.id));
    } else if (a.type === 'tf') {
      assert.equal(typeof a.answer, 'boolean', ctx);
      assert.ok(a.explain && a.whyWrong, 'falta explain/whyWrong: ' + ctx);
    } else if (a.type === 'numeric') {
      assert.ok(Number.isFinite(a.answer) && a.answer > 0, ctx);
      assert.ok(a.solution && a.unit, ctx);
      const tol = a.tolerance == null ? 0.02 : a.tolerance;
      (a.mistakes || []).forEach((m) => assert.ok(Math.abs(m.value - a.answer) > Math.abs(a.answer) * tol, 'un error típico coincide con la respuesta: ' + ctx));
    } else if (a.type === 'order') {
      assert.ok(a.steps.length >= 3, ctx);
      a.steps.forEach((s) => assert.ok(s.why, 'paso sin razón: ' + ctx + ' ' + s.id));
    } else if (a.type === 'hotspot') {
      const d = CB.diagrams.byId[a.media.diagram];
      assert.ok(d, 'diagrama inexistente: ' + ctx);
      const parts = Array.from(d.svg.matchAll(/data-part="([^"]+)"/g)).map((m) => m[1]);
      a.answer.forEach((p) => assert.ok(parts.includes(p), 'respuesta sin parte en el diagrama: ' + ctx + ' ' + p));
      Object.keys(a.feedback).forEach((p) => assert.ok(parts.includes(p), 'retroalimentación para parte inexistente: ' + ctx + ' ' + p));
      a.answer.forEach((p) => assert.ok(a.feedback[p], 'respuesta correcta sin explicación: ' + ctx));
    } else if (a.type === 'reflection') {
      assert.ok(a.model && a.model.length > 30, ctx);
    } else {
      assert.fail('tipo desconocido ' + a.type + ' en ' + ctx);
    }
  }
});

test('los ocho tipos de actividad pedidos están presentes', () => {
  const acts = allActivities().map((x) => x.a);
  const has = (pred) => acts.some(pred);
  assert.ok(has((a) => a.type === 'mc'), 'selección múltiple');
  assert.ok(has((a) => a.type === 'tf'), 'verdadero/falso');
  assert.ok(has((a) => a.kind === 'symbol'), 'identificación de símbolos');
  assert.ok(has((a) => a.kind === 'component'), 'identificación de componentes');
  assert.ok(has((a) => a.type === 'order'), 'ordenar pasos');
  assert.ok(has((a) => a.kind === 'diagram'), 'interpretación de diagramas');
  assert.ok(has((a) => a.kind === 'ohm' && a.type === 'numeric'), 'cálculos de ley de Ohm');
  assert.ok(has((a) => a.kind === 'error'), 'detección de errores');
  assert.ok(has((a) => a.type === 'reflection'), 'reflexión abierta');
  assert.ok(has((a) => a.kind === 'challenge'), 'reto práctico');
});

test('respuestas numéricas recalculadas de forma independiente', () => {
  const by = Object.fromEntries(allActivities().map((x) => [x.a.id, x.a]));
  const close = (a, b) => Math.abs(a - b) / b < 1e-9;
  assert.ok(close(by['m1-b1'].answer, 15 / 1000));
  assert.ok(close(by['m1-b2'].answer, 4.7 * 1000));
  assert.ok(close(by['m1-d2'].answer, (9 / 2200) * 1000));
  assert.ok(close(by['m1-d3'].answer, 12 / 0.02));
  assert.ok(close(by['m1-d4'].answer, (5 - 3) / 0.01));
  assert.ok(close(by['m1-d5'].answer, 0.012 * 470));
  assert.ok(close(by['m1-e1'].answer, (5 * 5) / 100));
  assert.ok(close(by['m1-e3'].answer, 7 * (7 / 470)));
  assert.ok(close(by['m3-a4'].answer, CB.ohm.seriesR([220, 330])));
  assert.ok(close(by['m3-a5'].answer, CB.ohm.parallelR([1000, 1000])));
  assert.ok(close(by['a1-q1'].answer, ((5 - 3) / 220) * 1000));
});

test('lecciones: diapositivas, referencias y medios válidos', () => {
  for (const l of CB.lessons) {
    assert.ok(l.slides.length >= 3, l.id);
    assert.ok(l.objectives.length >= 2, l.id);
    const referenced = new Set();
    l.slides.forEach((s, i) => {
      assert.ok(s.title && s.body && s.body.length > 60, 'diapositiva vacía o de relleno: ' + l.id + ' #' + i);
      [].concat(s.activity || []).forEach((id) => {
        assert.ok(l.activities.some((a) => a.id === id), 'actividad referida que no existe: ' + id);
        referenced.add(id);
      });
      if (s.media && s.media.diagram) assert.ok(CB.diagrams.byId[s.media.diagram], 'diagrama: ' + s.media.diagram);
      if (s.media && s.media.symbol) assert.ok(CB.symbols.draw[s.media.symbol], 'símbolo: ' + s.media.symbol);
      if (s.media && s.media.component) assert.ok(CB.components.byId[s.media.component], 'componente: ' + s.media.component);
      // Enlaces internos deben apuntar a rutas existentes
      for (const m of s.body.matchAll(/href="#\/([^"]*)"/g)) {
        const route = m[1].split('?')[0];
        const ok = /^(modulos|componentes|simbolos|laboratorio|cuestionarios|proyectos|progreso)?$/.test(route) ||
          (/^leccion\/(.+)$/.test(route) && CB.lessons.some((x) => x.id === route.split('/')[1])) ||
          (/^componentes\/(.+)$/.test(route) && CB.components.byId[route.split('/')[1]]);
        assert.ok(ok, 'enlace interno roto en ' + l.id + ': ' + route);
      }
    });
    l.activities.forEach((a) => assert.ok(referenced.has(a.id), 'actividad no usada en ninguna diapositiva: ' + a.id));
  }
});

test('Módulo 1 completo: cubre todo el temario pedido', () => {
  const m1 = CB.modules.find((m) => m.id === 'm1');
  assert.equal(m1.status, 'available');
  const text = CB.lessons.filter((l) => l.module === 'm1').map((l) => l.slides.map((s) => s.title + s.body + (s.more || '')).join(' ')).join(' ').toLowerCase();
  ['electricidad', 'electrones', 'voltaje', 'corriente', 'resistencia', 'corriente continua', 'alterna', 'conductores', 'aislantes', 'circuito abierto', 'cerrado', 'fuente', 'potencia', 'v = i × r', 'voltio', 'amperio', 'ohmio', 'vatio', 'multímetro', 'seguridad']
    .forEach((topic) => assert.ok(text.includes(topic), 'falta el tema: ' + topic));
});

test('currículo: 9 módulos, lecciones enlazadas una sola vez y con el módulo correcto', () => {
  assert.equal(CB.modules.length, 9);
  const seen = {};
  CB.modules.forEach((m) => (m.lessons || []).forEach((id) => {
    const l = CB.lessons.find((x) => x.id === id);
    assert.ok(l, 'lección inexistente ' + id);
    assert.equal(l.module, m.id);
    seen[id] = (seen[id] || 0) + 1;
  }));
  CB.lessons.forEach((l) => assert.equal(seen[l.id], 1, 'lección no listada o repetida: ' + l.id));
  CB.modules.filter((m) => m.status === 'planned').forEach((m) => assert.ok(!m.lessons || !m.lessons.length, m.id + ' es "Planeado" pero tiene lecciones'));
});

test('componentes: 16 fichas con los 11 campos', () => {
  assert.equal(CB.components.list.length, 16);
  const ALLOWED = [true, false, 'depends', 'pinout'];
  CB.components.list.forEach((c) => {
    ['name', 'ill', 'function', 'terminals', 'polarityNote', 'specs', 'test', 'example'].forEach((f) => assert.ok(c[f] && String(c[f]).length > 1, c.id + ' sin ' + f));
    assert.ok(ALLOWED.includes(c.polarized), c.id);
    assert.ok(c.mistakes.length >= 2, c.id);
    assert.ok(c.exercise && c.exercise.type === 'mc', c.id);
    if (c.symbol) assert.ok(CB.symbols.draw[c.symbol], c.id + ' símbolo');
    if (c.symbolAlt) assert.ok(CB.symbols.draw[c.symbolAlt], c.id + ' símbolo alternativo');
  });
});

test('polaridad: no se atribuye a componentes que no la tienen', () => {
  const p = (id) => CB.components.byId[id].polarized;
  ['resistencia', 'pulsador', 'potenciometro', 'ldr', 'termistor', 'protoboard', 'jumpers'].forEach((id) => assert.equal(p(id), false, id));
  ['led', 'diodo', 'fuente', 'sensores', 'arduino-uno'].forEach((id) => assert.equal(p(id), true, id));
  assert.equal(p('condensador'), 'depends');
  assert.equal(p('transistor'), 'pinout');
  const sym = (id) => CB.symbols.byId[id].polarized;
  ['resistor', 'resistor-us', 'capacitor', 'switch', 'pushbutton', 'ldr', 'thermistor'].forEach((id) => assert.equal(sym(id), false, id));
  ['diode', 'led', 'capacitor-pol', 'battery'].forEach((id) => assert.equal(sym(id), true, id));
});

test('símbolos: 21 entradas, todas dibujables, SVG balanceado', () => {
  assert.equal(CB.symbols.list.length, 21);
  CB.symbols.list.forEach((s) => {
    const svg = CB.symbols.symbolSVG(s.id);
    assert.ok(svg.startsWith('<svg'), s.id);
    const open = (svg.match(/<(svg|g|text)\b/g) || []).length, close = (svg.match(/<\/(svg|g|text)>/g) || []).length;
    assert.equal(open, close, 'etiquetas desbalanceadas en ' + s.id);
  });
});

test('diagramas: etiquetas balanceadas y descripción accesible', () => {
  CB.diagrams.list.forEach((d) => {
    const svg = CB.diagrams.diagramSVG(d.id);
    const open = (svg.match(/<(svg|g|text|title|desc)\b/g) || []).length, close = (svg.match(/<\/(svg|g|text|title|desc)>/g) || []).length;
    assert.equal(open, close, d.id);
    assert.ok(d.desc.length > 40, d.id);
  });
});

test('práctica A1: plantilla completa y código válido para Arduino Uno R3', () => {
  const p = CB.practices.list[0];
  ['objective', 'prerequisites', 'materials', 'diagram', 'layout', 'connections', 'calculations', 'sketch', 'codeExplain', 'expected', 'mistakes', 'questions', 'tinkercad', 'checklist']
    .forEach((f) => assert.ok(p[f] && (Array.isArray(p[f]) ? p[f].length : true), 'falta ' + f));
  assert.ok(CB.diagrams.byId[p.diagram]);
  assert.equal(p.code, 'A1', 'el código corto de la práctica no debe pisarse con el sketch');
  const code = p.sketch;
  assert.match(code, /void setup\(\)/);
  assert.match(code, /void loop\(\)/);
  const pins = Array.from(code.matchAll(/const int \w+ = (\d+);/g)).map((m) => +m[1]);
  pins.forEach((n) => assert.ok(n >= 2 && n <= 13, 'pin digital no recomendado: ' + n + ' (D0/D1 se usan para la carga)'));
  // analogWrite solo en pines PWM del Uno R3
  for (const m of code.matchAll(/analogWrite\((\d+)/g)) assert.ok([3, 5, 6, 9, 10, 11].includes(+m[1]));
  // Llaves balanceadas
  assert.equal((code.match(/{/g) || []).length, (code.match(/}/g) || []).length);
  // Explicaciones apuntan a líneas existentes y no vacías
  const lines = code.split('\n');
  p.codeExplain.forEach((e) => assert.ok(lines[e.line - 1] && lines[e.line - 1].trim(), 'línea ' + e.line));
  // Cálculo de seguridad: corriente por debajo de 20 mA
  const I = (5 - 2.0) / 220;
  assert.ok(I < 0.02);
  assert.ok(p.calculations.join(' ').includes('13,6 mA'));
  assert.match(p.tinkercad.url, /^https:\/\/www\.tinkercad\.com\//);
});
