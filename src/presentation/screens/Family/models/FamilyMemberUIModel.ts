import FamilyMemberDTO from "@application/dto/familyMember/FamilyMemberDTO";
import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";
import { TranslationKeys } from "@presentation/i18n/types";

export type FamilyMemberAction = "CANCEL_INVITE" | "REMOVE";

export interface FamilyMemberViewer {
  isFamilyOwner: boolean;
  userId: string;
}

class FamilyMemberUIModel {
  // Only the owner acts on rows, never on the owner's own row. Leaving is a card-menu action.
  get action(): FamilyMemberAction | undefined {
    if (this.isOwner || !this.viewer.isFamilyOwner) {
      return undefined;
    }

    return this.isPending ? "CANCEL_INVITE" : "REMOVE";
  }

  get actionLabelKey(): TranslationKeys | undefined {
    switch (this.action) {
      case "CANCEL_INVITE":
        return "family.member.cancelInvite";
      case "REMOVE":
        return "family.member.remove";
      default:
        return undefined;
    }
  }

  get avatar() {
    return { name: this.displayName, photoUrl: this.photoUrl };
  }

  get displayName() {
    return this.dto.name ?? this.dto.email;
  }

  get email() {
    return this.dto.email;
  }

  get id() {
    return this.dto.id;
  }

  get isCurrentUser() {
    return !!this.dto.userId && this.dto.userId === this.viewer.userId;
  }

  get isOwner() {
    return this.dto.role === FamilyMemberRole.OWNER;
  }

  get isPending() {
    return this.dto.status === FamilyMemberStatus.PENDING;
  }

  get photoUrl() {
    const { photoUrl } = this.dto;

    return photoUrl && photoUrl.length > 0 ? photoUrl : undefined;
  }

  get statusLabelKey(): TranslationKeys | undefined {
    if (this.isOwner) {
      return "family.member.role.owner";
    }

    if (this.isPending) {
      return this.dto.inviteExpired
        ? "family.member.status.expired"
        : "family.member.status.pending";
    }

    return undefined;
  }

  get statusTone(): "accent" | "expense" | "neutral" | undefined {
    if (this.isOwner) {
      return "neutral";
    }

    if (this.isPending) {
      return this.dto.inviteExpired ? "expense" : "accent";
    }

    return undefined;
  }

  constructor(
    private readonly dto: FamilyMemberDTO,
    private readonly viewer: FamilyMemberViewer,
  ) {}
}

export default FamilyMemberUIModel;
