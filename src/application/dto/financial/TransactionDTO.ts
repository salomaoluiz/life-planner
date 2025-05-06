import TransactionEntity from "@domain/entities/financial/TransactionEntity";

export interface ITransactionDTO {
  category: string;
  date: string;
  description: string;
  id: string;
  owner: string;
  ownerId: string;
  type: string;
  value: string;
}

class TransactionDTO {
  category: string;
  date: string;
  description: string;
  id: string;
  owner: string;
  ownerId: string;
  type: string;
  value: string;

  constructor(params: ITransactionDTO) {
    this.date = params.date;
    this.category = params.category;
    this.description = params.description;
    this.id = params.id;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.type = params.type;
    this.value = params.value;
  }

  static fromEntity(entity: TransactionEntity) {
    return new TransactionDTO({
      category: entity.category,
      date: entity.date,
      description: entity.description,
      id: entity.id,
      owner: entity.owner,
      ownerId: entity.ownerId,
      type: entity.type,
      value: entity.value,
    });
  }
}

export default TransactionDTO;
