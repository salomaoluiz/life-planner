import { BusinessError } from "@domain/entities/errors/common";

class FamilyNotCreated extends BusinessError {
  constructor() {
    super();
    this.name = "FamilyNotCreated";
  }
}

export default FamilyNotCreated;
