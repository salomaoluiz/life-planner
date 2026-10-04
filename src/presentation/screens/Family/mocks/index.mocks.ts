import FamilyDTO from "@application/dto/family/FamilyDTO";
import FamilyMemberDTO from "@application/dto/familyMember/FamilyMemberDTO";
import UserDTO from "@application/dto/user/UserDTO";
import FamilyMemberViewModel from "@screens/Family/models/FamilyMembersViewModel";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

const ownerUser = new UserDTO({
  email: "alice@example.test",
  id: "user-1",
  name: "Alice Test",
  photoUrl: "https://example.test/alice.png",
});

const familyDTO = new FamilyDTO({
  id: "family-1",
  name: "Test Family",
  ownerId: "user-1",
});

const ownerMemberDTO = new FamilyMemberDTO({
  email: "alice@example.test",
  familyId: "family-1",
  id: "member-1",
  userId: "user-1",
});

const invitedMemberDTO = new FamilyMemberDTO({
  email: "bob@example.test",
  familyId: "family-1",
  id: "member-2",
});

function makeFamilyViewModel() {
  return new FamilyViewModel(familyDTO, [
    new FamilyMemberViewModel(ownerMemberDTO, ownerUser),
    new FamilyMemberViewModel(invitedMemberDTO),
  ]);
}

export {
  familyDTO,
  invitedMemberDTO,
  makeFamilyViewModel,
  ownerMemberDTO,
  ownerUser,
};
