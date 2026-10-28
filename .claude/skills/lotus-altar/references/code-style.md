# Code style

- Match the existing dense style: compact one-line helpers, `const` arrow functions, short local names in geometry code.
- Comments are plain English describing what a thing is in the world ("the far side of the front street: ..."), not
  what the code does.
- Section banners: `/* ---------- name ---------- */`.
- Tweakable values go in `CONFIG` with a trailing comment.
- Deterministic randomness uses the seeded `rng(seed)`; `Math.random()` only for things that don't need to look the same
  every visit (sparkles, sound timing).
- Visitor state persists in `localStorage` (`lotus-altar-v2`, `lotus-altar-daylight`, `lotus-altar-tokens`), always
  wrapped in try/catch.
- Things that read `current`, `inMarket` or `inCorridor` must only run from the frame loop or event handlers: those are
  `let`s declared partway down `lotus-altar.js`, so touching them during top-level setup throws.
