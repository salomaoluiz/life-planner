import { buildNavigationTheme } from "./navigation";
import { darkTheme, lightTheme } from "./provider";

it.each([lightTheme, darkTheme])(
  "SHOULD build the React Navigation theme from the tokens",
  (theme) => {
    const nav = buildNavigationTheme(theme);

    expect(nav.dark).toBe(theme.dark);
    expect(nav.colors).toEqual({
      background: theme.colors.background,
      border: theme.colors.border,
      card: theme.colors.surface,
      notification: theme.colors.expense,
      primary: theme.colors.accent,
      text: theme.colors.textPrimary,
    });
  },
);
