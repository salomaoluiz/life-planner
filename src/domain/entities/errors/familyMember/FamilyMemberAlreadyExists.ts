import BusinessError from "@domain/entities/errors/common/BusinessError";

class FamilyMemberAlreadyExists extends BusinessError {
  constructor() {
    super();
    this.name = "FamilyMemberAlreadyExists";
  }
}

export default FamilyMemberAlreadyExists;
