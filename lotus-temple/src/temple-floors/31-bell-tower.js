  /* ---------- 鐘樓 the Bell Tower, its own building beside the pagoda: an open pavilion under the night sky ---------- */
  function bellTower(g, n) {
    const PB = .4;   // top of the pavilion's stone platform
    const list = picks[n] = picks[n] || [], sway = [];
    const sky = canvasTex(256, (c, s) => {
      const l = c.createLinearGradient(0, 0, 0, s);
      l.addColorStop(0, "#000000"); l.addColorStop(.3, "#000000"); l.addColorStop(.46, "#000000"); l.addColorStop(.5, "#120a07"); l.addColorStop(1, "#120a07");
      c.fillStyle = l; c.fillRect(0, 0, s, s);
    });
    g.add(new THREE.Mesh(new THREE.SphereGeometry(26, 32, 16), new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide, fog: false })));
    const starPos = [], rs = rng(11);
    for (let i = 0; i < 300; i++) { const a = rs() * TAU, e = .2 + rs() * 1.2; starPos.push(Math.cos(a) * Math.cos(e) * 24, Math.sin(e) * 24, Math.sin(a) * Math.cos(e) * 24); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: .25, color: 0xfff4e0, map: glowTex, transparent: true, depthWrite: false, fog: false })); g.add(stars);
    daySky(g, 26, stars);
    const ground = flat(mesh(new THREE.CircleGeometry(26, 48), std({ color: 0x2a211b, roughness: 1 }), 0, 0, 0, g)); ground.rotation.x = -Math.PI / 2;
    // the pavilion round the bell: stone platform, eight columns, painted beams and ceiling, low balustrade, tiled eave
    const P = new THREE.Group(); P.position.z = -1.6; g.add(P);
    oct(mesh(new THREE.CylinderGeometry(4.6, 4.7, .2, 8), M.stone, 0, .1, 0, P));
    oct(mesh(new THREE.CylinderGeometry(4.2, 4.3, .2, 8), M.stone, 0, .3, 0, P));
    mesh(new THREE.BoxGeometry(2.2, .2, .8), M.stone, 0, .1, 4.6, P);
    const RC = 3.8, TOP = PB + 4.4;
    for (let k = 0; k < 8; k++) {
      const c = k / 8 * TAU + R8, x = Math.sin(c) * RC, z = Math.cos(c) * RC;
      mesh(new THREE.CylinderGeometry(.17, .2, TOP - PB, 16), pillarRed, x, (TOP + PB) / 2, z, P);
      mesh(new THREE.CylinderGeometry(.3, .32, .14, 16), M.stone, x, PB + .07, z, P);
    }
    const rail = new THREE.Group(); rail.position.y = PB; P.add(rail); balustrade(rail, RC - .02, [0], redRail);
    paintedBeam(P, TOP - .3, RC + .03, .6);
    const coffer = canvasTex(512, (c, s) => {
      const h = s / 2; c.fillStyle = "#1f4f3a"; c.fillRect(0, 0, s, s);
      [.92, .7, .48].forEach((r, i) => { c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.beginPath(); for (let k = 0; k <= 8; k++) { const a = k / 8 * TAU + R8; c.lineTo(h + Math.sin(a) * h * r, h + Math.cos(a) * h * r); } c.stroke(); if (i === 1) { c.fillStyle = "#1f4f8a"; c.fill(); } });
      c.fillStyle = "#a42418"; c.beginPath(); c.arc(h, h, h * .3, 0, TAU); c.fill(); c.strokeStyle = "#e8c25a"; c.lineWidth = 6; c.stroke();
    });
    const ceil = flat(mesh(new THREE.CircleGeometry(RC + .05, 8), std({ map: coffer, roughness: .7 }), 0, TOP - .6, 0, P)); ceil.rotation.set(Math.PI / 2, 0, R8);
    brackets(P, TOP - .2, RC + .06, 4);
    tiledEave(P, TOP - .05, 2.6, 5.4, 1.1, .55);
    [-1, 1].forEach(sx => { const c = sx * R8; sway.push(lantern(P, Math.sin(c) * (RC - .5), TOP - 1.4, Math.cos(c) * (RC - .5), TOP - .6, .9)); });
    const hemiB = new THREE.HemisphereLight(0x7080c8, 0x2a1408, .45); g.add(hemiB); dayLight(hemiB, [0x7080c8, .45, 0x2a1408], [0xd8e8ff, 1.0, 0x5a4a38]);
    const moon = new THREE.DirectionalLight(0xb8c4ff, .55); moon.position.set(-8, 10, 6); g.add(moon); dayLight(moon, [0xb8c4ff, .55], [0xfff0d8, 1.4]);
    const key = new THREE.SpotLight(0xffc890, 1.5, 24, .55, .6, 1); key.position.set(2.8, 6, 6.5); key.target.position.set(0, 2.4, -1.6); g.add(key, key.target);
    const warm = new THREE.PointLight(0xffa850, .8, 8, 2); warm.position.set(0, TOP - 1, -1.6); g.add(warm);
    updaters[n].push((dt, t, motion) => sway.forEach((l, i) => l.rotation.z = Math.sin(t * .7 + i * 2) * .03 * motion));
    // the great bronze bell in its frame, with the striking log
    const BX = 0, BZ = -1.6;
    [-1.05, 1.05].forEach(dx => mesh(new THREE.BoxGeometry(.22, 3.6, .22), M.lacquer, BX + dx, PB + 1.8, BZ, g));
    mesh(new THREE.BoxGeometry(2.6, .28, .3), M.lacquer, BX, PB + 3.55, BZ, g);
    mesh(new THREE.BoxGeometry(2.7, .06, .34), M.trim, BX, PB + 3.39, BZ, g);
    const bell = new THREE.Group(); bell.position.set(BX, PB + 3.36, BZ); bell.scale.setScalar(.82); g.add(bell);
    const bellBody = lathe(BELL_PROFILE, M.bronze, 56);
    bellBody.castShadow = true; bell.add(bellBody);
    [-.5, -1.0, -1.5].forEach(y => { const t = mesh(new THREE.TorusGeometry(y < -1.2 ? .62 : .54, .018, 6, 56), M.bronze, 0, y, 0, bell); t.rotation.x = Math.PI / 2; });
    mesh(new THREE.TorusGeometry(.1, .03, 8, 24), M.bronze, 0, .02, 0, bell);
    clickable(list, bellBody, { tip: "Ring the great bell", act: "bell" });
    const logPivot = new THREE.Group(); logPivot.position.set(BX, PB + 3.45, BZ + 1.05); g.add(logPivot);
    [-.6, .6].forEach(dz => mesh(new THREE.CylinderGeometry(.012, .012, 1.4, 4), M.feature, 0, -.7, dz * .2, logPivot));
    const log = mesh(new THREE.CylinderGeometry(.12, .12, 1.3, 20), M.wood, 0, -1.4, .5, logPivot); log.rotation.x = Math.PI / 2;
    actions[n] = act => {
      if (act === "bell") {
        tween(2.6, t => {
          logPivot.rotation.x = t < .35 ? -.3 * Math.sin(Math.PI / 2 * t / .35) : t < .45 ? -.3 + .36 * (t - .35) / .1 : .06 * (1 - clamp((t - .45) / .55, 0, 1)); // draw back, swing in, settle
          const w = t > .42 ? Math.sin((t - .42) * 30) * .025 * (1 - t) : 0;
          bell.rotation.x = w; bell.rotation.z = w * .5;
        });
        setTimeout(() => [[98, .35, 7], [196 * 1.19, .14, 5], [98 * 2.76, .09, 3.5], [98 * 5.4, .04, 2]].forEach(([f, p, d]) => tone(f, null, p, d)), reduceMotion ? 0 : 1100);
      }
    };
  }

