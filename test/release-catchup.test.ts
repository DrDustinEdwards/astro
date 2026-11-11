// Runs the "Tag and release skipped versions" step of release.yml in bash, in a throwaway git repository with `gh`
// replaced by a stub that records its calls: every untagged version bump older than the one at HEAD is released on its own
// commit with its own CHANGELOG section, oldest first, and the version at HEAD and tagged versions are left alone.
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";

const text = readFileSync(
  new URL("../.github/workflows/release.yml", import.meta.url),
  "utf8",
).replace(/\r\n/g, "\n");

function stepScript(marker: string): string {
  const lines = text.split("\n");
  const at = lines.findIndex((line) => line.includes(marker));
  const start = at + lines.slice(at).findIndex((line) => /^\s+run: \|$/.test(line));
  const indent = (lines[start + 1] ?? "").search(/\S/);
  const body: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() !== "" && line.search(/\S/) < indent) break;
    body.push(line.slice(indent));
  }
  return body.join("\n");
}

const script = stepScript("name: Tag and release skipped versions");

type Bump = { astro: string; emdash?: string; tag?: string[] };

function run(commits: Bump[]): string[] {
  const dir = mkdtempSync(join(tmpdir(), "release-"));
  const repo = join(dir, "repo");
  mkdirSync(join(repo, "packages/enarratio-astro"), { recursive: true });
  mkdirSync(join(repo, "packages/enarratio-emdash"), { recursive: true });
  mkdirSync(join(dir, "tmp"));
  try {
    const git = (...args: string[]) =>
      spawnSync(
        "git",
        [
          "-c",
          "user.name=t",
          "-c",
          "user.email=t@example.com",
          "-c",
          "commit.gpgsign=false",
          ...args,
        ],
        { cwd: repo, encoding: "utf8" },
      );
    git("init", "-q", "-b", "main");
    for (const [n, c] of commits.entries()) {
      const emdash = c.emdash ?? "0.1.0";
      writeFileSync(
        join(repo, "packages/enarratio-astro/package.json"),
        JSON.stringify({ name: "enarratio-astro", version: c.astro }),
      );
      writeFileSync(
        join(repo, "packages/enarratio-emdash/package.json"),
        JSON.stringify({ name: "enarratio-emdash", version: emdash }),
      );
      writeFileSync(
        join(repo, "packages/enarratio-astro/CHANGELOG.md"),
        `## [${c.astro}] - 2026-01-01\n\nnotes for ${c.astro}\n\n## [0.0.1] - 2025-01-01\n\nold\n`,
      );
      writeFileSync(join(repo, "other.txt"), String(n));
      git("add", "-A");
      git("commit", "-q", "-m", `c${n}`);
      for (const t of c.tag ?? []) git("tag", t);
    }
    writeFileSync(join(dir, "gh"), `#!/bin/sh\necho "$*" >> "${dir}/calls"\n`);
    chmodSync(join(dir, "gh"), 0o755);
    const result = spawnSync("bash", ["-e", "-o", "pipefail", "-c", script], {
      cwd: repo,
      encoding: "utf8",
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, RUNNER_TEMP: join(dir, "tmp") },
    });
    expect(result.status, result.stderr).toBe(0);
    const calls = (() => {
      try {
        return readFileSync(join(dir, "calls"), "utf8").trim().split("\n");
      } catch {
        return [];
      }
    })();
    return calls.map((call) => {
      const sha = /--target (\S+)/.exec(call)?.[1] ?? "";
      const subject = git("log", "-1", "--format=%s", sha).stdout.trim();
      return `${call.split(" ")[2]} on ${subject}`;
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("releases a skipped bump on its own commit and leaves HEAD's version and tagged ones alone", () => {
  const base = ["enarratio-astro@0.1.0"];
  const calls = run([
    { astro: "0.1.0", tag: base },
    { astro: "0.1.1" }, // skipped
    { astro: "0.1.2", tag: ["enarratio-astro@0.1.2"] },
    { astro: "0.1.3" }, // skipped
    { astro: "0.1.4" }, // HEAD: left to the stage step
  ]);
  expect(calls).toEqual(["enarratio-astro@0.1.1 on c1", "enarratio-astro@0.1.3 on c3"]);
});

test("does nothing when every bump is tagged or a package has no tag yet", () => {
  expect(run([{ astro: "0.1.0", tag: ["enarratio-astro@0.1.0"] }, { astro: "0.1.1" }])).toEqual([]);
});
