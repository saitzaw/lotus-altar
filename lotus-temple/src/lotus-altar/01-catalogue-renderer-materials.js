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
// lamps: every point light in the world is a lamp, a candle or a fire, and by day they all go dark (lampsOn, set in applySky);
// the flames still burn, only their light is gone. Whatever sets a point light's intensity sets it at night strength
let lampsOn = 1;
Object.defineProperty(THREE.PointLight.prototype, "intensity", { get() { return this._night * lampsOn; }, set(v) { this._night = v; }, configurable: true });

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
  sand: std({ color: 0xd9c49a, roughness: .95 }),
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

