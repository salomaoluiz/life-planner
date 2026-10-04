import TransactionEntity from "@domain/entities/financial/TransactionEntity";

export interface ITransactionDTO {
  accountId: string;
  accountName?: string;
  category: string;
  categoryId: string;
  categoryName?: string;
  date: string;
  description: string;
  id: string;
  owner: string;
  ownerId: string;
  type: string;
  value: string;
}

class TransactionDTO {
  accountId: string;
  accountName?: string;
  category: string;
  categoryId: string;
  categoryName?: string;
  date: string;
  description: string;
  id: string;
  owner: string;
  ownerId: string;
  type: string;
  value: string;

  constructor(params: ITransactionDTO) {
    this.accountId = params.accountId;
    this.date = params.date;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.categoryName = params.categoryName;
    this.accountName = params.accountName;
    this.description = params.description;
    this.id = params.id;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.type = params.type;
    this.value = params.value;
  }

  static fromEntity(
    entity: TransactionEntity,
    categoryName?: string,
    accountName?: string,
  ) {
    return new TransactionDTO({
      accountId: entity.accountId,
      accountName: accountName,
      category: entity.category,
      categoryId: entity.categoryId,
      categoryName: categoryName,
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
