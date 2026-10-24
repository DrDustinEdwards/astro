import { escapeHtml } from "enarratio";
import type { ChartResult } from "./chart.js";

/**
 * The markup that goes on the page for a drawn chart, or for one that could not be drawn: the
 * chart in a wrapper (marked when it is interactive), or a note saying why.
 */
export function chartMarkup(result: ChartResult, interactive: boolean): string {
  if (!result.ok) {
    return `<p class="enarratio-chart-error" role="note">This chart could not be drawn. ${escapeHtml(result.error)}</p>`;
  }
  const mark = interactive ? " data-enarratio-interactive-chart" : "";
  return `<div class="enarratio-chart"${mark}>${result.html}</div>`;
}
