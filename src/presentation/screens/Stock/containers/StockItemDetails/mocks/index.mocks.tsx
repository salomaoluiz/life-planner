import { fireEvent, render, screen } from "@tests";

import { StockLotDTO } from "@application/dto/stock/StockDTO";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { StockLotStatus } from "@domain/entities/stock/StockLotEntity";
import StockItemUIModel from "@screens/Stock/models/StockItemUIModel";
import { dto, owners } from "@screens/Stock/models/stockUi.fixtures";

import StockItemDetails from "../";
import { useStockItemDetailsViewModel } from "../hooks";
import StockItemDetailsUIModel from "../models/StockItemDetailsUIModel";

jest.mock("../hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const detail = dto((f) =>
  f
    .withId("stock-1")
    .withDescription("Leite")
    .withUnit(StockUnits.LITER)
    .withQuantity(3)
    .withMinQuantity(1, 4)
    .withNeedsRestock()
    .withLots([
      {
        effectiveExpiration: new Date(2026, 10, 2),
        expirationDate: new Date(2026, 10, 2),
        expirationStatus: StockLotStatus.EXPIRED,
        id: "lot-1",
        quantity: 3,
      } as StockLotDTO,
    ]),
);
const item = new StockItemUIModel(detail, owners, "en-US");

function setup(vmOverrides: Record<string, unknown> = {}) {
  const model = new StockItemDetailsUIModel(detail, owners, "en-US");
  const vm = {
    errorKey: undefined,
    hasMore: true,
    history: model.history([
      {
        createdAt: new Date(2026, 10, 6, 8, 12),
        id: "m1",
        lotId: "lot-1",
        quantity: -1,
        type: "CONSUME",
        user: { id: "u", name: "Ana" },
      } as never,
      {
        createdAt: new Date(2026, 10, 5, 19, 40),
        id: "m2",
        lotId: "lot-1",
        quantity: 2,
        reason: "PURCHASE",
        type: "ENTRY",
      } as never,
    ]),
    isConfirmOpen: false,
    isDeleting: false,
    isFocused: true,
    isHistoryLoading: false,
    isLoading: false,
    isLoadingMore: false,
    loadErrorKey: undefined,
    model,
    onAdjust: jest.fn(),
    onCancelDelete: jest.fn(),
    onConfirmDelete: jest.fn(),
    onConsume: jest.fn(),
    onDeletePress: jest.fn(),
    onDiscard: jest.fn(),
    onEdit: jest.fn(),
    onEntry: jest.fn(),
    onLoadMore: jest.fn(),
    onOpen: jest.fn(),
    onRetry: jest.fn(),
    ...vmOverrides,
  };

  jest.mocked(useStockItemDetailsViewModel).mockReturnValue(vm as never);
  const props = { item, onClose: jest.fn(), onDeleted: jest.fn() };

  render(<StockItemDetails {...props} />);

  return { props, vm };
}

export { fireEvent, item, screen, setup };
