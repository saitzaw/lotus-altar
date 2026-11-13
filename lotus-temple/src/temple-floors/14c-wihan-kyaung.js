  /* ---------- the third Shan monastery (ဝိႁၢၼ်ႇၵုင်းသႃႇ, its name from the owner), on the stupa hill's lower terrace past the second
     one, after the owner's photograph of a northern Shan monastery: on the left a two-storey hall of cream plaster in a brown
     timber frame, blue shutters below and glazed windows above, under a three-tier roof of rusty corrugated iron with two
     clerestories of pale blue planks between the tiers; on the right a wing raised on red-brown posts, its upper floor a long
     verandah with a white balustrade and cream fretwork valances under the eaves and the floor, a gabled porch over the wooden
     stair up to it, and on the wing's roof a little blue tower with red flowers and the name board under its gable. The flag of
     Myanmar and the Buddhist flag fly at the wing's end. Outside only: its doors don't open yet ---------- */
  function wihanKyaung(H) {
    const list = picks.pagoda, s = wihanSpot(), { roofM, hip } = shanCarpentry(), name = SHAN_NAMES.wihan;
    const B = new THREE.Group(); B.position.set(s.x, s.y, s.z); B.rotation.y = s.ry; H.add(B);   // its front (local +z) faces down the hill
    const L = s.L, hl = L / 2, hd = s.D / 2, FH = 3, TOP = 6.2, XW = 0;   // half length and depth, the upper floor, the eaves; the hall runs x -hl…XW, the wing XW…hl
    const SX = s.SX, SWd = 2.6, n = 12, tread = s.run / n, rise = FH / n, run = s.run, VZ = 2.5;   // the stair (its centre, width, steps); VZ: the verandah's back wall
    // its paints: cream plaster in a timber frame, pale blue planks and shutters, red-brown posts, a yellow band at the floor line
    const frameT = canvasTex(128, (c, sz) => {   // one bay of the frame, 2.4 m wide and a storey high: a post, a sill rail and a beam
      c.fillStyle = "#e4dcb8"; c.fillRect(0, 0, sz, sz); c.fillStyle = "rgba(150,130,80,.12)"; for (let i = 0; i < 40; i++) c.fillRect((i * 37) % sz, (i * 53) % sz, 9, 6);
      c.fillStyle = "#6e3a26"; c.fillRect(0, 0, 6, sz); c.fillRect(0, 0, sz, 5); c.fillRect(0, sz * .62, sz, 5);
    });
    frameT.wrapS = frameT.wrapT = THREE.RepeatWrapping;
    const plaster = (w, h) => { const t = frameT.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(w / 2.4)), h / 3.1); return std({ map: t, roughness: .85 }); };
    const plankT = canvasTex(128, (c, sz) => { c.fillStyle = "#7fa8bc"; c.fillRect(0, 0, sz, sz); for (let x = 0; x < sz; x += 11) { c.fillStyle = "rgba(30,50,60,.35)"; c.fillRect(x, 0, 2, sz); c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(x + 4, 0, 3, sz); } });
    plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping;
    // a clerestory's face: pale blue planks with a row of white-framed glazed windows, one to every 1.6 m
    const cleT = canvasTex(128, (c, sz) => {
      c.drawImage(plankT.image, 0, 0); c.fillStyle = "#f2f0e8"; c.fillRect(sz * .2, sz * .18, sz * .6, sz * .64);
      c.fillStyle = "#3a4650"; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) c.fillRect(sz * (.25 + i * .18), sz * (.24 + j * .28), sz * .14, sz * .22);
    });
    cleT.wrapS = THREE.RepeatWrapping;
    const blue = std({ color: 0x6a9cba, roughness: .6 }), post = std({ color: 0x5a2418, roughness: .7 }), boards = std({ color: 0x5c3a26, roughness: .8 }), yellow = std({ color: 0xc8a43c, roughness: .7 });
    const cream = std({ color: 0xece4c8, roughness: .7 }), white = std({ color: 0xeeeee8, roughness: .7 }), dark = std({ color: 0x2a221c, roughness: .9 });
    const pane = std({ color: 0x2a3640, roughness: .3, emissive: 0xffb060, emissiveIntensity: 0 }); onDaylight(d => pane.emissiveIntensity = .7 * (1 - d));
    const valT = canvasTex(64, (c, sz) => {   // cream fretwork: a band with a row of scallops and a little drop between them
      c.fillStyle = "#ece4c8"; c.fillRect(0, 0, sz, sz * .38); [0, 1].forEach(k => { c.beginPath(); c.arc(k * sz / 2 + sz / 4, sz * .38, sz / 4, 0, Math.PI); c.fill(); });
      c.fillRect(sz / 2 - 3, sz * .38, 6, sz * .5); c.beginPath(); c.arc(sz / 2, sz * .9, 6, 0, TAU); c.fill();
    });
    valT.wrapS = THREE.RepeatWrapping;
    const valM = std({ map: valT, alphaTest: .5, side: THREE.DoubleSide, roughness: .7 });
    const valance = (len, x, y, z, ry = 0) => {
      const g = new THREE.PlaneGeometry(len, .5), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * len / .55);
      flat(mesh(g, valM, x, y - .25, z, B)).rotation.y = ry;
    };
    const facing = (w, h, d, x, y, z, side, mid) => mesh(new THREE.BoxGeometry(w, h, d), [side(d, h), side(d, h), mid, mid, side(w, h), side(w, h)], x, y, z, B);
    // the hall: two storeys of framed plaster from the ground to the eaves, a yellow band at the upper floor
    const HW = XW + hl;
    facing(HW, TOP, s.D, (XW - hl) / 2, TOP / 2, 0, plaster, dark);
    mesh(new THREE.BoxGeometry(HW + .08, .22, s.D + .08), yellow, (XW - hl) / 2, FH, 0, B);
    // its windows: blue shutter pairs below, glazed sashes with a little hood above; a blue door in the front, one at the back
    const shutG = new THREE.BoxGeometry(1.1, 1.5, .08), sashG = new THREE.BoxGeometry(1.0, 1.7, .06), glassG = new THREE.PlaneGeometry(.84, 1.0), hoodG = new THREE.BoxGeometry(1.2, .08, .35), barG = new THREE.BoxGeometry(.03, 1.0, .02);
    const opening = (x, z, ry, up) => {
      const o = new THREE.Group(); o.position.set(x, 0, z); o.rotation.y = ry; B.add(o);
      if (!up) { part(shutG, blue, 0, 1.45, .04, o); part(barG, dark, 0, 1.45, .09, o).scale.y = 1.4; return; }
      part(sashG, white, 0, FH + 1.35, .03, o); part(glassG, pane, 0, FH + 1.6, .07, o); part(barG, white, 0, FH + 1.6, .08, o);
      part(shutG, blue, 0, FH + .6, .04, o).scale.set(.84, .3, 1); part(hoodG, white, 0, FH + 2.3, .18, o);
    };
    [-11.2, -8.6, -6].forEach(x => opening(x, hd, 0, false));
    [-11.2, -8.6, -6, -3.2, -.9].forEach(x => { opening(x, hd, 0, true); opening(x, -hd, Math.PI, true); });
    [-11.2, -8.6, -3.2].forEach(x => opening(x, -hd, Math.PI, false));
    [-3.6, -1.2, 1.2, 3.6].forEach(z => { opening(-hl, z, -Math.PI / 2, true); if (Math.abs(z) > 2) opening(-hl, z, -Math.PI / 2, false); });
    const doorG = new THREE.BoxGeometry(1.2, 2.3, .08);
    [[-3, hd, 0], [-6, -hd, Math.PI], [-hl, 0, -Math.PI / 2]].forEach(([x, z, ry]) => { const d = part(doorG, blue, x, 1.15, z, B); d.rotation.y = ry; d.translateZ(.04); });
    // the wing: the upper room behind the verandah, the floor on its posts, a plastered store at the back of the open ground floor
    const WL = hl - XW, WX = (XW + hl) / 2;
    facing(WL, TOP - FH, hd + VZ, WX, (FH + TOP) / 2, (VZ - hd) / 2, plaster, dark);
    facing(WL, FH, 3.6, WX, FH / 2, -hd + 1.8, plaster, dark);
    mesh(new THREE.BoxGeometry(WL + .1, .25, s.D + .1), boards, WX, FH - .12, 0, B);
    mesh(new THREE.BoxGeometry(WL + .12, .16, .1), yellow, WX, FH - .14, hd + .05, B);
    const postG = new THREE.CylinderGeometry(.12, .14, 1, 8);
    for (let i = 0; i <= 5; i++) {
      const x = XW + .3 + i * (WL - .6) / 5;
      part(postG, post, x, TOP / 2, hd - .15, B).scale.y = TOP;   // the verandah posts, ground to eaves
      [VZ - .2, .4].forEach(z => part(postG, post, x, FH / 2, z, B).scale.y = FH);   // the posts under the floor
    }
    // along the verandah's back wall: blue doors and shuttered windows; inside the open ground floor, two doors into the store
    [[1.6, 1], [4, 0], [8.8, 1], [11.2, 0]].forEach(([x, isDoor]) => {
      if (isDoor) part(doorG, blue, x, FH + 1.15, VZ + .04, B); else { part(shutG, blue, x, FH + 1.5, VZ + .04, B); part(barG, dark, x, FH + 1.5, VZ + .09, B).scale.y = 1.4; }
    });
    [3, 9.5].forEach(x => part(doorG, blue, x, 1.15, -hd + 3.64, B));
    // the verandah's balustrade: white balusters under a red-brown rail, along its front and its end, open where the stair arrives
    const balG = new THREE.BoxGeometry(.06, .8, .06);
    const rail = (x0, z0, x1, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0), k = Math.round(len / .22);
      const r = mesh(new THREE.BoxGeometry(len, .08, .12), post, (x0 + x1) / 2, FH + .9, (z0 + z1) / 2, B); r.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
      for (let i = 0; i <= k; i++) part(balG, white, x0 + (x1 - x0) * i / k, FH + .45, z0 + (z1 - z0) * i / k, B);
    };
    rail(XW + .1, hd - .15, SX - SWd / 2, hd - .15); rail(SX + SWd / 2, hd - .15, hl - .1, hd - .15); rail(hl - .1, VZ, hl - .1, hd - .15);
    // the fretwork valances: under the verandah's eaves, and under its floor
    valance(WL, WX, TOP, hd + .45); valance(s.D + .9, hl + .45, TOP, 0, Math.PI / 2); valance(WL, WX, FH - .25, hd + .06);
    // the stair: treads on two stringers and a handrail each side, under a little gabled porch on four posts
    const treadG = new THREE.BoxGeometry(SWd, .06, tread + .04), slope = Math.atan2(FH, run), sLen = Math.hypot(FH, run);
    for (let i = 0; i < n - 1; i++) part(treadG, boards, SX, FH - (i + 1) * rise - .03, hd + (i + .5) * tread, B);
    [-1, 1].forEach(sd => {
      const x = SX + sd * (SWd / 2 + .05);
      mesh(new THREE.BoxGeometry(.08, .3, sLen), post, x, FH / 2 - .1, hd + run / 2, B).rotation.x = slope;
      mesh(new THREE.BoxGeometry(.06, .08, sLen), white, x, FH / 2 + .9, hd + run / 2, B).rotation.x = slope;
      [hd + .1, hd + 2.6].forEach(z => part(postG, post, x + sd * .15, 2.75, z, B).scale.y = 5.5);
    });
    // a gable roof with its ridge along local z: rusty slopes and pale blue planked gable ends with a cream fretwork edge
    function blueGable(cx, y, cz, w, d, h, edge = true) {
      const hw = w / 2, a = Math.atan2(h, hw), Ls = Math.hypot(hw, h) + .5;
      [-1, 1].forEach(sd => { const sl = mesh(new THREE.BoxGeometry(Ls, .08, d + .6), roofM, cx + sd * (hw / 2 + .1), y + h / 2 - .05, cz, B); sl.rotation.z = -sd * a; });
      mesh(new THREE.BoxGeometry(.18, .18, d + .7), roofM, cx, y + h + .02, cz, B);
      const tri = new THREE.Shape(); tri.moveTo(-hw, 0); tri.lineTo(hw, 0); tri.lineTo(0, h); tri.closePath();
      const t = plankT.clone(); t.needsUpdate = true; t.repeat.set(1 / 1.2, 1 / 1.2); const gm = std({ map: t, roughness: .7 });
      [-1, 1].forEach(e => {
        const z = cz + e * d / 2;
        mesh(new THREE.ExtrudeGeometry(tri, { depth: .1, bevelEnabled: false }), [gm, white], cx, y, z - (e > 0 ? .1 : 0), B);
        if (edge) [-1, 1].forEach(sd => { const tr = mesh(new THREE.BoxGeometry(Math.hypot(hw, h), .12, .06), cream, cx + sd * hw / 2, y + h / 2 - .02, z + e * .32, B); tr.rotation.z = -sd * a; });
      });
    }
    blueGable(SX, FH + 2.5, hd + 1.5, SWd + 1.4, 2.6, 1.5);
    mesh(new THREE.BoxGeometry(SWd + 1.3, .12, .12), post, SX, FH + 2.5, hd + 2.75, B);
    valance(SWd + 1.3, SX, FH + 2.48, hd + 2.85);
    // the hall's roof: three hipped tiers, each lower one on a clerestory of blue planks and windows
    const band = (w, h, d, x, y) => {
      const mk = len => { const t = cleT.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(len / 1.6)), 1); return std({ map: t, roughness: .6 }); };
      const mw = mk(w), md = mk(d); return mesh(new THREE.BoxGeometry(w, h, d), [md, md, dark, dark, mw, mw], x, y + h / 2, 0, B);
    };
    const HX = (XW - hl) / 2;
    hip(B, [-hl - .8, XW + .6, -hd - .8, hd + .8], [HX - 4.6, HX + 4.6, -3.4, 3.4], TOP, TOP + 1.9);
    band(9.2, 1.6, 6.8, HX, TOP + 1.8);
    hip(B, [HX - 5.6, HX + 5.6, -4.3, 4.3], [HX - 3.6, HX + 3.6, -2.5, 2.5], TOP + 3.3, TOP + 4.3);
    band(7.2, 1.3, 5.0, HX, TOP + 4.2);
    hip(B, [HX - 4.4, HX + 4.4, -3.2, 3.2], [HX - 2.2, HX + 2.2, 0, 0], TOP + 5.4, TOP + 6.9);
    // the wing's roof, over the verandah too, and on it the little blue tower: red flowers on its faces, the name board under its gable
    hip(B, [XW - .2, hl + .9, -hd - .8, hd + .9], [XW + 2.6, hl - 2.6, -.6, -.6], TOP, TOP + 1.7);
    const TX = 8.4, TZ = -1.4, TW = 3.6, TD = 2.8, TH = 2.2, ty = TOP + 1.1;
    const tw = plankT.clone(); tw.needsUpdate = true; tw.repeat.set(2, 1);
    mesh(new THREE.BoxGeometry(TW, TH, TD), std({ map: tw, roughness: .6 }), TX, ty + TH / 2, TZ, B);
    const flowerT = canvasTex(64, (c, sz) => { c.fillStyle = "#b02a22"; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.beginPath(); c.ellipse(sz / 2 + Math.cos(a) * 13, sz / 2 + Math.sin(a) * 13, 11, 6, a, 0, TAU); c.fill(); } c.fillStyle = "#e8c050"; c.beginPath(); c.arc(sz / 2, sz / 2, 8, 0, TAU); c.fill(); });
    const flowerM = std({ map: flowerT, transparent: true, alphaTest: .3, roughness: .7 }), flowerG = new THREE.PlaneGeometry(.6, .6);
    part(flowerG, flowerM, TX - 1.1, ty + TH * .62, TZ + TD / 2 + .02, B);
    [-1, 1].forEach(sd => [-.6, .6].forEach(z => { const f = part(flowerG, flowerM, TX + sd * (TW / 2 + .02), ty + TH * .55, TZ + z, B); f.rotation.y = sd * Math.PI / 2; }));
    blueGable(TX, ty + TH, TZ, TW + .6, TD + .4, 1.7);
    let board = null;
    if (name) { const BW = 1.9, BH = BW * 300 / 1024; board = mesh(new THREE.BoxGeometry(BW, BH, .06), [dark, dark, dark, dark, shanBoardFace(name), dark], TX + .55, ty + TH * .62, TZ + TD / 2 + .06, B); }
    // the flags at the wing's end: the flag of Myanmar, and the Buddhist flag (blue, yellow, red, white, orange and the five together)
    flagPole(B, hl + 1.2, hd + 2.6, 8);
    {
      const bt = canvasTex(128, (c, sz) => {
        const cols = ["#0050c8", "#ffd800", "#d8202a", "#ffffff", "#ff8a00"], w = sz / 6;
        cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(i * w, 0, w + 1, sz); });
        cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(5 * w, i * sz / 5, w + 1, sz / 5 + 1); });
      });
      const x = hl + 2.5, z = hd + 1.4, PH = 8.6;
      mesh(new THREE.CylinderGeometry(.06, .08, PH, 8), white, x, PH / 2, z, B); sCircle(B, x, z, .15);
      flat(mesh(new THREE.PlaneGeometry(1.8, 1.2), std({ map: bt, roughness: .7, side: THREE.DoubleSide }), x + .95, PH - .7, z, B));
    }
    bakeParts(B);
    // walkable: up the stair onto the verandah; the porch posts, the hall and the wing block
    sRect(B, SX - SWd / 2 + .1, SX + SWd / 2 - .1, hd - .15, hd + run, (lx, lz) => FH * (1 - Math.max(0, lz - hd) / run));
    [-1, 1].forEach(sd => [hd + .1, hd + 2.6].forEach(z => sCircle(B, SX + sd * (SWd / 2 + .2), z, .15)));
    sRect(B, XW, hl, VZ, hd, (lx, lz) => lx > hl - .4 || lx < XW + .45 || lz < VZ + .4 || lz > hd - .4 && Math.abs(lx - SX) > SWd / 2 - .1 ? null : FH);
    sRect(B, -hl, hl, -hd, hd);
    // tapping it
    const tip = name ? `${name} · a Shan monastery` : "A Shan monastery on the hill's lower terrace";
    const toast = `${name ? name + ": a" : "A"} Shan monastery on the lower terrace of the stupa hill: a hall of plaster and timber under three tiers of iron roofs, and a wing on posts whose verandah you reach by the wooden stair. The flag of Myanmar and the Buddhist flag fly at its end.`;
    B.traverse(o => { if (o.isMesh) clickable(list, o, { tip, toast }); });
    // keep the outside camera above it
    B.updateMatrixWorld(true);
    const xs = [], zs = [];
    [[-hl - 1.5, -hd - 1.5], [hl + 3.5, -hd - 1.5], [-hl - 1.5, hd + run + .5], [hl + 3.5, hd + run + .5]].forEach(([lx, lz]) => { const w = B.localToWorld(V(lx, 0, lz)); xs.push(w.x); zs.push(w.z); });
    TALL.push({ x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), h: s.y + 14 });
  }
