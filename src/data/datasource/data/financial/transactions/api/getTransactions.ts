import { todayCalendarDate } from "@data/models/financial/calendarDate";
import TransactionModel from "@data/models/financial/TransactionModel";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import toOwnerQuery from "../../ownerQuery";

export type Params = Parameters<TransactionDatasource["getTransactions"]>[0];
export type Response = ReturnType<TransactionDatasource["getTransactions"]>;

async function getTransactions(ownerIds: Params): Response {
  // Without the filter the API returns every owner the user can access.
  if (ownerIds.length === 0) {
    return [];
  }

  try {
    // Account rows (the API default) and card purchases (source=CARD): the form edits both kinds.
    // `today` lets the API derive the paid status of card purchases from their invoice.
    const query = `${toOwnerQuery(ownerIds)}&today=${todayCalendarDate()}`;
    const [accountRows, cardRows] = await Promise.all([
      api.get<Record<string, unknown>[]>(`/v1/finance/transactions${query}`),
      api.get<Record<string, unknown>[]>(
        `/v1/finance/transactions${query}&source=CARD`,
      ),
    ]);

    return [...accountRows, ...cardRows].map((transaction) =>
      TransactionModel.fromJSON(transaction),
    );
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "TransactionDatasource - getTransactions",
      ownerIds,
    });
  }
}

export default getTransactions;
