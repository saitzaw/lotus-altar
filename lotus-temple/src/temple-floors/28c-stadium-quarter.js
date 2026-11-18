  /* ---------- the stadium quarter: a newer part of town beside the township football ground, along Stadium Road
     (အားကစားကွင်းလမ်း), an avenue joined to both main roads: at its south end a link road along the stadium's back wall runs
     east to the road up to the hospital (the front street's west arm), and at its north end it meets the Hluttaw road, carried on
     west to it. Modern concrete and glass, never more than six storeys: offices of local companies and apartment blocks on the
     west side; on the east, restaurants with pavement tables backing onto the stadium wall, futsal and basketball courts, a
     footpath to the stupa hill's west stair, a sports hall, a public pool, a park with a playground and more flats; flats over
     shops across the Hluttaw road. The companies and their names are made up ---------- */
  // x: the avenue's centre line, w: its carriageway, pave: its pavements; it runs z0…z1 (z1: the Hluttaw road's south edge).
  // link: the link road's carriageway (z), east: where it meets the hospital road (x). path: the footpath to the hill's west stair
  const SQ = { x: -200, w: 8, pave: 2.5, z0: -5, z1: 255.5, link: [-5, 1], east: -128, path: 103, crossings: [103, 34], FH: 3.4, maxFloors: 6 };   // maxFloors: the quarter's height limit
  function stadiumQuarter(g) {
    const r = rng(7313);
    // one unit box, cylinder, crown and cone, scaled for every piece, so the whole quarter bakes into a few instanced meshes
    const UB = new THREE.BoxGeometry(1, 1, 1), UC = new THREE.CylinderGeometry(1, 1, 1, 10), UI = new THREE.IcosahedronGeometry(1, 0), UK = new THREE.ConeGeometry(1, 1, 8);
    const bx = (mat, x, y, z, w, h, d, p) => { const o = part(UB, mat, x, y, z, p); o.scale.set(w, h, d); return o; };
    const cy = (mat, x, y, z, rad, h, p) => { const o = part(UC, mat, x, y, z, p); o.scale.set(rad, h, rad); return o; };
    const asphalt = std({ color: 0x2c2c2e, roughness: .95 }), paving = std({ color: 0x9a948a, roughness: .9 }), kerbM = std({ color: 0xb0aca2, roughness: .8 });
    const paint = std({ color: 0xe8e4d8, roughness: .8 }), white = std({ color: 0xf4f4ee, roughness: .7 }), alu = std({ color: 0xc4c8cc, roughness: .35, metalness: .6 });
    const acM = std({ color: 0xe6e6e0, roughness: .6 }), tankM = std({ color: 0x2f6fb0, roughness: .5 }), wood = std({ color: 0x8a5a34, roughness: .8 });
    const curtain = std({ color: 0x35586a, roughness: .12, metalness: .5, emissive: 0xffe6c0, emissiveIntensity: 0 });   // the office blocks' glass skin, lit at night
    onDaylight(d => { curtain.emissiveIntensity = .55 * (1 - d) + .02; });
    const WALL = [0xd8d4cc, 0x8e8678, 0xc09a5c, 0x8e4028, 0x3e4a54, 0x98c0a4, 0xd09870].map(c => std({ color: c, roughness: .85 }));   // white, warm grey, sand, brick, slate, mint, peach
    const AWN = [0xc0392b, 0x2e7d4f, 0xe0a020, 0x2f5f9a, 0x8a3a6a].map(c => std({ color: c, roughness: .8 }));
    const lampHead = std({ color: 0xf8f4e8, emissive: 0xfff2d0, emissiveIntensity: 1 });
    onDaylight(d => { lampHead.emissiveIntensity = 1 - .85 * d; });

    // a modern building in local coordinates, front facing +z: W wide, D deep, `floors` storeys (six at most). kind: "glass" (a
    // glass skin with aluminium fins), "office" (a band of glass round every floor) or "flats" (balconies across the front, an
    // air-conditioner on every other one, windows behind); `shops`: glass shop fronts under awnings on the ground floor; on top a
    // parapet, the stair and lift housing and blue water tanks, or a corrugated hip roof (`hip`)
    function block(x, z, ry, o) {
      const { W, D, wall = WALL[0], trim = concrete, kind = "office", data } = o, FH = SQ.FH, floors = Math.min(o.floors, SQ.maxFloors), H = floors * FH, top = .3 + H;
      const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
      bx(concrete, 0, .15, 0, W + .8, .3, D + .8, h);   // the plinth
      const body = mesh(new THREE.BoxGeometry(W, H, D), wall, 0, .3 + H / 2, 0, h);
      if (data) clickable(picks.pagoda, body, data);
      sRect(h, -W / 2 - .4, W / 2 + .4, -D / 2 - .4, D / 2 + .4);
      const win = kind === "flats" ? houseGlass : townGlass;
      for (let f = 0; f < floors; f++) {
        const y0 = .3 + f * FH, shopFloor = f === 0 && o.shops;
        if (f > 0) bx(trim, 0, y0, 0, W + .16, .24, D + .16, h);   // the band at each floor
        if (kind === "glass" || kind === "office") {
          const gh = kind === "glass" ? FH - .5 : 1.5, gy = kind === "glass" ? y0 + FH / 2 : y0 + 1.8, m = kind === "glass" ? curtain : townGlass;
          if (!shopFloor) bx(m, 0, gy, D / 2, W - .6, gh, .12, h);
          bx(m, 0, gy, -D / 2, W - .6, gh, .12, h);
          [-1, 1].forEach(s => bx(m, s * W / 2, gy, 0, .12, gh, D - .6, h));
        } else {
          // the flats: balconies across the front, each with a glass door and a window, a solid parapet, an air-conditioner on
          // every other one; plain windows on the back and the ends
          const n = Math.max(2, Math.round(W / 4)), bw = W / n;
          if (!shopFloor) for (let i = 0; i < n; i++) {
            const px = -W / 2 + bw * (i + .5);
            bx(win, px - bw * .18, y0 + 1.35, D / 2, bw * .4, 2.2, .1, h);
            bx(win, px + bw * .22, y0 + 1.6, D / 2, bw * .3, 1.3, .1, h);
            if (f === 0) continue;
            bx(concrete, px, y0 + .05, D / 2 + .65, bw - .2, .16, 1.3, h);
            bx(o.accent || trim, px, y0 + .6, D / 2 + 1.27, bw - .2, .95, .08, h);
            if ((i + f) % 2) bx(acM, px + bw * .28, y0 + .45, D / 2 + .35, .8, .55, .3, h);
          }
          const nb = Math.max(1, Math.floor((W - 1) / 3)), ne = Math.max(1, Math.floor((D - 1) / 3));
          for (let i = 0; i < nb; i++) bx(win, -W / 2 + W * (i + .5) / nb, y0 + 1.7, -D / 2, 1.2, 1.4, .1, h);
          for (let i = 0; i < ne; i++) [-1, 1].forEach(s => bx(win, s * W / 2, y0 + 1.7, -D / 2 + D * (i + .5) / ne, .1, 1.4, 1.2, h));
        }
        if (shopFloor) {
          // glass shop fronts between pilasters, a fascia, and an awning over each
          const n = Math.max(1, Math.round(W / 5)), bw = W / n;
          bx(townGlass, 0, .3 + 1.45, D / 2, W - .4, 2.7, .12, h);
          bx(o.fascia || trim, 0, .3 + 3.05, D / 2 + .1, W + .1, .5, .3, h);
          for (let i = 0; i <= n; i++) bx(wall, -W / 2 + .2 + i * (W - .4) / n, .3 + 1.45, D / 2 + .05, .4, 2.9, .24, h);
          for (let i = 0; i < n; i++) bx(o.awn || AWN[(i + (o.seed || 0)) % AWN.length], -W / 2 + bw * (i + .5), 2.75, D / 2 + .8, bw - .3, .06, 1.5, h).rotation.x = .3;
        }
      }
      if (fglass(kind) && !o.shops) {   // the entrance: a steel canopy on two posts
        bx(alu, 0, 3.25, D / 2 + 1.6, 5, .2, 3.2, h);
        [-1, 1].forEach(s => { cy(steel, s * 2.3, 1.6, D / 2 + 3, .07, 3.2, h); sCircle(h, s * 2.3, D / 2 + 3, .1); });
      }
      if (kind === "glass") for (let i = 0; i <= Math.round(W / 1.6); i++) [-1, 1].forEach(s => bx(alu, -W / 2 + .3 + i * (W - .6) / Math.round(W / 1.6), .3 + H / 2, s * (D / 2 + .1), .08, H, .26, h));
      if (o.hip) {
        const a = Math.max(W, D) / 2 + .7, b = Math.min(W, D) / 2 + .7, rf = tinHipRoof(a, b, b * .4, o.hip);
        rf.position.y = top + .1; if (D > W) rf.rotation.y = Math.PI / 2; rf.castShadow = rf.receiveShadow = true; h.add(rf);
        bx(trim, 0, top + .05, 0, W + .3, .2, D + .3, h);
      } else {
        // the parapet, the stair and lift housing, water tanks on a steel stand
        [[0, -D / 2, W, .25], [0, D / 2, W, .25], [-W / 2, 0, .25, D], [W / 2, 0, .25, D]].forEach(([px, pz, w, d]) => bx(trim, px, top + .45, pz, w, .9, d, h));
        bx(wall, -W / 4, top + 1.4, -D / 6, Math.min(5, W / 3), 2.8, Math.min(4, D / 2.5), h);
        bx(steel, W / 4, top + .45, -D / 5, 3, .9, 1.6, h);
        [-.7, .7].forEach(dx => cy(tankM, W / 4 + dx, top + 1.6, -D / 5, .6, 1.4, h));
      }
      // the sign: on the parapet, over the shop fronts, or over flats' shops in front of the first-floor balconies
      if (o.sign) { const [my, en, bg, fg, w = Math.min(W - 1, 9)] = o.sign, flatsShop = o.shops && kind === "flats", sb = civicSign(h, my, en, bg, fg, flatsShop ? Math.min(w, 4.5) : w, 0, flatsShop ? 3.55 : o.shops ? 4.05 : top - FH / 2, D / 2 + (flatsShop ? 1.4 : .3)); if (data) clickable(picks.pagoda, sb, data); }
      const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), ex = c * W / 2 + s * D / 2 + 1, ez = s * W / 2 + c * D / 2 + 1;
      TALL.push({ x0: x - ex, x1: x + ex, z0: z - ez, z1: z + ez, h: top + (o.hip ? Math.min(W, D) * .2 + 1 : 3) });
      return { h, top, W, D };
    }
    function fglass(kind) { return kind === "glass" || kind === "office"; }
    // a street tree on the pavement: a trunk and three low-poly crowns
    function streetTree(x, z, s = 1) {
      cy(bark, x, 1.3 * s, z, .12 * s, 2.6 * s, g); sCircle(g, x, z, .25);
      for (let k = 0; k < 3; k++) {
        const a = r() * TAU, o = part(UI, leafMats[(k + ((r() * 4) | 0)) % 4], x + Math.cos(a) * .5 * s, (3 + k * .45 + r() * .3) * s, z + Math.sin(a) * .5 * s, g);
        o.scale.setScalar((1.25 - k * .2 + r() * .2) * s);
      }
    }
    // tables under umbrellas, in a parent's local frame along x at z
    function tables(p, xs, z, seed) {
      xs.forEach((tx, i) => {
        cy(wood, tx, .74, z, .45, .05, p); cy(steel, tx, .37, z, .04, .74, p); cy(steel, tx, 1.25, z, .03, 2.5, p);
        const um = part(UK, AWN[(i + seed) % AWN.length], tx, 2.45, z, p); um.scale.set(1.3, .45, 1.3);
        [[-.7, 0], [.7, 0], [0, -.7], [0, .7]].forEach(([dx, dz]) => bx(steel, tx + dx, .45, z + dz, .4, .06, .4, p));
        sCircle(p, tx, z, .8);
      });
    }
    // a chain-link fence on steel posts from (x0, z0) to (x1, z1), along x or z, H high
    const chainTex = canvasTex(64, (c, sz) => { c.clearRect(0, 0, sz, sz); c.strokeStyle = "#d4d8dc"; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(sz, sz); c.moveTo(sz, 0); c.lineTo(0, sz); c.stroke(); });
    chainTex.wrapS = chainTex.wrapT = THREE.RepeatWrapping; chainTex.repeat.set(8, 8);
    const chain = std({ map: chainTex, alphaTest: .4, roughness: .5, metalness: .4, side: THREE.DoubleSide }), panel = new THREE.PlaneGeometry(3, 3);
    function fence(x0, z0, x1, z1, H = 3) {
      const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(len / 3)), alongX = z0 === z1;
      for (let i = 0; i <= n; i++) cy(steel, x0 + (x1 - x0) * i / n, H / 2, z0 + (z1 - z0) * i / n, .05, H, g);
      for (let i = 0; i < n; i++) {
        const p = flat(part(panel, chain, x0 + (x1 - x0) * (i + .5) / n, H / 2, z0 + (z1 - z0) * (i + .5) / n, g));
        p.scale.set(len / n / 3, H / 3, 1); if (!alongX) p.rotation.y = Math.PI / 2;
      }
      bx(steel, (x0 + x1) / 2, H, (z0 + z1) / 2, alongX ? len : .05, .05, alongX ? .05 : len, g);
      sWall(g, Math.min(x0, x1) - .03, Math.max(x0, x1) + .03, Math.min(z0, z1) - .03, Math.max(z0, z1) + .03);
    }
    // a floodlight mast: a steel pole and a bank of lamps on top facing `ry`
    function floodlight(x, z, ry, H = 10) {
      cy(steel, x, H / 2, z, .1, H, g); sCircle(g, x, z, .15);
      const hd = bx(lampHead, x, H + .2, z, 1.4, .5, .25, g); hd.rotation.y = ry;
    }

    /* the roads: the avenue and the link road, asphalt with a dashed centre line between kerbed pavements */
    const X0 = SQ.x - SQ.w / 2, X1 = SQ.x + SQ.w / 2, [L0, L1] = SQ.link, P = SQ.pave, clear = (v, list, d) => list.every(c => Math.abs(v - c) > d);
    flat(bx(asphalt, SQ.x, .03, (SQ.z0 + SQ.z1) / 2, SQ.w, .04, SQ.z1 - SQ.z0, g));
    flat(bx(asphalt, (X1 + SQ.east) / 2, .03, (L0 + L1) / 2, SQ.east - X1, .04, L1 - L0, g));
    for (let z = SQ.z0 + 9; z < SQ.z1 - 3; z += 6) if (clear(z, SQ.crossings, 3)) flat(bx(paint, SQ.x, .06, z, .14, .02, 2.4, g));
    for (let x = X1 + 3; x < SQ.east - 3; x += 6) flat(bx(paint, x, .06, (L0 + L1) / 2, 2.4, .02, .14, g));
    // zebra crossings, and give-way lines where the avenue meets the Hluttaw road and the link road meets the hospital road
    SQ.crossings.forEach(z => { for (let i = 0; i < 7; i++) flat(bx(paint, X0 + .6 + i * (SQ.w - 1.2) / 6, .06, z, .5, .02, 3, g)); });
    flat(bx(paint, SQ.x - SQ.w / 4, .06, SQ.z1 - .6, SQ.w / 2 - .2, .02, .25, g));
    flat(bx(paint, SQ.east - .6, .06, (L0 + 3 * L1) / 4, .25, .02, (L1 - L0) / 2 - .2, g));
    const pave = (x0, x1, z0, z1) => bx(paving, (x0 + x1) / 2, .09, (z0 + z1) / 2, x1 - x0, .18, z1 - z0, g);
    const kerb = (x0, x1, z0, z1) => bx(kerbM, (x0 + x1) / 2, .1, (z0 + z1) / 2, Math.max(x1 - x0, .14), .2, Math.max(z1 - z0, .14), g);
    pave(X0 - P, X0, L0 - 2.2, SQ.z1); pave(X0, SQ.east, L0 - 2.2, L0);          // the west side, round the corner along the link road's south side
    pave(X1, X1 + P, L1, SQ.z1); pave(X1 + P, SQ.east, L1, L1 + 2.4);            // the east side, and the link road's stadium side
    kerb(X0, X0, L0, SQ.z1); kerb(X1, X1, L1, SQ.z1); kerb(X0, SQ.east, L0, L0); kerb(X1, SQ.east, L1, L1);
    // street lights on alternate sides, their arms out over the road, and street trees between them
    for (let z = SQ.z0 + 10, i = 0; z < SQ.z1 - 6; z += 20, i++) {
      if (!clear(z, SQ.crossings, 4)) continue;
      if (i % 2) streetLight(g, X1 + .5, z, 0); else streetLight(g, X0 - .5, z, Math.PI);
      if (clear(z + 10, SQ.crossings, 4) && z + 10 < SQ.z1 - 4) { streetTree(X0 - 1.6, z + 10, .8 + r() * .2); streetTree(X1 + 1.6, z + 10, .8 + r() * .2); }
    }
    for (let x = X1 + 12; x < SQ.east - 6; x += 22) streetLight(g, x, L0 - 1.1, Math.PI / 2);
    // the road's name, at both ends
    const ROAD = { tip: "Stadium Road · အားကစားကွင်းလမ်း", toast: "Stadium Road (အားကစားကွင်းလမ်း): the newer quarter's avenue, from the road up to the hospital round the back of the township football ground and north past the stupa hill's west foot to the Hluttaw road. Its offices, restaurants and flats are all of concrete and glass, and none stands higher than six storeys." };
    postSign(g, "အားကစားကွင်းလမ်း", "Stadium Road", "#1f5a8a", "#ffffff", 3.4, X1 + 1.8, SQ.z1 - 3, 0, ROAD);
    postSign(g, "အားကစားကွင်းလမ်း", "Stadium Road", "#1f5a8a", "#ffffff", 3.4, SQ.east - 2.5, L1 + 1.6, Math.PI / 2, ROAD);

    /* the west side: the companies' offices toward the stadium, then the apartment blocks; fronts at x −207.5, facing the avenue */
    const FX = X0 - P - 1, W90 = Math.PI / 2;
    const west = (z0, W, D, o) => block(FX - D / 2, z0 + W / 2, W90, { W, D, ...o });
    west(2, 26, 20, { floors: 6, kind: "glass", wall: WALL[4], sign: ["စီးပွားရေးစင်တာ", "Stadium Road Business Centre", "#20323e", "#ffffff"],
      data: { tip: "The business centre · စီးပွားရေးစင်တာ", toast: "Stadium Road Business Centre: six storeys of offices behind a glass skin, as high as the quarter's rules allow. A bank branch and a mobile-money agent take the ground floor; trading firms, a lawyer and an aid agency's office fill the floors above." } });
    const tel = west(32, 20, 18, { floors: 5, kind: "office", wall: WALL[0], trim: WALL[4], sign: ["ဆက်သွယ်ရေး ကုမ္ပဏီ", "Valley Telecom Co., Ltd.", "#0f6a8a", "#ffffff"],
      data: { tip: "Valley Telecom · ဆက်သွယ်ရေး ကုမ္ပဏီ", toast: "Valley Telecom (a made-up firm): the township office of a mobile and internet company, with its relay mast on the roof. Downstairs a counter sells SIM cards and top-ups; the engineers who keep the hill villages' towers running work upstairs." } });
    // the relay mast on its roof: four steel legs braced at every level, dish and panel antennas, a red light on top
    (() => {
      const { h, top } = tel, MH = 14, y0 = top + .1;
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => bx(steel, sx * .7, y0 + MH / 2, -2 + sz * .7, .1, MH, .1, h));
      for (let y = 2; y <= MH; y += 2) bx(steel, 0, y0 + y, -2, 1.5, .06, 1.5, h);
      [0, 1, 2].forEach(k => { const a = k * TAU / 3, d = bx(acM, Math.sin(a) * .9, y0 + MH - 1, -2 + Math.cos(a) * .9, .35, 1.8, .14, h); d.rotation.y = a; });
      [0, Math.PI].forEach((a, k) => { const d = part(UC, acM, Math.sin(a) * .85, y0 + MH - 4 - k * 2, -2 + Math.cos(a) * .85, h); d.scale.set(.45, .12, .45); d.rotation.x = Math.PI / 2; d.rotation.y = a; });
      const red = std({ color: 0xff3020, emissive: 0xff2010, emissiveIntensity: 1 }); onDaylight(d => { red.emissiveIntensity = 1.4 - d; });
      mesh(new THREE.SphereGeometry(.18, 8, 6), red, 0, y0 + MH + .2, -2, h);
    })();
    west(58, 20, 16, { floors: 4, kind: "office", wall: WALL[2], trim: WALL[0], sign: ["လက်ဖက် ကုမ္ပဏီ", "Highland Leaf Tea Co., Ltd.", "#2e6b3a", "#fff6d8"],
      data: { tip: "Highland Leaf Tea · လက်ဖက် ကုမ္ပဏီ", toast: "Highland Leaf Tea (a made-up firm) buys green tea and pickled tea leaf, လက်ဖက်, from the hill villages after each picking, grades and packs it here and trucks it down to Lashio and Mandalay. The tasting room on the ground floor smells of it." } });
    west(84, 18, 16, { floors: 3, kind: "office", wall: WALL[1], trim: WALL[0], sign: ["ကုန်စည်ပို့ဆောင်ရေး ကုမ္ပဏီ", "Northern Shan Logistics", "#8a3a1e", "#ffffff"],
      data: { tip: "Northern Shan Logistics · ကုန်စည်ပို့ဆောင်ရေး ကုမ္ပဏီ", toast: "Northern Shan Logistics (a made-up firm): a haulage and freight agent. Its trucks load tea, maize and watermelons here and leave before dawn for the border trade at Muse; the dispatch office upstairs never quite closes." } });
    vehicle(g, FX - 7, 106.5, W90, { L: 7.6, W: 2.4, H: 3.2, cabL: 2.2, body: WALL[0], stripe: AWN[0], beacons: 0 });   // one of its trucks, in the yard
    flat(bx(paving, FX - 8, .03, 106.5, 16, .04, 5, g));
    west(110, 24, 16, { floors: 2, kind: "office", wall: WALL[0], trim: AWN[0], shops: true, fascia: AWN[0], awn: AWN[0], sign: ["တရုတ်စားသောက်ဆိုင်", "Golden Bowl Chinese Restaurant", "#a8201a", "#ffd870", 8],
      data: { tip: "Golden Bowl Chinese Restaurant · တရုတ်စားသောက်ဆိုင်", toast: "Golden Bowl (a made-up restaurant): round tables with lazy Susans for wedding parties and family dinners, steamed fish, roast duck and Yunnan ham, and a private room upstairs for the businessmen across the road." } });
    // red lanterns along its front
    const lantern = std({ color: 0xd02018, emissive: 0xff3010, emissiveIntensity: .2, roughness: .6 }); onDaylight(d => { lantern.emissiveIntensity = .2 + .8 * (1 - d); });
    for (let z = 112; z <= 132; z += 4) { const o = part(UI, lantern, FX + 1.6, 3.6, z, g); o.scale.set(.35, .42, .35); }
    const FLATS = { tip: "Apartments · တိုက်ခန်းအိမ်ရာ", toast: "A block of flats (တိုက်ခန်းအိမ်ရာ), five or six storeys and no higher: two- and three-room flats with a balcony each, air-conditioners and potted chillies on the balconies, the water tanks on the roof filled from the town main at night. Young families and teachers live here; there are shops on the ground floor." };
    [[140, 6, 0, 1], [168, 5, 6, 3], [196, 6, 2, 0], [224, 5, 0, 4]].forEach(([z0, fl, w, a], i) => west(z0, 22, 16, { floors: fl, kind: "flats", wall: WALL[w], accent: WALL[a], shops: i % 2 === 0, seed: i, data: FLATS }));

    /* the east side, behind the stadium: a row of restaurants facing the avenue, their backs to the stadium wall */
    const EX = X1 + P, E90 = -Math.PI / 2;
    const EATS = [
      ["ရှမ်းခေါက်ဆွဲ", "Shan Noodle House", "#c0392b", "#fff6e0", "Shan noodles (ရှမ်းခေါက်ဆွဲ) in clear broth or dry with tomato and minced pork, tofu noodles, pickled mustard greens on every table. It opens at six for breakfast and is full again after every match."],
      ["လက်ဖက်ရည်ဆိုင်", "Stadium Tea Shop", "#2e6b3a", "#fff6d8", "The tea shop (လက်ဖက်ရည်ဆိုင်): sweet milky tea, pickled tea leaf salad, samosas and steamed buns, low stools and a television on the wall. On match nights the whole terrace watches the football."],
      ["ဟော့ပေါ့", "Hot Pot Garden", "#a8201a", "#ffd870", "Hot pot (ဟော့ပေါ့): a pot of chilli or mushroom broth bubbling in the middle of each table, plates of meat, greens and noodles to cook in it. Busiest on cold winter evenings."],
      ["အကင်ဆိုင်", "BBQ & Beer", "#3a2a20", "#ffcf60", "The barbecue shop (အကင်ဆိုင်): skewers of pork, chicken, okra and tofu over charcoal at the door, cold beer, and long tables that fill up after the evening games."],
      ["ကော်ဖီဆိုင်", "Highland Coffee House", "#5a3a24", "#f4e8d0", "The coffee house (ကော်ဖီဆိုင်): coffee from the hills round the town, roasted on the premises, cakes and fruit juice; students from the high school and the nursing college study at its tables."]
    ];
    EATS.forEach(([my, en, bg, fg, toast], i) => {
      const W = 10, D = 7, data = { tip: `${en} · ${my}`, toast };
      const { h } = block(EX + 3 + D / 2, 11 + i * 12, E90, { W, D, floors: 2, kind: "office", wall: WALL[[0, 6, 2, 1, 5][i]], trim: WALL[0], shops: true, awn: AWN[i], fascia: AWN[i], sign: [my, en, bg, fg, 5.6], data });
      bx(paving, 0, .09, D / 2 + 1.5, W, .18, 3, h);   // the terrace
      tables(h, [-3.2, 0, 3.2], D / 2 + 1.6, i);
    });

    /* the courts: futsal and basketball inside a chain-link fence, with floodlights */
    const CZ0 = 75, CZ1 = 99, CX0 = -192, CM = -175.5, CX1 = -159;
    const courtLines = (x0, x1, z0, z1) => [[x0, x1, z0, z0], [x0, x1, z1, z1], [x0, x0, z0, z1], [x1, x1, z0, z1], [x0, x1, (z0 + z1) / 2, (z0 + z1) / 2]].forEach(([a, b, c, d]) => flat(bx(white, (a + b) / 2, .09, (c + d) / 2, Math.max(b - a, .1), .02, Math.max(d - c, .1), g)));
    flat(bx(std({ color: 0x8a8a84, roughness: .9 }), (CX0 + CX1) / 2, .02, (CZ0 + CZ1) / 2, CX1 - CX0, .04, CZ1 - CZ0, g));
    flat(bx(std({ color: 0x2a6a3a, roughness: .9 }), (CX0 + CM) / 2, .05, (CZ0 + CZ1) / 2, CM - CX0 - 2, .03, CZ1 - CZ0 - 2, g));
    flat(bx(std({ color: 0x20467a, roughness: .9 }), (CM + CX1) / 2, .05, (CZ0 + CZ1) / 2, CX1 - CM - 2, .03, CZ1 - CZ0 - 2, g));
    courtLines(CX0 + 1.5, CM - 1.5, CZ0 + 1.5, CZ1 - 1.5); courtLines(CM + 1.5, CX1 - 1.5, CZ0 + 1.5, CZ1 - 1.5);
    const fcx = (CX0 + CM) / 2, bcx = (CM + CX1) / 2, keyM = std({ color: 0xc0602a, roughness: .9 });
    [[CZ0 + 1.5, 1], [CZ1 - 1.5, -1]].forEach(([z, s]) => {
      // futsal: a goal 3 m by 2 m and a penalty box; basketball: the key and a hoop on a padded pole
      [-1.5, 1.5].forEach(dx => cy(white, fcx + dx, 1, z - s * .5, .05, 2, g)); bx(white, fcx, 2, z - s * .5, 3.1, .08, .08, g);
      [[fcx - 4, fcx - 4, z, z + s * 5], [fcx + 4, fcx + 4, z, z + s * 5], [fcx - 4, fcx + 4, z + s * 5, z + s * 5]].forEach(([a, b, c, d]) => flat(bx(white, (a + b) / 2, .09, (c + d) / 2, Math.max(b - a, .1), .02, Math.abs(d - c) || .1, g)));
      flat(bx(keyM, bcx, .075, z + s * 2.9, 4.9, .02, 5.8, g));
      cy(steel, bcx, 1.7, z - s * .6, .09, 3.4, g); bx(white, bcx, 3.35, z + s * .2, 1.8, 1.05, .06, g);
      const rim = mesh(new THREE.TorusGeometry(.23, .02, 6, 16), keyM, bcx, 3.05, z + s * .5, g); rim.rotation.x = Math.PI / 2;
      sCircle(g, bcx, z - s * .6, .2);
    });
    fence(CX0, CZ0, CX1, CZ0); fence(CX0, CZ1, CX1, CZ1); fence(CX1, CZ0, CX1, CZ1);
    fence(CX0, CZ0, CX0, 85); fence(CX0, 89, CX0, CZ1); fence(CM, CZ0, CM, 85); fence(CM, 89, CM, CZ1);   // gates from the avenue, and between the courts
    [[CX0 + .5, CZ0 + .5], [CX0 + .5, CZ1 - .5], [CX1 - .5, CZ0 + .5], [CX1 - .5, CZ1 - .5], [CM, CZ0 + .5], [CM, CZ1 - .5]].forEach(([x, z]) => floodlight(x, z, 0));
    const COURTS = { tip: "Futsal and basketball courts · ဘောလုံးကွင်းငယ်", toast: "Two floodlit courts behind a chain-link fence: a futsal pitch, booked by the hour by office teams after work, and a basketball court where the high school boys play until the lights go off at ten." };
    postSign(g, "ဘောလုံးကွင်းငယ်", "Futsal & Basketball", "#2e7d4f", "#ffffff", 3, X1 + P + .4, 83.5, -W90, COURTS);

    /* the footpath from the avenue to the foot of the stupa hill's west stair, paved and lit */
    const SX = -157;   // the west stair's apron ends about (−158, 102): MORE_STAIRS.west turned from the main stair, rBase + 4 out
    flat(bx(paving, (X1 + P + SX) / 2, .05, SQ.path, SX - X1 - P, .06, 4, g));
    [-185, -170].forEach(x => streetLight(g, x, SQ.path + 2.4, -W90));

    /* the sports hall: badminton, table tennis and chinlone under a blue tin roof */
    block(EX + 3 + 9, 120, E90, { W: 24, D: 18, floors: 2, kind: "office", wall: WALL[5], trim: WALL[0], hip: ROOFS[2](4), sign: ["အားကစားခန်းမ", "Township Sports Hall", "#2f5f9a", "#ffffff", 7],
      data: { tip: "The sports hall · အားကစားခန်းမ", toast: "The township sports hall: four badminton courts, table tennis in the gallery and a chinlone (ခြင်းလုံး) circle chalked in the corner, where men keep the rattan ball in the air with feet, knees and heads for as long as they can." } });

    /* the public pool: a six-lane pool on a tiled deck, loungers, the changing rooms along the far end, a fence with its gate on the avenue */
    const PX0 = -192, PX1 = -168, PZ0 = 136, PZ1 = 163, WX0 = -186, WX1 = -174, WZ0 = 140, WZ1 = 158;
    const deck = std({ color: 0xdcd6c8, roughness: .8 }), water = std({ color: 0x3fa8d8, roughness: .08, metalness: .1, emissive: 0x0a3048, emissiveIntensity: .3 });
    [[PX0, WX0, PZ0, PZ1], [WX1, PX1, PZ0, PZ1], [WX0, WX1, PZ0, WZ0], [WX0, WX1, WZ1, PZ1]].forEach(([a, b, c, d]) => flat(bx(deck, (a + b) / 2, .09, (c + d) / 2, b - a, .18, d - c, g)));
    flat(bx(water, (WX0 + WX1) / 2, .07, (WZ0 + WZ1) / 2, WX1 - WX0, .1, WZ1 - WZ0, g));
    [[WX0, WX1, WZ0, WZ0], [WX0, WX1, WZ1, WZ1], [WX0, WX0, WZ0, WZ1], [WX1, WX1, WZ0, WZ1]].forEach(([a, b, c, d]) => bx(white, (a + b) / 2, .2, (c + d) / 2, Math.max(b - a, .3) + .3, .08, Math.max(d - c, .3) + .3, g));   // the coping
    for (let i = 1; i < 6; i++) flat(bx(AWN[i % 2 ? 0 : 3], WX0 + i * 2, .14, (WZ0 + WZ1) / 2, .08, .06, WZ1 - WZ0 - .4, g));   // lane ropes
    sRect(g, WX0, WX1, WZ0, WZ1);
    for (let k = 0; k < 5; k++) { const z = 141 + k * 3.4; bx(white, -171, .45, z, 1.9, .12, .7, g); bx(white, -170.2, .7, z, .5, .5, .7, g).rotation.z = .5; sRect(g, -172, -170, z - .4, z + .4); }   // loungers
    const PLAY = { tip: "The public pool · ရေကူးကန်", toast: "The township's public pool: six lanes, cold in the cool season and crowded in the hot one. Swimming lessons for children on Saturday mornings; the lifeguard's whistle carries across the courts." };
    block(-180, 160.8, Math.PI, { W: 22, D: 3.2, floors: 1, kind: "office", wall: WALL[0], trim: AWN[3], data: PLAY });
    fence(PX0, PZ0, PX1, PZ0, 1.8); fence(PX1, PZ0, PX1, PZ1, 1.8); fence(PX0, PZ1, PX1, PZ1, 1.8); fence(PX0, PZ0, PX0, 145.5, 1.8); fence(PX0, 149.5, PX0, PZ1, 1.8);
    postSign(g, "ရေကူးကန်", "Public Swimming Pool", "#2f6fb0", "#ffffff", 3, X1 + P + .4, 151.5, -W90, PLAY);

    /* the park: lawns, paths, shade trees and benches, a playground of slide, swings and see-saw */
    const KX0 = -192, KX1 = -164, KZ0 = 166, KZ1 = 202, kx = (KX0 + KX1) / 2, kz = (KZ0 + KZ1) / 2;
    const lawn = std({ color: 0x5a8a3a, roughness: 1 }); onDaylight(d => lawn.color.copy(lerpC(0x1e2e16, 0x5a8a3a, d)));
    flat(bx(lawn, kx, .03, kz, KX1 - KX0, .04, KZ1 - KZ0, g));
    flat(bx(paving, kx, .06, kz, KX1 - KX0, .03, 2.4, g)); flat(bx(paving, -180, .08, kz, 2.4, .03, KZ1 - KZ0, g));
    [[KX0 + 2, KZ0 + 2], [KX0 + 9, KZ0 + 1.8], [KX1 - 2, KZ0 + 2.5], [KX1 - 9, KZ0 + 2], [KX1 - 2, kz - 7], [KX1 - 2.5, kz + 7], [KX1 - 3, KZ1 - 2],
      [-170, KZ1 - 2.2], [KX0 + 2, kz - 8], [-174, kz - 6], [-186, kz - 7]].forEach(([x, z]) => streetTree(x, z, 1 + r() * .35));
    const bench = (x, z, ry) => { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = ry; g.add(b); bx(wood, 0, .45, 0, 1.6, .08, .45, b); bx(wood, 0, .75, -.22, 1.6, .4, .06, b); [-.7, .7].forEach(dx => bx(steel, dx, .22, 0, .08, .45, .4, b)); sRect(b, -.8, .8, -.25, .25); };
    [[-183, kz - 2], [-177, kz - 2], [-183, kz + 2, Math.PI], [-177, kz + 2, Math.PI], [-178, KZ0 + 6, W90], [-178, KZ1 - 6, W90]].forEach(([x, z, ry = 0]) => bench(x, z, ry));
    // the playground on a soft red mat
    const mat = std({ color: 0xb8503a, roughness: 1 }), ply = [AWN[2], AWN[3], AWN[0]];
    flat(bx(mat, -186, .08, 194, 10, .03, 10, g));
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => cy(ply[1], -189 + sx * .6, .8, 191 + sz * .6, .06, 1.6, g));   // the slide: a platform on four posts,
    bx(ply[0], -189, 1.6, 191, 1.4, .1, 1.4, g);
    const ch = bx(ply[2], -189, .85, 193.4, .7, .06, 3.4, g); ch.rotation.x = .5;                                                  // the chute,
    const ld = bx(steel, -189, .8, 189.6, .6, .06, 1.9, g); ld.rotation.x = -1.05;                                               // the ladder
    sRect(g, -190, -188, 189, 195);
    [-1, 1].forEach(s => [-1, 1].forEach(t => { const leg = bx(steel, -184 + s * 2, 1.15, 196 + t * .45, .07, 2.4, .07, g); leg.rotation.x = t * .2; }));   // the swings: two A-frames,
    bx(steel, -184, 2.3, 196, 4.2, .08, .08, g);
    [-1, 1].forEach(s => { bx(ply[0], -184 + s * .9, .5, 196, .5, .05, .25, g); [-.22, .22].forEach(d => bx(steel, -184 + s * .9 + d, 1.4, 196, .02, 1.8, .02, g)); });
    sRect(g, -186.2, -181.8, 195.3, 196.7);
    bx(steel, -184, .25, 191, .2, .5, .3, g); const sw = bx(ply[1], -184, .5, 191, 3.2, .08, .3, g); sw.rotation.z = .18;   // the see-saw
    const PARK = { tip: "Stadium Park · ပန်းခြံ", toast: "Stadium Park (ပန်းခြံ): lawns and shade trees between the pool and the flats, with a children's playground (ကလေးကစားကွင်း). Grandparents bring the little ones in the cool of the evening; couples sit on the benches after dark." };
    postSign(g, "ပန်းခြံ", "Stadium Park", "#2e7d4f", "#ffffff", 2.6, X1 + P + .4, kz + 4, -W90, PARK);
    clickable(picks.pagoda, ch, PARK);

    /* flats at the north end of the east side, and across the Hluttaw road, over shops */
    [[206, 6, 6, 3], [231, 5, 0, 4]].forEach(([z0, fl, w, a], i) => block(EX + 3 + 8, z0 + 10, E90, { W: 20, D: 16, floors: fl, kind: "flats", wall: WALL[w], accent: WALL[a], shops: i === 0, seed: i + 2, data: FLATS }));
    const SHOPS = [["ကုန်စုံဆိုင်", "Mini Mart", "#c0392b", "#ffffff"], ["ဆေးဆိုင်", "Pharmacy", "#2e7d4f", "#ffffff"], ["ဖုန်းဆိုင်", "Phones & Repairs", "#2f5f9a", "#ffffff"]];
    [-186, -164, -142].forEach((x, i) => block(x, 271, Math.PI, { W: 18, D: 14, floors: [5, 4, 5][i], kind: "flats", wall: WALL[[2, 0, 6][i]], accent: WALL[[0, 4, 1][i]], shops: true, seed: i + 1, sign: [...SHOPS[i], 6], data: FLATS }));
  }
