import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

import { mergeBaseline } from "./baseline.mjs";
import { selectsBundle } from "./bundle.mjs";
import { testPathsFor } from "./modules.mjs";
import { parseArgs, selection, summaryText } from "./run.mjs";

const REPORT_DIR = "perf-report";
const MEASURED_DIR = join(REPORT_DIR, "measured");

// Files changed against the merge base with origin/main, plus uncommitted and untracked ones.
function changedFiles() {
  const base = git(["merge-base", "origin/main", "HEAD"]);
  const lists = [
    base ? git(["diff", "--name-only", base]) : null,
    git(["diff", "--name-only", "HEAD"]),
    git(["ls-files", "--others", "--exclude-standard"]),
  ];

  return [
    ...new Set(
      lists
        .flatMap((list) => (list ?? "").split("\n"))
        .filter((line) => line !== ""),
    ),
  ];
}

function git(args) {
  const result = spawnSync("git", args, { encoding: "utf8" });

  return result.status === 0 ? result.stdout.trim() : null;
}

function main() {
  const { args, error } = parseArgs(process.argv.slice(2));

  if (error) {
    process.stderr.write(`${error}\n`);

    return 2;
  }
  const modules = selection(args, changedFiles);
  const bundle = args.mode === "changed" && wantsBundle();

  if (modules.length === 0 && !bundle) {
    process.stdout.write("PERF SKIPPED: no module selected\n");

    return 0;
  }
  process.stdout.write(`Perf modules: ${modules.join(", ") || "none"}\n`);
  if (bundle) {
    process.stdout.write("Perf bundle: selected\n");
  }
  if (args.dryRun) {
    return 0;
  }

  rmSync(REPORT_DIR, { force: true, recursive: true });
  mkdirSync(REPORT_DIR, { recursive: true });
  if (modules.length === 0) {
    writeFileSync(join(REPORT_DIR, "summary.md"), "# Perf budgets\n");

    return runBundle();
  }
  const jsonFile = join(REPORT_DIR, "jest.json");
  const run = spawnSync(
    "yarn",
    ["jest", ...testPathsFor(modules), "--json", `--outputFile=${jsonFile}`],
    {
      env: {
        ...process.env,
        ...(args.updateBaseline ? { PERF_UPDATE_BASELINE: "1" } : {}),
      },
      stdio: "inherit",
    },
  );
  let results;

  try {
    results = JSON.parse(readFileSync(jsonFile, "utf8"));
  } catch {
    process.stderr.write("PERF could not run: jest produced no report\n");

    return 2;
  }
  const failures = results.testResults.flatMap((file) =>
    file.assertionResults
      .filter((test) => test.status === "failed")
      .map(
        (test) =>
          `${test.fullName}: ${test.failureMessages[0]?.split("\n")[0] ?? ""}`,
      ),
  );
  const summary = summaryText({
    failures,
    modules,
    passed: results.numPassedTests,
    total: results.numTotalTests,
  });

  writeFileSync(join(REPORT_DIR, "summary.md"), summary);
  process.stdout.write(summary);
  if (args.updateBaseline && failures.length === 0) {
    const files = mergeBaseline(readMeasured(), "perf/budgets");

    process.stdout.write(`Baseline updated: ${files.join(", ")}\n`);
  }

  const jestStatus = run.status === 0 && failures.length === 0 ? 0 : 1;

  if (!bundle) {
    return jestStatus;
  }
  const bundleStatus = runBundle();

  return bundleStatus === 2 ? 2 : Math.max(jestStatus, bundleStatus);
}

function readMeasured() {
  return Object.fromEntries(
    readdirSync(MEASURED_DIR).map((name) => {
      const { key, measured } = JSON.parse(
        readFileSync(join(MEASURED_DIR, name), "utf8"),
      );

      return [key, measured];
    }),
  );
}

function runBundle() {
  return (
    spawnSync("node", ["scripts/perf/check-bundle-size.mjs"], {
      stdio: "inherit",
    }).status ?? 2
  );
}

function wantsBundle() {
  return selectsBundle(changedFiles(), (file) => readFileSync(file, "utf8"));
}

process.exit(main());
