import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { GenericError } from "@domain/entities/errors";
import StockEntityFixture from "@domain/entities/stock/mocks/StockEntity.fixture";
import Repositories from "@domain/repositories";

import getAiUsageUseCase from "./getAiUsageUseCase";
import lookupStockBarcodeUseCase from "./lookupStockBarcodeUseCase";
import suggestStockItemUseCase from "./suggestStockItemUseCase";

const repository = jest.mocked(repositoriesMocks.stockRepository);
const repositories = repositoriesMocks as unknown as Repositories;
const usage = {
  light: { limit: 50, used: 1 },
  search: { limit: 10, used: 0 },
};

beforeEach(() => jest.clearAllMocks());

describe("lookupStockBarcodeUseCase", () => {
  it("SHOULD map the matched items to DTOs AND keep the owner data", async () => {
    const item = new StockEntityFixture().withDefault().build();

    repository.lookupStockBarcode.mockResolvedValue({
      code: "123",
      matches: [
        {
          item,
          owner: "USER",
          ownerId: "u",
          ownerName: "Pessoal",
          readOnly: false,
        },
      ],
    });

    const result = await lookupStockBarcodeUseCase(repositories).execute({
      code: "123",
    });

    expect(repository.lookupStockBarcode).toHaveBeenCalledWith("123");
    expect(result.matches[0]).toMatchObject({
      ownerName: "Pessoal",
      readOnly: false,
    });
    expect(result.matches[0].item.id).toBe(item.id);
  });

  it("SHOULD add its name to the context of a default error AND rethrow", async () => {
    const error = new GenericError();

    repository.lookupStockBarcode.mockRejectedValue(error);

    await expect(
      lookupStockBarcodeUseCase(repositories).execute({ code: "1" }),
    ).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: "lookupStockBarcodeUseCase",
    });
  });
});

describe("suggestStockItemUseCase", () => {
  it("SHOULD pass the request to the repository AND return the suggestion", async () => {
    const suggestion = { fields: { description: "Leite" }, sources: {}, usage };

    repository.suggestStockItem.mockResolvedValue(suggestion);

    const params = { barcode: "123", owner: "USER", ownerId: "u" };

    expect(await suggestStockItemUseCase(repositories).execute(params)).toBe(
      suggestion,
    );
    expect(repository.suggestStockItem).toHaveBeenCalledWith(params);
  });

  it("SHOULD rethrow a failure", async () => {
    repository.suggestStockItem.mockRejectedValue(new Error("boom"));

    await expect(
      suggestStockItemUseCase(repositories).execute({
        name: "abc",
        owner: "USER",
        ownerId: "u",
      }),
    ).rejects.toThrow("boom");
  });
});

describe("getAiUsageUseCase", () => {
  it("SHOULD return the usage of today", async () => {
    repository.getAiUsage.mockResolvedValue(usage);

    expect(await getAiUsageUseCase(repositories).execute()).toBe(usage);
  });
});
