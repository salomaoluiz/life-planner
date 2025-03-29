import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, presentation: "transparentModal" }}
    >
      <Stack.Screen name="family/add_new_family_member" />
      <Stack.Screen name="family/add_new_family" />
      <Stack.Screen name={"business_feedback"} />
      <Stack.Screen name={"stock/add_new_stock_item"} />
      <Stack.Screen name={"financial/transaction/add_new_transaction"} />
      <Stack.Screen name={"invite"} />
    </Stack>
  );
}
