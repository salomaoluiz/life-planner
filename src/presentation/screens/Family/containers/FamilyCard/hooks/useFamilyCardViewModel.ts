import { router } from "expo-router";
import { useEffect, useState } from "react";

import { useCases } from "@application/useCases";
import {
  FamilyHasPendingItems,
  FamilyHasRecords,
  FamilyNotFound,
} from "@domain/entities/errors";
import { FamilyBlockers } from "@domain/entities/errors/family/FamilyHasPendingItems";
import { FamilyStatus } from "@domain/entities/family/FamilyStatus";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  FamilyConfirm,
  getConfirmCopy,
} from "@screens/Family/models/FamilyConfirm";
import FamilyMemberUIModel from "@screens/Family/models/FamilyMemberUIModel";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

export type FamilyNotice = "DELETE_BLOCKED" | "GENERIC";

export interface Props {
  family: FamilyViewModel;
}

type Menu =
  | { kind: "FAMILY" }
  | { kind: "MEMBER"; member: FamilyMemberUIModel };

interface MenuView {
  actionLabelKey: TranslationKeys;
  kind: "FAMILY" | "MEMBER";
  secondaryLabelKey?: TranslationKeys;
  subtitle: string;
  titleKey: TranslationKeys;
}

function useFamilyCardViewModel({ family }: Props) {
  const [menu, setMenu] = useState<Menu>();
  const [confirm, setConfirm] = useState<FamilyConfirm>();
  const [notice, setNotice] = useState<FamilyNotice>();
  const [blockers, setBlockers] = useState<FamilyBlockers>();

  const deleteFamily = useMutation<{ id: string }, void>({
    cacheKey: [useCases.deleteFamilyUseCase.uniqueName],
    fetch: useCases.deleteFamilyUseCase.execute,
  });
  const setStatus = useMutation<{ id: string; status: FamilyStatus }, void>({
    cacheKey: [useCases.setFamilyStatusUseCase.uniqueName],
    fetch: useCases.setFamilyStatusUseCase.execute,
  });
  const deleteMember = useMutation<{ id: string }, void>({
    cacheKey: [useCases.deleteFamilyMemberUseCase.uniqueName],
    fetch: useCases.deleteFamilyMemberUseCase.execute,
  });

  function finish() {
    setConfirm(undefined);
    setMenu(undefined);
    // Families, members and owners (Home filter, forms) all depend on the membership.
    invalidateFetcherData();
  }

  useEffect(() => {
    if (
      deleteFamily.status === "success" ||
      deleteMember.status === "success" ||
      setStatus.status === "success"
    ) {
      finish();
    }
  }, [deleteFamily.status, deleteMember.status, setStatus.status]);

  useEffect(() => {
    if (!setStatus.error) {
      return;
    }

    setConfirm(undefined);

    // Archiving is refused while the family has pending items: the dialog lists them (spec 042).
    if (setStatus.error instanceof FamilyHasPendingItems) {
      setBlockers(setStatus.error.blockers);
      return;
    }

    setNotice("GENERIC");
  }, [setStatus.error]);

  useEffect(() => {
    if (!deleteFamily.error) {
      return;
    }

    setConfirm(undefined);
    setNotice(
      deleteFamily.error instanceof FamilyHasRecords
        ? "DELETE_BLOCKED"
        : "GENERIC",
    );
  }, [deleteFamily.error]);

  useEffect(() => {
    if (!deleteMember.error) {
      return;
    }

    // Already removed elsewhere: the list is stale, reload it instead of failing.
    if (deleteMember.error instanceof FamilyNotFound) {
      finish();
      return;
    }

    setConfirm(undefined);
    setNotice("GENERIC");
  }, [deleteMember.error]);

  const isBusy =
    deleteFamily.isFetching || deleteMember.isFetching || setStatus.isFetching;

  function getMenuView(): MenuView | undefined {
    if (!menu) {
      return undefined;
    }

    if (menu.kind === "FAMILY") {
      return family.menuActionLabelKey
        ? {
            actionLabelKey: family.menuActionLabelKey,
            kind: "FAMILY" as const,
            secondaryLabelKey: family.menuSecondaryLabelKey,
            subtitle: family.familyName,
            titleKey: "family.card.options" as TranslationKeys,
          }
        : undefined;
    }

    return menu.member.actionLabelKey
      ? {
          actionLabelKey: menu.member.actionLabelKey,
          kind: "MEMBER" as const,
          subtitle: menu.member.displayName,
          titleKey: "family.card.memberOptions" as TranslationKeys,
        }
      : undefined;
  }

  function onFamilyOptions() {
    if (family.menuAction) {
      setMenu({ kind: "FAMILY" });
    }
  }

  function onMemberOptions(member: FamilyMemberUIModel) {
    if (member.action) {
      setMenu({ kind: "MEMBER", member });
    }
  }

  function onMenuAction() {
    if (!menu) {
      return;
    }

    if (menu.kind === "FAMILY") {
      setConfirm({
        kind: family.menuAction === "DELETE" ? "DELETE_FAMILY" : "LEAVE_FAMILY",
      });
    } else if (menu.member.action) {
      setConfirm({
        kind:
          menu.member.action === "REMOVE" ? "REMOVE_MEMBER" : "CANCEL_INVITE",
        member: menu.member,
      });
    }

    setMenu(undefined);
  }

  function onMenuSecondaryAction() {
    setConfirm({ kind: "ARCHIVE_FAMILY" });
    setMenu(undefined);
  }

  function onReactivate() {
    if (!isBusy) {
      setStatus.mutate({ id: family.familyId, status: FamilyStatus.ACTIVE });
    }
  }

  function onDeleteInline() {
    setConfirm({ kind: "DELETE_FAMILY" });
  }

  function onConfirm() {
    if (!confirm || isBusy) {
      return;
    }

    switch (confirm.kind) {
      case "ARCHIVE_FAMILY":
        setStatus.mutate({
          id: family.familyId,
          status: FamilyStatus.ARCHIVED,
        });
        break;
      case "DELETE_FAMILY":
        deleteFamily.mutate({ id: family.familyId });
        break;
      case "LEAVE_FAMILY":
        if (family.currentMember) {
          deleteMember.mutate({ id: family.currentMember.id });
        }
        break;
      default:
        deleteMember.mutate({ id: confirm.member.id });
    }
  }

  function onInviteMember() {
    router.push({
      params: { familyId: family.familyId, familyName: family.familyName },
      pathname: "/(app)/(modals)/family/add_new_family_member",
    } as never);
  }

  return {
    blockers,
    confirm,
    confirmCopy: confirm ? getConfirmCopy(confirm, family) : undefined,
    isBusy,
    menu: getMenuView(),
    notice,
    onCancelConfirm: () => setConfirm(undefined),
    onCloseBlockers: () => setBlockers(undefined),
    onCloseMenu: () => setMenu(undefined),
    onCloseNotice: () => setNotice(undefined),
    onConfirm,
    onDeleteInline,
    onFamilyOptions,
    onInviteMember,
    onMemberOptions,
    onMenuAction,
    onMenuSecondaryAction,
    onReactivate,
  };
}

export default useFamilyCardViewModel;
