import GlobalProviders from "@/src/providers";
import { Stack } from "expo-router";
import { LogBox } from "react-native";

import { ErrorBoundary, MonitoringWrapper } from "@infrastructure/monitoring";
import { useInitializeRouter } from "@navigation";
import {
  GenericErrorBoundary,
  GlobalBoundaryFallback,
} from "@screens/Feedback";

function RenderStack() {
  const { isLoading } = useInitializeRouter();
  if (isLoading) return null;
  LogBox.ignoreAllLogs(true);
  return <Stack screenOptions={{ headerShown: false }} />;
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
