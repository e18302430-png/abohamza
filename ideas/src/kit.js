// Comic storyboard drawing kit (SVG, 1080x1350 panels)
const W = 1080, H = 1350;
const C = { k: '#0b0b0b', c: '#f4f1ea', l: '#e4ff3a', r: '#ff4b2b', skin: '#c98e62', skin2: '#e0b089', navy: '#1f2b45', ink: '#141414' };
let UID = 0; const uid = p => p + (++UID);

function defs() {
  return `<defs>
  <pattern id="halftone" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.2" fill="#000" opacity=".14"/></pattern>
  <pattern id="shm" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#f4f1ea"/><path d="M0 0H11V11H0Z M11 11H22V22H11Z" fill="#d9382a"/></pattern>
  <pattern id="tiles" width="120" height="60" patternUnits="userSpaceOnUse"><rect width="120" height="60" fill="#d8d3c6"/><path d="M0 0H120M0 0V60" stroke="#c4bfb1" stroke-width="3"/></pattern>
  <pattern id="scan" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="3" fill="#000" opacity=".22"/></pattern>
  <filter id="gray"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="1.25" intercept="-.08"/><feFuncG type="linear" slope="1.25" intercept="-.08"/><feFuncB type="linear" slope="1.25" intercept="-.08"/></feComponentTransfer></filter>
  <radialGradient id="vig" cx="50%" cy="45%" r="70%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".75"/></radialGradient>
  </defs>`;
}

/* ---------------- backgrounds ---------------- */
const PRODUCT_COLS = ['#e4ff3a', '#ff4b2b', '#f4f1ea', '#3a7bd5', '#f2a33a', '#7bc96f', '#c94fd6', '#ffd23a'];
function shelfRow(x1, y1, x2, y2, h, seed) {
  // products between two lines; simple slanted row
  let s = '', n = 14;
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + .82) / n;
    const ax = x1 + (x2 - x1) * t0, ay = y1 + (y2 - y1) * t0, bx = x1 + (x2 - x1) * t1, by = y1 + (y2 - y1) * t1;
    const hh = h * (1 - t0 * .55) * (.7 + ((i * 7 + seed * 3) % 5) / 12);
    const hh2 = h * (1 - t1 * .55) * (.7 + ((i * 7 + seed * 3) % 5) / 12);
    s += `<path d="M${ax} ${ay}L${bx} ${by}L${bx} ${by - hh2}L${ax} ${ay - hh}Z" fill="${PRODUCT_COLS[(i + seed) % 8]}" stroke="#0b0b0b" stroke-width="2"/>`;
  }
  return s;
}
function bgAisle(opts = {}) {
  const vx = 540, vy = 560;
  let s = `<rect width="${W}" height="${H}" fill="#efe9dc"/>`;
  s += `<path d="M0 0H${W}V300L${vx} ${vy - 60}L0 300Z" fill="#fbf8f1"/>`; // ceiling
  for (let i = 0; i < 4; i++) { const y = 40 + i * 70, w = 300 - i * 60; s += `<rect x="${vx - w / 2}" y="${y}" width="${w}" height="16" rx="8" fill="#fff" stroke="#ddd"/>`; }
  s += `<path d="M0 ${H}H${W}L${vx + 60} ${vy + 40}H${vx - 60}Z" fill="url(#tiles)"/>`; // floor
  // left wall shelves
  s += `<path d="M0 230L${vx - 70} ${vy - 70}L${vx - 70} ${vy + 50}L0 1180Z" fill="#2b2b2b"/>`;
  s += `<path d="M${W} 230L${vx + 70} ${vy - 70}L${vx + 70} ${vy + 50}L${W} 1180Z" fill="#2b2b2b"/>`;
  for (let r = 0; r < 4; r++) {
    const yL = 420 + r * 210, yV = vy - 40 + r * 25;
    s += `<path d="M0 ${yL}L${vx - 70} ${yV}" stroke="#555" stroke-width="10"/>` + shelfRow(0, yL - 6, vx - 75, yV - 4, 150, r);
    s += `<path d="M${W} ${yL}L${vx + 70} ${yV}" stroke="#555" stroke-width="10"/>` + shelfRow(W, yL - 6, vx + 75, yV - 4, 150, r + 3);
  }
  s += `<rect x="${vx - 70}" y="${vy - 70}" width="140" height="120" fill="#f4f1ea"/>`;
  if (opts.banner) s += `<rect x="290" y="250" width="500" height="90" rx="10" fill="${C.k}"/><foreignObject x="290" y="250" width="500" height="90"><div xmlns="http://www.w3.org/1999/xhtml" style="color:${C.l};font-family:Lalezar;font-size:56px;text-align:center;line-height:90px">${opts.banner}</div></foreignObject>`;
  return s;
}
function bgCheckout(opts = {}) {
  let s = `<rect width="${W}" height="${H}" fill="#f4f1ea"/>`;
  s += `<rect y="0" width="${W}" height="760" fill="#e8e1d2"/>`;
  s += `<rect x="60" y="170" width="420" height="150" rx="20" fill="${C.k}"/><text x="270" y="280" font-family="Lalezar" font-size="110" fill="${C.l}" text-anchor="middle">كيو</text>`;
  for (let i = 0; i < 5; i++) s += `<rect x="${560 + i * 100}" y="300" width="70" height="${120 + (i % 3) * 40}" rx="8" fill="${PRODUCT_COLS[i + 2]}" stroke="#0b0b0b" stroke-width="3"/>`;
  s += `<rect x="530" y="460" width="520" height="22" fill="#555"/>`;
  s += `<rect y="760" width="${W}" height="${H - 760}" fill="url(#tiles)"/>`;
  if (!opts.noCounter) {
    s += `<path d="M0 860H${W}V1010H0Z" fill="#3a3a3a"/><path d="M0 860H${W}V900H0Z" fill="#5a5a5a"/>`;
    s += `<rect x="40" y="1010" width="${W - 80}" height="340" fill="#262626"/>`;
  }
  return s;
}
function bgFreezer() {
  let s = `<rect width="${W}" height="${H}" fill="#cfe6f2"/>`;
  for (let i = 0; i < 3; i++) {
    const x = 40 + i * 340;
    s += `<rect x="${x}" y="120" width="320" height="980" rx="18" fill="#9ccbe3" stroke="#5a7d8f" stroke-width="10"/>`;
    for (let r = 0; r < 4; r++) s += `<rect x="${x + 20}" y="${200 + r * 230}" width="280" height="12" fill="#e6f4fb"/>` + Array.from({ length: 4 }, (_, j) => `<rect x="${x + 30 + j * 68}" y="${120 + r * 230}" width="54" height="80" rx="6" fill="${PRODUCT_COLS[(i + j + r) % 8]}" opacity=".8"/>`).join('');
    s += `<rect x="${x + 280}" y="560" width="16" height="140" rx="8" fill="#5a7d8f"/>`;
  }
  s += `<rect y="1100" width="${W}" height="250" fill="url(#tiles)"/>`;
  return s;
}
function bgExterior(opts = {}) {
  let s = `<rect width="${W}" height="${H}" fill="${opts.night ? '#1b2340' : '#9fd3f2'}"/>`;
  s += `<rect x="60" y="300" width="960" height="760" fill="#e9e3d6" stroke="#0b0b0b" stroke-width="6"/>`;
  s += `<rect x="60" y="300" width="960" height="190" fill="${C.k}"/><text x="540" y="445" font-family="Lalezar" font-size="170" fill="${C.l}" text-anchor="middle">كيو</text>`;
  s += `<rect x="140" y="560" width="800" height="500" fill="#8ec5df" stroke="#0b0b0b" stroke-width="6"/><path d="M540 560V1060" stroke="#0b0b0b" stroke-width="6"/>`;
  s += `<rect y="1060" width="${W}" height="290" fill="#555"/><path d="M0 1200H${W}" stroke="#f4f1ea" stroke-width="10" stroke-dasharray="80 60"/>`;
  return s;
}
function bgFlat(color, extra = '') { return `<rect width="${W}" height="${H}" fill="${color}"/>` + extra; }
function rays(cx, cy, color = '#fff', op = .25, n = 24) {
  let s = ''; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .45) / n * Math.PI * 2, R = 2000;
    s += `<path d="M${cx} ${cy}L${cx + Math.cos(a0) * R} ${cy + Math.sin(a0) * R}L${cx + Math.cos(a1) * R} ${cy + Math.sin(a1) * R}Z" fill="${color}" opacity="${op}"/>`; }
  return s;
}
function speedlines(cx, cy, color = '#fff', op = .5) {
  let s = ''; for (let i = 0; i < 70; i++) { const a = i / 70 * Math.PI * 2 + (i % 3) * .02, r0 = 380 + (i * 37 % 160), r1 = 1600;
    s += `<path d="M${cx + Math.cos(a) * r0} ${cy + Math.sin(a) * r0}L${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1}" stroke="${color}" stroke-width="${3 + i % 4 * 2}" opacity="${op}"/>`; }
  return s;
}

/* ---------------- characters ---------------- */
function face(expr, skin) {
  const E = { happy: ['M-30 -510q8 -8 16 0', 'M14 -510q8 -8 16 0', 'M-26 -468q26 24 52 0'], angry: ['M-36 -528l26 10', 'M36 -528l-26 10', 'M-22 -462q22 -14 44 0'],
    shock: ['M-30 -515a7 9 0 1 0 .1 0', 'M22 -515a7 9 0 1 0 .1 0', 'M-12 -472a12 16 0 1 0 .1 0'], sly: ['M-32 -512h18', 'M14 -512h18', 'M-20 -470q30 10 40 -8'],
    sad: ['M-32 -520l18 6', 'M32 -520l-18 6', 'M-22 -462q22 -18 44 0'], neutral: ['M-26 -512a6 6 0 1 0 .1 0', 'M26 -512a6 6 0 1 0 .1 0', 'M-16 -470h32'] }[expr || 'neutral'];
  const eyes = (expr === 'shock' || expr === 'neutral') ? `<path d="${E[0]}" fill="#141414"/><path d="${E[1]}" fill="#141414"/>` :
    `<path d="${E[0]}" stroke="#141414" stroke-width="6" fill="none" stroke-linecap="round"/><path d="${E[1]}" stroke="#141414" stroke-width="6" fill="none" stroke-linecap="round"/>` +
    (expr === 'angry' || expr === 'sad' ? `<circle cx="-22" cy="-505" r="6" fill="#141414"/><circle cx="22" cy="-505" r="6" fill="#141414"/>` : '');
  const mouth = expr === 'shock' ? `<path d="${E[2]}" fill="#5a1a14"/>` : `<path d="${E[2]}" stroke="#141414" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  return eyes + mouth;
}
function photoHead(R, disguise) {
  const id = uid('ph'), k = R / 112;
  let s = `<clipPath id="${id}"><circle cx="0" cy="-500" r="${R}"/></clipPath>`;
  s += `<circle cx="0" cy="-500" r="${R + 6}" fill="#141414"/>`;
  s += `<g clip-path="url(#${id})"><image href="assets/omar.jpg" x="${-292 * k}" y="${-500 - 188 * k}" width="${518 * k}" height="${592 * k}"/></g>`;
  if (disguise) {
    s += `<path d="M-78 -470q78 160 156 0q-10 50 -78 70q-68 -20 -78 -70z" fill="#6b4a2b" stroke="#141414" stroke-width="4"/>`; // fake beard
    s += `<rect x="-74" y="-540" width="62" height="34" rx="12" fill="#141414"/><rect x="12" y="-540" width="62" height="34" rx="12" fill="#141414"/><path d="M-12 -524h24" stroke="#141414" stroke-width="6"/>`;
    s += `<path d="M-100 -560q100 -110 200 0z" fill="${disguise === 'cap' ? C.r : '#e9d9a8'}" stroke="#141414" stroke-width="4"/><path d="M-120 -560h240" stroke="#141414" stroke-width="10" stroke-linecap="round"/>`;
  }
  return s;
}
function person(o) {
  const s = o.s || 1, skin = o.skin || C.skin, outfit = o.outfit || 'thobe';
  const shirt = { thobe: '#f7f4ec', vest: '#3a7bd5', guard: C.navy, casual: o.color || '#e07a3a', lady: '#1a1a1a', ref: '#141414' }[outfit];
  const pants = outfit === 'guard' ? '#16203a' : '#2b2b35';
  const pose = o.pose || 'down';
  const hand = { down: [[-115, -235], [115, -235]], up: [[-170, -620], [170, -620]], point: [[-115, -235], [250, -430]], hold: [[-70, -320], [70, -320]],
    cheer: [[-170, -620], [115, -235]], run: [[-160, -300], [150, -470]], grab: [[-40, -380], [230, -380]], phone: [[-115, -235], [30, -470]], shrug: [[-170, -380], [170, -380]] }[pose];
  const legs = o.run ? `<path d="M-30 -210L-140 -60L-110 -10" stroke="${pants}" stroke-width="44" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 -210L90 -100L170 -60" stroke="${pants}" stroke-width="44" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<rect x="-58" y="-230" width="46" height="225" rx="20" fill="${pants}"/><rect x="12" y="-230" width="46" height="225" rx="20" fill="${pants}"/>`;
  let g = '';
  const longDress = outfit === 'thobe' || outfit === 'lady';
  if (!longDress) g += legs;
  g += `<ellipse cx="-38" cy="-4" rx="40" ry="14" fill="#141414"/><ellipse cx="38" cy="-4" rx="40" ry="14" fill="#141414"/>`;
  const armCol = outfit === 'vest' ? '#f2efe6' : shirt;
  const arm = (hx, hy, side) => { const d = `M${side * 82} -410Q${side * 82 + (hx - side * 82) * .4 + side * 20} ${(-410 + hy) / 2} ${hx} ${hy}`;
    return `<path d="${d}" stroke="#141414" stroke-width="50" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${armCol}" stroke-width="38" fill="none" stroke-linecap="round"/><circle cx="${hx}" cy="${hy}" r="24" fill="${skin}" stroke="#141414" stroke-width="4"/>`; };
  if (longDress) g += `<path d="M-92 -440Q0 -470 92 -440L${o.run ? 140 : 120} -12H${o.run ? -140 : -120}Z" fill="${shirt}" stroke="#141414" stroke-width="5"/>`;
  else g += `<path d="M-92 -440Q0 -470 92 -440L86 -215H-86Z" fill="${outfit === 'vest' ? '#f2efe6' : shirt}" stroke="#141414" stroke-width="5"/>`;
  if (outfit === 'vest') g += `<path d="M-90 -436L-40 -440L-20 -215H-86Z M90 -436L40 -440L20 -215H86Z" fill="${C.l}" stroke="#141414" stroke-width="4"/>`;
  if (outfit === 'ref') g += `<path d="M-60 -440V-215M-20 -455V-215M20 -455V-215M60 -440V-215" stroke="#f4f1ea" stroke-width="16"/>`;
  if (outfit === 'guard') g += `<rect x="30" y="-410" width="40" height="30" rx="4" fill="${C.l}"/>`;
  if (outfit === 'thobe') g += `<path d="M0 -455V-330" stroke="#141414" stroke-width="3"/>`;
  g += arm(hand[0][0], hand[0][1], -1) + arm(hand[1][0], hand[1][1], 1);
  // head
  if (o.photo) g += photoHead(o.R || 78, o.disguise);
  else {
    g += `<rect x="-22" y="-470" width="44" height="40" fill="${skin}"/>`;
    if (outfit === 'lady') g += `<path d="M-82 -500a82 92 0 0 1 164 0V-430Q0 -380 -82 -430Z" fill="#1a1a1a"/>`;
    g += `<circle cx="0" cy="-505" r="64" fill="${skin}" stroke="#141414" stroke-width="5"/>`;
    if (o.shemagh) g += `<path d="M-72 -520Q-80 -600 0 -606Q80 -600 72 -520L104 -400L60 -430L60 -520Q0 -545 -60 -520L-60 -430L-104 -400Z" fill="url(#shm)" stroke="#141414" stroke-width="4"/><ellipse cx="0" cy="-578" rx="66" ry="16" fill="none" stroke="#141414" stroke-width="12"/>`;
    else if (outfit === 'lady') g += `<path d="M-70 -520Q0 -610 70 -520Q60 -560 0 -572Q-60 -560 -70 -520Z" fill="#1a1a1a"/>`;
    else if (outfit === 'guard') g += `<path d="M-70 -540Q0 -600 70 -540Z" fill="${C.navy}" stroke="#141414" stroke-width="4"/><path d="M-80 -540H90" stroke="#141414" stroke-width="12" stroke-linecap="round"/>`;
    else g += `<path d="M-64 -520Q-60 -585 0 -585Q60 -585 64 -520Q40 -548 0 -550Q-40 -548 -64 -520Z" fill="#1d1712"/>`;
    if (o.kid) { }
    g += face(o.expr, skin);
    if (o.mustache) g += `<path d="M-28 -486q28 -14 56 0q-28 10 -56 0z" fill="#1d1712"/>`;
  }
  if (o.sweat) g += `<path d="M70 -560q12 20 0 30q-12 -10 0 -30z" fill="#7cc7ff" stroke="#141414" stroke-width="3"/>`;
  const fl = o.flip ? -1 : 1;
  return `<g transform="translate(${o.x} ${o.y}) scale(${s * fl} ${s}) ${o.rot ? `rotate(${o.rot})` : ''}">${g}</g>`;
}

/* ---------------- props ---------------- */
function cart(x, y, s = 1, fill = '') {
  let items = fill ? Array.from({ length: 7 }, (_, i) => `<rect x="${-150 + i * 42}" y="${-330 - (i % 3) * 30}" width="40" height="${90 + (i % 3) * 30}" rx="6" fill="${PRODUCT_COLS[i % 8]}" stroke="#141414" stroke-width="3"/>`).join('') : '';
  return `<g transform="translate(${x} ${y}) scale(${s})">${items}<path d="M-200 -320H170L140 -120H-170Z" fill="none" stroke="#141414" stroke-width="12" stroke-linejoin="round"/><path d="M-190 -270H162M-180 -220H156M-174 -170H150M-120 -320L-110 -120M-40 -320L-36 -120M40 -320L36 -120M110 -320L100 -120" stroke="#141414" stroke-width="5"/><path d="M170 -320L210 -380H260" stroke="#141414" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-170 -120L-150 -60H150" stroke="#141414" stroke-width="10" fill="none"/><circle cx="-130" cy="-30" r="26" fill="#141414"/><circle cx="120" cy="-30" r="26" fill="#141414"/></g>`;
}
function box(x, y, w, h, color, label, opts = {}) {
  return `<g transform="translate(${x} ${y}) rotate(${opts.rot || 0})">${opts.glow ? `<circle cx="0" cy="${-h / 2}" r="${Math.max(w, h)}" fill="${C.l}" opacity=".35"/>` : ''}<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="10" fill="${color}" stroke="#141414" stroke-width="6"/><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h * .22}" fill="#000" opacity=".12"/>${label ? `<foreignObject x="${-w / 2}" y="${-h * .72}" width="${w}" height="${h * .6}"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Lalezar;font-size:${opts.fs || 40}px;color:#141414;text-align:center;line-height:1.05">${label}</div></foreignObject>` : ''}</g>`;
}
function pallet(x, y, s = 1) {
  let b = ''; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) b += `<rect x="${-200 + c * 100}" y="${-120 - r * 90}" width="96" height="86" rx="6" fill="${C.l}" stroke="#141414" stroke-width="4"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-210" y="-30" width="420" height="30" fill="#a97a45" stroke="#141414" stroke-width="4"/>${b}</g>`;
}
function forklift(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="0" y="-260" width="260" height="190" rx="20" fill="${C.r}" stroke="#141414" stroke-width="6"/><path d="M40 -260V-430H220V-260" fill="none" stroke="#141414" stroke-width="14"/><rect x="-30" y="-560" width="22" height="520" fill="#555"/><rect x="-260" y="-70" width="240" height="18" fill="#555"/><circle cx="60" cy="-50" r="50" fill="#141414"/><circle cx="210" cy="-50" r="50" fill="#141414"/></g>`;
}
function trophy(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-110 -300H110L80 -170Q0 -120 -80 -170Z" fill="#ffcf3a" stroke="#141414" stroke-width="6"/><path d="M-110 -280Q-170 -270 -150 -220Q-130 -180 -90 -190M110 -280Q170 -270 150 -220Q130 -180 90 -190" stroke="#141414" stroke-width="8" fill="none"/><rect x="-20" y="-150" width="40" height="80" fill="#ffcf3a" stroke="#141414" stroke-width="6"/><rect x="-80" y="-70" width="160" height="50" rx="8" fill="#141414"/><path d="M-90 -300H90V-330H-90Z" fill="#ffcf3a" stroke="#141414" stroke-width="5"/></g>`;
}
function screen(x, y, w, h, html) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#141414" stroke="#555" stroke-width="10"/><foreignObject x="${x + 20}" y="${y + 20}" width="${w - 40}" height="${h - 40}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-family:Lalezar;color:${C.l};font-size:64px;line-height:1.1">${html}</div></foreignObject>`;
}
function emoji(x, y, size, e, rot = 0) {
  return `<foreignObject x="${x - size}" y="${y - size}" width="${size * 2}" height="${size * 2}" transform="rotate(${rot} ${x} ${y})"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Noto Color Emoji';font-size:${size * 1.4}px;line-height:${size * 2}px;text-align:center">${e}</div></foreignObject>`;
}

/* ---------------- comic overlays ---------------- */
function bubble(x, y, w, text, o = {}) {
  const fs = o.fs || 46, h = o.h || 150, tx = o.tx != null ? o.tx : x + w * .3, ty = o.ty != null ? o.ty : y + h + 70;
  const shout = o.shout;
  let shape;
  if (shout) {
    const pts = []; const cx = x + w / 2, cy = y + h / 2; const n = 18;
    for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? 1 : 1.18; pts.push(`${cx + Math.cos(a) * w / 2 * rr},${cy + Math.sin(a) * h / 2 * rr}`); }
    shape = `<polygon points="${pts.join(' ')}" fill="${o.fill || C.l}" stroke="#141414" stroke-width="6"/>`;
  } else shape = `<path d="M${tx - 30} ${y + h - 10}L${tx} ${ty}L${tx + 30} ${y + h - 10}Z" fill="${o.fill || '#fff'}" stroke="#141414" stroke-width="6" stroke-linejoin="round"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2.4}" fill="${o.fill || '#fff'}" stroke="#141414" stroke-width="6"/><path d="M${tx - 26} ${y + h - 3}H${tx + 26}" stroke="${o.fill || '#fff'}" stroke-width="10"/>`;
  return shape + `<foreignObject x="${x + 24}" y="${y}" width="${w - 48}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" dir="rtl" style="height:${h}px;display:flex;align-items:center;justify-content:center;text-align:center;font-family:${o.font || 'Plex'};font-weight:700;font-size:${fs}px;line-height:1.3;color:#141414">${text}</div></foreignObject>`;
}
function sfx(x, y, text, o = {}) {
  const size = o.size || 140, color = o.color || C.l;
  return `<text x="${x}" y="${y}" font-family="Lalezar" font-size="${size}" text-anchor="middle" fill="${color}" stroke="#141414" stroke-width="${size / 12}" paint-order="stroke" transform="rotate(${o.rot || -8} ${x} ${y})">${text}</text>`;
}
function burst(x, y, r, color = C.l, n = 14) {
  const pts = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? r * .62 : r; pts.push(`${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`); }
  return `<polygon points="${pts.join(' ')}" fill="${color}" stroke="#141414" stroke-width="7"/>`;
}
function cctv(inner, opts = {}) {
  return `<g filter="url(#gray)">${inner}</g><rect width="${W}" height="${H}" fill="url(#scan)"/><rect width="${W}" height="${H}" fill="url(#vig)"/>` +
    `<text x="50" y="90" font-family="monospace" font-size="44" font-weight="700" fill="#fff" direction="ltr"><tspan fill="${C.r}">●</tspan> REC ${opts.cam || 'CAM 07'}</text><text x="1030" y="90" font-family="monospace" font-size="44" fill="#fff" text-anchor="end" direction="ltr">${opts.time || '03:17:42'}</text>`;
}

/* ---------------- page frame ---------------- */
function panel(art, o = {}) {
  let cap = '';
  if (o.cap) cap = `<rect x="40" y="40" width="${o.capW || 620}" height="96" fill="${C.k}" stroke="${C.l}" stroke-width="4"/><foreignObject x="40" y="40" width="${o.capW || 620}" height="96"><div xmlns="http://www.w3.org/1999/xhtml" dir="rtl" style="height:96px;display:flex;align-items:center;justify-content:center;font-family:Plex;font-weight:700;font-size:42px;color:${C.l};padding:0 20px">${o.cap}</div></foreignObject>`;
  const num = o.n ? `<circle cx="1010" cy="1280" r="44" fill="${C.l}" stroke="#141414" stroke-width="5"/><text x="1010" y="1298" font-family="Lalezar" font-size="52" text-anchor="middle" fill="#141414">${o.n}</text>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}${art}${o.halftone === false ? '' : `<rect width="${W}" height="${H}" fill="url(#halftone)"/>`}${cap}${num}<rect x="6" y="6" width="${W - 12}" height="${H - 12}" fill="none" stroke="#141414" stroke-width="12"/></svg>`;
}
