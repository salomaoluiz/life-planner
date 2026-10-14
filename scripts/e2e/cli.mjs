import { spawnSync } from "node:child_process";
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

const deps = {
  exec({ args, command, logFile }) {
    mkdirSync(REPORT_DIR, { recursive: true });
    const fd = openSync(logFile, "a");
    try {
      const result = spawnSync(command, args, { stdio: ["ignore", fd, fd] });
      return { status: result.status ?? 1 };
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
