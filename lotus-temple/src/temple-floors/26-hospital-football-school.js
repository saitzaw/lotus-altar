  /* ---------- the town's public buildings, in the plain painted concrete of Shan State towns today: the general hospital by the
     hut village, the high school south of the daily market, a fuel station on the road out past the bridge, and the fire station
     and police station side by side on the street east of the seven-day market ---------- */
  const civicWin = new THREE.BoxGeometry(1.2, 1.4, .08);
  // a public building in local coordinates, front facing +z: W wide, D deep, `floors` storeys, painted walls with a trim band at
  // each floor and rows of windows on every side; an open corridor `corridor` deep along the front on every floor (as schools and
  // hospitals are built here); a corrugated hip roof, or a flat roof with a parapet when `roof` is null
  function civic(g, x, z, ry, o) {
    const { W, D, floors, wall, trim = townFrame, roof = null, corridor = 0, data } = o, FH = 3.3, H = floors * FH, top = .3 + H;
    const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
    mesh(new THREE.BoxGeometry(W + .6, .3, D + corridor + .6), concrete, 0, .15, corridor / 2, h);   // the plinth
    const body = mesh(new THREE.BoxGeometry(W, H, D), wall, 0, .3 + H / 2, 0, h);
    if (data) clickable(picks.pagoda, body, data);
    sRect(h, -W / 2 - .3, W / 2 + .3, -D / 2 - .3, D / 2 + corridor + .3);
    const wins = [], nx = Math.max(1, Math.floor((W - 1.4) / 2.6)), nz = Math.max(1, Math.floor((D - 1.4) / 2.6));
    if (o.strip) {   // a modern block: one long band of glass round each floor instead of separate windows (stretched instances of a unit box)
      const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), townGlass, floors * 4), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
      for (let f = 0; f < floors; f++) {
        const y0 = .3 + f * FH;
        mesh(new THREE.BoxGeometry(W + .12, .22, D + .12), trim, 0, y0 + FH - .11, 0, h);
        [[0, D / 2, W - 1.6, 0], [0, -D / 2, W - 1.6, 0], [W / 2, 0, D - 1.6, 1], [-W / 2, 0, D - 1.6, 1]].forEach(([px, pz, len, side], k) =>
          im.setMatrixAt(f * 4 + k, m4.compose(V(px, y0 + 1.75, pz), q, side ? V(.1, 1.5, len) : V(len, 1.5, .1))));
      }
      h.add(im);
    }
    else for (let f = 0; f < floors; f++) {
      const y0 = .3 + f * FH;
      mesh(new THREE.BoxGeometry(W + .12, .22, D + .12), trim, 0, y0 + FH - .11, 0, h);
      for (let i = 0; i < nx; i++) {
        const px = -W / 2 + W * (i + .5) / nx;
        if (!(f === 0 && (o.blankFront || (o.door && Math.abs(px) < 1.6)))) wins.push([px, y0 + 1.7, D / 2 + .02, 0]);
        wins.push([px, y0 + 1.7, -D / 2 - .02, 0]);
      }
      for (let i = 0; i < nz; i++) { const pz = -D / 2 + D * (i + .5) / nz; wins.push([W / 2 + .02, y0 + 1.7, pz, Math.PI / 2], [-W / 2 - .02, y0 + 1.7, pz, Math.PI / 2]); }
    }
    if (wins.length) {
      const im = new THREE.InstancedMesh(civicWin, townGlass, wins.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
      wins.forEach(([px, py, pz, a], i) => im.setMatrixAt(i, m4.compose(V(px, py, pz), q.setFromAxisAngle(V(0, 1, 0), a), V(1, 1, 1))));
      h.add(im);
    }
    if (o.door) mesh(new THREE.BoxGeometry(2, 2.4, .1), townGlass, 0, 1.5, D / 2 + .03, h);
    if (corridor) {   // the open corridor: a floor slab on each storey, a parapet along the front (open on the ground floor), columns
      const zc = D / 2 + corridor / 2, zf = D / 2 + corridor - .1, n = Math.max(2, Math.round(W / 4));
      for (let f = 1; f <= floors; f++) mesh(new THREE.BoxGeometry(W, .2, corridor), concrete, 0, .3 + f * FH - .1, zc, h);
      for (let f = 1; f < floors; f++) mesh(new THREE.BoxGeometry(W, .9, .12), trim, 0, .3 + f * FH + .45, zf, h);
      for (let i = 0; i <= n; i++) mesh(new THREE.BoxGeometry(.3, H, .3), wall, -W / 2 + .15 + i * (W - .3) / n, .3 + H / 2, zf, h);
    }
    const Dd = D + corridor;
    if (roof) {
      const a = W / 2 + .8, b = Dd / 2 + .8, rm = tinHipRoof(Math.max(a, b), Math.min(a, b), Math.min(a, b) * .45, roof);
      rm.position.set(0, top, corridor / 2); if (a < b) rm.rotation.y = Math.PI / 2; rm.castShadow = rm.receiveShadow = true; h.add(rm);
      mesh(new THREE.BoxGeometry(W + .2, .2, Dd + .2), concrete, 0, top + .05, corridor / 2, h);   // the ceiling under the roof
    } else {
      mesh(new THREE.BoxGeometry(W, .2, Dd), concrete, 0, top + .1, corridor / 2, h);
      [[0, -D / 2, W, .2], [0, D / 2 + corridor, W, .2], [-W / 2, corridor / 2, .2, Dd], [W / 2, corridor / 2, .2, Dd]].forEach(([px, pz, w, d]) => mesh(new THREE.BoxGeometry(w, .8, d), trim, px, top + .5, pz, h));
    }
    // keep the outside camera above it
    const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), ex = c * W / 2 + s * Dd / 2 + 1, ez = s * W / 2 + c * Dd / 2 + 1;
    const cx = x + Math.sin(ry) * corridor / 2, cz = z + Math.cos(ry) * corridor / 2;
    TALL.push({ x0: cx - ex, x1: cx + ex, z0: cz - ez, z1: cz + ez, h: top + (roof ? Math.min(W, Dd) * .23 + .8 : 1) });
    return { h, top };
  }
  // a painted signboard, Burmese above and English below, faintly lit at night; a plane facing local +z of `parent`
  function civicSign(parent, my, en, bg, fg, w, x, y, z, ry = 0) {
    const cv = document.createElement("canvas"); cv.width = 512; cv.height = 160;
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
    const paint = () => {
      const c = cv.getContext("2d");
      c.fillStyle = bg; c.fillRect(0, 0, 512, 160); c.strokeStyle = fg; c.lineWidth = 8; c.strokeRect(5, 5, 502, 150);
      c.fillStyle = fg; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = '600 54px "Noto Sans Myanmar", "Myanmar Text", sans-serif'; c.fillText(my, 256, 58, 480);
      c.font = '600 36px "Figtree", sans-serif'; c.fillText(en, 256, 122, 480);
      t.needsUpdate = true;
    };
    paint();
    if (document.fonts && document.fonts.load) document.fonts.load('600 54px "Noto Sans Myanmar"', my).then(paint, () => {});
    const m = std({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .3, roughness: .6, side: THREE.DoubleSide });
    onDaylight(d => { m.emissiveIntensity = .3 + .5 * (1 - d); });
    const sb = flat(mesh(new THREE.PlaneGeometry(w, w * 160 / 512), m, x, y, z, parent)); sb.rotation.y = ry;
    return sb;
  }
  // the flag of Myanmar on a white pole: yellow, green and red bands with a white star
  const flagTex = canvasTex(128, (c, sz) => {
    [["#fecb00", 0], ["#34b233", 1], ["#ea2839", 2]].forEach(([col, i]) => { c.fillStyle = col; c.fillRect(0, i * sz / 3, sz, sz / 3 + 1); });
    c.fillStyle = "#fff"; c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 14 : 36; c.lineTo(sz / 2 + Math.cos(a) * r, sz / 2 + 4 + Math.sin(a) * r); }
    c.fill();
  });
  function flagPole(g, x, z, H = 8) {
    mesh(new THREE.CylinderGeometry(.06, .08, H, 8), townFrame, x, H / 2, z, g); sCircle(g, x, z, .15);
    const f = mesh(new THREE.PlaneGeometry(1.8, 1.2), std({ map: flagTex, roughness: .7, side: THREE.DoubleSide }), x + .95, H - .7, z, g); f.castShadow = false;
  }
  // a parked vehicle, nose toward local +z: a box body, a cab with a windscreen, wheels, a side stripe and roof beacons
  const wheelGeo = new THREE.CylinderGeometry(.42, .42, .3, 12); wheelGeo.rotateZ(Math.PI / 2);
  const tyre = std({ color: 0x1a1a1a, roughness: .9 }), windscreen = std({ color: 0x1e2a32, roughness: .15, metalness: .4 });
  const beaconMats = [0xff2a2a, 0x2a6aff].map(c => std({ color: c, emissive: c, emissiveIntensity: .4 }));
  onDaylight(d => beaconMats.forEach(m => m.emissiveIntensity = .4 + .8 * (1 - d)));
  function vehicle(g, x, z, ry, o) {
    const v = new THREE.Group(); v.position.set(x, 0, z); v.rotation.y = ry; g.add(v);
    const { L, W = 2.2, H, cabL = 1.9, body, stripe, beacons = 1 } = o, cabH = Math.min(H, 2.5);
    sRect(v, -W / 2, W / 2, -L / 2, L / 2);
    mesh(new THREE.BoxGeometry(W, H - .5, L - cabL), body, 0, .5 + (H - .5) / 2, -cabL / 2, v);
    mesh(new THREE.BoxGeometry(W, cabH - .5, cabL), body, 0, .5 + (cabH - .5) / 2, L / 2 - cabL / 2, v);
    mesh(new THREE.BoxGeometry(W - .3, .6, .06), windscreen, 0, cabH - .5, L / 2 + .01, v);
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.06, .5, cabL - .6), windscreen, sd * (W / 2 + .01), cabH - .5, L / 2 - cabL / 2 + .1, v));
    if (stripe) [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.04, .25, L - .2), stripe, sd * (W / 2 + .02), 1.1, 0, v));
    [-1, 1].forEach(sx => [-1, 1].forEach(sz => mesh(wheelGeo, tyre, sx * (W / 2 - .1), .42, sz * (L / 2 - .95), v)));
    if (beacons) [-1, 1].forEach((sd, i) => mesh(new THREE.BoxGeometry(.5, .15, .25), beaconMats[beacons === 2 ? i : 0], sd * .35, cabH + .08, L / 2 - cabL / 2, v));
    return v;
  }
  const civicWhite = std({ color: 0xf4f2ec, roughness: .85 }), civicCream = std({ color: 0xf0e2b8, roughness: .85 });
  const civicGreen = std({ color: 0x2f7a4a, roughness: .7 }), civicBlue = std({ color: 0x2a4a8a, roughness: .7 }), civicRed = std({ color: 0xb8281e, roughness: .6 });
  const forecourt = std({ color: 0x9a968e, roughness: .9 });
  // ႁူင်းယႃလူင်ၵူၼ်းမိူင်း, the public general hospital, the main hospital for the town and the villages round it: a modern block of five
  // storeys in white with blue bands and long ribbons of glass, its back to the stream and its west end clear of the waterfall's cliff;
  // a five-storey wing running south beside the lane; a full-height glass entrance hall under a drive-in canopy, red crosses on the
  // roof's front, ambulances in the forecourt and a small garden for the patients' families. Its name stands apart from it, on a
  // monument at the forecourt's corner facing the road up from the street. Down the lane: the blood bank and the nursing college
  const HOSP_NAMES = { shan: "ႁူင်းယႃလူင်ၵူၼ်းမိူင်း", my: "ပြည်သူ့ဆေးရုံကြီး", taiNua: "ᥞᥨᥒᥰ ᥕᥣ ᥘᥨᥒᥴ ᥐᥨᥢᥰ ᥛᥫᥒᥰ", en: "Public General Hospital", zh: "人民医院" };   // as given by the site's owner
  const HOSP = { x: -102, z: -12, W: 34, D: 14, floors: 5, wing: { x: -89.75, z: 3.5, W: 17, D: 8.5 },   // the main block's centre and size; the south wing's (turned to face the lane)
    sign: { x: -117.8, z: 1.6, ry: -Math.PI / 4 } };   // the name monument, facing south-west down the road
  // rubble-stone walling, rounded field stones of browns and greys set in mortar (as in the owner's photograph of a hill-town
  // hospital); `stoneMat(rx, ry)` gives it repeated rx × ry times across a face
  const fieldStoneTex = canvasTex(256, (c, s) => {
    c.fillStyle = "#6a5e50"; c.fillRect(0, 0, s, s);
    const r = rng(91), cols = ["#8a7458", "#7a6650", "#96806a", "#6e5e4c", "#8c8478", "#9a7a58", "#665646", "#a48c70", "#7e7668"];
    for (let i = 0; i < 150; i++) {
      const x = r() * s, y = r() * s, rx = 9 + r() * 11, ry = 6 + r() * 8, col = cols[(r() * cols.length) | 0], a = (r() - .5) * .6;
      [-s, 0, s].forEach(ox => [-s, 0, s].forEach(oy => {   // drawn again across each edge, so the texture tiles
        c.beginPath(); c.ellipse(x + ox, y + oy, rx, ry, a, 0, TAU); c.fillStyle = col; c.fill();
        c.lineWidth = 2; c.strokeStyle = "rgba(40,30,20,.45)"; c.stroke();
        c.beginPath(); c.ellipse(x + ox - rx * .25, y + oy - ry * .3, rx * .45, ry * .35, a, 0, TAU); c.fillStyle = "rgba(255,240,215,.1)"; c.fill();
      }));
    }
  });
  const stoneMat = (rx, ry) => { const t = fieldStoneTex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return std({ map: t, roughness: .95 }); };
  // the monument's name panel: Shan, Burmese, Tai Nüa (in Tai Le script), English and Chinese in raised bronze letters on white
  function hospitalNameMat() {
    const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 576;
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
    const MY = '"Noto Sans Myanmar", "Myanmar Text", sans-serif', N = HOSP_NAMES;
    const LINES = [[N.shan, `600 70px ${MY}`, 78], [N.my, `600 70px ${MY}`, 190], [N.taiNua, '400 58px "Noto Sans Tai Le", "Microsoft Tai Le", sans-serif', 296], [N.en, '600 50px "Figtree", sans-serif', 392], [N.zh, '600 76px "Noto Serif SC", "Noto Serif TC", "Songti SC", serif', 492]];
    const paint = () => {
      const c = cv.getContext("2d");
      c.fillStyle = "#f6f4ee"; c.fillRect(0, 0, 1024, 576); c.textAlign = "center"; c.textBaseline = "middle";
      LINES.forEach(([s, font, ly]) => { c.font = font; c.fillStyle = "rgba(60,40,10,.45)"; c.fillText(s, 515, ly + 4, 960); c.fillStyle = "#7a5420"; c.fillText(s, 512, ly, 960); });
      t.needsUpdate = true;
    };
    paint();
    if (document.fonts && document.fonts.load) Promise.all(LINES.map(([s, font]) => document.fonts.load(font, s).catch(() => {}))).then(paint);
    const m = std({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .1, roughness: .5 });
    onDaylight(d => { m.emissiveIntensity = .1 + .45 * (1 - d); });   // floodlit at night
    return m;
  }
  // the name monument, after the owner's photograph: a white arched panel carrying the name between two rubble-stone pillars with
  // white caps, on a stone base with a white coping, and a half-round raised lawn bed with a white kerb in front. Front faces local +z
  function hospitalMonument(g, data) {
    const { x, z, ry } = HOSP.sign, m = new THREE.Group(); m.position.set(x, 0, z); m.rotation.y = ry; g.add(m);
    mesh(new THREE.BoxGeometry(6.4, 1.1, .9), stoneMat(3, .5), 0, .55, 0, m);
    mesh(new THREE.BoxGeometry(6.6, .14, 1), civicWhite, 0, 1.17, 0, m);
    [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(.8, 2.9, .8), stoneMat(.5, 1.6), sd * 2.75, 2.69, 0, m); mesh(new THREE.BoxGeometry(.95, .16, .95), civicWhite, sd * 2.75, 4.22, 0, m); });
    const sh = new THREE.Shape(); sh.moveTo(-2.35, 0); sh.lineTo(2.35, 0); sh.lineTo(2.35, 2.5);
    sh.bezierCurveTo(1.6, 2.6, 1.2, 3.3, 0, 3.3); sh.bezierCurveTo(-1.2, 3.3, -1.6, 2.6, -2.35, 2.5); sh.closePath();
    const panel = mesh(new THREE.ExtrudeGeometry(sh, { depth: .35, bevelEnabled: false, curveSegments: 16 }), civicWhite, 0, 1.24, -.175, m);
    clickable(picks.pagoda, panel, data);
    clickable(picks.pagoda, flat(mesh(new THREE.PlaneGeometry(4.2, 4.2 * 576 / 1024), hospitalNameMat(), 0, 1.24 + 1.3, .18, m)), data);
    mesh(new THREE.BoxGeometry(5, .12, .5), civicWhite, 0, 1.3, .2, m);   // the sill under the panel
    const half = (r, h) => new THREE.CylinderGeometry(r, r, h, 28, 1, false, -Math.PI / 2, Math.PI);
    mesh(half(3, .5), civicWhite, 0, .25, .45, m);
    flat(mesh(half(2.85, .04), std({ color: 0x5f8a42, roughness: 1 }), 0, .51, .45, m)).receiveShadow = true;
    sRect(m, -3.3, 3.3, -.5, .5); sRect(m, -3, 3, .45, 3.45);
    TALL.push({ x0: x - 4, x1: x + 4, z0: z - 4, z1: z + 4, h: 5.2 });
  }
  function hospital(g) {
    const { x: X, z: Z, W, D, floors, wing } = HOSP, N = HOSP_NAMES, F = Z + D / 2, FH = 3.3;   // F: the main block's front
    const data = { tip: `The general hospital · ${N.shan}`, toast: `${N.shan} in Shan, ${N.my} in Burmese, ${N.taiNua} in Tai Nüa, ${N.zh} in Chinese: the public general hospital, the main hospital for the town and the villages round it. Five floors of wards, operating theatres and clinics, with outpatients and the emergency room off the glass entrance hall. Families wait on the benches in the forecourt and the garden, and the ambulances stand ready by the door.` };
    flat(mesh(new THREE.BoxGeometry(27.5, .05, 10.3), forecourt, -107.75, .03, F + 5, g)).receiveShadow = true;   // the forecourt, out west to meet the road up from the street
    const { h, top } = civic(g, X, Z, 0, { W, D, floors, wall: civicWhite, trim: civicBlue, strip: true, data });
    const { h: wh } = civic(g, wing.x, wing.z, -Math.PI / 2, { W: wing.W, D: wing.D, floors, wall: civicWhite, trim: civicBlue, strip: true, data });
    // the entrance hall: glass from the ground to above the roof between white fins, a floor edge at each storey, sliding doors
    const HW = 8, HD = 1.4, ZH = D / 2 + HD / 2;
    clickable(picks.pagoda, mesh(new THREE.BoxGeometry(HW, top + .6, HD), townGlass, 0, (top + .6) / 2, ZH, h), data);
    for (let i = 0; i <= 4; i++) mesh(new THREE.BoxGeometry(.18, top + 1, .3), civicWhite, -HW / 2 + i * HW / 4, (top + 1) / 2, D / 2 + HD + .05, h);
    for (let f = 1; f <= floors; f++) mesh(new THREE.BoxGeometry(HW + .2, .24, HD + .1), civicWhite, 0, .3 + f * FH - .12, ZH, h);
    mesh(new THREE.BoxGeometry(HW + .3, .3, HD + .2), civicBlue, 0, top + .75, ZH, h);
    mesh(new THREE.BoxGeometry(3.2, 2.6, .06), windscreen, 0, 1.6, D / 2 + HD + .2, h);
    sRect(h, -HW / 2 - .2, HW / 2 + .2, D / 2, D / 2 + HD + .2);
    // the drive-in canopy: a slab cantilevered from the hall on two slim steel columns, lit underneath at night
    const CZ = D / 2 + HD + 2.6, CY = 4.4;
    clickable(picks.pagoda, mesh(new THREE.BoxGeometry(13, .4, 5.4), civicWhite, 0, CY, CZ, h), data);
    mesh(new THREE.BoxGeometry(13.1, .14, 5.5), civicBlue, 0, CY + .2, CZ, h);
    [-1, 1].forEach(sd => { mesh(new THREE.CylinderGeometry(.14, .14, CY, 10), steel, sd * 5.6, CY / 2, CZ + 2.2, h); sCircle(h, sd * 5.6, CZ + 2.2, .25); });
    const porchLight = std({ color: 0xfff8e8, emissive: 0xfff0d0, emissiveIntensity: 0 });
    onDaylight(d => porchLight.emissiveIntensity = .9 * (1 - d));
    mesh(new THREE.BoxGeometry(10, .05, 3.6), porchLight, 0, CY - .22, CZ, h);
    // the roof: a red cross at each end of the front, the lift house and water tanks
    [-1, 1].forEach(sd => {
      const rc = new THREE.Group(); rc.position.set(sd * (W / 2 - 2.2), top + 2.4, D / 2 - .4); h.add(rc);
      mesh(new THREE.BoxGeometry(3, 3, .2), civicWhite, 0, 0, 0, rc); mesh(new THREE.BoxGeometry(2.3, .7, .25), civicRed, 0, 0, 0, rc); mesh(new THREE.BoxGeometry(.7, 2.3, .25), civicRed, 0, 0, 0, rc);
      mesh(new THREE.BoxGeometry(.2, 1, .2), steel, 0, -1.7, -.2, rc);
    });
    mesh(new THREE.BoxGeometry(7, 3.2, 4.5), civicWhite, 7, top + 1.6, -2.5, h); mesh(new THREE.BoxGeometry(7.1, .3, 4.6), civicBlue, 7, top + 3.05, -2.5, h);
    [-12, -9.4].forEach(px => { mesh(new THREE.CylinderGeometry(1.1, 1.1, 2, 14), std({ color: 0x3a3a3c, roughness: .6 }), px, top + 1.6, -3.5, h); mesh(new THREE.BoxGeometry(2, .6, 2), concrete, px, top + .4, -3.5, h); });
    TALL.push({ x0: X - 16, x1: X + 16, z0: F - 3, z1: F + 1, h: top + 4.5 });
    // the wing's own door off the lane, the emergency room, with its sign above (the wing's front faces west; its local x runs south)
    mesh(new THREE.BoxGeometry(2.6, 2.5, .06), windscreen, -5.5, 1.55, wing.D / 2 + .07, wh);
    clickable(picks.pagoda, civicSign(wh, "အရေးပေါ်ဌာန", "Emergency", "#c8261c", "#ffffff", 3.4, -5.5, 3.75, wing.D / 2 + .15), data);
    // ambulances (one under the canopy at the door, one parked), benches for the waiting, the flag at the forecourt's edge
    vehicle(g, X + 1, F + CZ - D / 2 - .4, Math.PI / 2, { L: 5.2, H: 2.6, body: civicWhite, stripe: civicRed });
    vehicle(g, -116, F + 2.6, Math.PI / 2, { L: 5.2, H: 2.6, body: civicWhite, stripe: civicRed });
    const bench = (x, z, ry) => { const b = mesh(new THREE.BoxGeometry(2.2, .1, .5), M.wood, x, .45, z, g); b.rotation.y = ry; [-.9, .9].forEach(dx => mesh(new THREE.BoxGeometry(.08, .45, .45), steel, x + dx * Math.cos(ry), .22, z - dx * Math.sin(ry), g)); sCircle(g, x, z, 1.1); };
    [-111.5, -92.5 - 3].forEach(x => bench(x, F + .9, 0));
    flagPole(g, -120.8, F + .4, 10);
    hospitalMonument(g, data);
    // the garden at the top of the lane, where a hut once stood: a lawn with two shade trees and benches facing the hospital
    flat(mesh(new THREE.BoxGeometry(10, .05, 8.2), std({ color: 0x5f8a42, roughness: 1 }), -104.5, .035, 10, g)).receiveShadow = true;
    tree(g, -107, 12, .8, 795); tree(g, -101.5, 13, .72, 796);
    [-106.5, -102].forEach(x => bench(x, 7, Math.PI));
    bloodBank(g); nursingCollege(g);
  }
  // a signboard on two steel posts beside a path, `civicSign`'s board lifted to eye height; front faces local +z after turning by ry
  function postSign(g, my, en, bg, fg, w, x, z, ry, data) {
    const p = new THREE.Group(); p.position.set(x, 0, z); p.rotation.y = ry; g.add(p);
    const hb = w * 160 / 512, y = 1.2 + hb / 2;
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.08, y + hb / 2, .08), steel, sd * (w / 2 - .2), (y + hb / 2) / 2, -.06, p));
    sRect(p, -w / 2, w / 2, -.15, .1);
    const sb = civicSign(p, my, en, bg, fg, w, 0, y, 0);
    if (data) clickable(picks.pagoda, sb, data);
    return sb;
  }
  // သွေးဘဏ်, the blood bank, on the west side of the lane where the huts stood, facing the lane: two storeys of white with red bands
  // under a red tin roof, its sign on posts by the lane
  function bloodBank(g) {
    const X = -104.5, Z = 29, data = { tip: "The blood bank · သွေးဘဏ်", toast: "The hospital's blood bank, where donors from the town and the villages give blood, and where it is tested, stored cold and sent up the lane to the wards and the operating theatres." };
    civic(g, X, Z, Math.PI / 2, { W: 22, D: 9, floors: 2, wall: civicWhite, trim: civicRed, roof: ROOFS[1](1), door: true, data });
    flat(mesh(new THREE.BoxGeometry(1, .05, 3), forecourt, X + 5, .035, Z, g));   // the path from the door to the lane
    postSign(g, "သွေးဘဏ်", "Blood Bank", "#c8261c", "#ffffff", 2.8, -99.1, Z - 4, Math.PI / 2, data);
  }
  // သူနာပြုသင်တန်းကျောင်း, the nursing college, on the east side of the lane where the huts stood, facing the lane: after the
  // building in the owner's photograph of a hill-town hospital, two long storeys of rubble-stone walling with dark wooden casement
  // windows of small panes, a blue corrugated-iron hip roof on blue-painted eaves, and a small gable standing out of the roof's front
  // near its left end. Front faces local +z; local x runs along the lane (south is +x)
  const COLLEGE = { x: -89.75, z: 29.5, L: 29, D: 8.5 };
  const collegeWood = std({ color: 0x5a3a22, roughness: .7 }), collegeBlue = std({ color: 0x2f5f9a, roughness: .7 });
  const cwFrame = new THREE.BoxGeometry(1.3, 1.6, .14), cwGlass = new THREE.BoxGeometry(1.1, 1.4, .02), cwMull = new THREE.BoxGeometry(.06, 1.4, .05),
    cwBar = new THREE.BoxGeometry(1.1, .05, .05), cwSill = new THREE.BoxGeometry(1.5, .08, .22);
  function nursingCollege(g) {
    const { x, z, L, D } = COLLEGE, FH = 3.2, P = .3, H = 2 * FH, top = P + H;
    const data = { tip: "The nursing college · သူနာပြုသင်တန်းကျောင်း", toast: "The hospital's nursing college: young women and men from the town and the hill villages train here as nurses and midwives, in classrooms upstairs and on the wards across the lane. Its walls are of rounded field stones from the hillside, as the old public buildings of the Shan hill towns are." };
    const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = -Math.PI / 2; g.add(h);
    mesh(new THREE.BoxGeometry(L + .6, P, D + .6), concrete, 0, P / 2, 0, h);
    const side = stoneMat(D / 1.6, H / 1.6), face = stoneMat(L / 1.6, H / 1.6);
    clickable(picks.pagoda, mesh(new THREE.BoxGeometry(L, H, D), [side, side, face, face, face, face], 0, P + H / 2, 0, h), data);
    sRect(h, -L / 2 - .3, L / 2 + .3, -D / 2 - .3, D / 2 + .3);
    // the windows: a dark wooden frame, glass in two leaves of three panes each, a concrete sill
    const DX = -4;   // the door, toward the left of the front
    const win = (px, py, pz, ry) => {
      const w = new THREE.Group(); w.position.set(px, py, pz); w.rotation.y = ry; h.add(w);
      part(cwFrame, collegeWood, 0, 0, .04, w); part(cwGlass, townGlass, 0, 0, .12, w); part(cwMull, collegeWood, 0, 0, .14, w);
      [-.24, .24].forEach(dy => part(cwBar, collegeWood, 0, dy, .14, w)); part(cwSill, concrete, 0, -.84, .1, w);
    };
    const n = 9;
    for (let f = 0; f < 2; f++) {
      const y = P + f * FH + 1.65;
      for (let i = 0; i < n; i++) {
        const px = -L / 2 + L * (i + .5) / n;
        if (!(f === 0 && Math.abs(px - DX) < 1.8)) win(px, y, D / 2, 0);
        win(px, y, -D / 2, Math.PI);
      }
      [-1, 1].forEach(sd => [-1.8, 1.8].forEach(pz => win(sd * L / 2, y, pz, sd * Math.PI / 2)));
    }
    // the door: a pair of panelled wooden leaves in a frame, a step up from the lane
    mesh(new THREE.BoxGeometry(2, 2.6, .14), collegeWood, DX, P + 1.3, D / 2 + .04, h);
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.82, 2.35, .06), std({ color: 0x3e2614, roughness: .6 }), DX + sd * .43, P + 1.2, D / 2 + .12, h));
    mesh(new THREE.BoxGeometry(2.6, .2, 1), concrete, DX, .1, D / 2 + .8, h);
    // the roof: blue-painted eaves and soffit, the corrugated hip roof on top, and the little front gable near its left end
    mesh(new THREE.BoxGeometry(L + 1.9, .25, D + 1.9), collegeBlue, 0, top + .1, 0, h);
    const a = L / 2 + .95, b = D / 2 + .95, rh = b * .42, roofMat = ROOFS[2](1), rf = tinHipRoof(a, b, rh, roofMat);
    rf.position.y = top + .22; rf.castShadow = rf.receiveShadow = true; h.add(rf);
    const GX = -L / 2 + 4.5, GW = 2.4, gh = rh * .95, glen = b + .2, ga = Math.atan2(gh, GW), sl = Math.hypot(gh, GW) + .2;
    [-1, 1].forEach(sd => { const m = mesh(new THREE.BoxGeometry(sl, .1, glen), roofMat, GX + sd * GW / 2, top + .22 + gh / 2, glen / 2, h); m.rotation.z = -sd * ga; });
    const gs = new THREE.Shape(); gs.moveTo(-GW, 0); gs.lineTo(GW, 0); gs.lineTo(0, gh); gs.closePath();
    mesh(new THREE.ShapeGeometry(gs), std({ color: 0x2f5f9a, roughness: .7, side: THREE.DoubleSide }), GX, top + .22, glen - .25, h);
    TALL.push({ x0: x - b - .5, x1: x + b + .5, z0: z - a - .5, z1: z + a + .5, h: top + rh + 1 });
    postSign(g, "သူနာပြုသင်တန်းကျောင်း", "Nursing Training College", "#f4f2ec", "#1f4a8a", 3.6, -95, z + DX - 3.2, -Math.PI / 2, data);
  }
  // မြို့နယ်အားကစားကွင်း, the township football ground across the road from the hospital, sized for a small town: a grass pitch
  // on a laterite running track inside a painted wall, a covered stand of concrete tiers along the road side, three low open
  // terraces opposite, and the gate in the east wall off the road
  function footballGround(g) {
    const X0 = -182, X1 = -131, Z0 = 4, Z1 = 68, GZ = [54, 60];   // the wall round it, and the gate in its east wall
    const PX0 = -177, PX1 = -141, PZ0 = 8, PZ1 = 64, CX = (PX0 + PX1) / 2, CZ = (PZ0 + PZ1) / 2;   // the pitch
    const data = { tip: "The township football ground · မြို့နယ်အားကစားကွင်း", toast: "The township football ground: a grass pitch on a laterite running track inside a painted wall. The covered stand along the road fills on match afternoons, when ward and village teams play for the township cup; in the cool of the morning, runners circle the track." };
    const white = std({ color: 0xf4f4ee, roughness: .8 });
    flat(mesh(new THREE.BoxGeometry(X1 - X0, .05, Z1 - Z0), std({ color: 0xa0583a, roughness: 1 }), (X0 + X1) / 2, .03, (Z0 + Z1) / 2, g)).receiveShadow = true;   // the track
    flat(mesh(new THREE.BoxGeometry(PX1 - PX0, .06, PZ1 - PZ0), std({ color: 0x4f8a34, roughness: 1 }), CX, .05, CZ, g)).receiveShadow = true;
    // the white lines: touchlines and goal lines, halfway line, the penalty and goal areas at each end, the centre circle
    const line = (a, b, c, d) => flat(mesh(new THREE.BoxGeometry(Math.max(b - a, .12), .02, Math.max(d - c, .12)), white, (a + b) / 2, .09, (c + d) / 2, g));
    [[PX0, PX1, PZ0, PZ0], [PX0, PX1, PZ1, PZ1], [PX0, PX0, PZ0, PZ1], [PX1, PX1, PZ0, PZ1], [PX0, PX1, CZ, CZ]].forEach(l => line(...l));
    [[PZ0, 1], [PZ1, -1]].forEach(([z, s]) => [[10, 9], [5, 3]].forEach(([hw, d]) => {
      const z0 = Math.min(z, z + s * d), z1 = Math.max(z, z + s * d);
      line(CX - hw, CX + hw, z + s * d, z + s * d); line(CX - hw, CX - hw, z0, z1); line(CX + hw, CX + hw, z0, z1);
    }));
    flat(mesh(new THREE.RingGeometry(4.6, 4.72, 40), white, CX, .09, CZ, g)).rotation.x = -Math.PI / 2;
    // a goal at each end: posts and crossbar, the net sloping back to the ground behind
    const net = std({ color: 0xf8f8f8, roughness: 1, transparent: true, opacity: .3, side: THREE.DoubleSide, depthWrite: false }), slope = Math.atan2(1.5, 2.1);
    [[PZ0, -1], [PZ1, 1]].forEach(([z, s]) => {
      [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(.12, 2.1, .12), white, CX + sd * 3, 1.05, z, g); sCircle(g, CX + sd * 3, z, .12); });
      mesh(new THREE.BoxGeometry(6.1, .12, .12), white, CX, 2.1, z, g);
      flat(mesh(new THREE.PlaneGeometry(6, Math.hypot(1.5, 2.1)), net, CX, 1.05, z + s * .75, g)).rotation.x = -s * slope;
    });
    // the wall round the ground, open at the gate, with a green band along its top
    [[X0, X1, Z0, Z0], [X0, X1, Z1, Z1], [X0, X0, Z0, Z1], [X1, X1, Z0, GZ[0]], [X1, X1, GZ[1], Z1]].forEach(([a, b, c, d]) => {
      const w = Math.max(b - a, .25), dd = Math.max(d - c, .25), mx = (a + b) / 2, mz = (c + d) / 2;
      mesh(new THREE.BoxGeometry(w, 2.2, dd), civicCream, mx, 1.1, mz, g); mesh(new THREE.BoxGeometry(w + .04, .3, dd + .04), civicGreen, mx, 2.3, mz, g);
      sRect(g, mx - w / 2, mx + w / 2, mz - dd / 2, mz + dd / 2);
    });
    GZ.forEach(z => { mesh(new THREE.BoxGeometry(.6, 4.4, .6), civicGreen, X1, 2.2, z, g); sCircle(g, X1, z, .4); });
    clickable(picks.pagoda, civicSign(g, "မြို့နယ်အားကစားကွင်း", "Township Stadium", "#2f7a4a", "#ffffff", 6, X1 + .35, 3.4, (GZ[0] + GZ[1]) / 2, Math.PI / 2), data);
    flat(mesh(new THREE.BoxGeometry(5, .06, GZ[1] - GZ[0]), forecourt, X1 + .5, .035, (GZ[0] + GZ[1]) / 2, g));   // the path in from the road
    flagPole(g, X1 + 1, GZ[1] + 1.5, 8);
    // the covered stand on the road side: five tiers to sit on, walled at the ends, under a tin roof sloping down toward the pitch
    const SX = -138, SB = X1 - .125, SZ0 = 22, SZ1 = 50, TR = .4, TD = .9;
    for (let i = 0; i < 5; i++) {
      const fx = SX + i * TD, top = (i + 1) * TR;
      mesh(new THREE.BoxGeometry(SB - fx, TR, SZ1 - SZ0), concrete, (fx + SB) / 2, top - TR / 2, (SZ0 + SZ1) / 2, g);
      sRect(g, fx, i < 4 ? fx + TD : SB, SZ0, SZ1, top);
    }
    [SZ0, SZ1].forEach(z => { mesh(new THREE.BoxGeometry(SB - SX, 2.6, .25), civicCream, (SX + SB) / 2, 1.3, z, g); sRect(g, SX, SB, z - .125, z + .125); });
    for (let z = SZ0 + .2; z <= SZ1; z += (SZ1 - SZ0 - .4) / 4) [[SX + .2, 5.4], [SB - .4, 6.6]].forEach(([x, h]) => { mesh(new THREE.CylinderGeometry(.12, .12, h, 8), steel, x, h / 2, z, g); sCircle(g, x, z, .2); });
    const roof = mesh(new THREE.BoxGeometry(Math.hypot(SB - SX + .4, 1.2), .08, SZ1 - SZ0 + 1), ROOFS[3](6), (SX + SB) / 2, 6.05, (SZ0 + SZ1) / 2, g);
    roof.rotation.z = Math.atan2(1.2, SB - SX + .4); clickable(picks.pagoda, roof, data);
    mesh(new THREE.BoxGeometry(.1, .45, SZ1 - SZ0 + 1), civicGreen, SX - .45, 5.3, (SZ0 + SZ1) / 2, g);   // the fascia along its front
    TALL.push({ x0: SX - 1, x1: X1 + .5, z0: SZ0 - 1, z1: SZ1 + 1, h: 6.9 });
    // three low open terraces along the far side, against the west wall
    const TW = X0 + .125, TZ0 = 14, TZ1 = 58;
    for (let i = 0; i < 3; i++) {
      const w = (3 - i) * .8, top = (i + 1) * .35;
      mesh(new THREE.BoxGeometry(w, .35, TZ1 - TZ0), concrete, TW + w / 2, top - .175, (TZ0 + TZ1) / 2, g);
      sRect(g, TW + w - .8, TW + w, TZ0, TZ1, top);
    }
  }
  // အခြေခံပညာ အထက်တန်းကျောင်း, the basic education high school, south of the daily market at the end of the market lane: a
  // four-storey main building with open corridors facing the playing field, a two-storey E-shaped classroom block opening onto it,
  // a white wall round the grounds with the gate on the lane, and the flag in front of the main building
  function highSchool(g) {
    const X0 = 46, X1 = 98, Z0 = 111, Z1 = 152, GZ = [118, 126];
    const data = { tip: "The high school", toast: "The basic education high school: a four-storey main building and a two-storey E-shaped classroom block round the playing field. Lessons start after assembly at the flag; at the bell the pupils in white and green spill out along the corridors." };
    flat(mesh(new THREE.BoxGeometry(X1 - X0, .05, Z1 - Z0), std({ color: 0x9a8a6a, roughness: 1 }), (X0 + X1) / 2, .03, (Z0 + Z1) / 2, g)).receiveShadow = true;
    // the wall round the grounds, open at the gate on the market lane, with gate pillars and the sign over it
    [[X0, X1, Z0, Z0], [X0, X1, Z1, Z1], [X1, X1, Z0, Z1], [X0, X0, Z0, GZ[0]], [X0, X0, GZ[1], Z1]].forEach(([a, b, c, d]) => {
      const w = Math.max(b - a, .25), dd = Math.max(d - c, .25);
      mesh(new THREE.BoxGeometry(w, 1.4, dd), civicWhite, (a + b) / 2, .7, (c + d) / 2, g); sRect(g, (a + b) / 2 - w / 2, (a + b) / 2 + w / 2, (c + d) / 2 - dd / 2, (c + d) / 2 + dd / 2);
    });
    GZ.forEach(z => mesh(new THREE.BoxGeometry(.6, 4.8, .6), civicGreen, X0, 2.4, z, g));
    civicSign(g, "အခြေခံပညာ အထက်တန်းကျောင်း", "Basic Education High School", "#2f7a4a", "#ffffff", 8, X0 - .35, 3.6, (GZ[0] + GZ[1]) / 2, -Math.PI / 2);
    flat(mesh(new THREE.BoxGeometry(X0 + 8 - LANES[2].x1, .06, GZ[1] - GZ[0]), forecourt, (LANES[2].x1 + X0 + 8) / 2, .035, (GZ[0] + GZ[1]) / 2, g));   // the path in
    // the main building along the back, its corridors facing north over the field
    civic(g, 69, 146.5, Math.PI, { W: 42, D: 8, floors: 4, wall: civicCream, trim: civicGreen, roof: ROOFS[0](1), corridor: 2.4, door: true, data });
    // the E-shaped block on the east side: a spine with its corridor facing west, and three wings out toward the field
    civic(g, 94.5, 126, -Math.PI / 2, { W: 26, D: 5, floors: 2, wall: civicCream, trim: civicGreen, roof: ROOFS[0](1), corridor: 2, data });
    [115.5, 126, 136.5].forEach(z => civic(g, 85, z, 0, { W: 10, D: 6, floors: 2, wall: civicCream, trim: civicGreen, roof: ROOFS[0](1), data }));
    // the playing field: grass with white lines and a goal at each end
    const FX0 = 52, FX1 = 78, FZ0 = 114, FZ1 = 136, white = std({ color: 0xf4f4ee, roughness: .8 });
    flat(mesh(new THREE.BoxGeometry(FX1 - FX0, .06, FZ1 - FZ0), std({ color: 0x5a8a3a, roughness: 1 }), (FX0 + FX1) / 2, .05, (FZ0 + FZ1) / 2, g)).receiveShadow = true;
    [[FX0, FX1, FZ0, FZ0], [FX0, FX1, FZ1, FZ1], [FX0, FX0, FZ0, FZ1], [FX1, FX1, FZ0, FZ1], [65, 65, FZ0, FZ1]].forEach(([a, b, c, d]) => flat(mesh(new THREE.BoxGeometry(Math.max(b - a, .12), .02, Math.max(d - c, .12)), white, (a + b) / 2, .09, (c + d) / 2, g)));
    [FX0 + .3, FX1 - .3].forEach(x => {
      [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(.12, 2.1, .12), white, x, 1.05, 125 + sd * 3, g); sCircle(g, x, 125 + sd * 3, .12); });
      mesh(new THREE.BoxGeometry(.12, .12, 6.1), white, x, 2.1, 125, g);
    });
    flagPole(g, 69, 138.6, 9);
  }
