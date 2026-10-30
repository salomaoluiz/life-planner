import { Redirect, Stack } from "expo-router";
import { View } from "react-native";

import { useUser } from "@application/providers/user";
import { useScreenBehindModal } from "@navigation";
import { useTheme } from "@presentation/theme";
import { UpdateBanner } from "@screens";

// A fresh load never builds the signed-in stack without the tabs under a modal.
export const unstable_settings = { initialRouteName: "(tabs)" };

export default function StackNavigator() {
  const { logged } = useUser();
  const { ready } = useScreenBehindModal(logged);
  const { theme } = useTheme();

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
      {ready ? null : (
        // Hides the Home flash while the stack is rebuilt behind the modal.
        <View
          style={{
            backgroundColor: theme.colors.background,
            bottom: 0,
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
          }}
        />
      )}
    </View>
  );
}
