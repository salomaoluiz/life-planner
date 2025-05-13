import { Datasources } from "@data/datasource";
import StockEntity from "@domain/entities/stock/StockEntity";
import { StockRepository } from "@domain/repositories/stock";

import createStockItem from "./createStockItem";
import deleteStockItem from "./deleteStockItem";
import getStockItems from "./getStockItems";
import updateStockItem from "./updateStockItem";

function stockRepositoryImpl(datasources: Datasources): StockRepository {
  return {
    async createStockItem(params): Promise<StockEntity> {
      return createStockItem(params, datasources);
    },
    async deleteStockItem(params): Promise<void> {
      return deleteStockItem(params, datasources);
    },
    async getStockItems(ownerId: string): Promise<StockEntity[]> {
      return getStockItems(ownerId, datasources);
    },
    async updateStockItem(params): Promise<void> {
      return updateStockItem(params, datasources);
    },
  };
}

export default stockRepositoryImpl;
