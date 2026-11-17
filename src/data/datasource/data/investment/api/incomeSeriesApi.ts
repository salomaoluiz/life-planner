import InvestmentModel from "@data/models/investment/InvestmentModel";
import { FieldInvalid } from "@domain/entities/errors";
import {
  CreateInvestmentIncomeSeriesParams,
  GetInvestmentIncomeSeriesProjectionsParams,
  UpdateInvestmentIncomeSeriesParams,
} from "@domain/repositories/investment";
import { api } from "@infrastructure/api";
import { formatDecimal, parseDecimal, ZERO } from "@utils/decimal";

import handleInvestmentApiError from "./investmentApiError";

type Json = Record<string, unknown>;

// Spec 115 section 7: recurring incomes. The amount per unit is normalized ("1,10" -> "1.1") and must be above zero
// BEFORE any call; `undefined` leaves a field alone, `null` clears it.
function amountBody(value: string): string {
  const parsed = parseDecimal(value);

  if (parsed === null || parsed <= ZERO) {
    throw new FieldInvalid({ amountPerUnit: value });
  }

  return formatDecimal(parsed);
}

async function createIncomeSeries(params: CreateInvestmentIncomeSeriesParams) {
  const body = seriesBody(params);

  try {
    return InvestmentModel.toIncomeSeriesCreated(
      await api.post<Json>("/v1/investments/income-series", body),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - createIncomeSeries" },
      body,
    );
  }
}

async function getIncomeSeries(assetId: string) {
  try {
    const data = await api.get<Json>(
      `/v1/investments/income-series?assetId=${encodeURIComponent(assetId)}`,
    );

    return ((data.items as Json[]) ?? []).map((item) =>
      InvestmentModel.toIncomeSeries(item),
    );
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getIncomeSeries",
    });
  }
}

async function getIncomeSeriesById(id: string) {
  try {
    return InvestmentModel.toIncomeSeries(
      (await api.get<Json>(`/v1/investments/income-series/${id}`)).item as Json,
    );
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getIncomeSeriesById",
    });
  }
}

async function getIncomeSeriesProjections(
  params: GetInvestmentIncomeSeriesProjectionsParams,
) {
  try {
    const data = await api.get<Json>(
      `/v1/investments/income-series/projections?from=${params.from}&to=${params.to}`,
    );

    return ((data.items as Json[]) ?? []).map((item) =>
      InvestmentModel.toProjectedIncome(item),
    );
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getIncomeSeriesProjections",
    });
  }
}

async function previewIncomeSeries(params: CreateInvestmentIncomeSeriesParams) {
  const body = seriesBody(params);

  try {
    return InvestmentModel.toIncomeSeriesPreview(
      await api.post<Json>("/v1/investments/income-series/preview", body),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - previewIncomeSeries" },
      body,
    );
  }
}

function seriesBody(params: CreateInvestmentIncomeSeriesParams): Json {
  return {
    accountId: params.withFinance === false ? undefined : params.accountId,
    amountPerUnit: amountBody(params.amountPerUnit),
    assetId: params.assetId,
    categoryId: params.withFinance === false ? undefined : params.categoryId,
    endDate: params.endDate,
    exDateOffsetDays: params.exDateOffsetDays,
    firstPaymentDate: params.firstPaymentDate,
    frequency: params.frequency,
    markPastAsReceived: params.markPastAsReceived,
    notes: params.notes,
    type: params.type,
    withFinance: params.withFinance,
  };
}

async function updateIncomeSeries(params: UpdateInvestmentIncomeSeriesParams) {
  const { id, ...fields } = params;
  const body = {
    ...fields,
    amountPerUnit:
      fields.amountPerUnit === undefined
        ? undefined
        : amountBody(fields.amountPerUnit),
  };

  try {
    return InvestmentModel.toIncomeSeries(
      (await api.patch<Json>(`/v1/investments/income-series/${id}`, body))
        .item as Json,
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - updateIncomeSeries" },
      body,
    );
  }
}

const incomeSeriesApi = {
  createIncomeSeries,
  getIncomeSeries,
  getIncomeSeriesById,
  getIncomeSeriesProjections,
  previewIncomeSeries,
  updateIncomeSeries,
};

export default incomeSeriesApi;
