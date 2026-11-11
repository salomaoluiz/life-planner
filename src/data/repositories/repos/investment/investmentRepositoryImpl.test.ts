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
    ["createFixedIncomeContribution", [{ assetId: "a" }]],
    ["createFixedIncomeRate", ["a", { mode: "PREFIXED" }]],
    ["createFixedIncomeRedemption", [{ assetId: "a" }]],
    ["createFixedIncomeTitle", [{ name: "x" }]],
    ["deleteFixedIncomeAdjustment", ["adj"]],
    ["deleteFixedIncomeRate", ["rate"]],
    ["previewFixedIncomeRedemption", [{ assetId: "a" }]],
    ["simulateFixedIncome", [{ amount: 1 }]],
    ["updateFixedIncomeRate", [{ id: "rate" }]],
    ["upsertFixedIncomeAdjustment", [{ assetId: "a" }]],
    ["upsertFixedIncomeTerms", [{ assetId: "a" }]],
    ["createOperation", [{ assetId: "a" }]],
    ["createEvent", [{ assetId: "a" }]],
    ["createFractionSale", [{ eventId: "e" }]],
    ["approveEventSuggestion", [{ id: "sug" }]],
    ["getEventSuggestions", [{ assetId: "a" }]],
    ["rejectEventSuggestion", ["sug"]],
    ["deleteAsset", ["a"]],
    ["deleteOperation", ["o"]],
    ["deleteValuation", ["v"]],
    ["getAsset", ["a"]],
    ["getAssets", [{ status: InvestmentAssetStatus.ACTIVE }]],
    ["getOperationLink", ["tx"]],
    ["getIncome", ["inc"]],
    ["getIncomeDefaults", [{ assetId: "a" }]],
    ["getIncomeLink", ["tx"]],
    ["getIncomes", [{ assetId: "a" }]],
    ["getIncomeSuggestions", [{}]],
    ["rejectIncomeSuggestion", ["sug"]],
    ["createIncome", [{ assetId: "a" }]],
    ["updateIncome", [{ id: "inc" }]],
    ["receiveIncome", [{ id: "inc" }]],
    ["approveIncomeSuggestion", [{ id: "sug" }]],
    ["deleteIncome", ["inc"]],
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
  datasource.createFixedIncomeContribution.mockResolvedValue("r" as never);
  datasource.createFixedIncomeRedemption.mockResolvedValue("r" as never);
  datasource.createFixedIncomeTitle.mockResolvedValue("r" as never);
  datasource.createIncome.mockResolvedValue("r" as never);
  datasource.updateIncome.mockResolvedValue("r" as never);
  datasource.receiveIncome.mockResolvedValue("r" as never);
  datasource.approveIncomeSuggestion.mockResolvedValue("r" as never);
  datasource.deleteIncome.mockResolvedValue(undefined);
  datasource.createFractionSale.mockResolvedValue("r" as never);
  datasource.createEvent.mockResolvedValue("r" as never);
  datasource.approveEventSuggestion.mockResolvedValue("r" as never);
  datasource.getAssets.mockResolvedValue([]);
  datasource.upsertValuation.mockResolvedValue("r" as never);

  await repository.getAssets({ status: InvestmentAssetStatus.ACTIVE });
  await repository.upsertValuation({ assetId: "a", date: "d", unitPrice: "1" });
  // An event moves no money: only the fraction sale touches the finance rows.
  await repository.createEvent({} as never);
  await repository.approveEventSuggestion({ id: "s" });
  expect(invalidate).not.toHaveBeenCalled();

  for (const write of [
    async () => repository.createOperation({} as never),
    async () => repository.updateOperation({ id: "o" }),
    async () => repository.deleteOperation("o"),
    async () => repository.deleteAsset("a"),
    async () => repository.createFixedIncomeContribution({} as never),
    async () => repository.createFixedIncomeRedemption({} as never),
    async () => repository.createFixedIncomeTitle({} as never),
    async () => repository.createIncome({} as never),
    async () => repository.updateIncome({ id: "i" }),
    async () => repository.receiveIncome({ id: "i" }),
    async () => repository.approveIncomeSuggestion({ id: "s" }),
    async () => repository.deleteIncome("i"),
    async () => repository.createFractionSale({} as never),
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
