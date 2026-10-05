import FamilyDTO from "@application/dto/family/FamilyDTO";
import { TranslationKeys } from "@presentation/i18n/types";

import FamilyMemberUIModel, { FamilyMemberViewer } from "./FamilyMemberUIModel";

export type FamilyMenuAction = "DELETE" | "LEAVE";

class FamilyViewModel {
  // Legacy, kept until Task 3 replaces FamilyCard.
  get avatar() {
    return {
      mode: "text" as const,
      source: this.dto.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase(),
    };
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

  get isOwner() {
    return this.viewer.isFamilyOwner;
  }

  get joinedCount() {
    return this.familyMembers.filter((member) => !member.isPending).length;
  }

  // Owner: delete the family. Member: leave (needs their own row to delete).
  get menuAction(): FamilyMenuAction | undefined {
    if (this.isOwner) {
      return "DELETE";
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
        ? "family.card.membersOwnerYou"
        : "family.card.membersOwner",
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
