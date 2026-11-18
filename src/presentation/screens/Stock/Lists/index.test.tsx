import { fireEvent, render, screen } from "@tests";

import StockLists from "./";
import { useStockListsViewModel } from "./hooks";
import stockListsTestIds from "./testIds";

jest.mock("./hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const card = {
  autoCount: 5,
  currency: "BRL",
  estimatedTotalCents: 18240,
  id: "m",
  isDefault: true,
  name: "Mercado",
  ownerName: "Casa",
  pricedCount: 10,
  rowCount: 12,
};

function setup(overrides: Record<string, unknown> = {}) {
  const vm = {
    activeCards: [
      card,
      { ...card, id: "e", isDefault: false, ownerName: undefined, rowCount: 0 },
      {
        ...card,
        autoCount: 0,
        id: "n",
        isDefault: false,
        pricedCount: 0,
        rowCount: 4,
      },
    ],
    archivedCards: [{ ...card, id: "a", name: "Churrasco" }],
    archivedOpen: false,
    errorMessageKey: undefined,
    filter: "ALL",
    filterOptions: [
      { labelKey: "stock.lists.filters.all", value: "ALL" },
      { labelKey: "stock.lists.filters.personal", value: "PERSONAL" },
      { label: "Casa", value: "f" },
    ],
    isEmpty: false,
    isLoading: false,
    isRefreshing: false,
    onArchivedToggle: jest.fn(),
    onCardPress: jest.fn(),
    onFilterChange: jest.fn(),
    onNewPress: jest.fn(),
    onReactivate: jest.fn(),
    onRefresh: jest.fn(),
    onRetry: jest.fn(),
    onToastHide: jest.fn(),
    reactivateFailed: false,
    readOnly: false,
    toastVisible: false,
    ...overrides,
  };

  jest.mocked(useStockListsViewModel).mockReturnValue(vm as never);
  render(<StockLists />);

  return vm;
}

it("SHOULD show the cards with the default badge, the automatic count and the estimate, and open one", () => {
  const vm = setup();

  expect(screen.getByTestId(`${stockListsTestIds.card}-m`)).toBeOnTheScreen();
  expect(screen.getAllByTestId(stockListsTestIds.cardDefault)).toHaveLength(1);
  expect(
    screen.getByTestId(`${stockListsTestIds.cardTotal}-m`),
  ).toBeOnTheScreen();
  expect(screen.getByText("stock.lists.noAuto")).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(`${stockListsTestIds.card}-m`));
  expect(vm.onCardPress).toHaveBeenCalledWith("m");
});

it("SHOULD say a list is empty and that rows have no price yet", () => {
  setup();

  expect(screen.getByText("stock.lists.empty")).toBeOnTheScreen();
  expect(screen.getByText("stock.lists.noPriceYet")).toBeOnTheScreen();
});

it("SHOULD filter by owner chips, create a list and reactivate an archived one", () => {
  const vm = setup({ archivedOpen: true });

  fireEvent.press(screen.getByTestId(`${stockListsTestIds.filter}-PERSONAL`));
  expect(vm.onFilterChange).toHaveBeenCalledWith("PERSONAL");

  fireEvent.press(screen.getByTestId(stockListsTestIds.newButton));
  expect(vm.onNewPress).toHaveBeenCalled();

  fireEvent.press(screen.getByTestId(stockListsTestIds.archivedToggle));
  expect(vm.onArchivedToggle).toHaveBeenCalled();

  fireEvent.press(screen.getByTestId(`${stockListsTestIds.reactivate}-a`));
  expect(vm.onReactivate).toHaveBeenCalledWith("a");
});

it("SHOULD hide the chips with a single owner and the new button for a read-only family", () => {
  setup({
    filterOptions: [
      { labelKey: "stock.lists.filters.all", value: "ALL" },
      { labelKey: "stock.lists.filters.personal", value: "PERSONAL" },
    ],
    readOnly: true,
  });

  expect(screen.queryByTestId(stockListsTestIds.filter)).toBeNull();
  expect(screen.queryByTestId(stockListsTestIds.newButton)).toBeNull();
  expect(
    screen.getByTestId(stockListsTestIds.readOnlyBanner),
  ).toBeOnTheScreen();
});

it("SHOULD show the loading, error and empty states", () => {
  setup({ isLoading: true });
  expect(screen.getByTestId(stockListsTestIds.loading)).toBeOnTheScreen();
  screen.unmount();

  const vm = setup({ errorMessageKey: "stock.lists.errorLoad" });
  expect(screen.getByTestId(stockListsTestIds.error)).toBeOnTheScreen();
  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(vm.onRetry).toHaveBeenCalled();
  screen.unmount();

  setup({ activeCards: [], archivedCards: [], isEmpty: true });
  expect(screen.getByTestId(stockListsTestIds.empty)).toBeOnTheScreen();
});
