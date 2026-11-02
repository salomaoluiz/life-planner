import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { Stats } from "./networkHarness";

interface Budget {
  maxDepth: number;
  maxDuplicates: number;
  maxFullHistory?: number;
  maxRequests: number;
  // Name in MODAL_ROUTES, for entries that stand for a modal screen.
  modal?: string;
  // Path of the `app/` route file, for entries that stand for a routed screen.
  route?: string;
}

type Report = Stats & { fullHistory?: number };

function budgetsDir() {
  return process.env.PERF_BUDGETS_DIR ?? join(process.cwd(), "perf/budgets");
}

function expectWithinBudget(report: Report, key: string) {
  if (process.env.PERF_UPDATE_BASELINE) {
    mkdirSync(measuredDir(), { recursive: true });
    writeFileSync(
      join(measuredDir(), `${key}.json`),
      JSON.stringify({ key, measured: report }),
    );

    return;
  }

  const budget = loadBudget(key);
  const checks: [string, number, number | undefined][] = [
    ["maxRequests", report.total, budget.maxRequests],
    ["maxDepth", report.rounds, budget.maxDepth],
    ["maxDuplicates", report.duplicates, budget.maxDuplicates],
    ["maxFullHistory", report.fullHistory ?? 0, budget.maxFullHistory],
  ];

  checks.forEach(([field, measured, max]) => {
    if (max !== undefined && measured > max) {
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

function readMeasured(): Record<string, Report> {
  const dir = measuredDir();

  try {
    return Object.fromEntries(
      readdirSync(dir).map((name) => {
        const { key, measured } = JSON.parse(
          readFileSync(join(dir, name), "utf8"),
        ) as { key: string; measured: Report };

        return [key, measured];
      }),
    );
  } catch {
    return {};
  }
}

export { expectWithinBudget, loadBudget, readMeasured };
export type { Budget, Report };
