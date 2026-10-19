/* Cálculos de ley de Ohm, potencia y resistencias limitadoras. Funciones puras. */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});

  // Serie E12 normalizada (tolerancia ±10 %), la más común en kits de iniciación.
  const E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

  /** Resuelve la magnitud que falte a partir de dos conocidas. Unidades SI (V, A, Ω). */
  function solveOhm({ V, I, R }) {
    const known = [V, I, R].filter((x) => typeof x === 'number' && isFinite(x)).length;
    if (known < 2) throw new Error('Se necesitan dos valores conocidos.');
    if (V == null || !isFinite(V)) {
      if (R < 0 || I < 0) throw new Error('Los valores deben ser positivos.');
      V = I * R;
    } else if (I == null || !isFinite(I)) {
      if (R <= 0) throw new Error('La resistencia debe ser mayor que cero.');
      I = V / R;
    } else if (R == null || !isFinite(R)) {
      if (I <= 0) throw new Error('La corriente debe ser mayor que cero.');
      R = V / I;
    }
    return { V, I, R, P: V * I };
  }

  /** Resistencia mínima para un LED: R = (Vfuente − Vf) / I. */
  function ledResistor(Vsupply, Vf, I) {
    if (Vsupply <= Vf) throw new Error('La tensión de la fuente debe superar la tensión directa del LED.');
    if (I <= 0) throw new Error('La corriente debe ser mayor que cero.');
    return (Vsupply - Vf) / I;
  }

  /** Siguiente valor E12 igual o superior (elegir arriba protege al LED). */
  function nextE12(R) {
    if (!(R > 0)) return NaN;
    let decade = Math.pow(10, Math.floor(Math.log10(R)));
    for (let k = 0; k < 2; k++) {
      for (const base of E12) {
        const v = Math.round(base * decade * 1e6) / 1e6;
        if (v >= R - 1e-9) return v;
      }
      decade *= 10;
    }
    return NaN;
  }

  function seriesR(list) { return list.reduce((a, b) => a + b, 0); }
  function parallelR(list) { return 1 / list.reduce((a, b) => a + 1 / b, 0); }

  CB.ohm = { solveOhm, ledResistor, nextE12, seriesR, parallelR, E12 };
})(typeof window !== 'undefined' ? window : globalThis);
