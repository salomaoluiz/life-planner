import { fireEvent, screen } from "@testing-library/react-native";

import { defaultProps, setup } from "./mocks/index.mocks";

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD render a labelled radio tile per option with the label as text", () => {
  setup();

  expect(screen.getAllByTestId(/^types-[A-Z]+$/)).toHaveLength(
    defaultProps.options.length,
  );
  expect(screen.getByText("Brokerage")).toBeOnTheScreen();
  expect(screen.getByTestId("types-CHECKING").props.accessibilityLabel).toBe(
    "Checking",
  );
});

it("SHOULD mark only the current value selected", () => {
  setup();

  expect(
    screen.getByTestId("types-SAVINGS").props.accessibilityState.selected,
  ).toBe(true);
  expect(
    screen.getByTestId("types-CHECKING").props.accessibilityState.selected,
  ).toBe(false);
});

it("SHOULD call onChange with the value of the pressed tile", () => {
  setup();

  fireEvent.press(screen.getByTestId("types-BROKERAGE"));

  expect(defaultProps.onChange).toHaveBeenCalledWith("BROKERAGE");
});

it("SHOULD not call onChange WHEN disabled", () => {
  setup({ disabled: true });

  fireEvent.press(screen.getByTestId("types-BROKERAGE"));

  expect(defaultProps.onChange).not.toHaveBeenCalled();
});

it("SHOULD use the testID of the option WHEN it has one", () => {
  setup({
    options: [
      {
        icon: "bank",
        label: "Checking",
        testID: "custom.id",
        value: "CHECKING",
      },
    ],
  });

  expect(screen.getByTestId("custom.id")).toBeOnTheScreen();
});
