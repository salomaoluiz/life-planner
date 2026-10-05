import { darkTheme, lightTheme } from "../provider";
import { buildPaperTheme } from "./buildPaperTheme";

it.each([lightTheme, darkTheme])(
  "SHOULD feed Paper MD3 colors from the tokens",
  (theme) => {
    const { colors, dark } = buildPaperTheme(theme);
    const t = theme.colors;

    expect(dark).toBe(theme.dark);
    expect(colors).toMatchObject({
      backdrop: t.scrim,
      background: t.background,
      error: t.expense,
      onPrimary: t.onAccent,
      onSurface: t.textPrimary,
      onSurfaceVariant: t.textSecondary,
      outline: t.border,
      primary: t.accent,
      surface: t.surface,
      surfaceVariant: t.surfaceRaised,
    });
    expect(Object.values(colors.elevation)).toEqual(Array(6).fill(t.surface));
  },
);
