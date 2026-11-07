  /* ---------- the back streets: four small concrete lanes with open drains off the main roads, lined with small houses of
     Northern Shan towns today, one and two storeys: painted concrete ones (shanHouse) and teak plank ones, either raised on posts
     or a wooden storey over a whitewashed brick ground floor, with verandahs, painted shutters and rusty corrugated hip roofs;
     and the old banyan on the corner of the market lane ---------- */
  const teakTex = canvasTex(128, (c, sz) => { c.fillStyle = "#6a3e22"; c.fillRect(0, 0, sz, sz); for (let y = 0; y < sz; y += 11) { c.fillStyle = "rgba(20,8,2,.55)"; c.fillRect(0, y, sz, 2); c.fillStyle = "rgba(160,100,60,.15)"; c.fillRect(0, y + 3, sz, 3); } });
  teakTex.wrapS = teakTex.wrapT = THREE.RepeatWrapping; teakTex.repeat.set(3, 1.2);
  const teakWall = std({ map: teakTex, roughness: .8 }), teakDark = std({ color: 0x3e2414, roughness: .8 }), teakPost = std({ color: 0x4a2c18, roughness: .85 });
  const whiteWall = std({ color: 0xece6d6, roughness: .9 }), houseInside = std({ color: 0x1a120c, roughness: .9, emissive: 0xffc070, emissiveIntensity: 0 });
  onDaylight(d => { houseInside.emissiveIntensity = .55 * (1 - d) * (1 - FEST.out); });
  const SHUTTERS = [0x2f6a8a, 0x3a7a4a, 0x8a3a2a, 0x4a3020].map(c => std({ color: c, roughness: .6 }));
  const rustRoof = (() => { const t = corrugated("", "#b0703a", "#5a3018"); return std({ map: t, roughness: .7, metalness: .3, side: THREE.DoubleSide }); })();
  // a hip roof over a 2a × 2b rectangle, its ridge along x (a ≥ b), rising hgt; corrugations run down each slope
  function tinHipRoof(a, b, hgt, mat) {
    const rx = a - b, P = [[-a, 0, b], [a, 0, b], [rx, hgt, 0], [-rx, hgt, 0], [a, 0, -b], [-a, 0, -b]];
    const pos = [], uv = [];
    [[0, 1, 2], [0, 2, 3], [4, 5, 3], [4, 3, 2], [1, 4, 2], [5, 0, 3]].forEach((t, k) => t.forEach(i => { const p = P[i]; pos.push(...p); uv.push((k < 4 ? p[0] : p[2]) / 1.2, p[1]); }));
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, mat);
  }
  // a wooden Shan house in local coordinates: front faces +z, width W, depth D, a verandah across the front; one storey raised
  // on teak posts with a stair up to the verandah, or two: a wooden storey on a whitewashed brick ground floor
  const winBackGeo = new THREE.BoxGeometry(.9, 1.1, .06), winLintelGeo = new THREE.BoxGeometry(1.06, .08, .12), winShutterGeo = new THREE.BoxGeometry(.45, 1.1, .05);
  function shanWoodHouse(g, x, z, ry, o) {
    const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
    const { W, D, floors, roof, seed } = o, r = rng(seed), FH = 2.8, VD = 1.6, shut = SHUTTERS[seed % SHUTTERS.length];
    sRect(h, -W / 2 - .2, W / 2 + .2, -D / 2 - .2, D / 2 + VD + (floors === 1 ? 1.3 : .2));
    // a window: a dark opening between two painted plank shutters folded open, on a wall facing local +z of its frame
    const win = (px, py, pz, rot) => {
      const w = new THREE.Group(); w.position.set(px, py, pz); w.rotation.y = rot; h.add(w);
      part(winBackGeo, houseInside, 0, 0, .02, w);
      [-1, 1].forEach(sd => { part(winLintelGeo, teakDark, 0, sd * .58, .04, w); part(winShutterGeo, shut, sd * .72, 0, .06, w); });
    };
    let y0 = 1.1;   // the wooden storey's floor
    const left = seed % 2 ? 1 : -1;   // which side the door (and the stair) is on
    if (floors === 2) {   // a whitewashed brick ground floor, the wooden storey and its verandah above, carried on brick piers
      mesh(new THREE.BoxGeometry(W + .4, .25, D + VD + .6), concrete, 0, .125, VD / 2, h);
      mesh(new THREE.BoxGeometry(W, FH, D), whiteWall, 0, .25 + FH / 2, 0, h);
      mesh(new THREE.BoxGeometry(1.2, 2.2, .08), teakDark, left * W / 4, .25 + 1.1, D / 2 + .03, h);
      win(-left * W / 4, 1.75, D / 2 + .01, 0);
      [-1, 1].forEach(sd => { win(sd * (W / 2 + .01), 1.75, 0, sd * Math.PI / 2); mesh(new THREE.BoxGeometry(.3, FH, .3), whiteWall, sd * (W / 2 - .15), .25 + FH / 2, D / 2 + VD - .15, h); });
      y0 = .25 + FH;
    } else {   // raised on teak posts, the space underneath kept for shade, firewood and the loom
      for (const px of [-W / 2 + .2, 0, W / 2 - .2]) for (const pz of [-D / 2 + .2, 0, D / 2 - .2, D / 2 + VD - .2]) mesh(new THREE.BoxGeometry(.2, y0, .2), teakPost, px, y0 / 2, pz, h);
      const sx = left * (W / 2 - .75), z1 = D / 2 + VD;   // a wooden stair down from the verandah
      for (let k = 0; k < 4; k++) mesh(new THREE.BoxGeometry(1.0, .06, .3), teakDark, sx, .22 * (k + 1) - .03, z1 + .15 + (3 - k) * .28, h);
      [-1, 1].forEach(sd => { const s = mesh(new THREE.BoxGeometry(.06, .2, 1.45), teakDark, sx + sd * .52, .6, z1 + .6, h); s.rotation.x = Math.atan2(1.1, 1.2); });
      const stack = mesh(new THREE.BoxGeometry(1.4, .5, .6), std({ color: 0x6a4a2a, roughness: 1 }), -left * W / 4, .25, -D / 4, h); stack.castShadow = false;   // firewood
    }
    // the wooden storey: floor, plank walls, a door and shuttered windows
    mesh(new THREE.BoxGeometry(W + .3, .14, D + VD + .1), teakDark, 0, y0 - .07, VD / 2, h);
    mesh(new THREE.BoxGeometry(W, FH, D), teakWall, 0, y0 + FH / 2, 0, h);
    mesh(new THREE.BoxGeometry(1.0, 2.1, .06), teakDark, left * W / 4, y0 + 1.05, D / 2 + .03, h);
    win(-left * W / 4, y0 + 1.4, D / 2 + .01, 0);
    win(0, y0 + 1.4, -D / 2 - .01, Math.PI);
    [-1, 1].forEach(sd => win(sd * (W / 2 + .01), y0 + 1.4, 0, sd * Math.PI / 2));
    // the verandah: a plank balustrade (open at the stair), side rails and posts up to the eaves
    const rz = D / 2 + VD - .08;
    if (floors === 1) {
      const gx = left * (W / 2 - .75), a = -W / 2, b = W / 2, cut = [gx - .55, gx + .55];
      [[a, cut[0]], [cut[1], b]].forEach(([p, q]) => { if (q - p > .1) mesh(new THREE.BoxGeometry(q - p, .75, .05), teakWall, (p + q) / 2, y0 + .45, rz, h); });
    } else mesh(new THREE.BoxGeometry(W, .75, .05), teakWall, 0, y0 + .45, rz, h);
    [-1, 1].forEach(sd => {
      mesh(new THREE.BoxGeometry(.05, .75, VD), teakWall, sd * (W / 2 - .03), y0 + .45, D / 2 + VD / 2, h);
      mesh(new THREE.BoxGeometry(.16, FH, .16), teakPost, sd * (W / 2 - .1), y0 + FH / 2, rz, h);
    });
    mesh(new THREE.BoxGeometry(W + .2, .16, D + VD + .1), teakDark, 0, y0 + FH + .08, VD / 2, h);   // the wall plate and verandah ceiling
    // a rusty corrugated hip roof over the house and its verandah, with a deep overhang
    const a = W / 2 + .7, b = (D + VD) / 2 + .7, roofM = tinHipRoof(Math.max(a, b), Math.min(a, b), Math.min(a, b) * .55, roof);
    roofM.position.set(0, y0 + FH + .16, VD / 2); if (a < b) roofM.rotation.y = Math.PI / 2; roofM.castShadow = roofM.receiveShadow = true; h.add(roofM);
    // water: a blue tank on a stand at the back, or big glazed Martaban jars by the front
    if (r() < .5) {
      const tx = -left * (W / 2 - .7), tz = -D / 2 - .9, th = 2.2;
      [[-.4, -.4], [.4, -.4], [-.4, .4], [.4, .4]].forEach(([p, q]) => mesh(new THREE.BoxGeometry(.08, th, .08), steel, tx + p, th / 2, tz + q, h));
      mesh(new THREE.CylinderGeometry(.5, .5, 1.1, 16), tank, tx, th + .55, tz, h);
    } else {
      const jar = std({ color: 0x4a2a14, roughness: .3, metalness: .1 });
      for (let k = 0; k < 2 + (seed % 2); k++) { const j = mesh(new THREE.SphereGeometry(.38, 12, 10), jar, -left * (W / 2 - .5) + left * k * .85, .42, D / 2 + VD + .6, h); j.scale.y = 1.2; }
    }
  }
  // a banana clump: a few pseudo-stems under broad, drooping leaves
  const bananaMats = [0x4a8a2e, 0x5a9a36, 0x3e7a28].map(c => std({ color: c, roughness: .7, side: THREE.DoubleSide, flatShading: true }));
  function banana(g, x, z, seed = 1) {
    const r = rng(seed * 13), t = new THREE.Group(); t.position.set(x, 0, z); g.add(t);
    sCircle(t, 0, 0, .5);
    for (let s = 0; s < 3; s++) {
      const sx = (r() - .5) * .9, sz = (r() - .5) * .9, H = 2 + r() * 1.2;
      mesh(new THREE.CylinderGeometry(.09, .14, H, 7), bananaMats[2], sx, H / 2, sz, t);
      for (let i = 0; i < 5; i++) {
        const leaf = mesh(new THREE.PlaneGeometry(.55, 1.9), bananaMats[i % 2], 0, 0, 0, t);
        leaf.geometry.translate(0, .95, 0); leaf.position.set(sx, H, sz); leaf.rotation.set(1.0 + r() * .5, i / 5 * TAU + r(), 0, "YXZ"); leaf.castShadow = false;
      }
    }
  }
  // ညောင်ပင်, a banyan many generations old: a trunk of many stems grown together, wide limbs dropping aerial roots (the oldest
  // have rooted into the platform as new trunks), a broad low crown; a whitewashed brick platform round its foot with a spirit house
  function banyan(g, x, z, s = 1) {
    const list = picks.pagoda, r = rng(808), t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); g.add(t);
    const bk = std({ color: 0x6e6658, roughness: .95 });
    const data = { tip: "The old banyan · ညောင်ပင်", toast: "A banyan many generations old shades the corner of the market lane. Its hanging roots have grown down into new trunks; people keep a little spirit house at its foot with fresh flowers and water, and the market porters rest on its platform at noon." };
    clickable(list, mesh(new THREE.CylinderGeometry(2.3, 2.45, .55, 24), whiteWall, 0, .275, 0, t), data);
    mesh(new THREE.CylinderGeometry(2.36, 2.36, .08, 24), std({ color: 0x9a4a32, roughness: .8 }), 0, .58, 0, t);
    sCircle(t, 0, 0, 2.45);
    const foot = .6;
    clickable(list, mesh(new THREE.CylinderGeometry(.8, 1.3, 1.4, 10), bk, 0, foot + .7, 0, t), data);
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * TAU + r() * .3, d = .35 + r() * .25, rad = .28 + r() * .18;
      const st = mesh(new THREE.CylinderGeometry(rad * .8, rad * 1.35, 5.6, 7), bk, Math.cos(a) * d, foot + 2.8, Math.sin(a) * d, t);
      st.rotation.set(Math.sin(a) * .08, 0, -Math.cos(a) * .08);
    }
    const roots = [];
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU + r() * .4, L = 4.5 + r() * 2.5, y = foot + 4.4 + r() * 1.4, tilt = .2 + r() * .25;
      const dir = V(Math.cos(a) * Math.cos(tilt), Math.sin(tilt), Math.sin(a) * Math.cos(tilt)), base = V(Math.cos(a) * .4, y, Math.sin(a) * .4);
      const limb = mesh(new THREE.CylinderGeometry(.14, .34, L, 7), bk, 0, 0, 0, t);
      limb.quaternion.setFromUnitVectors(V(0, 1, 0), dir); limb.position.copy(base).addScaledVector(dir, L / 2);
      for (let k = 0; k < 5; k++) { const p = base.clone().addScaledVector(dir, L * (.2 + k * .18)); roots.push([p, Math.hypot(p.x, p.z) < 2.0]); }
    }
    roots.forEach(([p, rooted]) => {   // aerial roots: hanging strands, and pillar roots where they reach the platform
      const len = rooted ? p.y - foot : 1.2 + r() * 2.8, rad = rooted ? .08 + r() * .06 : .025;
      mesh(new THREE.CylinderGeometry(rad, rooted ? rad * 1.7 : rad * .6, len, 5), bk, p.x, p.y - len / 2, p.z, t).castShadow = rooted;
    });
    // the crown: dark glossy leaf clumps in a broad, low dome
    const N = 240, crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), std({ color: 0xffffff, roughness: .55, flatShading: true }), N), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), tc = new THREE.Color();
    const greens = [0x1c3e18, 0x24481c, 0x173614, 0x2c5222];
    for (let i = 0; i < N; i++) {
      const hh = r(), y = foot + 6 + hh * 5, maxR = 8.5 * (1 - hh * hh * .7), rr = (.3 + .7 * Math.sqrt(r())) * maxR, a = r() * TAU, sz = .9 + r() * .7;
      crown.setMatrixAt(i, m4.compose(V(Math.cos(a) * rr, y, Math.sin(a) * rr), q.setFromAxisAngle(V(0, 1, 0), r() * TAU), V(sz, sz * .65, sz)));
      crown.setColorAt(i, tc.set(greens[i % 4]));
    }
    crown.frustumCulled = false; crown.castShadow = true; t.add(crown);
    // cloths of red, white and yellow tied round the trunk
    [0xc02a2a, 0xf4f0e4, 0xe8b020].forEach((c, i) => mesh(new THREE.CylinderGeometry(1.02 - i * .03, 1.06 - i * .03, .16, 18, 1, true), std({ color: c, roughness: .8, side: THREE.DoubleSide }), 0, foot + 1.5 + i * .2, 0, t));
    // the spirit house on its post, facing the street, with flowers and a cup of water
    const sh = new THREE.Group(); sh.position.set(1.2, foot, -1.5); sh.rotation.y = Math.PI + .5; t.add(sh);
    mesh(new THREE.BoxGeometry(.1, 1.3, .1), teakPost, 0, .65, 0, sh);
    mesh(new THREE.BoxGeometry(.8, .06, .6), teakDark, 0, 1.33, 0, sh);
    mesh(new THREE.BoxGeometry(.55, .45, .4), std({ color: 0xb02a22, roughness: .5 }), 0, 1.58, -.05, sh);
    const sroof = mesh(new THREE.ConeGeometry(.48, .4, 4), std({ color: 0xd8a830, roughness: .35, metalness: .6 }), 0, 2.0, -.05, sh); sroof.rotation.y = Math.PI / 4;
    [[-.28, 0xf0e050], [.28, 0xffffff]].forEach(([fx, c]) => mesh(new THREE.SphereGeometry(.08, 8, 6), std({ color: c, roughness: .6 }), fx, 1.42, .2, sh));
    TALL.push({ x0: x - 8.5 * s, x1: x + 8.5 * s, z0: z - 8.5 * s, z1: z + 8.5 * s, h: (foot + 11) * s });
  }
