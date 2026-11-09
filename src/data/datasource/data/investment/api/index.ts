import InvestmentModel from "@data/models/investment/InvestmentModel";
import { InvestmentDatasource } from "@data/repositories/repos/investment/investmentDatasource";
import { FieldInvalid } from "@domain/entities/errors";
import {
  CreateInvestmentAssetParams,
  CreateInvestmentOperationParams,
  GetInvestmentAssetsParams,
  UpdateInvestmentAssetParams,
  UpdateInvestmentOperationParams,
  UpsertInvestmentValuationParams,
} from "@domain/repositories/investment";
import { api } from "@infrastructure/api";
import { formatDecimal, parseDecimal, ZERO } from "@utils/decimal";

import handleInvestmentApiError from "./investmentApiError";

type Json = Record<string, unknown>;

async function createAsset(params: CreateInvestmentAssetParams) {
  const body = {
    assetClass: params.assetClass,
    currency: params.currency,
    currentUnitPrice:
      params.currentUnitPrice === undefined || params.currentUnitPrice === ""
        ? undefined
        : positiveDecimal(params.currentUnitPrice, "currentUnitPrice"),
    name: params.name,
    owner: params.owner,
    ownerId: params.ownerId,
    ticker: params.ticker === "" ? undefined : params.ticker,
  };

  try {
    return InvestmentModel.toAsset(
      await api.post<Json>("/v1/investments/assets", body),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - createAsset" },
      body,
    );
  }
}

async function createOperation(params: CreateInvestmentOperationParams) {
  const body = {
    accountId: params.generateTransaction ? params.accountId : undefined,
    date: params.date,
    fees: feesBody(params.fees),
    generateTransaction: params.generateTransaction,
    quantity: positiveDecimal(params.quantity, "quantity"),
    type: params.type,
    unitPrice: positiveDecimal(params.unitPrice, "unitPrice"),
  };

  try {
    return InvestmentModel.toOperationResult(
      await api.post<Json>(
        `/v1/investments/assets/${params.assetId}/operations`,
        body,
      ),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - createOperation" },
      body,
    );
  }
}

async function deleteAsset(id: string) {
  try {
    await api.delete(`/v1/investments/assets/${id}`);
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - deleteAsset",
    });
  }
}

async function deleteOperation(id: string) {
  try {
    await api.delete(`/v1/investments/operations/${id}`);
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - deleteOperation",
    });
  }
}

async function deleteValuation(id: string) {
  try {
    await api.delete(`/v1/investments/valuations/${id}`);
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - deleteValuation",
    });
  }
}

function feesBody(fees: CreateInvestmentOperationParams["fees"]) {
  return fees.map((fee) => ({
    amount: fee.amount,
    description: fee.description,
    kind: fee.kind,
  }));
}

async function getAsset(id: string) {
  try {
    const data = await api.get<{ item: Json }>(`/v1/investments/assets/${id}`);

    return InvestmentModel.toAssetDetail(data.item);
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getAsset",
    });
  }
}

async function getAssets(params: GetInvestmentAssetsParams) {
  try {
    const data = await api.get<{ items: Json[] }>(
      `/v1/investments/assets?status=${params.status}`,
    );

    return data.items.map((item) => InvestmentModel.toAsset(item));
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getAssets",
    });
  }
}

// "10,5" -> "10.5". A quantity or price must be a decimal above zero: FieldInvalid BEFORE any network call.
function positiveDecimal(value: string, field: string): string {
  const parsed = parseDecimal(value);

  if (parsed === null || parsed <= ZERO) {
    throw new FieldInvalid({ [field]: value });
  }

  return formatDecimal(parsed);
}

async function updateAsset(params: UpdateInvestmentAssetParams) {
  const body = {
    assetClass: params.assetClass,
    currency: params.currency,
    name: params.name,
    owner: params.owner,
    ownerId: params.ownerId,
    status: params.status,
    ticker: params.ticker,
  };

  try {
    return InvestmentModel.toAsset(
      await api.patch<Json>(`/v1/investments/assets/${params.id}`, body),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - updateAsset" },
      body,
    );
  }
}

async function updateOperation(params: UpdateInvestmentOperationParams) {
  const body = {
    accountId: params.accountId,
    date: params.date,
    fees: params.fees === undefined ? undefined : feesBody(params.fees),
    generateTransaction: params.generateTransaction,
    quantity:
      params.quantity === undefined
        ? undefined
        : positiveDecimal(params.quantity, "quantity"),
    unitPrice:
      params.unitPrice === undefined
        ? undefined
        : positiveDecimal(params.unitPrice, "unitPrice"),
  };

  try {
    return InvestmentModel.toOperationResult(
      await api.patch<Json>(`/v1/investments/operations/${params.id}`, body),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - updateOperation" },
      body,
    );
  }
}

async function upsertValuation(params: UpsertInvestmentValuationParams) {
  const body = { unitPrice: positiveDecimal(params.unitPrice, "unitPrice") };

  try {
    return InvestmentModel.toValuationResult(
      await api.put<Json>(
        `/v1/investments/assets/${params.assetId}/valuations/${params.date}`,
        body,
      ),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - upsertValuation" },
      body,
    );
  }
}

const investmentApi: InvestmentDatasource = {
  createAsset,
  createOperation,
  deleteAsset,
  deleteOperation,
  deleteValuation,
  getAsset,
  getAssets,
  updateAsset,
  updateOperation,
  upsertValuation,
};

export default investmentApi;
