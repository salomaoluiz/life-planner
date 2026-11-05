import TransactionDTO from "@application/dto/financial/TransactionDTO";

import {
  buildPaidRow,
  buildPayParams,
  dateChoices,
  differenceCents,
  isValidPayment,
  overdueDays,
  resolveDate,
} from "./confirmPayState";

const TODAY = new Date(2026, 10, 4);

function row(
  overrides: Partial<ConstructorParameters<typeof TransactionDTO>[0]> = {},
) {
  return new TransactionDTO({
    category: "Home",
    categoryId: "category-id",
    date: new Date(2026, 9, 28).toISOString(),
    description: "Conta de luz",
    id: "transaction-id",
    owner: "USER",
    ownerId: "owner-id",
    paid: false,
    type: "EXPENSE",
    value: "184.20",
    ...overrides,
  });
}

describe("dateChoices", () => {
  it("offers every choice for an older date", () => {
    expect(dateChoices(new Date(2026, 10, 1), TODAY)).toEqual([
      "transaction",
      "today",
      "yesterday",
      "other",
    ]);
  });

  it("hides only the duplicate Today when the transaction is today", () => {
    expect(dateChoices(TODAY, TODAY)).toEqual([
      "transaction",
      "yesterday",
      "other",
    ]);
  });

  it("hides Yesterday when the transaction is yesterday", () => {
    expect(dateChoices(new Date(2026, 10, 3), TODAY)).toEqual([
      "transaction",
      "today",
      "other",
    ]);
  });
});

describe("resolveDate", () => {
  const iso = row().date;

  it("keeps the transaction date untouched", () => {
    expect(resolveDate("transaction", iso, undefined, TODAY)).toBe(iso);
  });

  it("uses today, yesterday and the picked date", () => {
    expect(resolveDate("today", iso, undefined, TODAY)).toBe(
      TODAY.toISOString(),
    );
    expect(resolveDate("yesterday", iso, undefined, TODAY)).toBe(
      new Date(2026, 10, 3).toISOString(),
    );
    const other = new Date(2026, 10, 1);

    expect(resolveDate("other", iso, other, TODAY)).toBe(other.toISOString());
  });
});

describe("overdueDays", () => {
  it("counts the days before today", () => {
    expect(overdueDays(new Date(2026, 9, 28), TODAY)).toBe(7);
  });

  it("is 0 for today and future dates", () => {
    expect(overdueDays(TODAY, TODAY)).toBe(0);
    expect(overdueDays(new Date(2026, 10, 9), TODAY)).toBe(0);
  });
});

describe("differenceCents / isValidPayment", () => {
  it("subtracts the entered value from the original", () => {
    expect(differenceCents(19175, 18420)).toBe(755);
  });

  it("only accepts a positive value", () => {
    expect(isValidPayment(0)).toBe(false);
    expect(isValidPayment(1)).toBe(true);
  });
});

describe("buildPayParams", () => {
  const dateIso = new Date(2026, 9, 28).toISOString();

  it("sends only paid and date when the value is the same", () => {
    expect(
      buildPayParams(row({ recurrenceId: "series-id" }), {
        cents: 18420,
        dateIso,
      }),
    ).toEqual({
      date: dateIso,
      id: "transaction-id",
      ownerId: "owner-id",
      paid: true,
    });
  });

  it("adds value and ONLY_THIS scope for a recurring occurrence", () => {
    expect(
      buildPayParams(row({ recurrenceId: "series-id" }), {
        cents: 19175,
        dateIso,
      }),
    ).toEqual({
      date: dateIso,
      id: "transaction-id",
      ownerId: "owner-id",
      paid: true,
      scope: "ONLY_THIS",
      value: "191.75",
    });
  });

  it("sends no scope for a non recurring row", () => {
    const params = buildPayParams(row(), { cents: 19175, dateIso });

    expect(params.value).toBe("191.75");
    expect(params.scope).toBeUndefined();
  });
});

describe("buildPaidRow", () => {
  it("returns the row as paid with the new value and date", () => {
    const dateIso = new Date(2026, 10, 4).toISOString();
    const paid = buildPaidRow(row(), { cents: 19175, dateIso });

    expect(paid).toMatchObject({
      date: dateIso,
      id: "transaction-id",
      paid: true,
      value: "191.75",
    });
  });
});
