import { OwnerType } from "@domain/entities/user/OwnerEntity";

export enum TransactionType {
  EXPENSE = "EXPENSE",
  INCOME = "INCOME",
}

// Key of the system category that marks a balance adjustment (spec 028).
export const BALANCE_ADJUSTMENT = "BALANCE_ADJUSTMENT";

interface ITransactionEntity {
  accountId?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  date: string;
  description: string;
  excludeFromTotals?: boolean;
  id: string;
  installmentCount?: number;
  installmentNumber?: number;
  installmentPlanId?: string;
  invoiceMonth?: string;
  owner: OwnerType;
  ownerId: string;
  systemKey?: string;
  type: TransactionType;
  value: string;
}

class TransactionEntity {
  accountId?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  date: string;
  description: string;
  excludeFromTotals: boolean;
  id: string;
  installmentCount?: number;
  installmentNumber?: number;
  installmentPlanId?: string;
  invoiceMonth?: string;
  owner: OwnerType;
  ownerId: string;
  systemKey?: string;
  type: TransactionType;
  value: string;

  constructor(params: ITransactionEntity) {
    this.accountId = params.accountId;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.creditCardId = params.creditCardId;
    this.installmentCount = params.installmentCount;
    this.installmentNumber = params.installmentNumber;
    this.installmentPlanId = params.installmentPlanId;
    this.invoiceMonth = params.invoiceMonth;
    this.date = params.date;
    this.id = params.id;
    this.owner = params.owner;
    this.description = params.description;
    this.ownerId = params.ownerId;
    this.excludeFromTotals = params.excludeFromTotals ?? false;
    this.systemKey = params.systemKey;
    this.type = params.type;
    this.value = params.value;
  }
}

export default TransactionEntity;
