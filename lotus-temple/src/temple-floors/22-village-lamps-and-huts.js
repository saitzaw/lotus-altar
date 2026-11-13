  /* ---------- village lamps and bamboo huts ---------- */
  // a village street lamp: a wooden (or bamboo) pole with a crossarm carrying white insulators, and below it a steel arm out to
  // local +x with a green enamel shade over a bare bulb, which throws a warm pool of light on the ground at night.
  // The wires run along local z; returns the two insulator tops (in g's frame) for `lampWires`
  const enamel = std({ color: 0x2e6a4a, roughness: .35, metalness: .2 }), enamelIn = std({ color: 0xf4f0e4, roughness: .4, side: THREE.BackSide });
  const insulator = std({ color: 0xf2f2ee, roughness: .25 }), bambooPole = std({ color: 0xa89058, roughness: .8 });
  const lampBulb = std({ color: 0xfff4d8, emissive: 0xffd890, emissiveIntensity: 1 });
  const poolTex = canvasTex(64, (c, sz) => {
    const gr = c.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
    gr.addColorStop(0, "rgba(255,210,140,.9)"); gr.addColorStop(.45, "rgba(255,190,110,.35)"); gr.addColorStop(1, "rgba(255,170,90,0)");
    c.fillStyle = gr; c.fillRect(0, 0, sz, sz);
  });
  const lampPool = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const lampBulbOff = std({ color: 0x8a8678, roughness: .4 });
  const hutLamp = lampBulb.clone();   // the huts' own oil lamps, put out on Halloween night with the house lights
  const lampGlows = [], hutGlows = [];
  onDaylight(d => {
    lampBulb.emissiveIntensity = 1 - .85 * d; lampPool.opacity = .75 * (1 - d); lampGlows.forEach(s => s.material.opacity = .8 * (1 - d));
    const hut = 1 - FEST.out; hutLamp.emissiveIntensity = (1 - .85 * d) * hut; hutGlows.forEach(s => s.material.opacity = .8 * (1 - d) * hut);
  });
  function villageLamp(g, x, y, z, ry, bamboo = false) {
    const p = new THREE.Group(); p.position.set(x, y, z); p.rotation.y = ry; g.add(p);
    sCircle(p, 0, 0, .13);
    const H = bamboo ? 5.2 : 6, A = .95, c = Math.cos(ry), s = Math.sin(ry);
    mesh(new THREE.CylinderGeometry(.07, .11, H, 7), bamboo ? bambooPole : teakPost, 0, H / 2, 0, p);
    if (bamboo) for (let k = 1; k < 5; k++) mesh(new THREE.CylinderGeometry(.085, .085, .05, 7), teakDark, 0, k * H / 5, 0, p);   // the nodes
    mesh(new THREE.BoxGeometry(1.3, .09, .09), teakPost, 0, H - .3, 0, p);
    [-.55, .55].forEach(ix => mesh(new THREE.CylinderGeometry(.04, .05, .12, 8), insulator, ix, H - .19, 0, p));
    // the lamp arm and its brace, the shade (green enamel outside, white inside), the bulb and its glow
    mesh(new THREE.BoxGeometry(A, .04, .04), steel, A / 2, H - 1.25, 0, p);
    mesh(new THREE.BoxGeometry(.64, .03, .03), steel, .22, H - 1.47, 0, p).rotation.z = Math.PI / 4;
    mesh(new THREE.BoxGeometry(.03, .14, .03), steel, A, H - 1.32, 0, p);
    const shade = new THREE.ConeGeometry(.3, .16, 14, 1, true);
    mesh(shade, enamel, A, H - 1.44, 0, p); mesh(shade, enamelIn, A, H - 1.44, 0, p);
    const bulb = mesh(new THREE.SphereGeometry(.07, 8, 6), lampBulb, A, H - 1.55, 0, p);
    const gl = glowSprite(0xffd890, 2, 0); gl.position.set(A, H - 1.55, 0); p.add(gl); lampGlows.push(gl);
    gl.material.opacity = .8 * (1 - daylight);
    const pool = flat(mesh(new THREE.CircleGeometry(3.2, 20), lampPool, A + .3, .07, 0, p)); pool.rotation.x = -Math.PI / 2; pool.receiveShadow = false;
    poleLights.push({ x: x + A * c, z: z - A * s, set: lit => { bulb.material = lit ? lampBulb : lampBulbOff; gl.visible = pool.visible = lit; } });
    return [-.55, .55].map(ix => [x + ix * c, y + H - .12, z - ix * s]);
  }
  // sagging wires between consecutive lamps (the arrays `villageLamp` returns)
  const wireMat = new THREE.LineBasicMaterial({ color: 0x1a1816 });
  function lampWires(g, tops) {
    const pts = [];
    for (let i = 1; i < tops.length; i++) for (let k = 0; k < 2; k++) {
      const [ax, ay, az] = tops[i - 1][k], [bx, by, bz] = tops[i][k], sag = Math.hypot(bx - ax, bz - az) * .04;
      for (let j = 0; j < 8; j++) [j, j + 1].forEach(q => { const t = q / 8; pts.push(ax + (bx - ax) * t, ay + (by - ay) * t - Math.sin(Math.PI * t) * sag, az + (bz - az) * t); });
    }
    if (!pts.length) return;
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    g.add(new THREE.LineSegments(geo, wireMat));
  }
  // a village hut of bamboo and thatch, as they are still built in the hill villages round Shan towns: woven bamboo-mat walls on a
  // frame of wooden posts, a split-bamboo floor raised off the ground with an open verandah in front and a ladder down, and a steep
  // thatched gable roof. Front faces +z. Each post runs down to the land under it, so a hut can stand out over a slope on stilts.
  const hutMatTex = canvasTex(64, (c, sz) => {
    c.fillStyle = "#b89a62"; c.fillRect(0, 0, sz, sz);
    for (let y = 0; y < sz; y += 8) for (let x = 0; x < sz; x += 8) {   // a twill weave of light and dark strips
      const odd = ((x + y) / 8) % 2;
      c.fillStyle = odd ? "rgba(90,60,25,.35)" : "rgba(255,235,180,.2)"; c.fillRect(x, y, 8, 4);
      c.fillStyle = odd ? "rgba(255,235,180,.2)" : "rgba(90,60,25,.35)"; c.fillRect(x, y + 4, 8, 4);
      c.fillStyle = "rgba(60,40,15,.4)"; c.fillRect(x + (odd ? 0 : 4), y, 1, 8);
    }
  });
  hutMatTex.wrapS = hutMatTex.wrapT = THREE.RepeatWrapping; hutMatTex.repeat.set(4, 2);
  const thatchTex = canvasTex(128, (c, sz) => {
    c.fillStyle = "#86704a"; c.fillRect(0, 0, sz, sz);
    const r = rng(55);
    for (let i = 0; i < 900; i++) { c.fillStyle = r() < .5 ? "rgba(60,44,22,.45)" : "rgba(200,176,120,.35)"; c.fillRect(r() * sz, r() * sz, 1, 4 + r() * 6); }
    c.fillStyle = "rgba(40,28,14,.5)"; for (let y = 0; y < sz; y += 16) c.fillRect(0, y, sz, 2);   // the courses of thatch
  });
  thatchTex.wrapS = thatchTex.wrapT = THREE.RepeatWrapping; thatchTex.repeat.set(3, 2);
  const hutWall = std({ map: hutMatTex, roughness: .9 }), hutGable = std({ map: hutMatTex, roughness: .9, side: THREE.DoubleSide });
  const hutThatch = std({ map: thatchTex, roughness: 1 }), hutRidge = std({ color: 0x4e3e26, roughness: 1 }), hutSlat = std({ color: 0x9a8050, roughness: .9 });
  const hutPot = std({ color: 0x8a4a2a, roughness: .7 });
  const HUT_TIP = { tip: "A bamboo hut in the village", toast: "A village hut of woven bamboo mats and thatch on a frame of wooden posts, the way houses are still built in the hill villages round Shan towns. The floor is raised to keep out the damp and the animals; the family cooks, eats and sleeps on the verandah and in the one room behind it." };
  function villageHut(g, x, z, ry, o) {
    const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
    const { W, D, seed } = o, r = rng(seed), FH = 2.3, VD = 1.4, c = Math.cos(ry), s = Math.sin(ry);
    const gAt = (lx, lz) => terrainAt(x + lx * c + lz * s, z - lx * s + lz * c);   // the land under a point of the hut
    sRect(h, -W / 2 - .3, W / 2 + .3, -D / 2 - .3, D / 2 + VD + .2);
    const xs = [-W / 2, 0, W / 2], zs = [-D / 2, D / 2, D / 2 + VD];
    let low = Infinity, high = -Infinity;
    xs.forEach(px => zs.forEach(pz => { const y = gAt(px, pz); low = Math.min(low, y); high = Math.max(high, y); }));
    const y0 = high + (o.lift || 1.1), ye = y0 + FH;
    // the posts, from the land up to the wall plate (the verandah posts up to the eave)
    xs.forEach(px => zs.forEach((pz, k) => {
      const b = gAt(px, pz) - .2, t = k === 2 ? ye - .15 : ye;
      mesh(new THREE.CylinderGeometry(.08, .1, t - b, 6), teakPost, px, (t + b) / 2, pz, h);
    }));
    if (y0 - low > 1.8) [-1, 1].forEach(sd => {   // tall stilts are braced corner to corner along each side
      const b = gAt(sd * W / 2, D / 2 + VD) + .3, dz = D + VD, dy = y0 - .2 - b, L = Math.hypot(dz, dy);
      const br = mesh(new THREE.BoxGeometry(.06, .08, L), teakPost, sd * (W / 2 + .06), b + dy / 2, -D / 2 + dz / 2, h);
      br.rotation.x = Math.atan2(dy, dz);
    });
    // the floor and verandah, the walls, a door onto the verandah and a window each side under a propped mat shutter
    mesh(new THREE.BoxGeometry(W + .3, .12, D + VD + .1), hutSlat, 0, y0 - .06, VD / 2, h);
    clickable(picks.pagoda, mesh(new THREE.BoxGeometry(W, FH, D), hutWall, 0, y0 + FH / 2, 0, h), HUT_TIP);
    const left = seed % 2 ? 1 : -1;
    mesh(new THREE.BoxGeometry(.9, 1.8, .05), houseInside, left * W / 4, y0 + .9, D / 2 + .01, h);
    [-1, 1].forEach(sd => {
      mesh(new THREE.BoxGeometry(.05, .7, .9), houseInside, sd * (W / 2 + .01), y0 + 1.3, 0, h);
      const sh = mesh(new THREE.BoxGeometry(.05, .8, 1.0), hutWall, sd * (W / 2 + .36), y0 + 1.52, 0, h); sh.rotation.z = sd * 1.1;
    });
    // a bamboo rail round the verandah, open where the ladder comes up
    const rz = D / 2 + VD - .05, lx = -left * (W / 2 - .7), ry2 = y0 + .65;
    [[-W / 2, lx - .45], [lx + .45, W / 2]].forEach(([a, b]) => { if (b - a > .1) mesh(new THREE.BoxGeometry(b - a, .07, .07), hutSlat, (a + b) / 2, ry2, rz, h); });
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.07, .07, VD), hutSlat, sd * W / 2, ry2, D / 2 + VD / 2, h));
    // the ladder down from the verandah to the land in front
    let dz = .5;
    for (let i = 0; i < 2; i++) dz = Math.max(.5, (y0 - gAt(lx, rz + dz)) * .4);
    const foot = gAt(lx, rz + dz), rise = y0 - foot, L = Math.hypot(rise, dz), tilt = Math.atan2(dz, rise);
    [-.3, .3].forEach(ox => { const rl = mesh(new THREE.BoxGeometry(.07, L + .3, .07), teakPost, lx + ox, foot + rise / 2, rz + dz / 2, h); rl.rotation.x = -tilt; });
    const n = Math.max(2, Math.floor(rise / .32));
    for (let i = 1; i <= n; i++) { const t = i / (n + 1); mesh(new THREE.BoxGeometry(.6, .05, .06), hutSlat, lx, foot + rise * t, rz + dz * (1 - t), h); }
    // the steep thatched gable roof, its ridge along x, with deep eaves; the gables filled with bamboo mat
    const ex = W / 2 + .6, zc = VD / 2, b = (D + VD) / 2 + .6, rh = b * .95, sl = Math.hypot(b, rh), a = Math.atan2(rh, b);
    [-1, 1].forEach(sd => {
      const m = mesh(new THREE.BoxGeometry(ex * 2, .22, sl), hutThatch, 0, ye + rh / 2 + .11, zc + sd * b / 2, h); m.rotation.x = sd * a;
      if (sd < 0) clickable(picks.pagoda, m, HUT_TIP);
    });
    mesh(new THREE.BoxGeometry(ex * 2 + .1, .2, .4), hutRidge, 0, ye + rh + .14, zc, h);
    const roofAt = zz => rh * (1 - Math.abs(zz - zc) / b);
    const gs = new THREE.Shape(); gs.moveTo(-D / 2, 0); gs.lineTo(D / 2, 0); gs.lineTo(D / 2, roofAt(D / 2)); gs.lineTo(zc, rh); gs.lineTo(-D / 2, roofAt(-D / 2)); gs.closePath();
    const gg = new THREE.ShapeGeometry(gs); gg.rotateY(-Math.PI / 2);
    [-1, 1].forEach(sd => mesh(gg, hutGable, sd * W / 2, ye, 0, h));
    // a clay water pot on the verandah, firewood under the floor, and an oil lamp hung from the verandah eave, lit at night
    const pot = mesh(new THREE.SphereGeometry(.26, 10, 8), hutPot, left * (W / 2 - .45), y0 + .26, D / 2 + VD / 2, h); pot.scale.y = 1.15;
    if (y0 - gAt(0, 0) > 1) { const fw = mesh(new THREE.BoxGeometry(1.4, .45, .5), std({ color: 0x6a4a2a, roughness: 1 }), -left * W / 5, gAt(-left * W / 5, -D / 4) + .2, -D / 4, h); fw.castShadow = false; }
    mesh(new THREE.CylinderGeometry(.005, .005, .4, 3), steel, left * W / 4, ye - .2, rz - .1, h);
    mesh(new THREE.CylinderGeometry(.07, .09, .16, 8), hutLamp, left * W / 4, ye - .48, rz - .1, h);
    const gl = glowSprite(0xffb060, 1.4, .8 * (1 - daylight) * (1 - FEST.out)); gl.position.set(left * W / 4, ye - .48, rz - .1); h.add(gl); hutGlows.push(gl);
    // keep the outside camera above the hut
    const R = Math.max(ex, b) + .5, cx = x + zc * s, cz = z + zc * c;
    TALL.push({ x0: cx - R, x1: cx + R, z0: cz - R, z1: cz + R, h: ye + rh + .3 });
    return { y0 };
  }
  // huts on the foot of the stupa hill, facing the footpath that runs along the lowest terrace from the stair (lit by village
  // lamps): the verandah and a short ladder on the terrace, the back of the hut out over the last slope on stilts
  function hillHuts(g) {
    const { cx, cz } = HILL, t = HILL.terraces[HILL.terraces.length - 1], th = Math.atan2(HILL.to[1] - cz, HILL.to[0] - cx);
    const offs = [-.23, -.4, -.57, -.74, -.91, -1.1, -1.3, -1.48, .21, .37];   // round the hill from the stair (world angle)
    const at = (a, rr) => [cx + Math.cos(a) * rr, cz + Math.sin(a) * rr];
    offs.forEach((o, i) => {
      const a = th + o, W = 4.2 + (i % 3) * .4, D = 3.8 + (i % 2) * .4, [x, z] = at(a, t.r1 - .2 + D / 2);   // verandah edge 1.6 m in from the terrace edge
      villageHut(g, x, z, Math.atan2(-Math.cos(a), -Math.sin(a)), { W, D, seed: 500 + i, lift: .55 });
    });
    // the footpath along the terrace, stopping either side of the stair landing; east of it, on to the foot of the third monastery's stair
    const PR = t.r1 - 3.6, path = std({ color: 0x8a7458, roughness: 1, side: THREE.DoubleSide });
    [[th - 1.55, 1.5], [th + .05, wihanSpot().footA - .05]].forEach(([a0, len]) => {
      const m = flat(mesh(new THREE.RingGeometry(PR - .8, PR + .8, Math.ceil(len * 40), 1, a0, len), path, cx, t.y - .05, cz, g));
      m.rotation.x = Math.PI / 2; m.receiveShadow = true;
    });
    // lamps between the huts, on the hut side of the path, their arms out over it
    const lamps = [];
    [-1.4, -1.2, -1.0, -.82, -.65, -.48, -.31, -.12, .12, .3].forEach(o => {
      const a = th + o, [x, z] = at(a, PR + 1.3);
      lamps.push([o, villageLamp(g, x, t.y - .08, z, Math.atan2(Math.sin(a), -Math.cos(a)))]);
    });
    lampWires(g, lamps.filter(([o]) => o < 0).map(l => l[1]));
    lampWires(g, lamps.filter(([o]) => o > 0).map(l => l[1]));
  }
  // a small village of bamboo huts west of the town, off the street, either side of a dirt lane lit by lamps on bamboo poles,
  // with banana clumps and shade trees in the yards
  function hutVillage(g) {
    const X = -97, Z0 = 5, Z1 = 47.6,   // the lane runs from the street to the hospital's forecourt
      dirt = std({ color: 0x8a7458, roughness: 1 });
    flat(mesh(new THREE.BoxGeometry(3, .04, Z1 - Z0), dirt, X, .03, (Z0 + Z1) / 2, g)).receiveShadow = true;
    // the two huts nearest the hospital were taken down when it was rebuilt (its south wing and garden stand there); their
    // places stay in the list as null so the other huts keep their seeds
    [[X - 6.2, 40, Math.PI / 2], [X - 6.2, 30, Math.PI / 2], [X - 6.6, 19, Math.PI / 2], null,
     [X + 6.2, 36, -Math.PI / 2], [X + 6.4, 24.5, -Math.PI / 2], null]
      .forEach((p, i) => {
        if (!p) return;
        const [x, z, ry] = p;
        const W = 4.4 + (i % 3) * .4, D = 3.8 + (i % 2) * .5, seed = 600 + i, sd = ry > 0 ? -1 : 1;   // sd: the side of the lane it stands on
        villageHut(g, x, z, ry, { W, D, seed });
        // its yard, fenced from the lane edge to a little behind the hut, with the gate in front of the ladder
        const lx = -(seed % 2 ? 1 : -1) * (W / 2 - .7), back = x + sd * (D / 2 + 1.4), front = X + sd * 1.7, hw = W / 2 + 1.3;
        yardFence(g, Math.min(front, back), Math.max(front, back), z - hw, z + hw, sd < 0 ? "+x" : "-x", sd < 0 ? z - lx : z + lx);
      });
    lampWires(g, [44, 30, 18, 6].map(z => villageLamp(g, X + 1.9, 0, z, Math.PI, true)));   // in the gaps between the east huts' ladders
    [[X - 4, 46], [X + 4, 45], [X - 11, 25], [X - 11.5, 36]].forEach(([x, z], i) => banana(g, x, z, 700 + i));
    [[X - 12.5, 30.2], [X - 12, 21.1]].forEach(([x, z], i) => tree(g, x, z, .85 + i * .08, 720 + i));   // in the gaps between the road houses
  }
  // a village yard fence of split bamboo: posts about a metre apart carrying two rails, round the rectangle x0..x1, z0..z1, with
  // a gate 1.4 m wide in the `side` ("+x" or "-x") centred on gz, between two taller posts
  const fenceBamboo = std({ color: 0xa88c56, roughness: .9 }), fencePostGeo = new THREE.CylinderGeometry(.04, .05, 1, 5), fenceRailGeo = new THREE.BoxGeometry(1, .05, .05);
  function yardFence(g, x0, x1, z0, z1, side, gz) {
    const GW = .7, gx = side === "+x" ? x1 : x0;
    const run = (ax, az, bx, bz) => {   // one straight run of fence on the land
      const L = Math.hypot(bx - ax, bz - az); if (L < .1) return;
      const n = Math.max(1, Math.round(L / 1.1)), ry = Math.atan2(bx - ax, bz - az) + Math.PI / 2;
      for (let i = 0; i <= n; i++) { const px = ax + (bx - ax) * i / n, pz = az + (bz - az) * i / n, y = terrainAt(px, pz); part(fencePostGeo, fenceBamboo, px, y + .5, pz, g); }
      const mx = (ax + bx) / 2, mz = (az + bz) / 2, y = terrainAt(mx, mz);
      [.35, .8].forEach(h => { const r = part(fenceRailGeo, fenceBamboo, mx, y + h, mz, g); r.rotation.y = ry; r.scale.x = L; });
      sRect(g, Math.min(ax, bx) - .05, Math.max(ax, bx) + .05, Math.min(az, bz) - .05, Math.max(az, bz) + .05, 1);
    };
    const gzc = clamp(gz, z0 + GW + .2, z1 - GW - .2), ox = side === "+x" ? x0 : x1;
    run(x0, z0, x1, z0); run(x0, z1, x1, z1); run(ox, z0, ox, z1);
    run(gx, z0, gx, gzc - GW); run(gx, gzc + GW, gx, z1);
    [-GW, GW].forEach(o => { const y = terrainAt(gx, gzc + o); part(fencePostGeo, fenceBamboo, gx, y + .65, gzc + o, g).scale.set(1.4, 1.3, 1.4); });
  }
  // houses along the east side of the road up to the hospital, facing the football ground across it: town houses of concrete
  // and wood, one and two storeys, with small gardens behind backing onto the hut village's yards
  function hospitalRoadHouses(g) {
    const KINDS = [[true, 1], [false, 2], [true, 2], [false, 1], [true, 1]], FRONT = -120;   // FRONT: the road's verge edge
    [[5.5, 6.5, 6], [13.8, 6, 6.5], [21.8 + .6, 7, 6], [31, 6, 6.5], [38.8, 6.5, 6]].forEach(([z0, W, D], i) => {
      const [wood, floors] = KINDS[i], seed = 760 + i, x = FRONT + D / 2 + 2.9, z = z0 + W / 2;
      if (wood) shanWoodHouse(g, x, z, -Math.PI / 2, { W, D, floors, seed, roof: seed % 3 ? rustRoof : ROOFS[seed % 4](1) });
      else shanHouse(g, x, z, -Math.PI / 2, { W, D, floors, shop: false, seed, wall: WALLS[(seed * 5) % WALLS.length], roof: ROOFS[seed % 4] });
    });
    [[-117.5, 13.1], [-117.5, 37.6]].forEach(([x, z], i) => banana(g, x, z, 780 + i));   // in the gaps between them, by the road
  }
