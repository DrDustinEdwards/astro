import { expect, it } from "vitest";
import { chartMarkup } from "../src/figure.ts";

it("escapes the reason a chart could not be drawn", () => {
  const html = chartMarkup({ ok: false, error: `<img src=x onerror="a">&'` }, false);
  expect(html).toContain("&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;");
  expect(html).not.toContain("<img");
});
