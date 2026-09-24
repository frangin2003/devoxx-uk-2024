"""Bundle the playground into one self-contained HTML file (dist/).

The source tree stays modular; this inlines every <script src> so the result
opens anywhere as a single file, including phone viewers that can't load
sibling files. Run after any change:  python tools/build.py
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / "index.html").read_text()

def inline(m):
    src = m.group(1)
    code = (ROOT / src).read_text()
    return f"<script>/* {src} */\n{code}\n</script>"

out = re.sub(r'<script src="([^"]+)"></script>', inline, html)
assert "<script src=" not in out
dist = ROOT / "dist"; dist.mkdir(exist_ok=True)
(dist / "g3po-motion-playground.html").write_text(out)
print(f"dist/g3po-motion-playground.html  {len(out)/1024:.0f} KB")
