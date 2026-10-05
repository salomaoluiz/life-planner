import { fireEvent, render, screen } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import NewStockItemModal from "../";
import { useNewStockItemViewModel } from "../hooks";
import NewStockItemUIModel from "../models/NewStockItemUIModel";

jest.mock("../hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const owners = [
  new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-id", name: "Silva", type: OwnerType.FAMILY }),
];

function setup(overrides: Record<string, unknown> = {}) {
  const vm = {
    errors: {},
    formErrorKey: undefined,
    isDiscardOpen: false,
    isLoading: false,
    isMoreOpen: false,
    isSaving: false,
    model: new NewStockItemUIModel(owners),
    onClose: jest.fn(),
    onDiscard: jest.fn(),
    onKeepEditing: jest.fn(),
    onSave: jest.fn(),
    onToggleMore: jest.fn(),
    setField: jest.fn(),
    values: {
      barcode: "",
      brand: "",
      description: "",
      notes: "",
      ownerId: "user-id",
      quantity: "1",
      unit: "unit",
    },
    ...overrides,
  };
  jest.mocked(useNewStockItemViewModel).mockReturnValue(vm as never);
  render(<NewStockItemModal />);

  return { vm };
}

export { fireEvent, screen, setup };
