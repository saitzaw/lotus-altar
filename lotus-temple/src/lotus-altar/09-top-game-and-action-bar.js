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

