/* ---------- the sounds outside, made on the fly in WebAudio (no recordings): wind in the banyan and over the paddies,
   birds and cicadas by day and crickets by night at the forest, the hti bells on the stupas, the temple bell
   and the gong in the Lotus Temple hall now and then, the waterfall's roar, and the rain ---------- */
let amb = null;
const rand = (a, b) => a + Math.random() * (b - a);
function ambStart() {
  if (amb || !$("soundOn").checked) return;
  const a = ac(); if (!a) return;
  const out = a.createGain(); out.gain.value = 0; out.connect(a.destination);
  const buf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  // a bed of noise shaped by filters [type, freq, Q], optionally beating at `am` Hz (insects), into its own gain
  const bed = (filters, am) => {
    const s = a.createBufferSource(); s.buffer = buf; s.loop = true;
    let n = s; const fs = filters.map(([type, f, q]) => { const fl = a.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; n.connect(fl); return n = fl; });
    if (am) { const m = a.createGain(), o = a.createOscillator(), og = a.createGain(); m.gain.value = .5; o.frequency.value = am; og.gain.value = .5; o.connect(og); og.connect(m.gain); o.start(); n.connect(m); n = m; }
    const g = a.createGain(); g.gain.value = 0; n.connect(g); g.connect(out); s.start(0, Math.random() * 1.9);
    return { g, fs };
  };
  amb = {
    out, buf,
    leaves: bed([["bandpass", 900, .5], ["lowpass", 1800, .7]]),   // a breeze through the banyan: airy, not a hiss
    wind: bed([["bandpass", 650, .5], ["lowpass", 1400, .7]]),   // a breeze over the open fields and the hilltop: airy, not a rumble
    rice: bed([["highpass", 2800, .5]]),                          // the ripe rice hissing in it
    cicada: bed([["bandpass", 5200, 9]], 42),
    rain: bed([["highpass", 450, .5], ["lowpass", 4200, .5]]),
    falls: bed([["lowpass", 1100, .6], ["highpass", 120, .5]]),   // the waterfall's steady roar into its pool
    breaths: { banyan: { left: 0, wait: rand(5, 40) }, field: { left: 0, wait: rand(10, 60) }, hill: { left: 0, wait: rand(1, 5) } },
    next: { tink: 0, bird: 2, cricket: 0, bell: rand(8, 25), gong: rand(4, 20), thunder: rand(15, 40) }
  };
}
// one struck or plucked tone into the ambience: freq, loudness, ring time, delay, swell (a gong's upper partials bloom)
function ping(f, peak, decay, t0 = 0, swell = .004, type = "sine") {
  if (peak < .0005) return null;
  const a = audio, t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + swell); g.gain.exponentialRampToValueAtTime(.0001, t + decay);
  o.connect(g); g.connect(amb.out); o.start(t); o.stop(t + decay + .05); return o;
}
// the little bells hung from the stupas' hti crowns, swung by the wind
const tinkle = v => { const f = [2093, 2349, 2637, 3136, 3520][(Math.random() * 5) | 0] * rand(.99, 1.01); ping(f, v, 1.8); ping(f * 2.76, v * .35, .8); ping(f * 5.4, v * .12, .35); };
// the great bell in the Bell Tower, struck with the log (the same voice as ringing it yourself)
const templeBell = v => [[98, .35, 7], [196 * 1.19, .14, 5], [98 * 2.76, .09, 3.5], [98 * 5.4, .04, 2]].forEach(([f, p, d]) => ping(f, p * v, d));
// the hall's gong: a low hum whose upper partials swell after the stroke, the note sagging a little as it settles
function gong(v) {
  const o = ping(110, .5 * v, 8); if (o) o.frequency.exponentialRampToValueAtTime(104, audio.currentTime + 1.5);
  [[1.52, .3, 6, .15], [2.13, .22, 5, .3], [2.8, .14, 4, .45], [3.6, .09, 3, .6], [4.9, .05, 2.2, .7]].forEach(([r, p, d, s]) => ping(110 * r, p * v, d, 0, s));
}
/* ---------- the Shan ensemble on the festival stage: the long drum (ၵွင်ယၢဝ်း), a row of bossed gongs (မွင်း) and cymbals (ၸၢပ်ႈ), one stroke at a time
   as the players strike (temple.takeBand()). Their own bus with a short reverb: the pavilion roof and the open ground. No two
   strokes alike; `t0` lets each sound wait for the hand to land ---------- */
function bandBus() {
  if (amb.band) return amb.band;
  const a = audio, bus = a.createGain(), cv = a.createConvolver(), wet = a.createGain(), n = a.sampleRate * .9 | 0, ir = a.createBuffer(2, n, a.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (a.sampleRate * .16)) * (i < a.sampleRate * .012 ? 0 : 1); }
  cv.buffer = ir; wet.gain.value = .22; bus.connect(amb.out); bus.connect(cv); cv.connect(wet); wet.connect(amb.out);
  return amb.band = bus;
}
// a tone into the band: from f0 sliding to f1 over `glide` s, rising to `peak` in `attack` s and dying away by `decay`
function bandTone(t, f0, f1, glide, peak, decay, type = "sine", attack = .004) {
  if (peak < .0005) return; const a = audio, o = a.createOscillator(), g = a.createGain(); o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + glide);
  g.gain.value = 0; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + decay);   // silent until its moment, so no stray first sample clicks
  o.connect(g); g.connect(bandBus()); o.start(t); o.stop(t + decay + .05);
}
// a burst of noise into the band through a filter
function bandHiss(t, type, f, q, peak, decay, attack = .002) {
  const a = audio, s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(); s.buffer = amb.buf; s.loop = true; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  g.gain.value = 0; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak + .0002, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + decay);
  s.connect(fl); fl.connect(g); g.connect(bandBus()); s.start(t, Math.random()); s.stop(t + decay + .03);
}
// the long drum, voiced after a recording of a Shan oh-zi ensemble (measured, not sampled): "dum", the fist in the head's centre,
// is a short woody knock over the gongs' hum, not a sung note: modes near 530, 290, 442 and 384 Hz, a body near 132 and 88 Hz, and
// the skin's soft thud, all gone in about a quarter of a second; "ting", the open stroke near the rim, ringing with clear harmonics;
// "tak", the flat hand's muffled slap. `tune` sets one drum against another (the stage's two drums are tuned alike)
const DRUM_MODES = [[88, .2, .45], [132, .5, .4], [149, .4, .35], [214, .26, .3], [290, .62, .3], [384, .52, .25], [442, .6, .25], [530, 1, .22]];   // [Hz, level, seconds]
function longDrum(kind, v, t0 = 0, tune = 1) {
  const t = audio.currentTime + t0, r = rand(.996, 1.004) * tune; v *= rand(.85, 1.1);
  if (kind === "dum") {
    DRUM_MODES.forEach(([f, p, d]) => bandTone(t, f * 1.02 * r, f * r, .03, p * v, d, "sine", .003));
    bandHiss(t, "bandpass", 130, 1.2, .5 * v, .12, .004); bandHiss(t, "bandpass", 900, 1, .2 * v, .06, .002);   // the fist's thud and the skin's slap
  } else if (kind === "ting") {
    [[196, .45, .7], [392, .22, .45], [588, .1, .3], [784, .04, .2]].forEach(([f, p, d]) => bandTone(t, f * r, f * r * .96, .3, p * v, d));
    bandHiss(t, "bandpass", 1900, 1.4, .14 * v, .025);
  } else {
    bandTone(t, 180 * r, 135 * r, .05, .3 * v, .12); bandHiss(t, "bandpass", 1100, 1.3, .55 * v, .07); bandHiss(t, "highpass", 3200, .7, .12 * v, .025);
  }
}
// a gong of the row: bronze, bossed, struck with a padded beater, pitch `f`. Struck every second beat, the row never stops
// humming (in the recording its notes hardly fall between strokes), so each gong is a standing bank of steady tones that every
// stroke swells and that then fade over several seconds: [ratio to the note, level, seconds to fall by 1/e], the near pair
// beating slowly; the smaller gongs fade sooner. Each stroke adds its energy to what is still ringing
const GONG_MODES = [[1, 1, 6], [1.0015, .2, 5], [2, .2, 3], [2.03, .15, 2.5], [3, .06, 2]];
function stageGong(v, f, t0 = 0, thump = true) {
  const a = audio, t = a.currentTime + t0, k = Math.sqrt(262 / f); v *= rand(.9, 1.05);
  const bank = (amb.gongs ||= {})[f] ||= GONG_MODES.map(([m, p, tau]) => {
    const o = a.createOscillator(), g = a.createGain(); o.frequency.value = f * m; g.gain.value = 0; o.connect(g); g.connect(bandBus()); o.start();
    return { g: g.gain, p, tau: tau * k, lvl: 0, at: 0 };
  });
  bank.forEach(m => {
    const now = m.lvl * Math.exp(-Math.max(0, t - m.at) / m.tau), to = Math.hypot(now, m.p * v);
    m.g.cancelScheduledValues(t); m.g.setTargetAtTime(to, t, .006); m.g.setTargetAtTime(0, t + .03, m.tau); m.lvl = to; m.at = t + .03;
  });
  if (thump) bandHiss(t, "lowpass", 300, .7, .3 * v, .06);   // the beaters' soft thump (once for a chord)
}
// the cymbals, struck together and swung apart: a crash of noise across the whole range, measured band by band from a recording
// of a Shan oh-zi ensemble [centre Hz, Q, level, seconds to die away], the top dying first, with faint rings riding over it in
// beating pairs [Hz, level], only a little above the wash, never a whistle
const CYM_WASH = [[1100, 1.5, 1.6, 1], [1550, 2, 1.5, 2], [2200, 1.5, .3, 1.5], [3000, 1.5, .55, 1.5], [4100, 1.5, .7, 1.8], [5900, 1.5, .45, 1], [8500, 1.2, .18, .5], [12000, 1, .06, .3]];
const CYM_RINGS = [[1061, .5], [1512, .8], [1717, .8], [3990, .8], [4020, .7], [7037, .4], [7078, .5], [10453, .25]];
function stageCymbals(v, t0 = 0) {
  const t = audio.currentTime + t0; v *= rand(.85, 1.1);
  CYM_WASH.forEach(([f, q, p, d]) => bandHiss(t, "bandpass", f * rand(.97, 1.03), q, p * v, d * rand(.85, 1.1), .002));
  CYM_RINGS.forEach(([f, p]) => bandTone(t, f, f, .05, .02 * p * v, rand(.5, .9), "sine", .002));
  bandHiss(t, "highpass", 3000, .7, .25 * v, .04, .001);   // the clash itself, a crack across the top as the plates meet
}
// a bulbul's call: a few quick whistled notes sliding up or down
function bird(v) {
  const base = rand(1800, 3400), n = 2 + (Math.random() * 4 | 0);
  for (let i = 0; i < n; i++) { const o = ping(base * rand(.85, 1.2), v, .12, i * rand(.1, .16), .01); if (o) o.frequency.exponentialRampToValueAtTime(base * rand(.7, 1.5), audio.currentTime + i * .13 + .09); }
}
const crickets = v => { const f = rand(4100, 4700); for (let i = 0; i < 3; i++) ping(f, v, .04, i * .06); };
// far thunder in heavy rain: a burst of noise through a low filter
function thunder(v) {
  const a = audio, t = a.currentTime, s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  s.buffer = amb.buf; s.loop = true; fl.type = "lowpass"; fl.frequency.value = 140;
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .4); g.gain.exponentialRampToValueAtTime(.0001, t + 5);
  s.connect(fl); fl.connect(g); g.connect(amb.out); s.start(t, Math.random()); s.stop(t + 5.1);
}
function ambStep(dt) {
  const band = temple.takeBand();   // taken every frame so strokes never pile up while the sound is off
  if (!amb) return;
  const a = audio, on = $("soundOn").checked, T = a.currentTime;
  amb.out.gain.setTargetAtTime(on ? CONFIG.ambience.volume : 0, T, .3);
  if (!on) return;
  const S = temple.sounds, p = camera.position, out = current === "pagoda" || inCorridor, day = daylight > .5;
  const near = (d, r0, r1) => clamp(1 - (d - r0) / (r1 - r0), 0, 1);   // 1 within r0 metres, fading to nothing at r1
  const toRect = ([x0, x1, z0, z1]) => Math.hypot(Math.max(x0 - p.x, 0, p.x - x1), Math.max(z0 - p.z, 0, p.z - z1));
  const gust = .55 + .25 * Math.sin(now * .31) + .2 * Math.sin(now * .83 + 1), wind = (.4 + .6 * wx.wind) * gust, wet = wx.rain;
  let leaves = 0, field = 0, forest = 0, stupa = 0, falls = 0;
  if (out) {
    leaves = near(Math.hypot(p.x - S.banyan[0], p.z - S.banyan[1]), 5, 25);
    field = near(toRect(S.fields), 0, 25);
    forest = clamp((S.forestZ + 20 - p.z) / 25, 0, 1);   // from 20 m short of the trees to a few metres in
    stupa = near(Math.hypot(p.x - S.stupa[0], p.y - S.stupa[1], p.z - S.stupa[2]), 14, 50);
    falls = near(Math.hypot(p.x - S.falls[0], p.z - S.falls[1]), 6, 55);
  }
  const set = (b, v) => b.g.gain.setTargetAtTime(v, T, .5);
  set(amb.cicada, day && wet < .5 && out ? .02 + .05 * forest : 0);
  set(amb.rain, .28 * wet * (out ? 1 : .35));
  set(amb.falls, .22 * falls * falls * (1 + .5 * wet));   // louder in the rains
  amb.rain.fs[1].frequency.setTargetAtTime(out ? 4200 : 900, T, .3);   // muffled by the roof indoors
  // the one-off sounds, each on its own timer
  const due = (k, a0, a1) => (amb.next[k] -= dt) < 0 && (amb.next[k] = rand(a0, a1), true);
  // every wind follows one pattern: a breath of soft breeze for a few seconds, swelling in and dying away, then stillness.
  // At night each breath carries a faint low moan, falling as it fades. `byWeather`: windy weather shortens the stillness
  const breath = (b, len, gap, moan, level, byWeather = true) => {
    if (b.left > 0) b.left -= dt;
    else if ((b.wait -= dt) < 0) {
      b.left = rand(...len); b.wait = rand(gap[0], gap[1] - (byWeather ? (gap[1] - gap[0]) * .6 * wx.wind : 0));
      if (!day && level > .05) { const f = rand(...moan), o = ping(f, .01 * level, b.left + 1, 0, b.left * .45); if (o) o.frequency.linearRampToValueAtTime(f * .9, T + b.left + 1); }
    }
    return b.left > 0 ? 1 : 0;
  };
  // the banyan and the fields blow once, at a random moment, then lie still for a quarter of an hour or so
  const rest = CONFIG.ambience.windRest;
  const tree = breath(amb.breaths.banyan, [3, 6], rest, [300, 420], leaves, false);   // through the banyan's hanging roots
  const open = breath(amb.breaths.field, [4, 8], rest, [200, 300], field, false);     // across the paddies, and faintly anywhere outside
  const hill = breath(amb.breaths.hill, [2, 5], [4, 12], [260, 360], stupa);           // round the stupas on the hilltop
  const soft = .6 + .4 * gust;
  amb.leaves.g.gain.setTargetAtTime(.16 * leaves * soft * tree, T, 1.2);
  amb.wind.g.gain.setTargetAtTime(((.13 * field + (out ? .02 : 0)) * open + .1 * stupa * hill) * wind, T, 1.4);
  amb.rice.g.gain.setTargetAtTime(.025 * field * wind * open, T, 1.4);
  // the hti bells ring as a breath passes over the hilltop, and only now and then in the stillness between
  if (stupa > .02 && due("tink", hill ? .12 : 3, hill ? 1.2 : 9)) tinkle(.06 * stupa * (hill ? soft : .5));
  const birds = out && day && wet < .5 ? Math.max(forest, .2) : 0;
  if (birds && due("bird", 1.2, 5)) bird(.035 * birds);
  if (out && !day && due("cricket", .25, .9)) crickets(.012 * Math.max(forest, field, .35));
  const [b0, b1] = CONFIG.ambience.bellEvery, [g0, g1] = CONFIG.ambience.gongEvery, inYard = d => out ? near(d, 8, 75) : .12;
  if (due("bell", b0, b1)) templeBell(current === "bell" ? 1 : .6 * inYard(Math.hypot(p.x - S.bell[0], p.z - S.bell[1])));
  if (due("gong", g0, g1)) gong(current === "library" ? 1 : .6 * inYard(Math.hypot(p.x - S.gong[0], p.z - S.gong[1])));
  // the ensemble on the festival stage, stroke by stroke as the players play (heard outside only)
  if (band.length && out) {
    const v = near(Math.hypot(p.x - S.stage[0], p.z - S.stage[1]), 8, 80);
    // each stroke lands a fixed 0.1 s after it fell, on the audio clock, so frame-to-frame jitter never shakes the rhythm
    const wall = performance.now() / 1000;
    if (v > .01) band.forEach(([k, s, f, due]) => { const t0 = Math.max(0, .1 - (wall - due)); k === "gong" ? f.forEach(([hz, w], i) => stageGong(.17 * v * s * w, hz, t0, !i)) : k === "cym" ? stageCymbals(.08 * v * s, t0) : longDrum(k, .155 * v * s, t0); });
  }
  if (wet > .7 && due("thunder", 25, 70)) thunder(.35 * (out ? 1 : .5));
}
// the sound starts with the first tap or key (browsers keep audio off until then); off in a hidden tab
["pointerdown", "keydown"].forEach(ev => addEventListener(ev, ambStart, { passive: true }));
document.addEventListener("visibilitychange", () => { if (audio) document.hidden ? audio.suspend() : audio.resume(); });
function soundButton() {
  const on = $("soundOn").checked, b = $("soundBtn");
  b.textContent = on ? "🔊 Sound" : "🔇 Sound"; b.title = on ? "Turn sound off" : "Turn sound on"; b.setAttribute("aria-pressed", String(on));
}
$("soundOn").addEventListener("change", () => { soundButton(); ambStart(); });
$("soundBtn").addEventListener("click", () => { $("soundOn").checked = !$("soundOn").checked; soundButton(); ambStart(); });

// indoors the camera may pull well back, but never through a wall, the floor or the ceiling
function keepInside() {
  if (current === "pagoda" && !inMarket) {   // outside, never sink into the stupa hill
    const p = camera.position, h = temple.groundAt(p.x, p.z) + 2;
    if (p.y < h) p.y = h;
    return;
  }
  if (current === "pagoda" || inCorridor || inStairs) return;
  const p = camera.position;
  p.set(clamp(p.x, -7.0, 7.0), clamp(p.y, .5, 6.5), clamp(p.z, -5.1, 7.1));
}
