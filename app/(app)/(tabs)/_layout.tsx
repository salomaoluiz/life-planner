import { Redirect, Tabs } from "expo-router";

import { useUser } from "@application/providers/user";
import { useBreakpoint } from "@presentation/theme";
import { AppTabBar } from "@screens";

export default function TabNavigator() {
  const { logged } = useUser();
  const breakpoint = useBreakpoint();

  if (!logged) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      backBehavior={"initialRoute"}
      screenOptions={{
        headerShown: false,
        tabBarPosition: breakpoint === "expanded" ? "left" : "bottom",
      }}
      tabBar={(props) => <AppTabBar {...props} />}
    >
      <Tabs.Screen name={"index/index"} />
      <Tabs.Screen name={"financial"} />
      <Tabs.Screen name={"stock/index"} />
      <Tabs.Screen name={"family/index"} />
    </Tabs>
  );
}
