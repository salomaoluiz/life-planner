import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when a category is created, moved or reactivated under an archived parent.
class CategoryParentArchived extends BusinessError {
  constructor() {
    super();
    this.name = "CategoryParentArchived";
  }
}

export default CategoryParentArchived;
