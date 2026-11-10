import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";

import TransactionUIModel from "./TransactionUIModel";

function dto(
  overrides: Partial<ConstructorParameters<typeof TransactionDTO>[0]> = {},
) {
  return new TransactionDTO({
    accountId: "account-id",
    accountName: "Checking",
    category: "Food",
    categoryId: "cat-1",
    categoryName: "Groceries",
    date: new Date(2026, 8, 30).toISOString(),
    description: "Weekly shop",
    id: "tx-1",
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    value: "312.90",
    ...overrides,
  });
}

const category = new CategoryDTO({
  icon: "cart",
  iconColor: "#3B82F6",
  id: "cat-1",
  name: "Groceries",
  owner: "USER",
  ownerId: "user-id",
  type: "EXPENSE",
});

it("SHOULD convert the decimal value to integer cents", () => {
  expect(new TransactionUIModel(dto()).amountCents).toBe(31290);
  expect(new TransactionUIModel(dto({ value: "0.05" })).amountCents).toBe(5);
});

it("SHOULD sign expenses negative and incomes positive", () => {
  expect(new TransactionUIModel(dto()).signedCents).toBe(-31290);
  expect(new TransactionUIModel(dto({ type: "INCOME" })).signedCents).toBe(
    31290,
  );
});

it("SHOULD expose the type for AmountText and isExpense", () => {
  const model = new TransactionUIModel(dto({ type: "INCOME" }));

  expect(model.amountType).toBe("INCOME");
  expect(model.isExpense).toBe(false);
});

it("SHOULD build the subtitle from category and account", () => {
  expect(new TransactionUIModel(dto()).subtitle).toBe("Groceries · Checking");
  expect(new TransactionUIModel(dto({ accountName: undefined })).subtitle).toBe(
    "Groceries",
  );
});

it("SHOULD use the category icon and color, with safe fallbacks", () => {
  const withCategory = new TransactionUIModel(dto(), category);
  const without = new TransactionUIModel(dto());

  expect(withCategory.categoryIcon).toBe("cart");
  expect(withCategory.categoryColor).toBe("#3B82F6");
  expect(without.categoryIcon).toBe("help-circle-outline");
  expect(without.categoryColor).toBeUndefined();
});

it("SHOULD map the legacy black color token to a hex", () => {
  const legacy = new CategoryDTO({
    icon: "cart",
    id: "cat-1",
    name: "Groceries",
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
  });

  expect(new TransactionUIModel(dto(), legacy).categoryColor).toBe("#000000");
});

it("SHOULD build the local date key", () => {
  expect(
    new TransactionUIModel(dto({ date: new Date(2026, 0, 5).toISOString() }))
      .dateKey,
  ).toBe("2026-01-05");
});

describe("balance adjustments", () => {
  const adjustment = new TransactionUIModel(
    dto({
      category: "Balance adjustment",
      categoryId: "00000000-0000-4000-8000-000000000001",
      categoryName: undefined,
      description: "Balance adjustment",
      excludeFromTotals: true,
      systemKey: "BALANCE_ADJUSTMENT",
      type: "INCOME",
      value: "50.00",
    }),
  );

  it("SHOULD be flagged AND use the adjustment icon without a category color", () => {
    expect(adjustment.isAdjustment).toBe(true);
    expect(adjustment.categoryIcon).toBe("scale-balance");
    expect(adjustment.categoryColor).toBeUndefined();
  });

  it("SHOULD show only the account name as subtitle (an adjustment has no category)", () => {
    expect(adjustment.subtitle).toBe("Checking");
  });

  it("SHOULD keep a regular transaction unflagged", () => {
    expect(new TransactionUIModel(dto(), category).isAdjustment).toBe(false);
  });

  it("SHOULD still count in the signed cents of its day", () => {
    expect(adjustment.signedCents).toBe(5000);
  });
});

describe("paid status (spec 033)", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 15, 12));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("SHOULD flag an unpaid past account row as overdue AND payable", () => {
    const item = new TransactionUIModel(
      dto({ date: new Date(2026, 9, 10).toISOString(), paid: false }),
    );

    expect(item.isOverdue).toBe(true);
    expect(item.canPay).toBe(true);
  });

  it("SHOULD NOT flag an unpaid row due today or later as overdue, but still payable", () => {
    const today = new TransactionUIModel(
      dto({ date: new Date(2026, 9, 15).toISOString(), paid: false }),
    );
    const later = new TransactionUIModel(
      dto({ date: new Date(2026, 9, 20).toISOString(), paid: false }),
    );

    expect([today.isOverdue, later.isOverdue]).toEqual([false, false]);
    expect([today.canPay, later.canPay]).toEqual([true, true]);
  });

  it("SHOULD offer nothing for a paid row, a card row or a system row", () => {
    const past = new Date(2026, 9, 1).toISOString();
    const rows = [
      dto({ date: past, paid: true }),
      dto({ creditCardId: "card-1", date: past, paid: false }),
      dto({ date: past, paid: false, systemKey: "BALANCE_ADJUSTMENT" }),
    ].map((row) => new TransactionUIModel(row));

    expect(rows.map((row) => row.canPay)).toEqual([false, false, false]);
    expect(rows.map((row) => row.isOverdue)).toEqual([false, false, false]);
  });
});

describe("recurring series (spec 034)", () => {
  it("SHOULD show the counter WHEN the series has an end date AND the frequency WHEN it has none", () => {
    const withEnd = new TransactionUIModel(
      dto({ occurrenceCount: 10, occurrenceNumber: 3, recurrenceId: "s-1" }),
    );
    const noEnd = new TransactionUIModel(
      dto({
        occurrenceNumber: 3,
        recurrenceFrequency: "MONTHLY",
        recurrenceId: "s-1",
      }),
    );

    expect(withEnd.counter).toBe("3/10");
    expect(withEnd.frequency).toBeUndefined();
    expect(noEnd.counter).toBeUndefined();
    expect(noEnd.frequency).toBe("MONTHLY");
    expect(withEnd.isRecurring).toBe(true);
    expect(withEnd.recurrenceId).toBe("s-1");
    expect(withEnd.occurrenceNumber).toBe(3);
  });

  it("SHOULD have no counter, frequency or recurring flag outside a series", () => {
    const plain = new TransactionUIModel(dto());

    expect(plain.counter).toBeUndefined();
    expect(plain.frequency).toBeUndefined();
    expect(plain.isRecurring).toBe(false);
    expect(plain.isProjected).toBe(false);
  });

  it("SHOULD not offer the pay button or the overdue badge for a projected occurrence", () => {
    const projected = new TransactionUIModel(
      dto({
        date: new Date(2020, 0, 1).toISOString(),
        isProjected: true,
        paid: false,
        recurrenceId: "s-1",
      }),
    );
    const real = new TransactionUIModel(
      dto({ date: new Date(2020, 0, 1).toISOString(), paid: false }),
    );

    expect(projected.isProjected).toBe(true);
    expect(projected.canPay).toBe(false);
    expect(projected.isOverdue).toBe(false);
    expect(real.canPay).toBe(true);
    expect(real.isOverdue).toBe(true);
  });

  it("SHOULD expose the month of the day it is shown on", () => {
    expect(new TransactionUIModel(dto()).monthKey).toBe("2026-09");
  });
});

describe("cached values", () => {
  it("SHOULD return the same Date instance on every access", () => {
    const model = new TransactionUIModel(
      dto({ date: "2026-11-03T12:00:00.000Z" }),
    );

    expect(model.date).toBe(model.date);
    expect(model.dateKey).toBe(model.dateKey);
  });
});

describe("transfer rows (spec 098)", () => {
  const transfer = {
    amountIn: "920.00",
    amountOut: "5000.00",
    counterpartHidden: false,
    currencyIn: "USD" as const,
    currencyOut: "BRL" as const,
    dateIn: new Date(2026, 10, 6).toISOString(),
    dateOut: new Date(2026, 10, 4).toISOString(),
    fromAccountId: "acc-1",
    toAccountId: "acc-2",
  };

  function row(systemKey: string, overrides = {}) {
    return new TransactionUIModel(
      dto({
        paid: false,
        systemKey,
        transfer,
        transferId: "transfer-1",
        ...overrides,
      }),
    );
  }

  it("SHOULD name the side of the row AND mark it a transfer", () => {
    expect(row("TRANSFER_OUT").transferSide).toBe("OUT");
    expect(row("TRANSFER_IN").transferSide).toBe("IN");
    expect(row("TRANSFER_FEE").transferSide).toBe("FEE");
    expect(row("TRANSFER_OUT").isTransfer).toBe(true);
    expect(new TransactionUIModel(dto()).transferSide).toBeUndefined();
    expect(new TransactionUIModel(dto()).isTransfer).toBe(false);
    expect(row("OTHER").transferSide).toBeUndefined();
  });

  it("SHOULD let the out and in rows be paid, but not the fee row nor other system rows", () => {
    expect(row("TRANSFER_OUT").canPay).toBe(true);
    expect(row("TRANSFER_IN").canPay).toBe(true);
    expect(row("TRANSFER_FEE").canPay).toBe(false);
    expect(row("TRANSFER_OUT", { paid: true }).canPay).toBe(false);
    expect(
      new TransactionUIModel(dto({ paid: false, systemKey: "INVOICE_PAYMENT" }))
        .canPay,
    ).toBe(false);
  });

  it("SHOULD be read-only WHEN the other side is hidden", () => {
    expect(row("TRANSFER_OUT").isTransferReadOnly).toBe(false);
    expect(
      row("TRANSFER_OUT", {
        transfer: { ...transfer, counterpartHidden: true },
      }).isTransferReadOnly,
    ).toBe(true);
  });

  it("SHOULD flag an out row whose amount in is still to be informed", () => {
    const pending = { ...transfer, amountIn: undefined };

    expect(
      row("TRANSFER_OUT", { transfer: pending }).isTransferAmountPending,
    ).toBe(true);
    expect(
      row("TRANSFER_IN", { transfer: pending }).isTransferAmountPending,
    ).toBe(false);
    expect(row("TRANSFER_OUT").isTransferAmountPending).toBe(false);
    expect(
      row("TRANSFER_OUT", { transfer: { ...pending, currencyIn: "BRL" } })
        .isTransferAmountPending,
    ).toBe(false);
    expect(
      row("TRANSFER_OUT", { transfer: { ...pending, counterpartHidden: true } })
        .isTransferAmountPending,
    ).toBe(false);
  });

  it("SHOULD show the rate on the in row between currencies only", () => {
    expect(row("TRANSFER_IN").transferRate).toEqual({
      currency: "USD",
      perCurrency: "BRL",
      value: 5.4348,
    });
    expect(row("TRANSFER_OUT").transferRate).toBeUndefined();
    expect(
      row("TRANSFER_IN", { transfer: { ...transfer, currencyIn: "BRL" } })
        .transferRate,
    ).toBeUndefined();
    expect(
      row("TRANSFER_IN", { transfer: { ...transfer, amountIn: undefined } })
        .transferRate,
    ).toBeUndefined();
  });

  it("SHOULD flip the rate WHEN the amount in is the larger one", () => {
    expect(
      row("TRANSFER_IN", {
        transfer: { ...transfer, amountIn: "5000.00", amountOut: "920.00" },
      }).transferRate,
    ).toEqual({ currency: "BRL", perCurrency: "USD", value: 5.4348 });
  });
});

describe("isInvestment (spec 102)", () => {
  it.each([
    ["INVESTMENT_CONTRIBUTION", true],
    ["INVESTMENT_REDEMPTION", true],
    ["TRANSFER_OUT", false],
    [undefined, false],
  ])("SHOULD be %s -> %s", (systemKey, expected) => {
    expect(new TransactionUIModel(dto({ systemKey })).isInvestment).toBe(
      expected,
    );
  });
});

it("SHOULD show the rising chart icon on an investment row (spec 102)", () => {
  expect(
    new TransactionUIModel(dto({ systemKey: "INVESTMENT_REDEMPTION" }))
      .categoryIcon,
  ).toBe("trending-up");
});
