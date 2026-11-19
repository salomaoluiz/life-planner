import BusinessError from "@domain/entities/errors/common/BusinessError";

// SPLIT_ADJUSTMENT_DUPLICATE: only one Discount/adjustment part per split (422) (spec 119).
class SplitAdjustmentDuplicate extends BusinessError {
  constructor() {
    super();
    this.name = "SplitAdjustmentDuplicate";
  }
}

export default SplitAdjustmentDuplicate;
