import FamilyMemberDTO from "@application/dto/familyMember/FamilyMemberDTO";
import UserDTO from "@application/dto/user/UserDTO";

class FamilyMemberViewModel {
  memberDto: FamilyMemberDTO;
  userDto?: UserDTO;

  get acceptedInvite() {
    return this.memberDto.userId === this.userDto?.id;
  }

  get avatar() {
    const userAvatar = this.userDto?.photoUrl;

    return {
      mode: userAvatar ? ("image" as const) : ("text" as const),
      source: userAvatar ?? this.familyMemberName,
    };
  }

  get familyMemberName() {
    return this.userDto?.name ?? this.memberDto.email;
  }

  constructor(memberDto: FamilyMemberDTO, userDto?: UserDTO) {
    this.memberDto = memberDto;
    this.userDto = userDto;
  }
}

export default FamilyMemberViewModel;
