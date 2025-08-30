import { screen } from "@tests";

import { defaultProps, setup } from "./mocks/FabGroup.mocks";

it("SHOULD render FAB Group with correct props", () => {
  setup();

  const fabGroup = screen.getByTestId(defaultProps.testID!);
  expect(fabGroup).toBeDefined();
  expect(fabGroup.props.icon).toBe(defaultProps.icon);
  expect(fabGroup.props.open).toBe(defaultProps.isOpen);
  expect(fabGroup.props.visible).toBe(true);
});

it("SHOULD call onStateChange when state changes", () => {
  const onStateChange = jest.fn();
  setup({ onStateChange });

  const fabGroup = screen.getByTestId(defaultProps.testID!);
  const newState = { open: true };
  fabGroup.props.onStateChange(newState);

  expect(onStateChange).toHaveBeenCalledWith(newState);
});

it("SHOULD render with visible prop when provided", () => {
  setup({ visible: false });

  const fabGroup = screen.getByTestId(defaultProps.testID!);
  expect(fabGroup.props.visible).toBe(false);
});

it("SHOULD render actions correctly", () => {
  setup();

  const fabGroup = screen.getByTestId(defaultProps.testID!);
  expect(fabGroup.props.actions).toEqual(defaultProps.actions);
});

it("SHOULD default visible to true when not provided", () => {
  setup({ visible: undefined });

  const fabGroup = screen.getByTestId(defaultProps.testID!);
  expect(fabGroup.props.visible).toBe(true);
});