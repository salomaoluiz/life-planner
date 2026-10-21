import DashboardModel from "@data/models/financial/DashboardModel";
import { DashboardDatasource } from "@data/repositories/repos/financial/dashboard/dashboardDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import dashboardQuery from "../dashboardQuery";

export type Params = Parameters<DashboardDatasource["getSummary"]>[0];
export type Response = ReturnType<DashboardDatasource["getSummary"]>;

async function getSummary(params: Params): Response {
  const query = dashboardQuery(params);

  try {
    const data = await api.get<Record<string, unknown>>(
      `/v1/finance/dashboard/summary?${query.toString()}`,
    );

    return DashboardModel.summaryFromJSON(data);
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "DashboardDatasource - getSummary",
      ownerIds: params.ownerIds,
    });
  }
}

export default getSummary;
