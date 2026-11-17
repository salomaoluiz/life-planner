import { InvestmentOperationType } from "@domain/entities/investment/enums";

import {
  makeConversion,
  makeDetail,
  makeOperation,
  makePosition,
} from "../../mocks/fixtures";
import {
  canConvert,
  conversionDeleteSummary,
  conversionOutcome,
  isConversionOperation,
} from "./conversionModel";

const out = makeOperation({
  conversion: {
    assetId: "asset-to",
    conversionId: "conv-1",
    locked: false,
    ratioFrom: "1",
    ratioTo: "7.4",
    ticker: "BTHF11",
  },
  conversionCost: 808550,
  id: "op-out",
  quantity: "103",
  type: InvestmentOperationType.CONVERSION_OUT,
});

describe("canConvert", () => {
  it("SHOULD allow an active asset WITH a position", () => {
    expect(canConvert(makeDetail())).toBe(true);
  });

  it.each([
    ["archived", { status: "ARCHIVED" }],
    ["fixed income", { assetClass: "FIXED_INCOME" }],
    ["empty", { position: makePosition({ quantity: "0" }) }],
  ])("SHOULD refuse an %s asset", (_name, override) => {
    expect(canConvert(makeDetail(override as never))).toBe(false);
  });
});

describe("conversionOutcome", () => {
  it("SHOULD give the quotas that come in AND the fraction from the stored snapshot", () => {
    const outcome = conversionOutcome(
      makeDetail({ assetClass: "BR_REIT" as never, operations: [out] }),
      out,
    );

    expect(outcome).toMatchObject({
      fractionQuantity: "0.2",
      quantityIn: "762",
    });
  });

  it("SHOULD return nothing for any other operation", () => {
    expect(conversionOutcome(makeDetail(), makeOperation())).toBeUndefined();
    expect(isConversionOperation(out)).toBe(true);
    expect(isConversionOperation(makeOperation())).toBe(false);
  });
});

describe("conversionDeleteSummary", () => {
  it("SHOULD list the fraction sale AND the positions after deleting", () => {
    const sale = makeOperation({
      date: "2026-10-20",
      fractionOfOperationId: "op-in",
      gross: 230,
      id: "sale",
      quantity: "0.2",
      transactionId: "tx-sale",
    });
    const summary = conversionDeleteSummary(
      makeConversion(),
      makeDetail({
        id: "asset-to",
        operations: [sale],
        position: makePosition({ cost: 859338, quantity: "812" }),
      }),
      makeDetail({ operations: [{ ...out, transactionId: "tx-cash" }] }),
    );

    expect(summary).toEqual({
      cashEntry: true,
      destinationAfter: { cost: 51000, quantity: "50" },
      originAfter: { quantity: "103" },
      sale: { amount: 230, date: "2026-10-20", quantity: "0.2" },
      saleHasEntry: true,
    });
  });

  it("SHOULD have no sale WHEN the fraction was not sold", () => {
    const summary = conversionDeleteSummary(
      makeConversion(),
      makeDetail({ operations: [] }),
      makeDetail({ operations: [{ ...out, transactionId: null }] }),
    );

    expect(summary.sale).toBeUndefined();
    expect(summary.cashEntry).toBe(false);
  });
});
