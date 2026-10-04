import { router, useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";

import { useUser } from "@application/providers/user";
import { useCases } from "@application/useCases";
import {
  clearSessionExpiredNotice,
  hasSessionExpiredNotice,
} from "@infrastructure/api";
import { useMutation } from "@infrastructure/fetcher";
import { addBreadcrumb, captureException } from "@infrastructure/monitoring";

import useLoginViewModel from "../useLoginViewModel";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@application/providers/user");
jest.mock("@application/useCases", () => ({
  useCases: {
    loginWithEmailUseCase: { execute: jest.fn(), uniqueName: "login_email" },
  },
}));
jest.mock("@infrastructure/api");
jest.mock("@infrastructure/fetcher");
jest.mock("@infrastructure/monitoring", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

// region mocks
const update = jest.fn().mockResolvedValue(undefined);
const mutate = jest.fn();
const captured: { fetch?: (params: unknown) => Promise<unknown> } = {};
// endregion mocks

// region spies
const spies = {
  addBreadcrumb: jest.mocked(addBreadcrumb),
  captureException: jest.mocked(captureException),
  clearSessionExpiredNotice: jest.mocked(clearSessionExpiredNotice),
  execute: jest.mocked(useCases.loginWithEmailUseCase.execute),
  hasSessionExpiredNotice: jest.mocked(hasSessionExpiredNotice),
  localSearchParams: jest.mocked(useLocalSearchParams),
  mutate,
  push: jest.mocked(router.push),
  update,
  useMutation: jest.mocked(useMutation),
  useUser: jest.mocked(useUser),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  spies.hasSessionExpiredNotice.mockReturnValue(false);
  spies.localSearchParams.mockReturnValue({});
  spies.execute.mockResolvedValue(undefined);
  spies.update.mockResolvedValue(undefined);
  spies.useUser.mockReturnValue({
    data: undefined,
    logged: false,
    update,
  });
  spies.useMutation.mockImplementation(((props: {
    fetch: (params: unknown) => Promise<unknown>;
  }) => {
    captured.fetch = props.fetch;
    return {
      data: undefined,
      error: null,
      isFetching: false,
      mutate,
      status: "idle",
    };
  }) as never);
});

async function runFetch(params: { email: string; password: string }) {
  await act(async () => {
    await captured.fetch?.(params);
  });
}

function setup() {
  return renderHook(() => useLoginViewModel());
}

const mocks = {
  params: { email: "test@example.com", password: "password123" },
};

export { act, mocks, runFetch, setup, spies };
