import {
  StockCategoryEntity,
  StockLocationDetailEntity,
  StockLocationEntity,
  StockOwnerChangePreviewEntity,
  StockSuggestionEntity,
} from "@domain/entities/stock/StockCatalogEntity";
import StockEntity from "@domain/entities/stock/StockEntity";
import StockMovementEntity from "@domain/entities/stock/StockMovementEntity";

export interface StockOwnerParams {
  owner: string;
  ownerId: string;
}

export type StockRepository = {
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
  deleteStockCategory(
    params: DeleteStockCatalogRepositoryParams,
  ): Promise<void>;
  deleteStockItem(params: DeleteStockItemRepositoryParams): Promise<void>;
  deleteStockLocation(
    params: DeleteStockCatalogRepositoryParams,
  ): Promise<void>;
  getFrequentStockItems(limit?: number): Promise<StockEntity[]>;
  getOwnerChangePreview(
    params: OwnerChangePreviewRepositoryParams,
  ): Promise<StockOwnerChangePreviewEntity>;
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
  setStockGestureExpiration(
    params: StockGestureExpirationRepositoryParams,
  ): Promise<StockEntity>;
  suggestStockItems(
    params: SuggestStockItemsRepositoryParams,
  ): Promise<StockSuggestionEntity[]>;
  undoStockGesture(params: StockGestureRepositoryParams): Promise<StockEntity>;
  updateStockCategory(
    params: UpdateStockCategoryRepositoryParams,
  ): Promise<void>;
  updateStockItem(params: UpdateStockItemRepositoryParams): Promise<void>;
  updateStockLocation(
    params: UpdateStockLocationRepositoryParams,
  ): Promise<void>;
};

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
  expirationDate?: Date;
  idealQuantity?: number;
  locationId?: string;
  minQuantity?: number;
  notes?: string;
  openedShelfLifeDays?: number;
  purchaseDate?: Date;
  quantity: number;
  quickStep?: number;
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

interface GetStockCatalogRepositoryParams extends StockOwnerParams {
  includeArchived?: boolean;
}

interface GetStockMovementsRepositoryParams {
  cursor?: string;
  itemId: string;
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

interface SuggestStockItemsRepositoryParams {
  owner?: string;
  ownerId?: string;
  q: string;
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
  CreateStockCategoryRepositoryParams,
  CreateStockItemRepositoryParams,
  CreateStockLocationRepositoryParams,
  CreateStockMovementRepositoryParams,
  DeleteStockCatalogRepositoryParams,
  DeleteStockItemRepositoryParams,
  GetStockCatalogRepositoryParams,
  GetStockMovementsRepositoryParams,
  OwnerChangePreviewRepositoryParams,
  StockGestureExpirationRepositoryParams,
  StockGestureRepositoryParams,
  SuggestStockItemsRepositoryParams,
  UpdateStockCategoryRepositoryParams,
  UpdateStockItemRepositoryParams,
  UpdateStockLocationRepositoryParams,
};
