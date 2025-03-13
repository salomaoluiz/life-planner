import { load } from "@expo/env";
import React from "react";

global.console = {
  ...console,
  log: jest.fn(), // Mute console.log
};

load(process.cwd(), { silent: true });

jest.mock("react-native-paper", () => {
  const View = jest.requireActual("react-native").View;
  return {
    Button: View,
    Icon: View,
    PaperProvider: ({ children, ...props }: { children: React.ReactNode }) => (
      <View {...props}>{children}</View>
    ),
    Switch: View,
    Text: View,
    TextInput: View,
    useTheme: jest.fn(),
  };
});

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      getUser: jest.fn(),
      setSession: jest.fn(),
      signInWithIdToken: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
    },
  }),
}));

jest.mock("@tanstack/react-query");

jest.mock("@sentry/react-native");

jest.mock("@presentation/theme", () => ({
  useTheme: jest.fn().mockReturnValue({
    isDark: false,
    setIsDark: jest.fn(),
    theme: jest.requireActual("@presentation/theme/provider").lightTheme,
  }),
}));

jest.mock("@presentation/i18n", () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: jest.fn().mockImplementation((key, params) => {
      if (params) {
        return `${key} ${JSON.stringify(params)}`;
      }
      return key;
    }),
  }),
}));
