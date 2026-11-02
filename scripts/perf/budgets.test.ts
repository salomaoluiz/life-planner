import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  expectWithinBudget,
  loadBudget,
  readMeasured,
} from "../../tests/perf/budgets";

const dir = mkdtempSync(join(tmpdir(), "perf-budgets-"));
const report = { duplicates: 1, fullHistory: 2, rounds: 3, total: 10 };

beforeAll(() => {
  writeFileSync(
    join(dir, "demo.json"),
    JSON.stringify({
      "demo.a.mount.cold": {
        maxDepth: 3,
        maxDuplicates: 1,
        maxFullHistory: 2,
        maxRequests: 10,
      },
      "demo.b.mount.cold": { maxDepth: 3, maxDuplicates: 1, maxRequests: 10 },
    }),
  );
  process.env.PERF_BUDGETS_DIR = dir;
  process.env.PERF_MEASURED_DIR = join(dir, "measured");
});

afterEach(() => {
  delete process.env.PERF_UPDATE_BASELINE;
});

describe("loadBudget", () => {
  it("SHOULD return the entry of the key", () => {
    expect(loadBudget("demo.a.mount.cold").maxRequests).toBe(10);
  });

  it("SHOULD name the key and the file WHEN the entry is missing", () => {
    expect(() => loadBudget("demo.zzz.mount.cold")).toThrow(
      'No perf budget "demo.zzz.mount.cold" in perf/budgets/demo.json',
    );
  });
});

describe("expectWithinBudget", () => {
  it("SHOULD pass WHEN every number is equal to the budget", () => {
    expect(() => expectWithinBudget(report, "demo.a.mount.cold")).not.toThrow();
  });

  it("SHOULD fail naming the key WHEN requests exceed maxRequests", () => {
    expect(() =>
      expectWithinBudget({ ...report, total: 11 }, "demo.a.mount.cold"),
    ).toThrow("demo.a.mount.cold maxRequests");
  });

  it("SHOULD fail WHEN full-history downloads exceed maxFullHistory", () => {
    expect(() =>
      expectWithinBudget({ ...report, fullHistory: 3 }, "demo.a.mount.cold"),
    ).toThrow("maxFullHistory");
  });

  it("SHOULD ignore full history WHEN the entry has no maxFullHistory", () => {
    expect(() =>
      expectWithinBudget({ ...report, fullHistory: 99 }, "demo.b.mount.cold"),
    ).not.toThrow();
  });

  it("SHOULD record the measure instead of asserting WHEN updating the baseline", () => {
    process.env.PERF_UPDATE_BASELINE = "1";

    expect(() =>
      expectWithinBudget({ ...report, total: 99 }, "demo.a.mount.cold"),
    ).not.toThrow();
    expect(readMeasured()["demo.a.mount.cold"].total).toBe(99);
    expect(
      readFileSync(join(dir, "measured", "demo.a.mount.cold.json"), "utf8"),
    ).toContain('"total":99');
  });
});
