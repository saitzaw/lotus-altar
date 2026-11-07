  /* ---------- 法物流通處 inside the temple shop: shelves of offerings, a counter and the shopkeeper's lamp ---------- */
  /* ---------- the monks' dining and rest room beside the shop: low tables set with alms bowls, cushions, sleeping mats ---------- */
  function quarters(g, n) {
    shell(g, n, { key: 1.0, hemi: .34 });
    const lacq = std({ color: 0x5a1f14, roughness: .5 }), mat = std({ color: 0xc8a868, roughness: .9 }), robe = std({ color: 0xc8701c, roughness: .8 });
    const bowl = std({ color: 0x1a1210, roughness: .3, metalness: .3 }), cushion = std({ color: 0x8a2a1a, roughness: .85 }), white = std({ color: 0xf2eee4, roughness: .8 });
    // two long low dining tables, an alms bowl, a cup and a cushion at each place
    [-1.6, 1.6].forEach(tz => {
      mesh(new THREE.BoxGeometry(5.2, .1, .9), lacq, 0, .42, tz, g);
      [[-2.4, -.3], [2.4, -.3], [-2.4, .3], [2.4, .3]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.1, .38, .1), lacq, x, .19, tz + z, g));
      for (let k = 0; k < 5; k++) [-1, 1].forEach(sd => {
        const x = -2 + k;
        const b = lathe([[0, 0], [.08, 0], [.15, .06], [.16, .14], [.14, .15], [0, .08]], bowl, 18); b.position.set(x, .47, tz + sd * .25); g.add(b);
        mesh(new THREE.CylinderGeometry(.04, .035, .07, 10), white, x + .2, .5, tz + sd * .25, g);
        mesh(new THREE.CylinderGeometry(.24, .26, .08, 16), cushion, x, .04, tz + sd * .75, g);
      });
    });
    // sleeping mats along the left wall, each with a pillow and a folded saffron robe
    for (let k = 0; k < 5; k++) {
      const z = -3.6 + k * 2.1;
      mesh(new THREE.BoxGeometry(1.9, .05, .9), mat, -6.2, .025, z, g);
      mesh(new THREE.BoxGeometry(.4, .14, .7), white, -7.0, .1, z, g);
      mesh(new THREE.BoxGeometry(.45, .1, .4), robe, -5.6, .08, z, g);
    }
    // a rack of alms bowls on the right wall, and a small shrine shelf at the back
    mesh(new THREE.BoxGeometry(.4, 1.2, 4.2), lacq, 6.9, .6, 0, g);
    for (let k = 0; k < 8; k++) { const b = lathe([[0, 0], [.1, 0], [.18, .08], [.19, .18], [.17, .2], [0, .1]], bowl, 18); b.position.set(6.9, 1.2 + (k % 2) * .0, -1.8 + k * .5); g.add(b); mesh(new THREE.CylinderGeometry(.19, .17, .03, 18), robe, 6.9, 1.42, -1.8 + k * .5, g); }
    mesh(new THREE.BoxGeometry(2.4, .1, .6), lacq, 2.5, 1.5, -5.1, g);
    mesh(new THREE.CylinderGeometry(.18, .22, .5, 12), M.gold, 2.5, 1.8, -5.1, g);
    mesh(new THREE.SphereGeometry(.13, 12, 10), M.gold, 2.5, 2.15, -5.1, g);
    const lamp = new THREE.PointLight(0xffc080, 1.2, 9, 2); lamp.position.set(0, 2.6, 0); g.add(lamp);
  }
  // a shelf unit of one kind of offering with `rows` rows of goods, labelled in Chinese; tapping it adds that offering to the basket
  function shopShelf(g, list, key, han, x, z, ry, rows, rr, goodsCols) {
    const sh = new THREE.Group(); sh.position.set(x, 0, z); sh.rotation.y = ry; g.add(sh);
    const H = rows * .6 + .6;
    mesh(new THREE.BoxGeometry(2.0, H, .1), M.lacquer, 0, H / 2, -.22, sh);
    [-1, 1].forEach(sx => mesh(new THREE.BoxGeometry(.08, H, .5), M.lacquer, sx * 1.0, H / 2, 0, sh));
    for (let r = 0; r <= rows; r++) mesh(new THREE.BoxGeometry(2.0, .05, .5), M.wood, 0, .3 + r * .6, 0, sh);
    const pick = new THREE.Mesh(new THREE.BoxGeometry(2.0, H, .6), new THREE.MeshBasicMaterial({ visible: false })); pick.position.y = H / 2; sh.add(pick);
    Object.assign(pick.userData, { shopItem: key, tip: `Add ${key === "fruit" ? "fruit" : key === "incense" ? "incense" : key + "s"} to your basket` });
    list.push(pick);
    for (let r = 0; r < rows; r++) for (let k = 0; k < 6; k++) {
      const px = -.8 + k * .32, py = .33 + r * .6;
      if (key === "flower") { const f = makeLotus(); f.userData.bloom(rr() < .5 ? 1 : .4); f.scale.setScalar(1.1); f.position.set(px, py + .05, .05); sh.add(f); }
      else if (key === "water") { const b = lathe([[0, 0], [.05, 0], [.09, .05], [.1, .1], [.09, .1], [0, .03]], M.brass, 16); b.position.set(px, py, .05); sh.add(b); }
      else if (key === "fruit") { const f = new THREE.Mesh(new THREE.SphereGeometry(.09, 14, 10), [goodsCols[0], goodsCols[1], goodsCols[4]][(rr() * 3) | 0]); f.position.set(px, py + .09, .05); sh.add(f); }
      else if (key === "candle") mesh(new THREE.CylinderGeometry(.05, .05, .3, 12), rr() < .6 ? M.waxRed : M.wax, px, py + .15, .05, sh);
      else { mesh(new THREE.BoxGeometry(.24, .32, .14), goodsCols[(rr() * 6) | 0], px, py + .16, .05, sh); }
    }
    const sign = writing(128, 128, (c, cw, ch) => {
      c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.strokeRect(5, 5, cw - 10, ch - 10);
      c.fillStyle = "#e8c25a"; c.font = HAN_FONT(80); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(han, cw / 2, ch / 2 + 4);
    });
    flat(mesh(new THREE.PlaneGeometry(.5, .5), new THREE.MeshStandardMaterial({ map: sign, roughness: .6, emissive: 0x333333, emissiveMap: sign }), 0, H + .3, .02, sh));
  }
  function shop(g, n) {
    shell(g, n, { key: 1.25 });
    const list = picks[n];
    const goodsCols = [0xc0201a, 0xd8a83a, 0x2f6a5a, 0x3a5a8a, 0xb8683a, 0xe8e2d4].map(c => std({ color: c, roughness: .6 }));
    const rr = rng(77);
    // a shelf unit against the back wall for each kind of offering, labelled in Chinese; tapping one adds it to the basket
    [["flower", "花", -4.4], ["water", "水", -2.2], ["fruit", "果", 0], ["candle", "燈", 2.2], ["incense", "香", 4.4]]
      .forEach(([key, han, x]) => shopShelf(g, list, key, han, x, -4.9, 0, 4, rr, goodsCols));
    // the counter with rosaries, sutra books and a cash box, and the shop's name board above it
    mesh(new THREE.BoxGeometry(5.0, 1.0, .9), M.wood, 0, .5, -1.0, g);
    mesh(new THREE.BoxGeometry(5.1, .06, 1.0), M.trim, 0, 1.03, -1.0, g);
    for (let k = 0; k < 5; k++) { const bead = mesh(new THREE.TorusGeometry(.1, .02, 6, 18), M.wood, -1.8 + k * .3, 1.07, -1.0, g); bead.rotation.x = Math.PI / 2; }
    for (let k = 0; k < 4; k++) mesh(new THREE.BoxGeometry(.3, .06, .22), goodsCols[k], .6 + k * .35, 1.09 + (k % 2) * .06, -1.0, g);
    mesh(new THREE.BoxGeometry(.4, .22, .3), M.lacquer, 2.1, 1.17, -1.0, g);
    const lamp = new THREE.PointLight(0xffc080, 1.4, 8, 2); lamp.position.set(0, 2.4, -.6); g.add(lamp);
    mesh(new THREE.CylinderGeometry(.05, .06, .14, 12), M.brass, -2.2, 1.13, -1.0, g); makeFlame(V(-2.2, 1.25, -1.0), 1.2, lamp, g);
    const name = writing(1024, 192, (c, cw, ch) => {
      c.fillStyle = "#2a1610"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
      c.fillStyle = "#e8c25a"; c.font = HAN_FONT(118); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("法物流通處", cw / 2, ch / 2 + 8);
    });
    flat(mesh(new THREE.PlaneGeometry(3.6, .68), new THREE.MeshStandardMaterial({ map: name, roughness: .6, emissive: 0x2a2a2a, emissiveMap: name }), 0, 4.4, -5.44, g));
  }

