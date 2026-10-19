import RecurrenceResultEntity from "@domain/entities/financial/RecurrenceResultEntity";

import RecurrenceDTO from "./RecurrenceDTO";
import TransactionDTO from "./TransactionDTO";

class RecurrenceResultDTO {
  ended?: RecurrenceDTO;
  occurrences: TransactionDTO[];
  overLimit: boolean;
  recurrence: RecurrenceDTO;

  constructor(params: {
    ended?: RecurrenceDTO;
    occurrences: TransactionDTO[];
    overLimit: boolean;
    recurrence: RecurrenceDTO;
  }) {
    this.ended = params.ended;
    this.occurrences = params.occurrences;
    this.overLimit = params.overLimit;
    this.recurrence = params.recurrence;
  }

  static fromEntity(entity: RecurrenceResultEntity) {
    return new RecurrenceResultDTO({
      ended: entity.ended ? RecurrenceDTO.fromEntity(entity.ended) : undefined,
      occurrences: entity.occurrences.map((row) =>
        TransactionDTO.fromEntity(row),
      ),
      overLimit: entity.overLimit,
      recurrence: RecurrenceDTO.fromEntity(entity.recurrence),
    });
  }
}

export default RecurrenceResultDTO;
