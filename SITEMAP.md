# Site map

Every place a visitor can be in Lotus Altar, how they get there, and which code builds it. Use it to choose the routes
for a performance run and to name places in tracking events. The app runs on one page (`index.html`) with no routes. A
"place" here means a **mode**: the value of `current` in the main script, which `temple.show(mode)` switches to.

Coordinates are metres in the grounds' frame (x / z, `+z` toward the front gate). The fuller landmark table is in
`.claude/skills/lotus-altar/references/scene.md`.

## Navigation

```mermaid
flowchart TD
  START([Page load: CONFIG.start = "pagoda"]) --> PAGODA

  PAGODA["pagoda: the outdoor world<br/>(orbit view, or Walk in first person)"]

  PAGODA -->|pagoda door / floor nav| F1["1 · 觀音殿 Guanyin Main Hall"]
  F1 <-->|stair room, climb| F2["2 · 千燈殿 Hall of a Thousand Lamps"]
  F2 <--> F3["3 · 禪堂 Meditation Hall"]
  F3 <--> F4["4 · 藥師殿 Medicine Buddha Hall"]
  F4 <--> F5["5 · 千手觀音殿 Thousand-Armed Guanyin + shop"]
  F5 <--> F6["6 · 降魔殿 Victorious Buddha Hall"]
  F6 <--> F7["7 · 彌勒殿 Maitreya Hall"]

  PAGODA -->|door| BELL["bell · 鐘樓 Bell Tower"]
  PAGODA -->|door| LIB["library · 蓮華寺 Lotus Temple hall"]
  PAGODA -->|door| SHOP["shop · 法物流通處 Temple shop"]
  SHOP -->|upstairs| QUART["quarters · 寮房 Monks' room"]
  PAGODA -->|monastery door, stupa hill| KYAUNG["kyaung · Shan monastery shrine hall"]
  PAGODA -->|lower monastery's porch door, stupa hill| KYAUNGLOW["kyaungLow · the lower Shan monastery's hall"]
  PAGODA -->|church door| CHURCH["church · Kachin Baptist church"]
  PAGODA -->|palace door| HAW["haw · Haw Kham throne room"]
  PAGODA -->|palace left door| HAWJ["hawJustice · Haw Kham hall of justice"]
  PAGODA -->|palace right door| HAWM["hawMonks · Haw Kham hall of the monks"]
  PAGODA -->|palace back, centre| HAWL["hawLibrary · Haw Kham literature hall"]
  PAGODA -->|palace back, left| HAWD["hawDining · Haw Kham dining hall"]
  PAGODA -->|palace back, right| HAWO["hawOpera · Haw Kham opera hall"]

  F1 -.->|corridor / balcony views| CORR["corridor view<br/>(real grounds shown below: setBackdrop)"]
```

Ways to move between places:

- **Floor nav** (`#floors` in `lotus-altar.html`): buttons for the pagoda outside and floors 1–7.
- **Doors and stairs**: clickable objects whose `userData.floor` names the place to go (handled in `useObject`,
  `11-loop-and-picking.js`). Climbing between floors happens in `climb` / `stairButtons` (`14-views-and-stairs.js`).
- **Walking** (`#fpBtn`, `enterWalk` / `walkStep` in `10-walking.js`): first-person movement outside, up to `WORLD_R`
  (225 m) from the temple.
- **Flying** (`goTo(mode)` in `10-walking.js`): a camera move from one place to another.
- **Views inside a hall** (`setView`): `full`, `closeUp` (on statue floors), `corridor`, `stairs` / `stairsTop`
  (presets in `CONFIG.camera`).

## Indoor places (modes)

Every indoor place except floor 1 is built **lazily** the first time it's visited (`BUILD` table and `floor(n)` in
`src/temple-floors/32-halls-6f-7f.js`). The first visit therefore costs a build, and later visits don't. Measure both.

| Mode | Place | Builder | Piece | Altar (`shrine()`) |
|---|---|---|---|---|
| `1` | 觀音殿 Guanyin Main Hall | built at load | `src/lotus-altar/02-hall-and-guanyin.js`, `03-altar.js`, `04-altar-dressing.js` | main altar (`MAIN`) |
| `2` | 千燈殿 Hall of a Thousand Lamps | `lampHall` | `temple-floors/03-hall-2f-lamps-and-lotus-hall.js` | – |
| `3` | 禪堂 Meditation Hall | `meditationHall` | `temple-floors/07-halls-3f-5f-4f.js` | – |
| `4` | 藥師殿 Medicine Buddha Hall | `medicineHall` | `temple-floors/07-halls-3f-5f-4f.js` | yes |
| `5` | 千手觀音殿 Thousand-Armed Guanyin, with the shop | `guanyinShop` | `temple-floors/07-halls-3f-5f-4f.js` | yes |
| `6` | 降魔殿 Victorious Buddha Hall | `victoryHall` | `temple-floors/32-halls-6f-7f.js` | yes |
| `7` | 彌勒殿 Maitreya Hall | `maitreyaHall` | `temple-floors/32-halls-6f-7f.js` | yes |
| `bell` | 鐘樓 Bell Tower | `bellTower` | `temple-floors/31-bell-tower.js` | – |
| `library` | 蓮華寺 Lotus Temple hall (Shakyamuni, wishing tree) | `library` | `temple-floors/03-hall-2f-lamps-and-lotus-hall.js` | yes |
| `shop` | 法物流通處 Temple shop | `shop` | `temple-floors/06-shop-and-monks-room.js` | – |
| `quarters` | 寮房 Monks' dining and rest room | `quarters` | `temple-floors/06-shop-and-monks-room.js` | – |
| `kyaung` | Shan monastery shrine hall (ၵျွင်းၵွင်းမူးၶမ်း) | `kyaungHall` | `temple-floors/04-kyaung-shrine-hall.js` | yes (Shan ledge) |
| `kyaungLow` | the lower Shan monastery's hall for sermons and gatherings, no image (ၵျွင်းလူင်ဝဵင်းၵဝ်; `nav: false`) | `lowerKyaungHall` | `temple-floors/04b-lower-kyaung-hall.js` | no |
| `church` | Kachin Baptist church; the Sunday service on Sunday 9–11:30 AM ICT | `churchHall`, `churchService` | `temple-floors/05-church-interior.js`, `temple-floors/05c-church-service.js` | no (church) |
| `haw` | Haw Kham throne room | `hawHall` | `temple-floors/05b-haw-kham-throne-room.js` | no (throne, no image) |
| `hawJustice`, `hawMonks`, `hawLibrary`, `hawDining`, `hawOpera` | Haw Kham hall of justice, hall of the monks; at the back the literature, dining and opera halls (no nav button) | `hawHall(g, n, kind)` | `temple-floors/05b-haw-kham-throne-room.js` | no |

Statue floors also start a sculpt job in the Web Worker (`statue-sculpt.js`) for their figure.

## The outdoor world (mode `pagoda`)

`buildPagoda()` (`33-pagoda-exterior.js` … `36-lion-dragon-dance.js`) builds **the whole outdoor world in one go**,
then runs `bakeParts(g)` and `indexCull(g)`. With `CONFIG.start = "pagoda"`, this happens during page load. It is
the largest single block of work in the app. Corridor views also trigger it (`setBackdrop`).

| Area | Where (x / z) | Builder(s) | Piece |
|---|---|---|---|
| Temple compound, gate 山門, pond, lantern strings | walls x −33…33, z −16…43, gate z 43 | `templeGrounds`, `gate`, `outdoorPond`, `lanternStrings` | `09-trees-and-walls.js`, `30-temple-gate.js`, `08-lotus-pond.js`, `36-…` |
| Pagoda outside | origin | `buildPagoda` | `33-pagoda-exterior.js` |
| Bell Tower outside | (−17, −1.5) | in `buildPagoda` | `33-pagoda-exterior.js` |
| Lotus Temple hall outside | (24.5, 26) | in `buildPagoda` | `34-lotus-hall-exterior.js` |
| Shop hall, lotus pavilion, kung fu ground | in compound | in `buildPagoda` | `35-shop-hall-pavilion-kungfu.js` |
| Lion and dragon dance training | kung fu ground | in `buildPagoda` | `36-lion-dragon-dance.js` |
| Shan town road and houses, river crossing | road x −41.5, z −26…47.5 | `shanTown`, `riverCrossing` | `10-town.js` |
| Front street | z ≈ 54, x −100…145 | `streetFrontage` | `20-front-street.js` |
| Back streets | behind the front street | `backStreets` | `28-kachin-church-and-back-streets.js`, `21-back-street-houses.js` |
| Seven-day market | x 43…104, z −14…47.4 | `sevenDayMarket` | `12-market.js` |
| Morning market (5–9 AM ICT), in the seven-day market | lane x 76.3…79.7, z −12…14 | `morningMarket` | `12b-morning-market.js` |
| Stream and waterfall, paddy fields | stream z ≈ −30; falls (−115.5, −25.8); paddies x −104…64, z −94…−42 | `waterfall`, `paddyFields` | `11-waterfall-and-stream.js` |
| Stupa hill (terrain, `groundAt`) | centre (−88, 140), top y 15 | `shanStupaHill` | `13-stupa-hill.js` |
| Shan monastery outside | hill terrace | `shanMonasteries` | `14-shan-monasteries.js` (its own weathered teak, rust, inlay and fretwork, and `gableB`; `pyatthat`, `hip` from `13b-shan-carpentry.js`) |
| Lower Shan monastery outside | hill's lower terrace, below the festival ground (`LOW_KYAUNG`) | `lowerKyaung` | `14b-lower-kyaung.js` |
| Third Shan monastery ဝိႁၢၼ်ႇၵုင်းသႃႇ outside (no interior) | hill's lower terrace, past the second monastery toward the east stair (`WIHAN`, `wihanSpot`) | `wihanKyaung` | `14c-wihan-kyaung.js` |
| Haw Kham palace outside, its guards (front away from the town, back toward it; back yard kept for the kitchen, bathhouse and lake) | (16, 204), walls z 166…254 | `hawKham`, `palaceGuards` | `15-haw-kham.js` |
| Hluttaw (council of state) and the palace clock tower (stair to its top, gong and bell), in their own walled compound across the Hluttaw road from the palace's front gate, facing the main entrance | (16, 276), walls z 262.5…286.5; tower (29.5, 267.5) |
| The Hluttaw road and the market lane on along the palace's east wall | z 255.5…261.5; x 38.75…43.25 | `LANES` | `10-town.js`, drawn by `backStreets` | `councilCompound` | `15b-hluttaw-and-clock-tower.js` |
| Public library (exterior), across the market lane from the palace's east wall, facing it, beside the bamboo grove | (60, 197), lawn x 43.8…69, z 178.5…213 | `townLibrary` | `15c-town-library.js` |
| Bank (exterior), south of the library across the market lane from the palace's east wall, facing it | (60, 235), forecourt x 43.5…67.5, z 215…255 | `townBank` | `15d-town-bank.js` |
| Festival ground, stage, dancers, ensemble, audience | festival ground (`STAGE`) | `festivalGround`, `kinnaraDancers`, `toDancers`, `stageSinger`, `festivalAudience` | `16-` … `19-*.js` |
| Village lamps, hill-foot footpath, hospital lane | town edges; lane x −98.5…−95.5, z 5…47.6 | `hillFootpath`, `hospitalLane`, `villageLamp` | `22-village-lamps.js` |
| General hospital, road houses | main block x −119…−85, z −19…−5; wing x −94…−85.5, z −5…12 (`HOSP`) | `hospital`, `hospitalMonument`, `bloodBank`, `nursingCollege`, `hospitalRoadHouses` | `26-hospital-football-school.js` |
| Football ground | x −182…−131, z 4…68 | `footballGround` | `26-hospital-football-school.js` |
| High school | x 46–98, z 111–152 | `highSchool` | `26-hospital-football-school.js` |
| Bamboo grove, hill-foot bamboo | x 44–100, z 153–178; round the hill | `bambooGrove`, `hillFootBamboo` | `27-bamboo-fuel-fire-police.js` |
| Fuel station, fire and police stations, welcome board | police (133, 36); board (144, 44.4) | `fuelStation`, `fireAndPolice`, `welcomeSign` | `27-bamboo-fuel-fire-police.js` |
| Kachin Baptist church compound | x −6…28, z 107.6…143.6 | `churchCompound`, `kachinChurch` | `28-kachin-church-and-back-streets.js` |
| Old banyan | (36.4, 65.4) | `banyan` | `21-back-street-houses.js` |
| Forest band and hills | z < −98; hills 150–190 m out | `mountainsAndForest` | `29-forest-and-hills.js` |
| Townsfolk (evening), Halloween ghost | roads, market | `townsfolk`, `halloweenGhost` | `24-townsfolk.js`, `23-halloween-ghost.js` |

## Suggested performance routes

These routes cover the heavy paths. Run each one on a phone and on a desktop, with the same URL flags each time.

1. **Cold load → outside.** Page load to the first rendered frame of `pagoda` (covers `buildPagoda`, `bakeParts`,
   `indexCull`, fonts, CDN scripts).
2. **Town walk.** Walk on foot from the front gate along the front street, into the seven-day market, and on to the
   festival ground in the evening (`?dancers=toKinnara&townsfolk=1`). This is the densest scene, with animated
   dancers, the audience and the ensemble audio.
3. **Stupa hill.** Climb the hill stair to the Shan monastery, then enter `kyaung` (terrain sampling, the first lazy
   build of a hall and a sculpt job).
4. **Pagoda climb.** Go from floor 1 to floor 7 by the stairs (seven lazy builds and four statue sculpt jobs), then
   back down (no builds).
5. **Weather.** Repeat route 2 with `?weather=rain` (rain `LineSegments` buffer updates, shorter fog) and with
   `?weather=clear`.
6. **Festival extras.** `?halloween=1` at night (ghost, torch, lights out) and `?lionDragon=dragon`.

URL flags: `?halloween=1|0`, `?weather=rain|clear|cloudy|mist|haze`, `?townsfolk=1|0`,
`?dancers=solo|pair|to|twoTo|toKinnara|singer|0`, `?lionDragon=dragon|lion|0`. They work only on `localhost` / `127.0.0.1`
(`devParam`); the public site ignores them.
