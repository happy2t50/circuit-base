"""Genera dist/ para publicar la app como página alojada (claude.ai Artifact).

El alojamiento añade su propio <!doctype>, <html>, <head> y <body>, así que aquí se quitan
esas etiquetas de index.html y se copian css/ y js/ sin cambios. La app local no se modifica.
Uso: python3 tools/build_artifact.py
"""
import pathlib, re, shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
if DIST.exists():
    shutil.rmtree(DIST)
DIST.mkdir()

html = (ROOT / "index.html").read_text(encoding="utf-8")
html = re.sub(r"<!doctype html>\s*", "", html, flags=re.I)
html = re.sub(r"</?html[^>]*>\s*", "", html, flags=re.I)
html = re.sub(r"</?head>\s*", "", html, flags=re.I)
html = re.sub(r"</?body>\s*", "", html, flags=re.I)
html = re.sub(r'<meta charset="utf-8">\s*', "", html)
html = re.sub(r'<meta name="viewport"[^>]*>\s*', "", html)
(DIST / "index.html").write_text(html, encoding="utf-8")
shutil.copytree(ROOT / "css", DIST / "css")
shutil.copytree(ROOT / "js", DIST / "js")
print("\n".join(str(p.relative_to(DIST)) for p in sorted(DIST.rglob("*")) if p.is_file()))
