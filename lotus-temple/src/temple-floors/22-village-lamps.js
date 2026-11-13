  /* ---------- village lamps ---------- */
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
  const lampGlows = [];
  onDaylight(d => {
    lampBulb.emissiveIntensity = 1 - .85 * d; lampPool.opacity = .75 * (1 - d); lampGlows.forEach(s => s.material.opacity = .8 * (1 - d));
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
  // the footpath along the lowest terrace of the stupa hill from the stair, lit by village lamps on the slope side
  function hillFootpath(g) {
    const { cx, cz } = HILL, t = HILL.terraces[HILL.terraces.length - 1], th = Math.atan2(HILL.to[1] - cz, HILL.to[0] - cx);
    const at = (a, rr) => [cx + Math.cos(a) * rr, cz + Math.sin(a) * rr];
    // the footpath along the terrace, stopping either side of the stair landing; east of it, on to the foot of the third monastery's stair
    const PR = t.r1 - 3.6, path = std({ color: 0x8a7458, roughness: 1, side: THREE.DoubleSide });
    [[th - 1.55, 1.5], [th + .05, wihanSpot().footA - .05]].forEach(([a0, len]) => {
      const m = flat(mesh(new THREE.RingGeometry(PR - .8, PR + .8, Math.ceil(len * 40), 1, a0, len), path, cx, t.y - .05, cz, g));
      m.rotation.x = Math.PI / 2; m.receiveShadow = true;
    });
    // lamps along the slope side of the path, their arms out over it
    const lamps = [];
    [-1.4, -1.2, -1.0, -.82, -.65, -.48, -.31, -.12, .12, .3].forEach(o => {
      const a = th + o, [x, z] = at(a, PR + 1.3);
      lamps.push([o, villageLamp(g, x, t.y - .08, z, Math.atan2(Math.sin(a), -Math.cos(a)))]);
    });
    lampWires(g, lamps.filter(([o]) => o < 0).map(l => l[1]));
    lampWires(g, lamps.filter(([o]) => o > 0).map(l => l[1]));
  }
  // the lane from the street up to the hospital's forecourt, between the blood bank and the nursing college (where a small village
  // of bamboo huts once stood), lit by lamps on bamboo poles, with a banana clump either side of its mouth
  function hospitalLane(g) {
    const X = -97, Z0 = 5, Z1 = 47.6, dirt = std({ color: 0x8a7458, roughness: 1 });
    flat(mesh(new THREE.BoxGeometry(3, .04, Z1 - Z0), dirt, X, .03, (Z0 + Z1) / 2, g)).receiveShadow = true;
    lampWires(g, [44, 30, 18, 6].map(z => villageLamp(g, X + 1.9, 0, z, Math.PI, true)));   // along the college's side, their arms out over the lane
    [[X - 4, 46], [X + 4.5, 46.2]].forEach(([x, z], i) => banana(g, x, z, 700 + i));
  }
  // houses along the east side of the road up to the hospital, facing the football ground across it: town houses of concrete
  // and wood, one and two storeys, with small gardens behind backing onto the blood bank
  function hospitalRoadHouses(g) {
    const KINDS = [[true, 1], [false, 2], [true, 2], [false, 1], [true, 1]], FRONT = -120;   // FRONT: the road's verge edge
    [[5.5, 6.5, 6], [13.8, 6, 6.5], [21.8 + .6, 7, 6], [31, 6, 6.5], [38.8, 6.5, 6]].forEach(([z0, W, D], i) => {
      const [wood, floors] = KINDS[i], seed = 760 + i, x = FRONT + D / 2 + 2.9, z = z0 + W / 2;
      if (wood) shanWoodHouse(g, x, z, -Math.PI / 2, { W, D, floors, seed, roof: seed % 3 ? rustRoof : ROOFS[seed % 4](1) });
      else shanHouse(g, x, z, -Math.PI / 2, { W, D, floors, shop: false, seed, wall: WALLS[(seed * 5) % WALLS.length], roof: ROOFS[seed % 4] });
    });
    [[-117.5, 13.1], [-117.5, 37.6]].forEach(([x, z], i) => banana(g, x, z, 780 + i));   // in the gaps between them, by the road
  }
