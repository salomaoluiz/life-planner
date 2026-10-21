export interface BalancePointEntity {
  accounts: { balance: number; id: string; name: string }[];
  balance: number;
  end: string;
  projected: boolean;
  start: string;
}
export interface BalanceSeriesEntity {
  currency: string;
  granularity: DashboardGranularity;
  points: BalancePointEntity[];
}
export interface CategoryTotalEntity extends DashboardAmounts {
  archived: boolean;
  categoryId: string;
  count: number;
  hasChildren: boolean;
  name: string;
  // The rows of the parent category itself (only when a parent was asked).
  self: boolean;
}

export interface DashboardAmounts {
  projected: number;
  realized: number;
}

export interface DashboardCurrencyOption {
  accounts: number;
  cards: number;
  code: string;
}

// Spec 046: what the Finances overview reads. Money is integer cents, dates `YYYY-MM-DD`.
export type DashboardGranularity = "DAY" | "MONTH" | "WEEK";

export type DashboardSource = "ACCOUNT" | "CARD";

export interface DashboardSummaryEntity {
  balance: { current: number; previous: number };
  currencies: DashboardCurrencyOption[];
  currency: string;
  expense: DashboardAmounts & { previous: number };
  income: DashboardAmounts & { previous: number };
}

export type DashboardTotalsEntity =
  | { bucket: "MONTH" | "WEEK"; groupBy: "PERIOD"; items: PeriodTotalEntity[] }
  | { groupBy: "CATEGORY"; items: CategoryTotalEntity[]; total: number }
  | {
      groupBy: "TAG";
      items: TagTotalEntity[];
      total: number;
      untagged: DashboardAmounts & { count: number };
    };

export type DashboardType = "EXPENSE" | "INCOME";

export interface PeriodTotalEntity {
  end: string;
  expense: DashboardAmounts;
  income: DashboardAmounts;
  start: string;
}

export interface TagTotalEntity extends DashboardAmounts {
  count: number;
  name: string;
  tagId: string;
}
