# Changelog

All notable changes to enarratio-astro are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/). Before 1.0.0, a minor version may change the options;
every such change is listed here.

## [Unreleased]

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
