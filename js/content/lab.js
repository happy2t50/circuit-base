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
      solutionText: 'R1 va del carril + (tp6) a b6; el ánodo del LED comparte la tira 6 (c6) y el cátodo va a c9; un cable une a9 con el carril −. Hay muchas otras colocaciones válidas: lo que importa es el camino 5V → resistencia → ánodo → cátodo → GND.',
      successText: 'La corriente sale del carril + (5V), atraviesa la resistencia, entra al LED por el ánodo, sale por el cátodo y vuelve a GND. Con 220 Ω y un LED rojo circularían unos 13,6 mA.',
      solution: { 'R1.1': 'tp6', 'R1.2': 'b6', 'LED1.A': 'c6', 'LED1.K': 'c9', 'J1.A': 'a9', 'J1.B': 'tn9' }
    },
    {
      id: 'lab-button',
      title: 'Pulsador que enciende un LED',
      goal: 'Con 5 V en el carril + y GND en el carril −, monta: carril + → pulsador → resistencia de 220 Ω → LED → carril −. Coloca el pulsador sobre el canal central y usa sus patas diagonales.',
      fixed: [{ label: '5V', hole: 'tp1', net: 'VCC' }, { label: 'GND', hole: 'tn3', net: 'GND' }],
      pieces: [
        { id: 'S1', kind: 'button', name: 'Pulsador', terminals: [{ id: '1', label: 'pata superior izquierda' }, { id: '2', label: 'pata inferior derecha (diagonal)' }] },
        { id: 'R1', kind: 'resistor', ohms: 220, name: 'Resistencia 220 Ω', terminals: [{ id: '1', label: 'pata 1' }, { id: '2', label: 'pata 2' }] },
        { id: 'LED1', kind: 'led', polarized: true, name: 'LED rojo', terminals: [{ id: 'A', label: 'ánodo (+, pata larga)' }, { id: 'K', label: 'cátodo (−, pata corta)' }] },
        { id: 'J1', kind: 'wire', name: 'Cable puente 1', optional: true, color: 'red', terminals: [{ id: 'A', label: 'extremo A' }, { id: 'B', label: 'extremo B' }] },
        { id: 'J2', kind: 'wire', name: 'Cable puente 2', optional: true, color: 'black', terminals: [{ id: 'A', label: 'extremo A' }, { id: 'B', label: 'extremo B' }] }
      ],
      check: 'netlist',
      nets: [['VCC', 'S1.1'], ['S1.2', 'R1.1'], ['R1.2', 'LED1.A'], ['LED1.K', 'GND']],
      solutionText: 'Un cable lleva el carril + a la tira 4 (tp4 → a4). El pulsador se apoya sobre el canal: pata en e4 y su diagonal en f6. La resistencia va de g6 a g10, el LED de h10 (ánodo) a h13 (cátodo), y un cable une i13 con el carril −.',
      successText: 'Con el pulsador presionado se cierra el camino 5V → pulsador → resistencia → LED → GND. Al soltarlo el circuito queda abierto y el LED se apaga.',
      solution: { 'J1.A': 'tp4', 'J1.B': 'a4', 'S1.1': 'e4', 'S1.2': 'f6', 'R1.1': 'g6', 'R1.2': 'g10', 'LED1.A': 'h10', 'LED1.K': 'h13', 'J2.A': 'i13', 'J2.B': 'tn13' }
    },
    {
      id: 'lab-parallel',
      title: 'Dos LED en paralelo',
      goal: 'Monta dos ramas en paralelo entre el carril + (5 V) y el carril − (GND). Cada rama lleva su propia resistencia de 220 Ω en serie con un LED.',
      fixed: [{ label: '5V', hole: 'tp1', net: 'VCC' }, { label: 'GND', hole: 'tn3', net: 'GND' }],
      pieces: [
        { id: 'R1', kind: 'resistor', ohms: 220, name: 'Resistencia R1', terminals: [{ id: '1', label: 'pata 1' }, { id: '2', label: 'pata 2' }] },
        { id: 'LED1', kind: 'led', polarized: true, name: 'LED 1 (rojo)', terminals: [{ id: 'A', label: 'ánodo (+)' }, { id: 'K', label: 'cátodo (−)' }] },
        { id: 'R2', kind: 'resistor', ohms: 220, name: 'Resistencia R2', terminals: [{ id: '1', label: 'pata 1' }, { id: '2', label: 'pata 2' }] },
        { id: 'LED2', kind: 'led', color: 'green', polarized: true, name: 'LED 2 (verde)', terminals: [{ id: 'A', label: 'ánodo (+)' }, { id: 'K', label: 'cátodo (−)' }] },
        { id: 'J1', kind: 'wire', name: 'Cable puente 1', optional: true, color: 'black', terminals: [{ id: 'A', label: 'extremo A' }, { id: 'B', label: 'extremo B' }] },
        { id: 'J2', kind: 'wire', name: 'Cable puente 2', optional: true, color: 'black', terminals: [{ id: 'A', label: 'extremo A' }, { id: 'B', label: 'extremo B' }] }
      ],
      check: 'netlist',
      nets: [['VCC', 'R1.1', 'R2.1'], ['R1.2', 'LED1.A'], ['R2.2', 'LED2.A'], ['LED1.K', 'LED2.K', 'GND']],
      solutionText: 'Rama 1: R1 de tp6 a b6, LED 1 de c6 a c9 y cable de a9 al carril −. Rama 2: R2 de tp14 a b14, LED 2 de c14 a c17 y cable de a17 al carril −. Las dos ramas solo comparten los carriles.',
      successText: 'Cada LED tiene su propio camino desde 5V hasta GND con su resistencia. Los dos reciben la misma tensión y cada rama limita su propia corriente.',
      solution: { 'R1.1': 'tp6', 'R1.2': 'b6', 'LED1.A': 'c6', 'LED1.K': 'c9', 'J1.A': 'a9', 'J1.B': 'tn9', 'R2.1': 'tp14', 'R2.2': 'b14', 'LED2.A': 'c14', 'LED2.K': 'c17', 'J2.A': 'a17', 'J2.B': 'tn17' }
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
