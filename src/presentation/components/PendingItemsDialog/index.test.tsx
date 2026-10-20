import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import { setup, spies } from "./mocks/index.mocks";

it("SHOULD list every non-empty section with its items", () => {
  setup();

  expect(hasText("Recurrences")).toBe(true);
  expect(hasText("Invoices")).toBe(true);
  expect(hasText("Unpaid")).toBe(true);
  expect(hasText("Empty section")).toBe(false);
  expect(screen.getByTestId("pending-item-rec-1")).toBeTruthy();
  expect(screen.getByTestId("pending-item-inv-1")).toBeTruthy();
  expect(screen.getByTestId("pending-item-tx-1")).toBeTruthy();
});

it("SHOULD show the footnote WHEN given", () => {
  setup({ footnote: "+2 more" });

  expect(hasText("+2 more")).toBe(true);
});

it("SHOULD close from the OK button", () => {
  setup();

  fireEvent.press(screen.getByTestId("pending-ok"));

  expect(spies.onClose).toHaveBeenCalledTimes(1);
});
