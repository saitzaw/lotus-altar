# Schedule

Every timed event in the Lotus Altar world, in one place. All times are Bangkok time (ICT, UTC+7), the temple's clock.
Day and night follow the real sun and moon over Bangkok.

The hours themselves live in `CONFIG` in `lotus-temple/src/lotus-altar/00-helpers-and-config.js`. When an event is added or its
hours change, update this file in the same commit.

## Every day

| Time | What happens | Where | `CONFIG` |
|---|---|---|---|
| 5:00 – 9:00 AM | Morning market: village women sell greens, chillies and limes on the ground | Seven-day market | `morningMarket` |
| 8:00 – about 9:25 AM, every day but the Kathin day | Shinlaung procession (Poy Sang Long): gift poles and streamer poles in front, the boys on their carriers' shoulders, the families, then the kinnara, the to, and the Shan band (long drums, gongs, cymbals) at the back. It stops 15 min to dance at five places on the way. Called off while it rains | Gate → front street → market lane → Haw Kham road → second monastery | `procession` |
| about 9:25 – 11:00 AM, every day but the Kathin day | Shinlaung gathered: the three boys on their carriers' shoulders in a row before the monastery's stair, the families and pole bearers crowded round them; the kinnara, the to and the band dance and play on the festival ground. All go home at 11 | Second monastery; festival ground | `procession` |
| 6:00 AM – 8:00 PM | High school in use: its windows light up after dark only in these hours; after 8 PM no one is left and they stay dark until 6 AM | High school, south of the daily market | `school` |
| 9:00 AM – 12:00 noon | Seven-day market: sellers at the stalls, shoppers in the aisles | Seven-day market | `stalls` |
| 9:00 AM – 10:00 PM | Food street: cooks, diners, strollers | Food street, beside the market | `foodStreet` |
| 2:00 – 3:30 PM | Kinnara dances alone (the biggest crowd) | Festival stage, stupa hill | `dancers.solo` |
| 3:31 – 3:59 PM | Shan singer | Festival stage | `dancers.singer` |
| 4:00 – 5:45 PM | Kinnara and kinnari pair | Festival stage | `dancers.pair` |
| 5:00 – 9:00 PM | Seven-day market open again | Seven-day market | `stalls` |
| 5:46 – 5:58 PM | Shan singer | Festival stage | `dancers.singer` |
| 6:00 – 7:30 PM | The to (white) | Festival stage | `dancers.to` |
| 6:00 – 10:00 PM | Townsfolk out: 10 in the market aisles, 5 on the roads (umbrellas in rain) | Market and roads | `townsfolk` |
| 7:31 – 7:44 PM | Shan singer | Festival stage | `dancers.singer` |
| 7:45 – 8:30 PM | Two to, white and yellow | Festival stage | `dancers.twoTo` |
| 8:45 – 9:45 PM | Kinnara and kinnari pair again | Festival stage | `dancers.pair` |
| 9:46 – 9:59 PM | Shan singer | Festival stage | `dancers.singer` |
| 10:00 – 11:00 PM | Two to with the kinnara (closing dance) | Festival stage | `dancers.toKinnara` |
| Dusk – 11:00 PM | Festival ground lights: bulbs along the pavilion's eaves, lamps under its roof, a spotlight on the stage, the lantern strings over the grass. They come on once it is dark (from 5 PM) and go out when the closing dance ends | Festival ground, stupa hill | `festivalLights` |
| 8:00 AM – 3:00 PM | Day balloons (a painted rooster, a balloon painted with a deva, and a fish, parrot, bear and tiger) fill over their fire pits and go up in turn, one about every minute (a 3-minute cycle on each of three pads, a different balloon each time). A crowd sits on the terraces and stands along the field, with a team at each fire pit. A balloon already rising at 3 PM flies on; none is filled after | Fire balloon ground, stupa hill's lower terrace | `balloons.day` |
| 6:00 PM – 2:00 AM | Night balloons go up in turn on the same three pads: a lantern balloon studded with candle lanterns in flowers, a stupa in lanterns hanging below it; a painted balloon with crowned dancers; a flower-painted fireworks balloon (စိန်နားပန်) that stays dark until it is 6–12 m above the ground, a different height each flight, then showers sparks and coloured stars, shoots rockets and bursts shells of stars at random around it as it climbs. Three launches in five are fireworks balloons. The crowd lets go small paper sky lanterns while it is dark, about one every 1.1 s, each held up for 6 s in a launcher's hands (about 35 people on the field by the parapet, 30 on the top three terrace steps) and drifting up over the town for about 3 minutes. From 3 to 6 PM and 2 to 8 AM the fire pits are cold and the crowd is gone. With reduced motion the balloons stay full on their pads and the lanterns hang still. None go up while it rains | Fire balloon ground | `balloons.night` |
| 7:00 PM – midnight | Fire lotus towers (မီးလျှော်ပွဲ၊ မီးကြာစံပွဲ): the three bamboo fireworks towers are lit one at a time, one about every 100 s (a 5-minute cycle on each). On each tower the eight racks catch from the foot up over 36 s, each throwing gold fountains and burning red flares for 12 s, then the paper fire lotus on top opens in drooping trails of sparks for 34 s. The crowd sits on the terraces and stands along the field. With reduced motion one tower stands lit and still. None in the rain | Fire lotus ground, stupa hill's lower terrace between the north and west stairs | `fireLotus` |

## Once a week

| Day and time | What happens | Where | `CONFIG` |
|---|---|---|---|
| Sunday 9:00 – 11:30 AM | Church service: congregation, pastor, choir, pianist | Kachin Baptist church | `service` |
| The last Sunday of November, all day (service 9:00 – 11:30 AM) | Harvest thanksgiving: the families' first fruits (sheaves of rice, sacks of new rice, pumpkins, baskets of oranges, avocados and chillies, bananas, cabbages, maize, sugar cane) before the pulpit | Kachin Baptist church | `harvest` |

## By season

| When | What happens | Where | `CONFIG` |
|---|---|---|---|
| The 30 days before Chinese New Year | Dragon dance training 6–9 AM and 9–10 PM; lion dance training 9:30–11 AM and 6–8 PM. Quiet on New Year's day | Kung fu ground | `lionDragon` |
| October and November (all day and night) | Lotus lanterns (ဆီမီးပူဇော်): 160 small pink paper lotus lanterns, each with a flame, offered to the Buddha round the main stupa (along the terrace walk's parapet, in a row round the stupa's foot, at both ends of every step), for the festivals of light of Thadingyut (October) and Tazaungdaing (November). They glow after dark | Main stupa, top of the stupa hill | `lotusLanterns` |
| Noon – 2:00 PM, on one day only: the full moon of Tazaungmon (Tazaungdaing), in November; the days through 2035 are listed in `CONFIG.kathin.days` | Shan Kathin (ပွႆးၵထိၼ်, ကထိန်ပွဲ): the town carries one new set of monastic robes from the Haw Kham (the flags, trees and tower waiting outside its town gate, the rest coming out of the courtyard behind them), around the old quarter to the second monastery, with no dance stops. A great yellow flag with red spots leads on two bamboo poles, then Buddhist flags and strings of little flags on poles, five padetha trees (ပဒေသာပင်), each carried by four men, the last hung with banknotes under a white umbrella, a tower of flowers nearly ten metres high and a palanquin dressed in Buddhist-flag cloth; the robe itself is under a white umbrella too. They arrive about 12:10. Five monks wait on the porch to receive the robe. Called off while it rains | Haw Kham → palace lane → market lane → front street → main stair → second monastery; monks on its porch | `kathin` |
| Oct 27 – Nov 1 (Halloween) | Houses go dark 9 PM – 5 AM, a friendly ghost walks the roads, walkers carry a torch | Town | `halloween` |
| Dec 1 – Jan 6 (all day and night) | Christmas dressing: a gold star on the church tower, coloured bulbs on the church, its tower and the compound's front wall and gate; a tree, a nativity, paper star lanterns and the greeting “Ngwi Pyaw Christmas” inside; bamboo star poles with bulbs in the yards of four Christian homes (the pastor's, the women workers', two on the plaza lane) | Kachin Baptist church and the plaza lane | `christmas` |
| Dec 1 – 24, 7:00 – 11:00 PM | Carol singers: eight young people of the church behind a paper star on a pole and a guitar, from the church gate down the plaza lane, along the back lane and up the market lane, stopping 45 s to sing at each door (the Christian homes and three more), back to the gate, a minute's rest, out again (about 9 minutes a round). Seen only, no singing played. Stay in when it rains | Plaza lane, back lane, market lane | `christmas.carols` |
| Dec 24, 5:00 – 7:00 PM | Christmas Eve service (the congregation, pastor, choir and pianist, as on Sunday) | Kachin Baptist church | `christmas.services` |
| Dec 25, 9:00 – 11:30 AM | Christmas Day service | Kachin Baptist church | `christmas.services` |
| All year | Weather by season, changing every 3 hours: rain May–Oct, cool clear days and misty mornings Nov–Feb, smoky haze Mar–Apr | Everywhere outside | `weather` |

## Known overlaps

- The seven-day market closes at 9 PM, but the evening townsfolk still browse its aisles until 10 PM.

## Seeing an event at any time

Add one of these to the address, e.g. `http://localhost:8000/?procession=1`:

| Event | Switch it on | Switch it off |
|---|---|---|
| Procession (short 20 s stops, then it starts again from the gate; runs even in rain) | `?procession=1` | `?procession=0` |
| Shan Kathin (the real walking pace, then they stand at the monastery and it starts again from Haw Kham; runs even in rain) | `?kathin=1` | `?kathin=0` |
| Fire balloons (even in rain) | `?balloons=1` (the kind for the light), `?balloons=day`, `?balloons=night` | `?balloons=0` |
| Fire lotus towers (even in rain) | `?firelotus=1` | `?firelotus=0` |
| Festival ground lights (shown only while it is dark) | `?festivallights=1` | `?festivallights=0` |
| Lotus lanterns round the main stupa | `?lotuslanterns=1` | `?lotuslanterns=0` |
| Seven-day market and food street | `?stalls=1` | `?stalls=0` |
| Morning market | `?morningMarket=1` | `?morningMarket=0` |
| Church service | `?service=1` | `?service=0` |
| Townsfolk | `?townsfolk=1` | `?townsfolk=0` |
| Stage | `?dancers=solo`, `pair`, `to`, `twoTo`, `toKinnara` or `singer` | `?dancers=0` |
| Kung fu ground | `?lionDragon=dragon` or `?lionDragon=lion` | `?lionDragon=0` |
| Halloween | `?halloween=1` | `?halloween=0` |
| Christmas dressing (church, compound, star poles) | `?christmas=1` | `?christmas=0` |
| Carol singers (on their own clock from the church gate; runs even in rain) | `?carols=1` | `?carols=0` |
| Harvest thanksgiving gifts in the church | `?harvest=1` | `?harvest=0` |
| Weather | `?weather=clear`, `cloudy`, `rain`, `mist` or `haze` | |
