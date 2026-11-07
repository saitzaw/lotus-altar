  /* ---------- the beat officer: a township policeman walks the town's roads out of the police station. A visitor on foot who comes
     near after dark is chased, and one he gets within a metre of is arrested and walked back to the station. The temple compound and the two
     markets are safe ground: he never steps in, and gives up the chase once the visitor is inside. A game only ---------- */
  const SAFE = [[-33, 33, -16, 43], [43, 104, -14, 47.4], [44, 100, 61.8, 102.8]];   // the compound, the seven-day market, the daily market
  const safeAt = (x, z) => SAFE.some(([x0, x1, z0, z1]) => x > x0 && x < x1 && z > z0 && z < z1);
  function beatOfficer(g) {
    const { nodes, edges } = GHOST_ROADS, next = nodes.map(() => []);
    edges.forEach(([a, b]) => { next[a].push(b); next[b].push(a); });
    const m = std({ vertexColors: true, flatShading: true, roughness: .8 });
    onDaylight(d => m.emissive.copy(lerpC(0x1c1814, 0x000000, d)));
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n = 7) => new THREE.CylinderGeometry(a, b, h, n);
    const SKIN = 0xd8a47a, SHIRT = 0x7d8fa0, NAVY = 0x1f2536, BLACK = 0x141414, GOLD = 0xd8b048, INK = 0x2a1c18;
    // in uniform: a long-sleeved blue-grey shirt with a badge, dark trousers and belt, boots, and a peaked cap
    const cop = new THREE.Group(); cop.userData.noCull = true; g.add(cop);
    const fig = new THREE.Group(); fig.scale.setScalar(1.12); cop.add(fig);
    const body = new THREE.Mesh(lowPoly([
      [cyl(.155, .17, .46), SHIRT, 0, .89, 0], [box(.11, .12, .13), SHIRT, -.19, 1.0, 0], [box(.11, .12, .13), SHIRT, .19, 1.0, 0],   // the shirt and its shoulders
      [box(.016, .38, .012), 0x5a6a78, 0, .9, .168], [box(.05, .06, .012), GOLD, -.08, .99, .165],                                   // its buttons and the badge
      [cyl(.17, .17, .14), NAVY, 0, .68, 0], [cyl(.175, .175, .06), BLACK, 0, .7, 0], [box(.06, .045, .02), GOLD, 0, .7, .175],         // trousers, belt and buckle
      [cyl(.05, .05, .07, 6), SKIN, 0, 1.11, 0],
      [box(.25, .27, .24), SKIN, 0, 1.265, 0], [box(.03, .06, .05), SKIN, -.135, 1.27, 0], [box(.03, .06, .05), SKIN, .135, 1.27, 0],   // head and ears
      [box(.035, .045, .012), INK, -.055, 1.28, .122], [box(.035, .045, .012), INK, .055, 1.28, .122], [box(.07, .014, .01), 0x6a3028, 0, 1.21, .122],
      [box(.05, .012, .01), INK, -.055, 1.32, .122], [box(.05, .012, .01), INK, .055, 1.32, .122],                                     // eyes, mouth and brows
      [box(.27, .17, .07), 0x221a16, 0, 1.33, -.1],                                                                                       // the back of the hair
      [box(.28, .08, .27), NAVY, 0, 1.42, 0], [box(.29, .04, .28), BLACK, 0, 1.385, 0], [box(.31, .05, .3), NAVY, 0, 1.475, .01],        // the cap, its band and crown
      [box(.24, .02, .12), BLACK, 0, 1.38, .19], [box(.05, .05, .012), GOLD, 0, 1.43, .142]                                               // its peak and badge
    ]), m);
    fig.add(body);
    const limb = (geo, px, py, rz) => { const p = new THREE.Group(); p.position.set(px, py, 0); p.rotation.z = rz; p.add(new THREE.Mesh(geo, m)); fig.add(p); return p; };
    const legGeo = lowPoly([[box(.12, .62, .12), NAVY, 0, -.31, 0], [box(.13, .06, .25), BLACK, 0, -.63, .04]]);
    const armGeo = lowPoly([[box(.09, .44, .095), SHIRT, 0, -.22, 0], [box(.07, .08, .08), SKIN, 0, -.47, 0]]);
    const legL = limb(legGeo, -.075, .66, 0), legR = limb(legGeo, .075, .66, 0), armL = limb(armGeo, -.205, 1.04, -.1), armR = limb(armGeo, .205, 1.04, .1);
    cop.traverse(o => { if (o.isMesh) { o.castShadow = false; o.userData.noCull = true; } });

    // on the beat: along the roads like the ghost, picking a way at random at each corner; or chasing, holding at the station, or
    // walking back to the nearest corner of his beat
    const r = rng(1291);
    let a = 16, b = 14, along = 3, x = 137, z = 54, heading = -Math.PI / 2, mode = "beat", hold = 0, stuck = 0, phase = 0;
    const pick = (at, from) => { const opts = next[at].filter(n => n !== from), l = opts.length ? opts : next[at]; return l[(r() * l.length) | 0]; };
    // where he can stand: not in walls, trees, posts or water, not up or down more than a stair's height at once, never on safe ground
    const free = (px, pz, h0) => { if (safeAt(px, pz)) return false; const h = walkAt(px, pz); return h !== null && (h0 === null || Math.abs(h - h0) < .45); };
    // a step of up to `d` metres toward (tx, tz). Something in the way (looked for half a metre ahead): he turns aside, more and
    // more, one way and then the other, and keeps to a way round for a moment so he walks round a tree or a corner instead of
    // pressing into it. Returns the way he went, or null if he could not move
    let detour = null;   // { a: the way round, t: seconds left on it }
    const stepTo = (tx, tz, d, dt) => {
      const dx = tx - x, dz = tz - z, l = Math.hypot(dx, dz); if (l < 1e-3) return null;
      const s = Math.min(d, l), aim = Math.atan2(dx, dz), h0 = walkAt(x, z);
      const ok = a => free(x + Math.sin(a) * Math.max(s, .5), z + Math.cos(a) * Math.max(s, .5), h0) && free(x + Math.sin(a) * s, z + Math.cos(a) * s, h0);
      const go = a => { x += Math.sin(a) * s; z += Math.cos(a) * s; return a; };
      if (detour && (detour.t -= dt) > 0 && !ok(aim) && ok(detour.a)) return go(detour.a);
      if (ok(aim)) { detour = null; return go(aim); }
      const side = detour ? Math.sign(Math.atan2(Math.sin(detour.a - aim), Math.cos(detour.a - aim))) || 1 : 1;
      for (let k = 1; k <= 6; k++) for (const sd of [side, -side]) {
        const a = aim + sd * k * .45;
        if (ok(a)) { detour = { a, t: .8 }; return go(a); }
      }
      detour = null; return null;
    };
    const goBack = () => { mode = "back"; stuck = 0; a = nodes.reduce((best, n, i) => Math.hypot(n[0] - x, n[1] - z) < Math.hypot(nodes[best][0] - x, nodes[best][1] - z) ? i : best, 0); };
    updaters.pagoda.push((dt, t, motion) => {
      const out = COP.on && (!COP.night || daylight < .5);   // with `night`, he is only out after dark
      cop.visible = out;
      if (!out) { if (mode === "chase") goBack(); return; }
      const eye = COP.walking ? FEST.eye : null, dEye = eye ? Math.hypot(eye.x - x, eye.z - z) : Infinity, safe = !!eye && safeAt(eye.x, eye.z);
      const x0 = x, z0 = z;
      let face = heading, run = false;
      if (mode === "hold") {   // at the station after an arrest, then back out on the beat
        if (eye && dEye < 8) face = Math.atan2(eye.x - x, eye.z - z);
        if ((hold -= dt) <= 0) goBack();
      } else if (mode === "chase") {
        if (!eye || safe || dEye > COP.see * 2) { COP.news = !eye ? null : safe ? "safe" : "lost"; goBack(); }
        else if (dEye < COP.arrest) { COP.news = "arrested"; mode = "hold"; hold = COP.hold; x = 131; z = 45.6; face = heading = 0; }
        else { const w = stepTo(eye.x, eye.z, COP.speed * dt, dt); face = w === null ? Math.atan2(eye.x - x, eye.z - z) : w; run = true; }
      } else if (eye && !safe && dEye < COP.see) { mode = "chase"; COP.news = "spotted"; }
      else if (mode === "back") {   // straight back to the nearest corner; if something is in the way too long, he takes another way round (unseen)
        const [nx, nz] = nodes[a];
        const w = stepTo(nx, nz, COP.beat * dt, dt); if (w !== null) face = w;
        stuck = Math.hypot(x - x0, z - z0) < COP.beat * dt * .3 ? stuck + dt : 0;
        if (Math.hypot(nx - x, nz - z) < .3 || stuck > 4 && dEye > 30) { x = nx; z = nz; mode = "beat"; along = 0; b = pick(a, -1); }
      } else {
        const [ax, az] = nodes[a], [bx, bz] = nodes[b], len = Math.hypot(bx - ax, bz - az);
        along += COP.beat * dt;
        if (along >= len) { along -= len; const from = a; a = b; b = pick(b, from); }
        const [cx, cz] = nodes[a], [ex, ez] = nodes[b], l2 = Math.hypot(ex - cx, ez - cz);
        x = cx + (ex - cx) * along / l2; z = cz + (ez - cz) * along / l2; face = Math.atan2(ex - cx, ez - cz);
      }
      heading += Math.atan2(Math.sin(face - heading), Math.cos(face - heading)) * Math.min(1, dt * 6);
      const moved = mode === "hold" ? 0 : Math.hypot(x - x0, z - z0);
      phase += moved * 5;
      const sw = Math.sin(phase) * (moved > 1e-4 ? 1 : 0) * motion * (run ? .7 : .35);
      const w = walkAt(x, z), ground = w === null ? terrainAt(x, z) : w;
      cop.position.set(x, ground + Math.abs(Math.cos(phase)) * (run ? .05 : .02) * (moved > 1e-4 ? 1 : 0) * motion, z); cop.rotation.y = heading;
      legL.rotation.x = sw; legR.rotation.x = -sw; armL.rotation.x = -sw * 1.2; armR.rotation.x = sw * 1.2;
      COP.at = { x, z };
    });
  }
