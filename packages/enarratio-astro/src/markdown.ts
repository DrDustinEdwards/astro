import { type ChartSpec, renderChart } from "./chart.js";
import { chartMarkup } from "./figure.js";
import { chartStyles, type StyleOptions } from "./styles.js";

/** Options for the Markdown plugins: how charts are styled. */
export type MarkdownChartOptions = StyleOptions;

const BOOLEAN_KEYS = new Set(["regression", "interactive"]);
const KEYS = new Set([
  "type",
  "alt",
  "title",
  "caption",
  "x",
  "y",
  "series",
  "value",
  "xLabel",
  "yLabel",
  "layout",
  "orientation",
  "scale",
  "regression",
  "dataTable",
  "id",
  "interactive",
]);

/**
 * Reads a `chart` code block: `key: value` lines, a line of three dashes, then the data.
 *
 * ```chart
 * type: line
 * x: month
 * y: visitors
 * alt: Monthly visitors rise from 820 to 1,190.
 * ---
 * month,visitors
 * 2026-01-01,820
 * ```
 */
export function parseChartBlock(source: string): ChartSpec & { readonly interactive: boolean } {
  const lines = source.split(/\r?\n/);
  const rule = lines.findIndex((line) => line.trim() === "---");
  if (rule === -1)
    throw new Error('Put a line of three dashes ("---") between the options and the data.');
  const spec: Record<string, string | boolean> = {};
  for (const line of lines.slice(0, rule)) {
    if (line.trim() === "") continue;
    const colon = line.indexOf(":");
    const key = colon === -1 ? "" : line.slice(0, colon).trim();
    if (!KEYS.has(key)) {
      throw new Error(`"${line.trim()}" is not an option. Options are: ${[...KEYS].join(", ")}.`);
    }
    const raw = line.slice(colon + 1).trim();
    spec[key] = BOOLEAN_KEYS.has(key) ? raw === "true" || raw === "yes" : raw;
  }
  return {
    ...(spec as Omit<ChartSpec, "data">),
    data: lines.slice(rule + 1).join("\n"),
    interactive: spec["interactive"] === true,
  };
}

/** The HTML for one chart block, with the chart CSS when it is the document's first chart. */
async function chartHtml(
  source: string,
  first: boolean,
  options: MarkdownChartOptions,
): Promise<string> {
  let markup: string;
  try {
    const { interactive, ...spec } = parseChartBlock(source);
    const result = await renderChart(spec);
    if (!result.ok) console.warn(`[enarratio-astro] Markdown chart not drawn: ${result.error}`);
    markup = chartMarkup(result, interactive);
  } catch (error) {
    markup = chartMarkup(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      false,
    );
  }
  const css = first ? chartStyles(options) : "";
  return css ? `<style>${css}</style>\n${markup}` : markup;
}

/** The parts of a Markdown code node the plugins read. */
interface CodeNode {
  readonly type: "code";
  readonly lang?: string | null | undefined;
  readonly value: string;
}

/** The parts of the Sätteri visitor context the plugin uses. */
interface SatteriContext {
  replaceNode(node: Readonly<CodeNode>, content: { type: "html"; value: string }): void;
}

/**
 * Charts in Markdown for Astro's default Markdown processor, Sätteri (Astro 7 and later): every
 * code block whose language is `chart` becomes a chart, drawn when the site builds or renders.
 *
 * @example
 * // astro.config.mjs
 * import { satteri } from "@astrojs/markdown-satteri";
 * import { satteriCharts } from "enarratio-astro/markdown";
 * export default defineConfig({ markdown: { processor: satteri({ mdastPlugins: [satteriCharts()] }) } });
 */
export function satteriCharts(options: MarkdownChartOptions = {}) {
  let first = true;
  return {
    name: "enarratio-charts",
    before() {
      first = true;
    },
    async code(node: Readonly<CodeNode>, ctx: SatteriContext) {
      if (node.lang !== "chart") return;
      // Visitors run concurrently, so the first block claims the stylesheet before it awaits.
      const isFirst = first;
      first = false;
      const value = await chartHtml(node.value, isFirst, options);
      ctx.replaceNode(node, { type: "html", value });
    },
  };
}

interface MdastParent {
  children: Array<{
    type: string;
    lang?: string | null | undefined;
    value?: string | undefined;
    children?: unknown[] | undefined;
  }>;
}

/**
 * Charts in Markdown for the unified (remark) processor, Astro 6's default and an option in
 * Astro 7: every code block whose language is `chart` becomes a chart.
 *
 * @example
 * // astro.config.mjs, Astro 6
 * import { remarkCharts } from "enarratio-astro/markdown";
 * export default defineConfig({ markdown: { remarkPlugins: [remarkCharts] } });
 */
export function remarkCharts(options: MarkdownChartOptions = {}) {
  return async (tree: MdastParent): Promise<void> => {
    const blocks: MdastParent["children"] = [];
    const walk = (parent: MdastParent) => {
      for (const child of parent.children) {
        if (child.type === "code" && child.lang === "chart") blocks.push(child);
        else if (Array.isArray(child.children)) walk(child as MdastParent);
      }
    };
    walk(tree);
    let first = true;
    for (const node of blocks) {
      const value = await chartHtml(node.value ?? "", first, options);
      first = false;
      // Turned into raw HTML in place, as remark plugins do.
      Object.assign(node, { type: "html", value });
      delete node.lang;
    }
  };
}
