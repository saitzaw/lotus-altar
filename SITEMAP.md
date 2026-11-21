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
| Stall sellers and shoppers (9 AM–noon and 5–9 PM ICT), goods on every stall table, in the seven-day market | aisles x 52, 68, 84, z 17…43 | `marketStalls` | `12c-market-stalls.js` |
| Food street: five Shan and Chinese food stalls (boards in Shan, Tai Nüa, Chinese, Burmese) facing the seven-day market, cooks, diners and strollers (people 9 AM–10 PM ICT) | x 33.6…43, z −11…41 (stalls at x 35.8, z −5…35) | `foodStreet` | `12d-food-street.js` |
| Stream and waterfall, paddy fields | stream z ≈ −30; falls (−115.5, −25.8); paddies x −104…64, z −94…−42 | `waterfall`, `paddyFields` | `11-waterfall-and-stream.js` |
| Stupa hill (terrain, `groundAt`) | centre (−88, 140), top y 15 | `shanStupaHill` | `13-stupa-hill.js` |
| Stupa hill's four stairs: main (toward the street corner), east (palace lane), north (3.55 rad from the main stair, past the festival market; walk to the Hluttaw road's west end), west (−π/2, where the lower terrace footpath ends) | round `HILL` (`MORE_STAIRS`, `HILL.east`) | `hillStair`, `stairGate` in `shanStupaHill` | `13-stupa-hill.js` |
| Shan monastery outside | hill terrace | `shanMonasteries` | `14-shan-monasteries.js` (its own weathered teak, rust, inlay and fretwork, and `gableB`; `pyatthat`, `hip` from `13b-shan-carpentry.js`) |
| Lower Shan monastery outside | hill's lower terrace, below the festival ground (`LOW_KYAUNG`) | `lowerKyaung` | `14b-lower-kyaung.js` |
| Third Shan monastery ဝိႁၢၼ်ႇၵုင်းသႃႇ outside (no interior) | hill's lower terrace, past the second monastery toward the east stair (`WIHAN`, `wihanSpot`) | `wihanKyaung` | `14c-wihan-kyaung.js` |
| Terrace walk below the second and third monasteries: paving out over the slope on a whitewashed retaining wall, parapet with gilt coping and lamp posts, open uphill; in front of the second monastery its inner edge follows that building's front | lower terrace, angles 0.038…1.261 rad from the main stair (from the main stair's wall to the east stair's), r ≈ 59.6/65.2…73 round `HILL` (`TERRACE_WALK`) | `terraceWalk` | `14c-wihan-kyaung.js` |
| Haw Kham palace outside, its guards (front away from the town, back toward it; back yard kept for the kitchen, bathhouse and lake) | (16, 204), walls z 166…254 | `hawKham`, `palaceGuards` | `15-haw-kham.js` |
| Hluttaw (council of state) and the palace clock tower (stair to its top, gong and bell), in their own walled compound across the Hluttaw road from the palace's front gate, facing the main entrance | (16, 276), walls z 262.5…286.5; tower (29.5, 267.5) |
| The Hluttaw road (the main road, median lamps, on west along the palace lake to x −118) and the market lane on along the palace's east wall | z 255.5…261.5; x 38.75…43.25 | `LANES`, `mainRoad` | `10-town.js`, drawn by `backStreets` | `councilCompound` | `15b-hluttaw-and-clock-tower.js` |
| Palace lake, island pavilion and bridge: between the Haw Kham's west wall, the stupa hill's foot and the main road; the bridge leaves the road at x −30 | x ≈ −115…−9.5, z ≈ 175…252.5 (`LAKE_SHORE`); island (−30, 222) | `palaceLake` | `15f-palace-lake.js` |
| Fire balloon ground: the lower terrace past the east stair carried out level over the slope on a whitewashed retaining wall (parapet, gilt coping, lamp posts), nine walkable spectator tiers up the slope to the upper terrace, three launch pads (fire pit, bamboo mast) with paper animal balloons by day (8 AM – 3 PM) and night balloons (6 PM – 2 AM: candle lanterns with a hanging stupa, painted, fireworks), small sky lanterns at night, a crowd on the tiers and field and a team at each fire pit; Burmese/English sign by the east stair | lower terrace, from 0.085 rad past the east stair to 2.62 rad from the main stair, r 53.6…76.5 round `HILL` (`BALLOON_GROUND`), above the palace lake's south shore | `balloonGround` | `15g-balloon-ground.js` |
| Festival market (ၵၢတ်ႇပွႆး): two rows of Shan shops (bamboo walls, propped shutters, thatch or tin roofs with a raised ridge, goods, lanterns) across a lane, bamboo gateway with the board at the balloon ground's end | lower terrace, from 0.07 rad past the balloon ground's west end (2.62 rad) round to about 3.3 rad; rows at r 56.8 and 67.2 round `HILL` (`BAZAAR`) | `balloonBazaar` | `15h-balloon-bazaar.js` |
| Fire lotus ground (မီးလျှော်ပွဲ၊ မီးကြာစံပွဲ): the lower terrace between the north and west stairs carried out level over the slope on a whitewashed retaining wall (parapet, gilt coping, lamp posts), nine walkable spectator terraces up to the upper terrace, a board at each end, three bamboo fireworks towers (24 m lattice wrapped red and white, stays, A-frame, eight racks, paper lotus on top) in rope rings; lit one at a time 7 PM – midnight with fountains, red flares, smoke and the fire lotus's drooping trails; crowd | Stupa hill, from about 3.66 to 4.60 rad round from the main stair (`fireLotusArc`), r 44–75 round `HILL` (`FIRE_GROUND`) | `fireLotusGround` | `15j-fire-lotus-ground.js` |
| Offering shops (ႁၢၼ်ႉၶူဝ်းလူႇ): seven Shan shops selling flowers and food to offer (flowers, bananas and coconuts, rice, candles and incense), on the uphill side of the lit footpath, board by the stair | lower terrace west of the main stair, from 8 m west of it; row at r 62.8 round `HILL` (`OFFER_SHOPS`) | `offeringShops` | `15i-offering-shops.js` |
| Public library (exterior), across the market lane from the palace's east wall, facing it, beside the bamboo grove | (60, 197), lawn x 43.8…69, z 178.5…213 | `townLibrary` | `15c-town-library.js` |
| Bank (exterior), south of the library across the market lane from the palace's east wall, facing it | (60, 235), forecourt x 43.5…67.5, z 215…255 | `townBank` | `15d-town-bank.js` |
| Township court (exterior) in its walled compound, next door east of the Hluttaw's, gate on the court road facing the bank; the court road carries the Hluttaw road on east to its gate | (50, 274.5), walls x 36…64, z 262.5…286.5 (its west wall is the Hluttaw compound's east wall); court road x 43.25…64.5, z 255.5…261.5 (`LANES`) | `townshipCourt` | `15e-township-court.js` |
| Shan house of two storeys beside the bank, front to the main road, in a walled yard | (77.5, 243.5), lot x 68.5…86.5, z 233…254.5 | `shanTwoStorey` | `28e-ward-five-offices-and-power.js` |
| Ward No. 5 (အမှတ် (၅) ရပ်ကွက်): its lane, houses either side, corner shop, well, ward administrator's office at the lane's end | lane x 88…92, z 196…255.5; office (90, 190.6) | `wardQuarter` | `28e-ward-five-offices-and-power.js` |
| Municipal office (township development committee) and township immigration office (exteriors), each in a walled compound across the main road east of the court; the main road carried on east to x 158 | municipal (85, 278), walls x 66…104, z 263…292; immigration (121, 276), walls x 106…136, z 263…289 | `townOffices` | `28e-ward-five-offices-and-power.js` |
| Diesel power station and main substation: engine hall, stacks, radiators, fuel tanks, fenced switchyard, main switch room, pole line out | compound x 112…152, z 214…254.5, gate x 121; switchyard x 138…151, z 215…246 | `powerStation` | `28e-ward-five-offices-and-power.js` |
| Shan family compounds on the Hluttaw road's north side, facing the palace lake: seven houses (five wooden, two concrete), each in a small yard behind a woven-bamboo, bamboo-picket or whitewashed brick fence with a gate onto the road, a path, a shade tree, bananas, a vegetable bed or washing line; water pot stands (ရေအိုးစင်) at three gates | x −113…−12, z 263…278.5 (`ROAD_HOUSES`, `ROAD_LOTS`) | `hluttawRoadHouses` | `28b-hluttaw-road-houses.js` |
| Festival ground, stage, dancers, ensemble, audience | festival ground (`STAGE`) | `festivalGround`, `kinnaraDancers`, `toDancers`, `stageSinger`, `festivalAudience` | `16-` … `19-*.js` |
| Village lamps, hill-foot footpath, hospital lane | town edges; lane x −98.5…−95.5, z 5…47.6 | `hillFootpath`, `hospitalLane`, `villageLamp` | `22-village-lamps.js` |
| General hospital, road houses | main block x −119…−85, z −19…−5; wing x −94…−85.5, z −5…12 (`HOSP`) | `hospital`, `hospitalMonument`, `bloodBank`, `nursingCollege`, `hospitalRoadHouses` | `26-hospital-football-school.js` |
| Football ground | x −182…−131, z 4…68 | `footballGround` | `26-hospital-football-school.js` |
| Stadium Road quarter: offices, restaurants, futsal and basketball courts, sports hall, pool, park, flats (six storeys at most); the link road to the hospital road and the Hluttaw road carried west to it | avenue x −204…−196, z −5…255.5; link road z −5…1 to x −128; buildings x −228…−172, flats across the Hluttaw road x −195…−133, z 264…278 (`SQ`) | `stadiumQuarter` | `28c-stadium-quarter.js` |
| The lake side of the Stadium Road quarter: Lake View Offices (six-storey glass tower with a roof café), Lakeside Supermarket and its car park, and Valley Microfinance's slim office on the palace lake's west shore, all looking east over the lake and the stupa hill | tower (−162, 213), supermarket (−161.5, 237.5), car park x −149.6…−140.4, z 224…250, driveway to the Hluttaw road at x −145…−139; microfinance office (−124.6, 234) between the north walk and the shore | `stadiumQuarter` (end) | `28d-lakeside-offices-and-supermarket.js` |
| High school | x 46–98, z 111–152 | `highSchool` | `26-hospital-football-school.js` |
| Bamboo grove, hill-foot bamboo | x 44–100, z 153–178; round the hill | `bambooGrove`, `hillFootBamboo` | `27-bamboo-fuel-fire-police.js` |
| Fuel station, fire and police stations, welcome board | police (133, 36); board (144, 44.4) | `fuelStation`, `fireAndPolice`, `welcomeSign` | `27-bamboo-fuel-fire-police.js` |
| Kachin Baptist church compound | x −6…28, z 107.6…143.6 | `churchCompound`, `kachinChurch` | `28-kachin-church-and-back-streets.js` |
| Old banyan | (36.4, 65.4) | `banyan` | `21-back-street-houses.js` |
| Big banyan, on the stupa hill's upper terrace between the festival ground and the east stair | (−49.1, 137.2) (`BIG_BANYAN`) | `banyan` | `13-stupa-hill.js`, called from `14-shan-monasteries.js` |
| Forest band and hills | z < −98; hills 150–190 m out | `mountainsAndForest` | `29-forest-and-hills.js` |
| Townsfolk (evening), Halloween ghost | roads, market | `townsfolk`, `halloweenGhost` | `24-townsfolk.js`, `23-halloween-ghost.js` |
| Poy Sang Long procession (8 AM, arriving about 9:25; gathered at the second monastery and festival ground until 11) | gate → front street → market lane → palace lane → east stair → lower terrace → second monastery | `createShinlaungProcession` | `24b-shinlaung-procession.js` |

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

URL flags: `?halloween=1|0`, `?weather=rain|clear|cloudy|mist|haze`, `?townsfolk=1|0`, `?procession=1|0`,
`?dancers=solo|pair|to|twoTo|toKinnara|singer|0`, `?lionDragon=dragon|lion|0`. They work only on `localhost` / `127.0.0.1`
(`devParam`); the public site ignores them.
