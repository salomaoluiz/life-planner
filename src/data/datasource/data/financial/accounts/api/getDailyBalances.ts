import { todayCalendarDate } from "@data/models/financial/calendarDate";
import DailyBalanceModel from "@data/models/financial/DailyBalanceModel";
import { AccountDatasource } from "@data/repositories/repos/financial/accounts/accountDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<AccountDatasource["getDailyBalances"]>[0];
export type Response = ReturnType<AccountDatasource["getDailyBalances"]>;

async function getDailyBalances(params: Params): Response {
  const query = new URLSearchParams({
    month: params.month,
    today: todayCalendarDate(),
  });

  params.ownerIds.forEach((id) => query.append("ownerId", id));

  try {
    const data = await api.get<Record<string, unknown>>(
      `/v1/finance/accounts/daily-balances?${query.toString()}`,
    );

    return DailyBalanceModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "AccountDatasource - getDailyBalances",
      ownerIds: params.ownerIds,
    });
  }
}

export default getDailyBalances;
