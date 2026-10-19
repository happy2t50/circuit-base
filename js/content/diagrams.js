/* Diagramas eléctricos compuestos con la biblioteca de símbolos.
 * Cada parte seleccionable lleva data-part. Los diagramas son vectoriales (SVG) para
 * permitir zoom, selección y resaltado. Todas las conexiones dibujadas son las reales:
 * no se simplifica nada que cambie el comportamiento del circuito. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const S = CB.symbols;

  const wire = (pts) => `<polyline class="wire" points="${pts.map((p) => p.join(',')).join(' ')}"/>`;
  const dot = (x, y) => `<circle class="node" cx="${x}" cy="${y}" r="4.5"/>`;
  const txt = (x, y, s, cls) => `<text x="${x}" y="${y}" class="${cls || 'dg-label'}">${s}</text>`;
  const part = (id, label, inner) => `<g data-part="${id}" aria-label="${label}">${inner}</g>`;
  const P = (id, x, y, rot, sc) => S.place(id, x, y, rot, sc, 'class="placed"');

  /* Lazo básico: batería a la izquierda, resistencia arriba, LED a la derecha. */
  function ledLoop(opts) {
    const reversed = !!opts.reversed;
    return [
      part('bat', 'Batería de 9 V', P('battery', 60, 70, 90) + txt(24, 130, '+', 'dg-pol') + txt(24, 150, '−', 'dg-pol') + txt(90, 136, '9 V')),
      part('w-top', 'Cable superior', wire([[60, 70], [60, 40], [130, 40]]) + wire([[250, 40], [340, 40]])),
      part('r1', 'Resistencia R1', P('resistor', 130, 40, 0) + txt(190, 22, 'R1 · 470 Ω', 'dg-label mid')),
      part('led1', 'LED1', (reversed ? P('led', 340, 160, -90) : P('led', 340, 40, 90)) + txt(396, 96, 'LED1') + txt(396, 114, 'rojo', 'dg-note')),
      part('w-bottom', 'Cable inferior de retorno', wire([[340, 160], [340, 215], [60, 215], [60, 190]]))
    ].join('');
  }

  function switchPanel(dx, closed) {
    return [
      P('battery', dx + 40, 80, 90), txt(dx + 6, 140, '+', 'dg-pol'), txt(dx + 6, 160, '−', 'dg-pol'),
      wire([[dx + 40, 80], [dx + 40, 50], [dx + 70, 50]]),
      part(closed ? 'sw-closed' : 'sw-open', closed ? 'Interruptor cerrado' : 'Interruptor abierto', P(closed ? 'switch-closed' : 'switch', dx + 70, 50, 0, 0.75)),
      wire([[dx + 160, 50], [dx + 172, 50]]),
      P('resistor', dx + 172, 50, 0, 0.75),
      wire([[dx + 262, 50], [dx + 270, 50]]),
      P('led', dx + 270, 50, 90, 0.75),
      wire([[dx + 270, 140], [dx + 270, 215], [dx + 40, 215], [dx + 40, 200]]),
      txt(dx + 155, 245, closed ? 'Cerrado: hay camino, circula corriente' : 'Abierto: no hay camino, no circula corriente', 'dg-label mid')
    ].join('');
  }

  const list = [
    {
      id: 'basic-led', viewBox: '0 0 450 250',
      title: 'Circuito básico: batería, resistencia y LED',
      desc: 'Una batería de 9 V alimenta una resistencia de 470 Ω en serie con un LED rojo. El ánodo del LED está hacia la resistencia y el cátodo vuelve al negativo de la batería.',
      svg: ledLoop({}) + `<g class="current"><line x1="262" y1="54" x2="314" y2="54"/><polygon points="314,54 306,50 306,58"/></g>` + txt(330, 74, 'I (sentido convencional)', 'dg-note end')
    },
    {
      id: 'led-reversed', viewBox: '0 0 440 250',
      title: 'Circuito con un error',
      desc: 'Batería de 9 V, resistencia de 470 Ω y un LED cuyo cátodo (barra) apunta hacia la resistencia y el positivo de la batería.',
      svg: ledLoop({ reversed: true })
    },
    {
      id: 'open-closed', viewBox: '0 0 640 260',
      title: 'Circuito abierto y circuito cerrado',
      desc: 'Dos circuitos idénticos con batería, interruptor, resistencia y LED. En el izquierdo el interruptor está abierto; en el derecho, cerrado.',
      svg: switchPanel(0, false) + switchPanel(330, true)
    },
    {
      id: 'series-parallel', viewBox: '0 0 660 270',
      title: 'Resistencias en serie y en paralelo',
      desc: 'Izquierda: R1 y R2 en serie, una sola trayectoria. Derecha: R1 y R2 en paralelo, cada una entre los mismos dos nodos.',
      svg: [
        P('battery', 40, 80, 90), txt(6, 140, '+', 'dg-pol'),
        wire([[40, 80], [40, 50], [80, 50]]),
        part('s-r1', 'R1 en serie', P('resistor', 80, 50, 0) + txt(140, 32, 'R1', 'dg-label mid')),
        wire([[200, 50], [260, 50]]),
        part('s-r2', 'R2 en serie', P('resistor', 260, 50, 90) + txt(282, 115, 'R2')),
        wire([[260, 170], [260, 225], [40, 225], [40, 200]]),
        txt(150, 258, 'Serie: Rtotal = R1 + R2', 'dg-label mid'),

        P('battery', 370, 80, 90), txt(336, 140, '+', 'dg-pol'),
        wire([[370, 80], [370, 50], [590, 50]]),
        part('p-node-top', 'Nodo superior', dot(480, 50)),
        part('p-r1', 'R1 en paralelo', P('resistor', 480, 50, 90) + txt(500, 115, 'R1')),
        part('p-r2', 'R2 en paralelo', P('resistor', 590, 50, 90) + txt(610, 115, 'R2')),
        wire([[480, 170], [480, 225]]),
        wire([[590, 170], [590, 225], [370, 225], [370, 200]]),
        part('p-node-bottom', 'Nodo inferior', dot(480, 225)),
        txt(480, 258, 'Paralelo: 1/Rtotal = 1/R1 + 1/R2', 'dg-label mid')
      ].join('')
    },
    {
      id: 'junction-cross', viewBox: '0 0 450 150',
      title: 'Unión y cruce de cables',
      desc: 'Izquierda: dos líneas que se cruzan con un punto, conectadas. Centro: se cruzan sin punto, no conectadas. Derecha: cruce con salto, estilo antiguo, no conectadas.',
      svg: [
        part('junction', 'Cruce con punto', P('junction', 10, 60, 0)), txt(70, 125, 'Con punto: conectados', 'dg-label mid'),
        part('crossing', 'Cruce sin punto', P('crossing', 165, 60, 0)), txt(225, 125, 'Sin punto: NO conectados', 'dg-label mid'),
        part('hop', 'Cruce con salto', '<path class="wire" d="M320,60 L370,60 A10,10 0 0 1 390,60 L440,60"/>' + wire([[380, 30], [380, 90]])), txt(380, 125, 'Con salto: NO conectados', 'dg-label mid')
      ].join('')
    },
    {
      id: 'meter-voltage', viewBox: '0 0 440 250',
      title: 'Medir tensión: voltímetro en paralelo',
      desc: 'El circuito básico con un voltímetro conectado entre los dos extremos de la resistencia R1, en paralelo.',
      svg: ledLoop({}) + dot(140, 40) + dot(240, 40) + wire([[140, 40], [140, 105]]) + wire([[240, 40], [240, 105]]) + part('voltmeter', 'Voltímetro', P('voltmeter', 140, 105, 0, 100 / 120))
    },
    {
      id: 'meter-current', viewBox: '0 0 440 250',
      title: 'Medir corriente: amperímetro en serie',
      desc: 'El circuito básico con el cable de retorno abierto y un amperímetro intercalado en serie.',
      svg: [
        part('bat', 'Batería', P('battery', 60, 70, 90) + txt(24, 130, '+', 'dg-pol') + txt(90, 136, '9 V')),
        wire([[60, 70], [60, 40], [130, 40]]), P('resistor', 130, 40, 0), txt(190, 22, 'R1 · 470 Ω', 'dg-label mid'),
        wire([[250, 40], [340, 40]]), P('led', 340, 40, 90),
        wire([[340, 160], [340, 215], [260, 215]]),
        part('ammeter', 'Amperímetro', P('ammeter', 140, 215, 0)),
        wire([[140, 215], [60, 215], [60, 190]])
      ].join('')
    },
    {
      id: 'arduino-led', viewBox: '0 0 470 250',
      title: 'Esquema de la práctica A1: LED en el pin D8',
      desc: 'Pin digital D8 de un Arduino Uno conectado a una resistencia de 220 Ω, que va al ánodo de un LED rojo. El cátodo del LED vuelve a un pin GND del Arduino.',
      svg: [
        part('board', 'Arduino Uno', '<rect x="20" y="36" width="110" height="196" rx="6" class="board"/>' + txt(75, 140, 'Arduino', 'dg-label mid') + txt(75, 158, 'Uno R3', 'dg-note mid')),
        part('d8', 'Pin D8', '<rect x="122" y="64" width="12" height="12" class="pin"/>' + txt(112, 74, 'D8', 'dg-label end')),
        part('gnd', 'Pin GND', '<rect x="122" y="199" width="12" height="12" class="pin"/>' + txt(112, 209, 'GND', 'dg-label end')),
        wire([[134, 70], [170, 70]]),
        part('r1', 'Resistencia R1 de 220 Ω', P('resistor', 170, 70, 0) + txt(230, 52, 'R1 · 220 Ω', 'dg-label mid')),
        wire([[290, 70], [360, 70]]),
        part('led1', 'LED1 rojo', P('led', 360, 70, 90) + txt(408, 120, 'LED1') + txt(408, 138, 'rojo', 'dg-note') + txt(368, 92, 'ánodo', 'dg-note') + txt(368, 186, 'cátodo', 'dg-note')),
        wire([[360, 190], [360, 205], [134, 205]])
      ].join('')
    }
  ];

  const byId = {};
  list.forEach((d) => { byId[d.id] = d; });

  function diagramSVG(id) {
    const d = byId[id];
    if (!d) return '<p class="error">Diagrama no encontrado: ' + id + '</p>';
    const tid = 'dg-' + id + '-t', did = 'dg-' + id + '-d';
    return `<svg class="diagram" viewBox="${d.viewBox}" role="img" aria-labelledby="${tid} ${did}"><title id="${tid}">${d.title}</title><desc id="${did}">${d.desc}</desc>${d.svg}</svg>`;
  }

  CB.diagrams = { list, byId, diagramSVG };
})(typeof window !== 'undefined' ? window : globalThis);
