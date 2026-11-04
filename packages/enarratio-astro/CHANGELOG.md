# Changelog

All notable changes to enarratio-astro are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/). Before 1.0.0, a minor version may change the options;
every such change is listed here.

## [Unreleased]

### Removed

- `parseChartBlock` is no longer exported from `enarratio-astro/markdown`. It was undocumented; use the
  `remarkCharts` or `satteriCharts` plugin instead.

## [0.4.2] - 2026-11-03

### Changed

- Draws with Enarratio 0.7.3: charts no longer move the page when the enhancement layer loads. The redraw keeps the
  height the server drawing showed, a legend entry has its button's box before it is a button, and an interactive
  chart's figure holds the controls the layer adds (Show table, Play as sound, the downloads), inert until it
  arrives.
- A chart that is not interactive leaves those controls out (Enarratio's `controls: false`), since no layer ever
  makes them work. `renderChart` takes a second argument, `{ interactive }`, for this; it defaults to true, as
  Enarratio does.

## [0.4.1] - 2026-11-03

### Changed

- Draws with Enarratio 0.7.2: timeline text never renders under 12 px.
- Requires Node.js 22.22 or later (was 22.16), the floor Astro 7.4 sets.

## [0.4.0] - 2026-11-01

### Changed

- Draws with Enarratio 0.7.0 (0.6.0's phone drawings and Play as sound, and 0.7.0's tactile SVG download and
  forced-colors legend swatches).

### Release

- Staging works: the release job's setup-node moves from v4 to v7, whose v4 placeholder `NODE_AUTH_TOKEN` was sent
  in place of the trusted-publishing token (E401 on 0.2.0, 0.2.1 and 0.3.0, so 0.1.0 is the newest on npm).

- Each release's `npm pack` tarball gets a GitHub artifact attestation beside npm's provenance:
  `gh attestation verify enarratio-astro-<version>.tgz --repo DrDustinEdwards/astro` checks a download.

## [0.3.0] - 2026-10-31

### Changed

- Draws with Enarratio 0.5.0: axis titles clear of the ticks, ticks thinned to fit, the y range rounded to the
  drawn ticks, proportional tick figures, text-safe series ink in the Capsomer theme, and Download SVG and PNG
  through `enarratio/enhance`.
- First release on npm since 0.1.0: 0.2.0 and 0.2.1 were tagged but never reached npm, because trusted
  publishing was not yet set up.

## [0.2.1] - 2026-10-31

### Changed

- Draws with Enarratio 0.4.1: capitalized summaries, ranges said with their unit, day ticks for
  whole-day data, and linked bars whose links sit in the data table.

## [0.2.0] - 2026-10-31

### Changed

- Draws with Enarratio 0.4.0: a head with the title and the finding, a summary under the chart, a
  CSV download, and wide charts that scroll sideways on a phone. The base styles now set system
  colors under forced colors.

### Added

- `subtitle`, `notes`, `source`, `sourceHref`, `byline`, `xUnit` and `yUnit`, as props and as
  Markdown keys.

## [0.1.0] - 2026-10-24

### Added

- `<Chart>`: bar, line, stacked area, scatter and heatmap charts drawn on the server by Enarratio
  0.3.1, from rows or from CSV, semicolon- or tab-separated text, with a required description, a
  data table, and light and dark themes. The chart CSS is written once per page.
- Charts in Markdown: `chart` code blocks, with `satteriCharts()` for Sätteri and `remarkCharts`
  for remark.
- `<Enhance />` and the `interactive` option: Enarratio's enhancement script, only on pages that
  ask for it.
- `styles`: `"theme"` (default), `"base"` for sites whose tokens define the colors, or `"none"`.
- A note in place of a chart that cannot be drawn, saying why.
