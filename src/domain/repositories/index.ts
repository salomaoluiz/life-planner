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
  FinancialSplitRepository,
  FinancialTagRepository,
  FinancialTransactionRepository,
  FinancialTransferRepository,
  FinancialUpcomingRepository,
} from "./financial";
import { InvestmentRepository } from "./investment";
import { NotificationRepository } from "./notification";
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
    split: FinancialSplitRepository;
    tag: FinancialTagRepository;
    transaction: FinancialTransactionRepository;
    transfer: FinancialTransferRepository;
    upcoming: FinancialUpcomingRepository;
  };
  investmentRepository: InvestmentRepository;
  loginRepository: LoginRepository;
  notificationRepository: NotificationRepository;
  stockRepository: StockRepository;
  userRepository: UserRepository;
  versionRepository: VersionRepository;
}

export default Repositories;
