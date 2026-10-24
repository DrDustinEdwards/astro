// Serves the built demo site and checks each page as a reader's browser receives it: the EmDash
// post (every chart type, a broken block replaced by its note), the Astro component page and the
// Markdown page, each with the theme written once and the enhancement script once.
// Run after `npm run setup` and `npm run build`.
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const port = "4329";
const server = spawn(process.execPath, ["dist/server/entry.mjs"], {
  env: { ...process.env, HOST: "127.0.0.1", PORT: port },
  stdio: "inherit",
});

const pages = {
  "/": { charts: ["bar", "line", "area", "scatter", "heatmap"], interactive: 3, broken: true },
  "/component": { charts: ["line"], interactive: 1, broken: false },
  "/markdown": { charts: ["bar"], interactive: 1, broken: false },
};

async function load(path) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const html = await fetch(`http://127.0.0.1:${port}${path}`).then(
      (r) => (r.ok ? r.text() : ""),
      () => "",
    );
    if (html) return html;
    await sleep(200);
  }
  return "";
}

const failures = [];
try {
  for (const [path, want] of Object.entries(pages)) {
    const html = await load(path);
    const count = (pattern) => html.match(pattern)?.length ?? 0;
    const fail = (message) => failures.push(`${path}: ${message}`);
    if (!html) {
      fail("the page did not load");
      continue;
    }
    for (const type of want.charts) {
      if (count(new RegExp(`data-enarratio="${type}"`, "g")) === 0) fail(`no ${type} chart`);
    }
    if (count(/Enarratio theme/g) !== 1) fail("the theme is not written exactly once");
    if (count(/<script[^>]+Enhance/g) !== 1) fail("the enhancement script is not included once");
    if (count(/data-enarratio-interactive-chart/g) !== want.interactive) {
      fail(`not ${want.interactive} interactive charts`);
    }
    if (html.includes('class="enarratio-chart-error"') !== want.broken) {
      fail(want.broken ? "no note for the broken block" : "a chart could not be drawn");
    }
  }
} finally {
  server.kill();
}
if (failures.length > 0) {
  console.error(`Demo check failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("Demo check passed: every page rendered its charts from the packed packages.");
}
