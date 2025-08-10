import { act, screen } from "@tests";

import { ButtonMode } from "@components/Button/index";
import Icon from "@components/Icon";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD render the button with the correct props", () => {
  setup();

  const component = screen.getByTestId(defaultProps.testID);

  expect(component.props).toEqual({
    children: "Button Label",
    mode: ButtonMode.Filled,
    onPress: expect.any(Function),
    style: expect.any(Object),
    testID: "default-button",
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
  function func() {
    setup({ mode: "invalid" as ButtonMode });
  }

  expect(func).toThrow("Invalid mode");
});

it("SHOULD render the button with the correct icon", () => {
  setup({
    icon: () => (
      <Icon color={"black"} name={"google"} size={20} testID={"default-icon"} />
    ),
  });

  const component = screen.getByTestId(defaultProps.testID);

  expect(component.props.icon()).toEqual(
    <Icon color={"black"} name={"google"} size={20} testID={"default-icon"} />,
  );
});

it("SHOULD render the button with custom styles", () => {
  setup({ customStyles: { backgroundColor: "blue", textColor: "red" } });

  const component = screen.getByTestId(defaultProps.testID);

  expect(component.props).toEqual({
    ...component.props,
    buttonColor: "blue",
    textColor: "red",
  });
});
