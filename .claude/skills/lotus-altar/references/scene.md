# The 3D world

## Coordinates

- Units are metres; `+z` is toward the viewer/front, statues face `+z`.
- Every hall shares floor 1's footprint (statue at `z = -1.7`, offering table at `ALT = { y: 1.1, z: .75 }`) so camera
  presets work on every floor.
- The outdoor grounds are built in the `pagoda` group at the world origin, so `camera.position` outside is in the
  grounds' frame.

## Landmarks (grounds' frame, x / z)

| Place | Where |
|---|---|
| Compound walls | x −33…33, z −16…43 (front gate at z 43, back gate at z −16) |
| Bell Tower (鐘樓, `bell`) | (−17, −1.5) |
| Lotus Temple hall (蓮華寺, `library`) | (24.5, 26) |
| Front street | z ≈ 54, runs x −100…145 |
| Town road | x = −41.5 (`TOWN.roadX`), z −26…47.5 |
| Stream | centre line `riverZ(x) = -30 + sin(.045x)·3.2 + sin(.11x + 1)·1.1`, x −110…110 |
| Paddy fields | x −104…64, z −94…−42 |
| Forest | beyond z ≈ −98, then hills in an arc 150–190 m out |
| Old banyan | (36.4, 65.4) |
| Stupa hill | centre (−88, 140), top at y 15 (`HILL`) |
| High school | x 46–98, z 111–152; gate on the market lane at x 46, z 118–126; houses face it from x ≈ 30–36 |
| Bamboo grove (`bambooGrove`) | x 44–100, z 153–178, behind the school's back wall |
| Kachin Baptist church (`kachinChurch`) | centre (12, 128), front facing the plaza lane's end (z 107); forecourt z ≈ 108–114; three houses each side at x −1 and 24.2, z 118 / 127 / 136 |
| Police station | (133, 36); the Hsenwi welcome board (`welcomeSign`, Shan/Burmese/English, unlit) stands on the verge at (144, 44.4), east of the police forecourt and clear of the road and pavement, facing back down the street |

The beat officer's safe ground (`SAFE` in `temple-floors.js`): the compound, the seven-day market (x 43…104, z −14…47.4) and
the daily market (x 44…100, z 61.8…102.8). Move these if those places move.

Walkers may go up to `WORLD_R` (225 m) from the temple.

## Building things

- Repeated, static, unclickable parts use `part()` + `bakeParts(root)` in `temple-floors.js` to become `InstancedMesh`es.
  Anything that moves or is clickable stays a normal `mesh()`.
- Clickable objects are registered with `clickable(list, mesh, data)`; `data.tip` is the hover label, `data.toast` the
  message on tap. Per-floor `updaters` run each frame.
- Walls that block walkers go in `BLOCK.segs`; tall buildings outside the compound go in `TALL` so the camera stays above.
- Outdoors is culled by `CONFIG.cull` and fog (`CONFIG.fog`); keep new outdoor detail cheap and within `WORLD_R`.
- Things that change with day and night register with `onDaylight(d => …)` (d: 0 night, 1 day).
- If a new outdoor place should make a sound, add its position to `sounds` in the object `TempleFloors` returns
  (see [sound.md](sound.md)).
