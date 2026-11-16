import type { LineChartPoint } from "@components";
import {
  InvestmentDashboardBucket,
  InvestmentDashboardPoint,
} from "@domain/entities/investment/InvestmentEntities";
import { formatBucketLabel } from "@screens/Financial/Overview/models/overviewFormat";

export interface EvolutionSeries {
  // Index of the first point with a position; `undefined` when the period has none at all.
  firstFilled: number | undefined;
  invested: LineChartPoint[];
  market: LineChartPoint[];
}

// Spec 110 FR 12: a point per bucket, valued at its last day. A bucket before the first operation is a gap (`undefined`),
// never a zero: a zero would draw a crash of the portfolio that never happened.
function toEvolutionSeries(
  series: InvestmentDashboardPoint[],
  bucket: InvestmentDashboardBucket,
  localeTag: string,
): EvolutionSeries {
  function point(
    item: InvestmentDashboardPoint,
    value: null | number,
  ): LineChartPoint {
    return {
      label: formatBucketLabel(item.date, bucket, localeTag),
      projected: false,
      value: value ?? undefined,
    };
  }

  const firstFilled = series.findIndex((item) => item.marketValue !== null);

  return {
    firstFilled: firstFilled === -1 ? undefined : firstFilled,
    invested: series.map((item) => point(item, item.invested)),
    market: series.map((item) => point(item, item.marketValue)),
  };
}

export default toEvolutionSeries;
