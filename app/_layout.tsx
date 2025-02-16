import { Stack } from "expo-router";
import GlobalProviders from "@/src/providers";
import { useProviderLoader } from "@providers/loader";

function RenderStack() {
  const { isLoading } = useProviderLoader();

  if (isLoading) return null;

  return <Stack />;
}

export default function RootLayout() {
  return (
    <GlobalProviders>
      <RenderStack />
    </GlobalProviders>
  );
}
