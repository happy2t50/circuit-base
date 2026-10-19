/* MÓDULO 1 · Fundamentos de electricidad. Contenido puro (sin lógica). */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  CB.lessons = CB.lessons || [];

  CB.lessons.push(
    /* ---------------------------------------------------------------- 1.1 */
    {
      id: 'm1-electricidad', module: 'm1', title: 'Qué es la electricidad', minutes: 15,
      objectives: ['Describir la corriente como movimiento ordenado de cargas.', 'Distinguir conductores de aislantes.', 'Diferenciar el sentido convencional de la corriente del movimiento real de los electrones.'],
      slides: [
        { title: 'La electricidad es carga en movimiento',
          body: '<p>Toda la materia está hecha de átomos. Cada átomo tiene un núcleo con <strong>protones</strong> (carga positiva) y, a su alrededor, <strong>electrones</strong> (carga negativa).</p><p>En los metales, algunos electrones están poco ligados y pueden desplazarse. Cuando una fuente los empuja a todos en la misma dirección, aparece una <strong>corriente eléctrica</strong>: un flujo ordenado de carga.</p>',
          more: '<p>Los electrones avanzan muy despacio por el cable (milímetros por segundo). Lo que viaja casi a la velocidad de la luz es el "empuje" eléctrico: por eso la luz se enciende al instante aunque cada electrón tarde mucho en recorrer el cable.</p>' },
        { title: 'Carga eléctrica',
          body: '<p>La carga se mide en <strong>culombios (C)</strong>. Un electrón tiene una carga diminuta: −1,6 × 10⁻¹⁹ C.</p><ul><li>Cargas iguales se repelen.</li><li>Cargas opuestas se atraen.</li></ul><p>Una corriente de 1 amperio significa que pasa 1 culombio de carga por un punto cada segundo: unos 6,24 × 10¹⁸ electrones por segundo.</p>' },
        { title: 'Conductores y aislantes',
          body: '<p><strong>Conductores</strong>: dejan circular la corriente con facilidad. Cobre, aluminio, oro, el grafito y el agua con sales disueltas.</p><p><strong>Aislantes</strong>: casi no la dejan circular. Plástico, vidrio, caucho, madera seca, aire.</p><p>Un cable combina ambos: <strong>núcleo de cobre</strong> para conducir y <strong>forro de plástico</strong> para que la corriente no salga por donde no debe.</p>',
          more: '<p>Entre ambos están los <strong>semiconductores</strong> (silicio, germanio). Su conducción se puede controlar, y con ellos se fabrican diodos, LED, transistores y microcontroladores como el de Arduino.</p>',
          activity: 'm1-a1' },
        { title: 'Sentido de la corriente',
          body: '<p>Históricamente se definió que la corriente va del terminal <strong>positivo (+)</strong> al <strong>negativo (−)</strong>. Es el <strong>sentido convencional</strong> y es el que usan todos los esquemas, las flechas de los diodos y las hojas de datos.</p><p>Más tarde se descubrió que en los metales quienes se mueven son los electrones, y lo hacen al revés: de − a +.</p><p>Los cálculos dan el mismo resultado con cualquiera de los dos convenios. En este curso usamos el convencional.</p>',
          activity: 'm1-a2' },
        { title: '¿Qué necesita un circuito para funcionar?',
          body: '<ol><li><strong>Una fuente</strong> que proporcione la diferencia de potencial (pila, USB, batería).</li><li><strong>Un camino cerrado</strong> de conductores desde un terminal de la fuente hasta el otro.</li><li><strong>Una carga</strong> que aproveche la energía (LED, motor, zumbador) y algo que limite la corriente.</li></ol><p>Si falta el camino cerrado, no circula corriente. Si el camino no tiene nada que limite la corriente, es un <strong>cortocircuito</strong>.</p>',
          activity: 'm1-a3' }
      ],
      activities: [
        { id: 'm1-a1', type: 'mc', prompt: '¿Qué material usarías para el núcleo de un cable jumper?',
          options: [
            { id: 'a', text: 'Cobre', feedback: 'El cobre tiene muchos electrones libres y es barato: es el conductor más usado en cables.' },
            { id: 'b', text: 'PVC (plástico)', feedback: 'El PVC es aislante: se usa para el forro, no para el núcleo.' },
            { id: 'c', text: 'Vidrio', feedback: 'El vidrio es aislante; no dejaría pasar la corriente.' },
            { id: 'd', text: 'Madera seca', feedback: 'La madera seca es aislante. Húmeda conduce algo, pero de forma impredecible.' }
          ], answer: 'a' },
        { id: 'm1-a2', type: 'tf', prompt: 'Verdadero o falso: en un cable de cobre, los electrones se mueven del terminal positivo al negativo.',
          answer: false,
          whyWrong: 'Los electrones tienen carga negativa: son atraídos por el positivo, así que se mueven de − a +.',
          explain: 'El sentido de + a − es el convencional, que se usa en los esquemas, pero no describe el movimiento real de los electrones.' },
        { id: 'm1-a3', type: 'reflection', prompt: 'Explica con tus palabras por qué un cable tiene un núcleo de cobre y un forro de plástico.',
          model: 'El cobre es conductor y permite que la corriente circule por el camino previsto. El plástico es aislante: impide que la corriente pase a otros cables o a nuestra mano, evitando cortocircuitos y descargas.' }
      ]
    },

    /* ---------------------------------------------------------------- 1.2 */
    {
      id: 'm1-magnitudes', module: 'm1', title: 'Voltaje, corriente, resistencia y unidades', minutes: 20,
      objectives: ['Definir voltaje, corriente y resistencia y su unidad.', 'Saber dónde se mide cada magnitud.', 'Convertir unidades con prefijos (m, k, M, µ).'],
      slides: [
        { title: 'Voltaje (tensión)',
          body: '<p>El <strong>voltaje</strong> o <strong>tensión</strong> es la diferencia de potencial eléctrico entre <em>dos puntos</em>. Es lo que impulsa a las cargas a moverse.</p><div class="formula"><span>Símbolo: <b>V</b></span><span>Unidad: <b>voltio (V)</b></span></div><p>Siempre se mide <strong>entre dos puntos</strong>. Decir "este punto tiene 5 V" significa "5 V respecto a GND", el punto de referencia.</p>',
          more: '<p>Valores habituales: pila AA 1,5 V; pila de 9 V; USB y pines de Arduino Uno 5 V; batería de coche 12 V. La red doméstica (127 V en México, 230 V en Europa) es peligrosa y queda fuera de este curso.</p>' },
        { title: 'Corriente (intensidad)',
          body: '<p>La <strong>corriente</strong> es la cantidad de carga que pasa por un punto del circuito cada segundo.</p><div class="formula"><span>Símbolo: <b>I</b></span><span>Unidad: <b>amperio (A)</b></span><span>1 A = 1 C/s</span></div><p>Se mide <strong>en un punto</strong> del camino: hay que hacer que la corriente pase a través del instrumento.</p><p>En electrónica de iniciación casi todo se mide en <strong>miliamperios (mA)</strong>: un LED usa unos 10–20 mA.</p>' },
        { title: 'Resistencia',
          body: '<p>La <strong>resistencia</strong> es la oposición de un material o componente al paso de la corriente.</p><div class="formula"><span>Símbolo: <b>R</b></span><span>Unidad: <b>ohmio (Ω)</b></span></div><p>Con la misma tensión, más resistencia significa menos corriente. Un cable ideal tiene 0 Ω; un aislante tiene una resistencia enorme.</p>',
          media: { symbol: 'resistor' } },
        { title: 'Unidades y prefijos',
          body: '<table class="units"><thead><tr><th>Prefijo</th><th>Factor</th><th>Ejemplo</th></tr></thead><tbody><tr><td>M (mega)</td><td>× 1 000 000</td><td>1 MΩ = 1 000 000 Ω</td></tr><tr><td>k (kilo)</td><td>× 1 000</td><td>4,7 kΩ = 4 700 Ω</td></tr><tr><td>m (mili)</td><td>÷ 1 000</td><td>20 mA = 0,020 A</td></tr><tr><td>µ (micro)</td><td>÷ 1 000 000</td><td>100 µF = 0,000 1 F</td></tr></tbody></table><p><strong>Regla de oro:</strong> convierte todo a unidades básicas (V, A, Ω) antes de usar una fórmula. La mayoría de errores de cálculo vienen de olvidar este paso.</p>',
          activity: ['m1-b1', 'm1-b2'] },
        { title: 'La analogía del agua y sus límites',
          body: '<p>Una analogía útil: la tensión es como la <strong>presión</strong> del agua, la corriente como el <strong>caudal</strong> y la resistencia como un <strong>estrechamiento</strong> de la tubería.</p><p>Sirve para intuir relaciones, pero tiene límites: en un circuito eléctrico no se "derrama" carga si el cable está abierto, y la corriente no se gasta en la carga: la misma corriente que sale de la fuente vuelve a ella.</p>',
          activity: ['m1-b3', 'm1-b4'] }
      ],
      activities: [
        { id: 'm1-b1', type: 'numeric', kind: 'ohm', prompt: 'Expresa 15 mA en amperios.', unit: 'A', answer: 0.015, tolerance: 0.001,
          solution: '15 mA ÷ 1000 = 0,015 A.',
          mistakes: [{ value: 15000, feedback: 'Multiplicaste por 1000. "mili" significa dividir entre 1000.' }, { value: 1.5, feedback: 'Desplazaste la coma solo dos lugares; son tres (÷1000).' }, { value: 0.15, feedback: 'Te faltó un lugar decimal: 15 ÷ 1000 = 0,015.' }],
          hint: 'mili = ÷ 1000.' },
        { id: 'm1-b2', type: 'numeric', kind: 'ohm', prompt: 'Expresa 4,7 kΩ en ohmios.', unit: 'Ω', answer: 4700, tolerance: 0.001,
          solution: '4,7 × 1000 = 4 700 Ω.',
          mistakes: [{ value: 0.0047, feedback: 'Dividiste entre 1000. "kilo" significa multiplicar por 1000.' }, { value: 470, feedback: '470 Ω sería 0,47 kΩ. Multiplica 4,7 por 1000.' }],
          hint: 'kilo = × 1000.' },
        { id: 'm1-b3', type: 'mc', prompt: '¿Cómo se mide la tensión en una resistencia?',
          options: [
            { id: 'a', text: 'Entre sus dos extremos', feedback: 'La tensión es una diferencia de potencial entre dos puntos.' },
            { id: 'b', text: 'Abriendo el circuito e intercalando el instrumento', feedback: 'Así se mide la corriente, no la tensión.' },
            { id: 'c', text: 'En un solo extremo, sin otra referencia', feedback: 'La tensión siempre se mide respecto a otro punto (otro extremo o GND).' }
          ], answer: 'a' },
        { id: 'm1-b4', type: 'tf', prompt: 'Verdadero o falso: en un circuito con una pila y un LED, la corriente que entra al LED es mayor que la que sale de él, porque el LED "consume" corriente.',
          answer: false,
          whyWrong: 'La corriente no se gasta: en un circuito en serie es la misma en todos los puntos.',
          explain: 'Lo que el LED aprovecha es energía (tensión × corriente), no la carga. Toda la carga que entra por el ánodo sale por el cátodo.' }
      ]
    },

    /* ---------------------------------------------------------------- 1.3 */
    {
      id: 'm1-circuitos', module: 'm1', title: 'Circuitos, corriente continua y fuentes', minutes: 15,
      objectives: ['Distinguir circuito abierto, cerrado y cortocircuito.', 'Diferenciar corriente continua de alterna.', 'Elegir una fuente adecuada para un circuito de iniciación.'],
      slides: [
        { title: 'Circuito abierto y circuito cerrado',
          body: '<p>En un <strong>circuito cerrado</strong> existe un camino completo desde un terminal de la fuente hasta el otro: circula corriente.</p><p>En un <strong>circuito abierto</strong> el camino está interrumpido (un interruptor abierto, un cable suelto, un componente quemado): no circula corriente en ninguna parte del lazo.</p>',
          media: { diagram: 'open-closed' } },
        { title: 'Cortocircuito',
          body: '<p>Un <strong>cortocircuito</strong> es un camino de resistencia casi nula entre los terminales de una fuente. La corriente queda limitada solo por la fuente y los cables: puede ser muy alta.</p><p>Consecuencias: cables y pilas que se calientan, fuentes que se apagan por protección, pistas o pines dañados. Las baterías de litio en cortocircuito pueden incendiarse.</p>',
          more: '<p>Un error típico de protoboard: un cable que va directamente del carril + al carril −. Antes de alimentar, sigue con el dedo cada cable de alimentación.</p>' },
        { title: 'Corriente continua y corriente alterna',
          body: '<p><strong>Corriente continua (CC, DC)</strong>: circula siempre en el mismo sentido y su tensión es aproximadamente constante. Pilas, baterías, USB y Arduino trabajan en CC. Símbolo en el multímetro: V⎓.</p><p><strong>Corriente alterna (CA, AC)</strong>: cambia de sentido periódicamente. La red eléctrica de México es de 127 V y 60 Hz: cambia de sentido 120 veces por segundo. Símbolo: V~.</p><p class="callout warn">Este curso trabaja solo con <strong>corriente continua de baja tensión</strong> (hasta 12 V). No se manipula la red eléctrica.</p>',
          activity: 'm1-c1' },
        { title: 'Fuentes de alimentación',
          body: '<p>Una fuente se describe por dos datos:</p><ul><li><strong>Tensión</strong> que entrega (V).</li><li><strong>Corriente máxima</strong> que puede dar (A o mA).</li></ul><p>El circuito toma la corriente que necesita según su resistencia; la fuente solo debe poder darla. Un cargador de 5 V y 2 A no "mete" 2 A a un LED: el LED, con su resistencia, toma unos 15 mA.</p>',
          more: '<p>Fuentes típicas: pila de 9 V (poca capacidad, para pruebas), portapilas 4×AA (6 V), USB del ordenador (5 V, normalmente 500 mA), fuente de laboratorio (tensión ajustable y límite de corriente, ideal para aprender).</p>',
          activity: 'm1-c2' },
        { title: 'Lee tu primer circuito',
          body: '<p>Este es el circuito que montarás muchas veces: una <strong>batería de 9 V</strong>, una <strong>resistencia R1</strong> y un <strong>LED</strong> en serie. La flecha indica el sentido convencional de la corriente: sale por el + de la batería, atraviesa R1 y el LED (de ánodo a cátodo) y vuelve al −.</p>',
          media: { diagram: 'basic-led' },
          activity: 'm1-c3' }
      ],
      activities: [
        { id: 'm1-c1', type: 'mc', prompt: '¿Cuál de estas fuentes entrega corriente alterna?',
          options: [
            { id: 'a', text: 'Un puerto USB', feedback: 'El USB entrega 5 V de corriente continua.' },
            { id: 'b', text: 'Una pila de 9 V', feedback: 'Las pilas entregan corriente continua.' },
            { id: 'c', text: 'Un tomacorriente doméstico', feedback: 'La red es alterna (127 V, 60 Hz en México). Es peligrosa: no se usa en este curso.' },
            { id: 'd', text: 'El pin 5V de Arduino', feedback: 'Arduino trabaja con corriente continua.' }
          ], answer: 'c' },
        { id: 'm1-c2', type: 'tf', prompt: 'Verdadero o falso: si conectas un LED con su resistencia a un cargador de 5 V y 2 A, por el LED circularán 2 A.',
          answer: false,
          whyWrong: 'Los 2 A son la corriente máxima que el cargador puede dar, no la que obliga a circular.',
          explain: 'La corriente la fija el circuito: con 5 V, un LED de 2 V y 220 Ω circulan unos 13,6 mA.' },
        { id: 'm1-c3', type: 'hotspot', kind: 'diagram', prompt: 'Haz clic en el componente que limita la corriente del LED.',
          media: { diagram: 'basic-led' }, answer: ['r1'],
          feedback: {
            r1: 'R1 limita la corriente: (9 V − 2 V) / 470 Ω ≈ 15 mA.',
            led1: 'El LED es la carga que queremos proteger. Por sí mismo no limita la corriente de forma segura.',
            bat: 'La batería impulsa la corriente; no la limita.',
            'w-top': 'Un cable tiene resistencia casi nula: no limita nada.',
            'w-bottom': 'Este es el cable de retorno al negativo; su resistencia es casi nula.'
          } }
      ]
    },

    /* ---------------------------------------------------------------- 1.4 */
    {
      id: 'm1-ohm', module: 'm1', title: 'Ley de Ohm', minutes: 25,
      objectives: ['Aplicar V = I × R en sus tres formas.', 'Calcular la resistencia limitadora de un LED.', 'Elegir un valor comercial de resistencia.'],
      slides: [
        { title: 'La relación fundamental',
          body: '<div class="formula big"><span>V = I × R</span></div><p>La tensión entre los extremos de una resistencia es igual a la corriente que la atraviesa multiplicada por su resistencia. Despejando:</p><div class="formula"><span>I = V ÷ R</span><span>R = V ÷ I</span></div><p>Con la tensión fija, si duplicas R, la corriente se reduce a la mitad.</p>',
          more: '<p>Truco del triángulo: escribe V arriba e I y R abajo. Tapa la magnitud que buscas: lo que queda indica la operación (V sobre I·R; I = V/R; R = V/I).</p>',
          activity: 'm1-d1' },
        { title: 'Ejemplo 1: calcular la corriente',
          body: '<p>Una resistencia de <strong>1 kΩ</strong> se conecta a <strong>5 V</strong>.</p><ol><li>Unidades básicas: R = 1 000 Ω.</li><li>I = V ÷ R = 5 ÷ 1 000 = 0,005 A.</li><li>Resultado: <strong>5 mA</strong>.</li></ol>',
          activity: 'm1-d2' },
        { title: 'Ejemplo 2: calcular la resistencia',
          body: '<p>Quieres limitar la corriente a <strong>25 mA</strong> con una fuente de <strong>5 V</strong>.</p><ol><li>I = 25 mA = 0,025 A.</li><li>R = V ÷ I = 5 ÷ 0,025 = <strong>200 Ω</strong>.</li></ol>',
          activity: 'm1-d3' },
        { title: 'Ejemplo 3: la resistencia de un LED',
          body: '<p>Un LED mantiene entre sus patas una tensión casi fija, su <strong>tensión directa (Vf)</strong>. La resistencia solo "ve" el resto:</p><div class="formula"><span>R = (Vfuente − Vf) ÷ I</span></div><p>Pin de Arduino a 5 V, LED rojo (Vf ≈ 2,0 V), corriente deseada 15 mA:</p><ol><li>R = (5 − 2,0) ÷ 0,015 = 200 Ω.</li><li>200 Ω no es un valor comercial habitual. Se elige el <strong>siguiente valor mayor</strong> de la serie E12: <strong>220 Ω</strong>.</li><li>Corriente real: (5 − 2,0) ÷ 220 ≈ <strong>13,6 mA</strong>. Por debajo de los 20 mA recomendados por pin del Arduino Uno.</li></ol>',
          more: '<p>Valores E12 en cada década: 10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82. Redondear hacia arriba deja la corriente algo por debajo de la calculada: es la opción segura.</p>',
          activity: 'm1-d4' },
        { title: 'Ejemplo 4: calcular la tensión',
          body: '<p>Por una resistencia de <strong>330 Ω</strong> circulan <strong>15 mA</strong>. ¿Qué tensión hay entre sus extremos?</p><ol><li>I = 0,015 A.</li><li>V = I × R = 0,015 × 330 = <strong>4,95 V</strong>.</li></ol><p>Puedes comprobar todos estos cálculos con la calculadora del <a href="#/laboratorio">Laboratorio</a>.</p>',
          activity: 'm1-d5' }
      ],
      activities: [
        { id: 'm1-d1', type: 'mc', kind: 'ohm', prompt: 'Mantienes 9 V y cambias una resistencia de 1 kΩ por una de 2 kΩ. La corriente…',
          options: [
            { id: 'a', text: 'Se duplica', feedback: 'Más resistencia significa menos corriente, no más.' },
            { id: 'b', text: 'Se reduce a la mitad', feedback: 'I = V/R: 9/1000 = 9 mA y 9/2000 = 4,5 mA.' },
            { id: 'c', text: 'No cambia', feedback: 'La corriente depende de R: I = V/R.' }
          ], answer: 'b' },
        { id: 'm1-d2', type: 'numeric', kind: 'ohm', prompt: 'Una resistencia de 2,2 kΩ se conecta a 9 V. ¿Qué corriente circula? Responde en mA.', unit: 'mA', answer: 9 / 2200 * 1000, tolerance: 0.02,
          solution: 'I = 9 ÷ 2 200 = 0,00409 A ≈ 4,09 mA.',
          steps: ['Convierte: 2,2 kΩ = 2 200 Ω.', 'I = V ÷ R = 9 ÷ 2 200.', 'Pasa a mA multiplicando por 1 000.'],
          mistakes: [{ value: 9 / 2200, feedback: 'El cálculo es correcto, pero está en amperios. Multiplica por 1 000 para tenerlo en mA.' }, { value: 9 * 2200, feedback: 'Multiplicaste. Para la corriente se divide: I = V ÷ R.' }],
          hint: 'I = V ÷ R, con R en ohmios.' },
        { id: 'm1-d3', type: 'numeric', kind: 'ohm', prompt: '¿Qué resistencia limita la corriente a 20 mA con una fuente de 12 V? Responde en Ω.', unit: 'Ω', answer: 600, tolerance: 0.01,
          solution: 'R = 12 ÷ 0,020 = 600 Ω. (El valor comercial E12 siguiente es 680 Ω.)',
          mistakes: [{ value: 0.6, feedback: 'Dividiste entre 20 en lugar de entre 0,020 A. Convierte los mA a A.' }, { value: 240, feedback: 'Multiplicaste 12 × 20. La resistencia es R = V ÷ I.' }],
          hint: '20 mA = 0,020 A.' },
        { id: 'm1-d4', type: 'numeric', kind: 'ohm', prompt: 'Fuente de 5 V, LED azul con Vf = 3,0 V y corriente deseada de 10 mA. ¿Resistencia mínima en Ω?', unit: 'Ω', answer: 200, tolerance: 0.01,
          solution: 'R = (5 − 3,0) ÷ 0,010 = 200 Ω. Elegirías 220 Ω.',
          mistakes: [{ value: 500, feedback: 'Olvidaste restar la tensión directa del LED: la resistencia solo tiene 5 − 3 = 2 V entre sus extremos.' }, { value: 800, feedback: 'Sumaste la Vf. Se resta: R = (Vfuente − Vf) ÷ I.' }, { value: 0.2, feedback: 'Usaste 10 en lugar de 0,010 A.' }],
          hint: 'R = (Vfuente − Vf) ÷ I.' },
        { id: 'm1-d5', type: 'numeric', kind: 'ohm', prompt: 'Por una resistencia de 470 Ω circulan 12 mA. ¿Qué tensión hay entre sus extremos, en voltios?', unit: 'V', answer: 0.012 * 470, tolerance: 0.01,
          solution: 'V = 0,012 × 470 = 5,64 V.',
          mistakes: [{ value: 12 * 470, feedback: 'Usaste 12 en lugar de 0,012 A.' }, { value: 470 / 0.012, feedback: 'Dividiste. La tensión es V = I × R.' }],
          hint: 'V = I × R, con I en amperios.' }
      ]
    },

    /* ---------------------------------------------------------------- 1.5 */
    {
      id: 'm1-potencia', module: 'm1', title: 'Potencia eléctrica', minutes: 15,
      objectives: ['Calcular la potencia con P = V × I y sus variantes.', 'Verificar si una resistencia soporta la potencia que disipa.'],
      slides: [
        { title: 'Qué es la potencia',
          body: '<p>La <strong>potencia</strong> indica cuánta energía se transfiere por segundo. En una resistencia, esa energía se convierte en calor.</p><div class="formula big"><span>P = V × I</span></div><div class="formula"><span>Unidad: <b>vatio (W)</b></span><span>1 W = 1 V × 1 A</span></div>' },
        { title: 'Tres formas de calcularla',
          body: '<p>Combinando con la ley de Ohm:</p><div class="formula"><span>P = V × I</span><span>P = I² × R</span><span>P = V² ÷ R</span></div><p>Usa la que encaje con los datos que tienes. Cuidado: V es la tensión <em>entre los extremos del componente</em>, no la de la fuente.</p>',
          activity: 'm1-e1' },
        { title: 'Potencia nominal de una resistencia',
          body: '<p>Cada resistencia aguanta una potencia máxima. Las de los kits suelen ser de <strong>1/4 W (0,25 W)</strong>. Buena práctica: que disipe como mucho la mitad de su potencia nominal.</p><p><strong>Caso LED con Arduino:</strong> R = 220 Ω, tensión en la resistencia 3 V, I = 13,6 mA.</p><p>P = 3 × 0,0136 ≈ <strong>0,041 W</strong> (41 mW): muy por debajo de 0,25 W. Sobra.</p>',
          activity: 'm1-e2' },
        { title: 'Cuando la potencia sí importa',
          body: '<p>Una resistencia de 100 Ω conectada directamente a 12 V:</p><ol><li>I = 12 ÷ 100 = 0,12 A.</li><li>P = 12 × 0,12 = <strong>1,44 W</strong>.</li></ol><p>Una resistencia de 1/4 W tendría que disipar casi 6 veces su límite: se calentaría hasta quemarse y podría causar quemaduras al tocarla.</p>',
          more: '<p>Energía = potencia × tiempo. Por eso el recibo de la luz cobra kWh: 1 kWh es la energía de un aparato de 1 000 W funcionando una hora.</p>',
          activity: 'm1-e3' }
      ],
      activities: [
        { id: 'm1-e1', type: 'numeric', prompt: 'Una resistencia de 100 Ω tiene 5 V entre sus extremos. ¿Cuánta potencia disipa, en vatios?', unit: 'W', answer: 0.25, tolerance: 0.01,
          solution: 'P = V² ÷ R = 25 ÷ 100 = 0,25 W.',
          mistakes: [{ value: 0.05, feedback: 'Eso es la corriente (5 ÷ 100 = 0,05 A). Falta multiplicar por la tensión: P = 5 × 0,05.' }, { value: 500, feedback: 'Multiplicaste V × R. Usa P = V² ÷ R.' }, { value: 0.025, feedback: 'Revisa: 5² = 25, y 25 ÷ 100 = 0,25.' }],
          hint: 'P = V² ÷ R.' },
        { id: 'm1-e2', type: 'mc', prompt: 'En el caso anterior (0,25 W), ¿sirve una resistencia de 1/4 W?',
          options: [
            { id: 'a', text: 'Sí, con mucho margen', feedback: '0,25 W es exactamente su límite: no hay margen.' },
            { id: 'b', text: 'Está justo en el límite: mejor una de 1/2 W', feedback: 'Trabajar al 100 % la calienta mucho y acorta su vida. Con 1/2 W trabaja al 50 %.' },
            { id: 'c', text: 'La potencia no importa en resistencias', feedback: 'Importa: una resistencia que disipa más de su potencia nominal se quema.' }
          ], answer: 'b' },
        { id: 'm1-e3', type: 'numeric', prompt: 'Batería de 9 V, LED rojo (Vf = 2 V) y R = 470 Ω en serie. ¿Qué potencia disipa la resistencia, en vatios?', unit: 'W', answer: 7 * (7 / 470), tolerance: 0.03,
          solution: 'La resistencia tiene 9 − 2 = 7 V. I = 7 ÷ 470 ≈ 0,0149 A. P = 7 × 0,0149 ≈ 0,104 W: dentro de 1/4 W.',
          steps: ['Tensión en la resistencia: 9 V − 2 V = 7 V.', 'I = 7 ÷ 470.', 'P = 7 × I.'],
          mistakes: [{ value: 81 / 470, feedback: 'Usaste los 9 V de la batería. La resistencia solo tiene 7 V entre sus extremos: el LED toma 2 V.' }, { value: 4 / 470, feedback: 'Usaste la tensión del LED (2 V). La que importa es la de la resistencia: 7 V.' }],
          hint: 'Primero calcula la tensión que queda en la resistencia.' }
      ]
    },

    /* ---------------------------------------------------------------- 1.6 */
    {
      id: 'm1-multimetro', module: 'm1', title: 'Uso básico del multímetro', minutes: 20,
      objectives: ['Medir tensión en paralelo y corriente en serie.', 'Medir resistencia y continuidad sin alimentación.', 'Evitar los errores que dañan el multímetro.'],
      slides: [
        { title: 'Partes del multímetro',
          body: '<ul><li><strong>Selector</strong>: elige la magnitud: V⎓ (continua), V~ (alterna), A o mA, Ω, continuidad (símbolo de sonido) y diodo.</li><li><strong>Bornes</strong>: COM (punta negra, siempre); VΩmA (punta roja para tensión, resistencia y corrientes pequeñas); 10A (punta roja solo para corrientes grandes).</li><li><strong>Pantalla</strong>: "OL" significa fuera de rango o circuito abierto.</li></ul>',
          more: '<p>Los multímetros autorrango eligen la escala solos. En los manuales, empieza por la escala más alta y baja hasta tener buena resolución.</p>' },
        { title: 'Medir tensión: en paralelo',
          body: '<p>Selector en V⎓, punta roja en VΩ. Toca los <strong>dos puntos</strong> entre los que quieres conocer la tensión, sin desconectar nada.</p><p>En el circuito básico, el voltímetro sobre R1 marcará unos <strong>7 V</strong>: los 9 V de la batería menos los ≈2 V que toma el LED.</p>',
          media: { diagram: 'meter-voltage' }, activity: 'm1-f1' },
        { title: 'Medir corriente: en serie',
          body: '<p>Hay que <strong>abrir el circuito</strong> y hacer que la corriente pase por el multímetro. Punta roja en el borne mA, selector en A o mA.</p><p>En el circuito básico debería marcar unos <strong>15 mA</strong>: (9 − 2) ÷ 470.</p><p class="callout danger">Nunca coloques el multímetro en modo corriente entre los bornes de una fuente: su resistencia interna es casi nula y provocas un cortocircuito. Suele fundir el fusible interno.</p>',
          media: { diagram: 'meter-current' }, activity: 'm1-f2' },
        { title: 'Resistencia y continuidad: sin alimentación',
          body: '<p>En modo Ω el multímetro inyecta su propia pequeña corriente. Por eso:</p><ul><li><strong>Desconecta la alimentación</strong> del circuito.</li><li>Mide los componentes <strong>fuera del circuito</strong>, o al menos con una pata suelta; si no, mides también lo que está en paralelo.</li></ul><p>El modo <strong>continuidad</strong> pita cuando dos puntos están unidos: ideal para encontrar cables cortados o comprobar qué orificios de la protoboard están conectados.</p>',
          activity: 'm1-f3' },
        { title: 'Rutina segura de medición',
          body: '<p>Ordena los pasos para medir la tensión de una pila de 9 V.</p>',
          activity: 'm1-f4' }
      ],
      activities: [
        { id: 'm1-f1', type: 'mc', kind: 'diagram', prompt: 'En este circuito (9 V, R1 = 470 Ω, LED rojo), ¿qué marcará aproximadamente el voltímetro?',
          media: { diagram: 'meter-voltage' },
          options: [
            { id: 'a', text: '9 V', feedback: 'Los 9 V se reparten entre R1 y el LED; el voltímetro solo mide los extremos de R1.' },
            { id: 'b', text: 'Unos 7 V', feedback: 'El LED toma ≈2 V y R1 el resto: 9 − 2 = 7 V.' },
            { id: 'c', text: 'Unos 2 V', feedback: 'Esa es la tensión del LED, no la de R1.' },
            { id: 'd', text: '0 V, porque está en paralelo', feedback: 'Medir en paralelo es justo la forma correcta de medir tensión.' }
          ], answer: 'b' },
        { id: 'm1-f2', type: 'mc', prompt: 'Quieres medir la corriente que pasa por un LED. ¿Cómo conectas el multímetro?',
          options: [
            { id: 'a', text: 'En paralelo con el LED, en modo mA', feedback: 'En paralelo, el amperímetro (casi 0 Ω) desvía toda la corriente y apaga el LED; con la fuente puede ser un cortocircuito.' },
            { id: 'b', text: 'En serie: abro el circuito y lo intercalo, en modo mA', feedback: 'La corriente debe atravesar el instrumento.' },
            { id: 'c', text: 'En modo V, entre ánodo y cátodo', feedback: 'Así medirías la tensión del LED, no su corriente.' }
          ], answer: 'b' },
        { id: 'm1-f3', type: 'tf', prompt: 'Verdadero o falso: para medir una resistencia con el multímetro puedes dejar el circuito alimentado.',
          answer: false,
          whyWrong: 'Con alimentación, la tensión del circuito altera la medida y puede dañar el multímetro.',
          explain: 'Desconecta la alimentación y, si puedes, saca el componente del circuito.' },
        { id: 'm1-f4', type: 'order', prompt: 'Ordena los pasos para medir la tensión de una pila de 9 V.',
          steps: [
            { id: 's1', text: 'Conecta la punta negra al borne COM y la roja al borne VΩ.', why: 'Primero se preparan los bornes: con la punta roja en 10A o mA no se puede medir tensión.' },
            { id: 's2', text: 'Gira el selector a tensión continua (V⎓); escala de 20 V si es manual.', why: 'El selector se ajusta antes de tocar la pila.' },
            { id: 's3', text: 'Toca el negativo de la pila con la punta negra y el positivo con la roja.', why: 'Solo se toca el circuito cuando el multímetro está configurado.' },
            { id: 's4', text: 'Lee el valor y anótalo con su unidad.', why: 'La lectura llega después de hacer contacto.' },
            { id: 's5', text: 'Retira las puntas y lleva el selector a OFF.', why: 'Al final se apaga para no gastar la batería del multímetro.' }
          ],
          explain: 'Configurar primero y tocar después evita medir en el modo equivocado. Una pila de 9 V nueva suele marcar algo más de 9 V.' }
      ]
    },

    /* ---------------------------------------------------------------- 1.7 */
    {
      id: 'm1-seguridad', module: 'm1', title: 'Seguridad eléctrica', minutes: 10,
      objectives: ['Aplicar una comprobación previa antes de energizar.', 'Reconocer las situaciones que quedan fuera del curso.'],
      slides: [
        { title: 'Reglas de seguridad del laboratorio',
          body: '<ol class="rules"><li><strong>Baja tensión</strong>: trabaja con 5 V, 9 V o como mucho 12 V de corriente continua.</li><li><strong>Desconecta antes de cablear</strong>: quita el USB o la pila antes de mover un cable.</li><li><strong>Evita cortocircuitos</strong>: nunca unas + con − sin una carga en medio.</li><li><strong>Calcula la resistencia de cada LED</strong> antes de conectarlo.</li><li><strong>Respeta los límites</strong>: en Arduino Uno, 20 mA por pin recomendado.</li><li><strong>Verifica polaridad</strong> de LED, electrolíticos, sensores y fuentes.</li><li><strong>No toques la red eléctrica</strong> (127 V o 230 V): puede matar.</li><li><strong>No conectes cargas de potencia</strong> (motores, relés, tiras LED) sin conocer sus requisitos y protecciones.</li></ol>' },
        { title: 'Señales de alarma',
          body: '<p>Desconecta de inmediato si notas:</p><ul><li>Un componente caliente al tacto o que huele a quemado.</li><li>El LED de encendido del Arduino se apaga o el ordenador avisa de un problema con el USB.</li><li>Una pila que se calienta.</li><li>Humo, chispas o un condensador hinchado.</li></ul><p>Después busca la causa con la alimentación desconectada: casi siempre es un cortocircuito o un componente invertido.</p>',
          activity: 'm1-g1' },
        { title: 'Comprobación previa antes de energizar',
          body: '<p>Repite esta lista antes de conectar la alimentación en cada práctica:</p><ul class="check"><li>La alimentación está desconectada mientras reviso.</li><li>Ningún cable une directamente + con −.</li><li>Cada LED tiene su resistencia en serie.</li><li>Los componentes polarizados están en el sentido correcto.</li><li>Ningún componente tiene sus dos patas en la misma tira.</li><li>La tensión de la fuente es la que pide la práctica.</li></ul>',
          activity: ['m1-g2', 'm1-g3'] }
      ],
      activities: [
        { id: 'm1-g1', type: 'mc', prompt: 'Al conectar tu circuito, el Arduino se apaga y una resistencia se calienta. ¿Qué haces primero?',
          options: [
            { id: 'a', text: 'Desconecto el USB y después busco el error', feedback: 'Primero se corta la alimentación; luego se diagnostica con calma.' },
            { id: 'b', text: 'Muevo cables hasta que se encienda', feedback: 'Mover cables con tensión puede crear nuevos cortocircuitos.' },
            { id: 'c', text: 'Toco la resistencia para ver cuánto se calienta', feedback: 'Podría quemarte. Desconecta primero.' }
          ], answer: 'a' },
        { id: 'm1-g2', type: 'tf', prompt: 'Verdadero o falso: un relé de 5 V permite controlar con seguridad un aparato conectado a 127 V aunque no tengas formación sobre instalaciones eléctricas.',
          answer: false,
          whyWrong: 'El relé aísla el circuito de control, pero los cables, bornes y contactos del lado de red siguen siendo peligrosos.',
          explain: 'Trabajar con tensión de red exige formación, aislamientos y protecciones. Queda fuera de este curso.' },
        { id: 'm1-g3', type: 'reflection', prompt: '¿Cuál de las reglas de seguridad crees que olvidarías con más facilidad y qué harás para recordarla?',
          model: 'Por ejemplo: "Desconectar antes de cablear". Para recordarlo, dejo el cable USB fuera de la mesa mientras monto y solo lo conecto después de revisar la lista de verificación.' }
      ]
    }
  );
})(typeof window !== 'undefined' ? window : globalThis);
