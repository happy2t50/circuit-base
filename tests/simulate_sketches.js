/* Simulación del comportamiento de los sketches en un ATmega328P emulado (avr8js, MIT, de Wokwi).
 *
 * Ejecuta el .hex que produce tests/compile_sketches.py (con HEX_DIR=build-hex) instrucción por
 * instrucción, con los temporizadores, el conversor analógico, el puerto serie y el bus I²C del
 * chip, y comprueba lo que haría el circuito real: tiempos de parpadeo, ciclo de trabajo PWM,
 * frecuencia de tone(), ancho de pulso del servo, texto del monitor serie y de la pantalla LCD.
 * Los periféricos externos (pulsador, potenciómetro, LDR, TMP36, HC-SR04, LCD con PCF8574)
 * se emulan desde la prueba.
 *
 * No sustituye a montar el circuito: no detecta cables mal puestos ni componentes dañados.
 * Uso: npm run simular   (requiere `npm install` y la carpeta build-hex con los .hex)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('avr8js');

const HEX_DIR = process.env.HEX_DIR || path.join(__dirname, '..', 'build-hex');
const F_CPU = 16e6;
const MS = F_CPU / 1000;
const US = F_CPU / 1e6;

/* ------------------------------------------------------------------ Placa Arduino Uno emulada */
function loadHex(file) {
  const program = new Uint16Array(0x8000 / 2);
  const bytes = new Uint8Array(program.buffer);
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (line[0] !== ':') continue;
    const n = parseInt(line.substr(1, 2), 16), addr = parseInt(line.substr(3, 4), 16), type = parseInt(line.substr(7, 2), 16);
    if (type !== 0) continue;
    for (let i = 0; i < n; i++) bytes[addr + i] = parseInt(line.substr(9 + i * 2, 2), 16);
  }
  return program;
}

class Uno {
  constructor(key) {
    const file = path.join(HEX_DIR, key + '.hex');
    if (!fs.existsSync(file)) throw new Error('Falta ' + file + ': ejecuta antes tests/compile_sketches.py con HEX_DIR');
    this.cpu = new A.CPU(loadHex(file));
    this.timers = [A.timer0Config, A.timer1Config, A.timer2Config].map((c) => new A.AVRTimer(this.cpu, c));
    this.ports = { B: new A.AVRIOPort(this.cpu, A.portBConfig), C: new A.AVRIOPort(this.cpu, A.portCConfig), D: new A.AVRIOPort(this.cpu, A.portDConfig) };
    this.serial = '';
    this.usart = new A.AVRUSART(this.cpu, A.usart0Config, F_CPU);
    this.usart.onByteTransmit = (b) => { this.serial += String.fromCharCode(b); };
    this.adc = new A.AVRADC(this.cpu, A.adcConfig);
    this.twi = new A.AVRTWI(this.cpu, A.twiConfig, F_CPU);
    this.log = []; // { t (ciclos), pin, high }
    this.last = {};
    for (const [name, port] of Object.entries(this.ports)) {
      port.addListener(() => this._sample(name));
    }
  }
  /** Arduino → puerto y bit: D0–D7 = PD0–7, D8–D13 = PB0–5, A0–A5 (14–19) = PC0–5. */
  static map(pin) {
    if (typeof pin === 'string') pin = 14 + parseInt(pin.slice(1), 10);
    if (pin <= 7) return ['D', pin];
    if (pin <= 13) return ['B', pin - 8];
    return ['C', pin - 14];
  }
  _sample(portName) {
    for (let pin = 0; pin <= 19; pin++) {
      const [p, bit] = Uno.map(pin);
      if (p !== portName) continue;
      const high = this.ports[p].pinState(bit) === A.PinState.High;
      if (this.last[pin] === undefined) { this.last[pin] = high; if (high) this.log.push({ t: this.cpu.cycles, pin, high }); continue; } // estado inicial: no es un flanco
      if (this.last[pin] !== high) { this.last[pin] = high; this.log.push({ t: this.cpu.cycles, pin, high }); }
    }
  }
  isHigh(pin) { const [p, bit] = Uno.map(pin); return this.ports[p].pinState(bit) === A.PinState.High; }
  /** Entrada externa: true = el circuito lleva el pin a 5 V; false = a GND. */
  input(pin, high) { const [p, bit] = Uno.map(pin); this.ports[p].setPin(bit, high); }
  analog(ch, volts) { this.adc.channelValues[ch] = volts; }
  get ms() { return this.cpu.cycles / MS; }
  runMs(ms) {
    const end = this.cpu.cycles + Math.round(ms * MS);
    const cpu = this.cpu;
    while (cpu.cycles < end) { A.avrInstruction(cpu); cpu.tick(); }
  }
  /** Transiciones de un pin entre dos instantes (ms). */
  edges(pin, fromMs, toMs) {
    return this.log.filter((e) => e.pin === pin && e.t >= fromMs * MS && e.t <= toMs * MS);
  }
  /** Fracción del tiempo en HIGH entre dos instantes (ms). */
  duty(pin, fromMs, toMs) {
    const a = fromMs * MS, b = toMs * MS;
    let state = false, t = a, high = 0;
    for (const e of this.log) {
      if (e.pin !== pin) continue;
      if (e.t <= a) { state = e.high; continue; }
      if (e.t > b) break;
      if (state) high += e.t - t;
      t = e.t; state = e.high;
    }
    if (state) high += b - t;
    return high / (b - a);
  }
  /** Frecuencia media de una señal (flancos de subida) entre dos instantes (ms). */
  freq(pin, fromMs, toMs) {
    const rises = this.edges(pin, fromMs, toMs).filter((e) => e.high);
    if (rises.length < 3) return 0;
    return (rises.length - 1) / ((rises[rises.length - 1].t - rises[0].t) / F_CPU);
  }
  /** Anchos de pulso en HIGH (µs) entre dos instantes (ms). */
  pulses(pin, fromMs, toMs) {
    const out = []; let start = null;
    for (const e of this.edges(pin, fromMs, toMs)) {
      if (e.high) start = e.t; else if (start !== null) { out.push((e.t - start) / US); start = null; }
    }
    return out;
  }
}

/* ------------------------------------------------------------------ Periféricos emulados */
/** HC-SR04: tras un pulso en Trig de ≥10 µs, pone Echo en HIGH el tiempo de ida y vuelta. */
function hcsr04(uno, trig, echo, getDistanceCm) {
  let riseAt = null;
  uno.input(echo, false);
  const [tp, tbit] = Uno.map(trig);
  uno.ports[tp].addListener(() => {
    const high = uno.ports[tp].pinState(tbit) === A.PinState.High;
    if (high && riseAt === null) riseAt = uno.cpu.cycles;
    if (!high && riseAt !== null) {
      const width = (uno.cpu.cycles - riseAt) / US; riseAt = null;
      const d = getDistanceCm();
      if (width < 9.5 || d === null) return; // sin eco
      const echoUs = (d * 2) / 0.0343;
      uno.cpu.addClockEvent(() => {
        uno.input(echo, true);
        uno.cpu.addClockEvent(() => uno.input(echo, false), Math.round(echoUs * US));
      }, Math.round(450 * US)); // el sensor emite la ráfaga antes de levantar Echo
    }
  });
}

/** LCD HD44780 con adaptador PCF8574 (P0=RS, P2=E, P4–P7=D4–D7) en 4 bits. Devuelve las líneas. */
function lcdI2C(uno, address) {
  const lcd = { lines: [Array(16).fill(' '), Array(16).fill(' ')], col: 0, row: 0, nibble: null, acked: false, initialized: false };
  let prev = 0, current = null;
  uno.twi.eventHandler = {
    start() { uno.twi.completeStart(); },
    stop() { uno.twi.completeStop(); },
    connectToSlave(addr) { current = addr; uno.twi.completeConnect(addr === address); },
    readByte() { uno.twi.completeRead(0xff); },
    writeByte(v) {
      if (current === address) {
        if ((prev & 0x04) && !(v & 0x04)) { // flanco de bajada de E: se captura el medio byte
          const nib = (v >> 4) & 0x0f, rs = v & 0x01;
          if (lcd.nibble === null) lcd.nibble = nib;
          else {
            const byte = (lcd.nibble << 4) | nib; lcd.nibble = null;
            if (rs) { if (lcd.col < 16) lcd.lines[lcd.row][lcd.col] = String.fromCharCode(byte); lcd.col++; }
            else if (byte & 0x80) { const a = byte & 0x7f; lcd.row = a >= 0x40 ? 1 : 0; lcd.col = a & 0x3f; }
            else if (byte === 0x01) { lcd.lines = [Array(16).fill(' '), Array(16).fill(' ')]; lcd.col = 0; lcd.row = 0; }
            else if (byte === 0x28) { lcd.initialized = true; }
          }
        }
        prev = v;
      }
      uno.twi.completeWrite(current === address);
    }
  };
  return { text: (r) => lcd.lines[r].join('').trimEnd(), state: lcd };
}

/* ------------------------------------------------------------------ Escenarios */
const results = [];
function check(name, cond, detail) {
  results.push({ name, ok: !!cond });
  console.log((cond ? 'OK    ' : 'FALLO ') + name + (detail !== undefined ? '  — ' + detail : ''));
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const fx = (n, d = 1) => Number(n).toFixed(d);

/** Periodos alternos (ms) de un pin a partir de sus flancos. */
function halfPeriods(uno, pin, fromMs, toMs) {
  const e = uno.edges(pin, fromMs, toMs);
  const out = [];
  for (let i = 1; i < e.length; i++) out.push((e[i].t - e[i - 1].t) / MS);
  return out;
}

const scenarios = {
  'A1': () => {
    const u = new Uno('A1'); u.runMs(2600);
    const hp = halfPeriods(u, 8, 0, 2600);
    check('A1: D8 alterna cada 500 ms (LED 1 vez por segundo)', hp.length >= 4 && hp.every((h) => near(h, 500, 3)), hp.map((h) => fx(h)).join(', ') + ' ms');
  },
  'm7-microcontrolador-5': () => {
    const u = new Uno('m7-microcontrolador-5'); u.runMs(4200);
    const hp = halfPeriods(u, 13, 0, 4200);
    check('Blink (lección M7): LED "L" en D13 cada 1000 ms', hp.length >= 3 && hp.every((h) => near(h, 1000, 3)), hp.map((h) => fx(h)).join(', ') + ' ms');
  },
  'm7-estructura-3': () => {
    const u = new Uno('m7-estructura-3'); u.runMs(1700);
    const hp = halfPeriods(u, 8, 0, 1700);
    check('Tipos de datos (lección M7): D8 alterna cada 500 ms', hp.length >= 2 && hp.every((h) => near(h, 500, 3)), hp.map((h) => fx(h)).join(', ') + ' ms');
  },
  'A2': () => {
    for (const key of ['A2', 'm7-entradas-2']) {
      const u = new Uno(key);
      u.input(2, true); u.runMs(20); const off = !u.isHigh(8);
      u.input(2, false); u.runMs(20); const on = u.isHigh(8);
      u.input(2, true); u.runMs(20); const offAgain = !u.isHigh(8);
      check(key + ': LED en D8 encendido solo con el pulsador presionado (D2 a GND)', off && on && offAgain, `suelto=${!off ? 'ON' : 'OFF'}, presionado=${on ? 'ON' : 'OFF'}, suelto=${!offAgain ? 'ON' : 'OFF'}`);
    }
  },
  'A3': () => {
    const u = new Uno('A3'); u.analog(0, 2.5); u.runMs(300);
    const m = u.serial.match(/Lectura: (\d+)\s+Tension: ([\d.]+) V/);
    check('A3: con 2,5 V en A0 el monitor serie muestra ≈512 y 2,50 V', m && near(+m[1], 511.5, 1.5) && near(+m[2], 2.5, 0.011), m ? m[0] : JSON.stringify(u.serial.slice(0, 80)));
    const u2 = new Uno('A3'); u2.analog(0, 5); u2.runMs(300);
    check('A3: con 5 V en A0 lee 1023 y 5,00 V', /Lectura: 1023\s+Tension: 5\.00 V/.test(u2.serial), u2.serial.split('\n')[0]);
  },
  'A4': () => {
    const u = new Uno('A4'); u.runMs(2200);
    const d = [100, 400, 700, 1000, 1300, 1600, 1900].map((t) => u.duty(9, t, t + 20));
    const up = d[0] < d[1] && d[1] < d[2], down = d[4] > d[5] && d[5] > d[6];
    check('A4: el ciclo de trabajo PWM en D9 sube durante ≈1 s y luego baja', up && down, d.map((x) => fx(x * 100, 0) + ' %').join(' → '));
    check('A4: frecuencia PWM de D9 ≈ 490 Hz', near(u.freq(9, 300, 900), 490, 5), fx(u.freq(9, 300, 900)) + ' Hz');
  },
  'm7-analogico-3': () => {
    for (const [v, expect] of [[0, 0], [2.5, 0.5], [5, 1]]) {
      const u = new Uno('m7-analogico-3'); u.analog(0, v); u.runMs(60);
      const duty = u.duty(9, 30, 60);
      check(`Potenciómetro → PWM (lección M7): ${v} V en A0 da ${expect * 100} % en D9`, near(duty, expect, 0.02), fx(duty * 100) + ' %');
    }
  },
  'm7-programacion-1': () => {
    const u = new Uno('m7-programacion-1'); u.runMs(700);
    check('Bucles y funciones (lección M7): imprime sumar(2, 3) = 5', /^5\r?\n/.test(u.serial), JSON.stringify(u.serial.slice(0, 10)));
    const firsts = [2, 3, 4].map((p) => (u.edges(p, 0, 700).find((e) => e.high) || {}).t / MS);
    check('Bucles y funciones: D2, D3 y D4 se encienden en orden, 200 ms cada uno', near(firsts[1] - firsts[0], 200, 2) && near(firsts[2] - firsts[1], 200, 2), firsts.map((x) => fx(x)).join(' / ') + ' ms');
  },
  'm7-programacion-3': () => {
    const u = new Uno('m7-programacion-3'); u.runMs(2100);
    const hp = halfPeriods(u, 8, 0, 2100);
    check('millis() (lección M7): D8 alterna cada 500 ms sin delay()', hp.length >= 3 && hp.every((h) => near(h, 500, 2)), hp.map((h) => fx(h)).join(', ') + ' ms');
    check('millis(): el monitor serie muestra "Inicio" y el estado del LED', /Inicio/.test(u.serial) && /LED: encendido/.test(u.serial) && /LED: apagado/.test(u.serial));
  },
  'P1': () => {
    const u = new Uno('P1'); u.runMs(12600);
    const at = (t) => [2, 3, 4].filter((p) => u.duty(p, t, t + 1) > 0.99);
    const seq = [[100, [4]], [4900, [4]], [5100, [3]], [6900, [3]], [7100, [2]], [11900, [2]], [12100, [4]]];
    const ok = seq.every(([t, exp]) => JSON.stringify(at(t)) === JSON.stringify(exp));
    check('P1: secuencia verde 5 s → amarillo 2 s → rojo 5 s → verde, un solo LED a la vez', ok, seq.map(([t]) => fx(t / 1000) + ' s: D' + at(t).join('+D')).join(', '));
    let overlap = false;
    for (let t = 0; t < 12500; t += 25) if (at(t).length > 1) overlap = true;
    check('P1: nunca hay dos LED encendidos a la vez (muestreo cada 25 ms)', !overlap);
  },
  'P2': () => {
    const u = new Uno('P2'); u.input(2, true); u.runMs(100);
    const states = [];
    for (let i = 0; i < 4; i++) {
      // Pulsación con rebotes: 6 cambios en 3 ms antes de quedarse presionado
      for (let b = 0; b < 6; b++) { u.input(2, b % 2 === 1); u.runMs(0.5); }
      u.input(2, false); u.runMs(150);
      for (let b = 0; b < 6; b++) { u.input(2, b % 2 === 0); u.runMs(0.5); }
      u.input(2, true); u.runMs(150);
      states.push(u.isHigh(8));
    }
    check('P2: cada pulsación (con rebotes) cambia el LED exactamente una vez', JSON.stringify(states) === '[true,false,true,false]', states.map((s) => (s ? 'ON' : 'OFF')).join(' → '));
    u.input(2, false); u.runMs(1500);
    check('P2: mantener presionado 1,5 s no hace parpadear el LED', u.edges(8, u.ms - 1400, u.ms).length <= 1);
  },
  'P3': () => {
    const u = new Uno('P3');
    const seq = [[4.0, false, 'mucha luz'], [1.0, true, 'oscuro'], [1.8, true, 'zona de histéresis'], [2.2, false, 'vuelve la luz'], [1.6, false, 'zona de histéresis']];
    const got = seq.map(([v]) => { u.analog(0, v); u.runMs(450); return u.isHigh(8); });
    check('P3: el LED se enciende al oscurecer y la histéresis evita cambios entre 300 y 400', got.every((g, i) => g === seq[i][1]), seq.map(([v, , n], i) => `${v} V (${n}): ${got[i] ? 'ON' : 'OFF'}`).join('; '));
  },
  'P4': () => {
    for (const key of ['P4', 'm8-distancia-2']) {
      let dist = 20;
      const u = new Uno(key); hcsr04(u, 9, 10, () => dist); u.runMs(400);
      const vals = Array.from(u.serial.matchAll(/([\d.]+) cm/g)).map((m) => +m[1]);
      check(key + ': objeto a 20 cm → el monitor muestra ≈20,0 cm', vals.length >= 2 && vals.every((v) => near(v, 20, 0.6)), vals.slice(0, 4).join(', ') + ' cm');
      dist = 50; u.serial = ''; u.runMs(400);
      const v2 = Array.from(u.serial.matchAll(/([\d.]+) cm/g)).map((m) => +m[1]);
      check(key + ': objeto a 50 cm → ≈50,0 cm', v2.length >= 1 && v2.every((v) => near(v, 50, 1)), v2.slice(0, 3).join(', ') + ' cm');
      dist = null; u.serial = ''; const t0 = u.ms; u.runMs(500);
      check(key + ': sin eco muestra el aviso y el programa sigue funcionando', /Fuera de alcance|Sin eco/.test(u.serial) && (u.serial.match(/\n/g) || []).length >= 3, JSON.stringify(u.serial.split('\n')[0]) + ` (${(u.serial.match(/\n/g) || []).length} líneas en ${fx(u.ms - t0, 0)} ms)`);
    }
  },
  'P5': () => {
    let dist = 40;
    const u = new Uno('P5'); hcsr04(u, 9, 10, () => dist); u.runMs(400);
    check('P5: objeto a 40 cm → zumbador en silencio y LED "L" apagado', u.freq(8, 200, 400) === 0 && !u.isHigh(13));
    dist = 10; u.runMs(500);
    const f = u.freq(8, u.ms - 300, u.ms);
    check('P5: objeto a 10 cm → tono de 2 kHz en D8 y LED "L" encendido', near(f, 2000, 20) && u.isHigh(13), fx(f) + ' Hz');
    dist = null; u.runMs(500);
    check('P5: sin eco no hay falsa alarma', u.freq(8, u.ms - 300, u.ms) === 0 && !u.isHigh(13));
  },
  'P6': () => {
    for (const [v, us] of [[0, 544], [2.5, 1472], [5, 2400]]) {
      const u = new Uno('P6'); u.analog(0, v); u.runMs(200);
      const p = u.pulses(9, 100, 200), period = halfPeriods(u, 9, 100, 200).filter((_, i) => i % 2 === 0).map((a, i, arr) => a);
      const avg = p.reduce((a, b) => a + b, 0) / p.length;
      check(`P6: ${v} V en A0 → pulso de servo de ${us} µs en D9`, p.length >= 3 && near(avg, us, 12), fx(avg, 0) + ' µs, ' + p.length + ' pulsos');
    }
    const u = new Uno('P6'); u.analog(0, 2.5); u.runMs(200);
    const r = u.edges(9, 100, 200).filter((e) => e.high);
    const per = (r[r.length - 1].t - r[0].t) / (r.length - 1) / MS;
    check('P6: los pulsos del servo se repiten cada ≈20 ms', near(per, 20, 0.6), fx(per, 2) + ' ms');
  },
  'm8-actuadores-1': () => {
    const u = new Uno('m8-actuadores-1'); u.runMs(3000);
    const p = u.pulses(9, 0, 3000);
    check('Servo (lección M8): barrido de ≈544 µs a ≈2400 µs (0° a 180°)', Math.min(...p) < 600 && Math.max(...p) > 2350, fx(Math.min(...p), 0) + '–' + fx(Math.max(...p), 0) + ' µs');
  },
  'm8-actuadores-3': () => {
    const u = new Uno('m8-actuadores-3'); u.runMs(1300);
    const f1 = u.freq(8, 50, 280), f2 = u.freq(8, 350, 580), f3 = u.freq(8, 650, 1150);
    check('tone() (lección M8): 440 Hz, después 880 Hz y luego silencio', near(f1, 440, 4) && near(f2, 880, 8) && f3 === 0, `${fx(f1)} Hz, ${fx(f2)} Hz, ${fx(f3)} Hz`);
  },
  'm8-sensores-analogicos-3': () => {
    const u = new Uno('m8-sensores-analogicos-3'); u.analog(0, 0.75); u.runMs(150);
    const m = u.serial.match(/Temperatura: (-?[\d.]+) C/);
    check('TMP36 (lección M8): 0,75 V → ≈25 °C', m && near(+m[1], 25, 0.6) && !/calor/.test(u.serial), m && m[0]);
    const u2 = new Uno('m8-sensores-analogicos-3'); u2.analog(0, 0.85); u2.runMs(150);
    check('TMP36: 0,85 V → ≈35 °C y aviso "Hace calor"', /Temperatura: 3[45]\.\d C/.test(u2.serial) && /Hace calor/.test(u2.serial), u2.serial.split('\n').slice(0, 2).join(' | ').replace(/\r/g, ''));
  },
  'm8-pantallas-reles-2': () => {
    const u = new Uno('m8-pantallas-reles-2'); const lcd = lcdI2C(u, 0x27); u.runMs(2600);
    check('LCD I²C (lección M8): la pantalla en 0x27 muestra "Hola, Arduino" en la fila 1', lcd.text(0) === 'Hola, Arduino', JSON.stringify(lcd.text(0)));
    check('LCD I²C: la fila 2 muestra los segundos transcurridos', /^2 s/.test(lcd.text(1)), JSON.stringify(lcd.text(1)));
  }
};

const only = process.argv[2];
const t0 = Date.now();
for (const [name, fn] of Object.entries(scenarios)) {
  if (only && name !== only) continue;
  try { fn(); } catch (e) { check(name + ': error en la simulación', false, e.message); }
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed} de ${results.length} comprobaciones de comportamiento superadas (${fx((Date.now() - t0) / 1000)} s).`);
process.exit(failed ? 1 : 0);
