  /* ---------- the stupa hill in the front-left corner, beyond the street and the town road: a grassy hill climbed by a stair
     of five flights with landings, set into the slope between whitewashed walls; on top a forest of Shan stupas in the style of
     Kakku (weathered sandstone, tiered bases with niches, ringed spires, dark iron hti crowns) round a white-and-gold main stupa ---------- */
  // stair proportions (metres): five flights of 19 steps, 17 cm risers and 32 cm treads, 2.5 m landings between flights
  // four flights of 22 steps (17 cm risers, 32 cm treads); the first two landings are wide terraces where the monasteries stand
  const STAIR = { flights: 4, steps: 22, tread: .32, landings: [17, 17, 2.5], pad: .6 };
  const HILL = (() => {
    const top = 15, rTop = 13, run = STAIR.flights * STAIR.steps * STAIR.tread + STAIR.landings.reduce((a, b) => a + b, 0);
    const rBase = rTop + run + STAIR.pad, rise = top / (STAIR.flights * STAIR.steps), flight = STAIR.steps * STAIR.tread;
    // the hill's profile (radius, height) follows the stair: a slope for each flight, a level terrace for each landing
    const prof = [[0, top], [rTop, top]], terraces = [];
    let r = rTop;
    for (let f = STAIR.flights - 1; f >= 0; f--) {
      const yHi = (f + 1) * STAIR.steps * rise, yLo = f * STAIR.steps * rise;
      if (f < STAIR.flights - 1) { const L = STAIR.landings[f]; if (L > 5) terraces.push({ y: yHi, r0: r, r1: r + L }); r += L; prof.push([r, yHi]); }
      r += flight; prof.push([r, yLo]);
    }
    prof.push([rBase, 0]);
    // the east stair's way down, aimed at the middle of the palace lane's west end so the stair and the lane meet head on
    const PL = LANES[4], ex = PL.x0 + 88, ez = (PL.z0 + PL.z1) / 2 - 140, el = Math.hypot(ex, ez), east = [ex / el, ez / el], eastReach = el;
    return { cx: -88, cz: 140, top, rTop, rBase, prof, terraces, to: [-45, 61], east, eastReach };   // `to`: the street corner the stair faces
  })();
  // the Shan names of the hill's main stupa and its monastery (Shan wording from the site's owner; have a native speaker check)
  const SHAN_NAMES = { stupa: "ၽြႃးမုင်ႈမိူင်း", kyaung: "ၵျွင်းၵွင်းမူးၶမ်း", kyaungLow: "ၵျွင်းလူင်ဝဵင်းၵဝ်", wihan: "ဝိႁၢၼ်ႇၵုင်းသႃႇ", haw: "ႁေႃၶမ်း", saopha: "ၸဝ်ႈၾႃႉ", council: "ႁူင်းႁေႃၸုမ်းၽွင်းမိူင်း" };
  // a name board's face: gold Shan lettering on red-brown lacquer in a double gold frame, with an optional line of English beneath
  function shanBoardFace(shan, en = "") {
    const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 300;
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
    const paint = () => {
      const c = cv.getContext("2d"), W = 1024, H = 300;
      c.fillStyle = "#5a1e12"; c.fillRect(0, 0, W, H);
      c.strokeStyle = "#d8b25a"; c.lineWidth = 10; c.strokeRect(14, 14, W - 28, H - 28); c.lineWidth = 3; c.strokeRect(32, 32, W - 64, H - 64);
      c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#f0cf72";
      c.font = '600 92px "Noto Sans Myanmar", "Myanmar Text", sans-serif'; c.fillText(shan, W / 2, en ? 128 : H / 2, W - 110);
      if (en) { c.font = '400 40px "Marcellus", serif'; c.fillText(en, W / 2, 232, W - 110); }
      t.needsUpdate = true;
    };
    paint();
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('600 92px "Noto Sans Myanmar"', shan), en && document.fonts.load('400 40px "Marcellus"', en)]).then(paint, () => {});
    return std({ map: t, roughness: .6, emissive: 0x222222, emissiveMap: t });
  }
  // the height of the land at (x, z): the hill's terraced profile, flat elsewhere
  const TALL = [];   // footprints of tall buildings outside the compound, {x0, x1, z0, z1, h}, that the outside camera stays above
  function groundAt(x, z) {
    for (const t of TALL) if (x > t.x0 && x < t.x1 && z > t.z0 && z < t.z1) return t.h;
    return terrainAt(x, z);
  }
  // the land itself, without buildings: what a walker stands on
  // surfaces a first-person walker can stand on beyond the bare land, filled in as the grounds are built
  const WALKABLE = { pond: null, pav: null, pagoda: null };
  let PAV_SEAT = null;
  const octA = (x, z) => Math.max(Math.abs(z), Math.abs(x), Math.abs(x + z) * Math.SQRT1_2, Math.abs(x - z) * Math.SQRT1_2);   // octagon "radius" by apothem
  // things a walker cannot pass: compound walls (as segments) and posts (as circles), set once the grounds are built
  const BLOCK = { segs: [], posts: [] };
  const segDist = (x, z, [ax, az, bx, bz]) => { const dx = bx - ax, dz = bz - az, t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1); return Math.hypot(x - ax - t * dx, z - az - t * dz); };
  // the height a walker stands at, at (x, z), or null where they cannot go (water, walls, posts, railings)
  // solids and raised surfaces attached to objects, in the object's own frame (resolved to world lazily, after the grounds are built):
  // { obj, rect: [x0, x1, z0, z1] | circle: [cx, cz, r], h: null (blocks) | number | (lx, lz) => number (a surface, in local units) }
  const SURF = [], PAD = .35, MONASTERIES = [], PALACE = {};   // PAD: a walker's own radius, in metres; PALACE.exit: where you come out of the Haw Kham's throne room
  let WALKER_Y = 0;   // the first-person walker's feet, set by the walk each step (temple.walkerY), for places with two floors over the same ground (the clock tower)
  const solid = (obj, shape, h = null) => { SURF.push({ obj, ...shape, h, inv: null }); };
  const sCircle = (obj, cx, cz, r) => solid(obj, { circle: [cx, cz, r] });
  const sRect = (obj, x0, x1, z0, z1, h = null) => solid(obj, { rect: [x0, x1, z0, z1] }, h);
  const _v = new THREE.Vector3();
  function surfAt(x, z) {
    for (const e of SURF) {
      if (!e.inv) { e.obj.updateMatrixWorld(true); e.inv = e.obj.matrixWorld.clone().invert(); e.sc = e.obj.matrixWorld.getMaxScaleOnAxis(); e.y = e.obj.getWorldPosition(_v).y; }
      _v.set(x, 0, z).applyMatrix4(e.inv);
      const pad = e.h === null ? PAD / e.sc : 0, lx = _v.x, lz = _v.z;
      let inside;
      if (e.circle) inside = Math.hypot(lx - e.circle[0], lz - e.circle[1]) < e.circle[2] + pad;
      else inside = lx > e.rect[0] - pad && lx < e.rect[1] + pad && lz > e.rect[2] - pad && lz < e.rect[3] + pad;
      if (!inside) continue;
      if (e.h === null) return { block: true };
      const h = typeof e.h === "function" ? e.h(lx, lz) : e.h;
      if (h === null) return { block: true };
      return { y: e.y + h * e.sc };
    }
    return null;
  }
  function walkAt(x, z) {
    const sf = surfAt(x, z);
    if (sf) return sf.block ? null : sf.y;
    for (const sg of BLOCK.segs) if (segDist(x, z, sg) < .55) return null;
    for (const [px, pz, r] of BLOCK.posts) if (Math.hypot(x - px, z - pz) < r) return null;
    const pv = WALKABLE.pav;
    if (pv) {
      const lx = x - pv.cx, lz = z - pv.cz, r = Math.hypot(lx, lz);
      if (r < pv.inner) return pv.PY;                                                       // the pavilion floor
      if (lx <= pv.stepX0 && lx >= pv.stepX1 && Math.abs(lz) < pv.stepHalf)                 // the steps from the bank
        return pv.PY * (lx - pv.stepX1) / (pv.stepX0 - pv.stepX1);
      if (r < 2.9) return lx < 0 && Math.abs(lz) < pv.stepHalf ? pv.PY : null;              // benches and posts all round, open at the entry
    }
    const pg = WALKABLE.pagoda;
    if (pg) {   // the pagoda: walls you cannot pass (tap the door to go in), the deck, its two stairs, the deck railing
      const A = octA(x, z);
      if (A < pg.wall + 1.8) return null;   // stop a step short of the walls and doors, so the camera never clips into them
      if (A <= pg.APD - .15) return pg.DECK;
      const az = Math.abs(z);
      if (Math.abs(x) < pg.STAIR / 2 - .1 && az >= pg.APD - .15 && az <= pg.APD + pg.stairRun) return pg.DECK * (1 - clamp((az - pg.APD) / pg.stairRun, 0, 1));
      if (A < pg.APD + .25) return null;
    }
    const pd = WALKABLE.pond;
    if (pd) {
      const b = pd.bridge, onX = Math.abs(x - pd.cx) < b.W / 2 - .15;
      const t = (z - b.z0) / b.L;
      if (onX && t >= 0 && t <= 1) return .65 + Math.sin(Math.PI * t) * b.H;                // over the arched bridge
      const end = Math.min(Math.abs(z - b.z0), Math.abs(z - b.z0 - b.L));
      if (onX && end < 1.68 && (z < b.z0 || z > b.z0 + b.L)) return .65 * (1 - Math.floor(end / .42 + 1e-6) / 4);   // the steps at its ends
      if (Math.abs(x - pd.cx) < pd.S + .6 && Math.abs(z - pd.cz) < pd.S + .6) return null; // the water and its coping
    }
    return terrainAt(x, z);
  }
  function terrainAt(x, z) {
    const r = Math.hypot(x - HILL.cx, z - HILL.cz), P = HILL.prof;
    if (r >= HILL.rBase) return 0;
    for (let i = 1; i < P.length; i++) if (r <= P[i][0]) { const [r0, y0] = P[i - 1], [r1, y1] = P[i]; return y0 + (y1 - y0) * (r - r0) / (r1 - r0 || 1); }
    return 0;
  }
  const SW_ = 3.6;   // the hill stair's width
  // the monasteries on the terraces (radial width W, depth D facing the stair, scaled up by SC) and how far they stand from the stair
  const MON = { W: 14, D: 11, SC: 1.8, run: 12 * .36, SWd: 3, PM: 2.2 };   // larger than the terraces: the plinths run out over the slope; SWd: its stair's width, PM: the walk round it on the plinth
  MON.off = SW_ / 2 + .6 + 1.6 + MON.run * MON.SC + MON.D * MON.SC / 2;
  // the monastery on the upper terrace, left of the hill stair (local -x), facing it: its stair comes down level with the landing
  // just below the next flight and runs on between low walls into the hill stair's own wall, so the two stairs are one.
  // `open`: the gap left in the hill stair's wall (local z), `reach`: the level walk from its stair's foot to that wall, in its own units
  function monasterySpot() {
    const t = HILL.terraces[0], half = (MON.SWd / 2 + .4) * MON.SC, z = -t.r0 - 1.2 - half - .4;
    const footX = MON.off - (MON.D / 2 + MON.run) * MON.SC, wallX = SW_ / 2 + .36;
    return { x: -MON.off, z, y: t.y, open: [z - MON.SWd / 2 * MON.SC, z + MON.SWd / 2 * MON.SC], reach: (footX - wallX) / MON.SC, edge: (footX - SW_ / 2) / MON.SC };
  }
  // the festival ground: an open field on the upper terrace across the stair from the monastery (local +x), in front of it,
  // laid square to the stair: its near end runs parallel to the stair wall, a strip of grass between, and its far end runs out
  // past the terrace's curve over the slope, held up by its retaining wall
  function festivalSpot() {
    const t = HILL.terraces[0], rm = (t.r0 + t.r1) / 2, T = 26;
    return { x: SW_ / 2 + .36 + 1 + T / 2, z: -rm, ry: Math.PI, y: t.y, R: 16, T };   // past the stair wall and a metre of grass, then half the field
  }
  // the second monastery (lowerKyaung), on the lower terrace below the festival ground, square to the stair and facing down the hill
  // like it: x, z its centre in the hill's frame, L its length along the terrace, D its depth. Placed by hand to keep 5 m from the
  // festival ground's retaining wall above, 4 m from the hill stair's wall, and its stair's foot short of the footpath along the
  // terrace's edge (the path runs on past its front corner); its back corner nearest the stair stands on the foot of the slope
  const LOW_KYAUNG = { x: 18.5, z: -55, L: 24, D: 8 };
  function lowerKyaungSpot() { return { ...LOW_KYAUNG, y: HILL.terraces[1].y }; }
  // the third monastery (wihanKyaung), on the same lower terrace past the second one's east end, squared to the terrace's curve:
  // a its angle round the hill from the stair (radians, toward the east stair), r the radius of its centre, L its length along
  // the terrace, D its depth, run its front stair. Placed by hand: 5 m from the second monastery, 3 m below the festival ground's
  // retaining wall, 4 m from the east stair's wall, its stair's foot on the terrace footpath (hillFootpath runs the path on to it)
  const WIHAN = { a: .908, r: 58, L: 26, D: 11, SX: 6, run: 3.6 };
  function wihanSpot() {
    const { a, r } = WIHAN, x = Math.sin(a) * r, z = -Math.cos(a) * r, ry = Math.PI - a;
    const fx = x + Math.cos(ry) * WIHAN.SX + Math.sin(ry) * (WIHAN.D / 2 + WIHAN.run), fz = z - Math.sin(ry) * WIHAN.SX + Math.cos(ry) * (WIHAN.D / 2 + WIHAN.run);
    return { ...WIHAN, x, z, ry, y: HILL.terraces[1].y, footA: Math.atan2(fx, -fz) };   // footA: its stair foot's angle round the hill
  }
  // the masked kinnara pair dancing on the festival ground's pavilion stage, in the ground's local frame (the stage's centre and
  // floor height); the kinnara dances alone in the afternoon, the pair in the evening, with the to between, see CONFIG.dancers and setDancers()
  const KINNARA = { y: 1.0, r: 1.15, turn: .22 };   // stage floor height (m), circle radius (m), turn speed (rad/s)
  // their audience: rows on arcs round the stage's centre, in front of it (the stage's front edge is 3.25 m out, its steps 4.5 m):
  // seated children close in, young people standing behind; `spread` is the arc's width in radians; `epic` rows come only for the
  // afternoon solo, the opening of the epic, when the crowd is biggest
  const AUDIENCE = { rows: [{ rad: 6.0, n: 10, sit: true, spread: 1.9 }, { rad: 7.8, n: 11, sit: false, spread: 1.7 },
    { rad: 6.9, n: 7, sit: true, spread: 1.45, epic: true }, { rad: 9.4, n: 12, sit: false, spread: 1.8, epic: true }, { rad: 10.8, n: 8, sit: false, spread: 1.45, epic: true }] };
  function shanStupaHill(g) {
    const list = picks.pagoda, { cx, cz, top, rTop, rBase } = HILL;
    const tip = { tip: `The stupa hill · climb the stair to ${SHAN_NAMES.stupa}` };
    // everything is built in the hill's own frame: centre at the origin, the stair coming up from local -z
    const dx = HILL.to[0] - cx, dz = HILL.to[1] - cz, dl = Math.hypot(dx, dz), dir = V(dx / dl, 0, dz / dl);
    const H = new THREE.Group(); H.position.set(cx, 0, cz); H.rotation.y = Math.atan2(-dir.x, -dir.z); g.add(H); H.updateMatrixWorld(true);
    HILL.group = H; HILL.stairW = SW_;
    // the hill: grass on the slopes, a paved terrace on top
    const grassTex = canvasTex(128, (c, sz) => { c.fillStyle = "#5a7a3a"; c.fillRect(0, 0, sz, sz); const r = rng(8); for (let i = 0; i < 700; i++) { const v = r(); c.fillStyle = v < .5 ? "rgba(40,70,30,.5)" : "rgba(120,150,70,.4)"; c.fillRect(r() * sz, r() * sz, 2, 3); } });
    grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping; grassTex.repeat.set(12, 3);
    const grass = std({ map: grassTex, roughness: 1 });
    onDaylight(d => grass.color.copy(lerpC(0x3a4a34, 0xffffff, d)));
    const prof0 = [[0, top + .02], [rTop - .4, top + .02], ...HILL.prof.slice(1).map(([rr, yy]) => [rr, yy - .08]), [rBase + 4, -.6]], prof = [];   // a little below the treads
    prof0.forEach(([rr, yy], i) => { if (!i) return prof.push([rr, yy]); const [r0, y0] = prof0[i - 1], k = Math.max(1, Math.ceil((rr - r0) / .8)); for (let j = 1; j <= k; j++) prof.push([r0 + (rr - r0) * j / k, y0 + (yy - y0) * j / k]); });   // points every 0.8 m, so the cut below is clean
    const hillGeo = new THREE.LatheGeometry(prof.reverse().map(([x, y]) => new THREE.Vector2(x, y)), 180);   // outside in, so the faces point outward
    {   // cut the slope back to the terrace where the monastery's plinth runs into it
      const ms = monasterySpot(), hx = (MON.D / 2 + MON.PM) * MON.SC, hz = (MON.W / 2 + MON.PM) * MON.SC + 1, hp = hillGeo.attributes.position;
      for (let i = 0; i < hp.count; i++) if (hp.getX(i) > ms.x - hx - 1 && hp.getX(i) < ms.x + hx + 1.5 && Math.abs(hp.getZ(i) - ms.z) < hz) hp.setY(i, Math.min(hp.getY(i), ms.y - .1));
      hillGeo.computeVertexNormals();
    }
    const hill = mesh(hillGeo, grass, 0, 0, 0, H); hill.castShadow = false;
    clickable(list, hill, tip);
    const pave = canvasTex(256, (c, sz) => { c.fillStyle = "#cfc6b4"; c.fillRect(0, 0, sz, sz); for (let r = 0; r < 8; r++) for (let k = 0; k < 8; k++) { const v = 200 + ((r * 5 + k * 3) % 4) * 8; c.fillStyle = `rgb(${v},${v - 6},${v - 18})`; c.fillRect(k * 32 + 1, r * 32 + 1, 30, 30); } });
    pave.wrapS = pave.wrapT = THREE.RepeatWrapping; pave.repeat.set(7, 7);
    clickable(list, flat(mesh(new THREE.CircleGeometry(rTop - .6, 48), std({ map: pave, roughness: .85 }), 0, top + .04, 0, H)), tip).rotation.x = -Math.PI / 2;
    // the stair, from the foot (local z = -rBase) to the hilltop edge (local z = -rTop): flights and landings
    // the hill's profile is the same all round, so a second stair is the same stair turned: built in a frame F whose local -z
    // points down the stair; `ms`: the monastery whose stair joins this one's wall on the upper terrace, if any
    const SW = SW_, rise = top / (STAIR.flights * STAIR.steps), z0 = -rBase + STAIR.pad, DEEP = 1.8;
    const stepMat = std({ color: 0xffffff, roughness: .85 }), whiteWash = std({ color: 0xf2eee4, roughness: .8 });
    function hillStair(F, ms, tip) {
      const treads = [], line = [[-rBase, 0], [z0, 0]];   // `line`: the walking surface, for the lamps
      let seg = [[-rBase, 0], [z0, 0]];
      const segs = [seg];   // the side walls, broken open across the wide terraces so paths can lead off to the monasteries
      const left = [];   // left: wall on the monastery's side only, across the upper terrace either side of its stair
      let z = z0, y = 0;
      for (let f = 0; f < STAIR.flights; f++) {
        for (let i = 0; i < STAIR.steps; i++) { y += rise; treads.push({ z, y, d: STAIR.tread }); z += STAIR.tread; }
        line.push([z, y]); seg.push([z, y]);
        if (f < STAIR.flights - 1) {
          const L = STAIR.landings[f];
          treads.push({ z, y, d: L, landing: true });
          if (L > 5) {
            seg.push([z + 1.2, y]); seg = [[z + L - 1.2, y]]; segs.push(seg);
            if (ms && Math.abs(y - ms.y) < .01) left.push([[z + 1.2, y], [ms.open[0], y]], [[ms.open[1], y], [z + L - 1.2, y]]);
          } else seg.push([z + L, y]);
          z += L; line.push([z, y]);
        }
      }
      line.push([-rTop + .5, top]); seg.push([-rTop + .5, top]);
      const stairs = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), stepMat, treads.length), m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(), tc = new THREE.Color();
      treads.forEach((t, i) => {
        stairs.setMatrixAt(i, m4.compose(V(0, t.y - DEEP / 2, t.z + t.d / 2), q0, V(SW, DEEP, t.d + .01)));
        const k = t.landing ? .86 : .9 + ((i * 29) % 11) / 11 * .08; stairs.setColorAt(i, tc.setRGB(k, k * .97, k * .92));   // worn stone, landings darker
      });
      stairs.castShadow = true; stairs.receiveShadow = true; F.add(stairs); clickable(list, stairs, tip);
      // nosing lines: a thin darker edge on every step so the treads read clearly
      const nose = new THREE.InstancedMesh(new THREE.BoxGeometry(SW, .03, .04), std({ color: 0x9a9284, roughness: .9 }), treads.length);
      treads.forEach((t, i) => nose.setMatrixAt(i, m4.makeTranslation(0, t.y - .01, t.z + .02))); F.add(nose);
      // side walls that follow the flights and step level at the landings, a handrail coping on top
      const wallShape = (pl, h, below) => {
        const sh = new THREE.Shape();
        pl.forEach(([zz, yy], i) => i ? sh.lineTo(zz, yy + h) : sh.moveTo(zz, yy + h));
        for (let i = pl.length - 1; i >= 0; i--) sh.lineTo(pl[i][0], pl[i][1] - below);
        sh.closePath(); return sh;
      };
      [-1, 1].forEach(sd => {
        (sd < 0 ? [...segs, ...left] : segs).forEach(pl => {
          const wg = new THREE.ExtrudeGeometry(wallShape(pl, .95, DEEP), { depth: .36, bevelEnabled: false }); wg.rotateY(-Math.PI / 2);
          mesh(wg, whiteWash, sd * (SW / 2 + (sd > 0 ? .36 : 0)), 0, 0, F);
          const cg = new THREE.ExtrudeGeometry(wallShape(pl, 1.07, -.95), { depth: .5, bevelEnabled: false }); cg.rotateY(-Math.PI / 2);
          mesh(cg, M.trim, sd * (SW / 2 + (sd > 0 ? .43 : -.07)), 0, 0, F);
        });
        line.forEach(([zz, yy], i) => { if (i < 2 || i % 2) return;   // a lamp post at every landing
          const x = sd * (SW / 2 + .18);
          mesh(new THREE.BoxGeometry(.3, .6, .3), whiteWash, x, yy + 1.3, zz, F);
          const gl = glowSprite(0xffd8a0, 1.1, .8); gl.material.fog = false; gl.position.set(x, yy + 1.7, zz); F.add(gl);
          onDaylight(d => gl.material.opacity = .85 * (1 - d) + .05);
        });
      });
    }
    hillStair(H, monasterySpot(), tip);
    // the east stair, from the lane past the Haw Kham: the same stair turned to face the palace, its foot between two
    // whitewashed pillars crowned with lotus buds, a short paved walk out to the lane
    const E = new THREE.Group(); E.position.set(cx, 0, cz); E.rotation.y = Math.atan2(-HILL.east[0], -HILL.east[1]); g.add(E);
    hillStair(E, null, { tip: `The east stair · up to ${SHAN_NAMES.stupa} from the Haw Kham` });
    {   // the walk from the stair's foot out to the lane, running a metre in under the lane's end so the joint is hidden
      const a = rBase - .2, b = HILL.eastReach + 1;
      flat(mesh(new THREE.BoxGeometry(SW, .04, b - a), M.stone, 0, .02, -(a + b) / 2, E));
    }
    [-1, 1].forEach(sd => {
      const x = sd * (SW / 2 + .7);
      mesh(new THREE.BoxGeometry(.8, 2.2, .8), whiteWash, x, 1.1, -rBase - .2, E); sRect(E, x - .4, x + .4, -rBase - .6, -rBase + .2);
      mesh(new THREE.BoxGeometry(.92, .1, .92), M.trim, x, 2.25, -rBase - .2, E);
      const bud = mesh(new THREE.SphereGeometry(.26, 14, 10), whiteWash, x, 2.55, -rBase - .2, E); bud.scale.y = 1.35;
      mesh(new THREE.ConeGeometry(.09, .4, 10), M.gold, x, 2.95, -rBase - .2, E);
    });
    // in the hill's own frame, the way the east stair comes up: kept clear of stupas and pines
    const eA = E.rotation.y - H.rotation.y, eDir = [-Math.sin(eA), -Math.cos(eA)];
    const onEast = (x, zz, w) => x * eDir[0] + zz * eDir[1] > 0 && Math.abs(x * eDir[1] - zz * eDir[0]) < w;

    // the approach: a path out to the street corner, and a zebra crossing over the street
    const foot = V(cx, 0, cz).addScaledVector(dir, rBase);
    const pathLen = Math.max(3, (foot.z - 60.8) / -dir.z);
    flat(mesh(new THREE.BoxGeometry(3.6, .06, pathLen + .4), M.stone, 0, .03, -rBase - pathLen / 2, H));
    const xc = Math.min(-47.5, foot.x + dir.x * pathLen);
    for (let i = 0; i < 6; i++) flat(mesh(new THREE.BoxGeometry(.5, .02, 7.6), std({ color: 0xf4f0e6, roughness: .7 }), xc - 2.5 + i, .05, 54, g));
    // stupas, one instanced mesh per part: weathered sandstone with darker blotches, dark iron hti crowns
    const stoneTex = canvasTex(128, (c, sz) => { c.fillStyle = "#c89c84"; c.fillRect(0, 0, sz, sz); const r = rng(12); for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(${60 + r() * 40 | 0},${50 + r() * 30 | 0},${40 + r() * 30 | 0},${.1 + r() * .18})`; c.beginPath(); c.arc(r() * sz, r() * sz, 2 + r() * 8, 0, TAU); c.fill(); } });
    stoneTex.wrapS = stoneTex.wrapT = THREE.RepeatWrapping;
    const stone = std({ map: stoneTex, roughness: .9 }), iron = std({ color: 0x2a2826, roughness: .5, metalness: .6 }), niche = std({ color: 0x2a1c14, roughness: 1 });
    const lath = (pts, seg = 16) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
    const ringPts = []; for (let i = 0; i <= 14; i++) { const yy = 3.4 + i * .1, r = .5 - i * .022; ringPts.push([r + (i % 2 ? .05 : 0), yy]); }
    const PARTS = [
      [new THREE.BoxGeometry(2.2, .5, 2.2), stone, 0, .25, 0], [new THREE.BoxGeometry(1.9, .4, 1.9), stone, 0, .7, 0],
      [new THREE.BoxGeometry(1.5, 1.6, 1.5), stone, 0, 1.7, 0], [new THREE.BoxGeometry(1.62, .14, 1.62), stone, 0, 2.55, 0],
      [lath([[0, 2.6], [.72, 2.6], [.68, 2.9], [.5, 3.3], [.48, 3.4], [0, 3.4]]), stone, 0, 0, 0],
      [lath([[0, 3.4], ...ringPts, [0, 4.8]]), stone, 0, 0, 0],
      [lath([[0, 4.8], [.2, 4.8], [.26, 5.1], [.16, 5.5], [.02, 5.75], [0, 5.75]]), stone, 0, 0, 0],
      [new THREE.ConeGeometry(.34, .5, 10, 1, true), iron, 0, 5.75, 0], [new THREE.ConeGeometry(.25, .45, 10, 1, true), iron, 0, 6.1, 0],
      [new THREE.ConeGeometry(.16, .45, 10, 1, true), iron, 0, 6.45, 0], [new THREE.CylinderGeometry(.015, .015, 1.0, 4), iron, 0, 7.1, 0]
    ];
    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach(a => {   // a niche with a pointed pediment on each face
      const d = .77, n = new THREE.BoxGeometry(.42, .8, .06); n.rotateY(a); n.translate(Math.sin(a) * d, 1.6, Math.cos(a) * d); PARTS.push([n, niche, 0, 0, 0]);
      const pp = new THREE.ConeGeometry(.3, .6, 4); pp.rotateY(Math.PI / 4); pp.scale(1, 1, .2); pp.rotateY(a); pp.translate(Math.sin(a) * d, 2.3, Math.cos(a) * d); PARTS.push([pp, stone, 0, 0, 0]);
    });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => PARTS.push([new THREE.ConeGeometry(.11, .7, 6), stone, a * .68, 2.95, b * .68]));
    const spots = [], r = rng(77);
    for (let x = -12; x <= 12; x += 2.6) for (let zz = -12; zz <= 12; zz += 2.6) {
      if (Math.abs(x) < 2.6 && zz < 0) continue;               // the path from the stair to the main stupa
      if (Math.abs(x) < 6.2 && Math.abs(zz) < 6.2) continue;   // the main stupa's terrace
      if (onEast(x, zz, 2.6)) continue;                         // and the path from the east stair
      if (Math.hypot(x, zz) > rTop - 1.6) continue;
      spots.push({ x, y: top, z: zz, s: .55 + r() * .35, ry: [0, Math.PI / 2][(r() * 2) | 0] });
      sCircle(H, x, zz, 1.15 * spots[spots.length - 1].s);
    }
    const GATE_H = 3.8;   // the entrance pillars' height: the name board's beam rests on them, well over a walker's head
    [-1, 1].forEach(sd => spots.push({ x: sd * (SW / 2 + .9), y: GATE_H, z: -rBase - .2, s: .32, ry: 0 }));   // on the entrance pillars
    const pm = new THREE.Matrix4(), tint = new THREE.Color();
    PARTS.forEach(([geo, mat, px, py, pz]) => {
      const im = new THREE.InstancedMesh(geo, mat, spots.length);
      spots.forEach((sp, i) => {
        const q = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), sp.ry), off = V(px, py, pz).applyQuaternion(q).multiplyScalar(sp.s);
        im.setMatrixAt(i, pm.compose(V(sp.x, sp.y, sp.z).add(off), q, V(sp.s, sp.s, sp.s)));
        if (mat === stone) { const k = .82 + ((i * 37) % 19) / 19 * .3; im.setColorAt(i, tint.setRGB(k, k * .97, k * .95)); }
      });
      im.castShadow = true; im.receiveShadow = true; H.add(im);
      if (mat === stone) clickable(list, im, { tip: "Shan stupas · in the style of Kakku" });
    });
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.9, GATE_H, .9), whiteWash, sd * (SW / 2 + .9), GATE_H / 2, -rBase - .2, H));
    {   // the stupa's name board over the entrance, on a gilded beam between the pillars, lettered on both faces
      const face = shanBoardFace(SHAN_NAMES.stupa), BW = 3.4, BH = BW * 300 / 1024, by = GATE_H + .1 + BH / 2;
      mesh(new THREE.BoxGeometry(SW + 1.8 + .9, .2, .3), M.gold, 0, GATE_H + .1, -rBase - .2, H);
      clickable(list, mesh(new THREE.BoxGeometry(BW, BH, .1), [M.lacquer, M.lacquer, M.lacquer, M.lacquer, face, face], 0, by, -rBase - .2, H), { tip: `${SHAN_NAMES.stupa} · the main stupa`, toast: `${SHAN_NAMES.stupa}, the main stupa of the hill: climb the stair past the monastery ${SHAN_NAMES.kyaung} to the white-and-gold stupa among the Shan stupas at the top.` });
      mesh(new THREE.ConeGeometry(.5, .5, 4), M.gold, 0, by + BH / 2 + .25, -rBase - .2, H).scale.z = .15;
    }
    // the main stupa: a stepped white terrace, a white bell and a gilded spire with its hti
    const gold = M.gold, MS = new THREE.Group(); MS.position.set(0, top, 0); H.add(MS);
    // the main stupa: its body blocks; the three tiers of its terrace are surfaces you climb by the front steps
    sRect(MS, -2.8, 2.8, -2.8, 2.8);
    sRect(MS, -1.2, 1.2, -6.85, -3.85, (lx, lz) => clamp((lz + 6.85) / 3 * 1.8, 0, 1.8));
    sRect(MS, -5.5, 5.5, -5.5, 5.5, (lx, lz) => { const m = Math.max(Math.abs(lx), Math.abs(lz)); return m < 3.7 ? 1.8 : m < 4.5 ? 1.2 : .6; });
    [[11, .6], [9, 1.2], [7.4, 1.8]].forEach(([w, yy]) => mesh(new THREE.BoxGeometry(w, .6, w), whiteWash, 0, yy - .3, 0, MS));
    for (let i = 0; i < 6; i++) { const y1 = (i + 1) * .3; mesh(new THREE.BoxGeometry(2.4, y1, .52), whiteWash, 0, y1 / 2, -6.6 + i * .5, MS); }
    mesh(new THREE.BoxGeometry(5.6, 3.2, 5.6), whiteWash, 0, 3.4, 0, MS);
    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach(a => { const n = mesh(new THREE.BoxGeometry(1.2, 2.0, .1), niche, Math.sin(a) * 2.82, 3.1, Math.cos(a) * 2.82, MS); n.rotation.y = a; const pd = mesh(new THREE.ConeGeometry(.8, .9, 4), gold, Math.sin(a) * 2.85, 4.55, Math.cos(a) * 2.85, MS); pd.rotation.y = a; pd.scale.z = .15; });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => mesh(new THREE.ConeGeometry(.3, 2.0, 8), gold, a * 2.55, 6.0, b * 2.55, MS));
    MS.add(new THREE.Mesh(lath([[0, 5], [2.4, 5], [2.3, 5.8], [1.8, 7.0], [1.4, 7.6], [0, 7.6]], 32), whiteWash));
    const rings = []; for (let i = 0; i <= 16; i++) rings.push([1.3 - i * .055 + (i % 2 ? .12 : 0), 7.6 + i * .2]);
    MS.add(new THREE.Mesh(lath([[0, 7.6], ...rings, [0, 10.8]], 32), gold));
    MS.add(new THREE.Mesh(lath([[0, 10.8], [.5, 10.8], [.6, 11.4], [.35, 12.4], [.05, 13.0], [0, 13.0]], 24), gold));
    [[.9, 13.1], [.68, 13.7], [.48, 14.3], [.3, 14.9]].forEach(([rr, yy]) => mesh(new THREE.ConeGeometry(rr, .6, 16, 1, true), gold, 0, yy, 0, MS));
    mesh(new THREE.CylinderGeometry(.03, .03, 1.6, 6), gold, 0, 16.0, 0, MS);
    mesh(new THREE.SphereGeometry(.16, 12, 10), std({ color: 0xfff2c0, emissive: 0xffd070, emissiveIntensity: .8 }), 0, 16.9, 0, MS);
    MS.traverse(o => { if (o.isMesh) { o.castShadow = true; clickable(list, o, { tip: `${SHAN_NAMES.stupa} · the main stupa on the hill` }); } });
    const flood = new THREE.SpotLight(0xffe0b0, 0, 40, .5, .6, 1); flood.position.set(0, 4, -16); flood.target.position.set(0, 8, 0); MS.add(flood, flood.target);
    onDaylight(d => flood.intensity = 2.4 * (1 - d));
    // pines on the slopes clear of the stair
    let seed = 400;
    for (let i = 0; i < 32; i++) {
      const a = i / 32 * TAU + .1, rr = rTop + 6 + (i % 4) * 8, x = Math.sin(a) * rr, zz = Math.cos(a) * rr;
      if (Math.abs(x) < 30 && zz < 0) continue;   // keep the stair and the monastery terraces clear
      if (onEast(x, zz, 8)) continue;               // and the east stair
      { const f = festivalSpot(); if (Math.hypot(x - f.x, zz - f.z) < 20) continue; }   // and the festival ground
      const t = pine(H, x, zz, .9, seed++); t.position.y = groundAt(cx + rr, cz) - .1;
    }
  }
