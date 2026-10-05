import { calendarDateToIso, isoToCalendarDate } from "./calendarDate";
import { centsToDecimalString, decimalStringToCents } from "./money";

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
    const category = data.category as undefined | { name?: string };

    return new TransactionModel({
      accountId: data.accountId as string,
      category: category?.name ?? "",
      categoryId: data.categoryId as string,
      date: calendarDateToIso(data.date as string),
      description: data.description as string,
      id: data.id as string,
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      type: data.type as TransactionType,
      value: centsToDecimalString(Number(data.value)),
    });
  }

  // Same shape as the API: also what the repository cache stores.
  toJSON() {
    return {
      accountId: this.accountId,
      category: { name: this.category },
      categoryId: this.categoryId,
      date: isoToCalendarDate(this.date),
      description: this.description,
      id: this.id,
      owner: this.owner,
      ownerId: this.ownerId,
      type: this.type,
      value: decimalStringToCents(this.value),
    };
  }
}

export default TransactionModel;
