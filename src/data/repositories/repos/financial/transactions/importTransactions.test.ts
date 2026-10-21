import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import importTransactions from "./importTransactions";

jest.mock("@infrastructure/cache", () => ({
  __esModule: true,
  CacheStringKeys: {
    CACHE_FINANCIAL_ACCOUNT_DATA: "account",
    CACHE_FINANCIAL_TAG_DATA: "tag",
    CACHE_FINANCIAL_TRANSACTION_DATA: "transaction",
  },
  default: { invalidate: jest.fn() },
}));

const params = { owner: OwnerType.USER, ownerId: "o1", rows: [] };

beforeEach(() => jest.clearAllMocks());

describe("importTransactions", () => {
  it("SHOULD hand the rows to the datasource and return how many were created", async () => {
    jest
      .mocked(
        datasourcesMocks.financialTransactionDatasource.importTransactions,
      )
      .mockResolvedValueOnce(4);

    expect(await importTransactions(params, datasourcesMocks)).toBe(4);
    expect(
      datasourcesMocks.financialTransactionDatasource.importTransactions,
    ).toHaveBeenCalledWith(params);
  });

  it("SHOULD refresh the transactions, the account balances and the tags", async () => {
    jest
      .mocked(
        datasourcesMocks.financialTransactionDatasource.importTransactions,
      )
      .mockResolvedValueOnce(1);

    await importTransactions(params, datasourcesMocks);

    expect(cache.invalidate).toHaveBeenCalledWith(
      CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
    );
    expect(cache.invalidate).toHaveBeenCalledWith(
      CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
    );
    expect(cache.invalidate).toHaveBeenCalledWith(
      CacheStringKeys.CACHE_FINANCIAL_TAG_DATA,
    );
  });

  it("SHOULD leave the caches alone WHEN the import fails", async () => {
    jest
      .mocked(
        datasourcesMocks.financialTransactionDatasource.importTransactions,
      )
      .mockRejectedValueOnce(new Error("refused"));

    await expect(importTransactions(params, datasourcesMocks)).rejects.toThrow(
      "refused",
    );
    expect(cache.invalidate).not.toHaveBeenCalled();
  });
});
