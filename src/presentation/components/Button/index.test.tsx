import { BlurView } from "expo-blur";

import { act, mockDarkTheme, screen } from "@tests";

import { ButtonMode } from "@components/Button/index";
import Icon from "@components/Icon";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD render the button with the correct props", () => {
  setup();

  const component = screen.getByTestId(defaultProps.testID);

  expect(component.props).toEqual({
    children: "Button Label",
    contentStyle: { height: 55 },
    mode: "text",
    onPress: expect.any(Function),
    style: expect.any(Object),
    testID: "default-button",
    textColor: "rgb(255, 255, 255)",
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

describe("theme fallbacks", () => {
  function withColors(overrides: Record<string, unknown>) {
    const { useTheme } = jest.requireMock("@presentation/theme");
    const current = useTheme();
    useTheme.mockReturnValue({
      ...current,
      theme: {
        ...current.theme,
        colors: { ...current.theme.colors, ...overrides },
      },
    });

    return () => useTheme.mockReturnValue(current);
  }

  it("SHOULD fall back to white text WHEN the filled button theme has no onPrimary", () => {
    const restore = withColors({ onPrimary: undefined });

    setup({ mode: ButtonMode.Filled });

    expect(screen.getByTestId(defaultProps.testID).props.textColor).toBe(
      "#ffffff",
    );
    restore();
  });

  it("SHOULD fall back to translucent white text WHEN the outlined button theme has no glassTextSecondary", () => {
    const restore = withColors({ glassTextSecondary: undefined });

    setup({ mode: ButtonMode.Outlined });

    expect(screen.getByTestId(defaultProps.testID).props.textColor).toBe(
      "rgba(255, 255, 255, 0.8)",
    );
    restore();
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
