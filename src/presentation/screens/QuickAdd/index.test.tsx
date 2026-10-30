import { fireEvent, screen } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { setup } from "./mocks/index.mocks";

it("SHOULD render the sheet with the Add title AND the two options", () => {
  setup();

  expect(screen.getByTestId("quick-add-sheet")).toBeOnTheScreen();
  expect(screen.getByText("navigation.quickAdd.title")).toBeOnTheScreen();
  expect(screen.getByTestId("quick-add-transaction")).toBeOnTheScreen();
  expect(screen.getByTestId("quick-add-stock-item")).toBeOnTheScreen();
});

it("SHOULD replace the sheet with the add-transaction form WHEN Transaction is chosen", () => {
  setup();

  fireEvent.press(screen.getByTestId("quick-add-transaction"));

  expect(modalNavigation.replaceModal).toHaveBeenCalledWith(
    "add_new_transaction",
  );
  expect(modalNavigation.closeModal).not.toHaveBeenCalled();
});

it("SHOULD replace the sheet with the add-stock-item form WHEN Stock item is chosen", () => {
  setup();

  fireEvent.press(screen.getByTestId("quick-add-stock-item"));

  expect(modalNavigation.replaceModal).toHaveBeenCalledWith(
    "add_new_stock_item",
  );
});

it("SHOULD go back (keeping the tab the user was on) WHEN the sheet is closed", () => {
  setup();

  fireEvent.press(screen.getByTestId("quick-add-sheet-close"));

  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);
});
