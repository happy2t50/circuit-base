/* Prácticas guiadas. Plantilla completa del currículo (objetivo … lista de verificación). */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});

  const A1 = {
    id: 'a1-blink-externo',
    code: 'A1',
    module: 'm7',
    title: 'LED externo intermitente en D8',
    level: 'Inicial',
    minutes: 40,
    board: 'Arduino Uno R3 (ATmega328P, lógica de 5 V, 20 mA recomendados por pin)',
    objective: 'Montar un LED con su resistencia limitadora en una protoboard, conectarlo al pin digital D8 de un Arduino Uno R3 y programarlo para que parpadee una vez por segundo.',
    prerequisites: [
      { lesson: 'm1-ohm', text: 'Ley de Ohm y cálculo de la resistencia de un LED' },
      { lesson: 'm2-identificar', text: 'Identificar ánodo y cátodo de un LED' },
      { lesson: 'm3-diagramas', text: 'Pasar de un esquema a una protoboard' }
    ],
    materials: [
      '1 × Arduino Uno R3 y su cable USB',
      '1 × protoboard (media o completa)',
      '1 × LED rojo de 5 mm',
      '1 × resistencia de 220 Ω (rojo, rojo, marrón, oro)',
      '3 × cables jumper macho-macho (uno de ellos negro para GND)',
      'Ordenador con Arduino IDE 2.x instalado'
    ],
    diagram: 'arduino-led',
    // Montaje físico. Lo dibuja la misma vista de protoboard que el laboratorio y lo valida
    // el mismo verificador en tests/engine.test.js, de modo que esquema y montaje coinciden.
    layout: {
      fixed: [{ label: 'D8', hole: 'a5', net: 'VCC' }, { label: 'GND', hole: 'tn1', net: 'GND' }],
      pieces: [
        { id: 'R1', kind: 'resistor', name: 'Resistencia 220 Ω', terminals: [{ id: '1', label: 'pata 1' }, { id: '2', label: 'pata 2' }] },
        { id: 'LED1', kind: 'led', name: 'LED rojo', terminals: [{ id: 'A', label: 'ánodo (pata larga)' }, { id: 'K', label: 'cátodo (pata corta)' }] },
        { id: 'J1', kind: 'wire', name: 'Cable negro', optional: true, terminals: [{ id: 'A', label: 'extremo A' }, { id: 'B', label: 'extremo B' }] }
      ],
      check: 'led-series',
      placement: { 'R1.1': 'e5', 'R1.2': 'e9', 'LED1.A': 'c9', 'LED1.K': 'c11', 'J1.A': 'a11', 'J1.B': 'tn11' }
    },
    connections: [
      'Con el Arduino desconectado, coloca la resistencia de 220 Ω entre e5 y e9.',
      'Coloca el LED con el ánodo (pata larga) en c9 —misma tira que la resistencia— y el cátodo (pata corta) en c11.',
      'Cable negro desde a11 hasta el carril − (azul) superior.',
      'Cable desde el pin D8 del Arduino hasta a5 (la tira de la otra pata de la resistencia).',
      'Cable negro desde un pin GND del Arduino hasta el carril − superior.'
    ],
    calculations: [
      'Tensión del pin en HIGH: 5 V. Tensión directa del LED rojo: Vf ≈ 2,0 V.',
      'Corriente con 220 Ω: I = (5 − 2,0) ÷ 220 ≈ 0,0136 A = 13,6 mA.',
      '13,6 mA < 20 mA recomendados por pin del Uno R3: dentro del límite.',
      'Potencia en la resistencia: P = 3,0 V × 0,0136 A ≈ 0,041 W, muy por debajo de 0,25 W.'
    ],
    sketch: [
      '// Práctica A1: LED externo intermitente en D8 (Arduino Uno R3)',
      'const int PIN_LED = 8;          // pin donde está conectada la resistencia del LED',
      '',
      'void setup() {',
      '  pinMode(PIN_LED, OUTPUT);     // configura D8 como salida',
      '}',
      '',
      'void loop() {',
      '  digitalWrite(PIN_LED, HIGH);  // D8 a 5 V: circula corriente y el LED se enciende',
      '  delay(500);                   // espera 500 ms',
      '  digitalWrite(PIN_LED, LOW);   // D8 a 0 V: sin corriente, el LED se apaga',
      '  delay(500);                   // espera 500 ms y loop() vuelve a empezar',
      '}'
    ].join('\n'),
    codeExplain: [
      { line: 2, text: '<code>const int PIN_LED = 8;</code> guarda el número de pin en una constante con nombre. Si cambias de pin, solo editas esta línea.' },
      { line: 4, text: '<code>setup()</code> se ejecuta una sola vez al encender o reiniciar la placa.' },
      { line: 5, text: '<code>pinMode(PIN_LED, OUTPUT)</code> configura D8 como salida: el microcontrolador podrá ponerlo a 5 V o a 0 V.' },
      { line: 8, text: '<code>loop()</code> se repite sin fin después de <code>setup()</code>.' },
      { line: 9, text: '<code>digitalWrite(PIN_LED, HIGH)</code> pone D8 a 5 V. Circulan unos 13,6 mA por la resistencia y el LED.' },
      { line: 10, text: '<code>delay(500)</code> detiene el programa 500 milisegundos (medio segundo).' },
      { line: 11, text: '<code>digitalWrite(PIN_LED, LOW)</code> pone D8 a 0 V: no hay diferencia de tensión, no circula corriente.' },
      { line: 12, text: 'Otra espera de 500 ms. Un ciclo completo dura 1 s: el LED parpadea una vez por segundo.' }
    ],
    expected: 'El LED rojo se enciende medio segundo y se apaga medio segundo, de forma continua. El LED integrado "L" (D13) no participa en esta práctica.',
    mistakes: [
      { symptom: 'El LED no enciende nunca', cause: 'LED invertido, o ánodo y resistencia en tiras distintas.', fix: 'Desconecta el USB. Comprueba que la pata larga comparte tira con la resistencia y que el cátodo llega al carril −.' },
      { symptom: 'El LED queda encendido fijo', cause: 'Resistencia conectada a 5V en lugar de a D8, o el programa no se cargó.', fix: 'Sigue el cable desde a5 hasta la placa: debe llegar a D8. Revisa que el IDE dijo "Carga completada".' },
      { symptom: 'Error al cargar el programa', cause: 'Placa o puerto incorrectos en el IDE, o algo conectado a D0/D1.', fix: 'Herramientas → Placa: Arduino Uno; Herramientas → Puerto: el que aparece al conectar la placa.' },
      { symptom: 'Brillo muy débil', cause: 'Resistencia de valor mucho mayor (p. ej. 22 kΩ: rojo, rojo, naranja).', fix: 'Verifica las bandas o mide la resistencia fuera del circuito.' }
    ],
    questions: [
      { id: 'a1-q1', type: 'numeric', kind: 'ohm', prompt: 'Si cambias el LED rojo por uno azul (Vf ≈ 3,0 V) y mantienes 220 Ω, ¿qué corriente circula, en mA?', unit: 'mA', answer: (5 - 3) / 220 * 1000, tolerance: 0.03,
        solution: 'I = (5 − 3,0) ÷ 220 ≈ 9,1 mA. Brilla, pero algo menos.',
        mistakes: [{ value: (5 - 2) / 220 * 1000, feedback: 'Usaste la Vf del LED rojo. El azul necesita unos 3,0 V.' }, { value: 5 / 220 * 1000, feedback: 'Olvidaste restar la tensión directa del LED.' }],
        hint: 'I = (Vpin − Vf) ÷ R.' },
      { id: 'a1-q2', type: 'mc', kind: 'challenge', prompt: '¿Qué cambias en el código para que el LED parpadee el doble de rápido?',
        options: [
          { id: 'a', text: 'Los dos delay(500) por delay(250)', feedback: 'Cada fase dura la mitad: el ciclo pasa de 1 s a 0,5 s.' },
          { id: 'b', text: 'delay(1000) en ambos', feedback: 'Eso lo hace el doble de lento.' },
          { id: 'c', text: 'PIN_LED = 16', feedback: 'Cambiar el pin no altera la velocidad; además D16 no existe como pin digital rotulado en el Uno (A2 equivale a 16).' }
        ], answer: 'a' },
      { id: 'a1-q3', type: 'mc', prompt: '¿Por qué no se conecta el LED directamente entre D8 y GND, sin resistencia?',
        options: [
          { id: 'a', text: 'Porque la corriente solo la limitaría el LED y el pin, y superaría con facilidad los 20 mA recomendados', feedback: 'Sin resistencia, el LED y el pin trabajan fuera de sus límites y pueden dañarse.' },
          { id: 'b', text: 'Porque el LED no funciona con 5 V', feedback: 'Funciona, siempre que algo limite la corriente.' },
          { id: 'c', text: 'Porque el código no lo permite', feedback: 'El programa no sabe qué hay conectado: el límite es eléctrico.' }
        ], answer: 'a' }
    ],
    tinkercad: {
      url: 'https://www.tinkercad.com/circuits',
      status: 'Pasos para reproducirlo en Tinkercad Circuits con tu cuenta; la aplicación no abre ni ejecuta proyectos de Tinkercad. Enlace comprobado el 19/10/2026. Si tu Tinkercad está en inglés, el botón «Código» es «Code» e «Iniciar simulación» es «Start Simulation». Los menús pueden cambiar con las actualizaciones del sitio.',
      verified: true,
      steps: [
        'Entra a Tinkercad, inicia sesión y elige Circuitos → Crear nuevo circuito.',
        'En el panel de componentes (Básicos) arrastra un "Arduino Uno R3", una "Placa de pruebas pequeña", una "Resistencia" y un "LED".',
        'Selecciona la resistencia y en su inspector pon 220 Ω.',
        'Coloca la resistencia y el LED en la placa de pruebas como en la vista de montaje. El ánodo del LED en Tinkercad es la pata doblada.',
        'Haz clic en el pin 8 del Arduino y luego en el orificio de la tira de la resistencia para crear el cable; repite para GND.',
        'Pulsa «Código» (Code), cambia de «Bloques» (Blocks) a «Texto» (Text) y sustituye el contenido por el código de esta práctica.',
        'Pulsa «Iniciar simulación» (Start Simulation): el LED debe parpadear una vez por segundo. Pasa el ratón sobre el LED para ver avisos de corriente.'
      ]
    },
    checklist: [
      { id: 'usb', text: 'El USB está desconectado mientras reviso.' },
      { id: 'res', text: 'La resistencia es de 220 Ω (rojo, rojo, marrón, oro).' },
      { id: 'pol', text: 'El ánodo (pata larga) comparte tira con la resistencia; el cátodo va hacia GND.' },
      { id: 'short', text: 'Ningún cable une 5V con GND, y ningún componente tiene sus dos patas en la misma tira.' },
      { id: 'pins', text: 'El cable de señal llega a D8 (no a 5V) y el negro a un pin GND.' }
    ]
  };

  const list = [], byId = {};
  function add(p) {
    if (byId[p.id]) throw new Error('Práctica duplicada: ' + p.id);
    list.push(p); byId[p.id] = p;
  }
  /** Prácticas agrupadas por módulo, en orden de aparición. */
  function byModule(moduleId) { return list.filter((p) => p.module === moduleId); }
  CB.practices = { list, byId, add, byModule };
  add(A1);
})(typeof window !== 'undefined' ? window : globalThis);
