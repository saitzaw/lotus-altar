  /* ---------- Halloween night: one small friendly ghost, round-headed and smiling with a jack-o'-lantern in its hand, drifts along
     the streets and lanes, choosing a way at random at every corner. It is never scary: it stops and waves when someone comes
     near, and keeps its distance. The pole lights it passes flicker on and off, then come back on behind it ---------- */
  // the roads it walks, in the grounds' frame: nodes [x, z] and the stretches of road between them
  const GHOST_ROADS = {
    nodes: [[-97, 54], [-97, 6], [-70.75, 54], [-70.75, -22], [-41.5, 54], [-41.5, -24], [0, 54], [4.6, 61], [4.6, 69.5], [0, 72],
            [0, 77.5], [0, 105], [-20, 77.5], [41, 77.5], [41, 54], [41, 150], [140, 54], [-124.75, 54], [-124.75, -2]],
    // the street from the hut village to the fire station; the hut lane, the west lane and the town road off it; round the plaza
    // opposite the gate to the plaza lane and the back lane; the market lane
    edges: [[0, 2], [2, 4], [4, 6], [6, 14], [14, 16], [0, 1], [2, 3], [4, 5], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [10, 12], [10, 13],
            [13, 14], [13, 15], [0, 17], [17, 18]]   // and the street's turn north to the hospital
  };
  function halloweenGhost(g) {
    const { nodes, edges } = GHOST_ROADS, next = nodes.map(() => []);
    edges.forEach(([a, b]) => { next[a].push(b); next[b].push(a); });
    const gh = new THREE.Group(); gh.userData.noCull = true; g.add(gh);
    const body = new THREE.Group(); body.visible = false; gh.add(body);   // the light stays in the scene; only the ghost hides
    // a sheet-like body: a big round head over a narrower middle, flaring to a wavy hem
    const sheet = std({ color: 0xf6f8ff, emissive: 0xcad8ff, emissiveIntensity: .55, roughness: .5, transparent: true, opacity: .9, side: THREE.DoubleSide });
    const sh = lathe([[.4, 0], [.33, .2], [.3, .38], [.36, .58], [.42, .78], [.4, .95], [.32, 1.08], [.18, 1.17], [0, 1.2]], sheet, 32);
    const pos = sh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); if (y < .15) pos.setY(i, y + Math.sin(Math.atan2(pos.getX(i), pos.getZ(i)) * 6) * .06 * (1 - y / .15)); }
    sh.geometry.computeVertexNormals(); body.add(sh);
    // big friendly eyes with a glint, a smile and rosy cheeks, on the front (local +z)
    const ink = std({ color: 0x1a1a24, roughness: .3 }), white = std({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: .6 }), rosy = std({ color: 0xffa0b4, emissive: 0xff8098, emissiveIntensity: .3, roughness: .6 });
    [-1, 1].forEach(sd => {
      const e = mesh(new THREE.SphereGeometry(.065, 12, 10), ink, sd * .13, .84, .385, body); e.scale.set(1, 1.45, .5);
      mesh(new THREE.SphereGeometry(.018, 6, 6), white, sd * .13 + .02, .87, .415, body);
      const ck = mesh(new THREE.CircleGeometry(.05, 12), rosy, sd * .24, .74, .355, body); ck.rotation.y = sd * .6;
    });
    const smile = mesh(new THREE.TorusGeometry(.075, .014, 6, 14, Math.PI), ink, 0, .74, .405, body); smile.rotation.z = Math.PI;
    // stubby arms; the right one waves, the left carries a little jack-o'-lantern
    const arm = sd => {
      const a = new THREE.Group(); a.position.set(sd * .3, .55, .02); body.add(a);
      mesh(new THREE.SphereGeometry(.09, 10, 8), sheet, sd * .1, 0, 0, a).scale.set(1.5, .75, .75);
      return a;
    };
    const armR = arm(1), armL = arm(-1);
    armL.rotation.z = .35;
    const pumpkin = mesh(new THREE.SphereGeometry(.1, 12, 8), std({ color: 0xe86a10, emissive: 0xff7a10, emissiveIntensity: .45, roughness: .6 }), -.2, -.12, .1, armL);
    pumpkin.scale.y = .8;
    mesh(new THREE.CylinderGeometry(.012, .016, .05, 5), std({ color: 0x3a5a1a }), -.2, -.03, .1, armL);
    const pumpkinGlow = glowSprite(0xff8a20, .5, .6); pumpkinGlow.position.set(-.2, -.12, .14); armL.add(pumpkinGlow);
    const halo = glowSprite(0xd8e4ff, 2.6, .3); halo.position.y = .6; body.add(halo);
    body.traverse(o => { if (o.isMesh) o.castShadow = false; });
    const light = new THREE.PointLight(0xcfdcff, 0, 7, 2); light.position.y = .7; gh.add(light);   // a soft pale light on the road

    // walking: from node `a` to node `b`; at each corner it picks a road at random, not straight back unless it is a dead end
    const r = rng(1031);
    let a = 6, b = 14, along = 0, heading = 0, pause = 0, greet = 0;
    const pick = (at, from) => { const opts = next[at].filter(n => n !== from); const l = opts.length ? opts : next[at]; return l[(r() * l.length) | 0]; };
    const flick = [];   // per pole light: lit or not, and how long until it next blinks (lights built after this join in)
    const SPEED = 1.3, NEAR = 7.5;
    updaters.pagoda.push((dt, t, motion) => {
      const on = FEST.on && daylight < .5;
      body.visible = on; light.intensity = on ? .9 : 0;
      if (!on) { FEST.ghost = null; flick.forEach((f, i) => { if (f && !f.lit) { f.lit = true; poleLights[i].set(true); } }); return; }
      const [ax, az] = nodes[a], [bx, bz] = nodes[b], len = Math.hypot(bx - ax, bz - az);
      let x = ax + (bx - ax) * along / len, z = az + (bz - az) * along / len;
      // someone near: stop, turn to them and wave for a while, then carry on
      const eye = FEST.eye, dEye = eye ? Math.hypot(eye.x - x, eye.z - z) : Infinity;
      if (dEye < 4 && pause <= 0 && greet <= 0) { pause = 5; greet = 12; }
      greet -= dt;
      let face = Math.atan2(bx - ax, bz - az);
      if (pause > 0) { pause -= dt; if (eye) face = Math.atan2(eye.x - x, eye.z - z); }
      else {
        along += SPEED * dt;
        if (along >= len) { along -= len; const from = a; a = b; b = pick(b, from); }
      }
      heading += Math.atan2(Math.sin(face - heading), Math.cos(face - heading)) * Math.min(1, dt * 3);
      const w = walkAt(x, z), ground = w === null ? terrainAt(x, z) : w;
      gh.position.set(x, ground + .35 + Math.sin(t * 2.1) * .08 * motion, z);
      gh.rotation.y = heading;
      body.rotation.z = Math.sin(t * 1.3) * .06 * motion;
      armR.rotation.z = pause > 0 ? -.9 - Math.sin(t * 9) * .45 : -.2 - Math.sin(t * 2) * .1 * motion;
      // the pole lights near it flicker: off and on at random, quicker off than on, and steady again once it has gone by
      poleLights.forEach((p, i) => {
        const f = flick[i] || (flick[i] = { lit: true, t: 0 });
        if (Math.hypot(p.x - x, p.z - z) > NEAR) { if (!f.lit) { f.lit = true; p.set(true); } return; }
        if ((f.t -= dt) > 0) return;
        f.lit = !f.lit; p.set(f.lit);
        f.t = f.lit ? .08 + Math.random() * .4 : .04 + Math.random() * .16;
      });
      FEST.ghost = { x, z };
    });
  }
