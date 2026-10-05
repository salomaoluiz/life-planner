import { render, screen } from "@tests";

import Home from "./";

jest.mock("@screens/Home/containers", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return { StockDashboard: () => <MockView testID="stockDashboard" /> };
});

jest.mock("@screens/Navigation/containers/ProfileButton", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: () => <MockView testID="profile-button" />,
  };
});

it("SHOULD render the stock dashboard", () => {
  render(<Home />);

  expect(screen.getByTestId("stockDashboard")).toBeOnTheScreen();
});

it("SHOULD render the header with the profile button", () => {
  render(<Home />);

  expect(screen.getByTestId("home-header")).toBeOnTheScreen();
  expect(screen.getByTestId("profile-button")).toBeOnTheScreen();
});
