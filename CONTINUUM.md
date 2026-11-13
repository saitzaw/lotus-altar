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
- Halloween festival is active Oct 27 – Nov 1: houses and village huts go dark at 9 PM ICT until 5 AM, a friendly ghost
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

- The shared seated Buddha body (`seatedBuddha` in `statue-sculpt.js`, used by Shakyamuni, the Medicine Buddha and the Victorious
  Buddha) is mirrored: seen from the front, the earth-touching hand and the robed shoulder are on the wrong sides. The Shan image
  is built mirrored to be correct; decide whether to flip the others too.

- Check the 5F arms, the 6F statue and the wish-tree Buddha by eye in a browser (headless renders can't finish the statues).
- Hall name 降魔殿 for the Victorious Buddha is our choice ("hall of subduing Māra"); have someone confirm it reads well.

- Have a Shan speaker check the lower monastery's name ၵျွင်းလူင်ဝဵင်းၵဝ် on the stupa hill.
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
- Stale comment in `src/lotus-altar/02-hall-and-guanyin.js` (line 38) points to `guanyin-sculpt.js`; the file is `statue-sculpt.js`.
- `CONFIG.camera.stairsTop` in `lotus-altar.js` has a pasted run of duplicate trailing comments to clean up.

## Log

### 2026-11-13: no pediment over the upper monastery's door

- The gilt pointed pediment over the upper monastery's doorway (`14-shan-monasteries.js`) is gone: it rendered skewed (a
  4-sided cone squashed before its 45° turn), and Shan monasteries don't put one there. The door keeps its plain gilded frame.
  The Haw Kham throne room (`05b-haw-kham-throne-room.js`) still has the same cone pediment.

### 2026-11-13: open oval windows and an open door on the upper monastery

- The upper Shan monastery (`ၵျွင်းၵွင်းမူးၶမ်း`, `14-shan-monasteries.js`) had solid walls with white torus rings over dark panes.
  Its front and side walls are now extruded plank shapes with real openings. Each oval window has a slightly pointed top, after
  the owner's Shwe Yan Pyay photo, set in a carved dark-teak frame with a lighter bead and a sill. The doorway is open, with
  both teak leaves swung inward.
- Behind the openings is a glimpse of the shrine room, not the real hall: plank walls, floor and ceiling (lamplit at night), two
  rows of red pillars banded in gold, a red hanging, and a simple gilded seated image on a gilded throne with a blue halo.
  Clicking the doorway (an unseen sheet) or either door leaf still enters the `kyaung` hall.
- Unchanged: the lower monastery's square windows and the oval windows inside the shrine hall interior
  (`04-kyaung-shrine-hall.js`), which still have white frames.

### 2026-11-13: a second monastery below the festival ground

- New piece `14b-lower-kyaung.js`, `lowerKyaung(H)` (called from `shanMonasteries` after `festivalGround`), after the owner's
  photograph of a northern Shan kyaung. Placed by `LOW_KYAUNG` in `13-stupa-hill.js` on the lower terrace, below the festival
  ground: 4.9 m from its retaining wall, 4.3 m from the hill stair's wall, stair foot short of the terrace footpath. The photo's
  layout is mirrored so the wing and stair face the hill stair. `hip()` (a hipped roof) now lives in `shanCarpentry()`; the Haw
  Kham still has its own copy.
- Interior: place `kyaungLow` is its own hall, `lowerKyaungHall` in `04b-lower-kyaung-hall.js`. At the owner's request it has no
  Buddha image, so it is not a statue hall and gets no `shrine()` altar: a hall for sermons and gatherings with square windows, red
  pillars, mats and the monks' raised dais (three seats with fans, a gilded sermon seat). All the monastery's windows, outside and
  in, are square. `nav: false`, so it is reached only on foot; `indoorBlocked` has its own case (`LOW_HALL`); `EXIT_SPOT.kyaungLow`
  finds the monastery by `key`.
- Its Shan name, from the owner: ၵျွင်းလူင်ဝဵင်းၵဝ် (`SHAN_NAMES.kyaungLow`, `shn` in `CONFIG.places.kyaungLow`), on a board on
  the middle clerestory's front. We read it as "the great monastery of the old town" (ၵျွင်း monastery, လူင် great, ဝဵင်း town,
  ၵဝ် old); that gloss is ours and is not shown in the site. Have a Shan speaker check the spelling.
- Checked headless: renders from the street, the hill stair and the porch; walk heights on the stair (3.75 → 6.35 m) and porch;
  entering the hall and the hall itself. Not yet seen by eye in a browser.

### 2026-11-12: the bank beside the library

- New piece `15d-town-bank.js`, `townBank(g)` (called in `36-lion-dragon-dance.js` right after `townLibrary`), after the owner's
  photograph of an old white palace-style building with domed corner towers. `BANK` = (60, 235), ry −π/2 like the library: front
  faces west across the market lane to the palace; forecourt local x ±20 (world z 215…255, the library's lawn ends at 213, the
  Hluttaw road starts at 255.5), its kerb at world x 43.6. Two storeys (plinth .4, storeys 4.2) with arched windows, eight-sided
  corner towers of three stepped storeys under lathe-turned onion domes, a centre block brought forward 2.6 m with three dark
  arches, a slate gable with a brown pediment and spire, flat porches on posts over the wing doors (black boards over them as in
  the photo), red-earth forecourt, oval flower beds ringed with white stones, flag (`flagPole`), name board `bankBoard` in Burmese
  ဘဏ်, Chinese 银行 and English (`BANK_NAMES`). Exterior only. Checked headlessly from the lane and from the Hluttaw road corner.
- Ask the owner for the bank's Shan (and Tai Nüa) name for its board, as given for the library.

### 2026-11-12: the public library across the lane from the Haw Kham

- New piece `15c-town-library.js`, `townLibrary(g)` (called in `36-lion-dragon-dance.js` right after `hawKham`), after the owner's
  photograph of an old saopha-era mansion. `LIB` = (60, 197), ry −π/2: front (local +z) faces west to the palace across the
  market lane (lawn ends at x 43.8, the lane at 43.25); its left end (local −x, the verandah wing) toward the bamboo grove (lawn
  starts at z 178.5, the grove's leaf floor ends at 178). Two storeys (plinth .4, storeys 3.6), half-octagon bay, round bay, porch
  with a curved balcony, right wing on posts, left one-storey verandah with a terrace, red tile hips (`tinHipRoof` with a tile
  texture), chimney, lawn, shrubs, flag (`flagPole`), name board `civicSign` in Burmese "ပြည်သူ့စာကြည့်တိုက်" / "Public Library".
  Verandah floors are walkable at .4. Exterior only: no interior mode yet. Checked headlessly from the lane and the palace side.
- Name board (`libraryBoard`, wording in `LIB_NAMES`, given by the owner): Shan ႁူင်းတူၺ်းလိၵ်ႈၵူၼ်းမိူင်း, Tai Nüa (Tai Le script)
  ᥞᥨᥒᥰ ᥖᥧᥭᥰ ᥘᥤᥐ ᥐᥨᥢᥰ ᥛᥫᥒᥰ, Burmese ပြည်သူ့စာကြည့်တိုက်, Chinese 公共图书馆 (simplified), English. `lotus-altar.html` now also loads
  Noto Serif SC (simplified glyphs) and Noto Sans Tai Le from Google Fonts; Google serves only the slices used.

### 2026-11-12: a watchman at the clock tower's gong; the palace guards in grey with rifles

- Clock tower (`15b-hluttaw-and-clock-tower.js`): the bell and the loose beater are gone; a watchman (indigo jacket, pale
  headcloth, own tip and toast) stands on the platform at T (GX − .35, GZ + .75) facing the gong, striking its boss with the beater.
  The platform's walk surface leaves a .35 m circle round him. Static pose, no animation or sound yet.
- Palace guards (`palaceGuards` in `15-haw-kham.js`): grey jacket, trousers, headcloth and forearms instead of black; the spear is
  now a rifle at the order (butt by the right foot, dark barrel past the shoulder, sling). Tip text updated.
- The four guards at the end stairs' feet stood .5 m off the plinth's ends, so the straw hat on their backs (radius .62) went into
  the wall; they now stand at x = ±(FX + 1.4). Checked all three headlessly.

### 2026-11-11: the clock tower's ladder works both ways

- The owner couldn't get down: from the platform the ladder ramp can only be entered at its top end, beside the rail. Now the
  ladder's meshes carry `userData.ladder` (tip "The ladder · climb up or down"); `temple.activate` returns `{ walk: [at, look, y] }`
  and `useObject` (`11-loop-and-picking.js`) sets `temple.walkerY = y` and `enterWalk(at, look)`, putting you at the other end:
  on the platform by the gong, or on the base's top by the ladder's foot. Walking up the ramp still works. Checked headlessly.

### 2026-11-11: up the clock tower's ladder

- The ladder (now at T x .6) is a walkable ramp from the base's top (y 6.9) through a hatch cut in the platform to the platform
  (y 10.425). The base's top and the platform lie over the same ground, so the tower's surface reads `WALKER_Y` (new, in
  `13-stupa-hill.js`; set each step by the walk as `temple.walkerY = p.y − EYE` in `10-walking.js`, setter in `38-api.js`) and
  gives the platform's floor above the midpoint, the base's top below. The columns block only at the base's level. Gong frame and
  bell moved to the platform's far side (z +1 in T). The toast no longer mentions Mandalay. Checked with `walkAt` probes and renders.

### 2026-11-11: the Hluttaw's Shan name

- The Hluttaw's tip and toast now carry the owner's Shan name ႁူင်းႁေႃၸုမ်းၽွင်းမိူင်း (`SHAN_NAMES.council`) instead of the Burmese
  လွှတ်တော်. Added to the open threads for a native speaker to check.

### 2026-11-11: a road between the palace and the Hluttaw; the clock tower's gong and stair

- Owner's asks. `LANES` (`10-town.js`) gains two lanes in world coordinates tied to `hawKham(g, 16, 204, π)`: the market lane on
  along the palace's east wall (x 38.75…43.25, z 160.5…255.5) and the Hluttaw road (x −10…43.25, z 255.5…261.5); `backStreets`
  draws them with drains, poles and lamps. If the palace moves, move these too. `CZB` back to 50 (front wall z 254).
- `councilCompound(F, list, hip, ZX)` now walls its own compound (half width 20, 24 deep from `ZX`, front wall world z 262.5) with
  the gate toward the palace; two guards outside it face the palace gate. `ZX` = `CZB + 2·ZM + 8.5` in `BACK`'s frame (careful:
  BACK z = −24 − G z).
- Clock tower: the drum is now a bronze gong with a gilt boss on a red frame, with its beater. A 23-step stair (rise .3) climbs the
  east face (T +x) to a landing through a gap in the merlons; the base's top (y 6.9) is walkable, columns and ladder block. Checked
  in headless renders and with `walkAt` probes.

### 2026-11-11: the Hluttaw moved before the Haw Kham's main entrance

- The owner wants the Hluttaw face to face with the palace's main entrance, and the back yard (toward the town) kept for a royal
  kitchen, royal bathhouse and a lake, not yet planned. `councilCompound` is now called in `BACK` (the front's frame): inner wall at
  `ZX` = CF + 4 out from the main stair's foot, the Hluttaw 13 m beyond (world (16, 254)), clock tower at BACK (13, ZX + 4.6), the
  east side (world (29, 246)). `CZB` 63, so the front gate is at world z 267. The back yard is 34 m of empty gravel from the end
  stairs to the town gate. Checked in headless renders.

### 2026-11-11: the Haw Kham turned round, and the Hluttaw and clock tower behind it

- The owner had the palace facing the wrong way. In `15-haw-kham.js` the front face (main stair, porch, throne room, justice and
  monks halls) is now built in `BACK` (local −z, away from the town) and the back face (end-stair pavilions, literature, dining,
  opera) in `G` (local +z, toward the town); the shape is unchanged in the world. `hawKham(g, 16, 204, π)`: moved 22 m from the lane,
  `CZ` 38 (the town gate stays at world z 166), `CZB` 50 (front gate at z 254, a 17 m forecourt). `face()` lays its paved way at the
  end landings when it has no main stair. Guards follow their faces, plus two inside the council's gate.
- New `15b-hluttaw-and-clock-tower.js`, `councilCompound(G, …)` after the owner's two old photographs: an inner wall at local
  z = `ZX` (12) with a gabled gate; the Hluttaw (Burmese လွှတ်တော်, in its tip) at local z 25, facing the palace, a one-floor teak
  hall on posts with a slatted balustrade, two front stairs (walkable verandah), a closed council room, skirt roof, crossed gables
  and a five-tiered pyatthat; the clock tower at local (−13, 16.6), the palace's east side, with a crenellated base, four round
  columns, platform, ladder, drum and bell (not walkable up). Both in `TALL`. Checked in headless renders from the lane, inside the
  council's compound, the forecourt and beside the tower.

### 2026-11-11: a back gate for the Haw Kham

- `15-haw-kham.js`: the compound's back wall (local z = -CZB) is open in the middle under a second gate built by the same loop as
  the front one (pillars, red beam, three-tiered pyatthat, lanterns on the outer faces). A paved walk runs out of it, and inside a
  paved way runs to the plinth and turns along it (at z = BZ) to the feet of the two back end stairs. Four more guards (two
  outside, two inside), so 4 + 4 at the gates. Checked in headless renders from outside and inside the back gate.

### 2026-11-11: a bigger sky, and room to grow the town

- The owner found sky where the palace's back courtyard should be: the sky sphere (220) and the day dome (.94 of it, drawn over
  what lies beyond) ended inside the yard (world z up to 220). Now `SKY_R` = 420 (`33-pagoda-exterior.js`; stars, day dome and
  ground scaled with it), the outside camera's far plane is 1000, and walkers may go 340 m toward the town / stupa hill / palace
  (`WORLD_R_TOWN`, +z) and 225 m toward the fields and hills (`WORLD_R`, −z), blended round the sides (`worldR`). The owner
  wants to expand the town all round toward the stupa hill; there is now room on the +z side.


### 2026-11-11: two roofed stairs at the Haw Kham's back

- After the owner's photograph of a palace stair: the back face has no main stair or porch. Only its two end stairs, each climbing
  along the plinth to a landing under a roofed pavilion (four red posts, a hipped skirt roof, a carved gable). `face(F, halls, sx, main)`:
  `main` false drops the main stair, its landing and its guards and closes the parapet across the middle. `hip` now takes a frame.

### 2026-11-11: the Haw Kham's back, and three more halls

- At the owner's request the palace is longer front to back and its back is built like its front. `hawKham` now builds the plinth
  and hall symmetric about z = `ZM` (−12; hall z −23…−1, plinth −26…2) and each face with `face(F, halls, sx)`; the back's frame
  is turned round about `ZM`. The compound wall now runs back to local z −38 (world z ≈ 220, inside `WORLD_R`); no gate at the back.
  The middle hipped roof's ridge now runs front to back; the end gables and the throne gable stretch the whole depth.
- Back doors (as seen facing them): centre `hawLibrary` (literature hall: lacquered book chests, palm-leaf bundles on a rack,
  a reading stand with a black parabaik), left `hawDining` (low round lacquer tables set for a Shan meal, the saopha's gilt table
  on the dais, water pots and food carriers), right `hawOpera` (a little stage, gilt proscenium, painted backdrop, footlamps,
  long drum and gongs, the saopha's seat). Guards on the back face too (twenty in all). `EXIT_SPOT` gets the palace keys in a loop.
- "Left" and "right" at the back are as seen by someone standing at the back facing the doors; check with the owner.


### 2026-11-11: three stairs to the Haw Kham

- After another of the owner's photographs and notes: the main stair runs straight up the middle from the gate (foot at `CF`) to
  the landing (3.2 m wide, `LX` 1.6) before the throne room's doors, under a porch the owner asked for to show the saopha's power:
  red-lacquered posts banded in gilt, three carved gables stepping down with the stair (one over each third), and a five-tier
  pyatthat over the top one (first seven tiers; the owner asked for it shorter, with three roofs). A lesser stair at each end of the front verandah climbs along the plinth's face toward the
  middle (foot at x ±`FX`, landing at ±`TX`…±(`TX`−`SW`)). Paved paths reach all three feet. Guards: two at the main stair's foot,
  one beside each end stair's foot (twelve in all).


### 2026-11-11: the Haw Kham in a file of its own

- The owner plans a ground floor and underground rooms (a traditional prison) for the Haw Kham, so it no longer lives inside the
  monastery's builder. `hawKham(g, x, z, ry)` and `palaceGuards` in `15-haw-kham.js` are top-level and parse alone; the world
  calls `hawKham(g, 16, 182, Math.PI)` right after `shanMonasteries(g)` (in the outdoor build list in `36-lion-dragon-dance.js`).
  What both shared (teak, whitewash, lamplit glass, rusty iron roof, `gable`, `pyatthat`) moved to `shanCarpentry()` in
  `13b-shan-carpentry.js`, made once and handed to both. Nothing in the world changed.


### 2026-11-11: the Haw Kham's two lesser halls and its guards

- At the owner's request, three halls in the palace: the throne room in the centre (`haw`), the hall of justice on the left
  (`hawJustice`, east) and the hall where the saopha receives the monks on the right (`hawMonks`, west). One builder,
  `hawHall(g, n, kind)` in `05b-haw-kham-throne-room.js`; the side halls have doors in the palace's front wall at local x ±8.75
  and `nav: false` in `CONFIG.places` (no button). Justice: a conch throne (conches in the base, a white conch on the panel), a
  low table of palm-leaf law books (dhammathat). Monks: three monks' seats on a high three-step dais, palm-leaf fans, the
  saopha's low lotus seat below them facing them, robes on trays and lacquer offering vessels. No Shan names added for these.
- Guards (`palaceGuards` in `15-haw-kham.js`), at the owner's request "Shan singer style" in black with yellowish skin: the
  singer's figure all in black (jacket studded with silver, trousers, headcloth), straw hat on the back, sword on a green cord,
  a spear in the right hand. Static; every piece but the jacket is a `part()`, baked once for all nine.


### 2026-11-11: the Haw Kham after the old photographs, and its throne room

- After the owner's four old photographs (two of a long Shan haw on its plinth, one of a prince's throne, one in colour),
  `hawKham` (`15-haw-kham.js`) is rebuilt: the stilted hall and its two lesser halls are gone; now a long teak hall on a 2.4 m
  whitewashed plinth with a pierced parapet, a stair along the plinth's face up to a landing before the doors (as in the photos,
  it rises toward the viewer's right), a 3 m verandah of white posts all round under a hipped skirt roof, and the upper roofs:
  three parallel gables (east), the seven-tier pyatthat over the throne room, a long hipped roof with two ridge vents, a
  five-tier spire (west). Walkers climb the stair and walk the verandah round the hall.
- New place `haw` (`hawHall` in `05b-haw-kham-throne-room.js`, `CONFIG.places.haw`, button "Haw"): the throne room, entered by
  the palace doors; you come back out on the verandah (`PALACE.exit`). No offering altar (no image). Shan terms in its toasts, from
  the site's owner: ပလၢင်ႇသီႇႁႃႇသၼ (lion throne), ၸွင်ႈၽိူၵ် (white umbrella). No figures on the throne or kneeling attendants (the photo has them).
- Not yet checked by eye in a real browser beyond headless renders.


### 2026-11-10: address shortcuts only on localhost

- The testing shortcuts in the address (`?dancers=`, `?weather=`, `?halloween=`, `?townsfolk=`, `?lionDragon=`) now work only
  when the page is served from `localhost` / `127.0.0.1` (`devParam` in `07-festivals-and-weather.js`). On the public site they
  are ignored, so visitors see the real Bangkok-time schedule. Owner's request: first step of tightening the site.
- Still offered, not done: SRI `integrity` hashes on the CDN scripts and security headers (CSP, X-Frame-Options,
  X-Content-Type-Options) in `vercel.json`.

### 2026-11-10: the kinnara and kinnari's dress trimmings

- After the owner's photo of a Shan kinnara (red boxes on the parts to copy), both dancers (`dancer()` in
  `17-kinnara-dance.js`) gained: a red band round the top of each arm; a gold-and-orange embroidered panel down the chest
  under a yellow sash worn shoulder to hip; a red waistband with a yellow embroidered apron edged in red, a round lace-edged
  medallion at either side; red bands below the knees and red gilt-edged ankle cuffs; white stockinged feet. On the kinnari
  the knee and ankle bands go round her longyi, with her white toes peeping out under the hem.
- The apron hangs plumb from the waist and swings forward over whichever thigh he lifts (`dressSwing`, run after
  `fanWings` each frame), so his knee-lifts and lunges don't push through it. The new reds use `scarlet` (linearised);
  the old `red` (lips, unconverted) renders pinkish.

### 2026-11-10: straw hats on the band's backs

- The gong player and the cymbal player wear a big Shan straw hat hung on the back by a cord round the neck (`strawHat` in
  `musician()`, `18-stage-ensemble.js`). The long drummers had them too at first, but the owner didn't like the hat with
  the drum, so `longDrummer` passes `hat = false`. At the owner's request the hat is big (`HAT_R` = .4, 80 cm across, about
  half the man's height) and soft: its brim waves, curls in and flops a little, with no hard cane rim.
- **For a native Shan speaker to check:** ၵုပ်း (kup) for the straw hat, in the code comment only.

### 2026-11-10: a singer between the dances

- In the gaps of the stage programme (3:31–3:59, 5:46–5:58, 7:31–7:44, 9:46–9:59 PM ICT, `CONFIG.dancers.singer`) a Shan
  singer stands alone on the festival stage (`stageSinger`, `18c-stage-singer.js`), dressed after the owner's photo. He plays
  **no sound**, at the owner's request, to avoid licensing trouble; the band steps off. Force with `?dancers=singer`.
- Fixed in passing: the band's show/hide line in `18-stage-ensemble.js` had been swallowed into a comment; now only the
  singer's gaps hide the players (the band otherwise stays on stage as before).
- **For a native Shan speaker to check:** the tip's ၵႂၢမ်းတႆး ("Shan song"); Burmese ရှမ်းအဆိုတော် ("Shan singer").

### 2026-11-10: the hills named

- The two ranges of forested hills behind the fields (`mountainsAndForest` in `29-forest-and-hills.js`) are named
  လွႆသၢမ်သိပ်း (Loi Sam Sip). Every peak is clickable in the outdoor picks: hover shows the name, a click gives a toast
  explaining it. **For a native Shan speaker to check:** လွႆသၢမ်သိပ်း and the gloss "thirty hills".

### 2026-11-10: site map and architecture docs

- Added `SITEMAP.md` and `ARCHITECTURE.md` at the repo root as groundwork for performance work. Nothing is measured yet:
  next steps are the `?perf=1` overlay (ARCHITECTURE §8.1), a baseline on the SITEMAP routes, then tuning (§9).
  Field tracking (§8.2) needs the owner to choose: Vercel Speed Insights, a custom beacon, or none.

### 2026-11-09 (night)
- Added the to dance (`toDancers` in `src/temple-floors/18b-to-dance.js`), as the site owner asked, after their photo and
  YouTube _U-imZ1KuM8: two dancers in one white costume (gold/green/red trim, swirls on the flanks, ruffs at knees and ankles,
  gilt paws, long maned neck, wagging tail). After the site owner's note the head is a deer's: long tapering muzzle, black nose,
  big eyes, large ears out to the sides and branched deer antlers (`tine()`), in place of the first crest tuft and face ruff. The body is stretched
  each frame between the back dancer's rump and the front dancer's chest, so rearing (back crouched, front on tiptoe, neck up)
  looks like the photo. One figure per drum bar, from the bar count the kinnara step now returns while the to is on.
- Then a second, yellow to (`toDancers(..., yellow)`: yellow coat, white scallops in the trim, tip "The yellow to"), and the stage
  programme the site owner asked for (`CONFIG.dancers`, lists of windows, ICT): kinnara solo 14–15.5, pair 16–17.75, to 18–19.5,
  `twoTo` 19.75–20.5 (both to round an oval), pair 20.75–21.75, `toKinnara` 22–23 (the kinnara alone, kept to the middle, with a to
  at each side facing the crowd). "Two to and Kinnara" was read as the kinnara alone, not the pair; confirm with the site owner.
  With a partner close by, the to's turn figure is a swing, not a full turn. `?dancers=to|twoTo|toKinnara` force them.
- Then widened the festival pavilion stage, as the site owner asked, so the two to can move freely: 14 × 6.5 m (was 9 × 5.5;
  `PW`, `PD`, `PZ` in `festivalGround`, back edge unchanged). The band moved out to the new sides (drums at x −5.6, gongs at
  +5.0, cymbals at +5.45), the flag pole to `FZ` 3.0 (1.35 m of grass from the bottom step), the audience rows 0.8 m further
  out (`AUDIENCE`). The to's paths widened to match (one to ±2.2 m, the two to round a 2.4 × 1.1 m oval, at ±3.4 m in the
  finale) and the kinnara solo roams 1.3× wider. Checked in headless renders of `twoTo` and `toKinnara`. The audience toasts now say "the dancing" rather than naming the kinnara.
- `build-dist.sh` now exports `LC_ALL=C` before the glob (see `MEMORY.md`); the existing pieces' order is unchanged.
- Checked in headless renders of every figure; pair and solo still load without errors. Not yet committed: the site owner
  wants to see it locally first.
- Have a Shan speaker check တၢင်းၵႃႈတူဝ်း (the dance's name, given by the site owner) and our romanisation "ka to"; the toast's
  Tavatimsa welcome story is the common telling, worth confirming.

### 2026-11-09
- Front street lights, as the site owner asked (from a screenshot of the town road's light): the red lantern posts on the
  front street are gone; it now has the town road's modern street light (`streetLight` in `10-town.js`, shared by both roads)
  at the kerb with the arm out over the road, alternate sides every 10 m from x = -120 to 140 (they used to stop at ±60).
  Street trees stay in the other slots near the gate. Skipped: the gate, junction and lane mouths (`gaps`, `LANES`), the
  hill-stair corner (x ≈ -45 south) and the fire/police aprons (x 103–142 north). Checked in a headless night render.
- Rain at the festival ground, as the site owner asked: while the townsfolk's umbrellas are up (`wx.rain > CONFIG.townsfolk.umbrella`),
  the seated children in the dancers' audience go home and the standing young people hold umbrellas (`festivalAudience`: a second
  body geometry with the right arm raised, umbrellas as one `InstancedMesh`; colours from their own `rng(4243)` so the crowd's
  layout is unchanged). The audience toast says so. Dancers and band stay on, under the pavilion roof. Checked in a headless render.

### 2026-11-08
- Joined each kinnara side wing to the middle fan, as the site owner asked: a linking wing on each side, three broad wedges
  (`LINK`, 1.45 × 0.8 m) rooted with the side wing and spread evenly by `fanWings()` from its top wedge to the middle fan's edge
  (`EDGE`). Folding a side wing stretches them across the gap; opening it bunches them up, so the cloth never parts. Both dancers.
  Checked in headless renders.
- Undid the Shan-dress change above, as the site owner asked: the masks and the green-and-gold costumes (crowns, gilt collars,
  belts, cuffs, anklets, green trousers, striped longyi) are essential, and the photos were a reference for the wings only
  (they show the southern style; ours follows the old northern tradition). Kept the photo wings, green sequinned cloth with white
  flowers, white trim and red pom-poms, now on both dancers (`WING`; the kinnari's gold wings are gone). The toast says "a masked
  pair" again. Checked in a headless render of the pair.
- Dressed both kinnara dancers as in the site owner's photos of Shan ka nok dancers, and took off their masks (they now show
  their own faces): he wears a pale Shan jacket with the dark cord across the chest, wide mustard Shan trousers, a green belt
  with a pink tasselled sash and a pink headcloth with its end by his ear, barefoot; she wears a white blouse, a silver-striped
  longyi, a green belt and a patterned headband over her hair in a bun (`DRESS` in `17-kinnara-dance.js`). The crowns, gilt
  collars, belts, cuffs and anklets are gone. Wings per dancer (`WINGS`): his green sequinned cloth with white flowers and red
  pom-poms, hers gold with lime-green pom-poms, both with a white trim and white ribs (ribs and pom-poms are one vertex-coloured
  mesh per wedge). The toast now says "a pair in Shan dress". Checked in headless renders of the solo and the pair.
- Added a middle fan to both kinnara dancers' wings, as the site owner asked: five wedges (`MID`, ±0.56 rad round straight up)
  on the upper back, a little behind the side wings, that stay still like an aura behind the head while the two side wings open
  and close with the arms. The side wings now open only up to the middle fan's edge (π − 0.6 rad). Checked in headless renders.
- The kinnara wings now open like a peacock's tail, after the site owner's photo of a Shan ka nok dancer: eight long, broad wedges
  a side (1.35–1.56 m long, 0.6 m wide) strapped to the shoulder blades instead of riding on the arms. `fanWings()` keeps the lowest
  wedge along the arm (never below 0.7 rad from straight down, so it can't drag on the floor) and spreads the rest up to straight
  overhead as far as the arm is raised, so the two wings stand behind the dancer as one great fan and close beside him when the
  arms come down; reaching forward cups the fan. The solo's path narrowed to ±1.3 m for the wider wings. Both dancers.
- The gong player and the cymbal player now wear the same tan Shan jacket and baggy trousers as the long drummers (tan is now
  `musician()`'s default suit; the white jackets and indigo trousers are gone). Headcloths unchanged. Checked in headless renders.
- More wedges in both dancers' wings, swept back, fewer pom-poms, as the site owner asked: ten wedges a side (was seven), each
  tipped back about its own width by its sweep (`FAN[k][2]`, 0.15 rad for the one along the arm up to 1.4 rad for the one nearest
  the body), so the open wings curve round behind the dancer like a fan; pom-poms only at each wedge's two corners and tip
  (slightly bigger). Checked in headless renders from the front, side and back.
- Rebuilt both kinnara dancers' wings after the site owner's two photos of a real Shan ka nok at night: each wing is now a fan of
  seven long cloth wedges, every wedge folded along its gilt rib like an umbrella panel (a ridge in front, the sides sloping back,
  `FOLD`), edged and tipped with gold pom-poms (rib and pom-poms joined into one mesh per wedge, `trimGeo`). Same green, gold and
  sequin cloth. The kinnari now wears the same arm-carried wings as the kinnara (her shoulder fans are gone), opening and folding
  with her arms in the pair's dance. Both tails are gone, as the owner said neither dancer has one. `KINNARA.wing` dropped.
  Checked in headless renders of the solo and the pair.
- Re-danced the kinnara's afternoon solo after a video the site owner gave (M Time · Yunnan Vision, "The Divine Bird Dance
  Kinnara", YouTube gNkFn3owbgQ: the Dehong Dai/Shan kinnara of Yunnan), keeping his green and gold colours. Wings: no longer
  fixed fans on his back but five long pointed feathers a side on gilt ribs, the first along his arm and past his hand, which
  carries the wing (`FAN`, `feather()`, `fanWings()` in `17-kinnara-dance.js`); with the arm down they hang folded at his side,
  raised they fan open from the shoulder. Three smaller feathers now stand up behind his head instead of the low tail fan.
  Movement: each drum bar is a figure from the video, round a 16-bar phrase (`FIG = "ssbkssbLspkkcrbL"`): step on bent,
  turned-out knees with a full wing sweep; bank (one wing high, one low, tipping); knee drawn up high with wings up and
  trembling; a whirl on the spot, wings level; a squat with wings swept forward and the rise; the leap (now every eighth bar,
  higher every other phrase). The drumming is unchanged. The evening pair's kinnara wears the new wings too (they open with his
  arms); the kinnari keeps her shoulder fans. Checked in headless renders of each figure and of the pair.

- Per the site owner (the gongs should be louder than the cymbals): stage levels in `ambStep` are now gong .11 → .17 and
  cymbals .11 → .08 (the drum stays .155). In a render the gong stem peaks about 0.67 and the cymbal stem about 0.13; the mix
  peaks about 0.88.

- Per the site owner (now "90% accurate"; the original goes "Tone Tone Cha Cha Tone Bon"): the drums no longer pick random
  sixteenth figures (`FIGS` is gone). The pattern measured on a 12-step grid from the clip, starting at the gong beat: **Bon**,
  gong, deep drum and cymbals together; **Tone**, a drum a third of a beat later; **Tone**, a drum just before the next beat;
  **Cha Cha**, cymbals on that beat and its half, with a drum under the second; **Tone**, a light drum at 0.8, just before
  the gong. Also a weak cymbal on the gong beat's half and a tap at 0.92. The light gong on the half beat went .55 → .3. Light
  drum strokes are left out 15% of the time (seeded `hash`). All of it is in `PAIR` in `18-stage-ensemble.js`; the rendered grid
  matches the clip's.

- Per the site owner (the stage ensemble "very far away" from the oh-zi recording, YouTube dCmtysbXxoM): the recording has no
  license, so it is **not** shipped or sampled. A citation is not permission. It was only measured locally, and the voices
  stay synthesized. Re-voiced from those measurements:
  - **Gongs** hum without a break in the clip: their notes drop under 1 dB between strokes. `stageGong` is now a standing bank
    of oscillators per gong (`GONG_MODES`: note, a near pair, the 2nd and 3rd partials; fading over about 6 s for C4, less for
    the smaller gongs) that each stroke swells, adding energy to what is still ringing. There are no pitch glides; the old
    ones smeared sidebands round 262 Hz. Weights in `GONGS` were refit (196 Hz .17, 394 Hz .45, 782 Hz .06).
  - **Cymbals** were a few pure tones 20–28 dB above the noise, which made them whistle. In the clip a crash is broadband noise
    up to 14 kHz with rings only 7–10 dB above it. Now `CYM_WASH` (8 noise bands with their own decays, the top dying first),
    faint `CYM_RINGS` in beating pairs, and a short highpass "clash".
  - **Long drum** "dum" was a sung note at the gong's 262 Hz. In the clip a stroke adds a woody knock (modes near 530, 290,
    442 and 384 Hz) and a body near 88, 132 and 149 Hz, not 262. Now `DRUM_MODES` plus a thud band-passed at 130 Hz.
  - Levels (`ambStep`): gong .11, cymbals .11, drum .155. The mix's spectrum is now within about ±5 dB of the clip in most
    third-octave bands (it was off by up to 20 dB). Crest factor 13.8 dB against the clip's 11.2 dB, peak about the same as before.
  - `bandTone` and `bandHiss` set their gain to 0 before the stroke: a gain sitting at its default of 1 let one stray sample
    through at each start, which was a click at every crash. `bandHiss` noise now loops, so decays longer than 2 s don't cut off.

### 2026-11-07

- Cut the two big scripts into topic files so a change only needs one small file read: `src/lotus-altar/` (15 pieces)
  and `src/temple-floors/` (39 pieces, one per place). The pieces are consecutive slices of the same closure; `build-dist.sh`
  joins them with `cat` in name order and runs `node --check`. The joined files were checked byte-identical to the old
  `lotus-altar.js` and `temple-floors.js`, so nothing changed on the site.

- Per the site owner, the stage ensemble's reference is now **သဵင်ၵွင်တႆး ရှမ်းအိုးစည်သံ (YouTube dCmtysbXxoM)**, replacing aof4zp8KYXs.
  Measured: about 113 beats a minute (`BAR` 1.59 s), in pairs of beats. Gongs: a chord near C3 G3 C4 G4 G5 (131, 196, 262, 394,
  782 Hz, C4 loudest), full on every second beat and light on the half beat before it (was every beat, A–D chord). Cymbals: every
  beat and just after each half beat (0.55 of the beat), the first beat of the pair stronger, no tap before; tone 1.06 and 1.5 kHz
  strongest, 1.66–1.72, 3.5–4.0 kHz, a trace at 7 kHz, 12 dB down in about 0.11 s. Long drum: rings near 264 Hz (tuned to the C4
  gong) with a fifth at 396 Hz, faint modes 133, 202, 299, 530 Hz, almost nothing below 130 Hz (the earlier 82 Hz low note is
  gone). Drum figures per beat: X.X. 59, XXX. 50, XXXX 34, X.XX 31, X... 19, X..X 13, XX.. 11, XX.X 11 (beats without a stroke
  on the beat left out). `PAIR`, `FIGS`, `GONGS`. Rendered mix within about 2 dB of the clip in every band.
- Per the site owner (cymbals too harsh): `stageCymbals` now uses pure sine partials weighted as in the oh-zi recording (1.0–1.5
  kHz strongest, then 1.9, 2.4, 3.2, 3.8 kHz, a trace at 4.85 kHz) through a lowpass at 8.5 kHz, and a hiss band-passed near 3.8
  kHz instead of a 3 kHz highpass. The old triangle waves and high hiss made 4.5–6.5 kHz and 9–11 kHz about 5 dB louder than
  the clip. Now 1–4.5 kHz matches the clip and above 4.5 kHz sits 4–6 dB under it, on purpose.
- Per the site owner (scores: gongs 90%, cymbals 80%, long drum 50%, rhythm 60%; "it cannot pause, use a loop"): the pause
  was the 1 s gap and the short end of my listening file; the stage itself plays without a break during a show. The drum:
  measured from its strokes on the quarter and three-quarter beat, where it plays alone, it is a low note near 82 Hz under a
  strong body tone near 265 Hz sagging to 250 (most of its sound), faint modes near 200 and 325 Hz, 10 dB down in 0.1 s; the
  overtone row of 86.7 Hz from the last entry was wrong (no 173 Hz at all). The rhythm: the drummer varies every beat; counted
  per beat in sixteenths: X... 52, X.X. 38, X.XX 14, X..X 12, XXX. 11, XX.. 9, XXXX 5 (plus beats with no stroke on the beat,
  left out so the drum never drops out). `FIGS` holds them; each beat picks one by a fixed hash; first drum on the beat and the
  first sixteenth after, second drum on the half beat and the last sixteenth. Listening files are now gapless (loop with
  `ffplay -loop 0`).
- Per the site owner (still clicks, "not smooth"): the clicks in the listening file were my test render clipping (fixed gain
  and clamp); the mix itself peaks below 1. In the site the stage's strokes were heard on whichever frame noticed them (up to a
  frame late, so the rhythm wobbled with the frame rate); each stroke in `BAND` now carries the moment it fell
  (`performance.now()`), and `ambStep` schedules it exactly 0.1 s after that on the audio clock. The owner chose to keep
  the synthesized sound (no recorded samples) and tune it by ear; reference recording: YouTube aof4zp8KYXs.
- Per the site owner (the oh-zi mix "about 70% there"): the long drum was hard to hear and something clicked. In the clip the
  drum carries through a row of whole-number overtones of 86.7 Hz (173, 260, 347, 434, 520 Hz… rise on every stroke), not its
  86 Hz fundamental, which small speakers can't play anyway. `longDrum` "dum" is now 86 Hz plus overtones 2–6 and 9 (the
  fundamental turned down), drum level .17 → .24; both stage drums are tuned alike (the off-beat strokes share the series). The
  click was the fist-thud noise burst (2.6 kHz band-pass, 2 ms attack): removed, and the low thud eased in over 6 ms
  (`bandHiss` takes an `attack`). Cymbals .5 → .65. Band balance of the rendered mix now within a few dB of the clip.
- Per the site owner, the stage ensemble now plays the song of a clearer recording, **ရှမ်းအိုးစည် (YouTube aof4zp8KYXs)**; the
  earlier clip (2jsv8gcym9c) did not sound like traditional Shan music to the owner, so its two-beat song (tried the same day)
  is gone. Measured with numpy: beat 0.522 s (about 115/min) and the pattern **repeats every beat**. On the beat: the first
  drum's deep stroke (about 86 Hz, a second mode near 150 Hz, −12 dB in about 0.3 s), the gongs' chord and a lighter cymbal
  clash; between the beats: the cymbals ring out (−12 dB in about 0.18 s; peaks 1.0, 1.4–1.5, 1.9, 2.4, 4.7–5.0 kHz) after a
  quick tap an eighth of a beat before, with the second drum's softer stroke. Every fourth beat leans a little harder. The gongs
  play no tune: one chord every beat, near A3 D4 A4 D5 A5 (217, 290, 433, 579, 868 Hz), D4 loudest, the smallest quick to fade;
  they barely fade between beats (gong ring now about 4 s, capped for the oscillator count). `BEAT`, `frame(n)`, `GONGS`,
  `BAR` 1.566 s (three beats a dance figure). The synthesized mix was rendered offline and measured against the clip.
- Per the site owner (photo from the same clip): **two drummers, two long drums**, replacing the drummer-and-bearer pair. Each
  wears a tan jacket and baggy trousers (`musician(..., suit)`), his drum slung over the right shoulder with its head at his
  waist and its body down past his left leg to the tail on the ground (`DIR`); under the head a ruffled skirt in yellow, green
  and red (`FRILL`), the head blackened with rice paste and ringed in gold and black (`headT`). `longDrummer()` builds each;
  hands land by `fit()` (1 mm). `DRUM` strokes now carry which drummer plays them: both on the bar's first deep stroke, the first
  leading with the deep strokes between beats, the second answering with slaps, open strokes and a deep stroke of its own; the
  second drum sounds 7% higher (`longDrum(..., tune)`). Tip now "Shan long drums · ၵွင်ယၢဝ်း".
- Per the site owner (second photo and the clip at 0:22): the gongs are **struck all five at once**. The case now faces the
  crowd (front right, `F` turned π, `Fl` leaning back); a yellow padded beater hangs on a red arm before each gong, hinged above
  it, the arms joined by a red rod along the front; the player sits on a white stool (`musician(..., sit)` is now a stool, not
  cross-legged) beyond the big gong's end and pushes the rod's grip, so every beater swings in together (`setPush(k)`; balls touch
  the faces within 1 mm, 4.5 cm off at rest; his hand on the grip by `fit()`). Each "gong" stroke queues the whole chord
  (`CHORD`, from `GONGS` [radius, pitch, loudness]: 354 Hz loudest, as in the clip); `GONG` gives the chord's places in the bar
  (bar start and every half beat). The ambience plays `stageGong` once per pitch, one beater thump per chord.
- Per the site owner, from a photo of a Shan gong set and a YouTube clip (ရှမ်းရိုးရာ ဓားသိုင်းအက, 2jsv8gcym9c): the gongs now
  hang in a painted standing case like the photo's (yellow posts and rails, red dividers with yellow pompoms, blue back, red
  crest board with gilt scrolls round the Shan flag), the player sitting cross-legged before it (`musician(..., sit)`), front
  right. The long drum is played by **two men** (drummer at the head, a bearer carrying the tail on his shoulder), down the left
  side. The **cymbal player is back** (back right, `stageCymbals`, tip "Cymbals · ၸၢပ်ႈ" — **Shan check**). Hands, fists and the
  beater land by `fit()`, a small build-time pose search (all within about 6 mm). Sound and rhythm measured from the clip with
  numpy: beat 0.53 s (112/min), so a bar is now three beats of the same `BAR` (1.6 s) and the pair's timing uses `BAR` too
  (was 2.2 rad/s); cymbals ring on every beat (to −12 dB in about 0.33 s); the deep drum strokes and gongs fall between beats; the
  drum's deep stroke is short and near 90–106 Hz; the gongs sit at 270, 318, 354 Hz (354 the most played), so `GONGS` is now
  270–450 Hz. One `frame(n)` for both shows (`DRUM`, `FIG`, three `cym`). The synthesized mix measures close to the clip.
- Fixed a black screen while the kinnara pair is on stage (4–11 PM ICT): the pair's bar count starts at −1, `FIG[-1 % 2]` was
  undefined and `frame()` threw every frame. `frame(n)` now picks the figure with `n & 1`. Earlier tests drove `hit`/`step`
  directly, so they never ran the real loop from t = 0 in pair mode.
- Per the site owner: the stage ensemble is now the long drum and a **row of gongs**, no cymbals (the cymbal player, `stageCymbals`
  and the "chap"/"cheng" strokes are gone), and its labels use **Shan names only**, no Burmese. The gong player (front left) stands
  inside a curved teak frame hung with five graduated bossed gongs (`GONGS`: radius and pitch, 147–247 Hz, D E G A B), turns to
  each gong and strikes its boss; he turns to the next gong once the beater lands, and each gong swings on its cords after its
  stroke. The figure alternates bars (`FIG`): the big gong with the drum's deep stroke on the beat, three smaller gongs through the
  bar. `stageGong(v, f, t0)` now takes the pitch; smaller gongs die away sooner. Labels: gongs "Gongs · မွင်း", the dancers'
  tip now "Kinnara and kinnari dancers · ၵႃႈၼူၵ်ႉ" (Burmese dropped). **Shan check:** မွင်း for the gongs. The audience's tip is
  still Burmese (ပွဲကြည့်ပရိသတ်); swap in Shan if the owner wants that too.
- Added the rest of the Shan ensemble to the kinnara stage, as the site owner asked: a gong player (front left, a bronze bossed gong
  hung in a teak frame, struck on the boss with a red padded beater; the gong swings on its cords) and a cymbal player (back right,
  wide brass cymbals). All three musicians are built by `musician()` inside `kinnaraDancers` and are on stage whenever the dancers
  are. Every bar (`frame(n)`): the drum's deep stroke and the gong together (gong louder every other bar), cymbals "chap" (shut) on
  the quarter beats and "cheng" (open, ringing) on the half, plus the drum's slap and open stroke. The solo kinnara lands on the
  deep stroke and the gong; the evening pair now dip together on the deep strokes and open their wings over one bar and fold them
  over the next, gong to gong, hers a breath after his. Sounds: `stageGong` (164 Hz with a slowly beating partial pair, long hum)
  and `stageCymbals` (six square waves high-passed, plus noise) in `lotus-altar.js`, sharing the band's bus (`bandBus`) with the
  drum; the queue is now `BAND` / `temple.takeBand()`. The solo's path narrowed to ±1.5 m to keep the wings off the gong frame.
  **Names:** the gong and cymbals are labelled in Burmese (မောင်း, လင်းကွင်း); a Shan speaker should supply the Shan names.
  Also fixed a garbled comment on the `FOLK` line from the earlier drum change.
- The site owner found the solo still too aggressive and the drum not like a real ၵွင်ယၢဝ်း. The solo is now mostly gliding steps:
  `BAR` 1.6 s, each bar one figure (`hopH`): a soft knee dip, one foot lifting and set down ahead as he sways onto the other, the
  wings opening and folding once per bar (`sweep`); a light hop (0.13 m) every fourth bar and a leap (0.24 m) every eighth, no turn
  in the air (a slow full turn on a step every 16th bar). Wing beat, feather shimmer, tail shake and arm sweep all smaller and slower.
  The drum (`longDrum(kind, v, t0)`) now has three strokes: "dum" (fist in the centre: a boom sagging 112→76 Hz with paste-tuned
  harmonics, a quick membrane mode, a 55 Hz body hum and a thud), "ting" (open stroke near the rim, 196 Hz ringing with harmonics)
  and "tak" (muffled slap), each varied a little, on its own bus with a short generated reverb. Still synthesized: if the owner
  supplies recordings of real kawng yao strokes (with rights to use them), wire them in as samples instead.
- Slowed the kinnara's solo and added a Shan long-drum player, as the site owner asked. Each leap is now one bar of the drum,
  `BAR` = 1.25 s (was about 0.75 s): on the ground he sinks into the landing, settles, then gathers and pushes off; the time aloft
  still comes from gravity. The drummer (inside `kinnaraDancers`, on stage whenever the dancers are, at the back left corner) plays
  the ၵွင်ယၢဝ်း (kawng yao): a red-lacquered long drum with gilt bands, its head at his waist and its tail low behind, struck with
  the right fist ("dum") and slapped with the left palm ("tak"). In the solo the strokes follow the dancer: a deep stroke on the
  landing, a light one as he settles, a slap as he springs; in the evening pair, a deep stroke on each knee dip. Strokes queue in
  `DRUM` and the ambience plays them (`longDrum` in `lotus-altar.js`, via `temple.takeDrum()` and `sounds.stage`), heard outside
  within 80 m. **Shan check:** ၵွင်ယၢဝ်း for the long drum (on its tip and toast); have a Shan speaker confirm the spelling.
- Reworked the kinnara's afternoon solo (`kinnaraDancers` in `temple-floors.js`) after the site owner said the jump looked
  unnatural and asked for hands and legs. The dancers now have joints: the kinnara's legs bend at hip, knee and ankle (`setLeg`),
  both dancers' arms at shoulder, elbow and wrist, with a palm, thumb and back-bent fingers (`setArm`), and the upper body leans
  from the hips (`U`) so the feet stay put. Each leap is now physical: 0.34 s on the ground sinking into the knees and pushing off
  (deeper before the big leap), then time aloft from the height under gravity (`airT`), one leg reaching forward and the other
  kicked up behind, alternating each leap; he travels round the stage only while airborne. Wings beat up on the push and down on
  the landing, with elbows and wrists trailing like a wave. In the evening pair he dips into his knees and lifts each foot in turn;
  she (longyi, no visible legs) sinks a little on the beat. Checked by headless render at several points in the leap cycle.
- Made walking gentler after the site owner said it made them dizzy. New `CONFIG.camera.look` holds the on-foot camera: mouse
  and touch look speed 0.4 of OrbitControls' default (was 1, so half a screen's drag turned you 180°), damping 0.3 so the view
  stops when you let go instead of drifting for a second (was 0.05), arrow-key turning 1.0 rad/s (was 1.6, and 0.7 of that with
  reduced motion), and looking up or down kept within about 55° (polar .6–2.25, was .45–2.4). The frame loop switches
  `rotateSpeed`/`dampingFactor` between on-foot and overhead values. `lookFrom` and the stair room now get their field of view
  from `resize()`, so it no longer jumps between 65° and a wider portrait value, and on foot a phone held upright widens to 72°
  at most (was 80°). Checked headless: no console errors, and the settings take hold. Still needs the owner to try it by feel.
- Added dragon and lion dance training (舞龍 舞獅) on the kung fu ground east of the pagoda (演武場), for the 30 days before Chinese New
  Year, as the site owner asked: `lionDragonTroupe(b, list, W, D)` inside `trainingGround` in `temple-floors.js`, switched by
  `temple.setLionDragon("dragon" | "lion" | null)` from `drillNow()` in `lotus-altar.js`. Schedule on the temple's clock
  (`CONFIG.lionDragon`): dragon 6–9 AM and 9–10 PM, lion 9:30–11 AM and 6–8 PM. The owner wrote "9:30 to 11:00" for the lion
  without AM/PM; read as morning, after the dragon. New Year dates are a table (`CONFIG.lionDragon.newYear`, 2026–2035); add years
  before 2035 runs out. The dragon: red with gold scales, nine pole dancers in yellow practice shirts and a pearl bearer, running a
  figure of eight while the body rolls in waves. Two southern lions (red and yellow), each two dancers, prowl in circles, blink, snap
  their jaws and rear up every nine seconds. A drummer and a cymbal player keep time at a lion drum that stays at the platform's
  foot all year. The HUD's `#festInfo` line names the season and hours. `?lionDragon=dragon|lion|0` forces one. Checked both in
  headless renders. No drum sound yet.

### 2026-11-05
- Put the Kachin Baptist church in its own walled compound (`churchCompound(g)` and `CHURCH_YARD` in `temple-floors.js`), as the
  site owner asked, with a gate at the plaza lane's end under an iron arch and cross. The six town houses round the church are gone;
  inside the wall now: the pastor's house and the house of the women church workers (sarama, whom the congregation calls sister) on
  the west, the baptistry (a raised immersion pool under a roof) and a Sunday-school hall on the east, trees behind the church.
  The owner asked for "Father and sister"; a Baptist church has a married pastor and no nuns, so those are the Baptist equivalents.
  If they meant a Catholic mission instead, the church itself would need changing. To check with a Burmese speaker: the board and tip
  wording သင်းအုပ်ဆရာအိမ် (pastor's house), ဆရာမအိမ် (women workers' house) and နှစ်ခြင်းကန် (baptistry). The hill-foot bamboo
  now stands back from the compound's west wall. Checked in headless renders.
- Lined the stupa hill's east stair up with the palace lane: `HILL.east` is now computed to aim at the middle of the lane's west
  end (`LANES[4]`), and the stair's paved walk runs from its foot a metre in under the lane, so the two meet with no offset. The
  stair is radial to the hill, so it still meets the lane at about 13°. Not checked in a render (headless Chromium gave no frame).
- Laid the festival ground square to the hill stair (`festivalSpot()` now has `ry: Math.PI`): its near end runs parallel to the
  stair wall with a metre of grass between, instead of the slanted wedge it left when it followed the terrace's curve. Its far
  outer corner now runs about 8 m past the terrace edge, so the retaining wall is 6 m deep and an `sRect` surface keeps a walker on
  the grass there. Not checked in a render.
- Took the long drum, the three gongs and the kinnari costume off the festival ground's pavilion stage, as the owner asked; the stage is bare.
- Added a masked kinnara and kinnari pair (ကိန္နရာ ကိန္နရီ) dancing on the festival ground's grass west of the pavilion, after the
  owner's photo of the dance, but in green instead of gold: `kinnaraDancers(G, list)` and `KINNARA` in `temple-floors.js`. Each
  wears a gilt bird mask with a beak under a tiered gold crown, a green jacket (him: trousers; her: a gold-striped longyi) and
  three-panel fanned wings of sequinned green with gilt rims and knobs, plus a tail fan. They circle each other slowly, bobbing,
  opening and folding their wings with their arms; with reduced motion they move at a quarter speed like the flags. Walkers
  keep out of their circle. Tip and toast in English and Burmese. Checked in a headless render.
- Moved the kinnara pair up onto the festival pavilion's stage (circling its centre, radius 1.15 m), as the owner asked, and they
  now dance only from 4 PM to 11 PM ICT (`CONFIG.dancers`, `temple.setDancers`, `?dancers=1|0`); otherwise they're hidden and
  can't be clicked. Also fixed their plain green and skin colours to match the sRGB wing cloth. Checked in a headless render.
- Gave the kinnara pair human-faced masks instead of bird masks, as the owner asked (the kinnara is human above, bird below): a pale
  painted face with long dark eyes, arched brows, a small nose and red lips, ears with gold ear plugs, black hair behind, the
  same tiered crown. Checked in a headless close-up.
- Added an audience for the kinnara dance (`festivalAudience` and `AUDIENCE` in `temple-floors.js`): 16 townsfolk-style figures in two
  arcs before the stage, children sitting cross-legged in front (several bob and rock to the drum) and young people standing
  behind (jeans or a longyi), all turned to the dancers, kept clear of the flag pole and kahtein trees. Out from 4 PM to 11 PM
  with the dancers (`FOLK.dance`); hidden and unclickable otherwise. Walkers can pass through them (no collision, since solids
  can't be switched off). Tip in Burmese: ပွဲကြည့်ပရိသတ်. Checked in a headless render.
- Added the Shan name of the dance, ka nok ၵႃႈၼူၵ်ႉ ("bird dance", given by the owner), to the dancers' tip (beside the Burmese
  ကိန္နရာ ကိန္နရီ) and toast. **For a native Shan speaker to check:** ၵႃႈၼူၵ်ႉ.
- Added the opening of the epic: from 2 to 3:45 PM ICT the kinnara (the male dancer) dances alone on the festival stage, leaping
  round it (every fourth leap higher, a full turn in the air now and then), crouching as he lands, beating and fluttering his
  wings and shaking his fanned tail. The crowd is biggest then: three `epic` rows join the audience, 37 people in all (16 for
  the pair). `CONFIG.dancers` is now `{ solo: [14, 15.75], pair: [16, 23] }` in fractional hours (the clock reads minutes too);
  `setDancers` takes "solo", "pair" or null; `?dancers=solo|pair|0`. Checked in a headless render.

### 2026-11-04 (night)
- Added a band of bamboo along the stupa hill's eastern foot (`hillFootBamboo(g)` and `FOOT_BAMBOO` in `temple-floors.js`), between
  the hill and the houses on the plaza lane, round the church and facing the Haw Kham, as the site owner asked. Clumps stand on the
  bottom of the slope and the flat below it, only where no house, lane, tree or wall is within 2.6 m (read through `surfAt`), so a
  walk stays open along the house backs. The school grove's clump drawing moved into a shared `bambooStand()`; its clumps are
  unchanged. Checked in a headless render.

### 2026-11-04
- Filled the east side of the road up to the hospital, facing the football ground: `hospitalRoadHouses(g)` in
  `temple-floors.js` puts five town houses (wooden and concrete, one and two storeys) between x ≈ -120 and -110, z 5.5–45,
  fronts on the road's verge, with two banana clumps in the gaps. Two hut-village shade trees moved into the gaps behind them.
- Gave each of the seven village huts a fenced yard: `yardFence()` draws split-bamboo posts and two rails (as `part()`s) from the
  lane edge to 1.4 m behind the hut, with a gate between taller posts in front of its ladder. The fences block walkers.
  Checked both in headless renders.
- Added a waterfall where the stream rises (`waterfall(g)` and `FALLS` in `temple-floors.js`, built after `riverCrossing`):
  a noise-pushed rock cliff west of the stream's end, its back buried in the near hill, with two bowed sheets of streaked
  water falling 11 m into a round plunge pool ringed with boulders (open to the east where the stream runs out), churning
  foam, rising spray puffs and a few pines on top. Tapping the falls gives a tip and toast (Burmese ရေတံခွန် in the tip).
  Pool and cliff block walkers; the cliff is in `TALL`. Its roar is a new ambience bed (`amb.falls`, `temple.sounds.falls`).
  With reduced motion the water still drifts slowly, as the stream does; the foam stops turning. Checked in a headless
  render from beside the hospital.
- Took the − / + zoom buttons out of the HUD (and their `zoom()` helper and `.zoom` styles); wheel and pinch zoom still work.

### 2026-11-03 (late)
- Festival ground: the prayer-flag pole's plinth overlapped the pavilion stage's steps. The pole (with its hamsa, streamer,
  lantern strings and walk-collision circle) now stands 2.2 m downhill of the field's centre (`FZ` in `festivalGround`),
  leaving about 1.1 m of grass between the plinth and the bottom step.
- Restyled the Shan monastery's shrine hall after the site owner's photo of a real Shan image hall: the Chinese-style altar
  pieces there are gone (red lacquer stepped stands with red candles, bronze tripod censer, red altar cloth, the pointed arch
  with flame points and spired canopy). Now: a red hanging worked in gold (flying hamsa, little pyatthat shrines, scalloped
  gilt top) fills the back wall; a dark blue halo with a ring of twinkling multicoloured lights behind the image's head; a
  square gilded throne with a niche band and lotus-petal rim; a taller pointed finial on the image; sprays of white flowers
  in gilt urns; a red coffered ceiling with round lamps over the image. The altar keeps its offerings via `shrine(..., { shan:
  true })`: white cloth, gilt stands with white candles in glass chimneys, incense in a footed brass bowl of sand. No people
  in front of the image. Checked in a headless render (worker disabled so the statue meshes on the main thread).
- Then cleared the floor before the Shan image's table, as the site owner asked: no candle stands or censer pedestal there.
  Light offerings go on gilt trays at the table's front corners (`buildTrays`), incense in a small brass sand bowl at the
  centre back of the table (`alt.inc`); walkers can now step up to the table front. Checked in a headless render.
- Then took the offering table out of the Shan hall altogether (a table is the Chinese way), after the site owner's second
  photo: the image now sits high on a broad gilded plinth carved with niches, and the offerings (vase, water bowls, fruit,
  candle trays, sand bowl) stand on the plinth's front ledge (`KYAUNG.ledge`, shrine built in a lowered `ledge` group).
  White flower sprays stand on the floor before it; long woven Shan banners (tamkhon) hang on the side walls; "Look closer"
  there uses its own higher view (`CONFIG.places.kyaung.closeUp`). Old saved altars keep their offerings. Not yet changed:
  the image's own body, which in the photo is slimmer with longer ears than our sculpted figure.
- Took the jewelled band off the Shan image's hairline (it read as a hat; Shan images are bareheaded), coloured its curls
  dark instead of pale gold, and brought the tall finial back down to a small gilt bud, after the site owner's note.

### 2026-11-03 (night)
- Added a small township football ground (`footballGround` in `temple-floors.js`) west of the road up to the hospital:
  a 36 × 56 m grass pitch with white markings and two goals on a laterite running track, inside a 2.2 m painted wall
  (51 × 64 m). It has a covered stand of five concrete tiers under a tin roof along the road side (walkable), three low
  terraces against the west wall, and a gate off the road with a Burmese/English sign (မြို့နယ်အားကစားကွင်း · Township Stadium)
  and the flag. No floodlights. The hill peaks nearby were checked and don't reach it, so the skyline is unchanged.
  Checked in a headless render.

### 2026-11-03 (evening)
- Hid the "Lotus Altar" title and the floor/place line (`#where`) from the top-left HUD. They are kept for screen readers
  through the same visually-hidden rule as `#hint` in `lotus-altar.css`; the buttons now sit at the top.
