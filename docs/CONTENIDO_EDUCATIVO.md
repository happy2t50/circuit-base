# Contenido educativo

Progresión: fundamentos eléctricos → identificar piezas → leer esquemas → montar en protoboard → circuitos sin microcontrolador → simulación → Arduino → sensores y actuadores → proyectos. Placa de referencia: **Arduino Uno R3** (ATmega328P, lógica de 5 V, 20 mA recomendados por pin, PWM en 3, 5, 6, 9, 10 y 11).

## Estado por módulo (versión 1)

| Módulo | Estado | Implementado |
|---|---|---|
| 1. Fundamentos de electricidad | Disponible | 7 lecciones, 32 diapositivas, 25 actividades |
| 2. Identificación de componentes | En construcción | Biblioteca de 16 componentes (11 campos + ejercicio cada uno) y 1 lección |
| 3. Cómo leer diagramas | En construcción | Biblioteca de 21 símbolos y 1 lección de 9 diapositivas con 8 actividades |
| 4. Protoboard y montaje | En construcción | Verificador de protoboard y modo de exploración de conexiones internas |
| 5. Primeros circuitos | Planeado | — |
| 6. Tinkercad Circuits | Planeado | Pasos de Tinkercad dentro de la práctica A1 |
| 7. Arduino desde cero | En construcción | Práctica A1 (LED externo en D8) |
| 8. Sensores y actuadores | Planeado | — |
| 9. Proyectos integradores | Planeado | — |

Los módulos planeados se muestran con su temario y la etiqueta "Planeado", sin botones que lleven a pantallas vacías.

## Módulo 1 — lecciones

| Lección | Temas | Actividades |
|---|---|---|
| Qué es la electricidad | Carga, electrones, conductores, aislantes, sentido convencional, qué necesita un circuito | selección múltiple, V/F, reflexión |
| Voltaje, corriente, resistencia y unidades | V, A, Ω, W; prefijos; dónde se mide cada magnitud; analogía del agua y sus límites | 2 conversiones, selección múltiple, V/F |
| Circuitos, corriente continua y fuentes | Abierto, cerrado, cortocircuito, CC/CA, fuentes, lectura del circuito básico | selección múltiple, V/F, diagrama interactivo |
| Ley de Ohm | V = I·R en sus tres formas, resistencia de LED, valores E12 | selección múltiple, 4 cálculos |
| Potencia eléctrica | P = V·I, I²R, V²/R; potencia nominal de resistencias | 2 cálculos, selección múltiple |
| Uso básico del multímetro | Partes, tensión en paralelo, corriente en serie, resistencia y continuidad sin alimentación | 2 diagramas, V/F, ordenar pasos |
| Seguridad eléctrica | 8 reglas, señales de alarma, comprobación previa | selección múltiple, V/F, reflexión |

## Ejemplos numéricos usados (verificados por prueba)

- 1 kΩ a 5 V → 5 mA. 2,2 kΩ a 9 V → 4,09 mA.
- LED rojo (Vf ≈ 2,0 V) a 5 V, 15 mA → 200 Ω → 220 Ω (E12) → 13,6 mA.
- Batería de 9 V, LED rojo, 470 Ω → ≈14,9 mA; la resistencia disipa ≈0,104 W.
- 100 Ω a 12 V → 0,12 A y 1,44 W (no apta para 1/4 W).
- Serie 220 Ω + 330 Ω = 550 Ω. Paralelo 1 kΩ ∥ 1 kΩ = 500 Ω.

## Criterios de precisión técnica aplicados

- La polaridad se indica solo cuando existe. Casos matizados: condensadores (depende del tipo), zumbadores (activos polarizados, piezo pasivos normalmente no), relés (bobina sin polaridad salvo diodo interno; módulos con pines de alimentación), transistores (patas con función fija y orden según el modelo).
- No se afirma un orden de patas universal para los transistores TO-92: se indica el del BC547 y se advierte que el 2N2222A suele ser distinto.
- Los diagramas usan el sentido convencional de la corriente y conexiones reales (sin simplificaciones que cambien el comportamiento).
- No se conectan cargas que superen 20 mA a pines del Arduino: el relé se explica con transistor y diodo, y se indica la corriente típica de su bobina.

## Plantilla de práctica

Objetivo, conocimientos previos, materiales, diagrama eléctrico, vista del montaje, lista numerada de conexiones, cálculos, código con explicación línea por línea, resultado esperado, errores frecuentes (síntoma → causa → solución), preguntas de comprobación, enlace y pasos de Tinkercad, lista de verificación de seguridad (obligatoria antes de marcar la práctica como completada).
