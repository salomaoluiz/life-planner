import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import SplitModel from "@data/models/financial/SplitModel";
import TransactionModel from "@data/models/financial/TransactionModel";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import splitRepositoryImpl from "./splitRepositoryImpl";

jest.mock("@infrastructure/cache", () => ({
  __esModule: true,
  CacheStringKeys: {
    CACHE_FINANCIAL_ACCOUNT_DATA: "account",
    CACHE_FINANCIAL_TRANSACTION_DATA: "transaction",
  },
  default: { invalidate: jest.fn() },
}));

const splitDatasource = jest.mocked(datasourcesMocks.financialSplitDatasource);
const split = SplitModel.fromJSON({
  currency: "BRL",
  date: "2026-11-15",
  description: "Mercado",
  id: "split-1",
  owner: "USER",
  ownerId: "owner-1",
  total: 17000,
  type: "EXPENSE",
});
const part = TransactionModel.fromJSON({
  categoryId: "cat-1",
  date: "2026-11-15",
  description: "Mercado",
  id: "row-1",
  owner: "USER",
  ownerId: "owner-1",
  split: {
    description: "Mercado",
    matchedCount: 1,
    matchedTotal: "50.00",
    partCount: 2,
    total: "170.00",
    type: "EXPENSE",
  },
  splitId: "split-1",
  type: "EXPENSE",
  value: 5000,
});
const result = { parts: [part], split };
const repository = splitRepositoryImpl(datasourcesMocks);

beforeEach(() => {
  jest.clearAllMocks();
  splitDatasource.createSplit.mockResolvedValue(result);
  splitDatasource.getSplit.mockResolvedValue(result);
  splitDatasource.updateSplit.mockResolvedValue({ result });
});

function expectCachesInvalidated() {
  expect(cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
  );
  expect(cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
  );
}

const params = {
  accountId: "a",
  date: "2026-11-15T03:00:00.000Z",
  description: "Mercado",
  parts: [{ categoryId: "c", type: "EXPENSE" as const, value: "10.00" }],
};

it("SHOULD create through the datasource, invalidate the lists and balances AND return entities with the split lookup", async () => {
  const created = await repository.createSplit(params);

  expect(splitDatasource.createSplit).toHaveBeenCalledWith(params);
  expectCachesInvalidated();
  expect(created.split.total).toBe("170.00");
  expect(created.parts[0].splitId).toBe("split-1");
  expect(created.parts[0].split?.matchedCount).toBe(1);
});

it("SHOULD read a split WITHOUT touching the caches", async () => {
  await repository.getSplit("split-1");

  expect(splitDatasource.getSplit).toHaveBeenCalledWith("split-1");
  expect(cache.invalidate).not.toHaveBeenCalled();
});

it("SHOULD update AND answer the dissolved transaction WHEN one part was left", async () => {
  expect(
    (await repository.updateSplit({ id: "split-1", paid: true })).result?.split
      .id,
  ).toBe("split-1");
  splitDatasource.updateSplit.mockResolvedValueOnce({ dissolved: part });

  const dissolved = await repository.updateSplit({
    id: "split-1",
    parts: params.parts,
  });

  expect(dissolved.dissolved?.id).toBe("row-1");
  expect(dissolved.result).toBeUndefined();
  expectCachesInvalidated();
});

it("SHOULD delete AND invalidate the caches", async () => {
  await repository.deleteSplit("split-1");

  expect(splitDatasource.deleteSplit).toHaveBeenCalledWith("split-1");
  expectCachesInvalidated();
});
