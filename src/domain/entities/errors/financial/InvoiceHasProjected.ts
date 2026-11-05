import BusinessError from "@domain/entities/errors/common/BusinessError";

// A projected purchase that blocks paying its invoice (spec 096 FR 10).
export interface ProjectedPurchaseRef {
  date: string;
  description: string;
  id: string;
  recurrenceId?: string;
  // Integer cents.
  value: number;
}

// The API answers 409 with the list while the invoice still has projected purchases.
class InvoiceHasProjected extends BusinessError {
  projected: ProjectedPurchaseRef[];

  constructor(projected: ProjectedPurchaseRef[]) {
    super();
    this.name = "InvoiceHasProjected";
    this.projected = projected;
  }
}

export default InvoiceHasProjected;
