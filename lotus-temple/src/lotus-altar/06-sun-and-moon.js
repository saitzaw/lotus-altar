/* ---------- the real sky: sun and moon positions and the moon's phase (after SunCalc, V. Agafonkin, BSD) ---------- */
const Astro = (() => {
  const rad = Math.PI / 180, e = rad * 23.4397, toDays = t => t / 864e5 - .5 + 2440588 - 2451545;
  const ra = (l, b) => Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
  const dec = (l, b) => Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
  const az = (H, phi, d) => Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(d) * Math.cos(phi));
  const alt = (H, phi, d) => Math.asin(Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H));
  const sidereal = (d, lw) => rad * (280.16 + 360.9856235 * d) - lw;
  const sunCoords = d => {
    const M = rad * (357.5291 + .98560028 * d), C = rad * (1.9148 * Math.sin(M) + .02 * Math.sin(2 * M) + .0003 * Math.sin(3 * M));
    const L = M + C + rad * 102.9372 + Math.PI;
    return { dec: dec(L, 0), ra: ra(L, 0) };
  };
  const moonCoords = d => {
    const L = rad * (218.316 + 13.176396 * d), M = rad * (134.963 + 13.064993 * d), F = rad * (93.272 + 13.22935 * d);
    const l = L + rad * 6.289 * Math.sin(M), b = rad * 5.128 * Math.sin(F);
    return { ra: ra(l, b), dec: dec(l, b), dist: 385001 - 20905 * Math.cos(M) };
  };
  return {
    lst(t, lon) { return sidereal(toDays(t), rad * -lon); },   // the local sidereal time, as an angle
    sun(t, lat, lon) { const lw = rad * -lon, phi = rad * lat, d = toDays(t), c = sunCoords(d), H = sidereal(d, lw) - c.ra; return { az: az(H, phi, c.dec), alt: alt(H, phi, c.dec) }; },
    moon(t, lat, lon) {
      const lw = rad * -lon, phi = rad * lat, d = toDays(t), c = moonCoords(d), H = sidereal(d, lw) - c.ra;
      const q = Math.atan2(Math.sin(H), Math.tan(phi) * Math.cos(c.dec) - Math.sin(c.dec) * Math.cos(H));   // parallactic angle
      return { az: az(H, phi, c.dec), alt: alt(H, phi, c.dec), q };
    },
    illumination(t) {
      const d = toDays(t), s = sunCoords(d), m = moonCoords(d), sd = 149598000;
      const phi = Math.acos(Math.sin(s.dec) * Math.sin(m.dec) + Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra));
      const inc = Math.atan2(sd * Math.sin(phi), m.dist - sd * Math.cos(phi));
      const angle = Math.atan2(Math.cos(s.dec) * Math.sin(s.ra - m.ra), Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra));
      return { fraction: (1 + Math.cos(inc)) / 2, phase: .5 + .5 * inc * (angle < 0 ? -1 : 1) / Math.PI, angle };
    }
  };
})();
const PHASE_NAMES = [[.03, "New moon"], [.22, "Waxing crescent"], [.28, "First quarter"], [.47, "Waxing gibbous"], [.53, "Full moon"], [.72, "Waning gibbous"], [.78, "Last quarter"], [.97, "Waning crescent"], [1.01, "New moon"]];
const phaseName = p => PHASE_NAMES.find(([lim]) => p < lim)[1];
// a direction in the temple's frame (the temple faces south, +z; east is +x) from azimuth (from south, westward) and altitude
const skyDir = (a, h) => V(-Math.sin(a) * Math.cos(h), Math.sin(h), Math.cos(a) * Math.cos(h));
const COMPASS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
const compass = a => COMPASS[Math.round(((a / Math.PI * 180 + 180) % 360) / 45) % 8];
// the moon's face: only the lit part with its terminator and a few maria (the dark side is left clear, so the sky shows through); the lit limb is drawn at the top
// and the sprite is turned so it points the way it really does in the sky
function moonTexture(fraction) {
  const S = 256, R = 116, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d");
  const lit = document.createElement("canvas"); lit.width = lit.height = S;
  const l = lit.getContext("2d");
  const grad = l.createRadialGradient(S / 2 - 20, S / 2 - 30, 10, S / 2, S / 2, R);
  grad.addColorStop(0, "#fffbee"); grad.addColorStop(1, "#d8d2bf");
  l.fillStyle = grad;
  l.beginPath(); l.arc(S / 2, S / 2, R, Math.PI, TAU); l.fill();                                 // the top half is always lit
  const k = R * Math.abs(1 - 2 * fraction);
  if (fraction >= .5) { l.beginPath(); l.ellipse(S / 2, S / 2, R, Math.max(k, .1), 0, 0, TAU); l.fill(); }
  else { l.globalCompositeOperation = "destination-out"; l.beginPath(); l.ellipse(S / 2, S / 2, R, Math.max(k, .1), 0, 0, TAU); l.fill(); }
  l.globalCompositeOperation = "source-atop"; l.fillStyle = "rgba(120,116,104,.35)";
  [[-30, -20, 26], [22, -40, 18], [30, 12, 30], [-12, 40, 16], [-48, 18, 14]].forEach(([x, y, r]) => { l.beginPath(); l.arc(S / 2 + x, S / 2 + y, r, 0, TAU); l.fill(); });
  g.drawImage(lit, 0, 0);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
let skyNote = "";
// the four looks of the sky outside. The real sky takes whichever the sun gives; the Dawn/Day/Dusk/Night button shows one of
// them for this visit, with the sun where it stands at that look today (the moon stays where it really is)
const LOOKS = ["dawn", "day", "dusk", "night"], LOOK_LABEL = { dawn: "🌅 Dawn", day: "☀ Day", dusk: "🌇 Dusk", night: "☾ Night" };
// full day once the sun is 8° up, full night once it is 8° down, twilight between
const dayOf = alt => clamp((alt / (Math.PI / 180) + 8) / 16, 0, 1);
// the dawn or dusk glow: strongest with the sun just over the horizon, gone some way above it and some way below
const glowOf = alt => clamp(1 - Math.abs(alt / (Math.PI / 180) - 1) / CONFIG.sky.twilight.span, 0, 1);
// which look the sun gives; the sun's azimuth is from the south, westward, so a sun in the west is the evening's
const lookOf = s => { const a = s.alt / (Math.PI / 180); return a > 6 ? "day" : a < -6 ? "night" : s.az > 0 ? "dusk" : "dawn"; };
// what a look means for the sky: daylight, the warm glow, and whether that glow is the evening's (null: keep the last one);
// with no look (the real sky) or for Dawn and Dusk, all three come from the sun's height and side
const lookSky = (s, look) => {
  if (look === "night") return { d: 0, k: 0, eve: null };
  if (look === "day") return { d: 1, k: 0, eve: null };
  const k = glowOf(s.alt);
  return { d: dayOf(s.alt), k, eve: k > 0 ? (s.az > 0 ? 1 : 0) : null };
};
// midnight today on the temple's clock
const templeMidnight = t => {
  const wall = z => new Date(new Date(t).toLocaleString("en-US", { timeZone: z })).getTime();
  const off = wall(CONFIG.sky.tz) - wall("UTC");
  return Math.floor((t + off) / 864e5) * 864e5 - off;
};
// where the sun stands for a chosen look today: noon for Day (or the real sun if it is already well up), a little over the
// eastern horizon for Dawn and the western one for Dusk; the Night view draws no sun, so it stays where it is
function lookSun(look, sd, t) {
  const { lat, lon } = CONFIG.sky, deg = Math.PI / 180, mid = templeMidnight(t), at = u => Astro.sun(u, lat, lon);
  if (look === "day") return sd.alt >= 8 * deg ? sd : at(mid + 12 * 36e5);
  if (look === "night") return sd;
  const h = CONFIG.sky.twilight.look * deg, eve = look === "dusk";
  for (let u = mid + (eve ? 12 : 0) * 36e5, end = u + 12 * 36e5; u < end; u += 12e4) { const s = at(u); if (eve ? s.alt <= h : s.alt >= h) return s; }
  return sd;
}
function updateCelestial() {
  const { lat, lon, tz } = CONFIG.sky, now = Date.now(), deg = Math.PI / 180;
  const sd = Astro.sun(now, lat, lon);   // where the sun really is over the temple at this moment
  liveDaylight = dayOf(sd.alt); liveLook = lookOf(sd);
  const sunAt = skyLook == null ? sd : lookSun(skyLook, sd, now);
  skyGoal = lookSky(sunAt, skyLook);   // with no look chosen, the real sky follows the sun smoothly from one look to the next
  if (!dayFading()) { daylight = skyGoal.d; twilight = skyGoal.k; if (skyGoal.eve != null) twiEve = skyGoal.eve; }   // also settles a fade that a jump elsewhere cut short
  const ill = Astro.illumination(now);
  const mNow = Astro.moon(now, lat, lon), up = mNow.alt > -.01;
  const moon = { up, dir: skyDir(mNow.az, Math.max(mNow.alt, 0)), rot: ill.angle - mNow.q, az: mNow.az, alt: mNow.alt };
  temple.setCelestial({ sun: skyDir(sunAt.az, sunAt.alt), moon, moonTex: moonTexture(ill.fraction), fraction: ill.fraction, lst: Astro.lst(now, lon), at: now, lat });
  const fmt = t => new Date(t).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: tz });
  const height = a => a > 60 * deg ? "high in the " : a < 15 * deg ? "low in the " : "in the ";
  const rise = from => { for (let t = from; t < from + 864e5 * 1.1; t += 6e5) if (Astro.moon(t, lat, lon).alt > 0) return t; return null; };
  const name = phaseName(ill.phase), pct = Math.round(ill.fraction * 100), rises = up ? null : rise(now);
  const moonText = up ? `${name} moon, ${pct}% lit, ${height(mNow.alt)}${compass(mNow.az)}`
    : `${name} moon (${pct}% lit) is below the horizon${rises ? ", rises " + fmt(rises) : ""}`;
  const sunText = sd.alt > 0 ? `sun ${height(sd.alt)}${compass(sd.az)}` : "sun is down";
  const clock = fmt(now);
  skyNote = { night: `Now ${clock} in ${CONFIG.sky.place} · ${moonText}`,
              day: `Now ${clock} in ${CONFIG.sky.place} · ${sunText} · ${up ? moonText.replace(" moon,", " moon also up,") : "no moon in the sky"}` };
}
