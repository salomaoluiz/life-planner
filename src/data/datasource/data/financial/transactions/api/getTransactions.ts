import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";

import handleFinancialApiError from "../../financialApiError";
import toOwnerQuery from "../../ownerQuery";
import fetchTransactionPages from "./fetchTransactionPages";

export type Options = Parameters<TransactionDatasource["getTransactions"]>[2];
export type Params = Parameters<TransactionDatasource["getTransactions"]>[0];
export type Range = Parameters<TransactionDatasource["getTransactions"]>[1];
export type Response = ReturnType<TransactionDatasource["getTransactions"]>;

async function getTransactions(
  ownerIds: Params,
  range: Range,
  options?: Options,
): Response {
  // Without the filter the API returns every owner the user can access.
  if (ownerIds.length === 0) {
    return [];
  }

  try {
    // Account rows (the API default) and card purchases (source=CARD): the form edits both kinds.
    // `today` lets the API derive the paid status of card purchases from their invoice.
    // Only the period comes back: account rows by date, card purchases by their invoice list date (spec 078: a period is required).
    const currency = options?.currency ? `&currency=${options.currency}` : "";
    const query = `${toOwnerQuery(ownerIds)}&today=${todayCalendarDate()}&from=${range.from}&to=${range.to}${currency}`;
    // One card's purchases only (spec 077): a single source, a single read.
    if (options?.creditCardId) {
      return await fetchTransactionPages(
        `/v1/finance/transactions${query}&source=CARD&creditCardId=${options.creditCardId}`,
      );
    }

    const [accountRows, cardRows] = await Promise.all([
      fetchTransactionPages(`/v1/finance/transactions${query}`),
      fetchTransactionPages(`/v1/finance/transactions${query}&source=CARD`),
    ]);

    return [...accountRows, ...cardRows];
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "TransactionDatasource - getTransactions",
      ownerIds,
      range,
    });
  }
}

export default getTransactions;
