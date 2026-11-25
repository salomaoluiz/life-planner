import {
  AiUsageModel,
  ItemSuggestionModel,
  StockBarcodeLookupModel,
} from "@data/models/stock/StockBarcodeModels";
import {
  StockCategoryModel,
  StockLocationDetailModel,
  StockLocationModel,
  StockOwnerChangePreviewModel,
  StockSuggestionModel,
} from "@data/models/stock/StockCatalogModels";
import StockModel from "@data/models/stock/StockModel";
import StockMovementModel from "@data/models/stock/StockMovementModel";
import {
  RestockSummaryEntity,
  ShoppingListCardEntity,
  ShoppingListDetailEntity,
  ShoppingListEntity,
  ShoppingListRowEntity,
  ShoppingListRowResultEntity,
} from "@domain/entities/stock/ShoppingListEntity";
import { PurchaseRepository } from "@domain/repositories/stock/purchaseRepository";

export interface StockDatasource extends PurchaseRepository {
  addShoppingListRow(
    params: AddShoppingListRowParams,
  ): Promise<ShoppingListRowResultEntity>;
  createShoppingList(
    params: CreateShoppingListParams,
  ): Promise<ShoppingListEntity>;
  createStockCategory(
    params: CreateStockCategoryDatasourceParams,
  ): Promise<void>;
  createStockCategorySuggestions(
    params: StockOwnerDatasourceParams,
  ): Promise<void>;
  createStockItem(params: CreateStockDatasourceParams): Promise<StockModel>;
  createStockLocation(
    params: CreateStockLocationDatasourceParams,
  ): Promise<void>;
  createStockLocationSuggestions(
    params: StockOwnerDatasourceParams,
  ): Promise<void>;
  createStockMovement(
    params: CreateStockMovementDatasourceParams,
  ): Promise<{ item: StockModel; movements: StockMovementModel[] }>;
  deleteShoppingListRow(rowId: string): Promise<void>;
  deleteStockCategory(id: string): Promise<void>;
  deleteStockItem(id: string): Promise<void>;
  deleteStockLocation(id: string): Promise<void>;
  getAiUsage(): Promise<AiUsageModel>;
  getFrequentStockItems(limit?: number): Promise<StockModel[]>;
  getOwnerChangePreview(
    params: OwnerChangePreviewDatasourceParams,
  ): Promise<StockOwnerChangePreviewModel>;
  getRestockSummary(): Promise<RestockSummaryEntity>;
  getShoppingList(id: string): Promise<ShoppingListDetailEntity>;
  getShoppingLists(
    params: GetShoppingListsParams,
  ): Promise<ShoppingListCardEntity[]>;
  getStockCategories(
    params: GetStockCatalogDatasourceParams,
  ): Promise<StockCategoryModel[]>;
  getStockItem(id: string): Promise<StockModel>;
  getStockItems(userId: string): Promise<StockModel[]>;
  getStockLocation(id: string): Promise<StockLocationDetailModel>;
  getStockLocations(
    params: GetStockCatalogDatasourceParams,
  ): Promise<StockLocationModel[]>;
  getStockMovements(
    params: GetStockMovementsDatasourceParams,
  ): Promise<{ items: StockMovementModel[]; nextCursor?: string }>;
  lookupStockBarcode(code: string): Promise<StockBarcodeLookupModel>;
  setStockGestureExpiration(
    params: StockGestureExpirationDatasourceParams,
  ): Promise<StockModel>;
  suggestStockItem(
    params: SuggestStockItemDatasourceParams,
  ): Promise<ItemSuggestionModel>;
  suggestStockItems(
    params: SuggestStockItemsDatasourceParams,
  ): Promise<StockSuggestionModel[]>;
  undoStockGesture(params: StockGestureDatasourceParams): Promise<StockModel>;
  updateShoppingList(
    params: UpdateShoppingListParams,
  ): Promise<ShoppingListEntity>;
  updateShoppingListRow(
    params: UpdateShoppingListRowParams,
  ): Promise<ShoppingListRowEntity>;
  updateStockCategory(
    params: UpdateStockCategoryDatasourceParams,
  ): Promise<void>;
  updateStockItem(params: UpdateStockDatasourceParams): Promise<void>;
  updateStockLocation(
    params: UpdateStockLocationDatasourceParams,
  ): Promise<void>;
}

// Spec 118: shopping lists. `undefined` = unchanged, `null` clears an estimate.
interface AddShoppingListRowParams {
  description?: string;
  estimatedUnitPriceCents?: number;
  itemId?: string;
  listId: string;
  origin?: string;
  quantity: number;
  restore?: boolean;
  unit?: string;
}

interface CreateShoppingListParams extends StockOwnerDatasourceParams {
  currency?: string;
  isDefault?: boolean;
  name: string;
}

interface CreateStockCategoryDatasourceParams extends StockOwnerDatasourceParams {
  financeCategoryId?: string;
  name: string;
  parentId?: string;
}

interface CreateStockDatasourceParams extends StockOwnerDatasourceParams {
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

interface CreateStockLocationDatasourceParams extends StockOwnerDatasourceParams {
  name: string;
}

interface CreateStockMovementDatasourceParams {
  // Spec 117: the gesture groups the movements of one quick action; the key makes a retry safe.
  clientId?: string;
  countedQuantity?: number;
  expirationDate?: Date;
  expiredLots?: string;
  gestureId?: string;
  itemId: string;
  lotId?: string;
  note?: string;
  purchaseDate?: Date;
  quantity?: number;
  reason?: string;
  target?: string;
  type: string;
}

interface GetShoppingListsParams {
  includeArchived?: boolean;
  ownerId?: string;
}

interface GetStockCatalogDatasourceParams extends StockOwnerDatasourceParams {
  includeArchived?: boolean;
}

interface GetStockMovementsDatasourceParams {
  cursor?: string;
  itemId: string;
}

interface OwnerChangePreviewDatasourceParams extends StockOwnerDatasourceParams {
  itemId: string;
}

interface StockGestureDatasourceParams {
  clientId?: string;
  gestureId: string;
}

interface StockGestureExpirationDatasourceParams extends StockGestureDatasourceParams {
  expirationDate: Date;
}

interface StockOwnerDatasourceParams {
  owner: string;
  ownerId: string;
}

// Spec 121: exactly one of `barcode` / `name`.
interface SuggestStockItemDatasourceParams extends StockOwnerDatasourceParams {
  barcode?: string;
  name?: string;
}

// Without an owner the search covers every owner the user can write (quick add, spec 117).
interface SuggestStockItemsDatasourceParams {
  owner?: string;
  ownerId?: string;
  q: string;
}

interface UpdateShoppingListParams {
  currency?: string;
  id: string;
  isDefault?: boolean;
  name?: string;
  status?: string;
}

interface UpdateShoppingListRowParams {
  description?: string;
  estimatedUnitPriceCents?: null | number;
  id: string;
  quantity?: number;
  unit?: string;
}

interface UpdateStockCategoryDatasourceParams {
  financeCategoryId?: null | string;
  id: string;
  name?: string;
  parentId?: null | string;
  status?: string;
}

interface UpdateStockDatasourceParams {
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
  quickStep?: null | number;
  shoppingListId?: null | string;
  stockOnly?: boolean;
  unit?: string;
  warnDaysClosed?: number;
  warnDaysOpened?: number;
}

interface UpdateStockLocationDatasourceParams {
  id: string;
  name?: string;
  status?: string;
}

export {
  AddShoppingListRowParams,
  CreateShoppingListParams,
  CreateStockCategoryDatasourceParams,
  CreateStockDatasourceParams,
  CreateStockLocationDatasourceParams,
  CreateStockMovementDatasourceParams,
  GetShoppingListsParams,
  GetStockCatalogDatasourceParams,
  GetStockMovementsDatasourceParams,
  OwnerChangePreviewDatasourceParams,
  StockOwnerDatasourceParams,
  SuggestStockItemDatasourceParams,
  SuggestStockItemsDatasourceParams,
  UpdateShoppingListParams,
  UpdateShoppingListRowParams,
  UpdateStockCategoryDatasourceParams,
  UpdateStockDatasourceParams,
  UpdateStockLocationDatasourceParams,
};
