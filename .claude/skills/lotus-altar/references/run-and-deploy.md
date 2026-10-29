# Run, test and deploy

## Build and run

```bash
cd lotus-temple && bash build-dist.sh          # builds dist/
python3 -m http.server -d dist 8000            # then open http://localhost:8000
```

The statue worker is fetched by URL, so serve over HTTP rather than opening the file directly.

## Testing

There are no automated tests. Load the page, visit the affected place, and watch the console for errors.
Useful address flags: `?halloween=1|0`, `?weather=rain|clear|cloudy|mist|haze`, `?townsfolk=1|0`, `?police=1|0`.

Headless check on this machine (snap Chromium can't write to `/tmp`, so save screenshots under `$HOME`):

```bash
chromium --headless=new --no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader \
  --enable-logging=stderr --virtual-time-budget=14000 --window-size=1200,800 \
  --screenshot=$HOME/shot.png "http://localhost:8000/?weather=rain" 2>&1 | grep CONSOLE
```

The page opens in the floor-1 hall; to test outside, serve a throwaway copy of `dist/index.html` with a script that
clicks `#outsideBtn` and then `#fpBtn`, and delete it afterwards. Software rendering is slow (a minute or more per
shot), and headless can't play audio.

## Deploy

Vercel builds from `lotus-temple/` (`vercel.json` runs `bash build-dist.sh`, serves `dist/`). The `guanyin.glb` scan is
not in the repo; `build-dist.sh` copies it only if present.
