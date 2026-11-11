  /* ---------- 6F 降魔殿 the Victorious Buddha, and the wishing tree in the Lotus Temple hall with him seated beneath it ---------- */
  // the Victorious Buddha (Jaya Buddha): the Buddha in the earth-touching gesture with which he overcame Māra on the night of his
  // awakening, with the tall flame-like finial of Shan and Burmese images; people pray before him for success
  function victoryHall(g, n) {
    statueHall(g, n, {
      figure: "jaya", label: "the Victorious Buddha", petal: M.gold, ring: M.gold, haloColor: 0xffe0a0, glow: 0xffb860,
      aura: auraTexture("rgba(255,238,200,.9)", "rgba(255,160,60,.42)", "rgba(255,210,130,.28)")
    });
    vaseOfLotus(g, -1.02, ALT.z - .12);
  }
  // in the Lotus Temple hall, right of Shakyamuni: x, z of the trunk and the tree's size
  const WISH_TREE = { x: 4.7, z: 3.3, s: .72 };
  // the wishing tree at (x, z) scaled by s, ringed by a low fence, with a small Victorious Buddha seated on a stone before its trunk
  function wishTree(hall, n, { x, z, s }) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); hall.add(g);
    const list = picks[n];
    const rnd = rng(7), bark = std({ color: 0x4a3222, roughness: .9 }), leaf = std({ color: 0x2f5a26, roughness: .8, flatShading: true });
    const TX = 0, TZ = -.5, tips = [];   // the trunk stands a little behind the middle of the fence, leaving room for the Buddha
    const seat = new THREE.Group(); seat.position.set(0, 0, .75); g.add(seat);
    mesh(new THREE.CylinderGeometry(.62, .7, .5, 8), M.stone, 0, .25, 0, seat);
    const bud = new THREE.Group(); bud.position.y = .5; bud.scale.setScalar(.5); seat.add(bud);
    throne(bud, M.gold);
    sculptFigure("jaya", bud, "the Victorious Buddha");
    const trunk = mesh(new THREE.CylinderGeometry(.24, .4, 1.5, 16), bark, TX, PLAT + .75, TZ, g);
    clickable(list, trunk, { tip: "Hang a wish ribbon", act: "wish" });
    function branch(from, dir, len, rad, depth) {
      const to = from.clone().addScaledVector(dir, len);
      const b = mesh(new THREE.CylinderGeometry(rad * .7, rad, len, 10), bark, 0, 0, 0, g);
      b.position.copy(from).lerp(to, .5); b.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
      if (depth === 0) { tips.push(to); return; }
      const k = depth === 3 ? 4 : 3;
      for (let i = 0; i < k; i++) {
        const a = i / k * TAU + rnd() * .8, tilt = .85 + rnd() * .45;
        const nd = V(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt)).add(dir.clone().multiplyScalar(.6)).normalize();
        branch(to, nd, len * (.95 + rnd() * .2), rad * .62, depth - 1);
      }
    }
    branch(V(TX, PLAT + 1.45, TZ), V(0, 1, 0), .7, .24, 3);
    const leafGeo = new THREE.IcosahedronGeometry(.5, 1);
    tips.forEach(p => { const l = mesh(leafGeo, leaf, p.x, p.y + .1, p.z, g); l.scale.setScalar(.7 + rnd() * .5); });
    // red ribbons and wooden wish plaques hang from the branches
    const ribbonMat = std({ color: 0xc41a10, roughness: .6, side: THREE.DoubleSide, emissive: 0x300000 });
    const ribbons = [];
    function hang(p, animate) {
      const piv = new THREE.Group(); piv.position.copy(p); g.add(piv);
      const len = .35 + rnd() * .35;
      const rb = mesh(new THREE.PlaneGeometry(.05, len), ribbonMat, 0, -len / 2, 0, piv); rb.castShadow = false;
      if (rnd() < .3) { const tag = mesh(new THREE.BoxGeometry(.1, .14, .012), M.wood, 0, -len - .06, 0, piv); tag.castShadow = false; }
      piv.rotation.y = rnd() * TAU;
      const r = { piv, ph: rnd() * TAU, amp: .08 + rnd() * .1 };
      ribbons.push(r);
      if (animate) { piv.scale.y = .01; tween(.8, t => piv.scale.y = Math.max(.01, easeOut(t))); }
      return r;
    }
    tips.forEach(tp => { for (let i = 0; i < 4; i++) hang(V(tp.x + (rnd() - .5) * .7, tp.y - .25 - rnd() * .3, tp.z + (rnd() - .5) * .7), false); });
    // a low stone fence around the tree
    for (let i = 0; i < 20; i++) {
      const a = i / 20 * TAU;
      mesh(new THREE.BoxGeometry(.14, .5, .14), M.stone, Math.cos(a) * 2.2, PLAT + .25, Math.sin(a) * 2.2, g);
    }
    const fence = mesh(new THREE.TorusGeometry(2.2, .05, 6, 60), M.lacquer, 0, PLAT + .45, 0, g); fence.rotation.x = Math.PI / 2;
    updaters[n].push((dt, t, motion) => ribbons.forEach(r => { r.piv.rotation.z = Math.sin(t * 1.4 + r.ph) * r.amp * motion; r.piv.rotation.x = Math.sin(t * 1.1 + r.ph * 2) * r.amp * .5 * motion; }));
    actions[n] = () => {   // the trunk's only action in its hall
      const tp = tips[(rnd() * tips.length) | 0];
      hang(V(tp.x + (rnd() - .5) * .6, tp.y - .3, tp.z + (rnd() - .5) * .6), true);
      tone(1320, null, .08, .8); tone(1980, null, .04, .6);
      return { toast: "A red ribbon is tied to the wishing tree, beneath the Victorious Buddha. May your wish succeed." };
    };
  }

  /* ---------- 7F 彌勒殿 Maitreya ---------- */
  function maitreyaHall(g, n) {
    statueHall(g, n, {
      figure: "maitreya", label: "Maitreya", petal: M.gold, ring: M.gold, haloColor: 0xffd27a, glow: 0xffb060,
      aura: auraTexture("rgba(255,236,190,.85)", "rgba(255,170,70,.38)", "rgba(255,210,140,.24)")
    });
    // longevity peaches and oranges, and a pile of gold ingots (元寶) at the centre
    const peach = m => { const p = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(.075, 20, 14), m); b.scale.set(1, 1.05, 1); b.castShadow = true; p.add(b); const tip = new THREE.Mesh(new THREE.ConeGeometry(.03, .05, 12), m); tip.position.y = .08; p.add(tip); return p; };
    fruitPlate(g, -1.02, ALT.z - .12, [std({ color: 0xf6b7a6, roughness: .6 }), std({ color: 0xf29a8a, roughness: .6 })], peach);
    const ingot = () => { const i = new THREE.Group(); const b = new THREE.Mesh(petalGeo, M.gold); b.scale.set(.1, .045, .06); i.add(b); const k = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 8), M.gold); k.position.y = .035; i.add(k); return i; };
    [[0, 0, 0], [-.13, 0, .05], [.13, 0, .05], [-.06, .07, .02], [.07, .07, .02], [0, .13, .03]].forEach(([x, y, z]) => { const i = ingot(); i.position.set(x, ALT.y + .05 + y, ALT.z - .27 + z); g.add(i); });
  }

  const BUILD = { 2: lampHall, 3: meditationHall, 4: medicineHall, 5: guanyinShop, 6: victoryHall, 7: maitreyaHall, bell: bellTower, library, shop, quarters, kyaung: kyaungHall, church: churchHall, haw: hawHall };
  function floor(n) {
    if (!groups[n]) {
      const g = new THREE.Group(); g.name = "floor" + n; world.add(g);
      updaters[n] = updaters[n] || [];
      BUILD[n](g, n);
      daylit(g);
      groups[n] = g;
    }
    return groups[n];
  }

