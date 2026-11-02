import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { Budget } from "../../tests/perf/budgets";
import { listModals, listRoutes } from "./routes";

const BUDGETS = join(process.cwd(), "perf/budgets");

function loadEntries() {
  return readdirSync(BUDGETS)
    .filter((name) => name.endsWith(".json"))
    .flatMap((name) =>
      Object.entries(
        JSON.parse(readFileSync(join(BUDGETS, name), "utf8")) as Record<
          string,
          Budget
        >,
      ).map(([key, budget]) => ({ budget, file: name, key })),
    );
}

const entries = loadEntries();

describe("perf budgets screen coverage", () => {
  it("SHOULD have a registry entry for every route file", () => {
    const covered = new Set(entries.map(({ budget }) => budget.route));
    const missing = listRoutes()
      .filter((route) => !covered.has(route))
      .map(
        (route) =>
          `Add an entry with "route": "${route}" to perf/budgets/<module>.json (see .claude/context/testing.md)`,
      );

    expect(missing).toEqual([]);
  });

  it("SHOULD have a registry entry for every modal", () => {
    const covered = new Set(entries.map(({ budget }) => budget.modal));
    const missing = listModals()
      .filter((modal) => !covered.has(modal))
      .map(
        (modal) =>
          `Add an entry with "modal": "${modal}" to perf/budgets/<module>.json (see .claude/context/testing.md)`,
      );

    expect(missing).toEqual([]);
  });

  it("SHOULD have no entry that points at a removed route or modal", () => {
    const routes = new Set(listRoutes());
    const modals = new Set(listModals());
    const stale = entries
      .filter(
        ({ budget }) =>
          (budget.route !== undefined && !routes.has(budget.route)) ||
          (budget.modal !== undefined && !modals.has(budget.modal)),
      )
      .map(
        ({ file, key }) =>
          `Remove "${key}" from perf/budgets/${file}: its route or modal no longer exists`,
      );

    expect(stale).toEqual([]);
  });
});

describe("listRoutes", () => {
  it("SHOULD ignore _layout, +not-found, (dev) and the modal catch-all", () => {
    const root = mkdtempSync(join(tmpdir(), "perf-routes-"));

    mkdirSync(join(root, "app/(app)/(dev)"), { recursive: true });
    mkdirSync(join(root, "app/(app)/(modals)"), { recursive: true });
    for (const file of [
      "app/_layout.tsx",
      "app/+not-found.tsx",
      "app/login.tsx",
      "app/(app)/(dev)/gallery.tsx",
      "app/(app)/(modals)/[...modal].tsx",
      "app/(app)/home.tsx",
    ]) {
      writeFileSync(join(root, file), "");
    }

    expect(listRoutes(root)).toEqual(["app/(app)/home.tsx", "app/login.tsx"]);
  });
});
