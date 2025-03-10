import React from "react";

import { load } from "@expo/env";

load(process.cwd(), { silent: true });

jest.mock("react-native-paper", () => {
  const View = jest.requireActual("react-native").View;
  return {
    TextInput: View,
    Button: View,
    Switch: View,
    Text: View,
    Icon: View,
    useTheme: jest.fn(),
    PaperProvider: ({ children, ...props }: { children: React.ReactNode }) => (
      <View {...props}>{children}</View>
    ),
  };
});

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    hasPlayServices: jest.fn(),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      signInWithIdToken: jest.fn(),
      signInWithOAuth: jest.fn(),
      setSession: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
  }),
}));

jest.mock("@tanstack/react-query");

jest.mock("@sentry/react-native");

jest.mock("@presentation/theme", () => ({
  useTheme: jest.fn().mockReturnValue({
    theme: jest.requireActual("@presentation/theme/provider").lightTheme,
    isDark: false,
    setIsDark: jest.fn(),
  }),
}));
