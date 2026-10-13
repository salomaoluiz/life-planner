import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { LogBox } from "react-native";

import GlobalProviders from "@/src/providers";
import { ErrorBoundary, MonitoringWrapper } from "@infrastructure/monitoring";
import { useInitializeRouter } from "@navigation";
import { useNavigationTheme } from "@presentation/theme";
import {
  GenericErrorBoundary,
  GlobalBoundaryFallback,
} from "@screens/Feedback";

function RenderStack() {
  const { isLoading } = useInitializeRouter();
  const navigationTheme = useNavigationTheme();
  if (isLoading) return null;
  LogBox.ignoreAllLogs(true);
  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </NavigationThemeProvider>
  );
}

function RootLayout() {
  return (
    <ErrorBoundary FallbackComponent={GlobalBoundaryFallback}>
      <GlobalProviders>
        <ErrorBoundary FallbackComponent={GenericErrorBoundary}>
          <RenderStack />
        </ErrorBoundary>
      </GlobalProviders>
    </ErrorBoundary>
  );
}

export default MonitoringWrapper(RootLayout);
