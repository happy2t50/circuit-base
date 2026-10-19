/* Fase 7 · MÓDULO 6 — Tinkercad Circuits.
 * La aplicación no tiene integración con Tinkercad: estas lecciones enseñan a usarlo en su web. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  CB.lessons = CB.lessons || [];
  const NOTE = '<p class="callout info">Circuito Base no abre, edita ni ejecuta proyectos de Tinkercad: no existe una integración. Trabajarás en <a href="https://www.tinkercad.com/circuits" target="_blank" rel="noopener">tinkercad.com/circuits</a> (enlace pendiente de verificación) con tu propia cuenta. Los nombres de menús descritos pueden cambiar con las actualizaciones del sitio.</p>';

  CB.lessons.push(
    {
      id: 'm6-tinkercad-intro', module: 'm6', title: 'Tu primer circuito en Tinkercad', minutes: 25,
      objectives: ['Crear un circuito y colocar componentes.', 'Cablear una protoboard virtual.', 'Ejecutar la simulación, leer resultados y diagnosticar fallos.'],
      slides: [
        { title: 'Qué es Tinkercad Circuits',
          body: '<p>Un simulador gratuito de Autodesk que funciona en el navegador. Permite montar circuitos en una protoboard virtual, alimentarlos, medir con un multímetro y programar un Arduino Uno sin hardware.</p><ul><li><strong>Ventajas</strong>: no se quema nada; puedes equivocarte y repetir; ves avisos de corriente excesiva.</li><li><strong>Límites</strong>: solo incluye ciertos componentes y modelos simplificados; no reproduce falsos contactos, ruido ni tolerancias reales.</li></ul>' + NOTE,
          activity: 'm6-a1' },
        { title: 'Crear un circuito y colocar componentes',
          body: '<ol><li>Inicia sesión y elige <strong>Circuitos → Crear nuevo circuito</strong>.</li><li>En el panel de componentes (a la derecha) busca por nombre: "resistencia", "LED", "placa de pruebas".</li><li>Arrastra cada pieza al área de trabajo.</li><li>Al seleccionar una pieza aparece su <strong>inspector</strong>: ahí cambias el valor de la resistencia, el color del LED o la tensión de la fuente.</li><li>Gira la pieza seleccionada con el botón de rotar (o la tecla R).</li></ol>' },
        { title: 'Cablear la protoboard',
          body: '<ul><li>Haz clic en un orificio o pin y luego en el destino: se crea un cable.</li><li>Haz clic en puntos intermedios para doblar el cable y que el montaje quede legible.</li><li>Cambia el color del cable en su inspector: usa la misma convención que en la vida real (rojo +, negro GND).</li><li>Al pasar el ratón sobre un orificio, Tinkercad resalta los orificios unidos con él: igual que el modo de exploración de nuestro laboratorio.</li></ul>' },
        { title: 'Simular y leer resultados',
          body: '<ol><li>Pulsa <strong>Iniciar simulación</strong>.</li><li>Los LED se encienden, los motores giran y los multímetros muestran su lectura.</li><li>Si un componente recibe demasiada corriente, Tinkercad muestra un aviso sobre él: pasa el ratón para leerlo.</li><li>Para medir, añade un <strong>Multímetro</strong> y elige su modo (tensión, corriente o resistencia) en el inspector. Las reglas son las mismas: tensión en paralelo, corriente en serie.</li></ol>',
          activity: 'm6-a2' },
        { title: 'Modificar y diagnosticar',
          body: '<p>Detén la simulación antes de cambiar el circuito, igual que desconectarías la pila. Rutina de diagnóstico:</p><ol><li>¿Hay aviso de sobrecorriente? Revisa la resistencia de ese componente.</li><li>¿No pasa nada? Mide tensión en cada nodo desde el + hacia el −: donde desaparece la tensión está el corte.</li><li>¿Un LED no enciende? Comprueba su sentido (en Tinkercad el ánodo es la pata doblada).</li></ol>',
          activity: 'm6-a3' }
      ],
      activities: [
        { id: 'm6-a1', type: 'tf', prompt: 'Verdadero o falso: si un circuito funciona en Tinkercad, funcionará igual en la protoboard real.', answer: false,
          whyWrong: 'El simulador no reproduce falsos contactos, componentes defectuosos ni tolerancias.',
          explain: 'Tinkercad sirve para validar la idea y el cableado; el montaje real siempre requiere su propia comprobación.' },
        { id: 'm6-a2', type: 'mc', prompt: 'En Tinkercad, quieres medir la corriente de un LED con el multímetro. ¿Cómo lo conectas?',
          options: [
            { id: 'a', text: 'En modo corriente, en serie con el LED', feedback: 'Las reglas del simulador son las del mundo real.' },
            { id: 'b', text: 'En modo corriente, en paralelo con el LED', feedback: 'En paralelo el amperímetro desvía la corriente; el simulador lo mostrará como un fallo.' },
            { id: 'c', text: 'En modo tensión, en serie', feedback: 'En modo tensión el multímetro tiene resistencia muy alta: en serie abriría el circuito.' }
          ], answer: 'a' },
        { id: 'm6-a3', type: 'order', prompt: 'Ordena el procedimiento para encontrar por qué un LED no enciende en la simulación.',
          steps: [
            { id: 't1', text: 'Detén la simulación.', why: 'Se diagnostica con el circuito detenido, como desconectarías la pila.' },
            { id: 't2', text: 'Revisa que el LED tenga el ánodo (pata doblada) hacia el +.', why: 'Es la causa más frecuente y la más rápida de comprobar.' },
            { id: 't3', text: 'Coloca un multímetro en modo tensión y reinicia la simulación.', why: 'Para medir hay que simular de nuevo.' },
            { id: 't4', text: 'Mide nodo a nodo desde el + hasta encontrar dónde desaparece la tensión.', why: 'El punto donde cae a 0 V marca el corte.' }
          ],
          explain: 'Primero lo más probable y barato de comprobar; después la medición sistemática.' }
      ]
    },
    {
      id: 'm6-tinkercad-arduino', module: 'm6', title: 'Arduino en Tinkercad: código, depuración y compartir', minutes: 25,
      objectives: ['Añadir un Arduino Uno y programarlo en modo texto.', 'Usar el monitor serie y el depurador del simulador.', 'Guardar y compartir un proyecto.'],
      slides: [
        { title: 'Agregar una placa Arduino',
          body: '<ol><li>Busca "Arduino Uno R3" en el panel de componentes y arrástralo.</li><li>Cablea desde sus pines (5V, GND, D8…) hasta la protoboard.</li><li>Pulsa <strong>Código</strong>: se abre el editor junto al circuito.</li></ol><p>Tinkercad también ofrece circuitos de ejemplo ya montados (en "Básicos" y "Arduino"). Úsalos para comparar con tu montaje.</p>' + NOTE },
        { title: 'Consultar y modificar el código',
          body: '<p>El editor tiene tres modos: <strong>Bloques</strong>, <strong>Bloques + Texto</strong> y <strong>Texto</strong>. Para este curso usa <strong>Texto</strong>: es el mismo lenguaje que el Arduino IDE.</p><ul><li>Al cambiar de bloques a texto, Tinkercad avisa de que se perderán los bloques.</li><li>Pega el código de una práctica y pulsa Iniciar simulación: se compila y se ejecuta.</li><li>Los errores de compilación aparecen debajo del editor con el número de línea.</li></ul>',
          activity: 'm6-b1' },
        { title: 'Monitor serie y depurador',
          body: '<ul><li>El botón <strong>Monitor serie</strong> (debajo del editor) muestra lo que imprimes con <code>Serial.println()</code>, igual que el del IDE.</li><li>En modo texto hay un <strong>depurador</strong>: haz clic junto a un número de línea para poner un punto de interrupción y la simulación se detendrá allí para que veas el valor de las variables.</li></ul><p>Imprimir valores es la técnica de depuración más útil, tanto en el simulador como en la placa real.</p>',
          activity: 'm6-b2' },
        { title: 'Guardar y compartir',
          body: '<ul><li>Tinkercad guarda los cambios automáticamente en tu cuenta. Pon un nombre claro al proyecto (por ejemplo, "A1 LED en D8").</li><li>Con <strong>Compartir</strong> puedes invitar a otras personas o generar un enlace; revisa la privacidad del proyecto antes de compartirlo.</li><li>El código se puede descargar como archivo <code>.ino</code> para abrirlo en el Arduino IDE y cargarlo en una placa real.</li></ul>',
          activity: 'm6-b3' }
      ],
      activities: [
        { id: 'm6-b1', type: 'mc', prompt: '¿Por qué conviene usar el modo Texto en lugar de Bloques en este curso?',
          options: [
            { id: 'a', text: 'Porque el código es el mismo que usarás en el Arduino IDE con una placa real', feedback: 'Lo que escribes en Texto se puede copiar tal cual al IDE.' },
            { id: 'b', text: 'Porque los bloques no pueden encender LED', feedback: 'Los bloques sí pueden; simplemente no se trasladan directamente al IDE.' }
          ], answer: 'a' },
        { id: 'm6-b2', type: 'tf', prompt: 'Verdadero o falso: si el monitor serie de Tinkercad no muestra nada, puede faltar Serial.begin(9600) en setup().', answer: true,
          whyWrong: 'Sí es una causa: sin Serial.begin() no se inicia la comunicación serie.',
          explain: 'Sin Serial.begin() no se envía nada. También revisa que la simulación esté en marcha.' },
        { id: 'm6-b3', type: 'reflection', prompt: 'Crea en Tinkercad el circuito de la práctica E1, compártelo con un compañero y anota qué problema encontraste al reproducirlo.',
          model: 'Ejemplo: "Al principio el LED no encendía porque coloqué la pata doblada hacia GND. Al girarlo funcionó. Compartí el enlace con permiso de solo lectura."' }
      ]
    }
  );
})(typeof window !== 'undefined' ? window : globalThis);
