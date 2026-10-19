import { selectImpact } from "./impact.mjs";

describe("selectImpact", () => {
  it("SHOULD select financial + smoke for a backend finance change", () => {
    const result = selectImpact({
      back: ["src/modules/finance/x.ts"],
      front: [],
    });

    expect(result.skip).toBe(false);
    expect(result.tags).toEqual(["financial", "smoke"]);
    expect(result.reasons).toHaveLength(1);
  });

  it.each([
    ["front", "src/presentation/components/Button/index.tsx"],
    ["front", "package.json"],
    ["front", "e2e/subflows/login.yaml"],
    ["front", "src/foo/bar.ts"],
    ["back", "src/modules/user/a.ts"],
    ["back", "prisma/schema.prisma"],
    ["back", "src/shared/infra/x.ts"],
  ])("SHOULD select the full suite for %s %s", (repo, path) => {
    const result = selectImpact({
      back: repo === "back" ? [path] : [],
      front: repo === "front" ? [path] : [],
    });

    expect(result.tags).toBe("all");
    expect(result.skip).toBe(false);
  });

  it("SHOULD skip for docs-only changes AND for no changes", () => {
    expect(
      selectImpact({ back: [], front: ["docs/a.md", ".claude/CLAUDE.md"] })
        .skip,
    ).toBe(true);
    expect(selectImpact({ back: [], front: [] }).skip).toBe(true);
  });

  it("SHOULD add a changed flow file AND smoke", () => {
    const result = selectImpact({
      back: [],
      front: ["e2e/flows/stock/search.yaml"],
    });

    expect(result.flowFiles).toEqual(["e2e/flows/stock/search.yaml"]);
    expect(result.tags).toEqual(["smoke"]);
  });

  it("SHOULD union the tags of several modules, first match per file wins", () => {
    const result = selectImpact({
      back: ["src/api/stock/a.ts"],
      front: [
        "src/application/useCases/cases/financial/a.ts",
        "src/presentation/screens/Financial/b.tsx",
      ],
    });

    expect(result.tags).toEqual(["financial", "smoke", "stock"].sort());
    expect(result.reasons).toHaveLength(3);
  });

  it("SHOULD map auth screens to auth + account", () => {
    const result = selectImpact({
      back: [],
      front: ["src/presentation/screens/Login/index.tsx"],
    });

    expect(result.tags).toEqual(["account", "auth", "smoke"]);
  });
});
