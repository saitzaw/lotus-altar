  /* ---------- Shan Kathin (ပွႆးၵထိၼ်, Burmese ကထိန်ပွဲ), the offering of robes after the rains retreat. On one day, the full
     moon of Tazaungmon in November (CONFIG.kathin, ?kathin=1/0), when there is no Shinlaung procession, the town carries one new
     set of monastic robes to the second monastery. They form in the courtyard of the Haw Kham, the saopha's palace, come out
     of its town gate at noon and go round the old quarter, the wooden streets between the palace and the temple, with no
     dance stops, and reach the monastery about ten minutes later; the robe is offered at the foot of its stair and five monks
     who kept the retreat wait on the porch to receive it. Everyone has gone home by 2. Called off while it rains.
     The great Kathin flag leads on two bamboo poles, then four Buddhist flags, two squares of poles strung with little flags,
     five padetha trees (ပဒေသာပင်), each on two shoulder poles that four men carry, the last hung with banknotes under a white
     umbrella, a tower of flowers nearly ten metres high, a palanquin dressed in Buddhist-flag cloth; then women with offering bowls, the robe itself under a
     white umbrella, the donors, and the Shan band at the back. The Shan name is ours, for a speaker to check ---------- */
  const KATHIN = {
    speed: .45,     // metres a second, the same easy walk as the Poy Sang Long
    stride: 1.3,
    far: 170,       // hidden when the walker is farther than this from the head, or from the monks
    test: { gather: 48 }   // with ?kathin=1: the same easy walk, then once all are in place they stand this long and it starts again from Haw Kham
  };
  const KATHIN_INFO = {
    tip: "Shan Kathin · ပွႆးၵထိၼ် · ကထိန်ပွဲ",
    toast: "The Shan Kathin, the offering of robes after the rains retreat. On the full moon day of Tazaungmon, Tazaungdaing (တန်ဆောင်တိုင်), in November, the month after the rains retreat ends at Thadingyut (သီတင်းကျွတ်), the town carries one new set of monastic robes to the monastery. A great flag leads, with Buddhist flags and strings of little flags behind it; then five padetha trees (ပဒေသာပင်), the wishing trees of gifts, each on two bamboo poles carried by four men and hung with paper flowers, a tower of flowers and a palanquin; the robe itself is carried under a white umbrella. Five monks who kept the retreat receive it on the porch. A monastery may receive the kathina only once in that month."
  };
  const MONEY_INFO = {
    tip: "The money tree · ပဒေသာပင်",
    toast: "A padetha tree (ပဒေသာပင်) hung with banknotes folded into fans, the town's gift of money to the monastery with the new robes, under a white umbrella. Four men carry it on two bamboo poles."
  };
  const FLAG_INFO = {
    tip: "The Kathin flag",
    toast: "The great flag that leads the Shan Kathin: saffron and yellow cloth with red and purple spots, tied to the top of a tall bamboo pole, its far corner lashed to a second pole carried beside it so it fills like a sail."
  };
  const BANNER_INFO = {
    tip: "The Buddhist flag · ဗုဒ္ဓအလံ",
    toast: "Men in wide straw hats, white shirts and orange vests carry the Buddhist flag (ဗုဒ္ဓအလံ) at the front of the Shan Kathin: blue, yellow, red, white and orange, and the five again together in the sixth band. The first pole also flies a long red-and-white streamer."
  };
  const PENNANT_INFO = {
    tip: "Strings of flags",
    toast: "Strings of little flags in the Buddhist colours, with green and pink, strung between tall bamboo poles that four men carry, along the sides and across the front and back."
  };
  const PALANQUIN_INFO = {
    tip: "The palanquin",
    toast: "A palanquin carried on two bamboo poles by four men in saffron trousers, dressed in cloth printed with Buddhist flags, gold tinsel and white lace, with two white umbrellas: it carries the town's gifts for the monks."
  };
  const TOWER_INFO = {
    tip: "The tower of flowers",
    toast: "A tower of flowers nearly ten metres high, rings of red, orange, pink and yellow tapering to a gilt spike, on a white box with framed pictures. Eight men carry it on its bamboo frame, and it sways above the street as they walk."
  };
  const MONK_INFO = {
    tip: "The monks receiving the robe",
    toast: "Five monks who kept the rains retreat wait on the monastery's porch. The town offers them one new set of robes, the kathina, and they receive it here. A monastery may receive the kathina only once in this month."
  };

  /* ---------- a white umbrella with a gilt edge and tassels, as over the robe and the money tree; its stem at the origin ---------- */
  function kathinShade(K, R = .58) {
    const sp = [], WHITE = 0xf7f4ee, GILT = 0xe8b02e;
    sp.push([K.cone(R, .2, 12, true), WHITE, 0, 0, 0], [new THREE.CylinderGeometry(R, R, .045, 12, 1, true), GILT, 0, -.11, 0], [K.cone(R * .41, .12, 10, true), GILT, 0, .14, 0], [K.ball(.035), GILT, 0, .24, 0]);
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; sp.push([K.cone(.018, .09, 4), i % 2 ? GILT : 0xd45512, Math.sin(a) * R, -.18, Math.cos(a) * R, Math.PI]); }
    return K.solid(sp, K.shadeM);
  }

  /* ---------- a padetha tree (ပဒေသာပင်), the wishing tree of gifts: four men carry two bamboo shoulder poles, and between the
     poles stands a tall wrapped trunk, about five metres to the top, with branches curving up all round it, hung with paper
     flowers and streamers. The money tree is hung with folded banknotes instead, fanned like flowers, and carries a white
     umbrella on its top. Returns a group, front +z ---------- */
  const PADETHA = [   // trunk, flower colours, streamer colours: pink and white, red and gold, silver and pink, white and gold
    { trunk: 0xf0ece0, bloom: [0xf2a0c0, 0xf8f4f0, 0xe86a98], strip: [0xf2b0c8, 0xe8e4f0] },
    { trunk: 0x8aa050, bloom: [0xe8402e, 0xf0c428, 0xf8f4f0], strip: [0xf0c428, 0xe86030] },
    { trunk: 0xdcdcd4, bloom: [0xd8d8e0, 0xf2a0c0, 0xb8c0d0], strip: [0xe8e8f0, 0xf2b0c8] },
    { trunk: 0xf0ece0, bloom: [0xf8f4f0, 0xf0c428, 0xf2a0c0], strip: [0xe8c85a, 0xf8f4f0] }
  ];
  const BANKNOTE = [0xd9d2b4, 0xc9d4b0, 0xb8c8d8, 0xe0c8b0];
  function createKathinPadetha(seed = 1, money = false) {
    const K = procKit(), r = rng(9800 + seed), pk = l => l[(r() * l.length) | 0];
    const unit = new THREE.Group(), walkers = [], poles = [], shades = [];
    [[-.52, 1.15], [.52, 1.15], [-.52, -1.15], [.52, -1.15]].forEach(([x, z]) => {
      const skin = pk(P_SKIN), top = pk([0xf2f0ea, 0xf2dc78, 0xf2b0c0, 0xa8d0ec]), trousers = pk([0x2e3446, 0x4a3a2c]), p = [];
      procBody(p, { top, trousers, skin, long: true }); procHeadwrap(p, top); procCord(p);
      const inner = x < 0 ? 1 : -1;   // the hand toward the pole, between the carriers
      procArm(p, inner, top, skin, [inner * .16, 1.22, .06], [inner * .12, 1.4, .02], true);
      procArm(p, -inner, top, skin, [-inner * .22, 1.0, .04], [-inner * .14, .78, .1], true);
      const f = procFigure(p, K.procM, trousers, .28, x, z); unit.add(f); walkers.push(f);
    });
    const pal = money ? { trunk: 0xf0ece0, bloom: BANKNOTE, strip: BANKNOTE } : PADETHA[(seed - 1) % PADETHA.length];
    const pp = [], BAMBOO = 0xb8b468, TOP = 4.95;
    [-.3, .3].forEach(x => pp.push(K.rod([x, 1.42, -1.65], [x, 1.42, 1.65], .028, .028, BAMBOO, 6)));
    pp.push(K.rod([-.3, 1.42, 0], [.3, 1.42, 0], .02, .02, BAMBOO, 5), K.rod([0, 1.42, 0], [0, TOP, 0], .05, .03, pal.trunk, 6));
    // a flower of five paper petals round a bead, or a fan of four folded banknotes
    const bloom = (x, y, z, s, a) => {
      if (money) { for (let j = 0; j < 4; j++) pp.push([K.box(.12 * s, .055 * s, .004), pk(BANKNOTE), x, y, z, 0, -a + Math.PI / 2, (j - 1.5) * .38]); return; }
      const c = pk(pal.bloom); pp.push([K.ball(.03 * s), pk(pal.bloom), x, y, z]);
      for (let j = 0; j < 5; j++) { const b = j / 5 * TAU; pp.push([K.box(.08 * s, .01, .045 * s), c, x + Math.cos(b) * .05 * s, y, z - Math.sin(b) * .05 * s, 0, b, .35]); }
    };
    const N = 11;
    for (let i = 0; i < N; i++) {
      const y = 2.35 + i * (TOP - 2.6) / (N - 1), a = i * 2.4 + r() * .3, Lb = .32 + .6 * (1 - i / (N - 1)), ca = Math.cos(a), sa = Math.sin(a);
      const mid = [ca * Lb * .55, y + .12, sa * Lb * .55], tip = [ca * Lb, y + .34, sa * Lb];
      pp.push(K.rod([0, y, 0], mid, .016, .012, pal.trunk, 4), K.rod(mid, tip, .012, .008, pal.trunk, 4));
      bloom(...tip, 1.2, a); bloom(mid[0], mid[1] + .05, mid[2], .8, a);
      pp.push([K.box(.035, .2, .004), pk(pal.strip), mid[0], mid[1] - .14, mid[2], 0, -a, 0], [K.box(.035, .16, .004), pk(pal.strip), tip[0], tip[1] - .14, tip[2], 0, -a, 0]);   // paper strips hanging
    }
    if (!money) bloom(0, TOP + .06, 0, 1.6, 0);
    if (money) pp.push(K.rod([0, TOP, 0], [0, TOP + .3, 0], .014, .012, 0x8a6a30, 5));   // the umbrella's stem
    const tree = K.solid(pp, K.procM); tree.userData.seed = 1.1 + seed * .7; unit.add(tree); poles.push(tree);
    clickable(picks.pagoda, tree, money ? MONEY_INFO : KATHIN_INFO);
    if (money) {   // the white umbrella on the money tree's top, turning slowly
      const shade = kathinShade(K, .62); shade.position.set(0, TOP + .3, 0); tree.add(shade); shades.push(shade);
    }
    unit.userData = { walkers, shades, poles, squeeze: false, tall: 1.65 };   // too tall for the Haw Kham's gate
    return unit;
  }

  /* ---------- the Kathin flag that leads: a great cloth of saffron and yellow with red and purple spots, tied along the top of
     a tall bamboo pole that one man holds up, its far corner lashed to a second pole that another carries slanting beside him,
     so the cloth fills like a sail as they walk. Returns a group, front +z ---------- */
  function createKathinFlag() {
    const K = procKit(), unit = new THREE.Group(), walkers = [];
    const bearer = (x, top, hands) => {
      const skin = P_SKIN[x > 0 ? 2 : 1], p = [];
      procBody(p, { top, trousers: 0x4a3a2c, skin, long: true }); procHeadwrap(p, top); procCord(p);
      hands(p, top, skin);
      const f = procFigure(p, K.procM, 0x4a3a2c, .26, x, 0); unit.add(f); walkers.push(f);
    };
    const PX = .08, PZ = .16, C = [1.5, 4.25, .1];   // the main pole's line; the corner tied to the second pole
    bearer(0, 0xe0c890, (p, top, skin) => {   // holds the pole up, one hand high, one at the chest
      procArm(p, 1, top, skin, [.2, 1.48, .08], [PX, 1.78, PZ]); procArm(p, -1, top, skin, [-.14, 1.08, .14], [PX - .02, 1.16, PZ]);
      p.push(K.rod([PX, .35, PZ], [PX, 5.6, PZ], .022, .016, 0xb8b468, 5));
    });
    bearer(1.7, 0xf2f0ea, (p, top, skin) => {   // the second man, both hands on the slanting pole
      procArm(p, -1, top, skin, [-.18, 1.1, .1], [-.1, 1.32, .26]); procArm(p, 1, top, skin, [.18, 1.0, .1], [.04, 1.02, .22]);
      p.push(K.rod([.06, .7, .2], [C[0] - 1.7, C[1], C[2]], .016, .012, 0xb8b468, 5));
    });
    // the cloth, from the corners A (pole top) B (down the pole) C (tied) D (top right), billowing out in the middle
    const A = [PX, 5.5], B = [PX, 4.15], D = [1.3, 5.3], geo = new THREE.PlaneGeometry(1, 1, 6, 6), pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) + .5, v = pos.getY(i) + .5;
      const bx = B[0] + (C[0] - B[0]) * u, by = B[1] + (C[1] - B[1]) * u, tx = A[0] + (D[0] - A[0]) * u, ty = A[1] + (D[1] - A[1]) * u;
      pos.setXYZ(i, bx + (tx - bx) * v, by + (ty - by) * v, .32 * Math.sin(Math.PI * u) * Math.sin(Math.PI * v) + C[2] * u);
    }
    geo.computeVertexNormals();
    const tex = canvasTex(128, (c, sz) => {
      const gr = c.createLinearGradient(0, 0, sz, sz); gr.addColorStop(0, "#f2c230"); gr.addColorStop(1, "#e8861c"); c.fillStyle = gr; c.fillRect(0, 0, sz, sz);
      c.strokeStyle = "rgba(170,80,20,.35)"; c.lineWidth = 1.5; [.35, .62].forEach(k => { c.beginPath(); c.moveTo(0, sz * k); c.lineTo(sz, sz * (k - .08)); c.stroke(); });   // the seams
      const r = rng(9870); for (let i = 0; i < 34; i++) { c.fillStyle = r() < .7 ? "#c0242a" : "#6a2a6a"; c.beginPath(); c.arc(r() * sz, r() * sz, 2 + r() * 4, 0, TAU); c.fill(); }
    });
    const clothM = std({ map: tex, roughness: .85, side: THREE.DoubleSide });
    onDaylight(d => clothM.emissive.copy(lerpC(0x1c1814, 0x000000, d)));
    const cloth = new THREE.Mesh(geo, clothM); cloth.position.z = PZ; cloth.castShadow = false; unit.add(cloth);
    clickable(picks.pagoda, cloth, FLAG_INFO);
    unit.userData = { walkers, shades: [], poles: [], squeeze: false, tall: .6, step: (dt, motion, play) => { cloth.scale.z = .75 + .3 * Math.sin(play * 2.1) + .12 * Math.sin(play * 3.7 + 1); } };
    return unit;
  }

  /* ---------- what the owner's photos show besides: men in wide straw hats, white shirts and orange vests carrying the Buddhist
     flag on tall bamboo poles; strings of little flags strung between poles; a palanquin dressed in Buddhist-flag cloth; and a
     tall tower of flowers on a carrying frame. Shared pieces first ---------- */
  const KATHIN_HAT = 0xd8c08a, BUDDHIST = ["#1f4fa8", "#f5c400", "#c8202a", "#f4f0e6", "#f08a1c"];
  // the Buddhist flag: blue, yellow, red, white and orange upright, then the five again across in the sixth band
  function drawBuddhistFlag(c, x, y, w, h) {
    const bw = w / 6;
    BUDDHIST.forEach((col, i) => { c.fillStyle = col; c.fillRect(x + i * bw, y, bw + .5, h); c.fillRect(x + 5 * bw, y + i * h / 5, bw, h / 5 + .5); });
  }
  // a cloth material that darkens at night like the walkers'
  function kathinCloth(tex, both = false) {
    const m = std({ map: tex, roughness: .85, side: both ? THREE.DoubleSide : THREE.FrontSide });
    onDaylight(d => m.emissive.copy(lerpC(0x1c1814, 0x000000, d))); return m;
  }
  // a man for the poles and frames, facing +z at (x, z): Shan trousers, a shirt, a wide straw hat or a headwrap, perhaps a
  // sleeveless vest; `arms` adds his arms and whatever he holds. Returns his figure
  function kathinMan(unit, walkers, x, z, { skin, top, trousers = 0x4a3a2c, hat = true, vest = 0 }, arms) {
    const K = procKit(), p = [];
    procBody(p, { top, trousers, skin, long: true });
    if (vest) p.push([K.cyl(.172, .2, .44, 9), vest, 0, 1.1, 0], [K.box(.08, .42, .02), top, 0, 1.1, .195]);
    if (hat) p.push([K.cyl(.1, .12, .15, 9), KATHIN_HAT, 0, 1.695, 0], [K.cyl(.122, .122, .03, 9), 0x6a4a28, 0, 1.635, 0], [K.cyl(.26, .26, .014, 12), KATHIN_HAT, 0, 1.62, 0]);
    else procHeadwrap(p, top);
    arms(p, top, skin);
    const f = procFigure(p, K.procM, trousers, .26, x, z); unit.add(f); walkers.push(f); return f;
  }
  // arms holding an upright bamboo pole H high on his side s (1 right, -1 left), one hand high and one at the waist
  const holdPole = (s, H, PX = .22, PZ = .2) => (p, top, skin) => {
    procArm(p, s, top, skin, [s * (PX + .04), 1.45, PZ - .1], [s * PX, 1.75, PZ]);
    procArm(p, -s, top, skin, [-s * .05, 1.02, PZ], [s * (PX - .01), 1.1, PZ]);
    p.push(procKit().rod([s * PX, .3, PZ], [s * PX, H, PZ], .02, .015, 0xb8b468, 5));
  };
  // arms for a carrying pole on the shoulder, toward side `inner`
  const shoulderPole = inner => (p, top, skin) => {
    procArm(p, inner, top, skin, [inner * .16, 1.22, .06], [inner * .2, 1.4, .02], true);
    procArm(p, -inner, top, skin, [-inner * .22, 1.0, .04], [-inner * .14, .78, .1], true);
  };
  const SAFF_TROUSERS = 0xe8a838, SHIRTS = [0xc8dcc8, 0xf0e8d4, 0x5a3a2c, 0xe8a030, 0xf4f2ec];

  // four men two by two, each with the Buddhist flag on his pole; the first also flies a long red-and-white streamer (tagun)
  function createKathinBanners() {
    const K = procKit(), unit = new THREE.Group(), walkers = [], flags = [];
    const flagM = kathinCloth(canvasTex(64, (c, sz) => drawBuddhistFlag(c, 0, 0, sz, sz)), true);
    const geo = new THREE.PlaneGeometry(.78, .52); geo.translate(.39, -.26, 0);   // hung by its corner at the pole's top
    [[-.6, 0], [.6, 0], [-.6, -1.5], [.6, -1.5]].forEach(([x, z], i) => {
      const H = 3.6 - (i >> 1) * .2, hold = holdPole(1, H);
      const f = kathinMan(unit, walkers, x, z, { skin: P_SKIN[i % 4], top: 0xf4f2ec, trousers: i % 2 ? 0x8a7458 : 0xd89838, vest: 0xe07a20 }, (p, top, skin) => {
        hold(p, top, skin);
        if (i === 0) for (let k = 0; k < 9; k++) p.push([K.box(.11, .2, .006), k % 2 ? 0xf4f0e6 : 0xc8202a, .3, H - .62 - k * .2, .2 + k * .02, 0, 0, .06]);
      });
      const fl = new THREE.Mesh(geo, flagM); fl.position.set(.22, H - .03, .2); fl.castShadow = false; f.add(fl); flags.push(fl);
      clickable(picks.pagoda, fl, BANNER_INFO); clickable(picks.pagoda, f.userData.body, BANNER_INFO);
    });
    unit.userData = { walkers, shades: [], poles: [], squeeze: false, step: (dt, motion, play) => flags.forEach((fl, i) => { fl.rotation.y = (.25 + .2 * Math.sin(play * 1.7 + i * 1.9)) * Math.max(motion, .2); }) };
    return unit;
  }

  // four men at the corners of a square, each with a tall pole, and strings of little flags between the pole tops, along each
  // side and across the front and back, sagging
  function createKathinPennants(seed = 1) {
    const K = procKit(), unit = new THREE.Group(), walkers = [], H = 4.2, tops = [], pp = [];
    const COLS = [0x1f4fa8, 0xf5c400, 0xc8202a, 0xf4f0e6, 0xf08a1c, 0x3a9a48, 0xe86a98];
    [[-1, 1.7], [1, 1.7], [-1, -1.7], [1, -1.7]].forEach(([x, z], i) => {
      const s = x < 0 ? -1 : 1;   // the pole on his outer side
      const f = kathinMan(unit, walkers, x, z, { skin: P_SKIN[(i + seed) % 4], top: SHIRTS[(i + seed) % SHIRTS.length], trousers: SAFF_TROUSERS, hat: (i + seed) % 2 === 0 }, holdPole(s, H));
      clickable(picks.pagoda, f.userData.body, PENNANT_INFO);
      tops.push([x + s * .22, H - .05, z + .2]);
    });
    let n = seed * 3;
    const string = (a, b, sag) => {
      const L = Math.hypot(b[0] - a[0], b[2] - a[2]), m = Math.max(4, Math.round(L / .2)), ry = Math.atan2(b[2] - a[2], -(b[0] - a[0]));
      const pt = t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t];
      for (let k = 0; k < 8; k++) pp.push(K.rod(pt(k / 8), pt((k + 1) / 8), .006, .006, 0xe8e4d8, 3));
      for (let k = 1; k < m; k++) { const [x, y, z] = pt(k / m); pp.push([K.cyl(.085, .085, .004, 3), COLS[n++ % COLS.length], x, y - .043, z, Math.PI / 2, ry, 0]); }
    };
    string(tops[0], tops[2], .7); string(tops[1], tops[3], .7); string(tops[0], tops[1], .45); string(tops[2], tops[3], .45);
    const strings = K.solid(pp, K.procM); unit.add(strings); clickable(picks.pagoda, strings, PENNANT_INFO);
    unit.userData = { walkers, shades: [], poles: [], squeeze: false };
    return unit;
  }

  // a palanquin on two shoulder poles: a box hung with white lace below, cloth printed with Buddhist flags above, gold tinsel
  // round its top, a white roof with a gilt finial and two white umbrellas behind; four men in saffron trousers carry it
  function createKathinPalanquin() {
    const K = procKit(), unit = new THREE.Group(), walkers = [], shades = [];
    [[-.82, 1.5], [.82, 1.5], [-.82, -1.5], [.82, -1.5]].forEach(([x, z], i) =>
      kathinMan(unit, walkers, x, z, { skin: P_SKIN[(i + 2) % 4], top: SHIRTS[i], trousers: SAFF_TROUSERS, hat: i !== 2 }, shoulderPole(x < 0 ? 1 : -1)));
    const pp = [], BAMBOO = 0xb8b468, WHITE = 0xf4f0e6, GOLD = 0xe8c03a;
    [-.62, .62].forEach(x => pp.push(K.rod([x, 1.42, -1.95], [x, 1.42, 1.95], .03, .03, BAMBOO, 6)));
    [-.55, .55].forEach(z => pp.push(K.rod([-.62, 1.44, z], [.62, 1.44, z], .025, .025, BAMBOO, 5)));
    pp.push([K.box(1.24, .08, 1.3), 0x6a4a28, 0, 1.5, 0], [K.box(1.26, .3, 1.32), WHITE, 0, 1.69, 0]);   // the floor; the lace skirt
    for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, x = Math.max(-1, Math.min(1, Math.cos(a) * 1.5)) * .63, z = Math.max(-1, Math.min(1, Math.sin(a) * 1.5)) * .66; pp.push([K.cone(.04, .1, 4), WHITE, x, 1.5, z, Math.PI]); }   // its scalloped hem
    [[0x1f4fa8, 1.855], [WHITE, 1.88], [0xc8202a, 1.905]].forEach(([c, y]) => pp.push([K.box(1.27, .025, 1.33), c, 0, y, 0]));
    [[-.6, -.63], [.6, -.63], [-.6, .63], [.6, .63]].forEach(([x, z]) => pp.push(K.rod([x, 1.9, z], [x, 2.58, z], .025, .025, GOLD, 5)));
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, x = Math.max(-1, Math.min(1, Math.cos(a) * 1.5)) * .64, z = Math.max(-1, Math.min(1, Math.sin(a) * 1.5)) * .67; pp.push([K.ball(.055), i % 3 ? GOLD : 0xf0d060, x, 2.5, z]); }   // the tinsel
    pp.push([K.box(1.34, .06, 1.4), WHITE, 0, 2.6, 0], [K.cyl(.08, .14, .12, 8), GOLD, 0, 2.69, 0], [K.cone(.11, .45, 8), GOLD, 0, 2.97, 0], [K.ball(.035), GOLD, 0, 3.21, 0]);
    [-.4, .4].forEach(x => pp.push(K.rod([x, 2.62, -.42], [x, 3.3, -.42], .012, .012, 0x8a6a30, 5)));
    const frame = K.solid(pp, K.procM); unit.add(frame); clickable(picks.pagoda, frame, PALANQUIN_INFO);
    const tex = canvasTex(128, (c, sz) => {
      c.fillStyle = "#f2c84a"; c.fillRect(0, 0, sz, sz);
      for (let row = 0; row < 2; row++) for (let i = 0; i < 3; i++) drawBuddhistFlag(c, 7 + i * 40, 20 + row * 52, 34, 24);
      c.fillStyle = "#c8202a"; for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(i * 8, 0); c.lineTo(i * 8 + 8, 0); c.lineTo(i * 8 + 4, 9); c.fill(); c.beginPath(); c.moveTo(i * 8, sz); c.lineTo(i * 8 + 8, sz); c.lineTo(i * 8 + 4, sz - 9); c.fill(); }
    });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.22, .58, 1.28), kathinCloth(tex)); panel.position.y = 2.2; panel.castShadow = false; unit.add(panel);
    clickable(picks.pagoda, panel, PALANQUIN_INFO);
    [-.4, .4].forEach(x => { const sh = kathinShade(K, .4); sh.position.set(x, 3.3, -.42); unit.add(sh); shades.push(sh); });
    unit.userData = { walkers, shades, poles: [], squeeze: false };
    return unit;
  }

  // the tower of flowers: a white box with framed pictures on a carrying frame, and on it a tapering column of rings of red,
  // orange, pink and yellow flowers nearly ten metres high, finished with a gilt spike; eight men carry the frame
  function createKathinTower() {
    const K = procKit(), r = rng(9950), unit = new THREE.Group(), walkers = [], poles = [];
    [[-.98, .75], [.98, .75], [-.98, -.75], [.98, -.75], [-.98, 2.0], [.98, 2.0], [-.98, -2.0], [.98, -2.0]].forEach(([x, z], i) =>
      kathinMan(unit, walkers, x, z, { skin: P_SKIN[i % 4], top: SHIRTS[(i + 1) % SHIRTS.length], trousers: i % 3 ? SAFF_TROUSERS : 0x4a3a2c, hat: i % 2 === 0 }, shoulderPole(x < 0 ? 1 : -1)));
    const fp = [], BAMBOO = 0xb8b468, GOLD = 0xe8c03a;
    [-.78, .78].forEach(x => fp.push(K.rod([x, 1.42, -2.45], [x, 1.42, 2.45], .035, .035, BAMBOO, 6)));
    [-1.35, 0, 1.35].forEach(z => fp.push(K.rod([-.78, 1.44, z], [.78, 1.44, z], .03, .03, BAMBOO, 5)));
    fp.push([K.box(1.5, .1, 1.7), 0x6a4a28, 0, 1.52, 0], [K.box(1.2, 1.0, 1.2), 0xf6f4ee, 0, 2.07, 0]);
    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach(a => fp.push([K.box(.86, .7, .02), GOLD, Math.sin(a) * .605, 2.08, Math.cos(a) * .605, 0, a, 0], [K.box(.76, .6, .02), 0x9cc0dc, Math.sin(a) * .615, 2.08, Math.cos(a) * .615, 0, a, 0]));
    const frame = K.solid(fp, K.procM); unit.add(frame); clickable(picks.pagoda, frame, TOWER_INFO);
    const LOW = [0xd83a2e, 0xf08a1c, 0xf0c428, 0xe86a98, 0xc82a28], HIGH = [0xf0c428, 0xf2a020, 0xf8d848, 0xe8402e];
    const cp = [], N = 24, TOP = 6.6;
    for (let k = 0; k < N; k++) {
      const t = k / (N - 1), rad = .6 * (1 - t) + .14 * t, h = TOP / N, y = k * h + h / 2, pal = t < .55 ? LOW : HIGH, c = pal[(r() * pal.length) | 0];
      cp.push([K.cyl(rad * .95, rad, h, 10), c, 0, y, 0]);
      for (let j = 0; j < 7; j++) { const a = (j + k * .5) / 7 * TAU; cp.push([K.ball(.05 + rad * .1), pal[(j + k) % pal.length], Math.sin(a) * rad, y, Math.cos(a) * rad]); }
    }
    cp.push(K.rod([0, TOP, 0], [0, TOP + .8, 0], .03, .01, GOLD, 5), [K.ball(.05), GOLD, 0, TOP + .82, 0]);
    const column = K.solid(cp, K.procM); column.position.y = 2.57; column.userData.seed = 2.3; unit.add(column); poles.push(column);
    clickable(picks.pagoda, column, TOWER_INFO);
    unit.userData = { walkers, shades: [], poles, squeeze: false, tall: 2.45 };
    return unit;
  }

  /* ---------- the kathina robe: two elders carry the folded saffron cloth on a gilt tray, and a third walks behind them under a
     white umbrella with a gilt edge, held over the robe. Returns a group, front +z ---------- */
  function createKathinRobe() {
    const K = procKit(), unit = new THREE.Group(), walkers = [], shades = [];
    [-.42, .42].forEach((x, i) => {
      const skin = P_SKIN[(i + 1) % P_SKIN.length], jacket = i ? 0xf2f0ea : 0xf6e4a0, p = [];
      procBody(p, { top: jacket, trousers: 0x2e3446, skin, long: true }); procHeadwrap(p, jacket); procCord(p);
      [-1, 1].forEach(sd => procArm(p, sd, jacket, skin, [sd * .16, 1.04, .1], [sd * .08, 1.12, .26]));
      const f = procFigure(p, K.procM, 0x2e3446, .26, x, .1); unit.add(f); walkers.push(f);
    });
    const tp = [];
    tp.push([K.cyl(.26, .26, .03, 12), P_GOLD, 0, 1.13, .32], [K.box(.3, .055, .2), 0xd45512, 0, 1.18, .32], [K.box(.22, .035, .14), 0xe07028, 0, 1.225, .32], [K.box(.14, .02, .09), 0xf0a050, 0, 1.25, .32]);
    const tray = K.solid(tp, K.silkM); unit.add(tray); clickable(picks.pagoda, tray, KATHIN_INFO);
    const skin = P_SKIN[0], jacket = 0xf7f4ee, p = [];
    procBody(p, { top: jacket, trousers: 0x2e3446, skin, long: true }); procHeadwrap(p, 0xf2dc78); procCord(p);
    procArm(p, -1, jacket, skin, [-.06, 1.08, .12], [-.02, 1.38, .2]); procArm(p, 1, jacket, skin, [.26, 1.05, .02], [.18, .78, .08]);
    p.push(K.rod([-.02, 1.36, .18], [.02, 1.7, .95], .014, .012, 0x8a6a30, 5));   // the umbrella's shaft, leaning forward over the robe
    const holder = procFigure(p, K.procM, 0x2e3446, .26, 0, -.9); unit.add(holder); walkers.push(holder);
    const shade = kathinShade(K); shade.position.set(0, 1.78, 1.02); holder.add(shade); shades.push(shade);
    unit.userData = { walkers, shades, poles: [], squeeze: false };
    return unit;
  }

  /* ---------- one monk waiting on the porch: saffron robe to the ankle, the right shoulder bare, hands together. Feet at the
     group's origin, facing +z ---------- */
  function createKathinMonk(i) {
    const K = procKit(), skin = P_SKIN[i % P_SKIN.length], SAFF = i % 2 ? 0xd45512 : 0xc44810, p = [];
    procBody(p, { top: SAFF, skin, skirt: [SAFF, 0xb43c0c, SAFF, SAFF, SAFF, 0xb43c0c, SAFF, SAFF, SAFF, SAFF] });
    p.push([K.ball(.075), skin, -.15, 1.28, .03]);   // the right shoulder left bare
    p.push(K.rod([.14, 1.32, .02], [-.02, 1.08, .1], .06, .04, SAFF, 5));   // the robe over the left shoulder
    [-1, 1].forEach(sd => procArm(p, sd, sd < 0 ? skin : SAFF, skin, [sd * .12, 1.12, .1], [sd * .03, 1.16, .2], true));
    const f = procFigure(p, K.procM, null, 0, 0, 0);
    clickable(picks.pagoda, f.userData.body, MONK_INFO);
    return f;
  }

  /* ---------- the whole offering, and the monks on the porch. The way is out of Haw Kham round the old quarter and up the
     main stair to the second monastery; once the head arrives, each group walks to its own place in front of the stair. The monks stand all the while
     the offering is out, whether or not the procession has come into view ---------- */
  function createShanKathin(g) {
    const K = procKit(), root = new THREE.Group(); root.userData.noCull = true; root.visible = false; g.add(root);
    const [drums, gongs] = createProcessionBand(root, {
      tip: "Gongs · မွင်း",
      toast: "Five bronze bossed gongs (မွင်း) in their painted case, hung under a bamboo pole that two men carry on their shoulders at the back of the Shan Kathin. A third walks beside them and sounds all five at once, with the long drums (ၵွင်ယၢဝ်း) and the cymbals (ၸၢပ်ႈ)."
    });
    // each: the group, how far behind the head it walks, and its place at the monastery (GATHER below)
    const order = [
      [createKathinFlag(), 0, "flag", 0], [createKathinBanners(), 3.0, "banners", 0],
      [createKathinPennants(1), 7.4, "pennants", 0], [createKathinPennants(2), 12.0, "pennants", 1],
      [createKathinPadetha(1), 16.6, "tree", 0], [createKathinPadetha(2), 20.8, "tree", 1], [createKathinPadetha(3), 25.0, "tree", 2],
      [createKathinPadetha(4), 29.2, "tree", 3], [createKathinPadetha(5, true), 33.4, "money", 0],
      [createKathinTower(), 38.3, "tower", 0], [createKathinPalanquin(), 43.5, "palanquin", 0],
      [createProcessionRelatives("women", 11), 47.0, "women", 0], [createProcessionRelatives("women", 12), 48.4, "women", 1],
      [createKathinRobe(), 51.8, "robe", 0],
      [createProcessionRelatives("men", 11), 55.0, "men", 0], [createProcessionRelatives("men", 12), 56.4, "men", 1],
      [drums, 60.2, "band", 0], [gongs, 64.0, "band", 1]
    ];
    order.forEach(([u]) => { if (u.userData.squeeze === undefined) u.userData.squeeze = !u.userData.shades.length; });
    const units = order.map(([u, back]) => { u.userData.back = back; root.add(u); return u; });
    const AFTER = order.map(([, , kind, k]) => [kind, k]);
    const walkers = []; units.forEach(u => u.userData.walkers.forEach(f => {
      f.userData.unit = u; f.userData.x0 = f.position.x; walkers.push(f);
      if (f.userData.body) clickable(picks.pagoda, f.userData.body, KATHIN_INFO);   // the band's players carry their own labels
    }));
    const legs = new THREE.InstancedMesh(K.legGeo, K.procM, walkers.length * 2);
    legs.frustumCulled = false; legs.castShadow = false; root.add(legs);
    walkers.forEach((f, i) => { legs.setColorAt(i * 2, f.userData.legCol); legs.setColorAt(i * 2 + 1, f.userData.legCol); if (f.userData.lag === undefined) f.userData.lag = (i % 2) * .9 + (i % 3) * .4; });
    if (legs.instanceColor) legs.instanceColor.needsUpdate = true;

    // from the Haw Kham's courtyard behind the palace (hawKham(g, 16, 204, π): its back at z 202, the town gate at z 166, its
    // beam 4.3 m up), down the paved walk and out of the town gate, east along the palace lane, down the market lane, west along the front street to the main
    // stair, up it to the lower terrace and along the footpath to the second monastery
    const H = HILL.group; H.updateMatrix();
    const t1 = HILL.terraces[1], PR = t1.r1 - 3.6;
    const onHill = a => { const v = V(Math.sin(a) * PR, 0, -Math.cos(a) * PR).applyMatrix4(H.matrix); return [v.x, v.z]; };
    const laneZ = (LANES[4].z0 + LANES[4].z1) / 2, mx = (LANES[2].x0 + LANES[2].x1) / 2;
    const { foot, mouth, crossX } = HILL.approach, landing = onHill(0), aEnd = Math.asin(6 / PR);   // the path and zebra crossing the hill laid
    const HAW = { x: 16, back: 198, gate: 166 };
    const W = [[HAW.x, HAW.back], [HAW.x, laneZ], [mx, laneZ], [mx, 54], [crossX, 54], mouth, foot, landing];
    const nArc = Math.max(2, Math.ceil(aEnd * PR / 3));
    for (let i = 1; i <= nArc; i++) W.push(onHill(aEnd * i / nArc));
    const line = P => {
      const c = [0]; for (let i = 1; i < P.length; i++) c.push(c[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
      const len = c[c.length - 1];
      return { P, cum: c, len, at(s, o) { s = Math.min(len, Math.max(0, s)); let i = 1; while (i < c.length - 1 && c[i] < s) i++; const u = (s - c[i - 1]) / (c[i] - c[i - 1] || 1); o[0] = P[i - 1][0] + (P[i][0] - P[i - 1][0]) * u; o[1] = P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u; return o; } };
    };
    const WAY = line(W), cum = WAY.cum, L = WAY.len, out = [0, 0], at = s => WAY.at(s, out);
    // at noon the front of the line, from the flag to the last piece too tall for the gate (`tall`, how far it reaches behind
    // its centre), stands ready on the palace lane, the tower's back just clear of the gate's walk; the palanquin and those
    // behind it come down the courtyard and out through the gate. Any still behind the palace's back stay hidden until their
    // turn
    const sOf = k => cum[k], sHill = sOf(5);
    const S0 = sOf(1) + 1 + Math.max(...units.map(u => u.userData.tall === undefined ? 0 : u.userData.back + u.userData.tall));
    const toW = (x, z) => { const v = V(x, 0, z).applyMatrix4(H.matrix); return [v.x, v.z]; };
    const fa = (() => { const [ax, az] = toW(0, 0), [bx, bz] = toW(0, 1); return Math.atan2(bx - ax, bz - az); })();
    // where each stands once they have arrived, in the hill's frame, on the paved terrace in front of the monastery (its front at
    // z -59.6, from x 6.5 to 30.5): the robe at the foot of its stair with the money tree behind it, two trees either side, the
    // flag at the front on the left, the palanquin, the strings of flags, the tower and the Buddhist flags along the front to
    // the right, the people behind the trees and the band behind the strings of flags
    const GATHER = {
      flag: [[3.0, -62.8]], robe: [[9, -63.3]], money: [[9, -66.6]],
      tree: [[1.6, -65.4], [5.3, -65.4], [12.7, -66.0], [16.4, -66.0]],
      palanquin: [[13.6, -62.0]], pennants: [[17.8, -62.0], [21.6, -62.0]], tower: [[25.4, -62.0]], banners: [[29.0, -60.6]],
      women: [[5.6, -68.3], [12.4, -68.6]], men: [[6.4, -69.0], [11.6, -69.0]], band: [[19.4, -66.0], [22.8, -65.6]]
    };
    const afterWay = (back, kind, k) => {
      const s0 = L - back, P = [at(s0).slice()], tgt = toW(...GATHER[kind][k]);
      let best = s0, bd = Infinity;
      for (let s = s0; s <= L; s += .5) { const [x, z] = at(s), d = Math.hypot(x - tgt[0], z - tgt[1]); if (d < bd) { bd = d; best = s; } }
      for (let i = 1; i < W.length; i++) if (cum[i] > s0 && cum[i] < best) P.push(W[i]);
      P.push(at(best).slice(), tgt);
      return { way: line(P), face: fa };
    };
    units.forEach((u, i) => Object.assign(u.userData, afterWay(u.userData.back, ...AFTER[i])));
    const arrive = (L - S0) / KATHIN.speed;
    // with ?kathin=1, one round: the walk, the band at the back finding its place, then the standing
    const testRound = arrive + Math.max(...units.map(u => u.userData.way.len)) / KATHIN.speed + KATHIN.test.gather;

    // five monks on the porch, above the stair (the porch floor is 2.6 m up; the roof begins 2.9 m above that)
    const monks = new THREE.Group(); monks.userData.noCull = true; monks.visible = false; g.add(monks);
    const FH = 2.6, monkSpot = [0, 0];
    [8.0, 8.8, 9.6, 10.4, 11.2].forEach((lx, i) => {
      const f = createKathinMonk(i), p = V(18.5 - lx, t1.y + FH + .02, -55 - 2.6).applyMatrix4(H.matrix);
      f.position.copy(p); f.rotation.y = fa + Math.PI; monks.add(f);
      if (i === 2) { monkSpot[0] = p.x; monkSpot[1] = p.z; }
    });

    const zero = new THREE.Matrix4().makeScale(0, 0, 0), hip = new THREE.Matrix4(), rot = new THREE.Matrix4(), m = new THREE.Matrix4();
    let testT = 0, play = 0;
    const p0 = [0, 0], p1 = [0, 0], p2 = [0, 0];
    updaters.pagoda.push((dt, t, motion) => {
      if (!FOLK.kathin) { if (root.visible) root.visible = false; if (monks.visible) monks.visible = false; testT = 0; return; }
      dt = Math.min(dt, .1);
      const eye = FEST.eye;
      const nearMonks = !eye || Math.hypot(eye.x - monkSpot[0], eye.z - monkSpot[1]) < KATHIN.far;
      if (monks.visible !== nearMonks) monks.visible = nearMonks;
      let head, since, walked;
      if (FOLK.kathinAt === null) {
        testT = (testT + dt) % testRound;
        head = Math.min(L, S0 + testT * KATHIN.speed); since = testT - arrive; walked = since > 0 ? since * KATHIN.speed : 0;
      } else {
        head = Math.min(L, S0 + Math.max(0, FOLK.kathinAt) * KATHIN.speed);
        since = FOLK.kathinAt - arrive; walked = since > 0 ? since * KATHIN.speed : 0;
      }
      const [hx, hz] = at(head), show = !eye || Math.hypot(eye.x - hx, eye.z - hz) < KATHIN.far;
      if (root.visible !== show) root.visible = show;
      if (!show) return;
      play += dt * motion;
      units.forEach(u => {
        const ud = u.userData, s = head - ud.back + Math.min(walked, ud.way.len), out = s >= 0;
        if (u.visible !== out) u.visible = out;
        if (!out) return;
        let x, z, ry;
        if (since > 0) {
          const e = Math.min(walked, ud.way.len), [ax, az] = ud.way.at(e - 1.2, p0), [bx, bz] = ud.way.at(Math.max(e + 1.2, 2.4), p1);
          [x, z] = ud.way.at(e, p2); ry = e >= ud.way.len ? ud.face : Math.atan2(bx - ax, bz - az);
        } else { const [ax, az] = at(s - 1.2), [bx, bz] = at(s + 1.2); [x, z] = at(s); ry = Math.atan2(bx - ax, bz - az); }
        const w = walkAt(x, z);
        u.position.set(x, w === null ? terrainAt(x, z) : w, z); u.rotation.y = ry;
        const sq = ud.squeeze ? 1 - .4 * Math.min(1, Math.max(0, (s - sHill + 6) / 6)) : 1;
        ud.walkers.forEach(f => {
          const d = f.userData, ph = (s / KATHIN.stride) * TAU + d.lag;
          f.position.x = d.x0 * sq;
          f.position.y = d.body ? Math.abs(Math.cos(ph)) * .035 * motion : 0; f.rotation.z = d.body ? Math.sin(ph) * .025 * motion : 0;
          d.phase = ph;
        });
        if (ud.step) ud.step(dt, motion, play);
        ud.shades.forEach(sh => { sh.rotation.y += dt * .4 * motion; });
        ud.poles.forEach(p => { const q = p.userData.seed; p.rotation.z = Math.sin(t * 1.1 + q) * .04 * motion; p.rotation.x = Math.sin(t * .8 + q * 1.7) * .025 * motion; });
        u.updateMatrix();
      });
      walkers.forEach((f, i) => {
        const d = f.userData; f.updateMatrix();
        if (!d.legs || !d.unit.visible) { legs.setMatrixAt(i * 2, zero); legs.setMatrixAt(i * 2 + 1, zero); return; }
        for (let k = 0; k < 2; k++) {   // a plain loop: no closure per walker per frame
          const sd = k * 2 - 1;
          rot.makeRotationX(sd * Math.sin(d.phase) * d.swing * Math.max(motion, .3)); hip.makeTranslation(sd * .1, .82, 0).multiply(rot);
          m.multiplyMatrices(d.unit.matrix, f.matrix).multiply(hip); legs.setMatrixAt(i * 2 + k, m);
        }
      });
      legs.instanceMatrix.needsUpdate = true;
    });
    return root;
  }
