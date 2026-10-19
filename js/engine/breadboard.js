/* Modelo de protoboard y verificador de conexiones.
 *
 * IMPORTANTE: esto NO es una simulación eléctrica. No calcula tensiones ni corrientes.
 * Determina qué terminales quedan unidos eléctricamente según la estructura interna
 * de una protoboard de media longitud y compara esa topología con la esperada.
 *
 * Modelo (media protoboard, 30 columnas):
 *  - Filas a–e de una columna forman una tira de 5 orificios conectados (bloque superior).
 *  - Filas f–j de una columna forman otra tira (bloque inferior). El canal central las separa.
 *  - Cuatro carriles de alimentación: "+" y "−" arriba, "+" y "−" abajo. Se modelan
 *    continuos de extremo a extremo. Algunas protoboards largas los tienen partidos a la
 *    mitad: compruébalo con el multímetro en la tuya.
 */
(function (root) {
  'use strict';
  const CB = (root.CB = root.CB || {});
  const COLS = 30;
  const ROWS_TOP = ['a', 'b', 'c', 'd', 'e'];
  const ROWS_BOTTOM = ['f', 'g', 'h', 'i', 'j'];
  const RAILS = ['tp', 'tn', 'bp', 'bn']; // top positive, top negative, bottom positive, bottom negative
  const RAIL_LABEL = { tp: 'carril + superior', tn: 'carril − superior', bp: 'carril + inferior', bn: 'carril − inferior' };

  /** Devuelve el identificador de la red interna a la que pertenece un orificio. */
  function baseNet(hole) {
    let m = /^([a-j])(\d{1,2})$/.exec(hole);
    if (m) {
      const col = +m[2];
      if (col < 1 || col > COLS) return null;
      return (ROWS_TOP.includes(m[1]) ? 'T' : 'B') + col;
    }
    m = /^(tp|tn|bp|bn)(\d{1,2})$/.exec(hole);
    if (m) {
      const pos = +m[2];
      if (pos < 1 || pos > COLS) return null;
      return 'R_' + m[1];
    }
    return null;
  }

  function describeHole(hole) {
    const m = /^([a-j])(\d{1,2})$/.exec(hole);
    if (m) return 'fila ' + m[1] + ', columna ' + m[2];
    const r = /^(tp|tn|bp|bn)(\d{1,2})$/.exec(hole);
    if (r) return RAIL_LABEL[r[1]] + ' (posición ' + r[2] + ')';
    return hole;
  }

  function describeNet(net) {
    if (!net) return 'sin conexión';
    if (net.startsWith('R_')) return RAIL_LABEL[net.slice(2)];
    return 'tira ' + (net[0] === 'T' ? 'a–e' : 'f–j') + ' de la columna ' + net.slice(1);
  }

  function allHoles() {
    const list = [];
    for (let c = 1; c <= COLS; c++) {
      ROWS_TOP.concat(ROWS_BOTTOM).forEach((r) => list.push(r + c));
      RAILS.forEach((r) => list.push(r + c));
    }
    return list;
  }

  /** Orificios que comparten red con el dado (para el modo de exploración). */
  function holesInSameNet(hole) {
    const n = baseNet(hole);
    return allHoles().filter((h) => baseNet(h) === n);
  }

  /* Unión-búsqueda para fusionar redes unidas por cables o fuentes fijas. */
  function makeUF() {
    const parent = {};
    const find = (x) => { if (parent[x] == null) parent[x] = x; while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra; };
    return { find, union };
  }

  /**
   * Evalúa un montaje.
   * @param exercise  { fixed: [{label, hole, net:'VCC'|'GND'}], pieces: [{id, kind, name, terminals:[{id,label,role}]}], check }
   * @param placement { 'R1.1': 'a5', 'LED1.A': 'b8', ... }
   * @returns { ok, errors:[{code, msg, fix, terminals}], netOf }
   */
  function evaluate(exercise, placement) {
    const errors = [];
    const uf = makeUF();
    const occupied = {};
    const fixedNets = {}; // nombre de red fija → red interna (p. ej. VCC → R_tp)

    exercise.fixed.forEach((f) => {
      const n = baseNet(f.hole);
      occupied[f.hole] = f.label;
      fixedNets[f.net] = fixedNets[f.net] ? (uf.union(fixedNets[f.net], n), fixedNets[f.net]) : n;
    });

    // 1. Terminales sin colocar y orificios repetidos
    exercise.pieces.forEach((p) => p.terminals.forEach((t) => {
      const key = p.id + '.' + t.id;
      const hole = placement[key];
      if (!hole) {
        if (!p.optional) errors.push({ code: 'unplaced', msg: 'Falta colocar: ' + p.name + ' — ' + t.label + '.', fix: 'Selecciona ese terminal en la lista y luego un orificio de la protoboard.', terminals: [key] });
        return;
      }
      if (!baseNet(hole)) errors.push({ code: 'bad-hole', msg: 'Orificio no válido: ' + hole, fix: 'Vuelve a colocar el terminal.', terminals: [key] });
      if (occupied[hole]) errors.push({ code: 'double', msg: 'Dos terminales en el mismo orificio (' + describeHole(hole) + ').', fix: 'Cada orificio admite una sola pata. Usa otro orificio de la misma tira: están conectados entre sí.', terminals: [key] });
      occupied[hole] = key;
    }));
    exercise.pieces.filter((p) => p.optional).forEach((p) => {
      const placed = p.terminals.filter((t) => placement[p.id + '.' + t.id]).length;
      if (placed > 0 && placed < p.terminals.length) {
        errors.push({ code: 'half-wire', msg: p.name + ' tiene un extremo colocado y el otro no.', fix: 'Coloca el otro extremo o quita el cable si no lo necesitas.', terminals: p.terminals.map((t) => p.id + '.' + t.id) });
      }
    });
    if (errors.length) return { ok: false, errors, netOf: () => null };

    // 2. Cables (piezas "wire") fusionan redes
    const pieceNet = (p, tId) => baseNet(placement[p.id + '.' + tId]);
    exercise.pieces.filter((p) => p.kind === 'wire').forEach((p) => {
      const a = placement[p.id + '.A'], b = placement[p.id + '.B'];
      if (a && b) uf.union(baseNet(a), baseNet(b));
    });
    const netOf = (key) => {
      if (fixedNets[key]) return uf.find(fixedNets[key]); // nombre de una conexión fija: 'VCC', 'GND', 'D8'…
      const hole = placement[key];
      return hole ? uf.find(baseNet(hole)) : null;
    };
    const VCC = fixedNets.VCC ? uf.find(fixedNets.VCC) : null;
    const GND = fixedNets.GND ? uf.find(fixedNets.GND) : null;

    // 3. Dos conexiones fijas distintas unidas entre sí (5V con GND, o dos pines de la placa)
    const names = Object.keys(fixedNets);
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        if (uf.find(fixedNets[names[i]]) === uf.find(fixedNets[names[j]])) {
          const la = labelOfFixed(exercise, names[i]), lb = labelOfFixed(exercise, names[j]);
          errors.push({ code: 'supply-short', msg: 'Cortocircuito: ' + la + ' y ' + lb + ' quedaron unidos directamente.', fix: 'Revisa los cables puente: ninguno debe unir esas dos conexiones (ni tiras que ya estén unidas a ellas). Entre 5V y GND esto calienta los cables y puede dañar la placa o la fuente; entre dos pines, uno puede forzar al otro.', terminals: [] });
        }
      }
    }
    if (errors.length) return { ok: false, errors, netOf };

    // 4. Componentes de dos patas con ambas en la misma red
    exercise.pieces.filter((p) => p.kind !== 'wire' && p.terminals.length === 2).forEach((p) => {
      const [t1, t2] = p.terminals;
      if (netOf(p.id + '.' + t1.id) === netOf(p.id + '.' + t2.id)) {
        errors.push({ code: 'shorted-part', msg: p.name + ' tiene sus dos patas unidas eléctricamente (' + describeNet(pieceNet(p, t1.id)) + ').', fix: 'Las patas de un componente deben ir en tiras distintas. Si ambas están en la misma tira, la corriente rodea al componente y este no hace nada.', terminals: p.terminals.map((t) => p.id + '.' + t.id) });
      }
    });
    if (errors.length) return { ok: false, errors, netOf };

    const check = CHECKS[exercise.check];
    if (!check) throw new Error('Verificación desconocida: ' + exercise.check);
    check(exercise, netOf, VCC, GND, errors);
    return { ok: errors.length === 0, errors, netOf };
  }

  function labelOfFixed(ex, netName) {
    const f = ex.fixed.find((x) => x.net === netName);
    return f ? f.label : netName;
  }

  /** Nombre legible de un miembro de una red esperada: conexión fija o terminal de pieza. */
  function memberLabel(ex, m) {
    if (ex.fixed.some((f) => f.net === m)) return 'la conexión ' + labelOfFixed(ex, m);
    const [pid, tid] = m.split('.');
    const p = ex.pieces.find((x) => x.id === pid);
    if (!p) return m;
    const t = p.terminals.find((x) => x.id === tid);
    return p.name + (p.terminals.length > 1 && t ? ' (' + t.label + ')' : '');
  }

  const CHECKS = {
    /**
     * Verificación general por lista de redes: exercise.nets = [[miembros que deben quedar unidos], …].
     * Un miembro es el nombre de una conexión fija ('VCC', 'GND', 'D8', 'A0'…) o 'PIEZA.terminal'.
     * Cada grupo debe formar una sola red y dos grupos distintos nunca pueden compartir red.
     * Para piezas polarizadas de dos patas detecta específicamente que estén invertidas.
     */
    netlist: function (ex, netOf, VCC, GND, errors) {
      const groups = ex.nets;
      const groupOf = (m) => groups.findIndex((g) => g.includes(m));
      const netsExcept = (gi, skip) => new Set(groups[gi].filter((m) => m !== skip).map(netOf));
      // a) Piezas polarizadas invertidas
      const reversed = new Set();
      ex.pieces.filter((p) => p.polarized && p.terminals.length === 2).forEach((p) => {
        const a = p.id + '.' + p.terminals[0].id, b = p.id + '.' + p.terminals[1].id;
        const ga = groupOf(a), gb = groupOf(b);
        if (ga < 0 || gb < 0) return;
        if (netsExcept(gb, b).has(netOf(a)) && netsExcept(ga, a).has(netOf(b))) {
          reversed.add(a); reversed.add(b);
          errors.push({ code: 'reversed', msg: p.name + ' está invertido: ' + p.terminals[0].label + ' y ' + p.terminals[1].label + ' están en el lugar del otro.', fix: p.reversedFix || 'Gíralo 180°. Los componentes polarizados solo funcionan en un sentido y algunos se dañan si se invierten.', terminals: [a, b] });
        }
      });
      // b) Miembros que deberían estar unidos y no lo están
      groups.forEach((g) => {
        const members = g.filter((m) => !reversed.has(m));
        if (members.length < 2) return;
        const count = {};
        members.forEach((m) => { const n = netOf(m); count[n] = (count[n] || 0) + 1; });
        // La red de referencia es la de una conexión fija si la hay; si no, la más repetida.
        const fixedMember = members.find((m) => !m.includes('.'));
        const ref = fixedMember ? netOf(fixedMember) : Object.keys(count).sort((x, y) => count[y] - count[x])[0];
        const refMember = members.find((m) => netOf(m) === ref);
        members.filter((m) => netOf(m) !== ref).forEach((m) => {
          errors.push({ code: 'missing-link', msg: memberLabel(ex, m) + ' debería estar conectado con ' + memberLabel(ex, refMember) + ' y no lo está.', fix: 'Colócalos en la misma tira (misma columna y mismo bloque) o únelos con un cable puente.', terminals: [m, refMember].filter((x) => x.includes('.')) });
        });
      });
      // c) Grupos distintos que comparten red (conexiones que sobran)
      for (let i = 0; i < groups.length; i++) {
        for (let j = i + 1; j < groups.length; j++) {
          const mi = groups[i].find((m) => !reversed.has(m) && groups[j].some((n) => !reversed.has(n) && netOf(n) === netOf(m)));
          if (mi === undefined) continue;
          const mj = groups[j].find((n) => netOf(n) === netOf(mi));
          errors.push({ code: 'extra-link', msg: memberLabel(ex, mi) + ' y ' + memberLabel(ex, mj) + ' están unidos y no deberían.', fix: 'Sepáralos: deben ir en tiras distintas. Revisa también los cables puente que los conectan.', terminals: [mi, mj].filter((x) => x.includes('.')) });
        }
      }
    },

    /** 5V → resistencia → LED (ánodo→cátodo) → GND, con la resistencia en cualquiera de los dos lados del LED. */
    'led-series': function (ex, netOf, VCC, GND, errors) {
      const R = [netOf('R1.1'), netOf('R1.2')];
      const A = netOf('LED1.A'), K = netOf('LED1.K');

      if (A === GND || K === VCC) {
        errors.push({ code: 'led-reversed', msg: 'El LED está invertido: su ánodo (pata larga) va hacia GND o su cátodo (pata corta, lado plano) hacia 5V.', fix: 'Gira el LED. La corriente debe entrar por el ánodo y salir por el cátodo. Un LED invertido no se enciende y, con tensiones altas, puede dañarse.', terminals: ['LED1.A', 'LED1.K'] });
        return;
      }
      if (A === VCC && K === GND) {
        errors.push({ code: 'no-resistor', msg: 'El LED está conectado directamente entre 5V y GND, sin resistencia en su camino.', fix: 'Coloca la resistencia en serie: una de sus patas en la misma tira que una pata del LED y la otra en el carril correspondiente. Sin ella la corriente solo la limita el propio LED y se quema.', terminals: ['LED1.A', 'LED1.K'] });
        return;
      }
      const rHasVcc = R.includes(VCC), rHasGnd = R.includes(GND);
      const other = (net) => (R[0] === net ? R[1] : R[0]);
      // Caso 1: resistencia arriba (5V → R → ánodo), cátodo a GND
      if (rHasVcc && other(VCC) === A && K === GND) return;
      // Caso 2: resistencia abajo (5V → ánodo, cátodo → R → GND)
      if (rHasGnd && other(GND) === K && A === VCC) return;

      // Diagnóstico de caminos abiertos
      if (!rHasVcc && A !== VCC) errors.push({ code: 'no-vcc', msg: 'Nada del circuito llega al carril + (5V).', fix: 'Una pata de la resistencia o el ánodo del LED debe estar en el carril + o en una tira unida a él con un cable.', terminals: [] });
      if (!rHasGnd && K !== GND) errors.push({ code: 'no-gnd', msg: 'El circuito no vuelve a GND: el camino está abierto.', fix: 'El cátodo del LED (o la resistencia, si la pusiste después del LED) debe llegar al carril − con un cable o directamente.', terminals: [] });
      if (rHasVcc && other(VCC) !== A) errors.push({ code: 'r-led-gap', msg: 'La resistencia y el ánodo del LED no comparten tira: entre ellos el circuito está abierto.', fix: 'Coloca el ánodo del LED en la misma tira (misma columna, mismo bloque) que la pata libre de la resistencia.', terminals: ['R1.1', 'R1.2', 'LED1.A'] });
      if (rHasGnd && other(GND) !== K && A === VCC) errors.push({ code: 'led-r-gap', msg: 'El cátodo del LED y la resistencia no comparten tira.', fix: 'Coloca la pata libre de la resistencia en la misma tira que el cátodo del LED.', terminals: ['R1.1', 'R1.2', 'LED1.K'] });
      if (!errors.length) errors.push({ code: 'topology', msg: 'Los componentes no forman un único camino cerrado 5V → resistencia → LED → GND.', fix: 'Sigue el recorrido con el dedo desde el carril + hasta el carril −: debes pasar por la resistencia y por el LED (de ánodo a cátodo) sin saltos.', terminals: [] });
    }
  };

  CB.breadboard = { COLS, ROWS_TOP, ROWS_BOTTOM, RAILS, baseNet, describeHole, describeNet, allHoles, holesInSameNet, evaluate };
})(typeof window !== 'undefined' ? window : globalThis);
