import FamilyDTO from "@application/dto/family/FamilyDTO";
import UserDTO from "@application/dto/user/UserDTO";
import { RouteProps } from "@screens/Invite/types";

class FamilyViewModel {
  get email() {
    return this.routeProps.email;
  }

  get familyName() {
    return this.dto.name;
  }

  get isSamePerson() {
    return this.routeProps.email === this.userDTO.email;
  }

  private dto: FamilyDTO;
  private routeProps: RouteProps;
  private userDTO: UserDTO;

  constructor(familyDTO: FamilyDTO, userDTO: UserDTO, routeProps: RouteProps) {
    this.dto = familyDTO;
    this.userDTO = userDTO;
    this.routeProps = routeProps;
  }
}

export default FamilyViewModel;
