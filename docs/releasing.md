# Releasing

## First release (once, by hand)

npm lets a package use trusted publishing only after it exists, so 0.1.0 is published from a
maintainer's machine, signed in to npm with 2FA:

```sh
git checkout main
git pull
npm ci
npm run check
npm publish --access public
```

Then, on npmjs.com, open the package's Settings, add a trusted publisher (GitHub Actions,
repository `DrDustinEdwards/enarratio-emdash`, workflow `release.yml`), and set publishing access
to require 2FA and disallow tokens.

## Every later release

1. Add the version's section to `CHANGELOG.md` (`## [x.y.z] - date`) and bump `version` in
   `package.json` and `VERSION` in `src/index.ts`.
2. Merge the pull request. The Release workflow tags `vx.y.z`, publishes the GitHub release with
   the CHANGELOG section, and stages the package on npm.
3. Approve it on npmjs.com (Staged Packages tab), or with `npm stage list enarratio-emdash` and
   `npm stage approve <stage-id>`.
