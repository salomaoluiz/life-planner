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

it("SHOULD ask for one row of the cards AND of each currency over the last two years, filtered by the category", async () => {
  spies.get.mockResolvedValue(page([]));

  await setup();

  const { from, to } = lastTwoYearsRange(todayCalendarDate());
  const query = `ownerId=${mocks.ownerIds[0]}&ownerId=${mocks.ownerIds[1]}&today=${todayCalendarDate()}&categoryId=${mocks.categoryId}&from=${from}&to=${to}`;

  expect(spies.get).toHaveBeenCalledTimes(4);
  expect(spies.get).toHaveBeenCalledWith(
    `/v1/finance/transactions?${query}&source=CARD&limit=1`,
  );
  ["BRL", "USD", "EUR"].forEach((currency) =>
    expect(spies.get).toHaveBeenCalledWith(
      `/v1/finance/transactions?${query}&currency=${currency}&limit=1`,
    ),
  );
});

it.each([
  ["an account row", [page([]), page([{ id: "a" }]), page([]), page([])]],
  ["a USD account row", [page([]), page([]), page([{ id: "u" }]), page([])]],
  ["a card purchase", [page([{ id: "c" }]), page([]), page([]), page([])]],
])("SHOULD be true WHEN there is %s", async (_label, pages) => {
  pages.forEach((item) => spies.get.mockResolvedValueOnce(item));

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
