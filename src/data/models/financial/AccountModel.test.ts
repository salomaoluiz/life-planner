import AccountModel from "./AccountModel";
import { mocks, setup } from "./mocks/AccountModel.mocks";

it("SHOULD the AccountModel has all params (balance as a decimal number)", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("balance", 1520.75);
  expect(result).toHaveProperty("icon", mocks.json.icon);
  expect(result).toHaveProperty("name", mocks.json.name);
  expect(result).toHaveProperty("owner", mocks.json.owner);
  expect(result).toHaveProperty("ownerId", mocks.json.ownerId);
  expect(result).toHaveProperty("status", mocks.json.status);
});

it("SHOULD fromJSON read the API camelCase JSON AND convert cents to the decimal balance", () => {
  const modelFromJson = AccountModel.fromJSON({
    ...mocks.json,
    createdAt: "2026-10-04T12:00:00.000Z",
    updatedAt: "2026-10-04T12:00:00.000Z",
  });

  expect(modelFromJson).toStrictEqual(setup());
});

it("SHOULD toJSON return the API shape with the balance in cents", () => {
  expect(setup().toJSON()).toStrictEqual(mocks.json);
});

it("SHOULD keep a negative balance exact in both directions", () => {
  const model = AccountModel.fromJSON({ ...mocks.json, balance: -5050 });

  expect(model.balance).toBe(-50.5);
  expect(model.toJSON().balance).toBe(-5050);
});

it("SHOULD round-trip toJSON and fromJSON (repository cache)", () => {
  const model = setup();

  expect(AccountModel.fromJSON(model.toJSON())).toStrictEqual(model);
});
