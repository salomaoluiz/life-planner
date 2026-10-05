import { Drawer } from "expo-router/drawer";

import Icon from "@components/Icon";
import { useTheme } from "@presentation/theme";

export default function DrawerNavigator() {
  const { theme } = useTheme();

  return (
    <Drawer
      screenOptions={{
        drawerActiveBackgroundColor: theme.colors.accentSoft,
        drawerActiveTintColor: theme.colors.accentText,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerStyle: { backgroundColor: theme.colors.surface },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Drawer.Screen
        name={"index"}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon color={color} name={"format-list-bulleted"} size={size} />
          ),
          title: "Transactions",
        }}
      />
      <Drawer.Screen
        name={"categories"}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon color={color} name={"folder"} size={size} />
          ),
          title: "Categories",
        }}
      />
      <Drawer.Screen
        name={"accounts"}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon color={color} name={"bank"} size={size} />
          ),
          title: "Accounts",
        }}
      />
    </Drawer>
  );
}
