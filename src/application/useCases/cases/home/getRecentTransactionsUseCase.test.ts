import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getRecentTransactionsUseCase.mocks";

const { transaction } = mocks;
const getTransactions = spies.financialRepository.transaction.getTransactions;
const getCategories = spies.financialRepository.category.getCategories;

it("SHOULD read transactions and categories of the selected owners", async () => {
  await setup();

  expect(getTransactions).toHaveBeenCalledWith(mocks.ownerIds);
  expect(getCategories).toHaveBeenCalledWith(mocks.ownerIds);
});

it("SHOULD return the newest first, keeping the repository order for the same date", async () => {
  getTransactions.mockResolvedValueOnce([
    transaction("old", new Date(2026, 8, 20)),
    transaction("new-first", new Date(2026, 9, 3)),
    transaction("new-second", new Date(2026, 9, 3)),
    transaction("mid", new Date(2026, 9, 1)),
  ]);

  const result = await setup();

  expect(result.map((t) => t.id)).toEqual([
    "new-first",
    "new-second",
    "mid",
    "old",
  ]);
});

it("SHOULD return only 5 transactions by default AND honor `limit`", async () => {
  const many = Array.from({ length: 8 }, (_, i) =>
    transaction(`t${i}`, new Date(2026, 9, 1 + i)),
  );
  getTransactions.mockResolvedValue(many);

  expect(await setup()).toHaveLength(5);
  expect(await setup({ limit: 2 })).toHaveLength(2);
});

it("SHOULD join the category icon, color and name AND expose the value in cents", async () => {
  getTransactions.mockResolvedValueOnce([
    transaction("t1", new Date(2026, 9, 3), "312.90"),
  ]);

  const [result] = await setup();

  expect(result).toMatchObject({
    categoryColor: "#2E7D32",
    categoryIcon: "cart",
    categoryName: "Groceries",
    id: "t1",
    type: "EXPENSE",
    value: 31290,
  });
});

it("SHOULD fall back to the transaction category name WHEN the category is not found", async () => {
  getCategories.mockResolvedValueOnce([]);
  getTransactions.mockResolvedValueOnce([
    transaction("t1", new Date(2026, 9, 3)),
  ]);

  const [result] = await setup();

  expect(result.categoryName).toBe("Groceries");
  expect(result.categoryIcon).toBeUndefined();
  expect(result.categoryColor).toBeUndefined();
});

it("SHOULD return an empty list WHEN there are no transactions", async () => {
  expect(await setup()).toEqual([]);
});

it("SHOULD rethrow an unknown error untouched", async () => {
  getTransactions.mockRejectedValueOnce(mocks.errors.unknown);

  expect(await setupThrowable()).toBe(mocks.errors.unknown);
});

it("SHOULD add the use case to the context of a business error", async () => {
  getTransactions.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "home.getRecentTransactionsUseCase",
  });
});
