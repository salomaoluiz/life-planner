import React from "react";
import { render } from "@tests";

import DarkMode from "../";

// Mock components
jest.mock("@components", () => ({
  Spacer: ({ testID }: any) => <MockedComponent testID={testID ?? "spacer"} />,
  Switch: ({ testID }: any) => <MockedComponent testID={testID ?? "switch"} />,
  Text: {
    Title: ({ testID }: any) => <MockedComponent testID={testID ?? "text-title"} />,
  },
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

function setup() {
  render(<DarkMode />);
}

export { setup };