import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when a shorter end date would delete occurrences that are already paid (spec 034 FR 25).
class RecurrencePaidAfterEnd extends BusinessError {
  constructor() {
    super();
    this.name = "RecurrencePaidAfterEnd";
  }
}

export default RecurrencePaidAfterEnd;
