# AGENTS.md

Instructions for AI coding agents working in this repo. Claude Code users get the fuller version as the
`lotus-altar` skill in `.claude/skills/lotus-altar/` (`SKILL.md` plus topic files in `references/`); session-to-session state lives in `CONTINUUM.md`, and lessons learned the hard way (gotchas, headless testing) in `MEMORY.md`.

## Project

Lotus Altar: an interactive 3D Buddhist temple in the browser. Visitors walk the grounds, climb a seven-floor pagoda,
buy offerings and place them at Guanyin's altar, recite, draw fortune sticks, and explore a Northern Shan State town,
market and stupa hill. All code is in `lotus-temple/`.

## Stack and constraints

- Plain HTML, CSS and JavaScript. No bundler, no npm, no ES modules.
- Three.js **r128** loaded as the global `THREE` from a CDN, with `OrbitControls` and `GLTFLoader` from
  `three@0.128.0/examples/js`. Use only APIs that exist in r128.
- `lotus-altar.html` is a page **body** (no doctype or head), written to publish as a claude.ai Artifact.
  `build-dist.sh` wraps it into a full `dist/index.html` for Vercel.
- Don't edit `dist/` (generated, gitignored).

## Layout

| File | Role |
|---|---|
| `lotus-temple/lotus-altar.html` | HUD, panels, dialogs, script load order |
| `lotus-temple/lotus-altar.js` | Main app: `CONFIG`, `ITEMS`, shared helpers, floor 1 hall, cameras, walking, sky, festivals, shop UI, frame loop |
| `lotus-temple/temple-floors.js` | `window.TempleFloors(ctx)`: floors 2–7, side buildings, the whole outdoor world and terrain |
| `lotus-temple/statue-sculpt.js` | Statues as signed distance fields, meshed in a Web Worker |
| `lotus-temple/four-face-top.js` | Shan four-animal spinning-top mini-game (tokens only) |
| `lotus-temple/lotus-altar.css` | Styles and colour tokens |
| `lotus-temple/build-dist.sh`, `vercel.json` | Build and deploy |

## Build and run

```bash
cd lotus-temple && bash build-dist.sh
python3 -m http.server -d dist 8000   # open http://localhost:8000
```

Serve over HTTP; the statue worker is fetched by URL. There are no automated tests. Check changes by loading the page
and visiting the affected place, and watch the browser console for errors.

## Conventions

- Units are metres; statues face `+z`. Every hall shares floor 1's footprint (statue at `z = -1.7`, offering table at
  `y = 1.1, z = .75`).
- Static, repeated, unclickable parts go through `part()` + `bakeParts()` so they become instanced meshes.
- Layout randomness uses the seeded `rng(seed)`, not `Math.random()`.
- Tweakable values go in `CONFIG` with a trailing comment.
- The temple's clock is Bangkok time (ICT, UTC+7).
- `localStorage` access is always wrapped in try/catch.
- Match the existing style: dense one-line helpers, plain-English comments that describe what a thing is in the world,
  section banners `/* ---------- name ---------- */`.

## Rules

- Payments and donations are demo only. Never add real payment collection.
- Keep religious and cultural details accurate and respectful (Chinese hall names, Pali terms, Burmese and Shan text).
- Burmese and Shan are both accepted for signs, boards and labels. Both are written in Myanmar script (Unicode block U+1000–U+109F;
  Shan uses its own letters there, such as ၸ ၼ ႁ ႉ). Use real Unicode, not Zawgyi; render them with Noto Sans Myanmar; mark HTML
  text `lang="my"` for Burmese and `lang="shn"` for Shan. Never pass Burmese off as Shan or the other way round, and note Shan
  wording in `CONTINUUM.md` for a native speaker to check.
- Every statue hall gets the same offering altar as Guanyin's (water, light, incense, fruit) through `shrine()`.
- The beat officer (police chase) stays commented out unless the user asks for him back.
- Respect `prefers-reduced-motion` and label interactive controls for screen readers.
- Commit and push straight to `main`. Commit subjects are short, imperative and describe the change in the world.
- After a meaningful change, update `CONTINUUM.md`. When you learn a lasting gotcha, add it to `MEMORY.md`.
