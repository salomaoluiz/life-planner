import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import cardCreditRepositoryImpl from "./cardCreditRepositoryImpl";

const datasource = jest.mocked(datasourcesMocks.financialCardCreditDatasource);
const repository = cardCreditRepositoryImpl(datasourcesMocks);

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(cache, "invalidate").mockImplementation(() => undefined);
});

it.each([
  [
    "createRefund",
    {
      creditCardId: "c",
      date: "d",
      description: "x",
      invoiceMonth: "m",
      value: 1,
    },
  ],
  ["updateRefund", { creditCardId: "c", id: "r" }],
  ["deleteRefund", { creditCardId: "c", id: "r" }],
  [
    "createEarlyPayment",
    {
      creditCardId: "c",
      date: "d",
      description: "x",
      invoiceMonth: "m",
      method: "EXTERNAL",
      value: 1,
    },
  ],
  ["updateEarlyPayment", { creditCardId: "c", id: "e" }],
  ["deleteEarlyPayment", { creditCardId: "c", id: "e" }],
] as const)(
  "SHOULD %s through the datasource AND invalidate the transaction and account caches",
  async (method, params) => {
    await (repository[method] as (p: unknown) => Promise<void>)(params);

    expect(datasource[method]).toHaveBeenCalledWith(params);
    expect(cache.invalidate).toHaveBeenCalledWith(
      CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
    );
    expect(cache.invalidate).toHaveBeenCalledWith(
      CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
    );
  },
);
