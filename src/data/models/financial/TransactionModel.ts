import { calendarDateToIso, isoToCalendarDate } from "./calendarDate";
import { centsToDecimalString, decimalStringToCents } from "./money";

export type OwnerType = "FAMILY" | "USER";

export type TransactionType = "EXPENSE" | "INCOME";

interface ITransactionModel {
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

class TransactionModel implements ITransactionModel {
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

  constructor(params: ITransactionModel) {
    this.accountId = params.accountId;
    this.date = params.date;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.creditCardId = params.creditCardId;
    this.installmentCount = params.installmentCount;
    this.installmentNumber = params.installmentNumber;
    this.installmentPlanId = params.installmentPlanId;
    this.invoiceMonth = params.invoiceMonth;
    this.description = params.description;
    this.owner = params.owner;
    this.id = params.id;
    this.ownerId = params.ownerId;
    this.excludeFromTotals = params.excludeFromTotals ?? false;
    this.systemKey = params.systemKey;
    this.type = params.type;
    this.value = params.value;
  }

  static fromJSON(data: Record<string, unknown>): TransactionModel {
    const category = data.category as
      | undefined
      | {
          excludeFromTotals?: boolean;
          name?: string;
          systemKey?: null | string;
        };

    return new TransactionModel({
      accountId: (data.accountId as null | string) ?? undefined,
      category: category?.name ?? "",
      categoryId: data.categoryId as string,
      creditCardId: (data.creditCardId as null | string) ?? undefined,
      date: calendarDateToIso(data.date as string),
      description: data.description as string,
      excludeFromTotals: category?.excludeFromTotals === true,
      id: data.id as string,
      installmentCount: (data.installmentCount as null | number) ?? undefined,
      installmentNumber: (data.installmentNumber as null | number) ?? undefined,
      installmentPlanId: (data.installmentPlanId as null | string) ?? undefined,
      invoiceMonth: (data.invoiceMonth as null | string) ?? undefined,
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      systemKey: category?.systemKey ?? undefined,
      type: data.type as TransactionType,
      value: centsToDecimalString(Number(data.value)),
    });
  }

  // Same shape as the API: also what the repository cache stores.
  toJSON() {
    return {
      accountId: this.accountId ?? null,
      category: {
        excludeFromTotals: this.excludeFromTotals,
        name: this.category,
        systemKey: this.systemKey ?? null,
      },
      categoryId: this.categoryId,
      creditCardId: this.creditCardId ?? null,
      date: isoToCalendarDate(this.date),
      description: this.description,
      id: this.id,
      installmentCount: this.installmentCount ?? null,
      installmentNumber: this.installmentNumber ?? null,
      installmentPlanId: this.installmentPlanId ?? null,
      invoiceMonth: this.invoiceMonth ?? null,
      owner: this.owner,
      ownerId: this.ownerId,
      type: this.type,
      value: decimalStringToCents(this.value),
    };
  }
}

export default TransactionModel;
