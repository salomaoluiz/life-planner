import { useContext } from "react";

import { usePaperTheme } from "./paper";
import { ThemeContext } from "./provider";
import { ThemeProp } from "./types";

export function useTheme() {
  const { isDark, setThemeMode, themeMode } = useContext(ThemeContext);

  const theme = usePaperTheme() as ThemeProp;

  return { isDark, setThemeMode, theme, themeMode };
}
