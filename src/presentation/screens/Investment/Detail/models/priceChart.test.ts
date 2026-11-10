import {
  InvestmentOperationType,
  InvestmentPriceKind,
} from "@domain/entities/investment/enums";
import { InvestmentPriceHistory } from "@domain/entities/investment/InvestmentEntities";

import { makeOperation } from "../../mocks/fixtures";
import {
  axisLabel,
  buildChartPoints,
  hasOperationPoints,
  quantityOn,
} from "./priceChart";

const operations = [
  makeOperation({
    date: "2025-11-04",
    id: "buy",
    quantity: "20",
    type: InvestmentOperationType.BUY,
  }),
  makeOperation({
    date: "2026-06-01",
    id: "sell",
    quantity: "5",
    type: InvestmentOperationType.SELL,
  }),
];
const history: InvestmentPriceHistory = {
  currency: "USD",
  historyStartsAt: "2026-11-04",
  points: [
    {
      date: "2025-11-04",
      fxRate: "5.2236",
      kind: InvestmentPriceKind.OPERATION,
      price: "182.10",
    },
    {
      date: "2026-11-04",
      fxRate: "5.5412",
      kind: InvestmentPriceKind.CLOSE,
      price: "228.57",
    },
    {
      date: "2026-11-05",
      fxRate: null,
      kind: InvestmentPriceKind.CLOSE,
      price: "231.40",
    },
  ],
};
function label(day: string) {
  return day;
}

describe("quantityOn", () => {
  it("SHOULD add buys AND subtract sells up to the day", () => {
    expect(quantityOn(operations, "2025-12-01")).toBe(20);
    expect(quantityOn(operations, "2026-06-01")).toBe(15);
    expect(quantityOn(operations, "2025-01-01")).toBe(0);
  });
});

describe("buildChartPoints", () => {
  it("SHOULD draw the price WITH dashed points before the first close", () => {
    const points = buildChartPoints(history, "price", operations, label);

    expect(
      points.map((point) => [point.label, point.value, point.projected]),
    ).toEqual([
      ["2025-11-04", 182.1, true],
      ["2026-11-04", 228.57, false],
      ["2026-11-05", 231.4, false],
    ]);
  });

  it("SHOULD multiply by the quantity held and the rate in the BRL position mode, skipping points without a rate", () => {
    const points = buildChartPoints(history, "position", operations, label);

    expect(points).toHaveLength(2);
    expect(points[0].value).toBeCloseTo(182.1 * 20 * 5.2236);
    expect(points[1].value).toBeCloseTo(228.57 * 15 * 5.5412);
  });

  it("SHOULD return nothing WITHOUT a history", () => {
    expect(buildChartPoints(undefined, "price", operations, label)).toEqual([]);
  });

  it("SHOULD drop a point that is not a number", () => {
    const broken = {
      ...history,
      points: [{ ...history.points[0], price: "x" }],
    };

    expect(buildChartPoints(broken, "price", operations, label)).toEqual([]);
  });
});

describe("axis helpers", () => {
  it("SHOULD format a day as day and month AND tell whether operations are drawn", () => {
    expect(axisLabel("2026-11-04", "pt-BR")).toBe("04/11");
    expect(hasOperationPoints(history)).toBe(true);
    expect(hasOperationPoints({ ...history, points: [] })).toBe(false);
    expect(hasOperationPoints(undefined)).toBe(false);
  });
});
