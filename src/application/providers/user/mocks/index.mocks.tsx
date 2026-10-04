import { renderHook } from "@testing-library/react-native";
import React from "react";
import { View } from "react-native";

import { render } from "@tests";

import { UserProvider, useUser } from "@application/providers/user";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import * as api from "@infrastructure/api";
import * as fetcher from "@infrastructure/fetcher";
import * as loader from "@providers/loader";

jest.mock("@infrastructure/fetcher");
jest.mock("@infrastructure/api");

// #region Mocks
const useQuerySuccessResponse = {
  data: new UserProfileEntity({
    email: "john.doe@gmail.com",
    id: "e301a3a9-94a0-4e58-ac6f-54aec8c6b248",
    name: "John Doe",
    photoUrl: "https://example.com/photo.jpg",
  }),
  isFetching: false,
  refetch: jest.fn(),
  status: "success",
};

const useQueryPendingResponse = {
  data: undefined,
  isFetching: true,
  refetch: jest.fn(),
  status: "pending",
};

const useQueryErrorResponse = {
  data: undefined,
  isFetching: false,
  refetch: jest.fn(),
  status: "error",
};

const unsubscribe = jest.fn();

const useProviderLoaderResponse = {
  isLoading: false,
  setIsLoading: jest.fn(),
};
// #endregion Mocks

const useQuerySpy = jest
  .spyOn(fetcher, "useQuery")
  .mockReturnValue(useQueryPendingResponse as never);

const onSessionExpiredSpy = jest
  .spyOn(api, "onSessionExpired")
  .mockReturnValue(unsubscribe);

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

function throwableSetupWithoutProvider() {
  try {
    renderHook(() => useUser());
  } catch (error) {
    return error;
  }
}

const spies = {
  onSessionExpired: onSessionExpiredSpy,
  resetFetcherData: jest.mocked(fetcher.resetFetcherData),
  unsubscribe,
  useQuery: useQuerySpy,
};

const mocks = {
  useQuery: {
    errorResponse: useQueryErrorResponse,
    pendingResponse: useQueryPendingResponse,
    successResponse: useQuerySuccessResponse,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupHook, spies, throwableSetupWithoutProvider };
export { act, screen } from "@tests";
