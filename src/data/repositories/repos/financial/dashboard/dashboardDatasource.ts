import {
  BalanceSeriesEntity,
  DashboardSummaryEntity,
  DashboardTotalsEntity,
} from "@domain/entities/financial/DashboardEntity";
import {
  DashboardQueryParams,
  GetBalanceSeriesRepositoryParams,
  GetTotalsRepositoryParams,
} from "@domain/repositories/financial";

export interface DashboardDatasource {
  getBalanceSeries(
    params: GetBalanceSeriesRepositoryParams,
  ): Promise<BalanceSeriesEntity>;
  getSummary(params: DashboardQueryParams): Promise<DashboardSummaryEntity>;
  getTotals(params: GetTotalsRepositoryParams): Promise<DashboardTotalsEntity>;
}
