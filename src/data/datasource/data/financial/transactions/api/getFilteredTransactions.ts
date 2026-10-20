import { todayCalendarDate } from "@data/models/financial/calendarDate";
import TransactionModel from "@data/models/financial/TransactionModel";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { api } from "@infrastructure/api";

import appendFilterParams from "../../filterQuery";
import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<
  TransactionDatasource["getFilteredTransactions"]
>[0];
export type Response = ReturnType<
  TransactionDatasource["getFilteredTransactions"]
>;

// Spec 045: the account rows that match the filters, straight from the API (no cache).
async function getFilteredTransactions(params: Params): Response {
  if (params.ownerIds.length === 0) {
    return [];
  }

  const query = new URLSearchParams({ today: todayCalendarDate() });

  params.ownerIds.forEach((id) => query.append("ownerId", id));
  appendFilterParams(query, params.filter, [
    "accountIds",
    "categoryIds",
    "from",
    "paid",
    "q",
    "tagIds",
  ]);

  try {
    const data = await api.get<Record<string, unknown>[]>(
      `/v1/finance/transactions?${query.toString()}`,
    );

    return data.map((transaction) => TransactionModel.fromJSON(transaction));
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "TransactionDatasource - getFilteredTransactions",
      ownerIds: params.ownerIds,
    });
  }
}

export default getFilteredTransactions;
