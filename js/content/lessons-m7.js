/* Fase 7 · MÓDULO 7 — Arduino desde cero. Placa de referencia: Arduino Uno R3 (ATmega328P).
 * Cada ejemplo de código se compila en las pruebas (tests/compile_sketches.py). */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  CB.lessons = CB.lessons || [];
  const code = (lines) => lines.join('\n');

  const BLINK = code([
    '// Parpadeo del LED integrado "L" (D13)',
    'void setup() {',
    '  pinMode(LED_BUILTIN, OUTPUT);     // LED_BUILTIN vale 13 en el Uno',
    '}',
    '',
    'void loop() {',
    '  digitalWrite(LED_BUILTIN, HIGH);  // enciende',
    '  delay(1000);                      // espera 1 segundo',
    '  digitalWrite(LED_BUILTIN, LOW);   // apaga',
    '  delay(1000);',
    '}'
  ]);

  const TYPES = code([
    '// Tipos de datos habituales en el Uno',
    'const int PIN_LED = 8;          // int: entero de 16 bits (-32768 a 32767)',
    'unsigned long inicio = 0;       // para guardar millis(): no cabe en un int',
    'float temperatura = 21.5;       // número con decimales',
    'bool encendido = false;         // true o false',
    'char letra = \'A\';               // un carácter',
    '',
    'void setup() {',
    '  pinMode(PIN_LED, OUTPUT);',
    '  inicio = millis();            // milisegundos desde que arrancó la placa',
    '}',
    '',
    'void loop() {',
    '  encendido = !encendido;       // alterna entre true y false',
    '  digitalWrite(PIN_LED, encendido ? HIGH : LOW);',
    '  delay(500);',
    '}'
  ]);

  const BUTTON = code([
    'const int PIN_BOTON = 2;   // pulsador entre D2 y GND',
    'const int PIN_LED = 8;',
    '',
    'void setup() {',
    '  pinMode(PIN_BOTON, INPUT_PULLUP);  // resistencia interna a 5 V',
    '  pinMode(PIN_LED, OUTPUT);',
    '}',
    '',
    'void loop() {',
    '  if (digitalRead(PIN_BOTON) == LOW) {   // presionado: el pulsador une D2 con GND',
    '    digitalWrite(PIN_LED, HIGH);',
    '  } else {',
    '    digitalWrite(PIN_LED, LOW);',
    '  }',
    '}'
  ]);

  const POT_PWM = code([
    'const int PIN_POT = A0;   // cursor del potenciómetro',
    'const int PIN_LED = 9;    // D9 tiene PWM (~)',
    '',
    'void setup() {',
    '  pinMode(PIN_LED, OUTPUT);',
    '}',
    '',
    'void loop() {',
    '  int lectura = analogRead(PIN_POT);             // 0 a 1023',
    '  int brillo = map(lectura, 0, 1023, 0, 255);    // escala a 0 a 255',
    '  analogWrite(PIN_LED, brillo);                  // ciclo de trabajo PWM',
    '}'
  ]);

  const MILLIS = code([
    'const int PIN_LED = 8;',
    'const unsigned long INTERVALO_MS = 500;',
    'unsigned long ultimoCambio = 0;',
    'bool encendido = false;',
    '',
    'void alternarLed() {                      // función propia sin parámetros',
    '  encendido = !encendido;',
    '  digitalWrite(PIN_LED, encendido ? HIGH : LOW);',
    '}',
    '',
    'void setup() {',
    '  pinMode(PIN_LED, OUTPUT);',
    '  Serial.begin(9600);                     // misma velocidad que en el monitor serie',
    '  Serial.println("Inicio");',
    '}',
    '',
    'void loop() {',
    '  unsigned long ahora = millis();',
    '  if (ahora - ultimoCambio >= INTERVALO_MS) {   // ¿pasaron 500 ms?',
    '    ultimoCambio = ahora;',
    '    alternarLed();',
    '    Serial.print("LED: ");',
    '    Serial.println(encendido ? "encendido" : "apagado");',
    '  }',
    '  // aquí el programa puede hacer otras cosas sin esperar',
    '}'
  ]);

  const FOR = code([
    'const int PINES[] = {2, 3, 4};       // tres LED, cada uno con su resistencia',
    'const int CANTIDAD = 3;',
    '',
    'int sumar(int a, int b) {            // función con parámetros y valor de retorno',
    '  return a + b;',
    '}',
    '',
    'void setup() {',
    '  Serial.begin(9600);',
    '  for (int i = 0; i < CANTIDAD; i++) {   // i vale 0, 1 y 2',
    '    pinMode(PINES[i], OUTPUT);',
    '  }',
    '  Serial.println(sumar(2, 3));       // imprime 5',
    '}',
    '',
    'void loop() {',
    '  for (int i = 0; i < CANTIDAD; i++) {',
    '    digitalWrite(PINES[i], HIGH);',
    '    delay(200);',
    '    digitalWrite(PINES[i], LOW);',
    '  }',
    '}'
  ]);

  CB.lessonSketches = (CB.lessonSketches || []).concat([
    { id: 'm7-blink', sketch: BLINK }, { id: 'm7-types', sketch: TYPES }, { id: 'm7-button', sketch: BUTTON },
    { id: 'm7-pot-pwm', sketch: POT_PWM }, { id: 'm7-millis', sketch: MILLIS }, { id: 'm7-for', sketch: FOR }
  ]);

  CB.lessons.push(
    {
      id: 'm7-microcontrolador', module: 'm7', title: 'Microcontroladores y la placa Arduino Uno', minutes: 25,
      objectives: ['Explicar qué es un microcontrolador.', 'Reconocer las partes de la placa Arduino Uno R3.', 'Alimentar la placa de forma segura.', 'Cargar un programa con el Arduino IDE.'],
      slides: [
        { title: 'Qué es un microcontrolador',
          body: '<p>Un <strong>microcontrolador</strong> es un pequeño ordenador en un solo chip: procesador, memoria y periféricos (pines, temporizadores, conversor analógico-digital, comunicación serie).</p><p>El del Arduino Uno R3 es el <strong>ATmega328P</strong>:</p><ul><li>32 KB de memoria <strong>flash</strong>: guarda tu programa (y no se borra al apagar).</li><li>2 KB de <strong>SRAM</strong>: guarda las variables mientras funciona.</li><li>1 KB de <strong>EEPROM</strong>: datos que quieras conservar entre reinicios.</li><li>Reloj de 16 MHz.</li></ul>',
          activity: 'm7-a1' },
        { title: 'Qué es Arduino',
          body: '<p>Arduino es una plataforma abierta formada por:</p><ul><li><strong>Placas</strong> con el microcontrolador ya preparado (alimentación, USB, cristal, LED).</li><li>El <strong>Arduino IDE</strong> para escribir, compilar y cargar programas (llamados <em>sketches</em>).</li><li><strong>Librerías</strong> que simplifican el uso de sensores, pantallas y motores.</li></ul><p>Hay muchas placas: Uno R3, Uno R4, Nano, Mega, ESP32… Este curso usa el <strong>Uno R3</strong>. Otras placas tienen pines, tensiones (3,3 V) y límites de corriente distintos.</p>' },
        { title: 'Partes de la placa Uno R3',
          body: '<ul><li><strong>Conector USB-B</strong>: alimentación de 5 V y comunicación con el ordenador.</li><li><strong>Conector de alimentación</strong> (jack): 7–12 V recomendados; un regulador los baja a 5 V.</li><li><strong>Botón RESET</strong>: reinicia el programa.</li><li><strong>LED ON</strong> (alimentación), <strong>LED L</strong> (pin 13) y <strong>LED TX/RX</strong> (comunicación).</li><li><strong>Pines digitales</strong> D0–D13 (los marcados con ~ tienen PWM) y <strong>analógicos</strong> A0–A5.</li><li><strong>Pines de alimentación</strong>: 5V, 3.3V, Vin, GND, IOREF y RESET.</li></ul>',
          media: { component: 'arduino-uno' } },
        { title: 'Alimentación y tierra',
          body: '<ul><li>Por <strong>USB</strong> la placa recibe 5 V del ordenador: lo más sencillo para aprender.</li><li>Por el <strong>jack o Vin</strong>: 7–12 V de una fuente o una batería.</li><li>El pin <strong>5V</strong> entrega 5 V a tus circuitos. No metas por él tensión de una fuente sin regular: no pasa por el regulador ni por las protecciones.</li><li>El pin <strong>3.3V</strong> da poca corriente (unos 50 mA): no sirve para motores ni servos.</li><li>Todos los pines <strong>GND</strong> están unidos. Cualquier circuito conectado a la placa debe compartir su GND.</li></ul>',
          activity: 'm7-a2' },
        { title: 'El Arduino IDE',
          body: '<ol><li>Instala el Arduino IDE 2.x desde la web oficial de Arduino.</li><li>Conecta la placa por USB.</li><li><strong>Herramientas → Placa</strong>: elige "Arduino Uno".</li><li><strong>Herramientas → Puerto</strong>: elige el que aparece al conectar la placa (COM3, /dev/ttyACM0…).</li><li>Botón <strong>Verificar</strong> (✓): compila y muestra errores.</li><li>Botón <strong>Subir</strong> (→): compila y carga el programa en la placa.</li><li><strong>Monitor serie</strong>: muestra los mensajes que envía el programa.</li></ol>',
          code: { sketch: BLINK, file: 'blink.ino', explain: [
            { find: 'pinMode(LED_BUILTIN', text: '<code>pinMode()</code> configura el pin del LED integrado como salida. <code>LED_BUILTIN</code> es una constante que en el Uno vale 13.' },
            { find: 'digitalWrite(LED_BUILTIN, HIGH)', text: 'Pone el pin a 5 V: el LED "L" se enciende.' },
            { find: 'delay(1000);                      //', text: '<code>delay(1000)</code> detiene el programa 1 000 ms.' },
            { find: 'digitalWrite(LED_BUILTIN, LOW)', text: 'Pone el pin a 0 V: el LED se apaga.' }
          ] },
          activity: 'm7-a3' }
      ],
      activities: [
        { id: 'm7-a1', type: 'mc', prompt: '¿En qué memoria del ATmega328P queda guardado tu programa al cargarlo?',
          options: [
            { id: 'a', text: 'Flash', feedback: 'La flash conserva el programa aunque desconectes la placa.' },
            { id: 'b', text: 'SRAM', feedback: 'La SRAM guarda las variables mientras funciona y se borra al apagar.' },
            { id: 'c', text: 'EEPROM', feedback: 'La EEPROM es para datos que tú decidas guardar, no para el programa.' }
          ], answer: 'a' },
        { id: 'm7-a2', type: 'tf', prompt: 'Verdadero o falso: el pin 3.3V del Uno puede alimentar un servomotor.', answer: false,
          whyWrong: 'Da unos 50 mA; un servo puede pedir cientos de mA y trabaja a 5 V.',
          explain: 'Los servos se alimentan a 5 V, idealmente con una fuente externa y GND común.' },
        { id: 'm7-a3', type: 'order', prompt: 'Ordena los pasos para cargar tu primer programa.',
          steps: [
            { id: 'u1', text: 'Conecta la placa al ordenador por USB.', why: 'Sin conexión no aparece el puerto.' },
            { id: 'u2', text: 'Elige la placa "Arduino Uno" en Herramientas → Placa.', why: 'El IDE compila para la placa seleccionada.' },
            { id: 'u3', text: 'Elige el puerto de la placa en Herramientas → Puerto.', why: 'Indica a dónde enviar el programa.' },
            { id: 'u4', text: 'Pulsa Verificar (✓) y corrige los errores.', why: 'Compilar primero separa errores de código de errores de conexión.' },
            { id: 'u5', text: 'Pulsa Subir (→) y espera "Carga completada".', why: 'La carga es el último paso.' }
          ],
          explain: 'Si la carga falla después de verificar bien, el problema está en la placa, el cable o el puerto, no en el código.' }
      ]
    },
    {
      id: 'm7-estructura', module: 'm7', title: 'Estructura de un programa, variables y salidas', minutes: 30,
      objectives: ['Explicar setup() y loop().', 'Elegir el tipo de dato adecuado.', 'Usar pinMode(), digitalWrite() y delay().'],
      slides: [
        { title: 'setup() y loop()',
          body: '<p>Todo sketch tiene dos funciones obligatorias:</p><ul><li><code>setup()</code>: se ejecuta <strong>una vez</strong> al encender o reiniciar. Configura pines y comunicaciones.</li><li><code>loop()</code>: se repite <strong>sin fin</strong> mientras la placa tenga alimentación.</li></ul><p>Reglas de escritura: cada instrucción termina en <code>;</code>, los bloques van entre <code>{ }</code>, se distinguen mayúsculas de minúsculas (<code>pinMode</code> no es <code>pinmode</code>) y los comentarios empiezan con <code>//</code>.</p>',
          activity: 'm7-b1' },
        { title: 'Salidas digitales',
          body: '<ul><li><code>pinMode(pin, OUTPUT)</code>: el pin podrá imponer 5 V o 0 V.</li><li><code>digitalWrite(pin, HIGH)</code>: 5 V. <code>digitalWrite(pin, LOW)</code>: 0 V.</li><li>Un pin de salida da como mucho 20 mA recomendados (40 mA máximo absoluto). Para un LED, resistencia de 220 Ω o más.</li><li><code>delay(ms)</code>: espera sin hacer nada. Es sencillo, pero mientras espera el programa no lee botones ni sensores.</li></ul>' },
        { title: 'Variables y tipos de datos',
          body: '<p>Una variable es un nombre para un dato. En el Uno:</p><table class="units"><thead><tr><th>Tipo</th><th>Rango</th><th>Uso típico</th></tr></thead><tbody><tr><td>int</td><td>−32 768 a 32 767</td><td>Pines, lecturas, contadores</td></tr><tr><td>unsigned long</td><td>0 a 4 294 967 295</td><td>Tiempos con millis()</td></tr><tr><td>float</td><td>Decimales (unos 6–7 dígitos)</td><td>Tensiones, temperaturas</td></tr><tr><td>bool</td><td>true o false</td><td>Estados</td></tr><tr><td>char</td><td>Un carácter</td><td>Letras</td></tr></tbody></table><p><code>const</code> marca un valor que no cambia: úsalo para los números de pin.</p>',
          code: { sketch: TYPES, file: 'tipos.ino', explain: [
            { find: 'const int PIN_LED', text: 'Constante con nombre para el pin: si cambias de pin, solo editas esta línea.' },
            { find: 'unsigned long inicio', text: 'millis() supera 32 767 a los 33 s: por eso se guarda en unsigned long.' },
            { find: 'encendido = !encendido', text: '<code>!</code> niega un valor lógico: true pasa a false y al revés.' },
            { find: 'encendido ? HIGH : LOW', text: 'Operador ternario: si <code>encendido</code> es true usa HIGH; si no, LOW.' }
          ] },
          activity: ['m7-b2', 'm7-b3'] }
      ],
      activities: [
        { id: 'm7-b1', type: 'mc', kind: 'error', prompt: 'Al verificar aparece: "\'pinmode\' was not declared in this scope". ¿Qué está mal?',
          options: [
            { id: 'a', text: 'Debe escribirse pinMode, con M mayúscula', feedback: 'El lenguaje distingue mayúsculas: pinmode y pinMode son nombres distintos.' },
            { id: 'b', text: 'Falta conectar la placa', feedback: 'Verificar no necesita la placa: es un error de compilación.' },
            { id: 'c', text: 'El pin elegido no existe', feedback: 'El mensaje habla del nombre de la función, no del pin.' }
          ], answer: 'a' },
        { id: 'm7-b2', type: 'mc', prompt: 'Guardas millis() en una variable int. ¿Qué ocurre pasados unos 33 segundos?',
          options: [
            { id: 'a', text: 'Nada, int admite cualquier número', feedback: 'En el Uno, int solo llega a 32 767.' },
            { id: 'b', text: 'El valor se desborda y pasa a negativo: los cálculos de tiempo fallan', feedback: 'Por eso millis() se guarda en unsigned long.' },
            { id: 'c', text: 'La placa se reinicia', feedback: 'No se reinicia; simplemente el valor deja de ser correcto.' }
          ], answer: 'b' },
        { id: 'm7-b3', type: 'tf', prompt: 'Verdadero o falso: una variable declarada con const puede cambiar de valor dentro de loop().', answer: false,
          whyWrong: 'const impide cambiarla: el compilador da error si lo intentas.',
          explain: 'Usa const para valores fijos como los números de pin; protege de cambios accidentales.' }
      ]
    },
    {
      id: 'm7-entradas', module: 'm7', title: 'Entradas digitales y condicionales', minutes: 25,
      objectives: ['Leer un pulsador con digitalRead().', 'Explicar por qué una entrada no puede quedar flotando.', 'Escribir condicionales correctos.'],
      slides: [
        { title: 'Entradas digitales',
          body: '<ul><li><code>pinMode(pin, INPUT)</code>: el pin solo observa la tensión que le llega.</li><li><code>digitalRead(pin)</code> devuelve <code>HIGH</code> (cerca de 5 V) o <code>LOW</code> (cerca de 0 V).</li><li>Una entrada sin nada conectado queda <strong>flotando</strong>: puede leer HIGH o LOW al azar, incluso al acercar la mano.</li></ul>' },
        { title: 'Pull-up interna',
          body: '<p><code>INPUT_PULLUP</code> activa una resistencia interna (de unos 20–50 kΩ) entre el pin y 5 V:</p><ul><li>Pulsador <strong>suelto</strong>: el pin lee <code>HIGH</code>.</li><li>Pulsador <strong>presionado</strong> (une el pin con GND): lee <code>LOW</code>.</li></ul><p>Así no necesitas resistencia externa. La lógica queda "invertida": presionado = LOW.</p>',
          code: { sketch: BUTTON, file: 'pulsador.ino', explain: [
            { find: 'INPUT_PULLUP', text: 'Activa la pull-up interna: sin pulsar, D2 lee HIGH.' },
            { find: 'digitalRead(PIN_BOTON) == LOW', text: 'Compara con <code>==</code> (dos signos). Presionado, el pulsador une D2 con GND: LOW.' },
            { find: '} else {', text: '<code>else</code> se ejecuta cuando la condición no se cumple.' }
          ] },
          activity: 'm7-c1' },
        { title: 'Condicionales',
          body: '<ul><li><code>if (condición) { … }</code> ejecuta el bloque si la condición es verdadera.</li><li><code>else</code> ofrece la alternativa; <code>else if</code> encadena más casos.</li><li>Comparadores: <code>==</code> igual, <code>!=</code> distinto, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>.</li><li>Lógicos: <code>&amp;&amp;</code> (y), <code>||</code> (o), <code>!</code> (no).</li></ul><p class="callout warn">Error clásico: <code>if (estado = LOW)</code> <strong>asigna</strong> LOW en lugar de comparar. La condición nunca es verdadera.</p>',
          activity: ['m7-c2', 'm7-c3'] }
      ],
      activities: [
        { id: 'm7-c1', type: 'mc', prompt: 'Con pinMode(2, INPUT_PULLUP) y el pulsador entre D2 y GND, ¿qué lee digitalRead(2) al presionar?',
          options: [
            { id: 'a', text: 'HIGH', feedback: 'Sin presionar es HIGH; al presionar el pin queda unido a GND.' },
            { id: 'b', text: 'LOW', feedback: 'El pulsador une D2 con GND.' }
          ], answer: 'b' },
        { id: 'm7-c2', type: 'mc', kind: 'error', prompt: 'Al verificar este código aparece un error: if (digitalRead(2) = LOW) { … }. ¿Por qué?',
          options: [
            { id: 'a', text: 'Usa = (asignación) en lugar de == (comparación)', feedback: 'Con un solo = no se compara. Además no compila: no se puede asignar a una llamada de función.' },
            { id: 'b', text: 'digitalRead no funciona con el pin 2', feedback: 'D2 es un pin digital válido.' }
          ], answer: 'a', explain: 'En variables (estado = LOW) sí compila y falla en silencio: siempre usa ==.' },
        { id: 'm7-c3', type: 'tf', prompt: 'Verdadero o falso: un pin configurado como INPUT, sin nada conectado, siempre lee LOW.', answer: false,
          whyWrong: 'Queda flotando y la lectura es impredecible.',
          explain: 'Usa INPUT_PULLUP o una resistencia de pull-down externa (10 kΩ a GND).' }
      ]
    },
    {
      id: 'm7-analogico', module: 'm7', title: 'Entradas analógicas y PWM', minutes: 30,
      objectives: ['Convertir una lectura de analogRead() en voltios.', 'Usar map() para cambiar de escala.', 'Generar PWM con analogWrite() en los pines correctos.'],
      slides: [
        { title: 'analogRead()',
          body: '<p>Los pines A0–A5 tienen un conversor analógico-digital de <strong>10 bits</strong>: convierten 0–5 V en un número de 0 a 1023.</p><div class="formula"><span>V = lectura × 5,0 ÷ 1023</span></div><p>Cada paso equivale a unos 4,9 mV. Una lectura de 512 son unos 2,5 V.</p><p class="callout warn">Nunca apliques más de 5 V (ni tensión negativa) a un pin analógico del Uno.</p>',
          activity: 'm7-d1' },
        { title: 'map(): cambiar de escala',
          body: '<p><code>map(valor, deMin, deMax, aMin, aMax)</code> convierte un número de un rango a otro usando aritmética entera:</p><ul><li><code>map(512, 0, 1023, 0, 255)</code> → 127.</li><li><code>map(lectura, 0, 1023, 0, 180)</code> → ángulo para un servo.</li></ul><p>No limita el resultado: si el valor sale del rango de origen, el resultado sale del de destino. Usa <code>constrain()</code> si lo necesitas.</p>' },
        { title: 'PWM con analogWrite()',
          body: '<p>El Uno no tiene salidas analógicas reales. <code>analogWrite(pin, valor)</code> genera <strong>PWM</strong>: el pin alterna muy rápido entre 0 y 5 V y el valor (0–255) fija qué fracción del tiempo está a 5 V (ciclo de trabajo).</p><ul><li>Solo en los pines con <strong>~</strong>: 3, 5, 6, 9, 10 y 11.</li><li>Frecuencia de unos 490 Hz (980 Hz en 5 y 6).</li><li>Un LED parece brillar menos porque el ojo promedia los pulsos.</li></ul>',
          code: { sketch: POT_PWM, file: 'pot_pwm.ino', explain: [
            { find: 'analogRead(PIN_POT)', text: 'Lee la tensión del cursor: de 0 a 1023.' },
            { find: 'map(lectura', text: 'Convierte 0–1023 en 0–255, el rango de analogWrite().' },
            { find: 'analogWrite(PIN_LED, brillo)', text: 'PWM en D9: con 0 el LED está apagado, con 255 al máximo.' }
          ] },
          activity: ['m7-d2', 'm7-d3'] }
      ],
      activities: [
        { id: 'm7-d1', type: 'numeric', kind: 'ohm', prompt: 'analogRead(A0) devuelve 307. ¿Qué tensión hay en A0, en voltios?', unit: 'V', answer: 307 * 5 / 1023, tolerance: 0.01,
          solution: 'V = 307 × 5,0 ÷ 1023 ≈ 1,50 V.', mistakes: [{ value: 307 / 1023, feedback: 'Eso es la fracción del rango. Multiplica por 5 V.' }, { value: 307 * 5, feedback: 'Falta dividir entre 1023.' }], hint: 'V = lectura × 5 ÷ 1023.' },
        { id: 'm7-d2', type: 'numeric', prompt: '¿Qué valor pasas a analogWrite() para un ciclo de trabajo del 25 %? (redondea al entero más cercano)', unit: '(0–255)', answer: 64, tolerance: 0.02,
          solution: '0,25 × 255 = 63,75 → 64.', mistakes: [{ value: 25, feedback: 'analogWrite() no usa porcentajes: el rango es 0–255.' }, { value: 256, feedback: 'Multiplicaste por 1 024 en lugar de 255.' }], hint: 'El máximo es 255.' },
        { id: 'm7-d3', type: 'mc', prompt: '¿En cuál de estos pines del Uno R3 funciona analogWrite()?',
          options: [
            { id: 'a', text: 'D7', feedback: 'D7 no tiene PWM.' },
            { id: 'b', text: 'D10', feedback: 'D10 tiene PWM (~).' },
            { id: 'c', text: 'A0', feedback: 'A0 es una entrada analógica, no una salida PWM.' }
          ], answer: 'b' }
      ]
    },
    {
      id: 'm7-programacion', module: 'm7', title: 'Bucles, funciones, monitor serie y depuración', minutes: 35,
      objectives: ['Usar bucles for y funciones propias.', 'Enviar mensajes por el monitor serie.', 'Temporizar sin bloquear con millis().', 'Aplicar una rutina de depuración.'],
      slides: [
        { title: 'Bucles y funciones',
          body: '<ul><li><code>for (int i = 0; i &lt; 3; i++) { … }</code> repite el bloque con i = 0, 1 y 2.</li><li><code>while (condición) { … }</code> repite mientras la condición sea verdadera; cuidado con los bucles que nunca terminan.</li><li>Una <strong>función</strong> agrupa instrucciones con un nombre. Puede recibir parámetros y devolver un valor con <code>return</code>.</li></ul>',
          code: { sketch: FOR, file: 'bucles.ino', explain: [
            { find: 'const int PINES[]', text: 'Un arreglo guarda varios valores; se accede con PINES[0], PINES[1]…' },
            { find: 'int sumar(int a, int b)', text: 'Función que recibe dos enteros y devuelve otro (int antes del nombre).' },
            { find: 'for (int i = 0; i < CANTIDAD; i++) {   //', text: 'Recorre el arreglo para configurar los tres pines.' },
            { find: 'Serial.println(sumar(2, 3))', text: 'Llama a la función e imprime el resultado: 5.' }
          ] },
          activity: 'm7-e1' },
        { title: 'Monitor serie',
          body: '<ul><li><code>Serial.begin(9600)</code> en setup() abre la comunicación a 9600 baudios.</li><li><code>Serial.print()</code> envía texto o números; <code>Serial.println()</code> añade salto de línea.</li><li>En el IDE: Herramientas → Monitor serie, con la <strong>misma velocidad</strong> (9600). Si no coincide, verás caracteres extraños.</li><li>Mientras el monitor está abierto, D0 y D1 están ocupados por la comunicación.</li></ul>',
          activity: 'm7-e2' },
        { title: 'Temporizar sin bloquear: millis()',
          body: '<p><code>delay()</code> detiene todo. Con <code>millis()</code> (milisegundos desde el arranque) se comprueba si ya pasó el tiempo y, mientras tanto, el programa sigue leyendo sensores y botones.</p>',
          code: { sketch: MILLIS, file: 'millis.ino', explain: [
            { find: 'unsigned long ultimoCambio', text: 'Guarda cuándo fue el último cambio. unsigned long porque millis() crece mucho.' },
            { find: 'void alternarLed()', text: 'Función propia: cambia el estado y lo escribe en el pin.' },
            { find: 'ahora - ultimoCambio >= INTERVALO_MS', text: 'Esta resta funciona bien incluso cuando millis() se reinicia a 0 (a los ~49 días).' },
            { find: 'Serial.println(encendido', text: 'Envía el estado al monitor serie: así ves qué hace el programa.' }
          ] },
          activity: 'm7-e3' },
        { title: 'Depuración básica',
          body: '<ol><li><strong>Lee el error del compilador</strong>: indica la línea. Revisa la anterior (a menudo falta un <code>;</code>).</li><li><strong>Separa hardware de software</strong>: carga el ejemplo Blink; si funciona, la placa y la carga están bien.</li><li><strong>Imprime valores</strong> con Serial.println() en los puntos clave.</li><li><strong>Comprueba que pines del código y del montaje coinciden</strong>.</li><li><strong>Divide el problema</strong>: prueba cada parte (sensor, LED, lógica) por separado.</li></ol>',
          activity: 'm7-e4' }
      ],
      activities: [
        { id: 'm7-e1', type: 'numeric', prompt: '¿Cuántas veces se ejecuta el bloque de for (int i = 2; i <= 10; i += 2)?', unit: 'veces', answer: 5, tolerance: 0,
          solution: 'i toma los valores 2, 4, 6, 8 y 10: cinco veces.', mistakes: [{ value: 4, feedback: 'Con <= también se incluye el 10.' }, { value: 9, feedback: 'i aumenta de 2 en 2, no de 1 en 1.' }], hint: 'Escribe los valores que toma i.' },
        { id: 'm7-e2', type: 'mc', kind: 'error', prompt: 'El monitor serie muestra símbolos extraños en lugar de texto. ¿Causa más probable?',
          options: [
            { id: 'a', text: 'La velocidad del monitor no coincide con la de Serial.begin()', feedback: 'Ajusta el monitor a 9600 (o a la que usaste en el código).' },
            { id: 'b', text: 'La placa está dañada', feedback: 'Es poco probable: si la carga funciona, la comunicación también.' },
            { id: 'c', text: 'Falta un delay()', feedback: 'delay() no afecta a cómo se interpretan los caracteres.' }
          ], answer: 'a' },
        { id: 'm7-e3', type: 'tf', prompt: 'Verdadero o falso: con delay(5000) en loop(), un pulsador presionado durante esa espera se detecta igual.', answer: false,
          whyWrong: 'Durante delay() el programa no ejecuta nada más.',
          explain: 'Por eso los programas que deben reaccionar rápido usan millis().' },
        { id: 'm7-e4', type: 'order', prompt: 'Tu LED externo no parpadea. Ordena la rutina de depuración.',
          steps: [
            { id: 'v1', text: 'Comprueba que el IDE dijo "Carga completada".', why: 'Si no se cargó, el resto da igual.' },
            { id: 'v2', text: 'Carga el ejemplo Blink y mira el LED "L".', why: 'Confirma que la placa funciona y recibe programas.' },
            { id: 'v3', text: 'Compara el número de pin del código con el del cable.', why: 'Un pin distinto es la causa más común.' },
            { id: 'v4', text: 'Desconecta y revisa el montaje: polaridad del LED y resistencia.', why: 'Si el código y el pin coinciden, el fallo está en el circuito.' },
            { id: 'v5', text: 'Añade Serial.println() para ver si el programa llega a cada parte.', why: 'Para fallos de lógica, imprimir muestra qué ocurre de verdad.' }
          ],
          explain: 'De lo más general (¿se cargó?) a lo más particular (la lógica): cada paso descarta una causa.' }
      ]
    }
  );
})(typeof window !== 'undefined' ? window : globalThis);
