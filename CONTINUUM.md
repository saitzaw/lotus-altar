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
- Have a Shan speaker check ပွႆးၵထိၼ် (Poy Kathin, our wording) on the Shan Kathin procession (`24c-shan-kathin.js`). The Burmese ကထိန်ပွဲ and ပဒေသာပင် are the usual names. The date windows in `CONFIG.kathin` follow the full moons and may be a day off; 2031 stays in October because that year has two full moons then.

- The township court's board (`COURT_NAMES`) has Burmese မြို့နယ်တရားရုံး, Chinese 镇区法院 and English only (ours); ask the owner for
  the Shan and Tai Nüa names, as for the bank.

- Have a Shan speaker check ၼွင် (nawng, lake) in the palace lake's tip and toast (`15f-palace-lake.js`).
- The island pavilion on the palace lake is our own design: the owner mentioned a Shan building to copy, but no photo came with
  the request. Restyle it once the photo arrives.

## Log

### 2026-11-25: A darker, bluer night outside

- The owner didn't feel night outside. The cause was mostly the halls' warm environment map lighting every standard material outdoors at full strength, under a black sky. Outside it now dims to a faint blue at night (`ENVS`, `envFor`, `CONFIG.light.nightEnv`), the grounds' sky fill and moonlight are weaker and bluer, exposure drops a little after dark (`CONFIG.light.night`), and the sky and haze are a deep navy (`nightSky`, `nightHaze`) so the hills show against it. Halls and daytime are unchanged. Checked by headless renders of the pond and the road outside the wall, by night and by day.

### 2026-11-25: Brighter night balloons

- The owner found the fire balloons dim at night. In `15g-balloon-ground.js` the night papers (painted, flowers, and the lantern balloon's plain paper) now ignore the fog, the night papers glow at `BALLOON_GROUND.nightGlow` 1.8 (was .6 for every paper; day papers sent up after dark use `dayGlow` .9), each night balloon carries a warm 24 m halo sprite (`halo` .5, half for the lantern balloon), and the lantern balloon's candle lanterns are bigger (`lampSize` 1.25, was .85). Checked in headless Chromium at night (`~/lotus-altar-tests/balloonglow/`).

### 2026-11-25: Christmas and the harvest thanksgiving at the Kachin church

- The owner asked to prepare for Christmas and Thanksgiving, and chose: Thanksgiving as the church's harvest thanksgiving on the
  last Sunday of November (not the US Thursday); Christmas as the church dressed, carol singers, Christmas services and the
  Christian homes lit; nothing on the temple grounds or the pagoda. Carols every evening 1–24 December, 7–11 PM.
- New piece `28h-christmas-and-harvest.js` (see `sky-and-weather.md`, "Christmas and the harvest thanksgiving", and `SCHEDULE.md`).
  `CONFIG.christmas`, `CONFIG.harvest`; `?christmas=`, `?carols=`, `?harvest=`. Checked in headless renders: the church inside
  (tree, nativity, lanterns, greeting, harvest gifts), outside at night (tower star, bulbs, star poles) and the carollers at a door.
- Ours, for the owner to confirm: the season's end (6 January, Epiphany), the Christmas Eve service's hours (5–7 PM, before the
  carols go out), which homes are Christian (the pastor's, the women workers' and the two plaza-lane houses nearest the church),
  the carollers' route and stops, and the harvest gifts lying out all that Sunday.
- For a Jinghpaw speaker to check: the greeting “Ngwi Pyaw Christmas” over the cross. The harvest display's tip uses Burmese
  ကျေးဇူးတော်ချီးမွမ်းပွဲ (thanksgiving service); check that too.

### 2026-11-24: The Shan Kathin on its one day

- The owner says the town holds the Shan Kathin on one day only, the full moon of Tazaungmon in November, and there is no Shinlaung procession that day. `CONFIG.kathin.windows` (a month each year) became `days` ([year, month, day], the Tazaungmon full moons through 2035); `kathinSeason()` became `kathinDay()`, and `processionNow()` is false on that day unless `?procession=1`. `#festInfo` names the Kathin only on its day. 2031 has two full moons in October; the owner confirmed the Kathin is always in November, so 2031's day is Nov 30.

### 2026-11-24: Sharper fireworks from the night balloons

- The owner found the balloon fireworks blurry. They had been drawn as `PointsMaterial` points with the soft `glowTex`, 1.2 m (sparks) and 2.6 m (stars) wide, so they piled up as a coloured fog. `fwPool` in `15g-balloon-ground.js` now draws each with a small `ShaderMaterial` (`FW_VS`/`FW_FS`): a hard white-hot core with a thin halo of its colour, sized in metres (`uH` set from the drawing buffer in `onBeforeRender`) but never under 2.5 px, white when just lit and its own colour after; and a `LineSegments` streak back along its velocity that fades to the tail. `emit` takes optional size, heat and streak factors. Shells now come as peonies, gold willows (long drooping streaks) or tilted rings, with a white flash and sometimes a crackle of glitter. Checked by rendering the pool code alone in headless Chromium; not yet seen inside the full scene at night.

### 2026-11-24: The Shan Kathin preview walks at the real pace

- `?kathin=1` had been covering the whole route in 36 seconds, about 7 m/s, and then sending everyone to their places at 6 m/s. It now uses the same 0.45 m/s as the afternoon itself (`KATHIN.speed` in `24c-shan-kathin.js`), and once the band at the back has reached its place and everyone has stood for 48 seconds, it starts again from Haw Kham.
- The route reads the stair's footpath and zebra crossing from `HILL.approach` (set in `13-stupa-hill.js`) instead of repeating that maths, so moving the stair moves the procession with it. The leg loops in both processions no longer make a closure for each walker every frame.

### 2026-11-24: The Shan Kathin leaves Haw Kham and goes round the old quarter

- The robe procession no longer follows the morning route from the temple gate. It forms on the palace lane in front of Haw Kham's town gate, walks east past the old Shan houses, down the market lane, west along the front street and up the main stair to the second monastery (`24c-shan-kathin.js`). About 250 m, so they arrive about 12:10 and stand until 2. The monks, the robe and the hours are unchanged.

### 2026-11-24: Shan Kathin, the robe offering after the rains retreat

- From noon to 2 PM ICT in the month after Thadingyut's full moon, through Tazaungdaing's (`CONFIG.kathin.windows`, through 2035), the town walks out from Haw Kham round the old quarter and up the main stair, with no dance stops (`24c-shan-kathin.js`): streamer poles, a padetha tree (ပဒေသာပင်) on two shoulder poles, women with bowls, the folded saffron robe on a gilt tray under a white umbrella, the donors, and the Shan band. They reach the second monastery about 12:10 and stand at the foot of its stair until 2. Five monks wait on the porch (floor 2.6 m up) the whole time. Called off in the rain; `?kathin=1` runs a short timetable from Haw Kham even in rain, `?kathin=0` keeps it off. `#festInfo` names the month when Halloween and the lion-dance season are quiet. Shan ပွႆးၵထိၼ် is ours, for a speaker to check.

### 2026-11-24: The Day/Night button is back, for this visit

- `#timeBtn` sits in the HUD again (after Bird's-eye view). The page still opens on the real sky; the button shows the other look and, pressed again, goes back to the real sky. `dayChoice` is `null` for the real sky, `1` or `0` for a chosen look; `liveDaylight` is what the sun says. A daylight view after dark poses the sun at noon today on the temple's clock (`updateCelestial`), so the outdoor sunlight is on; the moon stays where it really is. The HUD sky line starts "Daylight view ·" or "Night view ·" while a look is chosen. The label names the action (☀ Day / ☾ Night) and the title and `aria-label` say whether it goes back to the real sky. The fade is guarded by `dayFadeUntil` on the frame clock, because `05-pagoda-and-camera-modes.js` clears `tweens` on a jump and a flag would have locked the button. Nothing is stored. Checked headless at 11:40 PM ICT: night → daylight view → real night.

### 2026-11-23: The Buddhas draw faster in the halls

- `CONFIG.sculpt` cells are body 20 mm, head 12 mm (lions 22 / 14 mm). The old 12 mm / 5.8 mm mesh was about 600,000 triangles and was drawn again into a 2048² shadow map. The detailed body and head no longer cast a shadow (`placeFigure` in `02-hall-and-guanyin.js`): a third mesh at `shadowCell` 40 mm casts it instead, with `shadowMat` (no colour, no depth write) so it never shows on screen. It stays on layer 0: a first try put it on layer 1 with `shadow.camera.layers.enable(1)`, and the statues cast no shadow at all, because r128 tests shadow casters against the main camera's layers. Those shadow maps are 1024². Porcelain and gilt are `MeshStandardMaterial`, so there is no clearcoat pass. Indices are 16-bit where the mesh fits. The wish-tree Buddha is its own coarser mesh (`cells` .03 / .018), and the thousand arms do not cast shadows.

### 2026-11-23: No Look closer button in the halls

- The pill `#viewBtn` ("Look closer" / "Full view") is gone from `lotus-altar.html`. Its click in `14-views-and-stairs.js` tweened the camera onto the image's face (`CONFIG.camera.closeUp`, or a place's own `closeUp`) over 1.3 s, which swung the view and made the hall dizzy. Statue halls are walked on foot; nothing flies the camera in. `closeUp` no longer gates `walkStep`, and the `closeUp` views are gone from `CONFIG`. The sky helpers keep a single moon sprite; `celestial.moon` replaces `moonNight` / `moonDay`.

### 2026-11-23: Fireworks start 6–12 m above the ground

- On a fireworks balloon (`15g-balloon-ground.js`) the rack stays quiet on the pad. Each launch draws its own start with `rng(9100 + c * 13 + p.k * 7)`: a height `h0` from 6 to 12 m above the terrace, turned into climb time `fw0` from the mouth's rise (`1.7 + climb·t + accel·t²`). Sparks, rockets and shells then run until a few seconds before the balloon is gone. Shells burst at a random point around the balloon, kept above the terrace, every 0.4–4 s.

### 2026-11-23: More lychees on the stupa hill

- A second planting after the first ring in `shanStupaHill` (`13-stupa-hill.js`): 48 more spots in four bands (radii 25, 38, 51, 64 m from the hilltop), staggered so they fall between the first trees and run further down the open grass. The same ground stays clear: the four stairs, both monastery terraces, the festival ground, the fire lotus arc, the big banyan, and the two lower monasteries. Seed 910, so the first ring is unchanged.

### 2026-11-23: The sun and moon follow the clock

- `updateCelestial` in `06-sun-and-moon.js` no longer poses a noon sun for the day view and a 10 pm moon for the night view. Both are where they are over Bangkok (`CONFIG.sky`) at `Date.now()`, including the moon's phase, and a body below the horizon is not drawn. `daylight` eases with the sun (full by 8° up, gone by 8° down). The Day/Night button went from the HUD (it came back on 2026-11-24, see above). `?day=1` / `?day=0` on localhost still holds one look for a test. The outdoor sun light in `36-lion-dragon-dance.js` goes out once the sun has set. Checked against the clock for this afternoon: the sun is up in the west, so the page opens in daylight.

### 2026-11-23: Nothing is saved in the browser

- Offerings (`state` in `01-catalogue-renderer-materials.js`), the Day/Night choice, festival tokens and pond coins used to be written to `localStorage`. They now last for this visit only. Each opening starts from the sample altar, with 100 tokens and an empty pond. `save()` is still called where the altar changes, and it does nothing. `?day=1` / `?day=0` forces the sky on localhost. Old keys (`lotus-altar-v2`, `lotus-altar-daylight`, `lotus-altar-tokens`, `lotus-altar-coins`) are left untouched in browsers that already have them.

### 2026-11-22: Lychee trees in place of the pines

- From the owner's photo of a fruiting lychee: `pine()` in `09-trees-and-walls.js` is replaced by `lychee()`, and every place
  that planted a pine now plants one (the back row behind the temple wall, the street trees by the gate, the town road's
  verge, the stupa hill's slopes). A short dark trunk forks at about 1.5 m into four limbs under a broad dense dome of 48
  glossy leaf clumps with a skirt hanging round the rim, and 3–5 red fruit hang off every clump. All `part()`s, so they
  bake to instances. Fruit shows all year (the real crop is April–June). The waterfall cliff's ten instanced cone "pines"
  in `11-waterfall-and-stream.js` are untouched.
