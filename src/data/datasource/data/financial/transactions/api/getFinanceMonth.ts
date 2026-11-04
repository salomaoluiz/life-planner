import { todayCalendarDate } from "@data/models/financial/calendarDate";
import FinanceMonthModel from "@data/models/financial/FinanceMonthModel";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import fetchTransactionPages from "./fetchTransactionPages";

export type Params = Parameters<TransactionDatasource["getFinanceMonth"]>[0];
export type Response = ReturnType<TransactionDatasource["getFinanceMonth"]>;

// Spec 080: everything the transactions screen shows for one month in one request. The account rows come in a page of
// 500; when the month has more, the rest follows through the list endpoint (spec 078).
async function getFinanceMonth(params: Params): Response {
  // Without the filter the API returns every owner the user can access.
  if (params.ownerIds.length === 0) {
    return FinanceMonthModel.empty(params.month);
  }

  try {
    const owners = new URLSearchParams();

    params.ownerIds.forEach((id) => owners.append("ownerId", id));
    owners.append("today", todayCalendarDate());

    const data = await api.get<Record<string, unknown>>(
      `/v1/finance/month?${owners.toString()}&month=${params.month}`,
    );
    const month = FinanceMonthModel.fromJSON(data);

    if (month.nextCursor) {
      const [year, value] = params.month.split("-").map(Number);
      const lastDay = new Date(year, value, 0).getDate();
      const rest = await fetchTransactionPages(
        `/v1/finance/transactions?${owners.toString()}&from=${params.month}-01&to=${params.month}-${String(lastDay).padStart(2, "0")}`,
        month.nextCursor,
      );

      month.transactions.push(...rest);
      month.nextCursor = null;
    }

    return month;
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "TransactionDatasource - getFinanceMonth",
      month: params.month,
      ownerIds: params.ownerIds,
    });
  }
}

export default getFinanceMonth;
