  /* ---------- the seven-day market east of the compound, as in the towns of Northern Shan State: rows of tarp-roofed stalls,
     tents for games of chance (dice), and an open-air opera stage with benches in front; bulbs strung overhead light up at night.
     Scenery only: nothing here takes bets or payment. */
  let fourTop = null, MARKET = null;
  const bellRingers = [];   // ringing the bell in the outdoor Bell Tower   // the four-animal top game in the market, and the market's bounds, once built
  function sevenDayMarket(g) {
    const list = picks.pagoda, X0 = 43, X1 = 104, Z0 = -14, Z1 = 47.4, r = rng(321);
    MARKET = { x0: X0, x1: X1, z0: Z0, z1: Z1, entry: [68, 45], look: [68, 30] };
    const data = { tip: "The seven-day market", toast: "Every seventh day the market comes to the temple's east side: farmers, traders and families from the villages around, stalls of food and cloth, dice games and an opera that plays into the night." };
    const earth = std({ color: 0x8a7a62, roughness: 1 });
    onDaylight(d => earth.color.copy(lerpC(0x3a3228, 0x4e4234, d)));
    clickable(list, flat(mesh(new THREE.BoxGeometry(X1 - X0, .06, Z1 - Z0), earth, (X0 + X1) / 2, .03, (Z0 + Z1) / 2, g)), { market: true, tip: "Walk into the seven-day market" });
    const bambooM = std({ color: 0xb8a060, roughness: .8 }), wood = std({ color: 0x7a5a3a, roughness: .7 }), steelM = std({ color: 0x5a5e62, roughness: .4, metalness: .7 });
    const TARPS = [0x2a6ac0, 0xe0702a, 0x2f8a4a, 0xc02a2a, 0xe8c030, 0x8a3ab0].map(c => std({ color: c, roughness: .7, side: THREE.DoubleSide }));
    const GOODS = [0xc8402e, 0xf0881c, 0x8ab83a, 0xe8d050, 0x6a4a2a, 0xf4f0e4, 0x3a6ac0, 0xd04a8a].map(c => std({ color: c, roughness: .6 }));
    const bulbs = [];
    const bulb = (x, y, z, col = 0xffe0a0) => { const b = glowSprite(col, .9, .8); b.material.fog = false; b.position.set(x, y, z); g.add(b); bulbs.push(b); };
    const string = (a, b, n, sag) => { for (let i = 0; i <= n; i++) { const t = i / n; bulb(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t - Math.sin(Math.PI * t) * sag, a.z + (b.z - a.z) * t, [0xffe0a0, 0xff9a6a, 0xa0d0ff, 0xb0ffb0][i % 4]); } };
    // stalls: bamboo poles, a sloping tarp, a table of goods; a few use a big umbrella instead
    function stall(x, z, face) {
      const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = face; g.add(s);
      sRect(s, -1.6, 1.6, -1.3, 1.3);
      const W = 3.0, D = 2.4, tarp = TARPS[(r() * TARPS.length) | 0];
      if (r() < .2) {   // umbrella stall
        mesh(new THREE.CylinderGeometry(.04, .04, 2.6, 6), steelM, 0, 1.3, -.2, s);
        const um = mesh(new THREE.ConeGeometry(1.7, .6, 8, 1, true), tarp, 0, 2.7, -.2, s); um.castShadow = false;
      } else {
        [[-W / 2, -D / 2, 2.5], [W / 2, -D / 2, 2.5], [-W / 2, D / 2, 2.0], [W / 2, D / 2, 2.0]].forEach(([px, pz, h]) => mesh(new THREE.CylinderGeometry(.05, .06, h, 6), bambooM, px, h / 2, pz, s));
        const t = mesh(new THREE.BoxGeometry(W + .4, .04, D + .6), tarp, 0, 2.28, 0, s); t.rotation.x = .2; t.castShadow = false;
      }
      mesh(new THREE.BoxGeometry(W - .3, .08, D - .9), wood, 0, .8, .2, s);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(.06, .8, .06), wood, a * (W / 2 - .3), .4, .2 + b * (D / 2 - .55), s));
      const kind = (r() * 4) | 0;
      for (let i = 0; i < 9; i++) {
        const gx = -W / 2 + .45 + (i % 5) * .5, gz = (i < 5 ? .0 : .45) + .1, m = GOODS[(r() * GOODS.length) | 0];
        if (kind === 0) mesh(new THREE.SphereGeometry(.13, 10, 8), m, gx, .97, gz, s);                                 // fruit and vegetables
        else if (kind === 1) { const b = mesh(new THREE.CylinderGeometry(.2, .15, .18, 10), bambooM, gx, .93, gz, s); mesh(new THREE.SphereGeometry(.15, 8, 6), m, gx, 1.02, gz, s); }   // baskets of beans and spices
        else if (kind === 2) mesh(new THREE.BoxGeometry(.4, .1 + r() * .15, .35), m, gx, .9, gz, s);                // folded cloth and longyi
        else mesh(new THREE.BoxGeometry(.3, .25, .25), m, gx, .97, gz, s);                                           // packets and household goods
      }
      for (let k = 0; k < 2; k++) mesh(new THREE.CylinderGeometry(.18, .16, .4, 10), GOODS[(r() * GOODS.length) | 0], -W / 2 + .4 + k * .45, .2, -D / 2 + .5, s);   // sacks on the ground
    }
    const AISLES = [52, 68, 84], ZS = [18.6, 22.4, 26.2, 30, 33.8, 37.6, 41.4];
    AISLES.forEach(ax => ZS.forEach(z => { stall(ax - 3.2, z, Math.PI / 2); stall(ax + 3.2, z, -Math.PI / 2); }));
    AISLES.forEach(ax => [0, 1].forEach(sd => string(V(ax - 3, 2.6, ZS[0] - 1.5 + sd * 0), V(ax + 3, 2.6, ZS[0] - 1.5), 6, .2)));
    AISLES.forEach(ax => string(V(ax, 3.4, ZS[0] - 1.5), V(ax, 3.4, 44), 14, .5));
    // the gambling hall (ကစားဝိုင်း) on the market's east edge: a closed hall of painted plank walls under a corrugated roof, a wide
    // doorway onto the aisles with the sign above it, shut by a pair of red doors with a young doorman in front who lets in only those
    // 21 and over; inside only the four-animal top (လေးကောင်ဂျင်) on its betting mat on a table, lit by bulbs
    const stool = std({ color: 0xc8302a, roughness: .5 }), stool2 = std({ color: 0x2a6ac0, roughness: .5 });
    const GX = 96, GZ = 8, GW = 12, GD = 14, GH = 3.6;   // centre, width (x), depth (z), wall height
    const tdata = { fourTop: true, tip: "လေးကောင်ဂျင် · the four-animal top · festival tokens, 21 and over" };
    const hall = new THREE.Group(); hall.position.set(GX, 0, GZ); g.add(hall);
    const TW0 = -1.45, TW1 = 2.35, TD = 1.45, TH = .78;                 // the table: x from TW0 to TW1 (the banker's end, where the cover rests), z ±TD, its top TH above the floor
    let doorOpen = false;
    sRect(hall, TW0, TW1, -TD, TD);                                     // the table
    sRect(hall, -GW / 2 - .3, -GW / 2 + .3, -2.0, 2.0, () => doorOpen ? .25 : null);   // the doors: shut until the doorman lets you in
    sRect(hall, -GW / 2, GW / 2, -GD / 2 - .1, -GD / 2 + .1); sRect(hall, -GW / 2, GW / 2, GD / 2 - .1, GD / 2 + .1);
    sRect(hall, GW / 2 - .1, GW / 2 + .1, -GD / 2, GD / 2);
    sRect(hall, -GW / 2 - .1, -GW / 2 + .1, -GD / 2, -2.0); sRect(hall, -GW / 2 - .1, -GW / 2 + .1, 2.0, GD / 2);   // the doorway is |z| < 2
    sRect(hall, -GW / 2 - .3, GW / 2 + .3, -GD / 2 - .3, GD / 2 + .3, .25);   // the floor slab
    const plankT = canvasTex(128, (c, sz) => { c.fillStyle = "#2f6a5a"; c.fillRect(0, 0, sz, sz); for (let y = 0; y < sz; y += 12) { c.fillStyle = "rgba(10,30,24,.5)"; c.fillRect(0, y, sz, 2); c.fillStyle = "rgba(160,210,190,.12)"; c.fillRect(0, y + 3, sz, 3); } });
    plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping; plankT.repeat.set(4, 1.5);
    const wallM = std({ map: plankT, roughness: .8, side: THREE.DoubleSide }), trimW = std({ color: 0xf2eee4, roughness: .7 });
    mesh(new THREE.BoxGeometry(GW + .6, .25, GD + .6), std({ color: 0x8a867e, roughness: .9 }), 0, .125, 0, hall);   // concrete floor slab
    flat(mesh(new THREE.PlaneGeometry(GW - .3, GD - .3), std({ color: 0x9a6a3a, roughness: .7 }), 0, .26, 0, hall)).rotation.x = -Math.PI / 2;   // a wooden floor inside
    const DOOR = 4.0;   // the doorway in the west wall, facing the aisles
    [[0, -GD / 2, GW, .2], [0, GD / 2, GW, .2], [GW / 2, 0, .2, GD]].forEach(([x, z, w, d]) => mesh(new THREE.BoxGeometry(w, GH, d), wallM, x, GH / 2 + .25, z, hall));
    [-1, 1].forEach(sd => { const len = (GD - DOOR) / 2; mesh(new THREE.BoxGeometry(.2, GH, len), wallM, -GW / 2, GH / 2 + .25, sd * (DOOR / 2 + len / 2), hall); });
    mesh(new THREE.BoxGeometry(.2, .9, DOOR), wallM, -GW / 2, GH - .2, 0, hall);   // over the doorway
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.28, GH, .28), trimW, -GW / 2, GH / 2 + .25, sd * DOOR / 2, hall));
    // the doors: two red plank leaves hung on the door posts, with raised panels, brass ring pulls and a notice; they swing inward
    const doorM = std({ color: 0x7a2a1e, roughness: .6 }), panelM = std({ color: 0x96382a, roughness: .55 }), brass = std({ color: 0xc8a050, roughness: .35, metalness: .7 });
    const LEAF = DOOR / 2 - .14, LH = 2.7;
    const leaves = [-1, 1].map(sd => {
      const hinge = new THREE.Group(); hinge.position.set(-GW / 2, .25, sd * (DOOR / 2 - .14)); hall.add(hinge);
      mesh(new THREE.BoxGeometry(.07, LH, LEAF), doorM, 0, LH / 2, -sd * LEAF / 2, hinge);
      [.65, 1.95].forEach(y => mesh(new THREE.BoxGeometry(.02, .95, LEAF - .36), panelM, -.045, y, -sd * LEAF / 2, hinge));
      const ring = mesh(new THREE.TorusGeometry(.06, .012, 6, 14), brass, -.06, 1.3, -sd * (LEAF - .14), hinge); ring.rotation.y = Math.PI / 2;
      return { hinge, sd };
    });
    const notice = writing(512, 200, (c, cw, ch) => {
      c.fillStyle = "#f4ecd8"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#b81c1c"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
      c.fillStyle = "#b81c1c"; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = '600 34px "Noto Sans Myanmar", "Myanmar Text", sans-serif'; c.fillText("အသက် ၂၁ နှစ်အောက် ဝင်ခွင့်မပြု", cw / 2, 76);
      c.font = '600 40px "Figtree", sans-serif'; c.fillText("Under 21 · no entry", cw / 2, 150);
    });
    if (document.fonts && document.fonts.load) document.fonts.load('600 34px "Noto Sans Myanmar"', "ဝင်ခွင့်").then(() => { notice.needsUpdate = true; }, () => {});
    const nb = flat(mesh(new THREE.PlaneGeometry(1.2, .47), std({ map: notice, roughness: .7 }), -.06, 1.75, LEAF / 2, leaves[0].hinge)); nb.rotation.y = -Math.PI / 2;
    // the doorman: a young man in a black jacket over a white T-shirt, jeans and trainers, standing in front of the doors with his arms
    // folded; tap him (or the hall) to show your age. One flat-shaded mesh, facing +z before it is turned to face the aisles
    const doormanParts = [];
    const dp = (w, h, d, col, x, y, z) => doormanParts.push([new THREE.BoxGeometry(w, h, d), col, x, y, z]);
    const SKIN_D = 0xc8946a, JACKET = 0x1e1e24, JEANS = 0x2a3a5a, HAIR_D = 0x16120f;
    [-1, 1].forEach(e => { dp(.12, .07, .27, 0xf0f0ec, e * .1, .035, .03); dp(.15, .86, .17, JEANS, e * .1, .5, 0); });   // white trainers, jeans
    dp(.38, .05, .22, 0x1a1a1a, 0, .93, 0);                                                                         // belt
    dp(.42, .56, .25, JACKET, 0, 1.23, 0); dp(.14, .5, .02, 0xf2f0ea, 0, 1.22, .126);                              // jacket, open over a white T-shirt
    [-1, 1].forEach(e => dp(.11, .32, .13, JACKET, e * .26, 1.33, .01));                                            // upper arms
    dp(.46, .1, .11, JACKET, 0, 1.15, .17); [-1, 1].forEach(e => dp(.08, .08, .09, SKIN_D, e * .19, 1.17, .21));    // arms folded across, the hands showing
    dp(.1, .08, .1, SKIN_D, 0, 1.55, 0); dp(.22, .27, .23, SKIN_D, 0, 1.71, 0);                                    // neck, head
    [-1, 1].forEach(e => { dp(.03, .06, .05, SKIN_D, e * .125, 1.71, 0); dp(.04, .035, .012, 0x2a1c18, e * .05, 1.73, .117); dp(.06, .015, .012, HAIR_D, e * .05, 1.775, .117); });   // ears, eyes, brows
    dp(.07, .014, .01, 0x8a3a30, 0, 1.635, .116);                                                                   // mouth
    dp(.24, .07, .25, HAIR_D, 0, 1.865, -.005); dp(.24, .2, .06, HAIR_D, 0, 1.75, -.105); dp(.22, .05, .04, HAIR_D, 0, 1.84, .1);   // short hair
    const dmGeo = lowPoly(doormanParts), dmCol = dmGeo.attributes.color;
    for (let i = 0; i < dmCol.array.length; i++) dmCol.array[i] = Math.pow(dmCol.array[i], 2.2);   // lowPoly reads the colours as linear
    const doorman = new THREE.Mesh(dmGeo, std({ vertexColors: true, flatShading: true, roughness: .85 }));
    doorman.castShadow = true; doorman.position.set(-GW / 2 - .8, 0, 0); doorman.rotation.y = -Math.PI / 2; hall.add(doorman);
    clickable(list, doorman, { fourTop: true, tip: "The doorman · 21 and over only" });
    // let the visitor in: the doorman steps aside and turns to the door, and the doors swing open (they stay open after that)
    const admit = () => {
      if (doorOpen) return 0;
      doorOpen = true;
      const d = reduceMotion ? .01 : 1.1, z0 = doorman.position.z, r0 = doorman.rotation.y;
      tween(d, t => { const e = easeOut(t); leaves.forEach(l => l.hinge.rotation.y = -l.sd * 1.5 * e); doorman.position.z = z0 + (-DOOR / 2 - .9 - z0) * e; doorman.rotation.y = r0 + .9 * e; });
      return d * 1000;
    };
    // windows with green shutters folded open, high on the side walls
    [-1, 1].forEach(sd => [-3.5, 0, 3.5].forEach(x => { mesh(new THREE.BoxGeometry(1.3, 1.0, .25), trimW, x, 2.5, sd * GD / 2, hall); mesh(new THREE.BoxGeometry(1.1, .8, .26), std({ color: 0x1a0e08, emissive: 0xffc070, emissiveIntensity: .6 }), x, 2.5, sd * GD / 2, hall); }));
    // a low-pitched corrugated roof with deep eaves, ridge along x
    const hallRoofT = corrugated("#a83228", "#d0584a", "#7a2018"); hallRoofT.repeat.set(GW / 1.2, 1);
    const hallRoofM = std({ map: hallRoofT, roughness: .45, metalness: .45, side: THREE.DoubleSide });
    const half = GD / 2 + 1.2, pitch = .26, L = half / Math.cos(pitch), top = GH + .25;
    [-1, 1].forEach(sd => { const rp = mesh(new THREE.BoxGeometry(GW + 2, .08, L), hallRoofM, 0, top + Math.tan(pitch) * half / 2, sd * half / 2, hall); rp.rotation.x = sd * pitch; clickable(list, rp, tdata); });
    [-1, 1].forEach(sx => { const sh = new THREE.Shape(); sh.moveTo(-GD / 2, 0); sh.lineTo(GD / 2, 0); sh.lineTo(0, Math.tan(pitch) * GD / 2); sh.closePath(); const gb = mesh(new THREE.ShapeGeometry(sh), wallM, sx * GW / 2, top, 0, hall); gb.rotation.y = Math.PI / 2; });
    // the sign over the doorway
    const sign = writing(512, 160, (c, cw, ch) => {
      c.fillStyle = "#b81c1c"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#f2d27a"; c.lineWidth = 10; c.strokeRect(6, 6, cw - 12, ch - 12);
      c.fillStyle = "#fff4d0"; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = '600 58px "Noto Sans Myanmar", "Myanmar Text", sans-serif'; c.fillText("လေးကောင်ဂျင်", cw / 2, 58);
      c.font = '600 34px "Figtree", sans-serif'; c.fillText("Four-animal top · 21 and over", cw / 2, 122);
    });
    if (document.fonts && document.fonts.load) document.fonts.load('600 58px "Noto Sans Myanmar"', "ဂျင်").then(() => { sign.needsUpdate = true; }, () => {});
    const sb = flat(mesh(new THREE.PlaneGeometry(3.4, 1.06), std({ map: sign, emissive: 0xffffff, emissiveMap: sign, emissiveIntensity: .45, roughness: .6, side: THREE.DoubleSide }), -GW / 2 - .14, GH + .9, 0, hall));
    sb.rotation.y = -Math.PI / 2; clickable(list, sb, tdata);
    // inside: the game on its mat in the middle, stools round it, bulbs overhead and a warm light day and night
    if (window.FourFaceTopGame) {
      fourTop = new FourFaceTopGame(g, V(GX, .26 + TH + .001, GZ));
      fourTop.admit = admit; Object.defineProperty(fourTop, "doorOpen", { get: () => doorOpen });
      fourTop.picks.forEach(m => clickable(list, m, tdata));
      updaters.pagoda.push(dt => fourTop.update(dt));
    }
    // the table: a plain wooden top on four legs, and stools for the players along three sides; the banker's end is the east one
    mesh(new THREE.BoxGeometry(TW1 - TW0, .06, TD * 2), wood, (TW0 + TW1) / 2, .26 + TH - .03, 0, hall);
    [[TW0 + .1, -TD + .1], [TW0 + .1, TD - .1], [TW1 - .1, -TD + .1], [TW1 - .1, TD - .1]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.08, TH - .06, .08), wood, x, .26 + (TH - .06) / 2, z, hall));
    [[-2.0, -.9], [-2.0, 0], [-2.0, .9], ...[-.8, .3, 1.4].flatMap(x => [[x, -2.0], [x, 2.0]])].forEach(([x, z], k) => mesh(new THREE.CylinderGeometry(.19, .15, .46, 10), k % 2 ? stool : stool2, x, .26 + .23, z, hall));
    [[-3, -4], [3, -4], [-3, 4], [3, 4], [0, 0]].forEach(([x, z]) => { mesh(new THREE.CylinderGeometry(.006, .006, .8, 4), steelM, x, GH - .15, z, hall); const b = glowSprite(0xfff0c8, .9, .9); b.material.fog = false; b.position.set(x, GH - .6, z); hall.add(b); });
    const inner = new THREE.PointLight(0xffd8a0, 1.6, 14, 2); inner.position.set(0, GH - .4, 0); hall.add(inner);
    hall.traverse(o => { if (o.isMesh && !o.userData.tip) clickable(list, o, tdata); });
    TALL.push({ x0: GX - GW / 2 - 1, x1: GX + GW / 2 + 1, z0: GZ - GD / 2 - 1, z1: GZ + GD / 2 + 1, h: GH + 3 });
    // the open-air opera: a raised stage under a metal roof, painted backdrop, red curtains, lights and loudspeakers,
    // with rows of benches for the audience in front
    const odata = { tip: "The open-air opera", toast: "On market nights a travelling troupe plays here until late: music, comedy and old stories under the lights, with families on the benches and mats in front." };
    const OX = 60, OZ = -4, SW = 13, SD = 6, SH = 1.3;
    const stageG = new THREE.Group(); stageG.position.set(OX, 0, OZ); g.add(stageG);
    sRect(stageG, -SW / 2 - .3, SW / 2 + 1.3, -SD / 2, SD / 2 + 1.5);
    clickable(list, mesh(new THREE.BoxGeometry(SW, SH, SD), wood, 0, SH / 2, 0, stageG), odata);
    mesh(new THREE.BoxGeometry(SW + .1, .3, .1), std({ color: 0xc02a2a, roughness: .6 }), 0, SH - .15, SD / 2 + .02, stageG);
    for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(2.4, SH - i * SH / 4, .35), wood, -SW / 2 + 1.6, (SH - i * SH / 4) / 2, SD / 2 + .2 + i * .35, stageG);
    const backdrop = canvasTex(512, (c, sz) => {
      const sky = c.createLinearGradient(0, 0, 0, sz); sky.addColorStop(0, "#2a4a8a"); sky.addColorStop(.6, "#e89a5a"); c.fillStyle = sky; c.fillRect(0, 0, sz, sz);
      c.fillStyle = "#4a6a4a"; c.beginPath(); c.moveTo(0, sz * .7); for (let x = 0; x <= sz; x += 32) c.lineTo(x, sz * (.55 + .12 * Math.sin(x / 50))); c.lineTo(sz, sz); c.lineTo(0, sz); c.fill();
      c.fillStyle = "#c8a040"; c.fillRect(sz * .38, sz * .42, sz * .24, sz * .3);                                       // a golden palace
      c.fillStyle = "#8a2a1a"; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(sz * (.35 + k * .02), sz * (.42 - k * .07)); c.lineTo(sz * .5, sz * (.32 - k * .07)); c.lineTo(sz * (.65 - k * .02), sz * (.42 - k * .07)); c.fill(); }
      c.fillStyle = "#f8f0c0"; c.beginPath(); c.arc(sz * .82, sz * .2, 26, 0, TAU); c.fill();
    });
    flat(mesh(new THREE.PlaneGeometry(SW - .4, 4.2), std({ map: backdrop, roughness: .8, emissive: 0x2a2a2a, emissiveMap: backdrop }), 0, SH + 2.1, -SD / 2 + .1, stageG));
    const curtain = std({ color: 0xa81818, roughness: .7, side: THREE.DoubleSide });
    [-1, 1].forEach(sd => { const cu = mesh(new THREE.BoxGeometry(1.5, 4.4, .15), curtain, sd * (SW / 2 - .75), SH + 2.2, SD / 2 - .4, stageG); });
    mesh(new THREE.BoxGeometry(SW, .8, .18), curtain, 0, SH + 4.1, SD / 2 - .35, stageG);
    mesh(new THREE.BoxGeometry(SW, .1, .2), M.trim, 0, SH + 3.7, SD / 2 - .25, stageG);
    [[-SW / 2, -SD / 2], [SW / 2, -SD / 2], [-SW / 2, SD / 2], [SW / 2, SD / 2]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(.18, SH + 5, .18), steelM, a, (SH + 5) / 2, b, stageG));
    const roofT = corrugated("#8a8c8e", "#c0c4c8", "#5e6064"); roofT.repeat.set(SW / 1.5, 1);
    const roofP = mesh(new THREE.BoxGeometry(SW + 1, .08, SD + 1.5), std({ map: roofT, roughness: .45, metalness: .45, side: THREE.DoubleSide }), 0, SH + 5.2, 0, stageG); roofP.rotation.x = -.12;
    mesh(new THREE.BoxGeometry(SW, .12, .12), steelM, 0, SH + 4.75, SD / 2 + .3, stageG);   // the lighting bar
    const spots = [];
    for (let k = 0; k < 6; k++) {
      const sx = -SW / 2 + 1.5 + k * (SW - 3) / 5, colr = [0xff6a4a, 0xffd060, 0x6ab0ff, 0xff70d0, 0x80ff9a, 0xffffff][k];
      mesh(new THREE.CylinderGeometry(.12, .18, .35, 10), std({ color: 0x1a1a1c, roughness: .4 }), sx, SH + 4.55, SD / 2 + .3, stageG).rotation.x = .9;
      const gl = glowSprite(colr, 1.2, .9); gl.material.fog = false; gl.position.set(sx, SH + 4.45, SD / 2 + .45); stageG.add(gl); spots.push(gl);
    }
    const stageLight = new THREE.SpotLight(0xffe0c0, 0, 22, .7, .5, 1); stageLight.position.set(0, SH + 4.5, SD / 2 + 4); stageLight.target.position.set(0, SH, -1); stageG.add(stageLight, stageLight.target);
    [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(.9, 2.2, .8), std({ color: 0x1a1a1c, roughness: .5 }), sd * (SW / 2 + .8), 1.1, SD / 2 - .4, stageG); [.5, 1.1, 1.7].forEach(y => mesh(new THREE.CylinderGeometry(.26, .26, .05, 16), steelM, sd * (SW / 2 + .8), y, SD / 2 + .02, stageG).rotation.x = Math.PI / 2); });
    // benches and mats for the audience
    for (let row = 0; row < 6; row++) for (let k = -1; k <= 1; k += 2) {
      const bz = OZ + SD / 2 + 3 + row * 1.6, bx = OX + k * 3.4;
      mesh(new THREE.BoxGeometry(5.6, .08, .4), wood, bx, .45, bz, g);
      [-2.4, 0, 2.4].forEach(dx => mesh(new THREE.BoxGeometry(.08, .45, .35), wood, bx + dx, .22, bz, g));
    }
    [[OX - 3.4, OZ + 15], [OX + 3.4, OZ + 15]].forEach(([x, z], i) => flat(mesh(new THREE.PlaneGeometry(5, 2.2), TARPS[i + 1], x, .07, z, g)).rotation.x = -Math.PI / 2);
    string(V(OX - SW / 2, SH + 5, OZ + SD / 2), V(X0 + 1, 3, OZ + 14), 10, .6);
    string(V(OX + SW / 2, SH + 5, OZ + SD / 2), V(X1 - 1, 3, OZ + 14), 10, .6);
    // the market's own entrance from the street: two posts with a banner of coloured bunting
    [49.5, 86.5].forEach(x => mesh(new THREE.CylinderGeometry(.12, .14, 5, 8), steelM, x, 2.5, 46.6, g));
    for (let i = 0; i < 40; i++) { const f = mesh(new THREE.ConeGeometry(.25, .5, 3), TARPS[i % TARPS.length], 50 + i * 36 / 40, 4.4 - Math.sin(Math.PI * i / 40) * .5, 46.6, g); f.rotation.x = Math.PI; f.castShadow = false; }
    const gateSign = writing(768, 160, (c, cw, ch) => {
      c.fillStyle = "#1f4f8a"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#f2d27a"; c.lineWidth = 10; c.strokeRect(6, 6, cw - 12, ch - 12);
      c.fillStyle = "#fff4d0"; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = '600 60px "Noto Sans Myanmar", "Myanmar Text", sans-serif'; c.fillText("ခုနစ်ရက်ဈေး", cw / 2, 60);
      c.font = '600 34px "Figtree", sans-serif'; c.fillText("Seven-day market", cw / 2, 124);
    });
    if (document.fonts && document.fonts.load) document.fonts.load('600 60px "Noto Sans Myanmar"', "ဈေး").then(() => { gateSign.needsUpdate = true; }, () => {});
    mesh(new THREE.BoxGeometry(37, .14, .14), steelM, 68, 4.95, 46.6, g);
    clickable(list, flat(mesh(new THREE.PlaneGeometry(5.6, 1.2), std({ map: gateSign, emissive: 0xffffff, emissiveMap: gateSign, emissiveIntensity: .4, roughness: .6, side: THREE.DoubleSide }), 68, 5.6, 46.7, g)), { market: true, tip: "Walk into the seven-day market" });
    // the bulbs and the opera's lights burn at night while the townsfolk are out, and go dark when everyone goes home
    let dark = 1, open = null;
    const light = () => {
      const k = dark * open;
      bulbs.forEach(b => b.material.opacity = .85 * k + .1);
      spots.forEach(s => s.material.opacity = .9 * k + .15);
      stageLight.intensity = 1.8 * k;
    };
    onDaylight(d => { dark = 1 - d; if (open !== null) light(); });
    updaters.pagoda.push(dt => {
      const want = FOLK.out ? 1 : 0;
      if (open === want) return;
      open = open === null ? want : clamp(open + (want ? dt : -dt) / 3, 0, 1);   // the lights go out over a few seconds
      light();
    });
  }
