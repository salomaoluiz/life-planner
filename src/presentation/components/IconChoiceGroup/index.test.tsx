import { fireEvent, screen } from "@testing-library/react-native";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD render a labelled tile per option", () => {
  setup();

  expect(screen.getAllByTestId(/^icons-icon-/)).toHaveLength(
    defaultProps.options.length,
  );
  expect(screen.getByTestId("icons-icon-car").props.accessibilityLabel).toBe(
    "car",
  );
});

it("SHOULD mark only the current value selected", () => {
  setup();

  expect(
    screen.getByTestId("icons-icon-food").props.accessibilityState.selected,
  ).toBe(true);
  expect(
    screen.getByTestId("icons-icon-car").props.accessibilityState.selected,
  ).toBe(false);
});

it("SHOULD append an extra selected tile WHEN the value is outside the options", () => {
  setup({ value: "medical-bag" });

  const tile = screen.getByTestId("icons-icon-medical-bag");

  expect(tile.props.accessibilityState.selected).toBe(true);
  expect(tile.props.accessibilityLabel).toBe("medical bag");
  expect(screen.getAllByTestId(/^icons-icon-/)).toHaveLength(
    defaultProps.options.length + 1,
  );
});

it("SHOULD not append a tile WHEN the value is empty", () => {
  setup({ value: "" });

  expect(screen.getAllByTestId(/^icons-icon-/)).toHaveLength(
    defaultProps.options.length,
  );
});

it("SHOULD call onChange with the tile value", () => {
  const onChange = jest.fn();
  setup({ onChange });

  fireEvent.press(screen.getByTestId("icons-icon-car"));

  expect(onChange).toHaveBeenCalledWith("car");
});

it("SHOULD render More only with both moreLabel and onMorePress", () => {
  const onMorePress = jest.fn();
  setup({ moreLabel: "More" });

  expect(screen.queryByTestId("icons-more")).toBeNull();

  screen.unmount();
  setup({ moreLabel: "More", onMorePress });
  fireEvent.press(screen.getByTestId("icons-more"));

  expect(onMorePress).toHaveBeenCalledTimes(1);
});
