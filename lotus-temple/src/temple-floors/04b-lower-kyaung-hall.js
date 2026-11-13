  /* ---------- the hall of the second Shan monastery, below the festival ground: not an image hall but the monastery's open teak
     hall for gatherings, sermons and the precepts. Plank walls with square windows framed in white down both sides, red pillars
     banded in gold, rows of woven mats on the floor, and at the far end the monks' raised teak dais with their seats, and a
     lacquered sermon seat in the middle for the monk who gives the talk ---------- */
  const LOW_HALL = { pillars: [-3.4, .2, 3.8].flatMap(z => [[-3.6, z], [3.6, z]]), dais: -3.2 };   // dais: the front edge of the monks' dais (z)
  function lowerKyaungHall(g, n) {
    picks[n] = picks[n] || []; updaters[n] = updaters[n] || [];
    const list = picks[n], HH = 6.2;   // HH: the ceiling's height
    const planks = (base, line, sz, across) => canvasTex(128, (c, s2) => {
      c.fillStyle = base; c.fillRect(0, 0, s2, s2);
      for (let k = 0; k < s2; k += sz) { c.fillStyle = line; across ? c.fillRect(0, k, s2, 2) : c.fillRect(k, 0, 2, s2); c.fillStyle = "rgba(140,80,40,.12)"; across ? c.fillRect(0, k + 4, s2, 3) : c.fillRect(k + 4, 0, 3, s2); }
    });
    const wallT = planks("#4a2412", "rgba(15,6,2,.6)", 12, false); wallT.wrapS = wallT.wrapT = THREE.RepeatWrapping; wallT.repeat.set(5, 2);
    const floorT = planks("#7a4422", "rgba(30,12,4,.55)", 16, true); floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(4, 4);
    const teak = std({ map: wallT, roughness: .7 }), teakDark = std({ color: 0x2e140a, roughness: .6 }), floorM = std({ map: floorT, roughness: .45 });
    const red = std({ color: 0x8a1a10, roughness: .45 }), white = std({ color: 0xf4f0e6, roughness: .6 }), gold = M.gold;
    // floor, walls and a dark teak ceiling on beams
    flat(mesh(new THREE.PlaneGeometry(15, 13), floorM, 0, 0, 1, g)).rotation.x = -Math.PI / 2;
    flat(mesh(new THREE.PlaneGeometry(15, HH), teak, 0, HH / 2, -5.5, g));
    flat(mesh(new THREE.PlaneGeometry(15, HH), teak, 0, HH / 2, 7.5, g)).rotation.y = Math.PI;
    [-1, 1].forEach(sd => { flat(mesh(new THREE.PlaneGeometry(13, HH), teak, sd * 7.5, HH / 2, 1, g)).rotation.y = -sd * Math.PI / 2; });
    flat(mesh(new THREE.PlaneGeometry(15, 13), teakDark, 0, HH, 1, g)).rotation.x = Math.PI / 2;
    const beamX = new THREE.BoxGeometry(15, .3, .26), beamZ = new THREE.BoxGeometry(.26, .3, 13);
    [-3.4, .2, 3.8].forEach(z => part(beamX, teakDark, 0, HH - .15, z, g));
    [-3.6, 3.6].forEach(x => part(beamZ, teakDark, x, HH - .15, 1, g));
    // square windows framed in white down both side walls and either side of the doors: daylight by day, the dark hill at night
    const pane = std({ color: 0x120a06, roughness: .4, emissive: 0xdde8f2, emissiveIntensity: 0 });
    onDaylight(d => pane.emissiveIntensity = .9 * d + .02);
    const paneG = new THREE.PlaneGeometry(1.1, 1.1), frameG = new THREE.BoxGeometry(1.3, 1.3, .06), barG = new THREE.BoxGeometry(.05, 1.1, .03);
    const win = (x, z, ry) => { const o = new THREE.Group(); o.position.set(x, 2.3, z); o.rotation.y = ry; g.add(o); part(frameG, white, 0, 0, .03, o); part(paneG, pane, 0, 0, .065, o); part(barG, white, 0, 0, .08, o); part(barG, white, 0, 0, .08, o).rotation.z = Math.PI / 2; };
    [-1, 1].forEach(sd => [-3.6, -.6, 2.4, 5.4].forEach(z => win(sd * 7.48, z, -sd * Math.PI / 2)));
    [-4.6, 4.6].forEach(x => win(x, 7.48, Math.PI));
    // the pillars: red lacquer, gold bands, white footings
    const footG = new THREE.BoxGeometry(.6, .2, .6), shaftG = new THREE.CylinderGeometry(.2, .22, HH - .2, 16), bandG = new THREE.CylinderGeometry(.235, .235, .16, 16);
    LOW_HALL.pillars.forEach(([x, z]) => {
      part(footG, white, x, .1, z, g); part(shaftG, red, x, HH / 2 + .05, z, g);
      [.45, 2.2, HH - .5].forEach(y => part(bandG, gold, x, y, z, g));
    });
    // woven mats in rows down the hall, where the lay people sit to listen
    const matT = canvasTex(64, (c, s2) => { c.fillStyle = "#c8a868"; c.fillRect(0, 0, s2, s2); c.fillStyle = "rgba(90,60,20,.35)"; for (let k = 0; k < s2; k += 4) { c.fillRect(k, 0, 1, s2); c.fillRect(0, k + 2, s2, 1); } c.strokeStyle = "#7a2a18"; c.lineWidth = 4; c.strokeRect(2, 2, s2 - 4, s2 - 4); });
    const matM = std({ map: matT, roughness: .95 }), matG = new THREE.BoxGeometry(1.2, .02, .9);
    [-1.4, -.2, 1.0, 2.2, 3.4].forEach(z => [-2.2, -.9, .9, 2.2].forEach(x => flat(part(matG, matM, x, .01, z, g))));
    // the monks' dais across the far end: a raised teak platform with a lacquered edge, three seats with cushions and a fan for
    // each, and in the middle the sermon seat, a little gilded and lacquered throne a step higher
    const DH = .55, DZ = (LOW_HALL.dais - 5.5) / 2, DD = LOW_HALL.dais + 5.5, dais = [];
    dais.push(mesh(new THREE.BoxGeometry(11, DH, DD), teakDark, 0, DH / 2, DZ, g));
    dais.push(mesh(new THREE.BoxGeometry(11.1, .08, DD + .1), red, 0, DH + .04, DZ, g));
    for (let i = 0; i < 2; i++) dais.push(mesh(new THREE.BoxGeometry(2.0, DH * (i + 1) / 3, .3), teakDark, 0, DH * (i + 1) / 6, LOW_HALL.dais + .45 - i * .3, g));   // two steps up in the middle
    const cushion = std({ color: 0xa8641e, roughness: .9 }), robe = std({ color: 0xc8701e, roughness: .85 }), fanM = std({ color: 0xd8c08a, roughness: .7, side: THREE.DoubleSide });
    [-3.6, -2.2, 2.2, 3.6].forEach(x => {
      dais.push(mesh(new THREE.BoxGeometry(1.0, .08, 1.0), robe, x, DH + .12, -4.3, g));
      const c = mesh(new THREE.CylinderGeometry(.3, .32, .14, 16), cushion, x, DH + .23, -4.3, g); dais.push(c);
      const fan = new THREE.Group(); fan.position.set(x + .45, DH + .1, -4.6); fan.rotation.set(-.25, 0, .12); g.add(fan);   // the monk's fan, leaning by his seat
      dais.push(mesh(new THREE.CylinderGeometry(.015, .015, .9, 6), teakDark, 0, .45, 0, fan));
      const leaf = mesh(new THREE.CircleGeometry(.26, 20, 0, Math.PI), fanM, 0, .9, 0, fan); leaf.rotation.z = -Math.PI / 2; leaf.scale.y = 1.3; dais.push(leaf);
    });
    const seat = new THREE.Group(); seat.position.set(0, DH, -4.4); g.add(seat);
    [[1.5, .3, 1.3, .15, red], [1.6, .05, 1.4, .32, gold], [1.3, .35, 1.1, .52, red], [1.4, .05, 1.2, .72, gold]].forEach(([w, h, d, y, m]) => dais.push(mesh(new THREE.BoxGeometry(w, h, d), m, 0, y, 0, seat)));
    dais.push(mesh(new THREE.BoxGeometry(1.3, 1.1, .12), red, 0, 1.3, -.55, seat));
    dais.push(mesh(new THREE.BoxGeometry(1.4, .06, .16), gold, 0, 1.86, -.55, seat));
    dais.push(mesh(new THREE.CylinderGeometry(.36, .38, .14, 16), cushion, 0, .82, .05, seat));
    dais.forEach(m => clickable(list, m, { tip: "The monks' dais", toast: "The monks sit on the raised dais, above the lay people on the mats below. From the sermon seat in the middle a monk gives the talk on the Dhamma and the precepts on the holy days." }));
    bakeParts(g);
    // the doors out to the porch, in the front wall behind the visitor
    const D0 = new THREE.Group(); D0.position.set(0, 0, 7.45); D0.rotation.y = Math.PI; g.add(D0);
    [-1, 1].forEach(sd => {
      clickable(list, mesh(new THREE.BoxGeometry(.98, 2.5, .08), teakDark, sd * .5, 1.25, 0, D0), { floor: "pagoda", tip: "Go back out onto the porch" });
      mesh(new THREE.BoxGeometry(.12, 2.7, .14), gold, sd * 1.06, 1.35, 0, D0);
    });
    mesh(new THREE.BoxGeometry(2.3, .14, .14), gold, 0, 2.7, 0, D0);
    // lights: warm lamplight from above, a glow over the dais, cool light from the windows
    g.add(new THREE.HemisphereLight(0xffd9a8, 0x2a1208, .5));
    const key = new THREE.PointLight(0xffd6a0, 1.0, 16, 2); key.position.set(0, 5.2, 1.5); g.add(key);
    const back = new THREE.PointLight(0xffb060, .8, 8, 2); back.position.set(0, 3.2, -3.6); g.add(back);
    const side = new THREE.DirectionalLight(0x6f86d8, .3); side.position.set(-6, 4, -1); g.add(side);
  }
