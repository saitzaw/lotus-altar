  /* ---------- 3F 禪堂 Meditation Hall ---------- */
  function ensoTex() {
    return writing(256, 640, (c, w, h) => {
      c.fillStyle = "#efe2c4"; c.fillRect(0, 0, w, h);
      c.fillStyle = "#6b4a2a"; c.fillRect(0, 0, w, 18); c.fillRect(0, h - 18, w, 18);
      c.strokeStyle = "rgba(25,20,16,.88)"; c.lineCap = "round";
      for (let i = 0; i < 26; i++) {           // a single brush circle, thick to thin
        c.lineWidth = 22 - i * .7; c.beginPath(); c.arc(w / 2, 230, 88, -1.4 + i * .2, -1.2 + i * .2); c.stroke();
      }
      c.fillStyle = "#231a14"; c.font = HAN_FONT(110); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("禪", w / 2, 450);
      c.fillStyle = "#b3261e"; c.fillRect(w / 2 - 16, h - 80, 32, 32);
    });
  }
  function meditationHall(g, n) {
    shell(g, n, { key: .95, hemi: .28 });
    const mat = std({ color: 0x2b2547, roughness: .9 }), zafu = std({ color: 0x4a2c6e, roughness: .85 }), tat = std({ color: 0x9c8a55, roughness: .95 });
    flat(mesh(new THREE.BoxGeometry(7.2, .03, 4.6), tat, 0, PLAT + .015, -.2, g));
    for (let r = 0; r < 3; r++) for (let c = -2; c <= 2; c++) {
      const x = c * 1.35, z = -1.7 + r * 1.45;
      mesh(new THREE.BoxGeometry(1.0, .06, 1.0), mat, x, PLAT + .06, z, g);
      const cu = mesh(new THREE.CylinderGeometry(.26, .29, .16, 28), zafu, x, PLAT + .17, z, g);
      mesh(new THREE.TorusGeometry(.275, .02, 6, 28), zafu, x, PLAT + .17, z, g).rotation.x = Math.PI / 2;
    }
    // low altar with a single incense stick and lamp under the ensō scroll
    mesh(new THREE.BoxGeometry(2.4, .5, .6), M.lacquer, 0, PLAT + .25, -3.7, g);
    mesh(new THREE.BoxGeometry(2.5, .04, .7), M.trim, 0, PLAT + .5, -3.7, g);
    mesh(new THREE.CylinderGeometry(.12, .1, .12, 20), M.bronze, -.4, PLAT + .58, -3.7, g);
    mesh(new THREE.CylinderGeometry(.004, .004, .4, 5), INC, -.4, PLAT + .82, -3.7, g);
    const ember = glowSprite(0xff5a20, .06, 1); ember.position.set(-.4, PLAT + 1.02, -3.7); g.add(ember);
    const lamp = new THREE.PointLight(0xffb060, .9, 5, 2); lamp.position.set(.5, PLAT + 1, -3.6); g.add(lamp);
    mesh(new THREE.CylinderGeometry(.05, .06, .1, 12), M.brass, .5, PLAT + .57, -3.7, g);
    makeFlame(V(.5, PLAT + .66, -3.7), 1.2, lamp, g);
    flat(mesh(new THREE.PlaneGeometry(1.2, 3.0), new THREE.MeshStandardMaterial({ map: ensoTex(), roughness: .9 }), 0, 3.5, -5.44, g));
    [["靜心", -2.0], ["觀照", 2.0]].forEach(([t, x]) => flat(mesh(new THREE.PlaneGeometry(.6, 2.1), new THREE.MeshStandardMaterial({ map: scrollTex(t), roughness: .9 }), x, 3.4, -5.44, g)));
    // the wooden board (版) struck to call the hour, hanging at the side
    [-.4, .4].forEach(dz => mesh(new THREE.BoxGeometry(.08, 2.2, .08), M.lacquer, 3.6, PLAT + 1.1, .8 + dz, g));
    mesh(new THREE.BoxGeometry(.12, .1, 1.0), M.lacquer, 3.6, PLAT + 2.2, .8, g);
    mesh(new THREE.BoxGeometry(.08, .45, .65), M.wood, 3.6, PLAT + 1.55, .8, g);
  }
  const INC = std({ color: 0x8b3a1a, roughness: .9 });

  /* ---------- 5F 千手觀音殿 the Thousand-Armed Guanyin, with the pagoda's own offerings shop along the walls ---------- */
  // her thousand arms: rings of gilded forearms fanning out behind her from the shoulders, an eye in every palm
  function thousandArms(st) {
    const C = V(0, 1.75, -.5), Z = V(0, 0, 1), q = new THREE.Quaternion(), m4 = new THREE.Matrix4(), hands = [];
    [[.95, 34, .3], [1.22, 44, .32], [1.5, 56, .34]].forEach(([r, count, len], k) => {
      const z = C.z - k * .05;
      for (let i = 0; i < count; i++) {
        const a = (i + k * .5) / count * TAU, dx = Math.cos(a), dy = Math.sin(a);
        if (C.y + dy * r < .8) continue;   // none reach down into the lotus throne
        q.setFromAxisAngle(Z, a - Math.PI / 2);
        const at = d => V(dx * d, C.y + dy * d, z);
        hands.push({ arm: [at(r - len / 2), q.clone(), V(1, len, 1)], palm: [at(r + .05), q.clone(), V(.045, .07, .014)], eye: [at(r + .05).setZ(z + .013), q.clone(), V(.018, .008, .006)] });
      }
    });
    const set = (geo, mat, key, shadow) => {
      const im = new THREE.InstancedMesh(geo, mat, hands.length);
      hands.forEach((h, i) => im.setMatrixAt(i, m4.compose(...h[key])));
      im.castShadow = shadow; st.add(im);
    };
    set(new THREE.CylinderGeometry(.018, .026, 1, 8), M.gold, "arm", true);
    set(new THREE.SphereGeometry(1, 12, 8), M.gold, "palm", true);
    set(new THREE.SphereGeometry(1, 8, 6), std({ color: 0x1a120c, roughness: .4 }), "eye", false);
  }
  function guanyinShop(g, n) {
    const st = statueHall(g, n, {
      figure: "qianshou", label: "the Thousand-Armed Guanyin", petal: M.lotus, ring: M.gold, haloColor: 0xffe8c0, glow: 0xffc890,
      aura: auraTexture("rgba(255,244,220,.9)", "rgba(255,200,120,.4)", "rgba(255,230,180,.26)")
    });
    thousandArms(st);
    vaseOfLotus(g, -1.02, ALT.z - .12);
    // the shop: low shelves of offerings under the side windows, tapped to add to the basket, and a counter by the door
    const list = picks[n], rr = rng(55);
    const goodsCols = [0xc0201a, 0xd8a83a, 0x2f6a5a, 0x3a5a8a, 0xb8683a, 0xe8e2d4].map(c => std({ color: c, roughness: .6 }));
    [["flower", "花", -7.2, -.8], ["water", "水", -7.2, 1.8]].forEach(([key, han, x, z]) => shopShelf(g, list, key, han, x, z, Math.PI / 2, 2, rr, goodsCols));
    [["fruit", "果", 7.2, -3.4], ["candle", "燈", 7.2, -.8], ["incense", "香", 7.2, 1.8]].forEach(([key, han, x, z]) => shopShelf(g, list, key, han, x, z, -Math.PI / 2, 2, rr, goodsCols));
    mesh(new THREE.BoxGeometry(3.0, 1.0, .8), M.wood, 4.4, .5, 4.9, g);
    mesh(new THREE.BoxGeometry(3.1, .06, .9), M.trim, 4.4, 1.03, 4.9, g);
    for (let k = 0; k < 4; k++) { const bead = mesh(new THREE.TorusGeometry(.1, .02, 6, 18), M.wood, 3.3 + k * .3, 1.07, 4.9, g); bead.rotation.x = Math.PI / 2; }
    mesh(new THREE.BoxGeometry(.4, .22, .3), M.lacquer, 5.5, 1.17, 4.9, g);
    const name = writing(1024, 192, (c, cw, ch) => {
      c.fillStyle = "#2a1610"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
      c.fillStyle = "#e8c25a"; c.font = HAN_FONT(118); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("法物流通處", cw / 2, ch / 2 + 8);
    });
    const board = flat(mesh(new THREE.PlaneGeometry(2.4, .45), new THREE.MeshStandardMaterial({ map: name, roughness: .6, emissive: 0x2a2a2a, emissiveMap: name }), 7.44, 4.6, -.8, g));
    board.rotation.y = -Math.PI / 2;
  }

  /* ---------- 4F 藥師殿 Medicine Buddha ---------- */
  function medicineHall(g, n) {
    statueHall(g, n, {
      figure: "medicine", label: "the Medicine Buddha", petal: M.gold, ring: M.gold, haloColor: 0x9fc0ff, glow: 0x9fb4ff,
      aura: auraTexture("rgba(225,235,255,.85)", "rgba(90,130,255,.4)", "rgba(170,200,255,.24)")
    });
    vaseOfLotus(g, -1.02, ALT.z - .12);
    // the seven lamps of the Medicine Buddha (藥師七燈), behind the water bowls
    const cup = lathe([[0, 0], [.04, 0], [.06, .025], [.068, .045], [.06, .045], [0, .015]], M.brass, 20);
    for (let i = 0; i < 7; i++) {
      const x = -.54 + i * .18, z = ALT.z - .3, c = cup.clone(); c.position.set(x, ALT.y, z); g.add(c);
      makeFlame(V(x, ALT.y + .075, z), .9, null, g);
    }
  }

