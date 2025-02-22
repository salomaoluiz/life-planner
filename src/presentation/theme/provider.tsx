import React, { createContext, useEffect, useState } from "react";
import { useProviderLoader } from "@providers/loader";
import { useColorScheme } from "react-native";
import { PaperThemeProvider } from "./paper";
import { colors, getScaledSizes } from "./constants";
import { ThemeProp } from "./types";

interface Props {
  children: React.ReactNode;
}

interface ThemeContextData {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export const lightTheme: ThemeProp = {
  sizes: getScaledSizes(),
  dark: false,
  colors: colors.light,
};

const darkTheme: ThemeProp = {
  sizes: getScaledSizes(),
  dark: true,
  colors: colors.dark,
};

export const ThemeContext = createContext<ThemeContextData>(
  {} as ThemeContextData,
);

export function ThemeProvider({ children }: Props) {
  const { setIsLoading } = useProviderLoader();
  const colorSchema = useColorScheme();

  const [isDark, setIsDark] = useState(colorSchema === "dark");
  const [theme, setTheme] = useState<ThemeProp>(
    isDark ? darkTheme : lightTheme,
  );

  useEffect(() => {
    setTheme(isDark ? darkTheme : lightTheme);
    setIsLoading(false, "theme");
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <PaperThemeProvider theme={theme}>{children}</PaperThemeProvider>
    </ThemeContext.Provider>
  );
}
