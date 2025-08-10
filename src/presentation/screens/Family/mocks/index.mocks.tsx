import React from "react";
import { render } from "@tests";

import Family from "../";

// Mock the containers and components
jest.mock("../containers", () => {
  const { View } = jest.requireActual("react-native");
  return {
    FamilyCard: ({ family, refetchFamilies, ...props }: any) => (
      <View 
        testID="family-card" 
        family={family}
        refetchFamilies={refetchFamilies}
        {...props}
      />
    ),
    NewFamilyButton: () => <View testID="new-family-button" />,
  };
});

jest.mock("../components", () => {
  const { View } = jest.requireActual("react-native");
  return {
    ItemSeparator: () => <View testID="item-separator" />,
  };
});

// Mock FlashList
jest.mock("@shopify/flash-list", () => {
  const { View } = jest.requireActual("react-native");
  return {
    FlashList: ({ data, renderItem, ItemSeparatorComponent, ...props }: any) => (
      <View 
        testID="family-list"
        data={data}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparatorComponent}
        {...props}
      />
    ),
  };
});

// Mock the useFamilies hook
const defaultUseFamiliesMock = {
  families: [],
  isFetching: false,
  refetch: jest.fn(),
};

jest.mock("../hooks", () => ({
  useFamilies: jest.fn(),
}));

const useFamiliesMock = jest.requireMock("../hooks").useFamilies;

beforeEach(() => {
  jest.clearAllMocks();
  useFamiliesMock.mockReturnValue(defaultUseFamiliesMock);
});

function setup(hookOverrides?: Partial<typeof defaultUseFamiliesMock>) {
  const mockHookReturn = { ...defaultUseFamiliesMock, ...hookOverrides };
  useFamiliesMock.mockReturnValue(mockHookReturn);
  
  render(<Family />);
}

const mocks = {
  useFamilies: defaultUseFamiliesMock,
};

const spies = {
  useFamilies: useFamiliesMock,
};

export { mocks, setup, spies };