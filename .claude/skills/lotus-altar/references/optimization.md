# Performance

The site has to run on phones. Before adding anything to the outdoor world, the frame loop or the audio, check it
against this list.

## Drawing less

- **Instancing:** a static, unclickable part repeated more than a few times goes through `part()` + `bakeParts(root)`
  (`temple-floors.js`), which swaps every placeholder for one `InstancedMesh` per geometry + material + shadow flag.
  Share the geometry and material between copies, or they won't merge. For hundreds of copies you place yourself
  (forest trees, road dashes), build an `InstancedMesh` directly, as `mountainsAndForest` does.
- **Culling** (`CULL`, `indexCull`, `cull()` at the end of `temple-floors.js`): outdoor objects are sorted into 24 m
  cells and hidden when they're behind the camera, past the fog's `far`, or smaller than `CONFIG.cull.minPixels` on
  screen. The pass is skipped when the camera hasn't moved. Things to know:
  - Objects over 60 m across, or holding a light, are looked inside instead of culled whole.
  - Things more than 140 m out (far hills, fields) are never culled.
  - Mark an object `userData.noCull` if it must always draw.
  - Build outdoor things as several small groups, not one huge one, so the cells can hide them.
  - Objects more than 140 m out go into their own far cells (`c.far`): those hold only batches and are kept or dropped by
    the view cone alone, never by distance or size.
- **Static batching** (`batchCells`, `weld`, `batchCheck` in `37-culling.js`, `CONFIG.cull.batch`): once the cells are
  indexed, the plain meshes in each cell are welded into one mesh per material + shadow flags + attribute set. This takes
  the gate view from ~4,500 draw calls to ~1,600 and the town on foot from ~4,300 to ~1,500. Things to know:
  - The originals stay in the scene on layer `temple.batchLayer` (31), which the camera skips but the picking `ray` sees, so
    clickables, `userData` and references from builders keep working. Don't use layer 31 for anything else.
  - Each frame `batchCheck` looks at 1,500 originals. If one moved (its matrix relative to the grounds), was hidden (it or an
    ancestor that isn't a cull item), got another material or geometry, or had its positions rewritten (`position.version`),
    its whole batch is undone and the originals draw again. Animating something outdoors needs no special care: it unbatches
    itself within a few frames of first moving. Something that moves every few seconds costs its batch for good.
  - Not batched: transparent or `depthWrite: false` materials, material arrays, instanced or skinned meshes, `frustumCulled =
    false`, a custom `raycast` or `onBeforeRender`, `renderOrder`, morphs, anything hidden at build time, and geometries with
    attributes other than position, normal, uv and color (Float32 only). Mark something you animate on a schedule with one
    of these (or keep it hidden until it is used) if a short delay before it starts moving would show.
  - To compare, set `CONFIG.cull.batch` to false and compare `renderer.info.render.calls`.
- **Lazy matrices** (`lazyMatrices` in `37-culling.js`, `CONFIG.cull.lazy`): three.js recomputes every object's world matrix every
  frame, shown or not. A cell item the culling has hidden skips that (with all it holds) until it is shown again or its parent
  moves. So code that reads a world position at run time (`localToWorld`, `matrixWorld`) off something that might be culled must
  read it off something that stands still, or call `updateWorldMatrix(true, false)` first (`getWorldPosition` already does).
- **Fog is the draw distance.** `CONFIG.fog` [near, far] also sets how far culling reaches, so shortening `far` (as mist
  and rain do) draws less. Don't raise `far` without a reason.
- **Lazy building:** each floor and building is built on its first visit (`BUILD`, `floor(n)`). Keep new halls lazy;
  don't build them at load.

## Lights and shadows

- **Never add or remove a light at runtime.** Three.js recompiles every material when the light count changes, which
  causes a visible stall. Add the light once at load and set its intensity to 0 when it's off (see the walker's torch).
- Only a few lights cast shadows (the floor-1 key `SpotLight` and the hall key lights, at 1024²). New lights should not cast
  shadows.
- Use `flat(mesh(...))` (`castShadow = false`) for ground, roads, water, roofs seen from above and anything small or far;
  each shadow caster is drawn again into the shadow map.
- `renderer.setPixelRatio` is capped at 2; don't raise it. `adaptQuality` (`CONFIG.quality`) steps it down by .5 (to 1 at
  least) when most frames over 3 s come slower than 40 fps, after the first 8 s; it never steps back up within a visit.

## Geometry and materials

- Keep segment counts low outside: 6–12 radial segments for posts and trees, `flatShading` for hills and forest.
- Reuse materials from `M` (main script) or one `std({...})` per kind in a builder; don't make a new material per mesh.
- Canvas textures (`canvasTex`) are small (64–128 px) and repeat; keep them that size.
- Statues are meshed by `statue-sculpt.js` in a Web Worker. Smaller cells in `CONFIG.sculpt` look smoother but take
  longer to mesh and draw more triangles; the lions, and the small Buddha under the wishing tree, use coarser cells.
  Each figure is meshed once and kept: Guanyin starts with the page, then `CONFIG.sculpt.warm` meshes the other Buddhas
  one at a time, so opening their hall does not make you wait. The back-gate lions reuse that surface. The detailed
  body and head do not cast a shadow: a third mesh at `shadowCell` (40 mm) casts it instead. Its material writes
  neither colour nor depth, so nothing of it shows on screen. It stays on layer 0: r128's shadow pass tests casters
  against the viewer's camera layers, not `shadow.camera.layers`. The hall shadow maps are 1024². Gilt and porcelain are
  `MeshStandardMaterial` (no clearcoat), because the colour and the shine are already in the vertex colours.

## Per-frame work

- No allocation in the frame loop: reuse scratch vectors and colours (`_look`, `_wxTint`, `_cv`, …) instead of `new THREE.Vector3()`.
- Per-floor `updaters` run only while that floor is shown; put animation there, not in the global loop. Floor 1's own
  effects (dust, smoke, aureole, lanterns) run only while `scene.visible`, and a flame flickers only while its hall is shown
  (`shownNow`).
- The on-foot aim prompt (`aimPrompt`) raycasts every .15 s while the camera moves and every .6 s while it stands still.
- `walkAt` / `surfAt` read `SURF` through a grid index (`SURF_IX`, 8 m cells): each entry is filed by its footprint once
  resolved, and a lookup reads only its cell's entries, in the order they were added. Entries on tilted objects go in
  `SURF_IX.always`. After moving things that have walk surfaces, call `resetSurf()` (not `e.inv = null`).
- Resolving a transform at build time: use `obj.updateWorldMatrix(true, false)`, not `updateMatrixWorld(true)`, which
  recomputes everything the object holds. Doing the latter per `SURF` entry cost ~2.8 s of the 4.3 s outdoor build.
- Big buffer updates (the rain's `LineSegments`) run only while visible; keep that guard.
- Respect `reduceMotion`: skip or slow purely decorative animation; it also saves work.

## Audio

- One shared 2-second noise buffer feeds every noise sound; don't create new buffers per sound.
- Steady sounds are a handful of always-running beds, faded with gain; one-offs (`ping`) stop their own oscillators.
  Keep one-offs short and their timers no faster than a few per second.
- The audio context is suspended in a hidden tab.

## Checking

`ARCHITECTURE.md` (repo root) lists the suspected hotspots, the measurement plan and tuning ideas; `SITEMAP.md` has the
test routes.

Measured on 2026-11-20 (desktop GPU, headless Chromium, 1280×720, DPR 1; see `MEMORY.md` for the setup):

| | Before | After |
|---|---|---|
| Outdoor build (`buildPagoda`) | ~4.3 s | ~1.1–1.7 s |
| Gate view: draw calls / render | 4,490 / 16 ms | 1,620 / 9 ms |
| Market on foot | 1,304 / 8.5 ms | 763 / 7 ms |
| Town on foot (0, 40 → 30, 80) | 4,292 / 22 ms | 1,527 / 13.5 ms |

Measured on 2026-11-22, after lazy matrices (town grown since; same setup): `world.updateMatrixWorld` 3.2–3.4 ms → 1.9–2.5 ms a
frame at the gate, market, town and east road (158, 66 → 159, 150), with draw calls unchanged (1,607 / 767 / 2,284 / 1,606).

Still open: the first frame takes ~2.5 s (uploading ~1,000 geometries and ~100 textures, compiling 37 programs), and what
still updates its matrices each frame (everything shown, the far cells and the never-culled things) costs ~2 ms.

There's no profiler set up. In Chrome, open DevTools → Performance and record a walk through the town and market; look
for long frames and stalls when entering a building. For draw calls and triangles, temporarily log
`renderer.info.render.calls` and `.triangles` from the frame loop (`renderer` is inside the app's closure, not on
`window`), compare before and after a change, and remove the log.
