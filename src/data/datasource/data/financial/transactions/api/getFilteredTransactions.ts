import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { lastTwoYearsRange } from "@domain/entities/financial/TransactionQueryFilter";

import appendFilterParams from "../../filterQuery";
import handleFinancialApiError from "../../financialApiError";
import fetchTransactionPages from "./fetchTransactionPages";

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

  const today = todayCalendarDate();
  const query = new URLSearchParams({ today });

  params.ownerIds.forEach((id) => query.append("ownerId", id));
  appendFilterParams(query, params.filter, [
    "accountIds",
    "categoryIds",
    "kind",
    "from",
    "paid",
    "q",
    "tagIds",
  ]);
  // The API needs a period: without a chosen one the search covers the last 2 years (spec 078).
  if (!query.has("from")) {
    const { from, to } = lastTwoYearsRange(today);

    query.append("from", from);
    query.append("to", to);
  }

  try {
    return await fetchTransactionPages(
      `/v1/finance/transactions?${query.toString()}`,
    );
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "TransactionDatasource - getFilteredTransactions",
      ownerIds: params.ownerIds,
    });
  }
}

export default getFilteredTransactions;
