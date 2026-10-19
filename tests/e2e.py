"""Pruebas de extremo a extremo en Chromium real (Playwright).

Uso:  python3 tests/e2e.py [--shots carpeta]
Abre index.html con file:// (el modo de uso principal: doble clic, sin servidor).
Imprime cada comprobación con OK/FALLO y termina con código 1 si alguna falla.
"""
import sys, pathlib, json
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "index.html").as_uri()
SHOTS = None
if "--shots" in sys.argv:
    SHOTS = pathlib.Path(sys.argv[sys.argv.index("--shots") + 1]); SHOTS.mkdir(parents=True, exist_ok=True)

results = []
def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("OK    " if cond else "FALLO ") + name + (f"  — {detail}" if detail and not cond else ""))

ROUTES = ["/", "/modulos", "/leccion/m1-electricidad", "/leccion/m1-magnitudes", "/leccion/m1-circuitos", "/leccion/m1-ohm",
          "/leccion/m1-potencia", "/leccion/m1-multimetro", "/leccion/m1-seguridad", "/leccion/m2-identificar", "/leccion/m3-diagramas",
          "/componentes", "/componentes/led", "/componentes/transistor", "/simbolos", "/simbolos/npn", "/laboratorio",
          "/cuestionarios", "/proyectos", "/proyectos/a1-blink-externo", "/progreso",
          "/leccion/m2-activos", "/leccion/m3-interpretar", "/leccion/m4-protoboard", "/leccion/m4-montaje",
          "/leccion/m6-tinkercad-intro", "/leccion/m6-tinkercad-arduino", "/leccion/m7-microcontrolador", "/leccion/m7-estructura",
          "/leccion/m7-entradas", "/leccion/m7-analogico", "/leccion/m7-programacion", "/leccion/m8-sensores-analogicos",
          "/leccion/m8-distancia", "/leccion/m8-actuadores", "/leccion/m8-pantallas-reles",
          "/proyectos/e1-led-basico", "/proyectos/e2-variar-resistencia", "/proyectos/e3-leds-serie", "/proyectos/e4-leds-paralelo",
          "/proyectos/e5-pulsador", "/proyectos/e6-potenciometro", "/proyectos/e7-sensor-ldr", "/proyectos/e8-zumbador",
          "/proyectos/a2-pulsador", "/proyectos/a3-potenciometro-serie", "/proyectos/a4-pwm-fade",
          "/proyectos/p1-semaforo", "/proyectos/p2-led-pulsador", "/proyectos/p3-luz-automatica", "/proyectos/p4-distancia",
          "/proyectos/p5-alarma", "/proyectos/p6-servo", "/proyectos/p7-proyecto-final"]

def go(page, route):
    page.goto(URL + "#" + route)
    page.wait_for_selector("#view h1")

with sync_playwright() as p:
    browser = p.chromium.launch()

    # ------------------------------------------------------------ escritorio
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    errors = []
    # Las fuentes de Google pueden no cargar sin conexión: la app usa fuentes de respaldo y no es un error de la app.
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" and "fonts.g" not in (m.location or {}).get("url", "") else None)
    page.on("pageerror", lambda e: errors.append(str(e)))

    for r in ROUTES:
        go(page, r)
        failed = page.locator("text=Algo falló").count()
        check(f"ruta {r} renderiza sin errores", failed == 0 and page.locator("#view h1").inner_text().strip() != "")
    check("sin errores de consola al recorrer todas las rutas", not errors, "; ".join(errors[:3]))
    go(page, "/no-existe")
    check("ruta inexistente muestra página no encontrada", "no encontrada" in page.locator("h1").inner_text().lower())

    # Navegación de lección
    go(page, "/leccion/m1-ohm")
    count = lambda: page.locator("#slide-count").inner_text()
    check("lección abre en la diapositiva 1", count() == "Diapositiva 1 de 5", count())
    page.locator("body").press("ArrowRight")
    check("flecha → avanza", count() == "Diapositiva 2 de 5", count())
    page.locator("body").press("ArrowLeft")
    check("flecha ← retrocede", count() == "Diapositiva 1 de 5", count())
    page.locator("body").press("End")
    check("Fin va a la última", count() == "Diapositiva 5 de 5", count())
    page.select_option("#jump", "2")
    check("selector salta a la diapositiva 3", count() == "Diapositiva 3 de 5", count())
    page.click("#toggle-index")
    check("índice de diapositivas visible", page.locator("#slide-index").is_visible())
    page.click("#slide-index [data-go='3']")
    check("clic en el índice salta a la diapositiva 4", count() == "Diapositiva 4 de 5", count())
    check("barra de progreso al 80 %", page.locator("#slide-bar [role=progressbar]").get_attribute("aria-valuenow") == "80")

    # Reanudar desde el último punto
    page.goto(URL + "#/")
    page.wait_for_selector("#view h1")
    check("inicio ofrece continuar la lección", "Ley de Ohm" in page.locator(".hero-actions").inner_text())
    page.goto(URL + "#/leccion/m1-ohm")  # sin ?s → debe recordar la 4
    page.reload(); page.wait_for_selector("#slide-count")
    check("reanuda en la diapositiva guardada tras recargar", count() == "Diapositiva 4 de 5", count())

    # Actividad numérica (diapositiva 2: m1-d2)
    page.select_option("#jump", "1")
    act = page.locator("[data-activity='m1-d2']")
    act.locator("input").fill("0.00409"); act.locator("button[type=submit]").click()
    fb = act.locator(".feedback")
    check("numérica: error típico explicado (amperios vs mA)", "amperios" in fb.inner_text() and "is-bad" in fb.get_attribute("class"), fb.inner_text())
    act.locator("input").fill("4,09 mA"); act.locator("button[type=submit]").click()
    check("numérica: respuesta correcta con unidad", "is-ok" in fb.get_attribute("class"), fb.inner_text())
    act.locator("text=Ver procedimiento").click()
    check("procedimiento desplegable", act.locator("details ol").is_visible())

    # Selección múltiple (diapositiva 1)
    page.select_option("#jump", "0")
    mc = page.locator("[data-activity='m1-d1']")
    mc.locator(".choice", has_text="Se duplica").click()
    check("selección múltiple: explica el error", "Más resistencia" in mc.locator(".feedback").inner_text())
    mc.locator("text=Reintentar").click()
    check("reintentar oculta la retroalimentación", mc.locator(".feedback").is_hidden())
    mc.locator(".choice", has_text="Se reduce a la mitad").click()
    check("selección múltiple: correcta", "is-ok" in mc.locator(".feedback").get_attribute("class"))

    # Completar lección y persistencia
    page.click("#complete")
    check("marcar como completada", "Completada" in page.locator("#complete").inner_text())
    page.reload(); page.wait_for_selector("#complete")
    check("completada persiste tras recargar", "Completada" in page.locator("#complete").inner_text())

    # Reiniciar actividades con confirmación propia
    page.click("#reset-acts"); page.click("#reset-yes")
    check("reiniciar actividades borra el estado de la lección", page.evaluate("CB.app.store.activity('m1-d1')") is None)

    # Ordenar pasos
    go(page, "/leccion/m1-multimetro"); page.select_option("#jump", "4")
    order = page.locator("[data-activity='m1-f4']")
    order.locator("text=Comprobar orden").click()
    check("ordenar: el orden inicial es incorrecto y se explica", "fuera de lugar" in order.locator(".feedback").inner_text())
    correct = ["Conecta la punta negra", "Gira el selector", "Toca el negativo", "Lee el valor", "Retira las puntas"]
    for target_i, text in enumerate(correct):
        for _ in range(6):
            items = order.locator(".order-text").all_inner_texts()
            cur = next(i for i, t in enumerate(items) if t.startswith(text))
            if cur == target_i: break
            order.locator(".order-item").nth(cur).locator("button").first.click()
    order.locator("text=Comprobar orden").click()
    check("ordenar: se puede resolver con los botones ↑ ↓", "is-ok" in order.locator(".feedback").get_attribute("class"), order.locator(".feedback").inner_text())

    # Diagrama interactivo y detección de errores
    go(page, "/leccion/m3-diagramas"); page.select_option("#jump", "6")
    hs = page.locator("[data-activity='m3-a6']")
    hs.locator("[data-part='r1']").click()
    check("detección de errores: explica por qué R1 no es el fallo", "R1 está bien" in hs.locator(".feedback").inner_text())
    hs.locator("[data-part='led1']").click()
    check("detección de errores: LED invertido identificado", "invertido" in hs.locator(".feedback").inner_text())
    hs.locator("[data-part='bat']").focus(); page.keyboard.press("Enter")
    check("diagrama accesible con teclado (Enter)", "batería" in hs.locator(".feedback").inner_text().lower())
    page.select_option("#jump", "1")
    sym = page.locator("[data-activity='m3-a1']")
    check("identificación de símbolos no revela los nombres", sym.locator(".choice", has_text="LED").count() == 0)

    # Bibliotecas
    go(page, "/componentes")
    page.click("[data-filter='sin-polaridad']")
    names = page.locator(".comp-name").all_inner_texts()
    check("filtro 'Sin polaridad' excluye LED y diodo", "LED" not in names and "Diodo rectificador" not in names and "Resistencia" in names, str(names))
    page.click("[data-filter='todos']"); page.fill("#comp-search", "rele")
    check("búsqueda sin acentos encuentra 'Relé'", "Relé" in page.locator(".comp-name").all_inner_texts(), str(page.locator(".comp-name").all_inner_texts()))
    go(page, "/componentes/led")
    check("ficha muestra los campos 4–11", page.locator(".field").count() == 8)
    go(page, "/simbolos")
    page.click("[data-sym='crossing']")
    check("símbolo seleccionado muestra su significado", "NO están conectados" in page.locator("#sym-detail").inner_text())

    # Laboratorio: calculadoras
    go(page, "/laboratorio")
    check("calculadora Ohm: 5 V / 220 Ω = 22.7 mA", "22.7 mA" in page.locator("#ohm-out").inner_text(), page.locator("#ohm-out").inner_text())
    check("calculadora LED: 5 V rojo 15 mA → 220 Ω", "220 Ω" in page.locator("#led-out").inner_text())
    page.fill("#in-R", "0"); page.click("#ohm-form button[type=submit]")
    check("calculadora Ohm valida entradas", "mayor que cero" in page.locator("#ohm-out").inner_text())

    # Laboratorio: verificador de protoboard (con teclado, mediante el campo de orificio)
    def place(key, hole):
        page.click(f"[data-pick='{key}']"); page.fill("#hole-in", hole); page.click("#hole-form button")
    for k, h in {"R1.1": "tp6", "R1.2": "b6", "LED1.A": "c9", "LED1.K": "c6", "J1.A": "a9", "J1.B": "tn9"}.items(): place(k, h)
    page.click("#bb-check")
    check("protoboard: detecta LED invertido", "invertido" in page.locator("#bb-result").inner_text(), page.locator("#bb-result").inner_text())
    place("LED1.A", "d20"); place("LED1.K", "d21"); place("LED1.A", "c6"); place("LED1.K", "c9")
    page.click("#bb-check")
    check("protoboard: montaje corregido es correcto", "Montaje correcto" in page.locator("#bb-result").inner_text(), page.locator("#bb-result").inner_text())
    page.click("#bb-board [data-hole='b6']")
    check("protoboard: no permite dos patas en un orificio", "ocupado" in page.locator("#bb-status").inner_text() or "elige" in page.locator("#bb-status").inner_text())
    page.click("[data-mode='explore']"); page.click("#bb-explore-board [data-hole='c12']")
    check("exploración: resalta la tira de 5 orificios", page.locator("#bb-explore-board .bb-hole.hl").count() == 5)
    check("aviso visible: no es una simulación eléctrica", page.locator("text=No es una simulación eléctrica").count() == 1)

    # Práctica A1
    go(page, "/proyectos/a1-blink-externo")
    check("práctica: encabezado muestra el código A1", page.locator(".page-head .eyebrow").inner_text().startswith("PRÁCTICA A1") or page.locator(".page-head .eyebrow").inner_text().startswith("Práctica A1"))
    check("práctica: botón bloqueado hasta completar la verificación", page.locator("#practice-done").is_disabled())
    for box in page.locator("#checklist input").all(): box.check()
    check("práctica: verificación completa habilita el botón", page.locator("#practice-done").is_enabled())
    page.click("#practice-done")
    page.reload(); page.wait_for_selector("#practice-done")
    check("práctica completada persiste", "completada" in page.locator("#practice-done").inner_text().lower())
    check("práctica: 13 líneas de código numeradas", page.locator(".code-line").count() == 13)
    check("práctica: montaje dibujado", page.locator("svg.bb").count() == 1)

    # Progreso y cuestionarios
    go(page, "/cuestionarios")
    page.click("[data-st='review']")
    check("cuestionarios: filtro 'por repasar' funciona", page.locator("#q-count").inner_text().endswith("actividad(es)"))
    page.select_option("#q-type", "order"); page.click("[data-st='all']")
    n_order = page.evaluate("Object.values(CB.app.index.activities).filter(e => e.act.type === 'order').length")
    check("cuestionarios: filtro por tipo", page.locator(".activity").count() == n_order, f"{page.locator('.activity').count()} vs {n_order}")
    go(page, "/progreso")
    txt = page.locator("#view").inner_text()
    n_lessons = page.evaluate("CB.lessons.length")
    check("progreso: muestra lección completada", f"1 / {n_lessons}" in txt, txt[:300])
    check("progreso: historial de prácticas", "Práctica: LED externo intermitente en D8" in txt)
    check("progreso: explica que no hay sincronización", "no se sincroniza" in txt)
    page.click("#export")
    data = json.loads(page.locator("#export-text").input_value())
    check("progreso: copia de seguridad JSON válida", data.get("schema") == 1 and "m1-ohm" in data["lessons"])
    page.click("#reset"); page.click("#reset-yes")
    check("progreso: borrar todo funciona", page.evaluate("Object.keys(CB.app.store.state.lessons).length") == 0)

    # ---------------- Fases 5–8
    go(page, "/modulos")
    check("módulos: ningún módulo queda como 'Planeado'", page.locator(".pill", has_text="Planeado").count() == 0)
    check("módulos: el Módulo 5 lista sus 8 prácticas", page.locator("#m5 .lesson-row").count() == 8, str(page.locator("#m5 .lesson-row").count()))
    go(page, "/proyectos")
    check("proyectos: 19 prácticas y proyectos listados", page.locator(".project-card").count() == 19, str(page.locator(".project-card").count()))
    go(page, "/leccion/m7-analogico"); page.select_option("#jump", "2")
    check("lección con código: 12 líneas numeradas", page.locator("#slide .code-line").count() == 12, str(page.locator("#slide .code-line").count()))
    page.locator("#slide .explain li").first.hover()
    check("explicación resalta su línea de código", page.locator("#slide .code-line.is-hl").count() == 1)
    go(page, "/leccion/m4-protoboard")
    check("lección con protoboard resaltada: 5 orificios", page.locator("#slide .bb-hole.hl").count() == 5)
    go(page, "/proyectos/p5-alarma")
    secs = page.locator(".toc a").all_inner_texts()
    check("proyecto: incluye planificación, pruebas, diagnóstico y evaluación", all(x in secs for x in ["Planificación", "Pruebas", "Diagnóstico", "Evaluación"]), str(secs))
    check("proyecto: montaje y esquema dibujados", page.locator("svg.bb").count() == 1 and page.locator("svg.diagram").count() >= 1)
    go(page, "/proyectos/e6-potenciometro")
    check("práctica sin Arduino: sin sección de código", "Código" not in page.locator(".toc").inner_text())
    go(page, "/proyectos/p7-proyecto-final")
    check("proyecto final: botón bloqueado sin elegir opción", page.locator("#practice-done").is_disabled())
    page.click("text=Asistente de estacionamiento")
    check("proyecto final: muestra requisitos de la opción elegida", "HC-SR04 Trig / Echo" in page.locator("#final-detail").inner_text())
    page.reload(); page.wait_for_selector("#final-detail")
    check("proyecto final: la opción elegida persiste", page.locator("input[value=estacionamiento]").is_checked())
    go(page, "/laboratorio")
    page.select_option("#bb-ex", "lab-parallel"); page.click("#bb-solution"); page.click("#bb-check")
    check("laboratorio: ejercicio de LED en paralelo verificable", "Montaje correcto" in page.locator("#bb-result").inner_text(), page.locator("#bb-result").inner_text())
    page.select_option("#bb-ex", "lab-button")
    for k, h in {"S1.1": "e4", "S1.2": "f6", "R1.1": "g6", "R1.2": "g10", "LED1.A": "h13", "LED1.K": "h10", "J1.A": "tp4", "J1.B": "a4", "J2.A": "i13", "J2.B": "tn13"}.items():
        page.click(f"[data-pick='{k}']"); page.fill("#hole-in", h); page.click("#hole-form button")
    page.click("#bb-check")
    check("laboratorio: pulsador con LED invertido se detecta", "invertido" in page.locator("#bb-result").inner_text(), page.locator("#bb-result").inner_text())

    # Accesibilidad básica
    go(page, "/"); page.reload(); page.wait_for_selector("#view h1")  # carga nueva
    page.keyboard.press("Tab")
    check("primer Tab enfoca 'Saltar al contenido'", page.evaluate("document.activeElement.className") == "skip")
    missing_alt = page.evaluate("Array.from(document.querySelectorAll('svg[role=img]')).filter(s => !s.getAttribute('aria-label') && !s.getAttribute('aria-labelledby')).length")
    check("todos los SVG con role=img tienen nombre accesible", missing_alt == 0, str(missing_alt))
    if SHOTS:
        for r, name in [("/", "inicio"), ("/leccion/m1-ohm?s=3", "leccion"), ("/laboratorio", "laboratorio"), ("/componentes/led", "componente"), ("/proyectos/a1-blink-externo", "practica"), ("/simbolos", "simbolos")]:
            go(page, r); page.screenshot(path=str(SHOTS / f"desk-{name}.png"), full_page=False)
    ctx.close()

    # ------------------------------------------------------------ móvil + oscuro
    mctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, color_scheme="dark")
    m = mctx.new_page()
    merr = []
    m.on("pageerror", lambda e: merr.append(str(e)))
    overflow = []
    for r in ROUTES:
        m.goto(URL + "#" + r); m.wait_for_selector("#view h1")
        w = m.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
        if w[0] > w[1] + 1: overflow.append(f"{r} ({w[0]}>{w[1]})")
    check("móvil 390 px: ninguna página desborda horizontalmente", not overflow, ", ".join(overflow))
    check("móvil: sin errores de JavaScript", not merr, "; ".join(merr[:3]))
    m.goto(URL + "#/"); m.wait_for_selector("#nav-toggle")
    check("móvil: menú oculto hasta pulsar el botón", not m.locator("#site-nav").is_visible())
    m.click("#nav-toggle")
    check("móvil: el botón abre el menú", m.locator("#site-nav").is_visible())
    bg = m.evaluate("getComputedStyle(document.body).backgroundColor")
    check("tema oscuro aplicado por prefers-color-scheme", bg == "rgb(15, 20, 26)", bg)
    if SHOTS:
        for r, name in [("/", "inicio"), ("/leccion/m1-circuitos?s=4", "leccion"), ("/laboratorio", "laboratorio"), ("/proyectos/a1-blink-externo", "practica")]:
            m.goto(URL + "#" + r); m.wait_for_selector("#view h1"); m.screenshot(path=str(SHOTS / f"movil-{name}.png"))
    mctx.close()
    browser.close()

failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)} de {len(results)} comprobaciones superadas.")
sys.exit(1 if failed else 0)
