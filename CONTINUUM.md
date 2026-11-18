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

### 2026-11-18: Stadium Road, a modern quarter by the football ground

- New piece `28c-stadium-quarter.js`, `stadiumQuarter(g)` (called after `hluttawRoadHouses` in `36-…`), settings in `SQ`.
  Stadium Road (အားကစားကွင်းလမ်း) runs north–south at x −200 (carriageway x −204…−196, pavements 2.5 m) from z −5 to the
  Hluttaw road (z 255.5). At its south end a link road (z −5…1) runs east along the stadium's back wall to the hospital road
  (x −128), the front street's west arm; at its north end the Hluttaw road is carried on west to meet it (new `main` entry at the
  end of `LANES`, x −206.5…−118, and a median gap `[-207, -192]` first in `MAIN_GAPS`).
- West side (fronts at x −207.5): a six-storey glass business centre, Valley Telecom (five storeys, relay mast), Highland Leaf
  Tea (four), Northern Shan Logistics (three, a truck in its yard), Golden Bowl Chinese Restaurant (two, red lanterns), then
  four blocks of flats (five and six storeys, two with shops). All company names are made up.
- East side: five two-storey restaurants with pavement tables backing onto the stadium wall (Shan noodles, tea shop, hot pot,
  BBQ, coffee); floodlit futsal and basketball courts in a chain-link fence (z 75…99); a footpath at z 103 to the stupa hill's
  west stair (end hard-coded at x −157); the township sports hall (blue hip roof); a six-lane public pool with changing rooms
  and loungers; Stadium Park with paths, benches and a playground; two blocks of flats. Across the Hluttaw road, x −195…−133,
  three blocks of flats over a mini mart, a pharmacy and a phone shop.
- Height limit: `block()` clamps every building to `SQ.maxFloors` (6). Almost everything is `part()`s of one unit box,
  cylinder, crown and cone, so the quarter bakes into a few instanced meshes; it lies past `CULL.far` and is never culled.
- Burmese wording on signs (ours, no Shan): စီးပွားရေးစင်တာ, ဆက်သွယ်ရေး ကုမ္ပဏီ, လက်ဖက် ကုမ္ပဏီ, ကုန်စည်ပို့ဆောင်ရေး ကုမ္ပဏီ,
  တရုတ်စားသောက်ဆိုင်, ရှမ်းခေါက်ဆွဲ, လက်ဖက်ရည်ဆိုင်, ဟော့ပေါ့, အကင်ဆိုင်, ကော်ဖီဆိုင်, ဘောလုံးကွင်းငယ် (futsal), အားကစားခန်းမ,
  ရေကူးကန်, ပန်းခြံ, တိုက်ခန်းအိမ်ရာ, ကုန်စုံဆိုင်, ဆေးဆိုင်, ဖုန်းဆိုင်. A Burmese reader could glance over them.

### 2026-11-18: house compounds on the Hluttaw road

- New piece `28b-hluttaw-road-houses.js`, `hluttawRoadHouses(g)` (called after `hospitalRoadHouses` in `36-…`): the empty
  ground north of the Hluttaw road from its west end to the Hluttaw compound (x −113…−12, z 263…278.5) now holds seven Shan
  family compounds (`ROAD_LOTS`: width, fence kind, wood/concrete, storeys, pot stand). Houses are the existing `shanWoodHouse` /
  `shanHouse`, turned to face the road. Fences: woven bamboo (twill canvas texture), split-bamboo pickets (instanced) or a
  whitewashed brick wall with piers; gates stand open (steel leaves for brick, a woven leaf under a bamboo lintel otherwise).
  Water pot stands (ရေအိုးစင်, Burmese, clickable) on the verge at three gates. The far end is beyond `CULL.far`, so it is
  never culled; keep the detail light.

### 2026-11-18: banana plants from a reference

- `banana()` in `21-back-street-houses.js` rebuilt after the owner's reference picture of a low-poly banana plant: each clump is
  one grown plant (`bananaPlant`, stem 2.4–3 m, brown lower 60%, green above) plus one or two suckers at .4–.7 scale. 9–11
  leaves per plant, 2–3 m long, from four shared leaf geometries (`bananaLeafGeos`: short stalk, blade on a constant-curvature
  arc, halves drooping from a pale midrib, torn across into 12 strips a side, some edges dried yellow/brown, vertex colours),
  and 5–8 dead leaves hanging down the stem (`bananaDeadGeos`, no shadow). Everything goes through `part()` now (it used plain
  meshes), so the 16 clumps (33 plants) bake into a handful of instanced meshes. Callers unchanged; the crowns are a bit wider
  than before (about 2.5 m reach), so check none pokes through a wall or roof behind the houses.

### 2026-11-18: tall, open hill pines

- `pine()` in `09-trees-and-walls.js` rebuilt twice today from the owner's reference photos; the second (kept) photo is a tall
  sparse conifer. Now: a 10–11.6 m straight grey trunk (at scale 1; was 5.2 m) on five roots, bare for ~40% of its height
  but for dead-twig stubs, then open whorls of 2–4 near-level branches with trunk showing between them (`pineBranch`), each
  carrying small flat drooping sprays (`pineSprayGeo`, a bent detail-0 octahedron, 8 triangles) along both sides and at the
  tip, a small tuft and a thin leader on top. No solid inner cone. About 130 `part()`s per tree, all instanced.
  Callers (temple grounds, town, stupa hill) are unchanged; the trees are about twice as tall, so check none pokes into
  something overhead, and whether the many extra instances cost frame rate on the hill.

### 2026-11-18: thicker bamboo at the hill's foot

- Owner: "more bamboo in the grove between the hill foot and the houses". `FOOT_BAMBOO` in `27-bamboo-fuel-fire-police.js`:
  band out to 16 m past `HILL.rBase` (was 14), clump step 2.4 m (was 3.1), room kept from houses/lanes 2.2 m (was 2.6), and the
  share of spots skipped moved into `FOOT_BAMBOO.skip` (.08, was a literal .18). Measured headless: 42 clumps / 440 culms (was
  26 / 277); buffers resized to 1200 culm pieces and 7200 sprays (used 880 and ~5200). Viewed from above the houses; no errors.

### 2026-11-17: realistic low-poly bamboo

- Owner (three photos of clumping bamboo, "current bamboo grove are not realistic"): `bambooStand()` in
  `27-bamboo-fuel-fire-police.js` now draws foliage as alpha-cut cards instead of icosahedron blobs. `bambooTextures()` paints
  three canvas textures once (cached in `BAMBOO_TEX`): a pale culm skin with a node ring per repeat (tinted green per culm,
  repeat 1×9), a spray of ~34 narrow drooping leaves on a twig, and a grass tuft. Sprays are two quads crossed along the twig
  (`crossedCards`), 9–13 per culm from just below the joint to the tip (longer and droopier lower down, the last one arching the
  way the culm leans), and a few low ones on a third of the culms; grass cards (two upright crossed quads) ring each clump's foot.
  Three `InstancedMesh`es per stand (culms, sprays, grass); spray budget raised to 17000 (school grove) and 13000 (hill foot).
  About 4 triangles a spray against 20 a blob before, so cheaper overall.
- Checked headless from outside the school grove and from inside it; no errors.

