import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { mergeBaseline } from "./baseline.mjs";
import { moduleForPath, selectModules, testPathsFor } from "./modules.mjs";
import { parseArgs, selection, summaryText } from "./run.mjs";

describe("selectModules", () => {
  it("SHOULD select stock WHEN only the Stock screens changed", () => {
    expect(
      selectModules([
        "src/presentation/screens/Stock/hooks/useStockViewModel.ts",
      ]),
    ).toEqual(["stock"]);
  });

  it("SHOULD select every module WHEN src/infrastructure changed", () => {
    expect(selectModules(["src/infrastructure/api/client.ts"])).toHaveLength(7);
  });

  it("SHOULD select every module WHEN package.json or yarn.lock changed", () => {
    expect(selectModules(["package.json"])).toHaveLength(7);
    expect(selectModules(["yarn.lock"])).toHaveLength(7);
  });

  it("SHOULD select nothing WHEN only docs changed", () => {
    expect(
      selectModules(["docs/ai/modules/financial.md", "README.md"]),
    ).toEqual([]);
  });

  it("SHOULD map app routes by module name", () => {
    expect(moduleForPath("app/(app)/(tabs)/financial/overview.tsx")).toBe(
      "financial",
    );
    expect(moduleForPath("app/login.tsx")).toBe("auth");
  });

  it("SHOULD map family members to their own module", () => {
    expect(moduleForPath("src/domain/entities/familyMember/Member.ts")).toBe(
      "familyMember",
    );
  });
});

describe("testPathsFor", () => {
  it("SHOULD always include the coverage test", () => {
    expect(testPathsFor(["stock"])).toEqual([
      "src/presentation/screens/Stock/.*__perf__/",
      "scripts/perf/coverage.test.ts",
    ]);
  });
});

describe("parseArgs", () => {
  it("SHOULD reject an unknown module", () => {
    expect(parseArgs(["--module", "nope"]).error).toContain(
      "unknown module nope",
    );
  });

  it("SHOULD require a mode", () => {
    expect(parseArgs([]).error).toContain("usage");
  });

  it("SHOULD parse --module with a list and --dry-run", () => {
    const { args } = parseArgs(["--module", "stock,home", "--dry-run"]);

    expect(selection(args, () => [])).toEqual(["stock", "home"]);
    expect(args?.dryRun).toBe(true);
  });

  it("SHOULD select from the changed files with --changed", () => {
    const { args } = parseArgs(["--changed"]);

    expect(
      selection(args, () => ["src/presentation/screens/Home/index.tsx"]),
    ).toEqual(["home"]);
  });
});

describe("summaryText", () => {
  it("SHOULD end with PERF PASSED: N/N", () => {
    expect(
      summaryText({ failures: [], modules: ["stock"], passed: 3, total: 3 })
        .trim()
        .endsWith("PERF PASSED: 3/3"),
    ).toBe(true);
  });

  it("SHOULD list the failures", () => {
    expect(
      summaryText({
        failures: ["a key"],
        modules: ["stock"],
        passed: 2,
        total: 3,
      }),
    ).toContain("FAILED a key");
  });
});

describe("mergeBaseline", () => {
  it("SHOULD rewrite only the measured keys, keep metadata and sort keys", () => {
    const dir = mkdtempSync(join(tmpdir(), "perf-baseline-"));

    writeFileSync(
      join(dir, "stock.json"),
      JSON.stringify({
        "stock.a": {
          maxDepth: 1,
          maxDuplicates: 1,
          maxFullHistory: 1,
          maxRequests: 1,
          route: "app/x.tsx",
        },
        "stock.b": { maxDepth: 9, maxDuplicates: 9, maxRequests: 9 },
      }),
    );

    mergeBaseline(
      { "stock.a": { duplicates: 0, fullHistory: 2, rounds: 2, total: 5 } },
      dir,
    );
    const merged = JSON.parse(readFileSync(join(dir, "stock.json"), "utf8"));

    expect(Object.keys(merged)).toEqual(["stock.a", "stock.b"]);
    expect(merged["stock.a"]).toEqual({
      maxDepth: 2,
      maxDuplicates: 0,
      maxFullHistory: 2,
      maxRequests: 5,
      route: "app/x.tsx",
    });
    expect(merged["stock.b"].maxRequests).toBe(9);
  });
});
