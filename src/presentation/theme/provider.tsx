import React, { createContext, useEffect, useMemo, useState } from "react";
import { StatusBar, useColorScheme } from "react-native";

import { useCases } from "@application/useCases";
import { SaveUserConfigsUseCaseParams } from "@application/useCases/cases/configs/saveUserConfigsUseCase";
import { useMutation, useQuery } from "@infrastructure/fetcher";
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
  const { mutate } = useMutation<SaveUserConfigsUseCaseParams, void>({
    cacheKey: [],
    fetch: useCases.saveUserConfigsUseCase.execute,
  });
  const { data, status } = useQuery({
    cacheKey: [],
    fetch: useCases.getUserConfigsUseCase.execute,
  });

  const colorSchema = useColorScheme();

  const [isDark, setIsDark] = useState(colorSchema === "dark");

  const [theme, setTheme] = useState<ThemeProp>(
    isDark ? darkTheme : lightTheme,
  );

  useEffect(() => {
    setTheme(isDark ? darkTheme : lightTheme);
    StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");
    StatusBar.setBackgroundColor(
      isDark ? darkTheme.colors.background : lightTheme.colors.background,
    );
  }, [isDark]);

  useEffect(() => {
    if (data && status === "success") {
      setIsDark(data.darkMode);
      StatusBar.setBarStyle(data.darkMode ? "light-content" : "dark-content");
      setIsLoading(false, "theme");
    } else {
      setIsDark(colorSchema === "dark");
    }
  }, [status]);

  function setDarkMode(isDark: boolean) {
    mutate({ darkMode: isDark });
    setIsDark(isDark);
  }

  const providerValue = useMemo(
    () => ({ isDark, setIsDark: setDarkMode }),
    [isDark],
  );

  return (
    <ThemeContext.Provider value={providerValue}>
      <PaperThemeProvider theme={theme}>{children}</PaperThemeProvider>
    </ThemeContext.Provider>
  );
}
