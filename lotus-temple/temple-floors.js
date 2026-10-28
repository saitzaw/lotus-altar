/* Floors 2–7 of the Lotus Altar pagoda, the Bell Tower and the temple hall (蓮華寺), and the temple seen from outside.
   Floor 1, Guanyin's main hall, lives in lotus-altar.js. Every floor shares the main hall's footprint
   (statue at z = -1.7, offering table at z = .75) so the same camera views work on each one.
   Each floor is built the first time someone visits it. */
window.TempleFloors = function TempleFloors(ctx) {
  "use strict";
  const { THREE, world, V, TAU, clamp, easeOut, mesh, lathe, std, M, glowSprite, glowTex, canvasTex, petalGeo, makeLotus, makeFlame, tone, tween, sculptFigure, floors: FLOORS, places: PLACES, reduceMotion } = ctx;
  const PLAT = 0, ALT = { y: 1.1, z: .75 };   // halls have a level floor; statues stand on their own pedestals
  const groups = {}, updaters = {}, picks = {}, actions = {};
  let pagoda = null, hovered = null;

  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const squareRing = (o, per) => {
    const pts = [];
    for (let i = 0; i < per; i++) { const t = -o + 2 * o * i / per; pts.push([t, o], [o, -t], [-t, -o], [-o, t]); }
    return pts;
  };
  const clickable = (list, m, data) => { Object.assign(m.userData, data); list.push(m); return m; };
  const flat = m => { m.castShadow = false; return m; };
  // a part repeated many times, drawn with all its copies as one InstancedMesh: part() takes a shared geometry and stands in for
  // mesh(), returning an empty placeholder to move, turn, scale or flat() like the mesh; bakeParts(root) swaps every placeholder
  // under root for one instanced mesh per geometry, material and shadow once root is built. Only for parts that never move and
  // are not clicked.
  const part = (geo, mat, x = 0, y = 0, z = 0, parent) => {
    const o = new THREE.Object3D(); o.position.set(x, y, z); o.castShadow = true; o.userData.part = { geo, mat }; parent.add(o); return o;
  };
  function bakeParts(root) {
    root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), sets = new Map(), found = [];
    root.traverse(o => { if (o.userData.part) found.push(o); });
    found.forEach(o => {
      const { geo, mat } = o.userData.part, k = geo.uuid + mat.uuid + o.castShadow;
      let s = sets.get(k); if (!s) sets.set(k, s = { geo, mat, shadow: o.castShadow, list: [] });
      s.list.push(o.matrixWorld.clone().premultiply(inv)); o.parent.remove(o);
    });
    sets.forEach(({ geo, mat, shadow, list }) => {
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach((m4, i) => im.setMatrixAt(i, m4));
      im.castShadow = shadow; im.receiveShadow = true; root.add(im);
    });
  }
  // day and night: every outdoor sky registers how it changes with daylight d (0 = night, 1 = day)
  let daylight = 0;
  const dayParts = [];
  const onDaylight = fn => { dayParts.push(fn); fn(daylight); };
  // Halloween night (set from the main script): `out` 0–1 as the houses and village huts put their lights out at 9 pm,
  // `on` while the friendly ghost walks the roads; the pole lights it passes flicker (see halloweenGhost)
  const FEST = { on: false, out: 0, eye: null };
  const poleLights = [];   // { x, z, set(lit) } in the grounds' frame
  const lerpC = (a, b, d) => new THREE.Color(a).lerp(new THREE.Color(b), d);
  // the real sun and moon, set from the main script: directions for the day view and the night view (temple frame:
  // +z south, +x east, +y up), whether each is above the horizon, and the moon's phase texture and tilt
  const celestial = { sun: V(.3, .8, .5), moonDay: null, moonNight: null, moonTex: null, fraction: .5 };
  const celestialParts = [];
  const onCelestial = fn => { celestialParts.push(fn); fn(); };
  // a day sky laid over a night sky of radius r: a blue dome that fades in, the sun, the stars fading out,
  // and the moon wherever it really is (by day too, paler, when it is above the horizon)
  // `top` is the highest altitude the camera there can see: true directions are kept, heights are scaled into the visible band
  const squash = (dir, top) => {
    const alt = Math.asin(clamp(dir.y, -1, 1)), h = Math.hypot(dir.x, dir.z) || 1, a2 = .05 + alt / (Math.PI / 2) * (top - .05);
    return V(dir.x / h * Math.cos(a2), Math.sin(a2), dir.z / h * Math.cos(a2));
  };
  function daySky(parent, r, stars, top = .5) {
    const tex = canvasTex(256, (c, sz) => {
      const l = c.createLinearGradient(0, 0, 0, sz);
      l.addColorStop(0, "#1f5fb4"); l.addColorStop(.28, "#3f86d6"); l.addColorStop(.42, "#86b8e6"); l.addColorStop(.49, "#cfe0ec"); l.addColorStop(.51, "#76776c"); l.addColorStop(1, "#4e4a40");
      c.fillStyle = l; c.fillRect(0, 0, sz, sz);
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(r * .94, 48, 24), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, transparent: true, depthWrite: false, toneMapped: false }));
    parent.add(dome);
    const sun = glowSprite(0xfff2c8, r * .16, 1); sun.material.fog = false; parent.add(sun);
    const core = glowSprite(0xffffff, r * .05, 1); core.material.fog = false; parent.add(core);
    // two moons: where it stands in the night view and where it stands in the day view; each fades with its view
    const moonSprite = () => {
      const disc = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, fog: false, toneMapped: false }));
      disc.scale.setScalar(r * .07); parent.add(disc);
      const halo = glowSprite(0xdfe6ff, r * .22, .5); halo.material.fog = false; parent.add(halo);
      return { disc, halo };
    };
    const mN = moonSprite(), mD = moonSprite();
    [dome, sun, core, mN.disc, mN.halo, mD.disc, mD.halo].forEach(o => o.userData.noCull = true);   // they show and hide themselves
    const place = (m, info, alpha) => {
      const up = info && info.up;
      m.disc.visible = m.halo.visible = !!up && alpha > .001;
      if (!up) return;
      m.disc.position.copy(squash(info.dir, top)).multiplyScalar(r * .88); m.halo.position.copy(m.disc.position);
      m.disc.material.map = celestial.moonTex; m.disc.material.rotation = info.rot; m.disc.material.needsUpdate = true;
      m.disc.material.opacity = alpha; m.halo.material.opacity = alpha * (.15 + .45 * celestial.fraction);
    };
    const update = () => {
      const d = daylight;
      dome.material.opacity = d; dome.visible = d > .001;
      sun.position.copy(squash(celestial.sun, top)).multiplyScalar(r * .88); core.position.copy(sun.position);
      sun.material.opacity = d; core.material.opacity = d; sun.visible = core.visible = d > .001;
      if (stars) stars.material.opacity = 1 - d;
      place(mN, celestial.moonNight, 1 - d);
      place(mD, celestial.moonDay, d * .7);
    };
    onDaylight(update); onCelestial(update);
  }
  // a light that changes between its night and day colour and strength
  function dayLight(light, night, day) {
    onDaylight(d => { light.color.copy(lerpC(night[0], day[0], d)); light.intensity = night[1] + (day[1] - night[1]) * d; if (light.groundColor && night[2] !== undefined) light.groundColor.copy(lerpC(night[2], day[2], d)); });
  }
  // a canvas texture for signs and boards, repainted once the Chinese font has loaded
  function writing(w, h, draw) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    const paint = () => { draw(c.getContext("2d"), w, h); t.needsUpdate = true; };
    paint();
    if (document.fonts && document.fonts.load) document.fonts.load('600 40px "Noto Serif TC"', "觀").then(paint, () => {});
    return t;
  }
  const HAN_FONT = px => `600 ${px}px "Noto Serif TC", "Songti TC", "PMingLiU", serif`;
  // a hanging scroll: brocade borders, a cream paper panel and characters written top to bottom in ink, a red seal at the foot
  function scrollTex(text) {
    return writing(128, 448, (c, w, h) => {
      c.fillStyle = "#6a2418"; c.fillRect(0, 0, w, h);
      c.fillStyle = "#c9a04a"; c.fillRect(0, 34, w, 4); c.fillRect(0, h - 38, w, 4);
      c.fillStyle = "#f2e8d0"; c.fillRect(14, 46, w - 28, h - 92);
      c.fillStyle = "#1e1813"; c.font = HAN_FONT(64); c.textAlign = "center"; c.textBaseline = "middle";
      [...text].forEach((ch, i) => c.fillText(ch, w / 2, 110 + i * 92));
      c.fillStyle = "#b8281c"; c.fillRect(w / 2 - 10, h - 84, 20, 20);
    });
  }
  const info = m => typeof m === "number" ? FLOORS[m - 1] : PLACES[m];
  const floorName = m => { const f = info(m); return typeof m === "number" ? `${m}F · ${f.name}` : f.name; };

  /* ---------- shared pieces ---------- */
  const winMat = std({ color: 0x0d1530, emissive: 0x34528f, emissiveIntensity: .55, roughness: .6 });
  const lanternGeo = new THREE.SphereGeometry(.26, 24, 16), capGeo = new THREE.CylinderGeometry(.12, .12, .06, 16);
  const ribGeo = new THREE.TorusGeometry(.262, .006, 6, 40), tasselGeo = new THREE.CylinderGeometry(.012, .03, .22, 8);
  const lanternMat = std({ color: 0xb0180c, emissive: 0xd0200a, emissiveIntensity: .55, roughness: .55 });
  const lanternOff = std({ color: 0x5a0c06, roughness: .55 });   // a street lantern blinking out as the ghost passes
  function lantern(parent, x, y, z, ceil = 6.9, scale = 1) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(scale); parent.add(g);
    flat(mesh(new THREE.CylinderGeometry(.005, .005, (ceil - y) / scale, 4), M.feature, 0, (ceil - y) / scale / 2, 0, g));
    flat(mesh(lanternGeo, lanternMat, 0, 0, 0, g)).scale.y = 1.2;
    [0, Math.PI / 3, -Math.PI / 3].forEach(r => { const rb = flat(mesh(ribGeo, M.trim, 0, 0, 0, g)); rb.rotation.y = r; rb.scale.y = 1.2; });
    flat(mesh(capGeo, M.trim, 0, .32, 0, g)); flat(mesh(capGeo, M.trim, 0, -.32, 0, g));
    flat(mesh(tasselGeo, M.stickRed, 0, -.46, 0, g));
    g.add(glowSprite(0xff7a3c, 1.4, .45));
    return g;
  }
  // strings of small red lanterns hanging in a curve between two points
  function lanternStrings(parent, segs, scale = 1) {
    const total = segs.reduce((s, x) => s + x.count, 0);
    const bodies = new THREE.InstancedMesh(lanternGeo, lanternMat, total), caps = new THREE.InstancedMesh(capGeo, M.trim, total * 2);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), body = V(scale, scale * 1.2, scale), cap = V(scale, scale, scale);
    let k = 0;
    segs.forEach(({ a, b, count, sag }) => {
      const at = t => a.clone().lerp(b, t).add(V(0, -sag * 4 * t * (1 - t), 0)), pts = [];
      for (let i = 0; i <= 24; i++) pts.push(at(i / 24));
      flat(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .012 * Math.max(1, scale), 4), M.stickRed, 0, 0, 0, parent));
      for (let i = 0; i < count; i++) {
        const p = at((i + .5) / count).add(V(0, -.36 * scale, 0));
        m4.compose(p, q, body); bodies.setMatrixAt(k, m4);
        m4.compose(p.clone().add(V(0, .32 * scale, 0)), q, cap); caps.setMatrixAt(k * 2, m4);
        m4.compose(p.clone().add(V(0, -.32 * scale, 0)), q, cap); caps.setMatrixAt(k * 2 + 1, m4);
        const gl = glowSprite(0xff6a2a, 1.1 * scale, .42); gl.position.copy(p); parent.add(gl);
        k++;
      }
    });
    parent.add(bodies, caps);
  }
  // extra lanterns for a hall: a second staggered row of large ones and low festoons along the beams
  function moreLanterns(g, n) {
    const sway = [];
    [[-1.5, [-4.6, -2.6, 2.6, 4.6]], [.7, [-4.8, -2.4, 0, 2.4, 4.8]], [2.9, [-4.8, -2.4, 0, 2.4, 4.8]]]
      .forEach(([z, xs], row) => xs.forEach((x, i) => sway.push(lantern(g, x, 4.35 + ((i + row) % 2) * .35, z, 6.9, .85))));
    lanternStrings(g, [
      { a: V(-6, 6.5, -2.6), b: V(6, 6.5, -2.6), count: 15, sag: 1.7 },
      { a: V(-6, 6.5, -.4), b: V(6, 6.5, -.4), count: 15, sag: 2.2 },
      { a: V(-6, 6.5, 1.8), b: V(6, 6.5, 1.8), count: 15, sag: 2.4 },
      { a: V(-6, 6.5, 4), b: V(6, 6.5, 4), count: 15, sag: 2.4 }
    ], .6);
    updaters[n] = updaters[n] || [];
    updaters[n].push((dt, t, motion) => sway.forEach((l, i) => l.rotation.z = Math.sin(t * .6 + i * 1.7) * .035 * motion));
  }
  // a red lacquer spiral staircase in the back-left corner, rising to the floor above
  // the spiral stairs stand in the back-left corner, off the statue platform, inside a small stair room with a door;
  // the same spiral runs through every floor: it leaves through a hole in the ceiling and arrives through a hole in the floor
  const STAIRS = { x: -6.2, z: -4.45 }, STAIR_ROOM = { x0: -7.5, x1: -3.9, z0: -5.5, z1: -2.4 };
  const inStairCorner = p => p.x < -3.6 && p.z < -2.2;
  const climbSign = (text, sub) => writing(320, 128, (c, cw, ch) => {
    c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.strokeRect(5, 5, cw - 10, ch - 10);
    c.fillStyle = "#e8c25a"; c.font = HAN_FONT(54); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, cw / 2, 50);
    c.font = '600 30px "Figtree", sans-serif'; c.fillText(sub, cw / 2, 100);
  });
  // floor n: the flight up to the next floor (not on the top floor), the last steps of the flight from the floor below (not on 1F),
  // and a sign and a tap target for each direction, live only while standing in the stair room
  function spiralStairs(g, n, list) {
    const st = new THREE.Group(); st.position.set(STAIRS.x, 0, STAIRS.z); g.add(st);
    const H = 6.9, N = 32, turns = 1.3, R = .9, rise = H / N, da = turns * TAU / N, helix = [];
    const up = n < FLOORS.length, downTo = n > 1;
    const lightWood = std({ color: 0x8a5a30, roughness: .55 });
    const step = (i, y) => {
      const a = i * da, c = Math.cos(a), s = -Math.sin(a);
      const m = mesh(new THREE.BoxGeometry(R - .06, .07, .34), lightWood, c * (R / 2 + .02), y, s * (R / 2 + .02), st); m.rotation.y = a;
      const edge = mesh(new THREE.BoxGeometry(.03, .08, .34), M.trim, c * (R - .02), y, s * (R - .02), st); edge.rotation.y = a;
      if (i % 2 === 0) mesh(new THREE.CylinderGeometry(.014, .014, .9, 6), M.lacquer, c * (R - .05), y + .45, s * (R - .05), st);
    };
    if (up) {
      mesh(new THREE.CylinderGeometry(.09, .11, H, 16), M.lacquer, 0, H / 2, 0, st);
      for (let y = .6; y < H; y += 1.2) mesh(new THREE.CylinderGeometry(.13, .13, .05, 16), M.trim, 0, y, 0, st);
      for (let i = 0; i < N; i++) step(i, (i + 1) * rise);
      for (let i = 0; i <= 80; i++) { const a = i / 80 * turns * TAU, y = rise + i / 80 * (H - rise) + .9; helix.push(V(Math.cos(a) * (R - .05), Math.min(y, H - .05), -Math.sin(a) * (R - .05))); }
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helix), 160, .025, 6), M.lacquer, 0, 0, 0, st);
    } else mesh(new THREE.CylinderGeometry(.13, .13, .08, 16), M.trim, 0, .04, 0, st);
    if (downTo) {   // the flight from below, seen through the hole: it arrives at this floor going round the other way
      const nSteps = up ? 9 : 13, depth = nSteps * rise + .6;   // the top floor shows more of the flight, since nothing rises above it
      mesh(new THREE.CylinderGeometry(1.0, 1.0, depth, 40, 1, true), std({ color: 0x2a140a, roughness: .9, side: THREE.DoubleSide }), 0, -depth / 2, 0, st);
      const lip = mesh(new THREE.TorusGeometry(1.02, .05, 8, 48), M.trim, 0, .03, 0, st); lip.rotation.x = Math.PI / 2;
      for (let i = 1; i <= nSteps; i++) step(-i, -i * rise + .02);
      mesh(new THREE.CylinderGeometry(.09, .11, depth, 16), M.lacquer, 0, -depth / 2, 0, st);
      if (!up) {
        // a handrail following the outer edge of the flight up to the floor, ending in a newel post
        const rail = [];
        for (let i = 0; i <= 60; i++) { const k = -nSteps + i / 60 * nSteps, a = k * da; rail.push(V(Math.cos(a) * (R - .05), k * rise + .92, -Math.sin(a) * (R - .05))); }
        mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rail), 120, .03, 8), M.lacquer, 0, 0, 0, st);
        mesh(new THREE.CylinderGeometry(.05, .06, 1.0, 10), M.lacquer, R - .05, .5, 0, st);
        mesh(new THREE.SphereGeometry(.07, 12, 8), M.trim, R - .05, 1.02, 0, st);
        // a guard rail round the opening, open only where the stairs arrive (around angle 0)
        const GAP = .6, RR = 1.1;
        for (let i = 0; i < 24; i++) {
          const a = GAP + i / 23 * (TAU - 2 * GAP);
          mesh(new THREE.CylinderGeometry(.025, .025, .95, 6), M.lacquer, Math.cos(a) * RR, .48, -Math.sin(a) * RR, st);
        }
        [.95, .5].forEach(y => { const r2 = mesh(new THREE.TorusGeometry(RR, y > .7 ? .04 : .025, 6, 64, TAU - 2 * GAP), y > .7 ? M.lacquer : M.trim, 0, y, 0, st); r2.rotation.x = Math.PI / 2; r2.rotation.z = GAP; });
        [GAP, -GAP].forEach(a => { mesh(new THREE.CylinderGeometry(.05, .06, 1.0, 10), M.lacquer, Math.cos(a) * RR, .5, -Math.sin(a) * RR, st); mesh(new THREE.SphereGeometry(.07, 12, 8), M.trim, Math.cos(a) * RR, 1.02, -Math.sin(a) * RR, st); });
      }
      const below = new THREE.PointLight(0xffb070, 1.0, 4, 2); below.position.set(0, -1.2, 0); st.add(below);
    } else mesh(new THREE.CylinderGeometry(.95, 1.0, .08, 32), M.stone, 0, .04, 0, st);
    // signs on the back wall of the stair room, and tap targets on the stairs themselves
    const target = (to, geo, y, signY, label, sub) => {
      const hit = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = y; st.add(hit);
      const tip = `${to > n ? "Climb up" : "Go down"} to ${floorName(to)}`;
      Object.assign(hit.userData, { climb: to, inStairs: true, tip });
      const sign = flat(mesh(new THREE.PlaneGeometry(.95, .38), new THREE.MeshStandardMaterial({ map: climbSign(label, sub), roughness: .6, emissive: 0x444444, emissiveMap: climbSign(label, sub) }), 1.4, signY, -1.0, st));
      Object.assign(sign.userData, { climb: to, inStairs: true, tip });
      if (list) list.push(hit, sign);
    };
    if (up) target(n + 1, new THREE.CylinderGeometry(R + .05, R + .05, H - 1.2, 16), (H + 1.2) / 2, 2.5, "↑ 上樓", `Up to ${n + 1}F`);
    if (downTo) target(n - 1, new THREE.CylinderGeometry(R + .05, R + .05, 1.2, 16), .3, up ? 1.55 : 2.0, "↓ 下樓", `Down to ${n - 1}F`);
  }
  // the stair room: plain walls up to the ceiling, red corner posts and a panelled wooden door that leads up
  const plaster = std({ color: 0x4a1a10, roughness: .85 }), panelWood = std({ color: 0x6a2a14, roughness: .55 });
  const doors = [], openers = {};
  function stairRoom(g, n, list) {
    const { x0, x1, z0, z1 } = STAIR_ROOM, H = 6.9, cx = (x0 + x1) / 2, w = x1 - x0, d = z1 - z0, DW = 1.05, DH = 2.35;
    mesh(new THREE.BoxGeometry(.12, H, d), plaster, x1, H / 2, (z0 + z1) / 2, g);                      // side wall
    [[x0, cx - DW / 2 - .1], [cx + DW / 2 + .1, x1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(b - a, H, .12), plaster, (a + b) / 2, H / 2, z1, g));
    mesh(new THREE.BoxGeometry(DW + .2, H - DH, .12), plaster, cx, DH + (H - DH) / 2, z1, g);           // over the door
    [[x1, z1], [x0 + .08, z1]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.2, H, .2), M.lacquer, x, H / 2, z, g));
    mesh(new THREE.BoxGeometry(w + .2, .22, .2), M.lacquer, cx, 3.2, z1 + .02, g);
    // door frame, the leaf with raised panels, a ring pull, and a small board naming the stairs
    const dz = z1 + .07;
    [-1, 1].forEach(sx => mesh(new THREE.BoxGeometry(.14, DH + .1, .18), M.lacquer, cx + sx * (DW / 2 + .07), DH / 2, dz - .03, g));
    mesh(new THREE.BoxGeometry(DW + .42, .18, .2), M.lacquer, cx, DH + .09, dz - .03, g);
    const hinge = new THREE.Group(); hinge.position.set(cx - DW / 2, 0, z1); g.add(hinge);   // the door turns on its left edge
    const leaf = mesh(new THREE.BoxGeometry(DW, DH, .07), panelWood, DW / 2, DH / 2, 0, hinge);
    [[.62, .5], [1.5, .9]].forEach(([y, h]) => mesh(new THREE.BoxGeometry(DW - .26, h, .03), M.wood, DW / 2, y + h / 2, .05, hinge));
    mesh(new THREE.TorusGeometry(.06, .012, 6, 20), M.brass, DW - .16, 1.15, .07, hinge);
    const inside = new THREE.PointLight(0xffc890, 1.8, 4.5, 2); inside.position.set(STAIRS.x + .4, 2.6, STAIRS.z + .3); g.add(inside);   // so the stairs show when it opens
    doors.push(hinge);
    const sign = writing(256, 96, (c, cw, ch) => {
      c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.strokeRect(5, 5, cw - 10, ch - 10);
      c.fillStyle = "#e8c25a"; c.font = HAN_FONT(56); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("樓梯", cw / 2, ch / 2 + 4);
    });
    flat(mesh(new THREE.PlaneGeometry(.7, .26), new THREE.MeshStandardMaterial({ map: sign, roughness: .6, emissive: 0x222222, emissiveMap: sign }), cx, DH + .45, dz, g));
    // opening swings the door out into the hall; the caller moves on to the next floor once it is open (ms)
    const open = () => { tween(reduceMotion ? .01 : .7, t => hinge.rotation.y = -1.7 * easeOut(t)); return reduceMotion ? 0 : 700; };
    Object.assign(leaf.userData, { stairDoor: true, open, tip: "Open the door to the stairs" });
    openers[n] = open;
    if (list) list.push(leaf);
    return leaf;
  }
  // the entrance wall across the front of a hall, with doors out and lattice windows either side
  // the upper floors are halls of the Buddhas: no main door, just a pair of lattice doors onto the balcony as the way out
  function frontWall(g, n, list) {
    flat(mesh(new THREE.PlaneGeometry(15, 7.2), M.wall, 0, 3.6, 7.5, g)).rotation.y = Math.PI;
    latticeWindows(g, [-4.4, 4.4].map(x => ({ p: V(x, 3.0, 7.47), ry: Math.PI, w: 1.5, h: 2.4 })));
    if (n === 1 || typeof n !== "number") {
      doorway(g, 0, 0, 7.46, Math.PI, 2.0, 2.5, null, { floor: "pagoda", tip: n === 1 ? "Go out through the main door" : "Go back outside" }, list);
      return;
    }
    const DW = .95, DH = 2.7, z = 7.47;
    latticeWindows(g, [-1, 1].map(s => ({ p: V(s * DW / 2, DH / 2 + .1, z), ry: Math.PI, w: DW - .04, h: DH })));
    mesh(new THREE.BoxGeometry(2 * DW + .4, .2, .2), M.lacquer, 0, DH + .2, z - .02, g);
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(.16, DH + .2, .2), M.lacquer, s * (DW + .08), DH / 2 + .1, z - .02, g));
    mesh(new THREE.BoxGeometry(2 * DW + .4, .1, .3), M.stone, 0, .05, z - .05, g);
    const sign = writing(256, 96, (c, cw, ch) => {
      c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.strokeRect(5, 5, cw - 10, ch - 10);
      c.fillStyle = "#e8c25a"; c.font = HAN_FONT(54); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("出口", cw / 2, ch / 2 + 4);
    });
    const board = flat(mesh(new THREE.PlaneGeometry(.75, .28), new THREE.MeshStandardMaterial({ map: sign, roughness: .6, emissive: 0x333333, emissiveMap: sign }), 0, DH + .55, z - .04, g));
    board.rotation.y = Math.PI;
    const hit = new THREE.Mesh(new THREE.BoxGeometry(2 * DW, DH, .1), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(0, DH / 2 + .1, z - .06); g.add(hit);
    Object.assign(hit.userData, { view: "corridor", tip: "Exit · step out onto the balcony corridor" });
    if (list) list.push(hit);
    corridor(g, list, DW, DH);
  }
  // the balcony corridor (迴廊) outside an upper hall: a timber walkway under the eave, red columns and balustrade,
  // and the night view over the temple grounds; the lattice doors lead back inside
  let CORRIDOR_RING = null, backdrop = 0;   // backdrop: the floor whose corridor is looking out at the real grounds
  const STOREY_Y = {};   // the walkable ring of the balcony corridor, for the walker
  const corridorDeck = std({ color: 0x5a1f14, roughness: .7 }), corridorWall = std({ color: 0xece4d4, roughness: .7 });
  const warmPane = std({ color: 0x3a1608, emissive: 0xffa040, emissiveIntensity: .75 });
  function corridor(g, list, DW, DH) {
    const Z0 = 7.5, Z1 = 10.6, W = 15, EH = 3.8, mid = (Z0 + Z1) / 2;
    // the outside of the front wall: cream plaster between red posts, with the doors and windows seen from outside
    flat(mesh(new THREE.PlaneGeometry(W, 7.2), corridorWall, 0, 3.6, Z0 + .03, g));
    [-7.4, -2.6, 2.6, 7.4].forEach(x => mesh(new THREE.BoxGeometry(.24, EH + .6, .16), M.lacquer, x, (EH + .6) / 2, Z0 + .1, g));
    latticeWindows(g, [-4.4, 4.4].map(x => ({ p: V(x, 3.0, Z0 + .06), ry: 0, w: 1.5, h: 2.4 })), warmPane);
    latticeWindows(g, [-1, 1].map(sd => ({ p: V(sd * DW / 2, DH / 2 + .1, Z0 + .06), ry: 0, w: DW - .04, h: DH })), warmPane);
    const back = new THREE.Mesh(new THREE.BoxGeometry(2 * DW, DH, .1), new THREE.MeshBasicMaterial({ visible: false }));
    back.position.set(0, DH / 2 + .1, Z0 + .12); g.add(back);
    Object.assign(back.userData, { view: "hall", tip: "Go back inside the hall" });
    if (list) list.push(back);
    // the walkway runs right round the hall, so the view can be seen on every side: the hall's outline (walls at x = ±7.5,
    // z = -5.5 and 7.5) and the outer edge of the balcony, 3.1 m further out
    const HX = 7.5, HZ0 = -5.5, HZ1 = 7.5, OUT = 3.15, OX = HX + OUT, OZ0 = HZ0 - OUT, OZ1 = HZ1 + OUT;
    CORRIDOR_RING = { HX, HZ0, HZ1, OX, OZ0, OZ1 };
    [[0, (HZ1 + OZ1) / 2, 2 * OX, OUT], [0, (HZ0 + OZ0) / 2, 2 * OX, OUT], [(HX + OX) / 2, (HZ0 + HZ1) / 2, OUT, HZ1 - HZ0], [-(HX + OX) / 2, (HZ0 + HZ1) / 2, OUT, HZ1 - HZ0]]
      .forEach(([x, z, w, d]) => mesh(new THREE.BoxGeometry(w + .02, .14, d + .02), corridorDeck, x, -.07, z, g));
    // the outside of the hall's other three walls: cream plaster with warm lattice windows
    [[HX + .03, (HZ0 + HZ1) / 2, Math.PI / 2, HZ1 - HZ0], [-HX - .03, (HZ0 + HZ1) / 2, -Math.PI / 2, HZ1 - HZ0], [0, HZ0 - .03, Math.PI, 2 * HX]].forEach(([x, z, ry, w]) => {
      const pl = flat(mesh(new THREE.PlaneGeometry(w, 7.2), corridorWall, x, 3.6, z, g)); pl.rotation.y = ry;
    });
    const sideWins = [];
    [-1, 1].forEach(sd => [-3.4, -.8, 1.8, 4.4].forEach(z => sideWins.push({ p: V(sd * (HX + .06), 3.0, z), ry: sd * Math.PI / 2, w: 1.5, h: 2.4 })));
    [-5.6, -1.9, 1.9, 5.6].forEach(x => sideWins.push({ p: V(x, 3.2, HZ0 - .06), ry: Math.PI, w: 1.3, h: 2.1 }));
    latticeWindows(g, sideWins, warmPane);
    // the balustrade, columns, painted beam and eave soffit along each of the four outer edges
    const edges = [   // [start x, start z, end x, end z, outward direction]
      [-OX, OZ1, OX, OZ1, V(0, 0, 1)], [OX, OZ1, OX, OZ0, V(1, 0, 0)], [OX, OZ0, -OX, OZ0, V(0, 0, -1)], [-OX, OZ0, -OX, OZ1, V(-1, 0, 0)]
    ];
    const rail = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), redRail, 400), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    let k = 0;
    edges.forEach(([ax, az, bx, bz, out]) => {
      const len = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az) + Math.PI / 2, mx = (ax + bx) / 2 - out.x * .05, mz = (az + bz) / 2 - out.z * .05;
      q.setFromEuler(new THREE.Euler(0, ry, 0));
      rail.setMatrixAt(k++, m4.compose(V(mx, .82, mz), q, V(len, .07, .1)));
      rail.setMatrixAt(k++, m4.compose(V(mx, .24, mz), q, V(len, .06, .08)));
      const n = Math.round(len / .34);
      for (let i = 0; i <= n; i++) { const t = i / n, big = i % 11 === 0; rail.setMatrixAt(k++, m4.compose(V(ax + (bx - ax) * t - out.x * .05, big ? .46 : .52, az + (bz - az) * t - out.z * .05), q, big ? V(.12, .92, .12) : V(.05, .56, .05))); }
      const cn = Math.max(2, Math.round(len / 4.5));
      for (let i = 0; i <= cn; i++) {
        const t = i / cn, x = ax + (bx - ax) * t - out.x * .3, z = az + (bz - az) * t - out.z * .3;
        mesh(new THREE.CylinderGeometry(.14, .16, EH, 14), M.lacquer, x, EH / 2, z, g);
        mesh(new THREE.CylinderGeometry(.24, .26, .1, 14), M.stone, x, .05, z, g);
        if (i < cn && i % 2 === 0) lantern(g, x + (bx - ax) / cn * .5 - out.x * .7, 3.0, z + (bz - az) / cn * .5 - out.z * .7, 4.15, .8);
      }
      const beam = mesh(new THREE.BoxGeometry(len, .38, .28), beamMat, (ax + bx) / 2 - out.x * .3, EH - .1, (az + bz) / 2 - out.z * .3, g); beam.rotation.y = ry;
      // the red underside of the eave, sloping up from the beam to the wall
      const rise = 4.6 - (EH + .1), run = OUT + 1.4, sl = Math.hypot(rise, run);
      const sf = flat(mesh(new THREE.PlaneGeometry(len + 1.2, sl), eaveRed, (ax + bx) / 2 - out.x * (run / 2 - 1.4), (4.6 + EH + .1) / 2, (az + bz) / 2 - out.z * (run / 2 - 1.4), g));
      sf.rotation.order = "YXZ"; sf.rotation.y = ry; sf.rotation.x = Math.PI / 2 - Math.atan2(rise, run);
    });
    rail.count = k; rail.castShadow = false; g.add(rail);
    [[0, OZ1 - .8], [0, OZ0 + .8], [OX - .8, 1], [-OX + .8, 1]].forEach(([x, z]) => { const l = new THREE.PointLight(0xffa860, .8, 7, 2); l.position.set(x, 2.8, z); g.add(l); });
    // the view: night sky with stars and moon, a ring of dark hills, and the lights of the temple far below
    const sky = canvasTex(256, (c, sz) => {
      const l = c.createLinearGradient(0, 0, 0, sz);
      l.addColorStop(0, "#0b0a1f"); l.addColorStop(.36, "#2a1f48"); l.addColorStop(.49, "#7a4250"); l.addColorStop(.52, "#1a1210"); l.addColorStop(1, "#0d0806");
      c.fillStyle = l; c.fillRect(0, 0, sz, sz);
    });
    const vw = new THREE.Group(); vw.position.set(0, 0, Z0); g.add(vw); g.userData.vista = vw;   // replaced by the real grounds when they are built
    vw.add(new THREE.Mesh(new THREE.SphereGeometry(70, 32, 16), new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide, fog: false })));
    const starPos = [], rs = rng(23);
    for (let i = 0; i < 400; i++) { const a = rs() * TAU, e = .12 + rs() * 1.3; starPos.push(Math.cos(a) * Math.cos(e) * 66, Math.sin(e) * 66, Math.sin(a) * Math.cos(e) * 66); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: .5, color: 0xfff4e0, map: glowTex, transparent: true, depthWrite: false, fog: false })); vw.add(stars);
    daySky(vw, 70, stars);
    const sunC = new THREE.DirectionalLight(0xfff0d8, 0); sunC.position.set(6, 12, 20); g.add(sunC); dayLight(sunC, [0xfff0d8, 0], [0xfff0d8, 1.2]);
    const hillTex = canvasTex(512, (c, sz) => {
      c.clearRect(0, 0, sz, sz);
      [["#6f8274", .45, 7], ["#56685a", .62, 11]].forEach(([col, base, n]) => {   // tinted dark at night, see below
        c.fillStyle = col; c.beginPath(); c.moveTo(0, sz);
        for (let i = 0; i <= 64; i++) { const x = i / 64 * sz; c.lineTo(x, sz * (base - .12 * Math.abs(Math.sin(i / 64 * Math.PI * n)) - .05 * Math.sin(i * 1.7))); }
        c.lineTo(sz, sz); c.closePath(); c.fill();
      });
    });
    hillTex.wrapS = THREE.RepeatWrapping; hillTex.repeat.x = 3;
    const hills = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 30, 64, 1, true), new THREE.MeshBasicMaterial({ map: hillTex, transparent: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    hills.position.y = -12; vw.add(hills);
    const ground = flat(mesh(new THREE.CircleGeometry(62, 48), new THREE.MeshBasicMaterial({ color: 0x0d0907, fog: false }), 0, -24, 0, vw)); ground.rotation.x = -Math.PI / 2;
    onDaylight(d => { hills.material.color.copy(lerpC(0x2a2638, 0xffffff, d)); ground.material.color.copy(lerpC(0x0d0907, 0x5e5a48, d)); });
    const rg = rng(31);
    for (let i = 0; i < 70; i++) {   // lanterns and windows of the temple far below
      const a = (rg() - .5) * 2.4, r = 14 + rg() * 40;
      const sp = glowSprite(rg() < .7 ? 0xff7a3a : 0xffc070, 1.2 + rg() * 1.4, .8); sp.material.fog = false;
      sp.position.set(Math.sin(a) * r, -23.5 + rg() * .6, Math.cos(a) * r); vw.add(sp);
    }
  }
  // flat shapes with a round hole where the stairs pass: `y` is shape-y (floor: -z, ceiling: +z)
  function holed(outer, hx, hy, r) {
    const shape = new THREE.Shape(); outer(shape);
    const hole = new THREE.Path(); hole.absarc(hx, hy, r, 0, TAU, true); shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape, 48);
  }
  // lattice bars over a set of window rectangles {p, ry, w, h, cols, rows}, all in one instanced mesh
  function latticeBars(parent, list, mat = M.lacquer) {
    let n = 0; list.forEach(w => n += (w.cols || 4) - 1 + (w.rows || 4) - 1 + 4);
    const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, n);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = V(1, 1, 1);
    let k = 0;
    list.forEach(w => {
      q.setFromEuler(e.set(0, w.ry, 0));
      const fwd = V(Math.sin(w.ry), 0, Math.cos(w.ry)), right = V(Math.cos(w.ry), 0, -Math.sin(w.ry)), cols = w.cols || 4, rows = w.rows || 4;
      const at = (dx, dy, sx, sy) => { m4.compose(w.p.clone().addScaledVector(right, dx).add(V(0, dy, 0)).addScaledVector(fwd, .03), q, s.set(sx, sy, .045)); bars.setMatrixAt(k++, m4); };
      for (let c = 1; c < cols; c++) at(-w.w / 2 + c * w.w / cols, 0, .035, w.h);
      for (let r = 1; r < rows; r++) at(0, -w.h / 2 + r * w.h / rows, w.w, .035);
      at(-w.w / 2, 0, .1, w.h + .1); at(w.w / 2, 0, .1, w.h + .1); at(0, w.h / 2, w.w + .1, .1); at(0, -w.h / 2, w.w + .1, .1);
    });
    bars.castShadow = false; parent.add(bars);
  }
  // glowing panes behind the lattice
  // carved window screens in the style of a 槅扇 lattice door: a fretwork head panel, fine vertical slats tied by two rails,
  // and a solid skirt panel; red wood with see-through gaps, drawn once and laid over a glowing pane
  const screenTex = (() => {
    const W = 256, H = 448, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"), wood = "#8a2416";
    const bar = (x, y, w, h) => { g.fillStyle = wood; g.fillRect(x, y, w, h); };
    const F = 16, B = 6, X0 = F, X1 = W - F, headB = 120, skirtT = H - 92;
    bar(0, 0, W, F); bar(0, H - F, W, F); bar(0, 0, F, H); bar(W - F, 0, F, H);      // outer frame
    bar(0, headB - F / 2, W, F); bar(0, skirtT - F / 2, W, F);                          // rails between the panels
    // head panel: two nested rectangles linked by short bars (回 fretwork)
    const hx = X0 + 16, hy = F + 14, hw = X1 - X0 - 32, hh = headB - F / 2 - F - 28;
    [[0, 0], [22, 18]].forEach(([dx, dy]) => { bar(hx + dx, hy + dy, hw - 2 * dx, B); bar(hx + dx, hy + hh - dy - B, hw - 2 * dx, B); bar(hx + dx, hy + dy, B, hh - 2 * dy); bar(hx + hw - dx - B, hy + dy, B, hh - 2 * dy); });
    [[hx + hw / 2 - B / 2, F, B, 14], [hx + hw / 2 - B / 2, hy + hh, B, 14], [X0, hy + hh / 2 - B / 2, 16, B], [hx + hw, hy + hh / 2 - B / 2, 16, B]].forEach(r => bar(...r));
    // main panel: vertical slats with two tie rails
    const my0 = headB + F / 2, my1 = skirtT - F / 2;
    for (let x = X0 + 14; x < X1 - 6; x += 18) bar(x, my0, B, my1 - my0);
    [.33, .67].forEach(f => bar(X0, my0 + (my1 - my0) * f - B / 2, X1 - X0, B + 2));
    // skirt panel: solid wood with a gilt inset
    bar(X0, skirtT + F / 2, X1 - X0, H - F - skirtT - F / 2);
    g.strokeStyle = "#d6a94a"; g.lineWidth = 4; g.strokeRect(X0 + 18, skirtT + F / 2 + 16, X1 - X0 - 36, H - F - skirtT - F / 2 - 32);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
  })();
  const screenMat = std({ map: screenTex, alphaTest: .5, roughness: .5, side: THREE.DoubleSide });
  function latticeScreens(parent, list) {
    const screens = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), screenMat, list.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    list.forEach((w, i) => { q.setFromEuler(e.set(0, w.ry, 0)); m4.compose(w.p.clone().add(V(Math.sin(w.ry) * .03, 0, Math.cos(w.ry) * .03)), q, V(w.w, w.h, 1)); screens.setMatrixAt(i, m4); });
    screens.castShadow = false; parent.add(screens);
    latticeBars(parent, list.map(w => ({ ...w, cols: 1, rows: 1 })));   // just the outer frame
  }
  function latticeWindows(parent, list, pane = winMat) {
    const panes = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), pane, list.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    list.forEach((w, i) => { q.setFromEuler(e.set(0, w.ry, 0)); m4.compose(w.p, q, V(w.w, w.h, 1)); panes.setMatrixAt(i, m4); });
    panes.castShadow = false; parent.add(panes);
    latticeScreens(parent, list);
  }
  // side walls (and optionally the back wall) of a hall, each with moonlit lattice windows
  function hallWalls(g, wallMat, back = true) {
    const wins = [];
    if (back) flat(mesh(new THREE.PlaneGeometry(16, 7.2), wallMat, 0, 3.6, -5.5, g));
    [-1, 1].forEach(s => {
      const w = flat(mesh(new THREE.PlaneGeometry(14, 7.2), wallMat, s * 7.5, 3.6, .5, g)); w.rotation.y = -s * Math.PI / 2;
      [-3.4, -.8, 1.8, 4.4].forEach(z => wins.push({ p: V(s * 7.47, 3.0, z), ry: -s * Math.PI / 2, w: 1.5, h: 2.4, cols: 4, rows: 5 }));
    });
    [-5.6, 5.6].forEach(x => wins.push({ p: V(x, 3.4, -5.47), ry: 0, w: 1.3, h: 2.1 }));
    latticeWindows(g, wins.filter(w => !inStairCorner(w.p)));
  }
  // a pair of red doors with gold studs, rings, a framed name board above and lanterns either side
  const doorMat = std({ color: 0x9c1c12, roughness: .45 });
  function doorway(parent, x, y, z, ry, w, h, text, data, list) {
    const d = new THREE.Group(); d.position.set(x, y, z); d.rotation.y = ry; parent.add(d);
    mesh(new THREE.BoxGeometry(w + .6, .32, .24), M.lacquer, 0, h + .16, 0, d);
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(.24, h, .24), M.lacquer, s * (w / 2 + .12), h / 2, 0, d));
    mesh(new THREE.BoxGeometry(w + .6, .14, .4), M.stone, 0, .07, .05, d);
    const studs = new THREE.InstancedMesh(new THREE.SphereGeometry(.034, 8, 6), M.trim, 2 * 4 * 7), m4 = new THREE.Matrix4();
    let k = 0;
    [-1, 1].forEach(s => {
      const leaf = mesh(new THREE.BoxGeometry(w / 2 - .03, h - .06, .09), doorMat, s * w / 4, h / 2, .02, d);
      if (list) clickable(list, leaf, data);
      for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) { m4.makeTranslation(s * w / 4 + (c - 1.5) * (w / 2 - .2) / 4, .35 + r * (h - .7) / 6, .075); studs.setMatrixAt(k++, m4); }
      const ring = mesh(new THREE.TorusGeometry(.07, .014, 6, 20), M.brass, s * .1, h * .48, .09, d);
      mesh(new THREE.CylinderGeometry(.05, .05, .03, 12), M.brass, s * .1, h * .48 + .07, .08, d).rotation.x = Math.PI / 2;
    });
    d.add(studs);
    if (text) {
      const tex = writing(512, 160, (c, cw, ch) => {
        c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch);
        c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(96); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, cw / 2, ch / 2 + 6);
      });
      mesh(new THREE.BoxGeometry(w * .95 + .1, .5, .06), M.trim, 0, h + .62, .04, d);
      flat(mesh(new THREE.PlaneGeometry(w * .95, .42), new THREE.MeshStandardMaterial({ map: tex, roughness: .6, emissive: 0x222222, emissiveMap: tex }), 0, h + .62, .08, d));
    }
    [-1, 1].forEach(s => lantern(d, s * (w / 2 + .55), h - .1, .35, h + .45, .75));
    return d;
  }
  /* ---------- roofs: curved octagonal eaves of dark slate barrel tiles over a red eave board, the corners swept up to sharp tips ---------- */
  const R8 = Math.PI / 8, oct = m => { m.rotation.y = R8; return m; };
  const tileTexture = (dark, stops, line, glint) => {
    const t = canvasTex(256, (c, s) => {
      const n = 4, w = s / n;
      c.fillStyle = dark; c.fillRect(0, 0, s, s);
      for (let i = 0; i < n; i++) {   // round tiles: lit along the crown, dark in the channels between them
        const gr = c.createLinearGradient(i * w, 0, (i + 1) * w, 0);
        [0, .22, .46, .76, 1].forEach((o, j) => gr.addColorStop(o, stops[j]));
        c.fillStyle = gr; c.fillRect(i * w + 3, 0, w - 6, s);
      }
      for (let y = 0; y < s; y += s / 4) { c.fillStyle = line; c.fillRect(0, y, s, 6); c.fillStyle = glint; c.fillRect(0, y + 6, s, 4); }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
  };
  const tileTex = tileTexture("#161b20", ["#1c2228", "#3a4550", "#66727f", "#36404a", "#161b20"], "rgba(6,9,12,.6)", "rgba(200,220,240,.12)");
  const roofMat = std({ map: tileTex, roughness: .5, metalness: .1, side: THREE.DoubleSide });
  const ridgeMat = std({ color: 0x2a3038, roughness: .45, metalness: .1 }), eaveRed = std({ color: 0xa42418, roughness: .5, side: THREE.DoubleSide });
  const EAVE_T = [0, .1, .2, .3, .4, .5, .6, .7, .8, .88, .93], RIM_T = [.93, .965, 1];
  const eaveY = (h, lift, t, d = R8) => h * Math.pow(1 - t, 1.6) + lift * Math.pow(d / R8, 5) * t * t;
  // geometry from y = 0 (the foot) to h over the slice `ts` of the slope; corners sweep up by `lift`; rIn near 0 makes a pointed roof
  function curvedEave(rIn, rOut, h, lift, ts = EAVE_T) {
    const geo = new THREE.LatheGeometry(ts.map(t => new THREE.Vector2(rIn + (rOut - rIn) * t, h * Math.pow(1 - t, 1.6))), 64, R8);
    const pos = geo.attributes.position, uv = geo.attributes.uv, rep = Math.max(2, Math.round(rOut * 7.5));
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), rho = Math.hypot(x, z), phi = Math.atan2(x, z);
      const u = ((phi % (2 * R8)) + 2 * R8) % (2 * R8), d = Math.min(u, 2 * R8 - u);   // angle from the nearest face centre
      const t = clamp((rho - rIn) / (rOut - rIn), 0, 1), r2 = rho * Math.cos(R8) / Math.cos(d);   // clamp: rounding can nudge t past 1          // straighten the round lathe into an octagon
      pos.setXYZ(i, Math.sin(phi) * r2, eaveY(h, lift, t, d), Math.cos(phi) * r2);
      uv.setXY(i, uv.getX(i) * rep, t * 2);
    }
    geo.computeVertexNormals();
    return geo;
  }
  const windBellGeo = new THREE.LatheGeometry([[0, .14], [.06, .12], [.08, .03], [.1, -.08], [.08, -.08], [0, -.05]].map(([x, z]) => new THREE.Vector2(x, z)), 16);
  const tipGeo = new THREE.ConeGeometry(.06, .5, 8);
  // an eave on `parent` with its foot at height y: tiles, the red eave board and underside, a ridge down each corner
  // ending in an upturned tip, and a wind bell under each corner
  function tiledEave(parent, y, rIn, rOut, h, lift, data, list, bells = true) {
    const e = mesh(curvedEave(rIn, rOut, h, lift), roofMat, 0, y, 0, parent);
    mesh(curvedEave(rIn, rOut, h, lift, RIM_T), eaveRed, 0, y, 0, parent);
    flat(mesh(curvedEave(rIn, rOut, h, lift, [...EAVE_T, ...RIM_T.slice(1)]), eaveRed, 0, y - .05, 0, parent));   // red underside
    if (list) clickable(list, e, data);
    if (rIn > .2) oct(mesh(new THREE.CylinderGeometry(rIn + .04, rIn + .1, .16, 8, 1, true), ridgeMat, 0, y + h - .04, 0, parent));
    for (let k = 0; k < 8; k++) {
      const c = k / 8 * TAU + R8, at = t => { const r = rIn + (rOut - rIn) * t; return V(Math.sin(c) * r, y + eaveY(h, lift, t) + .05, Math.cos(c) * r); };
      const pts = []; for (let i = 0; i <= 12; i++) pts.push(at(i / 12));
      flat(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .07, 6), ridgeMat, 0, 0, 0, parent));
      const tip = flat(mesh(tipGeo, ridgeMat, pts[12].x, pts[12].y + .22, pts[12].z, parent));
      tip.rotation.set(Math.cos(c) * .75, 0, -Math.sin(c) * .75); tip.scale.setScalar(clamp(rOut / 4.5, .55, 1.2));
      if (!bells) continue;
      const wb = at(.9).add(V(0, -.12, 0));
      flat(mesh(new THREE.CylinderGeometry(.006, .006, .3, 4), M.feature, wb.x, wb.y - .15, wb.z, parent));
      flat(mesh(windBellGeo, M.trim, wb.x, wb.y - .42, wb.z, parent));
    }
    return e;
  }
  // a stone or timber balustrade round an octagon of corner radius rb; `open` lists faces left open (0 faces +z),
  // and `gap` (a width) leaves an opening in the middle of each open face instead of the whole face
  const railMat = std({ color: 0xf3eee4, roughness: .6, emissive: 0x2a2620 }), redRail = std({ color: 0xa42418, roughness: .5 });
  function balustrade(parent, rb, open = [], mat = railMat, gap = Infinity) {
    const L = 2 * rb * Math.sin(R8), ap = rb * Math.cos(R8), per = 7;
    const parts = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, 8 * (per + 3) + 8);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    let k = 0;
    for (let f = 0; f < 8; f++) {
      const a = f / 8 * TAU, right = V(Math.cos(a), 0, -Math.sin(a)), mid = V(Math.sin(a), 0, Math.cos(a)).multiplyScalar(ap);
      q.setFromEuler(e.set(0, a, 0));
      if (open.includes(f)) {   // still close the corner post on the far side of an opening
        parts.setMatrixAt(k++, m4.compose(mid.clone().addScaledVector(right, L / 2).setY(.45), q, V(.14, .9, .14)));
        if (gap < L) [-1, 1].forEach(sd => {   // rail stubs either side of the gap
          const len = (L - gap) / 2, c = mid.clone().addScaledVector(right, sd * (gap / 2 + len / 2));
          parts.setMatrixAt(k++, m4.compose(c.clone().setY(.78), q, V(len, .07, .1)));
          parts.setMatrixAt(k++, m4.compose(c.clone().setY(.22), q, V(len, .06, .08)));
          parts.setMatrixAt(k++, m4.compose(mid.clone().addScaledVector(right, sd * gap / 2).setY(.45), q, V(.14, .9, .14)));
          parts.setMatrixAt(k++, m4.compose(mid.clone().addScaledVector(right, sd * (L / 2 - len / 2)).setY(.5), q, V(.06, .56, .06)));
        });
        continue;
      }
      parts.setMatrixAt(k++, m4.compose(mid.clone().setY(.78), q, V(L, .07, .1)));                 // hand rail
      parts.setMatrixAt(k++, m4.compose(mid.clone().setY(.22), q, V(L, .06, .08)));                // bottom rail
      for (let j = 0; j < per; j++) {
        const big = j === 0, p = mid.clone().addScaledVector(right, -L / 2 + j * L / per);
        parts.setMatrixAt(k++, m4.compose(p.setY(big ? .45 : .5), q, big ? V(.14, .9, .14) : V(.06, .56, .06)));
      }
    }
    parts.count = k; parts.castShadow = false; parent.add(parts);
  }
  // painted beams (blue and green bands, a gold-framed cartouche on each face) and two rows of brackets (dougong) under an eave
  const paintGreen = std({ color: 0x2f7a55, roughness: .55 }), paintBlue = std({ color: 0x2a4f94, roughness: .55 }), pillarRed = std({ color: 0xa42418, roughness: .5 });
  const beamTex = writing(512, 128, (c, w, h) => {
    c.fillStyle = "#1f4f8a"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#2f7a5a"; c.fillRect(0, 0, w, 22); c.fillRect(0, h - 22, w, 22);
    c.fillStyle = "#d6a94a"; c.fillRect(0, 22, w, 5); c.fillRect(0, h - 27, w, 5);
    c.fillStyle = "#2c6e4f"; c.fillRect(150, 38, 212, 52); c.strokeStyle = "#e8c25a"; c.lineWidth = 6; c.strokeRect(150, 38, 212, 52);
    c.fillStyle = "#e8c25a"; [60, 100, 412, 452].forEach(x => { c.beginPath(); c.arc(x, h / 2, 12, 0, TAU); c.fill(); });
  });
  beamTex.wrapS = THREE.RepeatWrapping; beamTex.repeat.x = 8;
  const beamMat = std({ map: beamTex, roughness: .6 });
  function paintedBeam(parent, y, r, h = .5) { return oct(mesh(new THREE.CylinderGeometry(r, r, h, 8, 1, true), beamMat, 0, y, 0, parent)); }
  function brackets(parent, y, r, perFace, mats = [paintGreen, paintBlue, M.trim]) {
    const geo = new THREE.BoxGeometry(1, 1, 1), n = 8 * perFace;
    const lo = new THREE.InstancedMesh(geo, mats[0], n), hi = new THREE.InstancedMesh(geo, mats[1], n), tips = new THREE.InstancedMesh(geo, mats[2], n);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), ap = r * Math.cos(R8), hw = r * Math.sin(R8);
    let i = 0;
    for (let k = 0; k < 8; k++) for (let j = 0; j < perFace; j++) {
      const a = k / 8 * TAU, t = -hw + (j + .5) * 2 * hw / perFace;
      const p = V(Math.sin(a) * ap + Math.cos(a) * t, y, Math.cos(a) * ap - Math.sin(a) * t), out = V(Math.sin(a), 0, Math.cos(a));
      q.setFromEuler(e.set(0, a, 0));
      lo.setMatrixAt(i, m4.compose(p, q, V(.16, .14, .3)));
      hi.setMatrixAt(i, m4.compose(p.clone().add(V(0, .14, 0)).addScaledVector(out, .1), q, V(.34, .12, .46)));
      tips.setMatrixAt(i, m4.compose(p.clone().add(V(0, .14, 0)).addScaledVector(out, .35), q, V(.36, .05, .04)));
      i++;
    }
    [lo, hi, tips].forEach(m => { m.castShadow = false; parent.add(m); });
  }
  const BELL_PROFILE = [[0, -.02], [.3, -.05], [.46, -.2], [.52, -.6], [.56, -1.2], [.66, -1.62], [.7, -1.7], [.62, -1.7], [.5, -1.3], [.46, -.6], [.4, -.22], [0, -.1]];

  // eight columns in the traditional plan: four inner columns (金柱) framing the shrine and joined by beams,
  // and four corner columns (角柱) set into the corners of the hall, where they hardly show
  const INNER_COLUMNS = [[-2.8, -2.6], [2.8, -2.6], [-2.8, 2.4], [2.8, 2.4]], CORNER_COLUMNS = [[-7.25, -5.25], [7.25, -5.25], [-7.25, 7.25], [7.25, 7.25]];
  function hallColumns(g) {
    // the back-left corner column would stand inside the stair room, behind the stairs, so it is left out
    [...INNER_COLUMNS, ...CORNER_COLUMNS.filter(([x, z]) => !inStairCorner({ x, z }))].forEach(([x, z]) => {
      mesh(new THREE.CylinderGeometry(.42, .46, .3, 24), M.stone, x, .15, z, g);
      mesh(new THREE.CylinderGeometry(.26, .3, 6.0, 24), M.lacquer, x, 3.3, z, g);
      mesh(new THREE.BoxGeometry(.8, .3, .8), M.trim, x, 6.3, z, g);
    });
    const [[x0, z0], , , [x1, z1]] = INNER_COLUMNS;
    [z0, z1].forEach(z => { mesh(new THREE.BoxGeometry(x1 - x0 + .8, .4, .5), M.lacquer, 0, 6.6, z, g); mesh(new THREE.BoxGeometry(x1 - x0 + .82, .08, .52), M.trim, 0, 6.38, z, g); });
    [x0, x1].forEach(x => { mesh(new THREE.BoxGeometry(.5, .4, z1 - z0 + .8), M.lacquer, x, 6.6, (z0 + z1) / 2, g); mesh(new THREE.BoxGeometry(.52, .08, z1 - z0 + .82), M.trim, x, 6.38, (z0 + z1) / 2, g); });
  }
  // 須彌座, the Sumeru pedestal a statue's lotus throne sits on: plinth, mouldings, a red waist with gilt panels, top slab
  function sumeru(parent, x, z) {
    const p = new THREE.Group(); p.position.set(x, 0, z); parent.add(p);
    oct(mesh(new THREE.CylinderGeometry(1.62, 1.68, .08, 8), M.stone, 0, .04, 0, p));
    oct(mesh(new THREE.CylinderGeometry(1.5, 1.6, .06, 8), M.trim, 0, .11, 0, p));
    const waist = oct(mesh(new THREE.CylinderGeometry(1.3, 1.3, .14, 8), M.lacquer, 0, .21, 0, p));
    for (let k = 0; k < 8; k++) {   // a gilt panel on each face of the waist
      const a = k / 8 * TAU, ap = 1.3 * Math.cos(R8) + .006;
      const pn = mesh(new THREE.BoxGeometry(.7, .08, .01), M.trim, Math.sin(a) * ap, .21, Math.cos(a) * ap, p); pn.rotation.y = a;
    }
    oct(mesh(new THREE.CylinderGeometry(1.6, 1.5, .06, 8), M.trim, 0, .31, 0, p));
    oct(mesh(new THREE.CylinderGeometry(1.64, 1.64, .06, 8), M.lacquer, 0, .37, 0, p));
    return waist;
  }
  function shell(g, n, o = {}) {
    const sway = [];
    const top = typeof n === "number" && n === FLOORS.length, holeBelow = typeof n === "number" && n > 1;
    // the floor covers just the hall (so it does not show past the balcony), with a hole for the stairs on the top floor
    const floorShape = sh => { sh.moveTo(-7.6, -7.6); sh.lineTo(7.6, -7.6); sh.lineTo(7.6, 5.6); sh.lineTo(-7.6, 5.6); sh.closePath(); };
    const fg = holeBelow ? holed(floorShape, STAIRS.x, -STAIRS.z, 1.0) : new THREE.ShapeGeometry((() => { const sh = new THREE.Shape(); floorShape(sh); return sh; })());
    const fp = fg.attributes.position, fuv = fg.attributes.uv;
    for (let i = 0; i < fp.count; i++) fuv.setXY(i, fp.getX(i) / 32 + .5, fp.getY(i) / 32 + .5);   // same tile size as the old 32-wide floor
    const f = flat(mesh(fg, M.floor, 0, 0, 0, g)); f.rotation.x = -Math.PI / 2;
    hallWalls(g, o.wall || M.wall);
    hallColumns(g);
    const ceil = flat(mesh(top ? new THREE.ShapeGeometry((() => { const sh = new THREE.Shape(); sh.moveTo(-8, -7.7); sh.lineTo(8, -7.7); sh.lineTo(8, 7.7); sh.lineTo(-8, 7.7); sh.closePath(); return sh; })()) : holed(sh => { sh.moveTo(-8, -7.7); sh.lineTo(8, -7.7); sh.lineTo(8, 7.7); sh.lineTo(-8, 7.7); sh.closePath(); }, STAIRS.x, STAIRS.z, 1.0), M.wall, 0, 6.9, 0, g));
    ceil.rotation.x = Math.PI / 2;
    [-2.6, -.4, 1.8, 4].forEach(z => flat(mesh(new THREE.BoxGeometry(12, .22, .26), M.lacquer, 0, 6.75, z, g)));
    if (o.lanterns !== false) [[-2.6, [-3.4, 3.4]], [-.4, [-3.6, -1.8, 1.8, 3.6]], [1.8, [-3.6, -1.2, 1.2, 3.6]], [4, [-3.6, -1.2, 1.2, 3.6]]]
      .forEach(([z, xs], row) => xs.forEach((x, i) => sway.push(lantern(g, x, 4.4 + ((i + row) % 2) * .3, z))));
    g.add(new THREE.HemisphereLight(o.sky || 0xffd9a8, 0x2a1208, o.hemi ?? .32));
    const key = new THREE.SpotLight(0xffd6a0, o.key ?? 1.4, 24, .62, .6, 1);
    key.position.set(2.8, 6.4, 6.5); key.target.position.set(0, 1.6, -1.4); g.add(key, key.target);
    if (o.shadow) { key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.normalBias = .02; }
    const back = new THREE.PointLight(o.glow || 0xffa850, 1, 7, 2); back.position.set(0, 2.6, -3); g.add(back);
    const side = new THREE.DirectionalLight(0x6f86d8, .35); side.position.set(-6, 4, -1); g.add(side);
    moreLanterns(g, n);
    picks[n] = picks[n] || [];
    // the stairs climb through the pagoda's floors and end at the top floor, where only the stairwell shows
    if (typeof n === "number") { spiralStairs(g, n, picks[n]); stairRoom(g, n, picks[n]); }
    frontWall(g, n, picks[n]);
    updaters[n] = updaters[n] || [];
    updaters[n].push((dt, t, motion) => sway.forEach((l, i) => l.rotation.z = Math.sin(t * .7 + i * 2) * .03 * motion));
    return { key, back };
  }
  function auraTexture(inner, mid, ray) {
    return canvasTex(512, (c, s) => {
      const h = s / 2;
      c.save(); c.translate(h, h);
      for (let i = 0; i < 48; i++) {
        c.rotate(TAU / 48);
        const gr = c.createLinearGradient(0, 0, 0, -h);
        gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(.35, ray); gr.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = gr; c.beginPath(); c.moveTo(-3, 0); c.lineTo(-(i % 2 ? 7 : 14), -h); c.lineTo(i % 2 ? 7 : 14, -h); c.lineTo(3, 0); c.fill();
      }
      c.restore();
      const r = c.createRadialGradient(h, h, 0, h, h, h);
      r.addColorStop(0, inner); r.addColorStop(.4, mid); r.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = r; c.fillRect(0, 0, s, s);
    });
  }
  function throne(parent, petalMat) {
    mesh(new THREE.CylinderGeometry(1.05, 1.25, .3, 48), M.gold, 0, .15, 0, parent);
    mesh(new THREE.TorusGeometry(1.15, .04, 8, 64), M.trim, 0, .3, 0, parent).rotation.x = Math.PI / 2;
    [[18, 1.08, .42, .55, 0], [18, .9, .5, .25, TAU / 36]].forEach(([n, r, y, tilt, off]) => {
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU + off;
        const p = mesh(petalGeo, petalMat, Math.sin(a) * r, y, Math.cos(a) * r, parent);
        p.scale.set(.2, .2, .07); p.rotation.order = "YXZ"; p.rotation.y = a; p.rotation.x = -tilt;
      }
    });
  }
  function offeringTable(g, n) {
    mesh(new THREE.BoxGeometry(3.1, ALT.y - .04, .95), M.lacquer, 0, (ALT.y - .04) / 2, ALT.z, g);
    mesh(new THREE.BoxGeometry(3.2, .04, 1.05), M.cloth, 0, ALT.y - .02, ALT.z, g);
    mesh(new THREE.BoxGeometry(1.6, .5, .02), M.cloth, 0, .82, ALT.z + .53, g);
    mesh(new THREE.BoxGeometry(1.6, .04, .025), M.trim, 0, .58, ALT.z + .54, g);
    [-1.45, 1.45].forEach(x => {
      const z = ALT.z - .34;
      mesh(new THREE.CylinderGeometry(.07, .09, .03, 20), M.brass, x, ALT.y + .015, z, g);
      mesh(new THREE.CylinderGeometry(.045, .045, .3, 20), M.waxRed, x, ALT.y + .19, z, g);
      const light = new THREE.PointLight(0xff9a3c, 1, 6, 2); light.position.set(x, ALT.y + .42, z); g.add(light);
      makeFlame(V(x, ALT.y + .37, z), 1.4, light, g);
    });
  }
  function vaseOfLotus(g, x, z) {
    const vase = lathe([[0, 0], [.1, 0], [.11, .04], [.15, .14], [.13, .24], [.06, .3], [.07, .36], [0, .36]], M.brass);
    vase.position.set(x, ALT.y, z); vase.castShadow = true; g.add(vase);
    [-.5, 0, .5].forEach((a, i) => {
      const head = makeLotus(); head.userData.bloom(1);
      const tip = V(x + Math.sin(a) * .2, ALT.y + .6 + (i === 1 ? .08 : 0), z);
      const from = V(x, ALT.y + .35, z), d = tip.clone().sub(from);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(.006, .008, 1, 6), M.stem);
      stem.geometry.translate(0, .5, 0); stem.position.copy(from); stem.scale.y = d.length();
      stem.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
      head.position.copy(tip); head.quaternion.copy(stem.quaternion); g.add(stem, head);
    });
  }
  function fruitPlate(g, x, z, mats, shape) {
    mesh(new THREE.CylinderGeometry(.06, .09, .1, 24), M.brass, x, ALT.y + .05, z, g);
    const plate = lathe([[0, 0], [.26, 0], [.32, .03], [.31, .035], [.25, .012], [0, .012]], M.brass, 40);
    plate.position.set(x, ALT.y + .1, z); g.add(plate);
    const pts = [[0, 0, 0]];
    for (let i = 0; i < 6; i++) pts.push([Math.sin(i / 6 * TAU) * .16, 0, Math.cos(i / 6 * TAU) * .16]);
    for (let i = 0; i < 3; i++) pts.push([Math.sin(i / 3 * TAU + .5) * .09, .11, Math.cos(i / 3 * TAU + .5) * .09]);
    pts.push([0, .2, 0]);
    pts.forEach(([dx, dy, dz], i) => {
      const f = shape(mats[i % mats.length]); f.position.set(x + dx, ALT.y + .182 + dy, z + dz); f.rotation.y = i; g.add(f);
    });
  }
  const sphereFruit = m => { const f = new THREE.Mesh(new THREE.SphereGeometry(.07, 20, 14), m); f.castShadow = true; return f; };
  function statueHall(g, n, o) {
    const lights = shell(g, n, { shadow: true, glow: o.glow });
    sumeru(g, 0, -1.7);
    const st = new THREE.Group(); st.position.set(0, .4, -1.7); g.add(st);
    throne(st, o.petal);
    const aura = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), new THREE.MeshBasicMaterial({ map: o.aura, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
    aura.position.set(0, 2.2, -.75); st.add(aura);
    mesh(new THREE.TorusGeometry(.72, .025, 8, 72), o.ring, 0, 2.4, -.45, st);
    mesh(new THREE.TorusGeometry(1.8, .035, 8, 96), o.ring, 0, 1.8, -.6, st);
    const halo = glowSprite(o.haloColor, 2.4, .25); halo.position.set(0, 2.4, -.52); st.add(halo);
    sculptFigure(o.figure, st, o.label);
    offeringTable(g, n);
    updaters[n].push((dt, t, motion) => { aura.rotation.z += dt * .03 * motion; aura.material.opacity = .5 + Math.sin(t * .8) * .05; lights.back.intensity = 1.1 + Math.sin(t * .8) * .1; });
    return st;
  }

  /* ---------- 2F 千燈殿 Hall of a Thousand Lamps ---------- */
  function lampHall(g, n) {
    shell(g, n, { key: 1.1 });
    const cup = lathe([[0, 0], [.03, 0], [.045, .02], [.05, .035], [.044, .035], [0, .012]], M.brass, 16);
    const flicker = [];
    // three stepped pyramids of oil lamps
    [-2.4, 0, 2.4].forEach((cx, p) => {
      const cz = p === 1 ? -1.8 : -1.1, steps = [.78, .6, .42, .24];
      steps.forEach((half, i) => {
        const bottom = PLAT + i * .26, top = bottom + .26, w = half * 2;
        mesh(new THREE.BoxGeometry(w, .26, w), M.lacquer, cx, bottom + .13, cz, g);
        mesh(new THREE.BoxGeometry(w + .012, .018, w + .012), M.trim, cx, top - .03, cz, g);
        if (i < steps.length - 1) {
          const o = (half + steps[i + 1]) / 2;
          squareRing(o, i === 0 ? 5 : i === 1 ? 4 : 3).forEach(([dx, dz]) => {
            const c = cup.clone(); c.position.set(cx + dx, top, cz + dz); g.add(c);
            const fl = makeFlame(V(cx + dx, top + .06, cz + dz), .7, null, g); flicker.push(fl);
          });
        }
      });
      // a large lotus lamp crowns each pyramid
      const top = PLAT + steps.length * .26;
      const lot = makeLotus(); lot.userData.bloom(1); lot.scale.setScalar(3); lot.position.set(cx, top + .02, cz); g.add(lot);
      const light = new THREE.PointLight(0xffa04a, 1.1, 5, 2); light.position.set(cx, top + .5, cz); g.add(light);
      makeFlame(V(cx, top + .26, cz), 2.2, light, g);
    });
    // the back wall is a grid of small lit niches
    const niche = new THREE.InstancedMesh(new THREE.BoxGeometry(.16, .2, .04), std({ color: 0x3a1a0a, emissive: 0xffa040, emissiveIntensity: .9 }), 26 * 9);
    const glow = new THREE.InstancedMesh(new THREE.BoxGeometry(.2, .24, .02), M.trim, 26 * 9);
    const m4 = new THREE.Matrix4(); let k = 0;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 26; c++) {
      m4.makeTranslation(-6.25 + c * .5, 1.3 + r * .5, -5.46); niche.setMatrixAt(k, m4);
      m4.makeTranslation(-6.25 + c * .5, 1.3 + r * .5, -5.48); glow.setMatrixAt(k++, m4);
    }
    g.add(glow, niche);
    // one great lotus lamp on a pedestal at the front
    mesh(new THREE.CylinderGeometry(.3, .38, .5, 8), M.stone, 0, PLAT + .25, 1.6, g);
    const big = makeLotus(); big.userData.bloom(1); big.scale.setScalar(5.5); big.position.set(0, PLAT + .52, 1.6); g.add(big);
    const bl = new THREE.PointLight(0xffb060, 1.3, 6, 2); bl.position.set(0, PLAT + 1.2, 1.6); g.add(bl);
    makeFlame(V(0, PLAT + .92, 1.6), 3.2, bl, g);
  }

  /* ---------- 蓮華寺 the great hall beside the pond: Shakyamuni Buddha, laid out like Guanyin's hall ---------- */
  function library(g, n) {
    statueHall(g, n, {
      figure: "shakyamuni", label: "Shakyamuni Buddha", petal: M.gold, ring: M.gold, haloColor: 0xffe2a0, glow: 0xffc070,
      aura: auraTexture("rgba(255,240,200,.9)", "rgba(255,190,90,.4)", "rgba(255,220,150,.26)")
    });
    vaseOfLotus(g, -1.02, ALT.z - .12);
    fruitPlate(g, 1.02, ALT.z - .12, [std({ color: 0xf0881c, roughness: .55 }), std({ color: 0xc8402e, roughness: .5 }), std({ color: 0x8ab83a, roughness: .5 })], sphereFruit);
    // seven water bowls along the front of the table
    for (let i = 0; i < 7; i++) {
      const x = -.6 + i * .2, bowl = lathe([[0, 0], [.035, 0], [.06, .03], [.065, .06], [.058, .06], [0, .02]], M.brass, 18);
      bowl.position.set(x, ALT.y, ALT.z + .3); g.add(bowl);
      mesh(new THREE.CylinderGeometry(.056, .056, .005, 18), std({ color: 0xa8dcef, roughness: .1, metalness: .2 }), x, ALT.y + .052, ALT.z + .3, g);
    }
    // the bronze censer before the altar, with sticks of incense smouldering, and kneeling cushions
    const cz = 1.95;
    mesh(new THREE.CylinderGeometry(.42, .5, .5, 8), M.stone, 0, .25, cz, g);
    const pot = lathe([[0, 0], [.28, .02], [.4, .14], [.44, .3], [.48, .34], [.4, .34], [.38, .22], [0, .2]], M.bronze, 32); pot.position.set(0, .5, cz); g.add(pot);
    const potAsh = mesh(ashBed(.37), ashMat, 0, .71, cz, g); potAsh.rotation.x = -Math.PI / 2;
    [-1, 1].forEach(sx => mesh(new THREE.TorusGeometry(.1, .025, 6, 14, Math.PI), M.bronze, sx * .44, .9, cz, g).rotation.y = Math.PI / 2);
    [-.08, 0, .08].forEach(x => { mesh(new THREE.CylinderGeometry(.006, .006, .45, 5), std({ color: 0xb2683a, roughness: .9 }), x, .96, cz, g); const e = glowSprite(0xff5a20, .08, 1); e.position.set(x, 1.19, cz); g.add(e); });
    [-.7, .7].forEach(x => mesh(new THREE.CylinderGeometry(.3, .32, .14, 32), M.cushion, x, .07, 2.9, g));
  }

  /* ---------- 法物流通處 inside the temple shop: shelves of offerings, a counter and the shopkeeper's lamp ---------- */
  /* ---------- the monks' dining and rest room beside the shop: low tables set with alms bowls, cushions, sleeping mats ---------- */
  function quarters(g, n) {
    shell(g, n, { key: 1.0, hemi: .34 });
    const lacq = std({ color: 0x5a1f14, roughness: .5 }), mat = std({ color: 0xc8a868, roughness: .9 }), robe = std({ color: 0xc8701c, roughness: .8 });
    const bowl = std({ color: 0x1a1210, roughness: .3, metalness: .3 }), cushion = std({ color: 0x8a2a1a, roughness: .85 }), white = std({ color: 0xf2eee4, roughness: .8 });
    // two long low dining tables, an alms bowl, a cup and a cushion at each place
    [-1.6, 1.6].forEach(tz => {
      mesh(new THREE.BoxGeometry(5.2, .1, .9), lacq, 0, .42, tz, g);
      [[-2.4, -.3], [2.4, -.3], [-2.4, .3], [2.4, .3]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.1, .38, .1), lacq, x, .19, tz + z, g));
      for (let k = 0; k < 5; k++) [-1, 1].forEach(sd => {
        const x = -2 + k;
        const b = lathe([[0, 0], [.08, 0], [.15, .06], [.16, .14], [.14, .15], [0, .08]], bowl, 18); b.position.set(x, .47, tz + sd * .25); g.add(b);
        mesh(new THREE.CylinderGeometry(.04, .035, .07, 10), white, x + .2, .5, tz + sd * .25, g);
        mesh(new THREE.CylinderGeometry(.24, .26, .08, 16), cushion, x, .04, tz + sd * .75, g);
      });
    });
    // sleeping mats along the left wall, each with a pillow and a folded saffron robe
    for (let k = 0; k < 5; k++) {
      const z = -3.6 + k * 2.1;
      mesh(new THREE.BoxGeometry(1.9, .05, .9), mat, -6.2, .025, z, g);
      mesh(new THREE.BoxGeometry(.4, .14, .7), white, -7.0, .1, z, g);
      mesh(new THREE.BoxGeometry(.45, .1, .4), robe, -5.6, .08, z, g);
    }
    // a rack of alms bowls on the right wall, and a small shrine shelf at the back
    mesh(new THREE.BoxGeometry(.4, 1.2, 4.2), lacq, 6.9, .6, 0, g);
    for (let k = 0; k < 8; k++) { const b = lathe([[0, 0], [.1, 0], [.18, .08], [.19, .18], [.17, .2], [0, .1]], bowl, 18); b.position.set(6.9, 1.2 + (k % 2) * .0, -1.8 + k * .5); g.add(b); mesh(new THREE.CylinderGeometry(.19, .17, .03, 18), robe, 6.9, 1.42, -1.8 + k * .5, g); }
    mesh(new THREE.BoxGeometry(2.4, .1, .6), lacq, 2.5, 1.5, -5.1, g);
    mesh(new THREE.CylinderGeometry(.18, .22, .5, 12), M.gold, 2.5, 1.8, -5.1, g);
    mesh(new THREE.SphereGeometry(.13, 12, 10), M.gold, 2.5, 2.15, -5.1, g);
    const lamp = new THREE.PointLight(0xffc080, 1.2, 9, 2); lamp.position.set(0, 2.6, 0); g.add(lamp);
  }
  function shop(g, n) {
    shell(g, n, { key: 1.25 });
    const list = picks[n];
    const goodsCols = [0xc0201a, 0xd8a83a, 0x2f6a5a, 0x3a5a8a, 0xb8683a, 0xe8e2d4].map(c => std({ color: c, roughness: .6 }));
    const rr = rng(77);
    // a shelf unit against the back wall for each kind of offering, labelled in Chinese; tapping one adds it to the basket
    const SHELVES = [["flower", "花", -4.4], ["water", "水", -2.2], ["fruit", "果", 0], ["candle", "燈", 2.2], ["incense", "香", 4.4]];
    SHELVES.forEach(([key, han, x]) => {
      const sh = new THREE.Group(); sh.position.set(x, 0, -4.9); g.add(sh);
      const back = mesh(new THREE.BoxGeometry(2.0, 3.0, .1), M.lacquer, 0, 1.5, -.22, sh);
      [-1, 1].forEach(sx => mesh(new THREE.BoxGeometry(.08, 3.0, .5), M.lacquer, sx * 1.0, 1.5, 0, sh));
      for (let r = 0; r < 5; r++) mesh(new THREE.BoxGeometry(2.0, .05, .5), M.wood, 0, .3 + r * .6, 0, sh);
      const pick = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.0, .6), new THREE.MeshBasicMaterial({ visible: false })); pick.position.y = 1.5; sh.add(pick);
      Object.assign(pick.userData, { shopItem: key, tip: `Add ${key === "fruit" ? "fruit" : key === "incense" ? "incense" : key + "s"} to your basket` });
      list.push(pick);
      for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) {
        const px = -.8 + k * .32, py = .33 + r * .6;
        if (key === "flower") { const f = makeLotus(); f.userData.bloom(rr() < .5 ? 1 : .4); f.scale.setScalar(1.1); f.position.set(px, py + .05, .05); sh.add(f); }
        else if (key === "water") { const b = lathe([[0, 0], [.05, 0], [.09, .05], [.1, .1], [.09, .1], [0, .03]], M.brass, 16); b.position.set(px, py, .05); sh.add(b); }
        else if (key === "fruit") { const f = new THREE.Mesh(new THREE.SphereGeometry(.09, 14, 10), [goodsCols[0], goodsCols[1], goodsCols[4]][(rr() * 3) | 0]); f.position.set(px, py + .09, .05); sh.add(f); }
        else if (key === "candle") mesh(new THREE.CylinderGeometry(.05, .05, .3, 12), rr() < .6 ? M.waxRed : M.wax, px, py + .15, .05, sh);
        else { mesh(new THREE.BoxGeometry(.24, .32, .14), goodsCols[(rr() * 6) | 0], px, py + .16, .05, sh); }
      }
      const sign = writing(128, 128, (c, cw, ch) => {
        c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.strokeRect(5, 5, cw - 10, ch - 10);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(80); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(han, cw / 2, ch / 2 + 4);
      });
      flat(mesh(new THREE.PlaneGeometry(.5, .5), new THREE.MeshStandardMaterial({ map: sign, roughness: .6, emissive: 0x333333, emissiveMap: sign }), 0, 3.3, .02, sh));
    });
    // the counter with rosaries, sutra books and a cash box, and the shop's name board above it
    mesh(new THREE.BoxGeometry(5.0, 1.0, .9), M.wood, 0, .5, -1.0, g);
    mesh(new THREE.BoxGeometry(5.1, .06, 1.0), M.trim, 0, 1.03, -1.0, g);
    for (let k = 0; k < 5; k++) { const bead = mesh(new THREE.TorusGeometry(.1, .02, 6, 18), M.wood, -1.8 + k * .3, 1.07, -1.0, g); bead.rotation.x = Math.PI / 2; }
    for (let k = 0; k < 4; k++) mesh(new THREE.BoxGeometry(.3, .06, .22), goodsCols[k], .6 + k * .35, 1.09 + (k % 2) * .06, -1.0, g);
    mesh(new THREE.BoxGeometry(.4, .22, .3), M.lacquer, 2.1, 1.17, -1.0, g);
    const lamp = new THREE.PointLight(0xffc080, 1.4, 8, 2); lamp.position.set(0, 2.4, -.6); g.add(lamp);
    mesh(new THREE.CylinderGeometry(.05, .06, .14, 12), M.brass, -2.2, 1.13, -1.0, g); makeFlame(V(-2.2, 1.25, -1.0), 1.2, lamp, g);
    const name = writing(1024, 192, (c, cw, ch) => {
      c.fillStyle = "#2a1610"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
      c.fillStyle = "#e8c25a"; c.font = HAN_FONT(118); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("法物流通處", cw / 2, ch / 2 + 8);
    });
    flat(mesh(new THREE.PlaneGeometry(3.6, .68), new THREE.MeshStandardMaterial({ map: name, roughness: .6, emissive: 0x2a2a2a, emissiveMap: name }), 0, 4.4, -5.44, g));
  }

  /* ---------- 3F 禪堂 Meditation Hall ---------- */
  function ensoTex() {
    return writing(256, 640, (c, w, h) => {
      c.fillStyle = "#efe2c4"; c.fillRect(0, 0, w, h);
      c.fillStyle = "#6b4a2a"; c.fillRect(0, 0, w, 18); c.fillRect(0, h - 18, w, 18);
      c.strokeStyle = "rgba(25,20,16,.88)"; c.lineCap = "round";
      for (let i = 0; i < 26; i++) {           // a single brush circle, thick to thin
        c.lineWidth = 22 - i * .7; c.beginPath(); c.arc(w / 2, 230, 88, -1.4 + i * .2, -1.2 + i * .2); c.stroke();
      }
      c.fillStyle = "#231a14"; c.font = HAN_FONT(110); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("禪", w / 2, 450);
      c.fillStyle = "#b3261e"; c.fillRect(w / 2 - 16, h - 80, 32, 32);
    });
  }
  function meditationHall(g, n) {
    shell(g, n, { key: .95, hemi: .28 });
    const mat = std({ color: 0x2b2547, roughness: .9 }), zafu = std({ color: 0x4a2c6e, roughness: .85 }), tat = std({ color: 0x9c8a55, roughness: .95 });
    flat(mesh(new THREE.BoxGeometry(7.2, .03, 4.6), tat, 0, PLAT + .015, -.2, g));
    for (let r = 0; r < 3; r++) for (let c = -2; c <= 2; c++) {
      const x = c * 1.35, z = -1.7 + r * 1.45;
      mesh(new THREE.BoxGeometry(1.0, .06, 1.0), mat, x, PLAT + .06, z, g);
      const cu = mesh(new THREE.CylinderGeometry(.26, .29, .16, 28), zafu, x, PLAT + .17, z, g);
      mesh(new THREE.TorusGeometry(.275, .02, 6, 28), zafu, x, PLAT + .17, z, g).rotation.x = Math.PI / 2;
    }
    // low altar with a single incense stick and lamp under the ensō scroll
    mesh(new THREE.BoxGeometry(2.4, .5, .6), M.lacquer, 0, PLAT + .25, -3.7, g);
    mesh(new THREE.BoxGeometry(2.5, .04, .7), M.trim, 0, PLAT + .5, -3.7, g);
    mesh(new THREE.CylinderGeometry(.12, .1, .12, 20), M.bronze, -.4, PLAT + .58, -3.7, g);
    mesh(new THREE.CylinderGeometry(.004, .004, .4, 5), INC, -.4, PLAT + .82, -3.7, g);
    const ember = glowSprite(0xff5a20, .06, 1); ember.position.set(-.4, PLAT + 1.02, -3.7); g.add(ember);
    const lamp = new THREE.PointLight(0xffb060, .9, 5, 2); lamp.position.set(.5, PLAT + 1, -3.6); g.add(lamp);
    mesh(new THREE.CylinderGeometry(.05, .06, .1, 12), M.brass, .5, PLAT + .57, -3.7, g);
    makeFlame(V(.5, PLAT + .66, -3.7), 1.2, lamp, g);
    flat(mesh(new THREE.PlaneGeometry(1.2, 3.0), new THREE.MeshStandardMaterial({ map: ensoTex(), roughness: .9 }), 0, 3.5, -5.44, g));
    [["靜心", -2.0], ["觀照", 2.0]].forEach(([t, x]) => flat(mesh(new THREE.PlaneGeometry(.6, 2.1), new THREE.MeshStandardMaterial({ map: scrollTex(t), roughness: .9 }), x, 3.4, -5.44, g)));
    // the wooden board (版) struck to call the hour, hanging at the side
    [-.4, .4].forEach(dz => mesh(new THREE.BoxGeometry(.08, 2.2, .08), M.lacquer, 3.6, PLAT + 1.1, .8 + dz, g));
    mesh(new THREE.BoxGeometry(.12, .1, 1.0), M.lacquer, 3.6, PLAT + 2.2, .8, g);
    mesh(new THREE.BoxGeometry(.08, .45, .65), M.wood, 3.6, PLAT + 1.55, .8, g);
  }
  const INC = std({ color: 0x8b3a1a, roughness: .9 });

  /* ---------- 5F 茶室 Tea and Calligraphy Room ---------- */
  function paintingTex(seed) {
    const rnd = rng(seed);
    return writing(256, 640, (c, w, h) => {
      c.fillStyle = "#efe4c8"; c.fillRect(0, 0, w, h);
      c.fillStyle = "#6b4a2a"; c.fillRect(0, 0, w, 16); c.fillRect(0, h - 16, w, 16);
      for (let layer = 0; layer < 4; layer++) {        // ink-wash mountains, paler with distance
        const base = 180 + layer * 95;
        c.fillStyle = `rgba(30,32,30,${.14 + layer * .17})`; c.beginPath(); c.moveTo(16, h - 30);
        for (let x = 16; x <= w - 16; x += 12) c.lineTo(x, base - Math.abs(Math.sin(x * .02 + seed + layer)) * (90 - layer * 12) - rnd() * 14);
        c.lineTo(w - 16, h - 30); c.closePath(); c.fill();
      }
      c.fillStyle = "rgba(30,30,30,.8)"; c.fillRect(w * .55, h - 130, 26, 4);   // a small boat
      c.fillStyle = "#231a14"; c.font = HAN_FONT(34); c.textAlign = "center";
      ["山", "水"].forEach((ch, i) => c.fillText(ch, w - 40, 70 + i * 40));
      c.fillStyle = "#b3261e"; c.fillRect(w - 52, 160, 22, 22);
    });
  }
  function teaRoom(g, n) {
    shell(g, n, { key: 1.1 });
    const clay = std({ color: 0x7a3a22, roughness: .55 }), porcelainCup = std({ color: 0xf3efe6, roughness: .25 });
    // tea table and seats
    mesh(new THREE.BoxGeometry(1.8, .1, 1.0), M.wood, 0, PLAT + .42, -.4, g);
    [[-.8, -.4], [.8, -.4], [-.8, .4], [.8, .4]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.1, .4, .1), M.wood, x, PLAT + .2, -.4 + z, g));
    mesh(new THREE.BoxGeometry(.9, .04, .5), std({ color: 0x2a1a12, roughness: .5 }), 0, PLAT + .49, -.4, g);
    const pot = lathe([[0, 0], [.08, 0], [.13, .04], [.14, .09], [.11, .14], [.05, .16], [0, .16]], clay, 28); pot.position.set(-.15, PLAT + .51, -.4); g.add(pot);
    const spout = mesh(new THREE.CylinderGeometry(.012, .025, .16, 10), clay, -.03, PLAT + .6, -.4, g); spout.rotation.z = -1;
    const handle = mesh(new THREE.TorusGeometry(.06, .013, 6, 16, Math.PI), clay, -.29, PLAT + .6, -.4, g); handle.rotation.z = Math.PI / 2;
    mesh(new THREE.SphereGeometry(.025, 10, 8), clay, -.15, PLAT + .68, -.4, g);
    [[.12, -.5], [.24, -.32], [.12, -.28], [.3, -.48]].forEach(([x, z]) => { const cp = lathe([[0, 0], [.025, 0], [.04, .045], [.036, .045], [0, .008]], porcelainCup, 16); cp.position.set(x, PLAT + .51, z); g.add(cp); });
    [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(.28, .3, .1, 28), M.cushion, s * 1.3, PLAT + .05, -.4, g));
    // calligraphy table: brushes on a rack, an ink stone and a written sheet
    mesh(new THREE.BoxGeometry(2.6, .08, .8), M.lacquer, 2.9, PLAT + .74, -4.3, g);
    [[-1.2, -.34], [1.2, -.34], [-1.2, .34], [1.2, .34]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.08, .72, .08), M.lacquer, 2.9 + x, PLAT + .36, -4.3 + z, g));
    const sheet = writing(512, 256, (c, w, h) => {
      c.fillStyle = "#f4ead2"; c.fillRect(0, 0, w, h);
      c.fillStyle = "#1e1813"; c.font = HAN_FONT(150); c.textAlign = "center"; c.textBaseline = "middle";
      ["茶", "禪", "一", "味"].forEach((ch, i) => c.fillText(ch, w - 64 - i * 128, h / 2));
    });
    const sh = flat(mesh(new THREE.PlaneGeometry(1.4, .7), new THREE.MeshStandardMaterial({ map: sheet, roughness: .9 }), 2.8, PLAT + .785, -4.3, g)); sh.rotation.x = -Math.PI / 2;
    mesh(new THREE.BoxGeometry(.3, .04, .2), std({ color: 0x1a1a1c, roughness: .4 }), 3.85, PLAT + .8, -4.4, g);
    mesh(new THREE.BoxGeometry(.5, .04, .06), M.wood, 3.9, PLAT + 1.05, -4.05, g);
    [-.18, -.09, 0, .09, .18].forEach(dx => { mesh(new THREE.CylinderGeometry(.008, .008, .26, 6), M.bamboo, 3.9 + dx, PLAT + .9, -4.05, g); mesh(new THREE.ConeGeometry(.014, .05, 8), std({ color: 0x1a1410 }), 3.9 + dx, PLAT + .76, -4.05, g).rotation.x = Math.PI; });
    [[-3.6, -4.05], [4.4, -4.05]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.06, .3, .06), M.wood, x > 0 ? 3.66 : 4.14, PLAT + .92, z, g));
    // ink-wash landscape scrolls on the back wall
    [[-.6, 1], [1.6, 2], [3.8, 3]].forEach(([x, seed]) => {
      flat(mesh(new THREE.PlaneGeometry(.9, 2.6), new THREE.MeshStandardMaterial({ map: paintingTex(seed), roughness: .9 }), x, 3.5, -5.44, g));
      flat(mesh(new THREE.CylinderGeometry(.03, .03, 1.05, 8), M.wood, x, 2.18, -5.4, g)).rotation.z = Math.PI / 2;
    });
    // a pine bonsai on a stand
    mesh(new THREE.BoxGeometry(.6, .5, .6), M.lacquer, -2.4, PLAT + .25, .6, g);
    mesh(new THREE.BoxGeometry(.7, .14, .45), std({ color: 0x3a4a5a, roughness: .5 }), -2.4, PLAT + .57, .6, g);
    const bark = std({ color: 0x4a3222, roughness: .9 }), pine = std({ color: 0x2f5a26, roughness: .8, flatShading: true });
    const tr = mesh(new THREE.CylinderGeometry(.04, .07, .6, 8), bark, -2.45, PLAT + .9, .6, g); tr.rotation.z = .5;
    [[-2.7, 1.15, .6, .28], [-2.3, 1.05, .7, .22], [-2.55, 1.32, .55, .2]].forEach(([x, y, z, r]) => { const f = mesh(new THREE.IcosahedronGeometry(r, 1), pine, x, PLAT + y, z, g); f.scale.y = .45; });
  }

  /* ---------- 4F 藥師殿 Medicine Buddha ---------- */
  function medicineHall(g, n) {
    statueHall(g, n, {
      figure: "medicine", label: "the Medicine Buddha", petal: M.gold, ring: M.gold, haloColor: 0x9fc0ff, glow: 0x9fb4ff,
      aura: auraTexture("rgba(225,235,255,.85)", "rgba(90,130,255,.4)", "rgba(170,200,255,.24)")
    });
    vaseOfLotus(g, -1.02, ALT.z - .12);
    fruitPlate(g, 1.02, ALT.z - .12, [std({ color: 0xf0881c, roughness: .55 }), std({ color: 0x8ab83a, roughness: .5 })], sphereFruit);
    // the seven lamps of the Medicine Buddha (藥師七燈)
    const cup = lathe([[0, 0], [.04, 0], [.06, .025], [.068, .045], [.06, .045], [0, .015]], M.brass, 20);
    for (let i = 0; i < 7; i++) {
      const x = -.54 + i * .18, z = ALT.z + .3, c = cup.clone(); c.position.set(x, ALT.y, z); g.add(c);
      makeFlame(V(x, ALT.y + .075, z), .9, null, g);
    }
  }

  /* ---------- 蓮池 the lotus pond, outside in front of the pagoda ---------- */
  // a square pool centred on (cx, cz), S from the centre to each side, with stone coping; the arched bridge runs along z
  /* ---------- at the lotus pond: tossing a coin for a wish, and bathing the Buddha with pond water (symbolic only, no money) ---------- */
  const COIN_KEY = "lotus-altar-coins";
  let pondCoinThrow = null, pondBathe = null;
  function pondRituals(g, water, cx, cz, S, WY) {
    const list = picks.pagoda, upd = updaters.pagoda;
    // the water takes coins: a tap on it throws one to that spot
    clickable(list, water, { coinPond: true, tip: "Toss a coin into the lotus pond and make a wish" });
    const coinGeo = new THREE.CylinderGeometry(.15, .15, .025, 18), coinMat = std({ color: 0xf0c050, metalness: .7, roughness: .25, emissive: 0x6a4a10 });   // a little larger than life so they show through the water
    const MAXC = 300, bedCoins = new THREE.InstancedMesh(coinGeo, coinMat, MAXC), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    bedCoins.count = 0; g.add(bedCoins);
    let saved = 0; try { saved = Math.min(MAXC, parseInt(localStorage.getItem(COIN_KEY), 10) || 0); } catch (err) {}
    const rr = rng(808);
    const lay = (x, z) => {   // a coin settled on the pond bed
      if (bedCoins.count >= MAXC) return;
      bedCoins.setMatrixAt(bedCoins.count++, m4.compose(V(x, .045, z), q.setFromEuler(e.set((rr() - .5) * .3, rr() * TAU, (rr() - .5) * .3)), V(1, 1, 1)));
      bedCoins.instanceMatrix.needsUpdate = true;
    };
    for (let i = 0; i < saved; i++) lay(cx + (rr() * 2 - 1) * (S - 1), cz + (rr() * 2 - 1) * (S - 1));   // coins left on earlier visits
    const flying = [], rings = [];
    const ringGeo = new THREE.RingGeometry(.85, 1, 40);
    pondCoinThrow = p => {
      const to = V(clamp(p.x, cx - S + .5, cx + S - .5), WY, clamp(p.z, cz - S + .5, cz + S - .5));
      const from = to.clone().add(V(0, 3.2, 4.5));   // as if thrown from the bank nearest the viewer
      const coin = mesh(coinGeo, coinMat, from.x, from.y, from.z, g);
      flying.push({ coin, from, to, t: 0 });
      let n = 0; try { n = (parseInt(localStorage.getItem(COIN_KEY), 10) || 0) + 1; localStorage.setItem(COIN_KEY, String(n)); } catch (err) { n = bedCoins.count + 1; }
      return n;
    };
    upd.push(dt => {
      for (let i = flying.length - 1; i >= 0; i--) {
        const f = flying[i]; f.t += dt / .75;
        const k = Math.min(1, f.t);
        f.coin.position.lerpVectors(f.from, f.to, k); f.coin.position.y += Math.sin(Math.PI * k) * 2.2;
        f.coin.rotation.x += dt * 22; f.coin.rotation.z += dt * 9;
        if (k >= 1) {   // splash: rings spread on the water, the coin sinks to the bed
          g.remove(f.coin); flying.splice(i, 1);
          tone(1400, 700, .12, .18, "sine"); tone(380, 160, .2, .25, "triangle", .02);
          for (let j = 0; j < 3; j++) {
            const ring = flat(mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xe8f4f8, transparent: true, opacity: .8, depthWrite: false, side: THREE.DoubleSide }), f.to.x, WY + .03, f.to.z, g));
            ring.rotation.x = -Math.PI / 2; rings.push({ ring, t: -j * .25 });
          }
          const sp = glowSprite(0xe8f8ff, 1.0, .9); sp.position.copy(f.to).add(V(0, .2, 0)); g.add(sp); rings.push({ ring: sp, t: 0, sprite: true });
          lay(f.to.x, f.to.z);
        }
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]; r.t += dt;
        if (r.t < 0) continue;
        const k = r.t / (r.sprite ? .5 : 1.6);
        if (r.sprite) { r.ring.material.opacity = .9 * (1 - k); r.ring.scale.setScalar(1 + k); }
        else { r.ring.scale.setScalar(.15 + k * 1.6); r.ring.material.opacity = .8 * (1 - k); }
        if (k >= 1) { g.remove(r.ring); rings.splice(i, 1); }
      }
    });
    // the bathing basin on the pond's east edge: a small golden Buddha on a lotus pedestal in a stone basin, a ladle hanging ready
    const B = new THREE.Group(); B.position.set(cx + S + 2.2, 0, cz - 7); B.rotation.y = -Math.PI / 2; g.add(B);
    sRect(B, -1.3, 1.3, -1.3, 1.3);
    const stone = std({ color: 0x8c877d, roughness: .85 }), waterM = std({ color: 0x3a8a9a, metalness: .2, roughness: .1, transparent: true, opacity: .75 });
    const bdata = { bathe: true, tip: "Bathe the Buddha · pour pond water over the image" };
    mesh(new THREE.BoxGeometry(2.6, .3, 2.6), stone, 0, .15, 0, B);
    const basin = lathe([[0, 0], [1.0, 0], [1.1, .15], [1.15, .7], [1.05, .7], [.95, .25], [0, .25]], stone, 32); basin.position.y = .3; B.add(basin);
    mesh(new THREE.CylinderGeometry(.98, .98, .05, 32), waterM, 0, .85, 0, B);
    const ped = lathe([[0, 0], [.35, 0], [.3, .3], [.45, .45], [.5, .55], [0, .55]], M.gold, 24); ped.position.y = .55; B.add(ped);
    const buddha = new THREE.Group(); buddha.position.y = 1.1; B.add(buddha);   // the infant Buddha, one hand raised to the sky
    mesh(new THREE.CylinderGeometry(.13, .2, .55, 14), M.gold, 0, .27, 0, buddha);
    mesh(new THREE.SphereGeometry(.13, 16, 12), M.gold, 0, .66, 0, buddha);
    mesh(new THREE.SphereGeometry(.06, 10, 8), M.gold, 0, .8, 0, buddha);
    const arm = mesh(new THREE.CylinderGeometry(.03, .035, .42, 8), M.gold, .12, .72, 0, buddha); arm.rotation.z = -.15;
    const arm2 = mesh(new THREE.CylinderGeometry(.03, .035, .32, 8), M.gold, -.13, .32, .05, buddha); arm2.rotation.z = .5;
    const halo = glowSprite(0xffe0a0, 1.2, .35); halo.position.y = .7; buddha.add(halo);
    // a little roof of the pagoda's tiles keeps the rain off
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => mesh(new THREE.CylinderGeometry(.06, .07, 2.6, 8), pillarRed, a * 1.15, 1.6, b * 1.15, B));
    tiledHipRoof(B, 0, 0, 2.9, 1.75, 1.75, .9, .25, [0, .2, .4, .6, .8, .93], .5, false);
    // the ladle on its hook, which lifts, tips over the Buddha and comes back
    const ladle = new THREE.Group(); ladle.position.set(.9, 1.4, .6); B.add(ladle);
    mesh(new THREE.CylinderGeometry(.02, .02, .9, 6), M.wood, 0, .3, 0, ladle).rotation.z = .3;
    const cup = mesh(new THREE.CylinderGeometry(.13, .09, .14, 14, 1, true), std({ color: 0xc8a070, roughness: .6, side: THREE.DoubleSide }), -.14, -.12, 0, ladle);
    clickable(list, basin, bdata); clickable(list, ladle.children[0], bdata); buddha.children.forEach(o => o.isMesh && clickable(list, o, bdata));
    const drops = [];
    const dropTex = glowTex;
    let busy = false;
    pondBathe = () => {
      if (busy) return false;
      busy = true;
      const home = ladle.position.clone(), over = V(.2, 2.15, .15);
      tween(.6, t => { const e2 = t * t * (3 - 2 * t); ladle.position.lerpVectors(home, over, e2); ladle.rotation.z = -1.4 * e2; }, () => {
        let n = 0;
        const pour = setInterval(() => {   // a stream of drops from the ladle over the Buddha's head
          for (let k = 0; k < 4; k++) {
            const d = new THREE.Sprite(new THREE.SpriteMaterial({ map: dropTex, color: 0xbfe8f4, transparent: true, depthWrite: false }));
            d.scale.setScalar(.08); d.position.set(.05 + (Math.random() - .5) * .08, 2.05, .15 + (Math.random() - .5) * .08); B.add(d);
            drops.push({ d, v: V((Math.random() - .5) * .4, 0, (Math.random() - .5) * .4) });
          }
          tone(900 + Math.random() * 500, null, .015, .06, "sine");
          if (++n > 22) {
            clearInterval(pour);
            tween(.6, t => { const e2 = t * t * (3 - 2 * t); ladle.position.lerpVectors(over, home, e2); ladle.rotation.z = -1.4 * (1 - e2); }, () => { busy = false; });
          }
        }, 60);
      });
      return true;
    };
    upd.push(dt => {
      for (let i = drops.length - 1; i >= 0; i--) {
        const p = drops[i]; p.v.y -= 9.8 * dt; p.d.position.addScaledVector(p.v, dt);
        if (p.d.position.y < 1.85 && Math.abs(p.d.position.x) < .3) p.v.x += (p.d.position.x > 0 ? 1 : -1) * dt * 4;   // running off the shoulders
        if (p.d.position.y < .86) { B.remove(p.d); drops.splice(i, 1); }
      }
    });
  }
  function outdoorPond(g, cx, cz, S) {
    const WY = .38, upd = updaters.pagoda, inside = S - .9;   // lotus and fish stay inside `inside`
    [[0, S + .3, 2 * S + 1.2, .6], [0, -S - .3, 2 * S + 1.2, .6], [S + .3, 0, .6, 2 * S], [-S - .3, 0, .6, 2 * S]].forEach(([x, z, w, d]) => {
      mesh(new THREE.BoxGeometry(w, .55, d), M.stone, cx + x, .275, cz + z, g);
      mesh(new THREE.BoxGeometry(w + .08, .08, d + .08), std({ color: 0x5a463a, roughness: .8 }), cx + x, .59, cz + z, g);
    });
    const bed = flat(mesh(new THREE.PlaneGeometry(2 * S, 2 * S), std({ color: 0x14302a, roughness: 1 }), cx, .02, cz, g)); bed.rotation.x = -Math.PI / 2;
    const waterGeo = new THREE.PlaneGeometry(2 * S, 2 * S, 72, 72);
    const water = flat(mesh(waterGeo, std({ color: 0x1d5560, metalness: .2, roughness: .08, transparent: true, opacity: .55, depthWrite: false }), cx, WY, cz, g)); water.rotation.x = -Math.PI / 2;
    const wp = waterGeo.attributes.position, base = Float32Array.from(wp.array);
    const rnd = rng(11);
    const spot = () => { let x, z; do { x = (rnd() * 2 - 1) * inside; z = (rnd() * 2 - 1) * inside; } while (Math.abs(x) < 1.9); return [x, z]; };
    const pad = new THREE.InstancedMesh(new THREE.CircleGeometry(.32, 24, .25, TAU - .5), std({ color: 0x3f7a2a, roughness: .6, side: THREE.DoubleSide }), 160);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V(1, 1, 1), spots = [];
    for (let i = 0; i < 160; i++) {
      const [x, z] = spot();
      q.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, rnd() * TAU)); sc.setScalar((.7 + rnd() * .9) * 1.5);
      m4.compose(V(cx + x, WY + .015, cz + z), q, sc); pad.setMatrixAt(i, m4); spots.push([x, z]);
    }
    g.add(pad);
    spots.slice(0, 48).forEach(([x, z], i) => {
      const f = makeLotus(); f.userData.bloom(i % 4 === 3 ? .25 : 1); f.scale.setScalar((2.6 + rnd()) * 1.5); f.position.set(cx + x, WY + .06, cz + z); g.add(f);
    });
    // floating lotus lamps on slow loops that stay inside the pool and off the bridge
    const drift = [];
    for (let i = 0; i < 12; i++) {
      const lot = makeLotus(); lot.userData.bloom(1); lot.scale.setScalar(2.8); g.add(lot);
      const fl = makeFlame(V(0, 0, 0), 1.2, null, g);
      lot.userData.noCull = fl.flame.userData.noCull = fl.g.userData.noCull = true;   // drifting: never culled
      drift.push({ lot, fl, a: i / 12 * TAU, r: 3 + (i % 4) * 1.8, s: .04 + rnd() * .03 });
    }
    // koi just under the surface, each wandering on its own and turning back before the coping
    const koiMats = [0xff6a10, 0xfaf6ee, 0xe0281a, 0xffb020].map(c => std({ color: c, roughness: .35, emissive: c, emissiveIntensity: .35 }));
    const koi = [];
    for (let i = 0; i < 34; i++) {
      const f = new THREE.Group(); f.scale.setScalar(2.4); f.userData.noCull = true; g.add(f);   // swimming about: never culled
      const body = new THREE.Mesh(petalGeo, koiMats[i % 4]); body.scale.set(.05, .04, .16); f.add(body);
      const head = new THREE.Mesh(petalGeo, koiMats[i % 4 === 1 ? 2 : (i + 2) % 4]); head.scale.set(.04, .035, .07); head.position.z = .08; f.add(head);
      const tail = new THREE.Group(); tail.position.z = -.15; f.add(tail);
      const fin = new THREE.Mesh(petalGeo, koiMats[(i + 1) % 4]); fin.scale.set(.07, .012, .07); fin.position.z = -.05; tail.add(fin);
      koi.push({ k: f, tail, x: (rnd() * 2 - 1) * inside, z: (rnd() * 2 - 1) * inside, h: rnd() * TAU, turn: 0, s: .35 + rnd() * .3, ph: rnd() * 10, y: WY - .05 - rnd() * .06 });
    }
    // red arched bridge carrying the path across the pond
    const L = 2 * S + 1.6, H = 1.3, W = 2.6, z0 = cz - L / 2;
    WALKABLE.pond = { cx, cz, S, bridge: { z0, L, H, W } };
    // stone steps up onto each end of the bridge, so the deck does not start in mid-air
    const BS = 4, bsRise = .65 / BS, bsRun = .42;
    [[z0, -1], [z0 + L, 1]].forEach(([ze, dir]) => {
      for (let i = 0; i < BS; i++) { const h = .65 - i * bsRise; mesh(new THREE.BoxGeometry(W, h, bsRun), M.stone, cx, h / 2, ze + dir * (i * bsRun + bsRun / 2), g); }
    });
    for (let i = 0; i <= 24; i++) {
      const t = i / 24, z = z0 + t * L, y = .6 + Math.sin(Math.PI * t) * H;
      const plank = mesh(new THREE.BoxGeometry(W, .1, L / 24 + .06), M.wood, cx, y, z, g);
      plank.rotation.x = -Math.atan(H * Math.PI * Math.cos(Math.PI * t) / L);
      if (i % 2 === 0) [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(.05, .05, .8, 8), M.lacquer, cx + s * (W / 2 - .05), y + .4, z, g));
    }
    [-1, 1].forEach(s => {
      const pts = []; for (let i = 0; i <= 32; i++) { const t = i / 32; pts.push(V(cx + s * (W / 2 - .05), .6 + .8 + Math.sin(Math.PI * t) * H, z0 + t * L)); }
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, .06, 8), M.lacquer, 0, 0, 0, g);
    });
    pondRituals(g, water, cx, cz, S, WY);
    upd.push((dt, t, motion) => {
      for (let i = 0; i < wp.count; i++) {
        const x = base[i * 3], y = base[i * 3 + 1];
        wp.array[i * 3 + 2] = (Math.sin(Math.hypot(x, y) * 3.5 - t * 1.6) * .02 + Math.sin(x * 2 + t) * .01) * motion;
      }
      wp.needsUpdate = true; waterGeo.computeVertexNormals();
      koi.forEach(f => {
        const m = dt * motion;
        f.turn += (Math.sin(t * .7 + f.ph) * .9 - f.turn) * m;                         // a lazy meander
        if (Math.abs(f.x) > inside || Math.abs(f.z) > inside) {                         // near the edge: turn toward the middle
          const back = Math.atan2(-f.x, -f.z), diff = Math.atan2(Math.sin(back - f.h), Math.cos(back - f.h));
          f.turn = clamp(diff * 2, -2, 2);
        }
        f.h += f.turn * m;
        f.x += Math.sin(f.h) * f.s * m; f.z += Math.cos(f.h) * f.s * m;
        f.k.position.set(cx + f.x, f.y + Math.sin(t * 2 + f.ph) * .01, cz + f.z); f.k.rotation.y = f.h;
        f.tail.rotation.y = Math.sin(t * (6 + f.s * 6) + f.ph) * .5 * motion;
      });
      drift.forEach(d => {
        d.a += d.s * dt * motion;
        const x = Math.cos(d.a) * d.r, z = Math.sin(d.a) * d.r;
        const p = V(cx + (Math.abs(x) < 1.9 ? Math.sign(x || 1) * 1.9 : x), WY + .04 + Math.sin(t * 1.3 + d.r) * .01, cz + z);
        d.lot.position.copy(p); d.fl.flame.position.set(p.x, p.y + .14, p.z); d.fl.g.position.copy(d.fl.flame.position);
      });
    });
  }

  // trees: a trunk under a few clumps of low-poly foliage
  const bark = std({ color: 0x4a3426, roughness: .9 });
  const leafMats = [0x2f5a26, 0x3a6b2c, 0x264d22, 0x46773a].map(c => std({ color: c, roughness: .9, flatShading: true }));
  function tree(g, x, z, s = 1, seed = 1) {
    const r = rng(seed), t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); t.rotation.y = r() * TAU; g.add(t);
    sCircle(t, 0, 0, .22);
    mesh(new THREE.CylinderGeometry(.13, .22, 2.4, 8), bark, 0, 1.2, 0, t);
    for (let i = 0; i < 6; i++) {
      const a = r() * TAU, d = i ? .5 + r() * .5 : 0;
      mesh(new THREE.IcosahedronGeometry(.8 + r() * .6, 0), leafMats[(i + seed) % 4], Math.cos(a) * d, 2.7 + r() * 1.0 + (i ? 0 : .5), Math.sin(a) * d, t);
    }
    return t;
  }
  // 銀杏, the ginkgo of temple courtyards: a straight grey trunk under a tall crown of golden fan-shaped leaves,
  // with fallen leaves scattered round its foot
  const ginkgoMats = [0xe0a81a, 0xd4901a, 0xeec030, 0xc88a14].map(c => std({ color: c, roughness: .75, flatShading: true, emissive: c, emissiveIntensity: .04 }));
  const ginkgoBark = std({ color: 0x5e5248, roughness: .9 }), fallenMat = std({ color: 0xe8b52a, roughness: .9, transparent: true, opacity: .8 });
  function ginkgo(g, x, z, s = 1, seed = 1) {
    const r = rng(seed * 31), t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); t.rotation.y = r() * TAU; g.add(t);
    sCircle(t, 0, 0, .3);
    mesh(new THREE.CylinderGeometry(.16, .3, 4.2, 9), ginkgoBark, 0, 2.1, 0, t);
    for (let i = 0; i < 4; i++) { const a = r() * TAU, br = mesh(new THREE.CylinderGeometry(.04, .08, 1.4, 6), ginkgoBark, Math.cos(a) * .35, 2.6 + i * .6, Math.sin(a) * .35, t); br.rotation.set(Math.sin(a) * .7, 0, -Math.cos(a) * .7); }
    for (let i = 0; i < 22; i++) {   // a rounded crown of many small clumps, broad below and narrowing toward the top
      const h = Math.sqrt(r()), y = 2.8 + h * 3.6, w = (1 - h * .65) * 1.7, a = r() * TAU, d = (.4 + .6 * r()) * w;
      const c = mesh(new THREE.IcosahedronGeometry(.55 + r() * .35 - h * .15, 1), ginkgoMats[(i + seed) % 4], Math.cos(a) * d, y, Math.sin(a) * d, t);
      c.scale.y = .8; c.rotation.set(r() * 3, r() * 3, 0);
    }
    const fallen = flat(mesh(new THREE.CircleGeometry(2.2, 20), fallenMat, 0, .03, 0, t)); fallen.rotation.x = -Math.PI / 2;
    return t;
  }
  // 松, a pine with a leaning red-brown trunk and flat cloud-like pads of needles on its branches
  const pineBark = std({ color: 0x6a3a26, roughness: .9 }), pineMats = [0x22412a, 0x2c4f30, 0x1d3a26].map(c => std({ color: c, roughness: .9, flatShading: true }));
  const pineTrunkGeo = new THREE.CylinderGeometry(.12, .26, 5.2, 8), pineBranchGeo = new THREE.CylinderGeometry(.03, .07, 1, 6), pinePadGeo = new THREE.IcosahedronGeometry(1, 1);
  function pine(g, x, z, s = 1, seed = 1) {
    const r = rng(seed * 17), t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); t.rotation.y = r() * TAU; g.add(t);
    sCircle(t, 0, 0, .26);
    const lean = (r() - .5) * .25, H = 5.2;
    const trunk = part(pineTrunkGeo, pineBark, Math.sin(lean) * H / 2, H / 2, 0, t); trunk.rotation.z = -lean;
    const tiers = 5;
    for (let i = 0; i < tiers; i++) {
      const y = 2.0 + i * (H - 2.0) / tiers, a = i * 2.3 + r(), len = (1 - i / tiers) * 1.6 + .4, cx = Math.sin(lean) * y;
      const br = part(pineBranchGeo, pineBark, cx + Math.cos(a) * len / 2, y, Math.sin(a) * len / 2, t); br.rotation.set(0, -a, Math.PI / 2 - .25); br.rotation.order = "YZX"; br.scale.y = len;
      const pad = part(pinePadGeo, pineMats[i % 3], cx + Math.cos(a) * len, y + .15, Math.sin(a) * len, t);
      pad.scale.set(.9 + len * .35, .32, .8 + len * .3);
      if (i % 2) { const p2 = part(pinePadGeo, pineMats[(i + 1) % 3], cx - Math.cos(a) * len * .6, y + .4, -Math.sin(a) * len * .6, t); p2.scale.set(.8, .28, .7); }
    }
    const crown = part(pinePadGeo, pineMats[0], Math.sin(lean) * H, H + .1, 0, t); crown.scale.set(1.1, .38, 1.0);
    return t;
  }
  // a temple wall run between two points, red with a painted band and a tiled coping
  function templeWall(g, ax, az, bx, bz) {
    const len = Math.hypot(bx - ax, bz - az), w = new THREE.Group(), WH = 3.2;
    w.position.set((ax + bx) / 2, 0, (az + bz) / 2); w.rotation.y = -Math.atan2(bz - az, bx - ax); g.add(w);
    mesh(new THREE.BoxGeometry(len, .5, .7), M.stone, 0, .25, 0, w);
    mesh(new THREE.BoxGeometry(len, WH, .5), pillarRed, 0, WH / 2, 0, w);
    mesh(new THREE.BoxGeometry(len, .2, .62), beamMat, 0, WH - .2, 0, w);
    [-1, 1].forEach(f => { const c = mesh(new THREE.BoxGeometry(len + .2, .08, .62), roofMat, 0, WH + .18, f * .26, w); c.rotation.x = f * .5; });
    [-1, 1].forEach(f => mesh(new THREE.BoxGeometry(len + .2, .1, .04), eaveRed, 0, WH + .05, f * .55, w));
    mesh(new THREE.BoxGeometry(len + .2, .14, .16), ridgeMat, 0, WH + .34, 0, w);
  }
  // the compound walls, trees in the grounds, and the street outside the gate with its pavements, lamps and trees
  function templeGrounds(g) {
    const FZ = 43, BZ = -16, SX = 33;
    [-1, 1].forEach(sd => templeWall(g, sd * SX, FZ, sd * SX, BZ));
    templeWall(g, -SX, BZ, -2.9, BZ); templeWall(g, 2.9, BZ, SX, BZ);   // the back gate stands in the gap
    BLOCK.segs.push([-SX, FZ, -SX, BZ], [SX, FZ, SX, BZ], [-SX, BZ, -3.2, BZ], [3.2, BZ, SX, BZ], [-33, 43, -5.2, 43], [5.2, 43, 33, 43]);
    let seed = 3;
    [[-26, 8], [-31, 15], [-24, 40.5], [-13, 38.5], [-30.5, 40], [-12, -10], [10, -12], [-24, -10], [30.5, -13], [30, 8], [13, 39], [27, 41], [-6, -13], [6, -13]]
      .forEach(([x, z]) => ginkgo(g, x, z, .85 + ((seed * 7) % 5) * .06, seed++));   // golden ginkgos inside the walls
    // outside the walls: pines and common trees round the sides and the back
    const outside = [];
    for (let z = -12; z <= 40; z += 8) outside.push([37.5 + ((z / 8) % 2) * 2, z]);   // east side; the west side has the town road (see shanTown)
    for (let x = -36; x <= 36; x += 8) if (Math.abs(x) > 6 && x > -34) outside.push([x, -20.5 - ((x / 8) % 2) * 1.5]);   // the approach to the back gate stays clear
    outside.forEach(([x, z], i) => (i % 3 === 1 ? tree : pine)(g, x, z, .9 + (i % 4) * .08, seed++));
    // the street: a stone-paved road between kerbed pavements
    const road = std({ color: 0x2e2b28, roughness: .95 }), pave = std({ color: 0x6a645c, roughness: .9 }), kerb = std({ color: 0x8a847a, roughness: .8 });
    flat(mesh(new THREE.BoxGeometry(245, .04, 8), road, 22.5, .02, 54, g));   // from x = -100, past the hut village's lane, to 145 past the fire and police stations
    // the north pavement stops either side of the town road, so the two roads meet in a proper junction
    // (and at the mouth of the west lane)
    const gaps = [[-100, -100], [LANES[3].x0, LANES[3].x1], [TOWN.roadX - TOWN.roadW / 2, TOWN.roadX + TOWN.roadW / 2], [145, 145]];
    [[48.75, 2.5, true], [59.4, 2.8, false]].forEach(([z, d, cut]) => {
      const runs = cut ? gaps.slice(1).map((gp, i) => [gaps[i][1], gp[0]]) : [[-100, 145]];
      runs.forEach(([x0, x1]) => {
        mesh(new THREE.BoxGeometry(x1 - x0, .18, d), pave, (x0 + x1) / 2, .09, z, g);
        [-1, 1].forEach(e => mesh(new THREE.BoxGeometry(x1 - x0, .2, .14), kerb, (x0 + x1) / 2, .1, z + e * d / 2, g));
      });
      if (cut) gaps.slice(1, -1).flat().forEach(x => mesh(new THREE.BoxGeometry(.14, .2, d), kerb, x, .1, z, g));   // kerbs turning the corners
    });
    // asphalt across the old pavement line, joining the town road to the street, with a give-way line
    flat(mesh(new THREE.BoxGeometry(TOWN.roadW, .04, 50 - TOWN.z1 + .2), std({ color: 0x2c2c2e, roughness: .95 }), TOWN.roadX, .02, (TOWN.z1 + 50) / 2, g));
    flat(mesh(new THREE.BoxGeometry(TOWN.roadW / 2 - .2, .02, .25), std({ color: 0xe8e4d8, roughness: .8 }), TOWN.roadX + TOWN.roadW / 4, .05, 49.6, g));
    const dash = new THREE.InstancedMesh(new THREE.BoxGeometry(2.4, .02, .14), std({ color: 0xbdb6a8, roughness: .8 }), 41), m4 = new THREE.Matrix4();
    for (let i = 0; i < 41; i++) dash.setMatrixAt(i, m4.makeTranslation(-99 + i * 6, .05, 54));
    g.add(dash);
    // lamp posts and street trees along both pavements, clear of the gate
    for (let x = -60; x <= 60; x += 10) {
      if (Math.abs(x) < 7) continue;
      [[48.5, 0], [59.6, Math.PI]].forEach(([z, ry], side) => {
        if (side === 0 && Math.abs(x - TOWN.roadX) < 6) return;   // the mouth of the town road
        if (LANES.some(l => l.mouth && (l.z0 > 55) === !!side && x > l.x0 - 1.5 && x < l.x1 + 1.5)) return;   // and of the back lanes
        if ((x / 10 + side) % 2 === 0) {
          mesh(new THREE.CylinderGeometry(.07, .1, 3.4, 8), M.lacquer, x, 1.7, z, g);
          sCircle(g, x, z, .12);
          const arm = mesh(new THREE.BoxGeometry(.06, .06, .7), M.lacquer, x, 3.35, z + (side ? -.3 : .3), g); arm.rotation.y = ry;
          const l = flat(mesh(lanternGeo, lanternMat, x, 3.05, z + (side ? -.6 : .6), g)); l.scale.set(.75, .9, .75);
          const gl = glowSprite(0xff7a3a, 2.2, .6); gl.position.copy(l.position); g.add(gl);
          poleLights.push({ x, z: l.position.z, set: lit => { l.material = lit ? lanternMat : lanternOff; gl.material.opacity = lit ? .6 : 0; } });
        } else (((x / 10) | 0) % 4 === 1 || ((x / 10) | 0) % 4 === -3 ? tree : pine)(g, x, z + (side ? .3 : -.3), .85, seed++);
      });
    }
  }
  /* ---------- the town on the west side: a modern road and houses in the style of Northern Shan State today ----------
     two-storey painted concrete houses and shophouses with corrugated-metal roofs, steel balcony railings, rolling shutters,
     blue water tanks and air-conditioners; nothing in temple style */
  const TOWN = { roadX: -41.5, roadW: 6.5, z0: -26, z1: 47.5 };
  // the four back lanes (see backStreets); `mouth`: the lane opens onto the street, so the pavement and its lamps stop there
  const LANES = [
    { x0: -22, x1: 43.25, z0: 75.25, z1: 79.75 },                // the back lane behind the houses on the street's south side
    { x0: -2.25, x1: 2.25, z0: 71.2, z1: 107 },                  // the plaza lane, south from the plaza opposite the gate
    { x0: 38.75, x1: 43.25, z0: 60.8, z1: 152, mouth: true },    // the market lane, beside the daily market and on to the high school
    { x0: -73, x1: -68.5, z0: -24, z1: 50, mouth: true }         // the west lane, a row back from the houses on the town road
  ];
  const corrugated = (base, light, dark) => {
    const t = canvasTex(64, (c, sz) => {
      for (let x = 0; x < sz; x += 8) {
        const gr = c.createLinearGradient(x, 0, x + 8, 0); gr.addColorStop(0, dark); gr.addColorStop(.5, light); gr.addColorStop(1, dark);
        c.fillStyle = gr; c.fillRect(x, 0, 8, sz);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  };
  const ROOFS = [["#2f6a4a", "#4f9a6e", "#1f4a34"], ["#a83228", "#d0584a", "#7a2018"], ["#2f5a8e", "#5486c0", "#1f3a60"], ["#8a8c8e", "#c0c4c8", "#5e6064"]]
    .map(([b, l, d]) => { const tex = corrugated(b, l, d); return repX => { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(repX, 1); return std({ map: t, roughness: .45, metalness: .45, side: THREE.DoubleSide }); }; });
  const WALLS = [0xf2e2b0, 0xe8c8c8, 0xc8dce8, 0xf4f0e4, 0xd8e8c8, 0xf0d0a0].map(c => std({ color: c, roughness: .85 }));
  const townGlass = std({ color: 0x2a3a44, roughness: .2, metalness: .3, emissive: 0xffd8a0, emissiveIntensity: 0 });
  const townFrame = std({ color: 0xf4f4f0, roughness: .6 }), steel = std({ color: 0x5a5e62, roughness: .4, metalness: .7 });
  const concrete = std({ color: 0xb8b4ac, roughness: .9 }), tile = std({ color: 0xc8a888, roughness: .7 });
  const shutterTex = canvasTex(64, (c, sz) => { c.fillStyle = "#9aa0a4"; c.fillRect(0, 0, sz, sz); c.fillStyle = "#6e7478"; for (let y = 0; y < sz; y += 6) c.fillRect(0, y, sz, 2); });
  shutterTex.wrapS = shutterTex.wrapT = THREE.RepeatWrapping;
  const shutter = std({ map: shutterTex, roughness: .5, metalness: .5 }), tank = std({ color: 0x2a6ac0, roughness: .5 });
  const houseGlass = townGlass.clone();   // the houses' windows, which go dark on Halloween night; public buildings keep townGlass
  onDaylight(d => { townGlass.emissiveIntensity = .9 * (1 - d) + .02; houseGlass.emissiveIntensity = .9 * (1 - d) * (1 - FEST.out) + .02; });
  // one house in local coordinates: front faces +z, width W along x, depth D, `floors` storeys, a shop on the ground floor or not
  const balusterGeo = new THREE.BoxGeometry(.03, .9, .03), plantGeo = new THREE.IcosahedronGeometry(.22, 0);
  function shanHouse(g, x, z, ry, o) {
    const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
    sRect(h, -o.W / 2, o.W / 2, -o.D / 2, o.D / 2);
    const { W, D, floors, shop, wall, roof, seed } = o, r = rng(seed), FH = 3.1;
    mesh(new THREE.BoxGeometry(W + .6, .25, D + 2.2), concrete, 0, .125, .9, h);                       // the slab and front apron
    for (let f = 0; f < floors; f++) {
      const y0 = .25 + f * FH;
      mesh(new THREE.BoxGeometry(W, FH, D), wall, 0, y0 + FH / 2, 0, h);
      mesh(new THREE.BoxGeometry(W + .1, .18, D + .1), townFrame, 0, y0 + FH - .09, 0, h);           // white floor band
      const win = (wx, wy, ww, wh, zf) => {
        mesh(new THREE.BoxGeometry(ww + .16, wh + .16, .08), townFrame, wx, wy, zf, h);
        mesh(new THREE.BoxGeometry(ww, wh, .1), houseGlass, wx, wy, zf + .01, h);
        mesh(new THREE.BoxGeometry(.04, wh, .12), townFrame, wx, wy, zf + .02, h);
      };
      if (f === 0 && shop) {   // a shopfront: two bays with rolling shutters, one rolled up over a glass front, and a signboard
        const bw = (W - .8) / 2;
        [-1, 1].forEach((sd, i) => {
          const bx = sd * (bw / 2 + .2);
          if (i === (seed % 2)) { win(bx, y0 + 1.25, bw - .2, 2.3, D / 2); mesh(new THREE.BoxGeometry(bw, .45, .25), shutter, bx, y0 + 2.75, D / 2 + .1, h); }
          else { const sh = mesh(new THREE.BoxGeometry(bw, 2.7, .08), shutter, bx, y0 + 1.35, D / 2 + .04, h); sh.material = shutter; }
        });
        const signCol = [0xc02020, 0x1a5aa0, 0xe8b020, 0x2a8a4a][seed % 4];
        mesh(new THREE.BoxGeometry(W - .4, .7, .12), std({ color: signCol, roughness: .5, emissive: signCol, emissiveIntensity: .15 }), 0, y0 + FH - .55, D / 2 + .1, h);
        mesh(new THREE.BoxGeometry(W + .4, .08, 1.6), steel, 0, y0 + FH - .1, D / 2 + .8, h);          // a metal awning over the shopfront
      } else if (f === 0) {   // a house: front door between two windows
        mesh(new THREE.BoxGeometry(1.1, 2.3, .1), std({ color: 0x7a4a2a, roughness: .6 }), 0, y0 + 1.15, D / 2 + .02, h);
        [-1, 1].forEach(sd => win(sd * (W / 4 + .3), y0 + 1.5, 1.4, 1.3, D / 2));
      } else {   // upper floors: a glass balcony door and windows, a concrete balcony with a steel railing
        win(-W / 4, y0 + 1.25, 1.3, 2.2, D / 2);
        win(W / 4, y0 + 1.6, 1.5, 1.3, D / 2);
        mesh(new THREE.BoxGeometry(W - .4, .16, 1.3), concrete, 0, y0 + .08, D / 2 + .65, h);
        mesh(new THREE.BoxGeometry(W - .4, .05, .06), steel, 0, y0 + 1.05, D / 2 + 1.27, h);
        for (let i = 0; i <= 16; i++) part(balusterGeo, steel, -W / 2 + .25 + i * (W - .5) / 16, y0 + .6, D / 2 + 1.27, h);
        if (r() < .7) { const ac = mesh(new THREE.BoxGeometry(.8, .55, .3), townFrame, W / 2 - .7, y0 + 2.3, D / 2 + .16, h); ac.castShadow = false; }
        if (r() < .5) for (let k = 0; k < 3; k++) part(plantGeo, leafMats[k % 4], -W / 2 + .6 + k * .5, y0 + .45, D / 2 + 1.0, h);   // potted plants
      }
    }
    const top = .25 + floors * FH;
    // a low-pitched gable roof of corrugated metal, ridge running across the front, with a deep overhang
    const pitch = .32, half = D / 2 + .8, len = half / Math.cos(pitch);
    [-1, 1].forEach(sd => {
      const p = mesh(new THREE.BoxGeometry(W + 1.0, .06, len), roof(W / 1.5), 0, top + Math.tan(pitch) * half / 2, sd * half / 2, h);
      p.rotation.x = sd * pitch;
    });
    mesh(new THREE.BoxGeometry(W + 1.05, .12, .2), steel, 0, top + Math.tan(pitch) * half + .02, 0, h);
    [-1, 1].forEach(sd => {   // the gable ends, painted like the walls
      const sh = new THREE.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(0, Math.tan(pitch) * D / 2); sh.closePath();
      const gab = mesh(new THREE.ShapeGeometry(sh), wall, sd * W / 2, top, 0, h); gab.rotation.y = sd * Math.PI / 2; gab.material.side = THREE.DoubleSide;
    });
    // a blue water tank on a steel stand beside the house, as on most houses in Shan towns
    if (r() < .75) {
      const tx = (r() < .5 ? -1 : 1) * (W / 2 - .7), tz = -D / 2 - .9, th = top - .4;
      [[-.45, -.45], [.45, -.45], [-.45, .45], [.45, .45]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(.08, th, .08), steel, tx + a, th / 2, tz + b, h));
      mesh(new THREE.BoxGeometry(1.1, .08, 1.1), steel, tx, th, tz, h);
      mesh(new THREE.CylinderGeometry(.5, .5, 1.1, 16), tank, tx, th + .6, tz, h);
      mesh(new THREE.CylinderGeometry(.18, .18, .08, 12), tank, tx, th + 1.18, tz, h);
    }
    // a low front wall with a sliding steel gate for houses
    if (!shop) {
      const fz = D / 2 + 2.0;
      [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(W / 2 - 1.2, .9, .2), wall, sd * (W / 4 + .6), .45, fz, h));
      mesh(new THREE.BoxGeometry(2.4, 1.1, .05), steel, 0, .55, fz, h);
    }
  }
  function shanTown(g) {
    const { roadX, roadW, z0, z1 } = TOWN, len = z1 - z0, mid = (z0 + z1) / 2;
    // asphalt with a dashed centre line and kerbed concrete pavements
    flat(mesh(new THREE.BoxGeometry(roadW, .04, len), std({ color: 0x2c2c2e, roughness: .95 }), roadX, .02, mid, g));
    const dash = new THREE.InstancedMesh(new THREE.BoxGeometry(.14, .02, 2.2), std({ color: 0xe8e4d8, roughness: .8 }), 20), m4 = new THREE.Matrix4();
    for (let i = 0; i < 20; i++) dash.setMatrixAt(i, m4.makeTranslation(roadX, .05, z0 + 2 + i * (len - 4) / 19));
    g.add(dash);
    [-1, 1].forEach(sd => {
      const px = roadX + sd * (roadW / 2 + .8);
      mesh(new THREE.BoxGeometry(1.6, .18, len), std({ color: 0x8a867e, roughness: .9 }), px, .09, mid, g);
      mesh(new THREE.BoxGeometry(.14, .2, len), std({ color: 0xb0aca2, roughness: .8 }), roadX + sd * roadW / 2, .1, mid, g);
    });
    // modern street lights on the east pavement, glowing at night
    for (let z = z0 + 4; z < z1 - 2; z += 12) {
      const x = roadX + roadW / 2 + 1.1;
      sCircle(g, x, z, .12);
      mesh(new THREE.CylinderGeometry(.07, .1, 5.2, 8), steel, x, 2.6, z, g);
      mesh(new THREE.BoxGeometry(1.6, .07, .07), steel, x - .8, 5.15, z, g);
      const head = mesh(new THREE.BoxGeometry(.5, .1, .25), std({ color: 0xf8f4e8, emissive: 0xfff2d0, emissiveIntensity: 1 }), x - 1.5, 5.08, z, g);
      const gl = glowSprite(0xfff0d0, 2.6, .7); gl.position.set(x - 1.5, 4.95, z); g.add(gl);
      onDaylight(d => { gl.material.opacity = .7 * (1 - d); head.material.emissiveIntensity = 1 - .8 * d; });
      poleLights.push({ x: x - 1.5, z, set: lit => { gl.material.opacity = lit ? .7 * (1 - daylight) : 0; head.material.emissiveIntensity = lit ? 1 - .8 * daylight : 0; } });
    }
    // a row of trees in the strip between the temple wall and the road
    for (let z = z0 + 8; z < z1 - 4; z += 9) (Math.round(z) % 2 ? pine : tree)(g, -35.3, z, .7, 70 + z | 0);
    // houses along the west side of the road, facing it
    const plots = [
      { W: 8, D: 7, floors: 2, shop: true, wall: 0, roof: 1 }, { W: 7, D: 7, floors: 2, shop: false, wall: 2, roof: 0 },
      { W: 9, D: 8, floors: 3, shop: true, wall: 3, roof: 2 }, { W: 7, D: 7, floors: 1, shop: false, wall: 4, roof: 3 },
      { W: 8, D: 7, floors: 2, shop: true, wall: 1, roof: 0 }, { W: 7, D: 7, floors: 2, shop: false, wall: 5, roof: 1 },
      { W: 8, D: 8, floors: 2, shop: true, wall: 2, roof: 2 }
    ];
    let z = z1 - 4;
    plots.forEach((p, i) => {
      const front = roadX - roadW / 2 - 1.6;
      shanHouse(g, front - p.D / 2 - 2.4, z - p.W / 2, Math.PI / 2, { ...p, wall: WALLS[p.wall], roof: ROOFS[p.roof], seed: i + 3 });
      z -= p.W + 2.2;
    });
    riverCrossing(g);
    paddyFields(g);
    mountainsAndForest(g);
  }
  // the town road carried over the stream on a modern concrete bridge, then on south between the fields
  const riverZ = x => -30 + Math.sin(x * .045) * 3.2 + Math.sin(x * .11 + 1) * 1.1;   // the stream's centre line (see stream())
  function riverCrossing(g) {
    const { roadX: X, roadW } = TOWN, zc = riverZ(X), DH = .9, half = 3.6, ramp = 2.6, BW = roadW + 2.2;
    const asphalt = std({ color: 0x2c2c2e, roughness: .95 }), conc = std({ color: 0xb4b0a8, roughness: .85 });
    const zN = zc + half, zS = zc - half;
    // the deck with a walkway each side, and ramps up from the road at both ends
    mesh(new THREE.BoxGeometry(BW, .35, half * 2), conc, X, DH - .175, zc, g);
    flat(mesh(new THREE.BoxGeometry(roadW, .04, half * 2), asphalt, X, DH + .02, zc, g));
    [[zN, 1], [zS, -1]].forEach(([z0, dir]) => {
      const len = Math.hypot(ramp, DH), a = Math.atan2(DH, ramp);
      const r = mesh(new THREE.BoxGeometry(BW, .3, len), conc, X, DH / 2 - .15, z0 + dir * ramp / 2, g); r.rotation.x = dir * a;
      const ra = flat(mesh(new THREE.BoxGeometry(roadW, .04, len), asphalt, X, DH / 2 + .02, z0 + dir * ramp / 2, g)); ra.rotation.x = dir * a;
    });
    // abutments on each bank and parapets: a low concrete wall with a steel rail along both edges
    [zN - .4, zS + .4].forEach(z => mesh(new THREE.BoxGeometry(BW + .4, DH, .8), conc, X, DH / 2 - .3, z, g));
    const steelR = std({ color: 0x5a5e62, roughness: .4, metalness: .7 });
    [-1, 1].forEach(sd => {
      const x = X + sd * (BW / 2 - .1);
      mesh(new THREE.BoxGeometry(.2, .55, half * 2), conc, x, DH + .27, zc, g);
      mesh(new THREE.BoxGeometry(.06, .06, half * 2), steelR, x, DH + .95, zc, g);
      for (let i = 0; i <= 8; i++) mesh(new THREE.BoxGeometry(.05, .45, .05), steelR, x, DH + .72, zN - i * half / 4, g);
      [-1, 1].forEach(e => { mesh(new THREE.BoxGeometry(.3, 1.1, .3), conc, x, DH + .5, zc + e * half, g); });   // end posts
    });
    // the road on from the bridge, south between the fields, with a dashed centre line
    const zA = zS - ramp, zB = -96;
    flat(mesh(new THREE.BoxGeometry(roadW, .04, zA - zB), asphalt, X, .02, (zA + zB) / 2, g));
    flat(mesh(new THREE.BoxGeometry(roadW, .04, -26 - (zN + ramp) + .1), asphalt, X, .02, (-26 + zN + ramp) / 2, g));   // up to the town road
    const n = Math.floor((zA - zB) / 5), dash = new THREE.InstancedMesh(new THREE.BoxGeometry(.14, .02, 2.2), std({ color: 0xe8e4d8, roughness: .8 }), n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) dash.setMatrixAt(i, m4.makeTranslation(X, .05, zA - 2.5 - i * 5));
    g.add(dash);
    [-1, 1].forEach(sd => flat(mesh(new THREE.BoxGeometry(1.2, .03, zA - zB), std({ color: 0x8a7a5e, roughness: 1 }), X + sd * (roadW / 2 + .6), .015, (zA + zB) / 2, g)));   // dirt verges
  }
  // rice paddies beyond the stream: plots edged with earth bunds, most golden at harvest, some still green,
  // a few flooded and newly planted; a farm track from the temple's arched bridge, and a bamboo field hut
  function paddyFields(g) {
    const r = rng(123), rice = (base, line) => {
      const t = canvasTex(64, (c, sz) => { c.fillStyle = base; c.fillRect(0, 0, sz, sz); c.fillStyle = line; for (let x = 0; x < sz; x += 8) c.fillRect(x, 0, 3, sz); });
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return std({ map: t, roughness: 1 });
    };
    const KINDS = [rice("#c8a23a", "#a8842a"), rice("#d4b048", "#b4902e"), rice("#6a9a3a", "#4e7e2a"), std({ color: 0x4a6a6e, roughness: .15, metalness: .3 })];
    const bund = std({ color: 0x7a6448, roughness: 1 });
    const PW = 11, PD = 8, X0 = -104, X1 = 64, Z0 = -42, Z1 = -94;
    const plotGeo = new THREE.PlaneGeometry(PW, PD), riceGeo = new THREE.BoxGeometry(PW - .3, .35, PD - .3);
    const bundGeoX = new THREE.BoxGeometry(PW + .6, .3, .5), bundGeoZ = new THREE.BoxGeometry(.5, .3, PD);
    for (let x = X0; x + PW <= X1; x += PW + .6) for (let z = Z0; z - PD >= Z1; z -= PD + .6) {
      const cx = x + PW / 2, cz = z - PD / 2;
      if (Math.abs(cx - TOWN.roadX) < PW / 2 + 4.5) continue;            // the road
      if (Math.abs(cx) < PW / 2 + 1.6) continue;                         // the farm track
      if (cz + PD / 2 > riverZ(cx) - 5) continue;                       // stay off the stream bank
      if (cx + PW / 2 > -40 && cx - PW / 2 < -12 && cz + PD / 2 > -67 && cz - PD / 2 < -42) continue;   // the fuel station
      const k = r() < .55 ? (r() < .5 ? 0 : 1) : r() < .7 ? 2 : 3;
      flat(part(plotGeo, KINDS[k], cx, .05, cz, g)).rotation.x = -Math.PI / 2;
      if (k < 3) {   // standing rice: a low layer of stalks above the mud
        flat(part(riceGeo, KINDS[k], cx, .22, cz, g));
      }
      [[0, PD / 2, bundGeoX], [0, -PD / 2, bundGeoX], [PW / 2, 0, bundGeoZ], [-PW / 2, 0, bundGeoZ]].forEach(([dx, dz, geo]) => flat(part(geo, bund, cx + dx, .15, cz + dz, g)));
    }
    // the farm track south from the arched bridge
    flat(mesh(new THREE.BoxGeometry(2.4, .04, -36 - Z1), std({ color: 0x8a7a5e, roughness: 1 }), 0, .03, (-36 + Z1) / 2, g));
    // a raised bamboo field hut with a thatched roof, where farmers rest at midday, beside the farm track
    const hut = new THREE.Group(); hut.position.set(6, 0, -62); g.add(hut);
    sRect(hut, -1.3, 1.3, -1.1, 1.1);
    const bamboo = std({ color: 0xb8a060, roughness: .8 }), thatch = std({ color: 0x9a8050, roughness: 1, flatShading: true });
    [[-1.2, -1], [1.2, -1], [-1.2, 1], [1.2, 1]].forEach(([x, z]) => mesh(new THREE.CylinderGeometry(.08, .1, 2.6, 6), bamboo, x, 1.3, z, hut));
    mesh(new THREE.BoxGeometry(2.8, .12, 2.4), bamboo, 0, .9, 0, hut);
    const roof = mesh(new THREE.ConeGeometry(2.6, 1.3, 4), thatch, 0, 3.1, 0, hut); roof.rotation.y = Math.PI / 4; roof.scale.set(1.15, 1, 1);
    for (let i = 0; i < 6; i++) mesh(new THREE.BoxGeometry(.5, .12, .14), bamboo, 0, .25 + i * .13, 1.3 + i * .05, hut);   // a ladder
    // a few palms and a bamboo clump at the field edges
    const palm = (x, z) => {
      const t = new THREE.Group(); t.position.set(x, 0, z); g.add(t);
      sCircle(t, 0, 0, .2);
      const trunk = mesh(new THREE.CylinderGeometry(.1, .16, 5, 7), std({ color: 0x7a6650, roughness: .9 }), 0, 2.5, 0, t); trunk.rotation.z = .08;
      for (let i = 0; i < 7; i++) { const f = mesh(new THREE.ConeGeometry(.35, 2.4, 3), leafMats[i % 4], 0, 4.9, 0, t); f.rotation.set(1.1, i / 7 * TAU, 0); f.translateY(1.1); f.scale.set(1, 1, .2); }
    };
    [[-60, -40], [-28, -42], [20, -41], [46, -44], [-80, -70], [30, -88]].forEach(([x, z]) => palm(x, z));
  }
  /* ---------- the seven-day market east of the compound, as in the towns of Northern Shan State: rows of tarp-roofed stalls,
     tents for games of chance (dice), and an open-air opera stage with benches in front; bulbs strung overhead light up at night.
     Scenery only: nothing here takes bets or payment. */
  let fourTop = null, MARKET = null;
  const bellRingers = [];   // ringing the bell in the outdoor Bell Tower   // the four-animal top game in the market, and the market's bounds, once built
  function sevenDayMarket(g) {
    const list = picks.pagoda, X0 = 43, X1 = 104, Z0 = -14, Z1 = 47.4, r = rng(321);
    MARKET = { x0: X0, x1: X1, z0: Z0, z1: Z1, entry: [68, 45], look: [68, 30] };
    const data = { tip: "The seven-day market", toast: "Every seventh day the market comes to the temple's east side: farmers, traders and families from the villages around, stalls of food and cloth, dice games and an opera that plays into the night." };
    const earth = std({ color: 0x8a7a62, roughness: 1 });
    onDaylight(d => earth.color.copy(lerpC(0x3a3228, 0x4e4234, d)));
    clickable(list, flat(mesh(new THREE.BoxGeometry(X1 - X0, .06, Z1 - Z0), earth, (X0 + X1) / 2, .03, (Z0 + Z1) / 2, g)), { market: true, tip: "Walk into the seven-day market" });
    const bambooM = std({ color: 0xb8a060, roughness: .8 }), wood = std({ color: 0x7a5a3a, roughness: .7 }), steelM = std({ color: 0x5a5e62, roughness: .4, metalness: .7 });
    const TARPS = [0x2a6ac0, 0xe0702a, 0x2f8a4a, 0xc02a2a, 0xe8c030, 0x8a3ab0].map(c => std({ color: c, roughness: .7, side: THREE.DoubleSide }));
    const GOODS = [0xc8402e, 0xf0881c, 0x8ab83a, 0xe8d050, 0x6a4a2a, 0xf4f0e4, 0x3a6ac0, 0xd04a8a].map(c => std({ color: c, roughness: .6 }));
    const bulbs = [];
    const bulb = (x, y, z, col = 0xffe0a0) => { const b = glowSprite(col, .9, .8); b.material.fog = false; b.position.set(x, y, z); g.add(b); bulbs.push(b); };
    const string = (a, b, n, sag) => { for (let i = 0; i <= n; i++) { const t = i / n; bulb(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t - Math.sin(Math.PI * t) * sag, a.z + (b.z - a.z) * t, [0xffe0a0, 0xff9a6a, 0xa0d0ff, 0xb0ffb0][i % 4]); } };
    // stalls: bamboo poles, a sloping tarp, a table of goods; a few use a big umbrella instead
    function stall(x, z, face) {
      const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = face; g.add(s);
      sRect(s, -1.6, 1.6, -1.3, 1.3);
      const W = 3.0, D = 2.4, tarp = TARPS[(r() * TARPS.length) | 0];
      if (r() < .2) {   // umbrella stall
        mesh(new THREE.CylinderGeometry(.04, .04, 2.6, 6), steelM, 0, 1.3, -.2, s);
        const um = mesh(new THREE.ConeGeometry(1.7, .6, 8, 1, true), tarp, 0, 2.7, -.2, s); um.castShadow = false;
      } else {
        [[-W / 2, -D / 2, 2.5], [W / 2, -D / 2, 2.5], [-W / 2, D / 2, 2.0], [W / 2, D / 2, 2.0]].forEach(([px, pz, h]) => mesh(new THREE.CylinderGeometry(.05, .06, h, 6), bambooM, px, h / 2, pz, s));
        const t = mesh(new THREE.BoxGeometry(W + .4, .04, D + .6), tarp, 0, 2.28, 0, s); t.rotation.x = .2; t.castShadow = false;
      }
      mesh(new THREE.BoxGeometry(W - .3, .08, D - .9), wood, 0, .8, .2, s);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(.06, .8, .06), wood, a * (W / 2 - .3), .4, .2 + b * (D / 2 - .55), s));
      const kind = (r() * 4) | 0;
      for (let i = 0; i < 9; i++) {
        const gx = -W / 2 + .45 + (i % 5) * .5, gz = (i < 5 ? .0 : .45) + .1, m = GOODS[(r() * GOODS.length) | 0];
        if (kind === 0) mesh(new THREE.SphereGeometry(.13, 10, 8), m, gx, .97, gz, s);                                 // fruit and vegetables
        else if (kind === 1) { const b = mesh(new THREE.CylinderGeometry(.2, .15, .18, 10), bambooM, gx, .93, gz, s); mesh(new THREE.SphereGeometry(.15, 8, 6), m, gx, 1.02, gz, s); }   // baskets of beans and spices
        else if (kind === 2) mesh(new THREE.BoxGeometry(.4, .1 + r() * .15, .35), m, gx, .9, gz, s);                // folded cloth and longyi
        else mesh(new THREE.BoxGeometry(.3, .25, .25), m, gx, .97, gz, s);                                           // packets and household goods
      }
      for (let k = 0; k < 2; k++) mesh(new THREE.CylinderGeometry(.18, .16, .4, 10), GOODS[(r() * GOODS.length) | 0], -W / 2 + .4 + k * .45, .2, -D / 2 + .5, s);   // sacks on the ground
    }
    const AISLES = [52, 68, 84], ZS = [18.6, 22.4, 26.2, 30, 33.8, 37.6, 41.4];
    AISLES.forEach(ax => ZS.forEach(z => { stall(ax - 3.2, z, Math.PI / 2); stall(ax + 3.2, z, -Math.PI / 2); }));
    AISLES.forEach(ax => [0, 1].forEach(sd => string(V(ax - 3, 2.6, ZS[0] - 1.5 + sd * 0), V(ax + 3, 2.6, ZS[0] - 1.5), 6, .2)));
    AISLES.forEach(ax => string(V(ax, 3.4, ZS[0] - 1.5), V(ax, 3.4, 44), 14, .5));
    // the gambling hall (ကစားဝိုင်း) on the market's east edge: a closed hall of painted plank walls under a corrugated roof, a wide
    // doorway onto the aisles with the sign above it, and inside only the four-animal top (လေးကောင်ဂျင်) on its mat, lit by bulbs
    const stool = std({ color: 0xc8302a, roughness: .5 }), stool2 = std({ color: 0x2a6ac0, roughness: .5 });
    const GX = 96, GZ = 8, GW = 12, GD = 14, GH = 3.6;   // centre, width (x), depth (z), wall height
    const tdata = { fourTop: true, tip: "လေးကောင်ဂျင် · the four-animal top · play with festival tokens" };
    const hall = new THREE.Group(); hall.position.set(GX, 0, GZ); g.add(hall);
    sCircle(hall, 0, 0, 1.25);                                         // the game and its stools
    sRect(hall, -GW / 2, GW / 2, -GD / 2 - .1, -GD / 2 + .1); sRect(hall, -GW / 2, GW / 2, GD / 2 - .1, GD / 2 + .1);
    sRect(hall, GW / 2 - .1, GW / 2 + .1, -GD / 2, GD / 2);
    sRect(hall, -GW / 2 - .1, -GW / 2 + .1, -GD / 2, -2.0); sRect(hall, -GW / 2 - .1, -GW / 2 + .1, 2.0, GD / 2);   // the doorway is |z| < 2
    sRect(hall, -GW / 2 - .3, GW / 2 + .3, -GD / 2 - .3, GD / 2 + .3, .25);   // the floor slab
    const plankT = canvasTex(128, (c, sz) => { c.fillStyle = "#2f6a5a"; c.fillRect(0, 0, sz, sz); for (let y = 0; y < sz; y += 12) { c.fillStyle = "rgba(10,30,24,.5)"; c.fillRect(0, y, sz, 2); c.fillStyle = "rgba(160,210,190,.12)"; c.fillRect(0, y + 3, sz, 3); } });
    plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping; plankT.repeat.set(4, 1.5);
    const wallM = std({ map: plankT, roughness: .8, side: THREE.DoubleSide }), trimW = std({ color: 0xf2eee4, roughness: .7 });
    mesh(new THREE.BoxGeometry(GW + .6, .25, GD + .6), std({ color: 0x8a867e, roughness: .9 }), 0, .125, 0, hall);   // concrete floor slab
    flat(mesh(new THREE.PlaneGeometry(GW - .3, GD - .3), std({ color: 0x9a6a3a, roughness: .7 }), 0, .26, 0, hall)).rotation.x = -Math.PI / 2;   // a wooden floor inside
    const DOOR = 4.0;   // the doorway in the west wall, facing the aisles
    [[0, -GD / 2, GW, .2], [0, GD / 2, GW, .2], [GW / 2, 0, .2, GD]].forEach(([x, z, w, d]) => mesh(new THREE.BoxGeometry(w, GH, d), wallM, x, GH / 2 + .25, z, hall));
    [-1, 1].forEach(sd => { const len = (GD - DOOR) / 2; mesh(new THREE.BoxGeometry(.2, GH, len), wallM, -GW / 2, GH / 2 + .25, sd * (DOOR / 2 + len / 2), hall); });
    mesh(new THREE.BoxGeometry(.2, .9, DOOR), wallM, -GW / 2, GH - .2, 0, hall);   // over the doorway
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.28, GH, .28), trimW, -GW / 2, GH / 2 + .25, sd * DOOR / 2, hall));
    // windows with green shutters folded open, high on the side walls
    [-1, 1].forEach(sd => [-3.5, 0, 3.5].forEach(x => { mesh(new THREE.BoxGeometry(1.3, 1.0, .25), trimW, x, 2.5, sd * GD / 2, hall); mesh(new THREE.BoxGeometry(1.1, .8, .26), std({ color: 0x1a0e08, emissive: 0xffc070, emissiveIntensity: .6 }), x, 2.5, sd * GD / 2, hall); }));
    // a low-pitched corrugated roof with deep eaves, ridge along x
    const hallRoofT = corrugated("#a83228", "#d0584a", "#7a2018"); hallRoofT.repeat.set(GW / 1.2, 1);
    const hallRoofM = std({ map: hallRoofT, roughness: .45, metalness: .45, side: THREE.DoubleSide });
    const half = GD / 2 + 1.2, pitch = .26, L = half / Math.cos(pitch), top = GH + .25;
    [-1, 1].forEach(sd => { const rp = mesh(new THREE.BoxGeometry(GW + 2, .08, L), hallRoofM, 0, top + Math.tan(pitch) * half / 2, sd * half / 2, hall); rp.rotation.x = sd * pitch; clickable(list, rp, tdata); });
    [-1, 1].forEach(sx => { const sh = new THREE.Shape(); sh.moveTo(-GD / 2, 0); sh.lineTo(GD / 2, 0); sh.lineTo(0, Math.tan(pitch) * GD / 2); sh.closePath(); const gb = mesh(new THREE.ShapeGeometry(sh), wallM, sx * GW / 2, top, 0, hall); gb.rotation.y = Math.PI / 2; });
    // the sign over the doorway
    const sign = writing(512, 160, (c, cw, ch) => {
      c.fillStyle = "#b81c1c"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#f2d27a"; c.lineWidth = 10; c.strokeRect(6, 6, cw - 12, ch - 12);
      c.fillStyle = "#fff4d0"; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = '600 58px "Noto Sans Myanmar", "Myanmar Text", sans-serif'; c.fillText("လေးကောင်ဂျင်", cw / 2, 58);
      c.font = '600 34px "Figtree", sans-serif'; c.fillText("Four-animal top · come in", cw / 2, 122);
    });
    if (document.fonts && document.fonts.load) document.fonts.load('600 58px "Noto Sans Myanmar"', "ဂျင်").then(() => { sign.needsUpdate = true; }, () => {});
    const sb = flat(mesh(new THREE.PlaneGeometry(3.4, 1.06), std({ map: sign, emissive: 0xffffff, emissiveMap: sign, emissiveIntensity: .45, roughness: .6, side: THREE.DoubleSide }), -GW / 2 - .14, GH + .9, 0, hall));
    sb.rotation.y = -Math.PI / 2; clickable(list, sb, tdata);
    // inside: the game on its mat in the middle, stools round it, bulbs overhead and a warm light day and night
    if (window.FourFaceTopGame) {
      fourTop = new FourFaceTopGame(g, V(GX, .27, GZ));
      fourTop.picks.forEach(m => clickable(list, m, tdata));
      updaters.pagoda.push(dt => fourTop.update(dt));
    }
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + .2; mesh(new THREE.CylinderGeometry(.2, .16, .32, 10), k % 2 ? stool : stool2, Math.cos(a) * 1.9, .42, Math.sin(a) * 1.9, hall); }
    [[-3, -4], [3, -4], [-3, 4], [3, 4], [0, 0]].forEach(([x, z]) => { mesh(new THREE.CylinderGeometry(.006, .006, .8, 4), steelM, x, GH - .15, z, hall); const b = glowSprite(0xfff0c8, .9, .9); b.material.fog = false; b.position.set(x, GH - .6, z); hall.add(b); });
    const inner = new THREE.PointLight(0xffd8a0, 1.6, 14, 2); inner.position.set(0, GH - .4, 0); hall.add(inner);
    hall.traverse(o => { if (o.isMesh && !o.userData.tip) clickable(list, o, tdata); });
    TALL.push({ x0: GX - GW / 2 - 1, x1: GX + GW / 2 + 1, z0: GZ - GD / 2 - 1, z1: GZ + GD / 2 + 1, h: GH + 3 });
    // the open-air opera: a raised stage under a metal roof, painted backdrop, red curtains, lights and loudspeakers,
    // with rows of benches for the audience in front
    const odata = { tip: "The open-air opera", toast: "On market nights a travelling troupe plays here until late: music, comedy and old stories under the lights, with families on the benches and mats in front." };
    const OX = 60, OZ = -4, SW = 13, SD = 6, SH = 1.3;
    const stageG = new THREE.Group(); stageG.position.set(OX, 0, OZ); g.add(stageG);
    sRect(stageG, -SW / 2 - .3, SW / 2 + 1.3, -SD / 2, SD / 2 + 1.5);
    clickable(list, mesh(new THREE.BoxGeometry(SW, SH, SD), wood, 0, SH / 2, 0, stageG), odata);
    mesh(new THREE.BoxGeometry(SW + .1, .3, .1), std({ color: 0xc02a2a, roughness: .6 }), 0, SH - .15, SD / 2 + .02, stageG);
    for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(2.4, SH - i * SH / 4, .35), wood, -SW / 2 + 1.6, (SH - i * SH / 4) / 2, SD / 2 + .2 + i * .35, stageG);
    const backdrop = canvasTex(512, (c, sz) => {
      const sky = c.createLinearGradient(0, 0, 0, sz); sky.addColorStop(0, "#2a4a8a"); sky.addColorStop(.6, "#e89a5a"); c.fillStyle = sky; c.fillRect(0, 0, sz, sz);
      c.fillStyle = "#4a6a4a"; c.beginPath(); c.moveTo(0, sz * .7); for (let x = 0; x <= sz; x += 32) c.lineTo(x, sz * (.55 + .12 * Math.sin(x / 50))); c.lineTo(sz, sz); c.lineTo(0, sz); c.fill();
      c.fillStyle = "#c8a040"; c.fillRect(sz * .38, sz * .42, sz * .24, sz * .3);                                       // a golden palace
      c.fillStyle = "#8a2a1a"; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(sz * (.35 + k * .02), sz * (.42 - k * .07)); c.lineTo(sz * .5, sz * (.32 - k * .07)); c.lineTo(sz * (.65 - k * .02), sz * (.42 - k * .07)); c.fill(); }
      c.fillStyle = "#f8f0c0"; c.beginPath(); c.arc(sz * .82, sz * .2, 26, 0, TAU); c.fill();
    });
    flat(mesh(new THREE.PlaneGeometry(SW - .4, 4.2), std({ map: backdrop, roughness: .8, emissive: 0x2a2a2a, emissiveMap: backdrop }), 0, SH + 2.1, -SD / 2 + .1, stageG));
    const curtain = std({ color: 0xa81818, roughness: .7, side: THREE.DoubleSide });
    [-1, 1].forEach(sd => { const cu = mesh(new THREE.BoxGeometry(1.5, 4.4, .15), curtain, sd * (SW / 2 - .75), SH + 2.2, SD / 2 - .4, stageG); });
    mesh(new THREE.BoxGeometry(SW, .8, .18), curtain, 0, SH + 4.1, SD / 2 - .35, stageG);
    mesh(new THREE.BoxGeometry(SW, .1, .2), M.trim, 0, SH + 3.7, SD / 2 - .25, stageG);
    [[-SW / 2, -SD / 2], [SW / 2, -SD / 2], [-SW / 2, SD / 2], [SW / 2, SD / 2]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(.18, SH + 5, .18), steelM, a, (SH + 5) / 2, b, stageG));
    const roofT = corrugated("#8a8c8e", "#c0c4c8", "#5e6064"); roofT.repeat.set(SW / 1.5, 1);
    const roofP = mesh(new THREE.BoxGeometry(SW + 1, .08, SD + 1.5), std({ map: roofT, roughness: .45, metalness: .45, side: THREE.DoubleSide }), 0, SH + 5.2, 0, stageG); roofP.rotation.x = -.12;
    mesh(new THREE.BoxGeometry(SW, .12, .12), steelM, 0, SH + 4.75, SD / 2 + .3, stageG);   // the lighting bar
    const spots = [];
    for (let k = 0; k < 6; k++) {
      const sx = -SW / 2 + 1.5 + k * (SW - 3) / 5, colr = [0xff6a4a, 0xffd060, 0x6ab0ff, 0xff70d0, 0x80ff9a, 0xffffff][k];
      mesh(new THREE.CylinderGeometry(.12, .18, .35, 10), std({ color: 0x1a1a1c, roughness: .4 }), sx, SH + 4.55, SD / 2 + .3, stageG).rotation.x = .9;
      const gl = glowSprite(colr, 1.2, .9); gl.material.fog = false; gl.position.set(sx, SH + 4.45, SD / 2 + .45); stageG.add(gl); spots.push(gl);
    }
    const stageLight = new THREE.SpotLight(0xffe0c0, 0, 22, .7, .5, 1); stageLight.position.set(0, SH + 4.5, SD / 2 + 4); stageLight.target.position.set(0, SH, -1); stageG.add(stageLight, stageLight.target);
    [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(.9, 2.2, .8), std({ color: 0x1a1a1c, roughness: .5 }), sd * (SW / 2 + .8), 1.1, SD / 2 - .4, stageG); [.5, 1.1, 1.7].forEach(y => mesh(new THREE.CylinderGeometry(.26, .26, .05, 16), steelM, sd * (SW / 2 + .8), y, SD / 2 + .02, stageG).rotation.x = Math.PI / 2); });
    // benches and mats for the audience
    for (let row = 0; row < 6; row++) for (let k = -1; k <= 1; k += 2) {
      const bz = OZ + SD / 2 + 3 + row * 1.6, bx = OX + k * 3.4;
      mesh(new THREE.BoxGeometry(5.6, .08, .4), wood, bx, .45, bz, g);
      [-2.4, 0, 2.4].forEach(dx => mesh(new THREE.BoxGeometry(.08, .45, .35), wood, bx + dx, .22, bz, g));
    }
    [[OX - 3.4, OZ + 15], [OX + 3.4, OZ + 15]].forEach(([x, z], i) => flat(mesh(new THREE.PlaneGeometry(5, 2.2), TARPS[i + 1], x, .07, z, g)).rotation.x = -Math.PI / 2);
    string(V(OX - SW / 2, SH + 5, OZ + SD / 2), V(X0 + 1, 3, OZ + 14), 10, .6);
    string(V(OX + SW / 2, SH + 5, OZ + SD / 2), V(X1 - 1, 3, OZ + 14), 10, .6);
    // the market's own entrance from the street: two posts with a banner of coloured bunting
    [49.5, 86.5].forEach(x => mesh(new THREE.CylinderGeometry(.12, .14, 5, 8), steelM, x, 2.5, 46.6, g));
    for (let i = 0; i < 40; i++) { const f = mesh(new THREE.ConeGeometry(.25, .5, 3), TARPS[i % TARPS.length], 50 + i * 36 / 40, 4.4 - Math.sin(Math.PI * i / 40) * .5, 46.6, g); f.rotation.x = Math.PI; f.castShadow = false; }
    const gateSign = writing(768, 160, (c, cw, ch) => {
      c.fillStyle = "#1f4f8a"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#f2d27a"; c.lineWidth = 10; c.strokeRect(6, 6, cw - 12, ch - 12);
      c.fillStyle = "#fff4d0"; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = '600 60px "Noto Sans Myanmar", "Myanmar Text", sans-serif'; c.fillText("ခုနစ်ရက်ဈေး", cw / 2, 60);
      c.font = '600 34px "Figtree", sans-serif'; c.fillText("Seven-day market", cw / 2, 124);
    });
    if (document.fonts && document.fonts.load) document.fonts.load('600 60px "Noto Sans Myanmar"', "ဈေး").then(() => { gateSign.needsUpdate = true; }, () => {});
    mesh(new THREE.BoxGeometry(37, .14, .14), steelM, 68, 4.95, 46.6, g);
    clickable(list, flat(mesh(new THREE.PlaneGeometry(5.6, 1.2), std({ map: gateSign, emissive: 0xffffff, emissiveMap: gateSign, emissiveIntensity: .4, roughness: .6, side: THREE.DoubleSide }), 68, 5.6, 46.7, g)), { market: true, tip: "Walk into the seven-day market" });
    onDaylight(d => {
      bulbs.forEach(b => b.material.opacity = .85 * (1 - d) + .1);
      spots.forEach(s => s.material.opacity = .9 * (1 - d) + .15);
      stageLight.intensity = 1.8 * (1 - d);
    });
  }
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
    return { cx: -88, cz: 140, top, rTop, rBase, prof, terraces, to: [-45, 61] };   // `to`: the street corner the stair faces
  })();
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
  const SURF = [], PAD = .35, MONASTERIES = [];   // PAD: a walker's own radius, in metres
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
  const MON = { W: 14, D: 11, SC: 1.8, run: 12 * .36 };   // larger than the terraces: the plinths run out over the slope
  MON.off = SW_ / 2 + .6 + 1.6 + MON.run * MON.SC + MON.D * MON.SC / 2;
  // the festival ground: an open field on the upper terrace across the stair from the monastery (local +x), in front of it
  function festivalSpot() {
    const t = HILL.terraces[0], rm = (t.r0 + t.r1) / 2;
    const a = (SW_ / 2 + .6 + 2 + 13) / rm;   // past the stair wall and a strip of grass, then half the field
    return { x: Math.sin(a) * rm, z: -Math.cos(a) * rm, ry: Math.atan2(Math.sin(a), -Math.cos(a)), y: t.y, R: 16, T: 26 };
  }
  function shanStupaHill(g) {
    const list = picks.pagoda, { cx, cz, top, rTop, rBase } = HILL;
    const tip = { tip: "The stupa hill · climb the stair to the Shan stupas" };
    // everything is built in the hill's own frame: centre at the origin, the stair coming up from local -z
    const dx = HILL.to[0] - cx, dz = HILL.to[1] - cz, dl = Math.hypot(dx, dz), dir = V(dx / dl, 0, dz / dl);
    const H = new THREE.Group(); H.position.set(cx, 0, cz); H.rotation.y = Math.atan2(-dir.x, -dir.z); g.add(H); H.updateMatrixWorld(true);
    HILL.group = H; HILL.stairW = SW_;
    // the hill: grass on the slopes, a paved terrace on top
    const grassTex = canvasTex(128, (c, sz) => { c.fillStyle = "#5a7a3a"; c.fillRect(0, 0, sz, sz); const r = rng(8); for (let i = 0; i < 700; i++) { const v = r(); c.fillStyle = v < .5 ? "rgba(40,70,30,.5)" : "rgba(120,150,70,.4)"; c.fillRect(r() * sz, r() * sz, 2, 3); } });
    grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping; grassTex.repeat.set(12, 3);
    const grass = std({ map: grassTex, roughness: 1 });
    onDaylight(d => grass.color.copy(lerpC(0x3a4a34, 0xffffff, d)));
    const prof = [[0, top + .02], [rTop - .4, top + .02], ...HILL.prof.slice(1).map(([rr, yy]) => [rr, yy - .08]), [rBase + 4, -.6]].reverse().map(([x, y]) => new THREE.Vector2(x, y));   // a little below the treads; outside in, so the faces point outward
    const hill = mesh(new THREE.LatheGeometry(prof, 72), grass, 0, 0, 0, H); hill.castShadow = false;
    clickable(list, hill, tip);
    const pave = canvasTex(256, (c, sz) => { c.fillStyle = "#cfc6b4"; c.fillRect(0, 0, sz, sz); for (let r = 0; r < 8; r++) for (let k = 0; k < 8; k++) { const v = 200 + ((r * 5 + k * 3) % 4) * 8; c.fillStyle = `rgb(${v},${v - 6},${v - 18})`; c.fillRect(k * 32 + 1, r * 32 + 1, 30, 30); } });
    pave.wrapS = pave.wrapT = THREE.RepeatWrapping; pave.repeat.set(7, 7);
    clickable(list, flat(mesh(new THREE.CircleGeometry(rTop - .6, 48), std({ map: pave, roughness: .85 }), 0, top + .04, 0, H)), tip).rotation.x = -Math.PI / 2;
    // the stair, from the foot (local z = -rBase) to the hilltop edge (local z = -rTop): flights and landings
    const SW = SW_, rise = top / (STAIR.flights * STAIR.steps), z0 = -rBase + STAIR.pad, DEEP = 1.8;
    const treads = [], line = [[-rBase, 0], [z0, 0]];   // `line`: the walking surface, for the lamps
    let seg = [[-rBase, 0], [z0, 0]];
    const segs = [seg];   // the side walls, broken open across the wide terraces so paths can lead off to the monasteries
    let z = z0, y = 0;
    for (let f = 0; f < STAIR.flights; f++) {
      for (let i = 0; i < STAIR.steps; i++) { y += rise; treads.push({ z, y, d: STAIR.tread }); z += STAIR.tread; }
      line.push([z, y]); seg.push([z, y]);
      if (f < STAIR.flights - 1) {
        const L = STAIR.landings[f];
        treads.push({ z, y, d: L, landing: true });
        if (L > 5) { seg.push([z + 1.2, y]); seg = [[z + L - 1.2, y]]; segs.push(seg); } else seg.push([z + L, y]);
        z += L; line.push([z, y]);
      }
    }
    line.push([-rTop + .5, top]); seg.push([-rTop + .5, top]);
    const stepMat = std({ color: 0xffffff, roughness: .85 }), whiteWash = std({ color: 0xf2eee4, roughness: .8 });
    const stairs = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), stepMat, treads.length), m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(), tc = new THREE.Color();
    treads.forEach((t, i) => {
      stairs.setMatrixAt(i, m4.compose(V(0, t.y - DEEP / 2, t.z + t.d / 2), q0, V(SW, DEEP, t.d + .01)));
      const k = t.landing ? .86 : .9 + ((i * 29) % 11) / 11 * .08; stairs.setColorAt(i, tc.setRGB(k, k * .97, k * .92));   // worn stone, landings darker
    });
    stairs.castShadow = true; stairs.receiveShadow = true; H.add(stairs); clickable(list, stairs, tip);
    // nosing lines: a thin darker edge on every step so the treads read clearly
    const nose = new THREE.InstancedMesh(new THREE.BoxGeometry(SW, .03, .04), std({ color: 0x9a9284, roughness: .9 }), treads.length);
    treads.forEach((t, i) => nose.setMatrixAt(i, m4.makeTranslation(0, t.y - .01, t.z + .02))); H.add(nose);
    // side walls that follow the flights and step level at the landings, a handrail coping on top
    const wallShape = (pl, h, below) => {
      const sh = new THREE.Shape();
      pl.forEach(([zz, yy], i) => i ? sh.lineTo(zz, yy + h) : sh.moveTo(zz, yy + h));
      for (let i = pl.length - 1; i >= 0; i--) sh.lineTo(pl[i][0], pl[i][1] - below);
      sh.closePath(); return sh;
    };
    [-1, 1].forEach(sd => {
      segs.forEach(pl => {
        const wg = new THREE.ExtrudeGeometry(wallShape(pl, .95, DEEP), { depth: .36, bevelEnabled: false }); wg.rotateY(-Math.PI / 2);
        mesh(wg, whiteWash, sd * (SW / 2 + (sd > 0 ? .36 : 0)), 0, 0, H);
        const cg = new THREE.ExtrudeGeometry(wallShape(pl, 1.07, -.95), { depth: .5, bevelEnabled: false }); cg.rotateY(-Math.PI / 2);
        mesh(cg, M.trim, sd * (SW / 2 + (sd > 0 ? .43 : -.07)), 0, 0, H);
      });
      line.forEach(([zz, yy], i) => { if (i < 2 || i % 2) return;   // a lamp post at every landing
        const x = sd * (SW / 2 + .18);
        mesh(new THREE.BoxGeometry(.3, .6, .3), whiteWash, x, yy + 1.3, zz, H);
        const gl = glowSprite(0xffd8a0, 1.1, .8); gl.material.fog = false; gl.position.set(x, yy + 1.7, zz); H.add(gl);
        onDaylight(d => gl.material.opacity = .85 * (1 - d) + .05);
      });
    });
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
      if (Math.hypot(x, zz) > rTop - 1.6) continue;
      spots.push({ x, y: top, z: zz, s: .55 + r() * .35, ry: [0, Math.PI / 2][(r() * 2) | 0] });
      sCircle(H, x, zz, 1.15 * spots[spots.length - 1].s);
    }
    [-1, 1].forEach(sd => spots.push({ x: sd * (SW / 2 + .9), y: 2.4, z: -rBase - .2, s: .32, ry: 0 }));   // on the entrance pillars
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
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.9, 2.4, .9), whiteWash, sd * (SW / 2 + .9), 1.2, -rBase - .2, H));
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
    MS.traverse(o => { if (o.isMesh) { o.castShadow = true; clickable(list, o, { tip: "The main stupa on the hill" }); } });
    const flood = new THREE.SpotLight(0xffe0b0, 0, 40, .5, .6, 1); flood.position.set(0, 4, -16); flood.target.position.set(0, 8, 0); MS.add(flood, flood.target);
    onDaylight(d => flood.intensity = 2.4 * (1 - d));
    // topiary and flowering shrubs along the path on top, pines on the slopes clear of the stair
    const topi = std({ color: 0x2f5a26, roughness: .9, flatShading: true }), bloom = std({ color: 0xc8405a, roughness: .8, flatShading: true });
    for (let zz = -rTop + 1.5; zz < -7; zz += 2.2) [-1, 1].forEach(sd => {
      const x = sd * 1.9;
      sCircle(H, x, zz, .5);
      mesh(new THREE.CylinderGeometry(.08, .12, 1.2, 6), bark, x, top + .6, zz, H);
      const c = mesh(new THREE.IcosahedronGeometry(.75, 1), topi, x, top + 1.7, zz, H); c.scale.set(1, 1.25, 1);
      mesh(new THREE.IcosahedronGeometry(.35, 0), bloom, x + sd * .7, top + .3, zz + 1.1, H);
    });
    let seed = 400;
    for (let i = 0; i < 32; i++) {
      const a = i / 32 * TAU + .1, rr = rTop + 6 + (i % 4) * 8, x = Math.sin(a) * rr, zz = Math.cos(a) * rr;
      if (Math.abs(x) < 30 && zz < 0) continue;   // keep the stair and the monastery terraces clear
      { const f = festivalSpot(); if (Math.hypot(x - f.x, zz - f.z) < 20) continue; }   // and the festival ground
      const t = pine(H, x, zz, .9, seed++); t.position.y = groundAt(cx + rr, cz) - .1;
    }
  }
  /* ---------- Shan teak monasteries (kyaung) beside the stupa hill, after Shwe Yan Pyay: a hall raised on rows of teak posts,
     dark plank walls with oval windows framed in white, a verandah railing, tiered gable roofs of rusty corrugated iron with carved
     gable ends and flame finials, a many-tiered pyatthat tower over the shrine room, and a white masonry stair with spiky walls ---------- */
  function shanMonasteries(g) {
    const list = picks.pagoda;
    const plank = canvasTex(128, (c, sz) => { c.fillStyle = "#43200f"; c.fillRect(0, 0, sz, sz); for (let x = 0; x < sz; x += 10) { c.fillStyle = "rgba(15,6,2,.6)"; c.fillRect(x, 0, 2, sz); c.fillStyle = "rgba(120,70,40,.16)"; c.fillRect(x + 3, 0, 3, sz); } });
    plank.wrapS = plank.wrapT = THREE.RepeatWrapping; plank.repeat.set(4, 1);
    const teak = std({ map: plank, roughness: .7 }), teakDark = std({ color: 0x2e140a, roughness: .65 });
    const roofTex = corrugated("#6a3a24", "#8e5838", "#40200f"); roofTex.repeat.set(10, 1);
    const roofM = std({ map: roofTex, roughness: .5, metalness: .35, side: THREE.DoubleSide });
    const white = std({ color: 0xf2eee4, roughness: .8 }), frameW = std({ color: 0xf4f0e6, roughness: .6 });
    const pane = std({ color: 0x1a0e08, roughness: .4, emissive: 0xffb060, emissiveIntensity: 0 });
    onDaylight(d => pane.emissiveIntensity = .8 * (1 - d));
    const flame = new THREE.ConeGeometry(.12, .7, 4);
    // carved gable fretwork: rows of little pointed arches and scrolls in old gilt on dark teak, a sunburst roundel in the middle
    const carved = canvasTex(512, (c, sz) => {
      c.fillStyle = "#24100a"; c.fillRect(0, 0, sz, sz);
      c.strokeStyle = "#b8893c"; c.lineWidth = 3;
      for (let row = 0; row < 9; row++) for (let k = 0; k < 14; k++) {
        const x = k * 38 + (row % 2) * 19, y = sz - row * 52 - 10;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 4, y - 30, x + 17, y - 42); c.quadraticCurveTo(x + 30, y - 30, x + 34, y); c.stroke();
        c.beginPath(); c.arc(x + 17, y - 14, 6, 0, TAU); c.stroke();
      }
      c.fillStyle = "#24100a"; c.beginPath(); c.arc(sz / 2, sz * .58, 78, 0, TAU); c.fill();
      c.strokeStyle = "#d8a84a"; c.lineWidth = 5; c.beginPath(); c.arc(sz / 2, sz * .58, 70, 0, TAU); c.stroke();
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; c.beginPath(); c.moveTo(sz / 2 + Math.cos(a) * 22, sz * .58 + Math.sin(a) * 22); c.lineTo(sz / 2 + Math.cos(a) * 62, sz * .58 + Math.sin(a) * 62); c.stroke(); }
      c.fillStyle = "#d8a84a"; c.beginPath(); c.arc(sz / 2, sz * .58, 18, 0, TAU); c.fill();
    });
    const gableMat = (w, h) => { const t = carved.clone(); t.needsUpdate = true; t.repeat.set(1 / w, 1 / h); t.offset.set(.5, 0); return std({ map: t, roughness: .7, metalness: .1 }); };
    // a gable roof with its ridge along local z: slopes, carved gable ends front and back, flame finials up the gable edges
    function gable(G, cx, y, cz, w, d, h) {
      const hw = w / 2, L = Math.hypot(hw, h) + .5, a = Math.atan2(h, hw);
      [-1, 1].forEach(sd => { const sl = mesh(new THREE.BoxGeometry(L, .1, d), roofM, cx + sd * (hw / 2), y + h / 2, cz, G); sl.rotation.z = -sd * a; });
      mesh(new THREE.BoxGeometry(.25, .25, d + .2), roofM, cx, y + h + .05, cz, G);
      const tri = new THREE.Shape(); tri.moveTo(-hw + .3, 0); tri.lineTo(hw - .3, 0); tri.lineTo(0, h - .1); tri.closePath();
      [-1, 1].forEach(e => {
        const z = cz + e * (d / 2 - .05), panel = mesh(new THREE.ExtrudeGeometry(tri, { depth: .12, bevelEnabled: false }), [gableMat(w, h), teakDark], cx, y, z - (e > 0 ? .12 : 0), G);
        // gold trim along the gable edges and flame finials rising from them
        [-1, 1].forEach(sd => {
          const tr = mesh(new THREE.BoxGeometry(Math.hypot(hw, h), .1, .16), M.gold, cx + sd * hw / 2, y + h / 2 + .06, z + e * .05, G); tr.rotation.z = -sd * a;
          for (let k = 1; k <= 5; k++) { const t = k / 6, f = mesh(flame, teakDark, cx + sd * hw * (1 - t), y + h * t + .4, z + e * .06, G); f.rotation.z = -sd * .5; }
        });
        mesh(new THREE.ConeGeometry(.16, 1.4, 6), M.gold, cx, y + h + .8, z, G);
      });
    }
    // a pyatthat: stacked shrinking tiers of little hipped roofs over the shrine room, crowned by a gold spire
    function pyatthat(G, cx, y, cz, s0, tiers) {
      for (let k = 0; k < tiers; k++) {
        const s = s0 * (1 - k * .17);
        mesh(new THREE.BoxGeometry(s * .62, .55, s * .62), teak, cx, y + .27, cz, G);
        const r = mesh(new THREE.ConeGeometry(s * .74, 1.0, 4, 1, true), roofM, cx, y + .55 + .5, cz, G); r.rotation.y = Math.PI / 4;
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([a, b]) => { const f = mesh(flame, teakDark, cx + a * s * .45, y + 1.05, cz + b * s * .45, G); f.scale.setScalar(1.3); });
        y += 1.35;
      }
      mesh(new THREE.CylinderGeometry(.2, .3, .5, 8), teakDark, cx, y + .25, cz, G);
      mesh(new THREE.ConeGeometry(.28, 2.6, 8), M.gold, cx, y + 1.7, cz, G);
      mesh(new THREE.CylinderGeometry(.015, .015, 1.0, 4), M.gold, cx, y + 3.4, cz, G);
    }
    function kyaung(x, z, ry, W, D, tower, parent = g, y0 = 0, sc = 1) {
      const G = new THREE.Group(); G.position.set(x, y0, z); G.rotation.y = ry; G.scale.setScalar(sc); parent.add(G);
      if (y0) mesh(new THREE.BoxGeometry(W + 1.4, 6, D + 1.4), std({ color: 0x8c877d, roughness: .85 }), 0, -3, 0, G);   // a stone plinth levelling the slope
      const FH = 2.4, WH = 3.4, IW = W - 3, ID = D - 3;   // floor height, wall height, the hall inside the verandah
      {   // walkable: up the white stair onto the verandah that runs round the hall; the hall's walls and the stilts block
        const n = 12, run = n * .36, SWd = 3.0;
        sRect(G, -IW / 2 - .4, IW / 2 + .4, -ID / 2 - .4, ID / 2 + .4);   // stop a step short of the hall walls
        sRect(G, -SWd / 2 + .1, SWd / 2 - .1, D / 2, D / 2 + run, (lx, lz) => FH * (1 - (lz - D / 2) / run));
        sRect(G, -W / 2 + .1, W / 2 - .1, -D / 2 + .1, D / 2 - .1, (lx, lz) => Math.abs(lx) < SWd / 2 - .1 || Math.abs(lz) < D / 2 - .35 && Math.abs(lx) < W / 2 - .35 ? FH : null);   // the verandah, with its railing round the edge
      }
      // the stilts: rows of teak posts on whitewashed footings
      const posts = [];
      for (let px = -W / 2 + .4; px <= W / 2 - .39; px += (W - .8) / Math.round((W - .8) / 2)) for (let pz = -D / 2 + .4; pz <= D / 2 - .39; pz += (D - .8) / Math.round((D - .8) / 2)) posts.push([px, pz]);
      const post = new THREE.InstancedMesh(new THREE.CylinderGeometry(.17, .2, FH, 8), teakDark, posts.length), foot = new THREE.InstancedMesh(new THREE.BoxGeometry(.5, .25, .5), white, posts.length), m4 = new THREE.Matrix4();
      posts.forEach(([px, pz], i) => { post.setMatrixAt(i, m4.makeTranslation(px, FH / 2, pz)); foot.setMatrixAt(i, m4.makeTranslation(px, .12, pz)); });
      G.add(post, foot); post.castShadow = true;
      mesh(new THREE.BoxGeometry(W, .3, D), teakDark, 0, FH, 0, G);
      // the hall: plank walls, oval windows framed in white on the front and sides
      const walls = mesh(new THREE.BoxGeometry(IW, WH, ID), teak, 0, FH + WH / 2, 0, G);
      const oval = (wx, wz, ry2) => {
        const o = new THREE.Group(); o.position.set(wx, FH + WH * .5, wz); o.rotation.y = ry2; G.add(o);
        const p = mesh(new THREE.CircleGeometry(.5, 24), pane, 0, 0, .02, o); p.scale.y = 1.5;
        const f = mesh(new THREE.TorusGeometry(.5, .08, 6, 24), frameW, 0, 0, .04, o); f.scale.y = 1.5;
      };
      const nF = Math.max(3, Math.round(IW / 2.6)); for (let i = 0; i < nF; i++) { const wx = -IW / 2 + (i + .5) * IW / nF; if (Math.abs(wx) > .9) oval(wx, ID / 2, 0); }
      const nS = Math.max(2, Math.round(ID / 2.6)); for (let i = 0; i < nS; i++) [-1, 1].forEach(sd => oval(sd * IW / 2, -ID / 2 + (i + .5) * ID / nS, sd * Math.PI / 2));
      mesh(new THREE.BoxGeometry(1.4, 2.4, .1), teakDark, 0, FH + 1.2, ID / 2 + .03, G);   // the door
      // the verandah railing round the platform edge, open where the stair arrives
      const rail = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), teakDark, 400); let k = 0;
      const put = (px, py, pz, a, b, c) => rail.setMatrixAt(k++, m4.compose(V(px, py, pz), new THREE.Quaternion(), V(a, b, c)));
      [[-1, 0], [1, 0]].forEach(([sd]) => { put(sd * (W / 2 - .05), FH + .95, 0, .08, .08, D); for (let i = 0; i <= D / .4; i++) put(sd * (W / 2 - .05), FH + .55, -D / 2 + i * .4, .05, .8, .05); });
      [-1, 1].forEach(sd => { const x0 = sd > 0 ? 1.8 : -W / 2, x1 = sd > 0 ? W / 2 : -1.8; put((x0 + x1) / 2, FH + .95, D / 2 - .05, x1 - x0, .08, .08); for (let i = 0; i <= (x1 - x0) / .4; i++) put(x0 + i * .4, FH + .55, D / 2 - .05, .05, .8, .05); });
      put(0, FH + .95, -D / 2 + .05, W, .08, .08);
      rail.count = k; G.add(rail);
      // a skirt roof over the front verandah, then the main roofs: twin gables on a wide hall, one gable on a small one
      const yR = FH + WH;
      const skirt = mesh(new THREE.BoxGeometry(W + .8, .08, 2.4), roofM, 0, yR - .55, ID / 2 + 1.0, G); skirt.rotation.x = .38;
      const halls = W > 16 ? [-IW / 4, IW / 4] : [0], hw = IW / halls.length + 1.4;
      halls.forEach((cx, i) => {
        gable(G, cx, yR, 0, hw, ID + 2.4, hw * .42);
        if (i === 0) {   // a second, smaller tier raised over the first hall
          mesh(new THREE.BoxGeometry(hw * .5, 1.3, ID * .55), teak, cx, yR + hw * .3, 0, G);
          gable(G, cx, yR + hw * .3 + .6, 0, hw * .62, ID * .66, hw * .3);
        }
      });
      if (tower) pyatthat(G, halls[halls.length - 1], yR + hw * .25, -ID * .1, 4.6, 5);
      // the white masonry stair down from the verandah, its walls topped with little spikes
      const n = 12, rise = FH / n, tread = .36, SWd = 3.0;
      for (let i = 0; i < n; i++) { const y1 = FH - i * rise; mesh(new THREE.BoxGeometry(SWd, y1, tread), white, 0, y1 / 2, D / 2 + i * tread + tread / 2, G); }
      const run = n * tread, wall = new THREE.Shape(); wall.moveTo(D / 2 - .2, 0); wall.lineTo(D / 2 - .2, FH + .9); wall.lineTo(D / 2 + run, .9); wall.lineTo(D / 2 + run + .4, .9); wall.lineTo(D / 2 + run + .4, 0); wall.closePath();
      [-1, 1].forEach(sd => {
        const wg = new THREE.ExtrudeGeometry(wall, { depth: .4, bevelEnabled: false }); wg.rotateY(-Math.PI / 2);
        mesh(wg, white, sd * (SWd / 2 + (sd > 0 ? .4 : 0)), 0, 0, G);
        for (let i = 0; i <= 10; i++) { const t = i / 10, zz = D / 2 - .2 + t * (run + .6), yy = t < run / (run + .6) ? FH + .9 - (FH) * (t * (run + .6) / run) : .9; const c = mesh(new THREE.ConeGeometry(.16, .55, 4), white, sd * (SWd / 2 + .2), yy + .27, zz, G); c.rotation.y = Math.PI / 4; }
      });
      G.traverse(o => { if (o.isMesh) clickable(list, o, { tip: "A Shan teak monastery · ကျောင်း" }); });
      // keep the outside camera above it
      G.updateMatrixWorld(true);
      MONASTERIES.push({ G, W, D, run, foot: G.localToWorld(V(0, 0, D / 2 + run + 1.5)), door: G.localToWorld(V(0, 0, 0)) });
      const xs = [], zs = [];
      [[-W / 2 - 1, -D / 2 - 1], [W / 2 + 1, -D / 2 - 1], [-W / 2 - 1, D / 2 + run + 1], [W / 2 + 1, D / 2 + run + 1]].forEach(([lx, lz]) => { const w = G.localToWorld(V(lx, 0, lz)); xs.push(w.x); zs.push(w.z); });
      TALL.push({ x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), h: y0 + (tower ? 22 : 14) * sc });
    }
    // the monasteries stand on the hill itself, on the two wide terraces of the stair: a pair on each terrace, one either side of
    // the stair and both facing it, so each pair faces the other across the stair on the way up to the stupas
    const H = HILL.group, { W: Wm, D: Dm, SC, run, off } = MON;
    // a single monastery, on the upper terrace to the right of the stair (as seen from its foot), facing the stair, with its pyatthat;
    // the rest of the hill is left open for later buildings
    const t = HILL.terraces[0], sd = -1;
    const rm = (t.r0 + t.r1) / 2, zc = -Math.sqrt(rm * rm - off * off), footX = off - (Dm / 2 + run) * SC;
    kyaung(sd * off, zc, -sd * Math.PI / 2, Wm, Dm, true, H, t.y, SC);
    flat(mesh(new THREE.BoxGeometry(footX - HILL.stairW / 2 + .4, .05, 2.6), M.stone, sd * (HILL.stairW / 2 + (footX - HILL.stairW / 2) / 2), t.y + .03, zc, H));   // a path from the landing
    festivalGround(H);
  }
  /* ---------- the festival ground (ပွဲခင်း) in front of the monastery, across the stair: a level grass plain held up by a stone retaining
     wall, ringed with Shan flags; a tall prayer-flag pole crowned by a hamsa at its centre, an open teak pavilion stage for Shan dance
     and music, kahtein money trees for the robe-offering, a row of tall bamboo poles for the hot-air balloons, and strings of lanterns ---------- */
  function festivalGround(H) {
    const list = picks.pagoda, f = festivalSpot(), { R, T } = f;   // R: radial depth (local z), T: width along the terrace (local x)
    const G = new THREE.Group(); G.position.set(f.x, f.y, f.z); G.rotation.y = f.ry; H.add(G);
    const data = { tip: "The festival ground · ပွဲခင်း", toast: "On full-moon festivals the monasteries fill this ground: Shan dancers and the long drum on the pavilion stage, kahtein trees hung with offerings for the monks, and fire balloons rising from the poles at night." };
    // the plain: grass on a stone platform whose wall shows on the downhill side
    const grassT = canvasTex(128, (c, sz) => { c.fillStyle = "#6a8a3e"; c.fillRect(0, 0, sz, sz); const r = rng(31); for (let i = 0; i < 600; i++) { c.fillStyle = r() < .5 ? "rgba(50,80,30,.45)" : "rgba(140,170,80,.35)"; c.fillRect(r() * sz, r() * sz, 2, 3); } });
    grassT.wrapS = grassT.wrapT = THREE.RepeatWrapping; grassT.repeat.set(T / 6, R / 6);
    const grass = std({ map: grassT, roughness: 1 }); onDaylight(d => grass.color.copy(lerpC(0x3a4a34, 0xffffff, d)));
    const wallM = std({ color: 0x8c877d, roughness: .85 });
    mesh(new THREE.BoxGeometry(T, 4, R), [wallM, wallM, grass, wallM, wallM, wallM], 0, -2 + .05, 0, G);
    clickable(list, G.children[G.children.length - 1], data);
    mesh(new THREE.BoxGeometry(T + .4, .25, .4), M.trim, 0, .1, R / 2, G);   // a gilt coping on the downhill edge
    // Shan flags round the edge: yellow, green and red bands with a white disc
    const flagT = canvasTex(64, (c, sz) => { ["#f2c230", "#2f8a4a", "#c02a2a"].forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * sz / 3, sz, sz / 3 + 1); }); c.fillStyle = "#fff"; c.beginPath(); c.arc(sz / 2, sz / 2, sz / 5, 0, TAU); c.fill(); });
    const flagM = std({ map: flagT, roughness: .7, side: THREE.DoubleSide }), poleM = std({ color: 0xc8b088, roughness: .7 });
    const flags = [];
    for (let i = 0; i < 18; i++) {
      const t = i / 18, onLong = i < 12, x = onLong ? -T / 2 + 1 + (i % 6) * (T - 2) / 5 : (i < 15 ? -T / 2 + .6 : T / 2 - .6), z = onLong ? (i < 6 ? -R / 2 + .6 : R / 2 - .6) : -R / 2 + 3 + ((i - 12) % 3) * (R - 6) / 2;
      mesh(new THREE.CylinderGeometry(.04, .05, 4, 6), poleM, x, 2, z, G);
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .65, 6, 1), flagM); fl.geometry.translate(.5, 0, 0); fl.position.set(x, 3.6, z); G.add(fl); flags.push(fl);
    }
    // the prayer-flag pole (တံခွန်တိုင်) at the centre, crowned by a golden hamsa, with a long streamer
    mesh(new THREE.CylinderGeometry(.9, 1.1, .6, 8), std({ color: 0xf2eee4, roughness: .8 }), 0, .3, 0, G);
    mesh(new THREE.CylinderGeometry(.08, .14, 14, 10), std({ color: 0xc02a2a, roughness: .5 }), 0, 7, 0, G);
    const hamsa = new THREE.Group(); hamsa.position.set(0, 14.4, 0); G.add(hamsa);
    mesh(new THREE.SphereGeometry(.35, 12, 8), M.gold, 0, 0, 0, hamsa).scale.set(1, .7, 1.6);
    mesh(new THREE.CylinderGeometry(.06, .1, .7, 8), M.gold, 0, .35, .45, hamsa).rotation.x = -.5;
    mesh(new THREE.ConeGeometry(.12, .3, 8), M.gold, 0, .7, .7, hamsa).rotation.x = Math.PI / 2;
    mesh(new THREE.ConeGeometry(.3, .8, 8), M.gold, 0, .15, -.6, hamsa).rotation.x = -Math.PI / 2 - .4;
    const streamer = new THREE.Mesh(new THREE.PlaneGeometry(.5, 9, 1, 12), std({ color: 0xf2e8c8, roughness: .8, side: THREE.DoubleSide }));
    streamer.geometry.translate(0, -4.5, 0); streamer.position.set(.1, 13.6, 0); G.add(streamer);
    // the pavilion stage (မဏ္ဍပ်): teak posts, a raised floor, a two-tier gable roof like the monasteries', at the uphill side
    const teak = std({ color: 0x43200f, roughness: .7 }), roofT = corrugated("#6a3a24", "#8e5838", "#40200f"); roofT.repeat.set(6, 1);
    const roofM = std({ map: roofT, roughness: .5, metalness: .35, side: THREE.DoubleSide });
    const PZ = -R / 2 + 3.6, PW = 9, PD = 5.5;
    sRect(G, -PW / 2, PW / 2, PZ - PD / 2, PZ + PD / 2 + 1.3); sCircle(G, 0, 0, 1.1); [-8, -4, 4, 8].forEach(x => sCircle(G, x, R / 2 - 3, 1.1));
    mesh(new THREE.BoxGeometry(PW, 1.0, PD), teak, 0, .5, PZ, G);
    for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(2.4, 1 - i * .25, .3), teak, 0, (1 - i * .25) / 2, PZ + PD / 2 + .15 + i * .3, G);
    [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1]].forEach(([a, b]) => mesh(new THREE.CylinderGeometry(.13, .15, 3.6, 8), teak, a * (PW / 2 - .3), 2.8, PZ + b * (PD / 2 - .3), G));
    [[PW + 1.2, 1.6, 4.6], [PW * .6, 1.1, 6.2]].forEach(([w, h, y]) => [-1, 1].forEach(sd => {
      const L = Math.hypot(PD / 2 + .8, h), sl = mesh(new THREE.BoxGeometry(w, .08, L), roofM, 0, y + h / 2, PZ + sd * (PD / 2 + .8) / 2, G); sl.rotation.x = sd * Math.atan2(h, PD / 2 + .8);
    }));
    mesh(new THREE.BoxGeometry(PW * .62, 1.0, PD * .7), teak, 0, 5.9, PZ, G);
    mesh(new THREE.ConeGeometry(.2, 1.4, 6), M.gold, 0, 8.1, PZ, G);
    // on the stage: the Shan long drum (ကော) on its stand, a pair of gongs, and a kinnari costume on a frame
    const drum = mesh(new THREE.CylinderGeometry(.35, .22, 2.4, 14), std({ color: 0xc02a2a, roughness: .5 }), -2.4, 1.6, PZ, G); drum.rotation.z = Math.PI / 2 - .25;
    [-.8, 0, .8].forEach(dx => mesh(new THREE.TorusGeometry(.3, .07, 8, 20), M.gold, dx, 2.0, PZ - 1.6, G));
    const kin = new THREE.Group(); kin.position.set(2.4, 1.0, PZ); G.add(kin);
    mesh(new THREE.ConeGeometry(.45, 1.4, 10), M.gold, 0, .7, 0, kin);
    [-1, 1].forEach(sd => { const w = mesh(new THREE.ConeGeometry(.5, 1.6, 4), std({ color: 0xe8c040, roughness: .5, side: THREE.DoubleSide }), sd * .6, 1.4, -.1, kin); w.rotation.z = -sd * 1.0; w.scale.z = .15; });
    mesh(new THREE.ConeGeometry(.2, .7, 8), M.gold, 0, 1.9, 0, kin);
    // kahtein trees (ကထိန်ပဒေသာပင်): bamboo frames hung with folded money, robes and offerings, along the downhill side
    const kah = [0xf2c230, 0xe0702a, 0xd8a840, 0xf4f0e4, 0xc02a2a].map(c => std({ color: c, roughness: .6, side: THREE.DoubleSide }));
    [-8, -4, 4, 8].forEach((x, i) => {
      const z = R / 2 - 3, t = new THREE.Group(); t.position.set(x, 0, z); G.add(t);
      mesh(new THREE.CylinderGeometry(.06, .08, 3.6, 6), poleM, 0, 1.8, 0, t);
      for (let k = 0; k < 5; k++) { const y = 1.4 + k * .45, r = 1.0 - k * .17; for (let j = 0; j < 8; j++) { const a = j / 8 * TAU + k; const leaf = mesh(new THREE.PlaneGeometry(.3, .4), kah[(i + j + k) % kah.length], Math.cos(a) * r, y, Math.sin(a) * r, t); leaf.rotation.y = -a; } }
      mesh(new THREE.BoxGeometry(.7, .35, .5), std({ color: 0xd88a1e, roughness: .6 }), 0, .18, 0, t);   // a folded monk's robe at the foot
    });
    // tall bamboo poles at the far end for launching the fire balloons, and a paper balloon resting by them
    [T / 2 - 4.5, T / 2 - 2].forEach(x => mesh(new THREE.CylinderGeometry(.07, .1, 9, 6), poleM, x, 4.5, -R / 2 + 3, G));
    mesh(new THREE.BoxGeometry(2.6, .08, .08), poleM, T / 2 - 3.25, 8.8, -R / 2 + 3, G);
    const balloon = mesh(new THREE.SphereGeometry(1.4, 16, 12), std({ color: 0xe8a040, roughness: .8, emissive: 0xff8a30, emissiveIntensity: 0 }), T / 2 - 3.25, 6.6, -R / 2 + 3, G);
    balloon.scale.y = 1.4;
    // strings of lanterns from the central pole to the corners, lit at night
    const lamps = [];
    [[-T / 2 + 1, -R / 2 + 1], [T / 2 - 1, -R / 2 + 1], [-T / 2 + 1, R / 2 - 1], [T / 2 - 1, R / 2 - 1]].forEach(([x, z]) => {
      for (let i = 1; i < 12; i++) { const t = i / 12, b = glowSprite([0xffd060, 0xff7040, 0x80d0ff][i % 3], .9, .8); b.material.fog = false; b.position.set(x * t, 11 - 7.5 * t - Math.sin(Math.PI * t) * 1.2, z * t); G.add(b); lamps.push(b); }
    });
    onDaylight(d => { lamps.forEach(b => b.material.opacity = .85 * (1 - d) + .08); balloon.material.emissiveIntensity = .7 * (1 - d); });
    updaters.pagoda.push((dt, t, motion) => {
      flags.forEach((fl, i) => { const p = fl.geometry.attributes.position; for (let j = 0; j < p.count; j++) { const x = p.getX(j); p.setZ(j, Math.sin(x * 4 - t * 3 + i) * .08 * x * motion); } p.needsUpdate = true; });
      streamer.rotation.y = Math.sin(t * .6) * .4 * motion; streamer.rotation.z = Math.sin(t * .9) * .06 * motion;
    });
    G.traverse(o => { if (o.isMesh && !o.userData.tip) clickable(list, o, data); });
    // keep the outside camera above the ground and its pavilion
    G.updateMatrixWorld(true);
    const xs = [], zs = [];
    [[-T / 2, -R / 2], [T / 2, -R / 2], [-T / 2, R / 2], [T / 2, R / 2]].forEach(([lx, lz]) => { const w = G.localToWorld(V(lx, 0, lz)); xs.push(w.x); zs.push(w.z); });
    TALL.push({ x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), h: f.y + 9 });
  }
  /* ---------- the far side of the front street: a row of modern Shan houses and shophouses from the foot of the stupa hill
     eastward, the view from the main gate left open, and the daily town market (ဈေး) across from the seven-day market ---------- */
  function streetFrontage(g) {
    const list = picks.pagoda, EDGE = 60.8;   // the street's south pavement edge
    // houses: each faces the street; a gap is left opposite the main gate and the stair path to the hill stays clear
    const kinds = [
      { W: 8, D: 7, floors: 2, shop: true }, { W: 7, D: 7, floors: 2, shop: false }, { W: 9, D: 8, floors: 3, shop: true },
      { W: 7, D: 7, floors: 1, shop: false }, { W: 8, D: 7, floors: 2, shop: true }, { W: 7, D: 8, floors: 2, shop: false }
    ];
    let x = -43, i = 0;
    while (x < 34) {   // the row stops short of the market lane and its banyan
      const k = kinds[i % kinds.length], cx = x + k.W / 2;
      if (Math.abs(cx) < k.W / 2 + 6) { x = 6.5; continue; }   // keep the view from the main gate open
      shanHouse(g, cx, EDGE + k.D / 2 + 2.4, Math.PI, { ...k, wall: WALLS[(i * 5 + 1) % WALLS.length], roof: ROOFS[(i * 3 + 2) % ROOFS.length], seed: 40 + i });
      x += k.W + 2.0; i++;
    }
    // and east of the daily market, facing the fire and police stations across the street
    for (x = 104; ;) {
      const k = kinds[i % kinds.length], cx = x + k.W / 2;
      if (x + k.W > 145) break;
      shanHouse(g, cx, EDGE + k.D / 2 + 2.4, Math.PI, { ...k, wall: WALLS[(i * 5 + 1) % WALLS.length], roof: ROOFS[(i * 3 + 2) % ROOFS.length], seed: 40 + i });
      x += k.W + 2.0; i++;
    }
    // a small paved plaza opposite the gate, with a banyan-like shade tree and benches
    flat(mesh(new THREE.BoxGeometry(11, .05, 10), M.stone, 0, .03, EDGE + 5.4, g));
    tree(g, 0, EDGE + 7, 1.5, 93);
    [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(2.2, .1, .5), M.wood, sd * 3.2, .45, EDGE + 5.6, g); [-.9, .9].forEach(dx => mesh(new THREE.BoxGeometry(.1, .45, .4), M.wood, sd * 3.2 + dx, .22, EDGE + 5.6, g)); });

    // the daily market, opposite the seven-day market: a big open market hall of steel columns under a corrugated roof,
    // rows of stalls inside, and umbrella stalls and parked motorbikes in the forecourt
    const X0 = 44, X1 = 100, Z0 = EDGE + 1, Z1 = EDGE + 42;
    const ground = std({ color: 0x8a867e, roughness: .9 });
    onDaylight(d => ground.color.copy(lerpC(0x3a3834, 0x5e5a52, d)));
    clickable(list, flat(mesh(new THREE.BoxGeometry(X1 - X0, .06, Z1 - Z0), ground, (X0 + X1) / 2, .03, (Z0 + Z1) / 2, g)),
      { tip: "The daily market · ဈေး", toast: "The town's everyday market, open from dawn: vegetables and fish, rice and noodles, tea leaf and spices, cloth and hardware under one big roof." });
    const steelM = std({ color: 0x5a5e62, roughness: .4, metalness: .7 });
    const HX0 = 50, HX1 = 94, HZ0 = Z0 + 10, HZ1 = Z1 - 3, HH = 6;
    for (let hx = HX0; hx <= HX1 + .01; hx += 5.5) for (let hz = HZ0; hz <= HZ1 + .01; hz += (HZ1 - HZ0) / 4) sCircle(g, hx, hz, .2), mesh(new THREE.CylinderGeometry(.15, .15, HH, 8), steelM, hx, HH / 2, hz, g);
    const roofT = corrugated("#8a8c8e", "#c0c4c8", "#5e6064"); roofT.repeat.set((HX1 - HX0) / 1.5, 1);
    const roofMat = std({ map: roofT, roughness: .45, metalness: .45, side: THREE.DoubleSide });
    const hw = (HZ1 - HZ0) / 2 + 1.5, pitch = .22, len = hw / Math.cos(pitch), midZ = (HZ0 + HZ1) / 2;
    [-1, 1].forEach(sd => { const r = mesh(new THREE.BoxGeometry(HX1 - HX0 + 3, .08, len), roofMat, (HX0 + HX1) / 2, HH + Math.tan(pitch) * hw / 2, midZ + sd * hw / 2, g); r.rotation.x = sd * pitch; });
    mesh(new THREE.BoxGeometry(HX1 - HX0 + 3, .3, .3), steelM, (HX0 + HX1) / 2, HH + Math.tan(pitch) * hw + .05, midZ, g);
    // a raised clerestory along the ridge to let the light and smoke out
    mesh(new THREE.BoxGeometry(HX1 - HX0 - 4, 1.0, 3), std({ color: 0xd8d4c8, roughness: .8 }), (HX0 + HX1) / 2, HH + Math.tan(pitch) * hw + .5, midZ, g);
    const sign = writing(768, 160, (c, cw, ch) => {
      c.fillStyle = "#2f7a4a"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#f2d27a"; c.lineWidth = 10; c.strokeRect(6, 6, cw - 12, ch - 12);
      c.fillStyle = "#fff4d0"; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = '600 62px "Noto Sans Myanmar", "Myanmar Text", sans-serif'; c.fillText("မြို့မဈေး", cw / 2, 60);
      c.font = '600 34px "Figtree", sans-serif'; c.fillText("Town market", cw / 2, 124);
    });
    if (document.fonts && document.fonts.load) document.fonts.load('600 62px "Noto Sans Myanmar"', "ဈေး").then(() => { sign.needsUpdate = true; }, () => {});
    clickable(list, flat(mesh(new THREE.PlaneGeometry(7, 1.5), std({ map: sign, emissive: 0xffffff, emissiveMap: sign, emissiveIntensity: .35, roughness: .6, side: THREE.DoubleSide }), (HX0 + HX1) / 2, HH - .9, HZ0 - .2, g)).rotateY(Math.PI),   // faces the street
      { tip: "The daily market · ဈေး", toast: "The town's everyday market, open from dawn: vegetables and fish, rice and noodles, tea leaf and spices, cloth and hardware under one big roof." });
    // stalls under the roof: long concrete counters in rows, piled with goods
    const GOODS = [0xc8402e, 0xf0881c, 0x8ab83a, 0xe8d050, 0x6a4a2a, 0xf4f0e4, 0x3a6ac0, 0xd04a8a, 0x4a8a3a].map(c => std({ color: c, roughness: .6 }));
    const counter = std({ color: 0xb8b4ac, roughness: .9 }), tile2 = std({ color: 0xe8e4dc, roughness: .5 }), r = rng(555);
    const goods = new THREE.InstancedMesh(new THREE.BoxGeometry(.32, .22, .32), std({ color: 0xffffff, roughness: .6 }), 1400), m4 = new THREE.Matrix4(), tc = new THREE.Color();
    let n = 0;
    for (let row = 0; row < 4; row++) {
      const cz = HZ0 + 3 + row * (HZ1 - HZ0 - 6) / 3;
      for (let seg = 0; seg < 3; seg++) {
        const sx0 = HX0 + 2 + seg * 14, L = 12;
        mesh(new THREE.BoxGeometry(L, .85, 1.6), counter, sx0 + L / 2, .43, cz, g);
        sRect(g, sx0, sx0 + L, cz - .8, cz + .8);
        mesh(new THREE.BoxGeometry(L + .1, .05, 1.7), tile2, sx0 + L / 2, .88, cz, g);
        for (let k = 0; k < 30 && n < 1400; k++) {
          const gx = sx0 + .4 + (k % 15) * .76, gz = cz + (k < 15 ? -.35 : .35), h = .6 + r() * .9;
          goods.setMatrixAt(n, m4.compose(V(gx, .9 + .11 * h, gz), new THREE.Quaternion(), V(1, h, 1)));
          goods.setColorAt(n++, tc.copy(GOODS[(r() * GOODS.length) | 0].color));
        }
      }
    }
    goods.count = n; g.add(goods);
    // hanging bulbs under the roof, lit at night
    for (let hx = HX0 + 3; hx < HX1; hx += 6) for (let row = 0; row < 4; row++) {
      const b = glowSprite(0xfff0c8, 1.1, .8); b.material.fog = false; b.position.set(hx, HH - 1.2, HZ0 + 3 + row * (HZ1 - HZ0 - 6) / 3); g.add(b);
      onDaylight(d => b.material.opacity = .85 * (1 - d) + .05);
    }
    // the forecourt: umbrella stalls along the street, motorbikes parked in a row
    const UMB = [0x2a6ac0, 0xe0702a, 0x2f8a4a, 0xc02a2a, 0xe8c030].map(c => std({ color: c, roughness: .7, side: THREE.DoubleSide }));
    for (let ux = X0 + 3; ux < X1 - 2; ux += 5) {
      const uz = Z0 + 3.5;
      mesh(new THREE.CylinderGeometry(.04, .04, 2.6, 6), steelM, ux, 1.3, uz, g);
      sRect(g, ux - .9, ux + .9, uz - .5, uz + .5);
      mesh(new THREE.ConeGeometry(1.7, .55, 8, 1, true), UMB[((ux - X0) / 5 | 0) % UMB.length], ux, 2.7, uz, g).castShadow = false;
      mesh(new THREE.BoxGeometry(1.8, .7, 1.0), M.wood, ux, .35, uz, g);
      for (let k = 0; k < 4; k++) mesh(new THREE.SphereGeometry(.14, 8, 6), GOODS[(r() * GOODS.length) | 0], ux - .6 + k * .4, .82, uz, g);
    }
    const bikeC = [0xc02a2a, 0x1a1a1c, 0x2a5aa0, 0xe8e4dc].map(c => std({ color: c, roughness: .4, metalness: .3 })), tyre = std({ color: 0x141414, roughness: .8 });
    for (let k = 0; k < 14; k++) {
      const bx = X0 + 4 + k * 1.1, bz = Z0 + 7.2, b = new THREE.Group(); b.position.set(bx, 0, bz); b.rotation.y = .2; g.add(b);
      [-.6, .6].forEach(wz => { const w = mesh(new THREE.TorusGeometry(.28, .08, 6, 14), tyre, 0, .32, wz, b); w.rotation.y = Math.PI / 2; });
      mesh(new THREE.BoxGeometry(.28, .35, 1.1), bikeC[k % 4], 0, .6, 0, b);
      mesh(new THREE.BoxGeometry(.3, .12, .6), tyre, 0, .85, -.1, b);
      mesh(new THREE.BoxGeometry(.6, .05, .05), steelM, 0, 1.05, .55, b);
    }
  }
  /* ---------- the back streets: four small concrete lanes with open drains off the main roads, lined with small houses of
     Northern Shan towns today, one and two storeys: painted concrete ones (shanHouse) and teak plank ones, either raised on posts
     or a wooden storey over a whitewashed brick ground floor, with verandahs, painted shutters and rusty corrugated hip roofs;
     and the old banyan on the corner of the market lane ---------- */
  const teakTex = canvasTex(128, (c, sz) => { c.fillStyle = "#6a3e22"; c.fillRect(0, 0, sz, sz); for (let y = 0; y < sz; y += 11) { c.fillStyle = "rgba(20,8,2,.55)"; c.fillRect(0, y, sz, 2); c.fillStyle = "rgba(160,100,60,.15)"; c.fillRect(0, y + 3, sz, 3); } });
  teakTex.wrapS = teakTex.wrapT = THREE.RepeatWrapping; teakTex.repeat.set(3, 1.2);
  const teakWall = std({ map: teakTex, roughness: .8 }), teakDark = std({ color: 0x3e2414, roughness: .8 }), teakPost = std({ color: 0x4a2c18, roughness: .85 });
  const whiteWall = std({ color: 0xece6d6, roughness: .9 }), houseInside = std({ color: 0x1a120c, roughness: .9, emissive: 0xffc070, emissiveIntensity: 0 });
  onDaylight(d => { houseInside.emissiveIntensity = .55 * (1 - d) * (1 - FEST.out); });
  const SHUTTERS = [0x2f6a8a, 0x3a7a4a, 0x8a3a2a, 0x4a3020].map(c => std({ color: c, roughness: .6 }));
  const rustRoof = (() => { const t = corrugated("", "#b0703a", "#5a3018"); return std({ map: t, roughness: .7, metalness: .3, side: THREE.DoubleSide }); })();
  // a hip roof over a 2a × 2b rectangle, its ridge along x (a ≥ b), rising hgt; corrugations run down each slope
  function tinHipRoof(a, b, hgt, mat) {
    const rx = a - b, P = [[-a, 0, b], [a, 0, b], [rx, hgt, 0], [-rx, hgt, 0], [a, 0, -b], [-a, 0, -b]];
    const pos = [], uv = [];
    [[0, 1, 2], [0, 2, 3], [4, 5, 3], [4, 3, 2], [1, 4, 2], [5, 0, 3]].forEach((t, k) => t.forEach(i => { const p = P[i]; pos.push(...p); uv.push((k < 4 ? p[0] : p[2]) / 1.2, p[1]); }));
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, mat);
  }
  // a wooden Shan house in local coordinates: front faces +z, width W, depth D, a verandah across the front; one storey raised
  // on teak posts with a stair up to the verandah, or two: a wooden storey on a whitewashed brick ground floor
  const winBackGeo = new THREE.BoxGeometry(.9, 1.1, .06), winLintelGeo = new THREE.BoxGeometry(1.06, .08, .12), winShutterGeo = new THREE.BoxGeometry(.45, 1.1, .05);
  function shanWoodHouse(g, x, z, ry, o) {
    const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
    const { W, D, floors, roof, seed } = o, r = rng(seed), FH = 2.8, VD = 1.6, shut = SHUTTERS[seed % SHUTTERS.length];
    sRect(h, -W / 2 - .2, W / 2 + .2, -D / 2 - .2, D / 2 + VD + (floors === 1 ? 1.3 : .2));
    // a window: a dark opening between two painted plank shutters folded open, on a wall facing local +z of its frame
    const win = (px, py, pz, rot) => {
      const w = new THREE.Group(); w.position.set(px, py, pz); w.rotation.y = rot; h.add(w);
      part(winBackGeo, houseInside, 0, 0, .02, w);
      [-1, 1].forEach(sd => { part(winLintelGeo, teakDark, 0, sd * .58, .04, w); part(winShutterGeo, shut, sd * .72, 0, .06, w); });
    };
    let y0 = 1.1;   // the wooden storey's floor
    const left = seed % 2 ? 1 : -1;   // which side the door (and the stair) is on
    if (floors === 2) {   // a whitewashed brick ground floor, the wooden storey and its verandah above, carried on brick piers
      mesh(new THREE.BoxGeometry(W + .4, .25, D + VD + .6), concrete, 0, .125, VD / 2, h);
      mesh(new THREE.BoxGeometry(W, FH, D), whiteWall, 0, .25 + FH / 2, 0, h);
      mesh(new THREE.BoxGeometry(1.2, 2.2, .08), teakDark, left * W / 4, .25 + 1.1, D / 2 + .03, h);
      win(-left * W / 4, 1.75, D / 2 + .01, 0);
      [-1, 1].forEach(sd => { win(sd * (W / 2 + .01), 1.75, 0, sd * Math.PI / 2); mesh(new THREE.BoxGeometry(.3, FH, .3), whiteWall, sd * (W / 2 - .15), .25 + FH / 2, D / 2 + VD - .15, h); });
      y0 = .25 + FH;
    } else {   // raised on teak posts, the space underneath kept for shade, firewood and the loom
      for (const px of [-W / 2 + .2, 0, W / 2 - .2]) for (const pz of [-D / 2 + .2, 0, D / 2 - .2, D / 2 + VD - .2]) mesh(new THREE.BoxGeometry(.2, y0, .2), teakPost, px, y0 / 2, pz, h);
      const sx = left * (W / 2 - .75), z1 = D / 2 + VD;   // a wooden stair down from the verandah
      for (let k = 0; k < 4; k++) mesh(new THREE.BoxGeometry(1.0, .06, .3), teakDark, sx, .22 * (k + 1) - .03, z1 + .15 + (3 - k) * .28, h);
      [-1, 1].forEach(sd => { const s = mesh(new THREE.BoxGeometry(.06, .2, 1.45), teakDark, sx + sd * .52, .6, z1 + .6, h); s.rotation.x = Math.atan2(1.1, 1.2); });
      const stack = mesh(new THREE.BoxGeometry(1.4, .5, .6), std({ color: 0x6a4a2a, roughness: 1 }), -left * W / 4, .25, -D / 4, h); stack.castShadow = false;   // firewood
    }
    // the wooden storey: floor, plank walls, a door and shuttered windows
    mesh(new THREE.BoxGeometry(W + .3, .14, D + VD + .1), teakDark, 0, y0 - .07, VD / 2, h);
    mesh(new THREE.BoxGeometry(W, FH, D), teakWall, 0, y0 + FH / 2, 0, h);
    mesh(new THREE.BoxGeometry(1.0, 2.1, .06), teakDark, left * W / 4, y0 + 1.05, D / 2 + .03, h);
    win(-left * W / 4, y0 + 1.4, D / 2 + .01, 0);
    win(0, y0 + 1.4, -D / 2 - .01, Math.PI);
    [-1, 1].forEach(sd => win(sd * (W / 2 + .01), y0 + 1.4, 0, sd * Math.PI / 2));
    // the verandah: a plank balustrade (open at the stair), side rails and posts up to the eaves
    const rz = D / 2 + VD - .08;
    if (floors === 1) {
      const gx = left * (W / 2 - .75), a = -W / 2, b = W / 2, cut = [gx - .55, gx + .55];
      [[a, cut[0]], [cut[1], b]].forEach(([p, q]) => { if (q - p > .1) mesh(new THREE.BoxGeometry(q - p, .75, .05), teakWall, (p + q) / 2, y0 + .45, rz, h); });
    } else mesh(new THREE.BoxGeometry(W, .75, .05), teakWall, 0, y0 + .45, rz, h);
    [-1, 1].forEach(sd => {
      mesh(new THREE.BoxGeometry(.05, .75, VD), teakWall, sd * (W / 2 - .03), y0 + .45, D / 2 + VD / 2, h);
      mesh(new THREE.BoxGeometry(.16, FH, .16), teakPost, sd * (W / 2 - .1), y0 + FH / 2, rz, h);
    });
    mesh(new THREE.BoxGeometry(W + .2, .16, D + VD + .1), teakDark, 0, y0 + FH + .08, VD / 2, h);   // the wall plate and verandah ceiling
    // a rusty corrugated hip roof over the house and its verandah, with a deep overhang
    const a = W / 2 + .7, b = (D + VD) / 2 + .7, roofM = tinHipRoof(Math.max(a, b), Math.min(a, b), Math.min(a, b) * .55, roof);
    roofM.position.set(0, y0 + FH + .16, VD / 2); if (a < b) roofM.rotation.y = Math.PI / 2; roofM.castShadow = roofM.receiveShadow = true; h.add(roofM);
    // water: a blue tank on a stand at the back, or big glazed Martaban jars by the front
    if (r() < .5) {
      const tx = -left * (W / 2 - .7), tz = -D / 2 - .9, th = 2.2;
      [[-.4, -.4], [.4, -.4], [-.4, .4], [.4, .4]].forEach(([p, q]) => mesh(new THREE.BoxGeometry(.08, th, .08), steel, tx + p, th / 2, tz + q, h));
      mesh(new THREE.CylinderGeometry(.5, .5, 1.1, 16), tank, tx, th + .55, tz, h);
    } else {
      const jar = std({ color: 0x4a2a14, roughness: .3, metalness: .1 });
      for (let k = 0; k < 2 + (seed % 2); k++) { const j = mesh(new THREE.SphereGeometry(.38, 12, 10), jar, -left * (W / 2 - .5) + left * k * .85, .42, D / 2 + VD + .6, h); j.scale.y = 1.2; }
    }
  }
  // a banana clump: a few pseudo-stems under broad, drooping leaves
  const bananaMats = [0x4a8a2e, 0x5a9a36, 0x3e7a28].map(c => std({ color: c, roughness: .7, side: THREE.DoubleSide, flatShading: true }));
  function banana(g, x, z, seed = 1) {
    const r = rng(seed * 13), t = new THREE.Group(); t.position.set(x, 0, z); g.add(t);
    sCircle(t, 0, 0, .5);
    for (let s = 0; s < 3; s++) {
      const sx = (r() - .5) * .9, sz = (r() - .5) * .9, H = 2 + r() * 1.2;
      mesh(new THREE.CylinderGeometry(.09, .14, H, 7), bananaMats[2], sx, H / 2, sz, t);
      for (let i = 0; i < 5; i++) {
        const leaf = mesh(new THREE.PlaneGeometry(.55, 1.9), bananaMats[i % 2], 0, 0, 0, t);
        leaf.geometry.translate(0, .95, 0); leaf.position.set(sx, H, sz); leaf.rotation.set(1.0 + r() * .5, i / 5 * TAU + r(), 0, "YXZ"); leaf.castShadow = false;
      }
    }
  }
  // ညောင်ပင်, a banyan many generations old: a trunk of many stems grown together, wide limbs dropping aerial roots (the oldest
  // have rooted into the platform as new trunks), a broad low crown; a whitewashed brick platform round its foot with a spirit house
  function banyan(g, x, z, s = 1) {
    const list = picks.pagoda, r = rng(808), t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); g.add(t);
    const bk = std({ color: 0x6e6658, roughness: .95 });
    const data = { tip: "The old banyan · ညောင်ပင်", toast: "A banyan many generations old shades the corner of the market lane. Its hanging roots have grown down into new trunks; people keep a little spirit house at its foot with fresh flowers and water, and the market porters rest on its platform at noon." };
    clickable(list, mesh(new THREE.CylinderGeometry(2.3, 2.45, .55, 24), whiteWall, 0, .275, 0, t), data);
    mesh(new THREE.CylinderGeometry(2.36, 2.36, .08, 24), std({ color: 0x9a4a32, roughness: .8 }), 0, .58, 0, t);
    sCircle(t, 0, 0, 2.45);
    const foot = .6;
    clickable(list, mesh(new THREE.CylinderGeometry(.8, 1.3, 1.4, 10), bk, 0, foot + .7, 0, t), data);
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * TAU + r() * .3, d = .35 + r() * .25, rad = .28 + r() * .18;
      const st = mesh(new THREE.CylinderGeometry(rad * .8, rad * 1.35, 5.6, 7), bk, Math.cos(a) * d, foot + 2.8, Math.sin(a) * d, t);
      st.rotation.set(Math.sin(a) * .08, 0, -Math.cos(a) * .08);
    }
    const roots = [];
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU + r() * .4, L = 4.5 + r() * 2.5, y = foot + 4.4 + r() * 1.4, tilt = .2 + r() * .25;
      const dir = V(Math.cos(a) * Math.cos(tilt), Math.sin(tilt), Math.sin(a) * Math.cos(tilt)), base = V(Math.cos(a) * .4, y, Math.sin(a) * .4);
      const limb = mesh(new THREE.CylinderGeometry(.14, .34, L, 7), bk, 0, 0, 0, t);
      limb.quaternion.setFromUnitVectors(V(0, 1, 0), dir); limb.position.copy(base).addScaledVector(dir, L / 2);
      for (let k = 0; k < 5; k++) { const p = base.clone().addScaledVector(dir, L * (.2 + k * .18)); roots.push([p, Math.hypot(p.x, p.z) < 2.0]); }
    }
    roots.forEach(([p, rooted]) => {   // aerial roots: hanging strands, and pillar roots where they reach the platform
      const len = rooted ? p.y - foot : 1.2 + r() * 2.8, rad = rooted ? .08 + r() * .06 : .025;
      mesh(new THREE.CylinderGeometry(rad, rooted ? rad * 1.7 : rad * .6, len, 5), bk, p.x, p.y - len / 2, p.z, t).castShadow = rooted;
    });
    // the crown: dark glossy leaf clumps in a broad, low dome
    const N = 240, crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), std({ color: 0xffffff, roughness: .55, flatShading: true }), N), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), tc = new THREE.Color();
    const greens = [0x1c3e18, 0x24481c, 0x173614, 0x2c5222];
    for (let i = 0; i < N; i++) {
      const hh = r(), y = foot + 6 + hh * 5, maxR = 8.5 * (1 - hh * hh * .7), rr = (.3 + .7 * Math.sqrt(r())) * maxR, a = r() * TAU, sz = .9 + r() * .7;
      crown.setMatrixAt(i, m4.compose(V(Math.cos(a) * rr, y, Math.sin(a) * rr), q.setFromAxisAngle(V(0, 1, 0), r() * TAU), V(sz, sz * .65, sz)));
      crown.setColorAt(i, tc.set(greens[i % 4]));
    }
    crown.frustumCulled = false; crown.castShadow = true; t.add(crown);
    // cloths of red, white and yellow tied round the trunk
    [0xc02a2a, 0xf4f0e4, 0xe8b020].forEach((c, i) => mesh(new THREE.CylinderGeometry(1.02 - i * .03, 1.06 - i * .03, .16, 18, 1, true), std({ color: c, roughness: .8, side: THREE.DoubleSide }), 0, foot + 1.5 + i * .2, 0, t));
    // the spirit house on its post, facing the street, with flowers and a cup of water
    const sh = new THREE.Group(); sh.position.set(1.2, foot, -1.5); sh.rotation.y = Math.PI + .5; t.add(sh);
    mesh(new THREE.BoxGeometry(.1, 1.3, .1), teakPost, 0, .65, 0, sh);
    mesh(new THREE.BoxGeometry(.8, .06, .6), teakDark, 0, 1.33, 0, sh);
    mesh(new THREE.BoxGeometry(.55, .45, .4), std({ color: 0xb02a22, roughness: .5 }), 0, 1.58, -.05, sh);
    const sroof = mesh(new THREE.ConeGeometry(.48, .4, 4), std({ color: 0xd8a830, roughness: .35, metalness: .6 }), 0, 2.0, -.05, sh); sroof.rotation.y = Math.PI / 4;
    [[-.28, 0xf0e050], [.28, 0xffffff]].forEach(([fx, c]) => mesh(new THREE.SphereGeometry(.08, 8, 6), std({ color: c, roughness: .6 }), fx, 1.42, .2, sh));
    TALL.push({ x0: x - 8.5 * s, x1: x + 8.5 * s, z0: z - 8.5 * s, z1: z + 8.5 * s, h: (foot + 11) * s });
  }
  /* ---------- village lamps and bamboo huts ---------- */
  // a village street lamp: a wooden (or bamboo) pole with a crossarm carrying white insulators, and below it a steel arm out to
  // local +x with a green enamel shade over a bare bulb, which throws a warm pool of light on the ground at night.
  // The wires run along local z; returns the two insulator tops (in g's frame) for `lampWires`
  const enamel = std({ color: 0x2e6a4a, roughness: .35, metalness: .2 }), enamelIn = std({ color: 0xf4f0e4, roughness: .4, side: THREE.BackSide });
  const insulator = std({ color: 0xf2f2ee, roughness: .25 }), bambooPole = std({ color: 0xa89058, roughness: .8 });
  const lampBulb = std({ color: 0xfff4d8, emissive: 0xffd890, emissiveIntensity: 1 });
  const poolTex = canvasTex(64, (c, sz) => {
    const gr = c.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
    gr.addColorStop(0, "rgba(255,210,140,.9)"); gr.addColorStop(.45, "rgba(255,190,110,.35)"); gr.addColorStop(1, "rgba(255,170,90,0)");
    c.fillStyle = gr; c.fillRect(0, 0, sz, sz);
  });
  const lampPool = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const lampBulbOff = std({ color: 0x8a8678, roughness: .4 });
  const hutLamp = lampBulb.clone();   // the huts' own oil lamps, put out on Halloween night with the house lights
  const lampGlows = [], hutGlows = [];
  onDaylight(d => {
    lampBulb.emissiveIntensity = 1 - .85 * d; lampPool.opacity = .75 * (1 - d); lampGlows.forEach(s => s.material.opacity = .8 * (1 - d));
    const hut = 1 - FEST.out; hutLamp.emissiveIntensity = (1 - .85 * d) * hut; hutGlows.forEach(s => s.material.opacity = .8 * (1 - d) * hut);
  });
  function villageLamp(g, x, y, z, ry, bamboo = false) {
    const p = new THREE.Group(); p.position.set(x, y, z); p.rotation.y = ry; g.add(p);
    sCircle(p, 0, 0, .13);
    const H = bamboo ? 5.2 : 6, A = .95, c = Math.cos(ry), s = Math.sin(ry);
    mesh(new THREE.CylinderGeometry(.07, .11, H, 7), bamboo ? bambooPole : teakPost, 0, H / 2, 0, p);
    if (bamboo) for (let k = 1; k < 5; k++) mesh(new THREE.CylinderGeometry(.085, .085, .05, 7), teakDark, 0, k * H / 5, 0, p);   // the nodes
    mesh(new THREE.BoxGeometry(1.3, .09, .09), teakPost, 0, H - .3, 0, p);
    [-.55, .55].forEach(ix => mesh(new THREE.CylinderGeometry(.04, .05, .12, 8), insulator, ix, H - .19, 0, p));
    // the lamp arm and its brace, the shade (green enamel outside, white inside), the bulb and its glow
    mesh(new THREE.BoxGeometry(A, .04, .04), steel, A / 2, H - 1.25, 0, p);
    mesh(new THREE.BoxGeometry(.64, .03, .03), steel, .22, H - 1.47, 0, p).rotation.z = Math.PI / 4;
    mesh(new THREE.BoxGeometry(.03, .14, .03), steel, A, H - 1.32, 0, p);
    const shade = new THREE.ConeGeometry(.3, .16, 14, 1, true);
    mesh(shade, enamel, A, H - 1.44, 0, p); mesh(shade, enamelIn, A, H - 1.44, 0, p);
    const bulb = mesh(new THREE.SphereGeometry(.07, 8, 6), lampBulb, A, H - 1.55, 0, p);
    const gl = glowSprite(0xffd890, 2, 0); gl.position.set(A, H - 1.55, 0); p.add(gl); lampGlows.push(gl);
    gl.material.opacity = .8 * (1 - daylight);
    const pool = flat(mesh(new THREE.CircleGeometry(3.2, 20), lampPool, A + .3, .07, 0, p)); pool.rotation.x = -Math.PI / 2; pool.receiveShadow = false;
    poleLights.push({ x: x + A * c, z: z - A * s, set: lit => { bulb.material = lit ? lampBulb : lampBulbOff; gl.visible = pool.visible = lit; } });
    return [-.55, .55].map(ix => [x + ix * c, y + H - .12, z - ix * s]);
  }
  // sagging wires between consecutive lamps (the arrays `villageLamp` returns)
  const wireMat = new THREE.LineBasicMaterial({ color: 0x1a1816 });
  function lampWires(g, tops) {
    const pts = [];
    for (let i = 1; i < tops.length; i++) for (let k = 0; k < 2; k++) {
      const [ax, ay, az] = tops[i - 1][k], [bx, by, bz] = tops[i][k], sag = Math.hypot(bx - ax, bz - az) * .04;
      for (let j = 0; j < 8; j++) [j, j + 1].forEach(q => { const t = q / 8; pts.push(ax + (bx - ax) * t, ay + (by - ay) * t - Math.sin(Math.PI * t) * sag, az + (bz - az) * t); });
    }
    if (!pts.length) return;
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    g.add(new THREE.LineSegments(geo, wireMat));
  }
  // a village hut of bamboo and thatch, as they are still built in the hill villages round Shan towns: woven bamboo-mat walls on a
  // frame of wooden posts, a split-bamboo floor raised off the ground with an open verandah in front and a ladder down, and a steep
  // thatched gable roof. Front faces +z. Each post runs down to the land under it, so a hut can stand out over a slope on stilts.
  const hutMatTex = canvasTex(64, (c, sz) => {
    c.fillStyle = "#b89a62"; c.fillRect(0, 0, sz, sz);
    for (let y = 0; y < sz; y += 8) for (let x = 0; x < sz; x += 8) {   // a twill weave of light and dark strips
      const odd = ((x + y) / 8) % 2;
      c.fillStyle = odd ? "rgba(90,60,25,.35)" : "rgba(255,235,180,.2)"; c.fillRect(x, y, 8, 4);
      c.fillStyle = odd ? "rgba(255,235,180,.2)" : "rgba(90,60,25,.35)"; c.fillRect(x, y + 4, 8, 4);
      c.fillStyle = "rgba(60,40,15,.4)"; c.fillRect(x + (odd ? 0 : 4), y, 1, 8);
    }
  });
  hutMatTex.wrapS = hutMatTex.wrapT = THREE.RepeatWrapping; hutMatTex.repeat.set(4, 2);
  const thatchTex = canvasTex(128, (c, sz) => {
    c.fillStyle = "#86704a"; c.fillRect(0, 0, sz, sz);
    const r = rng(55);
    for (let i = 0; i < 900; i++) { c.fillStyle = r() < .5 ? "rgba(60,44,22,.45)" : "rgba(200,176,120,.35)"; c.fillRect(r() * sz, r() * sz, 1, 4 + r() * 6); }
    c.fillStyle = "rgba(40,28,14,.5)"; for (let y = 0; y < sz; y += 16) c.fillRect(0, y, sz, 2);   // the courses of thatch
  });
  thatchTex.wrapS = thatchTex.wrapT = THREE.RepeatWrapping; thatchTex.repeat.set(3, 2);
  const hutWall = std({ map: hutMatTex, roughness: .9 }), hutGable = std({ map: hutMatTex, roughness: .9, side: THREE.DoubleSide });
  const hutThatch = std({ map: thatchTex, roughness: 1 }), hutRidge = std({ color: 0x4e3e26, roughness: 1 }), hutSlat = std({ color: 0x9a8050, roughness: .9 });
  const hutPot = std({ color: 0x8a4a2a, roughness: .7 });
  const HUT_TIP = { tip: "A bamboo hut in the village", toast: "A village hut of woven bamboo mats and thatch on a frame of wooden posts, the way houses are still built in the hill villages round Shan towns. The floor is raised to keep out the damp and the animals; the family cooks, eats and sleeps on the verandah and in the one room behind it." };
  function villageHut(g, x, z, ry, o) {
    const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
    const { W, D, seed } = o, r = rng(seed), FH = 2.3, VD = 1.4, c = Math.cos(ry), s = Math.sin(ry);
    const gAt = (lx, lz) => terrainAt(x + lx * c + lz * s, z - lx * s + lz * c);   // the land under a point of the hut
    sRect(h, -W / 2 - .3, W / 2 + .3, -D / 2 - .3, D / 2 + VD + .2);
    const xs = [-W / 2, 0, W / 2], zs = [-D / 2, D / 2, D / 2 + VD];
    let low = Infinity, high = -Infinity;
    xs.forEach(px => zs.forEach(pz => { const y = gAt(px, pz); low = Math.min(low, y); high = Math.max(high, y); }));
    const y0 = high + (o.lift || 1.1), ye = y0 + FH;
    // the posts, from the land up to the wall plate (the verandah posts up to the eave)
    xs.forEach(px => zs.forEach((pz, k) => {
      const b = gAt(px, pz) - .2, t = k === 2 ? ye - .15 : ye;
      mesh(new THREE.CylinderGeometry(.08, .1, t - b, 6), teakPost, px, (t + b) / 2, pz, h);
    }));
    if (y0 - low > 1.8) [-1, 1].forEach(sd => {   // tall stilts are braced corner to corner along each side
      const b = gAt(sd * W / 2, D / 2 + VD) + .3, dz = D + VD, dy = y0 - .2 - b, L = Math.hypot(dz, dy);
      const br = mesh(new THREE.BoxGeometry(.06, .08, L), teakPost, sd * (W / 2 + .06), b + dy / 2, -D / 2 + dz / 2, h);
      br.rotation.x = Math.atan2(dy, dz);
    });
    // the floor and verandah, the walls, a door onto the verandah and a window each side under a propped mat shutter
    mesh(new THREE.BoxGeometry(W + .3, .12, D + VD + .1), hutSlat, 0, y0 - .06, VD / 2, h);
    clickable(picks.pagoda, mesh(new THREE.BoxGeometry(W, FH, D), hutWall, 0, y0 + FH / 2, 0, h), HUT_TIP);
    const left = seed % 2 ? 1 : -1;
    mesh(new THREE.BoxGeometry(.9, 1.8, .05), houseInside, left * W / 4, y0 + .9, D / 2 + .01, h);
    [-1, 1].forEach(sd => {
      mesh(new THREE.BoxGeometry(.05, .7, .9), houseInside, sd * (W / 2 + .01), y0 + 1.3, 0, h);
      const sh = mesh(new THREE.BoxGeometry(.05, .8, 1.0), hutWall, sd * (W / 2 + .36), y0 + 1.52, 0, h); sh.rotation.z = sd * 1.1;
    });
    // a bamboo rail round the verandah, open where the ladder comes up
    const rz = D / 2 + VD - .05, lx = -left * (W / 2 - .7), ry2 = y0 + .65;
    [[-W / 2, lx - .45], [lx + .45, W / 2]].forEach(([a, b]) => { if (b - a > .1) mesh(new THREE.BoxGeometry(b - a, .07, .07), hutSlat, (a + b) / 2, ry2, rz, h); });
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.07, .07, VD), hutSlat, sd * W / 2, ry2, D / 2 + VD / 2, h));
    // the ladder down from the verandah to the land in front
    let dz = .5;
    for (let i = 0; i < 2; i++) dz = Math.max(.5, (y0 - gAt(lx, rz + dz)) * .4);
    const foot = gAt(lx, rz + dz), rise = y0 - foot, L = Math.hypot(rise, dz), tilt = Math.atan2(dz, rise);
    [-.3, .3].forEach(ox => { const rl = mesh(new THREE.BoxGeometry(.07, L + .3, .07), teakPost, lx + ox, foot + rise / 2, rz + dz / 2, h); rl.rotation.x = -tilt; });
    const n = Math.max(2, Math.floor(rise / .32));
    for (let i = 1; i <= n; i++) { const t = i / (n + 1); mesh(new THREE.BoxGeometry(.6, .05, .06), hutSlat, lx, foot + rise * t, rz + dz * (1 - t), h); }
    // the steep thatched gable roof, its ridge along x, with deep eaves; the gables filled with bamboo mat
    const ex = W / 2 + .6, zc = VD / 2, b = (D + VD) / 2 + .6, rh = b * .95, sl = Math.hypot(b, rh), a = Math.atan2(rh, b);
    [-1, 1].forEach(sd => {
      const m = mesh(new THREE.BoxGeometry(ex * 2, .22, sl), hutThatch, 0, ye + rh / 2 + .11, zc + sd * b / 2, h); m.rotation.x = sd * a;
      if (sd < 0) clickable(picks.pagoda, m, HUT_TIP);
    });
    mesh(new THREE.BoxGeometry(ex * 2 + .1, .2, .4), hutRidge, 0, ye + rh + .14, zc, h);
    const roofAt = zz => rh * (1 - Math.abs(zz - zc) / b);
    const gs = new THREE.Shape(); gs.moveTo(-D / 2, 0); gs.lineTo(D / 2, 0); gs.lineTo(D / 2, roofAt(D / 2)); gs.lineTo(zc, rh); gs.lineTo(-D / 2, roofAt(-D / 2)); gs.closePath();
    const gg = new THREE.ShapeGeometry(gs); gg.rotateY(-Math.PI / 2);
    [-1, 1].forEach(sd => mesh(gg, hutGable, sd * W / 2, ye, 0, h));
    // a clay water pot on the verandah, firewood under the floor, and an oil lamp hung from the verandah eave, lit at night
    const pot = mesh(new THREE.SphereGeometry(.26, 10, 8), hutPot, left * (W / 2 - .45), y0 + .26, D / 2 + VD / 2, h); pot.scale.y = 1.15;
    if (y0 - gAt(0, 0) > 1) { const fw = mesh(new THREE.BoxGeometry(1.4, .45, .5), std({ color: 0x6a4a2a, roughness: 1 }), -left * W / 5, gAt(-left * W / 5, -D / 4) + .2, -D / 4, h); fw.castShadow = false; }
    mesh(new THREE.CylinderGeometry(.005, .005, .4, 3), steel, left * W / 4, ye - .2, rz - .1, h);
    mesh(new THREE.CylinderGeometry(.07, .09, .16, 8), hutLamp, left * W / 4, ye - .48, rz - .1, h);
    const gl = glowSprite(0xffb060, 1.4, .8 * (1 - daylight) * (1 - FEST.out)); gl.position.set(left * W / 4, ye - .48, rz - .1); h.add(gl); hutGlows.push(gl);
    // keep the outside camera above the hut
    const R = Math.max(ex, b) + .5, cx = x + zc * s, cz = z + zc * c;
    TALL.push({ x0: cx - R, x1: cx + R, z0: cz - R, z1: cz + R, h: ye + rh + .3 });
    return { y0 };
  }
  // huts on the foot of the stupa hill, facing the footpath that runs along the lowest terrace from the stair (lit by village
  // lamps): the verandah and a short ladder on the terrace, the back of the hut out over the last slope on stilts
  function hillHuts(g) {
    const { cx, cz } = HILL, t = HILL.terraces[HILL.terraces.length - 1], th = Math.atan2(HILL.to[1] - cz, HILL.to[0] - cx);
    const offs = [-.23, -.4, -.57, -.74, -.91, -1.1, -1.3, -1.48, .21, .37];   // round the hill from the stair (world angle)
    const at = (a, rr) => [cx + Math.cos(a) * rr, cz + Math.sin(a) * rr];
    offs.forEach((o, i) => {
      const a = th + o, W = 4.2 + (i % 3) * .4, D = 3.8 + (i % 2) * .4, [x, z] = at(a, t.r1 - .2 + D / 2);   // verandah edge 1.6 m in from the terrace edge
      villageHut(g, x, z, Math.atan2(-Math.cos(a), -Math.sin(a)), { W, D, seed: 500 + i, lift: .55 });
    });
    // the footpath along the terrace, stopping either side of the stair landing
    const PR = t.r1 - 3.6, path = std({ color: 0x8a7458, roughness: 1, side: THREE.DoubleSide });
    [[th - 1.55, 1.5], [th + .05, .4]].forEach(([a0, len]) => {
      const m = flat(mesh(new THREE.RingGeometry(PR - .8, PR + .8, Math.ceil(len * 40), 1, a0, len), path, cx, t.y - .05, cz, g));
      m.rotation.x = Math.PI / 2; m.receiveShadow = true;
    });
    // lamps between the huts, on the hut side of the path, their arms out over it
    const lamps = [];
    [-1.4, -1.2, -1.0, -.82, -.65, -.48, -.31, -.12, .12, .3].forEach(o => {
      const a = th + o, [x, z] = at(a, PR + 1.3);
      lamps.push([o, villageLamp(g, x, t.y - .08, z, Math.atan2(Math.sin(a), -Math.cos(a)))]);
    });
    lampWires(g, lamps.filter(([o]) => o < 0).map(l => l[1]));
    lampWires(g, lamps.filter(([o]) => o > 0).map(l => l[1]));
  }
  // a small village of bamboo huts west of the town, off the street, either side of a dirt lane lit by lamps on bamboo poles,
  // with banana clumps and shade trees in the yards
  function hutVillage(g) {
    const X = -97, Z0 = 2.4, Z1 = 47.6,   // the lane runs from the street to the hospital's forecourt
      dirt = std({ color: 0x8a7458, roughness: 1 });
    flat(mesh(new THREE.BoxGeometry(3, .04, Z1 - Z0), dirt, X, .03, (Z0 + Z1) / 2, g)).receiveShadow = true;
    [[X - 6.2, 40, Math.PI / 2], [X - 6.2, 30, Math.PI / 2], [X - 6.6, 19, Math.PI / 2], [X - 6.2, 8.5, Math.PI / 2],
     [X + 6.2, 36, -Math.PI / 2], [X + 6.4, 24.5, -Math.PI / 2], [X + 6.2, 15, -Math.PI / 2]]
      .forEach(([x, z, ry], i) => villageHut(g, x, z, ry, { W: 4.4 + (i % 3) * .4, D: 3.8 + (i % 2) * .5, seed: 600 + i }));
    lampWires(g, [44, 30, 18, 6].map(z => villageLamp(g, X + 1.9, 0, z, Math.PI, true)));   // in the gaps between the east huts' ladders
    [[X - 4, 46], [X + 4, 45], [X - 11, 25], [X - 11.5, 36], [X + 5, 4], [X - 4, 2]].forEach(([x, z], i) => banana(g, x, z, 700 + i));
    [[X - 12.5, 31], [X - 12, 14], [X + 2.5, 1]].forEach(([x, z], i) => tree(g, x, z, .85 + i * .08, 720 + i));
  }
  /* ---------- Halloween night: one small friendly ghost, round-headed and smiling with a jack-o'-lantern in its hand, drifts along
     the streets and lanes, choosing a way at random at every corner. It is never scary: it stops and waves when someone comes
     near, and keeps its distance. The pole lights it passes flicker on and off, then come back on behind it ---------- */
  // the roads it walks, in the grounds' frame: nodes [x, z] and the stretches of road between them
  const GHOST_ROADS = {
    nodes: [[-97, 54], [-97, 6], [-70.75, 54], [-70.75, -22], [-41.5, 54], [-41.5, -24], [0, 54], [4.6, 61], [4.6, 69.5], [0, 72],
            [0, 77.5], [0, 105], [-20, 77.5], [41, 77.5], [41, 54], [41, 150], [140, 54]],
    // the street from the hut village to the fire station; the hut lane, the west lane and the town road off it; round the plaza
    // opposite the gate to the plaza lane and the back lane; the market lane
    edges: [[0, 2], [2, 4], [4, 6], [6, 14], [14, 16], [0, 1], [2, 3], [4, 5], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [10, 12], [10, 13],
            [13, 14], [13, 15]]
  };
  function halloweenGhost(g) {
    const { nodes, edges } = GHOST_ROADS, next = nodes.map(() => []);
    edges.forEach(([a, b]) => { next[a].push(b); next[b].push(a); });
    const gh = new THREE.Group(); gh.userData.noCull = true; g.add(gh);
    const body = new THREE.Group(); body.visible = false; gh.add(body);   // the light stays in the scene; only the ghost hides
    // a sheet-like body: a big round head over a narrower middle, flaring to a wavy hem
    const sheet = std({ color: 0xf6f8ff, emissive: 0xcad8ff, emissiveIntensity: .55, roughness: .5, transparent: true, opacity: .9, side: THREE.DoubleSide });
    const sh = lathe([[.4, 0], [.33, .2], [.3, .38], [.36, .58], [.42, .78], [.4, .95], [.32, 1.08], [.18, 1.17], [0, 1.2]], sheet, 32);
    const pos = sh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); if (y < .15) pos.setY(i, y + Math.sin(Math.atan2(pos.getX(i), pos.getZ(i)) * 6) * .06 * (1 - y / .15)); }
    sh.geometry.computeVertexNormals(); body.add(sh);
    // big friendly eyes with a glint, a smile and rosy cheeks, on the front (local +z)
    const ink = std({ color: 0x1a1a24, roughness: .3 }), white = std({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: .6 }), rosy = std({ color: 0xffa0b4, emissive: 0xff8098, emissiveIntensity: .3, roughness: .6 });
    [-1, 1].forEach(sd => {
      const e = mesh(new THREE.SphereGeometry(.065, 12, 10), ink, sd * .13, .84, .385, body); e.scale.set(1, 1.45, .5);
      mesh(new THREE.SphereGeometry(.018, 6, 6), white, sd * .13 + .02, .87, .415, body);
      const ck = mesh(new THREE.CircleGeometry(.05, 12), rosy, sd * .24, .74, .355, body); ck.rotation.y = sd * .6;
    });
    const smile = mesh(new THREE.TorusGeometry(.075, .014, 6, 14, Math.PI), ink, 0, .74, .405, body); smile.rotation.z = Math.PI;
    // stubby arms; the right one waves, the left carries a little jack-o'-lantern
    const arm = sd => {
      const a = new THREE.Group(); a.position.set(sd * .3, .55, .02); body.add(a);
      mesh(new THREE.SphereGeometry(.09, 10, 8), sheet, sd * .1, 0, 0, a).scale.set(1.5, .75, .75);
      return a;
    };
    const armR = arm(1), armL = arm(-1);
    armL.rotation.z = .35;
    const pumpkin = mesh(new THREE.SphereGeometry(.1, 12, 8), std({ color: 0xe86a10, emissive: 0xff7a10, emissiveIntensity: .45, roughness: .6 }), -.2, -.12, .1, armL);
    pumpkin.scale.y = .8;
    mesh(new THREE.CylinderGeometry(.012, .016, .05, 5), std({ color: 0x3a5a1a }), -.2, -.03, .1, armL);
    const pumpkinGlow = glowSprite(0xff8a20, .5, .6); pumpkinGlow.position.set(-.2, -.12, .14); armL.add(pumpkinGlow);
    const halo = glowSprite(0xd8e4ff, 2.6, .3); halo.position.y = .6; body.add(halo);
    body.traverse(o => { if (o.isMesh) o.castShadow = false; });
    const light = new THREE.PointLight(0xcfdcff, 0, 7, 2); light.position.y = .7; gh.add(light);   // a soft pale light on the road

    // walking: from node `a` to node `b`; at each corner it picks a road at random, not straight back unless it is a dead end
    const r = rng(1031);
    let a = 6, b = 14, along = 0, heading = 0, pause = 0, greet = 0;
    const pick = (at, from) => { const opts = next[at].filter(n => n !== from); const l = opts.length ? opts : next[at]; return l[(r() * l.length) | 0]; };
    const flick = [];   // per pole light: lit or not, and how long until it next blinks (lights built after this join in)
    const SPEED = 1.3, NEAR = 7.5;
    updaters.pagoda.push((dt, t, motion) => {
      const on = FEST.on && daylight < .5;
      body.visible = on; light.intensity = on ? .9 : 0;
      if (!on) { FEST.ghost = null; flick.forEach((f, i) => { if (f && !f.lit) { f.lit = true; poleLights[i].set(true); } }); return; }
      const [ax, az] = nodes[a], [bx, bz] = nodes[b], len = Math.hypot(bx - ax, bz - az);
      let x = ax + (bx - ax) * along / len, z = az + (bz - az) * along / len;
      // someone near: stop, turn to them and wave for a while, then carry on
      const eye = FEST.eye, dEye = eye ? Math.hypot(eye.x - x, eye.z - z) : Infinity;
      if (dEye < 4 && pause <= 0 && greet <= 0) { pause = 5; greet = 12; }
      greet -= dt;
      let face = Math.atan2(bx - ax, bz - az);
      if (pause > 0) { pause -= dt; if (eye) face = Math.atan2(eye.x - x, eye.z - z); }
      else {
        along += SPEED * dt;
        if (along >= len) { along -= len; const from = a; a = b; b = pick(b, from); }
      }
      heading += Math.atan2(Math.sin(face - heading), Math.cos(face - heading)) * Math.min(1, dt * 3);
      const w = walkAt(x, z), ground = w === null ? terrainAt(x, z) : w;
      gh.position.set(x, ground + .35 + Math.sin(t * 2.1) * .08 * motion, z);
      gh.rotation.y = heading;
      body.rotation.z = Math.sin(t * 1.3) * .06 * motion;
      armR.rotation.z = pause > 0 ? -.9 - Math.sin(t * 9) * .45 : -.2 - Math.sin(t * 2) * .1 * motion;
      // the pole lights near it flicker: off and on at random, quicker off than on, and steady again once it has gone by
      poleLights.forEach((p, i) => {
        const f = flick[i] || (flick[i] = { lit: true, t: 0 });
        if (Math.hypot(p.x - x, p.z - z) > NEAR) { if (!f.lit) { f.lit = true; p.set(true); } return; }
        if ((f.t -= dt) > 0) return;
        f.lit = !f.lit; p.set(f.lit);
        f.t = f.lit ? .08 + Math.random() * .4 : .04 + Math.random() * .16;
      });
      FEST.ghost = { x, z };
    });
  }
  /* ---------- the town's public buildings, in the plain painted concrete of Shan State towns today: the township hospital by the
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
    for (let f = 0; f < floors; f++) {
      const y0 = .3 + f * FH;
      mesh(new THREE.BoxGeometry(W + .12, .22, D + .12), trim, 0, y0 + FH - .11, 0, h);
      for (let i = 0; i < nx; i++) {
        const px = -W / 2 + W * (i + .5) / nx;
        if (!(f === 0 && (o.blankFront || (o.door && Math.abs(px) < 1.6)))) wins.push([px, y0 + 1.7, D / 2 + .02, 0]);
        wins.push([px, y0 + 1.7, -D / 2 - .02, 0]);
      }
      for (let i = 0; i < nz; i++) { const pz = -D / 2 + D * (i + .5) / nz; wins.push([W / 2 + .02, y0 + 1.7, pz, Math.PI / 2], [-W / 2 - .02, y0 + 1.7, pz, Math.PI / 2]); }
    }
    const im = new THREE.InstancedMesh(civicWin, townGlass, wins.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    wins.forEach(([px, py, pz, a], i) => im.setMatrixAt(i, m4.compose(V(px, py, pz), q.setFromAxisAngle(V(0, 1, 0), a), V(1, 1, 1))));
    h.add(im);
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
  // ဆေးရုံ, the township hospital: two storeys with an open corridor along the front, a drive-in porch with a red cross, an
  // ambulance at the door; its forecourt closes the north end of the hut village's lane
  function hospital(g) {
    const X = -103, Z = -14, data = { tip: "The township hospital", toast: "The township hospital serves the town and the villages round it: an outpatient hall and wards on two floors, opening onto long open corridors where families wait. The ambulance stands ready at the porch." };
    flat(mesh(new THREE.BoxGeometry(30, .05, 9.8), forecourt, X, .03, -2.4, g)).receiveShadow = true;
    const { h } = civic(g, X, Z, 0, { W: 26, D: 9, floors: 2, wall: civicWhite, trim: civicBlue, roof: ROOFS[2](1), corridor: 2.4, door: true, data });
    // the porch over the drive: a slab on two columns, a red cross on its fascia, the sign above
    const pz = 4.5 + 2.4 + 2.4;
    clickable(picks.pagoda, mesh(new THREE.BoxGeometry(8, .9, 4.8), civicWhite, 0, 3.75, pz, h), data);
    [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(.35, 3.4, .35), civicWhite, sd * 3.7, 1.7, pz + 2.2, h); sCircle(h, sd * 3.7, pz + 2.2, .25); });
    mesh(new THREE.BoxGeometry(.8, .24, .06), civicRed, 0, 3.75, pz + 2.43, h); mesh(new THREE.BoxGeometry(.24, .8, .06), civicRed, 0, 3.75, pz + 2.43, h);
    const porchLight = std({ color: 0xfff8e8, emissive: 0xfff0d0, emissiveIntensity: 0 });
    onDaylight(d => porchLight.emissiveIntensity = .9 * (1 - d));
    mesh(new THREE.BoxGeometry(6, .05, 3), porchLight, 0, 3.3, pz, h);
    civicSign(h, "ဆေးရုံ", "Township Hospital", "#ffffff", "#1f4a8a", 5.5, 0, 5.1, pz + 2);   // standing on the porch
    const rc = new THREE.Group(); rc.position.set(0, 9.1, 4.5 + 1.2); h.add(rc);   // a big red cross on the roof's front
    mesh(new THREE.BoxGeometry(2.4, 2.4, .2), civicWhite, 0, 0, 0, rc); mesh(new THREE.BoxGeometry(1.8, .55, .25), civicRed, 0, 0, 0, rc); mesh(new THREE.BoxGeometry(.55, 1.8, .25), civicRed, 0, 0, 0, rc);
    vehicle(g, X + 1.2, .2, Math.PI / 2, { L: 5.2, H: 2.6, body: civicWhite, stripe: civicRed });
    [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(2.2, .1, .5), M.wood, X + sd * 8, .45, -6.4, g); sRect(g, X + sd * 8 - 1.1, X + sd * 8 + 1.1, -6.65, -6.15); });   // benches for the waiting
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
  function backStreets(g) {
    const lane = std({ color: 0x7e7a72, roughness: .9 }), drain = std({ color: 0x3a3632, roughness: .9 });
    const inLane = (x, z, skip) => LANES.some((l, i) => i !== skip && x > l.x0 - .5 && x < l.x1 + .5 && z > l.z0 - .5 && z < l.z1 + .5);
    LANES.forEach((l, i) => {
      const w = l.x1 - l.x0, d = l.z1 - l.z0, along = d > w, mx = (l.x0 + l.x1) / 2, mz = (l.z0 + l.z1) / 2, y = .025 + i * .004;
      flat(mesh(new THREE.BoxGeometry(w, .04, d), lane, mx, y, mz, g));
      // open concrete drains along both edges
      [-1, 1].forEach(sd => flat(mesh(along ? new THREE.BoxGeometry(.35, .045, d) : new THREE.BoxGeometry(w, .045, .35), drain, along ? mx + sd * (w / 2 - .18) : mx, y, along ? mz : mz + sd * (d / 2 - .18), g)));
      // wooden power poles carrying the wires down the lane, each with a village lamp out over it, lit at night
      const n = Math.floor(Math.max(w, d) / 14), tops = [];
      for (let k = 0; k <= n; k++) {
        const f = (k + .5) / (n + 1), px = along ? l.x1 - .15 : l.x0 + f * w, pz = along ? l.z0 + f * d : l.z0 + .15;
        if (inLane(px, pz, i)) continue;
        tops.push(villageLamp(g, px, y, pz, along ? Math.PI : -Math.PI / 2));
      }
      lampWires(g, tops);
    });
    // the houses: concrete and wooden, one and two storeys, in turn
    const KINDS = [[false, 1], [true, 1], [false, 2], [true, 2], [true, 1], [false, 1], [true, 2], [false, 2]];
    let seq = 0;
    const house = (cx, cz, ry, W, D) => {
      const [wood, floors] = KINDS[seq % KINDS.length], seed = 200 + seq++;
      if (wood) shanWoodHouse(g, cx, cz, ry, { W, D, floors, seed, roof: seed % 3 ? rustRoof : ROOFS[seed % 4](1) });
      else shanHouse(g, cx, cz, ry, { W, D, floors, shop: false, seed, wall: WALLS[(seed * 5) % WALLS.length], roof: ROOFS[seed % 4] });
    };
    // a row of houses along a lane, from a to b along its axis; place(centre, W, D)
    const row = (a, b, place) => {
      for (let p = a; ;) {
        const W = 6 + (seq * 7 % 3) * .5, D = 6 + (seq * 3 % 3) * .5;
        if (p + W > b) break;
        place(p + W / 2, W, D); p += W + 1.8;
      }
    };
    const [L1, L2, L3, L4] = LANES, SET = 2.75;   // SET: from the lane edge to the house front (room for a wooden stair or a front wall)
    row(L1.x0 + 1, L2.x0 - 1.2, (c, W, D) => house(c, L1.z1 + SET + D / 2, Math.PI, W, D));            // back lane, south side
    row(L2.x1 + 1.2, L3.x0 - 1.2, (c, W, D) => house(c, L1.z1 + SET + D / 2, Math.PI, W, D));
    row(92.5, L2.z1, (c, W, D) => house(L2.x0 - SET - D / 2, c, Math.PI / 2, W, D));                    // plaza lane, both sides
    row(92.5, L2.z1, (c, W, D) => house(L2.x1 + SET + D / 2, c, -Math.PI / 2, W, D));
    row(92.5, 108, (c, W, D) => house(L3.x0 - SET - D / 2, c, Math.PI / 2, W, D));                      // market lane, west side
    row(L4.z0 + 1, L4.z1 - 4, (c, W, D) => house(L4.x0 - SET - D / 2, c, Math.PI / 2, W, D));          // west lane, both sides facing it
    row(L4.z0 + 1, L4.z1 - 4, (c, W, D) => house(L4.x1 + SET + D / 2, c, -Math.PI / 2, W, D));         // (back to back with the town-road houses)
    // gardens: shade trees and banana clumps behind and between the houses
    [[15, 96], [24, 104], [-14, 98], [-86, 30], [-86.5, 8], [-86, -12]].forEach(([x, z], i) => tree(g, x, z, .8 + (i % 3) * .1, 300 + i));
    [[14, 93], [20, 99], [26, 95], [-12, 104], [-85.5, 40], [-85.5, 19], [-86, -2], [-85.5, -20]].forEach(([x, z], i) => banana(g, x, z, 400 + i));
    // the old banyan on the corner of the market lane and the street
    banyan(g, 36.4, 65.4);
  }
  /* ---------- beyond the paddy fields: a band of forest, then the forested Shan hills rising in two ranges toward the horizon ---------- */
  function mountainsAndForest(g) {
    const r = rng(2024);
    const near = std({ color: 0x3e5a34, roughness: 1, flatShading: true }), far = std({ color: 0x4a6a6a, roughness: 1, flatShading: true });
    onDaylight(d => { near.color.copy(lerpC(0x141c12, 0x2a4422, d)); far.color.copy(lerpC(0x161c26, 0x3a5656, d)); });
    const peaks = [];
    // a craggy peak: a cone with its rings pushed in and out
    function peak(x, z, rad, h, mat) {
      const geo = new THREE.ConeGeometry(rad, h, 11, 6), p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i), t = (y + h / 2) / h;
        if (t > .98) continue;
        const k = 1 + (r() - .5) * .35 * (1 - t);
        p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); p.setY(i, y + (r() - .5) * h * .05 * (1 - t));
      }
      geo.computeVertexNormals();
      const m = mesh(geo, mat, x, h / 2 - .5, z, g); m.castShadow = false; m.rotation.y = r() * TAU;
      peaks.push({ x, z, rad, h });
    }
    // two ranges along an arc behind the fields: lower, greener hills in front; taller, bluer ridges behind
    for (let i = 0; i <= 12; i++) {
      const a = -1.45 + i / 12 * 2.9;
      const d1 = 150 + r() * 12, d2 = 182 + r() * 8;
      peak(Math.sin(a) * d1, -Math.cos(a) * d1, 30 + r() * 16, 24 + r() * 18, near);
      if (i % 2 === 0 || r() < .5) peak(Math.sin(a + .1) * d2, -Math.cos(a + .1) * d2, 26 + r() * 10, 42 + r() * 22, far);
    }
    // the forest: dark conical trees in a band from the field edge to the foothills, and climbing the lower slopes
    const treeGeo = new THREE.ConeGeometry(1, 1, 7); treeGeo.translate(0, .5, 0);
    const greens = [0x2a4a28, 0x34552c, 0x223f22, 0x3c5e30].map(c => new THREE.Color(c));
    const N = 2600, trees = new THREE.InstancedMesh(treeGeo, std({ color: 0xffffff, roughness: .95, flatShading: true }), N), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    let n = 0;
    const put = (x, y, z, s) => { if (n >= N) return; m4.compose(V(x, y, z), q.setFromAxisAngle(V(0, 1, 0), r() * TAU), V(s * .45, s, s * .45)); trees.setMatrixAt(n, m4); trees.setColorAt(n++, greens[(r() * 4) | 0]); };
    for (let i = 0; i < 1500; i++) {   // the band: past the fields' far edge (z < -98), out to the foothills
      const a = -1.5 + r() * 3, d = 100 + r() * 55, x = Math.sin(a) * d, z = -Math.cos(a) * d;
      if (z > -98 && Math.abs(x) < 110) continue;   // keep off the fields
      if (z > -36) continue;                          // and off the town side of the stream
      put(x, 0, z, 3 + r() * 3.5); sCircle(g, x, z, .35);
    }
    peaks.forEach(pk => {   // and up the lower half of each hill
      for (let i = 0; i < 70; i++) {
        const t = r() * .5, a = r() * TAU, rr = pk.rad * (1 - t) * .92;
        put(pk.x + Math.cos(a) * rr, pk.h * t - .5, pk.z + Math.sin(a) * rr, 3 + r() * 2.5);
      }
    });
    trees.count = n; trees.castShadow = false; g.add(trees);
    onDaylight(d => { trees.material.color.copy(lerpC(0x404c40, 0xb8c4b0, d)); });
  }
  /* ---------- 山門 the temple gate: a gate hall under a tiled hipped roof matching the pagoda, red walls running off either side,
     and a pair of stone guardian lions (石獅) in front ---------- */
  // a hipped roof over a rectangle: ax, bz are the eave half-sizes, the ridge runs along x; the corners sweep up by `lift`
  function hipRoof(ax, bz, H, lift, ts) {
    const n = 16, rl = ax - bz, ring = [], pos = [], uv = [], idx = [];
    const per = 4 * (2 * ax + 2 * bz);
    ts.forEach(t => {
      const X = rl + bz * t, Z = bz * t, pts = [];
      for (let j = 0; j < n; j++) { const s = -1 + 2 * j / n; pts.push([s * X, Z, s]); }          // front
      for (let j = 0; j < n; j++) { const s = 1 - 2 * j / n; pts.push([X, s * Z, s]); }          // right
      for (let j = 0; j < n; j++) { const s = 1 - 2 * j / n; pts.push([s * X, -Z, s]); }         // back
      for (let j = 0; j < n; j++) { const s = -1 + 2 * j / n; pts.push([-X, s * Z, s]); }        // left
      pts.forEach(([x, z, s], j) => {
        pos.push(x, H * Math.pow(1 - t, 1.6) + lift * Math.pow(Math.abs(s), 6) * t * t, z);
        uv.push(j / (4 * n) * per * 1.3, t * 2);
      });
      ring.push(pts.length);
    });
    const M4 = 4 * n;
    for (let i = 0; i < ts.length - 1; i++) for (let j = 0; j < M4; j++) {
      const a = i * M4 + j, b = i * M4 + (j + 1) % M4, c = a + M4, d = b + M4;
      idx.push(a, c, b, b, c, d);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    return geo;
  }
  // a tiled hipped roof like the pagoda's: slate tiles, the red eave board and underside, a main ridge with curled ends,
  // and a hip ridge down each corner ending in an upturned tip; `ts` can start above 0 to make just the skirt of an eave
  // incense ash: a soft grey bed flecked with darker ash and the stubs of burnt sticks
  const ashTex = canvasTex(128, (c, sz) => {
    c.fillStyle = "#a39d94"; c.fillRect(0, 0, sz, sz);
    const r = rng(5);
    for (let i = 0; i < 900; i++) { const v = 120 + r() * 70 | 0; c.fillStyle = `rgba(${v},${v - 4},${v - 10},.6)`; c.fillRect(r() * sz, r() * sz, 2, 2); }
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${150 + r() * 60 | 0},${70 + r() * 30 | 0},40,.7)`; c.beginPath(); c.arc(r() * sz, r() * sz, 1.5, 0, TAU); c.fill(); }
  });
  const ashMat = std({ map: ashTex, roughness: 1 });
  // a gently mounded bed of ash of radius r
  const ashBed = r => {
    const geo = new THREE.CircleGeometry(r, 40, 0, TAU), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const d = Math.hypot(p.getX(i), p.getY(i)) / r; p.setZ(i, (1 - d * d) * r * .12); }
    geo.computeVertexNormals(); return geo;
  };
  function tiledHipRoof(g, x, z, foot, AX, BZ, RH, LIFT, ts, tipScale = 1, ridgeTop = true) {
    mesh(hipRoof(AX, BZ, RH, LIFT, ts), roofMat, x, foot, z, g);
    mesh(hipRoof(AX, BZ, RH, LIFT, [.93, .965, 1]), eaveRed, x, foot, z, g);
    flat(mesh(hipRoof(AX, BZ, RH, LIFT, [...ts, .965, 1]), eaveRed, x, foot - .06, z, g));
    if (ridgeTop) {
      mesh(new THREE.BoxGeometry(2 * (AX - BZ) + .3, .3, .3), ridgeMat, x, foot + RH + .1, z, g);
      [-1, 1].forEach(sx => {
        const end = mesh(new THREE.TorusGeometry(.32, .09, 8, 18, Math.PI * 1.3), ridgeMat, x + sx * (AX - BZ + .15), foot + RH + .5, z, g);
        end.rotation.set(0, sx < 0 ? Math.PI : 0, -Math.PI * .15);   // mirrored on the left end
      });
    }
    const t0 = ts[0];
    [-1, 1].forEach(sx => [-1, 1].forEach(sz => {
      const pts = []; for (let i = 0; i <= 12; i++) { const t = t0 + (1 - t0) * i / 12; pts.push(V(x + sx * (AX - BZ + BZ * t), foot + RH * Math.pow(1 - t, 1.6) + LIFT * t * t + .08, z + sz * BZ * t)); }
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .09, 6), ridgeMat, 0, 0, 0, g);
      const tip = mesh(tipGeo, ridgeMat, pts[12].x, pts[12].y + .22, pts[12].z, g);
      tip.rotation.set(sz * .75, 0, -sx * .75); tip.scale.setScalar(tipScale);
    }));
  }
  function gate(g, z) {
    const COLS = [-4.2, -1.8, 1.8, 4.2], ROWS = [-1.2, 1.2], CH = 4.6, base = .3;
    COLS.forEach(x => ROWS.forEach(dz => BLOCK.posts.push([x, z + dz, .55])));
    BLOCK.segs.push([-5.2, z, -1.95, z], [1.95, z, 5.2, z]);       // the side bays' walls; the middle bay is the way through
    [-3.2, 3.2].forEach(x => BLOCK.posts.push([x, z + 3.4, 1.2]));   // the guardian lions
    mesh(new THREE.BoxGeometry(10.4, base, 4.2), M.stone, 0, base / 2, z, g);
    mesh(new THREE.BoxGeometry(4.2, base / 2, 1.2), M.stone, 0, base / 4, z + 2.6, g);
    COLS.forEach(x => ROWS.forEach(dz => {
      mesh(new THREE.CylinderGeometry(.26, .29, CH, 16), pillarRed, x, base + CH / 2, z + dz, g);
      mesh(new THREE.CylinderGeometry(.38, .4, .16, 16), M.stone, x, base + .08, z + dz, g);
    }));
    // side bays: red walls with carved panels, the middle bay left open for the path
    [-1, 1].forEach(sd => {
      const x = sd * 3;
      mesh(new THREE.BoxGeometry(2.1, CH, .3), pillarRed, x, base + CH / 2, z, g);
      latticeWindows(g, [{ p: V(x, base + 2.4, z + .16), ry: 0, w: 1.4, h: 2.6 }], std({ color: 0x1a0c08, emissive: 0x3a1a0a, emissiveIntensity: .6 }));
    });
    // painted beams front and back, gold brackets above, then the roof
    const T = base + CH;
    ROWS.forEach(dz => {
      mesh(new THREE.BoxGeometry(9.2, .55, .34), beamMat, 0, T - .3, z + dz, g);
      mesh(new THREE.BoxGeometry(9.2, .22, .36), pillarRed, 0, T + .08, z + dz, g);
      for (let x = -4.2; x <= 4.21; x += .6) {
        mesh(new THREE.BoxGeometry(.18, .16, .3), M.trim, x, T + .27, z + dz + Math.sign(dz) * .1, g);
        mesh(new THREE.BoxGeometry(.32, .12, .46), paintGreen, x, T + .41, z + dz + Math.sign(dz) * .2, g);
      }
    });
    const foot = T + .45, AX = 5.8, BZ = 3.0, RH = 2.4, LIFT = .7;
    const ts = [0, .1, .2, .3, .4, .5, .6, .7, .8, .88, .93];
    tiledHipRoof(g, 0, z, foot, AX, BZ, RH, LIFT, ts, 1.3);
    const plaque = writing(512, 192, (c, w, h) => {
      c.fillStyle = "#16233d"; c.fillRect(0, 0, w, h);
      c.strokeStyle = "#d6a94a"; c.lineWidth = 14; c.strokeRect(10, 10, w - 20, h - 20);
      c.fillStyle = "#e8c25a"; c.font = HAN_FONT(118); c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("蓮華寺", w / 2, h / 2 + 6);
    });
    mesh(new THREE.BoxGeometry(2.2, .9, .08), M.trim, 0, T - .95, z + 1.42, g);
    flat(mesh(new THREE.PlaneGeometry(2.0, .75), new THREE.MeshStandardMaterial({ map: plaque, roughness: .6, emissive: 0x222222, emissiveMap: plaque }), 0, T - .95, z + 1.47, g));
    // red walls with orange tiled coping running off to either side
    [-1, 1].forEach(sd => {
      const x0 = 5.2, x1 = 33, cx = sd * (x0 + x1) / 2, w = x1 - x0, WH = 3.2;
      mesh(new THREE.BoxGeometry(w, .5, .7), M.stone, cx, .25, z, g);
      mesh(new THREE.BoxGeometry(w, WH, .5), pillarRed, cx, WH / 2, z, g);
      mesh(new THREE.BoxGeometry(w, .2, .62), beamMat, cx, WH - .2, z, g);
      [-1, 1].forEach(f => { const c = mesh(new THREE.BoxGeometry(w + .2, .08, .62), roofMat, cx, WH + .18, z + f * .26, g); c.rotation.x = f * .5; });
      [-1, 1].forEach(f => mesh(new THREE.BoxGeometry(w + .2, .1, .04), eaveRed, cx, WH + .05, z + f * .55, g));   // red eave edge
      mesh(new THREE.BoxGeometry(w + .2, .14, .16), ridgeMat, cx, WH + .34, z, g);
    });
    // hedges inside the gate, lining the path
    const hedge = std({ color: 0x2f5a26, roughness: .9 });
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.9, .7, 3.6), hedge, sd * 3.8, .35, z - 3.2, g));
    // the lions face out from the temple, each with its paw on the embroidered ball on the inner side
    [["lion", -3.2], ["lionL", 3.2]].forEach(([fig, x]) => {
      const lg = new THREE.Group(); lg.position.set(x, 0, z + 3.4); lg.scale.setScalar(1.35); g.add(lg);
      sculptFigure(fig, lg, "the guardian lions");
    });
    lantern(g, -1.2, 3.6, z + 1.2, T - .6, .9); lantern(g, 1.2, 3.6, z + 1.2, T - .6, .9);
  }

  /* ---------- 鐘樓 the Bell Tower, its own building beside the pagoda: an open pavilion under the night sky ---------- */
  function bellTower(g, n) {
    const PB = .4;   // top of the pavilion's stone platform
    const list = picks[n] = picks[n] || [], sway = [];
    const sky = canvasTex(256, (c, s) => {
      const l = c.createLinearGradient(0, 0, 0, s);
      l.addColorStop(0, "#0b0a1f"); l.addColorStop(.3, "#2a1f48"); l.addColorStop(.46, "#6a3a4a"); l.addColorStop(.5, "#120a07"); l.addColorStop(1, "#120a07");
      c.fillStyle = l; c.fillRect(0, 0, s, s);
    });
    g.add(new THREE.Mesh(new THREE.SphereGeometry(26, 32, 16), new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide, fog: false })));
    const starPos = [], rs = rng(11);
    for (let i = 0; i < 300; i++) { const a = rs() * TAU, e = .2 + rs() * 1.2; starPos.push(Math.cos(a) * Math.cos(e) * 24, Math.sin(e) * 24, Math.sin(a) * Math.cos(e) * 24); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: .25, color: 0xfff4e0, map: glowTex, transparent: true, depthWrite: false, fog: false })); g.add(stars);
    daySky(g, 26, stars);
    const ground = flat(mesh(new THREE.CircleGeometry(26, 48), std({ color: 0x2a211b, roughness: 1 }), 0, 0, 0, g)); ground.rotation.x = -Math.PI / 2;
    // the pavilion round the bell: stone platform, eight columns, painted beams and ceiling, low balustrade, tiled eave
    const P = new THREE.Group(); P.position.z = -1.6; g.add(P);
    oct(mesh(new THREE.CylinderGeometry(4.6, 4.7, .2, 8), M.stone, 0, .1, 0, P));
    oct(mesh(new THREE.CylinderGeometry(4.2, 4.3, .2, 8), M.stone, 0, .3, 0, P));
    mesh(new THREE.BoxGeometry(2.2, .2, .8), M.stone, 0, .1, 4.6, P);
    const RC = 3.8, TOP = PB + 4.4;
    for (let k = 0; k < 8; k++) {
      const c = k / 8 * TAU + R8, x = Math.sin(c) * RC, z = Math.cos(c) * RC;
      mesh(new THREE.CylinderGeometry(.17, .2, TOP - PB, 16), pillarRed, x, (TOP + PB) / 2, z, P);
      mesh(new THREE.CylinderGeometry(.3, .32, .14, 16), M.stone, x, PB + .07, z, P);
    }
    const rail = new THREE.Group(); rail.position.y = PB; P.add(rail); balustrade(rail, RC - .02, [0], redRail);
    paintedBeam(P, TOP - .3, RC + .03, .6);
    const coffer = canvasTex(512, (c, s) => {
      const h = s / 2; c.fillStyle = "#1f4f3a"; c.fillRect(0, 0, s, s);
      [.92, .7, .48].forEach((r, i) => { c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.beginPath(); for (let k = 0; k <= 8; k++) { const a = k / 8 * TAU + R8; c.lineTo(h + Math.sin(a) * h * r, h + Math.cos(a) * h * r); } c.stroke(); if (i === 1) { c.fillStyle = "#1f4f8a"; c.fill(); } });
      c.fillStyle = "#a42418"; c.beginPath(); c.arc(h, h, h * .3, 0, TAU); c.fill(); c.strokeStyle = "#e8c25a"; c.lineWidth = 6; c.stroke();
    });
    const ceil = flat(mesh(new THREE.CircleGeometry(RC + .05, 8), std({ map: coffer, roughness: .7 }), 0, TOP - .6, 0, P)); ceil.rotation.set(Math.PI / 2, 0, R8);
    brackets(P, TOP - .2, RC + .06, 4);
    tiledEave(P, TOP - .05, 2.6, 5.4, 1.1, .55);
    [-1, 1].forEach(sx => { const c = sx * R8; sway.push(lantern(P, Math.sin(c) * (RC - .5), TOP - 1.4, Math.cos(c) * (RC - .5), TOP - .6, .9)); });
    const hemiB = new THREE.HemisphereLight(0x7080c8, 0x2a1408, .45); g.add(hemiB); dayLight(hemiB, [0x7080c8, .45, 0x2a1408], [0xd8e8ff, 1.0, 0x5a4a38]);
    const moon = new THREE.DirectionalLight(0xb8c4ff, .55); moon.position.set(-8, 10, 6); g.add(moon); dayLight(moon, [0xb8c4ff, .55], [0xfff0d8, 1.4]);
    const key = new THREE.SpotLight(0xffc890, 1.5, 24, .55, .6, 1); key.position.set(2.8, 6, 6.5); key.target.position.set(0, 2.4, -1.6); g.add(key, key.target);
    const warm = new THREE.PointLight(0xffa850, .8, 8, 2); warm.position.set(0, TOP - 1, -1.6); g.add(warm);
    updaters[n].push((dt, t, motion) => sway.forEach((l, i) => l.rotation.z = Math.sin(t * .7 + i * 2) * .03 * motion));
    // the great bronze bell in its frame, with the striking log
    const BX = 0, BZ = -1.6;
    [-1.05, 1.05].forEach(dx => mesh(new THREE.BoxGeometry(.22, 3.6, .22), M.lacquer, BX + dx, PB + 1.8, BZ, g));
    mesh(new THREE.BoxGeometry(2.6, .28, .3), M.lacquer, BX, PB + 3.55, BZ, g);
    mesh(new THREE.BoxGeometry(2.7, .06, .34), M.trim, BX, PB + 3.39, BZ, g);
    const bell = new THREE.Group(); bell.position.set(BX, PB + 3.36, BZ); bell.scale.setScalar(.82); g.add(bell);
    const bellBody = lathe(BELL_PROFILE, M.bronze, 56);
    bellBody.castShadow = true; bell.add(bellBody);
    [-.5, -1.0, -1.5].forEach(y => { const t = mesh(new THREE.TorusGeometry(y < -1.2 ? .62 : .54, .018, 6, 56), M.bronze, 0, y, 0, bell); t.rotation.x = Math.PI / 2; });
    mesh(new THREE.TorusGeometry(.1, .03, 8, 24), M.bronze, 0, .02, 0, bell);
    clickable(list, bellBody, { tip: "Ring the great bell", act: "bell" });
    const logPivot = new THREE.Group(); logPivot.position.set(BX, PB + 3.45, BZ + 1.05); g.add(logPivot);
    [-.6, .6].forEach(dz => mesh(new THREE.CylinderGeometry(.012, .012, 1.4, 4), M.feature, 0, -.7, dz * .2, logPivot));
    const log = mesh(new THREE.CylinderGeometry(.12, .12, 1.3, 20), M.wood, 0, -1.4, .5, logPivot); log.rotation.x = Math.PI / 2;
    actions[n] = act => {
      if (act === "bell") {
        tween(2.6, t => {
          logPivot.rotation.x = t < .35 ? -.3 * Math.sin(Math.PI / 2 * t / .35) : t < .45 ? -.3 + .36 * (t - .35) / .1 : .06 * (1 - clamp((t - .45) / .55, 0, 1)); // draw back, swing in, settle
          const w = t > .42 ? Math.sin((t - .42) * 30) * .025 * (1 - t) : 0;
          bell.rotation.x = w; bell.rotation.z = w * .5;
        });
        setTimeout(() => [[98, .35, 7], [196 * 1.19, .14, 5], [98 * 2.76, .09, 3.5], [98 * 5.4, .04, 2]].forEach(([f, p, d]) => tone(f, null, p, d)), reduceMotion ? 0 : 1100);
      }
    };
  }

  /* ---------- 6F 祈願殿 Wishing Tree ---------- */
  function wishingTree(g, n) {
    shell(g, n, { key: 1.25 });
    const list = picks[n];
    const rnd = rng(7), bark = std({ color: 0x4a3222, roughness: .9 }), leaf = std({ color: 0x2f5a26, roughness: .8, flatShading: true });
    const TX = 0, TZ = -1.4, tips = [];
    const trunk = mesh(new THREE.CylinderGeometry(.24, .4, 1.5, 16), bark, TX, PLAT + .75, TZ, g);
    clickable(list, trunk, { tip: "Hang a wish ribbon", act: "wish" });
    function branch(from, dir, len, rad, depth) {
      const to = from.clone().addScaledVector(dir, len);
      const b = mesh(new THREE.CylinderGeometry(rad * .7, rad, len, 10), bark, 0, 0, 0, g);
      b.position.copy(from).lerp(to, .5); b.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
      if (depth === 0) { tips.push(to); return; }
      const k = depth === 3 ? 4 : 3;
      for (let i = 0; i < k; i++) {
        const a = i / k * TAU + rnd() * .8, tilt = .85 + rnd() * .45;
        const nd = V(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt)).add(dir.clone().multiplyScalar(.6)).normalize();
        branch(to, nd, len * (.95 + rnd() * .2), rad * .62, depth - 1);
      }
    }
    branch(V(TX, PLAT + 1.45, TZ), V(0, 1, 0), .7, .24, 3);
    const leafGeo = new THREE.IcosahedronGeometry(.5, 1);
    tips.forEach(p => { const l = mesh(leafGeo, leaf, p.x, p.y + .1, p.z, g); l.scale.setScalar(.7 + rnd() * .5); });
    // red ribbons and wooden wish plaques hang from the branches
    const ribbonMat = std({ color: 0xc41a10, roughness: .6, side: THREE.DoubleSide, emissive: 0x300000 });
    const ribbons = [];
    function hang(p, animate) {
      const piv = new THREE.Group(); piv.position.copy(p); g.add(piv);
      const len = .35 + rnd() * .35;
      const rb = mesh(new THREE.PlaneGeometry(.05, len), ribbonMat, 0, -len / 2, 0, piv); rb.castShadow = false;
      if (rnd() < .3) { const tag = mesh(new THREE.BoxGeometry(.1, .14, .012), M.wood, 0, -len - .06, 0, piv); tag.castShadow = false; }
      piv.rotation.y = rnd() * TAU;
      const r = { piv, ph: rnd() * TAU, amp: .08 + rnd() * .1 };
      ribbons.push(r);
      if (animate) { piv.scale.y = .01; tween(.8, t => piv.scale.y = Math.max(.01, easeOut(t))); }
      return r;
    }
    tips.forEach(tp => { for (let i = 0; i < 4; i++) hang(V(tp.x + (rnd() - .5) * .7, tp.y - .25 - rnd() * .3, tp.z + (rnd() - .5) * .7), false); });
    // a low stone fence around the tree
    for (let i = 0; i < 20; i++) {
      const a = i / 20 * TAU;
      mesh(new THREE.BoxGeometry(.14, .5, .14), M.stone, TX + Math.cos(a) * 2.2, PLAT + .25, TZ + Math.sin(a) * 2.2, g);
    }
    const fence = mesh(new THREE.TorusGeometry(2.2, .05, 6, 60), M.lacquer, TX, PLAT + .45, TZ, g); fence.rotation.x = Math.PI / 2;
    updaters[n].push((dt, t, motion) => ribbons.forEach(r => { r.piv.rotation.z = Math.sin(t * 1.4 + r.ph) * r.amp * motion; r.piv.rotation.x = Math.sin(t * 1.1 + r.ph * 2) * r.amp * .5 * motion; }));
    actions[n] = () => {
      const tp = tips[(rnd() * tips.length) | 0];
      hang(V(tp.x + (rnd() - .5) * .6, tp.y - .3, tp.z + (rnd() - .5) * .6), true);
      tone(1320, null, .08, .8); tone(1980, null, .04, .6);
      return { toast: "A red ribbon is tied to the wishing tree." };
    };
  }

  /* ---------- 7F 彌勒殿 Maitreya ---------- */
  function maitreyaHall(g, n) {
    statueHall(g, n, {
      figure: "maitreya", label: "Maitreya", petal: M.gold, ring: M.gold, haloColor: 0xffd27a, glow: 0xffb060,
      aura: auraTexture("rgba(255,236,190,.85)", "rgba(255,170,70,.38)", "rgba(255,210,140,.24)")
    });
    // longevity peaches and oranges, and a pile of gold ingots (元寶) at the centre
    const peach = m => { const p = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(.075, 20, 14), m); b.scale.set(1, 1.05, 1); b.castShadow = true; p.add(b); const tip = new THREE.Mesh(new THREE.ConeGeometry(.03, .05, 12), m); tip.position.y = .08; p.add(tip); return p; };
    fruitPlate(g, -1.02, ALT.z - .12, [std({ color: 0xf6b7a6, roughness: .6 }), std({ color: 0xf29a8a, roughness: .6 })], peach);
    fruitPlate(g, 1.02, ALT.z - .12, [std({ color: 0xf0881c, roughness: .55 })], sphereFruit);
    const ingot = () => { const i = new THREE.Group(); const b = new THREE.Mesh(petalGeo, M.gold); b.scale.set(.1, .045, .06); i.add(b); const k = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 8), M.gold); k.position.y = .035; i.add(k); return i; };
    [[0, 0, 0], [-.13, 0, .05], [.13, 0, .05], [-.06, .07, .02], [.07, .07, .02], [0, .13, .03]].forEach(([x, y, z]) => { const i = ingot(); i.position.set(x, ALT.y + .05 + y, ALT.z + .15 + z); g.add(i); });
  }

  const BUILD = { 2: lampHall, 3: meditationHall, 4: medicineHall, 5: teaRoom, 6: wishingTree, 7: maitreyaHall, bell: bellTower, library, shop, quarters };
  function floor(n) {
    if (!groups[n]) {
      const g = new THREE.Group(); g.name = "floor" + n; world.add(g);
      updaters[n] = updaters[n] || [];
      BUILD[n](g, n);
      groups[n] = g;
    }
    return groups[n];
  }

  /* ---------- the pagoda from outside ---------- */
  function buildPagoda() {
    const g = new THREE.Group(); g.name = "pagoda"; world.add(g);
    updaters.pagoda = [];
    const list = picks.pagoda = [];
    const skyTex = canvasTex(256, (c, s) => {
      const l = c.createLinearGradient(0, 0, 0, s);
      l.addColorStop(0, "#0b0a1f"); l.addColorStop(.38, "#2a1f48"); l.addColorStop(.48, "#8a4a52"); l.addColorStop(.52, "#2b1a14"); l.addColorStop(1, "#0d0806");
      c.fillStyle = l; c.fillRect(0, 0, s, s);
    });
    g.add(new THREE.Mesh(new THREE.SphereGeometry(220, 48, 24), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })));
    const starPos = [], rs = rng(5);
    for (let i = 0; i < 700; i++) { const a = rs() * TAU, e = .15 + rs() * 1.3; starPos.push(Math.cos(a) * Math.cos(e) * 200, Math.sin(e) * 200, Math.sin(a) * Math.cos(e) * 200); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.2, color: 0xfff4e0, map: glowTex, transparent: true, depthWrite: false, fog: false })); g.add(stars);
    daySky(g, 220, stars, .3);   // from outside the camera looks down on the temple, so the sky it sees is low
    const groundMat = std({ color: 0x1c1712, roughness: 1 });
    const ground = flat(mesh(new THREE.CircleGeometry(262, 72), groundMat, 0, 0, 0, g)); ground.rotation.x = -Math.PI / 2;
    onDaylight(d => groundMat.color.copy(lerpC(0x1c1712, 0x5a5440, d)));
    // the base: a red timber deck on posts, ringed by a red balustrade, with a broad stone stair up the front
    const DECK = 1.3, RD = 7.6, APD = RD * Math.cos(R8), STAIR = 3.4;
    const wallCream = std({ color: 0xece4d4, roughness: .7 }), deckMat = std({ color: 0x5a1f14, roughness: .7 });
    oct(mesh(new THREE.CylinderGeometry(RD + .5, RD + .7, .16, 8), M.stone, 0, .08, 0, g));
    oct(mesh(new THREE.CylinderGeometry(RD, RD, .22, 8), deckMat, 0, DECK - .11, 0, g));
    oct(mesh(new THREE.CylinderGeometry(RD + .03, RD + .03, .24, 8, 1, true), pillarRed, 0, DECK - .34, 0, g));
    [[RD - .2, 16], [RD * .62, 8]].forEach(([rr, n]) => {
      for (let k = 0; k < n; k++) {
        const a = k / n * TAU + (n === 16 ? 0 : R8), rad = n === 16 ? (k % 2 ? rr : rr * Math.cos(R8)) : rr;   // the outer ring on corners and mid-faces
        const ang = n === 16 ? (k % 2 ? a : a) : a, x = Math.sin(ang) * rad, z = Math.cos(ang) * rad;
        if (Math.abs(x) < STAIR / 2 + .2 && Math.abs(z) > RD * .5) continue;   // keep the front and back stairs clear
        mesh(new THREE.CylinderGeometry(.15, .17, DECK - .3, 10), pillarRed, x, .16 + (DECK - .46) / 2, z, g);
      }
    });
    const deckRail = new THREE.Group(); deckRail.position.y = DECK; g.add(deckRail); balustrade(deckRail, RD - .08, [0, 4], redRail, STAIR + .3);   // openings for the front stair and the river-side stair
    const STEPS = 7, rise = DECK / STEPS, run = .36;
    WALKABLE.pagoda = { DECK, APD, STAIR, stairRun: STEPS * run, wall: 4.6 * Math.cos(R8) };
    // the same stair at the front (toward the gate and the pond) and at the back (toward the river gate)
    [1, -1].forEach(dir => {
      for (let i = 0; i < STEPS; i++) mesh(new THREE.BoxGeometry(STAIR, DECK - i * rise, run), M.stone, 0, (DECK - i * rise) / 2, dir * (APD + run / 2 + i * run), g);
      [-1, 1].forEach(sx => {   // red stringers either side of the stair
        const len = Math.hypot(STEPS * run, DECK), sg = mesh(new THREE.BoxGeometry(.16, .24, len), pillarRed, sx * (STAIR / 2 + .08), DECK / 2 + .1, dir * (APD + STEPS * run / 2), g);
        sg.rotation.x = dir * Math.atan2(DECK, STEPS * run);
      });
    });
    // each storey: cream walls between red corner columns, tall red lattice windows, gold brackets under a curved slate eave,
    // and from the second storey up a walkway with a red balustrade
    let y = DECK;
    const storeys = [], eaveCorners = [];
    for (let i = 0; i < FLOORS.length; i++) {
      const r = 4.6 - i * .42, h = i ? 2.4 : 4.6, f = i + 1, info = FLOORS[i];
      const st = new THREE.Group(); st.position.y = y; g.add(st);
      const wall = oct(mesh(new THREE.CylinderGeometry(r, r, h, 8), wallCream, 0, h / 2, 0, st));
      oct(mesh(new THREE.CylinderGeometry(r + .03, r + .03, .3, 8), pillarRed, 0, h - .15, 0, st));
      oct(mesh(new THREE.CylinderGeometry(r + .03, r + .03, .2, 8), pillarRed, 0, .1, 0, st));
      for (let k = 0; k < 8; k++) { const c = k / 8 * TAU + R8; mesh(new THREE.CylinderGeometry(.13, .13, h, 10), pillarRed, Math.sin(c) * (r - .02), h / 2, Math.cos(c) * (r - .02), st); }
      const winMatS = std({ color: 0x3a1608, emissive: info.statue ? 0xffb050 : 0xff8a3a, emissiveIntensity: info.statue ? 1 : .7 });
      const apo = r * Math.cos(R8), bars = [];
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * TAU, ww = r * .4, wh = h * (i ? .58 : .55), wy = i ? h * .47 : h * .42;
        if (i === 0 && k === 0) {   // the main door faces the stair, under the pagoda's name board
          doorway(st, 0, 0, apo + .02, 0, 2.0, 2.5, "觀音殿", { floor: 1, tip: "Enter the main hall · 1F" }, list);
          const tex = writing(768, 192, (c, cw, ch) => {
            c.fillStyle = "#f4ecd8"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#c9a04a"; c.lineWidth = 10; c.strokeRect(6, 6, cw - 12, ch - 12);
            c.fillStyle = "#3a1a10"; c.font = HAN_FONT(120); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("蓮 華 塔", cw / 2, ch / 2 + 8);
          });
          flat(mesh(new THREE.PlaneGeometry(2.9, .72), new THREE.MeshStandardMaterial({ map: tex, roughness: .7, emissive: 0x3a362c, emissiveMap: tex }), 0, h - .75, apo + .03, st));
          continue;
        }
        if (i === 0 && k === 4) {   // the back door, at the top of the river-side stair
          doorway(st, 0, 0, -(apo + .02), Math.PI, 2.0, 2.5, null, { floor: 1, tip: "Enter the main hall by the back door · 1F" }, list);
          continue;
        }
        const p = V(Math.sin(a) * (apo + .02), wy, Math.cos(a) * (apo + .02));
        bars.push({ p, ry: a, w: ww, h: wh });
        const w = mesh(new THREE.PlaneGeometry(ww, wh), winMatS, p.x, p.y, p.z, st);
        w.rotation.y = a; w.castShadow = false;
        clickable(list, w, { floor: f, tip: floorName(f) });
        const fr = mesh(new THREE.BoxGeometry(ww + .2, wh + .2, .05), pillarRed, Math.sin(a) * (apo + .005), wy, Math.cos(a) * (apo + .005), st); fr.rotation.y = a;
      }
      latticeScreens(st, bars);
      clickable(list, wall, { floor: f, tip: floorName(f) });
      // gold brackets under the eave; the eave's foot sits just below the wall top, its corners sweep up by `lift`
      brackets(st, h - .32, r + .04, 3, [M.trim, pillarRed, M.trim]);
      const rOut = r + 1.6, eh = .7, lift = .75, foot = h - .1;
      tiledEave(st, foot, r * .9, rOut, eh, lift);
      oct(mesh(new THREE.CylinderGeometry(r * .9, r * .9, .08, 8), pillarRed, 0, foot + eh, 0, st));
      if (i) {   // the walkway round this storey, resting on the eave below
        oct(mesh(new THREE.CylinderGeometry(r + .85, r + .85, .14, 8), deckMat, 0, .07, 0, st));
        oct(mesh(new THREE.CylinderGeometry(r + .87, r + .87, .1, 8, 1, true), pillarRed, 0, .05, 0, st));
        const bs = new THREE.Group(); bs.position.y = .14; st.add(bs); balustrade(bs, r + .78, [], redRail);
      }
      storeys.push({ f, winMat: winMatS, base: winMatS.emissiveIntensity });
      if (i === 0) for (let k = 0; k < 8; k++) { const c = k / 8 * TAU + R8; eaveCorners.push(V(Math.sin(c) * (rOut - .2), y + foot + lift - .1, Math.cos(c) * (rOut - .2))); }
      STOREY_Y[f] = y;   // the height of this storey's floor, for the view from its corridor
      y += h + .82;
    }
    // the Bell Tower on the left: an open eight-sided pavilion, the bronze bell hanging between red columns
    // under two tiers of tiled eaves, with painted beams, brackets and a low white balustrade
    function bellPavilion(o) {
      const b = new THREE.Group(); b.position.set(o.x, 0, o.z); g.add(b);
      const pl = PLACES[o.place], data = { tip: "The Bell Tower" }, ring = { ringBell: true, tip: "Ring the great bell" };
      // walkable: the two-step platform, open at the front; the bell, columns and balustrade block
      const COLS = []; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + R8; COLS.push([Math.sin(a) * 3.0, Math.cos(a) * 3.0]); }
      sRect(b, -4.1, 4.1, -4.1, 4.4, (lx, lz) => {
        const r = Math.hypot(lx, lz);
        if (r < 1.0) return null;                                                         // the bell and the striking log
        if (COLS.some(([cx, cz]) => Math.hypot(lx - cx, lz - cz) < .45)) return null;     // the columns
        if (r < 2.8) return .7;
        if (r < 3.2) return lz > 0 && Math.abs(lx) < 1.1 ? .7 : null;                      // the balustrade, open at the front
        if (r < 3.6) return .7;
        if (r < 4.0) return .35;
        if (Math.abs(lx) < .95 && lz < 4.4) return .175;                                   // the front step
        return 0;
      });
      const at = (a, r, y) => V(Math.sin(a) * r, y, Math.cos(a) * r);
      // stone platform and front steps
      oct(mesh(new THREE.CylinderGeometry(3.9, 4.0, .35, 8), M.stone, 0, .175, 0, b));
      oct(mesh(new THREE.CylinderGeometry(3.55, 3.6, .35, 8), M.stone, 0, .525, 0, b));
      mesh(new THREE.BoxGeometry(1.9, .35, .7), M.stone, 0, .175, 3.95, b);
      // open ground storey: eight columns, a balustrade open at the front, the painted ceiling
      const Y0 = .7, H1 = 3.0, T1 = Y0 + H1, RC = 3.0;
      for (let k = 0; k < 8; k++) {
        const p = at(k / 8 * TAU + R8, RC, 0);
        clickable(list, mesh(new THREE.CylinderGeometry(.13, .15, H1, 12), pillarRed, p.x, Y0 + H1 / 2, p.z, b), data);
        mesh(new THREE.CylinderGeometry(.22, .24, .12, 12), M.stone, p.x, Y0 + .06, p.z, b);
      }
      const rail = new THREE.Group(); rail.position.y = Y0; b.add(rail); balustrade(rail, RC - .02, [0], redRail);
      paintedBeam(b, T1 - .25, RC + .02);
      oct(mesh(new THREE.CylinderGeometry(RC, RC, .06, 8), paintGreen, 0, T1 - .5, 0, b));
      // the bell hangs from the ceiling with the striking log beside it
      const bell = lathe(BELL_PROFILE, M.bronze, 40); bell.position.set(0, T1 - .55, 0); bell.scale.setScalar(.85); b.add(bell);
      clickable(list, bell, ring);
      [-.5, -1.0, -1.5].forEach(yy => { const t = mesh(new THREE.TorusGeometry(yy < -1.2 ? .62 : .54, .018, 6, 56), M.bronze, 0, T1 - .55 + yy * .85, 0, b); t.rotation.x = Math.PI / 2; t.scale.setScalar(.85); });
      const logPivot = new THREE.Group(); logPivot.position.set(0, T1 - .5, 1.3); b.add(logPivot);   // the striking log swings from its ropes
      const logM = mesh(new THREE.CylinderGeometry(.1, .1, 1.0, 16), M.wood, 0, -1.0, 0, logPivot); logM.rotation.x = Math.PI / 2;
      [.95, 1.65].forEach(z => flat(mesh(new THREE.CylinderGeometry(.01, .01, 1.0, 4), M.feature, 0, -.5, z - 1.3, logPivot)));
      clickable(list, logM, ring);
      bellRingers.push(() => {
        tween(2.6, t => {
          logPivot.rotation.x = t < .35 ? .3 * Math.sin(Math.PI / 2 * t / .35) : t < .45 ? .3 - .36 * (t - .35) / .1 : -.06 * (1 - clamp((t - .45) / .55, 0, 1));
          const w = t > .42 ? Math.sin((t - .42) * 30) * .025 * (1 - t) : 0; bell.rotation.x = w; bell.rotation.z = w * .5;
        });
        setTimeout(() => [[98, .35, 7], [196 * 1.19, .14, 5], [98 * 2.76, .09, 3.5], [98 * 5.4, .04, 2]].forEach(([f, p, d]) => tone(f, null, p, d)), reduceMotion ? 0 : 1100);
      });
      const glow = new THREE.PointLight(0xffb070, 1.6, 7, 2); glow.position.set(0, T1 - .9, 1.4); b.add(glow);
      brackets(b, T1 - .2, RC + .05, 4);
      const E1 = T1 + .75;
      tiledEave(b, T1 - .05, 2.35, 4.1, .8, .45, data, list);
      // upper storey: a short lattice-windowed drum with the name board, under the second eave
      const T2 = E1 + 1.3, RU = 2.15, AU = RU * Math.cos(R8);
      oct(mesh(new THREE.CylinderGeometry(RU, RU, T2 - E1 + .2, 8), pillarRed, 0, (E1 - .2 + T2) / 2, 0, b));
      const wins = [];
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; wins.push({ p: at(a, AU + .02, E1 + .4), ry: a, w: 1.1, h: .55, cols: 6, rows: 2 }); }
      latticeWindows(b, wins, std({ color: 0x3a1608, emissive: 0xff9a40, emissiveIntensity: .8 }));
      paintedBeam(b, T2 - .25, RU + .02);
      const tex = writing(512, 160, (c, cw, ch) => {
        c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(96); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(pl.han, cw / 2, ch / 2 + 6);
      });
      mesh(new THREE.BoxGeometry(1.2, .44, .04), M.trim, 0, T2 - .3, AU + .55, b);   // hung forward of the brackets
      flat(mesh(new THREE.PlaneGeometry(1.1, .36), new THREE.MeshStandardMaterial({ map: tex, roughness: .6, emissive: 0x222222, emissiveMap: tex }), 0, T2 - .3, AU + .58, b));
      brackets(b, T2 - .2, RU + .05, 3);
      const E2 = T2 + .7;
      tiledEave(b, T2 - .05, 1.2, 3.5, .75, .4, data, list);
      // pointed roof and a gilt finial
      tiledEave(b, E2 - .1, .06, 1.6, 1.4, .25, data, list, false);
      mesh(new THREE.CylinderGeometry(.08, .14, .3, 12), M.gold, 0, E2 + 1.4, 0, b);
      mesh(new THREE.SphereGeometry(.24, 20, 14), M.gold, 0, E2 + 1.7, 0, b);
      // a stone path to the main approach
      flat(mesh(new THREE.BoxGeometry(9.6, .06, 2.4), M.stone, 4.8, .03, 4.6, b));   // to the foot of the pagoda's deck
    }
    // 蓮華寺, the temple hall on the right, in the Lingnan style: grey-blue brick under a tiled gable roof with a decorated ridge,
    // a porch of stone columns, the name plaque over red doors, and a granite forecourt with notice kiosks and bonsai.
    // It faces the pond (local +z points to world -x) and runs from beside the pagoda almost to the front wall.
    function templeHall(o) {
      const b = new THREE.Group(); b.position.set(o.x, 0, o.z); b.rotation.y = -Math.PI / 2; g.add(b);
      const pl = PLACES[o.place], data = { floor: o.place, tip: `Go into the ${pl.name}` };
      const W = o.w, D = o.d, base = .5, EY = base + 5.7, H = 2.8, run = D / 2 + .8, FZ = D / 2 - 1.8;
      sRect(b, -W / 2, W / 2, -D / 2, FZ);                                                        // the hall itself (tap its door to go in)
      [-7.9, -3.9, 3.9, 7.9].forEach(x => sCircle(b, x, D / 2 - .4, .3));                         // the porch columns
      sCircle(b, 0, D / 2 + 4.6, 2.0);                                                           // the great censer
      [-1, 1].forEach(sx => { sRect(b, sx * (W / 2 - 1.8) - .7, sx * (W / 2 - 1.8) + .7, D / 2 + 3.0, D / 2 + 3.4); sCircle(b, sx * 3.4, D / 2 + 1.9, .5); });   // kiosks, bonsai
      sRect(b, -2.6, 2.6, D / 2 + .5, D / 2 + 1.85, (lx, lz) => base * (1 - (lz - D / 2 - .5) / 1.35));   // the front steps
      sRect(b, -W / 2 - .5, W / 2 + .5, -D / 2 - .5, D / 2 + .5, base);                             // the platform and porch
      const brickTex = canvasTex(256, (c, sz) => {
        c.fillStyle = "#4d5560"; c.fillRect(0, 0, sz, sz);
        for (let r = 0; r < 16; r++) for (let k = -1; k < 8; k++) {
          const x = k * 32 + (r % 2) * 16, y = r * 16, sh = 70 + ((r * 7 + k * 13) % 5) * 6;
          c.fillStyle = `rgb(${sh},${sh + 8},${sh + 18})`; c.fillRect(x + 1, y + 1, 30, 14);
        }
      });
      brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
      const brick = repX => { const t = brickTex.clone(); t.needsUpdate = true; t.repeat.set(repX, 1.5); return std({ map: t, roughness: .85 }); };
      const granite = std({ color: 0x8c877d, roughness: .8 }), darkWood = std({ color: 0x3a1a10, roughness: .6 }), plaster = std({ color: 0xe8e2d4, roughness: .8 });
      // platform, steps and the forecourt of granite slabs
      mesh(new THREE.BoxGeometry(W + 1, base, D + 1), granite, 0, base / 2, 0, b);
      for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(5.2 + (2 - i) * .4, base - i * base / 3, .45), granite, 0, (base - i * base / 3) / 2, D / 2 + .7 + i * .45, b);
      const slab = canvasTex(256, (c, sz) => {
        c.fillStyle = "#7d786f"; c.fillRect(0, 0, sz, sz);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { const sh = 118 + ((r + k * 3) % 4) * 6; c.fillStyle = `rgb(${sh},${sh - 4},${sh - 12})`; c.fillRect(k * 128 + (r % 2) * 64 + 2, r * 64 + 2, 124, 60); }
      });
      slab.wrapS = slab.wrapT = THREE.RepeatWrapping; slab.repeat.set((W + 4) / 4, 7 / 4);
      flat(mesh(new THREE.PlaneGeometry(W + 4, 7.4), std({ map: slab, roughness: .85 }), 0, .025, D / 2 + 4.2, b)).rotation.x = -Math.PI / 2;
      // walls: brick back and gable ends, the recessed front wall behind the porch
      const back = mesh(new THREE.BoxGeometry(W, EY - base, .5), brick(W / 4), 0, base + (EY - base) / 2, -D / 2 + .25, b);
      clickable(list, back, data);
      [-1, 1].forEach(sx => {
        const side = mesh(new THREE.BoxGeometry(.6, EY - base, D), brick(D / 4), sx * (W / 2 - .3), base + (EY - base) / 2, 0, b);
        clickable(list, side, data);
        // the gable rises above the roof as a parapet, edged in dark tile
        const sh = new THREE.Shape(); sh.moveTo(-run, 0); sh.lineTo(run, 0); sh.lineTo(0, H + .35); sh.closePath();
        const gab = mesh(new THREE.ExtrudeGeometry(sh, { depth: .6, bevelEnabled: false }), brick(1), sx * (W / 2 - .3) - .3, EY - .02, 0, b);
        gab.rotation.y = Math.PI / 2;
        [-1, 1].forEach(sz => {
          const len = Math.hypot(run, H + .35), e = mesh(new THREE.BoxGeometry(.75, .16, len + .2), ridgeMat, sx * (W / 2 - .3), EY + (H + .35) / 2 + .06, sz * run / 2, b);
          e.rotation.x = sz * Math.atan2(H + .35, run);
        });
        // white plaster panels with a painted roundel on the front of each corner pier
        const pier = writing(256, 512, (c, cw, ch) => {
          c.fillStyle = "#4d5560"; c.fillRect(0, 0, cw, ch);
          c.fillStyle = "#ece6d8"; c.fillRect(30, 40, cw - 60, ch - 80);
          c.strokeStyle = "#8a6a3a"; c.lineWidth = 6; c.strokeRect(44, 54, cw - 88, ch - 108);
          c.fillStyle = "#2f6a5a"; c.beginPath(); c.arc(cw / 2, ch * .32, 46, 0, TAU); c.fill();
          c.fillStyle = "#b8862e"; c.beginPath(); c.arc(cw / 2, ch * .32, 22, 0, TAU); c.fill();
          c.fillStyle = "#3a5a8a"; c.fillRect(70, ch * .55, cw - 140, 90);
        });
        flat(mesh(new THREE.PlaneGeometry(1.0, 4.6), std({ map: pier, roughness: .8 }), sx * (W / 2 - .3), base + 2.8, D / 2 + .01, b));
      });
      const front = mesh(new THREE.BoxGeometry(W - 1.2, EY - base, .3), brick((W - 1.2) / 4), 0, base + (EY - base) / 2, FZ - .15, b);
      clickable(list, front, data);
      mesh(new THREE.BoxGeometry(7.2, 4.6, .1), darkWood, 0, base + 2.3, FZ + .05, b);   // the dark timber centre bay
      doorway(b, 0, base, FZ + .12, 0, 2.8, 3.6, null, data, list);
      latticeWindows(b, [-6.2, -3.4, 3.4, 6.2].map(x => ({ p: V(x, base + 2.0, FZ + .12), ry: 0, w: 1.5, h: 2.2 })), std({ color: 0x3a1608, emissive: 0xffa040, emissiveIntensity: .75 }));
      // the name plaque: dark lacquer, gold characters, gilt frame
      const plaqueTex = writing(768, 256, (c, cw, ch) => {
        c.fillStyle = "#2a1610"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 14; c.strokeRect(10, 10, cw - 20, ch - 20);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(150); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(pl.han, cw / 2, ch / 2 + 8);
      });
      mesh(new THREE.BoxGeometry(3.7, 1.3, .1), M.trim, 0, base + 4.55, FZ + .2, b);
      flat(mesh(new THREE.PlaneGeometry(3.5, 1.15), new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: .6, emissive: 0x2a2a2a, emissiveMap: plaqueTex }), 0, base + 4.55, FZ + .26, b));
      // porch: granite columns with gilt couplet boards, a carved beam and a painted frieze, red lanterns
      const couplet = text => writing(96, 512, (c, cw, ch) => {
        c.fillStyle = "#2a1610"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 6; c.strokeRect(4, 4, cw - 8, ch - 8);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(64); c.textAlign = "center"; c.textBaseline = "middle"; [...text].forEach((ch2, i) => c.fillText(ch2, cw / 2, 60 + i * 98));
      });
      [[-3.9, "蓮開見佛"], [3.9, "心淨國土"], [-7.9, ""], [7.9, ""]].forEach(([x, text]) => {
        mesh(new THREE.BoxGeometry(.5, EY - base - .5, .5), granite, x, base + (EY - base - .5) / 2, D / 2 - .4, b);
        mesh(new THREE.BoxGeometry(.7, .25, .7), granite, x, base + .12, D / 2 - .4, b);
        if (text) flat(mesh(new THREE.PlaneGeometry(.4, 3.6), new THREE.MeshStandardMaterial({ map: couplet(text), roughness: .6, emissive: 0x222222 }), x, base + 2.5, D / 2 - .14, b));
      });
      const beamTexG = writing(1024, 64, (c, cw, ch) => {
        c.fillStyle = "#2a140c"; c.fillRect(0, 0, cw, ch);
        c.strokeStyle = "#c9993c"; c.lineWidth = 4;
        for (let x = 10; x < cw; x += 52) { c.beginPath(); c.arc(x + 20, ch / 2, 16, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(x, 10); c.lineTo(x, ch - 10); c.stroke(); }
      });
      mesh(new THREE.BoxGeometry(W - 1.2, .55, .45), std({ map: beamTexG, roughness: .5, metalness: .2 }), 0, EY - .95, D / 2 - .4, b);
      const frieze = writing(1024, 96, (c, cw, ch) => {
        c.fillStyle = "#e8e2d4"; c.fillRect(0, 0, cw, ch);
        const cols = ["#2f6a5a", "#3a5a8a", "#a8402a", "#c9993c"];
        for (let i = 0; i < 12; i++) { const x = 8 + i * 84; c.fillStyle = cols[i % 4]; c.fillRect(x, 14, 70, ch - 28); c.fillStyle = "#e8e2d4"; c.beginPath(); c.arc(x + 35, ch / 2, 18, 0, TAU); c.fill(); }
      });
      mesh(new THREE.BoxGeometry(W - 1.2, .6, .3), std({ map: frieze, roughness: .8 }), 0, EY - .4, D / 2 - .35, b);
      flat(mesh(new THREE.PlaneGeometry(W - 1.2, 2.3), darkWood, 0, EY - .7, (FZ + D / 2) / 2, b)).rotation.x = Math.PI / 2;   // porch ceiling
      [-5.6, 5.6].forEach(x => lantern(b, x, base + 3.9, D / 2 - 1.0, EY - .7, 1.3));
      // the roof: two concave slopes of tiles, red eave boards and undersides, between the gables
      const slope = (sz, ts = 16) => {
        const pos = [], uv = [], idx = [];
        for (let i = 0; i <= ts; i++) { const t = i / ts, zz = sz * run * (1 - t), yy = H * Math.pow(t, 1.45); [-1, 1].forEach(sx => { pos.push(sx * (W / 2 - .6), yy, zz); uv.push(sx * (W / 2 - .6) * 1.2, t * run * 1.2); }); }
        for (let i = 0; i < ts; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
        const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        geo.setIndex(idx); geo.computeVertexNormals(); return geo;
      };
      [-1, 1].forEach(sz => {
        clickable(list, mesh(slope(sz), roofMat, 0, EY, 0, b), data);
        flat(mesh(slope(sz), eaveRed, 0, EY - .07, 0, b));
        mesh(new THREE.BoxGeometry(W - 1.1, .22, .14), eaveRed, 0, EY - .02, sz * run, b);
      });
      // the decorated ridge (陶塑瓦脊): a base course, a band of painted figures, a row of finials,
      // the flaming pearl at the centre and a curling dragon-fish at each end
      const RY = EY + H;
      mesh(new THREE.BoxGeometry(W - 1.0, .4, .55), ridgeMat, 0, RY + .1, 0, b);
      const band = writing(1024, 128, (c, cw, ch) => {
        c.fillStyle = "#2a3a3a"; c.fillRect(0, 0, cw, ch);
        const cols = ["#3a8a6a", "#d8a83a", "#3a6aa8", "#c0503a", "#e8e2d4"];
        for (let i = 0; i < 26; i++) { const x = 14 + i * 39; c.fillStyle = cols[i % 5]; c.beginPath(); c.ellipse(x + 14, 70, 12, 34, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(x + 14, 28, 10, 0, TAU); c.fill(); }
        c.fillStyle = "#c9993c"; c.fillRect(0, ch - 12, cw, 12); c.fillRect(0, 0, cw, 8);
      });
      mesh(new THREE.BoxGeometry(W - 3.0, .9, .3), std({ map: band, roughness: .5, metalness: .1 }), 0, RY + .75, 0, b);
      for (let x = -(W - 3.4) / 2; x <= (W - 3.4) / 2 + .01; x += 1.6) mesh(new THREE.ConeGeometry(.1, .35, 8), paintGreen, x, RY + 1.37, 0, b);
      mesh(new THREE.CylinderGeometry(.12, .2, .5, 12), M.gold, 0, RY + 1.45, 0, b);
      mesh(new THREE.SphereGeometry(.32, 20, 14), std({ color: 0xffd890, emissive: 0xffa040, emissiveIntensity: .7 }), 0, RY + 1.95, 0, b);
      [-1, 1].forEach(sx => {
        const curl = mesh(new THREE.TorusGeometry(.42, .12, 8, 20, Math.PI * 1.4), paintGreen, sx * (W / 2 - 1.2), RY + 1.0, 0, b);
        curl.rotation.set(0, sx < 0 ? Math.PI : 0, -Math.PI * .1);
        mesh(new THREE.ConeGeometry(.14, .6, 8), M.gold, sx * (W / 2 - .9), RY + 1.65, 0, b).rotation.z = -sx * .5;
      });
      // forecourt: two notice kiosks with little tiled roofs, and bonsai on stands either side of the steps
      [-1, 1].forEach(sx => {
        const kx = sx * (W / 2 - 1.8), kz = D / 2 + 3.2;
        [-.65, .65].forEach(dx => mesh(new THREE.BoxGeometry(.12, 2.2, .12), M.lacquer, kx + dx, 1.1, kz, b));
        const note = writing(256, 320, (c, cw, ch) => {
          c.fillStyle = "#f2ead6"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#7a1c12"; c.lineWidth = 10; c.strokeRect(5, 5, cw - 10, ch - 10);
          c.fillStyle = "#7a1c12"; c.font = HAN_FONT(48); c.textAlign = "center"; c.fillText(sx < 0 ? "法會" : "公告", cw / 2, 64);
          c.fillStyle = "#6a5a4a"; for (let i = 0; i < 6; i++) c.fillRect(36, 104 + i * 32, cw - 72, 6);
        });
        flat(mesh(new THREE.PlaneGeometry(1.15, 1.4), std({ map: note, roughness: .8, emissive: 0x333028, emissiveMap: note }), kx, 1.35, kz + .07, b));
        mesh(new THREE.BoxGeometry(1.3, 1.6, .08), M.lacquer, kx, 1.35, kz, b);
        tiledHipRoof(b, kx, kz, 2.2, 1.0, .55, .45, .15, [0, .2, .4, .6, .8, .93], .45);
        const pot = mesh(new THREE.CylinderGeometry(.42, .32, .45, 16), std({ color: 0x5a4a3a, roughness: .7 }), sx * 3.4, .72, D / 2 + 1.9, b);
        mesh(new THREE.BoxGeometry(.9, .5, .9), granite, sx * 3.4, .25, D / 2 + 1.9, b);
        const tr = mesh(new THREE.CylinderGeometry(.05, .09, .7, 8), bark, sx * 3.4, 1.2, D / 2 + 1.9, b); tr.rotation.z = sx * .3;
        [[0, 1.55, 0, .45], [sx * .35, 1.4, .1, .35], [-sx * .25, 1.7, -.1, .32]].forEach(([dx, y, dz, r]) => mesh(new THREE.IcosahedronGeometry(r, 0), leafMats[1], sx * 3.4 + dx, y, D / 2 + 1.9 + dz, b));
      });
      // the great incense censer (大香爐) in the middle of the forecourt: a bronze cauldron on three legs with upright handles,
      // giant red incense sticks glowing at the tips, and smoke drifting up
      const CZ = D / 2 + 4.6, cen = new THREE.Group(); cen.position.set(0, 0, CZ); b.add(cen);
      const cdata = { tip: "The great incense censer · offer incense inside the halls" };
      mesh(new THREE.CylinderGeometry(1.9, 2.0, .3, 8), granite, 0, .15, 0, cen).rotation.y = R8;
      mesh(new THREE.CylinderGeometry(1.6, 1.7, .25, 8), granite, 0, .42, 0, cen).rotation.y = R8;
      for (let k = 0; k < 3; k++) {   // legs ending in lion paws
        const a = k / 3 * TAU + Math.PI / 6;
        const leg = mesh(new THREE.CylinderGeometry(.16, .1, 1.0, 10), M.bronze, Math.sin(a) * .85, 1.05, Math.cos(a) * .85, cen); leg.rotation.set(Math.cos(a) * -.15, 0, Math.sin(a) * .15);
        mesh(new THREE.SphereGeometry(.2, 12, 8), M.bronze, Math.sin(a) * .92, .62, Math.cos(a) * .92, cen);
      }
      // the bowl is open: its inner wall drops from the rim to a bed of ash well below it
      const bowl = lathe([[0, 0], [.7, .02], [1.05, .2], [1.22, .55], [1.25, .95], [1.32, 1.05], [1.38, 1.12], [1.2, 1.12], [1.12, 1.0], [1.08, .7], [0, .66]], M.bronze, 40);
      bowl.position.y = 1.45; cen.add(bowl); clickable(list, bowl, cdata);
      [.55, .95].forEach(y => { const r = mesh(new THREE.TorusGeometry(y < .7 ? 1.2 : 1.27, .04, 8, 48), M.trim, 0, 1.45 + y, 0, cen); r.rotation.x = Math.PI / 2; });
      const ashTop = mesh(ashBed(1.08), ashMat, 0, 1.45 + .68, 0, cen); ashTop.rotation.x = -Math.PI / 2;   // the ash, sunk inside the rim
      [-1, 1].forEach(sx => {   // upright ear handles
        const h = mesh(new THREE.TorusGeometry(.32, .07, 8, 20, Math.PI), M.bronze, sx * .95, 1.45 + 1.12, 0, cen);
        [-1, 1].forEach(e => mesh(new THREE.BoxGeometry(.14, .3, .14), M.bronze, sx * .95 + e * .32, 1.45 + 1.0, 0, cen));
        h.rotation.y = Math.PI / 2;
      });
      const ashY = 1.45 + .72, tips = [];
      const giant = std({ color: 0xa8201a, roughness: .5 }), stickMat = std({ color: 0xb2683a, roughness: .9 });
      [[-.3, 0, 1.6], [0, -.12, 1.85], [.3, 0, 1.6]].forEach(([x, z, h]) => {   // three tall incense sticks, one for each jewel
        mesh(new THREE.CylinderGeometry(.06, .07, h, 12), giant, x, ashY + h / 2, z, cen);
        mesh(new THREE.CylinderGeometry(.085, .085, .2, 12), M.trim, x, ashY + .3, z, cen);
        const tip = mesh(new THREE.CylinderGeometry(.06, .075, .18, 12), std({ color: 0x3a1a0a, emissive: 0xff5a1a, emissiveIntensity: 1.4 }), x, ashY + h + .09, z, cen);
        const gl = glowSprite(0xff6a2a, .9, .8); gl.position.set(x, ashY + h + .15, z); cen.add(gl); tips.push(V(x, ashY + h + .2, z));
      });
      const rs = rng(41);
      for (let i = 0; i < 36; i++) {   // ordinary sticks left by visitors
        const a = rs() * TAU, r = .25 + rs() * .75, st = mesh(new THREE.CylinderGeometry(.008, .008, .5, 4), stickMat, Math.cos(a) * r, ashY + .25, Math.sin(a) * r, cen);
        st.rotation.set((rs() - .5) * .2, 0, (rs() - .5) * .2);
        if (i % 4 === 0) { const e = glowSprite(0xff5a20, .12, 1); e.position.set(Math.cos(a) * r, ashY + .5, Math.sin(a) * r); cen.add(e); }
      }
      const smokeTex = canvasTex(64, (c, sz) => { const gr = c.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2); gr.addColorStop(0, "rgba(220,215,210,.55)"); gr.addColorStop(1, "rgba(220,215,210,0)"); c.fillStyle = gr; c.fillRect(0, 0, sz, sz); });
      const puffs = [];
      for (let i = 0; i < 24; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
        cen.add(sp); puffs.push({ sp, t: i / 24, src: tips[i % 3], dx: rs() - .5, dz: rs() - .5 });
      }
      updaters.pagoda.push((dt, t, motion) => puffs.forEach(p => {
        p.t = (p.t + dt * .12 * (motion || .3)) % 1;
        const k = p.t, sway = Math.sin(t * .6 + p.dx * 6) * .4 * k;
        p.sp.position.set(p.src.x + p.dx * k * 1.2 + sway, p.src.y + k * 3.5, p.src.z + p.dz * k * 1.2);
        p.sp.scale.setScalar(.3 + k * 2.2);
        p.sp.material.opacity = Math.sin(Math.PI * k) * .45;
      }));
      const fire = new THREE.PointLight(0xff8a3a, 1.2, 7, 2); fire.position.set(0, ashY + 1, 0); cen.add(fire);
      const warm = new THREE.PointLight(0xffb070, 1.6, 16, 2); warm.position.set(0, base + 3.4, D / 2 + 3); b.add(warm);
    }
    bellPavilion({ x: -17, z: -1.5, place: "bell" });
    templeHall({ x: 24.5, z: 26, w: 24, d: 12, place: "library" });
    // 法物流通處 and 寮房: a two-storey hall on the left of the pond, the temple shop below and the monks' quarters above.
    // It faces the pond (local +z points to world +x).
    function shopHall(o) {
      const b = new THREE.Group(); b.position.set(o.x, 0, o.z); b.rotation.y = Math.PI / 2; g.add(b);
      const W = o.w, D = o.d, base = .4, H1 = 3.4, H2 = 2.8;
      const data = { tip: "The temple shop, with the monks' rooms beside and above it" };
      const FZ0 = D / 2 - 1.3;
      sRect(b, -W / 2 - .3, W / 2 + .3, -D / 2 - .3, FZ0 + .1);                                      // the building behind the porch
      [0, 1, 2, 3, 4, 5, 6].forEach(i => sCircle(b, -W / 2 + .4 + i * (W - .8) / 6, D / 2 - .3, .2));   // the porch columns
      sRect(b, -W / 2 - .5, W / 2 + .5, -D / 2 - .5, D / 2 + .5, base);                              // the porch floor
      sRect(b, -W / 2 + 1, W / 2 - 1, D / 2 + .5, D / 2 + 1.3, (lx, lz) => base * (1 - (lz - D / 2 - .5) / .8));   // the front steps
      const granite = std({ color: 0x8c877d, roughness: .8 });
      mesh(new THREE.BoxGeometry(W + 1, base, D + 1), granite, 0, base / 2, 0, b);
      for (let i = 0; i < 2; i++) mesh(new THREE.BoxGeometry(W - 2, base - i * .2, .4), granite, 0, (base - i * .2) / 2, D / 2 + .7 + i * .4, b);
      // ground floor: red walls, an open shopfront behind a row of columns
      const FZ = D / 2 - 1.3;
      clickable(list, mesh(new THREE.BoxGeometry(W, H1, .3), M.lacquer, 0, base + H1 / 2, -D / 2 + .15, b), data);
      [-1, 1].forEach(sx => clickable(list, mesh(new THREE.BoxGeometry(.3, H1, D), M.lacquer, sx * (W / 2 - .15), base + H1 / 2, 0, b), data));
      // the front wall with two doorways, both standing open: the shop in the middle, and the monks' dining and rest room to the right
      const DOORS = [{ x: 0, w: 2.6, to: "shop", tip: "Enter the temple shop · buy offerings" }, { x: 5.4, w: 1.6, to: "quarters", tip: "Enter the monks' dining and rest room" }];
      const frontWall = std({ color: 0x5a1a10, roughness: .7 }), dark = new THREE.MeshBasicMaterial({ color: 0x120804 });
      let wx = -W / 2 + .3;
      [...DOORS, { x: W / 2 - .3 + 1e-3, w: 0 }].forEach(d => {
        const x0 = d.x - d.w / 2, len = x0 - wx;
        if (len > .01) clickable(list, mesh(new THREE.BoxGeometry(len, H1, .2), frontWall, wx + len / 2, base + H1 / 2, FZ - .1, b), data);
        if (!d.w) return;
        const DH = 2.6;
        mesh(new THREE.BoxGeometry(d.w, H1 - DH, .2), frontWall, d.x, base + DH + (H1 - DH) / 2, FZ - .1, b);
        const hole = mesh(new THREE.PlaneGeometry(d.w, DH), dark, d.x, base + DH / 2, FZ - .25, b);
        clickable(list, hole, { floor: d.to, tip: d.tip });
        [-1, 1].forEach(sd => {   // the frame, and the leaves folded back against the wall
          mesh(new THREE.BoxGeometry(.14, DH + .1, .26), M.lacquer, d.x + sd * (d.w / 2 + .07), base + DH / 2, FZ - .1, b);
          const leaf = mesh(new THREE.BoxGeometry(d.w / 2 - .04, DH - .1, .07), std({ color: 0x9c1c12, roughness: .45 }), d.x + sd * (d.w / 2 + .05), base + DH / 2, FZ + d.w / 4 + .05, b);
          leaf.rotation.y = Math.PI / 2;
        });
        mesh(new THREE.BoxGeometry(d.w + .4, .16, .28), M.lacquer, d.x, base + DH + .08, FZ - .1, b);
        if (d.to === "quarters") {
          const board = writing(512, 128, (c, cw, ch) => {
            c.fillStyle = "#2a1610"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.strokeRect(5, 5, cw - 10, ch - 10);
            c.fillStyle = "#e8c25a"; c.font = '600 46px "Figtree", sans-serif'; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Dining & Rest", cw / 2, ch / 2 + 2);
          });
          flat(mesh(new THREE.PlaneGeometry(1.9, .48), new THREE.MeshStandardMaterial({ map: board, roughness: .6, emissive: 0x222222, emissiveMap: board }), d.x, base + DH + .5, FZ + .02, b));
        }
        wx = d.x + d.w / 2;
      });
      const inside = new THREE.PointLight(0xffc080, .8, 5, 2); inside.position.set(0, base + 1.6, FZ + 1.2); b.add(inside);
      for (let x = -W / 2 + .4; x <= W / 2 - .39; x += (W - .8) / 6) {
        mesh(new THREE.CylinderGeometry(.16, .18, H1, 14), pillarRed, x, base + H1 / 2, D / 2 - .3, b);
        mesh(new THREE.CylinderGeometry(.26, .28, .12, 14), M.stone, x, base + .06, D / 2 - .3, b);
      }
      mesh(new THREE.BoxGeometry(W, .4, .3), beamMat, 0, base + H1 - .2, D / 2 - .3, b);
      flat(mesh(new THREE.PlaneGeometry(W - .6, 1.3), std({ color: 0x3a1a10, roughness: .7 }), 0, base + H1 - .4, D / 2 - .95, b)).rotation.x = Math.PI / 2;
      // the shop in the middle three bays: a counter, shelves of incense boxes and hanging rosaries, under a signboard
      const goodsCols = [0xc0201a, 0xd8a83a, 0x2f6a5a, 0x3a5a8a, 0xb8683a, 0xe8e2d4].map(c => std({ color: c, roughness: .6 }));
      const signTex = writing(1024, 192, (c, cw, ch) => {
        c.fillStyle = "#2a1610"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(118); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("法物流通處", cw / 2, ch / 2 + 8);
      });
      flat(mesh(new THREE.PlaneGeometry(4.2, .8), new THREE.MeshStandardMaterial({ map: signTex, roughness: .6, emissive: 0x2a2a2a, emissiveMap: signTex }), 0, base + H1 - .78, D / 2 - .13, b));
      latticeWindows(b, [-7.6, -5.4, -2.6, 2.6, 7.6].map(x => ({ p: V(x, base + 1.7, FZ + .02), ry: 0, w: 1.4, h: 2.0 })), std({ color: 0x3a1608, emissive: 0xffa040, emissiveIntensity: .7 }));
      const shopLight = new THREE.PointLight(0xffc080, 1.4, 9, 2); shopLight.position.set(0, base + 2.6, FZ + 1.6); b.add(shopLight);
      [-3.6, 3.6].forEach(x => lantern(b, x, base + 2.6, D / 2 - .3, base + H1 - .4, 1));
      // the skirt eave between the floors, then the monks' quarters: a balcony with a red railing and a row of lattice windows
      let top = base + H1;
      const EBZ = D / 2 + 1.0, t0 = (D / 2 - .9) / EBZ;
      tiledHipRoof(b, 0, 0, top + .05 - 1.4 * Math.pow(1 - t0, 1.6), W / 2 + 1.0, EBZ, 1.4, .35, [t0, ...[.5, .6, .7, .8, .88, .93].filter(t => t > t0 + .02)], .9, false);
      const UD = D - 1.4;
      clickable(list, mesh(new THREE.BoxGeometry(W - .6, H2, UD), M.lacquer, 0, top + H2 / 2, -.7, b), data);
      const uwins = []; for (let x = -W / 2 + 1.4; x <= W / 2 - 1.3; x += 1.9) uwins.push({ p: V(x, top + 1.35, -.7 + UD / 2 + .02), ry: 0, w: 1.1, h: 1.5 });
      latticeWindows(b, uwins, std({ color: 0x3a1608, emissive: 0xffb050, emissiveIntensity: .55 }));
      const roomSign = writing(256, 96, (c, cw, ch) => {
        c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.strokeRect(5, 5, cw - 10, ch - 10);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(56); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("寮房", cw / 2, ch / 2 + 4);
      });
      flat(mesh(new THREE.PlaneGeometry(.9, .34), new THREE.MeshStandardMaterial({ map: roomSign, roughness: .6, emissive: 0x222222, emissiveMap: roomSign }), 0, top + 2.4, -.7 + UD / 2 + .04, b));
      const rail = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), redRail, 80), m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(); let k = 0;
      const RZ = -.7 + UD / 2 + .65, put = (x, y, z, a, bb, c) => rail.setMatrixAt(k++, m4.compose(V(x, y, z), q0, V(a, bb, c)));
      put(0, top + .95, RZ, W - 1.0, .07, .08); put(0, top + .35, RZ, W - 1.0, .05, .06);
      for (let i = 0; i < 40; i++) put(-W / 2 + .5 + i * (W - 1.0) / 39, top + .65, RZ, .05, .6, .05);
      rail.count = k; b.add(rail);
      mesh(new THREE.BoxGeometry(W - .8, .1, .75), M.wood, 0, top + .1, RZ - .3, b);
      top += H2;
      const RAX = W / 2 + 1.2, RBZ = D / 2 + .6;
      tiledHipRoof(b, 0, -.4, top - .1, RAX, RBZ, 1.8, .55, [0, .1, .2, .3, .4, .5, .6, .7, .8, .88, .93], 1.0);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const l = flat(mesh(lanternGeo, lanternMat, sx * (RAX - .3), top - .5, -.4 + sz * (RBZ - .3), b)); l.scale.set(.6, .72, .6); });
    }
    // 觀蓮亭, the lotus-viewing pavilion: an open eight-sided pavilion standing out over the water, with lean-back benches
    // (美人靠) between its columns so visitors can sit and watch the pond; the entrance faces the land
    function lotusPavilion(cx, cz) {
      const b = new THREE.Group(); b.position.set(cx, 0, cz); g.add(b);
      const data = { pavilion: true, tip: "The lotus-viewing pavilion · sit and watch the pond" };
      const PY = .75, RC = 2.25, CH = 2.7, ENTRY = 6;   // the face pointing to -x, toward the land
      // where a walker can stand: the floor inside the benches, and the steps on the land side; where a visitor sits:
      // the bench on the pond side (+x), looking out over the water
      WALKABLE.pav = { cx, cz, PY, inner: 2.0, stepX0: -2.2, stepX1: -3.6, stepHalf: .7 };
      PAV_SEAT = { pos: V(cx + 1.0, PY + .45 + .95, cz), look: V(cx + 12, 1.2, cz) };
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + R8; mesh(new THREE.CylinderGeometry(.28, .32, PY, 10), M.stone, Math.sin(a) * 2.3, PY / 2, Math.cos(a) * 2.3, b); }
      clickable(list, oct(mesh(new THREE.CylinderGeometry(2.75, 2.75, .2, 8), M.stone, 0, PY - .1, 0, b)), data);
      oct(mesh(new THREE.CylinderGeometry(2.78, 2.78, .08, 8, 1, true), M.trim, 0, PY - .17, 0, b));
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * TAU + R8;
        clickable(list, mesh(new THREE.CylinderGeometry(.13, .15, CH, 12), pillarRed, Math.sin(a) * RC, PY + CH / 2, Math.cos(a) * RC, b), data);
      }
      // benches with curved backs leaning out over the water, on every face but the entrance
      const L = 2 * RC * Math.sin(R8) - .3, ap = RC * Math.cos(R8);
      for (let f = 0; f < 8; f++) {
        if (f === ENTRY) continue;
        const a = f / 8 * TAU, bench = new THREE.Group(); bench.position.set(Math.sin(a) * ap, PY, Math.cos(a) * ap); bench.rotation.y = a; b.add(bench);
        mesh(new THREE.BoxGeometry(L, .08, .42), M.wood, 0, .45, -.18, bench);
        mesh(new THREE.BoxGeometry(L, .4, .06), pillarRed, 0, .22, -.02, bench);
        for (let i = 0; i < 7; i++) { const sl = mesh(new THREE.BoxGeometry(.05, .6, .04), pillarRed, -L / 2 + .15 + i * (L - .3) / 6, .78, .08, bench); sl.rotation.x = .45; }
        const top = mesh(new THREE.BoxGeometry(L, .07, .1), pillarRed, 0, 1.05, .2, bench); top.rotation.x = .45;
      }
      paintedBeam(b, PY + CH - .25, RC + .02);
      oct(mesh(new THREE.CylinderGeometry(RC, RC, .05, 8), paintGreen, 0, PY + CH - .5, 0, b));
      brackets(b, PY + CH - .2, RC + .05, 3);
      tiledEave(b, PY + CH - .05, 1.2, 3.4, .8, .45, data, list);
      tiledEave(b, PY + CH + .55, .06, 1.6, 1.3, .25, data, list, false);
      mesh(new THREE.CylinderGeometry(.07, .12, .3, 12), M.gold, 0, PY + CH + 1.95, 0, b);
      mesh(new THREE.SphereGeometry(.2, 16, 12), M.gold, 0, PY + CH + 2.2, 0, b);
      const name = writing(512, 160, (c, cw, ch) => {
        c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(96); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("觀蓮亭", cw / 2, ch / 2 + 6);
      });
      const ea = ENTRY / 8 * TAU, board = flat(mesh(new THREE.PlaneGeometry(1.2, .38), new THREE.MeshStandardMaterial({ map: name, roughness: .6, emissive: 0x222222, emissiveMap: name }), Math.sin(ea) * (RC + .06), PY + CH - .25, Math.cos(ea) * (RC + .06), b));
      board.rotation.y = ea;
      lantern(b, 0, PY + CH - .8, 0, PY + CH - .5, .9);
      const glow = new THREE.PointLight(0xffb070, 1.1, 7, 2); glow.position.set(0, PY + 1.8, 0); b.add(glow);
      // a few stone steps down to the path on the land side
      for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(.45, PY - i * PY / 3, 1.4), M.stone, -(ap + .35 + i * .45), (PY - i * PY / 3) / 2, 0, b);
    }
    shopHall({ x: -25.5, z: 27, w: 18, d: 8 });
    lotusPavilion(-11.9, 26);
    // 演武場, the training ground east of the pagoda, where the monks practise kung fu: a granite square with a stone border,
    // the instructor's platform (點將台) at the back, weapon racks, wooden dummies, stone weights and banners
    function trainingGround(cx, cz, W, D) {
      const b = new THREE.Group(); b.position.set(cx, 0, cz); g.add(b);
      const data = { tip: "The training ground", toast: "The open ground where kung fu is practised: the horse stance, punches and staff forms, led from the platform at the back." };
      const slab = canvasTex(256, (c, sz) => {
        c.fillStyle = "#6a655c"; c.fillRect(0, 0, sz, sz);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { const sh = 128 + ((r * 3 + k * 5) % 5) * 7; c.fillStyle = `rgb(${sh},${sh - 5},${sh - 14})`; c.fillRect(k * 64 + 2, r * 64 + 2, 60, 60); }
      });
      slab.wrapS = slab.wrapT = THREE.RepeatWrapping; slab.repeat.set(W / 4, D / 4);
      const floor = flat(mesh(new THREE.BoxGeometry(W, .12, D), [M.stone, M.stone, std({ map: slab, roughness: .85 }), M.stone, M.stone, M.stone], 0, .06, 0, b));
      clickable(list, floor, data);
      [[0, -D / 2, W + .6, .5], [0, D / 2, W + .6, .5], [-W / 2, 0, .5, D], [W / 2, 0, .5, D]].forEach(([x, z, w, d]) => mesh(new THREE.BoxGeometry(w, .22, d), std({ color: 0x8c877d, roughness: .8 }), x, .11, z, b));
      // the platform: stone steps up to a red-railed dais with a flag on each side and a name board behind
      const PZ = -D / 2 - 1.6, PW = 7, PD = 3, PH = 1.0;
      sRect(b, -PW / 2, PW / 2, PZ - PD / 2, PZ + PD / 2 + 1.2); [-D / 4, D / 4].forEach(z => sRect(b, -W / 2 + .7, -W / 2 + 1.1, z - 1.2, z + 1.2)); [-D / 3, 0, D / 3].forEach(z => sCircle(b, W / 2 - 1.2, z, .4));
      mesh(new THREE.BoxGeometry(PW, PH, PD), std({ color: 0x8c877d, roughness: .8 }), 0, PH / 2, PZ, b);
      for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(2.4, PH - i * PH / 4, .3), M.stone, 0, (PH - i * PH / 4) / 2, PZ + PD / 2 + .15 + i * .3, b);
      const rail = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), redRail, 40), m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(); let k = 0;
      const put = (x, y, z, a, bb, c) => rail.setMatrixAt(k++, m4.compose(V(x, y, z), q0, V(a, bb, c)));
      put(0, PH + .7, PZ - PD / 2 + .1, PW, .07, .08);
      [-1, 1].forEach(sd => { put(sd * (PW / 2 - .05), PH + .7, PZ, .08, .07, PD); for (let i = 0; i < 6; i++) put(sd * (PW / 2 - .05), PH + .35, PZ - PD / 2 + .2 + i * (PD - .4) / 5, .06, .7, .06); });
      for (let i = 0; i < 12; i++) put(-PW / 2 + .3 + i * (PW - .6) / 11, PH + .35, PZ - PD / 2 + .1, .06, .7, .06);
      rail.count = k; b.add(rail);
      const board = writing(512, 160, (c, cw, ch) => {
        c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(96); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("演武場", cw / 2, ch / 2 + 6);
      });
      [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.2, 3.2, .2), M.lacquer, sd * 1.4, PH + 1.6, PZ - PD / 2 - .1, b));
      flat(mesh(new THREE.PlaneGeometry(2.6, .8), new THREE.MeshStandardMaterial({ map: board, roughness: .6, emissive: 0x222222, emissiveMap: board }), 0, PH + 2.9, PZ - PD / 2 - .05, b));
      const flags = [];
      [-1, 1].forEach(sd => {
        const x = sd * (PW / 2 + .6);
        mesh(new THREE.CylinderGeometry(.05, .07, 6, 8), M.lacquer, x, 3, PZ, b);
        mesh(new THREE.SphereGeometry(.12, 10, 8), M.gold, x, 6.05, PZ, b);
        const fg = new THREE.Group(); fg.position.set(x, 5.2, PZ); b.add(fg);
        const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.0, 8, 1), std({ color: sd < 0 ? 0xc8a020 : 0xa42418, roughness: .7, side: THREE.DoubleSide }));
        flag.geometry.translate(.7, -1.0, 0); fg.add(flag); flags.push(flag);
      });
      // weapon racks along the west side: staffs and spears standing in a red frame
      [-D / 4, D / 4].forEach((z, ri) => {
        const rx = -W / 2 + .9;
        [-1.1, 1.1].forEach(dz => mesh(new THREE.BoxGeometry(.12, 2.2, .12), M.lacquer, rx, 1.1, z + dz, b));
        [.5, 1.9].forEach(y => mesh(new THREE.BoxGeometry(.18, .1, 2.4), M.lacquer, rx, y, z, b));
        for (let i = 0; i < 7; i++) {
          const zz = z - .9 + i * .3, spear = i % 2 === ri % 2;
          mesh(new THREE.CylinderGeometry(.025, .025, 2.6, 6), spear ? M.lacquer : M.wood, rx + .05, 1.35, zz, b);
          if (spear) { mesh(new THREE.ConeGeometry(.05, .3, 6), std({ color: 0xc8ccd2, metalness: .8, roughness: .3 }), rx + .05, 2.8, zz, b); mesh(new THREE.SphereGeometry(.07, 6, 4), M.stickRed, rx + .05, 2.6, zz, b); }
        }
      });
      // wooden training dummies (木人樁) and stone lifting weights along the east side
      [-D / 3, 0, D / 3].forEach(z => {
        const x = W / 2 - 1.2;
        mesh(new THREE.CylinderGeometry(.18, .2, 1.9, 12), M.wood, x, 1.0, z, b);
        [[1.45, .4], [1.25, -.4], [.85, 0]].forEach(([y, a]) => { const arm = mesh(new THREE.CylinderGeometry(.04, .04, .5, 6), M.wood, x - .25, y, z + a * .3, b); arm.rotation.z = Math.PI / 2; arm.rotation.y = a; });
      });
      [-D / 2 + 1.3, D / 2 - 1.3].forEach(z => { mesh(new THREE.BoxGeometry(.6, .45, .4), M.stone, W / 2 - 1.2, .35, z, b); mesh(new THREE.TorusGeometry(.14, .04, 6, 12, Math.PI), M.stone, W / 2 - 1.2, .58, z, b); });
      updaters.pagoda.push((dt, t, motion) => {   // the banners wave
        flags.forEach((fl, i) => { const p = fl.geometry.attributes.position; for (let j = 0; j < p.count; j++) { const x = p.getX(j); p.setZ(j, Math.sin(x * 2.5 - t * 3 + i) * .12 * x * motion); } p.needsUpdate = true; });
      });
    }
    trainingGround(21, -1, 16, 12);
    shanTown(g);
    sevenDayMarket(g);
    shanStupaHill(g);
    shanMonasteries(g);
    streetFrontage(g);
    backStreets(g);
    hillHuts(g);
    hutVillage(g);
    hospital(g);
    highSchool(g);
    fuelStation(g);
    fireAndPolice(g);
    halloweenGhost(g);
    // 溪, the stream behind the compound: it winds across the land beyond the pines on the far side of the back wall,
    // between grassy banks edged with stones, with rocks, reeds and a stone slab bridge; the water flows to the east
    (function stream() {
      const X0 = -110, X1 = 110, N = 120, W = 3.2, zAt = x => -30 + Math.sin(x * .045) * 3.2 + Math.sin(x * .11 + 1) * 1.1;
      const ribbon = (half, y) => {
        const pos = [], uv = [], idx = [];
        for (let i = 0; i <= N; i++) {
          const x = X0 + (X1 - X0) * i / N, z = zAt(x), dz = (zAt(x + .5) - zAt(x - .5)), len = Math.hypot(1, dz), nx = -dz / len, nz = 1 / len;
          pos.push(x + nx * half, y, z + nz * half, x - nx * half, y, z - nz * half); uv.push(x / 6, 1, x / 6, 0);
          if (i < N) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
        }
        const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        geo.setIndex(idx); geo.computeVertexNormals(); return geo;
      };
      const grass = std({ color: 0x3e5a2c, roughness: 1 });
      onDaylight(d => grass.color.copy(lerpC(0x1e2a16, 0x4a6a32, d)));
      flat(mesh(ribbon(W / 2 + 2.6, .02), grass, 0, 0, 0, g));                          // grassy banks
      flat(mesh(ribbon(W / 2 + .35, .03), std({ color: 0x5a5046, roughness: .95 }), 0, 0, 0, g));   // the muddy edge
      flat(mesh(ribbon(W / 2, .035), std({ color: 0x14302a, roughness: 1 }), 0, 0, 0, g));          // the bed
      const flowTex = canvasTex(128, (c, sz) => {
        c.fillStyle = "#1f5a64"; c.fillRect(0, 0, sz, sz);
        for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(200,230,240,${.08 + (i % 3) * .05})`; c.lineWidth = 2; const y = (i * 37) % sz, x = (i * 53) % sz; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 26, y + 2); c.stroke(); }
      });
      flowTex.wrapS = flowTex.wrapT = THREE.RepeatWrapping;
      const water = flat(mesh(ribbon(W / 2, .09), std({ map: flowTex, color: 0x9fd0d8, metalness: .2, roughness: .12, transparent: true, opacity: .8, depthWrite: false }), 0, 0, 0, g));
      updaters.pagoda.push((dt, t, motion) => { flowTex.offset.x -= dt * .12 * (motion || .3); });
      // stones along both edges and a few rocks in the water
      const rs = rng(91), stones = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.3, 0), std({ color: 0x7a746a, roughness: .9, flatShading: true }), 260), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
      let k = 0;
      for (let x = X0; x < X1 && k < 250; x += .9 + rs() * .8) [-1, 1].forEach(sd => {
        if (k >= 250) return;
        const z = zAt(x) + sd * (W / 2 + .15 + rs() * .3), sc = .5 + rs() * .9;
        stones.setMatrixAt(k++, m4.compose(V(x, .06, z), q.setFromEuler(new THREE.Euler(rs() * 3, rs() * 3, 0)), V(sc, sc * .6, sc)));
      });
      for (let i = 0; i < 10 && k < 260; i++) { const x = X0 + 15 + rs() * (X1 - X0 - 30), sc = 1.2 + rs(); stones.setMatrixAt(k++, m4.compose(V(x, .1, zAt(x) + (rs() - .5) * W * .6), q.setFromEuler(new THREE.Euler(rs(), rs() * 3, 0)), V(sc, sc * .7, sc))); }
      stones.count = k; g.add(stones);
      // clumps of reeds on the banks
      const reedMat = std({ color: 0x6f8a3a, roughness: .9 }), reedGeo = new THREE.ConeGeometry(.03, 1.2, 4);
      const reeds = new THREE.InstancedMesh(reedGeo, reedMat, 400); k = 0;
      for (let c = 0; c < 40; c++) {
        const x = X0 + 10 + rs() * (X1 - X0 - 20), sd = rs() < .5 ? -1 : 1, z = zAt(x) + sd * (W / 2 + .5 + rs() * .6);
        for (let j = 0; j < 10; j++) reeds.setMatrixAt(k++, m4.compose(V(x + (rs() - .5) * .8, .6, z + (rs() - .5) * .5), q.setFromEuler(new THREE.Euler((rs() - .5) * .3, 0, (rs() - .5) * .3)), V(1, .7 + rs() * .6, 1)));
      }
      reeds.count = k; g.add(reeds);
      // 拱橋, an arched stone bridge over the stream behind the middle of the back wall, with carved parapets and lotus-topped posts
      const bz = zAt(0), granite = std({ color: 0x8c877d, roughness: .8 }), BL = W + 5, BH = 1.1, BW = 2.4, NS = 18;
      const deck = t => ({ z: bz + BL / 2 - t * BL, y: .1 + Math.sin(Math.PI * t) * BH });   // runs from the compound side (t = 0) to the far bank
      for (let i = 0; i < NS; i++) {
        const t0 = i / NS, t1 = (i + 1) / NS, a0 = deck(t0), a1 = deck(t1), len = Math.hypot(a1.z - a0.z, a1.y - a0.y);
        const slab = mesh(new THREE.BoxGeometry(BW, .22, len + .04), granite, 0, (a0.y + a1.y) / 2, (a0.z + a1.z) / 2, g);
        slab.rotation.x = Math.atan2(a1.y - a0.y, -(a1.z - a0.z));
      }
      // open underneath: two thin stone arch ribs carry the deck from bank to bank, with abutments on each bank
      [-1, 1].forEach(sx => {
        const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24, d = deck(t); pts.push(V(sx * (BW / 2 - .15), d.y - .2 - .25 * Math.sin(Math.PI * t), d.z)); }
        mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .12, 8), granite, 0, 0, 0, g);
      });
      [1, -1].forEach(e => mesh(new THREE.BoxGeometry(BW + .2, .5, .9), granite, 0, .2, bz + e * (BL / 2 - .2), g));
      [-1, 1].forEach(sx => {   // parapets: a rail on posts, lotus buds on top
        const rail = []; for (let i = 0; i <= 24; i++) { const d = deck(i / 24); rail.push(V(sx * (BW / 2 - .08), d.y + .62, d.z)); }
        mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rail), 48, .07, 6), granite, 0, 0, 0, g);
        for (let i = 0; i <= 8; i++) {
          const d = deck(i / 8);
          mesh(new THREE.BoxGeometry(.18, .7, .18), granite, sx * (BW / 2 - .08), d.y + .4, d.z, g);
          mesh(new THREE.SphereGeometry(.12, 10, 8), granite, sx * (BW / 2 - .08), d.y + .82, d.z, g);
        }
      });
      // the path from the bridge up to the back gate, and on inside to the pagoda's deck
      flat(mesh(new THREE.BoxGeometry(2.6, .05, -16 - (bz + BL / 2)), M.stone, 0, .03, (bz + BL / 2 - 16) / 2, g));
      flat(mesh(new THREE.BoxGeometry(2.6, .05, 6.4), M.stone, 0, .03, -12.7, g));   // from the back gate to the foot of the pagoda's river-side stair
      // 後山門, the back gate: red pillars on stone bases, a painted beam, the name board and a small tiled roof
      const GZ = -16, GW = 5.0, GH = 3.8;
      [-1, 1].forEach(sx => {
        mesh(new THREE.BoxGeometry(.8, .4, .8), M.stone, sx * GW / 2, .2, GZ, g);
        mesh(new THREE.CylinderGeometry(.22, .25, GH, 14), pillarRed, sx * GW / 2, .4 + GH / 2, GZ, g);
      });
      mesh(new THREE.BoxGeometry(GW + .6, .45, .4), beamMat, 0, .4 + GH - .25, GZ, g);
      mesh(new THREE.BoxGeometry(GW + .8, .2, .5), pillarRed, 0, .4 + GH + .1, GZ, g);
      tiledHipRoof(g, 0, GZ, .4 + GH + .2, GW / 2 + 1.1, 1.3, 1.2, .35, [0, .1, .2, .3, .4, .5, .6, .7, .8, .88, .93], .7);
      const gateBoard = writing(512, 160, (c, cw, ch) => {
        c.fillStyle = "#16233d"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 12; c.strokeRect(8, 8, cw - 16, ch - 16);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(96); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("後山門", cw / 2, ch / 2 + 6);
      });
      const gb = flat(mesh(new THREE.PlaneGeometry(1.8, .56), new THREE.MeshStandardMaterial({ map: gateBoard, roughness: .6, emissive: 0x222222, emissiveMap: gateBoard }), 0, .4 + GH - .85, GZ - .22, g));
      gb.rotation.y = Math.PI;   // the board faces the river
      [-1, 1].forEach(sx => lantern(g, sx * 1.3, 2.9, GZ - .1, .4 + GH - .5, .8));
      // 石獅, a pair of stone guardian lions on plinths either side of the gate, facing the river,
      // mirrored like the pair at the front gate so each has its paw on the inner side
      [["lionL", -3.3], ["lion", 3.3]].forEach(([fig, x]) => {
        mesh(new THREE.BoxGeometry(1.7, .7, 2.0), granite, x, .35, GZ - 2.4, g);
        mesh(new THREE.BoxGeometry(1.85, .1, 2.15), M.stone, x, .72, GZ - 2.4, g);
        const lg = new THREE.Group(); lg.position.set(x, .77, GZ - 2.4); lg.rotation.y = Math.PI; lg.scale.setScalar(1.15); g.add(lg);
        sculptFigure(fig, lg, "the guardian lions");
      });
    })();
    templeGrounds(g);
    // festival strings: from each corner of the ground storey's roof out to a lantern post round the plaza (higher up they would pass through this roof)
    const post = (x, z, h) => {
      sCircle(g, x, z, .2);
      mesh(new THREE.CylinderGeometry(.12, .16, h, 10), M.lacquer, x, h / 2, z, g);
      mesh(new THREE.BoxGeometry(.5, .08, .5), M.trim, x, h, z, g);
      const l = flat(mesh(lanternGeo, lanternMat, x, h + .5, z, g)); l.scale.set(1.5, 1.8, 1.5);
      const gl = glowSprite(0xff6a2a, 3.2, .55); gl.position.set(x, h + .5, z); g.add(gl);
      return V(x, h + .1, z);
    };
    const strings = eaveCorners.map(a => {
      const d = V(a.x, 0, a.z).normalize();
      return { a, b: post(d.x * 16, d.z * 16, 4), count: 10, sag: 1.6 };
    });
    lanternStrings(g, strings, 1.5);
    // the approach: gate, lion guardians, a stone path and the lotus pond crossed by the bridge
    const POND = { z: 26.6, r: 10 }, GATE_Z = 43;
    outdoorPond(g, 0, POND.z, POND.r);
    [[10.2, POND.z - POND.r - 1.2], [POND.z + POND.r + 1.2, GATE_Z + 7]].forEach(([a, b]) =>
      flat(mesh(new THREE.BoxGeometry(3, .06, b - a), M.stone, 0, .03, (a + b) / 2, g)));
    gate(g, GATE_Z);
    // stone roads tying the buildings together: from the main path to the temple hall's forecourt,
    // and along the inside of the front wall from the gate to the hall's forecourt
    flat(mesh(new THREE.BoxGeometry(13.6, .06, 2.6), M.stone, 8.25, .03, 12.9, g));      // to the temple hall, and on to the training ground's road
    flat(mesh(new THREE.BoxGeometry(2.6, .06, 7.8), M.stone, 15, .03, 8.9, g));           // up into the training ground
    flat(mesh(new THREE.BoxGeometry(5.6, .06, 2.4), M.stone, 10.2, .03, -1, g));          // from the pagoda deck to the training ground
    flat(mesh(new THREE.BoxGeometry(12.7, .06, 1.6), M.stone, 11.55, .03, 41.4, g));
    // on the left: the same two cross roads, a road along the front of the shop and quarters, and a path out to the pavilion
    flat(mesh(new THREE.BoxGeometry(16.7, .06, 2.6), M.stone, -9.85, .03, 12.9, g));
    flat(mesh(new THREE.BoxGeometry(14.3, .06, 1.6), M.stone, -12.35, .03, 41.4, g));
    // the Bell Tower road: straight down from the tower's steps, past the shop, to the front wall, kerbed and lamplit
    const KX = -17, Z0 = 2.4, Z1 = 42.2, RW = 2.8;
    flat(mesh(new THREE.BoxGeometry(RW, .06, Z1 - Z0), M.stone, KX, .03, (Z0 + Z1) / 2, g));
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.16, .12, Z1 - Z0), std({ color: 0x8a847a, roughness: .8 }), KX + sd * (RW / 2 + .08), .06, (Z0 + Z1) / 2, g));
    for (let z = 8; z <= 38; z += 7.5) [-1, 1].forEach(sd => {   // stone lanterns (石燈籠) along both sides, none on the shop's forecourt
      if (sd < 0 && z > 18 && z < 36) return;
      const x = KX + sd * (RW / 2 + .7);
      mesh(new THREE.BoxGeometry(.5, .2, .5), M.stone, x, .1, z, g);
      sCircle(g, x, z, .3);
      mesh(new THREE.CylinderGeometry(.09, .12, .9, 8), M.stone, x, .65, z, g);
      mesh(new THREE.BoxGeometry(.46, .38, .46), std({ color: 0x3a1608, emissive: 0xffa040, emissiveIntensity: .9 }), x, 1.29, z, g);
      const cap = mesh(new THREE.ConeGeometry(.42, .3, 4), M.stone, x, 1.63, z, g); cap.rotation.y = Math.PI / 4;
      const gl = glowSprite(0xffa050, 1.4, .6); gl.position.set(x, 1.29, z); g.add(gl);
    });
    flat(mesh(new THREE.BoxGeometry(3.0, .06, 16), M.stone, -19.9, .03, 27, g));          // the shop's forecourt, meeting the road
    flat(mesh(new THREE.BoxGeometry(3.3, .06, 1.8), M.stone, -14.0, .03, 26, g));         // out to the lotus pavilion
    [11.4, POND.z + POND.r + 1.6, GATE_Z - 2].forEach(z => [-2.6, 2.6].forEach(x => post(x, z, 2.6)));
    lanternStrings(g, [-2.6, 2.6].map(x => ({ a: V(x, 2.7, 11.4), b: V(x, 2.7, POND.z + POND.r + 1.6), count: 14, sag: .4 })), 1);
    lanternStrings(g, [-2.6, 2.6].map(x => ({ a: V(x, 2.7, POND.z + POND.r + 1.6), b: V(x, 2.7, GATE_Z - 2), count: 5, sag: .3 })), 1);
    // a pointed tiled roof over the top storey, then the gilt spire on a red drum
    tiledEave(g, y - .2, .08, 4.6 - (FLOORS.length - 1) * .42 + .9, 1.9, .35);
    const top = new THREE.Group(); top.position.y = y + 1.3; g.add(top);
    oct(mesh(new THREE.CylinderGeometry(.42, .5, .5, 8), pillarRed, 0, .25, 0, top));
    mesh(new THREE.CylinderGeometry(.07, .1, 3.2, 12), M.gold, 0, 2.1, 0, top);
    for (let i = 0; i < 7; i++) { const t = mesh(new THREE.TorusGeometry(.4 - i * .04, .06, 8, 32), M.gold, 0, .75 + i * .32, 0, top); t.rotation.x = Math.PI / 2; }
    mesh(new THREE.ConeGeometry(.16, 1.4, 12), M.gold, 0, 3.6, 0, top);
    const hemi = new THREE.HemisphereLight(0x6f78c8, 0x2a1408, .55); g.add(hemi);
    const moonLight = new THREE.DirectionalLight(0xb8c4ff, .7); moonLight.position.set(-30, 50, 40); g.add(moonLight);
    const sunLight = new THREE.DirectionalLight(0xfff0d8, 0); sunLight.position.set(35, 60, -30); g.add(sunLight);
    const lights = () => {
      const d = daylight, m = celestial.moonNight;
      // on Halloween night, once the houses are dark, the town gives off no glow: the sky's fill light all but goes,
      // the moonlight thins and the roads fall dark between the street lamps
      const dark = (1 - d) * FEST.out;
      hemi.color.copy(lerpC(0x6f78c8, 0xc8dcff, d)); hemi.groundColor.copy(lerpC(0x2a1408, 0x5a4a34, d));
      hemi.intensity = (.55 + .25 * d) * (1 - .8 * dark);
      sunLight.position.copy(celestial.sun).multiplyScalar(80);
      const moonUp = m && m.up;
      if (moonUp) moonLight.position.copy(m.dir).multiplyScalar(80);
      // moonlight scales with how much of the moon is lit and whether it is up; starlight keeps a little
      moonLight.intensity = (1 - d) * (moonUp ? .25 + .6 * celestial.fraction : .15) * (1 - .55 * dark);
      sunLight.intensity = 1.5 * d * clamp(celestial.sun.y * 2.5, .35, 1);
    };
    onDaylight(lights); onCelestial(lights);
    const warm = new THREE.SpotLight(0xffb070, 1.6, 70, .5, .7, 1); warm.position.set(14, 4, 24); warm.target.position.set(0, 10, 0); g.add(warm, warm.target);
    dayLight(warm, [0xffb070, 1.6], [0xffb070, .4]);
    const door = new THREE.PointLight(0xffa050, 2, 14, 2); door.position.set(0, DECK + 2.5, 8); g.add(door);
    updaters.pagoda.push((dt, t) => storeys.forEach(s => s.winMat.emissiveIntensity = s.base * (hovered && hovered.userData.floor === s.f ? 2.2 : 1) + Math.sin(t * 1.3 + s.f) * .05));
    bakeParts(g);
    indexCull(g);
    return g;
  }

  /* ---------- selective rendering of the grounds: everything is sorted once into a grid of cells; whenever the camera moves,
     cells behind it or past the fog are hidden whole, and in the cells left each object is drawn only if it is in view, nearer
     than the fog's far edge and big enough to cover a couple of pixels at that distance. Lights are never hidden (that would
     recompile every material), nor the sky, the land, the far hills and anything that moves about. ---------- */
  const CULL = { cells: [], cell: 24, big: 60, far: 140, minPx: (ctx.cull && ctx.cull.minPixels) || 2, on: !ctx.cull || ctx.cull.enabled !== false, n: 0, lastM: new THREE.Matrix4(), lastFar: 0 };
  const _cb = new THREE.Box3(), _cbx = new THREE.Box3(), _cm = new THREE.Matrix4(), _cs = new THREE.Sphere(), _cv = new THREE.Vector3(), _cinv = new THREE.Matrix4(), _frustum = new THREE.Frustum();
  // an object's bounds in the grounds' frame; instanced meshes by their instances (three.js r128 only looks at the base geometry)
  function boundsOf(o) {
    _cb.makeEmpty();
    o.traverse(n => {
      if (n.isInstancedMesh) {
        if (!n.geometry.boundingSphere) n.geometry.computeBoundingSphere();
        for (let i = 0; i < n.count; i++) { n.getMatrixAt(i, _cm); _cm.premultiply(n.matrixWorld); _cb.union(_cs.copy(n.geometry.boundingSphere).applyMatrix4(_cm).getBoundingBox(_cbx)); }
      } else if (n.isMesh) {
        if (!n.geometry.boundingBox) n.geometry.computeBoundingBox();
        _cb.union(_cbx.copy(n.geometry.boundingBox).applyMatrix4(n.matrixWorld));
      } else if (n.isSprite) {
        _cb.union(_cbx.setFromCenterAndSize(n.getWorldPosition(_cv), _cv.clone().setScalar(Math.max(n.scale.x, n.scale.y))));
      }
    });
    return _cb.isEmpty() ? null : _cb.getBoundingSphere(new THREE.Sphere());
  }
  const hasLight = o => { let f = false; o.traverse(n => { if (n.isLight) f = true; }); return f; };
  function indexCull(g) {
    g.updateMatrixWorld(true);
    const cells = new Map();
    const walk = o => o.children.forEach(ch => {
      if (ch.isLight || ch.isPoints || ch.userData.noCull || !ch.visible) return;
      const s = boundsOf(ch); if (!s) return;
      if (s.radius > CULL.big || hasLight(ch)) {   // too big to cull, or holds a light: look inside it instead
        if (ch.isInstancedMesh) ch.frustumCulled = false;
        walk(ch); return;
      }
      if (Math.hypot(s.center.x, s.center.z) > CULL.far) return;   // the far hills and fields stay
      ch.traverse(n => { if (n.isInstancedMesh) n.frustumCulled = false; });   // the cell test does it, by the instances' real bounds
      const k = Math.floor(s.center.x / CULL.cell) + "," + Math.floor(s.center.z / CULL.cell);
      let c = cells.get(k); if (!c) cells.set(k, c = { items: [], box: new THREE.Box3(), sphere: new THREE.Sphere(), vis: true });
      c.items.push({ o: ch, s }); c.box.union(s.getBoundingBox(_cbx));
    });
    walk(g);
    CULL.cells = [...cells.values()];
    CULL.cells.forEach(c => c.box.getBoundingSphere(c.sphere));
  }
  // called every frame from the main script with the canvas height in pixels; works only when the view has changed
  function cull(cam, heightPx) {
    if (!CULL.on || !pagoda || !pagoda.visible) return;
    cam.updateMatrixWorld();
    const far = world.fog ? world.fog.far : Infinity;
    if (CULL.n++ % 30 && cam.matrixWorld.equals(CULL.lastM) && far === CULL.lastFar) return;   // nothing moved (a full pass now and then anyway)
    CULL.lastM.copy(cam.matrixWorld); CULL.lastFar = far;
    pagoda.updateMatrixWorld();
    const eye = _cv.setFromMatrixPosition(cam.matrixWorld).applyMatrix4(_cinv.copy(pagoda.matrixWorld).invert());   // the camera in the grounds' frame
    _frustum.setFromProjectionMatrix(_cm.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).multiply(pagoda.matrixWorld));
    const focal = heightPx / 2 / Math.tan(cam.fov * Math.PI / 360);   // pixels per unit at unit distance
    CULL.cells.forEach(c => {
      if (eye.distanceTo(c.sphere.center) - c.sphere.radius > far || !_frustum.intersectsSphere(c.sphere)) {
        if (c.vis) { c.items.forEach(it => it.o.visible = false); c.vis = false; }
        return;
      }
      c.vis = true;
      c.items.forEach(({ o, s }) => {
        const d = eye.distanceTo(s.center);
        o.visible = d - s.radius < far && s.radius * focal / Math.max(d, .1) >= CULL.minPx && _frustum.intersectsSphere(s);
      });
    });
  }
  // hidden things cannot be tapped
  const shown = o => { for (; o && o !== pagoda; o = o.parent) if (!o.visible) return false; return true; };

  /* ---------- what the main script calls ---------- */
  return {
    show(mode) {
      if (backdrop) { backdrop = 0; Object.values(groups).forEach(gr => { if (gr.userData.vista) gr.userData.vista.visible = true; }); if (pagoda) pagoda.position.y = 0; }
      if (mode === "pagoda") pagoda = pagoda || buildPagoda();
      else if (mode !== 1) floor(mode);
      doors.forEach(h => h.rotation.y = 0);
      Object.entries(groups).forEach(([k, g]) => g.visible = k === String(mode));
      if (pagoda) pagoda.visible = mode === "pagoda";
    },
    clickables(mode) { return mode === "pagoda" && CULL.on ? (picks.pagoda || []).filter(shown) : picks[mode] || []; },
    cull,
    set culling(on) { CULL.on = on; if (!on) CULL.cells.forEach(c => { c.vis = true; c.items.forEach(it => it.o.visible = true); }); },
    get fourTop() { return fourTop; },
    get market() { return MARKET; },
    groundAt, terrainAt, walkAt, get monasteries() { return MONASTERIES; },
    // where the world makes its sounds, in the grounds' frame (the main script's ambience fades each in by distance):
    // the hti bells on the stupa hill's spires, the Bell Tower, the gong in the Lotus Temple hall, the compound's walls
    // [x0, x1, z0, z1], the old banyan, the paddies [x0, x1, z0, z1], the forest's edge
    sounds: { stupa: [HILL.cx, HILL.top + 8, HILL.cz], bell: [-17, -1.5], gong: [24.5, 26], compound: [-33, 33, -16, 43],
              banyan: [36.4, 65.4], fields: [-104, 64, -94, -42], forestZ: -98 },
    get pavilionSeat() { return PAV_SEAT; },
    get corridorRing() { return CORRIDOR_RING; },
    // inside a hall: is (x, z) taken by furniture, columns or the stair room?
    indoorBlocked(mode, x, z) {
      const c = (cx, cz, r) => Math.hypot(x - cx, z - cz) < r + PAD, rc = (x0, x1, z0, z1) => x > x0 - PAD && x < x1 + PAD && z > z0 - PAD && z < z1 + PAD;
      if ([...INNER_COLUMNS, ...CORNER_COLUMNS].some(([cx, cz]) => c(cx, cz, .3))) return true;
      if (typeof mode === "number" && rc(STAIR_ROOM.x0, STAIR_ROOM.x1, STAIR_ROOM.z0, STAIR_ROOM.z1)) return true;
      if (mode === 1 || mode === 4 || mode === 7 || mode === "library") {   // the statue on its pedestal, the offering table, the censer and the stands
        if (c(0, -1.7, 1.75) || rc(-1.6, 1.6, .25, 1.25) || c(0, 1.95, .6)) return true;
        if (mode === 1 && (rc(-1.4, 1.4, 1.6, 2.3) || rc(-.8, .8, 2.5, 3.1))) return true;   // candle stands and kneeling bench
      }
      if (mode === 2) return [[-2.4, -1.1], [0, -1.8], [2.4, -1.1]].some(([cx, cz]) => c(cx, cz, .8));
      if (mode === 5) return rc(-1, 1, -.85, .05) || rc(1.6, 4.2, -4.7, -3.9) || rc(-2.7, -2.1, .3, .9);
      if (mode === 6) return c(0, -1.4, 2.3);
      if (mode === "shop") return rc(-2.55, 2.55, -1.45, -.55) || z < -4.4;
      if (mode === "quarters") return rc(-2.6, 2.6, -2.1, -1.1) || rc(-2.6, 2.6, 1.1, 2.1) || x < -5.1 || x > 6.6 || rc(1.2, 3.8, -5.5, -4.7);
      if (mode === "bell") return rc(-1.2, 1.2, -1.8, -1.4);
      return false;
    },
    setDaylight(d) { daylight = d; dayParts.forEach(fn => fn(d)); },
    // Halloween night: `on` lets the ghost out, `out` (0–1) puts out the houses' and huts' lights; `ghost` is where it is, while out
    setHalloween({ on, out }) { FEST.on = on; if (out !== FEST.out) { FEST.out = out; dayParts.forEach(fn => fn(daylight)); } },
    get ghost() { return FEST.ghost || null; },
    setCelestial(c) { Object.assign(celestial, c); celestialParts.forEach(fn => fn()); },
    openDoor(mode) { return openers[mode] ? openers[mode]() : 0; },
    dress(hall) { const list = []; sumeru(hall, 0, -1.7); hallColumns(hall); hallWalls(hall, M.wall, false); moreLanterns(hall, 1); spiralStairs(hall, 1, list); stairRoom(hall, 1, list); frontWall(hall, 1, list); return list; },
    hover(obj) { hovered = obj; },
    activate(obj, mode, point) {
      if (obj.userData.coinPond && pondCoinThrow) {
        const n = pondCoinThrow(point || obj.getWorldPosition(V(0, 0, 0)));
        return { toast: `Your coin falls among the lotus. Make a wish. ${n === 1 ? "The first coin" : n + " coins"} you have given to the pond.` };
      }
      if (obj.userData.bathe && pondBathe) {
        return pondBathe() ? { toast: "You pour pond water over the infant Buddha, washing away the dust of the year: may your mind be as clear as the water." } : {};
      }
      if (obj.userData.pavilion) return { pavilion: true };
      if (obj.userData.ringBell) { bellRingers.forEach(f => f()); return {}; }
      if (obj.userData.fourTop) return { fourTop: true };
      if (obj.userData.market) return { market: true };
      if (obj.userData.view) return { view: obj.userData.view };
      if (obj.userData.toast) return { toast: obj.userData.toast };
      if (obj.userData.floor) return { floor: obj.userData.floor, delay: obj.userData.open ? obj.userData.open() : 0 };
      const act = actions[mode];
      return act ? act(obj.userData.act) || {} : {};
    },
    update(dt, t, mode, motion, eye) {
      FEST.eye = mode === "pagoda" ? eye : null;
      (updaters[mode] || []).forEach(fn => fn(dt, t, motion));
      if (backdrop && mode !== "pagoda") (updaters.pagoda || []).forEach(fn => fn(dt, t, motion));   // koi, smoke, flags seen from the corridor
    },
    // from a corridor, show the real grounds below at this storey's height instead of the painted vista
    setBackdrop(n) {
      backdrop = n || 0;
      const g = groups[n] || groups[String(n)];
      if (backdrop) pagoda = pagoda || buildPagoda();
      if (pagoda) { pagoda.visible = !!backdrop || false; pagoda.position.y = backdrop ? -(STOREY_Y[n] || 0) : 0; }
      Object.values(groups).forEach(gr => { if (gr.userData.vista) gr.userData.vista.visible = !backdrop; });
    },
    name: floorName
  };
};
