import BusinessError from "@domain/entities/errors/common/BusinessError";

// SPLIT_SOURCE_NOT_ALLOWED: this transaction can not be split (422) (spec 119).
class SplitSourceNotAllowed extends BusinessError {
  constructor() {
    super();
    this.name = "SplitSourceNotAllowed";
  }
}

export default SplitSourceNotAllowed;
