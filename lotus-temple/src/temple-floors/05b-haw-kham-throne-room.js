  /* ---------- ႁေႃၶမ်း the throne room of the Haw Kham, under its seven-tiered pyatthat, after the old photograph of a Shan
     prince's throne: two rows of tall red-lacquered pillars banded in gold, teak wainscot under red walls worked in gilt, a red
     carpet between the courtiers' mats, and at the far end on a stepped dais the throne itself: a gilded base set with glass
     mosaic and lions in its niches, curling gilt arms either side of the seat, and behind it a tall gilt screen with a little door,
     crowned with a pointed crest of flames; white umbrellas of state either side and white drapes gathered back from the pillars.
     The same builder makes the two lesser halls either side (kind): on the left the hall of justice, the saopha's seat of
     judgement with conches in its base and the law books on a table before it; on the right the hall where he receives the monks,
     their seats raised on a high dais and his own low seat below them. And the three halls behind the doors at the palace's back:
     the literature hall (books in lacquered chests, a reading stand), the dining hall (low round lacquer tables set for a meal) and
     the opera hall (a little stage with a painted backdrop and footlights). No offering altar: there is no image in any of them ---------- */
  const HAW = { pillars: [-4.4, -1, 2.4, 5.8].flatMap(z => [[-3.6, z], [3.6, z]]), dais: 3.2, front: -1.6,   // dais: the throne dais's half width; front: its front edge
    rooms: { haw: [[-3.2, 3.2, -6, -1.6]], hawJustice: [[-3.2, 3.2, -6, -1.6], [-1.1, 1.1, -1.3, -.5]], hawMonks: [[-3.6, 3.6, -6, -2.4], [-1.5, 1.5, -2.4, -.3]],
    hawLibrary: [[-3.2, 3.2, -6, -2.4], [-7.5, -6.2, -6, 7.5], [6.2, 7.5, -6, 7.5], ...[[-2, 1.2], [2, 1.2], [-2, 4], [2, 4]].map(([x, z]) => [x - .45, x + .45, z - .25, z + .25])],
    hawDining: [[-3.2, 3.2, -6, -2.4], [-7.5, -6.3, -6, 7.5], [6.3, 7.5, -6, 7.5], ...[[-2.1, .6], [2.1, .6], [-2.1, 3.8], [2.1, 3.8]].map(([x, z]) => [x - .6, x + .6, z - .6, z + .6])],
    hawOpera: [[-3.6, 3.6, -6, -1.9], [-5.8, -4.3, -1.6, -.3], [-.55, .55, 2.1, 3.1]] } };   // what blocks walkers in each hall
  function hawHall(g, n, kind = "haw") {
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
    if (kind === "haw" || kind === "hawJustice") {   // the throne and its umbrellas: the lion throne, or in the hall of justice the seat of judgement
    const justice = kind === "hawJustice";
    const throne = justice ? { tip: "The saopha's seat of judgement", toast: `The saopha's seat of judgement, gilded, with conch shells, a sign of good fortune, in the niches of its base and a great white conch on the red panel behind. Here the saopha (${SHAN_NAMES.saopha}) heard the cases and disputes brought up from the circles of his state, with his ministers kneeling on the mats either side, and gave judgement by the dhammathat, the old Buddhist law of Burma and the Shan states, whose palm-leaf books lie on the table below.` } : { tip: "The saopha's throne", toast: `The saopha's throne, gilded and set with glass mosaic, lions crouched in the niches of its base: a lion throne (Shan ပလၢင်ႇသီႇႁႃႇသၼ) in the manner of the Burmese kings' at Mandalay. Here the saopha (${SHAN_NAMES.saopha}) sat in state to receive his court and the headmen of his circles, who knelt on the mats below. He came out to it through the little door in the gilt screen behind the seat.` };
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
        if (justice) {   // a conch shell, its spire up, whorls round it and its lip curling down one side
          c.fillStyle = "#f4eee0"; c.beginPath(); c.ellipse(x + 24, s2 - 80, 15, 38, 0, 0, TAU); c.fill();
          c.beginPath(); c.moveTo(x + 14, s2 - 112); c.lineTo(x + 24, s2 - 146); c.lineTo(x + 34, s2 - 112); c.fill();
          c.strokeStyle = "#b89a6a"; c.lineWidth = 2; [0, 1, 2, 3].forEach(k => { c.beginPath(); c.ellipse(x + 24, s2 - 112 - k * 8, 10 - k * 2, 3, 0, 0, Math.PI); c.stroke(); });
          c.beginPath(); c.moveTo(x + 30, s2 - 108); c.quadraticCurveTo(x + 40, s2 - 80, x + 28, s2 - 46); c.stroke();
          continue;
        }
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
    if (justice) {   // a red lacquer panel in a gilt frame, a great white conch in a gilt roundel on it
      mesh(new THREE.BoxGeometry(2.8, SH, .14), gold, 0, seat + SH / 2, SZ, T);
      mesh(new THREE.BoxGeometry(2.5, SH - .3, .04), red, 0, seat + SH / 2, SZ + .08, T);
      mesh(new THREE.CylinderGeometry(.7, .7, .05, 32), gold, 0, seat + 1.8, SZ + .1, T).rotation.x = Math.PI / 2;
      const shell = std({ color: 0xf4eee0, roughness: .35 }), sh = mesh(new THREE.SphereGeometry(.3, 16, 12), shell, 0, seat + 1.72, SZ + .2, T); sh.scale.set(.75, 1.1, .5);
      mesh(new THREE.ConeGeometry(.2, .4, 16), shell, 0, seat + 2.18, SZ + .2, T);
      mesh(new THREE.ConeGeometry(.1, .3, 12), shell, 0, seat + 1.3, SZ + .2, T).rotation.x = Math.PI;
    } else {
      mesh(new THREE.BoxGeometry(2.8, SH, .14), [gold, gold, gold, gold, std({ map: latT, roughness: .3, metalness: .5 }), gold], 0, seat + SH / 2, SZ, T);
      mesh(new THREE.BoxGeometry(1.1, 2.0, .04), gold, 0, seat + 1.1, SZ + .08, T);
      mesh(new THREE.BoxGeometry(.9, 1.8, .03), std({ color: 0x1a0a04, roughness: .5 }), 0, seat + 1.05, SZ + .1, T);
    }
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
    const umb = { tip: "A white umbrella of state", toast: "A white umbrella (Shan ၸွင်ႈၽိူၵ်). At the Burmese court and in the Shan states the white umbrella was the mark of a ruler: only the saopha might have it carried over him, and it stood beside him on the throne dais." };
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
    T.traverse(o => { if (o.isMesh) clickable(list, o, throne); });
    if (justice) {   // the low red table before the dais with the law books on it: palm-leaf bundles between wooden covers, tied with cord
      const J = new THREE.Group(); g.add(J);
      mesh(new THREE.BoxGeometry(2, .06, .7), red, 0, .38, -.9, J);
      [[-.9, -1.15], [.9, -1.15], [-.9, -.65], [.9, -.65]].forEach(([lx, lz]) => mesh(new THREE.BoxGeometry(.08, .36, .08), red, lx, .18, lz, J));
      const leaf = std({ color: 0xd8c08a, roughness: .8 }), cover = std({ color: 0x3a1e0e, roughness: .6 });
      [[-.55, .41, -.9, 0], [-.55, .49, -.9, .1], [.05, .41, -.95, -.15], [.6, .41, -.85, .2]].forEach(([lx, ly, lz, r2]) => {
        const b = new THREE.Group(); b.position.set(lx, ly, lz); b.rotation.y = r2; J.add(b);
        mesh(new THREE.BoxGeometry(.5, .05, .07), leaf, 0, .025, 0, b); [-.03, .03].forEach(dy => mesh(new THREE.BoxGeometry(.52, .012, .075), cover, 0, .025 + dy, 0, b));
      });
      J.traverse(o => { if (o.isMesh) clickable(list, o, { tip: "The law books", toast: "The law books of the hall of justice: palm-leaf manuscripts of the dhammathat, the old law books of Burma and the Shan states, written with a stylus on strips of palm leaf and kept between lacquered wooden covers. The judges read out the rule for each case, and the saopha gave judgement by it." }); });
    }
    } else if (kind === "hawMonks") {   // the hall where the saopha receives the monks: their seats raised on a high dais, his own low seat facing them below
      const D = new THREE.Group(); g.add(D);
      [[7.2, -2.4, 0], [6.6, -2.8, .25], [6, -3.2, .5]].forEach(([w, z1, y]) => {
        mesh(new THREE.BoxGeometry(w, .25, z1 + 5.5), dark, 0, y + .125, (z1 - 5.5) / 2, D);
        mesh(new THREE.BoxGeometry(w + .02, .05, .04), gold, 0, y + .23, z1, D);
      });
      const latT = canvasTex(128, (c, s2) => { c.fillStyle = "#c99a44"; c.fillRect(0, 0, s2, s2); for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { c.fillStyle = (r + k) % 2 ? "#1a5a3a" : "#8a1a10"; c.fillRect(k * 32 + 6, r * 32 + 6, 20, 20); c.fillStyle = "#e8c070"; c.beginPath(); c.arc(k * 32 + 16, r * 32 + 16, 4, 0, TAU); c.fill(); } });
      latT.wrapS = latT.wrapT = THREE.RepeatWrapping; latT.repeat.set(8, 4);
      mesh(new THREE.BoxGeometry(5.8, 3, .1), [gold, gold, gold, gold, std({ map: latT, roughness: .3, metalness: .5 }), gold], 0, 2.25, -5.4, D);   // a gilt screen behind the seats
      // three monks' seats: a low gilt platform, a square cushion and a triangular back cushion, a palm-leaf fan in a stand beside each
      const robe = std({ color: 0x6a2a0e, roughness: .85 }), palm = std({ color: 0xd8c48a, roughness: .8, side: THREE.DoubleSide });
      [-2, 0, 2].forEach(x => {
        mesh(new THREE.BoxGeometry(1.3, .2, 1.3), gold, x, .85, -4.2, D);
        mesh(new THREE.BoxGeometry(.95, .1, .95), robe, x, 1, -4.2, D);
        const back = mesh(new THREE.CylinderGeometry(.3, .3, .8, 3), robe, x, 1.25, -4.75, D); back.rotation.z = Math.PI / 2; back.rotation.x = Math.PI / 6;
        mesh(new THREE.CylinderGeometry(.08, .1, .1, 12), gold, x + .78, .8, -4.3, D);
        mesh(new THREE.CylinderGeometry(.015, .015, 1.1, 6), gold, x + .78, 1.35, -4.3, D);
        const fan = mesh(new THREE.CircleGeometry(.32, 24), palm, x + .78, 2.05, -4.3, D); fan.scale.y = 1.35;
        mesh(new THREE.TorusGeometry(.32, .015, 6, 24), gold, x + .78, 2.05, -4.29, D).scale.y = 1.35;
      });
      D.traverse(o => { if (o.isMesh) clickable(list, o, { tip: "The monks' seats", toast: "Seats for the monks, raised above every other seat in the room. When the saopha invited the abbots of the town's monasteries to the palace he sat below them on his own low seat, offered them robes and food, and listened to their sermon: even a prince sits lower than a monk. Beside each seat stands the palm-leaf fan a monk holds before his face while he chants." }); });
      // the saopha's own low seat facing them: a gilt lotus base and a red cushion; robes on gilt trays and two lacquer offering vessels before the monks
      const L = new THREE.Group(); g.add(L);
      mesh(new THREE.CylinderGeometry(.55, .62, .28, 24), gold, 0, .14, -.9, L);
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, pt = mesh(new THREE.SphereGeometry(.14, 8, 6), gold, Math.sin(a) * .58, .28, -.9 + Math.cos(a) * .58, L); pt.scale.set(.6, .5, 1); pt.rotation.y = a; }
      mesh(new THREE.CylinderGeometry(.46, .46, .12, 24), std({ color: 0x7a0c10, roughness: .85 }), 0, .34, -.9, L);
      L.traverse(o => { if (o.isMesh) clickable(list, o, { tip: "The saopha's low seat", toast: `The saopha's seat in this hall: a low gilt lotus with a cushion on it, set on the floor below the monks, facing them. Here the prince (${SHAN_NAMES.saopha}) sat as a lay follower to make his offerings and hear the Dhamma.` }); });
      const O = new THREE.Group(); g.add(O);
      const lac = std({ color: 0x5a0e08, roughness: .35 }), black = std({ color: 0x141010, roughness: .35 });
      [-1, 1].forEach(sd => {
        const x = sd * 1.15, z = -1.8;   // a lacquer offering vessel: a footed bowl, a domed lid and a spired knob, banded in gold
        mesh(new THREE.CylinderGeometry(.22, .28, .14, 20), black, x, .07, z, O);
        mesh(new THREE.CylinderGeometry(.34, .2, .36, 20), lac, x, .32, z, O);
        mesh(new THREE.CylinderGeometry(.35, .35, .04, 20), gold, x, .5, z, O);
        mesh(new THREE.SphereGeometry(.34, 20, 10, 0, TAU, 0, Math.PI / 2), lac, x, .52, z, O).scale.y = .7;
        [.82, .98, 1.1].forEach((y, k) => mesh(new THREE.CylinderGeometry(.12 - k * .03, .14 - k * .03, .12, 16), k % 2 ? gold : lac, x, y, z, O));
        mesh(new THREE.ConeGeometry(.05, .3, 12), gold, x, 1.3, z, O);
        mesh(new THREE.CylinderGeometry(.3, .26, .04, 20), gold, sd * .55, .27, -2.65, O);   // a gilt tray of folded robes on the dais's lowest step
        mesh(new THREE.BoxGeometry(.4, .14, .3), robe, sd * .55, .36, -2.65, O);
      });
      O.traverse(o => { if (o.isMesh) clickable(list, o, { tip: "Offerings for the monks", toast: "Offerings for the monks: folded robes on gilt trays, and lacquered offering vessels with spired lids, which carry food to the monastery. Giving robes and food to the Sangha is the first of the good works of a Buddhist ruler." }); });
    } else if (kind === "hawLibrary") {   // the literature hall: the palace's books in lacquered chests, a reading stand on a low dais
      const books = { tip: "The palace's books", toast: "The literature hall of the palace. In lacquered and gilded chests the court kept its books: bundles of palm-leaf manuscripts between wooden covers, and folding books of black paper (parabaik) written in white steatite. Buddhist texts, the chronicles of the state, poems and songs, medicine and astrology, written in Shan script; the court kept its own scribes and poets, and here they read aloud to the saopha." };
      const Lb = new THREE.Group(); g.add(Lb);
      // the low dais at the back, and on it the reader's cushion and a gilt reading stand with a black folding book open on it
      mesh(new THREE.BoxGeometry(6.4, .25, 3.1), dark, 0, .125, -3.95, Lb);
      mesh(new THREE.BoxGeometry(6.42, .05, .04), gold, 0, .23, -2.4, Lb);
      mesh(new THREE.BoxGeometry(.9, .14, .8), std({ color: 0x7a0c10, roughness: .85 }), 0, .32, -4.2, Lb);
      mesh(new THREE.BoxGeometry(.7, .4, .5), gold, 0, .45, -3.4, Lb);
      const rest = mesh(new THREE.BoxGeometry(.8, .04, .55), red, 0, .72, -3.45, Lb); rest.rotation.x = .35;
      const pageT = canvasTex(64, (c, s2) => { c.fillStyle = "#121010"; c.fillRect(0, 0, s2, s2); c.fillStyle = "#d8d4c8"; for (let y = 8; y < s2; y += 7) for (let x = 4; x < s2 - 6; x += 5 + (x * y) % 4) c.fillRect(x, y, 3, 1.5); c.fillStyle = "#333"; c.fillRect(s2 / 2 - 1, 0, 2, s2); });
      const page = mesh(new THREE.BoxGeometry(.7, .02, .4), std({ map: pageT, roughness: .7 }), 0, .76, -3.43, Lb); page.rotation.x = .35;
      // a long teak rack along the back wall, palm-leaf bundles wrapped in cloths of different colours lying on its shelves
      [.6, 1.3, 2].forEach(y => mesh(new THREE.BoxGeometry(5.6, .06, .5), dark, 0, y, -5.2, Lb));
      [-2.8, 2.8].forEach(x => mesh(new THREE.BoxGeometry(.08, 1.9, .5), dark, x, 1.25, -5.2, Lb));
      const wraps = [0x8a1a10, 0xc89a30, 0x1f5a3a, 0x6a2a6a, 0xd8c08a].map(c => std({ color: c, roughness: .9 })), r2 = rng(931);
      [.6, 1.3, 2].forEach(y => { for (let x = -2.6; x < 2.5; x += .48) mesh(new THREE.BoxGeometry(.4, .14, .14), wraps[(r2() * 5) | 0], x + r2() * .05, y + .1, -5.2 + (r2() - .5) * .1, Lb); });
      // the chests down the side walls: red lacquer on four legs, gilt panels and a gilt band round the lid, a little wider at the top
      const chestT = canvasTex(128, (c, s2) => { c.fillStyle = "#6e1208"; c.fillRect(0, 0, s2, s2); c.strokeStyle = "#d8a640"; c.lineWidth = 6; c.strokeRect(8, 8, s2 - 16, s2 - 16); c.lineWidth = 2; c.strokeRect(20, 20, s2 - 40, s2 - 40); c.fillStyle = "#d8a640"; c.beginPath(); c.ellipse(s2 / 2, s2 / 2, 22, 30, 0, 0, TAU); c.fill(); c.fillStyle = "#6e1208"; c.beginPath(); c.ellipse(s2 / 2, s2 / 2, 12, 20, 0, 0, TAU); c.fill(); });
      const chestM = std({ map: chestT, roughness: .35, metalness: .2 });
      [-1, 1].forEach(sd => [-3.4, -.2, 3.1].forEach(z => {
        const C = new THREE.Group(); C.position.set(sd * 6.75, 0, z); C.rotation.y = -sd * Math.PI / 2; Lb.add(C);
        [[-.65, -.3], [.65, -.3], [-.65, .3], [.65, .3]].forEach(([lx, lz]) => mesh(new THREE.BoxGeometry(.1, .4, .1), red, lx, .2, lz, C));
        mesh(new THREE.BoxGeometry(1.5, 1, .75), [red, red, red, red, chestM, red], 0, .9, 0, C);
        mesh(new THREE.BoxGeometry(1.7, .12, .88), red, 0, 1.46, 0, C); mesh(new THREE.BoxGeometry(1.72, .04, .9), gold, 0, 1.4, 0, C);
      }));
      // low reading tables on the mats, a palm-leaf bundle on each
      const leaf = std({ color: 0xd8c08a, roughness: .8 }), cover = std({ color: 0x3a1e0e, roughness: .6 });
      [[-2, 1.2], [2, 1.2], [-2, 4], [2, 4]].forEach(([x, z]) => {
        mesh(new THREE.BoxGeometry(.9, .05, .45), red, x, .3, z, Lb);
        [[-.38, -.18], [.38, -.18], [-.38, .18], [.38, .18]].forEach(([lx, lz]) => mesh(new THREE.BoxGeometry(.05, .28, .05), red, x + lx, .14, z + lz, Lb));
        mesh(new THREE.BoxGeometry(.5, .05, .07), leaf, x, .35, z, Lb); [-.03, .03].forEach(dy => mesh(new THREE.BoxGeometry(.52, .012, .075), cover, x, .35 + dy, z, Lb));
      });
      Lb.traverse(o => { if (o.isMesh) clickable(list, o, books); });
    } else if (kind === "hawDining") {   // the dining hall: low round lacquer tables on the floor, the saopha's gilt table on the dais
      const meal = { tip: "The palace's tables", toast: "The dining hall of the palace. As in every Shan house the meal is eaten sitting on the floor, at low round tables of lacquer: a mound of rice in the middle and round it curries, soups, pickles and relishes in small bowls, to be shared, with fermented soybean, pickled mustard greens and a sour tomato dip among them. The saopha ate at his own gilt table on the dais, his family and guests at the red tables below." };
      const Dn = new THREE.Group(); g.add(Dn);
      const lacq = std({ color: 0x5a0e08, roughness: .3 }), black = std({ color: 0x141010, roughness: .3 }), rice = std({ color: 0xf2eee4, roughness: .9 }), curry = [0xa8501a, 0x5a6a20, 0xc89030, 0x6a2a14].map(c => std({ color: c, roughness: .7 }));
      const cushion = std({ color: 0x7a0c10, roughness: .85 });
      // a low round table set for a meal: rice under a domed lid in the middle, small bowls round it, a cushion at each side
      const table = (x, z, y, r, top, k) => {
        mesh(new THREE.CylinderGeometry(r, r, .05, 28), top, x, y + .3, z, Dn);
        mesh(new THREE.CylinderGeometry(r * .5, r * .65, .28, 20), top === gold ? gold : black, x, y + .14, z, Dn);
        mesh(new THREE.CylinderGeometry(.16, .14, .1, 16), rice, x, y + .37, z, Dn);
        const lid = mesh(new THREE.SphereGeometry(.17, 16, 8, 0, TAU, 0, Math.PI / 2), top === gold ? gold : lacq, x - .32 * r, y + .33, z + .2 * r, Dn); lid.scale.y = .8;
        for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + k; mesh(new THREE.CylinderGeometry(.07, .05, .06, 12), i % 2 ? black : lacq, x + Math.cos(a) * r * .62, y + .35, z + Math.sin(a) * r * .62, Dn); mesh(new THREE.CylinderGeometry(.06, .06, .02, 12), curry[i % 4], x + Math.cos(a) * r * .62, y + .38, z + Math.sin(a) * r * .62, Dn); }
        [0, 1, 2, 3].forEach(i => { const a = i / 4 * TAU + Math.PI / 4; mesh(new THREE.BoxGeometry(.5, .1, .5), cushion, x + Math.cos(a) * (r + .45), y + .05, z + Math.sin(a) * (r + .45), Dn).rotation.y = -a; });
      };
      mesh(new THREE.BoxGeometry(6.4, .3, 3.1), dark, 0, .15, -3.95, Dn); mesh(new THREE.BoxGeometry(6.42, .05, .04), gold, 0, .28, -2.4, Dn);
      table(0, -3.9, .3, .65, gold, .3);
      [[-2.1, .6], [2.1, .6], [-2.1, 3.8], [2.1, 3.8]].forEach(([x, z], i) => table(x, z, 0, .6, lacq, i));
      // along the side walls, stacked lacquer food carriers and big earthen water pots on wooden stands, a cup on each lid
      const clay = std({ color: 0x8a4a2a, roughness: .85 });
      [-1, 1].forEach(sd => {
        [-3, 3.8].forEach(z => { mesh(new THREE.BoxGeometry(.6, .5, .6), dark, sd * 6.7, .25, z, Dn); const pot = mesh(new THREE.SphereGeometry(.42, 18, 12), clay, sd * 6.7, .85, z, Dn); pot.scale.y = .9; mesh(new THREE.CylinderGeometry(.3, .3, .04, 16), dark, sd * 6.7, 1.25, z, Dn); mesh(new THREE.CylinderGeometry(.07, .05, .1, 12), gold, sd * 6.7, 1.32, z, Dn); });
        [-.2, 1.4].forEach(z => { for (let k = 0; k < 4; k++) mesh(new THREE.CylinderGeometry(.24 - k * .02, .24 - k * .02, .16, 16), k % 2 ? gold : lacq, sd * 6.7, .08 + k * .17, z, Dn); mesh(new THREE.TorusGeometry(.16, .02, 6, 16, Math.PI), gold, sd * 6.7, .78, z, Dn).rotation.y = Math.PI / 2; });
      });
      Dn.traverse(o => { if (o.isMesh) clickable(list, o, meal); });
    } else {   // the opera hall: a little stage under a gilt proscenium, a painted backdrop, footlights, the drum and gongs beside it
      const show = { tip: "The palace's little theatre", toast: "The palace's little theatre. Here the court's players gave the saopha and his household dance-dramas from the Jataka tales and the Shan epics, by lamplight, with the long drum, the gongs and the cymbals beside the stage, and singers and puppet shows on festival nights. The saopha watched from his gilt seat in the middle of the floor, the household on the mats behind him." };
      const Op = new THREE.Group(); g.add(Op);
      const SF = -2;   // the stage's front edge
      mesh(new THREE.BoxGeometry(7, .8, 5.5 + SF), dark, 0, .4, (SF - 5.5) / 2, Op);
      mesh(new THREE.BoxGeometry(7.02, .1, .04), gold, 0, .76, SF, Op); mesh(new THREE.BoxGeometry(7.02, .06, .04), gold, 0, .1, SF, Op);
      for (let k = 0; k < 3; k++) mesh(new THREE.BoxGeometry(1.2, .8 - k * .27, .3), dark, -2.6, (.8 - k * .27) / 2, SF + .15 + k * .3, Op);   // steps up at the side
      // the painted backdrop: a palace among wooded hills under a blue sky, on the back wall above the stage
      const scene = canvasTex(512, (c, s2) => {
        const sky = c.createLinearGradient(0, 0, 0, s2); sky.addColorStop(0, "#5a86b8"); sky.addColorStop(.6, "#cfe0e8"); c.fillStyle = sky; c.fillRect(0, 0, s2, s2);
        c.fillStyle = "#4a6a4a"; c.beginPath(); c.moveTo(0, s2 * .6); for (let x = 0; x <= s2; x += 32) c.lineTo(x, s2 * .55 - Math.sin(x / 60) * 40 - Math.sin(x / 23) * 12); c.lineTo(s2, s2); c.lineTo(0, s2); c.fill();
        c.fillStyle = "#2e4a2e"; for (let x = 10; x < s2; x += 46) { c.beginPath(); c.arc(x, s2 * .74, 26, 0, TAU); c.fill(); }
        c.fillStyle = "#c89a44"; c.fillRect(s2 * .38, s2 * .56, s2 * .24, s2 * .16); c.fillStyle = "#7a2a1c";
        for (let k = 0; k < 5; k++) { const w = s2 * (.3 - k * .05), y = s2 * (.56 - k * .05); c.beginPath(); c.moveTo(s2 / 2 - w / 2, y); c.lineTo(s2 / 2 + w / 2, y); c.lineTo(s2 / 2, y - s2 * .07); c.fill(); }
        c.fillStyle = "#e8c070"; c.fillRect(s2 / 2 - 2, s2 * .2, 4, s2 * .14);
        c.fillStyle = "#8a6a3a"; c.fillRect(0, s2 * .86, s2, s2 * .14);
      });
      mesh(new THREE.PlaneGeometry(6.6, 3.8), std({ map: scene, roughness: .9 }), 0, 2.75, -5.46, Op);
      // the proscenium: gilt posts and a gilt beam with a pointed crest, red curtains gathered to either side
      [-1, 1].forEach(sd => {
        mesh(new THREE.BoxGeometry(.3, 4.2, .3), gold, sd * 3.35, 2.9, SF - .1, Op);
        const cur = mesh(new THREE.CylinderGeometry(.35, .55, 3.6, 12, 1, false, 0, Math.PI), std({ color: 0x8a0e10, roughness: .8, side: THREE.DoubleSide }), sd * 2.95, 2.6, SF - .3, Op); cur.rotation.y = sd > 0 ? Math.PI / 2 : -Math.PI / 2;
      });
      mesh(new THREE.BoxGeometry(7, .5, .3), gold, 0, 5.05, SF - .1, Op);
      mesh(new THREE.BoxGeometry(6.6, .8, .06), std({ color: 0x8a0e10, roughness: .8 }), 0, 4.45, SF - .2, Op);   // the valance
      const crest = mesh(new THREE.ConeGeometry(1.3, .9, 4), gold, 0, 5.75, SF - .1, Op); crest.rotation.y = Math.PI / 4; crest.scale.z = .1;
      // footlights: little oil lamps along the stage's front edge, glowing
      const flameM = std({ color: 0xffd890, emissive: 0xffb040, emissiveIntensity: 1 });
      for (let x = -3; x <= 3.01; x += .75) { mesh(new THREE.CylinderGeometry(.06, .04, .06, 10), gold, x, .83, SF + .1, Op); mesh(new THREE.SphereGeometry(.035, 8, 6), flameM, x, .9, SF + .1, Op).castShadow = false; }
      // beside the stage, the long drum on its stand and a frame of gongs
      mesh(new THREE.CylinderGeometry(.22, .3, 1.6, 16), red, -5.2, .6, -1.1, Op).rotation.z = Math.PI / 2 - .2;
      mesh(new THREE.BoxGeometry(.12, 1.4, .12), dark, -5.4, .7, -.5, Op); mesh(new THREE.BoxGeometry(.12, 1.4, .12), dark, -4.6, .7, -.5, Op); mesh(new THREE.BoxGeometry(.9, .1, .1), dark, -5, 1.4, -.5, Op);
      [-5.25, -4.75].forEach(x => mesh(new THREE.CylinderGeometry(.18, .18, .06, 20), M.brass, x, 1.05, -.5, Op).rotation.x = Math.PI / 2);
      // the saopha's seat in the middle of the floor, facing the stage: a low gilt seat with arms and a red cushion
      mesh(new THREE.BoxGeometry(1, .3, .9), gold, 0, .15, 2.6, Op); mesh(new THREE.BoxGeometry(.8, .1, .7), std({ color: 0x7a0c10, roughness: .85 }), 0, .35, 2.6, Op);
      mesh(new THREE.BoxGeometry(1, .6, .1), gold, 0, .6, 3.02, Op); [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.1, .3, .8), gold, sd * .48, .45, 2.6, Op));
      Op.traverse(o => { if (o.isMesh) clickable(list, o, show); });
    }
    // white drapes gathered back to the pillars either side of the throne, swagged from a gilt rod across the hall (not in the theatre)
    if (kind !== "hawOpera") mesh(new THREE.CylinderGeometry(.04, .04, 7.2, 8), gold, 0, 6.5, -4.4, g).rotation.z = Math.PI / 2;
    if (kind !== "hawOpera") [-1, 1].forEach(sd => {
      const top = mesh(new THREE.BoxGeometry(1.8, 2.4, .08), cloth, sd * 2.55, 5.3, -4.25, g); top.rotation.z = -sd * .1;
      const fall = mesh(new THREE.BoxGeometry(.5, 4.2, .12), cloth, sd * 3.25, 2.1, -4.15, g); fall.rotation.z = sd * .04;
      const swag = mesh(new THREE.SphereGeometry(1, 20, 12), cloth, sd * 2.4, 6.2, -4.3, g); swag.scale.set(1.1, .45, .3);
      mesh(new THREE.TorusGeometry(.18, .04, 6, 16), gold, sd * 3.25, 4.1, -4, g);   // the gilt tie-back
    });
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
