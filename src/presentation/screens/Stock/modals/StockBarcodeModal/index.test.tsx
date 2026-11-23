import { fireEvent, render, screen } from "@tests";

import { StockUnits } from "@domain/entities/stock/StockEntity";
import { initialInput } from "@domain/entities/stock/stockQuantity";
import * as theme from "@presentation/theme";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import StockBarcodeModal from "./";
import { useStockBarcodeViewModel } from "./hooks";
import BarcodeMatchUIModel from "./models/BarcodeMatchUIModel";
import stockBarcodeTestIds from "./testIds";

jest.mock("./hooks");
jest.mock("@infrastructure/barcodeScanner", () => ({
  BarcodeScannerView: "BarcodeScannerView",
}));
jest.mock("@screens/Stock/components/StockQuickOverlays", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const item = dto((f) =>
  f.withId("item-1").withUnit(StockUnits.UNIT).withDescription("Milk"),
);

function match(ownerName: string, readOnly = false) {
  return new BarcodeMatchUIModel(
    { item, owner: "USER", ownerId: ownerName, ownerName, readOnly },
    "en-US",
  );
}

function setup(overrides: Record<string, unknown> = {}) {
  const vm = {
    cameraStatus: "granted",
    code: undefined,
    isLooking: false,
    matches: [],
    message: undefined,
    onAction: jest.fn(),
    onCameraError: jest.fn(),
    onClose: jest.fn(),
    onOpen: jest.fn(),
    onOpenDetail: jest.fn(),
    onPickOwner: jest.fn(),
    onQuantityChange: jest.fn(),
    onScan: jest.fn(),
    onScanAnother: jest.fn(),
    onSubmitTyped: jest.fn(),
    onToggleTorch: jest.fn(),
    onTypedChange: jest.fn(),
    paused: false,
    quantity: initialInput(1, StockUnits.UNIT),
    quick: {},
    sheet: undefined,
    showsOwnerPicker: false,
    torch: false,
    typed: "",
    ...overrides,
  };

  jest.mocked(useStockBarcodeViewModel).mockReturnValue(vm as never);
  render(<StockBarcodeModal />);

  return vm;
}

describe.each([["compact"], ["expanded"]])("%s layout", (breakpoint) => {
  beforeEach(() => {
    jest.spyOn(theme, "useBreakpoint").mockReturnValue(breakpoint as never);
  });

  it("SHOULD show the camera AND the code field, and search on submit", () => {
    const vm = setup();

    expect(screen.getByTestId(stockBarcodeTestIds.camera)).toBeOnTheScreen();

    fireEvent.changeText(
      screen.getByTestId(stockBarcodeTestIds.codeInput),
      "7891000100103",
    );
    fireEvent(
      screen.getByTestId(stockBarcodeTestIds.codeInput),
      "submitEditing",
    );

    expect(vm.onTypedChange).toHaveBeenCalledWith("7891000100103");
    expect(vm.onSubmitTyped).toHaveBeenCalled();
  });

  it.each([
    ["denied", "stock.barcode.permissionDenied"],
    ["unavailable", "stock.barcode.cameraUnavailable"],
  ])("SHOULD explain a %s camera AND keep the field", (cameraStatus, key) => {
    setup({ cameraStatus });

    expect(screen.getByText(key)).toBeOnTheScreen();
    expect(screen.getByTestId(stockBarcodeTestIds.codeInput)).toBeOnTheScreen();
  });

  it("SHOULD show the quick sheet with the three actions AND call them", () => {
    const vm = setup({ sheet: match("Pessoal") });

    expect(screen.getByTestId(stockBarcodeTestIds.sheet)).toBeOnTheScreen();
    expect(screen.getByText("Milk")).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId(stockBarcodeTestIds.enter));
    fireEvent.press(screen.getByTestId(stockBarcodeTestIds.consume));
    fireEvent.press(screen.getByTestId(stockBarcodeTestIds.scanAnother));
    fireEvent.press(screen.getByTestId(stockBarcodeTestIds.openDetail));

    expect(vm.onAction).toHaveBeenNthCalledWith(1, 1);
    expect(vm.onAction).toHaveBeenNthCalledWith(2, -1);
    expect(vm.onScanAnother).toHaveBeenCalled();
    expect(vm.onOpenDetail).toHaveBeenCalled();
  });

  it("SHOULD hide the movement actions on a read-only owner", () => {
    setup({ sheet: match("Casa", true) });

    expect(screen.queryByTestId(stockBarcodeTestIds.enter)).toBeNull();
    expect(screen.getByText("stock.barcode.readOnly")).toBeOnTheScreen();
  });

  it("SHOULD list the owners WHEN the code is in more than one AND pick one", () => {
    const vm = setup({
      matches: [match("Pessoal"), match("Casa")],
      showsOwnerPicker: true,
    });

    expect(
      screen.getByTestId(stockBarcodeTestIds.ownerPicker),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId(`${stockBarcodeTestIds.ownerOption}-1`));

    expect(vm.onPickOwner).toHaveBeenCalledWith(1);
  });

  it("SHOULD show the lookup in progress AND the messages", () => {
    setup({ isLooking: true, message: "notRecognized" });

    expect(screen.getByTestId(stockBarcodeTestIds.looking)).toBeOnTheScreen();
    expect(screen.getByText("stock.barcode.notRecognized")).toBeOnTheScreen();
  });
});
