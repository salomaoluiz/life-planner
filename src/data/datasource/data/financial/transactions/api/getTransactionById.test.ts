import { todayCalendarDate } from "@data/models/financial/calendarDate";
import TransactionModel from "@data/models/financial/TransactionModel";
import {
  ApiBusinessError,
  ConnectivityError,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getTransactionById.mocks";

it("SHOULD GET /v1/finance/transactions/:id with today AND return the TransactionModel", async () => {
  spies.get.mockResolvedValueOnce(mocks.apiTransaction);

  const result = await setup();

  expect(spies.get).toHaveBeenCalledWith(
    `/v1/finance/transactions/${mocks.apiTransaction.id}?today=${todayCalendarDate()}`,
  );
  expect(result).toEqual(TransactionModel.fromJSON(mocks.apiTransaction));
});

it("SHOULD return undefined WHEN the API answers 404 (missing or not readable)", async () => {
  spies.get.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

  expect(await setup()).toBeUndefined();
});

it("SHOULD re-throw business errors other than 404", async () => {
  const error = new ConnectivityError();
  spies.get.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError with the id", async () => {
  spies.get.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "TransactionDatasource - getTransactionById",
    error: expect.any(Error),
    id: mocks.apiTransaction.id,
  });
});
