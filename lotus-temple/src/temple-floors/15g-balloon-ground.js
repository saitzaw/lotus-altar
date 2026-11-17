  /* ---------- မီးပုံးပျံ the fire balloon ground, on the stupa hill's lower terrace round past the east stair, looking north over the
     palace lake: the terrace carried out level over the slope on a whitewashed retaining wall, a parapet with gilt coping and lamp
     posts along its outer edge, and behind it, up the slope to the upper terrace, stepped terraces for the crowd. As at the Taunggyi
     festival in the month of Tazaungmon, teams fill great paper balloons over a fire pit, the top held up from a tall bamboo mast, and
     let them go, one after another; after dark they carry strings of little paper lanterns beneath them ---------- */
  // angles round the hill from the main stair (radians): the field starts `da0` past the east stair and runs to a1; its outer edge
  // r1, where its end walls begin (the terrace's edge), parapet height and thickness; the crowd's terraces (`tiers` steps from the
  // lower terrace up to the upper) stop `tierIn` short of the field's ends; the launch pads (fractions along the field, radius);
  // a balloon's cycle (s): filling, held full, rising, gone; its climb and drift (m/s)
  const BALLOON_GROUND = { da0: .085, a1: 2.62, r1: 76.5, edge: 70.4, PH: .95, PW: .35, tiers: 9, tierIn: .1,
    pads: [[.22, 65], [.5, 64], [.78, 65]], fill: 55, hold: 15, rise: 95, gone: 10, climb: 1.4, accel: .012, drift: [.55, .3] };
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
    const data = { tip: "The fire balloon ground · မီးပုံးပျံပွဲကွင်း", toast: "The fire balloon ground (မီးပုံးပျံပွဲကွင်း in Burmese). In the month of Tazaungmon, up to its full moon, Shan towns let fire balloons go, as at the great festival in Taunggyi: teams build tall balloons of paper, fill them with the heat of a fire held under the mouth, the top hung from a bamboo mast, and let them go to cheers. The teams send up great paper animals, a rooster, a fish, a parrot, a bear and a tiger, one after another, glowing from the fire inside after dark; at night the crowd lets go hundreds of small paper lanterns too, each lit by a little wick of wax, that drift high over the town. The crowd watches from the terraces cut into the hill. Nothing goes up in the rain: wet paper will not hold the heat." };
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
    // the big balloons: great paper animals, as the Taunggyi teams send up, a rooster, a fish, a parrot, a bear and a tiger, each
    // sewn on a skirt over a bamboo ring round the mouth with its burning wick; in world space so they can climb away over the town.
    // Each pad sends up a different animal each time round, by day and after dark, when the fire inside makes the paper glow
    const sphG = new THREE.SphereGeometry(1, 18, 14), coneG = new THREE.ConeGeometry(1, 1, 12);
    const paper = (color, map) => std(map ? { color, map, roughness: .9 } : { color, roughness: .9 });
    const P_ = {
      black: paper(0x1a1410), white: paper(0xf4efe0), red: paper(0xd8282a), beak: paper(0xf08a1a),
      yellow: paper(0xf2c21c), wingY: paper(0xe89a1c), tailO: paper(0xe86a1a),
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
    // each faces +z, its mouth at y = 0; h: where the mast's cord holds its top
    const ANIMALS = {
      rooster: { my: "ကြက်ဖ", en: "rooster", h: 12.2, make(A) {
        skirt(A, P_.yellow, 2.4);
        blob(A, P_.yellow, 0, 6, 0, 3.8, 4.0, 4.4); blob(A, P_.yellow, 0, 6.6, 2.2, 3.0, 3.4, 2.8);   // the body and its full breast
        blob(A, P_.yellow, 0, 10.3, 2.6, 1.9, 2.3, 2.0);   // the head on its neck
        cone(A, P_.beak, 0, 10.4, 4.9, .5, 1.3, Math.PI / 2);
        [[12.4, 1.9], [12.8, 2.7], [12.5, 3.5]].forEach(([y, z]) => blob(A, P_.red, 0, y, z, .35, .8, .6));   // the comb
        blob(A, P_.red, 0, 9.0, 4.2, .4, .8, .45); eyes(A, 1.5, 10.8, 3.4);
        both(sd => blob(A, P_.wingY, sd * 3.4, 6.2, -.3, .9, 2.4, 3.2));
        for (let i = 0; i < 5; i++) {   // the tail feathers, fanned up and back
          const th = -.15 - i * .32, L = 3.4 - i * .25;
          blob(A, i % 2 ? P_.red : P_.tailO, 0, 7 + Math.cos(th) * L * .8, -3.4 + Math.sin(th) * L * .8, .5, L, 1.2, th);
        }
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
    // after dark the wick's fire shines through the paper: each glows in its own colour (the patterned ones through their pattern)
    glowing.forEach(m => { m.emissive.copy(m.color); if (m.map) m.emissiveMap = m.map; });
    onDaylight(d => glowing.forEach(m => m.emissiveIntensity = .6 * (1 - d)));
    H.updateMatrixWorld(true);
    const hillC = H.localToWorld(V(0, 0, 0));
    const balloons = pads.map((p, k) => {
      const G = new THREE.Group(); G.userData.noCull = true; g.add(G);
      const ring = mesh(new THREE.TorusGeometry(1.0, .05, 6, 20), bamboo, 0, 0, 0, G); ring.rotation.x = Math.PI / 2;
      const wick = glowSprite(0xffa040, 1.6, .9); wick.position.y = -.2; G.add(wick);
      const shapes = KINDS.map(name => {
        const Z = ANIMALS[name], A = new THREE.Group(); A.visible = false; G.add(A); Z.make(A);
        A.traverse(o => { if (o.isMesh) clickable(list, o, { tip: `A ${Z.en} balloon · ${Z.my}ပုံ မီးပုံးပျံ`, toast: data.toast }); });
        return A;
      });
      const w = H.localToWorld(V(p.x, top, p.z));
      return { p, G, ring, wick, shapes, kind: -1, cyc: -1, face: Math.atan2(hillC.x - w.x, hillC.z - w.z), wx: w.x, wz: w.z, off: k * (B.fill + B.hold + B.rise + B.gone) / pads.length + r() * 8 };
    });
    // the night lanterns: small paper lanterns (a cylinder of paper on a wire ring, a wax wick burning in the mouth) that the crowd
    // lights and lets go all over the field, one after another, drifting up over the town in a slow river of light. One instanced
    // mesh for the paper and one cloud of points for the glow round each
    const LN = 150, LP = 190, lanG = new THREE.LatheGeometry([[.3, 0], [.34, .3], [.4, .75], [.44, 1.05], [.4, 1.2], [.2, 1.28], [0, 1.3]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
    const lanTex = canvasTex(64, (c, sz) => { const gr = c.createLinearGradient(0, sz, 0, 0); gr.addColorStop(0, "#ffd890"); gr.addColorStop(.35, "#ff9a30"); gr.addColorStop(1, "#b8481a"); c.fillStyle = gr; c.fillRect(0, 0, sz, sz); });
    const lanM = new THREE.MeshBasicMaterial({ map: lanTex, side: THREE.DoubleSide, fog: false });
    const lanI = new THREE.InstancedMesh(lanG, lanM, LN); lanI.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    lanI.frustumCulled = false; lanI.castShadow = false; lanI.userData.noCull = true; g.add(lanI);
    clickable(list, lanI, { tip: "A paper sky lantern · မီးပုံးငယ်", toast: "After dark the crowd on the fire balloon ground lights small paper lanterns, a ring of wire at the mouth with a wick of wax burning in it, holds each until the hot air lifts it, and lets it go. Hundreds drift up over the town in a slow river of light, carrying the wishes and merit of the people who let them go." });
    const lanPos = new Float32Array(LN * 3), lanCol = new Float32Array(LN * 3), lanGeo = new THREE.BufferGeometry();
    lanGeo.setAttribute("position", new THREE.BufferAttribute(lanPos, 3)); lanGeo.setAttribute("color", new THREE.BufferAttribute(lanCol, 3));
    const lanGlow = new THREE.Points(lanGeo, new THREE.PointsMaterial({ size: 3.4, map: glowTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    lanGlow.frustumCulled = false; lanGlow.userData.noCull = true; g.add(lanGlow);
    const lans = [];
    for (let i = 0; i < LN; i++) {
      const a = a0 + .06 + r() * (a1 - a0 - .12), rr = rIn + 3 + r() * (B.edge - rIn - 6), w = H.localToWorld(V(rr * Math.sin(a), top, -rr * Math.cos(a)));
      lans.push({ x: w.x, z: w.z, off: i * LP / LN + r() * 1.2, climb: .75 + r() * .45, wind: .8 + r() * .5, ph: r() * TAU, cyc: -1, on: false, tint: .75 + r() * .25 });
    }
    const _lm = new THREE.Matrix4(), _lq = new THREE.Quaternion(), _ls = new THREE.Vector3(), _lp = new THREE.Vector3(), _le = new THREE.Euler(), _zero = new THREE.Matrix4().makeScale(0, 0, 0);
    // the crowd: people sitting on the terraces to watch, more standing along the foot of the field, and a team of six round each
    // fire pit holding the balloon's mouth over the fire. Blocky low-poly figures as at the festival stage, in warm jackets for the
    // cold Tazaungmon nights; a few kinds of each, drawn as one instanced mesh per kind. Out whenever the balloons go up (not in the rain)
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
      // the terraces: little groups along each step, facing out over the field
      for (let i = 0; i < B.tiers; i++) {
        const rr = rIn - (i + .5) * tD, len = (ta1 - ta0) * rr;
        for (let d = .5 + q() * 2; d < len - .5; d += q() < .22 ? 3 + q() * 7 : .65 + q() * .35) {
          const a = ta0 + d / rr, [x, z] = at(a, rr + (q() - .5) * tD * .3);
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
      return kinds.filter(k => k.at.length).map(k => {
        const im = new THREE.InstancedMesh(lowPoly(k.make()), M_, k.at.length);
        k.at.forEach((m, i) => im.setMatrixAt(i, m));
        im.castShadow = false; im.frustumCulled = false; im.userData.noCull = true; H.add(im); clickable(list, im, cdata);
        return im;
      });
    })();
    const CYC = B.fill + B.hold + B.rise + B.gone, mouth0 = top + 1.7;
    let dl = 1, primed = false; onDaylight(d => dl = d);
    updaters.pagoda.push((dt, t, motion) => {
      if (!FOLK.balloons) {   // rain: no balloon is filled, the fire pits are cold and the cords hang loose from the masts
        balloons.forEach(b => { b.G.visible = false; b.p.fire.visible = false; b.p.glow.material.opacity = 0; b.p.cord.visible = false; });
        lanI.visible = lanGlow.visible = false; crowd.forEach(m => m.visible = false);
        return;
      }
      crowd.forEach(m => m.visible = true);
      const still = motion < 1, night = dl < .45;
      balloons.forEach(b => {
        const { p, G } = b, tt = t + b.off, ph = still ? B.fill + 1 : tt % CYC, c = still ? 0 : Math.floor(tt / CYC);   // with reduced motion each is held full at its pad
        if (c !== b.cyc || !primed) {   // a new launch: the next animal
          b.cyc = c;
          const kind = (c * pads.length + p.k) % KINDS.length;
          if (kind !== b.kind) { if (b.kind >= 0) b.shapes[b.kind].visible = false; b.shapes[kind].visible = true; b.kind = kind; }
        }
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
        const crown = mouth0 + ANIMALS[KINDS[b.kind]].h * (.45 + .55 * s), mastTop = top + MAST - .3;
        p.cord.visible = held && show; if (p.cord.visible) { p.cord.scale.y = mastTop - crown; p.cord.position.y = (mastTop + crown) / 2; }
      });
      // the lanterns: each held a few seconds over the field, then rising and drifting with the wind, shrinking and dimming away as
      // its wick burns out high over the town. One lit at dusk goes on till it is gone; none are let go by day
      let any = false;
      lans.forEach((l, i) => {
        const tt = t + l.off, c = still ? 0 : Math.floor(tt / LP), ph = still ? (i / LN) * LP * .85 : tt % LP;
        if (c !== l.cyc || !primed) { l.cyc = c; l.on = night; }
        const tau = Math.max(0, ph - 4), fade = clamp((LP - ph) / 30, 0, 1);
        if (!l.on || fade <= 0) { lanI.setMatrixAt(i, _zero); lanCol[i * 3] = lanCol[i * 3 + 1] = lanCol[i * 3 + 2] = 0; return; }
        any = true;
        const sway = still ? 0 : Math.sin(t * .7 + l.ph) * .6;
        _lp.set(l.x + (B.drift[0] * l.wind * tau + sway), top + 1.6 + l.climb * tau + .002 * tau * tau, l.z + (B.drift[1] * l.wind * tau + Math.cos(t * .5 + l.ph) * (still ? 0 : .5)));
        _lq.setFromEuler(_le.set(still ? 0 : Math.sin(t * 1.3 + l.ph) * .08, l.ph, still ? 0 : Math.cos(t * 1.1 + l.ph) * .08));
        _ls.setScalar(fade); lanI.setMatrixAt(i, _lm.compose(_lp, _lq, _ls));
        lanPos[i * 3] = _lp.x; lanPos[i * 3 + 1] = _lp.y + .25; lanPos[i * 3 + 2] = _lp.z;
        const fl = (.85 + .15 * Math.sin(t * 13 + l.ph * 5)) * fade * (1 - dl) * l.tint;
        lanCol[i * 3] = fl; lanCol[i * 3 + 1] = fl * .55; lanCol[i * 3 + 2] = fl * .18;
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
