import DashboardModel from "@data/models/financial/DashboardModel";
import { DashboardDatasource } from "@data/repositories/repos/financial/dashboard/dashboardDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import dashboardQuery from "../dashboardQuery";

export type Params = Parameters<DashboardDatasource["getBalanceSeries"]>[0];
export type Response = ReturnType<DashboardDatasource["getBalanceSeries"]>;

async function getBalanceSeries(params: Params): Response {
  const query = dashboardQuery(params);
  query.append("granularity", params.granularity);

  try {
    const data = await api.get<Record<string, unknown>>(
      `/v1/finance/dashboard/balance-series?${query.toString()}`,
    );

    return DashboardModel.balanceSeriesFromJSON(data);
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "DashboardDatasource - getBalanceSeries",
      ownerIds: params.ownerIds,
    });
  }
}

export default getBalanceSeries;
