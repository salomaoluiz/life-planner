import {
  BalanceSeriesEntity,
  DashboardGranularity,
  DashboardSource,
  DashboardSummaryEntity,
  DashboardTotalsEntity,
  DashboardType,
} from "@domain/entities/financial/DashboardEntity";
import { TransactionQueryFilter } from "@domain/entities/financial/TransactionQueryFilter";

export type FinancialDashboardRepository = {
  getBalanceSeries(
    params: GetBalanceSeriesRepositoryParams,
  ): Promise<BalanceSeriesEntity>;
  getSummary(params: DashboardQueryParams): Promise<DashboardSummaryEntity>;
  getTotals(params: GetTotalsRepositoryParams): Promise<DashboardTotalsEntity>;
};

// The period (`from`/`to`, `YYYY-MM-DD`), scope, currency and the 045 filters (their own period is ignored).
interface DashboardQueryParams {
  currency: string;
  filter: TransactionQueryFilter;
  from: string;
  ownerIds: string[];
  source?: DashboardSource;
  to: string;
}

interface GetBalanceSeriesRepositoryParams extends DashboardQueryParams {
  granularity: DashboardGranularity;
}

interface GetTotalsRepositoryParams extends DashboardQueryParams {
  groupBy: "CATEGORY" | "PERIOD" | "TAG";
  parentId?: string;
  type?: DashboardType;
}

export type {
  DashboardQueryParams,
  GetBalanceSeriesRepositoryParams,
  GetTotalsRepositoryParams,
};
