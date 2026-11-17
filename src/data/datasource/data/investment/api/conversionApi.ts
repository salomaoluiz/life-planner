import InvestmentModel from "@data/models/investment/InvestmentModel";
import { FieldInvalid } from "@domain/entities/errors";
import {
  CreateInvestmentConversionParams,
  UpdateInvestmentConversionParams,
} from "@domain/repositories/investment";
import { api } from "@infrastructure/api";
import { formatDecimal, parseDecimal, ZERO } from "@utils/decimal";

import handleInvestmentApiError from "./investmentApiError";

type Json = Record<string, unknown>;

// Spec 112 section 7: the ratios and the reference value are normalized ("7,4" -> "7.4") and must be above zero
// BEFORE any call; the ticker of a new destination is upper-cased.
async function createConversion(params: CreateInvestmentConversionParams) {
  const body = {
    accountId: params.generateTransaction ? params.accountId : undefined,
    cashAmount: params.cashAmount,
    cashReferenceUnitValue: positive(
      params.cashReferenceUnitValue,
      "cashReferenceUnitValue",
    ),
    date: params.date,
    destination:
      "assetId" in params.destination
        ? { assetId: params.destination.assetId }
        : {
            newAsset: {
              name: params.destination.newAsset.name,
              ticker: params.destination.newAsset.ticker.trim().toUpperCase(),
            },
          },
    generateTransaction: params.generateTransaction,
    ratioFrom: positive(params.ratioFrom, "ratioFrom"),
    ratioTo: positive(params.ratioTo, "ratioTo"),
  };

  try {
    return InvestmentModel.toConversionResult(
      await api.post<Json>(
        `/v1/investments/assets/${params.assetId}/conversions`,
        body,
      ),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - createConversion" },
      body,
    );
  }
}

async function deleteConversion(id: string) {
  try {
    await api.delete(`/v1/investments/conversions/${id}`);
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - deleteConversion",
    });
  }
}

async function getConversion(id: string) {
  try {
    const data = await api.get<Json>(`/v1/investments/conversions/${id}`);

    return InvestmentModel.toConversion(data.item as Json);
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getConversion",
    });
  }
}

function positive(
  value: string | undefined,
  field: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = parseDecimal(value);

  if (parsed === null || parsed <= ZERO) {
    throw new FieldInvalid({ [field]: value });
  }

  return formatDecimal(parsed);
}

async function updateConversion(params: UpdateInvestmentConversionParams) {
  const body = {
    accountId: params.accountId,
    cashAmount: params.cashAmount,
    cashReferenceUnitValue: positive(
      params.cashReferenceUnitValue,
      "cashReferenceUnitValue",
    ),
    date: params.date,
    generateTransaction: params.generateTransaction,
    ratioFrom: positive(params.ratioFrom, "ratioFrom"),
    ratioTo: positive(params.ratioTo, "ratioTo"),
  };

  try {
    return InvestmentModel.toConversionResult(
      await api.patch<Json>(`/v1/investments/conversions/${params.id}`, body),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - updateConversion" },
      body,
    );
  }
}

const conversionApi = {
  createConversion,
  deleteConversion,
  getConversion,
  updateConversion,
};

export default conversionApi;
