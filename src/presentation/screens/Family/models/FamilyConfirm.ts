import { TranslationKeys } from "@presentation/i18n/types";

import FamilyMemberUIModel from "./FamilyMemberUIModel";
import FamilyViewModel from "./FamilyViewModel";

export type FamilyConfirm =
  | { kind: "CANCEL_INVITE" | "REMOVE_MEMBER"; member: FamilyMemberUIModel }
  | { kind: "DELETE_FAMILY" | "LEAVE_FAMILY" };

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
