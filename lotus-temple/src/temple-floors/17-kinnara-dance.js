  /* ---------- the kinnara and kinnari dance, ka nok in Shan (ၵႃႈၼူၵ်ႉ, Burmese ကိန္နရာ ကိန္နရီ အက) on the festival ground's pavilion stage, in the evening: a pair of
     half-bird dancers in green and gold, in human-faced masks, with great fanned wings on their backs, opened with their arms like a peacock's tail, circling each other and opening
     and folding their wings. Returns the step to run each frame ---------- */
  function kinnaraDancers(G, list, cx, cz) {
    const C = { ...KINNARA, x: cx, z: cz }, data = { tip: "Kinnara and kinnari dancers · ၵႃႈၼူၵ်ႉ", toast: "Ka nok (ၵႃႈၼူၵ်ႉ), the Shan bird dance. The kinnara and kinnari are the half-bird lovers of the Himavanta forest, never parted. At the full-moon festivals a masked pair dances them on the ground before the monastery, opening and folding their great wings to the Shan ensemble: two long drums (ၵွင်ယၢဝ်း), a row of gongs (မွင်း) and cymbals (ၸၢပ်ႈ). The kinnara lands on the drum's deep stroke and the gongs; in the evening the pair open their wings over one bar and fold them over the next." };
    const lin = h => new THREE.Color(h).convertSRGBToLinear();   // plain colours to match the sRGB cloth textures
    const green = std({ color: lin(0x1f7a3c), roughness: .45, metalness: .2 });
    const stripes = canvasTex(64, (c, s) => { c.fillStyle = "#1f7a3c"; c.fillRect(0, 0, s, s); c.fillStyle = "#e8c040"; for (let y = 4; y < s; y += 10) c.fillRect(0, y, s, 3); });
    const skirtM = std({ map: stripes, roughness: .45, metalness: .2 });
    const maskM = std({ color: lin(0xf0dcc0), roughness: .55 }), hairM = std({ color: 0x15100c, roughness: .6 });
    const skin = std({ color: lin(0xc89a70), roughness: .7 }), ink = std({ color: 0x1a1410, roughness: .6 }), red = std({ color: 0xc02a2a, roughness: .5 });
    // the wings, as Shan dancers make them: each a fan of long sequinned cloth wedges on ribs, every wedge folded along its rib like
    // an umbrella panel, so it stands up as a ridge with its sides sloping back: green sequinned cloth sewn with white flowers,
    // edged in white trim and tipped with red pom-poms, on both dancers.
    // The wings are strapped to the shoulder blades and the lowest rib runs out along the arm, so the hand carries it: with the arms
    // down the wedges close together beside the dancer, and as the arms lift they fan open from the arm's line up to
    // the edge of the middle fan, which stands still behind the head; open, the three stand behind the dancer as one great fan,
    // like a peacock showing its tail
    const FAN = Array.from({ length: 8 }, (_, k) => [1.35 + k * .03, .6, .15 + k * .05]);   // each wedge's length and width (m) and how far it leans back (rad), from the arm's up to the top
    const MID = [-.56, -.28, 0, .28, .56];   // the middle fan's wedges, how far each leans from straight up (rad)
    // and a linking wing on each side joining the side wing to the middle fan, so the three move as one: LINKS broad wedges rooted
    // with the side wing, spread evenly from its top wedge to the middle fan's edge, stretching apart as the side wing folds down
    // and bunching together as it opens up to the middle
    const LINK = [1.45, .8, .45], LINKS = 3, EDGE = Math.PI - MID[4];   // a linking wedge's length, width and lean (m, m, rad), how many, and the middle fan's edge (rad from straight down)
    const SIZES = [...FAN, LINK];   // every wedge shape: the side wings' (0–7) and the linking wings' (8)
    const CORNER = .86, FOLD = .3;   // where down the wedge its corners stand (0–1), and how far back they slope for its width
    const WEDGE = [[.5, 0], [1, CORNER], [.5, 1], [0, CORNER]];   // the wedge's outline on its cloth: across 0–1, root to tip 0–1
    // a wedge's cloth: the ground colour thick with sequins in two lighter shades, scattered five-petalled white flowers, a white trim
    const wedgeT = (ground, seq, flowers, seed) => canvasTex(256, (c, s) => {
      const P = () => { c.beginPath(); WEDGE.forEach(([x, y], i) => c[i ? "lineTo" : "moveTo"](x * s, y * s)); c.closePath(); };
      c.fillStyle = ground; c.fillRect(0, 0, s, s);
      const r = rng(seed);
      for (let i = 0; i < 700; i++) { c.fillStyle = seq[i % 2]; c.globalAlpha = .35 + r() * .5; c.beginPath(); c.arc(r() * s, r() * s, 1.5 + r() * 2.5, 0, TAU); c.fill(); }   // sequins
      c.globalAlpha = 1; c.fillStyle = "#f6f6f2";
      for (let i = 0; i < flowers; i++) { const x = r() * s, y = r() * s, f = 3 + r() * 3; for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; c.beginPath(); c.arc(x + Math.cos(a) * f, y + Math.sin(a) * f, f * .65, 0, TAU); c.fill(); } }
      P(); c.strokeStyle = "#f4f4f0"; c.lineWidth = s * .07; c.stroke();   // the white trim
      c.lineWidth = s * .012; c.beginPath(); c.moveTo(s / 2, 0); c.lineTo(s / 2, s); c.stroke();   // and down the rib
    });
    // a wedge pointing down (-y) from its root, the ridge along x = 0 facing forward (+z), its two sides sloping back
    const wedgeGeo = (L, w) => {
      const R = [0, 0, 0], T = [0, -L, 0], A = [-w / 2, -CORNER * L, -FOLD * w], B = [w / 2, -CORNER * L, -FOLD * w], pos = [R, A, T, R, T, B].flat();
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute([R, A, T, R, T, B].flatMap(([x, y]) => [x / w + .5, 1 + y / L]), 2)); g.computeVertexNormals(); return g;
    };
    // pieces [geometry, x, y, z, colour] joined into one coloured geometry, for one mesh
    const joined = parts => { const pos = [], nor = [], col = []; parts.forEach(([g, x, y, z, hex]) => { const n = g.index ? g.toNonIndexed() : g, p = n.attributes.position, q = n.attributes.normal, k = lin(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i) + x, p.getY(i) + y, p.getZ(i) + z); nor.push(q.getX(i), q.getY(i), q.getZ(i)); col.push(k.r, k.g, k.b); } }); const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); return g; };
    // a wedge's white rib and its pom-poms, at each corner and on the tip, as one mesh
    const pom = new THREE.IcosahedronGeometry(.05, 1), trimM = std({ vertexColors: true, roughness: .8 });
    const trimGeo = (L, w, pc) => joined([[new THREE.CylinderGeometry(.007, .009, L, 5), 0, -L / 2, 0, 0xe8e8e4], [pom, 0, -L, 0, pc], ...[-1, 1].map(sd => [pom, sd * w / 2, -CORNER * L, -FOLD * w, pc])]);
    const wedgeGeos = SIZES.map(([L, w]) => wedgeGeo(L, w));
    const WING = { cloth: std({ map: wedgeT("#1f8a3c", ["#7ad890", "#c8f4d0"], 26, 78), roughness: .35, metalness: .35, side: THREE.DoubleSide }), trims: SIZES.map(([L, w]) => trimGeo(L, w, 0xe02828)) };
    // a wedge on a pivot at its root (turned by fanWings), tipped back by its sweep
    const feather = (parent, k, z, P = WING) => { const g = new THREE.Group(); g.position.z = z; parent.add(g); const b = new THREE.Group(); b.rotation.x = SIZES[k][2]; g.add(b); b.add(new THREE.Mesh(wedgeGeos[k], P.cloth)); mesh(P.trims[k], trimM, 0, 0, 0, b); return g; };
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
      // the wings on the shoulder blades (see FAN); fanWings() opens them with the arms
      const fan = arms.map(r => { const W = new THREE.Group(); W.position.set(r.sd * .1, 1.24, -.17); T.add(W); return { r, sd: r.sd, W, leaves: FAN.map((f, k) => feather(W, k, -k * .01)), links: Array.from({ length: LINKS }, (_, j) => feather(W, FAN.length, -.08 - j * .006)) }; });
      // and between them the middle fan, standing still behind the head like an aura while the side wings open and close round it:
      // five wedges spread either side of straight up (MID), a little behind the side wings
      const mid = new THREE.Group(); mid.position.set(0, 1.26, -.22); T.add(mid);
      MID.forEach((a, i) => { feather(mid, 3, -i * .006).rotation.z = Math.PI + a; });
      // hidden while they're off the stage, and then not clickable either
      D.traverse(o => { if (o.isMesh) { o.castShadow = true; clickable(list, o, data); o.raycast = function (ray, out) { if (D.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); }; } });
      G.add(D);
      return { D, B, U, legs, arms, fan, male };
    }
    // a leg's joints: hip swing (+ back, - forward), knee bend, and the ankle, which keeps the foot level unless `point` tips the toes down
    const setLeg = (l, hip, knee, point = 0) => { l.hip.rotation.x = hip; l.knee.rotation.x = knee; l.ankle.rotation.x = -(hip + knee) + point; };
    // an arm's joints: raised out to the side (lift), reached forward (fwd), the elbow and wrist curving on in the same plane,
    // and the fingers bent back, the curled-back hand of Shan and Burmese dance
    const setArm = (r, lift, fwd, elbow, wrist, fingers) => { const sd = r.sd; r.lift = lift; r.a.rotation.z = sd * lift; r.a.rotation.x = fwd; r.elbow.rotation.z = sd * elbow; r.wrist.rotation.z = sd * wrist; r.fingers.rotation.z = sd * fingers; };
    const pair = [dancer(true), dancer(false)];
    let t = 0;
    // the opening of the epic, in the afternoon: the kinnara alone, danced after the Dehong Dai and Shan kinnara of Yunnan (M Time,
    // YouTube gNkFn3owbgQ). Each bar of the long drum is one figure, round a phrase of sixteen (FIG): s, a step on bent, turned-out
    // knees, one foot lifted and set down ahead as both wings sweep up wide and fold down; b, banking like a bird, one wing high and
    // the other low, tipping toward the low one, then the other way; k, one knee drawn up high, foot flexed, rising on the other foot
    // with the wings up and trembling; p, a whirl on the spot with the wings spread level; c and r, sinking into a deep squat with
    // the wings swept forward round him, and rising again; L, a leap: he gathers into his knees, springs, wings opening, and comes
    // down into the next bar's deep stroke, his time aloft following from the height under gravity. Every figure starts and ends
    // in the same soft stance, wings half open, so one runs into the next. He travels while he steps and while he's in the air
    const GRAV = 9.8, BAR = 1.59;   // gravity (m/s²), one figure of the dance, three beats of the ensemble at about 113 a minute (s)
    const FIG = "ssbkssbLspkkcrbL", fig = n => FIG[((n % 16) + 16) % 16];   // the phrase, one letter a bar (see above)
    const RATE = { s: 1, b: .7, k: .35, p: .15, c: 0, r: 0 };   // how far he travels along his path in a bar of each figure
    const hopH = n => fig(n) === "L" ? (n & 16 ? .24 : .16) : 0, airT = h => h ? Math.sqrt(8 * h / GRAV) : 0;   // a leap's height (m), higher every other phrase
    const bump = (x, a, b) => x > a && x < b ? Math.sin(Math.PI * (x - a) / (b - a)) : 0, smooth = x => x * x * (3 - 2 * x);
    let hn = 0, ht = 0, pp = 0;   // which bar, the time into it, and how far along his path
    // the wings fan open with the arms: the lowest wedge lies along the arm (never so low that it drags on the floor), and the rest
    // spread from it up to the middle fan's edge as far as the arm is raised, so a lowered arm closes them; the arm reaching forward
    // cups the fan round the dancer. `flut` sets the wedges trembling, as the dancer shakes them at the top of an opening
    const fanWings = (d, flut) => d.fan.forEach(w => {
      const a = Math.max(.7, w.r.lift), o = Math.min(1, Math.max(0, (w.r.lift - .3) / .8)), top = a + (Math.PI - .6 - a) * o, n = w.leaves.length - 1;
      w.W.rotation.x = w.r.a.rotation.x * .6;
      w.leaves.forEach((L, k) => { L.rotation.z = w.sd * (a + (top - a) * k / n + flut * .05 * Math.sin(t * 16 + k * 1.3 + w.sd)); });
      w.links.forEach((L, j) => { L.rotation.z = w.sd * (top + (EDGE - top) * (j + 1) / (LINKS + 1) + flut * .03 * Math.sin(t * 16 + j + w.sd)); });   // spread across the gap to the middle fan
    });
    const solo = dt => {
      const d = pair[0]; ht += dt;
      while (ht > BAR) { ht -= BAR; hn++; }
      const f = fig(hn), h = hopH(hn), ta = airT(h), GD = BAR - ta, onG = ht < GD, ta_ = ht - GD, s = onG ? 0 : ta_ / ta, u = ht / BAR;
      const y = onG ? 0 : GRAV / 2 * ta_ * (ta - ta_);   // the arc of the leap
      const env = Math.sin(Math.PI * u), env2 = env * env, tuck = onG ? 0 : Math.sin(Math.PI * s);
      // the knees: a soft bend all the while, eased in after a landing and out before a spring, sinking into the landing (as deep
      // as the leap was high) and gathering before a spring
      const prevH = hopH(hn - 1), easeIn = prevH ? Math.min(1, ht / .15) : 1, easeOut = h ? Math.min(1, Math.max(0, GD - ht) / .12) : 1;
      let bend = !onG ? 0 : .14 * easeIn * easeOut + (prevH ? (.2 + prevH * 1.1) * bump(ht, 0, .55) * .8 : 0) + (h ? (.22 + h * 1.1) * bump(ht, GD - .5, GD) : 0);
      let lead = hn & 1, step = 0, knee = 0, deep = 0, tilt = 0, spin = 0, flut = 0, lean = 0, fwd = -.3, aL = .9, aR = .9;   // aL the arm on sd −1, aR on sd 1
      if (f === "s") { step = bump(u, .12, .72); bend += .08 * bump(u, .05, .95); aL = aR = .9 + .8 * Math.sin(TAU * u); flut = Math.max(0, Math.sin(TAU * u)) ** 4; }
      else if (f === "b") { tilt = Math.sin(TAU * u); aR = .9 + .75 * tilt; aL = .9 - .75 * tilt; bend += .1 * bump(u, 0, .5) + .1 * bump(u, .5, 1); step = .6 * bump(u, .1, .45); lead = tilt > 0 ? 0 : 1; }
      else if (f === "k") { knee = env2; aL = aR = .9 + .75 * knee; flut = knee; lean = -.12 * knee; bend *= 1 - .6 * knee; }
      else if (f === "p") { spin = smooth(u) * TAU; aL = aR = .9 + .6 * env; flut = env; lead = Math.floor(u * 4) & 1; step = .35 * env * bump((u * 4) % 1, .1, .9); }
      else if (f === "c" || f === "r") { deep = f === "c" ? smooth(u) : 1 - smooth(u); bend += .6 * deep; aL = aR = .9 + .7 * deep; fwd = -.3 - .7 * deep; flut = deep; lean = .18 * deep; }
      else if (f === "L") { aL = aR = onG ? .9 - .45 * bump(ht, GD - .5, GD) : .9 + .85 * tuck; flut = tuck; }
      const out = .08 + .3 * deep;   // the knees turned out, wider in the squat
      // along his path round the stage, kept clear of the musicians at the sides: moving while a foot is up, or in the air
      pp += f === "L" ? (onG ? 0 : 6 * s * (1 - s) * dt / ta) : RATE[f] * 6 * u * (1 - u) * dt / BAR;
      const roam = FOLK.dance === "toKinnara" ? .6 : 1.3;   // a wider stage to roam; between the two to he keeps to the middle, a little forward
      d.D.position.set(C.x + Math.sin(pp * .3) * 1.3 * roam, C.y, C.z + Math.sin(pp * .6) * .6 * roam + Math.max(0, 1 - roam) * .8);
      d.D.rotation.y = Math.sin(pp * .4) * .9 + spin;   // mostly turned to the crowd
      const drop2 = th => (THIGH + SHIN) * (1 - Math.cos(th) * Math.cos(out));   // the hips' sink with the knees bent and turned out
      d.B.position.y = y - drop2(bend) + step * .025 + knee * .035;
      d.B.rotation.z = (lead ? 1 : -1) * (step * .07 + knee * .06) + tilt * .13 + (f === "p" ? .1 * env : 0);   // swaying onto the standing foot, tipping to the low wing, leaning into a whirl
      d.U.rotation.x = .06 + bend * .3 - tuck * .08 + lean;
      const kk = tuck * (h > .2 ? .8 : .55);   // in the air one leg reaches forward, the other draws up behind
      d.legs.forEach((l, i) => {
        l.hip.rotation.z = (i ? 1 : -1) * out;
        if (i === lead) setLeg(l, -bend - kk * .8 - step * .35 - knee * 1.25, 2 * bend + kk * .5 + step * .7 + knee * 1.5, kk * .5 + step * .3 - knee * .2);
        else setLeg(l, -bend + kk * .4, 2 * bend + kk * .9, kk * .6 + knee * .3);
      });
      // the arms carry the wings, held long, the elbow soft, the hands curled back, trembling with the wings
      d.arms.forEach(r => { const tr = flut * Math.sin(t * 14 + r.sd); setArm(r, (r.sd > 0 ? aR : aL) + tr * .05, fwd + tuck * .15, .15 + Math.sin(t * 1.5 + r.sd) * .08, .25 + tr * .12, .6 + Math.sin(t * 1.5 + r.sd) * .1); });
      fanWings(d, flut);
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
        d.legs.forEach((l, j) => { const lift = Math.max(0, j ? step : -step) * .35; l.hip.rotation.z = 0; setLeg(l, -bend - lift, 2 * bend + lift * 1.6, lift * .4); });
      } else d.B.position.y = -dip * .03;   // she sinks a little on the beats, her feet hidden by the longyi
      const wave = Math.sin(t * 1.2 + i * .8 - .7);   // the elbow and wrist trailing the opening and folding
      d.arms.forEach(r => setArm(r, .5 + open, -.5 + open * .3, .25 - wave * .25, .3 - wave * .25, .6 + dip * .2));
      fanWings(d, 0);   // the wings fold and open with the arms
    });
