/* Fase 8 · MÓDULO 8 — Sensores y actuadores con Arduino Uno R3. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  CB.lessons = CB.lessons || [];
  const code = (lines) => lines.join('\n');
  const A = CB.compose.addArduino;

  /* ---------- Diagramas ---------- */
  A('m8-tmp36', 'Conexión del sensor TMP36', 'TMP36 con la cara plana al frente: +Vs al pin 5V, Vout al pin A0 y GND al pin GND del Arduino.', {
    rows: [{ type: 'module', name: 'TMP36', id: 'tmp36', pins: [{ from: '5V', pin: '+Vs' }, { from: 'A0', pin: 'Vout' }, { from: 'GND', pin: 'GND' }] }]
  });
  A('m8-ldr-arduino', 'LDR en divisor de tensión hacia A0', 'Desde +5V, la fotorresistencia baja hasta un nodo unido a A0; desde ese nodo, una resistencia de 10 kΩ va a GND.', {
    rows: [{ type: 'divider', pin: 'A0', upper: { sym: 'ldr', id: 'ldr', label: 'LDR' }, lower: { sym: 'resistor', id: 'r10k', label: '10 kΩ' } }]
  });
  A('m8-servo', 'Servomotor con fuente externa', 'Señal del servo (naranja) al pin D9. El rojo (+) a una fuente externa de 5 V. El marrón (−) a GND, unido al GND del Arduino y al negativo de la fuente externa.', {
    rows: [{ type: 'module', name: 'Servo SG90', id: 'servo', pins: [{ from: 'D9', pin: 'Señal' }, { from: { ext: 'Fuente 5 V +' }, pin: '+ (rojo)' }, { from: 'GND', pin: '− (marrón)' }] }]
  });
  A('m8-lcd', 'Pantalla LCD 16×2 con adaptador I²C', 'Módulo I²C de la pantalla: GND a GND, VCC a 5V, SDA a A4 y SCL a A5 del Arduino Uno R3.', {
    rows: [{ type: 'module', name: 'LCD 16×2 I²C', id: 'lcd', w: 140, pins: [{ from: 'GND', pin: 'GND' }, { from: '5V', pin: 'VCC' }, { from: 'A4', pin: 'SDA' }, { from: 'A5', pin: 'SCL' }] }]
  });

  /* ---------- Código ---------- */
  const TMP = code([
    'const int PIN_TMP = A0;   // salida Vout del TMP36',
    '',
    'void setup() {',
    '  Serial.begin(9600);',
    '}',
    '',
    'void loop() {',
    '  int lectura = analogRead(PIN_TMP);',
    '  float voltios = lectura * 5.0 / 1023.0;',
    '  float celsius = (voltios - 0.5) * 100.0;   // 10 mV por grado, 0,5 V a 0 °C',
    '  Serial.print("Temperatura: ");',
    '  Serial.print(celsius, 1);',
    '  Serial.println(" C");',
    '  if (celsius > 30.0) {                       // decisión con el valor medido',
    '    Serial.println("Hace calor");',
    '  }',
    '  delay(1000);',
    '}'
  ]);
  const ULTRA = code([
    'const int PIN_TRIG = 9;',
    'const int PIN_ECHO = 10;',
    '',
    'void setup() {',
    '  pinMode(PIN_TRIG, OUTPUT);',
    '  pinMode(PIN_ECHO, INPUT);',
    '  Serial.begin(9600);',
    '}',
    '',
    'void loop() {',
    '  digitalWrite(PIN_TRIG, LOW);',
    '  delayMicroseconds(2);',
    '  digitalWrite(PIN_TRIG, HIGH);                        // pulso de disparo',
    '  delayMicroseconds(10);',
    '  digitalWrite(PIN_TRIG, LOW);',
    '  unsigned long us = pulseIn(PIN_ECHO, HIGH, 30000UL);  // 0 si no hay eco en 30 ms',
    '  if (us == 0) {',
    '    Serial.println("Sin eco");',
    '  } else {',
    '    Serial.print(us * 0.0343 / 2.0, 1);                // ida y vuelta: dividir entre 2',
    '    Serial.println(" cm");',
    '  }',
    '  delay(60);                                           // pausa mínima entre mediciones',
    '}'
  ]);
  const SERVO = code([
    '#include <Servo.h>        // librería incluida con el Arduino IDE',
    '',
    'const int PIN_SERVO = 9;',
    'Servo servo;',
    '',
    'void setup() {',
    '  servo.attach(PIN_SERVO);',
    '}',
    '',
    'void loop() {',
    '  for (int angulo = 0; angulo <= 180; angulo++) {',
    '    servo.write(angulo);   // posición en grados',
    '    delay(15);             // tiempo para que el servo llegue',
    '  }',
    '  for (int angulo = 180; angulo >= 0; angulo--) {',
    '    servo.write(angulo);',
    '    delay(15);',
    '  }',
    '}'
  ]);
  const TONE = code([
    'const int PIN_ZUMBADOR = 8;   // zumbador PASIVO (con 100 Ω en serie)',
    '',
    'void setup() {',
    '}',
    '',
    'void loop() {',
    '  tone(PIN_ZUMBADOR, 440);    // nota La (440 Hz)',
    '  delay(300);',
    '  tone(PIN_ZUMBADOR, 880);    // una octava más aguda',
    '  delay(300);',
    '  noTone(PIN_ZUMBADOR);       // silencio',
    '  delay(600);',
    '}'
  ]);
  const LCD = code([
    '#include <Wire.h>',
    '#include <LiquidCrystal_I2C.h>   // instalar desde el Gestor de librerías',
    '',
    'LiquidCrystal_I2C lcd(0x27, 16, 2);   // dirección I2C (0x27 o 0x3F), 16 columnas, 2 filas',
    '',
    'void setup() {',
    '  lcd.init();',
    '  lcd.backlight();',
    '  lcd.setCursor(0, 0);                // columna 0, fila 0',
    '  lcd.print("Hola, Arduino");',
    '}',
    '',
    'void loop() {',
    '  lcd.setCursor(0, 1);',
    '  lcd.print(millis() / 1000);',
    '  lcd.print(" s   ");                 // espacios para borrar restos',
    '  delay(500);',
    '}'
  ]);

  CB.lessonSketches = (CB.lessonSketches || []).concat([
    { id: 'm8-tmp', sketch: TMP }, { id: 'm8-ultra', sketch: ULTRA }, { id: 'm8-servo', sketch: SERVO },
    { id: 'm8-tone', sketch: TONE }, { id: 'm8-lcd', sketch: LCD }
  ]);

  CB.lessons.push(
    {
      id: 'm8-sensores-analogicos', module: 'm8', title: 'Pulsadores, potenciómetros, luz y temperatura', minutes: 30,
      objectives: ['Leer sensores resistivos con un divisor de tensión.', 'Convertir la salida del TMP36 en grados.', 'Tomar decisiones con umbrales e histéresis.'],
      slides: [
        { title: 'Lo que ya sabes leer',
          body: '<ul><li><strong>Pulsadores</strong>: entrada digital con <code>INPUT_PULLUP</code> (práctica A2).</li><li><strong>Potenciómetros</strong>: divisor de tensión hacia una entrada analógica (práctica A3).</li></ul><p>La mayoría de sensores sencillos se leen igual: son una resistencia que cambia (LDR, termistor) o un chip que entrega una tensión (TMP36).</p>' },
        { title: 'LDR en un divisor de tensión',
          body: '<p>El Arduino mide tensiones, no resistencias. Con una resistencia fija de 10 kΩ se forma un divisor:</p><div class="formula"><span>V(A0) = 5 V × 10 kΩ ÷ (R_LDR + 10 kΩ)</span></div><p>Con la LDR arriba (hacia 5 V): <strong>más luz → menos resistencia → más tensión en A0 → lectura más alta</strong>. Si la colocas abajo, la relación se invierte.</p>',
          media: { diagram: 'm8-ldr-arduino' }, activity: 'm8-a1' },
        { title: 'Temperatura con el TMP36',
          body: '<p>El TMP36 entrega 10 mV por °C con un desplazamiento de 0,5 V: T(°C) = (V − 0,5) × 100. Se alimenta entre 2,7 y 5,5 V.</p><p class="callout warn">Con la cara plana hacia ti y las patas abajo: +Vs, Vout, GND. Invertido se calienta en segundos.</p>',
          media: { diagram: 'm8-tmp36' },
          code: { sketch: TMP, file: 'tmp36.ino', explain: [
            { find: 'lectura * 5.0 / 1023.0', text: 'Convierte la lectura en voltios. Escribe 5.0 (con decimal) para que la división no sea entera.' },
            { find: '(voltios - 0.5) * 100.0', text: 'Fórmula del TMP36: resta el desplazamiento de 0,5 V y multiplica por 100 (1 °C = 10 mV).' },
            { find: 'if (celsius > 30.0)', text: 'Usar el valor medido para tomar una decisión.' }
          ] },
          activity: 'm8-a2' },
        { title: 'Decidir con umbrales e histéresis',
          body: '<p>Encender algo cuando un valor cruza un <strong>umbral</strong> provoca parpadeos si el valor ronda ese umbral (ruido, sombras, corrientes de aire).</p><p>La <strong>histéresis</strong> usa dos umbrales: se enciende por debajo de 300 y solo se apaga por encima de 400. Entre ambos se mantiene el estado anterior. El proyecto P3 la aplica.</p><p>Otro truco: promediar varias lecturas antes de decidir.</p>',
          activity: 'm8-a3' }
      ],
      activities: [
        { id: 'm8-a1', type: 'numeric', prompt: 'Con la LDR en 10 kΩ (luz media) y la resistencia fija de 10 kΩ, ¿qué tensión hay en A0, en voltios?', unit: 'V', answer: 2.5, tolerance: 0.01,
          solution: 'V = 5 × 10 ÷ (10 + 10) = 2,5 V → analogRead ≈ 512.', mistakes: [{ value: 5, feedback: 'Eso sería si la LDR tuviera 0 Ω.' }], hint: 'Las dos resistencias son iguales.' },
        { id: 'm8-a2', type: 'numeric', prompt: 'analogRead del TMP36 devuelve 153. ¿Qué temperatura indica, en °C? (redondea a una décima)', unit: '°C', answer: (153 * 5 / 1023 - 0.5) * 100, tolerance: 0.02,
          solution: 'V = 153 × 5 ÷ 1023 ≈ 0,748 V → T = (0,748 − 0,5) × 100 ≈ 24,8 °C.', mistakes: [{ value: 153 * 5 / 1023 * 100, feedback: 'Te faltó restar el desplazamiento de 0,5 V.' }], hint: 'Primero voltios; después la fórmula del TMP36.' },
        { id: 'm8-a3', type: 'mc', prompt: 'Una luz automática parpadea al anochecer, encendiéndose y apagándose. ¿Qué solución es la adecuada?',
          options: [
            { id: 'a', text: 'Usar dos umbrales (histéresis) o promediar lecturas', feedback: 'Evita que el ruido cerca del umbral haga cambiar el estado una y otra vez.' },
            { id: 'b', text: 'Cambiar la LDR por una de más resistencia', feedback: 'Cambia la escala, pero el valor seguirá rondando el umbral.' },
            { id: 'c', text: 'Añadir un delay(5000)', feedback: 'Lo hace más lento, pero no elimina los cambios cerca del umbral.' }
          ], answer: 'a' }
      ]
    },
    {
      id: 'm8-distancia', module: 'm8', title: 'Sensor de distancia ultrasónico', minutes: 25,
      objectives: ['Explicar cómo mide el HC-SR04.', 'Calcular la distancia a partir del tiempo del eco.', 'Evitar que el programa se bloquee sin eco.'],
      slides: [
        { title: 'Cómo funciona el HC-SR04',
          body: '<ol><li>El Arduino pone <strong>Trig</strong> en HIGH durante 10 µs.</li><li>El sensor emite una ráfaga de ultrasonido de 40 kHz.</li><li><strong>Echo</strong> se pone en HIGH hasta que vuelve el rebote.</li><li>La duración de ese pulso es el tiempo de ida y vuelta.</li></ol><div class="formula"><span>d (cm) = t (µs) × 0,0343 ÷ 2</span></div><p>0,0343 cm/µs es la velocidad del sonido a unos 20 °C. Se divide entre 2 porque el sonido va y vuelve.</p>',
          media: { diagram: 'hcsr04-wiring' }, activity: 'm8-b1' },
        { title: 'Medir sin bloquear',
          body: '<p><code>pulseIn(pin, HIGH, timeout)</code> devuelve la duración en µs, o <strong>0</strong> si no llega un pulso antes del timeout. Sin timeout puede esperar hasta 1 s.</p><ul><li>Alcance útil: unos 2 cm a 4 m. Superficies blandas o inclinadas devuelven mal el eco.</li><li>Deja al menos 60 ms entre mediciones para que no se mezclen ecos.</li><li>El HC-SR04 es de 5 V. En placas de 3,3 V, su pin Echo necesita un divisor o un adaptador de nivel lógico.</li></ul>',
          code: { sketch: ULTRA, file: 'ultrasonico.ino', explain: [
            { find: 'digitalWrite(PIN_TRIG, HIGH)', text: 'Inicio del pulso de disparo de 10 µs.' },
            { find: 'pulseIn(PIN_ECHO, HIGH, 30000UL)', text: 'Mide cuánto dura Echo en HIGH; con 30 000 µs de límite no espera más de 30 ms.' },
            { find: 'if (us == 0)', text: 'Sin eco (objeto fuera de alcance o superficie que absorbe el sonido).' },
            { find: 'us * 0.0343 / 2.0', text: 'Convierte el tiempo en centímetros.' }
          ] },
          activity: 'm8-b2' },
        { title: 'De la medida a la decisión',
          body: '<p>Con la distancia ya calculada, el resto es lógica:</p><ul><li><strong>Umbral</strong>: si la distancia es menor de 20 cm, activar una alarma (proyecto P5).</li><li><strong>Escala</strong>: convertir la distancia en una velocidad de pitido o en un número de LED encendidos (proyecto final, opción de estacionamiento).</li><li><strong>Valores inválidos</strong>: un 0 (sin eco) no significa "objeto pegado"; descártalo antes de decidir.</li></ul><p>Si conectas el sensor a una placa de 3,3 V, recuerda adaptar el nivel de su pin Echo.</p>',
          activity: 'm8-b3' }
      ],
      activities: [
        { id: 'm8-b1', type: 'numeric', prompt: 'El pulso de Echo dura 1 166 µs. ¿A qué distancia está el objeto, en cm?', unit: 'cm', answer: 1166 * 0.0343 / 2, tolerance: 0.02,
          solution: 'd = 1 166 × 0,0343 ÷ 2 ≈ 20,0 cm.', mistakes: [{ value: 1166 * 0.0343, feedback: 'Olvidaste dividir entre 2: el tiempo es de ida y vuelta.' }], hint: 'Divide entre 2.' },
        { id: 'm8-b2', type: 'mc', prompt: '¿Para qué sirve el tercer parámetro de pulseIn()?',
          options: [
            { id: 'a', text: 'Limita la espera: si no hay eco devuelve 0 en lugar de bloquear el programa', feedback: 'Así el resto del programa sigue respondiendo.' },
            { id: 'b', text: 'Indica la frecuencia del ultrasonido', feedback: 'La frecuencia (40 kHz) la fija el sensor.' }
          ], answer: 'a' },
        { id: 'm8-b3', type: 'tf', prompt: 'Verdadero o falso: el pin Echo de un HC-SR04 se puede conectar directamente a una placa de 3,3 V.', answer: false,
          whyWrong: 'Echo entrega 5 V: supera lo que admiten los pines de 3,3 V.',
          explain: 'En placas de 3,3 V usa un divisor de tensión o un adaptador de niveles lógicos. En el Uno R3 (5 V) se conecta directo.' }
      ]
    },
    {
      id: 'm8-actuadores', module: 'm8', title: 'Servomotores y zumbadores', minutes: 30,
      objectives: ['Controlar un servo con la librería Servo.', 'Alimentar un servo de forma segura.', 'Generar tonos con un zumbador pasivo.'],
      slides: [
        { title: 'El servomotor',
          body: '<p>Un servo de hobby (SG90) gira a un ángulo entre 0° y 180° según la duración de un pulso que se repite cada 20 ms (aprox. 1 ms = 0°, 2 ms = 180°). La librería <strong>Servo</strong>, incluida en el IDE, genera esos pulsos.</p><ul><li>Cables: naranja o amarillo (señal), rojo (+5 V), marrón o negro (GND).</li><li>Al arrancar o si se bloquea, un SG90 puede pedir varios cientos de mA.</li></ul>',
          media: { diagram: 'm8-servo' },
          code: { sketch: SERVO, file: 'servo.ino', explain: [
            { find: '#include <Servo.h>', text: 'Incluye la librería Servo (viene con el Arduino IDE).' },
            { find: 'servo.attach(PIN_SERVO)', text: 'Asocia el objeto al pin D9. En el Uno, la librería usa el Timer1: analogWrite() deja de funcionar en D9 y D10.' },
            { find: 'servo.write(angulo);   //', text: 'Ordena la posición en grados (0–180).' }
          ] },
          activity: 'm8-c1' },
        { title: 'Alimentar un servo con seguridad',
          body: '<ul><li>Para un SG90 en pruebas cortas y sin carga, muchos tutoriales usan el pin 5V. Si el servo hace fuerza, la caída de tensión puede <strong>reiniciar la placa</strong>.</li><li>Lo recomendable: <strong>fuente externa de 5 V</strong> para el rojo, y <strong>GND común</strong> entre la fuente, el servo y el Arduino.</li><li>Un condensador electrolítico de 100–470 µF entre + y − de la fuente del servo suaviza los picos.</li><li>Nunca alimentes motores desde un pin digital.</li></ul>',
          activity: 'm8-c2' },
        { title: 'Zumbadores con tone()',
          body: '<ul><li>Zumbador <strong>activo</strong>: suena con HIGH (un solo tono).</li><li>Zumbador <strong>pasivo</strong>: necesita <code>tone(pin, frecuencia)</code>; permite melodías. <code>noTone(pin)</code> lo silencia.</li><li>Pon una resistencia de unos 100 Ω en serie con un piezo pasivo para limitar los picos de corriente.</li><li><code>tone()</code> usa el Timer2 del Uno: mientras suena, analogWrite() no funciona en D3 ni D11.</li></ul>',
          code: { sketch: TONE, file: 'tonos.ino', explain: [
            { find: 'tone(PIN_ZUMBADOR, 440)', text: 'Genera una onda cuadrada de 440 Hz en D8.' },
            { find: 'noTone(PIN_ZUMBADOR)', text: 'Detiene el tono.' }
          ] },
          activity: 'm8-c3' }
      ],
      activities: [
        { id: 'm8-c1', type: 'mc', prompt: 'Tu programa usa la librería Servo en D9 y analogWrite() en D10 para un LED. El LED no cambia de brillo. ¿Por qué?',
          options: [
            { id: 'a', text: 'En el Uno, Servo usa el Timer1 y desactiva el PWM en D9 y D10', feedback: 'Mueve el LED a un pin PWM de otro temporizador (3, 5, 6 u 11).' },
            { id: 'b', text: 'D10 no tiene PWM', feedback: 'D10 sí tiene PWM, pero el Timer1 está ocupado por la librería Servo.' }
          ], answer: 'a' },
        { id: 'm8-c2', type: 'tf', prompt: 'Verdadero o falso: si el servo usa una fuente externa de 5 V, no hace falta unir su GND con el del Arduino.', answer: false,
          whyWrong: 'La señal del Arduino se mide respecto a GND: sin GND común el servo no la interpreta bien.',
          explain: 'Une los negativos de todas las fuentes y el GND del Arduino.' },
        { id: 'm8-c3', type: 'mc', kind: 'component', prompt: 'Quieres tocar una melodía. ¿Qué zumbador eliges?',
          options: [
            { id: 'a', text: 'Pasivo, con tone()', feedback: 'El pasivo reproduce la frecuencia que le envías.' },
            { id: 'b', text: 'Activo, con digitalWrite()', feedback: 'El activo tiene su propio oscilador: solo da su tono.' }
          ], answer: 'a' }
      ]
    },
    {
      id: 'm8-pantallas-reles', module: 'm8', title: 'Pantallas y control de cargas con relés', minutes: 30,
      objectives: ['Conectar una pantalla LCD por I²C.', 'Instalar y usar una librería.', 'Controlar cargas con relé, transistor y diodo sin exceder los límites del Arduino.'],
      slides: [
        { title: 'Pantalla LCD 16×2 con I²C',
          body: '<p>Una pantalla LCD de 16 columnas y 2 filas con un adaptador I²C (chip PCF8574) solo necesita cuatro cables: GND, VCC (5 V), SDA y SCL.</p><ul><li>En el <strong>Uno R3</strong>: SDA = <strong>A4</strong>, SCL = <strong>A5</strong> (también están repetidos junto a AREF).</li><li>La dirección I²C suele ser <code>0x27</code> o <code>0x3F</code>. Si no muestra nada, prueba la otra o usa un sketch "I2C scanner".</li><li>Si se enciende pero no ves letras, ajusta el <strong>potenciómetro de contraste</strong> del adaptador.</li></ul>',
          media: { diagram: 'm8-lcd' }, activity: 'm8-d1' },
        { title: 'Instalar y usar una librería',
          body: '<ol><li>En el IDE: <strong>Herramientas → Administrar librerías</strong>.</li><li>Busca "LiquidCrystal I2C" e instala una de las librerías con ese nombre (la de Frank de Brabander es habitual). Las funciones pueden variar un poco entre librerías: revisa su ejemplo.</li><li>Incluye la librería al principio del sketch con <code>#include</code>.</li></ol>',
          code: { sketch: LCD, file: 'lcd_i2c.ino', explain: [
            { find: '#include <Wire.h>', text: 'Wire es la librería de I²C incluida en el IDE.' },
            { find: 'LiquidCrystal_I2C lcd(0x27, 16, 2)', text: 'Crea la pantalla con su dirección I²C y su tamaño.' },
            { find: 'lcd.setCursor(0, 0)', text: 'Coloca el cursor: columna 0, fila 0 (la primera).' },
            { find: 'lcd.print(" s   ")', text: 'Los espacios borran los dígitos que sobren cuando el número se acorta.' }
          ] },
          activity: 'm8-d2' },
        { title: 'Relés y control de cargas',
          body: '<ul><li>Un pin del Arduino nunca alimenta directamente motores, relés, tiras LED ni lámparas: superan los 20 mA.</li><li><strong>Relé</strong>: se acciona con un transistor y lleva un diodo de rueda libre (o se usa un módulo que ya los trae). Algunos módulos se activan con LOW: compruébalo.</li><li><strong>Motores de CC</strong>: transistor o controlador (puente H) con diodo y fuente propia.</li><li>Todas las fuentes comparten GND con el Arduino.</li></ul><p class="callout danger">En este curso no se conectan cargas de tensión de red (127 V/230 V) a los contactos de un relé. Requiere formación, aislamiento y protecciones específicas.</p>',
          media: { diagram: 'relay-driver' }, activity: ['m8-d3', 'm8-d4'] }
      ],
      activities: [
        { id: 'm8-d1', type: 'mc', prompt: 'En un Arduino Uno R3, ¿a qué pines conectas SDA y SCL del adaptador I²C?',
          options: [
            { id: 'a', text: 'SDA a A4 y SCL a A5', feedback: 'En el Uno R3 el bus I²C está en A4 (SDA) y A5 (SCL).' },
            { id: 'b', text: 'SDA a D2 y SCL a D3', feedback: 'Eso no corresponde al Uno (en otras placas el I²C está en otros pines).' },
            { id: 'c', text: 'A cualquier pin digital', feedback: 'El I²C por hardware usa pines fijos.' }
          ], answer: 'a' },
        { id: 'm8-d2', type: 'mc', kind: 'error', prompt: 'La pantalla se ilumina pero no muestra texto, y el código compila. ¿Qué compruebas primero?',
          options: [
            { id: 'a', text: 'El contraste (potenciómetro del adaptador) y la dirección I²C (0x27 o 0x3F)', feedback: 'Son las dos causas más comunes.' },
            { id: 'b', text: 'Que la pantalla esté conectada a un pin PWM', feedback: 'La pantalla I²C no usa PWM.' }
          ], answer: 'a' },
        { id: 'm8-d3', type: 'hotspot', kind: 'diagram', prompt: 'Haz clic en el componente que permite que un pin de 20 mA controle la bobina del relé.',
          media: { diagram: 'relay-driver' }, answer: ['q1'],
          feedback: {
            q1: 'El transistor conmuta la corriente de la bobina; el pin solo aporta la pequeña corriente de base.',
            rb: 'Rb limita la corriente de base; el que conmuta es el transistor.',
            d1: 'El diodo protege del pico de tensión; no controla la bobina.',
            coil: 'La bobina es la carga que queremos controlar.',
            d7: 'El pin da la orden, pero no puede dar la corriente de la bobina.',
            board: 'La placa no puede alimentar la bobina directamente desde un pin.'
          } },
        { id: 'm8-d4', type: 'reflection', prompt: 'Quieres encender un ventilador de 12 V con Arduino. Describe qué componentes necesitas y por qué.',
          model: 'Una fuente de 12 V para el ventilador, un transistor (o MOSFET) para conmutarlo desde un pin con su resistencia de base o de puerta, un diodo de rueda libre en paralelo con el motor y GND común entre la fuente de 12 V y el Arduino. El pin nunca alimenta el ventilador directamente.' }
      ]
    }
  );
})(typeof window !== 'undefined' ? window : globalThis);
