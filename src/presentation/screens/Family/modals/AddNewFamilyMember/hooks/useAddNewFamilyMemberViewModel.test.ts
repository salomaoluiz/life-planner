import { router, useLocalSearchParams } from "expo-router";

import { act, renderHook, waitFor } from "@tests";

import { useCases } from "@application/useCases";
import {
  FamilyMemberAlreadyExists,
  GenericError,
} from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import {
  FeedbackActions,
  FeedbackNavigationTypes,
} from "@screens/Feedback/BusinessFeedback/actions/types";
import { FeedbackType } from "@screens/Feedback/BusinessFeedback/types";
import { createFeedbackRouteEncoded } from "@screens/Feedback/BusinessFeedback/utils";

import useAddNewFamilyMemberViewModel from "./useAddNewFamilyMemberViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/i18n/useTranslation", () => ({
  __esModule: true,
  default: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
  }),
}));
jest.mock("@screens/Feedback/BusinessFeedback/utils", () => ({
  createFeedbackRouteEncoded: jest.fn(),
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

const mutation = new UseMutationFixture<unknown, Invite>();
const token = "q3Jx0b9S2v1mA8kQ7rT4yU6pL5nW0zE3cF2hD1gB9aI";

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useLocalSearchParams).mockReturnValue({ familyId: "family-1" });
  jest
    .mocked(createFeedbackRouteEncoded)
    .mockResolvedValue({ feedback: "encoded" });
});

function setup(props?: {
  data?: Invite;
  error?: FamilyMemberAlreadyExists | GenericError | null;
  isFetching?: boolean;
}) {
  mutation.reset();
  if (props?.data) {
    mutation.withData(props.data);
  }
  const built = {
    ...mutation.build(),
    error: props?.error ?? null,
    isFetching: props?.isFetching ?? false,
  };
  jest.mocked(useMutation).mockReturnValue(built as never);

  return {
    ...renderHook(() => useAddNewFamilyMemberViewModel()),
    mutate: built.mutate,
  };
}

it("SHOULD configure the invite mutation with the use case", () => {
  setup();

  expect(jest.mocked(useMutation)).toHaveBeenCalledWith({
    cacheKey: ["invite_member"],
    fetch: useCases.inviteFamilyMemberUseCase.execute,
  });
});

it("SHOULD NOT show a validation error before the first submit", () => {
  const { result } = setup();

  expect(result.current.emailErrorKey).toBeUndefined();
});

it.each([
  ["empty", "", "auth.validation.emailRequired"],
  ["only spaces", "   ", "auth.validation.emailRequired"],
  ["no @", "bob.example.test", "auth.validation.emailInvalid"],
  ["no domain dot", "bob@example", "auth.validation.emailInvalid"],
  ["254+ chars", `${"a".repeat(250)}@b.co`, "auth.validation.emailInvalid"],
])(
  "SHOULD block the request AND show an inline error WHEN the email is %s",
  (_label, email, key) => {
    const { mutate, result } = setup();
    act(() => result.current.onChangeEmail(email));

    act(() => result.current.onSubmit());

    expect(mutate).not.toHaveBeenCalled();
    expect(result.current.emailErrorKey).toBe(key);
  },
);

it("SHOULD invite the TRIMMED email into the family from the route", () => {
  const { mutate, result } = setup();
  act(() => result.current.onChangeEmail("  Bob@Example.test "));

  act(() => result.current.onSubmit());

  expect(mutate).toHaveBeenCalledWith({
    email: "Bob@Example.test",
    familyId: "family-1",
  });
});

it("SHOULD expose the loading state", () => {
  expect(setup({ isFetching: true }).result.current.isSubmitting).toBe(true);
});

it("SHOULD show the inline 'already exists' message for the submitted email AND clear it WHEN the email is edited", () => {
  const { result } = setup({ error: new FamilyMemberAlreadyExists() });
  act(() => result.current.onChangeEmail("bob@example.test"));
  act(() => result.current.onSubmit());
  expect(result.current.alreadyExistsVisible).toBe(true);

  act(() => result.current.onChangeEmail("carol@example.test"));

  expect(result.current.alreadyExistsVisible).toBe(false);
});

it("SHOULD NOT show 'already exists' for other errors", () => {
  const { result } = setup({ error: new GenericError() });
  act(() => result.current.onChangeEmail("bob@example.test"));
  act(() => result.current.onSubmit());

  expect(result.current.alreadyExistsVisible).toBe(false);
});

it("SHOULD go to the success feedback with the invite link and the 7-day message WHEN the invite was created", async () => {
  const { rerender, result } = setup();
  act(() => result.current.onChangeEmail("bob@example.test"));
  act(() => result.current.onSubmit());

  // The API answers after the submit.
  mutation.withData({
    inviteExpiresAt: new Date("2026-10-11T12:00:00.000Z"),
    inviteToken: token,
  });
  jest.mocked(useMutation).mockReturnValue(mutation.build() as never);
  rerender({});

  await waitFor(() => expect(router.push).toHaveBeenCalledTimes(1));

  expect(createFeedbackRouteEncoded).toHaveBeenCalledWith({
    closeButton: {
      action: FeedbackActions.NAVIGATION,
      route: "/family",
      type: FeedbackNavigationTypes.DISMISS_TO,
    },
    message: expect.stringContaining("bob@example.test"),
    primaryButton: {
      action: FeedbackActions.COPY_TO_CLIPBOARD,
      label: "family.member.invite.copyLink",
      value: expect.stringMatching(new RegExp(`/invite\\?token=${token}$`)),
    },
    title: "family.member.invite.successTitle",
    type: FeedbackType.Success,
  });
  const args = jest.mocked(createFeedbackRouteEncoded).mock.calls[0][0];
  expect(args.title).not.toContain("bob@example.test");
  expect(router.push).toHaveBeenCalledWith({
    params: { feedback: "encoded" },
    pathname: "/business_feedback",
  });
});

it("SHOULD NOT navigate WHEN there is no invite data", () => {
  setup();

  expect(router.push).not.toHaveBeenCalled();
});

it("SHOULD go back WHEN cancelled", () => {
  setup().result.current.onCancel();

  expect(router.back).toHaveBeenCalledTimes(1);
});
