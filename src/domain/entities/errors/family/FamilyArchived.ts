import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 "Family is archived" to any write on an archived family (spec 042).
class FamilyArchived extends BusinessError {
  constructor() {
    super();
    this.name = "FamilyArchived";
  }
}

export default FamilyArchived;
