import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { makeAsset } from "@screens/Investment/mocks/fixtures";

import {
  createInitialState,
  isSameState,
  marketOf,
  needsPick,
  stateFromAsset,
  tickerRequired,
  toCreateParams,
  toUpdateParams,
  validate,
  withAssetClass,
  withCurrency,
  withName,
  withPicked,
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
    // A quoted class takes the currency of its market; an unlisted one keeps the user's choice (spec 104 FR 24).
    expect(
      withAssetClass(
        withCurrency(initial, "EUR"),
        InvestmentAssetClass.FOREIGN_STOCK,
      ).currency,
    ).toBe("USD");
    expect(
      withAssetClass(withCurrency(initial, "EUR"), InvestmentAssetClass.PRIVATE)
        .currency,
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
    const valid = {
      ...initial,
      assetClass: InvestmentAssetClass.PRIVATE,
      name: "x",
      ticker: "X",
    };

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

describe("ticker pick (spec 104 FR 24)", () => {
  const suggestion = {
    changePercent: "0.48",
    currency: "BRL" as const,
    exchange: "B3",
    logoUrl: null,
    market: "B3" as never,
    name: "Itaúsa PN",
    price: "10.53",
    ticker: "ITSA4",
  };
  const typed = withTicker(initial, "itsa4");

  it("SHOULD map the classes to the market that quotes them", () => {
    expect(marketOf(InvestmentAssetClass.BR_REIT)).toBe("B3");
    expect(marketOf(InvestmentAssetClass.FOREIGN_STOCK)).toBe("US");
    expect(marketOf(InvestmentAssetClass.PRIVATE)).toBeUndefined();
  });

  it("SHOULD require a pick for a quoted class, not for the others", () => {
    expect(needsPick(typed)).toBe(true);
    expect(needsPick(initial)).toBe(false);
    expect(needsPick(withAssetClass(typed, InvestmentAssetClass.PRIVATE))).toBe(
      false,
    );
  });

  it("SHOULD not require it again for the ticker the asset already has", () => {
    const existing = stateFromAsset(makeAsset({ ticker: "ITSA4" }));

    expect(needsPick(existing, existing)).toBe(false);
    expect(needsPick({ ...existing, ticker: "HGLG11" }, existing)).toBe(true);
    expect(
      needsPick(
        { ...existing, assetClass: InvestmentAssetClass.FOREIGN_STOCK },
        existing,
      ),
    ).toBe(true);
  });

  it("SHOULD accept the picked ticker AND fill name and currency, but reject it once edited or in another market", () => {
    const picked = withPicked(typed, suggestion);

    expect(picked).toMatchObject({
      currency: "BRL",
      name: "Itaúsa PN",
      ticker: "ITSA4",
    });
    expect(needsPick(picked)).toBe(false);
    expect(validate(picked).ticker).toBeUndefined();
    expect(needsPick(withTicker(picked, "itsa3"))).toBe(true);
    expect(
      needsPick(withAssetClass(picked, InvestmentAssetClass.FOREIGN_STOCK)),
    ).toBe(true);
    expect(validate(typed).ticker).toBe("investment.ticker.notFound");
  });

  it("SHOULD keep the typed name WHEN picking", () => {
    const named = withName(typed, "My Itaú");

    expect(withPicked(named, suggestion).name).toBe("My Itaú");
    expect(withPicked(typed, { ...suggestion, name: null }).name).toBe("ITSA4");
  });
});
