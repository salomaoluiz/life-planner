import { Datasources } from "@data/datasource";
import { toDailyBalanceEntity } from "@data/repositories/repos/financial/accounts/getDailyBalances";
import { toCardInvoiceEntity } from "@data/repositories/repos/financial/creditCards/creditCardMapper";
import { toProjectedEntity } from "@data/repositories/repos/financial/recurrences/recurrenceRepositoryImpl";
import FinanceMonthEntity from "@domain/entities/financial/FinanceMonthEntity";
import { FinancialTransactionRepository } from "@domain/repositories/financial";

import { toTransactionEntity } from "./getTransactions";

export type Params = Parameters<
  FinancialTransactionRepository["getFinanceMonth"]
>[0];

// Never cached: the month moves with every write. The parts are mapped like their separate endpoints.
async function getFinanceMonth(
  params: Params,
  datasources: Datasources,
): Promise<FinanceMonthEntity> {
  const model =
    await datasources.financialTransactionDatasource.getFinanceMonth(params);

  return {
    dailyBalances: toDailyBalanceEntity(model.dailyBalances),
    invoices: model.invoices.map((invoice) => toCardInvoiceEntity(invoice)),
    projections: model.projections.map((item) => toProjectedEntity(item)),
    summary: model.summary,
    transactions: model.transactions.map((row) => toTransactionEntity(row)),
  };
}

export default getFinanceMonth;
