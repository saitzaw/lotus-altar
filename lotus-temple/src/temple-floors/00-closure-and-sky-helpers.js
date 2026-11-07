/* Floors 2–7 of the Lotus Altar pagoda, the Bell Tower and the temple hall (蓮華寺), and the temple seen from outside.
   Floor 1, Guanyin's main hall, lives in lotus-altar.js. Every floor shares the main hall's footprint
   (statue at z = -1.7, offering table at z = .75) so the same camera views work on each one.
   Each floor is built the first time someone visits it. */
window.TempleFloors = function TempleFloors(ctx) {
  "use strict";
  const { THREE, world, V, TAU, clamp, easeOut, mesh, lathe, std, M, glowSprite, glowTex, canvasTex, petalGeo, makeLotus, makeFlame, tone, tween, sculptFigure, shrine, floors: FLOORS, places: PLACES, reduceMotion } = ctx;
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
  // townsfolk (set from the main script): `out` from 6 pm to 10 pm, `umbrellas` up while it rains (see townsfolk)
  const BAND = [], STAGE = [0, 0];   // the festival stage's ensemble: strokes waiting to be heard, [kind, loudness]; the stage's centre in the world
  const FOLK = { out: false, umbrellas: false, dance: null, drill: null };   // dance: who is on the festival stage, "solo", "pair" or null; drill: "dragon", "lion" or null on the kung fu ground
  // the beat officer (set from the main script): `walking` while a visitor is on foot outside; `news` is the latest of spotted,
  // safe, lost or arrested, until the main script reads it (see beatOfficer)
  const COP = { on: false, night: true, walking: false, see: 16, speed: 2.1, beat: 1.2, arrest: 1, hold: 30, news: null, at: null };
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
    light.userData.day = true;
    onDaylight(d => { light.color.copy(lerpC(night[0], day[0], d)); light.intensity = night[1] + (day[1] - night[1]) * d; if (light.groundColor && night[2] !== undefined) light.groundColor.copy(lerpC(night[2], day[2], d)); });
  }
  // a hall by day: its lamps are out (every point light, see lampsOn in the main script) and daylight comes in through the
  // doors and windows, so its amber sky light turns pale and bright and its key and side lights take the sun's white
  function daylit(root) {
    const ls = [];
    root.traverse(l => { if (l.isLight && !l.isPointLight && !l.userData.day) ls.push(l); });
    ls.forEach(l => l.isHemisphereLight ? dayLight(l, [l.color.getHex(), l.intensity, l.groundColor.getHex()], [0xe4ecf4, l.intensity + .6, 0x6e6252])
      : dayLight(l, [l.color.getHex(), l.intensity], [0xfff4e4, l.intensity * 1.15]));
  }
  // window glass lit from inside by lamps at night, plain dark glass by day
  const lampPane = (emissive, k) => { const m = std({ color: 0x3a1608, emissive, emissiveIntensity: k }); onDaylight(d => m.emissiveIntensity = k * (1 - d) + .04); return m; };
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

