/* Fases 7 y 8 · Prácticas de Arduino (A2–A4) y proyectos integradores (P1–P7).
 * Placa: Arduino Uno R3. Los sketches se compilan para el ATmega328P en tests/compile_sketches.py
 * y los montajes se validan con el verificador de conexiones. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const code = (lines) => lines.join('\n');
  const A = CB.compose.addArduino;

  /* ---------- Piezas ---------- */
  const T2 = (a, b) => [{ id: a[0], label: a[1] }, { id: b[0], label: b[1] }];
  const R = (id, ohms, name) => ({ id, kind: 'resistor', ohms, name: name || ('Resistencia ' + (ohms >= 1000 ? ohms / 1000 + ' kΩ' : ohms + ' Ω')), terminals: T2(['1', 'pata 1'], ['2', 'pata 2']) });
  const LED = (id, color, name) => ({ id, kind: 'led', color, polarized: true, name, terminals: T2(['A', 'ánodo (+, pata larga)'], ['K', 'cátodo (−, pata corta)']) });
  const W = (id, color) => ({ id, kind: 'wire', color: color || 'black', optional: true, name: 'Cable ' + id, terminals: T2(['A', 'extremo A'], ['B', 'extremo B']) });
  const BTN = (id) => ({ id, kind: 'button', name: 'Pulsador', terminals: T2(['1', 'pata superior izquierda'], ['2', 'pata inferior derecha (diagonal)']) });
  const POT = (id) => ({ id, kind: 'pot', short: '10k', name: 'Potenciómetro 10 kΩ', terminals: [{ id: '1', label: 'extremo 1' }, { id: 'W', label: 'cursor' }, { id: '3', label: 'extremo 3' }] });
  const HCSR04 = (id) => ({ id, kind: 'module', short: 'HC-SR04', name: 'Sensor HC-SR04', terminals: [{ id: 'VCC', label: 'VCC' }, { id: 'TRIG', label: 'Trig' }, { id: 'ECHO', label: 'Echo' }, { id: 'GND', label: 'GND' }] });
  const fx = (label, hole, net) => ({ label, hole, net: net || label });

  const TK = (extra) => ({ url: 'https://www.tinkercad.com/circuits', status: 'Pasos para reproducirlo en Tinkercad Circuits con tu cuenta (la aplicación no abre proyectos de Tinkercad). Enlace pendiente de verificación desde el entorno de desarrollo.', steps: ['Crea un circuito nuevo y añade un "Arduino Uno R3" y una "Placa de pruebas pequeña".'].concat(extra).concat(['Pulsa "Código", cambia a "Texto", pega el sketch y pulsa "Iniciar simulación".']) });
  const USB_OFF = { id: 'usb', text: 'El USB está desconectado mientras reviso.' };
  const NO_SHORT = { id: 'short', text: 'Ningún cable une 5V con GND, y ningún componente tiene sus dos patas en la misma tira.' };
  const LED_OK = { id: 'led', text: 'Cada LED tiene el ánodo hacia su resistencia y su pin, y el cátodo hacia GND.' };
  const RUBRIC = (extra) => [
    { criterion: 'Montaje', good: 'Coincide con el esquema, cables ordenados y con colores coherentes; pasa la lista de verificación.', partial: 'Funciona, pero cuesta seguir el cableado o hubo que corregir errores tras energizar.' },
    { criterion: 'Código', good: 'Compila sin avisos, usa constantes con nombre y comentarios útiles.', partial: 'Funciona, pero con números sueltos o sin comentarios.' },
    { criterion: 'Pruebas', good: 'Ejecutaste todas las pruebas de la tabla y anotaste los resultados.', partial: 'Probaste solo el caso normal.' }
  ].concat(extra || []);

  /* ---------- Diagramas ---------- */
  A('a2-diagram', 'Pulsador en D2 y LED en D8', 'El pin D2 va a un pulsador cuyo otro extremo está en GND (con la pull-up interna activada). El pin D8 va a una resistencia de 220 Ω, al ánodo de un LED rojo y desde su cátodo a GND.', {
    rows: [{ type: 'chain', pin: 'D2', items: [{ sym: 'pushbutton', id: 's1', label: 'S1' }] }, { type: 'chain', pin: 'D8', items: [{ sym: 'resistor', id: 'r1', label: '220 Ω' }, { sym: 'led', id: 'led1', label: 'LED rojo' }] }]
  });
  A('a3-diagram', 'Potenciómetro hacia A0', 'Un extremo del potenciómetro de 10 kΩ a 5V, el cursor a A0 y el otro extremo a GND.', {
    rows: [{ type: 'module', name: 'Potenciómetro 10 kΩ', id: 'pot', w: 150, pins: [{ from: '5V', pin: 'extremo 1' }, { from: 'A0', pin: 'cursor' }, { from: 'GND', pin: 'extremo 3' }] }]
  });
  A('a4-diagram', 'LED en el pin PWM D9', 'El pin D9 (PWM) va a una resistencia de 220 Ω, al ánodo de un LED rojo y desde su cátodo a GND.', {
    rows: [{ type: 'chain', pin: '~D9', items: [{ sym: 'resistor', id: 'r1', label: '220 Ω' }, { sym: 'led', id: 'led1', label: 'LED rojo' }] }]
  });
  A('p1-diagram', 'Semáforo con tres LED', 'Tres cadenas iguales: D2 con 220 Ω y LED rojo; D3 con 220 Ω y LED amarillo; D4 con 220 Ω y LED verde. Todos los cátodos a GND.', {
    rows: [
      { type: 'chain', pin: 'D2', items: [{ sym: 'resistor', id: 'r1', label: '220 Ω' }, { sym: 'led', id: 'led1', label: 'Rojo' }] },
      { type: 'chain', pin: 'D3', items: [{ sym: 'resistor', id: 'r2', label: '220 Ω' }, { sym: 'led', id: 'led2', label: 'Amarillo' }] },
      { type: 'chain', pin: 'D4', items: [{ sym: 'resistor', id: 'r3', label: '220 Ω' }, { sym: 'led', id: 'led3', label: 'Verde' }] }
    ]
  });
  A('p3-diagram', 'Luz automática con LDR', 'Divisor de tensión: +5V, LDR, nodo unido a A0, resistencia de 10 kΩ y GND. Aparte, D8 con 220 Ω y un LED a GND.', {
    rows: [{ type: 'divider', pin: 'A0', upper: { sym: 'ldr', id: 'ldr', label: 'LDR' }, lower: { sym: 'resistor', id: 'r10k', label: '10 kΩ' } }, { type: 'chain', pin: 'D8', items: [{ sym: 'resistor', id: 'r1', label: '220 Ω' }, { sym: 'led', id: 'led1', label: 'LED' }] }]
  });
  A('p5-diagram', 'Alarma con sensor ultrasónico y zumbador', 'HC-SR04: VCC a 5V, Trig a D9, Echo a D10 y GND a GND. Zumbador pasivo: D8, resistencia de 100 Ω, zumbador y GND.', {
    rows: [{ type: 'module', name: 'HC-SR04', id: 'hcsr04', pins: [{ from: '5V', pin: 'VCC' }, { from: 'D9', pin: 'Trig' }, { from: 'D10', pin: 'Echo' }, { from: 'GND', pin: 'GND' }] },
      { type: 'chain', pin: 'D8', items: [{ sym: 'resistor', id: 'r1', label: '100 Ω' }, { sym: 'buzzer', id: 'bz1', label: 'Zumbador pasivo' }] }]
  });
  A('p6-diagram', 'Servo controlado con un potenciómetro', 'Potenciómetro: extremos a 5V y GND, cursor a A0. Servo: señal a D9, + a una fuente externa de 5 V y − a GND común.', {
    rows: [{ type: 'module', name: 'Potenciómetro 10 kΩ', id: 'pot', w: 150, pins: [{ from: '5V', pin: 'extremo 1' }, { from: 'A0', pin: 'cursor' }, { from: 'GND', pin: 'extremo 3' }] },
      { type: 'module', name: 'Servo SG90', id: 'servo', w: 150, pins: [{ from: 'D9', pin: 'Señal' }, { from: { ext: 'Fuente 5 V +' }, pin: '+ (rojo)' }, { from: 'GND', pin: '− (marrón)' }] }]
  });

  /* ---------- Sketches ---------- */
  const DIST_FN = [
    'float medirDistanciaCm() {',
    '  digitalWrite(PIN_TRIG, LOW);',
    '  delayMicroseconds(2);',
    '  digitalWrite(PIN_TRIG, HIGH);              // pulso de disparo de 10 µs',
    '  delayMicroseconds(10);',
    '  digitalWrite(PIN_TRIG, LOW);',
    '  unsigned long duracion = pulseIn(PIN_ECHO, HIGH, TIEMPO_MAX_US);',
    '  if (duracion == 0) {',
    '    return -1.0;                             // sin eco: fuera de alcance',
    '  }',
    '  return duracion * 0.0343 / 2.0;            // sonido a ≈343 m/s, ida y vuelta',
    '}'
  ];

  const S = {
    a2: code([
      '// Práctica A2: el LED se enciende mientras el pulsador está presionado',
      'const int PIN_BOTON = 2;   // pulsador entre D2 y GND',
      'const int PIN_LED = 8;     // LED con resistencia de 220 Ω',
      '',
      'void setup() {',
      '  pinMode(PIN_BOTON, INPUT_PULLUP);  // resistencia interna: suelto = HIGH',
      '  pinMode(PIN_LED, OUTPUT);',
      '}',
      '',
      'void loop() {',
      '  int estado = digitalRead(PIN_BOTON);',
      '  if (estado == LOW) {                // presionado',
      '    digitalWrite(PIN_LED, HIGH);',
      '  } else {                            // suelto',
      '    digitalWrite(PIN_LED, LOW);',
      '  }',
      '}'
    ]),
    a3: code([
      '// Práctica A3: leer un potenciómetro y mostrarlo en el monitor serie',
      'const int PIN_POT = A0;',
      '',
      'void setup() {',
      '  Serial.begin(9600);                         // velocidad del monitor serie',
      '}',
      '',
      'void loop() {',
      '  int lectura = analogRead(PIN_POT);          // 0 a 1023',
      '  float voltios = lectura * (5.0 / 1023.0);   // convierte a tensión',
      '  Serial.print("Lectura: ");',
      '  Serial.print(lectura);',
      '  Serial.print("  Tension: ");',
      '  Serial.print(voltios, 2);                   // dos decimales',
      '  Serial.println(" V");',
      '  delay(200);',
      '}'
    ]),
    a4: code([
      '// Práctica A4: el LED se enciende y apaga suavemente con PWM',
      'const int PIN_LED = 9;          // D9 admite PWM (~)',
      'const int PAUSA_MS = 4;         // 256 pasos × 4 ms ≈ 1 s por rampa',
      '',
      'void setup() {',
      '  pinMode(PIN_LED, OUTPUT);',
      '}',
      '',
      'void loop() {',
      '  for (int brillo = 0; brillo <= 255; brillo++) {    // sube',
      '    analogWrite(PIN_LED, brillo);',
      '    delay(PAUSA_MS);',
      '  }',
      '  for (int brillo = 255; brillo >= 0; brillo--) {    // baja',
      '    analogWrite(PIN_LED, brillo);',
      '    delay(PAUSA_MS);',
      '  }',
      '}'
    ]),
    p1: code([
      '// Proyecto P1: semáforo programado',
      'const int PIN_ROJO = 2;',
      'const int PIN_AMARILLO = 3;',
      'const int PIN_VERDE = 4;',
      'const unsigned long T_VERDE_MS = 5000;',
      'const unsigned long T_AMARILLO_MS = 2000;',
      'const unsigned long T_ROJO_MS = 5000;',
      '',
      'void encenderSolo(int pin) {           // apaga todos menos el indicado',
      '  digitalWrite(PIN_ROJO, pin == PIN_ROJO ? HIGH : LOW);',
      '  digitalWrite(PIN_AMARILLO, pin == PIN_AMARILLO ? HIGH : LOW);',
      '  digitalWrite(PIN_VERDE, pin == PIN_VERDE ? HIGH : LOW);',
      '}',
      '',
      'void setup() {',
      '  pinMode(PIN_ROJO, OUTPUT);',
      '  pinMode(PIN_AMARILLO, OUTPUT);',
      '  pinMode(PIN_VERDE, OUTPUT);',
      '}',
      '',
      'void loop() {',
      '  encenderSolo(PIN_VERDE);',
      '  delay(T_VERDE_MS);',
      '  encenderSolo(PIN_AMARILLO);',
      '  delay(T_AMARILLO_MS);',
      '  encenderSolo(PIN_ROJO);',
      '  delay(T_ROJO_MS);',
      '}'
    ]),
    p2: code([
      '// Proyecto P2: cada pulsación alterna el LED (con antirrebote)',
      'const int PIN_BOTON = 2;',
      'const int PIN_LED = 8;',
      'const unsigned long ANTIRREBOTE_MS = 50;',
      '',
      'bool ledEncendido = false;',
      'int estadoAnterior = HIGH;            // última lectura aceptada (suelto)',
      'unsigned long ultimoCambio = 0;',
      '',
      'void setup() {',
      '  pinMode(PIN_BOTON, INPUT_PULLUP);',
      '  pinMode(PIN_LED, OUTPUT);',
      '}',
      '',
      'void loop() {',
      '  int lectura = digitalRead(PIN_BOTON);',
      '  if (lectura != estadoAnterior && millis() - ultimoCambio > ANTIRREBOTE_MS) {',
      '    ultimoCambio = millis();',
      '    estadoAnterior = lectura;',
      '    if (lectura == LOW) {             // se acaba de presionar',
      '      ledEncendido = !ledEncendido;',
      '      digitalWrite(PIN_LED, ledEncendido ? HIGH : LOW);',
      '    }',
      '  }',
      '}'
    ]),
    p3: code([
      '// Proyecto P3: luz que se enciende al oscurecer (con histéresis)',
      'const int PIN_LDR = A0;',
      'const int PIN_LED = 8;',
      'const int UMBRAL_ENCENDER = 300;   // por debajo: está oscuro',
      'const int UMBRAL_APAGAR = 400;     // por encima: vuelve a haber luz',
      'bool luzEncendida = false;',
      '',
      'void setup() {',
      '  pinMode(PIN_LED, OUTPUT);',
      '  Serial.begin(9600);',
      '}',
      '',
      'void loop() {',
      '  int luz = analogRead(PIN_LDR);    // LDR arriba del divisor: más luz = valor más alto',
      '  if (!luzEncendida && luz < UMBRAL_ENCENDER) {',
      '    luzEncendida = true;',
      '  } else if (luzEncendida && luz > UMBRAL_APAGAR) {',
      '    luzEncendida = false;',
      '  }',
      '  digitalWrite(PIN_LED, luzEncendida ? HIGH : LOW);',
      '  Serial.print("Luz: ");',
      '  Serial.print(luz);',
      '  Serial.println(luzEncendida ? "  LED encendido" : "  LED apagado");',
      '  delay(200);',
      '}'
    ]),
    p4: code([
      '// Proyecto P4: medidor de distancia con HC-SR04',
      'const int PIN_TRIG = 9;',
      'const int PIN_ECHO = 10;',
      'const unsigned long TIEMPO_MAX_US = 30000;   // ≈ 5 m ida y vuelta; evita bloquear',
      ''
    ].concat(DIST_FN).concat([
      '',
      'void setup() {',
      '  pinMode(PIN_TRIG, OUTPUT);',
      '  pinMode(PIN_ECHO, INPUT);',
      '  Serial.begin(9600);',
      '}',
      '',
      'void loop() {',
      '  float cm = medirDistanciaCm();',
      '  if (cm < 0) {',
      '    Serial.println("Fuera de alcance");',
      '  } else {',
      '    Serial.print("Distancia: ");',
      '    Serial.print(cm, 1);',
      '    Serial.println(" cm");',
      '  }',
      '  delay(100);',
      '}'
    ])),
    p5: code([
      '// Proyecto P5: alarma de proximidad',
      'const int PIN_TRIG = 9;',
      'const int PIN_ECHO = 10;',
      'const int PIN_ZUMBADOR = 8;                // zumbador pasivo con 100 Ω en serie',
      'const int PIN_LED_ALERTA = LED_BUILTIN;    // LED "L" de la placa (D13)',
      'const float DISTANCIA_ALARMA_CM = 20.0;',
      'const unsigned long TIEMPO_MAX_US = 30000;',
      ''
    ].concat(DIST_FN).concat([
      '',
      'void setup() {',
      '  pinMode(PIN_TRIG, OUTPUT);',
      '  pinMode(PIN_ECHO, INPUT);',
      '  pinMode(PIN_LED_ALERTA, OUTPUT);',
      '  Serial.begin(9600);',
      '}',
      '',
      'void loop() {',
      '  float cm = medirDistanciaCm();',
      '  bool intruso = cm > 0 && cm < DISTANCIA_ALARMA_CM;',
      '  if (intruso) {',
      '    tone(PIN_ZUMBADOR, 2000);              // 2 kHz mientras haya algo cerca',
      '    digitalWrite(PIN_LED_ALERTA, HIGH);',
      '  } else {',
      '    noTone(PIN_ZUMBADOR);',
      '    digitalWrite(PIN_LED_ALERTA, LOW);',
      '  }',
      '  Serial.println(cm, 1);',
      '  delay(60);                               // pausa mínima entre mediciones',
      '}'
    ])),
    p6: code([
      '// Proyecto P6: el potenciómetro controla el ángulo de un servo',
      '#include <Servo.h>',
      '',
      'const int PIN_POT = A0;',
      'const int PIN_SERVO = 9;',
      'Servo servo;',
      '',
      'void setup() {',
      '  servo.attach(PIN_SERVO);',
      '}',
      '',
      'void loop() {',
      '  int lectura = analogRead(PIN_POT);            // 0 a 1023',
      '  int angulo = map(lectura, 0, 1023, 0, 180);   // 0 a 180 grados',
      '  servo.write(angulo);',
      '  delay(15);                                    // da tiempo al servo',
      '}'
    ])
  };

  /* ---------- Prácticas ---------- */
  const list = [
    {
      id: 'a2-pulsador', code: 'A2', module: 'm7', title: 'Pulsador con INPUT_PULLUP', level: 'Inicial', minutes: 30,
      board: 'Arduino Uno R3', objective: 'Leer un pulsador con la resistencia pull-up interna y encender un LED mientras está presionado.',
      prerequisites: [{ lesson: 'm7-entradas', text: 'Entradas digitales y condicionales' }, { practice: 'a1-blink-externo', text: 'Práctica A1' }],
      materials: ['Arduino Uno R3 y cable USB', 'Protoboard', 'Pulsador de 4 patas', 'LED rojo', 'Resistencia de 220 Ω', '4 cables jumper'],
      diagram: 'a2-diagram',
      layout: { fixed: [fx('D8', 'a5'), fx('GND', 'tn1'), fx('D2', 'a20')], pieces: [R('R1', 220), LED('LED1', 'red', 'LED rojo'), BTN('S1'), W('J1'), W('J2')], check: 'netlist',
        nets: [['D8', 'R1.1'], ['R1.2', 'LED1.A'], ['LED1.K', 'GND', 'S1.2'], ['D2', 'S1.1']],
        placement: { 'R1.1': 'e5', 'R1.2': 'e9', 'LED1.A': 'c9', 'LED1.K': 'c11', 'J1.A': 'a11', 'J1.B': 'tn11', 'S1.1': 'e20', 'S1.2': 'f22', 'J2.A': 'j22', 'J2.B': 'tn22' } },
      connections: ['Monta el LED como en A1: D8 → a5; resistencia de e5 a e9; LED con ánodo en c9 y cátodo en c11; cable de a11 al carril −.', 'Pulsador sobre el canal central: pata en e20 y su diagonal en f22.', 'Cable de D2 a a20.', 'Cable de j22 al carril −.', 'Cable de GND del Arduino al carril −.'],
      calculations: ['LED: (5 − 2,0) ÷ 220 ≈ 13,6 mA.', 'Pull-up interna del ATmega328P: entre 20 y 50 kΩ. Al presionar circulan como mucho 5 V ÷ 20 kΩ = 0,25 mA.'],
      sketch: S.a2,
      codeExplain: [
        { find: 'INPUT_PULLUP', text: 'Activa la resistencia interna entre D2 y 5 V: sin presionar, D2 lee HIGH.' },
        { find: 'int estado = digitalRead', text: 'Lee el pulsador y guarda el resultado.' },
        { find: 'if (estado == LOW)', text: 'Presionado, el pulsador une D2 con GND: se lee LOW.' },
        { find: '} else {', text: 'Suelto: se apaga el LED.' }
      ],
      expected: 'El LED se enciende solo mientras mantienes presionado el pulsador.',
      mistakes: [
        { symptom: 'El LED está encendido siempre', cause: 'Patas del pulsador unidas internamente, o pulsador conectado a 5V en lugar de a GND.', fix: 'Usa patas diagonales; el otro extremo del pulsador va a GND.' },
        { symptom: 'El LED parpadea solo', cause: 'Se usó INPUT en lugar de INPUT_PULLUP: entrada flotando.', fix: 'Cambia a INPUT_PULLUP.' }
      ],
      questions: [
        { id: 'a2-q1', type: 'mc', prompt: 'Quieres que el LED esté encendido y se apague al presionar. ¿Qué cambias?',
          options: [
            { id: 'a', text: 'Intercambio HIGH y LOW en los dos digitalWrite()', feedback: 'Invierte la respuesta sin tocar el montaje.' },
            { id: 'b', text: 'Conecto el pulsador a 5V', feedback: 'Con INPUT_PULLUP el pin ya está a 5 V: así nunca verías un cambio.' }
          ], answer: 'a' },
        { id: 'a2-q2', type: 'tf', prompt: 'Verdadero o falso: con INPUT_PULLUP no hace falta ninguna resistencia externa para el pulsador.', answer: true,
          whyWrong: 'Sí: la resistencia está dentro del microcontrolador.', explain: 'La pull-up interna fija el nivel cuando el pulsador está suelto.' }
      ],
      tinkercad: TK(['Añade un pulsador sobre el canal, la resistencia de 220 Ω y el LED.', 'Cablea D2, D8 y GND según la lista de conexiones.']),
      checklist: [USB_OFF, NO_SHORT, LED_OK, { id: 'btn', text: 'El pulsador va de D2 a GND (no a 5V) y cruza el canal central.' }]
    },
    {
      id: 'a3-potenciometro-serie', code: 'A3', module: 'm7', title: 'Potenciómetro y monitor serie', level: 'Inicial', minutes: 25,
      board: 'Arduino Uno R3', objective: 'Leer la tensión de un potenciómetro con analogRead() y mostrarla en el monitor serie.',
      prerequisites: [{ lesson: 'm7-analogico', text: 'Entradas analógicas' }, { practice: 'e6-potenciometro', text: 'Práctica E6' }],
      materials: ['Arduino Uno R3 y cable USB', 'Protoboard', 'Potenciómetro de 10 kΩ', '3 cables jumper'],
      diagram: 'a3-diagram',
      layout: { fixed: [fx('5V', 'a10'), fx('A0', 'a12'), fx('GND', 'a14')], pieces: [POT('P1')], check: 'netlist',
        nets: [['5V', 'P1.1'], ['A0', 'P1.W'], ['GND', 'P1.3']],
        placement: { 'P1.1': 'e10', 'P1.W': 'e12', 'P1.3': 'e14' } },
      connections: ['Potenciómetro con sus patas en e10, e12 (cursor) y e14.', 'Cable de 5V del Arduino a a10.', 'Cable de A0 a a12.', 'Cable de GND a a14.'],
      calculations: ['Resolución: 5 V ÷ 1023 ≈ 4,9 mV por paso.', 'Corriente por el potenciómetro: 5 ÷ 10 000 = 0,5 mA.'],
      sketch: S.a3,
      codeExplain: [
        { find: 'Serial.begin(9600)', text: 'Abre la comunicación serie. El monitor serie debe estar a 9600 baudios.' },
        { find: 'analogRead(PIN_POT)', text: 'Convierte la tensión del cursor en un número de 0 a 1023.' },
        { find: 'lectura * (5.0 / 1023.0)', text: 'Pasa la lectura a voltios. Los decimales en 5.0 evitan una división entera.' },
        { find: 'Serial.print(voltios, 2)', text: 'Imprime la tensión con dos decimales.' }
      ],
      expected: 'En el monitor serie aparecen líneas como "Lectura: 512  Tension: 2.50 V" que cambian al girar el potenciómetro, entre 0 y 1023 (0,00 a 5,00 V).',
      mistakes: [
        { symptom: 'Siempre lee 0 o 1023', cause: 'El cursor no llega a A0, o un extremo no está conectado.', fix: 'Comprueba con el multímetro que el cursor cambia de tensión.' },
        { symptom: 'Símbolos extraños en el monitor', cause: 'Velocidad del monitor distinta de 9600.', fix: 'Ajusta 9600 baudios en el monitor serie.' },
        { symptom: 'Valores que bailan sin tocar nada', cause: 'A0 sin conectar (flotando).', fix: 'Revisa el cable de A0.' }
      ],
      questions: [
        { id: 'a3-q1', type: 'numeric', prompt: 'El monitor muestra "Lectura: 818". ¿Qué tensión hay en A0, en V?', unit: 'V', answer: 818 * 5 / 1023, tolerance: 0.01,
          solution: '818 × 5 ÷ 1023 ≈ 4,00 V.', mistakes: [{ value: 818 / 1023, feedback: 'Multiplica por 5 V.' }], hint: 'V = lectura × 5 ÷ 1023.' },
        { id: 'a3-q2', type: 'mc', kind: 'challenge', prompt: 'Reto: quieres mostrar un porcentaje (0–100 %). ¿Qué línea añades?',
          options: [
            { id: 'a', text: 'int porcentaje = map(lectura, 0, 1023, 0, 100);', feedback: 'map() cambia de escala de forma directa.' },
            { id: 'b', text: 'int porcentaje = lectura / 100;', feedback: 'Daría de 0 a 10, no de 0 a 100.' }
          ], answer: 'a' }
      ],
      tinkercad: TK(['Añade un potenciómetro y cablea sus extremos a 5V y GND y el cursor a A0.', 'Abre el "Monitor serie" debajo del editor.']),
      checklist: [USB_OFF, { id: 'ends', text: 'Solo los extremos del potenciómetro van a 5V y GND; el cursor va a A0.' }, NO_SHORT]
    },
    {
      id: 'a4-pwm-fade', code: 'A4', module: 'm7', title: 'Brillo gradual con PWM', level: 'Inicial', minutes: 25,
      board: 'Arduino Uno R3', objective: 'Variar el brillo de un LED de forma suave con analogWrite() en un pin PWM.',
      prerequisites: [{ lesson: 'm7-analogico', text: 'PWM con analogWrite()' }, { lesson: 'm7-programacion', text: 'Bucles for' }],
      materials: ['Arduino Uno R3 y cable USB', 'Protoboard', 'LED rojo', 'Resistencia de 220 Ω', '2 cables jumper'],
      diagram: 'a4-diagram',
      layout: { fixed: [fx('D9', 'a5'), fx('GND', 'tn1')], pieces: [R('R1', 220), LED('LED1', 'red', 'LED rojo'), W('J1')], check: 'netlist',
        nets: [['D9', 'R1.1'], ['R1.2', 'LED1.A'], ['LED1.K', 'GND']],
        placement: { 'R1.1': 'e5', 'R1.2': 'e9', 'LED1.A': 'c9', 'LED1.K': 'c11', 'J1.A': 'a11', 'J1.B': 'tn11' } },
      connections: ['Mismo montaje que A1, pero el cable de señal va a D9 (pin con ~).'],
      calculations: ['Corriente máxima (valor 255): (5 − 2,0) ÷ 220 ≈ 13,6 mA.', 'Con valor 64 (25 %), la corriente media es ≈ 3,4 mA.', 'Cada rampa: 256 pasos × 4 ms ≈ 1 s.'],
      sketch: S.a4,
      codeExplain: [
        { find: 'const int PIN_LED = 9', text: 'D9 tiene PWM. En D8 analogWrite() no variaría el brillo.' },
        { find: 'brillo <= 255; brillo++', text: 'Recorre de 0 a 255: el ciclo de trabajo sube del 0 % al 100 %.' },
        { find: 'brillo >= 0; brillo--', text: 'Recorre de 255 a 0 para bajar el brillo.' }
      ],
      expected: 'El LED aumenta su brillo durante un segundo y lo reduce durante otro, en un ciclo continuo.',
      mistakes: [
        { symptom: 'El LED solo se enciende y apaga de golpe', cause: 'El cable está en un pin sin PWM (por ejemplo D8).', fix: 'Usa 3, 5, 6, 9, 10 u 11.' },
        { symptom: 'El cambio de brillo parece concentrado al principio', cause: 'El ojo percibe el brillo de forma no lineal.', fix: 'Es normal; con una tabla de corrección gamma se suaviza.' }
      ],
      questions: [
        { id: 'a4-q1', type: 'numeric', prompt: 'Si cambias PAUSA_MS a 10, ¿cuántos segundos dura cada rampa? (256 pasos)', unit: 's', answer: 2.56, tolerance: 0.01,
          solution: '256 × 10 ms = 2 560 ms = 2,56 s.', mistakes: [{ value: 2560, feedback: 'Ese valor está en milisegundos.' }], hint: 'Pasos × pausa.' },
        { id: 'a4-q2', type: 'mc', prompt: '¿Qué hace realmente analogWrite(9, 128)?',
          options: [
            { id: 'a', text: 'Pone 2,5 V constantes en D9', feedback: 'El Uno no genera tensiones intermedias: conmuta entre 0 y 5 V.' },
            { id: 'b', text: 'Alterna D9 entre 0 y 5 V, la mitad del tiempo en cada nivel', feedback: 'Es PWM con un 50 % de ciclo de trabajo.' }
          ], answer: 'b' }
      ],
      tinkercad: TK(['Monta el LED con su resistencia hacia D9.']),
      checklist: [USB_OFF, NO_SHORT, LED_OK, { id: 'pwm', text: 'El cable de señal está en D9 (pin con ~).' }]
    },

    /* ------------------------------------------------------------ Proyectos M9 */
    {
      id: 'p1-semaforo', code: 'P1', module: 'm9', title: 'Semáforo programado', level: 'Inicial', minutes: 45,
      board: 'Arduino Uno R3', objective: 'Construir un semáforo con tres LED que repite la secuencia verde → amarillo → rojo con tiempos configurables.',
      prerequisites: [{ practice: 'a1-blink-externo', text: 'Práctica A1' }, { lesson: 'm7-programacion', text: 'Funciones' }],
      planning: ['Definir la secuencia y los tiempos (verde 5 s, amarillo 2 s, rojo 5 s).', 'Elegir pines: D2 rojo, D3 amarillo, D4 verde.', 'Calcular las resistencias de los LED.', 'Montar y probar cada LED por separado.', 'Programar la secuencia con una función encenderSolo().', 'Ejecutar las pruebas de la tabla.'],
      materials: ['Arduino Uno R3 y cable USB', 'Protoboard', 'LED rojo, amarillo y verde', '3 resistencias de 220 Ω', '4 cables jumper'],
      diagram: 'p1-diagram',
      layout: { fixed: [fx('D2', 'a2'), fx('D3', 'a10'), fx('D4', 'a18'), fx('GND', 'tn28')],
        pieces: [R('R1', 220, 'R1 (rojo)'), LED('LED1', 'red', 'LED rojo'), R('R2', 220, 'R2 (amarillo)'), LED('LED2', 'yellow', 'LED amarillo'), R('R3', 220, 'R3 (verde)'), LED('LED3', 'green', 'LED verde'), W('J1'), W('J2'), W('J3')], check: 'netlist',
        nets: [['D2', 'R1.1'], ['R1.2', 'LED1.A'], ['D3', 'R2.1'], ['R2.2', 'LED2.A'], ['D4', 'R3.1'], ['R3.2', 'LED3.A'], ['GND', 'LED1.K', 'LED2.K', 'LED3.K']],
        placement: { 'R1.1': 'e2', 'R1.2': 'e6', 'LED1.A': 'c6', 'LED1.K': 'c8', 'J1.A': 'a8', 'J1.B': 'tn8', 'R2.1': 'e10', 'R2.2': 'e14', 'LED2.A': 'c14', 'LED2.K': 'c16', 'J2.A': 'a16', 'J2.B': 'tn16', 'R3.1': 'e18', 'R3.2': 'e22', 'LED3.A': 'c22', 'LED3.K': 'c24', 'J3.A': 'a24', 'J3.B': 'tn24' } },
      connections: ['Rojo: D2 → a2; resistencia de e2 a e6; LED con ánodo en c6 y cátodo en c8; cable de a8 al carril −.', 'Amarillo: D3 → a10; resistencia de e10 a e14; LED de c14 a c16; cable de a16 al carril −.', 'Verde: D4 → a18; resistencia de e18 a e22; LED de c22 a c24; cable de a24 al carril −.', 'GND del Arduino al carril −.'],
      calculations: ['Cada LED: (5 − 2,0) ÷ 220 ≈ 13,6 mA (el verde puro, con Vf ≈ 3 V, unos 9 mA).', 'Nunca hay más de un LED encendido: corriente máxima total ≈ 14 mA.', 'Ciclo completo: 5 + 2 + 5 = 12 s.'],
      sketch: S.p1,
      codeExplain: [
        { find: 'const unsigned long T_VERDE_MS', text: 'Tiempos en milisegundos con nombre: cambiar la secuencia es editar tres constantes.' },
        { find: 'void encenderSolo(int pin)', text: 'Función propia: enciende solo el LED indicado y apaga los demás. Evita repetir tres digitalWrite() en cada fase.' },
        { find: 'pin == PIN_ROJO ? HIGH : LOW', text: 'Si el pin pedido es el rojo, HIGH; si no, LOW.' },
        { find: 'encenderSolo(PIN_VERDE);', text: 'loop() describe la secuencia: verde, amarillo y rojo con sus tiempos.' }
      ],
      expected: 'Verde 5 s, amarillo 2 s, rojo 5 s, y vuelve a empezar. Nunca hay dos LED encendidos a la vez.',
      tests: [
        { step: 'Carga el sketch y cronometra el verde.', expected: 'Unos 5 s.' },
        { step: 'Cronometra el amarillo.', expected: 'Unos 2 s.' },
        { step: 'Observa las transiciones.', expected: 'Nunca hay dos LED encendidos a la vez.' },
        { step: 'Cambia T_AMARILLO_MS a 1000 y vuelve a cargar.', expected: 'El amarillo dura 1 s.' }
      ],
      mistakes: [
        { symptom: 'Un color no enciende', cause: 'LED invertido o cable en otro pin.', fix: 'Carga un Blink en ese pin para probar ese LED solo.' },
        { symptom: 'Se encienden dos a la vez', cause: 'Error en encenderSolo() o dos cables en el mismo pin.', fix: 'Revisa que cada LED tenga su propio pin.' }
      ],
      questions: [
        { id: 'p1-q1', type: 'mc', kind: 'challenge', prompt: 'Reto: quieres que el amarillo parpadee 3 veces antes del rojo. ¿Qué estructura usarías?',
          options: [
            { id: 'a', text: 'Un bucle for que repita 3 veces encender, esperar, apagar y esperar', feedback: 'Un for evita escribir seis instrucciones repetidas.' },
            { id: 'b', text: 'Un delay más largo', feedback: 'Un delay más largo no produce parpadeos.' }
          ], answer: 'a' },
        { id: 'p1-q2', type: 'tf', prompt: 'Verdadero o falso: mientras el semáforo está en delay(T_VERDE_MS), el Arduino no puede leer un botón peatonal.', answer: true,
          whyWrong: 'Es cierto: delay() bloquea el programa.', explain: 'Para añadir un botón peatonal habría que reescribirlo con millis().' }
      ],
      evaluation: RUBRIC([{ criterion: 'Ampliación', good: 'Añade un botón peatonal o el parpadeo del amarillo.', partial: 'Solo la secuencia básica.' }]),
      tinkercad: TK(['Añade tres LED (rojo, amarillo, verde) con su resistencia de 220 Ω hacia D2, D3 y D4.']),
      checklist: [USB_OFF, NO_SHORT, LED_OK, { id: 'pins', text: 'Rojo en D2, amarillo en D3 y verde en D4.' }]
    },
    {
      id: 'p2-led-pulsador', code: 'P2', module: 'm9', title: 'Control de LED mediante pulsador', level: 'Intermedio', minutes: 45,
      board: 'Arduino Uno R3', objective: 'Hacer que cada pulsación encienda o apague el LED (interruptor de palanca por software), eliminando los rebotes.',
      prerequisites: [{ practice: 'a2-pulsador', text: 'Práctica A2' }, { lesson: 'm7-programacion', text: 'millis()' }],
      planning: ['Reutilizar el montaje de A2.', 'Detectar el flanco (el instante en que se presiona), no el estado.', 'Filtrar rebotes con un tiempo mínimo de 50 ms entre cambios.', 'Probar pulsaciones rápidas y largas.'],
      materials: ['El montaje de la práctica A2'],
      diagram: 'a2-diagram',
      layout: { fixed: [fx('D8', 'a5'), fx('GND', 'tn1'), fx('D2', 'a20')], pieces: [R('R1', 220), LED('LED1', 'red', 'LED rojo'), BTN('S1'), W('J1'), W('J2')], check: 'netlist',
        nets: [['D8', 'R1.1'], ['R1.2', 'LED1.A'], ['LED1.K', 'GND', 'S1.2'], ['D2', 'S1.1']],
        placement: { 'R1.1': 'e5', 'R1.2': 'e9', 'LED1.A': 'c9', 'LED1.K': 'c11', 'J1.A': 'a11', 'J1.B': 'tn11', 'S1.1': 'e20', 'S1.2': 'f22', 'J2.A': 'j22', 'J2.B': 'tn22' } },
      connections: ['El mismo montaje de A2: pulsador entre D2 y GND; LED con 220 Ω en D8.'],
      calculations: ['Un pulsador mecánico rebota durante unos milisegundos (típicamente menos de 10–20 ms): sin filtro, una pulsación puede contarse varias veces.', 'Ventana de antirrebote elegida: 50 ms (no se notan como retraso).'],
      sketch: S.p2,
      codeExplain: [
        { find: 'bool ledEncendido = false', text: 'Variable de estado: recuerda si el LED está encendido entre vueltas de loop().' },
        { find: 'int estadoAnterior = HIGH', text: 'Última lectura aceptada; empieza en HIGH (suelto, por la pull-up).' },
        { find: 'lectura != estadoAnterior && millis()', text: 'Solo acepta un cambio si la lectura cambió y pasaron más de 50 ms desde el último: así se ignoran los rebotes.' },
        { find: 'if (lectura == LOW) {             //', text: 'Actúa solo en el flanco de bajada (al presionar), no al soltar.' },
        { find: 'ledEncendido = !ledEncendido', text: 'Alterna el estado.' }
      ],
      expected: 'Cada pulsación cambia el LED de apagado a encendido o al revés. Mantener presionado no lo hace parpadear.',
      tests: [
        { step: 'Pulsa una vez y suelta.', expected: 'El LED cambia de estado una sola vez.' },
        { step: 'Mantén presionado 3 s.', expected: 'El LED no vuelve a cambiar hasta soltar y presionar de nuevo.' },
        { step: 'Pulsa 10 veces seguidas.', expected: 'Termina igual que empezó (número par de cambios).' },
        { step: 'Cambia ANTIRREBOTE_MS a 0 y repite.', expected: 'A veces una pulsación cuenta doble: así se ve el rebote.' }
      ],
      mistakes: [
        { symptom: 'A veces no cambia o cambia dos veces', cause: 'Rebotes mayores de 50 ms o pulsador defectuoso.', fix: 'Sube ANTIRREBOTE_MS a 80 o cambia el pulsador.' },
        { symptom: 'Parpadea mientras mantienes presionado', cause: 'Se compara el estado en lugar del cambio de estado.', fix: 'Revisa la condición lectura != estadoAnterior.' }
      ],
      questions: [
        { id: 'p2-q1', type: 'mc', prompt: '¿Por qué el código compara con estadoAnterior en lugar de mirar solo si está en LOW?',
          options: [
            { id: 'a', text: 'Para actuar una vez por pulsación (en el flanco) y no en cada vuelta de loop() mientras está presionado', feedback: 'loop() se repite miles de veces por segundo.' },
            { id: 'b', text: 'Para ahorrar memoria', feedback: 'No es por memoria, sino por detectar el cambio.' }
          ], answer: 'a' },
        { id: 'p2-q2', type: 'reflection', prompt: 'Explica con tus palabras qué es el rebote de un pulsador y cómo lo resuelve el código.',
          model: 'Al presionar, los contactos metálicos chocan y se separan varias veces en pocos milisegundos, y el Arduino lo lee como varias pulsaciones. El código solo acepta un cambio si pasaron más de 50 ms desde el anterior, así que ignora esos rebotes.' }
      ],
      evaluation: RUBRIC([{ criterion: 'Robustez', good: 'Ninguna pulsación se pierde ni se duplica en 20 intentos.', partial: 'Falla de vez en cuando.' }]),
      tinkercad: TK(['Reutiliza el circuito de A2 y pega este sketch.']),
      checklist: [USB_OFF, NO_SHORT, LED_OK, { id: 'btn', text: 'El pulsador va de D2 a GND y cruza el canal central.' }]
    },
    {
      id: 'p3-luz-automatica', code: 'P3', module: 'm9', title: 'Iluminación automática con LDR', level: 'Intermedio', minutes: 50,
      board: 'Arduino Uno R3', objective: 'Encender un LED automáticamente al oscurecer, sin parpadeos cerca del umbral.',
      prerequisites: [{ lesson: 'm8-sensores-analogicos', text: 'LDR en divisor de tensión' }, { practice: 'e7-sensor-ldr', text: 'Práctica E7' }],
      planning: ['Montar el divisor LDR + 10 kΩ hacia A0.', 'Medir con el monitor serie la lectura con luz y tapando la LDR.', 'Elegir dos umbrales (histéresis) entre esos valores.', 'Montar el LED en D8.', 'Programar y ajustar los umbrales.'],
      materials: ['Arduino Uno R3 y cable USB', 'Protoboard', 'Fotorresistencia (LDR)', 'Resistencia de 10 kΩ (marrón, negro, naranja)', 'Resistencia de 220 Ω', 'LED', '6 cables jumper'],
      diagram: 'p3-diagram',
      layout: { fixed: [fx('5V', 'a3'), fx('A0', 'a6'), fx('GND', 'tn1'), fx('D8', 'a16')],
        pieces: [{ id: 'L1', kind: 'ldr', name: 'LDR', terminals: T2(['1', 'pata 1'], ['2', 'pata 2']) }, R('R2', 10000, 'Resistencia 10 kΩ'), R('R1', 220), LED('LED1', 'red', 'LED'), W('J1'), W('J2')], check: 'netlist',
        nets: [['5V', 'L1.1'], ['A0', 'L1.2', 'R2.1'], ['R2.2', 'GND', 'LED1.K'], ['D8', 'R1.1'], ['R1.2', 'LED1.A']],
        placement: { 'L1.1': 'c3', 'L1.2': 'c6', 'R2.1': 'd6', 'R2.2': 'd10', 'J1.A': 'a10', 'J1.B': 'tn10', 'R1.1': 'e16', 'R1.2': 'e20', 'LED1.A': 'c20', 'LED1.K': 'c22', 'J2.A': 'a22', 'J2.B': 'tn22' } },
      connections: ['5V del Arduino a a3; LDR de c3 a c6.', 'A0 a a6 (la tira entre la LDR y la resistencia fija).', 'Resistencia de 10 kΩ de d6 a d10; cable de a10 al carril −.', 'D8 a a16; resistencia de 220 Ω de e16 a e20; LED con ánodo en c20 y cátodo en c22; cable de a22 al carril −.', 'GND del Arduino al carril −.'],
      calculations: ['Divisor: V(A0) = 5 × 10 kΩ ÷ (R_LDR + 10 kΩ).', 'Luz (LDR ≈ 2 kΩ): 4,2 V → lectura ≈ 852. Oscuro (LDR ≈ 50 kΩ): 0,83 V → lectura ≈ 170.', 'Umbrales de ejemplo: encender por debajo de 300 y apagar por encima de 400. Ajústalos con tus medidas.'],
      sketch: S.p3,
      codeExplain: [
        { find: 'UMBRAL_ENCENDER = 300', text: 'Dos umbrales distintos: la diferencia (histéresis) evita parpadeos.' },
        { find: 'analogRead(PIN_LDR)', text: 'Con la LDR arriba del divisor, más luz da una lectura más alta.' },
        { find: '!luzEncendida && luz < UMBRAL_ENCENDER', text: 'Solo se enciende si estaba apagada y la luz bajó del primer umbral.' },
        { find: 'luzEncendida && luz > UMBRAL_APAGAR', text: 'Solo se apaga si estaba encendida y la luz superó el segundo umbral.' },
        { find: 'Serial.print(luz)', text: 'Imprimir la lectura permite calibrar los umbrales con tu LDR y tu habitación.' }
      ],
      expected: 'Al tapar la LDR (o apagar la luz) el LED se enciende; con luz se apaga. Cerca del umbral no parpadea.',
      tests: [
        { step: 'Anota la lectura con luz normal.', expected: 'Un valor alto (por ejemplo, 600–900).' },
        { step: 'Tapa la LDR con la mano.', expected: 'La lectura baja de 300 y el LED se enciende.' },
        { step: 'Destápala poco a poco.', expected: 'El LED sigue encendido hasta pasar de 400.' },
        { step: 'Ilumina con una linterna.', expected: 'El LED se apaga.' }
      ],
      mistakes: [
        { symptom: 'El LED no reacciona', cause: 'Umbrales fuera del rango que da tu LDR.', fix: 'Mira las lecturas en el monitor serie y ajusta los umbrales.' },
        { symptom: 'Funciona al revés', cause: 'La LDR y la resistencia fija están intercambiadas en el divisor.', fix: 'LDR hacia 5V y resistencia de 10 kΩ hacia GND, o invierte las comparaciones.' },
        { symptom: 'La lectura no cambia', cause: 'A0 no está en la tira del nodo entre LDR y resistencia.', fix: 'El cable de A0 va a la tira 6.' }
      ],
      questions: [
        { id: 'p3-q1', type: 'numeric', prompt: 'Con la LDR en 30 kΩ, ¿qué lectura esperas en A0? (redondea al entero)', unit: '(0–1023)', answer: Math.round(5 * 10 / 40 / 5 * 1023), tolerance: 0.01,
          solution: 'V = 5 × 10 ÷ (30 + 10) = 1,25 V → 1,25 ÷ 5 × 1023 ≈ 256.', mistakes: [{ value: Math.round(5 * 30 / 40 / 5 * 1023), feedback: 'Calculaste la tensión en la LDR. A0 mide la tensión en la resistencia fija (hacia GND).' }], hint: 'Primero la tensión del divisor; después la lectura.' },
        { id: 'p3-q2', type: 'mc', prompt: 'Sin histéresis (un solo umbral de 350), ¿qué pasa al anochecer?',
          options: [
            { id: 'a', text: 'El LED puede parpadear mientras la lectura ronda 350', feedback: 'El ruido hace que cruce el umbral una y otra vez.' },
            { id: 'b', text: 'Nada, funciona igual', feedback: 'Con un solo umbral aparecen parpadeos.' }
          ], answer: 'a' }
      ],
      evaluation: RUBRIC([{ criterion: 'Calibración', good: 'Umbrales elegidos a partir de medidas anotadas.', partial: 'Usó los valores de ejemplo sin comprobarlos.' }]),
      tinkercad: TK(['Añade un "Fotorresistor" y una resistencia de 10 kΩ en divisor hacia A0, y el LED en D8.', 'Durante la simulación cambia la luz desde el control de la fotorresistencia.']),
      checklist: [USB_OFF, NO_SHORT, LED_OK, { id: 'div', text: 'La LDR va a 5V, la de 10 kΩ a GND y A0 al punto entre ambas.' }]
    },
    {
      id: 'p4-distancia', code: 'P4', module: 'm9', title: 'Medidor de distancia con sensor ultrasónico', level: 'Intermedio', minutes: 45,
      board: 'Arduino Uno R3', objective: 'Medir distancias con un HC-SR04 y mostrarlas en el monitor serie sin bloquear el programa.',
      prerequisites: [{ lesson: 'm8-distancia', text: 'Sensor ultrasónico' }],
      planning: ['Colocar el sensor en la protoboard con los pines en tiras distintas.', 'Cablear VCC, Trig, Echo y GND.', 'Programar la medición en una función con timeout.', 'Verificar con una regla a 10, 20 y 50 cm.'],
      materials: ['Arduino Uno R3 y cable USB', 'Protoboard', 'Sensor HC-SR04', '4 cables jumper', 'Regla o cinta métrica'],
      diagram: 'hcsr04-wiring',
      layout: { fixed: [fx('5V', 'a10'), fx('D9', 'a11'), fx('D10', 'a12'), fx('GND', 'a13')], pieces: [HCSR04('U1')], check: 'netlist',
        nets: [['5V', 'U1.VCC'], ['D9', 'U1.TRIG'], ['D10', 'U1.ECHO'], ['GND', 'U1.GND']],
        placement: { 'U1.VCC': 'e10', 'U1.TRIG': 'e11', 'U1.ECHO': 'e12', 'U1.GND': 'e13' } },
      connections: ['Inserta el HC-SR04 con sus pines en e10 (VCC), e11 (Trig), e12 (Echo) y e13 (GND), mirando hacia fuera de la placa.', '5V → a10, D9 → a11, D10 → a12, GND → a13.'],
      calculations: ['d (cm) = t (µs) × 0,0343 ÷ 2.', 'Timeout de 30 000 µs ≈ 5 m de ida y vuelta: más que el alcance de 4 m.', 'Ejemplo: 580 µs → 9,9 cm.'],
      sketch: S.p4,
      codeExplain: [
        { find: 'TIEMPO_MAX_US = 30000', text: 'Límite de espera del eco: así pulseIn() nunca bloquea más de 30 ms.' },
        { find: 'float medirDistanciaCm()', text: 'Función que devuelve la distancia o −1 si no hay eco: loop() queda simple.' },
        { find: 'digitalWrite(PIN_TRIG, HIGH)', text: 'Pulso de disparo de 10 µs.' },
        { find: 'pulseIn(PIN_ECHO, HIGH, TIEMPO_MAX_US)', text: 'Mide la duración del eco en microsegundos.' },
        { find: 'return duracion * 0.0343 / 2.0', text: 'Convierte el tiempo de ida y vuelta en centímetros.' },
        { find: 'if (cm < 0)', text: 'Trata el caso sin eco por separado.' }
      ],
      expected: 'El monitor serie muestra la distancia en centímetros unas 10 veces por segundo, con un error típico de alrededor de ±1 cm sobre superficies planas.',
      tests: [
        { step: 'Coloca una caja a 10 cm medidos con regla.', expected: 'Lecturas entre 9 y 11 cm.' },
        { step: 'A 50 cm.', expected: 'Entre 48 y 52 cm.' },
        { step: 'Apunta al techo lejano o al vacío.', expected: '"Fuera de alcance" sin que el programa se congele.' },
        { step: 'Apunta a una tela o espuma.', expected: 'Lecturas inestables: el material absorbe el sonido.' }
      ],
      mistakes: [
        { symptom: 'Siempre "Fuera de alcance"', cause: 'Trig y Echo intercambiados o sensor sin alimentación.', fix: 'Trig en D9, Echo en D10, VCC a 5V.' },
        { symptom: 'Lecturas de 0 cm o al azar', cause: 'GND sin conectar o mediciones demasiado seguidas.', fix: 'Revisa GND y deja al menos 60 ms entre mediciones.' }
      ],
      questions: [
        { id: 'p4-q1', type: 'numeric', prompt: 'El eco dura 2 915 µs. ¿A qué distancia está el objeto, en cm?', unit: 'cm', answer: 2915 * 0.0343 / 2, tolerance: 0.02,
          solution: '2 915 × 0,0343 ÷ 2 ≈ 50,0 cm.', mistakes: [{ value: 2915 * 0.0343, feedback: 'Divide entre 2: es ida y vuelta.' }], hint: 'd = t × 0,0343 ÷ 2.' },
        { id: 'p4-q2', type: 'mc', prompt: 'Si quitas el timeout de pulseIn() y no hay eco, ¿qué ocurre?',
          options: [
            { id: 'a', text: 'Espera hasta 1 s en cada medición y el programa se vuelve lento', feedback: 'El timeout por defecto es de 1 s.' },
            { id: 'b', text: 'Devuelve la distancia máxima', feedback: 'Devuelve 0 tras esperar el tiempo por defecto.' }
          ], answer: 'a' }
      ],
      evaluation: RUBRIC([{ criterion: 'Exactitud', good: 'Comparaste con una regla en tres distancias y anotaste el error.', partial: 'No contrastaste las lecturas.' }]),
      tinkercad: TK(['Añade un "Sensor de distancia ultrasónico" (HC-SR04, de 4 pines).', 'Durante la simulación haz clic en el sensor y mueve el objeto.']),
      checklist: [USB_OFF, NO_SHORT, { id: 'pins', text: 'VCC a 5V, Trig a D9, Echo a D10 y GND a GND, según los nombres impresos en mi sensor.' }]
    },
    {
      id: 'p5-alarma', code: 'P5', module: 'm9', title: 'Alarma con sensor y zumbador', level: 'Intermedio', minutes: 50,
      board: 'Arduino Uno R3', objective: 'Hacer sonar un zumbador y encender un LED cuando algo se acerca a menos de 20 cm.',
      prerequisites: [{ practice: 'p4-distancia', text: 'Proyecto P4' }, { lesson: 'm8-actuadores', text: 'Zumbadores con tone()' }],
      planning: ['Partir del montaje de P4.', 'Añadir el zumbador pasivo con su resistencia en D8.', 'Definir la distancia de disparo.', 'Programar la decisión con la función de P4.', 'Probar a varias distancias.'],
      materials: ['Montaje de P4', 'Zumbador pasivo', 'Resistencia de 100 Ω (marrón, negro, marrón)', '2 cables jumper'],
      diagram: 'p5-diagram',
      layout: { fixed: [fx('5V', 'a10'), fx('D9', 'a11'), fx('D10', 'a12'), fx('GND', 'a13'), fx('D8', 'a20')],
        pieces: [HCSR04('U1'), R('R1', 100), { id: 'BZ1', kind: 'buzzer', name: 'Zumbador pasivo', terminals: T2(['1', 'pata 1'], ['2', 'pata 2']) }, W('J1'), W('J2')], check: 'netlist',
        nets: [['5V', 'U1.VCC'], ['D9', 'U1.TRIG'], ['D10', 'U1.ECHO'], ['GND', 'U1.GND', 'BZ1.2'], ['D8', 'R1.1'], ['R1.2', 'BZ1.1']],
        placement: { 'U1.VCC': 'e10', 'U1.TRIG': 'e11', 'U1.ECHO': 'e12', 'U1.GND': 'e13', 'J2.A': 'b13', 'J2.B': 'tn13', 'R1.1': 'e20', 'R1.2': 'e24', 'BZ1.1': 'c24', 'BZ1.2': 'c27', 'J1.A': 'a27', 'J1.B': 'tn27' } },
      connections: ['HC-SR04 como en P4 (e10–e13, cables a10–a13).', 'Cable de b13 (tira de GND del sensor) al carril −.', 'D8 → a20; resistencia de 100 Ω de e20 a e24.', 'Zumbador de c24 a c27; cable de a27 al carril −.'],
      calculations: ['Corriente máxima por el pin con el piezo: 5 V ÷ 100 Ω = 50 mA solo en picos; la corriente media es mucho menor. La resistencia limita esos picos.', 'Distancia de alarma: 20 cm ↔ eco de 20 × 2 ÷ 0,0343 ≈ 1 166 µs.'],
      sketch: S.p5,
      codeExplain: [
        { find: 'PIN_LED_ALERTA = LED_BUILTIN', text: 'Usa el LED integrado "L" (D13): no hace falta montar otro LED.' },
        { find: 'bool intruso = cm > 0 && cm < DISTANCIA_ALARMA_CM', text: 'cm > 0 descarta el caso sin eco (−1). Solo hay alarma con un objeto real y cercano.' },
        { find: 'tone(PIN_ZUMBADOR, 2000)', text: 'Tono de 2 kHz. tone() usa el Timer2: desactiva el PWM en D3 y D11.' },
        { find: 'noTone(PIN_ZUMBADOR)', text: 'Silencia el zumbador cuando no hay nada cerca.' }
      ],
      expected: 'Al acercar la mano a menos de 20 cm suena el zumbador y se enciende el LED "L"; al alejarla, se apagan.',
      tests: [
        { step: 'Sin objetos delante.', expected: 'Silencio y LED "L" apagado.' },
        { step: 'Mano a 30 cm.', expected: 'Silencio.' },
        { step: 'Mano a 10 cm.', expected: 'Suena y se enciende el LED.' },
        { step: 'Apunta al vacío.', expected: 'Silencio: el valor −1 no dispara la alarma.' }
      ],
      mistakes: [
        { symptom: 'Suena siempre', cause: 'No se descarta el valor −1, o la condición está invertida.', fix: 'Comprueba cm > 0 && cm < 20.' },
        { symptom: 'Solo hace clic', cause: 'Es un zumbador activo usado con tone(), o falta la resistencia.', fix: 'Usa un zumbador pasivo.' }
      ],
      questions: [
        { id: 'p5-q1', type: 'mc', kind: 'challenge', prompt: 'Reto: quieres que pite más rápido cuanto más cerca esté el objeto. ¿Qué harías?',
          options: [
            { id: 'a', text: 'Calcular la pausa entre pitidos a partir de la distancia, por ejemplo con map()', feedback: 'Así el ritmo depende de la distancia, como un sensor de estacionamiento.' },
            { id: 'b', text: 'Subir la frecuencia de tone()', feedback: 'Eso hace el sonido más agudo, no más rápido.' }
          ], answer: 'a' },
        { id: 'p5-q2', type: 'tf', prompt: 'Verdadero o falso: mientras suena tone(), analogWrite() en D11 funciona normalmente.', answer: false,
          whyWrong: 'tone() ocupa el Timer2, que también genera el PWM de D3 y D11.', explain: 'Si necesitas PWM a la vez, usa D5, D6, D9 o D10 (salvo que uses la librería Servo).' }
      ],
      evaluation: RUBRIC([{ criterion: 'Lógica', good: 'La alarma no se dispara con lecturas inválidas.', partial: 'Hay falsas alarmas sin objeto delante.' }]),
      tinkercad: TK(['Reutiliza el circuito de P4 y añade un "Zumbador piezoeléctrico" con una resistencia de 100 Ω hacia D8.']),
      checklist: [USB_OFF, NO_SHORT, { id: 'pins', text: 'El sensor está cableado como en P4 y el zumbador va a D8 a través de 100 Ω.' }, { id: 'gnd', text: 'El GND del sensor y el del zumbador llegan al carril − y al GND del Arduino.' }]
    },
    {
      id: 'p6-servo', code: 'P6', module: 'm9', title: 'Control de un servomotor', level: 'Intermedio', minutes: 45,
      board: 'Arduino Uno R3', objective: 'Mover un servo a la posición indicada por un potenciómetro, con alimentación separada para el servo.',
      prerequisites: [{ practice: 'a3-potenciometro-serie', text: 'Práctica A3' }, { lesson: 'm8-actuadores', text: 'Servomotores' }],
      planning: ['Montar el potenciómetro hacia A0 (como en A3).', 'Preparar una fuente de 5 V para el servo y unir su negativo con GND del Arduino.', 'Conectar la señal del servo a D9.', 'Programar la conversión 0–1023 → 0–180°.', 'Probar los extremos y el centro.'],
      materials: ['Arduino Uno R3 y cable USB', 'Protoboard', 'Servo SG90', 'Potenciómetro de 10 kΩ', 'Fuente de 5 V para el servo (portapilas 4×AA con regulador o fuente de 5 V ≥1 A)', 'Condensador electrolítico de 470 µF / 10 V (opcional)', 'Cables jumper'],
      diagram: 'p6-diagram',
      layout: { fixed: [fx('5V', 'a4'), fx('A0', 'a6'), fx('GND', 'a8'), fx('Fuente −', 'b8', 'GND'), fx('D9', 'a20'), fx('Fuente +', 'a21', 'EXTV')],
        pieces: [POT('P1'), { id: 'S1', kind: 'module', short: 'SERVO', name: 'Servo SG90', terminals: [{ id: 'SIG', label: 'señal (naranja)' }, { id: 'V', label: '+ (rojo)' }, { id: 'G', label: '− (marrón)' }] }, W('J1')], check: 'netlist',
        nets: [['5V', 'P1.1'], ['A0', 'P1.W'], ['GND', 'P1.3', 'S1.G'], ['D9', 'S1.SIG'], ['EXTV', 'S1.V']],
        placement: { 'P1.1': 'e4', 'P1.W': 'e6', 'P1.3': 'e8', 'S1.SIG': 'e20', 'S1.V': 'e21', 'S1.G': 'e22', 'J1.A': 'a22', 'J1.B': 'c8' } },
      diagramNote: 'El conector del servo se une a la protoboard con tres cables macho-macho; en el montaje se dibuja como si sus pines estuvieran en e20–e22.',
      connections: ['Potenciómetro en e4, e6 (cursor) y e8; 5V → a4, A0 → a6, GND → a8.', 'Negativo de la fuente del servo a b8 (misma tira que GND del Arduino).', 'Servo: señal en e20, + en e21, − en e22.', 'D9 → a20; + de la fuente del servo → a21.', 'Cable de a22 a c8: une el − del servo con GND.'],
      calculations: ['El SG90 puede pedir varios cientos de mA al arrancar o bloquearse: más de lo que conviene sacar del pin 5V del Arduino alimentado por USB.', 'map(512, 0, 1023, 0, 180) = 90°.'],
      sketch: S.p6,
      libraries: 'Servo (incluida en el Arduino IDE).',
      codeExplain: [
        { find: '#include <Servo.h>', text: 'Librería que genera los pulsos de control (un pulso cada 20 ms).' },
        { find: 'servo.attach(PIN_SERVO)', text: 'Asocia el servo a D9. Usa el Timer1: el PWM de D9 y D10 deja de estar disponible para analogWrite().' },
        { find: 'map(lectura, 0, 1023, 0, 180)', text: 'Convierte la lectura del potenciómetro en un ángulo.' },
        { find: 'servo.write(angulo)', text: 'Ordena la posición.' }
      ],
      expected: 'El servo sigue al potenciómetro: a un extremo 0°, en el centro unos 90° y al otro extremo 180°. La placa no se reinicia cuando el servo se mueve.',
      tests: [
        { step: 'Gira el potenciómetro al mínimo.', expected: 'El servo va a un extremo (0°).' },
        { step: 'Al centro.', expected: 'Unos 90°.' },
        { step: 'Al máximo.', expected: '180°.' },
        { step: 'Gíralo rápido de un extremo a otro.', expected: 'El servo sigue el movimiento y el Arduino no se reinicia.' }
      ],
      mistakes: [
        { symptom: 'El servo tiembla o el Arduino se reinicia', cause: 'Alimentación insuficiente o falta GND común.', fix: 'Usa la fuente externa, une los negativos y añade el condensador.' },
        { symptom: 'El servo no se mueve', cause: 'Señal en otro pin o sin GND común.', fix: 'Señal en D9; − del servo unido a GND del Arduino.' },
        { symptom: 'Zumba en los extremos', cause: 'Algunos servos no llegan exactamente a 0° o 180°.', fix: 'Limita el rango, por ejemplo map(lectura, 0, 1023, 10, 170).' }
      ],
      questions: [
        { id: 'p6-q1', type: 'numeric', prompt: '¿Qué ángulo da map(256, 0, 1023, 0, 180)? (map usa aritmética entera)', unit: '°', answer: 45, tolerance: 0,
          solution: '256 × 180 ÷ 1023 = 45,04 → 45 (se descartan los decimales).', mistakes: [{ value: 46, feedback: 'map() trunca, no redondea hacia arriba.' }], hint: 'Regla de tres sin decimales.' },
        { id: 'p6-q2', type: 'mc', prompt: '¿Por qué el − de la fuente del servo se une al GND del Arduino?',
          options: [
            { id: 'a', text: 'Para que la señal de D9 tenga la misma referencia de 0 V que el servo', feedback: 'Sin tierra común el servo no interpreta bien la señal.' },
            { id: 'b', text: 'Para que el Arduino alimente al servo', feedback: 'La alimentación la da la fuente externa; GND solo comparte la referencia.' }
          ], answer: 'a' }
      ],
      evaluation: RUBRIC([{ criterion: 'Alimentación', good: 'Servo con fuente propia, GND común y sin reinicios.', partial: 'Funciona desde el pin 5V pero se reinicia con carga.' }]),
      tinkercad: TK(['Añade un "Microservomotor" y un potenciómetro.', 'En Tinkercad puedes alimentar el servo desde 5V para la prueba; en el montaje real usa fuente externa.']),
      safety: 'No alimentes el servo desde un pin digital. Une los negativos de todas las fuentes antes de conectar el USB.',
      checklist: [USB_OFF, NO_SHORT, { id: 'gnd', text: 'El negativo de la fuente del servo está unido al GND del Arduino.' }, { id: 'ext', text: 'El + del servo va a la fuente externa de 5 V, no a un pin del Arduino.' }, { id: 'pot', text: 'El cursor del potenciómetro va a A0 y los extremos a 5V y GND.' }]
    },
    {
      id: 'p7-proyecto-final', code: 'P7', module: 'm9', type: 'final', title: 'Proyecto final', level: 'Avanzado', minutes: 240,
      objective: 'Diseñar, construir, programar y documentar un proyecto propio eligiendo una de las tres opciones. Combina lo aprendido en los proyectos anteriores.',
      options: [
        { id: 'estacion', title: 'Estación de temperatura con pantalla y alarma', level: 'Avanzado',
          summary: 'Muestra la temperatura en una pantalla LCD y avisa con LED y zumbador al pasar un límite.',
          requirements: ['Leer el TMP36 cada segundo y mostrar la temperatura con un decimal en la LCD.', 'Mostrar la temperatura máxima registrada desde el encendido.', 'Encender un LED de alerta y hacer sonar un tono cuando se supere un límite configurable.', 'Usar histéresis de al menos 1 °C para la alerta.', 'Sin delay() de más de 100 ms en loop().'],
          materials: ['Arduino Uno R3', 'Sensor TMP36', 'Pantalla LCD 16×2 con adaptador I²C', 'LED y resistencia de 220 Ω', 'Zumbador pasivo y resistencia de 100 Ω', 'Protoboard y cables'],
          pins: [['TMP36 Vout', 'A0'], ['LCD SDA / SCL', 'A4 / A5'], ['LED de alerta', 'D8 (con 220 Ω)'], ['Zumbador pasivo', 'D9 (con 100 Ω)']],
          reuse: [['#/leccion/m8-sensores-analogicos', 'Lectura del TMP36'], ['#/leccion/m8-pantallas-reles', 'Pantalla LCD I²C'], ['#/proyectos/p5-alarma', 'P5: alarma con zumbador'], ['#/proyectos/p3-luz-automatica', 'P3: histéresis']],
          warnings: 'Respeta la orientación del TMP36: invertido se calienta en segundos.' },
        { id: 'estacionamiento', title: 'Asistente de estacionamiento', level: 'Avanzado',
          summary: 'Indica la distancia a un obstáculo con LED tipo semáforo y pitidos cada vez más rápidos.',
          requirements: ['Medir la distancia con el HC-SR04 al menos 10 veces por segundo.', 'Verde por encima de 50 cm, amarillo entre 20 y 50 cm, rojo por debajo de 20 cm.', 'Pitidos cuyo intervalo disminuya con la distancia; tono continuo por debajo de 10 cm.', 'Ignorar lecturas sin eco.', 'Usar millis() para los pitidos (sin delay largos).'],
          materials: ['Arduino Uno R3', 'Sensor HC-SR04', 'LED rojo, amarillo y verde con resistencias de 220 Ω', 'Zumbador pasivo y resistencia de 100 Ω', 'Protoboard y cables'],
          pins: [['HC-SR04 Trig / Echo', 'D9 / D10'], ['LED rojo / amarillo / verde', 'D2 / D3 / D4'], ['Zumbador pasivo', 'D8 (con 100 Ω)']],
          reuse: [['#/proyectos/p1-semaforo', 'P1: semáforo'], ['#/proyectos/p4-distancia', 'P4: medición de distancia'], ['#/proyectos/p5-alarma', 'P5: alarma'], ['#/leccion/m7-programacion', 'millis() sin bloquear']] },
        { id: 'lampara', title: 'Lámpara inteligente', level: 'Avanzado',
          summary: 'Ajusta el brillo de un LED según la luz ambiente, con modo manual seleccionable con un pulsador.',
          requirements: ['Modo automático: brillo PWM inversamente proporcional a la luz que mide la LDR.', 'Modo manual: brillo fijado por un potenciómetro.', 'Cambiar de modo con un pulsador, con antirrebote.', 'Indicar el modo con el LED "L" de la placa.', 'Mostrar lecturas y modo en el monitor serie.'],
          materials: ['Arduino Uno R3', 'LDR y resistencia de 10 kΩ', 'Potenciómetro de 10 kΩ', 'Pulsador', 'LED y resistencia de 220 Ω', 'Protoboard y cables'],
          pins: [['Divisor LDR', 'A0'], ['Cursor del potenciómetro', 'A1'], ['Pulsador (a GND, INPUT_PULLUP)', 'D2'], ['LED (PWM)', 'D6 (con 220 Ω)']],
          reuse: [['#/proyectos/p3-luz-automatica', 'P3: LDR'], ['#/proyectos/p2-led-pulsador', 'P2: pulsador con antirrebote'], ['#/proyectos/a4-pwm-fade', 'A4: PWM'], ['#/proyectos/a3-potenciometro-serie', 'A3: potenciómetro']] }
      ],
      milestones: ['Elige la opción y anota requisitos y pines en tu cuaderno.', 'Dibuja el esquema completo (papel o Tinkercad) y revísalo con la biblioteca de símbolos.', 'Simula en Tinkercad si los componentes están disponibles.', 'Monta y prueba cada bloque por separado (sensor, salida, pantalla).', 'Integra el código por partes, probando después de cada añadido.', 'Escribe una tabla de pruebas con resultado esperado y obtenido.', 'Documenta: esquema, foto del montaje, código comentado y problemas resueltos.'],
      evaluation: [
        { criterion: 'Requisitos', good: 'Cumple todos los requisitos de la opción elegida.', partial: 'Cumple la mayoría; alguno falta o funciona a medias.' },
        { criterion: 'Diseño del circuito', good: 'Esquema correcto, resistencias calculadas y ningún pin por encima de 20 mA.', partial: 'Funciona, pero sin cálculos o con algún valor sin justificar.' },
        { criterion: 'Código', good: 'Estructurado en funciones, constantes con nombre, sin delay() que bloquee las entradas.', partial: 'Funciona, pero todo dentro de loop() o con números sueltos.' },
        { criterion: 'Pruebas', good: 'Tabla de pruebas completa, incluidos casos límite.', partial: 'Solo se probó el caso normal.' },
        { criterion: 'Documentación', good: 'Otra persona podría reproducirlo con tu documentación.', partial: 'Faltan el esquema, las pruebas o las conexiones.' }
      ],
      questions: [
        { id: 'p7-q1', type: 'mc', prompt: 'Al integrar el proyecto, ¿qué estrategia reduce más los errores difíciles de encontrar?',
          options: [
            { id: 'a', text: 'Probar cada bloque por separado y añadir las partes de una en una', feedback: 'Si algo falla, sabes que está en lo último que añadiste.' },
            { id: 'b', text: 'Montar todo y escribir todo el código antes de probar', feedback: 'Cuando falla, el error puede estar en cualquier parte.' }
          ], answer: 'a' },
        { id: 'p7-q2', type: 'reflection', prompt: 'Describe el problema más difícil que encontraste en tu proyecto final y cómo lo resolviste.',
          model: 'Ejemplo: "La pantalla no mostraba nada. Con un I2C scanner vi que la dirección era 0x3F y no 0x27. También tuve que ajustar el contraste."' }
      ],
      safety: 'Baja tensión únicamente. Calcula cada resistencia, comparte GND entre todas las fuentes y no conectes cargas de red.',
      checklist: [USB_OFF, NO_SHORT, LED_OK, { id: 'calc', text: 'Tengo anotados los cálculos de corriente de cada LED y ningún pin supera 20 mA.' }, { id: 'gnd', text: 'Todas las fuentes y módulos comparten GND.' }]
    }
  ];

  list.forEach((p) => CB.practices.add(p));
  CB.practiceSketchIds = list.filter((p) => p.sketch).map((p) => p.id);
})(typeof window !== 'undefined' ? window : globalThis);
