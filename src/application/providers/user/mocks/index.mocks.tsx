import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { View } from "react-native";
import React from "react";
import { UserProvider, useUser } from "@application/providers/user";
import { render } from "@tests";
import { renderHook } from "@testing-library/react-native";
import * as loader from "@providers/loader";
import * as fetcher from "@infrastructure/fetcher";

jest.mock("@infrastructure/fetcher");

// #region Mocks
const useQuerySuccessResponse = {
  data: new UserProfileEntity({
    id: "e301a3a9-94a0-4e58-ac6f-54aec8c6b248",
    name: "John Doe",
    email: "john.doe@gmail.com",
    photoUrl: "https://example.com/photo.jpg",
  }),
  status: "success",
  refetch: jest.fn(),
  isFetching: false,
};

const useQueryPendingResponse = {
  data: undefined,
  status: "pending",
  refetch: jest.fn(),
  isFetching: true,
};

const useProviderLoaderResponse = {
  isLoading: false,
  setIsLoading: jest.fn(),
};
// #endregion Mocks

const useQuerySpy = jest
  .spyOn(fetcher, "useQuery")
  .mockReturnValue(useQueryPendingResponse as never);

jest
  .spyOn(loader, "useProviderLoader")
  .mockReturnValue(useProviderLoaderResponse);

function Children() {
  return <View testID={"user-provider-children"} />;
}

function setup() {
  return render(<Children />, { wrapper: UserProvider });
}

function setupHook() {
  return renderHook(() => useUser(), { wrapper: UserProvider });
}

const spies = {
  useQuery: useQuerySpy,
};

const mocks = {
  useQuery: {
    successResponse: useQuerySuccessResponse,
    pendingResponse: useQueryPendingResponse,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { setup, setupHook, spies, mocks };
export { screen, act } from "@tests";
