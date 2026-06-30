import AccountModel from "./AccountModel";
import { mocks, setup } from "./mocks/AccountModel.mocks";

it("SHOULD the AccountModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("balance", mocks.json.balance);
  expect(result).toHaveProperty("icon", mocks.json.icon);
  expect(result).toHaveProperty("name", mocks.json.name);
  expect(result).toHaveProperty("owner", mocks.json.owner);
  expect(result).toHaveProperty("ownerId", mocks.json.owner_id);
  expect(result).toHaveProperty("status", mocks.json.status);
});

it("SHOULD the AccountModel fromJson create a new AccountModel", () => {
  const modelFromJson = AccountModel.fromJSON({
    balance: mocks.json.balance,
    icon: mocks.json.icon,
    id: mocks.json.id,
    name: mocks.json.name,
    owner: mocks.json.owner,
    owner_id: mocks.json.owner_id,
    status: mocks.json.status,
  });

  const expected = setup();

  expect(modelFromJson).toStrictEqual(expected);
});

it("SHOULD the AccountModel toJson return a json", () => {
  const result = setup().toJSON();

  expect(result).toStrictEqual(mocks.json);
});
