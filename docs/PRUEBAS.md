# Pruebas ejecutadas y resultados

Fecha de ejecución: 2026-10-18. Entorno: Linux, Node.js 22.22.0, Python 3.13 con Playwright 1.56.0 y Chromium 141.

## Cómo ejecutarlas

```bash
node --test tests/*.test.js          # contenido y motores (sin navegador)
python3 tests/e2e.py                 # extremo a extremo en Chromium, abriendo index.html con file://
python3 tests/e2e.py --shots capturas  # además guarda capturas de escritorio y móvil
```

`e2e.py` termina con código 1 si alguna comprobación falla.

## Resultado de la última ejecución

| Suite | Resultado |
|---|---|
| `tests/content.test.js` + `tests/engine.test.js` | **37 de 37** pruebas superadas |
| `tests/e2e.py` (escritorio 1280 px + móvil 390 px en tema oscuro) | **80 de 80** comprobaciones superadas |

### Pruebas de contenido y motores (37)

- index.html carga todos los scripts de contenido y motores en el orden correcto
- Identificadores de actividades únicos en toda la app (56 actividades)
- Cada actividad tiene retroalimentación específica según su tipo (cada opción de selección múltiple tiene su explicación; cada error típico numérico tiene un mensaje propio y no coincide con la respuesta correcta)
- Los tipos de actividad pedidos están presentes (selección múltiple, V/F, símbolos, componentes, ordenar, diagramas, ley de Ohm, detección de errores, reflexión, reto práctico)
- Respuestas numéricas recalculadas de forma independiente (11 actividades)
- Lecciones: diapositivas con contenido, referencias a actividades, medios y enlaces internos válidos
- Módulo 1 completo: cubre los 20 temas del temario
- Currículo: 9 módulos; cada lección enlazada una sola vez; los módulos "Planeado" no tienen lecciones
- Componentes: 16 fichas con los 11 campos
- Polaridad: resistencia, pulsador, potenciómetro, LDR, termistor, protoboard y jumpers sin polaridad; LED, diodo, fuente, sensores y Arduino polarizados; condensador "depende"; transistor "patas no intercambiables"
- Símbolos: 21 entradas, dibujables y con SVG balanceado
- Diagramas: etiquetas balanceadas y descripción accesible
- Práctica A1: plantilla completa; pines válidos para Arduino Uno R3 (D2–D13); `analogWrite` solo en pines PWM; llaves balanceadas; corriente < 20 mA
- Ley de Ohm, resistencia de LED, serie E12, serie y paralelo
- Interpretación de números escritos por estudiantes (comas, prefijos, unidades) y formato con prefijos SI
- Modelo de protoboard: tiras de 5, canal central, carriles continuos
- Verificador: solución de referencia correcta; resistencia antes o después del LED; detecta LED invertido, LED sin resistencia, componente con ambas patas en la misma tira, cortocircuito de alimentación, camino abierto a GND, resistencia y ánodo en tiras distintas, terminales sin colocar, orificio repetido y cable a medias
- **El montaje dibujado de la práctica A1 pasa el verificador**, por lo que coincide con su esquema
- Almacenamiento: guarda y recupera; sin `localStorage` funciona en memoria y lo indica; datos corruptos no rompen la app; historial limitado a 200 eventos; borrado total
- Evaluadores de actividades: numérica con unidad escrita ("4,09 mA"), errores típicos, selección múltiple, V/F, ordenar, diagrama interactivo, reflexión

### Pruebas en navegador (80)

- Las 21 rutas renderizan sin errores; ninguna da error de JavaScript ni de consola; ruta inexistente muestra "Página no encontrada"
- Lección: ← → avanzan y retroceden, Fin va a la última, el selector y el índice saltan a una diapositiva concreta, la barra de progreso se actualiza
- Reanudar: el inicio ofrece continuar la última lección y, tras recargar, la lección abre en la diapositiva guardada
- Actividades: retroalimentación específica en numéricas, selección múltiple, ordenar (resoluble con ↑ ↓), diagrama interactivo (también con teclado) y detección de errores; "Reintentar" funciona; la identificación de símbolos no muestra los nombres
- Marcar como completada persiste tras recargar; reiniciar actividades borra solo las de esa lección
- Bibliotecas: filtros por polaridad, búsqueda sin acentos, ficha con los campos 4–11, detalle del símbolo seleccionado
- Laboratorio: calculadoras de Ohm y de LED con validación de entradas; verificador detecta LED invertido y acepta el montaje corregido; impide dos patas en un orificio; modo exploración resalta la tira de 5 orificios; aviso visible de que no es una simulación
- Práctica A1: botón de completar bloqueado hasta marcar la lista de verificación; el estado persiste; 13 líneas de código numeradas; montaje dibujado
- Cuestionarios: filtros por estado y por tipo
- Progreso: lecciones, historial de prácticas, aviso de que no hay sincronización, copia de seguridad JSON válida, borrado total
- Accesibilidad básica: el primer Tab llega a "Saltar al contenido"; todos los SVG con `role="img"` tienen nombre accesible
- Móvil 390 px: ninguna de las 21 rutas desborda horizontalmente; el menú se abre con su botón; el tema oscuro se aplica con `prefers-color-scheme`

## Errores encontrados durante las pruebas y corregidos

| Error | Cómo se detectó | Corrección |
|---|---|---|
| En la actividad "2,2 kΩ a 9 V", un "error típico" (usar 2,2 en lugar de 2 200 Ω) daba el mismo número que la respuesta correcta en mA, así que una respuesta correcta podía recibir un mensaje de error. | Prueba de contenido | Se eliminó ese caso: V ÷ kΩ da directamente mA. |
| Las piezas colocadas en la protoboard tapaban los orificios y no dejaban hacer clic en ellos. | Prueba en navegador | La capa de piezas no recibe eventos de puntero. |
| En la primera carga el foco iba al título y el primer Tab no llegaba a "Saltar al contenido". | Prueba en navegador | El foco solo se mueve al título al cambiar de página, no en la carga inicial. |
| La práctica A1 tenía dos propiedades `code` (código corto "A1" y el sketch): la segunda pisaba a la primera y el encabezado mostraba el programa entero. | Revisión visual de capturas | El sketch se llama ahora `sketch`; una prueba verifica que `code` sigue siendo "A1". |
| Etiquetas superpuestas en diagramas (signo + sobre la placa de la batería, "rojo" sobre las flechas del LED, texto de la corriente sobre un cable) y etiquetas de cables solapadas en la protoboard. | Revisión visual de capturas | Etiquetas reubicadas; los cables que llegan desde la placa tienen su etiqueta en un margen superior. |
| El temario del Módulo 1 no contenía la palabra "seguridad" en las diapositivas (solo en el título de la lección). | Prueba de contenido | Título de diapositiva ajustado. |

## Lo que NO se ha probado

- **Otros navegadores**: solo Chromium. No se probó en Firefox ni en Safari (la app usa `:has()` en CSS, compatible con versiones recientes de ambos).
- **Lectores de pantalla**: se comprobaron nombres accesibles, foco y navegación por teclado, pero no se probó con NVDA, VoiceOver o TalkBack.
- **Fuentes de Google**: el entorno de pruebas no tiene acceso a internet, así que las capturas usan las fuentes de respaldo.
- **Enlace a Tinkercad**: no se pudo abrir desde el entorno de desarrollo. Está marcado en la app como "pendiente de verificación". Los pasos de Tinkercad describen su interfaz conocida, pero no se ejecutaron en esta sesión.
- **Montaje físico real y carga del sketch en una placa**: el código se validó estáticamente (estructura, pines, límites de corriente), no se compiló con el Arduino IDE ni se cargó en una placa.
