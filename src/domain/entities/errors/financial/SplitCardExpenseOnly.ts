import BusinessError from "@domain/entities/errors/common/BusinessError";

// SPLIT_CARD_EXPENSE_ONLY: parts on a card are expenses only (422) (spec 119).
class SplitCardExpenseOnly extends BusinessError {
  constructor() {
    super();
    this.name = "SplitCardExpenseOnly";
  }
}

export default SplitCardExpenseOnly;
