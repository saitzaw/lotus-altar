  /* ---------- shared pieces ---------- */
  const winMat = std({ color: 0x0d1530, emissive: 0x34528f, emissiveIntensity: .55, roughness: .6 });   // seen from inside: the night sky, or daylight
  onDaylight(d => { winMat.emissive.copy(lerpC(0x34528f, 0xdce8f2, d)); winMat.emissiveIntensity = .55 + .4 * d; });
  const lanternGeo = new THREE.SphereGeometry(.26, 24, 16), capGeo = new THREE.CylinderGeometry(.12, .12, .06, 16);
  const ribGeo = new THREE.TorusGeometry(.262, .006, 6, 40), tasselGeo = new THREE.CylinderGeometry(.012, .03, .22, 8);
  const lanternMat = std({ color: 0xb0180c, emissive: 0xd0200a, emissiveIntensity: .55, roughness: .55 });
  const lanternOff = std({ color: 0x5a0c06, roughness: .55 });   // a street lantern blinking out as the ghost passes
  const lanternGlows = [];   // the halls' lanterns, unlit by day
  const lanternGlow = (color, scale, opacity) => { const gl = glowSprite(color, scale, opacity * (1 - daylight)); gl.userData.lit = opacity; lanternGlows.push(gl); return gl; };
  onDaylight(d => { lanternMat.emissiveIntensity = .55 * (1 - d) + .05; lanternGlows.forEach(gl => gl.material.opacity = gl.userData.lit * (1 - d)); });
  function lantern(parent, x, y, z, ceil = 6.9, scale = 1) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(scale); parent.add(g);
    flat(mesh(new THREE.CylinderGeometry(.005, .005, (ceil - y) / scale, 4), M.feature, 0, (ceil - y) / scale / 2, 0, g));
    flat(mesh(lanternGeo, lanternMat, 0, 0, 0, g)).scale.y = 1.2;
    [0, Math.PI / 3, -Math.PI / 3].forEach(r => { const rb = flat(mesh(ribGeo, M.trim, 0, 0, 0, g)); rb.rotation.y = r; rb.scale.y = 1.2; });
    flat(mesh(capGeo, M.trim, 0, .32, 0, g)); flat(mesh(capGeo, M.trim, 0, -.32, 0, g));
    flat(mesh(tasselGeo, M.stickRed, 0, -.46, 0, g));
    g.add(lanternGlow(0xff7a3c, 1.4, .45));
    return g;
  }
  // strings of small red lanterns hanging in a curve between two points
  function lanternStrings(parent, segs, scale = 1) {
    const total = segs.reduce((s, x) => s + x.count, 0);
    const bodies = new THREE.InstancedMesh(lanternGeo, lanternMat, total), caps = new THREE.InstancedMesh(capGeo, M.trim, total * 2);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), body = V(scale, scale * 1.2, scale), cap = V(scale, scale, scale);
    let k = 0;
    segs.forEach(({ a, b, count, sag }) => {
      const at = t => a.clone().lerp(b, t).add(V(0, -sag * 4 * t * (1 - t), 0)), pts = [];
      for (let i = 0; i <= 24; i++) pts.push(at(i / 24));
      flat(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .012 * Math.max(1, scale), 4), M.stickRed, 0, 0, 0, parent));
      for (let i = 0; i < count; i++) {
        const p = at((i + .5) / count).add(V(0, -.36 * scale, 0));
        m4.compose(p, q, body); bodies.setMatrixAt(k, m4);
        m4.compose(p.clone().add(V(0, .32 * scale, 0)), q, cap); caps.setMatrixAt(k * 2, m4);
        m4.compose(p.clone().add(V(0, -.32 * scale, 0)), q, cap); caps.setMatrixAt(k * 2 + 1, m4);
        const gl = lanternGlow(0xff6a2a, 1.1 * scale, .42); gl.position.copy(p); parent.add(gl);
        k++;
      }
    });
    parent.add(bodies, caps);
  }
  // extra lanterns for a hall: a second staggered row of large ones and low festoons along the beams
  function moreLanterns(g, n) {
    const sway = [];
    [[-1.5, [-4.6, -2.6, 2.6, 4.6]], [.7, [-4.8, -2.4, 0, 2.4, 4.8]], [2.9, [-4.8, -2.4, 0, 2.4, 4.8]]]
      .forEach(([z, xs], row) => xs.forEach((x, i) => sway.push(lantern(g, x, 4.35 + ((i + row) % 2) * .35, z, 6.9, .85))));
    lanternStrings(g, [
      { a: V(-6, 6.5, -2.6), b: V(6, 6.5, -2.6), count: 15, sag: 1.7 },
      { a: V(-6, 6.5, -.4), b: V(6, 6.5, -.4), count: 15, sag: 2.2 },
      { a: V(-6, 6.5, 1.8), b: V(6, 6.5, 1.8), count: 15, sag: 2.4 },
      { a: V(-6, 6.5, 4), b: V(6, 6.5, 4), count: 15, sag: 2.4 }
    ], .6);
    updaters[n] = updaters[n] || [];
    updaters[n].push((dt, t, motion) => sway.forEach((l, i) => l.rotation.z = Math.sin(t * .6 + i * 1.7) * .035 * motion));
  }
  // a red lacquer spiral staircase in the back-left corner, rising to the floor above
  // the spiral stairs stand in the back-left corner, off the statue platform, inside a small stair room with a door;
  // the same spiral runs through every floor: it leaves through a hole in the ceiling and arrives through a hole in the floor
  const STAIRS = { x: -6.2, z: -4.45 }, STAIR_ROOM = { x0: -7.5, x1: -3.9, z0: -5.5, z1: -2.4 };
  const inStairCorner = p => p.x < -3.6 && p.z < -2.2;
  const climbSign = (text, sub) => writing(320, 128, (c, cw, ch) => {
    c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.strokeRect(5, 5, cw - 10, ch - 10);
    c.fillStyle = "#e8c25a"; c.font = HAN_FONT(54); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, cw / 2, 50);
    c.font = '600 30px "Figtree", sans-serif'; c.fillText(sub, cw / 2, 100);
  });
  // floor n: the flight up to the next floor (not on the top floor), the last steps of the flight from the floor below (not on 1F),
  // and a sign and a tap target for each direction, live only while standing in the stair room
  function spiralStairs(g, n, list) {
    const st = new THREE.Group(); st.position.set(STAIRS.x, 0, STAIRS.z); g.add(st);
    const H = 6.9, N = 32, turns = 1.3, R = .9, rise = H / N, da = turns * TAU / N, helix = [];
    const up = n < FLOORS.length, downTo = n > 1;
    const lightWood = std({ color: 0x8a5a30, roughness: .55 });
    const step = (i, y) => {
      const a = i * da, c = Math.cos(a), s = -Math.sin(a);
      const m = mesh(new THREE.BoxGeometry(R - .06, .07, .34), lightWood, c * (R / 2 + .02), y, s * (R / 2 + .02), st); m.rotation.y = a;
      const edge = mesh(new THREE.BoxGeometry(.03, .08, .34), M.trim, c * (R - .02), y, s * (R - .02), st); edge.rotation.y = a;
      if (i % 2 === 0) mesh(new THREE.CylinderGeometry(.014, .014, .9, 6), M.lacquer, c * (R - .05), y + .45, s * (R - .05), st);
    };
    if (up) {
      mesh(new THREE.CylinderGeometry(.09, .11, H, 16), M.lacquer, 0, H / 2, 0, st);
      for (let y = .6; y < H; y += 1.2) mesh(new THREE.CylinderGeometry(.13, .13, .05, 16), M.trim, 0, y, 0, st);
      for (let i = 0; i < N; i++) step(i, (i + 1) * rise);
      for (let i = 0; i <= 80; i++) { const a = i / 80 * turns * TAU, y = rise + i / 80 * (H - rise) + .9; helix.push(V(Math.cos(a) * (R - .05), Math.min(y, H - .05), -Math.sin(a) * (R - .05))); }
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helix), 160, .025, 6), M.lacquer, 0, 0, 0, st);
    } else mesh(new THREE.CylinderGeometry(.13, .13, .08, 16), M.trim, 0, .04, 0, st);
    if (downTo) {   // the flight from below, seen through the hole: it arrives at this floor going round the other way
      const nSteps = up ? 9 : 13, depth = nSteps * rise + .6;   // the top floor shows more of the flight, since nothing rises above it
      mesh(new THREE.CylinderGeometry(1.0, 1.0, depth, 40, 1, true), std({ color: 0x2a140a, roughness: .9, side: THREE.DoubleSide }), 0, -depth / 2, 0, st);
      const lip = mesh(new THREE.TorusGeometry(1.02, .05, 8, 48), M.trim, 0, .03, 0, st); lip.rotation.x = Math.PI / 2;
      for (let i = 1; i <= nSteps; i++) step(-i, -i * rise + .02);
      mesh(new THREE.CylinderGeometry(.09, .11, depth, 16), M.lacquer, 0, -depth / 2, 0, st);
      if (!up) {
        // a handrail following the outer edge of the flight; near the top it turns up and out to the guard rail's corner post
        // (angle -GAP), so the top step is clear to step off onto the floor through the opening
        const GAP = .6, RR = 1.1, kEnd = -GAP / da, rail = [];
        for (let i = 0; i <= 60; i++) { const k = -nSteps + i / 60 * (nSteps + kEnd), a = k * da; rail.push(V(Math.cos(a) * (R - .05), k * rise + .92, -Math.sin(a) * (R - .05))); }
        rail.push(V(Math.cos(GAP) * 1.0, .75, Math.sin(GAP) * 1.0), V(Math.cos(GAP) * RR, .95, Math.sin(GAP) * RR));
        mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rail), 120, .03, 8), M.lacquer, 0, 0, 0, st);
        // a guard rail round the opening, open only where the stairs arrive (around angle 0)
        // the back wall of the stair room is closer than the rail's radius, so the rail ends on a post either side, clear of the wall
        const CLEAR = STAIRS.z - STAIR_ROOM.z0 - .14, WALL = Math.asin(clamp(CLEAR / RR, -1, 1));
        for (let i = 0; i < 24; i++) {
          const a = GAP + i / 23 * (TAU - 2 * GAP);
          if (Math.sin(a) * RR > CLEAR - .05) continue;   // too near the wall
          mesh(new THREE.CylinderGeometry(.025, .025, .95, 6), M.lacquer, Math.cos(a) * RR, .48, -Math.sin(a) * RR, st);
        }
        [.95, .5].forEach(y => [[GAP, Math.PI + WALL], [TAU - WALL, TAU - GAP]].forEach(([a0, a1]) => {   // torus angles run the other way round
          const r2 = mesh(new THREE.TorusGeometry(RR, y > .7 ? .04 : .025, 6, 32, a1 - a0), y > .7 ? M.lacquer : M.trim, 0, y, 0, st);
          r2.rotation.x = Math.PI / 2; r2.rotation.z = a0;
        }));
        [WALL, Math.PI - WALL].forEach(a => { mesh(new THREE.CylinderGeometry(.05, .06, 1.0, 10), M.lacquer, Math.cos(a) * RR, .5, -Math.sin(a) * RR, st); mesh(new THREE.SphereGeometry(.07, 12, 8), M.trim, Math.cos(a) * RR, 1.02, -Math.sin(a) * RR, st); });
        [GAP, -GAP].forEach(a => { mesh(new THREE.CylinderGeometry(.05, .06, 1.0, 10), M.lacquer, Math.cos(a) * RR, .5, -Math.sin(a) * RR, st); mesh(new THREE.SphereGeometry(.07, 12, 8), M.trim, Math.cos(a) * RR, 1.02, -Math.sin(a) * RR, st); });
      }
      const below = new THREE.PointLight(0xffb070, 1.0, 4, 2); below.position.set(0, -1.2, 0); st.add(below);
    } else mesh(new THREE.CylinderGeometry(.95, 1.0, .08, 32), M.stone, 0, .04, 0, st);
    // signs on the back wall of the stair room, and tap targets on the stairs themselves
    const target = (to, geo, y, signY, label, sub) => {
      const hit = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = y; st.add(hit);
      const tip = `${to > n ? "Climb up" : "Go down"} to ${floorName(to)}`;
      Object.assign(hit.userData, { climb: to, inStairs: true, tip });
      const sign = flat(mesh(new THREE.PlaneGeometry(.95, .38), new THREE.MeshStandardMaterial({ map: climbSign(label, sub), roughness: .6, emissive: 0x444444, emissiveMap: climbSign(label, sub) }), 1.4, signY, -1.0, st));
      Object.assign(sign.userData, { climb: to, inStairs: true, tip });
      if (list) list.push(hit, sign);
    };
    if (up) target(n + 1, new THREE.CylinderGeometry(R + .05, R + .05, H - 1.2, 16), (H + 1.2) / 2, 2.5, "↑ 上樓", `Up to ${n + 1}F`);
    if (downTo) target(n - 1, new THREE.CylinderGeometry(R + .05, R + .05, 1.2, 16), .3, up ? 1.55 : 2.0, "↓ 下樓", `Down to ${n - 1}F`);
  }
  // the stair room: plain walls up to the ceiling, red corner posts and a panelled wooden door that leads up
  const plaster = std({ color: 0x4a1a10, roughness: .85 }), panelWood = std({ color: 0x6a2a14, roughness: .55 });
  const doors = [], openers = {};
  function stairRoom(g, n, list) {
    const { x0, x1, z0, z1 } = STAIR_ROOM, H = 6.9, cx = (x0 + x1) / 2, w = x1 - x0, d = z1 - z0, DW = 1.05, DH = 2.35;
    mesh(new THREE.BoxGeometry(.12, H, d), plaster, x1, H / 2, (z0 + z1) / 2, g);                      // side wall
    [[x0, cx - DW / 2 - .1], [cx + DW / 2 + .1, x1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(b - a, H, .12), plaster, (a + b) / 2, H / 2, z1, g));
    mesh(new THREE.BoxGeometry(DW + .2, H - DH, .12), plaster, cx, DH + (H - DH) / 2, z1, g);           // over the door
    [[x1, z1], [x0 + .08, z1]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.2, H, .2), M.lacquer, x, H / 2, z, g));
    mesh(new THREE.BoxGeometry(w + .2, .22, .2), M.lacquer, cx, 3.2, z1 + .02, g);
    // door frame, the leaf with raised panels, a ring pull, and a small board naming the stairs
    const dz = z1 + .07;
    [-1, 1].forEach(sx => mesh(new THREE.BoxGeometry(.14, DH + .1, .18), M.lacquer, cx + sx * (DW / 2 + .07), DH / 2, dz - .03, g));
    mesh(new THREE.BoxGeometry(DW + .42, .18, .2), M.lacquer, cx, DH + .09, dz - .03, g);
    const hinge = new THREE.Group(); hinge.position.set(cx - DW / 2, 0, z1); g.add(hinge);   // the door turns on its left edge
    const leaf = mesh(new THREE.BoxGeometry(DW, DH, .07), panelWood, DW / 2, DH / 2, 0, hinge);
    [[.62, .5], [1.5, .9]].forEach(([y, h]) => mesh(new THREE.BoxGeometry(DW - .26, h, .03), M.wood, DW / 2, y + h / 2, .05, hinge));
    mesh(new THREE.TorusGeometry(.06, .012, 6, 20), M.brass, DW - .16, 1.15, .07, hinge);
    const inside = new THREE.PointLight(0xffc890, 1.8, 4.5, 2); inside.position.set(STAIRS.x + .4, 2.6, STAIRS.z + .3); g.add(inside);   // so the stairs show when it opens
    doors.push(hinge);
    const sign = writing(256, 96, (c, cw, ch) => {
      c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.strokeRect(5, 5, cw - 10, ch - 10);
      c.fillStyle = "#e8c25a"; c.font = HAN_FONT(56); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("樓梯", cw / 2, ch / 2 + 4);
    });
    flat(mesh(new THREE.PlaneGeometry(.7, .26), new THREE.MeshStandardMaterial({ map: sign, roughness: .6, emissive: 0x222222, emissiveMap: sign }), cx, DH + .45, dz, g));
    // opening swings the door out into the hall, and it swings shut again behind you; the caller moves on once it is open (ms)
    let shut = 0;
    const swing = (to, d) => { const from = hinge.rotation.y; tween(reduceMotion ? .01 : d, t => hinge.rotation.y = from + (to - from) * easeOut(t)); };
    const open = () => { clearTimeout(shut); swing(-1.7, .7); shut = setTimeout(() => swing(0, .9), 2600); return reduceMotion ? 0 : 700; };
    Object.assign(leaf.userData, { stairDoor: true, open, tip: "Open the door to the stairs" });
    openers[n] = open;
    if (list) list.push(leaf);
    return leaf;
  }
  // the entrance wall across the front of a hall, with doors out and lattice windows either side
  // the upper floors are halls of the Buddhas: no main door, just a pair of lattice doors onto the balcony as the way out
  function frontWall(g, n, list) {
    flat(mesh(new THREE.PlaneGeometry(15, 7.2), M.wall, 0, 3.6, 7.5, g)).rotation.y = Math.PI;
    latticeWindows(g, [-4.4, 4.4].map(x => ({ p: V(x, 3.0, 7.47), ry: Math.PI, w: 1.5, h: 2.4 })));
    if (n === 1 || typeof n !== "number") {
      doorway(g, 0, 0, 7.46, Math.PI, 2.0, 2.5, null, { floor: "pagoda", tip: n === 1 ? "Go out through the main door" : "Go back outside" }, list);
      return;
    }
    const DW = .95, DH = 2.7, z = 7.47;
    latticeWindows(g, [-1, 1].map(s => ({ p: V(s * DW / 2, DH / 2 + .1, z), ry: Math.PI, w: DW - .04, h: DH })));
    mesh(new THREE.BoxGeometry(2 * DW + .4, .2, .2), M.lacquer, 0, DH + .2, z - .02, g);
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(.16, DH + .2, .2), M.lacquer, s * (DW + .08), DH / 2 + .1, z - .02, g));
    mesh(new THREE.BoxGeometry(2 * DW + .4, .1, .3), M.stone, 0, .05, z - .05, g);
    const sign = writing(256, 96, (c, cw, ch) => {
      c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.strokeRect(5, 5, cw - 10, ch - 10);
      c.fillStyle = "#e8c25a"; c.font = HAN_FONT(54); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("出口", cw / 2, ch / 2 + 4);
    });
    const board = flat(mesh(new THREE.PlaneGeometry(.75, .28), new THREE.MeshStandardMaterial({ map: sign, roughness: .6, emissive: 0x333333, emissiveMap: sign }), 0, DH + .55, z - .04, g));
    board.rotation.y = Math.PI;
    const hit = new THREE.Mesh(new THREE.BoxGeometry(2 * DW, DH, .1), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(0, DH / 2 + .1, z - .06); g.add(hit);
    Object.assign(hit.userData, { view: "corridor", tip: "Exit · step out onto the balcony corridor" });
    if (list) list.push(hit);
    corridor(g, list, DW, DH);
  }
  // the balcony corridor (迴廊) outside an upper hall: a timber walkway under the eave, red columns and balustrade,
  // and the night view over the temple grounds; the lattice doors lead back inside
  let CORRIDOR_RING = null, backdrop = 0;   // backdrop: the floor whose corridor is looking out at the real grounds
  const STOREY_Y = {};   // the walkable ring of the balcony corridor, for the walker
  const corridorDeck = std({ color: 0x5a1f14, roughness: .7 }), corridorWall = std({ color: 0xece4d4, roughness: .7 });
  const warmPane = lampPane(0xffa040, .75);
  function corridor(g, list, DW, DH) {
    const Z0 = 7.5, Z1 = 10.6, W = 15, EH = 3.8, mid = (Z0 + Z1) / 2;
    // the outside of the front wall: cream plaster between red posts, with the doors and windows seen from outside
    flat(mesh(new THREE.PlaneGeometry(W, 7.2), corridorWall, 0, 3.6, Z0 + .03, g));
    [-7.4, -2.6, 2.6, 7.4].forEach(x => mesh(new THREE.BoxGeometry(.24, EH + .6, .16), M.lacquer, x, (EH + .6) / 2, Z0 + .1, g));
    latticeWindows(g, [-4.4, 4.4].map(x => ({ p: V(x, 3.0, Z0 + .06), ry: 0, w: 1.5, h: 2.4 })), warmPane);
    latticeWindows(g, [-1, 1].map(sd => ({ p: V(sd * DW / 2, DH / 2 + .1, Z0 + .06), ry: 0, w: DW - .04, h: DH })), warmPane);
    const back = new THREE.Mesh(new THREE.BoxGeometry(2 * DW, DH, .1), new THREE.MeshBasicMaterial({ visible: false }));
    back.position.set(0, DH / 2 + .1, Z0 + .12); g.add(back);
    Object.assign(back.userData, { view: "hall", tip: "Go back inside the hall" });
    if (list) list.push(back);
    // the walkway runs right round the hall, so the view can be seen on every side: the hall's outline (walls at x = ±7.5,
    // z = -5.5 and 7.5) and the outer edge of the balcony, 3.1 m further out
    const HX = 7.5, HZ0 = -5.5, HZ1 = 7.5, OUT = 3.15, OX = HX + OUT, OZ0 = HZ0 - OUT, OZ1 = HZ1 + OUT;
    CORRIDOR_RING = { HX, HZ0, HZ1, OX, OZ0, OZ1 };
    [[0, (HZ1 + OZ1) / 2, 2 * OX, OUT], [0, (HZ0 + OZ0) / 2, 2 * OX, OUT], [(HX + OX) / 2, (HZ0 + HZ1) / 2, OUT, HZ1 - HZ0], [-(HX + OX) / 2, (HZ0 + HZ1) / 2, OUT, HZ1 - HZ0]]
      .forEach(([x, z, w, d]) => mesh(new THREE.BoxGeometry(w + .02, .14, d + .02), corridorDeck, x, -.07, z, g));
    // the outside of the hall's other three walls: cream plaster with warm lattice windows
    [[HX + .03, (HZ0 + HZ1) / 2, Math.PI / 2, HZ1 - HZ0], [-HX - .03, (HZ0 + HZ1) / 2, -Math.PI / 2, HZ1 - HZ0], [0, HZ0 - .03, Math.PI, 2 * HX]].forEach(([x, z, ry, w]) => {
      const pl = flat(mesh(new THREE.PlaneGeometry(w, 7.2), corridorWall, x, 3.6, z, g)); pl.rotation.y = ry;
    });
    const sideWins = [];
    [-1, 1].forEach(sd => [-3.4, -.8, 1.8, 4.4].forEach(z => sideWins.push({ p: V(sd * (HX + .06), 3.0, z), ry: sd * Math.PI / 2, w: 1.5, h: 2.4 })));
    [-5.6, -1.9, 1.9, 5.6].forEach(x => sideWins.push({ p: V(x, 3.2, HZ0 - .06), ry: Math.PI, w: 1.3, h: 2.1 }));
    latticeWindows(g, sideWins, warmPane);
    // the balustrade, columns, painted beam and eave soffit along each of the four outer edges
    const edges = [   // [start x, start z, end x, end z, outward direction]
      [-OX, OZ1, OX, OZ1, V(0, 0, 1)], [OX, OZ1, OX, OZ0, V(1, 0, 0)], [OX, OZ0, -OX, OZ0, V(0, 0, -1)], [-OX, OZ0, -OX, OZ1, V(-1, 0, 0)]
    ];
    const rail = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), redRail, 400), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    let k = 0;
    edges.forEach(([ax, az, bx, bz, out]) => {
      const len = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az) + Math.PI / 2, mx = (ax + bx) / 2 - out.x * .05, mz = (az + bz) / 2 - out.z * .05;
      q.setFromEuler(new THREE.Euler(0, ry, 0));
      rail.setMatrixAt(k++, m4.compose(V(mx, .82, mz), q, V(len, .07, .1)));
      rail.setMatrixAt(k++, m4.compose(V(mx, .24, mz), q, V(len, .06, .08)));
      const n = Math.round(len / .34);
      for (let i = 0; i <= n; i++) { const t = i / n, big = i % 11 === 0; rail.setMatrixAt(k++, m4.compose(V(ax + (bx - ax) * t - out.x * .05, big ? .46 : .52, az + (bz - az) * t - out.z * .05), q, big ? V(.12, .92, .12) : V(.05, .56, .05))); }
      const cn = Math.max(2, Math.round(len / 4.5));
      for (let i = 0; i <= cn; i++) {
        const t = i / cn, x = ax + (bx - ax) * t - out.x * .3, z = az + (bz - az) * t - out.z * .3;
        mesh(new THREE.CylinderGeometry(.14, .16, EH, 14), M.lacquer, x, EH / 2, z, g);
        mesh(new THREE.CylinderGeometry(.24, .26, .1, 14), M.stone, x, .05, z, g);
        if (i < cn && i % 2 === 0) lantern(g, x + (bx - ax) / cn * .5 - out.x * .7, 3.0, z + (bz - az) / cn * .5 - out.z * .7, 4.15, .8);
      }
      const beam = mesh(new THREE.BoxGeometry(len, .38, .28), beamMat, (ax + bx) / 2 - out.x * .3, EH - .1, (az + bz) / 2 - out.z * .3, g); beam.rotation.y = ry;
      // the red underside of the eave, sloping up from the beam to the wall
      const rise = 4.6 - (EH + .1), run = OUT + 1.4, sl = Math.hypot(rise, run);
      const sf = flat(mesh(new THREE.PlaneGeometry(len + 1.2, sl), eaveRed, (ax + bx) / 2 - out.x * (run / 2 - 1.4), (4.6 + EH + .1) / 2, (az + bz) / 2 - out.z * (run / 2 - 1.4), g));
      sf.rotation.order = "YXZ"; sf.rotation.y = ry; sf.rotation.x = Math.PI / 2 - Math.atan2(rise, run);
    });
    rail.count = k; rail.castShadow = false; g.add(rail);
    [[0, OZ1 - .8], [0, OZ0 + .8], [OX - .8, 1], [-OX + .8, 1]].forEach(([x, z]) => { const l = new THREE.PointLight(0xffa860, .8, 7, 2); l.position.set(x, 2.8, z); g.add(l); });
    // the view: night sky with stars and moon, a ring of dark hills, and the lights of the temple far below
    const sky = canvasTex(256, (c, sz) => {
      const l = c.createLinearGradient(0, 0, 0, sz);
      l.addColorStop(0, "#000000"); l.addColorStop(.36, "#000000"); l.addColorStop(.49, "#000000"); l.addColorStop(.52, "#1a1210"); l.addColorStop(1, "#0d0806");
      c.fillStyle = l; c.fillRect(0, 0, sz, sz);
    });
    const vw = new THREE.Group(); vw.position.set(0, 0, Z0); g.add(vw); g.userData.vista = vw;   // replaced by the real grounds when they are built
    vw.add(new THREE.Mesh(new THREE.SphereGeometry(70, 32, 16), new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide, fog: false })));
    const starPos = [], rs = rng(23);
    for (let i = 0; i < 400; i++) { const a = rs() * TAU, e = .12 + rs() * 1.3; starPos.push(Math.cos(a) * Math.cos(e) * 66, Math.sin(e) * 66, Math.sin(a) * Math.cos(e) * 66); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: .5, color: 0xfff4e0, map: glowTex, transparent: true, depthWrite: false, fog: false })); vw.add(stars);
    daySky(vw, 70, stars);
    const sunC = new THREE.DirectionalLight(0xfff0d8, 0); sunC.position.set(6, 12, 20); g.add(sunC); dayLight(sunC, [0xfff0d8, 0], [0xfff0d8, 1.2]);
    const hillTex = canvasTex(512, (c, sz) => {
      c.clearRect(0, 0, sz, sz);
      [["#6f8274", .45, 7], ["#56685a", .62, 11]].forEach(([col, base, n]) => {   // tinted dark at night, see below
        c.fillStyle = col; c.beginPath(); c.moveTo(0, sz);
        for (let i = 0; i <= 64; i++) { const x = i / 64 * sz; c.lineTo(x, sz * (base - .12 * Math.abs(Math.sin(i / 64 * Math.PI * n)) - .05 * Math.sin(i * 1.7))); }
        c.lineTo(sz, sz); c.closePath(); c.fill();
      });
    });
    hillTex.wrapS = THREE.RepeatWrapping; hillTex.repeat.x = 3;
    const hills = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 30, 64, 1, true), new THREE.MeshBasicMaterial({ map: hillTex, transparent: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    hills.position.y = -12; vw.add(hills);
    const ground = flat(mesh(new THREE.CircleGeometry(62, 48), new THREE.MeshBasicMaterial({ color: 0x0d0907, fog: false }), 0, -24, 0, vw)); ground.rotation.x = -Math.PI / 2;
    onDaylight(d => { hills.material.color.copy(lerpC(0x2a2638, 0xffffff, d)); ground.material.color.copy(lerpC(0x0d0907, 0x5e5a48, d)); });
    const rg = rng(31);
    for (let i = 0; i < 70; i++) {   // lanterns and windows of the temple far below
      const a = (rg() - .5) * 2.4, r = 14 + rg() * 40;
      const sp = glowSprite(rg() < .7 ? 0xff7a3a : 0xffc070, 1.2 + rg() * 1.4, .8); sp.material.fog = false;
      sp.position.set(Math.sin(a) * r, -23.5 + rg() * .6, Math.cos(a) * r); vw.add(sp);
    }
  }
  // flat shapes with a round hole where the stairs pass: `y` is shape-y (floor: -z, ceiling: +z)
  function holed(outer, hx, hy, r) {
    const shape = new THREE.Shape(); outer(shape);
    const hole = new THREE.Path(); hole.absarc(hx, hy, r, 0, TAU, true); shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape, 48);
  }
  // lattice bars over a set of window rectangles {p, ry, w, h, cols, rows}, all in one instanced mesh
  function latticeBars(parent, list, mat = M.lacquer) {
    let n = 0; list.forEach(w => n += (w.cols || 4) - 1 + (w.rows || 4) - 1 + 4);
    const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, n);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = V(1, 1, 1);
    let k = 0;
    list.forEach(w => {
      q.setFromEuler(e.set(0, w.ry, 0));
      const fwd = V(Math.sin(w.ry), 0, Math.cos(w.ry)), right = V(Math.cos(w.ry), 0, -Math.sin(w.ry)), cols = w.cols || 4, rows = w.rows || 4;
      const at = (dx, dy, sx, sy) => { m4.compose(w.p.clone().addScaledVector(right, dx).add(V(0, dy, 0)).addScaledVector(fwd, .03), q, s.set(sx, sy, .045)); bars.setMatrixAt(k++, m4); };
      for (let c = 1; c < cols; c++) at(-w.w / 2 + c * w.w / cols, 0, .035, w.h);
      for (let r = 1; r < rows; r++) at(0, -w.h / 2 + r * w.h / rows, w.w, .035);
      at(-w.w / 2, 0, .1, w.h + .1); at(w.w / 2, 0, .1, w.h + .1); at(0, w.h / 2, w.w + .1, .1); at(0, -w.h / 2, w.w + .1, .1);
    });
    bars.castShadow = false; parent.add(bars);
  }
  // glowing panes behind the lattice
  // carved window screens in the style of a 槅扇 lattice door: a fretwork head panel, fine vertical slats tied by two rails,
  // and a solid skirt panel; red wood with see-through gaps, drawn once and laid over a glowing pane
  const screenTex = (() => {
    const W = 256, H = 448, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"), wood = "#8a2416";
    const bar = (x, y, w, h) => { g.fillStyle = wood; g.fillRect(x, y, w, h); };
    const F = 16, B = 6, X0 = F, X1 = W - F, headB = 120, skirtT = H - 92;
    bar(0, 0, W, F); bar(0, H - F, W, F); bar(0, 0, F, H); bar(W - F, 0, F, H);      // outer frame
    bar(0, headB - F / 2, W, F); bar(0, skirtT - F / 2, W, F);                          // rails between the panels
    // head panel: two nested rectangles linked by short bars (回 fretwork)
    const hx = X0 + 16, hy = F + 14, hw = X1 - X0 - 32, hh = headB - F / 2 - F - 28;
    [[0, 0], [22, 18]].forEach(([dx, dy]) => { bar(hx + dx, hy + dy, hw - 2 * dx, B); bar(hx + dx, hy + hh - dy - B, hw - 2 * dx, B); bar(hx + dx, hy + dy, B, hh - 2 * dy); bar(hx + hw - dx - B, hy + dy, B, hh - 2 * dy); });
    [[hx + hw / 2 - B / 2, F, B, 14], [hx + hw / 2 - B / 2, hy + hh, B, 14], [X0, hy + hh / 2 - B / 2, 16, B], [hx + hw, hy + hh / 2 - B / 2, 16, B]].forEach(r => bar(...r));
    // main panel: vertical slats with two tie rails
    const my0 = headB + F / 2, my1 = skirtT - F / 2;
    for (let x = X0 + 14; x < X1 - 6; x += 18) bar(x, my0, B, my1 - my0);
    [.33, .67].forEach(f => bar(X0, my0 + (my1 - my0) * f - B / 2, X1 - X0, B + 2));
    // skirt panel: solid wood with a gilt inset
    bar(X0, skirtT + F / 2, X1 - X0, H - F - skirtT - F / 2);
    g.strokeStyle = "#d6a94a"; g.lineWidth = 4; g.strokeRect(X0 + 18, skirtT + F / 2 + 16, X1 - X0 - 36, H - F - skirtT - F / 2 - 32);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
  })();
  const screenMat = std({ map: screenTex, alphaTest: .5, roughness: .5, side: THREE.DoubleSide });
  function latticeScreens(parent, list) {
    const screens = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), screenMat, list.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    list.forEach((w, i) => { q.setFromEuler(e.set(0, w.ry, 0)); m4.compose(w.p.clone().add(V(Math.sin(w.ry) * .03, 0, Math.cos(w.ry) * .03)), q, V(w.w, w.h, 1)); screens.setMatrixAt(i, m4); });
    screens.castShadow = false; parent.add(screens);
    latticeBars(parent, list.map(w => ({ ...w, cols: 1, rows: 1 })));   // just the outer frame
  }
  function latticeWindows(parent, list, pane = winMat) {
    const panes = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), pane, list.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    list.forEach((w, i) => { q.setFromEuler(e.set(0, w.ry, 0)); m4.compose(w.p, q, V(w.w, w.h, 1)); panes.setMatrixAt(i, m4); });
    panes.castShadow = false; parent.add(panes);
    latticeScreens(parent, list);
  }
  // side walls (and optionally the back wall) of a hall, each with moonlit lattice windows
  function hallWalls(g, wallMat, back = true) {
    const wins = [];
    if (back) flat(mesh(new THREE.PlaneGeometry(16, 7.2), wallMat, 0, 3.6, -5.5, g));
    [-1, 1].forEach(s => {
      const w = flat(mesh(new THREE.PlaneGeometry(14, 7.2), wallMat, s * 7.5, 3.6, .5, g)); w.rotation.y = -s * Math.PI / 2;
      [-3.4, -.8, 1.8, 4.4].forEach(z => wins.push({ p: V(s * 7.47, 3.0, z), ry: -s * Math.PI / 2, w: 1.5, h: 2.4, cols: 4, rows: 5 }));
    });
    [-5.6, 5.6].forEach(x => wins.push({ p: V(x, 3.4, -5.47), ry: 0, w: 1.3, h: 2.1 }));
    latticeWindows(g, wins.filter(w => !inStairCorner(w.p)));
  }
  // a pair of red doors with gold studs, rings, a framed name board above and lanterns either side
  const doorMat = std({ color: 0x9c1c12, roughness: .45 });
  function doorway(parent, x, y, z, ry, w, h, text, data, list) {
    const d = new THREE.Group(); d.position.set(x, y, z); d.rotation.y = ry; parent.add(d);
    mesh(new THREE.BoxGeometry(w + .6, .32, .24), M.lacquer, 0, h + .16, 0, d);
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(.24, h, .24), M.lacquer, s * (w / 2 + .12), h / 2, 0, d));
    mesh(new THREE.BoxGeometry(w + .6, .14, .4), M.stone, 0, .07, .05, d);
    const studs = new THREE.InstancedMesh(new THREE.SphereGeometry(.034, 8, 6), M.trim, 2 * 4 * 7), m4 = new THREE.Matrix4();
    let k = 0;
    [-1, 1].forEach(s => {
      const leaf = mesh(new THREE.BoxGeometry(w / 2 - .03, h - .06, .09), doorMat, s * w / 4, h / 2, .02, d);
      if (list) clickable(list, leaf, data);
      for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) { m4.makeTranslation(s * w / 4 + (c - 1.5) * (w / 2 - .2) / 4, .35 + r * (h - .7) / 6, .075); studs.setMatrixAt(k++, m4); }
      const ring = mesh(new THREE.TorusGeometry(.07, .014, 6, 20), M.brass, s * .1, h * .48, .09, d);
      mesh(new THREE.CylinderGeometry(.05, .05, .03, 12), M.brass, s * .1, h * .48 + .07, .08, d).rotation.x = Math.PI / 2;
    });
    d.add(studs);
    if (text) {
      const tex = writing(512, 160, (c, cw, ch) => {
        c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch);
        c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(96); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, cw / 2, ch / 2 + 6);
      });
      mesh(new THREE.BoxGeometry(w * .95 + .1, .5, .06), M.trim, 0, h + .62, .04, d);
      flat(mesh(new THREE.PlaneGeometry(w * .95, .42), new THREE.MeshStandardMaterial({ map: tex, roughness: .6, emissive: 0x222222, emissiveMap: tex }), 0, h + .62, .08, d));
    }
    [-1, 1].forEach(s => lantern(d, s * (w / 2 + .55), h - .1, .35, h + .45, .75));
    return d;
  }
