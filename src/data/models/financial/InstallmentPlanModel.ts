import { calendarDateToIso } from "./calendarDate";
import { centsToDecimalString } from "./money";
import { OwnerType } from "./TransactionModel";

export type InstallmentInvoiceStatus = "CLOSED" | "OPEN" | "PAID";

export interface InstallmentModel {
  id: string;
  installmentNumber: number;
  invoiceMonth: string;
  invoiceStatus: InstallmentInvoiceStatus;
  value: string;
}

// API shape of `POST|GET|PATCH /v1/finance/installment-plans`: money in cents there, decimal strings here.
class InstallmentPlanModel {
  categoryId: string;
  creditCardId: string;
  date: string;
  description: string;
  id: string;
  installmentCount: number;
  installments: InstallmentModel[];
  overLimit?: boolean;
  owner: OwnerType;
  ownerId: string;
  totalValue: string;

  constructor(params: {
    categoryId: string;
    creditCardId: string;
    date: string;
    description: string;
    id: string;
    installmentCount: number;
    installments: InstallmentModel[];
    overLimit?: boolean;
    owner: OwnerType;
    ownerId: string;
    totalValue: string;
  }) {
    this.categoryId = params.categoryId;
    this.creditCardId = params.creditCardId;
    this.date = params.date;
    this.description = params.description;
    this.id = params.id;
    this.installmentCount = params.installmentCount;
    this.installments = params.installments;
    this.overLimit = params.overLimit;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.totalValue = params.totalValue;
  }

  static fromJSON(data: Record<string, unknown>): InstallmentPlanModel {
    const plan = data.plan as Record<string, unknown>;
    const installments = (data.installments ?? []) as Record<string, unknown>[];

    return new InstallmentPlanModel({
      categoryId: plan.categoryId as string,
      creditCardId: plan.creditCardId as string,
      date: calendarDateToIso(plan.date as string),
      description: plan.description as string,
      id: plan.id as string,
      installmentCount: Number(plan.installmentCount),
      installments: installments.map((row) => ({
        id: row.id as string,
        installmentNumber: Number(row.installmentNumber),
        invoiceMonth: row.invoiceMonth as string,
        invoiceStatus: row.invoiceStatus as InstallmentInvoiceStatus,
        value: centsToDecimalString(Number(row.value)),
      })),
      overLimit: (data.overLimit as boolean | undefined) ?? undefined,
      owner: plan.owner as OwnerType,
      ownerId: plan.ownerId as string,
      totalValue: centsToDecimalString(Number(plan.totalValue)),
    });
  }
}

export default InstallmentPlanModel;
