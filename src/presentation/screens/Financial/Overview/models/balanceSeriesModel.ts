import type { LineChartPoint, LineChartSeries } from "@components";
import {
  BalancePointEntity,
  DashboardGranularity,
} from "@domain/entities/financial/DashboardEntity";

import { formatBucketLabel, formatDay } from "./overviewFormat";

interface BalanceSeriesModel {
  // The first and last value of the favorite line (screen reader summary). Undefined = no favorite line is drawn.
  favorite?: Ends;
  // Muted total first, primary favorite on top; just the total as primary WHEN there is no favorite line.
  series: LineChartSeries[];
  // The first and last value of the total. Undefined for an empty period.
  total?: Ends;
}

interface Ends {
  end: number;
  start: number;
}

interface Params {
  // The favorite account (spec 094), only when it is highlighted on this screen.
  favoriteId?: string;
  granularity: DashboardGranularity;
  locale: string;
  points: BalancePointEntity[];
}

// Spec 094 FR 17 and 22: the series of the Overview "Balance over time" chart, as a pure function of the API points.
function balanceSeriesModel(params: Params): BalanceSeriesModel {
  const { granularity, locale, points } = params;
  const base = points.map((item, index): Omit<LineChartPoint, "value"> => {
    const label = formatBucketLabel(item.start, granularity, locale);

    return {
      accessibilityLabel: formatDay(item.end, locale),
      // The projected rest of the current bucket repeats its label: the axis shows it once.
      label:
        index > 0 &&
        label ===
          formatBucketLabel(points[index - 1].start, granularity, locale)
          ? ""
          : label,
      projected: item.projected,
    };
  });
  const totals = points.map((item) => item.balance);
  const favoriteValues = params.favoriteId
    ? points.map(
        (item) =>
          item.accounts.find((account) => account.id === params.favoriteId)
            ?.balance,
      )
    : [];
  const favorite = ends(favoriteValues);
  const total = ends(totals);
  function totalSeries(emphasis: LineChartSeries["emphasis"]): LineChartSeries {
    return {
      emphasis,
      points: base.map((item, index) => ({ ...item, value: totals[index] })),
    };
  }

  if (!favorite) {
    return { series: [totalSeries("primary")], total };
  }

  return {
    favorite,
    series: [
      totalSeries("muted"),
      {
        emphasis: "primary",
        points: base.map((item, index) => ({
          ...item,
          value: favoriteValues[index],
        })),
      },
    ],
    total,
  };
}

function ends(values: (number | undefined)[]): Ends | undefined {
  const defined = values.filter(
    (value): value is number => value !== undefined,
  );

  return defined.length === 0
    ? undefined
    : { end: defined[defined.length - 1], start: defined[0] };
}

export type { BalanceSeriesModel };
export default balanceSeriesModel;
