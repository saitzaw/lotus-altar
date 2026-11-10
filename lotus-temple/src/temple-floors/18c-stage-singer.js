  /* ---------- the singer on the festival ground's stage, in the gaps between the dances (show "singer"): a Shan singer alone, after the
     site owner's photo, in the old dress of the hills: a grey silk jacket studded with silver down its edges and fastened with frogs,
     black knitted undersleeves and a dark red collar, baggy grey trousers with a white cloth hanging at the hip, a white headcloth whose
     long tail hangs down over his right shoulder, a great woven straw hat slung on his back, and a sword in a dark scabbard on a green
     cord, hung with tassels and pom-poms of green, red, yellow and white wool. He holds a microphone to his mouth and strolls slowly
     across the front of the stage, his left hand on the sword's hilt; between verses he lowers the microphone and opens his hand to
     the crowd. He is only seen: no song is played, so there is no recording to license. Returns the step to run each frame ---------- */
  function stageSinger(G, list, cx, cz) {
    const C = { ...KINNARA, x: cx, z: cz }, data = { tip: "A Shan singer · ၵႂၢမ်းတႆး · ရှမ်းအဆိုတော်", toast: "Between the dances a Shan singer takes the stage alone while the dancers rest, in the old dress of the hills: a grey silk jacket studded with silver, a white headcloth with its long tail hanging down, a great straw hat slung on his back and a sword hung with tassels of coloured wool. He sings Shan songs (ၵႂၢမ်းတႆး) to the crowd; here you can only watch, for no recording is played." };
    const lin = h => new THREE.Color(h).convertSRGBToLinear();
    const silk = std({ color: lin(0x9a9ca2), roughness: .35, metalness: .25 }), silkDark = std({ color: lin(0x83858c), roughness: .4, metalness: .2 });
    const knit = std({ color: 0x1a1a1e, roughness: .9 }), wine = std({ color: lin(0x6a1a1e), roughness: .7 }), white = std({ color: lin(0xf0eee6), roughness: .75 });
    const skin = std({ color: lin(0xc89a70), roughness: .7 }), ink = std({ color: 0x1a1410, roughness: .6 }), silver = std({ color: 0xd8dade, roughness: .25, metalness: .8 });
    const cord = std({ color: lin(0x2a8a3c), roughness: .7 }), sheath = std({ color: 0x24262a, roughness: .45, metalness: .3 });
    const WOOL = [0x1f8a3c, 0xd82a2a, 0xf0c830, 0xf4f2ea].map(h => std({ color: lin(h), roughness: .95 }));
    const straw = std({ map: canvasTex(128, (c, s) => {   // a woven straw hat: rings of plaited straw round the crown
      c.fillStyle = "#d8b868"; c.fillRect(0, 0, s, s); const r = rng(611);
      for (let y = 0; y < s; y += 4) { c.fillStyle = y & 4 ? "rgba(150,110,40,.35)" : "rgba(255,240,180,.35)"; c.fillRect(0, y, s, 2); }
      for (let i = 0; i < 300; i++) { c.fillStyle = "rgba(120,90,30,.3)"; c.fillRect(r() * s, r() * s, 3, 1); }
    }), roughness: .85, side: THREE.DoubleSide });
    const stripes = std({ map: canvasTex(64, (c, s) => { c.fillStyle = "#e8e6e0"; c.fillRect(0, 0, s, s); c.fillStyle = "#9a9ca8"; for (let x = 3; x < s; x += 9) c.fillRect(x, 0, 2, s); }), roughness: .8 });
    const S = new THREE.Group(); G.add(S);
    const B = new THREE.Group(); S.add(B);   // all of him above the feet, for the sway
    // a rod from a to b (local points), redrawn each frame for the jointed arms: a unit cylinder stood on its base and stretched
    const Y = new THREE.Vector3(0, 1, 0), tmp = new THREE.Vector3();
    const rod = (r0, r1, mat, parent) => { const g = new THREE.CylinderGeometry(r1, r0, 1, 8); g.translate(0, .5, 0); const m = new THREE.Mesh(g, mat); parent.add(m); return m; };
    const span = (m, a, b) => { tmp.subVectors(b, a); const L = tmp.length(); m.position.copy(a); m.quaternion.setFromUnitVectors(Y, tmp.divideScalar(L)); m.scale.y = L; };
    // legs: baggy grey trousers to the ankle, black slippers; they step as he strolls
    const legs = [-1, 1].map(sd => {
      const hip = new THREE.Group(); hip.position.set(sd * .11, .86, 0); B.add(hip);
      mesh(new THREE.CylinderGeometry(.14, .12, .84, 10), silkDark, 0, -.42, 0, hip);
      mesh(new THREE.BoxGeometry(.1, .05, .24), ink, 0, -.84, .05, hip);
      return hip;
    });
    // a striped white sash hanging down the front of the trousers, and a white cloth tucked in at his right hip
    mesh(new THREE.BoxGeometry(.11, .7, .02), stripes, .07, .46, .15, B);
    mesh(new THREE.BoxGeometry(.16, .55, .03), white, -.28, .58, .08, B).rotation.z = .08;
    // the jacket: long, to the thigh, flared a little, with a dark red collar over a black knitted neck, silver studs down the
    // front edge and round the hem, and frog fastenings across the chest
    mesh(new THREE.CylinderGeometry(.18, .26, .72, 14), silk, 0, 1.03, 0, B);
    mesh(new THREE.CylinderGeometry(.06, .07, .12, 10), knit, 0, 1.4, 0, B);
    mesh(new THREE.TorusGeometry(.075, .022, 6, 14), wine, 0, 1.4, 0, B).rotation.x = Math.PI / 2;
    const stud = new THREE.SphereGeometry(.009, 6, 4);
    for (let i = 0; i < 12; i++) { const y = .7 + i * .055, r = .26 - (y - .67) * .11; mesh(stud, silver, .05, y, r + .006, B); }
    for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; mesh(stud, silver, Math.sin(a) * .265, .69, Math.cos(a) * .265, B); }
    [1.02, 1.1, 1.18, 1.26].forEach(y => mesh(new THREE.BoxGeometry(.13, .016, .016), silkDark, 0, y, .266 - (y - .67) * .111, B));
    // the head: a face with a mouth that opens as he sings, under a white headcloth wound round, its long tail down his right side
    const hd = new THREE.Group(); hd.position.y = 1.56; B.add(hd);
    mesh(new THREE.SphereGeometry(.115, 16, 12), skin, 0, 0, 0, hd).scale.set(.92, 1.15, 1);
    [-1, 1].forEach(sd => { mesh(new THREE.SphereGeometry(.016, 8, 6), ink, sd * .042, .02, .1, hd); mesh(new THREE.BoxGeometry(.045, .008, .008), ink, sd * .044, .05, .105, hd); mesh(new THREE.SphereGeometry(.026, 8, 6), skin, sd * .108, 0, 0, hd).scale.set(.45, 1, .7); });
    mesh(new THREE.ConeGeometry(.014, .045, 6), skin, 0, -.005, .115, hd).rotation.x = -Math.PI * .4;
    const mouth = mesh(new THREE.SphereGeometry(.02, 8, 6), std({ color: 0x3a1410, roughness: .8 }), 0, -.058, .1, hd); mouth.scale.set(1.2, .3, .4);
    mesh(new THREE.CylinderGeometry(.128, .122, .12, 16), white, 0, .09, -.005, hd);   // the headcloth wound round
    mesh(new THREE.SphereGeometry(.125, 14, 8, 0, TAU, 0, Math.PI / 2), white, 0, .14, -.005, hd).scale.y = .55;
    const tail = new THREE.Group(); tail.position.set(-.12, .08, -.02); hd.add(tail);   // its tail, hanging down over his right shoulder
    mesh(new THREE.BoxGeometry(.12, .62, .025), white, 0, -.31, 0, tail);
    // the straw hat on his back, a great shallow cone slung by its cord, its peak turned away from him
    const hat = mesh(new THREE.ConeGeometry(.62, .26, 28, 1, true), straw, 0, 1.0, -.36, B); hat.rotation.x = -Math.PI / 2 + .12;
    mesh(new THREE.TorusGeometry(.62, .015, 4, 28), straw, 0, 1.0, -.23, B).rotation.x = .12;   // its bound rim
    // the green cord from his right shoulder across to his left hip, and the sword hung from it in a long dark scabbard, its hilt
    // forward at the waist bound in yellow, under a bunch of pom-poms
    const P = (x, y, z) => new THREE.Vector3(x, y, z);
    span(rod(.008, .008, cord, B), P(-.15, 1.34, .1), P(.2, .88, .2));
    const hilt = P(.17, .98, .26), tip = P(.36, .3, -.05);
    span(rod(.02, .016, sheath, B), hilt, tip);
    span(rod(.018, .018, std({ color: lin(0xe8c040), roughness: .8 }), B), P(.13, 1.05, .3), hilt);
    [[.2, .82, .27, 0], [.24, .76, .25, 1], [.18, .74, .28, 3], [.22, .68, .26, 0], [.26, .62, .23, 1], [.21, .6, .27, 2]].forEach(([x, y, z, k]) => mesh(new THREE.SphereGeometry(.035, 8, 6), WOOL[k], x, y, z, B));
    [[.27, .5, .2, 1, .4], [.3, .55, .17, 0, .45]].forEach(([x, y, z, k, L]) => mesh(new THREE.CylinderGeometry(.012, .02, L, 6), WOOL[k], x, y, z, B));   // long tassels down the scabbard
    // a bunch of long wool tassels hanging at his right chest: green, red, yellow and white
    [[-.2, 0], [-.16, 1], [-.12, 2], [-.08, 3], [-.04, 0]].forEach(([x, k], i) => { mesh(new THREE.CylinderGeometry(.018, .028, .36, 6), WOOL[k], x, .92 - (i % 2) * .03, .26, B); mesh(new THREE.SphereGeometry(.024, 6, 4), WOOL[k], x, 1.1 - (i % 2) * .03, .235, B); });
    // the arms, each a wide grey silk sleeve to the elbow and a black knitted forearm, drawn shoulder to elbow to hand each frame
    // so the hands land where they should: the right on the microphone at his mouth, the left on the sword's hilt
    const arms = [-1, 1].map(sd => ({ sd, S: P(sd * .21, 1.33, 0), up: rod(.05, .085, silk, B), lo: rod(.042, .036, knit, B), hand: mesh(new THREE.SphereGeometry(.04, 8, 6), skin, 0, 0, 0, B), E: P(0, 0, 0), H: P(0, 0, 0) }));
    arms[1].hand.scale.set(.7, 1.1, 1);
    const mic = new THREE.Group(); B.add(mic);   // the microphone, in his right hand, its grille to his lips
    mesh(new THREE.CylinderGeometry(.018, .014, .17, 10), std({ color: 0x222226, roughness: .4, metalness: .4 }), 0, -.03, 0, mic);
    mesh(new THREE.SphereGeometry(.028, 10, 8), silver, 0, .07, 0, mic);
    const UA = .27, FA = .26, pole = P(0, 0, 0), dir = P(0, 0, 0);
    // two-bone reach: the elbow from the shoulder S toward the hand H, bending toward `bend`
    const reach = (a, H, bend) => {
      dir.subVectors(H, a.S); const d = Math.min(dir.length(), UA + FA - .002); dir.normalize();
      const along = (UA * UA - FA * FA + d * d) / (2 * d), h = Math.sqrt(Math.max(0, UA * UA - along * along));
      pole.copy(bend).addScaledVector(dir, -bend.dot(dir)).normalize();
      a.E.copy(a.S).addScaledVector(dir, along).addScaledVector(pole, h); a.H.copy(a.S).addScaledVector(dir, d);
      span(a.up, a.S, a.E); span(a.lo, a.E, a.H); a.hand.position.copy(a.H);
    };
    const OUT_R = P(-1, -.6, -.3), OUT_L = P(1, -.8, -.4), hR = P(0, 0, 0), hL = P(0, 0, 0);
    S.traverse(o => { if (o.isMesh) { o.castShadow = true; clickable(list, o, data); o.raycast = function (ray, out) { if (S.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); }; } });
    S.visible = false;
    const VERSE = 16, REST = 4;   // seconds a verse lasts, and the breath between verses when the microphone comes down
    const bump = (x, a, b) => x > a && x < b ? Math.sin(Math.PI * (x - a) / (b - a)) : 0;
    let t = 0, x0 = null, stepPh = 0;
    return (dt, motion) => {
      S.visible = FOLK.dance === "singer";
      if (!S.visible) { x0 = null; return; }
      t += dt * motion;
      // strolling slowly to and fro across the front of the stage, mostly facing the crowd, turned a little the way he goes
      const x = C.x + Math.sin(t * .11) * 1.6, z = C.z + .55 + Math.sin(t * .07) * .2, v = x0 === null ? 0 : (x - x0) / Math.max(dt, 1e-4); x0 = x;
      S.position.set(x, C.y, z); S.rotation.y = Math.max(-.5, Math.min(.5, v * 2)) + Math.sin(t * .23) * .2;
      stepPh += Math.abs(v * dt) * 9;   // a step for every 35 cm or so he goes
      legs.forEach((l, j) => l.rotation.x = Math.sin(stepPh + j * Math.PI) * Math.min(.3, Math.abs(v) * 2));
      // singing: the mouth opens with the syllables; between verses (rest, 0–1) the microphone comes down to his chest and his
      // left hand leaves the hilt and opens toward the crowd
      const u = t % (VERSE + REST), rest = bump(u, VERSE, VERSE + REST), sing = 1 - Math.min(1, rest * 2);
      mouth.scale.y = .3 + sing * (.6 + .5 * Math.sin(t * 7.3) * Math.sin(t * 2.9)) * .9;
      B.rotation.z = Math.sin(t * 1.3) * .025; B.position.y = Math.abs(Math.sin(stepPh)) * .012;
      hd.rotation.set(-.05 + Math.sin(t * .9) * .05 * sing - rest * .08, Math.sin(t * .5) * .25, Math.sin(t * 1.3) * .04);
      tail.rotation.z = Math.sin(t * 1.6) * .05;
      hR.set(-.05 - rest * .02, 1.37 - rest * .26, .17 + rest * .05);
      hL.set(.15 + rest * .14, 1.02 + rest * .24, .29 + rest * .14);
      reach(arms[0], hR, OUT_R); reach(arms[1], hL, OUT_L);
      mic.position.copy(arms[0].H); mic.rotation.set(-.35 + rest * .6, 0, .25 - rest * .2); mic.position.y += .03;
    };
  }
