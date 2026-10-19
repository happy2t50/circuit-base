/* Dibujo SVG de la protoboard (compartido por el laboratorio y las prácticas). */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const B = CB.breadboard;

  const X0 = 46, DX = 18;
  const TOP = 30; // margen superior para las etiquetas de los cables que llegan desde la placa
  const ROW_Y = { tp: 26 + TOP, tn: 44 + TOP, a: 84 + TOP, b: 102 + TOP, c: 120 + TOP, d: 138 + TOP, e: 156 + TOP, f: 198 + TOP, g: 216 + TOP, h: 234 + TOP, i: 252 + TOP, j: 270 + TOP, bn: 310 + TOP, bp: 328 + TOP };
  const W = X0 + (B.COLS - 1) * DX + 34, H = 352 + 30;

  function holeXY(hole) {
    const m = /^([a-j]|tp|tn|bp|bn)(\d{1,2})$/.exec(hole);
    if (!m) return null;
    return { x: X0 + (+m[2] - 1) * DX, y: ROW_Y[m[1]] };
  }

  /**
   * @param opts { placement, fixed, pieces, highlight: {holes:[], cls}, interactive }
   */
  function render(opts) {
    const placement = opts.placement || {};
    const occupied = {};
    Object.keys(placement).forEach((k) => { occupied[placement[k]] = k; });
    (opts.fixed || []).forEach((f) => { occupied[f.hole] = f.label; });
    const hl = new Set((opts.highlight && opts.highlight.holes) || []);
    const hlCls = (opts.highlight && opts.highlight.cls) || 'hl';

    let s = `<svg class="bb" viewBox="0 0 ${W} ${H}" role="img" aria-label="${opts.label || 'Protoboard de 30 columnas'}">`;
    s += `<rect x="6" y="${TOP + 6}" width="${W - 12}" height="${H - TOP - 12}" rx="8" class="bb-board"/>`;
    s += `<rect x="6" y="${(ROW_Y.e + ROW_Y.f) / 2 - 7}" width="${W - 12}" height="14" class="bb-gap"/>`;
    // Líneas de carriles
    [['tp', 'rail-p'], ['tn', 'rail-n'], ['bn', 'rail-n'], ['bp', 'rail-p']].forEach(([r, cls]) => {
      const y = ROW_Y[r] + (r === 'tp' || r === 'bn' ? -10 : 10);
      s += `<line x1="${X0 - 8}" y1="${y}" x2="${X0 + (B.COLS - 1) * DX + 8}" y2="${y}" class="bb-${cls}"/>`;
      s += `<text x="16" y="${ROW_Y[r] + 4}" class="bb-lbl ${cls}">${r.endsWith('p') ? '+' : '−'}</text>`;
    });
    // Etiquetas de filas y columnas
    'abcdefghij'.split('').forEach((r) => { s += `<text x="22" y="${ROW_Y[r] + 4}" class="bb-lbl">${r}</text>`; });
    for (let c = 1; c <= B.COLS; c++) if (c === 1 || c % 5 === 0) s += `<text x="${X0 + (c - 1) * DX}" y="${ROW_Y.a - 14}" class="bb-lbl mid">${c}</text><text x="${X0 + (c - 1) * DX}" y="${ROW_Y.j + 24}" class="bb-lbl mid">${c}</text>`;
    // Orificios
    B.allHoles().forEach((h) => {
      const p = holeXY(h);
      const cls = 'bb-hole' + (hl.has(h) ? ' ' + hlCls : '') + (occupied[h] ? ' is-occ' : '');
      s += `<g class="${cls}" data-hole="${h}"><rect x="${p.x - 8}" y="${p.y - 8}" width="16" height="16" class="bb-hit"/><rect x="${p.x - 3.5}" y="${p.y - 3.5}" width="7" height="7" rx="1.5" class="bb-dot"/></g>`;
    });
    // Capa superior sin eventos de puntero: los orificios siguen siendo clicables bajo las piezas
    s += '<g class="bb-overlay">';
    // Conexiones fijas (cables desde la placa)
    (opts.fixed || []).forEach((f) => {
      const p = holeXY(f.hole);
      const cls = f.net === 'GND' ? 'w-black' : 'w-red';
      // Cable que llega desde la placa: etiqueta en el margen superior y línea hasta el orificio
      s += `<g class="bb-fixed"><line x1="${p.x}" y1="20" x2="${p.x}" y2="${p.y}" class="bb-wire ${cls}"/><circle cx="${p.x}" cy="${p.y}" r="4.5" class="${cls}-fill"/><rect x="${p.x - 17}" y="4" width="34" height="16" rx="3" class="${cls}-fill"/><text x="${p.x}" y="16" class="bb-tag-t mid">${f.label}</text></g>`;
    });
    // Piezas colocadas
    (opts.pieces || []).forEach((piece) => {
      const ends = piece.terminals.map((t) => placement[piece.id + '.' + t.id]).map((h) => (h ? holeXY(h) : null));
      ends.forEach((p, i) => { if (p && !ends[1 - i]) s += `<circle cx="${p.x}" cy="${p.y}" r="5" class="bb-pending"/>`; });
      if (!ends[0] || !ends[1]) return;
      const [a, b] = ends;
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      if (piece.kind === 'wire') {
        const lift = Math.min(40, Math.hypot(b.x - a.x, b.y - a.y) / 3);
        s += `<path d="M${a.x},${a.y} Q${mx},${my - lift} ${b.x},${b.y}" class="bb-wire w-${piece.color || 'black'}"/>`;
        s += `<circle cx="${a.x}" cy="${a.y}" r="3.5" class="w-${piece.color || 'black'}-fill"/><circle cx="${b.x}" cy="${b.y}" r="3.5" class="w-${piece.color || 'black'}-fill"/>`;
      } else if (piece.kind === 'resistor') {
        s += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="bb-leg"/>`;
        s += `<g transform="translate(${mx},${my}) rotate(${ang})"><rect x="-15" y="-6" width="30" height="12" rx="5" class="bb-res"/><rect x="-10" y="-6" width="3" height="12" fill="#c62828"/><rect x="-5" y="-6" width="3" height="12" fill="#c62828"/><rect x="0" y="-6" width="3" height="12" fill="#6d4c41"/><rect x="8" y="-6" width="3" height="12" fill="#c9a227"/></g>`;
      } else if (piece.kind === 'led') {
        s += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="bb-leg"/>`;
        s += `<circle cx="${mx}" cy="${my}" r="9" class="bb-led"/><text x="${a.x}" y="${a.y - 9}" class="bb-pol mid">+</text>`;
      }
    });
    s += '</g></svg>';
    return s;
  }

  CB.breadboardView = { render, holeXY };
})(typeof window !== 'undefined' ? window : globalThis);
