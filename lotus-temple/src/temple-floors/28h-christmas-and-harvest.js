  /* ---------- Christmas and the harvest thanksgiving at the Kachin Baptist church. From 1 December to 6 January (FOLK.christmas)
     the church is dressed for Christmas: a great lit star on the bell tower's face, strings of coloured bulbs along its eaves, its
     gable, its tower and the compound's front wall, and inside a tree, a nativity scene, paper star lanterns under the beams and a
     greeting over the cross. The Christian households beside the church put up a bamboo pole in the yard with a paper star lantern
     on top and strings of bulbs down from it. Every evening from 1 to 24 December, 7 to 11 PM, the youth fellowship's carol singers
     go round the lanes behind a star on a pole (FOLK.carols, carolSingers). On the last Sunday of November (FOLK.harvest) the church
     holds its harvest thanksgiving: sheaves of rice, baskets of fruit and vegetables, pumpkins and sacks of new rice before the
     pulpit. The temple, the pagoda and the monasteries are left as they are ---------- */
  const XMAS_BULBS = [0xff3a2a, 0x3aff6a, 0xffd23a, 0x3a8aff, 0xff5ad2, 0xfff4e0].map(h => new THREE.Color(h));
  const XMAS = { out: [], lights: [], step: 0, clock: 0, dl: 1 };   // out: the outdoor dressings shown in the season; lights: every string of bulbs
  // deepen a colour for an indoor vertex-coloured set (material colours are linear, so they show much paler than the hex)
  const _dc = new THREE.Color(), deep = list => list.map(([geo, hex, ...at]) => { _dc.set(hex); ["r", "g", "b"].forEach(k => _dc[k] = Math.pow(_dc[k], 1.6)); return [geo, _dc.getHex(), ...at]; });
  const TOWN_HOUSES = [];   // the back streets' houses as backStreets places them { x, z, ry, W, D }, for the Christian homes
  // a five-pointed star standing in the xy plane, facing +z: `r` to its points, `d` thick
  function starGeo(r, d = .08, inner = .42) {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, k = i % 2 ? r * inner : r; s[i ? "lineTo" : "moveTo"](Math.cos(a) * k, Math.sin(a) * k); }
    const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); geo.translate(0, 0, -d / 2); return geo;
  }
  // the points of a star's outline, for a string of bulbs round it
  const starRim = (r, inner = .42) => { const p = []; for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, k = i % 2 ? r * inner : r; p.push(V(Math.cos(a) * k, Math.sin(a) * k, 0)); } return p; };
  // bulbs along the points `pts`, one every `gap` metres, each stretch drooping `sag` in the middle
  function bulbString(pts, gap = .35, sag = 0) {
    const out = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(a.distanceTo(b) / gap));
      for (let k = 0; k < n; k++) { const t = k / n; out.push(a.clone().lerp(b, t).add(V(0, -sag * 4 * t * (1 - t), 0))); }
    }
    out.push(pts[pts.length - 1].clone()); return out;
  }
  // coloured bulbs at the points `at` (in parent's frame): one instanced mesh of little globes and a cloud of soft glows, faint by
  // day; they twinkle together (see xmasTwinkle). Indoors (`indoor`) they glow by day too
  function fairyLights(parent, at, size = .045, indoor = false) {
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(size, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }), at.length);
    const m4 = new THREE.Matrix4(), gp = new Float32Array(at.length * 3), gc = new Float32Array(at.length * 3);
    at.forEach((p, i) => { const c = XMAS_BULBS[i % XMAS_BULBS.length]; im.setMatrixAt(i, m4.makeTranslation(p.x, p.y, p.z)); im.setColorAt(i, c); gp.set([p.x, p.y, p.z], i * 3); gc.set([c.r, c.g, c.b], i * 3); });
    im.castShadow = im.receiveShadow = false; im.frustumCulled = false;
    const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.BufferAttribute(gp, 3)); gg.setAttribute("color", new THREE.BufferAttribute(gc, 3));
    const glow = new THREE.Points(gg, new THREE.PointsMaterial({ size: size * 8, vertexColors: true, map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.frustumCulled = false; parent.add(im, glow);
    XMAS.lights.push({ im, glow, n: at.length, indoor });
  }
  // every string of bulbs: a third of them dim in turn, stepping every .6 s (held still when motion is reduced); by day the
  // outdoor ones are only coloured glass
  const _bc = new THREE.Color();
  function xmasTwinkle(dt, t, motion) {
    if (motion >= 1 && (XMAS.clock += dt) > .6) { XMAS.clock = 0; XMAS.step++; }
    XMAS.lights.forEach(L => {
      if (!L.im.parent || !L.im.parent.visible) return;
      const lit = L.indoor ? 1 : 1 - XMAS.dl;
      L.glow.material.opacity = (L.indoor ? .55 : .9) * lit;
      if (L.shown === XMAS.step + lit) return; L.shown = XMAS.step + lit;
      for (let i = 0; i < L.n; i++) L.im.setColorAt(i, _bc.copy(XMAS_BULBS[i % XMAS_BULBS.length]).multiplyScalar((.4 + .6 * lit) * ((i + XMAS.step) % 3 ? 1 : .3 + .7 * (1 - lit))));
      L.im.instanceColor.needsUpdate = true;
    });
  }
  // a paper star lantern: a thick star of coloured paper lit from inside after dark (`lit` 0–1), with a soft glow; returns its group
  function starLantern(parent, r, col, x, y, z, lit = () => 1 - XMAS.dl) {
    const S = new THREE.Group(); S.position.set(x, y, z); parent.add(S);
    const deepCol = new THREE.Color(col); ["r", "g", "b"].forEach(k => deepCol[k] = Math.pow(deepCol[k], 2));   // paper that keeps its colour when lit
    const m = std({ color: deepCol, emissive: deepCol, emissiveIntensity: 0, roughness: .8 }), glow = glowSprite(col, r * 5, 0);
    flat(mesh(starGeo(r, r * .35), m, 0, 0, 0, S)); S.add(glow);
    [-1, 1].forEach(sd => { const tail = flat(mesh(new THREE.BoxGeometry(.04, r * 1.6, .01), m, sd * r * .25, -r * 1.3, 0, S)); tail.rotation.z = sd * .12; });   // two paper tails
    S.userData.glow = () => { const k = lit(); m.emissiveIntensity = .15 + .9 * k; glow.material.opacity = .55 * k; };
    return S;
  }

  /* ---------- the church's outside dressing: in the church's own frame (its front, local +z, faces the lane), as in kachinChurch ---------- */
  function churchChristmas(g, x, z) {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = Math.PI; c.userData.noCull = true; c.visible = false; g.add(c); XMAS.out.push(c);
    const W = 9, L = 16, H = 6, base = .5, RH = 4.6, TW = 3, TH = 11, tz = L / 2 + TW / 2 - .2, front = tz + TW / 2;   // the church's sizes (kachinChurch)
    // the great gold star on the bell tower's face, lit after dark and outlined in white bulbs
    const starM = std({ color: 0xe8a818, emissive: 0xd89010, emissiveIntensity: .1, roughness: .5 }), glow = glowSprite(0xffc860, 5, 0);
    const SY = base + 6.1;
    mesh(starGeo(.95, .12), starM, 0, SY, front + .1, c); glow.position.set(0, SY, front + .3); c.add(glow);
    onDaylight(d => { starM.emissiveIntensity = .1 + .75 * (1 - d); glow.material.opacity = .35 * (1 - d); });
    const rim = starRim(1.08).map(p => p.add(V(0, SY, front + .2)));
    // strings of bulbs: along both eaves, up the front gable, down the tower's front corners and across its top
    const at = [];
    [-1, 1].forEach(sd => at.push(...bulbString([-4, -2, 0, 2, 4].map(k => V(sd * (W / 2 + .12), base + H - .3, k * L / 8)), .32, .14)));
    at.push(...bulbString([V(-W / 2, base + H + .05, L / 2 + .14), V(0, base + H + RH * .95, L / 2 + .14), V(W / 2, base + H + .05, L / 2 + .14)], .32));
    [-1, 1].forEach(sd => at.push(...bulbString([V(sd * (TW / 2 + .04), base + TH, front + .04), V(sd * (TW / 2 + .04), base + .4, front + .04)], .3)));
    at.push(...bulbString([V(-TW / 2, base + TH - .05, front + .04), V(TW / 2, base + TH - .05, front + .04)], .3));
    fairyLights(c, at.concat(bulbString(rim, .22)), .05);   // with the star's own rim
  }
  // the compound's front wall and the iron arch over its gate, strung with bulbs (in the grounds' frame)
  function compoundChristmas(g, Y) {
    const G = new THREE.Group(); G.userData.noCull = true; G.visible = false; g.add(G); XMAS.out.push(G);
    const { x0, x1, z0, gate } = Y, at = [], span = (a, b) => { const n = Math.max(1, Math.round((b - a) / 1.6)), p = []; for (let i = 0; i <= n; i++) p.push(V(a + (b - a) * i / n, 1.62, z0 - .17)); return p; };
    at.push(...bulbString(span(x0 + .2, gate[0] - .7), .3, .12), ...bulbString(span(gate[1] + .7, x1 - .2), .3, .12));
    const R = gate[1] + .3, arc = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; arc.push(V(Math.cos(a) * R, 2.5 + Math.sin(a) * R * .35, z0 - .09)); }
    at.push(...bulbString(arc, .26));
    fairyLights(G, at, .045);
  }
  // the Christian households' bamboo poles: in the front yard, a star lantern at the top and strands of bulbs down to the ground
  // round the foot, like a tree of light. `homes` are { x, z, ry, W, D } with the house's front on local +z
  const XMAS_HOMES = [];   // where each pole stands, in the grounds' frame, so the carol singers can stop before it
  function christianHomes(g, homes) {
    const G = new THREE.Group(); G.userData.noCull = true; G.visible = false; g.add(G); XMAS.out.push(G);
    const bamboo = std({ color: 0xb8a060, roughness: .7 }), knot = new THREE.CylinderGeometry(.05, .05, .04, 6), COLS = [0xe83a2a, 0xf4f0e4, 0xf0c428, 0xe83a2a];
    homes.forEach(({ x, z, ry, W, D }, i) => {
      const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = ry; G.add(h);
      const px = W / 2 - .5, pz = D / 2 + 2, top = 5.4;
      mesh(new THREE.CylinderGeometry(.035, .045, top, 6), bamboo, px, top / 2, pz, h);
      for (let k = 1; k < 9; k++) mesh(knot, bamboo, px, k * top / 9, pz, h);
      const S = starLantern(h, .42, COLS[i % COLS.length], px, top + .35, pz);
      S.rotation.y = -ry + Math.PI / 2 * (i % 2);   // turned toward the lane (more or less)
      const at = [];
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; at.push(...bulbString([V(px, top - .25, pz), V(px + Math.cos(a) * .6, .3, pz + Math.sin(a) * .6)], .28)); }
      fairyLights(h, at, .04);
      XMAS_HOMES.push({ x: x + px * Math.cos(ry) + pz * Math.sin(ry), z: z - px * Math.sin(ry) + pz * Math.cos(ry) });
    });
    onDaylight(() => G.traverse(o => o.userData.glow && o.userData.glow()));
  }
  // what turns the dressings on and off with the season, and twinkles the bulbs
  function christmasOutside() {
    updaters.pagoda.push((dt, t, motion) => {
      const on = FOLK.christmas;
      if (XMAS.on !== on) { XMAS.on = on; XMAS.out.forEach(o => o.visible = on); }
      if (on) xmasTwinkle(dt, t, motion);
    });
    onDaylight(d => XMAS.dl = d);
  }

  /* ---------- inside the church at Christmas: a tree on the dais beside the choir, a nativity scene on the floor before the dais's
     left end, paper star lanterns hanging under the beams, a tinsel garland along the dais's edge and the greeting over the cross ---------- */
  function churchChristmasHall(g, list, DY, HH) {
    const G = new THREE.Group(); G.visible = false; g.add(G);
    const r = rng(2512), parts = [], nat = [], box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n);
    const ball = (s, w = 8, h = 6) => new THREE.SphereGeometry(s, w, h), cone = (rr, h, n = 8) => new THREE.ConeGeometry(rr, h, n);
    // the tree: four tiers of dark green on a trunk in a red pot, baubles hung all over, a gold star on top
    const TX = 5.35, TZ = -4.55, T0 = DY;
    parts.push([cyl(.2, .16, .3), 0x9a2a22, TX, T0 + .15, TZ], [cyl(.05, .05, .4), 0x4a2a14, TX, T0 + .45, TZ]);
    const TIERS = [[.62, .9, .75], [.5, .8, 1.2], [.38, .7, 1.62], [.24, .55, 1.98]];   // radius, height, centre above the dais
    TIERS.forEach(([rr, h, y]) => parts.push([cone(rr, h, 10), 0x1e4a26, TX, T0 + y, TZ]));
    const BAUBLE = [0xc81e1e, 0xe8b830, 0xf4f0e4, 0x2a5ac8, 0xc81e1e, 0xe8b830];
    TIERS.forEach(([rr, h, y], ti) => { for (let k = 0; k < 7 - ti; k++) { const a = k / (7 - ti) * TAU + ti, f = .25 + r() * .1; parts.push([ball(.05), BAUBLE[(k + ti) % BAUBLE.length], TX + Math.cos(a) * rr * (1 - f) * 1.02, T0 + y - h / 2 + h * f, TZ + Math.sin(a) * rr * (1 - f) * 1.02]); } });
    const tStar = std({ color: 0xf0c040, emissive: 0xf0b030, emissiveIntensity: .8, metalness: .4, roughness: .35 });
    mesh(starGeo(.18, .05), tStar, TX, T0 + 2.42, TZ, G).rotation.y = -.5;
    const spiral = []; for (let k = 0; k <= 60; k++) { const f = k / 60, a = f * 5.5 * TAU; spiral.push(V(TX + Math.cos(a) * (.64 * (1 - f) + .06), T0 + .35 + f * 1.95, TZ + Math.sin(a) * (.64 * (1 - f) + .06))); }
    fairyLights(G, bulbString(spiral, .12), .025, true);
    // the nativity: a stable of poles under a straw roof on a low platform; Mary kneeling in blue and white, Joseph standing with
    // his staff, the child in the manger between them on the straw, a lamb and two shepherds at the side, a star on the ridge
    const NX = -5.2, NZ = -2.15, NY = .15, tree = parts;
    nat.push([box(2.1, NY, .9), 0x5a3a22, NX, NY / 2, NZ]);
    [[-.85, -.32], [.85, -.32], [-.85, .3], [.85, .3]].forEach(([dx, dz]) => nat.push([box(.06, 1.25, .06), 0x6a4a2a, NX + dx, NY + .62, NZ + dz]));
    nat.push([box(1.76, .9, .03), 0x7a5a36, NX, NY + .45, NZ - .33]);   // the plank back wall
    [-1, 1].forEach(sd => { const roof = box(1.0, .05, .85); roof.rotateZ(sd * -.55); nat.push([roof, 0xc8a050, NX + sd * .44, NY + 1.5, NZ]); });   // the straw roof
    nat.push([box(.5, .16, .24), 0x7a5a36, NX, NY + .16, NZ], [box(.46, .05, .2), 0xd8b860, NX, NY + .26, NZ],   // the manger and its straw
               [box(.24, .07, .1), 0xf6f2ea, NX, NY + .31, NZ], [ball(.045), 0xe8b890, NX - .14, NY + .32, NZ]);       // the child, swaddled
    // Mary kneeling at the manger's left (in blue over white, a white veil), Joseph standing at its right (brown robe, staff)
    nat.push([cone(.2, .42, 8), 0x2a4a9a, NX - .5, NY + .21, NZ + .02], [cyl(.1, .13, .3), 0x2a4a9a, NX - .5, NY + .52, NZ + .02], [ball(.075), 0xe8c0a0, NX - .5, NY + .74, NZ + .04],
               [cone(.12, .26, 8), 0xf4f0e4, NX - .5, NY + .76, NZ + .0]);
    nat.push([cyl(.13, .2, .82), 0x6a4a2a, NX + .55, NY + .41, NZ - .02], [cyl(.1, .12, .2), 0x8a6a3a, NX + .55, NY + .9, NZ - .02], [ball(.08), 0xd8a47a, NX + .55, NY + 1.06, NZ],
               [box(.17, .07, .17), 0x4a2a1a, NX + .55, NY + 1.04, NZ - .03], [box(.025, 1.15, .025), 0x5a3a1a, NX + .75, NY + .58, NZ + .06]);
    nat.push([box(.24, .14, .12), 0xf4f0e8, NX + .3, NY + .14, NZ + .3], [box(.08, .08, .08), 0x2a2420, NX + .44, NY + .2, NZ + .3]);   // a lamb lying down
    [-1.25, -.85].forEach((dx, i) => nat.push([cyl(.1, .15, .62), i ? 0x8a6a4a : 0x5a5a3a, NX + dx, NY + .31, NZ + .25], [ball(.07), 0xd8a47a, NX + dx, NY + .69, NZ + .26], [box(.16, .06, .16), 0xe8e0c8, NX + dx, NY + .74, NZ + .25]));   // shepherds, off the platform's end
    mesh(starGeo(.14, .04), tStar, NX, NY + 1.86, NZ + .1, G);
    const nativityInfo = { tip: "The nativity scene", toast: "The nativity: the child in the manger on the straw, Mary kneeling beside him and Joseph with his staff, a lamb and two shepherds come from the fields, and the star over the stable. The Sunday school children help set it out at the start of December." };
    const treeInfo = { tip: "The Christmas tree", toast: "The church's Christmas tree, a young pine from the hills dressed with baubles and coloured bulbs, a gold star on top. It goes up at the start of December and stays until Epiphany, 6 January." };
    // the tinsel garland along the dais's front edge: red and gold swags, with bulbs along it
    const tinsel = std({ color: 0xd8a020, emissive: 0x3a2000, metalness: .6, roughness: .35 }), red = std({ color: 0xb01818, roughness: .5 });
    const garland = [];
    for (let k = 0; k < 8; k++) {
      const a = -6 + k * 1.5, b = a + 1.5, pts = []; for (let i = 0; i <= 8; i++) { const f = i / 8; pts.push(V(a + (b - a) * f, DY - .06 - .22 * 4 * f * (1 - f), CHURCH.dais + .04)); }
      flat(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, .035, 5, false), k % 2 ? red : tinsel, 0, 0, 0, G)); garland.push(...pts.slice(0, 8));
    }
    fairyLights(G, garland.filter((p, i) => i % 2 === 0), .025, true);
    // paper star lanterns under the beams down the aisle and over the side aisles, turning slowly on their cords
    const lanterns = [[0, -.6, 0xe83a2a], [0, 2.2, 0xf4f0e4], [-4.6, -.6, 0xf0c428], [4.6, -.6, 0xf0c428], [-4.6, 2.2, 0xe83a2a], [4.6, 2.2, 0xe83a2a]].map(([x, z, col]) => {
      mesh(new THREE.CylinderGeometry(.006, .006, .9, 4), std({ color: 0x2a2420 }), x, HH - .45, z + .14, G).castShadow = false;
      return starLantern(G, .3, col, x, HH - 1.25, z + .14, () => .8);
    });
    lanterns.forEach(S => S.userData.glow());
    // the greeting over the cross, on the wall above the red hanging: Jinghpaw, the church's own language (Latin letters)
    const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 128;
    const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding;
    const paint = () => {
      const c = cv.getContext("2d"); c.fillStyle = "#1e4a26"; c.fillRect(0, 0, 1024, 128); c.strokeStyle = "#e8b830"; c.lineWidth = 8; c.strokeRect(6, 6, 1012, 116);
      c.fillStyle = "#f4e8c0"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = '600 70px "Figtree", sans-serif'; c.fillText("Ngwi Pyaw Christmas", 512, 68, 960); tx.needsUpdate = true;
    };
    paint(); if (document.fonts && document.fonts.load) document.fonts.load('600 70px "Figtree"').then(paint, () => {});
    const board = flat(mesh(new THREE.PlaneGeometry(5.2, .65), std({ map: tx, roughness: .8 }), 0, 5.92, -5.46, G));
    const greeting = { tip: "Ngwi Pyaw Christmas", toast: "“Ngwi Pyaw Christmas”: a Christmas greeting in Jinghpaw, the Kachin language, wishing peace and joy at Christmas. Jinghpaw has been written in Latin letters since the missionaries' Bible." };
    const M_ = std({ vertexColors: true, flatShading: true, roughness: .8 });
    [[tree, treeInfo], [nat, nativityInfo]].forEach(([p, info]) => {
      const m = new THREE.Mesh(lowPoly(deep(p)), M_); m.castShadow = m.receiveShadow = true; G.add(m); clickable(list, m, info);
      m.raycast = function (ray, out) { if (G.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); };
    });
    clickable(list, board, greeting); board.raycast = function (ray, out) { if (G.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); };
    return (dt, t, motion) => { G.visible = FOLK.christmas; if (G.visible) xmasTwinkle(dt, t, motion); };
  }

  /* ---------- the harvest thanksgiving, the last Sunday of November: the families' first fruits laid on the floor before the dais
     either side of the communion table: sheaves of rice leaning on the dais, sacks of new rice, pumpkins, baskets of oranges,
     avocados and chillies, bunches of bananas, cabbages, maize cobs and sugar cane ---------- */
  function harvestDisplay(g, list, DY) {
    const r = rng(1129), parts = [], box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n), ball = (s, w = 8, h = 6) => new THREE.SphereGeometry(s, w, h);
    const Z = CHURCH.dais;   // the dais's front edge
    [-1, 1].forEach(sd => {
      const X = x => sd * x;
      // sheaves of rice leaning on the dais: golden straw bound at the waist, the heavy heads bowing over
      for (let k = 0; k < 5; k++) {
        const x = 1.3 + k * .5, s = cyl(.07, .1, .95, 7); s.rotateX(-.18); parts.push([s, 0xb08a2a, X(x), .47, Z + .2]);
        parts.push([cyl(.085, .085, .06, 7), 0x6a4a22, X(x), .45, Z + .2]);
        const head = new THREE.ConeGeometry(.12, .3, 7); head.rotateX(Math.PI * .8); parts.push([head, 0xc8962a, X(x), 1.0, Z + .05]);
      }
      // sacks of new rice and a row of pumpkins
      [[1.55, .55], [2.3, .5]].forEach(([x, w]) => parts.push([box(w, .42, .3), 0xece6d4, X(x), .21, Z + .55], [box(w * .7, .06, .2), 0xd8cfb8, X(x), .44, Z + .55]));
      [3.05, 3.4].forEach((x, i) => { const p = ball(.17 + i * .03, 10, 7); p.scale(1, .7, 1); parts.push([p, 0xd8701a, X(x), .13, Z + .45], [cyl(.015, .02, .07, 5), 0x4a5a22, X(x), .27, Z + .45]); });
      // baskets: oranges, avocados and chillies, and a bunch of bananas lying across one
      [[1.4, 0xf08a1a, .055], [2.05, 0x2f5a22, .06], [2.75, 0xd8281a, .025]].forEach(([x, col, s]) => {
        parts.push([cyl(.22, .17, .2, 10), 0x9a7040, X(x), .1, Z + .95], [cyl(.225, .225, .03, 10), 0x7a5430, X(x), .2, Z + .95]);
        for (let k = 0; k < (s < .03 ? 22 : 9); k++) { const a = r() * TAU, d = r() * .15; parts.push([s < .03 ? box(s, s, s * 3.5) : ball(s), col, X(x) + Math.cos(a) * d, .22 + r() * .05, Z + .95 + Math.sin(a) * d]); }
      });
      for (let k = 0; k < 6; k++) { const b = box(.045, .045, .22); b.rotateY(.3 + k * .12); b.rotateX(.25); parts.push([b, 0xe8cc38, X(3.3) + (k - 2.5) * .045, .32, Z + 1.0]); }
      // cabbages and a heap of maize cobs, two canes of sugar cane leaning at the end
      [[3.55, .95], [3.75, .7]].forEach(([x, z]) => { const c = ball(.13, 9, 7); c.scale(1, .85, 1); parts.push([c, 0x8ab85a, X(x), .11, Z + z]); });
      for (let k = 0; k < 5; k++) { const m = cyl(.035, .03, .2, 6); m.rotateZ(Math.PI / 2); m.rotateY(r() * .6 - .3); parts.push([m, 0xe8c040, X(1.0) - sd * (k % 2) * .05, .04 + (k > 2 ? .06 : 0), Z + .5 + (k % 3) * .07]); }
      [0, 1].forEach(k => { const cane = cyl(.025, .025, 1.6, 5); cane.rotateX(-.25); cane.rotateZ(sd * .12 * (k ? 1 : -1)); parts.push([cane, 0x6a7a2a, X(3.9 + k * .12), .78, Z + .3]); });
    });
    const M_ = std({ vertexColors: true, flatShading: true, roughness: .8 }), heap = new THREE.Mesh(lowPoly(deep(parts)), M_);
    heap.castShadow = heap.receiveShadow = true; heap.visible = false; g.add(heap);
    clickable(list, heap, { tip: "The harvest thanksgiving · ကျေးဇူးတော်ချီးမွမ်းပွဲ", toast: "The harvest thanksgiving, on the last Sunday of November. Once the rice is in from the fields, the families bring the first of it, with fruit and vegetables from their gardens, and lay them before the pulpit; the service gives thanks to God for the year's harvest, and the gifts go to the church." });
    heap.raycast = function (ray, out) { if (heap.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); };
    return () => { heap.visible = FOLK.harvest; };
  }

  /* ---------- the carol singers: eight young people of the church's youth fellowship, in warm jackets and Kachin skirts, some in
     Santa hats, behind a paper star on a bamboo pole and a guitar. From the church gate they go down the plaza lane, along the
     back lane and up the market lane, stopping to sing before the Christian homes and other houses on the way, then walk back to
     the church and set out again. They keep to a timetable on the temple's clock (FOLK.carolAt, seconds since 7 PM), so every
     visitor sees them in the same place. Seen only: no song is played ---------- */
  const CAROLS = {
    way: [[0, 105.5], [0, 77.5], [41, 77.5], [41, 103]],   // the church gate, down the plaza lane, along the back lane, up the market lane
    stops: [[40, 0], [56, 0], [83.5, -Math.PI / 2]],      // more doors on the way, beside the Christian homes: [metres along the way, which way they face]
    speed: .7, sing: 45, rest: 60, row: 1.0               // metres a second; seconds at each door; seconds at the church gate before setting out again; metres between rows
  };
  function carolSingers(g) {
    const way = CAROLS.way.map(([x, z]) => V(x, 0, z)), lens = way.slice(1).map((p, i) => p.distanceTo(way[i])), TOTAL = lens.reduce((a, b) => a + b, 0);
    const along = s => { s = clamp(s, 0, TOTAL); for (let i = 0; i < lens.length; i++) { if (s <= lens[i] || i === lens.length - 1) { const d = way[i + 1].clone().sub(way[i]).normalize(); return { p: way[i].clone().addScaledVector(d, Math.min(s, lens[i])), d }; } s -= lens[i]; } };
    // the homes with a star pole beside the way: a stop before each, facing it
    const stops = CAROLS.stops.map(([s, face]) => ({ s, face }));
    XMAS_HOMES.forEach(h => {
      let best = null;
      for (let s = 0; s <= TOTAL; s += .25) { const q = along(s).p, d = Math.hypot(q.x - h.x, q.z - h.z); if (!best || d < best.d) best = { s, d, q }; }
      if (best && best.d < 9) stops.push({ s: best.s, face: Math.atan2(h.x - best.q.x, h.z - best.q.z) });
    });
    stops.sort((a, b) => a.s - b.s);
    // the timetable: out along the way stopping at every door, back to the gate without stopping, a rest there
    const plan = []; let t = 0, s = 0;
    const walk = (s1) => { const dur = Math.abs(s1 - s) / CAROLS.speed; if (dur > 0) plan.push({ t0: t, t1: t += dur, s0: s, s1 }); s = s1; };
    stops.forEach(st => { walk(st.s); plan.push({ t0: t, t1: t += CAROLS.sing, s0: s, s1: s, face: st.face }); });
    walk(TOTAL); walk(0); plan.push({ t0: t, t1: t += CAROLS.rest, s0: 0, s1: 0, face: 0 });
    const PERIOD = t;
    // the singers, front +z: who they are and what each carries
    const r = rng(1224), SKIN = [0xe8b890, 0xd8a47a, 0xc89068, 0xe0b088], HAIR = 0x1c1614, INK = 0x2a1c18;
    const JACKET = [0x1a1a22, 0x8a1a22, 0x2a3a5a, 0x3a5a3a, 0xe8e4dc, 0x4a3a5a, 0x2a2a30, 0xa83030], SKIRT = 0xa81c26, BANDS = [0x0a090b, 0xe8b830, 0x2a6a3a];
    const WHO = [{ hold: "star" }, { hold: "guitar" }, { hold: "book", woman: true, santa: true }, { hold: "book", woman: true }, { hold: "candle", santa: true },
                 { hold: "book", woman: true, santa: true }, { hold: "candle", woman: true }, { hold: "book" }];
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n = 7) => new THREE.CylinderGeometry(a, b, h, n);
    const turn = (geo, rx = 0, ry = 0, rz = 0) => { geo.rotateX(rx); geo.rotateY(ry); geo.rotateZ(rz); return geo; };
    const folkM = std({ vertexColors: true, flatShading: true, roughness: .85, emissive: 0x2a2018 });
    onDaylight(d => folkM.emissive.copy(lerpC(0x2a2018, 0x000000, d)));
    const root = new THREE.Group(); root.userData.noCull = true; root.visible = false; g.add(root);
    const INFO = { tip: "Carol singers · Kachin Baptist church", toast: "Carol singers from the Kachin Baptist church's youth fellowship. Every evening in December until Christmas Eve they go round the town behind a paper star on a bamboo pole, a guitar keeping time, and stop before the homes of the congregation to sing carols in Jinghpaw and Burmese; the family comes out to listen and pray with them, and often brings tea and something to eat. (Their singing is not played here.)" };
    const flames = [];
    const people = WHO.map((o, i) => {
      const skin = SKIN[(r() * SKIN.length) | 0], jacket = JACKET[i % JACKET.length], legCol = o.woman ? 0x1a1414 : [0x2a3450, 0x23232b][i % 2];
      const p = [[cyl(.155, .175, .46), jacket, 0, .87, 0], [box(.11, .12, .13), jacket, -.19, .99, 0], [box(.11, .12, .13), jacket, .19, .99, 0], [box(.016, .4, .012), 0x2a2420, 0, .87, .168],
                 [cyl(.05, .05, .07, 6), skin, 0, 1.09, 0], [box(.25, .27, .24), skin, 0, 1.245, 0], [box(.03, .06, .05), skin, -.135, 1.25, 0], [box(.03, .06, .05), skin, .135, 1.25, 0],
                 [box(.035, .045, .012), INK, -.055, 1.26, .122], [box(.035, .045, .012), INK, .055, 1.26, .122], [box(.08, .03, .01), 0x8a3a30, 0, 1.185, .122],   // eyes, and an open mouth, singing
                 [box(.27, o.woman ? .26 : .17, .07), HAIR, 0, o.woman ? 1.27 : 1.31, -.1]];
      if (o.woman) p.push([cyl(.17, .19, .62), SKIRT, 0, .39, 0], ...[.1, .17, .24, .5].map((y, k) => [cyl(.182 + (.5 - y) * .02, .182 + (.55 - y) * .02, .03, 8), BANDS[k % 3], 0, y, 0]));   // the Kachin red woven skirt to the ankle, its bands
      else p.push([cyl(.17, .17, .14), legCol, 0, .68, 0]);
      if (o.santa) p.push([box(.27, .07, .27), 0xf4f2ec, 0, 1.39, 0], [turn(new THREE.ConeGeometry(.13, .32, 6), 0, 0, -.45), 0x900c0c, .05, 1.55, 0], [new THREE.IcosahedronGeometry(.045, 0), 0xf4f2ec, .18, 1.66, 0]);   // a Santa hat
      else { p.push([box(.27, .07, .26), HAIR, 0, 1.395, -.005]); if (o.woman) p.push([box(.275, .05, .27), SKIRT, 0, 1.36, 0]); }   // or bare hair, a red woven headband
      if (r() < .5) p.push([cyl(.09, .1, .08, 8), [0xc81e1e, 0xe8e4dc, 0x3a6a3a][i % 3], 0, 1.1, 0]);   // a scarf
      const sleeve = jacket, arm = (rx = 0, rz = 0) => turn(box(.09, .38, .095), rx, 0, rz);   // an arm, turned at its middle
      if (o.hold === "star") p.push([arm(-1.1), sleeve, -.15, 1.0, .12], [arm(-1.1), sleeve, .15, .94, .12], [box(.07, .08, .08), skin, -.05, 1.12, .28], [box(.07, .08, .08), skin, .05, 1.02, .28]);   // both hands up on the pole
      else if (o.hold === "guitar") p.push([turn(box(.36, .44, .1), 0, 0, -.5), 0x8a4a1a, -.06, .84, .17], [new THREE.CylinderGeometry(.06, .06, .02, 10).rotateX(Math.PI / 2), 0x1a0e08, -.04, .86, .225],
                                            [turn(box(.06, .58, .04), 0, 0, -.5), 0x3a2010, .18, 1.25, .19], [arm(-.3), sleeve, -.21, .88, .06], [arm(-.9, .8), sleeve, .2, 1.05, .13], [box(.07, .08, .08), skin, -.1, .82, .24], [box(.07, .08, .08), skin, .27, 1.2, .22]);
      else {
        [-1, 1].forEach(sd => p.push([turn(box(.09, .36, .095), -.25), sleeve, sd * .205, .88, .04], [turn(box(.08, .08, .26), 0, -sd * .35), sleeve, sd * .15, .71, .15], [box(.07, .07, .08), skin, sd * .1, .72, .27]));
        if (o.hold === "book") p.push([turn(box(.26, .02, .19), -.75), 0x1a1a1e, 0, .8, .3], [turn(box(.24, .01, .17), -.75), 0xf4f0e4, 0, .81, .31]);
        else p.push([cyl(.03, .03, .12), 0xf4f0e4, -.1, .82, .29], [new THREE.ConeGeometry(.012, .04, 5), 0xffd060, -.1, .9, .29], [turn(box(.11, .02, .11)), 0xf4f0e4, -.1, .76, .29]);   // a candle in a paper cup
      }
      const P = new THREE.Group(); root.add(P);
      const body = new THREE.Mesh(lowPoly(p), folkM); body.castShadow = false; P.add(body);
      clickable(picks.pagoda, body, INFO); body.raycast = function (ray, out) { if (root.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); };
      const legs = [-1, 1].map(sd => { const L = new THREE.Mesh(lowPoly([[box(.11, .64, .11), legCol, 0, -.32, 0], [box(.12, .035, .23), 0x2a2420, 0, -.643, .035]]), folkM); L.position.set(sd * .075, .66, 0); L.castShadow = false; P.add(L); return L; });
      if (o.hold === "candle") { const f = glowSprite(0xffc060, .5, 0); f.position.set(-.1, .9, .29); P.add(f); flames.push(f); }
      let star = null;
      if (o.hold === "star") {   // the bamboo pole and its paper star, lit inside
        mesh(new THREE.CylinderGeometry(.02, .025, 2.6, 5), std({ color: 0xb8a060, roughness: .7 }), 0, 1.6, .3, P).castShadow = false;
        star = starLantern(P, .38, 0xf4f0e4, 0, 3.05, .3);
      }
      return { P, legs, star, o, scale: 1.04 + r() * .1, phase: r() * TAU, heading: 0 };
    });
    // where each stands: walking, in pairs behind the star; at a door, in an arc facing it with the star behind the middle
    const n = people.length;
    let tt = 0, dlv = 1; onDaylight(d => dlv = d);
    updaters.pagoda.push((dt, time, motion) => {
      const on = FOLK.carols;
      root.visible = on; if (!on) { tt = 0; return; }
      tt += dt;
      const T = ((FOLK.carolAt === null ? tt : FOLK.carolAt) % PERIOD + PERIOD) % PERIOD;
      const leg = plan.find(l => T < l.t1) || plan[plan.length - 1], f = (T - leg.t0) / Math.max(leg.t1 - leg.t0, 1e-3);
      const s = leg.s0 + (leg.s1 - leg.s0) * f, dir = leg.s1 < leg.s0 ? -1 : 1, stopped = leg.face !== undefined;
      const b = stopped ? Math.min(1, (T - leg.t0) / 3, (leg.t1 - T) / 3) : 0, bb = b * b * (3 - 2 * b);   // eased in and out of the arc
      const at = along(s), fx = stopped ? Math.sin(leg.face) : 0, fz = stopped ? Math.cos(leg.face) : 0;
      const lit = 1 - dlv;
      people.forEach((q, k) => {
        const row = Math.ceil(k / 2), side = k === 0 ? 0 : k % 2 ? -.45 : .45, w = along(s - dir * row * CAROLS.row);
        let x = w.p.x - w.d.z * side * dir, z = w.p.z + w.d.x * side * dir, face = Math.atan2(w.d.x * dir, w.d.z * dir);
        if (bb > 0) {   // the arc round a point 2 m toward the door
          const cx = at.p.x + fx * 2, cz = at.p.z + fz * 2, a = k === 0 ? 0 : ((k - 1) / (n - 2) - .5) * 1.9, R = k === 0 ? 2.8 : 2;
          const ax = cx - (fx * Math.cos(a) - fz * Math.sin(a)) * R, az = cz - (fz * Math.cos(a) + fx * Math.sin(a)) * R;
          x += (ax - x) * bb; z += (az - z) * bb;
          const fa = Math.atan2(cx - ax, cz - az); face += Math.atan2(Math.sin(fa - face), Math.cos(fa - face)) * bb;
        }
        q.heading += Math.atan2(Math.sin(face - q.heading), Math.cos(face - q.heading)) * Math.min(1, dt * 4);
        const moving = !stopped && leg.s0 !== leg.s1;
        if (moving) q.phase += dt * CAROLS.speed * 5.5;
        const sw = moving ? Math.sin(q.phase) * motion * (q.o.woman ? .1 : .32) : 0, sway = stopped ? Math.sin(time * 1.6 + k) * .04 * motion * bb : 0;
        const wa = walkAt(x, z), y = wa === null ? terrainAt(x, z) : wa;
        q.P.position.set(x, y + (moving ? Math.abs(Math.cos(q.phase)) * .02 * motion : 0), z); q.P.rotation.set(0, q.heading, sway); q.P.scale.setScalar(q.scale);
        q.legs[0].rotation.x = sw; q.legs[1].rotation.x = -sw;
        if (q.star) { q.star.rotation.z = Math.sin(time * 1.1) * .08 * motion; q.star.userData.glow(); }
      });
      flames.forEach((f, i) => f.material.opacity = (.4 + .5 * lit) * (motion < 1 ? 1 : .85 + .15 * Math.sin(time * 9 + i * 2)));
    });
  }
