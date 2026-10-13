import FamilyInviteDTO from "@application/dto/familyMember/FamilyInviteDTO";

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

  constructor(private readonly dto: FamilyInviteDTO) {}
}

export default InviteUIModel;
