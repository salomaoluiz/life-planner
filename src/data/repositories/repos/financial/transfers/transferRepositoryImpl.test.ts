import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import TransferModel from "@data/models/financial/TransferModel";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import transferRepositoryImpl from "./transferRepositoryImpl";

jest.mock("@infrastructure/cache", () => ({
  __esModule: true,
  CacheStringKeys: {
    CACHE_FINANCIAL_ACCOUNT_DATA: "account",
    CACHE_FINANCIAL_TRANSACTION_DATA: "transaction",
  },
  default: { invalidate: jest.fn() },
}));

const transferDatasource = jest.mocked(
  datasourcesMocks.financialTransferDatasource,
);
const transfer = TransferModel.fromJSON({
  amountOut: 100000,
  currencyIn: "BRL",
  currencyOut: "BRL",
  dateIn: "2026-11-04",
  dateOut: "2026-11-04",
  description: "Savings",
  id: "transfer-1",
  paid: true,
});
const result = { rows: [], transfer };
const repository = transferRepositoryImpl(datasourcesMocks);

beforeEach(() => {
  jest.clearAllMocks();
  transferDatasource.createTransfer.mockResolvedValue(result);
  transferDatasource.updateTransfer.mockResolvedValue(result);
  transferDatasource.getTransfer.mockResolvedValue(result);
});

function expectCachesInvalidated() {
  expect(cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
  );
  expect(cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
  );
}

it("SHOULD create through the datasource, invalidate the lists and balances AND return entities", async () => {
  const created = await repository.createTransfer({
    amountOut: "1000.00",
    dateOut: "2026-11-04T03:00:00.000Z",
    description: "Savings",
    fromAccountId: "a",
    paid: true,
    toAccountId: "b",
  });

  expect(transferDatasource.createTransfer).toHaveBeenCalledWith(
    expect.objectContaining({ amountOut: "1000.00", fromAccountId: "a" }),
  );
  expectCachesInvalidated();
  expect(created.transfer.id).toBe("transfer-1");
  expect(created.rows).toEqual([]);
});

it("SHOULD update AND invalidate", async () => {
  await repository.updateTransfer({
    id: "transfer-1",
    paid: false,
    scope: "ONLY_THIS",
  });

  expect(transferDatasource.updateTransfer).toHaveBeenCalledWith(
    expect.objectContaining({
      id: "transfer-1",
      paid: false,
      scope: "ONLY_THIS",
    }),
  );
  expectCachesInvalidated();
});

it("SHOULD delete AND invalidate", async () => {
  await repository.deleteTransfer({ id: "transfer-1", scope: "THIS_AND_NEXT" });

  expect(transferDatasource.deleteTransfer).toHaveBeenCalledWith({
    id: "transfer-1",
    scope: "THIS_AND_NEXT",
  });
  expectCachesInvalidated();
});

it("SHOULD read a transfer without touching the caches", async () => {
  const found = await repository.getTransfer("transfer-1");

  expect(transferDatasource.getTransfer).toHaveBeenCalledWith("transfer-1");
  expect(found.transfer.id).toBe("transfer-1");
  expect(cache.invalidate).not.toHaveBeenCalled();
});
