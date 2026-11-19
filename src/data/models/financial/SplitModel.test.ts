import SplitModel from "./SplitModel";
import TransactionModel from "./TransactionModel";

const json = {
  accountId: "acc-1",
  currency: "BRL",
  date: "2026-11-15",
  description: "Mercado",
  id: "split-1",
  notes: "Compra",
  occurrenceNumber: 2,
  owner: "USER",
  ownerId: "owner-1",
  paid: false,
  recurrenceId: "rec-1",
  total: 28000,
  type: "EXPENSE",
};

it("SHOULD map a split: cents to decimal text, calendar day to ISO, nulls to undefined", () => {
  const split = SplitModel.fromJSON({
    ...json,
    creditCardId: null,
    invoiceMonth: null,
  });

  expect(split).toEqual(
    expect.objectContaining({
      accountId: "acc-1",
      creditCardId: undefined,
      description: "Mercado",
      notes: "Compra",
      occurrenceNumber: 2,
      paid: false,
      recurrenceId: "rec-1",
      total: "280.00",
    }),
  );
  expect(split.date).toMatch(/^2026-11-15T/);
});

it("SHOULD map parts with their split lookup AND an empty parts list", () => {
  const response = {
    item: {
      ...json,
      parts: [
        {
          categoryId: "c",
          date: "2026-11-15",
          description: "Mercado",
          descriptionInherited: true,
          id: "row-1",
          owner: "USER",
          ownerId: "owner-1",
          splitId: "split-1",
          splitPosition: 0,
          type: "EXPENSE",
          value: 1000,
        },
      ],
    },
    lookups: {
      categories: { c: { name: "Mercearia" } },
      splits: {
        "split-1": {
          description: "Mercado",
          matchedCount: 1,
          matchedTotal: 1000,
          notes: "Compra",
          partCount: 6,
          total: 28000,
          type: "EXPENSE",
        },
      },
    },
  };
  const { parts } = SplitModel.fromResponse(response);

  expect(parts[0].category).toBe("Mercearia");
  expect(parts[0].descriptionInherited).toBe(true);
  expect(parts[0].splitPosition).toBe(0);
  expect(parts[0].split).toEqual(
    expect.objectContaining({
      matchedTotal: "10.00",
      notes: "Compra",
      partCount: 6,
      total: "280.00",
    }),
  );
  expect(SplitModel.fromResponse({ item: json, lookups: {} }).parts).toEqual(
    [],
  );
});

it("SHOULD keep a negative adjustment value through the cache round trip", () => {
  const adjustment = TransactionModel.fromJSON({
    categoryId: "adj",
    date: "2026-11-15",
    description: "Mercado",
    id: "row-2",
    owner: "USER",
    ownerId: "owner-1",
    splitId: "split-1",
    splitPosition: 2,
    type: "EXPENSE",
    value: -440,
  });

  expect(adjustment.value).toBe("-4.40");
  expect(adjustment.toJSON().value).toBe(-440);
  expect(adjustment.toJSON()).toEqual(
    expect.objectContaining({ splitId: "split-1", splitPosition: 2 }),
  );
  expect(TransactionModel.fromJSON(adjustment.toJSON()).value).toBe("-4.40");
});

it("SHOULD return the ordinary row of a dissolved update", () => {
  const result = SplitModel.fromUpdateResponse({
    dissolved: true,
    item: {
      categoryId: "c",
      date: "2026-11-15",
      description: "x",
      id: "row-1",
      owner: "USER",
      ownerId: "o",
      type: "EXPENSE",
      value: 100,
    },
    lookups: {},
  });

  expect(result.dissolved?.id).toBe("row-1");
  expect(result.result).toBeUndefined();
});
