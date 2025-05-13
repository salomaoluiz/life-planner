import { renderHook } from "@tests";

import * as user from "@application/providers/user";
import { useCases } from "@application/useCases";
import * as fetcher from "@infrastructure/fetcher";
import * as monitoring from "@infrastructure/monitoring";
import * as platform from "@utils/platform";

import useLogin from "../useLogin";

// region mocks
jest.mock("@infrastructure/fetcher");
jest.mock("@infrastructure/monitoring");
jest.mock("@utils/platform");
jest.mock("@application/providers/user", () => ({
  useUser: jest.fn(),
}));

const useMutationMockSuccess = {
  isFetching: false,
  mutate: jest.fn(),
  status: "success",
};

const useMutationMockPending = {
  isFetching: true,
  mutate: jest.fn(),
  status: "pending",
};

const useMutationMockIdle = {
  isFetching: false,
  mutate: jest.fn(),
  status: "idle",
};

const useUserMock = {
  update: jest.fn(),
};
// endregion mocks

// region spies
const useMutationSpy = jest
  .spyOn(fetcher, "useMutation")
  .mockReturnValue(useMutationMockIdle as never);
const addBreadcrumbSpy = jest.spyOn(monitoring, "addBreadcrumb");
const isWebSpy = jest.spyOn(platform, "isWeb");
jest.spyOn(user, "useUser").mockReturnValue(useUserMock as never);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return renderHook(() => useLogin());
}

const spies = {
  addBreadcrumb: addBreadcrumbSpy,
  isWeb: isWebSpy,
  useMutation: useMutationSpy,
};

const mocks = {
  useCases,
  useMutationMockIdle,
  useMutationMockPending,
  useMutationMockSuccess,
  useUserMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
export { renderHook } from "@tests";
