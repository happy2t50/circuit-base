# Arquitectura

## Decisiones principales

| Decisión | Motivo |
|---|---|
| HTML + CSS + JavaScript sin compilación | Lo pidió el usuario. Se abre con doble clic en `index.html`, sin Node ni dependencias, y el código es fácil de leer y defender. |
| Scripts clásicos con un espacio de nombres global `window.CB` (no módulos ES) | Chrome bloquea los módulos ES con `file://`. Con scripts clásicos la app funciona tanto con doble clic como desde un servidor estático. El orden de carga está en `index.html` y una prueba verifica que se respeta. |
| Enrutador por hash (`#/leccion/m1-ohm?s=3`) | Funciona sin servidor y permite enlaces directos a una diapositiva concreta. |
| Contenido como datos puros (`js/content/`) | Separa contenido, lógica y presentación. Añadir una lección no requiere tocar vistas. Las pruebas recorren el contenido para validar referencias y cálculos. |
| Motores sin dependencia del DOM (`js/engine/`) | Ley de Ohm, verificador de protoboard y evaluadores de actividades se prueban en Node sin navegador. |
| Diagramas en SVG generados desde una biblioteca de símbolos | Vectoriales (zoom sin pérdida), seleccionables (`data-part`), coherentes en todos los diagramas y adaptados al tema claro/oscuro con `currentColor`. |
| `localStorage` para el progreso | No hay backend y el alcance es individual. Limitaciones documentadas abajo y en la propia app. |
| Verificador de conexiones en lugar de simulador | Un simulador eléctrico completo excede el alcance. El verificador es exacto en lo que afirma (qué está conectado con qué) y la interfaz dice claramente que no simula. |

## Capas y responsabilidades

```
index.html
  └─ js/core       util.js     escape HTML, formato de unidades SI, lectura de números
                   store.js    progreso (localStorage + respaldo en memoria), historial
                   router.js   rutas #/…, parámetros y consulta ?s=
  └─ js/engine     ohm.js         ley de Ohm, potencia, resistencia de LED, serie E12
                   breadboard.js  modelo de protoboard (redes internas) y verificador
                   activities.js  evaluadores puros + renderizado de 6 tipos de actividad
  └─ js/content    symbols.js     21 símbolos (dibujo + ficha)
                   diagrams.js    8 diagramas compuestos con símbolos
                   components.js  16 fichas de componentes
                   curriculum.js  9 módulos con estado
                   lessons-*.js   lecciones (diapositivas + actividades)
                   practices.js   práctica A1 (plantilla completa)
                   lab.js         ejercicios del verificador
  └─ js/views      shell.js            índices, medios, cálculo de progreso, montaje de vistas
                   home.js             panel principal y módulos
                   lesson.js           visor de diapositivas
                   library.js          componentes y símbolos
                   breadboard-view.js  dibujo SVG de la protoboard
                   lab.js              calculadoras y verificador
                   practice.js         proyectos y práctica guiada
                   progress.js         progreso, cuestionarios, 404
  └─ js/app.js     arranque, rutas, manejo de errores por vista
```

## Tipos de actividad

El motor implementa seis tipos técnicos; la etiqueta pedagógica (`kind`) indica el propósito:

| `type` | Uso | `kind` posibles |
|---|---|---|
| `mc` | Selección múltiple con explicación por opción; opciones con símbolo SVG | `symbol`, `component`, `diagram`, `challenge` |
| `tf` | Verdadero o falso con explicación del error | `diagram` |
| `numeric` | Cálculo con tolerancia, prefijos y errores típicos con mensaje propio | `ohm`, `diagram` |
| `order` | Ordenar pasos con botones ↑ ↓ (accesible por teclado) | `diagram` |
| `hotspot` | Clic (o Tab + Enter) sobre una parte de un diagrama | `diagram`, `error` |
| `reflection` | Respuesta abierta guardada + respuesta de referencia | — |

## Modelo de la protoboard

Media protoboard de 30 columnas. Cada orificio pertenece a una red interna: `T<col>` (filas a–e), `B<col>` (filas f–j) o un carril (`R_tp`, `R_tn`, `R_bp`, `R_bn`). Los cables puente unen redes mediante unión-búsqueda. Después se comprueba la topología esperada (`led-series`: 5V → resistencia → ánodo → cátodo → GND, con la resistencia a cualquier lado del LED). Los carriles se modelan continuos; la interfaz advierte que algunas protoboards largas los tienen partidos.

## Persistencia

Clave `circuitoBase.progreso.v1` con un campo `schema`. Limitaciones:

- Local a un navegador y un dispositivo. No es una cuenta ni se sincroniza.
- Se pierde al borrar los datos del sitio o en ventanas privadas.
- Si el almacenamiento falla, la app sigue funcionando en memoria y muestra un aviso.
- El panel de progreso permite ver y copiar una copia de seguridad en JSON (no hay importación todavía).

## Cómo añadir contenido

1. Lección: añade un objeto a `CB.lessons` en un archivo de `js/content/` (o uno nuevo, incluido en `index.html` antes de `js/views/`) y su id en `curriculum.js`.
2. Ejecuta `node --test tests/*.test.js`: detecta referencias rotas, actividades sin explicación y cálculos incoherentes.
