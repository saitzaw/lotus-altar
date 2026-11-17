# Schedule

Every timed event in the Lotus Altar world, in one place. All times are Bangkok time (ICT, UTC+7), the temple's clock.
Day and night follow the real sun and moon over Bangkok.

The hours themselves live in `CONFIG` in `lotus-temple/src/lotus-altar/00-helpers-and-config.js`. When an event is added or its
hours change, update this file in the same commit.

## Every day

| Time | What happens | Where | `CONFIG` |
|---|---|---|---|
| 5:00 – 9:00 AM | Morning market: village women sell greens, chillies and limes on the ground | Seven-day market | `morningMarket` |
| 8:00 – about 9:25 AM | Shinlaung procession (Poy Sang Long): gift poles and streamer poles in front, the boys on their carriers' shoulders, the families, then the kinnara, the to, and the Shan band (long drums, gongs, cymbals) at the back. It stops 15 min to dance at five places on the way. Called off while it rains | Gate → front street → market lane → Haw Kham road → second monastery | `procession` |
| about 9:25 – 11:00 AM | Shinlaung gathered: the three boys on their carriers' shoulders in a row before the monastery's stair, the families and pole bearers crowded round them; the kinnara, the to and the band dance and play on the festival ground. All go home at 11 | Second monastery; festival ground | `procession` |
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
| 8:00 AM – 3:00 PM | Day balloons (a painted rooster, a balloon painted with a deva, and a fish, parrot, bear and tiger) fill over their fire pits and go up in turn, one about every minute (a 3-minute cycle on each of three pads, a different balloon each time). A crowd sits on the terraces and stands along the field, with a team at each fire pit. A balloon already rising at 3 PM flies on; none is filled after | Fire balloon ground, stupa hill's lower terrace | `balloons.day` |
| 6:00 PM – 2:00 AM | Night balloons go up in turn on the same three pads: a lantern balloon studded with candle lanterns in flowers, a stupa in lanterns hanging below it; a painted balloon with crowned dancers; a flower-painted fireworks balloon (စိန်နားပန်) that showers sparks as it climbs. The crowd lets go small paper sky lanterns while it is dark, about one every 1.1 s, each held up for 6 s in a launcher's hands (about 35 people on the field by the parapet, 30 on the top three terrace steps) and drifting up over the town for about 3 minutes. From 3 to 6 PM and 2 to 8 AM the fire pits are cold and the crowd is gone. With reduced motion the balloons stay full on their pads and the lanterns hang still. None go up while it rains | Fire balloon ground | `balloons.night` |

## Once a week

| Day and time | What happens | Where | `CONFIG` |
|---|---|---|---|
| Sunday 9:00 – 11:30 AM | Church service: congregation, pastor, choir, pianist | Kachin Baptist church | `service` |

## By season

| When | What happens | Where | `CONFIG` |
|---|---|---|---|
| The 30 days before Chinese New Year | Dragon dance training 6–9 AM and 9–10 PM; lion dance training 9:30–11 AM and 6–8 PM. Quiet on New Year's day | Kung fu ground | `lionDragon` |
| Oct 27 – Nov 1 (Halloween) | Houses go dark 9 PM – 5 AM, a friendly ghost walks the roads, walkers carry a torch | Town | `halloween` |
| All year | Weather by season, changing every 3 hours: rain May–Oct, cool clear days and misty mornings Nov–Feb, smoky haze Mar–Apr | Everywhere outside | `weather` |

## Known overlaps

- The seven-day market closes at 9 PM, but the evening townsfolk still browse its aisles until 10 PM.

## Seeing an event at any time

Add one of these to the address, e.g. `http://localhost:8000/?procession=1`:

| Event | Switch it on | Switch it off |
|---|---|---|
| Procession (short 20 s stops, then it starts again from the gate; runs even in rain) | `?procession=1` | `?procession=0` |
| Fire balloons (even in rain) | `?balloons=1` (the kind for the light), `?balloons=day`, `?balloons=night` | `?balloons=0` |
| Seven-day market and food street | `?stalls=1` | `?stalls=0` |
| Morning market | `?morningMarket=1` | `?morningMarket=0` |
| Church service | `?service=1` | `?service=0` |
| Townsfolk | `?townsfolk=1` | `?townsfolk=0` |
| Stage | `?dancers=solo`, `pair`, `to`, `twoTo`, `toKinnara` or `singer` | `?dancers=0` |
| Kung fu ground | `?lionDragon=dragon` or `?lionDragon=lion` | `?lionDragon=0` |
| Halloween | `?halloween=1` | `?halloween=0` |
| Weather | `?weather=clear`, `cloudy`, `rain`, `mist` or `haze` | |
