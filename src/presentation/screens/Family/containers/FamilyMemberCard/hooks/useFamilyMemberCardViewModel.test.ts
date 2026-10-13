import { act, renderHook } from "@tests";

import { useCases } from "@application/useCases";
import { FamilyNotFound, GenericError } from "@domain/entities/errors";
import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import FamilyMemberUIModel from "@screens/Family/models/FamilyMemberUIModel";

import { memberDTO } from "../../../mocks/index.mocks";
import useFamilyMemberCardViewModel from "./useFamilyMemberCardViewModel";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteFamilyMemberUseCase: {
      execute: jest.fn(),
      uniqueName: "delete_member",
    },
  },
}));

const mutation = new UseMutationFixture<unknown, void>();
const refetchFamily = jest.fn();
const ownerViewer = { isFamilyOwner: true, userId: "user-1" };
const pending = new FamilyMemberUIModel(
  memberDTO({
    id: "member-2",
    role: FamilyMemberRole.MEMBER,
    status: FamilyMemberStatus.PENDING,
    userId: undefined,
  }),
  ownerViewer,
);
const ownerRow = new FamilyMemberUIModel(memberDTO(), ownerViewer);

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: {
  error?: FamilyNotFound | GenericError | null;
  isFetching?: boolean;
  member?: FamilyMemberUIModel;
  status?: "error" | "idle" | "pending" | "success";
}) {
  const built = {
    ...mutation
      .reset()
      .withStatus(props?.status ?? "idle")
      .build(),
    error: props?.error ?? null,
    isFetching: props?.isFetching ?? false,
  };
  jest.mocked(useMutation).mockReturnValue(built as never);

  const hook = renderHook(() =>
    useFamilyMemberCardViewModel({
      member: props?.member ?? pending,
      refetchFamily,
    }),
  );

  return { ...hook, mutate: built.mutate };
}

it("SHOULD configure the delete mutation with the use case", () => {
  setup();

  expect(jest.mocked(useMutation)).toHaveBeenCalledWith({
    cacheKey: ["delete_member"],
    fetch: useCases.deleteFamilyMemberUseCase.execute,
  });
});

it("SHOULD be collapsed AND toggle WHEN the member has an action", () => {
  const { result } = setup();
  expect(result.current.canExpand).toBe(true);
  expect(result.current.isExpanded).toBe(false);

  act(() => result.current.onToggle());
  expect(result.current.isExpanded).toBe(true);

  act(() => result.current.onToggle());
  expect(result.current.isExpanded).toBe(false);
});

it("SHOULD NOT expand WHEN the member has no action (owner row)", () => {
  const { result } = setup({ member: ownerRow });

  act(() => result.current.onToggle());

  expect(result.current.canExpand).toBe(false);
  expect(result.current.isExpanded).toBe(false);
});

it("SHOULD delete the member by id WHEN the action is pressed", () => {
  const { mutate, result } = setup();

  result.current.onActionPress();

  expect(mutate).toHaveBeenCalledWith({ id: "member-2" });
});

it("SHOULD flag deleting WHEN the mutation is in flight (disables the button)", () => {
  expect(
    setup({ isFetching: true, status: "pending" }).result.current.isDeleting,
  ).toBe(true);
  expect(setup().result.current.isDeleting).toBe(false);
});

it("SHOULD refetch the family WHEN the delete succeeded", () => {
  setup({ status: "success" });

  expect(refetchFamily).toHaveBeenCalledTimes(1);
});

it("SHOULD refetch (not crash) WHEN the member was already removed (FamilyNotFound)", () => {
  setup({ error: new FamilyNotFound(), status: "error" });

  expect(refetchFamily).toHaveBeenCalledTimes(1);
});

it.each(["idle", "pending"] as const)(
  "SHOULD NOT refetch WHEN the status is %s",
  (status) => {
    setup({ status });

    expect(refetchFamily).not.toHaveBeenCalled();
  },
);

it("SHOULD expose the UI model data for the view", () => {
  const { result } = setup();

  expect(result.current).toMatchObject({
    actionLabelKey: "family.member.cancelInvite",
    displayName: "Alice Test",
    id: "member-2",
    statusLabelKey: "family.member.status.pending",
  });
});
