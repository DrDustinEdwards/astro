/**
 * The site-side renderer EmDash merges into `<PortableText>`, writing the default theme's CSS.
 * The key must equal the block's `_type` (BLOCK_TYPE). `./base` and `./none` are the same
 * renderer for the plugin's other `styles` options.
 */
import Chart from "./Chart.astro";

export const blockComponents = { enarratioChart: Chart };
export { Chart };
