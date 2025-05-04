import React, { createContext, useEffect, useMemo, useState } from "react";
import { StatusBar, useColorScheme } from "react-native";

import { useCases } from "@application/useCases";
import { SaveUserConfigsUseCaseParams } from "@application/useCases/cases/configs/saveUserConfigsUseCase";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { captureMessage } from "@infrastructure/monitoring";
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
    cacheKey: [useCases.saveUserConfigsUseCase.uniqueName],
    fetch: useCases.saveUserConfigsUseCase.execute,
  });
  const { data, status } = useQuery({
    cacheKey: [useCases.getUserConfigsUseCase.uniqueName],
    fetch: useCases.getUserConfigsUseCase.execute,
  });
  const colorSchema = useColorScheme();

  const [isDark, setIsDark] = useState(colorSchema === "dark");

  const [theme, setTheme] = useState<ThemeProp>(
    isDark ? darkTheme : lightTheme,
  );

  function updateBarStyle(darkMode: boolean) {
    StatusBar.setHidden(false);
    StatusBar.setBarStyle(darkMode ? "light-content" : "dark-content");
    StatusBar.setBackgroundColor(
      darkMode ? darkTheme.colors.background : lightTheme.colors.background,
    );
  }

  useEffect(() => {
    StatusBar.setHidden(true);
  }, []);

  function updateDefaultTheme() {
    const darkMode = colorSchema === "dark";

    setIsDark(darkMode);
    updateBarStyle(darkMode);
    setTheme(darkMode ? darkTheme : lightTheme);
  }

  function setUserTheme() {
    const darkMode = data!.darkMode;

    setIsDark(darkMode);
    updateBarStyle(darkMode);
    setTheme(darkMode ? darkTheme : lightTheme);
  }

  useEffect(() => {
    switch (status) {
      case "error":
        updateDefaultTheme();
        setIsLoading(false, "theme");
        break;
      case "pending":
        setIsLoading(true, "theme");
        break;
      case "success":
        setIsLoading(false, "theme");
        setUserTheme();
        break;
      default:
        updateDefaultTheme();
        setIsLoading(false, "theme");
        captureMessage("Invalid useQuery status on ThemeProvider", {
          action: "Using the default theme",
          status,
        });
        break;
    }
  }, [status]);

  function setDarkMode(isDark: boolean) {
    mutate({ darkMode: isDark });
    setIsDark(isDark);
    setTheme(isDark ? darkTheme : lightTheme);
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
