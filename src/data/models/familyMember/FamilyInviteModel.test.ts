import { mocks, setup } from "./mocks/FamilyInviteModel.mocks";

it("SHOULD map all five fields in fromJSON", () => {
  expect(setup()).toEqual(mocks.json);
});

it("SHOULD round-trip through toJSON", () => {
  expect(setup().toJSON()).toEqual(mocks.json);
});
