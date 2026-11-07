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
const flowers = MAIN.flowers = new Array(FLOWER_SLOTS).fill(null); MAIN.mouth = MOUTH;
function flowerTarget(slot, mouth = MOUTH) {
  const a = (slot / (FLOWER_SLOTS - 1) - .5) * 1.7;
  return V(mouth.x + Math.sin(a) * .24, mouth.y + .2 + Math.cos(a) * .16 + (slot % 2) * .05, mouth.z + ((slot % 3) - 1) * .07);
}
function addFlower(n, kind, animated, delay, alt = MAIN) { const slot = flowerOrder[n % FLOWER_SLOTS]; alt.st.flowers[slot] = kind; placeFlower(slot, kind, animated, delay, alt); }
function placeFlower(slot, kind, animated, delay = 0, alt = MAIN) {
  const P = alt.parent, mouth = alt.mouth, headObj = (FLOWER_MAKERS[kind] || makeLotus)();
  const tgt = flowerTarget(slot, mouth);
  const d = new THREE.Vector3().subVectors(tgt, mouth);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.006, .008, 1, 6), M.stem);
  stem.geometry.translate(0, .5, 0); stem.position.copy(mouth); stem.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
  const len = d.length();
  headObj.quaternion.copy(stem.quaternion);
  const place = () => { const old = alt.flowers[slot]; if (old) P.remove(old.head, old.stem); alt.flowers[slot] = { head: headObj, stem }; };
  if (!animated) { stem.scale.y = len; headObj.position.copy(tgt); headObj.userData.bloom(1); P.add(stem, headObj); place(); return; }
  const start = V(tgt.x * .3, 3.6, 3.6), ctrl = V(tgt.x * .6, 3.4, 1.6);
  stem.scale.y = .0001; headObj.userData.bloom(0);
  tween(1.9, t => {
    if (!headObj.parent) P.add(headObj);
    const e = easeInOut(clamp(t / .75, 0, 1)), u = 1 - e;
    headObj.position.set(u*u*start.x + 2*u*e*ctrl.x + e*e*tgt.x, u*u*start.y + 2*u*e*ctrl.y + e*e*tgt.y, u*u*start.z + 2*u*e*ctrl.z + e*e*tgt.z);
    if (t >= .72) {
      if (!stem.parent) { P.add(stem); place(); }
      stem.scale.y = Math.max(.0001, len * easeOut((t - .72) / .28));
    }
    headObj.userData.bloom(easeOut(clamp((t - .6) / .4, 0, 1)));
  }, () => sparkle(tgt, kind === "rose" ? 0xff7090 : kind === "jasmine" ? 0xffffff : 0xffb0c4, P), delay);
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
function addFruit(n, animated, delay = 0, alt = MAIN) { const slot = n % alt.fruitSlots.length; alt.st.fruit[slot] = n % 4; placeFruit(slot, n % 4, animated, delay, alt); }
function placeFruit(slot, type, animated, delay = 0, alt = MAIN) {
  const P = alt.parent, tgt = alt.fruitSlots[slot], f = makeFruit(type);
  const place = () => { if (alt.fruits[slot]) P.remove(alt.fruits[slot]); alt.fruits[slot] = f; };
  if (!animated) { f.position.copy(tgt); P.add(f); place(); return; }
  const startY = 3.2;
  tween(1.1, t => {
    if (!f.parent) { place(); P.add(f); }
    let y;
    if (t < .55) { const e = t / .55; y = startY + (tgt.y - startY) * e * e; }
    else if (t < .8) { const e = (t - .55) / .25; y = tgt.y + Math.sin(e * Math.PI) * .08; }
    else { const e = (t - .8) / .2; y = tgt.y + Math.sin(e * Math.PI) * .025; }
    f.position.set(tgt.x, y, tgt.z);
    f.rotation.x = (1 - t) * 3;
  }, () => sparkle(tgt, 0xffc060, P), delay);
}
function addWater(n, kind, animated, delay = 0, alt = MAIN) {
  const i = n % 7, b = alt.bowls[i], P = alt.parent;
  alt.st.bowls[i] = kind;
  if (!animated) { setBowl(b, 1, kind); return; }
  const drop = new THREE.Mesh(new THREE.SphereGeometry(.022, 12, 8), WATER[kind]); drop.scale.y = 1.6;
  let from = 0;
  tween(1.6, t => {
    if (t < .45) {
      if (!drop.parent) P.add(drop);
      const e = t / .45; drop.position.set(b.x, 2.6 + (ALT.y + .06 - 2.6) * e * e, b.z);
    } else {
      if (drop.parent) { P.remove(drop); ripple(b, P); from = b.kind === kind ? b.level : 0; }
      setBowl(b, from + (1 - from) * easeOut((t - .45) / .55), kind);
    }
  }, () => sparkle(V(b.x, ALT.y + .08, b.z), kind === "tea" ? 0xffb070 : kind === "saffron" ? 0xffd040 : 0xbfe8ff, P), delay);
}

/* ---------- effects ---------- */
const tweens = [], bursts = [];
let now = 0, glowBoost = 0;
function tween(dur, fn, done, delay = 0) { tweens.push({ t0: now + delay, dur, fn, done }); }
function sparkle(pos, color, parent = scene) {
  const n = 36, arr = new Float32Array(n * 3), vel = [];
  for (let i = 0; i < n; i++) { arr.set([pos.x, pos.y, pos.z], i * 3); vel.push(V((Math.random() - .5) * 1.1, Math.random() * 1.3 + .2, (Math.random() - .5) * 1.1)); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: .07, map: glowTex, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  parent.add(pts); bursts.push({ pts, vel, life: 0 });
  glowBoost = 1;
}
function ripple(b, parent = scene) {
  const r = new THREE.Mesh(new THREE.TorusGeometry(1, .08, 6, 32), new THREE.MeshBasicMaterial({ color: 0xdff6ff, transparent: true }));
  r.rotation.x = Math.PI / 2; r.position.set(b.x, ALT.y + .065, b.z); parent.add(r);
  tween(.7, t => { r.scale.setScalar(.01 + .06 * t); r.material.opacity = 1 - t; }, () => { parent.remove(r); r.geometry.dispose(); });
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

/* ---------- the other statues' altars: water, light, incense and fruit, laid out like Guanyin's ---------- */
// shrine(parent, key, o) sets out seven water bowls and a fruit plate (at o.fruitX) on a hall's offering table, and the two stepped
// candle stands and the bronze censer before it, as in the main hall; with o.vaseX, also a brass vase there for flowers, lotus first.
// With o.shan nothing stands before the table, as at Shan altars: lamps and candles go on gilt trays at its front corners and
// incense in a small footed brass bowl of sand at the back of it, between the vase and the fruit.
// What has been offered there is kept in state.shrines[key];
// it returns the parts to tap, each with `offer` set to the item it takes. `before` names the statue for the messages
if (!state.shrines) state.shrines = {};
const shrines = {};
const SHRINE_TIP = { flower: "Offer a lotus", water: "Add a bowl of water", fruit: "Add fruit", candle: "Light a candle", incense: "Offer incense" };
function shrine(parent, key, o = {}) {
  const st = state.shrines[key] = state.shrines[key] || { bowls: { 0: "pure", 1: "pure", 2: "pure" }, fruit: { 0: 0, 1: 1, 2: 2 }, candles: { c0: "red", c1: "white", l0: "lamp", l1: "lamp" }, incense: { 0: "sandal" }, n: {}, next: { c: 2, l: 2 } };
  const alt = shrines[key] = { parent, st, embers: null, before: o.before || "the Buddha", inc: o.shan ? { at: V(0, ALT.y, ALT.z - .14), s: CS * .5 } : null }, hits = [];
  const pick = (m, item) => { Object.assign(m.userData, { offer: item, tip: `${SHRINE_TIP[item]} before ${alt.before}` }); hits.push(m); return m; };
  buildBowls(alt, pick); buildPlate(alt, o.fruitX ?? 1.02, pick); (o.shan ? buildTrays : buildStands)(alt, pick); buildCenser(alt, pick);
  if (o.vaseX !== undefined) {
    const v = vase.clone(); v.position.set(o.vaseX, ALT.y, ALT.z - .12); parent.add(v); pick(v, "flower");
    Object.assign(alt, { mouth: V(o.vaseX, MOUTH.y, MOUTH.z), flowers: new Array(FLOWER_SLOTS).fill(null) });
    st.flowers = st.flowers || { 5: "lotus", 4: "lotus", 6: "lotus" };
    Object.entries(st.flowers).forEach(([s, k]) => placeFlower(+s, k, false, 0, alt));
  }
  Object.entries(st.bowls).forEach(([s, k]) => setBowl(alt.bowls[+s], 1, k));
  Object.entries(st.fruit).forEach(([s, k]) => placeFruit(+s, k, false, 0, alt));
  Object.entries(st.candles).forEach(([s, k]) => placeCandle(s, k, false, 0, alt));
  Object.entries(st.incense).forEach(([s, k]) => addIncense(+s, k, false, 0, alt));
  return hits;
}
// one offering from the bag placed on the altar of hall `key`
const SHRINE_PLACE = {
  flower: (alt, n, k) => addFlower(n, k, true, 0, alt),
  water: (alt, n, k) => addWater(n, k, true, 0, alt), fruit: (alt, n) => addFruit(n, true, 0, alt),
  candle: (alt, n, k) => addCandle(n, k, true, 0, alt), incense: (alt, n, k) => addIncense(n, k, true, 0, alt)
};
function offerAtShrine(key, k) {
  const alt = shrines[key]; if (!alt) return;
  const kinds = state.bag[k] || {}, kind = k === "flower" && kinds.lotus > 0 ? "lotus" : Object.keys(kinds).find(x => kinds[x] > 0);   // a lotus if you have one
  if (!kind) { toast(`You have no ${ITEMS[k].name.toLowerCase()} in your bag. Buy them at the temple shop on the left of the lotus pond, or on the pagoda's fifth floor.`); return; }
  kinds[kind]--;
  const n = alt.st.n[k] = (alt.st.n[k] ?? 2) + 1;   // the first three bowls, fruits and incense slots are already filled
  SHRINE_PLACE[k](alt, n, kind);
  const items = { [k]: { q: 1, k: kind } };
  state.log.push({ t: Date.now(), items, ded: $("dedication").value.trim(), at: alt.before });
  save(); render(); renderLog();
  toast(`Placed ${describe(items)} before ${alt.before}.`);
}

