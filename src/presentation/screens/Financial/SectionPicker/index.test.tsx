import { fireEvent, screen } from "@tests";

import { setup, spies } from "./mocks/index.mocks";

it("SHOULD list the 5 sections AND mark the current one as selected", () => {
  setup("/financial/categories");

  ["transactions", "categories", "tags", "accounts", "cards"].forEach(
    (section) =>
      expect(
        screen.getByTestId(`financial.layout.section-sheet-${section}`),
      ).toBeOnTheScreen(),
  );
  expect(
    screen.getByTestId("financial.layout.section-sheet-categories").props
      .accessibilityState,
  ).toMatchObject({ selected: true });
  expect(
    screen.getByTestId("financial.layout.section-sheet-cards").props
      .accessibilityState,
  ).toMatchObject({ selected: false });
});

it("SHOULD close AND replace to the section WHEN another one is chosen", () => {
  setup("/financial/transaction");

  fireEvent.press(
    screen.getByTestId("financial.layout.section-sheet-accounts"),
  );

  expect(spies.back).toHaveBeenCalledTimes(1);
  expect(spies.replace).toHaveBeenCalledWith("/financial/accounts");
});

it("SHOULD only close WHEN the current section is chosen", () => {
  setup("/financial/cards");

  fireEvent.press(screen.getByTestId("financial.layout.section-sheet-cards"));

  expect(spies.back).toHaveBeenCalledTimes(1);
  expect(spies.replace).not.toHaveBeenCalled();
});

it("SHOULD only close WHEN the close button is pressed", () => {
  setup();

  fireEvent.press(screen.getByTestId("financial.layout.section-sheet-close"));

  expect(spies.back).toHaveBeenCalledTimes(1);
  expect(spies.replace).not.toHaveBeenCalled();
});
