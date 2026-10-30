// Version and changelog guardrail (spec 056). No dependencies.
// Usage: node scripts/check-version.mjs   (diffs against origin/main; PR_TITLE env adds the type check)
// Tests feed CHECK_VERSION_INPUT (JSON) instead of git.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SHIPPED_PREFIXES = [
  "src/",
  "app/",
  "assets/",
  "plugins/",
  "app.config.ts",
  "Dockerfile.web",
  "nginx.web.conf",
  "docker-compose.web",
];
const SHIPPED_FILES = ["yarn.lock"];

export function evaluate({
  base,
  baseChangelogDate,
  changelog,
  current,
  prType,
  shippedChanged,
  today,
}) {
  const failures = [];
  const currentParts = parseVersion(current);
  const baseParts = parseVersion(base);
  if (!currentParts || !baseParts) {
    return [
      `package.json version "${current}" or main's "${base}" is not x.y.z.`,
    ];
  }
  if (!shippedChanged) {
    if (current !== base) {
      failures.push(
        `No shipped path changed, so the version must stay ${base} (found ${current}); revert the bump.`,
      );
    }
    return failures;
  }
  const kind = jumpKind(baseParts, currentParts);
  if (current === base) {
    failures.push(
      `Shipped code changed: bump package.json version from ${base} and add a CHANGELOG.md entry.`,
    );
  } else if (!kind) {
    failures.push(
      `Version ${current} is not exactly one step from main's ${base} (x.y.z+1, x.y+1.0 or x+1.0.0).`,
    );
  } else {
    const wanted = expectedKind(prType);
    if (wanted && wanted !== kind) {
      failures.push(
        `PR type "${prType}" needs a ${wanted} bump but ${base} -> ${current} is ${kind}.`,
      );
    }
  }
  const entry = firstEntry(changelog);
  if (!entry || entry.version !== current) {
    failures.push(
      `CHANGELOG.md must start with "## [${current}] - YYYY-MM-DD" (first entry is ${entry?.version ?? "missing"}).`,
    );
  } else {
    if (!entry.date) {
      failures.push(
        `CHANGELOG.md entry ${current} needs a date (## [${current}] - YYYY-MM-DD).`,
      );
    } else if (baseChangelogDate && entry.date < baseChangelogDate) {
      failures.push(
        `CHANGELOG.md entry ${current} is dated ${entry.date}, earlier than main's latest (${baseChangelogDate}); use ${today} or later.`,
      );
    }
    if (entry.bullets < 1) {
      failures.push(
        `CHANGELOG.md entry ${current} needs at least one "- " bullet.`,
      );
    }
  }
  return failures;
}

export function isShipped(file) {
  return (
    SHIPPED_FILES.includes(file) ||
    SHIPPED_PREFIXES.some((prefix) => file.startsWith(prefix))
  );
}

function dependenciesOf(json) {
  const parsed = JSON.parse(json);
  return JSON.stringify([
    parsed.dependencies ?? {},
    parsed.devDependencies ?? {},
  ]);
}

function expectedKind(prType) {
  if (!prType) return null;
  const match = /^(\w+)(\([^)]*\))?(!)?:/.exec(prType.trim());
  if (!match) return null;
  if (match[3]) return "major";
  return match[1] === "feat" ? "minor" : "patch";
}

function firstEntry(changelog) {
  const lines = changelog.split(/\r?\n/);
  const index = lines.findIndex((line) => line.startsWith("## ["));
  if (index === -1) return null;
  const heading = /^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?/.exec(
    lines[index],
  );
  const rest = lines.slice(index + 1);
  const end = rest.findIndex((line) => line.startsWith("## ["));
  const body = end === -1 ? rest : rest.slice(0, end);
  return {
    bullets: body.filter((line) => /^\s*[-*] \S/.test(line)).length,
    date: heading?.[2] ?? null,
    version: heading?.[1] ?? null,
  };
}

function fromGit() {
  const files = git("diff", "--name-only", "origin/main...HEAD")
    .split("\n")
    .filter(Boolean);
  const basePackage = git("show", "origin/main:package.json");
  const currentPackage = readFileSync("package.json", "utf8");
  const depsChanged =
    dependenciesOf(basePackage) !== dependenciesOf(currentPackage);
  let baseChangelog = "";
  try {
    baseChangelog = git("show", "origin/main:CHANGELOG.md");
  } catch {
    // main has no changelog yet
  }
  const changelog = readFileSync("CHANGELOG.md", "utf8");
  return {
    base: JSON.parse(basePackage).version,
    baseChangelogDate: firstEntry(baseChangelog)?.date ?? null,
    changelog,
    current: JSON.parse(currentPackage).version,
    prType: process.env.PR_TITLE,
    shippedChanged: files.some(isShipped) || depsChanged,
    today: new Date().toISOString().slice(0, 10),
  };
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function jumpKind(base, current) {
  const [bMajor, bMinor, bPatch] = base;
  const [major, minor, patch] = current;
  if (major === bMajor + 1 && minor === 0 && patch === 0) return "major";
  if (major === bMajor && minor === bMinor + 1 && patch === 0) return "minor";
  if (major === bMajor && minor === bMinor && patch === bPatch + 1)
    return "patch";
  return null;
}

function parseVersion(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value ?? "");
  return match ? match.slice(1).map(Number) : null;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const input = process.env.CHECK_VERSION_INPUT
    ? JSON.parse(process.env.CHECK_VERSION_INPUT)
    : fromGit();
  const failures = evaluate(input);
  failures.forEach((failure) =>
    process.stdout.write(`version:check FAIL - ${failure}\n`),
  );
  if (failures.length > 0) process.exit(1);
  process.stdout.write("version:check OK\n");
}
