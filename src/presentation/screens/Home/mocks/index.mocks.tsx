import React from "react";
import { render } from "@tests";

import Home from "../";

// Mock react-native
jest.mock("react-native", () => ({
  ScrollView: ({ children, testID, ...props }: any) => (
    <MockedComponent testID={testID ?? "scroll-view"} {...props}>
      {children}
    </MockedComponent>
  ),
}));

// Mock StockDashboard container
jest.mock("@screens/Home/containers", () => ({
  StockDashboard: ({ testID }: any) => (
    <MockedComponent testID={testID ?? "stock-dashboard"} />
  ),
}));

// Mock styles
jest.mock("../styles", () => () => ({
  container: {},
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

function setup() {
  render(<Home />);
}

export { setup };