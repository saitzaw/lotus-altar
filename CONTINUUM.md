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

### 2026-11-23: Nothing is saved in the browser

- Offerings (`state` in `01-catalogue-renderer-materials.js`), the Day/Night choice, festival tokens and pond coins used to be written to `localStorage`. They now last for this visit only. Each opening starts from the sample altar, at night, with 100 tokens and an empty pond. `save()` is still called where the altar changes, and it does nothing. `?day=1` / `?day=0` forces the sky on localhost. Old keys (`lotus-altar-v2`, `lotus-altar-daylight`, `lotus-altar-tokens`, `lotus-altar-coins`) are left untouched in browsers that already have them.

### 2026-11-22: Lychee trees in place of the pines

- From the owner's photo of a fruiting lychee: `pine()` in `09-trees-and-walls.js` is replaced by `lychee()`, and every place
  that planted a pine now plants one (the back row behind the temple wall, the street trees by the gate, the town road's
  verge, the stupa hill's slopes). A short dark trunk forks at about 1.5 m into four limbs under a broad dense dome of 48
  glossy leaf clumps with a skirt hanging round the rim, and 3–5 red fruit hang off every clump. All `part()`s, so they
  bake to instances. Fruit shows all year (the real crop is April–June). The waterfall cliff's ten instanced cone "pines"
  in `11-waterfall-and-stream.js` are untouched.

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
