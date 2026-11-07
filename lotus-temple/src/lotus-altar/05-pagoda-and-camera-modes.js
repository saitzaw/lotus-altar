/* ---------- the pagoda: seven floors and the view from outside ---------- */
const temple = window.TempleFloors({
  THREE, world, V, TAU, clamp, easeOut, mesh, lathe, std, M, glowSprite, glowTex, canvasTex, petalGeo, makeLotus,
  makeFlame, tone: (...a) => tone(...a), tween: (...a) => tween(...a), sculptFigure, shrine, floors: CONFIG.floors, places: CONFIG.places, reduceMotion, cull: CONFIG.cull
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
  $("where").innerHTML = out ? `The pagoda · ${CONFIG.floors.length} floors` : (f.shn ? `<b lang="shn">${f.shn}</b>` : f.my ? `<b lang="my">${f.my}</b>` : "") + esc(f.label);   // a Shan or Burmese name, where the place has one
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
const EXIT_SPOT = { 1: [[0, 13.5], [0, 30]], library: [[14.5, 26], [0, 26]], shop: [[-18.5, 27], [0, 27]], quarters: [[-18.5, 21.6], [0, 21.6]], bell: [[-17, 5.5], [-17, 20]], church: [[12, 112.5], [12, 100]],
                    get kyaung() { const m = temple.monasteries[0]; return m && m.exit; } };   // the monastery's verandah, looking down its stair
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
