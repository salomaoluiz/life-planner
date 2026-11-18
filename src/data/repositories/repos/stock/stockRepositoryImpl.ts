import { Datasources } from "@data/datasource";
import { StockRepository } from "@domain/repositories/stock";

import createStockItem from "./createStockItem";
import deleteStockItem from "./deleteStockItem";
import getStockItem from "./getStockItem";
import getStockItems from "./getStockItems";
import {
  createStockCategory,
  createStockCategorySuggestions,
  createStockLocation,
  createStockLocationSuggestions,
  deleteStockCategory,
  deleteStockLocation,
  getStockCategories,
  getStockLocations,
  updateStockCategory,
  updateStockLocation,
} from "./stockCatalog";
import {
  createStockMovement,
  getOwnerChangePreview,
  getStockMovements,
  suggestStockItems,
} from "./stockMovements";
import updateStockItem from "./updateStockItem";

function stockRepositoryImpl(datasources: Datasources): StockRepository {
  return {
    createStockCategory: async (params) =>
      createStockCategory(params, datasources),
    createStockCategorySuggestions: async (params) =>
      createStockCategorySuggestions(params, datasources),
    createStockItem: async (params) => createStockItem(params, datasources),
    createStockLocation: async (params) =>
      createStockLocation(params, datasources),
    createStockLocationSuggestions: async (params) =>
      createStockLocationSuggestions(params, datasources),
    createStockMovement: async (params) =>
      createStockMovement(params, datasources),
    deleteStockCategory: async (params) =>
      deleteStockCategory(params, datasources),
    deleteStockItem: async (params) => deleteStockItem(params, datasources),
    deleteStockLocation: async (params) =>
      deleteStockLocation(params, datasources),
    getOwnerChangePreview: async (params) =>
      getOwnerChangePreview(params, datasources),
    getStockCategories: async (params) =>
      getStockCategories(params, datasources),
    getStockItem: async (id) => getStockItem(id, datasources),
    getStockItems: async (ownerId) => getStockItems(ownerId, datasources),
    getStockLocations: async (params) => getStockLocations(params, datasources),
    getStockMovements: async (params) => getStockMovements(params, datasources),
    suggestStockItems: async (params) => suggestStockItems(params, datasources),
    updateStockCategory: async (params) =>
      updateStockCategory(params, datasources),
    updateStockItem: async (params) => updateStockItem(params, datasources),
    updateStockLocation: async (params) =>
      updateStockLocation(params, datasources),
  };
}

export default stockRepositoryImpl;
