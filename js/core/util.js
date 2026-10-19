/* Utilidades compartidas. Sin dependencias del DOM salvo las funciones marcadas. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ESC[c]);
  }

  /** Formatea un valor con prefijo SI: fmtUnit(0.0136,'A') → "13,6 mA". */
  function fmtUnit(value, unit, digits) {
    if (!isFinite(value)) return '—';
    const d = digits == null ? 3 : digits;
    const prefixes = [
      [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n']
    ];
    const abs = Math.abs(value);
    let chosen = [1, ''];
    if (abs !== 0) {
      for (const p of prefixes) { if (abs >= p[0]) { chosen = p; break; } chosen = p; }
    }
    const scaled = value / chosen[0];
    const text = Number(scaled.toPrecision(d)).toLocaleString('es-MX', { maximumFractionDigits: 3 });
    return text + ' ' + chosen[1] + (unit === 'ohm' ? 'Ω' : unit);
  }

  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  /** Interpreta números escritos por estudiantes: "0,02", "20m", "1.5k", "220 Ω". */
  function parseNumber(input) {
    if (input == null) return NaN;
    let s = String(input).trim().replace(/\s+/g, '').replace(',', '.');
    s = s.replace(/(Ω|ω|ohmios|ohms|ohm|voltios|amperios|vatios|V|A|W|v|a|w)$/u, '');
    const m = s.match(/^(-?\d*\.?\d+(?:[eE]-?\d+)?)([kKmMµu]?)$/);
    if (!m) return NaN;
    const mult = { '': 1, k: 1e3, K: 1e3, M: 1e6, m: 1e-3, 'µ': 1e-6, u: 1e-6 }[m[2]];
    return parseFloat(m[1]) * mult;
  }

  /* --- DOM (solo navegador) --- */
  function h(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content;
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  CB.util = { esc, fmtUnit, clamp, parseNumber, h, $, $all };
})(typeof window !== 'undefined' ? window : globalThis);
