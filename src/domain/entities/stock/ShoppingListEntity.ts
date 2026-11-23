import { StockUnits } from "@domain/entities/stock/StockEntity";

// Spec 118 FR 9-14: AUTO follows the stock, AUTO_EDITED stopped following it after the user changed it.
export enum ShoppingListRowOrigins {
  AUTO = "AUTO",
  AUTO_EDITED = "AUTO_EDITED",
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
  owner: string;
  ownerId: string;
  status: ShoppingListStatuses;
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
}

export interface ShoppingListRowResultEntity {
  merged: boolean;
  row: ShoppingListRowEntity;
}

export interface ShoppingListTotals {
  autoCount: number;
  estimatedTotalCents: number;
  pricedCount: number;
  rowCount: number;
}
