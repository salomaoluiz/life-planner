export type OwnerType = "FAMILY" | "USER";

export type TransactionType = "EXPENSE" | "INCOME";

interface ITransactionModel {
  accountId: string;
  category: string;
  categoryId: string;
  date: string;
  description: string;
  id: string;
  owner: OwnerType;
  ownerId: string;
  type: TransactionType;
  value: string;
}

class TransactionModel implements ITransactionModel {
  accountId: string;
  category: string;
  categoryId: string;
  date: string;
  description: string;
  id: string;
  owner: OwnerType;
  ownerId: string;
  type: TransactionType;
  value: string;

  constructor(params: ITransactionModel) {
    this.accountId = params.accountId;
    this.date = params.date;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.description = params.description;
    this.owner = params.owner;
    this.id = params.id;
    this.ownerId = params.ownerId;
    this.type = params.type;
    this.value = params.value;
  }

  static fromJSON(data: Record<string, unknown>): TransactionModel {
    return new TransactionModel({
      accountId: data.account_id as string,
      category: data.category as string,
      categoryId: data.category_id as string,
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
      account_id: this.accountId,
      category: this.category,
      category_id: this.categoryId,
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
