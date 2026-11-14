  /* ---------- the seven-day market's stalls, filled and staffed: every table heaped with what the hills bring in (heaps of tomatoes,
     mandarins and limes on bamboo trays, cabbages and garlic; flat trays of dried Shan tea leaf and packets of tea; Shan noodles
     (ခေါက်ဆွဲ) served from a pot on a clay stove, with stacked bowls, coils of fresh rice noodle and jars of chilli oil and pickled
     greens; baskets of dried chillies, beans, peanuts and turmeric; stacks of bright woven cloth with longyi lengths and Shan shoulder
     bags hung behind; towers of woven bamboo baskets and wide bamboo hats). A seller stands behind every table, or sits on a stool:
     Shan men in loose Shan trousers, a side-fastened jacket and a towel turban, women in a fitted Shan blouse and a banded longyi under
     a wide woven bamboo hat; shoppers fill the aisles with woven bags and baskets, some with a child. Low-poly and flat-shaded: all the
     goods are one mesh, all the people another, shown while the stalls are open (FOLK.stalls, 9 am–noon and 5–9 pm); nobody blocks the aisles ---------- */
  function marketStalls(g, stalls, list) {
    const r = rng(7707), pk = l => l[(r() * l.length) | 0];
    const goodsM = std({ vertexColors: true, flatShading: true, roughness: .8 }), folkM = std({ vertexColors: true, flatShading: true, roughness: .85 });
    onDaylight(d => folkM.emissive.copy(lerpC(0x1c1814, 0x000000, d)));   // a little lift so they read under the bulbs at night
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n), cone = (a, h, n = 8) => new THREE.ConeGeometry(a, h, n);
    const ball = (rad, sy = 1) => { const q = new THREE.IcosahedronGeometry(rad, 0); q.scale(1, sy, 1); return q; };
    // lowPoly reads colours as linear; these are written as seen, so turn them linear first (as in the morning market)
    const solid = geo => { const c = geo.attributes.color; for (let i = 0; i < c.array.length; i++) c.array[i] = Math.pow(c.array[i], 2.2); return geo; };
    // parts [geo, colour, x, y, z, ry, rx, rz] turned, moved and placed by m4, ready for lowPoly
    const fix = (p, m4) => p.map(([geo, col, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0]) => { const q = geo.index ? geo.toNonIndexed() : geo.clone(); if (rz) q.rotateZ(rz); if (rx) q.rotateX(rx); if (ry) q.rotateY(ry); q.translate(x, y, z); if (m4) q.applyMatrix4(m4); return [q, col, 0, 0, 0]; });
    const at = (x, z, ry, s = 1) => new THREE.Matrix4().compose(V(x, .06, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(s, s, s));

    /* ---------- the goods, in a stall's own frame: the table top is TOP high, x ±1.35, z −.55 (the seller's side) … .95 (the aisle) ---------- */
    const TOP = .84, BAMBOO = 0xc8a868, BAMBOO_D = 0x8a6a3a, CLAY = 0x9a5a3a, ALU = 0xb8bcc0, CHINA = 0xf2f0ea, BLUE = 0x3a6ac0;
    const tray = (x, z, rad, y = TOP) => [cyl(rad, rad * .85, .05, 10), BAMBOO, x, y + .025, z];
    // a mound of round things (n across at the bottom), on a tray or straight on the table
    const heap = (x, z, col, rr, n, y = TOP + .05, sy = 1) => { const p = []; for (let k = 0; k < n; k++) for (let i = 0; i < n - k; i++) for (let j = 0; j < n - k; j++) p.push([ball(rr, sy), Array.isArray(col) ? pk(col) : col, x + (i - (n - k - 1) / 2) * rr * 1.8 + (r() - .5) * rr * .3, y + rr * sy * (1 + k * 1.45), z + (j - (n - k - 1) / 2) * rr * 1.8]); return p; };
    // a woven bamboo basket with its two bands, heaped with `fill`
    const basket = (x, y, z, rt, h, fill) => { const p = [[cyl(rt, rt * .78, h, 10), BAMBOO, x, y + h / 2, z], [cyl(rt + .012, rt + .012, .03, 10), BAMBOO_D, x, y + h - .015, z], [cyl(rt * .9, rt * .88, .03, 10), BAMBOO_D, x, y + h * .4, z]]; if (fill) p.push([cone(rt * .94, h * .5, 9), fill, x, y + h + h * .22, z]); return p; };
    const sack = (x, z, fill) => [[cyl(.2, .21, .36, 9), pk([0xf0ece0, 0xe8dcc0, 0x9ab0c8, 0xd8e8c0]), x, .18, z], [box(.44, .06, .1), 0xe8dcc0, x, .35, z + .19], [cone(.19, .1, 9), fill, x, .41, z]];
    const bar = () => [box(2.9, .04, .04), BAMBOO, 0, 2.15, -1.15];   // a pole between the back poles, to hang things from
    const CLOTH = [0xc8302a, 0xe8822a, 0xe8c040, 0x2a7a5a, 0x2a4a9a, 0x7a2a6a, 0xd84a7a, 0x3a9ac0, 0xf0ece0, 0x1a1a22];
    const LEAF = [0x4a5a2a, 0x5a4a26, 0x3a4a22, 0x6a6a30], GRAIN = [0x9a1a14, 0xeee6d6, 0xc8a070, 0x5a8a2a, 0xd8c080, 0xd8a020, 0x6a3a1a, 0xf0ece0, 0x8a2a2a];
    const GOODS = {
      // heaps of fruit and vegetables on bamboo trays, bananas hanging behind, a crate of cabbages on the ground
      produce: umb => {
        const p = [], KIND = [[0xc8302a, .055], [0xf08a1c, .06], [0x8ab83a, .045], [0xb08a5a, .06], [0x8a2a4a, .05], [0xf0e8dc, .045], [0x3a2a3a, .07]];
        [-.95, -.32, .32, .95].forEach(x => { const [c, rr] = pk(KIND); p.push(tray(x, .3, .3), ...heap(x, .3, c, rr, 3)); });
        [-.7, 0, .7].forEach(x => { const [c, rr] = pk(KIND); p.push(...heap(x, .78, c, rr * .9, 2, TOP)); });
        p.push(...heap(-1.15, .82, [0x9ac86a, 0x8ab85a], .12, 1, TOP, .8));
        p.push([box(.55, .3, .4), BAMBOO_D, .9, .15, -.75], ...heap(.9, -.75, [0x9ac86a, 0xb8d88a], .12, 2, .28, .85));
        if (!umb) { p.push(bar()); [-.9, -.3, .5].forEach(x => { p.push([box(.03, .2, .03), 0x6a8a3a, x, 2.02, -1.15]); for (let k = 0; k < 7; k++) p.push([box(.035, .14, .035), 0xe8c838, x + Math.cos(k) * .06, 1.88 - (k % 3) * .05, -1.15 + Math.sin(k) * .06, k, 0, .4 * Math.cos(k * 2)]); }); }
        return p;
      },
      // dried Shan tea leaf heaped on wide trays, rows of tea packets at the front, tall baskets of leaf on the ground
      tea: () => {
        const p = [];
        [-.9, 0, .9].forEach(x => p.push(tray(x, .25, .4), [cone(.33, .16, 7), pk(LEAF), x, TOP + .13, .25], ...heap(x + .2, .5, pk(LEAF), .04, 1, TOP + .05)));
        for (let i = 0; i < 9; i++) { const c = pk([0x2a7a3a, 0xc8302a, 0xe8c040, 0x3a5a2a]); p.push([box(.11, .17, .07), c, -1.2 + i * .3, TOP + .085, .8], [box(.112, .05, .072), 0xf0e8d0, -1.2 + i * .3, TOP + .1, .8]); }
        p.push(...basket(-1.1, 0, -.75, .24, .5, pk(LEAF)), ...basket(-.55, 0, -.8, .2, .44, pk(LEAF)));
        return p;
      },
      // Shan noodles: a pot of broth on a clay charcoal stove, stacked bowls, coils of fresh rice noodle, dried noodle bundles,
      // jars of chilli oil, pickled mustard greens, peanuts and garlic oil, and two bowls ready with the orange tomato topping
      noodles: () => {
        const p = [[cyl(.2, .17, .26, 8), CLAY, -1.0, TOP + .13, .15], [box(.12, .06, .02), 0xe8501a, -1.0, TOP + .08, .32], [cyl(.2, .2, .24, 10), ALU, -1.0, TOP + .38, .15], [cyl(.185, .185, .02, 10), 0xc8742a, -1.0, TOP + .47, .15]];
        [[-.45, .0], [-.45, .25], [-.2, .0]].forEach(([x, z]) => { for (let k = 0; k < 5; k++) p.push([cyl(.09, .055, .05, 8), k === 4 ? BLUE : CHINA, x, TOP + .025 + k * .04, z]); });
        p.push(tray(.2, .35, .3)); for (let i = 0; i < 6; i++) p.push([ball(.075, .45), 0xf6f2e4, .2 + Math.cos(i) * .16 * (i ? 1 : 0), TOP + .08, .35 + Math.sin(i) * .16 * (i ? 1 : 0)]);
        for (let k = 0; k < 4; k++) p.push([box(.24, .06, .12), 0xf0ece0, .75, TOP + .03 + k * .06, .0], [box(.03, .062, .122), 0xc8302a, .75, TOP + .03 + k * .06, .0]);
        [0xa8201a, 0x6a8a2a, 0xc89a5a, 0xd8b860].forEach((c, i) => p.push([cyl(.05, .05, .12, 8), c, .7 + (i % 2) * .14, TOP + .06, .5 + (i >> 1) * .14], [cyl(.052, .052, .025, 8), 0xd83a2a, .7 + (i % 2) * .14, TOP + .13, .5 + (i >> 1) * .14]));
        [-.6, -.25].forEach(x => p.push([cyl(.1, .06, .07, 8), CHINA, x, TOP + .035, .75], [cyl(.088, .088, .02, 8), 0xf0e8d0, x, TOP + .065, .75], [cone(.05, .03, 7), 0xd8641a, x, TOP + .085, .75]));
        p.push([cyl(.17, .15, .34, 10), BLUE, -1.1, .17, -.75], [cyl(.16, .16, .02, 10), 0x7aa8c8, -1.1, .33, -.75]);   // a bucket of water
        return p;
      },
      // baskets of dried chillies, garlic, peanuts, beans, turmeric and rice, a raised back row, open sacks on the ground
      spices: () => {
        const p = [];
        [-1.05, -.52, 0, .52, 1.05].forEach(x => p.push(...basket(x, TOP, .65, .22, .12, pk(GRAIN))));
        p.push([box(2.5, .12, .4), BAMBOO_D, 0, TOP + .06, .05]);
        [-.9, -.3, .3, .9].forEach(x => p.push(...basket(x, TOP + .12, .05, .2, .12, pk(GRAIN))));
        p.push(...sack(-1.1, -.75, pk(GRAIN)), ...sack(-.62, -.8, pk(GRAIN)));
        return p;
      },
      // stacks of bright woven cloth and rolls of it, longyi lengths and striped Shan shoulder bags hung on the back pole
      cloth: umb => {
        const p = [];
        for (let i = 0; i < 5; i++) { const x = -1.1 + i * .55; let y = TOP; const n = 3 + ((r() * 4) | 0); for (let k = 0; k < n; k++) { const h = .05 + r() * .03; p.push([box(.44, h, .34), pk(CLOTH), x + (r() - .5) * .04, y + h / 2, .5]); if (r() < .5) p.push([box(.445, .014, .345), pk(CLOTH), x, y + h * .6, .5]); y += h; } }
        for (let i = 0; i < 4; i++) p.push([cyl(.07, .07, .5, 8), pk(CLOTH), -.9 + i * .58, TOP + .07, -.3, 0, 0, Math.PI / 2]);
        if (!umb) {
          p.push(bar());
          for (let i = 0; i < 6; i++) {
            const x = -1.2 + i * .48, c = pk(CLOTH);
            if (i % 2) { p.push([box(.03, .3, .02), c, x - .1, 2.0, -1.15], [box(.03, .3, .02), c, x + .1, 2.0, -1.15], [box(.32, .32, .06), c, x, 1.7, -1.15]); [1.62, 1.72, 1.8].forEach(y => p.push([box(.322, .025, .062), pk(CLOTH), x, y, -1.15])); }
            else { p.push([box(.42, 1.0, .02), c, x, 1.65, -1.15]); [1.3, 1.42].forEach(y => p.push([box(.422, .06, .022), pk(CLOTH), x, y, -1.15])); }
          }
        }
        return p;
      },
      // towers of nested baskets, stacks of wide bamboo hats and winnowing trays; more hats hung behind, big baskets on the ground
      baskets: umb => {
        const p = [];
        [-1.0, .1].forEach(x => { for (let k = 0; k < 3; k++) p.push(...basket(x, TOP + k * .09, .3, .26, .22)); });
        [-.45, .65].forEach(x => { for (let k = 0; k < 7; k++) p.push([cone(.34, .12, 12), k % 2 ? BAMBOO : 0xd8b878, x, TOP + .06 + k * .035, .6]); });
        for (let k = 0; k < 4; k++) p.push([cyl(.3, .3, .025, 12), BAMBOO, 1.05, TOP + .015 + k * .028, .2]);
        p.push(...basket(-1.1, 0, -.75, .3, .45), ...basket(-1.1, .45, -.75, .27, .3));
        if (!umb) { p.push(bar()); [-1.0, -.35, .3, .95].forEach(x => p.push([cone(.32, .11, 12), 0xd8b878, x, 1.95, -1.12, 0, Math.PI / 2], [box(.02, .14, .02), BAMBOO_D, x, 2.08, -1.15])); }
        return p;
      }
    };
    const KINDS = ["produce", "produce", "tea", "noodles", "spices", "cloth", "baskets"];
    const goods = [];
    stalls.forEach(s => goods.push(...fix(GOODS[pk(KINDS)](s.umb), at(s.x, s.z, s.face))));
    goods.forEach(p => p[0].translate(0, -.06, 0));   // `at` lifts people onto the market's earth; stalls stand on y 0
    const goodsMesh = new THREE.Mesh(solid(lowPoly(goods)), goodsM); goodsMesh.receiveShadow = true; g.add(goodsMesh);
    clickable(list, goodsMesh, { tip: "Stalls of the seven-day market", toast: "Whatever the hills grow and the valleys weave: tomatoes, mandarins and limes heaped on bamboo trays, dried Shan tea leaf, bowls of Shan noodles, baskets of chillies, beans and turmeric, bright woven cloth and Shan bags, bamboo baskets and wide hats." });

    /* ---------- the people, built facing +z with their feet at y 0 ---------- */
    const SKIN = [0xd8a47a, 0xc89068, 0xe0b088, 0xb88058], HAIR = 0x1c1614, GREY = 0xcfccc6, INK = 0x2a1c18, THANAKA = 0xf0e2b4, STRAW = 0xd8b878;
    const BLOUSE = [0xe8a0b0, 0x8ab8d8, 0xf0e6c8, 0xb8a0d0, 0xa8d0b0, 0xf4f2ec, 0xe8c86a, 0xd8705a], SIN = [0x7a2032, 0x5a2a5a, 0x2a4a7a, 0x8a2a4a, 0x2f5a3a, 0xb8402a, 0x3a2a4a];
    const BAND = [0xe8c040, 0xf0ece0, 0xd84a6a, 0x3a9a8a, 0xe88a2a], JACKET = [0xf0ece0, 0x2a3450, 0xd8ccb4, 0x5a4232, 0x3a5a6a, 0x8a8478];
    const TROUS = [0x23232b, 0x2a3450, 0x3a2e28, 0x4a4038, 0x2e3a2e], TURBAN = [0xe88aa0, 0xe8903a, 0xf0ece0, 0xe8d070, 0xd84a4a, 0x8ac0d8];
    // the head, centred at height y: face, ears, eyes, mouth; thanaka on a woman's cheeks; a towel turban, a wide bamboo hat or a bun
    const head = (y, o) => {
      const p = [[box(.24, .26, .24), o.skin, 0, y, 0], [box(.03, .06, .05), o.skin, -.13, y, 0], [box(.03, .06, .05), o.skin, .13, y, 0],
        [box(.035, .04, .012), INK, -.055, y + .015, .122], [box(.035, .04, .012), INK, .055, y + .015, .122], [box(.06, .012, .01), 0x8a3a30, 0, y - .07, .121],
        [box(.26, .22, .07), o.hair, 0, y, -.1]];
      if (o.thanaka) [-1, 1].forEach(e => p.push([box(.065, .075, .012), THANAKA, e * .072, y - .035, .121]));
      if (o.hat === "turban") p.push([box(.29, .13, .28), o.turban, 0, y + .16, 0], [box(.29, .04, .29), o.turban2, 0, y + .2, 0], [box(.09, .1, .06), o.turban, .13, y + .23, .04]);   // the towel wound round, its end tucked up at the side
      else if (o.hat === "kup") p.push([cone(.5, .17, 12), STRAW, 0, y + .22, 0], [cyl(.5, .5, .015, 12), 0xa8844a, 0, y + .135, 0], [box(.26, .1, .26), o.hair, 0, y + .14, 0], [box(.015, .14, .015), 0x8a2a2a, -.11, y - .02, .06], [box(.015, .14, .015), 0x8a2a2a, .11, y - .02, .06]);   // the wide woven hat, its chin ties
      else p.push([box(.26, .08, .26), o.hair, 0, y + .14, -.005], o.man ? [box(.24, .05, .05), o.hair, 0, y + .12, .1] : [ball(.075), o.hair, 0, y + .06, -.17]);
      return p;
    };
    // the body to the waist w: a woman's fitted Shan blouse fastened at the side, or a man's loose Shan jacket; arms on the table,
    // at the sides, or with a woven bag or basket in one hand
    const chest = (w, o, pose) => {
      const wd = o.man ? .42 : .34, p = [[box(wd, .48, o.man ? .26 : .22), o.top, 0, w + .25, 0], [box(.07, .06, .07), o.skin, 0, w + .52, 0], [box(.2, .04, .2), o.top, 0, w + .5, 0]];
      p.push(o.man ? [box(.03, .44, .01), o.trim, -.1, w + .25, .131] : [box(.03, .38, .01), o.trim, .09, w + .24, .111]);   // the fastening down the front
      const ax = wd / 2 + .04;
      if (pose === "table") [-1, 1].forEach(e => p.push([box(.09, .28, .1), o.top, e * ax, w + .34, 0], [box(.08, .08, .3), o.top, e * (ax - .04), w + .18, .15], [box(.07, .06, .08), o.skin, e * (ax - .06), w + .17, .32]));
      else {
        [-1, 1].forEach(e => p.push([box(.09, .46, .1), o.top, e * ax, w + .23, 0], [box(.07, .08, .08), o.skin, e * ax, w - .04, 0]));
        if (o.bag === "basket") p.push(...basket(ax + .12, w - .3, .04, .14, .2, pk(GRAIN)));
        else if (o.bag) p.push([box(.3, .3, .1), o.bag[0], ax + .08, w - .2, .02], ...[-.08, .02, .1].map(dy => [box(.305, .03, .105), o.bag[1], ax + .08, w - .2 + dy, .02]), [box(.03, .6, .03), o.bag[0], ax - .04, w + .12, .02, 0, 0, -.35]);   // a striped Shan bag on its strap
      }
      return p;
    };
    // the legs to the waist at .84: loose Shan trousers gathered at a sash, or a longyi to the ankle with woven bands; sandals
    const legs = o => {
      const p = [-1, 1].map(e => [box(.11, .04, .22), 0x3a2a22, e * .1, .02, .05]);
      if (o.man) p.push([box(.46, .38, .3), o.low, 0, .65, 0], ...[-1, 1].map(e => [box(.2, .44, .24), o.low, e * .11, .26, 0]), [box(.47, .06, .31), o.sash, 0, .83, 0]);
      else p.push([box(.36, .82, .26), o.low, 0, .45, 0], ...[.16, .3].map(y => [box(.365, .05, .265), o.band, 0, y, 0]));
      return p;
    };
    const standing = (o, pose) => legs(o).concat(chest(.84, o, pose), head(1.52, o));
    const onStool = o => [[box(.34, .36, .34), pk([0x2a7ac8, 0x3a9a5a, 0xd83a3a]), 0, .18, -.05], [box(.36, .14, .44), o.low, 0, .43, .07], [box(.34, .4, .14), o.low, 0, .22, .28], [box(.37, .04, .145), o.band, 0, .2, .28], ...[-1, 1].map(e => [box(.1, .04, .18), 0x3a2a22, e * .09, .02, .34])].concat(chest(.48, o, "table"), head(1.16, o));
    const person = (seller) => {
      const man = r() < (seller ? .4 : .45), old = r() < .25, h = r();
      return man
        ? { man, skin: pk(SKIN), hair: old ? GREY : HAIR, top: pk(JACKET), trim: pk(TROUS), low: pk(TROUS), sash: pk(TURBAN), hat: h < .65 ? "turban" : h < .8 ? "kup" : "", turban: pk(TURBAN), turban2: pk(TURBAN) }
        : { man, skin: pk(SKIN), hair: old ? GREY : HAIR, top: pk(BLOUSE), trim: pk(BAND), low: pk(SIN), band: pk(BAND), thanaka: r() < .75, hat: h < (seller ? .6 : .45) ? "kup" : h < .75 ? "turban" : "", turban: pk(TURBAN), turban2: pk(TURBAN) };
    };
    const folk = [];
    // a seller behind every table, a few women sitting on a stool
    stalls.forEach(s => { const o = person(true), m4 = at(s.x, s.z, s.face), lm = new THREE.Matrix4().compose(V(.3 + r() * .5, 0, -.88), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), (r() - .5) * .4), V(1, 1, 1)); folk.push(...fix(!o.man && r() < .3 ? onStool(o) : standing(o, "table"), m4.multiply(lm))); });
    // shoppers at the stall fronts, facing the goods, some with a companion or a child; a few walking down the middle of the aisle
    const shopper = (x, z, ry, s = 1) => { const o = person(false); o.bag = r() < .3 ? "basket" : r() < .8 ? [pk([0xc8302a, 0x2a4a9a, 0x2a7a5a, 0xe8c040, 0x7a2a6a]), pk(BAND)] : 0; folk.push(...fix(standing(o, "stand"), at(x, z, ry, s))); };
    stalls.forEach(s => {
      if (r() > .6) return;
      const out = Math.sin(s.face), x = s.x + out * (1.65 + r() * .3), z = s.z + (r() - .5) * 1.6, ry = s.face + Math.PI + (r() - .5) * .6;
      shopper(x, z, ry, .95 + r() * .1);
      if (r() < .3) shopper(x + out * .1, z + (r() < .5 ? -.55 : .55), ry + (r() - .5) * .5, r() < .5 ? .62 : .95);
    });
    [52, 68, 84].forEach(ax => { for (let i = 0; i < 3; i++) shopper(ax + (r() < .5 ? -.6 : .6), 19 + i * 9 + r() * 4, r() < .5 ? 0 : Math.PI, .95 + r() * .1); });
    const folkMesh = new THREE.Mesh(solid(lowPoly(folk)), folkM); folkMesh.castShadow = true; folkMesh.receiveShadow = true; g.add(folkMesh);
    clickable(list, folkMesh, { tip: "Sellers and shoppers at the seven-day market", toast: "The whole valley comes on market day: Shan farmers in loose trousers and towel turbans, women in fitted Shan blouses and banded longyi under wide bamboo hats, thanaka on their cheeks, bargaining over tea leaf and tomatoes with woven bags on their arms." });
    folkMesh.raycast = function (ray, out) { if (folkMesh.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); };
    folkMesh.visible = false;
    updaters.pagoda.push(() => { if (folkMesh.visible !== FOLK.stalls) folkMesh.visible = FOLK.stalls; });
  }
