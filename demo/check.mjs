// Serves the built demo site and checks the post as a reader's browser receives it: every chart
// kind drawn on the server, the theme written once, the enhancement script once, and the block
// with a mistake replaced by its note. Run after `npm run setup` and `npm run build`.
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const port = "4329";
const server = spawn(process.execPath, ["dist/server/entry.mjs"], {
  env: { ...process.env, HOST: "127.0.0.1", PORT: port },
  stdio: "inherit",
});

let html = "";
try {
  for (let attempt = 0; attempt < 50 && !html; attempt++) {
    await sleep(200);
    html = await fetch(`http://127.0.0.1:${port}/`).then(
      (r) => (r.ok ? r.text() : ""),
      () => "",
    );
  }
  const count = (pattern) => html.match(pattern)?.length ?? 0;
  const failures = [
    ...["bar", "line", "area", "scatter", "heatmap"]
      .filter((kind) => count(new RegExp(`data-enarratio="${kind}"`, "g")) === 0)
      .map((kind) => `no ${kind} chart`),
    count(/Enarratio theme/g) === 1 ? "" : "the theme is not written exactly once",
    count(/<script[^>]+Enhance/g) === 1
      ? ""
      : "the enhancement script is not included exactly once",
    count(/data-enarratio-emdash-interactive/g) === 3 ? "" : "not three interactive charts",
    html.includes('class="enarratio-emdash-error"') ? "" : "no note for the broken block",
  ].filter(Boolean);
  if (!html) failures.unshift("the page did not load");
  if (failures.length > 0) {
    console.error(`Demo check failed: ${failures.join("; ")}.`);
    process.exitCode = 1;
  } else {
    console.log("Demo check passed: every chart kind rendered from the packed plugin.");
  }
} finally {
  server.kill();
}
