# Clock, sky, festivals and weather

## The temple's clock

Bangkok time, `Asia/Bangkok`, shown as ICT (UTC+7) (`CONFIG.sky`). Anything that depends on the date or hour reads this
clock through `Intl.DateTimeFormat` with `timeZone: CONFIG.sky.tz`, never the visitor's local time.

## Sun, moon, day and night

- `updateCelestial()` places the real sun and moon for Bangkok (after SunCalc) every 5 minutes.
- `daylight` (0 night, 1 day) is the visitor's Day/Night toggle, saved in `localStorage` `lotus-altar-daylight`.
- `skyColors()` sets the sky and fog colour outside; `applySky()` also sets exposure, calls `temple.setDaylight(d)` and
  refreshes the HUD lines.

## Halloween

Runs Oct 27 – Nov 1 (`CONFIG.halloween`). Houses and village huts go dark at 9 PM ICT until 5 AM, a friendly ghost walks
the roads. `?halloween=1` / `?halloween=0` force it.

## The torch

Walking outside at night shows `#torchBtn` (and **T** toggles it). On Halloween night the torch starts on, any other
night off; `torchChoice` holds the walker's choice (null = follow the night) and resets when the walk or the night ends.
The light is one `SpotLight` always in the scene (adding a light later would recompile every material), dark when off.

## Weather

- Follows the seasons of the northern Thai hills; no live weather API. Kinds (in `WEATHER`): `clear`, `cloudy`, `rain`,
  `mist`, `haze`. Each has a fog factor, a sky tint and its strength, rain (0–1) and wind (0–1).
- `weatherNow()` picks one per `CONFIG.weather.spell` hours from that month's odds (`CONFIG.weather.odds`, rows Jan–Dec,
  columns clear/cloudy/rain/mist/haze), using a hash of the date so every visitor sees the same sky. Mist is likelier from
  4 to 10 AM.
- `weatherStep(dt)` eases the current weather (`wx`) toward the target, sets fog distance and exposure outside, and moves
  the rain streaks (`rainLines`, a box that follows the camera, hidden under reduced motion).
- `skyColors()` blends `wx.tint` into the sky and fog. The HUD line is `#weatherInfo`, filled by `weatherNote()`.
- `?weather=rain` (or `clear`, `cloudy`, `mist`, `haze`) forces one.
- Weather only shows outside (`current === "pagoda"` or a corridor); indoors keeps its own lamplit fog.
