import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError, GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import createInvestmentAssetUseCase from "./createInvestmentAssetUseCase";
import createInvestmentOperationUseCase from "./createInvestmentOperationUseCase";
import deleteInvestmentAssetUseCase from "./deleteInvestmentAssetUseCase";
import deleteInvestmentOperationUseCase from "./deleteInvestmentOperationUseCase";
import deleteInvestmentValuationUseCase from "./deleteInvestmentValuationUseCase";
import getInvestmentAssetsUseCase from "./getInvestmentAssetsUseCase";
import getInvestmentAssetUseCase from "./getInvestmentAssetUseCase";
import updateInvestmentAssetUseCase from "./updateInvestmentAssetUseCase";
import updateInvestmentOperationUseCase from "./updateInvestmentOperationUseCase";
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
