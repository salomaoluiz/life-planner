import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import getInvestmentMarketIndexesUseCase from "./getInvestmentMarketIndexesUseCase";
import refreshInvestmentMarketIndexesUseCase from "./refreshInvestmentMarketIndexesUseCase";

const repository = repositoriesMocks.investmentRepository;

beforeEach(() => {
  jest.clearAllMocks();
});

describe.each([
  [
    getInvestmentMarketIndexesUseCase,
    "getMarketIndexes",
    "investment.getInvestmentMarketIndexesUseCase",
  ],
  [
    refreshInvestmentMarketIndexesUseCase,
    "refreshMarketIndexes",
    "investment.refreshInvestmentMarketIndexesUseCase",
  ],
] as const)("%p", (factory, method, context) => {
  const spy = repository[method] as jest.Mock;

  it("SHOULD call the repository AND return its result", async () => {
    spy.mockResolvedValue("result");

    expect(await factory(repositoriesMocks).execute()).toBe("result");
    expect(spy).toHaveBeenCalledWith();
  });

  it("SHOULD add the use case to the context of a default error AND rethrow", async () => {
    const error = new BusinessError();
    const addContext = jest.spyOn(error, "addContext");

    spy.mockRejectedValue(error);

    await expect(factory(repositoriesMocks).execute()).rejects.toBe(error);
    expect(addContext).toHaveBeenCalledWith({ useCase: context });
  });

  it("SHOULD rethrow any other error as it is", async () => {
    const error = new Error("boom");

    spy.mockRejectedValue(error);

    await expect(factory(repositoriesMocks).execute()).rejects.toBe(error);
  });
});
