    /* ---------- ႁေႃၶမ်း the Haw Kham, the saopha's palace, on open ground east of the stupa hill behind the church, after the old
       photographs of the Shan haws: a long low teak hall on a high whitewashed plinth with a pierced parapet, a stair climbing
       along the plinth's face to a landing before the doors, a verandah of slender white posts under a wide skirt roof all round,
       and above it a dark band of upper wall under the upper roofs: a cluster of parallel carved gables at the east end, the
       seven-tiered pyatthat over the throne room, a long hipped roof with two raised ridge vents, and a lesser tiered spire at the
       west end; all inside a whitewashed wall and gate. Its doors lead to the throne room (`hawHall`) ---------- */
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
      const SW = 2.2, n = 14, tread = .34, run = n * tread, LX = 1.1, SX = -LX - run, EH = PH + 3, ED = .75;   // EH: the verandah's eaves; ED: the parapet's no-go strip
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
      for (let i = 0; i < 12; i++) { const wx = -HX + (i + .5) * 2 * HX / 12; if (Math.abs(wx) > 1.6) win(wx, HZ1, 0); }
      for (let i = 0; i < 3; i++) [-1, 1].forEach(sd => win(sd * HX, HZ0 + (i + .5) * HD / 3, sd * Math.PI / 2));
      // the doors of the throne room, gilt-framed under a pointed gilt pediment, and the name board above them
      const door = mesh(new THREE.BoxGeometry(1.8, 2.8, .1), red, 0, PH + 1.4, HZ1 + .03, G);
      [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.14, 2.9, .14), M.gold, sd * .95, PH + 1.45, HZ1 + .05, G));
      mesh(new THREE.BoxGeometry(2.1, .14, .14), M.gold, 0, PH + 2.85, HZ1 + .05, G);
      [-.45, .45].forEach(dx => mesh(new THREE.BoxGeometry(.6, 2.3, .02), M.trim, dx, PH + 1.4, HZ1 + .09, G));
      const ped = mesh(new THREE.ConeGeometry(1.1, .8, 4), M.gold, 0, PH + 3.35, HZ1 + .05, G); ped.rotation.y = Math.PI / 4; ped.scale.z = .12;
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
      G.traverse(o => { if (o.isMesh && o !== door) clickable(list, o, data); });
      clickable(list, door, { floor: "haw", tip: `Enter the throne room of ${SHAN_NAMES.haw}` });
      Object.assign(board.userData, { toast: data.toast });
      // where you come out of the throne room: on the verandah before the doors, looking down over the courtyard to the gate
      const ex = G.localToWorld(V(0, 0, HZ1 + 1.1)), look = G.localToWorld(V(0, 0, CZ + 6));
      PALACE.exit = [[ex.x, ex.z], [look.x, look.z]];
      // keep the outside camera above the hall and its spires
      const xs = [], zs = [];
      [[-PX - 1, PZ0 - 1], [PX + 1, PZ0 - 1], [-PX - 1, PZ1 + SW + 1], [PX + 1, PZ1 + SW + 1]].forEach(([lx, lz]) => { const w = G.localToWorld(V(lx, 0, lz)); xs.push(w.x); zs.push(w.z); });
      TALL.push({ x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), h: 26 });
    }
  }
