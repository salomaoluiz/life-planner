import {
  ClosedPurchaseEntity,
  ClosePreviewEntity,
  ItemPricePointEntity,
  ListPurchasesEntity,
  MarketEntity,
  PendingPurchaseEntity,
  PurchaseEntity,
  PurchaseRowByCodeEntity,
  PurchaseRowEntity,
  PurchaseRowResultEntity,
  PurchaseRowStates,
  PurchaseStatuses,
  PurchaseViewEntity,
} from "@domain/entities/stock/PurchaseEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";

type Json = Record<string, unknown>;

export function parseClosedPurchase(data: Json): ClosedPurchaseEntity {
  return {
    list: data.list as ClosedPurchaseEntity["list"],
    purchase: parsePurchase(data.purchase as Json),
    splitId: optional(data.splitId),
    stock: data.stock as ClosedPurchaseEntity["stock"],
    transactionId: optional(data.transactionId),
  };
}

export function parseClosePreview(data: Json): ClosePreviewEntity {
  return {
    expirations: (data.expirations as ClosePreviewEntity["expirations"]) ?? [],
    financeError: optional(data.financeError),
    financeParts: data.financeParts
      ? (data.financeParts as Json[]).map((part) => ({
          categoryId: optional(part.categoryId),
          kind: part.kind as "ADJUSTMENT" | "CATEGORY" | "NO_PRICE",
          valueCents: part.valueCents as number,
        }))
      : undefined,
    missingPrices: (data.missingPrices as string[]) ?? [],
    needsDefaultFinanceCategory: data.needsDefaultFinanceCategory === true,
    newItems: ((data.newItems as Json[]) ?? []).map((item) => ({
      description: item.description as string,
      rowId: item.rowId as string,
      suggestion: optional(item.suggestion),
      unit: optional(item.unit),
    })),
    unknownWeight: (data.unknownWeight as string[]) ?? [],
  };
}

export function parseItemPrices(data: Json): {
  items: ItemPricePointEntity[];
  nextCursor?: string;
} {
  return {
    items: (data.items as ItemPricePointEntity[]) ?? [],
    nextCursor: optional(data.nextCursor),
  };
}

export function parseListPurchases(data: Json): ListPurchasesEntity {
  return {
    items: ((data.items as Json[]) ?? []).map((item) =>
      "purchase" in item ? parsePurchaseView(item) : parsePurchase(item),
    ),
    nextCursor: optional(data.nextCursor),
  };
}

export function parseMarket(data: Json): MarketEntity {
  return {
    id: data.id as string,
    name: data.name as string,
    neighborhood: optional<string>(data.neighborhood),
    owner: data.owner as string,
    ownerId: data.ownerId as string,
    status: data.status as MarketEntity["status"],
  };
}

export function parsePendingPurchases(data: Json): PendingPurchaseEntity[] {
  return ((data.items as Json[]) ?? []).map((item) => ({
    cartTotalCents: item.cartTotalCents as number,
    checkedCount: item.checkedCount as number,
    id: item.id as string,
    lastActivityAt: item.lastActivityAt as string,
    listId: item.listId as string,
    listName: item.listName as string,
    marketName: item.marketName as string,
    status: item.status as PurchaseStatuses,
  }));
}

export function parsePurchase(data: Json): PurchaseEntity {
  const closing = data.closing as Json | null | undefined;

  return {
    accountId: optional(data.accountId),
    closing: closing
      ? { at: closing.at as string, by: closing.by as string }
      : undefined,
    creditCardId: optional(data.creditCardId),
    currency: data.currency as string,
    id: data.id as string,
    invoiceMonth: optional(data.invoiceMonth),
    lastActivityAt: data.lastActivityAt as string,
    listId: data.listId as string,
    marketId: data.marketId as string,
    purchaseDate: data.purchaseDate as string,
    receiptTotalCents: optional(data.receiptTotalCents),
    splitId: optional(data.splitId),
    startedBy: optional(data.startedBy),
    status: data.status as PurchaseStatuses,
    transactionId: optional(data.transactionId),
  };
}

export function parsePurchaseRow(data: Json): PurchaseRowEntity {
  const lastPrice = data.lastPrice as Json | null | undefined;

  return {
    checkedAt: data.checkedAt as string,
    checkedBy: optional(data.checkedBy),
    description: data.description as string,
    expirationDate: optional(data.expirationDate),
    id: data.id as string,
    itemId: optional(data.itemId),
    lastPrice: lastPrice
      ? {
          date: lastPrice.date as string,
          unitPriceCents: lastPrice.unitPriceCents as number,
        }
      : undefined,
    lineTotalCents: optional(data.lineTotalCents),
    listRowId: optional(data.listRowId),
    priceChangePercent: optional(data.priceChangePercent),
    priceInput: optional(data.priceInput),
    quantity: optional(data.quantity),
    state: data.state as PurchaseRowStates,
    unit: optional<StockUnits>(data.unit),
    unitPriceCents: optional(data.unitPriceCents),
    unknownPrice: data.unknownPrice === true,
  };
}

export function parsePurchaseRowByCode(data: Json): PurchaseRowByCodeEntity {
  return {
    row: parsePurchaseRow(data.row as Json),
    source: data.source as PurchaseRowByCodeEntity["source"],
  };
}

export function parsePurchaseRowResult(data: Json): PurchaseRowResultEntity {
  return {
    conflict: optional(data.conflict),
    convertedToOutside: data.convertedToOutside === true,
    row: parsePurchaseRow(data.row as Json),
  };
}

export function parsePurchaseView(data: Json): PurchaseViewEntity {
  return {
    cart: data.cart as PurchaseViewEntity["cart"],
    forecastCents: data.forecastCents as number,
    otherCarts: (data.otherCarts as PurchaseViewEntity["otherCarts"]) ?? [],
    purchase: parsePurchase(data.purchase as Json),
    remaining: data.remaining as PurchaseViewEntity["remaining"],
    rows: ((data.rows as Json[]) ?? []).map(parsePurchaseRow),
  };
}

// The API shape (camelCase, money in minor units, nulls for absent values) mapped to the domain entities (spec 120 §7).
function optional<T>(value: unknown): T | undefined {
  return value === null || value === undefined ? undefined : (value as T);
}
