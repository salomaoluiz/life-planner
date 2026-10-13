import FamilyMemberDTO from "@application/dto/familyMember/FamilyMemberDTO";
import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";
import { TranslationKeys } from "@presentation/i18n/types";

export type FamilyMemberAction = "CANCEL_INVITE" | "LEAVE" | "REMOVE";

export interface FamilyMemberViewer {
  isFamilyOwner: boolean;
  userId: string;
}

class FamilyMemberUIModel {
  get action(): FamilyMemberAction | undefined {
    // Nobody can act on the owner's row (the owner deletes the family instead).
    if (this.dto.role === FamilyMemberRole.OWNER) {
      return undefined;
    }

    if (this.viewer.isFamilyOwner) {
      return this.isPending ? "CANCEL_INVITE" : "REMOVE";
    }

    if (this.dto.userId && this.dto.userId === this.viewer.userId) {
      return "LEAVE";
    }

    return undefined;
  }

  get actionLabelKey(): TranslationKeys | undefined {
    switch (this.action) {
      case "CANCEL_INVITE":
        return "family.member.cancelInvite";
      case "LEAVE":
        return "family.member.leave";
      case "REMOVE":
        return "family.member.remove";
      default:
        return undefined;
    }
  }

  get avatar() {
    return this.dto.photoUrl
      ? { mode: "image" as const, source: this.dto.photoUrl }
      : { mode: "text" as const, source: this.displayName };
  }

  get displayName() {
    return this.dto.name ?? this.dto.email;
  }

  get id() {
    return this.dto.id;
  }

  get isPending() {
    return this.dto.status === FamilyMemberStatus.PENDING;
  }

  get statusLabelKey(): TranslationKeys | undefined {
    if (this.dto.role === FamilyMemberRole.OWNER) {
      return "family.member.role.owner";
    }

    if (this.isPending) {
      return this.dto.inviteExpired
        ? "family.member.status.expired"
        : "family.member.status.pending";
    }

    return undefined;
  }

  constructor(
    private readonly dto: FamilyMemberDTO,
    private readonly viewer: FamilyMemberViewer,
  ) {}
}

export default FamilyMemberUIModel;
