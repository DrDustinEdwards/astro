# CLAUDE.md - astro

Dustin's packages for Astro and EmDash sites, an npm workspace under `packages/`, each published to npm on its own: `enarratio-astro` (charts in Astro pages and Markdown) and `enarratio-emdash` (the EmDash Chart block, built on enarratio-astro). Public MIT repo, separate from Enarratio so Enarratio's JOSS submission stays Enarratio alone. `README.md` and each package's README are how it works.

## Rules every repo shares

- **Tests.** Keep the minimal set (a few browser tests for flows that must never break, one integration test per real behavior, unit tests only for tricky logic, shared code tested once where it lives), and remove any test that pins design, repeats coverage or has never caught a real mistake, unless it guards a harm that cannot be undone.
- **UI copy.** Let the layout explain. No eyebrows, restating subtitles, "this page lets you" intros, descriptions under obvious buttons, hints a label already gives, repeated captions or empty-state essays; labels, accessible names, errors, one-way warnings and legal text stay (Dustin, 2026-11-18; Capsid capsid/conventions.md).
- **Shared code.** Before writing anything another site might have, read https://github.com/DrDustinEdwards/devkit/blob/shared-list/SHARED.md (CI's shared-code check fails on a copy). Change shared code in place and delete what a change replaces in the same PR.
- **Browser support.** devkit's docs/browser-support.md (Baseline Widely available freely; Newly available with a small fallback; Limited only feature-detected; no polyfills).
- **Secrets.** Never commit or print a key, token, `.dev.vars` or `.env`.
- **Reproduce first.** A report that something is broken names a cause; reproduce the failure before fixing it, and report red before and green after.

## Rules for this repo

- The EmDash block's field names (`action_id`s in `packages/enarratio-emdash/src/block.ts`) are stored in sites' content. Renaming one breaks saved charts, so it needs a fallback for the old name and a CHANGELOG entry.
- Keep enarratio-emdash's `enarratio-astro` dependency equal to enarratio-astro's version.

## Commands

- `npm run check`: build, typecheck, Oxlint and tests.
- The demo site check (CI's `site` job) is in README, Development. It needs Node.js 22.23.4 or later.

## Releases

Merging a version bump to `main` tags it and stages it on npm (`.github/workflows/release.yml`); Dustin approves it on npm with 2FA. Steps: `docs/releasing.md`.
