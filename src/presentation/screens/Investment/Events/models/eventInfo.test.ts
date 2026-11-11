import { InvestmentOperationType } from "@domain/entities/investment/enums";
import { InvestmentOperation } from "@domain/entities/investment/InvestmentEntities";

import {
  addedShares,
  bonusEvery,
  eventHeadline,
  firstSuggestion,
  hasSellsAfter,
  isEventOperation,
  isFractionSale,
  pendingFractionOf,
  pendingFractionTotal,
  quantityDelta,
} from "./eventInfo";

function operation(
  overrides: Partial<InvestmentOperation>,
): InvestmentOperation {
  return {
    accountId: null,
    costRemoved: null,
    date: "2026-01-10",
    fees: [],
    feesTotal: 0,
    fxRate: null,
    generateTransaction: false,
    gross: 0,
    id: "op",
    netAmount: null,
    quantity: "1",
    realizedResult: null,
    redemptionKind: null,
    total: 0,
    transactionId: null,
    type: InvestmentOperationType.BUY,
    unitPrice: "1",
    ...overrides,
  };
}

describe("bonusEvery", () => {
  it("SHOULD turn a percent into one new share for every N", () => {
    expect(bonusEvery("10")).toBe("10");
    expect(bonusEvery("5")).toBe("20");
    expect(bonusEvery("33.33333333")).toBe("3");
    expect(bonusEvery("0")).toBe("");
  });
});

describe("eventHeadline", () => {
  it("SHOULD name the percent of a bonus AND the ratio of a split", () => {
    expect(
      eventHeadline(
        { bonusPercent: "10", type: InvestmentOperationType.BONUS },
        "Bonus",
      ),
    ).toEqual({
      key: "investment.event.bonusHeadline",
      params: { percent: "10", type: "Bonus" },
    });
    expect(
      eventHeadline(
        { ratioFrom: "1", ratioTo: "4", type: InvestmentOperationType.SPLIT },
        "Split",
      ),
    ).toEqual({
      key: "investment.event.ratioHeadline",
      params: { from: "1", to: "4", type: "Split" },
    });
  });
});

describe("addedShares", () => {
  it("SHOULD give the shares the event added AND zero when the position shrinks", () => {
    expect(addedShares("315", "346")).toBe("31");
    expect(addedShares("3155", "315")).toBe("0");
    expect(addedShares("12.5", "50")).toBe("37.5");
  });
});

describe("hasSellsAfter", () => {
  it("SHOULD flag a sell dated after the data-com but not a fraction sale", () => {
    const sell = operation({
      date: "2026-12-01",
      type: InvestmentOperationType.SELL,
    });
    const fraction = operation({
      date: "2026-12-01",
      fractionOfOperationId: "e",
      type: InvestmentOperationType.SELL,
    });

    expect(hasSellsAfter([sell], "2026-11-18")).toBe(true);
    expect(hasSellsAfter([fraction], "2026-11-18")).toBe(false);
    expect(hasSellsAfter([sell], "2026-12-01")).toBe(false);
    expect(
      hasSellsAfter([operation({ date: "2026-12-02" })], "2026-11-18"),
    ).toBe(false);
  });
});

describe("operation kinds", () => {
  it("SHOULD tell events from fraction sales", () => {
    expect(
      isEventOperation(operation({ type: InvestmentOperationType.BONUS })),
    ).toBe(true);
    expect(isEventOperation(operation({}))).toBe(false);
    expect(isFractionSale(operation({ fractionOfOperationId: "e" }))).toBe(
      true,
    );
    expect(isFractionSale(operation({}))).toBe(false);
  });
});

describe("firstSuggestion", () => {
  it("SHOULD pick the oldest data-com", () => {
    const base = {
      assetId: "a",
      currency: "BRL" as const,
      fractionQuantity: "0",
      quantityAfter: "2",
      quantityBefore: "1",
      ticker: "X",
      type: InvestmentOperationType.SPLIT,
    };

    expect(
      firstSuggestion([
        { ...base, date: "2026-11-18", id: "late" },
        { ...base, date: "2026-03-10", id: "early" },
      ])?.id,
    ).toBe("early");
    expect(firstSuggestion([])).toBeUndefined();
  });
});

describe("pendingFractionOf", () => {
  it("SHOULD find the pending fraction of an event", () => {
    expect(pendingFractionOf([{ eventId: "e1" }], "e1")).toEqual({
      eventId: "e1",
    });
    expect(pendingFractionOf([{ eventId: "e1" }], "e2")).toBeUndefined();
  });
});

describe("quantityDelta", () => {
  it("SHOULD give the signed change of the quantity", () => {
    expect(quantityDelta("3155", "315")).toBe("-2840");
    expect(quantityDelta("315", "346")).toBe("31");
    expect(quantityDelta("5", "5")).toBe("0");
  });
});

describe("pendingFractionTotal", () => {
  it("SHOULD add the pending fractions exactly", () => {
    expect(
      pendingFractionTotal([{ quantity: "0.5" }, { quantity: "0.25" }]),
    ).toBe("0.75");
    expect(pendingFractionTotal([])).toBe("0");
  });
});
