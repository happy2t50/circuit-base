/* Biblioteca de componentes. Cada ficha cubre los 11 puntos del currículo:
 * nombre, ilustración, símbolo, función, terminales, polaridad, especificaciones,
 * comprobación, errores frecuentes, ejemplo práctico y ejercicio de identificación.
 *
 * polarized: true      → tiene polaridad (+/−) y se daña o no funciona si se invierte
 *            false     → no tiene polaridad: sus terminales son intercambiables (o, como el
 *                        potenciómetro, tienen funciones distintas pero no polaridad)
 *            'pinout'  → no se habla de polaridad, pero cada pata tiene una función fija
 *            'depends' → depende del tipo concreto (se explica en polarityNote)          */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});

  const leg = (x, y1, y2) => `<line class="ill-leg" x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/>`;
  const t = (x, y, s, cls) => `<text x="${x}" y="${y}" class="${cls || 'ill-text'}">${s}</text>`;
  const svg = (inner, label) => `<svg class="ill" viewBox="0 0 200 110" role="img" aria-label="Ilustración: ${label}">${inner}</svg>`;

  const ILL = {
    resistor: svg(`<line class="ill-leg" x1="8" y1="50" x2="192" y2="50"/><rect x="58" y="37" width="84" height="26" rx="11" class="ill-body-beige"/>
      <rect x="70" y="37" width="7" height="26" fill="#c62828"/><rect x="83" y="37" width="7" height="26" fill="#c62828"/><rect x="96" y="37" width="7" height="26" fill="#6d4c41"/><rect x="124" y="37" width="7" height="26" fill="#c9a227"/>
      ${t(100, 90, 'rojo · rojo · marrón · oro = 220 Ω ±5 %', 'ill-text mid')}`, 'resistencia de 220 ohmios con bandas de color'),
    led: svg(`<path d="M82,62 V34 A18,18 0 0 1 118,34 V62 Z" class="ill-red"/><path d="M76,62 H124 V68 H121 V62" class="ill-red-dark"/><rect x="76" y="62" width="44" height="6" class="ill-red-dark"/>
      ${leg(92, 68, 104)}${leg(108, 68, 92)}${t(70, 100, 'ánodo (+)', 'ill-text end')}${t(114, 90, 'cátodo (−)', 'ill-text')}${t(130, 66, 'lado plano', 'ill-text')}<line x1="121" y1="58" x2="121" y2="70" class="ill-flat"/>`, 'LED rojo con pata larga de ánodo y lado plano de cátodo'),
    diode: svg(`<line class="ill-leg" x1="8" y1="50" x2="192" y2="50"/><rect x="62" y="38" width="76" height="24" rx="3" class="ill-black"/><rect x="122" y="38" width="8" height="24" class="ill-silver"/>
      ${t(100, 90, '1N4007 · la franja marca el cátodo', 'ill-text mid')}`, 'diodo con franja de cátodo'),
    capacitor: svg(`<circle cx="45" cy="40" r="20" class="ill-ceramic"/>${t(45, 45, '104', 'ill-text mid')}${leg(38, 58, 100)}${leg(52, 58, 100)}${t(45, 108, 'cerámico 100 nF', 'ill-text mid')}
      <rect x="110" y="8" width="44" height="66" rx="5" class="ill-blue"/><rect x="142" y="8" width="12" height="66" class="ill-stripe"/>${t(148, 32, '−', 'ill-text mid inv')}${t(148, 50, '−', 'ill-text mid inv')}
      ${leg(124, 74, 104)}${leg(144, 74, 94)}${t(118, 100, '+', 'ill-text end')}${t(160, 100, 'electrolítico', 'ill-text')}`, 'condensador cerámico y condensador electrolítico'),
    pushbutton: svg(`<rect x="72" y="22" width="56" height="56" rx="4" class="ill-black"/><circle cx="100" cy="50" r="17" class="ill-cap"/>
      <line class="ill-leg" x1="64" y1="30" x2="72" y2="30"/><line class="ill-leg" x1="64" y1="70" x2="72" y2="70"/><line class="ill-leg" x1="128" y1="30" x2="136" y2="30"/><line class="ill-leg" x1="128" y1="70" x2="136" y2="70"/>
      ${t(100, 100, 'pulsador táctil de 4 patas (6×6 mm)', 'ill-text mid')}`, 'pulsador táctil de cuatro patas'),
    potentiometer: svg(`<circle cx="100" cy="42" r="30" class="ill-blue"/><circle cx="100" cy="42" r="10" class="ill-silver"/><line x1="100" y1="34" x2="100" y2="50" class="ill-slot"/>
      ${leg(80, 72, 100)}${leg(100, 72, 100)}${leg(120, 72, 100)}${t(80, 108, '1', 'ill-text mid')}${t(100, 108, 'cursor', 'ill-text mid')}${t(120, 108, '3', 'ill-text mid')}`, 'potenciómetro de tres patas'),
    transistor: svg(`<path d="M76,58 V28 A24,24 0 0 1 124,28 V58 Z" class="ill-black"/>${t(100, 44, 'BC547', 'ill-text mid inv')}
      ${leg(86, 58, 100)}${leg(100, 58, 100)}${leg(114, 58, 100)}${t(86, 108, 'C', 'ill-text mid')}${t(100, 108, 'B', 'ill-text mid')}${t(114, 108, 'E', 'ill-text mid')}${t(132, 80, 'cara plana al frente', 'ill-text')}`, 'transistor BC547 en encapsulado TO-92'),
    relay: svg(`<rect x="50" y="14" width="100" height="62" rx="4" class="ill-blue"/>${t(100, 40, 'RELÉ 5 V', 'ill-text mid inv')}${t(100, 58, 'bobina 5 VDC', 'ill-text mid inv')}
      ${leg(66, 76, 100)}${leg(86, 76, 100)}${leg(114, 76, 100)}${leg(134, 76, 100)}${t(100, 108, 'bobina · COM · NA · NC (según modelo)', 'ill-text mid')}`, 'relé de 5 voltios'),
    buzzer: svg(`<circle cx="100" cy="42" r="30" class="ill-black"/><circle cx="100" cy="42" r="5" class="ill-hole"/>${t(80, 28, '+', 'ill-text mid inv')}
      ${leg(90, 72, 104)}${leg(110, 72, 96)}${t(84, 100, '+', 'ill-text end')}${t(130, 96, 'activo: pegatina y pata larga = +', 'ill-text')}`, 'zumbador'),
    ldr: svg(`<circle cx="100" cy="40" r="24" class="ill-ceramic"/><path d="M84,32 H112 V38 H88 V44 H112 V50 H86" class="ill-track"/>
      ${leg(92, 64, 100)}${leg(108, 64, 100)}${t(100, 108, 'fotorresistencia (LDR)', 'ill-text mid')}`, 'fotorresistencia'),
    thermistor: svg(`<path d="M100,22 C116,22 118,52 100,58 C82,52 84,22 100,22 Z" class="ill-black"/>${leg(94, 56, 100)}${leg(106, 56, 100)}${t(126, 44, 'NTC 10 kΩ', 'ill-text')}${t(100, 108, 'termistor', 'ill-text mid')}`, 'termistor NTC'),
    sensors: svg(`<path d="M20,58 V30 A20,20 0 0 1 60,30 V58 Z" class="ill-black"/>${t(40, 46, 'TMP36', 'ill-text mid inv small')}${leg(30, 58, 92)}${leg(40, 58, 92)}${leg(50, 58, 92)}${t(40, 104, '+Vs · Vout · GND', 'ill-text mid small')}
      <rect x="84" y="20" width="108" height="50" rx="4" class="ill-blue"/><circle cx="110" cy="45" r="17" class="ill-silver"/><circle cx="166" cy="45" r="17" class="ill-silver"/>
      ${leg(120, 70, 92)}${leg(132, 70, 92)}${leg(144, 70, 92)}${leg(156, 70, 92)}${t(138, 104, 'HC-SR04: VCC Trig Echo GND', 'ill-text mid small')}`, 'sensor de temperatura TMP36 y sensor ultrasónico HC-SR04'),
    breadboard: svg(`<rect x="14" y="10" width="172" height="90" rx="4" class="ill-board"/>
      <line x1="22" y1="18" x2="178" y2="18" class="ill-rail-red"/><line x1="22" y1="92" x2="178" y2="92" class="ill-rail-blue"/><rect x="14" y="52" width="172" height="6" class="ill-gap"/>
      ${Array.from({ length: 13 }, (_, c) => Array.from({ length: 5 }, (_, r) => `<rect x="${26 + c * 12}" y="${26 + r * 5}" width="3" height="3" class="ill-hole"/><rect x="${26 + c * 12}" y="${62 + r * 5}" width="3" height="3" class="ill-hole"/>`).join('')).join('')}`, 'protoboard con carriles de alimentación y canal central'),
    jumpers: svg(`<path d="M20,80 C60,10 100,10 140,70" class="ill-wire-red"/><path d="M30,90 C80,30 120,40 180,80" class="ill-wire-black"/><path d="M20,60 C70,40 120,90 170,40" class="ill-wire-yellow"/>
      <rect x="16" y="76" width="8" height="12" class="ill-silver"/><rect x="136" y="66" width="8" height="12" class="ill-silver"/>${t(100, 106, 'macho-macho · macho-hembra · hembra-hembra', 'ill-text mid small')}`, 'cables jumper'),
    power: svg(`<rect x="66" y="22" width="68" height="76" rx="4" class="ill-black"/><rect x="74" y="10" width="18" height="12" class="ill-silver"/><rect x="108" y="10" width="18" height="12" class="ill-silver"/>
      ${t(83, 40, '+', 'ill-text mid inv')}${t(117, 40, '−', 'ill-text mid inv')}${t(100, 70, '9 V', 'ill-text mid inv big')}${t(160, 60, 'pila 9 V', 'ill-text')}`, 'pila de 9 voltios'),
    arduino: svg(`<rect x="24" y="14" width="160" height="86" rx="5" class="ill-teal"/><rect x="10" y="30" width="26" height="24" class="ill-silver"/><rect x="12" y="68" width="22" height="22" class="ill-black"/>
      <rect x="70" y="18" width="108" height="8" class="ill-black"/><rect x="88" y="88" width="90" height="8" class="ill-black"/><rect x="100" y="48" width="56" height="16" class="ill-black"/>
      ${t(128, 44, 'UNO', 'ill-text mid inv big')}${t(124, 36, 'D13 … D0', 'ill-text mid inv small')}${t(132, 84, '5V GND · A0–A5', 'ill-text mid inv small')}`, 'placa Arduino Uno')
  };

  const mc = (id, prompt, options, answer, explain) => ({ id, type: 'mc', kind: 'component', prompt, options, answer, explain });

  const list = [
    {
      id: 'resistencia', name: 'Resistencia', category: 'Pasivos', polarized: false, symbol: 'resistor', ill: ILL.resistor,
      polarityNote: 'Sin polaridad: puede colocarse en cualquier sentido.',
      function: 'Limita la corriente y crea caídas de tensión. Es el componente más usado en los circuitos de iniciación.',
      terminals: 'Dos patas idénticas e intercambiables.',
      specs: 'Valor en ohmios (Ω) indicado con bandas de colores; tolerancia (oro ±5 %); potencia máxima (las de los kits suelen ser de 1/4 W = 0,25 W). Valores típicos con Arduino: 220 Ω y 330 Ω para LED, 10 kΩ para pulsadores y divisores.',
      test: 'Con el multímetro en modo Ω y la resistencia FUERA del circuito (sin alimentación). La lectura debe estar dentro de la tolerancia: una de 220 Ω ±5 % puede marcar entre 209 y 231 Ω.',
      mistakes: ['Leer las bandas al revés: la banda de tolerancia (oro o plata) va a la derecha.', 'Medirla dentro del circuito alimentado: la lectura es falsa y puede dañar el multímetro.', 'Usar una de 1/4 W donde disipa más de 0,25 W: se calienta y se quema.'],
      example: 'Una resistencia de 220 Ω en serie con un LED rojo desde un pin de 5 V limita la corriente a unos 14 mA.',
      exercise: mc('cx-res', 'Una resistencia tiene las bandas amarillo, violeta, marrón, oro. ¿Cuál es su valor?', [
        { id: 'a', text: '47 Ω', feedback: 'La tercera banda es el multiplicador: marrón = ×10, no ×1.' },
        { id: 'b', text: '470 Ω', feedback: 'Amarillo = 4, violeta = 7, marrón = ×10 → 47 × 10 = 470 Ω. El oro indica ±5 %.' },
        { id: 'c', text: '4,7 kΩ', feedback: 'Para 4,7 kΩ el multiplicador sería rojo (×100).' }
      ], 'b')
    },
    {
      id: 'led', name: 'LED', category: 'Semiconductores', polarized: true, symbol: 'led', ill: ILL.led,
      polarityNote: 'Polarizado. Ánodo (+): pata larga. Cátodo (−): pata corta y lado plano del borde de la cápsula. Invertido no se enciende.',
      function: 'Emite luz cuando la corriente lo atraviesa de ánodo a cátodo.',
      terminals: 'Ánodo y cátodo. Si las patas se cortaron, guíate por el lado plano (cátodo) o usa el modo diodo del multímetro.',
      specs: 'Tensión directa Vf: ≈1,8–2,2 V (rojo, amarillo), ≈2,8–3,3 V (azul, blanco, muchos verdes). Corriente: los LED de 5 mm comunes admiten unos 20 mA como máximo continuo; 10–15 mA ya dan buen brillo. Siempre con resistencia en serie.',
      test: 'Multímetro en modo diodo: punta roja al ánodo, negra al cátodo. Debe indicar aproximadamente su Vf y a menudo el LED brilla débilmente. Al invertir las puntas debe indicar "OL".',
      mistakes: ['Conectarlo sin resistencia: se quema en segundos o daña el pin.', 'Ponerlo al revés.', 'Compartir una sola resistencia entre varios LED en paralelo: el reparto de corriente es desigual.'],
      example: 'Indicador de encendido: 5 V → 220 Ω → LED rojo → GND.',
      exercise: mc('cx-led', 'Encuentras un LED con las patas cortadas al mismo largo. ¿Cómo identificas el cátodo sin multímetro?', [
        { id: 'a', text: 'Por el lado plano del borde de la cápsula', feedback: 'El borde inferior de la cápsula tiene un lado plano junto al cátodo.' },
        { id: 'b', text: 'Es la pata del lado del color más intenso', feedback: 'El color no indica la polaridad.' },
        { id: 'c', text: 'Da igual, el LED no tiene polaridad', feedback: 'Sí la tiene: es un diodo y solo conduce de ánodo a cátodo.' }
      ], 'a', 'Dentro de la cápsula la pieza metálica mayor suele ser el cátodo, pero no es una regla fiable en todos los modelos.')
    },
    {
      id: 'diodo', name: 'Diodo rectificador', category: 'Semiconductores', polarized: true, symbol: 'diode', ill: ILL.diode,
      polarityNote: 'Polarizado. La franja del cuerpo marca el cátodo, igual que la barra del símbolo.',
      function: 'Deja pasar corriente en un solo sentido. Se usa para proteger circuitos y para descargar la energía de bobinas (relés, motores).',
      terminals: 'Ánodo (sin franja) y cátodo (con franja).',
      specs: '1N4007: hasta 1 A y 1000 V inversos, caída directa ≈0,7 V. 1N4148: diodo de señal, unos 200 mA como máximo continuo.',
      test: 'Modo diodo del multímetro: roja al ánodo y negra al cátodo debe marcar ≈0,5–0,7 V; al revés, "OL". Si marca ≈0 en ambos sentidos está en cortocircuito; si marca "OL" en ambos, está abierto.',
      mistakes: ['Colocarlo invertido como diodo de rueda libre de un relé: cortocircuita la alimentación de la bobina.', 'Usar un 1N4148 donde circula más corriente de la que admite.'],
      example: 'Diodo 1N4007 en antiparalelo con la bobina de un relé para absorber el pico de tensión al desconectarla.',
      exercise: mc('cx-diode', 'En un diodo 1N4007, ¿qué indica la franja plateada?', [
        { id: 'a', text: 'El ánodo', feedback: 'El ánodo es el extremo SIN franja.' },
        { id: 'b', text: 'El cátodo', feedback: 'La franja coincide con la barra del símbolo: el cátodo.' },
        { id: 'c', text: 'La tolerancia', feedback: 'Eso es en las resistencias. En los diodos la franja marca el cátodo.' }
      ], 'b')
    },
    {
      id: 'condensador', name: 'Condensador', category: 'Pasivos', polarized: 'depends', symbol: 'capacitor-pol', symbolAlt: 'capacitor', ill: ILL.capacitor,
      polarityNote: 'Depende del tipo. Cerámicos: sin polaridad. Electrolíticos: polarizados; la franja con signos "−" marca el negativo y la pata larga es el positivo.',
      function: 'Almacena carga. Estabiliza tensiones, filtra ruido y, con una resistencia, crea retardos.',
      terminals: 'Dos. En electrolíticos, positivo y negativo; en cerámicos, intercambiables.',
      specs: 'Capacidad en faradios (pF, nF, µF). Tensión máxima (p. ej. 16 V, 25 V): elige siempre una mayor que la del circuito. Código cerámico: "104" = 10 × 10⁴ pF = 100 nF.',
      test: 'Descárgalo antes de tocarlo o medirlo. Con un multímetro con modo de capacidad (−|(−), fuera del circuito. En modo Ω un condensador bueno empieza con resistencia baja que sube mientras se carga.',
      mistakes: ['Invertir un electrolítico: puede calentarse, hincharse o reventar.', 'Usar uno con tensión nominal menor que la del circuito.', 'Confundir 104 con 104 pF.'],
      example: 'Un electrolítico de 100 µF / 16 V entre 5 V y GND suaviza las caídas de tensión cuando arranca un servomotor.',
      exercise: mc('cx-cap', '¿Cuál de estos condensadores debes conectar respetando su polaridad?', [
        { id: 'a', text: 'Cerámico marcado "104"', feedback: 'Los cerámicos no tienen polaridad.' },
        { id: 'b', text: 'Electrolítico de 100 µF / 16 V', feedback: 'Los electrolíticos están polarizados: la franja "−" va al lado de menor potencial.' },
        { id: 'c', text: 'Ninguno, los condensadores nunca tienen polaridad', feedback: 'Los electrolíticos (y los de tántalo) sí la tienen.' }
      ], 'b')
    },
    {
      id: 'pulsador', name: 'Pulsador e interruptor', category: 'Entrada', polarized: false, symbol: 'pushbutton', symbolAlt: 'switch', ill: ILL.pushbutton,
      polarityNote: 'Sin polaridad. Atención al pulsador de 4 patas: están unidas internamente por pares.',
      function: 'Abre o cierra un camino. El pulsador solo conecta mientras está presionado; el interruptor mantiene su posición.',
      terminals: 'Pulsador táctil: 4 patas, unidas de dos en dos. Al presionar se unen los dos pares. Usar dos patas diagonalmente opuestas garantiza pasar por el contacto. Si dudas, verifica con continuidad.',
      specs: 'Pulsador táctil 6×6 mm: corriente pequeña (decenas de mA), apto para señales, no para cargas.',
      test: 'Modo continuidad: entre dos patas diagonales no debe pitar en reposo y debe pitar al presionar.',
      mistakes: ['Usar dos patas unidas internamente: el circuito queda siempre cerrado.', 'Leerlo con Arduino sin resistencia pull-down/pull-up: la entrada "flota" y da lecturas aleatorias.'],
      example: 'Pulsador entre D2 y GND con pinMode(2, INPUT_PULLUP): se lee LOW al presionar.',
      exercise: mc('cx-btn', 'Montas un pulsador de 4 patas y el LED queda encendido siempre, sin presionar. ¿Causa más probable?', [
        { id: 'a', text: 'Usaste dos patas que están unidas internamente', feedback: 'Exacto: esas patas siempre están conectadas. Usa patas diagonales.' },
        { id: 'b', text: 'El pulsador está invertido de polaridad', feedback: 'Un pulsador no tiene polaridad.' },
        { id: 'c', text: 'Falta un condensador', feedback: 'Un condensador no explica que el circuito esté siempre cerrado.' }
      ], 'a')
    },
    {
      id: 'potenciometro', name: 'Potenciómetro', category: 'Entrada', polarized: false, symbol: 'potentiometer', ill: ILL.potentiometer,
      polarityNote: 'Sin polaridad, pero el terminal central (cursor) no es intercambiable con los extremos.',
      function: 'Resistencia ajustable. Como divisor de tensión entrega en el cursor una tensión entre 0 V y la de alimentación.',
      terminals: 'Extremos (1 y 3) y cursor (centro, en la mayoría de modelos de 3 patas en línea).',
      specs: 'Resistencia total (10 kΩ es lo habitual con Arduino); lineal (B) o logarítmico (A).',
      test: 'Modo Ω: entre extremos, valor fijo cercano al nominal. Entre un extremo y el cursor, el valor debe variar suavemente al girar.',
      mistakes: ['Conectar 5 V y GND a un extremo y al cursor: al girar a tope se forma un cortocircuito a través de casi 0 Ω.', 'Esperar valores de 0 a 5 V sin conectar ambos extremos.'],
      example: 'Extremos a 5 V y GND, cursor a A0: analogRead(A0) devuelve de 0 a 1023.',
      exercise: mc('cx-pot', 'Para usar un potenciómetro como divisor de tensión con Arduino, ¿qué va al pin A0?', [
        { id: 'a', text: 'Uno de los extremos', feedback: 'Los extremos van a 5 V y a GND; la tensión variable sale por el cursor.' },
        { id: 'b', text: 'El cursor (terminal central)', feedback: 'El cursor entrega la tensión variable.' },
        { id: 'c', text: 'Ninguno: se conecta en serie con A0', feedback: 'A0 mide tensión: necesita el punto medio del divisor.' }
      ], 'b')
    },
    {
      id: 'transistor', name: 'Transistor bipolar (NPN)', category: 'Semiconductores', polarized: 'pinout', symbol: 'npn', ill: ILL.transistor,
      polarityNote: 'Cada pata (base, colector, emisor) tiene una función fija. El orden físico cambia entre modelos: un BC547 y un 2N2222A en TO-92 NO tienen el mismo orden.',
      function: 'Funciona como interruptor electrónico: una corriente pequeña en la base permite una corriente mayor entre colector y emisor.',
      terminals: 'B, C y E. BC547 (cara plana al frente, patas abajo): C-B-E de izquierda a derecha. Verifica siempre con la hoja de datos de tu modelo.',
      specs: 'BC547: hasta 100 mA de colector, 45 V. 2N2222A: hasta 600 mA (en TO-92 limita la disipación). Resistencia de base típica desde Arduino: 1 kΩ.',
      test: 'Modo diodo (NPN): roja en base, negra en emisor → ≈0,6–0,7 V; roja en base, negra en colector → ≈0,6–0,7 V. Entre colector y emisor, "OL" en ambos sentidos.',
      mistakes: ['Asumir el orden de patas de otro modelo.', 'Conectar la base directo al pin sin resistencia.', 'Olvidar el diodo de rueda libre al conmutar bobinas.'],
      example: 'Pin D7 → 1 kΩ → base; emisor a GND; colector a la bobina de un relé (con diodo de protección).',
      exercise: mc('cx-npn', 'Tienes un 2N2222A y un esquema hecho para BC547. ¿Qué haces antes de montarlo?', [
        { id: 'a', text: 'Lo coloco igual: todos los TO-92 tienen el mismo orden', feedback: 'No. El orden de patas depende del modelo y del fabricante.' },
        { id: 'b', text: 'Compruebo el orden de patas en la hoja de datos del 2N2222A', feedback: 'Correcto: en TO-92 el 2N2222A suele ser E-B-C, al revés que un BC547.' },
        { id: 'c', text: 'Giro el transistor 180°', feedback: 'Puede coincidir por casualidad, pero no es un método: verifica la hoja de datos.' }
      ], 'b')
    },
    {
      id: 'rele', name: 'Relé', category: 'Actuadores', polarized: 'depends', symbol: 'relay', ill: ILL.relay,
      polarityNote: 'La bobina de un relé simple no tiene polaridad (salvo que incluya diodo interno). Los módulos de relé sí tienen pines VCC/GND/IN que no deben invertirse.',
      function: 'Interruptor mecánico accionado por electroimán. Permite controlar otro circuito aislado del de control.',
      terminals: 'Bobina (2) y contactos COM, NA (normalmente abierto) y NC (normalmente cerrado).',
      specs: 'Tensión de bobina (5 V) y su corriente (en relés de 5 V suele estar entre 70 y 90 mA). Capacidad de los contactos impresa en el cuerpo. Un pin de Arduino Uno no debe superar 20 mA de forma continua: nunca alimentes la bobina directo desde el pin.',
      test: 'Modo Ω entre los terminales de bobina: decenas de ohmios (p. ej. ≈70 Ω en uno de 5 V). Continuidad: COM–NC cerrado en reposo; COM–NA cerrado al energizar la bobina.',
      mistakes: ['Conectar la bobina directamente a un pin de Arduino.', 'Omitir el diodo de rueda libre.', 'Usar los contactos con tensión de red sin formación ni protecciones. En este curso no se trabaja con tensión de red.'],
      example: 'Módulo de relé de 5 V (incluye transistor y diodo) con su entrada IN en D7.',
      exercise: mc('cx-rele', 'La bobina de un relé de 5 V consume unos 75 mA. ¿Puedes conectarla directamente a un pin del Arduino Uno?', [
        { id: 'a', text: 'Sí, el pin da 5 V', feedback: 'La tensión coincide, pero la corriente no: 75 mA supera mucho los 20 mA recomendados (40 mA máximo absoluto).' },
        { id: 'b', text: 'No: se usa un transistor (o un módulo) y un diodo de protección', feedback: 'El transistor conmuta la corriente de la bobina y el diodo absorbe el pico al desconectarla.' }
      ], 'b')
    },
    {
      id: 'zumbador', name: 'Zumbador (buzzer)', category: 'Actuadores', polarized: 'depends', symbol: 'buzzer', ill: ILL.buzzer,
      polarityNote: 'Activos: polarizados (+ en la pegatina o pata larga). Piezo pasivos sueltos: normalmente sin polaridad, pero respeta la marca si la tiene.',
      function: 'Produce sonido.',
      terminals: 'Dos patas (o tres en módulos: VCC, GND, señal).',
      specs: 'Activo: suena al aplicarle tensión continua; solo un tono. Pasivo: necesita una onda (tone(pin, frecuencia)); permite melodías. Revisa su corriente: muchos zumbadores magnéticos piden más de 20 mA y requieren transistor.',
      test: 'Activo: con 5 V y una resistencia limitadora, o con un pin si su consumo es bajo, debe sonar. Pasivo: con tone() desde Arduino.',
      mistakes: ['Usar un pasivo esperando que suene solo con HIGH.', 'Invertir un activo.'],
      example: 'Zumbador pasivo en D9 con tone(9, 1000) para un pitido de 1 kHz.',
      exercise: mc('cx-buzz', 'Conectas un zumbador a un pin, escribes digitalWrite(pin, HIGH) y solo se oye un "clic". ¿Qué tipo es?', [
        { id: 'a', text: 'Activo', feedback: 'Uno activo sonaría de forma continua con HIGH.' },
        { id: 'b', text: 'Pasivo', feedback: 'El pasivo necesita una señal que oscile: usa tone().' }
      ], 'b')
    },
    {
      id: 'ldr', name: 'Fotorresistencia (LDR)', category: 'Sensores', polarized: false, symbol: 'ldr', ill: ILL.ldr,
      polarityNote: 'Sin polaridad.',
      function: 'Resistencia que disminuye cuando aumenta la luz.',
      terminals: 'Dos patas intercambiables.',
      specs: 'Varía mucho entre modelos: típicamente cientos de kΩ o MΩ a oscuras y de cientos de Ω a pocos kΩ con buena luz. Se lee con un divisor de tensión (LDR + resistencia fija de 10 kΩ).',
      test: 'Modo Ω: tapa la LDR con el dedo y luego ilumínala; la resistencia debe cambiar claramente.',
      mistakes: ['Conectarla sola a una entrada analógica sin resistencia fija: no hay divisor, la lectura no varía bien.', 'Esperar valores idénticos entre dos LDR: calibra leyendo el monitor serie.'],
      example: 'Divisor 5 V → LDR → A0 → 10 kΩ → GND: más luz, mayor lectura en A0.',
      exercise: mc('cx-ldr', 'Al iluminar una LDR, su resistencia…', [
        { id: 'a', text: 'Aumenta', feedback: 'Es al revés: con más luz conduce mejor.' },
        { id: 'b', text: 'Disminuye', feedback: 'Más luz libera más portadores de carga y baja la resistencia.' },
        { id: 'c', text: 'No cambia; cambia su polaridad', feedback: 'La LDR no tiene polaridad.' }
      ], 'b')
    },
    {
      id: 'termistor', name: 'Termistor', category: 'Sensores', polarized: false, symbol: 'thermistor', ill: ILL.thermistor,
      polarityNote: 'Sin polaridad.',
      function: 'Resistencia que cambia con la temperatura. NTC: baja al calentarse. PTC: sube.',
      terminals: 'Dos patas intercambiables.',
      specs: 'Resistencia nominal a 25 °C (p. ej. 10 kΩ) y coeficiente β (p. ej. 3950). La relación no es lineal: se convierte con la ecuación β o una tabla.',
      test: 'Modo Ω a temperatura ambiente (cerca del nominal) y luego tomándolo entre los dedos: en un NTC la resistencia debe bajar.',
      mistakes: ['Suponer que la lectura es lineal.', 'Confundir NTC con PTC.'],
      example: 'Divisor 5 V → 10 kΩ fija → A0 → NTC 10 kΩ → GND.',
      exercise: mc('cx-ntc', 'Calientas un termistor NTC con la mano. Su resistencia…', [
        { id: 'a', text: 'Baja', feedback: 'NTC significa coeficiente de temperatura negativo: más temperatura, menos resistencia.' },
        { id: 'b', text: 'Sube', feedback: 'Eso haría un PTC.' }
      ], 'a')
    },
    {
      id: 'sensores', name: 'Sensores comunes (TMP36, HC-SR04)', category: 'Sensores', polarized: true, symbol: null, ill: ILL.sensors,
      polarityNote: 'Polarizados: tienen pines de alimentación (+ y GND) que no deben invertirse. Invertir un TMP36 lo calienta y puede destruirlo.',
      function: 'Convierten una magnitud física en una señal que Arduino puede leer. TMP36: temperatura → tensión analógica. HC-SR04: distancia → duración de un pulso.',
      terminals: 'TMP36 (cara plana al frente, patas abajo): +Vs, Vout, GND. HC-SR04: VCC, Trig, Echo, GND.',
      specs: 'TMP36: 2,7–5,5 V; 10 mV/°C con 750 mV a 25 °C → T(°C) = (V − 0,5) × 100. HC-SR04: 5 V, alcance de unos 2 cm a 4 m; su salida Echo es de 5 V (en placas de 3,3 V necesita adaptación de nivel).',
      test: 'TMP36: alimentado a 5 V, mide entre Vout y GND: a 25 °C ≈0,75 V. HC-SR04: con el sketch de ejemplo y el monitor serie.',
      mistakes: ['Invertir +Vs y GND del TMP36 (confundirlo con la cara redonda al frente).', 'Conectar el Echo de un HC-SR04 a una placa de 3,3 V sin divisor.', 'Confundir el TMP36 con el LM35 (escala distinta: 0 V a 0 °C).'],
      example: 'TMP36 con Vout en A0: temperatura = (analogRead(A0) × 5,0 / 1023 − 0,5) × 100.',
      exercise: mc('cx-tmp', 'Un TMP36 entrega 0,80 V en su salida. ¿Qué temperatura indica?', [
        { id: 'a', text: '80 °C', feedback: 'Olvidaste restar el desplazamiento de 0,5 V.' },
        { id: 'b', text: '30 °C', feedback: '(0,80 − 0,50) × 100 = 30 °C.' },
        { id: 'c', text: '8 °C', feedback: 'La escala es 10 mV por °C, es decir ×100 sobre los voltios.' }
      ], 'b')
    },
    {
      id: 'protoboard', name: 'Protoboard', category: 'Montaje', polarized: false, symbol: null, ill: ILL.breadboard,
      polarityNote: 'Sin polaridad propia. Los carriles marcados en rojo (+) y azul (−) son solo una convención: tú decides qué conectas en ellos.',
      function: 'Permite montar circuitos sin soldar. Sus orificios están unidos internamente por tiras metálicas.',
      terminals: 'Cada columna numerada tiene dos tiras de 5 orificios (a–e y f–j) separadas por el canal central. Los carriles de alimentación corren a lo largo. En algunas protoboards largas los carriles están partidos a la mitad.',
      specs: 'Para corrientes pequeñas (hasta unos cientos de mA). No apta para tensión de red.',
      test: 'Modo continuidad con dos cables: verifica qué orificios están unidos, sobre todo si los carriles están partidos.',
      mistakes: ['Poner las dos patas de un componente en la misma tira: queda en cortocircuito.', 'Asumir que los carriles son continuos en una protoboard larga.', 'Colocar un componente sin cruzar el canal cuando lo necesita (circuitos integrados).'],
      example: 'Resistencia de la tira 5 a la tira 9 y LED de la tira 9 a la 12: la tira 9 une resistencia y ánodo.',
      exercise: mc('cx-bb', 'En una protoboard, ¿qué orificios están conectados con el a10?', [
        { id: 'a', text: 'b10, c10, d10 y e10', feedback: 'Las filas a–e de una misma columna forman una tira.' },
        { id: 'b', text: 'a1 hasta a30', feedback: 'La fila "a" no está unida a lo largo; lo que corre a lo largo son los carriles de alimentación.' },
        { id: 'c', text: 'f10 hasta j10', feedback: 'El canal central separa a–e de f–j.' }
      ], 'a')
    },
    {
      id: 'jumpers', name: 'Cables jumper', category: 'Montaje', polarized: false, symbol: null, ill: ILL.jumpers,
      polarityNote: 'Sin polaridad. Los colores son una convención (rojo +, negro o azul GND) que ayuda a evitar errores.',
      function: 'Unen puntos de la protoboard, de la placa y de los módulos.',
      terminals: 'Macho-macho (protoboard ↔ Arduino), macho-hembra (módulos con pines), hembra-hembra.',
      specs: 'Para señales y corrientes pequeñas. Los cables muy finos se calientan con corrientes altas.',
      test: 'Modo continuidad de extremo a extremo: los cables baratos a veces están cortados por dentro.',
      mistakes: ['Usar colores al azar: dificulta encontrar errores.', 'Cable que no entra del todo en el orificio (falso contacto).'],
      example: 'Rojo de 5V al carril +, negro de GND al carril −.',
      exercise: mc('cx-jump', 'Un circuito funciona "a ratos" al mover los cables. ¿Qué compruebas primero?', [
        { id: 'a', text: 'Continuidad y asiento de cada jumper', feedback: 'Un cable cortado o mal insertado provoca falsos contactos.' },
        { id: 'b', text: 'La polaridad de los jumpers', feedback: 'Los jumpers no tienen polaridad.' }
      ], 'a')
    },
    {
      id: 'fuente', name: 'Fuentes de alimentación', category: 'Alimentación', polarized: true, symbol: 'battery', ill: ILL.power,
      polarityNote: 'Polarizadas: positivo (+) y negativo (−). En corriente continua invertirlas puede dañar componentes polarizados.',
      function: 'Entregan la energía del circuito: pilas, baterías, USB (5 V) o fuentes de laboratorio.',
      terminals: 'Positivo y negativo (GND).',
      specs: 'Tensión (V) y corriente máxima (A). Pila de 9 V: poca capacidad. 4 pilas AA en serie: 6 V. USB: 5 V, normalmente 500 mA en puertos USB 2.0. Fuente de laboratorio: permite limitar la corriente.',
      test: 'Voltímetro en paralelo entre + y −: una pila de 9 V nueva suele marcar algo más de 9 V.',
      mistakes: ['Cortocircuitar los bornes (calor, riesgo de quemaduras e incendio con baterías de litio).', 'Alimentar componentes por encima de su tensión máxima.', 'Usar tensión de red: fuera del alcance de este curso.'],
      example: 'Pila de 9 V con clip para los primeros circuitos con LED.',
      exercise: mc('cx-src', 'Cuatro pilas AA de 1,5 V conectadas en serie entregan…', [
        { id: 'a', text: '1,5 V', feedback: 'Eso pasa en paralelo (más duración, misma tensión).' },
        { id: 'b', text: '6 V', feedback: 'En serie las tensiones se suman: 4 × 1,5 V = 6 V.' }
      ], 'b')
    },
    {
      id: 'arduino-uno', name: 'Placa Arduino Uno (R3)', category: 'Microcontroladores', polarized: true, symbol: null, ill: ILL.arduino,
      polarityNote: 'Sus pines de alimentación (5V, 3.3V, Vin, GND) están polarizados. Nunca unas 5V con GND.',
      function: 'Placa con un microcontrolador ATmega328P que ejecuta tu programa y lee o controla pines.',
      terminals: 'D0–D13 digitales (D0 y D1 los usa la comunicación serie con el ordenador). PWM en D3, D5, D6, D9, D10 y D11 (marcados con ~). A0–A5 entradas analógicas de 10 bits (0–1023). 5V, 3.3V, Vin y varios GND. LED integrado en D13.',
      specs: 'Lógica de 5 V, reloj de 16 MHz. Corriente por pin: 20 mA recomendado, 40 mA máximo absoluto. Vin/conector: 7–12 V recomendados. Otras placas (Uno R4, Nano 33, ESP32) tienen tensiones, pines y límites distintos: no asumas que son iguales.',
      test: 'Conéctala por USB: debe encenderse el LED ON. Carga el ejemplo Blink: el LED "L" (D13) debe parpadear.',
      mistakes: ['Usar D0/D1 para otra cosa y que falle la carga del programa.', 'Pedir más de 20 mA a un pin (motores, relés, tiras de LED).', 'Aplicar más de 5 V a un pin de entrada.'],
      example: 'Práctica A1: LED externo en D8 con resistencia de 220 Ω.',
      exercise: mc('cx-uno', '¿Cuál de estos pines del Arduino Uno R3 NO admite analogWrite() (PWM)?', [
        { id: 'a', text: 'D9', feedback: 'D9 tiene PWM (~).' },
        { id: 'b', text: 'D8', feedback: 'D8 es solo digital. Los PWM son 3, 5, 6, 9, 10 y 11.' },
        { id: 'c', text: 'D6', feedback: 'D6 tiene PWM (~).' }
      ], 'b')
    }
  ];

  const byId = {};
  list.forEach((c) => { byId[c.id] = c; });
  CB.components = { list, byId };
})(typeof window !== 'undefined' ? window : globalThis);
