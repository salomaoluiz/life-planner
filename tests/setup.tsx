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
  const { MD3DarkTheme, MD3LightTheme } = jest.requireActual(
    "react-native-paper/src/styles/themes",
  );
  const FAB = Object.assign(View, {
    Group: View,
  });
  function Banner({
    children,
    visible,
  }: {
    children?: React.ReactNode;
    visible: boolean;
  }) {
    return visible ? <View>{children}</View> : null;
  }
  function renderSlot(
    slot: ((props: object) => React.ReactNode) | undefined,
    props: object = {},
  ) {
    return slot ? slot(props) : null;
  }
  const List = {
    Accordion: ({
      children,
      expanded,
      left,
      right,
      title,
      ...props
    }: {
      children?: React.ReactNode;
      expanded?: boolean;
      left?: (props: object) => React.ReactNode;
      right?: (props: object) => React.ReactNode;
      title?: React.ReactNode;
    }) => (
      <View {...props}>
        {renderSlot(left)}
        {title}
        {renderSlot(right, { isExpanded: expanded })}
        {expanded ? children : null}
      </View>
    ),
    Item: ({
      left,
      right,
      title,
      ...props
    }: {
      left?: (props: object) => React.ReactNode;
      right?: (props: object) => React.ReactNode;
      title?: React.ComponentType | React.ReactNode;
    }) => {
      const Title = title as React.ComponentType;
      return (
        <View {...props}>
          {renderSlot(left)}
          {typeof title === "function" ? <Title /> : title}
          {renderSlot(right)}
        </View>
      );
    },
  };
  return {
    Avatar: {
      Icon: View,
      Image: View,
      Text: View,
    },
    Banner,
    Button: View,
    Card: View,
    FAB,
    HelperText: View,
    Icon: View,
    IconButton: View,
    List,
    MD3DarkTheme,
    MD3LightTheme,
    Menu: ({
      anchor,
      children,
      ...props
    }: {
      anchor?: React.ReactNode;
      children?: React.ReactNode;
    }) => (
      <View {...props}>
        {anchor}
        {children}
      </View>
    ),
    PaperProvider: ({ children, ...props }: { children: React.ReactNode }) => (
      <View {...props}>{children}</View>
    ),
    Switch: View,
    Text: View,
    TextInput: Object.assign(
      jest
        .requireActual("react")
        .forwardRef((props: object, ref: React.Ref<unknown>) => (
          <View ref={ref as never} {...props} />
        )),
      { Icon: View },
    ),
    useTheme: jest.fn(),
  };
});

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
  useBreakpoint: jest.fn().mockReturnValue("compact"),
  useTheme: jest.fn().mockReturnValue({
    isDark: false,
    setThemeMode: jest.fn(),
    theme: jest.requireActual("@presentation/theme/provider").lightTheme,
    themeMode: jest.requireActual("@domain/entities/configs/ConfigsEntity")
      .ThemeMode.SYSTEM,
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
