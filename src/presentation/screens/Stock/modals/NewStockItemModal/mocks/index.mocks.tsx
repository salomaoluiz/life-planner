import { fireEvent, render, screen, within } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { QuantityMode } from "@domain/entities/stock/stockQuantity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useBreakpoint } from "@presentation/theme";

import NewStockItemModal from "../";
import { useNewStockItemViewModel } from "../hooks";
import NewStockItemUIModel from "../models/NewStockItemUIModel";

jest.mock("../hooks");
jest.mock("@infrastructure/barcodeScanner", () => ({
  BarcodeScannerView: "BarcodeScannerView",
  useScannerPermission: () => ({ request: jest.fn(), status: "granted" }),
  vibrateOnScan: jest.fn(),
}));
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const owners = [
  new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-id", name: "Silva", type: OwnerType.FAMILY }),
];
const empty = { mode: QuantityMode.SMALL, text: "" };

function setup(
  overrides: Record<string, unknown> = {},
  breakpoint: "compact" | "expanded" | "medium" = "compact",
) {
  jest.mocked(useBreakpoint).mockReturnValue(breakpoint);
  const vm = {
    ai: {
      banner: undefined,
      canFillWithAi: false,
      clearSource: jest.fn(),
      isLimitReached: false,
      onFillWithAi: jest.fn(),
      onSkip: jest.fn(),
      packageHint: undefined,
      searching: false,
      sources: {},
      usage: undefined,
    },
    barcodeField: {
      inUse: undefined,
      isScanning: false,
      onClose: jest.fn(),
      onOpen: jest.fn(),
      onScanned: jest.fn(),
      onTyped: jest.fn(),
    },
    catalog: {
      categoryNodes: [
        { color: "#14B8A6", icon: "cow", id: "cat-1", name: "Dairy" },
      ],
      locationNodes: [
        { color: "#F59E0B", icon: "fridge", id: "loc-1", name: "Fridge" },
      ],
      mostUsedCategoryIds: [],
      mostUsedLocationIds: [],
    },
    errors: {},
    formErrorKey: undefined,
    isDiscardOpen: false,
    isEdit: false,
    isLoading: false,
    isMoreOpen: false,
    isSaving: false,
    linkName: undefined,
    model: new NewStockItemUIModel(owners),
    onAddToSuggestion: jest.fn(),
    onClose: jest.fn(),
    onDiscard: jest.fn(),
    onKeepEditing: jest.fn(),
    onLinkCode: jest.fn(),
    onOpenExistingItem: jest.fn(),
    onOwnerChange: jest.fn(),
    onSave: jest.fn(),
    onToggleMore: jest.fn(),
    ownerChangePreview: undefined,
    setField: jest.fn(),
    suggestion: undefined,
    values: {
      barcode: "",
      brand: "",
      description: "",
      ideal: empty,
      min: empty,
      notes: "",
      openedShelfLifeDays: "",
      ownerId: "user-id",
      quantity: empty,
      step: empty,
      stockOnly: false,
      unit: StockUnits.UNIT,
      warnDaysClosed: "7",
      warnDaysOpened: "1",
    },
    ...overrides,
  };

  jest.mocked(useNewStockItemViewModel).mockReturnValue(vm as never);
  render(<NewStockItemModal />);

  return { vm };
}

export { fireEvent, screen, setup, within };
