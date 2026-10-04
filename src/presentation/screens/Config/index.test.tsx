import { hasText, render, screen } from "@tests";

import Config from "./";

jest.mock("./containers", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    DarkMode: () => <MockView testID="darkMode" />,
    Language: () => <MockView testID="language" />,
    Logout: () => <MockView testID="logout" />,
  };
});

it("SHOULD render the title and every config container", () => {
  render(<Config />);

  expect(hasText("configurations.title")).toBe(true);
  expect(screen.getByTestId("darkMode")).toBeOnTheScreen();
  expect(screen.getByTestId("language")).toBeOnTheScreen();
  expect(screen.getByTestId("logout")).toBeOnTheScreen();
});
