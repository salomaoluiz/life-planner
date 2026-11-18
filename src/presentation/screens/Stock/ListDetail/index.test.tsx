import { fireEvent, render, screen } from "@tests";

import {
  ShoppingListRowOrigins,
  ShoppingListStatuses,
} from "@domain/entities/stock/ShoppingListEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { initialInput } from "@domain/entities/stock/stockQuantity";

import StockListDetail from "./";
import { useStockListDetailViewModel } from "./hooks";
import ShoppingListDetailUIModel from "./models/ShoppingListDetailUIModel";
import stockListDetailTestIds from "./testIds";

jest.mock("./hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const rows = [
  {
    description: "Milk",
    estimateCents: 2934,
    id: "r1",
    itemId: "i1",
    origin: ShoppingListRowOrigins.AUTO,
    priceSource: "MANUAL" as const,
    quantity: 6,
    stock: { idealQuantity: 8, minQuantity: 3, quantity: 2 },
    unit: StockUnits.UNIT,
    unitPriceCents: 489,
  },
  {
    description: "Rice",
    id: "r2",
    itemId: "i2",
    origin: ShoppingListRowOrigins.MANUAL,
    priceSource: "NONE" as const,
    quantity: 0.5,
    unit: StockUnits.KILOGRAM,
  },
  {
    description: "Candle",
    estimateCents: 100,
    id: "r3",
    origin: ShoppingListRowOrigins.MANUAL,
    priceSource: "HISTORY_ANY_MARKET" as const,
    quantity: 1,
    unit: StockUnits.UNIT,
    unitPriceCents: 100,
  },
];
const model = new ShoppingListDetailUIModel({
  groups: [
    {
      category: { id: "c", name: "Dairy", path: "Dairy" },
      rows: [rows[0], rows[1]],
      subtotalCents: 2934,
      unpricedCount: 1,
    },
    { rows: [rows[2]], subtotalCents: 100, unpricedCount: 0 },
  ],
  list: {
    currency: "BRL",
    id: "l",
    isDefault: true,
    name: "Mercado",
    owner: "FAMILY",
    ownerId: "f",
    status: ShoppingListStatuses.ACTIVE,
  },
  totals: {
    autoCount: 1,
    estimatedTotalCents: 3034,
    pricedCount: 2,
    rowCount: 3,
  },
});

function setup(overrides: Record<string, unknown> = {}) {
  const vm = {
    addSuggestions: [
      { id: "i9", label: "Pão de queijo" },
      { id: "__text__", label: "pão de q" },
    ],
    currency: "BRL",
    description: "",
    errorMessageKey: undefined,
    failed: false,
    isLoading: false,
    isNotFound: false,
    languageTag: "en-US",
    list: model.detail.list,
    mergedMessage: undefined,
    model,
    onBack: jest.fn(),
    onDescriptionChange: jest.fn(),
    onEditList: jest.fn(),
    onFailedHide: jest.fn(),
    onMergedHide: jest.fn(),
    onNoticeHide: jest.fn(),
    onPriceChange: jest.fn(),
    onQuantityChange: jest.fn(),
    onRemove: jest.fn(),
    onRetry: jest.fn(),
    onRowClose: jest.fn(),
    onRowPress: jest.fn(),
    onRowSave: jest.fn(),
    onSearchChange: jest.fn(),
    onSelectSuggestion: jest.fn(),
    onUndo: jest.fn(),
    ownerName: "Casa",
    priceCents: 0,
    quantity: initialInput(1, StockUnits.UNIT),
    readOnly: false,
    removed: undefined,
    search: "",
    selectedRow: undefined,
    undoDurationMs: 5000,
    ...overrides,
  };

  jest.mocked(useStockListDetailViewModel).mockReturnValue(vm as never);
  render(<StockListDetail />);

  return vm;
}

it("SHOULD show the groups (category and Outros), the badges, the stock line and the total", () => {
  setup();

  expect(
    screen.getByTestId(`${stockListDetailTestIds.group}-c`),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(`${stockListDetailTestIds.group}-other`),
  ).toBeOnTheScreen();
  expect(screen.getByText("stock.lists.other · 1")).toBeOnTheScreen();
  expect(
    screen.getByTestId(stockListDetailTestIds.badgeAuto),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(stockListDetailTestIds.badgeText),
  ).toBeOnTheScreen();
  expect(screen.getByTestId(stockListDetailTestIds.total)).toBeOnTheScreen();
  expect(screen.getAllByText("stock.lists.noPrice").length).toBeGreaterThan(0);
});

it("SHOULD open a row, remove it and go back or edit the list", () => {
  const vm = setup();

  fireEvent.press(screen.getByText("Milk"));
  expect(vm.onRowPress).toHaveBeenCalledWith("r1");

  fireEvent.press(screen.getByTestId(`${stockListDetailTestIds.remove}-r1`));
  expect(vm.onRemove).toHaveBeenCalledWith(rows[0]);

  fireEvent.press(screen.getByTestId(stockListDetailTestIds.back));
  expect(vm.onBack).toHaveBeenCalled();

  fireEvent.press(screen.getByTestId(stockListDetailTestIds.editButton));
  expect(vm.onEditList).toHaveBeenCalled();
});

it("SHOULD hide the add field, the remove buttons and the edit button WHEN read-only", () => {
  setup({ readOnly: true });

  expect(screen.queryByTestId(stockListDetailTestIds.add)).toBeNull();
  expect(
    screen.queryByTestId(`${stockListDetailTestIds.remove}-r1`),
  ).toBeNull();
  expect(screen.queryByTestId(stockListDetailTestIds.editButton)).toBeNull();
  expect(
    screen.getByTestId(stockListDetailTestIds.readOnlyBanner),
  ).toBeOnTheScreen();
});

it("SHOULD show the merge notice and the undo notice with its action", () => {
  const vm = setup({
    mergedMessage: { list: "Mercado", quantity: 12, unit: StockUnits.UNIT },
    removed: { comesBack: true, name: "Milk" },
  });

  expect(
    screen.getByTestId(stockListDetailTestIds.mergedNotice),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(stockListDetailTestIds.undoNotice),
  ).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(stockListDetailTestIds.undo));
  expect(vm.onUndo).toHaveBeenCalled();
});

it("SHOULD edit the selected row in the sheet (item row and text row) and save or remove it", () => {
  const vm = setup({ selectedRow: model.rows[0] });

  expect(screen.getByTestId(stockListDetailTestIds.rowSheet)).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId(stockListDetailTestIds.rowSave));
  expect(vm.onRowSave).toHaveBeenCalled();
  fireEvent.press(screen.getByTestId(stockListDetailTestIds.rowSheetRemove));
  expect(vm.onRemove).toHaveBeenCalledWith(rows[0]);
  screen.unmount();

  setup({ selectedRow: model.rows[2] });
  expect(screen.getByText("stock.lists.descriptionLabel")).toBeOnTheScreen();
});

it("SHOULD show loading, not found, error and empty states", () => {
  setup({ isLoading: true, model: undefined });
  expect(screen.getByTestId(stockListDetailTestIds.loading)).toBeOnTheScreen();
  screen.unmount();

  const notFound = setup({
    isNotFound: true,
    list: undefined,
    model: undefined,
  });
  expect(screen.getByTestId(stockListDetailTestIds.notFound)).toBeOnTheScreen();
  fireEvent.press(screen.getByText("stock.lists.back"));
  expect(notFound.onBack).toHaveBeenCalled();
  screen.unmount();

  const failed = setup({
    errorMessageKey: "stock.lists.errorLoad",
    list: undefined,
    model: undefined,
  });
  expect(screen.getByTestId(stockListDetailTestIds.error)).toBeOnTheScreen();
  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(failed.onRetry).toHaveBeenCalled();
  screen.unmount();

  const empty = new ShoppingListDetailUIModel({
    ...model.detail,
    groups: [],
    totals: {
      autoCount: 0,
      estimatedTotalCents: 0,
      pricedCount: 0,
      rowCount: 0,
    },
  });

  setup({ model: empty });
  expect(screen.getByTestId(stockListDetailTestIds.empty)).toBeOnTheScreen();
});
