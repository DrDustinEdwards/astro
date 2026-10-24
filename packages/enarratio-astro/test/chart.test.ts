import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import Chart from "../src/Chart.astro";

const sales =
  "month,region,sales\n2026-01,North,12\n2026-01,South,9\n2026-02,North,15\n2026-02,South,11";

async function render(props: Record<string, unknown>, request?: Request): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Chart, { props, ...(request ? { request } : {}) });
}

describe("<Chart>", () => {
  it.each([
    ["bar", { x: "region", y: "sales", series: "month" }],
    ["line", { x: "month", y: "sales", series: "region" }],
    ["area", { x: "month", y: "sales", series: "region" }],
    ["scatter", { data: "a,b\n1,2\n2,4\n3,5", x: "a", y: "b", regression: true }],
    ["heatmap", { x: "month", y: "region", value: "sales" }],
  ])(
    "draws a %s chart with its description and a data table, and no script",
    async (type, fields) => {
      const html = await render({
        type,
        data: sales,
        alt: "Sales by month and region.",
        ...fields,
      });
      expect(html).toContain(`data-enarratio="${type}"`);
      expect(html).toContain('aria-label="Sales by month and region."');
      expect(html).toContain("<table");
      expect(html).not.toContain("<script");
    },
  );

  it("takes rows as objects, as from JSON or a content collection", async () => {
    const data = [
      { day: new Date("2026-03-01T00:00:00Z"), visits: 4 },
      { day: new Date("2026-03-02T00:00:00Z"), visits: 6 },
    ];
    const html = await render({ type: "line", data, x: "day", y: "visits", alt: "Visits rise." });
    expect(html).toContain('data-enarratio="line"');
  });

  it("writes the CSS once per page, as the theme, base rules or nothing", async () => {
    const request = new Request("https://example.com/post");
    const props = { data: sales, x: "region", alt: "Rows per region." };
    expect(await render(props, request)).toContain("Enarratio theme");
    const second = await render(props, request);
    expect(second).not.toContain("<style");
    expect(second).toContain("<svg");
    const base = await render({ ...props, styles: "base" });
    expect(base).toContain("Enarratio base rules");
    expect(base).not.toContain("--enarratio-series-1:");
    expect(await render({ ...props, styles: "none" })).not.toContain("<style");
  });

  it("adds the enhancement script only to an interactive chart", async () => {
    const html = await render({ data: sales, x: "region", alt: "Rows.", interactive: true });
    expect(html).toContain("data-enarratio-interactive-chart");
    expect(html).toContain("<script");
  });

  it("escapes markup an author typed, in data and in text", async () => {
    const evil = '<img src=x onerror="alert(1)">';
    const html = await render({
      data: `name,n\n"${evil.replaceAll('"', '""')}",1`,
      x: "name",
      y: evil,
      alt: evil,
      title: evil,
      caption: evil,
    });
    expect(html).not.toContain("<img");
  });

  it("shows why a chart cannot be drawn instead of breaking the page", async () => {
    const html = await render({
      type: "line",
      data: sales,
      x: "month",
      y: "profit",
      alt: "Profit.",
    });
    expect(html).toContain("enarratio-chart-error");
    expect(html).toContain("There is no column &quot;profit&quot;");
    expect(await render({ data: sales, x: "region" })).toContain("Add a description");
  });
});
