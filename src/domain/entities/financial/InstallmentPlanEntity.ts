import { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface InstallmentEntity {
  id: string;
  installmentNumber: number;
  // `YYYY-MM`
  invoiceMonth: string;
  invoiceStatus: InstallmentInvoiceStatus;
  // Decimal string, like transactions.
  value: string;
}

export type InstallmentInvoiceStatus = "CLOSED" | "OPEN" | "PAID";

// Which rows an installment edit reaches (spec 030 FR 11); "All" goes through the plan.
export type InstallmentScope = "ONLY_THIS" | "THIS_AND_NEXT";

interface IInstallmentPlanEntity {
  categoryId: string;
  creditCardId: string;
  date: string;
  description: string;
  id: string;
  installmentCount: number;
  installments: InstallmentEntity[];
  overLimit?: boolean;
  owner: OwnerType;
  ownerId: string;
  totalValue: string;
}

class InstallmentPlanEntity {
  categoryId: string;
  creditCardId: string;
  date: string;
  description: string;
  id: string;
  installmentCount: number;
  installments: InstallmentEntity[];
  overLimit?: boolean;
  owner: OwnerType;
  ownerId: string;
  // The SUM of the current installment values.
  totalValue: string;

  constructor(params: IInstallmentPlanEntity) {
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
}

export default InstallmentPlanEntity;
