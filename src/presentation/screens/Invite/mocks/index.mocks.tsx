import React from "react";
import { render } from "@tests";

import Invite from "../";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({ token: "mock-token" })),
}));

// Mock react-native
jest.mock("react-native", () => ({
  View: ({ children, testID, ...props }: any) => (
    <MockedComponent testID={testID} {...props}>
      {children}
    </MockedComponent>
  ),
}));

// Mock application use cases
jest.mock("@application/useCases", () => ({
  useCases: {
    getFamilyByIdUseCase: { uniqueName: "getFamilyById" },
    getUserUseCase: { execute: jest.fn() },
    joinFamilyMemberUseCase: { 
      uniqueName: "joinFamilyMember",
      execute: jest.fn(),
    },
  },
}));

// Mock fetcher
jest.mock("@infrastructure/fetcher", () => {
  const mockUseQuery = jest.fn();
  const mockUseMutation = jest.fn();
  return {
    useQuery: mockUseQuery,
    useMutation: mockUseMutation,
  };
});

// Mock components
jest.mock("@components", () => ({
  Button: {
    Filled: ({ testID, ...props }: any) => (
      <MockedComponent testID={testID ?? "accept-button"} {...props} />
    ),
    Outlined: ({ testID, ...props }: any) => (
      <MockedComponent testID={testID ?? "decline-button"} {...props} />
    ),
  },
  Spacer: ({ testID }: any) => <MockedComponent testID={testID ?? "spacer"} />,
  Text: {
    Display: ({ testID, value }: any) => (
      <MockedComponent testID={testID ?? "invite-display"} value={value} />
    ),
    Headline: ({ testID, value }: any) => {
      // Assign specific testID for warning message
      let finalTestID = testID;
      if (!finalTestID) {
        if (value?.includes("not for you")) {
          finalTestID = "not-same-person-warning";
        } else {
          finalTestID = "family-name";
        }
      }
      return <MockedComponent testID={finalTestID} value={value} />;
    },
    Title: ({ testID, value }: any) => (
      <MockedComponent testID={testID ?? "loading-title"} value={value} />
    ),
  },
}));

// Mock utils
jest.mock("../utils", () => ({
  decodeRouteParams: jest.fn(() => Promise.resolve({ familyId: "123" })),
}));

// Mock FamilyViewModel
jest.mock("../models/FamilyViewModel", () => {
  return jest.fn().mockImplementation(() => ({
    familyName: "Test Family",
    isSamePerson: true,
  }));
});

// Mock styles
jest.mock("../styles", () => () => ({
  styles: { container: {}, buttonContainer: {} },
  theme: { colors: { error: "#error" } },
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

interface SetupOptions {
  isSamePerson?: boolean;
}

function setup(options?: SetupOptions) {
  const { useQuery, useMutation } = require("@infrastructure/fetcher");
  
  const mockData = {
    familyName: "Test Family",
    isSamePerson: options?.isSamePerson ?? true,
  };

  useQuery.mockReturnValue({ data: mockData });
  useMutation.mockReturnValue({
    mutate: jest.fn(),
    status: "idle",
  });

  render(<Invite />);
}

function setupLoading() {
  const { useQuery, useMutation } = require("@infrastructure/fetcher");
  
  useQuery.mockReturnValue({ data: null });
  useMutation.mockReturnValue({
    mutate: jest.fn(),
    status: "idle",
  });

  render(<Invite />);
}

export { setup, setupLoading };