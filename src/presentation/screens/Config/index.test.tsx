import { StyleSheet } from "react-native";

import { hasText, render, screen } from "@tests";

import Config from "./";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(() => ({ bottom: 0, left: 0, right: 0, top: 0 })),
}));
jest.mock("./containers", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    Language: () => <MockView testID="language" />,
    Logout: () => <MockView testID="logout" />,
    Theme: () => <MockView testID="theme" />,
  };
});

it("SHOULD render the title and every config container inside one full-width card", () => {
  render(<Config />);

  expect(hasText("configurations.routeTitle")).toBe(true);
  expect(screen.getByTestId("settings-card")).toBeOnTheScreen();
  expect(screen.getByTestId("theme")).toBeOnTheScreen();
  expect(screen.getByTestId("language")).toBeOnTheScreen();
  expect(screen.getByTestId("logout")).toBeOnTheScreen();
  expect(
    StyleSheet.flatten(screen.getByTestId("settings-card").props.style).width,
  ).toBeUndefined();
});
