  /* ---------- the food street: where a row of pines stood between the temple's east wall and the seven-day market, five food stalls
     face the market across a strip of packed earth, Shan and Chinese by turns. Every board is lettered in Shan, Tai Nüa, Chinese and Burmese.
     The Shan stalls, under thatch with yellow boards: pots of broth steaming on clay charcoal stoves, rice and curries, Shan noodles
     and warm tofu, tea and Shan sweets. The Chinese (Yunnanese and Kokang) stalls, under red-edged tin with red boards in gold: bamboo steamers of buns and dumplings, red lanterns swinging from the
     eaves. Tables with red and blue plastic stools out front. The people are Shan, Palaung (Ta'ang), Kachin (Jinghpaw) and Yunnanese
     Chinese, each in their own dress, every man in trousers: cooks at the counters, diners at the tables, friends strolling the street.
     The stalls are one flat-shaded mesh and the cooks and diners another; the strollers, the steam and the lanterns move. The people
     and the steam are there while the market's stalls are open (FOLK.food, 9 am–10 pm) ---------- */
  const FOOD = { x: 35.8, zs: [35, 25, 15, 5, -5], lanes: [41.4, 42.2, 41.8], z0: -10.5, z1: 40.5 };   // stall centres (x, and z for each), fronts facing the market (+x); the strollers' lines and where they turn
  // the boards' lines, as given by the site's owner: Shan (Tai Yai), Tai Nüa (Dehong Dai, in Tai Le script), Chinese, Burmese, and our
  // English gloss; food is what the stall serves. Shan and Chinese stalls by turns along the street
  const FOOD_SIGNS = [
    { shan: true, food: "rice", shn: "လၢၼ်ႉၶဝ်ႈၽၵ်းတႆး", tdd: "ᥘᥣᥢᥳᥑᥝᥲᥚᥐᥴᥖᥭᥰ", zh: "傣味传统餐厅", my: "ရှမ်းရိုးရာစားသောက်ဆိုင်", en: "Shan rice shop" },
    { food: "dishes", shn: "လၢၼ်ႉတၢင်းၵိၼ်ၶႄႇ", tdd: "ᥘᥣᥢᥳᥖᥣᥒᥰᥐᥤᥢᥑᥦᥱ", zh: "云南风味中餐厅", my: "တရုတ်ရိုးရာစားသောက်ဆိုင်", en: "Yunnan Chinese restaurant" },
    { shan: true, food: "noodles", shn: "ၶဝ်ႈသွႆးတႆး လႄႈ ၶဝ်ႈၽိုၼ်း", tdd: "ᥑᥝᥲᥔᥩᥭᥰᥖᥭᥰ ᥘᥦᥲ ᥑᥝᥲᥜᥪᥢᥰ", zh: "傣味米线与豌豆粉", my: "ရှမ်းခေါက်ဆွဲနှင့် တို့ဟူးနွေး", en: "Shan noodles · warm tofu" },
    { food: "buns", shn: "သႃႇလႃႇပဝ်း လႄႈ ၵျႅဝ်ႉၸိုဝ်ႉ", tdd: "ᥔᥣᥱᥘᥣᥱᥙᥝᥰ", zh: "手工包子与饺子", my: "ပေါက်စီနှင့် ဖက်ထုပ်", en: "Handmade buns · dumplings" },
    { shan: true, food: "tea", shn: "လၢၼ်ႉၼမ်ႉၼဵင်ႈ လႄႈ ၶဝ်ႈမုၼ်းတႆး", tdd: "ᥘᥣᥢᥳᥘᥛᥳᥘᥥᥒᥲ", zh: "传统茶饮与傣族糕点", my: "လက်ဖက်ရည်နှင့် ရှမ်းမုန့်", en: "Tea · Shan snacks" }];
  function foodStreet(g) {
    const list = picks.pagoda, r = rng(5150), pk = l => l[(r() * l.length) | 0];
    const vcM = std({ vertexColors: true, flatShading: true, roughness: .8 }), folkM = std({ vertexColors: true, flatShading: true, roughness: .85 });
    onDaylight(d => folkM.emissive.copy(lerpC(0x1c1814, 0x000000, d)));
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n), cone = (a, h, n = 8) => new THREE.ConeGeometry(a, h, n);
    const ball = (rad, sy = 1) => { const q = new THREE.IcosahedronGeometry(rad, 0); q.scale(1, sy, 1); return q; };
    // lowPoly reads colours as linear; these are written as seen, so turn them linear first (as in the market)
    const linear = geo => { const c = geo.attributes.color; for (let i = 0; i < c.array.length; i++) c.array[i] = Math.pow(c.array[i], 2.2); return geo; };
    // parts [geo, colour, x, y, z, ry, rx, rz] turned, moved and placed by m4, ready for lowPoly
    const fix = (p, m4) => p.map(([geo, col, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0]) => { const q = geo.index ? geo.toNonIndexed() : geo.clone(); if (rz) q.rotateZ(rz); if (rx) q.rotateX(rx); if (ry) q.rotateY(ry); q.translate(x, y, z); if (m4) q.applyMatrix4(m4); return [q, col, 0, 0, 0]; });
    const at = (x, y, z, ry = 0) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(1, 1, 1));
    const rotAt = (rx, [x, y, z]) => new THREE.Matrix4().makeRotationX(rx).setPosition(x, y, z);

    // the street's floor: packed earth from the temple wall to the market's edge
    const earth = std({ color: 0x8a7a62, roughness: 1 });
    onDaylight(d => earth.color.copy(lerpC(0x3e3529, 0x584b3c, d)));
    flat(mesh(new THREE.BoxGeometry(9.4, .05, 52.4), earth, 38.3, .025, 15, g)).receiveShadow = true;

    /* ---------- the stalls, each in its own frame: front +z (turned to face the market), x ±2.8 along the street ---------- */
    const WOOD = 0x7a5a3a, WOOD_D = 0x5a3e26, BAMBOO = 0xc8a868, BAMBOO_D = 0x8a6a3a, THATCH = 0xb8955a, THATCH_D = 0x8f6f3e, TIN = 0x9a9ea2, TIN_D = 0x7a7e82;
    const RED = 0xa82820, CLAY = 0x9a5a3a, ALU = 0xb8bcc0, CHINA = 0xf2f0ea, GOLD = 0xd8b048, STOOLS = [0xd83a2a, 0x2a6ac0, 0xd83a2a, 0x3a8ad0];
    const TOP = .95;   // the counter top
    const stuff = [], steamAt = [], lanternAt = [], seats = [], frames = [];
    const bowl = (x, y, z, food = true) => { const p = [[cyl(.1, .065, .08, 8), CHINA, x, y + .04, z]]; if (food) p.push([cyl(.088, .088, .02, 8), 0xf0e0b0, x, y + .075, z], [cone(.05, .03, 6), 0xd8641a, x, y + .095, z]); return p; };
    function stall(z, sg) {
      const shan = !!sg.shan, m4 = at(FOOD.x, .05, z, Math.PI / 2), P = [], post = shan ? BAMBOO : WOOD;
      frames.push({ m4, shan });
      [[-2.8, 1.8, 2.5], [2.8, 1.8, 2.5], [-2.8, -1.8, 2.92], [0, -1.8, 2.92], [2.8, -1.8, 2.92]].forEach(([x, zz, h]) => P.push([cyl(.06, .07, h, 6), post, x, h / 2, zz]));
      P.push([box(5.8, .1, .1), post, 0, 2.45, 1.8], [box(5.8, .1, .1), post, 0, 2.87, -1.8]);   // beams under the eaves
      [-2.8, 0, 2.8].forEach(x => P.push([box(.08, .08, 3.7), post, x, 2.68, 0, 0, .117]));        // rafters sloping to the front
      // the roof, sloping down toward the street: thatch tied in rows, or corrugated tin with a red fascia board
      const R = shan
        ? [[box(6.3, .16, 4.5), THATCH, 0, .08, 0], ...[-1.65, -.55, .55, 1.65].map(zz => [box(6.34, .05, .16), THATCH_D, 0, .17, zz]), [box(6.34, .12, .1), THATCH_D, 0, .04, 2.22]]
        : [[box(6.3, .04, 4.5), TIN, 0, .02, 0], ...Array.from({ length: 13 }, (_, k) => [box(.05, .03, 4.5), TIN_D, -3 + k * .5, .05, 0]), [box(6.34, .2, .05), RED, 0, -.06, 2.26]];
      P.push(...fix(R, rotAt(.117, [0, 2.74, 0])));
      // the counter (bamboo-faced, or red with a gold band) and the cook's table behind
      P.push([box(5.0, .9, .7), shan ? BAMBOO : RED, 0, .45, .75], [box(5.2, .05, .8), WOOD, 0, .925, .75]);
      if (shan) [.3, .6].forEach(y => P.push([box(5.02, .04, .72), BAMBOO_D, 0, y, .75])); else P.push([box(5.02, .06, .72), GOLD, 0, .75, .75]);
      P.push([box(5.0, .05, .6), WOOD, 0, .8, -1.4], ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => [box(.06, .8, .06), WOOD_D, a * 2.4, .4, -1.4 + b * .25]));
      P.push([cyl(.17, .15, .34, 10), 0x3a6ac0, 2.3, .17, -.6], [cyl(.16, .16, .02, 10), 0x7aa8c8, 2.3, .33, -.6]);   // a bucket of water
      const steam = (x, y, zz) => steamAt.push(V(x, y, zz).applyMatrix4(m4));
      if (shan) {
        // two pots of broth on clay charcoal stoves, one on the counter's end, one on the back table
        [[-1.9, TOP, .75], [1.6, .825, -1.4]].forEach(([x, y, zz]) => { P.push([cyl(.24, .2, .3, 8), CLAY, x, y + .15, zz], [box(.14, .07, .02), 0xe8501a, x, y + .09, zz + .22], [cyl(.24, .22, .34, 8), ALU, x, y + .47, zz], [cyl(.225, .225, .02, 8), 0xc8742a, x, y + .63, zz]); steam(x, y + .66, zz); });
        // bowls of Shan noodles ready with their tomato topping and chopsticks, stacked bowls, jars of chilli oil, pickles, peanuts
        [-1.1, -.7, -.3].forEach(x => P.push(...bowl(x, TOP, .95), [box(.012, .012, .24), 0x8a5a2a, x + .13, TOP + .01, .95]));
        [[.2, .6], [.45, .6]].forEach(([x, zz]) => { for (let k = 0; k < 5; k++) P.push([cyl(.09, .055, .05, 8), k === 4 ? 0x3a6ac0 : CHINA, x, TOP + .025 + k * .04, zz]); });
        [0xa8201a, 0x6a8a2a, 0xc89a5a, 0xd8b860].forEach((c, i) => P.push([cyl(.05, .05, .12, 8), c, .85 + i * .14, TOP + .06, .95], [cyl(.052, .052, .025, 8), 0xd83a2a, .85 + i * .14, TOP + .13, .95]));
        P.push([cyl(.3, .26, .05, 10), BAMBOO, 1.9, TOP + .025, .75]);
        if (sg.food === "rice") {   // a heap of rice and three bowls of curry
          P.push([cone(.2, .16, 8), 0xf6f2e8, 1.9, TOP + .13, .75]);
          [[1.35, 0xb8642a], [1.35 + .22, 0x6a8a2a], [1.35 + .44, 0xc89a3a]].forEach(([x, c]) => P.push([cyl(.09, .065, .07, 8), CHINA, x - .2, TOP + .035, 1.0], [cyl(.08, .08, .02, 8), c, x - .2, TOP + .065, 1.0]));
        } else if (sg.food === "noodles") {   // coils of fresh rice noodle, and a pot of warm yellow tofu
          for (let i = 0; i < 6; i++) P.push([ball(.075, .45), 0xf6f2e4, 1.9 + Math.cos(i) * .16 * (i ? 1 : 0), TOP + .08, .75 + Math.sin(i) * .16 * (i ? 1 : 0)]);
          P.push([cyl(.17, .15, .2, 8), ALU, 1.35, TOP + .1, .95], [cyl(.16, .16, .02, 8), 0xe8c040, 1.35, TOP + .19, .95]);
        } else {   // a teapot and cups of tea, a tray of Shan sweets
          P.push([cyl(.09, .11, .15, 8), 0x2a6a4a, 1.45, TOP + .075, .95], [box(.12, .025, .025), 0x2a6a4a, 1.57, TOP + .1, .95, 0, 0, .5], [cyl(.03, .03, .03, 6), 0x2a6a4a, 1.45, TOP + .165, .95]);
          [0, 1, 2, 3].forEach(k => P.push([cyl(.035, .03, .05, 6), CHINA, 1.25 + (k % 2) * .1, TOP + .025, .72 + (k >> 1) * .1]));
          for (let i = 0; i < 9; i++) P.push([box(.09, .05, .09), [0xe8a0b0, 0xf6f0e4, 0x8a5a2a][i % 3], 1.9 + ((i % 3) - 1) * .12, TOP + .075, .75 + (((i / 3) | 0) - 1) * .12]);
        }
      } else {
        // bamboo steamers stacked on a pot over a gas ring at each end of the counter; plates of buns and dumplings between
        [-1.8, 1.8].forEach(x => {
          P.push([cyl(.22, .2, .14, 8), 0x3a3a3e, x, TOP + .07, .75], [cyl(.27, .27, .2, 8), ALU, x, TOP + .24, .75]);
          for (let k = 0; k < 3; k++) P.push([cyl(.26, .26, .11, 10), BAMBOO, x, TOP + .4 + k * .115, .75], [cyl(.265, .265, .02, 10), BAMBOO_D, x, TOP + .35 + k * .115, .75]);
          P.push([cone(.27, .12, 10), BAMBOO, x, TOP + .745, .75]); steam(x, TOP + .82, .75);
        });
        P.push([cyl(.2, .18, .03, 10), CHINA, -.7, TOP + .015, .85]); for (let i = 0; i < 5; i++) P.push([ball(.065, .75), 0xf6f0e4, -.7 + Math.cos(i * 1.26) * .1, TOP + .07, .85 + Math.sin(i * 1.26) * .1]);
        P.push([cyl(.2, .18, .03, 10), CHINA, -.1, TOP + .015, .85]); for (let i = 0; i < 7; i++) P.push([ball(.042, .55), 0xf0e8d8, -.1 + Math.cos(i * .9) * .12 * (i ? 1 : 0), TOP + .05, .85 + Math.sin(i * .9) * .12 * (i ? 1 : 0)]);
        [[.5, 0x2a1a14], [.62, 0x5a2a1a], [.74, 0xa8201a]].forEach(([x, c]) => P.push([cyl(.035, .04, .2, 6), c, x, TOP + .1, .95], [cyl(.015, .015, .05, 6), c, x, TOP + .22, .95]));   // soy, vinegar, chilli
        P.push([cyl(.09, .11, .14, 8), 0x3a6a8a, 1.1, TOP + .07, .85], [box(.12, .025, .025), 0x3a6a8a, 1.22, TOP + .09, .85, 0, 0, .5]);   // a teapot
        P.push([cyl(.3, .12, .14, 10), 0x2a2a2e, -1.2, .895, -1.4], [box(.5, .04, .3), 0xc8a070, .6, .845, -1.4], [box(.16, .08, .01), 0x9aa0a6, .6, .9, -1.4]);   // a wok, a chopping board and cleaver on the back table
        [-2.3, 2.3].forEach(x => lanternAt.push(V(x, 2.4, 1.85).applyMatrix4(m4)));
      }
      // two tables out front, each with chopsticks and spoons in a holder, chilli and soy, a box of tissues, and four stools
      [-1.35, 1.35].forEach(tx => {
        const tz = 3.45;
        P.push([box(1.1, .05, .72), shan ? WOOD : 0x6a4a32, tx, .72, tz], ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => [box(.05, .7, .05), WOOD_D, tx + a * .48, .35, tz + b * .3]));
        P.push([cyl(.04, .04, .12, 6), BAMBOO, tx - .35, .805, tz], ...[-.37, -.35, -.33].map(dx => [box(.01, .2, .01), 0x8a5a2a, tx + dx, .88, tz]), [cyl(.035, .035, .12, 6), 0xa8201a, tx - .2, .805, tz - .05], [cyl(.03, .03, .14, 6), 0x2a1a14, tx - .12, .815, tz + .05], [box(.16, .08, .1), 0xf0ece0, tx + .35, .785, tz]);
        [-1, 1].forEach(sd => [-.28, .28].forEach(dx => { P.push([cyl(.15, .17, .42, 6), pk(STOOLS), tx + dx, .21, tz + sd * .62]); seats.push({ m4: m4.clone().multiply(at(tx + dx, 0, tz + sd * .62, sd < 0 ? 0 : Math.PI)), shan }); }));
        sRect(g, FOOD.x + tz - .4, FOOD.x + tz + .4, z - tx - .6, z - tx + .6);   // the table blocks walkers; its stools don't
      });
      sRect(g, FOOD.x - 1.95, FOOD.x + 1.15, z - 2.9, z + 2.9);   // the stall itself, up to the counter's front
      stuff.push(...fix(P, m4));
    }
    FOOD.zs.forEach((z, i) => stall(z, FOOD_SIGNS[i]));

    // the boards under the front eaves, yellow with red for the Shan stalls, red with gold for the Chinese: Shan, Tai Nüa, Chinese and
    // Burmese in small letters, a line of English below
    FOOD.zs.forEach((z, i) => {
      const sg = FOOD_SIGNS[i], cv = document.createElement("canvas"); cv.width = 1024; cv.height = 232;
      const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
      const MY = '"Noto Sans Myanmar", "Myanmar Text", sans-serif', LE = '"Noto Sans Tai Le", "Microsoft Tai Le", sans-serif', ZH = '"Noto Serif SC", "Noto Serif TC", "Songti SC", serif';
      const LINES = [[sg.shn, `600 40px ${MY}`, 38], [sg.tdd, `400 34px ${LE}`, 84], [sg.zh, `600 32px ${ZH}`, 124], [sg.my, `600 29px ${MY}`, 171], [sg.en, '600 20px "Figtree", sans-serif', 211]];
      const paint = () => {
        const c = cv.getContext("2d");
        c.fillStyle = sg.shan ? "#F4D03F" : "#C0392B"; c.fillRect(0, 0, 1024, 232);
        c.strokeStyle = sg.shan ? "#8a1a14" : "#f0c040"; c.lineWidth = 8; c.strokeRect(6, 6, 1012, 220);
        c.textAlign = "center"; c.textBaseline = "middle";
        LINES.forEach(([str, font, y], k) => { c.font = font; c.fillStyle = sg.shan ? (k === 4 ? "#2a1a14" : "#b01e18") : (k === 4 ? "#fbe6a8" : "#f6d24a"); c.fillText(str, 512, y, 980); });
        t.needsUpdate = true;
      };
      paint();
      if (document.fonts && document.fonts.load) Promise.all(LINES.map(([str, font]) => document.fonts.load(font, str))).then(paint, () => {});
      const board = flat(mesh(new THREE.PlaneGeometry(3.8, .86), std({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .25, roughness: .6, side: THREE.DoubleSide }), 0, 0, 0, g));
      board.position.set(FOOD.x + 1.86, 2.0, z); board.rotation.y = Math.PI / 2;   // faces the market
      clickable(list, board, { tip: `${sg.shn} · ${sg.en}`, toast: sg.shan ? "A Shan food stall: rice with curries, noodles in clear broth or with a tomato and pork topping, warm yellow tofu, tea and Shan sweets, pickled greens and chilli on every table." : "A Chinese stall, Yunnanese and Kokang cooking from over the border: handmade buns and dumplings out of bamboo steamers, rice noodles, pots of tea." });
    });

    /* ---------- the people, built facing +z with their feet at y 0. Every man wears trousers ---------- */
    const SKIN = [0xd8a47a, 0xc89068, 0xe0b088, 0xb88058, 0xe8b890], HAIR = 0x1c1614, GREY = 0xcfccc6, INK = 0x2a1c18, THANAKA = 0xf0e2b4, SHOE = 0x2a201a, SILVER = 0xd8dce0;
    // what each people wears, by ethnicity and sex; o.skirt holds the colours of the woven bands on a wrap skirt
    function dress(eth, man, old) {
      const o = { eth, man, skin: pk(SKIN), hair: old ? GREY : HAIR };
      if (eth === "shan") Object.assign(o, man
        ? { top: pk([0xf2eee2, 0xe8e0cc, 0xf4f2ec]), trim: 0xc8b898, low: pk([0x1e2238, 0x34343a, 0x8a7a58]), wide: true, sash: pk([0x8a7a58, 0x5a4232]), hat: "gaung", hatC: pk([0xe8d8b0, 0xf0b070, 0xe8c890]), collar: true }   // the jacket fastened at the side, loose Shan trousers, a cloth wound into a turban
        : { top: pk([0xf0e6c8, 0xe8a0b0, 0x8ab8d8, 0xf4f2ec]), trim: pk([0xe8c040, 0xd84a6a]), low: pk([0x7a2032, 0x2f5a3a, 0x5a2a5a]), skirt: [0xe8c040, 0xe8c040], hat: "wrap", hatC: pk([0xe88aa0, 0xf0ece0, 0xe8903a]), thanaka: r() < .7 });
      else if (eth === "palaung") Object.assign(o, man
        ? { top: 0x1c2034, trim: 0x2a3050, low: 0x18181e, wide: true, sash: 0x2a3050, hat: "wrap", hatC: pk([0x24242a, 0x3a2a3a]) }
        : { top: 0x161a2c, trim: 0xc81e28, velvet: true, low: 0xb81e26, skirt: [0x18181c, 0xf0ece0], stripes: true, hoops: true, hat: "hood", hatC: 0xc81e28 });   // dark velvet jacket edged in red, red striped skirt, silver hoops round the waist, a red hood
      else if (eth === "kachin") Object.assign(o, man
        ? { top: 0xf2f0ea, trim: 0xd8d4cc, low: 0x22222a, vest: pk([0x18181c, 0x1e3a2a]), hat: "band", hatC: 0xb02420, hatC2: 0x18181c }   // white shirt under a dark waistcoat, dark trousers, a patterned headwrap
        : { top: 0x141416, trim: SILVER, discs: true, low: 0xa81e1c, skirt: [0x18181c, 0xe8c040, 0x2a6a3a], hat: "band", hatC: 0xb02420, hatC2: 0x18181c, sling: true });   // black blouse set with silver discs, a woven red skirt, red turban, a woven bag
      else Object.assign(o, { top: pk([0x6a1a24, 0x2a3a6a, 0x3a2a3a, 0x1e3a3a]), trim: 0xd8b860, frogs: true, collar: true, low: 0x1c1c22, skirt: !man && old ? [] : null, hat: "" });   // a Mandarin-collared jacket with frog fastenings, straight dark trousers (an older woman's dark skirt)
      return o;
    }
    // the head, centred at height y, and what is worn on it
    function head(o, y) {
      const p = [[box(.24, .26, .24), o.skin, 0, y, 0], [box(.03, .06, .05), o.skin, -.13, y, 0], [box(.03, .06, .05), o.skin, .13, y, 0],
        [box(.035, .04, .012), INK, -.055, y + .015, .122], [box(.035, .04, .012), INK, .055, y + .015, .122], [box(.06, .012, .01), 0x8a3a30, 0, y - .07, .121],
        [box(.26, .22, .07), o.hair, 0, y, -.1]];
      if (o.thanaka) [-1, 1].forEach(e => p.push([box(.065, .075, .012), THANAKA, e * .072, y - .035, .121]));
      if (o.hat === "gaung") p.push([box(.29, .12, .28), o.hatC, 0, y + .16, 0], [box(.295, .03, .285), 0xf4f0e4, 0, y + .13, 0], [box(.08, .13, .08), o.hatC, .12, y + .25, .05, 0, 0, -.5]);   // its end standing up at the side
      else if (o.hat === "wrap") p.push([box(.29, .13, .28), o.hatC, 0, y + .16, 0], [box(.3, .04, .29), o.hatC, 0, y + .11, 0]);
      else if (o.hat === "hood") {   // down over the shoulders behind, bright pompoms along its front edge
        p.push([box(.31, .1, .3), o.hatC, 0, y + .17, -.01], [box(.035, .3, .28), o.hatC, -.145, y + .02, -.01], [box(.035, .3, .28), o.hatC, .145, y + .02, -.01], [box(.3, .32, .04), o.hatC, 0, y + .01, -.15], [box(.32, .4, .04), o.hatC, 0, y - .3, -.15]);
        [0xf0ece0, 0xe8c040, 0x3a9a5a, 0xd84a8a].forEach((c, i) => p.push([ball(.026), c, -.105 + i * .07, y + .13, .15]));
      }
      else if (o.hat === "band") p.push([box(.29, .12, .28), o.hatC, 0, y + .15, 0], ...[y + .12, y + .18].map(yy => [box(.295, .02, .285), o.hatC2, 0, yy, 0]), [box(.06, .16, .04), o.hatC, .12, y + .08, -.13]);
      else p.push([box(.26, .08, .26), o.hair, 0, y + .14, -.005], o.man ? [box(.24, .05, .05), o.hair, 0, y + .12, .1] : [ball(.075), o.hair, 0, y + .06, -.17]);
      return p;
    }
    // the body from the waist w to the neck; ax is how far out the shoulders are
    function torso(o, w) {
      const wd = o.man ? .42 : .34, dp = o.man ? .26 : .22, f = dp / 2 + .006, p = [[box(wd, .48, dp), o.top, 0, w + .25, 0], [box(.07, .06, .07), o.skin, 0, w + .52, 0], [box(.2, .04, .2), o.top, 0, w + .5, 0]];
      if (o.collar) p.push([box(.17, .06, .15), o.top, 0, w + .53, 0]);   // the standing collar
      if (o.frogs) [.1, .2, .3, .4].forEach(dy => p.push([box(.07, .016, .012), o.trim, 0, w + dy, f]));
      else if (o.vest) p.push([box(wd + .02, .44, dp + .02), o.vest, 0, w + .23, 0], [box(.08, .44, .012), o.top, 0, w + .23, dp / 2 + .016], ...[.1, .2, .3].map(dy => [box(.02, .02, .01), GOLD, .055, w + dy, dp / 2 + .016]));
      else if (o.velvet) p.push([box(wd + .01, .05, dp + .01), o.trim, 0, w + .04, 0], [box(.04, .44, .012), o.trim, -.05, w + .25, f], [box(.04, .44, .012), o.trim, .05, w + .25, f], [box(.21, .03, .205), SILVER, 0, w + .47, 0]);
      else if (o.discs) { for (let row = 0; row < 3; row++) for (let i = 0; i < 4; i++) p.push([cyl(.028, .028, .012, 8), SILVER, -.105 + i * .07, w + .43 - row * .075, f, 0, Math.PI / 2]); }
      else p.push(o.man ? [box(.03, .44, .01), o.trim, -.1, w + .25, f] : [box(.03, .38, .01), o.trim, .09, w + .24, f]);   // fastened at the side
      if (o.apron) p.push([box(wd * .8, .62, .012), 0xf4f2ec, 0, w + .02, f + .004]);
      if (o.sling) p.push([box(.03, .62, .012), 0xb02420, 0, w + .22, f + .004, 0, 0, .55], [box(.26, .28, .07), 0xb02420, wd / 2 + .05, w - .08, .02], ...[-.06, .02, .08].map(dy => [box(.265, .025, .075), 0x18181c, wd / 2 + .05, w - .08 + dy, .02]));
      return { p, ax: wd / 2 + .045 };
    }
    // the woven bands on a wrap skirt between heights y0 and y1: Palaung stripes all the way down, Kachin pattern bands, Shan bands at the hem
    function bands(o, y0, y1) {
      const out = [];
      if (!o.skirt || !o.skirt.length) return out;
      if (o.stripes) for (let k = 0, y = y0 + .05; y < y1 - .03; k++, y += .075) out.push([y, .03, o.skirt[k % 2]]);
      else if (o.skirt.length > 2) for (let k = 0; k < 6; k++) out.push([y0 + .06 + k * .06, .025, o.skirt[k % 3]]);
      else o.skirt.forEach((c, k) => out.push([y0 + .1 + k * .14, .05, c]));
      return out;
    }
    const hoops = (o, ys) => o.hoops ? ys.map(y => [new THREE.TorusGeometry(.215, .013, 4, 12), SILVER, 0, y, 0, 0, Math.PI / 2]) : [];
    // standing, below the waist (at .84): the skirt, or the seat of the trousers; the legs come separately, hung from the hip
    function hips(o) {
      const p = o.skirt ? [[box(.36, .8, .26), o.low, 0, .46, 0], ...bands(o, .06, .86).map(([y, h, c]) => [box(.365, h, .265), c, 0, y, 0])] : [[box(o.wide ? .46 : .38, .3, o.wide ? .3 : .26), o.low, 0, .69, 0]];
      if (o.sash) p.push([box(.47, .06, .31), o.sash, 0, .83, 0]);
      return p.concat(hoops(o, [.86, .815, .77, .725, .68]));
    }
    // a leg from the hip down (wide Shan trousers, straight trousers, or an ankle under the skirt), and an arm from the shoulder down
    const leg = o => [o.skirt ? [box(.08, .12, .08), o.skin, 0, -.75, 0] : [box(o.wide ? .22 : .17, .8, o.wide ? .26 : .2), o.low, 0, -.4, 0], [box(.11, .05, .22), SHOE, 0, -.815, .05]];
    const arm = (o, held) => {
      const p = [[box(.09, .46, .1), o.top, 0, -.22, 0], [box(.07, .08, .08), o.skin, 0, -.48, 0]];
      if (held === "sticks") p.push([box(.012, .26, .012), 0x8a5a2a, -.015, -.6, .03], [box(.012, .26, .012), 0x8a5a2a, .015, -.6, .03]);
      if (held === "ladle") p.push([box(.02, .36, .02), 0x9aa0a6, 0, -.66, 0], [cyl(.06, .04, .05, 6), 0x9aa0a6, 0, -.85, 0]);
      return p;
    };
    // seated on a stool (seat at .42), knees under the table
    function seatedLegs(o) {
      const p = [];
      if (o.skirt) { p.push([box(.38, .16, .46), o.low, 0, .5, .16], [box(.36, .44, .16), o.low, 0, .24, .36], ...bands(o, .03, .44).map(([y, h, c]) => [box(.365, h, .165), c, 0, y, .36])); [-1, 1].forEach(e => p.push([box(.1, .05, .2), SHOE, e * .09, .025, .44])); }
      else [-1, 1].forEach(e => p.push([box(o.wide ? .21 : .17, .17, .46), o.low, e * .1, .5, .16], [box(o.wide ? .2 : .16, .44, .18), o.low, e * .1, .24, .38], [box(.11, .05, .22), SHOE, e * .1, .025, .46]));
      if (o.sash) p.push([box(.47, .06, .31), o.sash, 0, .55, 0]);
      return p.concat(hoops(o, [.6, .56, .52]));
    }
    // a whole person: "sit" (hands at the table, chopsticks in one), "cook" (a ladle in one hand), "serve" (both hands over the
    // counter), "walk"; the limbs come apart, each with where it hangs from and how far forward it is raised
    function figure(o, pose) {
      const sit = pose === "sit", w = sit ? .5 : .84, t = torso(o, w), body = [...t.p, ...head(o, w + .68), ...(sit ? seatedLegs(o) : hips(o))];
      const fwd = { sit: [-1.25, -1.25], cook: [-.5, -1.1], serve: [-1.15, -1.15] }[pose] || [0, 0];
      const legs = sit ? [] : [-1, 1].map(e => ({ parts: leg(o), at: [e * .1, .84, 0], rx: 0 }));
      const arms = [-1, 1].map((e, i) => ({ parts: arm(o, e > 0 ? { sit: "sticks", cook: "ladle" }[pose] : ""), at: [e * t.ax, w + .46, 0], rx: fwd[i] }));
      return { body, legs, arms };
    }
    const placed = (f, m4) => fix([...f.body, ...[...f.legs, ...f.arms].flatMap(l => fix(l.parts, rotAt(l.rx, l.at)))], m4);
    const ETH = ["shan", "palaung", "kachin", "chinese"], folk = [];
    // the cooks: Shan at the Shan stalls (now and then a Palaung woman helping), Yunnanese in white aprons at the Chinese ones
    frames.forEach(({ m4, shan }) => {
      const cooks = shan ? [[-1.9, "cook"], [.4, "serve"]] : [[-1.0, "serve"], [1.8, "cook"]];
      cooks.forEach(([x, pose], k) => {
        if (k && r() < .35) return;
        const o = shan ? (r() < .25 ? dress("palaung", false) : dress("shan", r() < .5, r() < .2)) : Object.assign(dress("chinese", r() < .5, false), { apron: true });
        folk.push(...placed(figure(o, pose), m4.clone().multiply(at(x, 0, -.05))));
      });
    });
    // the diners, on six of the stools, each with a bowl before them
    for (let i = seats.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [seats[i], seats[j]] = [seats[j], seats[i]]; }
    seats.slice(0, 6).forEach((s, i) => {
      folk.push(...placed(figure(dress(ETH[i % 4], r() < .5, r() < .25), "sit"), s.m4));
      stuff.push(...fix(bowl(0, .745, .42), s.m4));
    });
    const stuffMesh = new THREE.Mesh(linear(lowPoly(stuff)), vcM); stuffMesh.castShadow = true; stuffMesh.receiveShadow = true; g.add(stuffMesh);
    clickable(list, stuffMesh, { tip: "The food street", toast: "Five stalls along the temple's east wall, Shan and Chinese by turns: rice and curries, Shan noodles and warm tofu, tea and Shan sweets, buns and dumplings out of bamboo steamers, and red and blue stools to sit on while you eat." });
    const folkMesh = new THREE.Mesh(linear(lowPoly(folk)), folkM); folkMesh.castShadow = true; folkMesh.receiveShadow = true; g.add(folkMesh);
    clickable(list, folkMesh, { tip: "Cooks and diners on the food street", toast: "Everyone eats here: Shan in loose trousers and cloth turbans, Palaung women in red hoods and striped skirts with silver hoops at the waist, Kachin women with silver discs on black blouses, Yunnanese cooks in white aprons." });
    folkMesh.raycast = function (ray, out) { if (folkMesh.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); };
    folkMesh.visible = false;

    // the strollers: three pairs of friends walking up and down the street, limbs swinging
    const strollG = new THREE.Group(); strollG.userData.noCull = true; strollG.visible = false; g.add(strollG);
    const limbMesh = parts => { const m = new THREE.Mesh(linear(lowPoly(fix(parts))), folkM); m.castShadow = true; return m; };
    const parties = [[["palaung", 0], ["palaung", 0]], [["kachin", 1], ["kachin", 0]], [["chinese", 1], ["shan", 0]]].map((pair, i) => {
      const pg = new THREE.Group(); strollG.add(pg);
      const members = pair.map(([eth, man], k) => {
        const f = figure(dress(eth, !!man, false), "walk"), w = new THREE.Group(); w.position.x = (k - .5) * .64; pg.add(w);
        w.add(limbMesh(f.body));
        return { ph: r() * TAU, limbs: [...f.legs, ...f.arms].map(l => { const piv = new THREE.Group(); piv.position.set(...l.at); piv.add(limbMesh(l.parts)); w.add(piv); return piv; }) };
      });
      return { pg, members, z: FOOD.z0 + (FOOD.z1 - FOOD.z0) * (.15 + i * .33), dir: i % 2 ? -1 : 1, speed: .85 + r() * .2, x: FOOD.lanes[i] };
    });

    // red lanterns hung from the Chinese stalls' eaves, glowing at night and swinging a little in the breeze
    const lanternM = std({ vertexColors: true, flatShading: true, roughness: .6 });
    onDaylight(d => lanternM.emissive.copy(lerpC(0x7a1a10, 0x000000, d)));
    const lanternGeo = linear(lowPoly(fix([[box(.012, .14, .012), 0x2a1a14, 0, -.07, 0], [cyl(.1, .1, .04, 8), GOLD, 0, -.16, 0], [cyl(.16, .2, .1, 8), 0xc81e1e, 0, -.23, 0], [cyl(.2, .2, .18, 8), 0xc81e1e, 0, -.37, 0], [cyl(.2, .16, .1, 8), 0xc81e1e, 0, -.51, 0], [cyl(.1, .1, .04, 8), GOLD, 0, -.58, 0], [box(.05, .16, .05), 0xe8c040, 0, -.68, 0]])));
    const lanterns = lanternAt.map((p, i) => {
      const piv = new THREE.Group(); piv.position.copy(p); piv.userData.noCull = true; g.add(piv);
      piv.add(new THREE.Mesh(lanternGeo, lanternM));
      const glow = glowSprite(0xff7a4a, 1.2, 0); glow.material.fog = false; glow.position.y = -.37; piv.add(glow);
      return { piv, glow, ph: i * 1.7 };
    });
    onDaylight(d => lanterns.forEach(l => l.glow.material.opacity = .7 * (1 - d)));

    // steam rising off the pots and steamers: low-poly puffs that swell and shrink away as they rise
    const PUFFS = 4, steamM = std({ color: 0xf4f4f0, transparent: true, opacity: .45, flatShading: true, roughness: 1, depthWrite: false });
    onDaylight(d => steamM.color.copy(lerpC(0x4a5058, 0xf4f4f0, d)));
    const steam = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.1, 0), steamM, steamAt.length * PUFFS);
    steam.frustumCulled = false; steam.userData.noCull = true; steam.castShadow = false; steam.visible = false; g.add(steam);
    const sm = new THREE.Matrix4(), sq = new THREE.Quaternion(), sv = V(0, 0, 0), ss = V(1, 1, 1);
    let st = 0;
    updaters.pagoda.push((dt, t, motion) => {
      const on = FOLK.food;
      if (folkMesh.visible !== on) folkMesh.visible = strollG.visible = steam.visible = on;
      lanterns.forEach(l => { l.piv.rotation.z = Math.sin(t * 1.3 + l.ph) * .07 * motion; l.piv.rotation.x = Math.sin(t * .9 + l.ph * 2) * .04 * motion; });
      if (!on) return;
      st += dt * motion;
      steamAt.forEach((p, i) => {
        for (let k = 0; k < PUFFS; k++) {
          const u = (st * .45 + k / PUFFS + i * .37) % 1;
          sv.set(p.x + Math.sin(u * 5 + i) * .07, p.y + u * .9, p.z + Math.cos(u * 4 + i) * .06); ss.setScalar(Math.sin(u * Math.PI) * (.5 + u * 1.3));
          steam.setMatrixAt(i * PUFFS + k, sm.compose(sv, sq, ss));
        }
      });
      steam.instanceMatrix.needsUpdate = true;
      parties.forEach(pt => {
        pt.z += pt.dir * pt.speed * dt * motion;
        if (pt.z > FOOD.z1) { pt.z = FOOD.z1; pt.dir = -1; } else if (pt.z < FOOD.z0) { pt.z = FOOD.z0; pt.dir = 1; }
        pt.pg.position.set(pt.x, .05, pt.z); pt.pg.rotation.y = pt.dir > 0 ? 0 : Math.PI;
        pt.members.forEach(m => {
          m.ph += dt * motion * pt.speed * 4.2; const s = Math.sin(m.ph);
          m.limbs[0].rotation.x = s * .42; m.limbs[1].rotation.x = -s * .42; m.limbs[2].rotation.x = -s * .3; m.limbs[3].rotation.x = s * .3;
        });
      });
    });
  }
