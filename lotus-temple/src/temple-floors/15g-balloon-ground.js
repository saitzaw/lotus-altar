  /* ---------- မီးပုံးပျံ the fire balloon ground, on the stupa hill's lower terrace round past the east stair, looking north over the
     palace lake: the terrace carried out level over the slope on a whitewashed retaining wall, a parapet with gilt coping and lamp
     posts along its outer edge, and behind it, up the slope to the upper terrace, stepped terraces for the crowd. As at the Taunggyi
     festival in the month of Tazaungmon, teams fill great paper balloons over a fire pit, the top held up from a tall bamboo mast, and
     let them go, one after another: great paper animals and balloons painted with devas by day (8 am to 3 pm), and after dark (6 pm to 2 am) tall painted balloons,
     balloons studded with little candle lanterns, and balloons carrying fireworks, while the crowd lets go small sky lanterns ---------- */
  // angles round the hill from the main stair (radians): the field starts `da0` past the east stair and runs to a1; its outer edge
  // r1, where its end walls begin (the terrace's edge), parapet height and thickness; the crowd's terraces (`tiers` steps from the
  // lower terrace up to the upper) stop `tierIn` short of the field's ends; the launch pads (fractions along the field, radius);
  // a balloon's cycle (s): filling, held full, rising, gone; its climb and drift (m/s); the night lanterns: how many, each one's
  // cycle (s) and how long it is held up in its launcher's hands before it is let go, and how many people let them go down on the
  // field by the parapet and up on the top steps of the terraces
  const BALLOON_GROUND = { da0: .085, a1: 2.62, r1: 76.5, edge: 70.4, PH: .95, PW: .35, tiers: 9, tierIn: .1,
    pads: [[.22, 65], [.5, 64], [.78, 65]], fill: 55, hold: 15, rise: 95, gone: 10, climb: 1.4, accel: .012, drift: [.55, .3],
    lanN: 180, lanP: 190, lanHold: 6, lanLow: 36, lanHigh: 30 };
  // a slab in the hill's frame between an inner edge r0 (a radius, or a function of the angle) and an arc r1 round the hill's centre,
  // and two radii at angles b0, b1, from y0 up to y1 (the angle runs from the main stair, local -z, toward the east stair)
  function arcSlab(H, r0, r1, b0, b1, y0, y1, mat) {
    const s = new THREE.Shape(), n = Math.max(2, Math.ceil((b1 - b0) / .008)), ri = typeof r0 === "function" ? r0 : () => r0;
    for (let i = 0; i <= n; i++) { const a = b0 + (b1 - b0) * i / n; i ? s.lineTo(r1 * Math.sin(a), r1 * Math.cos(a)) : s.moveTo(r1 * Math.sin(a), r1 * Math.cos(a)); }
    for (let i = n; i >= 0; i--) { const a = b0 + (b1 - b0) * i / n, rr = ri(a); s.lineTo(rr * Math.sin(a), rr * Math.cos(a)); }
    const geo = new THREE.ExtrudeGeometry(s, { depth: y1 - y0, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
    return mesh(geo, mat, 0, y0, 0, H);
  }
  // the east stair's angle round the hill, in the same reckoning
  function eastStairAngle() {
    const H = HILL.group; H.updateMatrixWorld(true);
    const v = H.worldToLocal(V(HILL.cx + HILL.east[0] * 60, 0, HILL.cz + HILL.east[1] * 60));
    return Math.atan2(v.x, -v.z);
  }
  function balloonGround(g) {
    const B = BALLOON_GROUND, H = HILL.group, list = picks.pagoda, r = rng(5150);
    const lo = HILL.terraces[1], up = HILL.terraces[0], top = lo.y + .03, rIn = lo.r0, a0 = eastStairAngle() + B.da0, a1 = B.a1, PH = B.PH, PW = B.PW;
    const at = (a, rr) => [rr * Math.sin(a), -rr * Math.cos(a)];   // hill frame (x, z) at angle a, radius rr
    const wash = std({ color: 0xf2eee4, roughness: .8 });
    const data = { tip: "The fire balloon ground · မီးပုံးပျံပွဲကွင်း", toast: "The fire balloon ground (မီးပုံးပျံပွဲကွင်း in Burmese). In the month of Tazaungmon, up to its full moon, Shan towns let fire balloons go, as at the great festival in Taunggyi: teams build tall balloons of paper, fill them with the heat of a fire held under the mouth, the top hung from a bamboo mast, and let them go to cheers. By day, from eight in the morning till three, the teams send up great paper animals one after another: a round rooster painted all over in bright feathers with its tail fanned behind, a fish, a parrot, a bear and a tiger, and round balloons painted like temple murals with a deva seated on the waves holding a lotus, over a ring of lotus petals, hung with paper diamonds and tassels. From six in the evening till two in the morning come the night balloons: tall ones painted all over in bright panels and glowing from the fire inside, ones hung with hundreds of little candle lanterns in flowers with a picture in lanterns hanging below, and ones carrying a rack of fireworks (စိန်နားပန်, \"diamond earrings\") that showers sparks over the crowd as they climb. At night the crowd lets go hundreds of small paper lanterns too, each lit by a little wick of wax, that drift high over the town. The crowd watches from the terraces cut into the hill. Nothing goes up in the rain: wet paper will not hold the heat." };
    // the field: trampled grass worn to earth, on its retaining wall (footed low, below the slope)
    const fieldTex = canvasTex(256, (c, sz) => { c.fillStyle = "#6f8442"; c.fillRect(0, 0, sz, sz); const q = rng(51); for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(${140 + q() * 30 | 0},${110 + q() * 20 | 0},${70 + q() * 20 | 0},${.25 + q() * .3})`; c.beginPath(); c.ellipse(q() * sz, q() * sz, 6 + q() * 22, 4 + q() * 12, q() * 3, 0, TAU); c.fill(); } for (let i = 0; i < 900; i++) { c.fillStyle = q() < .5 ? "rgba(40,70,30,.45)" : "rgba(130,155,80,.4)"; c.fillRect(q() * sz, q() * sz, 2, 3); } });
    fieldTex.wrapS = fieldTex.wrapT = THREE.RepeatWrapping; fieldTex.repeat.set(.08, .08);   // the top's UVs are in metres: a tile every 12.5 m
    const field = std({ map: fieldTex, roughness: 1 });
    onDaylight(d => field.color.copy(lerpC(0x3a4a34, 0xffffff, d)));
    const deck = arcSlab(H, rIn, B.r1, a0, a1, .2, top, [field, wash]); deck.castShadow = false; deck.receiveShadow = true;
    clickable(list, deck, data);
    // the parapet along the outer edge, and the end walls where the field runs out past the terrace, capped in gilt
    const da = PW / B.edge;
    arcSlab(H, B.r1 - PW, B.r1, a0, a1, top, top + PH, wash);
    arcSlab(H, B.r1 - PW - .07, B.r1 + .07, a0 - .001, a1 + .001, top + PH, top + PH + .12, M.trim);
    [[a0, a0 + da, -.001, .0005], [a1 - da, a1, -.0005, .001]].forEach(([b0, b1, e0, e1]) => {
      arcSlab(H, B.edge, B.r1 - PW, b0, b1, top, top + PH, wash);
      arcSlab(H, B.edge - .07, B.r1 - PW, b0 + e0, b1 + e1, top + PH, top + PH + .12, M.trim);
    });
    const nL = Math.round((a1 - a0) * B.r1 / 11) + 1;
    for (let i = 0; i < nL; i++) {
      const a = a0 + .03 + i * (a1 - a0 - .06) / (nL - 1), [x, z] = at(a, B.r1 - PW / 2);
      mesh(new THREE.BoxGeometry(.3, .6, .3), wash, x, top + PH + .42, z, H).rotation.y = -a;
      const gl = glowSprite(0xffd8a0, 1.1, .8); gl.material.fog = false; gl.position.set(x, top + PH + .82, z); H.add(gl);
      onDaylight(d => gl.material.opacity = .85 * (1 - d) + .05);
    }
    // the crowd's terraces: concrete steps cut into the slope from the field up to the upper terrace, each as high as a stair step,
    // so walkers climb them too; each step's top meets the slope at its back edge
    const ta0 = a0 + B.tierIn, ta1 = a1 - B.tierIn, tD = (rIn - up.r1) / B.tiers, tR = (up.y - lo.y) / B.tiers;
    const tierTop = i => lo.y + (i + 1) * tR + .02;
    const concrete = std({ color: 0xd6d0c4, roughness: .9 });
    for (let i = 0; i < B.tiers; i++) {
      const t = arcSlab(H, rIn - (i + 1) * tD, rIn - i * tD, ta0, ta1, lo.y - .3, tierTop(i), [concrete, wash]);
      t.castShadow = false; clickable(list, t, { tip: "The terraces over the fire balloon ground", toast: "Steps cut into the hill for the crowd to sit on and watch the fire balloons fill and go up. They climb all the way to the upper terrace." });
    }
    // the sign at the east end, facing the east stair's landing: Burmese over English on a lacquer board between white posts
    {
      const a = a0 + .035, [x, z] = at(a, 59), S = new THREE.Group(); S.position.set(x, top, z); S.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)); H.add(S);
      const face = shanBoardFace("မီးပုံးပျံပွဲကွင်း", "Fire Balloon Ground"), BW = 3.2, BH = BW * 300 / 1024;
      [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(.24, 2.6, .24), wash, sd * (BW / 2 + .1), 1.3, 0, S); mesh(new THREE.ConeGeometry(.16, .3, 8), M.gold, sd * (BW / 2 + .1), 2.75, 0, S); });
      clickable(list, mesh(new THREE.BoxGeometry(BW, BH, .08), [M.lacquer, M.lacquer, M.lacquer, M.lacquer, face, face], 0, 2.6 - BH / 2 - .1, 0, S), data);
    }
    // the launch pads: a ring of fire bricks round the fire pit, and a tall bamboo mast reaching an arm out over it
    const brick = std({ color: 0x6a3a28, roughness: 1 }), bamboo = std({ color: 0xb89a5a, roughness: .8 }), rope = std({ color: 0xd8c8a0, roughness: 1 });
    const flameM = new THREE.MeshBasicMaterial({ color: 0xff9a30, transparent: true, opacity: .85, depthWrite: false });
    const MAST = 18, ARM = 5.5;
    const pads = B.pads.map(([f, rr], k) => {
      const a = a0 + (a1 - a0) * f, [x, z] = at(a, rr), [mx, mz] = at(a, rr - ARM);   // the mast stands uphill of the pit
      mesh(new THREE.CylinderGeometry(1.3, 1.4, .45, 18, 1, true), brick, x, top + .22, z, H).material.side = THREE.DoubleSide;
      flat(mesh(new THREE.CircleGeometry(1.25, 18), std({ color: 0x2a1a12, roughness: 1 }), x, top + .02, z, H)).rotation.x = -Math.PI / 2;
      mesh(new THREE.CylinderGeometry(.12, .16, MAST, 8), bamboo, mx, top + MAST / 2, mz, H);
      const arm = mesh(new THREE.CylinderGeometry(.08, .08, ARM + .4, 6), bamboo, (x + mx) / 2, top + MAST - .3, (z + mz) / 2, H); arm.rotation.set(Math.PI / 2, 0, 0); arm.rotation.order = "YXZ"; arm.rotation.y = -a + Math.PI;
      const fire = mesh(new THREE.ConeGeometry(.55, 1.5, 10), flameM, x, top + .9, z, H); fire.castShadow = false;
      const glow = glowSprite(0xff8a30, 3.2, .8); glow.position.set(x, top + 1.2, z); H.add(glow);
      const cord = mesh(new THREE.CylinderGeometry(.025, .025, 1, 4), rope, x, 0, z, H); cord.castShadow = false;
      return { x, z, a, fire, glow, cord, k };
    });
    // the big balloons: great paper animals, as the Taunggyi teams send up, a rooster (painted on a round balloon), a fish, a parrot,
    // a bear and a tiger, the others each sewn on a skirt over a bamboo ring round the mouth with its burning wick; in world space so they can climb away over the town.
    // Each pad sends up a different animal each time round
    const sphG = new THREE.SphereGeometry(1, 18, 14), coneG = new THREE.ConeGeometry(1, 1, 12);
    const paper = (color, map) => std(map ? { color, map, roughness: .9 } : { color, roughness: .9 });
    const P_ = {
      black: paper(0x1a1410), white: paper(0xf4efe0), red: paper(0xd8282a), beak: paper(0xf08a1a),
      yellow: paper(0xf2c21c),
      fish: paper(0xffffff, canvasTex(256, (c, sz) => { c.fillStyle = "#f07a20"; c.fillRect(0, 0, sz, sz); c.strokeStyle = "rgba(150,40,10,.55)"; c.lineWidth = 3; for (let y = 0; y < 14; y++) for (let x = 0; x < 16; x++) { c.beginPath(); c.arc((x + (y % 2) * .5) * sz / 16, y * sz / 14 + 8, sz / 34, 0, Math.PI); c.stroke(); } })),
      belly: paper(0xf6e0b0), green: paper(0x2aa040), blue: paper(0x2050b8), ivory: paper(0xf0e0b0),
      brown: paper(0x7a4a28), tan: paper(0xd8b080),
      tiger: paper(0xffffff, canvasTex(256, (c, sz) => { c.fillStyle = "#ec8a22"; c.fillRect(0, 0, sz, sz); c.fillStyle = "#1a1410"; for (let i = 0; i < 18; i++) { const x = (i + .5) * sz / 18; c.beginPath(); c.moveTo(x - 4, sz * .12); for (let y = .12; y <= .88; y += .04) c.lineTo(x + Math.sin(y * 19 + i) * 5 - 2, y * sz); for (let y = .88; y >= .12; y -= .04) c.lineTo(x + Math.sin(y * 19 + i) * 5 + 3 - Math.abs(y - .5) * 6, y * sz); c.fill(); } })),
      pink: paper(0xc86070)
    };
    // an ellipsoid or a cone (tip along +y before turning) on an animal, sized by its three half-widths
    const blob = (A, m, x, y, z, sx, sy, sz, rx = 0, rz = 0) => { const o = mesh(sphG, m, x, y, z, A); o.scale.set(sx, sy, sz); o.rotation.set(rx, 0, rz); return o; };
    const cone = (A, m, x, y, z, r_, h, rx = 0) => { const o = mesh(coneG, m, x, y, z, A); o.scale.set(r_, h, r_); o.rotation.x = rx; return o; };
    const glowing = Object.values(P_);   // every paper, lit from inside after dark
    const skirt = (A, m, y1) => { const o = mesh(new THREE.CylinderGeometry(2.2, 1.0, y1, 16, 1, true), m, 0, y1 / 2, 0, A); o.material = m.clone(); o.material.side = THREE.DoubleSide; glowing.push(o.material); };
    const both = f => [-1, 1].forEach(f);
    const eyes = (A, x, y, z, w = .38) => both(sd => { blob(A, P_.white, sd * x, y, z, w, w, w); blob(A, P_.black, sd * (x + w * .45), y, z + w * .45, w * .55, w * .55, w * .55); });
    // the painted day balloons (as in the owner's photos of the rooster and the deva): a round envelope, narrow at the mouth, broad
    // above the middle and round over the crown, painted all over by hand in the bright Shan way: a red band round the mouth, a ring of
    // lotus petals over it, and pictures above. Its points are spaced evenly along the profile, so the paper's v runs by length up it
    // and pictures keep their shape; turned so the paper's middle (u = .5) faces front (+z)
    const DAY_ENV = new THREE.SplineCurve([[1.15, 0], [1.35, .9], [2.1, 2.1], [3.2, 3.4], [4.2, 4.8], [4.85, 6.4], [5.1, 8], [5, 9.6], [4.55, 11], [3.7, 12.3], [2.5, 13.2], [1.2, 13.75], [0, 13.9]].map(([x, y]) => new THREE.Vector2(x, y))).getSpacedPoints(40);
    const dayEnvG = new THREE.LatheGeometry(DAY_ENV, 32, -Math.PI);
    const dayR = y => { for (let i = 1; i < DAY_ENV.length; i++) if (y <= DAY_ENV[i].y) { const a = DAY_ENV[i - 1], b = DAY_ENV[i]; return a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y); } return 0; };
    const wideTex = (w, h, draw) => { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d"), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; };
    const dayPaper = draw => { const m = std({ color: 0xffffff, map: wideTex(2048, 1024, draw), roughness: .9 }); m.side = THREE.DoubleSide; glowing.push(m); return m; };
    const rowAt = (v, H) => (1 - v) * H;   // a height up the paper (v) to the canvas row
    // a ring of lotus petals from v0 out to v1 (pointing up, or down when v1 < v0), each in layers [colour, size], shifted half a petal by off
    const petals = (c, W, H, v0, v1, n, layers, off = 0) => { for (let i = 0; i < n; i++) layers.forEach(([col, k]) => {
      const cx = (i + .5 + off) * W / n, w = W / n * .55 * k, yb = rowAt(v0, H), yt = rowAt(v0 + (v1 - v0) * k, H), d = yb - yt;
      c.fillStyle = col; c.beginPath(); c.moveTo(cx - w, yb); c.bezierCurveTo(cx - w, yb - d * .55, cx - w * .3, yt + d * .15, cx, yt); c.bezierCurveTo(cx + w * .3, yt + d * .15, cx + w, yb - d * .55, cx + w, yb); c.closePath(); c.fill();
    }); };
    const curl = (c, x, y, r_, col, lw, dir = 1) => { c.strokeStyle = col; c.lineWidth = lw; c.lineCap = "round"; c.beginPath(); for (let k = 0; k <= 40; k++) { const a = k * .2, rr = r_ * (1 - k / 48); c.lineTo(x + dir * Math.cos(a) * rr, y + Math.sin(a) * rr); } c.stroke(); };
    const waves = (c, W, H, v0, v1) => {
      const y0 = rowAt(v1, H), y1 = rowAt(v0, H), ym = (y0 + y1) / 2; c.fillStyle = "#2a62b0"; c.fillRect(0, y0, W, y1 - y0);
      for (let x = 0; x < W; x += 112) { curl(c, x + 56, ym, (y1 - y0) * .38, "#f4f6ff", 7); curl(c, x, ym + (y1 - y0) * .25, (y1 - y0) * .2, "#8ac0f0", 5, -1); }
    };
    // a deva, seated with a lotus in one hand and the other raised (pose "seated"), or kneeling with her palms joined ("anjali"), in the
    // way of temple murals: a gold halo, a pointed crown, a jewelled collar and a patterned cloth; drawn in units of about a pixel
    function deva(c, x, y, s, pose, P) {
      const SK = "#f6d2a8", GD = "#e8b030", INK = "#3a2014";
      c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = c.lineJoin = "round";
      const el = (ex, ey, rx, ry, col, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(ex, ey, rx, ry, rot, 0, TAU); c.fill(); };
      const line = (pts, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.stroke(); };
      const poly = (pts, col) => { c.fillStyle = col; c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fill(); };
      [[-1, P.scarf], [1, P.scarf2]].forEach(([sd, col]) => { c.strokeStyle = col; c.lineWidth = 12; c.beginPath(); c.moveTo(sd * 40, -95); c.bezierCurveTo(sd * 130, -80, sd * 155, -10, sd * 122, 45); c.stroke(); });   // the flying scarf
      el(0, -150, 64, 64, "#d88a1a"); el(0, -150, 58, 58, "#f4c04a"); el(0, -150, 46, 46, "#fbe7a8");   // the halo
      const seat = pose === "seated" ? [[-34, -24], [34, -24], [92, 30], [104, 62], [-104, 62], [-92, 30]] : [[-32, -24], [32, -24], [60, 40], [66, 66], [-66, 66], [-60, 40]];
      poly(seat, P.cloth); c.save(); c.clip(); c.fillStyle = GD; for (let yy = -30; yy < 72; yy += 16) for (let xx = -112; xx < 112; xx += 16) c.fillRect(xx + ((yy + 30) / 16 % 2) * 8, yy, 4, 4); c.restore();   // the cloth, dotted in gold
      if (pose === "seated") { el(-58, 52, 20, 10, SK, .3); el(58, 52, 20, 10, SK, -.3); }   // the soles of the crossed feet
      poly([[-15, -24], [15, -24], [10, 58], [0, 78], [-10, 58]], P.panel); line([[-15, -24], [-10, 58], [0, 78], [10, 58], [15, -24]], GD, 3);   // the hanging front panel
      c.fillStyle = GD; c.fillRect(-36, -32, 72, 10);   // the belt
      poly([[-46, -104], [46, -104], [34, -26], [-34, -26]], SK); poly([[-41, -84], [41, -84], [37, -52], [-37, -52]], P.top);   // the body and breast cloth
      c.strokeStyle = GD; c.lineWidth = 11; c.beginPath(); c.ellipse(0, -104, 46, 24, 0, 0, Math.PI); c.stroke();   // the collar, set with red stones
      for (let k = 0; k <= 6; k++) { const a = k * Math.PI / 6; el(Math.cos(a) * 46, -104 + Math.sin(a) * 24, 3.5, 3.5, "#c82020"); }
      if (pose === "seated") {
        line([[-44, -98], [-84, -56], [-70, -120]], SK, 17); el(-70, -128, 10, 13, SK); line([[-74, -138], [-76, -150]], SK, 5); line([[-66, -138], [-62, -149]], SK, 5);   // the raised hand
        line([[44, -98], [86, -58], [96, -106]], SK, 17); el(96, -112, 10, 12, SK);
        line([[96, -112], [104, -150], [112, -174]], "#3a8a3a", 4);   // the lotus on its stem
        for (let k = -2; k <= 2; k++) el(112 + k * 7, -188, 7, 16, k % 2 ? "#f498b4" : "#e0507a", k * .35);
        el(-72, -112, 10, 5, GD); el(94, -98, 10, 5, GD); el(-64, -80, 9, 5, GD, -.7); el(64, -80, 9, 5, GD, .7);   // bracelets and armlets
      } else {
        line([[-44, -98], [-60, -56], [-6, -92]], SK, 16); line([[44, -98], [60, -56], [6, -92]], SK, 16); poly([[-9, -88], [9, -88], [0, -132]], SK);   // the palms joined
        el(-30, -76, 9, 5, GD, -.6); el(30, -76, 9, 5, GD, .6);
      }
      c.fillStyle = SK; c.fillRect(-10, -126, 20, 24); el(0, -150, 29, 35, SK);   // the neck and face
      c.fillStyle = "#2a1a14"; c.beginPath(); c.ellipse(0, -160, 31, 27, 0, Math.PI, TAU); c.fill();   // the hair
      poly([[-24, -178], [24, -178], [12, -202], [0, -238], [-12, -202]], GD); c.fillStyle = GD; c.fillRect(-29, -183, 58, 9); el(0, -191, 4, 5, "#c82020");   // the crown
      el(-30, -142, 5, 9, SK); el(30, -142, 5, 9, SK); el(-30, -127, 4.5, 4.5, GD); el(30, -127, 4.5, 4.5, GD);   // the ears and earrings
      [-1, 1].forEach(sd => {
        c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.arc(sd * 11, -149, 9, 1.15 * Math.PI, 1.85 * Math.PI); c.stroke();   // the brows
        c.beginPath(); c.moveTo(sd * 18, -142); c.quadraticCurveTo(sd * 11, -146, sd * 4, -142); c.stroke();   // the lowered eyes
      });
      line([[0, -140], [-2, -131], [2, -130]], INK, 1.8); el(0, -122, 6, 2.6, "#c8343a");
      c.restore();
    }
    // the deva balloon: a pink lotus crown, blue clouds, a deva seated on the waves with a lotus in her hand on the front and the back,
    // devas kneeling in homage on either side among green scrolls, then waves, the lotus petals and the red mouth
    const devaPaper = dayPaper((c, W, H) => {
      c.fillStyle = "#f6eedc"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#3a9a78"; c.fillRect(0, 0, W, rowAt(.86, H));
      petals(c, W, H, 1, .85, 24, [["#2a8a5a", 1]], .5); petals(c, W, H, 1, .84, 24, [["#d84a78", 1], ["#f498b4", .72], ["#fbe0e8", .38]]);
      for (let x = 0; x < W; x += 128) { curl(c, x + 64, rowAt(.8, H), 26, "#2a70c0", 8, 1); curl(c, x + 128, rowAt(.785, H), 16, "#7ab8e8", 6, -1); }
      for (let i = 0; i < 16; i++) { const x = (i + .5) * W / 16, up = i % 2; curl(c, x, rowAt(up ? .68 : .42, H), 40, "#3a9a50", 9, up ? 1 : -1); curl(c, x + 30, rowAt(up ? .52 : .6, H), 24, "#5ab0d8", 7, up ? -1 : 1); curl(c, x - 20, rowAt(.73, H), 22, "#2a70c0", 7, up ? 1 : -1); }
      const front = { top: "#2f9a4e", cloth: "#7a2a1a", panel: "#c8282a", scarf: "#d8402a", scarf2: "#2f9a4e" }, side = { top: "#c8282a", cloth: "#2f6a3a", panel: "#e8b030", scarf: "#2f9a4e", scarf2: "#e86a20" };
      const yS = rowAt(.33, H) - 78 * 1.5; [0, W / 2, W].forEach(x => deva(c, x, yS, 1.5, "seated", front));
      [W / 4, W * 3 / 4].forEach(x => deva(c, x, rowAt(.33, H) - 66 * 1.25, 1.25, "anjali", side));
      waves(c, W, H, .25, .33);
      petals(c, W, H, .07, .23, 16, [["#3a9a50", 1]], .5); petals(c, W, H, .07, .25, 16, [["#e85a8a", 1], ["#fbe8ee", .78], ["#d8282a", .55], ["#f2c21c", .3]]);
      c.fillStyle = "#d8301e"; c.fillRect(0, rowAt(.07, H), W, H); c.fillStyle = "#f2c21c"; c.fillRect(0, rowAt(.07, H) - 5, W, 6);
    });
    // the rooster balloon's body: scale feathers in rows of red, gold, green and blue, a great wing painted down each side sweeping back,
    // a white band of red heart-shaped flourishes, the lotus petals and the red mouth
    const SCALE_C = ["#d8282a", "#f2b81c", "#2a9a48", "#2a62b8", "#f07a20", "#e04a8a"];
    const scaleRows = (c, x0, x1, y0, y1, r_, step, base, k0 = 0) => { for (let y = y1, n = k0; y > y0 - r_; y -= step, n++) for (let x = x0 - (n % 2) * r_; x < x1 + r_; x += r_ * 2) {
      [[r_, SCALE_C[n % 6]], [r_ * .66, base], [r_ * .33, SCALE_C[(n + 2) % 6]]].forEach(([rr, col]) => { c.fillStyle = col; c.beginPath(); c.arc(x + r_, y, rr, 0, Math.PI); c.fill(); });
    } };
    const wing = (c, cx, cy, dir) => {   // its long feathers point back: -1 toward the paper's left edge, 1 toward its right
      c.save(); c.translate(cx, cy); c.scale(dir * 1.3, 1.6); c.lineJoin = "round";
      const FC = ["#2a9a48", "#d8282a", "#f2b81c", "#2a62b8", "#2a9a48", "#f07a20", "#d8282a"];
      for (let i = 6; i >= 0; i--) {
        const len = 330 - i * 14; c.save(); c.translate(40, 20 + i * 14); c.rotate(.08 + i * .07);
        c.fillStyle = FC[i]; c.strokeStyle = "#1a2a1a"; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -22); c.quadraticCurveTo(len * .7, -30, len, 0); c.quadraticCurveTo(len * .7, 26, 0, 22); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle = "#faf4e6"; c.lineWidth = 3; c.beginPath(); c.moveTo(10, 0); c.lineTo(len * .9, 0); c.stroke(); c.restore();
      }
      c.beginPath(); c.ellipse(20, -10, 190, 110, .12, 0, TAU); c.fillStyle = "#faf4e6"; c.fill();
      c.save(); c.clip(); scaleRows(c, -180, 220, -130, 110, 18, 22, "#faf4e6", 3); c.restore();
      c.beginPath(); c.ellipse(20, -10, 190, 110, .12, 0, TAU); c.strokeStyle = "#1a3a24"; c.lineWidth = 12; c.stroke(); c.restore();
    };
    const roosterPaper = dayPaper((c, W, H) => {
      c.fillStyle = "#faf4e6"; c.fillRect(0, 0, W, H);
      scaleRows(c, 0, W, 0, rowAt(.34, H), 40, 32, "#faf4e6");
      wing(c, W * .31, rowAt(.6, H), -1); wing(c, W * .69, rowAt(.6, H), 1);
      const b0 = rowAt(.34, H), b1 = rowAt(.24, H); c.fillStyle = "#faf4e6"; c.fillRect(0, b0, W, b1 - b0);
      for (let x = 64; x < W; x += 128) {   // the heart-shaped flourishes
        const yb = b1 - 12, yt = b0 + 14, ym = (yb + yt) / 2; c.strokeStyle = "#c82020"; c.lineWidth = 7;
        c.beginPath(); c.moveTo(x, yb); c.bezierCurveTo(x - 58, ym, x - 40, yt, x, ym - 8); c.bezierCurveTo(x + 40, yt, x + 58, ym, x, yb); c.stroke();
        c.fillStyle = "#e85a5a"; c.beginPath(); c.arc(x, ym + 6, 9, 0, TAU); c.fill(); curl(c, x + 64, ym, 12, "#c82020", 4);
      }
      [[b0, "#d8282a"], [b0 + 8, "#f2b81c"], [b1 - 10, "#f2b81c"], [b1 - 4, "#d8282a"]].forEach(([y, col]) => { c.fillStyle = col; c.fillRect(0, y - 4, W, 8); });
      petals(c, W, H, .06, .22, 16, [["#2a9a48", 1], ["#f2d040", .55]], .5); petals(c, W, H, .06, .24, 16, [["#2a9a48", 1], ["#d8282a", .8], ["#f2b81c", .55], ["#f07a20", .3]]);
      c.fillStyle = "#d8301e"; c.fillRect(0, rowAt(.06, H), W, H); c.fillStyle = "#f2c21c"; c.fillRect(0, rowAt(.06, H) - 5, W, 6);
    });
    // its head and neck in small scales under a white crown streaked green and red; its tail feathers striped lengthwise (on a flattened
    // ball the faces are u .5 and 0, the edges .25 and .75)
    const headPaper = std({ color: 0xffffff, roughness: .9, map: canvasTex(256, (c, sz) => {
      c.fillStyle = "#faf4e6"; c.fillRect(0, 0, sz, sz); scaleRows(c, 0, sz, sz * .45, sz, 8, 7, "#faf4e6");
      for (let i = 0; i < 8; i++) curl(c, (i + .5) * sz / 8, sz * .3, 10, i % 2 ? "#d8282a" : "#2a9a48", 3, i % 2 ? 1 : -1);
    }) }); glowing.push(headPaper);
    const featherPaper = cols => { const m = std({ color: 0xffffff, roughness: .9, map: canvasTex(128, (c, sz) => {
      for (let x = 0; x < sz; x++) { const u = (x + .5) / sz, d = Math.min(Math.abs(u - .5), u, 1 - u) / .25; c.fillStyle = d < .08 ? "#faf4e6" : d < .3 ? cols[0] : d < .6 ? cols[1] : d < .9 ? cols[2] : "#1a3a24"; c.fillRect(x, 0, 1, sz); }
      c.strokeStyle = "rgba(20,40,20,.35)"; c.lineWidth = 2; for (let y = 4; y < sz; y += 10) { c.beginPath(); c.moveTo(0, y); c.lineTo(sz / 4, y + 6); c.lineTo(sz / 2, y); c.lineTo(sz * 3 / 4, y + 6); c.lineTo(sz, y); c.stroke(); }
    }) }); glowing.push(m); return m; };
    const featherA = featherPaper(["#d8282a", "#f2b81c", "#2a9a48"]), featherB = featherPaper(["#2a9a48", "#f2b81c", "#d8282a"]);
    // the paper things hung round a day balloon (diamonds, tassels, tubes, flame lanterns), merged into one mesh of flat colours
    const ornM = std({ vertexColors: true, roughness: .85, side: THREE.DoubleSide });
    const GOLD_H = 0xe8b030, CORD_H = 0xd8c8a0;
    const cordP = (x, y0, y1, z) => [[new THREE.BoxGeometry(.03, y0 - y1, .03), CORD_H, x, (y0 + y1) / 2, z]];
    const diamondP = (x, y, z, th, sz, col) => [[new THREE.BoxGeometry(sz, sz, .04).rotateZ(Math.PI / 4).rotateY(th), GOLD_H, x, y, z], [new THREE.BoxGeometry(sz * .7, sz * .7, .07).rotateZ(Math.PI / 4).rotateY(th), col, x, y, z]];
    const tasselP = (x, y, z, col) => [[new THREE.ConeGeometry(.09, .18, 6), GOLD_H, x, y, z], [new THREE.CylinderGeometry(.08, .15, .6, 6), col, x, y - .38, z]];
    const tubeP = (x, y, z, col, len) => [[new THREE.ConeGeometry(.17, .25, 8), GOLD_H, x, y, z], [new THREE.CylinderGeometry(.13, .13, len, 8), col, x, y - .12 - len / 2, z], [new THREE.CylinderGeometry(.13, .06, .3, 8), GOLD_H, x, y - .27 - len, z]];
    const flameP = (x, y, z, col) => [[new THREE.ConeGeometry(.26, .8, 8).rotateX(Math.PI), col, x, y, z], [new THREE.ConeGeometry(.26, .4, 8), 0xf2b81c, x, y + .6, z]];
    const hang = (A, parts) => { const o = mesh(lowPoly(parts), ornM, 0, 0, 0, A); o.castShadow = false; };
    const around = (n, rr, y, f) => { const out = []; for (let k = 0; k < n; k++) { const th = (k + .5) * TAU / n; out.push(...f(rr * Math.sin(th), y, rr * Math.cos(th), th, k)); } return out; };
    const HANG_C = [0xd8282a, 0xf2b81c, 0x2a9a48, 0xe04a8a, 0x6a3a9a];
    // each faces +z, its mouth at y = 0; h: where the mast's cord holds its top
    const ANIMALS = {
      rooster: { my: "ကြက်ဖ", en: "rooster", h: 12, make(A) {   // the round body painted as the rooster, its head, comb and tail built out
        mesh(dayEnvG, roosterPaper, 0, 0, 0, A).scale.set(.9, .86, .9);
        blob(A, headPaper, 0, 10.6, 2.1, 2.0, 2.6, 2.0, .3); blob(A, headPaper, 0, 12.7, 2.5, 1.8, 1.9, 2.0);   // the neck and head
        cone(A, P_.beak, 0, 12.5, 4.65, .55, 1.0, Math.PI / 2);
        [[14.5, 1.6], [14.9, 2.4], [14.6, 3.2]].forEach(([y, z]) => blob(A, P_.red, 0, y, z, .35, .8, .55));   // the comb
        blob(A, P_.red, 0, 11.4, 4.0, .4, .8, .45);   // the wattle
        both(sd => { blob(A, P_.green, sd * 1.55, 13.0, 3.2, .16, .6, .65); blob(A, P_.white, sd * 1.62, 13.02, 3.25, .16, .44, .5); blob(A, P_.black, sd * 1.69, 13.04, 3.35, .14, .22, .22); });
        for (let i = 0; i < 7; i++) {   // the tail feathers, fanned from straight up to back
          const rx = -.25 - i * .25, L = 3 - i * .12;
          blob(A, i % 2 ? featherB : featherA, i % 2 ? .12 : -.12, 8.4 + Math.cos(rx) * L * .85, -3.2 + Math.sin(rx) * L * .85, .22, L, .8, rx);
        }
        // long paper tubes round its middle, flame lanterns round the mouth, and two diamonds hung from the beak
        hang(A, [...around(10, .9 * dayR(3.4 / .86) + .05, 3.4, (x, y, z, th, k) => [...cordP(x, y, y - .5, z), ...tubeP(x, y - .5, z, HANG_C[k % 5], 1.4)]),
                 ...around(8, .9 * dayR(1.4 / .86) + .05, 1.4, (x, y, z, th, k) => [...cordP(x, y, y - .3, z), ...flameP(x, y - .7, z, k % 2 ? 0xd8282a : 0xf07a20)]),
                 ...cordP(0, 11.9, 11.2, 4.4), ...diamondP(0, 10.8, 4.4, 0, .7, 0xd8282a), ...cordP(0, 10.4, 10.1, 4.4), ...diamondP(0, 9.8, 4.4, 0, .55, 0x2a62b8), ...tasselP(0, 9.4, 4.4, 0xd8282a)]);
      } },
      fish: { my: "ငါး", en: "fish", h: 10.4, make(A) {
        skirt(A, P_.belly, 3.2);
        blob(A, P_.fish, 0, 6.5, 0, 2.8, 3.6, 6.2); blob(A, P_.belly, 0, 5.4, .5, 2.5, 2.4, 5);
        both(sd => { blob(A, P_.red, 0, 6.5 + sd * 1.6, -7.0, .35, 2.4, 1.4, -sd * .7); blob(A, P_.red, sd * 2.7, 5.6, 2, .25, 1.0, 1.8, 0, -sd * .5); });   // the forked tail; the side fins
        blob(A, P_.red, 0, 10, -.8, .3, 1.6, 2.8, -.3);   // the back fin
        eyes(A, 2.2, 7.6, 3.9, .7);
        mesh(new THREE.TorusGeometry(.8, .25, 8, 18), P_.red, 0, 6.6, 6.1, A);   // the lips
      } },
      parrot: { my: "ကြက်တူရွေး", en: "parrot", h: 12.6, make(A) {
        skirt(A, P_.green, 2.2);
        blob(A, P_.green, 0, 6, 0, 3.2, 4.4, 3.4); blob(A, P_.red, 0, 10.6, .8, 2.3, 2.3, 2.3);   // the green body, the red head
        blob(A, P_.ivory, 0, 10.2, 3.0, .8, 1.1, 1.0); cone(A, P_.black, 0, 9.3, 3.5, .45, .9, Math.PI);   // the hooked beak
        eyes(A, 1.6, 11, 1.8, .5);
        both(sd => { blob(A, P_.blue, sd * 3.0, 6.6, -.6, .9, 3.8, 2.4, 0, -sd * .12); blob(A, P_.yellow, sd * 3.25, 7.8, -.2, .7, 1.0, 1.8); });
        both(sd => blob(A, sd < 0 ? P_.red : P_.blue, sd * .5, 2.4, -3.6, .5, 4.2, 1.0, .35));   // the long tail feathers hanging down
      } },
      bear: { my: "ဝက်ဝံ", en: "bear", h: 12.6, make(A) {
        skirt(A, P_.brown, 2.0);
        blob(A, P_.brown, 0, 5.8, 0, 4, 4.2, 3.8); blob(A, P_.tan, 0, 5.6, 2.4, 2.8, 3.0, 1.8);   // the body and its pale belly
        blob(A, P_.brown, 0, 10.6, .6, 2.7, 2.7, 2.7);
        both(sd => { blob(A, P_.brown, sd * 1.9, 12.7, .2, .8, .8, .5); blob(A, P_.tan, sd * 1.9, 12.7, .55, .45, .45, .3); });   // the ears
        blob(A, P_.tan, 0, 10.1, 2.9, 1.2, .9, .9); blob(A, P_.black, 0, 10.4, 3.75, .45, .32, .3);   // the muzzle and nose
        both(sd => blob(A, P_.black, sd * 1.0, 11.4, 2.35, .3, .3, .3));
        both(sd => { blob(A, P_.brown, sd * 3.3, 7, 1.4, 1.1, 2.4, 1.1, -.5, sd * .4); blob(A, P_.brown, sd * 2, 2.6, 1.6, 1.3, 1.6, 1.6); });   // arms and legs
      } },
      tiger: { my: "ကျား", en: "tiger", h: 9.6, make(A) {
        skirt(A, P_.white, 2.6);
        blob(A, P_.tiger, 0, 6, -.5, 3.4, 3.6, 5.4); blob(A, P_.tiger, 0, 9, 4.4, 2.6, 2.4, 2.4);   // the striped body and head
        blob(A, P_.white, 0, 8.3, 6.4, 1.3, .9, .8); blob(A, P_.pink, 0, 8.8, 7.05, .3, .25, .25);   // the muzzle and nose
        both(sd => { blob(A, P_.white, sd * 1.6, 8.2, 5.6, 1, .9, .8); blob(A, P_.tiger, sd * 1.7, 11.1, 4.0, .7, .8, .4); blob(A, P_.white, sd * 1.7, 11.05, 4.3, .4, .5, .2); });
        eyes(A, .95, 9.8, 6.5, .35);
        both(sd => both(fb => blob(A, P_.tiger, sd * 2, 2.8, fb * 2.8 - .5, 1.1, 2.0, 1.1)));   // the four legs
        for (let i = 0; i <= 6; i++) { const s = i / 6; blob(A, i === 6 ? P_.black : P_.tiger, 0, 6.5 + 4 * s, -5.8 - 1.6 * Math.sin(s * Math.PI), .55, .55, .55); }   // the tail curling up
      } }
    };
    const KINDS = Object.keys(ANIMALS);
    // the night balloons, as the Taunggyi teams send up after dark: a tall pear of paper, narrow at the mouth and broad under the crown,
    // either painted all over in bright panels and lit from inside by the fire, or of plain paper hung with hundreds of little candle
    // lanterns set out in flowers, with a picture in lanterns (here a stupa) hanging on a line below it; the flower-painted one carries a
    // rack of fireworks under its mouth (စိန်နားပန်, "diamond earrings") that throws out sparks over the crowd as it climbs
    const ENV = [[1.0, 0], [1.6, 1.5], [2.6, 3.5], [3.6, 6], [4.3, 8.5], [4.6, 10.5], [4.3, 12.3], [3.4, 13.6], [2, 14.4], [0, 14.7]];
    const envG = new THREE.LatheGeometry(ENV.map(([x, y]) => new THREE.Vector2(x, y)), 28);   // its v runs by profile point: .11 a point
    const envR = y => { for (let i = 1; i < ENV.length; i++) if (y <= ENV[i][1]) { const [r0, y0] = ENV[i - 1], [r1, y1] = ENV[i]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 0; };
    const bandY = (v, sz) => (1 - v) * sz;   // a height up the envelope (v) to the canvas row (the crown at the top)
    const paintedPaper = draw => { const m = std({ color: 0xffffff, map: canvasTex(512, draw), roughness: .9 }); m.side = THREE.DoubleSide; glowing.push(m); return m; };
    const scallops = (c, sz, v, h, fill) => { c.fillStyle = fill; for (let x = 0; x < sz; x += sz / 24) { c.beginPath(); c.arc(x + sz / 48, bandY(v, sz), h, 0, Math.PI); c.fill(); } };
    // painted with dancers in crowns between red pillars, over bands of green, red and gold (as in the owner's first photo)
    const dancersPaper = paintedPaper((c, sz) => {
      c.fillStyle = "#f0b030"; c.fillRect(0, 0, sz, sz);
      c.fillStyle = "#e86a20"; c.fillRect(0, 0, sz, bandY(.84, sz));
      c.fillStyle = "#c8282a"; for (let i = 0; i < 16; i++) c.fillRect(i * sz / 16, 0, sz / 40, bandY(.84, sz));
      c.fillStyle = "#c8282a"; c.fillRect(0, bandY(.84, sz), sz, bandY(.78, sz) - bandY(.84, sz)); scallops(c, sz, .78, 9, "#c8282a");
      const y1 = bandY(.76, sz), y2 = bandY(.42, sz);
      for (let i = 0; i < 6; i++) {
        const cx = (i + .5) * sz / 6, robe = i % 2 ? "#2a8a40" : "#c8282a";
        c.fillStyle = "#a01a1a"; c.fillRect(i * sz / 6 - 4, y1, 8, y2 - y1);   // the red pillars between the panels
        c.fillStyle = robe; c.beginPath(); c.moveTo(cx - 8, y1 + 48); c.lineTo(cx + 8, y1 + 48); c.lineTo(cx + 26, y2 - 10); c.lineTo(cx - 26, y2 - 10); c.fill();
        c.strokeStyle = robe; c.lineWidth = 6; c.beginPath(); c.moveTo(cx - 30, y1 + 30); c.lineTo(cx - 8, y1 + 55); c.lineTo(cx + 8, y1 + 55); c.lineTo(cx + 30, y1 + 80); c.stroke();
        c.fillStyle = "#f0c890"; c.beginPath(); c.arc(cx, y1 + 38, 10, 0, TAU); c.fill();
        c.fillStyle = "#ffe060"; c.beginPath(); c.moveTo(cx - 8, y1 + 30); c.lineTo(cx, y1 + 8); c.lineTo(cx + 8, y1 + 30); c.fill();
        c.fillStyle = "#ffffff"; c.fillRect(cx - 14, y1 + 100, 28, 6);
      }
      c.fillStyle = "#2a8a40"; c.fillRect(0, bandY(.42, sz), sz, bandY(.35, sz) - bandY(.42, sz));
      c.strokeStyle = "#ffe060"; c.lineWidth = 4; c.beginPath(); for (let x = 0; x <= sz; x += 16) c.lineTo(x, bandY(x % 32 ? .36 : .41, sz)); c.stroke();
      ["#c8282a", "#f4e8c8", "#e04a8a", "#2a8a40", "#f0b030", "#c8282a"].forEach((col, i) => { c.fillStyle = col; c.fillRect(0, bandY(.35 - i * .058, sz), sz, sz * .058 + 1); });
    });
    // painted with big flowers on blue under a pink crown, over pink and green chevrons (as in the owner's third photo)
    const flowersPaper = paintedPaper((c, sz) => {
      c.fillStyle = "#f06aa0"; c.fillRect(0, 0, sz, bandY(.82, sz)); c.fillStyle = "#ffffff";
      for (let y = 10; y < bandY(.82, sz); y += 16) for (let x = (y % 32) / 2; x < sz; x += 16) { c.beginPath(); c.arc(x, y, 3, 0, TAU); c.fill(); }
      c.fillStyle = "#f8f0e0"; c.fillRect(0, bandY(.82, sz), sz, bandY(.76, sz) - bandY(.82, sz)); scallops(c, sz, .82, 10, "#f07a20");
      c.fillStyle = "#3aa0e0"; c.fillRect(0, bandY(.76, sz), sz, bandY(.46, sz) - bandY(.76, sz));
      const flower = (x, y, rr, petal, heart) => {
        c.fillStyle = "#2a9a40"; [-1, 1].forEach(sd => { c.beginPath(); c.ellipse(x + sd * rr * 1.1, y + rr * .7, rr * .7, rr * .3, sd * .5, 0, TAU); c.fill(); });
        c.fillStyle = petal; for (let k = 0; k < 8; k++) { const a = k * TAU / 8; c.beginPath(); c.ellipse(x + Math.cos(a) * rr * .6, y + Math.sin(a) * rr * .6, rr * .45, rr * .25, a, 0, TAU); c.fill(); }
        c.fillStyle = heart; c.beginPath(); c.arc(x, y, rr * .35, 0, TAU); c.fill();
      };
      for (let i = 0; i < 5; i++) { flower((i + .25) * sz / 5, bandY(.68, sz), 26, ["#ffd020", "#e8282a", "#f07a20"][i % 3], "#c81a50"); flower((i + .75) * sz / 5, bandY(.54, sz), 22, ["#e8282a", "#ffd020", "#ffffff"][i % 3], "#f07a20"); }
      c.fillStyle = "#c8282a"; c.fillRect(0, bandY(.46, sz), sz, bandY(.39, sz) - bandY(.46, sz)); c.fillStyle = "#ffd020";
      for (let x = 0; x < sz; x += 32) { const y = bandY(.425, sz); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 16, y - 12); c.lineTo(x + 32, y); c.lineTo(x + 16, y + 12); c.fill(); }
      ["#e04a8a", "#2aa060", "#f4f0e0"].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 14; for (let row = i; row < 7; row += 3) { c.beginPath(); for (let x = 0; x <= sz; x += 24) c.lineTo(x, bandY(.36 - row * .05, sz) + (x % 48 ? 10 : -4)); c.stroke(); } });
    });
    // the lantern balloon's own paper, plain and dim so its lanterns stand out (as in the owner's second photo)
    const lampPaper = std({ color: 0x3a332c, roughness: 1 }); lampPaper.side = THREE.DoubleSide; glowing.push(lampPaper);
    // the little candle lanterns: flowers of them round the paper, dotted rings between, and the stupa hung below, drawn on a small
    // canvas and taken as one lantern every other pixel (a pixel is 10 cm)
    const lampM = new THREE.PointsMaterial({ size: .85, map: glowTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const pointsGeo = (pos, col) => { const G_ = new THREE.BufferGeometry(); G_.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); G_.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); return G_; };
    const WARM = [1, .62, .25], GOLD = [1, .8, .4], ROSE = [1, .42, .28];
    const envLamps = (() => {
      const pos = [], col = [], on = (th, y, cl) => { const rr = envR(y) + .12; pos.push(rr * Math.sin(th), y, rr * Math.cos(th)); col.push(...cl); };
      [[5.2, 7, 0], [8.6, 8, .5], [11.8, 6, 0]].forEach(([y, n, off]) => { for (let f = 0; f < n; f++) {
        const th0 = (f + off) * TAU / n, r0 = envR(y); on(th0, y, GOLD);
        for (let k = 0; k < 8; k++) { const a = k * TAU / 8; [.45, .8, 1.15].forEach(ro => on(th0 + ro * Math.cos(a) / r0, y + ro * Math.sin(a), ro > 1 ? ROSE : WARM)); }
      } });
      [1.2, 2.7, 10.2, 13.9].forEach(y => { const n = Math.round(TAU * envR(y) / .6); for (let k = 0; k < n; k++) on(k * TAU / n, y, GOLD); });
      return pointsGeo(pos, col);
    })();
    const stupaLamps = (() => {
      const cv = document.createElement("canvas"); cv.width = 60; cv.height = 80; const c = cv.getContext("2d");
      c.strokeStyle = "#fff"; c.lineWidth = 2.4;
      c.strokeRect(6, 70, 48, 8); c.strokeRect(11, 62, 38, 8); c.strokeRect(16, 55, 28, 7);   // the three terraces
      c.beginPath(); c.moveTo(16, 55); c.quadraticCurveTo(17, 36, 30, 31); c.quadraticCurveTo(43, 36, 44, 55); c.stroke();   // the bell
      c.beginPath(); c.moveTo(25, 31); c.lineTo(28, 12); c.moveTo(35, 31); c.lineTo(32, 12); c.moveTo(26, 25); c.lineTo(34, 25); c.moveTo(27, 18); c.lineTo(33, 18); c.stroke();   // the banded spire
      c.beginPath(); c.moveTo(22, 12); c.lineTo(38, 12); c.lineTo(30, 4); c.closePath(); c.moveTo(30, 4); c.lineTo(30, 0); c.stroke();   // the hti and its vane
      const px = c.getImageData(0, 0, 60, 80).data, pos = [], col = [];
      for (let y = 0; y < 80; y += 2) for (let x = 0; x < 60; x += 2) if (px[(y * 60 + x) * 4 + 3] > 100) { pos.push((x - 30) * .1, -y * .1, 0); col.push(...(y < 13 ? GOLD : y > 54 ? ROSE : WARM)); }
      return pointsGeo(pos, col);
    })();
    const NIGHT_DEFS = [
      { key: "lamps", h: 14.7, panel: true, tip: "A lantern balloon · ညမီးပုံးပျံ", make(A) {
        mesh(envG, lampPaper, 0, 0, 0, A);
        const pts = new THREE.Points(envLamps, lampM); pts.frustumCulled = false; A.add(pts);
        const P = new THREE.Group(); P.position.y = -3.5; P.visible = false; A.add(P);   // the stupa in lanterns, unrolled as it is lifted
        const sp = new THREE.Points(stupaLamps, lampM); sp.frustumCulled = false; P.add(sp);
        const ln = mesh(new THREE.CylinderGeometry(.02, .02, 3.5, 4), rope, 0, -1.75, 0, A); ln.castShadow = false;
        return P;
      } },
      { key: "dancers", h: 14.7, tip: "A painted night balloon · ညမီးပုံးပျံ", make(A) { mesh(envG, dancersPaper, 0, 0, 0, A); } },
      { key: "fireworks", h: 14.7, fireworks: true, tip: "A fireworks balloon · စိန်နားပန် မီးပုံးပျံ", make(A) {
        mesh(envG, flowersPaper, 0, 0, 0, A);
        mesh(new THREE.CylinderGeometry(.02, .02, 2.6, 4), rope, 0, -1.3, 0, A).castShadow = false;
        mesh(new THREE.BoxGeometry(.9, .5, .9), bamboo, 0, -2.85, 0, A);   // the rack of fireworks
      } }
    ];
    // the deva balloon, hung round its middle with diamonds and tassels and round its mouth with little box lanterns
    const DAY_DEFS = [
      { key: "deva", h: 13.9, tip: "A balloon painted with a deva · နတ်သမီးပုံ မီးပုံးပျံ", make(A) {
        mesh(dayEnvG, devaPaper, 0, 0, 0, A);
        hang(A, [...around(8, dayR(4.6) + .05, 4.6, (x, y, z, th, k) => [...cordP(x, y, y - 1, z), ...diamondP(x, y - 1.35, z, th, .7, k % 2 ? 0x6a3a9a : 0xd8282a), ...cordP(x, y - 1.7, y - 2.1, z), ...tasselP(x, y - 2.1, z, HANG_C[k % 5])]),
                 ...around(4, dayR(1.2) + .05, 1.2, (x, y, z, th, k) => [...cordP(x, y, y - 1.2, z), [new THREE.BoxGeometry(.3, .5, .3).rotateY(th), 0xf2c21c, x, y - 1.45, z], [new THREE.ConeGeometry(.24, .2, 4).rotateY(th + Math.PI / 4), 0xd8282a, x, y - 1.1, z], ...tasselP(x, y - 1.7, z, 0xd8282a)])]);
      } }
    ];
    const DEFS = KINDS.map(name => ({ ...ANIMALS[name], key: name, tip: `A ${ANIMALS[name].en} balloon · ${ANIMALS[name].my}ပုံ မီးပုံးပျံ` })).concat(DAY_DEFS, NIGHT_DEFS);
    // by day the painted rooster and the deva balloon go up most often, the other animals in between
    const DAY_SET = ["rooster", "deva", "fish", "deva", "parrot", "rooster", "bear", "deva", "tiger"].map(k => DEFS.findIndex(Z => Z.key === k)), NIGHT_SET = NIGHT_DEFS.map(Z => DEFS.indexOf(Z));
    // the fireworks' sparks: one cloud of points shared by every rack, each spark thrown out and falling as it burns out
    const SN = 900, spPos = new Float32Array(SN * 3), spCol = new Float32Array(SN * 3), spV = new Float32Array(SN * 3), spAge = new Float32Array(SN), spLife = new Float32Array(SN), spBase = new Float32Array(SN * 3);
    const spGeo = new THREE.BufferGeometry(); spGeo.setAttribute("position", new THREE.BufferAttribute(spPos, 3)); spGeo.setAttribute("color", new THREE.BufferAttribute(spCol, 3));
    const sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({ size: 1.2, map: glowTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    sparks.frustumCulled = false; sparks.userData.noCull = true; sparks.visible = false; g.add(sparks);
    const SPARK_C = [[.7, .85, 1], [.5, .65, 1], [1, .85, .5], [1, 1, 1]];
    let spNext = 0, spOn = false;
    const spark = (x, y, z) => {
      const i = spNext, th = r() * TAU, sp = 8 + r() * 12, cl = SPARK_C[(r() * 4) | 0]; spNext = (spNext + 1) % SN;
      spPos[i * 3] = x; spPos[i * 3 + 1] = y; spPos[i * 3 + 2] = z; spV[i * 3] = Math.cos(th) * sp; spV[i * 3 + 1] = -2 + r() * 8; spV[i * 3 + 2] = Math.sin(th) * sp;
      spAge[i] = 0; spLife[i] = 1.2 + r() * 1.3; spBase[i * 3] = cl[0]; spBase[i * 3 + 1] = cl[1]; spBase[i * 3 + 2] = cl[2]; spOn = true;
    };
    // after dark the wick's fire shines through the paper: each glows in its own colour (the patterned ones through their pattern)
    glowing.forEach(m => { m.emissive.copy(m.color); if (m.map) m.emissiveMap = m.map; });
    onDaylight(d => glowing.forEach(m => m.emissiveIntensity = .6 * (1 - d)));
    H.updateMatrixWorld(true);
    const hillC = H.localToWorld(V(0, 0, 0));
    const balloons = pads.map((p, k) => {
      const G = new THREE.Group(); G.userData.noCull = true; g.add(G);
      const ring = mesh(new THREE.TorusGeometry(1.0, .05, 6, 20), bamboo, 0, 0, 0, G); ring.rotation.x = Math.PI / 2;
      const wick = glowSprite(0xffa040, 1.6, .9); wick.position.y = -.2; G.add(wick);
      const parts = [], shapes = DEFS.map((Z, i) => {
        const A = new THREE.Group(); A.visible = false; G.add(A); parts[i] = Z.make(A);
        A.traverse(o => { if (o.isMesh) clickable(list, o, { tip: Z.tip, toast: data.toast }); });
        return A;
      });
      const w = H.localToWorld(V(p.x, top, p.z));
      return { p, G, ring, wick, shapes, parts, kind: -1, cyc: -1, mode: null, spAcc: 0, face: Math.atan2(hillC.x - w.x, hillC.z - w.z), wx: w.x, wz: w.z, off: k * (B.fill + B.hold + B.rise + B.gone) / pads.length + r() * 8 };
    });
    // the night lanterns: small paper lanterns (a cylinder of paper on a wire ring, a wax wick burning in the mouth) that the crowd
    // lights and lets go all over the field, one after another, drifting up over the town in a slow river of light. One instanced
    // mesh for the paper and one cloud of points for the glow round each
    const LN = B.lanN, LP = B.lanP, LH = B.lanHold, lanG = new THREE.LatheGeometry([[.3, 0], [.34, .3], [.4, .75], [.44, 1.05], [.4, 1.2], [.2, 1.28], [0, 1.3]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
    const lanTex = canvasTex(64, (c, sz) => { const gr = c.createLinearGradient(0, sz, 0, 0); gr.addColorStop(0, "#ffd890"); gr.addColorStop(.35, "#ff9a30"); gr.addColorStop(1, "#b8481a"); c.fillStyle = gr; c.fillRect(0, 0, sz, sz); });
    const lanM = new THREE.MeshBasicMaterial({ map: lanTex, side: THREE.DoubleSide, fog: false });
    const lanI = new THREE.InstancedMesh(lanG, lanM, LN); lanI.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    lanI.frustumCulled = false; lanI.castShadow = false; lanI.userData.noCull = true; g.add(lanI);
    clickable(list, lanI, { tip: "A paper sky lantern · မီးပုံးငယ်", toast: "After dark the crowd on the fire balloon ground lights small paper lanterns, a ring of wire at the mouth with a wick of wax burning in it, holds each until the hot air lifts it, and lets it go. Hundreds drift up over the town in a slow river of light, carrying the wishes and merit of the people who let them go." });
    const lanPos = new Float32Array(LN * 3), lanCol = new Float32Array(LN * 3), lanGeo = new THREE.BufferGeometry();
    lanGeo.setAttribute("position", new THREE.BufferAttribute(lanPos, 3)); lanGeo.setAttribute("color", new THREE.BufferAttribute(lanCol, 3));
    const lanGlow = new THREE.Points(lanGeo, new THREE.PointsMaterial({ size: 3.4, map: glowTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    lanGlow.frustumCulled = false; lanGlow.userData.noCull = true; g.add(lanGlow);
    const lans = [], launchers = [];   // launchers: the people who let them go, filled in with the crowd below
    const _lm = new THREE.Matrix4(), _lq = new THREE.Quaternion(), _ls = new THREE.Vector3(), _lp = new THREE.Vector3(), _le = new THREE.Euler(), _zero = new THREE.Matrix4().makeScale(0, 0, 0);
    // the crowd: people sitting on the terraces to watch, more standing along the foot of the field, and a team of six round each
    // fire pit holding the balloon's mouth over the fire. Blocky low-poly figures as at the festival stage, in warm jackets for the
    // cold Tazaungmon nights; a few kinds of each, drawn as one instanced mesh per kind. Out whenever the balloons go up (not in the rain)
    const tierR = i => rIn - (i + .5) * tD;
    const crowd = (() => {
      const q = rng(5152), pk = l => l[(q() * l.length) | 0], box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n = 7) => new THREE.CylinderGeometry(a, b, h, n);
      const SKIN = [0xe8b890, 0xd8a47a, 0xc89068, 0xf0c4a0], HAIR = 0x221a16, INK = 0x2a1c18;
      const JACKET = [0x2f4a3a, 0x2a3450, 0x6a2a2e, 0x5a4232, 0x4a4a50, 0xd8ccb4, 0x7a6a4a, 0x3a5a6a, 0xd83a3a, 0xf2c230], LOWER = [0x23232b, 0x2e3446, 0x4a3a2c];
      const LONGYI = [0x8a2a3a, 0xd8483a, 0x2a2e48, 0x6a2a5a, 0x2f5a3a], TOWEL = [0xe88aa0, 0xe8903a, 0xf0ece0, 0xd84a4a];
      const head = (y, skin, woman) => {   // a head with a face; a woman's hair down or wrapped in a towel turban
        const p = [[box(.25, .27, .24), skin, 0, y, 0], [box(.035, .045, .012), INK, -.055, y + .015, .122], [box(.035, .045, .012), INK, .055, y + .015, .122],
                   [box(.07, .014, .01), 0x8a3a30, 0, y - .055, .122], [box(.27, woman ? .24 : .17, .07), HAIR, 0, y + (woman ? .035 : .065), -.1]];
        if (woman && q() < .5) p.push([box(.29, .12, .28), pk(TOWEL), 0, y + .165, 0]);
        else p.push([box(.27, .07, .26), HAIR, 0, y + .15, -.005]);
        return p;
      };
      // sitting cross-legged on a step, hands in the lap; standing, arms down (a team member's arms held up to the balloon's mouth)
      const sitter = (skin, top, lower, woman) => [
        [box(.24, .11, .38), lower, -.11, .06, .09], [box(.24, .11, .38), lower, .11, .06, .09], [box(.56, .1, .13), lower, 0, .07, .27],
        [cyl(.16, .18, .44), top, 0, .34, 0], [box(.09, .34, .1), top, -.22, .36, .05], [box(.09, .34, .1), top, .22, .36, .05], [box(.26, .08, .09), skin, 0, .22, .19],
        [cyl(.05, .05, .07, 6), skin, 0, .6, 0], ...head(.75, skin, woman)
      ];
      const stander = (skin, top, lower, woman, up) => [
        ...(woman ? [[cyl(.16, .18, .78), lower, 0, .39, 0]] : [[box(.12, .78, .12), lower, -.08, .39, 0], [box(.12, .78, .12), lower, .08, .39, 0]]),
        [box(.13, .04, .22), 0x3a2e28, -.08, .02, .04], [box(.13, .04, .22), 0x3a2e28, .08, .02, .04],
        [cyl(.165, .175, .5), top, 0, 1.02, 0],
        ...(up ? [[box(.09, .46, .095), top, -.2, 1.45, .05], [box(.09, .46, .095), top, .2, 1.45, .05], [box(.07, .08, .08), skin, -.2, 1.72, .05], [box(.07, .08, .08), skin, .2, 1.72, .05]]
          : [[box(.09, .46, .095), top, -.2, 1.01, 0], [box(.09, .46, .095), top, .2, 1.01, 0], [box(.07, .08, .08), skin, -.2, .74, 0], [box(.07, .08, .08), skin, .2, .74, 0]]),
        [cyl(.05, .05, .07, 6), skin, 0, 1.3, 0], ...head(1.45, skin, woman)
      ];
      const kinds = [];   // [make, matrices]
      const kind = make => { const k = { geo: null, make, at: [] }; kinds.push(k); return k; };
      const person = sit => { const woman = q() < .5, skin = pk(SKIN), top = pk(JACKET), lower = woman ? pk(LONGYI) : pk(LOWER); return sit ? sitter(skin, top, lower, woman) : stander(skin, top, lower, woman, false); };
      const SITS = Array.from({ length: 6 }, () => kind(() => person(true))), STANDS = Array.from({ length: 6 }, () => kind(() => person(false)));
      const TEAM = Array.from({ length: 3 }, () => kind(() => { const skin = pk(SKIN); return stander(skin, pk(JACKET), pk(LOWER), false, true); }));
      const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _y = new THREE.Vector3(0, 1, 0);
      const put = (k, x, y, z, ry, sc) => k.at.push(_m.compose(_p.set(x, y, z), _q.setFromAxisAngle(_y, ry), _s.setScalar(sc)).clone());
      const nearPad = (x, z, d) => pads.some(p => Math.hypot(x - p.x, z - p.z) < d) || pads.some(p => { const [mx, mz] = at(p.a, Math.hypot(p.x, p.z) - ARM); return Math.hypot(x - mx, z - mz) < d * .5; });
      // the lantern launchers: standing up on the top three steps of the terraces, and down on the field toward the parapet, spread
      // out along it and kept clear of the fire pits and masts; each faces out over the town
      const spots = [];
      for (let j = 0; j < B.lanHigh; j++) {
        const i = B.tiers - 1 - (j % 3), rr = tierR(i), a = ta0 + .03 + (j + q() * .7) * (ta1 - ta0 - .06) / B.lanHigh, [x, z] = at(a, rr);
        spots.push([x, tierTop(i), z, Math.PI - a + (q() - .5) * .6, 1 + q() * .1]);
      }
      for (let j = 0, tries = 0; j < B.lanLow && tries < 400; tries++) {
        const a = a0 + .05 + (j + q() * .8) * (a1 - a0 - .1) / B.lanLow, rr = B.r1 - PW - 1.3 - q() * (q() < .3 ? 14 : 4), [x, z] = at(a, rr);
        if (nearPad(x, z, 6.5)) { if (tries % 8 === 7) j++; continue; }
        spots.push([x, top, z, Math.PI - a + (q() - .5) * .8, 1 + q() * .12]); j++;
      }
      // the terraces: little groups along each step, facing out over the field, leaving room for the launchers
      for (let i = 0; i < B.tiers; i++) {
        const rr = tierR(i), len = (ta1 - ta0) * rr;
        for (let d = .5 + q() * 2; d < len - .5; d += q() < .22 ? 3 + q() * 7 : .65 + q() * .35) {
          const a = ta0 + d / rr, [x, z] = at(a, rr + (q() - .5) * tD * .3);
          if (spots.some(s => Math.hypot(s[0] - x, s[2] - z) < .75)) continue;
          put(pk(SITS), x, tierTop(i), z, Math.PI - a + (q() - .5) * .5, 1.05 + q() * .15);
        }
      }
      // along the foot of the terraces on the field, standing, kept back from the fire pits and masts
      const fr = rIn + 1.4, flen = (a1 - a0) * fr;
      for (let d = 2; d < flen - 2; d += q() < .3 ? 2 + q() * 6 : .7 + q() * .4) {
        const a = a0 + d / fr, [x, z] = at(a, fr + q() * 2.2);
        if (!nearPad(x, z, 7)) put(pk(STANDS), x, top, z, Math.PI - a + (q() - .5) * .8, 1 + q() * .12);
      }
      // a team round each fire pit, arms up to the mouth, leaving the uphill side free for the mast's cord
      pads.forEach(p => [-2.3, -1.4, -.5, .5, 1.4, 2.3].forEach(o => {
        const th = Math.PI - p.a + o, x = p.x + Math.sin(th) * 2.1, z = p.z + Math.cos(th) * 2.1;   // th = 0 is straight downhill
        put(pk(TEAM), x, top, z, Math.atan2(p.x - x, p.z - z), 1 + q() * .1);
      }));
      const M_ = std({ vertexColors: true, flatShading: true, roughness: .85 });
      onDaylight(d => M_.emissive.copy(lerpC(0x241c14, 0x000000, d)));   // lifted a little so they read by the fires and lanterns at night
      const cdata = { tip: "The crowd at the fire balloon ground · ပွဲကြည့်ပရိသတ်", toast: "Families from the town and the villages sit on the terraces to watch the teams fill the balloons and let them go, cheering each one up; after dark they light small paper lanterns of their own and let them drift off over the town." };
      const meshes = kinds.filter(k => k.at.length).map(k => {
        const im = new THREE.InstancedMesh(lowPoly(k.make()), M_, k.at.length);
        k.at.forEach((m, i) => im.setMatrixAt(i, m));
        im.castShadow = false; im.frustumCulled = false; im.userData.noCull = true; H.add(im); clickable(list, im, cdata);
        return im;
      });
      // the launchers, a few kinds of each, each drawn twice: arms down, and arms up holding a lantern over the head (only one of the
      // two shown at a time). The lantern sits on the hands, a little in front of the face
      const LK = 4, looks = Array.from({ length: LK }, () => { const woman = q() < .5, skin = pk(SKIN), top_ = pk(JACKET), lower = woman ? pk(LONGYI) : pk(LOWER); return [skin, top_, lower, woman]; });
      const counts = Array(LK).fill(0), lk = spots.map((s, j) => j % LK);
      lk.forEach(k => counts[k]++);
      const pairs = looks.map((L, k) => [false, true].map(up => {
        const im = new THREE.InstancedMesh(lowPoly(stander(...L, up)), M_, Math.max(1, counts[k]));
        im.castShadow = false; im.frustumCulled = false; im.userData.noCull = true; H.add(im); clickable(list, im, cdata); meshes.push(im);
        return im;
      }));
      const seen = Array(LK).fill(0), _h = new THREE.Vector3();
      spots.forEach(([x, y, z, ry, sc], j) => {
        const k = lk[j], n = seen[k]++, m = _m.compose(_p.set(x, y, z), _q.setFromAxisAngle(_y, ry), _s.setScalar(sc)).clone();
        pairs[k][0].setMatrixAt(n, m); pairs[k][1].setMatrixAt(n, _zero);
        _h.set(x + Math.sin(ry) * .1 * sc, y + 1.77 * sc, z + Math.cos(ry) * .1 * sc); H.localToWorld(_h);
        launchers.push({ down: pairs[k][0], up: pairs[k][1], n, m, hx: _h.x, hy: _h.y, hz: _h.z, held: false, want: false });
      });
      return meshes;
    })();
    // each lantern belongs to one launcher, who lets go one in turn every so often
    for (let i = 0; i < LN; i++) lans.push({ L: launchers[i % launchers.length], off: i * LP / LN + r() * 1.2, climb: .75 + r() * .45, wind: .8 + r() * .5, ph: r() * TAU, cyc: -1, on: false, tint: .75 + r() * .25 });
    const CYC = B.fill + B.hold + B.rise + B.gone, mouth0 = top + 1.7;
    let dl = 1, primed = false; onDaylight(d => dl = d);
    updaters.pagoda.push((dt, t, motion) => {
      if (!FOLK.balloons) {   // rain: no balloon is filled, the fire pits are cold and the cords hang loose from the masts
        balloons.forEach(b => { b.G.visible = false; b.p.fire.visible = false; b.p.glow.material.opacity = 0; b.p.cord.visible = false; });
        lanI.visible = lanGlow.visible = sparks.visible = false; crowd.forEach(m => m.visible = false);
        return;
      }
      // which balloons the teams fill now: animals by day, the night balloons after dark, none between (FOLK.balloonKind; "auto" when
      // forced on: by the light)
      const still = motion < 1, night = dl < .45, want = FOLK.balloonKind === "auto" ? (night ? "night" : "day") : FOLK.balloonKind;
      let busy = false;
      lampM.opacity = (1 - .85 * dl) * (.88 + .12 * Math.sin(t * 9.1) * Math.sin(t * 5.3));
      balloons.forEach(b => {
        const { p, G } = b, tt = t + b.off, ph = still ? B.fill + 1 : tt % CYC, c = still ? 0 : Math.floor(tt / CYC);   // with reduced motion each is held full at its pad
        if (c !== b.cyc || !primed || (still && b.mode !== want)) {   // a new launch: the next balloon of the hour, or none (one already up flies on)
          b.cyc = c; b.mode = want;
          const set = want === "day" ? DAY_SET : want === "night" ? NIGHT_SET : null, kind = set ? set[(c * pads.length + p.k) % set.length] : -1;
          if (kind !== b.kind) { if (b.kind >= 0) b.shapes[b.kind].visible = false; if (kind >= 0) b.shapes[kind].visible = true; b.kind = kind; }
        }
        if (b.kind < 0) { G.visible = false; p.fire.visible = false; p.glow.material.opacity = 0; p.cord.visible = false; return; }
        busy = true;
        const Z = DEFS[b.kind];
        const fl = .8 + .2 * Math.sin(t * 17 + p.k * 3) * Math.sin(t * 7.3 + p.k);
        let s = 1, y = mouth0, dx = 0, dz = 0, held = true, show = true, tau = 0;
        if (ph < B.fill) { const u = easeOut(ph / B.fill); s = u; }
        else if (ph >= B.fill + B.hold) {
          tau = ph - B.fill - B.hold; held = false;
          if (tau > B.rise) show = false;
          y = mouth0 + B.climb * tau + B.accel * tau * tau; dx = B.drift[0] * tau; dz = B.drift[1] * tau;
        }
        G.visible = show;
        G.position.set(b.wx + dx, y, b.wz + dz);
        const A = b.shapes[b.kind]; A.scale.set(.35 + .65 * s, .45 + .55 * s, .35 + .65 * s); b.ring.scale.set(.35 + .65 * s, .35 + .65 * s, 1);
        G.rotation.set(held ? 0 : Math.sin(t * .33 + p.k * 2) * .04, b.face + tau * .015, held ? 0 : Math.sin(t * .4 + p.k) * .04);
        b.wick.material.opacity = (held ? .5 : .9) * fl;
        // the fire under it burns while it fills and is held, then dies down; the mast's cord hangs to the animal's back until let go
        const burn = held ? fl : .15; p.fire.scale.set(burn, burn, burn); p.fire.visible = burn > .2; p.glow.material.opacity = .25 + .6 * burn * (1 - .6 * dl);
        const crown = mouth0 + Z.h * (.45 + .55 * s), mastTop = top + MAST - .3;
        p.cord.visible = held && show; if (p.cord.visible) { p.cord.scale.y = mastTop - crown; p.cord.position.y = (mastTop + crown) / 2; }
        // the lantern balloon's stupa unrolls off the ground as the balloon lifts it; the fireworks rack throws sparks as it climbs
        if (Z.panel) { const u = held ? 0 : clamp((y - top - 3.6) / 8, 0, 1), P = b.parts[b.kind]; P.visible = u > .02; P.scale.y = Math.max(u, .02); }
        if (Z.fireworks && show && !held && !still && tau > 1 && tau < 45) for (b.spAcc += Math.min(dt, .1) * 200 * (1 - tau / 60); b.spAcc >= 1; b.spAcc--) spark(G.position.x, y - 2.9, G.position.z);
      });
      crowd.forEach(m => m.visible = busy);
      if (spOn) {
        let alive = 0;
        for (let i = 0; i < SN; i++) {
          if (spAge[i] >= spLife[i]) continue;
          const a = spAge[i] += dt, i3 = i * 3;
          if (a >= spLife[i]) { spCol[i3] = spCol[i3 + 1] = spCol[i3 + 2] = 0; continue; }
          alive++; const k = 1 - Math.min(dt, .1), f = 1 - a / spLife[i];
          spV[i3] *= k; spV[i3 + 1] = spV[i3 + 1] * k - 7 * dt; spV[i3 + 2] *= k;
          spPos[i3] += spV[i3] * dt; spPos[i3 + 1] += spV[i3 + 1] * dt; spPos[i3 + 2] += spV[i3 + 2] * dt;
          spCol[i3] = spBase[i3] * f; spCol[i3 + 1] = spBase[i3 + 1] * f; spCol[i3 + 2] = spBase[i3 + 2] * f;
        }
        spOn = alive > 0; spGeo.attributes.position.needsUpdate = spGeo.attributes.color.needsUpdate = true;
      }
      sparks.visible = spOn;
      // the lanterns: each held up a few seconds in its launcher's hands while the hot air fills it, then let go, rising and drifting
      // with the wind, shrinking and dimming away as its wick burns out high over the town. One lit at dusk goes on till it is gone;
      // none are let go by day, nor after the night balloons stop
      let any = false; const lanOn = night && want === "night";
      launchers.forEach(L => L.want = false);
      lans.forEach((l, i) => {
        const tt = t + l.off, c = still ? 0 : Math.floor(tt / LP), ph = still ? (i / LN) * LP * .85 : tt % LP;
        if (c !== l.cyc || !primed || (still && l.on !== lanOn)) { l.cyc = c; l.on = lanOn; }
        const tau = Math.max(0, ph - LH), fade = clamp((LP - ph) / 30, 0, 1), L = l.L;
        if (!l.on || fade <= 0) { lanI.setMatrixAt(i, _zero); lanCol[i * 3] = lanCol[i * 3 + 1] = lanCol[i * 3 + 2] = 0; return; }
        any = true;
        if (ph < LH) L.want = true;
        const w = Math.min(1, tau / 6), sway = still ? 0 : Math.sin(t * .7 + l.ph) * .6 * w;   // it swings free only once clear of the hands
        _lp.set(L.hx + (B.drift[0] * l.wind * tau + sway), L.hy + l.climb * tau + .002 * tau * tau, L.hz + (B.drift[1] * l.wind * tau + Math.cos(t * .5 + l.ph) * (still ? 0 : .5) * w));
        _lq.setFromEuler(_le.set(still ? 0 : Math.sin(t * 1.3 + l.ph) * .08 * w, l.ph, still ? 0 : Math.cos(t * 1.1 + l.ph) * .08 * w));
        _ls.setScalar(fade * (ph < LH ? .8 + .2 * ph / LH : 1)); lanI.setMatrixAt(i, _lm.compose(_lp, _lq, _ls));   // filling out with hot air in the hands
        lanPos[i * 3] = _lp.x; lanPos[i * 3 + 1] = _lp.y + .25; lanPos[i * 3 + 2] = _lp.z;
        const fl = (.85 + .15 * Math.sin(t * 13 + l.ph * 5)) * fade * (1 - dl) * l.tint;
        lanCol[i * 3] = fl; lanCol[i * 3 + 1] = fl * .55; lanCol[i * 3 + 2] = fl * .18;
      });
      // the launchers raise their arms while they hold a lantern up and lower them once it is let go
      launchers.forEach(L => {
        if (L.want === L.held) return;
        L.held = L.want; L.down.setMatrixAt(L.n, L.held ? _zero : L.m); L.up.setMatrixAt(L.n, L.held ? L.m : _zero);
        L.down.instanceMatrix.needsUpdate = L.up.instanceMatrix.needsUpdate = true;
      });
      primed = true;
      lanI.visible = lanGlow.visible = any;
      if (any) { lanI.instanceMatrix.needsUpdate = true; lanGeo.attributes.position.needsUpdate = lanGeo.attributes.color.needsUpdate = true; }
    });
    // walkers: the field at its own height, the parapet, end walls, fire pits and masts block; the terraces as steps. Cut into
    // wedges a few tenths of a radian wide, each with its own rectangle turned to face down its middle. Anywhere else in them is
    // left to the surfaces after this one (answering undefined)
    const PAD_ = .35, pits = pads.map(p => [p.x, p.z, 1.45 + PAD_]), masts = pads.map(p => { const [x, z] = at(p.a, Math.hypot(p.x, p.z) - ARM); return [x, z, .2 + PAD_]; });
    const height = (r, a, x, z) => {
      if (r >= rIn && r <= B.r1 + .07 + PAD_ && a >= a0 - (.07 + PAD_) / r && a <= a1 + (.07 + PAD_) / r) {
        if (r > B.r1 - PW - PAD_) return null;
        if (r > B.edge - .07 - PAD_ && (a < a0 + (PW + PAD_) / r || a > a1 - (PW + PAD_) / r)) return null;
        if (a < a0 || a > a1) return undefined;
        for (const [px, pz, pr] of pits) if (Math.hypot(x - px, z - pz) < pr) return null;
        for (const [px, pz, pr] of masts) if (Math.hypot(x - px, z - pz) < pr) return null;
        return top;
      }
      if (r < rIn && r >= up.r1 && a >= ta0 && a <= ta1) return tierTop(Math.min(B.tiers - 1, Math.floor((rIn - r) / tD)));
      return undefined;
    };
    const nP = Math.ceil((a1 - a0 + .04) / .3), span = (a1 - a0 + .04) / nP;
    for (let k = 0; k < nP; k++) {
      const mid = a0 - .02 + (k + .5) * span, hw = span / 2, Q = new THREE.Group(); Q.rotation.y = -mid; H.add(Q);   // Q's local -z points down the wedge's middle
      sRect(Q, -(B.r1 + .6) * Math.sin(hw), (B.r1 + .6) * Math.sin(hw), -(B.r1 + .6), -(up.r1 - .5) * Math.cos(hw), (lx, lz) => {
        const r_ = Math.hypot(lx, lz), a = Math.atan2(lx, -lz) + mid;
        return height(r_, a, r_ * Math.sin(a), -r_ * Math.cos(a));
      });
    }
  }
