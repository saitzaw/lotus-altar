/* ---------- the four-animal top (လေးကောင်ဂျင်) in the seven-day market: festival tokens only, kept in this browser ---------- */
const TG_KEY = "lotus-altar-tokens", TG_START = 100, TG_CHIPS = [[1, "#d8d2c0"], [5, "#c0302a"], [10, "#2a5ab0"], [25, "#2a8a4a"]];
let tgTokens = TG_START, tgChip = 5, tgBets = {}, tgLast = null, tgOpen = false, tgCam = null, tgClearT = 0;
let tgRefused = false;   // the doorman turned you away: he remembers you until the page is reloaded
try { const v = parseInt(localStorage.getItem(TG_KEY), 10); if (v >= 0) tgTokens = v; } catch (e) {}
const tgSave = () => { try { localStorage.setItem(TG_KEY, String(tgTokens)); } catch (e) {} };
const TG_BETS = window.FourFaceTopGame ? FourFaceTopGame.BETS : [];
const tgSum = b => Object.values(b || {}).reduce((a, v) => a + v, 0);
const tgPayText = b => b.pays === 3 ? "3 to 1" : "1 to 1";
// the chips you bet with, and the mat drawn as a grid: Red along the top, Black along the bottom, the four animals between,
// Rooster · Eel down the left and Pig · Frog down the right, as on the table
TG_CHIPS.forEach(([v, col]) => {
  const b = document.createElement("button");
  b.type = "button"; b.setAttribute("role", "radio"); b.dataset.v = v; b.style.background = col; b.textContent = v;
  if (v === 1) b.style.color = "#2a1c18";
  b.setAttribute("aria-label", `Chip worth ${v} token${v > 1 ? "s" : ""}`);
  b.addEventListener("click", () => { tgChip = v; tgRender(); });
  $("tgChips").appendChild(b);
});
const TG_AREA = { red: "1 / 2 / 2 / 4", black: "4 / 2 / 5 / 4", rooster: "2 / 2 / 3 / 3", pig: "2 / 3 / 3 / 4", eel: "3 / 2 / 4 / 3", frog: "3 / 3 / 4 / 4", "rooster-eel": "2 / 1 / 4 / 2", "pig-frog": "2 / 4 / 4 / 5" };
TG_BETS.forEach(bt => {
  const b = document.createElement("button"), face = FourFaceTopGame.FACES.find(f => f.key === bt.key);
  b.type = "button"; b.dataset.k = bt.key; b.style.gridArea = TG_AREA[bt.key];
  b.className = face ? face.color : bt.wins.length === 2 && bt.key.includes("-") ? "pair" : bt.key;
  b.innerHTML = `<span lang="my">${bt.my}</span>${bt.en}<small>${tgPayText(bt)}</small><b></b>`;
  b.addEventListener("click", () => tgPlace(bt.key));
  $("tgBoard").appendChild(b);
});
function tgShowChips() { const game = temple.fourTop; if (game && !game.busy) game.setChips(tgBets); }
function tgPlace(key) {
  const game = temple.fourTop; if (!game || game.busy) return;
  if (tgTokens < tgChip) { $("tgMsg").textContent = tgTokens > 0 ? `You have only ${tgTokens} token${tgTokens > 1 ? "s" : ""} left: pick a smaller chip.` : "You have no tokens left to bet."; return; }
  clearTimeout(tgClearT);
  tgBets[key] = (tgBets[key] || 0) + tgChip; tgTokens -= tgChip; tgSave();
  if ($("soundOn").checked) { ac(); tone(1400, 1100, .06, .05, "triangle"); }
  $("tgMsg").textContent = "";
  tgShowChips(); tgRender();
}
// take every chip back off the mat
function tgRefund() { tgTokens += tgSum(tgBets); tgBets = {}; tgSave(); }
function tgRender() {
  const game = temple.fourTop, busy = !!(game && game.busy), onMat = tgSum(tgBets);
  document.querySelectorAll("#tgChips button").forEach(b => { b.setAttribute("aria-checked", String(+b.dataset.v === tgChip)); b.disabled = busy; });
  document.querySelectorAll("#tgBoard button").forEach(b => {
    const bt = TG_BETS.find(x => x.key === b.dataset.k), amt = tgBets[bt.key] || 0;
    b.querySelector("b").textContent = amt || ""; b.disabled = busy;
    b.setAttribute("aria-label", `${bt.en}, pays ${tgPayText(bt)}` + (amt ? `, ${amt} tokens on it` : "") + `. Add a ${tgChip}-token chip.`);
  });
  $("tgBet").textContent = onMat; $("tgTokens").textContent = tgTokens;
  $("tgClear").disabled = busy || !onMat;
  $("tgRepeat").disabled = busy || !tgLast || tgSum(tgLast) > tgTokens + onMat;
  const broke = tgTokens <= 0 && !onMat;
  $("tgSpin").textContent = broke ? `Take ${TG_START} more festival tokens` : busy ? "Spinning…" : onMat ? `Spin the top · ${onMat} on the mat` : "Put chips on the mat to spin";
  $("tgSpin").disabled = busy || (!broke && !onMat);
}
$("tgClear").addEventListener("click", () => { tgRefund(); tgShowChips(); $("tgMsg").textContent = "You take your chips back."; tgRender(); });
$("tgRepeat").addEventListener("click", () => {
  if (!tgLast || (temple.fourTop && temple.fourTop.busy)) return;
  tgRefund();
  if (tgSum(tgLast) > tgTokens) return tgRender();
  clearTimeout(tgClearT);
  tgBets = Object.assign({}, tgLast); tgTokens -= tgSum(tgBets); tgSave();
  $("tgMsg").textContent = "The same bets as last round."; tgShowChips(); tgRender();
});
$("tgSpin").addEventListener("click", () => {
  const game = temple.fourTop; if (!game || game.busy) return;
  if (tgTokens <= 0 && !tgSum(tgBets)) { tgTokens = TG_START; tgSave(); $("tgMsg").textContent = `The stall keeper hands you another ${TG_START} festival tokens.`; tgRender(); return; }
  if (!tgSum(tgBets)) return;
  ac(); clearTimeout(tgClearT);
  tgLast = Object.assign({}, tgBets);
  game.spin(tgBets); tgBets = {};   // the stakes now lie with the banker until the cover lifts
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
  game.options.onResult = (face, outcome) => {
    const back = outcome.reduce((a, o) => a + (o.won ? o.stake * (o.pays + 1) : 0), 0), name = k => TG_BETS.find(b => b.key === k).en;
    tgTokens += back; tgSave();
    const side = face.color === "red" ? "red, a land animal" : "black, a water animal";
    const wins = outcome.filter(o => o.won).map(o => `${name(o.key)} wins ${o.stake * o.pays}`), lost = outcome.filter(o => !o.won).map(o => name(o.key));
    $("tgMsg").textContent = `${face.my} ${face.en} lies face up (${side}). ` +
      (wins.length ? wins.join(", ") + (lost.length ? `; the banker takes your chips on ${lost.join(", ")}.` : ".") + ` ${back} tokens come back to you.` : "The banker takes all your chips.");
    clearTimeout(tgClearT); tgClearT = setTimeout(tgShowChips, 2600);   // the winnings stay on the mat a moment, then you pick them up
    tgRender();
  };
}
/* ---------- the doorman: only 21 and over may go in to the game; tell him your age ---------- */
function openDoorCheck() {
  $("tgDoor").hidden = false;
  const say = $("tgDoorSay"), form = $("tgAgeForm");
  if (tgRefused) { say.innerHTML = `He folds his arms. <span lang="my">ဝင်လို့မရဘူးလို့ ပြောပြီးပြီ။</span> “I've already told you: not until you're 21.”`; form.hidden = true; $("tgDoorClose").focus(); return; }
  say.innerHTML = `<span lang="my">အသက် ၂၁ နှစ်ပြည့်သူများသာ ဝင်ခွင့်ရှိသည်။</span> “Only 21 and over inside. How old are you?”`;
  form.hidden = false; $("tgAge").value = ""; $("tgAge").focus();
}
function closeDoorCheck() { $("tgDoor").hidden = true; }
$("tgAgeForm").addEventListener("submit", e => {
  e.preventDefault();
  const age = parseInt($("tgAge").value, 10), say = $("tgDoorSay"), game = temple.fourTop;
  if (!(age >= 1 && age <= 120)) { say.textContent = "He waits. “Your age, in years.”"; $("tgAge").focus(); return; }
  $("tgAgeForm").hidden = true;
  if (age < 21) {
    tgRefused = true;
    say.innerHTML = `He shakes his head. <span lang="my">အသက် ၂၁ နှစ် မပြည့်သေးရင် ဝင်လို့မရဘူး။</span> “Sorry, you have to be 21 to come in. Have a look round the market instead.”`;
    $("tgDoorClose").focus(); return;
  }
  say.textContent = "He nods, steps aside and pushes the doors open. “Come in.”";
  const ms = game && game.admit ? game.admit() : 0;
  setTimeout(() => { closeDoorCheck(); openTopGame(); }, ms + 500);
});
$("tgDoorClose").addEventListener("click", closeDoorCheck);
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("tgDoor").hidden) closeDoorCheck(); });
function openTopGame() {
  const game = temple.fourTop; if (!game) return;
  if (!game.doorOpen) { openDoorCheck(); return; }
  tgHook(game);
  const at = game.group.position;
  $("topGame").hidden = false; tgOpen = true;
  $("tgMsg").textContent = tgTokens > 0 ? "" : "You have no tokens left.";
  tgShowChips(); tgRender();
  // bring the camera down to the table, standing at the players' (west) side
  tgCam = { min: controls.minDistance, max: controls.maxDistance, minP: controls.minPolarAngle };
  Object.assign(controls, { minDistance: 1.4, maxDistance: 8, minPolarAngle: .3 });
  const p0 = camera.position.clone(), t0 = controls.target.clone(), p1 = V(at.x - 1.9, at.y + 1.75, at.z + .3), t1 = V(at.x + .2, at.y, at.z);
  tween(reduceMotion ? .01 : 1.4, t => { const e = easeInOut(t); camera.position.lerpVectors(p0, p1, e); controls.target.lerpVectors(t0, t1, e); });
  $("tgSpin").focus();
}
function closeTopGame(silent) {
  closeDoorCheck();
  if (!tgOpen) return;
  tgOpen = false; $("topGame").hidden = true;
  if (tgSum(tgBets)) { tgRefund(); tgShowChips(); tgRender(); }   // walking away, you take your chips with you
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

