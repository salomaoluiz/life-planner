import { fireEvent, render, screen } from "@tests";

import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import StockItemUIModel from "@screens/Stock/models/StockItemUIModel";

import StockItemDetails from "../";
import { useStockItemDetailsViewModel } from "../hooks";

jest.mock("../hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const DAY_MS = 24 * 60 * 60 * 1000;
const owners = [
  new OwnerDTO({ id: "owner-1", name: "Ana", type: OwnerType.USER }),
];

function givenItem(
  overrides: Partial<ConstructorParameters<typeof StockDTO>[0]> = {},
) {
  return new StockItemUIModel(
    new StockDTO({
      description: "Leite",
      id: "stock-1",
      owner: StockOwners.USER,
      ownerId: "owner-1",
      quantity: 5,
      unit: StockUnits.KILOGRAM,
      ...overrides,
    }),
    owners,
    new Date(),
    "en-US",
  );
}

function setup(item = givenItem(), vmOverrides: Record<string, unknown> = {}) {
  const vm = {
    errorKey: undefined,
    isConfirmOpen: false,
    isDeleting: false,
    onCancelDelete: jest.fn(),
    onConfirmDelete: jest.fn(),
    onDeletePress: jest.fn(),
    ...vmOverrides,
  };
  jest.mocked(useStockItemDetailsViewModel).mockReturnValue(vm as never);
  const props = { item, onClose: jest.fn(), onDeleted: jest.fn() };
  render(<StockItemDetails {...props} />);

  return { props, vm };
}

export { DAY_MS, fireEvent, givenItem, screen, setup };
