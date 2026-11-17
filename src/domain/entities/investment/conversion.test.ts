import { InvestmentAssetClass } from "@domain/entities/investment/enums";

import { previewConversion } from "./conversion";

const reit = InvestmentAssetClass.BR_REIT;

describe("previewConversion", () => {
  it("SHOULD give 762 quotas AND a fraction of 0.2 for 103 at 1 to 7.4 (spec 112 example)", () => {
    const preview = previewConversion({
      assetClass: reit,
      destination: null,
      origin: { cost: 808550, quantity: "103" },
      ratioFrom: "1",
      ratioTo: "7,4",
    });

    expect(preview).toMatchObject({
      cashCost: 0,
      costIn: 808550,
      fractionCost: 212,
      fractionQuantity: "0.2",
      quantityIn: "762",
      raw: "762.2",
      realizedOut: 0,
    });
  });

  it("SHOULD add the converted quotas to the position already held", () => {
    const preview = previewConversion({
      assetClass: reit,
      destination: { cost: 51000, quantity: "50" },
      origin: { cost: 808550, quantity: "103" },
      ratioFrom: "1",
      ratioTo: "7.4",
    });

    expect(preview?.destinationAfter).toEqual({
      averagePrice: "10.5829803",
      cost: 859338,
      quantity: "812",
    });
  });

  it("SHOULD keep every place for a class without whole units", () => {
    const preview = previewConversion({
      assetClass: InvestmentAssetClass.FOREIGN_STOCK,
      destination: null,
      origin: { cost: 1000, quantity: "3" },
      ratioFrom: "2",
      ratioTo: "1",
    });

    expect(preview).toMatchObject({
      fractionCost: 0,
      fractionQuantity: "0",
      quantityIn: "1.5",
    });
  });

  it("SHOULD take the cash share out of the cost AND book the realized result", () => {
    const preview = previewConversion({
      assetClass: reit,
      cash: { amount: 1500, referenceUnitValue: "10,4" },
      destination: null,
      origin: { cost: 808550, quantity: "103" },
      ratioFrom: "1",
      ratioTo: "7.4",
    });

    expect(preview).toMatchObject({
      cashCost: 1527,
      costIn: 808550 - 1527,
      realizedOut: -27,
    });
  });

  it.each([
    ["no quantity", { cost: 0, quantity: "0" }, "1", "1"],
    ["a zero ratio", { cost: 100, quantity: "1" }, "0", "1"],
    ["an invalid ratio", { cost: 100, quantity: "1" }, "1", "abc"],
  ])("SHOULD return null for %s", (_label, origin, ratioFrom, ratioTo) => {
    expect(
      previewConversion({
        assetClass: reit,
        destination: null,
        origin,
        ratioFrom,
        ratioTo,
      }),
    ).toBeNull();
  });

  it("SHOULD return null WHEN the reference value of the cash part is not a positive decimal", () => {
    expect(
      previewConversion({
        assetClass: reit,
        cash: { amount: 1500, referenceUnitValue: "0" },
        destination: null,
        origin: { cost: 808550, quantity: "103" },
        ratioFrom: "1",
        ratioTo: "1",
      }),
    ).toBeNull();
  });
});
