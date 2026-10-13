import FamilyMemberDTO from "@application/dto/familyMember/FamilyMemberDTO";
import { FamilyMemberStatus } from "@domain/entities/familyMember/FamilyMemberEnums";

import { mocks, setupFromEntity } from "./mocks/FamilyMemberDTO.mocks";

it("SHOULD render correctly from entity", () => {
  const result = setupFromEntity();

  expect(result).toEqual(new FamilyMemberDTO(mocks.defaultProps));
});

it("SHOULD map a pending entity with undefined optional fields", () => {
  const result = setupFromEntity(mocks.pendingEntity);

  expect(result.status).toBe(FamilyMemberStatus.PENDING);
  expect(result.inviteExpired).toBe(true);
  expect(result.name).toBeUndefined();
  expect(result.photoUrl).toBeUndefined();
  expect(result.userId).toBeUndefined();
  expect(result.joinedAt).toBeUndefined();
});
