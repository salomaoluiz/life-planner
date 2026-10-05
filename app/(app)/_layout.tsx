import { Redirect, Stack } from "expo-router";

import { useUser } from "@application/providers/user";
import { useTranslation } from "@presentation/i18n";

export default function StackNavigator() {
  const { logged } = useUser();
  const { t } = useTranslation();

  if (!logged) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name={"(tabs)"} options={{ headerShown: false }} />
      <Stack.Screen
        name={"settings"}
        options={{ headerShown: true, title: t("configurations.routeTitle") }}
      />
      <Stack.Screen
        name={"(modals)"}
        options={{ headerShown: false, presentation: "transparentModal" }}
      />
    </Stack>
  );
}
