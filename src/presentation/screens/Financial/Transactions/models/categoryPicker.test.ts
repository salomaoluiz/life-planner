import {
  buildCategoryGroups,
  buildCategoryIndex,
  checkState,
  PickerCategory,
  searchCategories,
  SearchOptions,
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

describe("searchCategories", () => {
  const list = [
    category("food", "Food"),
    category("market", "Market", { parentId: "food" }),
    category("bakery", "Bakery", { parentId: "food" }),
    category("sales", "Sales", { type: "INCOME" }),
    category("goods", "Goods", { parentId: "sales", type: "INCOME" }),
    category("old", "Market old", { archived: true }),
    category("misc", "Misc"),
    category("misc-food", "Misc", { parentId: "food" }),
  ];
  const index = buildCategoryIndex(list);
  const none: SearchOptions = { selected: new Set<string>() };

  function ids(query: string, options: SearchOptions = none) {
    return searchCategories(index, query, options).map(
      (r) => r.entry.category.id,
    );
  }

  it("SHOULD match by name, ignoring case, accents and spaces", () => {
    expect(ids("mark")).toEqual(["market", "old"]);
    expect(ids("  MÁRK  ")).toEqual(ids("mark"));
  });

  it("SHOULD return nothing for an empty or blank query", () => {
    expect(ids("")).toEqual([]);
    expect(ids("   ")).toEqual([]);
  });

  it("SHOULD match on the parent name too", () => {
    expect(ids("food")).toEqual(["bakery", "food", "market", "misc-food"]);
  });

  it("SHOULD put the type of the screen first, expenses by default", () => {
    expect(ids("o").slice(0, 1)).toEqual(["bakery"]);
    expect(ids("o", { selected: new Set(), typeFirst: "INCOME" })[0]).toBe(
      "goods",
    );
  });

  it("SHOULD cap the results at 8", () => {
    const many = buildCategoryIndex(
      Array.from({ length: 12 }, (_, i) => category(`c${i}`, `Cat ${i}`)),
    );

    expect(searchCategories(many, "cat", none)).toHaveLength(8);
  });

  it("SHOULD leave out selected ids and mark the ones a selected parent includes", () => {
    const results = searchCategories(index, "food", {
      selected: new Set(["food"]),
    });

    expect(results.map((r) => r.entry.category.id)).not.toContain("food");
    expect(
      results.find((r) => r.entry.category.id === "market")?.coveredBy,
    ).toBe("Food");
  });

  it("SHOULD keep two categories with the same name apart", () => {
    const misc = searchCategories(index, "misc", none);

    expect(misc.map((r) => r.entry.path).sort()).toEqual([
      "Food › Misc",
      "Misc",
    ]);
  });

  it("SHOULD return archived categories and count subcategories", () => {
    expect(
      searchCategories(index, "old", none)[0].entry.category.archived,
    ).toBe(true);
    const food = searchCategories(index, "food", none).find(
      (r) => r.entry.category.id === "food",
    )?.entry;

    expect([food?.childCount, food?.descendantCount]).toEqual([3, 3]);
  });
});
