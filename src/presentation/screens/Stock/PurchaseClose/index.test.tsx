import { fireEvent, render, screen } from "@tests";

import StockPurchaseClose from "./";
import { usePurchaseCloseViewModel } from "./hooks";
import testIds from "./testIds";

jest.mock("./hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

function setup(overrides: Record<string, unknown> = {}) {
  const vm = {
    accepted: { r1: true },
    accountOptions: [{ id: "a1", name: "Checking" }],
    breakdown: {
      differenceCents: -100,
      mode: "ALL_PRICED",
      noPriceCount: 0,
      pricedSumCents: 1000,
    },
    cardOptions: [{ id: "c1", title: "Visa" }],
    currency: "BRL",
    dateText: "2026-11-18",
    defaultCategoryId: undefined,
    edits: {},
    errorKey: undefined,
    expenseCategories: [{ id: "cat", name: "Food" }],
    expirations: [{ rowId: "r1", suggestedDate: "2026-12-10" }],
    isLoading: false,
    lockedBy: false,
    matches: {},
    missingPrices: new Set(["r2"]),
    needsDefault: true,
    newItems: [
      {
        description: "Candle",
        rowId: "r2",
        suggestion: { description: "Vela", itemId: "vela" },
      },
    ],
    onBackStep: jest.fn(),
    onContinue: jest.fn(),
    onDateChange: jest.fn(),
    onDefaultCategoryChange: jest.fn(),
    onExpirationToggle: jest.fn(),
    onFinish: jest.fn(),
    onMatch: jest.fn(),
    onPriceChange: jest.fn(),
    onReceiptChange: jest.fn(),
    onSourceChange: jest.fn(),
    onUnknownToggle: jest.fn(),
    onWeightChange: jest.fn(),
    previewParts: [
      { categoryId: "cat", kind: "CATEGORY", valueCents: 1100 },
      { kind: "ADJUSTMENT", valueCents: -100 },
      { categoryId: "cat", kind: "NO_PRICE", valueCents: 50 },
    ],
    receiptTotalCents: 1000,
    rows: [
      { description: "Rice", id: "r1", unit: "unit" },
      { description: "Candle", id: "r2", unit: "unit" },
    ],
    saving: false,
    source: undefined,
    step: "prices",
    stepIndex: 0,
    steps: ["prices", "newItems", "expirations", "payment"],
    unknownWeight: new Set(["r2"]),
    ...overrides,
  };

  jest.mocked(usePurchaseCloseViewModel).mockReturnValue(vm as never);

  return vm;
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD ask the receipt total AND the missing price or weight on the first step", () => {
  const vm = setup();

  render(<StockPurchaseClose />);
  fireEvent.changeText(screen.getByTestId(testIds.receiptTotal), "1000");
  fireEvent.changeText(screen.getByTestId(`${testIds.weight}-r2`), "0,8");
  fireEvent.press(screen.getByTestId(`${testIds.unknown}-r2`));
  fireEvent.press(screen.getByTestId(testIds.continue));
  fireEvent.press(screen.getByTestId(testIds.back));

  expect(vm.onWeightChange).toHaveBeenCalledWith("r2", "0,8");
  expect(vm.onUnknownToggle).toHaveBeenCalledWith("r2");
  expect(vm.onContinue).toHaveBeenCalled();
  expect(vm.onBackStep).toHaveBeenCalled();
});

it("SHOULD offer É este for a suggestion on the new items step", () => {
  const vm = setup({ step: "newItems", stepIndex: 1 });

  render(<StockPurchaseClose />);
  fireEvent.press(screen.getByTestId(`${testIds.isThis}-r2`));

  expect(vm.onMatch).toHaveBeenCalledWith("r2", "vela");
});

it("SHOULD let the user take the suggested expiration", () => {
  const vm = setup({ step: "expirations", stepIndex: 2 });

  render(<StockPurchaseClose />);
  fireEvent.press(screen.getByTestId(`${testIds.expirationAccept}-r1`));

  expect(vm.onExpirationToggle).toHaveBeenCalledWith("r1");
});

it("SHOULD finish on the payment step with the finance parts AND the default category", () => {
  const vm = setup({
    source: { id: "a1", type: "ACCOUNT" },
    step: "payment",
    stepIndex: 3,
  });

  render(<StockPurchaseClose />);
  fireEvent.changeText(screen.getByTestId(testIds.date), "2026-11-19");
  fireEvent.press(screen.getByTestId(testIds.finish));

  expect(screen.getByTestId(testIds.parts)).toBeTruthy();
  expect(vm.onDateChange).toHaveBeenCalledWith("2026-11-19");
  expect(vm.onFinish).toHaveBeenCalled();
});

it("SHOULD show the error AND the lock banners AND disable finish while locked", () => {
  setup({
    errorKey: "stock.close.errorPrice",
    lockedBy: true,
    needsDefault: false,
    source: { id: "a1", type: "ACCOUNT" },
    step: "payment",
    stepIndex: 3,
  });
  render(<StockPurchaseClose />);

  expect(screen.getByTestId(testIds.error)).toBeTruthy();
  expect(screen.getByTestId(testIds.locked)).toBeTruthy();
});

it("SHOULD show the loading skeleton", () => {
  setup({ isLoading: true });
  render(<StockPurchaseClose />);

  expect(screen.getByTestId(testIds.loading)).toBeTruthy();
});
