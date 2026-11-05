import { screen } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD show the icon, the title, the caption and the value", () => {
  setup();

  expect(screen.getByTestId("row-icon").props.source).toBe("star");
  expect(screen.getByText("Checking")).toBeTruthy();
  expect(screen.getByText("Favorite account")).toBeTruthy();
  expect(screen.getByText("R$ 10,00")).toBeTruthy();
});

it("SHOULD tint the row by the sign of the value", () => {
  setup({ tone: "income" });
  const income = screen.getByTestId("row").props.style;

  screen.unmount();
  setup({ tone: "expense" });
  const expense = screen.getByTestId("row").props.style;

  expect(JSON.stringify(income)).not.toBe(JSON.stringify(expense));
});

it("SHOULD be one accessible item that reads title, caption and value", () => {
  setup();

  expect(screen.getByTestId("row").props.accessibilityLabel).toBe(
    "Checking, Favorite account, R$ 10,00",
  );
});
