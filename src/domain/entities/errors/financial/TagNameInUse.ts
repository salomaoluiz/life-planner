import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 409 when a tag name is already used (ignoring case) in one of the scopes.
class TagNameInUse extends BusinessError {
  constructor() {
    super();
    this.name = "TagNameInUse";
  }
}

export default TagNameInUse;
