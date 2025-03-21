import { LoginRepository } from "./auth";
import { FamilyRepository } from "./family";
import { FamilyMemberRepository } from "./familyMember";
import { StockRepository } from "./stock";
import { UserRepository } from "./user";

interface Repositories {
  familyMemberRepository: FamilyMemberRepository;
  familyRepository: FamilyRepository;
  loginRepository: LoginRepository;
  stockRepository: StockRepository;
  userRepository: UserRepository;
}

export default Repositories;
