# enarratio-astro

**Accessible charts for [Astro](https://astro.build): a `<Chart>` component and charts in Markdown,
drawn on the server by [Enarratio](https://github.com/DrDustinEdwards/enarratio).**

A chart arrives in the page as HTML and SVG: complete before any script runs, readable by screen
readers and search engines, with a data table, and in light and dark. It draws bar (stacked, side
by side, vertical or horizontal; counting rows when no value column is given), line, stacked area,
scatter (with an optional regression line and 95% band) and heatmap charts. A chart can be made
interactive (hover and focus details, keyboard navigation, click-to-filter) with Enarratio's small
enhancement script, which is added only to pages that ask for it.

Supports Astro 6 or later. Status: 0.x, so options may change before 1.0; every change is in the
[changelog](https://github.com/DrDustinEdwards/astro/blob/main/packages/enarratio-astro/CHANGELOG.md). For EmDash sites,
[enarratio-emdash](https://github.com/DrDustinEdwards/astro/tree/main/packages/enarratio-emdash#readme) adds the same charts as a block
in the editor.

## Install

```sh
npm install enarratio-astro
```

## In a page

```astro
---
import Chart from "enarratio-astro/Chart.astro";

const downloads = [
  { month: "2026-05-01", package: "Core", downloads: 410 },
  { month: "2026-06-01", package: "Core", downloads: 530 },
  { month: "2026-05-01", package: "Plugin", downloads: 120 },
  { month: "2026-06-01", package: "Plugin", downloads: 190 },
];
---
<Chart
  type="line"
  data={downloads}
  x="month"
  y="downloads"
  series="package"
  title="Monthly downloads"
  alt="Monthly downloads in May and June 2026: the core grows from 410 to 530, the plugin from 120 to 190."
  interactive
/>
```

`data` is rows as objects (from code, JSON or a content collection; dates become ISO dates) or
text: CSV, semicolon-separated, or pasted from a spreadsheet (tab-separated), first row naming the
columns. The chart CSS is written once per page, however many charts it has.

## In Markdown

A code block whose language is `chart` becomes a chart: options, a line of three dashes, then the
data.

~~~md
```chart
type: bar
x: team
y: tickets
series: status
layout: grouped
alt: Support has the most open tickets; Platform has closed the most.
---
team,status,tickets
Support,Open,14
Support,Closed,22
Platform,Open,5
Platform,Closed,31
```
~~~

Register the plugin for Astro's Markdown processor. Astro 7's default, Sätteri:

```js
// astro.config.mjs
import { satteri } from "@astrojs/markdown-satteri";
import { satteriCharts } from "enarratio-astro/markdown";

export default defineConfig({
  markdown: { processor: satteri({ mdastPlugins: [satteriCharts()] }) },
});
```

With remark (Astro 6, or Astro 7's unified processor):

```js
import { remarkCharts } from "enarratio-astro/markdown";

export default defineConfig({ markdown: { remarkPlugins: [remarkCharts] } });
```

A Markdown chart with `interactive: true` is marked for the enhancement script; include it once in
the page's layout with `<Enhance />` from `enarratio-astro/Enhance.astro`. It finds every
interactive chart on the page and works with view transitions.

## Options

The component's props and a Markdown block's keys are the same:

| Option | Used by | Notes |
|---|---|---|
| `type` | all | `bar` (default), `line`, `area` (stacked), `scatter` or `heatmap`. |
| `data` | all | The data (component only; in Markdown it follows the dashes). Up to 5000 rows and 50 columns. |
| `alt` | all | **Required.** What the chart shows and finds, in a sentence. It names the chart for screen readers. |
| `title`, `caption` | all | Optional. The caption is for source, method or caveats. |
| `x` | all | The column along the x axis. Column names match without regard to case. ISO dates make a time axis in line and area charts. |
| `y` | all | The value column. Bar charts count rows when it is missing. For a heatmap, the row column. |
| `series` | bar, line, area, scatter | Splits rows into series, told apart by color and by legend, labels or symbols. |
| `value` | heatmap | The cell value column. |
| `xLabel`, `yLabel` | all | Axis labels. |
| `layout` | bar | `stacked` (default) or `grouped`. |
| `orientation` | bar | `vertical` (default) or `horizontal`. |
| `scale` | line, scatter | `linear` (default) or `log`. |
| `regression` | scatter | A least-squares line with its 95% band. |
| `dataTable` | all | `details` (default; behind a "Data table" toggle) or `visually-hidden` (screen readers only). |
| `id` | all | The figure's id. |
| `interactive` | all | Adds the enhancement script. Off by default, so pages stay script-free. |

A chart that cannot be drawn (a column that is not in the data, text in a number column, a missing
`alt`) is replaced by a short note saying why, and the reason is logged, so one mistake never
breaks the page. All text is escaped.

## Styles

The component takes `styles`, `theme` and `stylesheetOptions`; the Markdown plugins take the same
as options (`satteriCharts({ styles: "base" })`).

- `styles: "theme"` (default): an Enarratio theme (`theme`, default Enarratio's own), in light and
  dark. Charts follow the page's `color-scheme`; for a site that switches with an attribute, pass
  `stylesheetOptions={{ colorScheme: { dark: '[data-theme="dark"]' } }}`.
- `styles: "base"`: layout rules without colors or fonts, for a site whose own design tokens define
  the `--enarratio-*` properties. [Capsomer](https://github.com/DrDustinEdwards/capsomer)'s tokens do.
- `styles: "none"`: nothing; the site includes Enarratio's stylesheet itself.

Enarratio's [README](https://github.com/DrDustinEdwards/enarratio#themes) covers themes and the
custom properties.

## Rendering cost

Bar, line and area charts are drawn by `enarratio/lite`, which builds the SVG as a string with no
DOM, the cheapest render on Cloudflare Workers. Scatter plots and heatmaps load `enarratio/plot`
(Observable Plot and linkedom) only when a page has one.

## License

[MIT](LICENSE). Copyright (c) 2026 Dustin Edwards.
