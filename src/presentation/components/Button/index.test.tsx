import { setup, defaultProps } from "./mocks";
import { screen, act } from "@tests";
import { ButtonMode } from "@components/Button/index";

it("SHOULD render the button with the correct props", () => {
  setup();

  const component = screen.getByTestId(defaultProps.testID);

  expect(component.props).toEqual({
    children: "Button Label",
    mode: ButtonMode.Filled,
    onPress: expect.any(Function),
    testID: "default-button",
    style: expect.any(Object),
  });
});

it("SHOULD call the onPress function when the button is pressed", () => {
  setup();

  const component = screen.getByTestId(defaultProps.testID);

  act(() => {
    component.props.onPress();
  });

  expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  expect(defaultProps.onPress).toHaveBeenCalledWith();
});

it.each([ButtonMode.Outlined, ButtonMode.Text, ButtonMode.Filled])(
  "SHOULD render the button in %s mode",
  (mode) => {
    setup({ mode });

    const component = screen.getByTestId(defaultProps.testID);

    expect(component.props.mode).toBe(mode);
  },
);

it("SHOULD throw an error if an invalid mode is passed", () => {
  const func = () => setup({ mode: "invalid" as ButtonMode });

  expect(func).toThrow("Invalid mode");
});
