import FamilyDTO from "@application/dto/family/FamilyDTO";
import FamilyMemberDTO, {
  IFamilyMemberDTO,
} from "@application/dto/familyMember/FamilyMemberDTO";
import UserDTO from "@application/dto/user/UserDTO";
import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";
import FamilyMemberUIModel, {
  FamilyMemberViewer,
} from "@screens/Family/models/FamilyMemberUIModel";
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

function memberDTO(overrides: Partial<IFamilyMemberDTO> = {}) {
  return new FamilyMemberDTO({
    email: "alice@example.test",
    familyId: "family-1",
    id: "member-1",
    inviteExpired: false,
    name: "Alice Test",
    photoUrl: "https://example.test/alice.png",
    role: FamilyMemberRole.OWNER,
    status: FamilyMemberStatus.JOINED,
    userId: "user-1",
    ...overrides,
  });
}

const ownerMemberDTO = memberDTO();
const joinedMemberDTO = memberDTO({
  email: "bob@example.test",
  id: "member-2",
  name: "Bob Test",
  photoUrl: undefined,
  role: FamilyMemberRole.MEMBER,
  status: FamilyMemberStatus.JOINED,
  userId: "user-2",
});
const invitedMemberDTO = memberDTO({
  email: "carol@example.test",
  id: "member-3",
  name: undefined,
  photoUrl: undefined,
  role: FamilyMemberRole.MEMBER,
  status: FamilyMemberStatus.PENDING,
  userId: undefined,
});

const ownerViewer: FamilyMemberViewer = {
  isFamilyOwner: true,
  userId: "user-1",
};

function familyNamed(id: string, name: string) {
  return new FamilyViewModel(
    new FamilyDTO({ id, name, ownerId: "user-1" }),
    [],
    ownerViewer,
  );
}

function makeFamilyViewModel(viewer: FamilyMemberViewer = ownerViewer) {
  return new FamilyViewModel(
    familyDTO,
    [
      new FamilyMemberUIModel(ownerMemberDTO, viewer),
      new FamilyMemberUIModel(joinedMemberDTO, viewer),
      new FamilyMemberUIModel(invitedMemberDTO, viewer),
    ],
    viewer,
  );
}

export {
  familyDTO,
  familyNamed,
  invitedMemberDTO,
  joinedMemberDTO,
  makeFamilyViewModel,
  memberDTO,
  ownerMemberDTO,
  ownerUser,
  ownerViewer,
};
