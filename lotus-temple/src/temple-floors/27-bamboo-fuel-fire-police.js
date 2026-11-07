  // a stand of bamboo, drawn as two instanced meshes: clump(cx, cz, big) adds a clump of tall green culms fanning out from one root,
  // with feathery leaves on their upper halves and a few older culms gone yellow; each culm stands on the land where it roots
  function bambooStand(g, r, data, NC, NL) {
    const culmGeo = new THREE.CylinderGeometry(.045, .055, 1, 5); culmGeo.translate(0, .5, 0);
    const leafGeo = new THREE.IcosahedronGeometry(1, 0);
    const CULMS = [0x6e8f34, 0x7d9c3c, 0x5f8030, 0x6a8a36, 0xa89c50].map(c => new THREE.Color(c)), LEAVES = [0x4a7a2e, 0x568634, 0x3e6a28].map(c => new THREE.Color(c));
    const white = { color: 0xffffff, roughness: .85 };
    const culms = new THREE.InstancedMesh(culmGeo, std(white), NC), leaves = new THREE.InstancedMesh(leafGeo, std({ ...white, roughness: 1, flatShading: true }), NL);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V(0, 1, 0), dir = V(0, 1, 0);
    let nc = 0, nl = 0;
    const clump = (cx, cz, big, n) => {
      sCircle(g, cx, cz, .7);
      for (let k = 0; k < n && nc < NC; k++) {
        const a = r() * TAU, rr = r() * .6, lean = .04 + r() * .2 + rr * .15, h = (6 + r() * 5) * big, th = .8 + r() * .5;
        dir.set(Math.sin(lean) * Math.cos(a), Math.cos(lean), Math.sin(lean) * Math.sin(a));
        const bx = cx + Math.cos(a) * rr, bz = cz + Math.sin(a) * rr, by = terrainAt(bx, bz) - .05;
        m4.compose(V(bx, by, bz), q.setFromUnitVectors(up, dir), V(th, h, th)); culms.setMatrixAt(nc, m4);
        culms.setColorAt(nc++, CULMS[r() < .1 ? 4 : (r() * 4) | 0]);
        for (let j = 0; j < 4 && nl < NL; j++) {   // leaf tufts up the top half, drooping out from the culm
          const f = .55 + j * .14 + r() * .05, s = .6 + r() * .5;
          m4.compose(V(bx + dir.x * h * f + (r() - .5) * .5, by + dir.y * h * f, bz + dir.z * h * f + (r() - .5) * .5), q.setFromAxisAngle(up, r() * TAU), V(s * 1.1, s * .35, s * .8));
          leaves.setMatrixAt(nl, m4); leaves.setColorAt(nl++, LEAVES[(r() * 3) | 0]);
        }
      }
    };
    const done = () => {
      culms.count = nc; leaves.count = nl;
      // always drawn: three.js r128 would cull an instanced mesh by its one base geometry at the origin
      [culms, leaves].forEach(m => { m.castShadow = false; m.receiveShadow = true; m.frustumCulled = false; g.add(m); clickable(picks.pagoda, m, data); });
    };
    return { clump, done };
  }
  // ဝါးတော, a bamboo grove behind the school, beyond its back wall: clumps of bamboo, dry leaves on the ground between
  function bambooGrove(g) {
    const r = rng(7171), X0 = 46, X1 = 98, Z0 = 155, Z1 = 176, data = { tip: "The bamboo grove · ဝါးတော", toast: "A bamboo grove behind the school. The culms grow in clumps from one root, a few metres in a season; people cut them for scaffolding, fences, baskets and the walls of the huts, and dig the young shoots to eat in the rains." };
    flat(mesh(new THREE.BoxGeometry(X1 - X0 + 4, .04, Z1 - Z0 + 4), std({ color: 0x7a6a48, roughness: 1 }), (X0 + X1) / 2, .025, (Z0 + Z1) / 2, g)).receiveShadow = true;   // dry leaves
    const stand = bambooStand(g, r, data, 1100, 4400);
    for (let x = X0 + 1.5; x < X1 - 1; x += 3.4) for (let z = Z0 + 1; z < Z1; z += 3.4) {
      if (r() < .22) continue;
      const cx = x + (r() - .5) * 2, cz = z + (r() - .5) * 2, n = 8 + (r() * 9 | 0), big = .8 + r() * .4;
      stand.clump(cx, cz, big, n);
    }
    stand.done();
  }
  // a band of bamboo along the stupa hill's eastern foot, between the hill and the backs of the houses on the plaza lane, round
  // the church and facing the Haw Kham: clumps on the bottom of the slope and the flat below it, wherever no house, lane, tree or
  // wall stands, leaving a walk clear along the house backs. Built after backStreets, so the houses' footprints can be read.
  const FOOT_BAMBOO = { a0: -.8, a1: .15, r0: -2.5, r1: 14, step: 3.1, clear: 2.6 };   // angles round the hill (world, radians), radial band past the hill's foot (m), clump spacing, room kept from anything else
  function hillFootBamboo(g) {
    const r = rng(7272), F = FOOT_BAMBOO, { cx, cz, rBase } = HILL, data = { tip: "Bamboo at the hill's foot · ဝါးတော", toast: "Bamboo grows thick along the foot of the stupa hill, behind the houses. The families cut culms here for fences, baskets and roof frames, and in the rains they dig the young shoots to cook." };
    const avoid = [[-14, 98], [-12, 104]];   // the garden tree and banana behind the plaza-lane houses
    const taken = (x, z) => LANES.some(l => x > l.x0 - 1.5 && x < l.x1 + 1.5 && z > l.z0 - 1.5 && z < l.z1 + 1.5) || avoid.some(([ax, az]) => Math.hypot(x - ax, z - az) < 1.6) || surfAt(x, z);
    const free = (x, z) => [0, 1.2, F.clear].every(d => d ? [...Array(10)].every((_, i) => !taken(x + Math.cos(i * TAU / 10) * d, z + Math.sin(i * TAU / 10) * d)) : !taken(x, z));
    const stand = bambooStand(g, r, data, 700, 2800);
    for (let rr = rBase + F.r0; rr < rBase + F.r1; rr += F.step) for (let a = F.a0; a < F.a1; a += F.step / rr) {
      if (r() < .18) continue;
      const x = cx + Math.cos(a + (r() - .5) * .02) * (rr + (r() - .5) * 1.4), z = cz + Math.sin(a + (r() - .5) * .02) * (rr + (r() - .5) * 1.4);
      const n = 7 + (r() * 8 | 0), big = .75 + r() * .4;
      if (free(x, z)) stand.clump(x, z, big, n);
    }
    stand.done();
    SURF.forEach(e => e.inv = null);   // read again once the grounds are placed
  }
  // ဓာတ်ဆီဆိုင်, a fuel station on the town road south of the bridge: a forecourt off the road, a canopy lit underneath at night
  // over two islands of pumps, a small shop behind, and the sign on a pylon by the road
  function fuelStation(g) {
    const data = { tip: "The fuel station", toast: "A fuel station on the road out of town, past the bridge. Motorbikes, farm tractors and trucks on the way to the paddy fields fill up here; the shop sells drinking water, snacks and engine oil." };
    flat(mesh(new THREE.BoxGeometry(24.2, .06, 22), forecourt, -26.1, .04, -55, g)).receiveShadow = true;
    // the canopy
    const CX = -27.5, CZ = -55, CH = 5.2, canopyLit = std({ color: 0xfafafa, emissive: 0xf8f8ff, emissiveIntensity: 0 });
    onDaylight(d => canopyLit.emissiveIntensity = .9 * (1 - d));
    clickable(picks.pagoda, mesh(new THREE.BoxGeometry(13, .6, 9), civicWhite, CX, CH, CZ, g), data);
    [[0, .32, 13.1, .3, 9.1, civicGreen], [0, -.32, 13.1, .12, 9.1, std({ color: 0xf0b820, roughness: .5 })]].forEach(([dx, dy, w, hh, d, m]) => mesh(new THREE.BoxGeometry(w, hh, d), m, CX + dx, CH + dy, CZ, g));
    [-3, 3].forEach(dz => mesh(new THREE.BoxGeometry(10, .04, 1.2), canopyLit, CX, CH - .42, CZ + dz, g));
    // the pump islands, each with two pumps, under the canopy
    [-2.4, 2.4].forEach(dx => {
      mesh(new THREE.BoxGeometry(1.1, .22, 5), concrete, CX + dx, .15, CZ, g); sRect(g, CX + dx - .55, CX + dx + .55, CZ - 2.5, CZ + 2.5);
      mesh(new THREE.BoxGeometry(.4, CH - .4, .4), civicWhite, CX + dx, CH / 2, CZ, g);
      [-1.4, 1.4].forEach(dz => { mesh(new THREE.BoxGeometry(.7, 1.8, .5), civicGreen, CX + dx, 1.15, CZ + dz, g); mesh(new THREE.BoxGeometry(.72, .4, .3), windscreen, CX + dx, 1.6, CZ + dz, g); });
    });
    // the shop behind the pumps, facing the road
    civic(g, -18, -55, -Math.PI / 2, { W: 10, D: 5, floors: 1, wall: civicWhite, trim: civicGreen, door: true, data });
    // the sign on its pylon by the road
    mesh(new THREE.BoxGeometry(.5, 6, .5), civicGreen, -36, 3, -45.2, g); sCircle(g, -36, -45.2, .35);
    [-.27, .27].forEach(dx => { civicSign(g, "ဓာတ်ဆီ", "Fuel · Diesel", "#2f7a4a", "#ffffff", 3.2, -36 + dx, 5.8, -45.2, dx < 0 ? -Math.PI / 2 : Math.PI / 2).material.side = THREE.FrontSide; });   // one face each way
  }
  // မီးသတ်စခန်း, the fire station on the street east of the seven-day market: three engine bays under the offices, a hose-drying tower
  // behind, an engine standing ready on the apron; and ရဲစခန်း, the police station beside it with the flag and a patrol car
  function fireAndPolice(g) {
    const fire = { tip: "The fire station", toast: "The township fire station: engines in the bays below, the crew's rooms above, and the tall tower behind where the hoses hang to dry. In the hot season before the rains the crews are out every day." };
    const police = { tip: "The police station", toast: "The township police station, with the flag in front and a patrol car at the door." };
    // the fire station
    flat(mesh(new THREE.BoxGeometry(18, .06, 4.6), forecourt, 114, .04, 45.2, g)).receiveShadow = true;
    const { h: fh } = civic(g, 114, 37.5, 0, { W: 16, D: 11, floors: 2, wall: civicWhite, trim: civicRed, roof: ROOFS[1](1), blankFront: true, data: fire });
    const bayLit = std({ color: 0x2a2420, roughness: .9, emissive: 0xffd8a0, emissiveIntensity: 0 });
    onDaylight(d => bayLit.emissiveIntensity = .25 * (1 - d));
    [-5, 0, 5].forEach((bx, i) => {
      mesh(new THREE.BoxGeometry(4, 3, .1), i === 1 ? bayLit : civicRed, bx, 1.8, 5.53, fh);   // two doors down, the middle bay open
      mesh(new THREE.BoxGeometry(4.3, .2, .14), civicWhite, bx, 3.35, 5.55, fh);
    });
    civicSign(fh, "မီးသတ်စခန်း", "Fire Station", "#b8281e", "#ffffff", 4, 0, 4.05, 5.6);
    const tw = new THREE.Group(); tw.position.set(119.5, 0, 30.2); g.add(tw);   // the hose tower
    clickable(picks.pagoda, mesh(new THREE.BoxGeometry(3, 16, 3), civicWhite, 0, 8, 0, tw), fire); sRect(tw, -1.6, 1.6, -1.6, 1.6);
    [4, 8, 12].forEach(y => mesh(new THREE.BoxGeometry(3.1, .4, 3.1), civicRed, 0, y, 0, tw));
    mesh(new THREE.BoxGeometry(3.6, .3, 3.6), civicRed, 0, 16.15, 0, tw);
    mesh(new THREE.CylinderGeometry(.25, .25, .5, 10), steel, 0, 16.55, 0, tw);   // the siren
    TALL.push({ x0: 117.5, x1: 121.5, z0: 28, z1: 32.5, h: 17 });
    const eng = vehicle(g, 114, 45.3, Math.PI / 2, { L: 7.6, W: 2.4, H: 3, cabL: 2.2, body: civicRed, stripe: civicWhite, beacons: 1 });
    for (let k = 0; k < 2; k++) mesh(new THREE.BoxGeometry(.1, .1, 5), steel, k ? .5 : -.5, 3.15, -.9, eng);   // the ladder on top
    for (let k = 0; k < 9; k++) mesh(new THREE.BoxGeometry(1, .06, .06), steel, 0, 3.15, -3.2 + k * .55, eng);
    // the police station
    flat(mesh(new THREE.BoxGeometry(16, .06, 7), forecourt, 133, .04, 44, g)).receiveShadow = true;
    const { h: ph } = civic(g, 133, 36, 0, { W: 13, D: 9, floors: 2, wall: civicWhite, trim: civicBlue, roof: ROOFS[2](1), door: true, data: police });
    clickable(picks.pagoda, mesh(new THREE.BoxGeometry(4, .3, 2.4), civicBlue, 0, 3, 5.7, ph), police);
    [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(.3, 2.9, .3), civicWhite, sd * 1.8, 1.45, 6.7, ph); sCircle(ph, sd * 1.8, 6.7, .25); });
    civicSign(ph, "ရဲစခန်း", "Police Station", "#2a4a8a", "#ffffff", 3.6, 0, 4, 4.53);
    flagPole(g, 127, 44.5);
    vehicle(g, 137.5, 44.5, Math.PI / 2, { L: 4.8, W: 2, H: 1.8, cabL: 2.6, body: civicWhite, stripe: civicBlue, beacons: 2 });
  }
  // the town's welcome board on the verge at the east end of the street, beside the police station and clear of the road, made the Shan way: a carved teak board
  // on two posts under a small two-tiered roof with a golden finial, lettered in gold in Shan, Burmese and English. It isn't lit
  const WELCOME = { shan: "ယိၼ်းၸူမ်းႁပ်ႉ ၸူး ဝဵင်းသဵၼ်ဝီ", my: "သိန္နီမြို့မှ ကြိုဆိုပါသည်", en: "Welcome to Hsenwi" };
  function welcomeSign(g) {
    const data = { tip: "Welcome to Hsenwi · သဵၼ်ဝီ", toast: "Welcome to Hsenwi (သဵၼ်ဝီ in Shan, သိန္နီ in Burmese), on the road from Lashio to Muse in northern Shan State: once the seat of one of the oldest Shan states, its sawbwa's palace long gone, now a market town among the hills." };
    const b = new THREE.Group(); b.position.set(144, 0, 44.4); b.rotation.y = -Math.PI / 2; g.add(b);   // on the verge beside the street, its face looking back down it
    const teak = std({ color: 0x5a2e18, roughness: .7 }), dark = std({ color: 0x3a1c10, roughness: .8 }), gold = M.gold;
    const lime = std({ color: 0xe8e2d4, roughness: .9 }), tin = std({ color: 0x4a3a30, roughness: .6, metalness: .3, flatShading: true });
    // the board: both faces lettered, in a carved frame
    const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 400;
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
    const paint = () => {
      const c = cv.getContext("2d"), W = 1024, H = 400;
      c.fillStyle = "#5a2a16"; c.fillRect(0, 0, W, H);
      c.strokeStyle = "#d8b25a"; c.lineWidth = 10; c.strokeRect(14, 14, W - 28, H - 28); c.lineWidth = 3; c.strokeRect(32, 32, W - 64, H - 64);
      c.fillStyle = "#d8b25a";   // lotus-bud corners
      [[48, 48], [W - 48, 48], [48, H - 48], [W - 48, H - 48]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill(); });
      c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#f0cf72";
      c.font = '600 76px "Noto Sans Myanmar", "Myanmar Text", sans-serif'; c.fillText(WELCOME.shan, W / 2, 130, W - 110);
      c.font = '600 64px "Noto Sans Myanmar", "Myanmar Text", sans-serif'; c.fillText(WELCOME.my, W / 2, 238, W - 110);
      c.font = '400 44px "Marcellus", serif'; c.fillText(WELCOME.en, W / 2, 330, W - 110);
      t.needsUpdate = true;
    };
    paint();
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('600 82px "Noto Sans Myanmar"', WELCOME.shan + WELCOME.my), document.fonts.load('400 44px "Marcellus"', WELCOME.en)]).then(paint, () => {});
    const face = std({ map: t, roughness: .65 });
    const BW = 4.4, BH = BW * 400 / 1024, BY = 2.3;
    clickable(picks.pagoda, mesh(new THREE.BoxGeometry(BW, BH, .12), [dark, dark, dark, dark, face, face], 0, BY, 0, b), data);
    [[0, BY + BH / 2 + .07, BW + .3, .14], [0, BY - BH / 2 - .07, BW + .3, .14]].forEach(([x, y, w, h]) => mesh(new THREE.BoxGeometry(w, h, .2), teak, x, y, 0, b));   // top and bottom rails
    // the two posts on whitewashed brick footings, with carved brackets under the board
    [-1, 1].forEach(sd => {
      const x = sd * (BW / 2 + .2);
      mesh(new THREE.BoxGeometry(.6, .5, .6), lime, x, .25, 0, b); sCircle(b, x, 0, .4);
      mesh(new THREE.BoxGeometry(.22, 3.9, .22), teak, x, 2.2, 0, b);
      const br = mesh(new THREE.BoxGeometry(.5, .1, .14), teak, x - sd * .3, BY - BH / 2 - .3, 0, b); br.rotation.z = sd * .6;
    });
    // the two-tiered roof: gables of dark tin with upturned ends, a gilded fretwork edge, the upper tier smaller
    const gable = (w, d, h, y) => {
      const geo = new THREE.CylinderGeometry(d / 1.73, d / 1.73, w, 3, 1, false, Math.PI / 2); geo.rotateZ(Math.PI / 2); geo.scale(1, h / (d / 1.73 * 1.5), 1);
      mesh(geo, tin, 0, y, 0, b);
      [-1, 1].forEach(sd => {   // the gable ends curl up
        const tip = mesh(new THREE.ConeGeometry(.07, .4, 5), gold, sd * (w / 2 + .05), y + .05, 0, b); tip.rotation.z = -sd * .9;
        [-1, 1].forEach(e => mesh(new THREE.BoxGeometry(w, .06, .03), gold, 0, y - h * .32, e * d * .5, b));   // fretwork along the eaves
      });
    };
    const top = BY + BH / 2 + .14;
    gable(BW + 1, 1.1, .55, top + .3);
    mesh(new THREE.BoxGeometry(BW * .45, .35, .5), dark, 0, top + .78, 0, b);   // the little upper storey between the tiers
    gable(BW * .6, .8, .45, top + 1.15);
    // the finial: a gilded spire with umbrella rings, as on a monastery roof
    mesh(new THREE.ConeGeometry(.09, .7, 8), gold, 0, top + 1.65, 0, b);
    [0, 1, 2].forEach(i => mesh(new THREE.TorusGeometry(.12 - i * .03, .015, 5, 12), gold, 0, top + 1.45 + i * .14, 0, b).rotation.x = Math.PI / 2);
  }
