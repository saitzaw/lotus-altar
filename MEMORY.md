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
   At frame ~5–7, set `camera.position` and `camera.lookAt` yourself, call `renderer.render(world, camera)`, then in the same
   task `console.log("IMG"+renderer.domElement.toDataURL("image/jpeg",.85))`. Later frames may never arrive within the budget.
5. Run with `--virtual-time-budget=60000` and pipe the output (`2>&1 | grep CONSOLE > log.txt`). A plain `> log.txt 2>&1`
   redirect comes out empty with snap Chromium. Base64-decode the `IMG` line to a `.jpg` and look at it. One run takes about
   3 minutes.

Traps:
- The page may open in first-person walk mode. Clicking `#leaveMarketBtn` already takes you outside, so clicking
  `#outsideBtn` after it sends you back into the floor-1 hall.
- Log a `window` `error` listener in the test script, or build errors go unseen.
- Don't stop the test server with `pkill -f <pattern>` when the pattern also matches your own shell command, because that
  kills the shell. Kill it by PID instead, and delete the throwaway folder afterwards.
