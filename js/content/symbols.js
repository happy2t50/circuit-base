/* Biblioteca de símbolos eléctricos.
 * Cada símbolo se dibuja en una caja de 120×60 con sus terminales principales en (0,30) y (120,30),
 * salvo que se indique otra cosa en `terminals`. Se usa currentColor para respetar el tema.
 * Notación: IEC 60617 (europea, rectángulo para resistencias) con la alternativa ANSI cuando es común. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});

  const L = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  const arrow = (x1, y1, x2, y2) => {
    const a = Math.atan2(y2 - y1, x2 - x1), s = 6;
    const p1 = [x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45)];
    const p2 = [x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45)];
    return L(x1, y1, x2, y2) + `<polygon class="fill" points="${x2},${y2} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}"/>`;
  };
  const T = (x, y, txt, cls) => `<text x="${x}" y="${y}" class="${cls || 'sym-label'}">${txt}</text>`;

  const draw = {
    resistor: () => L(0, 30, 35, 30) + '<rect x="35" y="21" width="50" height="18" class="nofill"/>' + L(85, 30, 120, 30),
    'resistor-us': () => L(0, 30, 33, 30) + '<polyline class="nofill" points="33,30 38,20 46,40 54,20 62,40 70,20 78,40 84,30 87,30"/>' + L(87, 30, 120, 30),
    diode: () => L(0, 30, 45, 30) + '<polygon class="fill" points="45,15 45,45 72,30"/>' + L(72, 14, 72, 46) + L(72, 30, 120, 30),
    led: () => draw.diode() + arrow(58, 12, 70, 0) + arrow(68, 16, 80, 4),
    capacitor: () => L(0, 30, 55, 30) + L(55, 12, 55, 48) + L(65, 12, 65, 48) + L(65, 30, 120, 30),
    'capacitor-pol': () => L(0, 30, 55, 30) + L(55, 12, 55, 48) + '<path class="nofill" d="M70,12 Q62,30 70,48"/>' + L(66, 30, 120, 30) + T(40, 16, '+'),
    battery: () => L(0, 30, 55, 30) + L(55, 10, 55, 50) + '<line x1="65" y1="20" x2="65" y2="40" class="thick"/>' + L(65, 30, 120, 30) + T(42, 14, '+') + T(72, 14, '−'),
    switch: () => L(0, 30, 38, 30) + '<circle cx="40" cy="30" r="2.5" class="nofill"/>' + L(42, 29, 78, 12) + '<circle cx="80" cy="30" r="2.5" class="nofill"/>' + L(82, 30, 120, 30),
    'switch-closed': () => L(0, 30, 38, 30) + '<circle cx="40" cy="30" r="2.5" class="nofill"/>' + L(42, 29, 78, 29) + '<circle cx="80" cy="30" r="2.5" class="nofill"/>' + L(82, 30, 120, 30),
    pushbutton: () => L(0, 30, 38, 30) + '<circle cx="40" cy="30" r="2.5" class="nofill"/>' + '<circle cx="80" cy="30" r="2.5" class="nofill"/>' + L(82, 30, 120, 30) + L(36, 20, 84, 20) + L(60, 20, 60, 6) + L(52, 6, 68, 6),
    potentiometer: () => draw.resistor() + arrow(60, 0, 60, 19),
    npn: () => '<circle cx="66" cy="30" r="24" class="nofill"/>' + L(0, 30, 54, 30) + '<line x1="54" y1="16" x2="54" y2="44" class="thick"/>' + L(54, 23, 76, 10) + L(76, 10, 76, 0) + arrow(54, 37, 74, 49) + L(74, 49, 76, 50) + L(76, 50, 76, 60) + T(80, 9, 'C', 'sym-pin') + T(80, 58, 'E', 'sym-pin') + T(4, 24, 'B', 'sym-pin'),
    ldr: () => draw.resistor() + arrow(34, 2, 46, 16) + arrow(48, 2, 60, 16),
    thermistor: () => draw.resistor() + L(40, 48, 80, 12) + L(32, 48, 40, 48) + T(86, 52, '−t°', 'sym-pin'),
    buzzer: () => L(0, 30, 45, 30) + L(45, 30, 45, 42) + L(120, 30, 75, 30) + L(75, 30, 75, 42) + L(35, 42, 85, 42) + '<path class="nofill" d="M38,42 A22,22 0 0 1 82,42"/>' + T(26, 24, '+'),
    relay: () => '<rect x="12" y="18" width="28" height="24" class="nofill"/>' + L(26, 0, 26, 18) + L(26, 42, 26, 60) + L(40, 30, 80, 30, 'dash').replace('<line', '<line class="dash"') + L(84, 60, 84, 46) + L(84, 46, 100, 18) + L(104, 18, 104, 0) + '<circle cx="104" cy="20" r="2" class="nofill"/>' + T(108, 14, 'NA', 'sym-pin') + T(88, 58, 'COM', 'sym-pin'),
    ground: () => L(60, 0, 60, 30) + L(40, 30, 80, 30) + L(47, 37, 73, 37) + L(54, 44, 66, 44),
    vcc: () => L(60, 60, 60, 24) + L(44, 24, 76, 24) + T(60, 15, '+5V', 'sym-label mid'),
    junction: () => L(0, 30, 120, 30) + L(60, 0, 60, 60) + '<circle cx="60" cy="30" r="4.5" class="fill"/>',
    crossing: () => L(0, 30, 120, 30) + L(60, 0, 60, 60),
    voltmeter: () => L(0, 30, 42, 30) + '<circle cx="60" cy="30" r="18" class="nofill"/>' + T(60, 36, 'V', 'sym-label mid big') + L(78, 30, 120, 30),
    ammeter: () => L(0, 30, 42, 30) + '<circle cx="60" cy="30" r="18" class="nofill"/>' + T(60, 36, 'A', 'sym-label mid big') + L(78, 30, 120, 30)
  };

  /** Ficha de cada símbolo para la biblioteca interactiva. */
  const symbols = [
    { id: 'resistor', name: 'Resistencia (IEC)', meaning: 'Limita la corriente y reparte tensiones.', behavior: 'Cumple la ley de Ohm: la tensión entre sus terminales es V = I·R. Convierte en calor la energía que la atraviesa.', terminals: 'Dos terminales intercambiables. No tiene polaridad.', polarized: false, examples: 'Limitar la corriente de un LED; formar un divisor de tensión.' },
    { id: 'resistor-us', name: 'Resistencia (ANSI, zigzag)', meaning: 'El mismo componente con la notación usada en EE. UU. y en muchos tutoriales de Arduino.', behavior: 'Idéntico a la resistencia IEC. Solo cambia el dibujo.', terminals: 'Dos terminales intercambiables. No tiene polaridad.', polarized: false, examples: 'Esquemas de Tinkercad y Fritzing suelen usar este dibujo.' },
    { id: 'diode', name: 'Diodo', meaning: 'Deja pasar la corriente en un solo sentido.', behavior: 'Conduce cuando el ánodo está unos 0,6–0,7 V (silicio) por encima del cátodo. En sentido inverso bloquea.', terminals: 'Ánodo (lado del triángulo) y cátodo (lado de la barra). La barra del símbolo coincide con la franja del cuerpo.', polarized: true, examples: 'Protección contra inversión de polaridad; diodo de rueda libre en un relé.' },
    { id: 'led', name: 'LED (diodo emisor de luz)', meaning: 'Diodo que emite luz cuando conduce.', behavior: 'Necesita una tensión directa (≈1,8–2,2 V rojo; ≈2,8–3,3 V azul o blanco) y una resistencia que limite su corriente.', terminals: 'Ánodo (+, pata larga) en el lado del triángulo; cátodo (−, pata corta, lado plano de la cápsula) en el lado de la barra. Las flechas indican luz que sale.', polarized: true, examples: 'Indicadores de encendido; la práctica de parpadeo con Arduino.' },
    { id: 'capacitor', name: 'Condensador no polarizado', meaning: 'Almacena carga eléctrica entre dos placas.', behavior: 'Se opone a cambios bruscos de tensión. En corriente continua, una vez cargado, no deja pasar corriente.', terminals: 'Dos terminales intercambiables. Típico de los cerámicos (p. ej. 100 nF, marcado "104").', polarized: false, examples: 'Condensador de desacoplo junto a la alimentación de un integrado.' },
    { id: 'capacitor-pol', name: 'Condensador polarizado (electrolítico)', meaning: 'Condensador de mayor capacidad que exige un sentido de conexión.', behavior: 'Igual que el no polarizado, pero invertirlo o superar su tensión nominal puede hacerlo calentarse, hincharse o reventar.', terminals: 'El lado marcado "+" (placa recta) va al potencial más alto. En el cuerpo, la franja con signos "−" marca el negativo y la pata larga es el positivo.', polarized: true, examples: 'Filtrado de la alimentación (p. ej. 100 µF, 16 V).' },
    { id: 'battery', name: 'Batería o pila', meaning: 'Fuente de tensión continua.', behavior: 'Mantiene una diferencia de potencial aproximadamente constante entre sus bornes mientras tenga carga.', terminals: 'La placa larga es el positivo (+); la corta, el negativo (−).', polarized: true, examples: 'Pila de 9 V en los primeros circuitos; 4 pilas AA en serie dan 6 V.' },
    { id: 'switch', name: 'Interruptor (abierto)', meaning: 'Abre o cierra un camino del circuito.', behavior: 'Abierto: no hay camino, no circula corriente. Cerrado: actúa como un cable.', terminals: 'Dos terminales intercambiables. No tiene polaridad.', polarized: false, examples: 'Interruptor de encendido de un circuito con pilas.' },
    { id: 'pushbutton', name: 'Pulsador normalmente abierto', meaning: 'Interruptor que solo cierra mientras se mantiene presionado.', behavior: 'Al soltarlo vuelve a abrir. Con Arduino necesita una resistencia de pull-down o pull-up (o INPUT_PULLUP) para que la entrada no quede flotando.', terminals: 'Dos terminales eléctricos. El pulsador táctil de 4 patas tiene las patas unidas por pares; usa dos patas diagonalmente opuestas para ir a lo seguro.', polarized: false, examples: 'Botón para encender un LED; entrada de un semáforo peatonal.' },
    { id: 'potentiometer', name: 'Potenciómetro', meaning: 'Resistencia con un cursor móvil.', behavior: 'Entre los extremos hay la resistencia total; el cursor toma una fracción que cambia al girar. Conectado entre 5 V y GND entrega una tensión variable en el cursor.', terminals: 'Tres terminales: dos extremos y el cursor (la flecha). Los extremos son intercambiables entre sí (invertirlos cambia el sentido de giro), el cursor no.', polarized: false, examples: 'Control de brillo; lectura con analogRead() en A0.' },
    { id: 'npn', name: 'Transistor bipolar NPN', meaning: 'Interruptor o amplificador controlado por una corriente pequeña en la base.', behavior: 'Una corriente pequeña de base a emisor permite una corriente mucho mayor de colector a emisor. La flecha del emisor apunta hacia fuera en un NPN.', terminals: 'Base (B), colector (C) y emisor (E). No son intercambiables. El orden físico de las patas cambia según el modelo y el encapsulado: consulta la hoja de datos.', polarized: 'pinout', examples: 'Activar un relé o un motor pequeño desde un pin de Arduino.' },
    { id: 'ldr', name: 'Fotorresistencia (LDR)', meaning: 'Resistencia que cambia con la luz.', behavior: 'Su resistencia baja cuando recibe más luz. Las flechas apuntan hacia el componente: la luz entra.', terminals: 'Dos terminales intercambiables. No tiene polaridad.', polarized: false, examples: 'Encender una luz al oscurecer, junto con una resistencia fija en divisor de tensión.' },
    { id: 'thermistor', name: 'Termistor NTC', meaning: 'Resistencia que cambia con la temperatura.', behavior: 'En un NTC la resistencia baja al subir la temperatura (coeficiente negativo, "−t°").', terminals: 'Dos terminales intercambiables. No tiene polaridad.', polarized: false, examples: 'Termómetro con un NTC de 10 kΩ a 25 °C y analogRead().' },
    { id: 'buzzer', name: 'Zumbador', meaning: 'Convierte una señal eléctrica en sonido.', behavior: 'Un zumbador activo suena con tensión continua (oscilador interno). Uno pasivo necesita una señal que oscile, por ejemplo tone() en Arduino.', terminals: 'Los activos están polarizados (+ marcado o pata larga). Los piezo pasivos sueltos normalmente no; si tu modelo tiene "+", respétalo.', polarized: 'depends', examples: 'Alarma sonora; aviso al pulsar un botón.' },
    { id: 'relay', name: 'Relé', meaning: 'Interruptor accionado por un electroimán.', behavior: 'Al circular corriente por la bobina (izquierda), el contacto móvil cambia de posición (línea discontinua: acoplamiento mecánico). Aísla el circuito de control del de potencia.', terminals: 'Bobina (2 terminales) y contactos: común (COM), normalmente abierto (NA/NO) y, en muchos modelos, normalmente cerrado (NC).', polarized: false, examples: 'Un pin de Arduino controla, mediante un transistor, la bobina de un relé de 5 V.' },
    { id: 'ground', name: 'Tierra / GND', meaning: 'Punto de referencia de 0 V del circuito.', behavior: 'Todos los símbolos de tierra de un esquema están conectados entre sí aunque no se dibuje el cable.', terminals: 'Un terminal. En Arduino corresponde a cualquiera de los pines GND.', polarized: false, examples: 'El cátodo de un LED vuelve a GND.' },
    { id: 'vcc', name: 'Alimentación (+5V, VCC)', meaning: 'Conexión a la tensión positiva de alimentación.', behavior: 'Todos los símbolos con la misma etiqueta (+5V) están unidos entre sí.', terminals: 'Un terminal. En Arduino Uno, el pin 5V.', polarized: false, examples: 'Alimentar un sensor TMP36 desde el pin 5V.' },
    { id: 'junction', name: 'Unión (nodo con punto)', meaning: 'Los cables que se cruzan con un punto SÍ están conectados.', behavior: 'Todo lo que toca un nodo está a la misma tensión.', terminals: 'No es un componente: indica una conexión.', polarized: false, examples: 'Donde se separan dos ramas en paralelo.' },
    { id: 'crossing', name: 'Cruce sin conexión', meaning: 'Dos cables que se cruzan SIN punto NO están conectados.', behavior: 'Cada cable sigue su propio camino. Algunos esquemas antiguos dibujan un pequeño "salto".', terminals: 'No es un componente.', polarized: false, examples: 'Esquemas compactos donde las líneas tienen que cruzarse.' },
    { id: 'voltmeter', name: 'Voltímetro', meaning: 'Instrumento que mide tensión.', behavior: 'Se conecta en paralelo, entre los dos puntos a medir. Tiene resistencia interna muy alta.', terminals: 'Dos puntas: COM (negra) y V (roja).', polarized: false, examples: 'Medir la tensión de una pila o la caída en una resistencia.' },
    { id: 'ammeter', name: 'Amperímetro', meaning: 'Instrumento que mide corriente.', behavior: 'Se conecta en serie: hay que abrir el circuito e intercalarlo. Tiene resistencia interna muy baja; conectarlo en paralelo con una fuente provoca un cortocircuito.', terminals: 'Dos puntas: COM y la entrada de corriente (mA o 10A).', polarized: false, examples: 'Medir la corriente que consume un LED.' }
  ];

  const byId = {};
  symbols.forEach((s) => { byId[s.id] = s; });

  /** SVG completo de un símbolo, listo para insertar. */
  function symbolSVG(id, opts) {
    const fn = draw[id];
    if (!fn) return '';
    const label = (opts && opts.label) || (byId[id] ? byId[id].name : id);
    return `<svg class="sym" viewBox="-6 -6 132 72" role="img" aria-label="Símbolo: ${label}"><g class="sym-g">${fn()}</g></svg>`;
  }

  /** Grupo SVG para componer diagramas: terminal izquierdo en (x,y), rotación en grados, escala. */
  function place(id, x, y, rot, scale, attrs) {
    return `<g transform="translate(${x},${y}) rotate(${rot || 0}) scale(${scale || 1}) translate(0,-30)" ${attrs || ''}>${draw[id]()}</g>`;
  }

  CB.symbols = { list: symbols, byId, draw, symbolSVG, place };
})(typeof window !== 'undefined' ? window : globalThis);
