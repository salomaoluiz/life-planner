import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError, GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import createInvestmentAssetUseCase from "./createInvestmentAssetUseCase";
import createInvestmentFixedIncomeContributionUseCase from "./createInvestmentFixedIncomeContributionUseCase";
import createInvestmentFixedIncomeRateUseCase from "./createInvestmentFixedIncomeRateUseCase";
import createInvestmentFixedIncomeRedemptionUseCase from "./createInvestmentFixedIncomeRedemptionUseCase";
import createInvestmentFixedIncomeTitleUseCase from "./createInvestmentFixedIncomeTitleUseCase";
import createInvestmentOperationUseCase from "./createInvestmentOperationUseCase";
import deleteInvestmentAssetUseCase from "./deleteInvestmentAssetUseCase";
import deleteInvestmentFixedIncomeAdjustmentUseCase from "./deleteInvestmentFixedIncomeAdjustmentUseCase";
import deleteInvestmentFixedIncomeRateUseCase from "./deleteInvestmentFixedIncomeRateUseCase";
import deleteInvestmentOperationUseCase from "./deleteInvestmentOperationUseCase";
import deleteInvestmentValuationUseCase from "./deleteInvestmentValuationUseCase";
import getInvestmentAssetsUseCase from "./getInvestmentAssetsUseCase";
import getInvestmentAssetUseCase from "./getInvestmentAssetUseCase";
import getInvestmentOperationLinkUseCase from "./getInvestmentOperationLinkUseCase";
import getInvestmentPriceHistoryUseCase from "./getInvestmentPriceHistoryUseCase";
import previewInvestmentFixedIncomeRedemptionUseCase from "./previewInvestmentFixedIncomeRedemptionUseCase";
import refreshInvestmentQuotesUseCase from "./refreshInvestmentQuotesUseCase";
import searchInvestmentTickersUseCase from "./searchInvestmentTickersUseCase";
import simulateInvestmentFixedIncomeUseCase from "./simulateInvestmentFixedIncomeUseCase";
import updateInvestmentAssetUseCase from "./updateInvestmentAssetUseCase";
import updateInvestmentFixedIncomeRateUseCase from "./updateInvestmentFixedIncomeRateUseCase";
import updateInvestmentOperationUseCase from "./updateInvestmentOperationUseCase";
import upsertInvestmentFixedIncomeAdjustmentUseCase from "./upsertInvestmentFixedIncomeAdjustmentUseCase";
import upsertInvestmentFixedIncomeTermsUseCase from "./upsertInvestmentFixedIncomeTermsUseCase";
import upsertInvestmentValuationUseCase from "./upsertInvestmentValuationUseCase";

type Factory = (repositories: Repositories) => {
  execute: (params: never) => Promise<unknown>;
  uniqueName: string;
};

const cases: [Factory, keyof Repositories["investmentRepository"], string][] = [
  [
    createInvestmentAssetUseCase,
    "createAsset",
    "investment.createInvestmentAssetUseCase",
  ],
  [
    createInvestmentOperationUseCase,
    "createOperation",
    "investment.createInvestmentOperationUseCase",
  ],
  [
    deleteInvestmentAssetUseCase,
    "deleteAsset",
    "investment.deleteInvestmentAssetUseCase",
  ],
  [
    deleteInvestmentOperationUseCase,
    "deleteOperation",
    "investment.deleteInvestmentOperationUseCase",
  ],
  [
    deleteInvestmentValuationUseCase,
    "deleteValuation",
    "investment.deleteInvestmentValuationUseCase",
  ],
  [
    getInvestmentAssetUseCase,
    "getAsset",
    "investment.getInvestmentAssetUseCase",
  ],
  [
    getInvestmentAssetsUseCase,
    "getAssets",
    "investment.getInvestmentAssetsUseCase",
  ],
  [
    getInvestmentOperationLinkUseCase,
    "getOperationLink",
    "investment.getInvestmentOperationLinkUseCase",
  ],
  [
    getInvestmentPriceHistoryUseCase,
    "getPriceHistory",
    "investment.getInvestmentPriceHistoryUseCase",
  ],
  [
    refreshInvestmentQuotesUseCase,
    "refreshQuotes",
    "investment.refreshInvestmentQuotesUseCase",
  ],
  [
    searchInvestmentTickersUseCase,
    "searchTickers",
    "investment.searchInvestmentTickersUseCase",
  ],
  [
    updateInvestmentAssetUseCase,
    "updateAsset",
    "investment.updateInvestmentAssetUseCase",
  ],
  [
    updateInvestmentOperationUseCase,
    "updateOperation",
    "investment.updateInvestmentOperationUseCase",
  ],
  [
    upsertInvestmentValuationUseCase,
    "upsertValuation",
    "investment.upsertInvestmentValuationUseCase",
  ],
  [
    createInvestmentFixedIncomeContributionUseCase,
    "createFixedIncomeContribution",
    "investment.createInvestmentFixedIncomeContributionUseCase",
  ],
  [
    createInvestmentFixedIncomeRedemptionUseCase,
    "createFixedIncomeRedemption",
    "investment.createInvestmentFixedIncomeRedemptionUseCase",
  ],
  [
    createInvestmentFixedIncomeTitleUseCase,
    "createFixedIncomeTitle",
    "investment.createInvestmentFixedIncomeTitleUseCase",
  ],
  [
    deleteInvestmentFixedIncomeAdjustmentUseCase,
    "deleteFixedIncomeAdjustment",
    "investment.deleteInvestmentFixedIncomeAdjustmentUseCase",
  ],
  [
    deleteInvestmentFixedIncomeRateUseCase,
    "deleteFixedIncomeRate",
    "investment.deleteInvestmentFixedIncomeRateUseCase",
  ],
  [
    previewInvestmentFixedIncomeRedemptionUseCase,
    "previewFixedIncomeRedemption",
    "investment.previewInvestmentFixedIncomeRedemptionUseCase",
  ],
  [
    simulateInvestmentFixedIncomeUseCase,
    "simulateFixedIncome",
    "investment.simulateInvestmentFixedIncomeUseCase",
  ],
  [
    updateInvestmentFixedIncomeRateUseCase,
    "updateFixedIncomeRate",
    "investment.updateInvestmentFixedIncomeRateUseCase",
  ],
  [
    upsertInvestmentFixedIncomeAdjustmentUseCase,
    "upsertFixedIncomeAdjustment",
    "investment.upsertInvestmentFixedIncomeAdjustmentUseCase",
  ],
  [
    upsertInvestmentFixedIncomeTermsUseCase,
    "upsertFixedIncomeTerms",
    "investment.upsertInvestmentFixedIncomeTermsUseCase",
  ],
] as never;

beforeEach(() => {
  jest.clearAllMocks();
});

describe.each(cases)("%p", (factory, method, context) => {
  const repository = repositoriesMocks.investmentRepository;
  const spy = repository[method] as jest.Mock;

  it("SHOULD call the repository with the params AND return its result", async () => {
    spy.mockResolvedValue("result");

    expect(await factory(repositoriesMocks).execute("params" as never)).toBe(
      "result",
    );
    expect(spy).toHaveBeenCalledWith("params");
  });

  it("SHOULD add the use case to the context of a default error AND rethrow", async () => {
    const error = new BusinessError();
    const addContext = jest.spyOn(error, "addContext");
    spy.mockRejectedValue(error);

    await expect(
      factory(repositoriesMocks).execute("params" as never),
    ).rejects.toBe(error);
    expect(addContext).toHaveBeenCalledWith({ useCase: context });
  });

  it("SHOULD rethrow an unknown error untouched", async () => {
    const error = new Error("boom");
    spy.mockRejectedValue(error);

    await expect(
      factory(repositoriesMocks).execute("params" as never),
    ).rejects.toBe(error);
  });

  it("SHOULD have a unique name under investment", () => {
    expect(factory(repositoriesMocks).uniqueName).toMatch(
      /^investment\.[a-z_]+_use_case$/,
    );
  });
});

it("SHOULD give every use case its own unique name", () => {
  const unique = new Set(
    cases.map(([factory]) => factory(repositoriesMocks).uniqueName),
  );

  expect(unique.size).toBe(cases.length);
  expect(GenericError).toBeDefined();
});

describe("createInvestmentFixedIncomeRateUseCase", () => {
  it("SHOULD pass the asset id AND the rate to the repository", async () => {
    const repository = repositoriesMocks.investmentRepository;

    (repository.createFixedIncomeRate as jest.Mock).mockResolvedValue("detail");

    expect(
      await createInvestmentFixedIncomeRateUseCase(repositoriesMocks).execute({
        assetId: "asset-1",
        rate: { mode: "PREFIXED" as never },
      }),
    ).toBe("detail");
    expect(repository.createFixedIncomeRate).toHaveBeenCalledWith("asset-1", {
      mode: "PREFIXED",
    });
  });

  it("SHOULD add the context AND rethrow a default error", async () => {
    const error = new BusinessError();
    const addContext = jest.spyOn(error, "addContext");

    (
      repositoriesMocks.investmentRepository.createFixedIncomeRate as jest.Mock
    ).mockRejectedValue(error);

    await expect(
      createInvestmentFixedIncomeRateUseCase(repositoriesMocks).execute({
        assetId: "asset-1",
        rate: { mode: "PREFIXED" as never },
      }),
    ).rejects.toBe(error);
    expect(addContext).toHaveBeenCalledWith({
      useCase: "investment.createInvestmentFixedIncomeRateUseCase",
    });
  });

  it("SHOULD rethrow an unknown error untouched", async () => {
    const error = new Error("boom");

    (
      repositoriesMocks.investmentRepository.createFixedIncomeRate as jest.Mock
    ).mockRejectedValue(error);

    await expect(
      createInvestmentFixedIncomeRateUseCase(repositoriesMocks).execute({
        assetId: "asset-1",
        rate: { mode: "PREFIXED" as never },
      }),
    ).rejects.toBe(error);
  });
});
