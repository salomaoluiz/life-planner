import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import TransactionUIModel from "@screens/Financial/Transactions/models/TransactionUIModel";

import { buildDescriptionSuggestions } from "./descriptionSuggestions";

const category = new CategoryDTO({
  icon: "car",
  iconColor: "#3B82F6",
  id: "cat-1",
  name: "Transport",
  owner: "USER",
  ownerId: "user-id",
  type: "EXPENSE",
});

function item(
  overrides: Partial<ConstructorParameters<typeof TransactionDTO>[0]> = {},
  withCategory = true,
) {
  return new TransactionUIModel(
    new TransactionDTO({
      accountId: "acc-1",
      category: "Transport",
      categoryId: "cat-1",
      date: new Date(2026, 9, 1).toISOString(),
      description: "Uber",
      id: `tx-${Math.random()}`,
      owner: "USER",
      ownerId: "user-id",
      type: "EXPENSE",
      value: "10.00",
      ...overrides,
    }),
    withCategory ? category : undefined,
  );
}

function run(
  items: TransactionUIModel[],
  query: string,
  archived: string[] = [],
) {
  return buildDescriptionSuggestions({
    archivedOwnerIds: new Set(archived),
    items,
    query,
  });
}

describe("buildDescriptionSuggestions", () => {
  it("SHOULD return nothing under 2 characters (after trim)", () => {
    expect(run([item()], "u")).toEqual([]);
    expect(run([item()], " u ")).toEqual([]);
  });

  it("SHOULD put descriptions that start with the query first AND mark the match", () => {
    const result = run(
      [item({ description: "Reembolso Uber" }), item({ description: "Uber" })],
      "ub",
    );

    expect(result.map((row) => row.label)).toEqual(["Uber", "Reembolso Uber"]);
    expect(result[0].matchRange).toEqual([0, 2]);
    expect(result[1].matchRange).toEqual([10, 12]);
  });

  it("SHOULD ignore case AND accents", () => {
    const result = run([item({ description: "Café da manhã" })], "CAFE");

    expect(result).toHaveLength(1);
    expect(result[0].matchRange).toEqual([0, 4]);
  });

  it("SHOULD leave out system rows, projected rows and archived owners", () => {
    const result = run(
      [
        item({ systemKey: "BALANCE_ADJUSTMENT" }),
        item({ isProjected: true }),
        item({ ownerId: "family-1" }),
      ],
      "ub",
      ["family-1"],
    );

    expect(result).toEqual([]);
  });

  it("SHOULD group repeats into one row using the most recent as template", () => {
    const older = item({ date: new Date(2026, 8, 1).toISOString(), id: "old" });
    const newer = item({ date: new Date(2026, 9, 5).toISOString(), id: "new" });
    const result = run([older, newer], "ub");

    expect(result).toHaveLength(1);
    expect(result[0].template.id).toBe("new");
  });

  it("SHOULD show one row per description, the most recent one, whatever its account, card or category", () => {
    const result = run(
      [
        item({ date: new Date(2026, 7, 1).toISOString(), id: "a" }),
        item({
          accountId: undefined,
          creditCardId: "card-1",
          date: new Date(2026, 9, 9).toISOString(),
          id: "b",
        }),
        item({
          categoryId: "cat-2",
          date: new Date(2026, 8, 1).toISOString(),
          id: "c",
        }),
      ],
      "ub",
    );

    expect(result).toHaveLength(1);
    expect(result[0].template.id).toBe("b");
  });

  it("SHOULD order by usage, then recency, AND stop at 6", () => {
    const rows = [
      item({ description: "Uber A" }),
      item({ description: "Uber B" }),
      item({ description: "Uber B" }),
      ...["C", "D", "E", "F", "G"].map((letter) =>
        item({ description: `Uber ${letter}` }),
      ),
    ];
    const result = run(rows, "ub");

    expect(result).toHaveLength(6);
    expect(result[0].label).toBe("Uber B");
  });

  it("SHOULD give a neutral color when the category is gone", () => {
    const result = run([item({}, false)], "ub");

    expect(result[0].categoryColor).toBeUndefined();
    expect(result[0].categoryIcon).toBe("help-circle-outline");
  });
});
