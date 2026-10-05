import { FieldInvalid } from "@domain/entities/errors";

import { calendarDateToIso } from "./calendarDate";
import { mocks, setup } from "./mocks/TransactionModel.mocks";
import TransactionModel from "./TransactionModel";

it("SHOULD the TransactionModel has all params (value as a decimal string, date as an ISO string)", () => {
  const result = setup();

  expect(result).toHaveProperty("id", mocks.json.id);
  expect(result).toHaveProperty("category", mocks.json.category.name);
  expect(result).toHaveProperty("categoryId", mocks.json.categoryId);
  expect(result).toHaveProperty("accountId", mocks.json.accountId);
  expect(result).toHaveProperty("date", calendarDateToIso(mocks.json.date));
  expect(result).toHaveProperty("description", mocks.json.description);
  expect(result).toHaveProperty("owner", mocks.json.owner);
  expect(result).toHaveProperty("ownerId", mocks.json.ownerId);
  expect(result).toHaveProperty("type", mocks.json.type);
  expect(result).toHaveProperty("value", "100.00");
});

it("SHOULD fromJSON read the API payload: cents -> decimal string, date-only -> ISO, category name from the embedded summary", () => {
  const modelFromJson = TransactionModel.fromJSON({
    ...mocks.json,
    account: { icon: "bank", id: mocks.json.accountId, name: "Checking" },
    category: {
      icon: "cart",
      iconColor: "#2E7D32",
      id: mocks.json.categoryId,
      name: mocks.json.category.name,
    },
    createdAt: "2026-10-04T12:00:00.000Z",
    updatedAt: "2026-10-04T12:00:00.000Z",
  });

  expect(modelFromJson).toStrictEqual(setup());
});

it("SHOULD toJSON return the API shape (cents, date-only, category object)", () => {
  expect(setup().toJSON()).toStrictEqual(mocks.json);
});

it.each([
  [23490, "234.90"],
  [5, "0.05"],
  [100, "1.00"],
])("SHOULD render %i cents as %s", (cents, text) => {
  expect(TransactionModel.fromJSON({ ...mocks.json, value: cents }).value).toBe(
    text,
  );
});

it("SHOULD fall back to an empty category name WHEN the payload has no category", () => {
  expect(
    TransactionModel.fromJSON({ ...mocks.json, category: undefined }).category,
  ).toBe("");
});

it("SHOULD round-trip toJSON and fromJSON for a model that came from the API (repository cache)", () => {
  const model = setup();

  expect(TransactionModel.fromJSON(model.toJSON())).toStrictEqual(model);
});

it("SHOULD throw FieldInvalid WHEN the stored value text cannot be converted to cents", () => {
  const model = setup();
  model.value = "abc";

  expect(() => model.toJSON()).toThrow(FieldInvalid);
});
