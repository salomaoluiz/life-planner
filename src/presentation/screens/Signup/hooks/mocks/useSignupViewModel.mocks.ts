import { router } from "expo-router";

import { act, renderHook } from "@tests";

import { useUser } from "@application/providers/user";
import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import { addBreadcrumb, captureException } from "@infrastructure/monitoring";

import useSignupViewModel from "../useSignupViewModel";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));
jest.mock("@application/providers/user");
jest.mock("@application/useCases", () => ({
  useCases: {
    signUpWithEmailUseCase: { execute: jest.fn(), uniqueName: "signup_email" },
  },
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@infrastructure/monitoring", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

// region mocks
const update = jest.fn().mockResolvedValue(undefined);
const mutate = jest.fn();
const captured: { fetch?: (params: unknown) => Promise<unknown> } = {};
const params = {
  email: "test@example.com",
  name: "Test User",
  password: "password123",
};
// endregion mocks

// region spies
const spies = {
  addBreadcrumb: jest.mocked(addBreadcrumb),
  captureException: jest.mocked(captureException),
  execute: jest.mocked(useCases.signUpWithEmailUseCase.execute),
  mutate,
  replace: jest.mocked(router.replace),
  update,
  useMutation: jest.mocked(useMutation),
  useUser: jest.mocked(useUser),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  spies.execute.mockResolvedValue(undefined);
  spies.update.mockResolvedValue(undefined);
  spies.useUser.mockReturnValue({ data: undefined, logged: false, update });
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

type Hook = ReturnType<typeof setup>["result"];

function fillAll(
  result: Hook,
  overrides: Partial<typeof params & { confirm: string }> = {},
) {
  act(() => {
    result.current.onChangeName(overrides.name ?? params.name);
    result.current.onChangeEmail(overrides.email ?? params.email);
    result.current.onChangePassword(overrides.password ?? params.password);
    result.current.onChangeConfirmPassword(
      overrides.confirm ?? overrides.password ?? params.password,
    );
  });
}

async function runFetch(fetchParams: typeof params = params) {
  await act(async () => {
    await captured.fetch?.(fetchParams);
  });
}

function setup() {
  return renderHook(() => useSignupViewModel());
}

const mocks = { params };

export { act, fillAll, mocks, runFetch, setup, spies };
