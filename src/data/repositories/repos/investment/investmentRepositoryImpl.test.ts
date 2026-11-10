import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import { InvestmentAssetStatus } from "@domain/entities/investment/enums";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import investmentRepositoryImpl from "./investmentRepositoryImpl";

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD forward every method to the datasource and return its result", async () => {
  const repository = investmentRepositoryImpl(datasourcesMocks);
  const datasource = jest.mocked(datasourcesMocks.investmentDatasource);
  const results: [keyof typeof datasource, unknown[]][] = [
    ["createAsset", [{ name: "x" }]],
    ["createOperation", [{ assetId: "a" }]],
    ["deleteAsset", ["a"]],
    ["deleteOperation", ["o"]],
    ["deleteValuation", ["v"]],
    ["getAsset", ["a"]],
    ["getAssets", [{ status: InvestmentAssetStatus.ACTIVE }]],
    ["getOperationLink", ["tx"]],
    ["updateAsset", [{ id: "a" }]],
    ["updateOperation", [{ id: "o" }]],
    ["upsertValuation", [{ assetId: "a" }]],
  ];

  for (const [method, args] of results) {
    (datasource[method] as jest.Mock).mockResolvedValue(`${method}-result`);

    const call = repository[method] as (
      ...params: unknown[]
    ) => Promise<unknown>;

    expect(await call(...args)).toBe(`${method}-result`);
    expect(datasource[method]).toHaveBeenCalledWith(...args);
  }
});

it("SHOULD drop the finance caches after an operation write or an asset delete, not after a read or a valuation", async () => {
  const repository = investmentRepositoryImpl(datasourcesMocks);
  const datasource = jest.mocked(datasourcesMocks.investmentDatasource);
  const invalidate = jest.spyOn(cache, "invalidate");
  datasource.createOperation.mockResolvedValue("r" as never);
  datasource.updateOperation.mockResolvedValue("r" as never);
  datasource.deleteOperation.mockResolvedValue(undefined);
  datasource.deleteAsset.mockResolvedValue(undefined);
  datasource.getAssets.mockResolvedValue([]);
  datasource.upsertValuation.mockResolvedValue("r" as never);

  await repository.getAssets({ status: InvestmentAssetStatus.ACTIVE });
  await repository.upsertValuation({ assetId: "a", date: "d", unitPrice: "1" });
  expect(invalidate).not.toHaveBeenCalled();

  for (const write of [
    async () => repository.createOperation({} as never),
    async () => repository.updateOperation({ id: "o" }),
    async () => repository.deleteOperation("o"),
    async () => repository.deleteAsset("a"),
  ]) {
    invalidate.mockClear();
    await write();
    expect(invalidate).toHaveBeenCalledWith(
      CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
    );
    expect(invalidate).toHaveBeenCalledWith(
      CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
    );
  }
});
