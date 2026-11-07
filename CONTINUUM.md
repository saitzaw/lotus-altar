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

- Have a Shan speaker check မွင်း (the row of gongs on the festival stage).
- Have a Shan speaker check ၵွင်ယၢဝ်း (the long drum's name on the festival stage drummer).
- Have a Shan speaker check ၸၢပ်ႈ (the cymbals on the festival stage; a best guess, after the Tai word chap).
- Have a Shan speaker check the welcome board's Shan line (`WELCOME` in `temple-floors.js`).
- Have a Shan speaker check the palace's names in `SHAN_NAMES`: ႁေႃၶမ်း (Haw Kham, on its board) and ၸဝ်ႈၾႃႉ (saopha, in its toast).
- Have a Shan speaker check the hill's names (`SHAN_NAMES`): ၽြႃးမုင်ႈမိူင်း (stupa) and ၵျွင်းၵွင်းမူးၶမ်း (monastery), as given by the
  site's owner; the boards carry the Shan names only.

- After Nov 1, decide whether to keep the Halloween code for next year (it switches itself off by date) or remove it.
- Stale comment in `src/lotus-altar/02-hall-and-guanyin.js` (line 38) points to `guanyin-sculpt.js`; the file is `statue-sculpt.js`.
- `CONFIG.camera.stairsTop` in `lotus-altar.js` has a pasted run of duplicate trailing comments to clean up.

## Log

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
