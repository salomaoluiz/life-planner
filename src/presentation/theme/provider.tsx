import React, { createContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import { useProviderLoader } from "@providers/loader";

import { colors, getScaledSizes } from "./constants";
import { PaperThemeProvider } from "./paper";
import { ThemeProp } from "./types";

interface Props {
  children: React.ReactNode;
}

interface ThemeContextData {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export const lightTheme: ThemeProp = {
  colors: colors.light,
  dark: false,
  sizes: getScaledSizes(),
};

const darkTheme: ThemeProp = {
  colors: colors.dark,
  dark: true,
  sizes: getScaledSizes(),
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
