import BusinessError from "@domain/entities/errors/common/BusinessError";

// SPLIT_TOO_MANY_PARTS: a split has at most 50 parts (422) (spec 119).
class SplitTooManyParts extends BusinessError {
  constructor() {
    super();
    this.name = "SplitTooManyParts";
  }
}

export default SplitTooManyParts;
