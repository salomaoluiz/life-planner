import { Datasources } from "@data/datasource";

import accountRepository from "./accounts/accountRepositoryImpl";
import cardCreditRepository from "./cardCredits/cardCreditRepositoryImpl";
import categoryRepository from "./categories/categoryRepositoryImpl";
import creditCardRepository from "./creditCards/creditCardRepositoryImpl";
import installmentPlanRepository from "./installmentPlans/installmentPlanRepositoryImpl";
import transactionRepository from "./transactions/transactionRepositoryImpl";

export function financialRepository(datasources: Datasources) {
  return {
    account: accountRepository(datasources),
    cardCredit: cardCreditRepository(datasources),
    category: categoryRepository(datasources),
    creditCard: creditCardRepository(datasources),
    installmentPlan: installmentPlanRepository(datasources),
    transaction: transactionRepository(datasources),
  };
}
