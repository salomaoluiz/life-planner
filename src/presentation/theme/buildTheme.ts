import {
  breakpoints,
  colors,
  getScaledSizes,
  getTypography,
} from "./constants";
import { ThemeProp } from "./types";

export function buildTheme(isDark: boolean, fontsLoaded: boolean): ThemeProp {
  return {
    breakpoints,
    colors: isDark ? colors.dark : colors.light,
    dark: isDark,
    fontsLoaded,
    sizes: getScaledSizes(),
    typography: getTypography(fontsLoaded),
  };
}
