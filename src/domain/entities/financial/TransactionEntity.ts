import { OwnerType } from "@domain/entities/user/OwnerEntity";

export enum TransactionType {
  EXPENSE = "EXPENSE",
  INCOME = "INCOME",
}

interface ITransactionEntity {
  category: string;
  date: string;
  description: string;
  id: string;
  owner: OwnerType;
  ownerId: string;
  type: TransactionType;
  value: string;
}

class TransactionEntity {
  category: string;
  date: string;
  description: string;
  id: string;
  owner: OwnerType;
  ownerId: string;
  type: TransactionType;
  value: string;

  constructor(params: ITransactionEntity) {
    this.category = params.category;
    this.date = params.date;
    this.id = params.id;
    this.owner = params.owner;
    this.description = params.description;
    this.ownerId = params.ownerId;
    this.type = params.type;
    this.value = params.value;
  }
}

export default TransactionEntity;
