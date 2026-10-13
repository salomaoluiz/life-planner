import { hasText, render, screen } from "@tests";

import Config from "./";

jest.mock("./containers", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    Language: () => <MockView testID="language" />,
    Logout: () => <MockView testID="logout" />,
    Theme: () => <MockView testID="theme" />,
  };
});

it("SHOULD render the title and every config container", () => {
  render(<Config />);

  expect(hasText("configurations.title")).toBe(true);
  expect(screen.getByTestId("theme")).toBeOnTheScreen();
  expect(screen.getByTestId("language")).toBeOnTheScreen();
  expect(screen.getByTestId("logout")).toBeOnTheScreen();
});
