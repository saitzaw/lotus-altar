# MEMORY.md

Lessons from past sessions that still hold, for any agent working on Lotus Altar. `CONTINUUM.md` holds the project's current
state and its log, and `AGENTS.md` holds the rules. This file holds the gotchas you'd otherwise find out the hard way. Add a
lesson when you learn one, and delete a lesson once it stops being true.

## Git

- Commit and push straight to `main`, no feature branches. The remote is `git@github-personal:saitzaw/lotus-altar.git`
  (the `github-personal` SSH host, account `saitzaw`); don't push from another account.

## Building the world

- Anything a show or schedule hides and shows (dancers, players, audience, stalls) must start hidden or carry
  `userData.noCull = true`. The distance culling (`37-culling.js`) indexes every object visible at build time and, on each
  camera move, sets its `visible` from distance and view alone, overwriting what the show set: hidden figures pop back in as
  you walk, and only while moving. Something hidden at build time is never indexed, so it is safe.

- `build-dist.sh` joins the pieces in the order the *shell* sorts `src/<name>/*.js`, so it sets `LC_ALL=C` for the whole script.
  In other locales the dash is ignored and `18b-x.js` sorts before `18-y.js`, which drops a new piece into the middle of the
  previous function (here `toDancers` landed inside `kinnaraDancers` and was "not defined"). Prefix a new piece with the
  number of the piece before it plus a letter (`18b-`), and check its place with `grep -n "function name" dist/*.js`.

- r128's `BufferGeometry` has no `applyQuaternion` (added later); `node --check` can't see that, only the page does. Use
  `geo.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q))`.
- `CONFIG` lives in `lotus-altar.js` and isn't passed to `TempleFloors(ctx)`. Tweakable values for outdoor places in
  `temple-floors.js` go in a local constant next to the builder (`HILL`, `MON`, `FALLS`).
- The near hills (`peak()` in `mountainsAndForest`, a ring 150–165 m out) are wide cones, radius 30–46 m, so their feet
  come in close. The one at about (−149, −57) reaches x ≈ −112 and half-buries anything placed west of the stream's end.
  Check `peaks` before you place something at the edge of the world. Peaks that would cover the hospital road are skipped,
  so there's a gap in the ring there.
- The outside sky is a sphere (`SKY_R` in `33-pagoda-exterior.js`) with the day dome inside it at .94 × `SKY_R`, drawn over
  whatever lies beyond it. Anything built past ~.9 × `SKY_R` from the temple vanishes into sky (the Haw Kham's back courtyard did
  at the old 220). Before placing something far out, check its distance from the origin against `SKY_R`, and `worldR` for walkers.
- A walk surface gives one height per (x, z): `walkAt` has no y. Where two floors lie over the same ground (the clock tower's base
  and platform), the surface function reads `WALKER_Y` (the walker's feet, set by the walk each step) to pick the floor, and the
  climb between them (a ladder or stair) is its own ramp registered first. Anything that only blocks one floor (columns under a
  platform) belongs inside that function, not in a separate `sCircle`, which blocks every floor.
- Outdoors the camera's `far` is 1000 m, so depth precision depends on `near` (`CONFIG.camera.near.outdoor`, .3). At .1, a
  road 2 cm over the ground or a window just off a wall flickers ("blinks") 150 m away. Keep layered flat things at least
  2–3 cm apart, and never put two overlapping road boxes at the same height.
  Check boxes too, not only planes: a frame box whose front face is 1 cm in front of the pane it frames hides the pane
  except where depth fighting lets it through. Where two wall planes meet at a corner, run each past the corner so they close.
- The upper halls' balcony corridor runs right round the outside of the hall (walls at x = ±7.5, z = -5.5 and 7.5), so any
  piece of the hall that reaches past those walls (a wider wall plane, a column near a corner, the floor) shows on the corridor
  as a stray slab or stub, or flickers against the deck at y = 0. Keep everything in a hall inside that footprint.
- `surfAt` takes the first `SURF` entry whose shape holds the point, so a big `sRect` with a height function hides everything
  registered after it inside its rectangle (the hill's terraces, a later tree). Answer `undefined` from the function where it
  isn't yours (see `palaceLake`), and register things that should block inside it (trees) before it.
- A lot built in its own frame and turned (`s.rotation.y`) has its local ±x on different world sides depending on the turn: on
  the east road's east row (turned +π/2) local −x is north, not south. Work out which side is which from the turn before
  placing "the fence toward the previous lot", and check every boundary is closed once (a short script over the lot list does it).
- Hidden (culled) things skip the per-frame matrix update (`lazyMatrices`). If something reads `matrixWorld` or `localToWorld`
  at run time and gets an old place, call `updateWorldMatrix(true, false)` on it first, or turn `CONFIG.cull.lazy` off to check.
- Outdoor builders run before `mountainsAndForest`, so they can't read `peaks`. Hard-code the place and say why in a comment.

- Any extra render pass from another camera (like the rain's top-down cover map in `rainCover`) sees the grounds as the main
  camera's culling left them: whatever is out of the player's view is hidden, often the roof right overhead. Call
  `temple.uncull(x, z, r)` before the pass and hide what it returns straight after.

## Shadows and layers (r128)

- r128's `WebGLShadowMap` decides which objects cast by testing `object.layers` against the **viewer's** camera, not
  `light.shadow.camera.layers`. A mesh moved to another layer to be "shadow only" casts nothing. To make a mesh cast a shadow
  without showing, keep it on layer 0 and give it a material with `colorWrite: false, depthWrite: false`.

## The sky

- "The moon is gone" usually means the real moon is below the horizon: the sky follows the real moon over the temple
  (`CONFIG.sky`, Bangkok time), and the `#skyInfo` line says when it rises. Check with `Astro.moon(t, lat, lon).alt` in node
  before hunting for a rendering bug. The moon sprites draw in front of the black night domes; a low moon can sit behind the
  near hills, and the site owner chose to keep it that way (real sky, no lifting).
- To render the night sky at another time, stub the clock in a script placed before the three.js tag:
  `const T0 = Date.UTC(...); Date.now = () => T0;`.

- If a night (or any dark) scene outside looks lit like dusk no matter how low the lights go, it is the environment map
  (`world.environment`, `ENVS`): it lights every standard material on its own. Render once with every light hidden to tell
  lights from environment and emissive. Outside it now dims with the daylight (`envFor`).

## Where test runs live

Every headless test, screenshot, probe and benchmark goes in its own folder under `~/lotus-altar-tests/` (for example
`~/lotus-altar-tests/kathin-shot/`), never loose in `$HOME` and never in the repo. The folder is outside the repo because it
holds about 1 GB of screenshots and Chromium profiles, and under `$HOME` because snap Chromium can't use `/tmp`. Put each
run's `--user-data-dir` inside its folder too (`prof-a`, `prof-b`, …). Older runs from before 2026-11-25 (`balloontest`,
`perfbench`, `eastshot`, …) were moved there with their script paths updated.

## Measuring speed in headless Chromium

- For numbers (draw calls, render ms, load timings), headless Chromium on the real GPU works and is quick (~30 s a run): no
  swiftshader flags, a fresh `--user-data-dir` under `~/lotus-altar-tests/` for every run (a profile left by a killed run stays locked and
  the next run prints nothing at all), `--virtual-time-budget=60000 --dump-dom`, and a probe script loaded right after
  `lotus-altar.js` that reads a `window.__probe = { THREE, renderer, world, camera, temple }` line added just before the last
  `})();` of the copied `lotus-altar.js`. Swiftshader is far too slow for the full outdoor world (no frame within 400 s).
- Snap Chromium writes nothing when its output is redirected straight to a file; pipe it (`2>&1 | grep CONSOLE | cat > f`).
- A batched original sits on layer 31 (`temple.batchLayer`). If something outdoors draws nowhere but still answers a tap, or a
  change to one mesh seems to do nothing for a moment, it was welded into a batch: see "Static batching" in
  `references/optimization.md`. Turn `CONFIG.cull.batch` off to rule it out.

## Checking a change in headless Chromium

Plain `chromium --headless --screenshot` of an outdoor view usually comes back black, or shows the hall or the overview.
Software rendering (swiftshader) is too slow for the frame to land before the capture, and `setTimeout` steps break under
`--virtual-time-budget`. What works:

1. Build, copy `dist/` to a new folder under `~/lotus-altar-tests/` (snap Chromium can't use `/tmp`), and serve it on a spare port.
2. In the copy's `lotus-altar.js` (the joined file in `dist/`) (the code is inside an IIFE), add this right after `const controls = new THREE.OrbitControls(...)`:
   `window.__t={camera,controls,renderer,world,enterWalk:(...a)=>enterWalk(...a)};`
3. The page opens on the real sun, so a run after dark opens at night (the Day button switches, but clicking it from a test fades over ~1.6 s of the frame clock, which headless frames advance only ~4 ms at a time; `--force-prefers-reduced-motion` makes it instant). Force day by opening the page as `http://localhost:<port>/?day=1`
   (that shortcut works on localhost only). The sun and moon still sit where they are at that moment.
4. Drive the test by counting `requestAnimationFrame` frames, not with timers. At frame ~4 call `__t.enterWalk([x,z],[lx,lz],"t")`.
   At frame ~5–7, set `camera.position` and `camera.lookAt` yourself, call `temple.cull(camera, 800)` (expose it on `__t`; else
   the town's distance culling still matches the old view and only the instanced windows show, floating), then `renderer.render(world, camera)`, then in the same
   task `console.log("IMG"+renderer.domElement.toDataURL("image/jpeg",.85))`. Later frames may never arrive within the budget.
5. If the log shows "Error creating WebGL context", launch with `--use-angle=swiftshader --enable-unsafe-swiftshader` (not
   `--disable-gpu`). Frames then take about 3 s each, so start counting frames only once `window.__t` exists and do the work
   in the first few frames after that.
   Try the real GPU first (no angle flags): on 2026-11-27 swiftshader hung inside the first `renderer.render` of the street with
   the procession out, while the GPU run gave three shots in under 5 minutes.
6. If a run prints no `CONSOLE` lines at all and the screenshot is black, the page never reached your capture frame inside the
   budget: raise `--virtual-time-budget` (240000 works) rather than hunting for an error.
7. Add `--enable-logging=stderr`, or snap Chromium prints no `CONSOLE` lines at all. Run with `--virtual-time-budget=60000` and pipe the output (`2>&1 | grep CONSOLE > log.txt`). A plain `> log.txt 2>&1`
   redirect comes out empty with snap Chromium. Base64-decode the `IMG` line to a `.jpg` and look at it. One run takes about
   3 minutes.

Traps:
- To hear a synthesized sound without a speaker or a user gesture, copy its function into the test page, run it on an
  `OfflineAudioContext` (stub `audio`, `amb.out`, `amb.buf`, `rand`), encode the result as a 16-bit WAV, log it as base64 and
  decode it to a file for the owner to play.
  Under `--virtual-time-budget` the page can finish before the audio thread does, so a longer render often never resolves
  (it looks like a hang, with no error). Keep the page really busy until it is done: a `setTimeout` chain whose callbacks each
  spin a counted loop (`for (i < 3e7)`, not a `Date.now()` wait, which virtual time freezes), stopping once the WAV is logged.
- When writing a rendered sound to a WAV, normalise by its peak; a fixed gain with a clamp clips the loud strokes and puts
  clicks in the file that the site itself doesn't make.
- Use `--screenshot=<file>`, not `--dump-dom`: with `--dump-dom` no `CONSOLE` lines come out, so the `IMG` log is lost.
- The test machine's clock may already be inside a timed show (e.g. the kinnara solo at 2–3:45 PM ICT), so the scene animates
  during the first frames before your script steps it; expect a phase offset, or force the switch off first.
- A back-to-back run can come back at once with an empty log (snap Chromium still holding the last profile): give each run its
  own `--user-data-dir`. Check the port first too (`curl localhost:PORT/...`); an old test server from an earlier session may
  still be serving a different copy on it.
- The page may open in first-person walk mode. Clicking `#leaveMarketBtn` already takes you outside, so clicking
  `#outsideBtn` after it sends you back into the floor-1 hall.
- Log a `window` `error` listener in the test script, or build errors go unseen.
- If a place you aimed at comes out missing, the distance culling hid it: `temple.cull` builds its frustum from
  `camera.matrixWorldInverse`, which only `renderer.render` refreshes, so a camera you just moved is culled with the old view.
  Set `temple.culling = false` (expose `temple` on `__t` with a getter) before rendering, or refresh the inverse yourself.
- To find an outdoor place's world position, look up a clickable by its tip (`world.traverse`, `userData.tip`) and use its
  parent's `localToWorld`; the grounds' frame is not the world frame.
- Launch each headless run with its own `--user-data-dir` under `~/lotus-altar-tests/`, one at a time: two at once, or a reused profile, can exit
  at once with no console output.
- Don't stop the test server with `pkill -f <pattern>` when the pattern also matches your own shell command, because that
  kills the shell. Kill it by PID instead, and leave the run's folder in `~/lotus-altar-tests/`.
- JavaScript's `%` keeps the sign, so `arr[n % 2]` is `undefined` for negative `n` (a bar count that starts below zero). Use
  `n & 1` or `((n % k) + k) % k`. An exception in the frame loop turns the whole screen black, so after touching anything
  that runs every frame, load the page plainly (no hooks into the internals) and check it renders and logs no errors.
- A WebAudio `GainNode` sits at its default gain 1 until its first scheduled event. A source that starts on a fractional frame
  can push one sample through before `setValueAtTime(.0001, t)` takes over: a single-sample click, loudest after a highpass.
  Set `g.gain.value = 0` first.
- A copyrighted recording with no license (most YouTube uploads) can be measured for tuning, but don't ship it or a sample of
  it. A citation doesn't make it allowed.
- A material `color` is linear, so it renders much lighter than the same hex in a canvas texture: `0x1e0e07` comes out a
  mid orange-brown in sunlight. For near-black wood use about `0x0c0503`; canvas colours (sRGB) look as written.
- A walker is kept `PAD` (.35 m) off a solid, but outdoors the near plane's corners reach ~.4 m (near .3), and once they enter a
  box you see through the whole box. A thin wall (≲1 m) with a plain `sRect` shows the far side when you stand beside it and turn.
  Give compound walls and gate pillars `sWall`/`sPillar` (another .2 m, so .55 m in all, like the temple's `BLOCK.segs`).
- `surfAt` (in `13-stupa-hill.js`) returns the first `SURF` entry that contains the point. A post's `sCircle` registered after
  the walkable `sRect` it stands on (a verandah, a landing) is never checked, so walkers pass through it and the near plane cuts
  it open. Register blockers before the surface under them.
