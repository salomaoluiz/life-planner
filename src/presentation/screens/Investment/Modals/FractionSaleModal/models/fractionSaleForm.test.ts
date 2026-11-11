import { InvestmentFeeKind } from "@domain/entities/investment/enums";

import {
  feesTotal,
  hasErrors,
  newFee,
  realizedResult,
  toDay,
  toFeeParams,
  validateSale,
} from "./fractionSaleForm";

const draft = {
  accountId: "acc-1",
  eventDate: "2026-03-10",
  fees: [],
  gross: 520,
  saleDate: "2026-04-04",
  today: "2026-11-11",
  writeOff: false,
};

describe("realizedResult", () => {
  it("SHOULD be the auction amount minus fees minus the cost of the fraction", () => {
    expect(realizedResult(520, [], 506)).toBe(14);
    expect(realizedResult(520, [{ ...newFee(), amountCents: 20 }], 506)).toBe(
      -6,
    );
    expect(realizedResult(0, [], 506)).toBe(-506);
  });
});

describe("fees", () => {
  it("SHOULD add the fees AND send only the ones with an amount", () => {
    const first = { ...newFee(), amountCents: 20 };
    const second = {
      ...newFee(),
      amountCents: 0,
      kind: InvestmentFeeKind.EXCHANGE_FEES,
    };

    expect(feesTotal([first, second])).toBe(20);
    expect(toFeeParams([first, second])).toEqual([
      { amount: 20, description: undefined, kind: "BROKERAGE" },
    ]);
    expect(first.key).not.toBe(second.key);
  });
});

describe("validateSale", () => {
  it("SHOULD accept a complete sale", () => {
    expect(hasErrors(validateSale(draft))).toBe(false);
  });

  it("SHOULD need an amount AND an account unless the fraction is written off", () => {
    expect(validateSale({ ...draft, gross: 0 }).gross).toBe(true);
    expect(validateSale({ ...draft, accountId: "" }).account).toBe(true);
    expect(
      hasErrors(
        validateSale({ ...draft, accountId: "", gross: 0, writeOff: true }),
      ),
    ).toBe(false);
  });

  it("SHOULD refuse a date before the event or in the future", () => {
    expect(validateSale({ ...draft, saleDate: "2026-03-09" }).date).toBe(
      "before",
    );
    expect(validateSale({ ...draft, saleDate: "2026-11-12" }).date).toBe(
      "future",
    );
    expect(
      validateSale({ ...draft, saleDate: "2026-03-10" }).date,
    ).toBeUndefined();
  });

  it("SHOULD refuse fees above the amount", () => {
    expect(
      validateSale({ ...draft, fees: [{ ...newFee(), amountCents: 521 }] })
        .fees,
    ).toBe(true);
  });
});

describe("toDay", () => {
  it("SHOULD give the calendar day of a date", () => {
    expect(toDay(new Date(2026, 3, 4))).toBe("2026-04-04");
  });
});
