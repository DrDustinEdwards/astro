# Releasing

Each package is released on its own, tagged `<package>@<version>` (for example
`enarratio-astro@0.1.0`). enarratio-emdash depends on an exact enarratio-astro version, so when
both change, enarratio-astro is released first.

## First release of a package (once, by hand)

npm lets a package use trusted publishing only after it exists, so its first version is published
from a maintainer's machine, signed in to npm with 2FA. For both packages, enarratio-astro first:

```sh
git checkout main
git pull
npm ci
npm run check
npm publish --workspace packages/enarratio-astro --access public
npm publish --workspace packages/enarratio-emdash --access public
```

Then, for each package on npmjs.com, open its Settings, add a trusted publisher (GitHub Actions,
repository `DrDustinEdwards/astro`, workflow `release.yml`), and set publishing access to require
2FA and disallow tokens. Finally, create the GitHub releases for the versions published by hand
(Actions > Release > Run workflow tags them and skips npm, which already has them).

## Every later release

1. Add the version's section to the package's `CHANGELOG.md` (`## [x.y.z] - date`) and bump
   `version` in its `package.json` (for enarratio-emdash, also `VERSION` in `src/index.ts`; for
   enarratio-astro, also the version enarratio-emdash depends on, with an enarratio-emdash
   release).
2. Merge the pull request. The Release workflow tags `<package>@x.y.z`, publishes the GitHub
   release with the CHANGELOG section, and stages the package on npm.
3. Approve it on npmjs.com (Staged Packages tab), or with `npm stage list <package>` and
   `npm stage approve <stage-id>`. When both packages were staged, approve enarratio-astro first.
