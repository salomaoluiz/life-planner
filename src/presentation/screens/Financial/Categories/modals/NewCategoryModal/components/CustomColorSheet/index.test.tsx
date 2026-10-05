import { fireEvent, render, screen } from "@tests";

import CustomColorSheet from "./";

function setup(
  overrides: Partial<React.ComponentProps<typeof CustomColorSheet>> = {},
) {
  const props = {
    applyLabel: "Use color",
    closeLabel: "Close",
    color: "#123456",
    hexLabel: "Hex color",
    onApply: jest.fn(),
    onChange: jest.fn(),
    onClose: jest.fn(),
    title: "Custom color",
    value: "#123456",
    ...overrides,
  };
  render(<CustomColorSheet {...props} />);

  return props;
}

it("SHOULD render the title, the hex field and the apply button", () => {
  setup();

  expect(screen.getByText("Custom color")).toBeOnTheScreen();
  expect(screen.getByDisplayValue("#123456")).toBeOnTheScreen();
  expect(screen.getByText("Use color")).toBeOnTheScreen();
});

it("SHOULD report the typed text and apply WHEN valid", () => {
  const props = setup();

  fireEvent.changeText(screen.getByDisplayValue("#123456"), "#a1b2c3");
  fireEvent.press(screen.getByText("Use color"));

  expect(props.onChange).toHaveBeenCalledWith("#a1b2c3");
  expect(props.onApply).toHaveBeenCalledTimes(1);
});

it("SHOULD show the error and not apply WHEN invalid", () => {
  const props = setup({ error: "Invalid hex", value: "#12" });

  expect(screen.getByText("Invalid hex")).toBeOnTheScreen();
  fireEvent.press(screen.getByText("Use color"));

  expect(props.onApply).not.toHaveBeenCalled();
});
