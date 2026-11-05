# CONTINUUM.md

A running log that carries context from one working session to the next: where the project stands, what changed
recently, and what's still open. Read it at the start of a session; update it at the end. Newest entries go first.
The log keeps only the six or so most recent entries. When it grows past that, move the oldest to the top of
`CONTINUUM-archive.md`, which isn't read at the start of a session. Look there, or in `git log`, for older history.

## Current state (2026-10-28)

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

- Have a Shan speaker check the welcome board's Shan line (`WELCOME` in `temple-floors.js`).
- Have a Shan speaker check the palace's names in `SHAN_NAMES`: ႁေႃၶမ်း (Haw Kham, on its board) and ၸဝ်ႈၾႃႉ (saopha, in its toast).
- Have a Shan speaker check the hill's names (`SHAN_NAMES`): ၽြႃးမုင်ႈမိူင်း (stupa) and ၵျွင်းၵွင်းမူးၶမ်း (monastery), as given by the
  site's owner; the boards carry the Shan names only.

- After Nov 1, decide whether to keep the Halloween code for next year (it switches itself off by date) or remove it.
- Stale comment in `lotus-altar.js` (~line 297) points to `guanyin-sculpt.js`; the file is `statue-sculpt.js`.
- `CONFIG.camera.stairsTop` in `lotus-altar.js` has a pasted run of duplicate trailing comments to clean up.

## Log

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

### 2026-11-03 (afternoon)
- The night sky is black: the three sky domes (pagoda grounds, bell tower, the view from the upper floors) lost their purple
  gradient and rose horizon glow above the horizon, and the outdoor background and haze at night are black (`skyColors`).
  Stars and moon show as before; a cloudy or rainy night still greys it faintly. Day view unchanged.

### 2026-11-03 (early afternoon)
- Took away the westernmost foothill (about x −158, z −19, base radius 40), which stood across the new road to the hospital.
  `mountainsAndForest` now skips any peak whose base would reach the road or the hospital; the random draws still happen,
  so every other peak keeps its shape. Syntax-checked only.
