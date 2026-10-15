import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { decimalToCents } from "@data/models/financial/money";
import { AccountDatasource } from "@data/repositories/repos/financial/accounts/accountDatasource";
import { AccountArchived } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<AccountDatasource["adjustAccountBalance"]>[0];
export type Response = ReturnType<AccountDatasource["adjustAccountBalance"]>;

async function adjustAccountBalance(params: Params): Response {
  try {
    // `balance` is the balance the user wants to see today; the API records the difference.
    await api.post(
      `/v1/finance/accounts/${params.id}/balance-adjustment?today=${todayCalendarDate()}`,
      { balance: decimalToCents(params.balance) },
    );
  } catch (error) {
    // The balance is not stored in the error context (financial data).
    return handleFinancialApiError(
      error,
      { datasource: "AccountDatasource - adjustAccountBalance", id: params.id },
      { unprocessable: () => new AccountArchived() },
    );
  }
}

export default adjustAccountBalance;
