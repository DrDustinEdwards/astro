import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";
import { describe, expect, it } from "vitest";
import { remarkCharts, satteriCharts } from "../src/markdown.ts";

const doc = `# Report

\`\`\`chart
type: bar
x: region
y: sales
alt: South sells less than North.
interactive: true
---
region,sales
North,12
South,9
\`\`\`

Between the charts.

\`\`\`chart
type: line
x: month
y: profit
alt: Profit.
---
month,sales
2026-01,3
\`\`\`

\`\`\`js
const notAChart = true;
\`\`\`
`;

// Astro's two Markdown pipelines, configured as a site would configure them.
const processors = {
  "Sätteri (Astro 7 default)": () =>
    createSatteriMarkdownProcessor({ mdastPlugins: [satteriCharts()], syntaxHighlight: false }),
  "unified (remark)": () =>
    createMarkdownProcessor({ remarkPlugins: [remarkCharts], syntaxHighlight: false }),
};

describe.each(Object.entries(processors))("charts in Markdown with %s", (_, create) => {
  it("draws chart blocks, writes the CSS once, notes a broken block, and leaves other code alone", async () => {
    const { code } = await (await create()).render(doc);
    expect(code).toContain('data-enarratio="bar"');
    expect(code).toContain("data-enarratio-interactive-chart");
    expect(code.match(/Enarratio theme/g)).toHaveLength(1);
    expect(code).toMatch(/There is no column (&quot;|")profit/);
    expect(code).toContain("notAChart");
    expect(code).toContain("Between the charts.");
  });
});
