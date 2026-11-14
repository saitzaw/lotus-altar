    /* ---------- dragon and lion dance training (舞龍 舞獅) on the kung fu ground in the weeks before Chinese New Year: the dragon
       team (nine dancers on poles and the pearl bearer) runs the long dragon round a figure of eight, its body rolling in waves; two
       southern lions, each worked by two dancers, prowl, shake their heads, snap their jaws and rear up; a drummer and a cymbal player
       keep the beat. Shown only at practice hours (CONFIG.lionDragon, setLionDragon). In the ground's local frame. Returns the step ---------- */
    function lionDragonTroupe(b, list, W, D) {
      const T = new THREE.Group(); T.position.y = .12; b.add(T);   // on the slabs
      const lin = h => new THREE.Color(h).convertSRGBToLinear(), mats = [];
      const mat = o => { const m = std(o); mats.push(m); return m; };
      const folkM = std({ vertexColors: true, flatShading: true, roughness: .85 }); mats.push(folkM);
      onDaylight(d => mats.forEach(m => m.emissive.copy(lerpC(0x1c1814, 0x000000, d))));   // a little lift so they read at the evening practices
      const gate = (root, data) => root.traverse(o => { if (!o.isMesh) return; o.castShadow = true; clickable(list, o, data); const rc = o.raycast; o.raycast = function (ray, out) { if (root.visible) rc.call(this, ray, out); }; });
      // the trainees: blocky low-poly figures in the troupe's practice kit, yellow T-shirts and black kung fu trousers
      const SKIN = [0xe8b890, 0xd8a47a, 0xc89068, 0xf0c4a0], HAIR = 0x221a16, INK = 0x2a1c18, SHIRT = 0xf2c230, PANTS = 0x1c1c22, r = rng(2027);
      const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, c, h, n = 7) => new THREE.CylinderGeometry(a, c, h, n);
      const trainee = (armsUp) => {
        const skin = SKIN[(r() * SKIN.length) | 0], y = 1.45;
        const p = [[box(.13, .8, .13), PANTS, -.08, .4, 0], [box(.13, .8, .13), PANTS, .08, .4, 0], [box(.13, .06, .24), 0x101014, -.08, .03, .04], [box(.13, .06, .24), 0x101014, .08, .03, .04],
                   [cyl(.155, .165, .5), SHIRT, 0, 1.02, 0], [box(.34, .07, .3), 0xc0221a, 0, .8, 0], [cyl(.05, .05, .07, 6), skin, 0, 1.3, 0],   // a red sash
                   [box(.25, .27, .24), skin, 0, y, 0], [box(.035, .045, .012), INK, -.055, y + .015, .122], [box(.035, .045, .012), INK, .055, y + .015, .122],
                   [box(.07, .014, .01), 0x8a3a30, 0, y - .055, .122], [box(.27, .07, .26), HAIR, 0, y + .15, -.005], [box(.27, .17, .07), HAIR, 0, y + .065, -.1]];
        if (armsUp === "fwd") [-1, 1].forEach(sd => p.push([box(.08, .5, .08).rotateX(-1.4), skin, sd * .19, 1.2, .22], [box(.1, .1, .12), SHIRT, sd * .19, 1.24, 0]));   // both hands out in front
        else if (armsUp) [-1, 1].forEach(sd => p.push([box(.08, .55, .08).rotateZ(sd * .3), skin, sd * .13, 1.52, .06], [box(.1, .1, .12), SHIRT, sd * .19, 1.24, 0], [box(.08, .08, .08), skin, sd * .05, 1.79, .07]));   // both hands up on the pole
        return new THREE.Mesh(lowPoly(p), folkM);
      };

      /* the dragon (舞龍): red with gold scales, a gold-horned head with a snapping jaw and white beard, chasing a pearl */
      const DR = { run: 1.8, H: 2.35, A: .5, wave: 3, gap: .28, n: 44, poles: 9, apart: 1.35 };   // speed (m/s), body height and wave (m), wave speed (rad/s), segment spacing (m), segments, poles, pole spacing (m)
      const dragon = new THREE.Group(); T.add(dragon);
      const dData = { tip: "Dragon dance practice · 舞龍", toast: "The temple's dragon team training for Chinese New Year (春節): nine dancers on poles follow the pearl, rolling the dragon's long body in waves round the ground to the drum. They practise from 6 to 9 in the morning and from 9 to 10 at night in the weeks before the New Year, when the dragon dances through the town for good fortune." };
      // a figure of eight over the ground, measured along its length so the body keeps its spacing
      const NP = 400, pts = [], cum = [0];
      for (let i = 0; i <= NP; i++) { const u = i / NP * TAU; pts.push([4.6 * Math.sin(u), 2.9 * Math.sin(2 * u) + .6]); if (i) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); }
      const LEN = cum[NP];
      const along = s => {
        s = ((s % LEN) + LEN) % LEN; let lo = 0, hi = NP;
        while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; }
        const f = (s - cum[lo]) / (cum[hi] - cum[lo] || 1); return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f];
      };
      const scaleT = canvasTex(128, (c, s) => {
        c.fillStyle = "#b81c16"; c.fillRect(0, 0, s, s); c.strokeStyle = "#f0c040"; c.lineWidth = 3;
        for (let y = 0; y < s + 16; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < s + 16; x += 16) { c.beginPath(); c.arc(x, y, 8, 0, Math.PI); c.stroke(); }
      });
      scaleT.wrapS = scaleT.wrapT = THREE.RepeatWrapping; scaleT.repeat.set(3, 2);
      const dRed = mat({ color: lin(0xb81c16), roughness: .5, metalness: .15 }), dScale = mat({ map: scaleT, roughness: .45, metalness: .25 });
      const gold = mat({ color: lin(0xe8b830), roughness: .35, metalness: .7 }), white = mat({ color: 0xf2eee4, roughness: .8 }), black = mat({ color: 0x141010, roughness: .5 });
      const body = new THREE.InstancedMesh(new THREE.SphereGeometry(.3, 12, 8), dScale, DR.n), fins = new THREE.InstancedMesh(new THREE.ConeGeometry(.07, .26, 4), gold, DR.n);
      body.frustumCulled = fins.frustumCulled = false; dragon.add(body, fins);
      // the head, built facing +z
      const head = new THREE.Group(); head.rotation.order = "YXZ"; dragon.add(head);
      mesh(box(.55, .45, .6), dRed, 0, .05, 0, head); mesh(box(.46, .24, .5), dRed, 0, -.02, .5, head); mesh(new THREE.SphereGeometry(.1, 10, 8), gold, 0, .08, .78, head);
      mesh(box(.5, .05, .5), gold, 0, .26, .1, head);
      const jaw = new THREE.Group(); jaw.position.set(0, -.14, .22); head.add(jaw);
      mesh(box(.42, .08, .62).translate(0, 0, .3), dRed, 0, 0, 0, jaw); mesh(box(.36, .05, .04), white, 0, .06, .56, jaw);   // the jaw and its teeth
      [-.12, 0, .12].forEach(x => mesh(new THREE.ConeGeometry(.06, .32, 6).rotateX(Math.PI), white, x, -.18, .35, jaw));   // the beard
      [-1, 1].forEach(sd => {
        mesh(new THREE.SphereGeometry(.1, 10, 8), white, sd * .2, .2, .26, head); mesh(new THREE.SphereGeometry(.05, 8, 6), black, sd * .23, .22, .34, head);
        mesh(box(.2, .05, .08), gold, sd * .2, .33, .26, head);   // brows
        const horn = mesh(new THREE.ConeGeometry(.05, .55, 6), gold, sd * .15, .45, -.2, head); horn.rotation.x = -.9;
        const whisker = mesh(new THREE.CylinderGeometry(.012, .006, .7, 4), gold, sd * .35, -.02, .7, head); whisker.rotation.z = sd * 1.1; whisker.rotation.x = .4;
        for (let i = 0; i < 3; i++) { const m = mesh(new THREE.ConeGeometry(.07, .4, 5), white, sd * (.2 + i * .05), .1 - i * .12, -.32, head); m.rotation.x = -1.2; m.rotation.z = sd * .5; }   // the mane
      });
      const tail = new THREE.Group(); tail.rotation.order = "YXZ"; dragon.add(tail);
      [-.6, 0, .6].forEach(a => { const m = mesh(new THREE.ConeGeometry(.08, .55, 5), gold, 0, 0, 0, tail); m.geometry = m.geometry.clone().rotateX(-Math.PI / 2).translate(0, 0, -.3); m.rotation.y = a * .4; m.rotation.x = -a * .2; });
      // the dancers, each with a pole up to the body, and the pearl bearer running ahead
      const poleG = cyl(.025, .025, 1, 6).translate(0, .5, 0), poleM = mat({ color: lin(0x8a5a2a), roughness: .7 });
      const runners = [];
      for (let k = 0; k <= DR.poles; k++) { const man = trainee(true), pole = new THREE.Mesh(poleG, poleM); dragon.add(man, pole); runners.push({ man, pole, ph: r() * TAU }); }
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(.2, 14, 10), mat({ color: lin(0xf06030), roughness: .3, metalness: .3, emissive: 0x401000 })); dragon.add(pearl);
      mats.pop();   // the pearl keeps its own glow
      gate(dragon, dData);
      const M4 = new THREE.Matrix4(), OFF = new THREE.Matrix4().makeTranslation(0, .3, 0), UP = V(0, 1, 0), pA = V(0, 0, 0), pB = V(0, 0, 0), S3 = V(1, 1, 1);
      const yAt = (s0, s, t) => DR.H + DR.A * Math.sin(t * DR.wave - (s0 - s) * .55);
      const dragonStep = t => {
        const s0 = t * DR.run;
        for (let k = 0; k < DR.n; k++) {
          const s = s0 - k * DR.gap, [x, z] = along(s), [x2, z2] = along(s + .05), rr = k < 28 ? .3 : .3 - (k - 28) / (DR.n - 28) * .2;
          pA.set(x, yAt(s0, s, t), z); pB.set(x2, yAt(s0, s + .05, t), z2);
          M4.lookAt(pA, pB, UP); M4.scale(S3.set(rr / .3, rr / .3, 1.3)); M4.setPosition(pA); body.setMatrixAt(k, M4);
          fins.setMatrixAt(k, M4.multiply(OFF));
        }
        body.instanceMatrix.needsUpdate = fins.instanceMatrix.needsUpdate = true;
        const [hx, hz] = along(s0 + .25), [fx, fz] = along(s0 + .45), hy = yAt(s0, s0, t) + .1;
        head.position.set(hx, hy, hz); head.rotation.y = Math.atan2(fx - hx, fz - hz); head.rotation.x = -.25 * Math.cos(t * DR.wave);   // nodding with the wave
        jaw.rotation.x = .15 + .2 * Math.max(0, Math.sin(t * 2.6));
        const sT = s0 - (DR.n - 1) * DR.gap, [tx, tz] = along(sT), [ux, uz] = along(sT + .1);
        tail.position.set(tx, yAt(s0, sT, t), tz); tail.rotation.y = Math.atan2(ux - tx, uz - tz) + Math.sin(t * 4) * .3;
        runners.forEach((rn, k) => {
          // the pearl bearer (k = 0) leads, weaving; then the head pole under the head and one pole every DR.apart metres
          const s = k === 0 ? s0 + 1.9 : k === 1 ? s0 + .1 : s0 - .3 - (k - 1) * DR.apart, [x, z] = along(s), [x2, z2] = along(s + .1);
          const yaw = Math.atan2(x2 - x, z2 - z), side = k === 0 ? Math.sin(t * 2.2) * .5 : 0, bob = Math.abs(Math.sin(t * 9 + rn.ph)) * .07;
          rn.man.position.set(x + Math.cos(yaw) * side, bob, z - Math.sin(yaw) * side); rn.man.rotation.y = yaw;
          const top = k === 0 ? 2.7 + Math.sin(t * 3.1) * .35 : yAt(s0, s, t) - .2;
          rn.pole.position.set(rn.man.position.x, 1.8 + bob, rn.man.position.z); rn.pole.scale.y = Math.max(.2, top - 1.8 - bob);
          if (k === 0) pearl.position.set(rn.man.position.x, top + .15, rn.man.position.z);
        });
        pearl.rotation.y = t * 3;
      };

      /* two southern lions (醒獅), a red one and a yellow one, each two dancers under a head and a cloth body */
      const lData = { tip: "Lion dance practice · 舞獅", toast: "Two southern lions in training for Chinese New Year, each worked by two dancers: one holds the head, blinking its eyes and snapping its jaw, and one bends under the cloth as the body and tail. They prowl, shake and rear up to the drum and cymbals in kung fu stances. Practice is from 9:30 to 11 in the morning and 6 to 8 in the evening; at New Year the lions visit the shops to pluck the green (採青) for luck." };
      const lionsG = new THREE.Group(); T.add(lionsG);
      const legG = box(.15, .85, .17).translate(0, -.42, 0), cuffG = box(.2, .1, .22), shoeG = box(.15, .06, .24);
      const lion = (coat, trim, cx, dir) => {
        const L = new THREE.Group(); L.rotation.order = "YXZ"; lionsG.add(L);
        const coatM = mat({ color: lin(coat), roughness: .55, metalness: .1 }), trimM = mat({ color: lin(trim), roughness: .4, metalness: .5 });
        const clothT = canvasTex(128, (c, s) => {
          c.fillStyle = "#" + coat.toString(16).padStart(6, "0"); c.fillRect(0, 0, s, s); c.strokeStyle = "#" + trim.toString(16).padStart(6, "0"); c.lineWidth = 3;
          for (let y = 0; y < s + 16; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < s + 16; x += 16) { c.beginPath(); c.arc(x, y, 8, 0, Math.PI); c.stroke(); }
        });
        clothT.wrapS = clothT.wrapT = THREE.RepeatWrapping; clothT.repeat.set(2, 3);
        const cloth = mesh(new THREE.CylinderGeometry(.44, .38, 1.9, 14, 1, true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2), mat({ map: clothT, roughness: .6, side: THREE.DoubleSide }), 0, .85, -.3, L);
        [-1, 1].forEach(sd => mesh(box(.07, .07, 1.9), white, sd * .41, 0, 0, cloth));   // white fur along the cloth's hems
        const tailM = mesh(new THREE.ConeGeometry(.12, .45, 8), coatM, 0, .15, -1.05, cloth); tailM.rotation.x = -Math.PI / 2 - .5;
        mesh(new THREE.SphereGeometry(.09, 8, 6), white, 0, .3, -1.25, cloth);
        // the head, facing +z: a domed head with a mirror on the brow and a single horn, big blinking eyes, fur brows, a snapping jaw
        const H = new THREE.Group(); H.position.set(0, 1.15, .75); L.add(H);
        mesh(new THREE.SphereGeometry(.42, 16, 12), coatM, 0, .1, 0, H).scale.set(1, .85, 1.05);
        mesh(new THREE.TorusGeometry(.4, .05, 6, 18), white, 0, .08, .16, H);
        mesh(new THREE.CylinderGeometry(.08, .08, .02, 16), mat({ color: 0xe8eef2, roughness: .1, metalness: .95 }), 0, .34, .34, H).rotation.x = Math.PI / 2 - .6;   // the mirror
        mesh(new THREE.ConeGeometry(.05, .18, 8), trimM, 0, .47, .18, H).rotation.x = .4;
        mesh(box(.5, .14, .2), coatM, 0, -.05, .36, H); mesh(new THREE.SphereGeometry(.07, 8, 6), trimM, 0, .03, .47, H);
        const eyes = [-1, 1].map(sd => {
          const e = new THREE.Group(); e.position.set(sd * .17, .2, .34); H.add(e);
          mesh(new THREE.SphereGeometry(.09, 10, 8), white, 0, 0, 0, e); mesh(new THREE.SphereGeometry(.045, 8, 6), black, 0, 0, .07, e);
          mesh(box(.2, .06, .08), white, sd * .17, .31, .36, H); mesh(new THREE.ConeGeometry(.07, .16, 5), trimM, sd * .32, .38, 0, H);   // fur brows, ears
          return e;
        });
        const J = new THREE.Group(); J.position.set(0, -.15, .08); H.add(J);
        mesh(box(.46, .08, .42).translate(0, 0, .2), coatM, 0, 0, 0, J); mesh(box(.36, .04, .04), white, 0, .05, .38, J);
        mesh(new THREE.ConeGeometry(.12, .3, 6).rotateX(Math.PI), white, 0, -.15, .3, J);   // the beard
        // four legs: the head dancer in front, the tail dancer behind, in furry lion trousers with white cuffs
        const legs = [[-.12, .45], [.12, .45], [-.12, -.95], [.12, -.95]].map(([x, z]) => {
          const g = new THREE.Group(); g.position.set(x, .85, z); L.add(g);
          mesh(legG, coatM, 0, 0, 0, g); mesh(cuffG, white, 0, -.75, 0, g); mesh(shoeG, black, 0, -.82, .04, g); return g;
        });
        return { L, H, J, cloth, eyes, legs, cx, dir, a: dir > 0 ? 0 : Math.PI, walk: 0 };
      };
      const lions = [lion(0xc0221a, 0xe8b830, -3.1, 1), lion(0xe8b020, 0xc0221a, 3.1, -1)];
      gate(lionsG, lData);
      const lionsStep = (dt, t) => lions.forEach((n, i) => {
        // every nine seconds a lion stops, looks round and rears up high, then prowls on round its circle
        const p = (t / 9 + i * .5) % 1, still = p > .6 && p < .88, rear = still ? Math.sin(Math.PI * (p - .6) / .28) : 0;
        n.a += dt * (still ? 0 : .38) * n.dir; n.walk += dt * (still ? 0 : 6.5);
        const R = 2.2, x = n.cx + Math.cos(n.a) * R, z = .3 + Math.sin(n.a) * R;
        n.L.position.set(x, Math.abs(Math.sin(n.walk)) * .04, z); n.L.rotation.y = Math.atan2(-Math.sin(n.a) * n.dir, Math.cos(n.a) * n.dir);
        n.H.position.y = 1.15 + rear * .85; n.H.position.z = .75 + rear * .1;
        n.H.rotation.y = Math.sin(t * 1.7 + i * 2) * .35 * (1 - rear * .5); n.H.rotation.x = Math.sin(t * 2.3 + i) * .12 - rear * .35; n.H.rotation.z = Math.sin(t * 3.1 + i) * .1;
        n.cloth.rotation.x = -rear * .28;
        n.J.rotation.x = .1 + .3 * Math.max(0, Math.sin(t * 4.5 + i * 1.7));
        const blink = (t * .45 + i * .3) % 1 < .04 ? .1 : 1; n.eyes.forEach(e => e.scale.y = blink);
        n.legs.forEach((g, k) => g.rotation.x = Math.sin(n.walk + (k < 2 ? 0 : Math.PI / 2) + (k % 2) * Math.PI) * .45);
      });

      /* the big lion drum on its stand at the front of the platform, always there, and the drummer and cymbal player at practice */
      const DX = -4.4, DZ = -D / 2 + 1.25;
      const drumT = canvasTex(64, (c, s) => { c.fillStyle = "#e8d8b0"; c.fillRect(0, 0, s, s); c.strokeStyle = "#a83020"; c.lineWidth = 4; c.beginPath(); c.arc(s / 2, s / 2, s * .3, 0, TAU); c.stroke(); });
      mesh(new THREE.CylinderGeometry(.42, .42, .5, 20), [mat({ color: lin(0xb81c16), roughness: .45 }), mat({ map: drumT, roughness: .7 }), mat({ map: drumT, roughness: .7 })], DX, .85, DZ, T);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, c]) => mesh(box(.06, .6, .06), poleM, DX + a * .3, .3, DZ + c * .3, T));
      mesh(new THREE.TorusGeometry(.42, .03, 6, 24), gold, DX, 1.07, DZ, T).rotation.x = Math.PI / 2;
      const crew = new THREE.Group(); T.add(crew);
      const drummer = trainee(false); drummer.position.set(DX, 0, DZ - .62); crew.add(drummer);
      const stickArm = sd => {
        const a = new THREE.Group(); a.position.set(DX + sd * .19, 1.25, DZ - .62); crew.add(a);
        mesh(box(.08, .45, .08).translate(0, -.22, 0), mat({ color: lin(0xd8a47a), roughness: .7 }), 0, 0, 0, a);
        mesh(cyl(.015, .015, .42, 5).translate(0, -.2, 0), poleM, 0, -.45, 0, a).rotation.x = -1.2;
        return a;
      };
      const sticks = [stickArm(-1), stickArm(1)];
      const cymbal = trainee("fwd"); cymbal.position.set(DX + 1.3, 0, DZ - .5); crew.add(cymbal);
      const discG = cyl(.17, .17, .02, 16).rotateZ(Math.PI / 2), brass = mat({ color: lin(0xd0a040), roughness: .25, metalness: .85 });
      const discs = [-1, 1].map(() => mesh(discG, brass, DX + 1.3, 1.22, DZ - .02, crew));
      gate(crew, { tip: "The drum and cymbals · 鑼鼓", toast: "The big lion drum and the cymbals lead the practice: the dancers move to the drummer's beat, and he changes the rhythm to call each step, the prowl, the shake, the leap." });
      const crewStep = t => {
        sticks.forEach((a, k) => a.rotation.x = -.9 - .5 * Math.pow(.5 + .5 * Math.sin(t * TAU * 1.6 + k * Math.PI), 3));
        const gap = .03 + .22 * Math.abs(Math.sin(t * TAU * .8)); discs.forEach((d, k) => d.position.x = DX + 1.3 + (k ? gap : -gap));
      };
      let t = 0;
      return (dt, motion) => {
        const show = FOLK.drill;
        dragon.visible = show === "dragon"; lionsG.visible = show === "lion"; crew.visible = !!show;
        if (!show) return;
        t += dt * motion;
        crewStep(t);
        if (show === "dragon") dragonStep(t); else lionsStep(dt * motion, t);
      };
    }
    trainingGround(21, -1, 16, 12);
    shanTown(g);
    sevenDayMarket(g);
    foodStreet(g);   // Shan and Chinese food stalls between the temple's east wall and the market
    morningMarket(g);   // villagers selling on the ground there, 5–9 am
    shanStupaHill(g);
    shanMonasteries(g);
    hawKham(g, 16, 204, Math.PI);   // the saopha's palace, east of the stupa hill's foot, its back and the council's compound toward the town
    townLibrary(g);   // the public library across the market lane from the palace's east wall, facing it
    townBank(g);   // the bank, south of the library on the same side of the lane, facing the palace too
    streetFrontage(g);
    backStreets(g);
    hillFootpath(g);
    hospitalLane(g);
    hospitalRoadHouses(g);
    hospital(g);
    footballGround(g);
    highSchool(g);
    bambooGrove(g);
    hillFootBamboo(g);
    fuelStation(g);
    fireAndPolice(g);
    welcomeSign(g);
    halloweenGhost(g);
    townsfolk(g);
    // beatOfficer(g);   // the beat officer is commented out (see the main script)
    // 溪, the stream behind the compound: it winds across the land beyond the pines on the far side of the back wall,
    // between grassy banks edged with stones, with rocks, reeds and a stone slab bridge; the water flows to the east
    (function stream() {
      const X0 = -110, X1 = 110, N = 120, W = 3.2, zAt = x => -30 + Math.sin(x * .045) * 3.2 + Math.sin(x * .11 + 1) * 1.1;
      const ribbon = (half, y) => {
        const pos = [], uv = [], idx = [];
        for (let i = 0; i <= N; i++) {
          const x = X0 + (X1 - X0) * i / N, z = zAt(x), dz = (zAt(x + .5) - zAt(x - .5)), len = Math.hypot(1, dz), nx = -dz / len, nz = 1 / len;
          pos.push(x + nx * half, y, z + nz * half, x - nx * half, y, z - nz * half); uv.push(x / 6, 1, x / 6, 0);
          if (i < N) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
        }
        const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        geo.setIndex(idx); geo.computeVertexNormals(); return geo;
      };
      const grass = std({ color: 0x3e5a2c, roughness: 1 });
      onDaylight(d => grass.color.copy(lerpC(0x1e2a16, 0x4a6a32, d)));
      flat(mesh(ribbon(W / 2 + 2.6, .02), grass, 0, 0, 0, g));                          // grassy banks
      flat(mesh(ribbon(W / 2 + .35, .03), std({ color: 0x5a5046, roughness: .95 }), 0, 0, 0, g));   // the muddy edge
      flat(mesh(ribbon(W / 2, .035), std({ color: 0x14302a, roughness: 1 }), 0, 0, 0, g));          // the bed
      const flowTex = canvasTex(128, (c, sz) => {
        c.fillStyle = "#1f5a64"; c.fillRect(0, 0, sz, sz);
        for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(200,230,240,${.08 + (i % 3) * .05})`; c.lineWidth = 2; const y = (i * 37) % sz, x = (i * 53) % sz; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 26, y + 2); c.stroke(); }
      });
      flowTex.wrapS = flowTex.wrapT = THREE.RepeatWrapping;
      const water = flat(mesh(ribbon(W / 2, .09), std({ map: flowTex, color: 0x9fd0d8, metalness: .2, roughness: .12, transparent: true, opacity: .8, depthWrite: false }), 0, 0, 0, g));
      updaters.pagoda.push((dt, t, motion) => { flowTex.offset.x -= dt * .12 * (motion || .3); });
      // stones along both edges and a few rocks in the water
      const rs = rng(91), stones = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.3, 0), std({ color: 0x7a746a, roughness: .9, flatShading: true }), 260), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
      let k = 0;
      for (let x = X0; x < X1 && k < 250; x += .9 + rs() * .8) [-1, 1].forEach(sd => {
        if (k >= 250) return;
        const z = zAt(x) + sd * (W / 2 + .15 + rs() * .3), sc = .5 + rs() * .9;
        stones.setMatrixAt(k++, m4.compose(V(x, .06, z), q.setFromEuler(new THREE.Euler(rs() * 3, rs() * 3, 0)), V(sc, sc * .6, sc)));
      });
      for (let i = 0; i < 10 && k < 260; i++) { const x = X0 + 15 + rs() * (X1 - X0 - 30), sc = 1.2 + rs(); stones.setMatrixAt(k++, m4.compose(V(x, .1, zAt(x) + (rs() - .5) * W * .6), q.setFromEuler(new THREE.Euler(rs(), rs() * 3, 0)), V(sc, sc * .7, sc))); }
      stones.count = k; g.add(stones);
      // clumps of reeds on the banks
      const reedMat = std({ color: 0x6f8a3a, roughness: .9 }), reedGeo = new THREE.ConeGeometry(.03, 1.2, 4);
      const reeds = new THREE.InstancedMesh(reedGeo, reedMat, 400); k = 0;
      for (let c = 0; c < 40; c++) {
        const x = X0 + 10 + rs() * (X1 - X0 - 20), sd = rs() < .5 ? -1 : 1, z = zAt(x) + sd * (W / 2 + .5 + rs() * .6);
        for (let j = 0; j < 10; j++) reeds.setMatrixAt(k++, m4.compose(V(x + (rs() - .5) * .8, .6, z + (rs() - .5) * .5), q.setFromEuler(new THREE.Euler((rs() - .5) * .3, 0, (rs() - .5) * .3)), V(1, .7 + rs() * .6, 1)));
      }
      reeds.count = k; g.add(reeds);
      // 拱橋, an arched stone bridge over the stream behind the middle of the back wall, with carved parapets and lotus-topped posts
      const bz = zAt(0), granite = std({ color: 0x8c877d, roughness: .8 }), BL = W + 5, BH = 1.1, BW = 2.4, NS = 18;
      const deck = t => ({ z: bz + BL / 2 - t * BL, y: .1 + Math.sin(Math.PI * t) * BH });   // runs from the compound side (t = 0) to the far bank
      for (let i = 0; i < NS; i++) {
        const t0 = i / NS, t1 = (i + 1) / NS, a0 = deck(t0), a1 = deck(t1), len = Math.hypot(a1.z - a0.z, a1.y - a0.y);
        const slab = mesh(new THREE.BoxGeometry(BW, .22, len + .04), granite, 0, (a0.y + a1.y) / 2, (a0.z + a1.z) / 2, g);
        slab.rotation.x = Math.atan2(a1.y - a0.y, -(a1.z - a0.z));
      }
      // open underneath: two thin stone arch ribs carry the deck from bank to bank, with abutments on each bank
      [-1, 1].forEach(sx => {
        const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24, d = deck(t); pts.push(V(sx * (BW / 2 - .15), d.y - .2 - .25 * Math.sin(Math.PI * t), d.z)); }
        mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .12, 8), granite, 0, 0, 0, g);
      });
      [1, -1].forEach(e => mesh(new THREE.BoxGeometry(BW + .2, .5, .9), granite, 0, .2, bz + e * (BL / 2 - .2), g));
      [-1, 1].forEach(sx => {   // parapets: a rail on posts, lotus buds on top
        const rail = []; for (let i = 0; i <= 24; i++) { const d = deck(i / 24); rail.push(V(sx * (BW / 2 - .08), d.y + .62, d.z)); }
        mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rail), 48, .07, 6), granite, 0, 0, 0, g);
        for (let i = 0; i <= 8; i++) {
          const d = deck(i / 8);
          mesh(new THREE.BoxGeometry(.18, .7, .18), granite, sx * (BW / 2 - .08), d.y + .4, d.z, g);
          mesh(new THREE.SphereGeometry(.12, 10, 8), granite, sx * (BW / 2 - .08), d.y + .82, d.z, g);
        }
      });
      // the path from the bridge up to the back gate, and on inside to the pagoda's deck
      flat(mesh(new THREE.BoxGeometry(2.6, .05, -16 - (bz + BL / 2)), M.stone, 0, .03, (bz + BL / 2 - 16) / 2, g));
      flat(mesh(new THREE.BoxGeometry(2.6, .05, 6.4), M.stone, 0, .03, -12.7, g));   // from the back gate to the foot of the pagoda's river-side stair
      // 後山門, the back gate: red pillars on stone bases, a painted beam, the name board and a small tiled roof
      const GZ = -16, GW = 5.0, GH = 3.8;
      [-1, 1].forEach(sx => {
        mesh(new THREE.BoxGeometry(.8, .4, .8), M.stone, sx * GW / 2, .2, GZ, g);
        mesh(new THREE.CylinderGeometry(.22, .25, GH, 14), pillarRed, sx * GW / 2, .4 + GH / 2, GZ, g);
      });
      mesh(new THREE.BoxGeometry(GW + .6, .45, .4), beamMat, 0, .4 + GH - .25, GZ, g);
      mesh(new THREE.BoxGeometry(GW + .8, .2, .5), pillarRed, 0, .4 + GH + .1, GZ, g);
      tiledHipRoof(g, 0, GZ, .4 + GH + .2, GW / 2 + 1.1, 1.3, 1.2, .35, [0, .1, .2, .3, .4, .5, .6, .7, .8, .88, .93], .7);
      const gateBoard = writing(512, 160, (c, cw, ch) => {
        c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(96); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("後山門", cw / 2, ch / 2 + 6);
      });
      const gb = flat(mesh(new THREE.PlaneGeometry(1.8, .56), new THREE.MeshStandardMaterial({ map: gateBoard, roughness: .6, emissive: 0x222222, emissiveMap: gateBoard }), 0, .4 + GH - .85, GZ - .22, g));
      gb.rotation.y = Math.PI;   // the board faces the river
      [-1, 1].forEach(sx => lantern(g, sx * 1.3, 2.9, GZ - .1, .4 + GH - .5, .8));
      // 石獅, a pair of stone guardian lions on plinths either side of the gate, facing the river,
      // mirrored like the pair at the front gate so each has its paw on the inner side
      [["lionL", -3.3], ["lion", 3.3]].forEach(([fig, x]) => {
        mesh(new THREE.BoxGeometry(1.7, .7, 2.0), granite, x, .35, GZ - 2.4, g);
        mesh(new THREE.BoxGeometry(1.85, .1, 2.15), M.stone, x, .72, GZ - 2.4, g);
        const lg = new THREE.Group(); lg.position.set(x, .77, GZ - 2.4); lg.rotation.y = Math.PI; lg.scale.setScalar(1.15); g.add(lg);
        sculptFigure(fig, lg, "the guardian lions");
      });
    })();
    templeGrounds(g);
    // festival strings: from each corner of the ground storey's roof out to a lantern post round the plaza (higher up they would pass through this roof)
    const post = (x, z, h) => {
      sCircle(g, x, z, .2);
      mesh(new THREE.CylinderGeometry(.12, .16, h, 10), M.lacquer, x, h / 2, z, g);
      mesh(new THREE.BoxGeometry(.5, .08, .5), M.trim, x, h, z, g);
      const l = flat(mesh(lanternGeo, lanternMat, x, h + .5, z, g)); l.scale.set(1.5, 1.8, 1.5);
      const gl = lanternGlow(0xff6a2a, 3.2, .55); gl.position.set(x, h + .5, z); g.add(gl);
      return V(x, h + .1, z);
    };
    const strings = eaveCorners.map(a => {
      const d = V(a.x, 0, a.z).normalize();
      return { a, b: post(d.x * 16, d.z * 16, 4), count: 10, sag: 1.6 };
    });
    lanternStrings(g, strings, 1.5);
    // the approach: gate, lion guardians, a stone path and the lotus pond crossed by the bridge
    const POND = { z: 26.6, r: 10 }, GATE_Z = 43;
    outdoorPond(g, 0, POND.z, POND.r);
    [[10.2, POND.z - POND.r - 1.2], [POND.z + POND.r + 1.2, GATE_Z + 7]].forEach(([a, b]) =>
      flat(mesh(new THREE.BoxGeometry(3, .06, b - a), M.stone, 0, .03, (a + b) / 2, g)));
    gate(g, GATE_Z);
    // stone roads tying the buildings together: from the main path to the temple hall's forecourt,
    // and along the inside of the front wall from the gate to the hall's forecourt
    flat(mesh(new THREE.BoxGeometry(13.6, .06, 2.6), M.stone, 8.25, .03, 12.9, g));      // to the temple hall, and on to the training ground's road
    flat(mesh(new THREE.BoxGeometry(2.6, .06, 7.8), M.stone, 15, .03, 8.9, g));           // up into the training ground
    flat(mesh(new THREE.BoxGeometry(5.6, .06, 2.4), M.stone, 10.2, .03, -1, g));          // from the pagoda deck to the training ground
    flat(mesh(new THREE.BoxGeometry(12.7, .06, 1.6), M.stone, 11.55, .03, 41.4, g));
    // on the left: the same two cross roads, a road along the front of the shop and quarters, and a path out to the pavilion
    flat(mesh(new THREE.BoxGeometry(16.7, .06, 2.6), M.stone, -9.85, .03, 12.9, g));
    flat(mesh(new THREE.BoxGeometry(14.3, .06, 1.6), M.stone, -12.35, .03, 41.4, g));
    // the Bell Tower road: straight down from the tower's steps, past the shop, to the front wall, kerbed and lamplit
    const KX = -17, Z0 = 2.4, Z1 = 42.2, RW = 2.8;
    flat(mesh(new THREE.BoxGeometry(RW, .06, Z1 - Z0), M.stone, KX, .03, (Z0 + Z1) / 2, g));
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.16, .12, Z1 - Z0), std({ color: 0x8a847a, roughness: .8 }), KX + sd * (RW / 2 + .08), .06, (Z0 + Z1) / 2, g));
    for (let z = 8; z <= 38; z += 7.5) [-1, 1].forEach(sd => {   // stone lanterns (石燈籠) along both sides, none on the shop's forecourt
      if (sd < 0 && z > 18 && z < 36) return;
      const x = KX + sd * (RW / 2 + .7);
      mesh(new THREE.BoxGeometry(.5, .2, .5), M.stone, x, .1, z, g);
      sCircle(g, x, z, .3);
      mesh(new THREE.CylinderGeometry(.09, .12, .9, 8), M.stone, x, .65, z, g);
      mesh(new THREE.BoxGeometry(.46, .38, .46), lampPane(0xffa040, .9), x, 1.29, z, g);
      const cap = mesh(new THREE.ConeGeometry(.42, .3, 4), M.stone, x, 1.63, z, g); cap.rotation.y = Math.PI / 4;
      const gl = lanternGlow(0xffa050, 1.4, .6); gl.position.set(x, 1.29, z); g.add(gl);
    });
    flat(mesh(new THREE.BoxGeometry(3.0, .06, 16), M.stone, -19.9, .03, 27, g));          // the shop's forecourt, meeting the road
    flat(mesh(new THREE.BoxGeometry(3.3, .06, 1.8), M.stone, -14.0, .03, 26, g));         // out to the lotus pavilion
    [11.4, POND.z + POND.r + 1.6, GATE_Z - 2].forEach(z => [-2.6, 2.6].forEach(x => post(x, z, 2.6)));
    lanternStrings(g, [-2.6, 2.6].map(x => ({ a: V(x, 2.7, 11.4), b: V(x, 2.7, POND.z + POND.r + 1.6), count: 14, sag: .4 })), 1);
    lanternStrings(g, [-2.6, 2.6].map(x => ({ a: V(x, 2.7, POND.z + POND.r + 1.6), b: V(x, 2.7, GATE_Z - 2), count: 5, sag: .3 })), 1);
    // a pointed tiled roof over the top storey, then the gilt spire on a red drum
    tiledEave(g, y - .2, .08, 4.6 - (FLOORS.length - 1) * .42 + .9, 1.9, .35);
    const top = new THREE.Group(); top.position.y = y + 1.3; g.add(top);
    oct(mesh(new THREE.CylinderGeometry(.42, .5, .5, 8), pillarRed, 0, .25, 0, top));
    mesh(new THREE.CylinderGeometry(.07, .1, 3.2, 12), M.gold, 0, 2.1, 0, top);
    for (let i = 0; i < 7; i++) { const t = mesh(new THREE.TorusGeometry(.4 - i * .04, .06, 8, 32), M.gold, 0, .75 + i * .32, 0, top); t.rotation.x = Math.PI / 2; }
    mesh(new THREE.ConeGeometry(.16, 1.4, 12), M.gold, 0, 3.6, 0, top);
    const hemi = new THREE.HemisphereLight(0x6f78c8, 0x2a1408, .55); g.add(hemi);
    const moonLight = new THREE.DirectionalLight(0xb8c4ff, .7); moonLight.position.set(-30, 50, 40); g.add(moonLight);
    const sunLight = new THREE.DirectionalLight(0xfff0d8, 0); sunLight.position.set(35, 60, -30); g.add(sunLight);
    const lights = () => {
      const d = daylight, m = celestial.moonNight;
      // on Halloween night, once the houses are dark, the town gives off no glow: the sky's fill light all but goes,
      // the moonlight thins and the roads fall dark between the street lamps
      const dark = (1 - d) * FEST.out;
      hemi.color.copy(lerpC(0x6f78c8, 0xc8dcff, d)); hemi.groundColor.copy(lerpC(0x2a1408, 0x5a4a34, d));
      hemi.intensity = (.55 + .25 * d) * (1 - .8 * dark);
      sunLight.position.copy(celestial.sun).multiplyScalar(80);
      const moonUp = m && m.up;
      if (moonUp) moonLight.position.copy(m.dir).multiplyScalar(80);
      // moonlight scales with how much of the moon is lit and whether it is up; starlight keeps a little
      moonLight.intensity = (1 - d) * (moonUp ? .25 + .6 * celestial.fraction : .15) * (1 - .55 * dark);
      sunLight.intensity = 1.5 * d * clamp(celestial.sun.y * 2.5, .35, 1);
    };
    onDaylight(lights); onCelestial(lights);
    const warm = new THREE.SpotLight(0xffb070, 1.6, 70, .5, .7, 1); warm.position.set(14, 4, 24); warm.target.position.set(0, 10, 0); g.add(warm, warm.target);
    dayLight(warm, [0xffb070, 1.6], [0xffb070, 0]);   // the floodlight is off by day
    const door = new THREE.PointLight(0xffa050, 2, 14, 2); door.position.set(0, DECK + 2.5, 8); g.add(door);
    updaters.pagoda.push((dt, t) => storeys.forEach(s => s.winMat.emissiveIntensity = s.base * (hovered && hovered.userData.floor === s.f ? 2.2 : 1) + Math.sin(t * 1.3 + s.f) * .05));
    bakeParts(g);
    indexCull(g);
    return g;
  }

