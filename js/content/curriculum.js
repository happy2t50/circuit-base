/* Estructura curricular. status: 'available' (completo), 'partial' (parte implementada), 'planned' (sin contenido aún).
 * Los módulos planeados se muestran con su temario y su estado; no tienen botones que lleven a pantallas vacías. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});

  CB.modules = [
    { id: 'm1', n: 1, title: 'Fundamentos de electricidad', status: 'available',
      summary: 'Qué ocurre dentro de un circuito y cómo se relacionan tensión, corriente y resistencia.',
      lessons: ['m1-electricidad', 'm1-magnitudes', 'm1-circuitos', 'm1-ohm', 'm1-potencia', 'm1-multimetro', 'm1-seguridad'] },
    { id: 'm2', n: 2, title: 'Identificación de componentes', status: 'available',
      summary: 'Reconocer cada pieza, sus terminales, su polaridad y cómo comprobarla.',
      lessons: ['m2-identificar', 'm2-activos'], extras: [{ href: '#/componentes', label: 'Biblioteca de 16 componentes' }] },
    { id: 'm3', n: 3, title: 'Cómo leer diagramas eléctricos', status: 'available',
      summary: 'Símbolos, nodos, serie y paralelo, circuitos mixtos, esquemas de pines y el paso del esquema a la protoboard.',
      lessons: ['m3-diagramas', 'm3-interpretar'], extras: [{ href: '#/simbolos', label: 'Biblioteca de 21 símbolos' }] },
    { id: 'm4', n: 4, title: 'Protoboard y montaje físico', status: 'available',
      summary: 'Filas, columnas, carriles y cómo trasladar un esquema a la protoboard sin errores.',
      lessons: ['m4-protoboard', 'm4-montaje'], extras: [{ href: '#/laboratorio', label: 'Laboratorio: verificador de protoboard (3 ejercicios)' }] },
    { id: 'm5', n: 5, title: 'Primeros circuitos', status: 'available',
      summary: 'Ocho prácticas ordenadas por dificultad, sin microcontrolador.', lessons: [] },
    { id: 'm6', n: 6, title: 'Tinkercad Circuits', status: 'available',
      summary: 'Simular circuitos y Arduino en el navegador antes de montarlos.',
      lessons: ['m6-tinkercad-intro', 'm6-tinkercad-arduino'] },
    { id: 'm7', n: 7, title: 'Arduino desde cero', status: 'available',
      summary: 'Microcontroladores, estructura de un programa, entradas, salidas, PWM y depuración.',
      lessons: ['m7-microcontrolador', 'm7-estructura', 'm7-entradas', 'm7-analogico', 'm7-programacion'] },
    { id: 'm8', n: 8, title: 'Sensores y actuadores', status: 'available',
      summary: 'Leer el mundo físico y actuar sobre él con seguridad.',
      lessons: ['m8-sensores-analogicos', 'm8-distancia', 'm8-actuadores', 'm8-pantallas-reles'] },
    { id: 'm9', n: 9, title: 'Proyectos integradores', status: 'available',
      summary: 'Siete proyectos completos con planificación, código, pruebas y evaluación.', lessons: [] }
  ];

  CB.STATUS_LABEL = { available: 'Disponible', partial: 'En construcción', planned: 'Planeado' };
})(typeof window !== 'undefined' ? window : globalThis);
