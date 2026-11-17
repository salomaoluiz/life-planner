import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";

import * as createStockItem from "./createStockItem";
import * as deleteStockItem from "./deleteStockItem";
import * as getStockItem from "./getStockItem";
import * as getStockItems from "./getStockItems";
import * as catalog from "./stockCatalog";
import * as movements from "./stockMovements";
import stockRepositoryImpl from "./stockRepositoryImpl";
import * as updateStockItem from "./updateStockItem";

const modules = {
  createStockCategory: catalog,
  createStockCategorySuggestions: catalog,
  createStockItem,
  createStockLocation: catalog,
  createStockLocationSuggestions: catalog,
  createStockMovement: movements,
  deleteStockCategory: catalog,
  deleteStockItem,
  deleteStockLocation: catalog,
  getOwnerChangePreview: movements,
  getStockCategories: catalog,
  getStockItem,
  getStockItems,
  getStockLocations: catalog,
  getStockMovements: movements,
  suggestStockItems: movements,
  updateStockCategory: catalog,
  updateStockItem,
  updateStockLocation: catalog,
} as const;

it.each(Object.keys(modules) as Array<keyof typeof modules>)(
  "SHOULD delegate %s with its params and the datasources",
  async (method) => {
    const module = modules[method] as Record<string, unknown>;
    const target = "default" in module ? "default" : method;
    const spy = jest
      .spyOn(module as never, target as never)
      .mockResolvedValue(`${method} response` as never);
    const repository = stockRepositoryImpl(datasourcesMocks);

    const result = await (
      repository[method] as (params: unknown) => Promise<unknown>
    )({ id: "param" });

    expect(spy).toHaveBeenCalledWith({ id: "param" }, datasourcesMocks);
    expect(result).toBe(`${method} response`);
    spy.mockRestore();
  },
);
