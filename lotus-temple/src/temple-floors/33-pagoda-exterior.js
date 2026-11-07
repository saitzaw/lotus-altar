  /* ---------- the pagoda from outside ---------- */
  function buildPagoda() {
    const g = new THREE.Group(); g.name = "pagoda"; world.add(g);
    updaters.pagoda = [];
    const list = picks.pagoda = [];
    const skyTex = canvasTex(256, (c, s) => {
      const l = c.createLinearGradient(0, 0, 0, s);
      l.addColorStop(0, "#000000"); l.addColorStop(.38, "#000000"); l.addColorStop(.48, "#000000"); l.addColorStop(.52, "#2b1a14"); l.addColorStop(1, "#0d0806");
      c.fillStyle = l; c.fillRect(0, 0, s, s);
    });
    g.add(new THREE.Mesh(new THREE.SphereGeometry(220, 48, 24), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })));
    const starPos = [], rs = rng(5);
    for (let i = 0; i < 700; i++) { const a = rs() * TAU, e = .15 + rs() * 1.3; starPos.push(Math.cos(a) * Math.cos(e) * 200, Math.sin(e) * 200, Math.sin(a) * Math.cos(e) * 200); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.2, color: 0xfff4e0, map: glowTex, transparent: true, depthWrite: false, fog: false })); g.add(stars);
    daySky(g, 220, stars, .3);   // from outside the camera looks down on the temple, so the sky it sees is low
    const groundMat = std({ color: 0x1c1712, roughness: 1 });
    const ground = flat(mesh(new THREE.CircleGeometry(262, 72), groundMat, 0, 0, 0, g)); ground.rotation.x = -Math.PI / 2;
    onDaylight(d => groundMat.color.copy(lerpC(0x1c1712, 0x5a5440, d)));
    // the base: a red timber deck on posts, ringed by a red balustrade, with a broad stone stair up the front
    const DECK = 1.3, RD = 7.6, APD = RD * Math.cos(R8), STAIR = 3.4;
    const wallCream = std({ color: 0xece4d4, roughness: .7 }), deckMat = std({ color: 0x5a1f14, roughness: .7 });
    oct(mesh(new THREE.CylinderGeometry(RD + .5, RD + .7, .16, 8), M.stone, 0, .08, 0, g));
    oct(mesh(new THREE.CylinderGeometry(RD, RD, .22, 8), deckMat, 0, DECK - .11, 0, g));
    oct(mesh(new THREE.CylinderGeometry(RD + .03, RD + .03, .24, 8, 1, true), pillarRed, 0, DECK - .34, 0, g));
    [[RD - .2, 16], [RD * .62, 8]].forEach(([rr, n]) => {
      for (let k = 0; k < n; k++) {
        const a = k / n * TAU + (n === 16 ? 0 : R8), rad = n === 16 ? (k % 2 ? rr : rr * Math.cos(R8)) : rr;   // the outer ring on corners and mid-faces
        const ang = n === 16 ? (k % 2 ? a : a) : a, x = Math.sin(ang) * rad, z = Math.cos(ang) * rad;
        if (Math.abs(x) < STAIR / 2 + .2 && Math.abs(z) > RD * .5) continue;   // keep the front and back stairs clear
        mesh(new THREE.CylinderGeometry(.15, .17, DECK - .3, 10), pillarRed, x, .16 + (DECK - .46) / 2, z, g);
      }
    });
    const deckRail = new THREE.Group(); deckRail.position.y = DECK; g.add(deckRail); balustrade(deckRail, RD - .08, [0, 4], redRail, STAIR + .3);   // openings for the front stair and the river-side stair
    const STEPS = 7, rise = DECK / STEPS, run = .36;
    WALKABLE.pagoda = { DECK, APD, STAIR, stairRun: STEPS * run, wall: 4.6 * Math.cos(R8) };
    // the same stair at the front (toward the gate and the pond) and at the back (toward the river gate)
    [1, -1].forEach(dir => {
      for (let i = 0; i < STEPS; i++) mesh(new THREE.BoxGeometry(STAIR, DECK - i * rise, run), M.stone, 0, (DECK - i * rise) / 2, dir * (APD + run / 2 + i * run), g);
      [-1, 1].forEach(sx => {   // red stringers either side of the stair
        const len = Math.hypot(STEPS * run, DECK), sg = mesh(new THREE.BoxGeometry(.16, .24, len), pillarRed, sx * (STAIR / 2 + .08), DECK / 2 + .1, dir * (APD + STEPS * run / 2), g);
        sg.rotation.x = dir * Math.atan2(DECK, STEPS * run);
      });
    });
    // each storey: cream walls between red corner columns, tall red lattice windows, gold brackets under a curved slate eave,
    // and from the second storey up a walkway with a red balustrade
    let y = DECK;
    const storeys = [], eaveCorners = [];
    for (let i = 0; i < FLOORS.length; i++) {
      const r = 4.6 - i * .42, h = i ? 2.4 : 4.6, f = i + 1, info = FLOORS[i];
      const st = new THREE.Group(); st.position.y = y; g.add(st);
      const wall = oct(mesh(new THREE.CylinderGeometry(r, r, h, 8), wallCream, 0, h / 2, 0, st));
      oct(mesh(new THREE.CylinderGeometry(r + .03, r + .03, .3, 8), pillarRed, 0, h - .15, 0, st));
      oct(mesh(new THREE.CylinderGeometry(r + .03, r + .03, .2, 8), pillarRed, 0, .1, 0, st));
      for (let k = 0; k < 8; k++) { const c = k / 8 * TAU + R8; mesh(new THREE.CylinderGeometry(.13, .13, h, 10), pillarRed, Math.sin(c) * (r - .02), h / 2, Math.cos(c) * (r - .02), st); }
      const winMatS = std({ color: 0x3a1608, emissive: info.statue ? 0xffb050 : 0xff8a3a, emissiveIntensity: info.statue ? 1 : .7 });
      const apo = r * Math.cos(R8), bars = [];
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * TAU, ww = r * .4, wh = h * (i ? .58 : .55), wy = i ? h * .47 : h * .42;
        if (i === 0 && k === 0) {   // the main door faces the stair, under the pagoda's name board
          doorway(st, 0, 0, apo + .02, 0, 2.0, 2.5, "觀音殿", { floor: 1, tip: "Enter the main hall · 1F" }, list);
          const tex = writing(768, 192, (c, cw, ch) => {
            c.fillStyle = "#f4ecd8"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#c9a04a"; c.lineWidth = 10; c.strokeRect(6, 6, cw - 12, ch - 12);
            c.fillStyle = "#3a1a10"; c.font = HAN_FONT(120); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("蓮 華 塔", cw / 2, ch / 2 + 8);
          });
          flat(mesh(new THREE.PlaneGeometry(2.9, .72), new THREE.MeshStandardMaterial({ map: tex, roughness: .7, emissive: 0x3a362c, emissiveMap: tex }), 0, h - .75, apo + .03, st));
          continue;
        }
        if (i === 0 && k === 4) {   // the back door, at the top of the river-side stair
          doorway(st, 0, 0, -(apo + .02), Math.PI, 2.0, 2.5, null, { floor: 1, tip: "Enter the main hall by the back door · 1F" }, list);
          continue;
        }
        const p = V(Math.sin(a) * (apo + .02), wy, Math.cos(a) * (apo + .02));
        bars.push({ p, ry: a, w: ww, h: wh });
        const w = mesh(new THREE.PlaneGeometry(ww, wh), winMatS, p.x, p.y, p.z, st);
        w.rotation.y = a; w.castShadow = false;
        clickable(list, w, { floor: f, tip: floorName(f) });
        const fr = mesh(new THREE.BoxGeometry(ww + .2, wh + .2, .05), pillarRed, Math.sin(a) * (apo + .005), wy, Math.cos(a) * (apo + .005), st); fr.rotation.y = a;
      }
      latticeScreens(st, bars);
      clickable(list, wall, { floor: f, tip: floorName(f) });
      // gold brackets under the eave; the eave's foot sits just below the wall top, its corners sweep up by `lift`
      brackets(st, h - .32, r + .04, 3, [M.trim, pillarRed, M.trim]);
      const rOut = r + 1.6, eh = .7, lift = .75, foot = h - .1;
      tiledEave(st, foot, r * .9, rOut, eh, lift);
      oct(mesh(new THREE.CylinderGeometry(r * .9, r * .9, .08, 8), pillarRed, 0, foot + eh, 0, st));
      if (i) {   // the walkway round this storey, resting on the eave below
        oct(mesh(new THREE.CylinderGeometry(r + .85, r + .85, .14, 8), deckMat, 0, .07, 0, st));
        oct(mesh(new THREE.CylinderGeometry(r + .87, r + .87, .1, 8, 1, true), pillarRed, 0, .05, 0, st));
        const bs = new THREE.Group(); bs.position.y = .14; st.add(bs); balustrade(bs, r + .78, [], redRail);
      }
      const s = { f, winMat: winMatS, base: 0 }, glow = winMatS.emissiveIntensity; storeys.push(s);
      onDaylight(d => s.base = glow * (1 - d) + .05);   // the floors' windows glow by lamplight at night, dark glass by day
      if (i === 0) for (let k = 0; k < 8; k++) { const c = k / 8 * TAU + R8; eaveCorners.push(V(Math.sin(c) * (rOut - .2), y + foot + lift - .1, Math.cos(c) * (rOut - .2))); }
      STOREY_Y[f] = y;   // the height of this storey's floor, for the view from its corridor
      y += h + .82;
    }
    // the Bell Tower on the left: an open eight-sided pavilion, the bronze bell hanging between red columns
    // under two tiers of tiled eaves, with painted beams, brackets and a low white balustrade
    function bellPavilion(o) {
      const b = new THREE.Group(); b.position.set(o.x, 0, o.z); g.add(b);
      const pl = PLACES[o.place], data = { tip: "The Bell Tower" }, ring = { ringBell: true, tip: "Ring the great bell" };
      // walkable: the two-step platform, open at the front; the bell, columns and balustrade block
      const COLS = []; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + R8; COLS.push([Math.sin(a) * 3.0, Math.cos(a) * 3.0]); }
      sRect(b, -4.1, 4.1, -4.1, 4.4, (lx, lz) => {
        const r = Math.hypot(lx, lz);
        if (r < 1.0) return null;                                                         // the bell and the striking log
        if (COLS.some(([cx, cz]) => Math.hypot(lx - cx, lz - cz) < .45)) return null;     // the columns
        if (r < 2.8) return .7;
        if (r < 3.2) return lz > 0 && Math.abs(lx) < 1.1 ? .7 : null;                      // the balustrade, open at the front
        if (r < 3.6) return .7;
        if (r < 4.0) return .35;
        if (Math.abs(lx) < .95 && lz < 4.4) return .175;                                   // the front step
        return 0;
      });
      const at = (a, r, y) => V(Math.sin(a) * r, y, Math.cos(a) * r);
      // stone platform and front steps
      oct(mesh(new THREE.CylinderGeometry(3.9, 4.0, .35, 8), M.stone, 0, .175, 0, b));
      oct(mesh(new THREE.CylinderGeometry(3.55, 3.6, .35, 8), M.stone, 0, .525, 0, b));
      mesh(new THREE.BoxGeometry(1.9, .35, .7), M.stone, 0, .175, 3.95, b);
      // open ground storey: eight columns, a balustrade open at the front, the painted ceiling
      const Y0 = .7, H1 = 3.0, T1 = Y0 + H1, RC = 3.0;
      for (let k = 0; k < 8; k++) {
        const p = at(k / 8 * TAU + R8, RC, 0);
        clickable(list, mesh(new THREE.CylinderGeometry(.13, .15, H1, 12), pillarRed, p.x, Y0 + H1 / 2, p.z, b), data);
        mesh(new THREE.CylinderGeometry(.22, .24, .12, 12), M.stone, p.x, Y0 + .06, p.z, b);
      }
      const rail = new THREE.Group(); rail.position.y = Y0; b.add(rail); balustrade(rail, RC - .02, [0], redRail);
      paintedBeam(b, T1 - .25, RC + .02);
      oct(mesh(new THREE.CylinderGeometry(RC, RC, .06, 8), paintGreen, 0, T1 - .5, 0, b));
      // the bell hangs from the ceiling with the striking log beside it
      const bell = lathe(BELL_PROFILE, M.bronze, 40); bell.position.set(0, T1 - .55, 0); bell.scale.setScalar(.85); b.add(bell);
      clickable(list, bell, ring);
      [-.5, -1.0, -1.5].forEach(yy => { const t = mesh(new THREE.TorusGeometry(yy < -1.2 ? .62 : .54, .018, 6, 56), M.bronze, 0, T1 - .55 + yy * .85, 0, b); t.rotation.x = Math.PI / 2; t.scale.setScalar(.85); });
      const logPivot = new THREE.Group(); logPivot.position.set(0, T1 - .5, 1.3); b.add(logPivot);   // the striking log swings from its ropes
      const logM = mesh(new THREE.CylinderGeometry(.1, .1, 1.0, 16), M.wood, 0, -1.0, 0, logPivot); logM.rotation.x = Math.PI / 2;
      [.95, 1.65].forEach(z => flat(mesh(new THREE.CylinderGeometry(.01, .01, 1.0, 4), M.feature, 0, -.5, z - 1.3, logPivot)));
      clickable(list, logM, ring);
      bellRingers.push(() => {
        tween(2.6, t => {
          logPivot.rotation.x = t < .35 ? .3 * Math.sin(Math.PI / 2 * t / .35) : t < .45 ? .3 - .36 * (t - .35) / .1 : -.06 * (1 - clamp((t - .45) / .55, 0, 1));
          const w = t > .42 ? Math.sin((t - .42) * 30) * .025 * (1 - t) : 0; bell.rotation.x = w; bell.rotation.z = w * .5;
        });
        setTimeout(() => [[98, .35, 7], [196 * 1.19, .14, 5], [98 * 2.76, .09, 3.5], [98 * 5.4, .04, 2]].forEach(([f, p, d]) => tone(f, null, p, d)), reduceMotion ? 0 : 1100);
      });
      const glow = new THREE.PointLight(0xffb070, 1.6, 7, 2); glow.position.set(0, T1 - .9, 1.4); b.add(glow);
      brackets(b, T1 - .2, RC + .05, 4);
      const E1 = T1 + .75;
      tiledEave(b, T1 - .05, 2.35, 4.1, .8, .45, data, list);
      // upper storey: a short lattice-windowed drum with the name board, under the second eave
      const T2 = E1 + 1.3, RU = 2.15, AU = RU * Math.cos(R8);
      oct(mesh(new THREE.CylinderGeometry(RU, RU, T2 - E1 + .2, 8), pillarRed, 0, (E1 - .2 + T2) / 2, 0, b));
      const wins = [];
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; wins.push({ p: at(a, AU + .02, E1 + .4), ry: a, w: 1.1, h: .55, cols: 6, rows: 2 }); }
      latticeWindows(b, wins, lampPane(0xff9a40, .8));
      paintedBeam(b, T2 - .25, RU + .02);
      const tex = writing(512, 160, (c, cw, ch) => {
        c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(96); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(pl.han, cw / 2, ch / 2 + 6);
      });
      mesh(new THREE.BoxGeometry(1.2, .44, .04), M.trim, 0, T2 - .3, AU + .55, b);   // hung forward of the brackets
      flat(mesh(new THREE.PlaneGeometry(1.1, .36), new THREE.MeshStandardMaterial({ map: tex, roughness: .6, emissive: 0x222222, emissiveMap: tex }), 0, T2 - .3, AU + .58, b));
      brackets(b, T2 - .2, RU + .05, 3);
      const E2 = T2 + .7;
      tiledEave(b, T2 - .05, 1.2, 3.5, .75, .4, data, list);
      // pointed roof and a gilt finial
      tiledEave(b, E2 - .1, .06, 1.6, 1.4, .25, data, list, false);
      mesh(new THREE.CylinderGeometry(.08, .14, .3, 12), M.gold, 0, E2 + 1.4, 0, b);
      mesh(new THREE.SphereGeometry(.24, 20, 14), M.gold, 0, E2 + 1.7, 0, b);
      // a stone path to the main approach
      flat(mesh(new THREE.BoxGeometry(9.6, .06, 2.4), M.stone, 4.8, .03, 4.6, b));   // to the foot of the pagoda's deck
    }
