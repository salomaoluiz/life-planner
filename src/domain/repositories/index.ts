import { CacheRepository } from "@domain/repositories/cache";

import { LoginRepository } from "./auth";
import { ConfigsRepository } from "./configs";
import { FamilyRepository } from "./family";
import { FamilyMemberRepository } from "./familyMember";
import {
  FinancialAccountRepository,
  FinancialCardCreditRepository,
  FinancialCategoryRepository,
  FinancialCreditCardRepository,
  FinancialDashboardRepository,
  FinancialInstallmentPlanRepository,
  FinancialRecurrenceRepository,
  FinancialTagRepository,
  FinancialTransactionRepository,
} from "./financial";
import { StockRepository } from "./stock";
import { UserRepository } from "./user";
import { VersionRepository } from "./version";

interface Repositories {
  cacheRepository: CacheRepository;
  configsRepository: ConfigsRepository;
  familyMemberRepository: FamilyMemberRepository;
  familyRepository: FamilyRepository;
  financialRepository: {
    account: FinancialAccountRepository;
    cardCredit: FinancialCardCreditRepository;
    category: FinancialCategoryRepository;
    creditCard: FinancialCreditCardRepository;
    dashboard: FinancialDashboardRepository;
    installmentPlan: FinancialInstallmentPlanRepository;
    recurrence: FinancialRecurrenceRepository;
    tag: FinancialTagRepository;
    transaction: FinancialTransactionRepository;
  };
  loginRepository: LoginRepository;
  stockRepository: StockRepository;
  userRepository: UserRepository;
  versionRepository: VersionRepository;
}

export default Repositories;
