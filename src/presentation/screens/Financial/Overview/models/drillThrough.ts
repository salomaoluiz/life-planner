import {
  EMPTY_FILTERS,
  TransactionFilters,
} from "@screens/Financial/Transactions/models/transactionFilters";

import { OverviewPeriod } from "./overviewPeriod";

// Spec 046 FR 17: the Transactions filters for "see this category / tag": the dashboard's period and Filters, plus
// the category or tag chosen. The search and situation travel too; the scope and type are set by the caller.
function toDrillThroughFilters(
  dashboard: TransactionFilters,
  period: OverviewPeriod,
  pick: { categoryId?: string; tagId?: string },
): TransactionFilters {
  return {
    ...EMPTY_FILTERS,
    ...dashboard,
    categoryIds: pick.categoryId
      ? [...new Set([pick.categoryId, ...dashboard.categoryIds])]
      : dashboard.categoryIds,
    period: { from: period.from, to: period.to },
    tagIds: pick.tagId
      ? [...new Set([pick.tagId, ...dashboard.tagIds])]
      : dashboard.tagIds,
  };
}

export default toDrillThroughFilters;
