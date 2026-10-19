/* Estructura curricular. status: 'available' (completo), 'partial' (parte implementada), 'planned' (sin contenido aún).
 * Los módulos planeados se muestran con su temario y su estado; no tienen botones que lleven a pantallas vacías. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});

  CB.modules = [
    { id: 'm1', n: 1, title: 'Fundamentos de electricidad', status: 'available',
      summary: 'Qué ocurre dentro de un circuito y cómo se relacionan tensión, corriente y resistencia.',
      lessons: ['m1-electricidad', 'm1-magnitudes', 'm1-circuitos', 'm1-ohm', 'm1-potencia', 'm1-multimetro', 'm1-seguridad'] },
    { id: 'm2', n: 2, title: 'Identificación de componentes', status: 'partial',
      summary: 'Reconocer cada pieza, sus terminales, su polaridad y cómo comprobarla.',
      lessons: ['m2-identificar'], extras: [{ href: '#/componentes', label: 'Biblioteca de 16 componentes' }],
      pending: 'Lecciones dedicadas a transistores, relés y sensores (fase 8).' },
    { id: 'm3', n: 3, title: 'Cómo leer diagramas eléctricos', status: 'partial',
      summary: 'Símbolos, nodos, serie y paralelo, y el paso del esquema a la protoboard.',
      lessons: ['m3-diagramas'], extras: [{ href: '#/simbolos', label: 'Biblioteca de 21 símbolos' }],
      pending: 'Más ejercicios de interpretación con circuitos mixtos y esquemas de pines de módulos (fase 5).' },
    { id: 'm4', n: 4, title: 'Protoboard y montaje físico', status: 'partial',
      summary: 'Filas, columnas, carriles y cómo trasladar un esquema a la protoboard.',
      lessons: [], extras: [{ href: '#/laboratorio', label: 'Laboratorio: verificador de protoboard' }],
      pending: 'Lecciones y ejercicios con pulsador y LED en paralelo (fase 5).',
      topics: ['Distribución de filas y columnas', 'Conexiones internas', 'Carriles de alimentación', 'Puentes y jumpers', 'Conexión de pulsadores', 'Errores de conexión'] },
    { id: 'm5', n: 5, title: 'Primeros circuitos', status: 'planned',
      summary: 'Ocho prácticas ordenadas por dificultad, sin microcontrolador.',
      topics: ['Fuente, resistencia y LED', 'Variar la resistencia', 'Dos LED en serie', 'LED en paralelo', 'Pulsador y LED', 'Potenciómetro como divisor', 'Sensor sencillo', 'Zumbador'] },
    { id: 'm6', n: 6, title: 'Tinkercad Circuits', status: 'planned',
      summary: 'Simular circuitos y Arduino en el navegador antes de montarlos.',
      topics: ['Crear un circuito', 'Agregar Arduino', 'Cablear la protoboard', 'Simular y leer resultados', 'Diagnosticar fallos', 'Guardar y compartir'] },
    { id: 'm7', n: 7, title: 'Arduino desde cero', status: 'partial',
      summary: 'Microcontroladores, estructura de un programa y entradas y salidas.',
      lessons: [], extras: [{ href: '#/proyectos/a1-blink-externo', label: 'Práctica A1: LED externo en D8' }],
      pending: 'Lecciones de setup/loop, digitalRead, analogRead, PWM, monitor serie y depuración (fase 7).',
      topics: ['Qué es un microcontrolador', 'Pines digitales y analógicos', 'PWM', 'setup() y loop()', 'Variables, condicionales, bucles y funciones', 'Monitor serie'] },
    { id: 'm8', n: 8, title: 'Sensores y actuadores', status: 'planned',
      summary: 'Leer el mundo físico y actuar sobre él con seguridad.',
      topics: ['Pulsadores y potenciómetros', 'LDR', 'Temperatura', 'Distancia', 'Servomotores', 'Zumbadores', 'Pantallas', 'Relés y cargas'] },
    { id: 'm9', n: 9, title: 'Proyectos integradores', status: 'planned',
      summary: 'Siete proyectos completos con planificación, código, pruebas y evaluación.',
      topics: ['Semáforo', 'LED con pulsador', 'Luz automática con LDR', 'Medidor de distancia', 'Alarma', 'Servomotor', 'Proyecto final'] }
  ];

  CB.STATUS_LABEL = { available: 'Disponible', partial: 'En construcción', planned: 'Planeado' };
})(typeof window !== 'undefined' ? window : globalThis);
