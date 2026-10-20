import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when a record targets an archived category.
class CategoryArchived extends BusinessError {
  constructor() {
    super();
    this.name = "CategoryArchived";
  }
}

export default CategoryArchived;
