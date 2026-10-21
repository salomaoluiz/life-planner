import { todayCalendarDate } from "@data/models/financial/calendarDate";
import ProjectedOccurrenceModel from "@data/models/financial/ProjectedOccurrenceModel";
import { RecurrenceDatasource } from "@data/repositories/repos/financial/recurrences/recurrenceDatasource";
import { api } from "@infrastructure/api";

import appendFilterParams from "../../filterQuery";
import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<RecurrenceDatasource["getProjections"]>[0];
export type Response = ReturnType<RecurrenceDatasource["getProjections"]>;

async function getProjections(params: Params): Response {
  // Without the filter the API returns every owner the user can access.
  if (params.ownerIds.length === 0) {
    return [];
  }

  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
    today: todayCalendarDate(),
  });

  params.ownerIds.forEach((id) => query.append("ownerId", id));
  // Spec 045: the months stay in from/to, so the period and paid filters do not apply here.
  appendFilterParams(query, params.filter, [
    "accountIds",
    "categoryIds",
    "creditCardIds",
    "q",
    "tagIds",
  ]);

  try {
    const data = await api.get<Record<string, unknown>[]>(
      `/v1/finance/recurrences/projections?${query.toString()}`,
    );

    return data.map((item) => ProjectedOccurrenceModel.fromJSON(item));
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "RecurrenceDatasource - getProjections",
      ownerIds: params.ownerIds,
    });
  }
}

export default getProjections;
