import { fireEvent, screen } from "@testing-library/react-native";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD render one swatch per option plus Custom", () => {
  setup();

  expect(screen.getAllByTestId(/^swatches-swatch-/)).toHaveLength(
    defaultProps.options.length,
  );
  expect(screen.getByTestId("swatches-custom")).toBeTruthy();
});

it("SHOULD mark the matching swatch selected ignoring case", () => {
  setup({ value: "#f59e0b" });

  expect(
    screen.getByTestId("swatches-swatch-#F59E0B").props.accessibilityState
      .selected,
  ).toBe(true);
  expect(
    screen.getByTestId("swatches-custom").props.accessibilityState.selected,
  ).toBe(false);
});

it("SHOULD select Custom WHEN the value is not in the palette", () => {
  setup({ value: "#123456" });

  expect(
    screen.getByTestId("swatches-custom").props.accessibilityState.selected,
  ).toBe(true);
});

it("SHOULD call onChange with the swatch value and onCustomPress for Custom", () => {
  const onChange = jest.fn();
  const onCustomPress = jest.fn();
  setup({ onChange, onCustomPress });

  fireEvent.press(screen.getByTestId("swatches-swatch-#EF4444"));
  fireEvent.press(screen.getByTestId("swatches-custom"));

  expect(onChange).toHaveBeenCalledWith("#EF4444");
  expect(onCustomPress).toHaveBeenCalledTimes(1);
});

it("SHOULD label each swatch with its color name", () => {
  setup();

  expect(
    screen.getByTestId("swatches-swatch-#F59E0B").props.accessibilityLabel,
  ).toBe("Amber");
});
