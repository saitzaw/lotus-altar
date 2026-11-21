  /* ---------- မီးလျှော်ပွဲ၊ မီးကြာစံပွဲ the fire lotus ground, on the stupa hill's lower terrace between the north and the west stairs,
     looking out over the stadium quarter to the hills: like the fire balloon ground across the hill, the terrace carried out level over
     the slope on a whitewashed retaining wall with a parapet and lamp posts, and stepped terraces for the crowd up the slope behind.
     In Tazaungmon, up to the full moon, teams build tall towers of bamboo lashed in a lattice, wrapped in red and white, stayed with
     ropes and propped on a bamboo A-frame, and pack them with home-made fireworks. After dark they light them one at a time as an
     offering of fire: the racks catch from the foot upward, each throwing gold fountains and burning red flares in its own smoke, until
     the fire lotus (မီးကြာ) at the top opens in great drooping petals of sparks over the crowd ---------- */
  // how far the field stops short of the north and west stairs (radians round the hill), its outer edge r1, where its end walls begin
  // (the terrace's edge), parapet height and thickness; the crowd's terraces (`tiers` steps up to the upper terrace) stop `tierIn` short
  // of the field's ends; the towers (fraction along the field, radius), their height and the rope ring kept clear round each (m);
  // the show: a tower is lit every cycle / towers.length s, its racks catching one after another over `fuse` s, each burning `burn` s,
  // then the fire lotus at the top for `lotus` s
  const FIRE_GROUND = { da: .11, r1: 75, edge: 70.4, PH: .95, PW: .35, tiers: 9, tierIn: .08,
    towers: [[.17, 60], [.5, 58.5], [.83, 60]], tall: 24, clear: 7.5, racks: 8, cycle: 300, fuse: 36, burn: 12, lotus: 34 };
  // the field's angles round the hill (from the main stair toward the east stair, as for the balloon ground)
  const fireLotusArc = () => [MORE_STAIRS.north + FIRE_GROUND.da, MORE_STAIRS.west + TAU - FIRE_GROUND.da];
  function fireLotusGround(g) {
    const F = FIRE_GROUND, H = HILL.group, list = picks.pagoda, r = rng(5160);
    const lo = HILL.terraces[1], up = HILL.terraces[0], top = lo.y + .03, rIn = lo.r0, [a0, a1] = fireLotusArc(), PH = F.PH, PW = F.PW;
    const at = (a, rr) => [rr * Math.sin(a), -rr * Math.cos(a)];   // hill frame (x, z) at angle a, radius rr
    const wash = std({ color: 0xf2eee4, roughness: .8 });
    const data = { tip: "The fire lotus ground · မီးလျှော်ပွဲ၊ မီးကြာစံပွဲ", toast: "The fire lotus ground, for the fire offering (မီးလျှော်ပွဲ) and the fire lotus show (မီးကြာစံပွဲ). In the month of Tazaungmon, up to its full moon, Shan and Burmese towns offer fire and light. Teams build tall towers of bamboo lashed in a lattice, wrap them in red and white, stay them with ropes and prop them on a bamboo A-frame, and pack them with fireworks they have made themselves. After dark they are lit one at a time before the crowd: the racks catch from the foot of the tower upward, each throwing out gold fountains and burning red flares in its own smoke, until the fire lotus (မီးကြာ) at the top opens in great drooping petals of sparks. The crowd cheers the tower that burns longest and brightest. Here a tower is lit about every hundred seconds from seven in the evening until midnight; none in the rain, when the fuses will not take." };
    // the field: red earth trodden bare, the grass worn back to its edges
    const fieldTex = canvasTex(256, (c, sz) => { c.fillStyle = "#8a6a48"; c.fillRect(0, 0, sz, sz); const q = rng(61); for (let i = 0; i < 90; i++) { c.fillStyle = q() < .35 ? `rgba(90,110,60,${.25 + q() * .3})` : `rgba(${120 + q() * 40 | 0},${80 + q() * 20 | 0},${50 + q() * 20 | 0},${.25 + q() * .3})`; c.beginPath(); c.ellipse(q() * sz, q() * sz, 6 + q() * 22, 4 + q() * 12, q() * 3, 0, TAU); c.fill(); } for (let i = 0; i < 900; i++) { c.fillStyle = q() < .5 ? "rgba(70,50,30,.4)" : "rgba(170,130,90,.35)"; c.fillRect(q() * sz, q() * sz, 2, 2); } });
    fieldTex.wrapS = fieldTex.wrapT = THREE.RepeatWrapping; fieldTex.repeat.set(.08, .08);   // the top's UVs are in metres
    const field = std({ map: fieldTex, roughness: 1 });
    onDaylight(d => field.color.copy(lerpC(0x3a3430, 0xffffff, d)));
    const deck = arcSlab(H, rIn, F.r1, a0, a1, .2, top, [field, wash]); deck.castShadow = false; deck.receiveShadow = true;
    clickable(list, deck, data);
    // the parapet along the outer edge and the end walls, capped in gilt, with lamp posts along it
    const da = PW / F.edge;
    arcSlab(H, F.r1 - PW, F.r1, a0, a1, top, top + PH, wash);
    arcSlab(H, F.r1 - PW - .07, F.r1 + .07, a0 - .001, a1 + .001, top + PH, top + PH + .12, M.trim);
    [[a0, a0 + da, -.001, .0005], [a1 - da, a1, -.0005, .001]].forEach(([b0, b1, e0, e1]) => {
      arcSlab(H, F.edge, F.r1 - PW, b0, b1, top, top + PH, wash);
      arcSlab(H, F.edge - .07, F.r1 - PW, b0 + e0, b1 + e1, top + PH, top + PH + .12, M.trim);
    });
    const nL = Math.round((a1 - a0) * F.r1 / 11) + 1;
    for (let i = 0; i < nL; i++) {
      const a = a0 + .03 + i * (a1 - a0 - .06) / (nL - 1), [x, z] = at(a, F.r1 - PW / 2);
      mesh(new THREE.BoxGeometry(.3, .6, .3), wash, x, top + PH + .42, z, H).rotation.y = -a;
      const gl = glowSprite(0xffd8a0, 1.1, .8); gl.material.fog = false; gl.position.set(x, top + PH + .82, z); H.add(gl);
      onDaylight(d => gl.material.opacity = .85 * (1 - d) + .05);
    }
    // the crowd's terraces, steps cut into the slope up to the upper terrace, as at the balloon ground
    const ta0 = a0 + F.tierIn, ta1 = a1 - F.tierIn, tD = (rIn - up.r1) / F.tiers, tR = (up.y - lo.y) / F.tiers;
    const tierTop = i => lo.y + (i + 1) * tR + .02, tierR = i => rIn - (i + .5) * tD;
    const concrete = std({ color: 0xd6d0c4, roughness: .9 });
    for (let i = 0; i < F.tiers; i++) {
      const t = arcSlab(H, rIn - (i + 1) * tD, rIn - i * tD, ta0, ta1, lo.y - .3, tierTop(i), [concrete, wash]);
      t.castShadow = false; clickable(list, t, { tip: "The terraces over the fire lotus ground", toast: "Steps cut into the hill for the crowd to sit on and watch the fire towers burn. They climb all the way to the upper terrace." });
    }
    // a board at each end, facing the stair it is reached from: Burmese over English on lacquer between white posts
    [[a0 + .035, 0], [a1 - .035, Math.PI]].forEach(([a, turn]) => {
      const [x, z] = at(a, 59), S = new THREE.Group(); S.position.set(x, top, z); S.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)) + turn; H.add(S);
      const face = shanBoardFace("မီးလျှော်ပွဲ၊ မီးကြာစံပွဲ", "Fire Offering · Fire Lotus Festival"), BW = 3.6, BH = BW * 300 / 1024;
      [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(.24, 2.6, .24), wash, sd * (BW / 2 + .1), 1.3, 0, S); mesh(new THREE.ConeGeometry(.16, .3, 8), M.gold, sd * (BW / 2 + .1), 2.75, 0, S); });
      clickable(list, mesh(new THREE.BoxGeometry(BW, BH, .08), [M.lacquer, M.lacquer, M.lacquer, M.lacquer, face, face], 0, 2.6 - BH / 2 - .1, 0, S), data);
    });
    // the towers: four bamboo poles leaning in from a broad foot, lashed with a ring every 1.6 m wrapped by turns in red and white cloth,
    // braced corner to corner up each face; stayed by four ropes to stakes, an A-frame of two long poles propped against one side, a
    // rack of fireworks (bundles of paper tubes) at every few rings, turning round the tower, and on top the paper fire lotus.
    // Each tower is one mesh of parts in vertex colours; the rope ring round it, keeping the crowd back, likewise
    const T = F.tall, W0 = .95, W1 = .32, half = y => W0 + (W1 - W0) * y / T, _up = V(0, 1, 0);
    const rod = (a, b, rad, col, n = 5) => {   // a pole from point a to point b
      const d = V(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length(), geo = new THREE.CylinderGeometry(rad, rad, L, n, 1);
      geo.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(_up, d.normalize())));
      return [geo, col, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    };
    const BAMBOO = 0xc8a868, RED = 0xc82a24, WHITE = 0xf0ece0, ROPE = 0xd8c8a0, corner = (k, y) => { const h = half(y); return [(k & 1 ? 1 : -1) * h, y, (k & 2 ? 1 : -1) * h]; };
    const ORDER = [0, 1, 3, 2];   // the corners in turn round the tower
    const RACK_Y = Array.from({ length: F.racks }, (_, i) => 3 + i * (T - 6) / (F.racks - 1));   // each rack's height
    const rackAt = i => { const th = i * 2.4 + .4, h = half(RACK_Y[i]) + .45; return [Math.cos(th) * h, RACK_Y[i], Math.sin(th) * h, th]; };   // turning round the tower
    const towerParts = () => {
      const P = [];
      for (let k = 0; k < 4; k++) P.push(rod(corner(k, 0), corner(k, T + .6), .07, BAMBOO));
      for (let y = 1.6, n = 0; y <= T; y += 1.6, n++) for (let k = 0; k < 4; k++) {
        const A = ORDER[k], B = ORDER[(k + 1) % 4];
        P.push(rod(corner(A, y), corner(B, y), .06, n % 2 ? WHITE : RED));
        P.push(rod(corner(A, y - 1.6), corner(B, y), .03, BAMBOO, 4));   // the brace across this face
      }
      for (let k = 0; k < 4; k++) {   // the stays: from two thirds up to a stake out on each diagonal
        const c = corner(k, T * .7), s = [Math.sign(c[0]) * 4.6, 0, Math.sign(c[2]) * 4.6];
        P.push(rod(c, s, .02, ROPE, 4), [new THREE.BoxGeometry(.12, .5, .12), 0x7a5a3a, s[0], .2, s[2]]);
      }
      [-1, 1].forEach(sd => P.push(rod([sd * 1.6, 0, 4.2], [sd * .35, 9, half(9) + .05], .09, BAMBOO)));   // the A-frame
      P.push(rod([-1.1, 2.8, 3.5], [1.1, 2.8, 3.5], .06, BAMBOO), rod([-.75, 5.2, 2.4], [.75, 5.2, 2.4], .06, BAMBOO));
      RACK_Y.forEach((y, i) => {   // a rack: a frame of bamboo carrying a bundle of red and gold paper tubes, its mouths out
        const [x, , z, th] = rackAt(i), b = new THREE.BoxGeometry(.7, .45, .5); b.rotateY(-th);
        P.push([b, i % 2 ? 0xd8a020 : 0xb82a20, x, y, z]);
        for (let j = -1; j <= 1; j++) { const t = new THREE.CylinderGeometry(.07, .07, .4, 6); t.rotateZ(Math.PI / 2); t.rotateY(-th); P.push([t, 0xf2e0b0, x + Math.cos(th) * .3 - Math.sin(th) * j * .2, y + .05, z + Math.sin(th) * .3 + Math.cos(th) * j * .2]); }
      });
      P.push([new THREE.BoxGeometry(1.4, .9, .06), WHITE, 0, 7, half(7) + .12]);   // the team's board, hung on the A-frame side
      P.push([new THREE.BoxGeometry(1.2, .14, .065), RED, 0, 7.25, half(7) + .13], [new THREE.BoxGeometry(1.2, .1, .065), RED, 0, 6.8, half(7) + .13]);
      return P;
    };
    // the paper fire lotus on top: two rings of pink petals opening from a green cup, round a gold bud
    const lotusParts = () => {
      const P = [], petal = (n, k, len, tilt, col, y) => {
        const geo = new THREE.SphereGeometry(1, 6, 4); geo.scale(.32, len, .12); geo.translate(0, len * .9, 0);
        geo.rotateX(tilt); geo.rotateY(k * TAU / n); P.push([geo, col, 0, y, 0]);
      };
      for (let k = 0; k < 8; k++) petal(8, k, .9, .75, 0xe8608a, T + .6);
      for (let k = 0; k < 8; k++) petal(8, k + .5, .7, .35, 0xf6a8c0, T + .7);
      P.push([new THREE.CylinderGeometry(.5, .2, .5, 8), 0x3a8a4a, 0, T + .45, 0], [new THREE.SphereGeometry(.28, 8, 6), 0xf2c21c, 0, T + 1.1, 0]);
      return P;
    };
    const towerM = std({ vertexColors: true, flatShading: true, roughness: .8 });
    const lotusM = std({ vertexColors: true, flatShading: true, roughness: .7, emissive: 0xff7aa0, emissiveIntensity: 0 });   // the paper lit from inside by the fire
    onDaylight(d => towerM.emissive.copy(lerpC(0x1a1410, 0x000000, d)));
    const towerGeo = lowPoly(towerParts()), lotusGeo = lowPoly(lotusParts());
    const fenceM = std({ vertexColors: true, roughness: .9 });
    const flareT = canvasTex(64, (c, sz) => { const gr = c.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2); gr.addColorStop(0, "rgba(255,235,220,1)"); gr.addColorStop(.12, "rgba(255,70,40,.95)"); gr.addColorStop(.45, "rgba(230,20,10,.35)"); gr.addColorStop(1, "rgba(200,0,0,0)"); c.fillStyle = gr; c.fillRect(0, 0, sz, sz); });
    const hazeT = canvasTex(64, (c, sz) => { const gr = c.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2); gr.addColorStop(0, "rgba(220,50,30,.8)"); gr.addColorStop(.5, "rgba(160,20,15,.3)"); gr.addColorStop(1, "rgba(120,0,0,0)"); c.fillStyle = gr; c.fillRect(0, 0, sz, sz); });   // the fire's red light in its smoke
    const tdata = { tip: "A fire tower · မီးကြာ", toast: data.toast };
    H.updateMatrixWorld(true);
    const towers = F.towers.map(([f, rr], k) => {
      const a = a0 + (a1 - a0) * f, [x, z] = at(a, rr), G = new THREE.Group(); G.position.set(x, top, z); G.rotation.y = -a; H.add(G);   // its A-frame side (+z) faces the crowd's terraces
      clickable(list, mesh(towerGeo, towerM, 0, 0, 0, G), tdata);
      clickable(list, mesh(lotusGeo, lotusM, 0, 0, 0, G), { tip: "The fire lotus · မီးကြာ", toast: data.toast });
      // the rope ring: bamboo stakes with a rope run round from one to the next
      const R = F.clear, n = 18, FP = [];
      for (let i = 0; i < n; i++) {
        const t0 = i * TAU / n, t1 = (i + 1) * TAU / n;
        FP.push([new THREE.CylinderGeometry(.05, .06, 1.1, 5), BAMBOO, Math.cos(t0) * R, .55, Math.sin(t0) * R], rod([Math.cos(t0) * R, .95, Math.sin(t0) * R], [Math.cos(t1) * R, .95, Math.sin(t1) * R], .018, i % 2 ? RED : WHITE, 4));
      }
      flat(mesh(lowPoly(FP), fenceM, 0, 0, 0, G));
      G.updateMatrixWorld(true); const base = G.localToWorld(V(0, 0, 0));
      // the lights of the fire: a red flare at each rack, a gold glow round the lotus, and a broad red glow lighting the smoke
      const flares = RACK_Y.map((y, i) => {
        const [rx, , rz] = rackAt(i), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareT, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
        s.scale.setScalar(3.4); s.position.set(rx, y, rz); s.visible = false; G.add(s);
        const w = G.localToWorld(V(rx * 1.6, y, rz * 1.6)); return { s, w, dir: Math.atan2(w.z - base.z, w.x - base.x) };   // dir: out from the tower, in the world
      });
      const crown = glowSprite(0xffc060, 9, 0); crown.material.fog = false; crown.position.y = T + 1; crown.visible = false; G.add(crown);
      const haze = new THREE.Sprite(new THREE.SpriteMaterial({ map: hazeT, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); haze.scale.set(26, 34, 1); haze.position.y = T * .55; haze.visible = false; G.add(haze);
      return { G, k, a, x, z, flares, crown, haze, top: G.localToWorld(V(0, T + 1, 0)), off: k * F.cycle / F.towers.length };
    });
    // the sparks: one cloud of points for all the towers, each thrown out and falling, slowed by the air, as it burns out
    const SN = 4200, spPos = new Float32Array(SN * 3), spCol = new Float32Array(SN * 3), spV = new Float32Array(SN * 3), spAge = new Float32Array(SN), spLife = new Float32Array(SN), spBase = new Float32Array(SN * 3), spDrag = new Float32Array(SN);
    spLife.fill(-1);
    const spGeo = new THREE.BufferGeometry(); spGeo.setAttribute("position", new THREE.BufferAttribute(spPos, 3)); spGeo.setAttribute("color", new THREE.BufferAttribute(spCol, 3));
    const sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({ size: .62, map: glowTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    sparks.frustumCulled = false; sparks.userData.noCull = true; sparks.visible = false; g.add(sparks);
    clickable(list, sparks, tdata);
    const GOLD = [[1, .82, .45], [1, .95, .75], [1, .7, .3], [.75, .85, 1]];   // gold, white gold, orange and a little blue-white, as in the photographs
    let spNext = 0, spOn = false;
    const spark = (x, y, z, vx, vy, vz, life, drag, cl) => {
      const i = spNext, i3 = i * 3; spNext = (spNext + 1) % SN;
      spPos[i3] = x; spPos[i3 + 1] = y; spPos[i3 + 2] = z; spV[i3] = vx; spV[i3 + 1] = vy; spV[i3 + 2] = vz;
      spAge[i] = 0; spLife[i] = life; spDrag[i] = drag; spBase[i3] = cl[0]; spBase[i3 + 1] = cl[1]; spBase[i3 + 2] = cl[2]; spOn = true;
    };
    // a rack's fountain: each of its three mouths throws a steady jet out from the tower's side that arcs over and falls, the jets
    // swinging a little as the rack burns
    const fountain = (w, dir, t, j) => { const th = dir + (j - 1) * .75 + .2 * Math.sin(t * .9 + j * 2) + (r() - .5) * .06, el = .35 + j * .25 + (r() - .5) * .06, sp = 9.5 + r() * 1.5;
      spark(w.x, w.y, w.z, Math.cos(th) * Math.cos(el) * sp, Math.sin(el) * sp, Math.sin(th) * Math.cos(el) * sp, 1.6 + r() * .8, 1.1, GOLD[r() < .9 ? (r() * 3) | 0 : 3]); };
    // the fire lotus: petals of fire thrown up and out from the top, each a burning star that leaves a trail of sparks behind it as it
    // arcs over and droops toward the ground, as in the photographs; and a spray straight down the tower
    const HN = 120, heads = Array.from({ length: HN }, () => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, age: 1, life: 0, acc: 0, cl: GOLD[0] }));
    let hNext = 0;
    const petals = (w, n) => { for (let j = 0; j < n; j++) {
      const h = heads[hNext], th = (j + r() * .6) * TAU / n, el = .1 + r() * .9, sp = 11 + r() * 6; hNext = (hNext + 1) % HN;
      Object.assign(h, { x: w.x, y: w.y, z: w.z, vx: Math.cos(th) * Math.cos(el) * sp, vy: Math.sin(el) * sp + 2, vz: Math.sin(th) * Math.cos(el) * sp, age: 0, life: 2.6 + r() * 1.4, acc: 0, cl: GOLD[r() < .85 ? (r() * 3) | 0 : 3] });
    } };
    // the smoke: soft grey clouds rising from the burning racks and drifting off, lit red and gold by the fire inside them
    const smokeT = canvasTex(64, (c, sz) => { const gr = c.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(.55, "rgba(255,255,255,.22)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, sz, sz); });
    const SM = 36, puffs = Array.from({ length: SM }, () => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeT, color: 0x8a8080, transparent: true, opacity: 0, depthWrite: false }));
      s.visible = false; s.userData.noCull = true; g.add(s); return { s, age: 0, life: 0, x: 0, y: 0, z: 0, s0: 2, ph: 0 };
    });
    let smNext = 0;
    const puff = w => { const p = puffs[smNext]; smNext = (smNext + 1) % SM; p.age = 0; p.life = 22 + r() * 14; p.x = w.x + (r() - .5) * 2; p.y = w.y; p.z = w.z + (r() - .5) * 2; p.s0 = 2 + r() * 2; p.ph = r() * TAU; p.s.visible = true; };
    const WIND = [.5, .25], smokeC = new THREE.Color(), SMOKE_DAY = new THREE.Color(0xb8b4ae), SMOKE_NIGHT = new THREE.Color(0x4a4448), SMOKE_FIRE = new THREE.Color(0xd8604a);
    // the crowd: sitting along the terraces, standing at the foot of the terraces and along the parapet clear of the rope rings, and a team
    // of four at the foot of each tower by its A-frame. Out while the towers are lit
    const crowd = (() => {
      const q = rng(5162), { pk, SKIN, JACKET, LOWER, stander, person } = crowdKit(q), kinds = [];
      const kind = make => { const k = { make, at: [] }; kinds.push(k); return k; };
      const SITS = Array.from({ length: 6 }, () => kind(() => person(true))), STANDS = Array.from({ length: 6 }, () => kind(() => person(false)));
      const TEAM = Array.from({ length: 2 }, () => kind(() => stander(pk(SKIN), pk(JACKET), pk(LOWER), false, false)));
      const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _y = new THREE.Vector3(0, 1, 0);
      const put = (k, x, y, z, ry, sc) => k.at.push(_m.compose(_p.set(x, y, z), _q.setFromAxisAngle(_y, ry), _s.setScalar(sc)).clone());
      const near = (x, z, d) => towers.some(T_ => Math.hypot(x - T_.x, z - T_.z) < d);
      for (let i = 0; i < F.tiers; i++) {
        const rr = tierR(i), len = (ta1 - ta0) * rr;
        for (let d = .5 + q() * 2; d < len - .5; d += q() < .2 ? 3 + q() * 6 : .65 + q() * .35) {
          const a = ta0 + d / rr, [x, z] = at(a, rr + (q() - .5) * tD * .3);
          put(pk(SITS), x, tierTop(i), z, Math.PI - a + (q() - .5) * .5, 1.05 + q() * .15);
        }
      }
      [[rIn + 1.4, 2.4], [F.r1 - PW - 1.2, -1.6]].forEach(([fr, w]) => {
        const flen = (a1 - a0) * fr;
        for (let d = 2; d < flen - 2; d += q() < .3 ? 2 + q() * 5 : .7 + q() * .4) {
          const a = a0 + d / fr, [x, z] = at(a, fr + q() * w);
          if (!near(x, z, F.clear + 1)) put(pk(STANDS), x, top, z, (w > 0 ? Math.PI : 0) - a + (q() - .5) * .8, 1 + q() * .12);
        }
      });
      towers.forEach(T_ => [-1.5, -.5, .5, 1.5].forEach(o => {   // the team, on the A-frame side, watching their tower
        const v = T_.G.localToWorld(V(o * 1.3, 0, 5.6)), l = H.worldToLocal(v);
        put(pk(TEAM), l.x, top, l.z, Math.atan2(T_.x - l.x, T_.z - l.z), 1 + q() * .1);
      }));
      const M_ = std({ vertexColors: true, flatShading: true, roughness: .85 });
      onDaylight(d => M_.emissive.copy(lerpC(0x241c14, 0x000000, d)));
      const cdata = { tip: "The crowd at the fire lotus ground · ပွဲကြည့်ပရိသတ်", toast: "Families from the town and the villages come out in their warm jackets to sit on the terraces and watch the towers burn, cheering each fire lotus as it opens." };
      return kinds.filter(k => k.at.length).map(k => {
        const im = new THREE.InstancedMesh(lowPoly(k.make()), M_, k.at.length);
        k.at.forEach((m, i) => im.setMatrixAt(i, m));
        im.castShadow = false; im.frustumCulled = false; im.userData.noCull = true; im.visible = false; H.add(im); clickable(list, im, cdata);
        return im;
      });
    })();
    // the show: each tower in turn, its racks catching one after another from the foot up, then the fire lotus on top; with reduced
    // motion the next tower stands lit and still, its flares and lotus glowing but throwing no sparks
    let dl = 1; onDaylight(d => dl = d);
    const RACK_GAP = F.fuse / F.racks, SHOW = F.fuse + F.lotus;
    updaters.pagoda.push((dt, t, motion) => {
      const on = FOLK.fireLotus, still = motion < 1, step = Math.min(dt, .1);
      crowd.forEach(m => m.visible = on);
      lotusM.emissiveIntensity = 0;
      let heat = 0;
      towers.forEach(T_ => {
        const ph = !on ? -1 : still ? (T_.k === 0 ? F.fuse + 1 : -1) : (t + T_.off) % F.cycle, fl = .75 + .25 * Math.sin(t * 23 + T_.k * 5) * Math.sin(t * 9.7 + T_.k);
        let lit = 0;
        T_.flares.forEach((Fl, i) => {
          const u = ph - i * RACK_GAP, burning = ph >= 0 && u >= 0 && (u < F.burn || still);
          Fl.s.visible = burning;
          if (!burning) return;
          lit++;
          const f = still ? .8 : Math.min(1, u * 2) * (u > F.burn - 2 ? (F.burn - u) / 2 : 1);
          Fl.s.material.opacity = f * fl; Fl.s.scale.setScalar(3.5 + 2.5 * f * fl);
          if (!still) {
            for (Fl.acc = (Fl.acc || 0) + step * 150 * f; Fl.acc >= 1; Fl.acc--) fountain(Fl.w, Fl.dir, t, (Fl.n = ((Fl.n || 0) + 1) % 3));
            if (r() < step * .9) puff(Fl.w);
          }
        });
        const L = ph - F.fuse, lotus = ph >= 0 && L >= 0 && L < F.lotus, lf = lotus ? (still ? .8 : Math.min(1, L) * Math.min(1, (F.lotus - L) / 3)) : 0;
        T_.crown.visible = lotus; T_.crown.material.opacity = lf * fl; T_.crown.scale.setScalar(6 + 5 * lf * fl);
        if (lotus) {
          lotusM.emissiveIntensity = Math.max(lotusM.emissiveIntensity, .9 * lf);
          if (!still) {
            T_.burst = (T_.burst || 0) - step;
            if (T_.burst <= 0) { T_.burst = 1.1 + r() * .7; petals(T_.top, 14 + (r() * 6 | 0)); }
            for (T_.acc = (T_.acc || 0) + step * 90 * lf; T_.acc >= 1; T_.acc--) { const th = r() * TAU, sp = 2 + r() * 5; spark(T_.top.x, T_.top.y - .5, T_.top.z, Math.cos(th) * sp, -1 - r() * 5, Math.sin(th) * sp, 2 + r() * 1.5, .6, GOLD[(r() * 3) | 0]); }
            if (r() < step * .7) puff(T_.top);
          }
        }
        const h = Math.min(1, lit * .35 + lf);
        heat = Math.max(heat, h);
        T_.haze.visible = h > 0; T_.haze.material.opacity = .45 * h * fl * (1 - .7 * dl);
      });
      heads.forEach(h => {   // the lotus's burning stars, dropping their trails
        if (h.age >= h.life) return;
        h.age += step; const k = Math.max(0, 1 - .8 * step);
        h.vx *= k; h.vy = h.vy * k - 5.5 * step; h.vz *= k; h.x += h.vx * step; h.y += h.vy * step; h.z += h.vz * step;
        if (h.y < top + .5) { h.age = h.life; return; }
        for (h.acc += step * 55; h.acc >= 1; h.acc--) spark(h.x, h.y, h.z, h.vx * .08 + (r() - .5) * .4, h.vy * .08 - .3, h.vz * .08 + (r() - .5) * .4, .7 + r() * .6, 2, h.cl);
      });
      if (spOn) {
        let alive = 0;
        for (let i = 0; i < SN; i++) {
          if (spAge[i] >= spLife[i]) continue;
          const a = spAge[i] += step, i3 = i * 3;
          if (a >= spLife[i]) { spCol[i3] = spCol[i3 + 1] = spCol[i3 + 2] = 0; continue; }
          alive++; const k = Math.max(0, 1 - spDrag[i] * step), f = 1 - a / spLife[i], fade = f * (1 - .5 * dl);
          spV[i3] *= k; spV[i3 + 1] = spV[i3 + 1] * k - 6.5 * step; spV[i3 + 2] *= k;
          spPos[i3] += spV[i3] * step; spPos[i3 + 1] += spV[i3 + 1] * step; spPos[i3 + 2] += spV[i3 + 2] * step;
          if (spPos[i3 + 1] < top) { spLife[i] = a; spCol[i3] = spCol[i3 + 1] = spCol[i3 + 2] = 0; continue; }   // burnt out on the ground
          spCol[i3] = spBase[i3] * fade; spCol[i3 + 1] = spBase[i3 + 1] * fade * (.6 + .4 * f); spCol[i3 + 2] = spBase[i3 + 2] * fade * f;   // reddening as it dies
        }
        spOn = alive > 0; spGeo.attributes.position.needsUpdate = spGeo.attributes.color.needsUpdate = true;
      }
      sparks.visible = spOn;
      smokeC.copy(SMOKE_NIGHT).lerp(SMOKE_DAY, dl).lerp(SMOKE_FIRE, heat * (1 - dl) * .6);
      puffs.forEach(p => {
        if (!p.s.visible) return;
        p.age += step; const u = p.age / p.life;
        if (u >= 1) { p.s.visible = false; return; }
        p.x += WIND[0] * step; p.z += WIND[1] * step; p.y += (1.1 - .6 * u) * step;
        p.s.position.set(p.x + Math.sin(t * .3 + p.ph) * .6, p.y, p.z); p.s.scale.setScalar(p.s0 + 14 * Math.sqrt(u));
        p.s.material.color.copy(smokeC); p.s.material.opacity = .55 * Math.min(1, u * 6) * (1 - u);
      });
    });
    // walkers: the field at its own height, the parapet, end walls and the rope rings block; the terraces as steps; cut into wedges as
    // at the balloon ground
    const PAD_ = .35, rings = towers.map(T_ => [T_.x, T_.z, F.clear + .2 + PAD_]);
    const height = (r_, a, x, z) => {
      if (r_ >= rIn && r_ <= F.r1 + .07 + PAD_ && a >= a0 - (.07 + PAD_) / r_ && a <= a1 + (.07 + PAD_) / r_) {
        if (r_ > F.r1 - PW - PAD_) return null;
        if (r_ > F.edge - .07 - PAD_ && (a < a0 + (PW + PAD_) / r_ || a > a1 - (PW + PAD_) / r_)) return null;
        if (a < a0 || a > a1) return undefined;
        for (const [px, pz, pr] of rings) if (Math.hypot(x - px, z - pz) < pr) return null;
        return top;
      }
      if (r_ < rIn && r_ >= up.r1 && a >= ta0 && a <= ta1) return tierTop(Math.min(F.tiers - 1, Math.floor((rIn - r_) / tD)));
      return undefined;
    };
    const nP = Math.ceil((a1 - a0 + .04) / .3), span = (a1 - a0 + .04) / nP;
    for (let k = 0; k < nP; k++) {
      const mid = a0 - .02 + (k + .5) * span, hw = span / 2, Q = new THREE.Group(); Q.rotation.y = -mid; H.add(Q);
      sRect(Q, -(F.r1 + .6) * Math.sin(hw), (F.r1 + .6) * Math.sin(hw), -(F.r1 + .6), -(up.r1 - .5) * Math.cos(hw), (lx, lz) => {
        const r_ = Math.hypot(lx, lz), a = Math.atan2(lx, -lz) + mid;
        return height(r_, a, r_ * Math.sin(a), -r_ * Math.cos(a));
      });
    }
  }
