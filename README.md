# Circuito Base

Plataforma educativa interactiva para aprender electrónica, circuitos y Arduino desde cero: lecciones en diapositivas, diagramas SVG interactivos, biblioteca de componentes y símbolos, actividades con retroalimentación específica, laboratorio (calculadoras y verificador de protoboard), práctica guiada con Arduino Uno R3 y seguimiento del progreso.

## Ejecutar

No necesita instalación ni compilación.

- **Doble clic en `index.html`**: se abre en el navegador y funciona sin servidor.
- O con un servidor estático, por ejemplo: `python3 -m http.server 8000` y abrir `http://localhost:8000`.

Navegadores recomendados: versiones recientes de Chrome, Edge, Firefox o Safari. Sin conexión a internet la app funciona igual; solo cambian las fuentes tipográficas por las del sistema.

## Qué incluye la versión 1

- Navegación completa: inicio, módulos, lección, componentes, símbolos, laboratorio, cuestionarios, proyectos y progreso.
- **Módulo 1 completo**: 7 lecciones, 32 diapositivas y 25 actividades.
- **Biblioteca de 16 componentes** con ilustración, símbolo, función, terminales, polaridad, especificaciones, cómo comprobarlo, errores frecuentes, ejemplo y ejercicio.
- **Lectura de diagramas**: lección de 9 diapositivas y biblioteca de 21 símbolos.
- **Laboratorio**: calculadora de ley de Ohm, calculadora de resistencia para LED y verificador de montajes en protoboard (no es un simulador eléctrico).
- **Práctica A1**: LED externo intermitente en D8 con Arduino Uno R3.
- **Progreso** guardado en el navegador, temas por repasar, historial y copia de seguridad en JSON.

Los módulos 4–9 aparecen con su temario y su estado ("En construcción" o "Planeado"). El detalle está en `docs/CONTENIDO_EDUCATIVO.md` y el plan en `PLAN_TRABAJO.md`.

## Uso

- En una lección: ← y → cambian de diapositiva; Inicio y Fin van al principio y al final. "Todas las diapositivas" abre el índice.
- Las actividades se pueden repetir sin penalización. En "Cuestionarios" puedes filtrar las que tienes por repasar.
- El progreso se guarda solo en este navegador y este dispositivo. No hay cuentas ni sincronización.

## Pruebas

```bash
node --test tests/*.test.js     # 37 pruebas de contenido y motores (Node 18+)
python3 tests/e2e.py            # 80 comprobaciones en Chromium (requiere: pip install playwright && playwright install chromium)
```

Resultados y alcance en `docs/PRUEBAS.md`.

## Estructura

```
index.html            Página única; carga estilos y scripts en orden
css/styles.css        Estilos (tema claro y oscuro, diseño adaptable)
js/core/              Utilidades, almacenamiento y enrutador
js/engine/            Ley de Ohm, verificador de protoboard, motor de actividades
js/content/           Contenido: símbolos, diagramas, componentes, lecciones, prácticas
js/views/             Pantallas
js/app.js             Arranque y rutas
tests/                Pruebas de Node y de navegador
docs/                 Arquitectura, contenido, pruebas y seguridad
PLAN_TRABAJO.md       Fases, criterios de aceptación y seguimiento
```

## Documentación

- `docs/ARQUITECTURA.md`: decisiones técnicas y responsabilidades.
- `docs/CONTENIDO_EDUCATIVO.md`: currículo, estado por módulo y criterios de precisión.
- `docs/PRUEBAS.md`: pruebas ejecutadas, errores encontrados y qué no se probó.
- `docs/SEGURIDAD.md`: precauciones y límites de los ejercicios.

## Despliegue

Cada push a `main` ejecuta las pruebas de Node y, si pasan, publica la app en GitHub Pages (`.github/workflows/pages.yml`). Solo se publican `index.html`, `css/` y `js/`.

Dirección prevista: https://happy2t50.github.io/circuit-base/

Si el primer despliegue falla porque Pages no está activado, ve a **Settings → Pages → Build and deployment → Source** y elige **GitHub Actions**; después vuelve a ejecutar el flujo desde la pestaña **Actions**.
