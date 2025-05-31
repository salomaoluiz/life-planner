import React from "react";
import { MenuItemProps, MenuProps } from "react-native-paper";

jest.mock("react-native-paper", () => {
  const { Text, View } = jest.requireActual("react-native");

  // region Menu Mock
  const Menu = jest.fn((props: MenuProps) => {
    return <View {...props} />;
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  Menu.Item = jest.fn((itemProps: MenuItemProps) => {
    return <View {...itemProps} />;
  });
  // endregion Menu Mock

  return {
    Button: View,
    Icon: View,
    Menu,
    PaperProvider: ({ children, ...props }: { children: React.ReactNode }) => (
      <View {...props}>{children}</View>
    ),
    Switch: View,
    Text: (props: { children: React.ReactNode }) => (
      <Text {...props}>{props.children}</Text>
    ),
    TextInput: View,
    useTheme: jest.fn(),
  };
});
