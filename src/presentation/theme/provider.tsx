import React, { createContext, useEffect, useMemo, useState } from "react";
import { StatusBar, useColorScheme } from "react-native";

import { useCases } from "@application/useCases";
import { SaveUserConfigsUseCaseParams } from "@application/useCases/cases/configs/saveUserConfigsUseCase";
import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { useAppFonts } from "@infrastructure/fonts";
import { captureMessage } from "@infrastructure/monitoring";
import { useProviderLoader } from "@providers/loader";

import { buildTheme } from "./buildTheme";
import { buildPaperTheme, PaperThemeProvider } from "./paper";
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

export const lightTheme: ThemeProp = buildTheme(false, false);
export const darkTheme: ThemeProp = buildTheme(true, false);

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
  const { failed, ready } = useAppFonts();
  const fontsLoaded = ready && !failed;
  const systemScheme = useColorScheme();

  const [themeMode, setThemeModeState] = useState<ThemeMode>(ThemeMode.SYSTEM);

  const isDark = resolveIsDark(themeMode, systemScheme);
  const theme = useMemo(
    () => buildTheme(isDark, fontsLoaded),
    [isDark, fontsLoaded],
  );
  const paperTheme = useMemo(() => buildPaperTheme(theme), [theme]);

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");
    StatusBar.setBackgroundColor(theme.colors.background);
  }, [isDark]);

  const queryDone = status !== "pending";

  useEffect(() => {
    setIsLoading(!(queryDone && ready), "theme");
  }, [queryDone, ready]);

  useEffect(() => {
    switch (status) {
      case "error":
      case "pending":
        break;
      case "success":
        setThemeModeState(data!.themeMode);
        break;
      default:
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
      <PaperThemeProvider theme={paperTheme}>{children}</PaperThemeProvider>
    </ThemeContext.Provider>
  );
}
