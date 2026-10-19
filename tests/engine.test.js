/* Pruebas de los motores: ley de Ohm, utilidades, verificador de protoboard, almacenamiento y actividades. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load');
const CB = load();

const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

test('ley de Ohm: resuelve la magnitud que falta', () => {
  assert.ok(near(CB.ohm.solveOhm({ V: 5, R: 1000 }).I, 0.005));
  assert.ok(near(CB.ohm.solveOhm({ V: 5, I: 0.025 }).R, 200));
  assert.ok(near(CB.ohm.solveOhm({ I: 0.015, R: 330 }).V, 4.95));
  assert.ok(near(CB.ohm.solveOhm({ V: 12, R: 100 }).P, 1.44));
  assert.throws(() => CB.ohm.solveOhm({ V: 5 }), /dos valores/);
  assert.throws(() => CB.ohm.solveOhm({ V: 5, R: 0 }), /mayor que cero/);
});

test('resistencia de LED y serie E12', () => {
  assert.ok(near(CB.ohm.ledResistor(5, 2, 0.015), 200));
  assert.equal(CB.ohm.nextE12(200), 220);
  assert.equal(CB.ohm.nextE12(150), 150);
  assert.equal(CB.ohm.nextE12(4700), 4700);
  assert.equal(CB.ohm.nextE12(600), 680);
  assert.equal(CB.ohm.nextE12(830), 1000);
  assert.throws(() => CB.ohm.ledResistor(2, 3, 0.01), /superar/);
  assert.ok(near(CB.ohm.parallelR([1000, 1000]), 500));
  assert.equal(CB.ohm.seriesR([220, 330]), 550);
});

test('parseNumber entiende comas, prefijos y unidades', () => {
  const p = CB.util.parseNumber;
  assert.ok(near(p('0,02'), 0.02));
  assert.ok(near(p('20m'), 0.02));
  assert.ok(near(p('4.7k'), 4700));
  assert.ok(near(p('1M'), 1e6));
  assert.ok(near(p('220 Ω'), 220));
  assert.ok(near(p('5V'), 5));
  assert.ok(Number.isNaN(p('abc')));
  assert.ok(Number.isNaN(p('')));
});

test('fmtUnit usa prefijos SI', () => {
  assert.equal(CB.util.fmtUnit(0.0136, 'A'), '13.6 mA');
  assert.equal(CB.util.fmtUnit(4700, 'ohm'), '4.7 kΩ');
  assert.equal(CB.util.fmtUnit(0.25, 'W'), '250 mW');
});

/* ---------- Protoboard ---------- */
const B = () => CB.breadboard;
const ex = () => CB.labExercises[0];

test('modelo de protoboard: tiras de 5 y carriles continuos', () => {
  assert.equal(B().baseNet('a10'), 'T10');
  assert.equal(B().baseNet('e10'), 'T10');
  assert.equal(B().baseNet('f10'), 'B10');
  assert.notEqual(B().baseNet('e10'), B().baseNet('f10'), 'el canal central separa los bloques');
  assert.equal(B().baseNet('tp1'), B().baseNet('tp30'));
  assert.notEqual(B().baseNet('tp1'), B().baseNet('tn1'));
  assert.equal(B().baseNet('k1'), null);
  assert.equal(B().baseNet('a31'), null);
  assert.equal(B().holesInSameNet('c9').length, 5);
  assert.equal(B().holesInSameNet('tn4').length, 30);
});

test('verificador: la solución de referencia es correcta', () => {
  const r = B().evaluate(ex(), ex().solution);
  assert.equal(r.ok, true, JSON.stringify(r.errors));
});

test('verificador: resistencia después del LED también es válida', () => {
  const r = B().evaluate(ex(), { 'LED1.A': 'tp6', 'LED1.K': 'b6', 'R1.1': 'c6', 'R1.2': 'tn6' });
  assert.equal(r.ok, true, JSON.stringify(r.errors));
});

test('verificador: detecta LED invertido', () => {
  const r = B().evaluate(ex(), { 'R1.1': 'tp6', 'R1.2': 'b6', 'LED1.K': 'c6', 'LED1.A': 'c9', 'J1.A': 'a9', 'J1.B': 'tn9' });
  assert.equal(r.ok, false);
  assert.equal(r.errors[0].code, 'led-reversed');
});

test('verificador: detecta LED sin resistencia', () => {
  const r = B().evaluate(ex(), { 'LED1.A': 'tp6', 'LED1.K': 'tn6', 'R1.1': 'a20', 'R1.2': 'a22' });
  assert.equal(r.errors[0].code, 'no-resistor');
});

test('verificador: detecta componente con ambas patas en la misma tira', () => {
  const r = B().evaluate(ex(), { 'R1.1': 'a6', 'R1.2': 'b6', 'LED1.A': 'c6', 'LED1.K': 'c9' });
  assert.ok(r.errors.some((e) => e.code === 'shorted-part'));
});

test('verificador: detecta cortocircuito de alimentación', () => {
  const r = B().evaluate(ex(), Object.assign({}, ex().solution, { 'J2.A': 'tp20', 'J2.B': 'tn20' }));
  assert.equal(r.errors[0].code, 'supply-short');
});

test('verificador: detecta camino abierto a GND', () => {
  const r = B().evaluate(ex(), { 'R1.1': 'tp6', 'R1.2': 'b6', 'LED1.A': 'c6', 'LED1.K': 'c9' });
  assert.ok(r.errors.some((e) => e.code === 'no-gnd'));
});

test('verificador: detecta resistencia y ánodo en tiras distintas', () => {
  const r = B().evaluate(ex(), { 'R1.1': 'tp6', 'R1.2': 'b6', 'LED1.A': 'c7', 'LED1.K': 'c9', 'J1.A': 'a9', 'J1.B': 'tn9' });
  assert.ok(r.errors.some((e) => e.code === 'r-led-gap'));
});

test('verificador: terminales sin colocar, orificio repetido y cable a medias', () => {
  assert.equal(B().evaluate(ex(), {}).errors.filter((e) => e.code === 'unplaced').length, 4);
  const dbl = B().evaluate(ex(), Object.assign({}, ex().solution, { 'LED1.A': 'b6' }));
  assert.ok(dbl.errors.some((e) => e.code === 'double'));
  const half = B().evaluate(ex(), Object.assign({}, ex().solution, { 'J2.A': 'a20' }));
  assert.ok(half.errors.some((e) => e.code === 'half-wire'));
});

test('práctica A1: el montaje dibujado coincide con el esquema (D8 → R → LED → GND)', () => {
  const p = CB.practices.list[0];
  const r = B().evaluate(p.layout, p.layout.placement);
  assert.equal(r.ok, true, JSON.stringify(r.errors));
});

/* ---------- Almacenamiento ---------- */
function memoryStorage() {
  const data = {};
  return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, removeItem: (k) => { delete data[k]; }, _data: data };
}

test('store: guarda y recupera el progreso', () => {
  const mem = memoryStorage();
  const s1 = CB.createStore(mem);
  assert.equal(s1.persistent, true);
  s1.setSlide('m1-ohm', 3);
  s1.completeLesson('m1-ohm');
  s1.recordActivity('m1-d2', false, '1');
  s1.recordActivity('m1-d2', true, '4.09');
  s1.setChecklist('a1-blink-externo', 'usb', true);
  const s2 = CB.createStore(mem);
  assert.equal(s2.lesson('m1-ohm').slide, 3);
  assert.equal(s2.lesson('m1-ohm').completed, true);
  assert.deepEqual([s2.activity('m1-d2').attempts, s2.activity('m1-d2').correct, s2.activity('m1-d2').everCorrect], [2, true, true]);
  assert.equal(s2.practice('a1-blink-externo').checklist.usb, true);
  s2.resetActivities(['m1-d2']);
  assert.equal(CB.createStore(mem).activity('m1-d2'), null);
});

test('store: sin almacenamiento disponible funciona en memoria y lo indica', () => {
  const broken = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); }, removeItem() {} };
  const s = CB.createStore(broken);
  assert.equal(s.persistent, false);
  s.setSlide('m1-ohm', 2);
  assert.equal(s.lesson('m1-ohm').slide, 2);
});

test('store: datos corruptos no rompen la app', () => {
  const mem = memoryStorage();
  mem.setItem(CB.STORE_KEY, '{no es json');
  const s = CB.createStore(mem);
  assert.ok(s.loadError);
  assert.deepEqual(s.state.lessons, {});
});

test('store: el historial se limita a 200 eventos y resetAll lo borra todo', () => {
  const s = CB.createStore(memoryStorage());
  for (let i = 0; i < 230; i++) s.recordActivity('x', true, i);
  assert.equal(s.state.history.length, 200);
  s.resetAll();
  assert.equal(s.state.history.length, 0);
});

/* ---------- Actividades ---------- */
const A = () => CB.activities;
const actById = (id) => CB.lessons.flatMap((l) => l.activities).find((a) => a.id === id);

test('numérica: acepta la unidad pedida y prefijos', () => {
  const a = actById('m1-d2'); // 9 V / 2,2 kΩ en mA
  assert.equal(A().evaluate(a, '4,09').correct, true);
  assert.equal(A().evaluate(a, '4.09 mA').correct, true, 'la unidad "mA" escrita por el estudiante no debe aplicarse dos veces');
  const amps = A().evaluate(a, '0.00409');
  assert.equal(amps.correct, false);
  assert.match(amps.feedback, /amperios/);
  assert.match(A().evaluate(a, 'hola').feedback, /Escribe un número/);
});

test('numérica: los errores típicos tienen retroalimentación propia', () => {
  assert.match(A().evaluate(actById('m1-d4'), '500').feedback, /restar la tensión directa/);
  assert.match(A().evaluate(actById('m1-e3'), String(81 / 470)).feedback, /9 V/);
});

test('selección múltiple y verdadero/falso explican la respuesta', () => {
  const mc = actById('m1-d1');
  const wrong = A().evaluate(mc, 'a');
  assert.equal(wrong.correct, false);
  assert.ok(wrong.feedback.length > 20);
  assert.equal(A().evaluate(mc, 'b').correct, true);
  const tf = actById('m1-a2');
  const r = A().evaluate(tf, true);
  assert.equal(r.correct, false);
  assert.match(r.feedback, /electrones/);
});

test('ordenar: el orden inicial nunca es el correcto y se evalúa por posición', () => {
  const o = actById('m1-f4');
  const init = A().initialOrder(o);
  assert.notDeepEqual(init, o.steps.map((s) => s.id));
  assert.equal(new Set(init).size, o.steps.length);
  assert.equal(A().evaluate(o, o.steps.map((s) => s.id)).correct, true);
  const bad = A().evaluate(o, init);
  assert.equal(bad.correct, false);
  assert.match(bad.feedback, /fuera de lugar/);
});

test('diagrama interactivo y reflexión', () => {
  const h = actById('m3-a6');
  assert.equal(A().evaluate(h, 'led1').correct, true);
  const r1 = A().evaluate(h, 'r1');
  assert.equal(r1.correct, false);
  assert.match(r1.feedback, /R1 está bien/);
  const refl = actById('m1-a3');
  assert.equal(A().evaluate(refl, 'corto').correct, false);
  assert.equal(A().evaluate(refl, 'El cobre conduce y el plástico aísla del exterior.').correct, true);
});
