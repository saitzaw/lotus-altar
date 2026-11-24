  /* ---------- Shan Kathin (ပွႆးၵထိၼ်, Burmese ကထိန်ပွဲ), the offering of robes after the rains retreat. Through the lunar month
     after the full moon of Thadingyut, until the full moon of Tazaungmon (CONFIG.kathin, ?kathin=1/0), the town carries one new
     set of monastic robes to the second monastery. They leave Haw Kham's town gate at noon and go round the old quarter, the
     wooden streets between the palace and the temple, with no dance stops, and reach the monastery about ten minutes
     later; the robe is offered at the foot of its stair and five
     monks who kept the retreat wait on the porch to receive it. Everyone has gone home by 2. Called off while it rains.
     Streamer poles lead, then the padetha tree (ပဒေသာပင်) on two shoulder poles, women with offering bowls, the robe itself
     under a white umbrella, the donors, and the Shan band at the back. The Shan name is ours, for a speaker to check ---------- */
  const KATHIN = {
    speed: .45,     // metres a second, the same easy walk as the Poy Sang Long
    stride: 1.3,
    far: 170,       // hidden when the walker is farther than this from the head, or from the monks
    test: { gather: 48 }   // with ?kathin=1: the same easy walk, then once all are in place they stand this long and it starts again from Haw Kham
  };
  const KATHIN_INFO = {
    tip: "Shan Kathin · ပွႆးၵထိၼ် · ကထိန်ပွဲ",
    toast: "The Shan Kathin, the offering of robes after the rains retreat. In the month after the full moon of Thadingyut (သီတင်းကျွတ်), through the full moon of Tazaungdaing (တန်ဆောင်တိုင်), the town carries one new set of monastic robes to the monastery. A padetha tree (ပဒေသာပင်) goes with them, hung with cloth, fruit and slips of gold paper for the gifts, and the robe itself is carried under a white umbrella. Five monks who kept the retreat receive it on the porch. A monastery may receive the kathina only once in that month."
  };
  const MONK_INFO = {
    tip: "The monks receiving the robe",
    toast: "Five monks who kept the rains retreat wait on the monastery's porch. The town offers them one new set of robes, the kathina, and they receive it here. A monastery may receive the kathina only once in this month."
  };

  /* ---------- the padetha tree: four men carry two bamboo shoulder poles, and between the poles stands a small tree hung with
     folded cloth, fruit and slips of gold paper, with a length of saffron robe draped on its front. Returns a group, front +z ---------- */
  function createKathinPadetha(seed = 1) {
    const K = procKit(), r = rng(9800 + seed), pk = l => l[(r() * l.length) | 0];
    const unit = new THREE.Group(), walkers = [], poles = [];
    [[-.52, 1.15], [.52, 1.15], [-.52, -1.15], [.52, -1.15]].forEach(([x, z]) => {
      const skin = pk(P_SKIN), top = pk([0xf2f0ea, 0xf2dc78, 0xf2b0c0, 0xa8d0ec]), trousers = pk([0x2e3446, 0x4a3a2c]), p = [];
      procBody(p, { top, trousers, skin, long: true }); procHeadwrap(p, top); procCord(p);
      const inner = x < 0 ? 1 : -1;   // the hand toward the pole, between the carriers
      procArm(p, inner, top, skin, [inner * .16, 1.22, .06], [inner * .12, 1.4, .02], true);
      procArm(p, -inner, top, skin, [-inner * .22, 1.0, .04], [-inner * .14, .78, .1], true);
      const f = procFigure(p, K.procM, trousers, .28, x, z); unit.add(f); walkers.push(f);
    });
    const pp = [], BAMBOO = 0xb8b468, WOOD = 0x6a4a28, SAFF = 0xd45512, WHITE = 0xf4f0e6, GOLD = 0xe8c85a;
    [-.3, .3].forEach(x => pp.push(K.rod([x, 1.42, -1.65], [x, 1.42, 1.65], .028, .028, BAMBOO, 6)));
    pp.push(K.rod([-.3, 1.42, 0], [.3, 1.42, 0], .02, .02, BAMBOO, 5), K.rod([0, 1.42, 0], [0, 3.3, 0], .045, .028, WOOD, 6));
    [[1.85, .5, .1], [2.15, -.48, .15], [2.45, .28, -.32], [2.75, -.42, -.08], [3.05, .22, .18]].forEach(([y, x, z]) => pp.push(K.rod([0, y, 0], [x, y + .12, z], .016, .01, WOOD, 4)));
    [[1.75, .42, .16], [1.95, -.4, .18], [2.15, .22, -.28], [2.35, -.36, -.12], [2.55, .46, .06], [2.7, -.18, .22], [2.85, .12, -.22], [3.0, -.32, .12], [3.12, .26, .08]].forEach(([y, x, z], i) => {
      const kind = i % 4;
      if (kind === 0) pp.push([K.box(.12, .08, .08), WHITE, x, y - .12, z]);
      else if (kind === 1) pp.push([K.box(.1, .045, .07), SAFF, x, y - .1, z]);
      else if (kind === 2) pp.push([K.box(.07, .12, .008), GOLD, x, y - .14, z, (r() - .5) * .4, r(), .15]);
      else pp.push([K.cyl(.03, .035, .14, 5), 0xe0b030, x, y - .12, z, .5, 0, .7]);
      pp.push(K.rod([x * .2, y + .02, z * .2], [x, y - .02, z], .004, .004, 0xe8e4d8, 3));
    });
    pp.push([K.ball(.08), 0x2f6a38, .12, 2.05, .22]);   // a coconut
    pp.push([K.box(.36, .5, .025), SAFF, 0, 1.82, .26], [K.box(.22, .06, .03), 0xc44810, 0, 2.08, .28]);   // a length of the saffron robe on the front
    const tree = K.solid(pp, K.procM); tree.userData.seed = 1.1; unit.add(tree); poles.push(tree);
    clickable(picks.pagoda, tree, KATHIN_INFO);
    unit.userData = { walkers, shades: [], poles, squeeze: false };
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
    const sp = [], WHITE = 0xf7f4ee, GILT = 0xe8b02e;
    sp.push([K.cone(.58, .2, 12, true), WHITE, 0, 0, 0], [new THREE.CylinderGeometry(.58, .58, .045, 12, 1, true), GILT, 0, -.11, 0], [K.cone(.24, .12, 10, true), GILT, 0, .14, 0], [K.ball(.035), GILT, 0, .24, 0]);
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; sp.push([K.cone(.018, .09, 4), i % 2 ? GILT : 0xd45512, Math.sin(a) * .58, -.18, Math.cos(a) * .58, Math.PI]); }
    const shade = K.solid(sp, K.shadeM); shade.position.set(0, 1.78, 1.02); holder.add(shade); shades.push(shade);
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
    const order = [
      [createStreamerPoles(["pole", "parasol", "pole"], 11), 0], [createStreamerPoles(["pole", "pole"], 12), 2.4],
      [createKathinPadetha(1), 6.2],
      [createProcessionRelatives("women", 11), 10.4], [createProcessionRelatives("women", 12), 11.8],
      [createKathinRobe(), 15.2],
      [createProcessionRelatives("men", 11), 18.4], [createProcessionRelatives("men", 12), 19.8],
      [drums, 23.6], [gongs, 27.4]
    ];
    order.forEach(([u]) => { if (u.userData.squeeze === undefined) u.userData.squeeze = !u.userData.shades.length; });
    const units = order.map(([u, back]) => { u.userData.back = back; root.add(u); return u; });
    const AFTER = [["stream", 0], ["stream", 1], ["tree", 0], ["women", 0], ["women", 1], ["robe", 0], ["men", 0], ["men", 1], ["band", 0], ["band", 1]];
    const walkers = []; units.forEach(u => u.userData.walkers.forEach(f => {
      f.userData.unit = u; f.userData.x0 = f.position.x; walkers.push(f);
      if (f.userData.body) clickable(picks.pagoda, f.userData.body, KATHIN_INFO);   // the band's players carry their own labels
    }));
    const legs = new THREE.InstancedMesh(K.legGeo, K.procM, walkers.length * 2);
    legs.frustumCulled = false; legs.castShadow = false; root.add(legs);
    walkers.forEach((f, i) => { legs.setColorAt(i * 2, f.userData.legCol); legs.setColorAt(i * 2 + 1, f.userData.legCol); if (f.userData.lag === undefined) f.userData.lag = (i % 2) * .9 + (i % 3) * .4; });
    if (legs.instanceColor) legs.instanceColor.needsUpdate = true;

    // out of Haw Kham's town gate, east along the palace lane, down the market lane, west along the front street to the main
    // stair, up it to the lower terrace and along the footpath to the second monastery
    const H = HILL.group; H.updateMatrix();
    const t1 = HILL.terraces[1], PR = t1.r1 - 3.6;
    const onHill = a => { const v = V(Math.sin(a) * PR, 0, -Math.cos(a) * PR).applyMatrix4(H.matrix); return [v.x, v.z]; };
    const laneZ = (LANES[4].z0 + LANES[4].z1) / 2, mx = (LANES[2].x0 + LANES[2].x1) / 2;
    const { foot, mouth, crossX } = HILL.approach, landing = onHill(0), aEnd = Math.asin(6 / PR);   // the path and zebra crossing the hill laid
    const W = [[-12, laneZ], [16, laneZ], [mx, laneZ], [mx, 54], [crossX, 54], mouth, foot, landing];
    const nArc = Math.max(2, Math.ceil(aEnd * PR / 3));
    for (let i = 1; i <= nArc; i++) W.push(onHill(aEnd * i / nArc));
    const line = P => {
      const c = [0]; for (let i = 1; i < P.length; i++) c.push(c[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
      const len = c[c.length - 1];
      return { P, cum: c, len, at(s, o) { s = Math.min(len, Math.max(0, s)); let i = 1; while (i < c.length - 1 && c[i] < s) i++; const u = (s - c[i - 1]) / (c[i] - c[i - 1] || 1); o[0] = P[i - 1][0] + (P[i][0] - P[i - 1][0]) * u; o[1] = P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u; return o; } };
    };
    const WAY = line(W), cum = WAY.cum, L = WAY.len, out = [0, 0], at = s => WAY.at(s, out);
    const sOf = k => cum[k], S0 = sOf(1), sHill = sOf(5);
    const toW = (x, z) => { const v = V(x, 0, z).applyMatrix4(H.matrix); return [v.x, v.z]; };
    const fa = (() => { const [ax, az] = toW(0, 0), [bx, bz] = toW(0, 1); return Math.atan2(bx - ax, bz - az); })();
    // where each stands once they have arrived, in the hill's frame: the robe at the foot of the stair, the tree just down the terrace
    const GATHER = {
      stream: [[5.2, -66.2], [12.8, -66.2]], tree: [[9, -65.2]],
      women: [[5.6, -67.4], [12.4, -67.4]], robe: [[9, -63.5]],
      men: [[6.4, -68.6], [11.6, -68.4]], band: [[15.2, -66.4], [17.4, -67.6]]
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
        const ud = u.userData, s = head - ud.back + Math.min(walked, ud.way.len);
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
        if (!d.legs) { legs.setMatrixAt(i * 2, zero); legs.setMatrixAt(i * 2 + 1, zero); return; }
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
