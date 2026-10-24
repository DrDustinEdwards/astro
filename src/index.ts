/**
 * Enarratio charts for EmDash: a Chart block for the Portable Text editor, drawn on the server
 * by Enarratio as accessible HTML and SVG.
 *
 * @example
 * // astro.config.mjs
 * import { enarratioPlugin } from "enarratio-emdash";
 * emdash({ plugins: [enarratioPlugin()] });
 */
import type { PluginDescriptor, ResolvedPlugin } from "emdash";
import { definePlugin } from "emdash";
import { chartBlock } from "./block.js";

export { BLOCK_TYPE, CHART_KINDS, type ChartKind, chartBlock } from "./block.js";
export { type ChartNode, type ChartResult, renderChart } from "./chart.js";

/** Kept equal to package.json's version, which a test checks. */
export const VERSION = "0.1.0";
const ID = "enarratio";

/** Options for {@link enarratioPlugin}. */
export interface EnarratioPluginOptions {
  /**
   * The CSS the plugin writes, once per page with a chart:
   * - `"theme"` (default): Enarratio's default theme, colors and rules, light and dark.
   * - `"base"`: the rules without colors or fonts, for a site whose own tokens define the
   *   `--enarratio-*` properties (Capsomer's tokens do).
   * - `"none"`: nothing; the site includes Enarratio's stylesheet itself.
   */
  readonly styles?: "theme" | "base" | "none";
}

const COMPONENTS = {
  theme: "enarratio-emdash/astro",
  base: "enarratio-emdash/astro/base",
  none: "enarratio-emdash/astro/none",
} as const;

/** The descriptor a site lists in `astro.config.mjs`. */
export function enarratioPlugin(options: EnarratioPluginOptions = {}): PluginDescriptor {
  return {
    id: ID,
    version: VERSION,
    format: "native",
    entrypoint: "enarratio-emdash",
    // Astro imports the renderer while it builds the site, before any plugin option reaches it,
    // so each styles option is its own entry.
    componentsEntry: COMPONENTS[options.styles ?? "theme"],
  };
}

/** The plugin EmDash loads at run time: the Chart block, and no capabilities, since it only draws. */
export function createPlugin(): ResolvedPlugin {
  return definePlugin({
    id: ID,
    version: VERSION,
    capabilities: [],
    admin: { portableTextBlocks: [chartBlock] },
  });
}

export default createPlugin;
