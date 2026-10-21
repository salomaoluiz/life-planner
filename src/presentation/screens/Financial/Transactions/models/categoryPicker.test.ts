import {
  buildCategoryGroups,
  checkState,
  PickerCategory,
  toggleCategory,
} from "./categoryPicker";

function category(
  id: string,
  name: string,
  overrides: Partial<PickerCategory> = {},
): PickerCategory {
  return { archived: false, id, name, type: "EXPENSE", ...overrides };
}

const categories = [
  category("market", "Market"),
  category("greens", "Greens", { parentId: "market" }),
  category("butcher", "Butcher", { parentId: "market" }),
  category("pharmacy", "Pharmacy"),
  category("salary", "Salary", { type: "INCOME" }),
  category("gym", "Gym", { archived: true }),
];

describe("buildCategoryGroups", () => {
  it("SHOULD group expenses, income and archived, with children under their parent", () => {
    const groups = buildCategoryGroups(categories);

    expect(groups.map((group) => group.kind)).toEqual([
      "EXPENSE",
      "INCOME",
      "ARCHIVED",
    ]);
    expect(groups[0].nodes.map((node) => node.category.id)).toEqual([
      "market",
      "pharmacy",
    ]);
    expect(groups[0].nodes[0].children.map((n) => n.category.id)).toEqual([
      "greens",
      "butcher",
    ]);
  });

  it("SHOULD keep the matching rows and their parents when searching, ignoring accents", () => {
    const groups = buildCategoryGroups(
      [...categories, category("cafe", "Café", { parentId: "market" })],
      "cafe",
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].nodes[0].category.id).toBe("market");
    expect(groups[0].nodes[0].children.map((n) => n.category.id)).toEqual([
      "cafe",
    ]);
  });
});

describe("checkState / toggleCategory", () => {
  const groups = buildCategoryGroups(categories);
  const market = groups[0].nodes[0];

  it("SHOULD show a chosen parent and its children as checked", () => {
    const selected = new Set(["market"]);

    expect(checkState(market, selected)).toBe(true);
    expect(checkState(market.children[0], selected, true)).toBe(true);
  });

  it("SHOULD show a parent as mixed WHEN only some children are chosen, and not chosen even when all are", () => {
    expect(checkState(market, new Set(["greens"]))).toBe("mixed");
    expect(checkState(market, new Set(["butcher", "greens"]))).toBe("mixed");
    expect(checkState(market, new Set())).toBe(false);
  });

  it("SHOULD choose a parent and drop the ids under it", () => {
    expect(
      toggleCategory(groups, new Set(["greens"]), "market").sort(),
    ).toEqual(["market"]);
  });

  it("SHOULD unchoose a child of a chosen parent by choosing its siblings instead", () => {
    expect(toggleCategory(groups, new Set(["market"]), "greens")).toEqual([
      "butcher",
    ]);
  });

  it("SHOULD unchoose a chosen row", () => {
    expect(toggleCategory(groups, new Set(["pharmacy"]), "pharmacy")).toEqual(
      [],
    );
  });

  it("SHOULD ignore an unknown id", () => {
    expect(toggleCategory(groups, new Set(["pharmacy"]), "nope")).toEqual([
      "pharmacy",
    ]);
  });
});
