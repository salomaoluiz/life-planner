import { router } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import {
  FamilyHasPendingItems,
  FamilyHasRecords,
  FamilyNotFound,
  GenericError,
} from "@domain/entities/errors";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import {
  makeFamilyViewModel,
  ownerViewer,
} from "@screens/Family/mocks/index.mocks";

import useFamilyCardViewModel from "./useFamilyCardViewModel";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteFamilyMemberUseCase: {
      execute: jest.fn(),
      uniqueName: "delete_member",
    },
    deleteFamilyUseCase: { execute: jest.fn(), uniqueName: "delete_family" },
    setFamilyStatusUseCase: { execute: jest.fn(), uniqueName: "set_status" },
  },
}));

const memberViewer = { isFamilyOwner: false, userId: "user-2" };

// region mocks
const deleteFamily = new UseMutationFixture<unknown, void>();
const deleteMember = new UseMutationFixture<unknown, void>();
const setStatus = new UseMutationFixture<unknown, void>();
// endregion mocks

// region spies
const spies = {
  invalidate: jest.mocked(invalidateFetcherData),
  push: jest.mocked(router.push),
  useMutation: jest.mocked(useMutation),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(options?: {
  family?: ReturnType<typeof makeFamilyViewModel>;
  familyError?: GenericError;
  familyFetching?: boolean;
  familyStatus?: "idle" | "success";
  memberError?: GenericError;
  memberStatus?: "idle" | "success";
  statusError?: Error;
  statusFetching?: boolean;
  statusStatus?: "idle" | "success";
}) {
  const family = options?.family ?? makeFamilyViewModel(ownerViewer);
  const familyMutation = deleteFamily
    .reset()
    .withStatus(options?.familyStatus ?? "idle")
    .withIsFetching(!!options?.familyFetching);
  const memberMutation = deleteMember
    .reset()
    .withStatus(options?.memberStatus ?? "idle");

  if (options?.familyError) {
    familyMutation.withError(options.familyError);
  }
  if (options?.memberError) {
    memberMutation.withError(options.memberError);
  }

  const statusMutation = setStatus
    .reset()
    .withStatus(options?.statusStatus ?? "idle")
    .withIsFetching(!!options?.statusFetching);

  if (options?.statusError) {
    statusMutation.withError(options.statusError as never);
  }

  const builtStatus = statusMutation.build();
  const builtFamily = familyMutation.build();
  const builtMember = memberMutation.build();

  const byCacheKey: Record<string, unknown> = {
    delete_family: builtFamily,
    set_status: builtStatus,
  };

  spies.useMutation.mockImplementation(
    ({ cacheKey }: { cacheKey: string[] }) =>
      (byCacheKey[cacheKey[0]] ?? builtMember) as never,
  );

  const hook = renderHook(() => useFamilyCardViewModel({ family }));

  return { ...hook, builtFamily, builtMember, builtStatus, family };
}

it("SHOULD open the owner menu with Delete family AND move to the confirmation", () => {
  const { result } = setup();

  act(() => result.current.onFamilyOptions());
  expect(result.current.menu).toEqual({
    actionLabelKey: "family.delete.confirm",
    kind: "FAMILY",
    secondaryLabelKey: "family.archive.action",
    subtitle: "Test Family",
    titleKey: "family.card.options",
  });

  act(() => result.current.onMenuAction());
  expect(result.current.menu).toBeUndefined();
  expect(result.current.confirm).toEqual({ kind: "DELETE_FAMILY" });
  expect(result.current.confirmCopy?.titleKey).toBe("family.delete.title");
});

it("SHOULD delete the family on confirm", () => {
  const { builtFamily, result } = setup();

  act(() => result.current.onFamilyOptions());
  act(() => result.current.onMenuAction());
  act(() => result.current.onConfirm());

  expect(builtFamily.mutate).toHaveBeenCalledWith({ id: "family-1" });
});

it("SHOULD NOT send again WHILE the request is pending", () => {
  const { builtFamily, result } = setup({ familyFetching: true });

  act(() => result.current.onFamilyOptions());
  act(() => result.current.onMenuAction());
  act(() => result.current.onConfirm());

  expect(builtFamily.mutate).not.toHaveBeenCalled();
});

it("SHOULD leave the family deleting the viewer's own member row", () => {
  const { builtMember, result } = setup({
    family: makeFamilyViewModel(memberViewer),
  });

  act(() => result.current.onFamilyOptions());
  expect(result.current.menu?.actionLabelKey).toBe("family.member.leave");
  act(() => result.current.onMenuAction());
  expect(result.current.confirmCopy?.titleKey).toBe("family.leave.title");
  act(() => result.current.onConfirm());

  expect(builtMember.mutate).toHaveBeenCalledWith({ id: "member-2" });
});

it.each([
  ["REMOVE", "member-2", "family.member.remove", "family.removeMember.title"],
  [
    "CANCEL_INVITE",
    "member-3",
    "family.member.cancelInvite",
    "family.cancelInvite.title",
  ],
])(
  "SHOULD run the %s row action through the member menu AND the confirmation",
  (_name, id, labelKey, titleKey) => {
    const { builtMember, family, result } = setup();
    const member = family.familyMembers.find((item) => item.id === id)!;

    act(() => result.current.onMemberOptions(member));
    expect(result.current.menu?.kind).toBe("MEMBER");
    expect(result.current.menu?.actionLabelKey).toBe(labelKey);

    act(() => result.current.onMenuAction());
    expect(result.current.confirmCopy?.titleKey).toBe(titleKey);

    act(() => result.current.onConfirm());
    expect(builtMember.mutate).toHaveBeenCalledWith({ id });
  },
);

it("SHOULD NOT open a member menu FOR a row without action", () => {
  const { family, result } = setup();
  const ownerRow = family.familyMembers.find((item) => item.isOwner)!;

  act(() => result.current.onMemberOptions(ownerRow));

  expect(result.current.menu).toBeUndefined();
});

it("SHOULD close dialogs AND refetch everything on success", () => {
  const { result } = setup({ familyStatus: "success" });

  expect(spies.invalidate).toHaveBeenCalledTimes(1);
  expect(result.current.confirm).toBeUndefined();
});

it("SHOULD show the blocked notice (not a generic error) WHEN the family still has records", () => {
  const { result } = setup({ familyError: new FamilyHasRecords() });

  expect(result.current.notice).toBe("DELETE_BLOCKED");
  expect(result.current.confirm).toBeUndefined();
});

it("SHOULD just refetch WHEN the member was already removed (404)", () => {
  const { result } = setup({ memberError: new FamilyNotFound() });

  expect(spies.invalidate).toHaveBeenCalledTimes(1);
  expect(result.current.notice).toBeUndefined();
});

it("SHOULD show the generic notice FOR any other error", () => {
  const { result } = setup({ memberError: new GenericError() });

  expect(result.current.notice).toBe("GENERIC");
  act(() => result.current.onCloseNotice());
  expect(result.current.notice).toBeUndefined();
});

it("SHOULD open the invite sheet with the family id AND name", () => {
  const { result } = setup();

  act(() => result.current.onInviteMember());

  expect(modalNavigation.openModal).toHaveBeenCalledWith(
    "add_new_family_member",
    { familyId: "family-1", familyName: "Test Family" },
  );
});

it("SHOULD cancel the confirmation AND the menu without side effects", () => {
  const { builtFamily, result } = setup();

  act(() => result.current.onFamilyOptions());
  act(() => result.current.onCloseMenu());
  expect(result.current.menu).toBeUndefined();

  act(() => result.current.onFamilyOptions());
  act(() => result.current.onMenuAction());
  act(() => result.current.onCancelConfirm());
  expect(result.current.confirm).toBeUndefined();
  expect(builtFamily.mutate).not.toHaveBeenCalled();
});

describe("archive and reactivate (spec 042)", () => {
  it("SHOULD archive from the menu after confirming", () => {
    const { builtStatus, result } = setup();

    act(() => result.current.onFamilyOptions());
    act(() => result.current.onMenuSecondaryAction());

    expect(result.current.menu).toBeUndefined();
    expect(result.current.confirm).toEqual({ kind: "ARCHIVE_FAMILY" });
    expect(result.current.confirmCopy?.titleKey).toBe("family.archive.title");

    act(() => result.current.onConfirm());

    expect(builtStatus.mutate).toHaveBeenCalledWith({
      id: "family-1",
      status: "ARCHIVED",
    });
  });

  it("SHOULD reactivate straight from the button", () => {
    const { builtStatus, result } = setup();

    act(() => result.current.onReactivate());

    expect(builtStatus.mutate).toHaveBeenCalledWith({
      id: "family-1",
      status: "ACTIVE",
    });
  });

  it("SHOULD NOT reactivate again WHILE the request is pending", () => {
    const { builtStatus, result } = setup({ statusFetching: true });

    act(() => result.current.onReactivate());

    expect(builtStatus.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD ask to delete from the inline Delete button", () => {
    const { result } = setup();

    act(() => result.current.onDeleteInline());

    expect(result.current.confirm).toEqual({ kind: "DELETE_FAMILY" });
  });

  it("SHOULD expose the blockers (and close the confirmation) WHEN the archive is refused", () => {
    const { result } = setup({
      statusError: new FamilyHasPendingItems({
        pendingInvites: [{ email: "test@example.com", id: "invite-1" }],
      }),
    });

    expect(result.current.blockers?.pendingInvites).toEqual([
      { email: "test@example.com", id: "invite-1" },
    ]);
    expect(result.current.notice).toBeUndefined();

    act(() => result.current.onCloseBlockers());

    expect(result.current.blockers).toBeUndefined();
  });

  it("SHOULD show the generic notice FOR any other status error", () => {
    const { result } = setup({ statusError: new GenericError() });

    expect(result.current.notice).toBe("GENERIC");
  });

  it("SHOULD refetch everything WHEN the status changed", () => {
    setup({ statusStatus: "success" });

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
  });
});
