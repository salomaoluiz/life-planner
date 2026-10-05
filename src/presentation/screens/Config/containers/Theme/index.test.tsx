import { render, screen } from "@tests";

import { Picker } from "@components";
import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";
import { useTheme } from "@presentation/theme";

import Theme from "./";

it("SHOULD show the stored mode AND offer System, Light and Dark", () => {
  jest.mocked(useTheme).mockReturnValueOnce({
    ...useTheme(),
    themeMode: ThemeMode.DARK,
  });
  render(<Theme />);

  const picker = screen.UNSAFE_getByType(Picker);
  expect(picker.props.selectedValue).toBe(ThemeMode.DARK);
  expect(
    picker.props.items.map((item: { value: ThemeMode }) => item.value),
  ).toEqual([ThemeMode.SYSTEM, ThemeMode.LIGHT, ThemeMode.DARK]);
});

it("SHOULD call setThemeMode WHEN the user picks a mode", () => {
  const setThemeMode = jest.fn();
  jest.mocked(useTheme).mockReturnValueOnce({ ...useTheme(), setThemeMode });
  render(<Theme />);

  screen.UNSAFE_getByType(Picker).props.onValueChange(ThemeMode.LIGHT);

  expect(setThemeMode).toHaveBeenCalledWith(ThemeMode.LIGHT);
});
