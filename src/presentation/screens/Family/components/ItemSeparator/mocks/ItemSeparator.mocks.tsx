import React from "react";
import { render } from "@tests";

import ItemSeparator from "../";

// Mock react-native
jest.mock("react-native", () => ({
  View: ({ testID, ...props }: any) => (
    <MockedComponent testID={testID ?? "item-separator"} {...props} />
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
  render(<ItemSeparator />);
}

export { setup };