(() => {
"use strict";
const TAU = Math.PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = id => document.getElementById(id);

/* ---------- settings: change these to adjust the shrine ---------- */
const CONFIG = {
  storageKey: "lotus-altar-v2",                       // change to start every visitor from the sample altar
  start: "pagoda",                                    // where the page opens: "pagoda" (outside the gate) or a floor number
  light: { exposure: .82, key: 1.5, hemisphere: .3, dayIndoor: 0x7a6c5a },   // dayIndoor: the haze in a hall by day
  camera: {
    full: { pos: [0, 4.2, 7.0], target: [0, 1.4, .5] },   // a wide view of the whole shrine, the bench and the fortune sticks; orbits all the way round
    closeUp: { pos: [.75, 2.95, .75], target: [0, 2.45, -1.5] },
    corridor: { pos: [0, 1.65, 8.4], target: [0, 1.6, 9.6], fov: 65 },
    stairs: { pos: [-4.6, 1.65, -2.95], target: [-6.2, 1.75, -4.45] },   // standing inside the stair room at eye height, facing the spiral
    stairsTop: { pos: [-4.6, 1.65, -2.95], target: [-6.0, .2, -4.4] },   // on the top floor, looking down the flight that arrives there
    pagoda: { pos: [0, 27, 94], target: [0, 6, 14] },
    // looking round on foot, kept gentle so walking does not make anyone dizzy
    look: { drag: .4, settle: .3, turn: 1.0, minPitch: .6, maxPitch: 2.25 }   // drag: mouse/touch look speed (1 = half a screen turns you half round); settle: how fast the view stops after you let go (0–1); turn: arrow-key turn in rad/s; pitch limits in radians from straight up
  },
  // the seven floors of the pagoda, ground floor first; `statue` floors get the Look closer button
  floors: [
    { han: "觀音殿", name: "Guanyin Main Hall", statue: "guanyin", hint: "Drag to walk around Guanyin's shrine. Tap the vase, water bowls, fruit plate, candle stands or censer to place an offering from your bag (buy them at the temple shop first), the wooden fish or bell to recite, or the red cylinder to draw a fortune stick." },
    { han: "千燈殿", name: "Hall of a Thousand Lamps", hint: "Three stepped towers of oil lamps, and shelves of lamps and candles along the back wall. Offerings are made before the statues on the other floors." },
    { han: "禪堂", name: "Meditation Hall", hint: "Rows of meditation cushions before the ensō scroll, with the wooden board that calls the hour." },
    { han: "藥師殿", name: "Medicine Buddha Hall", statue: "medicine", hint: "The Medicine Buddha, with lapis-blue curls and the medicine jar, behind the seven lamps of healing. Tap the water bowls, fruit plate, candle stands or censer to make an offering from your bag." },
    { han: "千手觀音殿", name: "Thousand-Armed Guanyin Hall", statue: "qianshou", hint: "Guanyin of the Thousand Arms, an eye in every palm to see all who suffer and a hand to reach each one. The hall is also the pagoda's shop: tap the shelves along the walls to add offerings to your basket, then offer water, light, incense or fruit at her altar." },
    { han: "降魔殿", name: "Victorious Buddha Hall", statue: "jaya", hint: "The Victorious Buddha (Jaya Buddha), touching the earth as he did when he overcame Māra on the night of his awakening; people pray before him for success. Tap the water bowls, fruit plate, candle stands or censer to make an offering from your bag." },
    { han: "彌勒殿", name: "Maitreya Hall", statue: "maitreya", hint: "The laughing Maitreya at the top of the pagoda, with longevity peaches and gold ingots. Tap the water bowls, fruit plate, candle stands or censer to make an offering from your bag." }
  ],
  // buildings beside the pagoda
  places: {
    bell: { han: "鐘樓", name: "Bell Tower", hint: "Tap the great bronze bell to swing the striking log and ring it." },
    library: { han: "蓮華寺", name: "Lotus Temple hall", statue: "shakyamuni", hint: "The great hall of the temple: Shakyamuni Buddha on his lotus throne. Tap the water bowls, fruit plate, candle stands or censer to make an offering from your bag. On the right the wishing tree shades a small Victorious Buddha: tap its trunk to tie a red wish ribbon." },
    shop: { han: "法物流通處", name: "Temple shop", hint: "Choose offerings in the panel and buy them here, then carry them to Guanyin's altar on the pagoda's ground floor or to any other statue's altar. Tap the shelves to add things to your basket. The monks' quarters are upstairs." },
    quarters: { han: "寮房", name: "Monks' dining and rest room", hint: "Where the monks take their meal before noon and rest: low tables set with alms bowls, sleeping mats with folded robes." },
    kyaung: { name: "Shan monastery", shn: "ၵျွင်းၵွင်းမူးၶမ်း", statue: "shan", closeUp: { pos: [.75, 3.25, 1.2], target: [0, 2.8, -1.5] }, hint: "The shrine hall of ၵျွင်းၵွင်းမူးၶမ်း, the Shan monastery on the hill of the stupa ၽြႃးမုင်ႈမိူင်း: a gilded Buddha image in the northern Shan and Lanna manner, touching the earth, bareheaded, with dark curls, a small gilt bud on the ushnisha and his robe falling from the left shoulder, high on a broad gilded throne before a red wall worked in gold with flying hamsa and little spired shrines, a ring of lights round the dark blue halo behind his head. There is no offering table, as in Shan image halls: offerings go on the throne's front ledge. Offer a lotus (puppha) at the vase, water (udaka) in the bowls and light (dīpa) on the gilt trays; incense goes in the little brass bowl of sand; fruit is welcome too. The teak doors behind you lead back out onto the verandah." },
    kyaungLow: { name: "Shan monastery below the festival ground", nav: false, statue: "shan", closeUp: { pos: [.75, 3.25, 1.2], target: [0, 2.8, -1.5] }, hint: "The shrine hall of the teak monastery on the stupa hill's lower terrace, below the festival ground: a gilded Buddha image in the northern Shan and Lanna manner, touching the earth, high on a broad gilded throne before a red wall worked in gold, a ring of lights round the dark blue halo behind his head. As in Shan image halls there is no offering table: offerings go on the throne's front ledge. Offer a lotus (puppha) at the vase, water (udaka) in the bowls and light (dīpa) on the gilt trays; incense goes in the little brass bowl of sand; fruit is welcome too. The teak doors behind you lead back out onto the porch." },
    church: { name: "Kachin Baptist church", my: "ကချင်နှစ်ခြင်းအသင်းတော်", hint: "Inside the Kachin Baptist church: two banks of wooden pews either side of the aisle, ceiling fans turning under the beams, and manau patterns, the red and black diamonds of the Kachin manau dance poles, along the walls and on the pulpit. At the front a plain wooden cross hangs on a red cloth over the dais, where the choir sits; the Sunday service is in Jinghpaw and the hymns are sung in parts. The doors behind you lead back out to the forecourt." },
    haw: { name: "Haw Kham throne room", shn: "ႁေႃၶမ်း", hint: "The throne room of the Haw Kham, the saopha's palace, under its seven-tiered pyatthat: red-lacquered pillars banded in gold, teak walls worked in gilt, and at the far end the saopha's throne on its stepped dais, gilded and set with glass mosaic, lions in the niches of its base, curling gilt arms either side of the seat, and behind it a tall gilt screen with a little door, through which the prince came out to sit before his court. White umbrellas, the mark of a ruler, stand either side, and white drapes are gathered back from the pillars. The courtiers knelt on the mats along the carpet. The doors behind you lead back out onto the verandah." },
    hawJustice: { name: "Haw Kham hall of justice", shn: "ႁေႃၶမ်း", nav: false, hint: "The hall of justice of the Haw Kham, behind the palace's left-hand door: the saopha's seat of judgement on its dais, gilded, with conch shells in the niches of its base and a great white conch on the red panel behind the seat. Here the saopha heard the cases and disputes of his state, his ministers kneeling on the mats either side, and gave judgement by the dhammathat, the old law books, whose palm-leaf bundles lie on the low red table before the dais. The doors behind you lead back out onto the verandah." },
    hawMonks: { name: "Haw Kham hall of the monks", shn: "ႁေႃၶမ်း", nav: false, hint: "The hall behind the palace's right-hand door, where the saopha received the monks: three seats for the abbots on a high dais before a gilt screen, a palm-leaf fan beside each, and below them, facing them on the floor, the saopha's own low lotus seat, for even a prince sits lower than a monk. Before the dais stand folded robes on gilt trays and lacquered offering vessels. The doors behind you lead back out onto the verandah." },
    hawLibrary: { name: "Haw Kham literature hall", shn: "ႁေႃၶမ်း", nav: false, hint: "The literature hall, behind the centre doors at the back of the Haw Kham: the palace's books in lacquered and gilded chests down the side walls, and bundles of palm-leaf manuscripts wrapped in coloured cloths on a long rack at the back. On the low dais a black folding book lies open on a gilt reading stand before the reader's cushion, where the court's scribes and poets read aloud to the saopha; low reading tables stand on the mats. The doors behind you lead back out onto the verandah." },
    hawDining: { name: "Haw Kham dining hall", shn: "ႁေႃၶမ်း", nav: false, hint: "The dining hall, behind the left-hand door at the back of the Haw Kham: low round lacquer tables set for a meal on the floor, rice under a domed lid in the middle and small bowls of curries and relishes round it, a cushion at each side; the saopha's gilt table on the dais. Along the walls stand stacked lacquer food carriers and big earthen water pots. The doors behind you lead back out onto the verandah." },
    hawOpera: { name: "Haw Kham opera hall", shn: "ႁေႃၶမ်း", nav: false, hint: "The palace's little theatre, behind the right-hand door at the back of the Haw Kham: a stage under a gilt proscenium with red curtains gathered back, a painted backdrop of a palace among wooded hills, oil lamps along its edge, and beside it the long drum and a frame of gongs. The saopha watched from his gilt seat in the middle of the floor, the household on the mats behind him. The doors behind you lead back out onto the verandah." }
  },
  layout: { censerZ: 1.95, benchZ: 2.8, censerScale: 1.6 }, // distance in front of the statue (z) for censer and bench
  lanterns: { color: 0xb0180c, glow: 0xd0200a, glowStrength: .55 },
  // where the temple stands, for the real sun and moon; times are shown in Indochina Time (ICT, UTC+7)
  sky: { lat: 13.75, lon: 100.5, tz: "Asia/Bangkok", place: "Bangkok" },
  // the Halloween festival: on these nights ([month, day] on the temple's clock) the houses and village huts put their lights out
  // at outHour (9 pm ICT), a friendly ghost walks the roads until untilHour and walkers carry a torch; the street and lane lights
  // stay on. Add ?halloween=1 to the address to see it at any time, or ?halloween=0 to turn it off
  halloween: { from: [10, 27], to: [11, 1], outHour: 21, untilHour: 5 },
  // townsfolk: ten people in the seven-day market and five on the roads, out from `from` until they go home at `until` o'clock on the temple's clock;
  // they put up umbrellas once the rain is heavier than `umbrella` (0–1). ?townsfolk=1 or ?townsfolk=0 forces them out or in
  townsfolk: { from: 18, until: 22, umbrella: .3 },
  // the dances on the festival ground's stage, each a list of [from, until] in hours on the temple's clock (17.75 is 5:45 pm): the
  // kinnara alone, leaping, before the biggest crowd (the epic's opening), the kinnara and kinnari pair, the to (တၢင်းၵႃႈတူဝ်း,
  // Burmese တိုးနယား) at dusk, the white and the yellow to together, the pair again, and to close, the two to with the kinnara
  // alone between them, and in the gaps between dances a Shan singer alone on the stage (seen only: no song is played); ?dancers=solo,
  // pair (or 1), to, twoTo, toKinnara, singer, or ?dancers=0 forces one
  dancers: { solo: [[14, 15.5]], pair: [[16, 17.75], [20.75, 21.75]], to: [[18, 19.5]], twoTo: [[19.75, 20.5]], toKinnara: [[22, 23]],
             singer: [[15 + 31 / 60, 16], [17 + 46 / 60, 17 + 59 / 60], [19 + 31 / 60, 19.75], [21 + 46 / 60, 22]] },   // 3:31–3:59, 5:46–5:58, 7:31–7:44, 9:46–9:59 pm
  // dragon and lion dance training (舞龍 舞獅) on the kung fu ground, for the `days` before Chinese New Year (newYear: the first day of
  // the first lunar month, [year, month, day]); hours are [from, until] on the temple's clock, 21.5 is 9:30 pm. On New Year's day itself
  // the troupe dances in the town, so the ground is quiet. ?lionDragon=dragon, ?lionDragon=lion or ?lionDragon=0 forces one
  lionDragon: { days: 30, dragon: [[6, 9], [21, 22]], lion: [[9.5, 11], [18, 20]],
                newYear: [[2026, 2, 17], [2027, 2, 6], [2028, 1, 26], [2029, 2, 13], [2030, 2, 3], [2031, 1, 23], [2032, 2, 11], [2033, 1, 31], [2034, 2, 19], [2035, 2, 8]] },
  // the beat officer: a policeman walks the town's roads and chases a visitor on foot who comes within `see` metres, at `speed`
  // m/s (a walker does 2.6, so you can get away); within `arrest` metres you are arrested and walked to the police station, and he
  // stays there `hold` seconds. The temple compound and the markets are safe ground. With `night` he is only out after dark
  // (the sky's Night view). ?police=0 or ?police=1 turns him off or on
  police: { on: true, night: true, see: 16, speed: 2.1, beat: 1.2, arrest: 1, hold: 30 },
  // the weather outside follows the seasons of the northern Thai hills (no live weather service): rain from May to October,
  // cool clear days and misty mornings from November to February, smoky haze from the field burning in March and April.
  // Each `spell` of hours on the temple's clock gets one kind, from that month's odds [clear, cloudy, rain, mist, haze];
  // add ?weather=rain (or clear, cloudy, mist, haze) to the address to force one
  weather: { spell: 3, odds: [[5, 2, 0, 3, 2], [4, 1, 0, 2, 4], [2, 1, .5, 0, 6], [2, 2, 1.5, 0, 5], [2, 3, 4, 0, 1], [1, 4, 5, .5, 0],
                              [1, 4, 5, .5, 0], [1, 4, 6, .5, 0], [1, 4, 6, .5, 0], [3, 3, 3, 1, 0], [5, 2, .5, 2, 0], [5, 2, 0, 3, .5]] },
  // the sounds outside: wind, birds and insects, the stupas' hti bells, the temple bell and gong (all made in WebAudio)
  ambience: { volume: .8, bellEvery: [50, 90], gongEvery: [35, 70],   // seconds between strokes of the temple bell and gong
              windRest: [13 * 60, 17 * 60] },                         // seconds of stillness after the banyan's or the field's one breath of wind
  chant: { rounds: 3, beat: .55 },                    // seconds per syllable
  sculpt: { worker: "statue-sculpt.js", bodyCell: .012, headCell: .0058,  // smaller cells: smoother, slower to build and to draw
            cells: { lion: [.022, .014], lionL: [.022, .014] } },        // [body, head] per figure: the stone lions outside need far less detail than a face
  scan: { file: "guanyin.glb", height: 2.55, turn: 0 }, // museum scan; turn is radians about y if it faces away
  // outdoor haze [near, far] in metres: things fade into it and are not drawn at all past `far`
  fog: { outside: [70, 230], walk: [30, 170], corridor: [70, 260] },
  // selective rendering outside: skip whatever is behind the camera, past the fog or smaller than minPixels on screen
  cull: { enabled: true, minPixels: 2 }
};
/* Prices, names and kinds of each offering live in ITEMS below. */

