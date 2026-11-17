import {
  StockCategoryModel,
  StockLocationModel,
  StockOwnerChangePreviewModel,
  StockSuggestionModel,
} from "@data/models/stock/StockCatalogModels";
import StockModel from "@data/models/stock/StockModel";
import StockMovementModel from "@data/models/stock/StockMovementModel";

export interface StockDatasource {
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
  deleteStockCategory(id: string): Promise<void>;
  deleteStockItem(id: string): Promise<void>;
  deleteStockLocation(id: string): Promise<void>;
  getOwnerChangePreview(
    params: OwnerChangePreviewDatasourceParams,
  ): Promise<StockOwnerChangePreviewModel>;
  getStockCategories(
    params: GetStockCatalogDatasourceParams,
  ): Promise<StockCategoryModel[]>;
  getStockItem(id: string): Promise<StockModel>;
  getStockItems(userId: string): Promise<StockModel[]>;
  getStockLocations(
    params: GetStockCatalogDatasourceParams,
  ): Promise<StockLocationModel[]>;
  getStockMovements(
    params: GetStockMovementsDatasourceParams,
  ): Promise<{ items: StockMovementModel[]; nextCursor?: string }>;
  suggestStockItems(
    params: SuggestStockItemsDatasourceParams,
  ): Promise<StockSuggestionModel[]>;
  updateStockCategory(
    params: UpdateStockCategoryDatasourceParams,
  ): Promise<void>;
  updateStockItem(params: UpdateStockDatasourceParams): Promise<void>;
  updateStockLocation(
    params: UpdateStockLocationDatasourceParams,
  ): Promise<void>;
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
  expirationDate?: Date;
  idealQuantity?: number;
  locationId?: string;
  minQuantity?: number;
  notes?: string;
  openedShelfLifeDays?: number;
  purchaseDate?: Date;
  quantity: number;
  stockOnly: boolean;
  unit: string;
  warnDaysClosed: number;
  warnDaysOpened: number;
}

interface CreateStockLocationDatasourceParams extends StockOwnerDatasourceParams {
  name: string;
}

interface CreateStockMovementDatasourceParams {
  countedQuantity?: number;
  expirationDate?: Date;
  itemId: string;
  lotId?: string;
  note?: string;
  purchaseDate?: Date;
  quantity?: number;
  reason?: string;
  type: string;
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

interface StockOwnerDatasourceParams {
  owner: string;
  ownerId: string;
}

interface SuggestStockItemsDatasourceParams extends StockOwnerDatasourceParams {
  q: string;
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
  id: string;
  idealQuantity?: null | number;
  locationId?: null | string;
  minQuantity?: null | number;
  notes?: null | string;
  openedShelfLifeDays?: null | number;
  owner?: string;
  ownerId?: string;
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
  CreateStockCategoryDatasourceParams,
  CreateStockDatasourceParams,
  CreateStockLocationDatasourceParams,
  CreateStockMovementDatasourceParams,
  GetStockCatalogDatasourceParams,
  GetStockMovementsDatasourceParams,
  OwnerChangePreviewDatasourceParams,
  StockOwnerDatasourceParams,
  SuggestStockItemsDatasourceParams,
  UpdateStockCategoryDatasourceParams,
  UpdateStockDatasourceParams,
  UpdateStockLocationDatasourceParams,
};
