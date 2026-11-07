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
  // 松, a pine with a leaning red-brown trunk and flat cloud-like pads of needles on its branches
  const pineBark = std({ color: 0x6a3a26, roughness: .9 }), pineMats = [0x22412a, 0x2c4f30, 0x1d3a26].map(c => std({ color: c, roughness: .9, flatShading: true }));
  const pineTrunkGeo = new THREE.CylinderGeometry(.12, .26, 5.2, 8), pineBranchGeo = new THREE.CylinderGeometry(.03, .07, 1, 6), pinePadGeo = new THREE.IcosahedronGeometry(1, 1);
  function pine(g, x, z, s = 1, seed = 1) {
    const r = rng(seed * 17), t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); t.rotation.y = r() * TAU; g.add(t);
    sCircle(t, 0, 0, .26);
    const lean = (r() - .5) * .25, H = 5.2;
    const trunk = part(pineTrunkGeo, pineBark, Math.sin(lean) * H / 2, H / 2, 0, t); trunk.rotation.z = -lean;
    const tiers = 5;
    for (let i = 0; i < tiers; i++) {
      const y = 2.0 + i * (H - 2.0) / tiers, a = i * 2.3 + r(), len = (1 - i / tiers) * 1.6 + .4, cx = Math.sin(lean) * y;
      const br = part(pineBranchGeo, pineBark, cx + Math.cos(a) * len / 2, y, Math.sin(a) * len / 2, t); br.rotation.set(0, -a, Math.PI / 2 - .25); br.rotation.order = "YZX"; br.scale.y = len;
      const pad = part(pinePadGeo, pineMats[i % 3], cx + Math.cos(a) * len, y + .15, Math.sin(a) * len, t);
      pad.scale.set(.9 + len * .35, .32, .8 + len * .3);
      if (i % 2) { const p2 = part(pinePadGeo, pineMats[(i + 1) % 3], cx - Math.cos(a) * len * .6, y + .4, -Math.sin(a) * len * .6, t); p2.scale.set(.8, .28, .7); }
    }
    const crown = part(pinePadGeo, pineMats[0], Math.sin(lean) * H, H + .1, 0, t); crown.scale.set(1.1, .38, 1.0);
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
  // the compound walls, trees in the grounds, and the street outside the gate with its pavements, lamps and trees
  function templeGrounds(g) {
    const FZ = 43, BZ = -16, SX = 33;
    [-1, 1].forEach(sd => templeWall(g, sd * SX, FZ, sd * SX, BZ));
    templeWall(g, -SX, BZ, -2.9, BZ); templeWall(g, 2.9, BZ, SX, BZ);   // the back gate stands in the gap
    BLOCK.segs.push([-SX, FZ, -SX, BZ], [SX, FZ, SX, BZ], [-SX, BZ, -3.2, BZ], [3.2, BZ, SX, BZ], [-33, 43, -5.2, 43], [5.2, 43, 33, 43]);
    let seed = 3;
    [[-26, 8], [-31, 15], [-24, 40.5], [-13, 38.5], [-30.5, 40], [-12, -10], [10, -12], [-24, -10], [30.5, -13], [30, 8], [13, 39], [27, 41], [-6, -13], [6, -13]]
      .forEach(([x, z]) => ginkgo(g, x, z, .85 + ((seed * 7) % 5) * .06, seed++));   // golden ginkgos inside the walls
    // outside the walls: pines and common trees round the sides and the back
    const outside = [];
    for (let z = -12; z <= 40; z += 8) outside.push([37.5 + ((z / 8) % 2) * 2, z]);   // east side; the west side has the town road (see shanTown)
    for (let x = -36; x <= 36; x += 8) if (Math.abs(x) > 6 && x > -34) outside.push([x, -20.5 - ((x / 8) % 2) * 1.5]);   // the approach to the back gate stays clear
    outside.forEach(([x, z], i) => (i % 3 === 1 ? tree : pine)(g, x, z, .9 + (i % 4) * .08, seed++));
    // the street: a stone-paved road between kerbed pavements
    const road = std({ color: 0x2e2b28, roughness: .95 }), pave = std({ color: 0x6a645c, roughness: .9 }), kerb = std({ color: 0x8a847a, roughness: .8 });
    flat(mesh(new THREE.BoxGeometry(273, .04, 8), road, 8.5, .02, 54, g));   // from the corner at x = -128, past the hut village's lane, to 145 past the fire and police stations
    // at its west end the street turns north and runs up beside the hut village to the hospital's forecourt
    const HX = -124.75;
    flat(mesh(new THREE.BoxGeometry(6.5, .04, 57.3), road, HX, .02, 21.35, g));
    [-1, 1].forEach(sd => flat(mesh(new THREE.BoxGeometry(1.2, .03, 57.3 + (sd < 0 ? 8.7 : 0)), std({ color: 0x8a7a5e, roughness: 1 }), HX + sd * 3.85, .015, 21.35 + (sd < 0 ? 4.35 : 0), g)));   // dirt verges
    // the north pavement stops either side of the town road, so the two roads meet in a proper junction
    // (and at the mouths of the west lane and the hut village's lane)
    const gaps = [[-128, HX + 3.25], [-98.5, -95.5], [LANES[3].x0, LANES[3].x1], [TOWN.roadX - TOWN.roadW / 2, TOWN.roadX + TOWN.roadW / 2], [145, 145]];
    [[48.75, 2.5, true], [59.4, 2.8, false]].forEach(([z, d, cut]) => {
      const runs = cut ? gaps.slice(1).map((gp, i) => [gaps[i][1], gp[0]]) : [[-128, 145]];
      runs.forEach(([x0, x1]) => {
        mesh(new THREE.BoxGeometry(x1 - x0, .18, d), pave, (x0 + x1) / 2, .09, z, g);
        [-1, 1].forEach(e => mesh(new THREE.BoxGeometry(x1 - x0, .2, .14), kerb, (x0 + x1) / 2, .1, z + e * d / 2, g));
      });
      if (cut) gaps.slice(1, -1).flat().forEach(x => mesh(new THREE.BoxGeometry(.14, .2, d), kerb, x, .1, z, g));   // kerbs turning the corners
    });
    // asphalt across the old pavement line, joining the town road to the street, with a give-way line
    flat(mesh(new THREE.BoxGeometry(TOWN.roadW, .04, 50 - TOWN.z1 + .2), std({ color: 0x2c2c2e, roughness: .95 }), TOWN.roadX, .02, (TOWN.z1 + 50) / 2, g));
    flat(mesh(new THREE.BoxGeometry(TOWN.roadW / 2 - .2, .02, .25), std({ color: 0xe8e4d8, roughness: .8 }), TOWN.roadX + TOWN.roadW / 4, .05, 49.6, g));
    const dash = new THREE.InstancedMesh(new THREE.BoxGeometry(2.4, .02, .14), std({ color: 0xbdb6a8, roughness: .8 }), 53), m4 = new THREE.Matrix4();
    for (let i = 0; i < 44; i++) dash.setMatrixAt(i, m4.makeTranslation(-119 + i * 6, .05, 54));
    for (let i = 0; i < 9; i++) dash.setMatrixAt(44 + i, m4.makeRotationY(Math.PI / 2).setPosition(HX, .05, 46 - i * 6));   // and up the road to the hospital
    g.add(dash);
    // lamp posts and street trees along both pavements, clear of the gate
    for (let x = -60; x <= 60; x += 10) {
      if (Math.abs(x) < 7) continue;
      [[48.5, 0], [59.6, Math.PI]].forEach(([z, ry], side) => {
        if (side === 0 && Math.abs(x - TOWN.roadX) < 6) return;   // the mouth of the town road
        if (LANES.some(l => l.mouth && (l.z0 > 55) === !!side && x > l.x0 - 1.5 && x < l.x1 + 1.5)) return;   // and of the back lanes
        if ((x / 10 + side) % 2 === 0) {
          mesh(new THREE.CylinderGeometry(.07, .1, 3.4, 8), M.lacquer, x, 1.7, z, g);
          sCircle(g, x, z, .12);
          const arm = mesh(new THREE.BoxGeometry(.06, .06, .7), M.lacquer, x, 3.35, z + (side ? -.3 : .3), g); arm.rotation.y = ry;
          const l = flat(mesh(lanternGeo, lanternMat, x, 3.05, z + (side ? -.6 : .6), g)); l.scale.set(.75, .9, .75);
          const gl = lanternGlow(0xff7a3a, 2.2, .6); gl.position.copy(l.position); g.add(gl);
          poleLights.push({ x, z: l.position.z, set: lit => { l.material = lit ? lanternMat : lanternOff; gl.material.opacity = lit ? .6 * (1 - daylight) : 0; } });
        } else (((x / 10) | 0) % 4 === 1 || ((x / 10) | 0) % 4 === -3 ? tree : pine)(g, x, z + (side ? .3 : -.3), .85, seed++);
      });
    }
  }
