  /* ---------- Shan teak monasteries (kyaung) beside the stupa hill, after Shwe Yan Pyay: a hall raised on rows of teak posts,
     dark plank walls with oval windows framed in white, a verandah railing, tiered gable roofs of rusty corrugated iron with carved
     gable ends and flame finials, a many-tiered pyatthat tower over the shrine room, and a white masonry stair with spiky walls ---------- */
  function shanMonasteries(g) {
    const list = picks.pagoda;
    const plank = canvasTex(128, (c, sz) => { c.fillStyle = "#43200f"; c.fillRect(0, 0, sz, sz); for (let x = 0; x < sz; x += 10) { c.fillStyle = "rgba(15,6,2,.6)"; c.fillRect(x, 0, 2, sz); c.fillStyle = "rgba(120,70,40,.16)"; c.fillRect(x + 3, 0, 3, sz); } });
    plank.wrapS = plank.wrapT = THREE.RepeatWrapping; plank.repeat.set(4, 1);
    const teak = std({ map: plank, roughness: .7 }), teakDark = std({ color: 0x2e140a, roughness: .65 });
    const roofTex = corrugated("#6a3a24", "#8e5838", "#40200f"); roofTex.repeat.set(10, 1);
    const roofM = std({ map: roofTex, roughness: .5, metalness: .35, side: THREE.DoubleSide });
    const white = std({ color: 0xf2eee4, roughness: .8 }), frameW = std({ color: 0xf4f0e6, roughness: .6 });
    const pane = std({ color: 0x1a0e08, roughness: .4, emissive: 0xffb060, emissiveIntensity: 0 });
    onDaylight(d => pane.emissiveIntensity = .8 * (1 - d));
    const flame = new THREE.ConeGeometry(.12, .7, 4);
    // carved gable fretwork: rows of little pointed arches and scrolls in old gilt on dark teak, a sunburst roundel in the middle
    const carved = canvasTex(512, (c, sz) => {
      c.fillStyle = "#24100a"; c.fillRect(0, 0, sz, sz);
      c.strokeStyle = "#b8893c"; c.lineWidth = 3;
      for (let row = 0; row < 9; row++) for (let k = 0; k < 14; k++) {
        const x = k * 38 + (row % 2) * 19, y = sz - row * 52 - 10;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 4, y - 30, x + 17, y - 42); c.quadraticCurveTo(x + 30, y - 30, x + 34, y); c.stroke();
        c.beginPath(); c.arc(x + 17, y - 14, 6, 0, TAU); c.stroke();
      }
      c.fillStyle = "#24100a"; c.beginPath(); c.arc(sz / 2, sz * .58, 78, 0, TAU); c.fill();
      c.strokeStyle = "#d8a84a"; c.lineWidth = 5; c.beginPath(); c.arc(sz / 2, sz * .58, 70, 0, TAU); c.stroke();
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; c.beginPath(); c.moveTo(sz / 2 + Math.cos(a) * 22, sz * .58 + Math.sin(a) * 22); c.lineTo(sz / 2 + Math.cos(a) * 62, sz * .58 + Math.sin(a) * 62); c.stroke(); }
      c.fillStyle = "#d8a84a"; c.beginPath(); c.arc(sz / 2, sz * .58, 18, 0, TAU); c.fill();
    });
    const gableMat = (w, h) => { const t = carved.clone(); t.needsUpdate = true; t.repeat.set(1 / w, 1 / h); t.offset.set(.5, 0); return std({ map: t, roughness: .7, metalness: .1 }); };
    // a gable roof with its ridge along local z: slopes, carved gable ends front and back, flame finials up the gable edges
    function gable(G, cx, y, cz, w, d, h) {
      const hw = w / 2, L = Math.hypot(hw, h) + .5, a = Math.atan2(h, hw);
      [-1, 1].forEach(sd => { const sl = mesh(new THREE.BoxGeometry(L, .1, d), roofM, cx + sd * (hw / 2), y + h / 2, cz, G); sl.rotation.z = -sd * a; });
      mesh(new THREE.BoxGeometry(.25, .25, d + .2), roofM, cx, y + h + .05, cz, G);
      const tri = new THREE.Shape(); tri.moveTo(-hw + .3, 0); tri.lineTo(hw - .3, 0); tri.lineTo(0, h - .1); tri.closePath();
      [-1, 1].forEach(e => {
        const z = cz + e * (d / 2 - .05), panel = mesh(new THREE.ExtrudeGeometry(tri, { depth: .12, bevelEnabled: false }), [gableMat(w, h), teakDark], cx, y, z - (e > 0 ? .12 : 0), G);
        // gold trim along the gable edges and flame finials rising from them
        [-1, 1].forEach(sd => {
          const tr = mesh(new THREE.BoxGeometry(Math.hypot(hw, h), .1, .16), M.gold, cx + sd * hw / 2, y + h / 2 + .06, z + e * .05, G); tr.rotation.z = -sd * a;
          for (let k = 1; k <= 5; k++) { const t = k / 6, f = mesh(flame, teakDark, cx + sd * hw * (1 - t), y + h * t + .4, z + e * .06, G); f.rotation.z = -sd * .5; }
        });
        mesh(new THREE.ConeGeometry(.16, 1.4, 6), M.gold, cx, y + h + .8, z, G);
      });
    }
    // a pyatthat: stacked shrinking tiers of little hipped roofs over the shrine room, crowned by a gold spire
    function pyatthat(G, cx, y, cz, s0, tiers, shrink = .17) {
      for (let k = 0; k < tiers; k++) {
        const s = s0 * (1 - k * shrink);
        mesh(new THREE.BoxGeometry(s * .62, .55, s * .62), teak, cx, y + .27, cz, G);
        const r = mesh(new THREE.ConeGeometry(s * .74, 1.0, 4, 1, true), roofM, cx, y + .55 + .5, cz, G); r.rotation.y = Math.PI / 4;
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([a, b]) => { const f = mesh(flame, teakDark, cx + a * s * .45, y + 1.05, cz + b * s * .45, G); f.scale.setScalar(1.3); });
        y += 1.35;
      }
      mesh(new THREE.CylinderGeometry(.2, .3, .5, 8), teakDark, cx, y + .25, cz, G);
      mesh(new THREE.ConeGeometry(.28, 2.6, 8), M.gold, cx, y + 1.7, cz, G);
      mesh(new THREE.CylinderGeometry(.015, .015, 1.0, 4), M.gold, cx, y + 3.4, cz, G);
    }
    function kyaung(x, z, ry, W, D, tower, parent = g, y0 = 0, sc = 1, reach = 0, edge = 0) {
      const G = new THREE.Group(); G.position.set(x, y0, z); G.rotation.y = ry; G.scale.setScalar(sc); parent.add(G);
      const PX = W / 2 + MON.PM, PZ = D / 2 + MON.PM;   // the plinth's half sizes
      if (y0) {   // a stone plinth levelling the slope, paved on top as a walk round the building, a low parapet on its back and ends
        const paveT = canvasTex(128, (c, sz) => { c.fillStyle = "#b8b0a0"; c.fillRect(0, 0, sz, sz); for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { const v = 170 + ((r * 3 + k * 5) % 4) * 9; c.fillStyle = `rgb(${v},${v - 5},${v - 14})`; c.fillRect(k * 32 + 1, r * 32 + 1, 30, 30); } });
        paveT.wrapS = paveT.wrapT = THREE.RepeatWrapping; paveT.repeat.set(PX / 1.5, PZ / 1.5);
        const side = std({ color: 0x8c877d, roughness: .85 }), top = std({ map: paveT, roughness: .85 });
        mesh(new THREE.BoxGeometry(2 * PX, 6, 2 * PZ), [side, side, top, side, side, side], 0, -3, 0, G);
        [[0, -PZ + .12, 2 * PX, .24], [-PX + .12, .12, .24, 2 * PZ - .24], [PX - .12, .12, .24, 2 * PZ - .24]].forEach(([px, pz, w, d]) => {
          mesh(new THREE.BoxGeometry(w, .5, d), white, px, .25, pz, G);
          mesh(new THREE.BoxGeometry(w + .08, .06, d + .08), M.trim, px, .53, pz, G);
        });
        // beyond the uphill end, where the plinth is cut into the hill, a stone retaining wall holding the bank, its top following the slope
        G.updateMatrixWorld(true);
        const rw = new THREE.Shape(), xw = -PX - .55, N = 20;
        for (let i = 0; i <= N; i++) { const lz = -PZ + 2 * PZ * i / N, w = G.localToWorld(V(xw - .3, 0, lz)), h = Math.max(.05, (terrainAt(w.x, w.z) - y0) / sc + .2); i ? rw.lineTo(lz, h) : rw.moveTo(lz, h); }
        rw.lineTo(PZ, -.2); rw.lineTo(-PZ, -.2); rw.closePath();
        const rg = new THREE.ExtrudeGeometry(rw, { depth: .5, bevelEnabled: false }); rg.rotateY(-Math.PI / 2);
        mesh(rg, side, xw, 0, 0, G);
      }
      const FH = 2.4, WH = 3.4, IW = W - 3, ID = D - 3;   // floor height, wall height, the hall inside the verandah
      {   // walkable: up the white stair onto the verandah that runs round the hall; the hall's walls and the stilts block
        const n = 12, run = n * .36, SWd = MON.SWd;
        sRect(G, -IW / 2 - .4, IW / 2 + .4, -ID / 2 - .4, ID / 2 + .4);   // stop a step short of the hall walls
        sRect(G, -SWd / 2 + .1, SWd / 2 - .1, D / 2 - .15, D / 2 + run, (lx, lz) => FH * (1 - Math.max(0, lz - D / 2) / run));   // from just inside the verandah's edge, so there is no gap at the top
        sRect(G, -W / 2 + .1, W / 2 - .1, -D / 2 + .1, D / 2 - .1, (lx, lz) => Math.abs(lx) < SWd / 2 - .1 || Math.abs(lz) < D / 2 - .35 && Math.abs(lx) < W / 2 - .35 ? FH : null);   // the verandah, with its railing round the edge
        if (y0) {   // round the building on the plinth (from the ground the verandah is too high a step, so you walk round it), kept in by the parapet
          sRect(G, -PX, -PX + .24, -PZ, PZ); sRect(G, PX - .24, PX, -PZ, PZ); sRect(G, -PX, PX, -PZ, -PZ + .24);
          sRect(G, -PX, PX, -PZ, PZ, 0);
        }
      }
      // the stilts: rows of teak posts on whitewashed footings
      const posts = [];
      for (let px = -W / 2 + .4; px <= W / 2 - .39; px += (W - .8) / Math.round((W - .8) / 2)) for (let pz = -D / 2 + .4; pz <= D / 2 - .39; pz += (D - .8) / Math.round((D - .8) / 2)) posts.push([px, pz]);
      const post = new THREE.InstancedMesh(new THREE.CylinderGeometry(.17, .2, FH, 8), teakDark, posts.length), foot = new THREE.InstancedMesh(new THREE.BoxGeometry(.5, .25, .5), white, posts.length), m4 = new THREE.Matrix4();
      posts.forEach(([px, pz], i) => { post.setMatrixAt(i, m4.makeTranslation(px, FH / 2, pz)); foot.setMatrixAt(i, m4.makeTranslation(px, .12, pz)); });
      G.add(post, foot); post.castShadow = true;
      mesh(new THREE.BoxGeometry(W, .3, D), teakDark, 0, FH, 0, G);
      // the hall: plank walls, oval windows framed in white on the front and sides
      const walls = mesh(new THREE.BoxGeometry(IW, WH, ID), teak, 0, FH + WH / 2, 0, G);
      const oval = (wx, wz, ry2) => {
        const o = new THREE.Group(); o.position.set(wx, FH + WH * .5, wz); o.rotation.y = ry2; G.add(o);
        const p = mesh(new THREE.CircleGeometry(.5, 24), pane, 0, 0, .02, o); p.scale.y = 1.5;
        const f = mesh(new THREE.TorusGeometry(.5, .08, 6, 24), frameW, 0, 0, .04, o); f.scale.y = 1.5;
      };
      const nF = Math.max(3, Math.round(IW / 2.6)); for (let i = 0; i < nF; i++) { const wx = -IW / 2 + (i + .5) * IW / nF; if (Math.abs(wx) > .9) oval(wx, ID / 2, 0); }
      const nS = Math.max(2, Math.round(ID / 2.6)); for (let i = 0; i < nS; i++) [-1, 1].forEach(sd => oval(sd * IW / 2, -ID / 2 + (i + .5) * ID / nS, sd * Math.PI / 2));
      // the doors into the shrine hall: two teak leaves in a gilded frame under a carved pointed pediment
      const door = mesh(new THREE.BoxGeometry(1.4, 2.4, .1), teakDark, 0, FH + 1.2, ID / 2 + .03, G);
      mesh(new THREE.BoxGeometry(.02, 2.3, .02), M.gold, 0, FH + 1.2, ID / 2 + .09, G);
      [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.1, 2.5, .14), M.gold, sd * .75, FH + 1.25, ID / 2 + .05, G));
      mesh(new THREE.BoxGeometry(1.6, .1, .14), M.gold, 0, FH + 2.45, ID / 2 + .05, G);
      const ped = mesh(new THREE.ConeGeometry(.85, .7, 4), M.gold, 0, FH + 2.85, ID / 2 + .05, G); ped.rotation.y = Math.PI / 4; ped.scale.z = .12;
      // the verandah railing round the platform edge, open where the stair arrives
      const rail = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), teakDark, 400); let k = 0;
      const put = (px, py, pz, a, b, c) => rail.setMatrixAt(k++, m4.compose(V(px, py, pz), new THREE.Quaternion(), V(a, b, c)));
      [[-1, 0], [1, 0]].forEach(([sd]) => { put(sd * (W / 2 - .05), FH + .95, 0, .08, .08, D); for (let i = 0; i <= D / .4; i++) put(sd * (W / 2 - .05), FH + .55, -D / 2 + i * .4, .05, .8, .05); });
      [-1, 1].forEach(sd => { const x0 = sd > 0 ? 1.8 : -W / 2, x1 = sd > 0 ? W / 2 : -1.8; put((x0 + x1) / 2, FH + .95, D / 2 - .05, x1 - x0, .08, .08); for (let i = 0; i <= (x1 - x0) / .4; i++) put(x0 + i * .4, FH + .55, D / 2 - .05, .05, .8, .05); });
      put(0, FH + .95, -D / 2 + .05, W, .08, .08); for (let i = 0; i <= W / .4; i++) put(-W / 2 + i * .4, FH + .55, -D / 2 + .05, .05, .8, .05);   // the back, balustered like the sides
      rail.count = k; G.add(rail);
      // a skirt roof over the front verandah, then the main roofs: twin gables on a wide hall, one gable on a small one
      const yR = FH + WH;
      const skirt = mesh(new THREE.BoxGeometry(W + .8, .08, 2.4), roofM, 0, yR - .55, ID / 2 + 1.0, G); skirt.rotation.x = .38;
      const halls = W > 16 ? [-IW / 4, IW / 4] : [0], hw = IW / halls.length + 1.4;
      halls.forEach((cx, i) => {
        gable(G, cx, yR, 0, hw, ID + 2.4, hw * .42);
        if (i === 0) {   // a second, smaller tier raised over the first hall
          mesh(new THREE.BoxGeometry(hw * .5, 1.3, ID * .55), teak, cx, yR + hw * .3, 0, G);
          gable(G, cx, yR + hw * .3 + .6, 0, hw * .62, ID * .66, hw * .3);
        }
      });
      if (tower) pyatthat(G, halls[halls.length - 1], yR + hw * .25, -ID * .1, 4.6, 5);
      // the monastery's name board under the front gable
      const BW = 4.4, BH = BW * 300 / 1024, nameFace = shanBoardFace(SHAN_NAMES.kyaung);
      const board = mesh(new THREE.BoxGeometry(BW, BH, .08), [teakDark, teakDark, teakDark, teakDark, nameFace, teakDark], halls[0], yR + .35 + BH / 2, (ID + 2.4) / 2 + .1, G);
      // the white masonry stair down from the verandah, its walls topped with little spikes
      // with `reach`, the stair runs on at the foot as a level paved walk between low coped walls into the hill stair's wall
      const n = 12, rise = FH / n, tread = .36, SWd = MON.SWd;
      for (let i = 0; i < n; i++) { const y1 = FH - i * rise; mesh(new THREE.BoxGeometry(SWd, y1, tread), white, 0, y1 / 2, D / 2 + i * tread + tread / 2, G); }
      const run = n * tread, R = D / 2 + run, wall = new THREE.Shape(); wall.moveTo(D / 2 - .2, 0); wall.lineTo(D / 2 - .2, FH + .9); wall.lineTo(R, .9); wall.lineTo(R, 0); wall.closePath();
      const LOW = .95 / sc, NW = .6;   // the low walls match the hill stair's walls; NW: the newels' size
      [-1, 1].forEach(sd => {
        const wg = new THREE.ExtrudeGeometry(wall, { depth: .4, bevelEnabled: false }); wg.rotateY(-Math.PI / 2);
        const wx = sd * (SWd / 2 + .2);
        mesh(wg, white, sd * (SWd / 2 + (sd > 0 ? .4 : 0)), 0, 0, G);
        for (let i = 0; i <= 8; i++) { const t = i / 8, c = mesh(new THREE.ConeGeometry(.16, .55, 4), white, wx, FH + .9 - FH * t + .27, D / 2 - .2 + t * (run + .2), G); c.rotation.y = Math.PI / 4; }
        // a newel at the foot of each wall, crowned with a lotus bud
        mesh(new THREE.BoxGeometry(NW, 1.25, NW), white, wx, .62, R + NW / 2, G);
        mesh(new THREE.BoxGeometry(NW + .12, .1, NW + .12), M.trim, wx, 1.28, R + NW / 2, G);
        mesh(new THREE.CylinderGeometry(.16, .22, .2, 12), white, wx, 1.43, R + NW / 2, G);
        const bud = mesh(new THREE.SphereGeometry(.2, 14, 10), white, wx, 1.68, R + NW / 2, G); bud.scale.y = 1.35;
        mesh(new THREE.ConeGeometry(.07, .3, 10), M.gold, wx, 2.0, R + NW / 2, G);
        if (reach > NW) {
          const len = reach - NW + .02, zm = R + NW + len / 2;
          mesh(new THREE.BoxGeometry(.4, LOW, len), white, wx, LOW / 2, zm, G);
          mesh(new THREE.BoxGeometry(.5 / sc + .02, .12 / sc, len), M.trim, wx, LOW + .06 / sc, zm, G);
        }
      });
      if (edge) flat(mesh(new THREE.BoxGeometry(SWd, .06, edge + .1), white, 0, .03, R + edge / 2, G));   // the paved walk out to the hill stair
      G.traverse(o => { if (o.isMesh && o !== door) clickable(list, o, { tip: `${SHAN_NAMES.kyaung} · a Shan teak monastery` }); });
      clickable(list, door, { floor: "kyaung", tip: `Enter the shrine hall of ${SHAN_NAMES.kyaung}` });
      Object.assign(board.userData, { toast: `${SHAN_NAMES.kyaung}: a Shan teak monastery on the hill of ${SHAN_NAMES.stupa}. Climb its stair to the verandah and the doors of the shrine hall, or walk round it on the paved plinth.` });
      // keep the outside camera above it
      G.updateMatrixWorld(true);
      const ex = G.localToWorld(V(0, 0, D / 2 - .5)), look = G.localToWorld(V(0, 0, D / 2 + run + 8));   // where you come out: on the verandah before the doors, facing the stair
      MONASTERIES.push({ G, W, D, run, foot: G.localToWorld(V(0, 0, D / 2 + run + 1.5)), door: G.localToWorld(V(0, 0, 0)), exit: [[ex.x, ex.z], [look.x, look.z]] });
      const xs = [], zs = [];
      [[-W / 2 - 1, -D / 2 - 1], [W / 2 + 1, -D / 2 - 1], [-W / 2 - 1, D / 2 + run + 1], [W / 2 + 1, D / 2 + run + 1]].forEach(([lx, lz]) => { const w = G.localToWorld(V(lx, 0, lz)); xs.push(w.x); zs.push(w.z); });
      TALL.push({ x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), h: y0 + (tower ? 22 : 14) * sc });
    }
    // a single monastery, on the upper terrace to the right of the stair (as seen from its foot), facing the stair, with its pyatthat;
    // its stair is joined to the hill stair's landing (see monasterySpot). The rest of the hill is left open for later buildings
    const H = HILL.group, ms = monasterySpot();
    kyaung(ms.x, ms.z, Math.PI / 2, MON.W, MON.D, true, H, ms.y, MON.SC, ms.reach, ms.edge);
    festivalGround(H);
    hawKham(16, 182, Math.PI);
