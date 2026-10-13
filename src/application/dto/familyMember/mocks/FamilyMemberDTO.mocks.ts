import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";
import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";

import FamilyMemberDTO, { IFamilyMemberDTO } from "../FamilyMemberDTO";

// region mocks
const defaultProps: IFamilyMemberDTO = {
  email: "test@example.com",
  familyId: "4be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
  id: "4be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
  inviteExpired: false,
  joinedAt: new Date(2025, 1, 1),
  name: "Test Member",
  photoUrl: "https://example.test/p.png",
  role: FamilyMemberRole.OWNER,
  status: FamilyMemberStatus.JOINED,
  userId: "4be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
};

const defaultFamilyMemberEntity = new FamilyMemberEntity({ ...defaultProps });

const pendingEntity = new FamilyMemberEntity({
  email: "pending@example.com",
  familyId: defaultProps.familyId,
  id: "pending-id",
  inviteExpired: true,
  role: FamilyMemberRole.MEMBER,
  status: FamilyMemberStatus.PENDING,
});
// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setupFromEntity(
  entity: FamilyMemberEntity = defaultFamilyMemberEntity,
) {
  return FamilyMemberDTO.fromEntity(entity);
}

const spies = {};

const mocks = {
  defaultProps,
  pendingEntity,
};

export { mocks, setupFromEntity, spies };
