import { todayCalendarDate } from "@data/models/financial/calendarDate";
import UpcomingModel from "@data/models/financial/UpcomingModel";
import { UpcomingDatasource } from "@data/repositories/repos/financial/upcoming/upcomingDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<UpcomingDatasource["getUpcoming"]>[0];
export type Response = ReturnType<UpcomingDatasource["getUpcoming"]>;

async function getUpcoming(params: Params): Response {
  const query = new URLSearchParams({ today: todayCalendarDate() });

  params.ownerIds.forEach((id) => query.append("ownerId", id));
  if (params.days !== undefined) {
    query.append("days", String(params.days));
  }
  if (params.limit !== undefined) {
    query.append("limit", String(params.limit));
  }

  try {
    const data = await api.get<Record<string, unknown>>(
      `/v1/finance/upcoming?${query.toString()}`,
    );

    return UpcomingModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "UpcomingDatasource - getUpcoming",
      ownerIds: params.ownerIds,
    });
  }
}

export default getUpcoming;
