import React, { createContext, useEffect, useMemo, useState } from "react";
import { StatusBar, useColorScheme } from "react-native";

import { useCases } from "@application/useCases";
import { SaveUserConfigsUseCaseParams } from "@application/useCases/cases/configs/saveUserConfigsUseCase";
import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { captureMessage } from "@infrastructure/monitoring";
import { useProviderLoader } from "@providers/loader";

import { colors, getScaledSizes } from "./constants";
import { PaperThemeProvider } from "./paper";
import { resolveIsDark } from "./resolveThemeMode";
import { ThemeProp } from "./types";

interface Props {
  children: React.ReactNode;
}

interface ThemeContextData {
  isDark: boolean;
  setThemeMode: (themeMode: ThemeMode) => void;
  themeMode: ThemeMode;
}

export const lightTheme: ThemeProp = {
  colors: colors.light,
  dark: false,
  sizes: getScaledSizes(),
};

export const darkTheme: ThemeProp = {
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
  const systemScheme = useColorScheme();

  const [themeMode, setThemeModeState] = useState<ThemeMode>(ThemeMode.SYSTEM);

  const isDark = resolveIsDark(themeMode, systemScheme);
  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");
    StatusBar.setBackgroundColor(theme.colors.background);
  }, [isDark]);

  useEffect(() => {
    switch (status) {
      case "error":
        setIsLoading(false, "theme");
        break;
      case "pending":
        setIsLoading(true, "theme");
        break;
      case "success":
        setThemeModeState(data!.themeMode);
        setIsLoading(false, "theme");
        break;
      default:
        setIsLoading(false, "theme");
        captureMessage("Invalid useQuery status on ThemeProvider", {
          action: "Using the system theme",
          status,
        });
        break;
    }
  }, [status]);

  function setThemeMode(newMode: ThemeMode) {
    mutate({ themeMode: newMode });
    setThemeModeState(newMode);
  }

  const providerValue = useMemo(
    () => ({ isDark, setThemeMode, themeMode }),
    [isDark, themeMode],
  );

  return (
    <ThemeContext.Provider value={providerValue}>
      <PaperThemeProvider theme={theme}>{children}</PaperThemeProvider>
    </ThemeContext.Provider>
  );
}
