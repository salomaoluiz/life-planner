import { load } from "@expo/env";
import React from "react";

global.console = {
  ...console,
  log: jest.fn(), // Mute console.log
};

jest.useFakeTimers({ now: new Date("2025-01-01T00:00:00Z") });

load(process.cwd(), { silent: true });

jest.mock("react-native-paper", () => {
  const View = jest.requireActual("react-native").View;
  const FAB = Object.assign(View, {
    Group: View,
  });
  return {
    Avatar: {
      Icon: View,
      Image: View,
      Text: View,
    },
    Button: View,
    Card: View,
    FAB,
    HelperText: View,
    Icon: View,
    IconButton: View,
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

jest.mock("react-native-paper-dates", () => {
  const View = jest.requireActual("react-native").View;
  return {
    DatePickerModal: View,
  };
});

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn().mockImplementation(() => {
    return {
      auth: {
        getUser: jest.fn(),
        setSession: jest.fn(),
        signInWithIdToken: jest.fn(),
        signInWithOAuth: jest.fn(),
        signOut: jest.fn(),
      },
      from: jest.fn().mockImplementation(() => {
        return {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          then: jest.fn().mockResolvedValue({ data: null }),
          update: jest.fn().mockReturnThis(),
          upsert: jest.fn().mockReturnThis(),
        };
      }),
    };
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
  useTranslationLocale: jest.fn().mockReturnValue({
    getLocale: jest.fn().mockReturnValue({
      languageTag: "en-US",
    }),
  }),
}));
