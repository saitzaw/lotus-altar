# CONTINUUM.md

A running log that carries context from one working session to the next: where the project stands, what changed
recently, and what's still open. Read it at the start of a session; update it at the end. Newest entries go first.

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
- Agent docs: `AGENTS.md` (any agent) and the `lotus-altar` skill in `.claude/skills/lotus-altar/` (Claude Code): `SKILL.md`
  holds the rules and an index; details live in `references/*.md`, one file per topic.

## Open threads

- Check the 5F arms, the 6F statue and the wish-tree Buddha by eye in a browser (headless renders can't finish the statues).
- Hall name 降魔殿 for the Victorious Buddha is our choice ("hall of subduing Māra"); have someone confirm it reads well.

- Have a Shan speaker check the welcome board's Shan line (`WELCOME` in `temple-floors.js`).

- After Nov 1, decide whether to keep the Halloween code for next year (it switches itself off by date) or remove it.
- Stale comment in `lotus-altar.js` (~line 297) points to `guanyin-sculpt.js`; the file is `statue-sculpt.js`.
- `CONFIG.camera.stairsTop` in `lotus-altar.js` has a pasted run of duplicate trailing comments to clean up.

## Log

### 2026-11-03
- By day every lamp is out and the halls take the daylight: all point lights (lamps, candles, fires) go dark through
  `lampsOn` (a `THREE.PointLight.prototype.intensity` accessor in `lotus-altar.js`), the halls' lanterns, lanterns'
  halos and lamplit window panes go unlit, the pagoda floodlight and storey windows go dark, and `daylit()` turns each
  hall's sky, key and side lights to pale daylight, with the inside windows showing day and a lighter indoor haze
  (`CONFIG.light.dayIndoor`). Candle and butter-lamp flames still burn as offerings. Checked in headless renders of the
  1F hall (day and night), 2F and the pagoda by day; other halls not checked by eye.

### 2026-11-02
- 2F: the lit niches on the back wall are gone; oil lamps and candles stand on a free-standing three-tier rack 0.9–1.4 m in
  front of the wall (flames no higher than 1.4 m), so no flame touches the wall.
- 7F stairwell: the guard rail ends on posts clear of the back wall, and the flight's handrail now turns up to the opening's
  corner post instead of ending in a newel on the top step, so the way off the stairs is clear.
- Commented out the beat officer (police chase): `beatOfficer(g)` in `temple-floors.js`, the police block and `policeStep()`
  in `lotus-altar.js`. Uncomment all three to bring him back.
- 5F is now the Thousand-Armed Guanyin Hall (千手觀音殿, figure `qianshou`): a gilded Guanyin with about 120 instanced
  arms fanned behind her, an eye in every palm, plus the pagoda's own offerings shop (low shelves under the side windows,
  a counter by the door). Tapping a shelf opens the Buy panel. The tea and calligraphy room is gone.
- 6F is now the Victorious Buddha Hall (降魔殿, figure `jaya`): the earth-touching Buddha with a Shan/Burmese flame finial.
  The wishing tree moved to the Lotus Temple hall (right of Shakyamuni) with a small Victorious Buddha seated before it.
- Every statue hall now takes water, light, incense and fruit offerings like Guanyin's altar (`shrine` in `lotus-altar.js`,
  saved in `state.shrines`). Floor 1's altar code was turned into shared builders and placers.
- The stair-room door swings shut 2.6 s after it opens.
- Checked headless: 5F, 6F and the Lotus Temple hall build without console errors, and offerings there take items from the bag.

### 2026-10-29
- The beat officer walks round trees, posts and buildings instead of getting stuck on them: blocked ahead (checked half a
  metre out), he turns aside at growing angles and keeps to that way round for a moment; he also can't step up or down more
  than a stair's height, like a walker. Checked in a headless simulation behind the fire station and behind a street tree.
- Reaching safe ground during a police chase no longer shows a message; the officer just turns back.
- The beat officer now comes out only after dark (`CONFIG.police.night`; the sky's Night view), like the ghost; by day there
  is no one to chase you. Checked in a headless simulation by day and by night.
- Added a beat officer (`beatOfficer` in `temple-floors.js`, `CONFIG.police`, `?police=0|1`): a policeman in uniform walks the
  town's roads from the police station. A visitor walking outside who comes within 16 m is chased at 2.1 m/s (walkers do 2.6);
  within 1 m they are arrested and set down at the police station, and he holds there 30 s. The temple compound and both
  markets are safe ground (`SAFE`): he never steps in and gives up the chase. Chase, arrest and escape checked in a headless
  simulation; the officer's look not yet checked by eye in a browser.
- The seven-day market's string bulbs and the opera's lights now go dark at 10 PM when the townsfolk go home (they
  follow `FOLK.out`); the gambling hall stays lit for the four-animal top. Not checked by eye in a browser.
- Sent the townsfolk home at 10 PM ICT (`CONFIG.townsfolk.until: 22`, was 6 AM), so late at night only the Halloween
  ghost walks the roads. The first try left them out (the hour check only handled windows past midnight); fixed so
  `folkNow` handles both.
- Added fifteen low-poly townsfolk, out from 6 PM to 6 AM ICT: ten browsing the seven-day market, five walking the roads,
  under umbrellas when it rains (`CONFIG.townsfolk`, force with `?townsfolk=1|0`). Checked in a headless render in the
  market, with and without rain; the road walkers weren't checked by eye.
- Restyled the townsfolk after a reference picture: blocky hair, big heads with eyes and a smile, open cream shirts
  (square-necked blouses for women), knotted sashes, knee-length patterned sarongs, bare legs and flip-flops.
- Then dressed them warmly, since northern Shan nights are cold: padded jackets and cardigans with long sleeves, wool
  scarves, knitted bobble hats, towel turbans for some women, baggy Shan trousers or ankle-length longyi.

### 2026-10-28
- Added a Kachin Baptist church past the end of the plaza lane (white hall, red roof, bell tower and spire, manau
  patterns on the porch pillars and front gable; board in Burmese and English) with six houses round it.
- Named the town Hsenwi: a Shan-style welcome board by the police station at the east end of the street, in Shan
  (ယိၼ်းၸူမ်းႁပ်ႉ ၸူး ဝဵင်းသဵၼ်ဝီ), Burmese (သိန္နီမြို့မှ ကြိုဆိုပါသည်) and English. Shan wording wants a native speaker's check.
- Added a bamboo grove behind the high school and a row of houses facing the school gate across the market lane.
  Not yet checked by eye in a browser (headless renders couldn't reach the spot).
- Removed the stream's flowing-water sound.
- Made every wind (banyan, fields, stupa hill) come in soft breaths with stillness between and a faint moan at night
  (`b2818d9`); quieter field and banyan wind.
- Repo remote now pushes as the saitzaw GitHub account via the `github-personal` SSH host.
- Added a torch on/off switch (HUD button and T key) for walking outside at night.
- Split the `lotus-altar` skill into a short `SKILL.md` (rules + index) and topic files in `references/`.
- Added weather (rain, cloud, mist, haze) and positional ambient sounds outside, plus a HUD sound toggle.
- Added the `lotus-altar` Claude Code skill, `AGENTS.md` and this file.

### 2026-10-27
- Added Halloween night (`b5f698b`), set it to run Oct 27 – Nov 1 (`4a4d36d`), and darkened the night once the houses go
  out (`65dafad`).

### 2026-10-26
- Aligned the main stupa's door gables flat to the wall (`0912793`).
- Drew repeated static parts of the grounds as instanced meshes with `part()` / `bakeParts()` (`da6cdde`).
- Moved the field hut out of the fuel station forecourt (`d18cac5`).
- Showed the action column only in the 1F hall; opened the 1F censer with an ash bed (`3b2dd6a`).

### 2026-10-25
- Initial commit: lotus temple site with Vercel deploy config (`3004b46`).
