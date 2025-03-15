import BusinessError from "@domain/entities/errors/common/BusinessError";

class FamilyNotFound extends BusinessError {
  constructor() {
    super();
    this.name = "FamilyNotFound";
  }
}

export default FamilyNotFound;
