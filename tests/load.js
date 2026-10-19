/* Carga los scripts de la app en Node (sin DOM) en el mismo orden que index.html. */
'use strict';
const path = require('path');
const fs = require('fs');

const ORDER = [
  'core/util.js', 'core/store.js', 'core/router.js',
  'engine/ohm.js', 'engine/breadboard.js', 'engine/activities.js',
  'content/symbols.js', 'content/diagrams.js', 'content/diagrams-compose.js', 'content/components.js', 'content/curriculum.js',
  'content/lessons-m1.js', 'content/lessons-m2-m3.js', 'content/practices.js', 'content/lab.js',
  'content/lessons-m2b-m3b-m4.js', 'content/lessons-m6.js', 'content/lessons-m7.js', 'content/lessons-m8.js',
  'content/practices-m5.js', 'content/practices-m7-m9.js'
];

function load() {
  delete globalThis.CB;
  ORDER.forEach((f) => {
    const file = path.join(__dirname, '..', 'js', f);
    // eslint-disable-next-line no-new-func
    new Function(fs.readFileSync(file, 'utf8'))();
  });
  return globalThis.CB;
}

/** Comprueba que index.html carga exactamente estos scripts (y en este orden) más las vistas. */
function indexScripts() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  return Array.from(html.matchAll(/<script src="js\/([^"]+)"/g)).map((m) => m[1]);
}

module.exports = { load, ORDER, indexScripts };
