export type OwnerType = "FAMILY" | "USER";

export type TransactionType = "EXPENSE" | "INCOME";

interface ITransactionModel {
  category: string;
  date: string;
  description: string;
  id: string;
  owner: OwnerType;
  ownerId: string;
  type: TransactionType;
  value: string;
}

class TransactionModel implements ITransactionModel {
  category: string;
  date: string;
  description: string;
  id: string;
  owner: OwnerType;
  ownerId: string;
  type: TransactionType;
  value: string;

  constructor(params: ITransactionModel) {
    this.date = params.date;
    this.category = params.category;
    this.description = params.description;
    this.owner = params.owner;
    this.id = params.id;
    this.ownerId = params.ownerId;
    this.type = params.type;
    this.value = params.value;
  }

  static fromJSON(data: Record<string, unknown>): TransactionModel {
    return new TransactionModel({
      category: data.category as string,
      date: data.date as string,
      description: data.description as string,
      id: data.id as string,
      owner: data.owner as OwnerType,
      ownerId: data.owner_id as string,
      type: data.type as TransactionType,
      value: data.value as string,
    });
  }

  toJSON() {
    return {
      category: this.category,
      date: this.date,
      description: this.description,
      id: this.id,
      owner: this.owner,
      owner_id: this.ownerId,
      type: this.type,
      value: this.value,
    };
  }
}

export default TransactionModel;
