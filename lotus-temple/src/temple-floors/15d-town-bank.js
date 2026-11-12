  /* ---------- ဘဏ် the town's bank, across the market lane from the Haw Kham's east wall, just south of the library and facing the
     palace like it; after the owner's photograph of an old white building of the saophas' time: two storeys of whitewashed plaster
     with arched windows, a three-storey round tower at each front corner under a white onion dome, a centre block brought forward
     with three tall arches below, three arched windows above and a dark gabled roof with a brown pediment and a spire, small flat
     porches over the wing doors, and oval flower beds edged with white stones in the forecourt round the flag ---------- */
  // the name board's lines: Burmese, Chinese and English (Shan and Tai Nüa to come from the site's owner)
  const BANK_NAMES = { my: "ဘဏ်", zh: "银行", en: "Bank" };
  const BANK = { x: 60, z: 235, ry: -Math.PI / 2 };   // where it stands; ry turns its front (local +z) west, to the Haw Kham across the lane, as the library's
  // the name board on two posts by the path: three lines in white on dark green in a white frame, faintly lit at night, readable from both sides
  function bankBoard(parent, x, y, z) {
    const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 512;
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
    const N = BANK_NAMES, LINES = [[N.my, '600 120px "Noto Sans Myanmar", "Myanmar Text", sans-serif', 130], [N.zh, '600 110px "Noto Serif SC", "Noto Serif TC", "Songti SC", serif', 290], [N.en, '600 76px "Figtree", sans-serif', 425]];
    const paint = () => {
      const c = cv.getContext("2d");
      c.fillStyle = "#1e4a3a"; c.fillRect(0, 0, 1024, 512); c.strokeStyle = "#fff"; c.lineWidth = 12; c.strokeRect(8, 8, 1008, 496);
      c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle";
      LINES.forEach(([s, font, ly]) => { c.font = font; c.fillText(s, 512, ly, 960); });
      t.needsUpdate = true;
    };
    paint();
    if (document.fonts && document.fonts.load) Promise.all(LINES.map(([s, font]) => document.fonts.load(font, s).catch(() => {}))).then(paint);
    const m = std({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .3, roughness: .6, side: THREE.DoubleSide });
    onDaylight(d => { m.emissiveIntensity = .3 + .5 * (1 - d); });
    flat(mesh(new THREE.PlaneGeometry(3, 1.5), m, x, y + .4, z, parent));
  }
  function townBank(g) {
    const B = new THREE.Group(); B.position.set(BANK.x, 0, BANK.z); B.rotation.y = BANK.ry; g.add(B);
    const list = picks.pagoda, data = { tip: `The bank · ${BANK_NAMES.my}`, toast: `${BANK_NAMES.my} in Burmese, ${BANK_NAMES.zh} in Chinese: the town's bank, in a white building of the saophas' time across the lane from the Haw Kham, with an onion-domed tower at each front corner and three tall arches under a gabled centre. In the hall clerks take savings, change money and pay out pensions; traders from the market queue at the counters on market days. Nothing can be paid or banked here: it's only to look at.` };
    const P = .4, FH = 4.2, F2 = P + FH, EV = P + 2 * FH, PA = EV + .8;   // the plinth, a storey, the upper floor, the eaves, the parapet's top
    const white = std({ color: 0xf4f2ea, roughness: .9 }), trim = std({ color: 0xffffff, roughness: .8 }), shade = std({ color: 0x24221e, roughness: 1 });
    const slate = std({ color: 0x3a3632, roughness: .85, side: THREE.DoubleSide }), pedM = std({ color: 0x8a5a34, roughness: .85, side: THREE.DoubleSide }), frame = std({ color: 0x4a4038, roughness: .7 });
    const geos = {}, box = (w, h, d) => geos[[w, h, d]] || (geos[[w, h, d]] = new THREE.BoxGeometry(w, h, d));
    const halfDisc = r => geos["d" + r] || (geos["d" + r] = new THREE.CircleGeometry(r, 14, 0, Math.PI));
    const halfRing = r => geos["r" + r] || (geos["r" + r] = new THREE.TorusGeometry(r, .07, 4, 14, Math.PI));
    // an arched window, the round head over a tall pane, a white moulding round it and a sill; faces local +z of its frame.
    // `open`: a dark arched opening in place of glass (the arcade under the centre block)
    const arch = (x, y, z, ry, w, h, open) => {
      const o = new THREE.Group(); o.position.set(x, y, z); o.rotation.y = ry; B.add(o);
      const pane = open ? shade : townGlass, r = w / 2, hs = h - r;   // h: from the sill to the top of the arch
      part(box(w, hs, .06), pane, 0, hs / 2, .01, o); part(halfDisc(r), pane, 0, hs, .045, o);
      part(halfRing(r + .05), trim, 0, hs, .06, o);
      [-1, 1].forEach(sd => part(box(.12, hs, .12), trim, sd * (r + .05), hs / 2, .06, o));
      if (!open) { part(box(.05, h - .1, .08), frame, 0, (h - .1) / 2, .04, o); part(box(w + .3, .1, .22), trim, 0, -.05, .08, o); }
    };
    // a cornice band round a box face: from x0 to x1 at height y on the face z (local), standing out .15
    const band = (x0, x1, y, z, h = .22) => mesh(box(x1 - x0, h, .3), trim, (x0 + x1) / 2, y, z, B);

    // the main block, two storeys between the towers, a string course at the upper floor, a cornice and a parapet at the eaves
    const W = 13.4, D = 6, CW = 5, CZ = D + 2.6;   // half-width, half-depth; the centre block's half-width and its front face
    clickable(list, mesh(box(2 * W, EV - P, 2 * D), white, 0, P + (EV - P) / 2, 0, B), data);
    mesh(box(2 * W + 1, P, 2 * D + 1), trim, 0, P / 2, 0, B);
    [[F2, .22], [EV, .35]].forEach(([y, h]) => { band(-W - .1, W + .1, y, D + .05, h); band(-W - .1, W + .1, y, -D - .05, h); [-1, 1].forEach(sd => mesh(box(.3, h, 2 * D), trim, sd * (W + .05), y, 0, B)); });
    [[0, D - .1, 2 * W, .25], [0, -D + .1, 2 * W, .25], [W - .1, 0, .25, 2 * D], [-W + .1, 0, .25, 2 * D]].forEach(([x, z, w, d]) => mesh(box(w, PA - EV, d), white, x, (EV + PA) / 2, z, B));
    const rf = tinHipRoof(W - .4, D - .4, 2.6, slate); rf.position.set(0, EV, 0); rf.castShadow = true; B.add(rf);
    sRect(B, -W, W, -D, D);
    // the wings' windows: three arched ones each side upstairs and down, the middle one downstairs a door under a flat porch
    [-1, 1].forEach(sd => {
      [6.6, 8.6, 10.6].forEach((x, i) => {
        arch(sd * x, F2 + .8, D + .02, 0, 1.4, 2.6);
        if (i !== 1) arch(sd * x, P + .8, D + .02, 0, 1.4, 2.6);
      });
      const dx = sd * 8.6;
      arch(dx, P, D + .02, 0, 1.6, 3.2, true);
      clickable(list, mesh(box(1.5, 2.4, .08), std({ color: 0x5a3a22, roughness: .6 }), dx, P + 1.2, D + .06, B), data);
      mesh(box(3, .2, 2), trim, dx, P + 3.55, D + 1, B);   // the porch roof, on two posts
      mesh(box(1.8, .5, .06), shade, dx, P + 3.95, D + .06, B);   // the black board over the door, as in the photograph
      [-1.3, 1.3].forEach(px => { mesh(box(.22, 3.45, .22), trim, dx + px, P + 1.72, D + 1.85, B); sCircle(B, dx + px, D + 1.85, .2); });
      mesh(box(3.4, P, 2.4), trim, dx, P / 2, D + 1.2, B);
      sRect(B, dx - 1.7, dx + 1.7, D, D + 2.4, P);
    });
    // the sides and back: arched windows on both floors
    for (let x = -11; x <= 11; x += 2.75) [P + .8, F2 + .8].forEach(y => arch(x, y, -D - .02, Math.PI, 1.3, 2.6));
    [-1, 1].forEach(sd => [-3, 0].forEach(z => [P + .8, F2 + .8].forEach(y => arch(sd * (W + .02), y, z, sd * Math.PI / 2, 1.3, 2.6))));

    // the centre block, brought forward and a little taller: three tall arches below, three arched windows above, a cornice, and a
    // dark gabled roof, its front a brown pediment framed in white with a spire on the ridge
    const CT = PA + .6;   // the centre block's top
    clickable(list, mesh(box(2 * CW, CT - P, CZ - D + .4), white, 0, P + (CT - P) / 2, (CZ + D - .4) / 2, B), data);
    mesh(box(2 * CW + 1, P, CZ - D + 1.6), trim, 0, P / 2, (CZ + D + 1.2) / 2, B);
    [[.27, CZ + 1.6], [.13, CZ + 2]].forEach(([h, z]) => mesh(box(4.2, h, .4), trim, 0, h / 2, z, B));   // the steps
    [-1, 1].forEach(sd => mesh(box(.5, CT - P, .5), trim, sd * (CW - .1), P + (CT - P) / 2, CZ + .05, B));   // the pilasters at its corners
    band(-CW - .1, CW + .1, F2, CZ + .05); band(-CW - .1, CW + .1, CT - .2, CZ + .05, .4);
    [-2.7, 0, 2.7].forEach(x => { arch(x, P, CZ + .02, 0, 2, 3.7, true); arch(x, F2 + .7, CZ + .02, 0, 1.5, 2.9); });
    sRect(B, -CW, CW, D, CZ);
    sRect(B, -CW - .5, CW + .5, CZ, CZ + 1.4, P);
    const GH = 3.4, GD = CZ + 2.2, GL = Math.hypot(CW + .3, GH), GA = Math.atan2(GH, CW + .3);   // the gable: its height, its depth back from the front, a slope's length and pitch
    [-1, 1].forEach(sd => { const s = mesh(box(GL, .16, GD), slate, sd * (CW + .3) / 2, CT + GH / 2, CZ + .25 - GD / 2, B); s.rotation.z = -sd * GA; });
    const tri = new THREE.Shape(); tri.moveTo(-CW + .1, 0); tri.lineTo(CW - .1, 0); tri.lineTo(0, GH - .25); tri.closePath();
    mesh(new THREE.ShapeGeometry(tri), pedM, 0, CT, CZ, B);
    [-1, 1].forEach(sd => { const e = mesh(box(GL, .22, .14), trim, sd * (CW + .3) / 2, CT + GH / 2, CZ + .25, B); e.rotation.z = -sd * GA; });
    mesh(box(2 * CW + .4, .2, .2), trim, 0, CT + .05, CZ + .05, B);
    mesh(new THREE.CylinderGeometry(.18, .26, .7, 8), slate, 0, CT + GH + .2, CZ, B);
    mesh(new THREE.ConeGeometry(.15, 2.2, 8), slate, 0, CT + GH + 1.6, CZ, B);
    mesh(new THREE.SphereGeometry(.14, 8, 6), std({ color: 0xc8a040, roughness: .4, metalness: .6 }), 0, CT + GH + 2.75, CZ, B);

    // the corner towers: eight-sided, three storeys stepping in, an arched window on each outward face, cornices between, and a
    // white onion dome with a finial
    const TR = 3, TZ = D - 1.6, TH = [[P, F2, TR], [F2, EV, TR], [EV, EV + 3.6, TR - .45]];
    const onion = new THREE.LatheGeometry([[0, 4.4], [.1, 4.1], [.35, 3.7], [.9, 3.2], [1.6, 2.6], [2.15, 1.8], [2.35, 1], [2.2, .4], [2, 0]].map(([r, y]) => new THREE.Vector2(r, y)), 24);
    const domeM = std({ color: 0xfaf8f0, roughness: .7, side: THREE.DoubleSide }), finM = std({ color: 0x8a8a84, roughness: .5, metalness: .5 });
    [-1, 1].forEach(sd => {
      const tx = sd * (W + TR - 1);
      TH.forEach(([y0, y1, r], k) => {
        clickable(list, mesh(new THREE.CylinderGeometry(r, r, y1 - y0, 8), white, tx, (y0 + y1) / 2, TZ, B), data).rotation.y = Math.PI / 8;
        mesh(new THREE.CylinderGeometry(r + .18, r + .18, k === 2 ? .45 : .25, 8), trim, tx, y1, TZ, B).rotation.y = Math.PI / 8;
        const ap = r * Math.cos(Math.PI / 8) + .02, wh = k === 2 ? 2.2 : 2.6;
        [0, sd * Math.PI / 4, sd * Math.PI / 2, sd * 3 * Math.PI / 4].forEach(a => arch(tx + Math.sin(a) * ap, y0 + .8, TZ + Math.cos(a) * ap, a, k === 2 ? .9 : 1.1, wh));
      });
      mesh(new THREE.CylinderGeometry(TR + .3, TR + .3, P, 8), trim, tx, P / 2, TZ, B).rotation.y = Math.PI / 8;
      mesh(new THREE.CylinderGeometry(2.1, 2.3, .5, 16), trim, tx, EV + 3.85, TZ, B);
      mesh(onion, domeM, tx, EV + 4.1, TZ, B).castShadow = true;
      mesh(new THREE.CylinderGeometry(.05, .07, 1.4, 6), finM, tx, EV + 9.1, TZ, B);
      mesh(new THREE.SphereGeometry(.13, 8, 6), finM, tx, EV + 8.7, TZ, B);
      sCircle(B, tx, TZ, TR);
    });

    // the forecourt of red earth, kerbed toward the lane, the path to the steps, the oval flower beds edged with whitewashed stones
    // round the flag, and the name board
    flat(mesh(box(40, .05, 24), std({ color: 0xa8784a, roughness: 1 }), 0, .03, 4.5, B)).receiveShadow = true;
    flat(mesh(box(4, .06, 6.5), M.stone, 0, .04, CZ + 4.8, B));
    [[-20, -2, 16.4], [2, 20, 16.4]].forEach(([a, b, z]) => flat(mesh(box(b - a, .15, .2), concrete, (a + b) / 2, .08, z, B)));
    const r = rng(9292), stone = new THREE.IcosahedronGeometry(.16, 0), bloom = new THREE.IcosahedronGeometry(.2, 0);
    const FLOWERS = [0xd83a3a, 0xf0c030, 0xf4f0f0, 0xe070a0, 0x3e6a2a, 0x4e7a30].map(c => std({ color: c, roughness: .9, flatShading: true }));
    const bed = (cx, cz, a, b) => {   // an oval of flowers, semi-axes a × b, its rim of white stones
      const n = Math.round((a + b) * 3.2);
      for (let i = 0; i < n; i++) { const t = i / n * TAU; part(stone, trim, cx + Math.cos(t) * a, .1, cz + Math.sin(t) * b, B).rotation.y = r() * TAU; }
      for (let i = 0; i < n * 1.6; i++) { const t = r() * TAU, k = Math.sqrt(r()) * .85; const o = part(bloom, FLOWERS[(r() * FLOWERS.length) | 0], cx + Math.cos(t) * a * k, .18, cz + Math.sin(t) * b * k, B); o.scale.setScalar(.7 + r() * .6); }
    };
    bed(-6.5, CZ + 4.5, 4, 1.6); bed(6.5, CZ + 4.5, 4, 1.6);
    const FZ = CZ + 4.5;
    [-1, 1].forEach(sd => bed(sd * 15, FZ, 2.6, 1.4));
    mesh(box(1.2, .6, 1.2), trim, -11.5, .3, FZ, B);
    flagPole(g, BANK.x - FZ, BANK.z - 11.5, 10);   // local (x, z) is world (BANK.x − z, BANK.z + x) under ry
    [-12.6, -9.4].forEach(x => { mesh(box(.14, 2.9, .14), townFrame, x, 1.45, 15.3, B); sCircle(B, x, 15.3, .12); });
    bankBoard(B, -11, 1.8, 15.38);
    // keep the outside camera above it
    TALL.push({ x0: BANK.x - 17, x1: BANK.x + 8, z0: BANK.z - 20, z1: BANK.z + 20, h: EV + 10 });
  }
