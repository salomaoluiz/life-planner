// Spec 123 FR 19: one bar of the 12-week consumption chart (`excluded`: the item was at zero all week).
export interface ConsumptionWeekEntity {
  excluded: boolean;
  quantity: number;
  start: Date;
}

// Spec 123 FR 30-31: values are per currency and never summed across currencies.
export interface WasteCurrencyTotal {
  currency: string;
  valueCents: number;
}

export interface WasteEntity {
  byCategory: {
    category?: { id: string; name: string };
    count: number;
    totals: WasteCurrencyTotal[];
  }[];
  byReason: { count: number; reason: string; totals: WasteCurrencyTotal[] }[];
  // Earliest month with a discard (`YYYY-MM`), undefined when there is none.
  firstMonth?: string;
  month: string;
  moreItemsCount: number;
  previousMonth: {
    currency: string;
    discardCount: number;
    valueCents: number;
  }[];
  summary: { discardCount: number; itemCount: number; unpricedCount: number };
  topItems: {
    count: number;
    description: string;
    itemId: string;
    mainReason: string;
    quantity: number;
    totals: WasteCurrencyTotal[];
    unit: string;
  }[];
  totals: {
    currency: string;
    discardCount: number;
    itemCount: number;
    unpricedCount: number;
    valueCents: number;
  }[];
}
