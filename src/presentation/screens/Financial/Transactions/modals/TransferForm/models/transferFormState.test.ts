import TransferEntity from "@domain/entities/financial/TransferEntity";

import {
  changeDateIn,
  changeDateOut,
  createInitialState,
  daysLater,
  effectiveAmountInCents,
  isSameState,
  isValid,
  resetDateIn,
  stateFromTransfer,
  swapAccounts,
  toCreateParams,
  toUpdateParams,
  validate,
} from "./transferFormState";

const today = new Date(2026, 10, 4, 15, 30);
const same = { sameCurrency: true };
const other = { sameCurrency: false };

function filled(overrides = {}) {
  return {
    ...createInitialState(today, { fromAccountId: "acc-1" }),
    amountOutCents: 500000,
    description: "Send",
    toAccountId: "acc-2",
    ...overrides,
  };
}

describe("dates", () => {
  it("SHOULD start both dates on the same day AND keep the in date with the out date until it is picked", () => {
    const initial = createInitialState(today);

    expect(initial.dateOut.getTime()).toBe(new Date(2026, 10, 4).getTime());
    expect(changeDateOut(initial, new Date(2026, 10, 9)).dateIn).toEqual(
      new Date(2026, 10, 9),
    );
  });

  it("SHOULD keep a picked in date WHEN it is still after the out date, AND drag it WHEN it is not", () => {
    const picked = changeDateIn(
      createInitialState(today),
      new Date(2026, 10, 10),
    );

    expect(changeDateOut(picked, new Date(2026, 10, 5)).dateIn).toEqual(
      new Date(2026, 10, 10),
    );
    expect(changeDateOut(picked, new Date(2026, 10, 20)).dateIn).toEqual(
      new Date(2026, 10, 20),
    );
  });

  it("SHOULD count the days later AND go back to the same date", () => {
    const picked = changeDateIn(
      createInitialState(today),
      new Date(2026, 10, 6),
    );

    expect(daysLater(picked)).toBe(2);
    expect(daysLater(resetDateIn(picked))).toBe(0);
  });
});

describe("accounts and amounts", () => {
  it("SHOULD swap origin and destination with their amounts AND drop the typed rate", () => {
    const swapped = swapAccounts(
      filled({ amountInCents: 92000, rateMode: "RATE", rateText: "5,43" }),
    );

    expect(swapped).toMatchObject({
      amountInCents: 500000,
      amountOutCents: 92000,
      fromAccountId: "acc-2",
      rateMode: "AMOUNT_IN",
      rateText: "",
      toAccountId: "acc-1",
    });
  });

  it("SHOULD use the amount out for one currency, the typed amount in, or the one the rate gives", () => {
    expect(effectiveAmountInCents(filled({ amountInCents: 1 }), same)).toBe(
      500000,
    );
    expect(
      effectiveAmountInCents(filled({ amountInCents: 92000 }), other),
    ).toBe(92000);
    expect(
      effectiveAmountInCents(
        filled({ rateMode: "RATE", rateText: "5,4348" }),
        other,
      ),
    ).toBe(92000);
  });
});

describe("validate", () => {
  it("SHOULD accept a complete transfer", () => {
    expect(isValid(validate(filled(), same))).toBe(true);
  });

  it("SHOULD reject the same account, missing accounts, an empty description AND no amount", () => {
    const errors = validate(
      { ...createInitialState(today), fromAccountId: "a", toAccountId: "a" },
      same,
    );

    expect(errors).toMatchObject({
      amountOut: "financial.transfers.form.errors.amount",
      description: "financial.transfers.form.errors.description",
      toAccountId: "financial.errors.transferSameAccount",
    });
    expect(validate(createInitialState(today), same)).toMatchObject({
      fromAccountId: "financial.transfers.form.errors.accountRequired",
      toAccountId: "financial.transfers.form.errors.accountRequired",
    });
  });

  it("SHOULD need the amount in only for different currencies that are paid", () => {
    expect(validate(filled(), other).amountIn).toBe(
      "financial.transfers.form.errors.amountIn",
    );
    expect(validate(filled({ paid: false }), other).amountIn).toBeUndefined();
    expect(
      validate(filled({ amountInCents: 92000 }), other).amountIn,
    ).toBeUndefined();
  });

  it("SHOULD reject an in date before the out date AND a fee over the limit", () => {
    const errors = validate(
      filled({ dateIn: new Date(2026, 10, 3), feeCents: 3_000_000_000 }),
      same,
    );

    expect(errors.dateIn).toBe("financial.errors.transferDateInBeforeOut");
    expect(errors.fee).toBe("financial.transfers.form.errors.amount");
  });
});

describe("create params", () => {
  it("SHOULD write decimal amounts, ISO days, the fee AND the series", () => {
    const params = toCreateParams(
      filled({
        amountInCents: 92000,
        dateIn: new Date(2026, 10, 6),
        feeCents: 350,
        notes: " note ",
        repeatEnd: new Date(2027, 10, 4),
        repeatOn: true,
      }),
      other,
    );

    expect(params).toEqual({
      amountIn: "920.00",
      amountOut: "5000.00",
      dateIn: new Date(2026, 10, 6).toISOString(),
      dateOut: new Date(2026, 10, 4).toISOString(),
      description: "Send",
      fee: "3.50",
      fromAccountId: "acc-1",
      notes: "note",
      paid: true,
      recurrence: {
        endDate: new Date(2027, 10, 4).toISOString(),
        frequency: "MONTHLY",
      },
      toAccountId: "acc-2",
    });
  });

  it("SHOULD leave the amount in, the fee, the notes AND the series out WHEN not used", () => {
    expect(toCreateParams(filled(), same)).toMatchObject({
      amountIn: undefined,
      fee: undefined,
      notes: undefined,
      recurrence: undefined,
    });
  });
});

describe("edit", () => {
  const transfer = new TransferEntity({
    amountIn: "920.00",
    amountOut: "5000.00",
    dateIn: new Date(2026, 10, 6).toISOString(),
    dateOut: new Date(2026, 10, 4).toISOString(),
    description: "Send",
    fee: "3.50",
    fromAccountId: "acc-1",
    id: "t1",
    paid: true,
    toAccountId: "acc-2",
  });

  it("SHOULD load the stored transfer with its own in date marked as picked", () => {
    const state = stateFromTransfer(transfer);

    expect(state).toMatchObject({
      amountInCents: 92000,
      amountOutCents: 500000,
      dateInTouched: true,
      feeCents: 350,
      fromAccountId: "acc-1",
    });
    expect(
      stateFromTransfer({ ...transfer, amountIn: undefined, fee: undefined })
        .amountInCents,
    ).toBe(0);
  });

  it("SHOULD send only what changed, the fee as null WHEN removed", () => {
    const initial = stateFromTransfer(transfer);

    expect(toUpdateParams(initial, initial, other)).toEqual({});
    expect(
      toUpdateParams(
        {
          ...initial,
          amountOutCents: 400000,
          description: " New ",
          feeCents: 0,
          notes: "n",
          paid: false,
          toAccountId: "acc-3",
        },
        initial,
        other,
      ),
    ).toEqual({
      amountOut: "4000.00",
      description: "New",
      fee: null,
      notes: "n",
      paid: false,
      toAccountId: "acc-3",
    });
  });

  it("SHOULD send the new dates, the origin AND the amount in", () => {
    const initial = stateFromTransfer(transfer);
    const patch = toUpdateParams(
      {
        ...initial,
        amountInCents: 90000,
        dateIn: new Date(2026, 10, 8),
        dateOut: new Date(2026, 10, 7),
        feeCents: 500,
        fromAccountId: "acc-9",
      },
      initial,
      other,
    );

    expect(patch).toMatchObject({
      amountIn: "900.00",
      dateIn: new Date(2026, 10, 8).toISOString(),
      dateOut: new Date(2026, 10, 7).toISOString(),
      fee: "5.00",
      fromAccountId: "acc-9",
    });
  });

  it("SHOULD compare states by value", () => {
    const a = stateFromTransfer(transfer);

    expect(isSameState(a, stateFromTransfer(transfer))).toBe(true);
    expect(isSameState(a, { ...a, repeatEnd: new Date(2027, 1, 1) })).toBe(
      false,
    );
  });
});
