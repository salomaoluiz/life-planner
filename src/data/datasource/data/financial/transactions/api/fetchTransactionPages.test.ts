import TransactionModel from "@data/models/financial/TransactionModel";
import { api } from "@infrastructure/api";

import fetchTransactionPages from "./fetchTransactionPages";

jest.mock("@infrastructure/api", () => ({ api: { get: jest.fn() } }));

const get = api.get as jest.Mock;
const month =
  "/v1/finance/transactions?ownerId=o1&from=2026-11-01&to=2026-11-30";

beforeEach(() => {
  jest.clearAllMocks();
});

// A lean item (spec 079): ids only; the names come from the lookups of its page.
function row(id: number | string, categoryId = "c1") {
  return {
    categoryId,
    date: "2026-11-03",
    description: "d",
    id: String(id),
    owner: "USER",
    ownerId: "o1",
    tagIds: ["g1"],
    type: "EXPENSE",
    value: 100,
  };
}
const lookups = {
  categories: { c1: { name: "Food" }, c2: { name: "Home" } },
  tags: { g1: { name: "weekly" } },
};

it("SHOULD concatenate the pages in order WHEN nextCursor is set", async () => {
  get
    .mockResolvedValueOnce({ items: [row(1)], lookups, nextCursor: "abc" })
    .mockResolvedValueOnce({ items: [row(2)], lookups, nextCursor: null });

  const rows = await fetchTransactionPages(month);

  expect(rows.map((item) => item.id)).toEqual(["1", "2"]);
  expect(rows[0]).toBeInstanceOf(TransactionModel);
  expect(get).toHaveBeenNthCalledWith(1, `${month}&limit=200`);
  expect(get).toHaveBeenNthCalledWith(2, `${month}&limit=200&cursor=abc`);
});

it("SHOULD join each item with the lookups of ITS page (category name, tag names)", async () => {
  get
    .mockResolvedValueOnce({
      items: [row(1, "c1")],
      lookups: { ...lookups, categories: { c1: { name: "Food" } } },
      nextCursor: "abc",
    })
    .mockResolvedValueOnce({
      items: [row(2, "c2")],
      lookups: { ...lookups, categories: { c2: { name: "Home" } } },
      nextCursor: null,
    });

  const rows = await fetchTransactionPages(month);

  expect(rows.map((item) => item.category)).toEqual(["Food", "Home"]);
  expect(rows[0].tags).toEqual([{ id: "g1", name: "weekly" }]);
});

it("SHOULD load all the pages of a month bigger than a page", async () => {
  Array.from({ length: 6 }).forEach((_, index) =>
    get.mockResolvedValueOnce({
      items: Array.from({ length: 50 }, (_, r) => row(index * 50 + r)),
      lookups,
      nextCursor: index < 5 ? `c${index}` : null,
    }),
  );

  const rows = await fetchTransactionPages(month);

  expect(rows).toHaveLength(300);
  expect(rows.map((item) => item.id)).toEqual(
    Array.from({ length: 300 }, (_, i) => String(i)),
  );
});

it("SHOULD accept a card invoice month instead of a period", async () => {
  get.mockResolvedValueOnce({ items: [], lookups, nextCursor: null });

  await expect(
    fetchTransactionPages(
      "/v1/finance/transactions?ownerId=o1&source=CARD&invoiceMonth=2026-11",
    ),
  ).resolves.toEqual([]);
});

it("SHOULD throw WITHOUT calling the API WHEN the URL has no period", async () => {
  await expect(
    fetchTransactionPages("/v1/finance/transactions?ownerId=o1"),
  ).rejects.toThrow("needs a period");
  await expect(
    fetchTransactionPages(
      "/v1/finance/transactions?ownerId=o1&from=2026-11-01",
    ),
  ).rejects.toThrow("needs a period");
  expect(get).not.toHaveBeenCalled();
});
