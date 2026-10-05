import TransactionModel from "@data/models/financial/TransactionModel";
import { ConnectivityError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getTransactions.mocks";

it("SHOULD GET /v1/finance/transactions with repeated ownerId params AND return TransactionModels (cents -> decimal string, category name filled)", async () => {
  spies.get.mockResolvedValueOnce(mocks.apiTransactions);

  const result = await setup();

  expect(spies.get).toHaveBeenCalledWith(
    `/v1/finance/transactions?ownerId=${mocks.ownerIds[0]}&ownerId=${mocks.ownerIds[1]}`,
  );
  expect(result).toEqual([TransactionModel.fromJSON(mocks.apiTransactions[0])]);
  expect(result[0].value).toBe("234.90");
  expect(result[0].category).toBe("Groceries");
});

it("SHOULD NOT call the API WHEN there are no ownerIds", async () => {
  expect(await setup([])).toEqual([]);
  expect(spies.get).not.toHaveBeenCalled();
});

it("SHOULD return an empty list WHEN the API returns []", async () => {
  spies.get.mockResolvedValueOnce([]);

  expect(await setup()).toEqual([]);
});

it("SHOULD re-throw business errors", async () => {
  const error = new ConnectivityError();
  spies.get.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError with the owner ids only", async () => {
  spies.get.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "TransactionDatasource - getTransactions",
    error: expect.any(Error),
    ownerIds: mocks.ownerIds,
  });
});
