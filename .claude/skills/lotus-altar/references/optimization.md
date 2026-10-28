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
- **Fog is the draw distance.** `CONFIG.fog` [near, far] also sets how far culling reaches, so shortening `far` (as mist
  and rain do) draws less. Don't raise `far` without a reason.
- **Lazy building:** each floor and building is built on its first visit (`BUILD`, `floor(n)`). Keep new halls lazy;
  don't build them at load.

## Lights and shadows

- **Never add or remove a light at runtime.** Three.js recompiles every material when the light count changes, which
  causes a visible stall. Add the light once at load and set its intensity to 0 when it's off (see the walker's torch).
- Only a few lights cast shadows (the floor-1 key `SpotLight` at 2048², the hall key lights). New lights should not cast
  shadows.
- Use `flat(mesh(...))` (`castShadow = false`) for ground, roads, water, roofs seen from above and anything small or far;
  each shadow caster is drawn again into the shadow map.
- `renderer.setPixelRatio` is capped at 2; don't raise it.

## Geometry and materials

- Keep segment counts low outside: 6–12 radial segments for posts and trees, `flatShading` for hills and forest.
- Reuse materials from `M` (main script) or one `std({...})` per kind in a builder; don't make a new material per mesh.
- Canvas textures (`canvasTex`) are small (64–128 px) and repeat; keep them that size.
- Statues are meshed by `statue-sculpt.js` in a Web Worker. Smaller cells in `CONFIG.sculpt` look smoother but take
  longer to mesh and draw more triangles; distant figures (the lions) use coarser cells.

## Per-frame work

- No allocation in the frame loop: reuse scratch vectors and colours (`_look`, `_wxTint`, `_cv`, …) instead of `new THREE.Vector3()`.
- Per-floor `updaters` run only while that floor is shown; put animation there, not in the global loop.
- Big buffer updates (the rain's `LineSegments`) run only while visible; keep that guard.
- Respect `reduceMotion`: skip or slow purely decorative animation; it also saves work.

## Audio

- One shared 2-second noise buffer feeds every noise sound; don't create new buffers per sound.
- Steady sounds are a handful of always-running beds, faded with gain; one-offs (`ping`) stop their own oscillators.
  Keep one-offs short and their timers no faster than a few per second.
- The audio context is suspended in a hidden tab.

## Checking

There's no profiler set up. In Chrome, open DevTools → Performance and record a walk through the town and market; look
for long frames and stalls when entering a building. `renderer.info.render.calls` and `.triangles` in the console give
draw calls and triangles for the current view; compare before and after a change.
