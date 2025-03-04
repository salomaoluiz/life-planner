import React from "react";

// Mock Envs

process.env = {
  NODE_ENV: "test",
  EXPO_PUBLIC_SUPABASE_URL: "EXPO_PUBLIC_SUPABASE_URL",
  EXPO_PUBLIC_SUPABASE_ANON_KEY: "EXPO_PUBLIC_SUPABASE_ANON_KEY",
};

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

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    hasPlayServices: jest.fn(),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => jest.fn());

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
