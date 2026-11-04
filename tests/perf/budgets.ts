import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { Stats } from "./networkHarness";

interface Budget {
  maxCommits?: number;
  maxDepth: number;
  maxDuplicates: number;
  maxFullHistory?: number;
  maxRequests: number;
  // Name in MODAL_ROUTES, for entries that stand for a modal screen.
  modal?: string;
  // Path of the `app/` route file, for entries that stand for a routed screen.
  route?: string;
}

// Render scenarios measure React commits only (spec 087).
type RenderReport = { commits: number };
type Report = Stats & { fullHistory?: number };

function budgetsDir() {
  return process.env.PERF_BUDGETS_DIR ?? join(process.cwd(), "perf/budgets");
}

function expectWithinBudget(report: RenderReport | Report, key: string) {
  if (process.env.PERF_UPDATE_BASELINE) {
    mkdirSync(measuredDir(), { recursive: true });
    writeFileSync(
      join(measuredDir(), `${key}.json`),
      JSON.stringify({ key, measured: report }),
    );

    return;
  }

  const budget = loadBudget(key);
  const requests = "total" in report ? report : undefined;
  const checks: [string, number | undefined, number | undefined][] = [
    ["maxRequests", requests?.total, budget.maxRequests],
    ["maxDepth", requests?.rounds, budget.maxDepth],
    ["maxDuplicates", requests?.duplicates, budget.maxDuplicates],
    [
      "maxFullHistory",
      requests ? (requests.fullHistory ?? 0) : undefined,
      budget.maxFullHistory,
    ],
    [
      "maxCommits",
      "commits" in report ? report.commits : undefined,
      budget.maxCommits,
    ],
  ];

  checks.forEach(([field, measured, max]) => {
    if (max !== undefined && measured !== undefined && measured > max) {
      throw new Error(
        `${key} ${field}: measured ${measured}, budget ${max} (perf/budgets/${moduleOf(key)}.json). Fix the regression; lower the budget only when a change improves it.`,
      );
    }
  });
}

function loadBudget(key: string): Budget {
  const module = moduleOf(key);
  const file = join(budgetsDir(), `${module}.json`);
  const registry = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    Budget
  >;

  if (!(key in registry)) {
    throw new Error(`No perf budget "${key}" in perf/budgets/${module}.json`);
  }

  return registry[key];
}

// Each key is its own file so parallel jest workers never write the same one.
function measuredDir() {
  return (
    process.env.PERF_MEASURED_DIR ?? join(process.cwd(), "perf-report/measured")
  );
}

function moduleOf(key: string) {
  return key.split(".")[0];
}

function readMeasured(): Record<string, RenderReport | Report> {
  const dir = measuredDir();

  try {
    return Object.fromEntries(
      readdirSync(dir).map((name) => {
        const { key, measured } = JSON.parse(
          readFileSync(join(dir, name), "utf8"),
        ) as { key: string; measured: RenderReport | Report };

        return [key, measured];
      }),
    );
  } catch {
    return {};
  }
}

export { expectWithinBudget, loadBudget, readMeasured };
export type { Budget, RenderReport, Report };
