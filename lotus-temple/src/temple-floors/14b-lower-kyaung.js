  /* ---------- the second Shan monastery, on the stupa hill's lower terrace below the festival ground, after the owner's photograph
     of a northern Shan kyaung: a long teak hall raised on rows of posts over an open ground floor, dark plank walls with
     square windows whose cream shutters stand open (red curtains in some), roofs of rusty corrugated iron edged with a
     scalloped white valance. Over the shrine end a three-tier roof: two hipped roofs, each on a clerestory band of red panels
     framed in yellow, and a steep red-and-gold gable on top; over the middle a two-tier hipped roof with a little gable crown;
     and at the end nearest the hill stair a lower wing: an open porch at the top of a wooden stair, and behind it a small tower of
     stacked gables. The photograph has the wing on the left; here it is on the right, toward the hill stair it is reached from.
     The doors from the porch lead to its hall (place `kyaungLow`), a hall for gatherings and sermons, with no image ---------- */
  function lowerKyaung(H) {
    const list = picks.pagoda, s = lowerKyaungSpot(), { teak, teakDark, roofM, white, frameW, pane, hip } = shanCarpentry();
    const name = SHAN_NAMES.kyaungLow;   // its Shan name, from the owner, lettered on the board over the middle of its front
    const B = new THREE.Group(); B.position.set(s.x, s.y, s.z); B.rotation.y = Math.PI; H.add(B);   // its front (local +z) faces down the hill, like the stair
    const L = s.L, D = s.D, hd = D / 2, FH = 2.6, WH = 3.0, yW = FH + WH, XA = 7;   // floor and wall heights; the hall runs x -L/2…XA, the wing XA…L/2
    const SX = 9.5, SWd = 2.4, n = 12, tread = .36, rise = FH / n, run = n * tread;   // the wing's stair: its centre, width and steps
    // the materials of this monastery: red panels framed in yellow for the clerestories and gables, cream shutters, the valance
    const panelT = canvasTex(128, (c, sz) => { c.fillStyle = "#d4aa40"; c.fillRect(0, 0, sz, sz); c.fillStyle = "#6a1712"; c.fillRect(12, 20, sz - 24, sz - 40); c.strokeStyle = "#e6c25a"; c.lineWidth = 4; c.strokeRect(24, 32, sz - 48, sz - 64); });
    panelT.wrapS = panelT.wrapT = THREE.RepeatWrapping;
    const gableT = canvasTex(256, (c, sz) => {
      c.fillStyle = "#6a1712"; c.fillRect(0, 0, sz, sz); c.strokeStyle = "#e2b84c"; c.lineWidth = 7;
      [[.12, .1], [.3, .26]].forEach(([m, b]) => { c.beginPath(); c.moveTo(sz * m, sz * (1 - b)); c.lineTo(sz * (1 - m), sz * (1 - b)); c.lineTo(sz / 2, sz * m * 1.6); c.closePath(); c.stroke(); });
      c.fillStyle = "#e2b84c"; c.fillRect(sz * .38, sz * .62, sz * .24, sz * .13); c.fillStyle = "#6a1712"; c.fillRect(sz * .405, sz * .64, sz * .19, sz * .09);
    });
    const valT = canvasTex(64, (c, sz) => { c.fillStyle = "#f2ead6"; c.fillRect(0, 0, sz, sz * .42); [0, 1].forEach(k => { c.beginPath(); c.arc(k * sz / 2 + sz / 4, sz * .42, sz / 4, 0, Math.PI); c.fill(); }); });
    valT.wrapS = THREE.RepeatWrapping;
    const valM = std({ map: valT, alphaTest: .5, side: THREE.DoubleSide, roughness: .7 }), shutterM = std({ color: 0xe8cf8a, roughness: .6 }), curtainM = std({ color: 0xa8141a, roughness: .8 });
    const band = (w, h, d, x, y, z) => {   // a clerestory band: a box faced with red panels, as many as fit along each side
      const mk = len => { const t = panelT.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(len / 1.4)), 1); return std({ map: t, roughness: .6 }); };
      const mw = mk(w), md = mk(d); return mesh(new THREE.BoxGeometry(w, h, d), [md, md, teakDark, teakDark, mw, mw], x, y, z, B);
    };
    const valance = ([x0, x1, z0, z1], y) => {   // the scalloped white valance hanging under a roof's eaves, all round
      [[x1 - x0, (x0 + x1) / 2, z1, 0], [x1 - x0, (x0 + x1) / 2, z0, 0], [z1 - z0, x0, (z0 + z1) / 2, Math.PI / 2], [z1 - z0, x1, (z0 + z1) / 2, Math.PI / 2]].forEach(([len, x, z, ry]) => {
        const g = new THREE.PlaneGeometry(len, .4), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * len / .5);
        flat(mesh(g, valM, x, y - .2, z, B)).rotation.y = ry;
      });
    };
    const roof = (o, t, y0, y1) => { hip(B, o, t, y0, y1); valance(o, y0); };
    // a steep gable with its ridge along z: corrugated slopes, red-and-gold gable ends, gold edges and finials
    function redGable(cx, y, cz, w, d, h) {
      const hw = w / 2, a = Math.atan2(h, hw), Ls = Math.hypot(hw, h) + .4;
      [-1, 1].forEach(sd => { const sl = mesh(new THREE.BoxGeometry(Ls, .08, d + .5), roofM, cx + sd * hw / 2, y + h / 2, cz, B); sl.rotation.z = -sd * a; });
      mesh(new THREE.BoxGeometry(.2, .2, d + .7), roofM, cx, y + h + .04, cz, B);
      const tri = new THREE.Shape(); tri.moveTo(-hw, 0); tri.lineTo(hw, 0); tri.lineTo(0, h); tri.closePath();
      const t = gableT.clone(); t.needsUpdate = true; t.repeat.set(1 / w, 1 / h); t.offset.set(.5, 0);
      const gm = std({ map: t, roughness: .6 });
      [-1, 1].forEach(e => {
        const z = cz + e * d / 2;
        mesh(new THREE.ExtrudeGeometry(tri, { depth: .1, bevelEnabled: false }), [gm, teakDark], cx, y, z - (e > 0 ? .1 : 0), B);
        [-1, 1].forEach(sd => { const tr = mesh(new THREE.BoxGeometry(Math.hypot(hw, h) + .1, .1, .12), M.gold, cx + sd * hw / 2, y + h / 2 + .05, z + e * .03, B); tr.rotation.z = -sd * a; });
        mesh(new THREE.ConeGeometry(.1, .8, 6), M.gold, cx, y + h + .45, z, B);
      });
    }
    // the posts: rows of teak posts on whitewashed footings, sunk a little where the slope behind runs under the hall
    const postG = new THREE.CylinderGeometry(.15, .17, FH + .6, 8), footG = new THREE.BoxGeometry(.45, .22, .45);
    for (let i = 0; i <= 10; i++) for (let j = 0; j <= 3; j++) { const x = -L / 2 + .35 + i * (L - .7) / 10, z = -hd + .35 + j * (D - .7) / 3; part(postG, teakDark, x, (FH - .6) / 2, z, B); part(footG, white, x, .11, z, B); }
    mesh(new THREE.BoxGeometry(L + .2, .3, D + .2), teakDark, 0, FH - .15, 0, B);   // the floor, under the hall, the wing's room and the porch
    // the walls: the long hall, and the wing's room behind the porch
    mesh(new THREE.BoxGeometry(XA + L / 2, WH, D), teak, (XA - L / 2) / 2, FH + WH / 2, 0, B);
    mesh(new THREE.BoxGeometry(L / 2 - XA, WH, hd), teak, (XA + L / 2) / 2, FH + WH / 2, -hd / 2, B);
    // square windows: a lamplit pane in a cream frame, two shutters standing open, a red curtain drawn across some
    const frameG = new THREE.BoxGeometry(1.2, 1.2, .08), paneG = new THREE.PlaneGeometry(1.0, 1.0), leafG = new THREE.BoxGeometry(.5, 1.0, .04), curtG = new THREE.PlaneGeometry(.48, .96);
    let wn = 0;
    const win = (x, z, ry) => {
      const o = new THREE.Group(); o.position.set(x, FH + 1.55, z); o.rotation.y = ry; B.add(o);
      part(frameG, frameW, 0, 0, .05, o); part(paneG, pane, 0, 0, .1, o);
      const a = .9; [-1, 1].forEach(sd => { part(leafG, shutterM, sd * (.6 + .25 * Math.cos(a)), 0, .1 + .25 * Math.sin(a), o).rotation.y = -sd * a; });
      if (wn++ % 3 === 1) part(curtG, curtainM, -.24, 0, .105, o);
    };
    for (let i = 0; i < 8; i++) { const x = -L / 2 + 1 + i * 2.35; win(x, hd, 0); win(x, -hd, Math.PI); }
    [-2.2, 0, 2.2].forEach(z => win(-L / 2, z, -Math.PI / 2));
    win(10.6, 0, 0); win(L / 2, -hd / 2, Math.PI / 2); [8.6, 10.8].forEach(x => win(x, -hd, Math.PI));
    // the doors into the hall, in its end wall at the back of the porch: two teak leaves in a gilded frame
    const DZ = hd / 2;
    const door = mesh(new THREE.BoxGeometry(.08, 2.3, 1.4), teakDark, XA + .05, FH + 1.15, DZ, B);
    mesh(new THREE.BoxGeometry(.02, 2.2, .02), M.gold, XA + .1, FH + 1.15, DZ, B);
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.12, 2.45, .1), M.gold, XA + .06, FH + 1.22, DZ + sd * .75, B));
    mesh(new THREE.BoxGeometry(.12, .1, 1.6), M.gold, XA + .06, FH + 2.45, DZ, B);
    const ped = mesh(new THREE.ConeGeometry(.7, .45, 4), M.gold, XA + .06, FH + 2.72, DZ, B);   // low enough to clear the porch roof ped.rotation.set(0, Math.PI / 4, 0); ped.scale.x = .12;
    // the porch railing: a balustrade along the wing's end and its front, open where the stair arrives
    const balG = new THREE.BoxGeometry(.05, .75, .05);
    const rail = (x0, z0, x1, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0), k = Math.round(len / .3);
      const r = mesh(new THREE.BoxGeometry(len, .07, .09), teakDark, (x0 + x1) / 2, FH + .9, (z0 + z1) / 2, B); r.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
      for (let i = 0; i <= k; i++) part(balG, teakDark, x0 + (x1 - x0) * i / k, FH + .45, z0 + (z1 - z0) * i / k, B);
    };
    rail(L / 2 - .05, 0, L / 2 - .05, hd - .05); rail(XA, hd - .05, SX - SWd / 2, hd - .05); rail(SX + SWd / 2, hd - .05, L / 2 - .05, hd - .05);
    // the wooden stair down from the porch: treads on two stringers, a handrail each side
    const treadG = new THREE.BoxGeometry(SWd, .06, tread + .04), slope = Math.atan2(FH, run), sLen = Math.hypot(FH, run);
    for (let i = 0; i < n - 1; i++) part(treadG, teakDark, SX, FH - (i + 1) * rise - .03, hd + (i + .5) * tread, B);
    [-1, 1].forEach(sd => {
      const x = SX + sd * (SWd / 2 + .05);
      mesh(new THREE.BoxGeometry(.08, .3, sLen), teakDark, x, FH / 2 - .1, hd + run / 2, B).rotation.x = slope;
      mesh(new THREE.BoxGeometry(.07, .07, sLen), teakDark, x, FH / 2 + .9, hd + run / 2, B).rotation.x = slope;
      mesh(new THREE.BoxGeometry(.12, 1.0, .12), teakDark, x, .5, hd + run, B);
    });
    // the roofs. Over the shrine end (x -12…-1): a hipped roof, a clerestory, a smaller hipped roof, a second clerestory, and the
    // steep gable with a smaller one riding on its ridge
    const TX = -6.5;
    roof([TX - 6.7, TX + 5.7, -hd - 1.2, hd + 1.2], [TX - 2.8, TX + 2.8, -2.5, 2.5], yW, yW + 2.3);
    band(5.6, 1.2, 5.0, TX, yW + 2.9, 0);
    roof([TX - 3.6, TX + 3.6, -3.1, 3.1], [TX - 1.5, TX + 1.5, -1.4, 1.4], yW + 3.5, yW + 4.7);
    band(3.0, .9, 2.8, TX, yW + 5.15, 0);
    redGable(TX, yW + 5.6, 0, 4.2, 4.0, 3.0);
    redGable(TX, yW + 7.2, 0, 2.6, 2.6, 2.0);
    mesh(new THREE.ConeGeometry(.2, 1.6, 8), M.gold, TX, yW + 10.0, 0, B);
    // over the middle of the hall (x -1…7): a hipped roof on a clerestory, a smaller one, and a little gable crown
    const MX = 3;
    roof([MX - 4.2, MX + 4.8, -hd - 1.2, hd + 1.2], [MX - 2, MX + 2, -2, 2], yW, yW + 1.9);
    const mid = band(4.0, 1.0, 4.0, MX, yW + 2.4, 0);
    roof([MX - 2.6, MX + 2.6, -2.6, 2.6], [MX - .8, MX + .8, -.5, .5], yW + 2.9, yW + 4.0);
    redGable(MX, yW + 3.9, 0, 1.6, 1.2, .9);
    // the wing: a low hipped roof over the porch, and over its room a hipped roof under a little tower of three stacked gables
    roof([XA - .2, L / 2 + .8, -.4, hd + 1.0], [XA + 1.4, L / 2 - .8, 2.0, 2.0], FH + 2.9, FH + 3.8);
    roof([XA - .4, L / 2 + .8, -hd - .8, .3], [XA + 1.4, L / 2 - .8, -2.6, -1.4], yW, yW + 1.0);
    const WX = (XA + L / 2) / 2;
    redGable(WX, yW + 1.1, -2, 4.4, 2.8, 1.7);
    redGable(WX, yW + 2.2, -2, 3.2, 2.2, 1.3);
    redGable(WX, yW + 3.1, -2, 2.2, 1.4, 1.0);
    // its name board on the middle clerestory's front, once there is a name
    let board = null;
    if (name) { const BW = 3.2, BH = BW * 300 / 1024; board = mesh(new THREE.BoxGeometry(BW, BH, .06), [teakDark, teakDark, teakDark, teakDark, shanBoardFace(name), teakDark], MX, yW + 2.4, 2.05, B); }
    bakeParts(B);
    // walkable: up the stair onto the porch; the hall, the wing's room and the posts under them block
    sRect(B, SX - SWd / 2 + .1, SX + SWd / 2 - .1, hd - .15, hd + run, (lx, lz) => FH * (1 - Math.max(0, lz - hd) / run));
    sRect(B, XA, L / 2, 0, hd, (lx, lz) => lx > L / 2 - .4 || lx < XA + .45 || lz < .4 || lz > hd - .35 && Math.abs(lx - SX) > SWd / 2 - .1 ? null : FH);
    sRect(B, -L / 2, L / 2, -hd, hd);
    // tapping it
    const tip = name ? `${name} · a Shan teak monastery` : "A Shan teak monastery below the festival ground";
    const toast = `${name ? name + ": a" : "A"} Shan teak monastery on the lower terrace of the stupa hill, below the festival ground. Climb the wooden stair to the porch; the doors there open into its hall, where the monks give sermons and the village gathers.`;
    B.traverse(o => { if (o.isMesh && o !== door) clickable(list, o, { tip, toast }); });
    clickable(list, door, { floor: "kyaungLow", tip: `Enter the hall${name ? " of " + name : ""}` });
    if (board) board.userData.toast = toast;
    // where you come out: on the porch before the doors, facing out over the stair; and keep the outside camera above it
    B.updateMatrixWorld(true);
    const ex = B.localToWorld(V(XA + 1.4, 0, DZ)), look = B.localToWorld(V(SX, 0, hd + run + 8));
    MONASTERIES.push({ key: "kyaungLow", G: B, W: L, D, run, foot: B.localToWorld(V(SX, 0, hd + run + 1.5)), door: B.localToWorld(V(XA, 0, DZ)), exit: [[ex.x, ex.z], [look.x, look.z]] });
    const xs = [], zs = [];
    [[-L / 2 - 1.5, -hd - 1.5], [L / 2 + 1.5, -hd - 1.5], [-L / 2 - 1.5, hd + run + .5], [L / 2 + 1.5, hd + run + .5]].forEach(([lx, lz]) => { const w = B.localToWorld(V(lx, 0, lz)); xs.push(w.x); zs.push(w.z); });
    TALL.push({ x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), h: s.y + 17 });
  }
