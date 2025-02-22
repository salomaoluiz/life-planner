import React from "react";

jest.mock("react-native-paper", () => {
  const View = jest.requireActual("react-native").View;
  return {
    TextInput: View,
    Button: View,
    Switch: View,
    Text: View,
    useTheme: jest.fn(),
    PaperProvider: ({ children, ...props }: { children: React.ReactNode }) => (
      <View {...props}>{children}</View>
    ),
  };
});
