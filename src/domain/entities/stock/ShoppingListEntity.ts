import { StockUnits } from "@domain/entities/stock/StockEntity";

// Spec 118 FR 9-14: AUTO follows the stock, AUTO_EDITED stopped following it after the user changed it.
export enum ShoppingListRowOrigins {
  AUTO = "AUTO",
  AUTO_EDITED = "AUTO_EDITED",
  // Spec 123: a live row of an item that reaches its minimum before the next trip of the list.
  FORECAST = "FORECAST",
  MANUAL = "MANUAL",
}

export enum ShoppingListStatuses {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export interface RestockSummaryEntity {
  count: number;
  groups: Array<{
    list: { id: string; name: string; owner: string; ownerName?: string };
    rows: Array<{ description: string; quantity: number; unit: StockUnits }>;
  }>;
  totals: Array<{
    currency: string;
    estimatedTotalCents: number;
    pricedCount: number;
  }>;
}

// A card of the lists screen: the list with its counts and estimate.
export interface ShoppingListCardEntity extends ShoppingListEntity {
  autoCount: number;
  estimatedTotalCents: number;
  forecastCount: number;
  pricedCount: number;
  rowCount: number;
}

export interface ShoppingListDetailEntity {
  groups: ShoppingListGroupEntity[];
  list: ShoppingListEntity;
  totals: ShoppingListTotals;
}

export interface ShoppingListEntity {
  currency: string;
  // Spec 120 FR 10 and 35: the market "Ir às compras" preselects and the finance category of the closing.
  defaultFinanceCategoryId?: string;
  defaultMarketId?: string;
  id: string;
  isDefault: boolean;
  name: string;
  // Spec 123 FR 9-11: "Compro a cada N dias", the next trip (a day) and the interval the closed purchases suggest.
  nextTripDate?: Date;
  owner: string;
  ownerId: string;
  purchaseIntervalDays: number;
  status: ShoppingListStatuses;
  suggestedIntervalDays?: number;
}

export interface ShoppingListGroupEntity {
  category?: { id: string; name: string; path: string };
  rows: ShoppingListRowEntity[];
  subtotalCents: number;
  unpricedCount: number;
}

export type ShoppingListPriceSource =
  | "HISTORY_ANY_MARKET"
  | "HISTORY_DEFAULT_MARKET"
  | "MANUAL"
  | "NONE";

export interface ShoppingListRowEntity {
  description: string;
  estimateCents?: number;
  // Spec 123 FR 17: only on FORECAST rows.
  forecast?: { minDate: Date; nextTripDate: Date; projectedOnTrip: number };
  id: string;
  itemId?: string;
  origin: ShoppingListRowOrigins;
  priceSource: ShoppingListPriceSource;
  quantity: number;
  stock?: {
    categoryPath?: string;
    idealQuantity?: number;
    minQuantity?: number;
    quantity: number;
  };
  unit: StockUnits;
  unitPriceCents?: number;
  // Spec 123 FR 34: the share (0-1) of what entered that was discarded in the last 90 days.
  wasteRatio90d?: number;
}

export interface ShoppingListRowResultEntity {
  merged: boolean;
  row: ShoppingListRowEntity;
}

export interface ShoppingListTotals {
  autoCount: number;
  estimatedTotalCents: number;
  forecastCount: number;
  pricedCount: number;
  rowCount: number;
}
