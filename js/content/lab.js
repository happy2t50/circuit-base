/* Ejercicios del laboratorio de protoboard. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});

  CB.labExercises = [
    {
      id: 'lab-led',
      title: 'LED con resistencia limitadora',
      goal: 'Monta un LED rojo con una resistencia de 220 Ω entre el carril + (5 V) y el carril − (GND). Los cables de la placa ya están conectados a los carriles superiores.',
      fixed: [{ label: '5V', hole: 'tp1', net: 'VCC' }, { label: 'GND', hole: 'tn3', net: 'GND' }],
      pieces: [
        { id: 'R1', kind: 'resistor', name: 'Resistencia 220 Ω', terminals: [{ id: '1', label: 'pata 1' }, { id: '2', label: 'pata 2' }] },
        { id: 'LED1', kind: 'led', name: 'LED rojo', terminals: [{ id: 'A', label: 'ánodo (+, pata larga)' }, { id: 'K', label: 'cátodo (−, pata corta)' }] },
        { id: 'J1', kind: 'wire', name: 'Cable puente 1', optional: true, color: 'red', terminals: [{ id: 'A', label: 'extremo A' }, { id: 'B', label: 'extremo B' }] },
        { id: 'J2', kind: 'wire', name: 'Cable puente 2', optional: true, color: 'black', terminals: [{ id: 'A', label: 'extremo A' }, { id: 'B', label: 'extremo B' }] }
      ],
      check: 'led-series',
      // Un montaje correcto de referencia: se usa en las pruebas y en el botón "Ver una solución".
      solution: { 'R1.1': 'tp6', 'R1.2': 'b6', 'LED1.A': 'c6', 'LED1.K': 'c9', 'J1.A': 'a9', 'J1.B': 'tn9' }
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
