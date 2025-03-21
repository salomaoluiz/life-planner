import StockModel from "@data/models/stock/StockModel";

export interface StockDatasource {
  createStockItem(params: CreateStockDatasourceParams): Promise<StockModel>;
  deleteStockItem(id: string): Promise<void>;
  getStockItems(userId: string): Promise<StockModel[]>;
  updateStockItem(params: UpdateStockDatasourceParams): Promise<void>;
}

interface CreateStockDatasourceParams {
  barcode?: string;
  brand?: string;
  description: string;
  expirationDate?: Date;
  notes?: string;
  openingDate?: Date;
  owner: string;
  ownerId: string;
  purchaseDate?: Date;
  quantity: number;
  unit: string;
}

interface UpdateStockDatasourceParams {
  barcode?: string;
  brand?: string;
  description?: string;
  expirationDate?: Date;
  id: string;
  notes?: string;
  openingDate?: Date;
  owner?: string;
  ownerId?: string;
  purchaseDate?: Date;
  quantity?: number;
  unit?: string;
}

export { CreateStockDatasourceParams, UpdateStockDatasourceParams };
