import { fireEvent, render, screen } from "@tests";

import { PurchaseStatuses } from "@domain/entities/stock/PurchaseEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";

import StockPurchase from "./";
import { usePurchaseViewModel } from "./hooks";
import testIds from "./testIds";

jest.mock("./hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const toBuy = {
  description: "Milk",
  id: "l-milk",
  listRowId: "l-milk",
  quantity: 6,
  unit: StockUnits.UNIT,
};

function setup(overrides: Record<string, unknown> = {}) {
  const vm = {
    cartCount: 1,
    closingBy: undefined,
    confirmDiscard: false,
    currency: "BRL",
    errorMessageKey: undefined,
    failed: false,
    isEnded: false,
    isLoading: false,
    isOpen: true,
    languageTag: "en-US",
    model: {
      cart: [
        {
          description: "Rice",
          id: "r1",
          lineTotalCents: 500,
          outsideList: true,
          pending: true,
          priceChange: "UP",
          priceChangePercent: 18,
          quantity: 1,
          unit: StockUnits.UNIT,
          unknownWeightOrPrice: true,
        },
        {
          description: "Beans",
          id: "r2",
          outsideList: false,
          pending: false,
          priceChange: "CHEAPER",
          priceChangePercent: -9,
          unknownWeightOrPrice: false,
        },
      ],
      toBuy: [toBuy],
    },
    notice: undefined,
    offlineCount: 2,
    onAddOutside: jest.fn(),
    onBack: jest.fn(),
    onCartRowPress: jest.fn(),
    onClose: jest.fn(),
    onDiscard: jest.fn(),
    onDiscardAsk: jest.fn(),
    onDiscardCancel: jest.fn(),
    onEnd: jest.fn(),
    onFailedHide: jest.fn(),
    onNotFound: jest.fn(),
    onNoticeHide: jest.fn(),
    onReopen: jest.fn(),
    onRetry: jest.fn(),
    onSearchChange: jest.fn(),
    onSheetChange: jest.fn(),
    onSheetClose: jest.fn(),
    onSheetNotFound: jest.fn(),
    onSheetRemove: jest.fn(),
    onSheetSave: jest.fn(),
    onTick: jest.fn(),
    onUndoNotFound: jest.fn(),
    purchase: {
      cart: { count: 1, totalCents: 500, unpricedCount: 0 },
      forecastCents: 900,
      purchase: { status: PurchaseStatuses.OPEN },
      remaining: { count: 2, estimatedCents: 400, pricedCount: 1 },
    },
    search: "",
    sheet: undefined,
    visibleToBuy: [toBuy],
    ...overrides,
  };

  jest.mocked(usePurchaseViewModel).mockReturnValue(vm as never);

  return vm;
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD show the totals, the rows to buy AND the cart with its badges", () => {
  setup();
  render(<StockPurchase />);

  expect(screen.getByTestId(testIds.screen)).toBeTruthy();
  expect(screen.getByTestId(testIds.cartTotal)).toBeTruthy();
  expect(screen.getByTestId(testIds.remaining)).toBeTruthy();
  expect(screen.getByTestId(testIds.forecast)).toBeTruthy();
  expect(screen.getByTestId(testIds.offline)).toBeTruthy();
  expect(screen.getByTestId(`${testIds.toBuyRow}-l-milk`)).toBeTruthy();
  expect(screen.getByTestId(`${testIds.cartRow}-r1`)).toBeTruthy();
});

it("SHOULD tick a row, mark it not found AND drive the header actions", () => {
  const vm = setup({ offlineCount: 0 });

  render(<StockPurchase />);
  fireEvent.press(screen.getByTestId(`${testIds.tick}-l-milk`));
  fireEvent.press(screen.getByTestId(testIds.end));
  fireEvent.press(screen.getByTestId(testIds.close));
  fireEvent.press(screen.getByTestId(testIds.discard));
  fireEvent.press(screen.getByTestId(testIds.back));

  expect(vm.onTick).toHaveBeenCalledWith(toBuy);
  expect(vm.onEnd).toHaveBeenCalled();
  expect(vm.onClose).toHaveBeenCalled();
  expect(vm.onDiscardAsk).toHaveBeenCalled();
  expect(vm.onBack).toHaveBeenCalled();
});

it("SHOULD offer the outside-the-list add WHEN the search has text", () => {
  const vm = setup({ search: "Candle" });

  render(<StockPurchase />);
  fireEvent.press(screen.getByTestId(testIds.addOutside));

  expect(vm.onAddOutside).toHaveBeenCalled();
});

it("SHOULD lock a row in another cart AND show the ended and closing banners", () => {
  setup({
    closingBy: "someone",
    isEnded: true,
    isOpen: false,
    model: {
      cart: [],
      toBuy: [
        { ...toBuy, otherCart: { marketName: "Atacadão", userName: "Ana" } },
        { ...toBuy, id: "nf", notFound: true },
      ],
    },
    visibleToBuy: [
      { ...toBuy, otherCart: { marketName: "Atacadão", userName: "Ana" } },
      { ...toBuy, id: "nf", notFound: true },
    ],
  });
  render(<StockPurchase />);

  expect(screen.getByTestId(testIds.closing)).toBeTruthy();
  expect(screen.getByTestId(testIds.ended)).toBeTruthy();
});

it("SHOULD show the loading skeleton AND the error state with retry", () => {
  setup({ isLoading: true });
  const { unmount } = render(<StockPurchase />);

  expect(screen.getByTestId(testIds.loading)).toBeTruthy();
  unmount();

  const vm = setup({
    errorMessageKey: "stock.purchase.errorLoad",
    model: undefined,
    purchase: undefined,
  });

  render(<StockPurchase />);
  expect(screen.getByTestId(testIds.error)).toBeTruthy();
  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(vm.onRetry).toHaveBeenCalled();
});

it("SHOULD edit the sheet: quantity, price type, price AND save or mark not found", () => {
  const vm = setup({
    sheet: {
      description: "Milk",
      expiration: "",
      isNew: true,
      listRowId: "l-milk",
      priceCents: 489,
      priceInput: "UNIT",
      quantity: "6",
      rowId: "pr1",
      unit: StockUnits.UNIT,
    },
  });

  render(<StockPurchase />);
  fireEvent.changeText(screen.getByTestId(testIds.sheetQuantity), "4");
  fireEvent.changeText(screen.getByTestId(testIds.sheetExpiration), "03/2027");
  fireEvent.press(screen.getByTestId(testIds.sheetSave));
  fireEvent.press(screen.getByTestId(testIds.sheetNotFound));

  expect(vm.onSheetChange).toHaveBeenCalledWith({ quantity: "4" });
  expect(vm.onSheetChange).toHaveBeenCalledWith({ expiration: "03/2027" });
  expect(vm.onSheetSave).toHaveBeenCalled();
  expect(vm.onSheetNotFound).toHaveBeenCalled();
});

it("SHOULD offer to take a cart row out of the cart WHEN editing it", () => {
  const vm = setup({
    sheet: {
      description: "Rice",
      expiration: "",
      isNew: false,
      priceCents: 0,
      priceInput: "UNIT",
      quantity: "1",
      rowId: "r1",
      unit: StockUnits.UNIT,
    },
  });

  render(<StockPurchase />);
  fireEvent.press(screen.getByText("stock.purchase.unmark"));

  expect(vm.onSheetRemove).toHaveBeenCalled();
});

it("SHOULD show the conflict notice AND the discard confirmation", () => {
  const vm = setup({ confirmDiscard: true, notice: "Milk|Ana" });

  render(<StockPurchase />);
  fireEvent.press(screen.getByTestId(`${testIds.discardConfirm}-confirm`));

  expect(vm.onDiscard).toHaveBeenCalled();
});
