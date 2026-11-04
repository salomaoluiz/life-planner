import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function entryFrom(previous, measured) {
  // A render scenario (spec 087) measures commits only: no request numbers to write.
  if (measured.total === undefined) {
    return { ...previous, maxCommits: measured.commits };
  }

  const entry = {
    ...previous,
    maxDepth: measured.rounds,
    maxDuplicates: measured.duplicates,
    maxRequests: measured.total,
  };

  if ("maxFullHistory" in previous) {
    entry.maxFullHistory = measured.fullHistory ?? 0;
  }

  return entry;
}

// Rewrites only the keys that were measured; every other key, and the route/modal metadata, stay as they were.
function mergeBaseline(measured, budgetsDir) {
  const touched = new Set();

  for (const [key, report] of Object.entries(measured)) {
    const file = join(budgetsDir, `${key.split(".")[0]}.json`);
    const registry = existsSync(file)
      ? JSON.parse(readFileSync(file, "utf8"))
      : {};

    registry[key] = entryFrom(registry[key] ?? {}, report);
    writeFileSync(file, `${JSON.stringify(sortKeys(registry), null, 2)}\n`);
    touched.add(file);
  }

  return [...touched];
}

function sortKeys(object) {
  return Object.fromEntries(
    Object.keys(object)
      .sort()
      .map((key) => [key, object[key]]),
  );
}

export { mergeBaseline };
