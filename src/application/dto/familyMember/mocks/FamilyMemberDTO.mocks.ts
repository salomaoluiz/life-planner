import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";

import FamilyMemberDTO, { IFamilyMemberDTO } from "../FamilyMemberDTO";

// region mocks
const defaultProps: IFamilyMemberDTO = {
  email: "teste@gmail.com",
  familyId: "4be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
  id: "4be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
  joinedAt: new Date(2025, 1, 1),
  userId: "4be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
};

const defaultFamilyMemberEntity = new FamilyMemberEntity({
  email: defaultProps.email,
  familyId: defaultProps.familyId,
  id: defaultProps.id,
  joinedAt: defaultProps.joinedAt,
  userId: defaultProps.userId,
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
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setupFromEntity, spies };
