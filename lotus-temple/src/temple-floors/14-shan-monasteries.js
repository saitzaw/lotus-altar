  /* ---------- Shan teak monasteries (kyaung) beside the stupa hill, after Shwe Yan Pyay: a hall raised on rows of teak posts,
     dark plank walls with open oval windows in carved teak frames, the doors standing open, a verandah railing, tiered gable roofs of rusty corrugated iron with carved
     gable ends and flame finials, a many-tiered pyatthat tower over the shrine room, and a white masonry stair with spiky walls ---------- */
  function shanMonasteries(g) {
    const list = picks.pagoda;
    const { teak, teakDark, roofM, white, flame, gable, pyatthat } = shanCarpentry();
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
      // the hall: plank walls cut with open oval windows, carved teak frames with a pointed crown, as at Shwe Yan Pyay, and the
      // doorway left open, so you see into the dim shrine room: its floor, red pillars and the gilded image at the back
      const WT = .16, OY = WH * .5, ORX = .5, ORY = .75;   // WT: the walls' thickness; OY: the windows' centre above the floor
      const ovalPts = (rx, ry, peak, cx = 0, cy = 0) => { const p = []; for (let i = 0; i < 32; i++) { const a = i / 32 * TAU, c = Math.cos(a); p.push(new THREE.Vector2(cx + rx * Math.sin(a) * (1 - peak * Math.max(0, c) ** 3), cy + ry * c + peak * ry * Math.max(0, c) ** 8)); } return p; };
      const plankT = teak.map.clone(); plankT.needsUpdate = true; plankT.repeat.set(.45, .3);
      const wallM = std({ map: plankT, roughness: .7 });
      const wallFace = (len, xs, door) => {   // one wall, len long, WH high, with oval holes at xs and a doorway in the middle
        const s = new THREE.Shape(); s.moveTo(-len / 2, 0); s.lineTo(len / 2, 0); s.lineTo(len / 2, WH); s.lineTo(-len / 2, WH); s.closePath();
        xs.forEach(x => s.holes.push(new THREE.Path(ovalPts(ORX, ORY, .08, x, OY).reverse())));
        if (door) s.holes.push(new THREE.Path([[-.7, .02], [-.7, 2.4], [.7, 2.4], [.7, .02]].map(([a, b]) => new THREE.Vector2(a, b))));
        return new THREE.ExtrudeGeometry(s, { depth: WT, bevelEnabled: false });
      };
      const frameG = (() => { const s = new THREE.Shape(ovalPts(ORX + .14, ORY + .16, .2)); s.holes.push(new THREE.Path(ovalPts(ORX, ORY, .08).reverse())); return new THREE.ExtrudeGeometry(s, { depth: .07, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 1 }); })();
      const frameM = std({ color: 0x3e1e0e, roughness: .6 }), beadM = std({ color: 0x6a4026, roughness: .5 });
      const beadG = (() => { const s = new THREE.Shape(ovalPts(ORX + .04, ORY + .05, .1)); s.holes.push(new THREE.Path(ovalPts(ORX, ORY, .08).reverse())); return new THREE.ExtrudeGeometry(s, { depth: .1, bevelEnabled: false }); })();
      const frontX = [], nF = Math.max(3, Math.round(IW / 2.6)); for (let i = 0; i < nF; i++) { const wx = -IW / 2 + (i + .5) * IW / nF; if (Math.abs(wx) > .9) frontX.push(wx); }
      const nS = Math.max(2, Math.round(ID / 2.6)), sideX = []; for (let i = 0; i < nS; i++) sideX.push(-(ID - 2 * WT) / 2 + (i + .5) * (ID - 2 * WT) / nS);
      mesh(wallFace(IW, frontX, true), wallM, 0, FH + .15, ID / 2 - WT, G);
      mesh(new THREE.BoxGeometry(IW, WH, WT), wallM, 0, FH + .15 + WH / 2, -ID / 2 + WT / 2, G);   // the back wall, blind
      const sideW = wallFace(ID - 2 * WT, sideX, false);
      [-1, 1].forEach(sd => { const m = mesh(sideW, wallM, sd * (IW / 2 - WT), FH + .15, 0, G); m.rotation.y = sd * Math.PI / 2; });
      const oval = (wx, wz, ry2) => {   // the frame round one opening, proud of the wall's face
        const o = new THREE.Group(); o.position.set(wx, FH + .15 + OY, wz); o.rotation.y = ry2; G.add(o);
        mesh(frameG, frameM, 0, 0, 0, o); mesh(beadG, beadM, 0, 0, 0, o);
        mesh(new THREE.BoxGeometry(1.1, .08, .14), frameM, 0, -ORY - .2, .06, o);   // the sill
      };
      frontX.forEach(wx => oval(wx, ID / 2, 0));
      sideX.forEach(sx => [-1, 1].forEach(sd => oval(sd * IW / 2, -sd * sx, sd * Math.PI / 2)));
      {   // inside: a dim plank room under a dark ceiling, lamplit at night, two rows of red pillars banded in gold, and the image on his throne
        const inT = teak.map.clone(); inT.needsUpdate = true; inT.repeat.set(3, 1);
        const inM = std({ map: inT, color: 0x707070, roughness: .8, side: THREE.BackSide, emissive: 0xffa050, emissiveIntensity: 0 }), redM = std({ color: 0x8a1a10, roughness: .45, emissive: 0x401008, emissiveIntensity: 0 });
        onDaylight(d => { inM.emissiveIntensity = .12 * (1 - d) + .02; redM.emissiveIntensity = .5 * (1 - d); });
        const iy = FH + .15, ih = WH - .02;
        const room = new THREE.Mesh(new THREE.BoxGeometry(IW - 2 * WT - .02, ih, ID - 2 * WT - .02), inM); room.position.set(0, iy + ih / 2, 0); room.receiveShadow = true; G.add(room);
        const shaft = new THREE.CylinderGeometry(.13, .14, ih, 10), bandG = new THREE.CylinderGeometry(.155, .155, .1, 10);
        [-IW / 4, IW / 4].forEach(px => [-ID / 4, 0, ID / 4].forEach(pz => { part(shaft, redM, px, iy + ih / 2, pz, G); [.4, ih - .4].forEach(by => part(bandG, M.gold, px, iy + by, pz, G)); }));
        const bz = -ID / 2 + WT + .02;
        mesh(new THREE.PlaneGeometry(2.6, ih - .3), redM, 0, iy + (ih - .3) / 2, bz + .01, G);   // the red hanging behind him
        mesh(new THREE.BoxGeometry(1.5, .7, .9), M.gold, 0, iy + .35, bz + .6, G);   // the gilded throne
        mesh(new THREE.BoxGeometry(1.7, .08, 1.05), M.gold, 0, iy + .72, bz + .6, G);
        const halo = mesh(new THREE.CircleGeometry(.36, 20), std({ color: 0x14204a, roughness: .5 }), 0, iy + 2.05, bz + .08, G);
        mesh(new THREE.TorusGeometry(.38, .03, 6, 24), M.gold, 0, 0, .01, halo);
        // the image, seated touching the earth: crossed legs, body, shoulders, head with its curls and gilt bud
        const s = mesh(new THREE.SphereGeometry(.5, 16, 10), M.gold, 0, iy + .9, bz + .7, G); s.scale.set(1, .32, .62);
        const b = mesh(new THREE.SphereGeometry(.3, 16, 12), M.gold, 0, iy + 1.3, bz + .62, G); b.scale.set(1, 1.45, .75);
        mesh(new THREE.SphereGeometry(.17, 16, 12), M.gold, 0, iy + 1.9, bz + .64, G);
        mesh(new THREE.SphereGeometry(.15, 12, 8, 0, TAU, 0, 1.3), std({ color: 0x1a1410, roughness: .6 }), 0, iy + 1.92, bz + .63, G);
        mesh(new THREE.ConeGeometry(.04, .14, 8), M.gold, 0, iy + 2.1, bz + .63, G);
        [-1, 1].forEach(sd => { const a = mesh(new THREE.CylinderGeometry(.06, .07, .55, 8), M.gold, sd * .3, iy + 1.25, bz + .72, G); a.rotation.z = sd * .25; a.rotation.x = -.3; });
      }
      // the doorway into the shrine hall, its two teak leaves swung open inward, in a plain gilded frame
      const doorParts = [];
      const door = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.4), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
      door.position.set(0, FH + 1.36, ID / 2 + .02); G.add(door); doorParts.push(door);   // an unseen sheet across the doorway, to click
      [-1, 1].forEach(sd => {
        const h = new THREE.Group(); h.position.set(sd * .7, FH + 1.36, ID / 2 - WT - .03); h.rotation.y = -sd * 1.95; G.add(h);
        doorParts.push(mesh(new THREE.BoxGeometry(.7, 2.38, .06), teakDark, -sd * .35, 0, 0, h));
        [-.6, .6].forEach(py => doorParts.push(mesh(new THREE.BoxGeometry(.5, .8, .02), frameM, -sd * .35, py, .035, h)));   // raised panels
      });
      [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.1, 2.5, .14), M.gold, sd * .75, FH + 1.4, ID / 2 + .05, G));
      mesh(new THREE.BoxGeometry(1.6, .1, .14), M.gold, 0, FH + 2.6, ID / 2 + .05, G);
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
      bakeParts(G);
      G.traverse(o => { if (o.isMesh && !doorParts.includes(o)) clickable(list, o, { tip: `${SHAN_NAMES.kyaung} · a Shan teak monastery` }); });
      doorParts.forEach(o => clickable(list, o, { floor: "kyaung", tip: `Enter the shrine hall of ${SHAN_NAMES.kyaung}` }));
      Object.assign(board.userData, { toast: `${SHAN_NAMES.kyaung}: a Shan teak monastery on the hill of ${SHAN_NAMES.stupa}. Climb its stair to the verandah and the doors of the shrine hall, or walk round it on the paved plinth.` });
      // keep the outside camera above it
      G.updateMatrixWorld(true);
      const ex = G.localToWorld(V(0, 0, D / 2 - .5)), look = G.localToWorld(V(0, 0, D / 2 + run + 8));   // where you come out: on the verandah before the doors, facing the stair
      MONASTERIES.push({ key: "kyaung", G, W, D, run, foot: G.localToWorld(V(0, 0, D / 2 + run + 1.5)), door: G.localToWorld(V(0, 0, 0)), exit: [[ex.x, ex.z], [look.x, look.z]] });
      const xs = [], zs = [];
      [[-W / 2 - 1, -D / 2 - 1], [W / 2 + 1, -D / 2 - 1], [-W / 2 - 1, D / 2 + run + 1], [W / 2 + 1, D / 2 + run + 1]].forEach(([lx, lz]) => { const w = G.localToWorld(V(lx, 0, lz)); xs.push(w.x); zs.push(w.z); });
      TALL.push({ x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), h: y0 + (tower ? 22 : 14) * sc });
    }
    // a single monastery, on the upper terrace to the right of the stair (as seen from its foot), facing the stair, with its pyatthat;
    // its stair is joined to the hill stair's landing (see monasterySpot). The rest of the hill is left open for later buildings
    const H = HILL.group, ms = monasterySpot();
    kyaung(ms.x, ms.z, Math.PI / 2, MON.W, MON.D, true, H, ms.y, MON.SC, ms.reach, ms.edge);
    festivalGround(H);
    lowerKyaung(H);
  }
