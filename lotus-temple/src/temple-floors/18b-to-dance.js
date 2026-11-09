  /* ---------- the to dance, ka to in Shan (တၢင်းၵႃႈတူဝ်း, Burmese တိုးနယား) on the festival ground's pavilion stage in the early evening:
     the to, a deer-faced, antlered beast of the Himavanta forest, danced by two dancers inside one white costume, the front one holding up the long
     neck and the head, the back one bent under the rump, trimmed in gold, green and red after the site owner's photo and the
     recording they sent (YouTube _U-imZ1KuM8). With `yellow` it is the second to, in a yellow coat, which joins the white one for the
     two to (show "twoTo") and the closing dance with the kinnara ("toKinnara"). It keeps time with the ensemble: kinnaraDancers hands
     over the bar count, and each bar is one figure. Returns the step to run each frame ---------- */
  function toDancers(G, list, cx, cz, yellow) {
    const C = { ...KINNARA, x: cx, z: cz }, data = { tip: "The to dance · တၢင်းၵႃႈတူဝ်း · တိုးနယား", toast: "Ka to (တၢင်းၵႃႈတူဝ်း; in Burmese တိုးနယား, to naya), the Shan dance of the to, a gentle beast of the Himavanta forest with a deer's face and branched antlers. Two dancers share one white costume trimmed with gold, green and red: the one in front holds up the long neck and the head, the one behind bends under the rump. In the story the creatures of the forest came out dancing to welcome the Buddha down from the Tavatimsa heaven at the end of the rains retreat, and the Shan still dance the to and the kinnara at their festivals. To the long drums (ၵွင်ယၢဝ်း), the gongs (မွင်း) and the cymbals (ၸၢပ်ႈ) it prances, bows its head to the crowd, rears up and crouches, shakes its mane and wags its tail." };
    const lin = h => new THREE.Color(h).convertSRGBToLinear();
    // the coat: white, or the second to's yellow, whose trim has white scallops in place of gold so it shows
    const COAT = yellow ? { ground: "#eebf2e", hair: ["rgba(190,140,20,.5)", "rgba(255,226,120,.8)"], scallop: "#f6f4ee" } : { ground: "#f4f1ea", hair: ["rgba(200,196,186,.5)", "rgba(255,255,255,.8)"], scallop: "#e8b830" };
    if (yellow) data.tip = "The yellow to · တၢင်းၵႃႈတူဝ်း · တိုးနယား";
    // a trim as on the photo, drawn along a line on a cloth: a green cord edged with gold scallops dotted red
    const trim = (c, x0, y0, x1, y1, w) => {
      const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / (w * 1.2))), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
      for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; c.fillStyle = COAT.scallop; c.beginPath(); c.arc(x + nx * w * .4, y + ny * w * .4, w * .62, 0, TAU); c.fill(); c.fillStyle = "#d8402a"; c.beginPath(); c.arc(x + nx * w * .5, y + ny * w * .5, w * .2, 0, TAU); c.fill(); }
      c.strokeStyle = "#1f8a3c"; c.lineWidth = w * .45; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    };
    const fur = (c, s, seed) => { c.fillStyle = COAT.ground; c.fillRect(0, 0, s, s); const r = rng(seed); for (let i = 0; i < 500; i++) { c.strokeStyle = COAT.hair[r() < .5 ? 0 : 1]; c.lineWidth = 1; const x = r() * s, y = r() * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 4, y + 5 + r() * 5); c.stroke(); } };
    // the body cloth, wrapped round the barrel: across the canvas goes round it (the sides at a quarter and three quarters, the back
    // in the middle), down the canvas runs from chest to rump. Bands round both ends, a fringe along each side of the belly, a
    // saddle line along the back and a big gold swirl on each flank
    const bodyT = canvasTex(256, (c, s) => {
      fur(c, s, 611);
      [.1, .9].forEach(v => trim(c, 0, v * s, s, v * s, 14));
      [.1, .9].forEach(u => trim(c, u * s, .1 * s, u * s, .9 * s, 12));
      [.38, .62].forEach(u => trim(c, u * s, .16 * s, u * s, .84 * s, 9));
      [.25, .75].forEach(u => {
        const x = u * s, y = .5 * s;
        [["#1f8a3c", 11], ["#e8b830", 7], ["#d8402a", 2]].forEach(([col, w]) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (let a = 0; a < 4 * Math.PI; a += .1) { const r = 4 + a * 6.5; c[a ? "lineTo" : "moveTo"](x + Math.cos(a) * r * .8, y + Math.sin(a) * r); } c.stroke(); });
      });
    });
    // the neck's cloth: the trim winding up it in a spiral, as on the photo
    const neckTex = canvasTex(256, (c, s) => { fur(c, s, 612); for (let k = -1; k < 4; k++) trim(c, 0, k * s / 3, s, k * s / 3 + s * .45, 12); });
    const furT = canvasTex(128, (c, s) => fur(c, s, 613));
    const body = std({ map: bodyT, roughness: .9 }), neckM = std({ map: neckTex, roughness: .9 }), white = std({ map: furT, roughness: .9 });
    const green = std({ color: lin(0x1f8a3c), roughness: .5 }), red = std({ color: lin(0xd02a22), roughness: .5 }), orange = std({ color: lin(0xe8702a), roughness: .7 }), dark = std({ color: 0x1a1410, roughness: .5 });
    // a ruff of gold, green and red rings, as on the knees and ankles and round the neck
    const ruff = (parent, y, r) => [[M.gold, 0, .04], [green, .045, .025], [red, -.04, .022]].forEach(([m, dy, tube]) => { mesh(new THREE.TorusGeometry(r, tube, 6, 18), m, 0, y + dy, 0, parent).rotation.x = Math.PI / 2; });
    const A = new THREE.Group(); G.add(A);   // the whole beast: +z is where its head points
    // the two dancers' legs, in white leggings with ruffs at the knees and ankles and gilt paws over their shoes, jointed at hip, knee
    // and ankle; each dancer is a group, `z` along the beast
    const THIGH = .42, SHIN = .42, drop = th => (THIGH + SHIN) * (1 - Math.cos(th));
    const dancer = z => {
      const P = new THREE.Group(); P.position.z = z; A.add(P);
      const legs = [-1, 1].map(sd => {
        const hip = new THREE.Group(); hip.position.set(sd * .14, .84, 0); P.add(hip);
        mesh(new THREE.CylinderGeometry(.12, .1, THIGH, 10), white, 0, -THIGH / 2, 0, hip);
        const knee = new THREE.Group(); knee.position.y = -THIGH; hip.add(knee);
        mesh(new THREE.CylinderGeometry(.1, .09, SHIN - .05, 10), white, 0, -(SHIN - .05) / 2, 0, knee);
        ruff(knee, -.02, .11); ruff(knee, -SHIN + .1, .12);
        const ankle = new THREE.Group(); ankle.position.y = -SHIN + .05; knee.add(ankle);
        mesh(new THREE.BoxGeometry(.13, .07, .24), M.gold, 0, -.02, .04, ankle);   // the paw
        mesh(new THREE.BoxGeometry(.13, .035, .05), red, 0, -.035, .17, ankle);   // red toes
        return { hip, knee, ankle };
      });
      return { P, legs };
    };
    const front = dancer(.6), back = dancer(-.7);
    // the barrel of the body, stretched each frame between the back dancer's rump and the front dancer's chest, rounded off at both ends
    const barrelGeo = new THREE.CylinderGeometry(.42, .4, 1, 18, 1, true); barrelGeo.rotateX(Math.PI / 2);
    const barrel = mesh(barrelGeo, body, 0, 0, 0, A);
    const rump = mesh(new THREE.SphereGeometry(.42, 16, 12), white, 0, 0, 0, A); rump.scale.set(1, .97, .8);
    const chest = mesh(new THREE.SphereGeometry(.42, 16, 12), white, 0, 0, 0, A); chest.scale.set(1.04, 1.04, .85);
    mesh(new THREE.TorusGeometry(.12, .03, 6, 16), M.gold, 0, .02, .31, chest);   // the gilt rosette on the breast
    mesh(new THREE.CircleGeometry(.1, 16), red, 0, .02, .312, chest);
    // the tail: a white tuft fringed in gold, wagging
    const tail = new THREE.Group(); rump.add(tail); tail.position.set(0, .18, -.4);
    mesh(new THREE.ConeGeometry(.13, .55, 8), white, 0, -.27, 0, tail).rotation.x = Math.PI;
    mesh(new THREE.SphereGeometry(.1, 10, 8), M.gold, 0, -.56, 0, tail).scale.set(1, 1.4, 1);   // its gold tassel
    // the long neck rising from the chest, ruffed at the base, with a red-and-orange mane down its back, and on it a deer's head:
    // white, with a long muzzle tapering to a black nose, big dark eyes on the sides of the face, large ears held out sideways,
    // a gilt band over the nose, and a deer's branched antlers
    const neck = new THREE.Group(); A.add(neck);
    mesh(new THREE.CylinderGeometry(.18, .3, 1.1, 14), neckM, 0, .55, 0, neck);
    ruff(neck, .12, .29);
    const mane = Array.from({ length: 9 }, (_, i) => { const m = mesh(new THREE.ConeGeometry(.06, .22, 6), i & 1 ? orange : red, 0, .2 + i * .1, -.21 + i * .012, neck); m.rotation.x = -2.2; return m; });
    const head = new THREE.Group(); head.position.y = 1.1; neck.add(head);
    const H = new THREE.Group(); head.add(H);   // tipped forward so the face points ahead when the neck leans
    mesh(new THREE.SphereGeometry(.17, 16, 12), white, 0, .05, 0, H).scale.set(.9, .95, 1.1);   // the crown of the head
    const muzzle = new THREE.Group(); muzzle.position.set(0, .02, .1); muzzle.rotation.x = .18; H.add(muzzle);   // dipping a little toward the nose
    mesh(new THREE.CylinderGeometry(.065, .125, .4, 14), white, 0, 0, .18, muzzle).rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(.07, 12, 8), dark, 0, .005, .38, muzzle).scale.set(.95, .75, .7);   // the black nose
    mesh(new THREE.BoxGeometry(.1, .012, .1), dark, 0, -.055, .3, muzzle);   // the mouth
    mesh(new THREE.TorusGeometry(.105, .018, 6, 16), M.gold, 0, 0, .14, muzzle);   // the gilt nose band
    const pink = std({ color: lin(0xe8a8a0), roughness: .7 }), antM = std({ color: lin(0xb48c5c), roughness: .65 });
    // a length of antler from its parent's tip, leaning forward by rx and out by rz; returns its own tip, for the next length
    const tine = (parent, L, r, rx, rz) => { const g = new THREE.Group(); g.rotation.set(rx, 0, rz); parent.add(g); mesh(new THREE.CylinderGeometry(r * .7, r, L, 6), antM, 0, L / 2, 0, g); const tip = new THREE.Group(); tip.position.y = L; g.add(tip); return tip; };
    [-1, 1].forEach(sd => {
      mesh(new THREE.SphereGeometry(.04, 12, 8), dark, sd * .12, .08, .1, H).scale.set(.6, 1, 1.25);   // big dark eyes
      mesh(new THREE.TorusGeometry(.042, .008, 6, 12), M.gold, sd * .125, .08, .1, H).rotation.y = sd * 1.1;
      const ear = new THREE.Group(); ear.position.set(sd * .13, .16, -.05); ear.rotation.set(-.3, 0, -sd * 1.05); H.add(ear);   // held out to the side
      mesh(new THREE.SphereGeometry(.075, 10, 8), white, 0, .09, 0, ear).scale.set(.5, 1.25, .28);
      mesh(new THREE.SphereGeometry(.06, 10, 8), pink, 0, .09, .012, ear).scale.set(.4, 1.1, .2);
      // the antler: a beam rising out and back from the crown and curving in at the top, a brow tine forward over the eye and
      // tines forward off the beam, forked at the tip
      const base = new THREE.Group(); base.position.set(sd * .07, .19, -.03); H.add(base);
      mesh(new THREE.SphereGeometry(.03, 8, 6), antM, 0, 0, 0, base);   // the burr
      tine(base, .11, .02, 1.0, -sd * .2);
      let b = tine(base, .2, .024, -.3, -sd * .5);
      tine(b, .13, .016, .95, sd * .25);
      b = tine(b, .18, .02, -.15, sd * .3);
      tine(b, .12, .014, .85, 0);
      b = tine(b, .14, .016, .05, sd * .3);
      tine(b, .09, .011, .7, -sd * .45);
    });
    A.traverse(o => { if (o.isMesh) { o.castShadow = true; clickable(list, o, data); o.raycast = function (ray, out) { if (A.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); }; } });
    // a leg's joints: hip swing (+ back, - forward), knee bend, and the ankle, which keeps the paw level unless `point` tips it
    const setLeg = (l, hip, knee, point = 0) => { l.hip.rotation.x = hip; l.knee.rotation.x = knee; l.ankle.rotation.x = -(hip + knee) + point; };
    /* the figures, one to a bar of the drum, round a phrase of sixteen (FIG), each starting and ending in the same stance so one runs
       into the next: w, prancing along, all four legs stepping on the beats and the head bobbing; n, bowing the head low to the crowd;
       s, shaking the mane and swaying, the head swinging side to side and the tail wagging hard; r, rearing: the back dancer sinks
       to a deep crouch while the front one rises on his toes and lifts the head high, as in the photo; h, a hop on all fours; t, a
       turn on the spot; c, crouching low together to sniff the ground. Alone it travels along a figure of eight across the stage, kept
       clear of the musicians at the sides, mostly side-on to the crowd; the two to go round an oval on opposite sides of it, doing
       the same figures together; with the kinnara dancing in the middle, each keeps to its own side, facing the crowd. With
       another dancer close by, the turn is a swing to and fro instead of a full turn, so they don't sweep into each other */
    const FIG = "wwnswwrrwwhtwcsn", fig = n => FIG[((n % 16) + 16) % 16];
    const RATE = { w: 2.6, s: .5, h: 1, t: 0, n: 0, r: 0, c: 0 }, STEPS = { w: 1, t: 1, s: .4, h: 0, n: 0, r: 0, c: .2 };   // how far along its path in a bar, and how much it steps
    const bump = (x, a, b) => x > a && x < b ? Math.sin(Math.PI * (x - a) / (b - a)) : 0, smooth = x => x * x * (3 - 2 * x);
    let t = 0, pp = 0, last = null;
    const pose = bar => {
      const n = Math.floor(bar), u = bar - n, f = fig(n), env = Math.sin(Math.PI * u), env2 = env * env;
      const db = last === null || bar < last || bar - last > 1 ? 0 : bar - last; last = bar;
      pp += db * RATE[f] * 6 * u * (1 - u);
      const show = FOLK.dance, sd = yellow ? 1 : -1;
      let x, z, head0;
      if (show === "twoTo") { const a = pp * .32 + (yellow ? Math.PI : 0); x = C.x + Math.cos(a) * 2.4; z = C.z - .2 + Math.sin(a) * 1.1; head0 = Math.atan2(-2.4 * Math.sin(a), 1.1 * Math.cos(a)); }   // round the oval, facing along it
      else if (show === "toKinnara") { x = C.x + sd * 3.4 + Math.sin(pp * .5) * .4; z = C.z - .3 + Math.sin(pp * .35) * .6; head0 = -sd * .45 + Math.sin(pp * .3) * .25; }   // at its own side, turned in toward the kinnara and the crowd
      else { x = C.x + Math.sin(pp * .35) * 2.2; z = C.z - .25 + Math.sin(pp * .7) * .5; head0 = Math.atan2(.77 * Math.cos(pp * .35), .35 * Math.cos(pp * .7)); }   // facing the way it travels
      let fB = .12, bB = .3, rise = 0, neckT = .3, nod = 0, yaw = 0, sway = 0, hop = 0, spin = 0, wag = .25, shake = 0;
      if (f === "w") { neckT += .08 * Math.sin(TAU * 3 * u); nod = .1 * Math.sin(TAU * 3 * u + 1); }
      else if (f === "n") { neckT += .95 * env2; nod = .55 * env2; fB += .4 * env2; bB += .1 * env2; }
      else if (f === "s") { sway = .1 * Math.sin(TAU * 2 * u) * env; yaw = .6 * Math.sin(TAU * u); wag = 1; shake = env; }
      else if (f === "r") { bB += .8 * env2; rise = .1 * env2; neckT -= .3 * env2; nod = -.35 * env2; shake = .5 * env2; }
      else if (f === "h") { const air = bump(u, .35, .7); hop = .14 * air; fB += .3 * bump(u, .05, .35) + .3 * bump(u, .7, 1) - .1 * air; bB += .3 * bump(u, .05, .35) + .3 * bump(u, .7, 1) - .2 * air; }
      else if (f === "t") spin = show === "to" ? smooth(u) * TAU : .5 * Math.sin(TAU * u);
      else if (f === "c") { fB += .7 * env2; bB += .6 * env2; neckT += .8 * env2; nod = .45 * env2; yaw = .3 * Math.sin(TAU * 2 * u) * env; }
      // in a bow or a shake it turns its head toward the crowd
      if (f === "n" || f === "s") { const rel = Math.atan2(Math.sin(-head0), Math.cos(-head0)); yaw += Math.max(-.8, Math.min(.8, rel)) * env; }
      A.position.set(x, C.y + hop, z); A.rotation.y = head0 + spin; A.rotation.z = sway;
      // the legs step on the half beats, left then right, the back dancer half a step behind the front one
      const st = STEPS[f] * (f === "t" ? 1 : env + .3 * (f === "w"));
      [[front, fB, 0], [back, bB, .5]].forEach(([d, bend, off]) => {
        const q = u * 6 + off, k = Math.floor(q), lift = Math.min(1, st) * bump(q - k, 0, 1) * .45;
        d.P.position.y = -drop(bend) + (d === front ? rise : 0) + lift * .03;
        d.legs.forEach((l, j) => { const up = ((k & 1) === j ? lift : 0); setLeg(l, -bend - up * .7, 2 * bend + up * 1.3, (d === front ? rise * 3 : 0) + up * .3); });
      });
      // the barrel between the rump and the chest
      const ry = .84 - drop(bB) + .1, rz = back.P.position.z - .1, fy = .84 - drop(fB) + rise + .36, fz = front.P.position.z + .05;
      rump.position.set(0, ry, rz); chest.position.set(0, fy, fz);
      const dy = fy - ry, dz = fz - rz, L = Math.hypot(dy, dz);
      barrel.position.set(0, (ry + fy) / 2, (rz + fz) / 2); barrel.rotation.x = -Math.atan2(dy, dz); barrel.scale.z = L;
      chest.rotation.x = barrel.rotation.x; rump.rotation.x = barrel.rotation.x;
      neck.position.set(0, fy + .05, fz + .12); neck.rotation.x = neckT; neck.rotation.y = yaw * .4;
      head.rotation.x = -neckT * .75 + nod; head.rotation.y = yaw * .6; head.rotation.z = shake * .15 * Math.sin(t * 13);
      mane.forEach((m, i) => m.rotation.z = shake * .35 * Math.sin(t * 15 + i));
      tail.rotation.z = wag * .5 * Math.sin(t * (6 + 6 * wag)); tail.rotation.x = .5 + .2 * wag;
    };
    A.visible = false;
    return (dt, motion, bar) => {
      const show = FOLK.dance;
      A.visible = bar !== undefined && (show === "twoTo" || show === "toKinnara" || (!yellow && show === "to"));
      if (!A.visible) { last = null; return; }
      t += dt * motion;
      pose(bar);
    };
  }

