/* ---------- walking through the seven-day market at eye level ---------- */
const EYE = 1.65, WALK = 2.6;   // eye height and walking speed (m/s): an unhurried temple pace
let inMarket = false, panelBefore = false, walkTween = null;
const keys = new Set(), padMoves = new Set();
const MARKET_LOOK = { minDistance: .05, maxDistance: .05, minPolarAngle: CONFIG.camera.look.minPitch, maxPolarAngle: CONFIG.camera.look.maxPitch, minAzimuthAngle: -Infinity, maxAzimuthAngle: Infinity };
// stand at `pos` looking toward `at`: OrbitControls round a target a few centimetres ahead gives a look-around
function lookFrom(pos, at) {
  const dir = at.clone().sub(pos); dir.y = 0; if (dir.lengthSq() < 1e-6) dir.set(0, 0, -1);
  camera.position.copy(pos); controls.target.copy(pos).addScaledVector(dir.normalize(), .05);
  Object.assign(controls, MARKET_LOOK, { enableZoom: false });
  resize();   // a natural field of view on foot (see resize); the overhead views keep 42°
  controls.update();
}
// first person: walk the grounds at eye height, anywhere on the land; the market is one place to start
// how far from the temple a walker may go: WORLD_R toward the fields and hills behind it (−z), WORLD_R_TOWN toward the town, the
// stupa hill and the palace (+z), blending between them round the sides; the sky (SKY_R 420 in temple-floors) stays well beyond both
const WORLD_R = 225, WORLD_R_TOWN = 340;
const worldR = (x, z) => { const r = Math.hypot(x, z) || 1; return WORLD_R + (WORLD_R_TOWN - WORLD_R) * Math.min(1, Math.max(0, (z / r + .2) / .4)); };
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
const TURN = CONFIG.camera.look.turn * (reduceMotion ? .7 : 1);   // radians a second at full turn: about 57°/s, slow enough not to swim
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
  const r = Math.hypot(nx, nz), R = worldR(nx, nz); if (r > R) { nx *= R / r; nz *= R / r; }
  // stay off the water and out of the benches: if the step is blocked, slide along whichever axis is free
  // stay off the water and out of walls, posts and benches, and never step up more than a stair's height at once:
  // if the step is blocked, slide along whichever axis is free
  temple.walkerY = p.y - EYE;   // which floor you're on, where two lie over the same ground (the clock tower's base and platform)
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
    if (pl.nav === false) return;   // reached only through its door
    const b = document.createElement("button");
    b.type = "button"; b.id = "place-" + key; b.className = nav.querySelector(".fl-place") ? "fl-place" : "fl-place first"; b.dataset.f = key;
    b.setAttribute("aria-label", pl.name); b.title = pl.name;
    b.textContent = { bell: "Bell", library: "Hall", shop: "Shop", kyaung: "Kyaung", church: "Church", haw: "Haw" }[key] || pl.name.split(" ")[0];
    b.addEventListener("click", () => goTo(key));
    nav.appendChild(b);
  });
})();

