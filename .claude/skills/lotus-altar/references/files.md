# Files (`lotus-temple/`)

| File | What it holds |
|---|---|
| `lotus-altar.html` | Page **body only** (no doctype/head): written as a claude.ai Artifact body. HUD, floor nav, action bar, side panel sheets (buy, offer, donate, recite, fortune), four-face-top dialog, walk pad |
| `src/lotus-altar/*.js` | Main app, one IIFE cut into topic files; joined into `dist/lotus-altar.js`. Map below |
| `src/temple-floors/*.js` | `window.TempleFloors(ctx)`: floors 2–7, side buildings, the whole outdoor world and terrain, cut into topic files; joined into `dist/temple-floors.js`. Each floor is built lazily on first visit. Its returned object (`38-api.js`) is the API the main script uses (`show`, `update`, `cull`, `activate`, `sounds`, …). Map below |
| `statue-sculpt.js` | Statues as signed distance fields meshed with surface nets, run in a Web Worker (falls back to main thread). Figures: `guanyin`, `qianshou` (gilded Guanyin; her thousand arms are instanced meshes in `07-halls-3f-5f-4f.js`), `medicine`, `shakyamuni`, `jaya` (Victorious Buddha, with a Shan-style flame finial), `maitreya`, `lion`, `lionL` |
| `four-face-top.js` | `FourFaceTopGame`: self-contained Shan four-animal spinning-top mini-game on its table mat; `BETS` (eight spots), `spin(wagers)`, `setChips`. Festival tokens only, never money |
| `lotus-altar.css` | Styles; colour tokens like `--lotus`, `--water`, `--saffron`, `--flame`, `--smoke` |
| `build-dist.sh` | Joins `src/<name>/*.js` in file-name order into `dist/<name>.js`, runs `node --check` on them, wraps the HTML body in a full document into `dist/index.html` and copies the other assets (and `guanyin.glb` if present) |
| `vercel.json` | Vercel build config |

## How the split files work

`lotus-altar.js` and `temple-floors.js` are each still **one script with one shared closure**. The files under
`src/<name>/` are consecutive slices of it, joined by `cat` in file-name order. So:

- Every top-level name in any piece is visible to every other piece of the same script, exactly as before. Don't add
  `import`/`export`, IIFEs or `window.` globals to share between pieces.
- The first piece opens the closure and the last one closes it, and a few pieces sit inside a function (marked
  *inside …* below). Those aren't valid JS on their own, so editor syntax squiggles there are expected; the joined file is
  checked by `node --check` at build time.
- Edit the piece, then `bash build-dist.sh`. Never edit `dist/`.
- To find a name: `grep -rn "function walkStep\|const KEYMAP" lotus-temple/src`. Docs that say "`x` in `temple-floors.js`"
  mean the joined script; grep `src/temple-floors/` for it.
- New code goes in the piece for that place or topic. A new place big enough for its own file: make a new piece and pick
  its number so it lands where it must run (helpers before their users if they are `const`; `function`s are hoisted).
  Renumbering files is fine, the order is all that matters.

## `src/lotus-altar/` (main app)

| Piece | What | Key names |
|---|---|---|
| `00-helpers-and-config.js` | opens the IIFE; tiny helpers; **`CONFIG`** (settings to tweak) | `V` `clamp` `$` `reduceMotion` `CONFIG` |
| `01-catalogue-renderer-materials.js` | offerings catalogue and prices, cart store, renderer, textures, materials | `ITEMS` `cart` `save` `M` `std` `mesh` `lathe` `glowSprite` `canvasTex` |
| `02-hall-and-guanyin.js` | floor 1 hall shell, Guanyin statue, sculpt worker jobs | `sculptFigure` `STATUE_MATS` |
| `03-altar.js` | Guanyin's altar: bowls, candles, incense, bell, chant, fortune drawing | `buildBowls` `addCandle` `addIncense` `ringBell` `chant` `drawFortune` |
| `04-altar-dressing.js` | lights, dust, flowers, fruit, water, effects, tweens; **`shrine()`** for every other statue's altar | `addFlower` `addFruit` `tween` `shrine` `offerAtShrine` |
| `05-pagoda-and-camera-modes.js` | pagoda floors and the view from outside; camera modes | `applyMode` `placeInfo` |
| `06-sun-and-moon.js` | real sun/moon positions and moon phase | `Astro` `updateCelestial` `moonTexture` |
| `07-festivals-and-weather.js` | Halloween, townsfolk hours, stage dance schedule (kinnara, to) and lion/dragon schedule, beat officer (commented out), day/night sky, weather | `festNow` `folkNow` `danceNow` `drillNow` `skyColors` `applySky` `weatherNow` `weatherStep` |
| `08-sound.js` | WebAudio ambience and the festival stage ensemble | `ambStart` `ambStep` `templeBell` `longDrum` `stageGong` `stageCymbals` |
| `09-top-game-and-action-bar.js` | four-animal top hook-up: the doorman's age check (21+), chips and bets; action bar sheets | `openTopGame` `openDoorCheck` `tgPlace` `openSheet` `setPanel` |
| `10-walking.js` | first-person walking, market at eye level, pavilion bench, flying between places | `enterWalk` `walkStep` `KEYMAP` `goTo` |
| `11-loop-and-picking.js` | resize, **frame loop**, tap/hover picking | `frame` `pick` `useObject` |
| `12-ui.js` | shop, bag, offering and donation UI, toasts | `render` `renderLog` `offerAll` `toast` |
| `13-fortune.js` | fortune verses (original to this shrine) | `FORTUNES` `showFortune` |
| `14-views-and-stairs.js` | close-up/corridor/stair-room views, climbing; closes the IIFE and starts the app | `setView` `climb` `stairButtons` |

## `src/temple-floors/` (`TempleFloors(ctx)`)

| Piece | What | Key names |
|---|---|---|
| `00-closure-and-sky-helpers.js` | opens `TempleFloors`, unpacks `ctx`; shared state; seeded `rng`; `part`/`bakeParts`; daylight, sky, celestial hooks; sign textures | `rng` `part` `bakeParts` `onDaylight` `daySky` `dayLight` `daylit` `writing` `FEST` `FOLK` `COP` |
| `01-shared-pieces.js` | lanterns, spiral stairs, stair room, front wall, balcony corridor, lattice windows, hall walls, doorways | `lantern` `spiralStairs` `stairRoom` `corridor` `hallWalls` `doorway` |
| `02-roofs.js` | curved tiled eaves, balustrades, beams, brackets, columns, pedestals, thrones, offering tables | `curvedEave` `tiledEave` `throne` `offeringTable` |
| `03-hall-2f-lamps-and-lotus-hall.js` | 2F Hall of a Thousand Lamps; 蓮華寺 interior | `lampHall` `library` |
| `04-kyaung-shrine-hall.js` | Shan monastery shrine hall interior (windows from `kyaungWindows()` in `14-shan-monasteries.js`) | `KYAUNG` `kyaungHall` |
| `04b-lower-kyaung-hall.js` | the lower Shan monastery's hall (`kyaungLow`): no image, the monks' dais and sermon seat, mats, square windows | `lowerKyaungHall` `LOW_HALL` |
| `05-church-interior.js` | Kachin Baptist church interior, its grand piano and the morning sunbeams | `PIANO` `CHURCH` `churchHall` `grandPiano` |
| `05c-church-service.js` | the Sunday service in the church: congregation, pastor, choir, pianist (shown while `FOLK.service`) | `churchService` |
| `05b-haw-kham-throne-room.js` | the Haw Kham's six halls (`kind`): throne room, hall of justice, hall of the monks; literature, dining and opera halls at the back | `HAW` `hawHall` |
| `06-shop-and-monks-room.js` | temple shop interior, monks' room | `shop` `quarters` |
| `07-halls-3f-5f-4f.js` | 3F Meditation, 5F Thousand-Armed Guanyin (+ shop), 4F Medicine Buddha | `meditationHall` `thousandArms` `medicineHall` |
| `08-lotus-pond.js` | outdoor pond, coin wish, bathing the Buddha | `outdoorPond` `pondRituals` |
| `09-trees-and-walls.js` | trees, ginkgo, pine, temple wall, grounds | `tree` `ginkgo` `pine` `templeWall` `templeGrounds` |
| `10-town.js` | Shan town road and houses, river crossing | `TOWN` `LANES` `streetLight` `shanHouse` `shanTown` `riverCrossing` |
| `11-waterfall-and-stream.js` | waterfall, paddy fields | `FALLS` `waterfall` `paddyFields` |
| `12-market.js` | seven-day market | `sevenDayMarket` |
| `12b-morning-market.js` | the morning market, 5–9 AM: sellers on the ground along a red-earth lane behind the stalls, shoppers (shown while `FOLK.morning`) | `morningMarket` |
| `13-stupa-hill.js` | stupa hill and **terrain** (height/walkable ground) | `HILL` `groundAt` `walkAt` `terrainAt` `MON` `KINNARA` `AUDIENCE` `shanStupaHill` |
| `13b-shan-carpentry.js` | the teak, whitewash, glass and iron roof materials, the carved gable, the pyatthat and a hipped roof, shared by the monasteries and the Haw Kham (made once) | `shanCarpentry` `hip` |
| `14-shan-monasteries.js` | Shan teak monastery on the hill; its window layout, shared with the hall inside | `shanMonasteries` `kyaungWindows` `kwOval` `kwArch` |
| `14b-lower-kyaung.js` | the second monastery, on the hill's lower terrace below the festival ground, after the owner's photograph; its door leads to `kyaungLow` | `lowerKyaung` |
| `14c-wihan-kyaung.js` | the third monastery ဝိႁၢၼ်ႇၵုင်းသႃႇ, on the lower terrace past the second, after the owner's photograph: plaster hall under three roof tiers, verandah wing on posts, stair porch, blue tower with the name board, flags; outside only | `wihanKyaung` |
| `15-haw-kham.js` | the saopha's palace and its guards, its own top-level builder (called from `36-lion-dragon-dance.js` after `shanMonasteries`); front away from the town, back toward it | `hawKham` `palaceGuards` |
| `15b-hluttaw-and-clock-tower.js` | the council's own walled compound across the road from the palace's front gate: the Hluttaw on posts facing the main entrance, the clock tower with its stair and gong (called from `hawKham` in the front's frame `BACK`) | `councilCompound` |
| `15c-town-library.js` | the public library, an old two-storey mansion across the market lane from the Haw Kham, facing it (`LIB`; called from `36-lion-dragon-dance.js` after `hawKham`); exterior only | `townLibrary` |
| `15d-town-bank.js` | the bank, an old white building with onion-domed corner towers, south of the library on the same side of the market lane, facing the palace (`BANK`; called from `36-lion-dragon-dance.js` after `townLibrary`); exterior only | `townBank` |
| `16-festival-ground.js` | festival ground and stage | `festivalGround` |
| `17-kinnara-dance.js` | kinnara/kinnari dancers | `kinnaraDancers` |
| `18-stage-ensemble.js` | stage musicians (*inside `kinnaraDancers`*) | |
| `18b-to-dance.js` | the to (two dancers in one beast costume), white or (`yellow`) yellow, keeps time to the ensemble's bar count | `toDancers` |
| `18c-stage-singer.js` | the Shan singer alone on the stage between the dances, silent (no song played) | `stageSinger` |
| `19-dance-audience.js` | audience | `festivalAudience` |
| `20-front-street.js` | houses along the front street | `streetFrontage` |
| `21-back-street-houses.js` | wooden Shan houses, tin roofs, banana, banyan | `shanWoodHouse` `tinHipRoof` `banana` `banyan` |
| `22-village-lamps.js` | pole lamps, wires, the hill-foot footpath, the hospital lane | `villageLamp` `hillFootpath` `hospitalLane` |
| `23-halloween-ghost.js` | Halloween ghost | `halloweenGhost` |
| `24-townsfolk.js` | evening townsfolk | `townsfolk` |
| `25-beat-officer.js` | beat officer (kept commented out at the call site) | `SAFE` `beatOfficer` |
| `26-hospital-football-school.js` | civic building kit, hospital and its monument, blood bank, nursing college, football ground, high school | `civic` `civicSign` `vehicle` `hospital` `hospitalMonument` `bloodBank` `nursingCollege` `postSign` `fiveLineSign` `footballGround` `highSchool` |
| `27-bamboo-fuel-fire-police.js` | bamboo, fuel station, fire and police stations, welcome board | `bambooGrove` `hillFootBamboo` `fuelStation` `fireAndPolice` `WELCOME` |
| `28-kachin-church-and-back-streets.js` | church outside and compound; back lanes | `kachinChurch` `churchCompound` `backStreets` |
| `29-forest-and-hills.js` | forest band and hills | `mountainsAndForest` |
| `30-temple-gate.js` | 山門 gate, hipped roofs | `gate` `tiledHipRoof` |
| `31-bell-tower.js` | Bell Tower interior | `bellTower` |
| `32-halls-6f-7f.js` | 6F Victorious Buddha, wishing tree, 7F Maitreya; `BUILD` table and `floor(n)` (lazy floor builder) | `victoryHall` `wishTree` `maitreyaHall` `BUILD` `floor` |
| `33-pagoda-exterior.js` | starts `buildPagoda`: pagoda deck and storeys, Bell Tower outside | `buildPagoda` |
| `34-lotus-hall-exterior.js` | 蓮華寺 outside (*inside `buildPagoda`*) | |
| `35-shop-hall-pavilion-kungfu.js` | shop hall outside, lotus pavilion, kung fu ground (*inside `buildPagoda`*) | |
| `36-lion-dragon-dance.js` | lion and dragon dance training; ends `buildPagoda` (*inside `buildPagoda`*) | |
| `37-culling.js` | selective rendering grid | `CULL` `indexCull` `cull` |
| `38-api.js` | the object returned to the main script; closes `TempleFloors` | |

## Script load order

three (cdnjs r128) → `OrbitControls` → `GLTFLoader` (jsdelivr `three@0.128.0/examples/js`) → `four-face-top.js` →
`temple-floors.js` → `lotus-altar.js` (the joined files in `dist/`).

## Libraries and fonts

- Three.js **r128** global `THREE`; don't use ES modules or newer Three APIs.
- Google Fonts: Marcellus, Figtree, Noto Serif TC (Chinese hall names), Noto Sans Myanmar (Shan/Burmese text).

`dist/` and `.vercel` are gitignored.
