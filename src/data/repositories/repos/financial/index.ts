import { Datasources } from "@data/datasource";

import accountRepository from "./accounts/accountRepositoryImpl";
import cardCreditRepository from "./cardCredits/cardCreditRepositoryImpl";
import categoryRepository from "./categories/categoryRepositoryImpl";
import creditCardRepository from "./creditCards/creditCardRepositoryImpl";
import dashboardRepository from "./dashboard/dashboardRepositoryImpl";
import installmentPlanRepository from "./installmentPlans/installmentPlanRepositoryImpl";
import recurrenceRepository from "./recurrences/recurrenceRepositoryImpl";
import tagRepository from "./tags/tagRepositoryImpl";
import transactionRepository from "./transactions/transactionRepositoryImpl";

export function financialRepository(datasources: Datasources) {
  return {
    account: accountRepository(datasources),
    cardCredit: cardCreditRepository(datasources),
    category: categoryRepository(datasources),
    creditCard: creditCardRepository(datasources),
    dashboard: dashboardRepository(datasources),
    installmentPlan: installmentPlanRepository(datasources),
    recurrence: recurrenceRepository(datasources),
    tag: tagRepository(datasources),
    transaction: transactionRepository(datasources),
  };
}
