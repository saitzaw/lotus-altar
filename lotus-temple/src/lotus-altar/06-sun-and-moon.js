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
// the moon's face: dark disc, the lit part with its terminator, a few maria; the lit limb is drawn at the top
// and the sprite is turned so it points the way it really does in the sky
function moonTexture(fraction) {
  const S = 256, R = 116, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(70,74,92,.6)"; g.beginPath(); g.arc(S / 2, S / 2, R, 0, TAU); g.fill();   // the dark side, faint with earthshine
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
function updateCelestial() {
  const { lat, lon, tz } = CONFIG.sky, now = Date.now(), deg = Math.PI / 180;
  const wall = z => new Date(new Date(now).toLocaleString("en-US", { timeZone: z })).getTime();
  const off = wall(tz) - wall("UTC"), midnight = Math.floor((now + off) / 864e5) * 864e5 - off;   // midnight on the temple's clock
  const sunNow = Astro.sun(now, lat, lon).alt;
  const dayT = sunNow > 8 * deg ? now : midnight + 12 * 36e5;            // the day view: now if it is daytime there, else today's noon
  const nightT = sunNow < -8 * deg ? now : midnight + 22 * 36e5;         // the night view: now if it is night there, else 10 pm tonight
  const ill = Astro.illumination(now);
  const moonAt = t => {
    const m = Astro.moon(t, lat, lon), up = m.alt > -.01;
    return { up, dir: skyDir(m.az, Math.max(m.alt, .02)), rot: Astro.illumination(t).angle - m.q, az: m.az, alt: m.alt };
  };
  const sd = Astro.sun(dayT, lat, lon), mN = moonAt(nightT), mD = moonAt(dayT);
  temple.setCelestial({ sun: skyDir(sd.az, Math.max(sd.alt, .1)), moonNight: mN, moonDay: mD, moonTex: moonTexture(ill.fraction), fraction: ill.fraction });
  // a line for the HUD: what is in the sky right now in the chosen view, and when the moon rises if it is down
  const fmt = t => new Date(t).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: tz });
  const height = a => a > 60 * deg ? "high in the " : a < 15 * deg ? "low in the " : "in the ";
  const rise = from => { for (let t = from; t < from + 864e5 * 1.1; t += 6e5) if (Astro.moon(t, lat, lon).alt > 0) return t; return null; };
  const moonText = m => {
    const name = phaseName(ill.phase), pct = Math.round(ill.fraction * 100);
    if (m.up) return `${name} moon, ${pct}% lit, ${height(m.alt)}${compass(m.az)}`;
    const r = rise(m === mN ? nightT : dayT);
    return `${name} moon (${pct}% lit) is below the horizon${r ? ", rises " + fmt(r) : ""}`;
  };
  skyNote = { night: `${nightT === now ? "Now" : "Tonight " + fmt(nightT)} in ${CONFIG.sky.place} · ${moonText(mN)}`,
              day: `${dayT === now ? "Now" : "Today " + fmt(dayT)} in ${CONFIG.sky.place} · sun ${height(sd.alt)}${compass(sd.az)} · ${mD.up ? moonText(mD).replace(" moon,", " moon also up,") : "no moon in the sky"}` };
}
