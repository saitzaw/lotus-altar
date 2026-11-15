  /* ---------- ၵၢတ်ႇပွႆး the festival market beside the fire balloon ground: on the stupa hill's lower terrace past the ground's west
     end, two rows of little Shan shops face each other across a lane. Each is a timber stall on a raised plank floor, walls of woven
     bamboo, a plank shutter propped out over the counter as an awning, and a steep hipped roof of thatch or old corrugated iron with
     a raised ridge over a gap to let the smoke and heat out, the way Shan houses and kyaungs are roofed. They sell Shan noodles,
     sticky rice cakes, tea leaf, fruit, woven cloth and bags, and paper toy balloons. A bamboo gateway with the market's board stands
     at the lane's end by the balloon ground; paper lanterns hang under the awnings and on strings across the lane after dark ---------- */
  // the rows (radius of each row's centre, from the hill's centre; how many shops), the first shop's angle past the balloon ground's
  // west end and the gap between shops (m); a shop's width, depth, floor and eave heights; the lane between the rows (radii)
  const BAZAAR = { rows: [[56.8, 7], [67.2, 8]], da: .07, gap: 1.4, W: 4, D: 3.6, FY: .45, EH: 2.75, lane: [58.9, 65.1] };
  // the things every Shan shop shares (materials, shapes), made once for the festival market and the offering shops
  let STALL = null;
  function stallKit() {
    if (STALL) return STALL;
    // woven bamboo walls (a twill of light and dark strips), thatch in rows of overlapping leaf, plank floor and painted fascia
    const weave = canvasTex(128, (c, sz) => {
      c.fillStyle = "#c9ad74"; c.fillRect(0, 0, sz, sz); const s = 8;
      for (let i = 0; i < sz / s; i++) for (let j = 0; j < sz / s; j++) { c.fillStyle = ((i + j >> 1) % 2) ? "#a88a52" : "#d8bf86"; c.fillRect(i * s + 1, j * s + 1, s - 2, s - 2); }
    });
    weave.wrapS = weave.wrapT = THREE.RepeatWrapping; weave.repeat.set(3, 2);
    const thatchT = canvasTex(128, (c, sz) => {
      c.fillStyle = "#8a7448"; c.fillRect(0, 0, sz, sz); const q = rng(61);
      for (let y = 0; y < sz; y += 8) for (let x = -4; x < sz; x += 3) { c.fillStyle = `rgba(${150 + q() * 50 | 0},${120 + q() * 40 | 0},${70 + q() * 30 | 0},.6)`; c.fillRect(x, y, 2, 10); }
      for (let y = 7; y < sz; y += 8) { c.fillStyle = "rgba(40,28,14,.55)"; c.fillRect(0, y, sz, 2); }
    });
    thatchT.wrapS = thatchT.wrapT = THREE.RepeatWrapping; thatchT.repeat.set(.6, .6);   // the roof's UVs are in metres
    const paper = [0xd83a2a, 0xf0e2c0, 0xe8a030].map(c => std({ color: c, roughness: .8, emissive: c, emissiveIntensity: 0 }));
    onDaylight(d => paper.forEach(m => m.emissiveIntensity = .7 * (1 - d)));
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n);
    STALL = { ...shanCarpentry(), box, cyl, paper, wallM: std({ map: weave, roughness: .9 }), thatchM: std({ map: thatchT, roughness: 1, side: THREE.DoubleSide }),
      FASCIA: [0x8a1e14, 0x2f5a7a, 0x3a6a3a, 0xb8862a].map(c => std({ color: c, roughness: .6 })), bamboo: std({ color: 0xb89a5a, roughness: .8 }),
      G: { post: box(.16, 1, .16), plank: box(1, 1, 1), lamp: cyl(.17, .17, .38, 10), pole: cyl(.035, .035, 1, 5), fin: new THREE.ConeGeometry(.1, .5, 6) },
      LIN: c => { const k = new THREE.Color(c); return new THREE.Color(Math.pow(k.r, 2.2), Math.pow(k.g, 2.2), Math.pow(k.b, 2.2)).getHex(); },
      ball: (rad, sy = 1) => { const q = new THREE.IcosahedronGeometry(rad, 0); q.scale(1, sy, 1); return q; } };
    return STALL;
  }
  // one shop in its own frame S (front toward local +z), its static parts as part()s to be baked: o = { W, D, FY, EH, n (which
  // fascia colour), r (an rng), data, front (how far the walk-block reaches out in front), lamp (the lantern's x) }; returns the
  // lantern's place in S. The goods go in separately (see `stallGoods`)
  function shanStall(S, o) {
    const K = stallKit(), { teak, teakDark, hip, G, bamboo } = K, { W, D, FY, EH, r } = o, list = picks.pagoda, CT = FY + .9, CZ = D / 2 - .25, BZ = -D / 2 + .25;
    sRect(S, -W / 2 - .1, W / 2 + .1, -D / 2 - .1, D / 2 + (o.front || .1));
    // the floor, corner posts, bamboo walls back and sides, the counter and the shelves behind it
    part(G.plank, teakDark, 0, FY / 2, 0, S).scale.set(W, FY, D);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => part(G.post, teak, sx * (W / 2 - .08), (FY + EH) / 2, sz * (D / 2 - .08), S).scale.y = EH - FY);
    part(G.plank, K.wallM, 0, (FY + EH) / 2, -D / 2 + .04, S).scale.set(W - .2, EH - FY, .05);
    [-1, 1].forEach(sd => part(G.plank, K.wallM, sd * (W / 2 - .04), (FY + EH) / 2, 0, S).scale.set(.05, EH - FY, D - .2));
    part(G.plank, K.wallM, 0, (FY + CT) / 2, CZ, S).scale.set(W - .2, CT - FY, .45);
    part(G.plank, teakDark, 0, CT + .02, CZ, S).scale.set(W - .1, .04, .55);
    [FY + 1.0, FY + 1.55].forEach(sy => part(G.plank, teak, 0, sy, BZ, S).scale.set(W - .3, .04, .35));
    part(G.plank, teakDark, 0, EH, 0, S).scale.set(W + .1, .14, D + .1);   // the wall plate
    part(G.plank, K.FASCIA[o.n % K.FASCIA.length], 0, EH - .14, D / 2 + .02, S).scale.set(W - .2, .3, .05);   // a painted board under the eave
    // the shutter propped out over the counter on two bamboo poles
    const t = .16, AL = 1.35, hy = EH - .32, aw = part(G.plank, teak, 0, hy + Math.sin(t) * AL / 2, D / 2 + Math.cos(t) * AL / 2, S); aw.scale.set(W - .1, .05, AL); aw.rotation.x = -t;
    [-1, 1].forEach(sd => { const L = hy + Math.sin(t) * AL * .95, pz = D / 2 + Math.cos(t) * AL * .95; part(G.pole, bamboo, sd * (W / 2 - .3), L / 2, pz, S).scale.y = L; sCircle(S, sd * (W / 2 - .3), pz, .06); });
    // the roof: a steep hip from the eaves, and over a gap above it a little raised hip on the ridge; thatch or old iron
    const ox = W / 2 + .55, oz = D / 2 + .5, top = EH + 1.5, iron = r() < .45;
    const lower = hip(S, [-ox, ox, -oz, oz], [-W * .22, W * .22, -.3, .3], EH + .07, top);
    const upper = hip(S, [-W * .3, W * .3, -.6, .6], [-W * .14, W * .14, 0, 0], top + .3, top + 1.0);
    if (!iron) lower.material = upper.material = K.thatchM;
    [-1, 1].forEach(sd => { part(G.post, teakDark, sd * W * .2, top + .15, 0, S).scale.y = .32; part(G.fin, M.gold, sd * W * .14, top + 1.2, 0, S); });
    [lower, upper].forEach(m => { m.castShadow = m.receiveShadow = true; clickable(list, m, o.data); });
    // a paper lantern under the awning's edge
    const lx = o.lamp, lz = D / 2 + 1.0, ly = EH - .55;
    mesh(G.lamp, K.paper[(r() * K.paper.length) | 0], lx, ly, lz, S).castShadow = false;
    const gl = lanternGlow(0xffb060, 1.2, .9); gl.position.set(lx, ly, lz); S.add(gl);
    return V(lx, ly, lz);
  }
  // a shop's goods ([geometry, colour, x, y, z] in its frame S) added to `goods`, the list for one flat-shaded mesh in S's parent's frame
  function stallGoods(goods, S, parts) {
    const K = stallKit(); S.updateMatrix();
    parts.forEach(([geo, col, gx, gy, gz]) => { const q = geo.index ? geo.toNonIndexed() : geo.clone(); q.translate(gx, gy, gz); q.applyMatrix4(S.matrix); goods.push([q, K.LIN(col), 0, 0, 0]); });
  }
  function balloonBazaar() {
    const Z = BAZAAR, H = HILL.group, list = picks.pagoda, r = rng(6060), lo = HILL.terraces[1], y0 = lo.y, a0 = BALLOON_GROUND.a1 + Z.da;
    const K = stallKit(), { box, cyl, ball, bamboo, paper } = K, G_ = K.G;
    const at = (a, rr) => [rr * Math.sin(a), -rr * Math.cos(a)];   // hill frame (x, z) at angle a, radius rr
    const P = new THREE.Group(); H.add(P);   // the static parts, baked
    const data = { tip: "The festival market · ၵၢတ်ႇပွႆး", toast: "Shan shops put up beside the fire balloon ground for the festival: little timber stalls on a raised plank floor, walls of woven bamboo, a plank shutter propped out over the counter for an awning, and steep roofs of leaf thatch or old corrugated iron with a raised ridge over a gap to let the smoke and the heat out, as on Shan houses and monasteries. They sell Shan noodles, sticky rice cakes in banana leaf, tea leaf, mandarins from the hills, woven cloth and shoulder bags, and little paper balloons for the children. The market is called ၵၢတ်ႇပွႆး (kaat poi, the festival market) in Shan." };
    // the goods: one flat-shaded mesh for the whole market, built from coloured parts in each shop's frame
    const goods = [];
    const W = Z.W, D = Z.D, FY = Z.FY, EH = Z.EH, CT = FY + .9, CZ = D / 2 - .25, BZ = -D / 2 + .25;   // counter top and its line, the back shelves' line
    const pk = l => l[(r() * l.length) | 0];
    const KINDS = {
      noodles: () => {   // a pot of broth on a clay stove, stacks of bowls, jars of chilli oil and pickles, a bench before the counter
        const p = [[cyl(.22, .18, .3), 0x9a5a3a, -1.2, CT + .15, CZ], [cyl(.22, .22, .26, 10), 0xb8bcc0, -1.2, CT + .43, CZ]];
        [-.55, -.25].forEach(x => { for (let k = 0; k < 5; k++) p.push([cyl(.09, .055, .05), k === 4 ? 0x3a6ac0 : 0xf2f0ea, x, CT + .03 + k * .045, CZ]); });
        [0xa8201a, 0x6a8a2a, 0xc89a5a, 0xa8201a].forEach((c, i) => p.push([cyl(.06, .06, .16), c, .3 + i * .22, CT + .08, CZ], [cyl(.064, .064, .03), 0xd83a2a, .3 + i * .22, CT + .17, CZ]));
        p.push([box(2.4, .06, .35), 0x6a4a2a, 0, .45, D / 2 + .9], [box(.08, .42, .3), 0x5a3a20, -1, .21, D / 2 + .9], [box(.08, .42, .3), 0x5a3a20, 1, .21, D / 2 + .9]);
        return p;
      },
      cakes: () => {   // trays of Shan rice cakes in bright colours, sticky rice parcels in banana leaf, a stack of leaf-wrapped bundles
        const p = [];
        [-1.2, -.4, .4, 1.2].forEach(x => { p.push([cyl(.34, .3, .05, 10), 0xc8a868, x, CT + .025, CZ]); const c = pk([0xf0e4c0, 0x5ab04a, 0xd84a7a, 0xe8b830, 0x7a3a2a]); for (let i = 0; i < 7; i++) p.push([box(.13, .07, .13), c, x + Math.cos(i) * .17 * (i ? 1 : 0), CT + .09, CZ + Math.sin(i) * .17 * (i ? 1 : 0)]); });
        for (let i = 0; i < 8; i++) p.push([box(.18, .12, .1), 0x5a8a2a, -1.4 + i * .4, FY + 1.06, BZ]);
        return p;
      },
      tea: () => {   // dried Shan tea leaf heaped on wide trays, a row of tea packets, baskets of leaf on the shelf
        const p = [];
        [-1.1, 0, 1.1].forEach(x => p.push([cyl(.42, .38, .05, 10), 0xc8a868, x, CT + .025, CZ], [new THREE.ConeGeometry(.34, .18, 7), pk([0x4a5a2a, 0x5a4a26, 0x3a4a22]), x, CT + .14, CZ]));
        for (let i = 0; i < 10; i++) p.push([box(.12, .18, .08), pk([0x2a7a3a, 0xc8302a, 0xe8c040]), -1.6 + i * .35, FY + 1.1, BZ]);
        [-1, 0, 1].forEach(x => p.push([cyl(.22, .17, .4, 9), 0xc8a868, x, FY + 1.62, BZ], [ball(.18, .5), 0x4a5a2a, x, FY + 1.85, BZ]));
        return p;
      },
      fruit: () => {   // mandarins, limes and tamarind heaped on trays, a crate of mandarins on the floor
        const p = [];
        [-1.2, -.4, .4, 1.2].forEach(x => { const c = pk([0xf08a1c, 0xf08a1c, 0x8ab83a, 0x8a6a3a]); p.push([cyl(.34, .3, .05, 10), 0xc8a868, x, CT + .025, CZ]); for (let k = 0; k < 3; k++) for (let i = 0; i < 3 - k; i++) for (let j = 0; j < 3 - k; j++) p.push([ball(.07), c, x + (i - (2 - k) / 2) * .13, CT + .1 + k * .1, CZ + (j - (2 - k) / 2) * .13]); });
        p.push([box(.6, .35, .45), 0x8a6a3a, -1.3, FY + .18, BZ + .3]);
        return p;
      },
      cloth: () => {   // stacks of woven Shan cloth on the counter, striped shoulder bags and longyi lengths hung on the back wall
        const p = [], C = [0xc8302a, 0xe8822a, 0xe8c040, 0x2a7a5a, 0x2a4a9a, 0x7a2a6a, 0xd84a7a, 0x3a9ac0];
        for (let i = 0; i < 5; i++) { let y = CT; for (let k = 0; k < 3 + (i % 3); k++) { p.push([box(.5, .07, .4), pk(C), -1.4 + i * .7, y + .035, CZ]); y += .07; } }
        for (let i = 0; i < 6; i++) { const x = -1.5 + i * .6, c = pk(C); p.push([box(.36, .4, .06), c, x, FY + 1.5, BZ - .05], [box(.37, .06, .062), 0xf0ece0, x, FY + 1.5, BZ - .05], [box(.03, .4, .02), c, x, FY + 1.88, BZ - .05]); }
        return p;
      },
      toys: () => {   // little paper balloons hung from the awning in gores of colour, pinwheels in a bamboo stand, tin toys on the counter
        const p = [];
        for (let i = 0; i < 6; i++) { const x = -1.6 + i * .64, c = pk([0xd8282a, 0x1e4fa8, 0xf4c430, 0x7a1e6a, 0x1f7a3a]), y = EH - .85 - (i % 2) * .2; p.push([ball(.2, 1.3), c, x, y, D / 2 + .55], [box(.01, .4, .01), 0xf0ece0, x, y + .45, D / 2 + .55]); }
        p.push([cyl(.08, .08, .5), 0xc8a868, 1.1, CT + .25, CZ]);
        for (let i = 0; i < 5; i++) p.push([box(.02, .5, .02), 0xc8a868, 1.1 + Math.cos(i * 1.3) * .08, CT + .6, CZ + Math.sin(i * 1.3) * .08], [box(.22, .22, .02), pk([0xd8282a, 0xf4c430, 0x2a8ac0]), 1.1 + Math.cos(i * 1.3) * .08, CT + .9, CZ + Math.sin(i * 1.3) * .08]);
        for (let i = 0; i < 4; i++) p.push([box(.22, .14, .14), pk([0xd8282a, 0x2a8ac0, 0xe8c040]), -1.2 + i * .45, CT + .07, CZ]);
        return p;
      }
    };
    const ORDER = ["noodles", "cakes", "toys", "tea", "fruit", "cloth", "noodles", "toys"];
    let n = 0;
    const lamps = [];   // the front lantern of each shop (hill frame), for the strings across the lane
    Z.rows.forEach(([rr, count], row) => {
      const step = (W + Z.gap) / rr;
      for (let i = 0; i < count; i++, n++) {
        const a = a0 + (W / 2 + .3) / rr + i * step + (row ? step / 2 : 0), [x, z] = at(a, rr), kind = ORDER[(n * 3 + row) % ORDER.length];
        const S = new THREE.Group(); S.position.set(x, y0, z); S.rotation.y = row ? -a : Math.PI - a; P.add(S);   // the inner row faces out down the hill, the outer row in
        const lp = shanStall(S, { W, D, FY, EH, n, r, data, front: kind === "noodles" ? 1.15 : .1, lamp: (i % 2 ? -1 : 1) * .9 });
        stallGoods(goods, S, KINDS[kind]());   // the goods go into the market's one mesh, in the hill frame
        const lw = lp.applyMatrix4(S.matrix); lamps[row] = lamps[row] || []; lamps[row].push({ a, p: lw });
      }
    });
    const gm = mesh(lowPoly(goods), std({ vertexColors: true, flatShading: true, roughness: .8 }), 0, 0, 0, H); gm.castShadow = false; gm.receiveShadow = true;
    clickable(list, gm, data);
    // strings of paper lanterns across the lane, from each inner shop's lantern to the outer shop nearest it
    const wireM = std({ color: 0x222222, roughness: 1 });
    lamps[0].forEach(({ a, p }, i) => {
      if (i % 2) return;
      const q = lamps[1].reduce((b, o) => Math.abs(o.a - a) < Math.abs(b.a - a) ? o : b).p, len = p.distanceTo(q);
      const w = mesh(cyl(.01, .01, len, 3), wireM, (p.x + q.x) / 2, (p.y + q.y) / 2 + .35, (p.z + q.z) / 2, H); w.castShadow = false;
      w.lookAt(H.localToWorld(V(q.x, q.y + .35, q.z))); w.rotateX(Math.PI / 2);
      for (let k = 1; k < 7; k++) { const u = k / 7, s = Math.sin(u * Math.PI) * .45, b = lanternGlow([0xffc050, 0xff6a3a, 0xffe08a][k % 3], .55, .9); b.position.set(p.x + (q.x - p.x) * u, p.y + .35 + (q.y - p.y) * u - s, p.z + (q.z - p.z) * u); H.add(b); }
    });
    // the gateway at the balloon ground's end: two bamboo posts over the lane, a crossbar, and the market's board in Shan and English
    {
      const a = a0 - .015, [x, z] = at(a, (Z.lane[0] + Z.lane[1]) / 2), half = (Z.lane[1] - Z.lane[0]) / 2, GW = new THREE.Group();
      GW.position.set(x, y0, z); GW.rotation.y = Math.PI / 2 - a; H.add(GW);   // local x runs across the lane, out from the hill; the board faces along it
      [-1, 1].forEach(sd => { mesh(cyl(.13, .15, 4.6), bamboo, sd * half, 2.3, 0, GW); sCircle(GW, sd * half, 0, .2); mesh(G_.fin, M.gold, sd * half, 4.85, 0, GW); });
      mesh(cyl(.09, .09, half * 2 + .6), bamboo, 0, 4.2, 0, GW).rotation.z = Math.PI / 2;
      const face = shanBoardFace("ၵၢတ်ႇပွႆး", "Festival Market"), BW = 3.4, BH = BW * 300 / 1024;
      clickable(list, mesh(new THREE.BoxGeometry(BW, BH, .08), [M.lacquer, M.lacquer, M.lacquer, M.lacquer, face, face], 0, 3.55, 0, GW), data);
      [-1, 1].forEach(sd => { mesh(G_.lamp, paper[0], sd * (half - .5), 3.75, .1, GW).castShadow = false; const gl = lanternGlow(0xffb060, 1.2, .9); gl.position.set(sd * (half - .5), 3.75, .1); GW.add(gl); });
    }
    bakeParts(P);
  }
