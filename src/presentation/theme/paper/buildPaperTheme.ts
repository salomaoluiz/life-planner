import { MD3DarkTheme, MD3LightTheme, MD3Theme } from "react-native-paper";

import { ThemeProp } from "../types";

export type PaperAppTheme = MD3Theme &
  Omit<ThemeProp, "colors" | "dark"> & {
    colors: MD3Theme["colors"] & ThemeProp["colors"];
  };

export function buildPaperTheme(theme: ThemeProp): PaperAppTheme {
  const base = theme.dark ? MD3DarkTheme : MD3LightTheme;
  const t = theme.colors;

  return {
    ...base,
    breakpoints: theme.breakpoints,
    colors: {
      ...base.colors,
      backdrop: t.scrim,
      elevation: {
        level0: t.surface,
        level1: t.surface,
        level2: t.surface,
        level3: t.surface,
        level4: t.surface,
        level5: t.surface,
      },
      error: t.expense,
      errorContainer: t.expenseSoft,
      inverseOnSurface: t.background,
      inversePrimary: t.accent,
      inverseSurface: t.textPrimary,
      onBackground: t.textPrimary,
      onError: t.surface,
      onErrorContainer: t.expense,
      onPrimary: t.onAccent,
      onPrimaryContainer: t.accentText,
      onSecondary: t.onAccent,
      onSecondaryContainer: t.accentText,
      onSurface: t.textPrimary,
      onSurfaceDisabled: t.textSecondary,
      onSurfaceVariant: t.textSecondary,
      onTertiary: t.onAccent,
      onTertiaryContainer: t.income,
      outline: t.border,
      outlineVariant: t.border,
      primary: t.accent,
      primaryContainer: t.accentSoft,
      secondary: t.accent,
      secondaryContainer: t.accentSoft,
      shadow: t.scrim,
      surfaceDisabled: t.border,
      surfaceVariant: t.surfaceRaised,
      tertiary: t.income,
      tertiaryContainer: t.incomeSoft,
      ...t, // app tokens last: background, scrim and surface stay identical
    },
    dark: theme.dark,
    fontsLoaded: theme.fontsLoaded,
    sizes: theme.sizes,
    typography: theme.typography,
  };
}
