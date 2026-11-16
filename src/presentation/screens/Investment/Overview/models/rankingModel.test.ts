import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import { InvestmentDashboardRanking } from "@domain/entities/investment/InvestmentEntities";

import {
  barRatio,
  captionKey,
  RANKING_VISIBLE,
  rankingView,
} from "./rankingModel";

function row(index: number, assetClass = InvestmentAssetClass.BR_STOCK) {
  return {
    assetClass,
    assetId: `a${index}`,
    currency: "BRL",
    name: `Asset ${index}`,
    openResult: 0,
    openResultPercent: null,
    share: 0.05,
    ticker: `T${index}`,
    value: 1000 - index,
    valueKind: "QUOTE",
  } as InvestmentDashboardRanking;
}

const many = Array.from({ length: 14 }, (_, index) => row(index));

it("SHOULD show the 10 biggest AND offer to see all WHEN there are more", () => {
  const view = rankingView(many, undefined, false);

  expect(RANKING_VISIBLE).toBe(10);
  expect(view.rows).toHaveLength(10);
  expect(view.total).toBe(14);
  expect(view.canExpand).toBe(true);
});

it("SHOULD show everything WHEN expanded, with no second offer", () => {
  const view = rankingView(many, undefined, true);

  expect(view.rows).toHaveLength(14);
  expect(view.canExpand).toBe(false);
});

it("SHOULD not offer to see all WHEN there are 10 or fewer", () => {
  expect(rankingView(many.slice(0, 10), undefined, false).canExpand).toBe(
    false,
  );
});

it("SHOULD keep only the tapped class AND count the total of that class", () => {
  const mixed = [
    row(0, InvestmentAssetClass.FOREIGN_STOCK),
    row(1),
    row(2, InvestmentAssetClass.FOREIGN_STOCK),
  ];
  const view = rankingView(mixed, InvestmentAssetClass.FOREIGN_STOCK, false);

  expect(view.rows.map((item) => item.assetId)).toEqual(["a0", "a2"]);
  expect(view.total).toBe(2);
});

it("SHOULD scale the bar to the biggest row (never above 1, never NaN)", () => {
  const rows = [row(0), { ...row(1), value: 500 }, { ...row(2), value: 0 }];

  expect(barRatio(rows[0], rows)).toBe(1);
  expect(barRatio(rows[1], rows)).toBeCloseTo(500 / 1000);
  expect(barRatio(rows[2], rows)).toBe(0);
  expect(barRatio(row(0), [])).toBe(0);
});

it("SHOULD name how the value was found", () => {
  expect(captionKey({ ...row(0), valueKind: "FIXED_INCOME_NET" })).toBe(
    "investment.overview.ranking.estimatedNet",
  );
  expect(captionKey({ ...row(0), valueKind: "MANUAL" })).toBe(
    "investment.overview.ranking.manualValue",
  );
  expect(captionKey({ ...row(0), valueKind: "QUOTE" })).toBeUndefined();
  expect(captionKey({ ...row(0), valueKind: "COST" })).toBe(
    "investment.overview.ranking.atCost",
  );
});
