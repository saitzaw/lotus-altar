  /* ---------- the town on the west side: a modern road and houses in the style of Northern Shan State today ----------
     two-storey painted concrete houses and shophouses with corrugated-metal roofs, steel balcony railings, rolling shutters,
     blue water tanks and air-conditioners; nothing in temple style */
  const TOWN = { roadX: -41.5, roadW: 6.5, z0: -26, z1: 47.5 };
  // the four back lanes (see backStreets); `mouth`: the lane opens onto the street, so the pavement and its lamps stop there
  const LANES = [
    { x0: -22, x1: 43.25, z0: 75.25, z1: 79.75 },                // the back lane behind the houses on the street's south side
    { x0: -2.25, x1: 2.25, z0: 71.2, z1: 107 },                  // the plaza lane, south from the plaza opposite the gate
    { x0: 38.75, x1: 43.25, z0: 60.8, z1: 160.5, mouth: true },  // the market lane, beside the daily market, past the high school
    { x0: -73, x1: -68.5, z0: -24, z1: 50, mouth: true },        // the west lane, a row back from the houses on the town road
    { x0: -10, x1: 38.75, z0: 155.5, z1: 160.5 },                // the palace lane, from the market lane's end past the Haw Kham to the hill's east stair
    { x0: 38.75, x1: 43.25, z0: 160.5, z1: 255.5 },              // the market lane on along the Haw Kham's east wall (hawKham(g, 16, 204, π): the wall at x 38)
    { x0: -118, x1: 43.25, z0: 255.5, z1: 261.5, main: true },   // the Hluttaw road, between the Haw Kham's front wall (z 254) and the Hluttaw's compound (z 262.5), on west along the palace lake's north shore
    { x0: 43.25, x1: 64.5, z0: 255.5, z1: 261.5, main: true },     // the court road, the Hluttaw road on east past the bank to the township court's gate (z 262.5)
    { x0: -206.5, x1: -118, z0: 255.5, z1: 261.5, main: true },   // the Hluttaw road on west past the north stair's walk to Stadium Road (SQ, stadiumQuarter)
    { x0: 64.5, x1: 162.5, z0: 255.5, z1: 261.5, main: true },    // the court road on east past Ward No. 5, the municipal and immigration offices and the power station (28e) to the east road's mouth (EAST_ROAD, 28f)
    { x0: 88, x1: 92, z0: 196, z1: 255.5 },                       // Ward No. 5's lane, off the main road beside the Shan house next to the bank (WARD5)
    { x0: 43.25, x1: 118, z0: 104.5, z1: 108.5 },                // Ward No. 4's lane in from the market lane, between the daily market and the school wall (WARD4)
    { x0: 114, x1: 118, z0: 81, z1: 199.5 }                      // Ward No. 4's own lane, north–south through the inner quarter (WARD4)
  ];   // `main`: one stretch of the town's main road, asphalt with lamps down a centre median (see mainRoad)
  const MAIN_GAPS = [[-207, -192], [-33.5, -26.5], [13, 19], [37.5, 53], [79, 96], [114, 128], [150, 170]];   // where the main road's median breaks (along x): at Stadium Road's mouth (x −200), at the palace lake's bridge (x −30), before the Haw Kham's and the Hluttaw's gates (x 16), from the market lane's mouth to the court's gate (x 50), at Ward No. 5's lane and the municipal office's gate (x 85–90), at the immigration office's and power station's gates (x 121), and at the east road's mouth (x 159), where the median ends
  const corrugated = (base, light, dark) => {
    const t = canvasTex(64, (c, sz) => {
      for (let x = 0; x < sz; x += 8) {
        const gr = c.createLinearGradient(x, 0, x + 8, 0); gr.addColorStop(0, dark); gr.addColorStop(.5, light); gr.addColorStop(1, dark);
        c.fillStyle = gr; c.fillRect(x, 0, 8, sz);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  };
  const ROOFS = [["#2f6a4a", "#4f9a6e", "#1f4a34"], ["#a83228", "#d0584a", "#7a2018"], ["#2f5a8e", "#5486c0", "#1f3a60"], ["#8a8c8e", "#c0c4c8", "#5e6064"]]
    .map(([b, l, d]) => { const tex = corrugated(b, l, d); return repX => { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(repX, 1); return std({ map: t, roughness: .45, metalness: .45, side: THREE.DoubleSide }); }; });
  const WALLS = [0xf2e2b0, 0xe8c8c8, 0xc8dce8, 0xf4f0e4, 0xd8e8c8, 0xf0d0a0].map(c => std({ color: c, roughness: .85 }));
  const townGlass = std({ color: 0x2a3a44, roughness: .2, metalness: .3, emissive: 0xffd8a0, emissiveIntensity: 0 });
  const townFrame = std({ color: 0xf4f4f0, roughness: .6 }), steel = std({ color: 0x5a5e62, roughness: .4, metalness: .7 });
  const concrete = std({ color: 0xb8b4ac, roughness: .9 }), tile = std({ color: 0xc8a888, roughness: .7 });
  const shutterTex = canvasTex(64, (c, sz) => { c.fillStyle = "#9aa0a4"; c.fillRect(0, 0, sz, sz); c.fillStyle = "#6e7478"; for (let y = 0; y < sz; y += 6) c.fillRect(0, y, sz, 2); });
  shutterTex.wrapS = shutterTex.wrapT = THREE.RepeatWrapping;
  const shutter = std({ map: shutterTex, roughness: .5, metalness: .5 }), tank = std({ color: 0x2a6ac0, roughness: .5 });
  const houseGlass = townGlass.clone();   // the houses' windows, which go dark on Halloween night; public buildings keep townGlass
  onDaylight(d => { townGlass.emissiveIntensity = .9 * (1 - d) + .02; houseGlass.emissiveIntensity = .9 * (1 - d) * (1 - FEST.out) + .02; });
  // one house in local coordinates: front faces +z, width W along x, depth D, `floors` storeys, a shop on the ground floor or not
  const balusterGeo = new THREE.BoxGeometry(.03, .9, .03), plantGeo = new THREE.IcosahedronGeometry(.22, 0);
  function shanHouse(g, x, z, ry, o) {
    const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
    sRect(h, -o.W / 2, o.W / 2, -o.D / 2, o.D / 2);
    const { W, D, floors, shop, wall, roof, seed } = o, r = rng(seed), FH = 3.1;
    mesh(new THREE.BoxGeometry(W + .6, .25, D + 2.2), concrete, 0, .125, .9, h);                       // the slab and front apron
    for (let f = 0; f < floors; f++) {
      const y0 = .25 + f * FH;
      mesh(new THREE.BoxGeometry(W, FH, D), wall, 0, y0 + FH / 2, 0, h);
      mesh(new THREE.BoxGeometry(W + .1, .18, D + .1), townFrame, 0, y0 + FH - .09, 0, h);           // white floor band
      const win = (wx, wy, ww, wh, zf) => {
        mesh(new THREE.BoxGeometry(ww + .16, wh + .16, .08), townFrame, wx, wy, zf, h);
        mesh(new THREE.BoxGeometry(ww, wh, .1), houseGlass, wx, wy, zf + .01, h);
        mesh(new THREE.BoxGeometry(.04, wh, .12), townFrame, wx, wy, zf + .02, h);
      };
      if (f === 0 && shop) {   // a shopfront: two bays with rolling shutters, one rolled up over a glass front, and a signboard
        const bw = (W - .8) / 2;
        [-1, 1].forEach((sd, i) => {
          const bx = sd * (bw / 2 + .2);
          if (i === (seed % 2)) { win(bx, y0 + 1.25, bw - .2, 2.3, D / 2); mesh(new THREE.BoxGeometry(bw, .45, .25), shutter, bx, y0 + 2.75, D / 2 + .1, h); }
          else { const sh = mesh(new THREE.BoxGeometry(bw, 2.7, .08), shutter, bx, y0 + 1.35, D / 2 + .04, h); sh.material = shutter; }
        });
        const signCol = [0xc02020, 0x1a5aa0, 0xe8b020, 0x2a8a4a][seed % 4];
        mesh(new THREE.BoxGeometry(W - .4, .7, .12), std({ color: signCol, roughness: .5, emissive: signCol, emissiveIntensity: .15 }), 0, y0 + FH - .55, D / 2 + .1, h);
        mesh(new THREE.BoxGeometry(W + .4, .08, 1.6), steel, 0, y0 + FH - .1, D / 2 + .8, h);          // a metal awning over the shopfront
      } else if (f === 0) {   // a house: front door between two windows
        mesh(new THREE.BoxGeometry(1.1, 2.3, .1), std({ color: 0x7a4a2a, roughness: .6 }), 0, y0 + 1.15, D / 2 + .02, h);
        [-1, 1].forEach(sd => win(sd * (W / 4 + .3), y0 + 1.5, 1.4, 1.3, D / 2));
      } else {   // upper floors: a glass balcony door and windows, a concrete balcony with a steel railing
        win(-W / 4, y0 + 1.25, 1.3, 2.2, D / 2);
        win(W / 4, y0 + 1.6, 1.5, 1.3, D / 2);
        mesh(new THREE.BoxGeometry(W - .4, .16, 1.3), concrete, 0, y0 + .08, D / 2 + .65, h);
        mesh(new THREE.BoxGeometry(W - .4, .05, .06), steel, 0, y0 + 1.05, D / 2 + 1.27, h);
        for (let i = 0; i <= 16; i++) part(balusterGeo, steel, -W / 2 + .25 + i * (W - .5) / 16, y0 + .6, D / 2 + 1.27, h);
        if (r() < .7) { const ac = mesh(new THREE.BoxGeometry(.8, .55, .3), townFrame, W / 2 - .7, y0 + 2.3, D / 2 + .16, h); ac.castShadow = false; }
        if (r() < .5) for (let k = 0; k < 3; k++) part(plantGeo, leafMats[k % 4], -W / 2 + .6 + k * .5, y0 + .45, D / 2 + 1.0, h);   // potted plants
      }
    }
    const top = .25 + floors * FH;
    // a low-pitched gable roof of corrugated metal, ridge running across the front, with a deep overhang
    const pitch = .32, half = D / 2 + .8, len = half / Math.cos(pitch);
    [-1, 1].forEach(sd => {
      const p = mesh(new THREE.BoxGeometry(W + 1.0, .06, len), roof(W / 1.5), 0, top + Math.tan(pitch) * half / 2, sd * half / 2, h);
      p.rotation.x = sd * pitch;
    });
    mesh(new THREE.BoxGeometry(W + 1.05, .12, .2), steel, 0, top + Math.tan(pitch) * half + .02, 0, h);
    [-1, 1].forEach(sd => {   // the gable ends, painted like the walls
      const sh = new THREE.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(0, Math.tan(pitch) * D / 2); sh.closePath();
      const gab = mesh(new THREE.ShapeGeometry(sh), wall, sd * W / 2, top, 0, h); gab.rotation.y = sd * Math.PI / 2; gab.material.side = THREE.DoubleSide;
    });
    // a blue water tank on a steel stand beside the house, as on most houses in Shan towns
    if (r() < .75) {
      const tx = (r() < .5 ? -1 : 1) * (W / 2 - .7), tz = -D / 2 - .9, th = top - .4;
      [[-.45, -.45], [.45, -.45], [-.45, .45], [.45, .45]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(.08, th, .08), steel, tx + a, th / 2, tz + b, h));
      mesh(new THREE.BoxGeometry(1.1, .08, 1.1), steel, tx, th, tz, h);
      mesh(new THREE.CylinderGeometry(.5, .5, 1.1, 16), tank, tx, th + .6, tz, h);
      mesh(new THREE.CylinderGeometry(.18, .18, .08, 12), tank, tx, th + 1.18, tz, h);
    }
    // a low front wall with a sliding steel gate for houses
    if (!shop) {
      const fz = D / 2 + 2.0;
      [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(W / 2 - 1.2, .9, .2), wall, sd * (W / 4 + .6), .45, fz, h));
      mesh(new THREE.BoxGeometry(2.4, 1.1, .05), steel, 0, .55, fz, h);
    }
  }
  // a modern street light: a tall steel pole by the kerb, a long arm out over the road and a flat white lamp head that
  // glows at night. The arm points along local -x turned by `ry` (0: west, PI / 2: south, -PI / 2: north)
  const lightPoleG = new THREE.CylinderGeometry(.07, .1, 5.2, 8), lightArmG = new THREE.BoxGeometry(1.6, .07, .07), lightHeadG = new THREE.BoxGeometry(.5, .1, .25);
  // `ry` one turn or a list of them, one arm and head for each; `pool`: each head throws a pool of light on the road at night
  function streetLight(g, x, z, ry, pool) {
    sCircle(g, x, z, .12);
    mesh(lightPoleG, steel, x, 2.6, z, g);
    [].concat(ry).forEach(r => {
      const c = Math.cos(r), s = Math.sin(r), hx = x - 1.5 * c, hz = z + 1.5 * s;
      mesh(lightArmG, steel, x - .8 * c, 5.15, z + .8 * s, g).rotation.y = r;
      const head = mesh(lightHeadG, std({ color: 0xf8f4e8, emissive: 0xfff2d0, emissiveIntensity: 1 }), hx, 5.08, hz, g); head.rotation.y = r;
      const gl = glowSprite(0xfff0d0, 2.6, .7); gl.position.set(hx, 4.95, hz); g.add(gl);
      const pl = pool && flat(mesh(new THREE.CircleGeometry(3.2, 20), lampPool, hx, .08, hz, g));
      if (pl) { pl.rotation.x = -Math.PI / 2; pl.receiveShadow = false; }
      onDaylight(d => { gl.material.opacity = .7 * (1 - d); head.material.emissiveIntensity = 1 - .8 * d; });
      poleLights.push({ x: hx, z: hz, set: lit => { gl.material.opacity = lit ? .7 * (1 - daylight) : 0; head.material.emissiveIntensity = lit ? 1 - .8 * daylight : 0; if (pl) pl.visible = lit; } });
    });
  }
  // the main road past the Haw Kham's front gate and the Hluttaw to the township court (the `main` lanes): asphalt between open
  // drains, and down its middle a kerbed concrete median carrying twin street lights, one arm out over each carriageway
  function mainRoad(g) {
    const ls = LANES.filter(l => l.main), x0 = Math.min(...ls.map(l => l.x0)), x1 = Math.max(...ls.map(l => l.x1)), { z0, z1 } = ls[0];
    const w = x1 - x0, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, y = .05;
    flat(mesh(new THREE.BoxGeometry(w, .04, z1 - z0), std({ color: 0x2c2c2e, roughness: .95 }), mx, y, mz, g));
    const drain = std({ color: 0x3a3632, roughness: .9 }), line = std({ color: 0xe8e4d8, roughness: .8 });
    // the open drains and white edge lines down both sides; on the south side they stop at the mouths of the lanes and the east
    // road that come in there (the drain runs under the junction in a culvert). At the east end, where the road turns south into
    // the east road, an edge line closes it
    const mouths = LANES.filter(l => !l.main && l.z1 === z0).map(l => [l.x0, l.x1]).concat([[EAST_ROAD.x0, EAST_ROAD.x1]]).sort((a, b) => a[0] - b[0]);
    [-1, 1].forEach(sd => {
      const runs = []; let a = x0;
      if (sd < 0) mouths.forEach(([m0, m1]) => { if (m0 > a) runs.push([a, m0]); a = Math.max(a, m1); });
      if (x1 > a) runs.push([a, x1]);
      runs.forEach(([a, b]) => {
        flat(mesh(new THREE.BoxGeometry(b - a, .045, .35), drain, (a + b) / 2, y + .002, mz + sd * ((z1 - z0) / 2 - .18), g));
        flat(mesh(new THREE.BoxGeometry(b - a, .02, .1), line, (a + b) / 2, y + .02, mz + sd * ((z1 - z0) / 2 - .5), g));   // the white edge lines
      });
    });
    flat(mesh(new THREE.BoxGeometry(.1, .02, z1 - z0 - .45), line, x1 - .5, y + .02, mz - .225, g));   // from the mouth to the north edge line
    // the median in pieces between the gaps, a lamp every 10 m or so along each
    const kerb = std({ color: 0xb0aca2, roughness: .8 }), segs = [];
    let a = x0 + 3;
    MAIN_GAPS.forEach(([g0, g1]) => { segs.push([a, g0]); a = g1; });
    segs.push([a, x1 - 2.5]);
    segs.filter(([a, b]) => b - a > 4).forEach(([a, b]) => {
      mesh(new THREE.BoxGeometry(b - a, .16, .6), kerb, (a + b) / 2, y + .08, mz, g);
      const n = Math.ceil((b - a) / 10);
      for (let k = 0; k < n; k++) streetLight(g, a + (k + .5) * (b - a) / n, mz, [Math.PI / 2, -Math.PI / 2], true);
    });
  }
  function shanTown(g) {
    const { roadX, roadW, z0, z1 } = TOWN, len = z1 - z0, mid = (z0 + z1) / 2;
    // asphalt with a dashed centre line and kerbed concrete pavements
    flat(mesh(new THREE.BoxGeometry(roadW, .04, len), std({ color: 0x2c2c2e, roughness: .95 }), roadX, .02, mid, g));
    const dash = new THREE.InstancedMesh(new THREE.BoxGeometry(.14, .02, 2.2), std({ color: 0xe8e4d8, roughness: .8 }), 20), m4 = new THREE.Matrix4();
    for (let i = 0; i < 20; i++) dash.setMatrixAt(i, m4.makeTranslation(roadX, .05, z0 + 2 + i * (len - 4) / 19));
    g.add(dash);
    [-1, 1].forEach(sd => {
      const px = roadX + sd * (roadW / 2 + .8);
      mesh(new THREE.BoxGeometry(1.6, .18, len), std({ color: 0x8a867e, roughness: .9 }), px, .09, mid, g);
      mesh(new THREE.BoxGeometry(.14, .2, len), std({ color: 0xb0aca2, roughness: .8 }), roadX + sd * roadW / 2, .1, mid, g);
    });
    // modern street lights on the east pavement, their arms out over the road
    for (let z = z0 + 4; z < z1 - 2; z += 12) streetLight(g, roadX + roadW / 2 + 1.1, z, 0);
    // a row of trees in the strip between the temple wall and the road
    for (let z = z0 + 8; z < z1 - 4; z += 9) (Math.round(z) % 2 ? pine : tree)(g, -35.3, z, .7, 70 + z | 0);
    // houses along the west side of the road, facing it
    const plots = [
      { W: 8, D: 7, floors: 2, shop: true, wall: 0, roof: 1 }, { W: 7, D: 7, floors: 2, shop: false, wall: 2, roof: 0 },
      { W: 9, D: 8, floors: 3, shop: true, wall: 3, roof: 2 }, { W: 7, D: 7, floors: 1, shop: false, wall: 4, roof: 3 },
      { W: 8, D: 7, floors: 2, shop: true, wall: 1, roof: 0 }, { W: 7, D: 7, floors: 2, shop: false, wall: 5, roof: 1 },
      { W: 8, D: 8, floors: 2, shop: true, wall: 2, roof: 2 }
    ];
    let z = z1 - 4;
    plots.forEach((p, i) => {
      const front = roadX - roadW / 2 - 1.6;
      shanHouse(g, front - p.D / 2 - 2.4, z - p.W / 2, Math.PI / 2, { ...p, wall: WALLS[p.wall], roof: ROOFS[p.roof], seed: i + 3 });
      z -= p.W + 2.2;
    });
    riverCrossing(g);
    waterfall(g);
    paddyFields(g);
    mountainsAndForest(g);
  }
  // the town road carried over the stream on a modern concrete bridge, then on south between the fields
  const riverZ = x => -30 + Math.sin(x * .045) * 3.2 + Math.sin(x * .11 + 1) * 1.1;   // the stream's centre line (see stream())
  function riverCrossing(g) {
    const { roadX: X, roadW } = TOWN, zc = riverZ(X), DH = .9, half = 3.6, ramp = 2.6, BW = roadW + 2.2;
    const asphalt = std({ color: 0x2c2c2e, roughness: .95 }), conc = std({ color: 0xb4b0a8, roughness: .85 });
    const zN = zc + half, zS = zc - half;
    // the deck with a walkway each side, and ramps up from the road at both ends
    mesh(new THREE.BoxGeometry(BW, .35, half * 2), conc, X, DH - .175, zc, g);
    flat(mesh(new THREE.BoxGeometry(roadW, .04, half * 2), asphalt, X, DH + .02, zc, g));
    [[zN, 1], [zS, -1]].forEach(([z0, dir]) => {
      const len = Math.hypot(ramp, DH), a = Math.atan2(DH, ramp);
      const r = mesh(new THREE.BoxGeometry(BW, .3, len), conc, X, DH / 2 - .15, z0 + dir * ramp / 2, g); r.rotation.x = dir * a;
      const ra = flat(mesh(new THREE.BoxGeometry(roadW, .04, len), asphalt, X, DH / 2 + .02, z0 + dir * ramp / 2, g)); ra.rotation.x = dir * a;
    });
    // abutments on each bank and parapets: a low concrete wall with a steel rail along both edges
    [zN - .4, zS + .4].forEach(z => mesh(new THREE.BoxGeometry(BW + .4, DH, .8), conc, X, DH / 2 - .3, z, g));
    const steelR = std({ color: 0x5a5e62, roughness: .4, metalness: .7 });
    [-1, 1].forEach(sd => {
      const x = X + sd * (BW / 2 - .1);
      mesh(new THREE.BoxGeometry(.2, .55, half * 2), conc, x, DH + .27, zc, g);
      mesh(new THREE.BoxGeometry(.06, .06, half * 2), steelR, x, DH + .95, zc, g);
      for (let i = 0; i <= 8; i++) mesh(new THREE.BoxGeometry(.05, .45, .05), steelR, x, DH + .72, zN - i * half / 4, g);
      [-1, 1].forEach(e => { mesh(new THREE.BoxGeometry(.3, 1.1, .3), conc, x, DH + .5, zc + e * half, g); });   // end posts
    });
    // the road on from the bridge, south between the fields, with a dashed centre line
    const zA = zS - ramp, zB = -96;
    flat(mesh(new THREE.BoxGeometry(roadW, .04, zA - zB), asphalt, X, .02, (zA + zB) / 2, g));
    flat(mesh(new THREE.BoxGeometry(roadW, .04, -26 - (zN + ramp) + .1), asphalt, X, .02, (-26 + zN + ramp) / 2, g));   // up to the town road
    const n = Math.floor((zA - zB) / 5), dash = new THREE.InstancedMesh(new THREE.BoxGeometry(.14, .02, 2.2), std({ color: 0xe8e4d8, roughness: .8 }), n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) dash.setMatrixAt(i, m4.makeTranslation(X, .05, zA - 2.5 - i * 5));
    g.add(dash);
    [-1, 1].forEach(sd => flat(mesh(new THREE.BoxGeometry(1.2, .03, zA - zB), std({ color: 0x8a7a5e, roughness: 1 }), X + sd * (roadW / 2 + .6), .015, (zA + zB) / 2, g)));   // dirt verges
  }
