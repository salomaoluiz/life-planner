import {
  InvestmentIncomeStatus,
  InvestmentIncomeType,
} from "@domain/entities/investment/enums";
import { makeIncome, makeSuggestion } from "@screens/Investment/mocks/fixtures";

import {
  effectiveNet,
  estimateOf,
  hasErrors,
  initialState,
  isSameState,
  stateFromIncome,
  stateFromSuggestion,
  suggestedNet,
  toCreateParams,
  toSeriesParams,
  toUpdateParams,
  validate,
} from "./incomeFormState";

function base() {
  return initialState({
    accountId: "acc-1",
    categoryId: "cat-1",
    paymentDate: "2026-10-30",
    quantity: "300",
    type: InvestmentIncomeType.JCP,
  });
}

describe("net amount", () => {
  it("SHOULD be quantity × per unit with the withholding taken off", () => {
    expect(suggestedNet({ perUnit: "0,28", quantity: "300" }, 1500)).toBe(7140);
    expect(suggestedNet({ perUnit: "0.47", quantity: "300" }, 0)).toBe(14100);
  });

  it("SHOULD be undefined WHEN a value is missing or not above zero", () => {
    expect(suggestedNet({ perUnit: "", quantity: "300" }, 0)).toBeUndefined();
    expect(suggestedNet({ perUnit: "0", quantity: "300" }, 0)).toBeUndefined();
    expect(suggestedNet({ perUnit: "x", quantity: "300" }, 0)).toBeUndefined();
  });

  it("SHOULD follow the suggestion until the owner types, then keep the typed value", () => {
    const state = { ...base(), perUnit: "0.28" };

    expect(effectiveNet(state, 1500)).toBe(7140);
    expect(
      effectiveNet({ ...state, netAmount: 7000, netTouched: true }, 1500),
    ).toBe(7000);
    expect(effectiveNet({ ...state, netAmount: 5, perUnit: "" }, 1500)).toBe(5);
  });

  it("SHOULD estimate the gross AND the withheld tax", () => {
    expect(estimateOf(7140, 1500)).toEqual({ gross: 8400, withheld: 1260 });
    expect(estimateOf(7140, 0)).toEqual({ gross: 7140, withheld: 0 });
  });
});

describe("states", () => {
  it("SHOULD start a planned income dated today WHEN no date is given", () => {
    const state = initialState({ type: InvestmentIncomeType.DIVIDEND });

    expect(state).toMatchObject({
      accountId: "",
      netTouched: false,
      status: InvestmentIncomeStatus.PLANNED,
    });
    expect(state.exDate).toBeUndefined();
  });

  it("SHOULD read an income AND its edit params round-trip", () => {
    const state = stateFromIncome(makeIncome({ notes: "x" }));

    expect(state).toMatchObject({
      netAmount: 7140,
      netTouched: true,
      notes: "x",
    });
    expect(toUpdateParams("income-1", state, 7140)).toMatchObject({
      accountId: "acc-1",
      amountPerUnit: "0.28",
      exDate: "2026-09-10",
      id: "income-1",
      notes: "x",
      paymentDate: "2026-10-30",
      quantity: "300",
      status: "RECEIVED",
    });
  });

  it("SHOULD read a suggestion with its estimated net", () => {
    const state = stateFromSuggestion(makeSuggestion(), {
      accountId: "acc-1",
      categoryId: null,
    });

    expect(state).toMatchObject({
      accountId: "acc-1",
      categoryId: "",
      netAmount: 14100,
      netTouched: false,
      perUnit: "0.47",
      quantity: "300",
    });
  });

  it("SHOULD send null for the empty optional fields", () => {
    const params = toCreateParams("asset-1", { ...base(), quantity: "" }, 100);

    expect(params).toMatchObject({
      amountPerUnit: null,
      assetId: "asset-1",
      exDate: null,
      notes: null,
      quantity: null,
    });
  });

  it("SHOULD compare two states by their fields", () => {
    expect(isSameState(base(), { ...base() })).toBe(true);
    expect(isSameState(base(), { ...base(), notes: "x" })).toBe(false);
    expect(
      isSameState(base(), { ...base(), exDate: new Date(2026, 8, 10) }),
    ).toBe(false);
  });
});

describe("validate", () => {
  it("SHOULD accept a complete income", () => {
    expect(hasErrors(validate(base(), 100))).toBe(false);
  });

  it("SHOULD flag the missing account, category AND amount", () => {
    const errors = validate({ ...base(), accountId: "", categoryId: "" }, 0);

    expect(Object.keys(errors).sort()).toEqual([
      "accountId",
      "categoryId",
      "netAmount",
    ]);
  });

  it("SHOULD flag a quantity or a per-unit value that is not above zero", () => {
    const errors = validate({ ...base(), perUnit: "0", quantity: "abc" }, 100);

    expect(errors).toMatchObject({
      amountPerUnit: "investment.form.operation.unitPriceInvalid",
      quantity: "investment.form.operation.quantityInvalid",
    });
  });
});

describe("series (spec 115)", () => {
  it("SHOULD start without repeating, with finance AND the 114 defaults", () => {
    expect(base()).toMatchObject({
      endDate: undefined,
      exDateOffset: "",
      frequency: { interval: 1, unit: "MONTH" },
      markPast: true,
      repeat: false,
      withFinance: true,
    });
  });

  it("SHOULD describe the series for the API without account or category WHEN there is no finance", () => {
    const state = {
      ...base(),
      endDate: new Date(2027, 0, 31),
      exDateOffset: "8",
      perUnit: "1,10",
      withFinance: false,
    };

    expect(toSeriesParams("asset-1", state)).toEqual({
      accountId: undefined,
      amountPerUnit: "1,10",
      assetId: "asset-1",
      categoryId: undefined,
      endDate: "2027-01-31",
      exDateOffsetDays: 8,
      firstPaymentDate: "2026-10-30",
      frequency: { interval: 1, unit: "MONTH" },
      markPastAsReceived: true,
      notes: null,
      type: InvestmentIncomeType.JCP,
      withFinance: false,
    });
    expect(
      toSeriesParams("asset-1", { ...base(), exDateOffset: "", perUnit: "1" }),
    ).toMatchObject({ endDate: null, exDateOffsetDays: null });
  });

  it("SHOULD not ask for account and category WITHOUT finance AND send none on a single income", () => {
    const state = {
      ...base(),
      accountId: "",
      categoryId: "",
      withFinance: false,
    };

    expect(validate(state, 100)).toEqual({});
    expect(toCreateParams("asset-1", state, 100)).toMatchObject({
      accountId: undefined,
      categoryId: undefined,
      withFinance: false,
    });
    expect(validate({ ...state, withFinance: true }, 100)).toMatchObject({
      accountId: "investment.form.operation.accountRequired",
      categoryId: "investment.income.errors.incomplete",
    });
  });

  it("SHOULD validate the series: per-unit value, frequency, end date and ex-date offset", () => {
    const series = { ...base(), perUnit: "1,10" };

    expect(validate(series, 0, true)).toEqual({});
    expect(
      validate({ ...series, perUnit: "" }, 0, true).amountPerUnit,
    ).toBeDefined();
    expect(
      validate(
        { ...series, frequency: { interval: 99, unit: "MONTH" } },
        0,
        true,
      ).frequency,
    ).toBe("financial.recurrence.intervalErrorLonger");
    expect(
      validate({ ...series, endDate: new Date(2020, 0, 1) }, 0, true).endDate,
    ).toBe("investment.income.endDateInvalid");
    expect(
      validate({ ...series, exDateOffset: "91" }, 0, true).exDateOffset,
    ).toBe("investment.income.exDateOffsetInvalid");
    expect(
      validate({ ...series, exDateOffset: "x" }, 0, true).exDateOffset,
    ).toBeDefined();
    expect(validate({ ...series, exDateOffset: "0" }, 0, true)).toEqual({});
  });

  it("SHOULD count the series fields in the dirty check AND read an income without finance", () => {
    expect(isSameState(base(), { ...base(), repeat: true })).toBe(false);
    expect(isSameState(base(), { ...base(), exDateOffset: "3" })).toBe(false);
    expect(isSameState(base(), { ...base(), markPast: false })).toBe(false);
    expect(isSameState(base(), { ...base(), withFinance: false })).toBe(false);
    expect(
      isSameState(base(), {
        ...base(),
        frequency: { interval: 2, unit: "MONTH" },
      }),
    ).toBe(false);
    expect(isSameState(base(), { ...base(), endDate: new Date() })).toBe(false);
    expect(
      stateFromIncome(makeIncome({ withFinance: false })).withFinance,
    ).toBe(false);
  });
});
