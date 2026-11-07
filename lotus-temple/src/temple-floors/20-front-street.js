  /* ---------- the far side of the front street: a row of modern Shan houses and shophouses from the foot of the stupa hill
     eastward, the view from the main gate left open, and the daily town market (ဈေး) across from the seven-day market ---------- */
  function streetFrontage(g) {
    const list = picks.pagoda, EDGE = 60.8;   // the street's south pavement edge
    // houses: each faces the street; a gap is left opposite the main gate and the stair path to the hill stays clear
    const kinds = [
      { W: 8, D: 7, floors: 2, shop: true }, { W: 7, D: 7, floors: 2, shop: false }, { W: 9, D: 8, floors: 3, shop: true },
      { W: 7, D: 7, floors: 1, shop: false }, { W: 8, D: 7, floors: 2, shop: true }, { W: 7, D: 8, floors: 2, shop: false }
    ];
    let x = -43, i = 0;
    while (x < 34) {   // the row stops short of the market lane and its banyan
      const k = kinds[i % kinds.length], cx = x + k.W / 2;
      if (Math.abs(cx) < k.W / 2 + 6) { x = 6.5; continue; }   // keep the view from the main gate open
      shanHouse(g, cx, EDGE + k.D / 2 + 2.4, Math.PI, { ...k, wall: WALLS[(i * 5 + 1) % WALLS.length], roof: ROOFS[(i * 3 + 2) % ROOFS.length], seed: 40 + i });
      x += k.W + 2.0; i++;
    }
    // and east of the daily market, facing the fire and police stations across the street
    for (x = 104; ;) {
      const k = kinds[i % kinds.length], cx = x + k.W / 2;
      if (x + k.W > 145) break;
      shanHouse(g, cx, EDGE + k.D / 2 + 2.4, Math.PI, { ...k, wall: WALLS[(i * 5 + 1) % WALLS.length], roof: ROOFS[(i * 3 + 2) % ROOFS.length], seed: 40 + i });
      x += k.W + 2.0; i++;
    }
    // a small paved plaza opposite the gate, with a banyan-like shade tree and benches
    flat(mesh(new THREE.BoxGeometry(11, .05, 10), M.stone, 0, .03, EDGE + 5.4, g));
    tree(g, 0, EDGE + 7, 1.5, 93);
    [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(2.2, .1, .5), M.wood, sd * 3.2, .45, EDGE + 5.6, g); [-.9, .9].forEach(dx => mesh(new THREE.BoxGeometry(.1, .45, .4), M.wood, sd * 3.2 + dx, .22, EDGE + 5.6, g)); });

    // the daily market, opposite the seven-day market: a big open market hall of steel columns under a corrugated roof,
    // rows of stalls inside, and umbrella stalls and parked motorbikes in the forecourt
    const X0 = 44, X1 = 100, Z0 = EDGE + 1, Z1 = EDGE + 42;
    const ground = std({ color: 0x8a867e, roughness: .9 });
    onDaylight(d => ground.color.copy(lerpC(0x3a3834, 0x5e5a52, d)));
    clickable(list, flat(mesh(new THREE.BoxGeometry(X1 - X0, .06, Z1 - Z0), ground, (X0 + X1) / 2, .03, (Z0 + Z1) / 2, g)),
      { tip: "The daily market · ဈေး", toast: "The town's everyday market, open from dawn: vegetables and fish, rice and noodles, tea leaf and spices, cloth and hardware under one big roof." });
    const steelM = std({ color: 0x5a5e62, roughness: .4, metalness: .7 });
    const HX0 = 50, HX1 = 94, HZ0 = Z0 + 10, HZ1 = Z1 - 3, HH = 6;
    for (let hx = HX0; hx <= HX1 + .01; hx += 5.5) for (let hz = HZ0; hz <= HZ1 + .01; hz += (HZ1 - HZ0) / 4) sCircle(g, hx, hz, .2), mesh(new THREE.CylinderGeometry(.15, .15, HH, 8), steelM, hx, HH / 2, hz, g);
    const roofT = corrugated("#8a8c8e", "#c0c4c8", "#5e6064"); roofT.repeat.set((HX1 - HX0) / 1.5, 1);
    const roofMat = std({ map: roofT, roughness: .45, metalness: .45, side: THREE.DoubleSide });
    const hw = (HZ1 - HZ0) / 2 + 1.5, pitch = .22, len = hw / Math.cos(pitch), midZ = (HZ0 + HZ1) / 2;
    [-1, 1].forEach(sd => { const r = mesh(new THREE.BoxGeometry(HX1 - HX0 + 3, .08, len), roofMat, (HX0 + HX1) / 2, HH + Math.tan(pitch) * hw / 2, midZ + sd * hw / 2, g); r.rotation.x = sd * pitch; });
    mesh(new THREE.BoxGeometry(HX1 - HX0 + 3, .3, .3), steelM, (HX0 + HX1) / 2, HH + Math.tan(pitch) * hw + .05, midZ, g);
    // a raised clerestory along the ridge to let the light and smoke out
    mesh(new THREE.BoxGeometry(HX1 - HX0 - 4, 1.0, 3), std({ color: 0xd8d4c8, roughness: .8 }), (HX0 + HX1) / 2, HH + Math.tan(pitch) * hw + .5, midZ, g);
    const sign = writing(768, 160, (c, cw, ch) => {
      c.fillStyle = "#2f7a4a"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#f2d27a"; c.lineWidth = 10; c.strokeRect(6, 6, cw - 12, ch - 12);
      c.fillStyle = "#fff4d0"; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = '600 62px "Noto Sans Myanmar", "Myanmar Text", sans-serif'; c.fillText("မြို့မဈေး", cw / 2, 60);
      c.font = '600 34px "Figtree", sans-serif'; c.fillText("Town market", cw / 2, 124);
    });
    if (document.fonts && document.fonts.load) document.fonts.load('600 62px "Noto Sans Myanmar"', "ဈေး").then(() => { sign.needsUpdate = true; }, () => {});
    clickable(list, flat(mesh(new THREE.PlaneGeometry(7, 1.5), std({ map: sign, emissive: 0xffffff, emissiveMap: sign, emissiveIntensity: .35, roughness: .6, side: THREE.DoubleSide }), (HX0 + HX1) / 2, HH - .9, HZ0 - .2, g)).rotateY(Math.PI),   // faces the street
      { tip: "The daily market · ဈေး", toast: "The town's everyday market, open from dawn: vegetables and fish, rice and noodles, tea leaf and spices, cloth and hardware under one big roof." });
    // stalls under the roof: long concrete counters in rows, piled with goods
    const GOODS = [0xc8402e, 0xf0881c, 0x8ab83a, 0xe8d050, 0x6a4a2a, 0xf4f0e4, 0x3a6ac0, 0xd04a8a, 0x4a8a3a].map(c => std({ color: c, roughness: .6 }));
    const counter = std({ color: 0xb8b4ac, roughness: .9 }), tile2 = std({ color: 0xe8e4dc, roughness: .5 }), r = rng(555);
    const goods = new THREE.InstancedMesh(new THREE.BoxGeometry(.32, .22, .32), std({ color: 0xffffff, roughness: .6 }), 1400), m4 = new THREE.Matrix4(), tc = new THREE.Color();
    let n = 0;
    for (let row = 0; row < 4; row++) {
      const cz = HZ0 + 3 + row * (HZ1 - HZ0 - 6) / 3;
      for (let seg = 0; seg < 3; seg++) {
        const sx0 = HX0 + 2 + seg * 14, L = 12;
        mesh(new THREE.BoxGeometry(L, .85, 1.6), counter, sx0 + L / 2, .43, cz, g);
        sRect(g, sx0, sx0 + L, cz - .8, cz + .8);
        mesh(new THREE.BoxGeometry(L + .1, .05, 1.7), tile2, sx0 + L / 2, .88, cz, g);
        for (let k = 0; k < 30 && n < 1400; k++) {
          const gx = sx0 + .4 + (k % 15) * .76, gz = cz + (k < 15 ? -.35 : .35), h = .6 + r() * .9;
          goods.setMatrixAt(n, m4.compose(V(gx, .9 + .11 * h, gz), new THREE.Quaternion(), V(1, h, 1)));
          goods.setColorAt(n++, tc.copy(GOODS[(r() * GOODS.length) | 0].color));
        }
      }
    }
    goods.count = n; g.add(goods);
    // hanging bulbs under the roof, lit at night
    for (let hx = HX0 + 3; hx < HX1; hx += 6) for (let row = 0; row < 4; row++) {
      const b = glowSprite(0xfff0c8, 1.1, .8); b.material.fog = false; b.position.set(hx, HH - 1.2, HZ0 + 3 + row * (HZ1 - HZ0 - 6) / 3); g.add(b);
      onDaylight(d => b.material.opacity = .85 * (1 - d) + .05);
    }
    // the forecourt: umbrella stalls along the street, motorbikes parked in a row
    const UMB = [0x2a6ac0, 0xe0702a, 0x2f8a4a, 0xc02a2a, 0xe8c030].map(c => std({ color: c, roughness: .7, side: THREE.DoubleSide }));
    for (let ux = X0 + 3; ux < X1 - 2; ux += 5) {
      const uz = Z0 + 3.5;
      mesh(new THREE.CylinderGeometry(.04, .04, 2.6, 6), steelM, ux, 1.3, uz, g);
      sRect(g, ux - .9, ux + .9, uz - .5, uz + .5);
      mesh(new THREE.ConeGeometry(1.7, .55, 8, 1, true), UMB[((ux - X0) / 5 | 0) % UMB.length], ux, 2.7, uz, g).castShadow = false;
      mesh(new THREE.BoxGeometry(1.8, .7, 1.0), M.wood, ux, .35, uz, g);
      for (let k = 0; k < 4; k++) mesh(new THREE.SphereGeometry(.14, 8, 6), GOODS[(r() * GOODS.length) | 0], ux - .6 + k * .4, .82, uz, g);
    }
    const bikeC = [0xc02a2a, 0x1a1a1c, 0x2a5aa0, 0xe8e4dc].map(c => std({ color: c, roughness: .4, metalness: .3 })), tyre = std({ color: 0x141414, roughness: .8 });
    for (let k = 0; k < 14; k++) {
      const bx = X0 + 4 + k * 1.1, bz = Z0 + 7.2, b = new THREE.Group(); b.position.set(bx, 0, bz); b.rotation.y = .2; g.add(b);
      [-.6, .6].forEach(wz => { const w = mesh(new THREE.TorusGeometry(.28, .08, 6, 14), tyre, 0, .32, wz, b); w.rotation.y = Math.PI / 2; });
      mesh(new THREE.BoxGeometry(.28, .35, 1.1), bikeC[k % 4], 0, .6, 0, b);
      mesh(new THREE.BoxGeometry(.3, .12, .6), tyre, 0, .85, -.1, b);
      mesh(new THREE.BoxGeometry(.6, .05, .05), steelM, 0, 1.05, .55, b);
    }
  }
