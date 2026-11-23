import { Datasources } from "@data/datasource";

import { purchaseRepositoryImpl } from "./purchases";

const methods = [
  "changePurchaseStatus",
  "closePurchase",
  "closingLock",
  "createMarket",
  "deleteClosedPurchase",
  "deletePurchaseRow",
  "getClosePreview",
  "getItemPrices",
  "getListPurchases",
  "getMarkets",
  "getPurchase",
  "mergePurchase",
  "startPurchase",
  "updateClosedPurchase",
  "upsertPurchaseRow",
] as const;

it("SHOULD forward every purchase call to the stock datasource", async () => {
  const stockDatasource = Object.fromEntries(
    [...methods, "getPendingPurchases"].map((name) => [
      name,
      jest.fn().mockResolvedValue(name),
    ]),
  );
  const repository = purchaseRepositoryImpl({
    stockDatasource,
  } as unknown as Datasources);

  for (const name of methods) {
    expect(
      await (repository[name] as (value: unknown) => Promise<unknown>)({
        id: name,
      }),
    ).toBe(name);
    expect(stockDatasource[name]).toHaveBeenCalledWith({ id: name });
  }

  expect(await repository.getPendingPurchases()).toBe("getPendingPurchases");
});
