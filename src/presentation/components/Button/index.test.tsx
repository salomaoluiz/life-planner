import { BlurView } from "expo-blur";

import { act, mockDarkTheme, screen } from "@tests";

import { ButtonMode } from "@components/Button/index";
import Icon from "@components/Icon";
import { lightTheme } from "@presentation/theme/provider";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD render the button with the correct props", () => {
  setup();

  const component = screen.getByTestId(defaultProps.testID);

  expect(component.props).toEqual({
    children: "Button Label",
    contentStyle: { height: 48 },
    mode: "text",
    onPress: expect.any(Function),
    style: expect.any(Object),
    testID: "default-button",
    textColor: lightTheme.colors.onAccent,
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

it.each([
  { expectedMode: "text", mode: ButtonMode.Outlined },
  { expectedMode: "text", mode: ButtonMode.Text },
  { expectedMode: "text", mode: ButtonMode.Filled },
])("SHOULD render the button in %s mode", ({ expectedMode, mode }) => {
  setup({ mode });

  const component = screen.getByTestId(defaultProps.testID);

  expect(component.props.mode).toBe(expectedMode);
});

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

  expect(component.props.textColor).toBe("red");
  expect(component.props.style).toContainEqual(
    expect.objectContaining({ backgroundColor: "blue" }),
  );
});

it("SHOULD forward the loading prop to the underlying button", () => {
  setup({ loading: true });

  expect(screen.getByTestId(defaultProps.testID).props.loading).toBe(true);
});

it("SHOULD forward the loading prop in every mode", () => {
  setup({ loading: true, mode: ButtonMode.Text });

  expect(screen.getByTestId(defaultProps.testID).props.loading).toBe(true);
});

describe("theme tokens", () => {
  it("SHOULD use the onAccent text color WHEN the button is filled", () => {
    setup({ mode: ButtonMode.Filled });

    expect(screen.getByTestId(defaultProps.testID).props.textColor).toBe(
      lightTheme.colors.onAccent,
    );
  });

  it("SHOULD use the textSecondary text color WHEN the button is outlined", () => {
    setup({ mode: ButtonMode.Outlined });

    expect(screen.getByTestId(defaultProps.testID).props.textColor).toBe(
      lightTheme.colors.textSecondary,
    );
  });

  it.each([
    [false, "light"],
    [true, "dark"],
  ])("SHOULD use the blur tint for isDark=%s", (dark, tint) => {
    const restore = dark ? mockDarkTheme() : () => undefined;

    setup();

    expect(screen.UNSAFE_getByType(BlurView).props.tint).toBe(tint);
    restore();
  });

  it("SHOULD apply the disabled style WHEN disabled", () => {
    setup({ disabled: true });

    expect(screen.getByTestId(defaultProps.testID).props.disabled).toBe(true);
  });
});
