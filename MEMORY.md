# MEMORY.md

Lessons from past sessions that still hold, for any agent working on Lotus Altar. `CONTINUUM.md` holds the project's current
state and its log, and `AGENTS.md` holds the rules. This file holds the gotchas you'd otherwise find out the hard way. Add a
lesson when you learn one, and delete a lesson once it stops being true.

## Git

- Commit and push straight to `main`, no feature branches. The remote is `git@github-personal:saitzaw/lotus-altar.git`
  (the `github-personal` SSH host, account `saitzaw`); don't push from another account.

## Building the world

- `CONFIG` lives in `lotus-altar.js` and isn't passed to `TempleFloors(ctx)`. Tweakable values for outdoor places in
  `temple-floors.js` go in a local constant next to the builder (`HILL`, `MON`, `FALLS`).
- The near hills (`peak()` in `mountainsAndForest`, a ring 150–165 m out) are wide cones, radius 30–46 m, so their feet
  come in close. The one at about (−149, −57) reaches x ≈ −112 and half-buries anything placed west of the stream's end.
  Check `peaks` before you place something at the edge of the world. Peaks that would cover the hospital road are skipped,
  so there's a gap in the ring there.
- Outdoor builders run before `mountainsAndForest`, so they can't read `peaks`. Hard-code the place and say why in a comment.

## The sky

- "The moon is gone" usually means the real moon is below the horizon: the sky follows the real moon over the temple
  (`CONFIG.sky`, Bangkok time), and the `#skyInfo` line says when it rises. Check with `Astro.moon(t, lat, lon).alt` in node
  before hunting for a rendering bug. The moon sprites draw in front of the black night domes; a low moon can sit behind the
  near hills, and the site owner chose to keep it that way (real sky, no lifting).
- To render the night sky at another time, stub the clock in a script placed before the three.js tag:
  `const T0 = Date.UTC(...); Date.now = () => T0;`.

## Checking a change in headless Chromium

Plain `chromium --headless --screenshot` of an outdoor view usually comes back black, or shows the hall or the overview.
Software rendering (swiftshader) is too slow for the frame to land before the capture, and `setTimeout` steps break under
`--virtual-time-budget`. What works:

1. Build, copy `dist/` to a throwaway folder under `$HOME` (snap Chromium can't use `/tmp`), and serve it on a spare port.
2. In the copy's `lotus-altar.js` (the code is inside an IIFE), add this right after `const controls = new THREE.OrbitControls(...)`:
   `window.__t={camera,controls,renderer,world,enterWalk:(...a)=>enterWalk(...a)};`
3. Force day before the page loads, with a script placed before the three.js tag:
   `localStorage.setItem("lotus-altar-daylight","1")`.
4. Drive the test by counting `requestAnimationFrame` frames, not with timers. At frame ~4 call `__t.enterWalk([x,z],[lx,lz],"t")`.
   At frame ~5–7, set `camera.position` and `camera.lookAt` yourself, call `temple.cull(camera, 800)` (expose it on `__t`; else
   the town's distance culling still matches the old view and only the instanced windows show, floating), then `renderer.render(world, camera)`, then in the same
   task `console.log("IMG"+renderer.domElement.toDataURL("image/jpeg",.85))`. Later frames may never arrive within the budget.
5. If the log shows "Error creating WebGL context", launch with `--use-angle=swiftshader --enable-unsafe-swiftshader` (not
   `--disable-gpu`). Frames then take about 3 s each, so start counting frames only once `window.__t` exists and do the work
   in the first few frames after that.
6. Run with `--virtual-time-budget=60000` and pipe the output (`2>&1 | grep CONSOLE > log.txt`). A plain `> log.txt 2>&1`
   redirect comes out empty with snap Chromium. Base64-decode the `IMG` line to a `.jpg` and look at it. One run takes about
   3 minutes.

Traps:
- To hear a synthesized sound without a speaker or a user gesture, copy its function into the test page, run it on an
  `OfflineAudioContext` (stub `audio`, `amb.out`, `amb.buf`, `rand`), encode the result as a 16-bit WAV, log it as base64 and
  decode it to a file for the owner to play.
- Use `--screenshot=<file>`, not `--dump-dom`: with `--dump-dom` no `CONSOLE` lines come out, so the `IMG` log is lost.
- The test machine's clock may already be inside a timed show (e.g. the kinnara solo at 2–3:45 PM ICT), so the scene animates
  during the first frames before your script steps it; expect a phase offset, or force the switch off first.
- The page may open in first-person walk mode. Clicking `#leaveMarketBtn` already takes you outside, so clicking
  `#outsideBtn` after it sends you back into the floor-1 hall.
- Log a `window` `error` listener in the test script, or build errors go unseen.
- If a place you aimed at comes out missing, the distance culling hid it: `temple.cull` builds its frustum from
  `camera.matrixWorldInverse`, which only `renderer.render` refreshes, so a camera you just moved is culled with the old view.
  Set `temple.culling = false` (expose `temple` on `__t` with a getter) before rendering, or refresh the inverse yourself.
- To find an outdoor place's world position, look up a clickable by its tip (`world.traverse`, `userData.tip`) and use its
  parent's `localToWorld`; the grounds' frame is not the world frame.
- Launch each headless run with its own `--user-data-dir` under `$HOME`, one at a time: two at once, or a reused profile, can exit
  at once with no console output.
- Don't stop the test server with `pkill -f <pattern>` when the pattern also matches your own shell command, because that
  kills the shell. Kill it by PID instead, and delete the throwaway folder afterwards.
