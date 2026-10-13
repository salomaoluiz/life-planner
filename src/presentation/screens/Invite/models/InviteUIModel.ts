import FamilyInviteDTO from "@application/dto/familyMember/FamilyInviteDTO";
import { getAvatarTone } from "@components";

class InviteUIModel {
  get canAccept() {
    return this.dto.emailMatches;
  }

  get email() {
    return this.dto.email;
  }

  get familyName() {
    return this.dto.familyName;
  }

  get initial() {
    return Array.from(this.dto.familyName.trim())[0]?.toUpperCase() ?? "";
  }

  get tone() {
    return getAvatarTone(this.dto.familyName);
  }

  constructor(private readonly dto: FamilyInviteDTO) {}
}

export default InviteUIModel;
