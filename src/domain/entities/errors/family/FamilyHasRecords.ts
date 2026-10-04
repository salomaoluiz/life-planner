import BusinessError from "@domain/entities/errors/common/BusinessError";

class FamilyHasRecords extends BusinessError {
  constructor() {
    super();
    this.name = "FamilyHasRecords";
  }
}

export default FamilyHasRecords;
