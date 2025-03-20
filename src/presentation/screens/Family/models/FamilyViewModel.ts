import FamilyDTO from "@application/dto/family/FamilyDTO";
import FamilyMemberViewModel from "@screens/Family/models/FamilyMembersViewModel";

class FamilyViewModel {
  dto: FamilyDTO;
  familyMembers: FamilyMemberViewModel[];

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

  get owner() {
    return this.familyMembers.find(
      (member) => member.memberDto.userId === this.dto.ownerId,
    )!;
  }

  constructor(dto: FamilyDTO, familyMembers: FamilyMemberViewModel[]) {
    this.dto = dto;
    this.familyMembers = familyMembers;
  }
}

export default FamilyViewModel;
