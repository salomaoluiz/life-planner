import DashboardModel from "@data/models/financial/DashboardModel";
import { DashboardDatasource } from "@data/repositories/repos/financial/dashboard/dashboardDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import dashboardQuery from "../dashboardQuery";

export type Params = Parameters<DashboardDatasource["getTotals"]>[0];
export type Response = ReturnType<DashboardDatasource["getTotals"]>;

async function getTotals(params: Params): Response {
  const query = dashboardQuery(params);
  query.append("groupBy", params.groupBy);
  if (params.type) {
    query.append("type", params.type);
  }
  if (params.parentId) {
    query.append("parentId", params.parentId);
  }

  try {
    const data = await api.get<Record<string, unknown>>(
      `/v1/finance/dashboard/totals?${query.toString()}`,
    );

    return DashboardModel.totalsFromJSON(data);
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "DashboardDatasource - getTotals",
      ownerIds: params.ownerIds,
    });
  }
}

export default getTotals;
