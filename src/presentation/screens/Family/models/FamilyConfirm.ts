import { TranslationKeys } from "@presentation/i18n/types";

import FamilyMemberUIModel from "./FamilyMemberUIModel";
import FamilyViewModel from "./FamilyViewModel";

export type FamilyConfirm =
  | { kind: "ARCHIVE_FAMILY" | "DELETE_FAMILY" | "LEAVE_FAMILY" }
  | { kind: "CANCEL_INVITE" | "REMOVE_MEMBER"; member: FamilyMemberUIModel };

export function getConfirmCopy(
  confirm: FamilyConfirm,
  family: FamilyViewModel,
): {
  confirmLabelKey: TranslationKeys;
  messageKey: TranslationKeys;
  params: Record<string, string>;
  titleKey: TranslationKeys;
} {
  switch (confirm.kind) {
    case "ARCHIVE_FAMILY":
      return {
        confirmLabelKey: "family.archive.confirm",
        messageKey: "family.archive.message",
        params: {},
        titleKey: "family.archive.title",
      };
    case "CANCEL_INVITE":
      return {
        confirmLabelKey: "family.member.cancelInvite",
        messageKey: "family.cancelInvite.message",
        params: { email: confirm.member.email },
        titleKey: "family.cancelInvite.title",
      };
    case "DELETE_FAMILY":
      return {
        confirmLabelKey: "family.delete.confirm",
        messageKey: "family.delete.message",
        params: { name: family.familyName },
        titleKey: "family.delete.title",
      };
    case "LEAVE_FAMILY":
      return {
        confirmLabelKey: "family.member.leave",
        messageKey: "family.leave.message",
        params: { name: family.familyName },
        titleKey: "family.leave.title",
      };
    case "REMOVE_MEMBER":
      return {
        confirmLabelKey: "family.member.remove",
        messageKey: "family.removeMember.message",
        params: { name: confirm.member.displayName },
        titleKey: "family.removeMember.title",
      };
  }
}
