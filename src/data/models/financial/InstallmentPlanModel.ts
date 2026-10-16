import { calendarDateToIso } from "./calendarDate";
import { centsToDecimalString } from "./money";
import { OwnerType } from "./TransactionModel";

export type InstallmentInvoiceStatus = "CLOSED" | "OPEN" | "PAID";

export interface InstallmentModel {
  id: string;
  installmentNumber: number;
  invoiceMonth: string;
  invoiceStatus: InstallmentInvoiceStatus;
  prepaid: boolean;
  value: string;
}

export interface PrepaymentModel {
  date: string;
  discount: number;
  id: string;
  targetInvoiceMonth: string;
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
  prepayment?: PrepaymentModel;
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
    prepayment?: PrepaymentModel;
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
    this.prepayment = params.prepayment;
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
        prepaid: Boolean(row.prepaid),
        value: centsToDecimalString(Number(row.value)),
      })),
      overLimit: (data.overLimit as boolean | undefined) ?? undefined,
      owner: plan.owner as OwnerType,
      ownerId: plan.ownerId as string,
      prepayment: toPrepayment(
        plan.prepayment as null | Record<string, unknown>,
      ),
      totalValue: centsToDecimalString(Number(plan.totalValue)),
    });
  }
}

function toPrepayment(
  raw: null | Record<string, unknown> | undefined,
): PrepaymentModel | undefined {
  return raw
    ? {
        date: raw.date as string,
        discount: Number(raw.discount),
        id: raw.id as string,
        targetInvoiceMonth: raw.targetInvoiceMonth as string,
      }
    : undefined;
}

export default InstallmentPlanModel;
