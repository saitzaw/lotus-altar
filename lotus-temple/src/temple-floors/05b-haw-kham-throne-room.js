  /* ---------- ႁေႃၶမ်း the throne room of the Haw Kham, under its seven-tiered pyatthat, after the old photograph of a Shan
     prince's throne: two rows of tall red-lacquered pillars banded in gold, teak wainscot under red walls worked in gilt, a red
     carpet between the courtiers' mats, and at the far end on a stepped dais the throne itself: a gilded base set with glass
     mosaic and lions in its niches, curling gilt arms either side of the seat, and behind it a tall gilt screen with a little door,
     crowned with a pointed crest of flames; white umbrellas of state either side and white drapes gathered back from the pillars.
     No offering altar: there is no image here ---------- */
  const HAW = { pillars: [-4.4, -1, 2.4, 5.8].flatMap(z => [[-3.6, z], [3.6, z]]), dais: 3.2, front: -1.6 };   // dais: the dais's half width; front: its front edge
  function hawHall(g, n) {
    picks[n] = picks[n] || []; updaters[n] = updaters[n] || [];
    const list = picks[n], HH = 7.4;   // HH: the ceiling's height
    const floorT = canvasTex(128, (c, s2) => { c.fillStyle = "#6a3a1c"; c.fillRect(0, 0, s2, s2); for (let k = 0; k < s2; k += 16) { c.fillStyle = "rgba(25,10,3,.55)"; c.fillRect(0, k, s2, 2); c.fillStyle = "rgba(150,90,45,.14)"; c.fillRect(0, k + 5, s2, 3); } });
    floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(4, 4);
    // the red walls worked in gilt: rows of little gold rosettes in a lattice of thin gold lines
    const wallT = canvasTex(128, (c, s2) => {
      c.fillStyle = "#6e140c"; c.fillRect(0, 0, s2, s2); c.strokeStyle = "rgba(216,166,64,.55)"; c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, s2 / 2); c.lineTo(s2 / 2, 0); c.lineTo(s2, s2 / 2); c.lineTo(s2 / 2, s2); c.closePath(); c.stroke();
      c.fillStyle = "#d8a640"; [[s2 / 2, s2 / 2], [0, 0], [s2, 0], [0, s2], [s2, s2]].forEach(([x, y]) => { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.beginPath(); c.arc(x + Math.cos(a) * 7, y + Math.sin(a) * 7, 3.5, 0, TAU); c.fill(); } c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill(); });
    });
    wallT.wrapS = wallT.wrapT = THREE.RepeatWrapping; wallT.repeat.set(10, 4);
    const plankT = canvasTex(128, (c, s2) => { c.fillStyle = "#43200f"; c.fillRect(0, 0, s2, s2); for (let x = 0; x < s2; x += 12) { c.fillStyle = "rgba(15,6,2,.6)"; c.fillRect(x, 0, 2, s2); } });
    plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping; plankT.repeat.set(10, 1);
    const floorM = std({ map: floorT, roughness: .4 }), redWall = std({ map: wallT, roughness: .55 }), wains = std({ map: plankT, roughness: .7 });
    const red = std({ color: 0x4a0804, roughness: .4 }), dark = std({ color: 0x2e140a, roughness: .6 }), gold = M.gold, trim = M.trim;
    const cloth = std({ map: canvasTex(64, (c, s2) => { for (let x = 0; x < s2; x++) { const v = 222 + Math.round(Math.sin(x / s2 * TAU * 4) * 22); c.fillStyle = `rgb(${v},${v - 2},${v - 8})`; c.fillRect(x, 0, 1, s2); } }), roughness: .9, side: THREE.DoubleSide });
    // floor, walls (teak wainscot, red and gilt above, gilt bands), ceiling of dark red coffers between gilt beams
    flat(mesh(new THREE.PlaneGeometry(15, 13), floorM, 0, 0, 1, g)).rotation.x = -Math.PI / 2;
    const wall = (w, x, z, ry) => { const o = new THREE.Group(); o.position.set(x, 0, z); o.rotation.y = ry; g.add(o); flat(mesh(new THREE.PlaneGeometry(w, HH), redWall, 0, HH / 2, 0, o)); flat(mesh(new THREE.BoxGeometry(w, 1.2, .04), wains, 0, .6, .02, o)); [1.22, HH - .7].forEach(y => flat(mesh(new THREE.BoxGeometry(w, .14, .06), trim, 0, y, .03, o))); return o; };
    wall(15, 0, -5.5, 0); wall(15, 0, 7.5, Math.PI); [-1, 1].forEach(sd => wall(13, sd * 7.5, 1, -sd * Math.PI / 2));
    flat(mesh(new THREE.PlaneGeometry(15, 13), std({ color: 0x4a0e08, roughness: .7 }), 0, HH, 1, g)).rotation.x = Math.PI / 2;
    const beamX = new THREE.BoxGeometry(15, .24, .2), beamZ = new THREE.BoxGeometry(.2, .24, 13);
    [-4.4, -2.7, -1, .7, 2.4, 4.1, 5.8].forEach(z => part(beamX, gold, 0, HH - .12, z, g));
    [-5.4, -3.6, -1.8, 0, 1.8, 3.6, 5.4].forEach(x => part(beamZ, gold, x, HH - .12, 1, g));
    // tall windows in gilt frames down the side walls: daylight by day, dark at night
    const pane = std({ color: 0x120a06, roughness: .4, emissive: 0xdde8f2, emissiveIntensity: 0 });
    onDaylight(d => pane.emissiveIntensity = .9 * d + .02);
    [-1, 1].forEach(sd => [-2.6, .7, 4.1].forEach(z => {
      const o = new THREE.Group(); o.position.set(sd * 7.46, 0, z); o.rotation.y = -sd * Math.PI / 2; g.add(o);
      mesh(new THREE.BoxGeometry(1.3, 2.8, .06), gold, 0, 3, .01, o); mesh(new THREE.PlaneGeometry(1.06, 2.56), pane, 0, 3, .05, o);
      const p = mesh(new THREE.ConeGeometry(.85, .7, 4), gold, 0, 4.75, .02, o); p.rotation.y = Math.PI / 4; p.scale.z = .08;
    }));
    // the pillars: red lacquer, gold bands, gilt lotus capitals, white footings
    const footG = new THREE.BoxGeometry(.66, .22, .66), shaftG = new THREE.CylinderGeometry(.24, .26, HH - .2, 16), bandG = new THREE.CylinderGeometry(.275, .275, .16, 16), capG = new THREE.CylinderGeometry(.36, .25, .4, 16);
    HAW.pillars.forEach(([x, z]) => { part(footG, std({ color: 0xf2eee4, roughness: .7 }), x, .11, z, g); part(shaftG, red, x, HH / 2 + .1, z, g); [.5, 2.4, 4.4].forEach(y => part(bandG, gold, x, y, z, g)); part(capG, gold, x, HH - .44, z, g); });
    // the red carpet up the middle, a gold border, and the courtiers' mats along either side of it
    const carpT = canvasTex(64, (c, s2) => { c.fillStyle = "#9a1810"; c.fillRect(0, 0, s2, s2); c.fillStyle = "#d8a640"; c.fillRect(0, 0, 6, s2); c.fillRect(s2 - 6, 0, 6, s2); c.fillStyle = "rgba(216,166,64,.4)"; c.fillRect(10, 0, 2, s2); c.fillRect(s2 - 12, 0, 2, s2); });
    carpT.wrapT = THREE.RepeatWrapping; carpT.repeat.set(1, 6);
    flat(mesh(new THREE.BoxGeometry(1.8, .02, 8.9), std({ map: carpT, roughness: .95 }), 0, .01, 2.85, g));
    const matT = canvasTex(64, (c, s2) => { c.fillStyle = "#c8a868"; c.fillRect(0, 0, s2, s2); c.fillStyle = "rgba(90,60,20,.35)"; for (let k = 0; k < s2; k += 4) { c.fillRect(k, 0, 1, s2); c.fillRect(0, k + 2, s2, 1); } c.strokeStyle = "#7a2a18"; c.lineWidth = 4; c.strokeRect(2, 2, s2 - 4, s2 - 4); });
    const matG = new THREE.BoxGeometry(1.1, .02, 1), matM = std({ map: matT, roughness: .95 });
    [-.2, 1.2, 2.6, 4, 5.4].forEach(z => [-1, 1].forEach(sd => flat(part(matG, matM, sd * 2, .012, z, g))));
    bakeParts(g);
    // the throne: everything on and round the dais answers to a tap
    const throne = { tip: "The saopha's throne", toast: `The saopha's throne, gilded and set with glass mosaic, lions crouched in the niches of its base: a lion throne (Burmese သီဟာသနပလ္လင်, thihathana palin) in the manner of the Burmese kings' at Mandalay. Here the saopha (${SHAN_NAMES.saopha}) sat in state to receive his court and the headmen of his circles, who knelt on the mats below. He came out to it through the little door in the gilt screen behind the seat.` };
    const T = new THREE.Group(); g.add(T);
    // the dais, two broad steps of dark teak edged in gold
    [[2 * HAW.dais, 5.5 + HAW.front, 0], [2 * HAW.dais - 1, 5.5 + HAW.front - .6, .25]].forEach(([w, d, y]) => {
      mesh(new THREE.BoxGeometry(w, .25, d), dark, 0, y + .125, -5.5 + d / 2, T);
      mesh(new THREE.BoxGeometry(w + .02, .05, .04), gold, 0, y + .23, -5.5 + d, T);
    });
    // the base: a gilt foot, a band of niches with a lion in each, gilt and red rims; the waist of red and green glass mosaic; the seat
    const lions = canvasTex(256, (c, s2) => {
      c.fillStyle = "#c99a44"; c.fillRect(0, 0, s2, s2);
      for (let k = 0; k < 4; k++) {
        const x = k * 64 + 8;
        c.fillStyle = "#3a1408"; c.beginPath(); c.moveTo(x, s2 - 24); c.lineTo(x, 90); c.quadraticCurveTo(x + 24, 34, x + 24, 18); c.quadraticCurveTo(x + 24, 34, x + 48, 90); c.lineTo(x + 48, s2 - 24); c.fill();
        c.fillStyle = "#e8c070";   // a seated lion, facing out: haunches, chest, maned head, ears
        c.beginPath(); c.ellipse(x + 24, s2 - 52, 18, 22, 0, 0, TAU); c.fill();
        c.beginPath(); c.ellipse(x + 24, s2 - 92, 12, 22, 0, 0, TAU); c.fill();
        c.beginPath(); c.arc(x + 24, s2 - 124, 15, 0, TAU); c.fill();
        c.fillStyle = "#3a1408"; [-6, 6].forEach(e => { c.beginPath(); c.arc(x + 24 + e, s2 - 127, 2.5, 0, TAU); c.fill(); }); c.fillRect(x + 18, s2 - 117, 12, 3);
        c.fillStyle = "#e8c070"; [-1, 1].forEach(e => { c.beginPath(); c.arc(x + 24 + e * 13, s2 - 138, 5, 0, TAU); c.fill(); });
      }
      c.fillStyle = "#8a1a10"; c.fillRect(0, s2 - 16, s2, 16);
    });
    lions.wrapS = THREE.RepeatWrapping; lions.repeat.set(2, 1);
    const lionM = std({ map: lions, roughness: .35, metalness: .5 });
    const mosaic = canvasTex(128, (c, s2) => { c.fillStyle = "#b8893c"; c.fillRect(0, 0, s2, s2); for (let r = 0; r < 4; r++) for (let k = 0; k < 8; k++) { c.fillStyle = (r + k) % 2 ? "#1f7a4a" : "#a01818"; c.beginPath(); const cx = k * 16 + 8 + (r % 2) * 8, cy = r * 32 + 16; c.moveTo(cx, cy - 12); c.lineTo(cx + 6, cy); c.lineTo(cx, cy + 12); c.lineTo(cx - 6, cy); c.fill(); } });
    mosaic.wrapS = THREE.RepeatWrapping; mosaic.repeat.set(4, 1);
    const glass = std({ map: mosaic, roughness: .25, metalness: .3 });
    const BZ = -4, y0 = .5;
    [[3.8, .12, 2.2, 0, gold], [3.6, .5, 2, .12, lionM], [3.8, .06, 2.2, .62, gold], [3.7, .04, 2.1, .68, red], [3.76, .04, 2.16, .72, gold], [3.1, .3, 1.7, .76, glass], [3.5, .1, 2.0, 1.06, gold]]
      .forEach(([w, h, d, y, m]) => mesh(new THREE.BoxGeometry(w, h, d), m, 0, y0 + y + h / 2, BZ, T));
    const seat = y0 + 1.16;
    // two low gilt steps before the base, and the red velvet cushion and bolster on the seat, a gilt betel box beside it
    for (let k = 0; k < 2; k++) mesh(new THREE.BoxGeometry(1 - k * .1, (k + 1) * .2, .25), gold, 0, y0 + (k + 1) * .1, BZ + 1 + .25 * (1 - k) + .125, T);
    const velvet = std({ color: 0x7a0c10, roughness: .85 });
    mesh(new THREE.BoxGeometry(1.1, .16, .9), velvet, 0, seat + .08, BZ - .1, T);
    const bol = mesh(new THREE.CylinderGeometry(.16, .16, 1, 16), velvet, 0, seat + .24, BZ - .6, T); bol.rotation.z = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(.14, .16, .18, 12), gold, 1.1, seat + .09, BZ + .2, T);
    mesh(new THREE.ConeGeometry(.15, .14, 12), gold, 1.1, seat + .25, BZ + .2, T);
    // the seat's arms: gilt side rails ending in great curling scrolls, a smaller curl turned out below each
    [-1, 1].forEach(sd => {
      mesh(new THREE.BoxGeometry(.1, .4, 1.5), gold, sd * 1.6, seat + .2, BZ - .15, T);
      const big = mesh(new THREE.TorusGeometry(.42, .09, 8, 28, Math.PI * 1.5), gold, sd * 1.62, seat + .62, BZ + .35, T); big.rotation.y = Math.PI / 2; big.rotation.x = -Math.PI * .25;
      const small = mesh(new THREE.TorusGeometry(.22, .06, 8, 20, Math.PI * 1.5), gold, sd * 1.7, seat + .05, BZ + .95, T); small.rotation.y = Math.PI / 2; small.rotation.x = Math.PI * .75;
    });
    // the screen behind the seat: a gilt lattice set with red and green glass, the little door in its middle, gilt posts each side
    const latT = canvasTex(128, (c, s2) => { c.fillStyle = "#c99a44"; c.fillRect(0, 0, s2, s2); for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { c.fillStyle = (r + k) % 2 ? "#1a5a3a" : "#8a1a10"; c.fillRect(k * 32 + 6, r * 32 + 6, 20, 20); c.fillStyle = "#e8c070"; c.beginPath(); c.arc(k * 32 + 16, r * 32 + 16, 4, 0, TAU); c.fill(); } });
    latT.wrapS = latT.wrapT = THREE.RepeatWrapping; latT.repeat.set(4, 5);
    const SH = 3, SZ = BZ - .95;
    mesh(new THREE.BoxGeometry(2.8, SH, .14), [gold, gold, gold, gold, std({ map: latT, roughness: .3, metalness: .5 }), gold], 0, seat + SH / 2, SZ, T);
    mesh(new THREE.BoxGeometry(1.1, 2.0, .04), gold, 0, seat + 1.1, SZ + .08, T);
    mesh(new THREE.BoxGeometry(.9, 1.8, .03), std({ color: 0x1a0a04, roughness: .5 }), 0, seat + 1.05, SZ + .1, T);
    [-1, 1].forEach(sd => { mesh(new THREE.CylinderGeometry(.11, .13, SH + .3, 12), gold, sd * 1.5, seat + (SH + .3) / 2, SZ + .05, T); mesh(new THREE.ConeGeometry(.16, .7, 8), gold, sd * 1.5, seat + SH + .65, SZ + .05, T); });
    // the crest over the screen: a pointed arch of gilt with a red inner field, flames up its edges and a little spire at the top
    const arch = (pw, ph) => { const s = new THREE.Shape(); s.moveTo(-pw, 0); s.bezierCurveTo(-pw, ph * .5, -pw * .2, ph * .55, 0, ph); s.bezierCurveTo(pw * .2, ph * .55, pw, ph * .5, pw, 0); s.closePath(); return s; };
    const cy = seat + SH;
    mesh(new THREE.ExtrudeGeometry(arch(1.6, 2), { depth: .12, bevelEnabled: false }), gold, 0, cy, SZ - .06, T);
    mesh(new THREE.ExtrudeGeometry(arch(1.15, 1.45), { depth: .04, bevelEnabled: false }), red, 0, cy + .08, SZ + .06, T);
    mesh(new THREE.CircleGeometry(.3, 20), gold, 0, cy + .6, SZ + .11, T);
    const flame = new THREE.ConeGeometry(.08, .34, 4);
    [-1, 1].forEach(sd => {
      const cv = new THREE.CubicBezierCurve(new THREE.Vector2(sd * 1.6, 0), new THREE.Vector2(sd * 1.6, 1), new THREE.Vector2(sd * .32, 1.1), new THREE.Vector2(0, 2));
      for (let k = 1; k < 9; k++) { const p = cv.getPoint(k / 9), q = cv.getTangent(k / 9), f = mesh(flame, gold, p.x + sd * .1, cy + p.y + .08, SZ, T); f.rotation.z = Math.atan2(-q.x, q.y) + sd * .5; }
    });
    mesh(new THREE.ConeGeometry(.1, .5, 8), gold, 0, cy + 2.15, SZ, T);
    // white umbrellas of state either side of the throne: three tiers of white cloth with gilt rims on a gilt pole
    const umb = { tip: "A white umbrella of state", toast: "A white umbrella (Burmese ထီးဖြူ, hti hpyu). At the Burmese court and in the Shan states the white umbrella was the mark of a ruler: only the saopha might have it carried over him, and it stood beside him on the throne dais." };
    [-1, 1].forEach(sd => {
      const U = new THREE.Group(); U.position.set(sd * 2.6, y0, -2.4); g.add(U);
      mesh(new THREE.CylinderGeometry(.035, .035, 4.2, 8), gold, 0, 2.1, 0, U);
      mesh(new THREE.CylinderGeometry(.2, .26, .2, 12), gold, 0, .1, 0, U);
      [[.95, 3.7], [.72, 4.1], [.5, 4.45]].forEach(([r, y]) => {
        const c = mesh(new THREE.ConeGeometry(r, .32, 24, 1, true), cloth, 0, y, 0, U); c.castShadow = false;
        mesh(new THREE.TorusGeometry(r * .97, .025, 6, 32), gold, 0, y - .15, 0, U).rotation.x = Math.PI / 2;
      });
      mesh(new THREE.ConeGeometry(.07, .5, 8), gold, 0, 4.85, 0, U);
      U.traverse(o => { if (o.isMesh) clickable(list, o, umb); });
    });
    // white drapes gathered back to the pillars either side of the throne, swagged from a gilt rod across the hall
    mesh(new THREE.CylinderGeometry(.04, .04, 7.2, 8), gold, 0, 6.5, -4.4, g).rotation.z = Math.PI / 2;
    [-1, 1].forEach(sd => {
      const top = mesh(new THREE.BoxGeometry(1.8, 2.4, .08), cloth, sd * 2.55, 5.3, -4.25, g); top.rotation.z = -sd * .1;
      const fall = mesh(new THREE.BoxGeometry(.5, 4.2, .12), cloth, sd * 3.25, 2.1, -4.15, g); fall.rotation.z = sd * .04;
      const swag = mesh(new THREE.SphereGeometry(1, 20, 12), cloth, sd * 2.4, 6.2, -4.3, g); swag.scale.set(1.1, .45, .3);
      mesh(new THREE.TorusGeometry(.18, .04, 6, 16), gold, sd * 3.25, 4.1, -4, g);   // the gilt tie-back
    });
    T.traverse(o => { if (o.isMesh) clickable(list, o, throne); });
    // hanging lanterns of glass in gilt frames down the hall
    const lampM = std({ color: 0xfff0d0, emissive: 0xffd890, emissiveIntensity: 0, transparent: true, opacity: .9 });
    onDaylight(d => lampM.emissiveIntensity = .3 + .7 * (1 - d));
    [.7, 4.1].forEach(z => {
      mesh(new THREE.CylinderGeometry(.012, .012, 1.4, 4), gold, 0, HH - .7, z, g);
      mesh(new THREE.CylinderGeometry(.3, .22, .55, 6), lampM, 0, HH - 1.7, z, g).castShadow = false;
      mesh(new THREE.ConeGeometry(.36, .3, 6), gold, 0, HH - 1.27, z, g);
      mesh(new THREE.CylinderGeometry(.24, .16, .08, 6), gold, 0, HH - 2, z, g);
    });
    // the doors out to the verandah, in the front wall behind the visitor
    const D0 = new THREE.Group(); D0.position.set(0, 0, 7.45); D0.rotation.y = Math.PI; g.add(D0);
    [-1, 1].forEach(sd => clickable(list, mesh(new THREE.BoxGeometry(.98, 2.8, .08), red, sd * .5, 1.4, 0, D0), { floor: "pagoda", tip: `Go back out onto the verandah of ${SHAN_NAMES.haw}` }));
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.14, 2.95, .12), gold, sd * 1.03, 1.47, .02, D0));
    mesh(new THREE.BoxGeometry(2.2, .16, .12), gold, 0, 2.95, .02, D0);
    // lights: warm and low under the red ceiling, the key from the doors onto the throne, the lamps down the hall
    g.add(new THREE.HemisphereLight(0xffe4c4, 0x3a1a0a, .5));
    const key = new THREE.SpotLight(0xfff0d8, 1.4, 30, .6, .6, 1); key.position.set(-1.2, 6.2, 6.5); key.target.position.set(0, 2.2, -4.2); g.add(key, key.target);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.normalBias = .02;
    [.7, 4.1].forEach(z => { const l = new THREE.PointLight(0xffd8a0, .8, 10, 2); l.position.set(0, HH - 2.2, z); g.add(l); });
    const glow = new THREE.PointLight(0xffc870, .6, 6, 2); glow.position.set(0, 3.2, -2.4); g.add(glow);
    const side = new THREE.DirectionalLight(0x9ab0e0, .25); side.position.set(-6, 4, -1); g.add(side);
  }
