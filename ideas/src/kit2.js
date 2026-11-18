// Extra scenes, props and the cast for the 10-ideas pack
/* ---------- cast ---------- */
const omar = (o) => person(Object.assign({ photo: true, R: 76, outfit: 'thobe' }, o));
const fahd = (o) => person(Object.assign({ outfit: 'team', mustache: true, skin: '#b07a52', expr: 'happy' }, o, { s: (o.s || 1) * 1.12 }));
const saud = (o) => person(Object.assign({ outfit: 'team', glasses: true, skin: C.skin2, expr: 'sly' }, o));
const nasser = (o) => person(Object.assign({ outfit: 'team', capC: C.r, skin: C.skin, expr: 'happy' }, o, { s: (o.s || 1) * .95 }));
const guy = (o) => person(Object.assign({ outfit: 'casual', color: '#3a7bd5', skin: C.skin2 }, o));
const shaib = (o) => person(Object.assign({ outfit: 'thobe', shemagh: true, mustache: true, skin: '#b07a52' }, o));
const lady = (o) => person(Object.assign({ outfit: 'lady', skin: C.skin2 }, o));
const kid = (o) => person(Object.assign({ outfit: 'casual', color: C.r, skin: C.skin2, expr: 'happy' }, o, { s: (o.s || 1) * .6 }));
const label = (x, y, t, col = C.l, fs = 34) => `<g><rect x="${x - 6 * t.length - 20}" y="${y - 30}" width="${12 * t.length + 40}" height="50" rx="12" fill="#141414"/><text x="${x}" y="${y + 6}" font-family="Plex" font-weight="700" font-size="${fs}" text-anchor="middle" fill="${col}">${t}</text></g>`;

/* ---------- backgrounds ---------- */
function bgSea() {
  let s = `<rect width="${W}" height="${H}" fill="#8fd3f5"/><circle cx="880" cy="200" r="90" fill="#ffe28a"/>`;
  s += `<rect y="560" width="${W}" height="${H - 560}" fill="#2f8fd1"/>`;
  for (let r = 0; r < 9; r++) { const y = 600 + r * 85; let d = `M0 ${y}`; for (let x = 0; x <= W; x += 60) d += `Q${x + 30} ${y - 18} ${x + 60} ${y}`; s += `<path d="${d}" stroke="#bfe6ff" stroke-width="5" fill="none" opacity=".7"/>`; }
  return s;
}
function bgBeach() { return bgSea() + `<path d="M0 1050Q540 980 ${W} 1060V${H}H0Z" fill="#f3d79b"/>`; }
function bgRoad(opts = {}) {
  let s = `<rect width="${W}" height="${H}" fill="${opts.night ? '#1b2340' : '#9fd3f2'}"/>`;
  for (let i = 0; i < 6; i++) { const x = i * 190 - 20, h = 260 + (i * 97 % 220); s += `<rect x="${x}" y="${640 - h}" width="170" height="${h}" fill="${['#e9e3d6', '#d6cdb9', '#c9bfa8'][i % 3]}" stroke="#141414" stroke-width="4"/>` + Array.from({ length: 6 }, (_, j) => `<rect x="${x + 20 + (j % 3) * 50}" y="${660 - h + 30 + Math.floor(j / 3) * 70}" width="30" height="40" fill="#8ec5df"/>`).join(''); }
  s += `<path d="M0 640H${W}V${H}H0Z" fill="#4a4a4a"/><path d="M540 640L470 ${H}H610Z" fill="none"/>`;
  for (let i = 0; i < 6; i++) { const y = 680 + i * 120, w = 12 + i * 8; s += `<rect x="${540 - w / 2}" y="${y}" width="${w}" height="${50 + i * 14}" fill="#f4f1ea"/>`; }
  return s;
}
function bgWarehouse(dark) {
  let s = `<rect width="${W}" height="${H}" fill="${dark ? '#151a22' : '#3a3f47'}"/>`;
  for (let c = 0; c < 3; c++) { const x = 40 + c * 350;
    s += `<rect x="${x}" y="140" width="20" height="1000" fill="#e0662a"/><rect x="${x + 300}" y="140" width="20" height="1000" fill="#e0662a"/>`;
    for (let r = 0; r < 4; r++) { const y = 380 + r * 250; s += `<rect x="${x}" y="${y}" width="320" height="16" fill="#3a7bd5"/>` + Array.from({ length: 3 }, (_, j) => `<rect x="${x + 22 + j * 96}" y="${y - 150}" width="88" height="150" fill="#c8a06a" stroke="#141414" stroke-width="3"/>`).join(''); } }
  s += `<rect y="1140" width="${W}" height="210" fill="#5a5f66"/>`;
  return s + (dark ? `<rect width="${W}" height="${H}" fill="#000" opacity=".45"/>` : '');
}
function torch(x, y, a, len = 900, w = 260) { const r = a * Math.PI / 180; const ex = x + Math.cos(r) * len, ey = y + Math.sin(r) * len, px = -Math.sin(r) * w, py = Math.cos(r) * w;
  return `<path d="M${x} ${y}L${ex + px} ${ey + py}L${ex - px} ${ey - py}Z" fill="#fff6c2" opacity=".35"/>`; }
function bgKitchen() {
  let s = `<rect width="${W}" height="${H}" fill="#f2ead8"/>`;
  for (let y = 0; y < 900; y += 80) for (let x = (y / 80 % 2) * 40; x < W; x += 80) s += `<rect x="${x}" y="${y}" width="76" height="76" fill="#fbf6ea" stroke="#e2d8c2" stroke-width="2"/>`;
  s += `<rect y="900" width="${W}" height="450" fill="#b98a5a"/><rect y="880" width="${W}" height="40" fill="#8a6440"/>`;
  return s;
}
function fridge(x, y, open, full, s = 1) {
  let inside = '';
  if (open) { inside = `<rect x="-200" y="-760" width="400" height="740" fill="#eef6fb"/>`; for (let r = 0; r < 4; r++) { inside += `<rect x="-200" y="${-580 + r * 180}" width="400" height="10" fill="#c9d9e3"/>`;
      if (full) inside += Array.from({ length: 5 }, (_, j) => `<rect x="${-185 + j * 76}" y="${-700 + r * 180}" width="64" height="110" rx="8" fill="${PRODUCT_COLS[(j + r) % 8]}" stroke="#141414" stroke-width="3"/>`).join('');
      else if (r === 1) inside += `<circle cx="-120" cy="-410" r="26" fill="#d7e85a" stroke="#141414" stroke-width="3"/>`; } }
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-220" y="-780" width="440" height="780" rx="24" fill="#dfe5ea" stroke="#141414" stroke-width="7"/>${inside}${open ? `<path d="M220 -780L380 -720V-60L220 0Z" fill="#cfd6dc" stroke="#141414" stroke-width="6"/>` : `<rect x="150" y="-600" width="20" height="200" rx="10" fill="#8a9299"/>`}</g>`;
}
function bgStreet() {
  let s = `<rect width="${W}" height="${H}" fill="#9fd3f2"/>`;
  s += `<path d="M0 520L460 470V${H}H0Z" fill="#d6cdb9" stroke="#141414" stroke-width="4"/><path d="M${W} 520L620 470V${H}H${W}Z" fill="#c9bfa8" stroke="#141414" stroke-width="4"/>`;
  s += `<path d="M300 ${H}L500 480H580L780 ${H}Z" fill="#4a4a4a"/>`;
  return s;
}
function receiptStrip() {
  let s = `<path d="M380 ${H}L525 480H555L700 ${H}Z" fill="#fffdf6" stroke="#141414" stroke-width="4"/>`;
  for (let i = 0; i < 16; i++) { const t = Math.pow(i / 16, 1.6), y = H - (H - 490) * t, w = (320 - 300 * t) / 2; s += `<path d="M${540 - w * .8} ${y}H${540 + w * .2}" stroke="#bbb" stroke-width="${6 - 5 * t}"/><path d="M${540 + w * .4} ${y}H${540 + w * .8}" stroke="#ff4b2b" stroke-width="${6 - 5 * t}"/>`; }
  return s;
}
function bgParking() {
  let s = `<rect width="${W}" height="${H}" fill="#9fd3f2"/><rect y="520" width="${W}" height="${H - 520}" fill="#4f4f4f"/>`;
  for (let i = 0; i < 8; i++) s += `<path d="M${i * 160 - 40} 560L${i * 160 - 120} ${H}" stroke="#f4f1ea" stroke-width="6" opacity=".6"/>`;
  return s;
}
function checker(x, y, w, h, n = 12) { let s = ''; const c = w / n; for (let r = 0; r < Math.round(h / c); r++) for (let i = 0; i < n; i++) s += `<rect x="${x + i * c}" y="${y + r * c}" width="${c}" height="${c}" fill="${(i + r) % 2 ? '#141414' : '#fff'}"/>`; return s; }
function bgDesert(storm) {
  let s = `<rect width="${W}" height="${H}" fill="${storm ? '#d9a35a' : '#ffd79a'}"/>`;
  s += `<path d="M0 760Q270 640 540 760T${W} 740V${H}H0Z" fill="#e7b46a"/><path d="M0 980Q360 860 720 990T${W} 960V${H}H0Z" fill="#d89c50"/>`;
  return s + (storm ? `<rect width="${W}" height="${H}" fill="#c98a3a" opacity=".45"/>` + Array.from({ length: 30 }, (_, i) => `<path d="M${(i * 137) % W} ${(i * 211) % H}h${120 + i % 5 * 30}" stroke="#fff3d6" stroke-width="4" opacity=".6"/>`).join('') : '');
}
function bgMountain() {
  return `<rect width="${W}" height="${H}" fill="#bfe3f5"/><path d="M0 820L260 380L470 700L700 300L${W} 760V${H}H0Z" fill="#8a7a6a" stroke="#141414" stroke-width="5"/><path d="M0 1000Q540 880 ${W} 1000V${H}H0Z" fill="#a89478"/><path d="M200 ${H}Q500 900 760 640" stroke="#555" stroke-width="60" fill="none"/>`;
}
function bgDoor() {
  return `<rect width="${W}" height="${H}" fill="#e9dcc2"/>${Array.from({ length: 14 }, (_, i) => `<path d="M0 ${i * 100}H${W}" stroke="#d8c8a8" stroke-width="3"/>`).join('')}<rect x="330" y="300" width="420" height="900" rx="10" fill="#7a4e2c" stroke="#141414" stroke-width="8"/><rect x="370" y="350" width="340" height="360" fill="#6a4224"/><rect x="370" y="760" width="340" height="380" fill="#6a4224"/><circle cx="700" cy="780" r="16" fill="#e4c060"/><rect y="1200" width="${W}" height="150" fill="#bfae8c"/>`;
}
function bgBoard() {
  let s = `<rect width="${W}" height="${H}" fill="#1a1d24"/><rect x="90" y="170" width="900" height="600" fill="#1f4d7a" stroke="#e8e8e8" stroke-width="10"/>`;
  for (let i = 0; i < 12; i++) s += `<path d="M90 ${190 + i * 50}H990M${110 + i * 75} 170V770" stroke="#4f86b8" stroke-width="2"/>`;
  s += `<rect x="200" y="260" width="300" height="200" fill="none" stroke="#fff" stroke-width="6"/><text x="350" y="370" font-family="Plex" font-weight="700" font-size="36" fill="#fff" text-anchor="middle">المستودع</text>`;
  s += `<path d="M500 360Q650 300 760 520" stroke="${C.r}" stroke-width="8" fill="none" stroke-dasharray="20 14"/><text x="780" y="600" font-family="Lalezar" font-size="60" fill="${C.l}">X</text>`;
  s += `<path d="M0 1050H${W}" stroke="#2a2f3a" stroke-width="600"/>`;
  return s;
}
function bgMap() {
  let s = `<rect width="${W}" height="${H}" fill="#efe2c4"/>`;
  s += `<path d="M150 420Q300 260 620 300Q900 340 960 600Q980 900 760 1100Q480 1240 300 1060Q140 900 150 420Z" fill="#e3c98f" stroke="#141414" stroke-width="6"/>`;
  return s;
}
function pin(x, y, t, active) { return `<path d="M${x} ${y}q-34 -50 -34 -80a34 34 0 1 1 68 0q0 30 -34 80z" fill="${active ? C.r : '#141414'}" stroke="#141414" stroke-width="4"/><circle cx="${x}" cy="${y - 82}" r="12" fill="#fff"/><text x="${x}" y="${y + 50}" font-family="Lalezar" font-size="52" text-anchor="middle" fill="#141414">${t}</text>`; }
function stopwatch(x, y, t, s = 1, col = C.r) { return `<g transform="translate(${x} ${y}) scale(${s})"><circle r="120" fill="#fff" stroke="#141414" stroke-width="10"/><rect x="-24" y="-160" width="48" height="36" rx="8" fill="#141414"/><text y="24" font-family="monospace" font-weight="700" font-size="66" text-anchor="middle" fill="${col}" direction="ltr">${t}</text></g>`; }
function phoneOrder(x, y, s, html) { return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-230" y="-440" width="460" height="880" rx="60" fill="#141414"/><rect x="-206" y="-410" width="412" height="820" rx="44" fill="#f4f1ea"/><foreignObject x="-190" y="-380" width="380" height="760"><div xmlns="http://www.w3.org/1999/xhtml" dir="rtl" style="font-family:Plex;color:#141414">${html}</div></foreignObject></g>`; }
function ghost(x, y, s = 1) { return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-150 0Q-170 -500 0 -520Q170 -500 150 0L110 -40L70 0L30 -40L-10 0L-50 -40L-90 0L-120 -40Z" fill="#fff" stroke="#141414" stroke-width="7"/><ellipse cx="-50" cy="-370" rx="22" ry="34" fill="#141414"/><ellipse cx="50" cy="-370" rx="22" ry="34" fill="#141414"/><ellipse cx="0" cy="-280" rx="30" ry="40" fill="#141414"/></g>`; }
function lasers() { let s = ''; for (let i = 0; i < 6; i++) s += `<path d="M0 ${560 + i * 110}L${W} ${480 + i * 130 + (i % 2) * 90}" stroke="${C.r}" stroke-width="6" opacity=".9"/><path d="M0 ${560 + i * 110}L${W} ${480 + i * 130 + (i % 2) * 90}" stroke="${C.r}" stroke-width="20" opacity=".25"/>`; return s; }
function priceTagBig(x, y, old, neu, r = 0) { return tag(x, y, old, neu, r); }

/* ---------- text pages ---------- */
function scriptPage(title, logline, beats, mech) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#f4f1ea"/>
  <foreignObject x="60" y="50" width="960" height="1250"><div xmlns="http://www.w3.org/1999/xhtml" dir="rtl" style="font-family:Plex;color:#141414">
   <div style="font-weight:700;font-size:26px;color:#ff4b2b">السيناريو الكامل</div>
   <div style="font-family:Lalezar;font-size:72px;line-height:1.1">${title}</div>
   <div style="font-size:28px;font-weight:700;background:#141414;color:#e4ff3a;padding:14px 22px;border-radius:14px;margin:14px 0 18px;line-height:1.5">${logline}</div>
   ${beats.map(b => `<div style="display:flex;gap:16px;margin-bottom:10px;align-items:flex-start"><div style="flex:none;font-family:monospace;font-weight:700;font-size:22px;background:#e4ff3a;padding:4px 10px;border-radius:8px;direction:ltr">${b[0]}</div><div style="font-size:24px;line-height:1.5">${b[1]}</div></div>`).join('')}
   <div style="margin-top:14px;border-top:3px solid #141414;padding-top:12px;font-size:24px;line-height:1.55"><b style="color:#ff4b2b">ليه تنفجر:</b> ${mech}</div>
  </div></foreignObject></svg>`;
}
function bioPage() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}<rect width="${W}" height="${H}" fill="#0b0b0b"/>${rays(540, 360, C.l, .08)}
  <foreignObject x="70" y="80" width="940" height="1200"><div xmlns="http://www.w3.org/1999/xhtml" dir="rtl" style="font-family:Plex;color:#f4f1ea">
   <div style="font-weight:700;font-size:28px;color:#e4ff3a">صاحب هذي الأفكار</div>
   <div style="font-family:Lalezar;font-size:150px;line-height:1;margin-top:6px">إبراهيم غانم</div>
   <div style="font-family:Lalezar;font-size:56px;color:#e4ff3a;line-height:1.2;margin-top:10px">أحوّل الفكرة المجنونة… لنظام شغّال في أيام.</div>
   <div style="font-size:30px;line-height:1.65;margin-top:26px;color:#cfcac0">أبني بالذكاء الاصطناعي أنظمة كاملة من الصفر، وأطلّع منها محتوى يبيع. شخص واحد بعقل فريق كامل.</div>
   <div style="margin-top:26px;display:grid;gap:16px">
     <div style="background:#171717;border:2px solid #2a2a2a;border-radius:22px;padding:20px 24px"><b style="color:#e4ff3a;font-size:30px">🛒 نظام سوبرماركت كامل</b><div style="font-size:24px;color:#cfcac0;margin-top:6px">مبيعات ومحاسبة ومخزون، وتحليلات، وطلبات أونلاين بكود QR، ومساعد ذكي يقرا أرقام المحل ويقترح القرار. بنيته بنفسي.</div></div>
     <div style="background:#171717;border:2px solid #2a2a2a;border-radius:22px;padding:20px 24px"><b style="color:#e4ff3a;font-size:30px">🎬 ماكينة فيديوهات فيرال</b><div style="font-size:24px;color:#cfcac0;margin-top:6px">تكتب السيناريو، والماكينة تطلّع فيديو كامل بالحركة والموسيقى والمؤثرات. كل شي بالكود.</div></div>
     <div style="background:#171717;border:2px solid #2a2a2a;border-radius:22px;padding:20px 24px"><b style="color:#e4ff3a;font-size:30px">⚡ هذا الملف نفسه</b><div style="font-size:24px;color:#cfcac0;margin-top:6px">الأفكار والسيناريوهات والرسومات وكل صفحة هنا، طلعت من أنظمتي مع الذكاء الاصطناعي.</div></div>
   </div>
   <div style="margin-top:34px;background:#e4ff3a;color:#141414;border-radius:24px;padding:26px 30px">
     <div style="font-family:Lalezar;font-size:46px">خلّينا نسوّيها مع بعض</div>
     <div style="font-size:40px;font-weight:700;margin-top:8px;direction:ltr;text-align:right">📞 0597006485</div>
     <div style="font-size:34px;font-weight:700;margin-top:4px;direction:ltr;text-align:right">✉️ e18302430@gmail.com</div>
   </div>
  </div></foreignObject></svg>`;
}
