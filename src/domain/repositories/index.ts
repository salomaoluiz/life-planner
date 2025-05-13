import { CacheRepository } from "@domain/repositories/cache";

import { LoginRepository } from "./auth";
import { ConfigsRepository } from "./configs";
import { FamilyRepository } from "./family";
import { FamilyMemberRepository } from "./familyMember";
import { FinancialTransactionRepository } from "./financial";
import { StockRepository } from "./stock";
import { UserRepository } from "./user";

interface Repositories {
  cacheRepository: CacheRepository;
  configsRepository: ConfigsRepository;
  familyMemberRepository: FamilyMemberRepository;
  familyRepository: FamilyRepository;
  financialRepository: {
    transaction: FinancialTransactionRepository;
  };
  loginRepository: LoginRepository;
  stockRepository: StockRepository;
  userRepository: UserRepository;
}

export default Repositories;
