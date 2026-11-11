// close-up of Guanyin's face and back to the full hall
let closeUp = false;
$("viewBtn").addEventListener("click", () => {
  closeUp = !closeUp;
  const p0 = camera.position.clone(), t0 = controls.target.clone();
  const view = closeUp ? placeInfo(current).closeUp || CONFIG.camera.closeUp : CONFIG.camera.full, p1 = V(...view.pos), t1 = V(...view.target);
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
        resize(); controls.update();
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
  world.fog.near = inCorridor ? CONFIG.fog.corridor[0] : 13; world.fog.far = inCorridor ? CONFIG.fog.corridor[1] : 28; camera.far = inCorridor ? 1000 : 80; camera.updateProjectionMatrix();
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
