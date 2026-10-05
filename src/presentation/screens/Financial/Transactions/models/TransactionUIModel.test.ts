import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";

import TransactionUIModel from "./TransactionUIModel";

function dto(
  overrides: Partial<ConstructorParameters<typeof TransactionDTO>[0]> = {},
) {
  return new TransactionDTO({
    accountId: "account-id",
    accountName: "Checking",
    category: "Food",
    categoryId: "cat-1",
    categoryName: "Groceries",
    date: new Date(2026, 8, 30).toISOString(),
    description: "Weekly shop",
    id: "tx-1",
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    value: "312.90",
    ...overrides,
  });
}

const category = new CategoryDTO({
  icon: "cart",
  iconColor: "#3B82F6",
  id: "cat-1",
  name: "Groceries",
  owner: "USER",
  ownerId: "user-id",
  type: "EXPENSE",
});

it("SHOULD convert the decimal value to integer cents", () => {
  expect(new TransactionUIModel(dto()).amountCents).toBe(31290);
  expect(new TransactionUIModel(dto({ value: "0.05" })).amountCents).toBe(5);
});

it("SHOULD sign expenses negative and incomes positive", () => {
  expect(new TransactionUIModel(dto()).signedCents).toBe(-31290);
  expect(new TransactionUIModel(dto({ type: "INCOME" })).signedCents).toBe(
    31290,
  );
});

it("SHOULD expose the type for AmountText and isExpense", () => {
  const model = new TransactionUIModel(dto({ type: "INCOME" }));

  expect(model.amountType).toBe("INCOME");
  expect(model.isExpense).toBe(false);
});

it("SHOULD build the subtitle from category and account", () => {
  expect(new TransactionUIModel(dto()).subtitle).toBe("Groceries · Checking");
  expect(new TransactionUIModel(dto({ accountName: undefined })).subtitle).toBe(
    "Groceries",
  );
});

it("SHOULD use the category icon and color, with safe fallbacks", () => {
  const withCategory = new TransactionUIModel(dto(), category);
  const without = new TransactionUIModel(dto());

  expect(withCategory.categoryIcon).toBe("cart");
  expect(withCategory.categoryColor).toBe("#3B82F6");
  expect(without.categoryIcon).toBe("help-circle-outline");
  expect(without.categoryColor).toBe("#000000");
});

it("SHOULD map the legacy black color token to a hex", () => {
  const legacy = new CategoryDTO({
    icon: "cart",
    id: "cat-1",
    name: "Groceries",
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
  });

  expect(new TransactionUIModel(dto(), legacy).categoryColor).toBe("#000000");
});

it("SHOULD build the local date key", () => {
  expect(
    new TransactionUIModel(dto({ date: new Date(2026, 0, 5).toISOString() }))
      .dateKey,
  ).toBe("2026-01-05");
});
