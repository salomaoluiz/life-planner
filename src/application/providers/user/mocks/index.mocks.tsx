import { useCases } from "@application/useCases";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";
import { BusinessError } from "@domain/entities/errors";
import { View } from "react-native";
import React from "react";
import { UserProvider, useUser } from "@application/providers/user";
import { render } from "@tests";
import { renderHook } from "@testing-library/react-native";
import * as loader from "@providers/loader";

jest.mock("@application/useCases");

// #region Mocks
const getUserUseCaseSuccessResponse = new UserProfileEntity({
  id: "e301a3a9-94a0-4e58-ac6f-54aec8c6b248",
  name: "John Doe",
  email: "john.doe@gmail.com",
  photoUrl: "https://example.com/photo.jpg",
});

const getUserUseCaseErrorResponse = new BusinessError();

const useProviderLoaderResponse = {
  isLoading: false,
  setIsLoading: jest.fn(),
};
// #endregion Mocks

const getUserUseCaseSpy = jest.spyOn(useCases.getUserUseCase, "execute");
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
  getUserUseCase: getUserUseCaseSpy,
};

const mocks = {
  getUserUseCase: {
    errorResponse: getUserUseCaseErrorResponse,
    successResponse: getUserUseCaseSuccessResponse,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { setup, setupHook, spies, mocks };
export { screen, act } from "@tests";
