  /* ---------- 2F 千燈殿 Hall of a Thousand Lamps ---------- */
  function lampHall(g, n) {
    shell(g, n, { key: 1.1 });
    const cup = lathe([[0, 0], [.03, 0], [.045, .02], [.05, .035], [.044, .035], [0, .012]], M.brass, 16);
    const flicker = [];
    // three stepped pyramids of oil lamps
    [-2.4, 0, 2.4].forEach((cx, p) => {
      const cz = p === 1 ? -1.8 : -1.1, steps = [.78, .6, .42, .24];
      steps.forEach((half, i) => {
        const bottom = PLAT + i * .26, top = bottom + .26, w = half * 2;
        mesh(new THREE.BoxGeometry(w, .26, w), M.lacquer, cx, bottom + .13, cz, g);
        mesh(new THREE.BoxGeometry(w + .012, .018, w + .012), M.trim, cx, top - .03, cz, g);
        if (i < steps.length - 1) {
          const o = (half + steps[i + 1]) / 2;
          squareRing(o, i === 0 ? 5 : i === 1 ? 4 : 3).forEach(([dx, dz]) => {
            const c = cup.clone(); c.position.set(cx + dx, top, cz + dz); g.add(c);
            const fl = makeFlame(V(cx + dx, top + .06, cz + dz), .7, null, g); flicker.push(fl);
          });
        }
      });
      // a large lotus lamp crowns each pyramid
      const top = PLAT + steps.length * .26;
      const lot = makeLotus(); lot.userData.bloom(1); lot.scale.setScalar(3); lot.position.set(cx, top + .02, cz); g.add(lot);
      const light = new THREE.PointLight(0xffa04a, 1.1, 5, 2); light.position.set(cx, top + .5, cz); g.add(light);
      makeFlame(V(cx, top + .26, cz), 2.2, light, g);
    });
    // a free-standing rack of oil lamps and candles across the back of the hall, well clear of the wall: three stepped shelves
    // on lacquered legs, the back shelf highest, so every flame stands in the open and away from the timber and plaster
    const RACK = { x0: -3.4, x1: 4.6, z: -4.1 }, rw = RACK.x1 - RACK.x0, rx = (RACK.x0 + RACK.x1) / 2;
    const candleGeo = new THREE.CylinderGeometry(.022, .022, .14, 10), holderGeo = new THREE.CylinderGeometry(.036, .04, .012, 12);
    [[.62, 0], [.92, -.26], [1.22, -.52]].forEach(([y, dz], r) => {
      const z = RACK.z + dz;
      part(new THREE.BoxGeometry(rw, .05, .24), M.lacquer, rx, y, z, g);
      part(new THREE.BoxGeometry(rw + .02, .015, .02), M.trim, rx, y + .02, z + .12, g);
      for (let x = RACK.x0 + .05; x <= RACK.x1; x += rw / 5) part(new THREE.BoxGeometry(.06, y, .06), M.lacquer, x, y / 2, z, g);
      for (let k = 0; k < 15; k++) {
        const x = RACK.x0 + .25 + k * (rw - .5) / 14, lamp = (k + r) % 2 === 0;
        if (lamp) { part(cup.geometry, M.brass, x, y + .025, z, g); flicker.push(makeFlame(V(x, y + .085, z), .6, null, g)); }
        else {
          part(holderGeo, M.brass, x, y + .031, z, g); part(candleGeo, (k + r) % 4 === 1 ? M.waxRed : M.wax, x, y + .107, z, g);
          flicker.push(makeFlame(V(x, y + .195, z), .7, null, g));
        }
      }
    });
    bakeParts(g);
    // one great lotus lamp on a pedestal at the front
    mesh(new THREE.CylinderGeometry(.3, .38, .5, 8), M.stone, 0, PLAT + .25, 1.6, g);
    const big = makeLotus(); big.userData.bloom(1); big.scale.setScalar(5.5); big.position.set(0, PLAT + .52, 1.6); g.add(big);
    const bl = new THREE.PointLight(0xffb060, 1.3, 6, 2); bl.position.set(0, PLAT + 1.2, 1.6); g.add(bl);
    makeFlame(V(0, PLAT + .92, 1.6), 3.2, bl, g);
  }

  /* ---------- 蓮華寺 the great hall beside the pond: Shakyamuni Buddha, laid out like Guanyin's hall, and the wishing tree
     on the right with the Victorious Buddha seated beneath it ---------- */
  function library(g, n) {
    statueHall(g, n, {
      figure: "shakyamuni", label: "Shakyamuni Buddha", petal: M.gold, ring: M.gold, haloColor: 0xffe2a0, glow: 0xffc070,
      aura: auraTexture("rgba(255,240,200,.9)", "rgba(255,190,90,.4)", "rgba(255,220,150,.26)")
    });
    vaseOfLotus(g, -1.02, ALT.z - .12);
    // kneeling cushions before the censer
    [-.7, .7].forEach(x => mesh(new THREE.CylinderGeometry(.3, .32, .14, 32), M.cushion, x, .07, 2.9, g));
    wishTree(g, n, WISH_TREE);
  }

