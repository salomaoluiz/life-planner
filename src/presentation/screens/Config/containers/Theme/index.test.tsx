import { render, screen } from "@tests";

import { SelectField } from "@components";
import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";
import { useTheme } from "@presentation/theme";

import Theme from "./";

it("SHOULD show the stored mode AND offer System, Light and Dark", () => {
  jest.mocked(useTheme).mockReturnValueOnce({
    ...useTheme(),
    themeMode: ThemeMode.DARK,
  });
  render(<Theme />);

  const field = screen.UNSAFE_getByType(SelectField);
  expect(field.props.value).toBe(ThemeMode.DARK);
  expect(
    field.props.options.map((item: { value: ThemeMode }) => item.value),
  ).toEqual([ThemeMode.SYSTEM, ThemeMode.LIGHT, ThemeMode.DARK]);
});

it("SHOULD call setThemeMode WHEN the user picks a mode", () => {
  const setThemeMode = jest.fn();
  jest.mocked(useTheme).mockReturnValueOnce({ ...useTheme(), setThemeMode });
  render(<Theme />);

  screen.UNSAFE_getByType(SelectField).props.onChange(ThemeMode.LIGHT);

  expect(setThemeMode).toHaveBeenCalledWith(ThemeMode.LIGHT);
});

it("SHOULD ignore a value that is not a theme mode", () => {
  const setThemeMode = jest.fn();
  jest.mocked(useTheme).mockReturnValueOnce({ ...useTheme(), setThemeMode });
  render(<Theme />);

  screen.UNSAFE_getByType(SelectField).props.onChange("PURPLE");

  expect(setThemeMode).not.toHaveBeenCalled();
});
