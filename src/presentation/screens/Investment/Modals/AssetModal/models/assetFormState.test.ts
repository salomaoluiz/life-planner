import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { makeAsset } from "@screens/Investment/mocks/fixtures";

import {
  createInitialState,
  isSameState,
  stateFromAsset,
  tickerRequired,
  toCreateParams,
  toUpdateParams,
  validate,
  withAssetClass,
  withCurrency,
  withName,
  withTicker,
} from "./assetFormState";

const initial = createInitialState({ ownerId: "user-1" });

describe("class, currency, name and ticker", () => {
  it("SHOULD suggest USD for a foreign stock until the currency was chosen", () => {
    expect(
      withAssetClass(initial, InvestmentAssetClass.FOREIGN_STOCK).currency,
    ).toBe("USD");
    expect(
      withAssetClass(
        withAssetClass(initial, InvestmentAssetClass.FOREIGN_STOCK),
        InvestmentAssetClass.BR_STOCK,
      ).currency,
    ).toBe("BRL");
    expect(
      withAssetClass(
        withCurrency(initial, "EUR"),
        InvestmentAssetClass.FOREIGN_STOCK,
      ).currency,
    ).toBe("EUR");
  });

  it("SHOULD upper-case the ticker AND fill the name until the name is typed", () => {
    const typed = withTicker(initial, "itsa4");

    expect(typed).toMatchObject({ name: "ITSA4", ticker: "ITSA4" });
    expect(withTicker(withName(initial, "Itaúsa PN"), "itsa4").name).toBe(
      "Itaúsa PN",
    );
    expect(withTicker(initial, "x".repeat(30)).ticker).toHaveLength(20);
  });

  it("SHOULD require a ticker for stock, FII and foreign stock only", () => {
    expect(tickerRequired(InvestmentAssetClass.BR_REIT)).toBe(true);
    expect(tickerRequired(InvestmentAssetClass.PRIVATE)).toBe(false);
  });
});

describe("validate", () => {
  it("SHOULD report a missing name and ticker", () => {
    expect(validate(initial)).toEqual({
      name: "investment.form.asset.nameRequired",
      ticker: "investment.form.asset.tickerRequired",
    });
  });

  it("SHOULD accept a private asset without ticker AND reject odd characters", () => {
    const privateAsset = {
      ...initial,
      assetClass: InvestmentAssetClass.PRIVATE,
      name: "Options",
    };

    expect(validate(privateAsset)).toEqual({});
    expect(validate({ ...privateAsset, ticker: "A B" }).ticker).toBeDefined();
  });

  it("SHOULD validate the optional current value", () => {
    const valid = { ...initial, name: "x", ticker: "X" };

    expect(validate({ ...valid, currentValue: "10,53" })).toEqual({});
    expect(
      validate({ ...valid, currentValue: "0" }).currentValue,
    ).toBeDefined();
    expect(
      validate({ ...valid, currentValue: "abc" }).currentValue,
    ).toBeDefined();
  });
});

describe("params", () => {
  it("SHOULD build the create params with trimmed text AND optional fields", () => {
    expect(
      toCreateParams(
        {
          ...initial,
          currentValue: " 10,53 ",
          name: " Itaúsa ",
          ticker: "ITSA4",
        },
        OwnerType.USER,
      ),
    ).toEqual({
      assetClass: "BR_STOCK",
      currency: "BRL",
      currentUnitPrice: "10,53",
      name: "Itaúsa",
      owner: "USER",
      ownerId: "user-1",
      ticker: "ITSA4",
    });
    expect(
      toCreateParams({ ...initial, name: "x" }, OwnerType.USER),
    ).toMatchObject({ currentUnitPrice: undefined, ticker: undefined });
  });

  it("SHOULD send only the changes of an edit, owner pair together", () => {
    const before = stateFromAsset(makeAsset());

    expect(toUpdateParams("asset-1", before, before, OwnerType.USER)).toEqual({
      id: "asset-1",
    });
    expect(
      toUpdateParams(
        "asset-1",
        {
          ...before,
          assetClass: InvestmentAssetClass.BR_REIT,
          currency: "USD",
          name: " New ",
          ownerId: "fam-1",
          ticker: "",
        },
        before,
        OwnerType.FAMILY,
      ),
    ).toEqual({
      assetClass: "BR_REIT",
      currency: "USD",
      id: "asset-1",
      name: "New",
      owner: "FAMILY",
      ownerId: "fam-1",
      ticker: null,
    });
    expect(
      toUpdateParams(
        "asset-1",
        { ...before, ticker: "NEW1" },
        before,
        OwnerType.USER,
      ).ticker,
    ).toBe("NEW1");
  });

  it("SHOULD compare the editable fields", () => {
    const before = stateFromAsset(makeAsset({ ticker: null }));

    expect(before.ticker).toBe("");
    expect(isSameState(before, { ...before, nameTouched: false })).toBe(true);
    expect(isSameState(before, { ...before, name: "Other" })).toBe(false);
  });
});
