import { Drawer } from "expo-router/drawer";

import Icon from "@components/Icon";

export default function DrawerNavigator() {
  return (
    <Drawer>
      <Drawer.Screen
        name={"index"}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon color={color} name={"format-list-bulleted"} size={size} />
          ),
          title: "Transactions",
        }}
      />
    </Drawer>
  );
}
