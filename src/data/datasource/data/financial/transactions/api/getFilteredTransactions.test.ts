import { api } from "@infrastructure/api";

import getFilteredTransactions from "./getFilteredTransactions";

jest.mock("@infrastructure/api", () => ({ api: { get: jest.fn() } }));
jest.mock("@data/models/financial/TransactionModel", () => ({
  __esModule: true,
  default: { fromJSON: jest.fn((json) => json) },
}));

const get = api.get as jest.Mock;

describe("getFilteredTransactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    get.mockResolvedValue([{ id: "t1" }]);
  });

  it("SHOULD send the owners, today and every account-row filter", async () => {
    const result = await getFilteredTransactions({
      filter: {
        accountIds: ["a1"],
        categoryIds: ["c1"],
        creditCardIds: ["ignored"],
        from: "2025-01-01",
        paid: false,
        q: "mercado",
        tagIds: ["t1"],
        to: "2025-02-28",
      },
      ownerIds: ["o1"],
    });

    const url = get.mock.calls[0][0] as string;

    expect(url).toContain("/v1/finance/transactions?");
    expect(url).toContain("ownerId=o1");
    expect(url).toContain("accountId=a1");
    expect(url).toContain("categoryId=c1");
    expect(url).toContain("from=2025-01-01&to=2025-02-28");
    expect(url).toContain("paid=false");
    expect(url).toContain("q=mercado");
    expect(url).toContain("tagId=t1");
    expect(url).not.toContain("creditCardId");
    expect(result).toEqual([{ id: "t1" }]);
  });

  it("SHOULD return [] without calling the API when there are no owners", async () => {
    expect(await getFilteredTransactions({ filter: {}, ownerIds: [] })).toEqual(
      [],
    );
    expect(get).not.toHaveBeenCalled();
  });

  it("SHOULD wrap an API failure", async () => {
    get.mockRejectedValue(new Error("boom"));

    await expect(
      getFilteredTransactions({ filter: {}, ownerIds: ["o1"] }),
    ).rejects.toBeDefined();
  });
});
