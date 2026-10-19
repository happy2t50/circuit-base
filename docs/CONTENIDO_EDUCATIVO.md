# Contenido educativo

Progresión: fundamentos eléctricos → identificar piezas → leer esquemas → montar en protoboard → circuitos sin microcontrolador → simulación → Arduino → sensores y actuadores → proyectos. Placa de referencia: **Arduino Uno R3** (ATmega328P, lógica de 5 V, 20 mA recomendados por pin, PWM en 3, 5, 6, 9, 10 y 11).

## Estado por módulo

Los nueve módulos están disponibles.

| Módulo | Lecciones | Diapositivas | Actividades | Prácticas y herramientas |
|---|---|---|---|---|
| 1. Fundamentos de electricidad | 7 | 32 | 25 | — |
| 2. Identificación de componentes | 2 | 10 | 8 | Biblioteca de 16 componentes (11 campos + ejercicio cada uno) |
| 3. Cómo leer diagramas | 2 | 14 | 14 | Biblioteca de 21 símbolos |
| 4. Protoboard y montaje físico | 2 | 9 | 9 | Laboratorio: 3 ejercicios con verificador y modo de exploración |
| 5. Primeros circuitos | — | — | — | E1–E8 |
| 6. Tinkercad Circuits | 2 | 9 | 6 | Pasos de Tinkercad en cada práctica |
| 7. Arduino desde cero | 5 | 18 | 16 | A1–A4 |
| 8. Sensores y actuadores | 4 | 13 | 13 | — |
| 9. Proyectos integradores | — | — | — | P1–P6 y P7 (proyecto final con 3 opciones) |

Además: 16 ejercicios en las fichas de componentes y 39 preguntas de comprobación en prácticas y proyectos (146 actividades en total).

## Lecciones por módulo

- **M1**: qué es la electricidad; voltaje, corriente, resistencia y unidades; circuitos, corriente continua y fuentes; ley de Ohm; potencia; multímetro; seguridad eléctrica.
- **M2**: identificar componentes y su polaridad; transistores, relés y sensores (incluye cómo leer una hoja de datos).
- **M3**: cómo leer un diagrama eléctrico; circuitos mixtos, nodos y esquemas de pines de módulos.
- **M4**: cómo está hecha una protoboard (tiras, canal, carriles partidos); del esquema a la protoboard (LED, pulsador de 4 patas, alimentación y tierra, errores típicos).
- **M6**: primer circuito en Tinkercad (componentes, cableado, simulación, diagnóstico); Arduino en Tinkercad (código en modo texto, monitor serie, depurador, compartir).
- **M7**: microcontroladores y la placa Uno R3 (memorias, alimentación, IDE); estructura del programa, tipos de datos y salidas; entradas digitales, pull-up y condicionales; analogRead(), map() y PWM; bucles, funciones, monitor serie, millis() y depuración.
- **M8**: pulsadores, potenciómetros, LDR y TMP36 con umbrales e histéresis; sensor ultrasónico HC-SR04; servomotores (alimentación externa, GND común) y zumbadores con tone(); pantalla LCD I²C, librerías y control de cargas con relé, transistor y diodo.

## Prácticas y proyectos

| Código | Título | Placa | Montaje verificado | Código compilado |
|---|---|---|---|---|
| E1 | Fuente, resistencia y LED | Pila 9 V | ✔ | — |
| E2 | Variar la resistencia | Pila 9 V | ✔ | — |
| E3 | Dos LED en serie | Pila 9 V | ✔ | — |
| E4 | LED en paralelo con sus resistencias | Pila 9 V | ✔ | — |
| E5 | Pulsador para controlar un LED | Pila 9 V | ✔ | — |
| E6 | Potenciómetro como divisor de tensión | Pila 9 V | ✔ | — |
| E7 | Sensor sencillo: LDR | Pila 9 V | ✔ | — |
| E8 | Circuito con zumbador | Fuente 5 V | ✔ | — |
| A1 | LED externo intermitente en D8 | Uno R3 | ✔ | ✔ |
| A2 | Pulsador con INPUT_PULLUP | Uno R3 | ✔ | ✔ |
| A3 | Potenciómetro y monitor serie | Uno R3 | ✔ | ✔ |
| A4 | Brillo gradual con PWM | Uno R3 | ✔ | ✔ |
| P1 | Semáforo programado | Uno R3 | ✔ | ✔ |
| P2 | LED con pulsador y antirrebote | Uno R3 | ✔ | ✔ |
| P3 | Iluminación automática con LDR (histéresis) | Uno R3 | ✔ | ✔ |
| P4 | Medidor de distancia HC-SR04 | Uno R3 | ✔ | ✔ |
| P5 | Alarma con sensor y zumbador | Uno R3 | ✔ | ✔ |
| P6 | Servo controlado con potenciómetro | Uno R3 + fuente 5 V | ✔ | ✔ |
| P7 | Proyecto final: estación de temperatura, asistente de estacionamiento o lámpara inteligente | Uno R3 | — (lo diseña el estudiante) | — |

"Montaje verificado": la vista de protoboard pasa el mismo verificador de conexiones que usa el laboratorio contra la lista de redes del esquema. "Código compilado": el sketch compila para el ATmega328P y cabe en su memoria (ver `docs/PRUEBAS.md`).

**Plantilla de práctica**: objetivo, conocimientos previos, materiales, diagrama eléctrico, vista del montaje, conexiones numeradas, cálculos, código con explicación línea por línea (con Arduino), resultado esperado, errores frecuentes, preguntas, pasos en Tinkercad y lista de verificación obligatoria.

**Proyectos (M9)**: añaden planificación, tabla de pruebas, diagnóstico y rúbrica de evaluación. El proyecto final permite elegir entre tres opciones; cada una trae requisitos, materiales, pines sugeridos, enlaces a las partes reutilizables, hitos y rúbrica.

## Ejemplos numéricos usados (verificados por prueba)

- 1 kΩ a 5 V → 5 mA. 2,2 kΩ a 9 V → 4,09 mA.
- LED rojo (Vf ≈ 2,0 V) a 5 V, 15 mA → 200 Ω → 220 Ω (E12) → 13,6 mA.
- Batería de 9 V, LED rojo, 470 Ω → ≈14,9 mA; la resistencia disipa ≈0,104 W.
- Dos LED rojos en serie a 9 V con 330 Ω → 15,2 mA. Con 220 Ω y un solo LED a 9 V serían 31,8 mA: por eso E2 no baja de 470 Ω.
- Circuito mixto 330 Ω + (1 kΩ ∥ 1 kΩ) = 830 Ω → 10,8 mA a 9 V.
- TMP36: lectura 153 → 0,748 V → 24,8 °C. HC-SR04: 1 166 µs → 20,0 cm.

## Criterios de precisión técnica aplicados

- La polaridad se indica solo cuando existe. Casos matizados: condensadores (depende del tipo), zumbadores (activos polarizados; piezo pasivos normalmente no), relés (bobina sin polaridad salvo diodo interno; módulos con pines de alimentación), transistores (patas con función fija y orden según el modelo).
- Ningún montaje pide más de 20 mA a un pin del Arduino: relés con transistor y diodo, servo con fuente externa y GND común, zumbador activo desde el pin 5V.
- Se advierte de efectos reales del Uno: Servo desactiva el PWM en D9 y D10; tone() lo desactiva en D3 y D11; D0/D1 se usan para la comunicación serie; el HC-SR04 necesita adaptar el nivel de Echo en placas de 3,3 V.
- Se distingue entre esquema, diagrama de conexiones, esquema de pines y montaje físico.
