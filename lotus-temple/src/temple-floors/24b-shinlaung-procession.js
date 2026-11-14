  /* ---------- Poy Sang Long (ပွႆးသၢင်ႇလွင်း, Burmese ရှင်ပြုပွဲ), the Shan novice ordination procession: before the boys are ordained
     as novices they are dressed as princes, after the Buddha who left his palace, and carried through the town on the shoulders
     of their uncles and older cousins, never letting their feet touch the ground, under tall golden parasols. Bamboo poles hung
     with white-wrapped gifts and coloured streamers lead the way; the families follow with fans, monks' bowls and folded robes.
     Here they go round the block opposite the temple's gate in the morning (FOLK.procession, CONFIG.procession, ?procession=1/0):
     east along the front street, up the market lane, back along the lane behind the plaza, so that the block stays on their right.
     Everyone is low-poly and flat-shaded (MeshStandardMaterial, flatShading), each figure one mesh of vertex colours; the trouser
     legs are one instanced mesh and step as they walk ---------- */
  const PROCESSION = {
    way: [[0, 54], [41, 54], [41, 77.5], [0, 77.5], [0, 72], [4.6, 69.5], [4.6, 61], [0, 54]],   // the loop of roads they walk, in order
    speed: .45,   // metres a second
    stride: 1.3,  // metres a full step takes (left and right)
    far: 150      // hidden when the walker is farther than this from the block
  };
  // the materials and small part-makers every builder below shares (made once, on the first call)
  let _proc = null;
  function procKit() {
    if (_proc) return _proc;
    const procM = std({ vertexColors: true, flatShading: true, roughness: .8 });
    const silkM = std({ vertexColors: true, flatShading: true, roughness: .35, metalness: .15 });   // the boys' silk, the gilding
    const shadeM = std({ vertexColors: true, flatShading: true, roughness: .45, metalness: .25, side: THREE.DoubleSide });   // parasols, seen from under too
    onDaylight(d => [procM, silkM, shadeM].forEach(m => m.emissive.copy(lerpC(0x1c1814, 0x000000, d))));
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n);
    const cone = (a, h, n = 8, open = false) => new THREE.ConeGeometry(a, h, n, 1, open), ball = (rad, det = 0) => new THREE.IcosahedronGeometry(rad, det);
    const Yup = V(0, 1, 0);
    // a part is [geo, colour, x, y, z, rx, ry, rz]; a rod runs from point a to point b (r128 geometry has no applyQuaternion)
    const place = ([geo, col, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0]) => { const q = geo.index ? geo.toNonIndexed() : geo.clone(); if (rz) q.rotateZ(rz); if (rx) q.rotateX(rx); if (ry) q.rotateY(ry); q.translate(x, y, z); return [q, col, 0, 0, 0]; };
    const rod = (a, b, r0, r1, col, n = 6) => { const d = V(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length(), q = cyl(r1, r0, L, n); q.translate(0, L / 2, 0); q.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(Yup, d.normalize()))); q.translate(a[0], a[1], a[2]); return [q, col]; };
    // lowPoly reads colours as linear; ours are written as seen
    const linear = geo => { const c = geo.attributes.color; for (let i = 0; i < c.array.length; i++) c.array[i] = Math.pow(c.array[i], 2.2); return geo; };
    const solid = (parts, mat, dx = 0, dy = 0, dz = 0) => { const geo = linear(lowPoly(parts.map(place))); if (dx || dy || dz) geo.translate(dx, dy, dz); const m = new THREE.Mesh(geo, mat); m.castShadow = false; return m; };
    // the trouser legs, white so the instance colour tints them, on a dark sandal; hung from the hip
    const legGeo = linear(lowPoly([[cyl(.1, .135, .74, 7), 0xffffff, 0, -.37, 0], [box(.1, .045, .22), 0x4a3a30, 0, -.78, .035]]));
    _proc = { procM, silkM, shadeM, box, cyl, cone, ball, rod, solid, legGeo };
    return _proc;
  }
  const P_SKIN = [0xd8a47a, 0xc89068, 0xe0b088, 0xb88058], P_INK = 0x1e1612, P_HAIR = 0x1a1412, P_GOLD = 0xe0b040;
  // a grown-up's head and neck, facing +z: a faceted face with eyes, brows and a mouth
  function procHead(p, skin, { y = 1.53, z = 0, s = 1, lips = 0x8a3a30 } = {}) {
    const K = procKit();
    p.push([K.cyl(.045 * s, .05 * s, .09 * s, 6), skin, 0, y - .14 * s, z], [K.ball(.115 * s, 1), skin, 0, y, z]);
    [-1, 1].forEach(sd => p.push([K.box(.03 * s, .022 * s, .01), P_INK, sd * .042 * s, y + .015 * s, z + .106 * s], [K.box(.04 * s, .01 * s, .01), P_INK, sd * .044 * s, y + .045 * s, z + .1 * s], [K.ball(.025 * s), skin, sd * .113 * s, y, z]));
    p.push([K.box(.05 * s, .014 * s, .01), lips, 0, y - .055 * s, z + .1 * s]);
  }
  // a grown-up's arm from the shoulder (side sd: +1 the figure's left) through elbow E to hand H; the forearm bare when `bare`
  function procArm(p, sd, sleeve, skin, E, H, bare) {
    const K = procKit(), S = [sd * .2, 1.3, 0];
    p.push(K.rod(S, E, .055, .047, sleeve), K.rod(E, H, .045, .038, bare ? skin : sleeve), [K.ball(.043), skin, ...H]);
  }
  // a grown-up's body above the legs: the seat of the baggy trousers, a jacket or shirt, shoulders, the head
  function procBody(p, { top, trousers, skin, long = false, skirt = null }) {
    const K = procKit();
    if (skirt) {   // a woven htamein to the ankle, in horizontal bands, and a fitted blouse to the waist
      const h = .9 / skirt.length;
      skirt.forEach((c, i) => { const y0 = .04 + i * h, r0 = .2 - y0 * .035, r1 = .2 - (y0 + h) * .035; p.push([K.cyl(r1, r0, h, 9), c, 0, y0 + h / 2, 0]); });
      p.push([K.cyl(.155, .165, .4, 9), top, 0, 1.13, 0]);
    } else {
      p.push([K.cyl(.2, .19, .22, 9), trousers, 0, .8, 0]);   // the deep seat of Shan trousers
      p.push([K.cyl(.16, long ? .2 : .18, long ? .6 : .52, 9), top, 0, long ? 1.03 : 1.07, 0]);
    }
    p.push([K.ball(.072), top, -.19, 1.3, 0], [K.ball(.072), top, .19, 1.3, 0]);
    procHead(p, skin);
  }
  // a man's cloth headwrap (gaung baung) in the jacket's colour, its knot and tail at the side
  function procHeadwrap(p, col) {
    const K = procKit();
    p.push([K.cyl(.126, .121, .1, 9), col, 0, 1.6, -.005], [K.cyl(.1, .124, .05, 9), col, 0, 1.67, -.005], [K.ball(.05), col, .11, 1.64, .02], [K.box(.05, .14, .02), col, .13, 1.55, .0, 0, 0, .25]);
  }
  // a red cord round the neck with its ends hanging down the chest
  function procCord(p) {
    const K = procKit();
    p.push([new THREE.TorusGeometry(.078, .011, 4, 10), 0xc8202a, 0, 1.36, .01, Math.PI / 2 - .25], K.rod([-.03, 1.33, .1], [-.02, 1.15, .17], .008, .008, 0xc8202a, 4), K.rod([.03, 1.33, .1], [.02, 1.15, .17], .008, .008, 0xc8202a, 4), [K.ball(.022), 0xc8202a, 0, 1.14, .175]);
  }
  // one walker: its mesh(es) in a group, and how its legs step
  function procFigure(parts, mat, legCol, swing, x, z = 0) {
    const f = new THREE.Group(); f.position.set(x, 0, z);
    const body = procKit().solid(parts, mat); f.add(body);
    f.userData = { body, legCol: new THREE.Color(legCol === null ? 0 : legCol).convertSRGBToLinear(), swing, phase: 0, legs: legCol !== null };
    return f;
  }

  /* ---------- a sang long riding his carrier's shoulders, and the man beside them under the golden parasol: the carrier in baggy
     golden-yellow Shan trousers, a t-shirt and a wide bamboo hat (ခမောက်), holding the boy's shins; the boy astride his shoulders
     (ခွစီး) in bright silk with gilt shoulder flares and a Shan novice's flower headdress, tiers of white, pink and yellow blossoms
     and a red spire, strands of jasmine hanging behind; the parasol bearer in a pastel jacket and headwrap holds the tall tiered
     parasol (hti) leaning over the boy. Returns a group, front +z, the carrier to the bearer's left ---------- */
  function createShinlaungPair(seed = 1) {
    const K = procKit(), r = rng(9300 + seed), pk = l => l[(r() * l.length) | 0];
    const unit = new THREE.Group(), walkers = [], shades = [];
    // the carrier
    const skin = pk(P_SKIN), shirt = pk([0xc83a32, 0x9ec8e8, 0xf2f0ea]), TROUSER = 0xe5a93b, cp = [];
    procBody(cp, { top: shirt, trousers: TROUSER, skin });
    [-1, 1].forEach(sd => procArm(cp, sd, shirt, skin, [sd * .3, 1.08, .1], [sd * .2, 1.27, .16], true));
    cp.push([K.cone(.27, .17, 10), 0xd8b868, 0, 1.72, .03, .2], [K.cyl(.272, .272, .014, 10), 0xb89848, 0, 1.64, .015, .2], [K.box(.2, .018, .02), P_HAIR, 0, 1.46, .105]);   // the bamboo hat, its rim; a moustache
    const carrier = procFigure(cp, K.procM, TROUSER, .3, .42); unit.add(carrier); walkers.push(carrier);
    // the boy, built about his seat on the carrier's shoulders so he can sway there
    const silk = pk([0x1fb8b0, 0xf0c428, 0xd82a30]), trim = silk === 0xf0c428 ? 0xd82a30 : P_GOLD, bskin = pk(P_SKIN), bp = [], SZ = -.2;
    bp.push([K.cyl(.11, .12, .13, 8), silk, 0, 1.5, SZ]);
    [-1, 1].forEach(sd => {
      const hip = [sd * .08, 1.5, SZ + .02], knee = [sd * .21, 1.44, .1], ankle = [sd * .19, 1.12, .15];
      bp.push(K.rod(hip, knee, .058, .052, silk), K.rod(knee, ankle, .048, .04, silk), [K.box(.07, .05, .14), 0xf4f0e6, sd * .19, 1.09, .19]);
      bp.push(K.rod([sd * .13, 1.86, SZ + .02], [sd * .21, 1.72, -.08], .04, .036, silk), K.rod([sd * .21, 1.72, -.08], [sd * .1, 1.77, 0], .034, .03, silk), [K.ball(.032), bskin, sd * .1, 1.78, .02]);   // hands on the carrier's hat
      bp.push([K.cone(.075, .13, 6), trim, sd * .16, 1.87, SZ, 0, 0, -sd * Math.PI / 2]);   // gilt flares at the shoulders
    });
    bp.push([K.cyl(.1, .125, .36, 9), silk, 0, 1.73, SZ], [K.cyl(.128, .128, .03, 9), trim, 0, 1.57, SZ], [K.cyl(.104, .104, .025, 9), trim, 0, 1.89, SZ]);   // the jacket, gilt bands at hem and collar
    bp.push([K.box(.03, .3, .012), trim, 0, 1.73, SZ + .115], [K.ball(.06), trim, 0, 1.82, SZ + .1]);   // its gilt front and a jewel at the chest
    procHead(bp, bskin, { y: 2.0, z: SZ, s: .85, lips: 0xc8283a });
    // the headdress: a gilt band, three tiers of blossoms narrowing upward, a white cap and the red spire
    const BLOOM = [0xf6f4ee, 0xf4b4c8, 0xf6e08a];
    bp.push([K.cyl(.102, .102, .045, 10), P_GOLD, 0, 2.06, SZ]);
    for (let i = 0; i < 11; i++) { const a = i / 11 * TAU; bp.push([K.ball(.036), BLOOM[i % 3], Math.sin(a) * .11, 2.1, SZ + Math.cos(a) * .11]); }
    for (let i = 0; i < 9; i++) { const a = (i + .5) / 9 * TAU; bp.push([K.cone(.03, .085, 5), BLOOM[(i + 1) % 3], Math.sin(a) * .085, 2.17, SZ + Math.cos(a) * .085]); }
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; bp.push([K.ball(.028), BLOOM[(i + 2) % 3], Math.sin(a) * .055, 2.235, SZ + Math.cos(a) * .055]); }
    bp.push([K.cone(.055, .12, 7), 0xf6f4ee, 0, 2.31, SZ], [K.ball(.022), 0xd82a30, 0, 2.37, SZ], [K.cone(.018, .2, 5), 0xd82a30, 0, 2.47, SZ]);
    // strands of jasmine hanging round the back and sides, clear of the face
    for (let i = 0; i < 9; i++) { const a = Math.PI * (.38 + i / 8 * 1.24), x = Math.sin(a) * .12, z = SZ + Math.cos(a) * .12; bp.push(K.rod([x, 2.07, z], [x * 1.05, 1.9, z], .006, .006, 0xf6f4ee, 3), [K.ball(.018), BLOOM[i % 2], x * 1.05, 1.89, z]); }
    const boy = K.solid(bp, K.silkM, 0, -1.5, -SZ); boy.position.set(0, 1.5, SZ); carrier.add(boy); carrier.userData.boy = boy;
    // the parasol bearer, in a pastel jacket, both hands on the pole
    const hskin = pk(P_SKIN), jacket = pk([0xf2dc78, 0xf2b0c0, 0xa8d0ec]), hp = [], A = [.12, .75, .28], T = [.85, 2.95, -.2];
    const on = y => { const u = (y - A[1]) / (T[1] - A[1]); return [A[0] + (T[0] - A[0]) * u, y, A[2] + (T[2] - A[2]) * u]; };
    procBody(hp, { top: jacket, trousers: 0x2e3446, skin: hskin, long: true }); procHeadwrap(hp, jacket); procCord(hp);
    procArm(hp, -1, jacket, hskin, [-.06, 1.0, .18], on(1.05)); procArm(hp, 1, jacket, hskin, [.33, 1.12, .04], on(1.38));
    hp.push(K.rod(A, T, .022, .018, 0xb8282a, 6), [K.ball(.03), P_GOLD, ...A]);   // the red lacquered pole
    const holder = procFigure(hp, K.procM, 0x2e3446, .3, -.43); unit.add(holder); walkers.push(holder);
    // the parasol: three gilt tiers, a fringe of white and red tassels, a little spire; it turns slowly on its pole
    const sp = [], GILT = 0xe8b02e, DEEP = 0xc8901e;
    sp.push([K.cone(.78, .3, 12, true), GILT, 0, 0, 0], [new THREE.CylinderGeometry(.78, .78, .07, 12, 1, true), DEEP, 0, -.18, 0], [K.cone(.48, .22, 10, true), DEEP, 0, .2, 0], [K.cone(.27, .17, 8, true), GILT, 0, .36, 0]);
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; sp.push([K.cone(.028, .13, 4), i % 2 ? 0xc8282a : 0xf6f2e4, Math.sin(a) * .78, -.28, Math.cos(a) * .78, Math.PI]); }
    sp.push([K.ball(.045), GILT, 0, .47, 0], [K.cone(.022, .22, 5), GILT, 0, .6, 0], [K.cyl(.012, .012, .3, 4), DEEP, 0, -.05, 0]);
    const shade = K.solid(sp, K.shadeM); shade.position.set(T[0], T[1] + .02, T[2]); holder.add(shade); shades.push(shade);
    unit.userData = { walkers, shades, poles: [] };
    return unit;
  }

  /* ---------- the families walking behind: a row of two. Men ("men") in pastel silk Shan jackets with headwraps to match, baggy
     trousers and red cords at the neck, one with a round ceremonial fan (ယပ်တောင်), one with a monk's black lacquered bowl for
     the novice-to-be; women ("women") in fitted Shan blouses and woven skirts banded across, each with a silver bowl holding a
     folded saffron robe. Returns a group, front +z ---------- */
  function createProcessionRelatives(kind = "men", seed = 1) {
    const K = procKit(), r = rng(9400 + seed), pk = l => l[(r() * l.length) | 0];
    const unit = new THREE.Group(), walkers = [];
    [.75, -.75].forEach((x, i) => {
      const skin = pk(P_SKIN), p = [];
      if (kind === "women") {
        const blouse = pk([0xf4c8d4, 0xf2f0ea, 0xc8e0f0, 0xf6e4a0, 0xd8c0e8]), A = pk([0x7a2a5a, 0x2a5a8a, 0x2f6a4a, 0xa83a30]), B = pk([0xe8b860, 0xf0ece0, 0xd86a8a]);
        procBody(p, { top: blouse, skin, skirt: [A, B, A, A, B, A, 0x2a2430, A, B, A] });
        [-1, 1].forEach(sd => procArm(p, sd, blouse, skin, [sd * .21, 1.02, .08], [sd * .12, 1.08, .3]));
        p.push([K.ball(.12, 1), P_HAIR, 0, 1.56, -.03], [K.ball(.065, 1), P_HAIR, 0, 1.62, -.13], [K.ball(.035), pk([0xf4f2ea, 0xe8608a, 0xf0c838]), .07, 1.65, -.12]);   // hair drawn back to a bun, a flower in it
        p.push([K.cyl(.13, .085, .1, 10), 0xd4d8dc, 0, 1.12, .32], [K.cyl(.06, .075, .05, 8), 0xb8bcc0, 0, 1.05, .32], [K.box(.17, .06, .13), 0xd8761e, 0, 1.19, .32], [K.box(.13, .04, .1), 0xe08a2a, 0, 1.24, .32]);   // the silver bowl, the robe folded on it
        unit.add(procFigure(p, K.procM, null, 0, x, i * .1));   // her legs are hidden under the skirt
      } else {
        const jacket = pk([0xf2dc78, 0xf2b0c0, 0xa8d0ec]), trousers = pk([0x2e3446, 0x4a3a2c, 0xe8e0cc]);
        procBody(p, { top: jacket, trousers, skin, long: true }); procHeadwrap(p, jacket); procCord(p);
        if (i === 0) {   // the round fan, held up before the chest by its handle
          procArm(p, -1, jacket, skin, [-.24, 1.02, .08], [-.12, 1.1, .3]); procArm(p, 1, jacket, skin, [.22, 1.0, -.02], [.21, .76, .05]);
          p.push(K.rod([-.12, 1.06, .31], [-.12, 1.3, .32], .012, .012, 0x6a4a2a, 5), [K.cyl(.19, .19, .02, 12), 0xf0e2b8, -.12, 1.46, .33, Math.PI / 2], [new THREE.TorusGeometry(.19, .014, 4, 12), P_GOLD, -.12, 1.46, .34]);
        } else {         // the monk's bowl in both hands, lid and knob, on its stand
          [-1, 1].forEach(sd => procArm(p, sd, jacket, skin, [sd * .22, 1.02, .08], [sd * .13, 1.08, .3]));
          p.push([K.cyl(.07, .08, .05, 8), 0x1c1614, 0, 1.08, .32], [new THREE.SphereGeometry(.12, 10, 6), 0x141010, 0, 1.18, .32], [K.cyl(.1, .12, .03, 10), 0x2a1a14, 0, 1.25, .32], [K.ball(.025), P_GOLD, 0, 1.28, .32]);
        }
        unit.add(procFigure(p, K.procM, trousers, .32, x, i * .1));
      }
    });
    unit.children.forEach(f => walkers.push(f));
    unit.userData = { walkers, shades: [], poles: [] };
    return unit;
  }

  /* ---------- the offering poles at the head of the procession: a tall green bamboo held upright by a man in a white shirt and
     headwrap, with lattices of pink and purple crossbars up its top half, each hung with gifts wrapped in white cloth and paper
     and streamers of coloured ribbon. `count` poles walk abreast; each sways as it is carried. Returns a group, front +z ---------- */
  function createOfferingPoles(count = 1, seed = 1) {
    const K = procKit(), r = rng(9500 + seed), pk = l => l[(r() * l.length) | 0];
    const unit = new THREE.Group(), walkers = [], poles = [];
    const RIBBON = [0xd82a30, 0xf0c428, 0x2a9a4a, 0x2a6ac8, 0xe86aa8, 0xf08a2a];
    for (let k = 0; k < count; k++) {
      const x = (k - (count - 1) / 2) * 2.1, skin = pk(P_SKIN), p = [], WHITE = 0xf2f0ea;
      procBody(p, { top: WHITE, trousers: pk([0x2e3446, 0x4a3a2c]), skin }); procHeadwrap(p, pk([WHITE, 0xf2dc78])); procCord(p);
      procArm(p, 1, WHITE, skin, [.24, 1.12, .12], [.035, 1.38, .3], true); procArm(p, -1, WHITE, skin, [-.24, .98, .1], [-.035, 1.05, .3], true);
      const bearer = procFigure(p, K.procM, 0x2e3446, .3, x); unit.add(bearer); walkers.push(bearer);
      // the pole, about the bearer's grip so it sways from his hands
      const pp = [], BAMBOO = 0xb8b468, NODE = 0x8a8a40;
      pp.push(K.rod([0, -.75, 0], [0, 4.3, 0], .04, .03, BAMBOO, 7));
      for (let y = -.5; y < 4.2; y += .48) pp.push([K.cyl(.043, .043, .025, 7), NODE, 0, y, 0]);
      [[2.2, .58], [2.75, .5], [3.3, .42], [3.85, .32]].forEach(([y, w], lv) => {
        const turn = lv % 2 ? Math.PI / 4 : 0, col = lv % 2 ? 0x9a62c0 : 0xe88ab8, c = Math.cos(turn), s = Math.sin(turn);
        const pt = (u, v) => [u * c - v * s, y, u * s + v * c];
        // the square of crossbars and the cross through the pole
        [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]].forEach(([a, b, e, f]) => pp.push(K.rod(pt(a * w, b * w), pt(e * w, f * w), .014, .014, col, 4)));
        pp.push(K.rod(pt(-w, -w), pt(w, w), .012, .012, col, 4), K.rod(pt(-w, w), pt(w, -w), .012, .012, col, 4));
        // a gift at each corner on its string, ribbons hanging from it
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => {
          const [gx, , gz] = pt(a * w, b * w), drop = .16 + r() * .08;
          pp.push(K.rod([gx, y, gz], [gx, y - drop, gz], .005, .005, 0xe8e4d8, 3), [K.ball(.07 + r() * .03), WHITE, gx, y - drop - .07, gz]);
          for (let q = 0; q < 2; q++) { const L = .3 + r() * .2; pp.push([K.box(.025, L, .006), pk(RIBBON), gx + (q - .5) * .05, y - drop - .12 - L / 2, gz, 0, r() * TAU, (r() - .5) * .3]); }
        });
      });
      pp.push([K.cone(.1, .26, 8), 0xe88ab8, 0, 4.42, 0], [K.ball(.05), P_GOLD, 0, 4.58, 0]);   // a paper crown at the top
      const pole = K.solid(pp, K.procM); pole.position.set(0, 1.2, .3); bearer.add(pole);
      pole.userData.seed = r() * TAU; poles.push(pole);
    }
    unit.userData = { walkers, shades: [], poles };
    return unit;
  }

  /* ---------- the whole procession, in marching order behind the poles: the men with fans and bowls, the three boys on
     their carriers' shoulders under their parasols, the women with the robes; walking round PROCESSION.way while FOLK.procession ---------- */
  function createShinlaungProcession(g) {
    const K = procKit(), root = new THREE.Group(); root.userData.noCull = true; root.visible = false; g.add(root);
    // the marching order: [unit, metres behind the head]
    const order = [
      [createOfferingPoles(1, 1), 0], [createOfferingPoles(2, 2), 2.4],
      [createProcessionRelatives("men", 1), 5], [createProcessionRelatives("men", 2), 6.5],
      [createShinlaungPair(1), 9.5], [createShinlaungPair(2), 13.3], [createShinlaungPair(3), 17.1],
      [createProcessionRelatives("women", 1), 20.6], [createProcessionRelatives("women", 2), 22], [createProcessionRelatives("women", 3), 23.4],
      [createProcessionRelatives("men", 3), 25.2]
    ];
    const units = order.map(([u, back]) => { u.userData.back = back; root.add(u); return u; });
    const walkers = []; units.forEach(u => u.userData.walkers.forEach(f => { f.userData.unit = u; walkers.push(f); }));
    // the trouser legs of everyone, two to a walker, as one instanced mesh
    const legs = new THREE.InstancedMesh(K.legGeo, K.procM, walkers.length * 2);
    legs.frustumCulled = false; legs.castShadow = false; root.add(legs);
    walkers.forEach((f, i) => { legs.setColorAt(i * 2, f.userData.legCol); legs.setColorAt(i * 2 + 1, f.userData.legCol); f.userData.lag = (i % 2) * .9 + (i % 3) * .4; });
    const data = { tip: "Poy Sang Long · ပွႆးသၢင်ႇလွင်း · ရှင်ပြုပွဲ", toast: "The Shan novice ordination, Poy Sang Long. Before the boys become novices they are dressed as princes, as the Buddha was before he left his palace, and carried round the town on the shoulders of their uncles and cousins, their feet never touching the ground, under golden parasols. Bamboo poles hung with gifts lead the way; the families follow with fans, monks' bowls and saffron robes for the new novices. The great festival comes in the dry season, in March and April." };
    walkers.forEach(f => { clickable(picks.pagoda, f.userData.body, data); if (f.userData.boy) clickable(picks.pagoda, f.userData.boy, data); });
    // the loop: corner points and the distance round to each
    const W = PROCESSION.way, cum = [0];
    for (let i = 1; i < W.length; i++) cum.push(cum[i - 1] + Math.hypot(W[i][0] - W[i - 1][0], W[i][1] - W[i - 1][1]));
    const L = cum[cum.length - 1], out = [0, 0];
    const at = s => { s = ((s % L) + L) % L; let i = 1; while (cum[i] < s) i++; const u = (s - cum[i - 1]) / (cum[i] - cum[i - 1]); out[0] = W[i - 1][0] + (W[i][0] - W[i - 1][0]) * u; out[1] = W[i - 1][1] + (W[i][1] - W[i - 1][1]) * u; return out; };
    const mid = W.reduce((a, [x, z]) => [a[0] + x / W.length, a[1] + z / W.length], [0, 0]);
    const zero = new THREE.Matrix4().makeScale(0, 0, 0), hip = new THREE.Matrix4(), rot = new THREE.Matrix4(), m = new THREE.Matrix4();
    let head = 0;
    updaters.pagoda.push((dt, t, motion) => {
      const eye = FEST.eye, show = FOLK.procession && (!eye || Math.hypot(eye.x - mid[0], eye.z - mid[1]) < PROCESSION.far);
      if (root.visible !== show) root.visible = show;
      if (!show) return;
      head = (head + PROCESSION.speed * Math.min(dt, .1)) % L;
      units.forEach(u => {
        const s = head - u.userData.back, [ax, az] = at(s - 1.2), [bx, bz] = at(s + 1.2), [x, z] = at(s);
        const w = walkAt(x, z);
        u.position.set(x, w === null ? terrainAt(x, z) : w, z); u.rotation.y = Math.atan2(bx - ax, bz - az);
        u.userData.walkers.forEach(f => {
          const d = f.userData, ph = (s / PROCESSION.stride) * TAU + d.lag;
          f.position.y = Math.abs(Math.cos(ph)) * .035 * motion; f.rotation.z = Math.sin(ph) * .025 * motion;
          if (d.boy) d.boy.rotation.z = Math.sin(ph + .8) * .04 * motion;
          d.phase = ph;
        });
        u.userData.shades.forEach(sh => { sh.rotation.y += dt * .5 * motion; });
        u.userData.poles.forEach(p => { const q = p.userData.seed; p.rotation.z = (Math.sin(t * 1.1 + q) * .045 + Math.sin(head * 2.4 + q) * .015) * motion; p.rotation.x = Math.sin(t * .8 + q * 1.7) * .03 * motion; });
        u.updateMatrix();
      });
      walkers.forEach((f, i) => {
        const d = f.userData; f.updateMatrix();
        if (!d.legs) { legs.setMatrixAt(i * 2, zero); legs.setMatrixAt(i * 2 + 1, zero); return; }
        [-1, 1].forEach((sd, k) => {
          rot.makeRotationX(sd * Math.sin(d.phase) * d.swing * Math.max(motion, .3)); hip.makeTranslation(sd * .1, .82, 0).multiply(rot);
          m.multiplyMatrices(d.unit.matrix, f.matrix).multiply(hip); legs.setMatrixAt(i * 2 + k, m);
        });
      });
      legs.instanceMatrix.needsUpdate = true;
    });
    return root;
  }
