import { router, useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";

import { useCases } from "@application/useCases";
import {
  FamilyMemberAlreadyExists,
  GenericError,
} from "@domain/entities/errors";
import { copyText } from "@infrastructure/clipboard";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import { isShareAvailable, shareText } from "@infrastructure/share";
import { buildInviteLink } from "@screens/Family/utils/inviteLink";

import useAddNewFamilyMemberViewModel from "./useAddNewFamilyMemberViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@infrastructure/clipboard", () => ({ copyText: jest.fn() }));
jest.mock("@infrastructure/share", () => ({
  isShareAvailable: jest.fn(),
  shareText: jest.fn(),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    inviteFamilyMemberUseCase: {
      execute: jest.fn(),
      uniqueName: "invite_member",
    },
  },
}));

type Invite = { inviteExpiresAt: Date; inviteToken: string };

const mutation = new UseMutationFixture<void, Invite>();
const token = "tok_123";
// EXPO_PUBLIC_* is inlined at build time, so the expected link uses the same expression.
const link = buildInviteLink(
  process.env.EXPO_PUBLIC_PROJECT_WEBSITE_URL,
  token,
);

const spies = {
  back: jest.mocked(router.back),
  copyText: jest.mocked(copyText),
  invalidate: jest.mocked(invalidateFetcherData),
  isShareAvailable: jest.mocked(isShareAvailable),
  shareText: jest.mocked(shareText),
  useMutation: jest.mocked(useMutation),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ familyId: "family-1", familyName: "Test Family" });
  spies.copyText.mockResolvedValue(undefined);
  spies.shareText.mockResolvedValue(undefined);
  spies.isShareAvailable.mockReturnValue(true);
});

function setup(
  options: {
    data?: Invite;
    error?: FamilyMemberAlreadyExists | GenericError;
    isFetching?: boolean;
  } = {},
) {
  mutation.reset();
  if (options.data) {
    mutation.withData(options.data);
  }
  if (options.error) {
    mutation.withError(options.error);
  }
  if (options.isFetching) {
    mutation.withIsFetching(true);
  }
  const built = mutation.build();
  spies.useMutation.mockReturnValue(built as never);

  return {
    ...renderHook(() => useAddNewFamilyMemberViewModel()),
    mutate: built.mutate,
  };
}

function setupCreated() {
  const rendered = setup({
    data: { inviteExpiresAt: new Date(), inviteToken: token },
  });
  act(() => rendered.result.current.onChangeEmail("invitee@example.test"));
  act(() => rendered.result.current.onSubmit());

  return rendered;
}

it("SHOULD NOT put the email or token in the mutation variables (only ids reach the fetcher)", () => {
  const { mutate, result } = setup();

  act(() => result.current.onChangeEmail("  Invitee@Example.com  "));
  act(() => result.current.onSubmit());

  expect(mutate).toHaveBeenCalledTimes(1);
  expect(mutate).toHaveBeenCalledWith();
  const calls = JSON.stringify(jest.mocked(mutate).mock.calls);
  expect(calls).not.toContain("Invitee");
  expect(calls).not.toContain(token);
});

it("SHOULD run the use case with the trimmed email and the family id", async () => {
  const { result } = setup();

  act(() => result.current.onChangeEmail("  Invitee@Example.com  "));
  act(() => result.current.onSubmit());
  await spies.useMutation.mock.calls.at(-1)![0].fetch(undefined as never);

  expect(useCases.inviteFamilyMemberUseCase.execute).toHaveBeenCalledWith({
    email: "Invitee@Example.com",
    familyId: "family-1",
  });
});

it("SHOULD expose the family name from the route", () => {
  expect(setup().result.current.familyName).toBe("Test Family");
});

it.each([
  ["empty", "", "auth.validation.emailRequired"],
  ["only spaces", "   ", "auth.validation.emailRequired"],
  ["no @", "invitee.example.test", "auth.validation.emailInvalid"],
  ["no domain dot", "invitee@example", "auth.validation.emailInvalid"],
])(
  "SHOULD block an invalid email (%s) with the validation key AND not call the API",
  (_label, email, key) => {
    const { mutate, result } = setup();

    act(() => result.current.onChangeEmail(email));
    act(() => result.current.onSubmit());

    expect(result.current.emailErrorKey).toBe(key);
    expect(mutate).not.toHaveBeenCalled();
  },
);

it("SHOULD NOT show the validation error before the first submit", () => {
  const { result } = setup();

  act(() => result.current.onChangeEmail("invalid"));

  expect(result.current.emailErrorKey).toBeUndefined();
});

it("SHOULD show alreadyExists under the field WHEN the API answers 409 AND clear it when the email changes", () => {
  const { result } = setup({ error: new FamilyMemberAlreadyExists() });

  act(() => result.current.onChangeEmail("a@example.test"));
  act(() => result.current.onSubmit());

  expect(result.current.emailErrorKey).toBe(
    "family.member.invite.alreadyExists",
  );
  expect(result.current.hasGenericError).toBe(false);

  act(() => result.current.onChangeEmail("b@example.test"));

  expect(result.current.emailErrorKey).toBeUndefined();
});

it("SHOULD flag any other error as generic", () => {
  const { result } = setup({ error: new GenericError() });

  act(() => result.current.onChangeEmail("a@example.test"));
  act(() => result.current.onSubmit());

  expect(result.current.hasGenericError).toBe(true);
  expect(result.current.emailErrorKey).toBeUndefined();
});

it("SHOULD NOT submit twice WHILE pending", () => {
  const { mutate, result } = setup({ isFetching: true });

  act(() => result.current.onChangeEmail("a@example.test"));
  act(() => result.current.onSubmit());

  expect(result.current.isSubmitting).toBe(true);
  expect(mutate).not.toHaveBeenCalled();
});

it("SHOULD NOT expose a link BEFORE the invite exists", () => {
  expect(setup().result.current.link).toBeUndefined();
});

it("SHOULD build the link from the token only AFTER creation AND never keep it in the mutation variables", () => {
  const { mutate, result } = setupCreated();

  expect(result.current.link).toBe(link);
  expect(link).toMatch(/\/invite\?token=tok_123$/);
  expect(result.current.resultEmail).toBe("invitee@example.test");
  expect(mutate).not.toHaveBeenCalledWith(
    expect.objectContaining({ inviteToken: expect.anything() }),
  );
  expect(spies.useMutation.mock.calls[0][0].cacheKey).toEqual([
    "invite_member",
  ]);
});

it("SHOULD copy the link, show Copied, and revert after 2 seconds", async () => {
  const { result } = setupCreated();

  await act(async () => {
    await result.current.onCopy();
  });

  expect(spies.copyText).toHaveBeenCalledWith(link);
  expect(result.current.copied).toBe(true);

  act(() => {
    jest.advanceTimersByTime(2000);
  });

  expect(result.current.copied).toBe(false);
});

it("SHOULD NOT copy WHEN there is no link", async () => {
  const { result } = setup();

  await act(async () => {
    await result.current.onCopy();
  });

  expect(spies.copyText).not.toHaveBeenCalled();
});

it("SHOULD not leave a timer running after unmount", async () => {
  const { result, unmount } = setupCreated();

  await act(async () => {
    await result.current.onCopy();
  });
  unmount();

  expect(jest.getTimerCount()).toBe(0);
});

it("SHOULD share the link only WHEN sharing is available", async () => {
  const { result } = setupCreated();

  expect(result.current.shareAvailable).toBe(true);

  await act(async () => {
    await result.current.onShare();
  });

  expect(spies.shareText).toHaveBeenCalledWith(link);
});

it("SHOULD report sharing as unavailable WHEN the platform does not support it", () => {
  spies.isShareAvailable.mockReturnValue(false);

  expect(setupCreated().result.current.shareAvailable).toBe(false);
});

it("SHOULD refetch AND close on Done", () => {
  const { result } = setupCreated();

  act(() => result.current.onDone());

  expect(spies.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.back).toHaveBeenCalledTimes(1);
});

it("SHOULD also refetch WHEN the sheet is closed (X) after the invite was created", () => {
  const { result } = setupCreated();

  act(() => result.current.onClose());

  expect(spies.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.back).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT refetch WHEN the sheet is closed before creating an invite", () => {
  const { result } = setup();

  act(() => result.current.onClose());

  expect(spies.invalidate).not.toHaveBeenCalled();
  expect(spies.back).toHaveBeenCalledTimes(1);
});
