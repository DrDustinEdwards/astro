# astro

Packages for [Astro](https://astro.build) and [EmDash](https://github.com/emdash-cms/emdash) sites,
by Dustin Edwards. Each is published to npm on its own.

| Package | What it does |
|---|---|
| [enarratio-astro](packages/enarratio-astro#readme) | Accessible charts in Astro pages and Markdown, drawn on the server by [Enarratio](https://github.com/DrDustinEdwards/enarratio). |
| [enarratio-emdash](packages/enarratio-emdash#readme) | The same charts as a Chart block in EmDash's editor (a native EmDash plugin). |

## Development

Node.js 22.23.4 or later (`.nvmrc` has the version CI uses).

```sh
npm ci
npm run check        # build, typecheck, Biome, unit and render tests for every package
```

The tests render the components in Astro's container. `demo/` is an EmDash site with every kind of
chart: an EmDash post, a page using the component and a Markdown page. CI installs the packed
packages into it as a site would, builds it, serves it and reads each page (`demo/check.mjs`).
To run it locally:

```sh
npm run build
npm pack --workspaces --pack-destination demo
cd demo
npm ci
npm install --no-save ./enarratio-astro-*.tgz ./enarratio-emdash-*.tgz
npm run setup
npm run build
node check.mjs
npm start            # http://localhost:4321
```

`npx astro dev` in `demo/` serves the EmDash editor at `/_emdash/admin`; locally,
`/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin` signs in.

Releases: [docs/releasing.md](docs/releasing.md).

## License

[MIT](LICENSE). Copyright (c) 2026 Dustin Edwards.
