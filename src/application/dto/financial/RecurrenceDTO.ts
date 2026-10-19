import RecurrenceEntity, {
  RecurrenceFrequency,
  RecurrenceStatus,
} from "@domain/entities/financial/RecurrenceEntity";

class RecurrenceDTO {
  accountId?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  description: string;
  endDate?: string;
  firstNumber: number;
  frequency: RecurrenceFrequency;
  id: string;
  occurrenceCount?: number;
  owner: string;
  ownerId: string;
  startDate: string;
  status: RecurrenceStatus;
  type: string;
  value: string;

  constructor(params: {
    accountId?: string;
    category: string;
    categoryId: string;
    creditCardId?: string;
    description: string;
    endDate?: string;
    firstNumber: number;
    frequency: RecurrenceFrequency;
    id: string;
    occurrenceCount?: number;
    owner: string;
    ownerId: string;
    startDate: string;
    status: RecurrenceStatus;
    type: string;
    value: string;
  }) {
    this.accountId = params.accountId;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.creditCardId = params.creditCardId;
    this.description = params.description;
    this.endDate = params.endDate;
    this.firstNumber = params.firstNumber;
    this.frequency = params.frequency;
    this.id = params.id;
    this.occurrenceCount = params.occurrenceCount;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.startDate = params.startDate;
    this.status = params.status;
    this.type = params.type;
    this.value = params.value;
  }

  static fromEntity(entity: RecurrenceEntity) {
    return new RecurrenceDTO({
      accountId: entity.accountId,
      category: entity.category,
      categoryId: entity.categoryId,
      creditCardId: entity.creditCardId,
      description: entity.description,
      endDate: entity.endDate,
      firstNumber: entity.firstNumber,
      frequency: entity.frequency,
      id: entity.id,
      occurrenceCount: entity.occurrenceCount,
      owner: entity.owner,
      ownerId: entity.ownerId,
      startDate: entity.startDate,
      status: entity.status,
      type: entity.type,
      value: entity.value,
    });
  }
}

export default RecurrenceDTO;
