---
name: lotus-altar
description: Project metadata and working conventions for Lotus Altar, a Three.js 3D Buddhist temple site (Guanyin pagoda, temple grounds, Northern Shan State town and market). Use for any change to the lotus-temple/ site: adding or moving scene objects, floors, buildings, statues, offerings, festivals, weather, sound, UI panels, performance work, or building and deploying it.
---

# Lotus Altar

An interactive 3D temple in the browser. Visitors open at the pagoda gate, walk the grounds in first person, climb a
seven-floor pagoda, buy offerings at the temple shop and place them at Guanyin's altar, recite, draw fortune sticks,
donate (demo only), and wander a Northern Shan State town, seven-day market, stupa hill and festival ground.

- **Repo:** `/home/alex/MyProjects/lotus-altar`, everything lives in `lotus-temple/`
- **Stack:** plain HTML/CSS/JS, no bundler, no npm, no ES modules. Three.js **r128** as a global `THREE`; use only r128 APIs.
- **State between sessions:** read `CONTINUUM.md` at the start, add a log entry after a meaningful change.

## Rules (always)

- Payments and donations are demo only: no payment is collected, and the UI says so. Keep it that way.
- Treat religious and cultural content with respect and accuracy: Chinese hall names (`han`), Pali terms, Burmese and Shan text.
  Fortune verses are original to this shrine and the UI says they aren't the classical ones.
- Burmese and Shan are both accepted for signs, boards and labels. Both use Myanmar script (U+1000–U+109F; Shan has its own
  letters there, such as ၸ ၼ ႁ ႉ). Use real Unicode, never Zawgyi; render with Noto Sans Myanmar; mark HTML text `lang="my"`
  (Burmese) or `lang="shn"` (Shan). Don't swap one language for the other, and log new Shan wording in `CONTINUUM.md` for a
  native speaker to check.
- Every statue hall gets Guanyin's offering altar (water, light, incense, fruit) through `shrine()` (see references/scene.md).
- The beat officer (police chase) stays commented out unless the user asks for him back.
- Respect `prefers-reduced-motion` (`reduceMotion`) and label buttons for screen readers.
- Layout randomness uses the seeded `rng(seed)`, never `Math.random()`. `localStorage` is always wrapped in try/catch.
- Don't edit `dist/` (generated, gitignored).
- Git: commit and push straight to `main`, no feature branches. Subjects are short, imperative, plain English about the
  world ("Move the field hut out of the fuel station forecourt").

## Read the reference you need

| When you are… | Read |
|---|---|
| finding which file holds what, or the script load order | [references/files.md](references/files.md) |
| adding or moving anything in the 3D world (halls, outdoor places, clickables, performance) | [references/scene.md](references/scene.md) |
| touching the clock, sun and moon, day/night, festivals or weather | [references/sky-and-weather.md](references/sky-and-weather.md) |
| adding or changing sounds (chant, bells, ambience) | [references/sound.md](references/sound.md) |
| adding anything to the outdoor world, frame loop or audio, or making the site faster | [references/optimization.md](references/optimization.md) |
| writing code, to match the house style | [references/code-style.md](references/code-style.md) |
| building, running, testing or deploying | [references/run-and-deploy.md](references/run-and-deploy.md) |

When you change how something works, update the reference file for that topic in the same commit.
