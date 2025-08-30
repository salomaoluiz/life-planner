import React from "react";
import { render } from "@tests";

import Logout from "../";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock application use cases
jest.mock("@application/useCases", () => ({
  useCases: {
    logoutUseCase: {
      execute: jest.fn(),
    },
  },
}));

// Mock fetcher
jest.mock("@infrastructure/fetcher", () => ({
  useMutation: jest.fn(() => ({
    isFetching: false,
    mutate: jest.fn(),
    status: "idle",
  })),
}));

// Mock theme
jest.mock("@presentation/theme", () => ({
  useTheme: jest.fn().mockReturnValue({
    theme: {
      colors: {
        error: "error",
      },
    },
  }),
}));
// Mock theme
jest.mock("@presentation/theme", () => ({
  useTheme: jest.fn().mockReturnValue({
    theme: {
      colors: {
        error: "error",
      },
    },
  }),
}));

// Mock components
jest.mock("@components", () => ({
  Button: {
    Text: ({ testID, icon, customStyles, ...props }: any) => (
      <MockedComponent
        testID={testID ?? "button-text"}
        icon={icon}
        customStyles={customStyles}
        {...props}
      />
    ),
  },
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

function setup() {
  render(<Logout />);
}

export { setup };