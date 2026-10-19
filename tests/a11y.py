"""Auditoría automática de accesibilidad con axe-core (reglas WCAG 2.0, 2.1 y 2.2, niveles A y AA).

Recorre todas las rutas de la app en tema claro y oscuro, abre los paneles que se despliegan
(índice de diapositivas, explicaciones adicionales) y, en cada lección, todas sus diapositivas.

Uso: python3 tests/a11y.py [--browser chromium|firefox|webkit]   (requiere `npm install` para axe-core)
Termina con código 1 si hay alguna infracción.

Una auditoría automática detecta aproximadamente un tercio de los problemas de accesibilidad
(contraste, nombres, roles, estructura). No sustituye a probar con un lector de pantalla.
"""
import json, pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "index.html").as_uri()
AXE = (ROOT / "node_modules/axe-core/axe.min.js").read_text(encoding="utf-8")
BROWSER = sys.argv[sys.argv.index("--browser") + 1] if "--browser" in sys.argv else "chromium"
TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

def audit(page):
    page.add_script_tag(content=AXE) if not page.evaluate("!!window.axe") else None
    res = page.evaluate("""async (tags) => {
        const r = await axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] });
        return r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map(n => ({ target: n.target.join(' '), summary: (n.failureSummary || '').split('\\n').slice(0, 2).join(' ') })) }));
    }""", TAGS)
    return res

problems = {}
checked = 0
with sync_playwright() as p:
    browser = getattr(p, BROWSER).launch()
    for scheme in ("light", "dark"):
        ctx = browser.new_context(viewport={"width": 1280, "height": 900}, color_scheme=scheme)
        page = ctx.new_page()
        page.goto(URL + "#/"); page.wait_for_selector("#view h1")
        routes = page.evaluate("""() => {
            const r = ['/', '/modulos', '/componentes', '/simbolos', '/laboratorio', '/cuestionarios', '/proyectos', '/progreso'];
            CB.lessons.forEach(l => r.push('/leccion/' + l.id));
            CB.components.list.forEach(c => r.push('/componentes/' + c.id));
            CB.practices.list.forEach(x => r.push('/proyectos/' + x.id));
            return r;
        }""")
        for route in routes:
            page.goto(URL + "#" + route); page.wait_for_selector("#view h1")
            states = [route]
            if route.startswith("/leccion/"):
                page.click("#toggle-index")
                n = page.locator("#jump option").count()
                for i in range(n):
                    page.select_option("#jump", str(i))
                    page.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)")
                    for v in audit(page):
                        problems.setdefault((scheme, v["id"]), {"v": v, "where": []})["where"].append(f"{route}?s={i}")
                    checked += 1
                continue
            page.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)")
            for v in audit(page):
                problems.setdefault((scheme, v["id"]), {"v": v, "where": []})["where"].append(route)
            checked += 1
        ctx.close()
    browser.close()

print(f"axe-core en {BROWSER}: {checked} pantallas auditadas (temas claro y oscuro), reglas {', '.join(TAGS)}\n")
if not problems:
    print("Sin infracciones.")
    sys.exit(0)
for (scheme, rid), info in sorted(problems.items()):
    v = info["v"]
    print(f"FALLO [{scheme}] {rid} ({v['impact']}): {v['help']} — {len(info['where'])} pantallas, p. ej. {info['where'][0]}")
    for n in v["nodes"]:
        print(f"      {n['target']}: {n['summary']}")
sys.exit(1)
