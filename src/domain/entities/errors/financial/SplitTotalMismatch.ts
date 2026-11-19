import BusinessError from "@domain/entities/errors/common/BusinessError";

// SPLIT_TOTAL_MISMATCH: the parts do not add up to the total paid (422) (spec 119).
class SplitTotalMismatch extends BusinessError {
  constructor() {
    super();
    this.name = "SplitTotalMismatch";
  }
}

export default SplitTotalMismatch;
