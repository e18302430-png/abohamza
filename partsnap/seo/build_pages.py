"""Wrap the SEO page bodies in seo/pages/{fix,guide}/*.html into full pages under dist/.

Called by build.py. Rules (from the SEO review):
- A page stays noindex until its slug is listed in seo/verified.txt (a human checked every code,
  value and source). This protects the site from publishing unverified facts.
- Links to pages that don't exist yet are turned into plain text (no broken internal links).
- CTA links like /?type=washer&brand=whirlpool&symptom=no_drain are mapped to the app's own
  URL state (/?v=confirm&t=washer&b=Whirlpool).
"""
import os, re, json, html

def build(root, dist, domain):
    src = os.path.join(root, 'seo', 'pages')
    verified_path = os.path.join(root, 'seo', 'verified.txt')
    verified = set()
    if os.path.exists(verified_path):
        verified = {l.strip() for l in open(verified_path) if l.strip() and not l.startswith('#')}
    pages = []
    for kind in ('fix', 'guide'):
        d = os.path.join(src, kind)
        if not os.path.isdir(d):
            continue
        for f in sorted(os.listdir(d)):
            if f.endswith('.html'):
                pages.append((kind, f[:-5], open(os.path.join(d, f), encoding='utf-8').read()))
    existing = {f'/{k}/{s}' for k, s, _ in pages}
    url = f'https://{domain}'
    out = []
    for kind, slug, body in pages:
        path = f'/{kind}/{slug}'
        # map CTA query links to the app's state
        def cta(m):
            q = dict(re.findall(r'(\w+)=([^&"]+)', html.unescape(m.group(1))))
            t = q.get('type', ''); b = q.get('brand', '').title()
            params = 'v=confirm' + (f'&t={t}' if t else '') + (f'&b={b}' if b else '')
            return f'href="/?{params}"'
        body = re.sub(r'href="/\?([^"]*)"', cta, body)
        # unlink internal pages that don't exist yet
        def unlink(m):
            href, text = m.group(1), m.group(2)
            return m.group(0) if href in existing else text
        body = re.sub(r'<a href="(/(?:fix|guide)/[^"]+)"[^>]*>(.*?)</a>', unlink, body, flags=re.S)
        h1 = re.search(r'<h1>(.*?)</h1>', body, re.S)
        title = re.sub('<[^>]+>', '', h1.group(1)).strip() if h1 else slug.replace('-', ' ').title()
        quick = re.search(r'<b>Quick answer:</b>(.*?)</p>', body, re.S)
        desc = re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', quick.group(1))).strip()[:155] if quick else title
        robots = 'index,follow' if slug in verified else 'noindex,follow'
        ld = [
            {"@context": "https://schema.org", "@type": "Article", "headline": title[:110], "dateModified": "2026-11-23",
             "author": {"@type": "Organization", "name": "Fixwise repair desk"}, "publisher": {"@type": "Organization", "name": "Fixwise"},
             "mainEntityOfPage": url + path},
            {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Fixwise", "item": url + '/'},
                {"@type": "ListItem", "position": 2, "name": 'Fixes' if kind == 'fix' else 'Guides', "item": url + '/'},
                {"@type": "ListItem", "position": 3, "name": title[:80], "item": url + path}]},
        ]
        page = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title[:60])} · Fixwise</title><meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{url}{path}"><meta name="robots" content="{robots}"><link rel="icon" href="/icon-192.png">
<meta property="og:type" content="article"><meta property="og:title" content="{html.escape(title)}"><meta property="og:image" content="{url}/og.jpg">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,600..800&family=IBM+Plex+Sans:wght@400;600&family=JetBrains+Mono:wght@500;700&display=swap">
<script type="application/ld+json">{json.dumps(ld)}</script>
<style>
:root{{--bg:#F4F5F2;--panel:#fff;--ink:#0E1316;--muted:#59636B;--line:#D9DDDF;--signal:#F2601E;--scan:#08708A;--warn:#F6E9C8}}
body{{margin:0;background:var(--bg);color:var(--ink);font:17px/1.7 "IBM Plex Sans",system-ui,sans-serif;padding:0 max(16px,env(safe-area-inset-left,0px))}}
header,main,footer{{max-width:760px;margin:0 auto}} header{{display:flex;justify-content:space-between;align-items:center;padding:16px 0}}
header a{{font:800 24px "Archivo",Arial Narrow,sans-serif;font-stretch:62%;text-transform:uppercase;text-decoration:none;color:var(--ink)}}
.cta{{background:var(--signal);color:var(--ink);font:600 15px "IBM Plex Sans",sans-serif;padding:12px 16px;border-radius:10px;text-decoration:none;display:inline-block}}
h1{{font:800 clamp(34px,6vw,52px)/1.02 "Archivo",Arial Narrow,sans-serif;font-stretch:62%;text-transform:uppercase;margin:12px 0}}
h2{{font:800 26px/1.1 "Archivo",Arial Narrow,sans-serif;font-stretch:70%;margin:36px 0 10px}}
article{{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:clamp(18px,4vw,36px)}}
.disclose,.byline{{font-size:14px;color:var(--muted)}} .safety{{background:var(--warn);border-radius:12px;padding:12px 14px;margin:16px 0}}
table{{border-collapse:collapse;width:100%;font-size:15px;display:block;overflow-x:auto}} th,td{{border-bottom:1px solid var(--line);padding:8px;text-align:left;vertical-align:top}}
a{{color:var(--scan)}} code{{font-family:"JetBrains Mono",monospace}} footer{{font-size:13px;color:var(--muted);padding:28px 0}}
</style></head><body>
<header><a href="/">Fixwise</a><a class="cta" href="/?v=confirm">Snap my model label</a></header>
<main>{body}</main>
<footer>As an Amazon Associate I earn from qualifying purchases. Fixwise earns commissions from some links at no extra cost to you. Repair information is general guidance; unplug appliances and shut off water first, and leave gas, refrigerant and wiring to licensed pros. Brand names identify compatible parts only; Fixwise isn't affiliated with any manufacturer. <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a></footer>
</body></html>
'''
        dest = os.path.join(dist, kind)
        os.makedirs(dest, exist_ok=True)
        open(os.path.join(dest, slug + '.html'), 'w', encoding='utf-8').write(page)
        out.append((path, robots))
    return out
