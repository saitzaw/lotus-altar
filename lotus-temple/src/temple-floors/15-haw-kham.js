  /* ---------- ႁေႃၶမ်း the Haw Kham, the saopha's palace, on open ground east of the stupa hill behind the church, after the old
     photographs of the Shan haws: a long low teak hall, two halls deep, on a high whitewashed plinth with a pierced parapet, a
     verandah of slender white posts under a wide skirt roof all round, and above it a dark band of upper wall under the upper roofs:
     a cluster of parallel carved gables at the east end, the seven-tiered pyatthat over the throne room, a long hipped roof with two
     raised ridge vents, and a lesser tiered spire at the west end. Front and back are built alike (`face`): at the front, which faces
     away from the town across the forecourt, a main stair under a porch of three stepped gables and a pyatthat, and on both faces a
     lesser stair at each end climbing along the plinth's face (at the back, toward the town, under a roofed pavilion at its landing,
     after the owner's photograph, and no main stair), and three doors, to the halls built by `hawHall`: at the front the throne
     room, the hall of justice and the hall of the monks; at the back the literature hall, the dining hall and the opera hall. All
     inside a whitewashed wall with a gate at the front and another toward the town. Across the road from the front gate, in its
     own walled compound, the Hluttaw, the council of state, facing the main entrance, with the palace clock tower.
     The back yard, toward the town, is kept clear for the royal kitchen, bathhouse and lake still to come ---------- */
  /* ---------- the saopha's guards, dressed like the Shan singer on the festival stage but all in black: a long black silk jacket
     studded with silver, baggy black trousers, a black headcloth with its tail over the right shoulder, a straw hat slung on the
     back, a sword on a green cord hung with wool pom-poms, and a spear held upright at the right side. They stand still at the
     gate and about the palace. Every piece but the jacket (which answers to a tap) is baked into shared instanced meshes ---------- */
  function palaceGuards(G, list, spots) {
    const lin = h => new THREE.Color(h).convertSRGBToLinear();
    const silk = std({ color: lin(0x232328), roughness: .35, metalness: .25 }), trousers = std({ color: lin(0x18181b), roughness: .6 }), cloth = std({ color: lin(0x1c1c1f), roughness: .8 });
    const knit = std({ color: 0x0e0e10, roughness: .9 }), skin = std({ color: lin(0xe4bf86), roughness: .7 }), ink = std({ color: 0x1a1410, roughness: .6 });
    const silver = std({ color: 0xd8dade, roughness: .25, metalness: .8 }), cord = std({ color: lin(0x2a8a3c), roughness: .7 }), sheath = std({ color: 0x24262a, roughness: .45, metalness: .3 });
    const wood = std({ color: lin(0x5a3a1e), roughness: .6 }), steel = std({ color: 0xc8ccd0, roughness: .3, metalness: .8 }), hiltM = std({ color: lin(0xe8c040), roughness: .8 });
    const WOOL = [0x1f8a3c, 0xd82a2a, 0xf0c830, 0xf4f2ea].map(h => std({ color: lin(h), roughness: .95 }));
    const straw = std({ map: canvasTex(128, (c, s) => { c.fillStyle = "#d8b868"; c.fillRect(0, 0, s, s); for (let y = 0; y < s; y += 4) { c.fillStyle = y & 4 ? "rgba(150,110,40,.35)" : "rgba(255,240,180,.35)"; c.fillRect(0, y, s, 2); } }), roughness: .85, side: THREE.DoubleSide });
    const unit = (r0, r1) => { const geo = new THREE.CylinderGeometry(r1, r0, 1, 8); geo.translate(0, .5, 0); return geo; };
    const GEO = { leg: new THREE.CylinderGeometry(.14, .12, .84, 10), slip: new THREE.BoxGeometry(.1, .05, .24), jacket: new THREE.CylinderGeometry(.18, .26, .72, 14), neck: new THREE.CylinderGeometry(.06, .07, .12, 10),
      collar: new THREE.TorusGeometry(.075, .022, 6, 14), stud: new THREE.SphereGeometry(.009, 6, 4), head: new THREE.SphereGeometry(.115, 16, 12), eye: new THREE.SphereGeometry(.016, 8, 6), brow: new THREE.BoxGeometry(.045, .008, .008),
      ear: new THREE.SphereGeometry(.026, 8, 6), nose: new THREE.ConeGeometry(.014, .045, 6), wrap: new THREE.CylinderGeometry(.128, .122, .12, 16), dome: new THREE.SphereGeometry(.125, 14, 8, 0, TAU, 0, Math.PI / 2), tail: new THREE.BoxGeometry(.12, .62, .025),
      hat: new THREE.ConeGeometry(.62, .26, 28, 1, true), rim: new THREE.TorusGeometry(.62, .015, 4, 28), up: unit(.085, .05), lo: unit(.042, .036), hand: new THREE.SphereGeometry(.04, 8, 6),
      cord: unit(.008, .008), sheath: unit(.02, .016), hilt: unit(.018, .018), pom: new THREE.SphereGeometry(.035, 8, 6), shaft: unit(.018, .018), blade: new THREE.ConeGeometry(.035, .24, 4), tassel: new THREE.CylinderGeometry(.012, .02, .4, 6) };
    const Y = V(0, 1, 0), tmp = V(0, 0, 0), P = (x, y, z) => V(x, y, z);
    const span = (o, a, b) => { tmp.subVectors(b, a); const L = tmp.length(); o.position.copy(a); o.quaternion.setFromUnitVectors(Y, tmp.divideScalar(L)); o.scale.y = L; return o; };
    const GG = new THREE.Group(); G.add(GG);
    const data = { tip: "A guard of the palace", toast: "One of the saopha's guards, in the old Shan dress of the hills all in black: a long black silk jacket studded with silver, baggy black trousers, a black headcloth with its long tail over the shoulder and a great straw hat slung on his back, a sword hung on a green cord with wool pom-poms, and a spear in his hand. They keep the gate and the doors of the halls." };
    const guard = (x, y, z, ry) => {
      const B = new THREE.Object3D(); B.position.set(x, y, z); B.rotation.y = ry; GG.add(B);
      const pt = (geo, m, px, py, pz) => part(geo, m, px, py, pz, B);
      [-1, 1].forEach(sd => { pt(GEO.leg, trousers, sd * .11, .44, 0); pt(GEO.slip, ink, sd * .11, .025, .05); });
      clickable(list, mesh(GEO.jacket, silk, 0, 1.03, 0, B), data);
      pt(GEO.neck, knit, 0, 1.4, 0); pt(GEO.collar, silk, 0, 1.4, 0).rotation.x = Math.PI / 2;
      for (let i = 0; i < 12; i++) { const yy = .7 + i * .055; pt(GEO.stud, silver, .05, yy, .26 - (yy - .67) * .11 + .006); }
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; pt(GEO.stud, silver, Math.sin(a) * .265, .69, Math.cos(a) * .265); }
      pt(GEO.head, skin, 0, 1.56, 0).scale.set(.92, 1.15, 1);
      [-1, 1].forEach(sd => { pt(GEO.eye, ink, sd * .042, 1.58, .1); pt(GEO.brow, ink, sd * .044, 1.61, .105); pt(GEO.ear, skin, sd * .108, 1.56, 0).scale.set(.45, 1, .7); });
      pt(GEO.nose, skin, 0, 1.555, .115).rotation.x = -Math.PI * .4;
      pt(GEO.wrap, cloth, 0, 1.65, -.005); pt(GEO.dome, cloth, 0, 1.7, -.005).scale.y = .55;
      pt(GEO.tail, cloth, -.12, 1.33, -.02);
      pt(GEO.hat, straw, 0, 1.0, -.36).rotation.x = -Math.PI / 2 + .12; pt(GEO.rim, straw, 0, 1.0, -.23).rotation.x = .12;
      // the sword on its cord from the right shoulder to the left hip, its hilt forward at the waist under a bunch of pom-poms
      span(pt(GEO.cord, cord), P(-.15, 1.34, .1), P(.2, .88, .2));
      const hilt = P(.17, .98, .26); span(pt(GEO.sheath, sheath), hilt, P(.36, .3, -.05)); span(pt(GEO.hilt, hiltM), P(.13, 1.05, .3), hilt);
      [[.2, .82, .27, 0], [.24, .76, .25, 1], [.18, .74, .28, 3], [.22, .68, .26, 2]].forEach(([px, py, pz, k]) => pt(GEO.pom, WOOL[k], px, py, pz));
      // the arms: black silk sleeves to the elbow, black knitted forearms; the right hand grips the spear, the left rests on the hilt
      [[P(-.21, 1.33, 0), P(-.27, 1.07, .04), P(-.25, .86, .13)], [P(.21, 1.33, 0), P(.31, 1.1, .08), P(.17, 1.0, .28)]].forEach(([S, E, H]) => { span(pt(GEO.up, silk), S, E); span(pt(GEO.lo, knit), E, H); pt(GEO.hand, skin, H.x, H.y, H.z); });
      // the spear, butt on the ground, a red tassel under its steel head
      span(pt(GEO.shaft, wood), P(-.25, .02, .14), P(-.25, 2.2, .14)); pt(GEO.blade, steel, -.25, 2.32, .14); pt(GEO.tassel, WOOL[1], -.25, 2.0, .14);
      sCircle(G, x, z, .32);
    };
    spots.forEach(a => guard(...a));   // [x, y, z, turn] in G's frame
    bakeParts(GG);
  }
  function hawKham(g, x, z, ry) {
    const list = picks.pagoda, { teak, teakDark, white, pane, gable, pyatthat } = shanCarpentry();
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; g.add(G);   // its back (local +z) faces the town; local +x is west
    const CX = 22, CZ = 38, CZB = 50;   // the compound's half width, and how far it reaches toward the town gate (+z) and to the front gate (−z)
    const red = std({ color: 0x8a1e14, roughness: .45 }), tile = std({ color: 0x7a2a1c, roughness: .7 }), gravel = std({ color: 0xb8a888, roughness: 1 });
    const data = { tip: `${SHAN_NAMES.haw} · the Haw Kham, the saopha's palace`, toast: `${SHAN_NAMES.haw}, the Haw Kham or golden palace: the haw of Hsenwi's saopha (${SHAN_NAMES.saopha}, "lord of the sky"), the prince who ruled the Shan state from here. A long teak hall on a high whitewashed plinth, a verandah of slender posts all round, the throne room under the seven-tiered pyatthat, a main stair under a spired porch at the front, away from the town, and a lesser stair at each end of both faces. The saophas gave up their powers in 1959.` };
    // the courtyard, raked gravel inside the wall, and the whitewashed wall itself with a red tile coping, open at the gate toward
    // the town and at the front gate beyond the palace
    flat(mesh(new THREE.BoxGeometry(2 * CX, .04, CZ + CZB), gravel, 0, .025, (CZ - CZB) / 2, G)).receiveShadow = true;
    flat(mesh(new THREE.BoxGeometry(4.8, .05, 5.7), M.stone, 0, .035, CZ + 2.75, G));   // the paved walk out of the town gate to the palace lane
    flat(mesh(new THREE.BoxGeometry(4.8, .05, 5.7), M.stone, 0, .035, -CZB - 2.75, G));   // and out of the front gate
    [[-CX, -3.4, -CZB, -CZB], [3.4, CX, -CZB, -CZB], [-CX, -CX, -CZB, CZ], [CX, CX, -CZB, CZ], [-CX, -3.4, CZ, CZ], [3.4, CX, CZ, CZ]].forEach(([a, b, c, d]) => {
      const w = Math.max(b - a, .4), dd = Math.max(d - c, .4), mx = (a + b) / 2, mz = (c + d) / 2;
      mesh(new THREE.BoxGeometry(w, 2.2, dd), white, mx, 1.1, mz, G);
      mesh(new THREE.BoxGeometry(w + .2, .18, dd + .2), tile, mx, 2.29, mz, G);
      sRect(G, mx - w / 2, mx + w / 2, mz - dd / 2, mz + dd / 2);
    });
    // the gates, front and back alike: white pillars under a beam carrying a little three-tiered pyatthat, a lantern on each
    // pillar's outer face lit at night
    const lamps = [];
    [[CZ, 1], [-CZB, -1]].forEach(([gz, out]) => {
      [-1, 1].forEach(sd => {
        mesh(new THREE.BoxGeometry(1, 4.2, 1), white, sd * 3, 2.1, gz, G); mesh(new THREE.BoxGeometry(1.2, .2, 1.2), M.trim, sd * 3, 4.25, gz, G);
        sRect(G, sd * 3 - .5, sd * 3 + .5, gz - .5, gz + .5);
        const b = glowSprite(0xffd060, 1.1, .8); b.position.set(sd * 3, 3.4, gz + out * .7); G.add(b); lamps.push(b);
      });
      mesh(new THREE.BoxGeometry(7.2, .6, 1.4), red, 0, 4.6, gz, G); mesh(new THREE.BoxGeometry(7.4, .14, 1.5), M.trim, 0, 4.95, gz, G);
      pyatthat(G, 0, 5, gz, 2.6, 3);
    });
    onDaylight(d => lamps.forEach(b => b.material.opacity = .85 * (1 - d)));
    // the sizes. The palace is the same front and back, mirrored about z = ZM: the plinth (PH high, PX half wide, from PZ0 at the back
    // to PZ1 at the front), the hall on it (HX half wide, from HZ0 to HZ1, walls WH high up to yW), two halls deep. Each face has its
    // stairs (SW wide, n steps): the main stair straight up the middle (its foot at z = CF) to the landing (LX half wide) before the
    // centre doors, under a porch crowned with a pyatthat, the sign of the saopha's rank; and at each end of the verandah a lesser
    // stair climbing along the plinth's face toward the middle, from its foot at x = ±FX to a little landing at x = ±TX…±(TX − SW),
    // as in the old photographs. The doors on each face: the centre one, and one either side at x = ±SDX
    const ZM = -12, PH = 2.4, PX = 18, PZ1 = 2, PZ0 = 2 * ZM - PZ1, HX = 15, HZ1 = -1, HZ0 = 2 * ZM - HZ1, HC = ZM, HD = HZ1 - HZ0, WH = 4.6, yW = PH + WH;
    const SDX = 8.75, SW = 2.2, n = 14, tread = .34, run = n * tread, LX = 1.6, CF = PZ1 + SW + run, FX = PX - .4, TX = FX - run, SLC = TX - SW / 2, EH = PH + 3, ED = .75;   // EH: the verandah's eaves; ED: the parapet's no-go strip
    // walkable: the hall's walls block; the plinth's top is the verandah, kept in by the parapet but open to the landings on both faces
    sRect(G, -HX, HX, HZ0, HZ1);
    sRect(G, -PX, PX, PZ0, PZ1, (lx, lz) => { const fz = lz > ZM ? lz : 2 * ZM - lz, edge = PZ1 - fz < ED; return (Math.abs(lx) > PX - ED || edge) && !(edge && (lz > ZM && Math.abs(lx) < LX - .3 || Math.abs(Math.abs(lx) - SLC) < SW / 2 - .3)) ? null : PH; });
    // the plinth: whitewashed brick, a moulded foot and cornice, paved on top
    const paveT = canvasTex(128, (c, sz) => { c.fillStyle = "#b8b0a0"; c.fillRect(0, 0, sz, sz); for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { const v = 172 + ((r * 3 + k * 5) % 4) * 9; c.fillStyle = `rgb(${v},${v - 5},${v - 14})`; c.fillRect(k * 32 + 1, r * 32 + 1, 30, 30); } });
    paveT.wrapS = paveT.wrapT = THREE.RepeatWrapping; paveT.repeat.set(PX / 1.2, (PZ1 - PZ0) / 2.4);
    const pave = std({ map: paveT, roughness: .85 }), slab = [white, white, pave, white, white, white];
    mesh(new THREE.BoxGeometry(2 * PX, PH, PZ1 - PZ0), slab, 0, PH / 2, ZM, G);
    mesh(new THREE.BoxGeometry(2 * PX + .3, .35, PZ1 - PZ0 + .3), white, 0, .175, ZM, G);
    mesh(new THREE.BoxGeometry(2 * PX + .2, .14, PZ1 - PZ0 + .2), white, 0, PH - .3, ZM, G);
    // the parapet: whitewashed, a row of little pointed niches pierced along it under a moulded coping, open where the landings meet it
    const niT = canvasTex(128, (c, sz) => { c.fillStyle = "#f2eee4"; c.fillRect(0, 0, sz, sz); c.fillStyle = "#2a2622"; [16, 80].forEach(x => { c.beginPath(); c.moveTo(x, 92); c.lineTo(x, 58); c.quadraticCurveTo(x, 40, x + 16, 28); c.quadraticCurveTo(x + 32, 40, x + 32, 58); c.lineTo(x + 32, 92); c.fill(); }); c.fillStyle = "#d8d2c4"; c.fillRect(0, 104, sz, 6); });
    niT.wrapS = THREE.RepeatWrapping;
    const para = (F, x0, x1, z0, z1) => {
      const w = x1 - x0, d = z1 - z0, geo = new THREE.BoxGeometry(w, .9, d), uv = geo.attributes.uv, s = Math.max(w, d) / 1.2;
      for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * s);
      const t = niT.clone(); t.needsUpdate = true;
      mesh(geo, std({ map: t, roughness: .85 }), (x0 + x1) / 2, PH + .45, (z0 + z1) / 2, F);
      mesh(new THREE.BoxGeometry(w + .12, .1, d + .12), white, (x0 + x1) / 2, PH + .95, (z0 + z1) / 2, F);
    };
    para(G, -PX, -PX + .3, PZ0 + .3, PZ1 - .3); para(G, PX - .3, PX, PZ0 + .3, PZ1 - .3);
    // a pier crowned with a lotus bud at each corner of the plinth, at the landings' corners, and at each stair's foot
    const newel = (F, nx, nz, y) => {
      mesh(new THREE.BoxGeometry(.6, 1.25, .6), white, nx, y + .62, nz, F);
      mesh(new THREE.BoxGeometry(.72, .1, .72), M.trim, nx, y + 1.28, nz, F);
      const bud = mesh(new THREE.SphereGeometry(.2, 14, 10), white, nx, y + 1.6, nz, F); bud.scale.y = 1.35;
      mesh(new THREE.ConeGeometry(.07, .3, 10), M.gold, nx, y + 1.92, nz, F);
    };
    [[-PX, PZ0], [PX, PZ0], [-PX, PZ1], [PX, PZ1]].forEach(([nx, nz]) => newel(G, nx + (nx > 0 ? -.3 : .3), nz + (nz > 0 ? -.3 : .3), PH));
    // the roofs, corrugated iron like the monastery's, laid on as hipped planes: `hip` runs four slopes from the eave rectangle
    // o [x0, x1, z0, z1] at y0 up to the rectangle (or ridge line) t at y1, the corrugations running down each slope
    const hipT = corrugated("#6a3a24", "#8e5838", "#40200f"), hipM = std({ map: hipT, roughness: .5, metalness: .35, side: THREE.DoubleSide });
    const hip = (o, t, y0, y1, F = G) => {
      const pos = [], uv = [], O = (i, j) => [o[i], y0, o[j]], T = (i, j) => [t[i], y1, t[j]];
      const quad = (pts, alongX) => [0, 1, 2, 0, 2, 3].forEach(k => { const p = pts[k]; pos.push(...p); uv.push(alongX ? p[0] : p[2], alongX ? p[2] : p[0]); });
      quad([O(0, 3), O(1, 3), T(1, 3), T(0, 3)], true); quad([O(1, 2), O(0, 2), T(0, 2), T(1, 2)], true);
      quad([O(0, 2), O(0, 3), T(0, 3), T(0, 2)], false); quad([O(1, 3), O(1, 2), T(1, 2), T(1, 3)], false);
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geo.computeVertexNormals();
      return mesh(geo, hipM, 0, 0, 0, F);
    };
    const rise = PH / n, doors = [];
    // one face of the palace, built in its own frame F (the front in G's frame; the back in a frame turned round about z = ZM, so the
    // same numbers serve): its stairs and landings, the main stair's porch, the little gables over the verandah at the east end, the
    // wall's windows, its three doors and the name board. halls: [left, centre, right] as seen by someone facing the doors, each
    // [place key, what to call it]; sx turns G's x into this frame's. main: the face has the main stair and its porch (the front);
    // without it (the back, after the owner's photograph) only the two end stairs, each under a roofed pavilion at its landing
    function face(F, halls, sx, main) {
      // the paved way across in front of the main stair's foot (or the end landings, without one) and along to the feet of the end stairs
      const ZW = main ? CF : PZ1 + SW;
      flat(mesh(new THREE.BoxGeometry(2 * FX + 4.8, .05, 2.2), M.stone, 0, .046, ZW + 1.1, F));
      [-1, 1].forEach(sd => flat(mesh(new THREE.BoxGeometry(1.8, .05, ZW + 2.2 - PZ1), M.stone, sd * (FX + 1.5), .047, (PZ1 + ZW + 2.2) / 2, F)));
      // walkable: the main landing and stair between their walls; the end stairs and their landings, their outer walls blocking
      if (main) sRect(F, -LX, LX, PZ1, PZ1 + SW, PH);
      [-1, 1].forEach(sd => {
        if (main) sRect(F, sd > 0 ? LX : -LX - .3, sd > 0 ? LX + .3 : -LX, PZ1, CF + .6);   // the main landing's parapet and the stair's wall
        const x0 = sd > 0 ? TX - SW : -TX, x1 = sd > 0 ? TX : -TX + SW;
        sRect(F, x0, x1, PZ1, PZ1 + SW, (lx, lz) => lz > PZ1 + SW - .45 || Math.abs(lx) < TX - SW + .45 ? null : PH);   // an end landing
        sRect(F, sd > 0 ? TX : -FX, sd > 0 ? FX : -TX, PZ1, PZ1 + SW, (lx, lz) => lz > PZ1 + SW - .45 ? null : PH * clamp((FX - Math.abs(lx)) / run, 0, 1));   // an end stair, open at its foot
        sRect(F, sd > 0 ? FX : -FX - .6, sd > 0 ? FX + .6 : -FX, PZ1 + SW - .6, PZ1 + SW + .15);   // the lotus-bud pier at its foot
      });
      if (main) sRect(F, -LX, LX, PZ1 + SW, CF, (lx, lz) => PH * clamp((CF - lz) / run, 0, 1));
      // the landings built out from the plinth's face, and the parapet along the face between them
      if (main) mesh(new THREE.BoxGeometry(2 * LX + .6, PH, SW), slab, 0, PH / 2, PZ1 + SW / 2, F);
      [-1, 1].forEach(sd => {
        mesh(new THREE.BoxGeometry(SW, PH, SW), slab, sd * SLC, PH / 2, PZ1 + SW / 2, F);
        const a = (u, v) => [Math.min(sd * u, sd * v), Math.max(sd * u, sd * v)];
        para(F, ...a(main ? LX : 0, TX - SW), PZ1 - .3, PZ1); para(F, ...a(TX, PX), PZ1 - .3, PZ1);
        if (main) para(F, ...a(LX, LX + .3), PZ1, PZ1 + SW);   // the main landing's sides
        para(F, ...a(TX - SW, TX), PZ1 + SW - .3, PZ1 + SW); para(F, ...a(TX - SW, TX - SW + .3), PZ1, PZ1 + SW - .3);   // an end landing's front and inner side
        if (main) { newel(F, sd * (LX + .15), PZ1 + SW - .15, PH); newel(F, sd * (LX + .15), CF + .3, 0); } newel(F, sd * (TX - SW + .15), PZ1 + SW - .15, PH); newel(F, sd * (FX + .3), PZ1 + SW - .15, 0);
        // an end stair along the plinth's face, rising toward the middle between the plinth and a sloping white wall with a moulded coping
        for (let i = 0; i < n; i++) mesh(new THREE.BoxGeometry(tread, (i + 1) * rise, SW - .3), white, sd * (FX - (i + .5) * tread), (i + 1) * rise / 2, PZ1 + (SW - .3) / 2, F);
        const sw = new THREE.Shape(); sw.moveTo(sd * FX, 0); sw.lineTo(sd * FX, .9); sw.lineTo(sd * TX, PH + .9); sw.lineTo(sd * TX, 0); sw.closePath();
        mesh(new THREE.ExtrudeGeometry(sw, { depth: .3, bevelEnabled: false }), white, 0, 0, PZ1 + SW - .3, F);
        const cope = mesh(new THREE.BoxGeometry(Math.hypot(run, PH) + .1, .1, .42), white, sd * (FX - run / 2), .9 + PH / 2 + .05, PZ1 + SW - .15, F); cope.rotation.z = -sd * Math.atan2(PH, run);
      });
      if (main) {
        // the main stair, straight down from the landing between two sloping white walls
        for (let i = 0; i < n; i++) mesh(new THREE.BoxGeometry(2 * LX, PH - i * rise, tread), white, 0, (PH - i * rise) / 2, PZ1 + SW + (i + .5) * tread, F);
        const cw = new THREE.Shape(); cw.moveTo(PZ1 + SW, 0); cw.lineTo(PZ1 + SW, PH + .9); cw.lineTo(CF, .9); cw.lineTo(CF, 0); cw.closePath();
        [-1, 1].forEach(sd => {
          const wg = new THREE.ExtrudeGeometry(cw, { depth: .3, bevelEnabled: false }); wg.rotateY(-Math.PI / 2);
          mesh(wg, white, sd > 0 ? LX + .3 : -LX, 0, 0, F);
          const cope = mesh(new THREE.BoxGeometry(.42, .1, Math.hypot(run, PH) + .1), white, sd * (LX + .15), .9 + PH / 2 + .05, PZ1 + SW + run / 2, F); cope.rotation.x = Math.atan2(PH, run);
        });
        // its porch, the mark of the saopha's power: red-lacquered posts banded in gilt either side, three carved gables stepping down
        // with the stair (each over a third of it), and over the top one a five-tiered pyatthat with a gilt spire
        const PXp = LX + .7, Z = [PZ1 + SW, PZ1 + SW + run / 3, PZ1 + SW + run * 2 / 3, CF], Y = [PH + 3.1, 4.5, 3.5];   // Z: where each third begins and ends; Y: each gable's eaves
        [[Z[0] + .1, Y[0]], [Z[1], Y[0]], [Z[2], Y[1]], [Z[3] + .1, Y[2]]].forEach(([pz, top]) => [-1, 1].forEach(sd => {
          mesh(new THREE.CylinderGeometry(.14, .16, top, 10), red, sd * PXp, top / 2, pz, F); sCircle(F, sd * PXp, pz, .2);
          [.4, top - .3].forEach(y => mesh(new THREE.CylinderGeometry(.17, .17, .1, 10), M.gold, sd * PXp, y, pz, F));
        }));
        Y.forEach((y, k) => {
          const z0 = k ? Z[k] : PZ1 - .3, z1 = Z[k + 1] + (k < 2 ? .5 : .7);
          [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.2, .26, Z[k + 1] - Z[k] + .3), red, sd * PXp, y - .13, (Z[k] + Z[k + 1]) / 2, F));
          gable(F, 0, y, (z0 + z1) / 2, 2 * PXp + 1 - k * .2, z1 - z0, 2.2 - k * .25);
        });
        pyatthat(F, 0, Y[0] + 1.2, (PZ1 - .3 + Z[1] + .5) / 2, 2.9, 5, .15);
      } else [-1, 1].forEach(sd => {   // a roofed pavilion over each end stair's landing: red posts, a hipped skirt roof, a carved gable and a gilt finial
        const cx = sd * SLC, cz = PZ1 + SW / 2, yP = PH + 2.7;
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const px = cx + a * (SW / 2 - .2), pz = cz + b * (SW / 2 - .2); mesh(new THREE.CylinderGeometry(.11, .13, yP - PH, 10), red, px, (PH + yP) / 2, pz, F); sCircle(F, px, pz, .15); mesh(new THREE.CylinderGeometry(.14, .14, .08, 10), M.gold, px, yP - .2, pz, F); });
        hip([cx - 1.8, cx + 1.8, cz - 1.8, cz + 1.8], [cx - 1, cx + 1, cz - 1, cz + 1], yP, yP + .7, F);
        mesh(new THREE.BoxGeometry(2, .5, 2), teakDark, cx, yP + .9, cz, F);
        gable(F, cx, yP + 1.15, cz, 2.6, 2.8, 1.5);
      });
      // the little gables over the verandah before the east end's three gables
      [-14, -11.45, -8.9].forEach(cx => gable(F, sx * cx, EH - .05, PZ1 - 1.9, 2.4, 3.2, 1.3));
      // tall windows in gilt frames along the wall, lamplit at night
      const win = (wx, wz, r) => { const o = new THREE.Group(); o.position.set(wx, PH + 1.55, wz); o.rotation.y = r; F.add(o); mesh(new THREE.BoxGeometry(1.1, 2, .06), M.trim, 0, 0, .02, o); mesh(new THREE.PlaneGeometry(.86, 1.76), pane, 0, 0, .06, o); };
      for (let i = 0; i < 12; i++) { const wx = -HX + (i + .5) * 2 * HX / 12; if (Math.abs(wx) > 1.6 && Math.abs(Math.abs(wx) - SDX) > .5) win(wx, HZ1, 0); }
      // the centre doors, gilt-framed under a pointed gilt pediment, and the name board above them
      const door = mesh(new THREE.BoxGeometry(1.8, 2.8, .1), red, 0, PH + 1.4, HZ1 + .03, F);
      [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.14, 2.9, .14), M.gold, sd * .95, PH + 1.45, HZ1 + .05, F));
      mesh(new THREE.BoxGeometry(2.1, .14, .14), M.gold, 0, PH + 2.85, HZ1 + .05, F);
      [-.45, .45].forEach(dx => mesh(new THREE.BoxGeometry(.6, 2.3, .02), M.trim, dx, PH + 1.4, HZ1 + .09, F));
      const ped = mesh(new THREE.ConeGeometry(1.1, .8, 4), M.gold, 0, PH + 3.35, HZ1 + .05, F); ped.rotation.y = Math.PI / 4; ped.scale.z = .12;
      doors.push([door, ...halls[1], F, 0]);
      // the lesser doors either side
      [[-SDX, halls[0]], [SDX, halls[2]]].forEach(([dx, hall]) => {
        const d = mesh(new THREE.BoxGeometry(1.4, 2.5, .1), red, dx, PH + 1.25, HZ1 + .03, F);
        [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.12, 2.6, .14), M.gold, dx + sd * .74, PH + 1.3, HZ1 + .05, F));
        mesh(new THREE.BoxGeometry(1.6, .12, .14), M.gold, dx, PH + 2.56, HZ1 + .05, F);
        const pd = mesh(new THREE.ConeGeometry(.85, .6, 4), M.gold, dx, PH + 2.92, HZ1 + .05, F); pd.rotation.y = Math.PI / 4; pd.scale.z = .12;
        doors.push([d, ...hall, F, dx]);
      });
      const BW = 3.2, BH = BW * 300 / 1024, board = mesh(new THREE.BoxGeometry(BW, BH, .08), [teakDark, teakDark, teakDark, teakDark, shanBoardFace(SHAN_NAMES.haw, "Haw Kham"), teakDark], 0, PH + 3.85 + BH / 2, HZ1 + .06, F);
      Object.assign(board.userData, { toast: data.toast });
    }
    const BACK = new THREE.Group(); BACK.position.z = 2 * ZM; BACK.rotation.y = Math.PI; G.add(BACK);
    // the front (in BACK, turned round about z = ZM) faces away from the town; the back faces the town and the council's compound
    face(BACK, [["hawJustice", "the hall of justice"], ["haw", "the throne room"], ["hawMonks", "the hall where the saopha receives the monks"]], -1, true);
    face(G, [["hawDining", "the dining hall"], ["hawLibrary", "the literature hall"], ["hawOpera", "the opera hall"]], 1, false);
    const FZ = 2 * ZM - CF, ZX = CZB + 2 * ZM + 8.5;   // the main stair's foot, in G's frame; the Hluttaw compound's front wall, in BACK's, across the road (see LANES)
    flat(mesh(new THREE.BoxGeometry(3.4, .05, FZ + CZB), M.stone, 0, .045, (FZ - CZB) / 2, G));   // the paved way from the front gate to the main stair's foot
    flat(mesh(new THREE.BoxGeometry(3.4, .05, CZ - PZ1 - SW - 2.2), M.stone, 0, .045, (CZ + PZ1 + SW + 2.2) / 2, G));   // and behind, from the town gate to the way along the back
    // the verandah: slender white posts round the plinth's edge under a beam, the hall's dark teak walls behind, banded in gilt,
    // windows down its ends
    const posts = [], m4 = new THREE.Matrix4();
    for (let px = -PX + .55; px <= PX - .54; px += (2 * PX - 1.1) / 16) if (Math.abs(Math.abs(px) - SLC) > SW / 2 + .2) { if (Math.abs(px) > LX + .4) posts.push([px, PZ1 - .55]); posts.push([px, PZ0 + .55]); }
    for (let k = 1; k < 12; k++) { const pz = PZ0 + .55 + k * (PZ1 - PZ0 - 1.1) / 12; [-1, 1].forEach(sd => posts.push([sd * (PX - .55), pz])); }
    const post = new THREE.InstancedMesh(new THREE.CylinderGeometry(.1, .12, EH - PH, 8), white, posts.length);
    posts.forEach(([px, pz], i) => post.setMatrixAt(i, m4.makeTranslation(px, (PH + EH) / 2, pz)));
    G.add(post); post.castShadow = true;
    [[0, PZ1 - .55, 2 * PX - .9, .22], [0, PZ0 + .55, 2 * PX - .9, .22], [-PX + .55, ZM, .22, PZ1 - PZ0 - 1.1], [PX - .55, ZM, .22, PZ1 - PZ0 - 1.1]]
      .forEach(([bx, bz, w, d]) => mesh(new THREE.BoxGeometry(w, .3, d), teakDark, bx, EH - .15, bz, G));
    mesh(new THREE.BoxGeometry(2 * HX, WH, HD), teak, 0, PH + WH / 2, HC, G);
    [PH + .25, PH + 3.05].forEach(y => mesh(new THREE.BoxGeometry(2 * HX + .08, .2, HD + .08), M.trim, 0, y, HC, G));
    for (let i = 0; i < 6; i++) [-1, 1].forEach(sd => { const o = new THREE.Group(); o.position.set(sd * HX, PH + 1.55, HZ0 + (i + .5) * HD / 6); o.rotation.y = sd * Math.PI / 2; G.add(o); mesh(new THREE.BoxGeometry(1.1, 2, .06), M.trim, 0, 0, .02, o); mesh(new THREE.PlaneGeometry(.86, 1.76), pane, 0, 0, .06, o); });
    // the skirt roof over the verandah all round, from the posts' beam up to the top of the hall's walls
    hip([-PX - .7, PX + .7, PZ0 - .7, PZ1 + .7], [-HX, HX, HZ0, HZ1], EH - .74, yW);   // the verandah is 3 m deep all round, so it lands on the beam everywhere
    // the east end: three parallel gables, their carved ends to front and back, stepped up toward the throne room
    [[-14, 1.9], [-11.45, 2.2], [-8.9, 2.5]].forEach(([cx, h], i) => {
      if (i) mesh(new THREE.BoxGeometry(2.7, i * .3, HD), teakDark, cx, yW + i * .15, HC, G);
      gable(G, cx, yW + i * .3, HC, 2.7, HD + 1.2, h);
    });
    // the throne room: a raised dark clerestory under a broad carved gable, the seven-tiered pyatthat rising from its ridge
    mesh(new THREE.BoxGeometry(6, .8, HD), teakDark, -4.8, yW + .4, HC, G);
    gable(G, -4.8, yW + .8, HC, 6.4, HD + 1.2, 3);
    pyatthat(G, -4.8, yW + 3, HC, 5.2, 7, .12);
    // the long middle hall: a dark band of upper wall with a gilt rail, a hipped roof whose ridge runs front to back (the hall is now
    // deeper than it is wide here), and two raised vents along the ridge, each a slatted box under its own little hipped roof
    const MX0 = -1.6, MX1 = 12.2, mx = (MX0 + MX1) / 2;
    mesh(new THREE.BoxGeometry(MX1 - MX0, 1.2, HD), teakDark, mx, yW + .6, HC, G);
    mesh(new THREE.BoxGeometry(MX1 - MX0 + .06, .1, HD + .06), M.trim, mx, yW + 1.1, HC, G);
    const yM = yW + 1.2, yRdg = yM + 3.2;
    hip([MX0 - .6, MX1 + .6, HZ0 - .6, HZ1 + .6], [mx, mx, HZ0 + 4, HZ1 - 4], yM, yRdg);
    [[HZ0 + 4.5, HC - .5], [HC + .5, HZ1 - 4.5]].forEach(([a, b]) => {
      mesh(new THREE.BoxGeometry(1.6, 1, b - a), teakDark, mx, yRdg + .1, (a + b) / 2, G);
      hip([mx - 1.3, mx + 1.3, a - .35, b + .35], [mx, mx, a + .5, b - .5], yRdg + .55, yRdg + 1.2);
    });
    // the west end: a lesser gabled block under a five-tiered spire
    mesh(new THREE.BoxGeometry(2.8, .8, HD), teakDark, 13.6, yW + .4, HC, G);
    gable(G, 13.6, yW + .8, HC, 3.8, HD + 1.2, 2.4);
    pyatthat(G, 13.6, yW + 2.4, HC, 3.8, 5, .15);
    G.updateMatrixWorld(true);
    [[-CX + 3, CZ - 3], [CX - 3, CZ - 3], [-CX + 3, -CZB + 3], [CX - 3, -CZB + 3]].forEach(([lx, lz], i) => { const w = G.localToWorld(V(lx, 0, lz)); tree(g, w.x, w.z, .9, 820 + i); });
    G.traverse(o => { if (o.isMesh && !doors.some(d => d[0] === o)) clickable(list, o, data); });
    councilCompound(BACK, list, hip, ZX);   // across the road before the front gate, built in the front's frame
    // the doors, and where you come out of each hall: on the verandah before its doors, looking out over the courtyard
    PALACE.exits = {};
    doors.forEach(([d, key, what, F, dx]) => {
      clickable(list, d, { floor: key, tip: `Enter ${what} of ${SHAN_NAMES.haw}` });
      const ex = F.localToWorld(V(dx, 0, HZ1 + 1.1)), look = F.localToWorld(V(dx * .5, 0, CF + 6)); PALACE.exits[key] = [[ex.x, ex.z], [look.x, look.z]];
    });
    // the guards: two outside each gate and two inside it facing the walk, two outside the Hluttaw's gate facing the palace, and on each face two at the
    // main stair's foot, one beside each end stair's foot, two at the centre doors and one at each lesser door (the front's turned
    // round about z = ZM; the back without the pair at the main stair's foot, having no main stair)
    const faceSpots = [[-LX - 1.7, 0, CF + .6, 0], [LX + 1.7, 0, CF + .6, 0], [-FX - .9, 0, PZ1 - .9, 0], [FX + .9, 0, PZ1 - .9, 0],
                       [-1.6, PH, HZ1 + .7, 0], [1.6, PH, HZ1 + .7, 0], [-SDX - 1.2, PH, HZ1 + .7, 0], [SDX + 1.2, PH, HZ1 + .7, 0]];
    palaceGuards(G, list, [[-4.4, 0, CZ + 1.1, 0], [4.4, 0, CZ + 1.1, 0], [-2.9, 0, CZ - 1.6, Math.PI / 2], [2.9, 0, CZ - 1.6, -Math.PI / 2],
      [-4.4, 0, -CZB - 1.1, Math.PI], [4.4, 0, -CZB - 1.1, Math.PI], [-2.9, 0, -CZB + 1.6, Math.PI / 2], [2.9, 0, -CZB + 1.6, -Math.PI / 2],
      [-3.4, 0, 2 * ZM - ZX + 1, 0], [3.4, 0, 2 * ZM - ZX + 1, 0],
      ...faceSpots.slice(2), ...faceSpots.map(([gx, gy, gz, r]) => [-gx, gy, 2 * ZM - gz, r + Math.PI])]);
    // keep the outside camera above the hall and its spires
    const xs = [], zs = [];
    [[-PX - 1, FZ - 1], [PX + 1, FZ - 1], [-PX - 1, PZ1 + SW + 1], [PX + 1, PZ1 + SW + 1]].forEach(([lx, lz]) => { const w = G.localToWorld(V(lx, 0, lz)); xs.push(w.x); zs.push(w.z); });
    TALL.push({ x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), h: 26 });
  }
