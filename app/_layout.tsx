import { Stack } from "expo-router";
import GlobalProviders from "@/src/providers";
import { monitoring } from "@infrastructure";
import { useInitializeRouter } from "@navigation";

function RenderStack() {
  const { isLoading } = useInitializeRouter();
  if (isLoading) return null;

  return <Stack />;
}

function RootLayout() {
  return (
    <GlobalProviders>
      <RenderStack />
    </GlobalProviders>
  );
}

export default monitoring.MonitoringWrapper(RootLayout);
