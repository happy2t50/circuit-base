/* MÓDULO 2 (lección de identificación) y MÓDULO 3 (lectura de diagramas). */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  CB.lessons = CB.lessons || [];

  CB.lessons.push(
    {
      id: 'm2-identificar', module: 'm2', title: 'Identificar componentes y su polaridad', minutes: 20,
      objectives: ['Distinguir componentes polarizados de no polarizados.', 'Identificar los terminales de LED, diodos y electrolíticos.', 'Leer el código de colores de una resistencia.'],
      slides: [
        { title: 'Antes de colocar cualquier pieza',
          body: '<p>Frente a un componente nuevo, responde tres preguntas:</p><ol><li><strong>¿Qué es?</strong> Por su forma, marcas e inscripciones.</li><li><strong>¿Cuáles son sus terminales?</strong> ¿Son intercambiables?</li><li><strong>¿Qué límites tiene?</strong> Tensión, corriente, potencia.</li></ol><p>La <a href="#/componentes">Biblioteca de componentes</a> responde estas preguntas para 16 piezas habituales.</p>' },
        { title: 'Polarizados y no polarizados',
          body: '<div class="two-col"><div><h4>Con polaridad</h4><p>Tienen un terminal positivo y uno negativo, o funciones fijas. Invertidos no funcionan o se dañan.</p><ul><li>LED y diodos</li><li>Condensadores electrolíticos</li><li>Pilas y fuentes</li><li>Zumbadores activos</li><li>Sensores con pines de alimentación</li></ul></div><div><h4>Sin polaridad</h4><p>Sus dos terminales son intercambiables.</p><ul><li>Resistencias</li><li>Condensadores cerámicos</li><li>Pulsadores e interruptores</li><li>LDR y termistores</li><li>Cables jumper</li></ul></div></div><p>Caso aparte: el <strong>transistor</strong> no se describe como "polarizado", pero base, colector y emisor no son intercambiables y su orden cambia según el modelo.</p>',
          activity: 'm2-a1' },
        { title: 'Terminales del LED',
          body: '<ul><li><strong>Ánodo (+)</strong>: pata larga.</li><li><strong>Cátodo (−)</strong>: pata corta y lado plano del borde de la cápsula.</li></ul><p>Si las patas están cortadas, el lado plano es la referencia más fiable. En caso de duda, comprueba con el modo diodo del multímetro.</p>',
          media: { component: 'led' }, activity: 'm2-a2' },
        { title: 'Código de colores de las resistencias',
          body: '<table class="units colors"><thead><tr><th>Color</th><th>Cifra</th><th>Multiplicador</th></tr></thead><tbody><tr><td><i class="sw" style="background:#111"></i>Negro</td><td>0</td><td>×1</td></tr><tr><td><i class="sw" style="background:#6d4c41"></i>Marrón</td><td>1</td><td>×10</td></tr><tr><td><i class="sw" style="background:#c62828"></i>Rojo</td><td>2</td><td>×100</td></tr><tr><td><i class="sw" style="background:#ef6c00"></i>Naranja</td><td>3</td><td>×1 k</td></tr><tr><td><i class="sw" style="background:#fdd835"></i>Amarillo</td><td>4</td><td>×10 k</td></tr><tr><td><i class="sw" style="background:#2e7d32"></i>Verde</td><td>5</td><td>×100 k</td></tr><tr><td><i class="sw" style="background:#1565c0"></i>Azul</td><td>6</td><td>×1 M</td></tr><tr><td><i class="sw" style="background:#7b1fa2"></i>Violeta</td><td>7</td><td>×10 M</td></tr><tr><td><i class="sw" style="background:#9e9e9e"></i>Gris</td><td>8</td><td>—</td></tr><tr><td><i class="sw" style="background:#fafafa"></i>Blanco</td><td>9</td><td>—</td></tr></tbody></table><p>En resistencias de 4 bandas: <strong>cifra, cifra, multiplicador, tolerancia</strong> (oro ±5 %, plata ±10 %). La banda de tolerancia va a la derecha.</p>',
          media: { component: 'resistencia' }, activity: 'm2-a3' },
        { title: 'Practica con la biblioteca',
          body: '<p>Cada ficha de la biblioteca incluye un ejercicio de identificación. Ábrela y resuelve al menos los de LED, condensador, pulsador y protoboard.</p><p><a class="btn" href="#/componentes">Abrir la biblioteca de componentes</a></p>',
          activity: 'm2-a4' }
      ],
      activities: [
        { id: 'm2-a1', type: 'mc', kind: 'component', prompt: '¿Cuál de estos componentes NO tiene polaridad?',
          options: [
            { id: 'a', text: 'LED', feedback: 'El LED es un diodo: polarizado.' },
            { id: 'b', text: 'Condensador electrolítico', feedback: 'Los electrolíticos están polarizados.' },
            { id: 'c', text: 'Resistencia', feedback: 'Correcto: sus dos patas son intercambiables.' },
            { id: 'd', text: 'Diodo 1N4007', feedback: 'Los diodos están polarizados: la franja marca el cátodo.' }
          ], answer: 'c' },
        { id: 'm2-a2', type: 'mc', kind: 'component', prompt: 'En la ilustración, ¿qué pata del LED debe ir hacia GND?', media: { component: 'led' },
          options: [
            { id: 'a', text: 'La pata larga', feedback: 'La pata larga es el ánodo (+): va hacia el positivo, a través de la resistencia.' },
            { id: 'b', text: 'La pata corta, junto al lado plano', feedback: 'Es el cátodo (−): por ahí sale la corriente hacia GND.' }
          ], answer: 'b' },
        { id: 'm2-a3', type: 'mc', kind: 'component', prompt: 'Una resistencia es marrón, negro, naranja, oro. ¿Qué valor tiene?',
          options: [
            { id: 'a', text: '10 kΩ ±5 %', feedback: 'Marrón 1, negro 0, naranja ×1 000 → 10 000 Ω. Es la típica de pull-down y divisores.' },
            { id: 'b', text: '1 kΩ ±5 %', feedback: 'Para 1 kΩ el multiplicador sería rojo (×100).' },
            { id: 'c', text: '103 Ω ±5 %', feedback: 'La tercera banda no es una cifra sino el multiplicador.' }
          ], answer: 'a' },
        { id: 'm2-a4', type: 'mc', kind: 'component', prompt: 'Un condensador cerámico lleva impreso "104". ¿Cuál es su capacidad?',
          options: [
            { id: 'a', text: '104 pF', feedback: 'El último dígito es el número de ceros: 10 seguido de 4 ceros.' },
            { id: 'b', text: '100 nF', feedback: '10 × 10⁴ pF = 100 000 pF = 100 nF = 0,1 µF.' },
            { id: 'c', text: '104 µF', feedback: 'Los cerámicos de este tipo están en el rango de pF a µF bajos; el código se lee en pF.' }
          ], answer: 'b' }
      ]
    },

    {
      id: 'm3-diagramas', module: 'm3', title: 'Cómo leer un diagrama eléctrico', minutes: 35,
      objectives: ['Reconocer los símbolos principales.', 'Distinguir uniones de cruces e identificar nodos.', 'Diferenciar serie de paralelo.', 'Seguir el recorrido de la corriente y detectar errores.', 'Pasar de un esquema a una protoboard.'],
      slides: [
        { title: 'Esquema eléctrico y montaje físico',
          body: '<p>Un <strong>esquema</strong> muestra <em>qué está conectado con qué</em>, usando símbolos. No indica la forma, el tamaño ni la posición real de las piezas.</p><p>Un <strong>montaje físico</strong> (o diagrama de conexiones) muestra dónde va cada pieza en la protoboard y cada cable.</p><p>Dos montajes con aspecto muy distinto pueden corresponder al mismo esquema. Lo que importa son las conexiones, no la geometría.</p>',
          more: '<p>Los <strong>esquemas de pines</strong> (pinouts) son un tercer tipo de diagrama: muestran qué función tiene cada pin de una placa o un circuito integrado. Los verás al final de esta lección.</p>' },
        { title: 'Símbolos',
          body: '<p>Cada componente tiene un símbolo normalizado. Verás dos estilos: IEC (resistencia como rectángulo) y ANSI (resistencia en zigzag). Ambos son correctos.</p><p>Explora todos en la <a href="#/simbolos">Biblioteca de símbolos</a>: al seleccionar uno verás su significado, comportamiento y terminales.</p>',
          activity: 'm3-a1' },
        { title: 'Líneas, uniones y cruces',
          body: '<p>Las líneas son conductores ideales: todos los puntos de una misma línea están a la misma tensión.</p><ul><li>Un <strong>punto</strong> en un cruce indica <strong>conexión</strong>.</li><li>Un cruce <strong>sin punto</strong> indica que los cables <strong>no se tocan</strong>.</li></ul><p>Un <strong>nodo</strong> es cualquier conjunto de puntos unidos por líneas, aunque el dibujo los separe.</p>',
          media: { diagram: 'junction-cross' }, activity: 'm3-a2' },
        { title: 'Alimentación y tierra',
          body: '<p>En lugar de dibujar todos los cables de alimentación, los esquemas usan etiquetas:</p><ul><li><strong>+5V / VCC</strong>: todos los símbolos con la misma etiqueta están conectados entre sí.</li><li><strong>GND</strong>: todos los símbolos de tierra están conectados, aunque no se dibuje el cable.</li></ul><p>Así un esquema grande queda legible. Al montarlo, tú sí tienes que poner esos cables.</p>',
          more: '<p>Entradas y salidas: en un esquema con Arduino, un pin configurado como <strong>salida</strong> impone una tensión (5 V o 0 V) al circuito conectado, por ejemplo un LED. Un pin de <strong>entrada</strong> solo observa la tensión que le llega, por ejemplo desde un pulsador o un sensor.</p>' },
        { title: 'Serie y paralelo',
          body: '<p><strong>Serie</strong>: los componentes van uno tras otro; solo hay un camino. Por todos pasa la <em>misma corriente</em>. R<sub>total</sub> = R1 + R2.</p><p><strong>Paralelo</strong>: cada componente está conectado entre los <em>mismos dos nodos</em>. Todos tienen la <em>misma tensión</em> y la corriente se reparte. 1/R<sub>total</sub> = 1/R1 + 1/R2.</p><p>Para reconocerlos no mires si "están uno al lado del otro" en el dibujo: mira entre qué nodos está cada componente.</p>',
          media: { diagram: 'series-parallel' }, activity: ['m3-a3', 'm3-a4', 'm3-a5'] },
        { title: 'Seguir el recorrido',
          body: '<p>Técnica para leer cualquier esquema:</p><ol><li>Localiza la fuente y su terminal positivo.</li><li>Con el dedo (o un lápiz), sigue la línea desde el + hasta el primer componente.</li><li>Atraviesa el componente y sigue hasta el siguiente nodo.</li><li>Repite hasta volver al terminal negativo o a GND.</li><li>Si en algún nodo el camino se divide, recorre cada rama por separado.</li></ol><p>Si no puedes volver al negativo, el circuito está abierto. Si llegas del + al − sin atravesar nada, hay un cortocircuito.</p>' },
        { title: 'Encuentra el error',
          body: '<p>Este circuito tiene un componente mal colocado y por eso no funciona. Recórrelo desde el + de la batería.</p>',
          media: { diagram: 'led-reversed' }, activity: 'm3-a6' },
        { title: 'Del esquema a la protoboard',
          body: '<p>Para montar el esquema de la práctica A1 (pin D8 → 220 Ω → LED → GND):</p><ol><li>Cada <strong>nodo</strong> del esquema se convierte en una <strong>tira</strong> de la protoboard (o un carril).</li><li>Cada componente se coloca con sus dos patas en las <strong>dos tiras</strong> de los nodos que une.</li><li>Los cables del Arduino llevan D8 y GND a sus tiras o carriles.</li></ol>',
          media: { diagram: 'arduino-led' }, activity: 'm3-a7' },
        { title: 'Esquema de pines del Arduino Uno R3',
          body: '<table class="units"><thead><tr><th>Pines</th><th>Función</th></tr></thead><tbody><tr><td>D0, D1</td><td>Digitales; también comunicación serie con el ordenador (RX/TX). Evítalos al principio.</td></tr><tr><td>D2–D13</td><td>Entradas/salidas digitales. D13 tiene el LED integrado "L".</td></tr><tr><td>~D3, ~D5, ~D6, ~D9, ~D10, ~D11</td><td>Además admiten PWM con analogWrite().</td></tr><tr><td>A0–A5</td><td>Entradas analógicas de 10 bits (0–1023). También sirven como digitales.</td></tr><tr><td>5V, 3.3V, GND, Vin</td><td>Alimentación. Vin: 7–12 V recomendados.</td></tr></tbody></table><p>Otras placas (Uno R4, Nano, Mega, ESP32) distribuyen y limitan sus pines de otra forma: consulta siempre el pinout de tu placa.</p>',
          activity: 'm3-a8' }
      ],
      activities: [
        { id: 'm3-a1', type: 'mc', kind: 'symbol', prompt: '¿Cuál de estos es el símbolo de un LED?',
          options: [
            { id: 'a', text: 'Diodo', svg: 'diode', feedback: 'Es un diodo rectificador: le faltan las flechas de luz que salen.' },
            { id: 'b', text: 'LED', svg: 'led', feedback: 'Triángulo y barra como un diodo, más dos flechas que salen: emite luz.' },
            { id: 'c', text: 'LDR', svg: 'ldr', feedback: 'Es una fotorresistencia: las flechas apuntan hacia dentro (recibe luz) y el cuerpo es una resistencia.' },
            { id: 'd', text: 'Condensador', svg: 'capacitor', feedback: 'Dos placas paralelas: es un condensador.' }
          ], answer: 'b', revealLabels: false },
        { id: 'm3-a2', type: 'tf', kind: 'diagram', prompt: 'Verdadero o falso: dos líneas que se cruzan sin un punto en el cruce están conectadas.',
          answer: false, whyWrong: 'Sin punto, cada cable sigue su camino.',
          explain: 'Solo el punto (nodo) indica conexión. Por eso muchos diseñadores evitan los cruces en forma de "+" con punto y usan uniones en "T".' },
        { id: 'm3-a3', type: 'hotspot', kind: 'diagram', prompt: 'En el circuito en paralelo (derecha), haz clic en un nodo donde la corriente se divide o se vuelve a juntar.',
          media: { diagram: 'series-parallel' }, answer: ['p-node-top', 'p-node-bottom'],
          feedback: {
            'p-node-top': 'En este nodo la corriente de la batería se reparte entre R1 y R2.',
            'p-node-bottom': 'Aquí las corrientes de R1 y R2 se vuelven a juntar para regresar a la batería.',
            'p-r1': 'R1 es un componente; la pregunta pide el punto de unión donde se reparte la corriente.',
            'p-r2': 'R2 es una de las ramas; busca el punto donde empiezan.',
            's-r1': 'Ese es el circuito en serie: allí no hay nodos que dividan la corriente.',
            's-r2': 'Ese es el circuito en serie: la corriente tiene un solo camino.'
          }, defaultFeedback: 'Busca un punto marcado con un círculo relleno en el circuito de la derecha.' },
        { id: 'm3-a4', type: 'numeric', kind: 'diagram', prompt: 'En el circuito en serie, R1 = 220 Ω y R2 = 330 Ω. ¿Resistencia total en Ω?', unit: 'Ω', answer: 550, tolerance: 0.005,
          solution: 'En serie se suman: 220 + 330 = 550 Ω.',
          mistakes: [{ value: 132, feedback: 'Aplicaste la fórmula de paralelo. En serie las resistencias simplemente se suman.' }],
          hint: 'Serie: Rtotal = R1 + R2.' },
        { id: 'm3-a5', type: 'numeric', kind: 'diagram', prompt: 'En el circuito en paralelo, R1 = R2 = 1 kΩ. ¿Resistencia total en Ω?', unit: 'Ω', answer: 500, tolerance: 0.005,
          solution: '1/Rt = 1/1000 + 1/1000 = 2/1000 → Rt = 500 Ω. Dos resistencias iguales en paralelo dan la mitad.',
          mistakes: [{ value: 2000, feedback: 'Las sumaste como en serie. En paralelo la resistencia total es menor que la menor de las ramas.' }, { value: 0.002, feedback: 'Ese es 1/Rt. Falta invertirlo: Rt = 1 ÷ 0,002.' }],
          hint: 'En paralelo hay más caminos: la resistencia total baja.' },
        { id: 'm3-a6', type: 'hotspot', kind: 'error', prompt: 'Haz clic en el componente que impide que este circuito funcione.',
          media: { diagram: 'led-reversed' }, answer: ['led1'],
          feedback: {
            led1: 'El LED está invertido: su barra (cátodo) apunta hacia el + de la batería. La corriente convencional llegaría por el cátodo y el LED la bloquea. Solución: girarlo para que el triángulo (ánodo) quede hacia R1.',
            r1: 'R1 está bien: 470 Ω limita la corriente a unos 15 mA cuando el LED conduce.',
            bat: 'La batería está bien conectada: su + va hacia R1.',
            'w-top': 'El cable superior une correctamente el + de la batería con R1.',
            'w-bottom': 'El cable de retorno está bien; el problema está en el sentido de un componente.'
          } },
        { id: 'm3-a7', type: 'order', kind: 'diagram', prompt: 'Ordena los pasos para montar este esquema en la protoboard, con el Arduino desconectado.',
          steps: [
            { id: 'p1', text: 'Comprueba que el Arduino está desconectado del USB.', why: 'Siempre se monta sin alimentación.' },
            { id: 'p2', text: 'Coloca la resistencia de 220 Ω entre dos tiras distintas.', why: 'La resistencia define las dos tiras (nodos) que usarás después.' },
            { id: 'p3', text: 'Coloca el LED: ánodo en la tira de la resistencia y cátodo en otra tira libre.', why: 'El ánodo debe compartir nodo con la resistencia, como en el esquema.' },
            { id: 'p4', text: 'Une con cables la tira libre de la resistencia con D8 y el cátodo con GND.', why: 'Los cables a la placa se ponen cuando los componentes ya están colocados.' },
            { id: 'p5', text: 'Revisa la lista de verificación y conecta el USB.', why: 'La alimentación es siempre el último paso.' }
          ],
          explain: 'Montar sin alimentación y conectarla al final, tras revisar, es el hábito que evita la mayoría de daños.' },
        { id: 'm3-a8', type: 'mc', kind: 'diagram', prompt: 'Quieres leer un potenciómetro con analogRead(). ¿A qué pin del Arduino Uno conectas su cursor?',
          options: [
            { id: 'a', text: 'D8', feedback: 'D8 es solo digital: leería 0 o 1, no valores intermedios.' },
            { id: 'b', text: 'A0', feedback: 'A0–A5 tienen conversor analógico-digital: devuelven de 0 a 1023.' },
            { id: 'c', text: '~D9', feedback: 'La "~" indica salida PWM, no entrada analógica.' }
          ], answer: 'b' }
      ]
    }
  );
})(typeof window !== 'undefined' ? window : globalThis);
