import { FieldInvalid } from "@domain/entities/errors";

import { calendarDateToIso } from "./calendarDate";
import { apiRecurringTransaction } from "./mocks/Recurrence.mocks";
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

it("SHOULD read the system category key and excludeFromTotals from the embedded category AND write them back", () => {
  const model = TransactionModel.fromJSON({
    ...mocks.json,
    category: {
      excludeFromTotals: true,
      name: "Balance adjustment",
      systemKey: "BALANCE_ADJUSTMENT",
    },
  });

  expect(model.systemKey).toBe("BALANCE_ADJUSTMENT");
  expect(model.excludeFromTotals).toBe(true);
  expect(model.toJSON().category).toEqual({
    excludeFromTotals: true,
    name: "Balance adjustment",
    systemKey: "BALANCE_ADJUSTMENT",
  });
});

it("SHOULD treat a regular category as not excluded and without a key", () => {
  const model = setup();

  expect(model.excludeFromTotals).toBe(false);
  expect(model.systemKey).toBeUndefined();
});

it("SHOULD read AND write the projected flag, false by default (spec 096)", () => {
  const projected = TransactionModel.fromJSON({
    ...mocks.json,
    projected: true,
  });

  expect(projected.projected).toBe(true);
  expect(projected.toJSON().projected).toBe(true);
  expect(TransactionModel.fromJSON(mocks.json).projected).toBe(false);
  expect(
    TransactionModel.fromLeanJSON({ ...mocks.json, projected: true }, {})
      .projected,
  ).toBe(true);
});

it("SHOULD read the paid status AND default to paid WHEN the API sends none (spec 033)", () => {
  const withStatus = TransactionModel.fromJSON({ ...mocks.json, paid: false });
  const withoutStatus = TransactionModel.fromJSON({
    ...mocks.json,
    paid: undefined,
  });

  expect(withStatus.paid).toBe(false);
  expect(withStatus.toJSON().paid).toBe(false);
  expect(withoutStatus.paid).toBe(true);
});

it("SHOULD read AND write the recurring series fields (spec 034)", () => {
  const model = TransactionModel.fromJSON(apiRecurringTransaction);

  expect(model).toMatchObject({
    occurrenceCount: 12,
    occurrenceNumber: 1,
    recurrenceFrequency: "MONTHLY",
    recurrenceId: "recurrence-1",
  });
  expect(model.toJSON()).toMatchObject({
    occurrenceCount: 12,
    occurrenceNumber: 1,
    recurrenceFrequency: "MONTHLY",
    recurrenceId: "recurrence-1",
  });
});

it("SHOULD leave the series fields empty outside a recurring series", () => {
  const model = TransactionModel.fromJSON({
    ...apiRecurringTransaction,
    occurrenceCount: null,
    occurrenceNumber: null,
    recurrenceFrequency: null,
    recurrenceId: null,
  });

  expect(model.recurrenceId).toBeUndefined();
  expect(model.toJSON()).toMatchObject({
    occurrenceCount: null,
    occurrenceNumber: null,
    recurrenceFrequency: null,
    recurrenceId: null,
  });
});

it("SHOULD read the currency of the API AND fall back to BRL WHEN it is missing", () => {
  const withoutCurrency: Record<string, unknown> = { ...mocks.json };

  delete withoutCurrency.currency;

  expect(
    TransactionModel.fromJSON({ ...mocks.json, currency: "USD" }).currency,
  ).toBe("USD");
  expect(TransactionModel.fromJSON(withoutCurrency).currency).toBe("BRL");
});

it("SHOULD read notes from the API and treat null as no note (spec 059)", () => {
  expect(
    TransactionModel.fromJSON({ ...mocks.json, notes: "Casa\nAeroporto" })
      .notes,
  ).toBe("Casa\nAeroporto");
  expect(
    TransactionModel.fromJSON({ ...mocks.json, notes: null }).notes,
  ).toBeUndefined();
  expect(
    TransactionModel.fromJSON({
      ...mocks.json,
      notes: "Casa",
    }).toJSON().notes,
  ).toBe("Casa");
});

describe("fromLeanJSON (spec 079)", () => {
  const lookups = {
    categories: {
      c1: { name: "Food" },
      c2: {
        excludeFromTotals: true,
        name: "Adjustment",
        systemKey: "BALANCE_ADJUSTMENT",
      },
    },
    tags: { g1: { name: "home" } },
  };
  const item = {
    accountId: "a1",
    categoryId: "c1",
    currency: "BRL",
    date: "2026-11-03",
    description: "Groceries",
    id: "t1",
    owner: "USER",
    ownerId: "u1",
    paid: true,
    tagIds: ["g1"],
    type: "EXPENSE",
    value: 1250,
  };

  it("SHOULD equal the model of the equivalent nested payload", () => {
    const nested = {
      ...item,
      category: { excludeFromTotals: false, name: "Food", systemKey: null },
      tags: [{ id: "g1", name: "home" }],
    };

    expect(TransactionModel.fromLeanJSON(item, lookups).toJSON()).toEqual(
      TransactionModel.fromJSON(nested).toJSON(),
    );
  });

  it("SHOULD read the system key and excludeFromTotals from the lookup", () => {
    const model = TransactionModel.fromLeanJSON(
      { ...item, categoryId: "c2" },
      lookups,
    );

    expect(model.excludeFromTotals).toBe(true);
    expect(model.systemKey).toBe("BALANCE_ADJUSTMENT");
  });

  it("SHOULD give no tags WHEN tagIds is absent AND an empty name WHEN the lookup is missing", () => {
    const noTags: Record<string, unknown> = { ...item };

    delete noTags.tagIds;

    expect(TransactionModel.fromLeanJSON(noTags, lookups).tags).toEqual([]);
    expect(
      TransactionModel.fromLeanJSON({ ...item, categoryId: "zz" }, lookups)
        .category,
    ).toBe("");
  });
});
