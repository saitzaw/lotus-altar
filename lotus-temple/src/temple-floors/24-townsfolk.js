  /* ---------- townsfolk out in the evening: ten people browsing the seven-day market's aisles and five walking the town's roads,
     out from 6 pm until they go home at 10 pm on the temple's clock; when it rains they put up umbrellas. Low-poly figures with big friendly
     heads, wrapped up warm against the cold hill nights; they stop and turn to someone who comes close ---------- */
  // one geometry from many small parts, each coloured: [geometry, colour, x, y, z]
  function lowPoly(list) {
    const pos = [], col = [], c = new THREE.Color();
    list.forEach(([geo, hex, x, y, z]) => {
      const gg = geo.index ? geo.toNonIndexed() : geo; gg.translate(x, y, z); c.set(hex);
      const p = gg.attributes.position;
      for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); col.push(c.r, c.g, c.b); }
    });
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    out.computeVertexNormals(); return out;
  }
  // the market's aisles (x 52, 68, 84) and the cross-ways at their ends; the roads are the ghost's
  const MARKET_WAYS = { nodes: [[52, 15.6], [52, 44.6], [68, 15.6], [68, 44.6], [84, 15.6], [84, 44.6]], edges: [[0, 1], [2, 3], [4, 5], [0, 2], [2, 4], [1, 3], [3, 5]] };
  function townsfolk(g) {
    const r = rng(1811), folkM = std({ vertexColors: true, flatShading: true, roughness: .85 });
    onDaylight(d => folkM.emissive.copy(lerpC(0x1c1814, 0x000000, d)));   // a little lift so they read under the market's bulbs
    const SKIN = [0xe8b890, 0xd8a47a, 0xc89068, 0xf0c4a0], HAIR = 0x221a16, GREY = 0xe4e2dc, INK = 0x2a1c18;
    // warm clothes for a cold night in the hills: padded jackets and knitted cardigans, wool scarves and hats, Shan women's
    // towel turbans, baggy Shan trousers or a longyi to the ankle
    const JACKET = [0x2f4a3a, 0x2a3450, 0x6a2a2e, 0x5a4232, 0x4a4a50, 0xd8ccb4, 0x7a6a4a, 0x3a5a6a];
    const SCARF = [0xb83a3a, 0x8a8a8a, 0xd8c8a0, 0x3a4a7a, 0xc8783a], HAT = [0xa83030, 0x2a3a5a, 0x3a3a3a, 0xc8a050, 0x4a6a4a], TOWEL = [0xe88aa0, 0xe8903a, 0xf0ece0, 0xd84a4a];
    const TROUSERS = [0x23232b, 0x2e3446, 0x4a3a2c], LONGYI_M = [0x4a3a5a, 0x3a4a5a, 0x5a3a3a], LONGYI_W = [0x8a2a3a, 0xd8483a, 0x2a2e48, 0x6a2a5a, 0x2f5a3a];
    const UMBRELLA = [0x1a1a22, 0x23305a, 0xa82a2a, 0x3a6a4a, 0xd88a3a, 0x7a3a7a].map(h => new THREE.Color(h));
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n = 7) => new THREE.CylinderGeometry(a, b, h, n);
    // limbs and umbrellas, shared by everyone and drawn as one instanced mesh each, tinted per person: a leg in trousers (or hidden
    // under the longyi) on a dark shoe, a long sleeve, a bare hand
    const legGeo = lowPoly([[box(.11, .64, .11), 0xffffff, 0, -.32, 0], [box(.12, .035, .23), 0x3a2e28, 0, -.643, .035]]);
    const armGeo = lowPoly([[box(.09, .44, .095), 0xffffff, 0, -.22, 0]]), handGeo = lowPoly([[box(.07, .08, .08), 0xffffff, 0, -.47, 0]]);
    const umbGeo = lowPoly([[new THREE.ConeGeometry(.6, .2, 8, 1, true), 0xffffff, 0, 1.0, 0], [new THREE.CylinderGeometry(.012, .012, 1.0, 4), 0x9a9aa0, 0, .5, 0]]);
    umbGeo.computeBoundingSphere();
    const N = 15, legs = new THREE.InstancedMesh(legGeo, folkM, N * 2), arms = new THREE.InstancedMesh(armGeo, folkM, N * 2), hands = new THREE.InstancedMesh(handGeo, folkM, N * 2);
    const umbs = new THREE.InstancedMesh(umbGeo, std({ vertexColors: true, flatShading: true, roughness: .6, side: THREE.DoubleSide }), N);
    [legs, arms, hands, umbs].forEach(im => { im.frustumCulled = false; im.castShadow = false; im.userData.noCull = true; g.add(im); });
    const holder = new THREE.Object3D(), limb = new THREE.Object3D(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
    holder.add(limb);
    const people = [];
    for (let i = 0; i < N; i++) {
      const woman = r() < .45, elder = i === 4 || i === 12, pk = l => l[(r() * l.length) | 0];
      const trousers = !woman && r() < .55, skin = pk(SKIN), jacket = pk(JACKET), hair = elder ? GREY : HAIR;
      const lower = trousers ? pk(TROUSERS) : woman ? pk(LONGYI_W) : pk(LONGYI_M);
      const parts = [
        [cyl(.155, .175, .46), jacket, 0, .87, 0], [box(.11, .12, .13), jacket, -.19, .99, 0], [box(.11, .12, .13), jacket, .19, .99, 0],   // the jacket and its shoulders
        [box(.016, .4, .012), 0x2a2420, 0, .87, .168],                                                                       // its zip or buttons
        [cyl(.05, .05, .07, 6), skin, 0, 1.09, 0],
        [box(.25, .27, .24), skin, 0, 1.245, 0], [box(.03, .06, .05), skin, -.135, 1.25, 0], [box(.03, .06, .05), skin, .135, 1.25, 0],   // head and ears
        [box(.035, .045, .012), INK, -.055, 1.26, .122], [box(.035, .045, .012), INK, .055, 1.26, .122], [box(.07, .014, .01), 0x8a3a30, 0, 1.19, .122],   // eyes and smile
        [box(.27, woman ? .24 : .17, .07), hair, 0, woman ? 1.28 : 1.31, -.1]                                                 // the back of the hair
      ];
      if (trousers) parts.push([cyl(.17, .17, .14), lower, 0, .68, 0]);                                                      // baggy Shan trousers (the legs are the trousers)
      else parts.push([cyl(.17, woman ? .19 : .2, .62), lower, 0, .39, 0], [cyl(woman ? .192 : .202, woman ? .195 : .205, .05), woman ? 0xe8c060 : 0x2a2420, 0, .14, 0]);   // a longyi to the ankle, a band at the hem
      if (r() < .5) parts.push([cyl(.09, .1, .08, 8), pk(SCARF), 0, 1.1, 0], [box(.06, .16, .03), pk(SCARF), .05, .98, .17]);   // a wool scarf, one end hanging
      const head = r();
      if (woman && head < .45) parts.push([box(.29, .12, .28), pk(TOWEL), 0, 1.41, 0], [box(.1, .06, .07), pk(TOWEL), 0, 1.48, .05]);   // a towel wrapped as a turban
      else if (head < .55) { const h = pk(HAT); parts.push([box(.275, .11, .27), h, 0, 1.41, 0], [box(.285, .045, .28), h, 0, 1.36, 0], [box(.07, .05, .07), h, 0, 1.49, 0]); }   // a knitted wool hat with a bobble
      else {
        parts.push([box(.27, .07, .26), hair, 0, 1.395, -.005]);
        if (woman) parts.push([box(.025, .18, .2), hair, -.13, 1.29, -.02], [box(.025, .18, .2), hair, .13, 1.29, -.02], [new THREE.IcosahedronGeometry(.075, 0), hair, 0, 1.27, -.17]);   // hair down the sides, a low bun
        else [-.08, 0, .08].forEach(x => parts.push([box(.08, .05 + r() * .04, .05), hair, x, 1.38, .11]));                // a spiky fringe
      }
      if (!woman) parts.push([box(.05, .012, .01), INK, -.055, 1.3, .122], [box(.05, .012, .01), INK, .055, 1.3, .122]);   // brows
      const body = new THREE.Mesh(lowPoly(parts), folkM); body.castShadow = false; body.visible = false; body.userData.noCull = true; g.add(body);
      const market = i < 10, ways = market ? MARKET_WAYS : GHOST_ROADS, next = ways.nodes.map(() => []);
      ways.edges.forEach(([a, b]) => { next[a].push(b); next[b].push(a); });
      const e = ways.edges[(r() * ways.edges.length) | 0];
      people.push({ body, market, ways, next, a: e[0], b: e[1], along: r() * 6, speed: (market ? .7 : 1.1) * (elder ? .75 : 1) + r() * .3, scale: 1.08 + r() * .12, side: r() < .5 ? -1 : 1,
                    skin: new THREE.Color(skin), sleeve: new THREE.Color(jacket), leg: new THREE.Color(trousers ? lower : 0x3a2e28), swing: trousers ? .32 : .08,
                    umb: UMBRELLA[(r() * UMBRELLA.length) | 0], phase: r() * TAU, pause: 0, greet: 0, stopIn: 3 + r() * 8, face: 0, heading: 0, ox: 0, oz: 0, open: 0 });
    }
    people.forEach((p, i) => { [[legs, p.leg], [arms, p.sleeve], [hands, p.skin]].forEach(([im, c]) => { im.setColorAt(i * 2, c); im.setColorAt(i * 2 + 1, c); }); umbs.setColorAt(i, p.umb); });
    const pick = (p, at, from) => { const opts = p.next[at].filter(n => n !== from), l = opts.length ? opts : p.next[at]; return l[(r() * l.length) | 0]; };
    const setLimb = (im, k, x, y, z, rx, rz = 0) => { limb.position.set(x, y, z); limb.rotation.set(rx, 0, rz); holder.updateMatrixWorld(true); im.setMatrixAt(k, limb.matrixWorld); };
    updaters.pagoda.push((dt, t, motion) => {
      const eye = FEST.eye;
      people.forEach((p, i) => {
        const hide = () => { p.seen = false; p.body.visible = false; legs.setMatrixAt(i * 2, zero); legs.setMatrixAt(i * 2 + 1, zero); [arms, hands].forEach(im => { im.setMatrixAt(i * 2, zero); im.setMatrixAt(i * 2 + 1, zero); }); umbs.setMatrixAt(i, zero); };
        if (!FOLK.out) return hide();
        const [ax, az] = p.ways.nodes[p.a], [bx, bz] = p.ways.nodes[p.b], len = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / len, dz = (bz - az) / len;
        // keep to one side of the road (eased round corners); in the market, near the middle of the aisle
        const off = p.market ? .5 : 1.7;
        // someone coming into view is already in place, facing their way, umbrella up if it is raining
        if (!p.seen) { p.seen = true; p.ox = -dz * off * p.side; p.oz = dx * off * p.side; p.heading = Math.atan2(dx, dz); p.open = FOLK.umbrellas ? 1 : 0; }
        p.ox += (-dz * off * p.side - p.ox) * Math.min(1, dt * 1.5); p.oz += (dx * off * p.side - p.oz) * Math.min(1, dt * 1.5);
        const x = ax + dx * p.along + p.ox, z = az + dz * p.along + p.oz;
        const dEye = eye ? Math.hypot(eye.x - x, eye.z - z) : Infinity;
        if (dEye < 2.6 && p.pause <= 0 && p.greet <= 0) { p.pause = 3; p.greet = 10; p.face = Math.atan2(eye.x - x, eye.z - z); }
        p.greet -= dt;
        let walking = false;
        if (p.pause > 0) p.pause -= dt;
        else {
          const step = p.speed * dt; p.along += step; walking = true; p.face = Math.atan2(dx, dz);
          if (p.along >= len) { p.along -= len; const from = p.a; p.a = p.b; p.b = pick(p, p.b, from); }
          // browsing: now and then stop at a stall and turn to look at it
          if (p.market && dx === 0 && (p.stopIn -= step) <= 0) { p.stopIn = 4 + r() * 9; p.pause = 2 + r() * 5; p.face = (r() < .5 ? 1 : -1) * Math.PI / 2; }
        }
        p.heading += Math.atan2(Math.sin(p.face - p.heading), Math.cos(p.face - p.heading)) * Math.min(1, dt * 4);
        if (eye && Math.hypot(eye.x - x, eye.z - z) > 110) return hide();   // too far off to see
        const w = walkAt(x, z), ground = w === null ? terrainAt(x, z) : w;
        if (walking) p.phase += dt * p.speed * 5.5;
        const sw = Math.sin(p.phase) * (walking ? 1 : 0) * motion, bob = Math.abs(Math.cos(p.phase)) * .025 * (walking ? 1 : 0) * motion;
        p.body.visible = true; p.body.position.set(x, ground + bob, z); p.body.rotation.y = p.heading; p.body.scale.setScalar(p.scale);
        holder.position.copy(p.body.position); holder.rotation.y = p.heading; holder.scale.setScalar(p.scale);
        p.open += ((FOLK.umbrellas ? 1 : 0) - p.open) * Math.min(1, dt * 3);
        const up = p.open > .02;
        setLimb(legs, i * 2, -.075, .66, 0, sw * p.swing); setLimb(legs, i * 2 + 1, .075, .66, 0, -sw * p.swing);
        const armL = -sw * .4, armR = -.6 * p.open + sw * .4 * (1 - p.open), tilt = .1 - .32 * p.open;   // the umbrella hand comes up
        setLimb(arms, i * 2, -.205, 1.02, 0, armL, -.1); setLimb(hands, i * 2, -.205, 1.02, 0, armL, -.1);
        setLimb(arms, i * 2 + 1, .205, 1.02, 0, armR, tilt); setLimb(hands, i * 2 + 1, .205, 1.02, 0, armR, tilt);
        if (up) { limb.position.set(.1, .64, .28); limb.rotation.set(-.08, 0, 0); limb.scale.set(p.open, 1, p.open); holder.updateMatrixWorld(true); umbs.setMatrixAt(i, limb.matrixWorld); limb.scale.set(1, 1, 1); }
        else umbs.setMatrixAt(i, zero);
      });
      legs.instanceMatrix.needsUpdate = arms.instanceMatrix.needsUpdate = hands.instanceMatrix.needsUpdate = umbs.instanceMatrix.needsUpdate = true;
    });
  }
