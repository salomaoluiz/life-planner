import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";

import createStockItem from "./createStockItem";
import deleteStockItem from "./deleteStockItem";
import getStockItem from "./getStockItem";
import getStockItems from "./getStockItems";
import { purchaseApiDatasource } from "./purchases";
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

const stockApiDatasource: StockDatasource = {
  ...purchaseApiDatasource,
  addShoppingListRow,
  createShoppingList,
  createStockCategory,
  createStockCategorySuggestions,
  createStockItem,
  createStockLocation,
  createStockLocationSuggestions,
  createStockMovement,
  deleteShoppingListRow,
  deleteStockCategory,
  deleteStockItem,
  deleteStockLocation,
  getAiUsage,
  getFrequentStockItems,
  getOwnerChangePreview,
  getRestockSummary,
  getShoppingList,
  getShoppingLists,
  getStockCategories,
  getStockItem,
  getStockItems,
  getStockLocation,
  getStockLocations,
  getStockMovements,
  lookupStockBarcode,
  setStockGestureExpiration,
  suggestStockItem,
  suggestStockItems,
  undoStockGesture,
  updateShoppingList,
  updateShoppingListRow,
  updateStockCategory,
  updateStockItem,
  updateStockLocation,
};

export default stockApiDatasource;
