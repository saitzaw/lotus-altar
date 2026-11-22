# CONTINUUM.md

A running log that carries context from one working session to the next: where the project stands, what changed
recently, and what's still open. Read it at the start of a session; update it at the end. Newest entries go first.
The log keeps only the six or so most recent entries. When it grows past that, move the oldest to the top of
`CONTINUUM-archive.md`, which isn't read at the start of a session. Look there, or in `git log`, for older history.

## Current state (2026-10-28)

- Code layout (2026-11-07): `lotus-altar.js` and `temple-floors.js` are cut into small topic files under
  `lotus-temple/src/lotus-altar/` and `lotus-temple/src/temple-floors/`; `build-dist.sh` joins them into `dist/`. Map of
  every piece: `.claude/skills/lotus-altar/references/files.md`. Names below "in `temple-floors.js`" live in those pieces.

- Site deploys with Vercel from `lotus-temple/` (build: `bash build-dist.sh`, output `dist/`), automatically on every push
  to `main` (the Vercel check shows on the commit's GitHub status).
- Halloween festival is active Oct 27 – Nov 1: houses go dark at 9 PM ICT until 5 AM, a friendly ghost
  walks the roads, first-person walkers carry a torch. Force with `?halloween=1` / `?halloween=0`.
- Weather outside follows northern Thai seasons, picked per 3-hour spell from the date (`CONFIG.weather`, no live API):
  clear, cloudy, rain (streaks, thunder), mist, smoky haze. Force with `?weather=rain|clear|cloudy|mist|haze`.
- Townsfolk (10 in the market, 5 on the roads) are out 6 PM – 10 PM ICT and carry umbrellas in the rain; after 10 PM
  they go home and (in Halloween season) only the ghost is left on the roads.
- Ambient sound is synthesized in WebAudio (`ambStart`/`ambStep` in `lotus-altar.js`), placed by `temple.sounds` in
  `temple-floors.js`: stupa hti bells, temple bell and Lotus Temple hall gong, banyan leaves, forest birds/cicadas/
  crickets, wind over the paddies, rain. HUD 🔊 button mirrors the `soundOn` checkbox.
- `guanyin.glb` (the museum scan in `CONFIG.scan`) is **not in the repo**, so the floor-1 Guanyin is the sculpted SDF
  figure. `build-dist.sh` copies the scan only if it exists.
- `CHANGELOG.md` at the repo root lists changes by day, newest first; add a line there with each meaningful change.
- Agent docs: `AGENTS.md` (any agent) and the `lotus-altar` skill in `.claude/skills/lotus-altar/` (Claude Code): `SKILL.md`
  holds the rules and an index; details live in `references/*.md`, one file per topic.

## Open threads

- The rice granary's label စပါးကျီ (Burmese, ours) on the east road: ask the owner whether it reads right and whether they want a
  Shan line too.
- The new signs and names are Burmese and English only: အမှတ် (၅) ရပ်ကွက် (Ward No. 5), ရပ်ကွက်အုပ်ချုပ်ရေးမှူးရုံး, မြို့နယ်စည်ပင်သာယာရေးကော်မတီ,
  မြို့နယ်လူဝင်မှုကြီးကြပ်ရေးဦးစီးဌာန, ဒီဇယ်မီးစက်ရုံနှင့် ဓာတ်အားခွဲရုံ, ဓာတ်အားခွဲရုံ ခလုတ်ခန်း, ဗို့အားမြင့် · အန္တရာယ်ရှိသည်. Ask the owner
  whether the wording is right and whether they want Shan lines. The Shan house's tip uses the Shan ႁိူၼ်းတႆး ("Shan house"):
  have a Shan speaker check it. Ask whether the power station should run its engines only at set hours (then add it to
  `SCHEDULE.md`) and whether it should make a sound.
- The lotus lanterns' Burmese labels are ours: ဆီမီးပူဇော် (offering of lamps) on their tip, သီတင်းကျွတ် (Thadingyut) and တန်ဆောင်တိုင် (Tazaungdaing) in the toast. Ask the owner whether they want a Shan line too, and whether the lanterns should also go round the Shan stupas or the stairs.

- The fire lotus ground's board reads မီးလျှော်ပွဲ၊ မီးကြာစံပွဲ (the owner's words), with our English "Fire Offering · Fire Lotus Festival". Ask the owner whether the glosses are right (is မီးကြာစံပွဲ a contest, or a show?), and whether they want a Shan line too.
- Have a Shan speaker check ၵၢတ်ႇပွႆး (kaat poi, "festival market"), our wording on the board over the balloon-ground market's gateway.
- The shared seated Buddha body (`seatedBuddha` in `statue-sculpt.js`, used by Shakyamuni, the Medicine Buddha and the Victorious
  Buddha) is mirrored: seen from the front, the earth-touching hand and the robed shoulder are on the wrong sides. The Shan image
  is built mirrored to be correct; decide whether to flip the others too.

- Check the 5F arms, the 6F statue and the wish-tree Buddha by eye in a browser (headless renders can't finish the statues).
- Hall name 降魔殿 for the Victorious Buddha is our choice ("hall of subduing Māra"); have someone confirm it reads well.

- Have a Shan speaker check the third monastery's name ဝိႁၢၼ်ႇၵုင်းသႃႇ (`SHAN_NAMES.wihan`). Decide whether it gets a hall inside.
- Have a Shan speaker check the lower monastery's name ၵျွင်းလူင်ဝဵင်းၵဝ် on the stupa hill.
- Have a Shan speaker check the hospital's name ႁူင်းယႃလူင်ၵူၼ်းမိူင်း, and a Tai Nüa reader its Tai Le line ᥞᥨᥒᥰ ᥕᥣ ᥘᥨᥒᥴ ᥐᥨᥢᥰ ᥛᥫᥒᥰ (`HOSP_NAMES`).
- Have a Shan speaker check ယေးလိူတ်ႈ (blood bank) and ၶိုၵ်ႉၶၵ်ႉ (emergency), and a Tai Nüa reader ᥓᥣᥛᥱ ᥘᥫᥖᥲ and ᥑᥪᥐᥱ ᥑᥐᥱ
  (`BLOOD_NAMES`, `ER_NAMES`, given by the owner). The Chinese 血库 and 急诊 are ours.
- The nursing college's name (သူနာပြုသင်တန်းကျောင်း, "Nursing Training College") is our choice for the owner's "training college";
  ask the owner whether they meant another kind of college.
- Have a Shan speaker check the hills' name လွႆသၢမ်သိပ်း (Loi Sam Sip, glossed "the thirty hills") and its spelling.
- Have a Shan speaker check တၢင်းၵႃႈတူဝ်း (the to dance) and the romanisation "ka to" in its toast.
- Have a Shan speaker check မွင်း (the row of gongs on the festival stage).
- Have a Shan speaker check ၵွင်ယၢဝ်း (the long drum's name on the festival stage drummer).
- Have a Shan speaker check ၸၢပ်ႈ (the cymbals on the festival stage; a best guess, after the Tai word chap).
- Have a Shan speaker check the welcome board's Shan line (`WELCOME` in `temple-floors.js`).
- Have a Shan speaker check the throne room's ပလၢင်ႇသီႇႁႃႇသၼ (lion throne) and ၸွင်ႈၽိူၵ် (white umbrella), in `hawHall`'s toasts.
- Have a Shan speaker check the library's name ႁူင်းတူၺ်းလိၵ်ႈၵူၼ်းမိူင်း, and a Tai Nüa reader its Tai Le line (`LIB_NAMES`).
- Have a Shan speaker check ႁူင်းႁေႃၸုမ်းၽွင်းမိူင်း, the owner's Shan name for the Hluttaw (`SHAN_NAMES.council`, in its tip and toast).
- Have a Shan speaker check the palace's names in `SHAN_NAMES`: ႁေႃၶမ်း (Haw Kham, on its board) and ၸဝ်ႈၾႃႉ (saopha, in its toast).
- Have a Shan speaker check the hill's names (`SHAN_NAMES`): ၽြႃးမုင်ႈမိူင်း (stupa) and ၵျွင်းၵွင်းမူးၶမ်း (monastery), as given by the
  site's owner; the boards carry the Shan names only.

- After Nov 1, decide whether to keep the Halloween code for next year (it switches itself off by date) or remove it.
- `CONFIG.camera.stairsTop` in `lotus-altar.js` has a pasted run of duplicate trailing comments to clean up.

- Have a Shan speaker and a Tai Nüa reader check the food street's board names (`FOOD_SIGNS` in `12d-food-street.js`, given by
  the owner), e.g. လၢၼ်ႉၶဝ်ႈၽၵ်းတႆး / ᥘᥣᥢᥳᥑᥝᥲᥚᥐᥴᥖᥭᥰ; the English lines are ours.

- Have a Shan speaker check ပွႆးသၢင်ႇလွင်း (Poy Sang Long) in the procession's hover tip (`24b-shinlaung-procession.js`).

- The township court's board (`COURT_NAMES`) has Burmese မြို့နယ်တရားရုံး, Chinese 镇区法院 and English only (ours); ask the owner for
  the Shan and Tai Nüa names, as for the bank.

- Have a Shan speaker check ၼွင် (nawng, lake) in the palace lake's tip and toast (`15f-palace-lake.js`).
- The island pavilion on the palace lake is our own design: the owner mentioned a Shan building to copy, but no photo came with
  the request. Restyle it once the photo arrives.

## Log

### 2026-11-22: More fireworks, in every colour, on the night balloons

- From the owner's Taunggyi photos: the fireworks balloon (`15g-balloon-ground.js`) now goes up three launches in five at night
  (`NIGHT_SET`), and its rack throws out more and brighter fireworks for 70 s of its climb: a fountain of white and gold sparks
  with coloured stars in it, rockets that streak out trailing sparks of their colour and pop, and a shell every 1–3 s that bursts
  into a ball of 100–180 stars of one colour or two. Colours come from `fwCol()`: a set of firework colours (red, green, gold,
  orange, blue, pink, cyan, violet, white) or, 40% of the time, any hue. Two shared point pools (`fwPool`: 3000 fine sparks,
  2000 big stars) and up to 40 rockets; nothing is thrown with reduced motion.

### 2026-11-22: Ward No. 4, the inner quarter behind the daily market

- The empty block between the daily market and high school (west) and the east road's back fences (east) is now Ward No. 4
  (`innerQuarter`, `28g-inner-quarter.js`, `WARD4`). Its lane leaves the market lane between the daily market (z 102.8) and the
  school wall (z 111) and runs east to a tea shop facing straight down it; there it meets the quarter's north–south lane
  (x 114…118, z 81…199.5). Both are `LANES` entries, so `backStreets` draws them with drains, poles and village lamps.
- 18 houses (wood and concrete, one and two storeys) in two rows, bananas, shade trees, washing lines, a well; the ward
  administrator's office at the south end (with the flag) and the quarter's dhamma hall (ဓမ္မာရုံ, exterior only) at the north
  end, short of the power station's back wall (z 214). Board "အမှတ် (၄) ရပ်ကွက် / Ward No. 4" (Burmese) at the lane's mouth.
- Checked with top-down and street-level headless renders. No Shan wording added.

### 2026-11-22: the east road's junctions, its lots closed, lazy matrices

- Junctions: the front street's own asphalt, pavements and centre dashes now run on to the east road (`EX = EAST_ROAD.x1` in
  `templeGrounds`, `09-…`); `eastRoad` no longer lays a separate stretch, which had a different asphalt colour and left a seam
  at x 145. The main road's south drain and white edge line now stop at every mouth that joins it (`LANES` ending at its z0,
  and `EAST_ROAD`), the road's east end gets an edge line, and the east road's east verge carries on round that end (to z 262.7).
- Lots: on the east row the side fences were put on local −x, which there is north, so three edges were open (south of the
  first lot, between lots 4 and 5, north of the last) and two doubled the big compounds' walls. Fences now go on each lot's
  world-south side (`south = -dir * w / 2`). Checked every boundary on both rows numerically: each closed exactly once.
- Speed: `lazyMatrices` (`37-culling.js`, `CONFIG.cull.lazy`): a cell item the culling has hidden skips three.js's
  per-frame matrix update until it's shown again (or its parent moves). Measured (headless, real GPU): `world.updateMatrixWorld`
  3.2–3.4 ms → 1.9–2.5 ms per frame at the gate, market, town and east road; draw calls and pictures unchanged.

### 2026-11-22: the east road and its Shan family compounds

- New piece `28f-east-road-compounds.js`, `eastRoad(g)` (called after `powerStation` in `36-…`). The east road (carriageway
  x 155.5…162.5, dirt verges) runs from the front street, carried on east from x 145 to 162.5 past the police station, north to the
  main road, whose last `main` lane now ends at x 162.5 (median gap `[150, 170]` in `MAIN_GAPS`). The front street's pavements
  are carried to the corner. Give-way lines at both ends; street lights on the east verge (`EAST_LIGHTS`).
- The power station's line now leaves over its back wall and runs down the west verge on ten concrete poles (`EAST_POLES`, used
  by `powerStation`); it no longer heads toward the bamboo grove.
- Lots (`EAST_LOTS`): west row 7 (fronts x 154.3, z 74…194), east row 10 (fronts x 163.8, z 64…251). Each lot is its own group,
  laid out like the Hluttaw road's (front fence at local z 0, yard +z) and turned to face the road. Kinds: a family lot
  (`familyLot`, the Hluttaw road's layout), a big walled compound (`bigCompound`: a two-storey wooden house at the back, a
  married child's one-storey concrete house facing the yard, a rice granary `granary` (စပါးကျီ, Burmese, clickable), a well,
  a washing line), and a vegetable garden with a field hut (`vegGarden`, clickable beds).
- The Hluttaw road's fence, gate and water pot stand builders moved into `lotKit(r)` in `28b-…` (same random stream, so
  that row is unchanged); both rows use it.
- Checked in headless Chromium: a walk-surface map of the area, three views from above and one from the road. No console errors.

### 2026-11-21: Ward No. 5, a Shan house, municipal and immigration offices, a diesel power station

- New piece `28e-ward-five-offices-and-power.js`, called after `townshipCourt` in `36-…`: `shanTwoStorey` (`SHAN2`), `wardQuarter`
  (`WARD5`), `townOffices` (`TDC_OFFICE`, `IMMIG`), `powerStation` (`POWER`), with shared helpers `compoundWall`, `compoundGate`,
  `gateBoard` and the lazily built kit `C5` (`c5Kit()`).
- The main road goes on east from the court road's end (x 64.5) to x 158: a new `main` lane at the end of `LANES`, with median gaps
  at x 79–96 (the ward lane's mouth and the municipal gate) and 114–128 (the immigration and power station gates). Ward No. 5's lane
  (x 88–92, z 196–255.5) is the last entry in `LANES`, so `backStreets` draws it with drains and village lamps.
- Shan house beside the bank at (77.5, 243.5), front to the road: whitewashed brick ground floor with arched windows and a shop room,
  a teak upper storey jutting out on brackets with green louvred shutters, a balcony on posts, a rusty hip roof with a raised
  ridge, and fretted boards along the eaves; in a walled yard (bougainvillea, frangipani, jars).
- Ward No. 5: three houses west of the lane and four east (`shanWoodHouse` / `shanHouse`), a corner shop on the road, a well,
  washing lines, bananas; the ward administrator's office at the lane's end (90, 190.6); the ward board at the lane's mouth.
- Across the road: the municipal office (85, 278) with its rubbish truck, and the immigration office (121, 276) with a queue
  shelter, each `civic()` in a walled compound with a railed front wall, a gate board and the flag.
- Power station, compound x 112–152, z 214–254.5, gate at x 121: engine hall (126, 236) with roller doors, four smoking stacks
  (sprites, still under reduced motion), radiators with turning fans (`frustumCulled = false` so they aren't welded into a batch),
  two diesel tanks in a bund, a fenced switchyard (x 138–151, z 215–246) with two gantries, two transformers, busbar, breakers and
  switches, the main switch room by the gate, and a pole line leaving toward the bamboo grove. No sound yet, no timed running.
- Checked in headless Chromium from above and from the road. No console errors from the page.

### 2026-11-21: lotus lanterns round the main stupa in October and November

- New piece `13c-stupa-lotus-lanterns.js` (`stupaLotusLanterns(T, list, TW, STEPS)`), called at the end of `shanStupaHill`'s terrace
  walk block. 160 lanterns: on the parapet coping (clear of the step openings and the corner lamp posts), a row 3.12 m out round the
  stupa's foot, and both ends of every step of the four flights. Four draw calls: two `InstancedMesh` petal rings sharing one lathe
  cup pulled into eight pointed petals (vertex colours white to pink), the flames, and one `Points` glow cloud.
- Season: `CONFIG.lotusLanterns.months` [10, 11] on the temple's clock, `lotusLanternsNow()`, `temple.setLotusLanterns`,
  `FOLK.lotusLanterns`, `?lotuslanterns=1/0`. Shown day and night, glowing after dark. Hidden lanterns get `count = 0`, since the
  picking ray doesn't skip hidden meshes. `#festInfo` names the festival of lights when no other season shows.
- Checked in headless Chromium at night on the terrace walk. No console errors.

### 2026-11-21: the fire lotus ground on the stupa hill

- New piece `15j-fire-lotus-ground.js` (`fireLotusGround`, `FIRE_GROUND`, `fireLotusArc`), called after `balloonBazaar`. It sits on the
  lower terrace's free arc between the north stair (3.55 rad) and the west stair (−π/2), about 3.66–4.60 rad, r 44–75, built like the
  balloon ground (field on a retaining wall, parapet, nine walkable terraces). The arc's outer edge stays 5–9 m off the pool and the
  park in the stadium quarter and the north walk's start. Pines on the upper slope in that arc are skipped (seed still steps).
- Three 24 m bamboo towers in rope rings (walkers can't enter the rings). The show (`FOLK.fireLotus`, `CONFIG.fireLotus` 19–24,
  `?firelotus=1/0`, off in the rain): a tower every 100 s; racks catch from the foot up, then the lotus's burning stars drop trails.
  Sparks are one points cloud (4,200), smoke a pool of 36 sprites, all in the grounds' frame.
- The balloon ground's crowd figures moved out into `crowdKit(q)` (same random stream, so the balloon crowd is unchanged); both
  grounds use it.
- Checked in headless Chromium (night, mid-burn and lotus; day from the north stair's foot). No console errors.
- No fireworks sound yet.
