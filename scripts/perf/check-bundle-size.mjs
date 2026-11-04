import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { bundleSizes, bundleSummary, compareBundle } from "./bundle.mjs";

const BUDGET_FILE = "perf/bundle-budget.json";
const SUMMARY_FILE = "perf-report/summary.md";

function jsFiles(dir) {
  return readdirSync(dir, { recursive: true })
    .map(String)
    .filter((name) => name.endsWith(".js"))
    .map((name) => join(dir, name));
}

// 0 passed, 1 over budget, 2 could not run.
function main() {
  const update = process.argv.includes("--update-budget");
  const outDir = mkdtempSync(join(tmpdir(), "lp-bundle-"));

  try {
    const run = spawnSync(
      "npx",
      ["expo", "export", "-p", "web", "--output-dir", outDir],
      { env: { ...process.env, CI: "1" }, stdio: "inherit" },
    );

    if (run.status !== 0 || !existsSync(outDir)) {
      process.stderr.write("BUNDLE could not run: expo export failed\n");

      return 2;
    }
    const files = jsFiles(outDir);
    const entry = files
      .filter((file) => /[\\/]entry-[^\\/]*\.js$/.test(file))
      .sort((a, b) => readFileSync(b).length - readFileSync(a).length)[0];

    if (!entry) {
      process.stderr.write("BUNDLE could not run: no entry chunk found\n");

      return 2;
    }
    const measured = {
      entry: bundleSizes(readFileSync(entry)),
      total: bundleSizes(
        Buffer.concat(files.map((file) => readFileSync(file))),
      ),
    };

    if (update) {
      writeFileSync(
        BUDGET_FILE,
        `${JSON.stringify({ entry: withMargin(measured.entry), total: withMargin(measured.total) }, null, 2)}\n`,
      );
      process.stdout.write(`Bundle budget written to ${BUDGET_FILE}\n`);
    }
    const budget = JSON.parse(readFileSync(BUDGET_FILE, "utf8"));
    const result = compareBundle(measured, budget);
    const summary = bundleSummary(result);

    mkdirSync("perf-report", { recursive: true });
    appendFileSync(SUMMARY_FILE, `\n${summary}`);
    process.stdout.write(summary);

    return result.ok ? 0 : 1;
  } finally {
    rmSync(outDir, { force: true, recursive: true });
  }
}

function margin(value) {
  return Math.ceil(value * 1.02);
}

function withMargin(sizes) {
  return {
    brotliBytes: margin(sizes.brotliBytes),
    gzipBytes: margin(sizes.gzipBytes),
  };
}

process.exit(main());
