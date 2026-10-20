import FamilyDTO from "@application/dto/family/FamilyDTO";
import pluralKey from "@presentation/i18n/pluralKey";
import { TranslationKeys } from "@presentation/i18n/types";

import FamilyMemberUIModel, { FamilyMemberViewer } from "./FamilyMemberUIModel";

export type FamilyMenuAction = "DELETE" | "LEAVE";

class FamilyViewModel {
  // Archived: read-only for everyone, history stays viewable (spec 042).
  get canArchive() {
    return this.isOwner && !this.isArchived;
  }

  get canInvite() {
    return this.isOwner && !this.isArchived;
  }

  get canReactivate() {
    return this.isOwner && this.isArchived;
  }

  get currentMember() {
    return this.familyMembers.find((member) => member.isCurrentUser);
  }

  get familyId() {
    return this.dto.id;
  }

  get familyName() {
    return this.dto.name;
  }

  // One user-perceived character (emoji safe), upper case.
  get initial() {
    return Array.from(this.dto.name.trim())[0]?.toUpperCase() ?? "";
  }

  get isArchived() {
    return this.dto.isArchived;
  }

  get isOwner() {
    return this.viewer.isFamilyOwner;
  }

  get joinedCount() {
    return this.familyMembers.filter((member) => !member.isPending).length;
  }

  // Owner: delete the family (an archived one shows Reactivate / Delete inline instead of the menu).
  // Member: leave (needs their own row to delete).
  get menuAction(): FamilyMenuAction | undefined {
    if (this.isOwner) {
      return this.isArchived ? undefined : "DELETE";
    }

    return this.currentMember ? "LEAVE" : undefined;
  }

  get menuActionLabelKey(): TranslationKeys | undefined {
    switch (this.menuAction) {
      case "DELETE":
        return "family.delete.confirm";
      case "LEAVE":
        return "family.member.leave";
      default:
        return undefined;
    }
  }

  // The owner of an active family can archive it from the same menu.
  get menuSecondaryLabelKey(): TranslationKeys | undefined {
    return this.canArchive ? "family.archive.action" : undefined;
  }

  get ownerName() {
    return (
      this.familyMembers.find((member) => member.isOwner)?.displayName ?? ""
    );
  }

  get subtitle(): {
    key: TranslationKeys;
    params: { count: number; name: string };
  } {
    return {
      key: this.isOwner
        ? pluralKey("family.card.membersOwnerYou", this.joinedCount)
        : pluralKey("family.card.membersOwner", this.joinedCount),
      params: { count: this.joinedCount, name: this.ownerName },
    };
  }

  constructor(
    private readonly dto: FamilyDTO,
    readonly familyMembers: FamilyMemberUIModel[],
    private readonly viewer: FamilyMemberViewer,
  ) {}
}

export default FamilyViewModel;
