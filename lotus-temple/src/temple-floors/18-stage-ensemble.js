    /* ---------- the ensemble at the sides of the stage, Shan musicians in Shan dress, tan jackets, baggy tan trousers and headcloths: the
       two long drums on the left, the row of gongs and the cymbals on the right. The dancers keep to them: every bar opens
       on the drum's deep stroke and the gongs, on which the kinnara lands from a hop ---------- */
    const tanTop = std({ color: lin(0xd8a878), roughness: .8 }), tanLow = std({ color: lin(0xc89868), roughness: .85 });   // the Shan jacket and baggy trousers all the players wear
    const bronze = std({ color: lin(0xc89a50), roughness: .35, metalness: .45 }), brass = std({ color: lin(0xe8c060), roughness: .3, metalness: .45 }), teakM = std({ color: 0x43200f, roughness: .7 });
    // a musician standing (or, with `sit`, sitting on a low white stool) at (x, z) on the stage, turned by ry, in a headcloth of
    // colour `cloth`; arm(sd) makes a jointed arm (sd −1 his right, he faces +z) whose hand the instrument fills in at the elbow
    // group's −0.28. B is all of him above the legs, so a sitting player can sway at the waist
    const musician = (x, z, ry, cloth, sit, suit) => {
      const D = new THREE.Group(); D.position.set(x, C.y, z); D.rotation.y = ry; G.add(D);
      const [jacket, trousers] = suit || [tanTop, tanLow];   // his jacket and trousers
      const B = new THREE.Group(), clothM = std({ color: lin(cloth), roughness: .7 }); D.add(B);
      if (sit) {
        B.position.y = -.4;   // down on the stool
        mesh(new THREE.BoxGeometry(.3, .34, .3), std({ color: lin(0xf0f0ea), roughness: .5 }), 0, .17, -.02, D);
        [-1, 1].forEach(sd => { mesh(new THREE.CylinderGeometry(.1, .11, .42, 10), trousers, sd * .11, .44, .17, D).rotation.x = Math.PI / 2; mesh(new THREE.CylinderGeometry(.085, .1, .42, 10), trousers, sd * .11, .23, .36, D); mesh(new THREE.BoxGeometry(.09, .04, .2), skin, sd * .11, .02, .41, D); });   // thighs out level, shins down
      } else [-1, 1].forEach(sd => { mesh(new THREE.CylinderGeometry(.11, .15, .8, 10), trousers, sd * .11, .42, 0, B); mesh(new THREE.BoxGeometry(.09, .04, .2), skin, sd * .11, .02, .05, B); });
      mesh(new THREE.CylinderGeometry(.17, .16, .52, 12), jacket, 0, 1.08, 0, B);
      mesh(new THREE.CylinderGeometry(.045, .05, .1, 10), skin, 0, 1.37, 0, B);
      const hd = new THREE.Group(); hd.position.y = 1.5; B.add(hd);
      mesh(new THREE.SphereGeometry(.115, 14, 10), skin, 0, 0, 0, hd).scale.set(.95, 1.1, 1);
      [-1, 1].forEach(sd => mesh(new THREE.SphereGeometry(.016, 8, 6), ink, sd * .042, .02, .1, hd));
      mesh(new THREE.CylinderGeometry(.125, .12, .1, 14), clothM, 0, .08, 0, hd);   // the headcloth wound round
      mesh(new THREE.SphereGeometry(.05, 8, 6), clothM, .1, .1, -.03, hd);   // its knot over the ear
      const arm = sd => {
        const a = new THREE.Group(); a.position.set(sd * .2, 1.28, 0); B.add(a);
        mesh(new THREE.CylinderGeometry(.05, .045, .27, 8), jacket, 0, -.135, 0, a);
        const e = new THREE.Group(); e.position.y = -.27; a.add(e);
        mesh(new THREE.CylinderGeometry(.044, .036, .24, 8), jacket, 0, -.12, 0, e);
        return { a, e, sd, age: 9 };
      };
      return { D, B, hd, arm };
    };
    // shown only while the dancers are on, and only then clickable
    const gateOn = (D, info) => D.traverse(o => { if (o.isMesh) { o.castShadow = true; clickable(list, o, info); o.raycast = function (ray, out) { if (D.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); }; } });
    // a stroke's hand: down on the instrument in 0.07 s (the sound waits for it), then back up over 0.4 s, 0 down to 1 raised
    const lifted = age => age < .07 ? 1 - age / .07 : Math.min(1, (age - .07) / .4) ** .7;
    // the pose that brings `tip` (a hand, a beater's head) closest to point T in `root`'s frame: set(...v) poses the body, and
    // grid gives each value's [from, to, step]; every combination is tried, then finer and finer steps round the best. Worked
    // out once at build time, walking only the joints between tip and root. Returns [miss, ...v]
    const fit = (root, tip, T, set, grid) => {
      const p = new THREE.Vector3(); let best = [1e9];
      const at = v => { set(...v); p.set(0, 0, 0); for (let o = tip; o !== root; o = o.parent) { o.updateMatrix(); p.applyMatrix4(o.matrix); } const d = p.distanceTo(T); if (d < best[0]) best = [d, ...v]; };
      const span = (a, b, st) => { const out = []; for (let x = a; x <= b + 1e-9; x += st) out.push(x); return out; };
      const all = (axes, i, v) => i === axes.length ? at(v) : axes[i].forEach(x => all(axes, i + 1, [...v, x]));
      all(grid.map(([a, b, st]) => span(a, b, st)), 0, []);
      for (let w = .5; w > .1; w /= 2) { const b0 = best.slice(1); all(grid.map(([, , st], i) => span(b0[i] - st * w, b0[i] + st * w, st * w / 2)), 0, []); }
      return best;
    };

    /* the long drums, ၵွင်ယၢဝ်း (kawng yao), at the left of the stage: two drummers side by side in tan jackets and baggy Shan
       trousers, each with his own drum slung from the shoulder. A long drum is a slender wooden drum about as long as a man is
       tall; its one head, blackened with a tuning patch of rice paste and ringed in gold and black, rides at his waist, and its
       body runs down past his left leg to the flared tail on the ground behind him. Under the head it wears a skirt of ruffled
       cloth, yellow, green and red. Each strikes the head's centre with his right fist for the deep note, and rings the open
       stroke near the rim or slaps it flat with his left hand; the first leads, the second answers and fills in */
    const drumT = canvasTex(64, (c, sz) => { c.fillStyle = "#6a3018"; c.fillRect(0, 0, sz, sz); c.fillStyle = "#c89040"; [.1, .5, .9].forEach(v => c.fillRect(0, v * sz, sz, 2)); });   // the oiled wooden body
    const headT = canvasTex(128, (c, sz) => {   // the head from before: black and gold rings round a pale ring and the dark rice-paste patch
      const ring = (r, col) => { c.fillStyle = col; c.beginPath(); c.arc(sz / 2, sz / 2, r * sz / 2, 0, TAU); c.fill(); };
      [[1, "#1a1410"], [.9, "#d8a840"], [.8, "#1a1410"], [.72, "#d8a840"], [.66, "#c8b088"], [.5, "#2a1c14"], [.42, "#3a2a20"]].forEach(([r, col]) => ring(r, col));
    });
    const FRILL = [[.17, .27, .1, -.1, 0xf2c820], [.15, .25, .1, -.17, 0x2a9a3a], [.13, .23, .09, -.24, 0xd82a2a]];   // the skirt's tiers: [top radius, hem radius, depth, how far down the drum, colour]
    const DIR = new THREE.Vector3(.45, -.58, -.68).normalize();   // from the head down to the tail, past his left leg (he faces +z)
    const longDrummer = (x, z, ry, cloth) => {
      const m = musician(x, z, ry, cloth, false), { D, hd } = m;
      const arms = { dum: m.arm(-1), tak: m.arm(1) };
      mesh(new THREE.SphereGeometry(.05, 8, 6), skin, 0, -.28, 0, arms.dum.e);   // a fist
      mesh(new THREE.BoxGeometry(.025, .1, .07), skin, 0, -.29, 0, arms.tak.e);   // a flat hand
      // the drum, along its own axis (−y toward the tail)
      const prof = [[.15, 0], [.15, -.05], [.12, -.15], [.07, -.35], [.055, -.6], [.05, -1.2], [.07, -1.42], [.13, -1.6], [.13, -1.64]].map(([r, y]) => new THREE.Vector2(r, y));
      const H = new THREE.Vector3(-.03, .97, .37), drum = new THREE.Group(); drum.position.copy(H); D.add(drum);
      drum.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), DIR);
      mesh(new THREE.LatheGeometry(prof, 16), std({ map: drumT, roughness: .5, side: THREE.DoubleSide }), 0, 0, 0, drum);
      mesh(new THREE.CircleGeometry(.15, 24), std({ map: headT, roughness: .7 }), 0, .002, 0, drum).rotation.x = -Math.PI / 2;
      mesh(new THREE.TorusGeometry(.15, .018, 6, 24), std({ color: lin(0x1a1410), roughness: .5 }), 0, -.01, 0, drum).rotation.x = Math.PI / 2;
      FRILL.forEach(([r0, r1, h, y, col]) => {   // a ruffled hem: the cone's lower edge waved in and out
        const geo = new THREE.CylinderGeometry(r0, r1, h, 32, 1, true), pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) if (pos.getY(i) < 0) { const a = Math.atan2(pos.getZ(i), pos.getX(i)), k = 1 + Math.sin(a * 9) * .08; pos.setX(i, pos.getX(i) * k); pos.setZ(i, pos.getZ(i) * k); }
        geo.computeVertexNormals();
        mesh(geo, std({ color: lin(col), roughness: .6, side: THREE.DoubleSide }), 0, y, 0, drum);
      });
      // the sling, from the drum's neck over his right shoulder
      D.updateMatrixWorld(true);
      const a = D.worldToLocal(drum.localToWorld(new THREE.Vector3(0, -.32, 0))), b = new THREE.Vector3(-.12, 1.36, -.02);
      const sling = mesh(new THREE.CylinderGeometry(.014, .014, a.distanceTo(b), 4), std({ color: lin(0xe8c040), roughness: .8 }), (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, D);
      sling.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      // where each hand lands: the fist just off the head's centre, the flat hand near the rim on his left
      const out = DIR.clone().negate();   // the head's face, toward him and up
      [[arms.dum, H.clone().addScaledVector(out, .055)], [arms.tak, H.clone().add(new THREE.Vector3(.1, 0, 0)).addScaledVector(out, .02)]].forEach(([r, T]) => {
        const tip = r.e.children[r.e.children.length - 1];
        r.pose = fit(D, tip, T, (pitch, side, elbow) => { r.a.rotation.set(-pitch, 0, side); r.e.rotation.x = -elbow; }, [[.1, 1.8, .1], [-.7, .7, .1], [0, 1.8, .15]]);
      });
      let strong = 9;
      const hit = (kind, v) => { arms[kind === "dum" ? "dum" : "tak"].age = 0; if (v > .8) strong = 0; };
      const step = dt => {
        Object.values(arms).forEach(r => { r.age += dt; const up = lifted(r.age) * (r.sd < 0 ? 1 : .7), [, pitch, side, elbow] = r.pose; r.a.rotation.set(-pitch + up * .35, 0, side); r.e.rotation.x = -elbow - up * .9; });
        strong += dt; hd.rotation.x = .15 * Math.exp(-strong * 6);   // a nod on the deep strokes
      };
      return { D, hit, step };
    };
    const drummers = [longDrummer(C.x - 3.45, C.z - 1.05, 1.0, 0xe88a8a), longDrummer(C.x - 3.45, C.z + .15, 1.0, 0xf0f0e8)];
    const info = { tip: "Shan long drums · ၵွင်ယၢဝ်း", toast: "Two kawng yao (ၵွင်ယၢဝ်း), Shan long drums, each slung from its drummer's shoulder: a slender wooden drum about as long as a man is tall, its one head blackened with a tuning patch of rice paste, skirted under the head with ruffled cloth in yellow, green and red. The drummers strike with the fist in the centre for the deep, booming note, and with the hand near the rim for the ringing open note or flat for the slap; the first leads and the second answers. They lead the ensemble for the ka nok, with the row of gongs (မွင်း) and the cymbals; the kinnara steps and lands on their deep stroke." };
    drummers.forEach(d => gateOn(d.D, info));

    /* the gongs (မွင်း), at the front right of the stage, facing the crowd: five bronze bossed gongs, graduated from the largest
       and deepest to the smallest, in a painted case as the Shan make them: a low standing case leaning a little back, yellow posts
       and rails, red dividers between the gongs, a blue back, and a red crest board painted with gilt scrolls and flowers round the
       Shan flag. One player strikes all five at once: a yellow padded beater hangs on a red arm before each gong, all the arms
       joined by a red rod along the front; he sits on a stool at the big gong's end, holding the rod's end, and pushes it so every
       beater swings in together, and the five gongs sound as one chord */
    const GONGS = [[.165, 131, .12], [.15, 196, .17], [.135, 262, 1], [.12, 394, .45], [.105, 782, .06]];   // [radius (m), pitch (Hz), loudness in the chord], largest first; as in a recording of a Shan oh-zi ensemble, near C3 G3 C4 G4 G5, the C4 gong ringing out most
    const gonger = (() => {
      const yellow = std({ color: lin(0xf0c020), roughness: .6 }), blue = std({ color: lin(0x3a8ad0), roughness: .7 }), lacq = std({ color: lin(0xd02a22), roughness: .5 }), pom = std({ color: lin(0xf4e040), roughness: .9 });
      const darkBronze = std({ color: lin(0x6a5a40), roughness: .45, metalness: .35 });
      const gap = .035, wid = GONGS.map(([rad]) => 2 * rad + gap), L = wid.reduce((a, b) => a + b, 0) + gap, TOP = .66;
      const FX = C.x + 2.85, FZ = C.z + 1.45;   // the case's middle on the stage
      // the case: its own frame has the gongs' faces toward −z and the big gong at −x; turned round so they face the crowd and
      // the big gong is at the stage's edge
      const F = new THREE.Group(); F.position.set(FX, C.y, FZ); F.rotation.y = Math.PI; G.add(F);
      const Fl = new THREE.Group(); Fl.rotation.x = .14; F.add(Fl);   // leaning back
      const xs = []; { let x = -L / 2 + gap / 2; wid.forEach(w_ => { xs.push(x + w_ / 2); x += w_; }); }   // the bays' centres, largest first
      // the crest board, painted: drawn squeezed across so it lands right on a board ten times as long as it is high
      const crest = canvasTex(512, (c, sz) => {
        const U = sz / 10, ell = (u, v, ru, rv, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(u * U, v * sz, ru * U, rv * sz, 0, 0, TAU); c.fill(); };
        c.fillStyle = "#c8221c"; c.fillRect(0, 0, sz, sz); c.fillStyle = "#f0c020"; c.fillRect(0, 0, sz, .07 * sz); c.fillRect(0, .93 * sz, sz, .07 * sz);
        [[0, "#f2c400"], [1 / 3, "#2a9a3a"], [2 / 3, "#d81e1e"]].forEach(([v, col]) => { c.fillStyle = col; c.fillRect(4.35 * U, (.14 + v * .72) * sz, 1.3 * U, .24 * sz + 1); });
        ell(5, .5, .26, .26, "#ffffff");   // the Shan flag: yellow, green and red, the white moon in the middle
        [-1, 1].forEach(sd => {
          [1.0, 2.0, 3.0].forEach((d, i) => { const u = 5 + sd * (.6 + d); ell(u, .5, .42, .32, "#e8b018"); ell(u + sd * .1, .5, .22, .16, i % 2 ? "#ffffff" : "#c8221c"); ell(u - sd * .18, .32, .1, .08, "#e8b018"); });   // gilt scrolls
          [.75, 4.25].forEach(k => { const u = 5 + sd * k; for (let j = 0; j < 6; j++) ell(u + Math.cos(j * TAU / 6) * .1, .5 + Math.sin(j * TAU / 6) * .2, .08, .14, "#f4f0e8"); ell(u, .5, .07, .14, "#d81e1e"); });   // white flowers with red hearts
        });
      });
      const slots = canvasTex(256, (c, sz) => { c.fillStyle = "#f0c020"; c.fillRect(0, 0, sz, sz); c.fillStyle = "#6a3a10"; for (let i = 0; i < 6; i++) c.fillRect((i + .3) * sz / 6, .42 * sz, .4 * sz / 6, .16 * sz); });   // the rail's carved slots
      const box = (w_, h, d, mat, x, y, z) => mesh(new THREE.BoxGeometry(w_, h, d), mat, x, y, z, Fl);
      const crestM = std({ map: crest, roughness: .6 });
      box(L + .08, .2, .04, crestM, 0, TOP + .19, 0).rotation.y = Math.PI;   // the crest board, its painting toward the crowd
      box(L + .1, .07, .07, std({ map: slots, roughness: .6 }), 0, TOP + .055, 0); box(L + .06, .03, .06, lacq, 0, TOP, 0);
      box(L + .1, .05, .1, yellow, 0, .06, 0); box(L, .09, .02, blue, 0, .13, -.035);   // the bottom rail and the blue board over it
      box(L, TOP - .08, .015, blue, 0, (TOP + .08) / 2, .045);   // the blue back
      [-1, 1].forEach(sd => { box(.06, TOP + .32, .08, yellow, sd * (L / 2 + .02), (TOP + .32) / 2, 0); box(.08, .06, .34, lacq, sd * (L / 2 + .02), .03, .06); });   // the end posts on red feet
      xs.slice(1).forEach((x, k) => box(.03, TOP - .08, .035, lacq, x - wid[k + 1] / 2, (TOP + .08) / 2, 0));   // the dividers
      // the gongs, hung from the top rail, bosses toward the crowd
      const gongs = GONGS.map(([rad], k) => {
        const g = new THREE.Group(); g.position.set(xs[k], TOP - .02, -.01); Fl.add(g);
        const drop = .04 + rad;   // its rim just under the rail
        [-1, 1].forEach(sd => { const c_ = mesh(new THREE.CylinderGeometry(.005, .005, .06, 4), ink, sd * rad * .45, -.025, 0, g); c_.rotation.z = sd * .4; });
        mesh(new THREE.CylinderGeometry(rad, rad, .04, 26), darkBronze, 0, -drop, 0, g).rotation.x = Math.PI / 2;
        mesh(new THREE.TorusGeometry(rad, .016, 6, 26), darkBronze, 0, -drop, 0, g);   // the turned-back rim
        mesh(new THREE.SphereGeometry(rad * .28, 14, 10), darkBronze, 0, -drop, -.035, g).scale.z = .75;   // the boss
        return { g, rad, drop, swing: 9 };
      });
      // the beaters: each a red arm hinged above its gong, a yellow padded ball at its foot that comes to rest on the gong's face
      // at the upper corner toward the player's end; the arms swing forward about their hinges, held off the gongs between strokes
      const PY = TOP + .12, PZ_ = -.065, ATT = .1, RB = .032;   // the hinges' height and depth, how far down the arms the rod joins them, the balls' radius
      const beaters = gongs.map(({ g, rad, drop }, k) => {
        const bx = xs[k] - rad * .45, by = TOP - .02 - drop + rad * .4, len = PY - by;
        const A = new THREE.Group(); A.position.set(bx, PY, PZ_); Fl.add(A);
        mesh(new THREE.CylinderGeometry(.008, .008, len, 5), lacq, 0, -len / 2, 0, A);
        mesh(new THREE.SphereGeometry(RB, 10, 8), pom, 0, -len, 0, A);
        mesh(new THREE.BoxGeometry(.03, .03, .04), lacq, 0, 0, .02, A);   // its hinge block on the rail
        return { A, rest: Math.asin(.045 / len) };   // swung out so the ball stands 4.5 cm off the face
      });
      // the rod along the front, joining the arms a little under their hinges, its end out past the big gong for his hand
      const x0 = -L / 2 - .3, x1 = xs[4];
      const rod = new THREE.Group(); Fl.add(rod);
      mesh(new THREE.CylinderGeometry(.011, .011, x1 - x0, 6), lacq, (x0 + x1) / 2, 0, 0, rod).rotation.z = Math.PI / 2;
      mesh(new THREE.CylinderGeometry(.018, .018, .1, 8), teakM, x0 + .05, 0, 0, rod).rotation.z = Math.PI / 2;   // the grip
      const setPush = k => {   // 0 at rest, 1 with every beater on its gong
        beaters.forEach(b => b.A.rotation.x = b.rest * (1 - k));
        const th = beaters[0].rest * (1 - k); rod.position.set(0, PY - ATT * Math.cos(th), PZ_ - ATT * Math.sin(th));
      };
      setPush(0);
      // the player, on his stool beyond the big gong's end, facing along the case, his left hand on the rod's grip
      const m = musician(FX + L / 2 + .55, FZ + .05, -Math.PI / 2, 0xe8a040, true), { D, B, hd } = m, l = m.arm(1), r = m.arm(-1);
      mesh(new THREE.SphereGeometry(.045, 8, 6), skin, 0, -.28, 0, l.e); mesh(new THREE.SphereGeometry(.045, 8, 6), skin, 0, -.28, 0, r.e);
      r.a.rotation.set(-.6, 0, -.15); r.e.rotation.x = -.9;   // the right hand on his knee
      // where his hand holds the grip with the beaters off and on: worked out once
      G.updateMatrixWorld(true);
      const hand = l.e.children[l.e.children.length - 1], grip = new THREE.Vector3(), hold = k => { setPush(k); rod.updateMatrixWorld(true); return D.worldToLocal(rod.localToWorld(grip.set(x0 + .05, -.02, 0))).clone(); };
      const poses = [0, 1].map(k => { const T = hold(k); return fit(D, hand, T, (pitch, side, elbow) => { l.a.rotation.set(-pitch, 0, side); l.e.rotation.x = -elbow; }, [[.1, 2.0, .1], [-.8, .8, .1], [0, 1.8, .15]]); });
      setPush(0);
      const info = { tip: "Gongs · မွင်း", toast: "Five bronze bossed gongs (မွင်း), graduated from the largest and deepest to the smallest, hung in a painted case: yellow posts, red dividers, a blue back, and a crest board with gilt scrolls round the Shan flag. One player sounds all five at once: a yellow padded beater hangs on an arm before each gong, the arms joined by a rod, and he pushes the rod from his stool at the end so every beater strikes together. The gongs ring as one chord on every second beat, lightly on the half beat before it, and the long drum is tuned to the big gong's note, so their hum never stops under the dance. With the long drums and the cymbals they make the Shan ensemble for the ka nok." };
      gateOn(D, info); F.traverse(o => { if (o.isMesh) { o.castShadow = true; clickable(list, o, info); o.raycast = function (ray, out) { if (F.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); }; } });
      let age = 9;
      const hit = () => { age = 0; gongs.forEach(o => o.swing = 0); };
      const step = dt => {
        age += dt; const k = 1 - lifted(age), [p0, p1] = poses;   // how far in the beaters are
        setPush(k);
        l.a.rotation.set(-(p0[1] + (p1[1] - p0[1]) * k), 0, p0[2] + (p1[2] - p0[2]) * k); l.e.rotation.x = -(p0[3] + (p1[3] - p0[3]) * k);
        B.rotation.z = -k * .03; hd.rotation.x = .1;   // leaning into the push
        gongs.forEach(o => { o.swing += dt; o.g.rotation.x = Math.sin(o.swing * 7) * .04 * Math.exp(-o.swing * 1.5); });
      };
      return { D, D2: F, hit, step, poses };
    })();

    /* the cymbal player, at the back right corner, with a pair of brass cymbals held by their knobs, struck and swung apart for
       the ringing stroke on every beat */
    const cymbaler = (() => {
      const m = musician(C.x + 3.3, C.z - 1.6, -.6, 0xe8c040), { D, hd } = m;
      const prof = [[0, .035], [.035, .035], [.045, .012], [.14, 0], [.145, -.006]].map(([r_, y]) => new THREE.Vector2(r_, y));
      const disc = new THREE.LatheGeometry(prof, 22);
      const hands = [-1, 1].map(sd => {
        const r = m.arm(sd);
        mesh(new THREE.SphereGeometry(.045, 8, 6), skin, 0, -.28, 0, r.e);
        const c = new THREE.Group(); c.position.set(0, -.3, 0); c.rotation.z = -sd * Math.PI / 2; r.e.add(c);   // the dome facing out, away from the other
        mesh(disc, brass, 0, 0, 0, c).material.side = THREE.DoubleSide;
        mesh(new THREE.SphereGeometry(.02, 8, 6), red, 0, .045, 0, c);   // the cloth knob he grips
        return r;
      });
      gateOn(D, { tip: "Cymbals · ၸၢပ်ႈ", toast: "A pair of brass cymbals (ၸၢပ်ႈ) keeping the beat of the Shan ensemble: struck together on every beat and again just after each half beat, a touch late, and swung apart so they ring." });
      let from = .3, to = .3, age = 9;   // how far apart the cymbals are: 0 shut, 1 wide open
      const gap = () => age < .06 ? from * (1 - age / .06) : to * Math.min(1, (age - .06) / .25) ** .6;
      const hit = () => { from = gap(); to = .8; age = 0; };
      const step = dt => {
        age += dt; const g = gap();
        hands.forEach(r => { r.a.rotation.set(-1.0, 0, -r.sd * (.37 - g * .5)); r.e.rotation.x = -.6; });
        hd.rotation.x = .1 + .06 * Math.exp(-age * 8);
      };
      return { D, hit, step };
    })();
    const band = [...drummers, gonger, cymbaler];
    // play one stroke: the player moves and the sound is queued for the ambience (the gongs' with their pitches)
    const CHORD = GONGS.map(([, f, w]) => [f, w]);   // every gong's pitch and loudness
    // each sound carries `due`, the moment (performance.now(), s) the stroke fell, so the ambience can place it exactly on the audio
    // clock rather than on whichever frame noticed it: the rhythm keeps time however uneven the frames are
    const play = (kind, v, who = 0, due = 0) => {
      if (kind === "gong") { gonger.hit(); BAND.push([kind, v, CHORD, due]); }
      else if (kind === "cym") { cymbaler.hit(); BAND.push([kind, v, 0, due]); }
      else { drummers[who].hit(kind, v); BAND.push([kind, v, who, due]); }
      if (BAND.length > 24) BAND.shift();
    };
    // the strokes due between bar counts c0 and c1: marks(n) gives bar n's strokes as [where in the bar 0–1, kind, loudness, ...];
    // `sec` is how many real seconds a bar count takes (slower with reduced motion)
    const strokes = (c0, c1, marks, sec) => { const now = performance.now() / 1000; for (let n = Math.floor(c0); n <= Math.floor(c1); n++) marks(n).forEach(([m, kind, v, who]) => { if (c0 < n + m && n + m <= c1) play(kind, v, who, now - (c1 - n - m) * sec); }); };
    /* the song, as a recording of the Shan oh-zi ensemble plays it (သဵင်ၵွင်တႆး, YouTube dCmtysbXxoM): about 113 beats to the minute,
       without a break, in pairs of beats. The gongs' chord falls lightly on the first beat's half and full on the second beat; the
       cymbals clash on every beat and on the first beat's half, a tap before the second beat. Heard as "Tone Tone Cha Cha Tone
       Bon": Bon, the gongs' full chord with the drum's deep stroke and the cymbals; Tone, Tone, the drums a third of a beat later
       and just before the next beat; Cha, Cha, the cymbals on that beat and its half (the drum strikes under the second); Tone,
       a light stroke just before the gongs come round. The first drum takes the deep strokes, the second the light ones, and now
       and then a light one is left out. A dance figure lasts three beats, opening on a beat */
    const PAIR = [   // each beat of a pair [where in the beat 0–1, kind, loudness, which drum]: the "Cha Cha" beat, then the gong's
      [[0, "cym", .9], [0, "dum", .4, 1], [.5, "cym", 1], [.5, "dum", .75, 0], [.5, "gong", .3], [.8, "dum", .4, 1]],
      [[0, "gong", 1], [0, "cym", .85], [0, "dum", 1, 0], [1 / 3, "dum", .45, 1], [.55, "cym", .35], [5 / 6, "dum", .4, 1], [.92, "cym", .3]]
    ];
    const hash = g => { let h = Math.imul(g ^ 0x9e3779b9, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); return ((h ^ h >>> 16) >>> 0) / 4294967296; };   // a fixed 0–1 for each stroke, so the drumming is the same every visit
    const frame = n => [0, 1, 2].flatMap(i => {
      const g = 3 * n + i;
      return PAIR[g & 1].filter(([m, k, v], j) => k !== "dum" || v > .5 || hash(g * 8 + j) > .15).map(([m, k, v, w]) => [(i + m) / 3, k, v, w]);
    });   // bar n's three beats
    pose();
    return (dt, motion) => {
      const show = FOLK.dance;
      pair[0].D.visible = !!show; pair[1].D.visible = show === "pair"; band.forEach(b => { b.D.visible = !!show; if (b.D2) b.D2.visible = !!show; });
      if (!show) return;
      const d = dt * motion, q0 = t / BAR - .5, c0 = hn + ht / BAR;
      t += d;
      const sec = BAR / Math.max(motion, .01);
      if (show === "solo") { solo(d); strokes(c0, hn + ht / BAR, frame, sec); }
      else {
        pose();   // the pair dip into their knees on the deep strokes and open and fold their wings gong to gong
        strokes(q0, t / BAR - .5, frame, sec);
      }
      band.forEach(b => b.step(d));
    };
  }
