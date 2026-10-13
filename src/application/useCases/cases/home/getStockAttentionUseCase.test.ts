import StockAttentionDTO, {
  StockAttentionStatus,
} from "@application/dto/home/StockAttentionDTO";
import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getStockAttentionUseCase.mocks";

const getStockItems = spies.stockRepository.getStockItems;
const { item } = mocks;

function givenItems(...items: ReturnType<typeof item>[]) {
  getStockItems.mockResolvedValueOnce(items);
}

it("SHOULD read the items of every selected owner", async () => {
  await setup();

  expect(getStockItems).toHaveBeenCalledTimes(2);
  expect(getStockItems).toHaveBeenNthCalledWith(1, mocks.ownerIds[0]);
  expect(getStockItems).toHaveBeenNthCalledWith(2, mocks.ownerIds[1]);
});

it("SHOULD list the expired item first AND mark the other as expiring (spec example)", async () => {
  givenItems(item("in-two-days", 2), item("expired-yesterday", -1));

  const result = await setup();

  expect(result).toBeInstanceOf(StockAttentionDTO);
  expect(result.items.map((i) => [i.stock.id, i.status, i.daysLeft])).toEqual([
    ["expired-yesterday", StockAttentionStatus.EXPIRED, -1],
    ["in-two-days", StockAttentionStatus.EXPIRING, 2],
  ]);
});

it("SHOULD treat an item that expires today as expiring with 0 days (not expired)", async () => {
  givenItems(item("today", 0));

  const [first] = (await setup()).items;

  expect(first.status).toBe(StockAttentionStatus.EXPIRING);
  expect(first.daysLeft).toBe(0);
});

it("SHOULD include 7 days AND exclude 8 days", async () => {
  givenItems(item("seven", 7), item("eight", 8));

  const result = await setup();

  expect(result.items.map((i) => i.stock.id)).toEqual(["seven"]);
  expect(result.attentionCount).toBe(1);
});

it("SHOULD ignore items without expiration date but still count them in the total", async () => {
  givenItems(item("no-date"), item("soon", 1));

  const result = await setup();

  expect(result.items.map((i) => i.stock.id)).toEqual(["soon"]);
  expect(result.totalItems).toBe(2);
});

it("SHOULD cap the list at 3 items AND keep the real attention count", async () => {
  givenItems(item("a", 5), item("b", -3), item("c", 1), item("d", 0));

  const result = await setup();

  expect(result.items.map((i) => i.stock.id)).toEqual(["b", "d", "c"]);
  expect(result.attentionCount).toBe(4);
  expect(result.totalItems).toBe(4);
});

it("SHOULD merge the items of several owners", async () => {
  getStockItems
    .mockResolvedValueOnce([item("owner-1", 3)])
    .mockResolvedValueOnce([item("owner-2", 1)]);

  const result = await setup();

  expect(result.items.map((i) => i.stock.id)).toEqual(["owner-2", "owner-1"]);
});

it("SHOULD return an empty result WHEN there are no items", async () => {
  expect(await setup()).toEqual({
    attentionCount: 0,
    items: [],
    totalItems: 0,
  });
});

it("SHOULD use the current date WHEN `now` is not given", async () => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 5, 9, 0));
  givenItems(item("tomorrow", 1));

  const result = await setup({ now: undefined });

  expect(result.items[0].daysLeft).toBe(1);
  jest.useRealTimers();
});

it("SHOULD rethrow an unknown error untouched", async () => {
  getStockItems.mockRejectedValueOnce(mocks.errors.unknown);

  expect(await setupThrowable()).toBe(mocks.errors.unknown);
});

it("SHOULD add the use case to the context of a business error", async () => {
  getStockItems.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "home.getStockAttentionUseCase",
  });
});
