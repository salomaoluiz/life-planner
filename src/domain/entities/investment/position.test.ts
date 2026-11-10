import { InvestmentOperationType } from "@domain/entities/investment/enums";
import { InvestmentOperation } from "@domain/entities/investment/InvestmentEntities";

import { computeTotals, feeAmounts, previewOperation } from "./position";

const { BUY, SELL } = InvestmentOperationType;

function operation(
  id: string,
  type: InvestmentOperationType,
  date: string,
  quantity: string,
  total: number,
): InvestmentOperation {
  return {
    accountId: null,
    costRemoved: null,
    date,
    fees: [],
    feesTotal: 0,
    fxRate: null,
    generateTransaction: false,
    gross: total,
    id,
    quantity,
    realizedResult: null,
    total,
    transactionId: null,
    type,
    unitPrice: "1",
  };
}

// Newest first, like the API.
const buys = [
  operation("c", BUY, "2026-06-10", "500", 510650),
  operation("b", BUY, "2026-03-10", "500", 522650),
  operation("a", BUY, "2026-01-10", "500", 440000),
];

describe("computeTotals", () => {
  it("SHOULD add the fees to a buy AND subtract them from a sell", () => {
    expect(computeTotals(BUY, "300", "10.90", [490, 60])).toEqual({
      feesExceedSale: false,
      feesTotal: 550,
      gross: 327000,
      total: 327550,
    });
    expect(computeTotals(SELL, "300", "10,90", [490, 60]).total).toBe(326450);
  });

  it("SHOULD flag fees above the sale AND treat invalid text as zero", () => {
    expect(computeTotals(SELL, "1", "5", [600])).toMatchObject({
      feesExceedSale: true,
      total: 0,
    });
    expect(computeTotals(BUY, "x", "y", [])).toMatchObject({ gross: 0 });
  });
});

describe("previewOperation", () => {
  const draft = {
    date: "2026-09-15",
    fees: [],
    quantity: "0",
    type: SELL,
    unitPrice: "0",
  };

  it("SHOULD show the new average price of a buy", () => {
    const preview = previewOperation([], {
      ...draft,
      fees: [650],
      quantity: "500",
      type: BUY,
      unitPrice: "10.20",
    });

    expect(preview.totals.total).toBe(510650);
    expect(preview.averagePrice).toBe("10.213");
    expect(preview.quantityAfter).toBe("500");
    expect(preview.realizedResult).toBeNull();
  });

  it("SHOULD reproduce the spec sell: realized +31790 with the average unchanged", () => {
    const preview = previewOperation(buys, {
      ...draft,
      fees: [550],
      quantity: "300",
      unitPrice: "10.90",
    });

    expect(preview.availableQuantity).toBe("1500");
    expect(preview.realizedResult).toBe(31790);
    expect(preview.averagePrice).toBe("9.822");
    expect(preview.quantityAfter).toBe("1200");
    expect(preview.insufficient).toBe(false);
  });

  it("SHOULD flag a sell above what was held on its date", () => {
    const preview = previewOperation(buys, {
      ...draft,
      date: "2026-02-01",
      quantity: "600",
      unitPrice: "1",
    });

    expect(preview.availableQuantity).toBe("500");
    expect(preview.insufficient).toBe(true);
    expect(preview.realizedResult).toBeNull();
    expect(preview.quantityAfter).toBe("500");
  });

  it("SHOULD take the whole cost WHEN selling everything AND start over after", () => {
    const preview = previewOperation(
      [operation("a", BUY, "2026-01-01", "10", 1000)],
      {
        ...draft,
        quantity: "10",
        unitPrice: "1.5",
      },
    );

    expect(preview.realizedResult).toBe(500);
    expect(preview.quantityAfter).toBe("0");
  });

  it("SHOULD replay earlier sells before the draft", () => {
    const history = [
      operation("s", SELL, "2026-02-01", "10", 1500),
      operation("a", BUY, "2026-01-01", "10", 1000),
    ];
    const preview = previewOperation(history, {
      ...draft,
      date: "2026-03-01",
      quantity: "1",
      type: BUY,
      unitPrice: "2",
    });

    expect(preview.availableQuantity).toBe("0");
    expect(preview.averagePrice).toBe("2");
  });

  it("SHOULD give a null average WHEN nothing is held", () => {
    expect(previewOperation([], draft).averagePrice).toBeNull();
  });

  it("SHOULD remove a proportional cost on a partial sell after another sell", () => {
    const history = [
      operation("s", SELL, "2026-02-01", "3", 0),
      operation("a", BUY, "2026-01-01", "10", 1000),
    ];
    const preview = previewOperation(history, {
      ...draft,
      date: "2026-03-01",
      quantity: "7",
      unitPrice: "1",
    });

    // 3 sold at cost 300 leaves 7 at 700.
    expect(preview.realizedResult).toBe(700 - 700);
  });
});

describe("feeAmounts", () => {
  it("SHOULD list the amounts", () => {
    expect(feeAmounts([{ amount: 1 }, { amount: 5 }])).toEqual([1, 5]);
  });
});
