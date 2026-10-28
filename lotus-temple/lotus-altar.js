(() => {
"use strict";
const TAU = Math.PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = id => document.getElementById(id);

/* ---------- settings: change these to adjust the shrine ---------- */
const CONFIG = {
  storageKey: "lotus-altar-v2",                       // change to start every visitor from the sample altar
  start: "pagoda",                                    // where the page opens: "pagoda" (outside the gate) or a floor number
  light: { exposure: .82, key: 1.5, hemisphere: .3 },
  camera: {
    full: { pos: [0, 4.2, 7.0], target: [0, 1.4, .5] },   // a wide view of the whole shrine, the bench and the fortune sticks; orbits all the way round
    closeUp: { pos: [.75, 2.95, .75], target: [0, 2.45, -1.5] },
    corridor: { pos: [0, 1.65, 8.4], target: [0, 1.6, 9.6], fov: 65 },
    stairs: { pos: [-4.6, 1.65, -2.95], target: [-6.2, 1.75, -4.45] },   // standing inside the stair room at eye height, facing the spiral
    stairsTop: { pos: [-4.6, 1.65, -2.95], target: [-6.0, .2, -4.4] },   // on the top floor, looking down the flight that arrives there   // on the top floor, looking down the flight that arrives there   // inside the stair room, the spiral in view   // on the balcony corridor outside an upper hall, looking out
    pagoda: { pos: [0, 27, 94], target: [0, 6, 14] }
  },
  // the seven floors of the pagoda, ground floor first; `statue` floors get the Look closer button
  floors: [
    { han: "觀音殿", name: "Guanyin Main Hall", statue: "guanyin", hint: "Drag to walk around Guanyin's shrine. Tap the vase, water bowls, fruit plate, candle stands or censer to place an offering from your bag (buy them at the temple shop first), the wooden fish or bell to recite, or the red cylinder to draw a fortune stick." },
    { han: "千燈殿", name: "Hall of a Thousand Lamps", hint: "Three stepped towers of oil lamps and a wall of lit niches. Offerings are made in the main hall on the ground floor." },
    { han: "禪堂", name: "Meditation Hall", hint: "Rows of meditation cushions before the ensō scroll, with the wooden board that calls the hour." },
    { han: "藥師殿", name: "Medicine Buddha Hall", statue: "medicine", hint: "The Medicine Buddha, with lapis-blue curls and the medicine jar, before the seven lamps of healing." },
    { han: "茶室", name: "Tea and Calligraphy Room", hint: "A tea table set for guests, a calligraphy desk with brushes and ink, and ink-wash landscapes on the wall." },
    { han: "祈願殿", name: "Wishing Tree Hall", hint: "Tap the trunk to tie a red wish ribbon on the tree." },
    { han: "彌勒殿", name: "Maitreya Hall", statue: "maitreya", hint: "The laughing Maitreya at the top of the pagoda, with longevity peaches and gold ingots." }
  ],
  // buildings beside the pagoda
  places: {
    bell: { han: "鐘樓", name: "Bell Tower", hint: "Tap the great bronze bell to swing the striking log and ring it." },
    library: { han: "蓮華寺", name: "Lotus Temple hall", statue: "shakyamuni", hint: "The great hall of the temple: Shakyamuni Buddha on his lotus throne, with an offering table, candles and a censer before him." },
    shop: { han: "法物流通處", name: "Temple shop", hint: "Choose offerings in the panel and buy them here, then carry them to Guanyin's altar on the pagoda's ground floor. Tap the shelves to add things to your basket. The monks' quarters are upstairs." },
    quarters: { han: "寮房", name: "Monks' dining and rest room", hint: "Where the monks take their meal before noon and rest: low tables set with alms bowls, sleeping mats with folded robes." }
  },
  layout: { censerZ: 1.95, benchZ: 2.8, censerScale: 1.6 }, // distance in front of the statue (z) for censer and bench
  lanterns: { color: 0xb0180c, glow: 0xd0200a, glowStrength: .55 },
  // where the temple stands, for the real sun and moon; times are shown in Indochina Time (ICT, UTC+7)
  sky: { lat: 13.75, lon: 100.5, tz: "Asia/Bangkok", place: "Bangkok" },
  // the Halloween festival: on these nights ([month, day] on the temple's clock) the houses and village huts put their lights out
  // at outHour (9 pm ICT), a friendly ghost walks the roads until untilHour and walkers carry a torch; the street and lane lights
  // stay on. Add ?halloween=1 to the address to see it at any time, or ?halloween=0 to turn it off
  halloween: { from: [10, 27], to: [11, 1], outHour: 21, untilHour: 5 },
  // the weather outside follows the seasons of the northern Thai hills (no live weather service): rain from May to October,
  // cool clear days and misty mornings from November to February, smoky haze from the field burning in March and April.
  // Each `spell` of hours on the temple's clock gets one kind, from that month's odds [clear, cloudy, rain, mist, haze];
  // add ?weather=rain (or clear, cloudy, mist, haze) to the address to force one
  weather: { spell: 3, odds: [[5, 2, 0, 3, 2], [4, 1, 0, 2, 4], [2, 1, .5, 0, 6], [2, 2, 1.5, 0, 5], [2, 3, 4, 0, 1], [1, 4, 5, .5, 0],
                              [1, 4, 5, .5, 0], [1, 4, 6, .5, 0], [1, 4, 6, .5, 0], [3, 3, 3, 1, 0], [5, 2, .5, 2, 0], [5, 2, 0, 3, .5]] },
  // the sounds outside: wind, water, birds and insects, the stupas' hti bells, the temple bell and gong (all made in WebAudio)
  ambience: { volume: .8, bellEvery: [50, 90], gongEvery: [35, 70] },   // seconds between strokes of the temple bell and gong
  chant: { rounds: 3, beat: .55 },                    // seconds per syllable
  sculpt: { worker: "statue-sculpt.js", bodyCell: .012, headCell: .0058,  // smaller cells: smoother, slower to build and to draw
            cells: { lion: [.022, .014], lionL: [.022, .014] } },        // [body, head] per figure: the stone lions outside need far less detail than a face
  scan: { file: "guanyin.glb", height: 2.55, turn: 0 }, // museum scan; turn is radians about y if it faces away
  // outdoor haze [near, far] in metres: things fade into it and are not drawn at all past `far`
  fog: { outside: [70, 230], walk: [30, 170], corridor: [70, 260] },
  // selective rendering outside: skip whatever is behind the camera, past the fog or smaller than minPixels on screen
  cull: { enabled: true, minPixels: 2 }
};
/* Prices, names and kinds of each offering live in ITEMS below. */

/* ---------- catalogue ---------- */
const ITEMS = {
  flower: {
    name: "Flowers", han: "花", term: "puppha", desc: "A fresh stem set in the altar vase. Flowers fade, a reminder of impermanence.",
    kinds: { lotus: { name: "Lotus", price: 3, dot: "#f0a2b4" }, rose: { name: "Rose", price: 2, dot: "#c41f3a" }, jasmine: { name: "Jasmine", price: 2, dot: "#fbfaf2" } },
    per: "stem", phrase: (q, k) => `${q} ${k.toLowerCase()} ${q === 1 ? "stem" : "stems"}`,
    icon: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 6c3 3.5 3.5 8 0 13-3.5-5-3-9.5 0-13z" fill="#e88aa0"/><path d="M6 13c4.5.5 8 3.5 10 8.5C11 21 7.5 18 6 13zM26 13c-4.5.5-8 3.5-10 8.5 5-.5 8.5-3.5 10-8.5z" fill="#d46f88"/><path d="M5 23c4 2.5 18 2.5 22 0" stroke="#dcb65e" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>'
  },
  water: {
    name: "Water", han: "水", term: "udaka", desc: "Fills one of the seven offering bowls before Guanyin. A new kind replaces the oldest bowl.",
    kinds: { pure: { name: "Pure water", price: 1, dot: "#a8dcef" }, tea: { name: "Tea", price: 2, dot: "#a8642a" }, saffron: { name: "Saffron water", price: 2, dot: "#f2a41c" } },
    per: "bowl", phrase: (q, k) => `${q} ${q === 1 ? "bowl" : "bowls"} of ${k.toLowerCase()}`,
    icon: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 5c4 5.5 7 9.5 7 13a7 7 0 01-14 0c0-3.5 3-7.5 7-13z" fill="#8fcbe0"/><path d="M5 25h22l-2.5 3h-17z" fill="#dcb65e"/></svg>'
  },
  fruit: {
    name: "Seasonal fruit", han: "果", term: "phala", desc: "Mango, orange, apple or lime for the offering plate, shared with the community afterwards.",
    kinds: { mixed: { name: "Seasonal", price: 5, dot: "#e8912d" } },
    per: "each", phrase: q => `${q} fruit`,
    icon: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="12" cy="19" r="7" fill="#e8912d"/><circle cx="21" cy="18" r="6.5" fill="#c8402e"/><path d="M20 11c1-3 4-4 6-3.5-1 2.5-3.5 4-6 3.5z" fill="#7fae3e"/><path d="M5 26h22" stroke="#dcb65e" stroke-width="1.8" stroke-linecap="round"/></svg>'
  },
  candle: {
    name: "Candles", han: "燈", term: "dīpa", desc: "Lit on the stepped candle stands beside the censer, lotus lamps on the lowest step. Light stands for wisdom clearing away ignorance.",
    kinds: { red: { name: "Red candle", price: 2, dot: "#c0201a" }, white: { name: "White candle", price: 2, dot: "#f2e8d6" }, lamp: { name: "Lotus lamp", price: 4, dot: "#f0a2b4" } },
    per: "each", phrase: (q, k) => `${q} ${k.toLowerCase()}${q === 1 ? "" : "s"}`,
    icon: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3c2.6 3 3 5.2 0 8-3-2.8-2.6-5 0-8z" fill="#ffcf6e"/><rect x="12" y="12" width="8" height="13" rx="1.5" fill="#c0201a"/><path d="M7 27h18" stroke="#dcb65e" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  incense: {
    name: "Incense", han: "香", term: "gandha", desc: "Three sticks in the great bronze censer before the altar, for the Buddha, the Dharma and the Sangha.",
    kinds: { sandal: { name: "Sandalwood", price: 1, dot: "#b2683a" }, agar: { name: "Agarwood", price: 3, dot: "#4a3020" }, jasmine: { name: "Jasmine", price: 2, dot: "#e7d39a" } },
    per: "set of 3", phrase: (q, k) => `${q} ${q === 1 ? "set" : "sets"} of ${k.toLowerCase()} incense`,
    icon: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 4c-2 3 2 4 0 7M16 3c-2 3 2 4 0 7M20 4c-2 3 2 4 0 7" stroke="#c9b6a6" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M12 12v9M16 11v10M20 12v9" stroke="#b2683a" stroke-width="1.6"/><path d="M6 20h20l-2 6H8z" fill="#9a7436"/><path d="M9 26l-1 3M23 26l1 3M16 26v3" stroke="#9a7436" stroke-width="1.6"/></svg>'
  }
};
const KEYS = Object.keys(ITEMS);
const kindOf = (key, k) => ITEMS[key].kinds[k];

/* ---------- store ---------- */
const KEY = CONFIG.storageKey;
const defaults = () => ({
  counts: { flower: 3, water: 3, fruit: 4, candle: 4, incense: 1 },
  altar: {
    flowers: { 5: "lotus", 4: "rose", 6: "jasmine" },
    bowls: { 0: "pure", 1: "pure", 2: "tea" },
    fruit: { 0: 0, 1: 1, 2: 2, 3: 3 },
    candles: { c0: "red", c1: "red", l0: "lamp", l1: "lamp" },
    incense: { 0: "sandal" }
  },
  log: []
});
let state = defaults();
try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.counts && s.altar) state = s; } catch (e) {}
if (typeof state.recitations !== "number") state.recitations = 0;
if (!state.bag) state.bag = {};   // offerings bought at the shop and not yet placed: bag[item][kind] = count
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
const cart = { flower: { q: 0, k: "lotus" }, water: { q: 0, k: "pure" }, fruit: { q: 0, k: "mixed" }, candle: { q: 0, k: "red" }, incense: { q: 0, k: "sandal" } };

/* ---------- renderer ---------- */
const canvas = $("scene");
const stage = $("stage");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = CONFIG.light.exposure;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const world = new THREE.Scene();                  // the whole pagoda: one group per floor plus the outside view
world.background = new THREE.Color(0x120a07);
world.fog = new THREE.Fog(0x120a07, 13, 28);
const scene = new THREE.Group(); scene.name = "floor1";  // floor 1, Guanyin's main hall
world.add(scene);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
camera.position.set(...CONFIG.camera.full.pos);
const controls = new THREE.OrbitControls(camera, canvas);
controls.target.set(...CONFIG.camera.full.target);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = .9; controls.maxDistance = 7.6;   // the camera is also held inside the walls, see keepInside()
controls.minPolarAngle = 0.7; controls.maxPolarAngle = 1.5;
controls.minAzimuthAngle = -Infinity; controls.maxAzimuthAngle = Infinity;

/* ---------- textures ---------- */
function canvasTex(size, draw) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
const glowTex = canvasTex(128, (g, s) => {
  const r = g.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.25, "rgba(255,240,210,.6)"); r.addColorStop(1, "rgba(255,200,120,0)");
  g.fillStyle = r; g.fillRect(0, 0, s, s);
});
const aureoleTex = canvasTex(512, (g, s) => {
  const c = s / 2;
  g.save(); g.translate(c, c);
  for (let i = 0; i < 48; i++) {
    g.rotate(TAU / 48);
    const grad = g.createLinearGradient(0, 0, 0, -c);
    grad.addColorStop(0, "rgba(255,255,255,.0)"); grad.addColorStop(.35, "rgba(235,242,255,.24)"); grad.addColorStop(1, "rgba(210,225,255,0)");
    g.fillStyle = grad; g.beginPath(); g.moveTo(-3, 0); g.lineTo(-(i % 2 ? 7 : 14), -c); g.lineTo((i % 2 ? 7 : 14), -c); g.lineTo(3, 0); g.fill();
  }
  g.restore();
  const r = g.createRadialGradient(c, c, 0, c, c, c);
  r.addColorStop(0, "rgba(255,255,255,.85)"); r.addColorStop(.4, "rgba(220,232,255,.38)"); r.addColorStop(1, "rgba(190,210,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, s, s);
});
const floorTex = canvasTex(256, (g, s) => {
  g.fillStyle = "#3a2419"; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const v = 40 + Math.random() * 14;
    g.fillStyle = `rgb(${v+18},${v},${v-10})`; g.fillRect(i*64+2, j*64+2, 60, 60);
  }
});
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(14, 14);

/* environment map so metal and glaze catch light */
(() => {
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  const sky = canvasTex(64, (g, s) => {
    const l = g.createLinearGradient(0, 0, 0, s);
    l.addColorStop(0, "#ffe2b0"); l.addColorStop(.45, "#a5602a"); l.addColorStop(.6, "#3a1a0c"); l.addColorStop(1, "#120804");
    g.fillStyle = l; g.fillRect(0, 0, s, s);
  });
  env.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide })));
  [[4, 5, 3], [-5, 3, 2], [0, 4, -5]].forEach(([x, y, z], i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), new THREE.MeshBasicMaterial({ color: i === 2 ? 0xff9a40 : 0xfff0d0, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  });
  world.environment = pm.fromScene(env, 0.04).texture;
})();

/* ---------- materials ---------- */
const std = o => new THREE.MeshStandardMaterial(o);
const M = {
  gold: std({ color: 0xd8a640, metalness: .92, roughness: .3 }),
  // white porcelain, after Dehua blanc de Chine figures of Guanyin
  skin: new THREE.MeshPhysicalMaterial({ color: 0xf7f2ea, roughness: .3, clearcoat: 1, clearcoatRoughness: .2 }),
  robe: new THREE.MeshPhysicalMaterial({ color: 0xf1ece3, roughness: .42, clearcoat: .7, clearcoatRoughness: .3 }),
  veil: new THREE.MeshPhysicalMaterial({ color: 0xf4f0e8, roughness: .45, clearcoat: .6, clearcoatRoughness: .3, side: THREE.DoubleSide }),
  hair: new THREE.MeshPhysicalMaterial({ color: 0xe6ddd0, roughness: .5, clearcoat: .5 }),
  feature: std({ color: 0x8c7b6c, roughness: .5 }),
  petal: new THREE.MeshPhysicalMaterial({ color: 0xf6d9de, roughness: .4, clearcoat: .6 }),
  pearl: std({ color: 0xf4f6fb, metalness: .45, roughness: .18, emissive: 0x3c4250 }),
  brass: std({ color: 0xb8893a, metalness: .85, roughness: .35 }),
  bronze: std({ color: 0x6e5128, metalness: .8, roughness: .45 }),
  ash: std({ color: 0x9d958b, roughness: 1 }),
  lacquer: std({ color: 0x7a1c12, metalness: .1, roughness: .45 }),
  lacquerIn: std({ color: 0xa3241a, roughness: .4, side: THREE.DoubleSide }),
  wall: std({ color: 0x3a130d, roughness: .9 }),
  floor: std({ map: floorTex, roughness: .85 }),
  stone: std({ color: 0x45322a, roughness: .85 }),
  cloth: std({ color: 0x8e1f1a, roughness: .75 }),
  trim: std({ color: 0xd6a94a, metalness: .7, roughness: .4 }),
  wax: std({ color: 0xf2e2c4, roughness: .6 }),
  waxRed: std({ color: 0xb81d16, roughness: .45 }),
  lotus: std({ color: 0xf0a2b4, roughness: .55, emissive: 0x3a0e18 }),
  lotusIn: std({ color: 0xfbd6de, roughness: .55, emissive: 0x2a0c12 }),
  rose: std({ color: 0xb3122c, roughness: .5, emissive: 0x2a0008 }),
  roseIn: std({ color: 0x8a0a20, roughness: .5, emissive: 0x200006 }),
  jasmine: std({ color: 0xfbfaf2, roughness: .5, emissive: 0x2a2a24 }),
  bud: std({ color: 0xf0e6d0, roughness: .5 }),
  stem: std({ color: 0x4f7a2a, roughness: .8 }),
  leaf: std({ color: 0x6f9e33, roughness: .7 }),
  pollen: std({ color: 0xf6d04a, roughness: .6, emissive: 0x3a2a00 }),
  muyu: std({ color: 0x8a2a14, metalness: .1, roughness: .32 }),
  cushion: std({ color: 0xd9a520, roughness: .85 }),
  wood: std({ color: 0x6a4424, roughness: .6 }),
  bamboo: std({ color: 0xdcc088, roughness: .6 }),
  stickRed: std({ color: 0xb3261e, roughness: .5 }),
  flame: new THREE.MeshBasicMaterial({ color: 0xffd27a })
};
const WATER = {
  pure: std({ color: 0xa8dcef, metalness: .1, roughness: .04, transparent: true, opacity: .85, emissive: 0x153a48 }),
  tea: std({ color: 0x9a5a1e, metalness: .1, roughness: .05, transparent: true, opacity: .92, emissive: 0x2a1004 }),
  saffron: std({ color: 0xf2a41c, metalness: .1, roughness: .05, transparent: true, opacity: .9, emissive: 0x3a2000 })
};
const INCENSE_COAT = { sandal: std({ color: 0xa8603a, roughness: .9 }), agar: std({ color: 0x3e2a1e, roughness: .9 }), jasmine: std({ color: 0xd8c48a, roughness: .9 }) };
const FRUIT_MATS = [
  std({ color: 0xf0881c, roughness: .55 }),
  std({ color: 0xc0261c, roughness: .35 }),
  std({ color: 0xf2c030, roughness: .45 }),
  std({ color: 0x8ab83a, roughness: .5 })
];

[M.floor, M.wall, M.stone, M.cloth, M.lacquer, M.lacquerIn, M.wax, M.waxRed, M.ash].forEach(m => m.envMapIntensity = .25);
function mesh(geo, mat, x = 0, y = 0, z = 0, parent = scene) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function lathe(pts, mat, seg = 40) {
  return new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), mat);
}
const glowSprite = (color, scale, opacity = 1) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.setScalar(scale); return s;
};
const petalGeo = new THREE.SphereGeometry(1, 16, 10);

/* ---------- hall ---------- */
const floor = mesh(new THREE.CircleGeometry(40, 64), M.floor); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
const wall = mesh(new THREE.PlaneGeometry(30, 12), M.wall, 0, 6, -5.5); wall.castShadow = false;
// the eight columns, the statue's pedestal and the stair room come from temple-floors.js (temple.dress below)
// ceiling of red lanterns
const ceil = mesh(new THREE.PlaneGeometry(16, 15.4), M.wall, 0, 6.9, 0); ceil.rotation.x = Math.PI / 2; ceil.castShadow = false;
[-2.6, -.4, 1.8, 4].forEach(z => mesh(new THREE.BoxGeometry(12, .22, .26), M.lacquer, 0, 6.75, z));
const lanterns = [];
const lanternGeo = new THREE.SphereGeometry(.26, 24, 16), capGeo = new THREE.CylinderGeometry(.12, .12, .06, 16);
const ribGeo = new THREE.TorusGeometry(.262, .006, 6, 40), tasselGeo = new THREE.CylinderGeometry(.012, .03, .22, 8);
const lanternMat = std({ color: CONFIG.lanterns.color, emissive: CONFIG.lanterns.glow, emissiveIntensity: CONFIG.lanterns.glowStrength, roughness: .55 });
[[-2.6, [-3.4, -1.7, 1.7, 3.4]], [-.4, [-3.6, -1.8, 0, 1.8, 3.6]], [1.8, [-3.6, -1.8, 0, 1.8, 3.6]], [4, [-3.6, -1.8, 0, 1.8, 3.6]]].forEach(([z, xs], row) => {
  xs.forEach((x, i) => {
    const y = 4.35 + ((i + row) % 2) * .3;
    const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    mesh(new THREE.CylinderGeometry(.005, .005, 6.9 - y, 4), M.feature, 0, (6.9 - y) / 2, 0, g);
    const body = mesh(lanternGeo, lanternMat, 0, 0, 0, g); body.scale.y = 1.2; body.castShadow = false;
    [0, Math.PI / 3, -Math.PI / 3].forEach(r => { const rb = mesh(ribGeo, M.trim, 0, 0, 0, g); rb.rotation.y = r; rb.scale.y = 1.2; rb.castShadow = false; });
    mesh(capGeo, M.trim, 0, .32, 0, g).castShadow = false;
    mesh(capGeo, M.trim, 0, -.32, 0, g).castShadow = false;
    mesh(tasselGeo, M.stickRed, 0, -.46, 0, g).castShadow = false;
    g.add(glowSprite(0xff7a3c, 1.4, .45));
    lanterns.push(g);
  });
});

/* ---------- Guanyin ---------- */
const buddha = new THREE.Group(); buddha.position.set(0, .4, -1.7); scene.add(buddha);
mesh(new THREE.CylinderGeometry(1.05, 1.25, .3, 48), M.gold, 0, .15, 0, buddha);
mesh(new THREE.TorusGeometry(1.15, .04, 8, 64), M.trim, 0, .3, 0, buddha).rotation.x = Math.PI / 2;
[[18, 1.08, .42, .55, 0], [18, .9, .5, .25, TAU / 36]].forEach(([n, r, y, tilt, off]) => {
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + off;
    const p = mesh(petalGeo, M.petal, Math.sin(a) * r, y, Math.cos(a) * r, buddha);
    p.scale.set(.2, .2, .07); p.rotation.order = "YXZ"; p.rotation.y = a; p.rotation.x = -tilt;
  }
});
// Guanyin herself is sculpted as one smooth surface (signed distance field, see guanyin-sculpt.js) and meshed off the main thread
const extras = new THREE.Group(); buddha.add(extras);  // parts that belong to the sculpted figure only
// the pure-water vase (淨瓶) with a willow sprig, held in the lap
const jing = lathe([[0, 0], [.045, 0], [.065, .05], [.055, .11], [.02, .15], [.016, .21], [.028, .23], [0, .23]], M.robe, 24);
jing.position.set(0, 1.0, .53); jing.castShadow = true; extras.add(jing);
mesh(new THREE.TorusGeometry(.058, .007, 6, 24), M.gold, 0, 1.08, .53, extras).rotation.x = Math.PI / 2;
[[-.35, .25], [.1, .1], [.45, -.15]].forEach(([rz, rx]) => {
  const g = new THREE.CylinderGeometry(.003, .004, .24, 5); g.translate(0, .12, 0);
  const w = mesh(g, M.stem, 0, 1.22, .53, extras); w.rotation.set(rx, 0, rz);
  [.08, .14, .2].forEach((y, i) => {
    const l = new THREE.Mesh(petalGeo, M.leaf); l.scale.set(.006, .028, .003);
    l.position.set(i % 2 ? .01 : -.01, y, 0); l.rotation.z = i % 2 ? -.6 : .6; w.add(l);
  });
});
/* Statues are sculpted as smooth surfaces (signed distance fields, see statue-sculpt.js) and meshed off the main thread:
   a coarse pass for the body and a fine one for the head, where the face needs the detail. */
const FIGURE_BOXES = {
  guanyin: { body: { min: [-1.15, .48, -.62], max: [1.15, 2.1, .95] }, head: { min: [-.6, 1.98, -.58], max: [.6, 2.98, .5] } },
  medicine: { body: { min: [-1.2, .48, -.62], max: [1.2, 2.1, .95] }, head: { min: [-.45, 1.98, -.45], max: [.45, 2.86, .45] } },
  shakyamuni: { body: { min: [-1.2, .48, -.62], max: [1.2, 2.1, .95] }, head: { min: [-.45, 1.98, -.45], max: [.45, 2.86, .45] } },
  maitreya: { body: { min: [-1.5, .48, -.62], max: [1.15, 2.1, 1.1] }, head: { min: [-.5, 1.7, -.45], max: [.5, 2.5, .5] } },
  lion: { body: { min: [-.9, -.02, -1.2], max: [.9, 1.75, 1.15] }, head: { min: [-.66, 1.5, -.45], max: [.66, 2.56, 1.0] } },
  lionL: { body: { min: [-.9, -.02, -1.2], max: [.9, 1.75, 1.15] }, head: { min: [-.66, 1.5, -.45], max: [.66, 2.56, 1.0] } }
};
const porcelain = new THREE.MeshPhysicalMaterial({ color: 0xf8f3eb, roughness: .3, clearcoat: .85, clearcoatRoughness: .22, vertexColors: true });
const gilt = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: .55, roughness: .32, clearcoat: .35, clearcoatRoughness: .3, vertexColors: true });
const behind = m => { const c = m.clone(); c.polygonOffset = true; c.polygonOffsetFactor = 1; c.polygonOffsetUnits = 1; return c; };
const stone = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .85, vertexColors: true });
const STATUE_MATS = { guanyin: [behind(porcelain), porcelain], medicine: [behind(gilt), gilt], shakyamuni: [behind(gilt), gilt], maitreya: [behind(gilt), gilt], lion: [behind(stone), stone], lionL: [behind(stone), stone] };
const preparing = new Map();   // label → statues still being built
function setPreparing() {
  const s = $("sculptStatus"); s.hidden = !preparing.size;
  const names = [...preparing.keys()];
  if (names.length) s.textContent = `Preparing ${names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names[names.length - 1] : names[0]}…`;
}
const unprepare = label => { const n = (preparing.get(label) || 1) - 1; if (n > 0) preparing.set(label, n); else preparing.delete(label); };
function sculptFigure(figure, parent, label, onDone) {
  const box = FIGURE_BOXES[figure];
  const [bodyCell, headCell] = CONFIG.sculpt.cells[figure] || [CONFIG.sculpt.bodyCell, CONFIG.sculpt.headCell];
  const jobs = [{ figure, ...box.body, cell: bodyCell }, { figure, ...box.head, cell: headCell }];
  const done = jobs.map(() => false);
  preparing.set(label, (preparing.get(label) || 0) + 1); setPreparing();
  const add = r => {
    if (done[r.i]) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(r.pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(r.nor, 3));
    g.setAttribute("color", new THREE.BufferAttribute(r.col, 3));
    g.setIndex(new THREE.BufferAttribute(r.idx, 1));
    const m = new THREE.Mesh(g, STATUE_MATS[figure][r.i]);
    m.castShadow = true; m.receiveShadow = true; parent.add(m);
    done[r.i] = true;
    if (done.every(Boolean)) { unprepare(label); setPreparing(); if (onDone) onDone(); }
  };
  // without workers, fetch the same file and build on the main thread
  const onMain = () => fetch(CONFIG.sculpt.worker).then(r => r.text()).then(src => {
    const build = new Function(src + "\nreturn build;")();
    setTimeout(() => jobs.forEach((j, i) => { if (!done[i]) add({ i, ...build(j) }); }), 60);
  }).catch(() => { unprepare(label); $("sculptStatus").hidden = false; $("sculptStatus").textContent = `${label} could not be prepared. Reload the page to try again.`; });
  try {
    const w = new Worker(CONFIG.sculpt.worker);
    w.onmessage = e => add(e.data);
    w.onerror = e => { if (e.preventDefault) e.preventDefault(); onMain(); };
    w.postMessage({ jobs });
  } catch (e) { onMain(); }
}
/* Guanyin: the Minneapolis Institute of Art's CC0 scan of a seated Guanyin (guanyin.glb, published beside this page)
   when it is present, otherwise the sculpted porcelain figure. */
const SCAN = CONFIG.scan;
(function loadScan() {
  const sculpt = () => sculptFigure("guanyin", buddha, "Guanyin", () => { glowBoost = 1.6; sparkle(V(0, 2.9, -1.3), 0xffffff); });
  if (!THREE.GLTFLoader) { sculpt(); return; }
  new THREE.GLTFLoader().load(SCAN.file, gltf => {
    const model = gltf.scene;
    model.rotation.y = SCAN.turn;
    model.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true;
      [].concat(o.material).forEach(m => { m.envMapIntensity = .5; if (m.map) m.map.anisotropy = renderer.capabilities.getMaxAnisotropy(); });
    });
    // scale to the throne and set it down on the lotus
    let box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.scale.setScalar(SCAN.height / size.y);
    box = new THREE.Box3().setFromObject(model);
    const c = box.getCenter(new THREE.Vector3());
    model.position.set(-c.x, .5 - box.min.y, -c.z + .05);
    buddha.remove(extras);
    buddha.add(model);
    $("scanCredit").hidden = false;
    glowBoost = 1.6; sparkle(V(0, 2.9, -1.3), 0xffffff);
  }, undefined, sculpt);
})();
const aureole = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), new THREE.MeshBasicMaterial({ map: aureoleTex, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false }));
aureole.position.set(0, 2.2, -.75); buddha.add(aureole);
mesh(new THREE.TorusGeometry(.74, .025, 8, 72), M.pearl, 0, 2.45, -.45, buddha);
mesh(new THREE.TorusGeometry(1.8, .035, 8, 96), M.pearl, 0, 1.8, -.6, buddha);
const headGlow = glowSprite(0xffffff, 2.6, .4); headGlow.position.set(0, 2.45, -.52); buddha.add(headGlow);

/* ---------- altar ---------- */
const ALT = { y: 1.1, z: .75 };
mesh(new THREE.BoxGeometry(3.1, ALT.y - .04, .95), M.lacquer, 0, (ALT.y - .04) / 2, ALT.z);
mesh(new THREE.BoxGeometry(3.2, .04, 1.05), M.cloth, 0, ALT.y - .02, ALT.z);
mesh(new THREE.BoxGeometry(1.6, .5, .02), M.cloth, 0, .82, ALT.z + .53);
mesh(new THREE.BoxGeometry(1.6, .04, .025), M.trim, 0, .58, ALT.z + .54);
mesh(new THREE.BoxGeometry(3.2, .03, .02), M.trim, 0, ALT.y - .04, ALT.z + .53);
const clickables = [];
const clickable = (m, item) => { m.userData.item = item; clickables.push(m); return m; };

// vase
const vase = lathe([[0, 0], [.1, 0], [.11, .04], [.15, .14], [.13, .24], [.06, .3], [.07, .36], [0, .36]], M.brass);
vase.position.set(-1.02, ALT.y, ALT.z - .12); vase.castShadow = true; scene.add(vase); clickable(vase, "flower");
const MOUTH = V(-1.02, ALT.y + .35, ALT.z - .12);

// seven water bowls
const bowls = [];
for (let i = 0; i < 7; i++) {
  const x = -.54 + i * .18, z = ALT.z + .3;
  const b = lathe([[0, 0], [.04, 0], [.045, .01], [.07, .04], [.078, .065], [.072, .065], [.064, .04], [0, .015]], M.brass, 28);
  b.position.set(x, ALT.y, z); b.castShadow = true; scene.add(b); clickable(b, "water");
  const w = new THREE.Mesh(new THREE.CircleGeometry(1, 28), WATER.pure); w.rotation.x = -Math.PI / 2; w.visible = false; scene.add(w);
  bowls.push({ x, z, w, level: 0, kind: null });
}
function setBowl(b, level, kind) {
  b.level = level; b.kind = kind; b.w.material = WATER[kind] || WATER.pure; b.w.visible = level > .01;
  b.w.position.set(b.x, ALT.y + .016 + .046 * level, b.z);
  b.w.scale.setScalar(.04 + .028 * level);
}

// fruit plate
const PLATE = V(1.02, ALT.y, ALT.z - .12);
mesh(new THREE.CylinderGeometry(.06, .09, .1, 24), M.brass, PLATE.x, PLATE.y + .05, PLATE.z);
const plate = lathe([[0, 0], [.26, 0], [.32, .03], [.31, .035], [.25, .012], [0, .012]], M.brass, 40);
plate.position.set(PLATE.x, PLATE.y + .1, PLATE.z); plate.castShadow = true; scene.add(plate); clickable(plate, "fruit");
const FR = .07, PY = PLATE.y + .112 + FR;
const fruitSlots = [V(0, 0, 0)];
for (let i = 0; i < 6; i++) fruitSlots.push(V(Math.sin(i / 6 * TAU) * .16, 0, Math.cos(i / 6 * TAU) * .16));
for (let i = 0; i < 3; i++) fruitSlots.push(V(Math.sin(i / 3 * TAU + .5) * .09, .11, Math.cos(i / 3 * TAU + .5) * .09));
fruitSlots.push(V(0, .2, 0));
fruitSlots.forEach(p => p.add(V(PLATE.x, PY, PLATE.z)));

// flames: shared flicker list
const flames = [];
function makeFlame(pos, size = 1, light = null, parent = scene) {
  const f = new THREE.Mesh(new THREE.SphereGeometry(.016 * size, 12, 8), M.flame);
  f.position.copy(pos); parent.add(f);
  const g = glowSprite(0xff9a40, .35 * size, .9); g.position.copy(pos); parent.add(g);
  const fl = { flame: f, g, light, seed: Math.random() * 10, on: 1, size };
  flames.push(fl); return fl;
}

// the temple's own tall altar candles, back corners
const ALTAR_FLAMES = [];
[-1.45, 1.45].forEach(x => {
  const z = ALT.z - .34;
  mesh(new THREE.CylinderGeometry(.07, .09, .03, 20), M.brass, x, ALT.y + .015, z);
  mesh(new THREE.CylinderGeometry(.012, .018, .08, 10), M.brass, x, ALT.y + .07, z);
  const c = mesh(new THREE.CylinderGeometry(.045, .045, .3, 20), M.waxRed, x, ALT.y + .26, z); clickable(c, "candle");
  const light = new THREE.PointLight(0xff9a3c, 1.1, 6, 2); light.position.set(x, ALT.y + .48, z); scene.add(light);
  ALTAR_FLAMES.push(makeFlame(V(x, ALT.y + .44, z), 1.4, light));
});

// in front of the altar, from the statue outwards: offering table, censer with candle stands, worship bench
const PLAT = 0, INC_Z = CONFIG.layout.censerZ, BENCH_Z = CONFIG.layout.benchZ;

// two square candle stands beside the censer, stepped like a small altar:
// lotus lamps on the lowest step, red and white candles on the step above, a pillar candle on top
const STAND_FLAMES = [], LAMP_SLOTS = [], CANDLE_SLOTS = [];
const STAND_X = 1.05;
const STEPS = [{ half: .33, top: PLAT + .18 }, { half: .23, top: PLAT + .34 }, { half: .12, top: PLAT + .5 }];
// points around a square of half-size o, `per` to a side, going round
const squareRing = (o, per) => {
  const pts = [];
  for (let i = 0; i < per; i++) { const t = -o + 2 * o * i / per; pts.push([t, o], [o, -t], [-t, -o], [-o, t]); }
  return pts;
};
[-1, 1].forEach(s => {
  const x = s * STAND_X;
  STEPS.forEach((st, i) => {
    const bottom = i ? STEPS[i - 1].top : PLAT, h = st.top - bottom, w = st.half * 2;
    clickable(mesh(new THREE.BoxGeometry(w, h, w), M.lacquer, x, bottom + h / 2, INC_Z), "candle");
    mesh(new THREE.BoxGeometry(w + .012, .018, w + .012), M.trim, x, st.top - .03, INC_Z);
  });
  const top = STEPS[2].top;
  mesh(new THREE.CylinderGeometry(.04, .04, .32, 20), M.waxRed, x, top + .16, INC_Z);
  const light = new THREE.PointLight(0xff9a3c, .9, 5, 2); light.position.set(x, top + .42, INC_Z); scene.add(light);
  STAND_FLAMES.push(makeFlame(V(x, top + .37, INC_Z), 1.3, light));
  squareRing(.28, 3).forEach(([dx, dz]) => LAMP_SLOTS.push({ p: V(x + dx, STEPS[0].top, INC_Z + dz), dx, dz }));
  squareRing(.175, 2).forEach(([dx, dz]) => CANDLE_SLOTS.push({ p: V(x + dx, STEPS[1].top, INC_Z + dz), dx, dz }));
});
// fill the front of both stands first, working outwards and backwards
[LAMP_SLOTS, CANDLE_SLOTS].forEach(list => list.sort((a, b) => (b.dz - a.dz) || (Math.abs(a.dx) - Math.abs(b.dx)) || (a.p.x - b.p.x)));
const candleObjs = {};
const candleSlot = key => (key[0] === "l" ? LAMP_SLOTS : CANDLE_SLOTS)[+key.slice(1)];
function makeCandle(kind) {
  const g = new THREE.Group(); let top;
  if (kind === "lamp") {
    mesh(new THREE.CylinderGeometry(.03, .024, .026, 18), M.brass, 0, .013, 0, g);
    mesh(new THREE.CylinderGeometry(.027, .027, .004, 18), M.wax, 0, .026, 0, g);
    for (let i = 0; i < 8; i++) {
      const piv = new THREE.Group(); piv.rotation.y = i / 8 * TAU; g.add(piv);
      const p = new THREE.Mesh(petalGeo, i % 2 ? M.lotusIn : M.lotus); p.scale.set(.016, .03, .007);
      const h = new THREE.Group(); h.position.set(0, .01, .03); h.rotation.x = .55; h.add(p); p.position.y = .025; piv.add(h);
    }
    top = .045;
  } else {
    mesh(new THREE.CylinderGeometry(.038, .042, .012, 18), M.brass, 0, .006, 0, g);
    mesh(new THREE.CylinderGeometry(.022, .022, .14, 16), kind === "red" ? M.waxRed : M.wax, 0, .082, 0, g);
    if (kind === "red") { const t = mesh(new THREE.CylinderGeometry(.0225, .0225, .012, 16), M.trim, 0, .12, 0, g); }
    top = .17;
  }
  mesh(new THREE.CylinderGeometry(.0015, .0015, .015, 4), M.feature, 0, top - .006, 0, g);
  g.userData.top = top;
  return g;
}
function addCandle(n, kind, animated, delay = 0) {
  const alt = state.altar; alt.next = alt.next || {};
  const tier = kind === "lamp" ? "l" : "c", list = tier === "l" ? LAMP_SLOTS : CANDLE_SLOTS;
  const i = (alt.next[tier] || 0) % list.length; alt.next[tier] = i + 1;
  placeCandle(tier + i, kind, animated, delay);
}
function placeCandle(key, kind, animated, delay = 0) {
  const slot = candleSlot(key); if (!slot) return;
  state.altar.candles[key] = kind;
  const g = makeCandle(kind), at0 = slot.p, x = at0.x;
  g.position.copy(at0);
  const wick = V(x, at0.y + g.userData.top + .015, at0.z);
  const replace = () => { const o = candleObjs[key]; if (o) { scene.remove(o.g, o.fl.flame, o.fl.g); flames.splice(flames.indexOf(o.fl), 1); } };
  if (!animated) { replace(); scene.add(g); const fl = makeFlame(wick, kind === "lamp" ? .8 : 1); candleObjs[key] = { g, fl }; return; }
  const src = STAND_FLAMES[x < 0 ? 0 : 1].flame.position;
  let spark, fl;
  tween(1.5, t => {
    if (!g.parent) { replace(); scene.add(g); }
    g.scale.set(1, Math.max(.001, easeOut(clamp(t / .3, 0, 1))), 1);
    if (t > .3 && t < .75) {
      if (!spark) { spark = glowSprite(0xffc060, .12, 1); scene.add(spark); }
      const e = easeInOut((t - .3) / .45);
      spark.position.lerpVectors(src, wick, e); spark.position.y += Math.sin(Math.PI * e) * .15;
    }
    if (t >= .75) {
      if (spark) { scene.remove(spark); spark = null; }
      if (!fl) { fl = makeFlame(wick, kind === "lamp" ? .8 : 1); candleObjs[key] = { g, fl }; }
      fl.on = easeOut((t - .75) / .25);
    }
  }, () => sparkle(wick, 0xffc060), delay);
}

// large bronze tripod censer (香爐) on a stone pedestal in front of the table
const CS = CONFIG.layout.censerScale;
const INCENSE = V(0, PLAT + .36, INC_Z);
mesh(new THREE.CylinderGeometry(.3, .36, .28, 8), M.stone, 0, PLAT + .14, INC_Z);
mesh(new THREE.CylinderGeometry(.36, .36, .06, 8), M.lacquer, 0, PLAT + .31, INC_Z);
mesh(new THREE.CylinderGeometry(.38, .38, .02, 8), M.trim, 0, PLAT + .35, INC_Z);
const censer = new THREE.Group(); censer.position.copy(INCENSE); censer.scale.setScalar(CS); scene.add(censer);
for (let i = 0; i < 3; i++) {
  const a = i / 3 * TAU + Math.PI / 3;
  const leg = mesh(new THREE.CylinderGeometry(.018, .012, .08, 10), M.bronze, Math.sin(a) * .1, .04, Math.cos(a) * .1, censer);
  leg.rotation.set(Math.cos(a) * .2, 0, -Math.sin(a) * .2);
}
// the bowl is open: its inner wall drops from the rim to a bed of ash sunk below it
const cBowl = lathe([[0, 0], [.1, 0], [.15, .03], [.17, .08], [.165, .12], [.18, .13], [.172, .14], [.156, .136], [.15, .115], [0, .1]], M.bronze, 40);
cBowl.position.y = .06; cBowl.castShadow = true; censer.add(cBowl); clickable(cBowl, "incense");
mesh(new THREE.TorusGeometry(.168, .006, 6, 48), M.trim, 0, .16, 0, censer).rotation.x = Math.PI / 2;
// a gently mounded bed of ash with the stubs of burnt sticks standing in it
const ashGeo = new THREE.CircleGeometry(.152, 32), ap = ashGeo.attributes.position;
for (let i = 0; i < ap.count; i++) { const d = Math.hypot(ap.getX(i), ap.getY(i)) / .152; ap.setZ(i, (1 - d * d) * .014); }
ashGeo.computeVertexNormals();
const ash = mesh(ashGeo, M.ash, 0, .17, 0, censer); ash.rotation.x = -Math.PI / 2; clickable(ash, "incense");
[[.06, .03], [-.05, .06], [.02, -.08], [-.09, -.03], [.1, -.05], [-.02, .1]].forEach(([x, z], i) => {
  const st = mesh(new THREE.CylinderGeometry(.0025, .0025, .03 + i % 3 * .012, 5), M.stickRed, x, .18, z, censer);
  st.rotation.set((i % 2 - .5) * .3, 0, (i % 3 - 1) * .2);
});
[-1, 1].forEach(s => mesh(new THREE.TorusGeometry(.035, .009, 6, 16, Math.PI), M.bronze, s * .14, .205, 0, censer));
const ASH_Y = INCENSE.y + .18 * CS;
const INCENSE_SETS = [V(0, 0, .02), V(-.075, 0, .01), V(.075, 0, .01), V(-.04, 0, -.07), V(.04, 0, -.07)].map(v => v.multiplyScalar(CS));
const incenseObjs = new Array(INCENSE_SETS.length).fill(null);
const embers = [];
function makeIncenseSet(kind) {
  const g = new THREE.Group(), tips = [];
  [-.012, 0, .012].forEach(dx => {
    const s = new THREE.Group(); s.position.x = dx; s.rotation.z = -dx * 6; g.add(s);
    mesh(new THREE.CylinderGeometry(.0028, .0028, .09, 5), M.stickRed, 0, .045, 0, s);
    mesh(new THREE.CylinderGeometry(.0045, .0045, .19, 6), INCENSE_COAT[kind] || INCENSE_COAT.sandal, 0, .185, 0, s);
    const e = glowSprite(0xff5a20, .05, 0); e.position.y = .282; s.add(e);
    tips.push(e);
  });
  return { g, tips };
}
function addIncense(n, kind, animated, delay = 0) {
  const slot = n % INCENSE_SETS.length;
  state.altar.incense[slot] = kind;
  const set = makeIncenseSet(kind), home = V(INCENSE.x, ASH_Y - .05, INCENSE.z).add(INCENSE_SETS[slot]);
  set.g.scale.setScalar(1.5);
  set.g.rotation.y = (slot - 2) * .3;
  const replace = () => {
    const o = incenseObjs[slot];
    if (o) { scene.remove(o.g); o.tips.forEach(t => embers.splice(embers.indexOf(t), 1)); }
    incenseObjs[slot] = set; embers.push(...set.tips);
  };
  if (!animated) { set.g.position.copy(home); scene.add(set.g); replace(); set.tips.forEach(t => t.material.opacity = 1); return; }
  tween(1.4, t => {
    if (!set.g.parent) scene.add(set.g);
    const e = easeOut(clamp(t / .6, 0, 1));
    set.g.position.set(home.x, home.y + (1 - e) * .7, home.z);
    if (t > .6 && !incenseObjs.includes(set)) replace();
    set.tips.forEach(tp => tp.material.opacity = clamp((t - .6) / .4, 0, 1));
  }, () => sparkle(V(home.x, home.y + .42, home.z), 0xffa060), delay);
}

// fortune sticks (kau cim): a lacquered bamboo cylinder holding 100 numbered sticks
// they sit on a small side table to the right of the worship bench
const QT = { x: 1.25, top: PLAT + .42 };
mesh(new THREE.BoxGeometry(.56, .4, .46), M.lacquer, QT.x, PLAT + .2, BENCH_Z);
mesh(new THREE.BoxGeometry(.6, .03, .5), M.lacquer, QT.x, QT.top - .005, BENCH_Z);
mesh(new THREE.BoxGeometry(.6, .012, .012), M.trim, QT.x, QT.top - .02, BENCH_Z + .25);
const QIAN = V(QT.x + .12, QT.top + .01, BENCH_Z - .06);
const qian = new THREE.Group(); qian.position.copy(QIAN); scene.add(qian);
clickable(mesh(new THREE.CylinderGeometry(.078, .07, .3, 28, 1, true), M.lacquerIn, 0, .15, 0, qian), "fortune");
const qBase = mesh(new THREE.CircleGeometry(.07, 28), M.lacquerIn, 0, .005, 0, qian); qBase.rotation.x = -Math.PI / 2;
[.03, .27].forEach(y => mesh(new THREE.TorusGeometry(y > .1 ? .078 : .072, .006, 6, 32), M.trim, 0, y, 0, qian).rotation.x = Math.PI / 2);
const stickGeo = new THREE.BoxGeometry(.008, .4, .003), tipGeo = new THREE.BoxGeometry(.0085, .05, .0035);
const sticks = [];
for (let i = 0; i < 34; i++) {
  const g = new THREE.Group(), a = Math.random() * TAU, r = Math.sqrt(Math.random()) * .05;
  g.position.set(Math.cos(a) * r, .01, Math.sin(a) * r);
  g.rotation.set(Math.sin(a) * r * 2, Math.random() * TAU, -Math.cos(a) * r * 2);
  mesh(stickGeo, M.bamboo, 0, .2, 0, g); mesh(tipGeo, M.stickRed, 0, .375, 0, g);
  g.userData.home = { p: g.position.clone(), q: g.quaternion.clone() }; g.userData.ph = Math.random() * TAU;
  qian.add(g); sticks.push(g);
}
let drawing = false, fallen = null;
function drawFortune() {
  if (drawing) return;
  drawing = true; $("shakeBtn").disabled = true;
  if (fallen) { qian.add(fallen); fallen.position.copy(fallen.userData.home.p); fallen.quaternion.copy(fallen.userData.home.q); fallen = null; }
  const chosen = sticks[Math.floor(Math.random() * sticks.length)];
  const n = 1 + Math.floor(Math.random() * 100);
  const home = chosen.userData.home.p;
  tween(reduceMotion ? 1 : 2.2, t => {
    const shaking = t < .85;
    const lean = easeInOut(clamp(t / .2, 0, 1)) * .55 * (shaking ? 1 : 1 - (t - .85) / .15);
    qian.rotation.x = lean + (shaking && !reduceMotion ? Math.sin(t * 70) * .07 : 0);
    qian.rotation.z = shaking && !reduceMotion ? Math.sin(t * 53) * .03 : 0;
    sticks.forEach(s => { if (s !== chosen) s.position.y = s.userData.home.p.y + (shaking ? Math.abs(Math.sin(t * 70 + s.userData.ph)) * .012 : 0); });
    chosen.position.y = home.y + .32 * easeInOut(clamp((t - .2) / .6, 0, 1));
  }, () => {
    scene.attach(chosen);
    const p0 = chosen.position.clone(), q0 = chosen.quaternion.clone();
    const p1 = V(QT.x - .26, QT.top + .015, BENCH_Z + .13);
    const q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, .25, -Math.PI / 2));
    tween(.7, t => {
      const e = easeOut(t);
      chosen.position.lerpVectors(p0, p1, e); chosen.position.y += Math.sin(Math.PI * t) * .1;
      chosen.quaternion.copy(q0).slerp(q1, e);
    }, () => { fallen = chosen; drawing = false; sparkle(V(p1.x + .2, p1.y + .03, p1.z), 0xff9080); showFortune(n); });
  });
}

// worship bench nearest the visitor: wooden fish (木魚) on the left, bowl bell (磬) on the right
const BENCH_Y = PLAT + .42;
mesh(new THREE.BoxGeometry(1.5, .4, .5), M.lacquer, 0, PLAT + .2, BENCH_Z);
mesh(new THREE.BoxGeometry(1.56, .03, .56), M.lacquer, 0, BENCH_Y - .005, BENCH_Z);
mesh(new THREE.BoxGeometry(1.56, .012, .012), M.trim, 0, BENCH_Y - .02, BENCH_Z + .28);
mesh(new THREE.BoxGeometry(.5, .006, .58), M.cushion, 0, BENCH_Y + .012, BENCH_Z);
const kneel = mesh(new THREE.CylinderGeometry(.32, .34, .14, 40), M.cushion, 0, PLAT + .07, BENCH_Z + .65);
mesh(new THREE.TorusGeometry(.33, .02, 8, 48), M.stickRed, 0, PLAT + .07, BENCH_Z + .65).rotation.x = Math.PI / 2;

const MUYU = V(-.38, BENCH_Y, BENCH_Z);
const muyuG = new THREE.Group(); muyuG.position.copy(MUYU); muyuG.rotation.y = .3; muyuG.scale.setScalar(1.7); scene.add(muyuG);
mesh(new THREE.CylinderGeometry(.1, .11, .025, 24), M.cushion, 0, .0125, 0, muyuG);
const muyu = mesh(new THREE.SphereGeometry(.085, 32, 20), M.muyu, 0, .09, 0, muyuG); muyu.scale.set(1, .78, .92); clickable(muyu, "chant");
const slit = mesh(new THREE.TorusGeometry(.05, .006, 6, 24, Math.PI), M.feature, 0, .07, .074, muyuG); slit.rotation.z = Math.PI;
const mallet = new THREE.Group(); mallet.position.set(.16, .06, 0); muyuG.add(mallet);
(() => {
  const dir = V(-.12, .08, 0), len = dir.length();
  const h = mesh(new THREE.CylinderGeometry(.005, .006, len, 8), M.wood, dir.x / 2, dir.y / 2, 0, mallet);
  h.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
  mesh(new THREE.SphereGeometry(.022, 14, 10), M.wood, dir.x, dir.y, 0, mallet);
})();
mallet.rotation.z = -.35;

const BELL = V(.38, BENCH_Y, BENCH_Z);
mesh(new THREE.CylinderGeometry(.17, .18, .07, 32), M.stickRed, BELL.x, BELL.y + .035, BELL.z);
mesh(new THREE.TorusGeometry(.172, .008, 6, 40), M.trim, BELL.x, BELL.y + .07, BELL.z).rotation.x = Math.PI / 2;
const bellG = new THREE.Group(); bellG.position.set(BELL.x, BELL.y + .07, BELL.z); scene.add(bellG);
const bellBowl = lathe([[0, 0], [.06, 0], [.11, .025], [.14, .07], [.15, .13], [.142, .13], [.132, .072], [.104, .032], [.055, .012], [0, .012]], M.bronze, 48);
bellBowl.material = M.bronze; bellBowl.castShadow = true; bellG.add(bellBowl); clickable(bellBowl, "chant");
mesh(new THREE.TorusGeometry(.146, .007, 6, 48), M.trim, 0, .13, 0, bellG).rotation.x = Math.PI / 2;
const striker = new THREE.Group(); striker.position.set(BELL.x + .2, BELL.y + .02, BELL.z + .12); scene.add(striker);
(() => {
  const s = mesh(new THREE.CylinderGeometry(.012, .014, .34, 10), M.wood, 0, .17, 0, striker);
  mesh(new THREE.SphereGeometry(.02, 12, 8), M.trim, 0, .34, 0, striker);
})();
striker.rotation.set(0, 0, .55);
function ringBell() {
  tween(.9, t => {
    striker.rotation.z = .55 - .45 * Math.sin(Math.PI * clamp(t / .3, 0, 1));
    const w = t > .15 ? Math.sin((t - .15) * 60) * .05 * (1 - t) : 0;
    bellG.rotation.z = w; bellG.rotation.x = w * .6;
  });
  at(.12, bell);
}

let audio = null;
function ac() {
  try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === "suspended") audio.resume(); return audio; } catch (e) { return null; }
}
function tone(freq, endFreq, peak, decay, type = "sine", start = 0) {
  const a = ac(); if (!a || !$("soundOn").checked) return;
  const t = a.currentTime + start, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + .08);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + decay);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + decay + .05);
}
const knock = () => { tone(760, 380, .45, .14); tone(1500, 900, .08, .05, "triangle"); };
const bell = () => [[640, .22, 3.2], [1766, .1, 2.2], [3456, .045, 1.2]].forEach(([f, p, d]) => tone(f, null, p, d));
function at(delay, cb) { tweens.push({ t0: now + delay, dur: .001, fn: () => {}, done: cb }); }
function strike() {
  tween(.22, t => {
    mallet.rotation.z = -.35 * (1 - Math.sin(Math.PI * t));
    const s = 1 - .05 * Math.max(0, Math.sin(Math.PI * (t - .4) / .6));
    muyu.scale.set(s, .78 * s, .92 * s);
  });
  at(.1, knock);
}
let chanting = false;
function chant() {
  if (chanting) return;
  chanting = true; ac();
  $("chantBtn").disabled = true; $("chantBtn").textContent = "Reciting…";
  const py = [...$("chantPy").children];
  const light = c => { py.forEach((s, i) => s.classList.toggle("on", i <= c)); };
  light(-1); $("chant").hidden = false;
  const R = CONFIG.chant.rounds, beat = reduceMotion ? Math.min(.5, CONFIG.chant.beat) : CONFIG.chant.beat, round = 6 * beat + 1.6;
  for (let r = 0; r < R; r++) {
    const base = r * round;
    at(base, () => { $("chantN").textContent = `${r + 1} of ${R}`; light(-1); });
    for (let c = 0; c < 6; c++) at(base + .15 + c * beat, () => { light(c); strike(); });
    at(base + .15 + 6 * beat, () => {
      ringBell(); glowBoost = 1.6; sparkle(V(0, 2.95, -1.4), 0xffffff);
      state.recitations++; save(); updateChantCount();
    });
  }
  at(R * round + .4, () => {
    $("chant").hidden = true; light(-1);
    chanting = false; $("chantBtn").disabled = false; $("chantBtn").textContent = "Recite three times again";
    toast(`Nāmó Ēmítuófó · Recited ${R === 3 ? "three" : R} times`);
  });
}
function updateChantCount() {
  $("chantCount").textContent = state.recitations ? `You have recited the name ${state.recitations} ${state.recitations === 1 ? "time" : "times"} at this shrine.` : "";
}

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0xffd9a8, 0x2a1208, CONFIG.light.hemisphere));
const key = new THREE.SpotLight(0xffd6a0, CONFIG.light.key, 24, .62, .6, 1);
key.position.set(2.8, 6.4, 6.5); key.target.position.set(0, 1.6, -1.4); scene.add(key, key.target);
key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.normalBias = .02;
const rim = new THREE.DirectionalLight(0x9a86ff, .55); rim.position.set(-3, 4, -6); scene.add(rim);
const backGlow = new THREE.PointLight(0xe6eeff, 1.2, 7, 2); backGlow.position.set(0, 2.6, -3); scene.add(backGlow);

/* ---------- ambient particles ---------- */
const dust = (() => {
  const n = 260, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i*3] = (Math.random() - .5) * 11; pos[i*3+1] = Math.random() * 6; pos[i*3+2] = -4 + Math.random() * 8; }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size: .045, map: glowTex, color: 0xffc98a, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(p); return p;
})();
const smoke = Array.from({ length: 36 }, (_, i) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xc9b6a6, transparent: true, opacity: 0, depthWrite: false }));
  scene.add(s); return { s, age: i / 36 * 4, origin: null };
});
const tmpV = new THREE.Vector3();

/* ---------- flowers ---------- */
function makeLotus() {
  const g = new THREE.Group(); const petals = [];
  [[8, .55, M.lotus, 1], [6, .25, M.lotusIn, .8]].forEach(([n, tilt, mat, sc], ring) => {
    for (let i = 0; i < n; i++) {
      const piv = new THREE.Group(); piv.rotation.y = i / n * TAU + ring * .4; g.add(piv);
      const p = new THREE.Mesh(petalGeo, mat); p.scale.set(.03 * sc, .07 * sc, .014);
      const holder = new THREE.Group(); holder.add(p); p.position.y = .06 * sc; holder.position.z = .015;
      piv.add(holder); petals.push({ holder, tilt });
    }
  });
  const c = new THREE.Mesh(new THREE.SphereGeometry(.022, 12, 8), M.pollen); c.position.y = .03; g.add(c);
  g.userData.bloom = t => petals.forEach(p => p.holder.rotation.x = .05 + p.tilt * t);
  return g;
}
function makeRose() {
  const g = new THREE.Group(); const petals = [];
  for (let i = 0; i < 15; i++) {
    const ring = i / 14;
    const piv = new THREE.Group(); piv.rotation.y = i * 2.4; g.add(piv);
    const holder = new THREE.Group(); holder.position.z = .003 + ring * .024; piv.add(holder);
    const p = new THREE.Mesh(petalGeo, ring < .4 ? M.roseIn : M.rose);
    p.scale.set(.016 + ring * .016, .028 + ring * .014, .007); p.position.y = .024; holder.add(p);
    petals.push({ holder, tilt: .04 + ring * .75 });
  }
  for (let i = 0; i < 5; i++) {
    const piv = new THREE.Group(); piv.rotation.y = i / 5 * TAU; g.add(piv);
    const s = new THREE.Mesh(petalGeo, M.leaf); s.scale.set(.008, .026, .003); s.position.set(0, -.012, .018); s.rotation.x = 2.2; piv.add(s);
  }
  g.userData.bloom = t => petals.forEach(p => p.holder.rotation.x = .02 + p.tilt * t);
  return g;
}
function makeJasmine() {
  const g = new THREE.Group(); const blooms = [];
  const spots = [[0, .02, 0], [.04, 0, .015], [-.035, .005, .02], [.015, -.01, -.035], [-.02, -.025, -.01], [.045, -.03, -.02], [-.045, -.035, .01]];
  spots.forEach(([x, y, z], i) => {
    const f = new THREE.Group(); f.position.set(x, y, z);
    f.rotation.set((Math.random() - .5) * .9 + (z > 0 ? .5 : 0), Math.random() * TAU, (Math.random() - .5) * .9);
    g.add(f);
    if (i > 4) { const b = new THREE.Mesh(petalGeo, M.bud); b.scale.set(.008, .016, .008); f.add(b); blooms.push(f); return; }
    for (let k = 0; k < 5; k++) {
      const piv = new THREE.Group(); piv.rotation.y = k / 5 * TAU; f.add(piv);
      const p = new THREE.Mesh(petalGeo, M.jasmine); p.scale.set(.008, .003, .016); p.position.z = .014; p.rotation.x = -.15; piv.add(p);
    }
    const c = new THREE.Mesh(new THREE.SphereGeometry(.004, 8, 6), M.pollen); c.position.y = .002; f.add(c);
    blooms.push(f);
  });
  [[.03, -.05, .02, .5], [-.03, -.06, -.01, -.6]].forEach(([x, y, z, r]) => {
    const l = new THREE.Mesh(petalGeo, M.leaf); l.scale.set(.012, .004, .035); l.position.set(x, y, z); l.rotation.y = r; g.add(l);
  });
  g.userData.bloom = t => blooms.forEach((b, i) => b.scale.setScalar(.25 + .75 * clamp(t * 1.4 - i * .06, 0, 1)));
  return g;
}
const FLOWER_MAKERS = { lotus: makeLotus, rose: makeRose, jasmine: makeJasmine };
const FLOWER_SLOTS = 11;
const flowerOrder = [5, 4, 6, 3, 7, 2, 8, 1, 9, 0, 10];
const flowers = new Array(FLOWER_SLOTS).fill(null);
function flowerTarget(slot) {
  const a = (slot / (FLOWER_SLOTS - 1) - .5) * 1.7;
  return V(MOUTH.x + Math.sin(a) * .24, MOUTH.y + .2 + Math.cos(a) * .16 + (slot % 2) * .05, MOUTH.z + ((slot % 3) - 1) * .07);
}
function addFlower(n, kind, animated, delay) { const slot = flowerOrder[n % FLOWER_SLOTS]; state.altar.flowers[slot] = kind; placeFlower(slot, kind, animated, delay); }
function placeFlower(slot, kind, animated, delay = 0) {
  const headObj = (FLOWER_MAKERS[kind] || makeLotus)();
  const tgt = flowerTarget(slot);
  const d = new THREE.Vector3().subVectors(tgt, MOUTH);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.006, .008, 1, 6), M.stem);
  stem.geometry.translate(0, .5, 0); stem.position.copy(MOUTH); stem.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
  const len = d.length();
  headObj.quaternion.copy(stem.quaternion);
  const place = () => { const old = flowers[slot]; if (old) scene.remove(old.head, old.stem); flowers[slot] = { head: headObj, stem }; };
  if (!animated) { stem.scale.y = len; headObj.position.copy(tgt); headObj.userData.bloom(1); scene.add(stem, headObj); place(); return; }
  const start = V(tgt.x * .3, 3.6, 3.6), ctrl = V(tgt.x * .6, 3.4, 1.6);
  stem.scale.y = .0001; headObj.userData.bloom(0);
  tween(1.9, t => {
    if (!headObj.parent) scene.add(headObj);
    const e = easeInOut(clamp(t / .75, 0, 1)), u = 1 - e;
    headObj.position.set(u*u*start.x + 2*u*e*ctrl.x + e*e*tgt.x, u*u*start.y + 2*u*e*ctrl.y + e*e*tgt.y, u*u*start.z + 2*u*e*ctrl.z + e*e*tgt.z);
    if (t >= .72) {
      if (!stem.parent) { scene.add(stem); place(); }
      stem.scale.y = Math.max(.0001, len * easeOut((t - .72) / .28));
    }
    headObj.userData.bloom(easeOut(clamp((t - .6) / .4, 0, 1)));
  }, () => sparkle(tgt, kind === "rose" ? 0xff7090 : kind === "jasmine" ? 0xffffff : 0xffb0c4), delay);
}

/* ---------- fruit and water ---------- */
function makeFruit(type) {
  const mat = FRUIT_MATS[type];
  const g = new THREE.Group();
  const f = new THREE.Mesh(new THREE.SphereGeometry(FR, 20, 14), mat); f.castShadow = true; g.add(f);
  if (type === 2) f.scale.set(.85, .85, 1.25);
  if (type === 1 || type === 2) {
    const l = new THREE.Mesh(petalGeo, M.leaf); l.scale.set(.016, .004, .034); l.position.set(.012, FR * .92, .01); l.rotation.y = .6; g.add(l);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(.003, .004, .03, 5), M.feature); st.position.y = FR * .98; g.add(st);
  }
  g.rotation.y = type * 1.3 + Math.random();
  return g;
}
const fruits = new Array(fruitSlots.length).fill(null);
function addFruit(n, animated, delay = 0) { const slot = n % fruitSlots.length; state.altar.fruit[slot] = n % 4; placeFruit(slot, n % 4, animated, delay); }
function placeFruit(slot, type, animated, delay = 0) {
  const tgt = fruitSlots[slot], f = makeFruit(type);
  const place = () => { if (fruits[slot]) scene.remove(fruits[slot]); fruits[slot] = f; };
  if (!animated) { f.position.copy(tgt); scene.add(f); place(); return; }
  const startY = 3.2;
  tween(1.1, t => {
    if (!f.parent) { place(); scene.add(f); }
    let y;
    if (t < .55) { const e = t / .55; y = startY + (tgt.y - startY) * e * e; }
    else if (t < .8) { const e = (t - .55) / .25; y = tgt.y + Math.sin(e * Math.PI) * .08; }
    else { const e = (t - .8) / .2; y = tgt.y + Math.sin(e * Math.PI) * .025; }
    f.position.set(tgt.x, y, tgt.z);
    f.rotation.x = (1 - t) * 3;
  }, () => sparkle(tgt, 0xffc060), delay);
}
function addWater(n, kind, animated, delay = 0) {
  const i = n % 7, b = bowls[i];
  state.altar.bowls[i] = kind;
  if (!animated) { setBowl(b, 1, kind); return; }
  const drop = new THREE.Mesh(new THREE.SphereGeometry(.022, 12, 8), WATER[kind]); drop.scale.y = 1.6;
  let from = 0;
  tween(1.6, t => {
    if (t < .45) {
      if (!drop.parent) scene.add(drop);
      const e = t / .45; drop.position.set(b.x, 2.6 + (ALT.y + .06 - 2.6) * e * e, b.z);
    } else {
      if (drop.parent) { scene.remove(drop); ripple(b); from = b.kind === kind ? b.level : 0; }
      setBowl(b, from + (1 - from) * easeOut((t - .45) / .55), kind);
    }
  }, () => sparkle(V(b.x, ALT.y + .08, b.z), kind === "tea" ? 0xffb070 : kind === "saffron" ? 0xffd040 : 0xbfe8ff), delay);
}

/* ---------- effects ---------- */
const tweens = [], bursts = [];
let now = 0, glowBoost = 0;
function tween(dur, fn, done, delay = 0) { tweens.push({ t0: now + delay, dur, fn, done }); }
function sparkle(pos, color) {
  const n = 36, arr = new Float32Array(n * 3), vel = [];
  for (let i = 0; i < n; i++) { arr.set([pos.x, pos.y, pos.z], i * 3); vel.push(V((Math.random() - .5) * 1.1, Math.random() * 1.3 + .2, (Math.random() - .5) * 1.1)); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: .07, map: glowTex, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(pts); bursts.push({ pts, vel, life: 0 });
  glowBoost = 1;
}
function ripple(b) {
  const r = new THREE.Mesh(new THREE.TorusGeometry(1, .08, 6, 32), new THREE.MeshBasicMaterial({ color: 0xdff6ff, transparent: true }));
  r.rotation.x = Math.PI / 2; r.position.set(b.x, ALT.y + .065, b.z); scene.add(r);
  tween(.7, t => { r.scale.setScalar(.01 + .06 * t); r.material.opacity = 1 - t; }, () => { scene.remove(r); r.geometry.dispose(); });
}

/* ---------- initial altar ---------- */
const A = state.altar;
Object.entries(A.flowers).forEach(([s, k]) => placeFlower(+s, k, false));
Object.entries(A.bowls).forEach(([s, k]) => setBowl(bowls[+s], 1, k));
Object.entries(A.fruit).forEach(([s, k]) => placeFruit(+s, k, false));
Object.entries(A.candles).forEach(([s, k]) => {
  // altars saved before the stepped stands used plain numbers; lamps go to the lowest step
  if (/^\d+$/.test(s)) { delete A.candles[s]; s = (k === "lamp" ? "l" : "c") + s; }
  placeCandle(s, k, false);
});
Object.entries(A.incense).forEach(([s, k]) => addIncense(+s, k, false));

/* ---------- the pagoda: seven floors and the view from outside ---------- */
const temple = window.TempleFloors({
  THREE, world, V, TAU, clamp, easeOut, mesh, lathe, std, M, glowSprite, glowTex, canvasTex, petalGeo, makeLotus,
  makeFlame, tone: (...a) => tone(...a), tween: (...a) => tween(...a), sculptFigure, floors: CONFIG.floors, places: CONFIG.places, reduceMotion, cull: CONFIG.cull
});
let current = 1;
// the main hall gets the same festoons of lanterns and spiral staircase as the floors above
// the stair-room door and the main doors: both just go somewhere else
temple.dress(scene).forEach(h => { h.userData.item = "stairs"; clickables.push(h); });
const INTERIOR = { min: controls.minDistance, max: controls.maxDistance, minP: controls.minPolarAngle, maxP: controls.maxPolarAngle, minA: controls.minAzimuthAngle, maxA: controls.maxAzimuthAngle };
// what to call a floor, a building or the outside view
const placeInfo = m => m === "pagoda" ? { han: "塔", name: "The pagoda", label: "The temple from outside" }
  : typeof m === "number" ? { ...CONFIG.floors[m - 1], label: `${m}F · ${CONFIG.floors[m - 1].name}` }
  : { ...CONFIG.places[m], label: CONFIG.places[m].name };
function applyMode(mode) {
  const prev = current, wasWalking = inMarket;
  current = mode;
  scene.visible = mode === 1;
  temple.show(mode);
  const out = mode === "pagoda", view = out ? CONFIG.camera.pagoda : CONFIG.camera.full;
  world.fog.near = out ? CONFIG.fog.outside[0] : 13; world.fog.far = out ? CONFIG.fog.outside[1] : 28;
  applySky();
  Object.assign(controls, out
    ? { minDistance: 14, maxDistance: 110, minPolarAngle: .35, maxPolarAngle: 1.52, minAzimuthAngle: -Infinity, maxAzimuthAngle: Infinity }
    : { minDistance: INTERIOR.min, maxDistance: INTERIOR.max, minPolarAngle: INTERIOR.minP, maxPolarAngle: INTERIOR.maxP, minAzimuthAngle: INTERIOR.minA, maxAzimuthAngle: INTERIOR.maxA });
  camera.far = out ? 500 : 80; camera.updateProjectionMatrix();
  camera.position.set(...view.pos); controls.target.set(...view.target); controls.update();
  closeTopGame(true);
  if (inMarket) leaveMarketState();
  closeUp = false; inCorridor = false; inStairs = false; camera.fov = 42; camera.updateProjectionMatrix(); stairButtons();
  $("viewBtn").textContent = "Look closer";
  const f = placeInfo(mode);
  $("viewBtn").hidden = !f.statue;
  $("outsideBtn").textContent = out ? "Enter the main hall" : "Outside view";
  $("marketBtn").hidden = !out; $("fpBtn").hidden = !out;
  $("walkPad").hidden = false;
  $("where").innerHTML = out ? `The pagoda · ${CONFIG.floors.length} floors` : esc(f.label);
  $("hint").textContent = out ? "Drag to look around. Stone lions guard the gate, the path crosses the lotus pond, the Bell Tower stands on the left, the training ground lies east of the pagoda, the temple shop and monks' quarters and the lotus-viewing pavilion line the left of the pond, and the Lotus Temple hall runs along its right, with the street outside the gate a town road of modern houses along the west wall, and the seven-day market on the east side. Tap the main door, a floor or a building to go inside." : f.hint;
  document.querySelectorAll("#floors button").forEach(b => b.setAttribute("aria-current", String(b.dataset.f === String(mode))));
  tip.hidden = true;
  if (arriveInStairs) { arriveInStairs = false; setView("stairs", true); }
  if ((wasWalking || typeof mode === "number") && !inStairs) stayFirstPerson(prev);   // walking in or out keeps you on foot; the pagoda's floors are always seen on foot
  $("actions").hidden = mode !== 1;   // Buy, Donate, Recite and Fortune belong to Guanyin's main hall
  if (mode === "shop") openSheet("buy");
  if (typeof render === "function") render();
}
// on foot through a door: indoors you stand just inside the entrance facing the shrine; outdoors, just outside the door you came out of
const EXIT_SPOT = { 1: [[0, 13.5], [0, 30]], library: [[14.5, 26], [0, 26]], shop: [[-18.5, 27], [0, 27]], quarters: [[-18.5, 21.6], [0, 21.6]], bell: [[-17, 5.5], [-17, 20]] };
function stayFirstPerson(prev) {
  if (current === "pagoda") {
    const [at, look] = EXIT_SPOT[typeof prev === "number" ? 1 : prev] || EXIT_SPOT[1];
    enterWalk(at, look, `The temple grounds`);
    tweens.length = 0; const p1 = V(at[0], eyeAt(at[0], at[1]), at[1]); lookFrom(p1, V(look[0], p1.y, look[1]));
  } else {
    inMarket = true; setPanel(true);
    document.querySelector(".app").classList.add("in-market");
    lookFrom(V(0, EYE, 6.0), V(0, EYE, -1.7));
    $("leaveMarketBtn").hidden = false; $("outsideBtn").hidden = true; $("fpBtn").hidden = true; $("marketBtn").hidden = true;
  }
}
/* ---------- the real sky: sun and moon positions and the moon's phase (after SunCalc, V. Agafonkin, BSD) ---------- */
const Astro = (() => {
  const rad = Math.PI / 180, e = rad * 23.4397, toDays = t => t / 864e5 - .5 + 2440588 - 2451545;
  const ra = (l, b) => Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
  const dec = (l, b) => Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
  const az = (H, phi, d) => Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(d) * Math.cos(phi));
  const alt = (H, phi, d) => Math.asin(Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H));
  const sidereal = (d, lw) => rad * (280.16 + 360.9856235 * d) - lw;
  const sunCoords = d => {
    const M = rad * (357.5291 + .98560028 * d), C = rad * (1.9148 * Math.sin(M) + .02 * Math.sin(2 * M) + .0003 * Math.sin(3 * M));
    const L = M + C + rad * 102.9372 + Math.PI;
    return { dec: dec(L, 0), ra: ra(L, 0) };
  };
  const moonCoords = d => {
    const L = rad * (218.316 + 13.176396 * d), M = rad * (134.963 + 13.064993 * d), F = rad * (93.272 + 13.22935 * d);
    const l = L + rad * 6.289 * Math.sin(M), b = rad * 5.128 * Math.sin(F);
    return { ra: ra(l, b), dec: dec(l, b), dist: 385001 - 20905 * Math.cos(M) };
  };
  return {
    sun(t, lat, lon) { const lw = rad * -lon, phi = rad * lat, d = toDays(t), c = sunCoords(d), H = sidereal(d, lw) - c.ra; return { az: az(H, phi, c.dec), alt: alt(H, phi, c.dec) }; },
    moon(t, lat, lon) {
      const lw = rad * -lon, phi = rad * lat, d = toDays(t), c = moonCoords(d), H = sidereal(d, lw) - c.ra;
      const q = Math.atan2(Math.sin(H), Math.tan(phi) * Math.cos(c.dec) - Math.sin(c.dec) * Math.cos(H));   // parallactic angle
      return { az: az(H, phi, c.dec), alt: alt(H, phi, c.dec), q };
    },
    illumination(t) {
      const d = toDays(t), s = sunCoords(d), m = moonCoords(d), sd = 149598000;
      const phi = Math.acos(Math.sin(s.dec) * Math.sin(m.dec) + Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra));
      const inc = Math.atan2(sd * Math.sin(phi), m.dist - sd * Math.cos(phi));
      const angle = Math.atan2(Math.cos(s.dec) * Math.sin(s.ra - m.ra), Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra));
      return { fraction: (1 + Math.cos(inc)) / 2, phase: .5 + .5 * inc * (angle < 0 ? -1 : 1) / Math.PI, angle };
    }
  };
})();
const PHASE_NAMES = [[.03, "New moon"], [.22, "Waxing crescent"], [.28, "First quarter"], [.47, "Waxing gibbous"], [.53, "Full moon"], [.72, "Waning gibbous"], [.78, "Last quarter"], [.97, "Waning crescent"], [1.01, "New moon"]];
const phaseName = p => PHASE_NAMES.find(([lim]) => p < lim)[1];
// a direction in the temple's frame (the temple faces south, +z; east is +x) from azimuth (from south, westward) and altitude
const skyDir = (a, h) => V(-Math.sin(a) * Math.cos(h), Math.sin(h), Math.cos(a) * Math.cos(h));
const COMPASS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
const compass = a => COMPASS[Math.round(((a / Math.PI * 180 + 180) % 360) / 45) % 8];
// the moon's face: dark disc, the lit part with its terminator, a few maria; the lit limb is drawn at the top
// and the sprite is turned so it points the way it really does in the sky
function moonTexture(fraction) {
  const S = 256, R = 116, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(70,74,92,.6)"; g.beginPath(); g.arc(S / 2, S / 2, R, 0, TAU); g.fill();   // the dark side, faint with earthshine
  const lit = document.createElement("canvas"); lit.width = lit.height = S;
  const l = lit.getContext("2d");
  const grad = l.createRadialGradient(S / 2 - 20, S / 2 - 30, 10, S / 2, S / 2, R);
  grad.addColorStop(0, "#fffbee"); grad.addColorStop(1, "#d8d2bf");
  l.fillStyle = grad;
  l.beginPath(); l.arc(S / 2, S / 2, R, Math.PI, TAU); l.fill();                                 // the top half is always lit
  const k = R * Math.abs(1 - 2 * fraction);
  if (fraction >= .5) { l.beginPath(); l.ellipse(S / 2, S / 2, R, Math.max(k, .1), 0, 0, TAU); l.fill(); }
  else { l.globalCompositeOperation = "destination-out"; l.beginPath(); l.ellipse(S / 2, S / 2, R, Math.max(k, .1), 0, 0, TAU); l.fill(); }
  l.globalCompositeOperation = "source-atop"; l.fillStyle = "rgba(120,116,104,.35)";
  [[-30, -20, 26], [22, -40, 18], [30, 12, 30], [-12, 40, 16], [-48, 18, 14]].forEach(([x, y, r]) => { l.beginPath(); l.arc(S / 2 + x, S / 2 + y, r, 0, TAU); l.fill(); });
  g.drawImage(lit, 0, 0);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
let skyNote = "";
function updateCelestial() {
  const { lat, lon, tz } = CONFIG.sky, now = Date.now(), deg = Math.PI / 180;
  const wall = z => new Date(new Date(now).toLocaleString("en-US", { timeZone: z })).getTime();
  const off = wall(tz) - wall("UTC"), midnight = Math.floor((now + off) / 864e5) * 864e5 - off;   // midnight on the temple's clock
  const sunNow = Astro.sun(now, lat, lon).alt;
  const dayT = sunNow > 8 * deg ? now : midnight + 12 * 36e5;            // the day view: now if it is daytime there, else today's noon
  const nightT = sunNow < -8 * deg ? now : midnight + 22 * 36e5;         // the night view: now if it is night there, else 10 pm tonight
  const ill = Astro.illumination(now);
  const moonAt = t => {
    const m = Astro.moon(t, lat, lon), up = m.alt > -.01;
    return { up, dir: skyDir(m.az, Math.max(m.alt, .02)), rot: Astro.illumination(t).angle - m.q, az: m.az, alt: m.alt };
  };
  const sd = Astro.sun(dayT, lat, lon), mN = moonAt(nightT), mD = moonAt(dayT);
  temple.setCelestial({ sun: skyDir(sd.az, Math.max(sd.alt, .1)), moonNight: mN, moonDay: mD, moonTex: moonTexture(ill.fraction), fraction: ill.fraction });
  // a line for the HUD: what is in the sky right now in the chosen view, and when the moon rises if it is down
  const fmt = t => new Date(t).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: tz });
  const height = a => a > 60 * deg ? "high in the " : a < 15 * deg ? "low in the " : "in the ";
  const rise = from => { for (let t = from; t < from + 864e5 * 1.1; t += 6e5) if (Astro.moon(t, lat, lon).alt > 0) return t; return null; };
  const moonText = m => {
    const name = phaseName(ill.phase), pct = Math.round(ill.fraction * 100);
    if (m.up) return `${name} moon, ${pct}% lit, ${height(m.alt)}${compass(m.az)}`;
    const r = rise(m === mN ? nightT : dayT);
    return `${name} moon (${pct}% lit) is below the horizon${r ? ", rises " + fmt(r) : ""}`;
  };
  skyNote = { night: `${nightT === now ? "Now" : "Tonight " + fmt(nightT)} in ${CONFIG.sky.place} · ${moonText(mN)}`,
              day: `${dayT === now ? "Now" : "Today " + fmt(dayT)} in ${CONFIG.sky.place} · sun ${height(sd.alt)}${compass(sd.az)} · ${mD.up ? moonText(mD).replace(" moon,", " moon also up,") : "no moon in the sky"}` };
}
/* ---------- Halloween night: the houses go dark at 9 pm ICT, a friendly ghost walks the roads, walkers carry a torch ---------- */
const FEST_FORCE = (() => { try { const v = new URLSearchParams(location.search).get("halloween"); return v === null ? null : v !== "0"; } catch (e) { return null; } })();
function festNow() {
  if (FEST_FORCE !== null) return { season: FEST_FORCE, night: FEST_FORCE };
  const { tz } = CONFIG.sky, { from, to, outHour, untilHour } = CONFIG.halloween;
  const clock = t => Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "numeric", day: "numeric", hour: "numeric", hourCycle: "h23" })
    .formatToParts(t).filter(p => p.type !== "literal").map(p => [p.type, +p.value]));
  const n = Date.now(), hour = clock(n).hour, eve = clock(n - untilHour * 36e5);   // a night belongs to the evening it began on
  const md = eve.month * 100 + eve.day, season = md >= from[0] * 100 + from[1] && md <= to[0] * 100 + to[1];
  return { season, night: season && (hour >= outHour || hour < untilHour) };
}
let fest = festNow(), festOut = fest.night ? 1 : 0, festTold = { torch: false, ghost: false };
setInterval(() => { const was = fest.night; fest = festNow(); if (fest.night !== was) applySky(); }, 3e4);
// the walker's torch: always in the scene (adding a light later would rebuild every material), dark until it is needed
const torch = new THREE.SpotLight(0xfff1d6, 0, 34, .42, .55, 1.4);
world.add(torch, torch.target);
const _look = new THREE.Vector3();
function festStep(dt) {
  const was = festOut;
  festOut = clamp(festOut + (fest.night ? dt : -dt) / 2.5, 0, 1);   // the house lights go out over a couple of seconds
  temple.setHalloween({ on: fest.night, out: festOut });
  if (festOut !== was) skyColors();
  const outside = current === "pagoda", dark = fest.night && daylight < .5;
  const want = dark && outside && inMarket, onFootAtNight = outside && inMarket && daylight < .5;
  if (!onFootAtNight) torchChoice = null;   // a new walk at night starts with the torch as the night has it
  const lit = onFootAtNight && (torchChoice === null ? want : torchChoice);
  torchButton(onFootAtNight, lit);
  torch.intensity += ((lit ? 2.4 : 0) - torch.intensity) * Math.min(1, dt * 6);
  if (torch.intensity > .01) {
    camera.getWorldDirection(_look);
    torch.position.copy(camera.position).addScaledVector(_look, .2).add(V(0, -.35, 0));
    torch.target.position.copy(camera.position).addScaledVector(_look, 10);
  }
  if (want && torchChoice === null && !festTold.torch) { festTold.torch = true; toast("Happy Halloween! The houses are dark tonight, so you switch on your torch."); }
  const gh = temple.ghost;
  if (want && gh && !festTold.ghost && Math.hypot(gh.x - camera.position.x, gh.z - camera.position.z) < 9) {
    festTold.ghost = true; toast("👻 Just a friendly little ghost out for Halloween. It waves hello and drifts on along the road.");
  }
}
// the torch switch: shown while walking outside at night; on Halloween night the torch starts on, any other night off
let torchChoice = null, torchShown = null;   // torchChoice: null until the walker flips the switch
function torchButton(show, lit) {
  const b = $("torchBtn"), key = show && (lit ? "on" : "off");
  if (key === torchShown) return; torchShown = key;
  b.hidden = !show; if (!show) return;
  b.textContent = lit ? "🔦 Torch on" : "🔦 Torch off"; b.title = `Switch the torch ${lit ? "off" : "on"} (T)`; b.setAttribute("aria-pressed", String(lit));
}
function flipTorch() {
  if ($("torchBtn").hidden) return;
  torchChoice = $("torchBtn").getAttribute("aria-pressed") !== "true";
  tone(2200, 1400, .06, .04, "square");   // the switch's click
}
$("torchBtn").addEventListener("click", flipTorch);
document.addEventListener("keydown", e => { if (e.code === "KeyT" && !e.repeat && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) flipTorch(); });
function festNote() {
  const el = $("festInfo"); if (!el) return;
  el.hidden = current !== "pagoda" || !fest.season;
  el.textContent = fest.night ? `🎃 Halloween night · the houses are dark after 9 PM ICT · a friendly ghost walks the roads${daylight > .5 ? " (switch to Night to see it)" : ""}`
    : "🎃 Halloween festival · the houses go dark at 9 PM ICT tonight";
}

/* ---------- weather: rain, cloud, mist and haze over the northern hills, picked from the date ---------- */
const WEATHER = {   // fog: how far you see (x the usual haze), tint: the sky's colour and how much of it, rain: 0–1, wind: 0–1
  clear:  { icon: "☀", label: "Clear skies", fog: 1, tint: 0x9aa4ae, k: 0, rain: 0, wind: .5 },
  cloudy: { icon: "☁", label: "Cloudy", fog: .8, tint: 0x8c939a, k: .45, rain: 0, wind: .75 },
  rain:   { icon: "🌧", label: "Rain", fog: .45, tint: 0x6a737c, k: .7, rain: 1, wind: 1 },
  mist:   { icon: "🌫", label: "Mist in the valley", fog: .3, tint: 0xc2c6ca, k: .65, rain: 0, wind: .15 },
  haze:   { icon: "🌫", label: "Smoky haze from the field burning", fog: .5, tint: 0xb39c78, k: .55, rain: 0, wind: .3 }
};
const WX_FORCE = (() => { try { const v = new URLSearchParams(location.search).get("weather"); return WEATHER[v] ? v : null; } catch (e) { return null; } })();
function weatherNow() {
  if (WX_FORCE) return WX_FORCE;
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: CONFIG.sky.tz, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", hourCycle: "h23" })
    .formatToParts(Date.now()).filter(q => q.type !== "literal").map(q => [q.type, +q.value]));
  const spell = Math.floor(p.hour / CONFIG.weather.spell), mistHour = p.hour >= 4 && p.hour < 10;
  // the same weather for every visitor in this spell: a hash of the date and the spell
  let h = (p.year * 400 + p.month * 32 + p.day) * 8 + spell;
  h = Math.imul(h ^ h >>> 16, 0x45d9f3b); h = Math.imul(h ^ h >>> 16, 0x45d9f3b); h = ((h ^ h >>> 16) >>> 0) / 4294967296;
  const w = CONFIG.weather.odds[p.month - 1].map((o, i) => i === 3 ? o * (mistHour ? 2.5 : .3) : o), kinds = Object.keys(WEATHER);
  let r = h * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < kinds.length; i++) if ((r -= w[i]) < 0) return kinds[i];
  return "clear";
}
const seasonName = () => { const m = +new Intl.DateTimeFormat("en-US", { timeZone: CONFIG.sky.tz, month: "numeric" }).format(Date.now()); return m >= 5 && m <= 10 ? "rainy season" : m >= 3 ? "hot season" : "cool season"; };
let wxKind = weatherNow();
const wx = (({ fog, k, rain, wind, tint }) => ({ fog, k, rain, wind, tint: new THREE.Color(tint) }))(WEATHER[wxKind]);   // the weather as it is now, drifting toward wxKind
setInterval(() => { const was = wxKind; wxKind = weatherNow(); if (wxKind !== was) weatherNote(); }, 6e4);
function weatherNote() {
  const el = $("weatherInfo"); if (!el) return;
  const w = WEATHER[wxKind];
  el.hidden = !(current === "pagoda" || inCorridor);
  el.textContent = `${w.icon} ${w.label} · ${seasonName()} in the northern hills`;
}
// rain: streaks falling in a box that travels with the camera (left out when motion is reduced; the sound stays)
const RAIN_N = 2400, RAIN_BOX = [50, 24, 50];
const rainLines = (() => {
  const pos = new Float32Array(RAIN_N * 6);
  for (let i = 0; i < RAIN_N; i++) { const x = (Math.random() - .5) * RAIN_BOX[0], y = Math.random() * RAIN_BOX[1], z = (Math.random() - .5) * RAIN_BOX[2]; pos.set([x, y, z, x, y - .5, z], i * 6); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xaab4c0, transparent: true, opacity: 0, depthWrite: false }));
  l.frustumCulled = false; l.visible = false; world.add(l); return l;
})();
function weatherStep(dt) {
  const T = WEATHER[wxKind], e = Math.min(1, dt / 6);   // a change of weather drifts in over half a minute or so
  ["fog", "k", "rain", "wind"].forEach(n => wx[n] += (T[n] - wx[n]) * e);
  wx.tint.lerp(_wxTint.set(T.tint), e);
  const out = current === "pagoda" || inCorridor;
  if (out) {   // closer haze, a greyer sky and a dimmer day
    const base = inCorridor ? CONFIG.fog.corridor : inMarket ? CONFIG.fog.walk : CONFIG.fog.outside, f = inMarket ? wx.fog : .5 + .5 * wx.fog;
    world.fog.near = base[0] * f; world.fog.far = base[1] * f;
    renderer.toneMappingExposure = CONFIG.light.exposure * (1 + .05 * daylight) * (1 - .2 * wx.k * daylight);
    skyColors();
  }
  const show = out && wx.rain > .02 && !reduceMotion;
  rainLines.visible = show;
  if (!show) return;
  rainLines.material.opacity = .45 * wx.rain * (.6 + .4 * daylight);
  rainLines.position.set(camera.position.x, camera.position.y - RAIN_BOX[1] / 2, camera.position.z);
  const a = rainLines.geometry.attributes.position, p = a.array, fall = 14 * dt, drift = 1.2 * wx.wind * dt;
  for (let i = 0; i < RAIN_N * 6; i += 6) {
    p[i + 1] -= fall; p[i + 4] -= fall; p[i] += drift; p[i + 3] += drift;
    if (p[i + 4] < 0) { p[i + 1] += RAIN_BOX[1]; p[i + 4] += RAIN_BOX[1]; }
    if (p[i] > RAIN_BOX[0] / 2) { p[i] -= RAIN_BOX[0]; p[i + 3] -= RAIN_BOX[0]; }
    p[i + 3] = p[i] - .06 * wx.wind;   // the streak leans with the wind
  }
  a.needsUpdate = true;
}
const _wxTint = new THREE.Color(), _wxSky = new THREE.Color();

// day and night outside: the sky, sun or moon, the light and the haze; indoors stays lamplit
let daylight = 0;
try { daylight = localStorage.getItem("lotus-altar-daylight") === "1" ? 1 : 0; } catch (e) {}
// the sky and haze outside; on Halloween night, with the houses dark, they deepen to a near-black blue with no town glow in them
function skyColors() {
  const out = current === "pagoda" || inCorridor, d = daylight, dark = festOut * (1 - d);
  const mix = (a, b) => new THREE.Color(a).lerp(new THREE.Color(b), d);
  world.background.copy(out ? mix(0x16122a, 0x86b8e6).lerp(new THREE.Color(0x07060f), dark) : new THREE.Color(0x120a07));
  world.fog.color.copy(out ? mix(0x241c34, 0xb4cce0).lerp(new THREE.Color(0x09080f), dark) : new THREE.Color(0x120a07));
  if (out && wx.k > .001) {   // cloud, rain, mist or haze greys the sky (darker at night)
    const tint = _wxSky.copy(wx.tint).multiplyScalar(.15 + .85 * d), k = wx.k * (1 - dark);
    world.background.lerp(tint, k); world.fog.color.lerp(tint, k);
  }
}
function applySky() {
  const out = current === "pagoda" || inCorridor, d = daylight;
  skyColors();
  renderer.toneMappingExposure = CONFIG.light.exposure * (out ? 1 + .05 * d : 1);
  temple.setDaylight(d);
  const btn = $("timeBtn");
  const note = $("skyInfo");
  if (note) { note.hidden = !out || !skyNote; if (skyNote) note.textContent = daylight > .5 ? skyNote.day : skyNote.night; }
  festNote();
  weatherNote();
  if (btn) { btn.textContent = daylight > .5 ? "☾ Night" : "☀ Day"; btn.title = daylight > .5 ? "Switch to night" : "Switch to day"; btn.setAttribute("aria-pressed", String(daylight > .5)); }
}
updateCelestial();
setInterval(() => { updateCelestial(); applySky(); }, 5 * 6e4);   // the sky moves on while the page is open
$("timeBtn").addEventListener("click", () => {
  const from = daylight, to = daylight > .5 ? 0 : 1;
  try { localStorage.setItem("lotus-altar-daylight", String(to)); } catch (e) {}
  tween(reduceMotion ? .01 : 1.6, t => { daylight = from + (to - from) * easeInOut(t); applySky(); }, () => { daylight = to; applySky(); });
});
/* ---------- the sounds outside, made on the fly in WebAudio (no recordings): wind in the banyan and over the paddies,
   the stream, birds and cicadas by day and crickets by night at the forest, the hti bells on the stupas, the temple bell
   and the gong in the Lotus Temple hall now and then, and the rain ---------- */
let amb = null;
const rand = (a, b) => a + Math.random() * (b - a);
function ambStart() {
  if (amb || !$("soundOn").checked) return;
  const a = ac(); if (!a) return;
  const out = a.createGain(); out.gain.value = 0; out.connect(a.destination);
  const buf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  // a bed of noise shaped by filters [type, freq, Q], optionally beating at `am` Hz (insects), into its own gain
  const bed = (filters, am) => {
    const s = a.createBufferSource(); s.buffer = buf; s.loop = true;
    let n = s; const fs = filters.map(([type, f, q]) => { const fl = a.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; n.connect(fl); return n = fl; });
    if (am) { const m = a.createGain(), o = a.createOscillator(), og = a.createGain(); m.gain.value = .5; o.frequency.value = am; og.gain.value = .5; o.connect(og); og.connect(m.gain); o.start(); n.connect(m); n = m; }
    const g = a.createGain(); g.gain.value = 0; n.connect(g); g.connect(out); s.start(0, Math.random() * 1.9);
    return { g, fs };
  };
  const wobble = (param, hz, depth) => { const o = a.createOscillator(), og = a.createGain(); o.frequency.value = hz; og.gain.value = depth; o.connect(og); og.connect(param); o.start(); };
  amb = {
    out, buf,
    leaves: bed([["bandpass", 900, .5], ["lowpass", 1800, .7]]),   // a breeze through the banyan: airy, not a hiss
    wind: bed([["bandpass", 650, .5], ["lowpass", 1400, .7]]),   // a breeze over the open fields and the hilltop: airy, not a rumble
    rice: bed([["highpass", 2800, .5]]),                          // the ripe rice hissing in it
    water: bed([["bandpass", 1000, 1.4]]), water2: bed([["bandpass", 2400, 4]]),   // the stream over its stones
    cicada: bed([["bandpass", 5200, 9]], 42),
    rain: bed([["highpass", 450, .5], ["lowpass", 4200, .5]]),
    breaths: { banyan: { left: 0, wait: rand(2, 6) }, field: { left: 0, wait: rand(3, 10) }, hill: { left: 0, wait: rand(1, 5) } },
    next: { tink: 0, bird: 2, cricket: 0, bell: rand(8, 25), gong: rand(4, 20), thunder: rand(15, 40) }
  };
  wobble(amb.water.fs[0].frequency, .7, 260); wobble(amb.water2.fs[0].frequency, 1.9, 700);
}
// one struck or plucked tone into the ambience: freq, loudness, ring time, delay, swell (a gong's upper partials bloom)
function ping(f, peak, decay, t0 = 0, swell = .004, type = "sine") {
  if (peak < .0005) return null;
  const a = audio, t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + swell); g.gain.exponentialRampToValueAtTime(.0001, t + decay);
  o.connect(g); g.connect(amb.out); o.start(t); o.stop(t + decay + .05); return o;
}
// the little bells hung from the stupas' hti crowns, swung by the wind
const tinkle = v => { const f = [2093, 2349, 2637, 3136, 3520][(Math.random() * 5) | 0] * rand(.99, 1.01); ping(f, v, 1.8); ping(f * 2.76, v * .35, .8); ping(f * 5.4, v * .12, .35); };
// the great bell in the Bell Tower, struck with the log (the same voice as ringing it yourself)
const templeBell = v => [[98, .35, 7], [196 * 1.19, .14, 5], [98 * 2.76, .09, 3.5], [98 * 5.4, .04, 2]].forEach(([f, p, d]) => ping(f, p * v, d));
// the hall's gong: a low hum whose upper partials swell after the stroke, the note sagging a little as it settles
function gong(v) {
  const o = ping(110, .5 * v, 8); if (o) o.frequency.exponentialRampToValueAtTime(104, audio.currentTime + 1.5);
  [[1.52, .3, 6, .15], [2.13, .22, 5, .3], [2.8, .14, 4, .45], [3.6, .09, 3, .6], [4.9, .05, 2.2, .7]].forEach(([r, p, d, s]) => ping(110 * r, p * v, d, 0, s));
}
// a bulbul's call: a few quick whistled notes sliding up or down
function bird(v) {
  const base = rand(1800, 3400), n = 2 + (Math.random() * 4 | 0);
  for (let i = 0; i < n; i++) { const o = ping(base * rand(.85, 1.2), v, .12, i * rand(.1, .16), .01); if (o) o.frequency.exponentialRampToValueAtTime(base * rand(.7, 1.5), audio.currentTime + i * .13 + .09); }
}
const crickets = v => { const f = rand(4100, 4700); for (let i = 0; i < 3; i++) ping(f, v, .04, i * .06); };
// far thunder in heavy rain: a burst of noise through a low filter
function thunder(v) {
  const a = audio, t = a.currentTime, s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  s.buffer = amb.buf; s.loop = true; fl.type = "lowpass"; fl.frequency.value = 140;
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .4); g.gain.exponentialRampToValueAtTime(.0001, t + 5);
  s.connect(fl); fl.connect(g); g.connect(amb.out); s.start(t, Math.random()); s.stop(t + 5.1);
}
function ambStep(dt) {
  if (!amb) return;
  const a = audio, on = $("soundOn").checked, T = a.currentTime;
  amb.out.gain.setTargetAtTime(on ? CONFIG.ambience.volume : 0, T, .3);
  if (!on) return;
  const S = temple.sounds, p = camera.position, out = current === "pagoda" || inCorridor, day = daylight > .5;
  const near = (d, r0, r1) => clamp(1 - (d - r0) / (r1 - r0), 0, 1);   // 1 within r0 metres, fading to nothing at r1
  const toRect = ([x0, x1, z0, z1]) => Math.hypot(Math.max(x0 - p.x, 0, p.x - x1), Math.max(z0 - p.z, 0, p.z - z1));
  const gust = .55 + .25 * Math.sin(now * .31) + .2 * Math.sin(now * .83 + 1), wind = (.4 + .6 * wx.wind) * gust, wet = wx.rain;
  let leaves = 0, field = 0, water = 0, forest = 0, stupa = 0;
  if (out) {
    leaves = near(Math.hypot(p.x - S.banyan[0], p.z - S.banyan[1]), 5, 25);
    field = near(toRect(S.fields), 0, 25);
    water = p.x > S.river[0] - 10 && p.x < S.river[1] + 10 ? near(Math.abs(p.z - S.riverZ(p.x)), 3, 32) : 0;
    forest = clamp((S.forestZ + 20 - p.z) / 25, 0, 1);   // from 20 m short of the trees to a few metres in
    stupa = near(Math.hypot(p.x - S.stupa[0], p.y - S.stupa[1], p.z - S.stupa[2]), 14, 50);
  }
  const set = (b, v) => b.g.gain.setTargetAtTime(v, T, .5);
  set(amb.water, .3 * water); set(amb.water2, .08 * water);
  set(amb.cicada, day && wet < .5 && out ? .02 + .05 * forest : 0);
  set(amb.rain, .28 * wet * (out ? 1 : .35));
  amb.rain.fs[1].frequency.setTargetAtTime(out ? 4200 : 900, T, .3);   // muffled by the roof indoors
  // the one-off sounds, each on its own timer
  const due = (k, a0, a1) => (amb.next[k] -= dt) < 0 && (amb.next[k] = rand(a0, a1), true);
  // every wind follows one pattern: a breath of soft breeze for a few seconds, swelling in and dying away, then stillness
  // (shorter in windy weather). At night each breath carries a faint low moan, falling as it fades
  const breath = (b, len, gap, moan, level) => {
    if (b.left > 0) b.left -= dt;
    else if ((b.wait -= dt) < 0) {
      b.left = rand(...len); b.wait = rand(gap[0], gap[1] - (gap[1] - gap[0]) * .6 * wx.wind);
      if (!day && level > .05) { const f = rand(...moan), o = ping(f, .01 * level, b.left + 1, 0, b.left * .45); if (o) o.frequency.linearRampToValueAtTime(f * .9, T + b.left + 1); }
    }
    return b.left > 0 ? 1 : 0;
  };
  const tree = breath(amb.breaths.banyan, [2.5, 5.5], [5, 14], [300, 420], leaves);   // through the banyan's hanging roots
  const open = breath(amb.breaths.field, [3, 7], [6, 18], [200, 300], field);          // across the paddies, and faintly anywhere outside
  const hill = breath(amb.breaths.hill, [2, 5], [4, 12], [260, 360], stupa);           // round the stupas on the hilltop
  const soft = .6 + .4 * gust;
  amb.leaves.g.gain.setTargetAtTime(.16 * leaves * soft * tree, T, 1.2);
  amb.wind.g.gain.setTargetAtTime(((.13 * field + (out ? .02 : 0)) * open + .1 * stupa * hill) * wind, T, 1.4);
  amb.rice.g.gain.setTargetAtTime(.025 * field * wind * open, T, 1.4);
  // the hti bells ring as a breath passes over the hilltop, and only now and then in the stillness between
  if (stupa > .02 && due("tink", hill ? .12 : 3, hill ? 1.2 : 9)) tinkle(.06 * stupa * (hill ? soft : .5));
  const birds = out && day && wet < .5 ? Math.max(forest, .2) : 0;
  if (birds && due("bird", 1.2, 5)) bird(.035 * birds);
  if (out && !day && due("cricket", .25, .9)) crickets(.012 * Math.max(forest, field, .35));
  const [b0, b1] = CONFIG.ambience.bellEvery, [g0, g1] = CONFIG.ambience.gongEvery, inYard = d => out ? near(d, 8, 75) : .12;
  if (due("bell", b0, b1)) templeBell(current === "bell" ? 1 : .6 * inYard(Math.hypot(p.x - S.bell[0], p.z - S.bell[1])));
  if (due("gong", g0, g1)) gong(current === "library" ? 1 : .6 * inYard(Math.hypot(p.x - S.gong[0], p.z - S.gong[1])));
  if (wet > .7 && due("thunder", 25, 70)) thunder(.35 * (out ? 1 : .5));
}
// the sound starts with the first tap or key (browsers keep audio off until then); off in a hidden tab
["pointerdown", "keydown"].forEach(ev => addEventListener(ev, ambStart, { passive: true }));
document.addEventListener("visibilitychange", () => { if (audio) document.hidden ? audio.suspend() : audio.resume(); });
function soundButton() {
  const on = $("soundOn").checked, b = $("soundBtn");
  b.textContent = on ? "🔊 Sound" : "🔇 Sound"; b.title = on ? "Turn sound off" : "Turn sound on"; b.setAttribute("aria-pressed", String(on));
}
$("soundOn").addEventListener("change", () => { soundButton(); ambStart(); });
$("soundBtn").addEventListener("click", () => { $("soundOn").checked = !$("soundOn").checked; soundButton(); ambStart(); });

// indoors the camera may pull well back, but never through a wall, the floor or the ceiling
function keepInside() {
  if (current === "pagoda" && !inMarket) {   // outside, never sink into the stupa hill
    const p = camera.position, h = temple.groundAt(p.x, p.z) + 2;
    if (p.y < h) p.y = h;
    return;
  }
  if (current === "pagoda" || inCorridor || inStairs) return;
  const p = camera.position;
  p.set(clamp(p.x, -7.0, 7.0), clamp(p.y, .5, 6.5), clamp(p.z, -5.1, 7.1));
}
// zoom buttons, for anyone without a scroll wheel or pinch
function zoom(f) {
  const off = camera.position.clone().sub(controls.target), d = clamp(off.length() * f, controls.minDistance, controls.maxDistance);
  const p0 = camera.position.clone(), p1 = controls.target.clone().add(off.setLength(d));
  tween(reduceMotion ? .01 : .35, t => camera.position.lerpVectors(p0, p1, easeOut(t)));
}
$("zoomOut").addEventListener("click", () => zoom(1.35));
$("zoomIn").addEventListener("click", () => zoom(1 / 1.35));
/* ---------- the four-animal top (လေးကောင်ဂျင်) in the seven-day market: festival tokens only, kept in this browser ---------- */
const TG_KEY = "lotus-altar-tokens", TG_START = 20;
let tgTokens = TG_START, tgPick = "red", tgStake = 1, tgOpen = false, tgCam = null;
try { const v = parseInt(localStorage.getItem(TG_KEY), 10); if (v >= 0) tgTokens = v; } catch (e) {}
const tgSave = () => { try { localStorage.setItem(TG_KEY, String(tgTokens)); } catch (e) {} };
const TG_PICKS = [
  { key: "rooster", my: "ကြက်", en: "Rooster", color: "red" }, { key: "pig", my: "ဝက်", en: "Pig", color: "red" }, { key: "red", my: "အနီ", en: "Red · land", color: "red" },
  { key: "frog", my: "ဖား", en: "Frog", color: "black" }, { key: "eel", my: "ငါးရှဉ့်", en: "Eel", color: "black" }, { key: "black", my: "အမည်း", en: "Black · water", color: "black" }
];
const tgPays = k => k === "red" || k === "black" ? 1 : 3;
TG_PICKS.forEach(p => {
  const b = document.createElement("button");
  b.type = "button"; b.className = p.color; b.setAttribute("role", "radio"); b.dataset.k = p.key;
  b.innerHTML = `<span lang="my">${p.my}</span>${p.en}`;
  b.addEventListener("click", () => { tgPick = p.key; tgRender(); });
  $("tgFaces").appendChild(b);
});
function tgRender() {
  const game = temple.fourTop, busy = !!(game && game.busy);
  document.querySelectorAll("#tgFaces button").forEach(b => { b.setAttribute("aria-checked", String(b.dataset.k === tgPick)); b.disabled = busy; });
  tgStake = clamp(tgStake, 1, Math.max(1, Math.min(10, tgTokens)));
  $("tgStake").textContent = tgStake; $("tgTokens").textContent = tgTokens;
  $("tgLess").disabled = busy || tgStake <= 1; $("tgMore").disabled = busy || tgStake >= Math.min(10, tgTokens);
  const broke = tgTokens <= 0;
  $("tgSpin").textContent = broke ? "Take 20 more festival tokens" : busy ? "Spinning…" : `Spin the top · stake ${tgStake}`;
  $("tgSpin").disabled = busy;
}
$("tgLess").addEventListener("click", () => { tgStake--; tgRender(); });
$("tgMore").addEventListener("click", () => { tgStake++; tgRender(); });
$("tgSpin").addEventListener("click", () => {
  const game = temple.fourTop; if (!game || game.busy) return;
  if (tgTokens <= 0) { tgTokens = TG_START; tgSave(); $("tgMsg").textContent = "The stall keeper hands you another 20 festival tokens."; tgRender(); return; }
  tgTokens -= tgStake; tgSave(); ac();
  game.spin(tgPick);
  $("tgMsg").textContent = "The cover comes down and the top spins…";
  tgRender();
});
function tgHook(game) {
  if (!game || game.options.onResult) return;
  game.options.onSound = n => {
    if (!$("soundOn").checked) return;
    if (n === "cover") tone(180, 140, .25, .25, "triangle");
    else if (n === "spin") { for (let i = 0; i < 10; i++) tone(520 + i * 15, null, .05 * (1 - i / 10), .08, "square", i * .22); }
    else if (n === "tip") tone(240, 120, .4, .2, "triangle");
    else if (n === "lift") tone(300, 420, .2, .25, "sine");
  };
  game.options.onResult = (face, won, pick) => {
    const pays = tgPays(pick), win = won ? tgStake * (pays + 1) : 0;
    tgTokens += win; tgSave();
    const p = TG_PICKS.find(x => x.key === pick), side = face.color === "red" ? "red, a land animal" : "black, a water animal";
    $("tgMsg").textContent = `${face.my} ${face.en} lies face up (${side}). ` + (won ? `Your ${p.en.toLowerCase()} wins ${tgStake * pays} tokens.` : `Your ${p.en.toLowerCase()} loses this round.`);
    tgRender();
  };
}
function openTopGame() {
  const game = temple.fourTop; if (!game) return;
  tgHook(game);
  const at = game.group.position;
  $("topGame").hidden = false; tgOpen = true;
  $("tgMsg").textContent = tgTokens > 0 ? "" : "You have no tokens left.";
  tgRender();
  // bring the camera down to the mat
  tgCam = { min: controls.minDistance, max: controls.maxDistance, minP: controls.minPolarAngle };
  Object.assign(controls, { minDistance: 1.6, maxDistance: 8, minPolarAngle: .3 });
  const p0 = camera.position.clone(), t0 = controls.target.clone(), p1 = V(at.x - 2.9, 1.85, at.z + .9), t1 = V(at.x + .35, .2, at.z + .55);   // standing at the mat's west edge, looking down at it
  tween(reduceMotion ? .01 : 1.4, t => { const e = easeInOut(t); camera.position.lerpVectors(p0, p1, e); controls.target.lerpVectors(t0, t1, e); });
  $("tgSpin").focus();
}
function closeTopGame(silent) {
  if (!tgOpen) return;
  tgOpen = false; $("topGame").hidden = true;
  if (tgCam && !silent) Object.assign(controls, { minDistance: tgCam.min, maxDistance: tgCam.max, minPolarAngle: tgCam.minP });   // when changing place, applyMode sets the limits
  tgCam = null;
  if (!silent && inMarket) { const y = eyeAt(camera.position.x, camera.position.z); lookFrom(V(camera.position.x, y, camera.position.z), controls.target.clone().setY(y)); return; }
  if (!silent && current === "pagoda") {
    const p0 = camera.position.clone(), t0 = controls.target.clone(), p1 = V(...CONFIG.camera.pagoda.pos), t1 = V(...CONFIG.camera.pagoda.target);
    tween(reduceMotion ? .01 : 1.4, t => { const e = easeInOut(t); camera.position.lerpVectors(p0, p1, e); controls.target.lerpVectors(t0, t1, e); });
  }
}
$("tgClose").addEventListener("click", () => closeTopGame(false));
document.addEventListener("keydown", e => { if (e.key === "Escape" && tgOpen) closeTopGame(false); });
/* ---------- the action bar: Buy, Offer, Donate, Recite, Fortune each open a small sheet over the scene ---------- */
const SHEET_TITLES = { buy: "Buy offerings", offer: "Offer at Guanyin's altar", donate: "Donate", recite: "Recite", fortune: "Fortune sticks" };
let sheet = null;
function openSheet(name) {
  sheet = name;
  $("panel").hidden = !name;
  document.querySelectorAll("#actions button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.sheet === name)));
  if (!name) return;
  $("sheetTitle").textContent = SHEET_TITLES[name];
  document.querySelectorAll("#panel [data-sheet]").forEach(el => el.classList.toggle("on", el.dataset.sheet.split(" ").includes(name)));
  $("panel").scrollTop = 0;
  if (typeof render === "function") render();
}
document.querySelectorAll("#actions button").forEach(b => b.addEventListener("click", () => openSheet(sheet === b.dataset.sheet ? null : b.dataset.sheet)));
$("sheetClose").addEventListener("click", () => openSheet(null));
document.addEventListener("keydown", e => { if (e.key === "Escape" && sheet && !tgOpen) openSheet(null); });
// kept for the walking modes, which clear the screen: hiding closes whatever sheet is open
let panelHidden = true;
function setPanel(hidden) { panelHidden = hidden; if (hidden) openSheet(null); }

/* ---------- walking through the seven-day market at eye level ---------- */
const EYE = 1.65, WALK = 2.6;   // eye height and walking speed (m/s): an unhurried temple pace
let inMarket = false, panelBefore = false, walkTween = null;
const keys = new Set(), padMoves = new Set();
const MARKET_LOOK = { minDistance: .05, maxDistance: .05, minPolarAngle: .45, maxPolarAngle: 2.4, minAzimuthAngle: -Infinity, maxAzimuthAngle: Infinity };
// stand at `pos` looking toward `at`: OrbitControls round a target a few centimetres ahead gives a look-around
function lookFrom(pos, at) {
  const dir = at.clone().sub(pos); dir.y = 0; if (dir.lengthSq() < 1e-6) dir.set(0, 0, -1);
  camera.position.copy(pos); controls.target.copy(pos).addScaledVector(dir.normalize(), .05);
  Object.assign(controls, MARKET_LOOK, { enableZoom: false });
  camera.fov = 65; camera.updateProjectionMatrix();   // a natural field of view on foot; the overhead views keep 42°
  controls.update();
}
// first person: walk the grounds at eye height, anywhere on the land; the market is one place to start
const WORLD_R = 225;   // how far from the temple a walker may go
const eyeAt = (x, z) => { const h = temple.walkAt(x, z); return (h === null ? temple.terrainAt(x, z) : h) + EYE; };
function enterWalk(at, look, where) {
  if (inMarket) { const p1 = V(at[0], eyeAt(at[0], at[1]), at[1]); lookFrom(p1, V(look[0], p1.y, look[1])); return; }
  inMarket = true; setPanel(true);
  document.querySelector(".app").classList.add("in-market");
  const p0 = camera.position.clone(), t0 = controls.target.clone(), p1 = V(at[0], eyeAt(at[0], at[1]), at[1]), t1 = V(look[0], p1.y, look[1]);
  Object.assign(controls, { minDistance: .01, maxDistance: 400, minPolarAngle: 0, maxPolarAngle: Math.PI });
  [world.fog.near, world.fog.far] = CONFIG.fog.walk;
  tween(reduceMotion ? .01 : 1.8, t => { const e = easeInOut(t); camera.position.lerpVectors(p0, p1, e); controls.target.lerpVectors(t0, t1, e); }, () => lookFrom(p1, t1));
  $("marketBtn").hidden = true; $("fpBtn").hidden = true; $("leaveMarketBtn").hidden = false; $("outsideBtn").hidden = true; $("walkPad").hidden = false;
  $("where").innerHTML = where;
  $("hint").textContent = "First-person view. Drag to look around. Walk with the arrow keys, W A S D or the pad. Tap a door or building to go in. At night, T or the torch button switches your torch on and off. The four-animal top (လေးကောင်ဂျင်) is in the gambling hall on the east edge of the seven-day market.";
}
function enterMarket() { const M = temple.market; if (M) enterWalk(M.entry, M.look, `<b lang="my">ဈေး</b>The seven-day market`); }
function enterFirstPerson() { enterWalk([0, 52], [0, 40], "Walking the temple grounds"); }
function leaveMarketState() {
  inMarket = false; walkTween = null; keys.clear(); padMoves.clear();
  document.querySelector(".app").classList.remove("in-market");
  controls.enableZoom = true;
  $("leaveMarketBtn").hidden = true; $("outsideBtn").hidden = false;
}
$("fpBtn").addEventListener("click", () => { if (current === "pagoda") enterFirstPerson(); else goTo("pagoda", enterFirstPerson); });
$("marketBtn").addEventListener("click", () => { if (current === "pagoda") enterMarket(); else goTo("pagoda", enterMarket); });
$("leaveMarketBtn").addEventListener("click", () => { closeTopGame(true); leaveMarketState(); if (typeof current === "number") goTo("pagoda"); else applyMode(current); });   // from a pagoda floor, out to the overview
function walkTo(p) {
  if (!p || !inMarket || tgOpen) return;
  walkTween = { to: V(p.x, 0, p.z), speed: WALK };
}
const TURN = 1.6;   // radians a second at full turn
let turnVel = 0, seated = false;
// sit on the pavilion's pond-side bench, eyes at seated height, looking out over the water
function sitInPavilion() {
  const seat = temple.pavilionSeat; if (!seat) return;
  const sit = () => {
    seated = true;
    const p0 = camera.position.clone(), t0 = controls.target.clone(), p1 = seat.pos.clone(), t1 = seat.look.clone();
    Object.assign(controls, { minDistance: .01, maxDistance: 400, minPolarAngle: 0, maxPolarAngle: Math.PI });
    tween(reduceMotion ? .01 : 1.6, t => { const e = easeInOut(t); camera.position.lerpVectors(p0, p1, e); controls.target.lerpVectors(t0, t1, e); }, () => {
      lookFrom(p1, t1);
      const off = t1.clone().sub(p1).normalize(); controls.target.copy(p1).addScaledVector(off, .05); controls.update();   // keep the downward glance at the water
    });
    $("where").innerHTML = "Sitting in the lotus-viewing pavilion";
    toast("You sit on the bench and watch the pond: the koi turn under the lotus, and the lamps drift by. Walk to stand up.");
  };
  if (inMarket) sit(); else enterWalk([seat.pos.x, seat.pos.z], [seat.look.x, seat.look.z], ""), setTimeout(sit, reduceMotion ? 0 : 1850);
}
// called every frame: keys and the pad move the walker in every view; in the market a tap also sets a point to walk to
function walkStep(dt) {
  if (tgOpen || moving || closeUp) return;
  const fwd = controls.target.clone().sub(camera.position); fwd.y = 0;
  if (fwd.lengthSq() < 1e-8) return;
  fwd.normalize();
  const right = V(-fwd.z, 0, fwd.x), move = V(0, 0, 0);
  const on = k => keys.has(k) || padMoves.has(k);
  // turning: ◀ ▶, ← →, Q E ease up to a steady turn rate and ease off when released
  const want = (on("tr") ? 1 : 0) - (on("tl") ? 1 : 0);
  turnVel += (want * TURN - turnVel) * Math.min(1, dt * 6);
  if (Math.abs(turnVel) > 1e-3) {
    if (inMarket || inCorridor || inStairs) {   // first person: turn the head, the target swings round the eye
      const off = controls.target.clone().sub(camera.position);
      off.applyAxisAngle(V(0, 1, 0), -turnVel * dt);
      controls.target.copy(camera.position).add(off);
    } else {          // overhead and in the halls: circle round what you are looking at
      const off = camera.position.clone().sub(controls.target);
      off.applyAxisAngle(V(0, 1, 0), turnVel * dt);
      camera.position.copy(controls.target).add(off);
    }
    fwd.applyAxisAngle(V(0, 1, 0), -turnVel * dt); right.set(-fwd.z, 0, fwd.x);
  }
  if (inStairs) return;   // in the stair room you turn but do not walk: the stairs and buttons take you up or down
  if (on("f")) move.add(fwd); if (on("b")) move.sub(fwd); if (on("r")) move.add(right); if (on("l")) move.sub(right);
  if (move.lengthSq()) walkTween = null;
  else if (walkTween) {
    const d = walkTween.to.clone().sub(camera.position); d.y = 0;
    if (d.length() < .15) walkTween = null; else move.copy(d.normalize());
  }
  if (!move.lengthSq()) return;
  const out = current === "pagoda";
  move.normalize().multiplyScalar((inMarket || inCorridor ? (out ? WALK : 1.8) : out ? 16 : 2.6) * dt);
  if (inCorridor) {   // walking the balcony: stay on the ring between the hall's walls and the outer railing
    const R = temple.corridorRing; if (!R) return;
    const p = camera.position, m = .45;
    let nx = clamp(p.x + move.x, -R.OX + m, R.OX - m), nz = clamp(p.z + move.z, R.OZ0 + m, R.OZ1 - m);
    if (Math.abs(nx) < R.HX + m && nz > R.HZ0 - m && nz < R.HZ1 + m) {   // stepped into the hall's footprint: slide along the wall instead
      if (!(Math.abs(p.x) < R.HX + m)) nx = Math.sign(p.x) * (R.HX + m); else nz = p.z > (R.HZ0 + R.HZ1) / 2 ? R.HZ1 + m : R.HZ0 - m;
    }
    const dx = nx - p.x, dz = nz - p.z; p.x += dx; p.z += dz; controls.target.x += dx; controls.target.z += dz;
    return;
  }
  if (inMarket && current !== "pagoda") {   // on foot in a hall: walk the floor at eye height, kept inside the walls
    const p = camera.position, blocked = (x, z) => temple.indoorBlocked(current, x, z);
    let nx = clamp(p.x + move.x, -6.6, 6.6), nz = clamp(p.z + move.z, -4.7, 6.8);
    if (blocked(nx, nz)) { if (!blocked(nx, p.z)) nz = p.z; else if (!blocked(p.x, nz)) nx = p.x; else return; }   // slide along furniture
    const dx = nx - p.x, dz = nz - p.z;
    p.x = nx; p.z = nz; p.y = EYE; controls.target.x += dx; controls.target.z += dz;
    return;
  }
  if (!inMarket) {   // the outside view glides over the grounds; in a hall you walk the floor, kept inside the walls
    const p = camera.position, t = controls.target;
    p.add(move); t.add(move);
    if (out) {
      const r = Math.hypot(t.x, t.z), lim = 110;
      if (r > lim) { const k = lim / r, dx = t.x * k - t.x, dz = t.z * k - t.z; t.x += dx; t.z += dz; p.x += dx; p.z += dz; }
    } else { t.set(clamp(t.x, -6.8, 6.8), t.y, clamp(t.z, -4.9, 6.9)); keepInside(); }
    return;
  }
  const p = camera.position;
  if (seated) seated = false;   // walking off stands you up from the bench
  let nx = p.x + move.x, nz = p.z + move.z;
  const r = Math.hypot(nx, nz); if (r > WORLD_R) { nx *= WORLD_R / r; nz *= WORLD_R / r; }
  // stay off the water and out of the benches: if the step is blocked, slide along whichever axis is free
  // stay off the water and out of walls, posts and benches, and never step up more than a stair's height at once:
  // if the step is blocked, slide along whichever axis is free
  const h0 = temple.walkAt(p.x, p.z), ok = (x, z) => { const h = temple.walkAt(x, z); return h0 === null || h !== null && Math.abs(h - h0) < .45; };   // no climbing walls or stepping off ledges; anyone caught inside something can always step out
  if (!ok(nx, nz)) {
    if (ok(nx, p.z)) nz = p.z; else if (ok(p.x, nz)) nx = p.x; else return;
  }
  // eye height eases toward the ground's, so stairs and the bridge's hump read as a smooth climb, not a jolt
  const target = eyeAt(nx, nz), ny = p.y + (target - p.y) * Math.min(1, dt * 9), dx = nx - p.x, dz = nz - p.z, dy = ny - p.y;
  p.set(nx, ny, nz); controls.target.x += dx; controls.target.z += dz; controls.target.y += dy;
}
const KEYMAP = { ArrowUp: "f", KeyW: "f", ArrowDown: "b", KeyS: "b", ArrowLeft: "tl", KeyQ: "tl", ArrowRight: "tr", KeyE: "tr", KeyA: "l", KeyD: "r" };
document.addEventListener("keydown", e => { if (!KEYMAP[e.code] || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return; keys.add(KEYMAP[e.code]); e.preventDefault(); });
document.addEventListener("keyup", e => { if (KEYMAP[e.code]) keys.delete(KEYMAP[e.code]); });
window.addEventListener("blur", () => { keys.clear(); padMoves.clear(); });
document.querySelectorAll("#walkPad button").forEach(b => {
  const on = e => { e.preventDefault(); padMoves.add(b.dataset.move); b.classList.add("on"); b.setPointerCapture && b.setPointerCapture(e.pointerId); };
  const off = () => { padMoves.delete(b.dataset.move); b.classList.remove("on"); };
  b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("lostpointercapture", off);
});
let moving = false;
function goTo(mode, then) {
  if (mode === current) { if (then) then(); return; }
  if (moving) return;
  moving = true;
  const fade = $("fade"), f = placeInfo(mode);
  $("fadeName").textContent = f.label;
  fade.hidden = false;
  const wait = reduceMotion ? 0 : 380;
  requestAnimationFrame(() => fade.classList.add("on"));
  setTimeout(() => {
    applyMode(mode);
    setTimeout(() => {
      fade.classList.remove("on");
      setTimeout(() => { fade.hidden = true; moving = false; if (then) then(); }, wait);
    }, reduceMotion ? 0 : 420);
  }, wait);
}
const inHall = fn => (...a) => goTo(1, () => fn(...a));   // offerings, chanting and fortunes happen in the main hall
(() => {
  const nav = $("floors");
  for (let n = CONFIG.floors.length; n >= 1; n--) {
    const f = CONFIG.floors[n - 1], b = document.createElement("button");
    b.type = "button"; b.id = "floor" + n; b.dataset.f = String(n);
    b.setAttribute("aria-label", `${n}F ${f.name}`); b.title = `${n}F · ${f.name}`;
    b.innerHTML = `${n}${f.statue ? "<i></i>" : ""}`;
    b.addEventListener("click", () => goTo(n));
    nav.appendChild(b);
  }
  $("toPagoda").addEventListener("click", () => goTo("pagoda"));
  $("outsideBtn").addEventListener("click", () => goTo(current === "pagoda" ? 1 : "pagoda"));
  // the two buildings beside the pagoda, under the floor buttons
  Object.entries(CONFIG.places).forEach(([key, pl]) => {
    const b = document.createElement("button");
    b.type = "button"; b.id = "place-" + key; b.className = nav.querySelector(".fl-place") ? "fl-place" : "fl-place first"; b.dataset.f = key;
    b.setAttribute("aria-label", pl.name); b.title = pl.name;
    b.textContent = { bell: "Bell", library: "Hall", shop: "Shop" }[key] || pl.name.split(" ")[0];
    b.addEventListener("click", () => goTo(key));
    nav.appendChild(b);
  });
})();

/* ---------- loop ---------- */
let inCorridor = false, inStairs = false, arriveInStairs = false;   // where the camera stands within a floor (set by setView)
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const base = inMarket || inCorridor ? 65 : 42;   // on foot the view is wider
  camera.fov = camera.aspect < 1 ? Math.min(80, base + (1 - camera.aspect) * 40) : base;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage); resize();

const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), .05); now += dt;
  const motion = reduceMotion ? .25 : 1;
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i], p = (now - tw.t0) / tw.dur;
    if (p < 0) continue;
    tw.fn(Math.min(p, 1));
    if (p >= 1) { tweens.splice(i, 1); tw.done && tw.done(); }
  }
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i]; b.life += dt;
    const a = b.pts.geometry.attributes.position;
    b.vel.forEach((v, k) => { v.y -= 1.4 * dt; a.array[k*3] += v.x * dt; a.array[k*3+1] += v.y * dt; a.array[k*3+2] += v.z * dt; });
    a.needsUpdate = true; b.pts.material.opacity = Math.max(0, 1 - b.life / 1.3);
    if (b.life > 1.3) { scene.remove(b.pts); b.pts.geometry.dispose(); bursts.splice(i, 1); }
  }
  const da = dust.geometry.attributes.position;
  for (let i = 0; i < da.count; i++) {
    da.array[i*3+1] += dt * .06 * motion; da.array[i*3] += Math.sin(now * .3 + i) * dt * .02 * motion;
    if (da.array[i*3+1] > 6) da.array[i*3+1] = 0;
  }
  da.needsUpdate = true;
  // smoke drifts up from a random lit incense tip
  smoke.forEach((p, i) => {
    p.age += dt * motion;
    if (p.age > 4 || !p.origin) {
      p.age %= 4;
      const lit = embers.filter(e => e.material.opacity > .5);
      p.origin = lit.length ? lit[(Math.random() * lit.length) | 0].getWorldPosition(new THREE.Vector3()) : null;
    }
    if (!p.origin) { p.s.material.opacity = 0; return; }
    const k = p.age / 4;
    p.s.position.set(p.origin.x + Math.sin(p.age * 1.6 + i) * .05 * (1 + k * 4), p.origin.y + p.age * .4, p.origin.z + Math.cos(p.age * 1.1 + i) * .03 * k * 4);
    p.s.scale.setScalar(.04 + k * .45); p.s.material.opacity = .2 * Math.sin(Math.PI * k);
  });
  embers.forEach((e, i) => { if (e.material.opacity > .5) e.scale.setScalar(.045 + Math.sin(now * 3 + i) * .008); });
  flames.forEach(c => {
    const f = Math.sin(now * 9 + c.seed) * .5 + Math.sin(now * 23 + c.seed * 3) * .3 + (Math.random() - .5) * .3;
    const on = c.on;
    if (c.light) c.light.intensity = (1.1 + f * .25 * motion) * on;
    c.flame.scale.set(on, (2 + f * .3 * motion) * on || .001, on);
    c.g.material.opacity = (.75 + f * .12) * on;
  });
  glowBoost = Math.max(0, glowBoost - dt * .8);
  aureole.rotation.z += dt * .03 * motion;
  aureole.material.opacity = .5 + Math.sin(now * .8) * .05 + glowBoost * .25;
  headGlow.material.opacity = .18 + glowBoost * .3;
  backGlow.intensity = 1.2 + glowBoost * 1.2;
  lanterns.forEach((l, i) => l.rotation.z = Math.sin(now * .7 + i * 2) * .03 * motion);
  controls.update();
  keepInside();
  walkStep(dt);
  aimPrompt(dt);
  festStep(dt);
  weatherStep(dt);
  ambStep(dt);
  temple.update(dt, now, current, motion, camera.position);
  temple.cull(camera, stage.clientHeight);
  renderer.render(world, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- picking ---------- */
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), tip = $("tip");
const TIP = { flower: "Add flowers", water: "Add a bowl of water", fruit: "Add fruit", candle: "Light a candle", incense: "Offer incense", fortune: "Shake the fortune sticks", chant: "Recite Nāmó Ēmítuófó" };
let lastHit = null;
function pick(e) {
  const r = canvas.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const list = (current === 1 ? clickables : temple.clickables(current)).filter(o => !!o.userData.inStairs === inStairs || o.userData.stairDoor);
  const hit = ray.intersectObjects(list, false)[0];
  lastHit = hit ? hit.point.clone() : null;
  return hit ? hit.object : null;
}
canvas.addEventListener("pointermove", e => {
  if (e.pointerType !== "mouse" || moving) return;
  if (inMarket) { tip.hidden = true; return; }   // on foot, the aiming dot's prompt does the labelling
  const o = pick(e), label = o && (inStairs && o.userData.stairDoor ? "Back to the hall" : o.userData.tip || TIP[o.userData.item]);
  temple.hover(o); canvas.classList.toggle("hovering", !!label);
  tip.hidden = !label;
  if (label) { const r = stage.getBoundingClientRect(); tip.textContent = noHan(label); tip.style.left = (e.clientX - r.left) + "px"; tip.style.top = (e.clientY - r.top) + "px"; }
});
canvas.addEventListener("pointerleave", () => { tip.hidden = true; });
let down = null;
canvas.addEventListener("pointerdown", e => { down = [e.clientX, e.clientY]; });
// Space (or Enter) uses whatever is straight ahead in the centre of the view: a door, the stairs, an altar object, a stall
function pickAhead() {
  const list = (current === 1 ? clickables : temple.clickables(current)).filter(o => !!o.userData.inStairs === inStairs || o.userData.stairDoor);
  camera.updateMatrixWorld();
  // the centre and a small ring round it, so a seam (like the gap between two door leaves) does not miss
  for (const [x, y] of [[0, 0], [.03, 0], [-.03, 0], [0, .03], [0, -.03], [.06, 0], [-.06, 0]]) {
    ray.setFromCamera(ptr.set(x, y), camera);
    const hit = ray.intersectObjects(list, false)[0];
    if (hit && !(inMarket && hit.distance > 14)) { lastHit = hit.point.clone(); return hit.object; }
  }
  return null;
}
document.addEventListener("keydown", e => {
  if ((e.code !== "Space" && e.code !== "Enter") || /INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName) || tgOpen) return;
  e.preventDefault();
  const o = pickAhead();
  if (usable(o)) useObject(o); else toast("Nothing to open here. Face a door, the stairs or an offering and press Space.");
});
canvas.addEventListener("pointerup", e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
  const o = pick(e); if (o) useObject(o);
});
// on foot, a short prompt under the aiming dot names what Space will use, and only when it does something
const usable = o => o && Object.keys(o.userData).some(k => k !== "tip");
let aimT = 0;
function aimPrompt(dt) {
  const el = $("aimTip"); if (!inMarket || moving || tgOpen) { el.hidden = true; return; }
  if ((aimT += dt) < .15) return; aimT = 0;
  const o = pickAhead(), label = usable(o) ? (inStairs && o.userData.stairDoor ? "Back to the hall" : o.userData.tip || TIP[o.userData.item]) : null;
  el.hidden = !label; if (label) el.textContent = "Space · " + noHan(label).replace(/^the /, "");
}
function useObject(o) {
  if (!o || moving) return;
  if (o.userData.stairDoor) { ac(); if (inStairs) setView("hall"); else { const d = o.userData.open(); setTimeout(() => setView("stairs"), d * .5); } return; }
  if (o.userData.climb) { ac(); climb(o.userData.climb); return; }
  if (o.userData.shopItem) { ac(); setQty(o.userData.shopItem, cart[o.userData.shopItem].q + 1); pulse(o.userData.shopItem); toast(`Added ${ITEMS[o.userData.shopItem].name.toLowerCase()} to your basket.`); return; }
  if (current !== 1) {
    ac();
    const r = temple.activate(o, current, lastHit);
    if (r.fourTop) { openTopGame(); return; }
    if (r.pavilion) { sitInPavilion(); return; }
    if (r.market) { if (inMarket) walkTo(lastHit); else enterMarket(); return; }
    if (r.view) { setView(r.view); return; }
    if (r.floor) { moving = !!r.delay; setTimeout(() => { moving = false; goTo(r.floor); }, r.delay || 0); } else if (r.toast) toast(r.toast);
    return;
  }
  const it = o.userData.item;
  if (it === "stairs") { const d = o.userData.open ? o.userData.open() : 0; moving = !!d; setTimeout(() => { moving = false; goTo(o.userData.floor); }, d); return; }
  if (it === "fortune") { drawFortune(); return; }
  if (it === "chant") { chant(); return; }
  offerOne(it);
}

/* ---------- UI ---------- */
const money = n => "$" + n.toLocaleString("en-US");
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
const itemsEl = $("items");
KEYS.forEach(key => {
  const it = ITEMS[key], kinds = Object.entries(it.kinds);
  const el = document.createElement("div"); el.className = "item"; el.dataset.item = key;
  el.innerHTML = `<div class="ico">${it.icon}</div>
    <div class="meta"><div class="name">${it.name}</div><div class="term">${it.term}</div><p class="desc">${it.desc}</p>
      ${kinds.length > 1 ? `<div class="kinds" role="radiogroup" aria-label="${it.name} type">${kinds.map(([k, v]) =>
        `<button type="button" role="radio" id="${key}_${k}" data-k="${k}" aria-checked="false"><i style="background:${v.dot}"></i>${v.name}</button>`).join("")}</div>` : ""}
    </div>
    <div class="buy"><div class="price" id="p_${key}"></div><div class="step">
      <button type="button" id="${key}Minus" data-d="-1" aria-label="Fewer ${it.name.toLowerCase()}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12"/></svg></button><output id="q_${key}">0</output><button type="button" id="${key}Plus" data-d="1" aria-label="More ${it.name.toLowerCase()}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12M12 6v12"/></svg></button>
    </div></div>`;
  el.querySelectorAll(".step button").forEach(b => b.addEventListener("click", () => setQty(key, cart[key].q + Number(b.dataset.d))));
  el.querySelectorAll(".kinds button").forEach(b => b.addEventListener("click", () => { cart[key].k = b.dataset.k; if (!cart[key].q) cart[key].q = 1; render(); }));
  itemsEl.appendChild(el);
});
function pulse(it) {
  const el = document.querySelector(`.item[data-item="${it}"]`);
  el.classList.add("pulse"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("pulse"), 700);
  el.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
}
function setQty(it, v) { cart[it].q = clamp(v, 0, 99); render(); }

const lineItems = items => KEYS.filter(k => items[k] && items[k].q > 0).map(k => {
  const kind = kindOf(k, items[k].k);
  return { text: ITEMS[k].phrase(items[k].q, kind.name), amount: items[k].q * kind.price };
});
const describe = items => lineItems(items).map(l => l.text).join(", ");
const totalOf = items => lineItems(items).reduce((s, l) => s + l.amount, 0);
function fillSummary(linesEl, totalEl) {
  const ls = lineItems(cart);
  linesEl.innerHTML = ls.length ? ls.map(l => `<div class="line"><span>${esc(l.text)}</span><span>${money(l.amount)}</span></div>`).join("")
    : `<div class="line"><span>Nothing in your basket yet</span><span></span></div>`;
  totalEl.textContent = money(totalOf(cart));
}
const inShop = () => current === "shop";
// what is in the bag, as {item: {q, k}} rows (one per kind) and as a count
const bagRows = () => KEYS.flatMap(k => Object.entries(state.bag[k] || {}).filter(([, q]) => q > 0).map(([kind, q]) => ({ key: k, items: { [k]: { q, k: kind } } })));
const bagCount = () => bagRows().reduce((s, r) => s + r.items[r.key].q, 0);
// how many of an offering this visitor has placed on the altar (from their log; the sample entries do not count)
const offeredByMe = k => state.log.reduce((n, r) => n + (r.items && r.items[k] && !r.example ? r.items[k].q : 0), 0);
function render() {
  KEYS.forEach(k => {
    $("q_" + k).textContent = cart[k].q;
    const kind = kindOf(k, cart[k].k);
    $("p_" + k).innerHTML = `${money(kind.price)} <small>${ITEMS[k].per}</small>`;
    document.querySelectorAll(`.item[data-item="${k}"] .kinds button`).forEach(b => b.setAttribute("aria-checked", String(b.dataset.k === cart[k].k)));
    const mine = offeredByMe(k);   // only what this visitor has placed, not the sample altar
    $("t_" + k).textContent = mine; $("t_" + k).closest(".chip").hidden = !mine;
  });
  fillSummary($("lines"), $("total"));
  const shop = inShop(), t = totalOf(cart), n = bagCount();
  $("panel").classList.toggle("in-shop", shop);
  $("reviewBtn").textContent = shop ? (t ? `Buy · ${money(t)}` : "Choose something to buy") : "Go to the temple shop to buy";
  $("reviewBtn").disabled = shop && !t;
  $("shopHint").textContent = shop ? "You are in the shop. Choose what to buy, or tap the shelves." : "Offerings are sold at the temple shop, on the left of the lotus pond. You can fill your basket here and pay there.";
  const rows = bagRows();
  $("bag").innerHTML = rows.length ? rows.map(r => `<div class="line"><span>${esc(describe(r.items))}</span><span></span></div>`).join("")
    : `<div class="line"><span>Your bag is empty. Buy offerings at the shop first.</span><span></span></div>`;
  $("offerBtn").disabled = !n;
  $("bagBadge").hidden = !n; $("bagBadge").textContent = n;
  // the Offer button appears only once something is in the bag; the tally only once something has been offered
  const offerBtnBar = document.querySelector('#actions [data-sheet="offer"]');
  offerBtnBar.hidden = !n;
  if (!n && sheet === "offer") openSheet(null);
  document.querySelector(".tally").hidden = !KEYS.some(k => offeredByMe(k));
  $("offerBtn").textContent = current === 1 ? "Offer everything at Guanyin's altar" : "Go to Guanyin's altar and offer everything";
  // where the visitor is in the journey: buying, carrying, offering
  const stage = shop ? 1 : n ? (current === 1 ? 3 : 2) : 1;
  [1, 2, 3].forEach(i => { const li = $("j" + i); li.classList.toggle("on", i === stage); li.classList.toggle("done", i < stage); });
}
function renderLog() {
  const ul = $("log"); ul.innerHTML = "";
  const rows = state.log.length ? state.log.slice().reverse() : [
    { t: Date.now() - 864e5 * 2, items: { flower: { q: 5, k: "lotus" }, water: { q: 7, k: "pure" }, incense: { q: 1, k: "sandal" } }, ded: "all beings, may they be free from suffering", example: true },
    { t: Date.now() - 864e5 * 9, items: { fruit: { q: 3, k: "mixed" }, candle: { q: 2, k: "red" } }, ded: "", example: true }
  ];
  rows.slice(0, 8).forEach(r => {
    const li = document.createElement("li");
    const when = new Date(r.t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    li.innerHTML = r.donate ? `<span class="when">${when} · Donation</span><span>${money(r.donate)} · ${esc(r.purpose)}${r.name ? " · from " + esc(r.name) : ""}</span>` :
      `<span class="when">${when} · Guanyin's altar${r.example ? ' <span class="tag">Example</span>' : ""}</span>
      <span>${esc(describe(r.items))}</span>
      ${r.ded ? `<span class="ded">For ${esc(r.ded)}</span>` : ""}`;
    ul.appendChild(li);
  });
}

// donating: a demo gift, recorded with the offerings; nothing is charged
let donAmount = 10;
[1, 5, 10, 20].forEach(v => {
  const b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "radio"); b.textContent = money(v); b.dataset.v = v;
  b.addEventListener("click", () => { donAmount = v; donRender(); });
  $("donAmounts").appendChild(b);
});
function donRender() { document.querySelectorAll("#donAmounts button").forEach(b => b.setAttribute("aria-checked", String(+b.dataset.v === donAmount))); $("donBtn").textContent = `Donate ${money(donAmount)}`; }
donRender();
$("donBtn").addEventListener("click", () => {
  const purpose = $("donPurpose").value, name = $("donName").value.trim();
  state.log.push({ t: Date.now(), donate: donAmount, purpose, name });
  save(); renderLog();
  if ($("soundOn").checked) { tone(1046, null, .12, 1.2); tone(1568, null, .06, 1.0, "sine", .08); }
  toast(`Thank you${name ? ", " + name : ""}: ${money(donAmount)} for ${purpose.toLowerCase()}. May the merit return to you. (Demo: nothing was charged.)`);
});
// 1 · buying at the shop
$("reviewBtn").addEventListener("click", () => {
  if (!inShop()) { goTo("shop"); return; }
  fillSummary($("rLines"), $("rTotal"));
  $("orderView").hidden = true; $("reviewView").hidden = false; $("confirmBtn").focus();
});
$("backBtn").addEventListener("click", () => { $("reviewView").hidden = true; $("orderView").hidden = false; });
let toastT;
// the interface shows no Chinese characters: strip them (and the separators they leave) from any text shown over the scene
const noHan = str => String(str).replace(/[\u2E80-\u9FFF\uF900-\uFAFF]+/g, "").replace(/\(\s*\)/g, "").replace(/(\s*·\s*)+/g, " · ").replace(/^\s*·\s*|\s*·\s*$/g, "").replace(/\s{2,}/g, " ").replace(/\s+([,.:])/g, "$1").trim();
function toast(msg) { msg = noHan(msg); const t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3800); }
$("confirmBtn").addEventListener("click", () => {
  const items = {};
  KEYS.forEach(k => { if (cart[k].q) { items[k] = { ...cart[k] }; const b = state.bag[k] = state.bag[k] || {}; b[cart[k].k] = (b[cart[k].k] || 0) + cart[k].q; cart[k].q = 0; } });
  save(); render();
  $("reviewView").hidden = true; $("orderView").hidden = false;
  toast(`Bought ${describe(items)}. They are in your bag: carry them to Guanyin's altar on the pagoda's ground floor.`);
});
// 2 and 3 · placing what is in the bag on Guanyin's altar
const PLACE = {
  incense: (n, k, d) => addIncense(n, k, true, d), candle: (n, k, d) => addCandle(n, k, true, d), flower: (n, k, d) => addFlower(n, k, true, d),
  water: (n, k, d) => addWater(n, k, true, d), fruit: (n, k, d) => addFruit(n, true, d)
};
const ORDER = ["incense", "candle", "flower", "water", "fruit"];
function offerAll() {
  const items = {};
  let delay = 0;
  const stepD = reduceMotion ? .15 : .45;
  ORDER.forEach(k => Object.entries(state.bag[k] || {}).forEach(([kind, q]) => {
    for (let i = 0; i < q; i++) { PLACE[k](state.counts[k]++, kind, delay); delay += stepD * (k === "water" ? .7 : 1); }
    if (q) items[k] = items[k] ? { q: items[k].q + q, k: kind } : { q, k: kind };
  }));
  state.bag = {};
  state.log.push({ t: Date.now(), items, ded: $("dedication").value.trim() });
  save(); render(); renderLog();
  toast(`Offered ${describe(items)}. May Guanyin's compassion be with you.`);
}
$("offerBtn").addEventListener("click", inHall(offerAll));
// one at a time, by tapping the altar
function offerOne(k) {
  const kinds = state.bag[k] || {}, kind = Object.keys(kinds).find(x => kinds[x] > 0);
  if (!kind) { toast(`You have no ${ITEMS[k].name.toLowerCase()} in your bag. Buy them at the temple shop on the left of the lotus pond.`); pulse(k); return; }
  kinds[kind]--;
  PLACE[k](state.counts[k]++, kind, 0);
  const items = { [k]: { q: 1, k: kind } };
  const last = state.log[state.log.length - 1];
  if (last && last.items && Date.now() - last.t < 6e4 && !last.example) { const it = last.items[k]; last.items[k] = it ? { q: it.q + 1, k: it.k } : items[k]; last.t = Date.now(); }
  else state.log.push({ t: Date.now(), items, ded: $("dedication").value.trim() });
  save(); render(); renderLog();
  toast(`Placed ${describe(items)} on the altar.`);
}

/* ---------- fortune verses ---------- */
const GRADE = { top: "Supreme fortune", good: "Very auspicious", mid: "Auspicious", even: "Steady", low: "Take care" };
const FORTUNES = [
  { g: "top", p: ["The moon rises clear above the river,", "A boat drifts home on a gentle tide.", "What you have waited for arrives;", "Open the door and let it in."], a: "A long-awaited matter resolves well. Act now and accept help when it is offered." },
  { g: "good", p: ["Plum blossoms open in the late snow,", "Their fragrance reaches the far hall.", "Patience through the cold season", "Brings spring in its own time."], a: "Results come after a delay. Keep going; the timing is nearly right." },
  { g: "even", p: ["Clouds cover the mountain path,", "The traveller rests beneath a pine.", "Wait until the mist has lifted", "And the road will show itself."], a: "Do not force a decision this week. Gather more information first." },
  { g: "low", p: ["A kite pulls hard against the wind,", "Its string grows thin and frayed.", "Let out the line, do not grip tight,", "Or lose it to the sky."], a: "Loosen your hold on this matter. Pushing harder will cost you more. Rest well." },
  { g: "mid", p: ["Seeds sown in the spring field", "Need water, sun and many days.", "The farmer does not tug the shoots", "But tends the soil and waits."], a: "Steady work pays. Avoid shortcuts in money matters." },
  { g: "top", p: ["A golden carp leaps the dragon gate,", "Thunder rolls and the rain is sweet.", "The scholar's name is called aloud,", "Joy fills every room at home."], a: "Exams, interviews and new ventures go well. Celebrate with family." },
  { g: "even", p: ["The well rope is too short today,", "The bucket swings above the water.", "Tie on a length of new rope", "And drink tomorrow."], a: "Something small is missing. Ask a friend for what you lack." },
  { g: "good", p: ["Two swallows build beneath one roof,", "Their nest grows twig by twig.", "A promise kept in quiet ways", "Becomes a lasting home."], a: "Good for marriage and partnerships. Keep your word in small things." },
  { g: "low", p: ["Night rain on the lonely bridge,", "The lantern gutters in the wind.", "Turn back and wait for morning;", "The far shore is still there."], a: "Postpone travel or large purchases. Wait for a clearer sign." },
  { g: "mid", p: ["A lotus rises from the mud", "Untouched by what it grew from.", "Your trouble is the root", "Of something clean and bright."], a: "A hard situation turns into growth. Stay kind and honest." },
  { g: "even", p: ["Half the moon is lit, half dark,", "The tide is neither high nor low.", "Ask again when the moon is full", "For a fuller answer."], a: "The outcome is not yet decided. Your own effort tips the balance." },
  { g: "top", p: ["Spring wind crosses ten thousand li,", "Every branch puts on green.", "A traveller returns with treasure,", "The village gate swings wide."], a: "Travel, trade and reunions are favoured. Lost things are found." },
  { g: "mid", p: ["An old pine on the cliff edge", "Has stood through a hundred storms.", "Its roots go deep in stone,", "Its needles stay green."], a: "Health holds with care. Stay with what you know well." },
  { g: "low", p: ["Fishing in a dry pond,", "Hunting hares in a frozen field.", "The effort is not wasted", "If you learn to change the place."], a: "You are looking in the wrong place. Change direction rather than trying harder." },
  { g: "good", p: ["Lamps are lit along the river,", "A thousand lights upon the water.", "One kindness given freely", "Returns a thousandfold."], a: "Generosity brings luck now. Help someone without being asked." },
  { g: "even", p: ["The ox walks slowly up the hill,", "The cart is heavy, the road is long.", "It does not stop, it does not hurry;", "By evening it is home."], a: "Slow but sure. Do not compare your pace with others." },
  { g: "mid", p: ["Bamboo bends beneath the snow", "And springs back when the sun appears.", "Bend now, do not break;", "Your straightness will return."], a: "Give way in a dispute. Flexibility wins more than pride." },
  { g: "top", p: ["Guanyin pours the pure water,", "Her willow shakes dew upon the land.", "Fever cools and sorrow lifts,", "The household is at peace."], a: "Recovery from illness and peace at home. Give thanks with an offering." },
  { g: "low", p: ["A crack runs through the wine jar,", "Still it holds for one more day.", "Mend it now while it is small", "Before the feast is lost."], a: "Fix a small problem before it grows. Check your papers and your health." },
  { g: "good", p: ["The crane flies high above the reeds", "And sees the whole marsh at once.", "Rise above the small quarrel", "And the way becomes clear."], a: "Step back to see the bigger picture. A wise elder can help." }
];
function showFortune(n) {
  const f = FORTUNES[(n - 1) % FORTUNES.length];
  $("fHan").textContent = n;
  $("fNum").textContent = `Stick ${n} of 100`;
  $("fGrade").textContent = GRADE[f.g]; $("fGrade").dataset.g = f.g;
  $("fPoem").innerHTML = f.p.map(esc).join("<br>");
  $("fAdvice").textContent = f.a;
  $("fortune").hidden = false;
  $("shakeBtn").disabled = false; $("shakeBtn").textContent = "Shake again";
  $("fortune").scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  toast(`Stick ${n} fell out: ${GRADE[f.g]}`);
}
$("shakeBtn").addEventListener("click", inHall(drawFortune));
$("chantBtn").addEventListener("click", inHall(chant));
// close-up of Guanyin's face and back to the full hall
let closeUp = false;
$("viewBtn").addEventListener("click", () => {
  closeUp = !closeUp;
  const p0 = camera.position.clone(), t0 = controls.target.clone();
  const view = closeUp ? CONFIG.camera.closeUp : CONFIG.camera.full, p1 = V(...view.pos), t1 = V(...view.target);
  tween(reduceMotion ? .01 : 1.3, t => { const e = easeInOut(t); camera.position.lerpVectors(p0, p1, e); controls.target.lerpVectors(t0, t1, e); });
  $("viewBtn").textContent = closeUp ? "Full view" : "Look closer";
});

// out onto the balcony corridor of an upper hall through its lattice doors, and back in
// and into the stair room, where the spiral runs up and down through the floors
const CORRIDOR = { minDistance: .2, maxDistance: 1.4, minPolarAngle: .35, maxPolarAngle: 2.0 };
const STAIR_VIEW = { minDistance: .6, maxDistance: 3.1, minPolarAngle: .2, maxPolarAngle: 2.2, minAzimuthAngle: .6, maxAzimuthAngle: 1.05 };
const HALL_VIEW = () => ({ minDistance: INTERIOR.min, maxDistance: INTERIOR.max, minPolarAngle: INTERIOR.minP, maxPolarAngle: INTERIOR.maxP, minAzimuthAngle: INTERIOR.minA, maxAzimuthAngle: INTERIOR.maxA });
// a quick dip to dark: moving into or out of the small stair room cuts rather than swinging the camera round
function fadeCut(fn) {
  if (reduceMotion) { fn(); return; }
  const f = $("fade"); $("fadeName").textContent = ""; f.hidden = false;
  requestAnimationFrame(() => f.classList.add("on"));
  setTimeout(() => { fn(); f.classList.remove("on"); setTimeout(() => { f.hidden = true; }, 380); }, 260);
}
const STAIR_LOOK = { minDistance: .05, maxDistance: .05, minPolarAngle: .25, maxPolarAngle: 2.6, minAzimuthAngle: -Infinity, maxAzimuthAngle: Infinity };
function setView(v, instant = false) {
  const wasStairs = inStairs;
  // the stair room is seen on foot: stand inside at eye height with the normal field of view, and turn your head
  if (v === "stairs" || (wasStairs && v === "hall")) {
    const go = () => {
      inCorridor = false; inStairs = v === "stairs";
      temple.setBackdrop(0);
      if (wasStairs && !inStairs) temple.openDoor(current);
      if (inStairs) {
        const view = current === CONFIG.floors.length ? CONFIG.camera.stairsTop : CONFIG.camera.stairs, p = V(...view.pos), t = V(...view.target);
        camera.position.copy(p); controls.target.copy(p).addScaledVector(t.sub(p).normalize(), .05);
        Object.assign(controls, STAIR_LOOK, { enableZoom: false });
        camera.fov = 65; camera.updateProjectionMatrix(); controls.update();
        $("hint").textContent = "The stair room. Turn with the arrows or drag to look; use the Up and Down buttons, or face the stairs and press Space. Face the door and press Space to go back.";
      } else {   // back out through the door, standing just in front of it, facing into the hall
        if (!inMarket) stayFirstPerson(current);
        lookFrom(V(-5.6, EYE, -1.3), V(-1, EYE, 3));
        $("hint").textContent = placeInfo(current).hint;
      }
      $("viewBtn").hidden = inStairs || !placeInfo(current).statue;
      closeUp = false; stairButtons();
      $("walkPad").hidden = false;
    };
    if (instant) go(); else fadeCut(go);
    return;
  }
  inCorridor = v === "corridor"; inStairs = v === "stairs";
  temple.setBackdrop(inCorridor ? current : 0);   // the real temple grounds below the balcony
  world.fog.near = inCorridor ? CONFIG.fog.corridor[0] : 13; world.fog.far = inCorridor ? CONFIG.fog.corridor[1] : 28; camera.far = inCorridor ? 500 : 80; camera.updateProjectionMatrix();
  applySky();
  const view = inCorridor ? CONFIG.camera.corridor : inStairs ? (current === CONFIG.floors.length ? CONFIG.camera.stairsTop : CONFIG.camera.stairs) : CONFIG.camera.full;
  const p0 = camera.position.clone(), t0 = controls.target.clone(), p1 = V(...view.pos), t1 = V(...view.target);
  const f0 = camera.fov, f1 = view.fov || 42, limits = inCorridor ? CORRIDOR : inStairs ? STAIR_VIEW : HALL_VIEW();
  if (wasStairs && !inStairs) temple.openDoor(current);   // step back out through the stair-room door
  Object.assign(controls, { minDistance: .1, maxDistance: 30, minPolarAngle: 0, maxPolarAngle: Math.PI, minAzimuthAngle: -Infinity, maxAzimuthAngle: Infinity });   // free while the camera walks through the doors
  const step = t => { const e = easeInOut(t); camera.position.lerpVectors(p0, p1, e); controls.target.lerpVectors(t0, t1, e); camera.fov = f0 + (f1 - f0) * e; camera.updateProjectionMatrix(); };
  if (instant) { step(1); Object.assign(controls, limits, { enableZoom: true }); if (inCorridor) lookFrom(p1, t1); controls.update(); }
  else tween(reduceMotion ? .01 : 1.4, step, () => { Object.assign(controls, limits, { enableZoom: true }); if (inCorridor) lookFrom(p1, t1); });
  const f = placeInfo(current);
  $("hint").textContent = inCorridor ? "The balcony corridor runs right round this storey. Walk it with the arrows or W A S D, turn with ◀ ▶, drag to look; tap the lattice doors to go back inside."
    : inStairs ? "The stair room. The spiral runs through every floor of the pagoda: tap the stairs or a sign to go up or down, or tap the door to go back into the hall." : f.hint;
  $("viewBtn").hidden = inCorridor || inStairs || !f.statue;
  closeUp = false; $("viewBtn").textContent = "Look closer";
  stairButtons();
  if ((inMarket || typeof current === "number") && !inCorridor && !inStairs && v === "hall") setTimeout(() => { if (!inMarket) stayFirstPerson(current); else lookFrom(V(camera.position.x, EYE, camera.position.z), controls.target.clone().setY(EYE)); }, reduceMotion ? 0 : 1450);   // back into a pagoda hall on foot
  $("walkPad").hidden = inStairs;
}
// up or down the spiral, arriving in the stair room of the next floor
function climb(to) { arriveInStairs = true; goTo(to); }
function stairButtons() {
  const n = current, show = inStairs && typeof n === "number";
  $("upBtn").hidden = !show || n >= CONFIG.floors.length; $("downBtn").hidden = !show || n <= 1; $("hallBtn").hidden = !show;
  if (show) { $("upBtn").textContent = `↑ Up to ${n + 1}F`; $("downBtn").textContent = `↓ Down to ${n - 1}F`; }
}
$("upBtn").addEventListener("click", () => climb(current + 1));
$("downBtn").addEventListener("click", () => climb(current - 1));
$("hallBtn").addEventListener("click", () => setView("hall"));

render(); renderLog(); updateChantCount(); applyMode(CONFIG.start);
})();
