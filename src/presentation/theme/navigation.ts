import {
  DefaultTheme,
  Theme as NavigationTheme,
} from "@react-navigation/native";
import { useMemo } from "react";

import { useTheme } from "./hooks";
import { ThemeProp } from "./types";

export function buildNavigationTheme(theme: ThemeProp): NavigationTheme {
  return {
    colors: {
      background: theme.colors.background,
      border: theme.colors.border,
      card: theme.colors.surface,
      notification: theme.colors.expense,
      primary: theme.colors.accent,
      text: theme.colors.textPrimary,
    },
    dark: theme.dark,
    fonts: DefaultTheme.fonts,
  };
}

export function useNavigationTheme(): NavigationTheme {
  const { theme } = useTheme();

  return useMemo(() => buildNavigationTheme(theme), [theme]);
}
