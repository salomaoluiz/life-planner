import { act } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import { renderHook } from "@tests";

import FamilyInviteDTO from "@application/dto/familyMember/FamilyInviteDTO";
import { useCases } from "@application/useCases";
import {
  ConnectivityError,
  FamilyMemberAlreadyExists,
  InviteEmailMismatch,
  InviteExpired,
  InviteNotFound,
} from "@domain/entities/errors";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import InviteUIModel from "../models/InviteUIModel";
import useInviteViewModel from "./useInviteViewModel";

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    getFamilyInviteUseCase: {
      execute: jest.fn(),
      uniqueName: "get_family_invite",
    },
    joinFamilyMemberUseCase: { execute: jest.fn(), uniqueName: "join_family" },
  },
}));

const TOKEN = "q3Jx0b9S2v1mA8kQ7rT4yU6pL5nW0zE3cF2hD1gB9aI";
const dto = new FamilyInviteDTO({
  email: "bob@example.test",
  emailMatches: true,
  familyId: "family-1",
  familyName: "Test Family",
  inviteExpiresAt: new Date("2026-10-11T12:00:00.000Z"),
});
const ui = new InviteUIModel(dto);

const query = new UseQueryFixture<InviteUIModel>();
const joinMutation = new UseMutationFixture<void, void>();

const spies = {
  getInvite: jest.mocked(useCases.getFamilyInviteUseCase.execute),
  invalidate: jest.mocked(invalidateFetcherData),
  join: jest.mocked(useCases.joinFamilyMemberUseCase.execute),
  params: jest.mocked(useLocalSearchParams),
  replace: jest.mocked(router.replace),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};

function noop() {
  return undefined;
}

beforeEach(() => {
  jest.clearAllMocks();
  spies.params.mockReturnValue({ token: TOKEN });
});

function setup(props?: {
  data?: InviteUIModel;
  error?: Error;
  isFetching?: boolean;
  joinError?: Error;
  joinFetching?: boolean;
  joinStatus?: "error" | "idle" | "pending" | "success";
}) {
  query.reset();
  if (props?.data) query.withData(props.data);
  const builtQuery = {
    ...query.build(),
    error: (props?.error ?? null) as never,
    isFetching: props?.isFetching ?? false,
  };
  const builtJoin = {
    ...joinMutation
      .reset()
      .withStatus(props?.joinStatus ?? "idle")
      .build(),
    error: (props?.joinError ?? null) as never,
    isFetching: props?.joinFetching ?? false,
  };
  spies.useQuery.mockReturnValue(builtQuery as never);
  spies.useMutation.mockReturnValue(builtJoin as never);

  return {
    ...renderHook(() => useInviteViewModel()),
    mutate: builtJoin.mutate,
    refetch: builtQuery.refetch,
  };
}

it("SHOULD key the query WITHOUT the token and disable retries (404/410 are final)", () => {
  setup();

  const options = spies.useQuery.mock.calls[0][0];
  expect(options.cacheKey).toEqual(["get_family_invite"]);
  expect(JSON.stringify(options.cacheKey)).not.toContain(TOKEN);
  expect(options.retry).toBe(false);
});

it("SHOULD fetch the invite with the route token AND wrap it in the UI model", async () => {
  setup();
  spies.getInvite.mockResolvedValue(dto);

  const result = await spies.useQuery.mock.calls[0][0].fetch();

  expect(spies.getInvite).toHaveBeenCalledWith(TOKEN);
  expect(result).toBeInstanceOf(InviteUIModel);
});

it.each([
  ["an array", { token: ["a", "b"] }],
  ["missing", {}],
])(
  "SHOULD pass an empty token WHEN the route param is %s (the use case rejects it)",
  async (_label, params) => {
    spies.params.mockReturnValue(params);
    setup();
    spies.getInvite.mockResolvedValue(dto);

    await spies.useQuery.mock.calls[0][0].fetch();

    expect(spies.getInvite).toHaveBeenCalledWith("");
  },
);

it.each([
  ["loading while fetching", { isFetching: true }, "loading"],
  ["loading before any data", {}, "loading"],
  ["ready WHEN data loaded", { data: ui }, "ready"],
  ["notFound WHEN InviteNotFound", { error: new InviteNotFound() }, "notFound"],
  ["expired WHEN InviteExpired", { error: new InviteExpired() }, "expired"],
  [
    "error for any other business error",
    { error: new ConnectivityError() },
    "error",
  ],
  [
    "loading even with stale data WHEN refetching",
    { data: ui, isFetching: true },
    "loading",
  ],
])("SHOULD report status: %s", (_label, props, expected) => {
  expect(setup(props).result.current.status).toBe(expected);
});

it("SHOULD configure the join mutation WITHOUT the token in its key", () => {
  setup();

  const options = spies.useMutation.mock.calls[0][0];
  expect(options.cacheKey).toEqual(["join_family"]);
  expect(JSON.stringify(options.cacheKey)).not.toContain(TOKEN);
});

it("SHOULD join with the route token when the mutation runs", async () => {
  setup();

  await spies.useMutation.mock.calls[0][0].fetch(undefined);

  expect(spies.join).toHaveBeenCalledWith({ inviteToken: TOKEN });
});

it("SHOULD call mutate with no variables on accept", () => {
  const { mutate, result } = setup();

  result.current.onAccept();

  expect(mutate).toHaveBeenCalledWith();
});

it("SHOULD go home THEN invalidate cached data WHEN the join succeeded", () => {
  setup({ joinStatus: "success" });

  expect(spies.replace).toHaveBeenCalledWith("/(app)/(tabs)/index");
  expect(spies.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.replace.mock.invocationCallOrder[0]).toBeLessThan(
    spies.invalidate.mock.invocationCallOrder[0],
  );
});

it.each(["idle", "pending", "error"] as const)(
  "SHOULD NOT navigate or invalidate WHEN the join is %s",
  (joinStatus) => {
    setup({ joinStatus });

    expect(spies.replace).not.toHaveBeenCalled();
    expect(spies.invalidate).not.toHaveBeenCalled();
  },
);

it.each([
  [new FamilyMemberAlreadyExists(), "invite.alreadyMember"],
  [new InviteExpired(), "invite.expired"],
  [new InviteNotFound(), "invite.notFound"],
  [new InviteEmailMismatch(), "invite.notForYou"],
  [new ConnectivityError(), "invite.acceptFailed"],
])("SHOULD map the accept error %s to its message key", (joinError, key) => {
  expect(
    setup({ joinError, joinStatus: "error" }).result.current.acceptErrorKey,
  ).toBe(key);
});

it("SHOULD have no accept error WHEN the join has not failed", () => {
  expect(setup().result.current.acceptErrorKey).toBeUndefined();
});

it("SHOULD flag isAccepting while the join is in flight (blocks a double tap)", () => {
  expect(
    setup({ joinFetching: true, joinStatus: "pending" }).result.current
      .isAccepting,
  ).toBe(true);
});

it("SHOULD go home WITHOUT any request WHEN declined", () => {
  const { mutate, result } = setup();

  result.current.onDecline();

  expect(spies.replace).toHaveBeenCalledWith("/(app)/(tabs)/index");
  expect(mutate).not.toHaveBeenCalled();
  expect(spies.invalidate).not.toHaveBeenCalled();
});

it("SHOULD go Home on onGoHome without calling the API", () => {
  const { mutate, result } = setup();

  result.current.onGoHome();

  expect(spies.replace).toHaveBeenCalledWith("/(app)/(tabs)/index");
  expect(mutate).not.toHaveBeenCalled();
  expect(spies.getInvite).not.toHaveBeenCalled();
});

it("SHOULD refetch the invite on onRetry", () => {
  const { result } = setup();

  result.current.onRetry();

  expect(query.value.refetch).toHaveBeenCalledTimes(1);
});

it("SHOULD refetch with the NEW token and report loading WHEN a 2nd deep link changes the token", async () => {
  const tokenB = "tokenB-0123456789";
  const { refetch, rerender, result } = setup({ data: ui });
  expect(refetch).not.toHaveBeenCalled();
  expect(result.current.status).toBe("ready");

  let resolveRefetch: () => void = noop;
  jest.mocked(refetch).mockImplementation(async () => {
    await new Promise<void>((resolve) => {
      resolveRefetch = resolve;
    });
  });
  spies.params.mockReturnValue({ token: tokenB });
  rerender({});

  expect(refetch).toHaveBeenCalledTimes(1);
  expect(result.current.status).toBe("loading");

  spies.getInvite.mockResolvedValue(dto);
  await spies.useQuery.mock.lastCall?.[0].fetch();
  expect(spies.getInvite).toHaveBeenLastCalledWith(tokenB);

  await act(async () => {
    resolveRefetch();
  });

  expect(result.current.status).toBe("ready");
});
