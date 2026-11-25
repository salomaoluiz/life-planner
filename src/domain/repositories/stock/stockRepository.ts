import {
  RestockSummaryEntity,
  ShoppingListCardEntity,
  ShoppingListDetailEntity,
  ShoppingListEntity,
  ShoppingListRowEntity,
  ShoppingListRowResultEntity,
} from "@domain/entities/stock/ShoppingListEntity";
import {
  AiUsageEntity,
  ItemSuggestionEntity,
  StockBarcodeLookupEntity,
} from "@domain/entities/stock/StockBarcodeEntity";
import {
  StockCategoryEntity,
  StockLocationDetailEntity,
  StockLocationEntity,
  StockOwnerChangePreviewEntity,
  StockSuggestionEntity,
} from "@domain/entities/stock/StockCatalogEntity";
import StockEntity from "@domain/entities/stock/StockEntity";
import StockMovementEntity from "@domain/entities/stock/StockMovementEntity";
import {
  ConsumptionWeekEntity,
  WasteEntity,
} from "@domain/entities/stock/StockWasteEntity";
import { PurchaseRepository } from "@domain/repositories/stock/purchaseRepository";

export interface StockOwnerParams {
  owner: string;
  ownerId: string;
}

export type StockRepository = PurchaseRepository & {
  addShoppingListRow(
    params: AddShoppingListRowRepositoryParams,
  ): Promise<ShoppingListRowResultEntity>;
  createShoppingList(
    params: CreateShoppingListRepositoryParams,
  ): Promise<ShoppingListEntity>;
  createStockCategory(
    params: CreateStockCategoryRepositoryParams,
  ): Promise<void>;
  createStockCategorySuggestions(params: StockOwnerParams): Promise<void>;
  createStockItem(
    params: CreateStockItemRepositoryParams,
  ): Promise<StockEntity>;
  createStockLocation(
    params: CreateStockLocationRepositoryParams,
  ): Promise<void>;
  createStockLocationSuggestions(params: StockOwnerParams): Promise<void>;
  createStockMovement(
    params: CreateStockMovementRepositoryParams,
  ): Promise<{ item: StockEntity; movements: StockMovementEntity[] }>;
  deleteShoppingListRow(rowId: string): Promise<void>;
  deleteStockCategory(
    params: DeleteStockCatalogRepositoryParams,
  ): Promise<void>;
  deleteStockItem(params: DeleteStockItemRepositoryParams): Promise<void>;
  deleteStockLocation(
    params: DeleteStockCatalogRepositoryParams,
  ): Promise<void>;
  dismissLeftover(params: DismissLeftoverRepositoryParams): Promise<void>;
  getAiUsage(): Promise<AiUsageEntity>;
  getConsumptionWeeks(
    params: GetConsumptionWeeksRepositoryParams,
  ): Promise<ConsumptionWeekEntity[]>;
  getFrequentStockItems(limit?: number): Promise<StockEntity[]>;
  getOwnerChangePreview(
    params: OwnerChangePreviewRepositoryParams,
  ): Promise<StockOwnerChangePreviewEntity>;
  getRestockSummary(): Promise<RestockSummaryEntity>;
  getShoppingList(id: string): Promise<ShoppingListDetailEntity>;
  getShoppingLists(
    params: GetShoppingListsRepositoryParams,
  ): Promise<ShoppingListCardEntity[]>;
  getStockCategories(
    params: GetStockCatalogRepositoryParams,
  ): Promise<StockCategoryEntity[]>;
  getStockItem(id: string): Promise<StockEntity>;
  getStockItems(ownerId: string): Promise<StockEntity[]>;
  getStockLocation(id: string): Promise<StockLocationDetailEntity>;
  getStockLocations(
    params: GetStockCatalogRepositoryParams,
  ): Promise<StockLocationEntity[]>;
  getStockMovements(
    params: GetStockMovementsRepositoryParams,
  ): Promise<{ items: StockMovementEntity[]; nextCursor?: string }>;
  getWaste(params: GetWasteRepositoryParams): Promise<WasteEntity>;
  lookupStockBarcode(code: string): Promise<StockBarcodeLookupEntity>;
  setStockGestureExpiration(
    params: StockGestureExpirationRepositoryParams,
  ): Promise<StockEntity>;
  suggestStockItem(
    params: SuggestStockItemRepositoryParams,
  ): Promise<ItemSuggestionEntity>;
  suggestStockItems(
    params: SuggestStockItemsRepositoryParams,
  ): Promise<StockSuggestionEntity[]>;
  undoStockGesture(params: StockGestureRepositoryParams): Promise<StockEntity>;
  updateShoppingList(
    params: UpdateShoppingListRepositoryParams,
  ): Promise<ShoppingListEntity>;
  updateShoppingListRow(
    params: UpdateShoppingListRowRepositoryParams,
  ): Promise<ShoppingListRowEntity>;
  updateStockCategory(
    params: UpdateStockCategoryRepositoryParams,
  ): Promise<void>;
  updateStockItem(params: UpdateStockItemRepositoryParams): Promise<void>;
  updateStockLocation(
    params: UpdateStockLocationRepositoryParams,
  ): Promise<void>;
};

// Spec 118: shopping lists. `undefined` = unchanged, `null` clears an estimate.
interface AddShoppingListRowRepositoryParams {
  description?: string;
  estimatedUnitPriceCents?: number;
  itemId?: string;
  listId: string;
  origin?: string;
  quantity: number;
  restore?: boolean;
  unit?: string;
}

interface CreateShoppingListRepositoryParams extends StockOwnerParams {
  currency?: string;
  isDefault?: boolean;
  name: string;
}

interface CreateStockCategoryRepositoryParams extends StockOwnerParams {
  financeCategoryId?: string;
  name: string;
  parentId?: string;
}

// Days are `Date`s (local calendar days); `null` clears an optional on update.
interface CreateStockItemRepositoryParams extends StockOwnerParams {
  barcode?: string;
  brand?: string;
  categoryId?: string;
  description: string;
  estimatedUnitPriceCents?: number;
  expirationDate?: Date;
  idealQuantity?: number;
  locationId?: string;
  minQuantity?: number;
  notes?: string;
  openedShelfLifeDays?: number;
  purchaseDate?: Date;
  quantity: number;
  quickStep?: number;
  shoppingListId?: string;
  stockOnly: boolean;
  unit: string;
  warnDaysClosed: number;
  warnDaysOpened: number;
}

interface CreateStockLocationRepositoryParams extends StockOwnerParams {
  name: string;
}

interface CreateStockMovementRepositoryParams {
  clientId?: string;
  countedQuantity?: number;
  expirationDate?: Date;
  expiredLots?: string;
  gestureId?: string;
  itemId: string;
  lotId?: string;
  note?: string;
  ownerId: string;
  purchaseDate?: Date;
  quantity?: number;
  reason?: string;
  target?: string;
  type: string;
}

interface DeleteStockCatalogRepositoryParams {
  id: string;
}

interface DeleteStockItemRepositoryParams {
  id: string;
  ownerId: string;
}

interface DismissLeftoverRepositoryParams {
  // false undoes the dismissal.
  dismissed: boolean;
  lotId: string;
}

interface GetConsumptionWeeksRepositoryParams {
  itemId: string;
}

interface GetShoppingListsRepositoryParams {
  includeArchived?: boolean;
  ownerId?: string;
}

interface GetStockCatalogRepositoryParams extends StockOwnerParams {
  includeArchived?: boolean;
}

interface GetStockMovementsRepositoryParams {
  cursor?: string;
  itemId: string;
}

interface GetWasteRepositoryParams {
  all?: boolean;
  month?: string;
  ownerId?: string;
}

interface OwnerChangePreviewRepositoryParams extends StockOwnerParams {
  itemId: string;
}

interface StockGestureExpirationRepositoryParams extends StockGestureRepositoryParams {
  expirationDate: Date;
}

interface StockGestureRepositoryParams {
  clientId?: string;
  gestureId: string;
  // The owner whose cached list the change invalidates.
  ownerId: string;
}

// Spec 121: exactly one of `barcode` / `name`.
interface SuggestStockItemRepositoryParams extends StockOwnerParams {
  barcode?: string;
  name?: string;
}

interface SuggestStockItemsRepositoryParams {
  owner?: string;
  ownerId?: string;
  q: string;
}

interface UpdateShoppingListRepositoryParams {
  currency?: string;
  defaultFinanceCategoryId?: null | string;
  defaultMarketId?: null | string;
  id: string;
  isDefault?: boolean;
  name?: string;
  // Spec 123 FR 9: "Compro a cada N dias" (1-90).
  purchaseIntervalDays?: number;
  status?: string;
}

interface UpdateShoppingListRowRepositoryParams {
  description?: string;
  estimatedUnitPriceCents?: null | number;
  id: string;
  quantity?: number;
  unit?: string;
}

interface UpdateStockCategoryRepositoryParams {
  financeCategoryId?: null | string;
  id: string;
  name?: string;
  parentId?: null | string;
  status?: string;
}

interface UpdateStockItemRepositoryParams {
  barcode?: null | string;
  brand?: null | string;
  categoryId?: null | string;
  description?: string;
  estimatedUnitPriceCents?: null | number;
  id: string;
  idealQuantity?: null | number;
  locationId?: null | string;
  minQuantity?: null | number;
  notes?: null | string;
  openedShelfLifeDays?: null | number;
  owner?: string;
  ownerId?: string;
  // The owner the item is in now: its cached list is invalidated, and the new owner's too.
  previousOwnerId: string;
  quickStep?: null | number;
  shoppingListId?: null | string;
  stockOnly?: boolean;
  unit?: string;
  warnDaysClosed?: number;
  warnDaysOpened?: number;
}

interface UpdateStockLocationRepositoryParams {
  id: string;
  name?: string;
  status?: string;
}

export {
  AddShoppingListRowRepositoryParams,
  CreateShoppingListRepositoryParams,
  CreateStockCategoryRepositoryParams,
  CreateStockItemRepositoryParams,
  CreateStockLocationRepositoryParams,
  CreateStockMovementRepositoryParams,
  DeleteStockCatalogRepositoryParams,
  DeleteStockItemRepositoryParams,
  DismissLeftoverRepositoryParams,
  GetConsumptionWeeksRepositoryParams,
  GetShoppingListsRepositoryParams,
  GetStockCatalogRepositoryParams,
  GetStockMovementsRepositoryParams,
  GetWasteRepositoryParams,
  OwnerChangePreviewRepositoryParams,
  StockGestureExpirationRepositoryParams,
  StockGestureRepositoryParams,
  SuggestStockItemRepositoryParams,
  SuggestStockItemsRepositoryParams,
  UpdateShoppingListRepositoryParams,
  UpdateShoppingListRowRepositoryParams,
  UpdateStockCategoryRepositoryParams,
  UpdateStockItemRepositoryParams,
  UpdateStockLocationRepositoryParams,
};
