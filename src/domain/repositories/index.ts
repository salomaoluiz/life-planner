import { CacheRepository } from "@domain/repositories/cache";

import { LoginRepository } from "./auth";
import { ConfigsRepository } from "./configs";
import { FamilyRepository } from "./family";
import { FamilyMemberRepository } from "./familyMember";
import {
  FinancialAccountRepository,
  FinancialCategoryRepository,
  FinancialCreditCardRepository,
  FinancialInstallmentPlanRepository,
  FinancialTransactionRepository,
} from "./financial";
import { StockRepository } from "./stock";
import { UserRepository } from "./user";

interface Repositories {
  cacheRepository: CacheRepository;
  configsRepository: ConfigsRepository;
  familyMemberRepository: FamilyMemberRepository;
  familyRepository: FamilyRepository;
  financialRepository: {
    account: FinancialAccountRepository;
    category: FinancialCategoryRepository;
    creditCard: FinancialCreditCardRepository;
    installmentPlan: FinancialInstallmentPlanRepository;
    transaction: FinancialTransactionRepository;
  };
  loginRepository: LoginRepository;
  stockRepository: StockRepository;
  userRepository: UserRepository;
}

export default Repositories;
