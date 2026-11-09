import { Stack } from "expo-router";

// The list and the asset detail are two screens of one tab (spec 102).
function InvestmentLayout() {
  return (
    <Stack screenOptions={{ animation: "none", headerShown: false }}>
      <Stack.Screen name={"index"} />
      <Stack.Screen name={"[id]"} />
    </Stack>
  );
}

export default InvestmentLayout;
