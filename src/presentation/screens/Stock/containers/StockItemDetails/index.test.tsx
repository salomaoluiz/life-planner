import { fireEvent, screen, setup } from "./mocks/index.mocks";
import stockItemDetailsTestIds from "./testIds";

it("SHOULD render the title, the tiles and the restock badge", () => {
  setup();

  expect(screen.getByText("Leite")).toBeOnTheScreen();
  expect(screen.getByText("stock.details.total")).toBeOnTheScreen();
  expect(screen.getAllByText("3 common.units.liter").length).toBeGreaterThan(0);
  expect(
    screen.getByText("1 common.units.liter · 4 common.units.liter"),
  ).toBeOnTheScreen();
  expect(
    screen.getByText('stock.details.warnValue {"closed":7,"opened":1}'),
  ).toBeOnTheScreen();
  expect(
    screen.getByText(
      'stock.details.restock {"quantity":"1 common.units.liter"}',
    ),
  ).toBeOnTheScreen();
  expect(
    screen.getAllByTestId(new RegExp(`^${stockItemDetailsTestIds.tile}-`)),
  ).toHaveLength(4);
});

it("SHOULD render the lots (with Descartar on the expired one) AND the history", () => {
  const { vm } = setup();

  expect(screen.getAllByTestId(stockItemDetailsTestIds.lot)).toHaveLength(1);
  expect(screen.getByText("stock.badge.expired")).toBeOnTheScreen();
  expect(
    screen.getAllByTestId(stockItemDetailsTestIds.historyRow),
  ).toHaveLength(2);
  expect(screen.getByText("stock.history.type.consume")).toBeOnTheScreen();
  expect(
    screen.getByText(
      "stock.history.reason.purchase · stock.history.formerMember",
    ),
  ).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(stockItemDetailsTestIds.discardButton));

  expect(vm.onDiscard).toHaveBeenCalledWith("lot-1");
});

it.each([
  [stockItemDetailsTestIds.editButton, "onEdit"],
  [stockItemDetailsTestIds.openButton, "onOpen"],
  [stockItemDetailsTestIds.consumeButton, "onConsume"],
  [stockItemDetailsTestIds.entryButton, "onEntry"],
  [stockItemDetailsTestIds.loadMore, "onLoadMore"],
  [stockItemDetailsTestIds.deleteButton, "onDeletePress"],
] as const)(
  "SHOULD call the view model WHEN %s is pressed",
  (testID, handler) => {
    const { vm } = setup();

    fireEvent.press(screen.getByTestId(testID));

    expect(vm[handler]).toHaveBeenCalled();
  },
);

it("SHOULD hide 'load more' WHEN there is no next page AND show the empty states", () => {
  setup({ hasMore: false, history: [], model: undefined });

  expect(screen.queryByTestId(stockItemDetailsTestIds.loadMore)).toBeNull();
});

it("SHOULD show the empty lots and history texts", () => {
  const { vm } = setup({ history: [] });

  expect(screen.getByText("stock.history.empty")).toBeOnTheScreen();
  expect(vm.history).toEqual([]);
});

it("SHOULD show skeletons while loading AND the history loading", () => {
  setup({ history: [], isHistoryLoading: true, isLoading: true });

  expect(screen.queryByText("stock.history.empty")).toBeNull();
});

it("SHOULD show the load error with retry", () => {
  const { vm } = setup({
    loadErrorKey: "stock.details.error",
    model: undefined,
  });

  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(vm.onRetry).toHaveBeenCalled();
});

it("SHOULD show the delete error with retry and render the confirm dialog", () => {
  const { vm } = setup({
    errorKey: "common.errors.generic",
    isConfirmOpen: true,
  });

  expect(
    screen.getByText('stock.details.deleteTitle {"name":"Leite"}'),
  ).toBeOnTheScreen();
  expect(screen.getByText("stock.details.deleteMessage")).toBeOnTheScreen();

  fireEvent.press(screen.getAllByText("stock.details.delete")[0]);

  expect(vm.onConfirmDelete).toHaveBeenCalled();
});

it("SHOULD hide the sheet WHILE another modal is open on top of the screen", () => {
  setup({ isFocused: false });

  expect(screen.queryByTestId(stockItemDetailsTestIds.sheet)).toBeNull();
});
