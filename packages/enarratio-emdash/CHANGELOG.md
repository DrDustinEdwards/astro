# Changelog

All notable changes to enarratio-emdash are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/). Before 1.0.0, a minor version may change the options or
the saved block's fields; every such change is listed here.

## [Unreleased]

## [0.6.0] - 2026-11-11

### Changed

- Draws with enarratio-astro 0.6.0 (Enarratio 0.12.1): one toolbar above the chart (Sound, Range, Download), the data table visually hidden for screen readers and AI agents, and the quieter chart design.

### Removed

- The block's Data table field (`dataTable`). Saved charts that have it still render: the stored value is ignored, and every chart's table is visually hidden.

## [0.5.0] - 2026-11-08

### Added

- A "Language" field on the Chart block (`lang`, optional): the language of the chart's text as a BCP 47 tag, so screen readers switch voice when it differs from the page's. Blocks saved earlier have no value and are unchanged.

### Changed

- Draws with enarratio-astro 0.5.0 and Enarratio 0.10.0.

## [0.4.5] - 2026-11-07

### Changed

- Draws with enarratio-astro 0.4.5 and Enarratio 0.9.2. No block field changes.

## [0.4.4] - 2026-11-07

### Changed

- Draws with enarratio-astro 0.4.4. No block field changes.

## [0.4.3] - 2026-11-07

### Changed

- The `astro` peer dependency is `>=6` and `emdash` is `>=1.0.0` (were exactly `7.4.4` and `1.4.0`), as the README says. Draws with
  enarratio-astro 0.4.3. No block field changes.

## [0.4.2] - 2026-11-03

### Changed

- Draws with enarratio-astro 0.4.2 (Enarratio 0.7.3: a chart no longer moves the page when the enhancement layer
  loads, and a block that is not interactive shows no controls waiting for it). No block field changes.

## [0.4.1] - 2026-11-03

### Changed

- Draws with enarratio-astro 0.4.1 (Enarratio 0.7.2: timeline text never renders under 12 px).
- Requires Node.js 22.22 or later (was 22.16), the floor Astro 7.4 sets.

## [0.4.0] - 2026-11-01

### Changed

- Built on enarratio-astro 0.4.0 (Enarratio 0.7.0). No block field changes.

### Release

- Staging works: the release job's setup-node moves from v4 to v7 (see enarratio-astro 0.4.0).

- Each release's `npm pack` tarball gets a GitHub artifact attestation beside npm's provenance:
  `gh attestation verify enarratio-emdash-<version>.tgz --repo DrDustinEdwards/astro` checks a download.

## [0.3.0] - 2026-10-31

### Changed

- Built on enarratio-astro 0.3.0 (Enarratio 0.5.0). No block field changes.
- First release on npm since 0.1.0: 0.2.0 and 0.2.1 never reached npm, because trusted publishing was not yet
  set up.
- The Data field's placeholder example and the README's theme example use neutral names.

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
