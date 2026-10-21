import { fireEvent, screen } from "@tests";

import { defaultProps, setup } from "./mocks/index.mocks";

function box() {
  return screen.getByTestId("checkbox");
}

it("SHOULD be an unchecked checkbox with its label and call onChange when pressed", () => {
  setup();
  expect(screen.getByText("Groceries")).toBeOnTheScreen();
  expect(box().props.accessibilityRole).toBe("checkbox");
  expect(box().props.accessibilityState).toEqual(
    expect.objectContaining({ checked: false }),
  );
  fireEvent.press(box());
  expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
});

it("SHOULD report checked", () => {
  setup({ checked: true });
  expect(box().props.accessibilityState).toEqual(
    expect.objectContaining({ checked: true }),
  );
});

it("SHOULD report mixed for a partly chosen parent", () => {
  setup({ checked: "mixed" });
  expect(box().props.accessibilityState).toEqual(
    expect.objectContaining({ checked: "mixed" }),
  );
});

it("SHOULD not call onChange when disabled", () => {
  setup({ disabled: true });
  fireEvent.press(box());
  expect(defaultProps.onChange).not.toHaveBeenCalled();
});

beforeEach(() => jest.clearAllMocks());
