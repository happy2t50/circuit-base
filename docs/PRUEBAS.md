# Pruebas ejecutadas y resultados

Última ejecución: 2026-10-18. Entorno: Linux, Node.js 22.22.0, Python 3.13 con Playwright 1.56.0 y Chromium 141, avr-gcc 14.1.0 con ArduinoCore-avr (rama principal de GitHub).

## Cómo ejecutarlas

```bash
npm ci                                        # axe-core y avr8js (emulador del ATmega328P)
node --test tests/*.test.js                   # contenido y motores (sin navegador)
AVR_GCC_DIR=… ARDUINO_CORE=… ARDUINO_LIBS=… HEX_DIR=build-hex python3 tests/compile_sketches.py
node tests/simulate_sketches.js               # ejecuta cada firmware en un ATmega328P emulado
python3 tests/e2e.py --browser chromium|firefox|webkit
python3 tests/a11y.py                         # auditoría WCAG 2.2 AA con axe-core
```

Todas terminan con código 1 si algo falla. GitHub Actions las ejecuta en cada push y solo despliega si todas pasan; los fallos aparecen como anotaciones en la ejecución.

## Resultado de la última ejecución (19/10/2026)

| Suite | Dónde | Resultado |
|---|---|---|
| Contenido y motores | Node 22 | **48 de 48** pruebas |
| Compilación para Arduino Uno R3 | avr-gcc 14.1 + ArduinoCore-avr | **21 de 21** sketches compilan y caben en memoria |
| Comportamiento del firmware | avr8js (ATmega328P a 16 MHz) | **40 de 40** comprobaciones |
| Navegador, escritorio y móvil | Chromium 141 (local y CI) | **130 de 130** comprobaciones |
| Navegador, escritorio y móvil | Firefox (CI) | superadas |
| Navegador, escritorio y móvil | WebKit, el motor de Safari (CI) | superadas |
| Accesibilidad WCAG 2.2 A/AA | axe-core 4.10, Chromium | **444 pantallas** sin infracciones (claro y oscuro en escritorio, claro en móvil) |

### Comportamiento del firmware (emulación)

El `.hex` de cada sketch se ejecuta instrucción por instrucción en un ATmega328P emulado con temporizadores, puertos, conversor analógico, USART y bus I²C. El banco de pruebas simula lo que habría alrededor de la placa:

- **Pulsadores con rebote** (P2): una pulsación con 6 rebotes cambia el LED exactamente una vez.
- **Tensiones analógicas** en A0: potenciómetro (A3, A4, P6), LDR con histéresis (P3), TMP36 (≈25 °C con 0,75 V y aviso "Hace calor" con 0,85 V).
- **Sensor HC-SR04**: responde a cada disparo en Trig con un pulso en Echo de la duración correspondiente a la distancia (P4, P5 y la lección); sin eco, el programa sigue respondiendo.
- **Tiempos**: Blink y A1 (500 ms y 1 s), semáforo P1 (5 s, 2 s y 5 s, nunca dos LED a la vez), millis() sin bloquear.
- **Salidas**: PWM de D9 (≈490 Hz y rampa del ciclo de trabajo), tonos de 440, 880 y 2000 Hz, pulsos del servo cada 20 ms entre 544 y 2400 µs.
- **Pantalla LCD 16×2 por I²C** (dirección 0x27): se decodifican los bytes del PCF8574 y el HD44780; la fila 1 muestra "Hola, Arduino" y la fila 2 los segundos.

### Compilación (ATmega328P, 16 MHz)

| Sketch | Flash | RAM |
|---|---|---|
| A1 LED en D8 | 1 048 B (3 %) | 9 B |
| A2 Pulsador | 934 B (2 %) | 9 B |
| A3 Potenciómetro y monitor serie | 4 398 B (13 %) | 226 B (11 %) |
| A4 PWM | 1 288 B (3 %) | 9 B |
| P1 Semáforo | 1 138 B (3 %) | 9 B |
| P2 Pulsador con antirrebote | 1 098 B (3 %) | 16 B |
| P3 Luz automática | 2 860 B (8 %) | 225 B (10 %) |
| P4 Distancia | 5 068 B (15 %) | 232 B (11 %) |
| P5 Alarma | 6 436 B (19 %) | 221 B (10 %) |
| P6 Servo | 2 612 B (8 %) | 52 B (2 %) |
| 11 ejemplos de las lecciones de M7 y M8 (incluido LCD I²C con Wire y LiquidCrystal_I2C) | 934–4 928 B | ≤ 282 B (13 %) |

La compilación usa el núcleo oficial de Arduino y los mismos parámetros que el IDE para la placa "Arduino Uno". Se comprobó además que un sketch con un error (`pinmode` en minúscula) es rechazado con el mismo mensaje que muestra la lección M7.

### Pruebas de contenido y motores (48)

Las 37 de la versión 1, más:

- Los nueve módulos tienen contenido navegable; M5 tiene 8 prácticas y M9 tiene 7 proyectos.
- Cada práctica cumple su plantilla según el tipo (sin Arduino, con Arduino, proyecto o proyecto final) y sus enlaces a lecciones y prácticas existen.
- **Los montajes de las 18 prácticas con protoboard coinciden con su esquema**: el verificador de conexiones comprueba la lista de redes de cada una.
- El verificador detecta errores en montajes reales de prácticas: LED invertido en el semáforo, cable de retorno ausente y servo sin GND común.
- Las tres soluciones del laboratorio son correctas.
- Código Arduino: pines digitales entre D2 y D13, analogWrite() solo en pines PWM, `#include <Servo.h>` cuando se usa Servo y todas las explicaciones línea por línea apuntan a líneas que existen.
- Servo y tone() no se combinan con PWM en los pines cuyos temporizadores ocupan.

### Pruebas en navegador (130 por navegador)

Las 80 de la versión 1 (adaptadas al contenido nuevo), más:

- Las 54 rutas (todas las lecciones, prácticas, proyectos y bibliotecas) renderizan sin errores de JavaScript ni de consola, en escritorio y en móvil, y ninguna desborda horizontalmente a 390 px.
- Ningún módulo queda como "Planeado"; el Módulo 5 lista sus 8 prácticas; la página de proyectos lista 19.
- Lecciones con código: líneas numeradas y resaltado de la línea al pasar sobre su explicación.
- Lecciones con protoboard: se resaltan los 5 orificios de una tira.
- Proyectos: incluyen planificación, pruebas, diagnóstico y evaluación; montaje y esquema dibujados. Las prácticas sin Arduino no muestran sección de código.
- Proyecto final: el botón de completar está bloqueado hasta elegir una opción; la opción muestra sus requisitos y se conserva al recargar.
- Laboratorio: el ejercicio de LED en paralelo se verifica correcto con su solución; en el ejercicio del pulsador, un LED invertido se detecta.

## Errores encontrados durante las pruebas y corregidos

### Versión 1

| Error | Cómo se detectó | Corrección |
|---|---|---|
| Un "error típico" numérico coincidía con la respuesta correcta en mA. | Prueba de contenido | Se eliminó ese caso. |
| Las piezas de la protoboard tapaban los orificios. | Prueba en navegador | La capa de piezas no recibe eventos de puntero. |
| El primer Tab no llegaba a "Saltar al contenido". | Prueba en navegador | El foco solo se mueve al título al cambiar de página. |
| La práctica A1 tenía dos propiedades `code` y el encabezado mostraba el programa entero. | Revisión visual | El sketch se llama `sketch`; hay una prueba. |
| Etiquetas superpuestas en diagramas y protoboard. | Revisión visual | Etiquetas reubicadas. |

### Fases 5–8

| Error | Cómo se detectó | Corrección |
|---|---|---|
| Al reorganizar las etiquetas de los cables de la protoboard se borró el dibujo base de la placa: el laboratorio mostraba "Algo falló". | Prueba en navegador | Se restauró el código desde git. Las pruebas de Node no lo detectaron porque no cargan las vistas; la prueba de navegador sí. |
| La lección "Sensor de distancia" tenía solo 2 diapositivas (mínimo 3). | Prueba de contenido | Se añadió la diapositiva "De la medida a la decisión". |
| La prueba de pines confundía constantes como `UMBRAL_ENCENDER = 300` con números de pin. | Prueba de contenido (falso positivo) | La prueba solo revisa constantes `PIN_…`. |
| Las etiquetas de los pines quedaban tapadas por el cuerpo del módulo en los diagramas de conexiones. | Revisión visual | El cuerpo se dibuja antes que las etiquetas. |
| El texto "+5V" del símbolo de alimentación desaparecía en los divisores y en el esquema del relé. | Revisión visual | Etiqueta explícita en esos diagramas. |
| La "V" del voltímetro aparecía girada 90° en el divisor con potenciómetro. | Revisión visual | El voltímetro de ese esquema se dibuja sin rotar el texto. |
| Los bloques de código mostraban una línea en blanco extra entre líneas. | Revisión visual en móvil | Se eliminó el salto de línea duplicado; las líneas vacías conservan su altura. |
| En la actividad sobre `if (digitalRead(2) = LOW)` el enunciado decía que el LED no encendía, pero ese código ni siquiera compila. | Revisión del contenido al compilar | Enunciado corregido: "al verificar aparece un error". |

### Compatibilidad y accesibilidad (19/10/2026)

| Error | Cómo se detectó | Corrección |
|---|---|---|
| En Firefox no se podía hacer clic en las partes finas de los diagramas interactivos (cables, símbolos huecos). | Pruebas en Firefox (CI) | Cada parte clicable tiene un rectángulo invisible que cubre su caja; `pointer-events: bounding-box` solo existe en Chrome. |
| En Safari (WebKit), `/cuestionarios` y la lección de circuitos mixtos desbordaban a 390 px. | Pruebas en WebKit (CI) | `min-width: 0` en las tarjetas con diagramas y tablas que parten palabras largas en móvil. |
| Los bloques de código desplazables no se podían alcanzar con el teclado en móvil. | Auditoría axe (`scrollable-region-focusable`) | Son regiones enfocables con nombre. |
| El botón "Marcar como completada" contaba como objetivo táctil pequeño. | Auditoría axe (`target-size`) | Falso positivo: la cabecera fija lo tapaba porque la página estaba desplazada. La auditoría se hace con la página arriba. |

## Lo que NO se ha probado

- **Hardware real**: el firmware se ejecutó en un ATmega328P emulado, que reproduce las instrucciones, los temporizadores y los periféricos, pero no hay componentes físicos: no se comprueban falsos contactos, tolerancias, consumo real ni componentes defectuosos. El montaje físico en una protoboard sigue siendo una tarea del estudiante.
- **Lectores de pantalla**: la auditoría automática (axe) detecta alrededor de un tercio de los problemas de accesibilidad. Están comprobados los nombres accesibles, el foco, el teclado, el contraste y los objetivos táctiles, pero no se probó con NVDA, VoiceOver ni TalkBack.
- **Tinkercad**: el enlace se comprobó (la página "Circuits on Tinkercad" carga) y los nombres principales de su interfaz en inglés (Create new Circuit, Code, Start Simulation, Arduino Uno R3) coinciden con tutoriales publicados. Los pasos no se ejecutaron dentro de Tinkercad, porque eso requiere iniciar sesión en una cuenta, y los nombres en español pueden variar.
- **Safari en iPhone o Mac**: se probó el motor WebKit en Linux, que es el de Safari, pero no el navegador Safari en un dispositivo de Apple.
- **Librería LiquidCrystal_I2C**: se compiló y emuló con la versión de `johnrickman/LiquidCrystal_I2C`. Otras librerías con el mismo nombre pueden tener funciones distintas; la lección lo advierte.
