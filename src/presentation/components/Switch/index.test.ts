import { act, mockDarkTheme, screen } from "@tests";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD render the Switch component with the correct props", () => {
  setup();

  const component = screen.getByTestId("default-switch");

  expect(component.props).toEqual(
    expect.objectContaining({
      children: undefined,
      color: expect.any(String),
      onValueChange: expect.any(Function),
      style: expect.any(Object),
      testID: "default-switch",
      value: false,
    }),
  );
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

  expect(component.props.style).toEqual({
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  });
});

it("SHOULD use the accent color of the active theme", () => {
  const restore = mockDarkTheme();

  setup();

  expect(screen.getByTestId("default-switch").props.color).toBe(
    jest.requireMock("@presentation/theme").useTheme().theme.colors.accent,
  );
  restore();
});
