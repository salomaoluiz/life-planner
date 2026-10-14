import { spawn, spawnSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";

import { findRunning, parseFinished, renderProgress } from "./progress.mjs";
import { runE2e } from "./run.mjs";

const REPORT_DIR = "e2e-report";

try {
  process.loadEnvFile(".env");
} catch {
  // No .env (CI or a fresh clone): rely on the real environment.
}

function describeRepo(label, dir) {
  const branch = git(dir, ["rev-parse", "--abbrev-ref", "HEAD"]);
  const sha = git(dir, ["rev-parse", "--short", "HEAD"]);
  if (!branch || !sha) {
    return `${label} unknown`;
  }
  const dirty =
    (git(dir, ["status", "--porcelain"]) ?? "") === "" ? "" : "+dirty";
  return `${label} ${branch}@${sha}${dirty}`;
}

function git(dir, args) {
  const result = spawnSync("git", ["-C", dir, ...args], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

// Maestro creates one folder per flow (path with / as _) inside a timestamped folder when the flow starts.
function latestArtifactDirs() {
  try {
    const root = `${REPORT_DIR}/artifacts`;
    const runs = readdirSync(root).sort();
    return runs.length > 0
      ? readdirSync(`${root}/${runs[runs.length - 1]}`)
      : [];
  } catch {
    return [];
  }
}

function readText(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function startProgress({ expected, logFile, started }) {
  let previousLines = 0;

  function draw() {
    const finished = parseFinished(readText(logFile));
    const running = findRunning(expected, finished, latestArtifactDirs());
    const lines = renderProgress({
      elapsedSeconds: (Date.now() - started) / 1000,
      expected,
      finished,
      running,
    });
    if (previousLines > 0) {
      process.stdout.write(`\x1b[${previousLines}A\x1b[0J`);
    }
    process.stdout.write(`${lines.join("\n")}\n`);
    previousLines = lines.length;
  }

  draw();
  const timer = setInterval(draw, 1000);
  return () => {
    clearInterval(timer);
    draw();
  };
}

const deps = {
  async exec({ args, command, expected, logFile, started }) {
    mkdirSync(REPORT_DIR, { recursive: true });
    const fd = openSync(logFile, "a");
    // Humans (a terminal) get a live list of passed / running / pending flows; AI shells and CI are not a TTY
    // and keep the quiet path, so nothing but the final summary reaches their context.
    const live = process.stdout.isTTY && expected.length > 0;
    try {
      if (!live) {
        const result = spawnSync(command, args, { stdio: ["ignore", fd, fd] });
        return { status: result.status ?? 1 };
      }
      const child = spawn(command, args, { stdio: ["ignore", fd, fd] });
      const exited = new Promise((resolve) => {
        child.on("close", (status) => resolve({ status: status ?? 1 }));
        child.on("error", () => resolve({ status: 1 }));
      });
      const stopProgress = startProgress({ expected, logFile, started });
      try {
        return await exited;
      } finally {
        stopProgress();
      }
    } finally {
      closeSync(fd);
    }
  },
  exists: (path) => existsSync(path),
  async fetchStatus(url) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      return response.status;
    } catch {
      return null;
    }
  },
  hasCommand: (command) =>
    !spawnSync(command, ["--version"], { stdio: "ignore" }).error,
  listFiles(dir) {
    try {
      return readdirSync(dir, { recursive: true });
    } catch {
      return [];
    }
  },
  mkdir: (path) => mkdirSync(path, { recursive: true }),
  now: () => Date.now(),
  print: (text) => process.stdout.write(`${text}\n`),
  readFile(path) {
    try {
      return readFileSync(path, "utf8");
    } catch {
      return null;
    }
  },
  removeReportFiles() {
    mkdirSync(REPORT_DIR, { recursive: true });
    for (const entry of readdirSync(REPORT_DIR)) {
      if (entry !== "failed.txt" && entry !== "summary.md") {
        rmSync(`${REPORT_DIR}/${entry}`, { force: true, recursive: true });
      }
    }
  },
  revisions: () =>
    `${describeRepo("app", ".")} · ${describeRepo("api", "../life-planner-back")}`,
  writeFile: (path, content) => writeFileSync(path, content),
};

process.exitCode = await runE2e(
  { argv: process.argv.slice(2), env: process.env },
  deps,
);
