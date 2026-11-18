import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";

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
import {
  getFrequentStockItems,
  getStockLocation,
  setStockGestureExpiration,
  undoStockGesture,
} from "./stockQuick";
import updateStockItem from "./updateStockItem";

const stockApiDatasource: StockDatasource = {
  createStockCategory,
  createStockCategorySuggestions,
  createStockItem,
  createStockLocation,
  createStockLocationSuggestions,
  createStockMovement,
  deleteStockCategory,
  deleteStockItem,
  deleteStockLocation,
  getFrequentStockItems,
  getOwnerChangePreview,
  getStockCategories,
  getStockItem,
  getStockItems,
  getStockLocation,
  getStockLocations,
  getStockMovements,
  setStockGestureExpiration,
  suggestStockItems,
  undoStockGesture,
  updateStockCategory,
  updateStockItem,
  updateStockLocation,
};

export default stockApiDatasource;
