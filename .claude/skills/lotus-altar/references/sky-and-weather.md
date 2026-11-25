# Clock, sky, festivals and weather

## The temple's clock

Bangkok time, `Asia/Bangkok`, shown as ICT (UTC+7) (`CONFIG.sky`). Anything that depends on the date or hour reads this
clock through `Intl.DateTimeFormat` with `timeZone: CONFIG.sky.tz`, never the visitor's local time.

## Sun, moon, day and night

- `updateCelestial()` places the real sun and moon for this moment over the temple (after SunCalc) every 5 minutes. The phase is the real phase. A body below the horizon is not drawn.
- `daylight` (0 night, 1 day) follows that sun: full day above 8°, full night below −8°, twilight between. The `#timeBtn` Day/Night pill shows the other look for this visit (`dayChoice` 1 or 0, with the sun at today's noon for a daylight view after dark) and, pressed again, returns to the real sky (`dayChoice = null`). A fade runs until `dayFadeUntil` on the frame clock, not a flag, because a jump elsewhere clears `tweens`; `updateCelestial` settles `daylight` once it has passed. `?day=1` / `?day=0` open on one look on localhost only. Nothing is saved.
- `skyColors()` sets the sky and fog colour outside; `applySky()` also sets exposure, calls `temple.setDaylight(d)` and
  refreshes the HUD lines.
- By day every lamp is out. `lampsOn` (`1 - daylight`) scales every `PointLight` through an `intensity` accessor on the
  prototype, so code that sets a point light's intensity sets its night strength. Lamplit glass (`lampPane()`), the
  lanterns' `lanternMat` and their halos (`lanternGlow()`) go dark too. Each hall gets `daylit(group)` when it is built
  (and the main hall in `dress()`): its hemisphere, key and side lights ease to pale daylight. Indoors the background and
  fog go from lamplit dark to `CONFIG.light.dayIndoor`.
- The night outside is set by four things, all in `CONFIG.light`: the pagoda grounds' hemisphere and moonlight (`lights()` at the
  end of `36-lion-dragon-dance.js`, which builds the pagoda exterior), a lower exposure after dark (`night`, through
  `outExposure()`), the deep blue sky and haze (`nightSky`, `nightHaze`) and, most of all, the environment map. The halls'
  warm lamplit map lights every `MeshStandardMaterial` whatever the lights say, so outside `envFor(out, daylight)` picks one
  of `ENVS`, the same map dimmed toward `nightEnv` in `nightEnvSteps` steps (built once in
  `01-catalogue-renderer-materials.js`, swapped in `applySky` and every frame in `weatherStep`). Halls always get the full one.

## Halloween

Runs Oct 27 – Nov 1 (`CONFIG.halloween`). Houses go dark at 9 PM ICT until 5 AM, a friendly ghost walks
the roads. `?halloween=1` / `?halloween=0` force it.

## Christmas and the harvest thanksgiving

Both belong to the Kachin Baptist church; the temple, pagoda and monasteries are left as they are (the owner's choice).
`28h-christmas-and-harvest.js` builds them; the main script passes `temple.setChristmas(season, carols, at)` and
`temple.setHarvest(on)` each frame.

- **Harvest thanksgiving** (`CONFIG.harvest`): the last Sunday of November (`harvestNow()`), as the owner says this church keeps
  it. All that day the families' first fruits lie on the floor before the dais either side of the communion table
  (`harvestDisplay`); the service is the usual Sunday one. `?harvest=1` / `=0`.
- **Christmas dressing** (`CONFIG.christmas.from`–`to`, 1 Dec – 6 Jan, `christmasNow()`): a gold star and strings of bulbs on the
  church (`churchChristmas`), bulbs along the compound's front wall and gate arch (`compoundChristmas`), bamboo star poles in the
  yards of the pastor's house, the women workers' house and the two plaza-lane houses nearest the church (`christianHomes`, the
  latter picked from `TOWN_HOUSES`, which `backStreets` fills), and inside (`churchChristmasHall`) a tree on the dais beside the
  choir, a nativity before the dais's left end, paper star lanterns under the beams, a tinsel garland and the Jinghpaw greeting
  “Ngwi Pyaw Christmas”. The outdoor pieces are groups with `noCull` in `XMAS.out`, shown together; every string of bulbs
  (`fairyLights`) is one instanced mesh plus a cloud of glows, twinkled by `xmasTwinkle` (held still under reduced motion), only
  glass by day outdoors. No lights are added (that would recompile every material). `?christmas=1` / `=0`.
- **Carol singers** (`CONFIG.christmas.carols`, 1–24 Dec, 7–11 PM, `carolsNow()`; not in the rain): `carolSingers` walks eight
  young people along `CAROLS.way` (church gate, plaza lane, back lane, market lane), stopping to sing at `CAROLS.stops` and before
  each star pole near the way, in an arc facing the door, then back to the gate and a rest. The timetable runs on the temple's
  clock (`carolAt()`, seconds since 7 PM), so every visitor sees them in the same place; `?carols=1` runs it on its own clock from
  the gate. Seen only: no song is played.
- **Christmas services** (`CONFIG.christmas.services`): `serviceNow()` also shows the congregation on Christmas Eve 5–7 PM and
  Christmas morning 9–11:30.
- `#festInfo` names whichever is on (harvest Sunday, Christmas Eve, Christmas Day, the carol nights, the rest of the season), after
  Halloween and the Kathin's day and before the lion-dragon training.

## Lotus lanterns

Through the `months` in `CONFIG.lotusLanterns` (October and November, Thadingyut's and Tazaungdaing's festivals of light) on the
temple's clock, small paper lotus lanterns stand round the stupa hill's main stupa all day and night (`stupaLotusLanterns` in
`13c-stupa-lotus-lanterns.js`), glowing after dark. `lotusLanternsNow()` checks the month; the frame loop passes
`temple.setLotusLanterns(on)`. When no other season is showing, `#festInfo` names it. `?lotuslanterns=1` / `=0` force them.

## Shan Kathin

The robe offering after the rains retreat (`CONFIG.kathin`). It is held on one day only, the full moon of Tazaungmon (Tazaungdaing) in November, and that day there is no Shinlaung procession (`processionNow()` checks `kathinDay()`). The days through 2035 are a table, `days`, so add a year before it runs out. That day, from noon to 2 PM ICT, the town leaves Haw Kham's town gate and walks the old quarter (palace lane, market lane, the front street, then the main stair) with no dance stops, so they reach the second monastery about 12:10, carrying a padetha tree and one set of saffron robes under a white umbrella. Five monks wait on the monastery's porch the whole time. Called off in the rain. On the day, while Halloween and the lion-dragon season are not using it, `#festInfo` names it. `?kathin=1` / `=0` force it; `=1` walks at the same pace and starts again from Haw Kham. `kathinDay()`, `kathinNow()` and `kathinAt()` in the main script, `createShanKathin` in `24c-shan-kathin.js`, `temple.setKathin`.

## The torch

Walking outside at night shows `#torchBtn` (and **T** toggles it). On Halloween night the torch starts on, any other
night off; `torchChoice` holds the walker's choice (null = follow the night) and resets when the walk or the night ends.
The light is one `SpotLight` always in the scene (adding a light later would recompile every material), dark when off.

## Townsfolk

Fifteen low-poly people (`townsfolk` in `temple-floors.js`) are out from 6 PM until they go home at 10 PM ICT (`CONFIG.townsfolk`), leaving the roads to the Halloween ghost: ten browse
the seven-day market's aisles (`MARKET_WAYS`), stopping at stalls, and five walk the roads the ghost uses (`GHOST_ROADS`),
keeping to one side. They stop and turn to a walker who comes close. When `wx.rain` passes `CONFIG.townsfolk.umbrella`
they put up umbrellas. The main script passes both each frame with `temple.setTownsfolk(out, umbrellas)`. The seven-day
market's string bulbs, the paper lantern under each stall and the three warm lights over its aisles (`aisleLights`, added at load, dark by day) and the opera's lights follow `out` too: lit at night while people are out, fading dark when they go
home (the gambling hall stays lit so the four-animal top can still be played).
`?townsfolk=1` / `?townsfolk=0` force them out or in. They are drawn in a blocky style (big heads with faces, two grey-haired
elders) and dressed for a cold night in the hills: long-sleeved jackets, scarves, knitted hats or towel turbans, baggy Shan
trousers or an ankle-length longyi, and anyone coming into view appears already in step. Each body is one vertex-coloured mesh; all legs, arms and umbrellas
are three shared `InstancedMesh`es.

The kinnara dancers (`kinnaraDancers` in `temple-floors.js`), masked and in the northern style's green and gold (keep both: the
site owner's photos of southern dress were a reference for the wings only), take the festival ground's pavilion stage on the
temple's clock (`CONFIG.dancers`, each a list of [from, until] in fractional hours): the kinnara alone from 2 to 3:30 PM, the opening of the
epic, danced after the Dehong Dai/Shan kinnara of Yunnan (YouTube gNkFn3owbgQ): a 16-bar phrase of figures, one per drum bar
(`FIG`: step, bank, knee lift, whirl, crouch and rise, leap), each starting and ending in the same soft stance. Both dancers'
wings are fans of eight long, broad cloth wedges a side (about 1.4 m), each folded along its rib into a ridge, white-trimmed, with a pom-pom
at its corners and tip (green sequinned cloth with white flowers and red pom-poms on both, `WING`), strapped to the shoulder blades (`FAN`, `wedgeGeo`, `trimGeo`, `feather()`). `fanWings()` lays
the lowest wedge along the arm and spreads the rest up to the edge of a fixed middle fan (`MID`, five wedges round straight up,
standing still behind the head like an aura; on each side a linking wing of `LINKS` broad wedges, rooted with the side wing
and spread evenly from its top wedge to the middle fan's edge `EDGE`, joins them so the fan moves as one) as far as the arm is raised, so the open wings stand behind the dancer as one
peacock's-tail fan and close when the arms come down (`setArm` records `r.lift`). Neither dancer has a tail. Jointed legs and arms via `setLeg`/`setArm`; a leap is
a crouch-and-push then a gravity arc, see the comment above `solo`; then the masked kinnara and kinnari pair from 4 to 5:45 PM,
circling each other; the to from 6 to 7:30 PM; the white and the yellow to together from 7:45 to 8:30 PM (`twoTo`, round an
oval on opposite sides); the pair again from 8:45 to 9:45 PM; and from 10 to 11 PM the two to with the kinnara alone between them
(`toKinnara`: the kinnara's solo kept to the middle, `roam`, the to each at its own side facing the crowd; a bigger crowd, as for
the solo). In the gaps between them (3:31–3:59, 5:46–5:58, 7:31–7:44 and 9:46–9:59 PM) a Shan singer stands alone on the
stage (`singer`, `stageSinger` in `18c-stage-singer.js`, after the site owner's photo: grey silk jacket, white headcloth, straw hat on
his back, sword with wool tassels, microphone at his mouth). He is **silent on purpose**: no song is played, so there is nothing to
license; the band's players step off and no stroke reaches the ambience. Don't add a recording of a real song to him.
The shows are `DANCES` in `07-festivals-and-weather.js`, in the order `danceNow()` checks them.
The to (`toDancers` in `18b-to-dance.js`, Shan တၢင်းၵႃႈတူဝ်း, Burmese တိုးနယား, after the site owner's photo and YouTube _U-imZ1KuM8)
is two dancers in one white costume trimmed gold, green and red: two jointed pairs of legs with gold/green/red ruffs and gilt paws,
a barrel body stretched each frame between the back dancer's rump and the front dancer's chest (so it tips up when the back one
crouches), a long neck with a mane, a deer's head (long muzzle, black nose, big eyes, ears out to the sides, branched
antlers built by `tine()`) and a wagging tail. It keeps time with the band: the kinnara step returns the
bar count while a to is on and plays the music (the kinnara pair are hidden), and the to runs one figure per bar round its
own 16-bar `FIG` (prance, bow to the crowd, shake, rear, hop, turn, crouch). A Shan ensemble, all in tan Shan jackets and baggy trousers, plays at the sides of the stage whenever they are on: two long drums, each slung from its drummer's shoulder (`longDrummer()`), a
row of five graduated gongs in a painted case, all struck at once by a row of beaters on a rod that a player on a stool pushes
(`setPush`), and cymbals (`musician(x, z, ry, cloth, sit)`, `GONGS`, `CHORD`,
`PAIR` (gongs and cymbals over a pair of beats), `FIGS` (the drums' sixteenth-note figures, picked per beat by a fixed hash,
weighted as counted in a Shan oh-zi recording, YouTube dCmtysbXxoM), `frame(n)` for each bar's strokes: about 113 a minute, the
gongs' chord on every second beat (lightly on the half beat before), cymbals on every beat and just after each half beat, the
first drum on every beat; a bar (one dance figure,
`BAR` 1.59 s) is three beats; labels in
Shan only), keeping time with the dancers (one figure per bar, `BAR`). Players' hands land on their instruments through `fit()`,
a pose search run once at build time. The strokes reach the ambience through `temple.takeBand()`. The main script passes `temple.setDancers("solo" | "pair" | null)` each frame; off stage they are hidden
and can't be clicked. `?dancers=solo`, `pair` (or `1`), `to`, `twoTo`, `toKinnara`, `singer` and `?dancers=0` force one.
Their audience (`festivalAudience`, rows in `AUDIENCE`) follows the same switch: blocky low-poly children sitting cross-legged
and young people standing behind, one vertex-coloured mesh each, turned to the stage. The pair draws 16; the rows marked
`epic` join only for the solo, making 37. When it rains (the townsfolk's `umbrellas` switch) the children go home and the young people standing hold
umbrellas (a second body with the right arm raised, umbrellas as one `InstancedMesh`); the dancers and band stay dry under the pavilion roof.

## Dragon and lion dance training

For the `days` (30) before Chinese New Year (`CONFIG.lionDragon`; New Year dates are a table, `newYear`, 2026–2035, so add years
before it runs out), the kung fu ground east of the pagoda holds practice (`lionDragonTroupe` inside `trainingGround` in
`temple-floors.js`): the dragon 6–9 AM and 9–10 PM, the two lions 9:30–11 AM and 6–8 PM. `drillNow()` in the main script gives
`{ season, newYear, show }` and passes `temple.setLionDragon("dragon" | "lion" | null)` each frame. On New Year's day itself the
ground is quiet. The drum on its stand stays all year; the drummer and cymbal player come for both practices. While the season
runs (and Halloween doesn't), `#festInfo` names it and the hours. `?lionDragon=dragon`, `?lionDragon=lion` or `?lionDragon=0`
forces one.

## Weather

- Follows the seasons of the northern Thai hills; no live weather API. Kinds (in `WEATHER`): `clear`, `cloudy`, `rain`,
  `mist`, `haze`. Each has a fog factor, a sky tint and its strength, rain (0–1) and wind (0–1).
- `weatherNow()` picks one per `CONFIG.weather.spell` hours from that month's odds (`CONFIG.weather.odds`, rows Jan–Dec,
  columns clear/cloudy/rain/mist/haze), using a hash of the date so every visitor sees the same sky. Mist is likelier from
  4 to 10 AM.
- `weatherStep(dt)` eases the current weather (`wx`) toward the target, sets fog distance and exposure outside, and moves
  the rain streaks (`rainLines`, a box that follows the camera, hidden under reduced motion).
- `skyColors()` blends `wx.tint` into the sky and fog. The weather has no HUD line (removed 2026-11-21: players see it, they don't need it spelled out).
- `?weather=rain` (or `clear`, `cloudy`, `mist`, `haze`) forces one.
- Weather only shows outside (`current === "pagoda"` or a corridor); indoors keeps its own lamplit fog.
