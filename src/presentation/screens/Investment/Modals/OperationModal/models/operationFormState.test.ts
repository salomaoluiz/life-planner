import {
  InvestmentFeeKind,
  InvestmentOperationType,
} from "@domain/entities/investment/enums";
import { makeOperation } from "@screens/Investment/mocks/fixtures";

import {
  addFee,
  createInitialState,
  hasErrors,
  isSameState,
  removeFee,
  stateFromOperation,
  toCreateParams,
  toUpdateParams,
  updateFee,
  validate,
} from "./operationFormState";

describe("fees", () => {
  it("SHOULD add up to 10 fees, update them AND remove one", () => {
    let state = createInitialState();

    for (let i = 0; i < 12; i += 1) {
      state = addFee(state);
    }
    expect(state.fees).toHaveLength(10);

    const key = state.fees[0].key;
    state = updateFee(state, key, { amountCents: 490 });
    expect(state.fees[0].amountCents).toBe(490);
    expect(state.fees[1].amountCents).toBe(0);

    state = removeFee(state, key);
    expect(state.fees).toHaveLength(9);
  });
});

describe("validate", () => {
  it("SHOULD report quantity, price AND the missing account", () => {
    const errors = validate(createInitialState());

    expect(errors).toMatchObject({
      account: "investment.form.operation.accountRequired",
      quantity: "investment.form.operation.quantityInvalid",
      unitPrice: "investment.form.operation.unitPriceInvalid",
    });
    expect(hasErrors(errors)).toBe(true);
  });

  it("SHOULD not need an account WHEN no finance entry is generated", () => {
    const state = {
      ...createInitialState(),
      generate: false,
      quantity: "10",
      unitPrice: "1,5",
    };

    expect(hasErrors(validate(state))).toBe(false);
  });

  it("SHOULD ask for the description of an Other fee only", () => {
    let state = {
      ...createInitialState("acc-1"),
      quantity: "1",
      unitPrice: "1",
    };
    state = addFee(state);
    state = updateFee(state, state.fees[0].key, {
      kind: InvestmentFeeKind.OTHER,
    });

    const errors = validate(state);

    expect(errors.feeDescriptions[state.fees[0].key]).toBe(
      "investment.form.operation.feeDescriptionRequired",
    );
    state = updateFee(state, state.fees[0].key, { description: "Custody" });
    expect(hasErrors(validate(state))).toBe(false);
  });
});

describe("params", () => {
  const base = {
    ...createInitialState("acc-1"),
    date: new Date(2026, 5, 10),
    quantity: "500",
    unitPrice: "10,20",
  };

  it("SHOULD build the create params with the local day AND the Other description", () => {
    let state = addFee(base);
    state = updateFee(state, state.fees[0].key, { amountCents: 490 });
    state = addFee(state);
    state = updateFee(state, state.fees[1].key, {
      amountCents: 100,
      description: " Custody ",
      kind: InvestmentFeeKind.OTHER,
    });

    expect(toCreateParams("asset-1", state)).toEqual({
      accountId: "acc-1",
      assetId: "asset-1",
      date: "2026-06-10",
      fees: [
        { amount: 490, description: undefined, kind: "BROKERAGE" },
        { amount: 100, description: "Custody", kind: "OTHER" },
      ],
      generateTransaction: true,
      quantity: "500",
      type: "BUY",
      unitPrice: "10,20",
    });
  });

  it("SHOULD drop the account WHEN no finance entry is generated", () => {
    const state = { ...base, generate: false };

    expect(toCreateParams("a", state).accountId).toBeUndefined();
    expect(toUpdateParams("op-1", state).accountId).toBeNull();
    expect(toUpdateParams("op-1", base).accountId).toBe("acc-1");
    expect(
      toUpdateParams("op-1", { ...base, accountId: undefined }).accountId,
    ).toBeNull();
  });
});

describe("stateFromOperation", () => {
  it("SHOULD load an operation AND compare equal to itself", () => {
    const operation = makeOperation({
      type: InvestmentOperationType.SELL,
    });
    const state = stateFromOperation(operation);

    expect(state).toMatchObject({
      accountId: "acc-1",
      generate: true,
      quantity: "500",
      type: "SELL",
      unitPrice: "10.2",
    });
    expect(state.fees[0]).toMatchObject({
      amountCents: 490,
      kind: "BROKERAGE",
    });
    expect(state.date.getFullYear()).toBe(2026);
    expect(isSameState(state, stateFromOperation(operation))).toBe(true);
    expect(isSameState(state, { ...state, quantity: "1" })).toBe(false);
    expect(isSameState(state, addFee(state))).toBe(false);
  });

  it("SHOULD read an operation without account", () => {
    const state = stateFromOperation(
      makeOperation({ accountId: null, generateTransaction: false }),
    );

    expect(state).toMatchObject({ accountId: undefined, generate: false });
  });
});
