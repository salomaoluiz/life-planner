import FamilyMemberModel from "./FamilyMemberModel";
import { mocks, setup } from "./mocks/FamilyMemberModel.mocks";

it("SHOULD map the API JSON (camelCase) in fromJSON", () => {
  expect(FamilyMemberModel.fromJSON(mocks.json)).toStrictEqual(setup());
});

it("SHOULD turn null columns into undefined (pending row)", () => {
  const model = FamilyMemberModel.fromJSON(mocks.pendingJson);

  expect(model.joinedAt).toBeUndefined();
  expect(model.user).toBeUndefined();
  expect(model.userId).toBeUndefined();
  expect(model.inviteExpired).toBe(true);
});

it("SHOULD map a null photoUrl to undefined", () => {
  expect(FamilyMemberModel.fromJSON(mocks.json).user).toEqual({
    name: "Test Owner",
    photoUrl: undefined,
  });
});

it("SHOULD round-trip toJSON → fromJSON (the cache stores toJSON)", () => {
  const model = setup();

  expect(FamilyMemberModel.fromJSON(model.toJSON())).toStrictEqual(model);

  const pending = FamilyMemberModel.fromJSON(mocks.pendingJson);
  expect(FamilyMemberModel.fromJSON(pending.toJSON())).toStrictEqual(pending);
});

it("SHOULD NEVER carry a token field", () => {
  expect(Object.keys(setup().toJSON()).join()).not.toMatch(/token/i);
});
