import { Drawer } from "expo-router/drawer";

export default function AppLayout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Drawer.Screen
        name="family"
        options={{
          title: "Family",
        }}
      />
      <Drawer.Screen
        name="stock"
        options={{
          title: "Stock",
        }}
      />
      <Drawer.Screen
        name="financial"
        options={{
          title: "Financial",
        }}
      />
    </Drawer>
  );
}
