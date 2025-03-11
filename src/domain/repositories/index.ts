import { LoginRepository } from "./auth";
import { UserRepository } from "./user";

interface Repositories {
  loginRepository: LoginRepository;
  userRepository: UserRepository;
}

export default Repositories;
