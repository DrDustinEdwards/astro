import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import pkg from "../package.json" with { type: "json" };
import { blockComponents } from "../src/astro/index.ts";
import { BLOCK_TYPE, createPlugin, enarratioPlugin, VERSION } from "../src/index.ts";

describe("the Chart block", () => {
  it.each(["theme", "base", "none"] as const)(
    "with styles %s, points EmDash at an exported renderer for the registered block",
    async (styles) => {
      const descriptor = enarratioPlugin({ styles });
      expect(descriptor.entrypoint).toBe(pkg.name);
      expect(VERSION).toBe(pkg.version);
      expect(createPlugin().admin?.portableTextBlocks?.map((b) => b.type)).toEqual([BLOCK_TYPE]);
      const subpath = `.${descriptor.componentsEntry?.slice(pkg.name.length)}`;
      const file = (pkg.exports as Record<string, unknown>)[subpath];
      expect(file).toBeDefined();
      const entry = await import(`../${file}`);
      expect(Object.keys(entry.blockComponents)).toEqual([BLOCK_TYPE]);
    },
  );

  it("draws a saved block from every field the editor form stores", async () => {
    // Every action_id in the form, so a renamed field that the renderer no longer reads shows here.
    const node = {
      _type: BLOCK_TYPE,
      _key: "k1",
      chart: "bar",
      title: "Sales",
      alt: "Sales by region.",
      caption: "Sample data.",
      data: "region,month,sales\nNorth,Jan,12\nSouth,Jan,9",
      x: "region",
      y: "sales",
      series: "month",
      value: "",
      xLabel: "Region",
      yLabel: "Sales",
      layout: "grouped",
      orientation: "horizontal",
      scale: "linear",
      regression: false,
      dataTable: "visually-hidden",
      interactive: true,
    };
    const fields = createPlugin().admin?.portableTextBlocks?.[0]?.fields?.map((f) => f.action_id);
    expect(
      Object.keys(node)
        .filter((k) => !k.startsWith("_"))
        .sort(),
    ).toEqual(fields?.sort());
    const container = await AstroContainer.create();
    const html = await container.renderToString(blockComponents[BLOCK_TYPE], { props: { node } });
    expect(html).toContain('id="chart-k1"');
    expect(html).toContain('data-enarratio-orientation="horizontal"');
    expect(html).toContain("Sample data.");
    expect(html).toContain("enarratio-visually-hidden");
    expect(html).toContain("data-enarratio-interactive-chart");
  });
});
