"""Build the deployable site into dist/ for Cloudflare Pages.
Run:  python3 build.py partsnap.com      (then: npx wrangler pages deploy dist)
Functions in functions/ are picked up by Pages automatically.
"""
import os, re, shutil, sys, json
DOMAIN = sys.argv[1] if len(sys.argv) > 1 else "partsnap.example"
ROOT = os.path.dirname(os.path.abspath(__file__)); DIST = os.path.join(ROOT, "dist"); PUB = os.path.join(ROOT, "public")
body = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
body = re.sub(r'<meta name="claude:viewport-fit-sides"[^>]*>\n?', "", body)
title = re.search(r"<title>(.*?)</title>", body).group(1)
desc = re.search(r'<meta name="description" content="([^"]*)"', body).group(1)
body = re.sub(r"<title>.*?</title>\n?", "", body); body = re.sub(r'<meta name="description"[^>]*>\n?', "", body)
url = f"https://{DOMAIN}/"
head = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} · The exact appliance part, not a guess</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#0A0D10">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" type="image/png" href="/icon-192.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website"><meta property="og:site_name" content="PartSnap">
<meta property="og:title" content="The exact part. Not a guess."><meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{url}og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<style>html,body{{margin:0}}[hidden]{{display:none!important}}:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}</style>
</head>
<body>
"""
# Padding: the artifact preview adds the side gutter meta; on the real site body padding already handles it.
if os.path.isdir(DIST): shutil.rmtree(DIST)
shutil.copytree(PUB, DIST)
open(os.path.join(DIST, "index.html"), "w", encoding="utf-8").write(head + body + "\n</body>\n</html>\n")
open(os.path.join(DIST, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: {url}sitemap.xml\n")
open(os.path.join(DIST, "sitemap.xml"), "w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{url}{p}</loc></url>\n" for p in ["", "privacy.html", "terms.html"]) + "</urlset>\n")
print("built", DIST, "for", DOMAIN)
