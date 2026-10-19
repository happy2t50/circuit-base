# PLAN DE TRABAJO — Plataforma "Circuito Base"

Plataforma educativa interactiva para aprender electrónica, circuitos y Arduino desde cero.

## 1. Inspección inicial (2026-10-18)

| Aspecto | Resultado |
|---|---|
| Directorio del proyecto | Vacío. No hay código, framework ni convenciones previas que respetar. |
| Framework / dependencias | Ninguno. Stack elegido por el usuario: **HTML + CSS + JavaScript sin paso de compilación**. |
| Funcionalidades existentes | Ninguna. |
| Entorno de pruebas disponible | Node.js 22 (pruebas de contenido y lógica con `node --test`), Python 3 + Playwright con Chromium 141 (pruebas de extremo a extremo). |

### Limitaciones técnicas identificadas

1. **Sin paso de compilación y apertura con doble clic (`file://`)**: los módulos ES (`<script type="module">`) se bloquean en Chrome bajo `file://`. Decisión: scripts clásicos que registran todo en un único espacio de nombres global `window.CB`. Así la app funciona abriendo `index.html` directamente o desde cualquier servidor estático.
2. **Sin backend**: el progreso se guarda en `localStorage`. Es local al navegador y al dispositivo; no se sincroniza. Si `localStorage` no está disponible (modo privado estricto, almacenamiento bloqueado), la app sigue funcionando con memoria temporal y lo avisa.
3. **No hay motor de simulación eléctrica**: el laboratorio de protoboard es un **verificador de conexiones** (calcula qué terminales quedan unidos según la estructura interna de la protoboard y compara la topología con la esperada). No calcula corrientes ni tensiones. La interfaz lo indica de forma visible.
4. **Tinkercad**: no existe integración ni API pública para incrustar o ejecutar proyectos. La app enlaza a Tinkercad Circuits y da instrucciones reproducibles; no afirma abrir proyectos dentro de la app.
5. **Fuentes tipográficas**: se cargan de Google Fonts cuando hay conexión; sin conexión se usan fuentes del sistema declaradas como respaldo.

## 2. Arquitectura propuesta

```
electronica-app/
├── index.html              Estructura base, carga de estilos y scripts en orden
├── css/styles.css          Tokens de diseño (claro/oscuro), layout y componentes
├── js/
│   ├── core/
│   │   ├── util.js         Utilidades: escape HTML, formato de unidades, DOM
│   │   ├── store.js        Persistencia del progreso (localStorage + respaldo en memoria)
│   │   └── router.js       Enrutador por hash (#/ruta)
│   ├── content/            SOLO datos (separados de la presentación)
│   │   ├── diagrams.js     Diagramas SVG con partes seleccionables (data-part)
│   │   ├── symbols.js      Biblioteca de símbolos eléctricos
│   │   ├── components.js   Biblioteca de componentes (16 fichas)
│   │   ├── curriculum.js   Módulos 1–9 (estado: disponible / planeado)
│   │   ├── lessons-m1.js   Módulo 1 completo
│   │   ├── lessons-m2.js   Lección de identificación de componentes
│   │   ├── lessons-m3.js   Lección de lectura de diagramas
│   │   ├── practices.js    Práctica Arduino A1
│   │   └── lab.js          Ejercicios del laboratorio de protoboard
│   ├── engine/
│   │   ├── activities.js   Motor de actividades (8 tipos) con retroalimentación específica
│   │   ├── breadboard.js   Modelo de protoboard y verificador de conexiones
│   │   └── ohm.js          Cálculos de ley de Ohm y potencia
│   ├── views/              Una función de renderizado por pantalla
│   └── app.js              Arranque y registro de rutas
├── tests/
│   ├── content.test.js     Integridad y coherencia técnica del contenido
│   ├── engine.test.js      Ohm, verificador de protoboard, store
│   └── e2e.py              Recorrido en navegador real (escritorio y móvil)
└── docs/                   ARQUITECTURA, CONTENIDO_EDUCATIVO, PRUEBAS, SEGURIDAD
```

Principios: contenido como datos puros; motores sin dependencias del DOM (probables en Node); vistas que solo combinan datos y motores.

## 3. Fases

### Fase 1 — Planificación ✅
- Tareas: inspección, arquitectura, este documento.
- Criterio de aceptación: plan con tareas, dependencias, criterios y pruebas por fase.

### Fase 2 — Núcleo funcional (depende de F1) ✅
- Tareas: enrutador; panel principal; menú de módulos; visor de diapositivas (avanzar/retroceder, índice de diapositivas, salto directo, barra de progreso, explicaciones ampliables, reiniciar actividades, marcar completada, reanudar); motor de actividades; persistencia; panel de progreso.
- Criterios: todas las rutas cargan sin errores de consola; flechas ← → navegan diapositivas; el progreso sobrevive a una recarga; cada respuesta muestra una explicación específica.
- Pruebas: `engine.test.js` (store), `e2e.py` (navegación, teclado, recarga).

### Fase 3 — Contenido V1 (depende de F2) ✅
- Módulo 1 completo (7 lecciones: electricidad, magnitudes y unidades, circuitos y fuentes, ley de Ohm, potencia, multímetro, seguridad).
- Biblioteca interactiva de componentes (16 fichas con los 11 campos pedidos) + lección de identificación (Módulo 2).
- Lección de lectura de diagramas + biblioteca de símbolos interactiva (Módulo 3).
- Laboratorio: calculadora de ley de Ohm y verificador de protoboard (LED con resistencia).
- Práctica Arduino A1: LED externo intermitente en D8 (Arduino Uno R3).
- Criterios: sin texto de relleno; polaridad correcta en cada ficha; cálculos numéricos verificados por prueba automática; diagramas coherentes con los montajes.
- Pruebas: `content.test.js` recalcula cada respuesta numérica y valida ids, retroalimentación y referencias.

### Fase 4 — Validación y documentación (depende de F3) ✅
- Ejecutar todas las pruebas, corregir fallos, documentar resultados reales en `docs/PRUEBAS.md`.
- README, ARQUITECTURA, CONTENIDO_EDUCATIVO, SEGURIDAD.

### Fase 5 — Módulo 3 ampliado y Módulo 4 ✅
- Más ejercicios de interpretación (seguir recorrido, identificar nodos en circuitos mixtos), esquemas de pines.
- Protoboard: ejercicios con pulsador y con dos LED en paralelo; explicación de carriles partidos.
- Criterio: cada ejercicio del verificador detecta al menos: componente en cortocircuito (ambas patas en la misma tira), LED invertido, falta de resistencia, conexión ausente.

### Fase 6 — Módulo 5 Primeros circuitos ✅
- 8 prácticas con la plantilla completa (objetivo … lista de verificación).
- Prueba: cada práctica valida que todos los campos de la plantilla existen y los cálculos cuadran.

### Fase 7 — Módulos 6 (Tinkercad) y 7 (Arduino desde cero) ✅
- Guías paso a paso de Tinkercad; lecciones de setup/loop, E/S digitales, analogRead, PWM, monitor serie, depuración.
- Criterio: todo el código usa pines válidos de Arduino Uno R3 (PWM solo en 3, 5, 6, 9, 10, 11).

### Fase 8 — Módulos 8 y 9 ✅
- Sensores y actuadores con advertencias de alimentación/librerías; 7 proyectos integradores.

## 4. Seguimiento

| Fecha | Fase | Estado | Notas |
|---|---|---|---|
| 2026-10-18 | F1 | Completada | Directorio vacío; stack sin compilación con scripts clásicos (compatibles con `file://`). |
| 2026-10-18 | F2 | Completada | 9 vistas, enrutador, 6 tipos de actividad, persistencia con respaldo en memoria. |
| 2026-10-18 | F3 | Completada | M1: 7 lecciones / 32 diapositivas / 25 actividades. 16 componentes, 21 símbolos, 8 diagramas, verificador de protoboard, práctica A1. Módulos 4–9 visibles con su estado, sin botones que lleven a pantallas vacías. |
| 2026-10-18 | F4 | Completada | 37/37 pruebas de Node y 80/80 comprobaciones en navegador. 6 errores detectados y corregidos (ver docs/PRUEBAS.md). |

| 2026-10-18 | F5 | Completada | M2: lección de transistores, relés y sensores. M3: circuitos mixtos y esquemas de pines. M4: 2 lecciones. Verificador generalizado con listas de redes; laboratorio con 3 ejercicios (LED, pulsador, paralelo). |
| 2026-10-18 | F6 | Completada | M5: prácticas E1–E8 con montaje verificado. |
| 2026-10-18 | F7 | Completada | M6: 2 lecciones de Tinkercad. M7: 5 lecciones con código y prácticas A2–A4. Compilación real de los sketches con avr-gcc y ArduinoCore-avr. |
| 2026-10-18 | F8 | Completada | M8: 4 lecciones. M9: proyectos P1–P6 y proyecto final con 3 opciones. 44/44 pruebas de Node, 21/21 sketches compilados, 127/127 comprobaciones en navegador. |

### Decisiones de las fases 5–8

- **Verificación por lista de redes** (`check: 'netlist'`): cada práctica declara qué terminales deben quedar unidos. Un único verificador comprueba los 18 montajes y los ejercicios del laboratorio, y detecta componentes invertidos, conexiones que faltan y conexiones que sobran.
- **Compositores de esquemas** (`diagrams-compose.js`): los circuitos con pila y los diagramas con Arduino se generan a partir de una descripción por filas, con los mismos símbolos de la biblioteca. Evita errores de coordenadas y mantiene el estilo.
- **Explicaciones de código ancladas a texto** (`find`): una explicación apunta a un fragmento de la línea, no a su número; si el código cambia, la explicación sigue en su línea y la prueba falla si el fragmento desaparece.
- **Compilación real en lugar de revisión estática**: `downloads.arduino.cc` no era accesible, así que se compila con avr-gcc y el núcleo oficial de Arduino descargados de GitHub, con los parámetros de la placa Uno.

| 2026-10-19 | Verificación | Completada | Firmware ejecutado en un ATmega328P emulado (40/40). Pruebas en Chromium, Firefox y WebKit. Auditoría WCAG 2.2 AA con axe-core sin infracciones (444 pantallas). Enlace de Tinkercad comprobado. Importación de la copia de seguridad del progreso. |

### Pendientes conocidos (requieren una persona o hardware)

- Montar los circuitos y cargar los sketches en una placa Arduino Uno física.
- Probar con lectores de pantalla (NVDA, VoiceOver, TalkBack) y en Safari de un iPhone o Mac.
- Recorrer los pasos de Tinkercad dentro de una cuenta y anotar los nombres de menús en español.
