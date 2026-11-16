import type { ColumnGroup } from "@components";
import {
  InvestmentDashboardBucket,
  InvestmentDashboardIncome,
} from "@domain/entities/investment/InvestmentEntities";
import { formatBucketLabel } from "@screens/Financial/Overview/models/overviewFormat";

// What was received per bucket, averaged over every bucket; one bucket has no average (it would equal the total).
function averageReceived(
  incomes: InvestmentDashboardIncome[],
): number | undefined {
  return incomes.length <= 1
    ? undefined
    : Math.round(
        incomes.reduce((sum, item) => sum + item.received, 0) / incomes.length,
      );
}

// Spec 110 FR 21: income is never finer than a week.
function incomeUnit(bucket: InvestmentDashboardBucket): "month" | "week" {
  return bucket === "MONTH" ? "month" : "week";
}

// The finance chart takes income and expense: the investments chart is income only, the expense stays empty.
function toIncomeGroups(
  incomes: InvestmentDashboardIncome[],
  bucket: InvestmentDashboardBucket,
  localeTag: string,
): ColumnGroup[] {
  const kind = bucket === "MONTH" ? "MONTH" : "WEEK";

  return incomes.map((item) => ({
    expense: { projected: 0, realized: 0 },
    income: { projected: item.planned, realized: item.received },
    label: formatBucketLabel(item.date, kind, localeTag),
  }));
}

export { averageReceived, incomeUnit, toIncomeGroups };
