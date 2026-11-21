  /* ---------- the bank's end of the main road: beside the bank a Shan house of two storeys and, behind it, a small quarter of houses
     on its own lane (Ward No. 5, with the ward office at the lane's end); past the quarter the town's diesel power station and its
     main substation; and across the road, east of the township court, the municipal office and the immigration office. The main
     road is carried on east past them all (the last `main` lane in `LANES`) ---------- */
  const WARD5 = { lane: { x0: 88, x1: 92, z0: 196, z1: 255.5 }, west: 80.6, east: 99.6 };   // the quarter's lane (in `LANES`) and its two rows of houses' centre lines (x)
  const SHAN2 = { x: 77.5, z: 243.5, lot: [68.5, 86.5, 233, 254.5] };   // the Shan house's centre, its front (local +z) to the road; its walled lot x0, x1, z0, z1
  const TDC_OFFICE = { x: 85, z: 278, wall: [66, 104, 263, 292], gate: 85 };   // the municipal office's centre (its front to the road), its compound x0, x1, z0, z1 and gate (x)
  const IMMIG = { x: 121, z: 276, wall: [106, 136, 263, 289], gate: 121 };   // the immigration office, the same
  const POWER = { wall: [112, 152, 214, 254.5], gate: 121, yard: [138, 151, 215, 246] };   // the power station's compound x0, x1, z0, z1, its gate (x) on the road, the switchyard's fence

  // a whitewashed wall or a block wall from (x0, z0) to (x1, z1), along x or along z, `h` high, blocking walkers; `rail` puts a
  // steel railing on a low wall, `wire` three strands of barbed wire on top
  function compoundWall(g, x0, z0, x1, z1, o = {}) {
    const len = Math.hypot(x1 - x0, z1 - z0); if (len < .2) return;
    const { h = 1.1, mat = whiteWall, rail = false, wire = false } = o, along = x1 !== x0;
    const f = new THREE.Group(); f.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); f.rotation.y = along ? 0 : Math.PI / 2; g.add(f);
    sWall(g, Math.min(x0, x1) - .12, Math.max(x0, x1) + .12, Math.min(z0, z1) - .12, Math.max(z0, z1) + .12);
    mesh(new THREE.BoxGeometry(len, h, .22), mat, 0, h / 2, 0, f);
    flat(mesh(new THREE.BoxGeometry(len + .06, .07, .32), concrete, 0, h + .035, 0, f));
    const n = Math.max(1, Math.round(len / 3));
    for (let k = 0; k <= n; k++) part(C5.pier, mat, -len / 2 + k * len / n, h / 2 + .04, 0, f).scale.y = (h + .08) / 1.2;
    if (rail) {   // a green steel railing on the wall
      mesh(new THREE.BoxGeometry(len, .05, .05), C5.green, 0, h + .95, 0, f);
      for (let x = -len / 2 + .1; x < len / 2; x += .18) part(C5.bar, C5.green, x, h + .5, 0, f);
    }
    if (wire) [.25, .45, .65].forEach(y => flat(mesh(new THREE.BoxGeometry(len, .015, .015), steel, 0, h + y, 0, f)));
    if (wire) for (let k = 0; k <= n; k++) part(C5.wirePost, steel, -len / 2 + k * len / n, h + .38, 0, f);
  }
  // a gate: two square piers with a steel leaf folded back each side; a run of wall either side of it is left to the caller
  function compoundGate(g, gx, z, half, mat = whiteWall, h = 1.8) {
    [-1, 1].forEach(sd => {
      sPillar(g, gx + sd * (half + .2), z, .28);
      mesh(new THREE.BoxGeometry(.5, h, .5), mat, gx + sd * (half + .2), h / 2, z, g);
      flat(mesh(new THREE.BoxGeometry(.6, .08, .6), concrete, gx + sd * (half + .2), h + .04, z, g));
      const leaf = new THREE.Group(); leaf.position.set(gx + sd * half, 0, z); leaf.rotation.y = sd * 1.3; g.add(leaf);
      [.2, 1.5].forEach(y => mesh(new THREE.BoxGeometry(half, .05, .05), steel, -sd * half / 2, y, 0, leaf));
      for (let k = 0; k < 7; k++) part(C5.gateBar, steel, -sd * (k + .5) * half / 7, .85, 0, leaf);
    });
  }
  // a name board over a gate on two steel posts with a beam: civicSign's board, facing local +z turned by ry
  function gateBoard(g, gx, z, half, ry, my, en, bg, fg, w = 4.4) {
    const b = new THREE.Group(); b.position.set(gx, 0, z); b.rotation.y = ry; g.add(b);
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.16, 4.1, .16), steel, sd * (half + .75), 2.05, 0, b));
    mesh(new THREE.BoxGeometry(2 * half + 1.8, .14, .14), steel, 0, 4.05, 0, b);
    civicSign(b, my, en, bg, fg, w, 0, 3.3, .1);
  }
  // shared parts for this end of town (built once, on first use)
  let C5 = null;
  function c5Kit() {
    if (C5) return C5;
    const louvreT = canvasTex(64, (c, sz) => { c.fillStyle = "#2e6a4a"; c.fillRect(0, 0, sz, sz); for (let y = 0; y < sz; y += 8) { c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(0, y, sz, 2); c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(0, y + 3, sz, 2); } c.fillStyle = "#24543a"; c.fillRect(0, 0, 4, sz); c.fillRect(sz - 4, 0, 4, sz); });
    const linkT = canvasTex(64, (c, sz) => { c.clearRect(0, 0, sz, sz); c.strokeStyle = "rgba(150,156,160,1)"; c.lineWidth = 2; for (let k = -sz; k < sz; k += 16) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + sz, sz); c.stroke(); c.beginPath(); c.moveTo(k + sz, 0); c.lineTo(k, sz); c.stroke(); } });
    linkT.wrapS = linkT.wrapT = THREE.RepeatWrapping;
    C5 = {
      pier: new THREE.BoxGeometry(.34, 1.2, .34), bar: new THREE.BoxGeometry(.025, .9, .025), wirePost: new THREE.BoxGeometry(.04, .8, .04), gateBar: new THREE.BoxGeometry(.03, 1.3, .03),
      green: std({ color: 0x2a6a44, roughness: .5, metalness: .4 }), louvre: std({ map: louvreT, roughness: .7 }),
      link: std({ map: linkT, transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .5, metalness: .5 }), linkT,
      earth: std({ color: 0x8a7458, roughness: 1 }), gravel: std({ color: 0x9a968c, roughness: 1 }), block: std({ color: 0xc4beb2, roughness: .95 }),
      porcelain: std({ color: 0x7a4a30, roughness: .35 }), olive: std({ color: 0x6a7a6a, roughness: .55, metalness: .4 }), galv: std({ color: 0xa4a8aa, roughness: .45, metalness: .7 }),
      tuft: new THREE.IcosahedronGeometry(.22, 0), disc: new THREE.CylinderGeometry(.16, .16, .05, 10), baluster: new THREE.CylinderGeometry(.035, .045, .7, 6),
      pendant: new THREE.BoxGeometry(.09, .3, .02), tip: new THREE.ConeGeometry(.06, .14, 4)
    };
    return C5;
  }

  /* ---------- ႁိူၼ်းတႆး a Shan house of two storeys beside the bank, as the old merchant families built them in the towns of the
     northern Shan hills: a whitewashed brick ground floor with arched windows and a shop room behind folding teak doors, an upper
     storey of teak jutting out over it on brackets, a long row of green louvred shutters, a deep balcony across the front on teak
     posts with turned balusters, and a rusty corrugated hip roof with a raised ridge to let the heat out and fretted boards hanging
     from its eaves; in a walled yard with a frangipani, bougainvillea on the wall and water jars by the door ---------- */
  function shanTwoStorey(g) {
    const K = c5Kit(), S = SHAN2, H = new THREE.Group(); H.position.set(S.x, 0, S.z); g.add(H);
    const list = picks.pagoda, data = { tip: "A Shan house · ႁိူၼ်းတႆး", toast: "ႁိူၼ်းတႆး (Shan), ရှမ်းအိမ် (Burmese): a Shan house of two storeys, as the old trading families built them in the towns of the northern Shan hills. Downstairs, in whitewashed brick, the family sells tea, pickled tea leaves and dried goods from behind folding teak doors; upstairs, in teak, they live, and in the evening they sit out on the long balcony over the road. The raised ridge of the roof lets out the heat of the day. It's only to look at." };
    const W = 13, D = 9, P = .45, F1 = 3.2, F2 = 3, OV = .5, BD = 2.2;   // width, depth, plinth, ground storey, upper storey, the upper storey's overhang, the balcony's depth
    const Y1 = P + F1, Y2 = Y1 + F2, FZ = D / 2 + OV + BD;   // the upper floor, the eaves, the balcony's front
    sRect(H, -W / 2 - .4, W / 2 + .4, -D / 2 - .4, FZ + .2);
    mesh(new THREE.BoxGeometry(W + .8, P, D + BD + OV + .8), concrete, 0, P / 2, (BD + OV) / 2, H);
    // the brick ground floor
    clickable(list, mesh(new THREE.BoxGeometry(W, F1, D), whiteWall, 0, P + F1 / 2, 0, H), data);
    const halfDisc = new THREE.CircleGeometry(.6, 12, 0, Math.PI), ring = new THREE.TorusGeometry(.66, .06, 4, 12, Math.PI);
    // an arched window: a dark opening, a white moulded head and two green plank shutters folded open; faces local +z of its frame
    const archWin = (x, y, z, ry, w = 1.2, h = 2.1) => {
      const o = new THREE.Group(); o.position.set(x, y, z); o.rotation.y = ry; H.add(o);
      const s = w / 1.2, hs = h - .6 * s;
      part(winBackGeo, houseInside, 0, hs / 2, .02, o).scale.set(w / .9, hs / 1.1, 1);
      part(halfDisc, houseInside, 0, hs, .03, o).scale.set(s, s, 1);
      part(ring, townFrame, 0, hs, .05, o).scale.set(s, s, 1);
      [-1, 1].forEach(sd => { part(winShutterGeo, K.louvre, sd * (w / 2 + .25), hs / 2, .06, o).scale.set(1.1 * s, hs / 1.1, 1); part(C5.pier, townFrame, sd * (w / 2 + .03), hs / 2, .04, o).scale.set(.25, hs / 1.2, .3); });
      part(winLintelGeo, townFrame, 0, -.06, .08, o).scale.set(w / 1.06 + .3, 1.2, 1.6);
    };
    [-5, -3.2, 3.2, 5].forEach(x => archWin(x, P + .7, D / 2 + .01, 0));
    [-2.5, 0, 2.5].forEach(z => [-1, 1].forEach(sd => archWin(sd * (W / 2 + .01), P + .7, z, sd * Math.PI / 2)));
    [-4, 0, 4].forEach(x => archWin(x, P + .7, -D / 2 - .01, Math.PI));
    // the shop room's doorway in the middle: folding teak doors pushed back, the room dark behind, and a step
    mesh(new THREE.BoxGeometry(3.6, 2.7, .06), houseInside, 0, P + 1.35, D / 2 + .02, H);
    [-1, 1].forEach(sd => { for (let k = 0; k < 2; k++) { const d = mesh(new THREE.BoxGeometry(.45, 2.6, .05), teakWall, sd * (1.9 + .25 + k * .1), P + 1.32, D / 2 + .1 + k * .22, H); d.rotation.y = sd * (k ? -.9 : .9); } });
    mesh(new THREE.BoxGeometry(4, .12, .25), teakDark, 0, P + 2.76, D / 2 + .06, H);
    // the upper storey of teak, jutting out over the ground floor at the sides and the front, on carved brackets
    const UZ = OV / 2, UW = W + 2 * OV, UD = D + OV;
    mesh(new THREE.BoxGeometry(UW + .1, .22, UD + .1), teakDark, 0, Y1 + .02, UZ, H);
    clickable(list, mesh(new THREE.BoxGeometry(UW, F2, UD), teakWall, 0, Y1 + F2 / 2 + .12, UZ, H), data);
    const brk = new THREE.BoxGeometry(.12, .7, .12);
    for (let x = -W / 2 + .3; x <= W / 2 - .2; x += 1.6) { const b = part(brk, teakDark, x, Y1 - .3, D / 2 + .25, H); b.rotation.x = .62; }
    [-1, 1].forEach(sd => { for (let z = -D / 2 + .5; z <= D / 2; z += 1.6) { const b = part(brk, teakDark, sd * (W / 2 + .25), Y1 - .3, z, H); b.rotation.z = -sd * .62; } });
    // a long row of louvred shutters, folded open, round the upper storey; on the front, doors out to the balcony
    const shut = (x, y, z, ry, w, h) => {
      const o = new THREE.Group(); o.position.set(x, y, z); o.rotation.y = ry; H.add(o);
      part(winBackGeo, houseInside, 0, 0, .02, o).scale.set(w / .9, h / 1.1, 1);
      part(winLintelGeo, teakDark, 0, h / 2 + .05, .05, o).scale.x = (w + .2) / 1.06;
      [-1, 1].forEach(sd => part(winShutterGeo, K.louvre, sd * (w / 2 + w / 4), 0, .07, o).scale.set(w / .9, h / 1.1, 1));
    };
    const fz = D / 2 + OV + .01;
    [-5.2, -2.6, 0, 2.6, 5.2].forEach((x, i) => shut(x, Y1 + (i % 2 ? 1.55 : 1.22), fz, 0, i % 2 ? .9 : 1.1, i % 2 ? 1.3 : 2.05));
    [-5, -2.5, 0, 2.5, 5].forEach(x => shut(x, Y1 + 1.55, UZ - UD / 2 - .01, Math.PI, .9, 1.3));
    [-2.8, 0, 2.8].forEach(z => [-1, 1].forEach(sd => shut(sd * (UW / 2 + .01), Y1 + 1.55, UZ + z, sd * Math.PI / 2, .9, 1.3)));
    // the balcony across the front: a plank floor on teak posts from the ground, a rail with turned balusters, and potted plants
    const bz = D / 2 + OV + BD / 2;
    mesh(new THREE.BoxGeometry(UW, .18, BD), teakDark, 0, Y1 + .03, bz, H);
    const PX = [-UW / 2 + .12, -UW / 4, 0, UW / 4, UW / 2 - .12];
    PX.forEach(x => { mesh(new THREE.BoxGeometry(.2, Y2 + .1, .2), teakPost, x, Y2 / 2 + .05, FZ - .12, H); sCircle(H, x, FZ - .12, .14); });
    mesh(new THREE.BoxGeometry(UW, .1, .14), teakDark, 0, Y1 + 1.02, FZ - .12, H);
    mesh(new THREE.BoxGeometry(UW, .08, .12), teakDark, 0, Y1 + .2, FZ - .12, H);
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.1, .08, BD), teakDark, sd * (UW / 2 - .05), Y1 + 1.02, bz, H));
    for (let x = -UW / 2 + .25; x < UW / 2 - .15; x += .22) part(K.baluster, teakWall, x, Y1 + .6, FZ - .12, H);
    [-1, 1].forEach(sd => { for (let z = D / 2 + OV + .2; z < FZ - .2; z += .22) part(K.baluster, teakWall, sd * (UW / 2 - .05), Y1 + .6, z, H); });
    const potG = new THREE.CylinderGeometry(.16, .12, .3, 8), pot = std({ color: 0x9a4a2a, roughness: .8 }), leaf = std({ color: 0x3e7a2e, roughness: .9, flatShading: true }), pink = std({ color: 0xd83a8a, roughness: .9, flatShading: true });
    [-4.6, -3.9, 3.9, 4.6, -1.4, 1.4].forEach((x, i) => { part(potG, pot, x, Y1 + 1.22, FZ - .12, H); part(K.tuft, i % 3 ? leaf : pink, x, Y1 + 1.5, FZ - .12, H).scale.set(1.2, 1, 1.2); });
    mesh(new THREE.BoxGeometry(UW + .1, .18, UD + BD + .1), teakDark, 0, Y2 + .2, UZ + BD / 2, H);   // the wall plate and the balcony's ceiling
    // the roof: a rusty hip over the house and its balcony, a raised ridge lifted on short posts above it, fretted boards along the eaves
    const a = UW / 2 + .9, b = (UD + BD) / 2 + .9, rh = b * .58, RZ = UZ + BD / 2, RY = Y2 + .29;
    const rf = tinHipRoof(a, b, rh, rustRoof); rf.position.set(0, RY, RZ); rf.castShadow = rf.receiveShadow = true; H.add(rf);
    const ra = (a - b) + 1.4, rb = 1.3, LY = RY + rh - .25;
    [-1, 1].forEach(sd => [-1, 1].forEach(se => mesh(new THREE.BoxGeometry(.12, .7, .12), teakDark, sd * (ra - .5), LY + .35, RZ + se * .45, H)));
    mesh(new THREE.BoxGeometry(2 * (ra - .4), .5, .9), houseInside, 0, LY + .3, RZ, H);   // the gap under the raised ridge, dark
    const rr = tinHipRoof(ra, rb, .75, rustRoof); rr.position.set(0, LY + .7, RZ); rr.castShadow = true; H.add(rr);
    const dropY = RY - .2;
    for (let x = -a + .15; x <= a - .1; x += .3) [RZ + b, RZ - b].forEach(z => { part(K.pendant, teakDark, x, dropY, z, H); part(K.tip, teakDark, x, dropY - .2, z, H).rotation.x = Math.PI; });
    for (let z = RZ - b + .3; z <= RZ + b - .2; z += .3) [-a, a].forEach(x => { part(K.pendant, teakDark, x, dropY, z, H).rotation.y = Math.PI / 2; part(K.tip, teakDark, x, dropY - .2, z, H).rotation.x = Math.PI; });
    // the walled yard: a whitewashed wall with a gate in line with the door, a path, a frangipani, bougainvillea over the wall, water jars
    const [x0, x1, z0, z1] = S.lot, gh = 1.3;
    compoundWall(g, x0, z1, S.x - gh - .5, z1); compoundWall(g, S.x + gh + .5, z1, x1, z1);
    compoundWall(g, x0, z0, x1, z0); compoundWall(g, x0, z0, x0, z1); compoundWall(g, x1, z0, x1, z1);
    compoundGate(g, S.x, z1, gh);
    flat(mesh(new THREE.BoxGeometry(x1 - x0 - .4, .02, z1 - z0 - .4), K.earth, (x0 + x1) / 2, .02, (z0 + z1) / 2, g)).receiveShadow = true;
    flat(mesh(new THREE.BoxGeometry(2.2, .05, z1 - S.z - FZ), M.stone, S.x, .04, (z1 + S.z + FZ) / 2, g));
    tree(g, x0 + 2.4, z1 - 2.2, .7, 6610);
    const r = rng(6620), bloom = [0xd8307a, 0xe85a9a, 0xc02a6a].map(c => std({ color: c, roughness: .9, flatShading: true }));
    for (let k = 0; k < 26; k++) { const x = x1 - .2 - r() * 6, o = part(K.tuft, bloom[k % 3], x, 1.1 + r() * .5, z1 - .15 + (r() - .5) * .4, g); o.scale.setScalar(.8 + r() * .7); }
    for (let k = 0; k < 10; k++) part(K.tuft, leaf, x1 - .3 - r() * 6, .9 + r() * .4, z1 - .3, g).scale.setScalar(1 + r() * .5);
    const jar = std({ color: 0x4a2a14, roughness: .3, metalness: .1 });
    [[-2.6, .2], [-3.4, .1]].forEach(([x, dz]) => { const j = mesh(new THREE.SphereGeometry(.4, 12, 10), jar, S.x + x, .45, S.z + FZ + .5 + dz, g); j.scale.y = 1.2; sCircle(g, S.x + x, S.z + FZ + .5 + dz, .4); });
    banana(g, x0 + 1.4, z0 + 1.6, 6630); banana(g, x1 - 1.5, z0 + 1.8, 6631);
    TALL.push({ x0: S.x - a, x1: S.x + a, z0: S.z + RZ - b, z1: S.z + RZ + b, h: LY + 1.6 });
  }

  /* ---------- အမှတ် (၅) ရပ်ကွက် Ward No. 5, the small quarter behind the Shan house: a concrete lane with open drains and village lamps
     (drawn with the other lanes from `LANES`), a row of houses either side, wooden and concrete, one and two storeys, a corner shop
     on the main road, and at the lane's end the ward administrator's office ---------- */
  function wardQuarter(g) {
    const K = c5Kit(), L = WARD5.lane, r = rng(5505);
    const KINDS = [[true, 2], [false, 2], [true, 1], [false, 1], [true, 2], [true, 1], [false, 2]];
    let seq = 0;
    const house = (cx, cz, ry) => {
      const [wood, floors] = KINDS[seq % KINDS.length], seed = 550 + seq++, W = 7 + (seq % 2) * .5, D = 6.5;
      if (wood) shanWoodHouse(g, cx, cz, ry, { W, D, floors, seed, roof: seed % 3 ? rustRoof : ROOFS[seed % 4](1) });
      else shanHouse(g, cx + (ry > 0 ? .6 : -.6), cz, ry, { W, D, floors, shop: false, seed, wall: WALLS[(seed * 5) % WALLS.length], roof: ROOFS[seed % 4] });
    };
    [203, 213, 223].forEach(z => house(WARD5.west, z, Math.PI / 2));    // the west row, facing the lane
    [203, 213, 223, 233].forEach(z => house(WARD5.east, z, -Math.PI / 2));   // the east row
    // the corner shop on the main road: a grocery downstairs, the family upstairs
    shanHouse(g, 99.5, 249.3, 0, { W: 8, D: 7, floors: 2, shop: true, seed: 557, wall: WALLS[1], roof: ROOFS[2] });
    // the yards between and behind: bananas, a shade tree or two, washing lines, a well with a bucket
    [[84.5, 208], [84.8, 218.5], [76, 229], [104, 208], [104.5, 228], [105, 240]].forEach(([x, z], i) => banana(g, x, z, 5510 + i));
    [[74, 198.5], [106, 218], [95.5, 241]].forEach(([x, z], i) => tree(g, x, z, .7 + r() * .2, 5520 + i));
    const cloth = [0xc04040, 0x3a6aa8, 0xe8d060, 0xf0ece0, 0x6a4a8a].map(c => std({ color: c, roughness: .9, side: THREE.DoubleSide })), bamboo = std({ color: 0x9a8a50, roughness: .8 });
    [[85.6, 197.5], [93.2, 218]].forEach(([x, z], i) => {
      [z, z + 3].forEach(zz => { mesh(new THREE.CylinderGeometry(.04, .04, 1.9, 6), bamboo, x, .95, zz, g); sCircle(g, x, zz, .08); });
      mesh(new THREE.CylinderGeometry(.008, .008, 3, 4), steel, x, 1.8, z + 1.5, g).rotation.x = Math.PI / 2;
      for (let k = 0; k < 4; k++) { const ch = .6 + r() * .3, c = mesh(new THREE.PlaneGeometry(.55, ch), cloth[(i + k) % cloth.length], x, 1.79 - ch / 2, z + .4 + k * .7, g); c.rotation.y = Math.PI / 2; c.castShadow = false; }
    });
    const W0 = [94.5, 197.6];   // the quarter's well: a round brick kerb, a post and beam with a pulley and a bucket
    mesh(new THREE.CylinderGeometry(.75, .8, .8, 16, 1, true), whiteWall, W0[0], .4, W0[1], g).material.side = THREE.DoubleSide;
    flat(mesh(new THREE.CircleGeometry(.7, 16), std({ color: 0x1a2228, roughness: .2 }), W0[0], .5, W0[1], g)).rotation.x = -Math.PI / 2;
    sCircle(g, W0[0], W0[1], .85);
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.12, 2, .12), teakPost, W0[0] + sd * .85, 1, W0[1], g));
    mesh(new THREE.BoxGeometry(1.9, .12, .12), teakPost, W0[0], 2, W0[1], g);
    mesh(new THREE.CylinderGeometry(.15, .15, .1, 10), steel, W0[0], 1.85, W0[1], g).rotation.x = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(.16, .12, .28, 10), steel, W0[0] + .4, .95, W0[1] + .55, g);
    // the ward administrator's office at the lane's end, looking down the lane, and the quarter's board at its mouth on the main road
    const WO = { tip: "Ward No. 5 office · အမှတ် (၅) ရပ်ကွက်", toast: "အမှတ် (၅) ရပ်ကွက် အုပ်ချုပ်ရေးမှူးရုံး: the ward administrator's office for Ward No. 5, the small quarter on this lane. The ward administrator keeps the household lists, writes the letters of recommendation people need for an ID card, a job or a school, settles quarrels between neighbours, and calls the quarter together to clear the drains before the rains. It's only to look at." };
    const wo = civic(g, 90, 190.6, 0, { W: 9, D: 5.5, floors: 1, wall: WALLS[3], roof: ROOFS[0](3), corridor: 1.8, door: true, data: WO });
    clickable(picks.pagoda, civicSign(wo.h, "ရပ်ကွက်အုပ်ချုပ်ရေးမှူးရုံး", "Ward Administrator's Office", "#1e4a7a", "#ffffff", 3.4, 0, 2.95, 4.63), WO);
    flagPole(g, 85.6, 194.5, 6);
    [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(.1, 2.9, .1), steel, 87.25 + sd * 1, 1.45, 254.7, g); sCircle(g, 87.25 + sd * 1, 254.7, .1); });
    clickable(picks.pagoda, civicSign(g, "အမှတ် (၅) ရပ်ကွက်", "Ward No. 5", "#1e4a7a", "#ffffff", 2.4, 87.25, 2.45, 254.76), WO);
  }

  /* ---------- မြို့နယ်စည်ပင်သာယာရေးကော်မတီ the municipal office (the township development committee) and, next door east, the township
     immigration office, across the main road from the quarter: two plain two-storey government blocks in the town's painted
     concrete, each with an open corridor along its front on both floors, in a walled compound with a gate on the road, a name board
     over the gate and the flag. A green rubbish truck stands in the municipal yard; at immigration a tin shelter keeps the queue
     out of the sun ---------- */
  function townOffices(g) {
    const K = c5Kit(), list = picks.pagoda;
    // the municipal office
    {
      const O = TDC_OFFICE, [x0, x1, z0, z1] = O.wall, gh = 2.6;
      const data = { tip: "Municipal office · မြို့နယ်စည်ပင်သာယာရေးကော်မတီ", toast: "မြို့နယ်စည်ပင်သာယာရေးကော်မတီ, the township development committee: the town's municipal office. It keeps the roads and the street lights, the water supply and the drains, collects the rubbish (its green truck goes round the quarters each morning), licenses the stalls of the seven-day market and the shops on the street, and issues building permits. People come to pay their water bills and their stall fees at the counter downstairs. It's only to look at." };
      civic(g, O.x, O.z, Math.PI, { W: 24, D: 11, floors: 2, wall: civicCream, trim: civicGreen, roof: ROOFS[0](6), corridor: 2.6, door: true, data });
      compoundWall(g, x0, z0, O.gate - gh - .5, z0, { h: .7, rail: true }); compoundWall(g, O.gate + gh + .5, z0, x1, z0, { h: .7, rail: true });
      compoundWall(g, x0, z0, x0, z1, { h: 1.6 }); compoundWall(g, x1, z0, x1, z1, { h: 1.6 }); compoundWall(g, x0, z1, x1, z1, { h: 1.6 });
      compoundGate(g, O.gate, z0, gh, civicCream);
      gateBoard(g, O.gate, z0 - .1, gh, Math.PI, "မြို့နယ်စည်ပင်သာယာရေးကော်မတီ", "Township Development Committee", "#2f6a4a", "#ffffff", 4.8);
      flat(mesh(new THREE.BoxGeometry(x1 - x0 - .4, .03, 6.4), forecourt, (x0 + x1) / 2, .03, z0 + 3.4, g)).receiveShadow = true;
      flagPole(g, O.x + 9, z0 + 2.6, 8);
      vehicle(g, x0 + 5, z0 + 3.6, Math.PI / 2, { L: 6.4, H: 2.9, body: civicGreen, stripe: townFrame, beacons: 0 });   // the rubbish truck, nose to the gate
      [[x0 + 2, z1 - 3], [x1 - 2.5, z1 - 3.5], [x1 - 2.5, z0 + 3]].forEach(([x, z], i) => tree(g, x, z, .75, 6710 + i));
    }
    // the immigration office
    {
      const O = IMMIG, [x0, x1, z0, z1] = O.wall, gh = 2.2;
      const data = { tip: "Immigration office · မြို့နယ်လူဝင်မှုကြီးကြပ်ရေးဦးစီးဌာန", toast: "မြို့နယ်လူဝင်မှုကြီးကြပ်ရေးဦးစီးဌာန, the township immigration office. Here people apply for their national registration card (မှတ်ပုံတင်) when they turn eighteen, add a newborn to the household list or move a family to another township, and traders on the road to the China border come for their border passes. The queue waits on the benches under the tin shelter by the gate. It's only to look at." };
      civic(g, O.x, O.z, Math.PI, { W: 18, D: 10, floors: 2, wall: std({ color: 0xd8e2ea, roughness: .85 }), trim: civicBlue, roof: ROOFS[2](5), corridor: 2.4, door: true, data });
      compoundWall(g, x0, z0, O.gate - gh - .5, z0, { h: .7, rail: true }); compoundWall(g, O.gate + gh + .5, z0, x1, z0, { h: .7, rail: true });
      compoundWall(g, x0, z0, x0, z1, { h: 1.6 }); compoundWall(g, x1, z0, x1, z1, { h: 1.6 }); compoundWall(g, x0, z1, x1, z1, { h: 1.6 });
      compoundGate(g, O.gate, z0, gh);
      gateBoard(g, O.gate, z0 - .1, gh, Math.PI, "မြို့နယ်လူဝင်မှုကြီးကြပ်ရေးဦးစီးဌာန", "Township Immigration Office", "#2a4a8a", "#ffffff", 4.8);
      flat(mesh(new THREE.BoxGeometry(x1 - x0 - .4, .03, 5.4), forecourt, (x0 + x1) / 2, .03, z0 + 2.9, g)).receiveShadow = true;
      flagPole(g, x1 - 3, z0 + 2.4, 8);
      // the queue's shelter: a tin roof on steel posts over two benches
      const sx = x0 + 5, sz = z0 + 3;
      [-2.6, 2.6].forEach(dx => [-1, 1].forEach(dz => { mesh(new THREE.BoxGeometry(.08, 2.5, .08), steel, sx + dx, 1.25, sz + dz, g); sCircle(g, sx + dx, sz + dz, .08); }));
      const rf = mesh(new THREE.BoxGeometry(6, .05, 2.8), ROOFS[3](4), sx, 2.55, sz, g); rf.rotation.x = .12;
      [-.5, .5].forEach(dz => { mesh(new THREE.BoxGeometry(4.6, .06, .4), M.wood, sx, .45, sz + dz, g); [-2, 2].forEach(dx => mesh(new THREE.BoxGeometry(.06, .45, .4), steel, sx + dx, .22, sz + dz, g)); });
      tree(g, x1 - 2.5, z1 - 3, .75, 6720); tree(g, x0 + 2.5, z1 - 3, .7, 6721);
    }
  }

  /* ---------- ဒီဇယ်မီးစက်ရုံ the town's diesel power station and its main substation, past the quarter on the bank's side of the
     road: in a block-walled compound topped with barbed wire, a long engine hall of brick and grey corrugated sheet with its roller
     doors to the road, four exhaust stacks smoking over its back and a row of radiators with their fans turning; two diesel tanks in
     a low bund; and behind a chain-link fence the switchyard, with two transformers, a busbar on porcelain insulators, the circuit
     breakers and disconnect switches between two steel gantries, the main switch room by the gate, and the lines leaving on concrete
     poles. The town runs on the grid; the engines carry it when the supply fails ---------- */
  function powerStation(g) {
    const K = c5Kit(), list = picks.pagoda, P = POWER, [x0, x1, z0, z1] = P.wall, gh = 2.6, r = rng(7707);
    const data = { tip: "Diesel power station · ဒီဇယ်မီးစက်ရုံ", toast: "ဒီဇယ်မီးစက်ရုံ, the town's diesel power station, and the main substation (ဓာတ်အားခွဲရုံ) beside it, run by the electricity supply board. The town takes its power from the grid through the substation's transformers; when the supply fails, as it often does in the hot months, the big diesel engines in the hall start up and carry the town until it comes back, and you hear their thump all down the street. From the main switch room the line crews switch the town's feeders on and off. Keep out of the switchyard: the lines are live. It's only to look at." };
    const yardData = { tip: "The switchyard · ဓာတ်အားခွဲရုံ", toast: data.toast };
    // the compound wall with barbed wire, the gate and its board, and the ground inside
    compoundWall(g, x0, z1, P.gate - gh - .5, z1, { h: 2.1, mat: K.block, wire: true }); compoundWall(g, P.gate + gh + .5, z1, x1, z1, { h: 2.1, mat: K.block, wire: true });
    compoundWall(g, x0, z0, x1, z0, { h: 2.1, mat: K.block, wire: true }); compoundWall(g, x0, z0, x0, z1, { h: 2.1, mat: K.block, wire: true }); compoundWall(g, x1, z0, x1, z1, { h: 2.1, mat: K.block, wire: true });
    compoundGate(g, P.gate, z1, gh, K.block, 2.3);
    gateBoard(g, P.gate, z1 + .1, gh, 0, "ဒီဇယ်မီးစက်ရုံနှင့် ဓာတ်အားခွဲရုံ", "Diesel Power Station · Main Substation", "#8a2a1e", "#ffffff", 4.8);
    flat(mesh(new THREE.BoxGeometry(x1 - x0 - .4, .03, z1 - z0 - .4), forecourt, (x0 + x1) / 2, .025, (z0 + z1) / 2, g)).receiveShadow = true;

    // the engine hall: a brick dado, grey corrugated walls and a corrugated hip roof with a ventilator along the ridge, three roller doors
    const HX = 126, HZ = 236, HW = 22, HD = 12, HH = 6.4;
    const hall = new THREE.Group(); hall.position.set(HX, 0, HZ); g.add(hall);
    sRect(hall, -HW / 2 - .2, HW / 2 + .2, -HD / 2 - .2, HD / 2 + .2);
    mesh(new THREE.BoxGeometry(HW + .5, .3, HD + .5), concrete, 0, .15, 0, hall);
    clickable(list, mesh(new THREE.BoxGeometry(HW, 1.3, HD), std({ color: 0xa8584a, roughness: .9 }), 0, .95, 0, hall), data);
    const clad = ROOFS[3](HW / 1.2);
    clickable(list, mesh(new THREE.BoxGeometry(HW - .02, HH - 1.6, HD - .02), clad, 0, 1.6 + (HH - 1.6) / 2, 0, hall), data);
    const darkIn = std({ color: 0x141618, roughness: .9 }), yellow = std({ color: 0xd8a820, roughness: .5, metalness: .3 });
    [-7, 0, 7].forEach((x, i) => {
      if (i === 1) {   // the middle door rolled up: the hall dark inside and a yellow engine in the opening
        mesh(new THREE.BoxGeometry(4.2, 4.2, .06), darkIn, x, 2.4, HD / 2 + .02, hall);
        mesh(new THREE.BoxGeometry(2.4, 1.8, .2), yellow, x, 1.2, HD / 2 + .1, hall); mesh(new THREE.BoxGeometry(1.2, .5, .08), darkIn, x + .4, 1.5, HD / 2 + .22, hall);   // the end of the engine in the doorway, its radiator grille
        mesh(new THREE.BoxGeometry(4.4, .5, .3), shutter, x, 4.6, HD / 2 + .15, hall);
      } else mesh(new THREE.BoxGeometry(4.2, 4.2, .08), shutter, x, 2.4, HD / 2 + .05, hall);
      mesh(new THREE.BoxGeometry(4.6, .2, .3), steel, x, 4.85, HD / 2 + .15, hall);
    });
    for (let x = -9; x <= 9; x += 3) [HD / 2 + .02, -HD / 2 - .02].forEach(z => mesh(new THREE.BoxGeometry(1.8, .7, .06), townGlass, x, HH - .7, z, hall));   // the high windows
    const hrf = tinHipRoof(HW / 2 + .6, HD / 2 + .6, 2.4, ROOFS[3](1)); hrf.position.y = HH; hrf.castShadow = true; hall.add(hrf);
    mesh(new THREE.BoxGeometry(HW - 12 + 2, .9, 1.2), K.galv, 0, HH + 2.6, 0, hall);   // the ridge ventilator
    // the exhaust stacks behind it, each rising from a silencer drum on a steel stand, with a rain cap
    const STX = [-7.5, -2.5, 2.5, 7.5], stackTop = 11.5, sz = -HD / 2 - 1.6, tops = [];
    STX.forEach(x => {
      mesh(new THREE.CylinderGeometry(.55, .55, 2.4, 12), K.galv, x, 3.6, sz, hall).rotation.x = Math.PI / 2;
      mesh(new THREE.CylinderGeometry(.3, .3, stackTop - 3.6, 10), std({ color: 0x5a5450, roughness: .6, metalness: .5 }), x, (stackTop + 3.6) / 2, sz - .9, hall);
      mesh(new THREE.ConeGeometry(.5, .35, 10), K.galv, x, stackTop + .35, sz - .9, hall);
      [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.1, 3, .1), steel, x + sd * .5, 1.5, sz, hall));
      tops.push(V(HX + x, stackTop + .2, HZ + sz - .9));
    });
    // the radiators: a row of boxed coolers with a fan turning in the top of each
    const fans = [], RZ = HZ - HD / 2 - 5.2, bladeG = new THREE.BoxGeometry(1.5, .03, .26);
    sRect(g, HX - 10, HX + 10, RZ - 1.4, HZ - HD / 2);
    [-7.5, -2.5, 2.5, 7.5].forEach(x => {
      mesh(new THREE.BoxGeometry(3, 2, 2.4), K.olive, HX + x, 1.3, RZ, g);
      flat(mesh(new THREE.CylinderGeometry(.9, .9, .05, 18), darkIn, HX + x, 2.32, RZ, g));
      const f = new THREE.Group(); f.position.set(HX + x, 2.4, RZ); g.add(f);
      [0, Math.PI / 2].forEach(a => { const b = mesh(bladeG, steel, 0, 0, 0, f); b.rotation.y = a; b.rotation.x = .25; b.castShadow = false; b.frustumCulled = false; });   // not welded into a static batch: it turns all the time
      fans.push(f);
      [-1, 1].forEach(sd => [-1, 1].forEach(se => part(C5.wirePost, steel, HX + x + sd * 1.3, .2, RZ + se, g).scale.set(2, .5, 2)));
    });
    // the fuel tanks: two long white tanks on concrete saddles in a low bund, with a pipe to the hall
    const TX = 118.5, TZ = 219.5, white = std({ color: 0xe8e6e0, roughness: .5, metalness: .2 });
    sRect(g, TX - 5.5, TX + 5.5, TZ - 4, TZ + 4);
    [[TX - 5.5, TZ - 4, TX + 5.5, TZ - 4], [TX - 5.5, TZ + 4, TX + 5.5, TZ + 4], [TX - 5.5, TZ - 4, TX - 5.5, TZ + 4], [TX + 5.5, TZ - 4, TX + 5.5, TZ + 4]]
      .forEach(([a, b, c, d]) => mesh(new THREE.BoxGeometry(Math.abs(c - a) + .3, .8, Math.abs(d - b) + .3), concrete, (a + c) / 2, .4, (b + d) / 2, g));
    [-1.7, 1.7].forEach(dz => {
      const t = clickable(list, mesh(new THREE.CylinderGeometry(1.3, 1.3, 8, 18), white, TX, 1.9, TZ + dz, g), data); t.rotation.z = Math.PI / 2;
      [-3, 3].forEach(dx => mesh(new THREE.BoxGeometry(.5, .9, 2.2), concrete, TX + dx, .45, TZ + dz, g));
      mesh(new THREE.BoxGeometry(.06, 1.5, .06), steel, TX + 2.2, 3.9, TZ + dz, g);   // the vent
    });
    mesh(new THREE.BoxGeometry(.12, .12, HZ - HD / 2 - TZ - 1.8), steel, TX + 4.8, .9, (TZ + 1.8 + HZ - HD / 2) / 2, g);

    // the switchyard: gravel inside a chain-link fence topped with wire, two gantries, the transformers, busbar, breakers and switches
    const [y0, y1, w0, w1] = P.yard;
    flat(mesh(new THREE.BoxGeometry(y1 - y0, .05, w1 - w0), K.gravel, (y0 + y1) / 2, .04, (w0 + w1) / 2, g)).receiveShadow = true;
    const linkRun = (ax, az, bx, bz) => {
      const len = Math.hypot(bx - ax, bz - az), m = K.link.clone(); m.map = K.linkT.clone(); m.map.needsUpdate = true; m.map.repeat.set(len / .6, 2.4 / .6);
      const f = new THREE.Group(); f.position.set((ax + bx) / 2, 0, (az + bz) / 2); f.rotation.y = ax !== bx ? 0 : Math.PI / 2; g.add(f);
      flat(mesh(new THREE.PlaneGeometry(len, 2.4), m, 0, 1.25, 0, f));
      for (let k = 0; k <= Math.round(len / 3); k++) part(C5.wirePost, K.galv, -len / 2 + k * len / Math.round(len / 3), 1.4, 0, f).scale.set(1.5, 3.6, 1.5);
      sWall(g, Math.min(ax, bx) - .05, Math.max(ax, bx) + .05, Math.min(az, bz) - .05, Math.max(az, bz) + .05);
    };
    linkRun(y0, w0, y1, w0); linkRun(y0, w1, y1, w1); linkRun(y0, w0, y0, w1); linkRun(y1, w0, y1, w1);
    // a danger board on the fence, facing the gate path
    civicSign(g, "ဗို့အားမြင့် · အန္တရာယ်ရှိသည်", "DANGER · HIGH VOLTAGE", "#c0281e", "#ffffff", 1.6, y0 - .06, 1.7, w1 - 4, -Math.PI / 2);
    const lattice = (x, z, h) => {   // a gantry leg: four galvanised angles with cross bracing
      [-1, 1].forEach(sd => [-1, 1].forEach(se => part(C5.wirePost, K.galv, x + sd * .3, h / 2, z + se * .3, g).scale.set(1.5, h / .8, 1.5)));
      for (let y = .8; y < h - .4; y += 1.2) [-1, 1].forEach(se => { const b = part(C5.wirePost, K.galv, x, y + .6, z + se * .3, g); b.scale.set(1, 1.6, 1); b.rotation.z = (y / 1.2 | 0) % 2 ? .75 : -.75; });
    };
    const GH = 8.2, GZ = [220, 233], PH = [-1.2, 0, 1.2];   // the gantries' height and lines (z); the three phases' offsets along x from a bay's centre
    const BAYS = [141.5, 147.5];
    GZ.forEach(z => {
      lattice(y0 + .9, z, GH); lattice(y1 - .9, z, GH);
      mesh(new THREE.BoxGeometry(y1 - y0 - 1.2, .5, .5), K.galv, (y0 + y1) / 2, GH - .25, z, g);
      BAYS.forEach(bx => PH.forEach(dx => { for (let k = 0; k < 5; k++) part(K.disc, K.porcelain, bx + dx, GH - .6 - k * .13, z, g); }));
    });
    sRect(g, y0 + .5, y0 + 1.3, GZ[0] - .5, GZ[0] + .5); sRect(g, y1 - 1.3, y1 - .5, GZ[0] - .5, GZ[0] + .5);
    const wire = new THREE.CylinderGeometry(.02, .02, 1, 4), cond = std({ color: 0x3a3a3a, roughness: .5, metalness: .6 });
    const span = (a, b) => { const d = b.clone().sub(a), o = mesh(wire, cond, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, g); o.scale.y = d.length(); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); o.castShadow = false; return o; };
    // the busbar on post insulators along the yard, the breakers and disconnect switches in each bay, conductors up to the gantries
    const post = (x, z, h) => { mesh(new THREE.BoxGeometry(.35, h - 1.2, .35), K.galv, x, (h - 1.2) / 2, z, g); for (let k = 0; k < 7; k++) part(K.disc, K.porcelain, x, h - 1.1 + k * .15, z, g); return V(x, h, z); };
    BAYS.forEach(bx => PH.forEach(dx => {
      const x = bx + dx, top = V(x, GH - 1.25, GZ[0]), back = V(x, GH - 1.25, GZ[1]);
      const sw = post(x, 224, 4.6), br = post(x, 227.5, 4.2), bus = post(x, 230.5, 5.2);
      mesh(new THREE.BoxGeometry(.7, .9, .6), K.olive, x, 1.6, 227.5, g);   // the breaker's mechanism box
      const blade = mesh(new THREE.BoxGeometry(.06, .06, 1.4), K.galv, x, sw.y + .05, 224.6, g); blade.rotation.x = -.35;   // the switch blade, closed
      span(top, sw); span(sw, br); span(br, bus); span(bus, back);
    }));
    PH.forEach(dx => span(V(BAYS[0] + dx, 5.25, 230.5), V(BAYS[1] + dx, 5.25, 230.5)));
    // the transformers in front of the second gantry, each a tank with cooling fins, a conservator drum and porcelain bushings
    BAYS.forEach((bx, i) => {
      const tz = 240;
      mesh(new THREE.BoxGeometry(3.2, .3, 3), concrete, bx, .15, tz, g);
      clickable(list, mesh(new THREE.BoxGeometry(2.4, 2.4, 1.8), K.olive, bx, 1.5, tz, g), yardData);
      for (let k = 0; k < 8; k++) [-1, 1].forEach(sd => part(C5.pier, K.olive, bx - 1 + k * .28, 1.4, tz + sd * 1.15, g).scale.set(.2, 1.6, 1.4));
      mesh(new THREE.CylinderGeometry(.35, .35, 1.8, 12), K.olive, bx, 3.2, tz - .6, g).rotation.z = Math.PI / 2;
      PH.forEach(dx => { const b = V(bx + dx * .6, 2.7, tz - .2); for (let k = 0; k < 6; k++) part(K.disc, K.porcelain, b.x, b.y + k * .14, b.z, g).scale.set(.8, 1, .8); span(V(b.x, b.y + .9, b.z), V(bx + dx, GH - 1.25, GZ[1])); });
      sRect(g, bx - 1.6, bx + 1.6, tz - 1.5, tz + 1.5);
    });
    TALL.push({ x0: y0, x1: y1, z0: w0, z1: w1, h: GH + .5 });
    // the main switch room by the gate: a small brick block, a steel door, a vent, its board
    const sr = civic(g, 144.5, 250.5, 0, { W: 11, D: 3.6, floors: 1, wall: std({ color: 0xb06a50, roughness: .9 }), roof: null, door: true, data: yardData });
    clickable(list, civicSign(sr.h, "ဓာတ်အားခွဲရုံ ခလုတ်ခန်း", "Main Switch Room", "#8a2a1e", "#ffffff", 2.8, 0, 3.05, 1.83), yardData);
    streetLight(g, y0 - 1.2, 247.6, Math.PI, true);   // a floodlight over the yard's gate side
    // the lines leaving over the back wall on concrete poles, three conductors on pin insulators
    const poleM = std({ color: 0xb4b0a8, roughness: .85 }), POLES = [[144.5, 207], [144.5, 192], [146, 177], [149, 162]];
    let last = PH.map(dx => V(144.5 + dx, GH - 1.25, GZ[0]));
    POLES.forEach(([x, z]) => {
      mesh(new THREE.BoxGeometry(.28, 9.5, .28), poleM, x, 4.75, z, g); sCircle(g, x, z, .2);
      mesh(new THREE.BoxGeometry(2.8, .12, .12), K.galv, x, 9, z, g);
      const tips = PH.map(dx => { part(K.disc, K.porcelain, x + dx, 9.12, z, g).scale.set(.6, 2, .6); return V(x + dx, 9.25, z); });
      tips.forEach((t, k) => span(last[k], t)); last = tips;
    });

    // smoke from the stacks: soft grey puffs rising and drifting with the wind, darker at night; still when motion is reduced
    const smokeT = canvasTex(64, (c, sz) => { const gr = c.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2); gr.addColorStop(0, "rgba(255,255,255,.6)"); gr.addColorStop(.6, "rgba(255,255,255,.2)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, sz, sz); });
    const puffs = [], N = 6, smokeDay = new THREE.Color(0x9a9690), smokeNight = new THREE.Color(0x3a383a);
    tops.forEach((p, i) => { for (let k = 0; k < N; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeT, color: 0x9a9690, transparent: true, opacity: 0, depthWrite: false })); s.castShadow = false; g.add(s); puffs.push({ s, p, u: (k + r()) / N, k: r() }); } });
    let dl = 1; onDaylight(d => { dl = d; const c = smokeNight.clone().lerp(smokeDay, d); puffs.forEach(q => q.s.material.color.copy(c)); });
    const step = (dt, motion) => {
      puffs.forEach(q => {
        q.u = (q.u + dt * motion * .16) % 1;
        const u = q.u, sc = .9 + u * 3.4;
        q.s.position.set(q.p.x + u * 3.2 + q.k * .6, q.p.y + u * 6.5, q.p.z + u * 1.4);
        q.s.scale.set(sc, sc, 1);
        q.s.material.opacity = .42 * Math.min(1, u * 5) * (1 - u);
      });
    };
    step(0, 1);
    updaters.pagoda.push((dt, t, motion) => {
      if (!motion) return;
      step(Math.min(dt, .1), motion);
      fans.forEach(f => f.rotation.y += dt * motion * 9);
    });
    TALL.push({ x0: HX - HW / 2 - .6, x1: HX + HW / 2 + .6, z0: HZ - HD / 2 - 6.6, z1: HZ + HD / 2 + .6, h: stackTop + 1 });
  }
