import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";

import createStockItem from "./createStockItem";
import deleteStockItem from "./deleteStockItem";
import getStockItems from "./getStockItems";
import updateStockItem from "./updateStockItem";

function stockDatasourceImpl(): StockDatasource {
  return {
    createStockItem,
    deleteStockItem,
    getStockItems,
    updateStockItem,
  };
}

export default stockDatasourceImpl;
