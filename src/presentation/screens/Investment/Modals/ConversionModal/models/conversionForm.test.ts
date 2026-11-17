import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import { InvestmentAsset } from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  ConversionFormState,
  eligibleDestinations,
  hasErrors,
  validateConversion,
} from "./conversionForm";

function asset(overrides: Partial<InvestmentAsset>): InvestmentAsset {
  return {
    assetClass: InvestmentAssetClass.BR_REIT,
    currency: "BRL",
    id: "a",
    name: "Fundo",
    owner: OwnerType.USER,
    ownerId: "user-1",
    status: "ACTIVE",
    ticker: "BTHF11",
    ...overrides,
  } as InvestmentAsset;
}

const state: ConversionFormState = {
  accountId: "",
  cashAmount: 0,
  date: new Date(),
  destinationId: "dest",
  mode: "existing",
  name: "",
  ratioFrom: "1",
  ratioTo: "7,4",
  referenceValue: "",
  ticker: "",
};

describe("eligibleDestinations", () => {
  const origin = asset({ id: "origin", ticker: "BCFF11" });

  it("SHOULD keep active assets of the same owner, class AND currency, never the origin", () => {
    const list = eligibleDestinations(origin, [
      origin,
      asset({ id: "b", ticker: "XPML11" }),
      asset({ id: "c", ticker: "BTHF11" }),
      asset({ assetClass: InvestmentAssetClass.BR_STOCK, id: "d" }),
      asset({ currency: "USD", id: "e" }),
      asset({ id: "f", ownerId: "user-2" }),
      asset({ id: "g", status: "ARCHIVED" as never }),
    ]);

    expect(list.map((item) => item.id)).toEqual(["c", "b"]);
  });
});

describe("validateConversion", () => {
  it("SHOULD accept a ratio typed with a comma AND an existing destination", () => {
    expect(hasErrors(validateConversion(state, false))).toBe(false);
  });

  it("SHOULD need a destination, a positive ratio AND a date that is not in the future", () => {
    const errors = validateConversion(
      {
        ...state,
        date: new Date(2999, 0, 1),
        destinationId: "",
        ratioFrom: "0",
        ratioTo: "abc",
      },
      false,
    );

    expect(errors).toMatchObject({
      date: "future",
      destination: true,
      ratioFrom: true,
      ratioTo: true,
    });
  });

  it("SHOULD need a ticker AND a name for a new destination, but not when editing", () => {
    const creating = validateConversion({ ...state, mode: "new" }, false);

    expect(creating).toMatchObject({ name: true, ticker: true });
    expect(
      hasErrors(
        validateConversion({ ...state, destinationId: "", mode: "new" }, true),
      ),
    ).toBe(false);
  });

  it("SHOULD need the account AND the reference value WHEN there is a cash part", () => {
    expect(
      validateConversion({ ...state, cashAmount: 1500 }, false),
    ).toMatchObject({ account: true, referenceValue: true });
    expect(
      hasErrors(
        validateConversion(
          {
            ...state,
            accountId: "acc",
            cashAmount: 1500,
            referenceValue: "10,4",
          },
          false,
        ),
      ),
    ).toBe(false);
  });
});
