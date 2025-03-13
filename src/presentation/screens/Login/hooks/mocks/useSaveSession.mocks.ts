import { renderHook } from "@tests";

import * as user from "@application/providers/user";
import { useCases } from "@application/useCases";
import { GenericError } from "@domain/entities/errors";
import * as fetcher from "@infrastructure/fetcher";

import useSaveSession from "../useSaveSession";

// region mocks
jest.mock("@infrastructure/fetcher");
jest.mock("@application/providers/user", () => ({
  useUser: jest.fn(),
}));

const useUserMock = {
  update: jest.fn(),
};
const useMutationMockSuccess = {
  error: null,
  isFetching: false,
  mutate: jest.fn(),
  status: "success",
};
const useMutationMockError = {
  error: new GenericError(),
  isFetching: false,
  mutate: jest.fn(),
  status: "error",
};

const hashMock = "#hash-mock";

window.location = {
  get hash() {
    return hashMock;
  },
} as never;
// endregion mocks

// region spies
const useUserSpy = jest
  .spyOn(user, "useUser")
  .mockReturnValue(useUserMock as never);

const useMutationSpy = jest
  .spyOn(fetcher, "useMutation")
  .mockReturnValue(useMutationMockSuccess as never);
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return renderHook(() => useSaveSession());
}

const spies = {
  useMutation: useMutationSpy,
  useUser: useUserSpy,
};

const mocks = {
  hashMock,
  useCases,
  useMutationMockError,
  useMutationMockSuccess,
  useUserMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
export { renderHook } from "@tests";
