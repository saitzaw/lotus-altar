  /* ---------- ၼွင် the palace lake, on the open ground west of the Haw Kham's wall, between it and the stupa hill's foot: a broad
     lake with a grassy verge and a stone kerb, lily pads along its west shore, and in its middle a small round island with a
     Shan pavilion on it: a whitewashed plinth with a stair to east and west, a teak hall under a verandah of slender white
     posts and a hipped skirt roof, a five-tiered pyatthat rising over it. A teak bridge, gently arched, crosses to the island
     from the east shore, entered through a little gateway like the palace's, lanterns lit along it at night ---------- */
  // where it lies (world), its half sizes across (x) and along (z), the island (in the lake's frame), the bridge's width
  const LAKE = { x: -52, z: 246, rx: 36, rz: 24, IX: 6, IZ: -1, IR: 8.5, IY: .45, BW: 2.6 };
  const lakeWob = a => 1 + .05 * Math.sin(3 * a + 2) + .03 * Math.sin(5 * a + .5);   // the shore's gentle in-and-out
  // how far out (lx, lz) is, as a fraction of the shore there: below 1 is water
  const lakeRho = (lx, lz) => { const u = lx / LAKE.rx, v = lz / LAKE.rz; return Math.hypot(u, v) / lakeWob(Math.atan2(v, u)); };
  function palaceLake(g) {
    const list = picks.pagoda, r = rng(4646), { rx, rz, IX, IZ, IR, IY, BW } = LAKE;
    const { teak, teakDark, white, pane, pyatthat, hip } = shanCarpentry();
    const L = new THREE.Group(); L.position.set(LAKE.x, 0, LAKE.z); g.add(L);
    const red = std({ color: 0x8a1e14, roughness: .45 }), stone = std({ color: 0x8c877d, roughness: .9 });
    const grass = std({ color: 0x3e5a2c, roughness: 1 });
    onDaylight(d => grass.color.copy(lerpC(0x1e2a16, 0x4a6a32, d)));
    const lakeData = { tip: "The palace lake · ၼွင် · ကန်", toast: "The palace lake (ၼွင် nawng in Shan, ကန် kan in Burmese), dug beside the Haw Kham for the saopha's household. In the evenings people walk out over the bridge to the island pavilion to sit in the cool off the water." };
    // the shore as a ring of points, and a flat shape from it (shapes lie in x/y; turned flat, shape y becomes −z)
    const N = 120, shore = k => { const a = k / N * TAU, w = lakeWob(a); return [Math.cos(a) * rx * w, Math.sin(a) * rz * w]; };
    const ring = (grow, add = 0) => { const pts = []; for (let k = 0; k < N; k++) { const [x, z] = shore(k), s = grow + add / Math.hypot(x, z); pts.push(new THREE.Vector2(x * s, -z * s)); } return pts; };
    const flatShape = (shape, mat, y) => { const m = flat(mesh(new THREE.ShapeGeometry(shape, 1), mat, 0, y, 0, L)); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m; };
    const verge = new THREE.Shape(ring(1, 6)); verge.holes.push(new THREE.Path(ring(1, .2)));
    flatShape(verge, grass, .03);
    flatShape(new THREE.Shape(ring(1, .2)), std({ color: 0x14262a, roughness: 1 }), .055);   // the dark bed
    const water = flatShape(new THREE.Shape(ring(1)), std({ color: 0x1d5560, metalness: .2, roughness: .08, transparent: true, opacity: .78, depthWrite: false }), .1);
    clickable(list, water, lakeData);
    // the stone kerb round the shore, a block to each stretch, broken where the bridge comes ashore
    const kerbGeo = new THREE.BoxGeometry(1, .32, .45), KG = new THREE.Group(); L.add(KG);
    for (let k = 0; k < N; k++) {
      const [x0, z0] = shore(k), [x1, z1] = shore(k + 1), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      if (mx > 0 && Math.abs(mz - IZ) < BW / 2 + .3) continue;
      const p = part(kerbGeo, stone, mx, .16, mz, KG); p.rotation.y = -Math.atan2(z1 - z0, x1 - x0); p.scale.x = Math.hypot(x1 - x0, z1 - z0) + .08;
    }
    bakeParts(KG);
    // lily pads in drifts along the west shore, a few pink buds among them
    const padGeo = new THREE.CircleGeometry(.42, 10), budGeo = new THREE.ConeGeometry(.12, .3, 6), PG = new THREE.Group(); L.add(PG);
    const padM = std({ color: 0x2e5a26, roughness: .8, side: THREE.DoubleSide }), budM = std({ color: 0xe88aa8, roughness: .6, emissive: 0x3a1020 });
    for (let i = 0; i < 90; i++) {
      const a = Math.PI * (.6 + r() * .8), s = .62 + r() * .3, w = lakeWob(a), x = Math.cos(a) * rx * w * s, z = Math.sin(a) * rz * w * s;
      if (Math.hypot(x - IX, z - IZ) < IR + 2) continue;
      const p = part(padGeo, padM, x, .115, z, PG); p.rotation.set(-Math.PI / 2, 0, r() * TAU); p.scale.setScalar(.7 + r() * .6); p.castShadow = false;
      if (r() < .12) part(budGeo, budM, x + .2, .25, z, PG);
    }
    bakeParts(PG);
    // the island: a low stone-faced mound, grassed on top
    const isle = mesh(new THREE.CylinderGeometry(IR, IR + .3, IY, 40), [stone, grass, stone], IX, IY / 2, IZ, L); isle.receiveShadow = true;
    // the pavilion: the plinth (PS half wide, PH high on the island), the hall's walls (HS half wide, WH high), stairs east and west
    const PS = 4.2, PH = 1.1, top = IY + PH, HS = 2.6, WH = 3.2, yW = top + WH, EH = top + 2.6, SW = 2, n = 5, run = n * .32, ED = .45;
    const P = new THREE.Group(); P.position.set(IX, 0, IZ); L.add(P);
    const pdata = { tip: "The island pavilion on the palace lake", toast: "A pavilion of the saopha's household on its island in the palace lake: a teak hall on a whitewashed plinth, a verandah of slender white posts all round, and over it a five-tiered pyatthat, as on the palace itself. The saopha's family came out here in the hot season to take the air off the water." };
    mesh(new THREE.BoxGeometry(2 * PS, PH, 2 * PS), white, 0, IY + PH / 2, 0, P);
    mesh(new THREE.BoxGeometry(2 * PS + .25, .25, 2 * PS + .25), white, 0, IY + .12, 0, P);
    mesh(new THREE.BoxGeometry(2 * PS + .16, .12, 2 * PS + .16), white, 0, top - .2, 0, P);
    // the steps up the plinth on the east (toward the bridge) and west faces, between low white walls
    for (const sd of [-1, 1]) {
      for (let i = 0; i < n; i++) { const h = (i + 1) * PH / n; mesh(new THREE.BoxGeometry(.32, h, SW), white, sd * (PS + run - (i + .5) * .32), IY + h / 2, 0, P); }
      [-1, 1].forEach(e => mesh(new THREE.BoxGeometry(run, PH + .3, .22), white, sd * (PS + run / 2), IY + (PH + .3) / 2, e * (SW / 2 + .11), P));
    }
    // the balustrade round the plinth's edge, open at the stairs, and a lotus-bud pier at each corner
    const bal = (x0, x1, z0, z1) => { mesh(new THREE.BoxGeometry(x1 - x0, .6, z1 - z0), white, (x0 + x1) / 2, top + .3, (z0 + z1) / 2, P); mesh(new THREE.BoxGeometry(x1 - x0 + .1, .08, z1 - z0 + .1), M.trim, (x0 + x1) / 2, top + .64, (z0 + z1) / 2, P); };
    bal(-PS, PS, -PS, -PS + .2); bal(-PS, PS, PS - .2, PS);
    [-1, 1].forEach(sd => { const x0 = sd > 0 ? PS - .2 : -PS, x1 = x0 + .2; bal(x0, x1, -PS + .2, -SW / 2); bal(x0, x1, SW / 2, PS - .2); });
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => {
      mesh(new THREE.BoxGeometry(.4, .9, .4), white, a * (PS - .2), top + .45, b * (PS - .2), P);
      const bud = mesh(new THREE.SphereGeometry(.15, 12, 8), white, a * (PS - .2), top + 1.02, b * (PS - .2), P); bud.scale.y = 1.35;
    });
    // the hall: dark teak walls banded in gilt, a door to east and west, two lamplit windows on each side
    mesh(new THREE.BoxGeometry(2 * HS, WH, 2 * HS), teak, 0, top + WH / 2, 0, P);
    [top + .2, top + 2.5, yW - .1].forEach(y => mesh(new THREE.BoxGeometry(2 * HS + .06, .14, 2 * HS + .06), M.trim, 0, y, 0, P));
    for (const sd of [-1, 1]) {
      const D = new THREE.Group(); D.position.set(sd * HS, top, 0); D.rotation.y = sd * Math.PI / 2; P.add(D);
      mesh(new THREE.BoxGeometry(1.5, 2.3, .06), M.trim, 0, 1.15, .02, D); mesh(new THREE.BoxGeometry(1.26, 2.12, .06), red, 0, 1.06, .05, D);
      [-1, 1].forEach(w => { const Wn = new THREE.Group(); Wn.position.set(w * 1.1, top + 1.4, sd * HS); Wn.rotation.y = sd > 0 ? 0 : Math.PI; P.add(Wn); mesh(new THREE.BoxGeometry(.9, 1.4, .06), M.trim, 0, 0, .02, Wn); mesh(new THREE.PlaneGeometry(.7, 1.2), pane, 0, 0, .06, Wn); });
    }
    // the verandah's slender white posts under a teak beam, and the skirt roof from the beam up to the top of the hall's walls
    const postGeo = new THREE.CylinderGeometry(.08, .1, EH - top, 8), PP = new THREE.Group(); P.add(PP);
    for (let k = 0; k <= 4; k++) { const t = -PS + .45 + k * (2 * PS - .9) / 4; [[t, -PS + .45], [t, PS - .45], [-PS + .45, t], [PS - .45, t]].forEach(([px, pz]) => { if (Math.abs(pz) < SW / 2 && Math.abs(px) > PS - 1) return; part(postGeo, white, px, (top + EH) / 2, pz, PP); }); }
    bakeParts(PP);
    [[0, -PS + .45, 2 * PS - .7, .2], [0, PS - .45, 2 * PS - .7, .2], [-PS + .45, 0, .2, 2 * PS - .7], [PS - .45, 0, .2, 2 * PS - .7]].forEach(([bx, bz, w, d]) => mesh(new THREE.BoxGeometry(w, .26, d), teakDark, bx, EH - .13, bz, P));
    hip(P, [-PS - .7, PS + .7, -PS - .7, PS + .7], [-HS, HS, -HS, HS], EH - .55, yW);
    // over the hall a dark clerestory band, then the five-tiered pyatthat, its gold spire the island's landmark across the water
    mesh(new THREE.BoxGeometry(2 * HS - .4, .7, 2 * HS - .4), teakDark, 0, yW + .35, 0, P);
    hip(P, [-HS - .3, HS + .3, -HS - .3, HS + .3], [-1.1, 1.1, -1.1, 1.1], yW + .6, yW + 1.5);
    pyatthat(P, 0, yW + 1.4, 0, 3.1, 5, .15);
    const lamps = [];
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => { const s = glowSprite(0xffd060, .9, .8); s.position.set(a * (PS - .45), EH - .5, b * (PS - .45)); P.add(s); lamps.push(s); });
    P.traverse(o => { if (o.isMesh) clickable(list, o, pdata); });
    // the bridge: teak planks on posts in the water, rising in a gentle arch from the island to the east shore, railed both sides
    const B0 = IX + IR - 1, B1 = rx * lakeWob(Math.atan2(IZ / rz, 1)) + 1.6, BL = B1 - B0;
    const deckY = x => { const t = clamp((x - B0) / BL, 0, 1); return IY + (.18 - IY) * t + .9 * Math.sin(Math.PI * t); };
    const bdata = { tip: "The bridge to the island pavilion", toast: "A teak bridge over the palace lake to the island pavilion, arched so the boats can pass beneath it." };
    const BG = new THREE.Group(); L.add(BG);
    const plankGeo = new THREE.BoxGeometry(1, .12, BW), railGeo = new THREE.BoxGeometry(1, .08, .1), bpostGeo = new THREE.BoxGeometry(.14, 1, .14), pileGeo = new THREE.CylinderGeometry(.12, .12, 1, 6);
    const SEG = 24;
    for (let i = 0; i < SEG; i++) {
      const xa = B0 + i * BL / SEG, xb = xa + BL / SEG, ya = deckY(xa), yb = deckY(xb), len = Math.hypot(xb - xa, yb - ya), ang = Math.atan2(yb - ya, xb - xa), mx = (xa + xb) / 2, my = (ya + yb) / 2;
      const pl = part(plankGeo, teak, mx, my - .06, IZ, BG); pl.rotation.z = ang; pl.scale.x = len + .02;
      [-1, 1].forEach(e => { const rl = part(railGeo, teakDark, mx, my + .95, IZ + e * (BW / 2 - .07), BG); rl.rotation.z = ang; rl.scale.x = len + .02; });
      [-1, 1].forEach(e => part(bpostGeo, teakDark, xa, ya + .5, IZ + e * (BW / 2 - .07), BG));
      if (i % 4 === 2) [-1, 1].forEach(e => { const p = part(pileGeo, teakDark, mx, (my - .12) / 2, IZ + e * (BW / 2 - .3), BG); p.scale.y = my - .12; });
    }
    [-1, 1].forEach(e => part(bpostGeo, teakDark, B1, deckY(B1) + .5, IZ + e * (BW / 2 - .07), BG));
    bakeParts(BG);
    // lanterns on red posts at the bridge's quarters, both sides
    [.25, .5, .75].forEach(t => [-1, 1].forEach(e => { const x = B0 + t * BL, y = deckY(x); mesh(new THREE.BoxGeometry(.16, .7, .16), red, x, y + 1.3, IZ + e * (BW / 2 - .07), L); const s = glowSprite(0xffc860, .7, .8); s.position.set(x, y + 1.8, IZ + e * (BW / 2 - .07)); L.add(s); lamps.push(s); }));
    // the gateway at the bridge's shore end: two white pillars under a red beam carrying a little three-tiered pyatthat, as at the palace
    const GX = B1 + .7, GS = BW / 2 + .5;
    [-1, 1].forEach(e => {
      mesh(new THREE.BoxGeometry(.8, 3.4, .8), white, GX, 1.7, IZ + e * GS, L); mesh(new THREE.BoxGeometry(.95, .16, .95), M.trim, GX, 3.45, IZ + e * GS, L);
      const s = glowSprite(0xffd060, 1, .8); s.position.set(GX + .6, 2.7, IZ + e * GS); L.add(s); lamps.push(s);
    });
    mesh(new THREE.BoxGeometry(1.1, .5, 2 * GS + 1), red, GX, 3.75, IZ, L); mesh(new THREE.BoxGeometry(1.2, .12, 2 * GS + 1.1), M.trim, GX, 4.05, IZ, L);
    pyatthat(L, GX, 4.1, IZ, 2, 3);
    flat(mesh(new THREE.BoxGeometry(5, .05, BW + .4), M.stone, GX + 2, .045, IZ, L));   // a paved landing before the gate
    BG.children.forEach(o => clickable(list, o, bdata));
    onDaylight(d => lamps.forEach(b => b.material.opacity = .85 * (1 - d)));
    // shade trees round the verge, clear of the bridge's landing and the hill's slope
    for (let k = 0; k < 16; k++) {
      const a = (k + .3 + r() * .4) / 16 * TAU, w = lakeWob(a), x = Math.cos(a) * (rx * w + 4.5), z = Math.sin(a) * (rz * w + 4.5);
      if (x > 20 && Math.abs(z - IZ) < 9) continue;
      const wx = LAKE.x + x, wz = LAKE.z + z;
      if (Math.hypot(wx - HILL.cx, wz - HILL.cz) < HILL.rBase + 2) continue;
      tree(g, wx, wz, .9 + r() * .3, 960 + k);
    }
    // walkers: the water blocks, the island and the plinth round the hall can be walked, the bridge carries you over (in L's frame)
    const isleR = IR - .35;
    sRect(L, -rx * 1.12, B1 + 2, -rz * 1.12, rz * 1.12, (x, z) => {
      if (Math.abs(z - IZ) < BW / 2 - .25 && x > B0 && x < B1 + .5) return deckY(x);
      const px = x - IX, pz = z - IZ, ax = Math.abs(px), az = Math.abs(pz);
      if (Math.hypot(px, pz) < isleR) {
        if (ax < HS + .3 && az < HS + .3) return null;   // the hall
        if (ax < PS && az < PS) return (ax > PS - ED || az > PS - ED) && !(az < SW / 2 - .25 && ax > PS - ED) ? null : top;   // the plinth inside its balustrade
        if (ax < PS + run && az < SW / 2 + .25) return az < SW / 2 - .25 ? top - (ax - PS) / run * PH : null;   // the stairs, walled at the sides
        return IY;
      }
      if (Math.abs(x - GX) < .75 && Math.abs(Math.abs(z - IZ) - GS) < .75) return null;   // the gate's pillars
      return lakeRho(x, z) < 1.012 ? null : 0;   // the water, up to the kerb
    });
    // keep the outside camera above the pavilion
    TALL.push({ x0: LAKE.x + IX - PS - 1, x1: LAKE.x + IX + PS + 1, z0: LAKE.z + IZ - PS - 1, z1: LAKE.z + IZ + PS + 1, h: 18 });
  }
