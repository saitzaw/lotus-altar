    /* ---------- ႁေႃၶမ်း the Haw Kham, the saopha's palace, on open ground east of the stupa hill behind the church, after the old
       photographs of the Shan haws: a long low teak hall on a high whitewashed plinth with a pierced parapet, a stair climbing
       along the plinth's face to a landing before the doors, a verandah of slender white posts under a wide skirt roof all round,
       and above it a dark band of upper wall under the upper roofs: a cluster of parallel carved gables at the east end, the
       seven-tiered pyatthat over the throne room, a long hipped roof with two raised ridge vents, and a lesser tiered spire at the
       west end; all inside a whitewashed wall and gate. Its doors lead to the throne room (`hawHall`) ---------- */
    /* ---------- the saopha's guards, dressed like the Shan singer on the festival stage but all in black: a long black silk jacket
       studded with silver, baggy black trousers, a black headcloth with its tail over the right shoulder, a straw hat slung on the
       back, a sword on a green cord hung with wool pom-poms, and a spear held upright at the right side. They stand still at the
       gate and about the palace. Every piece but the jacket (which answers to a tap) is baked into shared instanced meshes ---------- */
    function palaceGuards(G, CZ, SX, SZ, PH, HZ1, SDX) {
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
      // two outside the gate, two inside it facing the walk, one at the stair's foot, two at the throne room's doors, one at each lesser door
      [[-4.4, 0, CZ + 1.1, 0], [4.4, 0, CZ + 1.1, 0], [-2.9, 0, CZ - 1.6, Math.PI / 2], [2.9, 0, CZ - 1.6, -Math.PI / 2], [SX - 1.1, 0, SZ + .45, 0],
       [-1.6, PH, HZ1 + .7, 0], [1.6, PH, HZ1 + .7, 0], [-SDX - 1.2, PH, HZ1 + .7, 0], [SDX + 1.2, PH, HZ1 + .7, 0]].forEach(a => guard(...a));
      bakeParts(GG);
    }
    function hawKham(x, z, ry) {
      const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; g.add(G);   // its front (local +z) faces the town; local +x is west
      const CX = 22, CZ = 16;   // the compound's half sizes
      const red = std({ color: 0x8a1e14, roughness: .45 }), tile = std({ color: 0x7a2a1c, roughness: .7 }), gravel = std({ color: 0xb8a888, roughness: 1 });
      const data = { tip: `${SHAN_NAMES.haw} · the Haw Kham, the saopha's palace`, toast: `${SHAN_NAMES.haw}, the Haw Kham or golden palace: the haw of Hsenwi's saopha (${SHAN_NAMES.saopha}, "lord of the sky"), the prince who ruled the Shan state from here. A long teak hall on a high whitewashed plinth, a verandah of slender posts all round, the throne room under the seven-tiered pyatthat, and the stair climbing along the plinth to its doors. The saophas gave up their powers in 1959.` };
      // the courtyard, raked gravel inside the wall, and the whitewashed wall itself with a red tile coping, open at the gate
      flat(mesh(new THREE.BoxGeometry(2 * CX, .04, 2 * CZ), gravel, 0, .025, 0, G)).receiveShadow = true;
      flat(mesh(new THREE.BoxGeometry(4.8, .05, 5.7), M.stone, 0, .035, CZ + 2.75, G));   // the paved walk out of the gate to the palace lane
      [[-CX, CX, -CZ, -CZ], [-CX, -CX, -CZ, CZ], [CX, CX, -CZ, CZ], [-CX, -3.4, CZ, CZ], [3.4, CX, CZ, CZ]].forEach(([a, b, c, d]) => {
        const w = Math.max(b - a, .4), dd = Math.max(d - c, .4), mx = (a + b) / 2, mz = (c + d) / 2;
        mesh(new THREE.BoxGeometry(w, 2.2, dd), white, mx, 1.1, mz, G);
        mesh(new THREE.BoxGeometry(w + .2, .18, dd + .2), tile, mx, 2.29, mz, G);
        sRect(G, mx - w / 2, mx + w / 2, mz - dd / 2, mz + dd / 2);
      });
      // the gate: white pillars under a beam carrying a little three-tiered pyatthat, a lantern on each pillar lit at night
      const lamps = [];
      [-1, 1].forEach(sd => {
        mesh(new THREE.BoxGeometry(1, 4.2, 1), white, sd * 3, 2.1, CZ, G); mesh(new THREE.BoxGeometry(1.2, .2, 1.2), M.trim, sd * 3, 4.25, CZ, G);
        sRect(G, sd * 3 - .5, sd * 3 + .5, CZ - .5, CZ + .5);
        const b = glowSprite(0xffd060, 1.1, .8); b.position.set(sd * 3, 3.4, CZ + .7); G.add(b); lamps.push(b);
      });
      mesh(new THREE.BoxGeometry(7.2, .6, 1.4), red, 0, 4.6, CZ, G); mesh(new THREE.BoxGeometry(7.4, .14, 1.5), M.trim, 0, 4.95, CZ, G);
      pyatthat(G, 0, 5, CZ, 2.6, 3);
      onDaylight(d => lamps.forEach(b => b.material.opacity = .85 * (1 - d)));
      // the sizes: the plinth (PH high, PX half wide, from PZ0 at the back to PZ1 at the front), the hall on it (HX half wide, from HZ0
      // to HZ1, walls WH high up to yW), and the stair along the plinth's face: SW wide, n steps rising toward +x from its foot at SX
      // to the landing (LX half wide) before the doors
      const PH = 2.4, PX = 18, PZ0 = -14.2, PZ1 = 2, HX = 15, HZ0 = -11.2, HZ1 = -1, HC = (HZ0 + HZ1) / 2, HD = HZ1 - HZ0, WH = 4.6, yW = PH + WH;
      const SDX = 8.75, SW = 2.2, n = 14, tread = .34, run = n * tread, LX = 1.1, SX = -LX - run, EH = PH + 3, ED = .75;   // EH: the verandah's eaves; ED: the parapet's no-go strip
      // the paved way from the gate to the landing's foot and along to the stair's foot
      flat(mesh(new THREE.BoxGeometry(3.4, .05, CZ - PZ1 - SW - .2), M.stone, 0, .045, (CZ + PZ1 + SW + .2) / 2, G));
      flat(mesh(new THREE.BoxGeometry(1.7 - SX + 1.4, .05, 2.2), M.stone, (1.7 + SX - 1.4) / 2, .046, PZ1 + SW + 1.3, G));
      // walkable: the hall's walls block; the plinth's top is the verandah, kept in by the parapet but open to the landing; the landing,
      // and the stair from the courtyard, its outer wall blocking
      sRect(G, -HX, HX, HZ0, HZ1);
      sRect(G, -PX, PX, PZ0, PZ1, (lx, lz) => Math.min(PX - Math.abs(lx), lz - PZ0, PZ1 - lz) < ED && !(lz > 0 && Math.abs(lx) < LX - .3) ? null : PH);
      sRect(G, -LX, LX, PZ1, PZ1 + SW, (lx, lz) => lx > LX - .45 || lz > PZ1 + SW - .45 ? null : PH);
      sRect(G, SX - .6, SX, PZ1 + SW - .6, PZ1 + SW + .15);   // the lotus-bud pier at the stair's foot
      sRect(G, SX, -LX, PZ1, PZ1 + SW, (lx, lz) => lz > PZ1 + SW - .45 ? null : PH * clamp((lx - SX) / run, 0, 1));   // open at its foot, where you step on
      // the plinth: whitewashed brick, a moulded foot and cornice, paved on top
      const paveT = canvasTex(128, (c, sz) => { c.fillStyle = "#b8b0a0"; c.fillRect(0, 0, sz, sz); for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { const v = 172 + ((r * 3 + k * 5) % 4) * 9; c.fillStyle = `rgb(${v},${v - 5},${v - 14})`; c.fillRect(k * 32 + 1, r * 32 + 1, 30, 30); } });
      paveT.wrapS = paveT.wrapT = THREE.RepeatWrapping; paveT.repeat.set(PX / 1.2, (PZ1 - PZ0) / 2.4);
      const pave = std({ map: paveT, roughness: .85 });
      mesh(new THREE.BoxGeometry(2 * PX, PH, PZ1 - PZ0), [white, white, pave, white, white, white], 0, PH / 2, (PZ0 + PZ1) / 2, G);
      mesh(new THREE.BoxGeometry(2 * PX + .3, .35, PZ1 - PZ0 + .3), white, 0, .175, (PZ0 + PZ1) / 2, G);
      mesh(new THREE.BoxGeometry(2 * PX + .2, .14, PZ1 - PZ0 + .2), white, 0, PH - .3, (PZ0 + PZ1) / 2, G);
      mesh(new THREE.BoxGeometry(2 * LX, PH, SW), [white, white, pave, white, white, white], 0, PH / 2, PZ1 + SW / 2, G);   // the landing
      // the parapet: whitewashed, a row of little pointed niches pierced along it under a moulded coping, open where the landing meets it
      const niT = canvasTex(128, (c, sz) => { c.fillStyle = "#f2eee4"; c.fillRect(0, 0, sz, sz); c.fillStyle = "#2a2622"; [16, 80].forEach(x => { c.beginPath(); c.moveTo(x, 92); c.lineTo(x, 58); c.quadraticCurveTo(x, 40, x + 16, 28); c.quadraticCurveTo(x + 32, 40, x + 32, 58); c.lineTo(x + 32, 92); c.fill(); }); c.fillStyle = "#d8d2c4"; c.fillRect(0, 104, sz, 6); });
      niT.wrapS = THREE.RepeatWrapping;
      const para = (x0, x1, z0, z1) => {
        const w = x1 - x0, d = z1 - z0, geo = new THREE.BoxGeometry(w, .9, d), uv = geo.attributes.uv, s = Math.max(w, d) / 1.2;
        for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * s);
        const t = niT.clone(); t.needsUpdate = true;
        mesh(geo, std({ map: t, roughness: .85 }), (x0 + x1) / 2, PH + .45, (z0 + z1) / 2, G);
        mesh(new THREE.BoxGeometry(w + .12, .1, d + .12), white, (x0 + x1) / 2, PH + .95, (z0 + z1) / 2, G);
      };
      para(-PX, -LX, PZ1 - .3, PZ1); para(LX, PX, PZ1 - .3, PZ1); para(-PX, PX, PZ0, PZ0 + .3);
      para(-PX, -PX + .3, PZ0 + .3, PZ1 - .3); para(PX - .3, PX, PZ0 + .3, PZ1 - .3);
      para(-LX, LX, PZ1 + SW - .3, PZ1 + SW); para(LX - .3, LX, PZ1, PZ1 + SW - .3);
      // a pier crowned with a lotus bud at each corner of the plinth and the landing, and at the stair's foot
      const newel = (nx, nz, y) => {
        mesh(new THREE.BoxGeometry(.6, 1.25, .6), white, nx, y + .62, nz, G);
        mesh(new THREE.BoxGeometry(.72, .1, .72), M.trim, nx, y + 1.28, nz, G);
        const bud = mesh(new THREE.SphereGeometry(.2, 14, 10), white, nx, y + 1.6, nz, G); bud.scale.y = 1.35;
        mesh(new THREE.ConeGeometry(.07, .3, 10), M.gold, nx, y + 1.92, nz, G);
      };
      [[-PX, PZ0], [PX, PZ0], [-PX, PZ1], [PX, PZ1], [-LX, PZ1 + SW], [LX, PZ1 + SW]].forEach(([nx, nz]) => newel(nx + (nx > 0 ? -.3 : .3), nz + (nz > 0 ? -.3 : .3), PH));
      newel(SX - .3, PZ1 + SW - .15, 0);
      // the stair along the plinth's face, rising toward the landing between the plinth and a sloping white wall with a moulded coping
      const rise = PH / n;
      for (let i = 0; i < n; i++) mesh(new THREE.BoxGeometry(tread, (i + 1) * rise, SW - .3), white, SX + (i + .5) * tread, (i + 1) * rise / 2, PZ1 + (SW - .3) / 2, G);
      const sw = new THREE.Shape(); sw.moveTo(SX, 0); sw.lineTo(SX, .9); sw.lineTo(-LX, PH + .9); sw.lineTo(-LX, 0); sw.closePath();
      mesh(new THREE.ExtrudeGeometry(sw, { depth: .3, bevelEnabled: false }), white, 0, 0, PZ1 + SW - .3, G);
      const cope = mesh(new THREE.BoxGeometry(Math.hypot(run, PH) + .1, .1, .42), white, SX + run / 2, .9 + PH / 2 + .05, PZ1 + SW - .15, G); cope.rotation.z = Math.atan2(PH, run);
      // the verandah: slender white posts round the plinth's edge under a beam, the hall's dark teak walls behind, banded in gilt,
      // tall windows in gilt frames lamplit at night
      const posts = [], m4 = new THREE.Matrix4();
      for (let px = -PX + .55; px <= PX - .54; px += (2 * PX - 1.1) / 16) { if (Math.abs(px) > 1.4) posts.push([px, PZ1 - .55]); posts.push([px, PZ0 + .55]); }
      for (let pz = PZ0 + .55 + (PZ1 - PZ0 - 1.1) / 6; pz < PZ1 - .6; pz += (PZ1 - PZ0 - 1.1) / 6) [-1, 1].forEach(sd => posts.push([sd * (PX - .55), pz]));
      const post = new THREE.InstancedMesh(new THREE.CylinderGeometry(.1, .12, EH - PH, 8), white, posts.length);
      posts.forEach(([px, pz], i) => post.setMatrixAt(i, m4.makeTranslation(px, (PH + EH) / 2, pz)));
      G.add(post); post.castShadow = true;
      [[0, PZ1 - .55, 2 * PX - .9, .22], [0, PZ0 + .55, 2 * PX - .9, .22], [-PX + .55, (PZ0 + PZ1) / 2, .22, PZ1 - PZ0 - 1.1], [PX - .55, (PZ0 + PZ1) / 2, .22, PZ1 - PZ0 - 1.1]]
        .forEach(([bx, bz, w, d]) => mesh(new THREE.BoxGeometry(w, .3, d), teakDark, bx, EH - .15, bz, G));
      mesh(new THREE.BoxGeometry(2 * HX, WH, HD), teak, 0, PH + WH / 2, HC, G);
      [PH + .25, PH + 3.05].forEach(y => mesh(new THREE.BoxGeometry(2 * HX + .08, .2, HD + .08), M.trim, 0, y, HC, G));
      const win = (wx, wz, r) => { const o = new THREE.Group(); o.position.set(wx, PH + 1.55, wz); o.rotation.y = r; G.add(o); mesh(new THREE.BoxGeometry(1.1, 2, .06), M.trim, 0, 0, .02, o); mesh(new THREE.PlaneGeometry(.86, 1.76), pane, 0, 0, .06, o); };
      for (let i = 0; i < 12; i++) { const wx = -HX + (i + .5) * 2 * HX / 12; if (Math.abs(wx) > 1.6 && Math.abs(Math.abs(wx) - SDX) > .5) win(wx, HZ1, 0); }
      for (let i = 0; i < 3; i++) [-1, 1].forEach(sd => win(sd * HX, HZ0 + (i + .5) * HD / 3, sd * Math.PI / 2));
      // the doors of the throne room, gilt-framed under a pointed gilt pediment, and the name board above them
      const door = mesh(new THREE.BoxGeometry(1.8, 2.8, .1), red, 0, PH + 1.4, HZ1 + .03, G);
      [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.14, 2.9, .14), M.gold, sd * .95, PH + 1.45, HZ1 + .05, G));
      mesh(new THREE.BoxGeometry(2.1, .14, .14), M.gold, 0, PH + 2.85, HZ1 + .05, G);
      [-.45, .45].forEach(dx => mesh(new THREE.BoxGeometry(.6, 2.3, .02), M.trim, dx, PH + 1.4, HZ1 + .09, G));
      const ped = mesh(new THREE.ConeGeometry(1.1, .8, 4), M.gold, 0, PH + 3.35, HZ1 + .05, G); ped.rotation.y = Math.PI / 4; ped.scale.z = .12;
      // the lesser doors either side: on the left (east) the hall of justice, on the right (west) the hall where the saopha receives the monks
      const sideDoors = [[-SDX, "hawJustice", "the hall of justice"], [SDX, "hawMonks", "the hall where the saopha receives the monks"]].map(([dx, key, what]) => {
        const d = mesh(new THREE.BoxGeometry(1.4, 2.5, .1), red, dx, PH + 1.25, HZ1 + .03, G);
        [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.12, 2.6, .14), M.gold, dx + sd * .74, PH + 1.3, HZ1 + .05, G));
        mesh(new THREE.BoxGeometry(1.6, .12, .14), M.gold, dx, PH + 2.56, HZ1 + .05, G);
        const pd = mesh(new THREE.ConeGeometry(.85, .6, 4), M.gold, dx, PH + 2.92, HZ1 + .05, G); pd.rotation.y = Math.PI / 4; pd.scale.z = .12;
        return [d, key, what, dx];
      });
      const BW = 3.2, BH = BW * 300 / 1024, board = mesh(new THREE.BoxGeometry(BW, BH, .08), [teakDark, teakDark, teakDark, teakDark, shanBoardFace(SHAN_NAMES.haw, "Haw Kham"), teakDark], 0, PH + 3.85 + BH / 2, HZ1 + .06, G);
      // the roofs, corrugated iron like the monastery's, laid on as hipped planes: `hip` runs four slopes from the eave rectangle
      // o [x0, x1, z0, z1] at y0 up to the rectangle (or ridge line) t at y1, the corrugations running down each slope
      const hipT = corrugated("#6a3a24", "#8e5838", "#40200f"), hipM = std({ map: hipT, roughness: .5, metalness: .35, side: THREE.DoubleSide });
      const hip = (o, t, y0, y1) => {
        const pos = [], uv = [], O = (i, j) => [o[i], y0, o[j]], T = (i, j) => [t[i], y1, t[j]];
        const quad = (pts, alongX) => [0, 1, 2, 0, 2, 3].forEach(k => { const p = pts[k]; pos.push(...p); uv.push(alongX ? p[0] : p[2], alongX ? p[2] : p[0]); });
        quad([O(0, 3), O(1, 3), T(1, 3), T(0, 3)], true); quad([O(1, 2), O(0, 2), T(0, 2), T(1, 2)], true);
        quad([O(0, 2), O(0, 3), T(0, 3), T(0, 2)], false); quad([O(1, 3), O(1, 2), T(1, 2), T(1, 3)], false);
        const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geo.computeVertexNormals();
        return mesh(geo, hipM, 0, 0, 0, G);
      };
      // the skirt roof over the verandah all round, from the posts' beam up to the top of the hall's walls
      hip([-PX - .7, PX + .7, PZ0 - .7, PZ1 + .7], [-HX, HX, HZ0, HZ1], EH - .74, yW);   // the verandah is 3 m deep all round, so it lands on the beam everywhere
      // the east end: three parallel gables facing the courtyard, stepped up toward the throne room, and a lower row of little
      // gables over the verandah before them
      [[-14, 1.9], [-11.45, 2.2], [-8.9, 2.5]].forEach(([cx, h], i) => {
        if (i) mesh(new THREE.BoxGeometry(2.7, i * .3, HD), teakDark, cx, yW + i * .15, HC, G);
        gable(G, cx, yW + i * .3, HC, 2.7, HD + 1.2, h);
        gable(G, cx, EH - .05, PZ1 - 1.9, 2.4, 3.2, 1.3);
      });
      // the throne room: a raised dark clerestory under a broad carved gable, the seven-tiered pyatthat rising from its ridge
      mesh(new THREE.BoxGeometry(6, .8, HD), teakDark, -4.8, yW + .4, HC, G);
      gable(G, -4.8, yW + .8, HC, 6.4, HD + 1.2, 3);
      pyatthat(G, -4.8, yW + 3, HC, 5.2, 7, .12);
      // the long middle hall: a dark band of upper wall with a gilt rail, a low hipped roof, and two raised vents along the ridge,
      // each a slatted box under its own little hipped roof
      const MX0 = -1.6, MX1 = 12.2;
      mesh(new THREE.BoxGeometry(MX1 - MX0, 1.2, HD), teakDark, (MX0 + MX1) / 2, yW + .6, HC, G);
      mesh(new THREE.BoxGeometry(MX1 - MX0 + .06, .1, HD + .06), M.trim, (MX0 + MX1) / 2, yW + 1.1, HC, G);
      const yM = yW + 1.2, yRdg = yM + 2;
      hip([MX0 - .6, MX1 + .6, HZ0 - .6, HZ1 + .6], [MX0 + 1.8, MX1 - 1.8, HC, HC], yM, yRdg);
      [[MX0 + 1.2, (MX0 + MX1) / 2 - .4], [(MX0 + MX1) / 2 + .4, MX1 - 1.2]].forEach(([a, b]) => {
        mesh(new THREE.BoxGeometry(b - a, 1, 1.6), teakDark, (a + b) / 2, yRdg + .1, HC, G);
        hip([a - .35, b + .35, HC - 1.3, HC + 1.3], [a + .5, b - .5, HC, HC], yRdg + .55, yRdg + 1.2);
      });
      // the west end: a lesser gabled block under a five-tiered spire
      mesh(new THREE.BoxGeometry(2.8, .8, HD), teakDark, 13.6, yW + .4, HC, G);
      gable(G, 13.6, yW + .8, HC, 3.8, HD + 1.2, 2.4);
      pyatthat(G, 13.6, yW + 2.4, HC, 3.8, 5, .15);
      G.updateMatrixWorld(true);
      [[-CX + 3, CZ - 3], [CX - 3, CZ - 3]].forEach(([lx, lz], i) => { const w = G.localToWorld(V(lx, 0, lz)); tree(g, w.x, w.z, .9, 820 + i); });
      G.traverse(o => { if (o.isMesh && o !== door && !sideDoors.some(sd => sd[0] === o)) clickable(list, o, data); });
      clickable(list, door, { floor: "haw", tip: `Enter the throne room of ${SHAN_NAMES.haw}` });
      sideDoors.forEach(([d, key, what]) => clickable(list, d, { floor: key, tip: `Enter ${what} of ${SHAN_NAMES.haw}` }));
      palaceGuards(G, CZ, SX, PZ1 + SW, PH, HZ1, SDX);
      Object.assign(board.userData, { toast: data.toast });
      // where you come out of each hall: on the verandah before its doors, looking out over the courtyard
      PALACE.exits = {};
      [[0, "haw"], ...sideDoors.map(([, key, , dx]) => [dx, key])].forEach(([dx, key]) => { const ex = G.localToWorld(V(dx, 0, HZ1 + 1.1)), look = G.localToWorld(V(dx * .5, 0, CZ + 6)); PALACE.exits[key] = [[ex.x, ex.z], [look.x, look.z]]; });
      // keep the outside camera above the hall and its spires
      const xs = [], zs = [];
      [[-PX - 1, PZ0 - 1], [PX + 1, PZ0 - 1], [-PX - 1, PZ1 + SW + 1], [PX + 1, PZ1 + SW + 1]].forEach(([lx, lz]) => { const w = G.localToWorld(V(lx, 0, lz)); xs.push(w.x); zs.push(w.z); });
      TALL.push({ x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), h: 26 });
    }
  }
