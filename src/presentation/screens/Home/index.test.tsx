import { render, screen } from "@tests";

import Home from "./";

jest.mock("@screens/Home/containers", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return { StockDashboard: () => <MockView testID="stockDashboard" /> };
});

it("SHOULD render the stock dashboard", () => {
  render(<Home />);

  expect(screen.getByTestId("stockDashboard")).toBeOnTheScreen();
});
