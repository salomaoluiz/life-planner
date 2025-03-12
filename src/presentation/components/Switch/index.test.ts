import { act, screen } from "@tests";

import { defaultProps, setup } from "./mocks";

it("SHOULD render the Switch component with the correct props", () => {
  setup();

  const component = screen.getByTestId("default-switch");

  expect(component.props).toEqual({
    children: undefined,
    onValueChange: expect.any(Function),
    style: expect.any(Object),
    testID: "default-switch",
    value: false,
  });
});

it("SHOULD call the onToggle function with the correct value", () => {
  setup();

  const component = screen.getByTestId("default-switch");

  act(() => {
    component.props.onValueChange(true);
  });

  expect(defaultProps.onToggle).toHaveBeenCalledWith(true);
  expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
});

it("SHOULD have the correct style", () => {
  setup();

  const component = screen.getByTestId("default-switch");

  expect(component.props.style).toEqual({});
});
