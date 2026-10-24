# CLAUDE.md - astro

Dustin's packages for Astro and EmDash sites, an npm workspace under `packages/`, each published to npm on its own: `enarratio-astro` (charts in Astro pages and Markdown) and `enarratio-emdash` (the EmDash Chart block, built on enarratio-astro). Public MIT repo, separate from Enarratio so Enarratio's JOSS submission stays Enarratio alone. `README.md` and each package's README are how it works.

## Rules

- Tests: keep the minimal set (a few browser tests for flows that must never break, one integration test per real behaviour, unit tests only for tricky logic, shared code tested once where it lives), and remove any test that pins design, repeats coverage or has never caught a real mistake, unless it guards a harm that cannot be undone.
- The EmDash block's field names (`action_id`s in `packages/enarratio-emdash/src/block.ts`) are stored in sites' content. Renaming one breaks saved charts, so it needs a fallback for the old name and a CHANGELOG entry.
- Keep `VERSION` in `packages/enarratio-emdash/src/index.ts` equal to its package.json version (a test checks), and enarratio-emdash's `enarratio-astro` dependency equal to enarratio-astro's version.

## Commands

- `npm run check`: build, typecheck, Biome lint and tests.
- The demo site check (CI's `site` job) is in README, Development. It needs Node.js 22.23.4 or later.

## Releases

Merging a version bump to `main` tags it and stages it on npm (`.github/workflows/release.yml`); Dustin approves it on npm with 2FA. Steps: `docs/releasing.md`.
