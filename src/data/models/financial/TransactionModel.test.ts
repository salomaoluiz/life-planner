import { mocks, setup } from "./mocks/TransactionModel.mocks";
import TransactionModel from "./TransactionModel";

it("SHOULD the TransactionModel has all params", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("category", mocks.json.category);
  expect(result).toHaveProperty("date", mocks.json.date);
  expect(result).toHaveProperty("description", mocks.json.description);
  expect(result).toHaveProperty("owner", mocks.json.owner);
  expect(result).toHaveProperty("ownerId", mocks.json.owner_id);
  expect(result).toHaveProperty("type", mocks.json.type);
  expect(result).toHaveProperty("value", mocks.json.value);
});

it("SHOULD the TransactionModel fromJson create a new TransactionModel", () => {
  const modelFromJson = TransactionModel.fromJSON({
    category: mocks.json.category,
    date: mocks.json.date,
    description: mocks.json.description,
    id: mocks.json.id,
    owner: mocks.json.owner,
    owner_id: mocks.json.owner_id,
    type: mocks.json.type,
    value: mocks.json.value,
  });

  const expected = setup();

  expect(modelFromJson).toStrictEqual(expected);
});

it("SHOULD the TransactionModel toJson return a json", () => {
  const result = setup().toJSON();

  expect(result).toStrictEqual(mocks.json);
});
