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

it("SHOULD expose the 12 palette colors with financial.colors keys", () => {
  const options = build().colorOptions;

  expect(options).toHaveLength(12);
  options.forEach((option) =>
    expect(option.labelKey).toMatch(/^financial\.colors\./),
  );
});

it("SHOULD return the 12 common icons, the 18 full set or a search over the full set", () => {
  const model = build();

  expect(model.iconOptions("", false)).toHaveLength(12);
  expect(model.iconOptions("", true)).toHaveLength(18);
  expect(model.iconOptions("", false)[0]).toEqual({
    label: expect.any(String),
    value: expect.any(String),
  });
  expect(model.iconOptions("heart", false).map((o) => o.value)).toEqual([
    "heart",
  ]);
});

it("SHOULD expose type options, owner choices and owner lookup", () => {
  const model = build();

  expect(model.typeOptions.map((o) => o.value)).toEqual(["EXPENSE", "INCOME"]);
  expect(model.ownerChoices.length).toBeGreaterThan(0);
  expect(model.ownerName("family-1")).toBe("Family");
  expect(model.owner("missing").id).toBe("user-id");
});
