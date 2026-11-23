#!/usr/bin/env python3
"""Builds dist/: injects the shared Egyptian data (lib/egypt.js) into index.html and copies public/.
Run: python3 build.py   then   npx wrangler pages deploy dist"""
import json, os, shutil, subprocess
ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, "dist")
js = "import('./lib/egypt.js').then(m=>process.stdout.write(JSON.stringify({CATEGORIES:m.CATEGORIES,PRICES:m.PRICES,DICTIONARY:m.DICTIONARY,EMERGENCY:m.EMERGENCY})))"
data = subprocess.run(["node", "--input-type=module", "-e", js], cwd=ROOT, check=True, capture_output=True, text=True).stdout
json.loads(data)
html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
assert "<!--@DATA@-->" in html and "<!--@WORLD@-->" in html
world = open(os.path.join(ROOT, "world.js"), encoding="utf-8").read()
html = html.replace("<!--@WORLD@-->", "<script>\n" + world + "\n</script>")
html = html.replace("<!--@DATA@-->", "<script>window.__DATA__=" + data.replace("</", "<\\/") + "</script>")
shutil.rmtree(DIST, ignore_errors=True)
shutil.copytree(os.path.join(ROOT, "public"), DIST)
open(os.path.join(DIST, "index.html"), "w", encoding="utf-8").write(html)
print("dist/index.html", len(html.encode()) // 1024, "KB")
