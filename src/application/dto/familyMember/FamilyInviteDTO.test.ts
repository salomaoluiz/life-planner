import { mocks, setupFromEntity } from "./mocks/FamilyInviteDTO.mocks";

it("SHOULD copy every field from the entity", () => {
  expect(setupFromEntity()).toEqual({ ...mocks.entity });
});
