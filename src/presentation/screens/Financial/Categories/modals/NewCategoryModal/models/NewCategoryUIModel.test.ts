import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import NewCategoryUIModel from "./NewCategoryUIModel";

function cat(
  id: string,
  overrides: Partial<ConstructorParameters<typeof CategoryDTO>[0]> = {},
) {
  return new CategoryDTO({
    icon: "folder",
    id,
    name: id,
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    ...overrides,
  });
}

const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Family", type: OwnerType.FAMILY }),
];

function build(
  categories: CategoryDTO[] = [],
  transactions: TransactionDTO[] = [],
) {
  return new NewCategoryUIModel({ categories, owners, transactions });
}

const state = { ownerId: "user-id", type: "EXPENSE" };

it("SHOULD list only parents of the same owner and type with depth", () => {
  const model = build([
    cat("a"),
    cat("b", { parentId: "a" }),
    cat("income", { type: "INCOME" }),
    cat("fam", { ownerId: "family-1" }),
  ]);

  expect(model.parentOptions(state)).toEqual([
    { depth: 0, label: "a", value: "a" },
    { depth: 1, label: "b", value: "b" },
  ]);
});

it("SHOULD exclude the edited category and its descendants from the parent options", () => {
  const model = build([
    cat("a"),
    cat("b", { parentId: "a" }),
    cat("c", { parentId: "b" }),
    cat("other"),
  ]);

  expect(model.parentOptions(state, "a").map((o) => o.value)).toEqual([
    "other",
  ]);
  expect(model.parentOptions(state, "b").map((o) => o.value)).toEqual([
    "a",
    "other",
  ]);
});

it("SHOULD report children, parent and transactions", () => {
  const model = build(
    [cat("p"), cat("c", { parentId: "p" })],
    [
      new TransactionDTO({
        accountId: "a1",
        category: "c",
        categoryId: "c",
        date: new Date(2026, 8, 30).toISOString(),
        description: "Shop",
        id: "t1",
        owner: "USER",
        ownerId: "user-id",
        type: "EXPENSE",
        value: "10.00",
      }),
    ],
  );

  expect(model.hasChildren("p")).toBe(true);
  expect(model.hasChildren("c")).toBe(false);
  expect(model.hasParent("c")).toBe(true);
  expect(model.hasParent("p")).toBe(false);
  expect(model.hasTransactions("c")).toBe(true);
  expect(model.hasTransactions("p")).toBe(false);
});

it("SHOULD expose the 19 palette colors with financial.colors keys", () => {
  const options = build().colorOptions;

  expect(options).toHaveLength(19);
  options.forEach((option) =>
    expect(option.labelKey).toMatch(/^financial\.colors\./),
  );
});

it("SHOULD always return the 12 bundled common icons for the quick row", () => {
  const options = build().iconOptions();

  expect(options).toHaveLength(12);
  expect(options[0]).toEqual({ label: "folder", value: "folder" });
});

it("SHOULD expose type options, owner choices and owner lookup", () => {
  const model = build();

  expect(model.typeOptions.map((o) => o.value)).toEqual(["EXPENSE", "INCOME"]);
  expect(model.ownerChoices.length).toBeGreaterThan(0);
  expect(model.ownerName("family-1")).toBe("Family");
  expect(model.owner("missing").id).toBe("user-id");
});

describe("scope ALL", () => {
  const all = cat("all", {
    scope: "ALL",
    scopeOwnerIds: ["user-id", "family-1"],
  });
  const plain = cat("plain");

  it("SHOULD add the All choice last", () => {
    const values = build().ownerChoices.map((choice) => choice.value);

    expect(values).toEqual(["user-id", "family-1", "ALL"]);
  });

  it("SHOULD offer only the current owner and All WHEN editing a single-scope category", () => {
    expect(
      build()
        .ownerChoicesFor("family-1")
        .map((choice) => choice.value),
    ).toEqual(["family-1", "ALL"]);
    expect(
      build()
        .ownerChoicesFor("ALL")
        .map((choice) => choice.value),
    ).toEqual(["ALL"]);
  });

  it("SHOULD list only All categories as parents of an All category", () => {
    const options = build([all, plain]).parentOptions({
      ownerId: "ALL",
      type: "EXPENSE",
    });

    expect(options.map((option) => option.value)).toEqual(["all"]);
  });

  it("SHOULD NOT list an All category as parent of a single-scope category", () => {
    const options = build([all, plain]).parentOptions({
      ownerId: "user-id",
      type: "EXPENSE",
    });

    expect(options.map((option) => option.value)).toEqual(["plain"]);
  });
});
