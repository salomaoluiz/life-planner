import TransferEntity from "@domain/entities/financial/TransferEntity";

import {
  buildConfirmParams,
  canConfirm,
  effectiveAmountInCents,
  initialState,
  isSameCurrency,
} from "./confirmTransferState";

function transfer(overrides = {}) {
  return new TransferEntity({
    amountOut: "1000.00",
    currencyIn: "USD",
    currencyOut: "BRL",
    dateIn: new Date(2026, 10, 30).toISOString(),
    dateOut: new Date(2026, 10, 30).toISOString(),
    description: "Monthly",
    id: "t1",
    paid: false,
    ...overrides,
  });
}

it("SHOULD start from the stored amounts and days, with no amount in WHEN it is still to be informed", () => {
  expect(initialState(transfer())).toMatchObject({
    amountInCents: 0,
    amountOutCents: 100000,
    rateMode: "AMOUNT_IN",
  });
  expect(initialState(transfer({ amountIn: "180.00" })).amountInCents).toBe(
    18000,
  );
});

it("SHOULD know the currencies are the same", () => {
  expect(isSameCurrency(transfer())).toBe(false);
  expect(isSameCurrency(transfer({ currencyIn: "BRL" }))).toBe(true);
});

it("SHOULD take the amount in from the amount out, the typed amount or the rate", () => {
  const state = initialState(transfer());

  expect(effectiveAmountInCents({ ...state, amountInCents: 5 }, true)).toBe(
    100000,
  );
  expect(
    effectiveAmountInCents({ ...state, amountInCents: 18000 }, false),
  ).toBe(18000);
  expect(
    effectiveAmountInCents(
      { ...state, rateMode: "RATE", rateText: "5,5556" },
      false,
    ),
  ).toBe(18000);
});

it("SHOULD disable the confirmation until the amount in is known", () => {
  const state = initialState(transfer());

  expect(canConfirm(state, false)).toBe(false);
  expect(canConfirm({ ...state, amountInCents: 18000 }, false)).toBe(true);
  expect(canConfirm(state, true)).toBe(true);
  expect(canConfirm({ ...state, amountOutCents: 0 }, true)).toBe(false);
});

it("SHOULD always pay AND send only what changed, with the series scope only for an occurrence", () => {
  const state = initialState(transfer());

  expect(buildConfirmParams(transfer(), state)).toEqual({
    amountIn: undefined,
    amountOut: undefined,
    dateIn: undefined,
    dateOut: undefined,
    id: "t1",
    paid: true,
    scope: undefined,
  });
  expect(
    buildConfirmParams(transfer({ recurrenceId: "series-1" }), {
      ...state,
      amountInCents: 18000,
      amountOutCents: 90000,
      dateIn: new Date(2026, 11, 2),
      dateOut: new Date(2026, 11, 1),
    }),
  ).toEqual({
    amountIn: "180.00",
    amountOut: "900.00",
    dateIn: new Date(2026, 11, 2).toISOString(),
    dateOut: new Date(2026, 11, 1).toISOString(),
    id: "t1",
    paid: true,
    scope: "ONLY_THIS",
  });
});

it("SHOULD not send an amount in for the same currency", () => {
  const same = transfer({ currencyIn: "BRL" });

  expect(
    buildConfirmParams(same, { ...initialState(same), amountInCents: 5 })
      .amountIn,
  ).toBeUndefined();
});
