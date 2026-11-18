  /* ---------- the Hluttaw road's north side, from its west end to the Hluttaw's compound: a row of Shan family compounds facing
     the palace lake across the road. Each house stands in its own small yard behind a fence of woven bamboo (ထရံ), split-bamboo
     pickets or a whitewashed brick wall, with a gate onto the road, a path to the stair, bananas, a shade tree, a vegetable bed or a
     washing line, and at some gates a little roofed stand of drinking water pots for passers-by (ရေအိုးစင်) ---------- */
  const ROAD_HOUSES = { x0: -113, front: 263, back: 278.5, set: 4.5 };   // the row's west end; the front and back fences' lines (the road's edge is z 261.5); set: from the front fence to the house's front
  // the lots from west to east: width, fence, house (wood or concrete), storeys, a water pot stand at the gate
  const ROAD_LOTS = [
    { w: 14, fence: "weave", wood: true, floors: 1, pots: true }, { w: 15, fence: "brick", wood: false, floors: 2 },
    { w: 13, fence: "picket", wood: true, floors: 2 }, { w: 16, fence: "weave", wood: true, floors: 2, pots: true },
    { w: 14, fence: "brick", wood: true, floors: 2 }, { w: 15, fence: "picket", wood: true, floors: 1, pots: true },
    { w: 14, fence: "weave", wood: false, floors: 1 }
  ];
  function hluttawRoadHouses(g) {
    const { front: F, back: B, set: SET } = ROAD_HOUSES, r = rng(5150);
    // woven bamboo matting, the strips over and under in a twill
    const weaveTex = canvasTex(64, (c, sz) => {
      const s = sz / 8; c.fillStyle = "#5a4224"; c.fillRect(0, 0, sz, sz);
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
        const hz = (i + j) % 4 < 2; c.fillStyle = hz ? "#c4a466" : "#a88a52"; c.fillRect(i * s + .5, j * s + .5, s - 1, s - 1);
        c.fillStyle = "rgba(70,45,20,.35)"; if (hz) c.fillRect(i * s, j * s + s / 2, s, 1); else c.fillRect(i * s + s / 2, j * s, 1, s);
      }
    });
    weaveTex.wrapS = weaveTex.wrapT = THREE.RepeatWrapping;
    const weave = std({ map: weaveTex, roughness: .9, side: THREE.DoubleSide }), bamboo = std({ color: 0x9a8a50, roughness: .8 });
    const earth = std({ color: 0x8a7458, roughness: 1 }), cap = std({ color: 0xa8a49a, roughness: .85 }), clay = std({ color: 0x9a4a2a, roughness: .7 });
    const greens = std({ color: 0x4a7a2a, roughness: .9, flatShading: true }), cloth = [0xc04040, 0x3a6aa8, 0xe8d060, 0xf0ece0, 0x6a4a8a].map(c => std({ color: c, roughness: .9, side: THREE.DoubleSide }));
    // a box along x with its texture repeated once a metre
    const uvBox = (w, h, d) => { const geo = new THREE.BoxGeometry(w, h, d), uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h); return geo; };
    const postGeo = new THREE.CylinderGeometry(.05, .06, 1.8, 6), slatGeo = new THREE.BoxGeometry(.07, 1, .025), pierGeo = new THREE.BoxGeometry(.3, 1.45, .3);
    const barGeo = new THREE.BoxGeometry(.03, 1.3, .03), railGeo = new THREE.BoxGeometry(1.3, .05, .05), tuftGeo = new THREE.IcosahedronGeometry(.2, 0);
    // a straight run of fence from (x0, z0) to (x1, z1), along x or along z, blocking walkers
    function fence(kind, x0, z0, x1, z1) {
      const len = Math.hypot(x1 - x0, z1 - z0); if (len < .2) return;
      const f = new THREE.Group(); f.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); f.rotation.y = x1 !== x0 ? 0 : Math.PI / 2; g.add(f);
      sWall(g, Math.min(x0, x1) - .06, Math.max(x0, x1) + .06, Math.min(z0, z1) - .06, Math.max(z0, z1) + .06);
      const n = Math.max(1, Math.round(len / 2));
      if (kind === "brick") {   // a whitewashed brick wall with a concrete coping and piers
        mesh(new THREE.BoxGeometry(len, 1.3, .2), whiteWall, 0, .65, 0, f);
        flat(mesh(new THREE.BoxGeometry(len + .06, .07, .3), cap, 0, 1.33, 0, f));
        for (let k = 0; k <= n; k++) part(pierGeo, whiteWall, -len / 2 + k * len / n, .725, 0, f);
        return;
      }
      for (let k = 0; k <= n; k++) part(postGeo, bamboo, -len / 2 + k * len / n, .9, 0, f);   // bamboo posts
      [.35, 1.35].forEach(y => mesh(new THREE.CylinderGeometry(.035, .035, len, 6), bamboo, 0, y, .05, f).rotation.z = Math.PI / 2);   // the rails
      if (kind === "weave") mesh(uvBox(len, 1.55, .03), weave, 0, .85, 0, f);
      else for (let x = -len / 2 + .08; x < len / 2; x += .16) part(slatGeo, bamboo, x, .65, -.04, f).scale.y = 1.15 + r() * .15;   // split-bamboo pickets
    }
    // the gate: brick piers with a pair of steel leaves, or bamboo posts and a lintel with a woven leaf; both stand open into the yard
    function gate(kind, gx, half) {
      if (kind === "brick") {
        [-1, 1].forEach(sd => {
          sPillar(g, gx + sd * (half + .1), F, .25);
          mesh(new THREE.BoxGeometry(.42, 1.75, .42), whiteWall, gx + sd * (half + .1), .875, F, g);
          flat(mesh(new THREE.BoxGeometry(.52, .08, .52), cap, gx + sd * (half + .1), 1.79, F, g));
          const leaf = new THREE.Group(); leaf.position.set(gx + sd * half, 0, F); leaf.rotation.y = sd * 1.25; g.add(leaf);   // turned in toward the yard
          [.25, 1.45].forEach(y => part(railGeo, steel, -sd * half / 2, y, 0, leaf).scale.x = half / 1.3);
          for (let k = 0; k < 6; k++) part(barGeo, steel, -sd * (k + .5) * half / 6, .85, 0, leaf);
        });
        return;
      }
      [-1, 1].forEach(sd => { sPillar(g, gx + sd * half, F, .08); mesh(new THREE.CylinderGeometry(.07, .08, 2.3, 6), bamboo, gx + sd * half, 1.15, F, g); });
      mesh(new THREE.CylinderGeometry(.05, .05, 2 * half + .5, 6), bamboo, gx, 2.15, F, g).rotation.z = Math.PI / 2;
      const leaf = new THREE.Group(); leaf.position.set(gx - half, 0, F); leaf.rotation.y = -1.35; g.add(leaf);
      mesh(uvBox(2 * half - .1, 1.4, .03), weave, half - .05, .85, 0, leaf);
    }
    // a ye-o-zin: a little roofed stand at the gate with clay pots of drinking water and a cup, kept filled for anyone on the road
    const potData = { tip: "ရေအိုးစင် · water pots for passers-by", toast: "A ye-o-zin (ရေအိုးစင်, Burmese): a little roofed stand at the gate with clay pots of drinking water and a cup, kept filled by the household for anyone passing on the road. Giving water to strangers is a common act of merit across Shan State and Myanmar." };
    function potStand(x, z) {
      const s = new THREE.Group(); s.position.set(x, 0, z); g.add(s);
      sRect(s, -.5, .5, -.3, .3);
      [[-.4, -.2], [.4, -.2], [-.4, .2], [.4, .2]].forEach(([px, pz]) => mesh(new THREE.BoxGeometry(.06, 1.65, .06), teakDark, px, .825, pz, s));
      clickable(picks.pagoda, mesh(new THREE.BoxGeometry(.95, .05, .5), teakDark, 0, .95, 0, s), potData);
      [-.22, .22].forEach(px => {
        const p = clickable(picks.pagoda, mesh(new THREE.SphereGeometry(.2, 12, 9), clay, px, 1.18, 0, s), potData); p.scale.y = 1.15;
        mesh(new THREE.CylinderGeometry(.15, .15, .03, 12), teakDark, px, 1.42, 0, s);   // the wooden lid
      });
      mesh(new THREE.CylinderGeometry(.04, .035, .09, 8), steel, 0, 1.02, .12, s);   // the cup
      [-1, 1].forEach(sd => { const rf = mesh(new THREE.BoxGeometry(1.15, .02, .38), rustRoof, 0, 1.78, sd * .16, s); rf.rotation.x = sd * .5; });
    }
    let x = ROAD_HOUSES.x0;
    ROAD_LOTS.forEach((L, i) => {
      const x0 = x, x1 = x + L.w, cx = (x0 + x1) / 2, seed = 820 + i, left = seed % 2 ? 1 : -1, W = L.w >= 15 ? 7.5 : 7, D = 6.5;
      x = x1;
      // the house, facing the road (its front, local +z, turned to −z)
      const hz = F + SET + D / 2 + (L.wood ? 1.6 : 1);
      if (L.wood) shanWoodHouse(g, cx, hz, Math.PI, { W, D, floors: L.floors, seed, roof: seed % 3 ? rustRoof : ROOFS[seed % 4](1) });
      else shanHouse(g, cx, hz, Math.PI, { W, D, floors: L.floors, shop: false, seed, wall: WALLS[(seed * 5) % WALLS.length], roof: ROOFS[seed % 4] });
      // the gate in line with the stair or the door (local x turns to −x), and a path up to the house
      const gx = !L.wood ? cx : cx - left * (L.floors === 1 ? W / 2 - .75 : W / 4), half = L.fence === "brick" ? 1.3 : 1.2, s = Math.sign(gx - cx) || 1;
      gate(L.fence, gx, half);
      flat(mesh(new THREE.BoxGeometry(1.4, .04, SET - (L.wood && L.floors === 1 ? 1.2 : 0)), concrete, gx, .045, F + (SET - (L.wood && L.floors === 1 ? 1.2 : 0)) / 2, g));
      // the swept earth of the yard
      flat(mesh(new THREE.BoxGeometry(L.w - .3, .02, B - F - .3), earth, cx, .02, (F + B) / 2, g)).receiveShadow = true;
      // the fences: the front either side of the gate, the back, the west side (and the east side on the last lot)
      const gp = L.fence === "brick" ? half + .32 : half;
      fence(L.fence, x0, F, gx - gp, F); fence(L.fence, gx + gp, F, x1, F);
      fence(L.fence, x0, B, x1, B);
      fence(L.fence, x0, F, x0, B);
      if (i === ROAD_LOTS.length - 1) fence(L.fence, x1, F, x1, B);
      // the garden: a shade tree in the front corner away from the gate, bananas behind, and a vegetable bed or a washing line by the gate
      tree(g, cx - s * (L.w / 2 - 1.8), F + 2.2, .75 + r() * .15, seed);
      banana(g, cx - s * (L.w / 2 - 1.2), B - 1.4, seed);
      banana(g, cx + s * (L.w / 2 - 1.1), B - 1.6, seed + 40);
      const ex = cx + s * (L.w / 2 - 1.5);
      if (i % 2 === 0) {   // a raised bed of greens and mustard
        mesh(new THREE.BoxGeometry(1.2, .22, 3), earth, ex, .11, F + 2.2, g);
        for (let k = 0; k < 10; k++) part(tuftGeo, greens, ex + (k % 2 - .5) * .5, .26, F + .95 + Math.floor(k / 2) * .62, g).scale.set(1, .7 + r() * .4, 1);
      } else {   // a washing line between two bamboo poles, with the day's washing on it
        [F + 1, F + 3.6].forEach(z => mesh(new THREE.CylinderGeometry(.04, .04, 1.9, 6), bamboo, ex, .95, z, g));
        mesh(new THREE.CylinderGeometry(.008, .008, 2.6, 4), steel, ex, 1.8, F + 2.3, g).rotation.x = Math.PI / 2;
        for (let k = 0; k < 4; k++) { const ch = .6 + r() * .3, c = mesh(new THREE.PlaneGeometry(.55, ch), cloth[(i + k) % cloth.length], ex, 1.79 - ch / 2, F + 1.4 + k * .6, g); c.rotation.y = Math.PI / 2; c.castShadow = false; }
      }
      if (L.pots) potStand(gx + s * (half + 1.1), F - .6);
    });
  }
