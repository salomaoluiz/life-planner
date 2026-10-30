import { Redirect, Stack } from "expo-router";
import { View } from "react-native";

import { useUser } from "@application/providers/user";
import { UpdateBanner } from "@screens";

export default function StackNavigator() {
  const { logged } = useUser();

  if (!logged) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <UpdateBanner />
      <Stack>
        <Stack.Screen name={"(tabs)"} options={{ headerShown: false }} />
        <Stack.Screen
          name={"(modals)"}
          options={{ headerShown: false, presentation: "transparentModal" }}
        />
      </Stack>
    </View>
  );
}
