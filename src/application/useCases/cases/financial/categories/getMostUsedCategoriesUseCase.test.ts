import { DefaultError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getMostUsedCategoriesUseCase.mocks";

const { daysAgo, makeCategory, makeTransaction } = mocks;

function given(
  categories = [] as ReturnType<typeof makeCategory>[],
  transactions = [] as ReturnType<typeof makeTransaction>[],
) {
  spies.categories.getCategories.mockResolvedValue(categories);
  spies.transactions.getTransactions.mockResolvedValue(transactions);
}

it("SHOULD request only the selected owner", async () => {
  given();

  await setup({ ownerId: "family-1" });

  expect(spies.categories.getCategories).toHaveBeenCalledWith(["family-1"]);
  expect(spies.transactions.getTransactions).toHaveBeenCalledWith(["family-1"]);
});

it("SHOULD rank by number of transactions in the last 90 days, then by name", async () => {
  given(
    [
      makeCategory("a", "Alpha"),
      makeCategory("b", "Bravo"),
      makeCategory("c", "Charlie"),
    ],
    [
      makeTransaction("b", daysAgo(1)),
      makeTransaction("b", daysAgo(2)),
      makeTransaction("c", daysAgo(3)),
      makeTransaction("a", daysAgo(4)),
    ],
  );

  const result = await setup();

  expect(result.map((category) => category.id)).toEqual(["b", "a", "c"]);
});

it("SHOULD ignore transactions older than 90 days and count day 90", async () => {
  given(
    [makeCategory("old", "Old"), makeCategory("edge", "Edge")],
    [
      makeTransaction("old", daysAgo(91)),
      makeTransaction("old", daysAgo(120)),
      makeTransaction("edge", daysAgo(90)),
    ],
  );

  const result = await setup();

  expect(result.map((category) => category.id)).toEqual(["edge", "old"]);
});

it("SHOULD fall back to the first 5 by name WHEN there is no history", async () => {
  given(
    ["g", "f", "e", "d", "c", "b", "a"].map((id) =>
      makeCategory(id, id.toUpperCase()),
    ),
    [],
  );

  const result = await setup();

  expect(result.map((category) => category.id)).toEqual([
    "a",
    "b",
    "c",
    "d",
    "e",
  ]);
});

it("SHOULD fill the remaining slots with unused categories by name", async () => {
  given(
    [
      makeCategory("a", "Alpha"),
      makeCategory("b", "Bravo"),
      makeCategory("z", "Zulu"),
    ],
    [makeTransaction("z", daysAgo(1))],
  );

  const result = await setup({ limit: 2 });

  expect(result.map((category) => category.id)).toEqual(["z", "a"]);
});

it("SHOULD only return categories of the requested type and owner", async () => {
  given(
    [
      makeCategory("exp", "Expense"),
      makeCategory("inc", "Income", { type: "INCOME" }),
      makeCategory("other", "Other owner", { ownerId: "family-1" }),
    ],
    [makeTransaction("inc", daysAgo(1), { type: "INCOME" })],
  );

  const result = await setup();

  expect(result.map((category) => category.id)).toEqual(["exp"]);
});

it("SHOULD not count transactions of the other type", async () => {
  given(
    [makeCategory("a", "Alpha"), makeCategory("b", "Bravo")],
    [makeTransaction("b", daysAgo(1), { type: "INCOME" })],
  );

  const result = await setup();

  expect(result.map((category) => category.id)).toEqual(["a", "b"]);
});

it("SHOULD add the use case context to a DefaultError and rethrow", async () => {
  spies.categories.getCategories.mockRejectedValue(mocks.businessError);
  spies.transactions.getTransactions.mockResolvedValue([]);

  const error = await setupThrowable();

  expect(error).toBe(mocks.businessError);
  expect(error instanceof DefaultError).toBe(true);
});

it("SHOULD rethrow unknown errors untouched", async () => {
  spies.categories.getCategories.mockRejectedValue(mocks.unknownError);
  spies.transactions.getTransactions.mockResolvedValue([]);

  expect(await setupThrowable()).toBe(mocks.unknownError);
});
