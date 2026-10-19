import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 409 when deleting a series (or the rest of it) would remove paid occurrences without a
// confirmation (spec 034 FR 31). The counts feed the second, danger-tone confirmation.
class RecurrenceHasPaidOccurrences extends BusinessError {
  // Purchases kept because they are in a paid invoice or were refunded.
  detachedCount: number;
  paidCount: number;
  // Cents.
  paidTotal: number;

  constructor(counts: {
    detachedCount: number;
    paidCount: number;
    paidTotal: number;
  }) {
    super();
    this.name = "RecurrenceHasPaidOccurrences";
    this.detachedCount = counts.detachedCount;
    this.paidCount = counts.paidCount;
    this.paidTotal = counts.paidTotal;
  }
}

export default RecurrenceHasPaidOccurrences;
