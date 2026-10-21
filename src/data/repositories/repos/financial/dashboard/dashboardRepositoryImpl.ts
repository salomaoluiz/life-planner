import { Datasources } from "@data/datasource";
import { FinancialDashboardRepository } from "@domain/repositories/financial";

// Never cached: the numbers move with every transaction, invoice and account write.
function dashboardRepositoryImpl(
  datasources: Datasources,
): FinancialDashboardRepository {
  return {
    async getBalanceSeries(params) {
      return datasources.financialDashboardDatasource.getBalanceSeries(params);
    },
    async getSummary(params) {
      return datasources.financialDashboardDatasource.getSummary(params);
    },
    async getTotals(params) {
      return datasources.financialDashboardDatasource.getTotals(params);
    },
  };
}

export default dashboardRepositoryImpl;
