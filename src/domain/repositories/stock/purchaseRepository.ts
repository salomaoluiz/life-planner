import {
  ClosedPurchaseEntity,
  ClosePreviewEntity,
  ItemPricePointEntity,
  ListPurchasesEntity,
  MarketEntity,
  PendingPurchaseEntity,
  PurchaseEntity,
  PurchasePriceInputs,
  PurchaseRowResultEntity,
  PurchaseRowStates,
  PurchaseViewEntity,
} from "@domain/entities/stock/PurchaseEntity";

export interface ClosePurchaseParams {
  accountId?: string;
  clientId?: string;
  creditCardId?: string;
  date: string;
  defaultFinanceCategoryId?: string;
  id: string;
  invoiceMonth?: string;
  marketId?: string;
  receiptTotalCents: number;
  rows: ClosePurchaseRowParams[];
}

export interface ClosePurchaseRowParams {
  expirationDate?: string;
  itemId?: string;
  lineTotalCents?: number;
  newItem?: { categoryId?: string; description: string; locationId?: string };
  quantity?: number;
  rowId: string;
  unitPriceCents?: number;
  unknownPrice?: boolean;
}

export interface CreateMarketParams {
  name: string;
  neighborhood?: string;
  owner: string;
  ownerId: string;
}

export interface PurchaseRepository {
  changePurchaseStatus(params: {
    action: "DISCARD" | "END" | "REOPEN";
    clientId?: string;
    id: string;
  }): Promise<PurchaseEntity>;
  closePurchase(params: ClosePurchaseParams): Promise<ClosedPurchaseEntity>;
  closingLock(params: { id: string; release?: boolean }): Promise<void>;
  createMarket(params: CreateMarketParams): Promise<MarketEntity>;
  deleteClosedPurchase(
    id: string,
  ): Promise<Array<{ description: string; rowId: string }>>;
  deletePurchaseRow(params: {
    clientId?: string;
    purchaseId: string;
    rowId: string;
  }): Promise<void>;
  getClosePreview(params: {
    id: string;
    receiptTotalCents?: number;
  }): Promise<ClosePreviewEntity>;
  getItemPrices(params: {
    cursor?: string;
    itemId: string;
    marketId?: string;
  }): Promise<{ items: ItemPricePointEntity[]; nextCursor?: string }>;
  getListPurchases(params: {
    closed?: boolean;
    cursor?: string;
    listId: string;
  }): Promise<ListPurchasesEntity>;
  getMarkets(params: { ownerId?: string }): Promise<MarketEntity[]>;
  getPendingPurchases(): Promise<PendingPurchaseEntity[]>;
  getPurchase(id: string): Promise<PurchaseViewEntity>;
  mergePurchase(params: {
    id: string;
    targetId: string;
  }): Promise<PurchaseEntity>;
  startPurchase(params: {
    id: string;
    listId: string;
    marketId: string;
    purchaseDate: string;
  }): Promise<PurchaseEntity>;
  updateClosedPurchase(params: {
    accountId?: string;
    creditCardId?: string;
    date?: string;
    id: string;
    invoiceMonth?: string;
    marketId?: string;
    receiptTotalCents?: number;
    rows?: Array<{
      lineTotalCents?: number;
      rowId: string;
      unitPriceCents?: number;
    }>;
  }): Promise<PurchaseEntity>;
  upsertPurchaseRow(
    params: UpsertPurchaseRowParams,
  ): Promise<PurchaseRowResultEntity>;
}

export interface UpsertPurchaseRowParams {
  clientId?: string;
  description?: string;
  expirationDate?: null | string;
  itemId?: string;
  lineTotalCents?: null | number;
  listRowId?: string;
  priceInput?: PurchasePriceInputs;
  purchaseId: string;
  quantity?: null | number;
  rowId: string;
  state?: PurchaseRowStates;
  unit?: string;
  unitPriceCents?: null | number;
}
