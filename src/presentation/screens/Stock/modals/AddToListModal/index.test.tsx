import { fireEvent, render, screen } from "@tests";

import { initialInput } from "@domain/entities/stock/stockQuantity";

import AddToListModal from "./";
import { useAddToListViewModel } from "./hooks";
import addToListTestIds from "./testIds";

jest.mock("./hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const item = {
  category: { path: "Dairy › Milk" },
  description: "Milk",
  idealQuantity: 8,
  minQuantity: 3,
  quantity: 2,
  unit: "unit",
};

function setup(overrides: Record<string, unknown> = {}) {
  const vm = {
    failed: false,
    isLoading: false,
    item,
    listOptions: [
      { label: "Mercado", value: "d" },
      { label: "Farmácia", value: "p" },
    ],
    merge: undefined,
    notOffered: false,
    onClose: jest.fn(),
    onListChange: jest.fn(),
    onQuantityChange: jest.fn(),
    onSubmit: jest.fn(),
    quantity: initialInput(6, "unit" as never),
    saving: false,
    selectedListId: "d",
    ...overrides,
  };

  jest.mocked(useAddToListViewModel).mockReturnValue(vm as never);
  render(<AddToListModal />);

  return vm;
}

it("SHOULD show the item card and add on submit", () => {
  const vm = setup();

  expect(screen.getByText("Milk")).toBeOnTheScreen();
  expect(screen.getByText("Dairy › Milk")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId(addToListTestIds.submit));
  expect(vm.onSubmit).toHaveBeenCalled();
  fireEvent.press(screen.getByTestId(addToListTestIds.cancel));
  expect(vm.onClose).toHaveBeenCalled();
});

it("SHOULD show the merge notice and a failure", () => {
  setup({
    failed: true,
    item: {
      ...item,
      category: undefined,
      idealQuantity: undefined,
      minQuantity: undefined,
    },
    merge: { list: "Mercado", quantity: "6", total: "12" },
  });

  expect(screen.getByTestId(addToListTestIds.mergeNotice)).toBeOnTheScreen();
  expect(screen.getByText("common.errors.generic")).toBeOnTheScreen();
});

it("SHOULD explain a stock-only item cannot be listed, without the add button", () => {
  setup({ notOffered: true });

  expect(screen.getByTestId(addToListTestIds.notOffered)).toBeOnTheScreen();
  expect(screen.queryByTestId(addToListTestIds.submit)).toBeNull();
});

it("SHOULD show a skeleton while loading", () => {
  setup({ isLoading: true, item: undefined });

  expect(screen.queryByTestId(addToListTestIds.list)).toBeNull();
});
