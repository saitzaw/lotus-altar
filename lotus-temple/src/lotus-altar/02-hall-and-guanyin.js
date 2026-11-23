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
    g.add(g.userData.glow = glowSprite(0xff7a3c, 1.4, .45));
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
// Guanyin herself is sculpted as one smooth surface (signed distance field, see statue-sculpt.js) and meshed off the main thread
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
   a coarse pass for the body, a fine one for the head, and a still coarser one that only casts the shadow.
   Each figure is meshed once. Guanyin starts with the page, so she is already seated when you come in from the gate.
   The other Buddhas are meshed in the background after her, and a second copy (the wish-tree Buddha, the back-gate lions)
   reuses the same surface instead of being built again. */
const FIGURE_BOXES = {
  guanyin: { body: { min: [-1.15, .48, -.62], max: [1.15, 2.1, .95] }, head: { min: [-.6, 1.98, -.58], max: [.6, 2.98, .5] } },
  qianshou: { body: { min: [-1.15, .48, -.62], max: [1.15, 2.1, .95] }, head: { min: [-.6, 1.98, -.58], max: [.6, 2.98, .5] } },
  medicine: { body: { min: [-1.2, .48, -.62], max: [1.2, 2.1, .95] }, head: { min: [-.45, 1.98, -.45], max: [.45, 2.86, .45] } },
  shakyamuni: { body: { min: [-1.2, .48, -.62], max: [1.2, 2.1, .95] }, head: { min: [-.45, 1.98, -.45], max: [.45, 2.86, .45] } },
  jaya: { body: { min: [-1.2, .48, -.62], max: [1.2, 2.1, .95] }, head: { min: [-.45, 1.98, -.45], max: [.45, 3.12, .45] } },
  shan: { body: { min: [-1.2, .48, -.62], max: [1.2, 2.1, .95] }, head: { min: [-.45, 1.98, -.45], max: [.45, 3.12, .45] } },
  maitreya: { body: { min: [-1.5, .48, -.62], max: [1.15, 2.1, 1.1] }, head: { min: [-.5, 1.7, -.45], max: [.5, 2.5, .5] } },
  lion: { body: { min: [-.78, -.02, -1.0], max: [.78, 1.92, 1.0] }, head: { min: [-.62, 1.62, -.56], max: [.62, 2.8, .8] } },
  lionL: { body: { min: [-.78, -.02, -1.0], max: [.78, 1.92, 1.0] }, head: { min: [-.62, 1.62, -.56], max: [.62, 2.8, .8] } }
};
const porcelain = new THREE.MeshStandardMaterial({ color: 0xf8f3eb, roughness: .28, metalness: .04, vertexColors: true });   // one lighting pass: the glaze's shine is in the roughness, not a clearcoat
const gilt = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: .55, roughness: .32, vertexColors: true });   // gold, hair and occlusion are already in the vertex colours
const behind = m => { const c = m.clone(); c.polygonOffset = true; c.polygonOffsetFactor = 1; c.polygonOffsetUnits = 1; return c; };
const stone = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .85, vertexColors: true });
const shadowMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });   // the coarse stand-in leaves nothing on screen; it only casts the shadow
const STATUE_MATS = { guanyin: [behind(porcelain), porcelain], medicine: [behind(gilt), gilt], shakyamuni: [behind(gilt), gilt], qianshou: [behind(gilt), gilt], jaya: [behind(gilt), gilt], shan: [behind(gilt), gilt], maitreya: [behind(gilt), gilt], lion: [behind(stone), stone], lionL: [behind(stone), stone] };
const preparing = new Map();   // label → statues still being built, and only while a visitor is waiting on one
function setPreparing() {
  const s = $("sculptStatus"); s.hidden = !preparing.size;
  const names = [...preparing.keys()];
  if (names.length) s.textContent = `Preparing ${names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names[names.length - 1] : names[0]}…`;
}
const unprepare = label => { const n = (preparing.get(label) || 1) - 1; if (n > 0) preparing.set(label, n); else preparing.delete(label); };
const sculptReady = new Map();   // figure → [body geometry, head geometry]
const sculptWait = new Map();    // figure → the mesh still being built, and every place waiting to receive it
function sculptGeo(r) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(r.pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(r.nor, 3));
  g.setAttribute("color", new THREE.BufferAttribute(r.col, 3));
  g.setIndex(new THREE.BufferAttribute(r.idx, 1));
  return g;
}
function placeFigure(figure, parent, geos) {
  const stand = geos.length > 2;   // a third mesh casts the shadow, so the detailed body and head are not drawn into the shadow map
  geos.forEach((g, i) => {
    const shadow = stand && i > 1, m = new THREE.Mesh(g, shadow ? shadowMat : STATUE_MATS[figure][i]);
    if (shadow) { m.castShadow = true; m.receiveShadow = false; }   // writes neither colour nor depth, so only the shadow map sees it (r128 tests shadow casters against the viewer's camera layers, so it stays on layer 0)
    else { m.castShadow = !stand; m.receiveShadow = true; }
    parent.add(m);
  });
}
function sculptFigure(figure, parent, label, onDone, cells) {
  const key = cells ? figure + "@" + cells.join(":") : figure;   // a small copy (the wish-tree Buddha) is meshed on its own, coarser cells
  const ready = sculptReady.get(key);
  if (ready) { if (parent) placeFigure(figure, parent, ready); if (onDone) onDone(); return; }
  let job = sculptWait.get(key);
  if (job) {
    job.parents.push({ parent, onDone });
    if (label && !job.labels.has(label)) { job.labels.add(label); preparing.set(label, (preparing.get(label) || 0) + 1); setPreparing(); }
    return;
  }
  const box = FIGURE_BOXES[figure];
  const [bodyCell, headCell] = cells || CONFIG.sculpt.cells[figure] || [CONFIG.sculpt.bodyCell, CONFIG.sculpt.headCell];
  const jobs = [{ figure, ...box.body, cell: bodyCell }, { figure, ...box.head, cell: headCell }];
  if (figure !== "lion" && figure !== "lionL") jobs.push({ figure, min: box.body.min.map((v, i) => Math.min(v, box.head.min[i])), max: box.body.max.map((v, i) => Math.max(v, box.head.max[i])), cell: CONFIG.sculpt.shadowCell });
  job = { parents: [{ parent, onDone }], labels: new Set(), geos: jobs.map(() => null) };
  sculptWait.set(key, job);
  if (label) { job.labels.add(label); preparing.set(label, (preparing.get(label) || 0) + 1); setPreparing(); }
  const finish = () => {
    sculptReady.set(key, job.geos); sculptWait.delete(key);
    job.labels.forEach(unprepare); setPreparing();
    job.parents.forEach(({ parent: p, onDone: done }) => { if (p) placeFigure(figure, p, job.geos); if (done) done(); });
  };
  const add = r => { if (job.geos[r.i]) return; job.geos[r.i] = sculptGeo(r); if (job.geos.every(Boolean)) finish(); };
  const fail = () => {
    sculptWait.delete(key); job.labels.forEach(unprepare);
    $("sculptStatus").hidden = false; $("sculptStatus").textContent = `${label || "The statue"} could not be prepared. Reload the page to try again.`;
    job.parents.forEach(({ onDone: done }) => { if (done) done(); });
  };
  // without workers, fetch the same file and build on the main thread
  const onMain = () => fetch(CONFIG.sculpt.worker).then(r => r.text()).then(src => {
    const build = new Function(src + "\nreturn build;")();
    setTimeout(() => jobs.forEach((j, i) => { if (!job.geos[i]) add({ i, ...build(j) }); }), 60);
  }).catch(fail);
  try {
    const w = new Worker(CONFIG.sculpt.worker);
    w.onmessage = e => add(e.data);
    w.onerror = e => { if (e.preventDefault) e.preventDefault(); onMain(); };
    w.postMessage({ jobs });
  } catch (e) { onMain(); }
}
// once Guanyin and the gate lions have the cores, mesh the other Buddhas one at a time so their halls are not empty
(function warmStatues() {
  const names = (CONFIG.sculpt.warm || []).slice();
  const step = () => {
    if (sculptWait.size) { setTimeout(step, 500); return; }
    const figure = names.shift();
    if (!figure) return;
    sculptFigure(figure, null, "", () => setTimeout(step, 40));
  };
  setTimeout(step, 800);
})();
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

