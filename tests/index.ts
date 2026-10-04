import { render, screen } from "@testing-library/react-native";
import React from "react";

interface RenderOptions {
  wrapper: React.FunctionComponent<{ children: React.ReactElement }>;
}

function customRender(
  component: React.JSX.Element,
  options?: Partial<RenderOptions>,
) {
  render(component, options);
}

// react-native-paper components are mocked as <View>, so RNTL's getByText
// cannot see their string children; match on the children prop instead.
function hasText(text: string) {
  return screen.UNSAFE_queryAllByProps({ children: text }).length > 0;
}

// Switches the globally mocked `useTheme` to the dark theme. Returns a
// function that restores the light theme (call it in `afterEach`).
function mockDarkTheme() {
  const { useTheme } = jest.requireMock("@presentation/theme");
  const { lightTheme } = jest.requireActual("@presentation/theme/provider");
  const { colors } = jest.requireActual("@presentation/theme/constants");
  const light = useTheme();

  useTheme.mockReturnValue({
    isDark: true,
    setIsDark: jest.fn(),
    theme: { ...lightTheme, colors: colors.dark, dark: true },
  });

  return () => useTheme.mockReturnValue(light);
}

function suppressConsoleError() {
  const errorSpy = jest
    .spyOn(global.console, "error")
    .mockImplementation(() => {
      // do nothing
    });

  return () => errorSpy.mockRestore();
}

export {
  act,
  fireEvent,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react-native";
export { hasText, mockDarkTheme, customRender as render, suppressConsoleError };
