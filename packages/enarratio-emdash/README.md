# enarratio-emdash

**Accessible charts for [EmDash](https://github.com/emdash-cms/emdash) sites, drawn on the server by
[Enarratio](https://github.com/DrDustinEdwards/enarratio).**

The plugin adds a **Chart** block to EmDash's Portable Text editor. An editor types `/chart`, pastes
data from a spreadsheet (or types CSV), writes one sentence saying what the chart shows, and names
the columns to plot. The published page gets the chart as HTML and SVG: complete before any script
runs, readable by screen readers and search engines, with a data table, and in light and dark.

It draws bar (stacked, side by side, vertical or horizontal; counting rows when no value column is
given), line, stacked area, scatter (with an optional regression line and 95% band) and heatmap
charts. A chart can be made interactive: hover and focus details, keyboard navigation, and
click-to-filter, from Enarratio's small enhancement script, which is added only to pages that have
an interactive chart.

Supports EmDash 1.0 or later and Astro 6 or later. Status: 0.x, so options may change before 1.0;
every change is in the [changelog](https://github.com/DrDustinEdwards/astro/blob/main/packages/enarratio-emdash/CHANGELOG.md).

## Install

```sh
npm install enarratio-emdash
```

Register it in `astro.config.mjs`, then build and deploy the site:

```js
import emdash from "emdash/astro";
import { enarratioPlugin } from "enarratio-emdash";

export default defineConfig({
  integrations: [
    emdash({
      // ...your database and storage
      plugins: [enarratioPlugin()],
    }),
  ],
});
```

Nothing else is needed: EmDash adds the plugin's renderer to its `<PortableText>` component.

## Why a native plugin

EmDash runs registry plugins in a sandbox, and sandboxed plugins cannot render on public pages. A
block that draws on the page needs an Astro component loaded when the site builds, which only a
native plugin (an npm package listed in `astro.config.mjs`) can provide. Native plugins run with the
site's authority. This one declares no capabilities, makes no network requests and stores nothing:
it only reads the block an editor saved and draws it.

## The Chart block

| Field | Used by | Notes |
|---|---|---|
| Chart | all | Bar, Line, Area (stacked), Scatter or Heatmap. |
| Title | all | Shown above the chart. Optional. |
| Description | all | **Required.** What the chart shows and finds, in a sentence. It names the chart for screen readers. |
| Data | all | CSV, semicolon-separated, or pasted from a spreadsheet (tab-separated). The first row names the columns. Numbers such as `1,234` (quoted in CSV) are read as numbers; an empty cell is a gap. Up to 5000 rows and 50 columns. |
| Column along the x axis | all | Column names match without regard to case. Line and area charts read ISO dates (`2026-03-01`) as a time axis. |
| Column of values (y) | all | Bar charts count rows when it is blank. For a heatmap, the row column. |
| Series column | bar, line, area, scatter | Splits rows into series, told apart by color and by legend, labels or symbols. |
| Heatmap: column of cell values | heatmap | |
| Axis labels, caption | all | Optional. The caption is for source, method or caveats. |
| Bar: several series, direction | bar | Stacked or side by side; vertical or horizontal. |
| y scale | line, scatter | Linear or logarithmic. |
| Regression | scatter | Least-squares line with its 95% confidence band. |
| Data table | all | Behind a "Data table" toggle (default) or hidden for screen readers only. Every chart has one. |
| Interactive | all | Adds Enarratio's enhancement script to the page. Off by default, so pages stay script-free. |

A block that cannot be drawn (a column that is not in the data, text in a number column, a missing
description) is replaced on the page by a short note saying why, and the reason is logged, so one
mistake never breaks the page. Text in every field is escaped.

## Styles

The plugin writes the chart CSS once per page that has a chart. `enarratioPlugin({ styles })` picks
what it writes:

- `"theme"` (default): Enarratio's default theme, in light and dark. Charts follow the page's
  `color-scheme`, so a site with `<meta name="color-scheme" content="light dark">` gets dark charts
  in dark mode.
- `"base"`: Enarratio's layout rules without colors or fonts, for a site whose own design tokens
  define the `--enarratio-*` properties. [Capsomer](https://github.com/DrDustinEdwards/capsomer)'s
  tokens do.
- `"none"`: nothing; the site includes Enarratio's stylesheet itself.

To use your own Enarratio theme, or a theme that switches with an attribute instead of
`color-scheme`, wrap the renderer and pass it to `<PortableText>`, which takes precedence over the
plugin's:

```astro
---
// src/components/SiteChart.astro
import { Chart } from "enarratio-emdash/astro";
import { labTheme } from "../lab-theme";
---
<Chart node={Astro.props.node} theme={labTheme} stylesheetOptions={{ colorScheme: { dark: '[data-theme="dark"]' } }} />
```

```astro
<PortableText value={post.data.content} components={{ type: { enarratioChart: SiteChart } }} />
```

Enarratio's [README](https://github.com/DrDustinEdwards/enarratio#themes) covers themes and the
custom properties.

## How it draws

The block is rendered by [enarratio-astro](https://github.com/DrDustinEdwards/astro/tree/main/packages/enarratio-astro#readme)'s `Chart` component, so a chart
saved in EmDash looks the same as one in an Astro page or a Markdown file. Bar, line and area
charts are drawn by `enarratio/lite`, which builds the SVG as a string with no DOM, the cheapest
render on Cloudflare Workers. Scatter plots and heatmaps load `enarratio/plot` (Observable Plot and
linkedom) only on a page that has one.

Development, the demo site and releases: the [repository README](https://github.com/DrDustinEdwards/astro#readme).

## License

[MIT](LICENSE). Copyright (c) 2026 Dustin Edwards.
