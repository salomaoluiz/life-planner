import { useContext } from "react";
import { usePaperTheme } from "./paper";
import { ThemeContext } from "./provider";
import { ThemeProp } from "./types";

export function useTheme() {
  const { isDark, setIsDark } = useContext(ThemeContext);

  const theme = usePaperTheme() as ThemeProp;

  return { isDark, setIsDark, theme };
}
