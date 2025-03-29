import { FinancialTransactionRepository } from "@domain/repositories/financial";

import { LoginRepository } from "./auth";
import { FamilyRepository } from "./family";
import { FamilyMemberRepository } from "./familyMember";
import { StockRepository } from "./stock";
import { UserRepository } from "./user";

interface Repositories {
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
