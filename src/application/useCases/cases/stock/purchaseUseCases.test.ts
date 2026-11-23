import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import changePurchaseStatusUseCase from "./changePurchaseStatusUseCase";
import closePurchaseUseCase from "./closePurchaseUseCase";
import closingLockUseCase from "./closingLockUseCase";
import createMarketUseCase from "./createMarketUseCase";
import deleteClosedPurchaseUseCase from "./deleteClosedPurchaseUseCase";
import deletePurchaseRowUseCase from "./deletePurchaseRowUseCase";
import getClosePreviewUseCase from "./getClosePreviewUseCase";
import getItemPricesUseCase from "./getItemPricesUseCase";
import getListPurchasesUseCase from "./getListPurchasesUseCase";
import getMarketsUseCase from "./getMarketsUseCase";
import getPendingPurchasesUseCase from "./getPendingPurchasesUseCase";
import getPurchaseUseCase from "./getPurchaseUseCase";
import mergePurchaseUseCase from "./mergePurchaseUseCase";
import startPurchaseUseCase from "./startPurchaseUseCase";
import updateClosedPurchaseUseCase from "./updateClosedPurchaseUseCase";
import upsertPurchaseRowUseCase from "./upsertPurchaseRowUseCase";

const repository = jest.mocked(repositoriesMocks.stockRepository);
const result = { ok: true } as never;

interface Case {
  // The argument the repository receives for the given params (most forward them as they are).
  expected?: unknown;
  factory: (repositories: Repositories) => {
    execute: (params: never) => Promise<unknown>;
    uniqueName: string;
  };
  method: keyof typeof repository;
  params: unknown;
}

const cases: Case[] = [
  {
    factory: changePurchaseStatusUseCase,
    method: "changePurchaseStatus",
    params: { action: "END", id: "p" },
  },
  {
    factory: closePurchaseUseCase,
    method: "closePurchase",
    params: { date: "2026-11-18", id: "p", receiptTotalCents: 100, rows: [] },
  },
  { factory: closingLockUseCase, method: "closingLock", params: { id: "p" } },
  {
    factory: createMarketUseCase,
    method: "createMarket",
    params: { name: "Bom Preço", owner: "USER", ownerId: "u" },
  },
  {
    expected: "p",
    factory: deleteClosedPurchaseUseCase,
    method: "deleteClosedPurchase",
    params: { id: "p" },
  },
  {
    factory: deletePurchaseRowUseCase,
    method: "deletePurchaseRow",
    params: { purchaseId: "p", rowId: "r" },
  },
  {
    factory: getClosePreviewUseCase,
    method: "getClosePreview",
    params: { id: "p", receiptTotalCents: 100 },
  },
  {
    factory: getItemPricesUseCase,
    method: "getItemPrices",
    params: { itemId: "i" },
  },
  {
    factory: getListPurchasesUseCase,
    method: "getListPurchases",
    params: { listId: "l" },
  },
  {
    factory: getMarketsUseCase,
    method: "getMarkets",
    params: { ownerId: "o" },
  },
  {
    factory: getPendingPurchasesUseCase,
    method: "getPendingPurchases",
    params: {},
  },
  {
    expected: "p",
    factory: getPurchaseUseCase,
    method: "getPurchase",
    params: { id: "p" },
  },
  {
    factory: mergePurchaseUseCase,
    method: "mergePurchase",
    params: { id: "a", targetId: "b" },
  },
  {
    factory: startPurchaseUseCase,
    method: "startPurchase",
    params: { id: "p", listId: "l", marketId: "m", purchaseDate: "2026-11-18" },
  },
  {
    factory: updateClosedPurchaseUseCase,
    method: "updateClosedPurchase",
    params: { id: "p", receiptTotalCents: 900 },
  },
  {
    factory: upsertPurchaseRowUseCase,
    method: "upsertPurchaseRow",
    params: { purchaseId: "p", quantity: 2, rowId: "r" },
  },
];

beforeEach(() => jest.clearAllMocks());

describe.each(cases)("$method", ({ expected, factory, method, params }) => {
  function mocked() {
    return repository[method] as unknown as jest.Mock;
  }

  it("SHOULD forward to the repository AND return its answer", async () => {
    mocked().mockResolvedValue(result);

    const useCase = factory(repositoriesMocks as unknown as Repositories);

    expect(await useCase.execute(params as never)).toBe(result);
    if (method === "getPendingPurchases") {
      expect(mocked()).toHaveBeenCalledWith();
    } else {
      expect(mocked()).toHaveBeenCalledWith(expected ?? params);
    }
    expect(useCase.uniqueName).toMatch(/^stock\./);
  });

  it("SHOULD add the use case to the context of a domain error AND rethrow it", async () => {
    const error = new GenericError();

    mocked().mockRejectedValue(error);

    const useCase = factory(repositoriesMocks as unknown as Repositories);

    await expect(useCase.execute(params as never)).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: `${method}UseCase`,
    });
  });

  it("SHOULD rethrow anything else untouched", async () => {
    const error = new TypeError("boom");

    mocked().mockRejectedValue(error);

    await expect(
      factory(repositoriesMocks as unknown as Repositories).execute(
        params as never,
      ),
    ).rejects.toBe(error);
  });
});
