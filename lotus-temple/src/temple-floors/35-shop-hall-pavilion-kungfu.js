    // 法物流通處 and 寮房: a two-storey hall on the left of the pond, the temple shop below and the monks' quarters above.
    // It faces the pond (local +z points to world +x).
    function shopHall(o) {
      const b = new THREE.Group(); b.position.set(o.x, 0, o.z); b.rotation.y = Math.PI / 2; g.add(b);
      const W = o.w, D = o.d, base = .4, H1 = 3.4, H2 = 2.8;
      const data = { tip: "The temple shop, with the monks' rooms beside and above it" };
      const FZ0 = D / 2 - 1.3;
      sRect(b, -W / 2 - .3, W / 2 + .3, -D / 2 - .3, FZ0 + .1);                                      // the building behind the porch
      [0, 1, 2, 3, 4, 5, 6].forEach(i => sCircle(b, -W / 2 + .4 + i * (W - .8) / 6, D / 2 - .3, .2));   // the porch columns
      sRect(b, -W / 2 - .5, W / 2 + .5, -D / 2 - .5, D / 2 + .5, base);                              // the porch floor
      sRect(b, -W / 2 + 1, W / 2 - 1, D / 2 + .5, D / 2 + 1.3, (lx, lz) => base * (1 - (lz - D / 2 - .5) / .8));   // the front steps
      const granite = std({ color: 0x8c877d, roughness: .8 });
      mesh(new THREE.BoxGeometry(W + 1, base, D + 1), granite, 0, base / 2, 0, b);
      for (let i = 0; i < 2; i++) mesh(new THREE.BoxGeometry(W - 2, base - i * .2, .4), granite, 0, (base - i * .2) / 2, D / 2 + .7 + i * .4, b);
      // ground floor: red walls, an open shopfront behind a row of columns
      const FZ = D / 2 - 1.3;
      clickable(list, mesh(new THREE.BoxGeometry(W, H1, .3), M.lacquer, 0, base + H1 / 2, -D / 2 + .15, b), data);
      [-1, 1].forEach(sx => clickable(list, mesh(new THREE.BoxGeometry(.3, H1, D), M.lacquer, sx * (W / 2 - .15), base + H1 / 2, 0, b), data));
      // the front wall with two doorways, both standing open: the shop in the middle, and the monks' dining and rest room to the right
      const DOORS = [{ x: 0, w: 2.6, to: "shop", tip: "Enter the temple shop · buy offerings" }, { x: 5.4, w: 1.6, to: "quarters", tip: "Enter the monks' dining and rest room" }];
      const frontWall = std({ color: 0x5a1a10, roughness: .7 }), dark = new THREE.MeshBasicMaterial({ color: 0x120804 });
      let wx = -W / 2 + .3;
      [...DOORS, { x: W / 2 - .3 + 1e-3, w: 0 }].forEach(d => {
        const x0 = d.x - d.w / 2, len = x0 - wx;
        if (len > .01) clickable(list, mesh(new THREE.BoxGeometry(len, H1, .2), frontWall, wx + len / 2, base + H1 / 2, FZ - .1, b), data);
        if (!d.w) return;
        const DH = 2.6;
        mesh(new THREE.BoxGeometry(d.w, H1 - DH, .2), frontWall, d.x, base + DH + (H1 - DH) / 2, FZ - .1, b);
        const hole = mesh(new THREE.PlaneGeometry(d.w, DH), dark, d.x, base + DH / 2, FZ - .25, b);
        clickable(list, hole, { floor: d.to, tip: d.tip });
        [-1, 1].forEach(sd => {   // the frame, and the leaves folded back against the wall
          mesh(new THREE.BoxGeometry(.14, DH + .1, .26), M.lacquer, d.x + sd * (d.w / 2 + .07), base + DH / 2, FZ - .1, b);
          const leaf = mesh(new THREE.BoxGeometry(d.w / 2 - .04, DH - .1, .07), std({ color: 0x9c1c12, roughness: .45 }), d.x + sd * (d.w / 2 + .05), base + DH / 2, FZ + d.w / 4 + .05, b);
          leaf.rotation.y = Math.PI / 2;
        });
        mesh(new THREE.BoxGeometry(d.w + .4, .16, .28), M.lacquer, d.x, base + DH + .08, FZ - .1, b);
        if (d.to === "quarters") {
          const board = writing(512, 128, (c, cw, ch) => {
            c.fillStyle = "#2a1610"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.strokeRect(5, 5, cw - 10, ch - 10);
            c.fillStyle = "#e8c25a"; c.font = '600 46px "Figtree", sans-serif'; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Dining & Rest", cw / 2, ch / 2 + 2);
          });
          flat(mesh(new THREE.PlaneGeometry(1.9, .48), new THREE.MeshStandardMaterial({ map: board, roughness: .6, emissive: 0x222222, emissiveMap: board }), d.x, base + DH + .5, FZ + .02, b));
        }
        wx = d.x + d.w / 2;
      });
      const inside = new THREE.PointLight(0xffc080, .8, 5, 2); inside.position.set(0, base + 1.6, FZ + 1.2); b.add(inside);
      for (let x = -W / 2 + .4; x <= W / 2 - .39; x += (W - .8) / 6) {
        mesh(new THREE.CylinderGeometry(.16, .18, H1, 14), pillarRed, x, base + H1 / 2, D / 2 - .3, b);
        mesh(new THREE.CylinderGeometry(.26, .28, .12, 14), M.stone, x, base + .06, D / 2 - .3, b);
      }
      mesh(new THREE.BoxGeometry(W, .4, .3), beamMat, 0, base + H1 - .2, D / 2 - .3, b);
      flat(mesh(new THREE.PlaneGeometry(W - .6, 1.3), std({ color: 0x3a1a10, roughness: .7 }), 0, base + H1 - .4, D / 2 - .95, b)).rotation.x = Math.PI / 2;
      // the shop in the middle three bays: a counter, shelves of incense boxes and hanging rosaries, under a signboard
      const goodsCols = [0xc0201a, 0xd8a83a, 0x2f6a5a, 0x3a5a8a, 0xb8683a, 0xe8e2d4].map(c => std({ color: c, roughness: .6 }));
      const signTex = writing(1024, 192, (c, cw, ch) => {
        c.fillStyle = "#2a1610"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(118); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("法物流通處", cw / 2, ch / 2 + 8);
      });
      flat(mesh(new THREE.PlaneGeometry(4.2, .8), new THREE.MeshStandardMaterial({ map: signTex, roughness: .6, emissive: 0x2a2a2a, emissiveMap: signTex }), 0, base + H1 - .78, D / 2 - .13, b));
      latticeWindows(b, [-7.6, -5.4, -2.6, 2.6, 7.6].map(x => ({ p: V(x, base + 1.7, FZ + .02), ry: 0, w: 1.4, h: 2.0 })), lampPane(0xffa040, .7));
      const shopLight = new THREE.PointLight(0xffc080, 1.4, 9, 2); shopLight.position.set(0, base + 2.6, FZ + 1.6); b.add(shopLight);
      [-3.6, 3.6].forEach(x => lantern(b, x, base + 2.6, D / 2 - .3, base + H1 - .4, 1));
      // the skirt eave between the floors, then the monks' quarters: a balcony with a red railing and a row of lattice windows
      let top = base + H1;
      const EBZ = D / 2 + 1.0, t0 = (D / 2 - .9) / EBZ;
      tiledHipRoof(b, 0, 0, top + .05 - 1.4 * Math.pow(1 - t0, 1.6), W / 2 + 1.0, EBZ, 1.4, .35, [t0, ...[.5, .6, .7, .8, .88, .93].filter(t => t > t0 + .02)], .9, false);
      const UD = D - 1.4;
      clickable(list, mesh(new THREE.BoxGeometry(W - .6, H2, UD), M.lacquer, 0, top + H2 / 2, -.7, b), data);
      const uwins = []; for (let x = -W / 2 + 1.4; x <= W / 2 - 1.3; x += 1.9) uwins.push({ p: V(x, top + 1.35, -.7 + UD / 2 + .02), ry: 0, w: 1.1, h: 1.5 });
      latticeWindows(b, uwins, lampPane(0xffb050, .55));
      const roomSign = writing(256, 96, (c, cw, ch) => {
        c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.strokeRect(5, 5, cw - 10, ch - 10);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(56); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("寮房", cw / 2, ch / 2 + 4);
      });
      flat(mesh(new THREE.PlaneGeometry(.9, .34), new THREE.MeshStandardMaterial({ map: roomSign, roughness: .6, emissive: 0x222222, emissiveMap: roomSign }), 0, top + 2.4, -.7 + UD / 2 + .04, b));
      const rail = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), redRail, 80), m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(); let k = 0;
      const RZ = -.7 + UD / 2 + .65, put = (x, y, z, a, bb, c) => rail.setMatrixAt(k++, m4.compose(V(x, y, z), q0, V(a, bb, c)));
      put(0, top + .95, RZ, W - 1.0, .07, .08); put(0, top + .35, RZ, W - 1.0, .05, .06);
      for (let i = 0; i < 40; i++) put(-W / 2 + .5 + i * (W - 1.0) / 39, top + .65, RZ, .05, .6, .05);
      rail.count = k; b.add(rail);
      mesh(new THREE.BoxGeometry(W - .8, .1, .75), M.wood, 0, top + .1, RZ - .3, b);
      top += H2;
      const RAX = W / 2 + 1.2, RBZ = D / 2 + .6;
      tiledHipRoof(b, 0, -.4, top - .1, RAX, RBZ, 1.8, .55, [0, .1, .2, .3, .4, .5, .6, .7, .8, .88, .93], 1.0);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const l = flat(mesh(lanternGeo, lanternMat, sx * (RAX - .3), top - .5, -.4 + sz * (RBZ - .3), b)); l.scale.set(.6, .72, .6); });
    }
    // 觀蓮亭, the lotus-viewing pavilion: an open eight-sided pavilion standing out over the water, with lean-back benches
    // (美人靠) between its columns so visitors can sit and watch the pond; the entrance faces the land
    function lotusPavilion(cx, cz) {
      const b = new THREE.Group(); b.position.set(cx, 0, cz); g.add(b);
      const data = { pavilion: true, tip: "The lotus-viewing pavilion · sit and watch the pond" };
      const PY = .75, RC = 2.25, CH = 2.7, ENTRY = 6;   // the face pointing to -x, toward the land
      // where a walker can stand: the floor inside the benches, and the steps on the land side; where a visitor sits:
      // the bench on the pond side (+x), looking out over the water
      WALKABLE.pav = { cx, cz, PY, inner: 2.0, stepX0: -2.2, stepX1: -3.6, stepHalf: .7 };
      PAV_SEAT = { pos: V(cx + 1.0, PY + .45 + .95, cz), look: V(cx + 12, 1.2, cz) };
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + R8; mesh(new THREE.CylinderGeometry(.28, .32, PY, 10), M.stone, Math.sin(a) * 2.3, PY / 2, Math.cos(a) * 2.3, b); }
      clickable(list, oct(mesh(new THREE.CylinderGeometry(2.75, 2.75, .2, 8), M.stone, 0, PY - .1, 0, b)), data);
      oct(mesh(new THREE.CylinderGeometry(2.78, 2.78, .08, 8, 1, true), M.trim, 0, PY - .17, 0, b));
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * TAU + R8;
        clickable(list, mesh(new THREE.CylinderGeometry(.13, .15, CH, 12), pillarRed, Math.sin(a) * RC, PY + CH / 2, Math.cos(a) * RC, b), data);
      }
      // benches with curved backs leaning out over the water, on every face but the entrance
      const L = 2 * RC * Math.sin(R8) - .3, ap = RC * Math.cos(R8);
      for (let f = 0; f < 8; f++) {
        if (f === ENTRY) continue;
        const a = f / 8 * TAU, bench = new THREE.Group(); bench.position.set(Math.sin(a) * ap, PY, Math.cos(a) * ap); bench.rotation.y = a; b.add(bench);
        mesh(new THREE.BoxGeometry(L, .08, .42), M.wood, 0, .45, -.18, bench);
        mesh(new THREE.BoxGeometry(L, .4, .06), pillarRed, 0, .22, -.02, bench);
        for (let i = 0; i < 7; i++) { const sl = mesh(new THREE.BoxGeometry(.05, .6, .04), pillarRed, -L / 2 + .15 + i * (L - .3) / 6, .78, .08, bench); sl.rotation.x = .45; }
        const top = mesh(new THREE.BoxGeometry(L, .07, .1), pillarRed, 0, 1.05, .2, bench); top.rotation.x = .45;
      }
      paintedBeam(b, PY + CH - .25, RC + .02);
      oct(mesh(new THREE.CylinderGeometry(RC, RC, .05, 8), paintGreen, 0, PY + CH - .5, 0, b));
      brackets(b, PY + CH - .2, RC + .05, 3);
      tiledEave(b, PY + CH - .05, 1.2, 3.4, .8, .45, data, list);
      tiledEave(b, PY + CH + .55, .06, 1.6, 1.3, .25, data, list, false);
      mesh(new THREE.CylinderGeometry(.07, .12, .3, 12), M.gold, 0, PY + CH + 1.95, 0, b);
      mesh(new THREE.SphereGeometry(.2, 16, 12), M.gold, 0, PY + CH + 2.2, 0, b);
      const name = writing(512, 160, (c, cw, ch) => {
        c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(96); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("觀蓮亭", cw / 2, ch / 2 + 6);
      });
      const ea = ENTRY / 8 * TAU, board = flat(mesh(new THREE.PlaneGeometry(1.2, .38), new THREE.MeshStandardMaterial({ map: name, roughness: .6, emissive: 0x222222, emissiveMap: name }), Math.sin(ea) * (RC + .06), PY + CH - .25, Math.cos(ea) * (RC + .06), b));
      board.rotation.y = ea;
      lantern(b, 0, PY + CH - .8, 0, PY + CH - .5, .9);
      const glow = new THREE.PointLight(0xffb070, 1.1, 7, 2); glow.position.set(0, PY + 1.8, 0); b.add(glow);
      // a few stone steps down to the path on the land side
      for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(.45, PY - i * PY / 3, 1.4), M.stone, -(ap + .35 + i * .45), (PY - i * PY / 3) / 2, 0, b);
    }
    shopHall({ x: -25.5, z: 27, w: 18, d: 8 });
    lotusPavilion(-11.9, 26);
    // 演武場, the training ground east of the pagoda, where the monks practise kung fu: a granite square with a stone border,
    // the instructor's platform (點將台) at the back, weapon racks, wooden dummies, stone weights and banners
    function trainingGround(cx, cz, W, D) {
      const b = new THREE.Group(); b.position.set(cx, 0, cz); g.add(b);
      const data = { tip: "The training ground", toast: "The open ground where kung fu is practised: the horse stance, punches and staff forms, led from the platform at the back." };
      const slab = canvasTex(256, (c, sz) => {
        c.fillStyle = "#6a655c"; c.fillRect(0, 0, sz, sz);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { const sh = 128 + ((r * 3 + k * 5) % 5) * 7; c.fillStyle = `rgb(${sh},${sh - 5},${sh - 14})`; c.fillRect(k * 64 + 2, r * 64 + 2, 60, 60); }
      });
      slab.wrapS = slab.wrapT = THREE.RepeatWrapping; slab.repeat.set(W / 4, D / 4);
      const floor = flat(mesh(new THREE.BoxGeometry(W, .12, D), [M.stone, M.stone, std({ map: slab, roughness: .85 }), M.stone, M.stone, M.stone], 0, .06, 0, b));
      clickable(list, floor, data);
      [[0, -D / 2, W + .6, .5], [0, D / 2, W + .6, .5], [-W / 2, 0, .5, D], [W / 2, 0, .5, D]].forEach(([x, z, w, d]) => mesh(new THREE.BoxGeometry(w, .22, d), std({ color: 0x8c877d, roughness: .8 }), x, .11, z, b));
      // the platform: stone steps up to a red-railed dais with a flag on each side and a name board behind
      const PZ = -D / 2 - 1.6, PW = 7, PD = 3, PH = 1.0;
      sRect(b, -PW / 2, PW / 2, PZ - PD / 2, PZ + PD / 2 + 1.2); [-D / 4, D / 4].forEach(z => sRect(b, -W / 2 + .7, -W / 2 + 1.1, z - 1.2, z + 1.2)); [-D / 3, 0, D / 3].forEach(z => sCircle(b, W / 2 - 1.2, z, .4));
      mesh(new THREE.BoxGeometry(PW, PH, PD), std({ color: 0x8c877d, roughness: .8 }), 0, PH / 2, PZ, b);
      for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(2.4, PH - i * PH / 4, .3), M.stone, 0, (PH - i * PH / 4) / 2, PZ + PD / 2 + .15 + i * .3, b);
      const rail = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), redRail, 40), m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(); let k = 0;
      const put = (x, y, z, a, bb, c) => rail.setMatrixAt(k++, m4.compose(V(x, y, z), q0, V(a, bb, c)));
      put(0, PH + .7, PZ - PD / 2 + .1, PW, .07, .08);
      [-1, 1].forEach(sd => { put(sd * (PW / 2 - .05), PH + .7, PZ, .08, .07, PD); for (let i = 0; i < 6; i++) put(sd * (PW / 2 - .05), PH + .35, PZ - PD / 2 + .2 + i * (PD - .4) / 5, .06, .7, .06); });
      for (let i = 0; i < 12; i++) put(-PW / 2 + .3 + i * (PW - .6) / 11, PH + .35, PZ - PD / 2 + .1, .06, .7, .06);
      rail.count = k; b.add(rail);
      const board = writing(512, 160, (c, cw, ch) => {
        c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(96); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("演武場", cw / 2, ch / 2 + 6);
      });
      [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.2, 3.2, .2), M.lacquer, sd * 1.4, PH + 1.6, PZ - PD / 2 - .1, b));
      flat(mesh(new THREE.PlaneGeometry(2.6, .8), new THREE.MeshStandardMaterial({ map: board, roughness: .6, emissive: 0x222222, emissiveMap: board }), 0, PH + 2.9, PZ - PD / 2 - .05, b));
      const flags = [];
      [-1, 1].forEach(sd => {
        const x = sd * (PW / 2 + .6);
        mesh(new THREE.CylinderGeometry(.05, .07, 6, 8), M.lacquer, x, 3, PZ, b);
        mesh(new THREE.SphereGeometry(.12, 10, 8), M.gold, x, 6.05, PZ, b);
        const fg = new THREE.Group(); fg.position.set(x, 5.2, PZ); b.add(fg);
        const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.0, 8, 1), std({ color: sd < 0 ? 0xc8a020 : 0xa42418, roughness: .7, side: THREE.DoubleSide }));
        flag.geometry.translate(.7, -1.0, 0); fg.add(flag); flags.push(flag);
      });
      // weapon racks along the west side: staffs and spears standing in a red frame
      [-D / 4, D / 4].forEach((z, ri) => {
        const rx = -W / 2 + .9;
        [-1.1, 1.1].forEach(dz => mesh(new THREE.BoxGeometry(.12, 2.2, .12), M.lacquer, rx, 1.1, z + dz, b));
        [.5, 1.9].forEach(y => mesh(new THREE.BoxGeometry(.18, .1, 2.4), M.lacquer, rx, y, z, b));
        for (let i = 0; i < 7; i++) {
          const zz = z - .9 + i * .3, spear = i % 2 === ri % 2;
          mesh(new THREE.CylinderGeometry(.025, .025, 2.6, 6), spear ? M.lacquer : M.wood, rx + .05, 1.35, zz, b);
          if (spear) { mesh(new THREE.ConeGeometry(.05, .3, 6), std({ color: 0xc8ccd2, metalness: .8, roughness: .3 }), rx + .05, 2.8, zz, b); mesh(new THREE.SphereGeometry(.07, 6, 4), M.stickRed, rx + .05, 2.6, zz, b); }
        }
      });
      // wooden training dummies (木人樁) and stone lifting weights along the east side
      [-D / 3, 0, D / 3].forEach(z => {
        const x = W / 2 - 1.2;
        mesh(new THREE.CylinderGeometry(.18, .2, 1.9, 12), M.wood, x, 1.0, z, b);
        [[1.45, .4], [1.25, -.4], [.85, 0]].forEach(([y, a]) => { const arm = mesh(new THREE.CylinderGeometry(.04, .04, .5, 6), M.wood, x - .25, y, z + a * .3, b); arm.rotation.z = Math.PI / 2; arm.rotation.y = a; });
      });
      [-D / 2 + 1.3, D / 2 - 1.3].forEach(z => { mesh(new THREE.BoxGeometry(.6, .45, .4), M.stone, W / 2 - 1.2, .35, z, b); mesh(new THREE.TorusGeometry(.14, .04, 6, 12, Math.PI), M.stone, W / 2 - 1.2, .58, z, b); });
      const troupe = lionDragonTroupe(b, list, W, D);   // dragon and lion dance practice before Chinese New Year
      updaters.pagoda.push((dt, t, motion) => {   // the banners wave
        troupe(dt, motion);
        flags.forEach((fl, i) => { const p = fl.geometry.attributes.position; for (let j = 0; j < p.count; j++) { const x = p.getX(j); p.setZ(j, Math.sin(x * 2.5 - t * 3 + i) * .12 * x * motion); } p.needsUpdate = true; });
      });
    }
