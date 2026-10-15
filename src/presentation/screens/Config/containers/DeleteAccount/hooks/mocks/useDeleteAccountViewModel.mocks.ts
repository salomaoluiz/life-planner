import { router } from "expo-router";

import { act, renderHook } from "@tests";

import { useUser } from "@application/providers/user";
import { useCases } from "@application/useCases";
import {
  clearSessionExpiredNotice,
  setAccountDeletedNotice,
} from "@infrastructure/api";
import {
  resetFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import { captureException } from "@infrastructure/monitoring";

import useDeleteAccountViewModel from "../useDeleteAccountViewModel";

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
jest.mock("@application/providers/user");
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteAccountUseCase: { execute: jest.fn(), uniqueName: "delete_account" },
    getFamiliesUseCase: { execute: jest.fn(), uniqueName: "get_families" },
  },
}));
jest.mock("@infrastructure/api");
jest.mock("@infrastructure/fetcher");
jest.mock("@infrastructure/monitoring", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

// region mocks
const user = { email: "test@example.com", id: "user-id", name: "Test" };
const families = [
  { id: "f1", name: "Mine", ownerId: "user-id" },
  { id: "f2", name: "Theirs", ownerId: "other-id" },
  { id: "f3", name: "Also mine", ownerId: "user-id" },
];
const mutate = jest.fn();
const state = {
  data: undefined as undefined | { deleted: boolean },
  isFetching: false,
  status: "idle" as "error" | "idle" | "pending" | "success",
};
const queryState = { data: families as unknown, isFetching: false };
const captured: {
  deleteFetch?: (email: string) => Promise<{ deleted: boolean }>;
  familiesFetch?: () => Promise<unknown>;
} = {};
// endregion mocks

// region spies
const spies = {
  captureException: jest.mocked(captureException),
  clearSessionExpiredNotice: jest.mocked(clearSessionExpiredNotice),
  deleteExecute: jest.mocked(useCases.deleteAccountUseCase.execute),
  familiesExecute: jest.mocked(useCases.getFamiliesUseCase.execute),
  mutate,
  replace: jest.mocked(router.replace),
  resetFetcherData: jest.mocked(resetFetcherData),
  setAccountDeletedNotice: jest.mocked(setAccountDeletedNotice),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
  useUser: jest.mocked(useUser),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(state, { data: undefined, isFetching: false, status: "idle" });
  Object.assign(queryState, { data: families, isFetching: false });
  spies.deleteExecute.mockResolvedValue(undefined);
  spies.useUser.mockReturnValue({
    data: { profile: user },
    logged: true,
    update: jest.fn(),
  } as never);
  spies.useQuery.mockImplementation(((props: {
    fetch: () => Promise<unknown>;
  }) => {
    captured.familiesFetch = props.fetch;
    return {
      error: null,
      refetch: jest.fn(),
      status: "success",
      ...queryState,
    };
  }) as never);
  spies.useMutation.mockImplementation(((props: {
    fetch: (email: string) => Promise<{ deleted: boolean }>;
  }) => {
    captured.deleteFetch = props.fetch;
    return { error: null, mutate, ...state };
  }) as never);
});

async function runFetch(email: string) {
  let result: undefined | { deleted: boolean };
  await act(async () => {
    result = await captured.deleteFetch?.(email);
  });
  return result;
}

function setup() {
  return renderHook(() => useDeleteAccountViewModel());
}

const mocks = { families, state, user };

export { act, captured, mocks, runFetch, setup, spies };
