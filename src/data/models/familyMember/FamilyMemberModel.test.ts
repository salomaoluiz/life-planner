import FamilyMemberModel from "./FamilyMemberModel";
import { mocks, setup } from "./mocks/FamilyMemberModel.mocks";

it("SHOULD the FamilyMemberModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("email", mocks.json.email);
  expect(result).toHaveProperty("familyId", mocks.json.family_id);
  expect(result).toHaveProperty("inviteToken", mocks.json.invite_token);
  expect(result).toHaveProperty("joinDate", mocks.json.join_date);
  expect(result).toHaveProperty("userId", mocks.json.user_id);
});

it("SHOULD the FamilyMemberModel fromJson create a new FamilyMemberModel", () => {
  const modelFromJson = FamilyMemberModel.fromJSON({
    email: mocks.json.email,
    family_id: mocks.json.family_id,
    id: mocks.json.id,
    invite_token: mocks.json.invite_token,
    join_date: mocks.json.join_date,
    user_id: mocks.json.user_id,
  });

  const expected = setup();

  expect(modelFromJson).toStrictEqual(expected);
});

it("SHOULD the FamilyMemberModel toJson return a json", () => {
  const result = setup().toJSON();

  expect(result).toStrictEqual(mocks.json);
});
