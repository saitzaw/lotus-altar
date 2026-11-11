  /* ---------- the council's compound across the road from the Haw Kham's front gate, after the owner's old photographs: a
     whitewashed wall round it with a gate toward the palace; the Hluttaw (in Shan ႁူင်းႁေႃၸုမ်းၽွင်းမိူင်း, `SHAN_NAMES.council`), the council of state, a small one-floor
     teak hall raised on posts with a slatted balustrade round its verandah, two stairs at the front ends, a skirt roof of corrugated
     iron and crossed carved gables under a tiered pyatthat, face to face with the palace's main entrance; and by the gate the clock tower, a
     tall whitewashed base crenellated at the top, climbed by a steep stair along its side, four round white columns carrying a teak
     platform (up a ladder) and an open teak pavilion under two roofs, where the gong and the bell told the hours. G: the palace
     front's frame (local +z out from the main stair, x turned round so −x is west); hip: its roof maker; ZX: the compound's front
     wall's z ---------- */
  function councilCompound(G, list, hip, ZX) {
    const CX = 20, CZ = ZX + 24;   // the compound's half width, and its back wall
    const { teak, teakDark, roofM, white, flame, gable, pyatthat } = shanCarpentry();
    const red = std({ color: 0x8a1e14, roughness: .45 }), tile = std({ color: 0x7a2a1c, roughness: .7 });
    const C = new THREE.Group(); G.add(C);
    // the wall round it, lower than the palace's, open at the front in a gate under a little carved gable; gravel within
    flat(mesh(new THREE.BoxGeometry(2 * CX, .04, CZ - ZX), std({ color: 0xb8a888, roughness: 1 }), 0, .025, (ZX + CZ) / 2, C)).receiveShadow = true;
    [[-CX, -2.4, ZX, ZX], [2.4, CX, ZX, ZX], [-CX, CX, CZ, CZ], [-CX, -CX, ZX, CZ], [CX, CX, ZX, CZ]].forEach(([a, b, c, d]) => {
      const w = Math.max(b - a, .4), dd = Math.max(d - c, .4), mx = (a + b) / 2, mz = (c + d) / 2;
      mesh(new THREE.BoxGeometry(w, 1.8, dd), white, mx, .9, mz, C);
      mesh(new THREE.BoxGeometry(w + .2, .16, dd + .2), tile, mx, 1.88, mz, C);
      sRect(C, mx - w / 2, mx + w / 2, mz - dd / 2, mz + dd / 2);
    });
    [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(.7, 3, .7), white, sd * 2.6, 1.5, ZX, C); sRect(C, sd * 2.6 - .35, sd * 2.6 + .35, ZX - .35, ZX + .35); });
    mesh(new THREE.BoxGeometry(5.8, .4, 1), red, 0, 3.2, ZX, C);
    gable(C, 0, 3.4, ZX, 5.4, 1.6, 1.3);
    // the paved ways: in from the gate, across before the Hluttaw and round both its sides
    const ZH = ZX + 13, HW = 6, HD = 4;   // the Hluttaw's middle, half width and half depth
    const ZB = ZH + HD + 2, ZF = ZX + 3;   // the ways across behind the Hluttaw and before it
    [[ZB - .8, ZB + .8, 2 * HW + 6.6], [ZF - .8, ZF + .8, 2 * HW + 6.6], [ZX, ZF, 3.4]].forEach(([z0, z1, w], i) =>
      flat(mesh(new THREE.BoxGeometry(w, .05, z1 - z0), M.stone, 0, .045 + i * .001, (z0 + z1) / 2, C)));
    [-1, 1].forEach(sd => flat(mesh(new THREE.BoxGeometry(1.6, .05, ZB - ZF), M.stone, sd * (HW + 2.5), .049, (ZB + ZF) / 2, C)));
    C.traverse(o => { if (o.isMesh) clickable(list, o, { tip: "The Hluttaw's gate", toast: "The wall and gate of the compound of the Hluttaw, the council of state, across the road from the Haw Kham's front gate, where the palace clock tower also stands." }); });

    /* ---------- the Hluttaw, in its own frame H: its front (local +z) faces the palace ---------- */
    const H = new THREE.Group(); H.position.set(0, 0, ZH); H.rotation.y = Math.PI; G.add(H);
    const FH = 1.5, EV = FH + 2.6, n = 9, tread = .3, run = n * tread, SX = HW - 1;   // FH: the floor; EV: the eaves; SX: the stairs' middles
    // the posts it stands on, the plank floor on a dark beam, and the verandah's posts up to the eaves
    const leg = new THREE.CylinderGeometry(.14, .16, FH, 8), vpost = new THREE.CylinderGeometry(.11, .12, EV - FH, 8);
    for (let i = 0; i < 7; i++) for (let k = 0; k < 4; k++) part(leg, teakDark, -HW + .3 + i * (2 * HW - .6) / 6, FH / 2, -HD + .3 + k * (2 * HD - .6) / 3, H);
    mesh(new THREE.BoxGeometry(2 * HW, .3, 2 * HD), teakDark, 0, FH - .25, 0, H);
    mesh(new THREE.BoxGeometry(2 * HW + .1, .12, 2 * HD + .1), teak, 0, FH - .04, 0, H);
    const vp = [];
    for (let i = 0; i <= 6; i++) { const px = -HW + .2 + i * (2 * HW - .4) / 6; vp.push([px, HD - .2], [px, -HD + .2]); }
    for (let k = 1; k < 4; k++) { const pz = -HD + .2 + k * (2 * HD - .4) / 4; vp.push([-HW + .2, pz], [HW - .2, pz]); }
    vp.forEach(([px, pz]) => part(vpost, teak, px, (FH + EV) / 2, pz, H));
    [[0, HD - .2, 2 * HW, .2], [0, -HD + .2, 2 * HW, .2], [-HW + .2, 0, .2, 2 * HD], [HW - .2, 0, .2, 2 * HD]].forEach(([bx, bz, w, d]) => mesh(new THREE.BoxGeometry(w, .3, d), teakDark, bx, EV - .15, bz, H));
    // the balustrade round the verandah: dark panels with a band of slender turned balusters, a peaked cap on each post, open at the stair heads
    const balT = canvasTex(128, (c, s) => { c.fillStyle = "#3a1c0e"; c.fillRect(0, 0, s, s); c.fillStyle = "#c2a882"; c.fillRect(8, 34, s - 16, 60); c.fillStyle = "#2a1408"; for (let x = 12; x < s - 10; x += 9) c.fillRect(x, 34, 4, 60); c.fillStyle = "#5a2e16"; c.fillRect(0, 0, s, 8); c.fillRect(0, s - 10, s, 10); });
    balT.wrapS = THREE.RepeatWrapping;
    const rail = (x0, x1, z0, z1) => {
      const w = x1 - x0, d = z1 - z0, geo = new THREE.BoxGeometry(w, .8, d), uv = geo.attributes.uv, s = Math.max(w, d) / 1.1;
      for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * s);
      const t = balT.clone(); t.needsUpdate = true;
      mesh(geo, std({ map: t, roughness: .7 }), (x0 + x1) / 2, FH + .4, (z0 + z1) / 2, H);
      mesh(new THREE.BoxGeometry(w + .08, .08, d + .08), teakDark, (x0 + x1) / 2, FH + .84, (z0 + z1) / 2, H);
    };
    rail(-HW, -SX - .6, HD - .3, HD - .1); rail(-SX + .6, SX - .6, HD - .3, HD - .1); rail(SX + .6, HW, HD - .3, HD - .1);
    rail(-HW, HW, -HD + .1, -HD + .3); rail(-HW + .1, -HW + .3, -HD, HD); rail(HW - .3, HW - .1, -HD, HD);
    const cap = new THREE.ConeGeometry(.16, .4, 4);
    vp.forEach(([px, pz]) => part(cap, teakDark, px, FH + 1.08, pz, H));
    // the council room within: dark teak walls, three red doors on the front between gilt frames
    const RW = HW - 1.6, RD = HD - 1.6;
    mesh(new THREE.BoxGeometry(2 * RW, EV - FH, 2 * RD), teakDark, 0, (FH + EV) / 2, 0, H);
    [-2.6, 0, 2.6].forEach(dx => {
      mesh(new THREE.BoxGeometry(1.3, 2.2, .08), red, dx, FH + 1.1, RD + .03, H);
      [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.1, 2.3, .1), M.gold, dx + sd * .7, FH + 1.15, RD + .05, H));
      mesh(new THREE.BoxGeometry(1.5, .1, .1), M.gold, dx, FH + 2.3, RD + .05, H);
    });
    // the stairs at the front ends, straight down from the verandah between dark handrails
    const rise = FH / n;
    [-1, 1].forEach(sd => {
      for (let i = 0; i < n; i++) mesh(new THREE.BoxGeometry(1.1, FH - i * rise, tread), teak, sd * SX, (FH - i * rise) / 2, HD + (i + .5) * tread, H);
      [-1, 1].forEach(e => {
        const hr = mesh(new THREE.BoxGeometry(.08, .08, Math.hypot(run, FH) + .3), teakDark, sd * SX + e * .6, FH / 2 + .9, HD + run / 2, H); hr.rotation.x = Math.atan2(FH, run);
        mesh(new THREE.BoxGeometry(.1, .95, .1), teakDark, sd * SX + e * .6, .48, HD + run - .05, H);
        sRect(H, sd * SX + e * .6 - .06, sd * SX + e * .6 + .06, HD, HD + run);
      });
      sRect(H, sd * SX - .55, sd * SX + .55, HD, HD + run, (lx, lz) => FH * clamp((HD + run - lz) / run, 0, 1));
    });
    // walkable: the room blocks; the verandah, kept in by its balustrade but open at the stair heads
    sRect(H, -RW, RW, -RD, RD);
    sRect(H, -HW, HW, -HD, HD, (lx, lz) => (Math.abs(lx) > HW - .45 || Math.abs(lz) > HD - .45) && !(lz > 0 && Math.abs(Math.abs(lx) - SX) < .5) ? null : FH);
    // the roofs: a skirt roof from the verandah's beam to the room's walls, a dark clerestory, crossed carved gables, and the pyatthat
    hip([-HW - .9, HW + .9, -HD - .9, HD + .9], [-RW, RW, -RD, RD], EV - .3, EV + 1.1, H);
    mesh(new THREE.BoxGeometry(2 * RW, .8, 2 * RD), teakDark, 0, EV + 1.4, 0, H);
    gable(H, 0, EV + 1.8, 0, 4.4, 2 * RD + 1.4, 1.9);
    const X = new THREE.Group(); X.rotation.y = Math.PI / 2; H.add(X);
    gable(X, 0, EV + 1.8, 0, 4.4, 2 * RW - .6, 1.9);
    mesh(new THREE.BoxGeometry(1.8, 1.2, 1.8), teakDark, 0, EV + 3, 0, H);
    pyatthat(H, 0, EV + 3.4, 0, 2.6, 5, .14);
    bakeParts(H);
    const hData = { tip: `${SHAN_NAMES.council} · the Hluttaw, the council of state`, toast: `${SHAN_NAMES.council}, the Hluttaw, the council of state: a small one-floor teak hall raised on posts, with a slatted balustrade round its verandah, a stair at each end of its front and a tiered pyatthat over the council room. Here the saopha's ministers sat in council on the business of the state, the hall facing the palace's main entrance across the road, as in the old photographs.` };
    H.traverse(o => { if (o.isMesh) clickable(list, o, hData); });

    /* ---------- the clock tower, in its own frame T, inside the gate on the east side ---------- */
    const T = new THREE.Group(); T.position.set(13.5, 0, ZX + 5); G.add(T);
    const B0 = 5.6, B1 = 4.6, BH = 6.6, sq = (w0, w1, h) => { const geo = new THREE.CylinderGeometry(w1 / Math.SQRT2, w0 / Math.SQRT2, h, 4); geo.rotateY(Math.PI / 4); return geo; };
    // the base: a moulded foot, a whitewashed body narrowing upward with a string course and corner piers, a cornice and the crenellations
    mesh(new THREE.BoxGeometry(B0 + 1, .5, B0 + 1), white, 0, .25, 0, T);
    mesh(sq(B0, B1, BH - .5), white, 0, .5 + (BH - .5) / 2, 0, T);
    mesh(new THREE.BoxGeometry(B0 + .2, .22, B0 + .2), white, 0, 1.6, 0, T);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => mesh(sq(1.1, .9, BH - 1.7), white, a * (B0 / 2 - .35), 1.7 + (BH - 1.7) / 2, b * (B0 / 2 - .35), T));
    mesh(new THREE.BoxGeometry(B1 + .5, .3, B1 + .5), white, 0, BH + .15, 0, T);
    const merlon = new THREE.BoxGeometry(.42, .5, .26), mtop = new THREE.ConeGeometry(.24, .35, 4), corner = new THREE.BoxGeometry(.7, .8, .7), knob = new THREE.SphereGeometry(.22, 10, 8);
    const ET = (B1 + .5) / 2 - .13;
    for (let i = 0; i < 5; i++) {
      const t = -ET + .7 + i * (2 * ET - 1.4) / 4;
      [[t, ET, 0], [t, -ET, 0], [ET, t, 1], [-ET, t, 1]].forEach(([mx, mz, r], k) => {
        if (k === 2 && i < 2) return;   // the opening where the stair's landing comes in
        part(merlon, white, mx, BH + .55, mz, T).rotation.y = r * Math.PI / 2;
        part(mtop, white, mx, BH + .97, mz, T).rotation.y = Math.PI / 4;
      });
    }
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { part(corner, white, a * (ET - .1), BH + .7, b * (ET - .1), T); part(knob, white, a * (ET - .1), BH + 1.25, b * (ET - .1), T); });
    // the stair: steep steps up along the base's east face (local +x) between the base and a sloping white wall with a coping, to
    // a landing that comes in through a gap in the crenellations onto the base's top
    const TOP = BH + .3, SX0 = B0 / 2 + .6, SX1 = SX0 + 1.2, SZ0 = 5.6, SZ1 = -.4, sn = 23, srun = SZ0 - SZ1, srise = TOP / sn, stread = srun / sn;
    for (let i = 0; i < sn; i++) mesh(new THREE.BoxGeometry(SX1 - SX0, (i + 1) * srise, stread), white, (SX0 + SX1) / 2, (i + 1) * srise / 2, SZ0 - (i + .5) * stread, T);
    mesh(new THREE.BoxGeometry(SX1 - 2.1, TOP, SZ1 + 1.9), white, (SX1 + 2.1) / 2, TOP / 2, (SZ1 - 1.9) / 2, T);   // the landing, built up from the ground against the base
    const sw = new THREE.Shape(); sw.moveTo(SZ0, 0); sw.lineTo(SZ0, .9); sw.lineTo(SZ1, TOP + .9); sw.lineTo(-1.9, TOP + .9); sw.lineTo(-1.9, 0); sw.closePath();
    const swg = new THREE.ExtrudeGeometry(sw, { depth: .2, bevelEnabled: false }); swg.rotateY(-Math.PI / 2);
    mesh(swg, white, SX1 + .2, 0, 0, T);
    const scope = mesh(new THREE.BoxGeometry(.3, .1, Math.hypot(srun, TOP) + .1), white, SX1 + .1, .9 + TOP / 2 + .05, (SZ0 + SZ1) / 2, T); scope.rotation.x = Math.atan2(TOP, srun);
    mesh(new THREE.BoxGeometry(SX1 - 2.1, .9, .2), white, (SX1 + 2.1) / 2, TOP + .45, -2, T);   // the landing's parapet toward the gate
    // walkable: the stair and landing, the base's top within its crenellations (the columns and the ladder in the way), the base itself blocks
    sRect(T, SX1, SX1 + .25, -1.9, SZ0);
    sRect(T, SX0, SX1, SZ1, SZ0, (lx, lz) => TOP * clamp((SZ0 - lz) / srun, 0, 1));
    sRect(T, 2.1, SX1, -1.9, SZ1, (lx, lz) => lz < -1.75 ? null : TOP);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => sCircle(T, a * 1.55, b * 1.55, .35));
    sRect(T, .55, 1.25, -1.9, .35);
    sRect(T, -2.2, 2.2, -2.2, 2.2, (lx, lz) => Math.abs(lx) > 1.95 && !(lx > 0 && lz > -1.75 && lz < -.45) || Math.abs(lz) > 1.95 ? null : TOP);
    sRect(T, -B0 / 2 - .5, B0 / 2 + .5, -B0 / 2 - .5, B0 / 2 + .5);
    // the four round columns, a teak platform on them, and the open pavilion: slender posts, a low rail, a hipped skirt roof and a small top roof
    const PY = BH + 3.6, col = new THREE.CylinderGeometry(.3, .32, PY - BH - .3, 14), foot = new THREE.CylinderGeometry(.38, .38, .2, 14);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => {
      const cx = a * 1.55, cz = b * 1.55;
      part(col, white, cx, BH + .3 + (PY - BH - .3) / 2, cz, T);
      part(foot, white, cx, BH + .4, cz, T);
      mesh(new THREE.BoxGeometry(.75, .22, .75), white, cx, PY - .15, cz, T);
      mesh(new THREE.CylinderGeometry(.09, .1, 2.6, 8), teak, a * 1.9, PY + 1.3, b * 1.9, T);
    });
    mesh(new THREE.BoxGeometry(4.4, .25, 4.4), teakDark, 0, PY + .1, 0, T);
    [[0, 2.1, 4.2, .08], [0, -2.1, 4.2, .08], [2.1, 0, .08, 4.2], [-2.1, 0, .08, 4.2]].forEach(([rx, rz, w, d]) => mesh(new THREE.BoxGeometry(w, .08, d), teakDark, rx, PY + .9, rz, T));
    mesh(new THREE.BoxGeometry(4.2, .22, 4.2), teakDark, 0, PY + 2.6, 0, T);
    hip([-3, 3, -3, 3], [-1.2, 1.2, -1.2, 1.2], PY + 2.5, PY + 3.4, T);
    mesh(new THREE.BoxGeometry(2.4, .7, 2.4), teakDark, 0, PY + 3.7, 0, T);
    const top = mesh(new THREE.ConeGeometry(2.1, 1.5, 4, 1, true), roofM, 0, PY + 4.8, 0, T); top.rotation.y = Math.PI / 4;
    mesh(new THREE.ConeGeometry(.16, 1.3, 8), M.gold, 0, PY + 6.1, 0, T);
    mesh(new THREE.CylinderGeometry(.015, .015, .8, 4), M.gold, 0, PY + 7.1, 0, T);
    // the flame finials curling up at the corners of both roofs
    [[3, PY + 2.6, 1.5], [1.55, PY + 4.15, 1.1]].forEach(([r, y, s]) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const f = mesh(flame, teakDark, a * r, y, b * r, T); f.scale.setScalar(s); f.rotation.set(b * .4, 0, -a * .4); }));
    // the gong and the bell that told the hours: a great bronze gong with a raised boss, hung on cords from a red frame, its padded
    // beater beside it; the bell from the pavilion's beams
    const GX = -.7, GY = PY + 1.35;
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.12, 2.3, .12), red, GX + sd * .8, PY + 1.25, -.3, T));
    mesh(new THREE.BoxGeometry(1.9, .14, .14), red, GX, PY + 2.4, -.3, T);
    [-1, 1].forEach(sd => { const c = mesh(new THREE.CylinderGeometry(.012, .012, .62, 4), teakDark, GX + sd * .32, GY + .78, -.3, T); c.rotation.z = sd * .45; });
    const gong = mesh(new THREE.CylinderGeometry(.6, .6, .05, 32), M.bronze, GX, GY, -.3, T); gong.rotation.x = Math.PI / 2;
    mesh(new THREE.TorusGeometry(.6, .035, 6, 32), M.bronze, GX, GY, -.3, T);
    mesh(new THREE.SphereGeometry(.15, 12, 8), M.gold, GX, GY, -.25, T).scale.z = .5;
    const beat = mesh(new THREE.CylinderGeometry(.025, .025, .9, 6), teak, GX + 1.05, PY + .85, .1, T); beat.rotation.z = .25;
    mesh(new THREE.SphereGeometry(.11, 10, 8), red, GX + 1.16, PY + 1.3, .1, T);
    const bell = mesh(new THREE.CylinderGeometry(.25, .42, .7, 16, 1, true), M.bronze, .9, PY + 1.8, .3, T); bell.material.side = THREE.DoubleSide;
    mesh(new THREE.SphereGeometry(.26, 12, 8, 0, TAU, 0, Math.PI / 2), M.bronze, .9, PY + 2.15, .3, T);
    // the ladder up from the base's top to a hatch in the platform
    const lad = new THREE.Group(); lad.position.set(.9, BH + .3, .2); lad.rotation.x = -Math.atan2(2, PY - BH - .3); T.add(lad);
    const LL = Math.hypot(2, PY - BH - .3);
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.06, LL, .08), teak, sd * .25, LL / 2, 0, lad));
    for (let i = 1; i < 11; i++) mesh(new THREE.BoxGeometry(.5, .04, .04), teak, 0, i * LL / 11, 0, lad);
    bakeParts(T);
    const tData = { tip: "The palace clock tower", toast: "The palace clock tower, like the one in the palace at Mandalay: a tall whitewashed base crenellated along its top, four round columns carrying a teak platform, and an open pavilion under two roofs. A water clock kept the time, and the watchmen climbed the stair and the ladder to beat the hours on the great gong and sound the bell." };
    T.traverse(o => { if (o.isMesh) clickable(list, o, tData); });
    // keep the outside camera above the tower and the Hluttaw's spire
    G.updateMatrixWorld(true);
    [[T, 3.5, PY + 7.5], [H, HW + 1, EV + 13]].forEach(([o, r, h]) => {
      const a = o.localToWorld(V(-r, 0, -r)), b = o.localToWorld(V(r, 0, r));
      TALL.push({ x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x), z0: Math.min(a.z, b.z), z1: Math.max(a.z, b.z), h });
    });
  }
