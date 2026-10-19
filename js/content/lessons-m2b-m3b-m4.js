/* Fase 5: Módulo 2 (componentes activos), Módulo 3 (interpretación avanzada) y Módulo 4 (protoboard). */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  CB.lessons = CB.lessons || [];
  const { wire, dot, txt, part, P } = CB.diagrams.h;

  /* ---------- Diagramas de esta fase ---------- */
  CB.diagrams.add({
    id: 'mixed', viewBox: '0 0 520 280',
    title: 'Circuito mixto: R1 en serie con R2 y R3 en paralelo',
    desc: 'Batería de 9 V. Del positivo sale R1 (330 Ω) hasta un nodo B. Desde B, R2 y R3 (1 kΩ cada una) bajan en paralelo hasta el nodo C, que vuelve al negativo.',
    svg: [
      part('bat', 'Batería de 9 V', P('battery', 50, 90, 90) + txt(24, 146, '+', 'dg-pol') + txt(80, 156, '9 V')),
      wire([[50, 90], [50, 44], [100, 44]]),
      part('r1', 'R1', P('resistor', 100, 44, 0, 0.75) + txt(145, 24, 'R1 · 330 Ω', 'dg-label mid')),
      wire([[190, 44], [380, 44]]),
      part('node-b', 'Nodo B', dot(260, 44) + txt(260, 30, 'B', 'dg-label mid')),
      part('r2', 'R2', P('resistor', 260, 44, 90, 0.75) + txt(276, 96, 'R2 · 1 kΩ')),
      part('r3', 'R3', P('resistor', 380, 44, 90, 0.75) + txt(396, 96, 'R3 · 1 kΩ')),
      wire([[260, 134], [260, 250]]),
      wire([[380, 134], [380, 250], [50, 250], [50, 210]]),
      part('node-c', 'Nodo C', dot(260, 250) + txt(260, 272, 'C', 'dg-label mid')),
      txt(36, 64, 'A', 'dg-label')
    ].join('')
  });

  CB.diagrams.add({
    id: 'relay-driver', viewBox: '0 -24 560 354',
    title: 'Relé controlado con transistor y diodo de protección',
    desc: 'El pin D7 del Arduino llega a la base de un transistor NPN a través de una resistencia de 1 kΩ. El emisor va a GND. El colector se conecta a un extremo de la bobina del relé; el otro extremo de la bobina va a +5V. Un diodo 1N4007 está en paralelo con la bobina, con su cátodo hacia +5V.',
    svg: [
      part('board', 'Arduino Uno', '<rect x="20" y="150" width="104" height="100" rx="6" class="board"/>' + txt(60, 205, 'Arduino', 'dg-label mid')),
      part('d7', 'Pin D7', '<rect x="118" y="194" width="12" height="12" class="pin"/>' + txt(112, 205, 'D7', 'dg-label end')),
      wire([[130, 200], [160, 200]]),
      part('rb', 'Resistencia de base 1 kΩ', P('resistor', 160, 200, 0, 0.7) + txt(202, 182, 'Rb · 1 kΩ', 'dg-label mid')),
      wire([[244, 200], [270, 200]]),
      part('q1', 'Transistor NPN', P('npn', 270, 200, 0) + txt(356, 222, 'Q1 BC547', 'dg-label')),
      wire([[346, 230], [346, 262]]), P('ground', 286, 292, 0),
      wire([[346, 170], [346, 150]]),
      part('coil', 'Bobina del relé', P('resistor', 346, 150, -90, 0.7) + txt(296, 112, 'bobina', 'dg-label end') + txt(296, 128, 'relé 5 V', 'dg-note end')),
      wire([[346, 66], [346, 42]]), P('vcc', 286, 12, 0), txt(346, 2, '+5V', 'dg-label mid'),
      wire([[346, 56], [430, 56]]), wire([[346, 160], [430, 160]]),
      part('d1', 'Diodo de protección', P('diode', 430, 160, -90, 0.7) + txt(446, 112, 'D1 · 1N4007')),
      wire([[430, 76], [430, 56]]),
      txt(446, 130, 'cátodo hacia +5V', 'dg-note'),
      '<rect x="420" y="220" width="130" height="58" rx="6" class="module"/>' + txt(485, 244, 'Contactos', 'dg-label mid') + txt(485, 262, 'COM · NA → carga', 'dg-note mid')
    ].join('')
  });

  CB.compose.addArduino('hcsr04-wiring', 'Conexión del sensor HC-SR04', 'Diagrama de conexiones: 5V del Arduino al pin VCC del sensor, D9 a Trig, D10 a Echo y GND a GND.', {
    rows: [{ type: 'module', name: 'HC-SR04', id: 'hcsr04', pins: [{ from: '5V', pin: 'VCC' }, { from: 'D9', pin: 'Trig' }, { from: 'D10', pin: 'Echo' }, { from: 'GND', pin: 'GND' }] }]
  });

  const LED_EX = 'lab-led', BTN_EX = 'lab-button', PAR_EX = 'lab-parallel';

  CB.lessons.push(
    /* ================================================================ M2 */
    {
      id: 'm2-activos', module: 'm2', title: 'Transistores, relés y sensores', minutes: 25,
      objectives: ['Distinguir componentes pasivos de activos.', 'Explicar por qué un relé necesita un transistor y un diodo.', 'Reconocer sensores de salida analógica, digital y por pulsos.', 'Buscar en una hoja de datos lo imprescindible.'],
      slides: [
        { title: 'Pasivos y activos',
          body: '<p><strong>Pasivos</strong>: resistencias, condensadores, bobinas. No amplifican ni controlan una corriente con otra.</p><p><strong>Activos</strong>: transistores, circuitos integrados, sensores con electrónica propia. Usan una señal pequeña para controlar algo mayor, o necesitan alimentación para funcionar.</p><p>Los activos casi siempre tienen <strong>pines con función fija</strong> y límites de tensión que hay que respetar.</p>' },
        { title: 'El transistor como interruptor',
          body: '<p>Un pin del Arduino da como mucho 20 mA recomendados. Para encender algo que pide más (un relé, un motor pequeño, una tira de LED) se usa un <strong>transistor NPN</strong> como interruptor:</p><ol><li>El pin, a través de una resistencia de base (≈1 kΩ), inyecta una corriente pequeña en la base.</li><li>El transistor permite entonces una corriente mucho mayor de colector a emisor.</li><li>La carga se conecta entre la alimentación y el colector; el emisor va a GND.</li></ol><p>El orden de las patas depende del modelo: un BC547 y un 2N2222A en el mismo encapsulado tienen órdenes distintos.</p>',
          media: { component: 'transistor' }, activity: 'm2-b1' },
        { title: 'El relé y su diodo de protección',
          body: '<p>La bobina de un relé de 5 V consume unos 70–90 mA: demasiado para un pin. Por eso se acciona con un transistor.</p><p>Al cortar la corriente de una bobina aparece un pico de tensión inverso. El <strong>diodo de rueda libre</strong> (1N4007), conectado en paralelo con la bobina y con el cátodo hacia +5V, deja que esa energía se descargue sin dañar el transistor.</p><p>Los <strong>módulos de relé</strong> ya traen transistor y diodo; aun así, revisa su consumo y cómo se activan (algunos se activan con LOW).</p>',
          media: { diagram: 'relay-driver' }, activity: 'm2-b2' },
        { title: 'Tres formas de entregar una medida',
          body: '<ul><li><strong>Analógica</strong>: una tensión proporcional a la magnitud. TMP36 (10 mV/°C), LDR o termistor en un divisor. Se leen con <code>analogRead()</code>.</li><li><strong>Digital</strong>: solo dos estados, como un pulsador o un sensor de movimiento PIR. Se leen con <code>digitalRead()</code>.</li><li><strong>Por pulsos o protocolo</strong>: la duración de un pulso (HC-SR04) o un protocolo de comunicación (I²C, OneWire). Requieren una función o librería específica.</li></ul>',
          media: { component: 'sensores' }, activity: 'm2-b3' },
        { title: 'Leer una hoja de datos',
          body: '<p>No hace falta entenderla entera. Busca estas cinco cosas:</p><ol><li><strong>Distribución de pines</strong> (pinout) y vista desde la que está dibujada.</li><li><strong>Tensión de alimentación</strong> recomendada.</li><li><strong>Valores máximos absolutos</strong>: superarlos aunque sea un instante puede dañar el componente.</li><li><strong>Corriente</strong> que consume o que admite.</li><li><strong>Circuito de aplicación típico</strong>: suele ser el mejor punto de partida.</li></ol>',
          activity: 'm2-b4' }
      ],
      activities: [
        { id: 'm2-b1', type: 'mc', kind: 'component', prompt: '¿Para qué sirve la resistencia de base (≈1 kΩ) entre el pin del Arduino y la base de un transistor?',
          options: [
            { id: 'a', text: 'Para limitar la corriente que sale del pin y entra en la base', feedback: 'La unión base-emisor se comporta como un diodo: sin resistencia, la corriente desde el pin sería excesiva.' },
            { id: 'b', text: 'Para que el transistor aguante más corriente de colector', feedback: 'La corriente máxima de colector la fija el transistor; la resistencia de base no la aumenta.' },
            { id: 'c', text: 'No hace falta: el transistor ya limita la corriente', feedback: 'Sí hace falta: sin ella el pin y la base trabajarían fuera de sus límites.' }
          ], answer: 'a' },
        { id: 'm2-b2', type: 'hotspot', kind: 'diagram', prompt: 'Haz clic en el componente que protege al transistor del pico de tensión de la bobina.',
          media: { diagram: 'relay-driver' }, answer: ['d1'],
          feedback: {
            d1: 'El diodo D1, en paralelo con la bobina y con el cátodo hacia +5V, descarga el pico inverso al desconectar la bobina.',
            rb: 'Rb limita la corriente de base; no actúa sobre el pico de la bobina.',
            q1: 'El transistor es lo que queremos proteger.',
            coil: 'La bobina es la que genera el pico al cortarse su corriente.',
            d7: 'El pin D7 da la orden; la protección está junto a la bobina.',
            board: 'La placa no interviene en esta protección.'
          } },
        { id: 'm2-b3', type: 'mc', kind: 'component', prompt: 'Un HC-SR04 indica la distancia mediante…',
          options: [
            { id: 'a', text: 'Una tensión proporcional a la distancia', feedback: 'Eso sería un sensor analógico. El HC-SR04 no entrega una tensión variable.' },
            { id: 'b', text: 'La duración de un pulso en su pin Echo', feedback: 'El pulso dura lo que tarda el ultrasonido en ir y volver. Se mide con pulseIn().' },
            { id: 'c', text: 'Un número por I²C', feedback: 'El HC-SR04 clásico no usa I²C.' }
          ], answer: 'b' },
        { id: 'm2-b4', type: 'order', prompt: 'Ordena los pasos para identificar con seguridad un componente que no conoces.',
          steps: [
            { id: 'k1', text: 'Lee la inscripción del cuerpo (modelo y fabricante).', why: 'Sin el modelo no puedes buscar su hoja de datos.' },
            { id: 'k2', text: 'Busca la hoja de datos de ese modelo exacto.', why: 'Componentes parecidos pueden tener pines y límites distintos.' },
            { id: 'k3', text: 'Localiza el pinout y desde qué vista está dibujado.', why: 'Saber qué es cada pata es necesario antes de conectar nada.' },
            { id: 'k4', text: 'Anota tensión de alimentación y valores máximos.', why: 'Así eliges la fuente y las protecciones adecuadas.' },
            { id: 'k5', text: 'Compruébalo con el multímetro sin alimentación.', why: 'La prueba física confirma lo que leíste antes de energizar.' }
          ],
          explain: 'Identificar, documentarse y comprobar antes de alimentar evita la mayoría de componentes quemados.' }
      ]
    },

    /* ================================================================ M3 */
    {
      id: 'm3-interpretar', module: 'm3', title: 'Circuitos mixtos y esquemas de pines', minutes: 25,
      objectives: ['Reducir un circuito mixto paso a paso.', 'Contar nodos en un esquema.', 'Leer un diagrama de conexiones de un módulo.'],
      slides: [
        { title: 'Un circuito mixto',
          body: '<p>Muchos circuitos combinan serie y paralelo. Aquí R1 está en serie con el conjunto formado por R2 y R3, que están en paralelo entre los nodos B y C.</p><p>Pista: por R1 pasa <em>toda</em> la corriente de la batería; después se reparte entre R2 y R3.</p>',
          media: { diagram: 'mixed' }, activity: 'm3-b1' },
        { title: 'Reducir paso a paso',
          body: '<ol><li>Busca grupos que estén claramente en paralelo (entre los mismos dos nodos): R2 ∥ R3 = 1 kΩ ∥ 1 kΩ = <strong>500 Ω</strong>.</li><li>Sustituye el grupo por su equivalente. Ahora R1 y ese equivalente están en serie.</li><li>Suma: 330 + 500 = <strong>830 Ω</strong>.</li><li>Corriente total: I = 9 ÷ 830 ≈ <strong>10,8 mA</strong>. Por R2 y R3 pasa la mitad a cada una (≈5,4 mA), porque son iguales.</li></ol>',
          media: { diagram: 'mixed' }, activity: ['m3-b2', 'm3-b3'] },
        { title: 'Contar nodos',
          body: '<p>Un <strong>nodo</strong> es todo lo que está unido por líneas, aunque el dibujo lo estire. En el circuito mixto hay tres:</p><ul><li><strong>A</strong>: el positivo de la batería y el lado izquierdo de R1.</li><li><strong>B</strong>: el lado derecho de R1 y la parte superior de R2 y R3.</li><li><strong>C</strong>: la parte inferior de R2 y R3 y el negativo de la batería.</li></ul><p>En la protoboard, cada nodo será una tira o un carril.</p>',
          activity: 'm3-b4' },
        { title: 'Diagramas de conexiones de módulos',
          body: '<p>Para módulos (sensores, pantallas) es habitual un <strong>diagrama de conexiones</strong>: cada pin del módulo con una línea al pin de la placa. No muestra la electrónica interna del módulo.</p><p>Lee siempre los nombres impresos en el módulo: el orden de los pines cambia entre fabricantes.</p>',
          media: { diagram: 'hcsr04-wiring' }, activity: 'm3-b5' },
        { title: 'Esquema, diagrama de conexiones y montaje',
          body: '<table class="units"><thead><tr><th>Tipo</th><th>Muestra</th><th>Úsalo para</th></tr></thead><tbody><tr><td>Esquema eléctrico</td><td>Componentes con símbolos y sus nodos</td><td>Entender y calcular el circuito</td></tr><tr><td>Diagrama de conexiones</td><td>Qué pin va con qué pin</td><td>Cablear módulos y placas</td></tr><tr><td>Esquema de pines</td><td>Función de cada pin de una placa o chip</td><td>Elegir pines válidos (PWM, analógicos…)</td></tr><tr><td>Montaje físico</td><td>Posición real en la protoboard</td><td>Construirlo y revisarlo</td></tr></tbody></table>',
          activity: 'm3-b6' }
      ],
      activities: [
        { id: 'm3-b1', type: 'hotspot', kind: 'diagram', prompt: 'Haz clic en la resistencia por la que pasa toda la corriente de la batería.',
          media: { diagram: 'mixed' }, answer: ['r1'],
          feedback: {
            r1: 'R1 está en serie con la batería: toda la corriente pasa por ella antes de repartirse en el nodo B.',
            r2: 'Por R2 pasa solo una parte: la corriente se reparte entre R2 y R3.',
            r3: 'Por R3 pasa solo una parte: la corriente se reparte entre R2 y R3.',
            bat: 'La batería impulsa la corriente; la pregunta pide una resistencia.',
            'node-b': 'Este nodo es donde la corriente se divide.',
            'node-c': 'Este nodo es donde las corrientes de R2 y R3 se vuelven a juntar.'
          } },
        { id: 'm3-b2', type: 'numeric', kind: 'diagram', prompt: '¿Cuál es la resistencia total del circuito mixto, en Ω?', unit: 'Ω', answer: 830, tolerance: 0.005,
          solution: 'R2 ∥ R3 = 500 Ω; en serie con R1: 330 + 500 = 830 Ω.',
          mistakes: [{ value: 2330, feedback: 'Sumaste las tres como si estuvieran en serie. R2 y R3 están en paralelo.' }, { value: 330 * 1000 / (330 + 1000) + 1000, feedback: 'Agrupaste mal: las que están en paralelo son R2 y R3, no R1 con una de ellas.' }, { value: 500, feedback: 'Ese es solo el equivalente de R2 ∥ R3. Falta sumar R1.' }],
          hint: 'Primero el paralelo, luego la serie.' },
        { id: 'm3-b3', type: 'numeric', kind: 'ohm', prompt: 'Con 9 V, ¿qué corriente sale de la batería, en mA?', unit: 'mA', answer: 9 / 830 * 1000, tolerance: 0.02,
          solution: 'I = 9 ÷ 830 ≈ 0,01084 A ≈ 10,8 mA.',
          mistakes: [{ value: 9 / 330 * 1000, feedback: 'Usaste solo R1. Usa la resistencia total del circuito (830 Ω).' }, { value: 9 / 830, feedback: 'Correcto en amperios; pásalo a mA multiplicando por 1 000.' }],
          hint: 'I = V ÷ Rtotal.' },
        { id: 'm3-b4', type: 'mc', kind: 'diagram', prompt: 'Si montas el circuito mixto en una protoboard sin usar los carriles, ¿cuántas tiras distintas necesitas como mínimo para los nodos?',
          options: [
            { id: 'a', text: '2', feedback: 'Con dos tiras no puedes separar los nodos A, B y C.' },
            { id: 'b', text: '3', feedback: 'Un nodo por tira: A, B y C.' },
            { id: 'c', text: '4', feedback: 'Funcionaría, pero sobra una: el circuito solo tiene tres nodos.' },
            { id: 'd', text: '5, una por cada componente', feedback: 'Las tiras se asignan a nodos, no a componentes.' }
          ], answer: 'b' },
        { id: 'm3-b5', type: 'mc', kind: 'diagram', prompt: 'Según el diagrama, ¿qué pin del Arduino recibe el eco del sensor?',
          media: { diagram: 'hcsr04-wiring' },
          options: [
            { id: 'a', text: 'D9', feedback: 'D9 va a Trig: es el que envía el disparo.' },
            { id: 'b', text: 'D10', feedback: 'D10 está conectado a Echo y se configura como entrada.' },
            { id: 'c', text: '5V', feedback: '5V solo alimenta el sensor.' }
          ], answer: 'b' },
        { id: 'm3-b6', type: 'tf', kind: 'diagram', prompt: 'Verdadero o falso: un diagrama de conexiones de un módulo muestra cómo está hecho el circuito dentro del módulo.',
          answer: false, whyWrong: 'Solo muestra qué pin se une con qué pin.',
          explain: 'Para conocer la electrónica interna hay que consultar el esquema del módulo o su hoja de datos.' }
      ]
    },

    /* ================================================================ M4 */
    {
      id: 'm4-protoboard', module: 'm4', title: 'Cómo está hecha una protoboard', minutes: 20,
      objectives: ['Describir filas, columnas, canal central y carriles.', 'Predecir qué orificios están conectados.', 'Colocar componentes sin cortocircuitarlos.'],
      slides: [
        { title: 'Anatomía',
          body: '<ul><li>Las <strong>columnas</strong> están numeradas (1–30 en una media protoboard).</li><li>Cada columna tiene dos <strong>tiras</strong> de 5 orificios unidos por dentro: filas a–e y filas f–j.</li><li>El <strong>canal central</strong> separa las dos tiras de cada columna.</li><li>Los <strong>carriles</strong> de alimentación (+ rojo, − azul) recorren el borde a lo largo.</li></ul><p>En la imagen, los orificios resaltados son una sola tira: la de la columna 10, filas a–e.</p>',
          media: { breadboard: { highlight: { holes: ['a10', 'b10', 'c10', 'd10', 'e10'], cls: 'hl' }, label: 'Tira a–e de la columna 10 resaltada' } }, activity: 'm4-a1' },
        { title: 'Los carriles',
          body: '<p>Todos los orificios de un carril están unidos a lo largo. Se usan para repartir la alimentación: un cable lleva 5V (o el + de la pila) al carril rojo y otro lleva GND al azul.</p><p class="callout warn">En algunas protoboards largas los carriles están <strong>partidos a la mitad</strong> (a veces lo indica un hueco en la línea roja o azul). Si tu circuito funciona en un lado y no en el otro, comprueba la continuidad o une las dos mitades con un cable.</p>',
          media: { breadboard: { highlight: { holes: Array.from({ length: 30 }, (_, i) => 'tp' + (i + 1)), cls: 'hl' }, label: 'Carril + superior resaltado' } }, activity: 'm4-a2' },
        { title: 'Colocar componentes',
          body: '<ul><li>Cada pata de un componente de dos patas va en una <strong>tira distinta</strong>. Si ambas comparten tira, quedan en cortocircuito.</li><li>Los circuitos integrados y los pulsadores de 4 patas se colocan <strong>sobre el canal central</strong> para que cada pata quede en una tira distinta.</li><li>Dobla las patas con suavidad y no las fuerces: los contactos se aflojan.</li><li>Usa cables cortos y pegados a la placa: el montaje se revisa mejor.</li></ul>',
          activity: 'm4-a3' },
        { title: 'Puentes y jumpers',
          body: '<p>Los cables puente unen tiras, carriles o pines de la placa. Hábitos que ahorran horas:</p><ul><li><strong>Rojo</strong> para +, <strong>negro o azul</strong> para GND, otros colores para señales.</li><li>Un color por función en todo el montaje.</li><li>Si un cable "baila", cámbialo: los falsos contactos son el fallo más difícil de encontrar.</li></ul><p>En el <a href="#/laboratorio">Laboratorio</a> tienes un modo para explorar qué orificios están unidos por dentro.</p>',
          activity: 'm4-a4' }
      ],
      activities: [
        { id: 'm4-a1', type: 'mc', prompt: '¿Con qué orificio está conectado internamente el h7?',
          options: [
            { id: 'a', text: 'f7', feedback: 'f, g, h, i y j de la columna 7 forman una tira.' },
            { id: 'b', text: 'c7', feedback: 'c7 está en el otro bloque: el canal central los separa.' },
            { id: 'c', text: 'h8', feedback: 'Las filas no están unidas a lo largo; solo los carriles.' }
          ], answer: 'a' },
        { id: 'm4-a2', type: 'tf', prompt: 'Verdadero o falso: el carril + superior y el carril + inferior están siempre unidos entre sí.',
          answer: false, whyWrong: 'Son tiras independientes en lados opuestos de la placa.',
          explain: 'Si quieres alimentación en ambos lados, une los dos carriles + con un cable y los dos − con otro.' },
        { id: 'm4-a3', type: 'mc', kind: 'error', prompt: 'Colocas una resistencia con una pata en b12 y la otra en d12. ¿Qué ocurre?',
          options: [
            { id: 'a', text: 'Funciona normalmente', feedback: 'b12 y d12 están en la misma tira: la resistencia queda en cortocircuito.' },
            { id: 'b', text: 'Queda en cortocircuito: la corriente la rodea por la tira', feedback: 'Las dos patas están unidas por dentro, así que la resistencia no limita nada.' },
            { id: 'c', text: 'Se divide su valor entre dos', feedback: 'No: simplemente queda puenteada por la tira metálica.' }
          ], answer: 'b' },
        { id: 'm4-a4', type: 'reflection', prompt: 'Describe qué convención de colores usarás para tus cables y por qué te ayuda a encontrar errores.',
          model: 'Rojo para 5V, negro para GND y otros colores para señales. Así, si veo un cable rojo llegando a un carril azul, sé de inmediato que hay un error de alimentación, sin seguir todo el recorrido.' }
      ]
    },
    {
      id: 'm4-montaje', module: 'm4', title: 'Del esquema a la protoboard', minutes: 30,
      objectives: ['Montar un LED con su resistencia.', 'Conectar un pulsador de 4 patas correctamente.', 'Distribuir alimentación y tierra.', 'Detectar errores de conexión antes de energizar.'],
      slides: [
        { title: 'LED con su resistencia',
          body: '<p>Método: <strong>un nodo del esquema = una tira o un carril</strong>.</p><ol><li>Nodo +: el carril rojo. Una pata de la resistencia va ahí.</li><li>Nodo entre resistencia y LED: una tira libre. La otra pata de la resistencia y el ánodo del LED comparten esa tira.</li><li>Nodo −: el cátodo en otra tira, unida con un cable al carril azul.</li></ol>',
          media: { breadboard: { exercise: LED_EX, label: 'LED con resistencia montado', caption: 'Montaje verificado: el mismo que la solución del laboratorio.' } }, activity: 'm4-b1' },
        { title: 'El pulsador de 4 patas',
          body: '<p>Un pulsador táctil tiene 4 patas unidas de dos en dos. Al presionarlo se unen los dos pares.</p><ul><li>Colócalo <strong>sobre el canal central</strong>: cada pata cae en una tira distinta.</li><li>Usa dos patas <strong>diagonalmente opuestas</strong>: así siempre atraviesas el contacto.</li><li>En la imagen solo se dibujan las dos patas que se usan (e4 y f6).</li></ul>',
          media: { breadboard: { exercise: BTN_EX, label: 'Pulsador sobre el canal central' } }, activity: 'm4-b2' },
        { title: 'Distribuir alimentación y tierra',
          body: '<ul><li>Lleva 5V de la placa (o el + de la fuente) al carril rojo y GND al azul, al principio de la placa.</li><li>Si usas los dos lados, une los carriles + entre sí y los − entre sí.</li><li>Todas las tierras deben estar unidas: la de la placa, la de una fuente externa y la de cada módulo. Sin tierra común, las señales no tienen referencia.</li></ul>',
          media: { breadboard: { exercise: PAR_EX, label: 'Dos ramas alimentadas desde los carriles' } }, activity: 'm4-b3' },
        { title: 'Errores de conexión típicos',
          body: '<ol><li>Las dos patas de un componente en la misma tira.</li><li>LED o condensador electrolítico invertidos.</li><li>Carril partido a la mitad sin unir.</li><li>Cable en la columna de al lado (por ejemplo, 12 en lugar de 13).</li><li>Pin de la placa equivocado (D8 en lugar de D9).</li><li>Falta la tierra común entre la placa y una fuente externa.</li></ol><p>Revisión recomendada: sigue cada nodo del esquema y busca su tira en la placa, uno por uno.</p>',
          activity: 'm4-b4' },
        { title: 'Practica en el laboratorio',
          body: '<p>El <a href="#/laboratorio">Laboratorio</a> tiene tres ejercicios con verificación: LED con resistencia, pulsador con LED y dos LED en paralelo. Si te equivocas, te dice qué terminal falta, cuál sobra o qué componente está invertido.</p>',
          activity: 'm4-b5' }
      ],
      activities: [
        { id: 'm4-b1', type: 'mc', kind: 'diagram', prompt: 'En el montaje de la imagen, ¿por qué el ánodo del LED está en la tira 6, igual que la resistencia?',
          options: [
            { id: 'a', text: 'Porque en el esquema la resistencia y el ánodo forman el mismo nodo', feedback: 'Cada nodo del esquema se convierte en una tira.' },
            { id: 'b', text: 'Por estética: podrían ir en tiras distintas sin cable', feedback: 'Sin compartir tira ni tener un cable, el circuito quedaría abierto.' },
            { id: 'c', text: 'Porque la tira 6 está más cerca del carril', feedback: 'La posición es libre; lo importante es que compartan nodo.' }
          ], answer: 'a' },
        { id: 'm4-b2', type: 'mc', kind: 'error', prompt: 'Colocas el pulsador de 4 patas sin cruzar el canal, con las cuatro patas en filas a–e. ¿Qué problema aparece?',
          options: [
            { id: 'a', text: 'Ninguno', feedback: 'Con las patas en el mismo bloque, varias quedan unidas por las tiras y el pulsador puede quedar puenteado.' },
            { id: 'b', text: 'Patas que deberían estar separadas quedan unidas por la tira y el circuito queda siempre cerrado o mal conectado', feedback: 'Por eso se coloca sobre el canal central.' },
            { id: 'c', text: 'El pulsador se invierte de polaridad', feedback: 'Los pulsadores no tienen polaridad.' }
          ], answer: 'b' },
        { id: 'm4-b3', type: 'tf', prompt: 'Verdadero o falso: si alimentas un servo con una fuente externa de 5 V, su GND no necesita unirse al GND del Arduino.',
          answer: false, whyWrong: 'Sin tierra común, la señal del Arduino no tiene la misma referencia que el servo.',
          explain: 'Las tierras de todas las fuentes y módulos deben estar unidas.' },
        { id: 'm4-b4', type: 'order', kind: 'diagram', prompt: 'Ordena los pasos para montar el circuito "5V → pulsador → resistencia → LED → GND".',
          steps: [
            { id: 'q1', text: 'Desconecta la alimentación y lleva 5V y GND a los carriles.', why: 'Primero se prepara la alimentación, sin energía.' },
            { id: 'q2', text: 'Coloca el pulsador sobre el canal central.', why: 'Su posición define las tiras de los dos primeros nodos.' },
            { id: 'q3', text: 'Une el carril + con la tira de una pata del pulsador.', why: 'Conecta el primer nodo del esquema.' },
            { id: 'q4', text: 'Coloca la resistencia desde la tira de la pata diagonal hasta una tira libre.', why: 'Sigue el orden del esquema.' },
            { id: 'q5', text: 'Coloca el LED con el ánodo en la tira de la resistencia y lleva el cátodo al carril −.', why: 'El LED cierra el camino hacia GND con la polaridad correcta.' }
          ],
          explain: 'Montar siguiendo el esquema nodo a nodo, desde el + hacia el −, deja pocos sitios para equivocarse.' },
        { id: 'm4-b5', type: 'mc', kind: 'challenge', prompt: 'Reto: montas dos LED en paralelo que comparten UNA sola resistencia. ¿Qué es lo más probable?',
          options: [
            { id: 'a', text: 'Los dos brillan igual', feedback: 'Solo si fueran idénticos. En la práctica sus tensiones directas difieren un poco y uno se lleva más corriente.' },
            { id: 'b', text: 'Uno brilla más que el otro y puede llevarse casi toda la corriente', feedback: 'Por eso cada LED en paralelo necesita su propia resistencia.' },
            { id: 'c', text: 'Ninguno enciende', feedback: 'Encenderían, pero de forma desigual.' }
          ], answer: 'b' }
      ]
    }
  );
})(typeof window !== 'undefined' ? window : globalThis);
