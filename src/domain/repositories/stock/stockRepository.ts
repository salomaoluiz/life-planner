import StockEntity from "@domain/entities/stock/StockEntity";

export type StockRepository = {
  createStockItem(
    params: CreateStockItemRepositoryParams,
  ): Promise<StockEntity>;
  deleteStockItem(params: DeleteStockItemRepositoryParams): Promise<void>;
  getStockItems(ownerId: string): Promise<StockEntity[]>;
  updateStockItem(params: UpdateStockItemRepositoryParams): Promise<void>;
};

interface CreateStockItemRepositoryParams {
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
interface DeleteStockItemRepositoryParams {
  id: string;
  ownerId: string;
}

interface UpdateStockItemRepositoryParams {
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

export { CreateStockItemRepositoryParams, UpdateStockItemRepositoryParams };
