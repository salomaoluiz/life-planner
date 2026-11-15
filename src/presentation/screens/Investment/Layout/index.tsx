import { Stack } from "expo-router";

// One tab, two sections (Overview, Assets) plus the asset detail and the suggestions inbox (spec 102, 110).
function InvestmentLayout() {
  return (
    <Stack screenOptions={{ animation: "none", headerShown: false }}>
      <Stack.Screen name={"index"} />
      <Stack.Screen name={"overview"} />
      <Stack.Screen name={"assets"} />
      <Stack.Screen name={"asset/[id]"} />
      <Stack.Screen name={"suggestions"} />
    </Stack>
  );
}

export default InvestmentLayout;
