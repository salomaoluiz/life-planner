import { Datasources } from "@data/datasource";
import { StockRepository } from "@domain/repositories/stock";

import createStockItem from "./createStockItem";
import deleteStockItem from "./deleteStockItem";
import getStockItem from "./getStockItem";
import getStockItems from "./getStockItems";
import { purchaseRepositoryImpl } from "./purchases";
import {
  addShoppingListRow,
  createShoppingList,
  deleteShoppingListRow,
  getRestockSummary,
  getShoppingList,
  getShoppingLists,
  updateShoppingList,
  updateShoppingListRow,
} from "./shoppingLists";
import {
  getAiUsage,
  lookupStockBarcode,
  suggestStockItem,
} from "./stockBarcode";
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
import {
  getFrequentStockItems,
  getStockLocation,
  setStockGestureExpiration,
  undoStockGesture,
} from "./stockQuick";
import updateStockItem from "./updateStockItem";

function stockRepositoryImpl(datasources: Datasources): StockRepository {
  return {
    ...purchaseRepositoryImpl(datasources),
    addShoppingListRow: async (params) =>
      addShoppingListRow(params, datasources),
    createShoppingList: async (params) =>
      createShoppingList(params, datasources),
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
    deleteShoppingListRow: async (rowId) =>
      deleteShoppingListRow(rowId, datasources),
    deleteStockCategory: async (params) =>
      deleteStockCategory(params, datasources),
    deleteStockItem: async (params) => deleteStockItem(params, datasources),
    deleteStockLocation: async (params) =>
      deleteStockLocation(params, datasources),
    getAiUsage: async () => getAiUsage(datasources),
    getFrequentStockItems: async (limit) =>
      getFrequentStockItems(limit, datasources),
    getOwnerChangePreview: async (params) =>
      getOwnerChangePreview(params, datasources),
    getRestockSummary: async () => getRestockSummary(datasources),
    getShoppingList: async (id) => getShoppingList(id, datasources),
    getShoppingLists: async (params) => getShoppingLists(params, datasources),
    getStockCategories: async (params) =>
      getStockCategories(params, datasources),
    getStockItem: async (id) => getStockItem(id, datasources),
    getStockItems: async (ownerId) => getStockItems(ownerId, datasources),
    getStockLocation: async (id) => getStockLocation(id, datasources),
    getStockLocations: async (params) => getStockLocations(params, datasources),
    getStockMovements: async (params) => getStockMovements(params, datasources),
    lookupStockBarcode: async (code) => lookupStockBarcode(code, datasources),
    setStockGestureExpiration: async (params) =>
      setStockGestureExpiration(params, datasources),
    suggestStockItem: async (params) => suggestStockItem(params, datasources),
    suggestStockItems: async (params) => suggestStockItems(params, datasources),
    undoStockGesture: async (params) => undoStockGesture(params, datasources),
    updateShoppingList: async (params) =>
      updateShoppingList(params, datasources),
    updateShoppingListRow: async (params) =>
      updateShoppingListRow(params, datasources),
    updateStockCategory: async (params) =>
      updateStockCategory(params, datasources),
    updateStockItem: async (params) => updateStockItem(params, datasources),
    updateStockLocation: async (params) =>
      updateStockLocation(params, datasources),
  };
}

export default stockRepositoryImpl;
