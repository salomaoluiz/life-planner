import { fireEvent, render, screen } from "@tests";

import { WasteEntity } from "@domain/entities/stock/StockWasteEntity";

import StockWaste from "./";
import { useStockWasteViewModel } from "./hooks";
import WasteUIModel from "./models/WasteUIModel";
import stockWasteTestIds from "./testIds";

jest.mock("./hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const waste: WasteEntity = {
  byCategory: [
    {
      category: { id: "c", name: "Hortifrúti" },
      count: 4,
      totals: [{ currency: "BRL", valueCents: 2480 }],
    },
  ],
  byReason: [
    {
      count: 7,
      reason: "EXPIRED",
      totals: [{ currency: "BRL", valueCents: 4110 }],
    },
  ],
  firstMonth: "2026-03",
  month: "2026-11",
  moreItemsCount: 4,
  previousMonth: [{ currency: "BRL", discardCount: 8, valueCents: 5130 }],
  summary: { discardCount: 11, itemCount: 9, unpricedCount: 1 },
  topItems: [
    {
      count: 2,
      description: "Iogurte natural",
      itemId: "i1",
      mainReason: "EXPIRED",
      quantity: 4,
      totals: [{ currency: "BRL", valueCents: 1280 }],
      unit: "unit",
    },
  ],
  totals: [
    {
      currency: "BRL",
      discardCount: 11,
      itemCount: 9,
      unpricedCount: 1,
      valueCents: 6340,
    },
  ],
};

function setup(
  overrides: Record<string, unknown> = {},
  data: WasteEntity = waste,
) {
  const vm = {
    errorKey: undefined,
    isLoading: false,
    model: new WasteUIModel(data, "en-US", "2026-11"),
    onMonthNext: jest.fn(),
    onMonthPrevious: jest.fn(),
    onOwnerChange: jest.fn(),
    onRetry: jest.fn(),
    onShowAll: jest.fn(),
    onTabChange: jest.fn(),
    ownerId: "ALL",
    ownerOptions: [{ id: "u", isUser: true, name: "Ana" }],
    tab: "reason",
    ...overrides,
  };

  jest.mocked(useStockWasteViewModel).mockReturnValue(vm as never);
  render(<StockWaste />);

  return vm;
}

it("SHOULD show the tiles AND the reasons first (the test width is compact: three tabs)", () => {
  setup();

  expect(screen.getByTestId(stockWasteTestIds.total)).toBeOnTheScreen();
  expect(screen.getByTestId(stockWasteTestIds.discards)).toBeOnTheScreen();
  expect(screen.getByTestId(stockWasteTestIds.unpriced)).toBeOnTheScreen();
  expect(screen.getByTestId(stockWasteTestIds.tabs)).toBeOnTheScreen();
  expect(screen.getByTestId(stockWasteTestIds.byReason)).toBeOnTheScreen();
  expect(screen.queryByTestId(stockWasteTestIds.byCategory)).toBeNull();
});

it("SHOULD show the categories on their tab AND the top items on theirs", () => {
  setup({ tab: "category" });
  expect(screen.getByTestId(stockWasteTestIds.byCategory)).toBeOnTheScreen();
});

it("SHOULD list the top items on the items tab", () => {
  setup({ tab: "items" });
  expect(screen.getByText("Iogurte natural")).toBeOnTheScreen();
});

it("SHOULD change the tab", () => {
  const vm = setup();

  fireEvent.press(screen.getByText("stock.waste.tabs.items"));

  expect(vm.onTabChange).toHaveBeenCalledWith("items");
});

it("SHOULD navigate the months AND disable the next arrow on the current month", () => {
  const vm = setup();

  fireEvent.press(screen.getByTestId(stockWasteTestIds.previousMonth));
  expect(vm.onMonthPrevious).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId(stockWasteTestIds.nextMonth)).toBeDisabled();
});

it("SHOULD load the rest of the items on See more", () => {
  const vm = setup({ tab: "items" });

  fireEvent.press(screen.getByTestId(stockWasteTestIds.moreItems));

  expect(vm.onShowAll).toHaveBeenCalledTimes(1);
});

it("SHOULD say nothing was discarded in an empty month", () => {
  setup(
    {},
    {
      ...waste,
      byCategory: [],
      byReason: [],
      summary: { discardCount: 0, itemCount: 0, unpricedCount: 0 },
      topItems: [],
      totals: [],
    },
  );

  expect(screen.getByTestId(stockWasteTestIds.empty)).toBeOnTheScreen();
});

it("SHOULD show a retry WHEN the load fails AND a skeleton WHILE loading", () => {
  const vm = setup({ errorKey: "stock.waste.error", model: undefined });

  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(vm.onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD show the loading state", () => {
  setup({ isLoading: true, model: undefined });

  expect(screen.getByTestId(stockWasteTestIds.loading)).toBeOnTheScreen();
});
