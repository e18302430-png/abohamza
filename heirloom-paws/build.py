"""Build the deployable site into dist/ (for Cloudflare Pages: output directory = heirloom-paws/dist).

Run:  python3 build.py            (uses DOMAIN below)
      python3 build.py mysite.com
"""
import os, re, shutil, sys

DOMAIN = sys.argv[1] if len(sys.argv) > 1 else "heirloompaws.com"   # change to your real domain
ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, "dist")

body = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
body = re.sub(r'<meta name="claude:viewport-fit-sides"[^>]*>\n?', "", body)
title = re.search(r"<title>(.*?)</title>", body).group(1)
desc = re.search(r'<meta name="description" content="([^"]*)"', body).group(1)
body = re.sub(r"<title>.*?</title>\n?", "", body)
body = re.sub(r'<meta name="description"[^>]*>\n?', "", body)

url = f"https://{DOMAIN}/"
head = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#120A0C">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Heirloom Paws">
<meta property="og:title" content="Your pet, painted as royalty">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{url}og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A gallery wall of pets painted as kings, queens and knights">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Your pet, painted as royalty">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{url}og.jpg">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<style>html,body{{margin:0}}[hidden]{{display:none!important}}:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}</style>
</head>
<body>
"""
if os.path.isdir(DIST):
    shutil.rmtree(DIST)
os.makedirs(DIST)
open(os.path.join(DIST, "index.html"), "w", encoding="utf-8").write(head + body + "\n</body>\n</html>\n")
for f in ["privacy.html", "terms.html", "refunds.html", "og.jpg", "favicon.png", "apple-touch-icon.png"]:
    shutil.copy(os.path.join(ROOT, f), DIST)
shutil.copytree(os.path.join(ROOT, "img"), os.path.join(DIST, "img"))
open(os.path.join(DIST, "_headers"), "w").write(
    "/img/*\n  Cache-Control: public, max-age=31536000, immutable\n"
    "/*.png\n  Cache-Control: public, max-age=604800\n"
    "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n")
open(os.path.join(DIST, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\nSitemap: {url}sitemap.xml\n")
open(os.path.join(DIST, "sitemap.xml"), "w").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{url}{p}</loc></url>\n" for p in ["", "privacy.html", "terms.html", "refunds.html"])
    + "</urlset>\n")
print("built", DIST, "for", DOMAIN)
