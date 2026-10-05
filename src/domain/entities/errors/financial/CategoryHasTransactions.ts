import BusinessError from "@domain/entities/errors/common/BusinessError";

class CategoryHasTransactions extends BusinessError {
  constructor() {
    super();
    this.name = "CategoryHasTransactions";
  }
}

export default CategoryHasTransactions;
