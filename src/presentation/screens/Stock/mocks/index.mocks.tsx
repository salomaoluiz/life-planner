import React from "react";
import { render } from "@tests";

import Stock from "../";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock @react-navigation/native
jest.mock("@react-navigation/native", () => ({
  useIsFocused: jest.fn(() => true),
}));

// Mock @shopify/flash-list
jest.mock("@shopify/flash-list", () => ({
  FlashList: ({ testID, ...props }: any) => (
    <MockedComponent testID={testID ?? "flash-list"} {...props} />
  ),
}));

// Mock react-native
jest.mock("react-native", () => ({
  View: ({ children, testID, ...props }: any) => (
    <MockedComponent testID={testID ?? "test-view"} {...props}>
      {children}
    </MockedComponent>
  ),
}));

// Mock application use cases
jest.mock("@application/useCases", () => ({
  useCases: {
    getStockItemsUseCase: { uniqueName: "getStockItems" },
    getOwnersUseCase: { execute: jest.fn() },
  },
}));

// Mock fetcher
jest.mock("@infrastructure/fetcher", () => {
  const mockUseQuery = jest.fn();
  return {
    useQuery: mockUseQuery,
  };
});

// Mock components
jest.mock("@components", () => ({
  Fab: ({ testID, ...props }: any) => (
    <MockedComponent testID={testID ?? "fab"} {...props} />
  ),
  Text: {
    Title: ({ testID, value }: any) => (
      <MockedComponent testID={testID ?? "loading-title"} value={value} />
    ),
  },
}));

// Mock StockCard
jest.mock("@screens/Stock/containers/StockCard", () => ({ testID }: any) => (
  <MockedComponent testID={testID ?? "stock-card"} />
));

// Mock utils
jest.mock("@utils/platform", () => ({
  isWeb: jest.fn(() => false),
}));

// Mock styles
jest.mock("../styles", () => () => ({
  container: {},
  fabContainer: {},
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

function setup() {
  const { useQuery } = require("@infrastructure/fetcher");
  
  useQuery.mockReturnValue({
    data: [{ id: "1", name: "Test Stock Item" }],
    isFetching: false,
    refetch: jest.fn(),
  });

  // Use container wrapper
  const StockWithContainer = () => (
    <MockedComponent testID="stock-container">
      <Stock />
    </MockedComponent>
  );

  render(<StockWithContainer />);
}

function setupLoading() {
  const { useQuery } = require("@infrastructure/fetcher");
  
  useQuery.mockReturnValue({
    data: null,
    isFetching: true,
    refetch: jest.fn(),
  });

  render(<Stock />);
}

export { setup, setupLoading };