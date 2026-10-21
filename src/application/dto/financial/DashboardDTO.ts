import {
  BalanceSeriesEntity,
  DashboardSummaryEntity,
  DashboardTotalsEntity,
} from "@domain/entities/financial/DashboardEntity";

// The entities are plain data (no behaviour to hide), so the DTOs are the same shapes.
export type BalanceSeriesDTO = BalanceSeriesEntity;
export type DashboardSummaryDTO = DashboardSummaryEntity;
export type DashboardTotalsDTO = DashboardTotalsEntity;
