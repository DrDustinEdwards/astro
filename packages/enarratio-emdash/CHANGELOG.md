# Changelog

All notable changes to enarratio-emdash are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/). Before 1.0.0, a minor version may change the options or
the saved block's fields; every such change is listed here.

## [Unreleased]

## [0.2.1] - 2026-10-31

### Changed

- Built on enarratio-astro 0.2.1 (Enarratio 0.4.1).

## [0.2.0] - 2026-10-31

### Changed

- Draws with enarratio-astro 0.2.0 (Enarratio 0.4.0): a head with the title and the finding, a
  summary under the chart, a CSV download, and wide charts that scroll sideways on a phone. The
  caption field is now labeled for method or caveats; the source has its own field.

### Added

- Fields `subtitle`, `notes`, `source`, `sourceHref`, `byline`, `xUnit` and `yUnit`. Blocks saved by
  0.1.0 draw as before.

## [0.1.0] - 2026-10-24

### Added

- The Chart block for EmDash's Portable Text editor: bar, line, stacked area, scatter and heatmap
  charts drawn on the server by enarratio-astro 0.1.0 (Enarratio 0.3.1) from pasted CSV or
  spreadsheet data, with a required description, a data table, and light and dark themes.
- Optional interactivity per chart, from Enarratio's enhancement script, added only to pages with
  an interactive chart.
- `enarratioPlugin({ styles })`: `"theme"` (default), `"base"` for sites whose tokens define the
  colors, or `"none"`.
- A note in place of a chart that cannot be drawn, saying why.
