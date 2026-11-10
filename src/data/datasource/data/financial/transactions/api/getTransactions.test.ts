import { todayCalendarDate } from "@data/models/financial/calendarDate";
import TransactionModel from "@data/models/financial/TransactionModel";
import { ConnectivityError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  page,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getTransactions.mocks";

it("SHOULD GET /v1/finance/transactions with repeated ownerId params AND return TransactionModels (cents -> decimal string, category name filled)", async () => {
  spies.get
    .mockResolvedValueOnce(page(mocks.apiTransactions))
    .mockResolvedValueOnce(page([]));

  const result = await setup();

  const query = `ownerId=${mocks.ownerIds[0]}&ownerId=${mocks.ownerIds[1]}&today=${todayCalendarDate()}&from=2026-10-01&to=2026-10-31&limit=200`;

  expect(spies.get).toHaveBeenCalledWith(`/v1/finance/transactions?${query}`);
  expect(spies.get).toHaveBeenCalledWith(
    `/v1/finance/transactions?${query.replace("&limit", "&source=CARD&limit")}`,
  );
  expect(result).toEqual([
    TransactionModel.fromLeanJSON(mocks.apiTransactions[0], mocks.lookups),
  ]);
  expect(result[0].value).toBe("234.90");
  expect(result[0].category).toBe("Groceries");
});

it("SHOULD merge card purchases (source=CARD) after the account rows", async () => {
  spies.get
    .mockResolvedValueOnce(page(mocks.apiTransactions))
    .mockResolvedValueOnce(
      page([
        {
          ...mocks.apiTransactions[0],
          accountId: undefined,
          creditCardId: "card-1",
          id: "purchase-1",
          invoiceMonth: "2026-10",
        },
      ]),
    );

  const result = await setup();

  expect(result.map((item) => item.id)).toEqual([
    mocks.apiTransactions[0].id,
    "purchase-1",
  ]);
  expect(result[1]).toMatchObject({
    accountId: undefined,
    creditCardId: "card-1",
    invoiceMonth: "2026-10",
  });
});

it("SHOULD NOT call the API WHEN there are no ownerIds", async () => {
  expect(await setup([])).toEqual([]);
  expect(spies.get).not.toHaveBeenCalled();
});

it("SHOULD return an empty list WHEN the API returns an empty page", async () => {
  spies.get.mockResolvedValue(page([]));

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
    range: mocks.defaultRange,
  });
});

it("SHOULD load every page of the period, following nextCursor (spec 078)", async () => {
  const second = { ...mocks.apiTransactions[0], id: "second" };

  spies.get
    .mockResolvedValueOnce(page(mocks.apiTransactions, "cursor-1"))
    .mockResolvedValueOnce(page([second]))
    .mockResolvedValueOnce(page([]));

  const result = await setup();

  expect(result.map((item) => item.id)).toEqual([
    mocks.apiTransactions[0].id,
    "second",
  ]);
  expect(spies.get).toHaveBeenCalledWith(
    expect.stringContaining("&cursor=cursor-1"),
  );
});

it("SHOULD read only the card source filtered by creditCardId WHEN options.creditCardId is set (spec 077)", async () => {
  spies.get.mockResolvedValueOnce(page(mocks.apiTransactions));

  const result = await setup(mocks.ownerIds, mocks.defaultRange, {
    creditCardId: "card-1",
  });

  expect(spies.get).toHaveBeenCalledTimes(1);
  expect(spies.get).toHaveBeenCalledWith(
    expect.stringContaining("&source=CARD&creditCardId=card-1&limit=200"),
  );
  expect(result.map((item) => item.id)).toEqual([mocks.apiTransactions[0].id]);
});

it("SHOULD add the currency to both reads WHEN one is given (spec 103)", async () => {
  spies.get.mockResolvedValue(page([]));

  await setup(
    mocks.ownerIds,
    { from: "2026-10-01", to: "2026-10-31" },
    { currency: "USD" },
  );

  expect(spies.get).toHaveBeenCalledTimes(2);
  spies.get.mock.calls.forEach(([url]) =>
    expect(url).toContain("&to=2026-10-31&currency=USD"),
  );
});
