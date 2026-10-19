"""Compila TODOS los sketches de la app (prácticas y ejemplos de las lecciones) para Arduino Uno R3.

No usa arduino-cli: compila directamente con avr-gcc contra el núcleo oficial ArduinoCore-avr,
igual que lo hace el IDE (placa "Arduino Uno": ATmega328P a 16 MHz). Comprueba además que el
programa cabe en la memoria del Uno (32 256 bytes de flash útiles con el bootloader, 2 048 de SRAM).

Requisitos (rutas por variables de entorno):
  AVR_GCC_DIR    carpeta del compilador avr-gcc (contiene bin/avr-g++)
  ARDUINO_CORE   copia de https://github.com/arduino/ArduinoCore-avr
  ARDUINO_LIBS   carpeta con las librerías Servo (arduino-libraries/Servo) y LiquidCrystal_I2C

Uso: python3 tests/compile_sketches.py     (termina con código 1 si alguno no compila)
"""
import json, os, pathlib, re, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
GCC = pathlib.Path(os.environ.get("AVR_GCC_DIR", "")) / "bin"
CORE = pathlib.Path(os.environ.get("ARDUINO_CORE", ""))
LIBS = pathlib.Path(os.environ.get("ARDUINO_LIBS", ""))
if not (GCC / "avr-g++").exists() or not (CORE / "cores/arduino/Arduino.h").exists():
    print("OMITIDO: define AVR_GCC_DIR, ARDUINO_CORE y ARDUINO_LIBS (ver cabecera del archivo).")
    sys.exit(0)

MCU = ["-mmcu=atmega328p", "-DF_CPU=16000000L", "-DARDUINO=10819", "-DARDUINO_AVR_UNO", "-DARDUINO_ARCH_AVR"]
COMMON = ["-Os", "-g0", "-ffunction-sections", "-fdata-sections", "-w"] + MCU
CXX = ["-std=gnu++11", "-fpermissive", "-fno-exceptions", "-fno-threadsafe-statics", "-fno-rtti"]
INC = ["-I" + str(CORE / "cores/arduino"), "-I" + str(CORE / "variants/standard")]
LIB_DIRS = {
    "Servo.h": ([LIBS / "Servo/src"], [LIBS / "Servo/src/avr/Servo.cpp"]),
    "Wire.h": ([CORE / "libraries/Wire/src", CORE / "libraries/Wire/src/utility"], [CORE / "libraries/Wire/src/Wire.cpp", CORE / "libraries/Wire/src/utility/twi.c"]),
    "LiquidCrystal_I2C.h": ([LIBS / "LiquidCrystal_I2C"], [LIBS / "LiquidCrystal_I2C/LiquidCrystal_I2C.cpp"]),
}

def run(cmd):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip()[-1500:])
    return r.stdout

def compile_src(src, out, extra_inc):
    tool = GCC / ("avr-gcc" if src.suffix in (".c", ".S") else "avr-g++")
    flags = COMMON + (CXX if src.suffix == ".cpp" else (["-x", "assembler-with-cpp"] if src.suffix == ".S" else ["-std=gnu11"]))
    run([tool, "-c", *flags, *INC, *extra_inc, str(src), "-o", str(out)])

# Sketches desde el contenido de la app (Node lee los mismos archivos que el navegador)
dump = subprocess.run(["node", "-e", """
const CB = require('./tests/load').load();
const out = CB.practices.list.filter(p => p.sketch).map(p => ({ id: 'práctica ' + p.code, sketch: p.sketch }));
CB.lessons.forEach(l => l.slides.forEach((s, i) => { if (s.code) out.push({ id: 'lección ' + l.id + ' (diapositiva ' + (i + 1) + ')', sketch: s.code.sketch }); }));
console.log(JSON.stringify(out));
"""], cwd=ROOT, capture_output=True, text=True, check=True)
sketches = json.loads(dump.stdout)

build = pathlib.Path(tempfile.mkdtemp(prefix="cb-build-"))
core_objs = []
for src in sorted((CORE / "cores/arduino").iterdir()):
    if src.suffix in (".c", ".cpp", ".S"):
        obj = build / (src.name + ".o")
        compile_src(src, obj, [])
        core_objs.append(obj)
run([GCC / "avr-gcc-ar", "rcs", build / "core.a", *core_objs])

# Prototipos automáticos (el IDE los genera): funciones de primer nivel distintas de setup/loop
PROTO = re.compile(r"^([A-Za-z_][\w\s\*&]*?)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{", re.M)

failed = 0
print(f"Compilando {len(sketches)} sketches para Arduino Uno R3 (ATmega328P)\n")
for i, s in enumerate(sketches):
    code = s["sketch"]
    includes = re.findall(r"#include\s*<([^>]+)>", code)
    protos = [f"{m.group(1).strip()} {m.group(2)}({m.group(3)});" for m in PROTO.finditer(code) if m.group(2) not in ("setup", "loop") and not m.group(1).strip().startswith(("else", "return"))]
    cpp = build / f"sketch{i}.cpp"
    # Las directivas #include del sketch van primero; después los prototipos, como hace el IDE
    inc_lines = [l for l in code.split("\n") if l.strip().startswith("#include")]
    body = "\n".join(l for l in code.split("\n") if not l.strip().startswith("#include"))
    cpp.write_text("#include <Arduino.h>\n" + "\n".join(inc_lines) + "\n" + "\n".join(protos) + "\n#line 1\n" + body, encoding="utf-8")
    extra_inc, lib_srcs = [], []
    for inc in includes:
        if inc in LIB_DIRS:
            extra_inc += ["-I" + str(d) for d in LIB_DIRS[inc][0]]
            lib_srcs += LIB_DIRS[inc][1]
    if "LiquidCrystal_I2C.h" in includes and "Wire.h" not in includes:
        extra_inc += ["-I" + str(d) for d in LIB_DIRS["Wire.h"][0]]; lib_srcs += LIB_DIRS["Wire.h"][1]
    try:
        objs = []
        compile_src(cpp, build / f"sketch{i}.o", extra_inc); objs.append(build / f"sketch{i}.o")
        for j, src in enumerate(dict.fromkeys(lib_srcs)):
            o = build / f"lib{i}_{j}.o"; compile_src(src, o, extra_inc); objs.append(o)
        elf = build / f"sketch{i}.elf"
        run([GCC / "avr-gcc", "-Os", "-Wl,--gc-sections", "-mmcu=atmega328p", "-o", elf, *objs, build / "core.a", "-lm"])
        sizes = run([GCC / "avr-size", "-A", elf])
        sec = {m.group(1): int(m.group(2)) for m in re.finditer(r"^(\.\w+)\s+(\d+)", sizes, re.M)}
        flash = sec.get(".text", 0) + sec.get(".data", 0)
        ram = sec.get(".data", 0) + sec.get(".bss", 0)
        ok = flash <= 32256 and ram <= 2048
        print(f"{'OK   ' if ok else 'FALLO'} {s['id']}: {flash} B de flash ({flash * 100 // 32256} %), {ram} B de RAM ({ram * 100 // 2048} %)")
        failed += 0 if ok else 1
    except RuntimeError as e:
        failed += 1
        print(f"FALLO {s['id']}: no compila\n{e}\n")

print(f"\n{len(sketches) - failed} de {len(sketches)} sketches compilan y caben en el Arduino Uno R3.")
sys.exit(1 if failed else 0)
