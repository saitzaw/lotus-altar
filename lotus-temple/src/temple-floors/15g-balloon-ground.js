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
    const data = { tip: "The fire balloon ground · မီးပုံးပျံပွဲကွင်း", toast: "The fire balloon ground (မီးပုံးပျံပွဲကွင်း in Burmese). In the month of Tazaungmon, up to its full moon, Shan towns let fire balloons go, as at the great festival in Taunggyi: teams build tall balloons of paper, fill them with the heat of a fire held under the mouth, the top hung from a bamboo mast, and let them go to cheers. By day they go up in bright gores of colour; after dark they carry strings of little paper lanterns that drift high over the town. The crowd watches from the terraces cut into the hill." };
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
    // the balloons: tall paper envelopes in gores of colour, a bamboo ring round the mouth with its burning wick, and for the night
    // strings of paper lanterns hanging beneath; one to each pad, in world space so they can climb away over the town
    const PROF = [[1.0, 0], [1.6, 1], [2.6, 2.6], [3.6, 4.8], [4.3, 7], [4.5, 8.6], [4.2, 10], [3.3, 11.2], [1.9, 12], [.5, 12.35], [0, 12.4]], EH = 12.4;
    const envGeo = new THREE.LatheGeometry(PROF.map(([x, y]) => new THREE.Vector2(x, y)), 24);
    const PALETTES = [["#d8282a", "#f4c430", "#1f7a3a", "#f4efe0"], ["#1e4fa8", "#f4efe0", "#e86a1a", "#f4c430"], ["#7a1e6a", "#f4c430", "#d8282a", "#2a8ac0"]];
    const envTex = cols => canvasTex(512, (c, sz) => {
      const gw = sz / 12;
      for (let i = 0; i < 12; i++) { c.fillStyle = cols[i % 2 ? 1 : 0]; c.fillRect(i * gw, 0, gw + 1, sz); }   // the gores
      c.fillStyle = cols[2]; c.fillRect(0, sz * .3, sz, sz * .1);   // a broad band round the widest part, set with diamonds
      c.fillStyle = cols[3]; for (let i = 0; i < 24; i++) { const x = (i + .5) * sz / 24, y = sz * .35, w = sz / 60, h = sz * .04; c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + w, y); c.lineTo(x, y + h); c.lineTo(x - w, y); c.fill(); }
      c.strokeStyle = cols[2]; c.lineWidth = sz / 70; c.beginPath(); for (let i = 0; i <= 24; i++) c.lineTo(i * sz / 24, sz * (i % 2 ? .12 : .17)); c.stroke();   // a zigzag up by the crown
      c.fillStyle = cols[3]; c.fillRect(0, sz * .58, sz, sz * .025); c.fillStyle = cols[2]; c.fillRect(0, sz * .9, sz, sz * .1);   // a thin ring, and the mouth's skirt
    });
    const lanternCols = [0xffc050, 0xff6a3a, 0xffe08a];
    const balloons = pads.map((p, k) => {
      const tex = envTex(PALETTES[k % PALETTES.length]);
      const mat = std({ map: tex, roughness: .9, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0 });
      const G = new THREE.Group(); G.userData.noCull = true; g.add(G);
      const env = mesh(envGeo, mat, 0, 0, 0, G);
      const ring = mesh(new THREE.TorusGeometry(1.0, .05, 6, 20), bamboo, 0, 0, 0, G); ring.rotation.x = Math.PI / 2;
      const wick = glowSprite(0xffa040, 1.6, .9); wick.position.y = -.2; G.add(wick);
      const L = new THREE.Group(); G.add(L); const lamps = [];
      for (let s = 0; s < 6; s++) {   // six strings fanning out below the mouth, nine lanterns on each
        const ang = s / 6 * TAU + k;
        for (let j = 1; j <= 9; j++) { const b = glowSprite(lanternCols[(s + j) % 3], .7, .9); b.material.fog = false; b.position.set(Math.cos(ang) * (.6 + j * .38), -j * .95, Math.sin(ang) * (.6 + j * .38)); L.add(b); lamps.push(b); }
      }
      G.traverse(o => { if (o.isMesh) clickable(list, o, { tip: "A fire balloon · မီးပုံးပျံ", toast: data.toast }); });
      H.updateMatrixWorld(true); const w = H.localToWorld(V(p.x, top, p.z));
      return { p, G, env, ring, mat, wick, L, lamps, wx: w.x, wz: w.z, off: k * (B.fill + B.hold + B.rise + B.gone) / pads.length + r() * 8 };
    });
    const CYC = B.fill + B.hold + B.rise + B.gone, mouth0 = top + 1.7;
    let dl = 1; onDaylight(d => dl = d);
    updaters.pagoda.push((dt, t, motion) => {
      balloons.forEach(b => {
        const { p, G } = b, still = motion < 1, ph = still ? B.fill + 1 : (t + b.off) % CYC;   // with reduced motion each is held full at its pad
        const fl = .8 + .2 * Math.sin(t * 17 + p.k * 3) * Math.sin(t * 7.3 + p.k);
        let s = 1, y = mouth0, dx = 0, dz = 0, held = true, show = true;
        if (ph < B.fill) { const u = easeOut(ph / B.fill); s = u; }
        else if (ph >= B.fill + B.hold) {
          const tau = ph - B.fill - B.hold; held = false;
          if (tau > B.rise) show = false;
          y = mouth0 + B.climb * tau + B.accel * tau * tau; dx = B.drift[0] * tau; dz = B.drift[1] * tau;
        }
        G.visible = show;
        G.position.set(b.wx + dx, y, b.wz + dz);
        b.env.scale.set(.35 + .65 * s, .45 + .55 * s, .35 + .65 * s); b.ring.scale.set(.35 + .65 * s, .35 + .65 * s, 1);
        G.rotation.z = held ? 0 : Math.sin(t * .4 + p.k) * .04; G.rotation.x = held ? 0 : Math.sin(t * .33 + p.k * 2) * .04;
        b.mat.emissiveIntensity = (1 - dl) * (.12 + .22 * s) * fl;
        b.wick.material.opacity = (held ? .5 : .9) * fl; b.L.visible = !held && dl < .6;
        b.lamps.forEach(l => l.material.opacity = .9 * (1 - dl));
        // the fire under it burns while it fills and is held, then dies down; the mast's cord hangs to its crown until let go
        const burn = held ? fl : .15; p.fire.scale.set(burn, burn, burn); p.fire.visible = burn > .2; p.glow.material.opacity = .25 + .6 * burn * (1 - .6 * dl);
        const crown = mouth0 + EH * (.45 + .55 * s), mastTop = top + MAST - .3;
        p.cord.visible = held; if (held) { p.cord.scale.y = mastTop - crown; p.cord.position.y = (mastTop + crown) / 2; }
      });
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
