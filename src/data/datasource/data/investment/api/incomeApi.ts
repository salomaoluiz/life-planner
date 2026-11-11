import InvestmentModel from "@data/models/investment/InvestmentModel";
import { FieldInvalid } from "@domain/entities/errors";
import {
  ApproveInvestmentIncomeSuggestionParams,
  CreateInvestmentIncomeParams,
  GetInvestmentIncomeDefaultsParams,
  GetInvestmentIncomesParams,
  GetInvestmentIncomeSuggestionsParams,
  ReceiveInvestmentIncomeParams,
  UpdateInvestmentIncomeParams,
} from "@domain/repositories/investment";
import { api } from "@infrastructure/api";
import { formatDecimal, parseDecimal, ZERO } from "@utils/decimal";

import handleInvestmentApiError from "./investmentApiError";

type Json = Record<string, unknown>;

// Spec 107 section 7: incomes and the suggestions inbox. Quantity and per-unit value are normalized ("0,47" -> "0.47")
// and must be above zero BEFORE any call; `undefined` leaves a field alone, `null` clears it.
async function approveIncomeSuggestion(
  params: ApproveInvestmentIncomeSuggestionParams,
) {
  const { id, ...fields } = params;
  const body = fieldsBody(fields);

  try {
    return InvestmentModel.toIncome(
      (
        await api.post<Json>(
          `/v1/investments/income-suggestions/${id}/approve`,
          body,
        )
      ).item as Json,
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - approveIncomeSuggestion" },
      body,
    );
  }
}

async function createIncome(params: CreateInvestmentIncomeParams) {
  const { assetId, ...fields } = params;
  const body = { ...fieldsBody(fields), assetId };

  try {
    return InvestmentModel.toIncome(
      (await api.post<Json>("/v1/investments/incomes", body)).item as Json,
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - createIncome" },
      body,
    );
  }
}

function decimalBody(
  value: null | string | undefined,
  field: string,
): null | string | undefined {
  if (value === undefined || value === null) {
    return value;
  }

  const parsed = parseDecimal(value);

  if (parsed === null || parsed <= ZERO) {
    throw new FieldInvalid({ [field]: value });
  }

  return formatDecimal(parsed);
}

async function deleteIncome(id: string) {
  try {
    await api.delete(`/v1/investments/incomes/${id}`);
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - deleteIncome",
    });
  }
}

function fieldsBody(fields: Partial<CreateInvestmentIncomeParams>): Json {
  return {
    accountId: fields.accountId,
    amountPerUnit: decimalBody(fields.amountPerUnit, "amountPerUnit"),
    categoryId: fields.categoryId,
    exDate: fields.exDate,
    netAmount: fields.netAmount,
    notes: fields.notes,
    paymentDate: fields.paymentDate,
    quantity: decimalBody(fields.quantity, "quantity"),
    status: fields.status,
    type: fields.type,
  };
}

async function getIncome(id: string) {
  try {
    return InvestmentModel.toIncome(
      (await api.get<Json>(`/v1/investments/incomes/${id}`)).item as Json,
    );
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getIncome",
    });
  }
}

async function getIncomeDefaults(params: GetInvestmentIncomeDefaultsParams) {
  const query = queryString({ exDate: params.exDate, type: params.type });

  try {
    return InvestmentModel.toIncomeDefaults(
      await api.get<Json>(
        `/v1/investments/assets/${params.assetId}/income-defaults${query}`,
      ),
    );
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getIncomeDefaults",
    });
  }
}

// Spec 107 FR 16: `GET /finance/transactions/:id` carries `investment.incomeId` for the rows of an income.
async function getIncomeLink(transactionId: string) {
  try {
    const data = await api.get<{
      investment?: { assetId: string; incomeId?: string };
    }>(`/v1/finance/transactions/${transactionId}`);

    return data.investment?.incomeId
      ? {
          assetId: data.investment.assetId,
          incomeId: data.investment.incomeId,
        }
      : undefined;
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getIncomeLink",
    });
  }
}

async function getIncomes(params: GetInvestmentIncomesParams) {
  const query = queryString({
    assetId: params.assetId,
    cursor: params.cursor,
    from: params.from,
    limit: params.limit === undefined ? undefined : String(params.limit),
    status: params.status,
    to: params.to,
    type: params.type,
  });

  try {
    return InvestmentModel.toIncomePage(
      await api.get<Json>(`/v1/investments/incomes${query}`),
    );
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getIncomes",
    });
  }
}

async function getIncomeSuggestions(
  params: GetInvestmentIncomeSuggestionsParams,
) {
  const query = queryString({ assetId: params.assetId });

  try {
    const data = await api.get<Json>(
      `/v1/investments/income-suggestions${query}`,
    );

    return ((data.items as Json[]) ?? []).map((item) =>
      InvestmentModel.toIncomeSuggestion(item),
    );
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getIncomeSuggestions",
    });
  }
}

function queryString(values: Record<string, string | undefined>): string {
  const pairs = Object.entries(values)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);

  return pairs.length > 0 ? `?${pairs.join("&")}` : "";
}

async function receiveIncome(params: ReceiveInvestmentIncomeParams) {
  const body = {
    accountId: params.accountId,
    netAmount: params.netAmount,
    receivedOn: params.receivedOn,
  };

  try {
    return InvestmentModel.toIncome(
      (
        await api.post<Json>(
          `/v1/investments/incomes/${params.id}/receive`,
          body,
        )
      ).item as Json,
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - receiveIncome" },
      body,
    );
  }
}

async function rejectIncomeSuggestion(id: string) {
  try {
    await api.post(`/v1/investments/income-suggestions/${id}/reject`, {});
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - rejectIncomeSuggestion",
    });
  }
}

async function updateIncome(params: UpdateInvestmentIncomeParams) {
  const { id, ...fields } = params;
  const body = fieldsBody(fields);

  try {
    return InvestmentModel.toIncome(
      (await api.patch<Json>(`/v1/investments/incomes/${id}`, body))
        .item as Json,
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - updateIncome" },
      body,
    );
  }
}

const incomeApi = {
  approveIncomeSuggestion,
  createIncome,
  deleteIncome,
  getIncome,
  getIncomeDefaults,
  getIncomeLink,
  getIncomes,
  getIncomeSuggestions,
  receiveIncome,
  rejectIncomeSuggestion,
  updateIncome,
};

export default incomeApi;
