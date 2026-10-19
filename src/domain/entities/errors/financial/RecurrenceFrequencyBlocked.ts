import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when changing the frequency would regenerate occurrences that are already paid.
class RecurrenceFrequencyBlocked extends BusinessError {
  constructor() {
    super();
    this.name = "RecurrenceFrequencyBlocked";
  }
}

export default RecurrenceFrequencyBlocked;
