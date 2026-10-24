import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import pkg from "../package.json" with { type: "json" };
import { blockComponents } from "../src/astro/index.ts";
import { BLOCK_TYPE, createPlugin, enarratioPlugin, VERSION } from "../src/index.ts";

const Chart = blockComponents[BLOCK_TYPE];

const sales =
  "month,region,sales\n2026-01,North,12\n2026-01,South,9\n2026-02,North,15\n2026-02,South,11";

async function render(node: Record<string, unknown>): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Chart, {
    props: { node: { _type: BLOCK_TYPE, _key: "k1", ...node } },
  });
}

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

  it("writes no colors with styles base, and no CSS with styles none", async () => {
    const node = { _type: BLOCK_TYPE, data: sales, x: "region", alt: "Rows per region." };
    const container = await AstroContainer.create();
    const base = (await import("../src/astro/base.ts")).blockComponents[BLOCK_TYPE];
    const none = (await import("../src/astro/none.ts")).blockComponents[BLOCK_TYPE];
    const withBase = await container.renderToString(base, { props: { node } });
    expect(withBase).toContain("Enarratio base rules");
    expect(withBase).not.toContain("--enarratio-series-1:");
    const withNone = await container.renderToString(none, { props: { node } });
    expect(withNone).not.toContain("<style");
    expect(withNone).toContain("<svg");
  });

  it.each([
    ["bar", { x: "region", y: "sales", series: "month" }],
    ["line", { x: "month", y: "sales", series: "region" }],
    ["area", { x: "month", y: "sales", series: "region" }],
    ["scatter", { data: "a,b\n1,2\n2,4\n3,5", x: "a", y: "b", regression: true }],
    ["heatmap", { x: "month", y: "region", value: "sales" }],
  ])(
    "draws a %s chart with its description, the theme once, and a data table",
    async (chart, fields) => {
      const html = await render({
        chart,
        data: sales,
        alt: "Sales by month and region.",
        title: "Sales",
        ...fields,
      });
      expect(html).toContain(`data-enarratio="${chart}"`);
      expect(html).toContain('aria-label="Sales by month and region."');
      expect(html).toContain("<table");
      expect(html.match(/Enarratio theme/g)).toHaveLength(1);
      expect(html).not.toContain("<script");
    },
  );

  it("writes the theme once for a page with two charts", async () => {
    const container = await AstroContainer.create();
    const request = new Request("https://example.com/post");
    const props = {
      node: { _type: BLOCK_TYPE, chart: "bar", data: sales, x: "region", alt: "Rows per region." },
    };
    const first = await container.renderToString(Chart, { props, request });
    const second = await container.renderToString(Chart, { props, request });
    expect(first).toContain("Enarratio theme");
    expect(second).not.toContain("Enarratio theme");
    expect(second).toContain("<svg");
  });

  it("adds the enhancement script only to an interactive chart", async () => {
    const html = await render({
      chart: "bar",
      data: sales,
      x: "region",
      alt: "Rows per region.",
      interactive: true,
    });
    expect(html).toContain("data-enarratio-emdash-interactive");
    expect(html).toContain("<script");
  });

  it("escapes markup an editor typed, in data and in text", async () => {
    const evil = '<img src=x onerror="alert(1)">';
    const html = await render({
      chart: "bar",
      data: `name,n\n"${evil.replaceAll('"', '""')}",1`,
      x: "name",
      y: "n",
      alt: evil,
      title: evil,
      caption: evil,
    });
    expect(html).not.toContain("<img");
  });

  it("shows why a chart cannot be drawn instead of breaking the page", async () => {
    const html = await render({
      chart: "line",
      data: sales,
      x: "month",
      y: "profit",
      alt: "Profit.",
    });
    expect(html).toContain("enarratio-emdash-error");
    expect(html).toContain("There is no column &quot;profit&quot;");
    expect(await render({ chart: "bar", data: sales, x: "region" })).toContain("Add a description");
  });
});
