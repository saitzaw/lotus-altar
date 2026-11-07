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

// every altar where water, light, incense and fruit are offered is one record: the group it stands in, `st` the saved offerings
// it shows (state.altar here, state.shrines[key] before the other statues, see shrine), and the bowls and slots built below.
// `pick(mesh, item)` marks a part to tap for that offering
const MAIN = { parent: scene, get st() { return state.altar; }, embers: null };
// seven water bowls
function buildBowls(alt, pick) {
  alt.bowls = [];
  for (let i = 0; i < 7; i++) {
    const x = -.54 + i * .18, z = ALT.z + .3;
    const b = lathe([[0, 0], [.04, 0], [.045, .01], [.07, .04], [.078, .065], [.072, .065], [.064, .04], [0, .015]], M.brass, 28);
    b.position.set(x, ALT.y, z); b.castShadow = true; alt.parent.add(b); pick(b, "water");
    const w = new THREE.Mesh(new THREE.CircleGeometry(1, 28), WATER.pure); w.rotation.x = -Math.PI / 2; w.visible = false; alt.parent.add(w);
    alt.bowls.push({ x, z, w, level: 0, kind: null });
  }
}
buildBowls(MAIN, clickable);
const bowls = MAIN.bowls;
function setBowl(b, level, kind) {
  b.level = level; b.kind = kind; b.w.material = WATER[kind] || WATER.pure; b.w.visible = level > .01;
  b.w.position.set(b.x, ALT.y + .016 + .046 * level, b.z);
  b.w.scale.setScalar(.04 + .028 * level);
}

// fruit plate on a stem, at x along the back of the table
const FR = .07;
function buildPlate(alt, x, pick) {
  const z = ALT.z - .12;
  mesh(new THREE.CylinderGeometry(.06, .09, .1, 24), M.brass, x, ALT.y + .05, z, alt.parent);
  const plate = lathe([[0, 0], [.26, 0], [.32, .03], [.31, .035], [.25, .012], [0, .012]], M.brass, 40);
  plate.position.set(x, ALT.y + .1, z); plate.castShadow = true; alt.parent.add(plate); pick(plate, "fruit");
  const slots = [V(0, 0, 0)];
  for (let i = 0; i < 6; i++) slots.push(V(Math.sin(i / 6 * TAU) * .16, 0, Math.cos(i / 6 * TAU) * .16));
  for (let i = 0; i < 3; i++) slots.push(V(Math.sin(i / 3 * TAU + .5) * .09, .11, Math.cos(i / 3 * TAU + .5) * .09));
  slots.push(V(0, .2, 0));
  alt.fruitSlots = slots.map(p => p.add(V(x, ALT.y + .112 + FR, z)));
  alt.fruits = new Array(slots.length).fill(null);
}
buildPlate(MAIN, 1.02, clickable);

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
const STAND_X = 1.05;
const STEPS = [{ half: .33, top: PLAT + .18 }, { half: .23, top: PLAT + .34 }, { half: .12, top: PLAT + .5 }];
// points around a square of half-size o, `per` to a side, going round
const squareRing = (o, per) => {
  const pts = [];
  for (let i = 0; i < per; i++) { const t = -o + 2 * o * i / per; pts.push([t, o], [o, -t], [-t, -o], [-o, t]); }
  return pts;
};
function buildStands(alt, pick) {
  Object.assign(alt, { standFlames: [], lampSlots: [], candleSlots: [], candleObjs: {} });
  [-1, 1].forEach(s => {
    const x = s * STAND_X;
    STEPS.forEach((st, i) => {
      const bottom = i ? STEPS[i - 1].top : PLAT, h = st.top - bottom, w = st.half * 2;
      pick(mesh(new THREE.BoxGeometry(w, h, w), M.lacquer, x, bottom + h / 2, INC_Z, alt.parent), "candle");
      mesh(new THREE.BoxGeometry(w + .012, .018, w + .012), M.trim, x, st.top - .03, INC_Z, alt.parent);
    });
    const top = STEPS[2].top;
    mesh(new THREE.CylinderGeometry(.04, .04, .32, 20), M.waxRed, x, top + .16, INC_Z, alt.parent);
    const light = new THREE.PointLight(0xff9a3c, .9, 5, 2); light.position.set(x, top + .42, INC_Z); alt.parent.add(light);
    alt.standFlames.push(makeFlame(V(x, top + .37, INC_Z), 1.3, light, alt.parent));
    squareRing(.28, 3).forEach(([dx, dz]) => alt.lampSlots.push({ p: V(x + dx, STEPS[0].top, INC_Z + dz), dx, dz }));
    squareRing(.175, 2).forEach(([dx, dz]) => alt.candleSlots.push({ p: V(x + dx, STEPS[1].top, INC_Z + dz), dx, dz }));
  });
  // fill the front of both stands first, working outwards and backwards
  [alt.lampSlots, alt.candleSlots].forEach(list => list.sort((a, b) => (b.dz - a.dz) || (Math.abs(a.dx) - Math.abs(b.dx)) || (a.p.x - b.p.x)));
}
buildStands(MAIN, clickable);
// at a Shan altar nothing stands on the floor before the table: lamps and candles go on a gilt tray at each front corner of it
function buildTrays(alt, pick) {
  Object.assign(alt, { standFlames: [], lampSlots: [], candleSlots: [], candleObjs: {} });
  [-1, 1].forEach(s => {
    const x = s * 1.17, z = ALT.z + .3;
    pick(mesh(new THREE.BoxGeometry(.66, .02, .4), M.gold, x, ALT.y + .01, z, alt.parent), "candle");
    [-.22, 0, .22].forEach(dx => {
      alt.candleSlots.push({ p: V(x + dx, ALT.y + .02, z - .1), dx: dx * s, dz: 0 });
      alt.lampSlots.push({ p: V(x + dx, ALT.y + .02, z + .1), dx: dx * s, dz: 0 });
    });
  });
  [alt.lampSlots, alt.candleSlots].forEach(list => list.sort((a, b) => (Math.abs(a.dx) - Math.abs(b.dx)) || (a.p.x - b.p.x)));
}
const candleSlot = (alt, key) => (key[0] === "l" ? alt.lampSlots : alt.candleSlots)[+key.slice(1)];
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
function addCandle(n, kind, animated, delay = 0, alt = MAIN) {
  const st = alt.st; st.next = st.next || {};
  const tier = kind === "lamp" ? "l" : "c", list = tier === "l" ? alt.lampSlots : alt.candleSlots;
  const i = (st.next[tier] || 0) % list.length; st.next[tier] = i + 1;
  placeCandle(tier + i, kind, animated, delay, alt);
}
function placeCandle(key, kind, animated, delay = 0, alt = MAIN) {
  const slot = candleSlot(alt, key); if (!slot) return;
  alt.st.candles[key] = kind;
  const P = alt.parent, objs = alt.candleObjs, g = makeCandle(kind), at0 = slot.p, x = at0.x;
  g.position.copy(at0);
  const wick = V(x, at0.y + g.userData.top + .015, at0.z);
  const replace = () => { const o = objs[key]; if (o) { P.remove(o.g, o.fl.flame, o.fl.g); flames.splice(flames.indexOf(o.fl), 1); } };
  if (!animated) { replace(); P.add(g); const fl = makeFlame(wick, kind === "lamp" ? .8 : 1, null, P); objs[key] = { g, fl }; return; }
  const sf = alt.standFlames[x < 0 ? 0 : 1], src = sf ? sf.flame.position : V(x, wick.y + .5, at0.z);   // no stand: the spark comes down from above
  let spark, fl;
  tween(1.5, t => {
    if (!g.parent) { replace(); P.add(g); }
    g.scale.set(1, Math.max(.001, easeOut(clamp(t / .3, 0, 1))), 1);
    if (t > .3 && t < .75) {
      if (!spark) { spark = glowSprite(0xffc060, .12, 1); P.add(spark); }
      const e = easeInOut((t - .3) / .45);
      spark.position.lerpVectors(src, wick, e); spark.position.y += Math.sin(Math.PI * e) * .15;
    }
    if (t >= .75) {
      if (spark) { P.remove(spark); spark = null; }
      if (!fl) { fl = makeFlame(wick, kind === "lamp" ? .8 : 1, null, P); objs[key] = { g, fl }; }
      fl.on = easeOut((t - .75) / .25);
    }
  }, () => sparkle(wick, 0xffc060, P), delay);
}

// large bronze tripod censer (香爐) on a stone pedestal in front of the table
const CS = CONFIG.layout.censerScale;
const INCENSE = V(0, PLAT + .36, INC_Z);
// at a Shan altar (alt.inc set: where it stands and its scale) it is a small footed brass bowl of sand on the table instead
function buildCenser(alt, pick) {
  const P = alt.parent, I = alt.inc || { at: INCENSE, s: CS };
  if (!alt.inc) {
    mesh(new THREE.CylinderGeometry(.3, .36, .28, 8), M.stone, 0, PLAT + .14, INC_Z, P);
    mesh(new THREE.CylinderGeometry(.36, .36, .06, 8), M.lacquer, 0, PLAT + .31, INC_Z, P);
    mesh(new THREE.CylinderGeometry(.38, .38, .02, 8), M.trim, 0, PLAT + .35, INC_Z, P);
  }
  const censer = new THREE.Group(); censer.position.copy(I.at); censer.scale.setScalar(I.s); P.add(censer);
  if (!alt.inc) for (let i = 0; i < 3; i++) {
    const a = i / 3 * TAU + Math.PI / 3;
    const leg = mesh(new THREE.CylinderGeometry(.018, .012, .08, 10), M.bronze, Math.sin(a) * .1, .04, Math.cos(a) * .1, censer);
    leg.rotation.set(Math.cos(a) * .2, 0, -Math.sin(a) * .2);
  }
  // the bowl is open: its inner wall drops from the rim to a bed of ash sunk below it
  const cBowl = alt.inc
    ? lathe([[0, -.06], [.11, -.06], [.11, -.045], [.05, -.025], [.045, 0], [.1, .01], [.15, .04], [.17, .09], [.18, .13], [.172, .14], [.156, .136], [.15, .115], [0, .1]], M.brass, 40)
    : lathe([[0, 0], [.1, 0], [.15, .03], [.17, .08], [.165, .12], [.18, .13], [.172, .14], [.156, .136], [.15, .115], [0, .1]], M.bronze, 40);
  cBowl.position.y = .06; cBowl.castShadow = true; censer.add(cBowl); pick(cBowl, "incense");
  mesh(new THREE.TorusGeometry(.168, .006, 6, 48), M.trim, 0, .16, 0, censer).rotation.x = Math.PI / 2;
  // a gently mounded bed of ash (or sand) with the stubs of burnt sticks standing in it
  const ash = mesh(ASH_GEO, alt.inc ? M.sand : M.ash, 0, .17, 0, censer); ash.rotation.x = -Math.PI / 2; pick(ash, "incense");
  [[.06, .03], [-.05, .06], [.02, -.08], [-.09, -.03], [.1, -.05], [-.02, .1]].forEach(([x, z], i) => {
    const st = mesh(new THREE.CylinderGeometry(.0025, .0025, .03 + i % 3 * .012, 5), M.stickRed, x, .18, z, censer);
    st.rotation.set((i % 2 - .5) * .3, 0, (i % 3 - 1) * .2);
  });
  if (!alt.inc) [-1, 1].forEach(s => mesh(new THREE.TorusGeometry(.035, .009, 6, 16, Math.PI), M.bronze, s * .14, .205, 0, censer));
  alt.incenseObjs = new Array(INCENSE_SETS.length).fill(null);
  return censer;
}
const ASH_GEO = new THREE.CircleGeometry(.152, 32), ap = ASH_GEO.attributes.position;
for (let i = 0; i < ap.count; i++) { const d = Math.hypot(ap.getX(i), ap.getY(i)) / .152; ap.setZ(i, (1 - d * d) * .014); }
ASH_GEO.computeVertexNormals();
const INCENSE_SETS = [V(0, 0, .02), V(-.075, 0, .01), V(.075, 0, .01), V(-.04, 0, -.07), V(.04, 0, -.07)].map(v => v.multiplyScalar(CS));
buildCenser(MAIN, clickable);
const embers = [];   // the glowing tips in Guanyin's censer, where the smoke rises from
MAIN.embers = embers;
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
function addIncense(n, kind, animated, delay = 0, alt = MAIN) {
  const slot = n % INCENSE_SETS.length, P = alt.parent, objs = alt.incenseObjs, em = alt.embers;
  alt.st.incense[slot] = kind;
  const I = alt.inc || { at: INCENSE, s: CS }, k = I.s / CS, ashY = I.at.y + .18 * I.s;   // k: this censer's size against Guanyin's
  const set = makeIncenseSet(kind), home = V(I.at.x, ashY - .05 * k, I.at.z).add(INCENSE_SETS[slot].clone().multiplyScalar(k));
  set.g.scale.setScalar(1.5 * k);
  set.g.rotation.y = (slot - 2) * .3;
  const replace = () => {
    const o = objs[slot];
    if (o) { P.remove(o.g); if (em) o.tips.forEach(t => em.splice(em.indexOf(t), 1)); }
    objs[slot] = set; if (em) em.push(...set.tips);
  };
  if (!animated) { set.g.position.copy(home); P.add(set.g); replace(); set.tips.forEach(t => t.material.opacity = 1); return; }
  tween(1.4, t => {
    if (!set.g.parent) P.add(set.g);
    const e = easeOut(clamp(t / .6, 0, 1));
    set.g.position.set(home.x, home.y + (1 - e) * .7 * k, home.z);
    if (t > .6 && !objs.includes(set)) replace();
    set.tips.forEach(tp => tp.material.opacity = clamp((t - .6) / .4, 0, 1));
  }, () => sparkle(V(home.x, home.y + .42, home.z), 0xffa060, P), delay);
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

