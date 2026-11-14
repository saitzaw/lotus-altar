  /* ---------- Shan teak monasteries (kyaung) beside the stupa hill, after Shwe Yan Pyay: a hall raised on rows of teak posts,
     dark plank walls with oval and round-topped arched windows in carved teak frames, the doors closed, a verandah railing, clustered gable roofs of rusty corrugated iron with carved
     fretwork gable boards, a many-tiered pyatthat tower over the shrine room, and a white masonry stair guarded by naga ---------- */
  /* ---------- the monastery's shrine-hall windows: one layout for its outside walls (kyaung) and for the hall inside (kyaungHall),
     so every window is in the same place seen from either side. Tall round-topped arches, an oval either side of the door and in
     the middle of each side, a quarter of the arches shuttered. In the monastery's own units, before it is scaled up: x runs across
     the front from the middle, and along a side wall from its middle (the side at +x runs back as x grows) ---------- */
  function kyaungWindows() {
    const IW = MON.W - 3, ID = MON.D - 3, WT = .16, sideLen = ID - 2 * WT, front = [], side = [], shut = rng(29);
    for (let x = 1.7, k = 0; x < IW / 2 - .6; x += 1.4, k++) [-1, 1].forEach(sd => front.push({ x: sd * x, oval: k === 0 }));
    front.sort((a, b) => a.x - b.x);
    const nS = Math.floor((sideLen - 1.2) / 1.5) + 1; for (let i = 0; i < nS; i++) side.push({ x: (i - (nS - 1) / 2) * 1.5, oval: i === (nS - 1) / 2 });
    [...front, ...side].forEach(w => w.shut = !w.oval && shut() < .25);
    return { IW, ID, WT, WH: 3.4, sideLen, front, side, ORX: .48, ORY: .75, OY: 1.6, AW: .38, AH: 2.0, AB: .55 };   // ORX, ORY, OY: an oval's half sizes and centre above the floor; AW, AH, AB: an arch's half width, height and sill
  }
  // the outlines of an oval and of a round-topped arch (its foot at cy), as points for a shape
  function kwOval(rx, ry, cx = 0, cy = 0) { const p = []; for (let i = 0; i < 32; i++) { const a = i / 32 * TAU; p.push(new THREE.Vector2(cx + rx * Math.sin(a), cy + ry * Math.cos(a))); } return p; }
  function kwArch(hw, h, cx = 0, cy = 0) { const p = [new THREE.Vector2(cx - hw, cy), new THREE.Vector2(cx + hw, cy)]; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; p.push(new THREE.Vector2(cx + hw * Math.cos(a), cy + h - hw + hw * Math.sin(a))); } return p; }
  function shanMonasteries(g) {
    const list = picks.pagoda;
    const { teak, teakDark, white, pyatthat, hip } = shanCarpentry();
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
      // weathered teak, darker than the shared carpentry's (as at Shwe Yan Pyay): near-black brown planks streaked grey by the rain,
      // posts silvered with age, rusty corrugated iron, and the mirror inlay and carved fretwork of the roofs
      const oldPlank = canvasTex(128, (c, sz) => {
        c.fillStyle = "#2a140b"; c.fillRect(0, 0, sz, sz); const r = rng(17);
        for (let x = 0; x < sz; x += 10) { c.fillStyle = "rgba(6,2,1,.7)"; c.fillRect(x, 0, 2, sz); c.fillStyle = "rgba(105,62,40,.14)"; c.fillRect(x + 3, 0, 3, sz); }
        for (let i = 0; i < 50; i++) { c.fillStyle = `rgba(95,85,78,${.05 + r() * .1})`; c.fillRect(r() * sz, r() * sz, 1 + r() * 2, 10 + r() * 40); }
      });
      oldPlank.wrapS = oldPlank.wrapT = THREE.RepeatWrapping; oldPlank.repeat.set(.45, .3);
      const wallM = std({ map: oldPlank, roughness: .75 }), darkM = std({ color: 0x0c0503, roughness: .7 }), postM = std({ color: 0x1c1612, roughness: .85 });
      const rustTex = (across, rx, ry) => {   // corrugations running across the texture (down a box slope) or along it (down a hip), with rust patches
        const t = canvasTex(64, (c, sz) => {
          const r = rng(5);
          for (let k = 0; k < sz; k += 8) { const gr = across ? c.createLinearGradient(0, k, 0, k + 8) : c.createLinearGradient(k, 0, k + 8, 0); gr.addColorStop(0, "#2e1208"); gr.addColorStop(.5, "#84401f"); gr.addColorStop(1, "#2e1208"); c.fillStyle = gr; across ? c.fillRect(0, k, sz, 8) : c.fillRect(k, 0, 8, sz); }
          for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(${r() < .5 ? "60,20,8" : "150,80,45"},${.15 + r() * .2})`; c.fillRect(r() * sz, r() * sz, 2 + r() * 8, 2 + r() * 8); }
        });
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return std({ map: t, roughness: .6, metalness: .3, side: THREE.DoubleSide });
      };
      // the mirror-glass inlay of the friezes and gable faces: silvery frames and a rosette round a bead of blue glass, on dark teak
      const inlayT = canvasTex(256, (c, sz) => {
        c.fillStyle = "#1c0d07"; c.fillRect(0, 0, sz, sz);
        c.strokeStyle = "#8e8a80"; c.lineWidth = 5; c.strokeRect(20, 20, sz - 40, sz - 40); c.lineWidth = 3; c.strokeRect(42, 42, sz - 84, sz - 84);
        c.fillStyle = "#8e8a80"; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.beginPath(); c.ellipse(sz / 2 + Math.cos(a) * 30, sz / 2 + Math.sin(a) * 30, 14, 6, a, 0, TAU); c.fill(); }
        [[42, 42], [sz - 42, 42], [42, sz - 42], [sz - 42, sz - 42]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + 12, y); c.lineTo(x, y + 12); c.lineTo(x - 12, y); c.fill(); });
        c.fillStyle = "#4a6e9a"; c.beginPath(); c.arc(sz / 2, sz / 2, 13, 0, TAU); c.fill();
      });
      inlayT.wrapS = inlayT.wrapT = THREE.RepeatWrapping;
      const inlayM = (rx, ry) => { const t = inlayT.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return std({ map: t, roughness: .5, metalness: .2, side: THREE.DoubleSide }); };
      // the carved fretwork board on a gable end: a band of flames along both roof edges, curling up at the eaves and rising to a tall
      // flame spire over the ridge, pierced with little holes; drawn with the roof line from (.04, .04) up to (.5, .5) and down to (.96, .04)
      const laceT = canvasTex(512, (c, S) => {
        const P = (u, v) => [u * S, (1 - v) * S], poly = pts => { c.beginPath(); pts.forEach(([u, v], i) => c[i ? "lineTo" : "moveTo"](...P(u, v))); c.closePath(); c.fill(); };
        c.fillStyle = "#26130a"; c.strokeStyle = "#6e5038"; c.lineWidth = 3;
        [-1, 1].forEach(sd => {
          const at = (t, o) => [.5 + sd * .46 * (1 - t) + sd * .7 * o, .04 + .46 * t + .7 * o], lo = [], up = [];
          for (let i = 0; i <= 20; i++) lo.push(at(i / 20, -.02));
          for (let j = 9; j >= 0; j--) { const t0 = j / 10; up.push(at(t0 + .1, .05), at(t0 + .07, .13), at(t0 + .02, .05)); }
          poly([...lo, ...up]);
          poly([[.5 + sd * .43, 0], [.5 + sd * .5, .03], [.5 + sd * .5, .2], [.5 + sd * .47, .1], [.5 + sd * .44, .06]]);   // the curl at the eave
          c.beginPath(); for (let i = 0; i <= 20; i++) c[i ? "lineTo" : "moveTo"](...P(...at(i / 20, .03))); c.stroke();
        });
        const sp = [[.1, .44], [.13, .55], [.08, .57], [.11, .67], [.06, .69], [.08, .79], [.035, .81], [.04, .9], [0, .99]];
        poly([...sp.map(([d, v]) => [.5 - d, v]), ...sp.slice(0, -1).reverse().map(([d, v]) => [.5 + d, v])]);
        c.globalCompositeOperation = "destination-out";
        [-1, 1].forEach(sd => { for (let t = .06; t < .95; t += .045) { c.beginPath(); c.arc((.5 + sd * .46 * (1 - t) + sd * .7 * .07) * S, (1 - (.04 + .46 * t + .7 * .07)) * S, S * .008, 0, TAU); c.fill(); } });
        for (let v = .5; v < .86; v += .05) [-1, 1].forEach(sd => { c.beginPath(); c.arc((.5 + sd * .03) * S, (1 - v) * S, S * .009, 0, TAU); c.fill(); });
        c.globalCompositeOperation = "source-over";
      });
      const laceM = std({ map: laceT, alphaTest: .5, side: THREE.DoubleSide, roughness: .8 }), laceDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: laceT, alphaTest: .5 });
      // the stilts: rows of weathered teak posts on whitewashed footings
      const posts = [];
      for (let px = -W / 2 + .4; px <= W / 2 - .39; px += (W - .8) / Math.round((W - .8) / 2)) for (let pz = -D / 2 + .4; pz <= D / 2 - .39; pz += (D - .8) / Math.round((D - .8) / 2)) posts.push([px, pz]);
      const post = new THREE.InstancedMesh(new THREE.CylinderGeometry(.17, .2, FH, 8), postM, posts.length), foot = new THREE.InstancedMesh(new THREE.BoxGeometry(.5, .25, .5), white, posts.length), m4 = new THREE.Matrix4();
      posts.forEach(([px, pz], i) => { post.setMatrixAt(i, m4.makeTranslation(px, FH / 2, pz)); foot.setMatrixAt(i, m4.makeTranslation(px, .12, pz)); });
      G.add(post, foot); post.castShadow = true;
      mesh(new THREE.BoxGeometry(W, .3, D), darkM, 0, FH, 0, G);
      // the hall: plank walls in a grid of moulded panels, cut, as at Shwe Yan Pyay, with tall round-topped arched windows (some open,
      // some with their panelled shutters closed), a carved fan over each, and an oval window either side of the door; the door
      // closed; inside, the dim shrine room: its floor, red pillars and the gilded image at the back
      const { WT, ORX, ORY, OY, AW, AH, AB, sideLen, front: frontW, side: sideW } = kyaungWindows(), P2 = (a, b) => new THREE.Vector2(a, b), ovalPts = kwOval, archPts = kwArch;
      const wallFace = (len, wins, door) => {   // one wall, len long, WH high, with window holes and perhaps a doorway in the middle
        const s = new THREE.Shape(); s.moveTo(-len / 2, 0); s.lineTo(len / 2, 0); s.lineTo(len / 2, WH); s.lineTo(-len / 2, WH); s.closePath();
        wins.forEach(w => s.holes.push(new THREE.Path(w.oval ? ovalPts(ORX, ORY, w.x, OY) : archPts(AW, AH, w.x, AB))));
        if (door) s.holes.push(new THREE.Path([[-.7, .02], [-.7, 2.4], [.7, 2.4], [.7, .02]].map(([a, b]) => P2(a, b))));
        return new THREE.ExtrudeGeometry(s, { depth: WT, bevelEnabled: false });
      };
      const ring = (outer, inner, depth, bevel) => { const s = new THREE.Shape(outer); s.holes.push(new THREE.Path(inner)); return new THREE.ExtrudeGeometry(s, bevel ? { depth, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 1 } : { depth, bevelEnabled: false }); };
      const frameM = std({ color: 0x0a0402, roughness: .6 }), beadM = std({ color: 0x1c0d06, roughness: .5 });
      const ovalFrameG = ring(ovalPts(ORX + .1, ORY + .1), ovalPts(ORX, ORY), .07, true), ovalBeadG = ring(ovalPts(ORX + .035, ORY + .035), ovalPts(ORX, ORY), .1);
      const archFrameG = ring(archPts(AW + .1, AH + .15, 0, -.05), archPts(AW, AH), .07, true), archBeadG = ring(archPts(AW + .035, AH + .05, 0, -.015), archPts(AW, AH), .1);
      const leafG = sd => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(sd * AW, 0); s.lineTo(sd * AW, AH - AW); for (let i = 1; i <= 8; i++) { const a = i / 8 * Math.PI / 2; s.lineTo(sd * AW * Math.cos(a), AH - AW + AW * Math.sin(a)); } s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: .05, bevelEnabled: false }); };
      const leaves = [leafG(-1), leafG(1)], panelG = new THREE.BoxGeometry(.26, .5, .03), rayG = new THREE.BoxGeometry(.035, .2, .025), hubG = new THREE.CircleGeometry(.1, 10, 0, Math.PI);
      const sillG = new THREE.BoxGeometry(1, .08, .14), railG = new THREE.BoxGeometry(1, .1, .05), stileG = new THREE.BoxGeometry(.1, 1, .05);
      mesh(wallFace(IW, frontW, true), wallM, 0, FH + .15, ID / 2 - WT, G);
      mesh(new THREE.BoxGeometry(IW, WH, WT), wallM, 0, FH + .15 + WH / 2, -ID / 2 + WT / 2, G);   // the back wall, blind
      const sideWall = wallFace(sideLen, sideW, false);
      [-1, 1].forEach(sd => { const m = mesh(sideWall, wallM, sd * (IW / 2 - WT), FH + .15, 0, G); m.rotation.y = sd * Math.PI / 2; });
      const win = (o, w) => {   // the frame round one opening, proud of the wall's face o
        const q = new THREE.Group(); q.position.set(w.x, w.oval ? OY : AB, 0); o.add(q);
        if (w.oval) { part(ovalFrameG, frameM, 0, 0, 0, q); part(ovalBeadG, beadM, 0, 0, 0, q); part(sillG, frameM, 0, -ORY - .14, .06, q); return; }
        part(archFrameG, frameM, 0, 0, 0, q); part(archBeadG, beadM, 0, 0, 0, q);
        part(sillG, frameM, 0, -.09, .06, q).scale.x = 1.05;
        // the carved fan over the arch: a half rosette with seven rays
        part(hubG, frameM, 0, AH + .14, .03, q);
        for (let i = 0; i < 7; i++) { const a = (i + .5) / 7 * Math.PI; part(rayG, beadM, Math.cos(a) * .22, AH + .14 + Math.sin(a) * .22, .03, q).rotation.z = a - Math.PI / 2; }
        if (w.shut) [-1, 1].forEach((sd, j) => {   // the shutters, closed: two teak leaves, each with two raised panels
          part(leaves[j], darkM, sd * .005, 0, -WT / 2 - .025, q);
          [.45, 1.15].forEach(py => part(panelG, frameM, sd * AW / 2, py, -WT / 2 + .03, q));
        });
      };
      const face = (len, wins, door, wx, wz, ry) => {   // one wall's outer face: its windows, and the mouldings that frame them in panels
        const o = new THREE.Group(); o.position.set(wx, FH + .15, wz); o.rotation.y = ry; G.add(o);
        wins.forEach(w => win(o, w));
        [.1, .4, WH - .12].forEach(y => {   // the low rails stop either side of the doorway
          if (door && y < 2.4) { const L = len / 2 - .8; [-1, 1].forEach(sd => { part(railG, darkM, sd * (.8 + L / 2), y, .025, o).scale.x = L; }); }
          else part(railG, darkM, 0, y, .025, o).scale.x = len;
        });
        const stiles = [-len / 2 + .06, len / 2 - .06, ...(door ? [-.95, .95] : [])];
        for (let i = 1; i < wins.length; i++) if (wins[i].x - wins[i - 1].x < 2) stiles.push((wins[i].x + wins[i - 1].x) / 2);
        stiles.forEach(x => { part(stileG, darkM, x, WH / 2, .025, o).scale.y = WH - .1; });
      };
      face(IW, frontW, true, 0, ID / 2, 0);
      [-1, 1].forEach(sd => face(sideLen, sideW, false, sd * IW / 2, 0, sd * Math.PI / 2));
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
      // the doorway into the shrine hall, its two panelled teak leaves closed, in a plain gilded frame
      const doorParts = [];
      const door = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.4), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
      door.position.set(0, FH + 1.36, ID / 2 + .02); G.add(door); doorParts.push(door);   // an unseen sheet across the doorway, to click
      [-1, 1].forEach(sd => {
        const h = new THREE.Group(); h.position.set(sd * .7, FH + 1.36, ID / 2 - .06); G.add(h);
        doorParts.push(mesh(new THREE.BoxGeometry(.7, 2.38, .06), teakDark, -sd * .35, 0, 0, h));
        [-.6, .6].forEach(py => doorParts.push(mesh(new THREE.BoxGeometry(.5, .8, .02), frameM, -sd * .35, py, .035, h)));   // raised panels
      });
      [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.1, 2.5, .14), M.gold, sd * .75, FH + 1.4, ID / 2 + .05, G));
      mesh(new THREE.BoxGeometry(1.6, .1, .14), M.gold, 0, FH + 2.6, ID / 2 + .05, G);
      // the verandah railing round the platform edge, open where the stair arrives: weathered grey posts and two plain rails
      const railM = std({ color: 0x2c2722, roughness: .9 });
      const rail = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), railM, 120); let k = 0;
      const put = (px, py, pz, a, b, c) => rail.setMatrixAt(k++, m4.compose(V(px, py, pz), new THREE.Quaternion(), V(a, b, c)));
      const railRun = (x0, z0, x1, z1) => {
        const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / 2));
        for (let i = 0; i <= n; i++) put(x0 + (x1 - x0) * i / n, FH + .6, z0 + (z1 - z0) * i / n, .1, 1.1, .1);
        [.5, 1.02].forEach(h => put((x0 + x1) / 2, FH + h, (z0 + z1) / 2, Math.abs(x1 - x0) + .1, .08, Math.abs(z1 - z0) + .1));
      };
      const rx = W / 2 - .05, rz = D / 2 - .05;
      railRun(-rx, -rz, -rx, rz); railRun(rx, -rz, rx, rz); railRun(-rx, -rz, rx, -rz); railRun(-rx, rz, -1.8, rz); railRun(1.8, rz, rx, rz);
      rail.count = k; G.add(rail);
      // the roofs, after Shwe Yan Pyay: a skirt of rusty iron all round over the verandah, a frieze of mirror inlay above it, and on
      // that a cluster of gables, a tall one in the middle carrying a second tier, a lower one either side, every gable end carved
      const faceM = inlayM(1 / 1.5, 1 / 1.5);
      const gableB = (cx, y, cz, w, d, h) => {   // one gable roof, its ridge front to back: rusty slopes, an inlaid face set back under the eave, fretwork boards at both ends
        const hw = w / 2, L = Math.hypot(hw, h) + .6, a = Math.atan2(h, hw), slopeM = rustTex(true, 1, d * .9);
        [-1, 1].forEach(sd => { const sl = mesh(new THREE.BoxGeometry(L, .08, d), slopeM, cx + sd * hw / 2, y + h / 2, cz, G); sl.rotation.z = -sd * a; });
        mesh(new THREE.BoxGeometry(.24, .2, d + .1), darkM, cx, y + h + .04, cz, G);
        const tri = new THREE.Shape(); tri.moveTo(-hw + .15, 0); tri.lineTo(hw - .15, 0); tri.lineTo(0, h - .05); tri.closePath();
        const triG = new THREE.ShapeGeometry(tri), PW = w * 1.12 / .92, PH = h / .46, bG = new THREE.PlaneGeometry(PW, PH);
        [-1, 1].forEach(e => {
          const f = mesh(triG, faceM, cx, y, cz + e * (d / 2 - .25), G); f.rotation.y = e > 0 ? 0 : Math.PI;
          const b = mesh(bG, laceM, cx, y - .04 * PH + PH / 2, cz + e * (d / 2 + .03), G); b.customDepthMaterial = laceDepth;
        });
      };
      const yR = FH + WH, yT = yR + 1.5;   // the walls' top, and the frieze's top where the gables stand
      hip(G, [-W / 2 - .4, W / 2 + .4, -D / 2 - .4, D / 2 + .4], [-IW / 2, IW / 2, -ID / 2, ID / 2], yR - .4, yR + .1).material = rustTex(false, 1, 1);   // its top tucks under the frieze, its eaves clear the stair's lotus buds
      const frontF = inlayM(IW / 1.6, 1), sideF = inlayM(ID / 1.6, 1);
      mesh(new THREE.BoxGeometry(IW, yT - yR - .15, ID), [sideF, sideF, darkM, darkM, frontF, frontF], 0, (yR + .15 + yT) / 2, 0, G);
      gableB(0, yT, 0, 5.6, ID + .6, 1.8);
      const tierF = inlayM(2, 1);
      mesh(new THREE.BoxGeometry(2.4, .9, ID * .5), [tierF, tierF, darkM, darkM, tierF, tierF], 0, yT + 1.45, -.4, G);   // the second tier, rising through the middle gable
      gableB(0, yT + 1.9, -.4, 3.2, ID * .5 + .6, 1.1);
      [-1, 1].forEach(sd => gableB(sd * 4.1, yT, 0, 3.2, ID + .2, 1.2));
      if (tower) pyatthat(G, 0, yT + 1.2, -ID / 2 + .7, 2.6, 4);
      // the monastery's name board on the frieze, under the middle gable
      const BW = 2.6, BH = BW * 300 / 1024, nameFace = shanBoardFace(SHAN_NAMES.kyaung);
      const board = mesh(new THREE.BoxGeometry(BW, BH, .08), [teakDark, teakDark, teakDark, teakDark, nameFace, teakDark], 0, yR + 1.1, ID / 2 + .05, G);
      // the white masonry stair down from the verandah, its walls topped with pinnacles, a gold lotus bud on a red post at the top of
      // each wall and a white naga rearing at its foot
      // with `reach`, the stair runs on at the foot as a level paved walk between low coped walls into the hill stair's wall
      const n = 12, rise = FH / n, tread = .36, SWd = MON.SWd;
      for (let i = 0; i < n; i++) { const y1 = FH - i * rise; mesh(new THREE.BoxGeometry(SWd, y1, tread), white, 0, y1 / 2, D / 2 + i * tread + tread / 2, G); }
      const run = n * tread, R = D / 2 + run, wall = new THREE.Shape(); wall.moveTo(D / 2 - .2, 0); wall.lineTo(D / 2 - .2, FH + .9); wall.lineTo(R, .9); wall.lineTo(R, 0); wall.closePath();
      const LOW = .95 / sc, NW = .6, redPaint = std({ color: 0xc41e14, roughness: .5 }), merlonG = new THREE.BoxGeometry(.4, .3, .4), pinG = new THREE.ConeGeometry(.27, .45, 4);   // the low walls match the hill stair's walls; NW: the newels' size
      [-1, 1].forEach(sd => {
        const wg = new THREE.ExtrudeGeometry(wall, { depth: .4, bevelEnabled: false }); wg.rotateY(-Math.PI / 2);
        const wx = sd * (SWd / 2 + .2);
        mesh(wg, white, sd * (SWd / 2 + (sd > 0 ? .4 : 0)), 0, 0, G);
        for (let i = 0; i <= 8; i++) { const t = i / 8, py = FH + .9 - FH * t, pz = D / 2 - .2 + t * (run + .2); part(merlonG, white, wx, py + .15, pz, G); part(pinG, white, wx, py + .52, pz, G).rotation.y = Math.PI / 4; }
        // at the top, where the stair meets the verandah: a white post, a red band and a gold lotus bud
        mesh(new THREE.BoxGeometry(.55, 1.0, .55), white, wx, FH + 1.1, D / 2 + .1, G);
        mesh(new THREE.BoxGeometry(.42, .5, .42), redPaint, wx, FH + 1.85, D / 2 + .1, G);
        const lb = mesh(new THREE.SphereGeometry(.24, 12, 10), M.gold, wx, FH + 2.3, D / 2 + .1, G); lb.scale.y = 1.4;
        mesh(new THREE.ConeGeometry(.1, .35, 10), M.gold, wx, FH + 2.75, D / 2 + .1, G);
        // at the foot, a white naga with a chinthe's head rearing up to face the visitor: red mouth, dark eyes, a flame crest down its neck
        const fz = R + NW / 2;
        mesh(new THREE.BoxGeometry(NW, .9, NW), white, wx, .45, fz, G);
        mesh(new THREE.BoxGeometry(NW + .12, .1, NW + .12), M.trim, wx, .95, fz, G);
        const neck = mesh(new THREE.CylinderGeometry(.18, .26, .8, 10), white, wx, 1.3, fz - .05, G); neck.rotation.x = .25;
        const head = mesh(new THREE.SphereGeometry(.26, 14, 10), white, wx, 1.78, fz + .06, G); head.scale.set(1, .85, 1.25);
        mesh(new THREE.BoxGeometry(.3, .16, .3), white, wx, 1.72, fz + .32, G);   // the snout
        mesh(new THREE.BoxGeometry(.24, .07, .14), redPaint, wx, 1.62, fz + .42, G);   // the open mouth
        [-1, 1].forEach(e => mesh(new THREE.SphereGeometry(.045, 8, 6), teakDark, wx + e * .11, 1.86, fz + .28, G));
        for (let i = 0; i < 4; i++) { const c = mesh(new THREE.ConeGeometry(.08, .3, 4), white, wx, 2.0 - i * .17, fz - .1 - i * .1, G); c.rotation.x = -.6; }
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
    wihanKyaung(H);
  }
