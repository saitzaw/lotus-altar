/* ---------- testing shortcuts in the address (?day=, ?dancers=, ?weather=, ?halloween=, ?townsfolk=, ?lionDragon=, ?christmas=, ?carols=, ?harvest=): they work only on the
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
  const kathinToday = KATHIN_FORCE !== false && (kathinDay() || kathinNow());
  if (!fest.season && !kathinToday && (harvestOn || xmasOn)) {   // the Kachin Baptist church's harvest thanksgiving and Christmas (the Kathin's day comes first)
    el.hidden = current !== "pagoda";
    const C = CONFIG.christmas, carolDays = inDays(C.carols.from, C.carols.to), wet = carolsOn && CAROL_FORCE === null && rainingOut();
    el.textContent = harvestOn ? "🌾 Harvest thanksgiving at the Kachin Baptist church · the first fruits before the pulpit · service 9–11:30 AM ICT"
      : onDay([12, 24]) ? `🎄 Christmas Eve · service at the Kachin Baptist church 5–7 PM ICT, then the carol singers go round until 11 PM${wet ? " (held up by the rain)" : ""}`
      : onDay([12, 25]) ? "🎄 Christmas Day · service at the Kachin Baptist church 9–11:30 AM ICT"
      : carolDays ? `🎄 Christmas at the Kachin Baptist church · carol singers go round the lanes 7–11 PM ICT${wet ? " · held up by the rain tonight" : carolsOn && daylight > .5 ? " (switch to Night to see them)" : ""}`
      : "🎄 Christmas season · the Kachin Baptist church is dressed for Christmas until 6 January";
    return;
  }
  if (!fest.season && drill.season) {   // the weeks of dragon and lion dance training before Chinese New Year
    el.hidden = current !== "pagoda";
    const ny = drill.newYear ? new Date(drill.newYear).toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "short" }) : "";
    el.textContent = `🐉 Training for Chinese New Year${ny ? " (" + ny + ")" : ""} on the kung fu ground · dragon 6–9 AM and 9–10 PM · lion 9:30–11 AM and 6–8 PM ICT`;
    return;
  }
  if (fest.season) {
    el.hidden = current !== "pagoda";
    el.textContent = fest.night ? `🎃 Halloween night · the houses are dark after 9 PM ICT · a friendly ghost walks the roads${daylight > .5 ? " (switch to Night to see it)" : ""}`
      : "🎃 Halloween festival · the houses go dark at 9 PM ICT tonight";
    return;
  }
  if (KATHIN_FORCE !== false && (kathinDay() || kathinNow())) {   // the robe offering, on its day; ?kathin=1 shows it on any day
    el.hidden = current !== "pagoda";
    const on = kathinNow(), wet = on && KATHIN_FORCE === null && rainingOut();
    el.textContent = !on ? "Shan Kathin today, the full moon of Tazaungmon · the robe offering leaves Haw Kham at noon ICT"
      : wet ? "Shan Kathin · held up while it rains. The robes go to the monastery once it stops, until 2 PM ICT"
      : "Shan Kathin · the town carries the new robes from Haw Kham round the old quarter to the second monastery until 2 PM ICT";
    return;
  }
  el.hidden = true;
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
  : new Intl.DateTimeFormat("en-US", { timeZone: CONFIG.sky.tz, weekday: "short" }).format(Date.now()) === CONFIG.service.day && inHours(CONFIG.service)
  || CONFIG.christmas.services.some(v => onDay(v.on) && inHours(v));   // and the Christmas Eve and Christmas morning services
// today on the temple's clock, and whether it falls on [month, day] or in a span of them (which may run over New Year)
const ictToday = () => { const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: CONFIG.sky.tz, year: "numeric", month: "numeric", day: "numeric" }).format(Date.now()).split("-").map(Number); return { y, m, d, md: m * 100 + d }; };
const onDay = ([m, d]) => ictToday().md === m * 100 + d;
const inDays = ([m0, d0], [m1, d1]) => { const md = ictToday().md, a = m0 * 100 + d0, b = m1 * 100 + d1; return a <= b ? md >= a && md <= b : md >= a || md <= b; };
// Christmas at the Kachin Baptist church (CONFIG.christmas): the dressing through the season, the carol singers in the evenings
const XMAS_FORCE = forced("christmas"), CAROL_FORCE = forced("carols");
const christmasNow = () => XMAS_FORCE !== null ? XMAS_FORCE : inDays(CONFIG.christmas.from, CONFIG.christmas.to);
const carolsNow = () => { const C = CONFIG.christmas.carols; return CAROL_FORCE !== null ? CAROL_FORCE : inDays(C.from, C.to) && inHours({ from: C.hours[0], until: C.hours[1] }); };
const carolAt = () => CAROL_FORCE ? null : ((Date.now() / 1e3 + 7 * 3600) % 86400) - CONFIG.christmas.carols.hours[0] * 3600;   // seconds since they set out, on the temple's clock
// the harvest thanksgiving (CONFIG.harvest): the last Sunday of its month on the temple's clock
const HARVEST_FORCE = forced("harvest");
const harvestNow = () => {
  if (HARVEST_FORCE !== null) return HARVEST_FORCE;
  const { y, m, d } = ictToday(), last = new Date(Date.UTC(y, m, 0)).getUTCDate();   // the month's last day
  return m === CONFIG.harvest.month && d + 7 > last && new Intl.DateTimeFormat("en-US", { timeZone: CONFIG.sky.tz, weekday: "short" }).format(Date.now()) === "Sun";
};
// the morning market (CONFIG.morningMarket): villagers selling on the ground at the seven-day market, early in the morning
const MORNING_FORCE = forced("morningMarket");
const morningNow = () => MORNING_FORCE !== null ? MORNING_FORCE : inHours(CONFIG.morningMarket);
// someone is still in the high school (CONFIG.school), so its lit windows show after dark
const SCHOOL_FORCE = forced("school");
const schoolNow = () => SCHOOL_FORCE !== null ? SCHOOL_FORCE : inHours(CONFIG.school);
// the seven-day market's sellers at their stalls, and shoppers in the aisles (CONFIG.stalls)
const STALLS_FORCE = forced("stalls");
const stallsNow = () => STALLS_FORCE !== null ? STALLS_FORCE : CONFIG.stalls.some(([from, until]) => inHours({ from, until }));
// the food street's people (CONFIG.foodStreet), forced along with the stalls
const foodNow = () => STALLS_FORCE !== null ? STALLS_FORCE : inHours(CONFIG.foodStreet);
// the Poy Sang Long procession round the block opposite the gate (CONFIG.procession)
const PROCESSION_FORCE = forced("procession");
// Shan Kathin (CONFIG.kathin): on the full moon of Tazaungmon only, from noon until 2 pm. ?kathin=1 or =0 forces it
const KATHIN_FORCE = forced("kathin");
function kathinDay(now = Date.now()) {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: CONFIG.sky.tz, year: "numeric", month: "numeric", day: "numeric" }).format(now).split("-").map(Number);
  return CONFIG.kathin.days.some(([yy, mm, dd]) => y === yy && m === mm && d === dd);
}
const kathinNow = () => KATHIN_FORCE !== null ? KATHIN_FORCE : kathinDay() && inHours(CONFIG.kathin);
// the Shinlaung procession goes out every morning but the Kathin day
const processionNow = () => PROCESSION_FORCE !== null ? PROCESSION_FORCE : !kathinDay() && inHours(CONFIG.procession);
const kathinAt = () => KATHIN_FORCE ? null : ((Date.now() / 1e3 + 7 * 3600) % 86400) - CONFIG.kathin.from * 3600;
// in the rain the procession is called off and no fire balloon goes up (?procession=1 still forces the procession on;
// ?balloons=1 or =0 forces the balloons). Read in the frame loop, as wxKind is set further down
const BALLOON_FORCE = forced("balloons");
// the fire lotus towers on the stupa hill (CONFIG.fireLotus), 7 pm to midnight, called off in the rain; ?firelotus=1 or =0 forces them
const FIRE_LOTUS_FORCE = forced("firelotus"), fireLotusNow = () => inHours(CONFIG.fireLotus);
// the festival ground's lights (CONFIG.festivalLights): the evening until the last dance ends, or whenever someone is forced onto the stage
const FEST_LIGHTS_FORCE = forced("festivallights"), festLightsNow = () => FEST_LIGHTS_FORCE !== null ? FEST_LIGHTS_FORCE : inHours(CONFIG.festivalLights) || !!DANCE_FORCE;
// the lotus lanterns round the main stupa (CONFIG.lotusLanterns), through their months on the temple's clock; ?lotuslanterns=1 or =0 forces them
const LANTERN_FORCE = forced("lotuslanterns");
const lotusLanternsNow = () => LANTERN_FORCE !== null ? LANTERN_FORCE : CONFIG.lotusLanterns.months.includes(+new Intl.DateTimeFormat("en-US", { timeZone: CONFIG.sky.tz, month: "numeric" }).format(Date.now()));
// which balloons go up now (CONFIG.balloons): "day" (the animals), "night", or null; "auto" when forced on, chosen by the light
const BALLOON_PARAM = (() => { try { return devParam("balloons"); } catch (e) { return null; } })();
const balloonsNow = () => BALLOON_PARAM === "day" || BALLOON_PARAM === "night" ? BALLOON_PARAM : BALLOON_PARAM !== null && BALLOON_PARAM !== "0" ? "auto"
  : inHours({ from: CONFIG.balloons.day[0], until: CONFIG.balloons.day[1] }) ? "day" : inHours({ from: CONFIG.balloons.night[0], until: CONFIG.balloons.night[1] }) ? "night" : null;
const rainingOut = () => wxKind === "rain";
// how long the procession has been walking, in seconds on the temple's clock (ICT is UTC+7 all year), or null when forced on
const processionAt = () => PROCESSION_FORCE ? null : ((Date.now() / 1e3 + 7 * 3600) % 86400) - CONFIG.procession.from * 3600;
let xmasOn = christmasNow(), carolsOn = carolsNow(), harvestOn = harvestNow();
let folkOut = folkNow(), danceOn = danceNow(), drill = drillNow(), serviceOn = serviceNow(), morningOn = morningNow(), schoolOn = schoolNow(), stallsOn = stallsNow(), foodOn = foodNow(), processionOn = processionNow(), kathinOn = kathinNow(), balloonKind = balloonsNow(), fireLotusOn = fireLotusNow(), lotusLanternsOn = lotusLanternsNow(), festLightsOn = festLightsNow();
setInterval(() => { xmasOn = christmasNow(); carolsOn = carolsNow(); harvestOn = harvestNow(); balloonKind = balloonsNow(); fireLotusOn = fireLotusNow(); lotusLanternsOn = lotusLanternsNow(); festLightsOn = festLightsNow(); folkOut = folkNow(); danceOn = danceNow(); drill = drillNow(); serviceOn = serviceNow(); morningOn = morningNow(); schoolOn = schoolNow(); stallsOn = stallsNow(); foodOn = foodNow(); processionOn = processionNow(); kathinOn = kathinNow(); festNote(); }, 3e4);

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
let wxKind = weatherNow();
const wx = (({ fog, k, rain, wind, tint }) => ({ fog, k, rain, wind, tint: new THREE.Color(tint) }))(WEATHER[wxKind]);   // the weather as it is now, drifting toward wxKind
setInterval(() => { wxKind = weatherNow(); }, 6e4);
// rain: streaks falling in a box that travels with the camera (left out when motion is reduced; the sound stays)
const RAIN_N = 2400, RAIN_BOX = [50, 24, 50];
const rainLines = (() => {
  const pos = new Float32Array(RAIN_N * 6);
  for (let i = 0; i < RAIN_N; i++) { const x = (Math.random() - .5) * RAIN_BOX[0], y = Math.random() * RAIN_BOX[1], z = (Math.random() - .5) * RAIN_BOX[2]; pos.set([x, y, z, x, y - .5, z], i * 6); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.ShaderMaterial({   // a streak is dropped wherever a roof, a ceiling or a canopy stands over it (see rainCover)
    uniforms: { color: { value: new THREE.Color(0xaab4c0) }, opacity: { value: 0 }, cover: { value: null }, coverAt: { value: new THREE.Vector4() }, coverY: { value: new THREE.Vector2() } },
    vertexShader: "varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
    fragmentShader: `#include <packing>
      uniform vec3 color; uniform float opacity; uniform sampler2D cover; uniform vec4 coverAt; uniform vec2 coverY; varying vec3 vW;
      void main() {
        vec2 uv = (vW.xz - coverAt.xy) / coverAt.z + .5;
        if (coverAt.w > .5 && all(greaterThan(uv, vec2(0.))) && all(lessThan(uv, vec2(1.)))) {
          float d = unpackRGBAToDepth(texture2D(cover, vec2(uv.x, 1. - uv.y)));   // 0 at the top camera, 1 at its far plane
          if (vW.y < coverY.x - d * coverY.y + .05) discard;   // under something: dry
        }
        gl_FragColor = vec4(color, opacity);
      }`,
    transparent: true, depthWrite: false
  });
  const l = new THREE.LineSegments(g, mat);
  l.frustumCulled = false; l.visible = false; world.add(l); return l;
})();
// what keeps the rain off: the depth of everything seen from straight above the camera, redrawn as you move (roofs, eaves,
// ceilings, pavilions, verandahs, trees), so it never falls through a building onto the floor inside
const rainCover = (() => {
  const N = 256, S = RAIN_BOX[0] + 8, H = 80, rt = new THREE.WebGLRenderTarget(N, N);
  const cam = new THREE.OrthographicCamera(-S / 2, S / 2, S / 2, -S / 2, 0, H); cam.up.set(0, 0, -1);   // looking down, north up the texture
  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
  const u = rainLines.material.uniforms, last = new THREE.Vector3(1e9, 0, 0), clear = new THREE.Color(1, 1, 1), keep = new THREE.Color();
  u.cover.value = rt.texture; let age = 0;
  return dt => {
    const p = camera.position; age += dt;
    if (last.distanceToSquared(p) < 1 && age < .5) return;   // fresh enough
    last.copy(p); age = 0;
    const top = p.y + 30;   // above the tallest roof you can stand under
    cam.position.set(p.x, top, p.z); cam.lookAt(p.x, top - 1, p.z); cam.updateMatrixWorld();
    const bg = world.background, auto = renderer.shadowMap.autoUpdate, a = renderer.getClearAlpha(); renderer.getClearColor(keep);
    world.background = null; world.overrideMaterial = depth; renderer.shadowMap.autoUpdate = false; rainLines.visible = false;
    const culled = temple.uncull(p.x, p.z, S * .72);   // the roof over your head is out of view, so the town's culling has hidden it
    renderer.setRenderTarget(rt); renderer.setClearColor(clear, 1); renderer.clear(); renderer.render(world, cam); renderer.setRenderTarget(null);
    culled.forEach(o => o.visible = false);
    world.background = bg; world.overrideMaterial = null; renderer.shadowMap.autoUpdate = auto; rainLines.visible = true; renderer.setClearColor(keep, a);
    u.coverAt.value.set(p.x, p.z, S, 1); u.coverY.value.set(top, H);
  };
})();
function weatherStep(dt) {
  const T = WEATHER[wxKind], e = Math.min(1, dt / 6);   // a change of weather drifts in over half a minute or so
  ["fog", "k", "rain", "wind"].forEach(n => wx[n] += (T[n] - wx[n]) * e);
  wx.tint.lerp(_wxTint.set(T.tint), e);
  const out = current === "pagoda" || inCorridor;
  world.environment = envFor(out, daylight);   // here as well as in applySky: leaving the balcony doesn't always pass through it
  if (out) {   // closer haze, a greyer sky and a dimmer day
    const base = inCorridor ? CONFIG.fog.corridor : inMarket ? CONFIG.fog.walk : CONFIG.fog.outside, f = inMarket ? wx.fog : .5 + .5 * wx.fog;
    world.fog.near = base[0] * f; world.fog.far = base[1] * f;
    renderer.toneMappingExposure = outExposure(daylight) * (1 - .2 * wx.k * daylight);
    skyColors();
  }
  const show = out && wx.rain > .02 && !reduceMotion;
  rainLines.visible = show;
  if (!show) return;
  rainLines.material.uniforms.opacity.value = .45 * wx.rain * (.6 + .4 * daylight);
  rainCover(dt);
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

// day and night outside follow the sun over the temple right now. The Day/Night button shows the other look for this
// visit (dayChoice 1 or 0) and, pressed again, goes back to the real sky (null); nothing is kept once the page closes.
// ?day=1 or ?day=0 opens on one look, and only on the developer's computer.
const dayParam = devParam("day");
let dayChoice = dayParam === "1" ? 1 : dayParam === "0" ? 0 : null, daylight = dayChoice == null ? 0 : dayChoice, liveDaylight = 0, dayFadeUntil = -1;
const dayFading = () => now < dayFadeUntil;   // on the frame clock, so a fade cleared by a jump elsewhere cannot lock the button
// outside the eye is a little less open at night, so the dark stays dark and the lamps stand out
const outExposure = d => CONFIG.light.exposure * (CONFIG.light.night + (1.05 - CONFIG.light.night) * d);
// the sky and haze outside: deep blue at night, under the stars and moon
function skyColors() {
  const out = current === "pagoda" || inCorridor, d = daylight, dark = festOut * (1 - d);
  const mix = (a, b) => new THREE.Color(a).lerp(new THREE.Color(b), d);
  const night = c => new THREE.Color(c).multiplyScalar(1 - dark);   // a deep blue night, black once Halloween's houses go dark
  world.background.copy(out ? night(CONFIG.light.nightSky).lerp(new THREE.Color(0x86b8e6), d) : mix(0x120a07, CONFIG.light.dayIndoor));
  world.fog.color.copy(out ? night(CONFIG.light.nightHaze).lerp(new THREE.Color(0xb4cce0), d) : mix(0x120a07, CONFIG.light.dayIndoor));
  if (out && wx.k > .001) {   // cloud, rain, mist or haze greys the sky (darker at night)
    const tint = _wxSky.copy(wx.tint).multiplyScalar(.15 + .85 * d), k = wx.k * (1 - dark);
    world.background.lerp(tint, k); world.fog.color.lerp(tint, k);
  }
}
function applySky() {
  const out = current === "pagoda" || inCorridor, d = daylight;
  skyColors();
  world.environment = envFor(out, d);
  renderer.toneMappingExposure = out ? outExposure(d) : CONFIG.light.exposure;
  temple.setDaylight(d);
  lampsOn = 1 - d;
  lanternMat.emissiveIntensity = CONFIG.lanterns.glowStrength * (1 - d) + .05;
  lanterns.forEach(l => l.userData.glow.material.opacity = .45 * (1 - d));
  const note = $("skyInfo"), real = skyNote && (liveDaylight > .5 ? skyNote.day : skyNote.night);
  if (note) { note.hidden = !out || !skyNote; if (skyNote) note.textContent = dayChoice == null ? real : (dayChoice ? "Daylight view · " : "Night view · ") + real; }
  festNote();
  const btn = $("timeBtn"), toDay = daylight <= .5, backToLive = dayChoice != null && (toDay ? 1 : 0) === (liveDaylight > .5 ? 1 : 0);
  btn.textContent = toDay ? "☀ Day" : "☾ Night";
  btn.title = backToLive ? "Back to the real sky over the temple" : toDay ? "Show the temple by day, for this visit" : "Show the temple at night, for this visit";
  btn.setAttribute("aria-label", btn.title);
}
updateCelestial();
setInterval(() => { updateCelestial(); applySky(); }, 5 * 6e4);   // the sky moves on while the page is open
// show the other look, or go back to the real sky when the other look is what is really overhead
$("timeBtn").addEventListener("click", () => {
  if (dayFading()) return;
  const from = daylight, to = from > .5 ? 0 : 1, dur = reduceMotion ? .01 : 1.6;
  dayChoice = to === (liveDaylight > .5 ? 1 : 0) ? null : to;
  dayFadeUntil = now + dur + .1;   // set first, so updateCelestial leaves daylight to the fade
  updateCelestial();   // the noon sun for a daylight view after dark, the real one otherwise
  const end = dayChoice == null ? liveDaylight : to;
  tween(dur, t => { daylight = from + (end - from) * easeInOut(t); applySky(); }, () => { daylight = end; applySky(); });
});
