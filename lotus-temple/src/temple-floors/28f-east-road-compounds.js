  /* ---------- the east road: from the east end of the front street, past the police station, north to the main road's east end by
     the power station, joining the two. Asphalt between dirt verges with a dashed centre line, street lights on the east verge and
     the power station's line on concrete poles down the west verge. Along both sides a row of Shan family compounds, each house in
     its own yard behind woven bamboo, split-bamboo pickets or a whitewashed wall (the Hluttaw road's `lotKit`), and among them two
     big family compounds inside a whitewashed wall: the parents' house of two storeys at the back, a married child's house beside
     the yard, a rice granary on posts and a well; and on the east side a fenced vegetable garden with a field hut ---------- */
  const EAST_ROAD = { x0: 155.5, x1: 162.5, z0: 58, z1: 255.5, west: 154.3, east: 163.8, set: 4.5 };   // the carriageway (x) between the front street's north edge and the main road's south edge (z); the two rows' front fences (x); set: front fence to house front
  // the lots along each side, south to north from z0: width along the road, kind ("house", "big" for a walled family compound,
  // "garden"), depth back from the front fence, fence, wood or concrete house, storeys, a water pot stand at the gate
  const EAST_LOTS = {
    west: { z0: 74, lots: [
      { w: 14, kind: "house", d: 15, fence: "weave", wood: true, floors: 1, pots: true }, { w: 15, kind: "house", d: 15, fence: "brick", wood: false, floors: 2 },
      { w: 28, kind: "big", d: 22 }, { w: 13, kind: "house", d: 15, fence: "picket", wood: true, floors: 2 },
      { w: 16, kind: "house", d: 15, fence: "weave", wood: true, floors: 2, pots: true }, { w: 15, kind: "house", d: 15, fence: "brick", wood: true, floors: 1 },
      { w: 19, kind: "house", d: 15, fence: "picket", wood: false, floors: 2 }
    ] },
    east: { z0: 64, lots: [
      { w: 15, kind: "house", d: 15, fence: "picket", wood: true, floors: 2 }, { w: 14, kind: "house", d: 15, fence: "weave", wood: true, floors: 1, pots: true },
      { w: 16, kind: "house", d: 15, fence: "brick", wood: false, floors: 1 }, { w: 30, kind: "big", d: 22 },
      { w: 13, kind: "house", d: 15, fence: "weave", wood: true, floors: 2 }, { w: 15, kind: "house", d: 15, fence: "picket", wood: false, floors: 2, pots: true },
      { w: 24, kind: "garden", d: 15, fence: "picket" }, { w: 16, kind: "house", d: 15, fence: "brick", wood: true, floors: 2 },
      { w: 28, kind: "big", d: 22 }, { w: 16, kind: "house", d: 15, fence: "weave", wood: true, floors: 1, pots: true }
    ] }
  };
  const EAST_POLES = [[146, 207], [155, 195], [155, 180], [155, 165], [155, 150], [155, 135], [155, 120], [155, 105], [155, 90], [155, 75]];   // the power station's line, from over its back wall down the west verge (powerStation)
  const EAST_LIGHTS = [70, 90, 110, 130, 150, 170, 190, 210, 230, 250];   // street lights on the east verge (z)

  function eastRoad(g) {
    const R = EAST_ROAD, road = std({ color: 0x2c2c2e, roughness: .95 }), verge = std({ color: 0x8a7a5e, roughness: 1 });
    const pave = std({ color: 0x6a645c, roughness: .9 }), kerb = std({ color: 0x8a847a, roughness: .8 }), line = std({ color: 0xe8e4d8, roughness: .8 });
    const cx = (R.x0 + R.x1) / 2, w = R.x1 - R.x0, len = R.z1 - R.z0;
    // the front street carried on east from x 145 to the junction, and the east road north from it to the main road
    flat(mesh(new THREE.BoxGeometry(R.x1 - 145, .04, 8), road, (145 + R.x1) / 2, .02, 54, g));
    flat(mesh(new THREE.BoxGeometry(w, .04, len), road, cx, .02, (R.z0 + R.z1) / 2, g));
    // the front street's pavements carried on to the corner: the north one past the junction, the south one up to the east road
    [[48.75, 2.5, 145, R.x1 + 1.5], [59.4, 2.8, 145, R.x0]].forEach(([z, d, x0, x1]) => {
      mesh(new THREE.BoxGeometry(x1 - x0, .18, d), pave, (x0 + x1) / 2, .09, z, g);
      [-1, 1].forEach(e => mesh(new THREE.BoxGeometry(x1 - x0, .2, .14), kerb, (x0 + x1) / 2, .1, z + e * d / 2, g));
      mesh(new THREE.BoxGeometry(.14, .2, d), kerb, x1, .1, z, g);
    });
    // dirt verges either side, as on the hospital road
    flat(mesh(new THREE.BoxGeometry(R.x0 - R.west, .03, R.z1 - 60.8), verge, (R.x0 + R.west) / 2, .015, (60.8 + R.z1) / 2, g));
    flat(mesh(new THREE.BoxGeometry(R.east - R.x1, .03, R.z1 - 50), verge, (R.x1 + R.east) / 2, .015, (50 + R.z1) / 2, g));
    // a dashed centre line, and a give-way line across the road's half at each end
    const n = Math.floor((len - 8) / 6), dash = new THREE.InstancedMesh(new THREE.BoxGeometry(.14, .02, 2.4), std({ color: 0xbdb6a8, roughness: .8 }), n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) dash.setMatrixAt(i, m4.makeTranslation(cx, .05, R.z0 + 5 + i * 6));
    g.add(dash);
    flat(mesh(new THREE.BoxGeometry(w / 2 - .2, .02, .25), line, cx - w / 4, .05, R.z0 + .6, g));
    flat(mesh(new THREE.BoxGeometry(w / 2 - .2, .02, .25), line, cx + w / 4, .05, R.z1 - .6, g));
    EAST_LIGHTS.forEach(z => streetLight(g, R.x1 + .65, z, 0));   // arms out west over the road
    eastRoadLots(g);
  }

  // the two rows of lots: each lot is built in its own frame, the front fence along local x at z 0 with the road on its −z side
  // and the yard toward +z, as on the Hluttaw road; the frame is then turned so the road lies east (west row) or west (east row)
  function eastRoadLots(g) {
    const R = EAST_ROAD, r = rng(6060), K = lotKit(r);
    const nearPost = (z, xs) => xs.some(pz => Math.abs(z - pz) < 1.8);
    [["west", R.west, -Math.PI / 2, 1], ["east", R.east, Math.PI / 2, -1]].forEach(([side, fx, ry, dir]) => {
      // dir: world z along the lot's local +x
      let z = EAST_LOTS[side].z0;
      const posts = side === "west" ? EAST_POLES.map(p => p[1]) : EAST_LIGHTS;
      EAST_LOTS[side].lots.forEach((L, i) => {
        const zc = z + L.w / 2, seed = (side === "west" ? 900 : 940) + i; z += L.w;
        const s = new THREE.Group(); s.position.set(fx, 0, zc); s.rotation.y = ry; g.add(s);
        const wz = lx => zc + dir * lx;   // a local x's world z, to keep the water pots off the poles and lamps
        if (L.kind === "big") bigCompound(s, L, seed, K, r);
        else if (L.kind === "garden") vegGarden(s, L, seed, K, r);
        else familyLot(s, L, seed, K, r, x => !nearPost(wz(x), posts));
        // the side fence toward the previous lot (and the far one on the last lot), unless a big compound's wall already stands there
        if (L.kind !== "big" && !(i && EAST_LOTS[side].lots[i - 1].kind === "big")) K.fence(s, L.fence, -L.w / 2, 0, -L.w / 2, L.d);
        if (L.kind !== "big" && i === EAST_LOTS[side].lots.length - 1) K.fence(s, L.fence, L.w / 2, 0, L.w / 2, L.d);
      });
    });
    // the corner the line crosses between the west row and the power station's back wall: rough grass, a tree and a bamboo clump
    tree(g, 141, 200, .85, 6091); tree(g, 150, 211, .7, 6092); banana(g, 139.5, 209, 6093);
  }

  // one family's lot (as on the Hluttaw road): a wooden or concrete house facing the road, its gate in line with the stair or the
  // door and a path up to it, the swept earth of the yard, a shade tree, bananas behind and a vegetable bed or a washing line by the
  // gate, and maybe a water pot stand outside it. `potOk(lx)` says whether a pot stand may stand at local x by the road
  function familyLot(s, L, seed, K, r, potOk) {
    const { earth, greens, cloth, bamboo, tuftGeo } = K, SET = EAST_ROAD.set, B = L.d, left = seed % 2 ? 1 : -1, W = L.w >= 15 ? 7.5 : 7, D = 6.5;
    const hz = SET + D / 2 + (L.wood ? 1.6 : 1);
    if (L.wood) shanWoodHouse(s, 0, hz, Math.PI, { W, D, floors: L.floors, seed, roof: seed % 3 ? rustRoof : ROOFS[seed % 4](1) });
    else shanHouse(s, 0, hz, Math.PI, { W, D, floors: L.floors, shop: false, seed, wall: WALLS[(seed * 5) % WALLS.length], roof: ROOFS[seed % 4] });
    const gx = !L.wood ? 0 : -left * (L.floors === 1 ? W / 2 - .75 : W / 4), half = L.fence === "brick" ? 1.3 : 1.2, sg = Math.sign(gx) || 1;
    K.gate(s, L.fence, gx, 0, half);
    const pl = SET - (L.wood && L.floors === 1 ? 1.2 : 0);
    flat(mesh(new THREE.BoxGeometry(1.4, .04, pl), concrete, gx, .045, pl / 2, s));
    flat(mesh(new THREE.BoxGeometry(L.w - .3, .02, B - .3), earth, 0, .02, B / 2, s)).receiveShadow = true;
    const gp = L.fence === "brick" ? half + .32 : half;
    K.fence(s, L.fence, -L.w / 2, 0, gx - gp, 0); K.fence(s, L.fence, gx + gp, 0, L.w / 2, 0);
    K.fence(s, L.fence, -L.w / 2, B, L.w / 2, B);
    tree(s, -sg * (L.w / 2 - 1.8), 2.2, .75 + r() * .15, seed);
    banana(s, -sg * (L.w / 2 - 1.2), B - 1.4, seed); banana(s, sg * (L.w / 2 - 1.1), B - 1.6, seed + 40);
    const ex = sg * (L.w / 2 - 1.5);
    if (seed % 2 === 0) {   // a raised bed of greens and mustard
      mesh(new THREE.BoxGeometry(1.2, .22, 3), earth, ex, .11, 2.2, s);
      for (let k = 0; k < 10; k++) part(tuftGeo, greens, ex + (k % 2 - .5) * .5, .26, .95 + Math.floor(k / 2) * .62, s).scale.set(1, .7 + r() * .4, 1);
    } else {   // a washing line between two bamboo poles
      [1, 3.6].forEach(z => mesh(new THREE.CylinderGeometry(.04, .04, 1.9, 6), bamboo, ex, .95, z, s));
      mesh(new THREE.CylinderGeometry(.008, .008, 2.6, 4), steel, ex, 1.8, 2.3, s).rotation.x = Math.PI / 2;
      for (let k = 0; k < 4; k++) { const ch = .6 + r() * .3, c = mesh(new THREE.PlaneGeometry(.55, ch), cloth[(seed + k) % cloth.length], ex, 1.79 - ch / 2, 1.4 + k * .6, s); c.rotation.y = Math.PI / 2; c.castShadow = false; }
    }
    const px = gx + sg * (half + 1.1);
    if (L.pots && potOk(px)) K.potStand(s, px, -.6);
  }

  // a big family compound behind a whitewashed wall with a steel gate: the parents' wooden house of two storeys across the back,
  // a married son's or daughter's concrete house of one storey beside the yard facing into it, a rice granary on posts by the gate,
  // a well in the back corner, a washing line, a tamarind or mango for shade and bananas along the wall
  function bigCompound(s, L, seed, K, r) {
    const { w, d: B } = L, hw = w / 2, gh = 1.6, gx = -2;
    compoundWall(s, -hw, 0, gx - gh - .5, 0, { h: 1.5 }); compoundWall(s, gx + gh + .5, 0, hw, 0, { h: 1.5 });
    compoundWall(s, -hw, B, hw, B, { h: 1.5 }); compoundWall(s, -hw, 0, -hw, B, { h: 1.5 }); compoundWall(s, hw, 0, hw, B, { h: 1.5 });
    compoundGate(s, gx, 0, gh, whiteWall, 1.9);
    flat(mesh(new THREE.BoxGeometry(w - .4, .02, B - .4), K.earth, 0, .02, B / 2, s)).receiveShadow = true;
    // the parents' house: wooden, two storeys, its stair on the gate's side; a paved path from the gate
    const HW = 9.5, HD = 7.5, left = seed % 2 ? 1 : -1, hx = gx + left * HW / 4, hz = B - HD / 2 - 2.8, pz = hz - HD / 2 - 1.8;   // the house turned to face the gate, so its stair (local x left · W/4) lines up with it
    shanWoodHouse(s, hx, hz, Math.PI, { W: HW, D: HD, floors: 2, seed, roof: seed % 3 ? rustRoof : ROOFS[seed % 4](1) });
    flat(mesh(new THREE.BoxGeometry(1.6, .04, pz), M.stone, gx, .045, pz / 2, s));
    // the married child's house beside the yard, facing it
    shanHouse(s, hw - 3.6, B * .42, -Math.PI / 2, { W: 6.5, D: 5.5, floors: 1, shop: false, seed: seed + 7, wall: WALLS[(seed * 3) % WALLS.length], roof: ROOFS[(seed + 1) % 4] });
    granary(s, -hw + 3.2, 4.2, Math.PI / 2, K);
    // the well in the back corner
    const wx = hw - 2.6, wz = B - 2.6;
    mesh(new THREE.CylinderGeometry(.7, .75, .8, 14, 1, true), whiteWall, wx, .4, wz, s).material.side = THREE.DoubleSide;
    flat(mesh(new THREE.CircleGeometry(.66, 14), std({ color: 0x1a2228, roughness: .2 }), wx, .5, wz, s)).rotation.x = -Math.PI / 2;
    sCircle(s, wx, wz, .8);
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.12, 2, .12), teakPost, wx + sd * .8, 1, wz, s));
    mesh(new THREE.BoxGeometry(1.8, .12, .12), teakPost, wx, 2, wz, s);
    mesh(new THREE.CylinderGeometry(.16, .12, .28, 10), steel, wx + .4, .95, wz - .55, s);
    // a washing line across the yard's front, trees and bananas
    const lx = 4.5;
    [2, 6.5].forEach(z => mesh(new THREE.CylinderGeometry(.04, .04, 1.9, 6), K.bamboo, lx, .95, z, s));
    mesh(new THREE.CylinderGeometry(.008, .008, 4.5, 4), steel, lx, 1.8, 4.25, s).rotation.x = Math.PI / 2;
    for (let k = 0; k < 6; k++) { const ch = .6 + r() * .4, c = mesh(new THREE.PlaneGeometry(.6, ch), K.cloth[(seed + k) % K.cloth.length], lx, 1.79 - ch / 2, 2.4 + k * .68, s); c.rotation.y = Math.PI / 2; c.castShadow = false; }
    tree(s, hw - 2.2, 2.4, .95, seed + 3); tree(s, -hw + 2.4, B - 2.4, .9, seed + 4);
    [[-hw + 1.3, 9.5], [-hw + 1.3, 12.5], [hw - 1.3, B - 6.5], [hw - 6, B - 1.3]].forEach(([x, z], k) => banana(s, x, z, seed + 50 + k));
  }

  // စပါးကျီ a rice granary: a small house of woven bamboo raised on posts against damp and rats, a tin hip roof, a ladder to its door;
  // faces local +z turned by ry
  function granary(s, x, z, ry, K) {
    const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = ry; s.add(h);
    const data = { tip: "A rice granary · စပါးကျီ", toast: "စပါးကျီ (Burmese), a family's rice granary: a little house of woven bamboo on posts, raised against the damp and the rats. After the harvest the paddy from the family's fields is carried in here in baskets, and through the year it is taken out a basketful at a time to be husked for the pot." };
    const W = 3.2, D = 2.6, Y = 1.1, H = 1.9;
    sRect(h, -W / 2 - .2, W / 2 + .2, -D / 2 - .2, D / 2 + .9);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => {
      mesh(new THREE.BoxGeometry(.18, Y, .18), teakPost, a * (W / 2 - .15), Y / 2, b * (D / 2 - .15), h);
      mesh(new THREE.CylinderGeometry(.22, .22, .04, 10), steel, a * (W / 2 - .15), Y * .7, b * (D / 2 - .15), h);   // a rat guard
    });
    mesh(new THREE.BoxGeometry(W + .2, .14, D + .2), teakDark, 0, Y + .07, 0, h);
    clickable(picks.pagoda, mesh(K.uvBox(W, H, D), K.weave, 0, Y + .14 + H / 2, 0, h), data);
    mesh(new THREE.BoxGeometry(.9, 1.3, .04), teakDark, 0, Y + .14 + .7, D / 2 + .02, h);   // the door
    const rf = tinHipRoof(W / 2 + .5, D / 2 + .5, 1.1, rustRoof); rf.position.set(0, Y + .14 + H, 0); h.add(rf);
    const lad = new THREE.Group(); lad.position.set(0, 0, D / 2 + .55); lad.rotation.x = -.35; h.add(lad);
    [-.25, .25].forEach(lx => mesh(new THREE.BoxGeometry(.06, 1.4, .06), K.bamboo, lx, .7, 0, lad));
    for (let k = 0; k < 4; k++) mesh(new THREE.BoxGeometry(.5, .04, .04), K.bamboo, 0, .25 + k * .3, 0, lad);
  }

  // a family's vegetable garden behind a picket fence: raised beds of greens, mustard, beans on bamboo frames, a gourd trellis, and a
  // small field hut of bamboo and thatch where the grandmother sits out of the sun
  function vegGarden(s, L, seed, K, r) {
    const { w, d: B } = L, hw = w / 2, gx = -hw + 3;
    const data = { tip: "A vegetable garden", toast: "A family's kitchen garden in town: raised beds of mustard greens, lettuce, coriander and garlic, beans climbing bamboo frames and a gourd vine over a trellis, watered from cans every evening. What the family can't eat goes to the morning market." };
    K.gate(s, L.fence, gx, 0, 1.1);
    K.fence(s, L.fence, -hw, 0, gx - 1.1, 0); K.fence(s, L.fence, gx + 1.1, 0, hw, 0); K.fence(s, L.fence, -hw, B, hw, B);
    flat(mesh(new THREE.BoxGeometry(w - .3, .02, B - .3), K.earth, 0, .02, B / 2, s)).receiveShadow = true;
    const leafy = [K.greens, std({ color: 0x6a9a3a, roughness: .9, flatShading: true }), std({ color: 0x3a6a2a, roughness: .9, flatShading: true })];
    for (let b = 0; b < 6; b++) {   // the beds, running back from the path
      const bx = -hw + 5.5 + b * 2.4; if (bx > hw - 5) break;
      const bed = clickable(picks.pagoda, mesh(new THREE.BoxGeometry(1.3, .22, B - 4), K.earth, bx, .11, B / 2 + .5, s), data);
      if (b % 3 === 2) {   // beans on a bamboo frame
        for (let z = 3; z < B - 2; z += 1.5) [-.4, .4].forEach(dx => { const p = mesh(new THREE.CylinderGeometry(.02, .02, 2, 4), K.bamboo, bx + dx * .6, 1.1, z, s); p.rotation.z = -dx * .5; });
        for (let k = 0; k < 14; k++) part(K.tuftGeo, leafy[2], bx + (r() - .5) * .5, .5 + r() * 1.3, 2.8 + r() * (B - 5), s).scale.setScalar(.8 + r() * .4);
      } else for (let z = 3; z < B - 2; z += .55) [-.3, .3].forEach(dx => part(K.tuftGeo, leafy[(b + (z | 0)) % 2], bx + dx, .28, z, s).scale.set(1, .6 + r() * .5, 1));
    }
    // the gourd trellis by the path and the field hut in the back corner
    [[gx - .9, 2.5], [gx + .9, 2.5], [gx - .9, 6], [gx + .9, 6]].forEach(([x, z]) => mesh(new THREE.CylinderGeometry(.04, .04, 2, 5), K.bamboo, x, 1, z, s));
    mesh(new THREE.BoxGeometry(2, .06, 3.8), K.bamboo, gx, 2, 4.25, s);
    for (let k = 0; k < 16; k++) part(K.tuftGeo, leafy[k % 3], gx + (r() - .5) * 1.9, 2.08, 2.5 + r() * 3.5, s).scale.set(1.3, .5, 1.3);
    const hx = hw - 3, hzz = B - 3;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { mesh(new THREE.CylinderGeometry(.06, .07, 2.2, 6), K.bamboo, hx + a * 1.2, 1.1, hzz + b * 1.1, s); sCircle(s, hx + a * 1.2, hzz + b * 1.1, .08); });
    mesh(new THREE.BoxGeometry(2.4, .08, 1.6), K.bamboo, hx, .5, hzz + .2, s);   // the sitting platform
    const thatch = std({ color: 0xa08a5a, roughness: 1, flatShading: true });
    const rf = tinHipRoof(1.7, 1.6, 1, thatch); rf.position.set(hx, 2.2, hzz); s.add(rf);
    tree(s, -hw + 2, B - 2.2, .8, seed + 3);
  }
