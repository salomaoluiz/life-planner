import { hasText, render, screen } from "@tests";

import { Switch } from "@components";
import { useTheme } from "@presentation/theme";

import DarkMode from "./";

it("SHOULD render the title and a switch reflecting the current theme", () => {
  jest.mocked(useTheme).mockReturnValueOnce({
    ...useTheme(),
    isDark: true,
  });
  render(<DarkMode />);

  expect(hasText("configurations.configs.darkMode.title")).toBe(true);
  expect(screen.UNSAFE_getByType(Switch).props.initialStatus).toBe(true);
});

it("SHOULD update the theme WHEN the switch is toggled", () => {
  const { setIsDark } = useTheme();
  render(<DarkMode />);

  screen.UNSAFE_getByType(Switch).props.onToggle(true);

  expect(setIsDark).toHaveBeenCalledWith(true);
});
