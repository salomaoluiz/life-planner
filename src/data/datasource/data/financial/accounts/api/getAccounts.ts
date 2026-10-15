import AccountModel from "@data/models/financial/AccountModel";
import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { AccountDatasource } from "@data/repositories/repos/financial/accounts/accountDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import toOwnerQuery from "../../ownerQuery";

export type Params = Parameters<AccountDatasource["getAccounts"]>[0];
export type Response = ReturnType<AccountDatasource["getAccounts"]>;

async function getAccounts(ownerIds: Params): Response {
  // Without the filter the API returns every owner the user can access.
  if (ownerIds.length === 0) {
    return [];
  }

  try {
    const data = await api.get<Record<string, unknown>[]>(
      // The API derives the current and end-of-month balances from the client's calendar day.
      `/v1/finance/accounts${toOwnerQuery(ownerIds)}&today=${todayCalendarDate()}`,
    );

    return data.map((account) => AccountModel.fromJSON(account));
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "AccountDatasource - getAccounts",
      ownerIds,
    });
  }
}

export default getAccounts;
