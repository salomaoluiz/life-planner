import { api } from "@infrastructure/api";

import fetchTransactionPages from "./fetchTransactionPages";

jest.mock("@infrastructure/api", () => ({ api: { get: jest.fn() } }));

const get = api.get as jest.Mock;
const month =
  "/v1/finance/transactions?ownerId=o1&from=2026-11-01&to=2026-11-30";

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD concatenate the pages in order WHEN nextCursor is set", async () => {
  get
    .mockResolvedValueOnce({ items: [{ id: 1 }], nextCursor: "abc" })
    .mockResolvedValueOnce({ items: [{ id: 2 }], nextCursor: null });

  expect(await fetchTransactionPages(month)).toEqual([{ id: 1 }, { id: 2 }]);
  expect(get).toHaveBeenNthCalledWith(1, `${month}&limit=200`);
  expect(get).toHaveBeenNthCalledWith(2, `${month}&limit=200&cursor=abc`);
});

it("SHOULD load all the pages of a month bigger than a page", async () => {
  Array.from({ length: 6 }).forEach((_, index) =>
    get.mockResolvedValueOnce({
      items: Array.from({ length: 50 }, (_, row) => ({ id: index * 50 + row })),
      nextCursor: index < 5 ? `c${index}` : null,
    }),
  );

  const rows = await fetchTransactionPages(month);

  expect(rows).toHaveLength(300);
  expect(rows.map((row) => row.id)).toEqual(
    Array.from({ length: 300 }, (_, i) => i),
  );
});

it("SHOULD accept a card invoice month instead of a period", async () => {
  get.mockResolvedValueOnce({ items: [], nextCursor: null });

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
