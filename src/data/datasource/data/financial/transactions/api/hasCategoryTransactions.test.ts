import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { ConnectivityError, GenericError } from "@domain/entities/errors";
import { lastTwoYearsRange } from "@domain/entities/financial/TransactionQueryFilter";

import {
  mocks,
  page,
  setup,
  setupThrowable,
  spies,
} from "./mocks/hasCategoryTransactions.mocks";

it("SHOULD ask for one row of each source over the last two years, filtered by the category", async () => {
  spies.get.mockResolvedValue(page([]));

  await setup();

  const { from, to } = lastTwoYearsRange(todayCalendarDate());
  const query = `ownerId=${mocks.ownerIds[0]}&ownerId=${mocks.ownerIds[1]}&today=${todayCalendarDate()}&categoryId=${mocks.categoryId}&from=${from}&to=${to}&limit=1`;

  expect(spies.get).toHaveBeenCalledTimes(2);
  expect(spies.get).toHaveBeenCalledWith(`/v1/finance/transactions?${query}`);
  expect(spies.get).toHaveBeenCalledWith(
    `/v1/finance/transactions?${query.replace("&limit", "&source=CARD&limit")}`,
  );
});

it.each([
  ["an account row", [page([{ id: "a" }]), page([])]],
  ["a card purchase", [page([]), page([{ id: "c" }])]],
])("SHOULD be true WHEN there is %s", async (_label, pages) => {
  spies.get.mockResolvedValueOnce(pages[0]).mockResolvedValueOnce(pages[1]);

  expect(await setup()).toBe(true);
});

it("SHOULD be false WHEN both sources are empty", async () => {
  spies.get.mockResolvedValue(page([]));

  expect(await setup()).toBe(false);
});

it("SHOULD NOT call the API WHEN there are no ownerIds", async () => {
  expect(await setup([])).toBe(false);
  expect(spies.get).not.toHaveBeenCalled();
});

it("SHOULD re-throw business errors", async () => {
  const error = new ConnectivityError();

  spies.get.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError with the category", async () => {
  spies.get.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    categoryId: mocks.categoryId,
    datasource: "TransactionDatasource - hasCategoryTransactions",
    error: expect.any(Error),
    ownerIds: mocks.ownerIds,
  });
});
