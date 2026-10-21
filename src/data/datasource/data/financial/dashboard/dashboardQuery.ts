import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { DashboardQueryParams } from "@domain/repositories/financial";

import appendFilterParams from "../filterQuery";

// The query every dashboard endpoint shares; the 045 filters travel as repeatable params (their period is the dashboard's).
function dashboardQuery(params: DashboardQueryParams): URLSearchParams {
  const query = new URLSearchParams({
    currency: params.currency,
    from: params.from,
    to: params.to,
    today: todayCalendarDate(),
  });

  params.ownerIds.forEach((id) => query.append("ownerId", id));
  if (params.source) {
    query.append("source", params.source);
  }
  appendFilterParams(query, params.filter, [
    "accountIds",
    "categoryIds",
    "creditCardIds",
    "paid",
    "q",
    "tagIds",
  ]);

  return query;
}

export default dashboardQuery;
