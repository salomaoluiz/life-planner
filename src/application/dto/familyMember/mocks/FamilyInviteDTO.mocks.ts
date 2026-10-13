import FamilyInviteEntity from "@domain/entities/familyMember/FamilyInviteEntity";

import FamilyInviteDTO from "../FamilyInviteDTO";

// region mocks
const entity = new FamilyInviteEntity({
  email: "test@example.com",
  emailMatches: true,
  familyId: "family-1",
  familyName: "Test Family",
  inviteExpiresAt: new Date("2026-10-11T12:00:00.000Z"),
});
// endregion mocks

function setupFromEntity() {
  return FamilyInviteDTO.fromEntity(entity);
}

const spies = {};
const mocks = { entity };

export { mocks, setupFromEntity, spies };
