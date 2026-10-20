import BusinessError from "@domain/entities/errors/common/BusinessError";

export interface PendingInstallmentPlan {
  categoryId: string;
  description: string;
  id: string;
  lastInvoiceMonth: string;
  remainingInstallments: number;
}

export interface PendingRecurrence {
  categoryId: string;
  description: string;
  id: string;
  nextOccurrenceDate: null | string;
}

// The API answers 409 when a category (or a subcategory) is still used by a recurrence or a running plan.
class CategoryHasPendingItems extends BusinessError {
  hiddenCount: number;
  installmentPlans: PendingInstallmentPlan[];
  recurrences: PendingRecurrence[];

  constructor(params: {
    hiddenCount?: number;
    installmentPlans?: PendingInstallmentPlan[];
    recurrences?: PendingRecurrence[];
  }) {
    super();
    this.name = "CategoryHasPendingItems";
    this.hiddenCount = params.hiddenCount ?? 0;
    this.installmentPlans = params.installmentPlans ?? [];
    this.recurrences = params.recurrences ?? [];
  }
}

export default CategoryHasPendingItems;
