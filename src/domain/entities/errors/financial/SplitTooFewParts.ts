import BusinessError from "@domain/entities/errors/common/BusinessError";

// SPLIT_TOO_FEW_PARTS: a split needs at least two parts (422) (spec 119).
class SplitTooFewParts extends BusinessError {
  constructor() {
    super();
    this.name = "SplitTooFewParts";
  }
}

export default SplitTooFewParts;
