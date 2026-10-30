import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, presentation: "transparentModal" }}
    >
      <Stack.Screen name={"[...modal]"} />
    </Stack>
  );
}
