import { LoginRepository } from "./auth";
import { FamilyRepository } from "./family";
import { FamilyMemberRepository } from "./familyMember";
import { UserRepository } from "./user";

interface Repositories {
  familyMemberRepository: FamilyMemberRepository;
  familyRepository: FamilyRepository;
  loginRepository: LoginRepository;
  userRepository: UserRepository;
}

export default Repositories;
