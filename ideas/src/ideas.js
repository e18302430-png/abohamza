// 4 ideas · each = comic storyboard pages
function titleText(title, sub, o = {}) {
  return `<foreignObject x="40" y="${o.y || 860}" width="1000" height="${o.h || 420}"><div xmlns="http://www.w3.org/1999/xhtml" dir="rtl" style="text-align:center">
   <div style="font-family:Lalezar;font-size:${o.fs || 200}px;line-height:1;color:${o.color || C.l};-webkit-text-stroke:${o.stroke || 6}px #141414;paint-order:stroke">${title}</div>
   ${sub ? `<div style="margin-top:22px;display:inline-block;background:#141414;color:#f4f1ea;font-family:Plex;font-weight:700;font-size:48px;padding:12px 30px;border-radius:14px">${sub}</div>` : ''}</div></foreignObject>`;
}
function endCard(bg, big, small, tag, fg = '#141414') {
  return panel(bgFlat(bg, rays(540, 600, '#fff', .18)) +
    `<foreignObject x="40" y="300" width="1000" height="800"><div xmlns="http://www.w3.org/1999/xhtml" dir="rtl" style="text-align:center;color:${fg}">
     <div style="font-family:Lalezar;font-size:150px;line-height:1.05">${big}</div>
     <div style="font-family:Plex;font-weight:700;font-size:56px;margin-top:30px">${small}</div>
     <div style="font-family:Plex;font-weight:700;font-size:60px;margin-top:50px;display:inline-block;background:#141414;color:#e4ff3a;padding:14px 36px;border-radius:16px">${tag}</div>
     <div style="font-family:Lalezar;font-size:150px;margin-top:40px">كيو</div></div></foreignObject>` +
    `<text x="540" y="1290" font-family="Plex" font-size="26" fill="${fg}" opacity=".6" text-anchor="middle">مقترح إبداعي مستقل · إبراهيم غانم</text>`, { halftone: false });
}
const razor = (x, y, r = -30) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-14" y="0" width="28" height="160" rx="10" fill="#3a7bd5" stroke="#141414" stroke-width="5"/><rect x="-60" y="-40" width="120" height="44" rx="8" fill="#ddd" stroke="#141414" stroke-width="5"/></g>`;
const mop = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-8" y="-520" width="16" height="520" fill="#a97a45" stroke="#141414" stroke-width="3"/><path d="M-70 0Q0 -40 70 0L60 30H-60Z" fill="#7cc7ff" stroke="#141414" stroke-width="5"/></g>`;
const tag = (x, y, old, neu, r = 6) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-120" y="-80" width="240" height="160" rx="14" fill="#fff" stroke="#141414" stroke-width="6"/><text x="0" y="-10" font-family="Lalezar" font-size="64" text-anchor="middle" fill="#888">${old}</text><path d="M-90 -30L90 -10" stroke="${C.r}" stroke-width="14"/><text x="0" y="62" font-family="Lalezar" font-size="70" text-anchor="middle" fill="${C.r}">${neu}</text></g>`;

const IDEAS = [
/* =============== 1 =============== */
{ slug: '01-wein-mohammed', title: 'وين محمد؟', pages: () => [
  panel(bgFlat(C.k, rays(540, 560, C.l, .22)) + person({ x: 540, y: 980, s: 1.25, photo: true, R: 80, disguise: 'cap', pose: 'shrug' }) +
    sfx(250, 300, '؟', { size: 300, rot: -15 }) + sfx(850, 260, '؟', { size: 220, rot: 12, color: C.r }) + titleText('وين محمد؟', 'اللي يكشفه… سلته ببلاش', { y: 1000, fs: 170 }), { halftone: false }),
  panel(bgFlat('#2a2a2a', speedlines(540, 520, C.l, .25)) + person({ x: 540, y: 1300, s: 1.55, photo: true, R: 92, pose: 'phone' }) + razor(600, 520, -20) +
    bubble(80, 170, 640, 'من بكرة… ما راح تعرفوني.', { fs: 50, tx: 520, ty: 380 }) + sfx(820, 400, 'شنبي؟!', { size: 120, color: C.r, rot: 10 }), { n: 1, cap: 'الهوك: محمد عمر ماسك موس', capW: 640 }),
  panel(cctv(bgCheckout() + person({ x: 300, y: 1010, s: 1.05, photo: true, R: 72, disguise: 'cap', outfit: 'vest', pose: 'grab' }) + tag(560, 620, '١٢٫٥٠', 'بنصّه!', -6) +
    person({ x: 840, y: 1300, s: 1.1, shemagh: true, expr: 'angry', pose: 'point', flip: true, skin: C.skin2 })) +
    bubble(560, 170, 470, 'غالي يا ولد!', { fs: 50, tx: 820, ty: 440 }) + bubble(40, 230, 430, 'خلاص… بنصّه 😏', { fs: 46, tx: 260, ty: 420 }), { n: 2, cap: 'متخفّي ككاشير… ويكسر السعر', capW: 700 }),
  panel(bgAisle() + mop(330, 1240) + person({ x: 380, y: 1250, s: 1.15, photo: true, R: 74, disguise: 'hat', outfit: 'casual', color: '#3a7bd5', pose: 'hold' }) +
    person({ x: 780, y: 1260, s: 1.15, outfit: 'lady', expr: 'sly', pose: 'point', flip: true, skin: C.skin2 }) +
    bubble(520, 180, 520, 'أنت… محمد عمر؟', { fs: 50, tx: 820, ty: 470 }) + bubble(40, 330, 430, 'لا… ولد عمه!', { fs: 50, tx: 330, ty: 520 }), { n: 3, cap: 'عامل نظافة مشبوه', capW: 520 }),
  panel(bgAisle({ banner: 'وين الشنب؟' }) + person({ x: 540, y: 1250, s: 1.25, outfit: 'guard', expr: 'shock', mustache: true }) +
    person({ x: 260, y: 1300, s: .7, outfit: 'casual', color: C.r, expr: 'sly', pose: 'grab' }) + person({ x: 830, y: 1300, s: .7, outfit: 'casual', color: '#7bc96f', expr: 'sly', pose: 'grab', flip: true }) +
    emoji(430, 640, 90, '🔍', -20) + emoji(650, 640, 90, '🔍', 20) + sfx(540, 470, 'مشبوه!', { size: 120, color: C.r }), { n: 4, cap: 'الكل يفتّش الشنبات 🔍', capW: 600 }),
  panel(bgExterior() + [120, 300, 480, 660, 860].map((x, i) => person({ x, y: 1320, s: .85, outfit: i % 2 ? 'casual' : 'thobe', shemagh: i % 2 === 0, color: PRODUCT_COLS[i + 1], run: true, pose: 'run', expr: 'happy', skin: i % 2 ? C.skin2 : C.skin })).join('') +
    bubble(560, 520, 480, 'شفته في التحلية!!', { fs: 46, tx: 880, ty: 760 }) + sfx(300, 600, 'زحمة!', { size: 150 }), { n: 5, cap: 'الفروع تمتلي بالصيّادين', capW: 600 }),
  panel(bgCheckout({ noCounter: true }) + rays(540, 650, C.l, .3) + cart(820, 1300, 1, true) +
    person({ x: 400, y: 1300, s: 1.3, photo: true, R: 86, pose: 'up' }) + person({ x: 760, y: 1300, s: 1.15, outfit: 'casual', color: C.r, expr: 'happy', pose: 'cheer', flip: true }) +
    `<g transform="translate(640 560) rotate(25)"><path d="M-70 0q70 150 140 0q-10 50 -70 70q-60 -20 -70 -70z" fill="#6b4a2b" stroke="#141414" stroke-width="4"/></g>` +
    burst(760, 300, 170) + sfx(760, 330, 'لقيتك!', { size: 90, color: C.r, rot: -6 }) + bubble(40, 170, 440, 'سلّتك عليّ! 😂', { fs: 50, tx: 330, ty: 440 }), { n: 6, cap: 'اللحظة: الشنب الحقيقي ينكشف', capW: 680 }),
  endCard(C.l, 'كل يوم…<br>في فرع.', 'تقدر تكشفني؟', '#وين_محمد'),
]},

/* =============== 2 =============== */
{ slug: '02-cashier-league', title: 'دوري الكاشيرات', pages: () => [
  panel(bgFlat('#0d3b1e', rays(540, 600, C.l, .18)) + trophy(540, 820, 2.2) + emoji(540, 380, 110, '🛒') +
    titleText('دوري الكاشيرات', 'بتعليق كروي… على كل «بيب»', { y: 930, fs: 150 }), { halftone: false }),
  panel(bgAisle({ banner: 'دوري كيو' }) + person({ x: 380, y: 1250, s: 1.1, outfit: 'vest', expr: 'angry', pose: 'down' }) + person({ x: 700, y: 1250, s: 1.1, outfit: 'vest', expr: 'sly', pose: 'down', skin: C.skin2 }) +
    person({ x: 250, y: 1310, s: .6, outfit: 'casual', color: C.r, expr: 'happy', pose: 'up' }) + person({ x: 830, y: 1310, s: .6, outfit: 'casual', color: '#3a7bd5', expr: 'happy', pose: 'up', flip: true }) +
    sfx(540, 300, 'دخول الأبطال!', { size: 110 }), { n: 1, cap: 'الكاشيرات يدخلون الممر… زي الملعب', capW: 760 }),
  panel(bgFlat(C.k, speedlines(540, 650, C.l, .3)) + person({ x: 540, y: 1300, s: 1.5, photo: true, R: 90, outfit: 'ref', pose: 'point' }) + emoji(800, 540, 80, '📣', 15) +
    bubble(60, 180, 560, 'صافرة البداية!! 🏁', { fs: 50, tx: 460, ty: 420 }), { n: 2, cap: 'محمد عمر = الحكم', capW: 460 }),
  panel(bgCheckout() + person({ x: 380, y: 1000, s: 1.05, outfit: 'vest', expr: 'angry', pose: 'grab' }) +
    [0, 1, 2, 3, 4].map(i => box(560 + i * 90, 520 - i * 70, 70, 80, PRODUCT_COLS[i], '', { rot: i * 25 })).join('') + speedlines(560, 700, '#141414', .12) +
    bubble(520, 120, 520, '«يا سلااااام! ٤٠ صنف في ٢٠ ثانية!»', { fs: 40, h: 170, tx: 620, ty: 360 }) + sfx(240, 400, 'بيب!', { size: 130, color: C.r }) + sfx(860, 760, 'بيب!', { size: 110 }), { n: 3, cap: 'التعليق الكروي على كل «بيب»', capW: 640 }),
  panel(bgCheckout({ noCounter: true }) + person({ x: 540, y: 1250, s: 1.2, shemagh: true, expr: 'shock', pose: 'up', rot: -18, skin: C.skin2 }) + emoji(700, 330, 110, '🍉', 20) +
    sfx(300, 300, 'تصدّي!', { size: 140 }) + bubble(560, 760, 460, 'الزبون حارس مرمى!', { fs: 44, tx: 700, ty: 700 }), { n: 4, cap: 'الزبون يمسك البطيخة طاير', capW: 600 }),
  panel(bgFlat('#1b1b1b') + screen(120, 260, 840, 520, 'VAR<br><span style="font-size:48px;color:#f4f1ea">الطماطم انحسبت مرتين؟</span>') +
    person({ x: 300, y: 1320, s: 1.05, photo: true, R: 70, outfit: 'ref', pose: 'point' }) + person({ x: 780, y: 1320, s: 1, outfit: 'vest', expr: 'sad', pose: 'shrug', flip: true }) + sfx(800, 230, 'فار!', { size: 120, color: C.r, rot: 8 }), { n: 5, cap: 'الفار يراجع الفاتورة', capW: 520 }),
  panel(bgAisle() + rays(540, 520, C.l, .35) + person({ x: 540, y: 1270, s: 1.25, outfit: 'vest', expr: 'happy', pose: 'up' }) + trophy(540, 470, 1) +
    emoji(200, 400, 70, '🎊') + emoji(880, 380, 70, '🎉') + bubble(560, 980, 470, 'سلّتك ببلاش لو كسرنا الرقم!', { fs: 38, tx: 650, ty: 930 }), { n: 6, cap: 'السلة الذهبية + زبائن الرقم القياسي ببلاش', capW: 860 }),
  endCard(C.k, 'كل خميس:<br>فرعك ضد فرعهم.', 'جدة 🆚 الرياض 🆚 مكة', '#دوري_كيو', C.c),
]},

/* =============== 3 =============== */
{ slug: '03-last-box', title: 'آخر حبة', pages: () => [
  panel(bgFlat(C.r, rays(540, 560, '#fff', .2)) + box(540, 820, 360, 420, C.l, 'آخر<br>حبة', { glow: true, fs: 110 }) +
    titleText('آخر حبة', 'فيلم أكشن… في ممر سوبرماركت', { y: 920, fs: 190, color: C.c }), { halftone: false }),
  panel(bgAisle() + box(540, 650, 160, 190, C.l, 'الترند', { glow: true, fs: 44 }) + rays(540, 560, C.l, .2) + sfx(540, 300, 'آخر واحدة', { size: 110, color: C.c }), { n: 1, cap: 'لقطة: آخر علبة تلمع على الرف', capW: 640 }),
  panel(bgAisle() + person({ x: 200, y: 1300, s: 1.3, shemagh: true, expr: 'angry', pose: 'down' }) + person({ x: 880, y: 1300, s: 1.3, outfit: 'casual', color: '#3a7bd5', expr: 'angry', pose: 'down', flip: true, skin: C.skin2 }) +
    `<path d="M300 560L780 560" stroke="${C.r}" stroke-width="10" stroke-dasharray="30 20"/>` + emoji(540, 1180, 70, '🛍️', 30) + sfx(540, 420, 'مواجهة', { size: 120, color: C.r }), { n: 2, cap: 'نظرات الغرب الأمريكي… وكيس يتدحرج', capW: 760 }),
  panel(bgAisle() + speedlines(540, 560, '#fff', .45) + person({ x: 320, y: 1150, s: 1.15, shemagh: true, expr: 'angry', pose: 'run', run: true, rot: -8 }) + cart(330, 1330, .8) +
    person({ x: 790, y: 1300, s: 1.1, outfit: 'casual', color: '#3a7bd5', expr: 'angry', pose: 'run', run: true, flip: true, rot: 18, skin: C.skin2 }) +
    `<g transform="translate(860 1240)"><path d="M-60 0L0 -150L60 0Z" fill="${C.l}" stroke="#141414" stroke-width="5"/></g>` + sfx(540, 300, 'سلو موشن', { size: 110 }), { n: 3, cap: 'قفزة فوق العربية… وتزحلق على «انتبه الأرض مبلولة»', capW: 980 }),
  panel(bgAisle() + person({ x: 300, y: 1300, s: 1.2, shemagh: true, expr: 'shock', pose: 'grab' }) + person({ x: 780, y: 1300, s: 1.2, outfit: 'casual', color: '#3a7bd5', expr: 'shock', pose: 'grab', flip: true, skin: C.skin2 }) +
    person({ x: 540, y: 1320, s: .95, outfit: 'lady', expr: 'sly', pose: 'hold', skin: C.skin2 }) + box(540, 1060, 140, 160, C.l, 'الترند', { fs: 36 }) +
    bubble(600, 200, 420, 'عن إذنكم 😌', { fs: 50, tx: 600, ty: 560 }), { n: 4, cap: 'وتجي الخالة… وتاخذها بهدوء', capW: 640 }),
  panel(bgAisle() + forklift(760, 1300, 1.2) + pallet(330, 1210, 1.05) + person({ x: 860, y: 1000, s: .75, photo: true, R: 64, pose: 'point' }) +
    bubble(40, 170, 600, 'على وش تتهاوشون؟ عندنا ألف!', { fs: 42, tx: 520, ty: 440 }) + sfx(820, 360, 'ألف حبة!', { size: 110, color: C.r, rot: 8 }), { n: 5, cap: 'محمد عمر يدخل برافعة… وطبلية كاملة', capW: 760 }),
  panel(bgAisle() + rays(540, 600, C.l, .3) + person({ x: 330, y: 1300, s: 1.15, shemagh: true, expr: 'happy', pose: 'up' }) + person({ x: 750, y: 1300, s: 1.15, outfit: 'casual', color: '#3a7bd5', expr: 'happy', pose: 'up', flip: true, skin: C.skin2 }) +
    person({ x: 540, y: 1330, s: .85, outfit: 'lady', expr: 'sly', pose: 'hold', skin: C.skin2 }) + box(540, 1100, 120, 140, C.l, '', {}) + sfx(540, 380, 'نهاية سعيدة', { size: 110 }), { n: 6, cap: 'الكل يتصالح… والخالة ما تفك علبتها', capW: 740 }),
  endCard(C.r, 'في كيو…<br>ما فيه «آخر حبة».', 'الترند الجاي؟ بالطبلية.', '#آخر_حبة', C.c),
]},

/* =============== 4 =============== */
{ slug: '04-the-manager', title: 'أبي أكلم المدير', pages: () => [
  panel(bgFlat('#1b2340', rays(540, 560, C.l, .18)) + person({ x: 540, y: 960, s: 1.2, photo: true, R: 84, pose: 'cheer' }) + sfx(260, 320, 'نعم؟', { size: 160, rot: -12 }) +
    titleText('أبي أكلم المدير!', 'ومحمد عمر يطلع… من أي مكان', { y: 1010, fs: 140, color: C.c }), { halftone: false }),
  panel(bgAisle() + person({ x: 540, y: 1300, s: 1.4, shemagh: true, expr: 'angry', pose: 'point', skin: C.skin2 }) +
    bubble(100, 170, 680, 'وين المدير؟! أبي أكلم المدير!', { fs: 46, tx: 560, ty: 420, shout: true, h: 200 }), { n: 1, cap: 'زبون معصّب', capW: 400 }),
  panel(bgFreezer() + `<rect x="380" y="120" width="320" height="980" rx="18" fill="#e6f4fb" opacity=".7"/>` + person({ x: 540, y: 1150, s: 1.1, photo: true, R: 76, pose: 'up' }) +
    emoji(430, 420, 50, '❄️') + emoji(660, 380, 60, '❄️') + emoji(700, 700, 45, '❄️') + bubble(620, 160, 420, 'حاضر! 🥶', { fs: 54, tx: 640, ty: 400 }) + sfx(260, 560, 'ششش!', { size: 120, color: '#7cc7ff' }), { n: 2, cap: 'يطلع من الفريزر… والثلج على شنبه', capW: 760 }),
  panel(bgAisle() + person({ x: 300, y: 1300, s: 1.1, outfit: 'lady', expr: 'sly', pose: 'phone', skin: C.skin2 }) +
    `<g transform="translate(740 1300)"><path d="M-170 0Q-190 -380 0 -420Q190 -380 170 0Z" fill="#e9d9a8" stroke="#141414" stroke-width="6"/><text x="0" y="-150" font-family="Lalezar" font-size="90" text-anchor="middle" fill="#141414">رز</text></g>` +
    person({ x: 740, y: 1000, s: .8, photo: true, R: 70, pose: 'up' }) + bubble(40, 230, 470, '«ودّي أكلم المدير…»', { fs: 42, tx: 300, ty: 560 }) + sfx(820, 460, 'هلا!', { size: 120 }), { n: 3, cap: 'همسة… ويطلع من كيس الرز', capW: 640 }),
  panel(bgExterior({ night: true }) + `<path d="M540 0V520" stroke="#141414" stroke-width="10"/>` + person({ x: 540, y: 1000, s: 1, photo: true, R: 72, pose: 'up' }) +
    person({ x: 250, y: 1330, s: .95, outfit: 'casual', color: '#7bc96f', expr: 'shock', pose: 'shrug' }) + speedlines(540, 650, '#fff', .2) + sfx(800, 300, 'مهمة!', { size: 130, color: C.r }), { n: 4, cap: 'في المواقف: ينزل من السقف بحبل', capW: 700 }),
  panel(bgFlat('#efe9dc') + `<rect x="0" y="900" width="1080" height="450" fill="#c9a77a"/>` + person({ x: 330, y: 1300, s: 1.2, outfit: 'casual', color: C.r, expr: 'sly', pose: 'phone' }) +
    `<g transform="translate(760 1300)"><rect x="-170" y="-380" width="340" height="380" rx="30" fill="${C.l}" stroke="#141414" stroke-width="6"/><text x="0" y="-150" font-family="Lalezar" font-size="90" text-anchor="middle" fill="#141414">كيو</text></g>` +
    person({ x: 760, y: 1010, s: .75, photo: true, R: 68, pose: 'up' }) + bubble(40, 200, 520, '«خلّني أكلم المدير»', { fs: 44, tx: 330, ty: 560 }), { n: 5, cap: 'في البيت: يطلع من شنطة التوصيل', capW: 660 }),
  panel(bgFlat('#f4f1ea') + person({ x: 540, y: 1300, s: 1.35, outfit: 'lady', expr: 'angry', pose: 'shrug', skin: C.skin2 }) +
    bubble(140, 170, 800, 'يا محمد! تعال شيل الزبالة!', { fs: 50, tx: 540, ty: 420, shout: true, h: 210 }) + sfx(540, 1250, '…', { size: 160, color: '#141414' }) + sfx(850, 650, 'صمت', { size: 90, color: '#999', rot: 10 }), { n: 6, cap: 'الأم تناديه… وما يطلع أبدًا 😂', capW: 640 }),
  endCard('#1b2340', 'المدير موجود…<br>دايمًا.', 'إلا لما تناديه أمه.', '#وين_المدير', C.c),
]},
];
