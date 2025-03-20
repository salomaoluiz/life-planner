import { Redirect, Stack } from "expo-router";

import { useUser } from "@application/providers/user";

export default function AppLayout() {
  const { logged } = useUser();

  if (!logged) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(drawer)" />
      <Stack.Screen
        name="family/add_new_family_member"
        options={{
          presentation: "transparentModal",
        }}
      />
      <Stack.Screen
        name="family/add_new_family"
        options={{
          presentation: "transparentModal",
        }}
      />
      <Stack.Screen name={"business_feedback"} />
    </Stack>
  );
}
