import BusinessError from "@domain/entities/errors/common/BusinessError";

// SPLIT_TOTAL_ZERO: the net total of the split is zero (422) (spec 119).
class SplitTotalZero extends BusinessError {
  constructor() {
    super();
    this.name = "SplitTotalZero";
  }
}

export default SplitTotalZero;
