# Changelog

All notable changes to enarratio-emdash are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/). Before 1.0.0, a minor version may change the options or
the saved block's fields; every such change is listed here.

## [Unreleased]

## [0.1.0] - 2026-10-24

### Added

- The Chart block for EmDash's Portable Text editor: bar, line, stacked area, scatter and heatmap
  charts drawn on the server by Enarratio 0.3.1 from pasted CSV or spreadsheet data, with a
  required description, a data table, and light and dark themes.
- Optional interactivity per chart, from Enarratio's enhancement script, added only to pages with
  an interactive chart.
- `enarratioPlugin({ styles })`: `"theme"` (default), `"base"` for sites whose tokens define the
  colors, or `"none"`.
- A note in place of a chart that cannot be drawn, saying why.
- `demo/`, a one-post EmDash site that CI builds from the packed plugin.
