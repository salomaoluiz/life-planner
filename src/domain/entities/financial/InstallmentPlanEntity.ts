import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface InstallmentEntity {
  id: string;
  installmentNumber: number;
  // `YYYY-MM`
  invoiceMonth: string;
  invoiceStatus: InstallmentInvoiceStatus;
  // Moved by the plan's prepayment (spec 032).
  prepaid?: boolean;
  // Decimal string, like transactions.
  value: string;
}

export type InstallmentInvoiceStatus = "CLOSED" | "OPEN" | "PAID";

// Which rows an installment edit reaches (spec 030 FR 11); "All" goes through the plan.
export type InstallmentScope = "ONLY_THIS" | "THIS_AND_NEXT";

export interface PrepaymentEntity {
  // `YYYY-MM-DD`
  date: string;
  // Cents; 0 when the user got no discount.
  discount: number;
  id: string;
  // `YYYY-MM`
  targetInvoiceMonth: string;
}

interface IInstallmentPlanEntity {
  categoryId: string;
  creditCardId: string;
  currency?: CurrencyCode;
  date: string;
  description: string;
  id: string;
  installmentCount: number;
  installments: InstallmentEntity[];
  notes?: string;
  overLimit?: boolean;
  owner: OwnerType;
  ownerId: string;
  prepayment?: PrepaymentEntity;
  totalValue: string;
}

class InstallmentPlanEntity {
  categoryId: string;
  creditCardId: string;
  currency: CurrencyCode;
  date: string;
  description: string;
  id: string;
  installmentCount: number;
  installments: InstallmentEntity[];
  notes?: string;
  overLimit?: boolean;
  owner: OwnerType;
  ownerId: string;
  prepayment?: PrepaymentEntity;
  // The SUM of the current installment values.
  totalValue: string;

  constructor(params: IInstallmentPlanEntity) {
    this.categoryId = params.categoryId;
    this.creditCardId = params.creditCardId;
    this.currency = params.currency ?? DEFAULT_CURRENCY;
    this.date = params.date;
    this.description = params.description;
    this.notes = params.notes;
    this.id = params.id;
    this.installmentCount = params.installmentCount;
    this.installments = params.installments;
    this.overLimit = params.overLimit;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.prepayment = params.prepayment;
    this.totalValue = params.totalValue;
  }
}

export default InstallmentPlanEntity;
