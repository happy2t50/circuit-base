/* Dibujo SVG de la protoboard (compartido por el laboratorio y las prácticas). */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const B = CB.breadboard;

  const X0 = 46, DX = 18;
  const TOP = 72; // margen superior para las etiquetas de los cables que llegan desde la placa
  const ROW_Y = { tp: 26 + TOP, tn: 44 + TOP, a: 84 + TOP, b: 102 + TOP, c: 120 + TOP, d: 138 + TOP, e: 156 + TOP, f: 198 + TOP, g: 216 + TOP, h: 234 + TOP, i: 252 + TOP, j: 270 + TOP, bn: 310 + TOP, bp: 328 + TOP };
  const W = X0 + (B.COLS - 1) * DX + 34, H = 352 + TOP;

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
    // Cables que llegan desde la placa o la fuente: etiqueta arriba y línea hasta el orificio.
    // Si dos etiquetas quedarían encimadas, la segunda baja a otra fila.
    const rowsUsed = [[], [], []];
    (opts.fixed || []).slice().sort((a, b) => holeXY(a.hole).x - holeXY(b.hole).x).forEach((f) => {
      const p = holeXY(f.hole);
      const cls = /GND|−|-$/.test(f.net + f.label) ? 'w-black' : (/VCC|5V|9V|EXTV|\+/.test(f.net + f.label) ? 'w-red' : 'w-sig');
      const w = Math.max(34, f.label.length * 7 + 10);
      let row = rowsUsed.findIndex((r) => r.every((o) => Math.abs(o.x - p.x) > (w + o.w) / 2 + 2));
      if (row < 0) row = 2;
      rowsUsed[row].push({ x: p.x, w });
      const ty = 4 + row * 22;
      s += `<g class="bb-fixed"><line x1="${p.x}" y1="${ty + 16}" x2="${p.x}" y2="${p.y}" class="bb-wire ${cls}"/><circle cx="${p.x}" cy="${p.y}" r="4.5" class="${cls}-fill"/><rect x="${p.x - w / 2}" y="${ty}" width="${w}" height="16" rx="3" class="${cls}-fill"/><text x="${p.x}" y="${ty + 12}" class="bb-tag-t mid">${f.label}</text></g>`;
    });
    // Piezas colocadas
    (opts.pieces || []).forEach((piece) => {
      const pts = piece.terminals.map((t) => placement[piece.id + '.' + t.id]).map((h) => (h ? holeXY(h) : null));
      const placed = pts.filter(Boolean);
      if (placed.length < pts.length) { placed.forEach((p) => { s += `<circle cx="${p.x}" cy="${p.y}" r="5" class="bb-pending"/>`; }); return; }
      if (pts.length === 2) s += twoLeg(piece, pts[0], pts[1]);
      else s += multiLeg(piece, pts);
    });
    s += '</g></svg>';
    return s;
  }

  /* Código de colores de 4 bandas (cifra, cifra, multiplicador, oro ±5 %) */
  const BAND = ['#111', '#6d4c41', '#c62828', '#ef6c00', '#fdd835', '#2e7d32', '#1565c0', '#7b1fa2', '#9e9e9e', '#fafafa'];
  function bands(ohms) {
    const exp = Math.floor(Math.log10(ohms)) - 1;
    const two = Math.round(ohms / Math.pow(10, exp));
    return [BAND[Math.floor(two / 10)], BAND[two % 10], BAND[exp] || '#111', '#c9a227'];
  }

  function twoLeg(piece, a, b) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    if (piece.kind === 'wire') {
      const lift = Math.min(40, Math.hypot(b.x - a.x, b.y - a.y) / 3);
      const c = piece.color || 'black';
      return `<path d="M${a.x},${a.y} Q${mx},${my - lift} ${b.x},${b.y}" class="bb-wire w-${c}"/><circle cx="${a.x}" cy="${a.y}" r="3.5" class="w-${c}-fill"/><circle cx="${b.x}" cy="${b.y}" r="3.5" class="w-${c}-fill"/>`;
    }
    let out = `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="bb-leg"/>`;
    if (piece.kind === 'resistor') {
      const bd = bands(piece.ohms || 220);
      out += `<g transform="translate(${mx},${my}) rotate(${ang})"><rect x="-15" y="-6" width="30" height="12" rx="5" class="bb-res"/>` +
        `<rect x="-10" y="-6" width="3" height="12" fill="${bd[0]}"/><rect x="-5" y="-6" width="3" height="12" fill="${bd[1]}"/><rect x="0" y="-6" width="3" height="12" fill="${bd[2]}"/><rect x="8" y="-6" width="3" height="12" fill="${bd[3]}"/></g>`;
    } else if (piece.kind === 'led') {
      out += `<circle cx="${mx}" cy="${my}" r="9" class="bb-led led-${piece.color || 'red'}"/><text x="${a.x}" y="${a.y - 9}" class="bb-pol mid">+</text>`;
    } else if (piece.kind === 'button') {
      out += `<rect x="${mx - 11}" y="${my - 11}" width="22" height="22" rx="3" class="bb-btn"/><circle cx="${mx}" cy="${my}" r="6" class="bb-btn-cap"/>`;
    } else if (piece.kind === 'buzzer') {
      out += `<circle cx="${mx}" cy="${my}" r="12" class="bb-buzz"/><circle cx="${mx}" cy="${my}" r="2.5" class="bb-buzz-hole"/>` + (piece.polarized ? `<text x="${a.x}" y="${a.y - 9}" class="bb-pol mid">+</text>` : '');
    } else if (piece.kind === 'ldr') {
      out += `<circle cx="${mx}" cy="${my}" r="9" class="bb-ldr"/><path d="M${mx - 5},${my - 3} h10 M${mx - 5},${my + 3} h10" class="bb-ldr-track"/>`;
    } else if (piece.kind === 'cap') {
      out += `<circle cx="${mx}" cy="${my}" r="8" class="bb-cap"/>`;
    } else {
      out += `<rect x="${mx - 12}" y="${my - 8}" width="24" height="16" rx="3" class="bb-mod"/><text x="${mx}" y="${my + 4}" class="bb-mod-t mid">${piece.short || ''}</text>`;
    }
    return out;
  }

  /** Piezas de 3 o más patas (potenciómetro, sensores, módulos): patas hasta un cuerpo con su nombre corto. */
  function multiLeg(piece, pts) {
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const minY = Math.min(...pts.map((p) => p.y));
    const bodyY = minY - 26;
    const w = Math.max(40, (Math.max(...pts.map((p) => p.x)) - Math.min(...pts.map((p) => p.x))) + 22);
    let out = pts.map((p) => `<line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${bodyY + 9}" class="bb-leg"/>`).join('');
    const cls = piece.kind === 'pot' ? 'bb-pot' : 'bb-mod';
    out += `<rect x="${cx - w / 2}" y="${bodyY - 9}" width="${w}" height="18" rx="4" class="${cls}"/><text x="${cx}" y="${bodyY + 4}" class="bb-mod-t mid">${piece.short || piece.name}</text>`;
    return out;
  }

  CB.breadboardView = { render, holeXY, bands };
})(typeof window !== 'undefined' ? window : globalThis);
