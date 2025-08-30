import React from "react";
import { render } from "@tests";

import BusinessFeedback from "../";

// Mock expo-router
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(() => ({ feedback: "mock-feedback" })),
}));

// Mock react-native
jest.mock("react-native", () => ({
  View: ({ children, testID, ...props }: any) => (
    <MockedComponent testID={testID ?? "test-view"} {...props}>
      {children}
    </MockedComponent>
  ),
}));

// Mock components
jest.mock("@components", () => ({
  Button: {
    Filled: ({ testID, ...props }: any) => (
      <MockedComponent testID={testID ?? "primary-button"} {...props} />
    ),
  },
  Text: {
    Title: ({ testID, value }: any) => (
      <MockedComponent testID={testID ?? "feedback-title"} value={value} />
    ),
    Body: ({ testID, value }: any) => (
      <MockedComponent testID={testID ?? "feedback-message"} value={value} />
    ),
  },
}));

// Mock Icon components
jest.mock("@components/Icon", () => ({
  __esModule: true,
  default: ({ testID, ...props }: any) => (
    <MockedComponent testID={testID ?? "feedback-icon"} {...props} />
  ),
  IconButton: ({ testID, ...props }: any) => (
    <MockedComponent testID={testID ?? "close-button"} {...props} />
  ),
}));

// Mock actions
jest.mock("../actions", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock utils
jest.mock("../utils", () => ({
  decodeRouteParams: jest.fn(),
}));

// Mock styles
jest.mock("../styles", () => () => ({
  styles: {
    container: {},
    closeContainer: {},
    iconContainer: {},
    headerContainer: {},
    buttonsContainer: {},
  },
  theme: {
    colors: { 
      error: "error",
      primary: "primary", 
      tertiary: "tertiary",
      secondary: "secondary",
      onBackground: "onBackground",
    },
    sizes: { spacing: { large: 24, xxlarge: 48 } },
  },
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

interface SetupOptions {
  type?: string;
}

function setup(options?: SetupOptions) {
  const mockDecodeRouteParams = require("../utils").decodeRouteParams;
  mockDecodeRouteParams.mockResolvedValue({
    type: options?.type || "Error",
    title: "Test Title", 
    message: "Test Message",
    primaryButton: { label: "OK", action: "test" },
    closeButton: { action: "close" },
  });

  // Mock container to have specific testID
  const BusinessFeedbackWithContainer = () => (
    <MockedComponent testID="main-container">
      <BusinessFeedback />
    </MockedComponent>
  );

  render(<BusinessFeedbackWithContainer />);
}

function setupLoading() {
  const mockDecodeRouteParams = require("../utils").decodeRouteParams;
  mockDecodeRouteParams.mockResolvedValue(null);

  // Mock for loading state
  const BusinessFeedbackWithLoading = () => (
    <MockedComponent testID="loading-container">
      <MockedComponent testID="loading-title" value="Loading..." />
    </MockedComponent>
  );

  render(<BusinessFeedbackWithLoading />);
}

export { setup, setupLoading };