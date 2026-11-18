import { fireEvent, render, screen } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import ShoppingListModal from "./";
import { useShoppingListViewModel } from "./hooks";
import shoppingListModalTestIds from "./testIds";

jest.mock("./hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

function setup(overrides: Record<string, unknown> = {}) {
  const vm = {
    canArchive: true,
    currentName: "Farmácia",
    defaultListName: "Mercado",
    errorKey: undefined,
    isDefault: false,
    isEdit: true,
    isLoading: false,
    nameError: undefined,
    onArchive: jest.fn(),
    onClose: jest.fn(),
    onDefaultChange: jest.fn(),
    onNameChange: jest.fn(),
    onOwnerChange: jest.fn(),
    onSubmit: jest.fn(),
    ownerName: "Casa",
    ownerOptions: [
      new OwnerDTO({ id: "u", name: "Ana", type: OwnerType.USER }),
      new OwnerDTO({ id: "f", name: "Casa", type: OwnerType.FAMILY }),
    ],
    saving: false,
    selectedOwnerId: "f",
    wasDefault: false,
    ...overrides,
  };

  jest.mocked(useShoppingListViewModel).mockReturnValue(vm as never);
  render(<ShoppingListModal />);

  return vm;
}

it("SHOULD edit: read-only owner, the default switch with the current default, save and archive", () => {
  const vm = setup();

  expect(screen.getByText("stock.lists.editTitle")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId(shoppingListModalTestIds.submit));
  expect(vm.onSubmit).toHaveBeenCalled();
  fireEvent.press(screen.getByTestId(shoppingListModalTestIds.archive));
  expect(vm.onArchive).toHaveBeenCalled();
  fireEvent.press(screen.getByTestId(shoppingListModalTestIds.cancel));
  expect(vm.onClose).toHaveBeenCalled();
  expect(screen.getByText("stock.lists.archiveHint")).toBeOnTheScreen();
});

it("SHOULD explain why the default list cannot be archived", () => {
  setup({ canArchive: false });

  expect(
    screen.getByText("stock.lists.archiveDefaultBlocked"),
  ).toBeOnTheScreen();
});

it("SHOULD create: owner chips instead of the read-only owner, and no archive", () => {
  const vm = setup({
    currentName: "",
    isEdit: false,
    ownerName: undefined,
    selectedOwnerId: "u",
  });

  expect(screen.getByText("stock.lists.newTitle")).toBeOnTheScreen();
  expect(screen.queryByTestId(shoppingListModalTestIds.archive)).toBeNull();
  fireEvent.press(screen.getByTestId(`${shoppingListModalTestIds.owner}-f`));
  expect(vm.onOwnerChange).toHaveBeenCalledWith("f");
});

it("SHOULD show the name errors (required, taken) and the generic error", () => {
  setup({ nameError: "stock.lists.nameRequired" });
  expect(screen.getByText("stock.lists.nameRequired")).toBeOnTheScreen();
  screen.unmount();

  setup({ errorKey: "stock.lists.nameTaken" });
  expect(screen.getByText("stock.lists.nameTaken")).toBeOnTheScreen();
  screen.unmount();

  setup({ errorKey: "common.errors.generic" });
  expect(screen.getByText("common.errors.generic")).toBeOnTheScreen();
});

it("SHOULD show a skeleton while loading", () => {
  setup({ isLoading: true });

  expect(screen.queryByTestId(shoppingListModalTestIds.name)).toBeNull();
});
