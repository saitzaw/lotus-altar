# Schedule

Every timed event in the Lotus Altar world, in one place. All times are Bangkok time (ICT, UTC+7), the temple's clock.
Day and night follow the real sun and moon over Bangkok.

The hours themselves live in `CONFIG` in `lotus-temple/src/lotus-altar/00-helpers-and-config.js`. When an event is added or its
hours change, update this file in the same commit.

## Every day

| Time | What happens | Where | `CONFIG` |
|---|---|---|---|
| 5:00 – 9:00 AM | Morning market: village women sell greens, chillies and limes on the ground | Seven-day market | `morningMarket` |
| 8:00 – about 9:50 AM | Shinlaung procession (Poy Sang Long): kinnara in front, gift poles, the boys on their carriers' shoulders, the families, the to at the back. It stops 20 min to dance at five places and ends when everyone reaches the monastery | Gate → front street → market lane → Haw Kham road → second monastery | `procession` |
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
| Procession (short 20 s stops, then it starts again from the gate) | `?procession=1` | `?procession=0` |
| Seven-day market and food street | `?stalls=1` | `?stalls=0` |
| Morning market | `?morningMarket=1` | `?morningMarket=0` |
| Church service | `?service=1` | `?service=0` |
| Townsfolk | `?townsfolk=1` | `?townsfolk=0` |
| Stage | `?dancers=solo`, `pair`, `to`, `twoTo`, `toKinnara` or `singer` | `?dancers=0` |
| Kung fu ground | `?lionDragon=dragon` or `?lionDragon=lion` | `?lionDragon=0` |
| Halloween | `?halloween=1` | `?halloween=0` |
| Weather | `?weather=clear`, `cloudy`, `rain`, `mist` or `haze` | |
