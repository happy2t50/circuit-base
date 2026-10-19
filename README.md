# Circuito Base

Plataforma educativa interactiva para aprender electrónica, circuitos y Arduino desde cero: lecciones en diapositivas, diagramas SVG interactivos, biblioteca de componentes y símbolos, actividades con retroalimentación específica, laboratorio con verificador de protoboard, prácticas guiadas, proyectos con Arduino Uno R3 y seguimiento del progreso.

**En línea:** https://happy2t50.github.io/circuit-base/ (se publica automáticamente desde `main`).

## Ejecutar

No necesita instalación ni compilación.

- **Doble clic en `index.html`**: se abre en el navegador y funciona sin servidor.
- O con un servidor estático, por ejemplo: `python3 -m http.server 8000` y abrir `http://localhost:8000`.

Navegadores recomendados: versiones recientes de Chrome, Edge, Firefox o Safari. Sin conexión a internet la app funciona igual; solo cambian las fuentes tipográficas por las del sistema.

## Contenido

| Módulo | Lecciones | Prácticas y proyectos |
|---|---|---|
| 1. Fundamentos de electricidad | 7 | — |
| 2. Identificación de componentes | 2 + biblioteca de 16 componentes | — |
| 3. Cómo leer diagramas | 2 + biblioteca de 21 símbolos | — |
| 4. Protoboard y montaje físico | 2 + laboratorio con 3 ejercicios | — |
| 5. Primeros circuitos | — | E1–E8 (sin microcontrolador) |
| 6. Tinkercad Circuits | 2 | Pasos de Tinkercad en cada práctica |
| 7. Arduino desde cero | 5 | A1–A4 |
| 8. Sensores y actuadores | 4 | — |
| 9. Proyectos integradores | — | P1–P6 y proyecto final con 3 opciones |

En total: 24 lecciones, 105 diapositivas, 146 actividades, 19 prácticas y proyectos, 28 diagramas y 21 programas para Arduino. El detalle está en `docs/CONTENIDO_EDUCATIVO.md`.

## Uso

- En una lección: ← y → cambian de diapositiva; Inicio y Fin van al principio y al final. "Todas las diapositivas" abre el índice.
- Las actividades se pueden repetir sin penalización. En "Cuestionarios" puedes filtrar las que tienes por repasar.
- En los bloques de código, al pasar el ratón (o el foco) sobre una explicación se resalta su línea.
- El progreso se guarda solo en este navegador y este dispositivo. No hay cuentas ni sincronización.

## Pruebas

```bash
node --test tests/*.test.js     # 44 pruebas de contenido y motores (Node 18+)
python3 tests/compile_sketches.py   # compila los 21 sketches para el ATmega328P (ver cabecera del script)
python3 tests/e2e.py            # 127 comprobaciones en Chromium (pip install playwright && playwright install chromium)
```

Resultados y alcance en `docs/PRUEBAS.md`.

## Despliegue

Cada push a `main` ejecuta las tres suites de pruebas en GitHub Actions y, si todas pasan, publica la app en GitHub Pages (`.github/workflows/pages.yml`). Solo se publican `index.html`, `css/` y `js/`.

Si el primer despliegue falla porque Pages no está activado, ve a **Settings → Pages → Build and deployment → Source**, elige **GitHub Actions** y vuelve a ejecutar el flujo desde la pestaña **Actions**.

## Estructura

```
index.html            Página única; carga estilos y scripts en orden
css/styles.css        Estilos (tema claro y oscuro, diseño adaptable)
js/core/              Utilidades, almacenamiento y enrutador
js/engine/            Ley de Ohm, verificador de protoboard, motor de actividades
js/content/           Contenido: símbolos, diagramas, componentes, lecciones, prácticas
js/views/             Pantallas
js/app.js             Arranque y rutas
tests/                Pruebas de Node, compilación de sketches y pruebas de navegador
docs/                 Arquitectura, contenido, pruebas y seguridad
PLAN_TRABAJO.md       Fases, criterios de aceptación y seguimiento
```

## Documentación

- `docs/ARQUITECTURA.md`: decisiones técnicas y responsabilidades.
- `docs/CONTENIDO_EDUCATIVO.md`: currículo, estado por módulo y criterios de precisión.
- `docs/PRUEBAS.md`: pruebas ejecutadas, errores encontrados y qué no se probó.
- `docs/SEGURIDAD.md`: precauciones y límites de los ejercicios.
