    /* ---------- ႁေႃၶမ်း the Haw Kham, the saopha's palace, on open ground east of the stupa hill behind the church: built by the same
       carpenters as the monastery, a teak hall raised on red-lacquered posts with gilt trim, carved gables and a tall pyatthat over
       the throne room, an audience stair under a gabled porch, a lesser hall either side, all inside a whitewashed wall and gate ---------- */
    function hawKham(x, z, ry) {
      const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; g.add(G);   // its front (local +z) faces the town
      const CX = 22, CZ = 16, HZ = -3;   // the compound's half sizes; the hall's centre
      const red = std({ color: 0x8a1e14, roughness: .45 }), tile = std({ color: 0x7a2a1c, roughness: .7 }), gravel = std({ color: 0xb8a888, roughness: 1 });
      const data = { tip: `${SHAN_NAMES.haw} · the Haw Kham, the saopha's palace`, toast: `${SHAN_NAMES.haw}, the Haw Kham or golden palace: the haw of Hsenwi's saopha (${SHAN_NAMES.saopha}, "lord of the sky"), the prince who ruled the Shan state from here. A teak hall on red-lacquered posts, the throne room under the gilded spire of tiered roofs, the audience stair in front. The saophas gave up their powers in 1959.` };
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
      // the hall, in its own frame P: stilts, floor, plank walls with gilt bands, tall windows in gilt frames lamplit at night
      const P = new THREE.Group(); P.position.z = HZ; G.add(P);
      const W = 22, D = 12, FH = 2.6, WH = 3.6, IW = W - 3, ID = D - 3, yR = FH + WH, SWd = 4, n = 14, tread = .34, run = n * tread;
      flat(mesh(new THREE.BoxGeometry(SWd - .4, .05, CZ - HZ - D / 2 - run), gravel, 0, .05, (CZ + D / 2 + run) / 2, P));   // the path from the gate
      sRect(P, -IW / 2 - .4, IW / 2 + .4, -ID / 2 - .4, ID / 2 + .4);
      sRect(P, -SWd / 2 + .1, SWd / 2 - .1, D / 2 - .15, D / 2 + run, (lx, lz) => FH * (1 - Math.max(0, lz - D / 2) / run));
      sRect(P, -W / 2 + .1, W / 2 - .1, -D / 2 + .1, D / 2 - .1, (lx, lz) => Math.abs(lx) < SWd / 2 - .1 || Math.abs(lz) < D / 2 - .35 && Math.abs(lx) < W / 2 - .35 ? FH : null);
      sRect(P, -W / 2, W / 2, -D / 2, D / 2);   // under the floor, among the posts
      const posts = [], m4 = new THREE.Matrix4();
      for (let px = -W / 2 + .4; px <= W / 2 - .39; px += (W - .8) / Math.round((W - .8) / 2)) for (let pz = -D / 2 + .4; pz <= D / 2 - .39; pz += (D - .8) / Math.round((D - .8) / 2)) posts.push([px, pz]);
      const post = new THREE.InstancedMesh(new THREE.CylinderGeometry(.2, .23, FH, 8), red, posts.length), foot = new THREE.InstancedMesh(new THREE.BoxGeometry(.6, .3, .6), white, posts.length);
      posts.forEach(([px, pz], i) => { post.setMatrixAt(i, m4.makeTranslation(px, FH / 2, pz)); foot.setMatrixAt(i, m4.makeTranslation(px, .15, pz)); });
      P.add(post, foot); post.castShadow = true;
      mesh(new THREE.BoxGeometry(W, .3, D), teakDark, 0, FH, 0, P);
      mesh(new THREE.BoxGeometry(W + .06, .12, D + .06), M.trim, 0, FH + .1, 0, P);
      mesh(new THREE.BoxGeometry(IW, WH, ID), teak, 0, FH + WH / 2, 0, P);
      [FH + .25, yR - .2].forEach(y => mesh(new THREE.BoxGeometry(IW + .08, .22, ID + .08), M.trim, 0, y, 0, P));
      const win = (wx, wz, r) => { const o = new THREE.Group(); o.position.set(wx, FH + WH * .5, wz); o.rotation.y = r; P.add(o); mesh(new THREE.BoxGeometry(1.1, 1.9, .06), M.trim, 0, 0, .02, o); mesh(new THREE.PlaneGeometry(.86, 1.66), pane, 0, 0, .06, o); };
      for (let i = 0; i < 8; i++) { const wx = -IW / 2 + (i + .5) * IW / 8; if (Math.abs(wx) > 1.5) win(wx, ID / 2, 0); }
      for (let i = 0; i < 3; i++) [-1, 1].forEach(sd => win(sd * IW / 2, -ID / 2 + (i + .5) * ID / 3, sd * Math.PI / 2));
      // the gilded doors of the audience hall
      const door = mesh(new THREE.BoxGeometry(1.8, 2.8, .1), red, 0, FH + 1.4, ID / 2 + .03, P);
      [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.14, 2.9, .14), M.gold, sd * .95, FH + 1.45, ID / 2 + .05, P));
      mesh(new THREE.BoxGeometry(2.1, .14, .14), M.gold, 0, FH + 2.85, ID / 2 + .05, P);
      [-.45, .45].forEach(dx => mesh(new THREE.BoxGeometry(.6, 2.3, .02), M.trim, dx, FH + 1.4, ID / 2 + .09, P));
      // the verandah railing, red with a gilt top rail, open where the stair arrives
      const rail = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), red, 500); let k = 0;
      const put = (px, py, pz, a, b, c) => rail.setMatrixAt(k++, m4.compose(V(px, py, pz), new THREE.Quaternion(), V(a, b, c)));
      [-1, 1].forEach(sd => { put(sd * (W / 2 - .05), FH + .95, 0, .1, .1, D); for (let i = 0; i <= D / .4; i++) put(sd * (W / 2 - .05), FH + .55, -D / 2 + i * .4, .06, .8, .06); });
      [-1, 1].forEach(sd => { const x0 = sd > 0 ? SWd / 2 : -W / 2, x1 = sd > 0 ? W / 2 : -SWd / 2; put((x0 + x1) / 2, FH + .95, D / 2 - .05, x1 - x0, .1, .1); for (let i = 0; i <= (x1 - x0) / .4; i++) put(x0 + i * .4, FH + .55, D / 2 - .05, .06, .8, .06); });
      put(0, FH + .95, -D / 2 + .05, W, .1, .1); for (let i = 0; i <= W / .4; i++) put(-W / 2 + i * .4, FH + .55, -D / 2 + .05, .06, .8, .06);
      rail.count = k; P.add(rail);
      // the roofs: a long gable across the hall (carved ends to the sides), a raised second tier, the pyatthat over the throne room
      const R = new THREE.Group(); R.rotation.y = Math.PI / 2; P.add(R);
      const hw = ID + 2.4, rh = hw * .42;
      gable(R, 0, yR, 0, hw, IW + 2.4, rh);
      mesh(new THREE.BoxGeometry(IW * .55, 1.4, hw * .45), teak, 0, yR + rh * .55, 0, P);
      gable(R, 0, yR + rh * .55 + .6, 0, hw * .62, IW * .58, rh * .62);
      pyatthat(P, 0, yR + rh * .55 + .6 + rh * .4, 0, 5.4, 7, .12);
      // the porch over the audience stair: a carved gable facing the gate on two red posts, the name board under it
      const PZ = D / 2 + 1;
      gable(P, 0, yR - .4, PZ - .4, 6.8, 4.6, 2.8);
      [-1, 1].forEach(sd => { mesh(new THREE.CylinderGeometry(.2, .23, yR - .4, 8), red, sd * 3.1, (yR - .4) / 2, PZ + 1.6, P); sCircle(P, sd * 3.1, PZ + 1.6, .3); });
      const BW = 3.6, BH = BW * 300 / 1024, board = mesh(new THREE.BoxGeometry(BW, BH, .08), [teakDark, teakDark, teakDark, teakDark, shanBoardFace(SHAN_NAMES.haw, "Haw Kham"), teakDark], 0, yR + .05 + BH / 2, PZ + 1.85, P);
      // the audience stair: white masonry between spiky walls, a lotus-bud newel at the foot of each
      for (let i = 0; i < n; i++) { const y1 = FH - i * FH / n; mesh(new THREE.BoxGeometry(SWd, y1, tread), white, 0, y1 / 2, D / 2 + i * tread + tread / 2, P); }
      const wall = new THREE.Shape(); wall.moveTo(D / 2 - .2, 0); wall.lineTo(D / 2 - .2, FH + .9); wall.lineTo(D / 2 + run, .9); wall.lineTo(D / 2 + run, 0); wall.closePath();
      [-1, 1].forEach(sd => {
        const wg = new THREE.ExtrudeGeometry(wall, { depth: .4, bevelEnabled: false }); wg.rotateY(-Math.PI / 2);
        const wx = sd * (SWd / 2 + .2);
        mesh(wg, white, sd * (SWd / 2 + (sd > 0 ? .4 : 0)), 0, 0, P);
        for (let i = 0; i <= 8; i++) { const t = i / 8, c = mesh(new THREE.ConeGeometry(.16, .55, 4), white, wx, FH + .9 - FH * t + .27, D / 2 - .2 + t * (run + .2), P); c.rotation.y = Math.PI / 4; }
        mesh(new THREE.BoxGeometry(.6, 1.25, .6), white, wx, .62, D / 2 + run + .3, P);
        mesh(new THREE.BoxGeometry(.72, .1, .72), M.trim, wx, 1.28, D / 2 + run + .3, P);
        const bud = mesh(new THREE.SphereGeometry(.2, 14, 10), white, wx, 1.6, D / 2 + run + .3, P); bud.scale.y = 1.35;
        mesh(new THREE.ConeGeometry(.07, .3, 10), M.gold, wx, 1.92, D / 2 + run + .3, P);
      });
      // a lesser hall either side, low on whitewashed footings, their carved gables to the courtyard
      [-1, 1].forEach(sd => {
        const wx = sd * 16.2, ww = 6.6, wd = 9, wz = HZ + 1;
        mesh(new THREE.BoxGeometry(ww + .4, 1, wd + .4), white, wx, .5, wz, G);
        mesh(new THREE.BoxGeometry(ww, 3, wd), teak, wx, 2.5, wz, G);
        mesh(new THREE.BoxGeometry(ww + .06, .18, wd + .06), M.trim, wx, 3.9, wz, G);
        [-1.6, 1.6].forEach(dx => { mesh(new THREE.BoxGeometry(1, 1.6, .06), M.trim, wx + dx, 2.5, wz + wd / 2 + .02, G); mesh(new THREE.PlaneGeometry(.8, 1.4), pane, wx + dx, 2.5, wz + wd / 2 + .06, G); });
        gable(G, wx, 4, wz, ww + 1.4, wd + 1.6, 2.8);
        sRect(G, wx - ww / 2 - .2, wx + ww / 2 + .2, wz - wd / 2 - .2, wz + wd / 2 + .2);
      });
      G.updateMatrixWorld(true);
      [[-CX + 3, CZ - 3], [CX - 3, CZ - 3]].forEach(([lx, lz], i) => { const w = G.localToWorld(V(lx, 0, lz)); tree(g, w.x, w.z, .9, 820 + i); });
      G.traverse(o => { if (o.isMesh) clickable(list, o, data); });
      Object.assign(board.userData, { toast: data.toast });
      // keep the outside camera above the hall and its spire
      const xs = [], zs = [];
      [[-W / 2 - 1, -D / 2 - 1], [W / 2 + 1, -D / 2 - 1], [-W / 2 - 1, D / 2 + run + 1], [W / 2 + 1, D / 2 + run + 1]].forEach(([lx, lz]) => { const w = P.localToWorld(V(lx, 0, lz)); xs.push(w.x); zs.push(w.z); });
      TALL.push({ x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), h: 24 });
    }
  }
