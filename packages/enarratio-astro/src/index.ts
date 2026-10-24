/**
 * Enarratio charts for Astro: a `<Chart>` component (`enarratio-astro/Chart.astro`), charts in
 * Markdown (`enarratio-astro/markdown`), and the functions under both, drawn on the server by
 * Enarratio as accessible HTML and SVG.
 *
 * @packageDocumentation
 */
export {
  CHART_TYPES,
  type ChartResult,
  type ChartSpec,
  type ChartType,
  renderChart,
} from "./chart.js";
export { type Cell, parseTable, type Table, tableFromRows } from "./data.js";
export { chartMarkup } from "./figure.js";
export { chartStyles, type StyleOptions, type Styles } from "./styles.js";
