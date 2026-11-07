  /* ---------- the kinnara and kinnari dance, ka nok in Shan (ၵႃႈၼူၵ်ႉ, Burmese ကိန္နရာ ကိန္နရီ အက) on the festival ground's pavilion stage, in the evening: a pair of
     half-bird dancers in green and gold, in human-faced masks, with great fanned wings on frames and a tail fan, circling each other and opening
     and folding their wings. Returns the step to run each frame ---------- */
  function kinnaraDancers(G, list, cx, cz) {
    const C = { ...KINNARA, x: cx, z: cz }, data = { tip: "Kinnara and kinnari dancers · ၵႃႈၼူၵ်ႉ", toast: "Ka nok (ၵႃႈၼူၵ်ႉ), the Shan bird dance. The kinnara and kinnari are the half-bird lovers of the Himavanta forest, never parted. At the full-moon festivals a masked pair dances them on the ground before the monastery, opening and folding their great wings to the Shan ensemble: two long drums (ၵွင်ယၢဝ်း), a row of gongs (မွင်း) and cymbals (ၸၢပ်ႈ). The kinnara lands on the drum's deep stroke and the gongs; in the evening the pair open their wings over one bar and fold them over the next." };
    // the wing cloth: green satin sewn with sequins, a gilt rim and bands; drawn round the centre so the fan panels pick up rings
    const wingT = canvasTex(256, (c, s) => {
      const h = s / 2; c.fillStyle = "#1f7a3c"; c.fillRect(0, 0, s, s);
      [[.97, .05, "#e8c040"], [.7, .035, "#e8c040"], [.42, .03, "#e8c040"]].forEach(([r, w, col]) => { c.strokeStyle = col; c.lineWidth = w * h; c.beginPath(); c.arc(h, h, r * h, 0, TAU); c.stroke(); });
      const r = rng(77);
      for (let ring = 0; ring < 3; ring++) for (let i = 0; i < 36; i++) { const a = i / 36 * TAU + ring, rr = (.56 + ring * .14) * h; c.fillStyle = ["#c02a2a", "#2a5ad0", "#f4e070", "#e06a9a"][(i + ring) % 4]; c.beginPath(); c.arc(h + Math.cos(a) * rr, h + Math.sin(a) * rr, 3 + r() * 2, 0, TAU); c.fill(); }
    });
    const wingM = std({ map: wingT, roughness: .45, metalness: .25, side: THREE.DoubleSide });
    const lin = h => new THREE.Color(h).convertSRGBToLinear();   // plain colours to match the sRGB cloth textures
    const green = std({ color: lin(0x1f7a3c), roughness: .45, metalness: .2 });
    const stripes = canvasTex(64, (c, s) => { c.fillStyle = "#1f7a3c"; c.fillRect(0, 0, s, s); c.fillStyle = "#e8c040"; for (let y = 4; y < s; y += 10) c.fillRect(0, y, s, 3); });
    const skirtM = std({ map: stripes, roughness: .45, metalness: .2 });
    const maskM = std({ color: lin(0xf0dcc0), roughness: .55 }), hairM = std({ color: 0x15100c, roughness: .6 });
    const skin = std({ color: lin(0xc89a70), roughness: .7 }), ink = std({ color: 0x1a1410, roughness: .6 }), red = std({ color: 0xc02a2a, roughness: .5 });
    const panel = new THREE.CircleGeometry(C.wing, 14, 0, Math.PI / 3);
    const knob = new THREE.SphereGeometry(.05, 8, 6);
    // joints: a leg is a hip, a knee and an ankle; an arm a shoulder, an elbow and a wrist
    const THIGH = .42, SHIN = .42;   // thigh, and shin with foot (m): the hip is .84 m up
    const drop = th => (THIGH + SHIN) * (1 - Math.cos(th));   // how far the hips sink when the knees bend by th (foot under the hip)
    function dancer(male) {
      const D = new THREE.Group(), B = new THREE.Group(); D.add(B);
      // the upper body pivots at the hips (U) so the dancer can lean without his feet sliding; T holds its parts at their heights
      const U = new THREE.Group(); U.position.y = .84; B.add(U);
      const T = new THREE.Group(); T.position.y = -.84; U.add(T);
      // legs: baggy green trousers on him, jointed at hip, knee and ankle, with gilt anklets and bare feet;
      // a long striped longyi on her with the anklets showing below it
      const legs = male ? [-1, 1].map(sd => {
        const hip = new THREE.Group(); hip.position.set(sd * .1, .84, 0); B.add(hip);
        mesh(new THREE.CylinderGeometry(.11, .1, THIGH, 10), green, 0, -THIGH / 2, 0, hip);
        const knee = new THREE.Group(); knee.position.y = -THIGH; hip.add(knee);
        mesh(new THREE.CylinderGeometry(.1, .085, SHIN - .04, 10), green, 0, -(SHIN - .04) / 2, 0, knee);
        mesh(new THREE.TorusGeometry(.07, .02, 6, 12), M.gold, 0, -SHIN + .07, 0, knee).rotation.x = Math.PI / 2;
        const ankle = new THREE.Group(); ankle.position.y = -SHIN + .04; knee.add(ankle);
        mesh(new THREE.BoxGeometry(.08, .04, .2), skin, 0, -.02, .05, ankle);
        return { hip, knee, ankle };
      }) : null;
      if (!male) {
        mesh(new THREE.CylinderGeometry(.15, .21, .84, 14), skirtM, 0, .42, 0, B);
        [-1, 1].forEach(sd => mesh(new THREE.TorusGeometry(.07, .02, 6, 12), M.gold, sd * .1, .06, 0, B).rotation.x = Math.PI / 2);
      }
      // a fitted green jacket with a gilt belt and collar
      mesh(new THREE.CylinderGeometry(.16, .14, .5, 12), green, 0, 1.08, 0, T);
      mesh(new THREE.TorusGeometry(.15, .03, 6, 16), M.gold, 0, .85, 0, T).rotation.x = Math.PI / 2;
      mesh(new THREE.TorusGeometry(.12, .035, 6, 16), M.gold, 0, 1.32, 0, T).rotation.x = Math.PI / 2;
      // the mask: a human face, for the kinnara is a person above and a bird below: a pale painted face with long dark eyes, arched
      // brows, a fine nose and red lips, ears hung with gold ear plugs, black hair at the back, under a tiered gold crown with a spire
      mesh(new THREE.CylinderGeometry(.045, .05, .1, 10), maskM, 0, 1.37, 0, T);   // the neck
      const head = new THREE.Group(); head.position.y = 1.5; T.add(head);
      mesh(new THREE.SphereGeometry(.12, 16, 12), maskM, 0, 0, 0, head).scale.set(.95, 1.15, 1);
      mesh(new THREE.SphereGeometry(.122, 14, 10), hairM, 0, .02, -.025, head).scale.set(.97, 1.1, .95);   // hair behind the face
      [-1, 1].forEach(sd => {
        mesh(new THREE.SphereGeometry(.022, 10, 6), ink, sd * .045, .025, .102, head).scale.set(1.5, .55, .5);   // long dark eyes
        const brow = mesh(new THREE.BoxGeometry(.055, .009, .008), ink, sd * .046, .058, .106, head); brow.rotation.z = -sd * .22;
        mesh(new THREE.SphereGeometry(.03, 8, 6), maskM, sd * .118, .0, 0, head).scale.set(.45, 1, .7);   // ears
        mesh(new THREE.CylinderGeometry(.018, .018, .02, 10), M.gold, sd * .128, -.012, .005, head).rotation.z = Math.PI / 2;   // gold ear plugs
      });
      const nose = mesh(new THREE.ConeGeometry(.016, .05, 6), maskM, 0, -.005, .12, head); nose.rotation.x = -Math.PI * .4;
      mesh(new THREE.SphereGeometry(.024, 10, 6), red, 0, -.055, .105, head).scale.set(1.1, .38, .5);   // red lips
      [.12, .19, .25].forEach((y, i) => mesh(new THREE.CylinderGeometry(.11 - i * .03, .13 - i * .03, .07, 12), i % 2 ? green : M.gold, 0, y, 0, head));
      mesh(new THREE.ConeGeometry(.04, .28, 8), M.gold, 0, .42, 0, head);
      // arms: a green sleeve jointed at the elbow, a gilt cuff, and a bare dancer's hand whose fingers bend back from the palm
      const arms = [-1, 1].map(sd => {
        const a = new THREE.Group(); a.position.set(sd * .19, 1.28, 0); T.add(a);
        mesh(new THREE.CylinderGeometry(.048, .042, .26, 8), green, 0, -.13, 0, a);
        const elbow = new THREE.Group(); elbow.position.y = -.26; a.add(elbow);
        mesh(new THREE.CylinderGeometry(.042, .034, .24, 8), green, 0, -.12, 0, elbow);
        mesh(new THREE.TorusGeometry(.036, .012, 6, 10), M.gold, 0, -.23, 0, elbow).rotation.x = Math.PI / 2;
        const wrist = new THREE.Group(); wrist.position.y = -.25; elbow.add(wrist);
        mesh(new THREE.BoxGeometry(.022, .08, .065), skin, 0, -.04, 0, wrist);   // the palm
        const fingers = new THREE.Group(); fingers.position.y = -.08; wrist.add(fingers);
        mesh(new THREE.BoxGeometry(.018, .075, .06), skin, 0, -.035, 0, fingers);
        mesh(new THREE.BoxGeometry(.016, .045, .02), skin, 0, -.015, .045, wrist).rotation.x = -.6;   // the thumb
        return { a, elbow, wrist, fingers, sd };
      });
      // the wings: three fan panels each on a frame at the shoulder blades, gilt knobs at the points
      const wings = [-1, 1].map(sd => {
        const w = new THREE.Group(); w.position.set(sd * .12, 1.2, -.14); T.add(w);
        for (let k = 0; k < 3; k++) {
          const p = new THREE.Mesh(panel, wingM); p.rotation.z = sd > 0 ? -.55 + k * .55 : Math.PI - Math.PI / 3 + .55 - k * .55; p.position.z = -k * .02; w.add(p);
          [0, 1].forEach(e => { const a = p.rotation.z + e * Math.PI / 3; mesh(knob, M.gold, Math.cos(a) * C.wing, Math.sin(a) * C.wing, p.position.z, w); });
        }
        return w;
      });
      // a tail fan at the small of the back
      const tail = new THREE.Group(); tail.position.set(0, .9, -.18); tail.rotation.x = .5; T.add(tail);
      const tp = new THREE.Mesh(panel, wingM); tp.scale.setScalar(.6); tp.rotation.z = -Math.PI / 2 - Math.PI / 6; tail.add(tp);
      // hidden while they're off the stage, and then not clickable either
      D.traverse(o => { if (o.isMesh) { o.castShadow = true; clickable(list, o, data); o.raycast = function (ray, out) { if (D.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); }; } });
      G.add(D);
      return { D, B, U, legs, arms, wings, tail, male };
    }
    // a leg's joints: hip swing (+ back, - forward), knee bend, and the ankle, which keeps the foot level unless `point` tips the toes down
    const setLeg = (l, hip, knee, point = 0) => { l.hip.rotation.x = hip; l.knee.rotation.x = knee; l.ankle.rotation.x = -(hip + knee) + point; };
    // an arm's joints: raised out to the side (lift), reached forward (fwd), the elbow and wrist curving on in the same plane,
    // and the fingers bent back, the curled-back hand of Shan and Burmese dance
    const setArm = (r, lift, fwd, elbow, wrist, fingers) => { const sd = r.sd; r.a.rotation.z = sd * lift; r.a.rotation.x = fwd; r.elbow.rotation.z = sd * elbow; r.wrist.rotation.z = sd * wrist; r.fingers.rotation.z = sd * fingers; };
    const pair = [dancer(true), dancer(false)];
    let t = 0;
    // the opening of the epic, in the afternoon: the kinnara alone, gliding round the stage in soft steps, slowly opening and
    // folding his wings, mostly turned to the crowd; a light hop every fourth bar and a leap every eighth. Each bar of the long
    // drum is one figure: on a step he sinks a little into his knees, lifts one foot and sways onto it as he glides; on a hop he
    // gathers into his knees, springs, and comes down into the next bar's deep stroke, his time aloft following from the
    // height under gravity. He travels while he steps and while he's in the air, never sliding on a planted foot
    const GRAV = 9.8, BAR = 1.6;   // gravity (m/s²), one bar of the ensemble, three beats: one figure of the dance (s)
    const hopH = n => n % 4 !== 3 ? 0 : n % 8 === 7 ? .24 : .13, airT = h => h ? Math.sqrt(8 * h / GRAV) : 0;   // a hop every fourth bar, a leap every eighth
    const bump = (x, a, b) => x > a && x < b ? Math.sin(Math.PI * (x - a) / (b - a)) : 0, smooth = x => x * x * (3 - 2 * x);
    let hn = 0, ht = 0;   // which bar, and the time into it
    // the wings' sweep through a bar, -1 folded to 1 open: once open and closed on a step; opening as he springs, folding as he lands
    const sweep = (n, x) => { const h = hopH(n), gd = BAR - airT(h); return !h ? -Math.cos(TAU * x / BAR) : x < gd ? -Math.cos(Math.PI * x / gd) : Math.cos(Math.PI * (x - gd) / (BAR - gd)); };
    const solo = dt => {
      const d = pair[0]; ht += dt;
      while (ht > BAR) { ht -= BAR; hn++; }
      const h = hopH(hn), ta = airT(h), GD = BAR - ta, onG = ht < GD, ta_ = ht - GD, s = onG ? 0 : ta_ / ta, u = ht / BAR;
      const y = onG ? 0 : GRAV / 2 * ta_ * (ta - ta_);   // the arc of the hop
      // the knees: a soft bend all the while, eased in after a landing and out before a spring, sinking into the landing
      // (as deep as the hop was high), dipping on each step, and gathering before a spring
      const prevH = hopH(hn - 1), easeIn = prevH ? Math.min(1, ht / .15) : 1, easeOut = h ? Math.min(1, Math.max(0, GD - ht) / .12) : 1;
      const bend = !onG ? 0 : .1 * easeIn * easeOut + (prevH ? (.2 + prevH * 1.1) * bump(ht, 0, .55) * .8 : 0) + (h ? (.22 + h * 1.1) * bump(ht, GD - .5, GD) : .08 * bump(u, .05, .95));
      const tuck = onG ? 0 : Math.sin(Math.PI * s);
      const glide = h ? (onG ? 0 : smooth(s)) : smooth(u), p = hn + glide;   // along his path round the stage
      d.D.position.set(C.x + Math.sin(p * .3) * 1.5, C.y, C.z + Math.sin(p * .6) * .6);   // kept clear of the musicians at the sides
      d.D.rotation.y = Math.sin(p * .4) * .9 + (hn % 16 === 5 ? smooth(u) * TAU : 0);   // now and then a slow turn on a step
      const lead = hn % 2, lift = h ? 0 : bump(u, .12, .72);   // on a step, one foot lifts and is set down again ahead
      d.B.position.y = y - drop(bend) + lift * .025;
      d.B.rotation.z = (lead ? 1 : -1) * lift * .07;   // swaying onto the standing foot
      d.U.rotation.x = .06 + bend * .3 - tuck * .08;   // leaning a little into the bend, lifting the chest at the top of a hop
      const k = tuck * (h > .2 ? .8 : .55);   // in the air one leg reaches forward, the other draws up behind
      d.legs.forEach((l, i) => {
        if (i === lead) setLeg(l, -bend - k * .8 - lift * .35, 2 * bend + k * .5 + lift * .7, k * .5 + lift * .3);
        else setLeg(l, -bend + k * .4, 2 * bend + k * .9, k * .6);
      });
      // the wings open and fold with the bar, the feathers stirring; the arms sweep with them, elbow and wrist trailing a little
      // like a wave down a feather, the hands curled back
      const beat = sweep(hn, ht), lag = sweep(hn, Math.max(0, ht - .15)), stir = Math.sin(t * 6) * .02;
      d.wings.forEach((w, i) => { const sd = i ? 1 : -1; w.rotation.z = -sd * (-.05 + beat * .3 + stir); w.rotation.y = sd * (.3 - tuck * .1 + Math.sin(t * 1.2 + i) * .08); w.rotation.x = stir; });
      d.arms.forEach(r => setArm(r, 1.05 + beat * .3, -.4 + tuck * .2 - bend * .2, -lag * .25, .3 - lag * .25, .6 + Math.sin(t * 1.5 + r.sd) * .1));
      d.tail.rotation.y = Math.sin(t * 1.4) * .25; d.tail.rotation.x = .5 + tuck * .2 + Math.sin(t * 2.2) * .04;
    };
    const pose = () => pair.forEach((d, i) => {
      const a = t * C.turn + i * Math.PI, x = C.x + Math.cos(a) * C.r, z = C.z + Math.sin(a) * C.r;
      d.D.position.set(x, C.y, z);
      // they face across the circle to each other, swaying a little out of it in the steps
      d.D.rotation.y = Math.atan2(C.x - x, C.z - z) + Math.sin(t * 1.1 + i) * .5;
      const W = Math.PI / BAR, beat = t * W + i * .25, open = .5 - .5 * Math.cos(t * W - Math.PI / 2 - i * .4), dip = Math.abs(Math.sin(beat));   // dipping on the deep strokes; the wings open over one bar and fold over the next, gong to gong, hers a breath after his
      d.B.rotation.z = Math.sin(beat * .5) * .06; d.B.rotation.x = 0; d.U.rotation.x = .04 + dip * .06;
      if (d.legs) {
        // he dips into his knees on the drum beats and steps, lifting one foot then the other
        const bend = .1 + dip * .14, step = Math.sin(beat * .5);
        d.B.position.y = -drop(bend);
        d.legs.forEach((l, j) => { const lift = Math.max(0, j ? step : -step) * .35; setLeg(l, -bend - lift, 2 * bend + lift * 1.6, lift * .4); });
      } else d.B.position.y = -dip * .03;   // she sinks a little on the beats, her feet hidden by the longyi
      d.wings.forEach((w, k) => { const sd = k ? 1 : -1; w.rotation.z = -sd * (.5 - open * .6); w.rotation.y = sd * (.7 - open * .55); w.rotation.x = 0; });
      const wave = Math.sin(t * 1.2 + i * .8 - .7);   // the elbow and wrist trailing the opening and folding
      d.arms.forEach(r => setArm(r, .5 + open, -.5 + open * .3, .25 - wave * .25, .3 - wave * .25, .6 + dip * .2));
      d.tail.rotation.y = Math.sin(beat * .5) * .3; d.tail.rotation.x = .5;
    });
