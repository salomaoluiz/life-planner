import { fireEvent, render, screen } from "@tests";

import { StockLotDTO } from "@application/dto/stock/StockDTO";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { StockLotStatus } from "@domain/entities/stock/StockLotEntity";
import { StockMovementTypes } from "@domain/entities/stock/StockMovementEntity";
import { QuantityMode } from "@domain/entities/stock/stockQuantity";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import StockMovementModal from "./";
import { useStockMovementViewModel } from "./hooks";
import StockMovementUIModel from "./models/StockMovementUIModel";
import stockMovementTestIds from "./testIds";

jest.mock("./hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const lots = [
  {
    effectiveExpiration: new Date(2026, 10, 8),
    expirationStatus: StockLotStatus.EXPIRING,
    id: "open",
    openedAt: new Date(2026, 10, 3),
    quantity: 1,
  },
  {
    effectiveExpiration: new Date(2026, 10, 30),
    expirationStatus: StockLotStatus.OK,
    id: "closed",
    quantity: 3,
  },
] as StockLotDTO[];

function setup(
  type: StockMovementTypes,
  overrides: Record<string, unknown> = {},
) {
  const model = new StockMovementUIModel(
    dto((f) =>
      f.withLots(lots).withUnit(StockUnits.KILOGRAM).withDescription("Milk"),
    ),
    type,
    "en-US",
  );
  const vm = {
    chosenLot: "",
    chosenReason: type === StockMovementTypes.DISCARD ? "OTHER" : "PURCHASE",
    errorKey: undefined,
    expirationDate: undefined,
    input: { mode: QuantityMode.LARGE, text: "1" },
    isLoading: false,
    isSaving: false,
    loadErrorKey: undefined,
    model,
    note: "",
    onClose: jest.fn(),
    onLotChange: jest.fn(),
    onNoteChange: jest.fn(),
    onQuantityChange: jest.fn(),
    onReasonChange: jest.fn(),
    onRetry: jest.fn(),
    onSave: jest.fn(),
    openPreview: model.openPreview("closed", 1),
    purchaseDate: undefined,
    quantityError: undefined,
    setExpirationDate: jest.fn(),
    setPurchaseDate: jest.fn(),
    type,
    ...overrides,
  };

  jest.mocked(useStockMovementViewModel).mockReturnValue(vm as never);
  render(<StockMovementModal />);

  return { vm };
}

describe("titles and fields per type", () => {
  it.each([
    [
      StockMovementTypes.ENTRY,
      "stock.movement.title.entry",
      "stock.movement.confirm.entry",
    ],
    [
      StockMovementTypes.CONSUME,
      "stock.movement.title.consume",
      "stock.movement.confirm.consume",
    ],
    [
      StockMovementTypes.OPEN,
      "stock.movement.title.open",
      "stock.movement.confirm.open",
    ],
    [
      StockMovementTypes.DISCARD,
      "stock.movement.title.discard",
      "stock.movement.confirm.discard",
    ],
    [
      StockMovementTypes.ADJUST,
      "stock.movement.title.adjust",
      "stock.movement.confirm.adjust",
    ],
  ])("SHOULD render %s", (type, title, confirm) => {
    setup(type);

    expect(screen.getByText(`${title} {"name":"Milk"}`)).toBeOnTheScreen();
    expect(screen.getByText(confirm)).toBeOnTheScreen();
  });

  it("SHOULD ask for the expiration and purchase dates and the reason of an entry", () => {
    setup(StockMovementTypes.ENTRY);

    expect(screen.getByText("stock.form.expiration")).toBeOnTheScreen();
    expect(screen.getByText("stock.form.purchase")).toBeOnTheScreen();
    expect(screen.getByText("stock.movement.reason")).toBeOnTheScreen();
    expect(screen.queryByText("stock.movement.lot")).toBeNull();
  });

  it("SHOULD ask for the lot of a consume with the automatic choice first", () => {
    const { vm } = setup(StockMovementTypes.CONSUME);

    fireEvent.press(screen.getByTestId(stockMovementTestIds.lotSelect));
    fireEvent.press(screen.getByText(/stock\.movement\.lotOpened/));

    expect(screen.queryByText("stock.form.expiration")).toBeNull();
    expect(vm.onLotChange).toHaveBeenCalledWith("open");
  });
});

describe("open", () => {
  it("SHOULD hint, warn about the lot already open and preview the split", () => {
    setup(StockMovementTypes.OPEN);

    expect(screen.getByText("stock.movement.openHint")).toBeOnTheScreen();
    expect(
      screen.getByTestId(stockMovementTestIds.alreadyOpen),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(stockMovementTestIds.preview)).toBeOnTheScreen();
    expect(
      screen.getByText(
        'stock.movement.afterOpened {"quantity":"1 common.units.kilogram"}',
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        'stock.movement.afterClosed {"quantity":"2 common.units.kilogram"}',
      ),
    ).toBeOnTheScreen();
  });

  it("SHOULD not show the closed remainder WHEN everything opens AND no preview without one", () => {
    setup(StockMovementTypes.OPEN, {
      openPreview: {
        before: { text: "3", unitKey: "common.units.kilogram" },
        opened: { text: "3", unitKey: "common.units.kilogram" },
      },
    });
    expect(screen.queryByText(/afterClosed/)).toBeNull();
  });

  it("SHOULD have no preview WHEN there is none", () => {
    setup(StockMovementTypes.OPEN, { openPreview: undefined });

    expect(screen.queryByTestId(stockMovementTestIds.preview)).toBeNull();
  });
});

describe("interaction", () => {
  it("SHOULD type the quantity, the note and pick the reason", () => {
    const { vm } = setup(StockMovementTypes.ENTRY);

    fireEvent.changeText(
      screen.getByTestId(stockMovementTestIds.quantityInput),
      "2",
    );
    fireEvent.changeText(screen.getByTestId(stockMovementTestIds.note), "n");
    fireEvent.press(
      screen.getByTestId(`${stockMovementTestIds.reason}-MANUAL`),
    );

    expect(vm.onQuantityChange).toHaveBeenCalledWith({
      mode: QuantityMode.LARGE,
      text: "2",
    });
    expect(vm.onNoteChange).toHaveBeenCalledWith("n");
    expect(vm.onReasonChange).toHaveBeenCalledWith("MANUAL");
  });

  it("SHOULD save AND show the quantity and server errors", () => {
    const { vm } = setup(StockMovementTypes.CONSUME, {
      errorKey: "stock.movement.errors.notEnough",
      quantityError: "stock.movement.errors.invalid",
    });

    fireEvent.press(screen.getByTestId(stockMovementTestIds.saveButton));

    expect(vm.onSave).toHaveBeenCalled();
    expect(screen.getByText("stock.movement.errors.invalid")).toBeOnTheScreen();
    expect(screen.getByTestId(stockMovementTestIds.error)).toHaveTextContent(
      "stock.movement.errors.notEnough",
    );
  });

  it("SHOULD show the loading skeleton and the load error with retry", () => {
    setup(StockMovementTypes.ENTRY, { isLoading: true, model: undefined });
    expect(screen.queryByText("stock.movement.quantity.entry")).toBeNull();
  });

  it("SHOULD retry WHEN the item failed to load", () => {
    const { vm } = setup(StockMovementTypes.ENTRY, {
      loadErrorKey: "stock.movement.loadError",
      model: undefined,
    });

    fireEvent.press(screen.getByText("common.actions.tryAgain"));

    expect(vm.onRetry).toHaveBeenCalled();
  });
});
