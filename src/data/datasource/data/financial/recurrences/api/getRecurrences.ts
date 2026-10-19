import RecurrenceModel from "@data/models/financial/RecurrenceModel";
import { RecurrenceDatasource } from "@data/repositories/repos/financial/recurrences/recurrenceDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<RecurrenceDatasource["getRecurrences"]>[0];
export type Response = ReturnType<RecurrenceDatasource["getRecurrences"]>;

async function getRecurrences(params: Params): Response {
  const query = new URLSearchParams();

  if (params.accountId) {
    query.set("accountId", params.accountId);
  }
  if (params.creditCardId) {
    query.set("creditCardId", params.creditCardId);
  }
  if (params.status) {
    query.set("status", params.status);
  }
  (params.ownerIds ?? []).forEach((id) => query.append("ownerId", id));

  try {
    const suffix = query.toString() ? `?${query.toString()}` : "";
    const data = await api.get<Record<string, unknown>[]>(
      `/v1/finance/recurrences${suffix}`,
    );

    return data.map((item) => RecurrenceModel.fromJSON(item));
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "RecurrenceDatasource - getRecurrences",
    });
  }
}

export default getRecurrences;
