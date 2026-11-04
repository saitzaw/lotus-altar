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
| Waterfall (`waterfall`, `FALLS`) | where the stream rises, at its west end: plunge pool centre (−115.5, `riverZ(−110)` ≈ −25.8), radius 5.4, ringed with boulders and open to the east; the falls drop 11 m off a rock cliff (x ≈ −129…−120, 22 m long, back buried in the near hill at (−149, −57)); behind the hospital. Pool and cliff block walkers |
| Paddy fields | x −104…64, z −94…−42 |
| Forest | beyond z ≈ −98, then hills in an arc 150–190 m out |
| Old banyan | (36.4, 65.4) |
| Stupa hill | centre (−88, 140), top at y 15 (`HILL`); main stair toward the street corner `HILL.to`, a second (east) stair down toward the palace lane along `HILL.east`, both from `hillStair()` (the hill's profile is the same all round) |
| Shan monastery (`kyaung`) | on the hill's upper terrace, left of the stair (`monasterySpot()`); its stair is joined to the hill stair's landing (the hill wall is left open only there), and its door leads to the `kyaung` shrine hall (`kyaungHall`). Walkers go up its stair onto the verandah, or round it on the paved plinth (`MON.PM` wide, parapet on the back and ends); the hill lathe is cut down to the terrace under the plinth. Shan names in `SHAN_NAMES`: the main stupa ၽြႃးမုင်ႈမိူင်း (board over the hill stair's entrance), the monastery ၵျွင်းၵွင်းမူးၶမ်း (board under its front gable) |
| High school | x 46–98, z 111–152; gate on the market lane at x 46, z 118–126; houses face it from x ≈ 30–36 |
| Bamboo grove (`bambooGrove`) | x 44–100, z 153–178, behind the school's back wall |
| Bamboo at the hill's foot (`hillFootBamboo`, `FOOT_BAMBOO`) | a band of clumps round the stupa hill's eastern foot (angles −0.8…0.15 rad round `HILL`, from 2.5 m up the slope to 14 m out), between the hill and the backs of the plaza-lane houses, the church's west houses and the houses facing the Haw Kham; built after `backStreets` and placed only where `surfAt` finds nothing within 2.6 m, so a walk stays clear along the house backs. Both groves share `bambooStand()` |
| Kachin Baptist church compound (`churchCompound`, `CHURCH_YARD`) | walled x −6…28, z 107.6…143.6 (1.6 m whitewashed wall, red cap), gate in the south wall at the plaza lane's end (x ±2.25) under an iron arch with a cross. Inside: the church (`kachinChurch`) at (12, 128), front facing the gate, forecourt z ≈ 108–114; its door leads to the `church` hall (`churchHall`: pews, dais, cross; no offering altar), and you come out on the forecourt. West side: the pastor's house (wooden, two storeys, (−0.5, 131)) and the women workers' (sarama) house ((−0.6, 120)), both facing the church with name boards. East side: the baptistry, a raised blue-tiled immersion pool under a tin roof on six posts, steps over both ends ((22.5, 121)), and the Sunday-school hall ((22.6, 134)). Shade trees and bananas behind the church |
| Haw Kham (ႁေႃၶမ်း, `hawKham`, built in `shanMonasteries`) | the saopha's palace, compound centre (16, 182), x −6…38, z 166…198, gate in the south wall facing the church; east of the stupa hill's foot, west of the bamboo grove. A teak hall on stilts (walkers climb the audience stair onto the verandah), seven-tier pyatthat, a lesser hall either side; exterior only, its doors don't open yet. The palace lane (`LANES[4]`, z 155.5–160.5) runs from the market lane's end (now z 160.5) past its gate to the stupa hill's east stair. Across the lane, facing the palace, a row of five two-storey wooden Shan houses (`shanWoodHouse`, 7 m wide, 2 m apart, z 145.7–155.3) centred at x −2.25 … 33.75 |
| Township football ground (`footballGround`) | walled x −182…−131, z 4…68, across the road (x −124.75) from the hospital: pitch x −177…−141, z 8…64 on a laterite track; covered stand of five walkable tiers on the east side (z 22–50), three low terraces against the west wall; gate in the east wall at z 54–60 with the Burmese/English sign and the flag |
| Police station | (133, 36); the Hsenwi welcome board (`welcomeSign`, Shan/Burmese/English, unlit) stands on the verge at (144, 44.4), east of the police forecourt and clear of the road and pavement, facing back down the street |

The beat officer is commented out for now (`beatOfficer(g)` in `temple-floors.js`, `policeStep` in `lotus-altar.js`). His safe ground (`SAFE` in `temple-floors.js`): the compound, the seven-day market (x 43…104, z −14…47.4) and
the daily market (x 44…100, z 61.8…102.8). Move these if those places move.

Walkers may go up to `WORLD_R` (225 m) from the temple.

## Altars

- Every statue hall (`statueHall`: 4F Medicine Buddha, 5F Thousand-Armed Guanyin, 6F Victorious Buddha, 7F Maitreya, the
  Lotus Temple hall's Shakyamuni, the Shan monastery's `shan` image) gets the same offering altar as floor 1 from `shrine(parent, key, o)` in `lotus-altar.js`:
  seven water bowls, a fruit plate at `o.fruitX`, two stepped candle stands and the censer. Floor 1 and the shrines share the
  builders (`buildBowls`, `buildPlate`, `buildStands`, `buildCenser`) and placers (`addWater`, `addFruit`, `addCandle`,
  `addIncense`, each taking an altar record, `MAIN` for floor 1). With `o.vaseX` the shrine also gets a brass vase that takes flowers (lotus first), as in the Shan monastery. With `o.shan` (the Shan monastery) there is no offering table and nothing stands on the floor before the image: `kyaungHall` builds the shrine in a group lowered and drawn back onto the throne's front ledge (`KYAUNG.ledge`), and `buildTrays` puts the lamp and candle slots on gilt trays at its front corners, and the censer is a small footed brass bowl of sand on the table (`alt.inc`: its place and scale) instead of the Chinese tripod; a place's `closeUp` in `CONFIG.places` overrides `CONFIG.camera.closeUp` (the Shan image sits higher).
  Offerings come from the bag; what each shrine shows is saved
  in `state.shrines[key]`. Keep the table front (`ALT.z + .3`) and the stands at `x = ±1.05, z = 1.95` clear in those halls (in the Shan monastery, the ledge's front corners).
- The wishing tree (`wishTree`, placed by `WISH_TREE`) stands in the Lotus Temple hall, right of Shakyamuni, with a small
  Victorious Buddha (`jaya` figure) seated before its trunk. The 5F hall is also a shop: `shopShelf` units along the side walls.

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
