import { ActivityEntryEntity } from "@domain/entities/activity/ActivityEntity";

import {
  resolveActivityTarget,
  targetOfEntry,
  targetOfItem,
} from "./activityTarget";

describe("resolveActivityTarget", () => {
  it.each([
    ["TRANSACTION", { modal: "add_new_transaction", params: { id: "e" } }],
    ["CARD_REFUND", { modal: "add_new_transaction", params: { id: "e" } }],
    ["TRANSFER", { modal: "add_new_transaction", params: { transferId: "e" } }],
    ["SPLIT", { modal: "add_new_transaction", params: { splitId: "e" } }],
    ["ACCOUNT", { modal: "add_new_account", params: { id: "e" } }],
    ["BALANCE_ADJUSTMENT", { modal: "add_new_account", params: { id: "e" } }],
    ["CREDIT_CARD", { modal: "add_new_credit_card", params: { id: "e" } }],
    ["CATEGORY", { modal: "add_new_category", params: { id: "e" } }],
    ["TAG", { modal: "add_new_tag", params: { id: "e" } }],
    ["ASSET", { path: "/investments/asset/e" }],
    ["FIXED_INCOME_TERMS", { path: "/investments/asset/e" }],
    ["INSTALLMENT_PLAN", { path: "/financial/cards" }],
    ["INVOICE_PAYMENT", { path: "/financial/cards" }],
    [
      "INCOME_SERIES",
      { modal: "investment_income", params: { seriesId: "e" } },
    ],
  ])("SHOULD open a %s", (entityType, expected) => {
    expect(
      resolveActivityTarget({ entityId: "e", entityType } as never),
    ).toEqual(expected);
  });

  it("SHOULD open a series by its first occurrence month", () => {
    expect(
      resolveActivityTarget({
        bookingDate: "2026-03-05",
        entityId: "r",
        entityType: "RECURRENCE",
      }),
    ).toEqual({
      modal: "add_new_transaction",
      params: { month: "2026-03", occurrenceNumber: "1", recurrenceId: "r" },
    });
  });

  it("SHOULD need the asset for an operation, an income AND a valuation", () => {
    expect(
      resolveActivityTarget({ entityId: "o", entityType: "OPERATION" }),
    ).toBeNull();
    expect(
      resolveActivityTarget({
        assetId: "a",
        entityId: "o",
        entityType: "OPERATION",
      }),
    ).toEqual({
      modal: "investment_operation",
      params: { assetId: "a", id: "o" },
    });
    expect(
      resolveActivityTarget({
        assetId: "a",
        entityId: "i",
        entityType: "INCOME",
      }),
    ).toEqual({
      modal: "investment_income",
      params: { assetId: "a", id: "i" },
    });
    expect(
      resolveActivityTarget({
        assetId: "a",
        entityId: "v",
        entityType: "VALUATION",
      }),
    ).toEqual({ path: "/investments/asset/a" });
  });

  it("SHOULD open nothing for an item without id OR a CSV import", () => {
    expect(
      resolveActivityTarget({ entityId: null, entityType: "TRANSACTION" }),
    ).toBeNull();
    expect(
      resolveActivityTarget({
        entityId: "x",
        entityType: "TRANSACTION_IMPORT",
      }),
    ).toBeNull();
  });
});

describe("targetOfEntry / targetOfItem", () => {
  const entry = {
    action: "CREATE",
    batch: false,
    entityId: "t-1",
    entityType: "TRANSACTION",
    itemExists: true,
    summary: { label: "x" },
  } as unknown as ActivityEntryEntity;

  it("SHOULD open an existing item AND never a delete, a missing item or a batch", () => {
    expect(targetOfEntry(entry)).toMatchObject({
      modal: "add_new_transaction",
    });
    expect(targetOfEntry({ ...entry, action: "DELETE" })).toBeNull();
    expect(targetOfEntry({ ...entry, itemExists: false })).toBeNull();
    expect(targetOfEntry({ ...entry, batch: true })).toBeNull();
  });

  it("SHOULD open a batch item, borrowing the asset of its entry", () => {
    const item = {
      action: "CREATE",
      bookingDate: null,
      entityId: "o-1",
      entityType: "OPERATION",
      itemExists: true,
    } as never;

    expect(targetOfItem(item, { assetId: "a-1" })).toEqual({
      modal: "investment_operation",
      params: { assetId: "a-1", id: "o-1" },
    });
    expect(
      targetOfItem({ ...(item as object), itemExists: false } as never, {}),
    ).toBeNull();
    expect(
      targetOfItem({ ...(item as object), action: "DELETE" } as never, {}),
    ).toBeNull();
  });
});
