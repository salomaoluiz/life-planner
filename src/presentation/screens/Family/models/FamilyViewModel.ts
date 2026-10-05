import FamilyDTO from "@application/dto/family/FamilyDTO";
import FamilyMemberUIModel from "@screens/Family/models/FamilyMemberUIModel";

class FamilyViewModel {
  dto: FamilyDTO;
  familyMembers: FamilyMemberUIModel[];

  get avatar() {
    return {
      mode: "text" as const,
      source: this.familyName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase(),
    };
  }

  get familyId() {
    return this.dto.id;
  }

  get familyName() {
    return this.dto.name;
  }

  constructor(dto: FamilyDTO, familyMembers: FamilyMemberUIModel[]) {
    this.dto = dto;
    this.familyMembers = familyMembers;
  }
}

export default FamilyViewModel;
