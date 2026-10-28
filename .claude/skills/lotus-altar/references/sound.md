# Sound

All sound is synthesized in WebAudio in `lotus-altar.js`; there are no audio files.

## Switching it on and off

- The master switch is the `#soundOn` checkbox (in the Recite panel); the HUD `#soundBtn` toggles the same checkbox.
  Check `$("soundOn").checked` before making any sound.
- Browsers keep audio off until a gesture, so `ambStart()` runs on the first `pointerdown` or `keydown`. The context is
  suspended while the tab is hidden.

## One-off tones

- `tone(freq, endFreq, peak, decay, type, start)` plays straight to the speakers: the wooden fish (`knock`), the altar
  bell (`bell`), the four-face top, the Bell Tower when tapped (via `ctx.tone` in `temple-floors.js`).
- `ping(freq, peak, decay, delay, swell, type)` plays into the ambience bus (`amb.out`) and returns the oscillator so
  you can bend its pitch.

## The ambience (`ambStart`, `ambStep`)

- One shared 2-second noise buffer feeds filtered noise beds (`bed(filters, am)`): the banyan's breeze, the open-air
  breeze (fields, hilltop, faintly anywhere outside), rice, cicadas (beating
  at 42 Hz), rain (muffled indoors).
- **Every wind follows one pattern** (`breath(b, len, gap, moan, level)` in `ambStep`, state in `amb.breaths`): a soft
  breeze for a few seconds that swells in and dies away, then stillness (shorter in windy weather). At night each breath
  carries a faint low moan. Three winds: `banyan`, `field`, `hill`; the stupas' hti bells ring mostly during a hill
  breath. New wind sounds should use `breath` too, never a constant bed.
- The banyan and the field blow **once**, at a random moment (the first within a minute of the sound starting), then
  lie still for `CONFIG.ambience.windRest` (13–17 min), whatever the weather. The hill keeps short gaps (4–12 s).
- One-offs on their own timers (`due(name, min, max)`): stupa hti bells (`tinkle`), the Bell Tower bell (`templeBell`),
  the Lotus Temple hall gong (`gong`), birds by day, crickets at night, thunder in heavy rain.
- Where sounds come from is `temple.sounds` in `temple-floors.js` (stupa, bell, gong, compound, banyan,
  fields, `forestZ`). `ambStep` fades each in by distance with `near(d, r0, r1)`: full within `r0` metres,
  silent past `r1`.
- Indoors only rain (muffled) and the bell and gong are heard; inside the Bell Tower or the Lotus Temple hall their own
  bell or gong plays at full loudness.
- Tunables in `CONFIG.ambience`: `volume`, `bellEvery`, `gongEvery` (seconds between strokes), `windRest`.

## Adding a sound

Add the place to `sounds` in `temple-floors.js`, then a level for it in `ambStep` (a `bed` for a steady sound, or a
`due` timer plus a `ping`-based voice for a one-off). Keep levels low; headless Chrome can't play audio, so check by ear
in a real browser.
