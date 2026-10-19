import RecurrenceEntity from "./RecurrenceEntity";
import TransactionEntity from "./TransactionEntity";

// What creating or splitting a series answers: the series, its real rows and the card limit warning.
class RecurrenceResultEntity {
  // The series that stopped before the split; absent when the split rewrote the series itself.
  ended?: RecurrenceEntity;
  occurrences: TransactionEntity[];
  overLimit: boolean;
  recurrence: RecurrenceEntity;

  constructor(params: {
    ended?: RecurrenceEntity;
    occurrences: TransactionEntity[];
    overLimit?: boolean;
    recurrence: RecurrenceEntity;
  }) {
    this.ended = params.ended;
    this.occurrences = params.occurrences;
    this.overLimit = params.overLimit ?? false;
    this.recurrence = params.recurrence;
  }
}

export default RecurrenceResultEntity;
