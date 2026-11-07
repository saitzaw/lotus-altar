  // a strip of manau pattern: red diamonds edged in black, yellow points, on white (the church outside and in share it)
  let manauT = null;
  function manauTex() {
    if (manauT) return manauT;
    const t = canvasTex(128, (cx, sz) => {
      cx.fillStyle = "#f4f0e4"; cx.fillRect(0, 0, sz, sz);
      cx.fillStyle = "#1a1412"; cx.fillRect(0, 0, 10, sz); cx.fillRect(sz - 10, 0, 10, sz);
      for (let k = 0; k < 2; k++) {
        const y = k * sz / 2, h = sz / 2;
        cx.fillStyle = "#1a1412"; cx.beginPath(); cx.moveTo(sz / 2, y + 4); cx.lineTo(sz - 18, y + h / 2); cx.lineTo(sz / 2, y + h - 4); cx.lineTo(18, y + h / 2); cx.fill();
        cx.fillStyle = "#b8281e"; cx.beginPath(); cx.moveTo(sz / 2, y + 12); cx.lineTo(sz - 28, y + h / 2); cx.lineTo(sz / 2, y + h - 12); cx.lineTo(28, y + h / 2); cx.fill();
        cx.fillStyle = "#e8b830"; cx.beginPath(); cx.arc(sz / 2, y + h / 2, 7, 0, TAU); cx.fill();
        [[14, y + 6], [sz - 14, y + 6]].forEach(([px, py]) => { cx.beginPath(); cx.arc(px, py, 4, 0, TAU); cx.fill(); });
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; return manauT = t;
  }
  // the Kachin Baptist church past the end of the plaza lane, where the Kachin families of the town worship: a white hall
  // under a steep red roof, a bell tower and spire over the door with the cross on top, and the manau patterns of the Kachin
  // (red and black diamonds and zigzags, as on the poles of the manau dance ground) on the porch pillars and under the gable
  // ကချင်နှစ်ခြင်းအသင်းတော်; Jinghpaw services on Sunday, hymns sung in parts, and the whole town comes at Christmas
  function kachinChurch(g, x, z) {
    const data = { tip: "The Kachin Baptist church · ကချင်နှစ်ခြင်းအသင်းတော်", toast: "The Kachin Baptist church. Most Kachin are Christian, the greater part Baptist since American missionaries came to the hills more than a century ago. On Sunday the service is in Jinghpaw and the hymns are sung in parts; at Christmas the whole town, Buddhist neighbours too, comes for the carols and the meal." };
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = Math.PI; g.add(c);   // its front (local +z) faces the plaza lane's end
    const W = 9, L = 16, H = 6, base = .5;
    const lime = civicWhite, trim = std({ color: 0x9a2a22, roughness: .6 }), glass = std({ color: 0x2a3a5a, roughness: .3, metalness: .2 }), door = std({ color: 0x5a3a22, roughness: .7 });
    const manau = manauTex();
    const manauMat = (rx, ry) => { const t = manau.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return std({ map: t, roughness: .7 }); };
    // the plinth, the hall and its steep roof
    mesh(new THREE.BoxGeometry(W + 1, base, L + 1), forecourt, 0, base / 2, 0, c);
    clickable(picks.pagoda, mesh(new THREE.BoxGeometry(W, H, L), lime, 0, base + H / 2, 0, c), data);
    sRect(c, -W / 2 - .5, W / 2 + .5, -L / 2 - .5, L / 2 + .5);
    const RH = 4.6, rr = (W + 1.4) / 1.73, roofGeo = new THREE.CylinderGeometry(rr, rr, L + 1.2, 3, 1, false, Math.PI / 2);
    roofGeo.rotateZ(Math.PI / 2); roofGeo.rotateY(Math.PI / 2); roofGeo.scale(1, RH / (rr * 1.5), 1);
    clickable(picks.pagoda, mesh(roofGeo, ROOFS[1](1), 0, base + H + RH / 3 - .1, 0, c), data);
    // the gable ends: white triangles, the front one banded with manau pattern under its eaves
    const gab = new THREE.Shape(); gab.moveTo(-W / 2, 0); gab.lineTo(W / 2, 0); gab.lineTo(0, RH * .95); gab.lineTo(-W / 2, 0);
    [-1, 1].forEach(e => { const gm = mesh(new THREE.ShapeGeometry(gab), std({ color: 0xf4f2ec, roughness: .85, side: THREE.DoubleSide }), 0, base + H, e * (L / 2 + .01), c); gm.castShadow = false; });
    [-1, 1].forEach(sd => { const band = mesh(new THREE.BoxGeometry(Math.hypot(W / 2, RH * .95) - .3, .4, .06), manauMat(6, 1), sd * W / 4, base + H + RH * .95 / 2 - .25, L / 2 + .06, c); band.rotation.z = -sd * Math.atan2(RH * .95, W / 2); });
    mesh(new THREE.BoxGeometry(W + .2, .35, .3), trim, 0, base + H - .1, L / 2 + .1, c);   // the red band along the eaves
    // tall pointed windows down both sides, and a round window in the back gable
    for (let i = 0; i < 5; i++) [-1, 1].forEach(sd => {
      const wz = -L / 2 + 2.2 + i * (L - 4.4) / 4;
      mesh(new THREE.BoxGeometry(.08, 2.6, 1), glass, sd * (W / 2 + .02), base + 2.9, wz, c);
      const tip = mesh(new THREE.BoxGeometry(.08, .72, .72), glass, sd * (W / 2 + .02), base + 4.2, wz, c); tip.rotation.x = Math.PI / 4;
      mesh(new THREE.BoxGeometry(.12, .16, 1.3), trim, sd * (W / 2 + .04), base + 1.55, wz, c);   // the sill
    });
    mesh(new THREE.CylinderGeometry(.7, .7, .08, 16), glass, 0, base + H + 1.4, -L / 2 - .03, c).rotation.x = Math.PI / 2;
    // the bell tower over the door, its spire and the cross
    const TW = 3, TH = 11, tz = L / 2 + TW / 2 - .2;
    clickable(picks.pagoda, mesh(new THREE.BoxGeometry(TW, TH, TW), lime, 0, base + TH / 2, tz, c), data);
    sRect(c, -TW / 2 - .1, TW / 2 + .1, tz - TW / 2, tz + TW / 2 + .1);
    [4, 8.2].forEach(y => mesh(new THREE.BoxGeometry(TW + .2, .25, TW + .2), trim, 0, base + y, tz, c));
    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dx, dz]) => mesh(new THREE.BoxGeometry(dx ? .06 : .9, 1.6, dz ? .06 : .9), std({ color: 0x1a1412, roughness: .9 }), dx * (TW / 2 + .01), base + 9.4, tz + dz * (TW / 2 + .01), c));   // the belfry's openings
    const spire = mesh(new THREE.ConeGeometry(TW * .78, 5, 4), ROOFS[1](1), 0, base + TH + 2.5, tz, c); spire.rotation.y = Math.PI / 4;
    const crossM = std({ color: 0xf4f2ec, roughness: .5 });
    mesh(new THREE.BoxGeometry(.14, 1.6, .14), crossM, 0, base + TH + 5.6, tz, c); mesh(new THREE.BoxGeometry(.9, .14, .14), crossM, 0, base + TH + 5.9, tz, c);
    clickable(picks.pagoda, mesh(new THREE.BoxGeometry(1.5, 2.6, .1), door, 0, base + 1.3, tz + TW / 2 + .01, c), { floor: "church", tip: "Enter the Kachin Baptist church" });   // the double door
    mesh(new THREE.BoxGeometry(1.8, .25, .2), trim, 0, base + 2.75, tz + TW / 2 + .05, c);
    // the porch before the door on two manau-painted pillars, and the steps down
    const PZ = tz + TW / 2 + 1.4;
    mesh(new THREE.BoxGeometry(4.6, base, 2.8), forecourt, 0, base / 2, PZ, c);
    [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(.45, 3.2, .45), manauMat(1, 3), sd * 1.9, base + 1.6, PZ + .9, c); sCircle(c, sd * 1.9, PZ + .9, .3); });
    const pr = 4.6 / 1.73, porchRoof = new THREE.CylinderGeometry(pr, pr, 3, 3, 1, false, Math.PI / 2);   // a little gable, ridge running out from the door
    porchRoof.rotateZ(Math.PI / 2); porchRoof.rotateY(Math.PI / 2); porchRoof.scale(1, .9 / (pr * 1.5), 1);
    mesh(porchRoof, ROOFS[1](1), 0, base + 3.2 + .3, PZ, c);
    for (let i = 0; i < 2; i++) mesh(new THREE.BoxGeometry(3.4, base - i * .25, .4), forecourt, 0, (base - i * .25) / 2, PZ + 1.6 + i * .4, c);
    // the forecourt and a path from the end of the plaza lane, and the church's board
    flat(mesh(new THREE.BoxGeometry(14, .05, 6), forecourt, 0, .03, PZ + 4.6, c)).receiveShadow = true;
    civicSign(c, "ကချင်နှစ်ခြင်းအသင်းတော်", "Hsenwi Kachin Baptist Church", "#f4f2ec", "#9a2a22", 3.4, 5, 1.9, PZ + 3.5);
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.12, 2.1, .12), door, 5 + sd * 1.5, 1.05, PZ + 3.45, c));
  }
  // the Kachin Baptist church's compound at the end of the plaza lane, inside a whitewashed wall with a red cap: the church in the
  // middle, its gate on the lane under an iron arch with a cross; on the west side the pastor's house and the house of the women
  // church workers (sarama); on the east the baptistry, a roofed open-air pool, and the Sunday-school hall; trees behind the church
  const CHURCH_YARD = { x0: -6, x1: 28, z0: 107.6, z1: 143.6, gate: [-2.25, 2.25] };   // the wall round it (fits between the hill-foot lane, the plaza- and market-lane houses and the houses facing the Haw Kham), and the gate in its south wall
  function churchCompound(g) {
    const { x0, x1, z0, z1, gate } = CHURCH_YARD, cap = std({ color: 0x9a2a22, roughness: .6 }), iron = std({ color: 0x2a2a2c, roughness: .5, metalness: .6 });
    const lane = std({ color: 0x7e7a72, roughness: .9 });
    kachinChurch(g, 12, 128);
    // the wall, open at the gate
    [[x0, x1, z0, z0, gate], [x0, x1, z1, z1], [x0, x0, z0, z1], [x1, x1, z0, z1]].forEach(([a, b, c, d, gap]) => {
      (gap ? [[a, gap[0]], [gap[1], b]] : [[a, b]]).forEach(([a, b]) => {
        const w = Math.max(b - a, .25), dd = Math.max(d - c, .25), mx = (a + b) / 2, mz = (c + d) / 2;
        mesh(new THREE.BoxGeometry(w, 1.6, dd), civicWhite, mx, .8, mz, g); mesh(new THREE.BoxGeometry(w + .06, .14, dd + .06), cap, mx, 1.67, mz, g);
        sRect(g, mx - w / 2, mx + w / 2, mz - dd / 2, mz + dd / 2);
      });
    });
    // the gate: two pillars, an iron arch over the way in with a white cross on top, the leaves folded back inside
    gate.forEach(x => { mesh(new THREE.BoxGeometry(.6, 2.4, .6), civicWhite, x + (x < 0 ? -.3 : .3), 1.2, z0, g); mesh(new THREE.BoxGeometry(.7, .14, .7), cap, x + (x < 0 ? -.3 : .3), 2.47, z0, g); sCircle(g, x + (x < 0 ? -.3 : .3), z0, .4); });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(gate[1] + .3, .07, 6, 24, Math.PI), iron); arch.position.set(0, 2.5, z0); arch.scale.y = .35; g.add(arch);
    const crossM = std({ color: 0xf4f2ec, roughness: .5 });
    mesh(new THREE.BoxGeometry(.1, .9, .1), crossM, 0, 2.5 + (gate[1] + .3) * .35 + .45, z0, g); mesh(new THREE.BoxGeometry(.55, .1, .1), crossM, 0, 2.5 + (gate[1] + .3) * .35 + .6, z0, g);
    gate.forEach(x => { const leaf = mesh(new THREE.BoxGeometry(.06, 1.5, 2), iron, x + (x < 0 ? .2 : -.2), .85, z0 + 1.1, g); leaf.castShadow = false; });
    // the path from the gate to the church's forecourt
    flat(mesh(new THREE.BoxGeometry(7.6, .05, 3.6), lane, 1.55, .03, z0 + 1.8, g));
    // the pastor's house: two storeys of wood over whitewashed brick, its verandah toward the church; and the women workers' house
    const pastor = { tip: "The pastor's house · သင်းအုပ်ဆရာအိမ်", toast: "The pastor's house. A Baptist church has no priest: the congregation calls its own pastor, who is married and lives here beside the church with the family. People call him Sara, teacher, and come to the house for prayers, for help with a letter or a wedding, and to sit on the verandah after the service." };
    const sarama = { tip: "The women workers' house · ဆရာမအိမ်", toast: "The house of the church's women workers, the sarama. The congregation calls them sister: they teach the Sunday school, lead the women's fellowship, visit the sick and the villages in the hills, and cook with the women for the Christmas and Easter meals." };
    shanWoodHouse(g, -.5, 131, Math.PI / 2, { W: 7, D: 6.5, floors: 2, seed: 261, roof: ROOFS[1](1) });
    shanHouse(g, -.6, 120, Math.PI / 2, { W: 6.5, D: 6, floors: 1, shop: false, seed: 262, wall: WALLS[3], roof: ROOFS[2] });
    clickable(picks.pagoda, civicSign(g, "သင်းအုပ်ဆရာအိမ်", "Pastor's House", "#f4f2ec", "#9a2a22", 1.6, 5.2, 1.3, 135.6, Math.PI / 2), pastor);
    clickable(picks.pagoda, civicSign(g, "ဆရာမအိမ်", "Women Workers' House", "#f4f2ec", "#9a2a22", 1.6, 4.4, 1.3, 115.6, Math.PI / 2), sarama);
    [[5.2, 135.6], [4.4, 115.6]].forEach(([x, z]) => [-.7, .7].forEach(dz => mesh(new THREE.BoxGeometry(.08, 1.2, .08), iron, x, .6, z + dz, g)));
    // the baptistry: a raised tank of blue tile, steps up over the rim at both ends, water waist deep, under a tin roof on six posts.
    // Baptists baptise believers by immersing them, so the pastor and each new member walk down into the water together
    const bap = { tip: "The baptistry · နှစ်ခြင်းကန်", toast: "The baptistry. Baptists baptise those old enough to choose for themselves, by immersing them: the pastor and each new member walk down the steps into the water together, and the congregation sings from the yard. Some villages still baptise in the river." };
    const BX = 22.5, BZ = 121, TW = 2.6, TL = 5.4, TH = 1, tileM = std({ color: 0xe8f0f4, roughness: .4 }), blueTile = std({ color: 0x3a7aa8, roughness: .3 });
    const b = new THREE.Group(); b.position.set(BX, 0, BZ); g.add(b);
    flat(mesh(new THREE.BoxGeometry(5.2, .12, 8.6), forecourt, 0, .06, 0, b)).receiveShadow = true;
    [[-1, 0, .2, TL], [1, 0, .2, TL], [0, -1, TW, .2], [0, 1, TW, .2]].forEach(([sx, sz, w, d]) => clickable(picks.pagoda, mesh(new THREE.BoxGeometry(w, TH, d), tileM, sx * (TW / 2 - .1), TH / 2 + .1, sz * (TL / 2 - .1), b), bap));
    mesh(new THREE.BoxGeometry(TW - .4, .1, TL - .4), blueTile, 0, .2, 0, b);
    const water = mesh(new THREE.BoxGeometry(TW - .4, .02, TL - .4), std({ color: 0x5ab0d0, roughness: .08, metalness: .2, transparent: true, opacity: .75, depthWrite: false }), 0, TH - .12, 0, b);
    water.castShadow = false; clickable(picks.pagoda, water, bap);
    [-1, 1].forEach(e => { for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(1.4, (i + 1) * TH / 3, .35), tileM, 0, (i + 1) * TH / 6 + .1, e * (TL / 2 + .9 - i * .32), b); });
    sRect(b, -TW / 2, TW / 2, -TL / 2 - 1.1, TL / 2 + 1.1);
    [-1, 1].forEach(sx => [-1, 0, 1].forEach(sz => { mesh(new THREE.BoxGeometry(.18, 3, .18), civicWhite, sx * 2.3, 1.6, sz * 3.9, b); sCircle(b, sx * 2.3, sz * 3.9, .15); }));
    const br = tinHipRoof(4.6, 2.9, 1.3, ROOFS[1](1)); br.rotation.y = Math.PI / 2; br.position.y = 3.1; br.castShadow = br.receiveShadow = true; b.add(br);
    mesh(new THREE.BoxGeometry(.1, 1.1, .1), crossM, TW / 2 - .1, TH + .65, 0, b); mesh(new THREE.BoxGeometry(.1, .1, .6), crossM, TW / 2 - .1, TH + .85, 0, b);   // a cross on the middle of the east rim, facing the church
    TALL.push({ x0: BX - 3, x1: BX + 3, z0: BZ - 5, z1: BZ + 5, h: 4.6 });
    // the Sunday-school hall, one storey, its door toward the church
    civic(g, 22.6, 134, -Math.PI / 2, { W: 8.4, D: 5.4, floors: 1, wall: civicCream, trim: civicRed, roof: ROOFS[1](1), door: true,
      data: { tip: "The Sunday-school hall", toast: "The church's hall. The children have Sunday school here before the service, the youth fellowship meets in the evenings, and at Christmas the tables are set out for the meal." } });
    // shade trees and banana clumps behind the church
    [[16, 140.4], [4, 140.6], [25, 140]].forEach(([x, z], i) => tree(g, x, z, .8 + (i % 2) * .15, 320 + i));
    [[10, 140.8], [20, 140.6]].forEach(([x, z], i) => banana(g, x, z, 420 + i));
  }
  function backStreets(g) {
    const lane = std({ color: 0x7e7a72, roughness: .9 }), drain = std({ color: 0x3a3632, roughness: .9 });
    const inLane = (x, z, skip) => LANES.some((l, i) => i !== skip && x > l.x0 - .5 && x < l.x1 + .5 && z > l.z0 - .5 && z < l.z1 + .5);
    LANES.forEach((l, i) => {
      const w = l.x1 - l.x0, d = l.z1 - l.z0, along = d > w, mx = (l.x0 + l.x1) / 2, mz = (l.z0 + l.z1) / 2, y = .025 + i * .004;
      flat(mesh(new THREE.BoxGeometry(w, .04, d), lane, mx, y, mz, g));
      // open concrete drains along both edges
      [-1, 1].forEach(sd => flat(mesh(along ? new THREE.BoxGeometry(.35, .045, d) : new THREE.BoxGeometry(w, .045, .35), drain, along ? mx + sd * (w / 2 - .18) : mx, y, along ? mz : mz + sd * (d / 2 - .18), g)));
      // wooden power poles carrying the wires down the lane, each with a village lamp out over it, lit at night
      const n = Math.floor(Math.max(w, d) / 14), tops = [];
      for (let k = 0; k <= n; k++) {
        const f = (k + .5) / (n + 1), px = along ? l.x1 - .15 : l.x0 + f * w, pz = along ? l.z0 + f * d : l.z0 + .15;
        if (inLane(px, pz, i)) continue;
        tops.push(villageLamp(g, px, y, pz, along ? Math.PI : -Math.PI / 2));
      }
      lampWires(g, tops);
    });
    // the houses: concrete and wooden, one and two storeys, in turn
    const KINDS = [[false, 1], [true, 1], [false, 2], [true, 2], [true, 1], [false, 1], [true, 2], [false, 2]];
    let seq = 0;
    const house = (cx, cz, ry, W, D) => {
      const [wood, floors] = KINDS[seq % KINDS.length], seed = 200 + seq++;
      if (wood) shanWoodHouse(g, cx, cz, ry, { W, D, floors, seed, roof: seed % 3 ? rustRoof : ROOFS[seed % 4](1) });
      else shanHouse(g, cx, cz, ry, { W, D, floors, shop: false, seed, wall: WALLS[(seed * 5) % WALLS.length], roof: ROOFS[seed % 4] });
    };
    // a row of houses along a lane, from a to b along its axis; place(centre, W, D)
    const row = (a, b, place) => {
      for (let p = a; ;) {
        const W = 6 + (seq * 7 % 3) * .5, D = 6 + (seq * 3 % 3) * .5;
        if (p + W > b) break;
        place(p + W / 2, W, D); p += W + 1.8;
      }
    };
    const [L1, L2, L3, L4] = LANES, SET = 2.75;   // SET: from the lane edge to the house front (room for a wooden stair or a front wall)
    row(L1.x0 + 1, L2.x0 - 1.2, (c, W, D) => house(c, L1.z1 + SET + D / 2, Math.PI, W, D));            // back lane, south side
    row(L2.x1 + 1.2, L3.x0 - 1.2, (c, W, D) => house(c, L1.z1 + SET + D / 2, Math.PI, W, D));
    row(92.5, L2.z1, (c, W, D) => house(L2.x0 - SET - D / 2, c, Math.PI / 2, W, D));                    // plaza lane, both sides
    row(92.5, L2.z1, (c, W, D) => house(L2.x1 + SET + D / 2, c, -Math.PI / 2, W, D));
    row(92.5, 108, (c, W, D) => house(L3.x0 - SET - D / 2, c, Math.PI / 2, W, D));                      // market lane, west side
    row(110.5, 143, (c, W, D) => house(L3.x0 - SET - D / 2, c, Math.PI / 2, W, D));                     // and on, facing the school gate
    seq++;   // the last house there gave way to the houses facing the Haw Kham; the rest of the town's houses stay as they were
    row(L4.z0 + 1, L4.z1 - 4, (c, W, D) => house(L4.x0 - SET - D / 2, c, Math.PI / 2, W, D));          // west lane, both sides facing it
    row(L4.z0 + 1, L4.z1 - 4, (c, W, D) => house(L4.x1 + SET + D / 2, c, -Math.PI / 2, W, D));         // (back to back with the town-road houses)
    // gardens: shade trees and banana clumps behind and between the houses
    [[15, 96], [24, 104], [-14, 98], [-86, 30], [-86.5, 8], [-86, -12]].forEach(([x, z], i) => tree(g, x, z, .8 + (i % 3) * .1, 300 + i));
    [[14, 93], [20, 99], [26, 95], [-12, 104], [-85.5, 40], [-85.5, 19], [-86, -2], [-85.5, -20]].forEach(([x, z], i) => banana(g, x, z, 400 + i));
    // a row of five traditional two-storey Shan houses facing the Haw Kham across the palace lane, 2 m apart:
    // a wooden storey and verandah over a whitewashed brick ground floor, under rusty tin hip roofs
    for (let i = 0; i < 5; i++) shanWoodHouse(g, -2.25 + i * 9, 148.9, 0, { W: 7, D: 6.5, floors: 2, seed: 240 + i, roof: rustRoof });
    churchCompound(g);
    // the old banyan on the corner of the market lane and the street
    banyan(g, 36.4, 65.4);
  }
