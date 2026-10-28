# Files (`lotus-temple/`)

| File | What it holds |
|---|---|
| `lotus-altar.html` | Page **body only** (no doctype/head): written as a claude.ai Artifact body. HUD, floor nav, action bar, side panel sheets (buy, offer, donate, recite, fortune), four-face-top dialog, walk pad |
| `lotus-altar.js` | Main app (one IIFE). `CONFIG` (top: settings to tweak), `ITEMS` catalogue (offerings, prices, kinds), shared helpers (`mesh`, `lathe`, `std`, `M` materials, `tween`, `tone`), floor 1 hall and altar, camera modes (`applyMode`, `goTo`, `setView`), first-person walking (`walkStep`, `KEYMAP`), sun/moon (`updateCelestial`), day/night (`skyColors`, `applySky`), Halloween (`festNow`, `festStep`), weather (`weatherNow`, `weatherStep`), ambient sound (`ambStart`, `ambStep`), shop/cart/offering UI, fortune sticks, picking/hover, the frame loop |
| `temple-floors.js` | `window.TempleFloors(ctx)`: floors 2–7, Bell Tower, temple hall (蓮華寺, internally `library`), shop, monks' quarters, and the whole outdoor world: pagoda exterior, lotus pond, grounds, Shan town, stream, paddy fields, forest and hills, seven-day market, stupa hill, Shan monasteries, festival ground, street frontage, back lanes, terrain (`groundAt`, `walkAt`, `terrainAt`). Each floor is built lazily on first visit. Its returned object is the API the main script uses (`show`, `update`, `cull`, `activate`, `sounds`, …) |
| `statue-sculpt.js` | Statues as signed distance fields meshed with surface nets, run in a Web Worker (falls back to main thread). Figures: `guanyin`, `medicine`, `shakyamuni`, `maitreya`, `lion`, `lionL` |
| `four-face-top.js` | `FourFaceTopGame`: self-contained Shan four-animal spinning-top mini-game. Festival tokens only, never money |
| `lotus-altar.css` | Styles; colour tokens like `--lotus`, `--water`, `--saffron`, `--flame`, `--smoke` |
| `build-dist.sh` | Wraps the HTML body in a full document into `dist/index.html` and copies the assets. Copies `guanyin.glb` if present |
| `vercel.json` | Vercel build config |

## Script load order

three (cdnjs r128) → `OrbitControls` → `GLTFLoader` (jsdelivr `three@0.128.0/examples/js`) → `four-face-top.js` →
`temple-floors.js` → `lotus-altar.js`.

## Libraries and fonts

- Three.js **r128** global `THREE`; don't use ES modules or newer Three APIs.
- Google Fonts: Marcellus, Figtree, Noto Serif TC (Chinese hall names), Noto Sans Myanmar (Shan/Burmese text).

`dist/` and `.vercel` are gitignored.
