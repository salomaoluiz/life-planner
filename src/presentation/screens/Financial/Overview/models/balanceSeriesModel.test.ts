import { BalancePointEntity } from "@domain/entities/financial/DashboardEntity";

import balanceSeriesModel from "./balanceSeriesModel";
import { formatBucketLabel, formatDay } from "./overviewFormat";

function point(
  start: string,
  end: string,
  balance: number,
  accounts: { balance: number; id: string }[],
  projected = false,
): BalancePointEntity {
  return {
    accounts: accounts.map((account) => ({ ...account, name: account.id })),
    balance,
    end,
    projected,
    start,
  };
}

const points = [
  point("2026-09-01", "2026-09-30", 1000, [{ balance: 1000, id: "main" }]),
  point("2026-10-01", "2026-10-31", 1500, [
    { balance: -200, id: "fav" },
    { balance: 1700, id: "main" },
  ]),
  point(
    "2026-11-01",
    "2026-11-30",
    1200,
    [
      { balance: 300, id: "fav" },
      { balance: 900, id: "main" },
    ],
    true,
  ),
];

it("SHOULD give ONE primary series with the total WHEN there is no favorite (as before)", () => {
  const model = balanceSeriesModel({
    granularity: "MONTH",
    locale: "en-US",
    points,
  });

  expect(model.series).toHaveLength(1);
  expect(model.series[0].emphasis).toBe("primary");
  expect(model.series[0].points.map((item) => item.value)).toEqual([
    1000, 1500, 1200,
  ]);
  expect(model.series[0].points.map((item) => item.projected)).toEqual([
    false,
    false,
    true,
  ]);
  expect(model.favorite).toBeUndefined();
  expect(model.total).toEqual({ end: 1200, start: 1000 });
});

it("SHOULD give the muted total BEHIND the primary favorite line, with no value where the account does not exist yet", () => {
  const model = balanceSeriesModel({
    favoriteId: "fav",
    granularity: "MONTH",
    locale: "en-US",
    points,
  });

  expect(model.series.map((item) => item.emphasis)).toEqual([
    "muted",
    "primary",
  ]);
  expect(model.series[0].points.map((item) => item.value)).toEqual([
    1000, 1500, 1200,
  ]);
  expect(model.series[1].points.map((item) => item.value)).toEqual([
    undefined,
    -200,
    300,
  ]);
  expect(model.favorite).toEqual({ end: 300, start: -200 });
});

it("SHOULD label the axis and the screen readers like the single line did, blank for a repeated bucket label", () => {
  const model = balanceSeriesModel({
    granularity: "MONTH",
    locale: "en-US",
    points: [points[0], points[0]],
  });
  const [first, second] = model.series[0].points;

  expect(first.label).toBe(formatBucketLabel("2026-09-01", "MONTH", "en-US"));
  expect(first.accessibilityLabel).toBe(formatDay("2026-09-30", "en-US"));
  expect(second.label).toBe("");
});

it("SHOULD give no favorite summary WHEN the favorite has no value in the whole period", () => {
  const model = balanceSeriesModel({
    favoriteId: "ghost",
    granularity: "MONTH",
    locale: "en-US",
    points,
  });

  expect(model.favorite).toBeUndefined();
  expect(model.series).toHaveLength(1);
});

it("SHOULD handle an empty period", () => {
  const model = balanceSeriesModel({
    favoriteId: "fav",
    granularity: "MONTH",
    locale: "en-US",
    points: [],
  });

  expect(model.series[0].points).toEqual([]);
  expect(model.total).toBeUndefined();
});
