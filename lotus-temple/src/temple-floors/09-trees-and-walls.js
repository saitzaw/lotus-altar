  // trees: a trunk under a few clumps of low-poly foliage
  const bark = std({ color: 0x4a3426, roughness: .9 });
  const leafMats = [0x2f5a26, 0x3a6b2c, 0x264d22, 0x46773a].map(c => std({ color: c, roughness: .9, flatShading: true }));
  function tree(g, x, z, s = 1, seed = 1) {
    const r = rng(seed), t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); t.rotation.y = r() * TAU; g.add(t);
    sCircle(t, 0, 0, .22);
    mesh(new THREE.CylinderGeometry(.13, .22, 2.4, 8), bark, 0, 1.2, 0, t);
    for (let i = 0; i < 6; i++) {
      const a = r() * TAU, d = i ? .5 + r() * .5 : 0;
      mesh(new THREE.IcosahedronGeometry(.8 + r() * .6, 0), leafMats[(i + seed) % 4], Math.cos(a) * d, 2.7 + r() * 1.0 + (i ? 0 : .5), Math.sin(a) * d, t);
    }
    return t;
  }
  // 銀杏, the ginkgo of temple courtyards: a straight grey trunk under a tall crown of golden fan-shaped leaves,
  // with fallen leaves scattered round its foot
  const ginkgoMats = [0xe0a81a, 0xd4901a, 0xeec030, 0xc88a14].map(c => std({ color: c, roughness: .75, flatShading: true, emissive: c, emissiveIntensity: .04 }));
  const ginkgoBark = std({ color: 0x5e5248, roughness: .9 }), fallenMat = std({ color: 0xe8b52a, roughness: .9, transparent: true, opacity: .8 });
  function ginkgo(g, x, z, s = 1, seed = 1) {
    const r = rng(seed * 31), t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); t.rotation.y = r() * TAU; g.add(t);
    sCircle(t, 0, 0, .3);
    mesh(new THREE.CylinderGeometry(.16, .3, 4.2, 9), ginkgoBark, 0, 2.1, 0, t);
    for (let i = 0; i < 4; i++) { const a = r() * TAU, br = mesh(new THREE.CylinderGeometry(.04, .08, 1.4, 6), ginkgoBark, Math.cos(a) * .35, 2.6 + i * .6, Math.sin(a) * .35, t); br.rotation.set(Math.sin(a) * .7, 0, -Math.cos(a) * .7); }
    for (let i = 0; i < 22; i++) {   // a rounded crown of many small clumps, broad below and narrowing toward the top
      const h = Math.sqrt(r()), y = 2.8 + h * 3.6, w = (1 - h * .65) * 1.7, a = r() * TAU, d = (.4 + .6 * r()) * w;
      const c = mesh(new THREE.IcosahedronGeometry(.55 + r() * .35 - h * .15, 1), ginkgoMats[(i + seed) % 4], Math.cos(a) * d, y, Math.sin(a) * d, t);
      c.scale.y = .8; c.rotation.set(r() * 3, r() * 3, 0);
    }
    const fallen = flat(mesh(new THREE.CircleGeometry(2.2, 20), fallenMat, 0, .03, 0, t)); fallen.rotation.x = -Math.PI / 2;
    return t;
  }
  // 松, a tall hill pine like the old firs of the Shan uplands: a long straight grey trunk on a flare of roots, bare for nearly
  // half its height but for the stubs of dead twigs, then open whorls of near-level branches with gaps between them, each
  // carrying flat drooping sprays of needles, so the trunk shows right up through the crown to a thin leader at the top
  const pineBark = std({ color: 0x6e6862, roughness: .95 }), pineMats = [0x1a3d24, 0x214a2b, 0x2a5634].map(c => std({ color: c, roughness: .9, flatShading: true }));
  const pineTrunkGeo = new THREE.CylinderGeometry(.045, .24, 1, 7), pineBranchGeo = new THREE.CylinderGeometry(.02, .05, 1, 5), pineCoreGeo = new THREE.ConeGeometry(1, 1, 6);
  const pineSprayGeo = (() => {   // a spray of needles: a flat ragged diamond reaching from x = 0 out to x = 1, sagging toward its tip
    const geo = new THREE.OctahedronGeometry(.5, 0); geo.scale(1, .08, .4); geo.translate(.5, 0, 0);
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) - .3 * p.getX(i) * p.getX(i));
    geo.computeVertexNormals(); return geo;
  })();
  // a branch out from the trunk at height y, angle a, reaching len, with its sprays along the outer part
  function pineBranch(t, r, y, a, len, droop, mi) {
    const c = Math.cos(a), s = Math.sin(a), br = part(pineBranchGeo, pineBark, c * len / 2, y - Math.sin(droop) * len / 2, s * len / 2, t);
    br.rotation.order = "YZX"; br.rotation.set(0, -a, Math.PI / 2 - droop); br.scale.y = len;
    const n = 2 + Math.round(len * 2.2);
    for (let i = 0; i < n; i++) {   // small sprays off both sides along the branch, hanging lower further out, and one at its tip
      const tip = i === n - 1, d = len * (tip ? .55 : .15 + .7 * i / n), aa = a + (tip ? 0 : (i % 2 ? 1 : -1) * (.45 + r() * .4));
      const sp = part(pineSprayGeo, pineMats[(mi + i) % 3], c * d, y - Math.sin(droop) * d + (r() - .6) * .1, s * d, t);
      sp.rotation.order = "YZX"; sp.rotation.set(0, -aa, -(droop * .6 + .02 + r() * .14)); sp.scale.setScalar(tip ? len * .65 + .3 : (len - d) * .8 + .4);
    }
  }
  function pine(g, x, z, s = 1, seed = 1) {
    const r = rng(seed * 17), t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); t.rotation.y = r() * TAU; g.add(t);
    sCircle(t, 0, 0, .3);
    const H = 10 + r() * 1.6, y0 = H * (.38 + r() * .06), m = seed % 3;
    const trunk = part(pineTrunkGeo, pineBark, 0, H * .48, 0, t); trunk.scale.y = H * .96;
    for (let i = 0; i < 5; i++) {   // the roots spreading over the ground
      const a = i / 5 * TAU + r() * .6, rt = part(pineBranchGeo, pineBark, Math.cos(a) * .36, .06, Math.sin(a) * .36, t);
      rt.rotation.order = "YZX"; rt.rotation.set(0, -a, Math.PI / 2 - .25); rt.scale.set(2.4, .8, 2.4);
    }
    for (let i = 0; i < 9; i++) {   // stubs of dead twigs up the bare trunk
      const a = r() * TAU, y = 1.2 + r() * (y0 - 1.4), tw = part(pineBranchGeo, pineBark, Math.cos(a) * .32, y, Math.sin(a) * .32, t);
      tw.rotation.order = "YZX"; tw.rotation.set(0, -a, Math.PI / 2 + .2); tw.scale.set(.5, .4 + r() * .4, .5);
    }
    // open whorls of branches, a gap of trunk between each, long below and short toward the top
    let y = y0;
    for (let k = 0; y < H - .9; k++) {
      const f = (y - y0) / (H - y0), env = 1.8 * Math.pow(1 - f, .8) + .3, n = 2 + (r() * 2.4 | 0);
      for (let j = 0; j < n; j++) {
        const a = j / n * TAU + r() * 1.2 + k * 1.3, len = env * (.6 + r() * .45);
        pineBranch(t, r, y + (r() - .5) * .25, a, len, .05 + .18 * (1 - f) + r() * .08, m + j + k);
      }
      y += (.9 + r() * .6) * (1 - f * .5);
    }
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + r(); pineBranch(t, r, H - .7 + i * .12, a, .45 - i * .06, .1, m + i); }   // the small top tuft
    const top = part(pineCoreGeo, pineMats[m], 0, H + .15, 0, t); top.scale.set(.1, .9, .1);   // the leader
    return t;
  }
  // a temple wall run between two points, red with a painted band and a tiled coping
  function templeWall(g, ax, az, bx, bz) {
    const len = Math.hypot(bx - ax, bz - az), w = new THREE.Group(), WH = 3.2;
    w.position.set((ax + bx) / 2, 0, (az + bz) / 2); w.rotation.y = -Math.atan2(bz - az, bx - ax); g.add(w);
    mesh(new THREE.BoxGeometry(len, .5, .7), M.stone, 0, .25, 0, w);
    mesh(new THREE.BoxGeometry(len, WH, .5), pillarRed, 0, WH / 2, 0, w);
    mesh(new THREE.BoxGeometry(len, .2, .62), beamMat, 0, WH - .2, 0, w);
    [-1, 1].forEach(f => { const c = mesh(new THREE.BoxGeometry(len + .2, .08, .62), roofMat, 0, WH + .18, f * .26, w); c.rotation.x = f * .5; });
    [-1, 1].forEach(f => mesh(new THREE.BoxGeometry(len + .2, .1, .04), eaveRed, 0, WH + .05, f * .55, w));
    mesh(new THREE.BoxGeometry(len + .2, .14, .16), ridgeMat, 0, WH + .34, 0, w);
  }
  // the compound walls, trees in the grounds and behind them, and the street outside the gate with its pavements, lamps and trees
  function templeGrounds(g) {
    const FZ = 43, BZ = -16, SX = 33;
    [-1, 1].forEach(sd => templeWall(g, sd * SX, FZ, sd * SX, BZ));
    templeWall(g, -SX, BZ, -2.9, BZ); templeWall(g, 2.9, BZ, SX, BZ);   // the back gate stands in the gap
    BLOCK.segs.push([-SX, FZ, -SX, BZ], [SX, FZ, SX, BZ], [-SX, BZ, -3.2, BZ], [3.2, BZ, SX, BZ], [-33, 43, -5.2, 43], [5.2, 43, 33, 43]);
    let seed = 3;
    [[-26, 8], [-31, 15], [-24, 40.5], [-13, 38.5], [-30.5, 40], [-12, -10], [10, -12], [-24, -10], [30.5, -13], [30, 8], [13, 39], [27, 41], [-6, -13], [6, -13]]
      .forEach(([x, z]) => ginkgo(g, x, z, .85 + ((seed * 7) % 5) * .06, seed++));   // golden ginkgos inside the walls
    // outside the walls: pines and common trees along the back. The east side has the food street (foodStreet), the west side
    // the town road (see shanTown); the seven places where the east row's trees stood are kept so the back row grows as before
    const outside = [];
    for (let z = -12; z <= 40; z += 8) outside.push(null);
    for (let x = -36; x <= 36; x += 8) if (Math.abs(x) > 6 && x > -34) outside.push([x, -20.5 - ((x / 8) % 2) * 1.5]);   // the approach to the back gate stays clear
    outside.forEach((p, i) => p ? (i % 3 === 1 ? tree : pine)(g, p[0], p[1], .9 + (i % 4) * .08, seed++) : seed++);
    // the street: a stone-paved road between kerbed pavements
    const road = std({ color: 0x2e2b28, roughness: .95 }), pave = std({ color: 0x6a645c, roughness: .9 }), kerb = std({ color: 0x8a847a, roughness: .8 });
    const EX = EAST_ROAD.x1;   // the street's east end: the far edge of the east road, which leaves it northward past the police station (eastRoad)
    flat(mesh(new THREE.BoxGeometry(EX + 128, .04, 8), road, (EX - 128) / 2, .02, 54, g));   // from the corner at x = -128, past the hut village's lane and the fire and police stations, to the east road
    // at its west end the street turns north and runs up beside the hut village to the hospital's forecourt
    const HX = -124.75;
    flat(mesh(new THREE.BoxGeometry(6.5, .04, 57.3), road, HX, .02, 21.35, g));
    [-1, 1].forEach(sd => flat(mesh(new THREE.BoxGeometry(1.2, .03, 57.3 + (sd < 0 ? 8.7 : 0)), std({ color: 0x8a7a5e, roughness: 1 }), HX + sd * 3.85, .015, 21.35 + (sd < 0 ? 4.35 : 0), g)));   // dirt verges
    // the north pavement stops either side of the town road, so the two roads meet in a proper junction
    // (and at the mouths of the west lane and the hut village's lane)
    // the south one runs on past the east road's mouth to the corner, the north one stops at the east road
    const gaps = [[-128, HX + 3.25], [-98.5, -95.5], [LANES[3].x0, LANES[3].x1], [TOWN.roadX - TOWN.roadW / 2, TOWN.roadX + TOWN.roadW / 2], [EX + 1.5, EX + 1.5]];
    [[48.75, 2.5, true], [59.4, 2.8, false]].forEach(([z, d, cut]) => {
      const runs = cut ? gaps.slice(1).map((gp, i) => [gaps[i][1], gp[0]]) : [[-128, EAST_ROAD.x0]];
      runs.forEach(([x0, x1]) => {
        mesh(new THREE.BoxGeometry(x1 - x0, .18, d), pave, (x0 + x1) / 2, .09, z, g);
        [-1, 1].forEach(e => mesh(new THREE.BoxGeometry(x1 - x0, .2, .14), kerb, (x0 + x1) / 2, .1, z + e * d / 2, g));
      });
      if (cut) gaps.slice(1, -1).flat().forEach(x => mesh(new THREE.BoxGeometry(.14, .2, d), kerb, x, .1, z, g));   // kerbs turning the corners
      mesh(new THREE.BoxGeometry(.14, .2, d), kerb, runs[runs.length - 1][1], .1, z, g);   // and closing the end at the east road
    });
    // asphalt across the old pavement line, joining the town road to the street, with a give-way line
    flat(mesh(new THREE.BoxGeometry(TOWN.roadW, .04, 50 - TOWN.z1 + .2), std({ color: 0x2c2c2e, roughness: .95 }), TOWN.roadX, .02, (TOWN.z1 + 50) / 2, g));
    flat(mesh(new THREE.BoxGeometry(TOWN.roadW / 2 - .2, .02, .25), std({ color: 0xe8e4d8, roughness: .8 }), TOWN.roadX + TOWN.roadW / 4, .05, 49.6, g));
    const dash = new THREE.InstancedMesh(new THREE.BoxGeometry(2.4, .02, .14), std({ color: 0xbdb6a8, roughness: .8 }), 55), m4 = new THREE.Matrix4();
    for (let i = 0; i < 46; i++) dash.setMatrixAt(i, m4.makeTranslation(-119 + i * 6, .05, 54));   // up to the east road's mouth
    for (let i = 0; i < 9; i++) dash.setMatrixAt(46 + i, m4.makeRotationY(Math.PI / 2).setPosition(HX, .05, 46 - i * 6));   // and up the road to the hospital
    g.add(dash);
    // street lights the whole length of the street, standing at the kerb with their arms out over the road, on alternate
    // sides every 10 m; near the gate the other side gets a street tree instead. None at the gate, in a junction or lane
    // mouth, at the corner where the hill stair comes down, or across the fire and police stations' aprons
    for (let x = -120; x <= 140; x += 10) {
      if (Math.abs(x) < 7) continue;
      [[49.4, Math.PI / 2], [58.6, -Math.PI / 2]].forEach(([z, ry], side) => {
        if (side === 0 && (gaps.some(([a, b]) => x > a - 1.5 && x < b + 1.5) || (x > 103 && x < 142))) return;
        if (side === 1 && Math.abs(x + 45) < 4) return;
        if (LANES.some(l => l.mouth && (l.z0 > 55) === !!side && x > l.x0 - 1.5 && x < l.x1 + 1.5)) return;   // and the back lanes
        if ((x / 10 + side) % 2 === 0) streetLight(g, x, z, ry);
        else if (Math.abs(x) <= 60) (((x / 10) | 0) % 4 === 1 || ((x / 10) | 0) % 4 === -3 ? tree : pine)(g, x, (side ? 59.9 : 48.2), .85, seed++);
      });
    }
  }
