import { screen } from "@tests";

import { setup } from "./mocks/Logout.mocks";

it("SHOULD render Logout button", () => {
  setup();

  expect(screen.getByTestId("button-text")).toBeDefined();
});

it("SHOULD render button with logout icon", () => {
  setup();

  const button = screen.getByTestId("button-text");
  expect(button.props.icon).toBe("logout");
});

it("SHOULD render button with error color", () => {
  setup();

  const button = screen.getByTestId("button-text");
  expect(button.props.customStyles).toEqual({ textColor: "error" });
});