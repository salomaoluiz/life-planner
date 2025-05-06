import FamilyMemberDTO from "@application/dto/familyMember/FamilyMemberDTO";

import { mocks, setupFromEntity } from "./mocks/FamilyMemberDTO.mocks";

it("SHOULD render correctly from entity", () => {
  const result = setupFromEntity();

  expect(result).toEqual(
    new FamilyMemberDTO({
      email: mocks.defaultProps.email,
      familyId: mocks.defaultProps.familyId,
      id: mocks.defaultProps.id,
      joinedAt: mocks.defaultProps.joinedAt,
      userId: mocks.defaultProps.userId,
    }),
  );
});
