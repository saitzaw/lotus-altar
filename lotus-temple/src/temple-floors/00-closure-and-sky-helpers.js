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
  // Halloween night (set from the main script): `out` 0–1 as the houses put their lights out at 9 pm,
  // `on` while the friendly ghost walks the roads; the pole lights it passes flicker (see halloweenGhost)
  const FEST = { on: false, out: 0, eye: null };
  // townsfolk (set from the main script): `out` from 6 pm to 10 pm, `umbrellas` up while it rains (see townsfolk)
  const BAND = [], STAGE = [0, 0];   // the Shan ensemble's strokes waiting to be heard, [kind, loudness, pitches or drum, when it fell (performance.now(), s), and x, z where it is heard from when not the stage]; the stage's centre in the world
  const GUARD_HATS = { back: [], on: [], rain: false };   // the palace guards' straw hats, slung on their backs, or on their heads while it rains (see palaceGuards)
  const FOLK = { out: false, umbrellas: false, dance: null, drill: null, service: false, morning: false, school: true, stalls: false, food: false, procession: false, processionAt: null, kathin: false, kathinAt: null, balloons: true, balloonKind: "auto", fireLotus: false, lotusLanterns: false, christmas: false, carols: false, carolAt: null, harvest: false, festLights: false };   // festLights: the festival ground's night lights are on   // lotusLanterns: the lotus lanterns round the hill's main stupa (October and November)   // balloons: the fire balloons go up (off in the rain), balloonKind: which ("day", "night", "auto" by the light, null none);   // procession: the Poy Sang Long novice procession is out, processionAt: seconds since it set out (null: forced on, so it runs on its own short test timetable); kathin: the Shan Kathin robe offering is out, kathinAt: seconds since noon (null: its short test timetable);   // stalls: sellers at the seven-day market's stalls and shoppers in its aisles; food: people on the food street; morning: the morning market is on at the seven-day market; service: the Sunday service is on in the Kachin church; dance: who is on the festival stage, "solo", "pair", "to", "twoTo", "toKinnara" or null; drill: "dragon", "lion" or null on the kung fu ground
  // the beat officer (set from the main script): `walking` while a visitor is on foot outside; `news` is the latest of spotted,
  // safe, lost or arrested, until the main script reads it (see beatOfficer)
  const COP = { on: false, night: true, walking: false, see: 16, speed: 2.1, beat: 1.2, arrest: 1, hold: 30, news: null, at: null };
  const poleLights = [];   // { x, z, set(lit) } in the grounds' frame
  const lerpC = (a, b, d) => new THREE.Color(a).lerp(new THREE.Color(b), d);
  // the real sun and moon for this moment, set from the main script (temple frame: +z south, +x east, +y up),
  // whether the moon is above the horizon, and its phase texture and tilt
  const celestial = { sun: V(.3, .8, .5), moon: null, moonTex: null, fraction: .5 };
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
    // the moon, where it stands right now: its lit face and a soft halo
    const disc = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, fog: false, toneMapped: false }));
    disc.scale.setScalar(r * .07); parent.add(disc);
    const halo = glowSprite(0xdfe6ff, r * .22, .5); halo.material.fog = false; parent.add(halo);
    [dome, sun, core, disc, halo].forEach(o => o.userData.noCull = true);   // they show and hide themselves
    const placeMoon = (info, alpha) => {
      disc.visible = halo.visible = alpha > .001;
      if (!disc.visible) return;
      disc.position.copy(squash(info.dir, top)).multiplyScalar(r * .88); halo.position.copy(disc.position);
      disc.material.map = celestial.moonTex; disc.material.rotation = info.rot; disc.material.needsUpdate = true;
      disc.material.opacity = alpha; halo.material.opacity = alpha * (.15 + .45 * celestial.fraction);
    };
    const update = () => {
      const d = daylight, sunUp = celestial.sun.y > 0;
      dome.material.opacity = d; dome.visible = d > .001;
      sun.position.copy(squash(celestial.sun, top)).multiplyScalar(r * .88); core.position.copy(sun.position);
      sun.material.opacity = sunUp ? d : 0; core.material.opacity = sunUp ? d : 0; sun.visible = core.visible = sunUp && d > .001;
      if (stars) stars.fade(1 - d);
      const info = celestial.moon;
      placeMoon(info, info && info.up ? 1 - .3 * d : 0);   // paler by day, when it is up in the afternoon
    };
    onDaylight(update); onCelestial(update);
  }
  /* ---------- the night sky: the stars and the Milky Way where they really stand over the temple right now ---------- */
  // The stars are kept in equatorial coordinates (x toward RA 0h, z toward the celestial pole) and turned each frame by the
  // local sidereal time and the temple's latitude, so the sky wheels round the pole as the night goes on. The brightest
  // stars are the real ones at their real places (Orion, the Plough, Cassiopeia, Scorpius, the Southern Cross low in the
  // south…); the faint ones are scattered, thicker along the Milky Way. Cloud, rain, mist and haze hide them
  // (SKYVIEW.clear) and a bright moon washes out the faint ones and the Milky Way.
  const SKYVIEW = { clear: 1 }, SKY_LAYERS = [];   // SKY_LAYERS: each sky's show(), run when the weather changes
  // [RA in hours, Dec in degrees, magnitude, colour]
  const BRIGHT_STARS = [
    [6.752, -16.716, -1.46, 0xd4e0ff], [6.399, -52.696, -.74, 0xf4f0ff], [14.261, 19.182, -.05, 0xffd2a1], [14.660, -60.834, -.27, 0xfff0d0],   // Sirius, Canopus, Arcturus, α Centauri
    [18.616, 38.784, .03, 0xd4e0ff], [5.278, 45.998, .08, 0xfff2c8], [5.242, -8.202, .13, 0xc4d4ff], [7.655, 5.225, .34, 0xfff4e8],   // Vega, Capella, Rigel, Procyon
    [1.629, -57.237, .46, 0xbcd0ff], [5.919, 7.407, .5, 0xffb070], [14.064, -60.373, .61, 0xbcd0ff], [19.846, 8.868, .76, 0xf0f2ff],   // Achernar, Betelgeuse, Hadar, Altair
    [12.443, -63.099, .77, 0xbcd0ff], [4.599, 16.509, .86, 0xffc080], [16.49, -26.432, .96, 0xff9c60], [13.42, -11.161, .97, 0xbcd0ff],   // Acrux, Aldebaran, Antares, Spica
    [7.755, 28.026, 1.14, 0xffd8a8], [22.961, -29.622, 1.16, 0xf4f4ff], [20.69, 45.28, 1.25, 0xf4f6ff], [12.795, -59.689, 1.25, 0xbcd0ff],   // Pollux, Fomalhaut, Deneb, Mimosa
    [10.14, 11.967, 1.35, 0xd8e2ff], [6.977, -28.972, 1.5, 0xc4d4ff], [7.577, 31.888, 1.58, 0xf0f4ff], [12.519, -57.113, 1.63, 0xffa868],   // Regulus, Adhara, Castor, Gacrux
    [12.252, -58.749, 2.79, 0xc4d4ff],                                                                                                       // δ Crucis
    [5.419, 6.35, 1.64, 0xc8d6ff], [5.604, -1.202, 1.69, 0xc4d4ff], [5.679, -1.943, 1.77, 0xc4d4ff], [5.533, -.299, 2.23, 0xc4d4ff], [5.796, -9.67, 2.06, 0xc4d4ff],   // Orion
    [5.438, 28.608, 1.65, 0xd4e0ff], [3.405, 49.861, 1.79, 0xfff0d0], [6.629, 16.399, 1.93, 0xf0f4ff], [2.12, 23.462, 2, 0xffc890], [3.136, 40.956, 2.12, 0xd4e0ff],   // Elnath, Mirfak, Alhena, Hamal, Algol
    [11.062, 61.751, 1.79, 0xffd090], [11.031, 56.382, 2.37, 0xf0f4ff], [11.897, 53.695, 2.44, 0xf0f4ff], [12.257, 57.033, 3.31, 0xf0f4ff],   // the Plough
    [12.9, 55.96, 1.77, 0xf0f4ff], [13.399, 54.925, 2.23, 0xf0f4ff], [13.792, 49.313, 1.86, 0xc8d6ff],
    [2.53, 89.264, 1.98, 0xfff4d8],                                                                                                          // Polaris
    [.675, 56.537, 2.24, 0xffc890], [.153, 59.15, 2.28, 0xfff4e8], [.945, 60.717, 2.47, 0xc8d6ff], [1.43, 60.235, 2.68, 0xf0f4ff], [1.907, 63.67, 3.37, 0xc8d6ff],   // Cassiopeia
    [.14, 29.091, 2.07, 0xc8d6ff], [1.162, 35.621, 2.07, 0xffb878], [2.065, 42.33, 2.1, 0xffc890], [23.079, 15.205, 2.49, 0xd4e0ff], [23.063, 28.083, 2.42, 0xffa868], [.22, 15.184, 2.83, 0xc4d4ff],   // Andromeda and Pegasus
    [10.333, 19.842, 2.08, 0xffd090], [11.818, 14.572, 2.14, 0xf0f4ff], [17.582, 12.56, 2.08, 0xf0f4ff], [.727, -17.987, 2.04, 0xffd090],   // Algieba, Denebola, Rasalhague, Diphda
    [20.37, 40.257, 2.23, 0xfff0d8], [19.512, 27.96, 3.05, 0xffc890], [20.77, 33.97, 2.48, 0xffd8a0], [19.75, 45.131, 2.87, 0xd4e0ff], [20.427, -56.735, 1.94, 0xc4d4ff],   // the Northern Cross, Peacock
    [16.006, -22.622, 2.29, 0xc4d4ff], [16.091, -19.806, 2.62, 0xc4d4ff], [16.836, -34.293, 2.29, 0xffc080], [16.598, -28.216, 2.82, 0xc4d4ff],   // Scorpius
    [17.56, -37.104, 1.62, 0xc4d4ff], [17.513, -37.296, 2.7, 0xc4d4ff], [17.622, -42.998, 1.86, 0xfff0d0], [17.708, -39.03, 2.39, 0xc4d4ff],
    [18.403, -34.385, 1.85, 0xc4d4ff], [18.921, -26.297, 2.05, 0xc4d4ff], [18.35, -29.828, 2.7, 0xffc080], [18.466, -25.422, 2.81, 0xffc890],   // the Teapot in Sagittarius
    [19.044, -29.88, 2.6, 0xf0f4ff], [18.761, -26.991, 3.17, 0xc4d4ff], [18.097, -30.424, 2.98, 0xffc890],
    [3.791, 24.105, 2.87, 0xc4d4ff], [3.819, 24.053, 3.62, 0xc4d4ff], [3.747, 24.113, 3.7, 0xc4d4ff], [3.763, 24.368, 3.87, 0xc4d4ff], [3.772, 23.948, 4.18, 0xc4d4ff], [3.753, 24.467, 4.3, 0xc4d4ff]   // the Pleiades
  ];
  const D2R = Math.PI / 180;
  const eqDir = (ra, dec) => [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
  // from galactic longitude and latitude to the equatorial frame (J2000)
  const GAL = [-.0548755604, -.8734370902, -.4838350155, .4941094279, -.44482963, .7469822445, -.867666149, -.1980763734, .4559837762];
  const galDir = (l, b) => {
    const x = Math.cos(b) * Math.cos(l), y = Math.cos(b) * Math.sin(l), z = Math.sin(b), G = GAL;
    return [G[0] * x + G[3] * y + G[6] * z, G[1] * x + G[4] * y + G[7] * z, G[2] * x + G[5] * y + G[8] * z];
  };
  // the Milky Way as seen from a dark hill, laid out flat in galactic longitude (centre in Sagittarius in the middle) and latitude ±MW_B:
  // a band that swells and brightens toward the centre, clumped into star clouds, split by the Great Rift from Cygnus to Sagittarius
  const MW_B = 35 * D2R;
  let milkyTex = null;
  function milkyWayTex() {
    if (milkyTex) return milkyTex;
    const W = 1024, H = 256, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"), img = g.createImageData(W, H), px = img.data, r = rng(77), N = 64, lat = new Float32Array(N * 256).map(() => r());   // 256 cells across, N down
    const vn = (x, y, p) => {   // smooth value noise, wrapping every p cells across
      const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      const at = (i, j) => lat[((j % N + N) % N) * 256 + ((i % p) + p) % p];
      const a = at(xi, yi), b = at(xi + 1, yi), c2 = at(xi, yi + 1), d = at(xi + 1, yi + 1);
      return a + (b - a) * sx + (c2 - a) * sy + (a - b - c2 + d) * sx * sy;
    };
    // fbm: cells about as tall as they are wide on the sky (the canvas spans 360° across and 70° down)
    const fbm = (u, v, o) => .45 * vn(u * 24 + o, v * 5, 24) + .28 * vn(u * 48 + 5 + o, v * 10, 48) + .17 * vn(u * 96 + 9 + o, v * 19, 96) + .1 * vn(u * 192 + 3 + o, v * 38, 192);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H, l = (u - .5) * 360, b = (.5 - v) * 2 * 35;   // degrees; the canvas's top row is the north galactic side
      const core = Math.exp(-((l / 35) ** 2)), cyg = Math.exp(-(((l - 75) / 22) ** 2)), sig = 7 + 6 * core + 3 * cyg;
      const n = fbm(u, v, 0), dust = fbm(u, v, 31);
      const clumps = clamp(.35 + 1.7 * (n - .35), .15, 1.6);   // star clouds with darker gaps between
      let k = Math.exp(-((b / sig) ** 2)) * (.25 + .3 * (.5 + .5 * Math.cos(l * D2R)) + .5 * core + .3 * cyg) * clumps;
      k += .35 * Math.exp(-((l / 10) ** 2) - (b / 6) ** 2) * (.6 + .6 * n);   // the bulge round the centre, in Sagittarius
      const rift = Math.exp(-(((b - 1.2 - .025 * l) / (1.8 + .02 * Math.max(l, 0))) ** 2)) * clamp((l + 10) / 12, 0, 1) * clamp((70 - l) / 15, 0, 1);
      const lanes = clamp((dust - .5) * 4, 0, 1) * Math.exp(-((b / (sig * .8)) ** 2));   // dark dust clouds scattered along the band
      k *= (1 - .85 * rift * (.6 + .6 * dust)) * (1 - .7 * lanes) * (1 - .35 * Math.exp(-((b / 1.3) ** 2)));   // the Great Rift and the thin dust along the middle
      k *= .9 + .2 * r();   // the grain of countless faint stars
      const warm = clamp(core * 1.4, 0, 1), i = (y * W + x) * 4;
      px[i] = clamp(k * (175 + 50 * warm), 0, 255); px[i + 1] = clamp(k * (185 + 20 * warm), 0, 255); px[i + 2] = clamp(k * (225 - 55 * warm), 0, 255); px[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    milkyTex = new THREE.CanvasTexture(c);
    return milkyTex;
  }
  // a sky of stars at radius r in `parent`; returns { fade(v) } for daySky
  function starrySky(parent, r, seed) {
    const pos = [], col = [], mag = [], ph = [], rs = rng(seed), c = new THREE.Color();
    const add = (d, m, hex) => { pos.push(...d); c.setHex(hex); col.push(c.r, c.g, c.b); mag.push(m); ph.push(rs()); };
    BRIGHT_STARS.forEach(([ra, dec, m, hex]) => add(eqDir(ra * 15 * D2R, dec * D2R), m, hex));
    const TINTS = [0xc4d4ff, 0xdce6ff, 0xf4f4ff, 0xf4f4ff, 0xfff4e0, 0xfff0d0, 0xffd8a8, 0xffc090];
    for (let i = 0; i < 3400; i++) {
      const d = rs() < .4 ? galDir(rs() * TAU, (rs() + rs() + rs() - 1.5) * 18 * D2R)   // thicker along the Milky Way
        : (z => eqDir(rs() * TAU, Math.asin(z)))(rs() * 2 - 1);
      add(d, 6.4 - 3.6 * rs() ** 3, TINTS[Math.floor(rs() * TINTS.length)]);
    }
    const uni = { uSky: { value: new THREE.Matrix3() }, uR: { value: r }, uFade: { value: 1 }, uMoon: { value: 0 }, uTime: { value: 0 }, uTwinkle: { value: reduceMotion ? 0 : 1 }, uPx: { value: 1 }, uTex: { value: null } };
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    sg.setAttribute("mag", new THREE.Float32BufferAttribute(mag, 1)); sg.setAttribute("phase", new THREE.Float32BufferAttribute(ph, 1));
    const stars = new THREE.Points(sg, new THREE.ShaderMaterial({
      uniforms: uni, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `uniform mat3 uSky; uniform float uR, uFade, uMoon, uTime, uTwinkle, uPx; attribute vec3 color; attribute float mag, phase; varying vec3 vCol; varying float vA;
        void main() {
          vec3 d = uSky * position;
          float lim = 6.4 - 2.4 * uMoon, h = d.y;
          float a = clamp((lim - mag) / 1.6, 0., 1.) * clamp(.4 + .6 * pow(10., -.4 * (mag - 2.)), 0., 1.);
          a *= smoothstep(-.01, .14, h) * (1. - .45 * (1. - smoothstep(0., .3, h)) * step(1.5, mag));   // dimmed through the thick air near the horizon
          a *= 1. - .4 * uTwinkle * (1.15 - h) * (.5 + .5 * sin(uTime * (1.7 + 3. * fract(phase * 7.3)) + phase * 6.283));
          vA = a * uFade; vCol = mix(color, color * vec3(1., .82, .62), 1. - smoothstep(0., .25, h));
          gl_PointSize = uPx * clamp(4.6 - .6 * mag, 2., 7.);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(d * uR, 1.);
        }`,
      fragmentShader: `varying vec3 vCol; varying float vA;
        void main() { vec2 p = gl_PointCoord - .5; float k = exp(-dot(p, p) * 22.); if (k * vA < .004) discard; gl_FragColor = vec4(vCol * k * vA * 1.3, 1.); }`
    }));
    // the Milky Way: a band of the sphere built straight from galactic longitude and latitude
    const band = new THREE.PlaneGeometry(1, 1, 192, 24), bp = band.attributes.position, buv = band.attributes.uv;
    for (let i = 0; i < bp.count; i++) bp.setXYZ(i, ...galDir((buv.getX(i) - .5) * TAU, (buv.getY(i) - .5) * 2 * MW_B));
    uni.uTex.value = milkyWayTex();
    const milky = new THREE.Mesh(band, new THREE.ShaderMaterial({
      uniforms: uni, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: `uniform mat3 uSky; uniform float uR; varying vec2 vUv; varying float vH;
        void main() { vec3 d = uSky * position; vUv = uv; vH = d.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(d * uR * 1.01, 1.); }`,
      fragmentShader: `uniform sampler2D uTex; uniform float uFade, uMoon; varying vec2 vUv; varying float vH;
        void main() { vec3 t = texture2D(uTex, vUv).rgb; gl_FragColor = vec4(t * .85 * uFade * (1. - .85 * uMoon) * smoothstep(0., .3, vH), 1.); }`
    }));
    [stars, milky].forEach(o => { o.frustumCulled = false; o.userData.noCull = true; o.renderOrder = -1; parent.add(o); });
    // turn the sky for this moment: the temple's frame has +x east, +y up, +z south
    const tick = rend => {
      const L = celestial.lst == null ? 0 : celestial.lst + (Date.now() - celestial.at) * 7.292115e-8, phi = (celestial.lat || 0) * D2R;   // the sky turns once a sidereal day
      const sL = Math.sin(L), cL = Math.cos(L), sp = Math.sin(phi), cp = Math.cos(phi);
      uni.uSky.value.set(-sL, cL, 0, cp * cL, cp * sL, sp, sp * cL, sp * sL, -cp);
      const m = celestial.moon;
      uni.uMoon.value = m && m.up ? celestial.fraction * clamp(m.alt * 3, 0, 1) : 0;
      uni.uTime.value = performance.now() / 1000; uni.uPx.value = rend.getPixelRatio();
    };
    stars.onBeforeRender = tick;
    let base = 1;
    const show = () => { uni.uFade.value = base * SKYVIEW.clear; stars.visible = milky.visible = uni.uFade.value > .002; };
    stars.userData.show = show; SKY_LAYERS.push(show);
    return { fade(v) { base = v; show(); } };
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

