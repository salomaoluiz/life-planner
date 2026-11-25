import { StockUnits } from "@domain/entities/stock/StockEntity";

export enum PurchaseRowStates {
  IN_CART = "IN_CART",
  NOT_FOUND = "NOT_FOUND",
}

// Spec 120: OPEN → ENDED → CLOSED, or DISCARDED. Only CLOSED writes stock and finance.
export enum PurchaseStatuses {
  CLOSED = "CLOSED",
  DISCARDED = "DISCARDED",
  ENDED = "ENDED",
  OPEN = "OPEN",
}

export interface ClosedPurchaseEntity {
  list: { removedRows: number; updatedRows: number };
  purchase: PurchaseEntity;
  splitId?: string;
  stock: { lots: number; newItems: number };
  transactionId?: string;
}
export interface ClosePreviewEntity {
  expirations: Array<{ rowId: string; suggestedDate: string }>;
  financeError?: string;
  financeParts?: Array<{
    categoryId?: string;
    kind: PurchaseFinancePartKinds;
    valueCents: number;
  }>;
  missingPrices: string[];
  needsDefaultFinanceCategory: boolean;
  newItems: Array<{
    description: string;
    rowId: string;
    suggestion?: { description: string; itemId: string };
    unit?: string;
  }>;
  unknownWeight: string[];
}

export interface ItemPricePointEntity {
  date: string;
  id: string;
  marketId: string;
  unitPriceCents: number;
}

export interface ListPurchasesEntity {
  items: Array<PurchaseEntity | PurchaseViewEntity>;
  nextCursor?: string;
}

export interface MarketEntity {
  id: string;
  name: string;
  neighborhood?: string;
  owner: string;
  ownerId: string;
  status: "ACTIVE" | "ARCHIVED";
}

export interface PendingPurchaseEntity {
  cartTotalCents: number;
  checkedCount: number;
  id: string;
  lastActivityAt: string;
  listId: string;
  listName: string;
  marketName: string;
  status: PurchaseStatuses;
}

export interface PurchaseEntity {
  accountId?: string;
  closing?: { at: string; by: string };
  creditCardId?: string;
  currency: string;
  id: string;
  invoiceMonth?: string;
  lastActivityAt: string;
  listId: string;
  marketId: string;
  purchaseDate: string;
  receiptTotalCents?: number;
  splitId?: string;
  startedBy?: string;
  status: PurchaseStatuses;
  transactionId?: string;
}

export type PurchaseFinancePartKinds = "ADJUSTMENT" | "CATEGORY" | "NO_PRICE";

export interface PurchaseOtherCartEntity {
  listRowId: string;
  marketName: string;
  purchaseId: string;
  userName: string;
}

export type PurchasePriceInputs = "LINE" | "UNIT";

export interface PurchaseRowByCodeEntity {
  row: PurchaseRowEntity;
  source: PurchaseRowCodeSource;
}

// Spec 121 FR 25: where the row of a scanned code came from.
export type PurchaseRowCodeSource = "ITEM" | "NONE" | "OPEN_FOOD_FACTS";

export interface PurchaseRowEntity {
  checkedAt: string;
  checkedBy?: { id: string; name: string };
  description: string;
  expirationDate?: string;
  id: string;
  itemId?: string;
  lastPrice?: { date: string; unitPriceCents: number };
  lineTotalCents?: number;
  listRowId?: string;
  priceChangePercent?: number;
  priceInput?: PurchasePriceInputs;
  quantity?: number;
  state: PurchaseRowStates;
  unit?: StockUnits;
  unitPriceCents?: number;
  unknownPrice: boolean;
}

export interface PurchaseRowResultEntity {
  conflict?: { purchaseId: string; userName: string };
  convertedToOutside: boolean;
  row: PurchaseRowEntity;
}

// The purchase with its rows, the cart, what is left on the list and the forecast (FR 19-20).
export interface PurchaseViewEntity {
  cart: { count: number; totalCents: number; unpricedCount: number };
  forecastCents: number;
  otherCarts: PurchaseOtherCartEntity[];
  purchase: PurchaseEntity;
  remaining: { count: number; estimatedCents: number; pricedCount: number };
  rows: PurchaseRowEntity[];
}
