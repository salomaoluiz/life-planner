import { screen } from "@tests";

import { defaultProps, setup } from "./mocks/Fab.mocks";

it("SHOULD render FAB with correct props", () => {
  setup();

  const fab = screen.getByTestId(defaultProps.testID!);
  expect(fab).toBeDefined();
  expect(fab.props.icon).toBe(defaultProps.icon);
  expect(fab.props.testID).toBe(defaultProps.testID);
});

it("SHOULD render FAB with label when provided", () => {
  const label = "Add Item";
  setup({ label });

  const fab = screen.getByTestId(defaultProps.testID!);
  expect(fab.props.label).toBe(label);
});

it("SHOULD call onPress when pressed", () => {
  const onPress = jest.fn();
  setup({ onPress });

  const fab = screen.getByTestId(defaultProps.testID!);
  fab.props.onPress();

  expect(onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD render without label when not provided", () => {
  setup();

  const fab = screen.getByTestId(defaultProps.testID!);
  expect(fab.props.label).toBeUndefined();
});