/* ---------- loop ---------- */
let inCorridor = false, inStairs = false, arriveInStairs = false;   // where the camera stands within a floor (set by setView)
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const base = inMarket || inCorridor || inStairs ? 65 : 42;   // on foot the view is wider
  camera.fov = camera.aspect < 1 ? Math.min(base > 42 ? 72 : 80, base + (1 - camera.aspect) * 40) : base;   // on foot a phone held upright widens a little, but not to a fish-eye that swims as you turn
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
    if (b.life > 1.3) { b.pts.parent.remove(b.pts); b.pts.geometry.dispose(); bursts.splice(i, 1); }
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
  // on foot the drag only turns the head, slowly, and stops when you let go instead of drifting on
  const onFoot = inMarket || inCorridor || inStairs;
  controls.rotateSpeed = onFoot ? CONFIG.camera.look.drag : 1; controls.dampingFactor = onFoot ? CONFIG.camera.look.settle : .05;
  controls.update();
  keepInside();
  walkStep(dt);
  aimPrompt(dt);
  festStep(dt);
  weatherStep(dt);
  temple.setTownsfolk(folkOut, wx.rain > CONFIG.townsfolk.umbrella);
  temple.setDancers(danceOn);
  temple.setService(serviceOn);
  temple.setLionDragon(drill.show);
  // policeStep();   // the beat officer is commented out
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
  if (o.userData.shopItem) { ac(); if (sheet !== "buy") openSheet("buy"); setQty(o.userData.shopItem, cart[o.userData.shopItem].q + 1); pulse(o.userData.shopItem); toast(`Added ${ITEMS[o.userData.shopItem].name.toLowerCase()} to your basket.`); return; }
  if (current !== 1) {
    ac();
    if (o.userData.offer) { offerAtShrine(current, o.userData.offer); return; }
    const r = temple.activate(o, current, lastHit);
    if (r.fourTop) { openTopGame(); return; }
    if (r.pavilion) { sitInPavilion(); return; }
    if (r.walk) { if (inMarket) { temple.walkerY = r.walk[2]; enterWalk(r.walk[0], r.walk[1]); } return; }   // a ladder: on foot, step to its other end
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

