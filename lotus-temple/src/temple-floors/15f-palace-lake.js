  /* ---------- ၼွင် the palace lake, filling the open ground between the Haw Kham's west wall, the stupa hill's foot and the main
     road: a broad lake with a stone kerb and a grassy verge, its south-west shore following the hill's foot round, lily pads at
     its west end, and in it a small round island with a Shan pavilion: a whitewashed plinth with a stair to north and south, a
     teak hall under a verandah of slender white posts and a hipped skirt roof, a five-tiered pyatthat rising over it. A teak
     bridge, gently arched, runs out to the island from the main road through a little gateway like the palace's, lanterns lit
     along it at night ---------- */
  // the island (world), its radius and height; the bridge's line (x) and width; the shore's distance from the hill's foot, the
  // palace wall and the road
  const LAKE = { IX: -30, IZ: 222, IR: 9, IY: .45, BX: -30, BW: 2.6, hillGap: 3, wallX: -9.5, roadZ: 252.5, westX: -114 };
  // the shore, closed, in world (x, z): down the palace wall, round the hill's foot, up the west end and back along the road,
  // its corners rounded off (three passes of corner cutting)
  const LAKE_SHORE = (() => {
    const { hillGap, wallX, roadZ, westX } = LAKE, R = HILL.rBase + hillGap, a1 = Math.acos((westX + 2 - HILL.cx) / R), pts = [[wallX, roadZ], [wallX, 200], [wallX, 180]];
    for (let a = .42; a < a1; a += .1) pts.push([HILL.cx + Math.cos(a) * R, HILL.cz + Math.sin(a) * R]);
    pts.push([westX, HILL.cz + Math.sin(a1) * R + 4], [westX - 1.5, 236], [westX, roadZ], [-80, roadZ], [-45, roadZ]);
    let p = pts;
    for (let k = 0; k < 3; k++) p = p.flatMap((q, i) => { const n = p[(i + 1) % p.length]; return [[.75 * q[0] + .25 * n[0], .75 * q[1] + .25 * n[1]], [.25 * q[0] + .75 * n[0], .25 * q[1] + .75 * n[1]]]; });
    return p;
  })();
  // is (x, z) on the water, and how far is it from the shore line
  const lakeIn = (x, z) => { let c = false; const P = LAKE_SHORE; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, zi] = P[i], [xj, zj] = P[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
  const lakeEdge = (x, z) => { let d = 1e9; const P = LAKE_SHORE; for (let i = 0; i < P.length; i++) { const [ax, az] = P[i], [bx, bz] = P[(i + 1) % P.length]; d = Math.min(d, segDist(x, z, [ax, az, bx, bz])); } return d; };
  function palaceLake(g) {
    const list = picks.pagoda, r = rng(4646), { IX, IZ, IR, IY, BX, BW, roadZ } = LAKE, P0 = LAKE_SHORE;
    const { teak, teakDark, white, pane, pyatthat, hip } = shanCarpentry();
    const L = new THREE.Group(); g.add(L);
    const red = std({ color: 0x8a1e14, roughness: .45 }), stone = std({ color: 0x8c877d, roughness: .9 });
    const grass = std({ color: 0x3e5a2c, roughness: 1 });
    onDaylight(d => grass.color.copy(lerpC(0x1e2a16, 0x4a6a32, d)));
    const lakeData = { tip: "The palace lake · ၼွင် · ကန်", toast: "The palace lake (ၼွင် nawng in Shan, ကန် kan in Burmese), dug beside the Haw Kham for the saopha's household, between the palace wall and the foot of the stupa hill. In the evenings people walk out from the main road over the bridge to the island pavilion to sit in the cool off the water." };
    // the shore pushed out (or in) by d metres, as shape points (shapes lie in x/y; laid flat, shape y becomes −z)
    let area = 0; P0.forEach((p, i) => { const q = P0[(i + 1) % P0.length]; area += p[0] * q[1] - q[0] * p[1]; });
    const out = area > 0 ? 1 : -1;
    const ring = d => P0.map((p, i) => { const a = P0[(i + P0.length - 1) % P0.length], b = P0[(i + 1) % P0.length], tx = b[0] - a[0], tz = b[1] - a[1], l = Math.hypot(tx, tz) || 1; return new THREE.Vector2(p[0] + out * tz / l * d, -(p[1] - out * tx / l * d)); });
    const flatShape = (shape, mat, y) => { const m = flat(mesh(new THREE.ShapeGeometry(shape, 1), mat, 0, y, 0, L)); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m; };
    const verge = new THREE.Shape(ring(2.6)); verge.holes.push(new THREE.Path(ring(.2)));
    flatShape(verge, grass, .03);
    flatShape(new THREE.Shape(ring(.2)), std({ color: 0x14262a, roughness: 1 }), .055);   // the dark bed
    const water = flatShape(new THREE.Shape(ring(0)), std({ color: 0x1d5560, metalness: .2, roughness: .08, transparent: true, opacity: .78, depthWrite: false }), .1);
    clickable(list, water, lakeData);
    // the stone kerb along the shore, a block to each stretch, broken where the bridge comes ashore
    const kerbGeo = new THREE.BoxGeometry(1, .32, .45), KG = new THREE.Group(); L.add(KG);
    P0.forEach((p, i) => {
      const q = P0[(i + 1) % P0.length], mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2;
      if (Math.abs(mx - BX) < BW / 2 + .3 && mz > roadZ - 3) return;
      const k = part(kerbGeo, stone, mx, .16, mz, KG); k.rotation.y = -Math.atan2(q[1] - p[1], q[0] - p[0]); k.scale.x = Math.hypot(q[0] - p[0], q[1] - p[1]) + .08;
    });
    bakeParts(KG);
    // lily pads in drifts at the west end, a few pink buds among them
    const padGeo = new THREE.CircleGeometry(.42, 10), budGeo = new THREE.ConeGeometry(.12, .3, 6), PG = new THREE.Group(); L.add(PG);
    const padM = std({ color: 0x2e5a26, roughness: .8, side: THREE.DoubleSide }), budM = std({ color: 0xe88aa8, roughness: .6, emissive: 0x3a1020 });
    for (let i = 0, k = 0; i < 600 && k < 140; i++) {
      const x = LAKE.westX + r() * 34, z = 214 + r() * 38;
      if (!lakeIn(x, z) || lakeEdge(x, z) < 1 || lakeEdge(x, z) > 9) continue;
      k++;
      const p = part(padGeo, padM, x, .115, z, PG); p.rotation.set(-Math.PI / 2, 0, r() * TAU); p.scale.setScalar(.7 + r() * .6); p.castShadow = false;
      if (r() < .12) part(budGeo, budM, x + .2, .25, z, PG);
    }
    bakeParts(PG);
    // the island: a low stone-faced mound, grassed on top
    const isle = mesh(new THREE.CylinderGeometry(IR, IR + .3, IY, 40), [stone, grass, stone], IX, IY / 2, IZ, L); isle.receiveShadow = true;
    // the pavilion, built along its own x (its stairs) and turned so the stairs face the bridge (north) and the far shore: the
    // plinth (PS half wide, PH high on the island), the hall's walls (HS half wide, WH high)
    const PS = 4.2, PH = 1.1, top = IY + PH, HS = 2.6, WH = 3.2, yW = top + WH, EH = top + 2.6, SW = 2, n = 5, run = n * .32, ED = .45;
    const P = new THREE.Group(); P.position.set(IX, 0, IZ); P.rotation.y = Math.PI / 2; L.add(P);
    const pdata = { tip: "The island pavilion on the palace lake", toast: "A pavilion of the saopha's household on its island in the palace lake: a teak hall on a whitewashed plinth, a verandah of slender white posts all round, and over it a five-tiered pyatthat, as on the palace itself. The saopha's family came out here in the hot season to take the air off the water." };
    mesh(new THREE.BoxGeometry(2 * PS, PH, 2 * PS), white, 0, IY + PH / 2, 0, P);
    mesh(new THREE.BoxGeometry(2 * PS + .25, .25, 2 * PS + .25), white, 0, IY + .12, 0, P);
    mesh(new THREE.BoxGeometry(2 * PS + .16, .12, 2 * PS + .16), white, 0, top - .2, 0, P);
    // the steps up the plinth at both ends, between low white walls
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
    // the hall: dark teak walls banded in gilt, a door at each stair, two lamplit windows on each side
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
    // the bridge: teak planks on posts in the water, from the main road's edge (Z1) out to the island (Z0) in a gentle arch,
    // railed both sides
    const Z0 = IZ + IR - 1, Z1 = LANES[6].z0 + .1, BL = Z1 - Z0;
    const deckY = z => { const t = clamp((Z1 - z) / BL, 0, 1); return .18 + (IY - .18) * t + 1.1 * Math.sin(Math.PI * t); };
    const bdata = { tip: "The bridge to the island pavilion", toast: "A teak bridge from the main road over the palace lake to the island pavilion, arched so the boats can pass beneath it." };
    const BG = new THREE.Group(); L.add(BG);
    const plankGeo = new THREE.BoxGeometry(BW, .12, 1), railGeo = new THREE.BoxGeometry(.1, .08, 1), bpostGeo = new THREE.BoxGeometry(.14, 1, .14), pileGeo = new THREE.CylinderGeometry(.12, .12, 1, 6);
    const SEG = 26, rx = BW / 2 - .07;
    for (let i = 0; i < SEG; i++) {
      const za = Z0 + i * BL / SEG, zb = za + BL / SEG, ya = deckY(za), yb = deckY(zb), len = Math.hypot(zb - za, yb - ya), ang = -Math.atan2(yb - ya, zb - za), mz = (za + zb) / 2, my = (ya + yb) / 2;
      const pl = part(plankGeo, teak, BX, my - .06, mz, BG); pl.rotation.x = ang; pl.scale.z = len + .02;
      [-1, 1].forEach(e => { const rl = part(railGeo, teakDark, BX + e * rx, my + .95, mz, BG); rl.rotation.x = ang; rl.scale.z = len + .02; });
      [-1, 1].forEach(e => part(bpostGeo, teakDark, BX + e * rx, ya + .5, za, BG));
      if (i % 4 === 2) [-1, 1].forEach(e => { const p = part(pileGeo, teakDark, BX + e * (BW / 2 - .3), (my - .12) / 2, mz, BG); p.scale.y = my - .12; });
    }
    [-1, 1].forEach(e => part(bpostGeo, teakDark, BX + e * rx, deckY(Z1) + .5, Z1, BG));
    bakeParts(BG);
    BG.children.forEach(o => clickable(list, o, bdata));
    // lanterns on red posts at the bridge's quarters, both sides
    [.25, .5, .75].forEach(t => [-1, 1].forEach(e => { const z = Z0 + t * BL, y = deckY(z); mesh(new THREE.BoxGeometry(.16, .7, .16), red, BX + e * rx, y + 1.3, z, L); const s = glowSprite(0xffc860, .7, .8); s.position.set(BX + e * rx, y + 1.8, z); L.add(s); lamps.push(s); }));
    // the gateway on the road's verge at the bridge's foot: two white pillars under a red beam carrying a little three-tiered
    // pyatthat, as at the palace, lanterns on their road faces
    const GZ = Z1 - 1.3, GS = BW / 2 + .5;
    [-1, 1].forEach(e => {
      mesh(new THREE.BoxGeometry(.8, 3.4, .8), white, BX + e * GS, 1.7, GZ, L); mesh(new THREE.BoxGeometry(.95, .16, .95), M.trim, BX + e * GS, 3.45, GZ, L);
      const s = glowSprite(0xffd060, 1, .8); s.position.set(BX + e * GS, 2.7, GZ + .6); L.add(s); lamps.push(s);
    });
    mesh(new THREE.BoxGeometry(2 * GS + 1, .5, 1.1), red, BX, 3.75, GZ, L); mesh(new THREE.BoxGeometry(2 * GS + 1.1, .12, 1.2), M.trim, BX, 4.05, GZ, L);
    pyatthat(L, BX, 4.1, GZ, 2, 3);
    onDaylight(d => lamps.forEach(b => b.material.opacity = .85 * (1 - d)));
    // shade trees on the verge at the west end, clear of the road and the hill's slope
    for (let i = 0; i < P0.length; i += 9) {
      const [x, z] = P0[i], q = P0[(i + 1) % P0.length], tx = q[0] - x, tz = q[1] - z, l = Math.hypot(tx, tz) || 1, wx = x + out * tz / l * 3.6, wz = z - out * tx / l * 3.6;
      if (wz > roadZ - 1 || wx > LAKE.wallX - 3 || Math.hypot(wx - HILL.cx, wz - HILL.cz) < HILL.rBase + 1.5) continue;
      tree(g, wx, wz, .9 + r() * .3, 960 + i);
    }
    // walkers: the water blocks; the bridge, island and plinth round the hall can be walked. Anywhere else in the rectangle is left
    // to the surfaces after this one (the hill, its terraces) by answering undefined
    const xs = P0.map(p => p[0]), zs = P0.map(p => p[1]);
    sRect(L, Math.min(...xs) - 1, Math.max(...xs) + 1, Math.min(...zs) - 1, Z1 + .5, (x, z) => {
      if (Math.abs(x - BX) < BW / 2 - .25 && z > Z0 && z < Z1) return deckY(z);
      const ax = Math.abs(z - IZ), az = Math.abs(x - IX);   // in the pavilion's own frame (turned a quarter): its x runs along the world's z
      if (Math.hypot(ax, az) < IR - .35) {
        if (ax < HS + .3 && az < HS + .3) return null;   // the hall
        if (ax < PS && az < PS) return (ax > PS - ED || az > PS - ED) && !(az < SW / 2 - .25 && ax > PS - ED) ? null : top;   // the plinth inside its balustrade
        if (ax < PS + run && az < SW / 2 + .25) return az < SW / 2 - .25 ? top - (ax - PS) / run * PH : null;   // the stairs, walled at the sides
        return IY;
      }
      if (Math.abs(z - GZ) < .75 && Math.abs(Math.abs(x - BX) - GS) < .75) return null;   // the gate's pillars
      return lakeIn(x, z) || lakeEdge(x, z) < .4 ? null : undefined;   // the water, up to the kerb
    });
    // keep the outside camera above the pavilion
    TALL.push({ x0: IX - PS - 1, x1: IX + PS + 1, z0: IZ - PS - 1, z1: IZ + PS + 1, h: 18 });
  }
