import { router } from "expo-router";

import { fireEvent, render, screen } from "@tests";

import ProfileButton from "./";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD expose the profile and settings label for screen readers", () => {
  render(<ProfileButton />);

  expect(
    screen.getByLabelText("navigation.profileAndSettings"),
  ).toBeOnTheScreen();
});

it("SHOULD open /settings WHEN pressed", () => {
  render(<ProfileButton />);

  fireEvent.press(screen.getByTestId("home-profile-button"));

  expect(router.push).toHaveBeenCalledWith("/settings");
});

it("SHOULD render the initial of the name WHEN a name is given", () => {
  render(<ProfileButton name="Ana" />);

  expect(screen.getByText("A")).toBeOnTheScreen();
});
