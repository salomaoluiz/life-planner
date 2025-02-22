import { defaultProps, setup } from "./mocks";
import { screen, act } from "@tests";

it("SHOULD render the Switch component with the correct props", () => {
  setup();

  const component = screen.getByTestId("default-switch");

  expect(component.props).toEqual({
    testID: "default-switch",
    onValueChange: expect.any(Function),
    value: false,
    style: expect.any(Object),
    children: undefined,
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
