import BusinessError from "@domain/entities/errors/common/BusinessError";

// SPLIT_PART_VALUE_INVALID: a part value must be above zero (only the adjustment may be negative) (422) (spec 119).
class SplitPartValueInvalid extends BusinessError {
  constructor() {
    super();
    this.name = "SplitPartValueInvalid";
  }
}

export default SplitPartValueInvalid;
