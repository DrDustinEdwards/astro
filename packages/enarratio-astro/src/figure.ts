import type { ChartResult } from "./chart.js";

const ESCAPES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escapes text for HTML. Local because Enarratio no longer exports its own (0.9.0). */
function escapeText(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

/**
 * The markup that goes on the page for a drawn chart, or for one that could not be drawn: the
 * chart in a wrapper (marked when it is interactive), or a note saying why.
 */
export function chartMarkup(result: ChartResult, interactive: boolean): string {
  if (!result.ok) {
    return `<p class="enarratio-chart-error" role="note">This chart could not be drawn. ${escapeText(result.error)}</p>`;
  }
  const mark = interactive ? " data-enarratio-interactive-chart" : "";
  return `<div class="enarratio-chart"${mark}>${result.html}</div>`;
}
