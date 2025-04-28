import { Redirect, Tabs } from "expo-router";

import { useUser } from "@application/providers/user";
import Icon from "@components/Icon";
import { useTranslation } from "@presentation/i18n";

export default function TabNavigator() {
  const { logged } = useUser();
  const { t } = useTranslation();

  if (!logged) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs>
      <Tabs.Screen
        name={"index/index"}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon color={color} name={"view-dashboard"} size={size} />
          ),
          title: t("dashboard.routeTitle"),
        }}
      />
      <Tabs.Screen
        name={"stock/index"}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon color={color} name={"wardrobe"} size={size} />
          ),
          title: t("stock.list.headerTitle"),
        }}
      />
      <Tabs.Screen
        name={"family/index"}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon color={color} name={"human-male-female-child"} size={size} />
          ),
          title: t("family.routeTitle"),
        }}
      />
      <Tabs.Screen
        name={"financial"}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon color={color} name={"cash-register"} size={size} />
          ),
          title: t("financial.routeTitle"),
        }}
      />
      <Tabs.Screen
        name={"config/index"}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon color={color} name={"cog"} size={size} />
          ),
          title: t("configurations.routeTitle"),
        }}
      />
    </Tabs>
  );
}
