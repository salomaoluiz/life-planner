import {
  StockCategoryModel,
  StockLocationModel,
} from "@data/models/stock/StockCatalogModels";
import { StockDatasource } from "@data/repositories/repos/stock/stockDatasource";
import { api } from "@infrastructure/api";

import handleStockApiError from "./stockApiError";

type Record_ = Record<string, unknown>;

export async function createStockCategory(
  params: Parameters<StockDatasource["createStockCategory"]>[0],
): Promise<void> {
  try {
    await api.post("/v1/stock/categories", params);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - createStockCategory",
      ownerId: params.ownerId,
    });
  }
}

export async function createStockCategorySuggestions(
  params: Parameters<StockDatasource["createStockCategorySuggestions"]>[0],
): Promise<void> {
  try {
    await api.post("/v1/stock/categories/suggestions", params);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - createStockCategorySuggestions",
      ownerId: params.ownerId,
    });
  }
}

export async function createStockLocation(
  params: Parameters<StockDatasource["createStockLocation"]>[0],
): Promise<void> {
  try {
    await api.post("/v1/stock/locations", params);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - createStockLocation",
      ownerId: params.ownerId,
    });
  }
}

export async function createStockLocationSuggestions(
  params: Parameters<StockDatasource["createStockLocationSuggestions"]>[0],
): Promise<void> {
  try {
    await api.post("/v1/stock/locations/suggestions", params);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - createStockLocationSuggestions",
      ownerId: params.ownerId,
    });
  }
}

export async function deleteStockCategory(
  id: string,
  moveTo?: string,
): Promise<void> {
  try {
    await api.delete(
      `/v1/stock/categories/${encodeURIComponent(id)}${moveQuery(moveTo)}`,
    );
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - deleteStockCategory",
      id,
    });
  }
}

export async function deleteStockLocation(
  id: string,
  moveTo?: string,
): Promise<void> {
  try {
    await api.delete(
      `/v1/stock/locations/${encodeURIComponent(id)}${moveQuery(moveTo)}`,
    );
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - deleteStockLocation",
      id,
    });
  }
}

export async function getStockCategories(
  params: Parameters<StockDatasource["getStockCategories"]>[0],
): Promise<StockCategoryModel[]> {
  try {
    const data = await api.get<{ items: Record_[] }>(
      `/v1/stock/categories${catalogQuery(params)}`,
    );

    return data.items.map((row) => StockCategoryModel.fromJSON(row));
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getStockCategories",
      ownerId: params.ownerId,
    });
  }
}

export async function getStockLocations(
  params: Parameters<StockDatasource["getStockLocations"]>[0],
): Promise<StockLocationModel[]> {
  try {
    const data = await api.get<{ items: Record_[] }>(
      `/v1/stock/locations${catalogQuery(params)}`,
    );

    return data.items.map((row) => StockLocationModel.fromJSON(row));
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - getStockLocations",
      ownerId: params.ownerId,
    });
  }
}

export async function updateStockCategory(
  params: Parameters<StockDatasource["updateStockCategory"]>[0],
): Promise<void> {
  try {
    const { id, ...body } = params;

    await api.patch(`/v1/stock/categories/${encodeURIComponent(id)}`, body);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - updateStockCategory",
      id: params.id,
    });
  }
}

export async function updateStockLocation(
  params: Parameters<StockDatasource["updateStockLocation"]>[0],
): Promise<void> {
  try {
    const { id, ...body } = params;

    await api.patch(`/v1/stock/locations/${encodeURIComponent(id)}`, body);
  } catch (error) {
    return handleStockApiError(error, {
      datasource: "StockDatasource - updateStockLocation",
      id: params.id,
    });
  }
}

// No owner = every owner the user can read (spec 125 "Todos").
function catalogQuery(
  params: Parameters<StockDatasource["getStockCategories"]>[0],
) {
  const owner =
    params.owner && params.ownerId
      ? `owner=${params.owner}&ownerId=${encodeURIComponent(params.ownerId)}&`
      : "";

  return `?${owner}includeArchived=${params.includeArchived ? "true" : "false"}`;
}

function moveQuery(moveTo?: string) {
  return moveTo ? `?moveTo=${encodeURIComponent(moveTo)}` : "";
}
