import { Datasources } from "@data/datasource";
import { FinancialUpcomingRepository } from "@domain/repositories/financial";

// Never cached: what is due moves with every transaction, invoice and recurrence write.
function upcomingRepositoryImpl(
  datasources: Datasources,
): FinancialUpcomingRepository {
  return {
    async getUpcoming(params) {
      return datasources.financialUpcomingDatasource.getUpcoming(params);
    },
  };
}

export default upcomingRepositoryImpl;
