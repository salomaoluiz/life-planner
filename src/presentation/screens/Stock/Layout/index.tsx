import { Stack } from "expo-router";

// Items, the lists and the catalog are screens of one tab (spec 118 FR 25).
function StockLayout() {
  return (
    <Stack screenOptions={{ animation: "none", headerShown: false }}>
      <Stack.Screen name={"index"} />
      <Stack.Screen name={"lists/index"} />
      <Stack.Screen name={"list/[id]"} />
      <Stack.Screen name={"purchases/[id]"} />
      <Stack.Screen name={"purchase-close/[id]"} />
      <Stack.Screen name={"catalog"} />
      <Stack.Screen name={"locations/[id]"} />
    </Stack>
  );
}

export default StockLayout;
