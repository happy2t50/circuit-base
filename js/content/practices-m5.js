/* Fase 6 · MÓDULO 5 — Primeros circuitos sin microcontrolador (E1–E8).
 * Cada montaje usa la verificación 'netlist': las pruebas comprueban que la vista de montaje
 * forma exactamente las redes del esquema. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const { wire, dot, txt, part, P } = CB.diagrams.h;

  /* ---------- Piezas reutilizables ---------- */
  const T2 = (a, b) => [{ id: a[0], label: a[1] }, { id: b[0], label: b[1] }];
  const R = (id, ohms, name) => ({ id, kind: 'resistor', ohms, name: name || ('Resistencia ' + fmtOhm(ohms)), terminals: T2(['1', 'pata 1'], ['2', 'pata 2']) });
  const LED = (id, color, name) => ({ id, kind: 'led', color, polarized: true, name: name || 'LED', terminals: T2(['A', 'ánodo (+, pata larga)'], ['K', 'cátodo (−, pata corta)']) });
  const W = (id, color) => ({ id, kind: 'wire', color: color || 'black', optional: true, name: 'Cable ' + id, terminals: T2(['A', 'extremo A'], ['B', 'extremo B']) });
  const BTN = (id) => ({ id, kind: 'button', name: 'Pulsador', terminals: T2(['1', 'pata superior izquierda'], ['2', 'pata inferior derecha (diagonal)']) });
  function fmtOhm(o) { return o >= 1000 ? (o / 1000).toString().replace('.', ',') + ' kΩ' : o + ' Ω'; }

  const BAT9 = [{ label: '9V +', hole: 'tp1', net: 'VCC' }, { label: '9V −', hole: 'tn3', net: 'GND' }];
  const TK_STATUS = 'Pasos para reproducirlo en Tinkercad Circuits con tu cuenta; la aplicación no abre ni ejecuta proyectos de Tinkercad. Enlace comprobado el 19/10/2026. Si tu Tinkercad está en inglés, el botón «Código» es «Code» e «Iniciar simulación» es «Start Simulation». Los menús pueden cambiar con las actualizaciones del sitio.';
  const tk = (extra) => ({ url: 'https://www.tinkercad.com/circuits', status: TK_STATUS, steps: ['Crea un circuito nuevo en Tinkercad Circuits.', 'Arrastra una "Placa de pruebas pequeña" y una "Batería de 9 V" (o la fuente que indica la práctica).'].concat(extra).concat(['Pulsa «Iniciar simulación» (Start Simulation) y compara con el resultado esperado. Pasa el ratón sobre los componentes para ver avisos de corriente.']) });
  const SAFE_9V = 'Pila de 9 V: si algo se calienta, desconecta el clip de inmediato. Nunca unas el + con el − de la pila.';
  const baseChecklist = [
    { id: 'off', text: 'La pila está desconectada mientras reviso.' },
    { id: 'short', text: 'Ningún cable une el carril + con el carril −, y ningún componente tiene sus dos patas en la misma tira.' },
    { id: 'pol', text: 'Cada LED tiene el ánodo (pata larga) hacia el + y una resistencia en su camino.' }
  ];

  /* ---------- Diagramas ---------- */
  CB.compose.addLoop('m5-series-leds', 'Dos LED en serie', 'Batería de 9 V, resistencia de 330 Ω y dos LED rojos en serie, el ánodo de cada uno hacia el positivo.', {
    source: '9 V', top: [{ sym: 'resistor', id: 'r1', label: 'R1 · 330 Ω' }], right: [{ sym: 'led', id: 'led1', label: 'LED1' }, { sym: 'led', id: 'led2', label: 'LED2' }]
  });
  CB.compose.addLoop('m5-button', 'Pulsador que controla un LED', 'Batería de 9 V, pulsador normalmente abierto, resistencia de 470 Ω y LED rojo en serie.', {
    source: '9 V', top: [{ sym: 'pushbutton', id: 's1', label: 'S1 pulsador' }, { sym: 'resistor', id: 'r1', label: 'R1 · 470 Ω' }], right: [{ sym: 'led', id: 'led1', label: 'LED1' }]
  });
  CB.compose.addLoop('m5-ldr', 'LDR en serie con un LED', 'Batería de 9 V, fotorresistencia, resistencia de protección de 220 Ω y LED rojo en serie.', {
    source: '9 V', top: [{ sym: 'ldr', id: 'ldr1', label: 'LDR' }, { sym: 'resistor', id: 'r1', label: 'R1 · 220 Ω' }], right: [{ sym: 'led', id: 'led1', label: 'LED1' }]
  });
  CB.compose.addLoop('m5-buzzer', 'Pulsador y zumbador activo', 'Fuente de 5 V, pulsador y zumbador activo de 5 V en serie; el + del zumbador hacia el pulsador.', {
    source: '5 V', top: [{ sym: 'pushbutton', id: 's1', label: 'S1 pulsador' }], right: [{ sym: 'buzzer', id: 'bz1', label: 'Zumbador activo' }]
  });
  CB.diagrams.add({
    id: 'm5-parallel', viewBox: '0 0 520 310',
    title: 'Dos LED en paralelo, cada uno con su resistencia',
    desc: 'Batería de 9 V. Del positivo sale un nodo superior del que bajan dos ramas iguales: resistencia de 470 Ω y LED. Ambas ramas terminan en un nodo inferior unido al negativo.',
    svg: [
      part('bat', 'Batería de 9 V', P('battery', 50, 100, 90) + txt(24, 156, '+', 'dg-pol') + txt(80, 166, '9 V')),
      wire([[50, 100], [50, 44], [380, 44]]), part('n-top', 'Nodo superior', dot(220, 44)),
      part('r1', 'R1', P('resistor', 220, 44, 90, 0.75) + txt(238, 94, 'R1 · 470 Ω')),
      wire([[220, 134], [220, 150]]), part('led1', 'LED1', P('led', 220, 150, 90, 0.75) + txt(250, 200, 'LED1')),
      part('r2', 'R2', P('resistor', 380, 44, 90, 0.75) + txt(398, 94, 'R2 · 470 Ω')),
      wire([[380, 134], [380, 150]]), part('led2', 'LED2', P('led', 380, 150, 90, 0.75) + txt(410, 200, 'LED2')),
      wire([[220, 240], [220, 280]]), wire([[380, 240], [380, 280], [50, 280], [50, 220]]), part('n-bot', 'Nodo inferior', dot(220, 280))
    ].join('')
  });
  CB.diagrams.add({
    id: 'm5-pot', viewBox: '0 0 520 290',
    title: 'Potenciómetro como divisor de tensión',
    desc: 'Los extremos de un potenciómetro de 10 kΩ están conectados entre el positivo y el negativo de una batería de 9 V. Un voltímetro mide la tensión entre el cursor y el negativo.',
    svg: [
      part('bat', 'Batería de 9 V', P('battery', 50, 90, 90) + txt(24, 146, '+', 'dg-pol') + txt(80, 156, '9 V')),
      wire([[50, 90], [50, 44], [260, 44], [260, 70]]),
      part('p1', 'Potenciómetro', P('potentiometer', 260, 70, 90, 0.75) + txt(200, 112, 'P1 · 10 kΩ', 'dg-label end')),
      wire([[282, 115], [380, 115]]), txt(320, 106, 'cursor', 'dg-note mid'),
      part('vm', 'Voltímetro', wire([[380, 115], [380, 142]]) + '<circle cx="380" cy="160" r="18" class="nofill"/>' + txt(380, 167, 'V', 'sym-label big') + wire([[380, 178], [380, 205]]) + txt(410, 164, 'V⎓')),
      wire([[380, 205], [380, 250]]),
      wire([[260, 160], [260, 250]]), wire([[380, 250], [50, 250], [50, 210]]), part('n-gnd', 'Negativo común', dot(260, 250))
    ].join('')
  });

  const P5 = [
    {
      id: 'e1-led-basico', code: 'E1', module: 'm5', title: 'Fuente, resistencia y LED', level: 'Inicial', minutes: 20,
      power: 'Pila de 9 V con clip', objective: 'Montar el circuito más básico, comprobar que el LED enciende y medir la corriente con el multímetro.',
      prerequisites: [{ lesson: 'm1-ohm', text: 'Ley de Ohm y resistencia de un LED' }, { lesson: 'm4-montaje', text: 'Del esquema a la protoboard' }],
      materials: ['Pila de 9 V con clip', 'Protoboard', 'LED rojo de 5 mm', 'Resistencia de 470 Ω (amarillo, violeta, marrón, oro)', '1 cable jumper', 'Multímetro'],
      diagram: 'basic-led',
      layout: { fixed: BAT9, pieces: [R('R1', 470), LED('LED1', 'red', 'LED rojo'), W('J1')], check: 'netlist',
        nets: [['VCC', 'R1.1'], ['R1.2', 'LED1.A'], ['LED1.K', 'GND']],
        placement: { 'R1.1': 'tp6', 'R1.2': 'b6', 'LED1.A': 'c6', 'LED1.K': 'c9', 'J1.A': 'a9', 'J1.B': 'tn9' } },
      connections: ['Clip de la pila: rojo al carril + y negro al carril − superiores (pila desconectada).', 'Resistencia de 470 Ω del carril + (columna 6) a b6.', 'LED: ánodo en c6 (misma tira que la resistencia) y cátodo en c9.', 'Cable de a9 al carril −.'],
      calculations: ['Tensión en la resistencia: 9 V − 2,0 V del LED = 7,0 V.', 'I = 7,0 ÷ 470 ≈ 0,0149 A = 14,9 mA (por debajo de 20 mA).', 'Potencia en la resistencia: 7,0 × 0,0149 ≈ 0,104 W, menos de 1/4 W.'],
      expected: 'El LED se enciende de forma continua con brillo normal. El multímetro en serie marca unos 14–15 mA (varía con la carga de la pila y la Vf real del LED).',
      mistakes: [
        { symptom: 'El LED no enciende', cause: 'LED invertido o ánodo en una tira distinta de la resistencia.', fix: 'Desconecta, gira el LED o mueve el ánodo a la tira de la resistencia.' },
        { symptom: 'Brillo muy débil', cause: 'Resistencia de valor mucho mayor (p. ej. 47 kΩ) o pila agotada.', fix: 'Lee las bandas y mide la pila: debe marcar más de 8 V.' },
        { symptom: 'La resistencia se calienta', cause: 'Valor demasiado bajo (p. ej. 47 Ω) o cortocircuito.', fix: 'Desconecta y comprueba el valor y las tiras.' }
      ],
      questions: [
        { id: 'e1-q1', type: 'numeric', kind: 'ohm', prompt: 'La pila está algo gastada y marca 8,2 V. ¿Qué corriente circula ahora, en mA?', unit: 'mA', answer: (8.2 - 2) / 470 * 1000, tolerance: 0.02,
          solution: 'I = (8,2 − 2,0) ÷ 470 ≈ 13,2 mA.', mistakes: [{ value: 8.2 / 470 * 1000, feedback: 'Olvidaste restar la tensión del LED.' }], hint: 'I = (Vpila − Vf) ÷ R.' },
        { id: 'e1-q2', type: 'mc', prompt: 'Para medir la corriente del LED con el multímetro, ¿dónde lo intercalas?',
          options: [
            { id: 'a', text: 'Quito el cable de a9 al carril − y pongo el multímetro (modo mA) en su lugar', feedback: 'Así la corriente atraviesa el instrumento: medición en serie.' },
            { id: 'b', text: 'Toco con las puntas los dos extremos del LED en modo mA', feedback: 'Eso conecta el amperímetro en paralelo: desvía la corriente y puede fundir su fusible.' }
          ], answer: 'a' }
      ],
      tinkercad: tk(['Añade una "Resistencia" (470 Ω en el inspector) y un "LED" rojo; el ánodo es la pata doblada.', 'Conecta según la lista de conexiones.']),
      safety: SAFE_9V, checklist: baseChecklist.concat([{ id: 'r', text: 'La resistencia es de 470 Ω (amarillo, violeta, marrón, oro).' }])
    },
    {
      id: 'e2-variar-resistencia', code: 'E2', module: 'm5', title: 'Variar la resistencia y observar el LED', level: 'Inicial', minutes: 25,
      power: 'Pila de 9 V con clip', objective: 'Comprobar la ley de Ohm cambiando la resistencia en serie con el LED y relacionar corriente y brillo.',
      prerequisites: [{ practice: 'e1-led-basico', text: 'Práctica E1' }],
      materials: ['El montaje de E1', 'Resistencias de 470 Ω, 1 kΩ, 2,2 kΩ y 10 kΩ', 'Multímetro'],
      diagram: 'basic-led', diagramNote: 'El esquema es el de E1: solo cambia el valor de R1.',
      layout: { fixed: BAT9, pieces: [R('R1', 1000), LED('LED1', 'red', 'LED rojo'), W('J1')], check: 'netlist',
        nets: [['VCC', 'R1.1'], ['R1.2', 'LED1.A'], ['LED1.K', 'GND']],
        placement: { 'R1.1': 'tp6', 'R1.2': 'b6', 'LED1.A': 'c6', 'LED1.K': 'c9', 'J1.A': 'a9', 'J1.B': 'tn9' } },
      connections: ['Parte del montaje de E1.', 'Desconecta la pila antes de cada cambio.', 'Sustituye R1 por cada valor de la tabla, en orden, y anota la corriente medida.'],
      calculations: ['I = (9 − 2,0) ÷ R para cada valor.', 'No uses menos de 470 Ω con 9 V: con 220 Ω serían (9 − 2) ÷ 220 ≈ 31,8 mA, por encima de los 20 mA del LED.'],
      table: { head: ['R1', 'Corriente calculada', 'Brillo esperado'], rows: [['470 Ω', '14,9 mA', 'Normal'], ['1 kΩ', '7,0 mA', 'Algo menor'], ['2,2 kΩ', '3,2 mA', 'Tenue'], ['10 kΩ', '0,7 mA', 'Apenas visible']] },
      expected: 'Al aumentar la resistencia baja la corriente y el LED brilla menos. La relación brillo-corriente no es lineal para el ojo: de 470 Ω a 1 kΩ el cambio se nota poco.',
      mistakes: [
        { symptom: 'La corriente medida no coincide', cause: 'La Vf real del LED y la carga de la pila difieren de los valores típicos.', fix: 'Mide la tensión real de la pila y del LED y recalcula.' },
        { symptom: 'El LED se apaga al cambiar la resistencia', cause: 'La nueva resistencia quedó con las dos patas en la misma tira o fuera de la tira 6.', fix: 'Revisa que una pata esté en el carril + y la otra en la tira del ánodo.' }
      ],
      questions: [
        { id: 'e2-q1', type: 'numeric', kind: 'ohm', prompt: 'Con R1 = 2,2 kΩ, ¿qué corriente esperas, en mA?', unit: 'mA', answer: 7 / 2200 * 1000, tolerance: 0.02,
          solution: 'I = (9 − 2) ÷ 2 200 ≈ 3,2 mA.', mistakes: [{ value: 9 / 2200 * 1000, feedback: 'Resta la tensión directa del LED: quedan 7 V en la resistencia.' }], hint: 'Convierte 2,2 kΩ a 2 200 Ω.' },
        { id: 'e2-q2', type: 'tf', prompt: 'Verdadero o falso: duplicar la resistencia reduce la corriente aproximadamente a la mitad.', answer: true,
          whyWrong: 'Sí ocurre: la tensión en la resistencia apenas cambia al cambiar R.', explain: 'Con la tensión de la resistencia casi fija (≈7 V), I = V ÷ R: si R se duplica, I se reduce a la mitad.' }
      ],
      tinkercad: tk(['Monta el circuito de E1 y cambia el valor de la resistencia en el inspector.', 'Añade un "Multímetro" en modo corriente, en serie, para leer cada valor.']),
      safety: SAFE_9V, checklist: baseChecklist.concat([{ id: 'min', text: 'No usaré ninguna resistencia menor de 470 Ω con la pila de 9 V.' }])
    },
    {
      id: 'e3-leds-serie', code: 'E3', module: 'm5', title: 'Dos LED en serie', level: 'Inicial', minutes: 25,
      power: 'Pila de 9 V con clip', objective: 'Montar dos LED en serie, calcular su resistencia y comprobar que por ambos circula la misma corriente.',
      prerequisites: [{ lesson: 'm3-diagramas', text: 'Serie y paralelo' }],
      materials: ['Pila de 9 V con clip', 'Protoboard', '2 LED rojos', 'Resistencia de 330 Ω (naranja, naranja, marrón, oro)', '1 cable jumper', 'Multímetro'],
      diagram: 'm5-series-leds',
      layout: { fixed: BAT9, pieces: [R('R1', 330), LED('LED1', 'red', 'LED 1'), LED('LED2', 'red', 'LED 2'), W('J1')], check: 'netlist',
        nets: [['VCC', 'R1.1'], ['R1.2', 'LED1.A'], ['LED1.K', 'LED2.A'], ['LED2.K', 'GND']],
        placement: { 'R1.1': 'tp6', 'R1.2': 'b6', 'LED1.A': 'c6', 'LED1.K': 'c9', 'LED2.A': 'd9', 'LED2.K': 'd12', 'J1.A': 'a12', 'J1.B': 'tn12' } },
      connections: ['Resistencia de 330 Ω del carril + (columna 6) a b6.', 'LED 1: ánodo en c6, cátodo en c9.', 'LED 2: ánodo en d9 (misma tira que el cátodo del LED 1), cátodo en d12.', 'Cable de a12 al carril −.'],
      calculations: ['Tensión que toman los dos LED: 2,0 + 2,0 = 4,0 V.', 'R = (9 − 4,0) ÷ 0,015 ≈ 333 Ω → 330 Ω (E12).', 'Corriente real: (9 − 4,0) ÷ 330 ≈ 15,2 mA, la misma en ambos LED.'],
      expected: 'Los dos LED brillan igual. Si quitas uno, el otro se apaga: el camino queda abierto.',
      mistakes: [
        { symptom: 'Ninguno enciende', cause: 'Un LED invertido abre todo el circuito en serie.', fix: 'Revisa el sentido de cada LED: los ánodos miran hacia el +.' },
        { symptom: 'Brillan muy poco', cause: 'Se usó la resistencia de E1 (470 Ω) o los LED tienen más Vf (azules o blancos).', fix: 'Con LED azules (≈3 V cada uno) solo quedan 3 V: recalcula R ≈ 200 Ω → 220 Ω.' }
      ],
      questions: [
        { id: 'e3-q1', type: 'numeric', kind: 'ohm', prompt: 'Con tres LED rojos en serie (≈2 V cada uno) a 9 V y 15 mA, ¿qué resistencia mínima necesitas, en Ω?', unit: 'Ω', answer: (9 - 6) / 0.015, tolerance: 0.01,
          solution: 'R = (9 − 6) ÷ 0,015 = 200 Ω → 220 Ω.', mistakes: [{ value: (9 - 4) / 0.015, feedback: 'Ese es el cálculo para dos LED. Con tres, restan 6 V.' }], hint: 'Suma las tensiones de los tres LED.' },
        { id: 'e3-q2', type: 'mc', prompt: '¿Por qué no se pueden poner cinco LED rojos en serie con esta pila?',
          options: [
            { id: 'a', text: 'Porque necesitarían ≈10 V y la pila da 9 V: no conducirían', feedback: 'La suma de tensiones directas supera la de la fuente.' },
            { id: 'b', text: 'Porque la corriente se dividiría entre cinco', feedback: 'En serie la corriente es la misma en todos; el límite es la tensión.' }
          ], answer: 'a' }
      ],
      tinkercad: tk(['Añade una resistencia de 330 Ω y dos LED; une el cátodo del primero con el ánodo del segundo.']),
      safety: SAFE_9V, checklist: baseChecklist.concat([{ id: 'chain', text: 'El cátodo del LED 1 y el ánodo del LED 2 comparten la misma tira.' }])
    },
    {
      id: 'e4-leds-paralelo', code: 'E4', module: 'm5', title: 'LED en paralelo con sus resistencias', level: 'Inicial', minutes: 25,
      power: 'Pila de 9 V con clip', objective: 'Montar dos ramas en paralelo, cada una con su resistencia, y comprobar que la corriente total es la suma de las ramas.',
      prerequisites: [{ lesson: 'm4-montaje', text: 'Distribuir alimentación y tierra' }],
      materials: ['Pila de 9 V con clip', 'Protoboard', 'LED rojo y LED verde', '2 resistencias de 470 Ω', '2 cables jumper', 'Multímetro'],
      diagram: 'm5-parallel',
      layout: { fixed: BAT9, pieces: [R('R1', 470, 'Resistencia R1'), LED('LED1', 'red', 'LED 1 (rojo)'), R('R2', 470, 'Resistencia R2'), LED('LED2', 'green', 'LED 2 (verde)'), W('J1'), W('J2')], check: 'netlist',
        nets: [['VCC', 'R1.1', 'R2.1'], ['R1.2', 'LED1.A'], ['R2.2', 'LED2.A'], ['LED1.K', 'LED2.K', 'GND']],
        placement: { 'R1.1': 'tp6', 'R1.2': 'b6', 'LED1.A': 'c6', 'LED1.K': 'c9', 'J1.A': 'a9', 'J1.B': 'tn9', 'R2.1': 'tp14', 'R2.2': 'b14', 'LED2.A': 'c14', 'LED2.K': 'c17', 'J2.A': 'a17', 'J2.B': 'tn17' } },
      connections: ['Rama 1: R1 de tp6 a b6; LED rojo de c6 (ánodo) a c9; cable de a9 al carril −.', 'Rama 2: R2 de tp14 a b14; LED verde de c14 (ánodo) a c17; cable de a17 al carril −.'],
      calculations: ['Cada rama tiene 9 V: I1 = (9 − 2,0) ÷ 470 ≈ 14,9 mA.', 'LED verde (si es de los de ≈2,1 V): I2 ≈ (9 − 2,1) ÷ 470 ≈ 14,7 mA. Si es verde puro (≈3 V): ≈12,8 mA.', 'Corriente total de la pila ≈ I1 + I2 ≈ 28–30 mA.'],
      expected: 'Ambos LED encienden de forma independiente: si quitas uno, el otro sigue encendido.',
      mistakes: [
        { symptom: 'Uno brilla y el otro no', cause: 'Ese LED está invertido o su rama no llega al carril −.', fix: 'Revisa la rama que falla de forma aislada.' },
        { symptom: 'Brillo muy desigual', cause: 'Una sola resistencia compartida por los dos LED.', fix: 'Cada LED necesita su propia resistencia.' }
      ],
      questions: [
        { id: 'e4-q1', type: 'tf', prompt: 'Verdadero o falso: en paralelo, si un LED se funde (queda abierto), el otro se apaga.', answer: false,
          whyWrong: 'Cada rama es un camino independiente entre + y −.', explain: 'Solo se interrumpe la rama del LED fundido. Por eso las instalaciones de una casa están en paralelo.' },
        { id: 'e4-q2', type: 'numeric', kind: 'ohm', prompt: 'Si añades una tercera rama igual a la primera, ¿qué corriente total entregará la pila, en mA? (usa 14,9 mA por rama)', unit: 'mA', answer: 3 * 14.9, tolerance: 0.02,
          solution: 'En paralelo las corrientes se suman: 3 × 14,9 ≈ 44,7 mA.', mistakes: [{ value: 14.9, feedback: 'Esa es la corriente de una rama. La pila entrega la suma de todas.' }], hint: 'Suma las corrientes de las ramas.' }
      ],
      tinkercad: tk(['Construye las dos ramas con su resistencia de 470 Ω y su LED.', 'Mide la corriente total con un multímetro en serie con la pila.']),
      safety: SAFE_9V, checklist: baseChecklist.concat([{ id: 'own', text: 'Cada LED tiene su propia resistencia.' }])
    },
    {
      id: 'e5-pulsador', code: 'E5', module: 'm5', title: 'Pulsador para controlar un LED', level: 'Inicial', minutes: 25,
      power: 'Pila de 9 V con clip', objective: 'Usar un pulsador de 4 patas para abrir y cerrar el camino de un LED.',
      prerequisites: [{ lesson: 'm4-montaje', text: 'El pulsador de 4 patas' }],
      materials: ['Pila de 9 V con clip', 'Protoboard', 'Pulsador táctil de 4 patas', 'LED rojo', 'Resistencia de 470 Ω', '2 cables jumper'],
      diagram: 'm5-button',
      layout: { fixed: BAT9, pieces: [BTN('S1'), R('R1', 470), LED('LED1', 'red', 'LED rojo'), W('J1', 'red'), W('J2')], check: 'netlist',
        nets: [['VCC', 'S1.1'], ['S1.2', 'R1.1'], ['R1.2', 'LED1.A'], ['LED1.K', 'GND']],
        placement: { 'J1.A': 'tp4', 'J1.B': 'a4', 'S1.1': 'e4', 'S1.2': 'f6', 'R1.1': 'g6', 'R1.2': 'g10', 'LED1.A': 'h10', 'LED1.K': 'h13', 'J2.A': 'i13', 'J2.B': 'tn13' } },
      diagramNote: 'En el montaje solo se dibujan las dos patas diagonales que se usan del pulsador.',
      connections: ['Cable del carril + a a4.', 'Pulsador sobre el canal central, con una pata en e4 y la diagonal en f6.', 'Resistencia de 470 Ω de g6 a g10.', 'LED: ánodo en h10, cátodo en h13.', 'Cable de i13 al carril −.'],
      calculations: ['Pulsado: I = (9 − 2,0) ÷ 470 ≈ 14,9 mA.', 'Suelto: el circuito está abierto, I = 0.'],
      expected: 'El LED solo se enciende mientras mantienes presionado el pulsador.',
      mistakes: [
        { symptom: 'El LED está siempre encendido', cause: 'Se usaron dos patas del pulsador que están unidas internamente.', fix: 'Usa patas diagonales o gira el pulsador 90°.' },
        { symptom: 'Nunca enciende', cause: 'El pulsador no cruza el canal o el LED está invertido.', fix: 'Comprueba con continuidad que las patas usadas solo se unen al presionar.' }
      ],
      questions: [
        { id: 'e5-q1', type: 'mc', prompt: '¿Por qué conviene usar patas diagonalmente opuestas del pulsador?',
          options: [
            { id: 'a', text: 'Porque así siempre quedan en pares distintos y el contacto interno está entre ellas', feedback: 'Las patas diagonales nunca pertenecen al mismo par unido.' },
            { id: 'b', text: 'Porque el pulsador tiene polaridad', feedback: 'Los pulsadores no tienen polaridad.' }
          ], answer: 'a' },
        { id: 'e5-q2', type: 'tf', prompt: 'Verdadero o falso: el pulsador puede ir entre el LED y el carril − en lugar de antes de la resistencia.', answer: true,
          whyWrong: 'Sí puede: en serie el orden de los elementos no cambia la corriente.', explain: 'En un circuito en serie el orden no cambia la corriente: abrir el camino en cualquier punto apaga el LED.' }
      ],
      tinkercad: tk(['Añade un "Pulsador" sobre el canal central, una resistencia de 470 Ω y un LED.', 'Durante la simulación haz clic sobre el pulsador para presionarlo.']),
      safety: SAFE_9V, checklist: baseChecklist.concat([{ id: 'btn', text: 'El pulsador cruza el canal central y uso patas diagonales.' }])
    },
    {
      id: 'e6-potenciometro', code: 'E6', module: 'm5', title: 'Potenciómetro como divisor de tensión', level: 'Intermedio', minutes: 25,
      power: 'Pila de 9 V con clip', objective: 'Conectar un potenciómetro entre + y − y medir cómo cambia la tensión del cursor al girarlo.',
      prerequisites: [{ lesson: 'm1-multimetro', text: 'Medir tensión con el multímetro' }],
      materials: ['Pila de 9 V con clip', 'Protoboard', 'Potenciómetro de 10 kΩ', '2 cables jumper', 'Multímetro'],
      diagram: 'm5-pot',
      layout: { fixed: BAT9, pieces: [
        { id: 'P1', kind: 'pot', short: '10k', name: 'Potenciómetro 10 kΩ', terminals: [{ id: '1', label: 'extremo 1' }, { id: 'W', label: 'cursor' }, { id: '3', label: 'extremo 3' }] },
        { id: 'M1', kind: 'meter', short: 'V', polarized: true, name: 'Multímetro (V⎓)', terminals: T2(['R', 'punta roja'], ['C', 'punta negra (COM)']) },
        W('J1', 'red'), W('J2')], check: 'netlist',
        nets: [['VCC', 'P1.1'], ['P1.W', 'M1.R'], ['P1.3', 'GND', 'M1.C']],
        placement: { 'J1.A': 'tp10', 'J1.B': 'a10', 'P1.1': 'e10', 'P1.W': 'e12', 'P1.3': 'e14', 'J2.A': 'a14', 'J2.B': 'tn14', 'M1.R': 'b12', 'M1.C': 'tn20' } },
      diagramNote: 'Las puntas del multímetro se dibujan como si fueran una pieza para que el montaje quede completo.',
      connections: ['Potenciómetro con sus patas en e10, e12 y e14 (el cursor es la central).', 'Cable del carril + a a10.', 'Cable de a14 al carril −.', 'Multímetro en V⎓: punta roja en la tira del cursor (b12) y punta negra en el carril −.'],
      calculations: ['Corriente por el potenciómetro: 9 ÷ 10 000 = 0,9 mA (no depende del cursor).', 'Potencia: 9² ÷ 10 000 ≈ 8 mW.', 'Tensión del cursor: de 0 a 9 V. En la mitad del recorrido de un potenciómetro lineal (B), unos 4,5 V.'],
      expected: 'Al girar el eje, la lectura varía de forma continua entre unos 0 V y la tensión de la pila.',
      mistakes: [
        { symptom: 'La lectura no cambia', cause: 'El multímetro está en un extremo, no en el cursor.', fix: 'El cursor suele ser la pata central.' },
        { symptom: 'Se calienta', cause: 'El cursor está unido a + o a − directamente: al girar a tope se forma un cortocircuito.', fix: 'Desconecta. Solo los extremos van a + y −.' }
      ],
      questions: [
        { id: 'e6-q1', type: 'numeric', prompt: 'Si el cursor está a 3/4 del recorrido desde el extremo de GND, ¿qué tensión marcará, en V?', unit: 'V', answer: 9 * 0.75, tolerance: 0.01,
          solution: 'V = 9 × 0,75 = 6,75 V (potenciómetro lineal).', mistakes: [{ value: 9 * 0.25, feedback: 'Mediste desde el extremo de +. Desde GND, 3/4 del recorrido son 3/4 de la tensión.' }], hint: 'La tensión crece proporcionalmente desde el extremo de GND.' },
        { id: 'e6-q2', type: 'mc', prompt: '¿Por qué esta práctica prepara la lectura de sensores con Arduino?',
          options: [
            { id: 'a', text: 'Porque analogRead() mide justo la tensión de un divisor como este', feedback: 'LDR, termistores y potenciómetros se leen como divisores de tensión.' },
            { id: 'b', text: 'Porque el Arduino solo puede leer potenciómetros', feedback: 'Lee cualquier tensión de 0 a 5 V en A0–A5.' }
          ], answer: 'a' }
      ],
      tinkercad: tk(['Añade un "Potenciómetro" y un "Multímetro" en modo tensión entre el cursor y el negativo.', 'Durante la simulación arrastra el cursor del potenciómetro y observa la lectura.']),
      safety: SAFE_9V, checklist: [baseChecklist[0], baseChecklist[1], { id: 'ends', text: 'Solo los extremos del potenciómetro van a + y −; el cursor va al multímetro.' }, { id: 'mode', text: 'El multímetro está en V⎓ y su punta roja en el borne VΩ.' }]
    },
    {
      id: 'e7-sensor-ldr', code: 'E7', module: 'm5', title: 'Lectura de un sensor sencillo: LDR', level: 'Intermedio', minutes: 25,
      power: 'Pila de 9 V con clip', objective: 'Usar una fotorresistencia en serie con un LED para que el brillo cambie con la luz, y medir la resistencia de la LDR en distintas condiciones.',
      prerequisites: [{ practice: 'e1-led-basico', text: 'Práctica E1' }],
      materials: ['Pila de 9 V con clip', 'Protoboard', 'Fotorresistencia (LDR)', 'Resistencia de 220 Ω', 'LED rojo', '2 cables jumper', 'Multímetro'],
      diagram: 'm5-ldr',
      layout: { fixed: BAT9, pieces: [{ id: 'L1', kind: 'ldr', name: 'LDR', terminals: T2(['1', 'pata 1'], ['2', 'pata 2']) }, R('R1', 220), LED('LED1', 'red', 'LED rojo'), W('J1', 'red'), W('J2')], check: 'netlist',
        nets: [['VCC', 'L1.1'], ['L1.2', 'R1.1'], ['R1.2', 'LED1.A'], ['LED1.K', 'GND']],
        placement: { 'J1.A': 'tp4', 'J1.B': 'a4', 'L1.1': 'c4', 'L1.2': 'c7', 'R1.1': 'd7', 'R1.2': 'd11', 'LED1.A': 'c11', 'LED1.K': 'c14', 'J2.A': 'a14', 'J2.B': 'tn14' } },
      connections: ['Cable del carril + a a4.', 'LDR de c4 a c7.', 'Resistencia de 220 Ω de d7 a d11.', 'LED: ánodo en c11, cátodo en c14.', 'Cable de a14 al carril −.'],
      calculations: ['Con mucha luz (LDR ≈ 1 kΩ): I ≈ (9 − 2) ÷ (1 000 + 220) ≈ 5,7 mA.', 'A oscuras (LDR ≈ 100 kΩ): I ≈ 7 ÷ 100 220 ≈ 0,07 mA.', 'La resistencia de 220 Ω protege al LED si la LDR baja mucho con luz intensa: aun con la LDR a 0 Ω, I = 7 ÷ 220 ≈ 32 mA. Con LDR de ≥200 Ω típicos, I ≤ 17 mA.'],
      expected: 'El LED brilla más cuanta más luz recibe la LDR y casi se apaga al taparla. Ojo: este circuito hace lo contrario de una luz nocturna; con Arduino se invierte la lógica en el proyecto P3.',
      mistakes: [
        { symptom: 'El LED no cambia', cause: 'La LDR tiene sus dos patas en la misma tira o hay un cable que la puentea.', fix: 'Comprueba que las patas estén en c4 y c7.' },
        { symptom: 'El LED apenas brilla con luz', cause: 'LDR de alta resistencia o luz ambiente débil.', fix: 'Mide la LDR con el multímetro con y sin luz; acerca una lámpara.' }
      ],
      questions: [
        { id: 'e7-q1', type: 'mc', prompt: 'Tapas la LDR con el dedo. ¿Qué ocurre?',
          options: [
            { id: 'a', text: 'Su resistencia sube, baja la corriente y el LED se atenúa', feedback: 'Menos luz → más resistencia → menos corriente.' },
            { id: 'b', text: 'Su resistencia baja y el LED brilla más', feedback: 'Es al revés: la resistencia baja con más luz, no con menos.' }
          ], answer: 'a' },
        { id: 'e7-q2', type: 'reflection', prompt: 'Anota la resistencia de tu LDR con luz ambiente, con una linterna y tapada. ¿Cuántas veces cambia?',
          model: 'Ejemplo: 3 kΩ con luz ambiente, 400 Ω con linterna y 200 kΩ tapada: varía cientos de veces. Por eso se usa en un divisor de tensión, que convierte ese cambio en una tensión que se puede medir.' }
      ],
      tinkercad: tk(['Añade un "Fotorresistor", una resistencia de 220 Ω y un LED en serie.', 'Durante la simulación haz clic sobre la fotorresistencia y mueve el control de luz.']),
      safety: SAFE_9V, checklist: baseChecklist.concat([{ id: 'prot', text: 'La resistencia de 220 Ω está en serie con la LDR y el LED.' }])
    },
    {
      id: 'e8-zumbador', code: 'E8', module: 'm5', title: 'Circuito con zumbador', level: 'Inicial', minutes: 20,
      power: 'Fuente de 5 V (pines 5V y GND de un Arduino conectado por USB, o 4 pilas AA con regulador)', objective: 'Hacer sonar un zumbador activo al presionar un pulsador, respetando su polaridad y su tensión nominal.',
      prerequisites: [{ practice: 'e5-pulsador', text: 'Práctica E5' }],
      materials: ['Fuente de 5 V', 'Protoboard', 'Zumbador ACTIVO de 5 V', 'Pulsador de 4 patas', '2 cables jumper'],
      diagram: 'm5-buzzer',
      layout: { fixed: [{ label: '5V', hole: 'tp1', net: 'VCC' }, { label: 'GND', hole: 'tn3', net: 'GND' }], pieces: [BTN('S1'), { id: 'BZ1', kind: 'buzzer', polarized: true, name: 'Zumbador activo', terminals: T2(['P', 'pata + (larga)'], ['N', 'pata −']) }, W('J1', 'red'), W('J2')], check: 'netlist',
        nets: [['VCC', 'S1.1'], ['S1.2', 'BZ1.P'], ['BZ1.N', 'GND']],
        placement: { 'J1.A': 'tp4', 'J1.B': 'a4', 'S1.1': 'e4', 'S1.2': 'f6', 'BZ1.P': 'h6', 'BZ1.N': 'h9', 'J2.A': 'j9', 'J2.B': 'tn9' } },
      connections: ['5V al carril + y GND al carril − (fuente desconectada).', 'Cable del carril + a a4.', 'Pulsador sobre el canal: e4 y su diagonal f6.', 'Zumbador: pata + en h6 y pata − en h9.', 'Cable de j9 al carril −.'],
      calculations: ['Un zumbador activo de 5 V suele consumir menos de 30 mA: revisa su hoja de datos.', 'Si lo alimentas desde un Arduino usa el pin 5V (no un pin digital): así no se limita a los 20 mA de un pin.'],
      expected: 'Mientras mantienes presionado el pulsador, el zumbador emite un tono continuo.',
      mistakes: [
        { symptom: 'No suena', cause: 'Zumbador invertido, o es pasivo (necesita una señal oscilante).', fix: 'Comprueba la marca +. Si es pasivo, úsalo con tone() en la práctica P5.' },
        { symptom: 'Suena débil o distorsionado', cause: 'La fuente no da 5 V o el zumbador es de 12 V.', fix: 'Mide la tensión y revisa la tensión nominal impresa en el zumbador.' }
      ],
      questions: [
        { id: 'e8-q1', type: 'mc', kind: 'component', prompt: 'Tienes un zumbador sin marcas. Al aplicarle 5 V solo hace un clic. ¿Qué es?',
          options: [
            { id: 'a', text: 'Un zumbador pasivo', feedback: 'Los pasivos necesitan una señal que oscile; con tensión fija solo dan un clic.' },
            { id: 'b', text: 'Un zumbador activo invertido', feedback: 'Invertido, uno activo normalmente no hace nada; el clic es típico de los pasivos.' }
          ], answer: 'a' },
        { id: 'e8-q2', type: 'tf', prompt: 'Verdadero o falso: un zumbador activo de 5 V puede conectarse directamente a la pila de 9 V.', answer: false,
          whyWrong: '9 V supera su tensión nominal.', explain: 'Respeta la tensión indicada por el fabricante; existen zumbadores de 3–24 V, pero hay que comprobarlo.' }
      ],
      tinkercad: tk(['En lugar de la pila usa una "Fuente de alimentación" ajustada a 5 V.', 'Añade un "Zumbador piezoeléctrico" y un pulsador en serie.']),
      safety: 'Usa una fuente de 5 V. No conectes el zumbador a un pin digital si consume más de 20 mA.',
      checklist: [{ id: 'off', text: 'La fuente está desconectada mientras reviso.' }, { id: 'v', text: 'La fuente es de 5 V y el zumbador es de 5 V.' }, { id: 'pol', text: 'La pata + del zumbador va hacia el pulsador y el +.' }, { id: 'short', text: 'Ningún cable une el carril + con el carril −.' }]
    }
  ];

  P5.forEach((p) => CB.practices.add(p));
})(typeof window !== 'undefined' ? window : globalThis);
