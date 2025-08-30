import React from "react";
import { render } from "@tests";

import StockDashboard from "../";

// Mock react-navigation
jest.mock("@react-navigation/native", () => ({
  useIsFocused: jest.fn(() => true),
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
    getStockDashboardUseCase: {
      uniqueName: "getStockDashboard",
      execute: jest.fn(),
    },
  },
}));

// Mock fetcher
const mockUseQuery = jest.fn();
jest.mock("@infrastructure/fetcher", () => ({
  useQuery: mockUseQuery,
}));

// Mock components
jest.mock("@components", () => ({
  Spacer: ({ testID }: any) => <MockedComponent testID={testID ?? "spacer"} />,
  Text: {
    Title: ({ testID, value }: any) => (
      <MockedComponent testID={testID ?? "dashboard-title"} value={value} />
    ),
    Body: ({ testID, value }: any) => {
      // Assign testID based on content
      let finalTestID = testID;
      if (!finalTestID) {
        if (value?.includes("Total items:")) {
          finalTestID = "total-items";
        } else if (value?.includes("Expired items:")) {
          finalTestID = "expired-items";
        }
      }
      return <MockedComponent testID={finalTestID} value={value} />;
    },
  },
}));

// Mock Skeleton
jest.mock("@components/Skeleton", () => ({
  Box: ({ testID }: any) => <MockedComponent testID={testID ?? "skeleton-box"} />,
}));

// Mock StockDashboardViewModel
jest.mock("@screens/Home/models/StockDashboardViewModel", () => {
  return jest.fn().mockImplementation(({ stockDashboardDTO }) => ({
    itemQuantity: stockDashboardDTO.itemQuantity || 10,
    expiredItems: stockDashboardDTO.expiredItems || 2,
  }));
});

// Mock styles
jest.mock("../styles", () => () => ({
  container: {},
  containerLoading: {},
  titleContainer: {},
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

const defaultData = {
  itemQuantity: 10,
  expiredItems: 2,
};

function setup() {
  mockUseQuery.mockReturnValue({
    data: defaultData,
    isFetching: false,
    refetch: jest.fn(),
  });
  
  render(<StockDashboard />);
}

function setupLoading() {
  mockUseQuery.mockReturnValue({
    data: null,
    isFetching: true,
    refetch: jest.fn(),
  });
  
  render(<StockDashboard />);
}

export { defaultData, setup, setupLoading };