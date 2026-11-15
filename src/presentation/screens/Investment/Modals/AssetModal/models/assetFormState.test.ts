import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { makeAsset } from "@screens/Investment/mocks/fixtures";

import {
  classMismatch,
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
    assetClass: null,
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

describe("class from the picked ticker (spec 111)", () => {
  const suggestion = {
    assetClass: null,
    changePercent: "1.2",
    currency: "BRL" as const,
    exchange: "B3",
    logoUrl: null,
    market: "B3" as never,
    name: "Kinea Renda Imobiliária",
    price: "152.3",
    ticker: "KNRI11",
  };
  const fii = {
    ...suggestion,
    assetClass: InvestmentAssetClass.BR_REIT,
    ticker: "KNRI11",
  };
  const stock = { ...suggestion, assetClass: InvestmentAssetClass.BR_STOCK };

  it("SHOULD switch to the class of the picked ticker AND flag the notice", () => {
    const picked = withPicked(withTicker(initial, "knr"), fii);

    expect(picked).toMatchObject({
      assetClass: InvestmentAssetClass.BR_REIT,
      classNotice: InvestmentAssetClass.BR_REIT,
      currency: "BRL",
      ticker: "KNRI11",
    });

    const back = withPicked(withTicker(initial, "pet"), {
      ...stock,
      ticker: "PETR4",
    });

    expect(back.assetClass).toBe(InvestmentAssetClass.BR_STOCK);
    expect(back.classNotice).toBeNull();
  });

  it("SHOULD keep the class WHEN the ticker has no class rule", () => {
    const fiagro = withPicked(withTicker(initial, "rza"), {
      ...fii,
      assetClass: null,
      ticker: "RZAG11",
    });

    expect(fiagro.assetClass).toBe(InvestmentAssetClass.BR_STOCK);
    expect(fiagro.classNotice).toBeNull();
  });

  it("SHOULD keep the class WHEN it is not one of the B3 pair", () => {
    const foreign = withAssetClass(initial, InvestmentAssetClass.FOREIGN_STOCK);

    expect(withPicked(withTicker(foreign, "knr"), fii).assetClass).toBe(
      InvestmentAssetClass.FOREIGN_STOCK,
    );
  });

  it("SHOULD drop the notice on the next ticker edit AND when the class is picked by hand", () => {
    const picked = withPicked(withTicker(initial, "knr"), fii);

    expect(withTicker(picked, "knri1").classNotice).toBeNull();
    expect(
      withAssetClass(picked, InvestmentAssetClass.BR_STOCK).classNotice,
    ).toBeNull();
  });

  it("SHOULD block saving WHEN the owner forces the other B3 class back", () => {
    const picked = withPicked(withTicker(initial, "knr"), fii);
    const forced = withAssetClass(picked, InvestmentAssetClass.BR_STOCK);

    expect(classMismatch(forced)).toBe(InvestmentAssetClass.BR_REIT);
    expect(validate(forced).ticker).toBe("investment.ticker.classMismatch");
    expect(validate(picked).ticker).toBeUndefined();
    expect(classMismatch(picked)).toBeNull();
  });

  it("SHOULD start an edited asset without a notice", () => {
    expect(
      stateFromAsset(makeAsset({ assetClass: InvestmentAssetClass.BR_REIT }))
        .classNotice,
    ).toBeNull();
  });
});
