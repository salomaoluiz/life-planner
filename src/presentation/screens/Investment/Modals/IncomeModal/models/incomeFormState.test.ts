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
