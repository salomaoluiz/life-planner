import TransactionEntity from "@domain/entities/financial/TransactionEntity";

export interface ITransactionDTO {
  accountId?: string;
  accountName?: string;
  category: string;
  categoryId: string;
  categoryName?: string;
  creditCardId?: string;
  date: string;
  description: string;
  excludeFromTotals?: boolean;
  id: string;
  invoiceMonth?: string;
  owner: string;
  ownerId: string;
  systemKey?: string;
  type: string;
  value: string;
}

class TransactionDTO {
  accountId?: string;
  accountName?: string;
  category: string;
  categoryId: string;
  categoryName?: string;
  creditCardId?: string;
  date: string;
  description: string;
  excludeFromTotals: boolean;
  id: string;
  invoiceMonth?: string;
  owner: string;
  ownerId: string;
  systemKey?: string;
  type: string;
  value: string;

  constructor(params: ITransactionDTO) {
    this.accountId = params.accountId;
    this.date = params.date;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.creditCardId = params.creditCardId;
    this.invoiceMonth = params.invoiceMonth;
    this.categoryName = params.categoryName;
    this.accountName = params.accountName;
    this.description = params.description;
    this.id = params.id;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.excludeFromTotals = params.excludeFromTotals ?? false;
    this.systemKey = params.systemKey;
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
      creditCardId: entity.creditCardId,
      date: entity.date,
      description: entity.description,
      excludeFromTotals: entity.excludeFromTotals,
      id: entity.id,
      invoiceMonth: entity.invoiceMonth,
      owner: entity.owner,
      ownerId: entity.ownerId,
      systemKey: entity.systemKey,
      type: entity.type,
      value: entity.value,
    });
  }
}

export default TransactionDTO;
