/* Compositores de esquemas reutilizables:
 *  - loop():   circuito con pila (fuente a la izquierda, elementos arriba y a la derecha).
 *  - arduino(): placa a la izquierda; cada fila es una cadena a GND, un módulo o un divisor de tensión.
 * Todos los dibujos usan los mismos símbolos que la biblioteca y conexiones reales. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const { wire, dot, txt, part, P } = CB.diagrams.h;
  const SC = 0.75, LEN = 120 * SC; // símbolos a escala: 90 px de largo

  /**
   * Circuito con pila.
   * def: { source: '9 V', top: [items], right: [items] }  item: { sym, id, label, note }
   */
  function loop(def) {
    const bx = 50, by0 = 90, by1 = 210, topY = 44, botY = 250;
    let out = part('bat', 'Fuente de ' + def.source, P('battery', bx, by0, 90) + txt(bx - 26, by0 + 52, '+', 'dg-pol') + txt(bx - 26, by0 + 74, '−', 'dg-pol') + txt(bx + 30, by0 + 66, def.source));
    let x = 92;
    out += wire([[bx, by0], [bx, topY], [x, topY]]);
    (def.top || []).forEach((it, i) => {
      if (i > 0) { out += wire([[x, topY], [x + 22, topY]]); x += 22; }
      out += part(it.id, it.label, P(it.sym, x, topY, 0, SC) + txt(x + LEN / 2, topY - 20, it.label, 'dg-label mid') + (it.note ? txt(x + LEN / 2, topY + 30, it.note, 'dg-note mid') : ''));
      x += LEN;
    });
    const rx = x + 34;
    out += wire([[x, topY], [rx, topY]]);
    let y = topY;
    (def.right || []).forEach((it, i) => {
      if (i > 0) { out += wire([[rx, y], [rx, y + 14]]); y += 14; }
      out += part(it.id, it.label, P(it.sym, rx, y, 90, SC) + txt(rx + 30, y + LEN / 2 - 2, it.label) + (it.note ? txt(rx + 30, y + LEN / 2 + 16, it.note, 'dg-note') : ''));
      y += LEN;
    });
    out += part('w-ret', 'Cable de retorno', wire([[rx, y], [rx, botY], [bx, botY], [bx, by1]]));
    return { svg: out, width: rx + 170, height: botY + 20 };
  }

  /**
   * Esquema con Arduino Uno.
   * rows: { type:'chain', pin, items:[{sym,id,label}] }                       pin → elementos → GND
   *       { type:'module', name, id, pins:[{ from:'D9' | {ext:'Fuente 5 V +'}, pin:'Trig' }] }
   *       { type:'divider', pin:'A0', upper:{sym,id,label}, lower:{sym,id,label} } 5V → superior → pin → inferior → GND
   */
  function arduino(def) {
    const BX = 20, BW = 104, PX = BX + BW; // borde derecho de la placa (pines)
    let y = 50, out = '', pins = '';
    const pinMark = (label, py, id) => part(id || ('pin-' + label + '-' + py), 'Pin ' + label, '<rect x="' + (PX - 6) + '" y="' + (py - 6) + '" width="12" height="12" class="pin"/>' + txt(PX - 12, py + 5, label, 'dg-label end'));
    let maxX = 420;
    def.rows.forEach((r) => {
      if (r.type === 'chain') {
        pins += pinMark(r.pin, y, r.pinId);
        let x = PX + 30;
        out += wire([[PX + 6, y], [x, y]]);
        r.items.forEach((it, i) => {
          if (i > 0) { out += wire([[x, y], [x + 18, y]]); x += 18; }
          out += part(it.id, it.label, P(it.sym, x, y, 0, 0.7) + txt(x + 42, y - 26, it.label, 'dg-label mid'));
          x += 84;
        });
        out += wire([[x, y], [x + 22, y]]) + P('ground', x + 22 - 60, y + 30, 0) ;
        maxX = Math.max(maxX, x + 60);
        y += 74;
      } else if (r.type === 'module') {
        const mx = r.x || 420, top = y - 22, moduleStart = out.length;
        r.pins.forEach((pn, i) => {
          const py = y + i * 36;
          if (typeof pn.from === 'string') { pins += pinMark(pn.from, py); out += wire([[PX + 6, py], [mx, py]]); }
          else { out += '<rect x="' + (mx - 150) + '" y="' + (py - 10) + '" width="112" height="20" rx="4" class="ext-tag"/>' + txt(mx - 94, py + 5, pn.from.ext, 'dg-note mid') + wire([[mx - 38, py], [mx, py]]); }
          out += txt(mx + 10, py + 5, pn.pin, 'dg-label');
        });
        const h = (r.pins.length - 1) * 36 + 44;
        // El cuerpo del módulo va antes que las etiquetas de sus pines para no taparlas
        out = out.slice(0, moduleStart) + part(r.id, r.name, '<rect x="' + mx + '" y="' + top + '" width="' + (r.w || 120) + '" height="' + h + '" rx="6" class="module"/>' + txt(mx + (r.w || 120) / 2, top - 8, r.name, 'dg-label mid')) + out.slice(moduleStart);
        maxX = Math.max(maxX, mx + (r.w || 120) + 10);
        y += (r.pins.length - 1) * 36 + 74;
      } else if (r.type === 'divider') {
        const cx = r.x || 320, tap = y + 120, top = tap - 104;
        pins += pinMark(r.pin, tap);
        out += P('vcc', cx - 60, top - 30, 0);
        out += txt(cx, top - 14, '+5V', 'dg-label mid');
        out += part(r.upper.id, r.upper.label, P(r.upper.sym, cx, top, 90, 0.7) + txt(cx + 22, top + 46, r.upper.label));
        out += wire([[cx, top + 84], [cx, tap]]) + dot(cx, tap) + wire([[PX + 6, tap], [cx, tap]]);
        out += part(r.lower.id, r.lower.label, P(r.lower.sym, cx, tap + 16, 90, 0.7) + txt(cx + 22, tap + 62, r.lower.label));
        out += wire([[cx, tap], [cx, tap + 16]]) + wire([[cx, tap + 100], [cx, tap + 112]]) + P('ground', cx - 60, tap + 142, 0);
        maxX = Math.max(maxX, cx + 130);
        y = tap + 220;
      }
    });
    const boxH = y - 40;
    const board = part('board', 'Arduino Uno R3', '<rect x="' + BX + '" y="16" width="' + BW + '" height="' + boxH + '" rx="6" class="board"/>' + txt(BX + 30, 16 + boxH / 2, 'Arduino', 'dg-label mid vert') + txt(BX + 30, 16 + boxH / 2 + 16, 'Uno R3', 'dg-note mid vert'));
    return { svg: board + pins + out, width: maxX, height: y - 10 };
  }

  function addLoop(id, title, desc, def) {
    const r = loop(def);
    CB.diagrams.add({ id, title, desc, viewBox: '0 0 ' + Math.round(r.width) + ' ' + r.height, svg: r.svg });
  }
  function addArduino(id, title, desc, def) {
    const r = arduino(def);
    CB.diagrams.add({ id, title, desc, viewBox: '0 0 ' + Math.round(r.width) + ' ' + Math.round(r.height), svg: r.svg });
  }

  CB.compose = { loop, arduino, addLoop, addArduino };
})(typeof window !== 'undefined' ? window : globalThis);
