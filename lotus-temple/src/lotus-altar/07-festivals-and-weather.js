/* ---------- testing shortcuts in the address (?dancers=, ?weather=, ?halloween=, ?townsfolk=, ?lionDragon=): they work only on the
   developer's own computer (localhost), so on the public site everyone sees the real schedule on the temple's clock ---------- */
const DEV_HOST = (() => { try { return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(location.hostname); } catch (e) { return false; } })();
const devParam = key => DEV_HOST ? new URLSearchParams(location.search).get(key) : null;   // null on the public site, as if the address had no shortcut
/* ---------- Halloween night: the houses go dark at 9 pm ICT, a friendly ghost walks the roads, walkers carry a torch ---------- */
const FEST_FORCE = (() => { try { const v = devParam("halloween"); return v === null ? null : v !== "0"; } catch (e) { return null; } })();
function festNow() {
  if (FEST_FORCE !== null) return { season: FEST_FORCE, night: FEST_FORCE };
  const { tz } = CONFIG.sky, { from, to, outHour, untilHour } = CONFIG.halloween;
  const clock = t => Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "numeric", day: "numeric", hour: "numeric", hourCycle: "h23" })
    .formatToParts(t).filter(p => p.type !== "literal").map(p => [p.type, +p.value]));
  const n = Date.now(), hour = clock(n).hour, eve = clock(n - untilHour * 36e5);   // a night belongs to the evening it began on
  const md = eve.month * 100 + eve.day, season = md >= from[0] * 100 + from[1] && md <= to[0] * 100 + to[1];
  return { season, night: season && (hour >= outHour || hour < untilHour) };
}
let fest = festNow(), festOut = fest.night ? 1 : 0, festTold = { torch: false, ghost: false };
setInterval(() => { const was = fest.night; fest = festNow(); if (fest.night !== was) applySky(); }, 3e4);
// the walker's torch: always in the scene (adding a light later would rebuild every material), dark until it is needed
const torch = new THREE.SpotLight(0xfff1d6, 0, 34, .42, .55, 1.4);
world.add(torch, torch.target);
const _look = new THREE.Vector3();
function festStep(dt) {
  const was = festOut;
  festOut = clamp(festOut + (fest.night ? dt : -dt) / 2.5, 0, 1);   // the house lights go out over a couple of seconds
  temple.setHalloween({ on: fest.night, out: festOut });
  if (festOut !== was) skyColors();
  const outside = current === "pagoda", dark = fest.night && daylight < .5;
  const want = dark && outside && inMarket, onFootAtNight = outside && inMarket && daylight < .5;
  if (!onFootAtNight) torchChoice = null;   // a new walk at night starts with the torch as the night has it
  const lit = onFootAtNight && (torchChoice === null ? want : torchChoice);
  torchButton(onFootAtNight, lit);
  torch.intensity += ((lit ? 2.4 : 0) - torch.intensity) * Math.min(1, dt * 6);
  if (torch.intensity > .01) {
    camera.getWorldDirection(_look);
    torch.position.copy(camera.position).addScaledVector(_look, .2).add(V(0, -.35, 0));
    torch.target.position.copy(camera.position).addScaledVector(_look, 10);
  }
  if (want && torchChoice === null && !festTold.torch) { festTold.torch = true; toast("Happy Halloween! The houses are dark tonight, so you switch on your torch."); }
  const gh = temple.ghost;
  if (want && gh && !festTold.ghost && Math.hypot(gh.x - camera.position.x, gh.z - camera.position.z) < 9) {
    festTold.ghost = true; toast("👻 Just a friendly little ghost out for Halloween. It waves hello and drifts on along the road.");
  }
}
// the torch switch: shown while walking outside at night; on Halloween night the torch starts on, any other night off
let torchChoice = null, torchShown = null;   // torchChoice: null until the walker flips the switch
function torchButton(show, lit) {
  const b = $("torchBtn"), key = show && (lit ? "on" : "off");
  if (key === torchShown) return; torchShown = key;
  b.hidden = !show; if (!show) return;
  b.textContent = lit ? "🔦 Torch on" : "🔦 Torch off"; b.title = `Switch the torch ${lit ? "off" : "on"} (T)`; b.setAttribute("aria-pressed", String(lit));
}
function flipTorch() {
  if ($("torchBtn").hidden) return;
  torchChoice = $("torchBtn").getAttribute("aria-pressed") !== "true";
  tone(2200, 1400, .06, .04, "square");   // the switch's click
}
$("torchBtn").addEventListener("click", flipTorch);
document.addEventListener("keydown", e => { if (e.code === "KeyT" && !e.repeat && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) flipTorch(); });
function festNote() {
  const el = $("festInfo"); if (!el) return;
  if (!fest.season && drill.season) {   // the weeks of dragon and lion dance training before Chinese New Year
    el.hidden = current !== "pagoda";
    const ny = drill.newYear ? new Date(drill.newYear).toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "short" }) : "";
    el.textContent = `🐉 Training for Chinese New Year${ny ? " (" + ny + ")" : ""} on the kung fu ground · dragon 6–9 AM and 9–10 PM · lion 9:30–11 AM and 6–8 PM ICT`;
    return;
  }
  el.hidden = current !== "pagoda" || !fest.season;
  el.textContent = fest.night ? `🎃 Halloween night · the houses are dark after 9 PM ICT · a friendly ghost walks the roads${daylight > .5 ? " (switch to Night to see it)" : ""}`
    : "🎃 Halloween festival · the houses go dark at 9 PM ICT tonight";
}

/* ---------- townsfolk: people out in the market and on the roads from 6 pm until they go home at 10 pm ICT ---------- */
const forced = key => { try { const v = devParam(key); return v === null ? null : v !== "0"; } catch (e) { return null; } };
const FOLK_FORCE = forced("townsfolk");
const DANCES = ["solo", "pair", "to", "twoTo", "toKinnara", "singer"];   // the stage's shows, as in CONFIG.dancers
const DANCE_FORCE = (() => { try { const v = devParam("dancers"); return v === null ? undefined : v === "0" ? null : DANCES.includes(v) ? v : "pair"; } catch (e) { return undefined; } })();
function inHours({ from, until }) {
  const [h, m] = new Intl.DateTimeFormat("en-US", { timeZone: CONFIG.sky.tz, hour: "numeric", minute: "numeric", hourCycle: "h23" }).format(Date.now()).split(":"), hour = +h + m / 60;
  return from < until ? hour >= from && hour < until : hour >= from || hour < until;   // a window that may run past midnight
}
const folkNow = () => FOLK_FORCE !== null ? FOLK_FORCE : inHours(CONFIG.townsfolk);
// who dances on the festival stage (CONFIG.dancers), ICT: the kinnara alone 2–3:30 pm, the kinnara pair 4–5:45 pm, the to 6–7:30 pm,
// the two to 7:45–8:30 pm, the pair again 8:45–9:45 pm, the two to with the kinnara 10–11 pm, the singer in the gaps (3:31–3:59,
// 5:46–5:58, 7:31–7:44 and 9:46–9:59 pm), else no one
const danceNow = () => {
  if (DANCE_FORCE !== undefined) return DANCE_FORCE;
  const at = w => (w || []).some(([from, until]) => inHours({ from, until }));
  return DANCES.find(k => at(CONFIG.dancers[k])) || null;
};
// dragon and lion dance training on the kung fu ground in the weeks before Chinese New Year: { season, newYear, show: "dragon" | "lion" | null }
const DRILL_FORCE = (() => { try { const v = devParam("lionDragon"); return v === null ? undefined : v === "0" ? null : v === "lion" ? "lion" : "dragon"; } catch (e) { return undefined; } })();
function drillNow() {
  const C = CONFIG.lionDragon, [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: CONFIG.sky.tz, year: "numeric", month: "numeric", day: "numeric" }).format(Date.now()).split("-").map(Number);
  const today = Date.UTC(y, m - 1, d), ny = C.newYear.map(([a, b, c]) => Date.UTC(a, b - 1, c)).find(t => t > today);   // the next New Year's day
  const season = ny !== undefined && ny - today <= C.days * 864e5, at = w => w.some(([from, until]) => inHours({ from, until }));
  const show = DRILL_FORCE !== undefined ? DRILL_FORCE : !season ? null : at(C.dragon) ? "dragon" : at(C.lion) ? "lion" : null;
  return { season: season || !!show, newYear: ny, show };
}
// the Sunday service in the Kachin Baptist church (CONFIG.service): on that weekday, in its hours, on the temple's clock
const SERVICE_FORCE = forced("service");
const serviceNow = () => SERVICE_FORCE !== null ? SERVICE_FORCE
  : new Intl.DateTimeFormat("en-US", { timeZone: CONFIG.sky.tz, weekday: "short" }).format(Date.now()) === CONFIG.service.day && inHours(CONFIG.service);
// the morning market (CONFIG.morningMarket): villagers selling on the ground at the seven-day market, early in the morning
const MORNING_FORCE = forced("morningMarket");
const morningNow = () => MORNING_FORCE !== null ? MORNING_FORCE : inHours(CONFIG.morningMarket);
// the seven-day market's sellers at their stalls, and shoppers in the aisles (CONFIG.stalls)
const STALLS_FORCE = forced("stalls");
const stallsNow = () => STALLS_FORCE !== null ? STALLS_FORCE : inHours(CONFIG.stalls);
// the Poy Sang Long procession round the block opposite the gate (CONFIG.procession)
const PROCESSION_FORCE = forced("procession");
const processionNow = () => PROCESSION_FORCE !== null ? PROCESSION_FORCE : inHours(CONFIG.procession);
let folkOut = folkNow(), danceOn = danceNow(), drill = drillNow(), serviceOn = serviceNow(), morningOn = morningNow(), stallsOn = stallsNow(), processionOn = processionNow();
setInterval(() => { folkOut = folkNow(); danceOn = danceNow(); drill = drillNow(); serviceOn = serviceNow(); morningOn = morningNow(); stallsOn = stallsNow(); processionOn = processionNow(); festNote(); }, 3e4);

/* ---------- the beat officer: commented out for now; uncomment this block, `policeStep()` in the frame loop and `beatOfficer(g)` in
   temple-floors.js to bring him back. After dark he chases a visitor on foot anywhere outside the temple and the markets ---------- */
// const POLICE_FORCE = (() => { try { const v = devParam("police"); return v === null ? null : v !== "0"; } catch (e) { return null; } })();
// temple.setPolice({ ...CONFIG.police, on: POLICE_FORCE === null ? CONFIG.police.on : POLICE_FORCE });
// const POLICE_SAYS = {
//   spotted: "👮 A police officer has seen you and gives chase! Get inside the temple grounds or a market, where no one can be arrested.",
//   lost: "You have shaken off the officer. He gives up and walks back to his beat."
// };
// function policeStep() {
//   temple.setPolice({ walking: current === "pagoda" && inMarket });
//   const news = temple.policeNews(); if (!news) return;
//   if (news !== "arrested") { if (POLICE_SAYS[news]) toast(POLICE_SAYS[news]); return; }   // reaching safe ground goes unannounced
//   walkTween = null;
//   enterWalk([130, 48.5], [133, 40], "");
//   $("where").innerHTML = `<b lang="my">ရဲစခန်း</b>The police station`;
//   toast("🚓 Arrested! The officer walks you to the police station, takes your name and lets you go with a warning. Only a game: the temple and the markets are safe ground.");
// }

/* ---------- weather: rain, cloud, mist and haze over the northern hills, picked from the date ---------- */
const WEATHER = {   // fog: how far you see (x the usual haze), tint: the sky's colour and how much of it, rain: 0–1, wind: 0–1
  clear:  { icon: "☀", label: "Clear skies", fog: 1, tint: 0x9aa4ae, k: 0, rain: 0, wind: .5 },
  cloudy: { icon: "☁", label: "Cloudy", fog: .8, tint: 0x8c939a, k: .45, rain: 0, wind: .75 },
  rain:   { icon: "🌧", label: "Rain", fog: .45, tint: 0x6a737c, k: .7, rain: 1, wind: 1 },
  mist:   { icon: "🌫", label: "Mist in the valley", fog: .3, tint: 0xc2c6ca, k: .65, rain: 0, wind: .15 },
  haze:   { icon: "🌫", label: "Smoky haze from the field burning", fog: .5, tint: 0xb39c78, k: .55, rain: 0, wind: .3 }
};
const WX_FORCE = (() => { try { const v = devParam("weather"); return WEATHER[v] ? v : null; } catch (e) { return null; } })();
function weatherNow() {
  if (WX_FORCE) return WX_FORCE;
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: CONFIG.sky.tz, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", hourCycle: "h23" })
    .formatToParts(Date.now()).filter(q => q.type !== "literal").map(q => [q.type, +q.value]));
  const spell = Math.floor(p.hour / CONFIG.weather.spell), mistHour = p.hour >= 4 && p.hour < 10;
  // the same weather for every visitor in this spell: a hash of the date and the spell
  let h = (p.year * 400 + p.month * 32 + p.day) * 8 + spell;
  h = Math.imul(h ^ h >>> 16, 0x45d9f3b); h = Math.imul(h ^ h >>> 16, 0x45d9f3b); h = ((h ^ h >>> 16) >>> 0) / 4294967296;
  const w = CONFIG.weather.odds[p.month - 1].map((o, i) => i === 3 ? o * (mistHour ? 2.5 : .3) : o), kinds = Object.keys(WEATHER);
  let r = h * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < kinds.length; i++) if ((r -= w[i]) < 0) return kinds[i];
  return "clear";
}
const seasonName = () => { const m = +new Intl.DateTimeFormat("en-US", { timeZone: CONFIG.sky.tz, month: "numeric" }).format(Date.now()); return m >= 5 && m <= 10 ? "rainy season" : m >= 3 ? "hot season" : "cool season"; };
let wxKind = weatherNow();
const wx = (({ fog, k, rain, wind, tint }) => ({ fog, k, rain, wind, tint: new THREE.Color(tint) }))(WEATHER[wxKind]);   // the weather as it is now, drifting toward wxKind
setInterval(() => { const was = wxKind; wxKind = weatherNow(); if (wxKind !== was) weatherNote(); }, 6e4);
function weatherNote() {
  const el = $("weatherInfo"); if (!el) return;
  const w = WEATHER[wxKind];
  el.hidden = !(current === "pagoda" || inCorridor);
  el.textContent = `${w.icon} ${w.label} · ${seasonName()} in the northern hills`;
}
// rain: streaks falling in a box that travels with the camera (left out when motion is reduced; the sound stays)
const RAIN_N = 2400, RAIN_BOX = [50, 24, 50];
const rainLines = (() => {
  const pos = new Float32Array(RAIN_N * 6);
  for (let i = 0; i < RAIN_N; i++) { const x = (Math.random() - .5) * RAIN_BOX[0], y = Math.random() * RAIN_BOX[1], z = (Math.random() - .5) * RAIN_BOX[2]; pos.set([x, y, z, x, y - .5, z], i * 6); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xaab4c0, transparent: true, opacity: 0, depthWrite: false }));
  l.frustumCulled = false; l.visible = false; world.add(l); return l;
})();
function weatherStep(dt) {
  const T = WEATHER[wxKind], e = Math.min(1, dt / 6);   // a change of weather drifts in over half a minute or so
  ["fog", "k", "rain", "wind"].forEach(n => wx[n] += (T[n] - wx[n]) * e);
  wx.tint.lerp(_wxTint.set(T.tint), e);
  const out = current === "pagoda" || inCorridor;
  if (out) {   // closer haze, a greyer sky and a dimmer day
    const base = inCorridor ? CONFIG.fog.corridor : inMarket ? CONFIG.fog.walk : CONFIG.fog.outside, f = inMarket ? wx.fog : .5 + .5 * wx.fog;
    world.fog.near = base[0] * f; world.fog.far = base[1] * f;
    renderer.toneMappingExposure = CONFIG.light.exposure * (1 + .05 * daylight) * (1 - .2 * wx.k * daylight);
    skyColors();
  }
  const show = out && wx.rain > .02 && !reduceMotion;
  rainLines.visible = show;
  if (!show) return;
  rainLines.material.opacity = .45 * wx.rain * (.6 + .4 * daylight);
  rainLines.position.set(camera.position.x, camera.position.y - RAIN_BOX[1] / 2, camera.position.z);
  const a = rainLines.geometry.attributes.position, p = a.array, fall = 14 * dt, drift = 1.2 * wx.wind * dt;
  for (let i = 0; i < RAIN_N * 6; i += 6) {
    p[i + 1] -= fall; p[i + 4] -= fall; p[i] += drift; p[i + 3] += drift;
    if (p[i + 4] < 0) { p[i + 1] += RAIN_BOX[1]; p[i + 4] += RAIN_BOX[1]; }
    if (p[i] > RAIN_BOX[0] / 2) { p[i] -= RAIN_BOX[0]; p[i + 3] -= RAIN_BOX[0]; }
    p[i + 3] = p[i] - .06 * wx.wind;   // the streak leans with the wind
  }
  a.needsUpdate = true;
}
const _wxTint = new THREE.Color(), _wxSky = new THREE.Color();

// day and night outside: the sky, sun or moon, the light and the haze; indoors stays lamplit
let daylight = 0;
try { daylight = localStorage.getItem("lotus-altar-daylight") === "1" ? 1 : 0; } catch (e) {}
// the sky and haze outside: black at night, under the stars and moon
function skyColors() {
  const out = current === "pagoda" || inCorridor, d = daylight, dark = festOut * (1 - d);
  const mix = (a, b) => new THREE.Color(a).lerp(new THREE.Color(b), d);
  world.background.copy(out ? mix(0x000000, 0x86b8e6) : mix(0x120a07, CONFIG.light.dayIndoor));
  world.fog.color.copy(out ? mix(0x000000, 0xb4cce0) : mix(0x120a07, CONFIG.light.dayIndoor));
  if (out && wx.k > .001) {   // cloud, rain, mist or haze greys the sky (darker at night)
    const tint = _wxSky.copy(wx.tint).multiplyScalar(.15 + .85 * d), k = wx.k * (1 - dark);
    world.background.lerp(tint, k); world.fog.color.lerp(tint, k);
  }
}
function applySky() {
  const out = current === "pagoda" || inCorridor, d = daylight;
  skyColors();
  renderer.toneMappingExposure = CONFIG.light.exposure * (out ? 1 + .05 * d : 1);
  temple.setDaylight(d);
  lampsOn = 1 - d;
  lanternMat.emissiveIntensity = CONFIG.lanterns.glowStrength * (1 - d) + .05;
  lanterns.forEach(l => l.userData.glow.material.opacity = .45 * (1 - d));
  const btn = $("timeBtn");
  const note = $("skyInfo");
  if (note) { note.hidden = !out || !skyNote; if (skyNote) note.textContent = daylight > .5 ? skyNote.day : skyNote.night; }
  festNote();
  weatherNote();
  if (btn) { btn.textContent = daylight > .5 ? "☾ Night" : "☀ Day"; btn.title = daylight > .5 ? "Switch to night" : "Switch to day"; btn.setAttribute("aria-pressed", String(daylight > .5)); }
}
updateCelestial();
setInterval(() => { updateCelestial(); applySky(); }, 5 * 6e4);   // the sky moves on while the page is open
$("timeBtn").addEventListener("click", () => {
  const from = daylight, to = daylight > .5 ? 0 : 1;
  try { localStorage.setItem("lotus-altar-daylight", String(to)); } catch (e) {}
  tween(reduceMotion ? .01 : 1.6, t => { daylight = from + (to - from) * easeInOut(t); applySky(); }, () => { daylight = to; applySky(); });
});
