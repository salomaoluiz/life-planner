import {
  DAY_MS,
  fireEvent,
  givenItem,
  screen,
  setup,
} from "./mocks/index.mocks";

it("SHOULD render the sheet titled with the description and the quantity", () => {
  setup();

  expect(screen.getByText("Leite")).toBeOnTheScreen();
  expect(screen.getByText("5 stock.units.kilogram")).toBeOnTheScreen();
});

it("SHOULD show the status badge only for attention items", () => {
  setup(givenItem({ expirationDate: new Date(Date.now() + 2 * DAY_MS) }));

  expect(screen.getByText('stock.status.days {"count":2}')).toBeOnTheScreen();
});

it("SHOULD NOT show a badge for an item that is fine", () => {
  setup();

  expect(screen.queryByText(/stock\.status\./)).toBeNull();
});

it("SHOULD show only the filled rows", () => {
  setup(givenItem({ brand: "Piracanjuba" }));

  expect(screen.getByText("stock.details.owner")).toBeOnTheScreen();
  expect(screen.getByText("Ana")).toBeOnTheScreen();
  expect(screen.getByText("stock.details.brand")).toBeOnTheScreen();
  expect(screen.getByText("Piracanjuba")).toBeOnTheScreen();
  expect(screen.queryByText("stock.details.expiration")).toBeNull();
  expect(screen.queryByText("stock.details.opening")).toBeNull();
  expect(screen.queryByText("stock.details.purchase")).toBeNull();
  expect(screen.queryByText("stock.details.barcode")).toBeNull();
  expect(screen.queryByText("stock.details.notes")).toBeNull();
});

it("SHOULD start the delete flow WHEN the delete button is pressed", () => {
  const { vm } = setup();

  fireEvent.press(screen.getByText("stock.details.delete"));

  expect(vm.onDeletePress).toHaveBeenCalled();
});

it("SHOULD render the confirm dialog and confirm the deletion", () => {
  const { vm } = setup(givenItem(), { isConfirmOpen: true });

  expect(
    screen.getByText('stock.details.deleteTitle {"name":"Leite"}'),
  ).toBeOnTheScreen();
  expect(screen.getByText("stock.details.deleteMessage")).toBeOnTheScreen();

  fireEvent.press(screen.getAllByText("stock.details.delete")[0]);

  expect(vm.onConfirmDelete).toHaveBeenCalled();
});

it("SHOULD show the error message and retry", () => {
  const { vm } = setup(givenItem(), { errorKey: "common.errors.generic" });

  expect(screen.getByText("common.errors.generic")).toBeOnTheScreen();

  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(vm.onConfirmDelete).toHaveBeenCalled();
});

it("SHOULD close the sheet", () => {
  const { props } = setup();

  fireEvent.press(screen.getAllByLabelText("common.actions.close")[0]);

  expect(props.onClose).toHaveBeenCalled();
});
