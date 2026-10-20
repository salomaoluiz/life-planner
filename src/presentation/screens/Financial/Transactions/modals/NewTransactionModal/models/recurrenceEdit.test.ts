import { TransactionType } from "@domain/entities/financial/TransactionEntity";

import {
  buildRecurringSave,
  lockedHelperKey,
  recurrenceLocks,
  RecurringContext,
} from "./recurrenceEdit";
import { TransactionFormState } from "./transactionFormState";

const initial: TransactionFormState = {
  accountId: "account-1",
  amountCents: 200000,
  categoryId: "rent",
  date: new Date(2026, 9, 5),
  description: "Rent",
  installmentsCount: 2,
  installmentsOn: false,
  originalPaid: false,
  ownerId: "user-id",
  paid: false,
  paidTouched: true,
  payWith: "ACCOUNT",
  repeatEnd: new Date(2027, 8, 5),
  repeatFrequency: "MONTHLY",
  repeatOn: true,
  tags: [],
  type: TransactionType.EXPENSE,
};
const real: RecurringContext = {
  isCard: false,
  isProjected: false,
  occurrenceNumber: 5,
  recurrenceId: "series-1",
  transactionId: "t-5",
};

describe("recurrenceLocks", () => {
  it.each([
    [
      "ONLY_THIS",
      {
        account: true,
        date: false,
        endDate: true,
        frequency: true,
        paid: false,
      },
    ],
    [
      "THIS_AND_NEXT",
      {
        account: false,
        date: true,
        endDate: false,
        frequency: false,
        paid: true,
      },
    ],
    [
      "ALL",
      {
        account: true,
        date: true,
        endDate: false,
        frequency: true,
        paid: true,
      },
    ],
  ] as const)("SHOULD lock the right fields for %s (FR 20)", (scope, locks) => {
    expect(recurrenceLocks(scope)).toEqual(locks);
  });

  it("SHOULD explain a locked field AND say nothing for an editable one", () => {
    expect(lockedHelperKey(true, "frequency")).toBe(
      "financial.recurrence.lockedThisAndNext",
    );
    expect(lockedHelperKey(true, "endDate")).toBe(
      "financial.recurrence.lockedAll",
    );
    expect(lockedHelperKey(true, "date")).toBe(
      "financial.recurrence.lockedOnlyThis",
    );
    expect(lockedHelperKey(false, "date")).toBeUndefined();
  });
});

describe("buildRecurringSave - only this one", () => {
  it("SHOULD do nothing WHEN nothing changed", () => {
    expect(buildRecurringSave("ONLY_THIS", initial, initial, real)).toEqual({
      kind: "none",
    });
  });

  it("SHOULD update the real row with scope ONLY_THIS sending only the changed fields", () => {
    const result = buildRecurringSave(
      "ONLY_THIS",
      { ...initial, amountCents: 220000, description: " Rent March " },
      initial,
      real,
    );

    expect(result).toEqual({
      kind: "update-transaction",
      params: {
        categoryId: undefined,
        date: undefined,
        description: "Rent March",
        id: "t-5",
        paid: undefined,
        scope: "ONLY_THIS",
        value: "2200.00",
      },
    });
  });

  it("SHOULD send the paid status AND the new date together", () => {
    const result = buildRecurringSave(
      "ONLY_THIS",
      { ...initial, date: new Date(2026, 9, 20), paid: true },
      initial,
      real,
    );

    expect(result).toMatchObject({
      kind: "update-transaction",
      params: { date: new Date(2026, 9, 20).toISOString(), paid: true },
    });
  });

  it("SHOULD materialize a projected occurrence with its number", () => {
    const result = buildRecurringSave(
      "ONLY_THIS",
      { ...initial, categoryId: "other" },
      initial,
      { ...real, isProjected: true, transactionId: undefined },
    );

    expect(result).toEqual({
      kind: "materialize",
      params: {
        categoryId: "other",
        date: undefined,
        description: undefined,
        occurrenceNumber: 5,
        paid: undefined,
        recurrenceId: "series-1",
        value: undefined,
      },
    });
  });

  it("SHOULD NOT send a paid status for a card occurrence", () => {
    const result = buildRecurringSave(
      "ONLY_THIS",
      { ...initial, paid: true, payWith: "CARD" },
      initial,
      { ...real, isCard: true },
    );

    expect(result).toEqual({ kind: "none" });
  });
});

describe("buildRecurringSave - this and the next ones", () => {
  it("SHOULD split at the occurrence sending only what changed (value, frequency, account, end date)", () => {
    const result = buildRecurringSave(
      "THIS_AND_NEXT",
      {
        ...initial,
        accountId: "account-2",
        amountCents: 220000,
        repeatEnd: undefined,
        repeatFrequency: "WEEKLY",
      },
      initial,
      real,
    );

    expect(result).toEqual({
      kind: "split",
      params: {
        accountId: "account-2",
        categoryId: undefined,
        creditCardId: undefined,
        description: undefined,
        endDate: null,
        frequency: "WEEKLY",
        occurrenceNumber: 5,
        recurrenceId: "series-1",
        value: "2200.00",
      },
    });
  });

  it("SHOULD send the card of a card series AND an end date as a date", () => {
    const result = buildRecurringSave(
      "THIS_AND_NEXT",
      {
        ...initial,
        creditCardId: "card-2",
        payWith: "CARD",
        repeatEnd: new Date(2028, 0, 5),
      },
      { ...initial, creditCardId: "card-1", payWith: "CARD" },
      { ...real, isCard: true },
    );

    expect(result).toMatchObject({
      kind: "split",
      params: {
        accountId: undefined,
        creditCardId: "card-2",
        endDate: new Date(2028, 0, 5).toISOString(),
      },
    });
  });

  it("SHOULD do nothing WHEN nothing changed", () => {
    expect(buildRecurringSave("THIS_AND_NEXT", initial, initial, real)).toEqual(
      {
        kind: "none",
      },
    );
  });
});

describe("buildRecurringSave - all", () => {
  it("SHOULD update the series with text, value and end date", () => {
    const result = buildRecurringSave(
      "ALL",
      { ...initial, amountCents: 1, description: "New", repeatEnd: undefined },
      initial,
      real,
    );

    expect(result).toEqual({
      kind: "update-series",
      params: {
        categoryId: undefined,
        description: "New",
        endDate: null,
        id: "series-1",
        value: "0.01",
      },
    });
  });

  it("SHOULD ignore a frequency change AND do nothing WHEN nothing changed", () => {
    expect(
      buildRecurringSave(
        "ALL",
        { ...initial, repeatFrequency: "WEEKLY" },
        initial,
        real,
      ),
    ).toEqual({ kind: "none" });
  });
});
